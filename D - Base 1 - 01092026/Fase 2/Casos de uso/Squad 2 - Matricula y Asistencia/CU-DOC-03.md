# CU-DOC-03: Consolidación Mensual de Cumplimiento de Horas Lectivas Dictadas

**Requisito Trazable:** [RF-34](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-34.md)  
**Módulo:** Módulo 7: Horas de Docentes Contratados y Reprogramación  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Mensual (Al cierre de cada mes)  

---

## 1. Resumen y Alcance

Permite generar el consolidado de horas dictadas, inasistencias y clases recuperadas por cada docente contratado para la elaboración de la planilla de pago institucional.

---

## 2. Actores Involucrados

* **Actor Primario:** Personal de Planillas / Subdirección Académica
* **Actores Secundarios / Sistemas:** Generador de Reportes, Base de Datos

---

## 3. Precondiciones

* Cierre del mes calendario en el sistema.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Cálculo exacto de minutos y horas pedagógicas dictadas.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Reporte de cumplimiento mensual emitido y listo para firma y remisión a administración.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El operador ingresa a 'Reportes de Personal > Horas Dictadas Mensuales'.
2. Selecciona el mes y año a procesar.
3. El sistema totaliza las horas programadas vs. las efectivamente dictadas y recuperadas por docente.
4. Presenta la tabla consolidada con desglose de tardanzas y ausencias no recuperadas.
5. El operador exporta el informe oficial en PDF y Excel para la oficina de remuneraciones.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Docentes con recuperaciones pendientes: El sistema genera una alerta indicando sesiones autorizadas aún no ejecutadas.**

---

## 7. Reglas de Negocio Asociadas

* **RN-DOC-03: Solo las horas dictadas o debidamente justificadas y recuperadas son aptas para el cálculo del pago.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Tabla resumen con filtros por nivel educativo, totales acumulados y botón de exportación oficial.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-34](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-34.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
