import { z } from 'zod';

export const UserRole = z.enum([
  'owner',
  'admin',
  'finance_manager',
  'operations_manager',
  'department_head',
  'procurement_manager',
  'it_admin',
  'accounts_payable',
  'member',
]);

export const UserSchema = z.object({
  id: z.string().ulid(),
  clerkId: z.string(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  avatarUrl: z.string().url().optional(),
  role: UserRole,
  organizationId: z.string().ulid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  role: UserRole.optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRole>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
