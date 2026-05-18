'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  Separator,
} from '@procura/ui';
import { api } from '@/lib/api';
import { Loader2, ExternalLink, FileText } from 'lucide-react';

interface InvoiceDetailDialogProps {
  invoiceId: string | null;
  onClose: () => void;
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
  flagged: 'Flagged',
};

export function InvoiceDetailDialog({ invoiceId, onClose }: InvoiceDetailDialogProps) {
  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => api.get<any>(`/invoices/${invoiceId}`),
    enabled: !!invoiceId,
  });

  return (
    <Dialog open={!!invoiceId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : invoice ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>
                  {invoice.invoiceNumber || `Invoice ${invoice.id.slice(0, 8)}`}
                </DialogTitle>
                <Badge variant={
                  invoice.status === 'paid' ? 'success' :
                  invoice.status === 'overdue' ? 'destructive' :
                  invoice.status === 'pending' ? 'warning' :
                  'secondary'
                }>
                  {statusLabels[invoice.status] || invoice.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Vendor</p>
                  <p className="font-medium">{invoice.vendor?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium capitalize">{invoice.category || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Issue Date</p>
                  <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                {invoice.paidDate && (
                  <div>
                    <p className="text-muted-foreground">Paid Date</p>
                    <p className="font-medium">{new Date(invoice.paidDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Amount</p>
                <p className="text-3xl font-bold">${invoice.amount.toLocaleString()}</p>
                {invoice.taxAmount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    +${invoice.taxAmount.toLocaleString()} tax
                  </p>
                )}
              </div>

              {invoice.description && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <p className="text-muted-foreground">Description</p>
                    <p>{invoice.description}</p>
                  </div>
                </>
              )}

              {invoice.ocrConfidence && (
                <div className="text-sm">
                  <p className="text-muted-foreground">AI Extraction Confidence</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${invoice.ocrConfidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{invoice.ocrConfidence}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              {invoice.fileUrl && (
                <Button variant="outline" asChild>
                  <a href={invoice.fileUrl} target="_blank" rel="noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    View Document
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </>
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Invoice not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
