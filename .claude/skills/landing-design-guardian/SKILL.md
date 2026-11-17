---
name: landing-design-guardian
description: Extrae rigurosamente la identidad visual de un landing existente y la hace reutilizable para auditar, aplicar y verificar consistencia solo en páginas públicas autorizadas. Mantiene separado el sistema o dashboard interno.
---

# Landing Design Guardian (v1.0)

## Regla de oro

La **implementación existente del landing** y el **renderizado del navegador** son las fuentes de verdad; no son una sugerencia estética. Conservar lo que ya funciona. No confundir uniformización con rediseño.

Esta suite consta de cinco skills especializadas y una orquestadora (`/landing-uniformizar`):

`/landing-recopilar` → `/landing-auditar` → `/landing-aplicar` → `/landing-verificar` y `/landing-actualizar` bajo cambios voluntarios.

## Antes de trabajar

1. Detecta framework, raíz real de frontend, package manager, rutas públicas, componentes compartidos, CSS/Tailwind/theme, imports y servidor local. **No supongas** React, Next o Tailwind. Usa búsqueda del repositorio y archivos de configuración.
2. Lee `.claude/landing-design/scope.json`. No confíes en ejemplos prellenados como si fueran la topología real. Documenta en `PAGE-INVENTORY.md` qué rutas quedan públicas, cuáles son internas, y dónde se encuentran sus fuentes.
3. Resuelve ambigüedades conservadoramente: si hay rutas públicas e internas en una carpeta compartida, no autorices esa carpeta; selecciona archivos específicos o crea wrappers públicos. Nunca edites una ruta por coincidencia de nombre sin verificar su uso.
4. Trata las rutas login/registro/recuperación como flujo del **sistema autenticado** hasta que el usuario las autorice explícitamente como páginas públicas de marketing.
5. Verifica el estado de Git antes de escribir. Conserva cambios preexistentes. Nunca hacer commits o pushes automáticos.

## Jerarquía de fuentes y precisión

- **Nivel A — medido y rastreable:** propiedades calculadas en navegador, componentes/variables del código, assets, layout, capturas reales a varias resoluciones, archivos y selectores identificables.
- **Nivel B — inferido:** tamaños o patrones propuestos por repetición comprobada de valores; siempre marcados como hipótesis.
- **Nivel C — faltante:** ningún valor disponible; no inventar ni declarar "exactitud".

Diferenciar `valor de CSS declarado` de `valor CSS computed`; registrar ambos cuando una cascada o tema produce diferencias. Anotar viewport, ruta, estado y selector para cada muestra relevante. Un screenshot por sí solo no permite extraer valores exactos; la lectura del código por sí sola tampoco prueba el resultado renderizado.

## Inventario de la identidad

Documentar al menos:

- Paleta (fondos, texto, acento, superficies, bordes, degradados, opacidades, estados), hex/RGB/HSL donde proceda y procedencia.
- Familias tipográficas, pesos, tamaño, interlineado, tracking, límites de línea, fuentes cargadas y fallbacks.
- Espaciado vertical/horizontal, anchuras de contenedor, columnas, breakpoints, gutters, alineación, alturas y espacios negativos.
- Elevación, bordes, radios, sombras, blur/backdrop, overlays, ilustraciones, logos, iconografía y assets con su ubicación.
- Anatomía exacta de header, navegación, hero, cards, botones, enlaces, formularios, testimonios, CTA, FAQ, footer y secciones presentes; no forzar secciones inexistentes.
- Comportamiento visual en desktop/tablet/mobile: sticky, menú, hovers, focus, disabled, scroll, animaciones, transiciones y reduced-motion.
- Convenciones de contenido (jerarquía, longitud, tono); preservar información funcional y no inventar claims.

## Contrato de alcance (obligatorio)

`scope.json` define `publicRoutes`, `allowedSourcePaths`, `protectedSourcePaths`, `excludedRoutes`, `baseUrl` y `referenceRoute`.

`allowedSourcePaths` empieza **vacío intencionalmente**: no ejecutar `/landing-aplicar` hasta identificar carpetas o archivos públicos reales y completar el allowlist. Un path protegido tiene prioridad incluso si aparece en la lista permitida.

Prohibido cambiar APIs, datos, login, backend, lógica de negocio, dashboard y componentes internos. Para estilos compartidos entre landing e interfaz interna, preferir namespace como `.public-marketing` o `data-surface="marketing"`. No tocar tokens globales si existe riesgo de fugas visuales al sistema.

## Modos de operación

### Extraer

Leer la skill `/landing-recopilar` y usar, si el proyecto permite instalar/usar Playwright, `scripts/capture-landing.mjs`. Generar `DESIGN.md`, `TOKENS.json`, `COMPONENTS.md` e inventario trazable. Nunca cambiar archivos de interfaz en este modo.

### Auditar

Leer `/landing-auditar`; producir diferencias reales con ruta/archivo/selector, gravedad, captura y propuesta concreta. No hacer cambios.

### Aplicar

Leer `/landing-aplicar`; ejecutar `scripts/guard-changes.mjs snapshot` **antes** de cualquier edición, luego `verify`. En caso de cambios prohibidos, restaurar solamente los cambios hechos por esta ejecución; nunca sobrescribir trabajo previo del usuario.

### Verificar

Leer `/landing-verificar`. Demostrar que la referencia sigue igual, nuevas superficies públicas usan el sistema visual y los componentes internos no cambiaron. Ejecutar tests disponibles sin inventar resultados.

### Actualizar

Leer `/landing-actualizar`. Solo si el usuario indica un cambio intencional del landing. Explicar qué tokens y componentes cambiaron y qué páginas públicas deben sincronizarse. El diseño no se actualiza a partir de deriva accidental.

## Entregables estándar

En `.claude/landing-design/` mantener:

- `DESIGN.md`: contrato visual con procedencia y nivel de certeza.
- `TOKENS.json`: valores semánticos; incluir raw y computed, no colapsar valores incompatibles.
- `COMPONENTS.md`: inventario y variantes con paths.
- `PAGE-INVENTORY.md`: clasificación de rutas, ubicación en repo y riesgos de acoplamiento.
- `AUDIT.md`: brechas y plan de cambios con archivos permitidos.
- `VERIFICATION.md`: pruebas, capturas, regresiones y pendientes.
- `evidence/`: capturas de browser y JSON de computed style, desktop/tablet/mobile.

## Condiciones de salida

No reportar "uniformizado" hasta comprobar: tokens utilizados, patrones reutilizados, aspectos responsive, accesibilidad básica, ninguna modificación fuera del allowlist y no regresión visible en el landing de referencia. Ante la falta de servidor/navegador, indicar explícitamente que la validación visual es **pendiente**.
