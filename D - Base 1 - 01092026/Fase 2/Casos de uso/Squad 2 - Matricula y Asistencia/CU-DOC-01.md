# CU-DOC-01: Registro y Marcación de Horas Lectivas de Docentes Contratados

**Requisito Trazable:** [RF-32](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-32.md)  
**Módulo:** Módulo 7: Horas de Docentes Contratados y Reprogramación  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Diaria (Por cada bloque pedagógico)  

---

## 1. Resumen y Alcance

Permite registrar el dictado efectivo de las sesiones de clase correspondientes al contrato docente por horas, validando el cumplimiento del horario escolar.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente Contratado / Auxiliar de Control
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* Docente con contrato por horas y horario escolar registrado.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  No se permite duplicar la marcación de la misma sesión pedagógica.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Sesión marcada como 'Dictada' con hora de inicio, fin y tema curricular abordado.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente accede a 'Mi Horario y Sesiones'.
2. Ubica la sesión de clase en curso según la hora actual.
3. Presiona 'Iniciar Sesión Pedagógica'.
4. Al finalizar los 90 minutos de clase, presiona 'Finalizar Sesión' y redacta brevemente el tema avanzado.
5. El sistema almacena el registro para el cálculo de la planilla mensual de horas dictadas.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Sesión no dictada por feriado o actividad cívica: Se registra automáticamente con la causal correspondiente.**

---

## 7. Reglas de Negocio Asociadas

* **RN-DOC-01: La tolerancia de inicio de clase es de hasta 10 minutos para ser computada como puntual.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Lista de tarjetas de clases del día con cronómetro en curso y estado visual (Pendiente, En Dictado, Completada).

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-32](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-32.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
