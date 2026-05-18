import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, options: { page: number; limit: number }) {
    const where = { organizationId };
    const [data, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { invoices: true, subscriptions: true, contracts: true } },
        },
      }),
      this.prisma.vendor.count({ where }),
    ]);
    return { data, total, page: options.page, limit: options.limit, totalPages: Math.ceil(total / options.limit) };
  }

  async findOne(id: string, organizationId?: string) {
    const where: Record<string, string> = { id };
    if (organizationId) where.organizationId = organizationId;
    const vendor = await this.prisma.vendor.findFirst({
      where,
      include: {
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
        subscriptions: true,
        contracts: true,
      },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async create(data: {
    name: string;
    category: string;
    organizationId: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    notes?: string;
    rating?: number;
  }) {
    return this.prisma.vendor.create({
      data: {
        name: data.name,
        category: data.category as any,
        organizationId: data.organizationId,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        website: data.website,
        notes: data.notes,
        rating: data.rating,
      },
    });
  }

  async update(id: string, data: Record<string, unknown>, organizationId?: string) {
    await this.findOne(id, organizationId);
    return this.prisma.vendor.update({
      where: { id },
      data: { ...data, organizationId: undefined },
    });
  }

  async remove(id: string, organizationId?: string) {
    await this.findOne(id, organizationId);
    return this.prisma.vendor.delete({ where: { id } });
  }
}
