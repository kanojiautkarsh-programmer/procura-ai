import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    action: string;
    entityType: string;
    entityId: string;
    changes?: Prisma.InputJsonValue;
    userId: string;
    organizationId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          changes: params.changes ?? Prisma.DbNull,
          userId: params.userId,
          organizationId: params.organizationId,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to write audit log: ${err instanceof Error ? err.message : err}`);
    }
  }

  async findByEntity(entityType: string, entityId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByOrganization(organizationId: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByUser(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
