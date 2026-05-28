/**
 * scripts/migrate.mjs — Aplica migraciones SQL y siembra admin + daily_config en Supabase.
 * Uso: node scripts/migrate.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// --- Cargar .env.local manualmente ---
function loadEnv() {
  const raw = readFileSync(join(root, '.env.local'), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}
loadEnv();

const MIGRATIONS_DIR = join(root, 'supabase', 'migrations');
const SEED = JSON.parse(readFileSync(join(root, 'data', 'seed.json'), 'utf8'));

async function main() {
  const rawConn = process.env.SUPABASE_BUSETAAPP_POSTGRES_URL_NON_POOLING;
  if (!rawConn) throw new Error('Falta SUPABASE_BUSETAAPP_POSTGRES_URL_NON_POOLING');
  // Quitar query params (sslmode=require forzaría verify-full); usamos el objeto ssl.
  const connectionString = rawConn.split('?')[0];

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✓ Conectado a Supabase Postgres');

  // _migrations debe existir antes de consultar; la crea 0001, así que la garantizamos aparte.
  await client.query(`CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY, filename VARCHAR(255) UNIQUE NOT NULL, applied_at TIMESTAMPTZ DEFAULT NOW())`);

  const applied = new Set((await client.query('SELECT filename FROM _migrations')).rows.map((r) => r.filename));
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`• ${file} (ya aplicada)`);
      continue;
    }
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`✓ ${file} aplicada`);
    } catch (e) {
      await client.query('ROLLBACK');
      throw new Error(`Fallo en ${file}: ${e.message}`);
    }
  }

  // --- Seed admin ---
  const admin = SEED.users.find((u) => u.role === 'admin');
  if (admin) {
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [admin.email]);
    if (existing.rowCount === 0) {
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role, is_active, must_change_password)
         VALUES ($1, $2, $3, 'admin', true, false) RETURNING id`,
        [admin.name, admin.email, admin.password_hash],
      );
      console.log(`✓ Admin sembrado: ${admin.email} (id=${res.rows[0].id})`);
    } else {
      // Mantener el hash del seed sincronizado (por si cambió la contraseña en el seed).
      await client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [admin.password_hash, admin.email]);
      console.log(`• Admin ya existe: ${admin.email} (hash sincronizado)`);
    }
  }

  // --- Seed daily_config (1 fila) ---
  const cfg = await client.query('SELECT id FROM daily_config LIMIT 1');
  if (cfg.rowCount === 0) {
    await client.query('INSERT INTO daily_config (daily_fee, expense_limit) VALUES ($1, $2)', [
      SEED.daily_config.daily_fee,
      SEED.daily_config.expense_limit,
    ]);
    console.log(`✓ daily_config sembrada: tarifa ${SEED.daily_config.daily_fee} / límite ${SEED.daily_config.expense_limit}`);
  } else {
    console.log('• daily_config ya existe');
  }

  await client.end();
  console.log('\n✅ Migración + seed completados.');
}

main().catch((e) => {
  console.error('\n❌ Error:', e.message);
  process.exit(1);
});
