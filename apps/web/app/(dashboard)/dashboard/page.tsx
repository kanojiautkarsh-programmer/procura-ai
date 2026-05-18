import { auth } from '@clerk/nextjs/server';
import { SpendOverview } from './_components/spend-overview';
import { QuickActions } from './_components/quick-actions';
import { RecentActivity } from './_components/recent-activity';
import { UpcomingRenewals } from './_components/upcoming-renewals';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId, orgId } = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your organization&apos;s spending and procurement activity.</p>
      </div>

      <SpendOverview organizationId={orgId} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickActions />
        <RecentActivity organizationId={orgId} />
        <UpcomingRenewals organizationId={orgId} />
      </div>
    </div>
  );
}
