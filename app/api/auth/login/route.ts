import { compare } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { LoginRequestSchema } from '@/lib/validators';
import { createUserJwt } from '@/lib/auth';
import { findSeedUserByEmail, getUsers } from '@/lib/dataService';
import type { SeedUser, User } from '@/lib/types';

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

    // Check seed users first
    let user: SeedUser | User | undefined = await findSeedUserByEmail(parsed.data.email);
    let mustChangePassword = false;

    if (!user) {
      // Check created users
      const users = await getUsers();
      const createdUser = users.find(u => u.email === parsed.data.email && u.is_active);
      if (createdUser) {
        mustChangePassword = createdUser.must_change_password;
        // For created users, password is stored as hash
        const isValidPassword = await compare(parsed.data.password, createdUser.password_hash || '');
        if (!isValidPassword) {
          return NextResponse.json(
            { error: 'Credenciales inválidas' },
            { status: 401, headers: { 'Cache-Control': 'no-store' } },
          );
        }
        user = createdUser;
      }
    } else {
      // Seed user
      const isValidPassword = await compare(parsed.data.password, user.password_hash);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Credenciales inválidas' },
          { status: 401, headers: { 'Cache-Control': 'no-store' } },
        );
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const token = await createUserJwt({
      userId: user.id,
      role: user.role,
      email: user.email,
      mustChangePassword,
    });

    const response = NextResponse.json(
      { success: true, role: user.role, mustChangePassword },
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
