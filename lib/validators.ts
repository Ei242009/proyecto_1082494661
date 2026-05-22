import { z } from 'zod';

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

export const LoginRequestSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
});

export type LoginRequestZod = z.infer<typeof LoginRequestSchema>;

export const UserSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  passwordHash: z.string(),
  role: z.enum(['admin', 'conductor', 'socio']),
  name: z.string().min(2),
  createdAt: z.string().datetime(),
  companyId: z.string().uuid().nullable(),
});

export type UserZod = z.infer<typeof UserSchema>;

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

export const DailyConfigSchema = z.object({
  tarifa: z.number().positive(),
  limiteGasto: z.number().positive(),
  updatedAt: z.string().datetime(),
  updatedBy: z.string(),
});

export type DailyConfigZod = z.infer<typeof DailyConfigSchema>;

// ============================================================================
// GASTOS
// ============================================================================

export const ExpenseSchema = z.object({
  categoria: z.enum(['gasolina', 'comida', 'mantenimiento', 'otro']),
  monto: z.number().positive('Monto debe ser positivo'),
  descripcion: z.string().min(3, 'Descripción debe tener al menos 3 caracteres'),
});

export type ExpenseZod = z.infer<typeof ExpenseSchema>;

// ============================================================================
// SEED
// ============================================================================

export const SeedDataSchema = z.object({
  version: z.string(),
  daily_config: DailyConfigSchema,
  users: z.array(UserSchema),
  companies: z.array(
    z.object({
      companyId: z.string().uuid(),
      name: z.string(),
      ownerEmail: z.string().email(),
      createdAt: z.string().datetime(),
    })
  ),
  shifts: z.array(z.any()), // Deferred
  snapshots: z.array(z.any()), // Deferred
});

export type SeedDataZod = z.infer<typeof SeedDataSchema>;

