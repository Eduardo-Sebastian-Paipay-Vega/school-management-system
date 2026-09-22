# CU-DSH-03: Tablero de Resumen Pedagógico y Clases Diarias para el Docente

**Requisito Trazable:** [RF-54](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-54.md)  
**Módulo:** Módulo 10: Dashboards, Ficha 360° del Alumno y Métricas SSU IS-480  
**Squad Asignado:** Squad 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°  
**Responsable Técnico:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
**Rama de Trabajo:** `feature/squad-4/analytics-dashboards`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Diaria (Al iniciar sesión)  

---

## 1. Resumen y Alcance

Proporciona al docente su agenda del día, horario de clases activas, accesos directos para tomar asistencia y notas, y lista de alumnos que requieren seguimiento prioritario.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente (Nombrado o Contratado)
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* Docente con cursos y secciones asignadas.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Carga directa y personalizada según las asignaciones del usuario autenticado.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Visión operativa de su jornada escolar con botones de acción rápida a un toque.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente inicia sesión.
2. El sistema detecta su rol y despliega su 'Panel del Docente'.
3. Muestra su próxima clase con contador de tiempo restante (ej. '3° B - Matemática en 15 min').
4. Accesos rápidos destacados: 'Tomar Asistencia', 'Abrir Planilla de Notas', 'Ver Alumnos en Riesgo'.
5. Resumen de tareas o evaluaciones programadas para la semana.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Docente sin clases hoy: Mensaje de bienvenida con sugerencia de revisión de planillas o banco de conclusiones.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ANA-08: La pantalla inicial del docente debe priorizar la clase que debe dictar en ese bloque horario.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Agenda vertical con bloques horarios interactivos y tarjetas de acceso directo con iconos distintivos.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-54](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-54.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/esquema_datos.sql)
