import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { Audit } from '../../common/audit/audit.decorator';
import { createVendorSchema, updateVendorSchema } from '../../common/validation/schemas';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';

@ApiTags('vendors')
@ApiBearerAuth()
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  async findAll(@Req() req: Request, @Query('page') page = 1, @Query('limit') limit = 20) {
    const orgId = (req as any).user?.organizationId;
    return this.vendorsService.findAll(orgId, { page, limit });
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const orgId = (req as any).user?.organizationId;
    return this.vendorsService.findOne(id, orgId);
  }

  @Post()
  @Audit({ action: 'created', entityType: 'vendor' })
  async create(@Req() req: Request, @Body(new ZodValidationPipe(createVendorSchema)) data: any) {
    return this.vendorsService.create(data);
  }

  @Patch(':id')
  @Audit({ action: 'updated', entityType: 'vendor', entityIdParam: 'id' })
  async update(
    @Req() req: Request, @Param('id') id: string,
    @Body(new ZodValidationPipe(updateVendorSchema)) data: any,
  ) {
    const orgId = (req as any).user?.organizationId;
    return this.vendorsService.update(id, data, orgId);
  }

  @Delete(':id')
  @Audit({ action: 'deleted', entityType: 'vendor', entityIdParam: 'id' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    const orgId = (req as any).user?.organizationId;
    return this.vendorsService.remove(id, orgId);
  }
}
