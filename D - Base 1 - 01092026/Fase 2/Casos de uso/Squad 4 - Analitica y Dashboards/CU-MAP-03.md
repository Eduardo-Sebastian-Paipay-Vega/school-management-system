# CU-MAP-03: Navegación Interactiva en Mapas de Calor con Zoom Jerárquico 'Drill-Down'

**Requisito Trazable:** [RF-49](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-49.md)  
**Módulo:** Módulo 9: Mapas de Calor con Navegación Drill-Down  
**Squad Asignado:** Squad 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°  
**Responsable Técnico:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
**Rama de Trabajo:** `feature/squad-4/analytics-dashboards`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta durante análisis institucional  

---

## 1. Resumen y Alcance

Permite al directivo hacer clic en cualquier celda agregada del mapa de calor institucional y descender jerárquicamente: Nivel Institucional -> Grado -> Sección -> Estudiante -> Competencia específica sin perder el contexto visual.

---

## 2. Actores Involucrados

* **Actor Primario:** Directivos y Especialistas de Gestión Pedagógica
* **Actores Secundarios / Sistemas:** Frontend Engine, API de Analítica

---

## 3. Precondiciones

* Mapa de calor institucional en pantalla.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Transición fluida (< 300 ms) conservando la ruta de navegación (Breadcrumb).

* **Garantía de Éxito (Postcondición Exitosa):**  
  Detalle granular accesible en 3 clics desde la vista macro institucional.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El directivo observa el mapa macro institucional y nota un bloque rojo en '2° de Secundaria'.
2. Hace clic en la celda '2° de Secundaria'.
3. El mapa hace zoom (Drill-Down) y se expande mostrando las secciones 'A', 'B' y 'C' con sus respectivas áreas curriculares.
4. Hace clic en 'Sección B - Ciencia y Tecnología'.
5. La vista desciende a nivel de los 30 estudiantes del aula.
6. Hace clic en el estudiante con nota C y se abre su Ficha 360° con el detalle de las competencias no logradas.
7. Puede retornar a la vista superior utilizando la barra de migas de pan (Breadcrumb).

---

## 6. Flujos Alternativos y Excepciones

* **6a. Retorno directo al inicio: Clic en el primer eslabón del breadcrumb 'Plantel Guamán Poma de Ayala'.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ANA-03: La navegación no debe requerir recargar la página completa, utilizando renderizado dinámico en cliente.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Barra de migas de pan animada superior con botones de nivel anterior y transiciones suaves de zoom en la matriz.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-49](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-49.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/esquema_datos.sql)
