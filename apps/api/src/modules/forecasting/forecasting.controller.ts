import { Controller, Get, Post, Body, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ForecastingService } from './forecasting.service';

@ApiTags('forecast')
@ApiBearerAuth()
@Controller('forecast')
export class ForecastingController {
  private readonly logger = new Logger(ForecastingController.name);

  constructor(private readonly forecastingService: ForecastingService) {}

  @Get('monthly')
  async getMonthlyData(
    @Query('organizationId') organizationId: string,
    @Query('months') months = 12,
  ) {
    return this.forecastingService.getMonthlySpend(organizationId, months);
  }

  @Get('projection')
  async getProjection(
    @Query('organizationId') organizationId: string,
    @Query('months') months = 3,
  ) {
    return this.forecastingService.getProjection(organizationId, months);
  }

  @Get('budget-status')
  async getBudgetStatus(@Query('organizationId') organizationId: string) {
    return this.forecastingService.getBudgetStatus(organizationId);
  }

  @Post('scenario')
  async runScenario(@Body() body: {
    organizationId: string;
    growthRate?: number;
    costCuts?: { name: string; monthlySavings: number }[];
    months?: number;
  }) {
    return this.forecastingService.runScenario(body);
  }
}
