# CU-DOC-02: Registro de Justificaciones y Reprogramación de Clases Docentes

**Requisito Trazable:** [RF-33](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-33.md)  
**Módulo:** Módulo 7: Horas de Docentes Contratados y Reprogramación  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media  

---

## 1. Resumen y Alcance

Permite al docente solicitar la justificación de una clase no dictada y proponer una fecha y hora de reprogramación, la cual debe ser autorizada por la Subdirección.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente Contratado / Subdirector Académico
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* Existencia de una sesión pedagógica no dictada.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  La reprogramación no debe generar cruces de horario para el docente ni para los estudiantes de la sección.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Nueva sesión de clase calendarizada y notificada a los estudiantes.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente ingresa a 'Reprogramaciones > Nueva Solicitud'.
2. Selecciona la clase perdida y adjunta el motivo justificado.
3. Propone la nueva fecha y bloque horario de recuperación.
4. El sistema verifica que el aula y el docente se encuentren libres en ese horario.
5. Envía la solicitud a la Subdirección.
6. El subdirector revisa y presiona 'Aprobar Reprogramación'.
7. El sistema inserta la nueva sesión en el horario y notifica a los involucrados.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Cruce en la hora propuesta: El sistema indica que el aula está ocupada y solicita elegir otro horario.**

---

## 7. Reglas de Negocio Asociadas

* **RN-DOC-02: Toda clase no dictada debe ser reprogramada dentro de los 15 días posteriores.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Formulario con selector de calendario y vista de disponibilidad simultánea de aula y docente.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-33](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-33.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
