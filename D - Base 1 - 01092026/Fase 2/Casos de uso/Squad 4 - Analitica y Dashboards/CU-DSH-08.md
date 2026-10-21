# CU-DSH-08: Tablero de Cumplimiento y Puntualidad del Registro de Notas por Docente

**Requisito Trazable:** [RF-83](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-83.md)  
**Módulo:** Módulo 10: Dashboards, Ficha 360° y Métricas SSU  
**Squad Asignado:** Squad 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°  
**Responsable Técnico:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
**Rama de Trabajo:** `feature/squad-4/analytics-dashboards`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Semanal / Al cierre de periodo  

---

## 1. Resumen y Alcance

Muestra de un vistazo qué docentes están al día con sus notas y quiénes están atrasados.

---

## 2. Actores Involucrados

* **Actor Primario:** Coordinación Académica
* **Actores Secundarios / Sistemas:** Dirección, Servicio de analítica

---

## 3. Precondiciones

* Fechas límite configuradas (RF-81).
* Sesión con rol Coordinación o Dirección.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Si faltan datos de plazos, el tablero lo indica en lugar de mostrar semáforos incorrectos.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Cada docente aparece con su semáforo, porcentaje y alertas emitidas.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. Coordinación abre 'Cumplimiento de notas'.
2. Elige el periodo y los filtros.
3. El sistema muestra la tabla de docentes ordenada por nivel de retraso.
4. Coordinación abre el detalle de un docente y ve sus cursos y el historial de alertas.
5. Exporta el reporte si lo necesita.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Periodo sin plazos configurados: el sistema invita a configurarlos (RF-81).**

---

## 7. Reglas de Negocio Asociadas

* **RN-ANA-13: El semáforo se calcula con las notas registradas frente a la fecha límite vigente.**
* **RN-ANA-14: El tablero no muestra datos personales sensibles del docente más allá de nombre y cursos.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Tabla con semáforo, barra de avance por docente y panel lateral de detalle con el historial de alertas.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-83](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-83.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/esquema_datos.sql)
