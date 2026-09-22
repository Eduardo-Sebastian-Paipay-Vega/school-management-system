# CU-DSH-07: Generador de Reportes de Diagnóstico Integral para Consejos Académicos

**Requisito Trazable:** [RF-58](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-58.md)  
**Módulo:** Módulo 10: Dashboards, Ficha 360° del Alumno y Métricas SSU IS-480  
**Squad Asignado:** Squad 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°  
**Responsable Técnico:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
**Rama de Trabajo:** `feature/squad-4/analytics-dashboards`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Bimestral  

---

## 1. Resumen y Alcance

Permite generar de forma automatizada la presentación ejecutiva y dossier de diagnóstico del bimestre para la reunión plenaria del Consejo de Profesores, consolidando gráficos, estadísticas de aprobación y acuerdos pedagógicos.

---

## 2. Actores Involucrados

* **Actor Primario:** Director / Subdirector Académico
* **Actores Secundarios / Sistemas:** Motor de Generación Documental

---

## 3. Precondiciones

* Cierre oficial del bimestre académico completado.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Consolidación de datos de todos los grados y áreas del plantel en un solo expediente formal.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Dossier en PDF de alta calidad listo para sustentar ante la asamblea docente y UGEL Huamanga.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El directivo ingresa a 'Reportes Institucionales > Diagnóstico para Consejo Académico'.
2. Selecciona el Bimestre evaluado.
3. Configura los apartados a incluir: Estadísticas por Nivel, Cursos Críticos, Cuadro de Honor y Casos Especiales.
4. Presiona 'Generar Dossier de Consejo Académico'.
5. El sistema compila las tablas y gráficos analíticos en un documento formal de 15 a 20 páginas listo para exposición.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Exportación a diapositivas: Permite descargar un resumen en formato de presentación para proyectar en el auditorio.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ANA-12: El informe debe incluir la firma digital de los directivos y fecha formal de la sesión del consejo.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Asistente de configuración de reporte con casillas de verificación de capítulos y vista previa de páginas antes de imprimir.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-58](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-58.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/esquema_datos.sql)
