---
name: landing-uniformizar
description: Orquesta en una ejecución la extracción, auditoría, aplicación y verificación del diseño del landing a páginas públicas, respetando el allowlist y protegiendo la aplicación interna.
disable-model-invocation: true
---

# /landing-uniformizar — flujo integral

Lee `.claude/skills/landing-design-guardian/SKILL.md` y `scope.json`. Ejecuta el flujo completo de las otras cuatro skills en el siguiente orden, sin pedir autorización entre fases para los cambios **ya expresamente autorizados por este comando** y **dentro de allowedSourcePaths**:

1. `/landing-recopilar`: medidas exactas desde código y navegador, con informe maestro.
2. `/landing-auditar`: diferencias por página y archivo; prioriza invariantes visuales, no diseños idénticos.
3. **Compuerta:** si `allowedSourcePaths` está vacío, no modificar interfaz. Reportar allowlist concreto sugerido y continuar solo con documentación.
4. `/landing-aplicar`: snapshot de archivos, aplicación acotada al marketing y control posterior de alcance.
5. `/landing-verificar`: capturas por resolución, estados, tests, build y veredicto.

**Restricciones innegociables:** nunca edites dashboard, auth, API, backend, base de datos ni CSS global compartido que cambie el sistema. No instales herramientas, no hagas commits o pushes sin autorización independiente. Preserva modificaciones previas del usuario.

Al finalizar, informa por cada fase: qué se inspeccionó, archivos modificados, riesgos, resultados comprobados y trabajos no ejecutados. No declares éxito cuando falta evidencia de navegador o fallan pruebas.
