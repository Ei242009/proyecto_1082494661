import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyUserJwt } from '@/lib/auth';
import { rejectExpense, ExpenseNotFoundError } from '@/lib/dataService';
import { RejectExpenseRequestSchema } from '@/lib/validators';

interface Params {
  params: { id: string };
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

  const payload = await request.json().catch(() => ({}));
  const parsed = RejectExpenseRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.issues },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const expense = await rejectExpense(context.params.id, user.userId, parsed.data.reason);
    return NextResponse.json(expense, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof ExpenseNotFoundError) {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }

    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
