'use client';

import { Badge } from '@procura/ui';

interface BudgetTableProps {
  departments: {
    department: string;
    budget: number;
    spent: number;
    utilization: number | null;
  }[];
  alerts: {
    department: string;
    message: string;
    severity: string;
  }[];
}

export function BudgetTable({ departments, alerts }: BudgetTableProps) {
  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
        <p>No department budgets configured.</p>
        <p className="text-xs">Budgets will appear here once subscriptions are assigned to departments.</p>
      </div>
    );
  }

  const alertMap = new Map(alerts.map((a) => [a.department, a]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-3 pr-4 font-medium">Department</th>
            <th className="pb-3 pr-4 font-medium">Monthly Spend</th>
            <th className="pb-3 pr-4 font-medium">vs Budget</th>
            <th className="pb-3 pr-4 font-medium">Utilization</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => {
            const alert = alertMap.get(dept.department);
            const utilization = dept.utilization ?? 0;
            const barColor = utilization > 100 ? 'bg-destructive' : utilization > 85 ? 'bg-yellow-500' : 'bg-green-500';

            return (
              <tr key={dept.department} className="border-b last:border-0 hover:bg-muted/50">
                <td className="py-3 pr-4 font-medium capitalize">{dept.department}</td>
                <td className="py-3 pr-4">${dept.spent.toLocaleString()}/mo</td>
                <td className="py-3 pr-4">
                  {dept.budget > 0
                    ? `$${dept.budget.toLocaleString()}/mo`
                    : '—'}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs">{dept.utilization !== null ? `${utilization}%` : '—'}</span>
                  </div>
                </td>
                <td className="py-3">
                  {alert ? (
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'warning'}>
                      {alert.severity === 'critical' ? 'Over Budget' : 'Near Limit'}
                    </Badge>
                  ) : dept.utilization !== null ? (
                    <Badge variant="success">On Track</Badge>
                  ) : (
                    <Badge variant="secondary">No Budget</Badge>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
