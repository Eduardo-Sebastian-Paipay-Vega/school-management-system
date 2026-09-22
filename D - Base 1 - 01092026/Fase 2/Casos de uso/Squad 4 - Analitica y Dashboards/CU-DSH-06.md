# CU-DSH-06: Tablero de Seguimiento, Impacto y Acreditación del SSU (IS-480)

**Requisito Trazable:** [RF-57](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-57.md)  
**Módulo:** Módulo 10: Dashboards, Ficha 360° del Alumno y Métricas SSU IS-480  
**Squad Asignado:** Squad 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°  
**Responsable Técnico:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
**Rama de Trabajo:** `feature/squad-4/analytics-dashboards`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Semanal / Al cierre de ciclo  

---

## 1. Resumen y Alcance

Proporciona las métricas de impacto institucional y social generadas por los estudiantes practicantes de la Escuela Profesional de Ingeniería de Sistemas (UNSCH): horas de servicio aportadas, módulos implementados, estudiantes escolares beneficiados y ahorro operativo.

---

## 2. Actores Involucrados

* **Actor Primario:** Coordinador del SSU IS-480 / Autoridades de la UNSCH
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* Usuario con rol de Coordinador SSU o Autoridad Universitaria.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Cálculo auditable de horas y entregables conforme a la carpeta del SSU IS-480.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Reporte de impacto institucional descargable para la acreditación universitaria ante SINEACE / SUNEDU.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El coordinador del SSU accede a 'Tablero de Impacto SSU IS-480'.
2. El sistema despliega los indicadores consolidados: Total Practicantes Activos (ej. 5), Horas Totales Acumuladas, Escuelas Impactadas, Transacciones Procesadas sin Papel.
3. Gráfico de horas aportadas por cada practicante hacia la meta de su convenio.
4. Presiona 'Generar Informe de Acreditación SSU (PDF)'.
5. El sistema emite el expediente formal para la Facultad de Ingeniería de Minas, Geología y Civil (UNSCH).

---

## 6. Flujos Alternativos y Excepciones

* **3a. Desglose por practicante: Permite ver el expediente individual de cada universitario participante.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ANA-11: El reporte debe contener la estructura formal exigida por la Oficina de Responsabilidad Social Universitaria de la UNSCH.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Panel con identidad visual combinada UNSCH - Guamán Poma de Ayala, gráficos de barras de horas y métricas de impacto ecológico (ahorro de resmas de papel).

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-57](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-57.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/esquema_datos.sql)
