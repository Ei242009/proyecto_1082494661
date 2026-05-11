import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getShiftByIdForUser } from '@/lib/dataService';
import { verifyUserJwt } from '@/lib/auth';

interface Params {
  params: { id: string };
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

  const shift = await getShiftByIdForUser(context.params.id, user.userId, user.role);
  if (!shift) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json({ shift }, { headers: { 'Cache-Control': 'no-store' } });
}
