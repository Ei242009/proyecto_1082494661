/**
 * Data Access Layer — Servicio de lectura de archivos JSON
 * 
 * Módulo centralizado para leer archivos JSON desde la carpeta /data/
 * con tipado genérico estricto mediante TypeScript.
 * 
 * ⚠️ Uso exclusivo desde servidor: API Routes, Server Components, etc.
 * ❌ NO usar en Client Components
 */

import fs from 'fs';
import path from 'path';
import crypto from 'node:crypto';
import { hash } from 'bcryptjs';
import { sendPendingExpenseAlert } from './emailService';
import { buildReceipt } from './liquidationService';
import { HomeDataSchema, AppConfigSchema, SeedDataSchema } from './validators';
import { getPeriodDateRange } from './dateUtils';
import type {
  AppConfig,
  AddExpenseRequest,
  CreateShiftRequest,
  DailyConfig,
  Expense,
  ExpenseWithShift,
  HomeData,
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
} from './types';

/**
 * Lee y parsea un archivo JSON desde la carpeta /data/
 * con tipado genérico estricto.
 */
export async function readJsonFile<T>(fileName: string): Promise<T> {
  try {
    const filePath = path.join(process.cwd(), 'data', fileName);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(
      `Failed to read JSON file: data/${fileName}. ` +
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function readJsonFileSync<T>(fileName: string): T {
  try {
    const filePath = path.join(process.cwd(), 'data', fileName);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(
      `Failed to read JSON file synchronously: data/${fileName}. ` +
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function readHomeData(): Promise<HomeData> {
  const raw = await readJsonFile<unknown>('home.json');
  return HomeDataSchema.parse(raw);
}

export async function readAppConfig(): Promise<AppConfig> {
  const raw = await readJsonFile<unknown>('config.json');
  return AppConfigSchema.parse(raw);
}

export async function readSeedData(): Promise<SeedData> {
  const raw = await readJsonFile<unknown>('seed.json');
  return SeedDataSchema.parse(raw);
}

export async function findSeedUserByEmail(email: string): Promise<SeedUser | undefined> {
  const seed = await readSeedData();
  return seed.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function findSeedUserById(id: string): Promise<SeedUser | undefined> {
  const seed = await readSeedData();
  return seed.users.find((user) => user.id === id);
}

export async function getSeedAdminEmail(): Promise<string | null> {
  const seed = await readSeedData();
  return seed.users.find((user) => user.role === 'admin')?.email ?? null;
}

export async function readSeedDailyConfig(): Promise<DailyConfig> {
  const seed = await readSeedData();
  return seed.daily_config;
}

function getExpensesFilePath(): string {
  return path.join(process.cwd(), 'data', 'expenses.json');
}

function readExpensesFromFile(): Expense[] {
  const filePath = getExpensesFilePath();
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as Expense[];
}

function writeExpensesToFile(expenses: Expense[]): void {
  const filePath = getExpensesFilePath();
  fs.writeFileSync(filePath, JSON.stringify(expenses, null, 2), 'utf8');
}

export async function getExpensesByShiftId(shiftId: string): Promise<Expense[]> {
  return readExpensesFromFile().filter((expense) => expense.shift_id === shiftId);
}

export class ExpenseNotFoundError extends Error {}
export class ShiftClosedError extends Error {}
export class ForbiddenError extends Error {}

export async function closeShift(
  shiftId: string,
  adminId: string,
  force = false,
): Promise<{ receipt?: ReceiptData; requiresConfirmation?: true; pendingCount?: number; pendingTotal?: number }> {
  const shift = await getShiftById(shiftId);
  if (!shift) {
    throw new Error('Shift not found');
  }

  if (shift.status === 'CERRADO') {
    throw new ShiftClosedError('Shift is already closed');
  }

  const expenses = await getExpensesByShiftId(shiftId);
  const pendingExpenses = expenses.filter((expense) => expense.status === 'PENDIENTE');

  if (pendingExpenses.length > 0 && !force) {
    const pendingTotal = pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      requiresConfirmation: true,
      pendingCount: pendingExpenses.length,
      pendingTotal,
    };
  }

  const shifts = readShiftsFromFile();
  const existingShiftIndex = shifts.findIndex((item) => item.id === shiftId);
  if (existingShiftIndex === -1) {
    throw new Error('Shift not found');
  }

  const closedAt = new Date().toISOString();
  const updatedShift: Shift = {
    ...shift,
    status: 'CERRADO',
    closed_by: adminId,
    closed_at: closedAt,
  };

  shifts[existingShiftIndex] = updatedShift;
  writeShiftsToFile(shifts);

  const receipt = await buildReceipt(shiftId);

  console.info(`Shift ${shiftId} closed by ${adminId}. force=${force}. pendingCount=${pendingExpenses.length}`);

  return { receipt };
}

export async function addExpense(
  userId: string,
  userRole: JwtUser['role'],
  shiftId: string,
  data: AddExpenseRequest,
): Promise<Expense> {
  const shift = await getShiftById(shiftId);
  if (!shift) {
    throw new Error('Shift not found');
  }

  if (shift.status === 'CERRADO') {
    throw new ShiftClosedError('Shift is already closed');
  }

  if (userRole === 'conductor' && shift.conductor_id !== userId) {
    throw new ForbiddenError('No tienes permiso para agregar gastos a este turno');
  }

  const config = await getDailyConfig();
  const status = data.amount > config.expense_limit ? 'PENDIENTE' : 'APROBADO';

  const expense: Expense = {
    id: crypto.randomUUID(),
    shift_id: shift.id,
    category: data.category,
    amount: data.amount,
    description: data.description,
    status,
    rejection_reason: null,
    approved_by: null,
    approved_at: null,
    created_at: new Date().toISOString(),
  };

  const expenses = readExpensesFromFile();
  expenses.push(expense);
  writeExpensesToFile(expenses);

  if (status === 'PENDIENTE') {
    const ownerEmail = await getSeedAdminEmail();
    const conductorName = (await findSeedUserById(shift.conductor_id))?.name ?? 'Conductor';
    if (ownerEmail) {
      try {
        await sendPendingExpenseAlert(ownerEmail, {
          conductor: conductorName,
          category: data.category,
          amount: data.amount,
          description: data.description,
        });
      } catch (error) {
        console.error('Failed to send pending expense alert:', error instanceof Error ? error.message : error);
      }
    } else {
      console.error('No admin email configured in seed data for pending expense alerts');
    }
  }

  return expense;
}

export async function getPendingExpenses(): Promise<ExpenseWithShift[]> {
  const allExpenses = readExpensesFromFile();
  const pendingExpenses = allExpenses.filter((expense) => expense.status === 'PENDIENTE');

  const pendingWithDetail = await Promise.all(
    pendingExpenses.map(async (expense) => {
      const shift = await getShiftById(expense.shift_id);
      const conductorName = shift ? (await findSeedUserById(shift.conductor_id))?.name ?? 'Desconocido' : 'Desconocido';
      return {
        ...expense,
        shift_date: shift?.shift_date ?? '',
        conductor_name: conductorName,
      };
    }),
  );

  return pendingWithDetail.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function approveExpense(id: string, adminId: string): Promise<Expense> {
  const expenses = readExpensesFromFile();
  const expenseIndex = expenses.findIndex((expense) => expense.id === id);
  if (expenseIndex === -1) {
    throw new ExpenseNotFoundError('Expense not found');
  }

  const expense = expenses[expenseIndex];
  if (expense.status !== 'PENDIENTE') {
    throw new Error('Only pending expenses can be approved');
  }

  const updatedExpense: Expense = {
    ...expense,
    status: 'APROBADO',
    approved_by: adminId,
    approved_at: new Date().toISOString(),
    rejection_reason: null,
  };

  expenses[expenseIndex] = updatedExpense;
  writeExpensesToFile(expenses);
  return updatedExpense;
}

export async function rejectExpense(id: string, adminId: string, reason: string): Promise<Expense> {
  const expenses = readExpensesFromFile();
  const expenseIndex = expenses.findIndex((expense) => expense.id === id);
  if (expenseIndex === -1) {
    throw new ExpenseNotFoundError('Expense not found');
  }

  const expense = expenses[expenseIndex];
  if (expense.status !== 'PENDIENTE') {
    throw new Error('Only pending expenses can be rejected');
  }

  const updatedExpense: Expense = {
    ...expense,
    status: 'RECHAZADO',
    approved_by: adminId,
    approved_at: new Date().toISOString(),
    rejection_reason: reason,
  };

  expenses[expenseIndex] = updatedExpense;
  writeExpensesToFile(expenses);
  return updatedExpense;
}

function getShiftsFilePath(): string {
  return path.join(process.cwd(), 'data', 'shifts.json');
}

function readShiftsFromFile(): Shift[] {
  const filePath = getShiftsFilePath();

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as Shift[];
}

function writeShiftsToFile(shifts: Shift[]): void {
  const filePath = getShiftsFilePath();
  fs.writeFileSync(filePath, JSON.stringify(shifts, null, 2), 'utf8');
}

export async function getDailyConfig(): Promise<DailyConfig> {
  return readSeedDailyConfig();
}

export async function updateDailyConfig(data: UpdateDailyConfigRequest): Promise<DailyConfig> {
  const seed = await readSeedData();
  const updated = {
    ...seed.daily_config,
    daily_fee: data.daily_fee,
    expense_limit: data.expense_limit,
  };

  const filePath = path.join(process.cwd(), 'data', 'seed.json');
  const updatedSeed: SeedData = {
    ...seed,
    daily_config: updated,
  };

  fs.writeFileSync(filePath, JSON.stringify(updatedSeed, null, 2), 'utf8');
  return updated;
}

export async function getTodayShift(conductorId: string): Promise<Shift | null> {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' }).format(new Date());
  const shifts = readShiftsFromFile();
  return shifts.find((shift) => shift.conductor_id === conductorId && shift.shift_date === today) ?? null;
}

export async function getShiftById(id: string): Promise<Shift | null> {
  const shifts = readShiftsFromFile();
  return shifts.find((shift) => shift.id === id) ?? null;
}

export class ShiftExistsError extends Error {
  public existingShift: Shift;

  constructor(existingShift: Shift) {
    super('Shift already exists for today');
    this.existingShift = existingShift;
  }
}

export async function createShift(conductorId: string, data: CreateShiftRequest): Promise<Shift> {
  const config = await getDailyConfig();
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' }).format(new Date());
  const shifts = readShiftsFromFile();

  const existing = shifts.find((shift) => shift.conductor_id === conductorId && shift.shift_date === today);
  if (existing) {
    throw new ShiftExistsError(existing);
  }

  const newShift: Shift = {
    id: crypto.randomUUID(),
    conductor_id: conductorId,
    shift_date: today,
    gross_income: data.gross_income,
    daily_fee_snapshot: config.daily_fee,
    status: 'ABIERTO',
    closed_by: null,
    closed_at: null,
    created_at: new Date().toISOString(),
  };

  shifts.push(newShift);
  writeShiftsToFile(shifts);
  return newShift;
}

export async function getShiftByIdForUser(id: string, userId: string, role: string): Promise<Shift | null> {
  const shift = await getShiftById(id);
  if (!shift) return null;
  if (role === 'conductor' && shift.conductor_id !== userId) {
    return null;
  }
  return shift;
}

export async function isShiftClosed(shiftId: string): Promise<boolean> {
  const shift = await getShiftById(shiftId);
  return shift?.status === 'CERRADO';
}

export async function getPendingExpensesCount(): Promise<number> {
  const mode = getSystemMode();

  if (mode === 'seed') {
    const expenses = readExpensesFromFile();
    return expenses.filter((expense) => expense.status === 'PENDIENTE').length;
  }

  // En modo live, esta función debe consultar la base de datos.
  // Aquí se mantiene un stub hasta que el servicio Supabase esté disponible.
  return 0;
}

export function getSystemMode(): 'seed' | 'live' | 'unknown' {
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const seedFilePath = path.join(process.cwd(), 'data', 'seed.json');

  if (hasSupabaseUrl && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())) {
    return 'live';
  }

  if (fs.existsSync(seedFilePath)) {
    return 'seed';
  }

  return 'unknown';
}

export async function getDashboardData(period: 'day' | 'week' | 'month'): Promise<DashboardData> {
  const { from, to } = getPeriodDateRange(period);
  const shifts = readShiftsFromFile();
  const expenses = readExpensesFromFile();

  // Filter closed shifts in the period
  const closedShifts = shifts.filter(shift =>
    shift.status === 'CERRADO' &&
    shift.shift_date >= from &&
    shift.shift_date <= to
  );

  // Calculate totals
  const totalGrossIncome = closedShifts.reduce((sum, shift) => sum + shift.gross_income, 0);
  const totalDailyFee = closedShifts.reduce((sum, shift) => sum + shift.daily_fee_snapshot, 0);

  // Get approved expenses for these shifts
  const shiftIds = closedShifts.map(s => s.id);
  const approvedExpenses = expenses.filter(expense =>
    shiftIds.includes(expense.shift_id) && expense.status === 'APROBADO'
  );
  const totalApprovedExpenses = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const netIncome = totalGrossIncome - totalDailyFee - totalApprovedExpenses;

  // Current pending expenses (not filtered by period, as per spec)
  const pendingExpensesCount = expenses.filter(expense => expense.status === 'PENDIENTE').length;

  return {
    totalGrossIncome,
    totalDailyFee,
    totalApprovedExpenses,
    netIncome,
    closedShiftsCount: closedShifts.length,
    pendingExpensesCount,
  };
}

export async function getAuditShifts(filters: AuditFilters = {}): Promise<AuditShiftRow[]> {
  const shifts = readShiftsFromFile();
  let filteredShifts = shifts;

  if (filters.from) {
    filteredShifts = filteredShifts.filter(shift => shift.shift_date >= filters.from!);
  }
  if (filters.to) {
    filteredShifts = filteredShifts.filter(shift => shift.shift_date <= filters.to!);
  }

  // Only closed shifts should be visible in the socio/admin audit.
  filteredShifts = filteredShifts.filter((shift) => shift.status === 'CERRADO');

  // Get conductor names
  const seed = await readSeedData();
  const userMap = new Map(seed.users.map(user => [user.id, user.name]));

  return filteredShifts.map(shift => ({
    date: shift.shift_date,
    conductor_name: userMap.get(shift.conductor_id) ?? 'Desconocido',
    gross_income: shift.gross_income,
    daily_fee_snapshot: shift.daily_fee_snapshot,
    status: shift.status,
  })).sort((a, b) => b.date.localeCompare(a.date)); // Most recent first
}

// User management functions (for seed mode)
function getUsersFilePath(): string {
  return path.join(process.cwd(), 'data', 'users.json');
}

function readUsersFromFile(): User[] {
  const filePath = getUsersFilePath();
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as User[];
}

function writeUsersToFile(users: User[]): void {
  const filePath = getUsersFilePath();
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');
}

function writeSeedData(seed: SeedData): void {
  const filePath = path.join(process.cwd(), 'data', 'seed.json');
  fs.writeFileSync(filePath, JSON.stringify(seed, null, 2), 'utf8');
}

export async function getUsers(): Promise<User[]> {
  return readUsersFromFile();
}

export async function createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
  const users = readUsersFromFile();

  // Check if email already exists
  if (users.some(user => user.email === data.email)) {
    throw new Error('User with this email already exists');
  }

  // Generate temp password
  const tempPassword = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
  const hashedPassword = await hash(tempPassword, 12);

  const newUser: User = {
    id: crypto.randomUUID(),
    email: data.email,
    name: data.name,
    role: data.role,
    is_active: true,
    must_change_password: true,
    password_hash: hashedPassword,
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsersToFile(users);

  return {
    ...data,
    temp_password: tempPassword,
  };
}

export async function updateUserPassword(userId: string, hashedPassword: string): Promise<User | SeedUser> {
  const users = readUsersFromFile();
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex !== -1) {
    users[userIndex].password_hash = hashedPassword;
    users[userIndex].must_change_password = false;
    writeUsersToFile(users);
    return users[userIndex];
  }

  const seed = await readSeedData();
  const seedUserIndex = seed.users.findIndex((user) => user.id === userId);
  if (seedUserIndex !== -1) {
    seed.users[seedUserIndex].password_hash = hashedPassword;
    writeSeedData(seed);
    return seed.users[seedUserIndex];
  }

  throw new Error('User not found');
}

export async function updateUserStatus(id: string, isActive: boolean): Promise<User> {
  const users = readUsersFromFile();
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex].is_active = isActive;
  writeUsersToFile(users);
  return users[userIndex];
}

const dataService = {
  readJsonFile,
  readJsonFileSync,
  readHomeData,
  readAppConfig,
  readSeedData,
  readSeedDailyConfig,
  findSeedUserByEmail,
  findSeedUserById,
  getSeedAdminEmail,
  getDailyConfig,
  updateDailyConfig,
  getTodayShift,
  getShiftById,
  getShiftByIdForUser,
  getExpensesByShiftId,
  addExpense,
  getPendingExpenses,
  approveExpense,
  rejectExpense,
  createShift,
  isShiftClosed,
  getPendingExpensesCount,
  getSystemMode,
  getDashboardData,
  getAuditShifts,
  getUsers,
  createUser,
  updateUserPassword,
  updateUserStatus,
};

export default dataService;
