import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RenewalsService } from './renewals.service';

@ApiTags('renewals')
@ApiBearerAuth()
@Controller('renewals')
export class RenewalsController {
  constructor(private readonly renewalsService: RenewalsService) {}

  @Get()
  async findAll(
    @Query('organizationId') organizationId: string,
    @Query('days') days = 30,
  ) {
    return this.renewalsService.findUpcoming(organizationId, days);
  }

  @Get('calendar')
  async getCalendar(@Query('organizationId') organizationId: string) {
    return this.renewalsService.getCalendar(organizationId);
  }

  @Patch(':id/acknowledge')
  async acknowledge(@Param('id') id: string) {
    return this.renewalsService.acknowledge(id);
  }
}
