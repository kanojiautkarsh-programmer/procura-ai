import { z } from 'zod';

export const VendorCategory = z.enum([
  'software',
  'hardware',
  'professional_services',
  'marketing',
  'office_supplies',
  'travel',
  'utilities',
  'insurance',
  'other',
]);

export const VendorSchema = z.object({
  id: z.string().ulid(),
  name: z.string().min(1).max(255),
  category: VendorCategory,
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  website: z.string().url().optional(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  organizationId: z.string().ulid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateVendorSchema = VendorSchema.omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateVendorSchema = CreateVendorSchema.partial();

export type Vendor = z.infer<typeof VendorSchema>;
export type VendorCategory = z.infer<typeof VendorCategory>;
export type CreateVendor = z.infer<typeof CreateVendorSchema>;
export type UpdateVendor = z.infer<typeof UpdateVendorSchema>;
