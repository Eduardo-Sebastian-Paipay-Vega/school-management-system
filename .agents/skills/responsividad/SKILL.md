---
name: responsividad
description: Revisa o implementa comportamiento responsive en pantallas Next.js/React del Sistema de Gestión Escolar. Úsala al pedir adaptación móvil, corregir overflow o revisar diálogos y tablas en distintos anchos.
---

# Responsividad en React

## Reconocimiento

1. Para UI React, sigue obligatoriamente el protocolo PrimeReact Guardian y sus fases G0–G6 según `AGENTS.md`.
2. Inspecciona la página, layout, componentes, wrappers, CSS y tokens existentes antes de editar. Identifica si el problema está en shell, pantalla, diálogo, formulario o tabla.
3. Revisa RF/CU y conserva flujos, texto, permisos y validaciones existentes.

## Implementación

- Define el criterio de aceptación para móvil, tablet y escritorio con anchos representativos; no supongas un breakpoint universal si el diseño existente fija otro.
- Prioriza el layout responsive con CSS/Tailwind y tokens del proyecto. Mantén intactos los estados y la lógica de negocio.
- Diálogos deben caber en el viewport; formularios deben reordenarse sin ocultar campos; tablas anchas necesitan una estrategia legible (scroll contenido, columnas prioritarias u otra ya usada en el módulo).
- Usa HTML semántico, foco y controles de teclado. No tapes acciones ni controles con overlays.
- No introduzcas Angular/PrimeNG ni copies selectores internos de otra versión de PrimeReact. Verifica cualquier prop en los `.d.ts` instalados.

## Verificación

Ejecuta lint/build conforme a PrimeReact Guardian. Si hay navegador, inspecciona la pantalla en anchos móvil, intermedio y escritorio y reporta evidencia. Si no hay navegador o el estado autenticado no está disponible, deja la verificación visual como pendiente en vez de afirmar que fue comprobada.
