---
name: landing-aplicar
description: Uniformiza exclusivamente las páginas públicas autorizadas siguiendo tokens y componentes medidos del landing, con control de archivos y verificación del impacto.
disable-model-invocation: true
---

# /landing-aplicar

Carga `.claude/skills/landing-design-guardian/SKILL.md`, `scope.json`, `DESIGN.md`, `TOKENS.json`, `COMPONENTS.md`, `PAGE-INVENTORY.md` y `AUDIT.md`.

## Puertas de seguridad

- Si `allowedSourcePaths` está vacío, DETENERSE: no hay autorización técnica de archivos. Explicar el árbol detectado y proponer allowlist conservador. No seleccionar carpetas globales por conveniencia.
- Si no hay diseño de referencia trazable, volver a `/landing-recopilar` y no aplicar.
- Antes de editar, registrar estado de Git y diferencias preexistentes; ejecutar `node .claude/skills/landing-design-guardian/scripts/guard-changes.mjs snapshot`. Documentar cualquier limitación.
- No cambiar archivos protegidos ni lógica interna. No sobrescribir modificaciones del usuario.

## Aplicación

1. Establecer correspondencia uno-a-uno entre cada divergencia y archivos permitidos.
2. Preferir reutilizar componentes públicos existentes antes que crear duplicados. Preservar estructura semántica, textos, navegación y funcionalidades.
3. Centralizar tokens **solo si** no altera el área interna. Donde exista CSS global compartido, utilizar wrappers/namespace de marketing y reglas locales.
4. Aplicar cambios pequeños por grupo visual: tipografía → color/superficies → componentes → layout responsive → microinteracciones. No detenerse entre grupos salvo conflicto o ambigüedad que impida avanzar.
5. Mantener diferencias intencionales de composición entre páginas. No hacer un sitio de plantillas idénticas.
6. Ejecutar formato/lint/build/tests existentes y captura visual. Comparar landing referencia antes/después, y objetivos antes/después.
7. Ejecutar `node .claude/skills/landing-design-guardian/scripts/guard-changes.mjs verify`. Si falla, revisar la lista; revertir exclusivamente cambios introducidos por esta ejecución en archivos no autorizados.
8. Actualizar el informe `AUDIT.md` con resuelto/pendiente y la evidencia por página.

**Prohibiciones:** commits, pushes, deploys, ediciones de dashboard/login operativo/backend/API/BD, cambios de variables globales que afecten UI interna, nuevas dependencias sin necesidad demostrada.

**Salida:** archivos modificados, cambios visuales concretos, pruebas ejecutadas con resultados y pendientes. Nunca afirmar exactitud visual si no hay capturas verificadas.
