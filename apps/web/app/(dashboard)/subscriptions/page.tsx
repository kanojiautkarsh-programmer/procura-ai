'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { Card, CardContent, Button, Badge, Input } from '@procura/ui';
import { cn } from '@procura/ui';
import { CreditCard, Search, Plus, MoreHorizontal, TrendingUp, Users, Loader2 } from 'lucide-react';

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  trial: 'bg-blue-50 text-blue-700',
  expired: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
  pending: 'bg-slate-50 text-slate-600',
};

const periodLabels: Record<string, string> = { monthly: '/mo', quarterly: '/qtr', semi_annual: '/6mo', annual: '/yr', one_time: '' };

const Sparkline = ({ data }: { data: number[] }) => {
  if (!data?.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 60; const h = 24;
  const px = (i: number) => (i / (data.length - 1)) * w;
  const py = (v: number) => h - ((v - min) / range) * h;
  const d = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(v)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <path d={d} fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function SubscriptionsPage() {
  const { user } = useUser();
  const orgId = user?.organizationMemberships?.[0]?.id || null;
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions', orgId],
    queryFn: () => api.get('/subscriptions', { organizationId: orgId || '', limit: 50 }),
    enabled: !!orgId,
  });

  const subscriptions = Array.isArray(data?.data) ? data.data : [];

  const filtered = subscriptions.filter(
    (s: any) => s.name.toLowerCase().includes(search.toLowerCase()) || s.vendor?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const activeTotal = subscriptions.filter((s: any) => s.status === 'active').reduce((a: number, s: any) => a + s.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Subscriptions</h1>
          <p className="mt-0.5 text-sm text-slate-500">{subscriptions.length} subscriptions · ${activeTotal.toLocaleString()}/mo</p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-3.5 w-3.5" /> Add Subscription
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search subscriptions..." className="h-9 rounded-lg border-slate-200 pl-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((sub: any) => (
            <div key={sub.id} className="card-hover rounded-xl border border-slate-200 bg-white p-5 transition-all duration-150">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                    {sub.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{sub.name}</p>
                    <p className="text-xs text-slate-400">{sub.vendor?.name}</p>
                  </div>
                </div>
                <Badge className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize', statusStyles[sub.status])}>
                  {sub.status}
                </Badge>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-bold text-slate-900">${sub.amount.toLocaleString()}</span>
                    <span className="text-xs text-slate-400">{periodLabels[sub.billingPeriod]}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {sub.licenseCount} seats</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-400">
                  {sub.renewalDate ? `Renews ${new Date(sub.renewalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'No renewal date'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
