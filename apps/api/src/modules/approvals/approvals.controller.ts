import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';
import { Audit } from '../../common/audit/audit.decorator';
import { createApprovalSchema, approveActionSchema } from '../../common/validation/schemas';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';

@ApiTags('approvals')
@ApiBearerAuth()
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    const orgId = (req as any).user?.organizationId;
    return this.approvalsService.findAll(orgId, { page, limit, status });
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const orgId = (req as any).user?.organizationId;
    return this.approvalsService.findOne(id, orgId);
  }

  @Post()
  @Audit({ action: 'created', entityType: 'approval' })
  async create(@Req() req: Request, @Body(new ZodValidationPipe(createApprovalSchema)) data: any) {
    data.requestedById = (req as any).user?.id;
    return this.approvalsService.create(data);
  }

  @Patch(':id/action')
  @Audit({ action: 'updated', entityType: 'approval', entityIdParam: 'id' })
  async action(
    @Req() req: Request,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(approveActionSchema)) body: any,
  ) {
    const userId = (req as any).user?.id;
    const orgId = (req as any).user?.organizationId;
    return this.approvalsService.approve(id, userId, body.action, body.notes, orgId);
  }

  @Delete(':id')
  @Audit({ action: 'deleted', entityType: 'approval', entityIdParam: 'id' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    const orgId = (req as any).user?.organizationId;
    return this.approvalsService.remove(id, orgId);
  }
}
