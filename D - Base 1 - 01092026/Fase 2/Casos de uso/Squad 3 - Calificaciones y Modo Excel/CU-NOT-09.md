# CU-NOT-09: Consulta Inmediata y Transparente de Calificaciones para Estudiantes

**Requisito Trazable:** [RF-44](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-44.md)  
**Módulo:** Módulo 8: Calificaciones en Tiempo Real, Modo Excel, Conclusiones y Motor CNEB  
**Squad Asignado:** Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB  
**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama de Trabajo:** `feature/squad-3/grades-engine`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta  

---

## 1. Resumen y Alcance

Permite al estudiante y a su apoderado consultar en cualquier momento sus calificaciones publicadas, competencias logradas y retroalimentación docente desde su portal o app móvil.

---

## 2. Actores Involucrados

* **Actor Primario:** Estudiante / Padre de Familia
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* Usuario estudiante o apoderado autenticado con sesión activa.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  El estudiante solo puede ver exclusivamente sus propias calificaciones.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Visualización clara de las notas bimestrales por curso con sus respectivas conclusiones descriptivas.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El estudiante o apoderado ingresa a la opción 'Mis Calificaciones'.
2. Selecciona el Bimestre a consultar.
3. El sistema presenta la libreta virtual con la lista de asignaturas.
4. Cada asignatura muestra su nivel de logro alcanzado (AD, A, B, C) con su color representativo.
5. Al hacer clic en un curso, se despliegan las competencias evaluadas, la conclusión formativa del docente y las recomendaciones para mejorar.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Notas aún no publicadas por el docente: Se muestra la insignia 'En Evaluación'.**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-12: Aislamiento estricto de privacidad entre estudiantes conforme a la Ley de Protección de Datos Personales.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Diseño en tarjetas modernas con colores CNEB, gráficos de radar de competencias y botón para descargar el reporte en PDF.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-44](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-44.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql)
