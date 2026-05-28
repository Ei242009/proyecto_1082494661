-- 0005_init_audit_log.sql — Auditoría en Supabase (reemplaza Vercel Blob)
-- Bitácora append-only de operaciones. Todo se persiste aquí, en Supabase.
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  ts          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  yyyymm      VARCHAR(6)   NOT NULL,                     -- partición lógica por mes (ej: '202605')
  user_id     TEXT,
  user_email  VARCHAR(255),
  user_role   VARCHAR(10)  CHECK (user_role IN ('conductor', 'admin', 'socio')),
  action      VARCHAR(30)  NOT NULL,
  entity      VARCHAR(20)  NOT NULL,
  entity_id   TEXT,
  summary     TEXT         NOT NULL,
  metadata    JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_yyyymm ON audit_log(yyyymm, ts DESC);
CREATE INDEX IF NOT EXISTS idx_audit_ts     ON audit_log(ts DESC);
