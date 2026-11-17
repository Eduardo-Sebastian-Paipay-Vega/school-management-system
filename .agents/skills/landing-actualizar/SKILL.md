---
name: landing-actualizar
description: Actualiza la documentación del sistema visual público cuando el usuario cambia deliberadamente el landing de referencia, sin rediseñar el sistema interno.
disable-model-invocation: true
---

# /landing-actualizar

1. Carga el contrato `landing-design-guardian`, `scope.json`, y el diseño maestro anterior.
2. Verifica que el usuario solicitó cambiar conscientemente el diseño maestro, no solo uniformizar otra página.
3. Conserva copia/versionado de los artefactos maestros anteriores dentro de `.claude/landing-design/history/` (sin datos personales ni secretos).
4. Vuelve a medir código y navegador como en `/landing-recopilar`; difiere valores declarados vs computados y genera resumen de cambios en `CHANGELOG.md`.
5. Actualiza `DESIGN.md`, `TOKENS.json` y `COMPONENTS.md` con fuentes y mediciones actuales; indica cuáles páginas públicas están desfasadas.
6. No sincronices páginas ni modifiques producción aquí: eso corresponde a `/landing-auditar` y `/landing-aplicar`.
