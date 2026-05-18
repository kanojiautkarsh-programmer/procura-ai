import { z } from 'zod';

export const BillingPeriod = z.enum(['monthly', 'quarterly', 'semi_annual', 'annual', 'one_time']);

export const SubscriptionStatus = z.enum(['active', 'trial', 'expired', 'cancelled', 'pending']);

export const SubscriptionSchema = z.object({
  id: z.string().ulid(),
  name: z.string().min(1).max(255),
  vendorId: z.string().ulid(),
  amount: z.number().nonnegative(),
  currency: z.string().default('USD'),
  billingPeriod: BillingPeriod,
  status: SubscriptionStatus,
  startDate: z.date(),
  renewalDate: z.date().optional(),
  cancellationDate: z.date().optional(),
  licenseCount: z.number().int().nonnegative().default(0),
  allocatedLicenses: z.number().int().nonnegative().default(0),
  lastUsedDate: z.date().optional(),
  department: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
  organizationId: z.string().ulid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateSubscriptionSchema = SubscriptionSchema.omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateSubscriptionSchema = CreateSubscriptionSchema.partial();

export type Subscription = z.infer<typeof SubscriptionSchema>;
export type BillingPeriod = z.infer<typeof BillingPeriod>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;
export type CreateSubscription = z.infer<typeof CreateSubscriptionSchema>;
export type UpdateSubscription = z.infer<typeof UpdateSubscriptionSchema>;
