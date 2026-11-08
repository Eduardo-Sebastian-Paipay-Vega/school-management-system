---
name: actualizar-contexto
description: Revisa los cambios realizados en la sesión actual (o en el working tree) y propone actualizaciones a docs/arquitectura/contexto-proyecto.md y estructura-proyecto.md cuando corresponda. Se invoca manualmente (/actualizar-contexto) al terminar una sesión de trabajo con cambios relevantes de módulos, endpoints, carpetas o convenciones — nunca se ejecuta sola ni edita sin mostrar antes la propuesta al usuario.
---

# Actualizar contexto del proyecto

Esta skill existe porque `docs/arquitectura/contexto-proyecto.md` y `estructura-proyecto.md` son "documentos vivos" (así se autodefinen) que el resto del equipo — y cualquier sesión futura de Claude Code — usa como fuente de verdad **antes** de tocar código. Si se desactualizan, alguien vuelve a implementar algo que ya se hizo o asume mock donde ya hay datos reales (ver el caso real de Impresoras en `contexto-proyecto.md`, corregido el 2026-08-12 tras notar que la tabla llevaba tiempo desactualizada).

No es automática: no hay hook que la dispare. El usuario la invoca a propósito al cerrar una sesión de trabajo.

## Paso 1 — Reunir qué cambió

Ejecutar en paralelo:
- `git status` (para ver working tree, incluyendo no trackeados)
- `git diff HEAD` (cambios sin commitear, staged + unstaged)
- `git log --oneline -15` (commits recientes que tal vez ya no están reflejados en los docs)

Si el usuario indica un rango distinto (ej. "desde el último merge a main", "de esta rama completa"), usar `git diff main...HEAD` o el rango que corresponda en vez de `HEAD`.

## Paso 2 — Filtrar qué es "relevante" para documentar

`contexto-proyecto.md` y `estructura-proyecto.md` documentan **arquitectura y estado**, no cada línea de código. Es relevante:

- Un módulo/pantalla pasó de mock/placeholder a datos reales (o viceversa) — como el caso de Baterías y Accs. migrado a `EntregaOrdenOCAM` el 2026-08-12.
- Se agregó, eliminó o renombró una carpeta de primer/segundo nivel (`estructura-proyecto.md` lo pide explícitamente).
- Se agregó un modelo, serializer, ViewSet o endpoint nuevo, o se expuso uno que antes solo vivía en `/admin/`.
- Se resolvió (o se agregó) un punto de la sección "Problemas conocidos" / deuda técnica.
- Cambió una decisión de arquitectura ya documentada (ej. de qué app depende cuál, un contrato de API externo verificado en vivo, una regla de negocio).
- Se agregó/cambió una convención transversal (no solo de este archivo — también podría tocar `CODING_STANDARDS.md` o la skill `frontend-standards`, ver Paso 4).
- Se agregó o modificó un modal o pantalla en `frontend/` sin diseño responsivo. **Obligación para todo el sistema**: todo modal (`p-dialog`) y toda pantalla nueva o tocada debe funcionar en pantallas angostas — diálogo con `maxWidth` relativo al viewport (ej. `95vw`), grids que colapsen por `@media` (ver `formulario-suscripcion-alerta.scss` como referencia) y tablas anchas envueltas en un contenedor con `overflow-x: auto` (ver `ver-comparativa-*.scss`). Si al revisar el diff aparece un modal/pantalla sin esto, señalarlo al usuario aunque no se haya pedido explícitamente actualizar documentación.

**No** es relevante (ignorar sin mencionar, salvo que el usuario pregunte):
- Refactors internos sin cambio de comportamiento ni de estructura de carpetas.
- Fixes de bugs que no cambian una decisión documentada.
- Cambios de estilos, copy de UI, o ajustes menores de un componente ya documentado como "real".
- Renombrado de variables/funciones internas.

Ante la duda de si algo es lo bastante relevante, priorizar el criterio de la propia cabecera de `contexto-proyecto.md`: *"Actualizar esta guía cuando se agregue un módulo, se cambie de librería, o se resuelva algún punto de Problemas conocidos"*.

## Paso 3 — Proponer, no editar directo

Antes de tocar cualquier archivo, presentar al usuario una lista corta: qué sección de qué documento cambiaría y por qué (1 línea por punto). `CLAUDE.md` prohíbe recortar o simplificar documentación existente — esto aplica también a esta skill: **nunca eliminar contenido existente**, solo agregar, corregir estado, o actualizar una tabla.

Si no hay nada relevante que cambió, decirlo y no tocar nada.

## Paso 4 — Aplicar con el mismo tono y formato del documento

Al editar, imitar la convención ya usada en esos archivos (verificado leyéndolos, no asumido):
- Español, sin abreviar términos de dominio.
- Cuando una decisión tiene un "por qué" no obvio, documentarlo igual que el resto del archivo (ej. "Se decidió X en vez de Y porque...").
- Fechar afirmaciones verificadas en vivo cuando aplique, con el mismo formato ya usado (`Validado en vivo el YYYY-MM-DD`).
- Las tablas de estado de módulos (`contexto-proyecto.md` § "Módulos de negocio (sidebar)", `estructura-proyecto.md` § "mapa carpeta ↔ pantalla") se actualizan fila por fila, no se reescriben enteras.
- Si el cambio también afecta la convención de código Angular (no solo el estado de un módulo), señalar al usuario que además revise `frontend/.claude/skills/frontend-standards/SKILL.md` — esta skill no edita esa por su cuenta, son fuentes de verdad distintas.

## Paso 5 — No commitear

Esta skill solo edita documentación en el working tree. Generar el commit es un paso aparte y explícito, siguiendo `docs/desarrollo/COMMIT_CONVENTION.md` (formato `KAN-XX | tipo(módulo): descripción`) — no asumir que el usuario quiere commitear solo porque pidió actualizar el contexto.