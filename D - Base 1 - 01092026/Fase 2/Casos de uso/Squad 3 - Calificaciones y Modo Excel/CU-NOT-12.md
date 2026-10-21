# CU-NOT-12: Programación de Tareas, Exámenes y Actividades Evaluativas con Calendario

**Requisito Trazable:** [RF-79](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-79.md)  
**Módulo:** Módulo 8: Calificaciones en Tiempo Real y Modo Excel  
**Squad Asignado:** Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB  
**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama de Trabajo:** `feature/squad-3/grades-engine`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta (Semanal)  

---

## 1. Resumen y Alcance

El docente programa tareas y exámenes con fecha; estudiantes y padres los ven en un calendario y reciben recordatorios.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente
* **Actores Secundarios / Sistemas:** Estudiante, Apoderado, Centro de Notificaciones (RF-76)

---

## 3. Precondiciones

* Docente con carga lectiva asignada en el curso y sección (RF-18).
* Periodo académico abierto (RF-11).

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Si la fecha está fuera del periodo, la actividad no se crea.

* **Garantía de Éxito (Postcondición Exitosa):**  
  La actividad queda en el calendario de la sección y enlazada a su columna en la planilla.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente abre su curso y elige 'Nueva actividad'.
2. Elige el tipo, completa título, fecha, competencia y peso, y adjunta material si corresponde.
3. El sistema valida la fecha y revisa la carga de exámenes del día.
4. El docente confirma.
5. El sistema publica la actividad, crea la columna en la planilla y notifica a la sección.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Sobrecarga de exámenes en el día: el sistema advierte y el docente decide mantener o cambiar la fecha.**
* **5a. Reprogramación: al cambiar la fecha, el sistema notifica el cambio a estudiantes y apoderados.**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-15: Una sección no debería tener más de dos exámenes en el mismo día (advertencia, no bloqueo).**
* **RN-NOT-16: Solo el docente del curso puede crear o modificar sus actividades.**
* **RN-NOT-17: Una actividad con notas registradas no puede eliminarse; solo reprogramarse o anularse con motivo.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Calendario mensual y vista de lista por curso, con chips de color por tipo de actividad y un formulario lateral de creación.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-79](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-79.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql)
