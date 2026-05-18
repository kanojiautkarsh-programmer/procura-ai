'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '@procura/ui';
import { cn } from '@procura/ui';
import { Upload, Download, Eye, Search, Loader2 } from 'lucide-react';
import { UploadInvoiceDialog } from './_components/upload-invoice-dialog';
import { InvoiceDetailDialog } from './_components/invoice-detail-dialog';

const statusStyles: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  approved: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  overdue: 'bg-red-50 text-red-700 ring-red-600/20',
  cancelled: 'bg-slate-50 text-slate-500 ring-slate-500/20',
  flagged: 'bg-red-50 text-red-700 ring-red-600/20',
};

export default function InvoicesPage() {
  const { user } = useUser();
  const orgId = user?.organizationMemberships?.[0]?.id || null;
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', orgId, statusFilter],
    queryFn: () => api.get('/invoices', { organizationId: orgId || '', limit: 50, status: statusFilter || undefined }),
    enabled: !!orgId,
  });

  const invoices: any[] = Array.isArray(data?.data) ? data.data : [];

  const filtered = invoices.filter((inv: any) => {
    if (search && !inv.vendor?.name?.toLowerCase().includes(search.toLowerCase()) && !inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statuses = ['paid', 'pending', 'approved', 'overdue', 'cancelled', 'flagged'];
  const counts = Object.fromEntries(statuses.map((s) => [s, invoices.filter((i: any) => i.status === s).length]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Invoices</h1>
          <p className="mt-0.5 text-sm text-slate-500">Track, upload, and manage incoming invoices.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-slate-200 text-slate-600">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="gap-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={() => setUploadOpen(true)}>
            <Upload className="h-3.5 w-3.5" /> Upload Invoice
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search invoices..."
            className="h-9 rounded-lg border-slate-200 pl-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter(null)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
              !statusFilter ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            All <span className="ml-1 opacity-60">{invoices.length}</span>
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s === statusFilter ? null : s)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap',
                statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              {s} <span className="ml-1 opacity-60">{counts[s] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <Card className="rounded-xl border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Invoice</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Vendor</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Due Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-300" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">No invoices match your filters.</td>
                </tr>
              ) : (
                filtered.map((inv: any) => (
                  <tr
                    key={inv.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50 cursor-pointer last:border-0"
                    onClick={() => setDetailId(inv.id)}
                  >
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-slate-900">{inv.invoiceNumber || '—'}</p>
                        <p className="text-xs text-slate-400">{new Date(inv.issueDate).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{inv.vendor?.name || 'Unknown'}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-900">
                      ${inv.amount.toLocaleString()}
                      {inv.taxAmount > 0 && <span className="ml-1 text-xs text-slate-400">+${inv.taxAmount}</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', statusStyles[inv.status] || 'bg-slate-50 text-slate-600')}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn(inv.status === 'overdue' ? 'font-medium text-red-600' : 'text-slate-600')}>
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{inv.category || '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <UploadInvoiceDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <InvoiceDetailDialog invoiceId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
