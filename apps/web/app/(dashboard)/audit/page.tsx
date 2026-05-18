'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Input } from '@procura/ui';
import { Shield, Clock, User, FileText, Search, Loader2 } from 'lucide-react';

const actionColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  created: 'success',
  updated: 'warning',
  deleted: 'destructive',
  approved: 'success',
  rejected: 'destructive',
  uploaded: 'default',
  synced: 'secondary',
  exported: 'default',
};

export default function AuditLogPage() {
  const { user } = useUser();
  const orgId = user?.organizationMemberships?.[0]?.id || null;
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', orgId],
    queryFn: () => api.get('/audit', { organizationId: orgId || '', limit: 100 }),
    enabled: !!orgId,
  });

  const logs: any[] = Array.isArray(data?.data) ? data.data : [];

  const filtered = logs.filter((log: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return log.action?.toLowerCase().includes(q)
      || log.entityType?.toLowerCase().includes(q)
      || log.entityId?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">Track all changes and actions across your organization.</p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search audit log..." className="h-9 rounded-lg border-slate-200 pl-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>Every action is recorded for compliance and visibility.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Shield className="mb-2 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{search ? 'No matching events found.' : 'No audit events recorded yet.'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                  <div className="mt-0.5">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={actionColors[log.action] || 'outline'} className="text-[10px] uppercase">
                        {log.action}
                      </Badge>
                      <span className="font-medium">{log.entityType}</span>
                      {log.entityId && (
                        <code className="rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">
                          {log.entityId.slice(0, 8)}...
                        </code>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {log.userId?.slice(0, 8)}...
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
