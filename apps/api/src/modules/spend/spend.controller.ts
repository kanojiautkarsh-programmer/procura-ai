import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SpendService } from './spend.service';

@ApiTags('spend')
@ApiBearerAuth()
@Controller('spend')
export class SpendController {
  constructor(private readonly spendService: SpendService) {}

  @Get('summary')
  async getSummary(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.spendService.getSummary(organizationId, { startDate, endDate });
  }

  @Get('trends')
  async getTrends(
    @Query('organizationId') organizationId: string,
    @Query('months') months?: number,
  ) {
    return this.spendService.getTrends(organizationId, months);
  }

  @Get('categories')
  async getCategoryBreakdown(@Query('organizationId') organizationId: string) {
    return this.spendService.getCategoryBreakdown(organizationId);
  }

  @Get('departments')
  async getDepartmentBreakdown(@Query('organizationId') organizationId: string) {
    return this.spendService.getDepartmentBreakdown(organizationId);
  }
}
