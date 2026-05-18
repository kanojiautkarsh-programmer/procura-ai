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

    return {
      data,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
        subscriptions: true,
        contracts: true,
      },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async create(data: unknown) {
    return this.prisma.vendor.create({ data: data as any });
  }

  async update(id: string, data: unknown) {
    await this.findOne(id);
    return this.prisma.vendor.update({ where: { id }, data: data as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.vendor.delete({ where: { id } });
  }
}
