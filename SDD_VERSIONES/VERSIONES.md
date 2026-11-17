# Control de Versiones del Sistema (VERSIONES.md)

Este documento mantiene el inventario real de versiones del monorepo y las reglas de incremento semántico (`MAJOR.MINOR.PATCH`).

---

## 1. Estado Real de Versiones en el Repositorio

> Verificado directamente en los manifiestos del repositorio al adoptar `SDD_VERSIONES/` (rama actual: `feat/landing-secciones`, commit base `29498ae`, estado general del proyecto: **EN DESARROLLO** según [`docs/project-health/AVANCE_2026-11-16.md`](../docs/project-health/AVANCE_2026-11-16.md)).

| Componente / Paquete | Archivo fuente | Versión declarada | Tags Git existentes | Estado |
|---|---|---:|---|---|
| Frontend Next.js | [`frontend/package.json`](../frontend/package.json) | `0.1.0` | Ninguno | En desarrollo |
| Contratos OpenAPI | [`packages/contracts/package.json`](../packages/contracts/package.json) / [`openapi.yaml`](../packages/contracts/openapi/openapi.yaml) | `0.1.0` | Ninguno | En desarrollo (Core) |
| Backend Común | [`backend/package.json`](../backend/package.json) | `1.0.0` | Ninguno | En desarrollo |
| Servicio M8 (Calificaciones) | [`backend/squad_3_calificaciones/package.json`](../backend/squad_3_calificaciones/package.json) | `1.0.0` | Ninguno | En desarrollo |
| Base de Datos (Migraciones) | [`database/package.json`](../database/package.json) | `1.0.0` | Ninguno | En desarrollo |

**Versión global unificada del producto:** aún no cuenta con release publicado ni etiqueta Git (`git tag -l` vacío). La línea base de trabajo se identifica como **`[Sin liberar / Unreleased]`** sobre la serie inicial **`0.1.0` (pre-piloto)** hasta que exista un corte formal aprobado hacia `main`.

---

## 2. Reglas de Versionado Semántico (SemVer)

Al consolidar un cambio importante (`SDD-YYYY-NNN`), se clasifica su impacto sobre el componente o versión global:

- **MAJOR (`X.0.0`):** cambios estructurales incompatibles, ruptura de contrato OpenAPI `/api/v1`, cambio incompatible de esquema BD o reemplazo arquitectónico mayor.
- **MINOR (`0.X.0`):** incorporación de un nuevo módulo o funcionalidad (`RF-*`) compatible con contratos y datos existentes.
- **PATCH (`0.0.X`):** corrección de errores, parches de seguridad, mejoras de rendimiento o ajustes compatibles sin nuevas capacidades mayores.

### Reglas operativas
1. **No crear versiones ficticias:** no incrementar `package.json` ni crear etiquetas `vX.Y.Z` sin un cambio real verificado que lo justifique.
2. **Separar ID documental de versión:** un expediente `SDD-2026-001` puede formar parte de `[Sin liberar / Unreleased]` o agruparse junto con otros cambios en una futura versión `v0.2.0` / `v1.0.0`.
3. **Releases publicados:** solo se registra una entrada en `SDD_VERSIONES/RELEASES/` cuando hay:
   - Aprobación explícita del líder/usuario.
   - Evidencia real de QA (`lint`, `build`, `test` aprobados).
   - Commit de corte y/o etiqueta Git autorizada.

---

## 3. Historial de Versiones Consolidadas

| Versión | Estado | Fecha / Corte | Referencia Git | Expedientes SDD incluidos | Notas |
|---|---|---|---|---|---|
| `Sin liberar (Línea base SDD)` | En desarrollo | 2026-11-16 | `29498ae` (`feat/landing-secciones` desde `dev` `bdd2fe6`) | Baseline inicial | Adopción del sistema `SDD_VERSIONES/`. Sin release publicado. |
