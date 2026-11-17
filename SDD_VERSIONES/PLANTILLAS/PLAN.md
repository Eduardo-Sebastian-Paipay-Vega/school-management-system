# Plan Técnico de Implementación — `[ID_CAMBIO: SDD-YYYY-NNN]`

> Copiar este archivo como `SDD_VERSIONES/MODULOS/<modulo>/<ID_CAMBIO>/PLAN.md` en el **Paso 3**.

## 1. Estrategia Técnica (Cómo se realizará)

Explicar el diseño del cambio respetando la arquitectura real del proyecto:
- Frontend: Feature-First en `frontend/modules/squads/...` o `shared/`, tokens de `globals.css` / `tailwind.config.ts`, protocolo `primereact-guardian` si toca UI.
- Backend: flujo `routes -> service -> repository` (o estructura vigente del Core / M8), aislamiento `withTenant()`, sobres JSON de ADR-005.
- Datos: nuevas migraciones en `database/migrations/` con `tenant_id` y RLS si aplica (ADR-004).
- Contratos: actualización previa en `packages/contracts/openapi/` si hay cambios de API (ADR-005).

---

## 2. Dependencias e Impacto Cruzado

- **Depende de:** `[módulos, servicios internos, decisiones D-XX o migraciones previas]`
- **Impacta a:** `[otros squads, endpoints, vistas o scripts de CI]`

---

## 3. Riesgos y Mitigación

| Riesgo | Probabilidad / Impacto | Mitigación |
|---|---|---|
| `[Ej. ruptura de contrato OpenAPI]` | Media / Alta | `[Validar con redocly lint y pruebas de integración]` |

---

## 4. Plan de Pruebas Previsto

- Comandos de verificación a ejecutar en el Paso 5 (sin inventar resultados por adelantado):
  - `[ej. cd frontend && npm run lint && npm run build]`
  - `[ej. cd backend && npm run lint && npm test]`
  - `[ej. cd database && npm test]`
  - `[ej. cd packages/contracts && npm run lint]`

---

## 5. Estrategia de Reversión en Git (Obligatoria)

- **Commit base antes del cambio:** `<git rev-parse --short HEAD>`
- **Reversión no destructiva recomendada:**
  - Si ya fue confirmado en un commit: `git revert <commit_hash>`
  - Si se requiere restaurar archivos puntuales antes de confirmar: `git restore --source <commit_base> -- <ruta_archivo>`
  - Si incluye migración SQL: documentar el script de rollback / migración compensatoria (ADR-004 prohíbe editar migraciones ya aplicadas).
- **Restricción:** prohibido ejecutar automáticamente `git reset --hard`, `git push --force` o borrar ramas.
