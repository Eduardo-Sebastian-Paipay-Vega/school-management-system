# Guía de calidad para fichas RF

Base: ISO/IEC/IEEE 29148:2018 (características de requisitos y de conjuntos de requisitos) e IREB CPRE Foundation Level (plantillas de requisitos y casos de uso). Esta guía resume criterios de aplicación; no reproduce las normas.

## 1. Características que debe cumplir cada RF

| Característica | Pregunta de control | Señal de fallo |
| --- | --- | --- |
| Necesario | ¿Qué pasa si se elimina? ¿Algún actor lo pide? | Nadie pierde nada; no hay objetivo de negocio |
| Apropiado | ¿Describe *qué* y no *cómo*? | Nombra librerías, tablas o componentes como obligación funcional |
| Inequívoco | ¿Dos lectores entenderían lo mismo? | Términos de §2.3, «etc.», «y/o», pronombres sin antecedente |
| Completo | ¿Desarrollo y QA tienen todo sin preguntar? | Falta actor, disparador, datos, error o resultado |
| Singular | ¿Expresa una sola capacidad? | Varios «y» unen acciones independientes; debería dividirse |
| Factible | ¿Se puede construir con el stack y límites del proyecto? | Contradice `limites_y_alcance_proyecto.md` |
| Verificable | ¿Se puede demostrar con una prueba? | No hay CA o el CA no tiene resultado observable |
| Correcto | ¿Refleja lo que el negocio necesita? | Solo lo confirma el responsable de negocio (estado `Aprobado`) |
| Conforme | ¿Usa la plantilla y convenciones del proyecto? | Encabezados o IDs fuera de la plantilla v2.0 |

Características del **conjunto** (revisar al documentar varios RF): sin duplicados, sin contradicciones entre RN, terminología consistente con el glosario de la tabla maestra, cobertura de todos los actores.

## 2. Redacción

### 2.1 Enunciado normativo con patrones EARS (adaptados al español)

| Patrón | Plantilla | Uso |
| --- | --- | --- |
| Ubicuo | El sistema deberá <acción>. | Comportamiento siempre activo |
| Evento | Cuando <disparador>, el sistema deberá <acción>. | Acción del usuario o evento |
| Estado | Mientras <estado>, el sistema deberá <acción>. | Comportamiento durante un estado |
| No deseado | Si <condición indeseada>, entonces el sistema deberá <respuesta>. | Errores y rechazos |
| Opcional | Donde <característica habilitada>, el sistema deberá <acción>. | Funciones configurables |

Usar «deberá» para obligación. «Podrá» solo para permisos explícitos del actor, nunca para describir al sistema.

**Deficiente:** «El sistema debe gestionar correctamente el cierre de forma rápida y segura.»
**Verificable:** «Cuando la Coordinación confirme el cierre de un periodo cuyo registro de notas esté completo, el sistema deberá cambiar su estado a *Cerrado* y rechazar toda edición posterior de calificaciones de ese periodo por parte de docentes.»

### 2.2 Cada campo, lo suyo

- **Precondición**: ya es verdad antes de empezar y se puede comprobar (estado, permiso, existencia). No es un paso.
- **Disparador**: el evento que inicia; no se repite como precondición.
- **Entrada**: un dato con tipo y restricción. «El usuario presiona Guardar» no es una entrada.
- **Paso del flujo**: una acción de un actor o una respuesta del sistema.
- **Regla de negocio**: política que vale con independencia de la pantalla («toda nota cerrada es inmutable sin rectificación»).
- **Validación**: comprobación concreta que aplica una regla o restricción en un paso, con su excepción.
- **Postcondición de éxito**: estado garantizado al terminar bien.
- **Postcondición de fallo**: lo que queda intacto si se rechaza (normalmente: «no se persiste ningún cambio»).
- **Salida**: lo que el actor recibe (mensaje, documento, respuesta) o el evento emitido.

### 2.3 Términos prohibidos sin cuantificar

rápido, rápidamente, lento, eficiente, eficientemente, fácil, fácilmente, intuitivo, amigable, robusto, flexible, adecuado, adecuadamente, apropiado, correctamente, óptimo, seguro (como adjetivo vago), moderno, etc., y/o, entre otros, aproximadamente, suficiente, normalmente, generalmente, mínimo posible, en lo posible, cuando sea necesario, según corresponda (sin decir según qué).

Sustituir por un valor, una referencia a RNF (`RNF-01: < 1.5 s`) o una regla explícita.

### 2.4 Criterios de aceptación

- Formato Gherkin en español (`Escenario`, `Dado`, `Y`, `Cuando`, `Entonces`), uno por escenario, con ID `CA-NN` en el nombre.
- Datos concretos y resultado **observable** (qué ve el actor, qué devuelve la API, qué queda en la base de datos).
- Mínimo: un CA de camino feliz, un CA por cada `EX`, un CA por cada `RN` que no quede cubierta por los anteriores, y uno de permisos si el RF restringe roles.
- Un CA de fallo siempre comprueba también que los datos persistidos no cambian.
- No copiar la precondición como resultado.

## 3. Estados del RF

| Estado | Significa | Evidencia mínima |
| --- | --- | --- |
| Borrador | Ficha en redacción | — |
| Propuesto | Ficha completa, lista para revisión | Linter sin errores |
| Aprobado | El negocio validó el comportamiento | Acta, comentario o firma del responsable de negocio |
| Implementado | Existe código que pretende cumplirlo | Ruta de código en 6.3 |
| Verificado | Hay pruebas ejecutadas que cumplen todos los CA | Ruta de pruebas y resultado en 5.3 |
| Aceptado | Validado en UAT por el negocio | Acta UAT |
| Rechazado / Obsoleto | Fuera de alcance o reemplazado | Decisión registrada en historial |

Documentar una ficha no la aprueba. La skill solo puede dejar `Borrador` o `Propuesto`, salvo que el usuario aporte la evidencia de los estados superiores.

## 4. Anti-patrones detectados en las fichas actuales del repositorio

| Anti-patrón | Ejemplo típico | Corrección |
| --- | --- | --- |
| Pasos dentro de «Entradas» | «El subdirector ingresa a Cierre de Periodo» | Mover a 4.1; listar datos (`EN-01 periodo_id`) |
| Salida = paso del flujo | «Registra el evento en la bitácora» | Salida: `SAL-01` mensaje/acta; el registro es POST o paso |
| Gherkin autogenerado | «Dado … Y <precondición> Cuando <paso 5> Entonces <postcondición>» | Escenarios con datos concretos y resultado observable |
| Sin postcondición de fallo | Solo describe el éxito | Añadir `POST (fallo)` |
| Excepción sin respuesta | «Cursos con 10 % pendiente» | Condición → respuesta → estado |
| Umbral sin fuente | «más del 10 %» | Citar fuente o `[PENDIENTE]` |
| Rama/trazas divergentes | La ficha y el CU citan ramas distintas | Registrar en Decisiones pendientes |
| Actor compuesto ambiguo | «Coordinación / Dirección General» | Separar principal y secundario o aclarar quién confirma |

## 5. Checklist de revisión (marcar con evidencia)

1. [ ] Expresa una necesidad real con objetivo y alcance (incluye/excluye) definidos.
2. [ ] No contiene términos de §2.3 sin cuantificar.
3. [ ] Precondiciones y postcondiciones son coherentes; hay POST de éxito y de fallo.
4. [ ] Flujo principal completo; cada excepción indica paso, respuesta y estado.
5. [ ] Las RN no contradicen otros RF ni los límites del proyecto; tienen fuente.
6. [ ] Entradas, salidas y validaciones especificadas con tipo y restricción.
7. [ ] Los CA permiten construir pruebas; matriz de cobertura sin huecos.
8. [ ] Dependencias y trazabilidad identificadas con rutas reales; pendientes con responsable.

El checklist evalúa la calidad documental; no demuestra que la funcionalidad esté implementada.
