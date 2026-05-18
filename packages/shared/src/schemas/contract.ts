import { z } from 'zod';

export const ContractStatus = z.enum(['active', 'expiring_soon', 'expired', 'cancelled', 'draft']);

export const ContractSchema = z.object({
  id: z.string().ulid(),
  vendorId: z.string().ulid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  renewalDate: z.date().optional(),
  autoRenew: z.boolean().default(false),
  value: z.number().nonnegative().optional(),
  status: ContractStatus,
  fileUrl: z.string().url().optional(),
  notes: z.string().optional(),
  organizationId: z.string().ulid(),
  createdById: z.string().ulid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateContractSchema = ContractSchema.omit({
  id: true,
  organizationId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateContractSchema = CreateContractSchema.partial();

export type Contract = z.infer<typeof ContractSchema>;
export type ContractStatus = z.infer<typeof ContractStatus>;
export type CreateContract = z.infer<typeof CreateContractSchema>;
export type UpdateContract = z.infer<typeof UpdateContractSchema>;
