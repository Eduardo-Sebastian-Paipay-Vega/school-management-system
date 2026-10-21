# Compuertas de calidad (fase G5)

Ejecutar en este orden y registrar el resultado literal de cada una.

| # | Compuerta | Comando / acción | Aprobado si |
| --- | --- | --- | --- |
| Q1 | Diff releído | `git diff -- frontend/` (y archivos nuevos con `git status`) | Cada hunk se explica por un Rn; nada fuera de alcance (lógica, servicios, backend, textos) |
| Q2 | Auditor de imports | `py -I .claude/skills/primereact-guardian/scripts/audit_primereact.py frontend` (o `python3 -I …`) | Sin `ERROR`; cada `AVISO` justificado |
| Q3 | Lint | `npm run lint` en `frontend/` | 0 errores |
| Q4 | Build/typecheck | `npm run build` en `frontend/` | Compila sin errores TS |
| Q5 | Requisitos | Recorrer la matriz G0 | Cada Rn tiene evidencia concreta (archivo:línea o captura) |
| Q6 | Visual | Navegador del entorno: abrir la ruta afectada a ~360, ~768 y ~1280 px | Sin desbordes, solapes ni texto ilegible; estados vacíos/carga/error revisados cuando sea posible |
| Q7 | Teclado/foco | Tab, Enter, Esc y flechas en los controles tocados | Foco visible y orden lógico |

## Reglas de reporte

- `NO EJECUTADA` ≠ aprobada. Si falta Python, navegador, backend o datos, decirlo y marcar el Rn como `NO VERIFICABLE` o `PARCIAL`.
- Si una compuerta falla por un problema preexistente (no introducido por el cambio), demostrarlo (el error apunta a un archivo no modificado, o aparece igual en `git show HEAD:<archivo>`) y reportarlo aparte, sin usar `git stash` ni descartar cambios del usuario.
- El auditor solo revisa imports y versión: no valida JSX, props ni UX. No citarlo como prueba de esas cosas.
- Q4 puede tardar; ejecutarlo en segundo plano si supera ~2 minutos.
