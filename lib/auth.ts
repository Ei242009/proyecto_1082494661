import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { JwtUser } from './types';

const encoder = new TextEncoder();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error('JWT_SECRET is not configured in the environment');
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
  };
}
