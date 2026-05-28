import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyUserJwt } from '@/lib/auth';
import { closeShift, ShiftClosedError } from '@/lib/dataService';

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

  const payload = await request.json().catch(() => ({}));
  const force = Boolean(payload.force);

  try {
    const { id } = await context.params;
    const result = await closeShift(id, user.userId, force);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof ShiftClosedError) {
      return NextResponse.json({ error: 'SHIFT_CLOSED' }, { status: 409, headers: { 'Cache-Control': 'no-store' } });
    }

    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
