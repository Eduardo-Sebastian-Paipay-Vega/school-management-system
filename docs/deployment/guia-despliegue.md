# Guía de despliegue y entornos

**Estado:** no hay ningún entorno desplegado ni hosting decidido para el backend (D-19). Esta guía describe cómo construir y verificar cada pieza y qué falta para producción. **Que compile no significa que esté listo para producción.**

## 1. Componentes

| Componente | Build | Arranque | Puerto | Dependencias |
|---|---|---|---|---|
| Frontend Next.js | `npm ci && npm run build` en `frontend/` (requiere `NEXT_PUBLIC_CORE_API_URL` en tiempo de build) | `npm start` | 3000 | Backend común |
| Backend común | `npm ci && npm run build` en `backend/` | `npm start` (`node dist/server.js`) | 3001 (`PORT`) | PostgreSQL 16, Redis 7, SMTP |
| Servicio M8 | `npm ci` en `backend/squad_3_calificaciones/` | `npm start` (`tsx src/server.ts`) | propio | PostgreSQL 16; gateway del backend común (pendiente, ADR-001) |
| Migraciones | `npm ci` en `database/` | `npm run migrate` (paso manual) | — | PostgreSQL con rol migrador |

El backend necesita un proceso persistente: usa WebSocket (`/api/v1/notifications/ws`) y una cola de correo cada 60 s. No es apto para funciones *serverless*.

## 2. Entornos

| Entorno | Propósito | Base de datos | Migraciones | Estado |
|---|---|---|---|---|
| Local | Desarrollo | `docker compose up -d postgres redis` | Manual, `database/` | Disponible (requiere Docker) |
| CI | Verificación de PR y `dev`/`main` | PGlite en memoria (solo `database/` y M8) | Automáticas sobre base vacía | `.github/workflows/ci.yml` |
| Staging | Aceptación integrada con datos de prueba | Por definir | Manual con volcado previo | **No existe** |
| Producción | Uso institucional | Por definir | Manual, autorizada por el líder | **No existe** |

## 3. Variables

### Backend (`backend/.env`, plantilla `backend/.env.example`)

| Variable | Tipo | Notas |
|---|---|---|
| `NODE_ENV`, `PORT`, `PUBLIC_APP_URL`, `CORS_ORIGIN` | Configuración | `CORS_ORIGIN`: lista exacta de orígenes separada por comas |
| `DB_HOST`, `DB_PORT`, `DB_NAME` | Infraestructura | — |
| `DB_USER`, `DB_PASSWORD` | **Secreto** | Usuario miembro de `sms_app`; `postgres` es rechazado al arrancar |
| `REDIS_HOST`, `REDIS_PORT` | Infraestructura | — |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | **Secreto** | ≥ 32 caracteres, distintos; los valores de ejemplo se rechazan en producción |
| `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | Configuración | 15m / 7d |
| `ENCRYPTION_MASTER_KEY`, `DOCUMENT_HMAC_KEY` | **Secreto** | 64 dígitos hex, distintos, guardados fuera de PostgreSQL; el ejemplo público se rechaza |
| `SMTP_*` | **Secreto** / infraestructura | Necesario para invitaciones y recuperación |
| `GUARDIAN_CONSENT_VERSION`, `GUARDIAN_CONSENT_TEXT` | Configuración aprobada | Vacíos hasta la aprobación institucional; sin ellos la activación de apoderados responde 503 |

### Frontend (`frontend/.env.local`, plantilla `frontend/.env.example`)

| Variable | Tipo | Notas |
|---|---|---|
| `NEXT_PUBLIC_CORE_API_URL` | Pública | Se incrusta en el bundle: nunca poner secretos en variables `NEXT_PUBLIC_*` |

### Migraciones y operación

`DATABASE_URL` (rol administrador/migrador), `APP_DB_USER`, `APP_DB_PASSWORD` y `BOOTSTRAP_*`: solo en la sesión del operador, nunca en archivos versionados.

Todos los `.env` están ignorados por `.gitignore` salvo `.env.example`. El servidor valida al arrancar los secretos JWT, las claves de cifrado y el rol de base de datos; si fallan, termina con un mensaje sin revelar valores.

## 4. Arranque local

Secuencia completa en [`docs/core/OPERACION_CORE.md`](../core/OPERACION_CORE.md) §Arranque. Resumen:

1. `docker compose up -d postgres redis`
2. `database/`: `npm install`, `npm run migrate`, `npm run bootstrap:app-role`
3. `backend/`: copiar `.env.example` a `.env` y reemplazar todos los secretos; `npm install`, `npm run bootstrap:admin`, `npm run dev`
4. `frontend/`: `NEXT_PUBLIC_CORE_API_URL=http://localhost:3001`, `npm install`, `npm run dev`
5. Comprobar `GET http://localhost:3001/api/v1/health` → `200 {"status":"OK"}`

## 5. Verificación (lo mismo que ejecuta CI)

| Proyecto | Comandos |
|---|---|
| `frontend/` | `npm run lint`, `npm run build` |
| `backend/` | `npm run lint`, `npm test` (incluye `tsc`) |
| `backend/squad_3_calificaciones/` | `npm run check`, `npm test` |
| `database/` | `npm test` |
| `packages/contracts/` | `npm run lint` |

## 6. Preparación para producción — pendiente

| Tema | Estado |
|---|---|
| Hosting del backend con WebSocket persistente | Pendiente (D-19: Render, Railway, Fly o VPS universitario) |
| Hosting del frontend | `vercel.json` raíz solo define cabeceras de seguridad; el proyecto Vercel debe usar `frontend/` como directorio raíz. Sin configurar |
| Mismo sitio registrable para frontend y API | Necesario: la cookie de refresh es `SameSite=Strict` |
| Contenedores | No hay Dockerfiles: Docker no está disponible en la máquina de esta revisión y el destino no está decidido. Se crean junto con D-19 |
| Health check | `GET /api/v1/health` (503 si falta PostgreSQL o Redis) |
| Logging | `morgan('dev')` + consola. Falta logging estructurado sin datos personales |
| Errores | Sobre canónico; los 500 no exponen detalle técnico (`core/http/errors.ts`) |
| Migraciones | Paso manual con volcado previo; nunca automático en el arranque |
| Rollback de aplicación | Redesplegar el artefacto anterior; compatible solo si la migración aplicada fue *expand* |
| Recuperación de datos | Sin respaldo definido ni restauración probada ([05-database.md](../architecture/05-database.md) §6) |
| Protección de ramas | Requiere permisos de administración en GitHub (D-13): exigir el workflow `CI` en `dev` y `main` |
| Despliegue automático | **No se configura.** Todo despliegue requiere autorización del líder |
