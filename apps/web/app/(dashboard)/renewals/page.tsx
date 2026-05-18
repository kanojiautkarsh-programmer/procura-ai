import { auth } from '@clerk/nextjs/server';
import { Card, CardContent, CardHeader, CardTitle } from '@procura/ui';

export const dynamic = 'force-dynamic';

export default async function RenewalsPage() {
  await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Renewals</h1>
        <p className="text-muted-foreground">Track contract renewals and subscription end dates.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Renewals Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No upcoming renewals. Add subscriptions or contracts to see renewal dates here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
