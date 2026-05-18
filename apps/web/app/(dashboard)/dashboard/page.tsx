'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@procura/ui';
import { cn } from '@procura/ui';
import {
  DollarSign, CreditCard, CheckSquare, Bell, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Receipt, Building2, Sparkles, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { SpendOverview } from './_components/spend-overview';
import { UpcomingRenewals } from './_components/upcoming-renewals';

const SpendChart = ({ data }: { data: { date: string; amount: number }[] }) => {
  if (data.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-slate-400">No spend data yet</div>;
  }
  const values = data.map((d) => d.amount);
  const max = Math.max(...values);
  const w = 400; const h = 120;
  const px = (i: number) => (i / (values.length - 1)) * w;
  const py = (v: number) => h - (v / max) * h;
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(v)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={`${d}L${w},${h}L0,${h}Z`} fill="url(#grad)" />
      <path d={d} fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function DashboardPage() {
  const { user } = useUser();
  const orgId = user?.organizationMemberships?.[0]?.id || null;

  const { data: summary } = useQuery({
    queryKey: ['spend-summary', orgId],
    queryFn: () => api.get('/spend/summary', { organizationId: orgId || '' }),
    enabled: !!orgId,
  });

  const { data: trends } = useQuery({
    queryKey: ['spend-trends', orgId],
    queryFn: () => api.get('/spend/trends', { organizationId: orgId || '' }),
    enabled: !!orgId,
  });

  const { data: approvals } = useQuery({
    queryKey: ['approvals-count', orgId],
    queryFn: () => api.get('/approvals', { organizationId: orgId || '', status: 'pending', limit: 1 }),
    enabled: !!orgId,
  });

  const { data: auditLog } = useQuery({
    queryKey: ['audit-feed', orgId],
    queryFn: () => api.get('/audit', { organizationId: orgId || '', limit: 5 }),
    enabled: !!orgId,
  });

  const activityItems: { action: string; entity: string; time: string; type: string }[] = 
    Array.isArray(auditLog?.data) 
      ? auditLog.data.map((entry: any) => ({
          action: `${entry.action} ${entry.entityType}`,
          entity: entry.entityId?.slice(0, 8) || '',
          time: entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '',
          type: entry.action,
        }))
      : [];

  const activityColor: Record<string, string> = {
    created: 'text-emerald-600 bg-emerald-50',
    updated: 'text-blue-600 bg-blue-50',
    deleted: 'text-red-600 bg-red-50',
    approved: 'text-emerald-600 bg-emerald-50',
    rejected: 'text-red-600 bg-red-50',
  };

  const monthlySpend = summary?.totalSpend || 0;
  const activeSubs = summary?.activeSubscriptions || 0;
  const pendingApprovals = approvals?.total || 0;
  const overdueInvoices = summary?.overdueInvoices || 0;

  const METRICS = [
    {
      title: 'Total Spend',
      value: `$${monthlySpend.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Active Subscriptions',
      value: activeSubs.toString(),
      change: '+2',
      trend: 'up',
      icon: CreditCard,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals.toString(),
      change: pendingApprovals > 5 ? '-3' : '0',
      trend: pendingApprovals > 5 ? 'down' : 'up',
      icon: CheckSquare,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Overdue Invoices',
      value: overdueInvoices.toString(),
      change: '+1',
      trend: 'up',
      icon: Bell,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  const spendData = Array.isArray(trends) ? (trends as any[]).map((t: any) => ({
    date: t.issueDate || t.date,
    amount: t.amount || 0,
  })) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Organization spending and procurement activity overview.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="card-hover rounded-xl border border-slate-200 bg-white p-5 transition-shadow duration-150"
            >
              <div className="flex items-start justify-between">
                <div className={cn('rounded-lg p-2.5', metric.bg)}>
                  <Icon className={cn('h-5 w-5', metric.color)} />
                </div>
                <span className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
                  metric.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
                )}>
                  {metric.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {metric.change}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-[28px] font-bold tracking-tight text-slate-900">{metric.value}</div>
                <div className="mt-0.5 text-xs font-medium text-slate-500">{metric.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 rounded-xl border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Spend Trend</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">Monthly spend over time</p>
            </div>
            <Badge variant="outline" className="text-[11px]">{spendData.length > 0 ? `${spendData.length} months` : 'No data'}</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              {spendData.length > 0 ? <SpendChart data={spendData} /> : (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-xl border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {activityItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No activity yet</p>
            ) : (
              activityItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50">
                  <div className={cn('mt-0.5 rounded-md p-1', activityColor[item.type] || 'bg-slate-100')}>
                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">{item.action}</p>
                    <p className="text-xs text-slate-400">{item.entity} · {item.time}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingRenewals organizationId={orgId} />
        <div>
          <h2 className="mb-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/invoices">
              <Button variant="outline" size="sm" className="gap-2 rounded-lg border-slate-200 text-slate-600">
                <Receipt className="h-3.5 w-3.5" /> Upload Invoice
              </Button>
            </Link>
            <Link href="/vendors">
              <Button variant="outline" size="sm" className="gap-2 rounded-lg border-slate-200 text-slate-600">
                <Building2 className="h-3.5 w-3.5" /> Add Vendor
              </Button>
            </Link>
            <Link href="/approvals">
              <Button variant="outline" size="sm" className="gap-2 rounded-lg border-slate-200 text-slate-600">
                <CheckSquare className="h-3.5 w-3.5" /> View Approvals
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" size="sm" className="gap-2 rounded-lg border-slate-200 text-slate-600">
                <Sparkles className="h-3.5 w-3.5" /> Run Report
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
