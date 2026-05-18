import { SetMetadata } from '@nestjs/common';
import { PERMISSION_KEY } from '../../modules/rbac/rbac.guard';
import type { Permission } from '../../modules/rbac/rbac.service';

export const RequirePermission = (permission: Permission) => SetMetadata(PERMISSION_KEY, permission);
