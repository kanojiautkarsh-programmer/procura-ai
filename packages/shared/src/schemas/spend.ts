import { z } from 'zod';

export const SpendCategory = z.enum([
  'software',
  'hardware',
  'services',
  'marketing',
  'travel',
  'office',
  'utilities',
  'insurance',
  'other',
]);

export const SpendSummarySchema = z.object({
  totalSpend: z.number().nonnegative(),
  monthlySpend: z.number().nonnegative(),
  monthlyTrend: z.number(),
  activeSubscriptions: z.number().int().nonnegative(),
  pendingInvoices: z.number().int().nonnegative(),
  overdueInvoices: z.number().int().nonnegative(),
  categoryBreakdown: z.array(
    z.object({
      category: SpendCategory,
      amount: z.number().nonnegative(),
      percentage: z.number().min(0).max(100),
    }),
  ),
  departmentBreakdown: z.array(
    z.object({
      department: z.string(),
      amount: z.number().nonnegative(),
      percentage: z.number().min(0).max(100),
    }),
  ),
  period: z.object({
    start: z.date(),
    end: z.date(),
  }),
});

export const SpendTrendSchema = z.object({
  date: z.date(),
  amount: z.number().nonnegative(),
  category: SpendCategory.optional(),
});

export type SpendSummary = z.infer<typeof SpendSummarySchema>;
export type SpendTrend = z.infer<typeof SpendTrendSchema>;
export type SpendCategory = z.infer<typeof SpendCategory>;
