# Protocolo de auditoría integral

## 1. Alcance y fuentes de verdad

Clasificar: (a) documentación aprobada y vigente (visión, RF, RNF, criterios, UAT), (b) decisiones de arquitectura/migración, (c) implementación en snapshot real, (d) ejecución de pruebas y observabilidad, (e) aceptación documentada por responsables. Evitar atribuir a código una obligación no aprobada: código no es la fuente normativa de RF. Cuando las fuentes se contradicen, abrir hallazgo y no resolver silenciosamente.

Inventario de superficies: producto y core; módulos/submódulos; rutas de UI y navegación; API/DTO y consumidores; modelos/migraciones/constraints/transacciones; jobs y colas; identidad/roles/permisos; integraciones; importación/exportación; configuración y entornos; CI; pruebas/coverage; documentación; datos históricos; observabilidad/backup/restore; operación real.

**Trazabilidad mínima por RF:** `RF-ID | módulo/submódulo/ruta | texto vigente + versión | prioridad | aceptación | dependencias | frontend | backend/servicio | BD | roles | test/evidencia | estado | inconsistencias`.

Para RF no asociados al frontend (jobs, API-only, backend) registrar `N/A justificado`. No inventar endpoints ni pruebas. Diferenciar requisito completo, parcial, deshabilitado/flag, legado, no implementado, retirado autorizado y desconocido.

## 2. Método de comprobación

1. Descubrir repositorio completo; incluir workspaces, sub-repos documentados y ramas necesarias autorizadas. `rg` y búsquedas equivalentes, excluyendo dependencias, builds y binarios de forma justificada.
2. Consolidar el catálogo RF desde fuentes vigentes y módulos detectados. Marcar fuentes faltantes, versiones divergentes, RF sin ID, tickets sin vincular y funcionalidad sin documento (`RF-CANDIDATO`).
3. Seguir cada RF de extremo a extremo; enumerar escenarios positivos, negativos, permisos y errores. No confundir llamadas simuladas con integración real.
4. Verificar evidencia por capas y capturar su localizador preciso (`ruta + símbolo/línea`, comando + resultado, ID ticket/UAT, commit/fecha). Las pruebas ausentes o no ejecutadas no cuentan como verificadas.
5. Auditar efectos secundarios: abrir pantallas no debe modificar datos; guardado idempotente cuando aplica; integridad, concurrencia, liquidación exacta si hay cálculos, impuestos según régimen y moneda si están en alcance. Son **ejemplos a comprobar según los RF**, no requisitos universales.
6. Revisar histórico y control de cambios: versionado de esquemas, archivos huérfanos, respaldo, migraciones, compatibilidad, reversibilidad. No lanzar migraciones sin autorización.
7. Registrar severidad/impacto/acciones. Formular correcciones, pero **no implementar** salvo autorización explícita de implementación.

## 3. Información 'chatarra' e inconsistencias

Definir como candidato, nunca como eliminación automática:

- Documentación contradictoria: README anuncia terminado lo no implementado; RF estados incompatibles; versiones/URLs/ramas ya no vigentes; información sobre módulos inexistentes.
- Evidencia inválida: capturas sin escenario, reportes heredados de otra rama, tests ignorados, suites fallidas declaradas aprobadas, manuales obsoletos, porcentajes sin denominador.
- Ruido técnico: archivos duplicados, dumps/logs/builds accidentalmente versionados, importaciones sin uso demostrado, código muerto confirmado por análisis de referencias y puntos de entrada, rutas rota, TODO/FIXME de procesos críticos.
- Riesgos: secretos expuestos, scripts destructivos, documentación con datos sensibles, backups públicos, credenciales en historial, dependencias no mantenidas (verificación real requerida).

Cada candidato requiere ubicación, explicación, impacto y **certeza** `confirmado / probable / necesita verificación`; nunca llamar basura a un fichero solo porque parezca antiguo. No borrar, mover, ocultar o reescribir automáticamente.

## 4. Auditoría transversal de 16 fases (Plan Maestro suministrado)

| Fase | Control del hito | Evidencia orientativa |
|---|---|---|
| F00 Diagnóstico inicial | situación, viabilidad, restricciones | acta y análisis actual |
| F01 Negocio | procesos, actores, reglas | mapas y validaciones |
| F02 Ingeniería de requisitos | RF/RNF, trazabilidad y aceptación | catálogo versionado |
| F03 Planificación | MVP, roadmap, dependencias | backlog e hitos |
| F04 Arquitectura | límites, C4, ADR, integraciones | SAD/ADR |
| F05 Datos y contratos | esquema, migraciones, APIs | ERD/OpenAPI/migraciones |
| F06 UX/UI | flujos, responsive, accesibilidad | diseños + validación |
| F07 Entornos | Git, reproducibilidad, CI | pipeline configurado y ejecutado |
| F08 Core mínimo | identidad, permisos, errores, auditoría | código + tests |
| F09 Desarrollo modular | verticales funcionales | RF→tests→aceptación |
| F10 Integraciones | datos, informes, exportaciones, resiliencia | pruebas reales integradas |
| F11 QA/seguridad/rendimiento | regresión, seguridad, rendimiento | resultados medidos |
| F12 Staging/UAT/piloto | aceptación del negocio | acta, incidencias |
| F13 Infraestructura | redes, secretos, backup y restore | evidencia operativa |
| F14 Despliegue | pipeline y smoke/rollback | despliegue verificable |
| F15 Operación | monitoreo, alertas e incidentes | métricas y procedimientos |

Fases pueden ser `no_iniciada`, `en_progreso`, `evidenciada`, `bloqueada` o `no_verificable`. Una fase documentada no equivale a fase operativa. **No sumar las fases al score**: se reportan como un segundo eje.

## 5. Estructura de hallazgo

`ID | severidad BLOCKER/CRITICAL/HIGH/MEDIUM/LOW | módulo | RFs | descripción objetiva | evidencia | reproducción (si aplica) | efecto real | propuesta | estado | propietario si conocido`.

Prioridad de corrección: defectos que comprometen datos/dinero/seguridad → RF obligatorios/flujo principal → integraciones → QA/regresión → documentación → cosmética. Mantener separada severidad del código y del requisito.

## 6. Evidencia y límites

- `OBSERVADO`: código/archivo observado en snapshot; no demuestra ejecución.
- `PROBADO`: ejecución controlada con resultado registrado y cobertura relevante.
- `DOCUMENTADO`: consta en documento sin confirmación en runtime.
- `INFERIDO`: hipótesis justificable, nunca puntúa como probado.
- `NO VERIFICADO`: no se puede respaldar.

Si solo se recibió un plan genérico, **no es una auditoría de repositorio**. El Plan Maestro define el método, no aporta pruebas de que las fases estén cumplidas.
