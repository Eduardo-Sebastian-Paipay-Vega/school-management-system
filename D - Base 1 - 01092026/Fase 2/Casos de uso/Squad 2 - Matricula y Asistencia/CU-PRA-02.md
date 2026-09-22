# CU-PRA-02: Asignación de Docente Guía y Asesor Institucional

**Requisito Trazable:** [RF-29](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-29.md)  
**Módulo:** Módulo 6: Asistencia y Cómputo de Horas de Practicantes  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Baja (Inicio de ciclo universitario)  

---

## 1. Resumen y Alcance

Permite vincular a cada practicante de la UNSCH con un docente titular del colegio que actuará como su mentor y supervisor directo de actividades.

---

## 2. Actores Involucrados

* **Actor Primario:** Coordinador del SSU / Director del Plantel
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* Practicante y docente registrados en el sistema.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Todo practicante debe contar con un mentor asignado para validar sus horas.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Vínculo registrado en la tabla intern_supervisors permitiendo la aprobación de bitácoras.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El coordinador accede a 'Practicantes > Asignación de Mentores'.
2. Selecciona al practicante y le asigna su docente guía del colegio.
3. Define el área de práctica (Soporte Técnico, Apoyo Docente, Desarrollo de Software).
4. Guarda la asignación.
5. El docente guía recibe notificación de los practicantes a su cargo.

---

## 6. Flujos Alternativos y Excepciones

* **2a. Reasignación por cambio de horario: El coordinador puede transferir al practicante a otro docente guía conservando las horas previas acumuladas.**

---

## 7. Reglas de Negocio Asociadas

* **RN-PRA-02: Un docente guía no puede tener más de 5 practicantes a su cargo simultáneamente.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Selector desplegable con búsqueda rápida de docentes y lista de practicantes asignados con estado de progreso.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-29](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-29.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
