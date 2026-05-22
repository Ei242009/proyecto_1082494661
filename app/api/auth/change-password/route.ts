import { compare, hash } from 'bcryptjs';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/withAuth';
import { findSeedUserById, getUsers, updateUserPassword } from '@/lib/dataService';
import { createUserJwt } from '@/lib/auth';
import type { JwtUser } from '@/lib/types';

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

async function handler(request: NextRequest, _context: unknown, user: JwtUser) {
  try {
    const payload = await request.json();
    const parsed = ChangePasswordSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parsed.error.issues },
        { status: 400, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const currentPassword = parsed.data.currentPassword;
    const newPassword = parsed.data.newPassword;

    const users = await getUsers();
    const storedUser = users.find((item) => item.id === user.userId);

    if (storedUser) {
      const isValidPassword = await compare(currentPassword, storedUser.password_hash || '');
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401, headers: { 'Cache-Control': 'no-store' } },
        );
      }

      const hashedPassword = await hash(newPassword, 12);
      await updateUserPassword(user.userId, hashedPassword);

      const token = await createUserJwt({
        userId: user.userId,
        role: user.role,
        email: user.email,
        mustChangePassword: false,
      });

      const response = NextResponse.json(
        { success: true },
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
    }

    const seedUser = await findSeedUserById(user.userId);
    if (!seedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }

    const isValidPassword = await compare(currentPassword, seedUser.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const hashedPassword = await hash(newPassword, 12);
    await updateUserPassword(user.userId, hashedPassword);

    const token = await createUserJwt({
      userId: user.userId,
      role: user.role,
      email: user.email,
      mustChangePassword: false,
    });

    const response = NextResponse.json(
      { success: true },
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
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

export const POST = withAuth(handler);