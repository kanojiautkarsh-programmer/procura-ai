import { z } from 'zod';

export const OrganizationSchema = z.object({
  id: z.string().ulid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  logoUrl: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateOrganizationSchema = OrganizationSchema.pick({
  name: true,
  slug: true,
  industry: true,
  size: true,
});

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();

export type Organization = z.infer<typeof OrganizationSchema>;
export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof UpdateOrganizationSchema>;
