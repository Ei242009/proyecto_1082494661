import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createShift } from '@/lib/dataService';
import { CreateShiftRequestSchema } from '@/lib/validators';
import { ShiftExistsError } from '@/lib/dataService';
import { verifyUserJwt } from '@/lib/auth';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const user = await verifyUserJwt(token).catch(() => null);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const payload = await request.json().catch(() => ({}));
  const parsed = CreateShiftRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.issues },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const shift = await createShift(user.userId, parsed.data);
    return NextResponse.json(shift, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof ShiftExistsError) {
      return NextResponse.json(
        { error: 'SHIFT_EXISTS', existingShift: error.existingShift },
        { status: 409, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
