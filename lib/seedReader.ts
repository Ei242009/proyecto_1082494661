/**
 * lib/seedReader.ts — Lee el seed.json y expone datos
 * Usado en modo 'seed' para inicialización
 */

import fs from 'fs';
import path from 'path';
import { SeedData, DailyConfig, User } from './types';

const SEED_PATH = path.join(process.cwd(), 'data', 'seed.json');

/**
 * Lee el archivo seed.json completo
 */
export function readSeed(): SeedData {
  try {
    const rawData = fs.readFileSync(SEED_PATH, 'utf-8');
    return JSON.parse(rawData) as SeedData;
  } catch (error) {
    console.error('[seedReader] Error leyendo seed.json:', error);
    throw new Error('No se puede leer seed.json');
  }
}

/**
 * Retorna la configuración diaria (tarifa, límite de gasto)
 * Disponible en modo seed para uso en componentes
 */
export function getDailyConfig(): DailyConfig {
  const seed = readSeed();
  return seed.daily_config;
}

/**
 * Busca un usuario por email en el seed
 */
export function findUserByEmail(email: string): User | null {
  const seed = readSeed();
  return seed.users.find((u) => u.email === email) || null;
}

/**
 * Busca un usuario por userId
 */
export function findUserById(userId: string): User | null {
  const seed = readSeed();
  return seed.users.find((u) => u.userId === userId) || null;
}

/**
 * Retorna todos los usuarios
 */
export function getAllUsers(): User[] {
  const seed = readSeed();
  return seed.users;
}

/**
 * Obtiene la información de una empresa
 */
export function getCompanyById(companyId: string) {
  const seed = readSeed();
  return seed.companies.find((c) => c.companyId === companyId) || null;
}

/**
 * Obtiene el email del propietario (socio) por companyId
 */
export function getOwnerEmailByCompanyId(companyId: string): string | null {
  const company = getCompanyById(companyId);
  return company?.ownerEmail || null;
}
