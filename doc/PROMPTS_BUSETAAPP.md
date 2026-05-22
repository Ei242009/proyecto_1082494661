# PROMPTS DE IMPLEMENTACIÓN — BusetaApp
> Prompts secuenciales para construir el sistema fase por fase
> Plan de referencia: `doc/PLAN_BUSETAAPP.md`
> Estado de progreso: `doc/ESTADO_EJECUCION_BUSETAAPP.md`

---

## INSTRUCCIONES DE USO

1. Ejecuta primero el **Prompt 0** — crea el archivo de seguimiento del proyecto.
2. Para cada fase siguiente, copia el bloque completo y pégalo en tu sesión de IA.
3. La IA leerá el plan, ejecutará la fase y dejará el estado actualizado.
4. No avances a la siguiente fase hasta que el resumen esté generado y el estado marcado como completado.

---

## PROTOCOLO DE EJECUCIÓN — APLICA A TODOS LOS PROMPTS

```
ANTES de escribir código:
1. Leer doc/PLAN_BUSETAAPP.md
2. Leer doc/ESTADO_EJECUCION_BUSETAAPP.md
3. Verificar que las fases previas estén completadas
4. Registrar inicio: estado En progreso + fecha y hora

DESPUÉS de completar el trabajo:
5. Registrar cierre: estado Completada + fecha y hora
6. Documentar: acciones ejecutadas, archivos creados/modificados, observaciones
7. Crear doc/RESUMEN_FASE_N_NOMBRE.md con: objetivo, acciones, archivos,
   decisiones técnicas y por qué, problemas encontrados y resolución,
   qué se probó y resultado, estado final EXITOSO / CON OBSERVACIONES / FALLIDO,
   prerrequisitos para la siguiente fase

NUNCA avanzar sin completar este protocolo.
```

---

---

## PROMPT 0 — Crear archivo de estado del proyecto

```
Actúa como Ingeniero de Proyectos. Tu única tarea es leer
doc/PLAN_BUSETAAPP.md y crear el archivo
doc/ESTADO_EJECUCION_BUSETAAPP.md.

El archivo debe contener:
- Información del proyecto: nombre, archivos de referencia, estudiante,
  fecha de inicio, estado general
- Dashboard de fases: tabla con todas las fases del plan incluyendo número,
  nombre, rol asignado, estado (todas inician como Pendiente), columnas para
  fecha de inicio, fecha de cierre y archivo de resumen
- Leyenda de estados: Pendiente, En progreso, Completada, Bloqueada, Pausada
- Historial de ejecución: sección append-only con fecha, hora, fase, evento y detalle

Toma los datos directamente del plan. No inventes fases ni cambies nombres ni roles.

Cuando termines escribe en el chat el nombre de cada fase detectada y confirma
que el archivo está listo para comenzar la Fase 1.

Tu trabajo termina aquí.
```

---

---

## PROMPT FASE 1 — Bootstrap, Login y `dataService` base

### Rol: `Ingeniero Fullstack Senior — Arquitecto del sistema, auth y notificaciones`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
arquitectura de persistencia serverless, autenticación segura con JWT y
diseño de la primera experiencia visual de una aplicación financiera
móvil para el sector transporte informal.

Tu mentalidad: BusetaApp es la herramienta que reemplaza el cuaderno del
conductor. La usa desde el celular, en la calle, a las 6 de la mañana
antes de salir. La arquitectura tiene que ser sólida — si el turno del
día se pierde por un problema de caché o persistencia, el dinero del día
queda sin registrar. El login tiene que transmitir la identidad del negocio
de transporte colombiano: ámbar, naranja, la buseta.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_BUSETAAPP.md — secciones 8 (stack y variables de entorno —
   nota RESEND_API_KEY y RESEND_FROM_EMAIL), 9 (reglas de oro — especialmente
   reglas 2, 3 y 4 sobre cálculo en servidor, snapshot y turno cerrado),
   10 (estructura del seed.json con la daily_config por defecto), 11
   (estructura de lib/ y la firma de emailService), 18 (identidad visual
   del login — fondo ámbar oscuro, logo de buseta) y 20 (flujo de login y
   por qué el JWT SÍ incluye el rol en este proyecto)
2. doc/ESTADO_EJECUCION_BUSETAAPP.md — registra el inicio de la Fase 1

Puntos críticos que no puedes ignorar:

— A diferencia de AgroStock Pro, en BusetaApp el JWT SÍ incluye el rol:
  JWT({ userId, role, email }, '24h'). La razón es que aquí cada usuario
  tiene un rol fijo único — un conductor siempre es conductor, no puede
  ser admin en otro contexto. Esto simplifica la verificación de permisos.

— No hay registro público. El formulario de login no tiene link de
  "Crear cuenta". Los usuarios (conductor, socio) los crea únicamente
  la propietaria (admin) desde el panel.

— El seedReader expone también la daily_config del seed (tarifa $80.000
  y límite $200.000) para que en modo seed el sistema pueda mostrar esos
  valores en las pantallas que los necesitan antes del bootstrap.

— lib/emailService.ts tiene UNA función: sendPendingExpenseAlert. Recibe
  el email de la propietaria y los datos del gasto (conductor, categoría,
  monto, descripción). El asunto del email: "⚠️ Gasto pendiente de
  aprobación — [monto] COP". Esta función se llama automáticamente cuando
  un gasto supera el límite al registrarse.

— El token de Blob lazy, get() del SDK de Blob, withFileLock — patrón
  estándar del curso.

— La identidad visual del login no es opcional: fondo ámbar oscuro #78350F,
  tarjeta blanca con borde superior ámbar, logo SVG de buseta estilizada.
  Sección 18 del plan describe todo en detalle.

Al terminar:
- npm run typecheck — cero errores
- Probar: login admin del seed → cookie HttpOnly con role='admin' en el JWT
  → /api/system/mode retorna 'seed'
- Verificar que sendPendingExpenseAlert genera el correo en Resend (puede
  probarse con un email de prueba directo antes de tener el flujo completo)
- Registra el cierre en ESTADO_EJECUCION_BUSETAAPP.md
- Crea doc/RESUMEN_FASE_1_BOOTSTRAP.md

Tu trabajo termina aquí. No avances a la Fase 2.
```

---

---

## PROMPT FASE 2 — Dashboard, Layout Mobile-First y bootstrap

### Rol: `Diseñador Frontend Obsesivo + Ingeniero de Sistemas`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero de Sistemas
trabajando en conjunto. BusetaApp es una app Mobile-First. El conductor la
usa todo el día desde el celular — a las 6am para iniciar el turno, a mitad
del día para cargar un gasto, y en la noche para ver el comprobante. El
diseño mobile no es una adaptación del diseño de escritorio — es el diseño
principal.

Tu mentalidad: en una pantalla de 375px no hay espacio para elementos
decorativos. Cada píxel tiene que servir para algo. El bottom navigation
del conductor tiene exactamente lo que necesita: Turno, Gastos, Perfil.
Nada más.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_BUSETAAPP.md — sección 18 completa (filosofía Mobile-First,
   paleta de colores con los estados de gasto APROBADO/PENDIENTE/RECHAZADO,
   tipografía, componentes clave incluyendo PendingBadge), el bottom
   navigation por rol (sección 15), y la Fase 2 completa
2. doc/ESTADO_EJECUCION_BUSETAAPP.md — verifica Fase 1 completada,
   registra inicio de Fase 2

Puntos críticos que no puedes ignorar:

— El bottom navigation tiene tres versiones según el rol:
  Conductor: Turno (ícono de reloj), Gastos (ícono de recibo), Perfil.
  Admin: Dashboard (ícono de gráfica), Pendientes (ícono de campana +
  PendingBadge), Turnos (ícono de lista), Configuración (ícono de engranaje),
  Perfil.
  Socio: Auditoría (ícono de lupa), Perfil.
  Cada actor ve exactamente lo que necesita — sin más.

— El PendingBadge en el ícono de Pendientes del admin es un círculo rojo
  con el número de gastos pendientes. Si pendingCount = 0: el badge no
  aparece. Si > 0: badge rojo. El número viene de /api/expenses/pending
  con un count. Este dato no puede cachearse — los gastos se aprueban o
  llegan en cualquier momento.

— El middleware.ts debe manejar la restricción del socio explícitamente:
  Si el usuario tiene role='socio', solo puede acceder a /audit, /profile
  y /api/audit. Cualquier otra ruta privada → redirect a /audit.

— Los botones de acción principal en mobile tienen mínimo 48px de alto.
  Esta no es una recomendación — es un requisito de usabilidad para un
  conductor que usa la app con guantes o en movimiento.

— La página /admin/db-setup informa: "Aplicará 4 migrations y cargará:
  1 usuario admin y la configuración inicial ($80.000 tarifa / $200.000
  límite de gasto)."

Al terminar:
- Probar el bottom nav con los 3 roles en 375px
- Verificar que el socio no puede navegar a /dashboard (redirect a /audit)
- Verificar que el PendingBadge no aparece cuando no hay gastos pendientes
- Bootstrap completo: admin → db-setup → ejecutar → modo live
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_2_DASHBOARD.md

Tu trabajo termina aquí. No avances a la Fase 3.
```

---

---

## PROMPT FASE 3 — Configuración y Módulo de Turnos

### Rol: `Ingeniero Fullstack — Ciclo del turno diario y snapshot de tarifa`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en sistemas de
registro financiero diario, formularios móviles optimizados para entrada
numérica rápida y control de estado de registros con reglas de immutabilidad.

Tu mentalidad: el conductor tiene entre 30 segundos y 1 minuto para abrir
la app e iniciar el turno antes de salir. El formulario de inicio de turno
es el más usado del sistema y tiene que ser el más rápido: un campo de
número, el teclado numérico aparece solo, y el resultado se calcula en
tiempo real sin tocar nada más.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_BUSETAAPP.md — migrations 0002 y 0003 (daily_config y shifts),
   reglas RN-01 (snapshot de tarifa — crítico), RN-04 (turno cerrado
   inmutable), RN-07 (un turno por día), el componente StartShiftForm
   (sección 18), la lógica de createShift y el flujo de un día (sección 17)
2. doc/ESTADO_EJECUCION_BUSETAAPP.md — verifica Fases 1 y 2 completadas,
   registra inicio de Fase 3

Puntos críticos que no puedes ignorar:

— RN-01 — snapshot de tarifa: al crear un turno, el sistema hace:
  const config = await getDailyConfig();
  INSERT INTO shifts (... daily_fee_snapshot = config.daily_fee ...).
  El campo daily_fee_snapshot es readonly después de la creación. Si la
  propietaria cambia la tarifa a $90.000 hoy, los turnos ya creados hoy
  siguen con $80.000. Esta es la garantía financiera más importante del
  sistema — asegura que el conductor no puede ser cobrado retroactivamente.

— RN-07: UNIQUE(conductor_id, shift_date). Al capturar el error de Postgres
  por violación del UNIQUE, retornar 409 con el turno existente en la
  respuesta: { error: 'SHIFT_EXISTS', existingShift: { id, status } }. El
  frontend usa esa respuesta para redirigir al turno existente en lugar de
  mostrar un error genérico.

— El StartShiftForm muestra dos cosas que el conductor NO puede editar:
  (1) La tarifa diaria vigente: "Tarifa de hoy: $80.000". En color gris
  read-only para que quede claro que no es un campo editable.
  (2) La "Base post-tarifa" calculada en tiempo real: mientras el conductor
  escribe el IB, debajo aparece "$XXX.XXX - $80.000 = $XXX.XXX". Esto
  tranquiliza al conductor: ve exactamente cuánto queda después del pago
  de la tarifa antes de confirmar.

— El input del IB usa inputMode="decimal" (no type="number") para mostrar
  el teclado numérico en iOS/Android sin las flechas de incremento que
  confunden a usuarios no técnicos.

— La página de configuración /config tiene un input de tarifa y un input
  de límite de gasto. Al guardar, muestra el aviso: "Los cambios aplican
  solo a los nuevos turnos. Los turnos ya abiertos conservan la tarifa
  anterior." Verificar esto explícitamente en las pruebas.

— RN-04 en el servidor: en createShift y en cualquier endpoint de escritura
  sobre turnos, verificar `shift.status !== 'CERRADO'` antes de proceder.
  Si el turno está cerrado: retornar 409 con mensaje específico.

Al terminar:
- Probar el StartShiftForm: ingresar IB → ver el cálculo de base post-tarifa
  en tiempo real sin hacer submit
- Probar RN-01: cambiar la tarifa a $90.000 → crear un nuevo turno →
  verificar que daily_fee_snapshot es $90.000. Verificar que un turno
  creado ANTES del cambio sigue con la tarifa anterior.
- Probar RN-07: crear turno → intentar crear otro el mismo día para el
  mismo conductor → 409 con el turno existente (no un error genérico)
- Verificar que el conducor no puede ver turnos de otros conductores
  (probar directamente con el endpoint)
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_3_TURNOS.md

Tu trabajo termina aquí. No avances a la Fase 4.
```

---

---

## PROMPT FASE 4 — Gastos y Flujo de Aprobación

### Rol: `Ingeniero Fullstack — Estados de gastos, aprobación y alertas`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en flujos de
trabajo con aprobación, formularios móviles con retroalimentación visual
inmediata y notificaciones transaccionales por correo.

Tu mentalidad: el gasto es la operación más frecuente después de iniciar
el turno. El conductor lo hace 3-5 veces al día, siempre desde el celular.
El formulario tiene que ser instantáneo y el resultado visual tiene que
ser claro: verde = aprobado y listo, naranja = pendiente de aprobación
de la propietaria. El conductor no puede quedarse preguntándose "¿se
procesó mi gasto?".

Antes de escribir una sola línea de código lee:
1. doc/PLAN_BUSETAAPP.md — migration 0004 (expenses), reglas RN-02 al
   RN-06, la lógica de addExpense con el umbral de límite, el componente
   ExpenseForm con el aviso de PENDIENTE en tiempo real, PendingExpenseCard
   y el flujo de aprobación/rechazo (sección 17), y la Fase 4 completa
2. doc/ESTADO_EJECUCION_BUSETAAPP.md — verifica Fases 1 a 3 completadas,
   registra inicio de Fase 4

Puntos críticos que no puedes ignorar:

— addExpense en el dataService sigue esta secuencia:
  (1) Verificar que el turno existe y está ABIERTO (RN-04). Si CERRADO: 409.
  (2) Verificar que el conductor es el dueño del turno (RN-06). Si no: 403.
  (3) Obtener la daily_config vigente para el límite.
  (4) Si amount > config.expense_limit: status='PENDIENTE', llamar
      emailService.sendPendingExpenseAlert(adminEmail, datos).
  (5) Si amount <= config.expense_limit: status='APROBADO'.
  (6) INSERT en expenses.
  (7) recordAudit.
  El correo se envía sincrónicamente dentro del endpoint. Si Resend falla,
  el gasto se guarda de todas formas — no bloquear el gasto por un error
  de correo. Capturar el error de emailService silenciosamente y loguear.

— El ExpenseForm muestra el aviso de PENDIENTE en tiempo real mientras el
  conductor escribe el monto: si el valor en el input supera el límite
  configurado, aparece debajo del campo una advertencia naranja: "Este
  monto supera el límite de $200.000 y requerirá aprobación de la
  propietaria." El aviso aparece mientras escribe, antes de enviar. Esto
  prepara mentalmente al conductor para que no se sorprenda cuando vea
  el gasto en naranja.

— Al finalizar el submit del gasto: si fue APROBADO → toast verde
  "✓ Gasto registrado". Si fue PENDIENTE → toast ámbar "⏳ Gasto enviado
  a revisión. La propietaria debe aprobarlo." El conductor sabe exactamente
  qué pasó sin tener que revisar la lista.

— rejectExpense requiere un campo `reason` obligatorio (mínimo 5 caracteres).
  Este motivo se guarda en expenses.rejection_reason y el conductor puede
  verlo cuando consulta los gastos de su turno. El conductor tiene derecho
  a saber por qué le rechazaron un gasto.

— RN-03: los endpoints de aprobar y rechazar tienen withRole(['admin']).
  Un conductor que intente llamar directamente a /api/expenses/[id]/approve
  recibe 403.

— La página de gastos pendientes /expenses/pending solo muestra los gastos
  con status='PENDIENTE'. Ordenados por fecha ascendente (los más antiguos
  primero). Cada PendingExpenseCard muestra: nombre del conductor, categoría
  con ícono, monto en COP, descripción y cuánto tiempo lleva pendiente
  ("Hace 2 horas"). Los botones Aprobar y Rechazar son grandes (mobile-first)
  con colores inequívocos (verde y rojo).

Al terminar:
- Probar gasto dentro del límite: $150.000 → status APROBADO → toast verde
- Probar gasto sobre el límite: $250.000 → status PENDIENTE → toast ámbar
  → correo llega en Resend → aparece en /expenses/pending del admin
- Probar aprobación: admin aprueba el gasto → status APROBADO → el conductor
  ve el gasto en verde en su lista
- Probar rechazo: admin rechaza con motivo → el conductor ve el gasto en
  rojo con el motivo visible
- Probar RN-06: intentar agregar gasto al turno de otro conductor → 403
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_4_GASTOS.md

Tu trabajo termina aquí. No avances a la Fase 5.
```

---

---

## PROMPT FASE 5 — Cierre de Turno y Comprobante Digital

### Rol: `Ingeniero Fullstack — Liquidación, comprobante Mobile-First e impresión`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en flujos de
cierre financiero, cálculos de liquidación en el servidor y diseño de
documentos digitales optimizados para impresión desde dispositivos móviles.

Tu mentalidad: el comprobante de liquidación es el documento más importante
del sistema. Es lo que el conductor le muestra a la propietaria al final
del día para confirmar cuánto se lleva. Tiene que verse profesional en la
pantalla del celular, tiene que imprimirse bien, y tiene que ser correcto
— la fórmula no puede tener ningún error. La utilidad neta puede ser
negativa (si los gastos superaron la base post-tarifa) — eso es un dato
válido que el sistema tiene que mostrar claramente.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_BUSETAAPP.md — sección 13 completa (fórmula de liquidación,
   los dos estados del turno, comportamiento con gastos PENDIENTES al
   cerrar), lib/liquidationService.ts con las dos funciones, el componente
   LiquidationReceipt y la Fase 5 completa
2. doc/ESTADO_EJECUCION_BUSETAAPP.md — verifica Fases 1 a 4 completadas,
   registra inicio de Fase 5

Puntos críticos que no puedes ignorar:

— calculateNetIncome se ejecuta SIEMPRE en el servidor. El cliente nunca
  recibe la fórmula ni calcula el resultado final — recibe el objeto
  LiquidationResult ya calculado. Esta es la garantía de integridad
  financiera del sistema.

— El endpoint POST /api/shifts/[id]/close acepta un body opcional
  { force: boolean }. La secuencia de ejecución:
  (1) withRole(['admin']) — solo la propietaria puede cerrar.
  (2) Verificar que el turno está ABIERTO.
  (3) Contar gastos PENDIENTES del turno.
  (4) Si hay gastos PENDIENTES y force !== true: retornar 200 con
      { requiresConfirmation: true, pendingCount: N, pendingTotal: X }.
      NO cerrar el turno todavía.
  (5) Si force === true O no hay gastos PENDIENTES: ejecutar
      calculateNetIncome (que solo suma los APROBADOS), UPDATE shift
      status='CERRADO', cerrar, retornar el comprobante.
  El frontend maneja el caso (4) mostrando el modal de advertencia al admin.
  Si el admin confirma: hace la misma petición con { force: true }.

— LiquidationReceipt es un componente React para la pantalla. También es
  la vista que se imprime. El truco del `window.print()` requiere CSS de
  impresión: `@media print { .no-print { display: none; } }`. Los elementos
  que no deben imprimirse (sidebar, bottom nav, botón de imprimir) llevan
  la clase `no-print`.

— La estructura del comprobante:
  HEADER: Logo "BusetaApp", "Comprobante de Liquidación", fecha del turno.
  SECCIÓN CONDUCTOR: Nombre del conductor.
  TABLA DE ÍTEMS:
    → Ingreso Bruto                    +$450.000
    → (–) Tarifa Diaria                –$80.000
    → Base Post-Tarifa                  $370.000
    (línea separadora)
    → Combustible (09:30)              –$85.000
    → Reparación (14:15)               –$320.000
    (línea separadora)
    → UTILIDAD NETA                     –$35.000  ← en ROJO si negativa
  FOOTER: "Cerrado por: Bianeidis · 14/05/2026 07:45 PM"
  El formato de los montos siempre con signo (+/-), siempre COP sin decimales.

— La UN negativa es un resultado válido — no debe mostrarse como error ni
  ocultarse. Se muestra en rojo con el signo negativo visible. La propietaria
  y el conductor tienen que ver ese resultado con claridad.

— Una vez cerrado el turno, al acceder a /shift/[id] se muestra el
  comprobante directamente. El conductor puede acceder a este comprobante
  en cualquier momento posterior.

Al terminar:
- Probar cierre sin gastos pendientes: flujo directo, comprobante generado
- Probar cierre con gastos pendientes: primera petición retorna
  requiresConfirmation=true → modal muestra el aviso → admin confirma con
  force=true → se cierra excluyendo los pendientes
- Verificar UN negativa: crear turno con IB bajo y gastos altos → el
  comprobante muestra el resultado negativo en rojo correctamente
- Probar window.print() desde Chrome en Android: verificar que el comprobante
  se imprime sin el bottom nav ni los botones de la app
- Verificar RN-04: intentar agregar gasto a un turno ya cerrado → 409
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_5_LIQUIDACION.md

Tu trabajo termina aquí. No avances a la Fase 6.
```

---

---

## PROMPT FASE 6 — Reportes, Auditoría del Socio y Administración

### Rol: `Ingeniero Fullstack Senior + Diseñador Frontend — Reportes y acceso del socio`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior y Diseñador Frontend
trabajando en conjunto. Los reportes son el espejo financiero del negocio.
La propietaria los usa para decidir si la buseta está siendo rentable, si
los gastos están controlados, si la tarifa necesita revisión. El módulo
del socio es más sencillo — solo necesita confirmar que la tarifa se cobró.

Tu mentalidad: el reporte no debe mostrar datos de otros negocios ni calcular
cosas que el sistema no puede saber. La UN acumulada del mes puede ser
negativa — eso es información válida. No ocultar ni "mejorar" los datos.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_BUSETAAPP.md — la función getDashboardData con sus tres períodos
   (day/week/month), la función getAuditShifts y qué campos devuelve para
   el socio (fecha, IB, tarifa, estado — sin gastos operativos), regla RN-05
   (socio solo lectura), y la Fase 6 completa
2. doc/ESTADO_EJECUCION_BUSETAAPP.md — verifica Fases 1 a 5 completadas,
   registra inicio de Fase 6

Puntos críticos que no puedes ignorar:

— getDashboardData calcula para el período dado (hoy / esta semana / este
  mes): total IB de turnos cerrados, total tarifa cobrada, total gastos
  aprobados, UN neta acumulada, número de turnos cerrados, gastos actualmente
  pendientes. Las queries filtran por shift_date del período.

— getAuditShifts para el socio devuelve SOLO: fecha, conductor (nombre),
  gross_income, daily_fee_snapshot, status. NUNCA devuelve los gastos
  operativos — el socio no necesita esa información y darla sería exponer
  datos del negocio innecesariamente. El endpoint GET /api/audit verifica
  que el rol es 'admin' o 'socio' — no más roles.

— RN-05 en profundidad: el socio no puede hacer ninguna petición que no sea:
  GET /api/audit, GET /api/auth/me, POST /api/auth/logout,
  POST /api/auth/change-password. Cualquier otra petición retorna 403.
  Verificar esto probando directamente los endpoints con el JWT del socio.

— El dashboard financiero de la propietaria muestra los tres períodos como
  pestañas: "Hoy", "Esta semana", "Este mes". Al cambiar de pestaña, los
  KPIs se actualizan sin recargar la página (un fetch al cambiar la pestaña).
  Los valores de UN acumulada en rojo si son negativos, en verde si son
  positivos.

— Gestión de usuarios: el POST crea usuario con contraseña temporal
  (crypto.randomBytes 12 chars alfanuméricos), must_change_password=true,
  retorna la contraseña en claro una sola vez con modal de advertencia y
  botón "Copiar". En el login: si must_change_password=true, redirect a
  /profile para cambio obligatorio.

Al terminar:
- Crear turnos y gastos del día/semana → verificar que los KPIs del
  dashboard reflejan los totales correctamente
- Verificar que la suma de UN en el dashboard coincide con la suma
  manual de (IB - tarifa - gastos aprobados) de los turnos cerrados
- Probar la vista del socio: login como socio → solo ve /audit → intentar
  navegar a /dashboard → redirect a /audit → intentar GET /api/shifts/today
  → 403
- Crear un usuario conductor desde el panel → contraseña temporal visible
  una sola vez → conductor hace login → must_change_password → redirect a
  /profile para cambio → login con nueva contraseña
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_6_REPORTES.md

Tu trabajo termina aquí. No avances a la Fase 7.
```

---

---

## PROMPT FASE 7 — Pulido final y Deploy

### Rol: `Diseñador Frontend Obsesivo + Ingeniero Fullstack — Cierre del proyecto`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero Fullstack
trabajando en conjunto. Esta es la fase de cierre de BusetaApp.

Tu mentalidad: BusetaApp lo usa el conductor desde el celular, en la calle,
durante el turno. Si la app tiene un error confuso, un botón que no responde
en mobile, un comprobante que no se imprime bien, o un cálculo incorrecto,
se pierde la confianza en la herramienta y el conductor vuelve al cuaderno.
Esta fase termina cuando el flujo de un día completo funcione impecablemente
en un celular real.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_BUSETAAPP.md — Fase 7 completa, los requerimientos no funcionales
   RNF-01 al RNF-07 y las restricciones del sistema (sección 21)
2. doc/ESTADO_EJECUCION_BUSETAAPP.md — verifica Fases 1 a 6 completadas,
   registra inicio de Fase 7

Lo que debes completar en esta fase:

Empty states con mensajes prácticos y directos:
- Conductor sin turno de hoy: no mostrar una pantalla vacía — mostrar
  directamente el StartShiftForm con un texto de bienvenida: "Buenos días,
  Wilfrido. Ingresa el recaudo del turno de hoy para empezar."
- Admin sin gastos pendientes: "No hay gastos esperando aprobación. ✓"
  Mensaje positivo — cuando no hay pendientes es una buena noticia.
- Reportes sin datos para el período: "No hay turnos cerrados en este
  período. Los datos aparecen aquí cuando la propietaria cierra los turnos."
- Auditoría del socio sin turnos cerrados: "Aún no hay turnos cerrados
  para auditar en el período seleccionado."

Manejo de errores específicos del dominio:
- 409 SHIFT_EXISTS: "Ya tienes un turno abierto hoy." Con botón que navega
  al turno existente — no mostrar el error genérico de 409.
- 409 SHIFT_CLOSED en gasto: "Este turno ya fue cerrado. No puedes agregar
  más gastos." En naranja, no en rojo — es una restricción operativa,
  no un error del sistema.
- 403 en endpoints de aprobación para conductor: no mostrar este error
  al conductor (no debería llegar aquí desde la UI normal). Si llega:
  toast genérico.
- 401 (sesión expirada): toast + redirect a /login.

Verificación del flujo completo en un celular real (375px):
Abrir Chrome en un dispositivo Android o usar DevTools con emulación de
375px y conexión 4G-throttled:
1. Login como conductor → pantalla de inicio de turno → ingresar IB
   → ver el cálculo en tiempo real → confirmar.
2. Agregar gasto dentro del límite → toast verde.
3. Agregar gasto sobre el límite → toast ámbar → gasto PENDIENTE.
4. Login como admin en otra pestaña → ver el badge PENDIENTE → aprobar
   el gasto.
5. Volver a la cuenta del conductor → el gasto ahora aparece verde.
6. Admin cierra el turno → ver el modal de confirmación si no hay pendientes
   → confirmar cierre.
7. Conductor ve el comprobante → botón Imprimir → verificar que se imprime
   correctamente sin elementos de navegación.
8. Login como socio → ver el turno en auditoría con la tarifa descontada.

Verificar los montos en formato COP en toda la interfaz: sin decimales,
con separador de miles (punto), con símbolo $. Ni un solo monto sin formato
en ninguna pantalla.

Para el cierre técnico:
- npm run typecheck — cero errores
- npm run lint — cero warnings
- npm run build — build exitoso
- Verificar que ningún componente cliente importa módulos de lib/ directamente
- Deploy en Vercel con todas las variables de entorno:
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN,
  JWT_SECRET, ADMIN_BOOTSTRAP_SECRET, RESEND_API_KEY, RESEND_FROM_EMAIL

Al cerrar el proyecto:
- Registra la Fase 7 como Completada en ESTADO_EJECUCION_BUSETAAPP.md
  con la URL de producción en el historial
- Crea doc/RESUMEN_FASE_7_PULIDO_FINAL.md con: URL de producción, URL del
  repositorio, funcionalidades implementadas, stack (incluyendo Resend),
  tablas de Supabase creadas, decisiones técnicas destacadas (snapshot de
  tarifa, cálculo de UN en servidor, cierre con fuerza para gastos pendientes,
  comprobante con window.print, JWT con rol) y estado final del proyecto

El proyecto BusetaApp está terminado. Tu trabajo en este repositorio
concluye aquí.
```

---

> Eider Barreto — Doc: 1082494661
> Curso: Lógica y Programación — SIST0200
