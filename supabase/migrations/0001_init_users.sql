-- 0001_init_users.sql — Usuarios + control de migraciones
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(10)  NOT NULL DEFAULT 'conductor'
                       CHECK (role IN ('conductor', 'admin', 'socio')),
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
