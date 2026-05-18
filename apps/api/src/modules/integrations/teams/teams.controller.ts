import { Controller, Post, Get, Body, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TeamsService } from './teams.service';

@ApiTags('integrations')
@ApiBearerAuth()
@Controller('integrations/teams')
export class TeamsController {
  private readonly logger = new Logger(TeamsController.name);

  constructor(private readonly teamsService: TeamsService) {}

  @Get('manifest')
  getManifest() {
    return this.teamsService.getManifest();
  }

  @Post('connect')
  async connect(@Body() body: { organizationId: string }) {
    return this.teamsService.connect(body.organizationId);
  }

  @Post('disconnect')
  async disconnect(@Body() body: { organizationId: string }) {
    return this.teamsService.disconnect(body.organizationId);
  }

  @Get('status')
  async getStatus(@Query('organizationId') organizationId: string) {
    return this.teamsService.getStatus(organizationId);
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    return this.teamsService.handleActivity(body);
  }
}
