# Acta de Release — `[vX.Y.Z]`

> Guardar en `SDD_VERSIONES/RELEASES/vX.Y.Z.md` **únicamente** cuando exista aprobación explícita, evidencia real de pruebas y etiqueta Git autorizada.

## 1. Datos del Release

| Campo | Valor |
|---|---|
| **Versión SemVer** | `vX.Y.Z` |
| **Tipo** | `MAJOR` \| `MINOR` \| `PATCH` |
| **Fecha de aprobación** | `YYYY-MM-DD` |
| **Rama origen / destino** | `dev` → `main` |
| **Commit / Tag Git** | `[hash]` / `vX.Y.Z` |
| **Aprobado por** | `[Líder de Proyecto / Responsable]` |

---

## 2. Expedientes SDD Incluidos

| ID Cambio | Módulo | Resumen | Enlace |
|---|---|---|---|
| `SDD-YYYY-NNN` | `[modulo]` | `[resumen]` | `../MODULOS/<modulo>/SDD-YYYY-NNN/` |

---

## 3. Puertas de Calidad Verificadas

- [ ] CI en GitHub Actions (`.github/workflows/ci.yml`) en verde.
- [ ] `frontend`: `npm run lint`, `npm run build` y auditor PrimeReact aprobados.
- [ ] `backend`: `npm run lint`, `npm test` (y `squad_3_calificaciones` si aplica) aprobados.
- [ ] `database`: `npm test` aprobado y migraciones verificadas.
- [ ] `packages/contracts`: `npm run lint`, `check:inventory`, `check:generated` aprobados.

---

## 4. Procedimiento de Rollback del Release

1. No reescribir `main` ni borrar historial.
2. Evaluar reversión mediante `git revert` sobre el merge o tag afectado, y verificar restauraciones de base de datos antes de desplegar una versión de parche (`vX.Y.(Z+1)`).
