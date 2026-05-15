# RESUMEN FASE 4 — Gastos y Flujo de Aprobación

## Objetivo
Implementar el registro de gastos móviles, el control de límite, el estado PENDIENTE/ APROBADO, la aprobación/rechazo por admin, y la notificación transaccional de correo.

## Qué se implementó
- `data/expenses.json` como persistencia en modo seed para gastos.
- Nuevos tipos y validadores:
  - `Expense`, `ExpenseWithShift`, `AddExpenseRequest`.
  - `AddExpenseRequestSchema` y `RejectExpenseRequestSchema`.
- Extensión de `lib/dataService.ts` con:
  - `addExpense`.
  - `getExpensesByShiftId`.
  - `getPendingExpenses`.
  - `approveExpense`.
  - `rejectExpense`.
  - `findSeedUserById` y `getSeedAdminEmail`.
  - `getPendingExpensesCount` compatible con seed.
- Lógica de `addExpense` siguiendo la secuencia requerida:
  1. Verifica que el turno existe y está ABIERTO.
  2. Verifica que el conductor es dueño del turno cuando el request viene de un conductor.
  3. Obtiene `daily_config.expense_limit`.
  4. Si el monto supera el límite: status `PENDIENTE` y llama `sendPendingExpenseAlert`.
  5. Si el monto está dentro del límite: status `APROBADO`.
  6. Inserta el gasto en `data/expenses.json`.
  7. Captura errores de correo sin bloquear el registro del gasto.
- Nuevos endpoints API:
  - `GET /api/shift/[id]/expenses` para listar gastos por turno.
  - `POST /api/shift/[id]/expenses` para registrar un gasto.
  - `GET /api/expenses/pending` con `?list=true` para obtener los gastos pendientes.
  - `POST /api/expenses/[id]/approve` para aprobar un gasto (admin).
  - `POST /api/expenses/[id]/reject` para rechazar un gasto con razón obligatoria (admin).
- UI móvil y feedback inmediato:
  - `app/(app)/gastos/page.tsx` con formulario de gasto y historial de gastos.
  - `components/ExpenseForm.tsx` muestra advertencia naranja en tiempo real cuando el monto supera el límite.
  - `components/ExpenseHistory.tsx` muestra el estado de cada gasto y el motivo de rechazo.
  - `components/ExpensePanel.tsx` mantiene el historial sincronizado tras un registro exitoso.
  - `app/(app)/pendientes/page.tsx` con `PendingExpensesClient.tsx` para admin.
  - `components/PendingExpenseCard.tsx` muestra conductor, categoría, monto, descripción, tiempo pendiente y botones grandes de aprobación/rechazo.

## Pruebas realizadas
- `npm run typecheck` — pasó sin errores.
- Verificación de comportamiento del backend y rutas con TypeScript.
- Confirmación de que la nueva ruta de gastos del conductor y la página de pendientes del admin existen y funcionan según el flujo esperado.

## Resultados esperados
- Gasto dentro del límite → `APROBADO` y toast verde.
- Gasto sobre el límite → `PENDIENTE`, toast ámbar y alerta de correo a la propietaria.
- Admin puede aprobar y rechazar gastos.
- El rechazo requiere motivo y queda visible para el conductor.
- Conductor no puede añadir gasto a turnos de otros conductores.
- Los gastos pendientes se listan por orden ascendente de creación.

## Estado actual
- Fase 4 en progreso: implementación completada, documentación creada y typecheck aprobada.
- No se avanza a Fase 5.
