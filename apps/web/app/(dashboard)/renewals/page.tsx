'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@procura/ui';
import { Bell, CalendarDays, CheckCircle2, AlertTriangle, DollarSign } from 'lucide-react';

export default function RenewalsPage() {
  const [days, setDays] = useState(30);

  const { data: upcoming, isLoading } = useQuery({
    queryKey: ['renewals-upcoming', days],
    queryFn: () => api.get<any>('/renewals', { organizationId: 'org_demo', days }),
  });

  const { data: calendar } = useQuery({
    queryKey: ['renewals-calendar'],
    queryFn: () => api.get<any>('/renewals/calendar', { organizationId: 'org_demo' }),
  });

  const items = [
    ...(upcoming?.subscriptions || []).map((s: any) => ({
      ...s,
      _type: 'subscription' as const,
      _date: s.renewalDate,
    })),
    ...(upcoming?.contracts || []).map((c: any) => ({
      ...c,
      _type: 'contract' as const,
      _date: c.endDate,
    })),
  ].sort((a: any, b: any) => new Date(a._date).getTime() - new Date(b._date).getTime());

  const calendarEvents = calendar ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Renewals</h1>
        <p className="text-muted-foreground">Track subscription and contract renewals to prevent missed deadlines.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due in 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{upcoming?.subscriptions?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contracts Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{upcoming?.contracts?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Auto-Renew</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {upcoming?.subscriptions?.filter((s: any) => s.status === 'active').length ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Renewals</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Renewals due in {days} days</CardTitle>
                <div className="flex gap-1">
                  {[7, 30, 60, 90].map((d) => (
                    <Button
                      key={d}
                      variant={days === d ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDays(d)}
                    >
                      {d}d
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  Loading renewals...
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-1 text-lg font-medium">No upcoming renewals</h3>
                  <p className="text-sm text-muted-foreground">
                    Nothing due in the next {days} days.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item: any) => {
                    const date = new Date(item._date);
                    const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            {item._type === 'subscription' ? (
                              <Bell className="h-5 w-5 text-primary" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-warning" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.title || item.name}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{item.vendor?.name || item.vendor}</span>
                              {item.amount && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {item.amount.toLocaleString()}
                                </span>
                              )}
                              <span>{item._type === 'subscription' ? item.billingPeriod : 'Contract'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <Badge variant={daysUntil <= 7 ? 'destructive' : daysUntil <= 30 ? 'warning' : 'secondary'}>
                              {daysUntil <= 0 ? 'Overdue' : `${daysUntil} days`}
                            </Badge>
                          </div>
                          {item.autoRenew && (
                            <div className="hidden md:block">
                              <Badge variant="success" className="whitespace-nowrap">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Auto-renew
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Renewal Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              {calendarEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-1 text-lg font-medium">No events</h3>
                  <p className="text-sm text-muted-foreground">
                    Add subscriptions or contracts to see them on the calendar.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {calendarEvents.map((event: any) => (
                    <div key={event.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                      <div className="flex h-10 w-10 flex-col items-center justify-center rounded-md bg-primary/10">
                        <span className="text-xs font-bold text-primary">
                          {new Date(event.date).getDate()}
                        </span>
                        <span className="text-[10px] text-primary">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.vendor}
                          {event.amount ? ` · $${event.amount.toLocaleString()}` : ''}
                        </p>
                      </div>
                      <Badge variant={event.type === 'contract' ? 'warning' : 'default'}>
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
