import { Controller, Get, Post, Delete, Put, Body, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ByokService, type ApiKeyProvider } from './byok.service';

@ApiTags('byok')
@ApiBearerAuth()
@Controller('byok')
export class ByokController {
  private readonly logger = new Logger(ByokController.name);

  constructor(private readonly byokService: ByokService) {}

  @Post('keys')
  async setKey(@Body() body: { organizationId: string; provider: ApiKeyProvider; key: string }) {
    return this.byokService.setKey(body.organizationId, body.provider, body.key);
  }

  @Get('keys')
  async getKeys(@Query('organizationId') organizationId: string) {
    return this.byokService.getKeys(organizationId);
  }

  @Get('keys/:provider')
  async getKey(@Query('organizationId') organizationId: string, @Param('provider') provider: string) {
    const key = await this.byokService.getDecryptedKey(organizationId, provider as ApiKeyProvider);
    return { provider, hasKey: key !== null };
  }

  @Delete('keys/:provider')
  async deleteKey(@Query('organizationId') organizationId: string, @Param('provider') provider: string) {
    return this.byokService.deleteKey(organizationId, provider as ApiKeyProvider);
  }

  @Put('keys/:provider/toggle')
  async toggleKey(
    @Query('organizationId') organizationId: string,
    @Param('provider') provider: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.byokService.toggleKey(organizationId, provider as ApiKeyProvider, body.isActive);
  }
}
