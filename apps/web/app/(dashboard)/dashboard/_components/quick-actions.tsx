'use client';

import { Card, CardContent, CardHeader, CardTitle, Button } from '@procura/ui';
import { PlusCircle, Upload, Send, Search } from 'lucide-react';

export function QuickActions() {
  const actions = [
    { label: 'New Approval Request', icon: Send, variant: 'default' as const },
    { label: 'Upload Invoice', icon: Upload, variant: 'outline' as const },
    { label: 'Add Subscription', icon: PlusCircle, variant: 'outline' as const },
    { label: 'Search Spend', icon: Search, variant: 'outline' as const },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button key={action.label} variant={action.variant} className="w-full justify-start gap-2">
              <Icon className="h-4 w-4" />
              {action.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
