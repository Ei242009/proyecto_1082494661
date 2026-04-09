/**
 * Data Access Layer — Servicio de lectura de archivos JSON
 * 
 * Módulo centralizado para leer archivos JSON desde la carpeta /data/
 * con tipado genérico estricto mediante TypeScript.
 * 
 * ⚠️ Uso exclusivo desde servidor: API Routes, Server Components, etc.
 * ❌ NO usar en Client Components
 */

import fs from 'fs';
import path from 'path';
import { AppConfigSchema, HomeDataSchema } from './validators';
import type { AppConfig, HomeData } from './types';

/**
 * Lee y parsea un archivo JSON desde la carpeta /data/
 * con tipado genérico estricto.
 * 
 * @template T — Tipo genérico de los datos a retornar
 * @param fileName — Nombre del archivo JSON (ej: 'config.json')
 * @returns Datos parseados con tipo T
 * 
 * @throws Error si el archivo no existe o no es JSON válido
 * 
 * @example
 * ```typescript
 * import { readJsonFile } from '@/lib/dataService';
 * import type { AppConfig } from '@/lib/types';
 * 
 * const config = await readJsonFile<AppConfig>('config.json');
 * ```
 */
export async function readJsonFile<T>(fileName: string): Promise<T> {
  try {
    const filePath = path.join(process.cwd(), 'data', fileName);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(
      `Failed to read JSON file: data/${fileName}. ` +
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Función sincrónica alternativa para lecturas inmediatas
 * (útil en contextos donde await no está disponible)
 * 
 * ⚠️ Sincronía puede bloquear el event loop. Usar solo en startup.
 */
export function readJsonFileSync<T>(fileName: string): T {
  try {
    const filePath = path.join(process.cwd(), 'data', fileName);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(
      `Failed to read JSON file synchronously: data/${fileName}. ` +
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function readHomeData(): Promise<HomeData> {
  const raw = await readJsonFile<unknown>('home.json');
  return HomeDataSchema.parse(raw);
}

export async function readAppConfig(): Promise<AppConfig> {
  const raw = await readJsonFile<unknown>('config.json');
  return AppConfigSchema.parse(raw);
}

export default {
  readJsonFile,
  readJsonFileSync,
  readHomeData,
  readAppConfig,
};
