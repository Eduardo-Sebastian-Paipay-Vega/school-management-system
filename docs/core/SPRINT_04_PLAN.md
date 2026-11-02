# Sprint 4 — Administración y configuración del Core

**Base:** merge de PR #3 en `dev` (`7c0b3107`). **Rama:** `codex/core-sprint-4`. **Estado:** en ejecución. **Alcance:** solo piloto Guamán Poma de Ayala; las pruebas A/B usan instituciones ficticias.

## Objetivo

Completar y comprobar los recorridos de administración de usuarios y configuración escolar sobre la API real. La identidad y la sesión siguen en PostgreSQL; el cliente consume permisos y datos del Core. Una institución es un tenant y sus sedes son unidades internas. La invitación de cuenta sigue siendo una acción explícita. No publicar rangos numéricos CNEB sin resolver D-16.

| Historia | RF/CU | Entrega y prueba de salida |
|---|---|---|
| S4-01 | RF-05/06/08/72/73, CU-USR-01/02/04/06/07 | Alta pendiente, importación idempotente, directorio paginado, edición y baja/reactivación, roles con motivo y protección del último administrador; HTTP A/B y UI real. |
| S4-02 | RF-09, CU-USR-05 | Perfil propio editable y cambio de clave que revoca sesiones, con estados de error y prueba de acceso. |
| S4-03 | RF-07/10/11/12, CU-USR-03/INS-01/02/03 | Sedes, año 2027 sobre las mismas cuentas, periodos, días y secciones; unicidad, límites temporales, tenant y cierre comprobados por HTTP. Contrato de bloqueo de notas y aforo se entrega a Squads 2/3. |
| S4-04 | RF-13/14, CU-INS-04/05 | Escala literal/versionada y configuración institucional con membrete; una escala numérica no pasa a vigente mientras D-16 siga abierto. Registrar la dependencia de PDF con Squad 5. |
| S4-05 | Los 22 RF de Squad 1 | Matriz de estado con evidencia por RF, CI verde y demostración de los recorridos S4. |

## Implementación

1. Corregir invariantes de API en `backend/src/routes/users.routes.ts` y `school.routes.ts`; conservar RLS y auditoría transaccional. No editar migraciones históricas.
2. Extender `backend/tests/integration/tenant-isolation.test.cjs` con recorridos administrativos y configuración A/B. Probar casos positivos, conflictos y revocación.
3. Ajustar `frontend/modules/squads/squad_1_core/CoreModuleView.tsx` para paginación real, edición de perfil/usuarios y estados de carga/error. Seguir PrimeReact Guardian G0–G6.
4. Actualizar contratos OpenAPI y tipos generados si cambia un sobre o DTO. Mantener compatibilidad de rutas.
5. Registrar evidencia y dependencias externas en `docs/core/SPRINT_04_EVIDENCIA.md`; actualizar el estado del plan general.

## Puerta de salida

`database npm test`, `backend npm run lint/build/test`, suite integrada PG16/Redis7/SMTP con dos tenants, `packages/contracts npm run lint/check:inventory/check:generated`, `frontend npm run lint/build` y auditor PrimeReact. Reimportar no duplica personas; el último administrador no se pierde; el nuevo año conserva cuentas; B no ve ni cambia A. RF-13 no publica rangos numéricos sin D-16. Los efectos de cierre de notas, aforo de matrícula y PDF requieren pruebas conjuntas con sus squads y se registran con su estado real.
