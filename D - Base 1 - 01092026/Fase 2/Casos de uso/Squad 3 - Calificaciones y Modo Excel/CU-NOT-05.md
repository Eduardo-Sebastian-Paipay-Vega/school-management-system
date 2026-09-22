# CU-NOT-05: Colaboración Supervisada de Practicantes en el Registro de Notas

**Requisito Trazable:** [RF-40](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-40.md)  
**Módulo:** Módulo 8: Calificaciones en Tiempo Real, Modo Excel, Conclusiones y Motor CNEB  
**Squad Asignado:** Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB  
**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama de Trabajo:** `feature/squad-3/grades-engine`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media  

---

## 1. Resumen y Alcance

Permite que un practicante preprofesional asignado como apoyo ingrese notas en borrador bajo la supervisión del docente titular, requiriendo la aprobación final del docente antes de su publicación.

---

## 2. Actores Involucrados

* **Actor Primario:** Practicante Preprofesional / Docente Titular
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* El practicante cuenta con el permiso delegado por el docente titular.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Las notas digitadas por practicantes no son visibles para estudiantes ni padres hasta ser aprobadas por el docente titular.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Lote de notas aprobado formalmente por el docente y publicado con constancia de autoría compartida en auditoría.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El practicante ingresa a la planilla del aula con su rol secundario de 'Apoyo de Calificaciones'.
2. Digita las calificaciones de la evaluación asignada en estado 'Borrador de Practicante'.
3. Presiona 'Enviar para Revisión del Docente'.
4. El docente titular recibe notificación de notas pendientes de revisión.
5. El docente abre la planilla, revisa las celdas marcadas en color lila (propuestas por practicante).
6. El docente realiza ajustes si es necesario y presiona 'Aprobar y Publicar Calificaciones'.
7. Las notas pasan al estado 'Oficial' y se calculan los promedios.

---

## 6. Flujos Alternativos y Excepciones

* **6a. Docente rechaza el borrador: Envía observaciones al practicante para que rectifique la digitación.**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-07: La responsabilidad legal y pedagógica final sobre las notas recae exclusivamente en el docente titular nombrado o contratado.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Insignia distintiva 'Notas en Revisión' en la cabecera de la columna con botón de aprobación masiva para el docente.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-40](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-40.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql)
