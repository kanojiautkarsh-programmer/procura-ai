import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface WebhookHeaders {
  svixId: string;
  svixTimestamp: string;
  svixSignature: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handleWebhook(payload: any, headers: WebhookHeaders) {
    const event = payload?.type;
    const data = payload?.data;

    if (!event || !data) {
      return { received: true };
    }

    switch (event) {
      case 'user.created':
      case 'user.updated':
        await this.syncUser(data);
        break;
      case 'user.deleted':
        await this.removeUser(data.id);
        break;
      case 'organization.created':
      case 'organization.updated':
        await this.syncOrganization(data);
        break;
      case 'organization.deleted':
        await this.removeOrganization(data.id);
        break;
      default:
        this.logger.debug(`Unhandled webhook event: ${event}`);
    }

    return { received: true };
  }

  private async syncUser(data: any) {
    const clerkId = data.id;
    const email = data.email_addresses?.[0]?.email_address;
    const name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username || 'Unknown';
    const avatarUrl = data.image_url;

    // Find org from user's primary org membership
    const orgMembership = data.organization_memberships?.[0];
    let organizationId = data.primary_organization_id || orgMembership?.organization?.id;

    // Try to find existing user
    const existingUser = await this.prisma.user.findUnique({ where: { clerkId } });

    if (existingUser) {
      return this.prisma.user.update({
        where: { clerkId },
        data: {
          email,
          name,
          avatarUrl,
          ...(organizationId ? { organizationId } : {}),
        },
      });
    }

    // If no org yet, create a personal org
    if (!organizationId) {
      const org = await this.prisma.organization.create({
        data: {
          name: `${name}'s Organization`,
          slug: `org-${clerkId.slice(-8)}`,
        },
      });
      organizationId = org.id;
    }

    return this.prisma.user.create({
      data: {
        clerkId,
        email,
        name,
        avatarUrl,
        organizationId,
        role: 'member',
      },
    });
  }

  private async removeUser(clerkId: string) {
    try {
      await this.prisma.user.delete({ where: { clerkId } });
    } catch {
      this.logger.warn(`User ${clerkId} not found for deletion`);
    }
  }

  private async syncOrganization(data: any) {
    const clerkOrgId = data.id;
    const existingUser = await this.prisma.user.findFirst({
      where: { clerkId: data.created_by },
    });

    if (!existingUser) return;

    const existingOrg = await this.prisma.organization.findFirst({
      where: { users: { some: { clerkId: data.created_by } } },
    });

    if (existingOrg) {
      return this.prisma.organization.update({
        where: { id: existingOrg.id },
        data: {
          name: data.name,
          slug: data.slug,
        },
      });
    }

    return this.prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    });
  }

  private async removeOrganization(clerkOrgId: string) {
    // Organizations are referenced by users, so we soft-track by slug
    this.logger.log(`Organization ${clerkOrgId} deleted in Clerk`);
  }

  async getCurrentUser() {
    return { message: 'Pending Clerk JWT integration' };
  }
}
