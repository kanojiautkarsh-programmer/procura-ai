import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async findAll(
    @Query('organizationId') organizationId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.invoicesService.findAll(organizationId, { page, limit, status });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Post()
  async create(@Body() data: unknown) {
    return this.invoicesService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: unknown) {
    return this.invoicesService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }

  @Post('upload')
  async uploadInvoice() {
    // TODO: Handle invoice PDF upload with OCR queue job
    return { message: 'Upload endpoint ready' };
  }
}
