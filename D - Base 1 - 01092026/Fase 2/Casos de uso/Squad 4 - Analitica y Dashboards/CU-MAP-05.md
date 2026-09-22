# CU-MAP-05: Detección Visual de Asignaturas con Mayor Índice de Riesgo Académico

**Requisito Trazable:** [RF-51](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-51.md)  
**Módulo:** Módulo 9: Mapas de Calor con Navegación Drill-Down  
**Squad Asignado:** Squad 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°  
**Responsable Técnico:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
**Rama de Trabajo:** `feature/squad-4/analytics-dashboards`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media  

---

## 1. Resumen y Alcance

Identifica y clasifica automáticamente en un ranking visual las asignaturas que presentan los mayores índices de desaprobación o niveles de logro en 'Inicio' (C) en todo el colegio.

---

## 2. Actores Involucrados

* **Actor Primario:** Director / Consejo Académico
* **Actores Secundarios / Sistemas:** Motor de Clasificación de Riesgo

---

## 3. Precondiciones

* Calificaciones consolidadas del periodo.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Ranking priorizado de mayor a menor porcentaje de estudiantes en riesgo.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Tablero de asignaturas críticas con recomendaciones automáticas de plan de mejora.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El directivo ingresa a 'Diagnóstico de Riesgo por Curso'.
2. El sistema calcula el índice de reprobación por área en los tres niveles.
3. Presenta el listado ordenado destacando las asignaturas con más del 25% de alumnos en nivel C o B.
4. Permite abrir el desglose de competencias críticas de cada una para coordinar con los docentes del área.

---

## 6. Flujos Alternativos y Excepciones

* **2a. Filtro por docente: Permite identificar la tasa de aprobación por docente respetando la confidencialidad.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ANA-05: Todo curso con más del 30% de estudiantes en nivel 'C' debe generar un aviso formal de alerta pedagógica.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Tarjetas de alerta con barras de peligro en degradado rojo y botón 'Diseñar Plan de Apoyo Pedagógico'.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-51](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-51.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/esquema_datos.sql)
