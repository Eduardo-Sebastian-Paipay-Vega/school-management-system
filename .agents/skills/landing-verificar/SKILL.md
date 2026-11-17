---
name: landing-verificar
description: Verifica con evidencia la coherencia visual, responsive, accesibilidad y ausencia de regresiones del landing y demás páginas públicas, sin tocar el sistema interno.
disable-model-invocation: true
---

# /landing-verificar

Carga el contrato maestro `.claude/skills/landing-design-guardian/SKILL.md` y el material de `.claude/landing-design/`.

1. Revisa diferencias Git y ejecuta `guard-changes.mjs verify` si existe snapshot; comprueba además imports, estilos globales y dependencias compartidas que podrían afectar el dashboard indirectamente.
2. Abre la ruta de referencia y todas las rutas públicas autorizadas a 1440, 768 y 390 px (o viewports del scope); captura pantalla completa y revisa overflow, cortes, contraste, alineación, escalas de tipografía, spacing, imágenes y carga de fuentes.
3. Comprueba estados: hover, focus visible, keyboard, menú móvil, sticky, disabled donde exista, reduced motion y enlaces. Sin navegar pantallas internas protegidas.
4. Compara imágenes de la referencia pre/post; cualquier diferencia injustificada en la referencia es regresión. Para páginas de destino, comparar principios/tokens y componentes, no exigir pixeles idénticos a una página de distinta estructura.
5. Ejecuta tests, typecheck, lint y build apropiados si existen; evita instalar o reconfigurar el proyecto para forzar una ejecución.
6. Escribe `.claude/landing-design/VERIFICATION.md` con tabla por página/viewport/comportamiento, resultado PASS/FAIL/NOT_RUN, evidencia, observaciones y riesgos residuales.
7. Veredicto: APROBADO solo si el alcance es limpio, no hay regresiones críticas y el build/pasos exigidos pasan; CONDICIONAL si falta verificación visual o no se pudo ejecutar el build; RECHAZADO ante cambios fuera de alcance o fallas críticas.

No ocultes fallos ni llames éxito a una revisión hecha solo leyendo código.
