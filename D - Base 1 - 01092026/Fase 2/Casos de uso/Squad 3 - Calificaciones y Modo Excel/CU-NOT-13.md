# CU-NOT-13: Carga Masiva de Calificaciones desde Plantilla Excel Precargada

**Requisito Trazable:** [RF-80](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-80.md)  
**Módulo:** Módulo 8: Calificaciones en Tiempo Real y Modo Excel  
**Squad Asignado:** Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB  
**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama de Trabajo:** `feature/squad-3/grades-engine`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta (Cierre de evaluaciones)  

---

## 1. Resumen y Alcance

Permite al docente que prefiere Excel trabajar sin conexión en la plantilla oficial y subir todas sus notas de una vez.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente
* **Actores Secundarios / Sistemas:** Motor de conversión CNEB (RF-46), Servicio de Auditoría

---

## 3. Precondiciones

* Evaluaciones definidas en el curso (RF-36 o RF-79).
* Periodo académico abierto (RF-42).

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Si el archivo no corresponde al curso o tiene errores estructurales, no se modifica ninguna nota.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Las notas válidas quedan registradas, con promedios recalculados y auditoría.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente abre la planilla del curso y elige 'Descargar plantilla Excel'.
2. Completa las notas en Excel.
3. Vuelve a la planilla y elige 'Subir notas desde Excel'.
4. El sistema valida el archivo y muestra la vista previa de cambios.
5. El docente confirma y el sistema aplica las notas.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Notas que sobrescriben valores existentes: se resaltan en ámbar y requieren confirmación explícita.**
* **4b. Periodo cerrado: el sistema rechaza la carga y sugiere el flujo de rectificación (RF-43).**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-18: Solo se aceptan plantillas generadas por el sistema para ese curso, sección y periodo.**
* **RN-NOT-19: Las celdas vacías no borran notas existentes.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Botones 'Descargar plantilla' y 'Subir notas' en la barra de la planilla, con un diálogo de vista previa que resalta en verde (nuevas), ámbar (cambian) y rojo (inválidas).

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-80](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-80.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql)
