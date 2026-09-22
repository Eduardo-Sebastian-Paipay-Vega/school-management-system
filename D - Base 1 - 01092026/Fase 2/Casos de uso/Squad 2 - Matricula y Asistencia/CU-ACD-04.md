# CU-ACD-04: Asignación y Distribución de Carga Lectiva Docente

**Requisito Trazable:** [RF-18](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-18.md)  
**Módulo:** Módulo 4: Gestión Académica, Matrícula y Carga Lectiva  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media  

---

## 1. Resumen y Alcance

Permite asignar las asignaturas, grados y secciones a los docentes titulares y practicantes, definiendo el horario de clases semanal.

---

## 2. Actores Involucrados

* **Actor Primario:** Subdirector Académico / Coordinador
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* Malla curricular y secciones activas.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Detección de cruces de horario para el mismo docente o la misma aula.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Carga lectiva asignada y disponible en el panel de cada docente.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El directivo ingresa a 'Carga Lectiva > Asignación Docente'.
2. Selecciona un docente del directorio.
3. Le asigna los cursos y secciones correspondientes.
4. Configura los bloques horarios semanales.
5. El sistema verifica que no existan cruces de horario.
6. Confirma la asignación y publica la carga docente.

---

## 6. Flujos Alternativos y Excepciones

* **5a. Cruce de horario detectado: El sistema resalta el conflicto en color rojo e impide guardar hasta resolver la superposición.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ACD-05: Un docente no puede tener dos clases asignadas en el mismo bloque horario.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Horario semanal en cuadrícula interactiva con soporte para arrastrar bloques de clase (Drag & Drop).

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-18](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-18.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
