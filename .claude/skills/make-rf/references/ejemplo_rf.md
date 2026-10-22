# Ejemplo resuelto: RF-42 en plantilla v2.0

Ejemplo de referencia construido el 2026-10-22 a partir de la ficha RF-42 v1, `CU-NOT-07`, `contratos_api.md` del Squad 3 y `backend/squad_3_calificaciones/src/domain.ts`. Muestra cómo tratar contradicciones reales entre fuentes: **no** es la ficha aprobada; para reescribir RF-42 hay que volver a leer las fuentes vigentes.

Lo que el ejemplo enseña:
- Las «Entradas» de la v1 eran pasos; aquí son datos (`EN-01`…).
- El umbral del 10 % (documentos) y la exigencia de 100 % completo y aprobado (código) se contradicen: va a `DP-01`, no se elige uno en silencio.
- El actor difiere entre ficha, CU y código: va a `DP-02`.
- La confirmación con contraseña directiva no tiene contrato ni implementación: se mantiene como requisito documentado y se abre `DP-03`.

---

# RF-42: Cierre Oficial de Periodo Académico y Bloqueo de Modificación

> **Ficha:** completa · **Plantilla:** RF v2.0 (ISO/IEC/IEEE 29148:2018 · IREB CPRE)

## 1. Identificación

| Campo | Valor |
| --- | --- |
| ID | RF-42 |
| Nombre | Cerrar oficialmente un periodo académico y bloquear la edición de sus calificaciones |
| Versión | 2.0 |
| Estado | Propuesto |
| Prioridad | Esencial |
| Módulo / submódulo | M8: Calificaciones / Cierre de periodo |
| Squad | Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB |
| Responsable técnico | Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`) |
| Responsable de negocio | Dirección General `[PENDIENTE: confirmar persona que aprueba — líder de proyecto]` |
| Caso de uso | [CU-NOT-07](../../Casos%20de%20uso/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/CU-NOT-07.md) |
| Última revisión | 2026-10-22 |

## 2. Especificación funcional

### 2.1 Enunciado normativo
> **Cuando el actor autorizado confirme el cierre de un periodo académico que cumple las condiciones de cierre, el sistema deberá cambiar el estado del periodo a *Cerrado*, conservar una instantánea inmutable de sus calificaciones y rechazar toda edición posterior de esas calificaciones por parte de docentes, salvo mediante el flujo de rectificación (RF-43).**

### 2.2 Descripción
El sistema verifica la completitud del registro de notas de un periodo (bimestre) de un plantel, muestra el diagnóstico al actor autorizado y, tras su confirmación reforzada, ejecuta el cierre en una única transacción. Desde ese momento las planillas del periodo son de solo lectura para docentes y practicantes, y el evento queda en la bitácora de auditoría.

### 2.3 Objetivo de negocio
Garantizar que las notas usadas en libretas (RF-59), actas (RF-62) y reportes SIAGIE (RF-88) no cambien después de la fecha oficial de cierre, conforme al calendario académico del plantel (RF-11).

### 2.4 Actores
| Actor | Tipo | Participación |
| --- | --- | --- |
| Dirección / Subdirección Académica | Principal | Revisa el diagnóstico y confirma el cierre (ver DP-02) |
| Docente | Secundario | Pierde permiso de edición sobre el periodo |
| Servicio de auditoría (RF-65) | Secundario | Registra el evento de cierre |

### 2.5 Disparador
El actor principal selecciona un periodo en «Cierre de Periodo» y solicita ejecutar el cierre oficial.

### 2.6 Alcance
- **Incluye:** diagnóstico de completitud, confirmación reforzada, cambio de estado, instantánea, bloqueo de edición y registro de auditoría.
- **Excluye:** corrección de notas tras el cierre (RF-43), generación de actas (RF-62), cálculo de promedios (RF-41), cierre del año lectivo completo `[PENDIENTE: ¿lo cubre este RF o RF-10? — Coordinación Académica]`.

## 3. Contrato de ejecución

### 3.1 Precondiciones
- **PRE-01:** El actor está autenticado y tiene rol autorizado para cerrar periodos en el plantel del periodo.
- **PRE-02:** El periodo existe, pertenece al año lectivo vigente y su estado es *En revisión*.
- **PRE-03:** La fecha límite de registro de notas del periodo (RF-11) ya venció.

### 3.2 Entradas
| ID | Dato | Tipo / formato | Obligatorio | Origen | Restricción |
| --- | --- | --- | --- | --- | --- |
| EN-01 | periodo_id | UUID | Sí | Selección del actor | Periodo del tenant del actor |
| EN-02 | confirmación reforzada | Credencial del actor | Sí | Actor | Ver DP-03 |
| EN-03 | justificación de pendientes | Texto, máx. `[PENDIENTE]` caracteres | Condicional | Actor | Solo si se admite cierre con pendientes (DP-01) |

### 3.3 Salidas
| ID | Salida | Destinatario | Formato | Condición |
| --- | --- | --- | --- | --- |
| SAL-01 | Diagnóstico por curso: % de notas registradas y aprobadas, docentes con pendientes | Actor principal | Pantalla | Al seleccionar el periodo |
| SAL-02 | Confirmación «Periodo cerrado» con fecha y responsable | Actor principal | Pantalla / JSON | Éxito |
| SAL-03 | Error `INCOMPLETE_PERIOD` con la lista de cursos incompletos | Actor principal | Pantalla / JSON 422 | EX-01 |
| SAL-04 | Error `ACCESS_DENIED` | Actor | JSON 403 | EX-02 |

### 3.4 Postcondiciones
- **POST-01 (éxito):** El periodo queda en estado *Cerrado* con fecha y usuario de cierre.
- **POST-02 (éxito):** Existe una instantánea inmutable de todas las calificaciones del periodo.
- **POST-03 (éxito):** Toda petición de edición de notas del periodo por docentes o practicantes es rechazada con `PERIOD_CLOSED`.
- **POST-04 (éxito):** La bitácora contiene un evento de cierre encadenado (RF-65).
- **POST-05 (fallo):** Si el cierre se rechaza o falla, el estado del periodo, las notas y los permisos no cambian y no se crea instantánea.

## 4. Comportamiento

### 4.1 Flujo principal
1. El actor abre «Cierre de Periodo» y selecciona un periodo.
2. El sistema valida PRE-01 a PRE-03 y muestra el diagnóstico (SAL-01).
3. El actor solicita «Ejecutar cierre oficial».
4. El sistema verifica las condiciones de cierre (VAL-03, VAL-04) y pide la confirmación reforzada.
5. El actor confirma (EN-02).
6. El sistema, en una única transacción, cambia el estado a *Cerrado*, guarda la instantánea y revoca la edición para docentes y practicantes.
7. El sistema registra el evento en la bitácora y muestra SAL-02.

### 4.2 Flujos alternativos
- **FA-01 (paso 5):** El actor cancela la confirmación; el sistema vuelve al diagnóstico sin cambios.

### 4.3 Excepciones
- **EX-01 (paso 4):** Hay cursos que no cumplen la condición de cierre (DP-01) → el sistema muestra SAL-03 con los cursos y docentes pendientes → no se cierra el periodo.
- **EX-02 (paso 2):** El actor no tiene rol autorizado o el periodo es de otro plantel → SAL-04 → sin cambios.
- **EX-03 (paso 5):** La confirmación reforzada no es válida → mensaje de credencial incorrecta → sin cambios.
- **EX-04 (paso 6):** Falla la transacción → mensaje de error genérico, sin presentar el cierre como exitoso → POST-05.
- **EX-05 (paso 2):** El periodo ya está *Cerrado* → mensaje `PERIOD_CLOSED` → sin cambios.

### 4.4 Reglas de negocio
- **RN-NOT-10:** Toda nota cerrada queda congelada y no puede ser editada por docentes sin el flujo formal de rectificación (RF-43). Fuente: ficha RF-42 v1 y CU-NOT-07 §7.
- Condición de cierre: `[PENDIENTE: DP-01]`; se codificará como nueva regla `RN-NOT` al resolverse.

### 4.5 Validaciones
| ID | Qué se valida | Cuándo | Si falla |
| --- | --- | --- | --- |
| VAL-01 | Rol del actor y tenant del periodo | Paso 2 | EX-02 |
| VAL-02 | Estado del periodo = *En revisión* | Paso 2 | EX-05 |
| VAL-03 | Completitud de notas por curso según DP-01 | Paso 4 | EX-01 |
| VAL-04 | Conclusiones descriptivas obligatorias registradas (RF-39) | Paso 4 | EX-01 |
| VAL-05 | Confirmación reforzada | Paso 5 | EX-03 |

## 5. Verificación

### 5.1 Criterios de aceptación
```gherkin
Escenario: CA-01 Cierre de un periodo completo
  Dado el periodo "Bimestre II 2026" en estado "En revisión" con su fecha límite vencida
  Y todos los cursos con el 100 % de notas registradas y aprobadas
  Cuando la Subdirección confirma el cierre con su credencial válida
  Entonces el periodo queda en estado "Cerrado" con fecha y responsable
  Y se registra un evento de cierre en la bitácora de auditoría

Escenario: CA-02 Edición bloqueada tras el cierre
  Dado el periodo "Bimestre II 2026" en estado "Cerrado"
  Cuando un docente intenta modificar una nota de ese periodo
  Entonces el sistema responde "PERIOD_CLOSED"
  Y la nota almacenada no cambia

Escenario: CA-03 Cierre rechazado por cursos incompletos
  Dado el periodo "Bimestre II 2026" en estado "En revisión"
  Y el curso "Matemática 3.º A" no cumple la condición de cierre
  Cuando la Subdirección solicita el cierre
  Entonces el sistema muestra "INCOMPLETE_PERIOD" indicando "Matemática 3.º A" y su docente
  Y el periodo sigue en estado "En revisión"

Escenario: CA-04 Actor sin permiso
  Dado un usuario con rol "Docente"
  Cuando solicita el cierre del periodo "Bimestre II 2026"
  Entonces el sistema responde "ACCESS_DENIED"
  Y el estado del periodo no cambia

Escenario: CA-05 Fallo de persistencia
  Dado un periodo que cumple todas las condiciones de cierre
  Cuando la transacción de cierre falla al guardar la instantánea
  Entonces el sistema informa un error sin indicar éxito
  Y el periodo, sus notas y los permisos quedan como antes del intento
```

### 5.2 Matriz de cobertura
| Elemento | Cubierto por |
| --- | --- |
| Flujo principal | CA-01 |
| RN-NOT-10 / POST-03 | CA-02 |
| EX-01 / VAL-03 | CA-03 |
| EX-02 / VAL-01 | CA-04 |
| EX-04 / POST-05 | CA-05 |
| EX-03 / VAL-05 | `[PENDIENTE: CA tras resolver DP-03]` |
| EX-05 / VAL-02 | `[PENDIENTE: CA de periodo ya cerrado]` |

### 5.3 Casos de prueba y evidencias
| Caso de prueba | Tipo | Ruta / enlace | Resultado |
| --- | --- | --- | --- |
| expired periods reject edits even without a scheduled close job | unitaria | `backend/squad_3_calificaciones/test/domain.test.ts:65` | OK (2026-10-22), cubre parte de CA-02 |
| PostgreSQL engine: transaction rollback | integración | `backend/squad_3_calificaciones/test/postgres.test.ts:10` | OK (2026-10-22), relacionado con CA-05 |
| CA-01, CA-03, CA-04 de extremo a extremo | E2E | Pendiente de crear | Sin ejecutar |

## 6. Gobernanza

### 6.1 Dependencias
- **DEP-01:** RF-11 — fechas límite y estados del periodo.
- **DEP-02:** RF-39 — conclusiones descriptivas exigidas antes del cierre.
- **DEP-03:** RF-43 — única vía de modificación tras el cierre.
- **DEP-04:** RF-65 — bitácora de auditoría encadenada.
- **DEP-05:** RF-04 — control de acceso por roles.

### 6.2 RNF vinculados
- RNF-12: Integridad transaccional ACID — el cierre es atómico.
- RNF-06: RBAC — validación de rol en UI y endpoint.

### 6.3 Trazabilidad
| Artefacto | Referencia |
| --- | --- |
| Caso de uso | CU-NOT-07 |
| Diseño (SDD / contratos) | `Arquitectura/Squad 3 - Calificaciones y Modo Excel/contratos_api.md` acción `close` |
| Modelo de datos | `backend/squad_3_calificaciones/migrations/001_grades.sql` |
| API | `POST /api/v1/grades/actions` con `action: "close"` |
| Código | `backend/squad_3_calificaciones/src/domain.ts` (`applyAction` case `close`, `isClosed`); UI no implementada |
| Pruebas | Ver 5.3 |

### 6.4 Decisiones pendientes
| ID | Pregunta | Fuentes en conflicto / faltantes | Responsable |
| --- | --- | --- | --- |
| DP-01 | ¿Se puede cerrar con hasta 10 % de notas sin registrar (justificadas) o se exige 100 % registrado y aprobado? | Ficha v1 y CU-NOT-07 2a: bloqueo si > 10 %; `domain.ts` case `close`: exige 100 % y aprobado | Coordinación Académica |
| DP-02 | ¿Quién cierra: Dirección/Subdirección o también Coordinación? | Ficha v1: Coordinación / Dirección; CU-NOT-07: Director / Subdirector; código: `director` y `coordinator` | Dirección General |
| DP-03 | ¿Cómo es la confirmación reforzada (contraseña, segundo factor)? | CU-NOT-07 paso 4; no figura en `contratos_api.md` ni en el código | Squad 1 + Dirección |
| DP-04 | ¿El vencimiento de la fecha límite bloquea la edición aunque no se haya ejecutado el cierre? | Código: `isClosed` bloquea por fecha; documentos: bloqueo tras el cierre | Coordinación Académica |
| DP-05 | Rama de trabajo | Ficha v1: `feature/squad-3/gradebook-excel`; CU: `feature/squad-3/grades-engine`; AGENTS.md: integración en `dev` | Líder de proyecto |

### 6.5 Historial de cambios
| Versión | Fecha | Autor | Cambio |
| --- | --- | --- | --- |
| 1.0 | — | Equipo SSU IS-480 | Ficha original |
| 2.0 | 2026-10-22 | Claude Code (make-rf) | Migración a plantilla RF v2.0; contradicciones registradas en 6.4 |
