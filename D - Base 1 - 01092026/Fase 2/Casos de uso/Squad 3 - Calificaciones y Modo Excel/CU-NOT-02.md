# CU-NOT-02: Ingreso, Edición y Publicación de Calificaciones en Tiempo Real

**Requisito Trazable:** [RF-37](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-37.md)  
**Módulo:** Módulo 8: Calificaciones en Tiempo Real, Modo Excel, Conclusiones y Motor CNEB  
**Squad Asignado:** Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB  
**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama de Trabajo:** `feature/squad-3/grades-engine`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Muy Alta  

---

## 1. Resumen y Alcance

Permite digitar, editar y guardar las notas de los estudiantes individualmente o en grupo, con validación inmediata de rango permitido.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente Titular
* **Actores Secundarios / Sistemas:** Base de Datos, Redis

---

## 3. Precondiciones

* Periodo académico abierto y estructura de evaluaciones definida.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Rechazo instantáneo de valores fuera del rango permitido (ej. notas menores a 0 o mayores a 20).

* **Garantía de Éxito (Postcondición Exitosa):**  
  Calificaciones guardadas en la base de datos y visibles en tiempo real.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente accede a su curso y bimestre.
2. Visualiza a los alumnos en lista.
3. Digita la nota en la celda del estudiante.
4. El sistema valida la nota en el evento onBlur / onChange.
5. Almacena la calificación.
6. Calcula de inmediato el promedio parcial resultante.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Nota fuera de rango: La celda se resalta en color rojo intenso, emite advertencia y no permite guardar hasta corregir el valor.**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-03: Rango vigesimal estricto: números enteros o con un decimal entre 0.0 y 20.0.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Planilla interactiva con celdas de entrada numérica con formato automático de dos dígitos (ej. teclear 9 produce '09').

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-37](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-37.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql)
