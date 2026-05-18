import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    options: { page: number; limit: number; status?: string },
  ) {
    const where: Record<string, unknown> = { organizationId };
    if (options.status) where.status = options.status;

    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        include: { vendor: true },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        orderBy: { renewalDate: 'asc' },
      }),
      this.prisma.subscription.count({ where }),
    ]);
    return { data, total, page: options.page, limit: options.limit, totalPages: Math.ceil(total / options.limit) };
  }

  async findOne(id: string, organizationId?: string) {
    const where: Record<string, string> = { id };
    if (organizationId) where.organizationId = organizationId;
    const sub = await this.prisma.subscription.findFirst({
      where,
      include: { vendor: true },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async create(data: {
    name: string;
    vendorId: string;
    amount: number;
    billingPeriod: string;
    organizationId: string;
    currency?: string;
    status?: string;
    startDate: Date;
    renewalDate?: Date;
    licenseCount?: number;
    allocatedLicenses?: number;
    department?: string;
    category?: string;
    notes?: string;
  }) {
    return this.prisma.subscription.create({
      data: {
        name: data.name,
        vendorId: data.vendorId,
        amount: data.amount,
        billingPeriod: data.billingPeriod as any,
        organizationId: data.organizationId,
        currency: data.currency ?? 'USD',
        status: (data.status as any) ?? 'active',
        startDate: new Date(data.startDate),
        renewalDate: data.renewalDate ? new Date(data.renewalDate) : undefined,
        licenseCount: data.licenseCount ?? 0,
        allocatedLicenses: data.allocatedLicenses ?? 0,
        department: data.department,
        category: data.category,
        notes: data.notes,
      },
    });
  }

  async update(id: string, data: Record<string, unknown>, organizationId?: string) {
    await this.findOne(id, organizationId);
    return this.prisma.subscription.update({
      where: { id },
      data: { ...data, organizationId: undefined },
    });
  }

  async remove(id: string, organizationId?: string) {
    await this.findOne(id, organizationId);
    return this.prisma.subscription.delete({ where: { id } });
  }
}
