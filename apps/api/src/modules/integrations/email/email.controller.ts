import { Controller, Post, Get, Delete, Body, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';

@ApiTags('integrations')
@ApiBearerAuth()
@Controller('integrations/email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  @Post('gmail/connect')
  async connectGmail(@Body() body: { code: string; organizationId: string }) {
    return this.emailService.connectGmail(body.code, body.organizationId);
  }

  @Post('outlook/connect')
  async connectOutlook(@Body() body: { code: string; organizationId: string }) {
    return this.emailService.connectOutlook(body.code, body.organizationId);
  }

  @Post('gmail/sync')
  async syncGmail(@Body() body: { organizationId: string }) {
    return this.emailService.syncGmailInbox(body.organizationId);
  }

  @Post('outlook/sync')
  async syncOutlook(@Body() body: { organizationId: string }) {
    return this.emailService.syncOutlookInbox(body.organizationId);
  }

  @Get('connections')
  async listConnections(@Query('organizationId') organizationId: string) {
    return this.emailService.listConnections(organizationId);
  }

  @Delete('connections/:id')
  async removeConnection(@Param('id') id: string) {
    return this.emailService.removeConnection(id);
  }

  @Post('rules')
  async createRule(@Body() body: {
    organizationId: string;
    name: string;
    conditions: any;
    actions: any;
  }) {
    return this.emailService.createRule(body);
  }

  @Get('rules')
  async listRules(@Query('organizationId') organizationId: string) {
    return this.emailService.listRules(organizationId);
  }
}
