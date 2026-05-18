import { auth } from '@clerk/nextjs/server';
import { Card, CardContent, CardHeader, CardTitle } from '@procura/ui';

export const dynamic = 'force-dynamic';

export default async function ApprovalsPage() {
  await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
        <p className="text-muted-foreground">Review and manage procurement approval requests.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No pending approval requests. New requests will appear here for review.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
