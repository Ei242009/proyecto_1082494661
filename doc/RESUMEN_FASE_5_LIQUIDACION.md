# RESUMEN FASE 5 — Cierre de Turno y Comprobante Digital

## Objetivo
Implementar el cierre financiero del turno con cálculo de utilidades en el servidor y generar un comprobante digital optimizado para impresión desde dispositivos móviles.

## Qué se implementó
- `lib/liquidationService.ts` con:
  - `calculateNetIncome(shiftId)` — realiza el cálculo completo en servidor y solo usa gastos aprobados.
  - `buildReceipt(shiftId)` — construye el objeto del comprobante con conductor, gastos aprobados, base post-tarifa y metadatos de cierre.
- `lib/dataService.ts` extendido con `closeShift(shiftId, adminId, force)`:
  - valida que el turno exista y esté `ABIERTO`.
  - cuenta los gastos `PENDIENTE` del turno.
  - si hay pendientes y `force !== true`, retorna `{ requiresConfirmation: true, pendingCount, pendingTotal }`.
  - si `force === true` o no hay pendientes: cierra el turno (`status = 'CERRADO'`, `closed_by`, `closed_at`) y retorna el comprobante.
- Endpoint `POST /api/shifts/[id]/close` con autorización `withRole(['admin'])`.
- `app/(app)/shift/[id]/page.tsx`:
  - si el turno está cerrado, muestra el comprobante directamente.
  - si el turno está abierto y el usuario es admin, muestra el panel de cierre con modal de confirmación.
  - si el turno está abierto y el usuario es conductor, muestra el resumen parcial del turno.
- `components/shift/LiquidationReceipt.tsx`:
  - comprobante con header, conductor, tabla de ítems y footer.
  - `UTILIDAD NETA` en rojo cuando es negativa.
  - botón `Imprimir comprobante` que ejecuta `window.print()`.
  - el botón y elementos no imprimibles tienen la clase `no-print`.
- `components/shift/CloseShiftPanel.tsx`:
  - flujo de cierre con primera petición de confirmación y segunda petición `force=true`.
  - muestra advertencia de pendientes y total pendiente.
- `app/globals.css` actualizado con `@media print { .no-print { display: none } }`.

## Pruebas realizadas
- Cierre de turno sin pendientes: flujo directo y generación de comprobante.
- Cierre de turno con pendientes: petición inicial retorna `requiresConfirmation=true`; al confirmar con `force=true` se cierra y se excluyen los pendientes.
- Utilidad Neta negativa puede mostrarse en rojo y con signo negativo en el comprobante.
- `window.print()` preparado para Chrome Android con elementos `no-print` ocultos.
- Verificación de `409` al intentar agregar gasto a un turno ya cerrado (desde `/api/shift/[id]/expenses`).
- `npm run typecheck` ejecutado sin errores.

## Resultados
- El cálculo de liquidación se realiza siempre en el servidor y el cliente recibe solo el objeto final del comprobante.
- El comprobante digital es legible en móvil y está preparado para impresión sin controles de interfaz.
- El flujo de cierre respeta la regla de negocio: pendientes generan advertencia, pero el admin puede cerrar forzando la exclusión.

## Estado actual
- Fase 5 en progreso: cierre y comprobante implementados.
- No se avanza a Fase 6.
