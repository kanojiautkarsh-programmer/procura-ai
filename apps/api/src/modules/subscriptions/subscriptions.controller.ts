import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { Audit } from '../../common/audit/audit.decorator';
import { createSubscriptionSchema, updateSubscriptionSchema } from '../../common/validation/schemas';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    const orgId = (req as any).user?.organizationId;
    return this.subscriptionsService.findAll(orgId, { page, limit, status });
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const orgId = (req as any).user?.organizationId;
    return this.subscriptionsService.findOne(id, orgId);
  }

  @Post()
  @Audit({ action: 'created', entityType: 'subscription' })
  async create(@Req() req: Request, @Body(new ZodValidationPipe(createSubscriptionSchema)) data: any) {
    return this.subscriptionsService.create({ ...data, organizationId: (req as any).user?.organizationId });
  }

  @Patch(':id')
  @Audit({ action: 'updated', entityType: 'subscription', entityIdParam: 'id' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSubscriptionSchema)) data: any,
  ) {
    const orgId = (req as any).user?.organizationId;
    return this.subscriptionsService.update(id, data, orgId);
  }

  @Delete(':id')
  @Audit({ action: 'deleted', entityType: 'subscription', entityIdParam: 'id' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    const orgId = (req as any).user?.organizationId;
    return this.subscriptionsService.remove(id, orgId);
  }
}
