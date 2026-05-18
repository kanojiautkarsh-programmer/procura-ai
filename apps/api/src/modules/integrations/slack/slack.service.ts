import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface SlackMessage {
  text: string;
  blocks?: any[];
  response_type?: 'in_channel' | 'ephemeral';
}

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(channelId: string, text: string, blocks?: any[]): Promise<boolean> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      this.logger.warn('Slack webhook URL not configured');
      return false;
    }

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: channelId, text, blocks }),
      });
      return res.ok;
    } catch (err) {
      this.logger.error(`Failed to send Slack message: ${err instanceof Error ? err.message : err}`);
      return false;
    }
  }

  async handleEvent(event: any) {
    if (event.event?.type === 'app_mention') {
      const text = event.event.text;
      const channel = event.event.channel;

      if (text.includes('approval') || text.includes('pending')) {
        return this.handleApprovalsCommand({ channel_id: channel, user_id: event.event.user });
      }
      if (text.includes('spend') || text.includes('cost')) {
        return this.handleSpendCommand({ channel_id: channel, user_id: event.event.user });
      }

      return this.sendMessage(channel, `Hi there! I can help with:
• /procura-approvals — View pending approvals
• /procura-spend — Get spend summary
• Ask about pending approvals or spend in a message`);
    }

    return { ok: true };
  }

  async handleInteraction(payload: any) {
    const { type, actions, channel, user } = payload;

    if (type === 'block_actions') {
      for (const action of actions) {
        if (action.action_id === 'approve_request' || action.action_id === 'reject_request') {
          const requestId = action.value;
          const status = action.action_id === 'approve_request' ? 'approved' : 'rejected';

          try {
            await this.prisma.approvalRequest.update({
              where: { id: requestId },
              data: { status, notes: `Actioned via Slack by user ${user.id}` },
            });

            await this.sendMessage(
              channel.id,
              `✅ Request *${requestId.slice(0, 8)}* has been *${status}* by <@${user.id}>.`,
            );
          } catch (err) {
            await this.sendMessage(
              channel.id,
              `❌ Failed to ${status} request: ${err instanceof Error ? err.message : err}`,
            );
          }
        }
      }
    }

    return { ok: true };
  }

  async handleApprovalsCommand(body: any): Promise<SlackMessage> {
    const orgId = body.organization_id || 'org_demo';

    const pending = await this.prisma.approvalRequest.findMany({
      where: { organizationId: orgId, status: 'pending' },
      include: { requester: true, vendor: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (pending.length === 0) {
      return {
        response_type: 'ephemeral',
        text: '🎉 No pending approval requests! Everything is up to date.',
      };
    }

    const blocks = [
      {
        type: 'header',
        text: { type: 'plain_text', text: `📋 Pending Approvals (${pending.length})` },
      },
      {
        type: 'divider',
      },
      ...pending.flatMap((req) => [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${req.title}*\nAmount: $${req.amount} • Requested by ${req.requester.name} • ${req.createdAt.toLocaleDateString()}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: '✅ Approve' },
              style: 'primary',
              action_id: 'approve_request',
              value: req.id,
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: '❌ Reject' },
              style: 'danger',
              action_id: 'reject_request',
              value: req.id,
            },
          ],
        },
        { type: 'divider' },
      ]),
    ];

    return {
      response_type: 'in_channel',
      text: `Pending Approvals (${pending.length})`,
      blocks,
    };
  }

  async handleSpendCommand(body: any): Promise<SlackMessage> {
    const orgId = body.organization_id || 'org_demo';

    const invoices = await this.prisma.invoice.findMany({
      where: { organizationId: orgId },
    });

    const total = invoices.reduce((s, i) => s + i.amount, 0);
    const pending = invoices.filter((i) => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
    const overdue = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

    const subscriptions = await this.prisma.subscription.findMany({
      where: { organizationId: orgId, status: 'active' },
    });
    const monthly = subscriptions.reduce((s, sub) => s + sub.amount, 0);

    return {
      response_type: 'ephemeral',
      text: `📊 *Spend Summary*\nTotal: $${total.toLocaleString()}\nMonthly: $${monthly.toLocaleString()}/mo\nPending: $${pending.toLocaleString()}\nOverdue: $${overdue.toLocaleString()}`,
    };
  }
}
