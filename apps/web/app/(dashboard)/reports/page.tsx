'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent,
  Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@procura/ui';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react';
import { SpendChart } from './_components/spend-chart';
import { BudgetTable } from './_components/budget-table';
import { ScenarioSimulator } from './_components/scenario-simulator';

export default function ReportsPage() {
  const [tab, setTab] = useState('spend');

  const { data: projection, isLoading } = useQuery({
    queryKey: ['forecast-projection'],
    queryFn: () => api.get<any>('/forecast/projection', { organizationId: 'org_demo', months: 6 }),
  });

  const { data: budgetStatus } = useQuery({
    queryKey: ['forecast-budget'],
    queryFn: () => api.get<any>('/forecast/budget-status', { organizationId: 'org_demo' }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Forecasting</h1>
        <p className="text-muted-foreground">Analyze spend trends, forecast future costs, and run scenarios.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                ${(projection?.averageMonthly || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {projection?.trend === 'increasing' ? (
                <TrendingUp className="h-5 w-5 text-destructive" />
              ) : projection?.trend === 'decreasing' ? (
                <TrendingDown className="h-5 w-5 text-green-500" />
              ) : (
                <Minus className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-lg font-medium capitalize">{projection?.trend || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Projected (6mo)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                ${projection?.forecast?.reduce((s: number, f: any) => s + f.amount, 0).toLocaleString() || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Budget Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold">{budgetStatus?.alerts?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="spend">Spend Trends</TabsTrigger>
          <TabsTrigger value="budget">Budget vs Actual</TabsTrigger>
          <TabsTrigger value="scenario">Scenario Simulator</TabsTrigger>
        </TabsList>

        <TabsContent value="spend" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spend Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
                  Loading chart data...
                </div>
              ) : (
                <SpendChart
                  historical={projection?.historical || []}
                  forecast={projection?.forecast || []}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Budget Status</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetTable
                departments={budgetStatus?.departments || []}
                alerts={budgetStatus?.alerts || []}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenario" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Simulation</CardTitle>
            </CardHeader>
            <CardContent>
              <ScenarioSimulator currentMonthly={projection?.averageMonthly || 0} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
