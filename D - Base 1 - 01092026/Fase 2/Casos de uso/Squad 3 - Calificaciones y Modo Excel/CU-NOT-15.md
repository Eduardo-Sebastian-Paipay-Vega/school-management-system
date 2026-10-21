# CU-NOT-15: Consulta de Notas, Tareas y Exámenes por el Apoderado

**Requisito Trazable:** [RF-82](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-82.md)  
**Módulo:** Módulo 8: Calificaciones en Tiempo Real y Modo Excel  
**Squad Asignado:** Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB  
**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama de Trabajo:** `feature/squad-3/grades-engine`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta  

---

## 1. Resumen y Alcance

Los padres ven las notas de sus hijos y las fechas de sus tareas y exámenes, sin poder modificar nada.

---

## 2. Actores Involucrados

* **Actor Primario:** Apoderado
* **Actores Secundarios / Sistemas:** Motor de conversión CNEB (RF-46)

---

## 3. Precondiciones

* Apoderado con cuenta activa y vínculo vigente.
* Notas publicadas por el docente (RF-37).

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Ante cualquier error de vínculo, no se muestra información del estudiante.

* **Garantía de Éxito (Postcondición Exitosa):**  
  El apoderado ve las notas publicadas y el calendario de actividades de cada hijo.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El apoderado entra a su panel y elige a uno de sus hijos.
2. Abre 'Notas' y elige el periodo.
3. El sistema muestra las notas por curso en escala dual con sus conclusiones.
4. El apoderado abre 'Tareas y exámenes' y ve las próximas fechas y las notas de las actividades pasadas.

---

## 6. Flujos Alternativos y Excepciones

* **1a. Apoderado con un solo hijo: el sistema abre su panel directamente.**
* **3a. Curso sin notas publicadas: se muestra 'Aún no hay notas publicadas'.**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-22: El apoderado solo ve notas publicadas.**
* **RN-NOT-23: Cada consulta del apoderado se registra en la bitácora de accesos (Ley N.° 29733).**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Vista móvil primero, con pestañas Notas / Tareas y exámenes, tarjetas por curso y la nota en color CNEB.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-82](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-82.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql)
