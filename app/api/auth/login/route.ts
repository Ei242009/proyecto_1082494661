import { compare } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { LoginRequestSchema } from '@/lib/validators';
import { createUserJwt } from '@/lib/auth';
import { getUserByEmail, recordAudit } from '@/lib/dataService';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = LoginRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parsed.error.issues },
        { status: 400, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const user = await getUserByEmail(parsed.data.email);

    if (!user || !user.is_active || !user.password_hash) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const isValidPassword = await compare(parsed.data.password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const token = await createUserJwt({
      userId: user.id,
      role: user.role,
      email: user.email,
      mustChangePassword: user.must_change_password,
    });

    await recordAudit({
      user_id: user.id,
      user_email: user.email,
      user_role: user.role,
      action: 'login',
      entity: 'system',
      summary: `Inicio de sesión: ${user.email} (${user.role})`,
    });

    const response = NextResponse.json(
      { success: true, role: user.role, mustChangePassword: user.must_change_password },
      { headers: { 'Cache-Control': 'no-store' } },
    );

    response.cookies.set('buseta_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected login error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
