# Resumen Fase 2 — Dashboard y Layout Mobile-First

## Objetivo
Construir la primera experiencia móvil de BusetaApp con navegación por rol, bottom navigation para 375px y la página de bootstrap admin.

## Qué se implementó
- `middleware.ts` para restricción de socio: role='socio' solo puede acceder a `/audit`, `/profile` y `/api/audit`; el resto redirige a `/audit`.
- `next.config.ts` actualizado para aplicar `Cache-Control: no-store` en todas las API routes.
- `lib/withAuth.ts` y `lib/withRole.ts` creados como utilidades de autorización reutilizables.
- `app/api/expenses/pending/route.ts` que retorna el conteo de gastos pendientes y permite el PendingBadge sin caché.
- Página de bootstrap admin en `/admin/db-setup` con texto claro sobre las 4 migrations y la carga inicial de seed.
- `app/(app)/layout.tsx` como layout autenticado que muestra el bottom nav mobile-first cuando el usuario está logueado.
- `components/BottomNav.tsx` con las tres versiones de navegación según rol:
  - Conductor: Turno, Gastos, Perfil.
  - Admin: Dashboard, Pendientes, Turnos, Configuración, Perfil.
  - Socio: Auditoría, Perfil.
- `components/PendingBadge.tsx` para mostrar un badge rojo con contador solo cuando `pendingCount > 0`.
- Páginas mobile-first de prueba para cada sección principal con botones de al menos 48px y diseño enfocado en 375px.
- `app/api/audit/route.ts` stub de auditoría accesible para socio.

## Verificaciones realizadas
- `npm run typecheck` — pasó sin errores.
- `npm run build` — compiló correctamente y generó las rutas principales:
  - `/`
  - `/dashboard`
  - `/pendientes`
  - `/turnos`
  - `/config`
  - `/profile`
  - `/audit`
  - `/turno`
  - `/gastos`
  - `/admin/db-setup`
  - `/api/expenses/pending`
  - `/api/admin/db-setup`
  - `/api/audit`
  - `/api/system/mode`

## Cómo probar
1. Abrir la app en 375px y verificar el bottom nav para cada rol.
2. Iniciar sesión y navegar según rol:
   - Conductor: `/turno`, `/gastos`, `/profile`
   - Admin: `/dashboard`, `/pendientes`, `/turnos`, `/config`, `/profile`
   - Socio: `/audit`, `/profile`
3. Confirmar que el socio es redirigido a `/audit` si intenta entrar a `/dashboard` u otra ruta privada.
4. Confirmar que `PendingBadge` no se renderiza cuando `/api/expenses/pending` devuelve `count: 0`.
5. Ver la página `/admin/db-setup` con el texto de migraciones y configuración inicial.

## Observaciones
- La navegación móvil se diseñó para reducir ruido y priorizar acciones críticas en 375px.
- Los botones principales en las pantallas tienen altura mínima de 48px.
- El admin puede acceder a la pantalla de bootstrap sin registro público ni acceso directo desde login.
