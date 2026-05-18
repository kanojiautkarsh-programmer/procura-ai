import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RbacService } from './rbac.service';
import { RbacGuard } from './rbac.guard';

@Global()
@Module({
  providers: [
    RbacService,
    RbacGuard,
    { provide: APP_GUARD, useClass: RbacGuard },
  ],
  exports: [RbacService, RbacGuard],
})
export class RbacModule {}
