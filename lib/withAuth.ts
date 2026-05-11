import { NextRequest, NextResponse } from 'next/server';
import { verifyUserJwt } from './auth';

export async function withAuth(request: NextRequest) {
  const token = request.cookies.get('buseta_session')?.value;

  if (!token) {
    throw new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  try {
    return await verifyUserJwt(token);
  } catch {
    throw new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
}
