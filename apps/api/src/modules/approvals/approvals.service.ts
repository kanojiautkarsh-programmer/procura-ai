import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ApprovalsService {
  private readonly logger = new Logger(ApprovalsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    options: { page: number; limit: number; status?: string },
  ) {
    const where: Record<string, unknown> = { organizationId };
    if (options.status) where.status = options.status;

    const [data, total] = await Promise.all([
      this.prisma.approvalRequest.findMany({
        where,
        include: { requester: true, vendor: true },
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      this.prisma.approvalRequest.count({ where }),
    ]);
    return { data, total, page: options.page, limit: options.limit, totalPages: Math.ceil(total / options.limit) };
  }

  async findOne(id: string, organizationId?: string) {
    const where: Record<string, string> = { id };
    if (organizationId) where.organizationId = organizationId;
    const approval = await this.prisma.approvalRequest.findFirst({
      where,
      include: { requester: true, approver: true, vendor: true },
    });
    if (!approval) throw new NotFoundException('Approval request not found');
    return approval;
  }

  async create(data: {
    title: string;
    amount: number;
    requestedById: string;
    organizationId: string;
    description?: string;
    currency?: string;
    department?: string;
    vendorId?: string;
    notes?: string;
  }) {
    return this.prisma.approvalRequest.create({
      data: {
        title: data.title,
        amount: data.amount,
        requestedById: data.requestedById,
        organizationId: data.organizationId,
        description: data.description,
        currency: data.currency ?? 'USD',
        department: data.department,
        vendorId: data.vendorId,
        notes: data.notes,
        status: 'pending',
        level: 'level_1',
      },
    });
  }

  async approve(
    id: string,
    approvedById: string,
    action: 'approved' | 'rejected' | 'escalated',
    notes?: string,
    organizationId?: string,
  ) {
    const approval = await this.findOne(id, organizationId);
    return this.prisma.approvalRequest.update({
      where: { id },
      data: { status: action as any, approvedById, notes },
    });
  }

  async remove(id: string, organizationId?: string) {
    await this.findOne(id, organizationId);
    return this.prisma.approvalRequest.delete({ where: { id } });
  }
}
