import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { JwtUser } from './types';

const encoder = new TextEncoder();

function getJwtSecret() {
  // En local usamos JWT_SECRET (.env.local). En Vercel, la integración de Supabase
  // inyecta SUPABASE_BUSETAAPP_SUPABASE_JWT_SECRET, que usamos como fallback para
  // no tener que configurar JWT_SECRET a mano en el panel de Vercel.
  const secret =
    process.env.JWT_SECRET?.trim() ||
    process.env.SUPABASE_BUSETAAPP_SUPABASE_JWT_SECRET?.trim();
  if (!secret) {
    throw new Error(
      'No hay secreto JWT: define JWT_SECRET o SUPABASE_BUSETAAPP_SUPABASE_JWT_SECRET en el entorno.',
    );
  }
  return encoder.encode(secret);
}

export async function createUserJwt(payload: JwtUser): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJwtSecret());
}

export async function verifyUserJwt(token: string): Promise<JwtUser> {
  const { payload } = await jwtVerify(token, getJwtSecret());

  if (!payload.userId || !payload.role || !payload.email) {
    throw new Error('Invalid JWT payload');
  }

  return {
    userId: String(payload.userId),
    role: String(payload.role) as JwtUser['role'],
    email: String(payload.email),
    mustChangePassword: Boolean(payload.mustChangePassword),
  };
}

export function parseJwtPayload(payload: JWTPayload): JwtUser {
  if (!payload.userId || !payload.role || !payload.email) {
    throw new Error('Invalid JWT payload');
  }

  return {
    userId: String(payload.userId),
    role: String(payload.role) as JwtUser['role'],
    email: String(payload.email),
    mustChangePassword: Boolean(payload.mustChangePassword),
  };
}
