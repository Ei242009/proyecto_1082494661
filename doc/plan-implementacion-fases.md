# 🚀 Plan de Implementación por Fases
## Sistema Fullstack TypeScript · Next.js · Vercel · JSON Data Layer

> **Basado en:** Plan de Infraestructura Fullstack v1.0.0  
> **Metodología:** Entrega incremental — cada fase produce un entregable funcional y desplegado  
> **Estimado total:** ~6–10 horas de trabajo efectivo

---

## 📊 Resumen de Fases

| Fase | Nombre | Duración Est. | Entregable |
|------|--------|--------------|-----------|
| **0** | Preparación del Entorno | 30–45 min | Entorno local listo |
| **1** | Scaffolding del Proyecto | 45–60 min | Repo en GitHub + estructura base |
| **2** | Capa de Datos JSON | 30–45 min | Data Access Layer tipado |
| **3** | Home — Hola Mundo | 60–90 min | UI en producción con efecto elegante |
| **4** | API Route de Validación | 30–45 min | Endpoint `/api/data` funcional |
| **5** | Pipeline CI/CD | 30–45 min | GitHub Actions + Vercel conectado |
| **6** | Validación Final | 30–45 min | Checklist completo ✅ |

---

## Fase 0 — Preparación del Entorno

**Objetivo:** Tener todas las herramientas instaladas y cuentas configuradas antes de escribir una sola línea de código.

**Duración estimada:** 30–45 minutos

---

### 0.1 Verificar herramientas locales

Abrir terminal y ejecutar:

```bash
node --version    # debe ser >= 18.17.0
npm --version     # debe ser >= 9.x
git --version     # debe ser >= 2.x
```

Si Node.js no está instalado o es una versión anterior, descargarlo desde [nodejs.org](https://nodejs.org) (versión LTS).

---

### 0.2 Configurar Git globalmente

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
git config --global init.defaultBranch main
```

---

### 0.3 Verificar cuentas requeridas

| Cuenta | URL | Estado requerido |
|--------|-----|-----------------|
| GitHub | github.com | Activa + repositorio creado |
| Vercel | vercel.com | Activa + vinculada a GitHub |

**Vincular Vercel con GitHub** (si no está hecho):
1. Ir a [vercel.com](https://vercel.com) → Settings → Integrations
2. Conectar con GitHub
3. Autorizar acceso a los repositorios necesarios

---

### 0.4 Crear repositorio en GitHub

1. Ir a **github.com → New repository**
2. Nombre: `mi-proyecto` (o el nombre elegido)
3. Visibilidad: Public o Private (ambas funcionan con Vercel)
4. **No** inicializar con README (se hará desde local)
5. Copiar la URL del repositorio: `https://github.com/USUARIO/mi-proyecto.git`

---

### ✅ Criterio de salida — Fase 0

- [ ] `node --version` retorna `v18.x.x` o superior
- [ ] Cuenta GitHub activa con repositorio vacío creado
- [ ] Cuenta Vercel activa y vinculada a GitHub
- [ ] Git configurado con nombre y email

---

## Fase 1 — Scaffolding del Proyecto

**Objetivo:** Crear la estructura base del proyecto, configurar TypeScript de forma estricta y hacer el primer push al repositorio.

**Duración estimada:** 45–60 minutos

---

### 1.1 Crear el proyecto con Next.js

```bash
npx create-next-app@latest mi-proyecto \
  --typescript \
  --eslint \
  --app \
  --no-tailwind \
  --src-dir \
  --import-alias "@/*"

cd mi-proyecto
```

> `create-next-app` generará automáticamente `tsconfig.json`, `next.config.ts`, estructura de carpetas y dependencias base.

---

### 1.2 Ajustar `tsconfig.json` a modo estricto

Reemplazar el contenido generado con la configuración estricta:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Por qué `strict: true`:** Activa un conjunto de verificaciones TypeScript que evitan errores comunes: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, entre otros.

---

### 1.3 Agregar scripts al `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "validate": "npm run typecheck && npm run lint"
  }
}
```

---

### 1.4 Crear la estructura de carpetas

```bash
# Carpeta de datos JSON (la "base de datos")
mkdir data

# Carpeta de componentes y librería
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/types

# Carpeta de API Routes
mkdir -p src/app/api/data

# Carpeta de GitHub Actions
mkdir -p .github/workflows
```

---

### 1.5 Crear `.env.example` y `.env.local`

**`.env.example`** (se commitea en Git — es la plantilla):
```env
NEXT_PUBLIC_APP_NAME=MiProyecto
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=development
```

**`.env.local`** (NO se commitea — es el archivo real local):
```env
NEXT_PUBLIC_APP_NAME=MiProyecto
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

### 1.6 Configurar `.gitignore`

Agregar al `.gitignore` generado por Next.js:

```gitignore
# Environment
.env.local
.env.*.local

# Vercel
.vercel
```

---

### 1.7 Primer commit y push a GitHub

```bash
git init
git add .
git commit -m "feat: initial project scaffolding with TypeScript strict mode"
git branch -M main
git remote add origin https://github.com/USUARIO/mi-proyecto.git
git push -u origin main
```

---

### 1.8 Verificación local

```bash
npm run dev
```

Abrir `http://localhost:3000` — debe mostrar la página de bienvenida por defecto de Next.js (se reemplazará en Fase 3).

```bash
npm run typecheck   # debe pasar sin errores
npm run lint        # debe pasar sin warnings
```

---

### ✅ Criterio de salida — Fase 1

- [ ] Proyecto corre localmente en `localhost:3000`
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run lint` pasa sin warnings
- [ ] Código pusheado a GitHub en rama `main`
- [ ] Estructura de carpetas creada correctamente

---

## Fase 2 — Capa de Datos JSON

**Objetivo:** Crear los archivos JSON que actúan como base de datos y el Data Access Layer tipado que los consume.

**Duración estimada:** 30–45 minutos

---

### 2.1 Crear los archivos JSON en `/data`

**`data/site.json`:**
```json
{
  "name": "Mi Proyecto",
  "version": "1.0.0",
  "home": {
    "title": "Hola Mundo",
    "subtitle": "Sistema Fullstack TypeScript",
    "effect": "fade-in"
  }
}
```

**`data/content.json`:**
```json
{
  "pages": [
    {
      "id": "home",
      "slug": "/",
      "title": "Hola Mundo",
      "active": true
    }
  ]
}
```

---

### 2.2 Crear los tipos TypeScript en `src/types/`

**`src/types/site.types.ts`:**
```typescript
export interface SiteHome {
  title: string;
  subtitle: string;
  effect: string;
}

export interface SiteConfig {
  name: string;
  version: string;
  home: SiteHome;
}

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  active: boolean;
}

export interface ContentData {
  pages: ContentPage[];
}
```

---

### 2.3 Crear el Data Access Layer en `src/lib/data.ts`

```typescript
import fs from 'fs';
import path from 'path';
import type { SiteConfig, ContentData, ContentPage } from '@/types/site.types';

// Re-exportar tipos para uso conveniente desde otros módulos
export type { SiteConfig, ContentData, ContentPage };

/**
 * Lee y parsea un archivo JSON de la carpeta /data
 * con tipado genérico estricto.
 */
function readJsonFile<T>(fileName: string): T {
  const filePath = path.join(process.cwd(), 'data', fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

/**
 * Retorna la configuración general del sitio.
 * Fuente: data/site.json
 */
export function getSiteConfig(): SiteConfig {
  return readJsonFile<SiteConfig>('site.json');
}

/**
 * Retorna todos los datos de contenido de páginas.
 * Fuente: data/content.json
 */
export function getContentData(): ContentData {
  return readJsonFile<ContentData>('content.json');
}

/**
 * Busca y retorna una página activa por su slug.
 * Retorna undefined si no existe o está inactiva.
 */
export function getActivePage(slug: string): ContentPage | undefined {
  const { pages } = getContentData();
  return pages.find((page) => page.slug === slug && page.active);
}
```

---

### 2.4 Verificar el tipado

```bash
npm run typecheck
```

No debe haber errores. Si los hay, verificar que las rutas de importación con `@/` estén correctas en `tsconfig.json`.

---

### 2.5 Commit de la capa de datos

```bash
git add .
git commit -m "feat: add JSON data layer with TypeScript types and data access functions"
git push
```

---

### ✅ Criterio de salida — Fase 2

- [ ] Archivos `data/site.json` y `data/content.json` creados
- [ ] Tipos TypeScript definidos en `src/types/site.types.ts`
- [ ] Data Access Layer en `src/lib/data.ts` sin errores
- [ ] `npm run typecheck` pasa limpio
- [ ] Cambios pusheados a GitHub

---

## Fase 3 — Home: Hola Mundo con Efecto Elegante

**Objetivo:** Construir la página principal con "Hola Mundo" centrado, consumiendo datos del JSON y aplicando el efecto visual elegante.

**Duración estimada:** 60–90 minutos

---

### 3.1 Limpiar la página por defecto de Next.js

Eliminar el contenido de `src/app/page.tsx` y `src/app/globals.css` generados automáticamente para empezar desde cero.

---

### 3.2 Escribir `src/app/globals.css`

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-bg: #0a0a0f;
  --color-surface: #12121a;
  --color-primary: #6c63ff;
  --color-accent: #a78bfa;
  --color-text: #f0f0f5;
  --color-muted: #6b7280;
  --font-main: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

html, body {
  height: 100%;
}

body {
  font-family: var(--font-main);
  background-color: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes glowPulse {
  0%, 100% {
    text-shadow: 0 0 20px rgba(108,99,255,0.4), 0 0 40px rgba(108,99,255,0.2);
  }
  50% {
    text-shadow: 0 0 40px rgba(108,99,255,0.8), 0 0 80px rgba(167,139,250,0.4);
  }
}

@keyframes borderGlow {
  0%, 100% { border-color: rgba(108,99,255,0.3); }
  50%       { border-color: rgba(167,139,250,0.8); }
}

.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.home-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 80% 60% at 50% 50%,
    rgba(108, 99, 255, 0.08) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.hero-card {
  text-align: center;
  padding: 3rem 4rem;
  border: 1px solid rgba(108,99,255,0.3);
  border-radius: 1.5rem;
  background: rgba(18,18,26,0.8);
  backdrop-filter: blur(20px);
  animation: fadeInUp 0.8s ease-out forwards, borderGlow 3s ease-in-out infinite;
  max-width: 600px;
  width: 100%;
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #f0f0f5 0%, #6c63ff 50%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: glowPulse 3s ease-in-out infinite;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1rem;
  color: var(--color-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  animation: fadeInUp 0.8s ease-out 0.3s both;
  margin-bottom: 2rem;
}

.ts-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: rgba(108,99,255,0.15);
  border: 1px solid rgba(108,99,255,0.4);
  border-radius: 999px;
  font-size: 0.8rem;
  color: var(--color-accent);
  font-weight: 600;
  letter-spacing: 0.05em;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.ts-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: glowPulse 2s ease-in-out infinite;
}
```

---

### 3.3 Escribir `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mi Proyecto — TypeScript Fullstack',
  description: 'Sistema fullstack con Next.js, TypeScript y JSON como base de datos',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

---

### 3.4 Escribir `src/app/page.tsx`

```typescript
import { getSiteConfig } from '@/lib/data';
import type { SiteConfig } from '@/lib/data';

export default function HomePage(): React.JSX.Element {
  const siteConfig: SiteConfig = getSiteConfig();
  const { title, subtitle } = siteConfig.home;

  return (
    <main className="home-container">
      <div className="hero-card">
        <h1 className="hero-title">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        <span className="ts-badge">
          <span className="ts-dot" />
          TypeScript · Next.js · Vercel
        </span>
      </div>
    </main>
  );
}
```

---

### 3.5 Verificar en local

```bash
npm run dev
```

Abrir `http://localhost:3000`. Verificar:
- "Hola Mundo" centrado en la pantalla
- Animación `fade-in-up` al cargar
- Efecto `glow` pulsante en el título
- Borde de la tarjeta animado
- Badge con punto animado

---

### 3.6 Build de producción local

```bash
npm run build
npm run start
```

Verificar que el build estático no tenga errores. Si los hay, corregir antes de continuar.

---

### 3.7 Commit del Home

```bash
git add .
git commit -m "feat: add Home page with Hola Mundo centered and elegant glow effect"
git push
```

---

### ✅ Criterio de salida — Fase 3

- [ ] "Hola Mundo" visible y centrado en `localhost:3000`
- [ ] Texto leído dinámicamente desde `data/site.json`
- [ ] Efecto fade-in, glow y borde animado funcionando
- [ ] `npm run build` completa sin errores
- [ ] `npm run typecheck` pasa limpio
- [ ] Cambios pusheados a GitHub

---

## Fase 4 — API Route de Validación

**Objetivo:** Crear el endpoint `/api/data` que expone los datos JSON a través de una respuesta tipada, validando que el backend TypeScript funciona correctamente.

**Duración estimada:** 30–45 minutos

---

### 4.1 Crear `src/app/api/data/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/data';
import type { SiteConfig } from '@/lib/data';

export async function GET(): Promise<NextResponse> {
  const config: SiteConfig = getSiteConfig();

  return NextResponse.json({
    status: 'ok',
    data: config,
    timestamp: new Date().toISOString(),
  });
}
```

---

### 4.2 Verificar el endpoint localmente

```bash
npm run dev
```

Abrir `http://localhost:3000/api/data` en el navegador o usar curl:

```bash
curl http://localhost:3000/api/data
```

Respuesta esperada:
```json
{
  "status": "ok",
  "data": {
    "name": "Mi Proyecto",
    "version": "1.0.0",
    "home": {
      "title": "Hola Mundo",
      "subtitle": "Sistema Fullstack TypeScript",
      "effect": "fade-in"
    }
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### 4.3 Commit del endpoint

```bash
git add .
git commit -m "feat: add API Route /api/data with typed JSON response"
git push
```

---

### ✅ Criterio de salida — Fase 4

- [ ] `GET /api/data` responde con JSON válido
- [ ] La respuesta incluye los datos de `site.json`
- [ ] Sin errores TypeScript en la ruta
- [ ] Cambios pusheados a GitHub

---

## Fase 5 — Pipeline CI/CD

**Objetivo:** Conectar Vercel al repositorio para deploy automático y configurar GitHub Actions para validar TypeScript y ESLint en cada push.

**Duración estimada:** 30–45 minutos

---

### 5.1 Crear el workflow de GitHub Actions

**`.github/workflows/ci.yml`:**

```yaml
name: CI — TypeScript Validation

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  validate:
    name: TypeCheck & Lint & Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 18
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript — Check types
        run: npm run typecheck

      - name: ESLint — Check code quality
        run: npm run lint

      - name: Next.js — Production build
        run: npm run build
```

---

### 5.2 Pushear y verificar GitHub Actions

```bash
git add .
git commit -m "ci: add GitHub Actions workflow for TypeScript validation"
git push
```

Ir a **GitHub → Actions** y verificar que el workflow se ejecuta y pasa correctamente. Los tres pasos deben ser verdes: TypeCheck, Lint y Build.

---

### 5.3 Configurar protección de rama `main`

En **GitHub → Settings → Branches → Add rule** para el patrón `main`:

- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - Seleccionar: `TypeCheck & Lint & Build`
- ✅ Require branches to be up to date before merging
- Guardar cambios

---

### 5.4 Conectar Vercel al repositorio

1. Ir a [vercel.com](https://vercel.com) → **Add New Project**
2. Seleccionar **Import Git Repository**
3. Elegir el repositorio `mi-proyecto`
4. Vercel detecta Next.js automáticamente

**Configuración en Vercel:**

| Campo | Valor |
|-------|-------|
| Framework Preset | `Next.js` |
| Root Directory | `./` |
| Build Command | `npm run build` |
| Node.js Version | `18.x` |

---

### 5.5 Agregar variables de entorno en Vercel

En **Settings → Environment Variables:**

| Variable | Valor | Entorno |
|----------|-------|---------|
| `NEXT_PUBLIC_APP_NAME` | `MiProyecto` | Production, Preview, Development |

---

### 5.6 Primer deploy en Vercel

Hacer click en **Deploy**. Vercel ejecutará:
1. `npm install`
2. `npm run build`
3. Deploy a Edge Network

Al finalizar, se genera la URL de producción: `https://mi-proyecto.vercel.app`

---

### 5.7 Verificar deploy en producción

Abrir la URL de producción y confirmar:
- "Hola Mundo" visible y centrado
- Efecto visual funcionando
- `https://mi-proyecto.vercel.app/api/data` retorna JSON

---

### ✅ Criterio de salida — Fase 5

- [ ] GitHub Actions ejecuta y pasa en verde
- [ ] Rama `main` protegida con reglas de branch protection
- [ ] Proyecto conectado a Vercel exitosamente
- [ ] Deploy de producción completado sin errores
- [ ] URL de producción accesible con "Hola Mundo"
- [ ] Preview URLs funcionan al crear Pull Requests

---

## Fase 6 — Validación Final

**Objetivo:** Ejecutar el checklist completo del sistema para certificar que todos los requisitos del plan de infraestructura están cumplidos.

**Duración estimada:** 30–45 minutos

---

### 6.1 Validación TypeScript end-to-end

```bash
# Verificación de tipos completa
npm run typecheck

# Salida esperada:
# (ningún error — el comando no imprime nada si todo está bien)
```

Si hay errores, corregirlos antes de continuar.

---

### 6.2 Validación de calidad de código

```bash
npm run lint

# Salida esperada:
# ✔ No ESLint warnings or errors
```

---

### 6.3 Validación del build de producción

```bash
npm run build

# Salida esperada al final:
# ✓ Compiled successfully
# Route (app)                    Size     First Load JS
# ┌ ○ /                          ...
# └ ƒ /api/data                  ...
```

---

### 6.4 Validación de la capa de datos

Verificar que el JSON es leído correctamente tanto en local como en producción:

```bash
# Local
curl http://localhost:3000/api/data

# Producción
curl https://mi-proyecto.vercel.app/api/data
```

Ambas respuestas deben retornar el JSON de `data/site.json` con status `ok`.

---

### 6.5 Validación del efecto visual

Abrir `https://mi-proyecto.vercel.app` y confirmar:

| Elemento | Estado esperado |
|----------|----------------|
| "Hola Mundo" | Centrado horizontal y verticalmente |
| Animación fade-in-up | Se ejecuta al cargar la página |
| Glow pulsante en título | Animación continua visible |
| Borde de tarjeta | Animación de color continua |
| Badge TypeScript | Visible con punto pulsante |
| Fondo oscuro con gradiente | Radial purple sutil centrado |

---

### 6.6 Checklist final completo

#### Entorno y Configuración
- [ ] Node.js >= 18.17.0
- [ ] TypeScript `strict: true` en `tsconfig.json`
- [ ] `.env.local` en `.gitignore` (no commiteado)
- [ ] `.env.example` commiteado como plantilla

#### Estructura del Proyecto
- [ ] Carpeta `data/` con `site.json` y `content.json`
- [ ] `src/types/site.types.ts` con interfaces
- [ ] `src/lib/data.ts` con Data Access Layer
- [ ] `src/app/page.tsx` consumiendo datos del JSON
- [ ] `src/app/api/data/route.ts` funcional

#### TypeScript
- [ ] Sin uso de `any` en todo el código
- [ ] Todos los archivos `.ts` y `.tsx` sin errores
- [ ] `npm run typecheck` pasa limpio
- [ ] Generics usados en `readJsonFile<T>()`

#### GitHub
- [ ] Repositorio con código completo
- [ ] Rama `main` protegida
- [ ] `.github/workflows/ci.yml` activo
- [ ] GitHub Actions en verde (TypeCheck + Lint + Build)

#### Vercel
- [ ] Proyecto conectado al repositorio GitHub
- [ ] Deploy de producción exitoso
- [ ] URL de producción funcional
- [ ] Variables de entorno configuradas
- [ ] Preview URLs funcionan en PRs

#### Visual — Home
- [ ] "Hola Mundo" centrado perfectamente
- [ ] Texto leído desde `data/site.json`
- [ ] Efecto elegante (fade-in + glow + borde animado)
- [ ] Responsive en móvil y desktop

---

## 📈 Diagrama de Progresión de Fases

```
Fase 0          Fase 1          Fase 2          Fase 3
Entorno    ──▶  Scaffolding ──▶  JSON Data   ──▶  Home UI
Listo           en GitHub        Layer            "Hola Mundo"
   │               │               │                  │
   ▼               ▼               ▼                  ▼
Cuentas        Estructura       Tipos TS           Efecto
configuradas   base + push      + data.ts          elegante
                                                       │
                                                       ▼
                                               Fase 4          Fase 5          Fase 6
                                               API Route  ──▶  CI/CD      ──▶  Validación
                                               /api/data        GitHub          Final ✅
                                                   │            Actions +
                                                   ▼            Vercel
                                               Backend
                                               validado
```

---

## 🗓️ Estimado de Tiempo Total

| Escenario | Tiempo |
|-----------|--------|
| Desarrollador con experiencia en Next.js | ~3–4 horas |
| Desarrollador con experiencia general en TypeScript | ~5–7 horas |
| Desarrollador aprendiendo el stack | ~8–10 horas |

> **Recomendación:** No saltarse ninguna fase. Cada una tiene su propio criterio de salida que garantiza que la siguiente fase parte de una base sólida.

---

## 🔄 Próximos Pasos (Post-Fase 6)

Una vez validado el sistema base, las siguientes iteraciones naturales son:

1. **Nuevas entidades JSON** — agregar `data/users.json`, `data/products.json`, etc.
2. **Nuevas páginas** — rutas adicionales consumiendo el Data Access Layer
3. **Componentes reutilizables** — expandir `src/components/ui/`
4. **Middleware** — validación y autenticación en Next.js
5. **Testing** — agregar Jest + Testing Library para validar componentes y funciones
6. **Dominio personalizado** — conectar un dominio propio en Vercel

---

*Plan de Implementación por Fases v1.0.0 — basado en Plan de Infraestructura Fullstack TypeScript*
