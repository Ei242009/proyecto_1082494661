import { z } from 'zod';

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

export const LoginRequestSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
});

export type LoginRequestZod = z.infer<typeof LoginRequestSchema>;

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

export const DailyConfigSchema = z.object({
  daily_fee: z.number().min(0),
  expense_limit: z.number().min(0),
});

export const UpdateDailyConfigSchema = z.object({
  daily_fee: z.number().positive(),
  expense_limit: z.number().positive(),
});

// ============================================================================
// SEED
// ============================================================================

export const SeedUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  name: z.string(),
  role: z.enum(['admin', 'conductor', 'socio']),
});

export const SeedDataSchema = z.object({
  users: z.array(SeedUserSchema),
  daily_config: DailyConfigSchema,
});

// ============================================================================
// TURNOS Y GASTOS
// ============================================================================

export const CreateShiftRequestSchema = z.object({
  gross_income: z.number().positive(),
});

export const AddExpenseRequestSchema = z.object({
  category: z.enum(['combustible', 'peaje', 'lavado', 'reparacion', 'otro']),
  amount: z.number().positive(),
  description: z.string().min(3),
});

export const RejectExpenseRequestSchema = z.object({
  reason: z.string().min(5),
});

export type SeedDataZod = z.infer<typeof SeedDataSchema>;
export type CreateShiftRequestZod = z.infer<typeof CreateShiftRequestSchema>;
export type UpdateDailyConfigRequestZod = z.infer<typeof UpdateDailyConfigSchema>;
export type AddExpenseRequestZod = z.infer<typeof AddExpenseRequestSchema>;
export type RejectExpenseRequestZod = z.infer<typeof RejectExpenseRequestSchema>;
