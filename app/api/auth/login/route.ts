/**
 * app/api/auth/login/route.ts
 * POST /api/auth/login
 * Autentica usuario y retorna JWT en cookie HttpOnly
 */

import { NextRequest, NextResponse } from 'next/server';
import { LoginRequestSchema } from '@/lib/validators';
import { findUserByEmail } from '@/lib/seedReader';
import { comparePassword, generateJWT, createAuthCookie } from '@/lib/authService';
import type { LoginResponse, ApiError } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parsear body
    const body = await request.json();

    // Validar con Zod
    const result = LoginRequestSchema.safeParse(body);
    if (!result.success) {
      const error: ApiError = {
        error: 'Validación fallida',
        code: 'VALIDATION_ERROR',
        details: result.error.issues.map((i) => i.message).join('; '),
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(error, { status: 400 });
    }

    const { email, password } = result.data;

    // Buscar usuario en seed
    const user = findUserByEmail(email);
    if (!user) {
      const error: ApiError = {
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND',
        details: `El email '${email}' no existe en el sistema`,
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Comparar contraseña
    const passwordMatch = await comparePassword(password, user.passwordHash);
    if (!passwordMatch) {
      const error: ApiError = {
        error: 'Contraseña incorrecta',
        code: 'INVALID_PASSWORD',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Generar JWT
    const token = generateJWT(user.userId, user.role, user.email);

    // Crear respuesta con cookie HttpOnly
    const response: LoginResponse = {
      success: true,
      userId: user.userId,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    const nextResponse = NextResponse.json(response, { status: 200 });
    nextResponse.headers.set('Set-Cookie', createAuthCookie(token));

    return nextResponse;
  } catch (error) {
    console.error('[api/auth/login] Error:', error);
    const apiError: ApiError = {
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
