import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyUserJwt } from '@/lib/auth';
import { addExpense, getExpensesByShiftId, getShiftById, ShiftClosedError, ForbiddenError } from '@/lib/dataService';
import { AddExpenseRequestSchema } from '@/lib/validators';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: Params) {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const user = await verifyUserJwt(token).catch(() => null);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const { id } = await context.params;
  const shift = await getShiftById(id);
  if (!shift || (user.role === 'conductor' && shift.conductor_id !== user.userId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  const expenses = await getExpensesByShiftId(id);
  return NextResponse.json({ expenses }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request, context: Params) {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const user = await verifyUserJwt(token).catch(() => null);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const { id } = await context.params;
  const shift = await getShiftById(id);
  if (!shift) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  if (user.role === 'conductor' && shift.conductor_id !== user.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }

  const payload = await request.json().catch(() => ({}));
  const parsed = AddExpenseRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.issues },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const expense = await addExpense(user.userId, user.role, shift.id, parsed.data);
    return NextResponse.json(expense, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }

    if (error instanceof ShiftClosedError) {
      return NextResponse.json({ error: 'SHIFT_CLOSED', details: 'No se puede agregar un gasto a un turno cerrado.' }, { status: 409, headers: { 'Cache-Control': 'no-store' } });
    }

    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
