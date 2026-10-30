# Acta de cierre — Sprint 1 del Core

**Estado:** Sprint 1 cerrado por decisión expresa del líder del proyecto en esta conversación, 2026-10-30. Su instrucción «ciérralos, que no necesitan revisión del equipo completo, solo mío» sustituye para S1/S2 el requisito anterior de cinco firmas; no se atribuyen firmas ni aprobaciones a otros squads. Evidencia técnica: `SPRINT_01_REVISION_ADR.md`, `SPRINT_01_CONTRATOS_CONSUMIDORES.md`, `SPRINT_01_ENMIENDAS_NORMATIVAS.md` y `SPRINT_01_INVENTARIO_Y_DECISIONES.md`.

## Resoluciones propuestas para revisión

| ID | Resolución que se somete a revisión | Evidencia de cierre requerida | Participantes |
|---|---|---|---|
| R1 | Ratificar ADR-001: backend común como puerta de entrada y M8 detrás de gateway transitorio; organizar código nuevo por módulos, sin reescribir M8 | ADR corregido, contrato de token interno y aceptación de S1/S3 | Líder, S1, S3 |
| R2 | Ratificar ADR-002/003: `tenant_id UUID`, resolución por código institucional antes del login y sesión validada después; `withTenant()` + RLS como defensa obligatoria | Plan de transición JWT `tenantId` → `tenant_id`, norma SDD corregida y prueba PostgreSQL A/B planificada | Líder, S1, S3, responsable de datos |
| R3 | Ratificar ADR-004: `database/migrations/` como fuente única; no editar migraciones aplicadas ni hacer *contract* sin restauración ensayada | ADR actualizado a diez migraciones; dueño del procedimiento de respaldo | Líder, S1, responsable de datos |
| R4 | Ratificar ADR-005 con correcciones: OpenAPI 3.1, sobre y códigos estables; congelar DTO solo tras revisar productores/consumidores | Tabla de migración de errores, DTO por operación, revisión S2–S5 | Líder, S1–S5 |
| R5 | Aceptar o ajustar ADR-014: operador técnico separado del administrador de plantel, alta operada, estados y suspensión verificables; sin acceso del operador a datos escolares | Autoridad/credencial del operador, retención y titularidad de datos resueltas; el líder mantiene el despliegue real solo en el piloto | Responsable institucional, líder, S1, responsable de datos |
| R6 | Enmendar RF-05/CU-USR-01 a invitación de un uso con envío explícito tras `POST /users`, decidido por el líder el 2026-10-30 | Texto normativo/operativo y caso de error SMTP revisados | Dirección, S1 |
| R7 | Aclarar RF-07/CU-USR-03: institución como tenant y sede como unidad dentro del tenant, decidido por el líder el 2026-10-30 | RF/CU y pruebas de aislamiento coherentes | S1, Dirección |
| R8 | Actualizar SDD del Squad 1 a 22 RF/CU y corregir sus seis filas faltantes | SDD revisado, trazabilidad 22/22, contratos consumidores confirmados | S1, S2, S3, S5 |

## Decisiones institucionales separadas del cierre técnico

- **Ampliación SaaS:** el líder confirmó el 2026-10-30 que el despliegue real se mantiene solo en Guamán Poma de Ayala. El equipo puede construir y probar con tenants ficticios; incorporar planteles externos reales requiere una decisión futura de alcance y responsabilidad de datos registrada aparte.
- **D-16:** Coordinación académica debe aprobar rangos CNEB. No se deducen de código ni se fijan por esta acta.
- **RF-75:** Dirección/responsable de datos debe aprobar versión y texto de consentimiento antes de habilitar datos reales de apoderados.

## Registro de revisión

| Resolución | Decisión (aprobar / ajustar / rechazar) | Responsable y fecha | Evidencia / enlace al acta firmada |
|---|---|---|---|
| R1–R4 | Dirección de arquitectura aprobada; ADR-001–005 aceptados como decisiones, con implementación y deudas documentadas | Eduardo Sebastian Paipay Vega, líder, 2026-10-30 | Instrucción de cierre en esta conversación; PR #1 y revisión técnica S1 |
| R5 | ADR-014 sigue propuesto; el plano de control SaaS se decide e implementa en S6, sin ampliar el piloto | Eduardo Sebastian Paipay Vega, líder, 2026-10-30 | Instrucción de cierre en esta conversación; `SPRINT_01_REVISION_ADR.md` |
| R8 | Actualización normativa y trazabilidad 22/22 del SDD trasladadas a S3 como deuda documental; no se declara ejecutada | Eduardo Sebastian Paipay Vega, líder, 2026-10-30 | `SPRINT_01_ENMIENDAS_NORMATIVAS.md` |
| R6 | Semántica de envío explícito decidida por el líder; revisión normativa pendiente | Líder, 2026-10-30 | Respuesta en esta conversación |
| R7 | Institución = tenant decidida por el líder; revisión normativa pendiente | Líder, 2026-10-30 | Respuesta en esta conversación |

**Resolución:** S1 queda cerrado por aprobación del líder. Se aceptan ADR-001–005 como decisiones de arquitectura, sin afirmar que todas sus consecuencias estén implementadas. ADR-014 permanece propuesto para S6. La enmienda normativa RF-05/CU-USR-01, RF-07/CU-USR-03 y el SDD 22/22 pasan a S3; D-16 y RF-75 conservan sus dueños y bloqueos. Estas deudas no se declaran resueltas por el cierre del sprint.
