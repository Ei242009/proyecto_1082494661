# 🚌 PLAN BUSETAAPP — Fullstack TypeScript para Gestión Financiera de Transporte Informal
> Versión 1.0 | Ingeniero Fullstack Senior | Mayo 2026
> **Mentalidad:** BusetaApp es el cuaderno del conductor. Se usa desde el celular, en la calle, a las 6 de la mañana antes de salir. Si el turno del día se pierde, el dinero queda sin registrar.

---

## 📋 Índice

1. [Visión General](#1-visión-general)
2. [Contexto — El Problema](#2-contexto--el-problema)
3. [Propuesta de Solución](#3-propuesta-de-solución)
4. [Roles y Permisos](#4-roles-y-permisos)
5. [Entidades Principales](#5-entidades-principales)
6. [Flujo de Turno y Gastos](#6-flujo-de-turno-y-gastos)
7. [Reglas de Oro](#7-reglas-de-oro)
8. [Stack Tecnológico y Variables de Entorno](#8-stack-tecnológico-y-variables-de-entorno)
9. [Reglas de Oro — Especificaciones Críticas](#9-reglas-de-oro--especificaciones-críticas)
10. [Estructura del Seed — Configuración Inicial](#10-estructura-del-seed--configuración-inicial)
11. [Estructura de lib/ y Funciones de Servicios](#11-estructura-de-lib--y-funciones-de-servicios)
12. [Capa de Datos — JSON como BD](#12-capa-de-datos--json-como-bd)
13. [Autenticación y JWT](#13-autenticación-y-jwt)
14. [Autorización y Permisos](#14-autorización-y-permisos)
15. [API Routes — Endpoints Serverless](#15-api-routes--endpoints-serverless)
16. [Manejo de Errores](#16-manejo-de-errores)
17. [Validación TypeScript y Zod](#17-validación-typescript-y-zod)
18. [Identidad Visual — Login Screen](#18-identidad-visual--login-screen)
19. [Flujo de Usuarios — Primera Experiencia](#19-flujo-de-usuarios--primera-experiencia)
20. [Flujo Completo de Autenticación y JWT](#20-flujo-completo-de-autenticación-y-jwt)
21. [Checklist de Implementación](#21-checklist-de-implementación)
22. [Convenciones y Estándares](#22-convenciones-y-estándares)

---

## 1. Visión General

### Objetivo
Crear una aplicación web fullstack para gestión financiera de conductores de transporte informal (mototaxistas, busetas, colectivos) en Colombia. La aplicación permite:
- **Conductores:** Registrar gastos diarios, ver balance de turno
- **Propietarios (Socios):** Crear conductores, ver resumen de flota
- **Admin (Sistema):** Configuración de tarifa y límites

### Principios Clave
1. **Confiabilidad:** Si falla la persistencia, pierden dinero del día
2. **Identidad Colombiana:** Colores ámbar/naranja, iconografía de buseta
3. **Offline-first (aspiracional):** Validación en cliente, cálculo en servidor
4. **Rol Fijo Único:** Un usuario = un rol (conductor O socio O admin)
5. **No hay registro público:** Solo admin crea usuarios

---

## 2. Contexto — El Problema

### Situación Actual
- Conductores usan **cuadernos físicos** para anotar gastos
- No hay auditoría de gastos
- El propietario no sabe si le están robando dinero
- No hay sincronización — si el cuaderno se pierde, se pierde todo

### Usuario Target
- **Conductor:** 35 años, usa WhatsApp, tiene Android con plan basico
- **Propietario:** 50 años, maneja 5-15 vehículos, quiere saber si hay hurto
- **Admin:** Empleado confiable del dueño principal

---

## 3. Propuesta de Solución

### Visión de Producto
BusetaApp es una aplicación móvil de registro de gastos. Cada mañana:
1. Conductor abre la app
2. Selecciona su buseta de la lista
3. Inicia turno (hora, odómetro inicial)
4. Durante el día registra gastos (Gasolina $20k, Pasaje $5k, Comida $8k)
5. Al finalizar turno (hora, odómetro final) ve: Ganancia Neta = Ingresos - Gastos
6. Si un gasto supera el límite configurado, la propietaria recibe un email de alerta

### Experiencia de Primera Vez
1. URL → Login screen con identidad visual ámbar
2. Email + Contraseña (usuario creado por admin)
3. Seleccionar turno o vehículo
4. Dashboard de turno abierto

---

## 4. Roles y Permisos

### Conductores
- Iniciar/finalizar turno
- Registrar gastos (debajo del límite de $200k)
- Ver gastos del turno actual
- Ver histórico de turnos (lectura)

### Socios (Propietarios)
- Crear/editar conductores
- Ver resumen de gastos de la flota
- Ver alertas de gastos pendientes de aprobación
- Aprobar/rechazar gastos pendientes

### Admin (Sistema)
- Crear/editar socios y conductores
- Configurar tarifa diaria y límite de gastos
- Ver todos los datos de auditoría
- Acceso a /api/system/mode

---

## 5. Entidades Principales

### Usuario
```json
{
  "userId": "uuid",
  "email": "conductor@example.com",
  "passwordHash": "bcrypt(...)",
  "role": "conductor" | "socio" | "admin",
  "name": "Juan Pérez",
  "createdAt": "ISO8601",
  "companyId": "uuid"  // null para admin
}
```

### Turno (Shift)
```json
{
  "shiftId": "uuid",
  "userId": "uuid",
  "date": "YYYY-MM-DD",
  "startTime": "HH:mm:ss",
  "endTime": "HH:mm:ss",
  "odometerStart": 12345,
  "odometerEnd": 12500,
  "gastos": [
    {
      "id": "uuid",
      "categoria": "gasolina" | "comida" | "mantenimiento" | "otro",
      "monto": 20000,
      "descripcion": "Premium en Mobil",
      "timestamp": "ISO8601",
      "approved": false,
      "approvedBy": null
    }
  ],
  "status": "open" | "closed",
  "snapshot": {
    "ingresos": 250000,
    "gastos": 50000,
    "neto": 200000,
    "calculatedAt": "ISO8601"
  }
}
```

### DailyConfig
```json
{
  "tarifa": 80000,
  "limiteGasto": 200000,
  "updatedAt": "ISO8601",
  "updatedBy": "admin-id"
}
```

---

## 6. Flujo de Turno y Gastos

### Iniciar Turno
```
POST /api/shifts/init
Body: { vehicleId, odometerStart, date }
Response: { shiftId, status: "open" }
```

### Registrar Gasto
```
POST /api/shifts/{shiftId}/expenses
Body: { categoria, monto, descripcion }
Logic:
  1. Validar monto < limiteGasto
  2. Si monto >= limiteGasto → error + alert email a propietaria
  3. Insertar gasto con approved=false
Response: { expenseId, status }
```

### Cerrar Turno
```
POST /api/shifts/{shiftId}/close
Body: { odometerEnd, endTime }
Logic:
  1. Calcular snapshot en servidor
  2. Cambiar status a "closed"
  3. Hacer snapshot inmutable
Response: { snapshot }
```

---

## 7. Reglas de Oro

### Regla 1: Cálculo en Servidor
- **NUNCA** confíes en cálculos del cliente
- El snapshot de cierre se calcula en servidor
- El cliente solo puede leer el snapshot

### Regla 2: Turno Cerrado es Inmutable
- Una vez `status = "closed"`, no se puede editar nada
- Los gastos son readonly en la UI después del cierre
- El propietario puede "notar" gastos pero no borrar

### Regla 3: Snapshot de Auditoría
- Cada turno cerrado genera un snapshot JSON:
```json
{
  "shiftId": "...",
  "date": "2026-05-08",
  "userEmail": "conductor@...",
  "ingresos": 250000,
  "gastos": 50000,
  "neto": 200000,
  "calculatedAt": "2026-05-08T18:30:00Z",
  "calculatedBy": "servidor"
}
```

### Regla 4: Alertas de Gastos Pendientes
- Si un gasto supera `limiteGasto`, la propietaria recibe email **inmediatamente**
- El gasto queda en `approved: false`
- La propietaria debe revisar antes de que el turno cierre

---

## 8. Stack Tecnológico y Variables de Entorno

### Frontend
| Tecnología | Versión | Rol |
|------------|---------|-----|
| **Next.js** | 14+ (App Router) | Framework fullstack |
| **React** | 18+ | Motor de UI |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 3.x | Estilos utilitarios |
| **Framer Motion** | 11.x | Animaciones (login, transiciones) |

### Backend / Serverless
| Tecnología | Rol |
|------------|-----|
| **Next.js Route Handlers** | API endpoints (/api/*) |
| **fs (Node.js)** | Lectura/escritura JSON |
| **bcryptjs** | Hash de contraseñas |
| **jsonwebtoken** | Generación/validación JWT |
| **zod** | Validación de schemas |
| **Resend** | Envío de emails (alertas) |
| **Vercel Blob** | Almacenamiento de snapshots |

### Variables de Entorno (`.env.local`)
```env
# Autenticación
JWT_SECRET=<tu-secret-de-256-bits>
JWT_EXPIRATION=24h

# Email (Resend)
RESEND_API_KEY=<api-key-de-resend>
RESEND_FROM_EMAIL=noreply@busetaapp.co

# Blob Storage (Vercel)
BLOB_READ_WRITE_TOKEN=<token-de-vercel-blob>

# Modo
MODE=seed|production
```

---

## 9. Reglas de Oro — Especificaciones Críticas

### Regla 2: Snapshot Inmutable
- Una vez `shiftStatus = "closed"`, todos los datos son readonly
- El turno cierra → se calcula el snapshot → se almacena en Vercel Blob
- La propietaria NO puede editar gastos después del cierre

### Regla 3: Turno Cerrado y Contabilidad
- Cada turno cerrado genera un documento de auditoría
- El documento incluye: userId, fecha, ingresos, gastos, neto, timestamp de cierre
- Almacenamiento: Vercel Blob con ruta `/snapshots/{shiftId}.json`

### Regla 4: JWT SÍ Incluye el Rol
- A diferencia de AgroStock Pro, **en BusetaApp el JWT SÍ incluye el rol**
- Razón: Cada usuario tiene un rol fijo único (conductor siempre es conductor)
- Estructura: `JWT({ userId, role, email }, '24h')`
- Cookie: HttpOnly, Secure, SameSite=Strict
- Verificación de permisos: Leer `role` del JWT en el servidor

---

## 10. Estructura del Seed — Configuración Inicial

### seed.json (Datos de Inicialización)
```json
{
  "version": "1.0",
  "daily_config": {
    "tarifa": 80000,
    "limiteGasto": 200000,
    "updatedAt": "2026-05-08T00:00:00Z"
  },
  "users": [
    {
      "userId": "admin-001",
      "email": "admin@busetaapp.co",
      "passwordHash": "bcrypt-hash-aqui",
      "role": "admin",
      "name": "Admin BusetaApp",
      "createdAt": "2026-05-08T00:00:00Z",
      "companyId": null
    },
    {
      "userId": "conductor-001",
      "email": "juan@conductor.co",
      "passwordHash": "bcrypt-hash-aqui",
      "role": "conductor",
      "name": "Juan Pérez",
      "createdAt": "2026-05-08T00:00:00Z",
      "companyId": "company-001"
    },
    {
      "userId": "socio-001",
      "email": "propietaria@busetas.co",
      "passwordHash": "bcrypt-hash-aqui",
      "role": "socio",
      "name": "María Gómez",
      "createdAt": "2026-05-08T00:00:00Z",
      "companyId": "company-001"
    }
  ],
  "companies": [
    {
      "companyId": "company-001",
      "name": "Busetas Medellín SAS",
      "ownerEmail": "propietaria@busetas.co",
      "createdAt": "2026-05-08T00:00:00Z"
    }
  ],
  "shifts": [],
  "snapshots": []
}
```

### seedReader — Exposición de daily_config
```typescript
export function getDailyConfig() {
  const seed = readSeed();
  return seed.daily_config;
}

// Uso en modo seed:
// - Componentes pueden leer tarifa y limiteGasto antes del bootstrap completo
// - Endpoint /api/config/daily-config retorna la config
```

---

## 11. Estructura de lib/ y Funciones de Servicios

### lib/ Structure
```
lib/
├── types.ts              # Tipos globales (User, Shift, DailyConfig)
├── validators.ts         # Schemas Zod para validación
├── dataService.ts        # Funciones de lectura/escritura JSON
├── authService.ts        # JWT, bcrypt, cookies
├── emailService.ts       # Envío de emails (Resend)
├── seedReader.ts         # Lectura del seed.json
└── blobService.ts        # Almacenamiento de snapshots
```

### emailService.ts — Firma Requerida
```typescript
/**
 * Envía email de alerta de gasto pendiente a la propietaria
 * @param ownerEmail - Email de la propietaria
 * @param shiftData - Datos del turno
 * @param expenseData - Datos del gasto
 */
export async function sendPendingExpenseAlert(
  ownerEmail: string,
  shiftData: { shiftId: string; userId: string; date: string },
  expenseData: { categoria: string; monto: number; descripcion: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Implementación con Resend
}
```

**Asunto del email:**
```
⚠️ Gasto pendiente de aprobación — [monto] COP
```

**Body:**
```
Conductor: [nombre]
Categoría: [categoría]
Monto: $[monto]
Descripción: [descripción]
Acción: Revisar en el panel de propietaria
```

---

## 12. Capa de Datos — JSON como BD

### data/ Structure
```
data/
├── seed.json             # Datos de inicialización + daily_config
├── users.json            # Lista de usuarios activos
├── shifts.json           # Histórico de turnos
├── snapshots/            # Snapshots inmutables de turnos cerrados
│   └── {shiftId}.json
└── README.md             # Documentación del esquema
```

### Patrones de Lectura/Escritura
1. **Lectura:** `fs.readFileSync()` en Route Handler
2. **Escritura:** Lock con `fs.writeFileSync()` + validación en servidor
3. **Almacenamiento de Snapshots:** Vercel Blob (`@vercel/blob`)

---

## 13. Autenticación y JWT

### Cookie HTTP-Only
```typescript
// Response.headers.set('Set-Cookie', ...)
// HttpOnly=true, Secure=true, SameSite=Strict
// Max-Age=86400 (24 horas)
```

### JWT Payload
```json
{
  "userId": "conductor-001",
  "role": "conductor",
  "email": "juan@conductor.co",
  "iat": 1715000000,
  "exp": 1715086400
}
```

### Flujo de Login
1. POST /api/auth/login con { email, password }
2. Validar email en seed.json
3. Validar contraseña con bcrypt
4. Generar JWT
5. Setear cookie HttpOnly
6. Retornar { role, userId }

---

## 14. Autorización y Permisos

### Middleware de Autenticación
```typescript
function verifyJWT(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
```

### Verificación de Rol en Routes
```typescript
// POST /api/shifts/{shiftId}/close
if (decodedJWT.role !== 'conductor' && decodedJWT.role !== 'socio') {
  return Response.json({ error: 'Unauthorized' }, { status: 403 });
}
```

---

## 15. API Routes — Endpoints Serverless

### Endpoints Críticos (Fase 1)
```
POST /api/auth/login             # Login + JWT
GET  /api/auth/logout            # Logout (cookie delete)
GET  /api/system/mode            # Retorna "seed" o "production"
POST /api/config/daily-config    # GET daily_config
```

### Endpoints Fase 2+
```
POST /api/shifts/init            # Iniciar turno
POST /api/shifts/{id}/close      # Cerrar turno
POST /api/shifts/{id}/expenses   # Registrar gasto
GET  /api/shifts/{id}/snapshot   # Ver snapshot
```

---

## 16. Manejo de Errores

### Error Codes
```
200 OK
201 Created
400 Bad Request — validación fallida
401 Unauthorized — JWT inválido o expirado
403 Forbidden — rol no tiene permiso
404 Not Found — recurso no existe
500 Internal Server Error — error del servidor
```

### Error Response Format
```json
{
  "error": "Email not found",
  "code": "USER_NOT_FOUND",
  "details": "El email 'invalid@example.com' no existe en el sistema"
}
```

---

## 17. Validación TypeScript y Zod

### Schemas Zod
```typescript
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const ExpenseSchema = z.object({
  categoria: z.enum(['gasolina', 'comida', 'mantenimiento', 'otro']),
  monto: z.number().positive(),
  descripcion: z.string().min(3)
});
```

---

## 18. Identidad Visual — Login Screen

### Paleta de Colores
```
Fondo principal:      #78350F (Ámbar oscuro)
Acento:               #F59E0B (Ámbar brillante)
Tarjeta:              #FFFFFF (Blanco)
Borde tarjeta:        4px solid #F59E0B (Ámbar en top)
Texto principal:      #1F2937 (Gris oscuro)
Texto secundario:     #6B7280 (Gris medio)
```

### Layout
```
┌─────────────────────────────────────┐
│  [Fondo ámbar oscuro #78350F]       │
│                                     │
│    ┌──────────────────────────┐     │
│    │ ▬▬▬ BORDE ÁMBAR TOP ▬▬▬ │     │
│    │                          │     │
│    │  🚌 BusetaApp Logo      │     │
│    │                          │     │
│    │  Email    [_________]   │     │
│    │  Password [_________]   │     │
│    │                          │     │
│    │  [ Ingresar ]            │     │
│    │                          │     │
│    │ Tarjeta blanca           │     │
│    └──────────────────────────┘     │
│                                     │
│  © 2026 BusetaApp                   │
└─────────────────────────────────────┘
```

### Logo SVG de Buseta
- Forma simplificada de buseta vista de lado
- Colores: Ámbar (#F59E0B) y blanco
- Tamaño: 80x60px
- Estilo: Líneas limpias, minimalista

---

## 19. Flujo de Usuarios — Primera Experiencia

### Conductor (Primera Vez)
1. Recibe email del propietario: "Tu cuenta está lista"
2. Abre app → Login screen ámbar
3. Email ya rellenado (pre-lleno por propietario)
4. Ingresa contraseña temporal
5. Dashboard → Selecciona turno o vehículo
6. Inicia turno → contador de horas

### Propietario/Socio (Primera Vez)
1. Crea cuenta desde panel admin
2. Login → Dashboard de propietario
3. Lista de conductores + alertas
4. Formulario: "Crear nuevo conductor"

### Admin (Modo Seed)
1. Login con credentials del seed
2. Acceso a /api/system/mode (retorna "seed")
3. Puede crear usuarios y configurar tarifa
4. Panel de auditoría

---

## 20. Flujo Completo de Autenticación y JWT

### 1. Usuario Llega a la Página
```
GET / → Next.js page.tsx
  ├─ Lee cookie 'token' (si existe)
  ├─ Si token válido → Redirect a /dashboard
  └─ Si no → Muestra Login Screen
```

### 2. Usuario Ingresa Credenciales
```
POST /api/auth/login
  ├─ Recibe { email, password }
  ├─ Valida con Zod
  ├─ Busca usuario en seed.json (modo seed)
  ├─ Compara contraseña con bcrypt
  ├─ Genera JWT: { userId, role, email, exp: +24h }
  ├─ Setea cookie: HttpOnly=true, Secure=true, SameSite=Strict
  └─ Retorna { role, userId, email }
```

### 3. Cliente Recibe JWT en Cookie
```
Response.headers.set('Set-Cookie', 
  `token=eyJhbGc....; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
)
```

### 4. Requests Posteriores Incluyen JWT
```
GET /api/shifts
  ├─ Cookie incluida automáticamente
  ├─ Route Handler extrae JWT
  ├─ Valida con jwt.verify(token, JWT_SECRET)
  ├─ Extrae { userId, role, email }
  └─ Autoriza acción según role
```

### 5. JWT Expira o Usuario Hace Logout
```
GET /api/auth/logout
  ├─ Setea cookie vacía: Max-Age=0
  └─ Redirige a /
```

---

## 21. Checklist de Implementación

### Fase 1 — Bootstrap (Autenticación + Identidad Visual)
- [ ] Crear estructura de carpetas y tipos TypeScript
- [ ] Implementar seed.json con daily_config
- [ ] Implementar seedReader.ts
- [ ] Implementar lib/authService.ts (JWT, bcrypt)
- [ ] Implementar lib/emailService.ts (sendPendingExpenseAlert)
- [ ] Implementar POST /api/auth/login
- [ ] Implementar GET /api/auth/logout
- [ ] Implementar GET /api/system/mode
- [ ] Crear Login Screen con identidad visual ámbar
- [ ] Crear componente Logo SVG de buseta
- [ ] Validar npm run typecheck (cero errores)
- [ ] Probar login admin del seed → JWT con role='admin' en cookie
- [ ] Probar /api/system/mode retorna 'seed'
- [ ] Probar sendPendingExpenseAlert genera email en Resend

### Fase 2+ — Funcionalidad de Turnos
- [ ] Implementar POST /api/shifts/init
- [ ] Implementar POST /api/shifts/{id}/close
- [ ] Implementar POST /api/shifts/{id}/expenses
- [ ] Dashboard de conductor

---

## 22. Convenciones y Estándares

### Nombrado de Archivos
- Componentes React: `PascalCase.tsx`
- Funciones de utilidad: `camelCase.ts`
- Tipos: `suffixed.types.ts`
- Servicios: `suffixed.Service.ts`

### Estructura de Errores
```typescript
interface ApiError {
  error: string;
  code: string;
  details?: string;
  timestamp: string;
}
```

### Logging
- Operaciones sensibles: `console.log([TIMESTAMP] action complete)`
- Errores: `console.error([TIMESTAMP] error details)`

### Testing Manual (Modo Seed)
```bash
# 1. Loguear como admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@busetaapp.co","password":"admin123456"}'

# 2. Verificar modo
curl http://localhost:3000/api/system/mode

# 3. Probar email
curl -X POST http://localhost:3000/api/emails/test-alert \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## 🎯 Próximos Pasos

1. **Fase 1 — Bootstrap:** Autenticación + Login visual + seedReader
2. **Fase 2 — Turnos:** Iniciar/cerrar, gastos, snapshots
3. **Fase 3 — Dashboard:** UI de conductor, propietario, admin
4. **Fase 4 — Notificaciones:** Email alerts, real-time updates
5. **Fase 5 — Deploy:** Vercel + Blob storage + variables de entorno

---

**Fin del PLAN BUSETAAPP.md**
