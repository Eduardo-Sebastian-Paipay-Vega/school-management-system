# CU-PRA-05: Conformidad y Validación Periódica de Horas por el Docente Tutor

**Requisito Trazable:** [RF-74](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-74.md)  
**Módulo:** Módulo 6: Asistencia y Cómputo de Horas de Practicantes  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Semanal (Revisión de jornadas del tutor)  

---

## 1. Resumen y Alcance

Permite al docente guía revisar las jornadas registradas por sus practicantes y darles conformidad u observarlas. Solo las jornadas validadas cuentan para el cómputo de horas (CU-PRA-03) y para las fichas oficiales de prácticas (CU-PRA-04).

---

## 2. Actores Involucrados

* **Actor Primario:** Docente Guía (tutor del practicante)
* **Actores Secundarios / Sistemas:** Practicante (corrige jornadas observadas), Coordinador Académico (revierte validaciones), Motor de Cómputo de Horas, Servicio de Auditoría (RF-65)

---

## 3. Precondiciones

* El practicante tiene al docente asignado como guía (CU-PRA-02).
* Existen jornadas registradas en estado PENDIENTE (CU-PRA-01).

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Las jornadas conservan su estado anterior y no se suman horas sin validar.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Cada jornada revisada queda VALIDADA u OBSERVADA, el acumulado de horas validadas se recalcula y la decisión queda en la bitácora.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente guía ingresa a "Validar horas de practicantes".
2. El sistema lista, por practicante, las jornadas PENDIENTES del periodo con fecha, hora de entrada, hora de salida, horas y actividades.
3. El docente selecciona las jornadas correctas y elige "Dar conformidad".
4. El sistema marca las jornadas como VALIDADAS, las bloquea y recalcula el acumulado del practicante.
5. El sistema muestra el resumen del periodo: horas registradas, validadas y observadas.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Jornada con inconsistencias: el docente elige "Observar" e ingresa un comentario obligatorio; la jornada queda OBSERVADA y el practicante la ve con el comentario.**
* **3b. El practicante corrige o justifica la jornada observada y la reenvía: vuelve a PENDIENTE y reaparece en la bandeja del tutor.**
* **3c. Jornada sin marcación de salida: el sistema no permite validarla (RN-PRA-03).**
* **4a. Error en una jornada ya validada: solo el Coordinador Académico puede revertirla a PENDIENTE, con motivo obligatorio.**

---

## 7. Reglas de Negocio Asociadas

* **RN-PRA-03: Las horas solo se validan cuando la marcación de salida haya sido registrada el mismo día.**
* **RN-PRA-05: Solo el docente guía asignado puede validar u observar las jornadas de su practicante.**
* **RN-PRA-06: Una jornada validada queda bloqueada; solo Coordinación puede revertirla, con motivo registrado en la bitácora.**
* **RN-PRA-07: Toda observación exige un comentario para el practicante.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Bandeja agrupada por practicante con casillas de selección por jornada, botones "Dar conformidad" y "Observar", contador de horas pendientes por practicante y filtro por semana o mes.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-74](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-74.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
