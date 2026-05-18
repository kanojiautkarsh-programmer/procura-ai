import { Controller, Get, Post, Put, Delete, Body, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@ApiBearerAuth()
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('endpoints')
  async createEndpoint(@Body() body: { organizationId: string; url: string; events: string[]; secret?: string }) {
    return this.webhooksService.createEndpoint(body);
  }

  @Get('endpoints')
  async listEndpoints(@Query('organizationId') organizationId: string) {
    return this.webhooksService.listEndpoints(organizationId);
  }

  @Put('endpoints/:id')
  async updateEndpoint(@Param('id') id: string, @Body() body: { url?: string; events?: string[]; isActive?: boolean }) {
    return this.webhooksService.updateEndpoint(id, body);
  }

  @Delete('endpoints/:id')
  async deleteEndpoint(@Param('id') id: string) {
    return this.webhooksService.deleteEndpoint(id);
  }

  @Post('trigger')
  async trigger(@Body() body: { organizationId: string; event: string; payload: any }) {
    return this.webhooksService.trigger(body.organizationId, body.event, body.payload);
  }
}
