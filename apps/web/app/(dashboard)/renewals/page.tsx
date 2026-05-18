'use client';

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { Button, Badge } from '@procura/ui';
import { cn } from '@procura/ui';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const urgencyBadge = (days: number) => {
  if (days <= 14) return { label: `${days}d`, color: 'bg-red-50 text-red-700 ring-red-600/20' };
  if (days <= 30) return { label: `${days}d`, color: 'bg-amber-50 text-amber-700 ring-amber-600/20' };
  return { label: `${days}d`, color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' };
};

export default function RenewalsPage() {
  const { user } = useUser();
  const orgId = user?.organizationMemberships?.[0]?.id || null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedMonth, setSelectedMonth] = useState('');

  const { data: renewalsData, isLoading } = useQuery({
    queryKey: ['renewals', orgId],
    queryFn: () => api.get('/renewals', { organizationId: orgId || '', days: 180 }),
    enabled: !!orgId,
  });

  const { data: calendarData } = useQuery({
    queryKey: ['renewals-calendar', orgId],
    queryFn: () => api.get('/renewals/calendar', { organizationId: orgId || '' }),
    enabled: !!orgId,
  });

  const items: any[] = [
    ...(renewalsData?.subscriptions || []),
    ...(renewalsData?.contracts || []),
  ].map((item: any) => {
    const date = item.renewalDate || item.endDate;
    const daysUntil = date ? Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 999;
    return { ...item, daysUntil, date: date ? new Date(date) : null };
  });

  const calendarEvents: any[] = Array.isArray(calendarData) ? calendarData : [];

  const months = Array.from(new Set(
    calendarEvents.map((e: any) => {
      const d = new Date(e.date);
      return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    }),
  )).slice(0, 6);

  const getMonthCount = (monthLabel: string) =>
    calendarEvents.filter((e: any) => {
      const d = new Date(e.date);
      return d.toLocaleString('en-US', { month: 'short', year: 'numeric' }) === monthLabel;
    }).length;

  const grouped = selectedMonth
    ? items.filter((r: any) => {
        if (!r.date) return false;
        return r.date.toLocaleString('en-US', { month: 'short', year: 'numeric' }) === selectedMonth;
      })
    : items;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Renewals</h1>
        <p className="mt-0.5 text-sm text-slate-500">{items.length} renewals in the next 6 months.</p>
      </div>

      <div className="relative">
        <button onClick={() => scrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' })} className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-1.5 shadow-md border border-slate-200">
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        </button>
        <div ref={scrollRef} className="flex gap-2 overflow-x-auto px-6 scrollbar-thin">
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m === selectedMonth ? '' : m)}
              className={cn(
                'flex h-20 w-24 shrink-0 flex-col items-center justify-center rounded-xl border text-sm font-medium transition-all',
                selectedMonth === m
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:shadow-sm',
              )}
            >
              <span className="text-[11px] uppercase tracking-wider">{m.split(' ')[0]}</span>
              <span className="mt-0.5 text-lg font-bold">{getMonthCount(m)}</span>
            </button>
          ))}
        </div>
        <button onClick={() => scrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' })} className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-1.5 shadow-md border border-slate-200">
          <ChevronRight className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
      ) : (
        <div className="space-y-3">
          {grouped.map((item: any) => {
            const urgency = urgencyBadge(item.daysUntil);
            return (
              <div key={item.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                  {(item.title || item.name)?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{item.title || item.name}</p>
                  <p className="text-xs text-slate-400">{item.vendor?.name || item.vendor}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    ${(item.amount || 0).toLocaleString()}
                    {item.billingPeriod && <span className="text-xs font-normal text-slate-400">/{item.billingPeriod === 'annual' ? 'yr' : 'mo'}</span>}
                    {item.type === 'contract' && item.value && <span className="text-xs font-normal text-slate-400"> total</span>}
                  </p>
                  <p className="text-xs text-slate-400">
                    {item.date ? `${item.type === 'contract' ? 'Expires' : 'Renews'} ${item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                  </p>
                </div>
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', urgency.color)}>
                  {urgency.label}
                </span>
              </div>
            );
          })}
          {grouped.length === 0 && (
            <div className="flex justify-center py-12 text-sm text-slate-400">No renewals found</div>
          )}
        </div>
      )}
    </div>
  );
}
