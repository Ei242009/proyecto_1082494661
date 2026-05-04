# BusetaApp — Plan Maestro del Sistema
> Sistema de Gestión Financiera de Transporte Individual | Versión 1.0
> Proyecto Fullstack Individual | Mayo 2026
> Stack: Next.js + TypeScript + Supabase Postgres + Vercel Blob + Resend + Vercel
> Estudiante: Eider Barreto | Doc: 1082494661

---

## Índice General

1. [Definición del sistema](#1-definición-del-sistema)
2. [Problema que resuelve](#2-problema-que-resuelve)
3. [Actores del sistema](#3-actores-del-sistema)
4. [Roles y permisos](#4-roles-y-permisos)
5. [Casos de uso](#5-casos-de-uso)
6. [Requerimientos funcionales](#6-requerimientos-funcionales)
7. [Reglas de negocio](#7-reglas-de-negocio)
8. [Stack tecnológico](#8-stack-tecnológico)
9. [Arquitectura de persistencia](#9-arquitectura-de-persistencia)
10. [Bootstrap y migrations](#10-bootstrap-y-migrations)
11. [Capa de datos unificada (dataService)](#11-capa-de-datos-unificada)
12. [Modelo de datos — Supabase Postgres](#12-modelo-de-datos--supabase-postgres)
13. [Fórmula de liquidación y estados del flujo](#13-fórmula-de-liquidación-y-estados-del-flujo)
14. [Auditoría en Vercel Blob](#14-auditoría-en-vercel-blob)
15. [Arquitectura de rutas](#15-arquitectura-de-rutas)
16. [Requerimientos no funcionales](#16-requerimientos-no-funcionales)
17. [Flujos de usuario y de trabajo](#17-flujos-de-usuario-y-de-trabajo)
18. [Diseño de interfaz](#18-diseño-de-interfaz)
19. [Plan de fases de implementación](#19-plan-de-fases-de-implementación)
20. [Estrategia de seguridad](#20-estrategia-de-seguridad)
21. [Restricciones del sistema](#21-restricciones-del-sistema)
22. [Glosario](#22-glosario)

---

## 1. Definición del sistema

**BusetaApp** es una aplicación web responsiva (Mobile-First) que digitaliza el ciclo financiero diario de una unidad de transporte (buseta). El sistema formaliza los acuerdos económicos entre el propietario del vehículo, el conductor y el socio/asociado de ruta, eliminando el manejo manual con cuadernos o WhatsApp.

El flujo central es: el conductor registra el ingreso bruto del turno y sus gastos operativos; la propietaria aprueba los gastos que superan el límite configurado; al final del día la propietaria cierra el turno y el sistema genera automáticamente el comprobante digital de liquidación.

El sistema opera completamente desde el navegador con Next.js App Router en Vercel. Persiste todos los datos en Supabase Postgres, envía notificaciones de gastos pendientes con Resend y registra la auditoría de operaciones en Vercel Blob.

---

## 2. Problema que resuelve

| Problema actual | Cómo lo resuelve BusetaApp |
|---|---|
| Registro manual en cuadernos o WhatsApp, propenso a errores y desacuerdos. | Registro digital trazable con usuario, fecha y hora en cada operación. |
| El propietario no sabe en tiempo real cuánto recaudó la buseta. | Dashboard en tiempo real con ingresos del día, gastos y utilidad calculada. |
| Gastos grandes se cargan sin supervisión, generando pérdidas no previstas. | Gastos que superan el límite van a estado `PENDIENTE` y no afectan la liquidación hasta ser aprobados. |
| Sin comprobante formal — desacuerdos a fin de mes. | Comprobante digital de liquidación generado automáticamente al cerrar el turno. |
| El socio no puede verificar que la tarifa fue cobrada correctamente. | Módulo de auditoría de solo lectura que el socio puede consultar en cualquier momento. |

---

## 3. Actores del sistema

| Actor | Nombre en el spec | Tipo | Descripción |
|---|---|---|---|
| **Conductor** | Wilfrido | Externo | Registra el turno diario y los gastos operativos desde el celular. |
| **Propietaria / Admin** | Bianeidis | Interno | Configura la tarifa y límites. Aprueba gastos. Cierra turnos y genera comprobantes. |
| **Socio / Asociado** | — | Externo | Solo lectura. Verifica que la tarifa diaria fue correctamente descontada. |
| **Sistema** | — | No humano | Calcula la liquidación, aplica reglas de gastos, genera el comprobante, envía notificaciones. |

> **No hay registro público.** Los usuarios (conductor, socio) los crea la propietaria (admin) desde el panel. El conductor no puede crear su propia cuenta.

---

## 4. Roles y permisos

### Matriz de permisos

| Recurso / Acción | Conductor | Propietaria (Admin) | Socio |
|---|:-:|:-:|:-:|
| Login / cambiar contraseña propia | ✅ | ✅ | ✅ |
| Acceder a `/admin/db-setup` | ❌ | ✅ | ❌ |
| **TURNOS** | | | |
| Crear turno del día (iniciar turno) | ✅ | ✅ | ❌ |
| Ver su turno activo | ✅ | ✅ | ❌ |
| Ver turnos de otros conductores | ❌ | ✅ | ❌ |
| Cerrar y liquidar turno | ❌ | ✅ | ❌ |
| **GASTOS** | | | |
| Agregar gasto a su turno activo | ✅ | ✅ | ❌ |
| Ver gastos de su turno | ✅ | ✅ | ❌ |
| Aprobar / Rechazar gasto pendiente | ❌ | ✅ | ❌ |
| **CONFIGURACIÓN** | | | |
| Configurar tarifa diaria y límite de gasto | ❌ | ✅ | ❌ |
| Crear / editar / suspender usuarios | ❌ | ✅ | ❌ |
| **REPORTES** | | | |
| Ver reportes diarios/semanales/mensuales | ❌ | ✅ | ❌ |
| **AUDITORÍA (SOCIO)** | | | |
| Ver turnos cerrados con tarifa descontada | ❌ | ✅ | ✅ |
| **AUDITORÍA TÉCNICA** | | | |
| Ver bitácora de operaciones (Blob) | ❌ | ✅ | ❌ |

### Restricciones importantes

**Conductor:** Solo puede ver y editar su turno activo del día (RN-06). No ve los turnos de otros conductores. Una vez que la propietaria cierra el turno, el conductor no puede modificarlo — solo consultar el comprobante.

**Socio:** Acceso de solo lectura absoluto (RN-05). Solo puede ver la pantalla de auditoría de turnos cerrados (fecha, IB, tarifa descontada, estado). No puede ver el detalle de gastos operativos.

---

## 5. Casos de uso

### Módulo de Autenticación

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-A1 | Iniciar sesión | Todos | Correo y contraseña. El sistema redirige al panel correspondiente según el rol. |
| CU-A2 | Cerrar sesión | Todos | Elimina la cookie de sesión. |
| CU-A3 | Cambiar contraseña | Todos | Actualiza contraseña verificando la actual. |

### Módulo de Turnos y Liquidación

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-01 | Iniciar turno | Conductor | Abre el turno del día ingresando el ingreso bruto. El sistema aplica el snapshot de la tarifa diaria. Solo un turno por conductor por día (RN-07). |
| CU-02 | Agregar gasto | Conductor | Agrega un gasto operativo (combustible, peaje, lavado, otro) con monto y descripción. El sistema verifica si supera el límite y lo pone en APROBADO o PENDIENTE automáticamente (RN-02). |
| CU-03 | Ver turno activo | Conductor | Resumen en tiempo real: IB, tarifa descontada, gastos aprobados, gastos pendientes y utilidad neta parcial. |
| CU-04 | Ver gastos pendientes | Propietaria | Lista de gastos en estado PENDIENTE de todos los conductores con todos los detalles. |
| CU-05 | Aprobar / Rechazar gasto | Propietaria | Cambia el estado del gasto a APROBADO o RECHAZADO. Si aprueba, el monto se incorpora al cálculo de la utilidad neta (RN-03). |
| CU-06 | Cerrar y liquidar turno | Propietaria | Ejecuta el cálculo final, genera el comprobante digital y bloquea el turno para edición (RN-04). Si hay gastos PENDIENTES, muestra advertencia antes de proceder. |
| CU-07 | Ver comprobante | Conductor / Propietaria | Visualiza el comprobante digital del turno cerrado con todos los ítems. Imprimible desde el navegador. |

### Módulo de Reportes

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-08 | Ver dashboard financiero | Propietaria | KPIs del día, semana y mes: total recaudado, total gastos, utilidad neta acumulada, gastos pendientes. |
| CU-09 | Auditar turnos (socio) | Socio / Propietaria | Lista de turnos cerrados con fecha, IB y tarifa descontada. Filtrable por rango de fechas. |

### Módulo de Configuración

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-10 | Configurar tarifa y límite | Propietaria | Actualiza la tarifa diaria y el monto límite de gasto. Los cambios aplican a los turnos creados a partir de ese momento — no afectan turnos ya abiertos. |
| CU-11 | Gestionar usuarios | Propietaria | Crea conductor, socio o admin con contraseña temporal. Activa/suspende cuentas. |

---

## 6. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-B1 | El sistema debe poder ejecutarse sin Supabase configurado, sirviendo el seed de `data/` para login inicial del admin. |
| RF-B2 | El sistema debe ofrecer `/admin/db-setup` para diagnóstico, migrations y seed. |
| RF-01 | El conductor puede iniciar sesión y acceder a su panel operativo. |
| RF-02 | El conductor puede crear el turno del día ingresando el ingreso bruto desde el celular. |
| RF-03 | El conductor puede registrar gastos operativos del turno con categoría, monto y descripción. |
| RF-04 | El sistema calcula automáticamente la liquidación con la fórmula: `UN = (IB - Tarifa Diaria) - Σ Gastos Aprobados`. |
| RF-05 | El sistema genera un comprobante digital de liquidación al cerrar el turno, visualizable desde el celular e imprimible. |
| RF-06 | La propietaria puede ver el resumen financiero diario, semanal y mensual desde su dashboard. |
| RF-07 | El sistema registra automáticamente como PENDIENTE cualquier gasto que supere el límite configurado y notifica a la propietaria por correo (Resend). |
| RF-08 | La propietaria puede aprobar o rechazar gastos pendientes desde su panel. |
| RF-09 | El socio puede ver los turnos cerrados con la tarifa diaria descontada (solo lectura). |
| RF-10 | La propietaria puede cerrar un turno bloqueando cualquier edición posterior. |

---

## 7. Reglas de negocio

| ID | Regla | Implementación técnica |
|---|---|---|
| RN-01 | La tarifa diaria se descuenta siempre primero. Se fija al momento de crear el turno como snapshot. No puede modificarse durante el turno activo. | Campo `daily_fee_snapshot` en `shifts`. Se copia de `daily_config.daily_fee` al crear el turno. Los cambios de tarifa no afectan turnos ya abiertos. |
| RN-02 | Un gasto que supere `daily_config.expense_limit` queda en estado `PENDIENTE` y no se incluye en la Utilidad Neta hasta ser aprobado. | Al registrar un gasto: `if amount > config.expense_limit` → `status = 'PENDIENTE'` + enviar email. Si no supera: `status = 'APROBADO'`. |
| RN-03 | Solo la propietaria (admin) puede aprobar, rechazar o modificar gastos en estado PENDIENTE. | `withRole(['admin'])` en los endpoints de aprobación/rechazo. |
| RN-04 | Un turno cerrado queda bloqueado para edición. | Al cerrar: `shifts.status = 'CERRADO'`. Todos los endpoints de escritura verifican `status !== 'CERRADO'` antes de ejecutar. |
| RN-05 | El socio tiene acceso de solo lectura. No puede crear, editar ni eliminar ningún registro. | `withRole(['admin', 'conductor'])` en todos los endpoints de escritura. El socio no tiene ningún endpoint de escritura disponible. |
| RN-06 | Un conductor solo puede ver y editar su turno activo del día. No puede acceder a turnos de otros conductores ni a turnos cerrados para editar. | Verificar `shifts.conductor_id === userId` en el servidor. Los conductores solo pueden hacer GET/PATCH en sus propios turnos. |
| RN-07 | No se puede registrar más de un turno activo por día para el mismo conductor. | UNIQUE en `shifts(conductor_id, shift_date)`. Capturar el error y retornar 409 con el turno existente. |
| RN-08 | La Utilidad Neta siempre se calcula en el servidor. | `UN = (gross_income - daily_fee_snapshot) - SUM(expenses WHERE shift_id = ? AND status = 'APROBADO')`. Nunca el cliente calcula el final. |

---

## 8. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Rutas, server components, API routes |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI | React | 19.x | Componentes del cliente |
| Estilos | Tailwind CSS | 4.x | Utilidades y responsive — Mobile-First |
| Animaciones | Framer Motion | 12.x | Transiciones |
| Validación | Zod | 4.x | Validación servidor y cliente |
| Autenticación | JWT (jose) + bcryptjs | — | Sesiones con cookie HttpOnly |
| Base de datos | Supabase Postgres | — | Datos estructurados de dominio |
| Cliente DB (migrations) | `pg` (node-postgres) | 8.x | SQL crudo desde bootstrap |
| Cliente DB (queries) | `@supabase/supabase-js` | 2.x | Queries del día a día |
| Notificaciones | Resend | — | Email de alerta de gastos pendientes |
| Auditoría | `@vercel/blob` | — | Logs append-only de operaciones |
| Iconos | Lucide React | — | Iconografía coherente |
| Deploy | Vercel | — | Hosting serverless |

### Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
JWT_SECRET=
ADMIN_BOOTSTRAP_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=    # ej: noreply@busetaapp.app
```

---

## 9. Arquitectura de persistencia

### 9.1 Destinos de persistencia

| Destino | Qué guarda | Por qué |
|---|---|---|
| **Supabase Postgres** | Usuarios, configuración diaria, turnos, gastos. | Todo el dominio financiero requiere SQL: sumar gastos aprobados, calcular UN, verificar turno existente del día, reportes por período. |
| **Vercel Blob** | Auditoría de operaciones del admin (`audit/<YYYYMM>.json`). | Logs append-only de alta frecuencia sin necesidad de SQL. |
| **`data/` en el repo** | Seed inicial: admin (propietaria) + configuración por defecto. | Read-only. Solo para arrancar antes del bootstrap. |

### 9.2 Reglas de oro

1. **`dataService.ts` es el ÚNICO punto de acceso a datos.**
2. **La Utilidad Neta siempre se calcula en el servidor** — el cliente nunca recibe la fórmula, solo el resultado (RN-08).
3. **El `daily_fee_snapshot` se copia al crear el turno** — los cambios de tarifa posteriores no afectan turnos ya abiertos (RN-01).
4. **Un turno CERRADO nunca puede modificarse** — verificación en el servidor en todos los endpoints de escritura (RN-04).
5. **CERO caché** en `/api/:path*`. Headers `no-store` desde `next.config.ts`.
6. **`get()` del SDK de Blob, nunca `fetch(url)`** para auditoría.
7. **Token de Blob accedido con función lazy** (`getBlobToken()`).

---

## 10. Bootstrap y migrations

### 10.1 Estructura de `data/` (solo semilla)

```
data/
  config.json     ← { "version": "1.0", "system_name": "BusetaApp" }
  seed.json       ← {
                      "users": [{
                        email: "propietaria@busetaapp.app",
                        password_hash: "<bcrypt admin123>",
                        name: "Bianeidis (Propietaria)",
                        role: "admin"
                      }],
                      "daily_config": {
                        "daily_fee": 80000,
                        "expense_limit": 200000
                      }
                    }
  README.md
```

> La tarifa diaria por defecto es $80.000 COP y el límite de gasto es $200.000 COP. La propietaria los configura desde el panel una vez que el sistema está operativo.

### 10.2 Estructura de `supabase/migrations/`

```
supabase/migrations/
  0001_init_users.sql        ← Fase 1: users + _migrations
  0002_init_config.sql       ← Fase 3: daily_config
  0003_init_shifts.sql       ← Fase 3: shifts
  0004_init_expenses.sql     ← Fase 4: expenses
```

---

## 11. Capa de datos unificada

`lib/dataService.ts` es el **único punto de acceso a datos** desde el resto de la aplicación.

### 11.1 Modos de operación

| Modo | Cuándo | Lecturas | Escrituras |
|---|---|---|---|
| **`seed`** | Sin migrations | `data/*.json` | Bloqueadas — solo login admin. |
| **`live`** | Con migrations | Supabase Postgres | Postgres + auditoría a Blob. |

### 11.2 Estructura interna de `lib/`

```
lib/
  dataService.ts        ← ÚNICO punto de acceso
  supabase.ts           ← Solo lo importa dataService
  blobAudit.ts          ← Solo lo importa dataService
  pgMigrate.ts          ← Solo lo importa /api/system/bootstrap
  seedReader.ts         ← Solo lo importa dataService en modo seed
  liquidationService.ts ← calculateNetIncome, buildReceipt
  emailService.ts       ← sendPendingExpenseAlert
  auth.ts
  withAuth.ts
  withRole.ts
  types.ts
  schemas.ts
  dateUtils.ts          ← Fechas en America/Bogota
```

### 11.3 API pública del `dataService`

```typescript
// Sistema
export async function getSystemMode(): Promise<'seed' | 'live'>
export async function getDailyConfig(): Promise<DailyConfig>
export async function updateDailyConfig(userId: string, data: UpdateConfigRequest): Promise<DailyConfig>

// Auth y usuarios
export async function getUserByEmail(email: string): Promise<User | null>
export async function getUserById(id: string): Promise<User | null>
export async function createUser(data: CreateUserRequest): Promise<User>
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User>
export async function listUsers(): Promise<SafeUser[]>

// Turnos
export async function getTodayShift(conductorId: string): Promise<ShiftWithDetails | null>
export async function getShiftById(id: string, userId: string, role: string): Promise<ShiftWithDetails | null>
export async function createShift(conductorId: string, data: CreateShiftRequest): Promise<Shift>
export async function closeShift(id: string, adminId: string): Promise<ShiftWithReceipt>
export async function getShifts(filters?: ShiftFilters): Promise<ShiftSummary[]>

// Gastos
export async function addExpense(conductorId: string, data: AddExpenseRequest): Promise<Expense>
export async function getPendingExpenses(): Promise<ExpenseWithShift[]>
export async function approveExpense(id: string, adminId: string): Promise<Expense>
export async function rejectExpense(id: string, adminId: string, reason: string): Promise<Expense>

// Dashboard y reportes
export async function getDashboardData(period: 'day' | 'week' | 'month'): Promise<DashboardData>
export async function getAuditShifts(filters: AuditFilters): Promise<AuditShiftRow[]>

// Auditoría
export async function recordAudit(entry: AuditEntry): Promise<void>
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]>
```

### 11.4 Lógica crítica en `lib/liquidationService.ts`

```typescript
// Calcula la Utilidad Neta del turno.
// Solo cuenta los gastos con status = 'APROBADO'.
// Nunca se ejecuta en el cliente — solo en el servidor.
export async function calculateNetIncome(shiftId: string): Promise<LiquidationResult> {
  const shift = await getShiftById(shiftId);
  const approvedExpenses = await supabase
    .from('expenses')
    .select('amount')
    .eq('shift_id', shiftId)
    .eq('status', 'APROBADO');

  const totalApproved = approvedExpenses.data?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const basePostFee = shift.gross_income - shift.daily_fee_snapshot;
  const netIncome = basePostFee - totalApproved;

  return {
    gross_income: shift.gross_income,
    daily_fee_snapshot: shift.daily_fee_snapshot,
    base_post_fee: basePostFee,
    total_approved_expenses: totalApproved,
    net_income: netIncome,
    expenses: approvedExpenses.data,
  };
}

// Construye el objeto del comprobante digital de liquidación.
// Incluye todos los ítems detallados y los metadatos del cierre.
export async function buildReceipt(shiftId: string, closedBy: string): Promise<ReceiptData>
```

---

## 12. Modelo de datos — Supabase Postgres

### Diagrama de entidades

```
users ──< shifts (conductor_id, closed_by)
shifts ──< expenses (shift_id, approved_by)
daily_config (1 sola fila — tarifa y límite vigentes)
```

### Migration `0001_init_users.sql`

```sql
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
```

### Migration `0002_init_config.sql`

```sql
-- Configuración global: tarifa diaria y límite de gasto.
-- Solo tiene 1 fila. Se actualiza con UPDATE, nunca INSERT adicional.
CREATE TABLE IF NOT EXISTS daily_config (
  id            SERIAL        PRIMARY KEY,
  daily_fee     DECIMAL(10,2) NOT NULL CHECK (daily_fee > 0),
  expense_limit DECIMAL(10,2) NOT NULL CHECK (expense_limit > 0),
  updated_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);
```

### Migration `0003_init_shifts.sql`

```sql
CREATE TABLE IF NOT EXISTS shifts (
  id                  UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  conductor_id        UUID          NOT NULL REFERENCES users(id),
  shift_date          DATE          NOT NULL,
  gross_income        DECIMAL(12,2) NOT NULL CHECK (gross_income > 0),
  daily_fee_snapshot  DECIMAL(10,2) NOT NULL,   -- copia de daily_config.daily_fee al crear (RN-01)
  status              VARCHAR(10)   NOT NULL DEFAULT 'ABIERTO'
                      CHECK (status IN ('ABIERTO', 'CERRADO')),
  closed_by           UUID          REFERENCES users(id) ON DELETE SET NULL,
  closed_at           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE (conductor_id, shift_date)  -- RN-07: un turno por conductor por día
);

CREATE INDEX IF NOT EXISTS idx_shifts_conductor  ON shifts(conductor_id, shift_date DESC);
CREATE INDEX IF NOT EXISTS idx_shifts_date       ON shifts(shift_date DESC);
CREATE INDEX IF NOT EXISTS idx_shifts_status     ON shifts(status);
```

### Migration `0004_init_expenses.sql`

```sql
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
```

---

## 13. Fórmula de liquidación y estados del flujo

### 13.1 Fórmula central

```
Utilidad Neta (UN) = (Ingreso Bruto - Tarifa Diaria) - Σ Gastos Aprobados

Donde:
  Ingreso Bruto      = shifts.gross_income
  Tarifa Diaria      = shifts.daily_fee_snapshot (snapshot al crear el turno)
  Σ Gastos Aprobados = SUM(expenses.amount WHERE shift_id = ? AND status = 'APROBADO')
```

### 13.2 Cálculo parcial durante el turno

Mientras el turno está `ABIERTO`, el conductor puede ver un cálculo parcial en tiempo real:

```
UN parcial = (IB - Tarifa) - Σ Gastos Aprobados

Gastos Pendientes = Σ Gastos donde status = 'PENDIENTE' (no cuentan hasta ser aprobados)
```

El comprobante final se genera solo al cerrar el turno y usa el mismo cálculo con los gastos aprobados en ese momento.

### 13.3 Estados de un turno

```
ABIERTO ──→ CERRADO
  (conductor crea)   (admin cierra)
  
Un turno CERRADO no puede volver a ABIERTO.
```

### 13.4 Estados de un gasto

```
             ┌── APROBADO (monto dentro del límite — automático)
Creado ──────┤
             └── PENDIENTE ──┬── APROBADO (admin aprueba)
                             └── RECHAZADO (admin rechaza)
```

### 13.5 Comportamiento al cerrar con gastos PENDIENTES

Si al cerrar el turno hay gastos en estado `PENDIENTE`, el sistema **no bloquea el cierre** pero muestra una advertencia:

> "Hay N gasto(s) pendiente(s) de aprobación por un total de $XXX.XXX. Si cierras ahora, quedarán excluidos del cálculo. ¿Deseas continuar?"

La propietaria decide si proceder (excluyendo los gastos pendientes) o esperar a revisarlos primero. Esta decisión queda registrada en auditoría.

---

## 14. Auditoría en Vercel Blob

### 14.1 Estructura de cada entrada

```typescript
type AuditEntry = {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'conductor' | 'admin' | 'socio';
  action:
    | 'login' | 'logout'
    | 'create_shift' | 'close_shift'
    | 'add_expense' | 'approve_expense' | 'reject_expense'
    | 'update_config' | 'create_user' | 'toggle_user'
    | 'bootstrap';
  entity: 'shift' | 'expense' | 'config' | 'user' | 'system';
  entity_id?: string;
  summary: string;  // "Turno 14/05 cerrado. IB: $450.000 · UN: $290.000"
  metadata?: Record<string, unknown>;
};
```

---

## 15. Arquitectura de rutas

### Estructura de carpetas

```
app/
  layout.tsx
  page.tsx                        ← Redirige a /dashboard o /login
  login/page.tsx                  ← Sin link de registro
  dashboard/page.tsx              ← Panel según rol
  shift/
    page.tsx                      ← Turno activo del conductor (o iniciar turno)
    [id]/page.tsx                 ← Detalle del turno (con comprobante si cerrado)
  expenses/
    pending/page.tsx              ← Gastos pendientes (solo admin)
  reports/page.tsx                ← Reportes diarios/semanales/mensuales (admin)
  audit/page.tsx                  ← Auditoría de turnos para el socio y admin
  config/page.tsx                 ← Configuración de tarifa y límite (admin)
  profile/page.tsx                ← Cambiar contraseña
  admin/
    db-setup/page.tsx
    users/page.tsx
    audit-log/page.tsx            ← Bitácora del Blob (solo admin)

  api/
    system/bootstrap | diagnose | mode
    auth/login | logout | me | change-password
    config/route.ts               ← GET | PUT (admin)
    shifts/
      route.ts                    ← GET lista (admin) | POST crear
      today/route.ts              ← GET turno de hoy del conductor
      [id]/route.ts               ← GET detalle
      [id]/close/route.ts         ← POST cerrar turno (admin)
      [id]/expenses/route.ts      ← GET gastos | POST agregar gasto
    expenses/
      pending/route.ts            ← GET gastos pendientes (admin)
      [id]/approve/route.ts       ← POST aprobar (admin)
      [id]/reject/route.ts        ← POST rechazar (admin)
    dashboard/route.ts            ← GET KPIs por período (admin)
    audit/route.ts                ← GET turnos para auditoría (admin + socio)
    users/route.ts | [id]/route.ts
    audit-log/route.ts            ← GET bitácora Blob (admin)

components/
  ui/
  layout/                         ← AppLayout, BottomNav (mobile), SeedModeBanner
  shift/                          ← ShiftCard, ShiftSummary, StartShiftForm,
                                     ExpenseForm, ExpenseList, LiquidationReceipt
  expenses/                       ← PendingExpenseCard, ApprovalModal
  dashboard/                      ← KpiCard, IncomeChart, PendingBadge
  admin/                          ← DiagnosticPanel, BootstrapPanel, AuditViewer,
                                     ConfigForm

lib/
  dataService.ts | supabase.ts | blobAudit.ts | pgMigrate.ts | seedReader.ts
  liquidationService.ts | emailService.ts
  auth.ts | withAuth.ts | withRole.ts | types.ts | schemas.ts | dateUtils.ts
```

---

## 16. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | La app debe funcionar correctamente en celulares con pantalla de 360px–430px. El conductor la usa desde el celular durante todo el día. |
| RNF-02 | El panel del conductor debe cargar en menos de 2 segundos en una conexión 4G. |
| RNF-03 | El comprobante digital debe ser visualizable desde el celular e imprimible desde el navegador (sin descarga de PDF). |
| RNF-04 | La Utilidad Neta siempre se calcula en el servidor — nunca se expone la fórmula al cliente. |
| RNF-05 | Las contraseñas deben hashearse con bcrypt. |
| RNF-06 | Las sesiones deben gestionarse con JWT en cookie HttpOnly. |
| RNF-07 | Los montos deben mostrarse en formato COP: `$XXX.XXX` sin decimales. |

---

## 17. Flujos de usuario y de trabajo

### Flujo de bootstrap

Igual que todos los proyectos del curso: login admin del seed → banner modo seed → `/admin/db-setup` → ejecutar bootstrap → modo live. El bootstrap también inserta la `daily_config` con los valores del seed.

### Flujo de un día completo

| Hora | Actor | Acción |
|---|---|---|
| 06:00 AM | Conductor | Abre la app en el celular. No hay turno de hoy → botón "Iniciar Turno". |
| 06:00 AM | Conductor | Ingresa el IB del día ($450.000). El sistema aplica el snapshot de la tarifa ($80.000). Turno en estado ABIERTO. |
| 09:30 AM | Conductor | Agrega gasto de combustible ($85.000). Está bajo el límite de $200.000 → APROBADO automáticamente. |
| 02:15 PM | Conductor | Agrega gasto de reparación ($320.000). Supera el límite → PENDIENTE. Sistema envía email a la propietaria con Resend. |
| 02:20 PM | Propietaria | Recibe el email de alerta. Abre BusetaApp. Ve el gasto pendiente en su dashboard. Revisa la descripción y aprueba. |
| 07:45 PM | Propietaria | Abre el turno del conductor. Ve: IB $450.000, Tarifa $80.000, Gastos aprobados $405.000, UN parcial $-35.000. Decide cerrar. |
| 07:45 PM | Sistema | No hay gastos pendientes (el de reparación ya fue aprobado). Ejecuta el cálculo final. Genera el comprobante. Turno → CERRADO. |
| 08:00 PM | Conductor | Consulta el comprobante desde su celular. Lo muestra a la propietaria para verificar. |
| 08:05 PM | Socio | Consulta la auditoría del día desde su dispositivo. Verifica que la tarifa de $80.000 fue correctamente descontada. |

---

## 18. Diseño de interfaz

### Filosofía Mobile-First

BusetaApp es una app que el conductor abre desde su celular 5–10 veces al día. Toda pantalla debe ser diseñada primero para 375px y luego escalada a tablets y escritorio. Los botones deben tener al menos 48px de alto. El formulario de inicio de turno y el de agregar gasto son las pantallas más usadas — deben completarse con dos manos en el celular en menos de 30 segundos.

### Identidad visual del Login

| Elemento | Especificación |
|---|---|
| **Layout** | Pantalla completa, formulario centrado. |
| **Fondo** | Ámbar/naranja oscuro (`#78350F`) — evoca el color de las busetas colombianas. |
| **Tarjeta** | Fondo blanco, `border-radius: 12px`, borde superior de 4px en ámbar (`#D97706`), max-w-sm. |
| **Logo** | SVG de una buseta estilizada de frente con símbolo de moneda superpuesto, en ámbar (`#D97706`), 52px. |
| **Nombre** | "BusetaApp" en Inter Bold 28px, marrón oscuro (`#451A03`). |
| **Tagline** | "Control financiero de tu unidad." Inter Regular 13px, slate (`#6B7280`). |
| **Campos** | Borde gris (`#D1D5DB`), focus en ámbar (`#D97706`). |
| **Botón principal** | bg `#D97706`, texto blanco, hover `#B45309`. |
| **Pie** | Sin link de "Crear cuenta" — los usuarios los crea la propietaria. |
| **Animación** | Framer Motion: `opacity: 0→1`, `scale: 0.97→1`, 0.4s. |

### Paleta de colores

| Elemento | Hex |
|---|---|
| Primario (ámbar) | `#D97706` |
| Primario oscuro | `#B45309` |
| Primario claro | `#FEF3C7` |
| Fondo principal | `#FFFBF5` (amber-50 custom) |
| Fondo de tarjetas | `#FFFFFF` |
| Fondo alterno | `#FEF3C7` (amber-100) |
| Texto principal | `#1C1917` (stone-900) |
| Texto secundario | `#78716C` (stone-500) |
| **Gasto APROBADO** | `#16A34A` + fondo `#F0FDF4` |
| **Gasto PENDIENTE** | `#D97706` + fondo `#FFFBEB` |
| **Gasto RECHAZADO** | `#DC2626` + fondo `#FEF2F2` |
| **Turno ABIERTO** | `#2563EB` + fondo `#EFF6FF` |
| **Turno CERRADO** | `#6B7280` + fondo `#F9FAFB` |
| Utilidad Neta positiva | `#16A34A` (verde) |
| Utilidad Neta negativa | `#DC2626` (rojo) |
| Bordes | `#E7E5E4` |
| Banner modo seed | Fondo `#FEF3C7`, texto `#92400E`, borde `#F59E0B` |

### Tipografía

Inter. Cuerpo: 16px Regular. Montos: 20px Bold en las tarjetas de KPI. Títulos de sección: 18px SemiBold. Los montos en COP nunca tienen decimales: `$450.000`, `$80.000`.

### Componentes clave

| Componente | Descripción |
|---|---|
| `ShiftCard` | Tarjeta del turno activo en el panel del conductor: IB, tarifa descontada, base post-tarifa, gastos aprobados, UN parcial. Botón grande "Agregar gasto". Mobile-first: toda la información visible sin scroll en una pantalla de 375px. |
| `StartShiftForm` | Formulario de inicio de turno: un solo input de número para el IB con teclado numérico en mobile (`inputMode="decimal"`). Muestra la tarifa vigente (solo lectura) y el resultado esperado. |
| `ExpenseForm` | Selector de categoría con íconos grandes (fácil de tocar), input de monto y descripción opcional. Al ingresar el monto, muestra si está dentro del límite o si irá a PENDIENTE. |
| `ExpenseList` | Lista de gastos del turno con su badge de estado (verde/naranja/rojo). Los PENDIENTES tienen un ícono de reloj. |
| `PendingExpenseCard` | Card para el panel de aprobación: conductor, categoría, monto, descripción, fecha. Botones grandes "Aprobar" (verde) y "Rechazar" (rojo) con modal de confirmación. |
| `LiquidationReceipt` | Comprobante digital del turno cerrado: header con logo, fecha, conductor. Tabla de ítems: IB, Tarifa Diaria, Base Post-Tarifa, cada gasto aprobado, **Total Utilidad Neta** en grande. Footer con nombre del conductor, nombre de quien cerró y fecha/hora de cierre. Botón "Imprimir" que usa `window.print()`. |
| `PendingBadge` | Badge rojo con el número de gastos pendientes. Visible en el sidebar/bottom nav de la propietaria cuando hay gastos sin revisar. |
| `KpiCard` | Tarjeta de KPI: ícono + label + valor en COP + variación respecto al período anterior. |

### Diseño responsivo

| Dispositivo | Comportamiento |
|---|---|
| Celular (<768px) | Bottom navigation (Turno, Gastos, Perfil para conductor; Dashboard, Pendientes, Turnos, Config, Perfil para admin). Todo el contenido en columna. Botones de acción de al menos 48px. |
| Tablet (768–1023px) | Sidebar lateral colapsable. Dashboard en 2 columnas. |
| Computador (≥1024px) | Sidebar fijo. Dashboard en 3 columnas. Comprobante con formato de impresión. |

---

## 19. Plan de fases de implementación

### Fase 1 — Bootstrap, Login y `dataService` base
> Rol: Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad

| # | Tarea |
|---|---|
| 1.1 | Instalar: `bcryptjs jose @supabase/supabase-js @vercel/blob pg resend @types/bcryptjs @types/pg` |
| 1.2 | Crear proyecto en Supabase. Blob Store privado. Cuenta Resend. Variables de entorno. |
| 1.3 | Crear `data/seed.json` con admin + `daily_config` por defecto ($80.000 tarifa, $200.000 límite). |
| 1.4 | Crear `supabase/migrations/0001_init_users.sql`. |
| 1.5 | Crear `lib/supabase.ts`, `lib/blobAudit.ts` (getBlobToken lazy, withFileLock, get() del SDK), `lib/pgMigrate.ts`, `lib/seedReader.ts`. |
| 1.6 | Crear `lib/emailService.ts`: función `sendPendingExpenseAlert(adminEmail, data)`. |
| 1.7 | Crear `lib/dataService.ts` con `getSystemMode`, auth de usuarios y `recordAudit`. |
| 1.8 | Crear `lib/auth.ts`, `lib/withAuth.ts`, `lib/withRole.ts`. |
| 1.9 | Crear `next.config.ts` con headers `no-store` para `/api/:path*`. |
| 1.10 | Crear API Routes: bootstrap, diagnose, mode, login, logout, me, change-password. |
| 1.11 | Crear `app/login/page.tsx` con la identidad visual de BusetaApp: fondo ámbar oscuro, logo de buseta, paleta naranja/ámbar. Sin link de registro. |
| 1.12 | `npm run typecheck` sin errores. Probar: login admin → cookie → modo seed. |

---

### Fase 2 — Dashboard, Layout base (Mobile-First) y bootstrap
> Rol: Diseñador Frontend Obsesivo + Ingeniero de Sistemas

| # | Tarea |
|---|---|
| 2.1 | Crear componentes UI base: Button (mobile-friendly, mínimo 48px), Card, Badge, Toast, Modal. |
| 2.2 | Configurar variables CSS de la paleta ámbar en `globals.css`. Inter con `next/font`. |
| 2.3 | Crear `AppLayout.tsx` Mobile-First: bottom navigation para mobile, sidebar para desktop/tablet. El conductor ve: Turno, Gastos, Perfil. El admin ve: Dashboard, Pendientes (con badge), Turnos, Configuración, Perfil. El socio ve: Auditoría, Perfil. |
| 2.4 | Crear `PendingBadge`: badge rojo que aparece sobre el ícono de Pendientes cuando `pendingCount > 0`. Datos frescos en cada carga (sin caché). |
| 2.5 | Crear `/admin/db-setup/page.tsx` con diagnóstico + bootstrap. |
| 2.6 | Crear `SeedModeBanner.tsx`. |
| 2.7 | Crear `GET /api/dashboard?period=day|week|month` para el admin. En modo seed: estructura vacía. |
| 2.8 | Crear `app/dashboard/page.tsx` para el admin: KPIs del período, badge de pendientes. |
| 2.9 | Crear `middleware.ts`: protege rutas privadas, `/admin/*` solo para admin. |
| 2.10 | Probar: bootstrap → modo live → bottom nav funciona en 375px. |

---

### Fase 3 — Configuración y Módulo de Turnos
> Rol: Ingeniero Fullstack — Ciclo del turno diario

| # | Tarea |
|---|---|
| 3.1 | Crear `supabase/migrations/0002_init_config.sql` y `0003_init_shifts.sql`. Aplicar desde `/admin/db-setup`. El bootstrap inserta la `daily_config` del seed. |
| 3.2 | Agregar tipos `DailyConfig`, `Shift`, `ShiftWithDetails`, `CreateShiftRequest` y schemas Zod. |
| 3.3 | Extender `dataService`: `getDailyConfig`, `updateDailyConfig`, `getTodayShift`, `createShift` (copia el snapshot de la tarifa al crear — RN-01; captura el error de UNIQUE para RN-07), `getShiftById` (verifica que el conductor solo ve su turno — RN-06), `getShifts`, `closeShift`. |
| 3.4 | API Routes: `GET/PUT /api/config`, `GET/POST /api/shifts`, `GET /api/shifts/today`, `GET /api/shifts/[id]`, `POST /api/shifts/[id]/close`. |
| 3.5 | Crear `app/config/page.tsx` (solo admin): formulario de tarifa diaria y límite de gasto con inputs numéricos. Advertencia: "Los cambios aplican a los nuevos turnos — no afectan turnos ya abiertos." |
| 3.6 | Crear `app/shift/page.tsx` (conductor): Si no hay turno hoy → `StartShiftForm` con input de IB y la tarifa vigente visible. Si hay turno → `ShiftCard` con resumen. |
| 3.7 | `StartShiftForm`: input `inputMode="decimal"` para teclado numérico en mobile. Muestra en tiempo real: "Base post-tarifa: $XXX.XXX" mientras el conductor escribe el IB. |
| 3.8 | Verificar RN-01: cambiar la tarifa desde config → crear un nuevo turno → verificar que el snapshot usa la nueva tarifa, no la anterior. |
| 3.9 | Verificar RN-07: intentar crear un segundo turno el mismo día → 409 con el turno existente. |

---

### Fase 4 — Gastos y Flujo de Aprobación
> Rol: Ingeniero Fullstack — Estado de gastos y notificaciones

| # | Tarea |
|---|---|
| 4.1 | Crear `supabase/migrations/0004_init_expenses.sql`. Aplicar desde `/admin/db-setup`. |
| 4.2 | Agregar tipos `Expense`, `ExpenseWithShift`, `AddExpenseRequest` y schemas Zod (monto > 0). |
| 4.3 | Extender `dataService`: `addExpense` (verifica que el turno existe y está ABIERTO — RN-04 para escrituras; si `amount > config.expense_limit` → status='PENDIENTE' + `emailService.sendPendingExpenseAlert`; si no → status='APROBADO'), `getPendingExpenses`, `approveExpense`, `rejectExpense`. |
| 4.4 | API Routes: `GET/POST /api/shifts/[id]/expenses`, `GET /api/expenses/pending` (admin), `POST /api/expenses/[id]/approve` (admin), `POST /api/expenses/[id]/reject` (admin con reason obligatorio). |
| 4.5 | Crear `app/shift/[id]/page.tsx`: detalle del turno con `ShiftCard` y `ExpenseList`. Botón "Agregar gasto" que abre el `ExpenseForm`. El cálculo de UN parcial se actualiza al volver de agregar un gasto. |
| 4.6 | `ExpenseForm`: selector de categoría con íconos grandes (combustible=🔧, peaje=🛣️, lavado=🚿, reparación=🔨, otro=📝). Al ingresar el monto: si supera el límite, mostrar advertencia naranja: "Este gasto superará el límite de $200.000 y requerirá aprobación de la propietaria." |
| 4.7 | Crear `app/expenses/pending/page.tsx` (admin): lista de `PendingExpenseCard` ordenados por fecha. Cada card con botón "Aprobar" (verde) y "Rechazar" (rojo). El rechazo abre modal para ingresar el motivo (obligatorio). |
| 4.8 | Verificar RN-02: gasto de $150.000 con límite $200.000 → APROBADO automáticamente. Gasto de $250.000 → PENDIENTE + correo en Resend. |
| 4.9 | Verificar RN-04: intentar agregar gasto a un turno CERRADO → 409. |
| 4.10 | Verificar RN-03: intentar aprobar un gasto como conductor → 403. |

---

### Fase 5 — Cierre de Turno y Comprobante Digital
> Rol: Ingeniero Fullstack — Liquidación y comprobante Mobile-First

| # | Tarea |
|---|---|
| 5.1 | Crear `lib/liquidationService.ts` con `calculateNetIncome` y `buildReceipt`. |
| 5.2 | Implementar `closeShift` en `dataService`: (1) Verificar que el usuario es admin. (2) Verificar que el turno está ABIERTO. (3) Si hay gastos PENDIENTES: retornar un warning `{ hasPendingExpenses: true, pendingCount: N, pendingTotal: X }` — el admin decide si continuar. (4) Llamar `calculateNetIncome`. (5) UPDATE shift.status = 'CERRADO', closed_by, closed_at. (6) `buildReceipt` para retornar el comprobante. (7) `recordAudit`. |
| 5.3 | El endpoint `POST /api/shifts/[id]/close` acepta un body `{ force: boolean }`. Si `force=false` y hay pendientes: retornar el warning sin cerrar. Si `force=true`: cerrar igualmente (excluyendo los pendientes del cálculo). |
| 5.4 | Crear `components/shift/LiquidationReceipt.tsx`: comprobante imprimible. Header con "BusetaApp", fecha, nombre del conductor. Tabla con IB, Tarifa Diaria (como ítem de descuento), Base Post-Tarifa, cada gasto aprobado con su categoría y monto, separador, **Utilidad Neta** en fuente grande (verde si positiva, rojo si negativa). Footer con fecha/hora de cierre y quién cerró. Botón "Imprimir" (`window.print()`). CSS de impresión: `@media print { .no-print { display: none } }`. |
| 5.5 | En el panel del admin, la vista del turno ABIERTO muestra el botón "Cerrar y Liquidar" visible y prominente. Si hay gastos PENDIENTES: el botón muestra un badge con el conteo y al hacer clic muestra primero el modal de advertencia. |
| 5.6 | Crear `app/shift/[id]/page.tsx` cuando el turno está CERRADO: muestra el `LiquidationReceipt` directamente. El conductor puede acceder a esta vista para ver su comprobante. |
| 5.7 | Verificar el comprobante en celular de 375px: todos los ítems visibles sin scroll horizontal, botón imprimir accesible, montos en COP sin decimales. |

---

### Fase 6 — Reportes, Auditoría del Socio y Administración
> Rol: Ingeniero Fullstack Senior + Diseñador Frontend

| # | Tarea |
|---|---|
| 6.1 | Extender `dataService`: `getDashboardData(period)` que calcula para el período dado: total IB, total tarifa cobrada, total gastos aprobados, UN neta acumulada, número de turnos, gastos pendientes actuales. `getAuditShifts(filters)` para la vista del socio: solo devuelve `{ date, gross_income, daily_fee_snapshot, status }` — sin gastos operativos (el socio no los necesita ni debe verlos). |
| 6.2 | API Routes: `GET /api/dashboard?period=day|week|month` (admin), `GET /api/audit?from=&to=` (admin + socio). |
| 6.3 | Crear `app/reports/page.tsx` (admin): selector de período (Hoy, Esta semana, Este mes). KPIs en `KpiCard`. Tabla de turnos del período con resumen financiero. |
| 6.4 | Crear `app/audit/page.tsx` (admin + socio): selector de fechas. Tabla con fecha, conductor, IB, tarifa descontada, estado. El socio solo puede ver esta pantalla — redirigir cualquier intento de acceder a otras rutas. Verificar en middleware. |
| 6.5 | Crear `/api/users` con `withRole(['admin'])`. POST genera contraseña temporal con `crypto.randomBytes`, `must_change_password=true`, retorna en claro una sola vez con modal. |
| 6.6 | Crear `app/admin/users/page.tsx`: tabla de usuarios con rol y estado. Acciones: activar/suspender. |
| 6.7 | Crear `app/admin/audit-log/page.tsx`: `AuditViewer` con selector de mes. Lee de `dataService.readAuditMonth()`. Solo admin. |

---

### Fase 7 — Pulido final y Deploy
> Rol: Diseñador Frontend Obsesivo + Ingeniero Fullstack

| # | Tarea |
|---|---|
| 7.1 | Auditoría de empty states: conductor sin turno hoy (invitar a iniciar turno), admin sin gastos pendientes, reportes sin datos para el período. Mensajes acordes al contexto del transporte. |
| 7.2 | Manejo de errores global: 401, 403 (sin permisos — mensaje claro según el rol), 409 (turno existente del día — redirigir al turno), 500. |
| 7.3 | Verificar que el comprobante se imprime correctamente desde Chrome en Android (el principal caso de uso del conductor). |
| 7.4 | Verificar que el `PendingBadge` del admin se actualiza en tiempo real al aprobar/rechazar gastos. |
| 7.5 | Verificar que el socio no puede acceder a ninguna pantalla que no sea `/audit` y `/profile`. Intentar navegar a `/dashboard` o `/shift` → redirect a `/audit`. |
| 7.6 | Verificar todos los montos en formato COP sin decimales. |
| 7.7 | Verificar el flujo completo del turno en un celular real de 375px: iniciar → agregar gastos → ver comprobante. |
| 7.8 | `npm run typecheck`, `npm run lint`, `npm run build` — cero errores. |
| 7.9 | Deploy en Vercel con todas las variables de entorno. |
| 7.10 | Probar en producción con los 3 roles: admin crea conductor y socio → conductor inicia turno → agrega gasto pendiente → admin recibe correo → aprueba → admin cierra turno → conductor ve comprobante → socio verifica auditoría. |

---

## 20. Estrategia de seguridad

### Flujo de login

```
1. Validar body con Zod (loginSchema)
2. getUserByEmail(email)  ← seed o Postgres
3. Verificar is_active y bcrypt.compare()
4. Si must_change_password: flag en JWT → redirect /profile
5. JWT({ userId, role, email }, 24h) → cookie HttpOnly, Secure, SameSite=Strict
6. recordAudit({ action: 'login', ... })
7. Retornar SafeUser
```

> El JWT incluye el `role` en este proyecto porque hay un solo rol por usuario (a diferencia de AgroStock Pro). Simplifica la verificación en cada request.

### Protección de turnos por conductor (RN-06)

```typescript
// GET/PATCH /api/shifts/[id]
// Si el rol es 'conductor': verificar shifts.conductor_id === userId
// Si no coincide: 403 (no revelar que el turno existe)
// Si el rol es 'admin': acceso sin restricción
```

### Protección del turno cerrado (RN-04)

```typescript
// En todos los endpoints de escritura sobre turnos y gastos:
const shift = await getShiftById(id);
if (shift.status === 'CERRADO') {
  return Response.json({ error: 'Este turno está cerrado y no puede modificarse.' }, { status: 409 });
}
```

---

## 21. Restricciones del sistema

| ID | Restricción | Descripción |
|---|---|---|
| RS-01 | Sin registro público | El admin crea los usuarios con contraseña temporal. |
| RS-02 | Un conductor por app | La v1 asume una sola unidad de transporte y un conductor activo. Si el negocio crece a varios conductores, el sistema ya los soporta — solo se crean más cuentas. |
| RS-03 | Sin descarga de PDF | El comprobante se visualiza en pantalla y se imprime con `window.print()`. Sin generación de PDF en el servidor en v1. |
| RS-04 | Un turno por día | El sistema no soporta múltiples turnos (mañana/tarde) por conductor el mismo día en v1. |
| RS-05 | Moneda fija COP | Sin multimoneda. |
| RS-06 | Bootstrap obligatorio | Hasta aplicar migrations + seed, solo permite login admin. |

---

## 22. Glosario

| Término | Definición |
|---|---|
| **IB (Ingreso Bruto)** | Total de dinero recaudado por el conductor en el turno antes de cualquier descuento. |
| **Tarifa Diaria** | Monto fijo diario que el conductor paga al propietario del vehículo. Se descuenta primero. |
| **Tarifa Snapshot** | Copia de la tarifa diaria al momento de crear el turno. No cambia aunque el admin modifique la tarifa. |
| **Base Post-Tarifa** | IB menos la Tarifa Diaria. La base sobre la que se calculan los gastos operativos. |
| **Gasto Operativo** | Cualquier gasto del turno: combustible, peaje, lavado, reparación u otro. |
| **Límite de Gasto** | Monto máximo de gasto que se aprueba automáticamente. Los que lo superan quedan PENDIENTES. |
| **UN (Utilidad Neta)** | Lo que el conductor se lleva al final del día: `(IB - Tarifa) - Gastos Aprobados`. |
| **Turno ABIERTO** | Registro del día en curso. El conductor puede agregar gastos. |
| **Turno CERRADO** | Turno liquidado por el admin. Inmutable. |
| **Gasto PENDIENTE** | Gasto que supera el límite y espera aprobación del admin. No afecta la UN hasta ser aprobado. |
| **Comprobante Digital** | Documento web del turno cerrado con todos los ítems de la liquidación. Imprimible. |
| **Auditoría del Socio** | Vista de solo lectura de los turnos cerrados disponible para el socio/asociado. |
| **Bootstrap** | Proceso inicial donde el admin aplica migrations y carga el seed. |
| **dataService** | Único punto de acceso a datos. |
| **JWT** | JSON Web Token — credencial firmada en cookie HttpOnly. |

---

> Última actualización: Mayo 2026
> Eider Barreto | Doc: 1082494661
> Curso: Lógica y Programación — SIST0200
