# CU-NOT-06: Cálculo Automatizado de Promedios Parciales, Bimestrales y Finales

**Requisito Trazable:** [RF-41](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-41.md)  
**Módulo:** Módulo 8: Calificaciones en Tiempo Real, Modo Excel, Conclusiones y Motor CNEB  
**Squad Asignado:** Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB  
**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama de Trabajo:** `feature/squad-3/grades-engine`  
**Nivel del Caso de Uso:** Subfunción del Sistema  
**Frecuencia de Uso:** Automática e Instantánea ante cualquier cambio  

---

## 1. Resumen y Alcance

Calcula de forma automática y en milisegundos los promedios de competencia, promedios bimestrales de área y el promedio final anual aplicando las reglas pedagógicas del CNEB (moda, último logro o promedio ponderado según nivel).

---

## 2. Actores Involucrados

* **Actor Primario:** Sistema (Motor de Evaluación) / Docente
* **Actores Secundarios / Sistemas:** Base de Datos PostgreSQL

---

## 3. Precondiciones

* Calificaciones parciales registradas en el sistema.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Cálculo exacto con redondeo estándar según norma ministerial (0.5 redondea hacia el entero inmediato superior).

* **Garantía de Éxito (Postcondición Exitosa):**  
  Promedios actualizados en las columnas calculadas y en la base de datos sin necesidad de recalcular manualmente.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente registra o modifica una calificación en cualquier celda.
2. El motor de evaluación detecta el evento de actualización.
3. Aplica la fórmula configurada para la competencia (ej. ponderación o moda de logros).
4. Actualiza el promedio de competencia.
5. Evalúa el nivel de logro global del área curricular en el bimestre.
6. Refleja el resultado en la columna 'Promedio Final' con su respectiva insignia de color.
7. Persiste el consolidado en la tabla student_period_grades.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Alumno con notas pendientes: El sistema muestra el estado 'En Proceso' hasta que se completen todas las evaluaciones requeridas.**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-08: En Primaria la calificación por competencia es literal (AD, A, B, C) y no existe promedio numérico aritmético; el nivel de área es la valoración del logro predominante.**
* **RN-NOT-09: En Secundaria, si se usa escala vigesimal interna, el redondeo a medio punto (ej. 10.5 a 11) se aplica únicamente en el promedio final del bimestre.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Columnas de promedio sombreadas con fondo gris tenue y candado pequeño para indicar que son de solo lectura calculada.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-41](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-41.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql)
