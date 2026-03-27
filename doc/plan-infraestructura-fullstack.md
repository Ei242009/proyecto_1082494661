# 🏗️ Plan de Infraestructura — Fullstack TypeScript con Vercel & JSON como Base de Datos

> **Rol:** Arquitecto de Software  
> **Stack:** Next.js 14 · TypeScript · Vercel · GitHub · JSON Data Layer  
> **Objetivo inicial:** Home con "Hola Mundo" centrado y efecto elegante, validando TypeScript end-to-end

---

## 📋 Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Estructura de Carpetas](#3-estructura-de-carpetas)
4. [Stack Tecnológico](#4-stack-tecnológico)
5. [Capa de Datos JSON](#5-capa-de-datos-json)
6. [Requisitos del Entorno](#6-requisitos-del-entorno)
7. [Configuración del Repositorio GitHub](#7-configuración-del-repositorio-github)
8. [Configuración de Vercel](#8-configuración-de-vercel)
9. [Implementación del Home — Hola Mundo](#9-implementación-del-home--hola-mundo)
10. [Pipeline CI/CD](#10-pipeline-cicd)
11. [Convenciones y Estándares](#11-convenciones-y-estándares)
12. [Checklist de Validación](#12-checklist-de-validación)

---

## 1. Visión General

### Descripción

Sistema web fullstack construido íntegramente en **TypeScript**, sin base de datos relacional ni NoSQL convencional. La persistencia de datos se gestiona mediante **archivos JSON** organizados en una carpeta `data/`, actuando como una capa de datos liviana, portable y versionable en Git.

El despliegue es continuo: cada push a la rama `main` del repositorio GitHub dispara automáticamente un deploy en **Vercel**.

### Principios de Diseño

| Principio | Descripción |
|-----------|-------------|
| **TypeScript First** | Todo el código, incluyendo tipos de datos JSON, es tipado estrictamente |
| **Zero Database** | Los datos viven en archivos `.json` dentro del repositorio |
| **Serverless** | Las funciones backend corren como API Routes de Next.js en Vercel |
| **Git as Source of Truth** | Los datos JSON se versionan junto al código |
| **Deploy Continuo** | `main` → Vercel producción; ramas → preview URLs |

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        DEVELOPER                            │
│                    (Local Machine)                          │
└───────────────────────────┬─────────────────────────────────┘
                            │ git push
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                        │
│                                                             │
│  ├── src/          (código TypeScript)                      │
│  ├── data/         (JSON como base de datos)                │
│  ├── public/       (assets estáticos)                       │
│  └── .github/      (workflows CI/CD)                        │
└───────────────────────────┬─────────────────────────────────┘
                            │ webhook automático
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL PLATFORM                          │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │   Build Step    │    │     Edge Network (CDN)        │   │
│  │  tsc + next     │───▶│  Pages / Static Assets       │   │
│  │  build          │    │  API Routes (Serverless)     │   │
│  └─────────────────┘    └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO FINAL                        │
│              https://tu-proyecto.vercel.app                 │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
Request del usuario
      │
      ▼
Next.js Page / API Route (TypeScript)
      │
      ▼
Data Access Layer (lib/data.ts)
      │
      ▼
fs.readFileSync / import() → archivo .json en /data
      │
      ▼
Tipos TypeScript validados → Response al cliente
```

---

## 3. Estructura de Carpetas

```
mi-proyecto/
│
├── 📁 src/
│   ├── 📁 app/                          # Next.js App Router
│   │   ├── layout.tsx                   # Layout raíz con metadatos
│   │   ├── page.tsx                     # Home — "Hola Mundo"
│   │   ├── globals.css                  # Estilos globales
│   │   └── 📁 api/                      # API Routes (Backend)
│   │       └── 📁 data/
│   │           └── route.ts             # Endpoint de ejemplo /api/data
│   │
│   ├── 📁 components/                   # Componentes React reutilizables
│   │   ├── HolaMundo.tsx                # Componente principal del Home
│   │   └── 📁 ui/                       # Componentes base
│   │
│   ├── 📁 lib/                          # Lógica compartida
│   │   ├── data.ts                      # Data Access Layer (lee JSON)
│   │   └── types.ts                     # Tipos TypeScript globales
│   │
│   └── 📁 types/                        # Definiciones de tipos por entidad
│       └── site.types.ts
│
├── 📁 data/                             # 🗄️ "Base de Datos" JSON
│   ├── site.json                        # Configuración general del sitio
│   └── content.json                     # Contenido de páginas
│
├── 📁 public/                           # Assets estáticos
│   └── favicon.ico
│
├── 📁 .github/
│   └── 📁 workflows/
│       └── ci.yml                       # GitHub Actions — lint + typecheck
│
├── .env.local                           # Variables de entorno locales (no en Git)
├── .env.example                         # Plantilla de variables (sí en Git)
├── .gitignore
├── next.config.ts                       # Configuración de Next.js
├── tsconfig.json                        # Configuración TypeScript estricta
├── package.json
└── README.md
```

---

## 4. Stack Tecnológico

### Dependencias Principales

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `next` | `^14.x` | Framework fullstack (App Router) |
| `react` | `^18.x` | UI Library |
| `react-dom` | `^18.x` | Renderizado DOM |
| `typescript` | `^5.x` | Tipado estático |

### Dependencias de Desarrollo

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `@types/node` | `^20.x` | Tipos de Node.js |
| `@types/react` | `^18.x` | Tipos de React |
| `@types/react-dom` | `^18.x` | Tipos de ReactDOM |
| `eslint` | `^8.x` | Linting |
| `eslint-config-next` | `^14.x` | Reglas ESLint para Next.js |

### `package.json` — Scripts

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

## 5. Capa de Datos JSON

### Filosofía

Los archivos JSON en `/data` reemplazan una base de datos convencional. Son leídos en tiempo de build (estático) o en runtime (API Routes), dependiendo del caso de uso.

### Archivos JSON Iniciales

#### `data/site.json`
```json
{
  "name": "Mi Proyecto",
  "version": "1.0.0",
  "home": {
    "title": "Hola Mundo",
    "subtitle": "Bienvenido al sistema fullstack TypeScript",
    "effect": "fade-in"
  }
}
```

#### `data/content.json`
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

### Data Access Layer — `src/lib/data.ts`

```typescript
import fs from 'fs';
import path from 'path';

// Tipos estrictamente tipados
export interface SiteConfig {
  name: string;
  version: string;
  home: {
    title: string;
    subtitle: string;
    effect: string;
  };
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

// Función genérica para leer JSON tipado
function readJsonFile<T>(fileName: string): T {
  const filePath = path.join(process.cwd(), 'data', fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

// Funciones de acceso a datos
export function getSiteConfig(): SiteConfig {
  return readJsonFile<SiteConfig>('site.json');
}

export function getContentData(): ContentData {
  return readJsonFile<ContentData>('content.json');
}

export function getActivePage(slug: string): ContentPage | undefined {
  const { pages } = getContentData();
  return pages.find((page) => page.slug === slug && page.active);
}
```

---

## 6. Requisitos del Entorno

### Requisitos Locales

| Herramienta | Versión Mínima | Verificación |
|-------------|---------------|--------------|
| Node.js | `>= 18.17.0` | `node --version` |
| npm | `>= 9.x` | `npm --version` |
| Git | `>= 2.x` | `git --version` |

### Variables de Entorno

#### `.env.example` (committear en Git)
```env
# Entorno
NEXT_PUBLIC_APP_NAME=MiProyecto
NEXT_PUBLIC_APP_VERSION=1.0.0

# Configuración de entorno
NODE_ENV=development
```

#### `.env.local` (NO committear — ignorar en .gitignore)
```env
NEXT_PUBLIC_APP_NAME=MiProyecto
```

### `.gitignore` esencial

```gitignore
# Dependencies
node_modules/

# Next.js
.next/
out/

# Environment variables
.env.local
.env.*.local

# TypeScript
*.tsbuildinfo

# OS
.DS_Store
Thumbs.db

# Vercel
.vercel
```

---

## 7. Configuración del Repositorio GitHub

### Pasos de Inicialización

```bash
# 1. Crear proyecto Next.js con TypeScript
npx create-next-app@latest mi-proyecto \
  --typescript \
  --eslint \
  --app \
  --no-tailwind \
  --src-dir \
  --import-alias "@/*"

# 2. Entrar al directorio
cd mi-proyecto

# 3. Crear carpeta data con archivos JSON iniciales
mkdir data
echo '{"name":"Mi Proyecto","version":"1.0.0","home":{"title":"Hola Mundo","subtitle":"Sistema TypeScript","effect":"fade-in"}}' > data/site.json

# 4. Inicializar repositorio y subir
git init
git add .
git commit -m "feat: initial project setup with TypeScript + JSON data layer"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mi-proyecto.git
git push -u origin main
```

### Configuración de Ramas

```
main          → Producción (auto-deploy en Vercel)
develop       → Integración (preview URL en Vercel)
feature/*     → Desarrollo de funcionalidades (preview URL)
fix/*         → Correcciones de bugs
```

### Branch Protection en GitHub

Configurar en **Settings → Branches → Add rule** para `main`:

- ✅ Require a pull request before merging
- ✅ Require status checks to pass (TypeCheck + Lint)
- ✅ Require branches to be up to date before merging
- ❌ Allow force pushes

---

## 8. Configuración de Vercel

### Vinculación Inicial

1. Ir a [vercel.com](https://vercel.com) → **Add New Project**
2. Seleccionar **Import Git Repository**
3. Conectar con GitHub y seleccionar `mi-proyecto`
4. Vercel detecta automáticamente Next.js

### Configuración del Proyecto en Vercel

| Campo | Valor |
|-------|-------|
| Framework Preset | `Next.js` |
| Root Directory | `./` (raíz del repo) |
| Build Command | `npm run build` |
| Output Directory | `.next` (automático) |
| Install Command | `npm install` |
| Node.js Version | `18.x` |

### Variables de Entorno en Vercel

En **Settings → Environment Variables**, agregar:

| Variable | Valor | Entorno |
|----------|-------|---------|
| `NEXT_PUBLIC_APP_NAME` | `MiProyecto` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

### URLs Automáticas

| Evento | URL Generada |
|--------|-------------|
| Push a `main` | `https://mi-proyecto.vercel.app` |
| Push a `develop` | `https://mi-proyecto-git-develop-usuario.vercel.app` |
| Pull Request | `https://mi-proyecto-git-pr-N-usuario.vercel.app` |

---

## 9. Implementación del Home — Hola Mundo

### `tsconfig.json` — Configuración TypeScript Estricta

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

### `src/app/globals.css` — Estilos con Efecto Elegante

```css
/* Reset y variables */
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

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes glowPulse {
  0%, 100% {
    text-shadow:
      0 0 20px rgba(108, 99, 255, 0.4),
      0 0 40px rgba(108, 99, 255, 0.2);
  }
  50% {
    text-shadow:
      0 0 40px rgba(108, 99, 255, 0.8),
      0 0 80px rgba(167, 139, 250, 0.4);
  }
}

@keyframes borderGlow {
  0%, 100% { border-color: rgba(108, 99, 255, 0.3); }
  50% { border-color: rgba(167, 139, 250, 0.8); }
}

/* Layout centrado */
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

/* Fondo con gradiente sutil */
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

/* Tarjeta principal */
.hero-card {
  text-align: center;
  padding: 3rem 4rem;
  border: 1px solid rgba(108, 99, 255, 0.3);
  border-radius: 1.5rem;
  background: rgba(18, 18, 26, 0.8);
  backdrop-filter: blur(20px);
  animation:
    fadeInUp 0.8s ease-out forwards,
    borderGlow 3s ease-in-out infinite;
  max-width: 600px;
  width: 100%;
}

/* Título principal */
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

/* Subtítulo */
.hero-subtitle {
  font-size: 1rem;
  color: var(--color-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  animation: fadeInUp 0.8s ease-out 0.3s both;
  margin-bottom: 2rem;
}

/* Badge TypeScript */
.ts-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: rgba(108, 99, 255, 0.15);
  border: 1px solid rgba(108, 99, 255, 0.4);
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

### `src/app/page.tsx` — Página Home

```typescript
import { getSiteConfig } from '@/lib/data';
import type { SiteConfig } from '@/lib/data';

export default function HomePage(): React.JSX.Element {
  // Lectura desde JSON — tipada con TypeScript
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

### `src/app/layout.tsx` — Layout Raíz

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

### `src/app/api/data/route.ts` — API Route de Validación

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

## 10. Pipeline CI/CD

### `.github/workflows/ci.yml`

```yaml
name: CI — TypeScript Validation

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  validate:
    name: TypeCheck & Lint
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript Check
        run: npm run typecheck

      - name: ESLint
        run: npm run lint

      - name: Build
        run: npm run build
```

### Flujo Completo de Deploy

```
Desarrollador hace push
         │
         ▼
GitHub Actions ejecuta CI
  ├── TypeScript Check (tsc --noEmit)
  ├── ESLint
  └── Build Test
         │
    ¿CI pasa? ──── No ──→ Notificación de error al developer
         │
        Sí
         │
         ▼
Vercel detecta push automáticamente
  ├── Si rama = main → Deploy a PRODUCCIÓN
  └── Si otra rama → Deploy a PREVIEW URL
         │
         ▼
Build en Vercel
  ├── npm install
  ├── npm run build
  └── Deploy a Edge Network
         │
         ▼
URL disponible públicamente
```

---

## 11. Convenciones y Estándares

### Nomenclatura de Archivos

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes React | PascalCase | `HolaMundo.tsx` |
| Pages (App Router) | lowercase | `page.tsx`, `layout.tsx` |
| Utilidades / lib | camelCase | `data.ts`, `helpers.ts` |
| Tipos | camelCase + `.types.ts` | `site.types.ts` |
| Archivos JSON | kebab-case | `site.json`, `page-content.json` |
| Estilos CSS | kebab-case (clases) | `.hero-card`, `.ts-badge` |

### Reglas TypeScript

```typescript
// ✅ Tipos explícitos en funciones
function getSiteConfig(): SiteConfig { ... }

// ✅ Interfaces para objetos de datos
interface SiteConfig { ... }

// ✅ No usar 'any' — usar generics o tipos específicos
function readJson<T>(file: string): T { ... }

// ❌ Evitar
const data: any = readJson('site.json');

// ✅ Preferir
const data: SiteConfig = readJson<SiteConfig>('site.json');
```

### Commits (Conventional Commits)

```
feat:     Nueva funcionalidad
fix:      Corrección de bug
data:     Cambios en archivos JSON (/data)
style:    Cambios visuales / CSS
refactor: Refactoring sin cambio funcional
docs:     Documentación
ci:       Cambios en CI/CD
```

Ejemplos:
```
feat: add home page with TypeScript validation
data: update site.json with initial content
fix: resolve type error in data access layer
ci: add typecheck step to GitHub Actions
```

---

## 12. Checklist de Validación

### ✅ Entorno Local

- [ ] Node.js >= 18.17.0 instalado
- [ ] `npm run dev` ejecuta sin errores
- [ ] `npm run typecheck` pasa sin errores TypeScript
- [ ] `npm run lint` pasa sin warnings
- [ ] `npm run build` completa exitosamente
- [ ] Home visible en `http://localhost:3000` con "Hola Mundo" centrado
- [ ] API accesible en `http://localhost:3000/api/data` devuelve JSON
- [ ] Efecto visual (fade-in + glow) funciona correctamente

### ✅ GitHub

- [ ] Repositorio creado y código pusheado
- [ ] Branch `main` protegida con reglas
- [ ] GitHub Actions workflow en `.github/workflows/ci.yml`
- [ ] CI pasa en el primer push
- [ ] `.env.local` está en `.gitignore` (no commiteado)
- [ ] Archivos JSON en `/data` presentes en el repo

### ✅ Vercel

- [ ] Proyecto conectado al repositorio GitHub
- [ ] Build exitoso en primer deploy
- [ ] URL de producción accesible
- [ ] Variables de entorno configuradas en Vercel Dashboard
- [ ] Preview URLs funcionan para PRs
- [ ] "Hola Mundo" visible en producción con efecto elegante

### ✅ TypeScript

- [ ] `strict: true` en `tsconfig.json`
- [ ] Sin uso de `any` en el código
- [ ] Tipos definidos para todos los JSON de `/data`
- [ ] API Route tipada correctamente
- [ ] Data Access Layer con generics tipados

---

## Resumen Ejecutivo

| Aspecto | Decisión |
|---------|----------|
| **Framework** | Next.js 14 con App Router |
| **Lenguaje** | TypeScript estricto (strict: true) |
| **"Base de datos"** | Archivos JSON en `/data`, leídos con `fs` |
| **Hosting** | Vercel (free tier suficiente para inicio) |
| **Repositorio** | GitHub con CI via GitHub Actions |
| **Deploy** | Automático: push a `main` → producción |
| **Primer entregable** | Home con "Hola Mundo", efecto fade-in + glow animado |
| **Validación TypeScript** | tsc + ESLint + build en cada push |

> **Tiempo estimado de setup inicial:** 30–60 minutos desde cero hasta ver "Hola Mundo" en producción en Vercel.

---

*Documento generado como plan de arquitectura. Versión 1.0.0*
