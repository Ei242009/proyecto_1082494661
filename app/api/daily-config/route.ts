import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDailyConfig, updateDailyConfig } from '@/lib/dataService';
import { UpdateDailyConfigSchema } from '@/lib/validators';
import { verifyUserJwt } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  const user = token ? await verifyUserJwt(token).catch(() => null) : null;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  const config = await getDailyConfig();
  return NextResponse.json(config, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const user = await verifyUserJwt(token).catch(() => null);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }

  const payload = await request.json().catch(() => ({}));
  const parsed = UpdateDailyConfigSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.issues },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const config = await updateDailyConfig(parsed.data);
  return NextResponse.json(config, { headers: { 'Cache-Control': 'no-store' } });
}
