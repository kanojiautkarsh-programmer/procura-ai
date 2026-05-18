import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './modules/auth/auth.module';
import { SpendModule } from './modules/spend/spend.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { RenewalsModule } from './modules/renewals/renewals.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ForecastingModule } from './modules/forecasting/forecasting.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { AuditModule } from './common/audit/audit.module';
import { EncryptionModule } from './common/encryption/encryption.module';
import { ClerkAuthModule } from './common/auth/auth.module';
import { ByokModule } from './modules/byok/byok.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

import { PrismaModule } from './common/prisma/prisma.module';
import { QueueModule } from './common/queue/queue.module';
import { StorageModule } from './common/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60000, limit: 100 }],
    }),
    ScheduleModule.forRoot(),

    PrismaModule,
    QueueModule,
    StorageModule,

    AuthModule,
    SpendModule,
    InvoicesModule,
    ApprovalsModule,
    RenewalsModule,
    VendorsModule,
    SubscriptionsModule,
    ContractsModule,
    AssistantModule,
    IntegrationsModule,
    ForecastingModule,
    RbacModule,
    AuditModule,
    EncryptionModule,
    ClerkAuthModule,
    ByokModule,
    NotificationsModule,
    WebhooksModule,
  ],
})
export class AppModule {}
