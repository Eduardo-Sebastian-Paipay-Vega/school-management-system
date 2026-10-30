# Acta de cierre formal del Sprint 2 — Core y seguridad

**Estado:** preparada para decisión del consejo de diseño; sin firmas registradas. **Corte de evidencia:** 2026-10-30. **PR:** [#2](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/pull/2), borrador hacia `dev`, sin solicitudes de revisión. Este documento no certifica aceptación ni despliegue.

## Alcance sometido a decisión

El consejo revisa el paquete técnico de S2 descrito en [resultados](SPRINT_02_RESULTADOS.md): contrato OpenAPI modular del Core (46 rutas, 57 operaciones), tipos generados, catálogo de errores, transición de JWT a `tenant_id`, rechazo de cabecera discordante y pruebas A/B con PostgreSQL 16 y Redis 7. El [CI de la implementación S2](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/41134309876) pasó los seis jobs técnicos. El despliegue sigue limitado al piloto Guamán Poma de Ayala.

La decisión formal necesaria para publicar S2-03/04 es aceptar [ADR-002](../../D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/ADR/ADR-002-tipo-tenant-id.md) y [ADR-005](../../D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/ADR/ADR-005-contratos-api.md), o registrar enmiendas concretas y volver a revisar el diff. El índice ADR exige las firmas de los cinco líderes para pasar de `Propuesto` a `Aceptado`. Una aprobación de CI, un agente o el autor del PR no sustituye esas firmas.

## Decisiones que deben quedar expresas

1. **Tenant y sesión (ADR-002):** institución = tenant UUID, sede = unidad interna; el tenant autenticado procede del JWT/sesión, nunca de `X-Tenant-ID`; cabecera discordante devuelve 403 `TENANT_MISMATCH`.
2. **Transición JWT:** emisor usa `tenant_id`; la lectura legada de `tenantId` requiere `JWT_LEGACY_TENANT_ACCEPT_UNTIL` fijado en UTC y no supera siete días. Sin configuración, el legado se rechaza.
3. **Contrato y errores (ADR-005):** `openapi.yaml` es la fuente del Core; `core.yaml` queda como instantánea histórica. Se aceptan los códigos y sobre de [la tabla de transición](SPRINT_02_TRANSICION_CONTRATOS.md), y se registra si los consumidores requieren un periodo de convivencia o una versión `/api/v2`.
4. **Límite de aceptación:** las 113 advertencias Redocly, los DTO aún genéricos y la ausencia de validación de *todas* las respuestas contra OpenAPI quedan como deuda identificada. El consejo decide si alguno impide la publicación del Core S2 o requiere una enmienda previa.
5. **Consumidores:** Squad 2 confirma auth/tenant para matrícula y asistencia; Squad 3 confirma la transición JWT hacia M8; Squad 4 confirma el contexto tenant de agregaciones; Squad 5 confirma el sobre y DTO necesarios para reportes/membrete. La revisión no presume que esos módulos estén integrados.

## Registro de conformidad

Cada líder debe dejar en el PR #2 o en el acta del consejo una aprobación inequívoca de **ADR-002 y ADR-005**, con fecha y referencia verificable. Si aprueba con condiciones, se registran las condiciones y se repite la verificación tras resolverlas.

| Squad / responsable | ADR-002 | ADR-005 | Revisión del contrato consumidor | Fecha y enlace de evidencia |
|---|---|---|---|---|
| S1 — Brandon Fernando Montero Gutiérrez | Pendiente | Pendiente | Core productor | Pendiente |
| S2 — Eduardo Sebastian Paipay Vega | Pendiente | Pendiente | Matrícula y asistencia | Pendiente |
| S3 — Steve Smith Ovalle Luyo | Pendiente | Pendiente | M8, JWT y calificaciones | Pendiente |
| S4 — Grissel Arascely Rodríguez Quispe | Pendiente | Pendiente | Analítica | Pendiente |
| S5 — Cesar Antonio Leon Reyna | Pendiente | Pendiente | Secretaría y portal | Pendiente |

## Resolución

**Pendiente.** Cuando consten las diez aprobaciones ADR y las observaciones bloqueantes estén resueltas, registrar aquí la fecha, enlaces y decisión del consejo; entonces actualizar el estado de ADR-002/005 y el índice ADR, ejecutar CI sobre el commit final y decidir la integración en `dev` según la política de ramas. Hasta ese momento el PR permanece en borrador y S2 tiene cierre técnico, no cierre formal.

**Trabajo posterior fuera del alcance de S2:** SMTP y migración *contract* de identidad (S3); aislamiento completo de WebSocket, colas, archivos y exportaciones (S7); plano de control SaaS (S6). Ningún plantel real adicional queda autorizado por esta acta.
