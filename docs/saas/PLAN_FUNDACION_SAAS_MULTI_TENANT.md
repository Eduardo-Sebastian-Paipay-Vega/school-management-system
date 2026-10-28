# Fundación SaaS multi-tenant — plan de aplicación y control

Estado: **en ejecución, NO aprobado para producción**. Rama: `chore/saas-tenant-foundation`.

## F0 — Inventario / auditoría (evidencias existentes)
- Fuente ejecutable: `database/migrations/` (no los SQL históricos).
- Revisar tablas de `public`, `squad3`, vistas y funciones SECURITY DEFINER, incluyendo tablas sin `tenant_id`.
- Registro de riesgos: `docs/architecture/05-database.md`, `docs/architecture/06-verificacion-y-pendientes.md`.
- La existencia de políticas RLS no equivale a comprobar que cada ruta está protegida.

## F1 — Contrato de tenancy (requiere aprobación)
- Tenant = institución; sede = entidad dependiente.
- `tenant_id` canónico UUID. M8 aún mantiene VARCHAR y requiere una migración expand/contract.
- Decidir pertenencia multi-institución, transición de sesión, roles globales y administración SaaS.
- Formalizar ADR-001..005 sin reescribir silenciosamente decisiones propuestas.

## F2 — Base de datos
- Únicamente migraciones nuevas, sin modificar las ya ejecutadas.
- Inventariar y reparar FK compuestas, índices, tablas sin tenant, funciones privilegiadas, vistas y grants.
- Ensayar con dataset A/B, datos heredados y migración en copia desechable.
- Separar rol de aplicación del migrador; no otorgar BYPASSRLS.

## F3 — Core
- Resolver el contexto solo con identidad/sesión/membresía autorizada.
- Usar transacción `withTenant` en operaciones de negocio; no aceptar contexto tenant desde parámetros sin validar.
- Provisionamiento idempotente; suspensión impide nuevas operaciones conservando datos y auditoría.
- Extraer módulos incrementalmente; no reescribir el Core estable como prerrequisito.

## F4 — M8
- Gateway en el Core con contratos versionados y autorización interna corta.
- Homologación UUID y RLS; no exponer un segundo backend directamente.
- E2E de calificaciones desde frontend a API y PostgreSQL.

## F5 — Criterios de aislamiento obligatorios
- Contexto de A no lee ni modifica datos de B.
- Sin contexto, denegación cerrada; sin superar RLS mediante roles/funciones.
- Concurrencia en pool sin contaminación; FK cruzadas denegadas.
- Jobs y WebSockets con contexto y autorización explícitos.
- Ensayos en PostgreSQL 16 real, además de PGlite. Un CI verde de PGlite no sustituye las pruebas reales.

## F6 — Operación SaaS
- Dockerfiles y staging reproducible, backups con restauración probada, secreto externo y rotación, logs estructurados sin datos personales.
- Protección de ramas con CI y revisión; ninguna migración de producción automática.
- No habilitar tenants reales hasta aprobar seguridad, E2E y recuperación.

## Primer cambio implementado en esta rama
`docker-compose.yml` deja de versionar la contraseña de Postgres y liga puertos de PostgreSQL, Redis y Adminer a `127.0.0.1` en desarrollo. Configurar `POSTGRES_PASSWORD` en un archivo `.env` local no versionado o variable de entorno, y rotar la contraseña anterior si se utilizó. El cambio de entorno no actualiza por sí solo una contraseña ya almacenada en un volumen PostgreSQL.

## Puertas de salida
Cada fase debe tener commit, evidencia reproducible, pruebas correspondientes y aprobación. Las tareas F0–F6 **no están marcadas como completas** por el hecho de existir este documento.
