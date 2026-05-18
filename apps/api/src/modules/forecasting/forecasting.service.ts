import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ForecastingService {
  private readonly logger = new Logger(ForecastingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMonthlySpend(organizationId: string, months = 12) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        organizationId,
        issueDate: { gte: since },
      },
      orderBy: { issueDate: 'asc' },
    });

    return this.aggregateByMonth(invoices);
  }

  async getProjection(organizationId: string, monthsAhead = 3) {
    const monthlyData = await this.getMonthlySpend(organizationId, 6);

    const values = monthlyData.map((m: any) => m.amount);

    // Simple linear projection
    const avg = values.length > 0
      ? values.reduce((a: number, b: number) => a + b, 0) / values.length
      : 0;

    const forecast = [];
    const lastDate = monthlyData.length > 0
      ? new Date(monthlyData[monthlyData.length - 1].date)
      : new Date();

    for (let i = 1; i <= monthsAhead; i++) {
      const next = new Date(lastDate);
      next.setMonth(next.getMonth() + i);
      forecast.push({
        date: next.toISOString().slice(0, 7),
        amount: Math.round(avg * (1 + i * 0.02)), // Assume 2% monthly growth
        isForecast: true,
      });
    }

    return {
      historical: monthlyData,
      forecast,
      trend: avg > 0 ? (values[values.length - 1] > values[0] ? 'increasing' : 'decreasing') : 'stable',
      averageMonthly: Math.round(avg),
    };
  }

  async getBudgetStatus(organizationId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { organizationId, status: 'active' },
    });

    const departments = new Map<string, { budget: number; spent: number }>();

    for (const sub of subscriptions) {
      const dept = sub.department || 'uncategorized';
      const current = departments.get(dept) || { budget: 0, spent: 0 };
      current.spent += sub.amount;
      departments.set(dept, current);
    }

    const departmentsArray = Array.from(departments.entries()).map(([name, data]) => ({
      department: name,
      budget: data.budget,
      spent: data.spent,
      utilization: data.budget > 0 ? Math.round((data.spent / data.budget) * 100) : null,
    }));

    return {
      departments: departmentsArray,
      totalSpend: departmentsArray.reduce((s, d) => s + d.spent, 0),
      alerts: departmentsArray
        .filter((d) => d.utilization !== null && d.utilization > 85)
        .map((d) => ({
          department: d.department,
          message: `${d.department} has used ${d.utilization}% of budget`,
          severity: (d.utilization || 0) > 100 ? 'critical' : 'warning',
        })),
    };
  }

  async runScenario(body: {
    organizationId: string;
    growthRate?: number;
    costCuts?: { name: string; monthlySavings: number }[];
    months?: number;
  }) {
    const monthlySpend = await this.getMonthlySpend(body.organizationId, 3);
    const currentMonthly = monthlySpend.length > 0
      ? monthlySpend[monthlySpend.length - 1].amount
      : 0;

    const growthRate = body.growthRate || 0;
    const costCuts = body.costCuts || [];
    const months = body.months || 12;
    const totalMonthlySavings = costCuts.reduce((s, c) => s + c.monthlySavings, 0);

    const projections = [];
    let runningSpend = currentMonthly;

    for (let i = 1; i <= months; i++) {
      runningSpend *= (1 + growthRate / 100 / 12);
      runningSpend -= totalMonthlySavings;
      projections.push({
        month: i,
        projectedSpend: Math.round(runningSpend),
        savingsApplied: totalMonthlySavings,
      });
    }

    return {
      scenario: {
        currentMonthly,
        growthRate,
        costCuts,
        months,
      },
      projections,
      totalProjected: Math.round(projections.reduce((s, p) => s + p.projectedSpend, 0)),
      totalSavings: Math.round(totalMonthlySavings * months),
    };
  }

  private async aggregateByMonth(invoices: any[]) {
    const monthly = new Map<string, number>();

    for (const inv of invoices) {
      const key = inv.issueDate.toISOString().slice(0, 7);
      monthly.set(key, (monthly.get(key) || 0) + inv.amount);
    }

    return Array.from(monthly.entries())
      .map(([date, amount]) => ({ date, amount: Math.round(amount) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
