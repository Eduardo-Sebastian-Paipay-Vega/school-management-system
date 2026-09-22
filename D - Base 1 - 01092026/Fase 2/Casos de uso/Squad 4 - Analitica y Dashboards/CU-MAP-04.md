# CU-MAP-04: Análisis Gráfico Comparativo de Rendimiento entre Secciones y Grados

**Requisito Trazable:** [RF-50](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-50.md)  
**Módulo:** Módulo 9: Mapas de Calor con Navegación Drill-Down  
**Squad Asignado:** Squad 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°  
**Responsable Técnico:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
**Rama de Trabajo:** `feature/squad-4/analytics-dashboards`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media  

---

## 1. Resumen y Alcance

Permite contrastar el rendimiento académico y la distribución de niveles de logro entre dos o más secciones del mismo grado (ej. 3° 'A' vs. 3° 'B') mediante gráficos comparativos de barras y cajas.

---

## 2. Actores Involucrados

* **Actor Primario:** Coordinador Pedagógico / Director
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* Notas cerradas o en proceso en las secciones a comparar.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Comparaciones estandarizadas bajo las mismas variables curriculares.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Gráficos comparativos lado a lado con cálculo de brecha porcentual.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El coordinador accede a 'Analítica > Comparador de Secciones'.
2. Selecciona el Grado (ej. 4° de Secundaria) y las secciones 'A', 'B' y 'C'.
3. Selecciona el área curricular (ej. Matemática).
4. El sistema procesa y genera gráficos de barras apiladas mostrando el porcentaje de AD, A, B y C de cada aula.
5. El coordinador identifica la sección que requiere reforzamiento o nivelación docente.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Comparativa de promedios históricos: Opción para superponer el desempeño del año anterior.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ANA-04: Las métricas deben expresarse tanto en cantidad absoluta de estudiantes como en porcentaje relativo.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Gráficos de barras apiladas al 100% interactivos con selector múltiple de secciones y botón de exportación de imagen.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-50](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-50.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/esquema_datos.sql)
