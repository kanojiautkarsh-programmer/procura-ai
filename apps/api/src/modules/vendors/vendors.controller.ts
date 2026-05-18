import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';

@ApiTags('vendors')
@ApiBearerAuth()
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  async findAll(
    @Query('organizationId') organizationId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.vendorsService.findAll(organizationId, { page, limit });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Post()
  async create(@Body() data: unknown) {
    return this.vendorsService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: unknown) {
    return this.vendorsService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.vendorsService.remove(id);
  }
}
