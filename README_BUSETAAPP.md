# 🚌 BusetaApp — Sistema de Gestión Financiera para Conductores

> **Estado:** Fase 1 ✅ COMPLETADA  
> **Fecha:** 2026-05-08  
> **Ingeniero Responsable:** Fullstack Senior Especializado en Arquitectura Serverless y Autenticación JWT

---

## 📖 ¿Qué es BusetaApp?

BusetaApp es la solución digital que reemplaza el cuaderno físico del conductor de transporte informal. En Colombia, miles de conductores de busetas, mototaxis y colectivos llevan cuadernos donde anotan gastos. BusetaApp los moderniza.

### Visión
"El cuaderno digital del conductor — confiable, seguro, ámbar."

### Target
- **Conductores:** Hombres 30-45 años, Android básico, WhatsApp daily
- **Propietarios:** Dueños de 5-15 vehículos, necesitan auditoría de gastos
- **Admin:** Equipo confiable del dueño principal

---

## 🎯 Fase 1: Bootstrap (COMPLETADA ✅)

### Hitos

✅ **Autenticación JWT Segura**
- JWT con rol incluido: `{ userId, role, email }`
- Expiración 24h
- Cookie HttpOnly, Secure, SameSite=Strict
- Bcryptjs para hash de contraseñas

✅ **Identidad Visual Colombiana**
- Fondo ámbar oscuro: #78350F
- Accento ámbar: #F59E0B
- Logo SVG de buseta estilizada
- Tarjeta blanca con borde superior ámbar

✅ **Endpoints API Serverless**
- `POST /api/auth/login` — Autenticación
- `GET /api/auth/logout` — Cierre de sesión
- `GET /api/system/mode` — Modo seed/production
- `GET /api/config/daily-config` — Config diaria (tarifa $80k, límite $200k)
- `POST /api/emails/test` — Prueba de email

✅ **Email Service con Resend**
- Función `sendPendingExpenseAlert`
- Alertas automáticas cuando gasto > límite
- Asunto: "⚠️ Gasto pendiente — [monto] COP"
- HTML template con identidad visual

✅ **Seed Management**
- Usuarios de prueba: admin, conductor, socio
- Configuración inicial: tarifa y límites
- Modo seed para desarrollo local

✅ **TypeScript + Zod**
- 20+ tipos definidos
- 6 validadores Zod
- 100% type-safe

---

## 🚀 Instalación Rápida

### 1. Clonar y Instalar
```bash
git clone <repo>
cd proyecto_1082494661
npm install
```

### 2. Variables de Entorno
```bash
# Crear .env.local
JWT_SECRET=tu-secret
RESEND_API_KEY=tu-api-key
MODE=seed
```

### 3. Ejecutar
```bash
npm run typecheck  # Verificar tipos
npm run dev        # Iniciar servidor
```

### 4. Acceder
```
URL: http://localhost:3000
Email: admin@busetaapp.co
Contraseña: admin123456
```

---

## 📁 Estructura del Proyecto

```
busetaapp/
├── lib/
│   ├── types.ts              # Tipos globales
│   ├── validators.ts         # Esquemas Zod
│   ├── seedReader.ts         # Lectura seed.json
│   ├── authService.ts        # JWT + bcrypt
│   └── emailService.ts       # Email con Resend
│
├── app/
│   ├── page.tsx              # Login screen
│   ├── globals.css           # Estilos + colores ámbar
│   └── api/
│       ├── auth/login        # POST /api/auth/login
│       ├── auth/logout       # GET /api/auth/logout
│       ├── system/mode       # GET /api/system/mode
│       ├── config/           # GET /api/config/daily-config
│       └── emails/test       # POST /api/emails/test
│
├── components/
│   ├── BusetaLogo.tsx        # Logo SVG
│   └── LoginForm.tsx         # Formulario login
│
├── data/
│   └── seed.json             # Datos iniciales
│
├── doc/
│   ├── PLAN_BUSETAAPP.md                    # Plan completo (22 secciones)
│   ├── ESTADO_EJECUCION_BUSETAAPP.md        # Tracking de fases
│   └── RESUMEN_FASE_1_BOOTSTRAP.md          # Detalles Fase 1
│
└── .env.local                # Variables de entorno (no commitear)
```

---

## 🔐 Seguridad

### JWT
- ✅ Rol incluido por diseño (rol fijo único)
- ✅ Expiración 24h
- ✅ Almacenamiento HttpOnly
- ✅ Validación en servidor

### Contraseñas
- ✅ Bcryptjs (salt 10)
- ✅ Nunca en plano
- ✅ Comparación constante

### Email
- ✅ Resend API Key en env
- ✅ Asunto claro con monto
- ✅ Template HTML

---

## 📚 Documentación

### Lectura Recomendada
1. [`BUSETAAPP_FASE_1_INICIO.md`](BUSETAAPP_FASE_1_INICIO.md) — **Empieza aquí**
2. [`doc/PLAN_BUSETAAPP.md`](doc/PLAN_BUSETAAPP.md) — Plan arquitectónico completo
3. [`doc/RESUMEN_FASE_1_BOOTSTRAP.md`](doc/RESUMEN_FASE_1_BOOTSTRAP.md) — Detalles técnicos
4. [`BUSETAAPP_FASE_1_VERIFICACION_FINAL.md`](BUSETAAPP_FASE_1_VERIFICACION_FINAL.md) — Verificación

---

## 🧪 Pruebas

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@busetaapp.co","password":"admin123456"}'
```

### Verificar Modo
```bash
curl http://localhost:3000/api/system/mode
# { "mode": "seed" }
```

### Obtener Config
```bash
curl http://localhost:3000/api/config/daily-config
```

### Probar Email (Seed)
```bash
curl -X POST http://localhost:3000/api/emails/test \
  -H "Content-Type: application/json" \
  -d '{
    "ownerEmail":"propietaria@busetas.co",
    "conductorName":"Juan",
    "categoria":"gasolina",
    "monto":150000,
    "descripcion":"Premium"
  }'
```

---

## 🎨 Identidad Visual

### Paleta Ámbar Colombiana
```
#78350F — Ámbar oscuro (fondo)
#F59E0B — Ámbar brillante (accento)
#FFFFFF — Blanco (tarjeta)
#1F2937 — Gris oscuro (texto)
#6B7280 — Gris medio (label)
```

### Login Screen
- Fondo: Ámbar oscuro con gradiente
- Tarjeta: Blanca, borde superior ámbar 4px
- Logo: Buseta SVG estilizada
- Inputs: Email, Password
- Botón: Ámbar con hover

---

## 🚦 Próximas Fases

### Fase 2: Gestión de Turnos (Próximo)
- Endpoints `/api/shifts/init`, `/api/shifts/{id}/close`
- Snapshots inmutables en Vercel Blob
- Cálculo de ingresos/gastos en servidor

### Fase 3: Dashboard
- Vistas de conductor, socio, admin
- Tablas y gráficos

### Fase 4: Notificaciones
- Email automático de alertas
- WebSocket real-time

### Fase 5: Deploy
- Vercel + Blob
- CI/CD con GitHub Actions

---

## 👨‍💻 Stack Técnico

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | Next.js | 16.2.3 |
| Lenguaje | TypeScript | 5.x |
| UI | React | 19.2.4 |
| Estilos | Tailwind CSS | 4.x |
| Validación | Zod | 4.3.6 |
| Autenticación | JWT + bcryptjs | - |
| Email | Resend | 3.x |
| Almacenamiento | Vercel Blob | 0.20.1 |
| Animaciones | Framer Motion | 12.38.0 |

---

## 📊 Estado del Proyecto

| Métrica | Estado |
|---------|--------|
| Fase 1 | ✅ Completada |
| TypeScript | ✅ 100% tipado |
| Seguridad | ✅ JWT + bcrypt |
| UI/UX | ✅ Identidad visual |
| Documentación | ✅ Completa |
| Pruebas | ✅ Ready |

---

## 🎓 Principios de Diseño

### 1. Rol Fijo Único
- Un usuario = un rol (no cambiar entre contextos)
- JWT incluye rol por eficiencia
- Simplifica autorización

### 2. Cálculo en Servidor
- Nunca confiar en cliente
- Snapshot es verdad de autoridad
- Inmutable después del cierre

### 3. Identidad Colombiana
- Ámbar = confianza, transporte
- Diseño móvil-first
- Lenguaje local ("Gasto", "Turno")

### 4. Seed-Driven
- Desarrollo sin BD
- Testing offline
- Fácil onboarding

### 5. TypeScript First
- Type safety completo
- Validación en tiempo de compilación
- Menos bugs en producción

---

## 📞 Soporte

### Documentación
- Plan: `doc/PLAN_BUSETAAPP.md`
- Estado: `doc/ESTADO_EJECUCION_BUSETAAPP.md`
- Resumen: `doc/RESUMEN_FASE_1_BOOTSTRAP.md`
- Inicio: `BUSETAAPP_FASE_1_INICIO.md`
- Verificación: `BUSETAAPP_FASE_1_VERIFICACION_FINAL.md`

### Checklist de Verificación
```bash
npm run typecheck  # Debe pasar
npm run dev        # Debe iniciar
curl http://localhost:3000  # Debe renderizar login
```

---

## 🎉 ¡Bienvenido a BusetaApp!

Tu cuaderno digital como conductor está aquí. Seguro, confiable, ámbar. 🚌

**Fase 1 Completada:** 2026-05-08  
**Ingeniero Responsable:** Fullstack Senior  
**Próximo Paso:** Fase 2 — Gestión de Turnos

---

*Made with ❤️ for Colombian Transport Workers*
