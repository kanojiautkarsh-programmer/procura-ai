'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@procura/ui';
import { Plus, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { NewApprovalDialog } from './_components/new-approval-dialog';

const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
  escalated: 'default',
};

const statusIcon: Record<string, typeof Clock> = {
  pending: Clock,
  approved: Check,
  rejected: X,
  escalated: AlertTriangle,
};

export default function ApprovalsPage() {
  const [newOpen, setNewOpen] = useState(false);
  const [tab, setTab] = useState('pending');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['approvals', tab],
    queryFn: () => api.get<any>('/approvals', { organizationId: 'org_demo', status: tab === 'all' ? undefined : tab, limit: 50 }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/approvals/${id}/action`, { status: 'approved' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approvals'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/approvals/${id}/action`, { status: 'rejected' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approvals'] }),
  });

  const requests = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
          <p className="text-muted-foreground">Review and manage procurement approval requests.</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Check className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-1 text-lg font-medium">No {tab} requests</h3>
              <p className="text-sm text-muted-foreground">
                {tab === 'pending' ? 'No pending approvals. Everything is up to date.' : 'No requests in this category.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req: any) => {
                const StatusIcon = statusIcon[req.status] || Clock;
                return (
                  <div key={req.id} className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{req.title}</h4>
                          <Badge variant={statusVariant[req.status]} className="capitalize">
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {req.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {req.level.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>${req.amount.toLocaleString()}</span>
                          {req.department && <span>{req.department}</span>}
                          {req.vendor?.name && <span>{req.vendor.name}</span>}
                          <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                        {req.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{req.description}</p>
                        )}
                      </div>

                      {req.status === 'pending' && (
                        <div className="ml-4 flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => rejectMutation.mutate(req.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => approveMutation.mutate(req.id)}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Approve
                          </Button>
                        </div>
                      )}
                      {req.approvedByName && (
                        <div className="ml-4 text-right text-xs text-muted-foreground">
                          <p>by {req.approvedByName}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <NewApprovalDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}
