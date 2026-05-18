import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    options: { page: number; limit: number; status?: string },
  ) {
    const where: Record<string, unknown> = { organizationId };
    if (options.status) where.status = options.status;

    const [data, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        include: { vendor: true },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        orderBy: { endDate: 'asc' },
      }),
      this.prisma.contract.count({ where }),
    ]);
    return { data, total, page: options.page, limit: options.limit, totalPages: Math.ceil(total / options.limit) };
  }

  async findOne(id: string, organizationId?: string) {
    const where: Record<string, string> = { id };
    if (organizationId) where.organizationId = organizationId;
    const contract = await this.prisma.contract.findFirst({
      where,
      include: { vendor: true, createdBy: true },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async create(data: {
    vendorId: string;
    title: string;
    startDate: Date;
    endDate: Date;
    organizationId: string;
    createdById: string;
    description?: string;
    renewalDate?: Date;
    autoRenew?: boolean;
    value?: number;
    status?: string;
    fileUrl?: string;
    notes?: string;
  }) {
    return this.prisma.contract.create({
      data: {
        vendorId: data.vendorId,
        title: data.title,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        organizationId: data.organizationId,
        createdById: data.createdById,
        description: data.description,
        renewalDate: data.renewalDate ? new Date(data.renewalDate) : undefined,
        autoRenew: data.autoRenew ?? false,
        value: data.value,
        status: (data.status as any) ?? 'active',
        fileUrl: data.fileUrl,
        notes: data.notes,
      },
    });
  }

  async update(id: string, data: Record<string, unknown>, organizationId?: string) {
    await this.findOne(id, organizationId);
    return this.prisma.contract.update({
      where: { id },
      data: { ...data, organizationId: undefined, createdById: undefined },
    });
  }

  async remove(id: string, organizationId?: string) {
    await this.findOne(id, organizationId);
    return this.prisma.contract.delete({ where: { id } });
  }
}
