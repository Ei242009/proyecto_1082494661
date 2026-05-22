/**
 * app/api/auth/logout/route.ts
 * GET /api/auth/logout
 * Limpia la cookie de autenticación
 */

import { NextResponse } from 'next/server';
import { createClearAuthCookie } from '@/lib/authService';
import type { ApiSuccess } from '@/lib/types';

export async function GET(): Promise<NextResponse> {
  const response: ApiSuccess<{ message: string }> = {
    success: true,
    data: { message: 'Sesión cerrada' },
    timestamp: new Date().toISOString(),
  };

  const nextResponse = NextResponse.json(response, { status: 200 });
  nextResponse.headers.set('Set-Cookie', createClearAuthCookie());

  return nextResponse;
}
