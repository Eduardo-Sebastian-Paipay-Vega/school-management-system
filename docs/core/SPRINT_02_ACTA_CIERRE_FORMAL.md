# Acta de cierre formal del Sprint 2 — Core y seguridad

**Estado:** Sprint 2 cerrado por aprobación expresa del líder del proyecto en esta conversación, 2026-10-30. El líder indicó «ciérralos, que no necesitan revisión del equipo completo, solo mío». Esta decisión sustituye para S1/S2 el requisito anterior de cinco firmas; no atribuye aprobación a otros squads. **PR:** [#2](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/pull/2), integración hacia `dev`.

## Alcance sometido a decisión

El consejo revisa el paquete técnico de S2 descrito en [resultados](SPRINT_02_RESULTADOS.md): contrato OpenAPI modular del Core (46 rutas, 57 operaciones), tipos generados, catálogo de errores, transición de JWT a `tenant_id`, rechazo de cabecera discordante y pruebas A/B con PostgreSQL 16 y Redis 7. El [CI de la implementación S2](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/41134309876) pasó los seis jobs técnicos. El despliegue sigue limitado al piloto Guamán Poma de Ayala.

El líder acepta [ADR-002](../../D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/ADR/ADR-002-tipo-tenant-id.md) y [ADR-005](../../D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/ADR/ADR-005-contratos-api.md) como decisiones de arquitectura para S1/S2. El índice ADR registra la excepción de aprobación individual. El CI demuestra la implementación S2 indicada abajo, sin certificar que todas las consecuencias de ambos ADR ya estén implementadas.

## Decisiones que deben quedar expresas

1. **Tenant y sesión (ADR-002):** institución = tenant UUID, sede = unidad interna; el tenant autenticado procede del JWT/sesión, nunca de `X-Tenant-ID`; cabecera discordante devuelve 403 `TENANT_MISMATCH`.
2. **Transición JWT:** emisor usa `tenant_id`; la lectura legada de `tenantId` requiere `JWT_LEGACY_TENANT_ACCEPT_UNTIL` fijado en UTC y no supera siete días. Sin configuración, el legado se rechaza.
3. **Contrato y errores (ADR-005):** `openapi.yaml` es la fuente del Core; `core.yaml` queda como instantánea histórica. Se aceptan los códigos y sobre de [la tabla de transición](SPRINT_02_TRANSICION_CONTRATOS.md), y se registra si los consumidores requieren un periodo de convivencia o una versión `/api/v2`.
4. **Límite de aceptación:** las 113 advertencias Redocly, los DTO aún genéricos y la ausencia de validación de *todas* las respuestas contra OpenAPI quedan como deuda identificada para el trabajo de integración posterior.
5. **Consumidores:** la validación de auth/tenant con S2, JWT con M8, agregaciones con S4 y datos de reportes con S5 se traslada a la integración entre squads. El cierre no presume que esos módulos estén integrados.

## Registro de conformidad

La aprobación formal procede únicamente del líder por instrucción expresa en esta conversación. La tabla conserva visibilidad de los consumidores, sin presentar su silencio como aprobación.

| Squad / responsable | ADR-002 | ADR-005 | Revisión del contrato consumidor | Fecha y enlace de evidencia |
|---|---|---|---|---|
| S1 — Brandon Fernando Montero Gutiérrez | Sin revisión solicitada | Sin revisión solicitada | Core productor | No requerida para este cierre |
| S2 — Eduardo Sebastian Paipay Vega, líder | Aprobado | Aprobado | Integración posterior de matrícula y asistencia | Instrucción de cierre en esta conversación, 2026-10-30 |
| S3 — Steve Smith Ovalle Luyo | Sin revisión solicitada | Sin revisión solicitada | M8, JWT y calificaciones | No requerida para este cierre |
| S4 — Grissel Arascely Rodríguez Quispe | Sin revisión solicitada | Sin revisión solicitada | Analítica | No requerida para este cierre |
| S5 — Cesar Antonio Leon Reyna | Sin revisión solicitada | Sin revisión solicitada | Secretaría y portal | No requerida para este cierre |

## Resolución

**Cerrado por el líder.** ADR-002/005 pasan a `Aceptado` como decisiones. El CI técnico pasó y el paquete se integra en `dev` siguiendo la política de ramas. Las deudas enumeradas permanecen abiertas en los sprints correspondientes; el cierre no equivale a despliegue de otros planteles.

**Trabajo posterior fuera del alcance de S2:** SMTP y migración *contract* de identidad (S3); aislamiento completo de WebSocket, colas, archivos y exportaciones (S7); plano de control SaaS (S6). Ningún plantel real adicional queda autorizado por esta acta.
