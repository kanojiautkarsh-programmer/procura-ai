import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  getManifest() {
    return {
      $schema: 'https://developer.microsoft.com/en-us/json-schemas/teams/v1.15/MicrosoftTeams.schema.json',
      manifestVersion: '1.15',
      version: '1.0.0',
      id: 'procura-ai',
      name: { short: 'Procura AI', full: 'Procura AI Spend Intelligence' },
      description: {
        short: 'AI-powered spend intelligence',
        full: 'Manage approvals, view spend, and track subscriptions directly in Teams.',
      },
      icons: { outline: 'outline.png', color: 'color.png' },
      accentColor: '#0F172A',
      commands: [
        {
          id: 'approvals',
          type: 'command',
          title: 'Approvals',
          description: 'View pending approvals',
          initialRun: true,
          context: ['compose', 'commandBox'],
        },
        {
          id: 'spend',
          type: 'command',
          title: 'Spend',
          description: 'View recent spend',
          initialRun: true,
          context: ['compose', 'commandBox'],
        },
        {
          id: 'subscriptions',
          type: 'command',
          title: 'Subscriptions',
          description: 'View active subscriptions',
          initialRun: true,
          context: ['compose', 'commandBox'],
        },
      ],
      messageHandlers: [
        {
          type: 'task',
          id: 'approvalAction',
          title: 'Approve or Reject',
          description: 'Take action on approval requests',
        },
      ],
    };
  }

  async connect(organizationId: string) {
    this.logger.log(`Connecting Teams for org ${organizationId}`);
    // TODO: Register bot with Microsoft Teams via Azure Bot Service
    // Provision bot endpoint, register messaging extension
    return { connected: true, organizationId };
  }

  async disconnect(organizationId: string) {
    this.logger.log(`Disconnecting Teams for org ${organizationId}`);
    return { disconnected: true, organizationId };
  }

  async getStatus(organizationId: string) {
    return { connected: false, organizationId, botId: null };
  }

  async handleActivity(body: any) {
    this.logger.log(`Received Teams activity: ${body?.type}`);
    // Handle adaptive card actions, message extensions, task module fetches
    const type = body?.type;
    switch (type) {
      case 'message':
        return this.handleMessage(body);
      case 'command':
        return this.handleCommand(body);
      case 'task/fetch':
        return this.handleTaskFetch(body);
      case 'task/submit':
        return this.handleTaskSubmit(body);
      default:
        return { status: 200 };
    }
  }

  private async handleMessage(body: any) {
    const text = body?.text?.toLowerCase() || '';
    if (text.includes('approve')) return this.buildApprovalsCard();
    if (text.includes('spend')) return this.buildSpendCard();
    if (text.includes('subscription')) return this.buildSubscriptionsCard();
    return {
      type: 'message',
      text: 'Try: approvals, spend, subscriptions',
    };
  }

  private async handleCommand(body: any) {
    const commandId = body?.commandId;
    switch (commandId) {
      case 'approvals':
        return this.buildApprovalsCard();
      case 'spend':
        return this.buildSpendCard();
      case 'subscriptions':
        return this.buildSubscriptionsCard();
      default:
        return { type: 'message', text: 'Unknown command' };
    }
  }

  private async handleTaskFetch(body: any) {
    const task = body?.task;
    if (task === 'approvalAction') {
      return {
        task: {
          type: 'continue',
          value: {
            title: 'Approval Action',
            card: this.buildApprovalActionCard(body?.approvalId),
          },
        },
      };
    }
    return { task: { type: 'continue', value: { title: 'Procura AI', card: {} } } };
  }

  private async handleTaskSubmit(body: any) {
    const action = body?.data?.action;
    const approvalId = body?.data?.approvalId;
    if (action && approvalId) {
      this.logger.log(`Teams approval action: ${action} on ${approvalId}`);
      // TODO: Process approval action
    }
    return { task: { type: 'message', value: 'Action recorded' } };
  }

  private buildApprovalsCard() {
    return {
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.5',
      body: [
        {
          type: 'TextBlock',
          size: 'Medium',
          weight: 'Bolder',
          text: 'Pending Approvals',
        },
        {
          type: 'TextBlock',
          text: 'You have no pending approvals.',
          wrap: true,
        },
      ],
      actions: [
        {
          type: 'Action.OpenUrl',
          title: 'View All in Procura',
          url: 'https://procura.ai/approvals',
        },
      ],
    };
  }

  private buildSpendCard() {
    return {
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.5',
      body: [
        {
          type: 'TextBlock',
          size: 'Medium',
          weight: 'Bolder',
          text: 'Recent Spend',
        },
        {
          type: 'TextBlock',
          text: 'Monthly spend data available in dashboard.',
          wrap: true,
        },
      ],
      actions: [
        {
          type: 'Action.OpenUrl',
          title: 'Open Dashboard',
          url: 'https://procura.ai/dashboard',
        },
      ],
    };
  }

  private buildSubscriptionsCard() {
    return {
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.5',
      body: [
        {
          type: 'TextBlock',
          size: 'Medium',
          weight: 'Bolder',
          text: 'Active Subscriptions',
        },
        {
          type: 'TextBlock',
          text: 'View and manage subscriptions in Procura.',
          wrap: true,
        },
      ],
      actions: [
        {
          type: 'Action.OpenUrl',
          title: 'Manage Subscriptions',
          url: 'https://procura.ai/subscriptions',
        },
      ],
    };
  }

  private buildApprovalActionCard(approvalId: string) {
    return {
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.5',
      body: [
        {
          type: 'TextBlock',
          size: 'Medium',
          weight: 'Bolder',
          text: 'Approve or Reject',
        },
        {
          type: 'FactSet',
          facts: [{ title: 'Request ID:', value: approvalId || 'N/A' }],
        },
      ],
      actions: [
        {
          type: 'Action.Submit',
          title: 'Approve',
          data: { action: 'approved', approvalId, msTeams: { action: 'submit' } },
        },
        {
          type: 'Action.Submit',
          title: 'Reject',
          data: { action: 'rejected', approvalId, msTeams: { action: 'submit' } },
        },
      ],
    };
  }
}
