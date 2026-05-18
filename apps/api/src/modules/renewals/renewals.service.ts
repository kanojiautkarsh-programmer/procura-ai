import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class RenewalsService {
  private readonly logger = new Logger(RenewalsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findUpcoming(organizationId: string, days = 30) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        organizationId,
        status: 'active',
        renewalDate: { gte: now, lte: future },
      },
      include: { vendor: true },
      orderBy: { renewalDate: 'asc' },
    });

    const contracts = await this.prisma.contract.findMany({
      where: {
        organizationId,
        status: { in: ['active', 'expiring_soon'] },
        endDate: { gte: now, lte: future },
      },
      include: { vendor: true },
      orderBy: { endDate: 'asc' },
    });

    return { subscriptions, contracts };
  }

  async getCalendar(organizationId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { organizationId, status: 'active', renewalDate: { not: null } },
      include: { vendor: true },
      orderBy: { renewalDate: 'asc' },
    });

    const contracts = await this.prisma.contract.findMany({
      where: { organizationId, status: { in: ['active', 'expiring_soon'] } },
      include: { vendor: true },
      orderBy: { endDate: 'asc' },
    });

    const events = [
      ...subscriptions.map((s) => ({
        id: s.id,
        type: 'subscription' as const,
        title: `${s.name} Renewal`,
        date: s.renewalDate!,
        vendor: s.vendor.name,
        amount: s.amount,
      })),
      ...contracts.map((c) => ({
        id: c.id,
        type: 'contract' as const,
        title: `${c.title} Expiry`,
        date: c.endDate,
        vendor: c.vendor.name,
        amount: c.value,
      })),
    ];

    events.sort((a, b) => a.date.getTime() - b.date.getTime());
    return events;
  }

  async acknowledge(id: string) {
    return this.prisma.subscription.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }
}
