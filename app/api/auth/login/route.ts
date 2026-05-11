import { compare } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { LoginRequestSchema } from '@/lib/validators';
import { createUserJwt } from '@/lib/auth';
import { findSeedUserByEmail } from '@/lib/dataService';

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

    const user = await findSeedUserByEmail(parsed.data.email);
    if (!user) {
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
    });

    const response = NextResponse.json(
      { success: true, role: user.role },
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
