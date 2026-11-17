# Historial de Cambios del Proyecto (CHANGELOG.md)

Formato basado en *Keep a Changelog* y Versionado Semántico, integrado con los identificadores `SDD-YYYY-NNN` de `SDD_VERSIONES/`.

> [!NOTE]
> Este archivo es **acumulativo y solo de adición cronológica**. No se eliminan ni reescriben versiones o registros anteriores.

---

## [Sin liberar / Unreleased] — Línea de desarrollo activa

### Agregado (Infraestructura documental y gobernanza)
- **Control interno de versiones SDD (`SDD_VERSIONES/`):** Establecimiento permanente del sistema de trazabilidad y control de cambios con SDD conectado al repositorio real y a Git.
  - Documentos centrales: `README.md`, `CHANGELOG.md`, `VERSIONES.md`, `MAPA_MODULOS.md`, `TRAZABILIDAD.md`.
  - Plantillas operativas: `SPEC.md`, `PLAN.md`, `TASKS.md`, `IMPLEMENTACION.md`, `TESTING.md`, `RELEASE.md`.
  - Carpetas por módulos reales (`MODULOS/squad_1_core`, `squad_2_asistencia`, `squad_3_calificaciones`, `squad_4_analitica`, `squad_5_secretaria`, `transversal_plataforma`) y `RELEASES/`.
  - Persistencia en [`AGENTS.md`](../AGENTS.md) (§ 8) y referencia cruzada en [`.agents/rules/sdd_rules.md`](../.agents/rules/sdd_rules.md).
  - **Base Git verificada al momento de adopción:** rama `feat/landing-secciones`, commit `29498ae` (integrando `dev` `bdd2fe6`).

---

## Línea Base Histórica Previa en Git (Referencia verificable sin expediente SDD previo)

Los siguientes hitos ya existían en el historial de Git del repositorio **antes** de la adopción de `SDD_VERSIONES/` (se listan únicamente como contexto de partida comprobado en `git log`, sin inventar expedientes SDD retroactivos):

- **`29498ae` / `b6a4ea0` / `26acaa5`:** Actualización de secciones/páginas del portal web (`frontend/modules/landing/`, `frontend/app/(landing)/`) y ajuste de artefactos/plataforma Flutter en `.gitignore`.
- **`4c8c58e` (`9efa31f`):** Integración inicial de rutas de backend para Squads 2–5 (`academics.routes.ts`, `attendance.routes.ts`, `curriculum.routes.ts`, `analytics.routes.ts`, `documents.routes.ts`, `grades.routes.ts`, `portal.routes.ts`), soporte SSL en `config/database.ts` y pruebas `backend/tests/squads-endpoints.test.cjs`.
- **`bdd2fe6` (`9ecdf1c`, `8d4dc5b`, `f3c29a9`):** Reconstrucción de identidad cromática institucional borgoña en landing y actualización de evidencia de Sprint 8 (`docs/project-health/AVANCE_2026-11-16.md`).
- **Sprints 1–8 del Core y M8:** Construcción del Core de Squad 1 (`auth`, `users`, `school`, `guardians`, `notifications`, `audit`), migraciones SQL versionadas en `database/migrations/`, contratos OpenAPI en `packages/contracts/` y servicio independiente M8 en `backend/squad_3_calificaciones/`.
