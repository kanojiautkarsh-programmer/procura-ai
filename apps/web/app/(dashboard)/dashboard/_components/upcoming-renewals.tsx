'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@procura/ui';

interface UpcomingRenewalsProps {
  organizationId: string | null | undefined;
}

export function UpcomingRenewals({ organizationId }: UpcomingRenewalsProps) {
  const { data: renewals } = useQuery({
    queryKey: ['renewals', organizationId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/renewals?organizationId=${organizationId}&days=30`,
      );
      return res.json();
    },
    enabled: !!organizationId,
  });

  const items = [
    ...(renewals?.subscriptions || []),
    ...(renewals?.contracts || []),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Upcoming Renewals (30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No renewals due in the next 30 days</p>
          ) : (
            items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{item.title || item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.vendor}</p>
                </div>
                <Badge variant="warning">
                  {new Date(item.date || item.renewalDate).toLocaleDateString()}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
