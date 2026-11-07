# Informe de estado técnico y recuperación SaaS multi-tenant

**Fecha de corte:** 2026-10-28 (America/Lima)  
**Repositorio:** https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system  
**Rama evaluada:** `dev` / `main` (sincronizadas en la revisión anterior); cambios SaaS aislados en `chore/saas-tenant-foundation`.  
**Naturaleza:** auditoría estática de repositorio y evidencia CI; no es certificación de producción.  
**Objetivo correcto:** plataforma SaaS multi-tenant; **no** despliegue Ethernet/LAN.

## 1. Evaluación senior provisional — 5.2/10

| Dimensión | Nota /10 |
|---|---:|
| Arquitectura y diseño | 8.0 |
| Requisitos y documentación | 8.5 |
| Organización del código | 6.5 |
| Implementación funcional | 3.5 |
| Seguridad y control de datos | 5.0 |
| Pruebas e integración | 5.0 |
| Infraestructura y despliegue | 3.0 |

**Calificación global provisional de la revisión inicial: 5.2/10.** Es una apreciación de ingeniería, no un promedio aritmético simple de las filas, una prueba de aceptación, ni una nueva medición posterior a la rama SaaS. Recalificar tras evidencias funcionales.

## 2. Inventario del producto

- 89 requisitos funcionales (RF); 20 requisitos no funcionales (RNF).
- 13 módulos funcionales; 5 squads.
- Stack identificado: Next.js 15, React 19, TypeScript, Node/Express, PostgreSQL 16, Redis 7, WebSockets, OpenAPI 3.1, migraciones SQL.
- CI en `main`: **success** en run https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/40787689556 (28/10/2026, 23:29 UTC). `dev`: **success** en run https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/40237368137 (25/10/2026). Son verificaciones de compilación, lint, tipos y pruebas de componentes; no implican aceptación E2E con infraestructura real.
- La rama `chore/saas-tenant-foundation` tiene dos commits propios al momento de la primera comparación; **no consta CI ejecutado sobre esa rama** al corte.
- `README.md` muestra una auditoría **histórica** del 22/10/2026: 251/1000 y 0/89 RF formalmente aceptados, referida al commit `d566f4dc`. No confundirlo con una métrica actualizada al 28/10.

### Matriz RF (fuente: docs/requirements/matriz-rf-arquitectura.md, 25/10/2026)

| Clasificación | RF |
|---|---:|
| Core S1 con código + contrato, aceptación integrada pendiente | 21 |
| M8/S3 implementado en servicio, integración pendiente | 11 |
| Ubicación definida sin backend físico | 48 |
| Sin diseño SDD | 4 |
| Pendiente clasificación de backend | 4 |
| Bloqueado | 1 |
| **Total** | **89** |

**Interpretación:** 32/89 con implementación identificada, **no** 32/89 aceptados. `0/89` aceptados es el último dato de la auditoría histórica en README, no un nuevo conteo de aceptación.

## 3. Fortalezas comprobables

1. API-First y contratos OpenAPI.
2. Trazabilidad de requisitos, CU, ADR y estructura por squads.
3. JWT/RBAC/RLS y roles separados como diseño de seguridad defensivo.
4. Migraciones versionadas y batería de pruebas de base de datos con PGlite.
5. CI en `main` y `dev` exitoso en los runs citados.
6. Separación del frontend, backend y servicio M8.

## 4. Hallazgos priorizados y evolución al 28/10

| Severidad | Hallazgo | Estado / evidencia | Acción requerida |
|---|---|---|---|
| Crítica | Credencial PostgreSQL fija y puertos infra publicados | **Mitigación parcial en rama SaaS**: `docker-compose.yml` exige `POSTGRES_PASSWORD` y limita PostgreSQL, Redis y Adminer a loopback. Aún no fusionado a `dev`/`main`. | Rotar credencial usada; revisar secretos históricos; probar compose y despliegue seguro |
| Crítica | Sin backup/restauración verificada | Pendiente, según `docs/architecture/05-database.md` | Implementar política y ensayo documentado de restauración |
| Alta | Squads 2, 4 y 5: vistas demo sin backend físico completo | Pendiente | Reemplazar métricas ficticias y priorizar flujos reales |
| Alta | M8 sin gateway de Core | Pendiente (ADR-001) | Integración autenticada, contrato canónico y E2E |
| Alta | Sin E2E Core con PostgreSQL, Redis y otros servicios reales | Pendiente | Staging y tests cross-tenant sobre PostgreSQL 16 |
| Alta | Sin Dockerfiles y staging operativo | Pendiente | Despliegue reproducible, HTTPS, logging y recuperación |
| Media | Códigos de error y estructura OpenAPI divergentes | Pendiente (ADR-005 / P-05) | Unificar contratos sin romper consumidores |
| Alta SaaS | `squad3.tenant_id` VARCHAR(50) vs UUID canónico | Pendiente (ADR-002) | Migración expand/contract segura |
| Alta SaaS | Tablas heredadas S2–S5 y funciones privilegiadas necesitan auditoría total | Pendiente | Inventario por tabla y pruebas de grants, RLS y vistas |

**Precisión:** mover la contraseña fuera del repositorio no elimina su presencia en el historial Git ni rota una clave existente. Una corrección en la rama de trabajo no cuenta como remediación desplegada.

## 5. Objetivo SaaS y arquitectura adoptada para la planificación

**Shared Database + Shared Schema + PostgreSQL RLS** con `tenant_id UUID` canónico. Tenant = institución; sede = unidad dependiente. Core común y módulos en monolito modular; M8 conserva proceso propio mientras se integra detrás de gateway. RLS y controles a nivel de servicio operan como barreras complementarias. Prohibido usar el tenant proporcionado libremente por el cliente como identidad autorizada.

La aplicación necesita:
- TenantContext confiable por transacción y verificación de membresía activa.
- Roles de aplicación sin BYPASSRLS, sin propiedad de tablas, permisos mínimos.
- FK compuestas para impedir referencias de otros tenants.
- Provisionamiento y suspensión con transacciones, idempotencia y auditoría.
- Normalización UUID de M8, gateway y contratos API compartidos.
- Backups restaurables, monitoreo, CI E2E, staging y protección de ramas.
- Revisión de Ley 29733 y tratamiento de datos de estudiantes.

No se recomienda Kubernetes ni más microservicios para construir esta base. Tampoco billing, analítica avanzada o dashboards ficticios antes de cerrar los flujos esenciales.

## 6. Responsabilidad de ejecución

| Fase | Ejecuta (responsable técnico propuesto) | Revisa / aprueba | Entregable / puerta de salida |
|---|---|---|---|
| F0 Diagnóstico | Líder técnico + responsable BD + seguridad | Arquitecto/líder del proyecto | Inventario por tabla, RLS/grants/SECURITY DEFINER y brechas verificadas |
| F1 Modelo y ADR | Arquitecto + Squad 1 + Squad 3; consulta a demás squads | Líder + representante institucional para reglas de negocio | ADR-001..005 aprobados y modelo tenant/sede/identidad/membresía firmado |
| F2 Database Foundation | Responsable BD + Squad 1 + Squad 3 | Arquitecto + QA/seguridad | Migraciones nuevas, UUID, restricciones, pruebas sin pérdida de datos |
| F3 Core Foundation | Squad 1 | Arquitecto + QA/seguridad | TenantContext, RBAC, membresías y lifecycle cubiertos por pruebas |
| F4 Integración | Squad 1 y Squad 3; Squad 2 adapta módulos | Líder de integración + QA | Gateway M8 y contrato E2E; frontend integrado |
| F5 Aislamiento | QA/Seguridad con BD y Core | Líder técnico | Matriz A/B, concurrencia, funciones, WebSockets y jobs en PostgreSQL real aprobada |
| F6 Operación | DevOps/BD + líder técnico | Responsable institucional de operación | Staging, secretos, backup/restauración, observabilidad, rollback y runbooks |

**Gobernanza:** el líder técnico prioriza y aprueba PR; cada squad implementa únicamente su propiedad. El responsable BD ejecuta migraciones en entornos compartidos. QA debe verificar independientemente. La institución aprueba decisiones que afecten políticas escolares y datos personales. Los responsables aquí son **roles propuestos**, no asignaciones personales confirmadas.

## 7. Secuencia y criterios

F0 → F1 → F2/F3 (trabajo paralelo solo tras contrato aprobado) → F4 → F5 → F6.  
Cada fase exige commit, pruebas reproducibles, revisión y evidencia. Bloqueadores: filtración entre tenants, credenciales activas comprometidas, migraciones destructivas sin respaldo, restauración no probada, autorización incompleta. No se despliega con datos reales mientras existan esos bloqueadores.

## 8. Registro de ejecución

| Fecha | Cambio | Estado |
|---|---|---|
| 28/10/2026 | Rama `chore/saas-tenant-foundation` creada a partir de dev | Confirmado |
| 28/10/2026 | Commit `59f8f7d`: credencial variable y puertos locales en compose | Confirmado en rama |
| 28/10/2026 | Commit `83bd8ae`: plan inicial F0–F6 | Confirmado en rama |
| 28/10/2026 | Informe técnico de estado y roles propuestos | Documentado |
| — | Migraciones nuevas de tenant/membresía | **Pendiente** |
| — | Core TenantContext y provisionamiento completo | **Pendiente** |
| — | Gateway M8 y E2E real | **Pendiente** |
| — | Ensayo PostgreSQL 16 y restauración | **Pendiente** |
| — | PR aprobado y merge a dev/main | **Pendiente** |

## 9. Veredicto

**Buen fundamento académico y arquitectónico, producto institucional todavía incompleto.** No autorizar producción ni acceso de colegios reales hasta finalizar validaciones. La calificación de 5.2/10 y el histórico 251/1000 reflejan criterios distintos; no son porcentajes intercambiables.

**Fuentes internas:** `README.md`, `docs/requirements/matriz-rf-arquitectura.md`, `docs/architecture/00-auditoria-inicial.md`, `04-backend.md`, `05-database.md`, `06-verificacion-y-pendientes.md`, `docs/deployment/guia-despliegue.md`, `database/migrations/`, `.github/workflows/ci.yml`, `docker-compose.yml`.
