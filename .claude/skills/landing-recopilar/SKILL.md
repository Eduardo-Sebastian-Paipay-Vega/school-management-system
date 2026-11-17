---
name: landing-recopilar
description: Recopila el diseño exacto del landing existente desde código y navegador y crea el documento maestro visual sin tocar componentes de producción.
disable-model-invocation: true
---

# /landing-recopilar

Carga primero `.claude/skills/landing-design-guardian/SKILL.md` y `.claude/landing-design/scope.json`.

## Misión

Descubrir la identidad **existente** del landing del repo, no proponer otra. Trabaja en modo lectura para archivos productivos.

1. Descubre framework, rutas y entrypoint, CSS, fuentes, assets, patrones de componentes, themes y variables; usa búsquedas acotadas al landing. Diferencia rutas marketing de sistema interno. Genera `PAGE-INVENTORY.md` con rutas, archivos exactos, si son públicos, y acoplamientos compartidos. Si no hay una allowlist documentada, **proponerla** en el reporte; no rellenar con `src/` genérico.
2. Inspecciona todos los archivos visuales del landing de referencia e identifica fuentes de estilos y fuentes tipográficas. Extrae variables reales, pero registra también valores inline y excepciones.
3. Si el servidor de desarrollo está disponible en `baseUrl`, ejecuta `node .claude/skills/landing-design-guardian/scripts/capture-landing.mjs`. Confirma que capturó la ruta correcta en cada viewport. Si no está disponible, documenta por qué y marca mediciones browser como pendiente; no inventes computed styles.
4. Inspecciona estados interactivos reales mediante el navegador (hover/focus, menús móviles, sticky, scroll, reduced motion). Nunca interactúes con el dashboard interno. Registra capturas adicionales cuando aporten información.
5. Entrega `DESIGN.md`, `TOKENS.json`, `COMPONENTS.md`, `PAGE-INVENTORY.md`. Cada patrón o token importante incluye evidencia de origen: archivo/selector/ruta/viewport/estado, valor declarado vs calculado y certeza.
6. Agrupa variantes y excepciones. No fuerces un único tamaño o color si el diseño contiene valores distintos según la sección o breakpoint.
7. Resume: referencia examinada, páginas publicas detectadas, principales tokens, ambigüedades y cobertura de evidencias.

## Criterio de salida

**No editar** componentes, páginas, archivos CSS ni configuración de build; solo crear documentación y evidencias debajo de `.claude/landing-design/`. Un documento sin referencia trazable es incompleto.
