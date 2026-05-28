/**
 * lib/liquidationService.ts — Cálculo de Utilidad Neta y comprobante.
 * Lee de Supabase. La UN SIEMPRE se calcula en el servidor (RN-08, RNF-04).
 */
import { getSupabaseAdmin } from './supabase';
import type { LiquidationResult, ReceiptData } from './types';

function num(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number.parseFloat(value);
  return 0;
}

/**
 * Calcula la Utilidad Neta del turno. Solo cuenta gastos con status = 'APROBADO'.
 * UN = (IB - Tarifa Diaria) - Σ Gastos Aprobados
 */
export async function calculateNetIncome(shiftId: string): Promise<LiquidationResult> {
  const supabase = getSupabaseAdmin();

  const { data: shiftRow, error: shiftError } = await supabase
    .from('shifts')
    .select('gross_income, daily_fee_snapshot')
    .eq('id', shiftId)
    .maybeSingle();
  if (shiftError) throw new Error(`calculateNetIncome: ${shiftError.message}`);
  if (!shiftRow) throw new Error('Shift not found');

  const { data: expRows, error: expError } = await supabase
    .from('expenses')
    .select('id, category, amount, description, created_at')
    .eq('shift_id', shiftId)
    .eq('status', 'APROBADO')
    .order('created_at', { ascending: true });
  if (expError) throw new Error(`calculateNetIncome: ${expError.message}`);

  const approved = (expRows ?? []).map((e) => ({
    id: e.id as string,
    category: e.category as string,
    amount: num(e.amount),
    description: (e.description as string) ?? '',
    created_at: e.created_at as string,
  }));

  const grossIncome = num(shiftRow.gross_income);
  const dailyFee = num(shiftRow.daily_fee_snapshot);
  const totalApproved = approved.reduce((sum, e) => sum + e.amount, 0);
  const basePostFee = grossIncome - dailyFee;

  return {
    gross_income: grossIncome,
    daily_fee_snapshot: dailyFee,
    base_post_fee: basePostFee,
    total_approved_expenses: totalApproved,
    net_income: basePostFee - totalApproved,
    approved_expenses: approved,
  };
}

/**
 * Construye el comprobante digital de liquidación del turno cerrado.
 */
export async function buildReceipt(shiftId: string): Promise<ReceiptData> {
  const supabase = getSupabaseAdmin();

  const { data: shift, error } = await supabase
    .from('shifts')
    .select('conductor_id, closed_by, closed_at')
    .eq('id', shiftId)
    .maybeSingle();
  if (error) throw new Error(`buildReceipt: ${error.message}`);
  if (!shift) throw new Error('Shift not found');

  const ids = [shift.conductor_id, shift.closed_by].filter(Boolean) as string[];
  const { data: userRows } = await supabase.from('users').select('id, name').in('id', ids);
  const userMap = new Map((userRows ?? []).map((u) => [u.id as string, u.name as string]));

  const result = await calculateNetIncome(shiftId);

  return {
    shiftId,
    conductor_name: userMap.get(shift.conductor_id as string) ?? 'Conductor',
    closed_by_name: shift.closed_by ? userMap.get(shift.closed_by as string) ?? 'Propietaria' : 'Propietaria',
    closed_at: (shift.closed_at as string) ?? new Date().toISOString(),
    gross_income: result.gross_income,
    daily_fee_snapshot: result.daily_fee_snapshot,
    base_post_fee: result.base_post_fee,
    approved_expenses: result.approved_expenses.map((expense) => ({
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      time: new Date(expense.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    })),
    net_income: result.net_income,
  };
}
