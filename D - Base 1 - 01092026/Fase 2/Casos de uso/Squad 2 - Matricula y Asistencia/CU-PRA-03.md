# CU-PRA-03: Cómputo Acumulado de Horas Efectivas de Prácticas Universitarias

**Requisito Trazable:** [RF-30](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-30.md)  
**Módulo:** Módulo 6: Asistencia y Cómputo de Horas de Practicantes  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta  

---

## 1. Resumen y Alcance

Permite consultar el progreso en tiempo real de las horas cronológicas acumuladas respecto a la meta establecida para el Servicio Social Universitario (ej. 120 horas).

---

## 2. Actores Involucrados

* **Actor Primario:** Practicante, Docente Guía, Coordinador
* **Actores Secundarios / Sistemas:** Motor de Cómputo de Horas

---

## 3. Precondiciones

* Registros de asistencia del practicante aprobados por el docente guía.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Solo se contabilizan horas validadas y aprobadas formalmente.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Barra de progreso porcentual y desglose mensual de horas completadas.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El practicante o su supervisor ingresa a 'Mi Progreso de Prácticas'.
2. El sistema suma todas las jornadas validadas en el periodo.
3. Muestra el indicador: Horas acumuladas / Meta requerida (ej. 94 / 120 horas).
4. Permite visualizar la tabla detallada por fecha con las actividades ejecutadas.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Jornada con observación: Las jornadas en estado 'Pendiente de Revisión' se muestran en color gris y no suman a la meta hasta su aprobación.**

---

## 7. Reglas de Negocio Asociadas

* **RN-PRA-03: Las horas solo se validan cuando la marcación de salida haya sido registrada el mismo día.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Gráfico de anillo (Doughnut Chart) de progreso porcentual con distintivo de meta alcanzada al llegar al 100%.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-30](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-30.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
