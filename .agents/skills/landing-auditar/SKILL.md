---
name: landing-auditar
description: Compara cada página pública de marketing del repositorio con el diseño maestro y genera un informe de divergencias sin editar la interfaz.
disable-model-invocation: true
---

# /landing-auditar

Carga `.claude/skills/landing-design-guardian/SKILL.md`, el `scope.json` y los artefactos de `/landing-recopilar`.

1. Si faltan `DESIGN.md` y `PAGE-INVENTORY.md`, ejecutar primero el análisis de `/landing-recopilar` en modo lectura.
2. Revisa cada `publicRoute` verificada y su código visual. Excluye explícitamente rutas internas, admin, auth, backend y módulos de negocio.
3. Compara valores reales y patrones: paleta, componentes, fuentes, espaciado, contenido visual, sombras, responsive, estados y accesibilidad. Prioriza estilos efectivos del navegador; registra diferencias en CSS declarativo con cautela cuando no hay render.
4. Distingue **variación intencional** de **inconsistencia**. Un hero no debe tener exactamente la misma composición que una FAQ; lo que se conserva es el lenguaje visual.
5. Para cada problema registra: página, selector/archivo, valor actual, valor de referencia, captura/archivo soporte, gravedad, riesgo, recomendación, dependencia y cómo verificar. Marca CSS global y componentes compartidos con el dashboard como riesgo alto.
6. Crea `.claude/landing-design/AUDIT.md` con matriz de divergencias y plan de cambio por archivos permitidos, indicando explícitamente los que NO deben tocarse.

**Salida:** reporte exclusivamente; no modificar código de producción ni ejecutar cambios automáticos.
