import fs from 'fs';
import path from 'path';
import { SeedDataSchema } from './validators';
import type { LiquidationResult, ReceiptData, Shift, Expense, SeedData } from './types';

function getShiftsFilePath(): string {
  return path.join(process.cwd(), 'data', 'shifts.json');
}

function getExpensesFilePath(): string {
  return path.join(process.cwd(), 'data', 'expenses.json');
}

function getSeedFilePath(): string {
  return path.join(process.cwd(), 'data', 'seed.json');
}

function readJsonFileSync<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function readSeedData(): SeedData {
  const seed = readJsonFileSync<unknown>(getSeedFilePath());
  return SeedDataSchema.parse(seed);
}

function readShiftsFromFile(): Shift[] {
  if (!fs.existsSync(getShiftsFilePath())) {
    return [];
  }
  return readJsonFileSync<Shift[]>(getShiftsFilePath());
}

function readExpensesFromFile(): Expense[] {
  if (!fs.existsSync(getExpensesFilePath())) {
    return [];
  }
  return readJsonFileSync<Expense[]>(getExpensesFilePath());
}

function getShiftById(shiftId: string): Shift | null {
  const shifts = readShiftsFromFile();
  return shifts.find((shift) => shift.id === shiftId) ?? null;
}

export async function calculateNetIncome(shiftId: string): Promise<LiquidationResult> {
  const shift = getShiftById(shiftId);
  if (!shift) {
    throw new Error('Shift not found');
  }

  const allExpenses = readExpensesFromFile();
  const approvedExpenses = allExpenses.filter(
    (expense) => expense.shift_id === shiftId && expense.status === 'APROBADO',
  );

  const totalApproved = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const basePostFee = shift.gross_income - shift.daily_fee_snapshot;
  const netIncome = basePostFee - totalApproved;

  return {
    gross_income: shift.gross_income,
    daily_fee_snapshot: shift.daily_fee_snapshot,
    base_post_fee: basePostFee,
    total_approved_expenses: totalApproved,
    net_income: netIncome,
    approved_expenses: approvedExpenses.map((expense) => ({
      id: expense.id,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      created_at: expense.created_at,
    })),
  };
}

export async function buildReceipt(shiftId: string): Promise<ReceiptData> {
  const shift = getShiftById(shiftId);
  if (!shift) {
    throw new Error('Shift not found');
  }

  const seed = readSeedData();
  const conductorName = seed.users.find((user) => user.id === shift.conductor_id)?.name ?? 'Conductor';
  const closedByName = shift.closed_by
    ? seed.users.find((user) => user.id === shift.closed_by)?.name ?? 'Propietaria'
    : 'Propietaria';

  const result = await calculateNetIncome(shiftId);

  return {
    shiftId,
    conductor_name: conductorName,
    closed_by_name: closedByName,
    closed_at: shift.closed_at ?? new Date().toISOString(),
    gross_income: result.gross_income,
    daily_fee_snapshot: result.daily_fee_snapshot,
    base_post_fee: result.base_post_fee,
    approved_expenses: result.approved_expenses.map((expense) => ({
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      time: new Date(expense.created_at).toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    })),
    net_income: result.net_income,
  };
}
