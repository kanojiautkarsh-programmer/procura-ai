import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  private readonly logger = new Logger(AuditController.name);

  constructor(private readonly auditService: AuditService) {}

  @Get()
  async list(@Query('organizationId') organizationId: string, @Query('limit') limit?: string) {
    if (!organizationId) return { data: [] };
    const data = await this.auditService.findByOrganization(organizationId, limit ? parseInt(limit, 10) : 100);
    return { data };
  }

  @Get('entity/:entityType/:entityId')
  async byEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.auditService.findByEntity(entityType, entityId, limit ? parseInt(limit, 10) : 50);
    return { data };
  }

  @Get('user/:userId')
  async byUser(@Param('userId') userId: string, @Query('limit') limit?: string) {
    const data = await this.auditService.findByUser(userId, limit ? parseInt(limit, 10) : 50);
    return { data };
  }
}
