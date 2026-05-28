-- 0002_init_config.sql — Configuración global (1 sola fila)
CREATE TABLE IF NOT EXISTS daily_config (
  id            SERIAL        PRIMARY KEY,
  daily_fee     DECIMAL(10,2) NOT NULL CHECK (daily_fee > 0),
  expense_limit DECIMAL(10,2) NOT NULL CHECK (expense_limit > 0),
  updated_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);
