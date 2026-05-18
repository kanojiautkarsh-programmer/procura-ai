import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SpendService {
  private readonly logger = new Logger(SpendService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSummary(
    organizationId: string,
    dateRange?: { startDate?: string; endDate?: string },
  ) {
    const invoices = await this.prisma.invoice.findMany({
      where: { organizationId },
      include: { vendor: true },
    });

    const subscriptions = await this.prisma.subscription.findMany({
      where: { organizationId, status: 'active' },
    });

    const totalSpend = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const monthlySpend = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

    return {
      totalSpend,
      monthlySpend,
      activeSubscriptions: subscriptions.length,
      pendingInvoices: invoices.filter((i) => i.status === 'pending').length,
      overdueInvoices: invoices.filter((i) => i.status === 'overdue').length,
      categoryBreakdown: [],
      departmentBreakdown: [],
      period: {
        start: dateRange?.startDate ? new Date(dateRange.startDate) : new Date(0),
        end: dateRange?.endDate ? new Date(dateRange.endDate) : new Date(),
      },
    };
  }

  async getTrends(organizationId: string, months = 12) {
    return this.prisma.invoice.findMany({
      where: {
        organizationId,
        issueDate: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - months)),
        },
      },
      orderBy: { issueDate: 'asc' },
    });
  }

  async getCategoryBreakdown(organizationId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { organizationId },
      include: { vendor: true },
    });

    const breakdown = new Map<string, number>();
    for (const invoice of invoices) {
      const category = invoice.category || invoice.vendor.category || 'other';
      breakdown.set(category, (breakdown.get(category) || 0) + invoice.amount);
    }

    const total = Array.from(breakdown.values()).reduce((a, b) => a + b, 0);

    return Array.from(breakdown.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }));
  }

  async getDepartmentBreakdown(organizationId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { organizationId },
    });

    const breakdown = new Map<string, { amount: number; count: number }>();
    for (const sub of subscriptions) {
      const dept = sub.department || 'uncategorized';
      const current = breakdown.get(dept) || { amount: 0, count: 0 };
      current.amount += sub.amount;
      current.count += 1;
      breakdown.set(dept, current);
    }

    const total = Array.from(breakdown.values()).reduce((a, b) => a + b.amount, 0);

    return Array.from(breakdown.entries()).map(([department, data]) => ({
      department,
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
    }));
  }
}
