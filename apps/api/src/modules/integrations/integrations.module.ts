import { Module } from '@nestjs/common';
import { SlackModule } from './slack/slack.module';

@Module({
  imports: [SlackModule],
  exports: [SlackModule],
})
export class IntegrationsModule {}
