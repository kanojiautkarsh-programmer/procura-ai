import { Module } from '@nestjs/common';
import { SlackModule } from './slack/slack.module';
import { EmailModule } from './email/email.module';
import { TeamsModule } from './teams/teams.module';
import { AccountingModule } from './accounting/accounting.module';

@Module({
  imports: [SlackModule, EmailModule, TeamsModule, AccountingModule],
  exports: [SlackModule, EmailModule, TeamsModule, AccountingModule],
})
export class IntegrationsModule {}
