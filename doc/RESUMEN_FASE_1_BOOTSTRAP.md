# Resumen Fase 1 — Bootstrap y Login

## Objetivo
Implementar la base de la autenticación y el primer modo seed de BusetaApp, garantizando una arquitectura segura con JWT, un login mobile-first con identidad visual de buseta y el primer servicio de notificación por correo.

## Qué se implementó
- `data/seed.json` con la propietaria admin y la configuración diaria inicial (tarifa $80.000, límite $200.000).
- `lib/dataService.ts` extendido para leer datos del seed y exponer `findSeedUserByEmail`, `readSeedDailyConfig` y `getSystemMode`.
- `lib/auth.ts` para crear JWT con `{ userId, role, email }` y expiración de 24h usando `jose`.
- `app/api/auth/login/route.ts` que valida credenciales de seed con `bcryptjs`, firma el JWT y devuelve cookie `HttpOnly` `buseta_session`.
- `app/api/system/mode/route.ts` que retorna `{ mode: 'seed' }` cuando el sistema se ejecuta con seed.
- `lib/emailService.ts` con la función `sendPendingExpenseAlert(ownerEmail, expense)` que envía el correo a Resend con el asunto `⚠️ Gasto pendiente de aprobación — [monto] COP`.
- `app/api/test/pending-expense/route.ts` para probar envío de alerta de gasto pendiente en desarrollo.
- `app/page.tsx` reemplazado por el login móvil con fondo ámbar oscuro, tarjeta blanca con borde superior ámbar y logo SVG de buseta.
- `app/layout.tsx` metadata actualizada para BusetaApp.

## Verificaciones realizadas
- `npm run typecheck` pasó sin errores.
- `npm run build` completó satisfactoriamente y generó las rutas:
  - `/`
  - `/api/auth/login`
  - `/api/auth/logout`
  - `/api/system/mode`
  - `/api/test/pending-expense`
- `app/api/system/mode` está preparado para retornar `seed` en modo seed.

## Cómo probar
1. Ingresar con el admin del seed:
   - Correo: `propietaria@busetaapp.app`
   - Contraseña: `admin123`
2. Verificar que la respuesta de `/api/auth/login` retorna `success: true` y que la cookie `buseta_session` se envía como HttpOnly.
3. Consultar `/api/system/mode` y validar que el resultado es `{ mode: 'seed' }`.
4. Probar el correo de alerta de gasto pendiente en desarrollo con:
   - `/api/test/pending-expense?email=tu-email@dominio.com`

## Observaciones
- No se agregó registro público ni panel de creación de usuarios; se respeta la regla del proyecto.
- El JWT incluye el rol directamente en su payload para mantener el diseño de permisos fijo del conductor/admin/socio.
- El endpoint de prueba de Resend permite verificar el flujo de correo antes de completar el módulo de gastos.
