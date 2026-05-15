import { NextRequest, NextResponse } from 'next/server';
import type { JwtUser } from './types';

export function withRole(
  allowedRoles: Array<JwtUser['role']>,
  handler: (request: NextRequest, context: unknown, user: JwtUser) => Promise<NextResponse>,
) {
  return async function (request: NextRequest, context: unknown, user: JwtUser): Promise<NextResponse> {
    if (!allowedRoles.includes(user.role)) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }
    return handler(request, context, user);
  };
}
