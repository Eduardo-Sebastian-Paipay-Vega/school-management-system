# Plantilla maestra RF v2.0

Copiar desde `# RF-NN` hasta el final. Sustituir `<…>`; borrar comentarios `<!-- -->`. Los encabezados `##`/`###` y los prefijos de ID son obligatorios porque el linter los comprueba.

## Convención de identificadores

| Elemento | Formato | Ejemplo | Regla |
| --- | --- | --- | --- |
| Requisito | `RF-NN` | `RF-42` | Fijo; nunca se reutiliza ni renumera |
| Caso de uso | `CU-XXX-NN` | `CU-NOT-07` | El existente en `Casos de uso/` |
| Precondición | `PRE-NN` | `PRE-01` | Debe ser comprobable antes de iniciar |
| Entrada | `EN-NN` | `EN-01` | Un dato por fila |
| Paso del flujo principal | `N.` | `3.` | Alterna actor / sistema |
| Flujo alternativo | `FA-NN` | `FA-01` | Indica el paso donde se bifurca |
| Excepción | `EX-NN` | `EX-01` | Indica el paso donde ocurre |
| Regla de negocio | `RN-<MOD>-NN` | `RN-NOT-10` | Prefijo del módulo (ACD, AST, PRA, DOC, NOT, ANA, REP, PUB, SEG…) |
| Validación | `VAL-NN` | `VAL-01` | Dato, permiso o estado |
| Postcondición | `POST-NN` | `POST-01` | Marcar `(éxito)` o `(fallo)` |
| Salida | `SAL-NN` | `SAL-01` | Respuesta, mensaje, documento o evento |
| Criterio de aceptación | `CA-NN` | `CA-01` | Gherkin; uno por escenario |
| Dependencia | `DEP-NN` | `DEP-01` | RF, servicio, tabla o componente |
| Pendiente | `DP-NN` | `DP-01` | Decisión abierta con responsable |

Estados permitidos: `Borrador` → `Propuesto` → `Aprobado` → `Implementado` → `Verificado` → `Aceptado`; además `Rechazado` y `Obsoleto`. Ver significado en `guia_calidad.md` §3.

---

~~~markdown
# RF-NN: <Título oficial de la tabla maestra>

> **Ficha:** completa | reducida · **Plantilla:** RF v2.0 (ISO/IEC/IEEE 29148:2018 · IREB CPRE)

## 1. Identificación

| Campo | Valor |
| --- | --- |
| ID | RF-NN |
| Nombre | <Verbo en infinitivo + objeto: «Cerrar oficialmente el periodo académico»> |
| Versión | 2.0 |
| Estado | Borrador |
| Prioridad | Esencial | Deseable | Opcional |
| Módulo / submódulo | M<N>: <Módulo> / <Submódulo> |
| Squad | Squad <N>: <Nombre> |
| Responsable técnico | <Nombre> (`@usuario`) |
| Responsable de negocio | <Rol que aprueba> |
| Caso de uso | [CU-XXX-NN](<ruta relativa>) |
| Última revisión | AAAA-MM-DD |

## 2. Especificación funcional

### 2.1 Enunciado normativo
> **<Patrón EARS: «Cuando <disparador>, el sistema deberá <acción> <objeto> <restricción>.»>**

### 2.2 Descripción
<Comportamiento esperado en 2–5 frases: qué hace, sobre qué datos y con qué resultado.>

### 2.3 Objetivo de negocio
<Necesidad que resuelve y para quién. Si existe, indicador medible.>

### 2.4 Actores
| Actor | Tipo | Participación |
| --- | --- | --- |
| <Rol> | Principal | <Qué ejecuta> |
| <Rol / sistema> | Secundario | <Qué aporta o recibe> |

### 2.5 Disparador
<Evento concreto que inicia la operación: acción del usuario, fecha, evento del sistema.>

### 2.6 Alcance
- **Incluye:** <…>
- **Excluye:** <… (y en qué RF se trata, si aplica)>

## 3. Contrato de ejecución

### 3.1 Precondiciones
- **PRE-01:** <Condición verificable antes de iniciar>

### 3.2 Entradas
| ID | Dato | Tipo / formato | Obligatorio | Origen | Restricción |
| --- | --- | --- | --- | --- | --- |
| EN-01 | <dato> | <tipo> | Sí | <usuario/sistema> | <rango, longitud, catálogo> |

### 3.3 Salidas
| ID | Salida | Destinatario | Formato | Condición |
| --- | --- | --- | --- | --- |
| SAL-01 | <respuesta / mensaje / documento / evento> | <actor> | <UI, JSON, PDF…> | <éxito/fallo> |

### 3.4 Postcondiciones
- **POST-01 (éxito):** <Estado garantizado tras completar>
- **POST-02 (fallo):** <Qué queda sin modificar si la operación se rechaza>

## 4. Comportamiento

### 4.1 Flujo principal
1. <Actor> <acción>.
2. El sistema <respuesta>.
<!-- Alternar actor/sistema; cada paso, una acción; 3–12 pasos. -->

### 4.2 Flujos alternativos
- **FA-01 (paso N):** <Variante válida y cómo retoma o termina>

### 4.3 Excepciones
- **EX-01 (paso N):** <Condición inválida> → <respuesta del sistema> → <estado resultante>

### 4.4 Reglas de negocio
- **RN-<MOD>-NN:** <Política obligatoria, sin ambigüedad>. Fuente: <documento/autoridad>.

### 4.5 Validaciones
| ID | Qué se valida | Cuándo | Si falla |
| --- | --- | --- | --- |
| VAL-01 | <dato / permiso / estado> | <paso N> | <EX-NN> |

## 5. Verificación

### 5.1 Criterios de aceptación
```gherkin
Escenario: CA-01 <camino feliz con datos concretos>
  Dado <estado inicial concreto>
  Y <dato concreto>
  Cuando <acción del actor>
  Entonces <resultado observable>
  Y <postcondición verificable>

Escenario: CA-02 <excepción EX-01>
  Dado <…>
  Cuando <…>
  Entonces <rechazo observable>
  Y <los datos persistidos no cambian>
```

### 5.2 Matriz de cobertura
| Elemento | Cubierto por |
| --- | --- |
| Flujo principal | CA-01 |
| EX-01 | CA-02 |
| RN-<MOD>-NN | CA-0N |

### 5.3 Casos de prueba y evidencias
| Caso de prueba | Tipo | Ruta / enlace | Resultado |
| --- | --- | --- | --- |
| <nombre o «Pendiente de crear»> | unitaria / integración / E2E / UAT | <ruta real> | <sin ejecutar / OK / falla> |

## 6. Gobernanza

### 6.1 Dependencias
- **DEP-01:** <RF-NN / servicio / tabla> — <por qué se necesita>

### 6.2 RNF vinculados
- <RNF-NN: nombre — cómo aplica a este RF>

### 6.3 Trazabilidad
| Artefacto | Referencia |
| --- | --- |
| Caso de uso | CU-XXX-NN |
| Diseño (SDD / contratos) | <ruta> |
| Modelo de datos | <tabla(s) en esquema> |
| API | <método y ruta, si está definida> |
| Código | <ruta real o «No implementado»> |
| Pruebas | <ruta real o «No existen»> |

### 6.4 Decisiones pendientes
| ID | Pregunta | Fuentes en conflicto / faltantes | Responsable |
| --- | --- | --- | --- |
| DP-01 | <…> | <…> | <rol> |

### 6.5 Historial de cambios
| Versión | Fecha | Autor | Cambio |
| --- | --- | --- | --- |
| 2.0 | AAAA-MM-DD | Claude Code (make-rf) | Migración a plantilla RF v2.0 |
~~~

---

## Ficha reducida

Para RF Deseables/Opcionales de consulta o visualización simple. Mantiene obligatorios: 1 (Identificación), 2.1, 2.4, 2.5, 3.1, 3.2, 3.4 (con éxito y fallo), 4.1, 4.3, 5.1 (mínimo un CA de éxito y uno de fallo), 6.3 y 6.5. Las secciones omitidas se sustituyen por `No aplica — <motivo>`; nunca se borran los encabezados.
