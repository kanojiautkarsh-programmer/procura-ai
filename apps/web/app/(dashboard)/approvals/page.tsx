'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { Button, Badge } from '@procura/ui';
import { cn } from '@procura/ui';
import { Check, X, Clock, AlertTriangle, Plus, User, DollarSign, CheckSquare, Loader2 } from 'lucide-react';
import { NewApprovalDialog } from './_components/new-approval-dialog';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  escalated: 'bg-purple-50 text-purple-700 ring-purple-600/20',
};

export default function ApprovalsPage() {
  const { user } = useUser();
  const orgId = user?.organizationMemberships?.[0]?.id || null;
  const userId = user?.id;
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['approvals', orgId],
    queryFn: () => api.get('/approvals', { organizationId: orgId || '', limit: 50 }),
    enabled: !!orgId,
  });

  const approvalsList: any[] = Array.isArray(data?.data) ? data.data : [];
  const pending = approvalsList.filter((a: any) => a.status === 'pending');
  const history = approvalsList.filter((a: any) => a.status !== 'pending');

  const actionMutation = useMutation({
    mutationFn: ({ id, action, notes }: { id: string; action: string; notes?: string }) =>
      api.patch(`/approvals/${id}/action`, { action, notes, organizationId: orgId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['spend-summary'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Approvals</h1>
          <p className="mt-0.5 text-sm text-slate-500">{pending.length} requests awaiting your decision.</p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New Request
        </Button>
      </div>

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        <button onClick={() => setTab('pending')} className={cn('rounded-md px-4 py-1.5 text-sm font-medium transition-colors', tab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
          Pending <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">{pending.length}</span>
        </button>
        <button onClick={() => setTab('history')} className={cn('rounded-md px-4 py-1.5 text-sm font-medium transition-colors', tab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
          History
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
      ) : (
        <div className="space-y-3">
          {(tab === 'pending' ? pending : history).map((req: any) => (
            <div key={req.id} className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{req.title}</span>
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ring-1 ring-inset', statusStyles[req.status] || 'bg-slate-50 text-slate-600')}>
                      {req.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {req.requester?.name || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> ${req.amount.toLocaleString()}
                    </span>
                    {req.department && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{req.department}</span>}
                    <span className="text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {req.status === 'pending' && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      className="h-8 gap-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => actionMutation.mutate({ id: req.id, action: 'approved', notes: '' })}
                      disabled={actionMutation.isPending}
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 rounded-lg border-slate-200 text-red-600 hover:bg-red-50"
                      onClick={() => actionMutation.mutate({ id: req.id, action: 'rejected', notes: '' })}
                      disabled={actionMutation.isPending}
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {(tab === 'pending' ? pending : history).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckSquare className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-500">No {tab === 'pending' ? 'pending' : ''} approvals.</p>
            </div>
          )}
        </div>
      )}

      <NewApprovalDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
