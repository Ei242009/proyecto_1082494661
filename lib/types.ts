/**
 * lib/types.ts — Tipos globales de BusetaApp
 * Autenticación, turnos, gastos, configuración
 */

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

export type UserRole = 'admin' | 'conductor' | 'socio';

export interface JWTPayload {
  userId: string;
  role: UserRole;
  email: string;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DailyConfig {
  daily_fee: number;
  expense_limit: number;
}

export interface SeedUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'conductor' | 'socio';
}

export interface SeedData {
  users: SeedUser[];
  daily_config: DailyConfig;
}

export interface Shift {
  id: string;
  conductor_id: string;
  shift_date: string;
  gross_income: number;
  daily_fee_snapshot: number;
  status: 'ABIERTO' | 'CERRADO';
  closed_by?: string | null;
  closed_at?: string | null;
  created_at: string;
}

export interface CreateShiftRequest {
  gross_income: number;
}

export interface Expense {
  id: string;
  shift_id: string;
  category: string;
  amount: number;
  description: string;
  status: 'APROBADO' | 'PENDIENTE' | 'RECHAZADO';
  rejection_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface ExpenseWithShift extends Expense {
  shift_date: string;
  conductor_name: string;
}

export interface AddExpenseRequest {
  category: string;
  amount: number;
  description: string;
}

export interface UpdateDailyConfigRequest {
  daily_fee: number;
  expense_limit: number;
}

export interface LiquidationExpenseItem {
  category: string;
  amount: number;
  description: string;
  time: string;
}

export interface LiquidationResult {
  gross_income: number;
  daily_fee_snapshot: number;
  base_post_fee: number;
  total_approved_expenses: number;
  net_income: number;
  approved_expenses: Array<{
    id: string;
    category: string;
    amount: number;
    description: string;
    created_at: string;
  }>;
}

export interface ReceiptData {
  shiftId: string;
  conductor_name: string;
  closed_by_name: string;
  closed_at: string;
  gross_income: number;
  daily_fee_snapshot: number;
  base_post_fee: number;
  approved_expenses: LiquidationExpenseItem[];
  net_income: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtUser {
  userId: string;
  role: 'admin' | 'conductor' | 'socio';
  email: string;
  name?: string;
  mustChangePassword?: boolean;
}

// ============================================================================
// RESPUESTAS DE API
// ============================================================================

export interface ApiError {
  error: string;
  code: string;
  details?: string;
  timestamp: string;
}

export interface ApiSuccess<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

// ============================================================================
// EMAIL
// ============================================================================

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  html: string;
}

export interface PendingExpenseAlert {
  ownerEmail: string;
  conductorName: string;
  categoria: string;
  monto: number;
  descripcion: string;
  shiftId: string;
}

export interface DashboardData {
  totalGrossIncome: number;
  totalDailyFee: number;
  totalApprovedExpenses: number;
  netIncome: number;
  closedShiftsCount: number;
  pendingExpensesCount: number;
}

export interface AuditShiftRow {
  date: string;
  conductor_name: string;
  gross_income: number;
  daily_fee_snapshot: number;
  status: 'ABIERTO' | 'CERRADO';
}

export interface AuditFilters {
  from?: string;
  to?: string;
}

export interface AuditEntry {
  id?: string;
  timestamp?: string;
  yyyymm?: string;
  user_id?: string;
  user_email?: string;
  user_role?: 'conductor' | 'admin' | 'socio';
  action: string;
  entity: string;
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'conductor' | 'socio';
  is_active: boolean;
  must_change_password: boolean;
  password_hash?: string;
  created_at: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: 'admin' | 'conductor' | 'socio';
}

export interface CreateUserResponse extends CreateUserRequest {
  temp_password: string;
}
