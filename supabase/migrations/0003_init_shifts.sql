-- 0003_init_shifts.sql — Turnos
CREATE TABLE IF NOT EXISTS shifts (
  id                  UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  conductor_id        UUID          NOT NULL REFERENCES users(id),
  shift_date          DATE          NOT NULL,
  gross_income        DECIMAL(12,2) NOT NULL CHECK (gross_income > 0),
  daily_fee_snapshot  DECIMAL(10,2) NOT NULL,
  status              VARCHAR(10)   NOT NULL DEFAULT 'ABIERTO'
                      CHECK (status IN ('ABIERTO', 'CERRADO')),
  closed_by           UUID          REFERENCES users(id) ON DELETE SET NULL,
  closed_at           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE (conductor_id, shift_date)
);

CREATE INDEX IF NOT EXISTS idx_shifts_conductor  ON shifts(conductor_id, shift_date DESC);
CREATE INDEX IF NOT EXISTS idx_shifts_date       ON shifts(shift_date DESC);
CREATE INDEX IF NOT EXISTS idx_shifts_status     ON shifts(status);
