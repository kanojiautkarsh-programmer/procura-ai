import { z } from 'zod';

export const ApprovalStatus = z.enum(['pending', 'approved', 'rejected', 'escalated']);

export const ApprovalLevel = z.enum(['level_1', 'level_2', 'level_3']);

export const ApprovalRequestSchema = z.object({
  id: z.string().ulid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  amount: z.number().nonnegative(),
  currency: z.string().default('USD'),
  status: ApprovalStatus,
  level: ApprovalLevel,
  department: z.string().optional(),
  requestedById: z.string().ulid(),
  approvedById: z.string().ulid().optional(),
  vendorId: z.string().ulid().optional(),
  notes: z.string().optional(),
  organizationId: z.string().ulid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateApprovalRequestSchema = ApprovalRequestSchema.omit({
  id: true,
  status: true,
  level: true,
  approvedById: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
});

export const ApprovalActionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  notes: z.string().optional(),
});

export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;
export type ApprovalStatus = z.infer<typeof ApprovalStatus>;
export type ApprovalLevel = z.infer<typeof ApprovalLevel>;
export type CreateApprovalRequest = z.infer<typeof CreateApprovalRequestSchema>;
export type ApprovalAction = z.infer<typeof ApprovalActionSchema>;
