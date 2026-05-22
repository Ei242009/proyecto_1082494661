# 🚌 BusetaApp — Fase 1 Bootstrap Completada

## 📦 Contenido de la Fase 1

Esta es la **Fase 1 de Bootstrap** de BusetaApp. Se ha implementado:

- ✅ Autenticación JWT con cookies HttpOnly
- ✅ Login screen con identidad visual ámbar colombiana
- ✅ Servicio de alertas por email (Resend)
- ✅ Gestión de usuarios y configuración mediante seed.json
- ✅ Endpoints de API serverless

---

## 🚀 Instalación y Setup

### 1. Instalar Dependencias

```bash
npm install
```

**Dependencias nuevas agregadas:**
- `bcryptjs` — Hash seguro de contraseñas
- `jsonwebtoken` — Generación y validación de JWT
- `resend` — Envío de emails
- `@vercel/blob` — Almacenamiento de archivos
- `@types/bcryptjs` y `@types/jsonwebtoken` — Tipos TypeScript

### 2. Configurar Variables de Entorno

Crear o editar `.env.local`:

```env
# JWT
JWT_SECRET=tu-secret-aleatorio-de-256-bits
JWT_EXPIRATION=24h

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@busetaapp.co

# Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxx

# Modo
MODE=seed
NEXT_PUBLIC_MODE=seed
```

**Notas importantes:**
- `JWT_SECRET`: En producción, debe ser un valor aleatorio seguro de 256 bits
- `RESEND_API_KEY`: Obtener de https://resend.com (sección API Keys)
- `BLOB_READ_WRITE_TOKEN`: Obtener de Vercel (integración Blob)
- `MODE=seed`: Habilita datos de prueba y endpoints de desarrollo

### 3. Validar TypeScript

```bash
npm run typecheck
```

Debe retornar **cero errores**.

### 4. Iniciar Servidor

```bash
npm run dev
```

Acceder a: **http://localhost:3000**

---

## 🧪 Pruebas

### Credenciales de Prueba (Modo Seed)

| Rol | Email | Contraseña | Descripción |
|-----|-------|------------|-------------|
| Admin | `admin@busetaapp.co` | `admin123456` | Administrador del sistema |
| Conductor | `juan@conductor.co` | `admin123456` | Conductor de buseta |
| Socio/Propietaria | `propietaria@busetas.co` | `admin123456` | Dueña de la flota |

### Flujo de Login

1. Abre **http://localhost:3000**
2. Ingresa email y contraseña (ej: `admin@busetaapp.co` / `admin123456`)
3. Haz clic en "Ingresar"
4. Se genera JWT, se almacena en cookie HttpOnly
5. (Próxima fase) Redirige a `/dashboard`

### Pruebas de API

#### Test 1: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@busetaapp.co",
    "password": "admin123456"
  }'

# Respuesta esperada (200):
# {
#   "success": true,
#   "userId": "admin-001",
#   "role": "admin",
#   "email": "admin@busetaapp.co",
#   "name": "Admin BusetaApp"
# }
#
# Headers: Set-Cookie: token=eyJ...; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

#### Test 2: Verificar Modo
```bash
curl http://localhost:3000/api/system/mode

# Respuesta esperada (200):
# { "mode": "seed" }
```

#### Test 3: Obtener Configuración Diaria
```bash
curl http://localhost:3000/api/config/daily-config

# Respuesta esperada (200):
# {
#   "success": true,
#   "data": {
#     "tarifa": 80000,
#     "limiteGasto": 200000,
#     "updatedAt": "2026-05-08T00:00:00Z",
#     "updatedBy": "admin-001"
#   },
#   "timestamp": "2026-05-08T..."
# }
```

#### Test 4: Probar Email (Solo en Modo Seed)
```bash
curl -X POST http://localhost:3000/api/emails/test \
  -H "Content-Type: application/json" \
  -d '{
    "ownerEmail": "propietaria@busetas.co",
    "conductorName": "Juan Pérez",
    "categoria": "gasolina",
    "monto": 150000,
    "descripcion": "Premium en Ecopetrol"
  }'

# Respuesta esperada (200):
# {
#   "success": true,
#   "data": {
#     "message": "Email enviado exitosamente",
#     "messageId": "email_xxxxx"
#   },
#   "timestamp": "2026-05-08T..."
# }
```

#### Test 5: Logout
```bash
curl http://localhost:3000/api/auth/logout

# Respuesta esperada (200):
# {
#   "success": true,
#   "data": { "message": "Sesión cerrada" },
#   "timestamp": "2026-05-08T..."
# }
#
# Headers: Set-Cookie: token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0
```

---

## 📁 Estructura de Archivos

### Archivos Creados/Modificados

```
lib/
├── types.ts                   # Tipos globales (User, JWT, Shift, etc)
├── validators.ts              # Esquemas Zod para validación
├── seedReader.ts              # Lectura de seed.json
├── authService.ts             # JWT, bcrypt, cookies
└── emailService.ts            # sendPendingExpenseAlert con Resend

app/api/
├── auth/
│   ├── login/route.ts         # POST /api/auth/login
│   └── logout/route.ts        # GET /api/auth/logout
├── config/
│   └── daily-config/route.ts  # GET /api/config/daily-config
├── system/
│   └── mode/route.ts          # GET /api/system/mode
└── emails/
    └── test/route.ts          # POST /api/emails/test (seed only)

components/
├── BusetaLogo.tsx            # Logo SVG de buseta
└── LoginForm.tsx             # Formulario de login con identidad ámbar

data/
└── seed.json                 # Datos iniciales (usuarios, config)

doc/
├── PLAN_BUSETAAPP.md         # Plan completo del proyecto
├── ESTADO_EJECUCION_BUSETAAPP.md  # Seguimiento de fases
└── RESUMEN_FASE_1_BOOTSTRAP.md    # Resumen de lo implementado

app/
├── page.tsx                  # Login screen (actualizado)
└── globals.css               # Variables CSS ámbar (actualizado)

.env.local                    # Variables de entorno (no commitear)
.env.example                  # Plantilla de variables
package.json                  # Dependencias (actualizado)
```

---

## 🎨 Identidad Visual

### Colores Ámbar Colombiano
```
#78350F — Ámbar oscuro (fondo principal)
#F59E0B — Ámbar brillante (accento, bordes)
#FFFFFF — Blanco (tarjeta, texto)
#1F2937 — Gris oscuro (texto principal)
#6B7280 — Gris medio (texto secundario)
```

### Login Screen
- Fondo: Ámbar oscuro con gradiente
- Tarjeta: Blanca con borde superior ámbar (4px)
- Logo: SVG de buseta estilizada (80x60px)
- Inputs: Email, Password
- Botón: Ámbar con hover más oscuro

---

## 🔒 Seguridad

### JWT
- **Estructura:** `{ userId, role, email, iat, exp }`
- **Expiración:** 24 horas
- **Almacenamiento:** Cookie HttpOnly, Secure, SameSite=Strict
- **Validación:** `jwt.verify(token, JWT_SECRET)`

### Contraseñas
- **Hash:** bcryptjs con salt rounds = 10
- **Nunca en plano:** Solo se almacenan hashes
- **Comparación:** `bcrypt.compare(plainPassword, hash)`

### Email
- **Servicio:** Resend (API Key en variables de entorno)
- **Asunto:** Incluye monto para claridad: `⚠️ Gasto pendiente de aprobación — $150000 COP`
- **Template:** HTML con identidad visual

### Modo Seed
- **Propósito:** Desarrollo y testing local
- **Credenciales:** Obvias y documentadas (NO usar en producción)
- **Endpoints especiales:** `/api/emails/test` solo en modo seed
- **Datos:** Preocupados en `data/seed.json`

---

## ✅ Checklist de Verificación Final

```
✅ npm run typecheck — cero errores
✅ npm run dev — servidor inicia sin errores
✅ http://localhost:3000 — login screen renderiza
✅ Logo SVG visible y centrado
✅ Colores ámbar correctos (#78350F, #F59E0B)
✅ POST /api/auth/login con credenciales válidas
✅ JWT generado y en cookie HttpOnly
✅ GET /api/system/mode retorna "seed"
✅ GET /api/config/daily-config retorna config
✅ POST /api/emails/test envía email a Resend
✅ GET /api/auth/logout limpia cookie
✅ Todos los tipos TypeScript correctos
✅ Todos los validadores Zod funcionales
✅ seed.json contiene usuarios y daily_config
```

---

## 📚 Documentación Completa

- **Plan detallado:** [`doc/PLAN_BUSETAAPP.md`](doc/PLAN_BUSETAAPP.md)
- **Estado de ejecución:** [`doc/ESTADO_EJECUCION_BUSETAAPP.md`](doc/ESTADO_EJECUCION_BUSETAAPP.md)
- **Resumen de Fase 1:** [`doc/RESUMEN_FASE_1_BOOTSTRAP.md`](doc/RESUMEN_FASE_1_BOOTSTRAP.md)

---

## 🚀 Próximos Pasos (Fase 2+)

La Fase 1 está **COMPLETADA** ✅. 

Los siguientes pasos son:

1. **Fase 2 — Gestión de Turnos**
   - Endpoints: `/api/shifts/init`, `/api/shifts/{id}/close`
   - Snapshots inmutables de turnos cerrados
   - Cálculo de ingresos/gastos en servidor

2. **Fase 3 — Dashboard**
   - Vistas para conductor, socio, admin
   - Tablas de turnos y gastos
   - Gráficos de tendencias

3. **Fase 4 — Notificaciones**
   - Email automático de alertas de gastos
   - WebSocket para actualizaciones en real-time

4. **Fase 5 — Deploy**
   - Vercel Blob para snapshots
   - CI/CD con GitHub Actions
   - Variables de entorno en producción

---

## 📧 Soporte

Para preguntas o issues:
1. Revisar [`PLAN_BUSETAAPP.md`](doc/PLAN_BUSETAAPP.md) (sección relevante)
2. Revisar [`ESTADO_EJECUCION_BUSETAAPP.md`](doc/ESTADO_EJECUCION_BUSETAAPP.md) (historial)
3. Revisar logs en terminal de `npm run dev`

---

**Fase 1 de BusetaApp — Completada el 2026-05-08**

🎉 ¡Bienvenido a BusetaApp! Tu cuaderno digital como conductor 🚌

