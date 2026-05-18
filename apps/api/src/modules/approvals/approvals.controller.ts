import {
  Controller, Get, Post, Patch, Param, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';

@ApiTags('approvals')
@ApiBearerAuth()
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  async findAll(
    @Query('organizationId') organizationId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.approvalsService.findAll(organizationId, { page, limit, status });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.approvalsService.findOne(id);
  }

  @Post()
  async create(@Body() data: unknown) {
    return this.approvalsService.create(data);
  }

  @Patch(':id/action')
  async takeAction(
    @Param('id') id: string,
    @Body() action: { status: 'approved' | 'rejected'; notes?: string },
  ) {
    return this.approvalsService.takeAction(id, action);
  }
}
