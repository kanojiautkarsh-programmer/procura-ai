import { Controller, Post, Get, Delete, Body, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';

@ApiTags('integrations')
@ApiBearerAuth()
@Controller('integrations/accounting')
export class AccountingController {
  private readonly logger = new Logger(AccountingController.name);

  constructor(private readonly accountingService: AccountingService) {}

  @Post('quickbooks/connect')
  async connectQuickBooks(@Body() body: { code: string; organizationId: string; realmId: string }) {
    return this.accountingService.connectQuickBooks(body.code, body.organizationId, body.realmId);
  }

  @Post('xero/connect')
  async connectXero(@Body() body: { code: string; organizationId: string; tenantId: string }) {
    return this.accountingService.connectXero(body.code, body.organizationId, body.tenantId);
  }

  @Post('quickbooks/export/invoices')
  async exportInvoicesToQuickBooks(@Body() body: { organizationId: string; invoiceIds: string[] }) {
    return this.accountingService.exportInvoicesToQuickBooks(body.organizationId, body.invoiceIds);
  }

  @Post('xero/export/invoices')
  async exportInvoicesToXero(@Body() body: { organizationId: string; invoiceIds: string[] }) {
    return this.accountingService.exportInvoicesToXero(body.organizationId, body.invoiceIds);
  }

  @Post('quickbooks/export/subscriptions')
  async exportSubscriptionsToQuickBooks(@Body() body: { organizationId: string; subscriptionIds: string[] }) {
    return this.accountingService.exportSubscriptionsToQuickBooks(body.organizationId, body.subscriptionIds);
  }

  @Post('xero/export/subscriptions')
  async exportSubscriptionsToXero(@Body() body: { organizationId: string; subscriptionIds: string[] }) {
    return this.accountingService.exportSubscriptionsToXero(body.organizationId, body.subscriptionIds);
  }

  @Post('quickbooks/sync')
  async syncFromQuickBooks(@Body() body: { organizationId: string }) {
    return this.accountingService.syncFromQuickBooks(body.organizationId);
  }

  @Post('xero/sync')
  async syncFromXero(@Body() body: { organizationId: string }) {
    return this.accountingService.syncFromXero(body.organizationId);
  }

  @Get('connections')
  async listConnections(@Query('organizationId') organizationId: string) {
    return this.accountingService.listConnections(organizationId);
  }

  @Delete('connections/:id')
  async removeConnection(@Param('id') id: string) {
    return this.accountingService.removeConnection(id);
  }

  @Get('mapping')
  async getMapping(@Query('organizationId') organizationId: string) {
    return this.accountingService.getMapping(organizationId);
  }

  @Post('mapping')
  async updateMapping(@Body() body: {
    organizationId: string;
    chartOfAccounts: any[];
    vendorMapping: any[];
    categoryMapping: any[];
  }) {
    return this.accountingService.updateMapping(body);
  }
}
