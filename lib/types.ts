/**
 * lib/types.ts — Tipos globales de BusetaApp
 * Autenticación, turnos, gastos, configuración
 */

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

export type UserRole = 'admin' | 'conductor' | 'socio';

export interface User {
  userId: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  createdAt: string; // ISO8601
  companyId: string | null;
}

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

export interface LoginResponse {
  success: boolean;
  userId: string;
  role: UserRole;
  email: string;
  name: string;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

export interface DailyConfig {
  tarifa: number; // En COP
  limiteGasto: number; // En COP
  updatedAt: string; // ISO8601
  updatedBy: string; // userId
}

export interface SystemMode {
  mode: 'seed' | 'production';
}

// ============================================================================
// TURNOS Y GASTOS
// ============================================================================

export type ExpenseCategory = 'gasolina' | 'comida' | 'mantenimiento' | 'otro';

export interface Expense {
  id: string;
  categoria: ExpenseCategory;
  monto: number; // En COP
  descripcion: string;
  timestamp: string; // ISO8601
  approved: boolean;
  approvedBy: string | null; // userId del socio
}

export interface Shift {
  shiftId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string | null; // HH:mm:ss
  odometerStart: number;
  odometerEnd: number | null;
  gastos: Expense[];
  status: 'open' | 'closed';
  snapshot: ShiftSnapshot | null;
  createdAt: string; // ISO8601
  closedAt: string | null; // ISO8601
}

export interface ShiftSnapshot {
  shiftId: string;
  userId: string;
  userEmail: string;
  userName: string;
  date: string; // YYYY-MM-DD
  ingresos: number; // En COP
  gastos: number; // En COP
  neto: number; // En COP
  distanciaKm: number;
  odometerStart: number;
  odometerEnd: number;
  calculatedAt: string; // ISO8601
  calculatedBy: string; // 'servidor'
}

// ============================================================================
// EMPRESA (Company)
// ============================================================================

export interface Company {
  companyId: string;
  name: string;
  ownerEmail: string;
  createdAt: string; // ISO8601
}

// ============================================================================
// SEED (Datos Iniciales)
// ============================================================================

export interface SeedData {
  version: string;
  daily_config: DailyConfig;
  users: User[];
  companies: Company[];
  shifts: Shift[];
  snapshots: ShiftSnapshot[];
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
