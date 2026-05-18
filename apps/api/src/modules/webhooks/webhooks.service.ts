import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as crypto from 'node:crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createEndpoint(params: {
    organizationId: string;
    url: string;
    events: string[];
    secret?: string;
  }) {
    const secret = params.secret || crypto.randomBytes(32).toString('hex');
    return this.prisma.webhookEndpoint.create({
      data: {
        organizationId: params.organizationId,
        url: params.url,
        events: params.events,
        secret,
      },
    });
  }

  async listEndpoints(organizationId: string) {
    return this.prisma.webhookEndpoint.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateEndpoint(id: string, data: { url?: string; events?: string[]; isActive?: boolean }) {
    return this.prisma.webhookEndpoint.update({
      where: { id },
      data,
    });
  }

  async deleteEndpoint(id: string) {
    return this.prisma.webhookEndpoint.delete({ where: { id } });
  }

  async trigger(organizationId: string, event: string, payload: any) {
    const endpoints = await this.prisma.webhookEndpoint.findMany({
      where: { organizationId, isActive: true, events: { has: event } },
    });

    const results = [];
    for (const endpoint of endpoints) {
      try {
        const body = JSON.stringify({ event, createdAt: new Date().toISOString(), data: payload });
        const signature = crypto
          .createHmac('sha256', endpoint.secret || '')
          .update(body)
          .digest('hex');

        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Procura-Signature': signature,
            'X-Procura-Event': event,
          },
          body,
        });

        await this.prisma.webhookEndpoint.update({
          where: { id: endpoint.id },
          data: { lastTriggeredAt: new Date(), failureCount: response.ok ? 0 : { increment: 1 } },
        });

        results.push({ endpointId: endpoint.id, status: response.status, ok: response.ok });
      } catch (err) {
        await this.prisma.webhookEndpoint.update({
          where: { id: endpoint.id },
          data: { failureCount: { increment: 1 } },
        });
        this.logger.error(`Webhook ${endpoint.id} failed: ${err}`);
        results.push({ endpointId: endpoint.id, error: String(err) });
      }
    }
    return results;
  }
}
