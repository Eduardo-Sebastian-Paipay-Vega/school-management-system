# Registro de Implementación — `[ID_CAMBIO: SDD-YYYY-NNN]`

> Completar este archivo en `SDD_VERSIONES/MODULOS/<modulo>/<ID_CAMBIO>/IMPLEMENTACION.md` durante los **Pasos 4 y 6**.

## 1. Resumen de lo Implementado

Describir con precisión técnica cómo se implementó el cambio (solo comportamiento realmente verificado en el código editado).

---

## 2. Archivos Modificados, Creados o Eliminados

| Acción | Ruta real del archivo | Detalle del cambio |
|---|---|---|
| Modificado / Creado | `ruta/real/desde/raiz` | Descripción puntual de lo cambiado |

---

## 3. Decisiones Técnicas y Notas de Integración

- Decisiones tomadas durante la implementación (compatibilidad, RLS, validación, tokens, rendimiento).
- Si se actualizó algún documento canónico (`docs/architecture/`, `docs/requirements/`, `sdd_squad_X.md`), enlazarlo aquí.

---

## 4. Referencias Git y Recuperación

| Campo | Valor observado |
|---|---|
| **Rama** | `[nombre_rama]` |
| **Commit previo (base)** | `[hash_base]` |
| **Commit del cambio** | `[hash_commit o "Pendiente de commit local"]` |
| **Comando de comparación** | `git diff <hash_base> <hash_commit_o_HEAD> -- <rutas>` |
| **Comando de reversión segura** | `git revert <hash_commit>` (o restauración selectiva sin operaciones destructivas) |
