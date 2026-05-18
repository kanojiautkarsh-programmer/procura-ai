import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export type Permission =
  | 'spend:view'
  | 'spend:manage'
  | 'invoices:view'
  | 'invoices:upload'
  | 'invoices:manage'
  | 'subscriptions:view'
  | 'subscriptions:manage'
  | 'vendors:view'
  | 'vendors:manage'
  | 'approvals:view'
  | 'approvals:approve'
  | 'approvals:request'
  | 'renewals:view'
  | 'renewals:manage'
  | 'reports:view'
  | 'reports:export'
  | 'settings:view'
  | 'settings:manage'
  | 'users:view'
  | 'users:manage'
  | 'integrations:manage'
  | 'audit:view';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    'spend:view', 'spend:manage',
    'invoices:view', 'invoices:upload', 'invoices:manage',
    'subscriptions:view', 'subscriptions:manage',
    'vendors:view', 'vendors:manage',
    'approvals:view', 'approvals:approve', 'approvals:request',
    'renewals:view', 'renewals:manage',
    'reports:view', 'reports:export',
    'settings:view', 'settings:manage',
    'users:view', 'users:manage',
    'integrations:manage',
    'audit:view',
  ],
  admin: [
    'spend:view', 'spend:manage',
    'invoices:view', 'invoices:upload', 'invoices:manage',
    'subscriptions:view', 'subscriptions:manage',
    'vendors:view', 'vendors:manage',
    'approvals:view', 'approvals:approve', 'approvals:request',
    'renewals:view', 'renewals:manage',
    'reports:view', 'reports:export',
    'settings:view', 'settings:manage',
    'users:view', 'users:manage',
    'integrations:manage',
    'audit:view',
  ],
  finance_manager: [
    'spend:view', 'spend:manage',
    'invoices:view', 'invoices:upload', 'invoices:manage',
    'subscriptions:view', 'subscriptions:manage',
    'vendors:view', 'vendors:manage',
    'approvals:view', 'approvals:approve', 'approvals:request',
    'renewals:view', 'renewals:manage',
    'reports:view', 'reports:export',
    'audit:view',
  ],
  operations_manager: [
    'spend:view',
    'invoices:view', 'invoices:upload',
    'subscriptions:view',
    'vendors:view', 'vendors:manage',
    'approvals:view', 'approvals:approve', 'approvals:request',
    'renewals:view', 'renewals:manage',
    'reports:view',
  ],
  department_head: [
    'spend:view',
    'invoices:view',
    'subscriptions:view',
    'vendors:view',
    'approvals:view', 'approvals:approve', 'approvals:request',
    'renewals:view',
    'reports:view',
  ],
  procurement_manager: [
    'spend:view',
    'invoices:view', 'invoices:upload',
    'vendors:view', 'vendors:manage',
    'approvals:view', 'approvals:request',
    'renewals:view',
    'reports:view',
  ],
  it_admin: [
    'spend:view',
    'subscriptions:view', 'subscriptions:manage',
    'vendors:view',
    'approvals:view', 'approvals:request',
    'renewals:view',
    'reports:view',
    'settings:view',
    'integrations:manage',
  ],
  accounts_payable: [
    'spend:view',
    'invoices:view', 'invoices:upload', 'invoices:manage',
    'vendors:view',
    'approvals:view',
    'renewals:view',
    'reports:view',
  ],
  member: [
    'spend:view',
    'invoices:view',
    'subscriptions:view',
    'vendors:view',
    'approvals:view', 'approvals:request',
    'renewals:view',
  ],
};

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(private readonly prisma: PrismaService) {}

  getPermissionsForRole(role: string): Permission[] {
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.member;
  }

  hasPermission(role: string, permission: Permission): boolean {
    const perms = this.getPermissionsForRole(role);
    return perms.includes(permission);
  }

  async getUserRole(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role ?? null;
  }

  async assertPermission(userId: string, permission: Permission): Promise<boolean> {
    const role = await this.getUserRole(userId);
    if (!role) return false;
    return this.hasPermission(role, permission);
  }
}
