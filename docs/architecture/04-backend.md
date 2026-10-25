# 04 — Arquitectura backend

Hay dos procesos (ADR-001, propuesto): el **backend común** (`backend/src/`, Express, CommonJS) y el **servicio M8** de calificaciones (`backend/squad_3_calificaciones/`, `node:http`, ESM). El destino es un monolito modular; M8 se integra detrás de un gateway del backend común y no se reescribe.

## 1. Estado real del backend común

```text
backend/src/
├── server.ts                  # bootstrap: helmet, CORS, parsers, rutas, 404, errores, arranque
├── config/                    # database.ts (pool, withTenant, assertRuntimeRole), jwt.ts, redis.ts
├── core/
│   ├── http/errors.ts         # 404 y manejador de errores con el sobre canónico
│   └── identity-crypto.ts     # AES-256-GCM + índice ciego HMAC (RF-68)
├── middlewares/               # auth.middleware.ts (authenticateJwt), rbac.middleware.ts (requirePermission, requireRoles)
├── routes/                    # un router por recurso: auth, users, school, guardians, notifications, audit, health
├── controllers/               # auth.controller.ts
├── services/                  # lógica del Core: auth, users, user-import, audit, notifications, mail, realtime
└── scripts/                   # backfill-identities.ts, bootstrap-admin.ts (operación, no HTTP)
```

Está organizado **por capa técnica**, no por módulo como piden `arquitectura_sistema.md` §4 y `PLAN.md`. No se reorganiza ahora porque el Squad 1 trabaja sobre esos archivos (riesgo de la auditoría §6).

## 2. Estructura objetivo para código nuevo

Todo módulo nuevo (squads 2, 4 y 5, y el futuro `grades`) se crea así, dentro de `backend/src/modules/<modulo>/`. Las carpetas aparecen solo cuando tienen archivos:

```text
backend/src/modules/<modulo>/
├── <modulo>.routes.ts         # Router Express: valida entrada (zod), aplica authenticateJwt/requirePermission, llama al caso de uso
├── <modulo>.service.ts        # casos de uso: reglas del módulo, sin Express
├── <modulo>.repository.ts     # SQL del módulo; recibe el PoolClient de withTenant()
├── <modulo>.schemas.ts        # esquemas zod de entrada/salida, alineados con paths/<modulo>.yaml
└── index.ts                   # exporta el Router y, si otro módulo lo necesita, una interfaz de consulta
```

Un módulo crece a `domain/`, `application/`, `infrastructure/` y `presentation/` solo cuando tiene entidades con reglas propias que lo justifiquen (p. ej. M8). No se crean interfaces sin una segunda implementación o un consumidor externo.

Los módulos del Core pasan a `modules/auth` y `modules/administration` cuando el Squad 1 cierre su entrega E2–E3 (`PLAN.md`). Hasta entonces, `routes/` y `services/` son su ubicación canónica.

### Destinos de módulo

`auth` (M1), `administration` (M2, M3, M12), `academics` (M4), `attendance` (M5), `staff_tracking` (M6, M7), `grades` (M8, hoy servicio M8), `analytics` (M9, M10), `ssu_impact` (RF-57), `document_crypto` (M11), `portal` (M13). RF-86 a RF-89 no tienen destino en las fuentes: ver la matriz.

## 3. Reglas de dependencia

1. `routes` → `service` → `repository`. Nunca al revés; el repositorio no conoce Express.
2. Toda consulta con datos de un tenant usa `withTenant(req.user.tenantId, req.user.id, fn)` (ADR-003 §2). El tenant nunca sale de cabeceras ni del cuerpo (ADR-002).
3. Un módulo no importa el `repository` de otro ni consulta sus tablas: usa su `index.ts` (servicio interno). Los nombres previstos en ADR-001 son `AccessControlService`, `EnrollmentQueryService`, `GradingScaleService` y `AuditService`; se crean con su primer consumidor.
4. Una mutación sensible y su auditoría comparten transacción (`fn_registrar_auditoria()` dentro del mismo `withTenant`).
5. Configuración solo desde `config/`; ningún módulo lee `process.env` fuera de ahí, salvo los existentes del Core (`identity-crypto`, `mail.service`), que se consolidarán.

## 4. Composición

Los módulos se registran **explícitamente** en `server.ts`, en orden, antes de `notFoundHandler` y `errorHandler`:

```ts
app.use('/api/v1/<recurso>', <modulo>Routes);
```

No hay descubrimiento automático ni registro dinámico de plugins.

## 5. Contratos (API-first)

1. El squad propone `packages/contracts/openapi/paths/<modulo>.yaml` (hoy el único archivo es `core.yaml`; la división en `openapi.yaml` + `components/` + `paths/` de ADR-005 está pendiente).
2. El consumidor lo aprueba en el mismo PR.
3. Recién entonces se implementa la ruta. `npm run lint` en `packages/contracts/` debe pasar.

**Sobre de respuesta:** `{ success: true, data, timestamp }` o `{ success: false, error: { code, message, details? }, timestamp }`. Listas: `data: { items, page, limit, total }`.

**Errores:** solo códigos del catálogo de ADR-005. La divergencia actual del Core (`UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`…) está registrada como P-05.

## 6. Infraestructura transversal

| Necesidad | Ubicación | Estado |
|---|---|---|
| Arranque y validación de configuración | `server.ts`: `assertIdentityKeys()`, `assertRuntimeRole()`; `config/jwt.ts` y `config/database.ts` lanzan error si faltan secretos o el rol no cumple RLS | Existe |
| Errores HTTP y 404 | `core/http/errors.ts` (`INVALID_JSON`, `BODY_TOO_LARGE`, `ORIGIN_DENIED`, `NOT_FOUND`, `INTERNAL_ERROR`; nunca envía el detalle técnico) | Agregado en esta fase, con pruebas |
| Seguridad HTTP | `helmet`, CORS con lista `CORS_ORIGIN`; límite de intentos de login y recuperación con contadores en Redis (`429 TOO_MANY_ATTEMPTS`) | Existe. `express-rate-limit` está declarado en `package.json` pero no se usa |
| Autenticación y permisos | `authenticateJwt`, `requirePermission('recurso:acción')` | Existe para el Core |
| Health check | `GET /api/v1/health` (PostgreSQL y Redis; 503 si falta uno) | Existe |
| Logging | `morgan('dev')` y `console.*` | **Pendiente**: logging estructurado sin datos personales |
| Tiempo real | `services/realtime.service.ts` (`ws`, `/api/v1/notifications/ws`) | Existe; gateway único por decidir (S-03) |
| Gateway hacia M8 | — | **Pendiente** (ADR-001) |

## 7. Servicio M8

`backend/squad_3_calificaciones/` es un proceso propio con su servidor, su JWT (`aud=sms-grades`) y 16 pruebas. No se modifica en esta fase. Su integración sigue ADR-001: el backend común valida la sesión, emite un token interno de ≤ 60 s y reenvía `/api/v1/grades/*` y `/api/v1/grades/live`. Las rutas alias (`batch-save`, `auto-save`, `batch-upsert`) son obsoletas; la canónica es `PATCH /api/v1/grades/batch`.

## 8. Pruebas

| Proyecto | Runner | Comando | Cobertura actual |
|---|---|---|---|
| Backend común | `node:test` sobre `dist/` | `npm test` (compila y ejecuta `tests/*.test.cjs`) | Cifrado de identidad, importación CSV/XLSX, manejo de errores HTTP (9 pruebas) |
| M8 | `node:test` + `tsx` + PGlite | `npm test` | 16 pruebas: dominio, HTTP/WS, PostgreSQL con RLS, proveedores |

Faltan pruebas de integración con PostgreSQL y Redis reales para el Core (`PLAN.md`, Verificación).

## 9. Cómo agregar un módulo

1. Contrato en `packages/contracts/openapi/` y aprobación del consumidor.
2. Migración en `database/migrations/AAAAMMDDHHMMSS_s<squad>_<descripcion>.sql` con `tenant_id`, RLS y privilegios de `sms_app` (las pruebas de `database/` fallan si falta la política).
3. `backend/src/modules/<modulo>/` con `routes`, `service`, `repository`, `schemas`.
4. Permisos nuevos en `docs/seguridad/matriz_rbac.md` y en la migración de permisos.
5. Montar el router en `server.ts`.
6. Pruebas en `backend/tests/<modulo>.test.cjs`; `npm run lint`, `npm run build`, `npm test`.
