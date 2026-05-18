import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  async handleWebhook(payload: unknown): Promise<{ received: boolean }> {
    this.logger.log('Received auth webhook');
    return { received: true };
  }

  async getCurrentUser() {
    // TODO: Extract user from Clerk JWT and return DB record
    return null;
  }
}
