import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ByokService } from '../byok/byok.service';

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly byok: ByokService,
  ) {}

  async ask(query: string, organizationId: string): Promise<string> {
    // Get BYOK key if available
    const apiKey = await this.byok.getDefaultKey(organizationId);

    // Try AI service RAG first
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const body: Record<string, any> = { query, organization_id: organizationId, top_k: 5 };

      if (apiKey) {
        body.api_key = apiKey;
      }

      const response = await fetch(`${aiServiceUrl}/api/v1/rag/ask`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return data.answer;
      }
    } catch (err) {
      this.logger.warn(`AI service unavailable, falling back to local: ${err}`);
    }

    // Fallback: use local DB context for common queries
    return this.localAnswer(query, organizationId);
  }

  private async localAnswer(query: string, orgId: string): Promise<string> {
    const q = query.toLowerCase();

    if (q.includes('subscription') || q.includes('renew')) {
      const upcoming = await this.prisma.subscription.findMany({
        where: { organizationId: orgId, status: 'active' },
        include: { vendor: true },
        orderBy: { renewalDate: 'asc' },
        take: 5,
      });

      if (upcoming.length === 0) return 'No active subscriptions found.';

      const lines = upcoming.map(
        (s) =>
          `- ${s.name} (${s.vendor?.name || 'Unknown'}) — $${s.amount}/${s.billingPeriod.replace('_', ' ')}${
            s.renewalDate ? `, renews ${s.renewalDate.toLocaleDateString()}` : ''
          }`,
      );
      return `Here are your active subscriptions:\n${lines.join('\n')}`;
    }

    if (q.includes('approval') || q.includes('pending')) {
      const pending = await this.prisma.approvalRequest.findMany({
        where: { organizationId: orgId, status: 'pending' },
        include: { requester: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      if (pending.length === 0) return 'No pending approval requests.';

      const lines = pending.map(
        (a) =>
          `- ${a.title} — $${a.amount} (requested by ${a.requester.name}, ${a.createdAt.toLocaleDateString()})`,
      );
      return `You have ${pending.length} pending approval request(s):\n${lines.join('\n')}`;
    }

    if (q.includes('spend') || q.includes('spending') || q.includes('cost')) {
      const invoices = await this.prisma.invoice.findMany({
        where: { organizationId: orgId },
      });
      const total = invoices.reduce((sum, i) => sum + i.amount, 0);
      const byStatus = invoices.reduce(
        (acc, i) => {
          acc[i.status] = (acc[i.status] || 0) + i.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

      return `**Spend Overview**\n- Total tracked spend: $${total.toLocaleString()}\n- Paid: $${(byStatus['paid'] || 0).toLocaleString()}\n- Pending: $${(byStatus['pending'] || 0).toLocaleString()}\n- Overdue: $${(byStatus['overdue'] || 0).toLocaleString()}`;
    }

    if (q.includes('vendor') || q.includes('supplier')) {
      const vendors = await this.prisma.vendor.findMany({
        where: { organizationId: orgId },
        include: { _count: { select: { invoices: true, subscriptions: true } } },
      });

      if (vendors.length === 0) return 'No vendors found.';

      const lines = vendors.map(
        (v) => `- ${v.name} (${v._count.invoices} invoices, ${v._count.subscriptions} subscriptions)`,
      );
      return `You have ${vendors.length} vendor(s):\n${lines.join('\n')}`;
    }

    if (q.includes('negotiate') || q.includes('negotiation') || q.includes('vendor tips') || q.includes('benchmark')) {
      return `I can help with vendor negotiation strategies. Please provide a vendor name, or visit the Vendors page to see negotiation suggestions for each vendor. You can also ask the AI service directly for detailed industry benchmarks.`;
    }

    return `I understand you're asking about "${query}". For the most accurate answer, please make sure the AI service is running with an OpenAI API key configured. In the meantime, you can ask about subscriptions, approvals, spend, vendors, or negotiation tips.`;
  }
}
