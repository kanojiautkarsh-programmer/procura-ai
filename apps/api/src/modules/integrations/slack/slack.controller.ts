import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SlackService, SlackMessage } from './slack.service';

@ApiTags('integrations')
@Controller('integrations/slack')
export class SlackController {
  private readonly logger = new Logger(SlackController.name);

  constructor(private readonly slackService: SlackService) {}

  @Post('events')
  async handleEvent(@Body() body: any) {
    // Slack URL verification challenge
    if (body.type === 'url_verification') {
      return { challenge: body.challenge };
    }
    return this.slackService.handleEvent(body);
  }

  @Post('interactions')
  async handleInteraction(@Body('payload') payloadRaw: string) {
    const payload = JSON.parse(payloadRaw);
    return this.slackService.handleInteraction(payload);
  }

  @Post('commands/approvals')
  async handleApprovalsCommand(@Body() body: any) {
    return this.slackService.handleApprovalsCommand(body);
  }

  @Post('commands/spend')
  async handleSpendCommand(@Body() body: any) {
    return this.slackService.handleSpendCommand(body);
  }

  @Post('notify')
  async sendNotification(@Body() body: { channelId: string; text: string; blocks?: any[] }) {
    return this.slackService.sendMessage(body.channelId, body.text, body.blocks);
  }
}
