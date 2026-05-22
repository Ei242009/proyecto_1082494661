import { NextRequest, NextResponse } from 'next/server';
import { verifyUserJwt } from './auth';
import type { JwtUser } from './types';

export function withAuth(
  handler: (request: NextRequest, context: unknown, user: JwtUser) => Promise<NextResponse>,
) {
  return async function (request: NextRequest, context?: unknown) {
    const token = request.cookies.get('buseta_session')?.value;

    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    try {
      const user = await verifyUserJwt(token);
      return await handler(request, context, user);
    } catch {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }
  };
}
