'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Input, Avatar, AvatarFallback,
} from '@procura/ui';
import { Plus, Search, Building2, Star, TrendingUp } from 'lucide-react';

export default function VendorsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.get<any>('/vendors', { organizationId: 'org_demo', limit: 50 }),
  });

  const vendors = data?.data ?? [];

  const filtered = vendors.filter((v: any) =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">Manage vendor relationships, performance, and contracts.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search vendors..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Loading vendors...
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-1 text-lg font-medium">No vendors added yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Add vendors to track contracts, invoices, and subscriptions.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vendor: any) => {
            const initials = vendor.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <Card key={vendor.id} className="transition-colors hover:bg-muted/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{vendor.name}</CardTitle>
                        <p className="text-sm capitalize text-muted-foreground">
                          {vendor.category?.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    {vendor.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{vendor.rating}</span>
                        <span className="text-muted-foreground">/5</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {vendor.contactEmail && (
                      <Badge variant="outline">{vendor.contactEmail}</Badge>
                    )}
                    {vendor.website && (
                      <Badge variant="outline" className="truncate max-w-[180px]">
                        {vendor.website.replace(/^https?:\/\//, '')}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-md bg-muted p-2">
                      <p className="font-medium text-foreground">{vendor._count?.invoices ?? 0}</p>
                      <p className="text-muted-foreground">Invoices</p>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <p className="font-medium text-foreground">{vendor._count?.subscriptions ?? 0}</p>
                      <p className="text-muted-foreground">Subscriptions</p>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <p className="font-medium text-foreground">{vendor._count?.contracts ?? 0}</p>
                      <p className="text-muted-foreground">Contracts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
