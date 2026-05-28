/**
 * lib/pgMigrate.ts — Aplica migraciones + seed en Supabase Postgres.
 * SQL embebido (no depende de leer archivos en serverless). Idempotente.
 * Solo lo importa /api/admin/bootstrap (db-setup).
 */
import { Client } from 'pg';
import seed from '../data/seed.json';
import { getPostgresMigrationUrl } from './supabase';

interface Migration {
  filename: string;
  sql: string;
}

const MIGRATIONS: Migration[] = [
  {
    filename: '0001_init_users.sql',
    sql: `CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'conductor' CHECK (role IN ('conductor','admin','socio')),
  is_active BOOLEAN DEFAULT true,
  must_change_password BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
  },
  {
    filename: '0002_init_config.sql',
    sql: `CREATE TABLE IF NOT EXISTS daily_config (
  id SERIAL PRIMARY KEY,
  daily_fee DECIMAL(10,2) NOT NULL CHECK (daily_fee > 0),
  expense_limit DECIMAL(10,2) NOT NULL CHECK (expense_limit > 0),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`,
  },
  {
    filename: '0003_init_shifts.sql',
    sql: `CREATE TABLE IF NOT EXISTS shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conductor_id UUID NOT NULL REFERENCES users(id),
  shift_date DATE NOT NULL,
  gross_income DECIMAL(12,2) NOT NULL CHECK (gross_income > 0),
  daily_fee_snapshot DECIMAL(10,2) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'ABIERTO' CHECK (status IN ('ABIERTO','CERRADO')),
  closed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (conductor_id, shift_date)
);
CREATE INDEX IF NOT EXISTS idx_shifts_conductor ON shifts(conductor_id, shift_date DESC);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date DESC);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);`,
  },
  {
    filename: '0004_init_expenses.sql',
    sql: `CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL CHECK (category IN ('combustible','peaje','lavado','reparacion','otro')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'APROBADO' CHECK (status IN ('PENDIENTE','APROBADO','RECHAZADO')),
  rejection_reason TEXT,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expenses_shift ON expenses(shift_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_pending ON expenses(status) WHERE status = 'PENDIENTE';`,
  },
  {
    filename: '0005_init_audit_log.sql',
    sql: `CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  yyyymm VARCHAR(6) NOT NULL,
  user_id TEXT,
  user_email VARCHAR(255),
  user_role VARCHAR(10) CHECK (user_role IN ('conductor','admin','socio')),
  action VARCHAR(30) NOT NULL,
  entity VARCHAR(20) NOT NULL,
  entity_id TEXT,
  summary TEXT NOT NULL,
  metadata JSONB
);
CREATE INDEX IF NOT EXISTS idx_audit_yyyymm ON audit_log(yyyymm, ts DESC);
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_log(ts DESC);`,
  },
];

export interface BootstrapResult {
  log: string[];
}

export async function runMigrations(): Promise<BootstrapResult> {
  const connectionString = getPostgresMigrationUrl().split('?')[0];
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  const log: string[] = [];

  await client.connect();
  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS _migrations (id SERIAL PRIMARY KEY, filename VARCHAR(255) UNIQUE NOT NULL, applied_at TIMESTAMPTZ DEFAULT NOW())`,
    );

    const applied = new Set(
      (await client.query('SELECT filename FROM _migrations')).rows.map((r) => r.filename as string),
    );

    for (const m of MIGRATIONS) {
      if (applied.has(m.filename)) {
        log.push(`• ${m.filename} (ya aplicada)`);
        continue;
      }
      await client.query('BEGIN');
      try {
        await client.query(m.sql);
        await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [m.filename]);
        await client.query('COMMIT');
        log.push(`✓ ${m.filename} aplicada`);
      } catch (e) {
        await client.query('ROLLBACK');
        throw new Error(`Fallo en ${m.filename}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // Seed admin
    const admin = seed.users.find((u) => u.role === 'admin');
    if (admin) {
      const existing = await client.query('SELECT id FROM users WHERE email = $1', [admin.email]);
      if (existing.rowCount === 0) {
        await client.query(
          `INSERT INTO users (name, email, password_hash, role, is_active, must_change_password)
           VALUES ($1,$2,$3,'admin',true,false)`,
          [admin.name, admin.email, admin.password_hash],
        );
        log.push(`✓ Admin sembrado: ${admin.email}`);
      } else {
        log.push(`• Admin ya existe: ${admin.email}`);
      }
    }

    // Seed daily_config
    const cfg = await client.query('SELECT id FROM daily_config LIMIT 1');
    if (cfg.rowCount === 0) {
      await client.query('INSERT INTO daily_config (daily_fee, expense_limit) VALUES ($1,$2)', [
        seed.daily_config.daily_fee,
        seed.daily_config.expense_limit,
      ]);
      log.push(`✓ daily_config sembrada (tarifa ${seed.daily_config.daily_fee} / límite ${seed.daily_config.expense_limit})`);
    } else {
      log.push('• daily_config ya existe');
    }
  } finally {
    await client.end();
  }

  return { log };
}
