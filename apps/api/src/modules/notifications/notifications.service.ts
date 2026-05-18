import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(params: {
    organizationId: string;
    userId?: string;
    type: string;
    title: string;
    body?: string;
    data?: any;
  }) {
    return this.prisma.notification.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        data: params.data ?? {},
      },
    });
  }

  async findByOrg(organizationId: string, limit = 50, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: {
        organizationId,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByUser(userId: string, organizationId: string, limit = 20) {
    return this.prisma.notification.findMany({
      where: { userId, organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllRead(organizationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { organizationId, userId, read: false },
      data: { read: true },
    });
  }

  async getUnreadCount(organizationId: string, userId: string) {
    return this.prisma.notification.count({
      where: { organizationId, userId, read: false },
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { id, userId },
    });
  }
}
