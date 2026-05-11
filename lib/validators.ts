import { z } from 'zod';

export const HomeDataSchema = z.object({
  hero: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    animationStyle: z.enum(['typewriter', 'fadeIn', 'slideUp']),
  }),
  meta: z.object({
    pageTitle: z.string(),
    description: z.string(),
  }),
});

export const AppConfigSchema = z.object({
  appName: z.string(),
  version: z.string(),
  locale: z.string(),
  theme: z.enum(['light', 'dark']),
});

export const SeedUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  name: z.string(),
  role: z.enum(['admin', 'conductor', 'socio']),
});

export const DailyConfigSchema = z.object({
  daily_fee: z.number().min(0),
  expense_limit: z.number().min(0),
});

export const CreateShiftRequestSchema = z.object({
  gross_income: z.number().positive(),
});

export const UpdateDailyConfigSchema = z.object({
  daily_fee: z.number().positive(),
  expense_limit: z.number().positive(),
});

export const SeedDataSchema = z.object({
  users: z.array(SeedUserSchema),
  daily_config: DailyConfigSchema,
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type HomeDataZod = z.infer<typeof HomeDataSchema>;
export type AppConfigZod = z.infer<typeof AppConfigSchema>;
export type SeedDataZod = z.infer<typeof SeedDataSchema>;
export type LoginRequestZod = z.infer<typeof LoginRequestSchema>;
export type CreateShiftRequestZod = z.infer<typeof CreateShiftRequestSchema>;
export type UpdateDailyConfigRequestZod = z.infer<typeof UpdateDailyConfigSchema>;
