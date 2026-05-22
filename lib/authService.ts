/**
 * lib/authService.ts — Autenticación, JWT, bcrypt
 * Maneja la seguridad de la aplicación
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWTPayload, UserRole } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

// ============================================================================
// JWT
// ============================================================================

/**
 * Genera un JWT con userId, role, email
 * El JWT expira en 24 horas
 */
export function generateJWT(
  userId: string,
  role: UserRole,
  email: string
): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId,
    role,
    email,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });

  return token;
}

/**
 * Valida y decodifica un JWT
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('[authService] JWT inválido o expirado:', error);
    return null;
  }
}

// ============================================================================
// BCRYPT
// ============================================================================

/**
 * Hashea una contraseña con bcryptjs
 * Usa salt rounds = 10 (estándar de seguridad)
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hashed = await bcrypt.hash(password, 10);
    return hashed;
  } catch (error) {
    console.error('[authService] Error hasheando contraseña:', error);
    throw new Error('No se puede hashear contraseña');
  }
}

/**
 * Compara una contraseña plana con su hash
 */
export async function comparePassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  try {
    const match = await bcrypt.compare(plainPassword, hash);
    return match;
  } catch (error) {
    console.error('[authService] Error comparando contraseñas:', error);
    return false;
  }
}

// ============================================================================
// COOKIES HTTP-ONLY
// ============================================================================

/**
 * Crea una cookie HttpOnly para almacenar el JWT
 * Retorna el string Set-Cookie
 */
export function createAuthCookie(token: string): string {
  const maxAge = 24 * 60 * 60; // 24 horas en segundos
  return `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

/**
 * Crea una cookie vacía para limpiar el JWT (logout)
 */
export function createClearAuthCookie(): string {
  return `token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Extrae el token JWT de las cookies
 * Usado en Route Handlers para obtener la cookie Set-Cookie
 */
export function extractTokenFromCookie(cookieHeader: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/token=([^;]*)/);
  return match ? match[1] : null;
}

/**
 * Retorna el tiempo de expiración del JWT en milisegundos
 */
export function getJWTExpirationType(): number {
  // Convierte '24h' a milisegundos
  const expStr = JWT_EXPIRATION;
  if (expStr.endsWith('h')) {
    const hours = parseInt(expStr);
    return hours * 60 * 60 * 1000;
  }
  return 24 * 60 * 60 * 1000; // Default 24 horas
}
