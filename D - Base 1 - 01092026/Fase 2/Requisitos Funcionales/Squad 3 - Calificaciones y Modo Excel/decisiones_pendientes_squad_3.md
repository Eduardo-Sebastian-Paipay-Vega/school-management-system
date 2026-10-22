# Decisiones pendientes — Squad 3: Calificaciones y Modo Excel (M8)

**Para:** Coordinación Académica y Dirección General · **Preparado por:** Claude Code (skill `make-rf`) a pedido del líder de proyecto · **Fecha:** 2026-10-22
**Fuente:** sección 6.4 «Decisiones pendientes» de las 15 fichas RF v2.0 del Squad 3 (RF-36 a RF-46 y RF-79 a RF-82).

## Resumen

Al reescribir las 15 fichas se cruzaron cuatro fuentes: la ficha anterior (v1) y su caso de uso, el SDD del Squad 3, los contratos de API y el código implementado en `backend/squad_3_calificaciones/`. Donde no coinciden, la ficha no eligió una opción: registró la pregunta. Este documento reúne esas **59 preguntas** (58 temas: RF-37 DP-01 y RF-46 DP-04 son la misma) y las ordena por quién debe responderlas.

| Responsable | Temas | Sección |
| --- | ---: | --- |
| Dirección General | 5 | [A](#a-dirección-general) |
| Coordinación Académica | 30 | [B](#b-coordinación-académica) |
| Líder de proyecto | 2 | [C](#c-líder-de-proyecto) |
| Equipos técnicos (Squad 3, con Squad 1 y Squad 2) | 21 | [D](#d-equipos-técnicos-anexo) |
| **Total** | **58** | |

Las secciones A, B y C son las que necesitan una respuesta de negocio. La sección D se incluye para que la reunión conozca su alcance, pero la resuelven los equipos técnicos una vez decididas A y B.

**Cómo usar este documento:** para cada tema, anote la opción elegida en la columna «Decisión» con fecha y responsable. Con esa respuesta, el Squad 3 actualiza la ficha, quita el pendiente y alinea el caso de uso, el SDD y el código.

### Temas prioritarios

Estos bloquean la implementación o pueden producir notas incorrectas. Conviene resolverlos primero:

1. **B-11 a B-16 — Plazos, cierre y bloqueo.** Hoy el código bloquea la edición en cuanto vence la fecha límite, pero RF-81 envía avisos después de esa fecha para que el docente complete el registro: tal como está, el docente no podría hacerlo.
2. **B-01 a B-03 — Escala y valor de las notas.** Decimales, umbrales y valor de cada letra definen todas las notas guardadas.
3. **B-17 a B-20 — Comportamiento ante errores en carga masiva.** Determina si una carga con errores guarda parcialmente o nada.
4. **A-01 y A-03 — Quién cierra el periodo y quién aprueba rectificaciones.** Definen los permisos.

---

## A. Dirección General

| ID | Ficha | Pregunta | Opciones según las fuentes | Impacto | Decisión |
| --- | --- | --- | --- | --- | --- |
| A-01 | [RF-42](RF-42.md) DP-02 | ¿Quién ejecuta el cierre oficial del periodo? | a) Dirección y Subdirección (CU-NOT-07) · b) Coordinación y Dirección (tabla maestra, RF-42 v1, SDD y código actual) | Permisos del cierre | |
| A-02 | [RF-42](RF-42.md) DP-03 | ¿En qué consiste la confirmación reforzada del cierre? | a) Reingresar la contraseña (CU-NOT-07) · b) Segundo factor · c) Solo doble confirmación en pantalla (hoy no existe ninguna) | Seguridad del cierre; requiere trabajo del Squad 1 | |
| A-03 | [RF-43](RF-43.md) DP-01 | ¿Quién decide las rectificaciones de notas cerradas? | a) Solo Dirección (SRS y código actual) · b) Subdirección (RF-43 v1) · c) También Coordinación (actor de RF-43 v1) | Permisos de rectificación | |
| A-04 | [RF-43](RF-43.md) DP-02 | ¿El sistema guarda el archivo de sustento o solo su referencia? | a) Solo la referencia al expediente custodiado por Secretaría (SDD, contratos y código) · b) Adjuntar el archivo (RF-43 v1) | Si es (b), hace falta almacenamiento de archivos | |
| A-05 | [RF-43](RF-43.md) DP-05 | ¿La «firma electrónica» del directivo debe ser una firma digital PKI? | a) Confirmación electrónica ligada a la sesión, sin PKI (SDD) · b) Firma digital con certificado | Validez legal frente a costo e infraestructura | |

**Además:** las 15 fichas quedan en estado «Propuesto». Falta designar a la persona que las aprueba (campo «Responsable de negocio») para pasarlas a «Aprobado».

---

## B. Coordinación Académica

### B.1 Escala y valor de las notas

| ID | Ficha | Pregunta | Opciones según las fuentes | Impacto | Decisión |
| --- | --- | --- | --- | --- | --- |
| B-01 | [RF-37](RF-37.md) DP-01 · [RF-46](RF-46.md) DP-04 | ¿Cuántos decimales admite una nota? | a) Enteros o un decimal (RF-37 v1, RN-NOT-03) · b) Hasta dos decimales (contratos y código actual) | Validación de toda nota ingresada | |
| B-02 | [RF-46](RF-46.md) DP-01 | ¿Qué umbrales separan AD, A, B y C cuando hay decimales (p. ej., 17,5)? | a) 18 / 14 / 11 sobre enteros (RF-46 v1) · b) 17,5 / 13,5 / 10,5 (ejemplo de contratos y escala de prueba) · c) Los que configure la institución en RF-13 | Literal de cada nota en libretas y SIAGIE | |
| B-03 | [RF-46](RF-46.md) DP-02 | Si el docente escribe una letra, ¿qué valor numérico se le asigna? | a) 19 / 15 / 12 / 8 (código actual) · b) Valor mediano del rango: 19 / 15,5 / 12 / 5 (RF-46 v1) | Promedios y cuadro de mérito | |
| B-04 | [RF-36](RF-36.md) DP-05 | ¿El docente elige la escala en cada evaluación? | a) No: la escala la fija la institución para toda la planilla (código) · b) Sí, vigesimal o literal por evaluación (RF-36 v1) | Estructura de la planilla | |

### B.2 Cálculo de promedios

| ID | Ficha | Pregunta | Opciones según las fuentes | Impacto | Decisión |
| --- | --- | --- | --- | --- | --- |
| B-05 | [RF-36](RF-36.md) DP-01 | ¿Los pesos de las evaluaciones deben sumar 100 %? | a) No, son relativos (código actual) · b) Sí, validar la suma (RF-36 v1) | Configuración de evaluaciones | |
| B-06 | [RF-41](RF-41.md) DP-01 | En primaria, si dos niveles empatan, ¿cuál prevalece? | a) El del último logro evaluado (SDD, pendiente de ratificar) · b) Otra regla | Nivel de periodo en primaria | |
| B-07 | [RF-41](RF-41.md) DP-02 | ¿Qué se muestra cuando a un estudiante le faltan notas? | a) Promedio vacío (código) · b) Estado «En Proceso» (RF-41 v1; se confunde con el nivel B) · c) Otra etiqueta, p. ej. «Incompleto» | Lectura de la planilla y libretas | |
| B-08 | [RF-41](RF-41.md) DP-04 | ¿Cómo se obtiene el nivel del área a partir de sus competencias? | Sin definir: el código calcula por competencia y por planilla, no por área | Libreta (RF-59) | |

### B.3 Plazos, cierre y bloqueo *(prioritario)*

| ID | Ficha | Pregunta | Opciones según las fuentes | Impacto | Decisión |
| --- | --- | --- | --- | --- | --- |
| B-09 | [RF-42](RF-42.md) DP-01 | ¿Con qué completitud se puede cerrar un periodo? | a) 100 % de notas registradas y aprobadas (SDD y código) · b) Hasta 10 % sin registrar, con justificación (RF-42 v1 y CU-NOT-07) | Cierre de periodo | |
| B-10 | [RF-42](RF-42.md) DP-04 | ¿Vencida la fecha límite, se bloquea la edición aunque nadie haya ejecutado el cierre? | a) Sí (SDD y código actual) · b) No, el bloqueo ocurre solo al cerrar (RF-42 v1 y CU) | Se relaciona con B-11 | |
| B-11 | [RF-81](RF-81.md) DP-01 | Si la edición se bloquea al vencer el plazo, ¿cómo completa el docente su registro tras el aviso de incumplimiento? | a) Separar «plazo de registro» de «bloqueo» · b) Mantener el bloqueo y usar rectificación (RF-43) · c) Coordinación reabre temporalmente | Hoy RF-81 y RF-42 son incompatibles | |
| B-12 | [RF-81](RF-81.md) DP-03 | ¿El avance de registro cuenta notas registradas o también aprobadas? | a) Registradas (RF-81 v1) · b) Aprobadas (coherente con el cierre de RF-42) | Alertas a docentes | |
| B-13 | [RF-42](RF-42.md) DP-07 | ¿El cierre debe generar o disparar la consolidación de actas? | a) No, las actas son RF-62 · b) Sí, como parte del cierre (RF-42 v1 y CU) | Alcance del cierre | |
| B-14 | [RF-42](RF-42.md) DP-08 | ¿Existe un estado «En revisión» antes del cierre? | a) No: estados PLANIFICADO, EN_CURSO, CERRADO (RF-11) · b) Sí (RF-42 v1 y CU-NOT-07) | Modelo de periodos; requiere al Squad 1 | |

### B.4 Errores en carga masiva y pérdida de datos

| ID | Ficha | Pregunta | Opciones según las fuentes | Impacto | Decisión |
| --- | --- | --- | --- | --- | --- |
| B-15 | [RF-38](RF-38.md) DP-01 | Al pegar desde Excel un bloque con celdas inválidas, ¿qué pasa? | a) Se rechaza todo el bloque (SDD) · b) Se aplican las válidas y se señalan las inválidas (RF-38 v1) | Comportamiento de la planilla | |
| B-16 | [RF-80](RF-80.md) DP-01 | Al importar un archivo Excel con notas inválidas, ¿qué pasa? | a) Se aplican las válidas y se listan las rechazadas (RF-80 v1 y contratos) · b) Todo o nada, como el lote de RF-37 | Coherencia con B-15 | |
| B-17 | [RF-80](RF-80.md) DP-03 | ¿Los practicantes pueden importar notas desde Excel como borrador? | Sin definir | Alcance de RF-80 | |
| B-18 | [RF-45](RF-45.md) DP-01 | ¿Se exige guardar sin conexión (IndexedDB) para no perder notas al cerrar el navegador? | a) No: reintentos mientras la página esté abierta (SDD) · b) Sí, «cero pérdida» (RF-45 v1) | Si es (b), trabajo adicional relevante en el frontend | |

### B.5 Practicantes

| ID | Ficha | Pregunta | Opciones según las fuentes | Impacto | Decisión |
| --- | --- | --- | --- | --- | --- |
| B-19 | [RF-40](RF-40.md) DP-01 | ¿El titular aprueba los borradores todos juntos o por celda / evaluación? | a) Todos a la vez (código) · b) Por celda o evaluación (RF-40 v1) | Flujo de revisión | |
| B-20 | [RF-40](RF-40.md) DP-03 | ¿Aprobar los borradores implica publicarlos? | a) No, son pasos separados (contratos y código) · b) Sí, «Aprobar y Publicar» (RF-40 v1) | Visibilidad para estudiantes | |
| B-21 | [RF-40](RF-40.md) DP-04 | ¿El practicante debe pulsar «Enviar para revisión»? | a) No, el borrador queda pendiente al guardarlo (código) · b) Sí (RF-40 v1) | Flujo del practicante | |

### B.6 Conclusiones descriptivas

| ID | Ficha | Pregunta | Opciones según las fuentes | Impacto | Decisión |
| --- | --- | --- | --- | --- | --- |
| B-22 | [RF-39](RF-39.md) DP-01 | ¿Quién aporta y valida el banco de conclusiones sugeridas? ¿Debe ser oficial del MINEDU? | Sin fuente oficial: el SDD aclara que las sugerencias actuales son de demostración | Contenido pedagógico | |
| B-23 | [RF-39](RF-39.md) DP-02 | ¿La conclusión es por estudiante y periodo, o por estudiante y competencia? | a) Por estudiante en la planilla (código) · b) Por competencia (RF-39 v1) | Libretas y modelo de datos | |

### B.7 Evaluaciones y actividades

| ID | Ficha | Pregunta | Opciones según las fuentes | Impacto | Decisión |
| --- | --- | --- | --- | --- | --- |
| B-24 | [RF-36](RF-36.md) DP-02 | ¿Se ofrece copiar la estructura de evaluaciones del bimestre anterior? | Sí (RF-36 v1) / No (no figura en SDD ni código) | Alcance de RF-36 | |
| B-25 | [RF-36](RF-36.md) DP-03 | ¿Se pueden editar o eliminar evaluaciones que ya tienen notas? | Sin definir para RF-36 (RN-NOT-17 solo cubre actividades de RF-79) | Integridad de notas | |
| B-26 | [RF-79](RF-79.md) DP-03 | ¿La advertencia de «más de dos el mismo día» aplica solo a exámenes? ¿El límite es fijo o configurable? | RN-NOT-15 menciona exámenes; el límite no está definido como configurable | Calendario | |

### B.8 Roles y visibilidad

| ID | Ficha | Pregunta | Opciones según las fuentes | Impacto | Decisión |
| --- | --- | --- | --- | --- | --- |
| B-27 | [RF-44](RF-44.md) DP-01 | ¿Los padres consultan notas por RF-44 o solo por RF-82? | a) Solo por RF-82 (código: RF-44 es solo para estudiantes) · b) También por RF-44 (tabla maestra y RF-44 v1) | Alcance de RF-44 | |
| B-28 | [RF-44](RF-44.md) DP-02 | ¿Qué son las «recomendaciones para mejorar» que ve el estudiante? | Sin dato ni contrato que las represente | Contenido de la consulta | |
| B-29 | [RF-45](RF-45.md) DP-02 | ¿Coordinación puede editar notas? | a) No, solo docente y practicante (código) · b) Sí (actor de RF-45 v1) | Permisos | |
| B-30 | [RF-82](RF-82.md) DP-01 | Si una nota está en rectificación, ¿qué ve el apoderado? | a) La nota publicada vigente hasta la aprobación (RF-43) · b) Se oculta (RF-82 v1) | Consulta del apoderado | |

---

## C. Líder de proyecto

| ID | Ficha | Pregunta | Opciones según las fuentes | Impacto | Decisión |
| --- | --- | --- | --- | --- | --- |
| C-01 | [RF-42](RF-42.md) DP-05 | ¿Qué rama de trabajo usa el Squad 3? | `feature/squad-3/gradebook-excel` (fichas v1) · `feature/squad-3/grades-engine` (CU) · trabajo directo en `dev` (AGENTS.md §4) | Documentación de trazabilidad | |
| C-02 | [RF-44](RF-44.md) DP-03 | ¿Se requiere app móvil o basta la web responsiva / PWA? | «Web y móvil» (RF-44 v1) · PWA (RNF-19) | Alcance del frontend | |

---

## D. Equipos técnicos (anexo)

No requieren decisión de Coordinación ni Dirección. Varias dependen de lo que se decida en A y B.

| ID | Ficha | Pregunta | Responsable |
| --- | --- | --- | --- |
| D-01 | [RF-36](RF-36.md) DP-04 | Endpoint oficial de evaluaciones (`/evaluation-criteria` del SRS frente a `/grades/actions`) | Squad 3 |
| D-02 | [RF-37](RF-37.md) DP-02 | Aceptar los códigos nuevos RN-NOT-24 y RN-NOT-25 | Squad 3 |
| D-03 | [RF-37](RF-37.md) DP-03 | Qué significa «tiempo real» (WebSocket de una instancia más refresco cada 10 s; Redis no integrado) | Squad 3 |
| D-04 | [RF-37](RF-37.md) DP-04 | Endpoint oficial de registro (`batch-upsert` frente a `PATCH /batch`) | Squad 3 |
| D-05 | [RF-38](RF-38.md) DP-02 | Metas de rendimiento vinculantes de la planilla y método de medición | Squad 3 |
| D-06 | [RF-38](RF-38.md) DP-03 | Alcance de la tecla Esc | Squad 3 |
| D-07 | [RF-39](RF-39.md) DP-03 | Endpoint del banco de conclusiones | Squad 3 y Squad 1 |
| D-08 | [RF-39](RF-39.md) DP-04 | Atajo Ctrl+Espacio del asistente | Squad 3 |
| D-09 | [RF-40](RF-40.md) DP-02 | Notificación al titular de borradores pendientes | Squad 3 |
| D-10 | [RF-40](RF-40.md) DP-05 | Quién asigna practicantes a la planilla (titular o proveedor de Squad 2) | Squad 2 y Squad 3 |
| D-11 | [RF-41](RF-41.md) DP-03 | Persistir promedios en tabla o calcularlos al leer | Squad 3 |
| D-12 | [RF-42](RF-42.md) DP-06 | Endpoint oficial del cierre (`/academic-periods/:id/close` frente a `/grades/actions`) | Squad 3 y Squad 1 |
| D-13 | [RF-43](RF-43.md) DP-03 | Notificaciones de solicitud y decisión de rectificación | Squad 3 |
| D-14 | [RF-43](RF-43.md) DP-04 | Endpoint oficial de rectificaciones | Squad 3 |
| D-15 | [RF-45](RF-45.md) DP-03 | Duración de la marca visual de guardado | Squad 3 |
| D-16 | [RF-46](RF-46.md) DP-03 | Aceptar el código nuevo RN-NOT-26 | Squad 3 |
| D-17 | [RF-79](RF-79.md) DP-01 | Peso como fracción (0,30) o relativo (0–100) | Squad 3 |
| D-18 | [RF-79](RF-79.md) DP-02 | Cómo se integran las actividades con la planilla agregada | Squad 3 |
| D-19 | [RF-80](RF-80.md) DP-02 | Tamaño máximo de archivo y filas en la importación | Squad 3 |
| D-20 | [RF-81](RF-81.md) DP-02 | Si el plazo de RF-81, la fecha límite de RF-11 y el `deadline` de la planilla son el mismo dato | Squad 1 y Squad 3 |
| D-21 | [RF-82](RF-82.md) DP-02 | Rol y claims del apoderado ante el servicio de Squad 3 | Squad 1 y Squad 3 |

---

## Registro de la reunión

| Campo | Valor |
| --- | --- |
| Fecha | |
| Asistentes | |
| Temas resueltos | |
| Temas aplazados y nueva fecha | |
| Responsable de actualizar las fichas | |
