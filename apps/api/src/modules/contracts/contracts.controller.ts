import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { Audit } from '../../common/audit/audit.decorator';
import { createContractSchema, updateContractSchema } from '../../common/validation/schemas';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';

@ApiTags('contracts')
@ApiBearerAuth()
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    const orgId = (req as any).user?.organizationId;
    return this.contractsService.findAll(orgId, { page, limit, status });
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const orgId = (req as any).user?.organizationId;
    return this.contractsService.findOne(id, orgId);
  }

  @Post()
  @Audit({ action: 'created', entityType: 'contract' })
  async create(@Req() req: Request, @Body(new ZodValidationPipe(createContractSchema)) data: any) {
    const userId = (req as any).user?.id;
    return this.contractsService.create({ ...data, organizationId: (req as any).user?.organizationId, createdById: userId });
  }

  @Patch(':id')
  @Audit({ action: 'updated', entityType: 'contract', entityIdParam: 'id' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateContractSchema)) data: any,
  ) {
    const orgId = (req as any).user?.organizationId;
    return this.contractsService.update(id, data, orgId);
  }

  @Delete(':id')
  @Audit({ action: 'deleted', entityType: 'contract', entityIdParam: 'id' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    const orgId = (req as any).user?.organizationId;
    return this.contractsService.remove(id, orgId);
  }
}
