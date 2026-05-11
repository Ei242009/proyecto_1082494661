import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getTodayShift } from '@/lib/dataService';
import { verifyUserJwt } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const user = await verifyUserJwt(token).catch(() => null);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const shift = await getTodayShift(user.userId);
  return NextResponse.json({ shift }, { headers: { 'Cache-Control': 'no-store' } });
}
