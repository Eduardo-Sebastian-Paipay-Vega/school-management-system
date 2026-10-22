# Rúbrica Project Health 0–1000 — versión 1.0

## 1. Pesos invariables

| Categoría de observación | Código JSON | Máximo |
|---|---|---:|
| Requisitos funcionales | `RF` | 400 |
| Requisitos no funcionales | `RNF` | 100 |
| Calidad y pruebas | `QA` | 150 |
| Integraciones y E2E | `INT` | 100 |
| Seguridad/roles/integridad | `SEC` | 100 |
| Arquitectura y datos | `ARCH` | 70 |
| Entrega/operación | `OPS` | 50 |
| Consistencia documental | `DOC` | 30 |
| **Total** |  | **1000** |

La distribución es una **rúbrica interna diseñada para esta skill**, no una certificación externa. Los controles QA/SEC/INT deben corresponder a criterios concretos del proyecto: no recompensar controles ficticios.

## 2. Cálculo determinista

Cada categoría requiere inventario explícito de ítems independientes y verificables, con `id`, `title`, `category`, `priority`, `state`, `evidence` y, para `RF`, `module` y criterio de aceptación en la fuente.

Factor de prioridad declarado: `critical=5`, `high=3`, `medium=2`, `low=1`. No cambiar prioridades para aumentar score; registrar quién las definió. Se usan los pesos para promediar, no para modificar el total.

| Estado | Fracción | Evidencia mínima |
|---|---:|---|
| `not_started` | 0.00 | inventario / ausencia registrada |
| `specified` | 0.10 | especificación/caso de aceptación |
| `implemented` | 0.45 | evidencia código/infra real |
| `verified` | 0.80 | implementación + prueba ejecutada relevante |
| `accepted` | 1.00 | implementación + prueba + aceptación formal |

**Fórmula por categoría**: `S_c = máximo_c × SUM(peso_i × fracción_i) / SUM(peso_i)`; redondear **solo al final**, con `round half up` a entero y clamp 0–1000. Un RF crítico bloqueado puede impedir lanzamiento aun cuando su promedio numérico sea pequeño.

El script valida evidencia mínima por `kind`: `spec` para specified, `implementation` para implemented, `implementation` y `test` para verified, `implementation`, `test`, `acceptance` para accepted (tipos válidos: `spec`, `implementation`, `test`, `acceptance`, `other`). Esta condición es necesaria pero no suficiente: el agente debe evaluar correspondencia, ejecución, cobertura, vigencia y confiabilidad, no añadir evidencias ficticias para pasar el validador.

## 3. Complicaciones de alcance

- **Score global solo si inventario confiable**: `scope.inventory_status=complete`, `scope.all_modules_in_scope=true`, `scope.expected_modules` coincide con `scope.reviewed_modules`, al menos un `RF` real, `scope.requirements_sources` no vacía, ningún `scope.unresolved_scope_conflicts`, las 8 categorías representadas con controles justificados y las 16 fases F00–F15 inventariadas (aunque alguna figure no verificable). De lo contrario `score=null`, texto `N/D — NO VERIFICABLE`.
- Si no existen RF por definición legítima (p. ej. biblioteca), adecuar metodología mediante cambio versionado de rubrica y divulgar alcance; no fabricar RF para obtener un número.
- Módulos descubiertos sin documentación se informan como brecha incluso si no se puede determinar si son parte del producto; si hay duda material, `partial`.
- RF descontinuados con aprobación explícita se conservan en historial, pero se excluyen del denominador activo; la decisión se documenta. No excluir requisitos difíciles sin autorización.
- Score de MVP puede calcularse **por separado**, con inventario congelado del MVP y etiqueta inequívoca; nunca presentarlo como score global.
- Los puntajes de snapshots con cambios de alcance/ponderación no son comparables: prohibido alegar evolución porcentual sin rebaselining.

## 4. Semáforos descriptivos (no son lanzamiento)

- 0–199: inicial o grandes brechas.
- 200–399: preparación insuficiente.
- 400–599: desarrollo parcial.
- 600–749: integración y validación incompleta.
- 750–899: madurez avanzada con pendientes.
- 900–999: madurez alta con pendientes.
- 1000: evidencia completa según rúbrica, **no equivale a ausencia absoluta de defectos**.

No hay score de `despliegue autorizado` derivado de estos rangos. **Compuertas bloqueantes** incluyen incidente BLOCKER o CRITICAL abierto, RF crítico no accepted, pruebas obligatorias fallidas, seguridad relevante no validada, datos/migraciones/backup/rollback o aceptación de negocio no confirmados si se pretende declarar producción.

Estado operativo solo si respaldado por señales: `NO VERIFICABLE` (alcance incompleto), `BLOQUEADO` (blockers), `EN DESARROLLO`, `EN VALIDACIÓN` (definido con gate QA/UAT), `LISTO PARA PILOTO` (UAT aprobada + gate seguridad + sin bloqueantes), `EN PRODUCCIÓN VERIFICADA` (lo anterior + despliegue real + monitoreo confirmado). Si `gate` contradice hallazgos, el estado más conservador prevalece.

## 5. Confiabilidad y divulgación

No confundir cobertura de código con % de RF. Presentar fracción de RF `accepted / total` y `verified+accepted / total` por separado. `score` es una suma ponderada y no es un porcentaje de esfuerzo ni probabilidad de éxito.

En cada actualización guardar `snapshot`, `ámbito`, `fecha`, `rama`, `commit`, limitaciones, evidencia por fuente y resultado de pruebas. Si la evidencia fue tomada de un árbol dirty, identificarlo de forma explícita.
