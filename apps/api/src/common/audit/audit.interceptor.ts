import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';
import { AUDIT_KEY, type AuditOptions } from './audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.getAllAndOverride<AuditOptions>(AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!auditOptions) return next.handle();

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || 'system';
    const organizationId = request.user?.organizationId || request.body?.organizationId || 'unknown';

    let entityId = '';
    if (auditOptions.entityIdParam) {
      entityId = request.params[auditOptions.entityIdParam] || '';
    }

    return next.handle().pipe(
      tap(() => {
        this.auditService.log({
          action: auditOptions.action,
          entityType: auditOptions.entityType,
          entityId,
          userId,
          organizationId,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        });
      }),
    );
  }
}
