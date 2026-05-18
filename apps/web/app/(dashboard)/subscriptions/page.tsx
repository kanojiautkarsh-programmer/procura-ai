'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Input, Select,
  SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@procura/ui';
import { Plus, CreditCard, Search } from 'lucide-react';

const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  active: 'success',
  trial: 'default',
  expired: 'warning',
  cancelled: 'destructive',
  pending: 'secondary',
};

const billingLabels: Record<string, string> = {
  monthly: '/mo',
  quarterly: '/qtr',
  semi_annual: '/6mo',
  annual: '/yr',
  one_time: 'one-time',
};

export default function SubscriptionsPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions', filterStatus],
    queryFn: () => api.get<any>('/spend/summary', { organizationId: 'org_demo' }),
  });

  const subscriptions = data?.subscriptions ?? [];

  const filtered = subscriptions.filter((s: any) => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Loading subscriptions...
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCard className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-1 text-lg font-medium">No subscriptions tracked</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Add your first subscription to start monitoring spend.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Subscription
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((sub: any) => (
            <Card key={sub.id} className="transition-colors hover:bg-muted/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{sub.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{sub.vendorName || 'Unknown vendor'}</p>
                  </div>
                  <Badge variant={statusVariant[sub.status] || 'secondary'}>
                    {sub.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <span className="text-2xl font-bold">${sub.amount?.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">
                    {billingLabels[sub.billingPeriod] || ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {sub.department && (
                    <Badge variant="outline" className="text-xs">
                      {sub.department}
                    </Badge>
                  )}
                  {sub.category && (
                    <Badge variant="outline" className="text-xs">
                      {sub.category}
                    </Badge>
                  )}
                  {sub.licenseCount > 0 && (
                    <span>{sub.allocatedLicenses}/{sub.licenseCount} licenses</span>
                  )}
                  {sub.renewalDate && (
                    <span>Renews {new Date(sub.renewalDate).toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
