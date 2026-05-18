import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    options: { page: number; limit: number; status?: string },
  ) {
    const where: Record<string, unknown> = { organizationId };
    if (options.status) where.status = options.status;

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: { vendor: true },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  async findOne(id: string, organizationId?: string) {
    const where: Record<string, string> = { id };
    if (organizationId) where.organizationId = organizationId;

    const invoice = await this.prisma.invoice.findFirst({
      where,
      include: { vendor: true, createdBy: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async create(data: {
    vendorId: string;
    amount: number;
    issueDate: Date;
    dueDate: Date;
    organizationId: string;
    createdById: string;
    invoiceNumber?: string;
    taxAmount?: number;
    currency?: string;
    status?: string;
    paidDate?: Date;
    category?: string;
    description?: string;
    fileUrl?: string;
  }) {
    return this.prisma.invoice.create({
      data: {
        vendorId: data.vendorId,
        amount: data.amount,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        organizationId: data.organizationId,
        createdById: data.createdById,
        invoiceNumber: data.invoiceNumber,
        taxAmount: data.taxAmount ?? 0,
        currency: data.currency ?? 'USD',
        status: (data.status as any) ?? 'pending',
        paidDate: data.paidDate ? new Date(data.paidDate) : undefined,
        category: data.category,
        description: data.description,
        fileUrl: data.fileUrl,
      },
    });
  }

  async update(id: string, data: Record<string, unknown>, organizationId?: string) {
    await this.findOne(id, organizationId);
    return this.prisma.invoice.update({
      where: { id },
      data: {
        ...data,
        // Prevent org/creator changes
        organizationId: undefined,
        createdById: undefined,
      },
    });
  }

  async remove(id: string, organizationId?: string) {
    await this.findOne(id, organizationId);
    return this.prisma.invoice.delete({ where: { id } });
  }
}
