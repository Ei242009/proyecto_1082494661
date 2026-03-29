# 📋 Prompts de Ejecución — Plan de Implementación

> **Instrucciones de uso:**
> - Ejecuta los prompts en orden secuencial.
> - Antes de cada prompt, asegúrate de tener abiertos: `plan.md`, `plan_implementacion.md` y `estado_ejecucion.md`.
> - Copia y pega el prompt completo en una nueva conversación con Claude.
> - Cada prompt ya incluye las instrucciones para actualizar el estado de ejecución al inicio y al cierre.

---

---

# 🔵 FASE 1 — Análisis y Arquitectura

---

## Prompt F1-P1 — Levantamiento de requerimientos y arquitectura

```
🎯 ROL: Actúa como Ingeniero Fullstack Senior con experiencia en arquitectura de software, 
análisis de requerimientos y diseño de sistemas escalables.

📂 LECTURA OBLIGATORIA ANTES DE COMENZAR:
Lee y analiza en su totalidad los siguientes documentos:
1. `plan.md` — Documento maestro del plan del proyecto
2. `plan_implementacion.md` — Plan de implementación detallado
3. `estado_ejecucion.md` — Estado actual de ejecución

📌 REGISTRO DE INICIO:
Al comenzar, actualiza el archivo `estado_ejecucion.md` añadiendo la siguiente entrada 
en el Historial de Ejecución bajo FASE 1:

[HH:MM] INICIO — Prompt F1-P1: Levantamiento de requerimientos
         Ejecutado por: Ingeniero Fullstack Senior
         Descripción: Inicio del análisis de requerimientos y definición de arquitectura base

🛠️ TAREA:
Con base en los documentos leídos:
1. Lista y valida todos los requerimientos funcionales y no funcionales del proyecto.
2. Define la arquitectura del sistema (diagrama de componentes, capas, servicios).
3. Identifica las tecnologías a utilizar con justificación.
4. Detecta dependencias críticas y posibles riesgos técnicos.
5. Define el modelo de datos inicial (entidades principales y relaciones).
6. Documenta las decisiones de arquitectura tomadas (ADRs básicos).

📤 ENTREGABLES:
- Documento de requerimientos validados
- Diagrama de arquitectura (en texto/mermaid)
- Stack tecnológico definido y justificado
- Modelo de datos inicial
- Lista de riesgos identificados

📌 REGISTRO DE CIERRE:
Al finalizar, actualiza `estado_ejecucion.md` añadiendo:

[HH:MM] FIN — Prompt F1-P1: Levantamiento de requerimientos
         Resultado: [Describe detalladamente qué se hizo y qué decisiones se tomaron]
         Artefactos generados: [Lista cada archivo o entregable creado]
         Observaciones: [Riesgos, bloqueos, o notas para la siguiente fase]

Actualiza también la tabla de resumen de fases: Fase 1 → 🔄 En progreso

🗂️ CIERRE DE FASE:
Al completar TODOS los prompts de la Fase 1, genera el archivo `resumen_fase1_analisis.md` 
con el siguiente contenido:
- Objetivo de la fase
- Tareas realizadas (con descripción de cada una)
- Decisiones tomadas y su justificación
- Artefactos generados
- Problemas encontrados y cómo se resolvieron
- Estado final: ✅ Completado
- Fecha de inicio y fin de la fase

Luego actualiza en `estado_ejecucion.md`:
- Fase 1 → ✅ Completado
- Registra el archivo resumen_fase1_analisis.md en la tabla de archivos generados
```

---

---

# 🟣 FASE 2 — Diseño UX/UI

---

## Prompt F2-P1 — Investigación de usuarios y flujos

```
🎯 ROL: Actúa como Diseñador UX/UI Senior con experiencia en investigación de usuarios, 
arquitectura de información y diseño de experiencias digitales centradas en el usuario.

📂 LECTURA OBLIGATORIA ANTES DE COMENZAR:
Lee y analiza en su totalidad los siguientes documentos:
1. `plan.md` — Documento maestro del plan del proyecto
2. `plan_implementacion.md` — Plan de implementación detallado
3. `estado_ejecucion.md` — Estado actual de ejecución
   (Presta especial atención a los entregables y decisiones de la Fase 1)

📌 REGISTRO DE INICIO:
Al comenzar, actualiza `estado_ejecucion.md` añadiendo en el Historial bajo FASE 2:

[HH:MM] INICIO — Prompt F2-P1: Investigación de usuarios y flujos
         Ejecutado por: Diseñador UX/UI Senior
         Descripción: Inicio de investigación de usuarios, definición de personas y flujos principales

🛠️ TAREA:
Con base en los documentos leídos:
1. Define los perfiles de usuario (User Personas) del sistema.
2. Mapea los flujos de usuario principales (User Flows) para cada persona.
3. Define la arquitectura de información del sistema (mapa del sitio / estructura de navegación).
4. Lista los principios de diseño que guiarán la interfaz.
5. Identifica los componentes de UI críticos que deben diseñarse.

📤 ENTREGABLES:
- Documento de User Personas
- User Flows por cada persona (en texto o diagrama mermaid)
- Mapa de sitio / arquitectura de información
- Principios de diseño definidos
- Lista de componentes UI prioritarios

📌 REGISTRO DE CIERRE:
Al finalizar, actualiza `estado_ejecucion.md`:

[HH:MM] FIN — Prompt F2-P1: Investigación de usuarios y flujos
         Resultado: [Descripción detallada]
         Artefactos generados: [Lista de entregables]
         Observaciones: [Notas para el siguiente prompt]
```

---

## Prompt F2-P2 — Wireframes y sistema de diseño

```
🎯 ROL: Actúa como Diseñador UX/UI Senior especializado en sistemas de diseño, 
wireframing y prototipado de interfaces digitales.

📂 LECTURA OBLIGATORIA ANTES DE COMENZAR:
Lee y analiza en su totalidad los siguientes documentos:
1. `plan.md`
2. `plan_implementacion.md`
3. `estado_ejecucion.md`
   (Revisa los entregables del Prompt F2-P1 antes de continuar)

📌 REGISTRO DE INICIO:
Actualiza `estado_ejecucion.md`:

[HH:MM] INICIO — Prompt F2-P2: Wireframes y sistema de diseño
         Ejecutado por: Diseñador UX/UI Senior
         Descripción: Creación de wireframes de pantallas principales y definición del sistema de diseño

🛠️ TAREA:
1. Diseña los wireframes de las pantallas principales (en texto estructurado o ASCII art descriptivo).
2. Define el sistema de diseño: paleta de colores, tipografía, espaciado, iconografía.
3. Establece los componentes reutilizables (botones, formularios, cards, navegación).
4. Define los estados de cada componente (default, hover, active, disabled, error).
5. Documenta las guías de accesibilidad a respetar.

📤 ENTREGABLES:
- Wireframes de pantallas principales
- Sistema de diseño documentado
- Guía de componentes UI
- Guía de accesibilidad

📌 REGISTRO DE CIERRE:
Actualiza `estado_ejecucion.md`:

[HH:MM] FIN — Prompt F2-P2: Wireframes y sistema de diseño
         Resultado: [Descripción detallada]
         Artefactos generados: [Lista de entregables]
         Observaciones: [Notas para la Fase 3]

🗂️ CIERRE DE FASE:
Al completar este prompt (último de la Fase 2), genera `resumen_fase2_disenio.md` con:
- Objetivo de la fase
- Tareas realizadas
- Decisiones de diseño tomadas y justificación
- Artefactos generados
- Problemas encontrados y soluciones
- Estado final: ✅ Completado
- Fecha de inicio y fin

Actualiza en `estado_ejecucion.md`:
- Fase 2 → ✅ Completado
- Registra resumen_fase2_disenio.md en la tabla de archivos generados
```

---

---

# 🟢 FASE 3 — Desarrollo Frontend

---

## Prompt F3-P1 — Estructura base y configuración del proyecto

```
🎯 ROL: Actúa como Ingeniero Fullstack Senior especializado en desarrollo frontend, 
con experiencia en React/Next.js (o el framework definido en la arquitectura), 
buenas prácticas de código limpio y arquitectura de componentes.

📂 LECTURA OBLIGATORIA ANTES DE COMENZAR:
Lee y analiza en su totalidad:
1. `plan.md`
2. `plan_implementacion.md`
3. `estado_ejecucion.md`
   (Revisa decisiones de arquitectura de Fase 1 y sistema de diseño de Fase 2)

📌 REGISTRO DE INICIO:
Actualiza `estado_ejecucion.md`:

[HH:MM] INICIO — Prompt F3-P1: Estructura base del proyecto frontend
         Ejecutado por: Ingeniero Fullstack Senior
         Descripción: Configuración inicial del proyecto frontend, estructura de carpetas y dependencias

🛠️ TAREA:
1. Define y documenta la estructura de carpetas del proyecto frontend.
2. Lista todas las dependencias necesarias con sus versiones.
3. Configura el sistema de rutas principal.
4. Implementa la estructura base de componentes según el sistema de diseño de la Fase 2.
5. Configura el manejo de estado global (si aplica).
6. Configura las variables de entorno necesarias.
7. Establece las convenciones de código (naming, estructura de componentes, etc.).

📤 ENTREGABLES:
- Estructura de carpetas documentada
- package.json con dependencias
- Configuración de rutas
- Componentes base implementados
- Configuración de estado global
- Archivo .env.example documentado
- Guía de convenciones de código

📌 REGISTRO DE CIERRE:
Actualiza `estado_ejecucion.md`:

[HH:MM] FIN — Prompt F3-P1: Estructura base del proyecto frontend
         Resultado: [Descripción detallada]
         Artefactos generados: [Lista de archivos creados]
         Observaciones: [Notas para el siguiente prompt]
```

---

## Prompt F3-P2 — Implementación de pantallas y componentes

```
🎯 ROL: Actúa como Ingeniero Fullstack Senior especializado en desarrollo frontend, 
con dominio en la implementación de interfaces de usuario, consumo de APIs y 
optimización de rendimiento.

📂 LECTURA OBLIGATORIA ANTES DE COMENZAR:
Lee y analiza en su totalidad:
1. `plan.md`
2. `plan_implementacion.md`
3. `estado_ejecucion.md`
   (Revisa la estructura base creada en F3-P1 y los wireframes de Fase 2)

📌 REGISTRO DE INICIO:
Actualiza `estado_ejecucion.md`:

[HH:MM] INICIO — Prompt F3-P2: Implementación de pantallas y componentes
         Ejecutado por: Ingeniero Fullstack Senior
         Descripción: Desarrollo de pantallas principales y componentes de UI según diseño

🛠️ TAREA:
1. Implementa cada pantalla principal identificada en el diseño.
2. Crea los componentes reutilizables del sistema de diseño.
3. Implementa la navegación entre pantallas.
4. Conecta los componentes con el estado global o local según corresponda.
5. Implementa los formularios con validaciones.
6. Asegura la responsividad de cada pantalla.
7. Aplica las guías de accesibilidad definidas.

📤 ENTREGABLES:
- Código de cada pantalla implementada
- Biblioteca de componentes reutilizables
- Sistema de navegación funcional
- Formularios con validación
- Checklist de responsividad y accesibilidad

📌 REGISTRO DE CIERRE:
Actualiza `estado_ejecucion.md`:

[HH:MM] FIN — Prompt F3-P2: Implementación de pantallas y componentes
         Resultado: [Descripción detallada]
         Artefactos generados: [Lista de archivos creados]
         Observaciones: [Notas para el siguiente prompt]

🗂️ CIERRE DE FASE:
Al completar este prompt (último de la Fase 3), genera `resumen_fase3_frontend.md` con:
- Objetivo de la fase
- Pantallas y componentes implementados
- Decisiones técnicas tomadas
- Artefactos generados
- Problemas encontrados y soluciones
- Estado final: ✅ Completado
- Fecha de inicio y fin

Actualiza en `estado_ejecucion.md`:
- Fase 3 → ✅ Completado
- Registra resumen_fase3_frontend.md en la tabla de archivos generados
```

---

---

# 🟡 FASE 4 — Desarrollo Backend

---

## Prompt F4-P1 — Configuración del servidor y base de datos

```
🎯 ROL: Actúa como Ingeniero Fullstack Senior especializado en desarrollo backend, 
arquitectura de APIs REST/GraphQL, diseño de bases de datos y seguridad de aplicaciones.

📂 LECTURA OBLIGATORIA ANTES DE COMENZAR:
Lee y analiza en su totalidad:
1. `plan.md`
2. `plan_implementacion.md`
3. `estado_ejecucion.md`
   (Revisa el modelo de datos de Fase 1 y los entregables del frontend de Fase 3)

📌 REGISTRO DE INICIO:
Actualiza `estado_ejecucion.md`:

[HH:MM] INICIO — Prompt F4-P1: Configuración del servidor y base de datos
         Ejecutado por: Ingeniero Fullstack Senior
         Descripción: Configuración del servidor backend, base de datos y estructura de la API

🛠️ TAREA:
1. Configura el servidor backend (estructura de carpetas, middlewares, configuración base).
2. Implementa el esquema de base de datos según el modelo de datos de la Fase 1.
3. Configura las migraciones de base de datos.
4. Implementa la autenticación y autorización (JWT, OAuth, etc.).
5. Define y documenta los endpoints de la API (contrato de API).
6. Configura la conexión entre el backend y la base de datos.
7. Implementa el manejo de errores y logging.

📤 ENTREGABLES:
- Estructura del proyecto backend
- Esquema de base de datos implementado
- Scripts de migración
- Sistema de autenticación
- Documentación de la API (endpoints, métodos, payloads)
- Configuración de logging y manejo de errores

📌 REGISTRO DE CIERRE:
Actualiza `estado_ejecucion.md`:

[HH:MM] FIN — Prompt F4-P1: Configuración del servidor y base de datos
         Resultado: [Descripción detallada]
         Artefactos generados: [Lista de archivos creados]
         Observaciones: [Notas para el siguiente prompt]
```

---

## Prompt F4-P2 — Implementación de lógica de negocio y endpoints

```
🎯 ROL: Actúa como Ingeniero Fullstack Senior especializado en desarrollo backend, 
lógica de negocio compleja, optimización de consultas y patrones de diseño de software.

📂 LECTURA OBLIGATORIA ANTES DE COMENZAR:
Lee y analiza en su totalidad:
1. `plan.md`
2. `plan_implementacion.md`
3. `estado_ejecucion.md`
   (Revisa la configuración del backend de F4-P1 y el contrato de API definido)

📌 REGISTRO DE INICIO:
Actualiza `estado_ejecucion.md`:

[HH:MM] INICIO — Prompt F4-P2: Implementación de lógica de negocio y endpoints
         Ejecutado por: Ingeniero Fullstack Senior
         Descripción: Desarrollo de la lógica de negocio, servicios y endpoints de la API

🛠️ TAREA:
1. Implementa cada endpoint definido en el contrato de API.
2. Desarrolla la capa de servicios con la lógica de negocio.
3. Implementa los repositorios para acceso a datos.
4. Agrega validaciones de datos en cada endpoint.
5. Implementa las reglas de negocio críticas identificadas en la Fase 1.
6. Optimiza las consultas a base de datos.
7. Implementa caché donde sea necesario.

📤 ENTREGABLES:
- Endpoints implementados y funcionando
- Capa de servicios completa
- Validaciones implementadas
- Optimizaciones de consultas documentadas
- Colección de pruebas de API (Postman/Insomnia collection)

📌 REGISTRO DE CIERRE:
Actualiza `estado_ejecucion.md`:

[HH:MM] FIN — Prompt F4-P2: Implementación de lógica de negocio y endpoints
         Resultado: [Descripción detallada]
         Artefactos generados: [Lista de archivos creados]
         Observaciones: [Notas para la Fase 5]

🗂️ CIERRE DE FASE:
Al completar este prompt (último de la Fase 4), genera `resumen_fase4_backend.md` con:
- Objetivo de la fase
- Endpoints implementados (tabla con método, ruta, descripción)
- Decisiones técnicas tomadas
- Artefactos generados
- Problemas encontrados y soluciones
- Estado final: ✅ Completado
- Fecha de inicio y fin

Actualiza en `estado_ejecucion.md`:
- Fase 4 → ✅ Completado
- Registra resumen_fase4_backend.md en la tabla de archivos generados
```

---

---

# 🟠 FASE 5 — Integración y Pruebas

---

## Prompt F5-P1 — Integración frontend-backend y pruebas

```
🎯 ROL: Actúa como Ingeniero Fullstack Senior con experiencia en integración de sistemas, 
QA, pruebas automatizadas y resolución de problemas de integración entre capas.

📂 LECTURA OBLIGATORIA ANTES DE COMENZAR:
Lee y analiza en su totalidad:
1. `plan.md`
2. `plan_implementacion.md`
3. `estado_ejecucion.md`
   (Revisa todos los entregables de las Fases 1 a 4 antes de comenzar)

📌 REGISTRO DE INICIO:
Actualiza `estado_ejecucion.md`:

[HH:MM] INICIO — Prompt F5-P1: Integración y pruebas
         Ejecutado por: Ingeniero Fullstack Senior
         Descripción: Integración del frontend con el backend y ejecución del plan de pruebas

🛠️ TAREA:
1. Conecta el frontend con los endpoints del backend.
2. Implementa el manejo de errores de API en el frontend.
3. Implementa las pruebas unitarias de los módulos críticos.
4. Ejecuta pruebas de integración end-to-end.
5. Realiza pruebas de rendimiento básicas.
6. Documenta los bugs encontrados y su resolución.
7. Valida que todos los flujos de usuario funcionan correctamente.
8. Realiza pruebas de seguridad básicas (OWASP Top 10).

📤 ENTREGABLES:
- Sistema integrado y funcionando
- Suite de pruebas unitarias
- Resultados de pruebas de integración
- Reporte de bugs encontrados y resueltos
- Reporte de rendimiento
- Checklist de seguridad

📌 REGISTRO DE CIERRE:
Actualiza `estado_ejecucion.md`:

[HH:MM] FIN — Prompt F5-P1: Integración y pruebas
         Resultado: [Descripción detallada]
         Artefactos generados: [Lista de entregables]
         Observaciones: [Notas para la Fase 6]

🗂️ CIERRE DE FASE:
Al completar este prompt (último de la Fase 5), genera `resumen_fase5_pruebas.md` con:
- Objetivo de la fase
- Pruebas realizadas y resultados
- Bugs encontrados y resueltos
- Métricas de rendimiento
- Estado de seguridad
- Estado final: ✅ Completado
- Fecha de inicio y fin

Actualiza en `estado_ejecucion.md`:
- Fase 5 → ✅ Completado
- Registra resumen_fase5_pruebas.md en la tabla de archivos generados
```

---

---

# 🔴 FASE 6 — Despliegue y Cierre

---

## Prompt F6-P1 — Despliegue en producción y documentación final

```
🎯 ROL: Actúa como Ingeniero Fullstack Senior con experiencia en DevOps, 
despliegue de aplicaciones en la nube, CI/CD, monitoreo y documentación técnica.

📂 LECTURA OBLIGATORIA ANTES DE COMENZAR:
Lee y analiza en su totalidad:
1. `plan.md`
2. `plan_implementacion.md`
3. `estado_ejecucion.md`
   (Revisa todos los entregables y el estado actual antes de proceder al despliegue)

📌 REGISTRO DE INICIO:
Actualiza `estado_ejecucion.md`:

[HH:MM] INICIO — Prompt F6-P1: Despliegue en producción y documentación final
         Ejecutado por: Ingeniero Fullstack Senior
         Descripción: Despliegue del sistema en el ambiente de producción y generación de documentación final

🛠️ TAREA:
1. Prepara el ambiente de producción (variables de entorno, configuraciones).
2. Configura el pipeline de CI/CD.
3. Despliega el backend en producción.
4. Despliega el frontend en producción.
5. Configura el dominio, SSL y CDN si aplica.
6. Implementa monitoreo y alertas básicas.
7. Realiza las pruebas de humo (smoke tests) en producción.
8. Genera la documentación técnica final del sistema.
9. Crea el manual de operación y mantenimiento.

📤 ENTREGABLES:
- Sistema desplegado en producción
- Pipeline CI/CD configurado
- Configuración de monitoreo
- Resultados de smoke tests
- Documentación técnica final
- Manual de operación y mantenimiento
- URLs de producción documentadas

📌 REGISTRO DE CIERRE:
Actualiza `estado_ejecucion.md`:

[HH:MM] FIN — Prompt F6-P1: Despliegue en producción y documentación final
         Resultado: [Descripción detallada]
         Artefactos generados: [Lista de entregables]
         Observaciones: [Notas finales del proyecto]

🗂️ CIERRE DE FASE Y PROYECTO:
Al completar este prompt, genera `resumen_fase6_despliegue.md` con:
- Objetivo de la fase
- Pasos de despliegue realizados
- URLs y accesos del sistema en producción
- Configuraciones de infraestructura
- Estado del monitoreo
- Resultados de smoke tests
- Estado final: ✅ Completado
- Fecha de inicio y fin

Actualiza en `estado_ejecucion.md`:
- Fase 6 → ✅ Completado
- Estado global → ✅ PROYECTO COMPLETADO
- Registra resumen_fase6_despliegue.md en la tabla de archivos generados

🏁 CIERRE FINAL DEL PROYECTO:
Actualiza la tabla de resumen en `estado_ejecucion.md` marcando todas las fases como ✅ Completado
y cambia el estado global a: ✅ PROYECTO COMPLETADO — [Fecha y hora de cierre]
```

---

---

## 📌 Convenciones para actualizar `estado_ejecucion.md`

| Acción | Qué hacer |
|---|---|
| **Inicio de prompt** | Agregar entrada `[HH:MM] INICIO` en el historial |
| **Fin de prompt** | Agregar entrada `[HH:MM] FIN` con resultado y artefactos |
| **Bloqueo** | Agregar en tabla de bloqueos con descripción y prioridad |
| **Cierre de fase** | Actualizar tabla de fases + generar archivo resumen independiente |
| **Fin del proyecto** | Actualizar estado global a ✅ COMPLETADO |

---

## 📂 Archivos de referencia obligatoria en cada prompt

Todos los prompts leen estos tres archivos al inicio:

```
📄 plan.md                    → Plan maestro del proyecto
📄 plan_implementacion.md     → Plan de implementación detallado  
📄 estado_ejecucion.md        → Estado actual e historial de ejecución
```

---

*Versión 1.0 — Generado automáticamente. Adaptar las fases y tareas según el plan real del proyecto.*
