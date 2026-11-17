# Matriz Maestra de Trazabilidad de Cambios (TRAZABILIDAD.md)

Registro acumulativo que conecta cada cambio importante (`SDD-YYYY-NNN`) con su versión, módulo real, requisitos (`RF`/`RNF`/`CU`), archivos modificados, pruebas ejecutadas, commit en Git y método de reversión.

> [!IMPORTANT]
> **Regla de integridad:** agregar una fila al registrar cada nuevo `SDD-YYYY-NNN` (Paso 7). Nunca borrar ni sobrescribir filas históricas.

---

## 1. Registro Cronológico de Cambios

| ID Cambio | Fecha | Versión | Módulo | RF / RNF / CU | Descripción resumida | Expediente SDD | Archivos principales afectados | Pruebas y resultado real | Commit Git / Rama | Reversión segura (Git) |
|---|---|---|---|---|---|---|---|---|---|---|
| `BASELINE` | 2026-11-16 | `Sin liberar` | `transversal_plataforma` | Gobernanza SDD | Adopción permanente de `SDD_VERSIONES/` y persistencia en reglas de agentes | [`SDD_VERSIONES/README.md`](./README.md) | `SDD_VERSIONES/**`, `AGENTS.md`, `.agents/rules/sdd_rules.md` | Verificación estructural de rutas y coherencia documental | Base previa: `29498ae` (`feat/landing-secciones`) | `git revert <commit_adopcion>` (no destructivo) |

---

## 2. Próximo Identificador Disponible

- **Siguiente `ID_CAMBIO` a asignar:** `SDD-2026-001`
- **Convención:** incrementar secuencialmente (`SDD-2026-001`, `SDD-2026-002`, ...) por cada cambio importante registrado bajo esta política.
