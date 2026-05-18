'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@procura/ui';
import { DollarSign, CreditCard, Receipt, AlertTriangle } from 'lucide-react';

interface SpendOverviewProps {
  organizationId: string | null | undefined;
}

export function SpendOverview({ organizationId }: SpendOverviewProps) {
  const { data: summary } = useQuery({
    queryKey: ['spend-summary', organizationId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/spend/summary?organizationId=${organizationId}`,
      );
      return res.json();
    },
    enabled: !!organizationId,
  });

  const stats = [
    {
      title: 'Total Spend',
      value: `$${(summary?.totalSpend || 0).toLocaleString()}`,
      icon: DollarSign,
      variant: 'default' as const,
    },
    {
      title: 'Monthly Subscriptions',
      value: `$${(summary?.monthlySpend || 0).toLocaleString()}/mo`,
      icon: CreditCard,
      variant: 'secondary' as const,
    },
    {
      title: 'Pending Invoices',
      value: summary?.pendingInvoices ?? 0,
      icon: Receipt,
      variant: 'warning' as const,
    },
    {
      title: 'Overdue',
      value: summary?.overdueInvoices ?? 0,
      icon: AlertTriangle,
      variant: 'destructive' as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Badge variant={stat.variant} className="mt-1">
                {stat.title === 'Total Spend' ? 'All time' : 'Current'}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
