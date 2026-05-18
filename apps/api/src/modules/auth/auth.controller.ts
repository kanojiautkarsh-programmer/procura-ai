import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('webhook')
  async handleClerkWebhook(@Body() payload: unknown) {
    return this.authService.handleWebhook(payload);
  }

  @Get('me')
  @ApiBearerAuth()
  async getCurrentUser() {
    return this.authService.getCurrentUser();
  }
}
