'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@procura/ui';
import { Badge } from '@procura/ui';
import { Plus, Upload, Download, Eye } from 'lucide-react';
import { UploadInvoiceDialog } from './_components/upload-invoice-dialog';
import { InvoiceDetailDialog } from './_components/invoice-detail-dialog';

const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pending: 'warning',
  approved: 'success',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'outline',
  flagged: 'destructive',
};

export default function InvoicesPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.get<any>('/invoices', { organizationId: 'org_demo', limit: 50 }),
  });

  const invoices = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Track, upload, and manage all incoming invoices.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Upload className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-1 text-lg font-medium">No invoices yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Upload your first invoice or connect your email to auto-import.
              </p>
              <Button onClick={() => setUploadOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Invoice
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Invoice</th>
                    <th className="pb-3 pr-4 font-medium">Vendor</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Due Date</th>
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 pr-4">
                        <div>
                          <p className="font-medium">{inv.invoiceNumber || `INV-${inv.id.slice(0, 8)}`}</p>
                          <p className="text-xs text-muted-foreground">{new Date(inv.issueDate).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4">{inv.vendor?.name || 'Unknown'}</td>
                      <td className="py-3 pr-4 font-medium">
                        ${inv.amount.toLocaleString()}
                        {inv.taxAmount > 0 && (
                          <span className="ml-1 text-xs text-muted-foreground">+${inv.taxAmount} tax</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusVariant[inv.status] ?? 'secondary'}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={inv.status === 'overdue' ? 'text-destructive font-medium' : ''}>
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {inv.category || '—'}
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setDetailId(inv.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <UploadInvoiceDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <InvoiceDetailDialog
        invoiceId={detailId}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}
