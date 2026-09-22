# CU-NOT-01: Parametrización de Rúbricas y Evaluaciones por Asignatura

**Requisito Trazable:** [RF-36](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-36.md)  
**Módulo:** Módulo 8: Calificaciones en Tiempo Real, Modo Excel, Conclusiones y Motor CNEB  
**Squad Asignado:** Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB  
**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama de Trabajo:** `feature/squad-3/grades-engine`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media (Al inicio de cada periodo)  

---

## 1. Resumen y Alcance

Permite configurar los criterios de evaluación, competencias CNEB asociadas, instrumentos (rúbricas, listas de cotejo) y ponderaciones para las evaluaciones del bimestre.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente Titular del Curso / Coordinador Pedagógico
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* Cursos asignados al docente en el periodo activo.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  La suma de los pesos de las evaluaciones debe ser coherente con el modelo pedagógico configurado.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Estructura de columnas de evaluación creada para la planilla de notas.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente ingresa a 'Calificaciones > Estructura de Evaluación'.
2. Selecciona el curso, grado y sección.
3. Añade una nueva columna de evaluación indicando el nombre (ej. Práctica 1, Examen Bimestral).
4. Selecciona la competencia CNEB a la cual contribuye la evaluación.
5. Define la escala a utilizar (Vigesimal 0-20 o Literal CNEB).
6. Guarda la estructura.
7. El sistema habilita las columnas en la planilla matricial.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Carga de estructura predefinida: Opción de copiar la estructura de evaluaciones de un bimestre anterior en un solo clic.**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-02: Toda evaluación debe tributar a una de las competencias oficiales de la asignatura.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Editor de columnas dinámico con selector de competencias e indicador visual de escala elegida.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-36](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-36.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql)
