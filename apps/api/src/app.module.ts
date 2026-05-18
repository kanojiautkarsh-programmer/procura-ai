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
  ],
})
export class AppModule {}
