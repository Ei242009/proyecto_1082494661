-- 0004_init_expenses.sql — Gastos
CREATE TABLE IF NOT EXISTS expenses (
  id               UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_id         UUID          NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  category         VARCHAR(20)   NOT NULL
                   CHECK (category IN ('combustible', 'peaje', 'lavado', 'reparacion', 'otro')),
  amount           DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description      TEXT,
  status           VARCHAR(10)   NOT NULL DEFAULT 'APROBADO'
                   CHECK (status IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')),
  rejection_reason TEXT,
  approved_by      UUID          REFERENCES users(id) ON DELETE SET NULL,
  approved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_shift    ON expenses(shift_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status   ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_pending  ON expenses(status) WHERE status = 'PENDIENTE';
