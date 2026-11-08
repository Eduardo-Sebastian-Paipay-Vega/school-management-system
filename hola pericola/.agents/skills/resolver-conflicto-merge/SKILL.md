---
name: resolver-conflicto-merge
description: Resuelve un conflicto de merge o rebase de Git de forma segura y verificada. Se invoca manualmente cuando el usuario pide /resolver-conflicto-merge o $resolver-conflicto-merge; nunca se dispara sola y exige confirmación antes de crear el commit.
---

# Resolver conflictos de merge con Codex

Esta es la adaptación independiente para Codex de la skill equivalente ubicada
en `.claude/skills/`. No leas, edites, muevas ni elimines la versión de Claude
durante este flujo.

## Límites

- Diagnosticar, respaldar y validar no autoriza crear el commit, hacer push ni
  abortar el merge o rebase.
- Pide confirmación explícita antes de crear el commit de merge.
- No hagas push salvo solicitud expresa del usuario.
- Si hay un diálogo de merge de JetBrains abierto, indica al usuario que lo cierre
  con **Cancel**, nunca con **Apply Changes**, para que no sobrescriba la resolución.
- No elijas `ours` o `theirs` a ciegas: entiende y combina los cambios correctos
  de ambos lados.

## Flujo

### 1. Diagnosticar

Ejecuta:

```powershell
git status
git diff --name-only --diff-filter=U
Test-Path .git/MERGE_HEAD
Test-Path .git/rebase-merge
Test-Path .git/rebase-apply
```

Confirma si hay merge o rebase en curso y enumera únicamente los archivos con
conflictos reales.

### 2. Respaldar y materializar los marcadores

Antes de reescribir cada archivo, crea un directorio temporal seguro con
`New-Item` bajo `[System.IO.Path]::GetTempPath()` y guarda allí una copia mediante
`Copy-Item -LiteralPath`. Comunica al usuario la ubicación del respaldo.

Después, para cada archivo en conflicto:

```powershell
git checkout --conflict=merge -- <archivo>
rg -n "<<<<<<<|>>>>>>>|^=======$" <archivo>
```

No uses variables o carpetas exclusivas de Claude.

### 3. Resolver cada hunk

- Lee `ours` y `theirs` y determina la intención de cada cambio.
- Conserva de cada lado únicamente lo que siga siendo correcto y esté en uso.
- Elimina los marcadores y evita dejar imports, llamadas o símbolos huérfanos.
- Respeta las convenciones y la documentación vigente del repositorio.

### 4. Verificar

Comprueba que no queden marcadores ni conflictos:

```powershell
rg -n "<<<<<<<|>>>>>>>|^=======$" <archivo>
git diff --name-only --diff-filter=U
```

Busca usos reales de imports o símbolos dudosos con `rg`. Luego ejecuta los
checks proporcionales a la capa afectada:

- Backend: `python manage.py check` desde `BACKEND/` y las pruebas del módulo.
- Frontend: `npx ng build --configuration development` desde `frontend/`.

Consulta `docs/desarrollo/CODING_STANDARDS.md` para elegir validaciones
adicionales.

### 5. Cerrar el merge o rebase

Solo después de mostrar el resultado de las validaciones y obtener confirmación:

```powershell
git add -- <archivos-resueltos>
git commit --no-edit
```

Los commits de merge conservan el mensaje predeterminado de Git conforme a
`docs/desarrollo/COMMIT_CONVENTION.md`. Finaliza mostrando `git status` y
`git log --oneline -3`.

Si el usuario decide cancelar, explica primero el efecto de `git merge --abort`
o `git rebase --abort` y ejecútalo solo con su autorización explícita.

## Checklist

- [ ] No quedan rutas sin fusionar.
- [ ] No quedan marcadores de conflicto.
- [ ] No quedan imports ni símbolos huérfanos.
- [ ] Los checks y pruebas relevantes pasan.
- [ ] El commit se creó únicamente tras confirmación.
- [ ] No se hizo push sin solicitud expresa.
- [ ] La skill original de `.claude/skills/` permaneció intacta.
