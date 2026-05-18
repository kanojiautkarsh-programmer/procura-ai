import { z } from 'zod';

// Organization-scoped ID helper
export const orgIdParam = z.object({ organizationId: z.string().min(1) });

// Invoices
export const createInvoiceSchema = z.object({
  vendorId: z.string().min(1),
  invoiceNumber: z.string().optional(),
  amount: z.number().positive(),
  taxAmount: z.number().min(0).default(0),
  currency: z.string().default('USD'),
  status: z.enum(['pending', 'approved', 'paid', 'overdue', 'cancelled', 'flagged']).default('pending'),
  issueDate: z.string().or(z.date()),
  dueDate: z.string().or(z.date()),
  paidDate: z.string().or(z.date()).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  fileUrl: z.string().url().optional(),
  organizationId: z.string().min(1),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

// Vendors
export const createVendorSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(['software', 'hardware', 'professional_services', 'marketing', 'office_supplies', 'travel', 'utilities', 'insurance', 'other']),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  website: z.string().url().optional(),
  notes: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  organizationId: z.string().min(1),
});

export const updateVendorSchema = createVendorSchema.partial();

// Subscriptions
export const createSubscriptionSchema = z.object({
  name: z.string().min(1),
  vendorId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  billingPeriod: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual', 'one_time']),
  status: z.enum(['active', 'trial', 'expired', 'cancelled', 'pending']).default('active'),
  startDate: z.string().or(z.date()),
  renewalDate: z.string().or(z.date()).optional(),
  licenseCount: z.number().int().default(0),
  allocatedLicenses: z.number().int().default(0),
  department: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
  organizationId: z.string().min(1),
});

export const updateSubscriptionSchema = createSubscriptionSchema.partial();

// Approvals
export const createApprovalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  department: z.string().optional(),
  vendorId: z.string().optional(),
  notes: z.string().optional(),
  organizationId: z.string().min(1),
});

export const approveActionSchema = z.object({
  action: z.enum(['approved', 'rejected', 'escalated']),
  notes: z.string().optional(),
});

// BYOK
export const setByokKeySchema = z.object({
  organizationId: z.string().min(1),
  provider: z.enum(['openai', 'anthropic', 'google', 'azure_openai', 'custom']),
  key: z.string().min(1),
});

// Webhooks
export const createWebhookSchema = z.object({
  organizationId: z.string().min(1),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().optional(),
});

// Notifications
export const markReadSchema = z.object({ userId: z.string().min(1) });

// Email integration
export const connectEmailSchema = z.object({
  code: z.string().min(1),
  organizationId: z.string().min(1),
});

// Accounting
export const connectAccountingSchema = z.object({
  code: z.string().min(1),
  organizationId: z.string().min(1),
  realmId: z.string().optional(),
  tenantId: z.string().optional(),
});

// Assistant
export const askAssistantSchema = z.object({
  query: z.string().min(1).max(2000),
  organizationId: z.string().min(1),
});

// Contracts
export const createContractSchema = z.object({
  vendorId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  renewalDate: z.string().or(z.date()).optional(),
  autoRenew: z.boolean().default(false),
  value: z.number().positive().optional(),
  status: z.enum(['active', 'expiring_soon', 'expired', 'cancelled', 'draft']).default('active'),
  fileUrl: z.string().url().optional(),
  notes: z.string().optional(),
  organizationId: z.string().min(1),
});

export const updateContractSchema = createContractSchema.partial();

// Forecasting
export const forecastTrendSchema = z.object({
  months: z.number().int().min(1).max(60).default(12),
  organizationId: z.string().min(1),
});

export const forecastScenarioSchema = z.object({
  organizationId: z.string().min(1),
  baseSpend: z.number().positive(),
  growthRate: z.number().min(-50).max(200).default(10),
  months: z.number().int().min(1).max(60).default(12),
  adjustments: z.array(z.object({
    month: z.number().int(),
    amount: z.number(),
    reason: z.string().optional(),
  })).optional(),
});
