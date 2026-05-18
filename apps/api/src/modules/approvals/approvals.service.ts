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
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.approvalRequest.count({ where }),
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
    const approval = await this.prisma.approvalRequest.findUnique({
      where: { id },
      include: { requester: true, approver: true, vendor: true },
    });
    if (!approval) throw new NotFoundException('Approval request not found');
    return approval;
  }

  async create(data: unknown) {
    return this.prisma.approvalRequest.create({ data: data as any });
  }

  async takeAction(id: string, action: { status: 'approved' | 'rejected'; notes?: string }) {
    const request = await this.findOne(id);
    if (request.status !== 'pending') {
      throw new Error('Approval request is not pending');
    }

    return this.prisma.approvalRequest.update({
      where: { id },
      data: {
        status: action.status,
        // TODO: set approvedById from auth context
        notes: action.notes,
      },
    });
  }
}
