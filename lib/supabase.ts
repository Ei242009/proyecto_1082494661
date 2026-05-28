/**
 * lib/supabase.ts — Cliente Supabase (solo servidor)
 *
 * Único módulo que instancia el cliente Supabase. Lo importa exclusivamente
 * `dataService.ts`. Usa la SERVICE ROLE KEY: bypassa RLS porque toda la
 * autorización se hace en la capa de aplicación (withAuth / withRole).
 *
 * Nombres de variable según el entorno provisto (prefijo SUPABASE_BUSETAAPP_*).
 *
 * ⚠️ NUNCA importar este módulo desde un Client Component.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_BUSETAAPP_SUPABASESUPABASE_URL?.trim() ?? '';

const SERVICE_ROLE_KEY =
  process.env.SUPABASE_BUSETAAPP_SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';

let cachedClient: SupabaseClient | null = null;

/**
 * Indica si Supabase está configurado (URL + service role key presentes).
 */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SERVICE_ROLE_KEY.length > 0;
}

/**
 * Devuelve el cliente Supabase con permisos de servicio (lazy singleton).
 * Lanza si falta configuración — solo debe llamarse en modo `live`.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase no está configurado: faltan NEXT_PUBLIC_SUPABASE_BUSETAAPP_SUPABASESUPABASE_URL ' +
        'o SUPABASE_BUSETAAPP_SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  if (!cachedClient) {
    cachedClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return cachedClient;
}

/**
 * Cadena de conexión Postgres directa (no pooling) — para migraciones DDL con `pg`.
 */
export function getPostgresMigrationUrl(): string {
  const url = process.env.SUPABASE_BUSETAAPP_POSTGRES_URL_NON_POOLING?.trim();
  if (!url) {
    throw new Error('Falta SUPABASE_BUSETAAPP_POSTGRES_URL_NON_POOLING para migraciones.');
  }
  return url;
}
