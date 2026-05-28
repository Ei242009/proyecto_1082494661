import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyUserJwt } from '@/lib/auth';
import { approveExpense, ExpenseNotFoundError } from '@/lib/dataService';

interface Params {
  params: Promise<{ id: string }>;
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

  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    const { id } = await context.params;
    const expense = await approveExpense(id, user.userId);
    return NextResponse.json(expense, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof ExpenseNotFoundError) {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }

    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
