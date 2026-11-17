# Historial SDD — `transversal_plataforma` (Base Compartida, BD, Contratos e Infra)

**Alcance:** Infraestructura transversal, migraciones compartidas, contratos OpenAPI globales, cliente/tema UI compartido, seguridad de transporte, CI/CD y reglas del repositorio (`RNF-01`–`RNF-20`).

## Rutas reales conectadas
- **Frontend compartido:** `frontend/modules/shared/{api,prime}/`, `frontend/components/`, `frontend/app/{layout.tsx,globals.css}`, `frontend/tailwind.config.ts`
- **Backend compartido:** `backend/src/{app.ts,server.ts}`, `backend/src/config/`, `backend/src/core/`, `backend/src/routes/health.routes.ts`
- **Base de datos:** `database/{migrations,scripts,tests}/`
- **Contratos API:** `packages/contracts/`
- **Infraestructura y reglas:** `.github/workflows/ci.yml`, `docker-compose.yml`, `vercel.json`, `AGENTS.md`, `.agents/rules/`

## Expedientes registrados
- `BASELINE` (2026-11-16): Adopción inicial de `SDD_VERSIONES/` — ver [`../../README.md`](../../README.md) y [`../../TRAZABILIDAD.md`](../../TRAZABILIDAD.md).
