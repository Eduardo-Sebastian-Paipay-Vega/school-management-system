# CU-NOT-04: Asistente y Banco Estructurado de Conclusiones Descriptivas Sugeridas por Logro (MINEDU)

**Requisito Trazable:** [RF-39](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-39.md)  
**Módulo:** Módulo 8: Calificaciones en Tiempo Real, Modo Excel, Conclusiones y Motor CNEB  
**Squad Asignado:** Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB  
**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama de Trabajo:** `feature/squad-3/grades-engine`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta (En cada cierre de bimestre)  

---

## 1. Resumen y Alcance

Proporciona al docente un catálogo oficial preconfigurado de conclusiones descriptivas sugeridas según el nivel de logro alcanzado (AD, A, B, C) por competencia, permitiendo insertarlas con un clic o personalizarlas para cada estudiante.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente Titular del Curso
* **Actores Secundarios / Sistemas:** Banco Normativo de Conclusiones MINEDU, Base de Datos

---

## 3. Precondiciones

* El estudiante cuenta con calificaciones registradas en la competencia.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Las conclusiones sugeridas respetan el enfoque por competencias y la redacción formativa del CNEB.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Conclusión descriptiva asignada al estudiante y lista para ser impresa en la libreta escolar.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente se posiciona en la columna 'Conclusión Descriptiva' del estudiante.
2. Hace clic en el botón 'Asistente de Conclusión' (o presiona [Ctrl+Espacio]).
3. El sistema detecta el nivel de logro del alumno (ej. 'B' - En Proceso) y la competencia evaluada.
4. Despliega una lista modal con 3 a 5 conclusiones formativas recomendadas según la norma MINEDU.
5. El docente selecciona la conclusión más adecuada a la situación del estudiante.
6. El texto se inserta en la celda, permitiendo al docente realizar ajustes manuales si lo desea.
7. Presiona 'Guardar Conclusión'.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Redacción propia personalizada: El docente puede redactar libremente su propia conclusión sin usar el banco estructurado.**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-05: En niveles de logro 'C' (En Inicio) y 'B' (En Proceso) la conclusión descriptiva es obligatoria por norma MINEDU.**
* **RN-NOT-06: Longitud máxima de la conclusión: 500 caracteres para encajar en el formato oficial de libreta.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Selector desplegable inteligente flotante al lado de la celda con pestañas de filtro por nivel de logro (AD, A, B, C) y botón 'Insertar'.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-39](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-39.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql)
