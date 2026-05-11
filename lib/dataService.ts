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
import { AppConfigSchema, DailyConfigSchema, HomeDataSchema, SeedDataSchema } from './validators';
import type {
  AppConfig,
  CreateShiftRequest,
  DailyConfig,
  HomeData,
  SeedData,
  SeedUser,
  Shift,
  UpdateDailyConfigRequest,
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

export async function readSeedDailyConfig(): Promise<DailyConfig> {
  const seed = await readSeedData();
  return seed.daily_config;
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
    return 0;
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

export default {
  readJsonFile,
  readJsonFileSync,
  readHomeData,
  readAppConfig,
  readSeedData,
  readSeedDailyConfig,
  findSeedUserByEmail,
  getDailyConfig,
  updateDailyConfig,
  getTodayShift,
  getShiftById,
  getShiftByIdForUser,
  createShift,
  isShiftClosed,
  getPendingExpensesCount,
  getSystemMode,
};
