import { Controller, Get, Post, Body, Headers, Req, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../../common/auth/auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('webhook')
  @Public()
  async handleClerkWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    const rawBody = (req as any).rawBody?.toString();
    return this.authService.handleWebhook(req.body, { svixId, svixTimestamp, svixSignature }, rawBody);
  }

  @Get('me')
  async getCurrentUser(@Req() req: Request) {
    const clerkId = (req as any).user?.clerkId;
    return this.authService.getCurrentUser(clerkId);
  }
}
