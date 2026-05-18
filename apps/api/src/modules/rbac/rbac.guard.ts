import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService, type Permission } from './rbac.service';

export const PERMISSION_KEY = 'permission';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<Permission>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    const hasPermission = await this.rbacService.assertPermission(userId, permission);
    if (!hasPermission) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }

    return true;
  }
}
