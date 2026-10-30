# Registro de Decisiones de Arquitectura (ADR)

Decisiones que afectan a más de un squad, según la Etapa 3.0 de [`plan_fase_3_diseno.md`](../plan_fase_3_diseno.md).

Cada ADR formaliza, cuando existe, una decisión del registro F0 ([`docs/F0_DECISIONES_ARQUITECTURA_PENDIENTES.md`](../../../../docs/F0_DECISIONES_ARQUITECTURA_PENDIENTES.md)). Así no se abre un registro paralelo: el F0 explica el origen y el ADR deja la decisión cerrada.

| ADR | Título | Estado | Formaliza | Fecha |
|---|---|---|---|---|
| [ADR-001](ADR-001-topologia-backend.md) | Topología del backend: monolito modular con M8 detrás de un gateway | Propuesto | D-05 | 2026-10-22 |
| [ADR-002](ADR-002-tipo-tenant-id.md) | Tipo, origen y alcance del `tenant_id` | Propuesto | D-04 (subdecisiones 1 y 2) | 2026-10-22 |
| [ADR-003](ADR-003-aislamiento-rls.md) | Aislamiento multi-tenant con Row-Level Security | Propuesto | D-04 | 2026-10-22 |
| [ADR-004](ADR-004-migraciones.md) | Migraciones de base de datos versionadas | Propuesto | D-04 (subdecisión 3) | 2026-10-22 |
| [ADR-005](ADR-005-contratos-api.md) | Contratos de API: OpenAPI 3.1, sobre y catálogo de errores | Propuesto | D-18 | 2026-10-22 |
| ADR-006 | Librería JWT y tokens por audiencia | Pendiente | D-06, D-07 | — |
| ADR-007 | Tiempo real | Pendiente | — | — |
| ADR-008 | Sincronización offline | Pendiente | D-15 | — |
| ADR-009 | Cifrado de datos sensibles | Pendiente | — | — |
| ADR-010 | Motor PDF y sello | Pendiente | D-17 | — |
| ADR-011 | Observabilidad | Pendiente | — | — |
| ADR-012 | Despliegue | Pendiente | D-19 | — |
| ADR-013 | Meta de latencia del Kiosco | Pendiente | — | — |
| [ADR-014](ADR-014-plano-control-saas.md) | Plano de control SaaS y ciclo de vida del tenant | Propuesto | Evolución multi tenant de RF-07 | 2026-10-30 |

**Estados:** Propuesto → Aceptado (firmado por los 5 líderes en el consejo de diseño) → Reemplazado por ADR-0YY.

La plantilla está en §9 del plan de la Fase 3.
