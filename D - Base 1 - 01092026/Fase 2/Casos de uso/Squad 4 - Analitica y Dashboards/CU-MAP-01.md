# CU-MAP-01: Visualizar Mapa de Calor de Rendimiento Académico por Sección

**Requisito Trazable:** [RF-47](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-47.md)  
**Módulo:** Módulo 9: Mapas de Calor con Navegación Drill-Down  
**Squad Asignado:** Squad 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°  
**Responsable Técnico:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
**Rama de Trabajo:** `feature/squad-4/analytics-dashboards`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media (Cierre de bimestre y reuniones pedagógicas)  

---

## 1. Resumen y Alcance

Permite visualizar una matriz cromática (Heatmap) interactiva donde las filas representan a los estudiantes o secciones y las columnas las áreas curriculares, coloreadas según el nivel de logro alcanzado.

---

## 2. Actores Involucrados

* **Actor Primario:** Director, Subdirector, Coordinador Pedagógico
* **Actores Secundarios / Sistemas:** Motor Analítico, Base de Datos / Vista Materializada

---

## 3. Precondiciones

* Calificaciones del periodo registradas en el sistema.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Visualización instantánea (< 1 seg) sustentada en vistas materializadas precalculadas.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Matriz cromática interactiva con semáforo pedagógico: Azul (AD), Verde (A), Amarillo (B) y Rojo (C).

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El directivo ingresa a 'Analítica > Mapa de Calor de Rendimiento'.
2. Selecciona el Nivel (Secundaria), Grado (3°) y Sección (A).
3. El sistema consulta los promedios y renderiza la matriz cromática.
4. El directivo identifica visualmente patrones y focos rojos (ej. alta concentración de notas C en Matemática).
5. Pasa el cursor sobre una celda para ver el detalle del estudiante y la nota exacta.

---

## 6. Flujos Alternativos y Excepciones

* **2a. Vista consolidada institucional: Opción para ver todas las secciones del colegio en una sola pantalla global.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ANA-01: El color de la celda se determina automáticamente por el nivel de logro CNEB de la asignatura.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Matriz con paleta accesible (Colorblind-friendly), selector de zoom y barra de leyenda con porcentajes globales.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-47](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-47.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/esquema_datos.sql)
