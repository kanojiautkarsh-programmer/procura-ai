import { auth } from '@clerk/nextjs/server';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@procura/ui';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SubscriptionsPage() {
  await auth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">All your software subscriptions in one place.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No subscriptions tracked yet. Add your first subscription to start monitoring spend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
