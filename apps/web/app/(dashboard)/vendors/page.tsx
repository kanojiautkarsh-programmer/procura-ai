import { auth } from '@clerk/nextjs/server';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@procura/ui';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function VendorsPage() {
  await auth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">Manage your vendor relationships and performance.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No vendors added yet. Add vendors to track contracts, invoices, and subscriptions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
