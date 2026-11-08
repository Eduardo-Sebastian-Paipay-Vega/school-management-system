---
name: mejorar-vista-fija
description: Aplica el patrón "vista fija" a una pantalla Angular con una p-table — el buscador/filtros, la cabecera de la tabla y el paginador quedan siempre visibles, sin que la página completa scrollee; solo las filas scrollean. Funciona con o sin p-tabs. Se invoca manualmente (/mejorar-vista-fija) sobre el componente que el usuario indique (o el abierto en el IDE / mencionado en el chat) — nunca se dispara sola. Requiere confirmación visual del usuario al final porque el agente no puede abrir un navegador.
---

# Mejorar vista fija — tabla sin scroll de página

Automatiza el patrón documentado en `frontend/.claude/skills/frontend-standards/SKILL.md`, sección **"Vista fija: ninguna tabla debe scrollear la página completa (con o sin tabs)"** — esa sección es la fuente de verdad del *por qué* de cada paso; esta skill es el *cómo* aplicarlo sin reinventar la cadena de CSS cada vez. Nació resolviendo `components/ventas/ordenes-compra/ordenes-compra.html` (tab "Control de Órdenes de Compra"), tras dos intentos fallidos a mano (`height: 100%` en un eslabón sin altura definida, y reimplementar `.p-datatable-flex-scrollable` en vez de usar `scrollHeight="flex"`) — de ahí que esta skill exista: para no repetir esos mismos dos errores en la próxima pantalla.

## Paso 0 — Identificar el componente objetivo

- Si el usuario nombró un componente o pantalla, usar ese.
- Si no, usar el archivo abierto en el IDE o el mencionado más recientemente en la conversación.
- Si hay ambigüedad real (más de un candidato razonable y ninguna pista clara), preguntar antes de tocar nada.

Leer los tres archivos del componente (`.ts`, `.html`, `.scss`) antes de editar — no asumir la estructura por el nombre.

## Paso 1 — Diagnosticar la pantalla

Del `.ts`: el `selector` del componente (es el host real que Angular inserta en el DOM — ver por qué importa en el paso 3).

Del `.html`, identificar:
- **¿Tiene `p-tabs`/`p-tabpanel`?** Si sí, ¿cuántos tabs tienen una `p-table` adentro? Si el usuario no especificó cuál arreglar y hay varios, preguntar cuál(es) — igual que ya se decidió en `ordenes-compra.html` (arreglar "Control de Órdenes de Compra" y dejar los otros dos tabs sin tocar, a pedido explícito del usuario en esa sesión). No asumir "todos".
- **El bloque de buscador/filtros** que va antes de la tabla (el que debe quedar con alto natural, `flex-shrink: 0`).
- **El wrapper de la `p-table`**: ¿ya tiene la clase global `.tabla-scroll`? Si no la tiene, agregarla primero (ver sección "Tablas: cabecera y paginador fijos" de `frontend-standards/SKILL.md`) — este patrón se construye ENCIMA de `.tabla-scroll` + `[scrollable]="true"`, no lo reemplaza.
- **¿El `<p-table>` ya tiene `[paginator]="true"`?** Si no tiene paginador, igual aplica el patrón (la cabecera fija sigue siendo válida), pero avisar al usuario que no hay paginador que "aparezca".

Del `.scss`: si el componente ya tiene un `:host { ... }`, no pisarlo — fusionar `display: flex; flex-direction: column; height: 100%; min-height: 0;` con lo que ya haya (conservando cualquier otra propiedad existente).

## Paso 2 — Nombrar las clases nuevas siguiendo la convención del componente

Sin tabs, normalmente no hacen falta clases nuevas (el `<div>` raíz y `.tabla-scroll` ya existen). Con tabs, se necesitan dos clases propias del componente — nombrarlas siguiendo el patrón `kebab-case` del selector, mismo criterio que `ordenes-compra-panel-principal`/`ordenes-compra-tabla`:
- `<nombre-componente>-panel-principal` en el `<p-tabpanel>` del tab a arreglar.
- `<nombre-componente>-tabla` junto a `.tabla-scroll` en el wrapper de la tabla (para el override de `max-height` con especificidad garantizada).

## Paso 3 — Aplicar la cadena de CSS

Seguir exactamente los pasos 1-5 de la sección "Vista fija" de `frontend-standards/SKILL.md` (host → raíz → tabs si aplica → panel → tabla), copiando los bloques `scss` de ahí. Puntos que se repiten como error si se hacen a mano sin esta skill — verificarlos explícitamente antes de dar el paso por terminado:

- [ ] `:host` tiene `height: 100%` (el único porcentaje permitido en toda la cadena) — no se agregó `flex: 1` en su lugar (su padre real, `.shell-content`, no es flex).
- [ ] Todo lo demás (raíz, `p-tabs`, `p-tabpanels`, el panel objetivo, el wrapper de la tabla) usa `flex: 1` + `min-height: 0`, nunca `height: 100%`.
- [ ] Si hay tabs, **solo** el panel objetivo lleva la clase `-panel-principal`; los demás `p-tabpanel` de la misma pantalla quedan intactos.
- [ ] `p-tabpanels` NO lleva `overflow: hidden`.
- [ ] El `<p-table>` tiene `[scrollable]="true"` **y** `scrollHeight="flex"` (string plano, sin corchetes) — sin el segundo, `.p-datatable` no crece de verdad y queda el hueco en blanco clásico de este bug.
- [ ] El override de `max-height: none` sobre `.p-datatable` usa las DOS clases del wrapper juntas (`.tabla-scroll.<nombre>-tabla`) para garantizar especificidad, no solo una.
- [ ] No se tocó la regla global `.tabla-scroll` en `styles.scss` — el ajuste es siempre local al componente.
- [ ] No se agregó `scrollbar-gutter`, `scrollbar-width` ni `::-webkit-scrollbar` local: el scrollbar vertical de toda `.tabla-scroll` es global (trazo flotante, `shared/utils/scrollbar-tablas.ts`, ver "Tablas: scrollbar vertical flotante" en `frontend-standards`). Si la tabla nueva no lo muestra, primero revisar que su contenedor sea `.tabla-scroll` con `.p-datatable-table-container` — no crear otro.

## Paso 4 — Verificación visual (obligatoria, la hace el usuario)

El agente no puede abrir la app real (login + backend), pero sí puede comprobar el CSS con una réplica estática y Chrome headless — ver "Verificación visual sin la app real" en `frontend-standards/SKILL.md`. Ni eso reemplaza la confirmación del usuario. Al terminar, pedirle explícitamente que recargue y confirme:
1. Tabs (si aplica), buscador/filtros, cabecera de columnas y paginador siguen visibles sin scrollear la página.
2. La tabla usa el espacio disponible completo (sin hueco en blanco entre las filas y el paginador).
3. Los tabs que no se tocaron (si los hay) siguen comportándose igual que antes.

Si algo falla, el primer sospechoso es casi siempre uno de los dos bugs ya conocidos: un `height: 100%` colado en vez de `flex: 1`, o `scrollHeight="flex"` faltante — repasar el checklist del Paso 3 antes de intentar nada nuevo.
