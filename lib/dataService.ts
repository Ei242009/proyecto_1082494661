/**
 * lib/dataService.ts — ÚNICO punto de acceso a datos de BusetaApp.
 *
 * Modo `live` (Supabase configurado): TODO el dominio + la AUDITORÍA viven en
 * Supabase Postgres (tablas users, daily_config, shifts, expenses, audit_log).
 * Modo `seed` (sin Supabase): solo permite login del admin del seed y leer la
 * configuración por defecto; las escrituras quedan bloqueadas hasta el bootstrap.
 *
 * ⚠️ Uso exclusivo desde servidor (API Routes / Server Components).
 */

import fs from 'fs';
import path from 'path';
import crypto from 'node:crypto';
import { hash } from 'bcryptjs';
import { sendPendingExpenseAlert } from './emailService';
import { buildReceipt } from './liquidationService';
import { SeedDataSchema } from './validators';
import { getPeriodDateRange } from './dateUtils';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';
import type {
  AddExpenseRequest,
  CreateShiftRequest,
  DailyConfig,
  Expense,
  ExpenseWithShift,
  ReceiptData,
  SeedData,
  SeedUser,
  Shift,
  UpdateDailyConfigRequest,
  JwtUser,
  DashboardData,
  AuditShiftRow,
  AuditFilters,
  User,
  CreateUserRequest,
  CreateUserResponse,
  AuditEntry,
} from './types';

// ============================================================================
// Helpers de coerción (PostgREST devuelve DECIMAL como string)
// ============================================================================

function num(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number.parseFloat(value);
  return 0;
}

function bogotaToday(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' }).format(new Date());
}

function bogotaYyyymm(): string {
  const d = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' }).format(new Date());
  return d.slice(0, 7).replace('-', '');
}

// ============================================================================
// Mappers fila → tipo de dominio
// ============================================================================

interface DbUserRow {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'conductor' | 'socio';
  is_active: boolean;
  must_change_password: boolean;
  password_hash?: string;
  created_at: string;
}

function mapUser(row: DbUserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    is_active: row.is_active,
    must_change_password: row.must_change_password,
    password_hash: row.password_hash,
    created_at: row.created_at,
  };
}

function mapShift(row: Record<string, unknown>): Shift {
  return {
    id: row.id as string,
    conductor_id: row.conductor_id as string,
    shift_date: String(row.shift_date),
    gross_income: num(row.gross_income),
    daily_fee_snapshot: num(row.daily_fee_snapshot),
    status: row.status as Shift['status'],
    closed_by: (row.closed_by as string | null) ?? null,
    closed_at: (row.closed_at as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

function mapExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    shift_id: row.shift_id as string,
    category: row.category as string,
    amount: num(row.amount),
    description: (row.description as string) ?? '',
    status: row.status as Expense['status'],
    rejection_reason: (row.rejection_reason as string | null) ?? null,
    approved_by: (row.approved_by as string | null) ?? null,
    approved_at: (row.approved_at as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

// ============================================================================
// Lectura de archivos JSON (home / config / seed) — se mantienen
// ============================================================================

export async function readJsonFile<T>(fileName: string): Promise<T> {
  try {
    const filePath = path.join(process.cwd(), 'data', fileName);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(
      `Failed to read JSON file: data/${fileName}. Error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function readJsonFileSync<T>(fileName: string): T {
  const filePath = path.join(process.cwd(), 'data', fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export async function readSeedData(): Promise<SeedData> {
  return SeedDataSchema.parse(await readJsonFile<unknown>('seed.json'));
}

export async function findSeedUserByEmail(email: string): Promise<SeedUser | undefined> {
  const seed = await readSeedData();
  return seed.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function findSeedUserById(id: string): Promise<SeedUser | undefined> {
  const seed = await readSeedData();
  return seed.users.find((user) => user.id === id);
}

export async function readSeedDailyConfig(): Promise<DailyConfig> {
  const seed = await readSeedData();
  return seed.daily_config;
}

// ============================================================================
// Modo del sistema
// ============================================================================

export function getSystemMode(): 'seed' | 'live' | 'unknown' {
  if (isSupabaseConfigured()) return 'live';
  const seedFilePath = path.join(process.cwd(), 'data', 'seed.json');
  if (fs.existsSync(seedFilePath)) return 'seed';
  return 'unknown';
}

function assertLive(operation: string): void {
  if (!isSupabaseConfigured()) {
    throw new Error(`Operación "${operation}" requiere Supabase (modo live). Ejecuta el bootstrap primero.`);
  }
}

// ============================================================================
// Usuarios (auth)
// ============================================================================

/** Búsqueda unificada por email. Live: Supabase. Seed: seed.json (solo admin). */
export async function getUserByEmail(email: string): Promise<User | null> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from('users')
      .select('*')
      .ilike('email', email)
      .maybeSingle();
    if (error) throw new Error(`getUserByEmail: ${error.message}`);
    return data ? mapUser(data as DbUserRow) : null;
  }
  const seedUser = await findSeedUserByEmail(email);
  if (!seedUser) return null;
  return {
    id: seedUser.id,
    email: seedUser.email,
    name: seedUser.name,
    role: seedUser.role,
    is_active: true,
    must_change_password: false,
    password_hash: seedUser.password_hash,
    created_at: new Date(0).toISOString(),
  };
}

export async function getUserById(id: string): Promise<User | null> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin().from('users').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`getUserById: ${error.message}`);
    return data ? mapUser(data as DbUserRow) : null;
  }
  const seedUser = await findSeedUserById(id);
  if (!seedUser) return null;
  return {
    id: seedUser.id,
    email: seedUser.email,
    name: seedUser.name,
    role: seedUser.role,
    is_active: true,
    must_change_password: false,
    password_hash: seedUser.password_hash,
    created_at: new Date(0).toISOString(),
  };
}

export async function getSeedAdminEmail(): Promise<string | null> {
  if (isSupabaseConfigured()) {
    const { data } = await getSupabaseAdmin()
      .from('users')
      .select('email')
      .eq('role', 'admin')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    if (data?.email) return data.email as string;
  }
  const seed = await readSeedData();
  return seed.users.find((user) => user.role === 'admin')?.email ?? null;
}

export async function getUsers(): Promise<User[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw new Error(`getUsers: ${error.message}`);
  return (data ?? []).map((row) => mapUser(row as DbUserRow));
}

export async function createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
  assertLive('createUser');
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase.from('users').select('id').ilike('email', data.email).maybeSingle();
  if (existing) throw new Error('Ya existe un usuario con ese correo');

  // Contraseña temporal: siempre ≥10 caracteres alfanuméricos (cumple el mínimo del login).
  const tempPassword = crypto.randomBytes(24).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
  const hashedPassword = await hash(tempPassword, 12);

  const { error } = await supabase.from('users').insert({
    name: data.name,
    email: data.email,
    password_hash: hashedPassword,
    role: data.role,
    is_active: true,
    must_change_password: true,
  });
  if (error) throw new Error(`createUser: ${error.message}`);

  return { ...data, temp_password: tempPassword };
}

export async function updateUserPassword(userId: string, hashedPassword: string): Promise<User> {
  assertLive('updateUserPassword');
  const { data, error } = await getSupabaseAdmin()
    .from('users')
    .update({ password_hash: hashedPassword, must_change_password: false })
    .eq('id', userId)
    .select('*')
    .maybeSingle();
  if (error) throw new Error(`updateUserPassword: ${error.message}`);
  if (!data) throw new Error('User not found');
  return mapUser(data as DbUserRow);
}

export async function updateUserStatus(id: string, isActive: boolean): Promise<User> {
  assertLive('updateUserStatus');
  const { data, error } = await getSupabaseAdmin()
    .from('users')
    .update({ is_active: isActive })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw new Error(`updateUserStatus: ${error.message}`);
  if (!data) throw new Error('User not found');
  return mapUser(data as DbUserRow);
}

// ============================================================================
// Configuración diaria
// ============================================================================

export async function getDailyConfig(): Promise<DailyConfig> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from('daily_config')
      .select('daily_fee, expense_limit')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`getDailyConfig: ${error.message}`);
    if (data) return { daily_fee: num(data.daily_fee), expense_limit: num(data.expense_limit) };
  }
  return readSeedDailyConfig();
}

export async function updateDailyConfig(data: UpdateDailyConfigRequest, userId?: string): Promise<DailyConfig> {
  assertLive('updateDailyConfig');
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.from('daily_config').select('id').order('id').limit(1).maybeSingle();

  const payload = {
    daily_fee: data.daily_fee,
    expense_limit: data.expense_limit,
    updated_by: userId ?? null,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase.from('daily_config').update(payload).eq('id', existing.id);
    if (error) throw new Error(`updateDailyConfig: ${error.message}`);
  } else {
    const { error } = await supabase.from('daily_config').insert(payload);
    if (error) throw new Error(`updateDailyConfig: ${error.message}`);
  }
  return { daily_fee: data.daily_fee, expense_limit: data.expense_limit };
}

// ============================================================================
// Errores de dominio
// ============================================================================

export class ExpenseNotFoundError extends Error {}
export class ShiftClosedError extends Error {}
export class ForbiddenError extends Error {}
export class ShiftExistsError extends Error {
  public existingShift: Shift;
  constructor(existingShift: Shift) {
    super('Shift already exists for today');
    this.existingShift = existingShift;
  }
}

// ============================================================================
// Turnos
// ============================================================================

export async function getTodayShift(conductorId: string): Promise<Shift | null> {
  assertLive('getTodayShift');
  const { data, error } = await getSupabaseAdmin()
    .from('shifts')
    .select('*')
    .eq('conductor_id', conductorId)
    .eq('shift_date', bogotaToday())
    .maybeSingle();
  if (error) throw new Error(`getTodayShift: ${error.message}`);
  return data ? mapShift(data) : null;
}

export async function getShiftById(id: string): Promise<Shift | null> {
  assertLive('getShiftById');
  const { data, error } = await getSupabaseAdmin().from('shifts').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`getShiftById: ${error.message}`);
  return data ? mapShift(data) : null;
}

export async function getShiftByIdForUser(id: string, userId: string, role: string): Promise<Shift | null> {
  const shift = await getShiftById(id);
  if (!shift) return null;
  if (role === 'conductor' && shift.conductor_id !== userId) return null;
  return shift;
}

export async function isShiftClosed(shiftId: string): Promise<boolean> {
  const shift = await getShiftById(shiftId);
  return shift?.status === 'CERRADO';
}

export async function createShift(conductorId: string, data: CreateShiftRequest): Promise<Shift> {
  assertLive('createShift');
  const supabase = getSupabaseAdmin();
  const config = await getDailyConfig();
  const today = bogotaToday();

  const { data: inserted, error } = await supabase
    .from('shifts')
    .insert({
      conductor_id: conductorId,
      shift_date: today,
      gross_income: data.gross_income,
      daily_fee_snapshot: config.daily_fee, // RN-01: snapshot al crear
      status: 'ABIERTO',
    })
    .select('*')
    .maybeSingle();

  if (error) {
    // RN-07: turno único por conductor por día (violación de UNIQUE)
    if (error.code === '23505') {
      const existing = await getTodayShift(conductorId);
      if (existing) throw new ShiftExistsError(existing);
    }
    throw new Error(`createShift: ${error.message}`);
  }

  return mapShift(inserted!);
}

export async function closeShift(
  shiftId: string,
  adminId: string,
  force = false,
): Promise<{ receipt?: ReceiptData; requiresConfirmation?: true; pendingCount?: number; pendingTotal?: number }> {
  assertLive('closeShift');
  const supabase = getSupabaseAdmin();

  const shift = await getShiftById(shiftId);
  if (!shift) throw new Error('Shift not found');
  if (shift.status === 'CERRADO') throw new ShiftClosedError('Shift is already closed');

  const expenses = await getExpensesByShiftId(shiftId);
  const pendingExpenses = expenses.filter((expense) => expense.status === 'PENDIENTE');

  if (pendingExpenses.length > 0 && !force) {
    return {
      requiresConfirmation: true,
      pendingCount: pendingExpenses.length,
      pendingTotal: pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    };
  }

  const closedAt = new Date().toISOString();
  const { error } = await supabase
    .from('shifts')
    .update({ status: 'CERRADO', closed_by: adminId, closed_at: closedAt })
    .eq('id', shiftId)
    .eq('status', 'ABIERTO');
  if (error) throw new Error(`closeShift: ${error.message}`);

  const receipt = await buildReceipt(shiftId);

  await recordAudit({
    user_id: adminId,
    user_role: 'admin',
    action: 'close_shift',
    entity: 'shift',
    entity_id: shiftId,
    summary: `Turno ${shift.shift_date} cerrado. IB: $${shift.gross_income} · UN: $${receipt.net_income}`,
    metadata: { force, pendingExcluded: pendingExpenses.length },
  });

  return { receipt };
}

export async function getShifts(filters: AuditFilters = {}): Promise<Shift[]> {
  assertLive('getShifts');
  let query = getSupabaseAdmin().from('shifts').select('*').order('shift_date', { ascending: false });
  if (filters.from) query = query.gte('shift_date', filters.from);
  if (filters.to) query = query.lte('shift_date', filters.to);
  const { data, error } = await query;
  if (error) throw new Error(`getShifts: ${error.message}`);
  return (data ?? []).map(mapShift);
}

// ============================================================================
// Gastos
// ============================================================================

export async function getExpensesByShiftId(shiftId: string): Promise<Expense[]> {
  assertLive('getExpensesByShiftId');
  const { data, error } = await getSupabaseAdmin()
    .from('expenses')
    .select('*')
    .eq('shift_id', shiftId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(`getExpensesByShiftId: ${error.message}`);
  return (data ?? []).map(mapExpense);
}

export async function addExpense(
  userId: string,
  userRole: JwtUser['role'],
  shiftId: string,
  data: AddExpenseRequest,
): Promise<Expense> {
  assertLive('addExpense');
  const supabase = getSupabaseAdmin();

  const shift = await getShiftById(shiftId);
  if (!shift) throw new Error('Shift not found');
  if (shift.status === 'CERRADO') throw new ShiftClosedError('Shift is already closed'); // RN-04
  if (userRole === 'conductor' && shift.conductor_id !== userId) {
    throw new ForbiddenError('No tienes permiso para agregar gastos a este turno'); // RN-06
  }

  const config = await getDailyConfig();
  const status: Expense['status'] = data.amount > config.expense_limit ? 'PENDIENTE' : 'APROBADO'; // RN-02

  const { data: inserted, error } = await supabase
    .from('expenses')
    .insert({
      shift_id: shift.id,
      category: data.category,
      amount: data.amount,
      description: data.description,
      status,
    })
    .select('*')
    .maybeSingle();
  if (error) throw new Error(`addExpense: ${error.message}`);
  const expense = mapExpense(inserted!);

  await recordAudit({
    user_id: userId,
    user_role: userRole,
    action: 'add_expense',
    entity: 'expense',
    entity_id: expense.id,
    summary: `Gasto ${data.category} $${data.amount} (${status})`,
    metadata: { shiftId },
  });

  if (status === 'PENDIENTE') {
    const ownerEmail = await getSeedAdminEmail();
    const conductor = await getUserById(shift.conductor_id);
    if (ownerEmail) {
      try {
        await sendPendingExpenseAlert(ownerEmail, {
          conductor: conductor?.name ?? 'Conductor',
          category: data.category,
          amount: data.amount,
          description: data.description,
        });
      } catch (err) {
        console.error('Failed to send pending expense alert:', err instanceof Error ? err.message : err);
      }
    }
  }

  return expense;
}

export async function getPendingExpenses(): Promise<ExpenseWithShift[]> {
  assertLive('getPendingExpenses');
  const supabase = getSupabaseAdmin();

  const { data: rows, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('status', 'PENDIENTE')
    .order('created_at', { ascending: true });
  if (error) throw new Error(`getPendingExpenses: ${error.message}`);

  const expenses = (rows ?? []).map(mapExpense);
  if (expenses.length === 0) return [];

  const shiftIds = [...new Set(expenses.map((e) => e.shift_id))];
  const { data: shiftRows } = await supabase.from('shifts').select('id, shift_date, conductor_id').in('id', shiftIds);
  const shiftMap = new Map((shiftRows ?? []).map((s) => [s.id as string, s]));

  const conductorIds = [...new Set((shiftRows ?? []).map((s) => s.conductor_id as string))];
  const { data: userRows } = await supabase.from('users').select('id, name').in('id', conductorIds);
  const userMap = new Map((userRows ?? []).map((u) => [u.id as string, u.name as string]));

  return expenses.map((expense) => {
    const shift = shiftMap.get(expense.shift_id);
    return {
      ...expense,
      shift_date: shift ? String(shift.shift_date) : '',
      conductor_name: shift ? userMap.get(shift.conductor_id as string) ?? 'Desconocido' : 'Desconocido',
    };
  });
}

export async function getPendingExpensesCount(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const { count, error } = await getSupabaseAdmin()
    .from('expenses')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'PENDIENTE');
  if (error) throw new Error(`getPendingExpensesCount: ${error.message}`);
  return count ?? 0;
}

export async function approveExpense(id: string, adminId: string): Promise<Expense> {
  assertLive('approveExpense');
  const supabase = getSupabaseAdmin();

  const { data: current } = await supabase.from('expenses').select('*').eq('id', id).maybeSingle();
  if (!current) throw new ExpenseNotFoundError('Expense not found');
  if ((current as Record<string, unknown>).status !== 'PENDIENTE') throw new Error('Only pending expenses can be approved');

  const { data, error } = await supabase
    .from('expenses')
    .update({ status: 'APROBADO', approved_by: adminId, approved_at: new Date().toISOString(), rejection_reason: null })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw new Error(`approveExpense: ${error.message}`);
  const expense = mapExpense(data!);

  await recordAudit({
    user_id: adminId,
    user_role: 'admin',
    action: 'approve_expense',
    entity: 'expense',
    entity_id: id,
    summary: `Gasto ${expense.category} $${expense.amount} aprobado`,
  });
  return expense;
}

export async function rejectExpense(id: string, adminId: string, reason: string): Promise<Expense> {
  assertLive('rejectExpense');
  const supabase = getSupabaseAdmin();

  const { data: current } = await supabase.from('expenses').select('*').eq('id', id).maybeSingle();
  if (!current) throw new ExpenseNotFoundError('Expense not found');
  if ((current as Record<string, unknown>).status !== 'PENDIENTE') throw new Error('Only pending expenses can be rejected');

  const { data, error } = await supabase
    .from('expenses')
    .update({ status: 'RECHAZADO', approved_by: adminId, approved_at: new Date().toISOString(), rejection_reason: reason })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw new Error(`rejectExpense: ${error.message}`);
  const expense = mapExpense(data!);

  await recordAudit({
    user_id: adminId,
    user_role: 'admin',
    action: 'reject_expense',
    entity: 'expense',
    entity_id: id,
    summary: `Gasto ${expense.category} $${expense.amount} rechazado: ${reason}`,
  });
  return expense;
}

// ============================================================================
// Dashboard y auditoría del socio
// ============================================================================

export async function getDashboardData(period: 'day' | 'week' | 'month'): Promise<DashboardData> {
  assertLive('getDashboardData');
  const supabase = getSupabaseAdmin();
  const { from, to } = getPeriodDateRange(period);

  const { data: shiftRows, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('status', 'CERRADO')
    .gte('shift_date', from)
    .lte('shift_date', to);
  if (error) throw new Error(`getDashboardData: ${error.message}`);

  const closedShifts = (shiftRows ?? []).map(mapShift);
  const totalGrossIncome = closedShifts.reduce((sum, s) => sum + s.gross_income, 0);
  const totalDailyFee = closedShifts.reduce((sum, s) => sum + s.daily_fee_snapshot, 0);

  let totalApprovedExpenses = 0;
  if (closedShifts.length > 0) {
    const { data: expRows } = await supabase
      .from('expenses')
      .select('amount')
      .eq('status', 'APROBADO')
      .in('shift_id', closedShifts.map((s) => s.id));
    totalApprovedExpenses = (expRows ?? []).reduce((sum, e) => sum + num(e.amount), 0);
  }

  const pendingExpensesCount = await getPendingExpensesCount();

  return {
    totalGrossIncome,
    totalDailyFee,
    totalApprovedExpenses,
    netIncome: totalGrossIncome - totalDailyFee - totalApprovedExpenses,
    closedShiftsCount: closedShifts.length,
    pendingExpensesCount,
  };
}

export async function getAuditShifts(filters: AuditFilters = {}): Promise<AuditShiftRow[]> {
  assertLive('getAuditShifts');
  const supabase = getSupabaseAdmin();

  let query = supabase.from('shifts').select('*').eq('status', 'CERRADO').order('shift_date', { ascending: false });
  if (filters.from) query = query.gte('shift_date', filters.from);
  if (filters.to) query = query.lte('shift_date', filters.to);
  const { data, error } = await query;
  if (error) throw new Error(`getAuditShifts: ${error.message}`);

  const shifts = (data ?? []).map(mapShift);
  const conductorIds = [...new Set(shifts.map((s) => s.conductor_id))];
  const { data: userRows } = await supabase.from('users').select('id, name').in('id', conductorIds);
  const userMap = new Map((userRows ?? []).map((u) => [u.id as string, u.name as string]));

  // El socio solo ve: fecha, IB, tarifa descontada, estado (sin gastos operativos).
  return shifts.map((shift) => ({
    date: shift.shift_date,
    conductor_name: userMap.get(shift.conductor_id) ?? 'Desconocido',
    gross_income: shift.gross_income,
    daily_fee_snapshot: shift.daily_fee_snapshot,
    status: shift.status,
  }));
}

// ============================================================================
// Auditoría técnica (bitácora) — EN SUPABASE (tabla audit_log)
// ============================================================================

export async function recordAudit(entry: AuditEntry): Promise<void> {
  if (!isSupabaseConfigured()) return; // en seed mode no hay dónde persistir
  try {
    const { error } = await getSupabaseAdmin().from('audit_log').insert({
      yyyymm: entry.yyyymm ?? bogotaYyyymm(),
      user_id: entry.user_id ?? null,
      user_email: entry.user_email ?? null,
      user_role: entry.user_role ?? null,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entity_id ?? null,
      summary: entry.summary,
      metadata: entry.metadata ?? null,
    });
    if (error) console.error('recordAudit:', error.message);
  } catch (err) {
    console.error('recordAudit failed:', err instanceof Error ? err.message : err);
  }
}

export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]> {
  assertLive('readAuditMonth');
  const { data, error } = await getSupabaseAdmin()
    .from('audit_log')
    .select('*')
    .eq('yyyymm', yyyymm)
    .order('ts', { ascending: false });
  if (error) throw new Error(`readAuditMonth: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    timestamp: row.ts as string,
    yyyymm: row.yyyymm as string,
    user_id: (row.user_id as string) ?? undefined,
    user_email: (row.user_email as string) ?? undefined,
    user_role: (row.user_role as AuditEntry['user_role']) ?? undefined,
    action: row.action as string,
    entity: row.entity as string,
    entity_id: (row.entity_id as string) ?? undefined,
    summary: row.summary as string,
    metadata: (row.metadata as Record<string, unknown>) ?? undefined,
  }));
}

const dataService = {
  readJsonFile,
  readJsonFileSync,
  readSeedData,
  readSeedDailyConfig,
  findSeedUserByEmail,
  findSeedUserById,
  getSeedAdminEmail,
  getUserByEmail,
  getUserById,
  getDailyConfig,
  updateDailyConfig,
  getTodayShift,
  getShiftById,
  getShiftByIdForUser,
  getShifts,
  getExpensesByShiftId,
  addExpense,
  getPendingExpenses,
  approveExpense,
  rejectExpense,
  createShift,
  closeShift,
  isShiftClosed,
  getPendingExpensesCount,
  getSystemMode,
  getDashboardData,
  getAuditShifts,
  getUsers,
  createUser,
  updateUserPassword,
  updateUserStatus,
  recordAudit,
  readAuditMonth,
};

export default dataService;
