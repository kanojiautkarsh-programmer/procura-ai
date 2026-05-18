import { auth } from '@clerk/nextjs/server';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@procura/ui';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  await auth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Track and manage all incoming invoices.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Upload Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Invoice management will be available after connecting your data sources.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
