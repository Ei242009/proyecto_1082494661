# 🗄️ Capa de Datos JSON

Esta carpeta contiene los archivos JSON que actúan como la **"base de datos"** del proyecto.

## Filosofía de Diseño

En lugar de usar una base de datos relacional o NoSQL convencional, los datos están almacenados en archivos JSON versionados en Git. Esto permite:

- ✅ **Portabilidad**: Los datos viajan junto al código
- ✅ **Versionado**: Historial completo en Git
- ✅ **Tipado**: TypeScript valida la estructura en tiempo de compilación
- ✅ **Simplicidad**: Sin servidor de BD, sin migraciones complejas
- ✅ **Desarrollo local**: Acceso sin dependencias externas

## Archivos JSON Iniciales

### `config.json`
Configuración global de la aplicación.

**Estructura:**
```json
{
  "appName": "nombre de la aplicación",
  "version": "1.0.0",
  "locale": "es-CO",
  "theme": "dark"
}
```

**Propósito:** Contiene metadata y configuración de nivel de aplicación (idioma, tema, versión).

---

### `home.json`
Contenido específico de la página de inicio.

**Estructura:**
```json
{
  "hero": {
    "title": "título principal",
    "subtitle": "subtítulo",
    "description": "descripción",
    "animationStyle": "tipo de animación"
  },
  "meta": {
    "pageTitle": "título para metadatos",
    "description": "descripción para SEO"
  }
}
```

**Propósito:** Almacena contenido dinámico de la página home (hero section, metadatos).

---

## 🔒 Regla de Acceso: Solo desde Servidor

⚠️ **IMPORTANTE:** Los archivos JSON en `/data/` SOLO deben ser leídos desde el servidor (Backend):

- ✅ **Permitido:** API Routes (`/app/api/`), Server Components
- ✅ **Permitido:** Funciones de servidor (`getServerSideProps`, `getStaticProps`)
- ❌ **NO Permitido:** Client Components (React Frontend)
- ❌ **NO Permitido:** Navegador (acceso HTTP directo)

**Razón:** Proteger datos sensibles y mantener arquitectura limpia cliente-servidor.

---

## Data Access Layer

El acceso a estos datos JSON desde el código se hace a través de `lib/dataService.ts`, que proporciona funciones tipadas:

```typescript
import { readJsonFile } from '@/lib/dataService';
import type { AppConfig } from '@/types/config.types';
import type { HomeData } from '@/types/home.types';

// En un API Route o Server Component
const config = await readJsonFile<AppConfig>('config.json');
const homeData = await readJsonFile<HomeData>('home.json');
```

**Nunca importar ni parsear JSON directamente en Client Components.**

---

## 📋 Cómo Agregar Nuevos Archivos JSON

Cuando agregues una nueva entidad de datos:

1. **Crear el archivo JSON** en esta carpeta: `/data/nueva-entidad.json`
   ```json
   {
     "id": "1",
     "nombre": "ejemplo",
     "activo": true
   }
   ```

2. **Definir los tipos TypeScript** en `/types/`:
   ```typescript
   // /types/nueva-entidad.types.ts
   export interface NuevaEntidad {
     id: string;
     nombre: string;
     activo: boolean;
   }
   ```

3. **Crear funciones de acceso** en `/lib/dataService.ts`:
   ```typescript
   export async function getNuevaEntidad(): Promise<NuevaEntidad> {
     return readJsonFile<NuevaEntidad>('nueva-entidad.json');
   }
   ```

4. **Ejecutar validación:**
   ```bash
   npm run typecheck
   ```

5. **Commitear en Git:**
   ```bash
   git add data/ types/ lib/dataService.ts
   git commit -m "feat: add nueva entidad to data layer"
   ```

---

## Estructura Completa de Datos

```
data/
├── config.json       # Configuración global de la app
├── home.json         # Contenido de página home
└── README.md         # Este archivo
```

**Archivos esperados en futuras fases:**
- `products.json` — Catálogo de productos
- `users.json` — Perfil de usuarios
- `settings.json` — Configuración avanzada

---

## Tipado TypeScript

Los tipos para estas estructuras están definidos en la carpeta `types/`:
- `types/config.types.ts` — Tipos para `config.json`
- `types/home.types.ts` — Tipos para `home.json`

Todos los accesos desde `dataService.ts` usan tipos genéricos `<T>` para máxima seguridad.

---

## ⚙️ Lecturas de Archivos

### En Tiempo de Build (Static Generation)
Los JSON se leen al hacer `npm run build` para generar páginas estáticas.

### En Runtime (Server Components / API Routes)
Los JSON se leen en cada request (considera caché si es necesario).

---

**Última actualización:** 2026-04-09  
**Versión del plan:** 1.0.0

