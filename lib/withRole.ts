import { NextResponse } from 'next/server';
import type { JwtUser } from './types';

export function withRole(user: JwtUser, allowedRoles: Array<JwtUser['role']>) {
  if (!allowedRoles.includes(user.role)) {
    throw new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  return user;
}
