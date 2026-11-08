---
name: resolver-conflicto-merge
description: Resuelve un conflicto de merge/rebase de git de forma segura y verificada, sin depender del diálogo "Merge Revisions" de DataGrip/PyCharm (que no se puede manejar por MCP y confunde con sus colores — gris = decidir, no borrar). Materializa los marcadores de conflicto con git, resuelve cada hunk quedándose con lo correcto de CADA lado (no "izquierda o derecha a ciegas"), verifica con grep que no queden imports/símbolos muertos, y valida con los checks del proyecto antes de cerrar el merge. Se invoca manualmente (/resolver-conflicto-merge) cuando hay un conflicto de merge en curso (git reporta "unmerged paths" o aparece el diálogo de merge de JetBrains) — nunca se dispara sola. Pide confirmación antes de crear el commit de merge.
---

# Resolver conflicto de merge (sin pelear con el GUI de JetBrains)

Nació el 2026-10-02 resolviendo un conflicto en `BACKEND/catalogo_electronico/views.py` tras un `git merge` de `origin/dev`: el usuario tenía abierto el diálogo "Merge Revisions" de DataGrip y se confundió con los colores (pensó que el bloque **gris/plomo** era una eliminación, cuando en realidad es "hay dos versiones, decide tú"). Esta skill evita ese diálogo y resuelve con git, que es verificable y no se puede estropear por un clic equivocado.

## Contexto que hay que entender primero

- **Por qué hay conflicto:** solo cuando dos ramas modifican EXACTAMENTE las mismas líneas de un archivo. Si los cambios están en lugares distintos, git fusiona solo. Por eso un merge de decenas de archivos puede tener conflicto en uno solo. No es un error: es trabajo paralelo sobre lo mismo.
- **El diálogo de JetBrains NO se puede manejar por MCP** (es una ventana interactiva del IDE). Si el usuario lo tiene abierto, pedirle que le dé
- **Cancel** (NUNCA "Apply Changes"), para que no pise la resolución hecha con git.
- **Colores del diálogo (para explicárselo si pregunta):** 3 paneles — Izquierda = rama actual, Derecha = lo que entra, Centro = Result.
- **Bloque gris = conflicto a decidir, no borrado. Rojo/tachado = líneas que se quitan. `»`/`«` (Accept Left/Right) = meter ese lado al Result. `✕` = descartar ese cambio (no borra el código para siempre).**

## Flujo

### 1. Diagnosticar el estado
```bash
git status
test -f .git/MERGE_HEAD && echo "MERGE en curso: $(cat .git/MERGE_HEAD)" || echo "no merge"
test -d .git/rebase-merge -o -d .git/rebase-apply && echo "REBASE en curso" || echo "no rebase"
git diff --name-only --diff-filter=U   # archivos realmente en conflicto
```
Confirmar cuántos archivos están en conflicto (suelen ser muchos menos de los que el GUI sugiere).

### 2. Materializar los marcadores (si el GUI los oculta)
JetBrains maneja el conflicto en su GUI sin escribir marcadores al disco. Para verlos y resolver con git, por cada archivo en conflicto:
```bash
cp <archivo> "$CLAUDE_SCRATCHPAD/<basename>.bak"   # respaldo primero
git checkout --conflict=merge -- <archivo>          # reescribe con <<<<<<< ours / ======= / >>>>>>> theirs
grep -nE "<<<<<<<|>>>>>>>|^=======$" <archivo>       # ubicar los hunks
```

### 3. Resolver cada hunk — lo correcto de CADA lado, no "aceptar un lado entero"
- Leer ambas versiones de cada hunk (`ours` = rama actual, `theirs` = lo que entra).
- **No elegir ciegamente izquierda o derecha.** Entender QUÉ cambió cada lado y por qué. Caso típico real: un lado agrega imports/código nuevo y el otro los quita porque refactorizó y eliminó el código que los usaba → la resolución correcta mezcla: conservar lo que tu rama agregó y que sigue en uso, y adoptar las eliminaciones del otro lado de lo que ya no existe.
- Editar el archivo quitando los marcadores y dejando el resultado final.

### 4. Verificar que no quede nada muerto ni roto
Clave para no dejar imports/símbolos huérfanos tras mezclar:
```bash
# ¿quedó algún marcador?
grep -nE "<<<<<<<|>>>>>>>|^=======$" <archivo>
# por cada import/símbolo dudoso, contar usos reales (1 = solo la línea de import → muerto)
grep -nE "\b<simbolo>\b" <archivo>
```
Quitar los imports que quedaron sin uso real. Luego correr los checks del proyecto:
- Backend (Django): `cd BACKEND && python manage.py check` y los tests del módulo tocado (ver `docs/docy/TESTS/` o la app afectada).
- Frontend (Angular): `cd frontend && npx ng build --configuration development`.

Ver `docs/desarrollo/CODING_STANDARDS.md` para qué validar según la capa.

### 5. Cerrar el merge (pedir confirmación antes)
```bash
git add <archivos-resueltos>
git commit --no-edit    # los commits de merge llevan el mensaje por defecto de Git
```
Regla de `docs/desarrollo/COMMIT_CONVENTION.md` (regla 9): **los commits de merge dejan el mensaje por defecto de Git** (`Merge branch ...`), no se fuerza el formato `tipo(módulo)`.

Confirmar al final: `git status` limpio y `git log --oneline -3`. **No hacer push** salvo que el usuario lo pida (ver `GIT_WORKFLOW.md` / skill `update-main-staging`).

## Salida de emergencia
Si algo se complica o el usuario prefiere empezar de cero: `git merge --abort` (o `git rebase --abort`) deja todo exactamente como estaba antes del merge, sin riesgo.

## Checklist antes de dar por resuelto
- [ ] `git diff --name-only --diff-filter=U` ya no devuelve nada.
- [ ] No quedan marcadores `<<<<<<< / ======= / >>>>>>>` en ningún archivo.
- [ ] No quedan imports/símbolos sin uso tras la mezcla (verificado con grep).
- [ ] `manage.py check` / build del frontend OK, y los tests del módulo afectado pasan.
- [ ] El commit de merge se creó con el mensaje por defecto, con confirmación del usuario.
- [ ] Se le recordó al usuario cerrar el diálogo de JetBrains con Cancel si estaba abierto.
