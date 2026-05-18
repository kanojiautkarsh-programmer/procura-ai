import { z } from 'zod';

export const InvoiceStatus = z.enum([
  'pending',
  'approved',
  'paid',
  'overdue',
  'cancelled',
  'flagged',
]);

export const InvoiceSchema = z.object({
  id: z.string().ulid(),
  vendorId: z.string().ulid(),
  invoiceNumber: z.string().optional(),
  amount: z.number().nonnegative(),
  taxAmount: z.number().nonnegative().default(0),
  currency: z.string().default('USD'),
  status: InvoiceStatus,
  issueDate: z.date(),
  dueDate: z.date(),
  paidDate: z.date().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  fileUrl: z.string().url().optional(),
  ocrConfidence: z.number().min(0).max(100).optional(),
  isDuplicate: z.boolean().default(false),
  duplicateOfId: z.string().ulid().optional(),
  organizationId: z.string().ulid(),
  createdById: z.string().ulid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateInvoiceSchema = InvoiceSchema.omit({
  id: true,
  organizationId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  ocrConfidence: true,
  isDuplicate: true,
  duplicateOfId: true,
});

export const UpdateInvoiceSchema = CreateInvoiceSchema.partial();

export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceStatus = z.infer<typeof InvoiceStatus>;
export type CreateInvoice = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoice = z.infer<typeof UpdateInvoiceSchema>;
