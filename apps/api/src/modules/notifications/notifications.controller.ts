import { Controller, Get, Put, Delete, Post, Body, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(@Query('organizationId') organizationId: string, @Query('unreadOnly') unreadOnly?: string) {
    return this.notificationsService.findByOrg(organizationId, 50, unreadOnly === 'true');
  }

  @Get('user/:userId')
  async byUser(@Param('userId') userId: string, @Query('organizationId') organizationId: string) {
    return this.notificationsService.findByUser(userId, organizationId);
  }

  @Get('unread-count')
  async unreadCount(@Query('organizationId') organizationId: string, @Query('userId') userId: string) {
    const count = await this.notificationsService.getUnreadCount(organizationId, userId);
    return { count };
  }

  @Put(':id/read')
  async markRead(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.notificationsService.markRead(id, body.userId);
  }

  @Put('read-all')
  async markAllRead(@Body() body: { organizationId: string; userId: string }) {
    return this.notificationsService.markAllRead(body.organizationId, body.userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.notificationsService.delete(id, body.userId);
  }
}
