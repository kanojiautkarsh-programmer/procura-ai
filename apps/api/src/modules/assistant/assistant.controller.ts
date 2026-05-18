import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AssistantService } from './assistant.service';

@ApiTags('assistant')
@ApiBearerAuth()
@Controller('assistant')
export class AssistantController {
  private readonly logger = new Logger(AssistantController.name);

  constructor(private readonly assistantService: AssistantService) {}

  @Post('ask')
  async ask(@Body() body: { query: string; organizationId: string }) {
    const answer = await this.assistantService.ask(body.query, body.organizationId);
    return { answer };
  }
}
