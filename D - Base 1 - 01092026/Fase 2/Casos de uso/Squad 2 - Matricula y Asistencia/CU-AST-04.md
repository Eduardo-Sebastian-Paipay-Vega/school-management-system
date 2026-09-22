# CU-AST-04: Consolidación y Consulta del Récord de Asistencia por Estudiante

**Requisito Trazable:** [RF-23](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-23.md)  
**Módulo:** Módulo 5: Asistencia Estudiantil, Kiosco Offline-First, Carnés QR y App Móvil  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta  

---

## 1. Resumen y Alcance

Permite visualizar el resumen histórico de asistencia de un estudiante a lo largo del año o bimestre: total asistencias, tardanzas, faltas y porcentaje de asistencia.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente Tutor, Directivo, Padre de Familia, Estudiante
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* Usuario autenticado con acceso a la ficha del estudiante.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Cálculo preciso del porcentaje sin incluir días feriados ni suspensiones programadas.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Calendario mensual interactivo con código de colores y métricas consolidadas.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El usuario navega a la ficha del estudiante y selecciona la pestaña 'Asistencia'.
2. El sistema consulta las asistencias y calcula: % de Asistencia, N° de Faltas injustificadas y N° de Tardanzas.
3. Muestra un calendario visual donde cada día tiene un color (Verde, Amarillo, Rojo, Azul).
4. El usuario puede hacer clic en cualquier día para ver la hora exacta de ingreso registrada en portería o aula.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Descarga de récord: Opción para imprimir el reporte individual de asistencia en PDF para entrega a padres de familia.**

---

## 7. Reglas de Negocio Asociadas

* **RN-AST-05: Porcentaje de asistencia calculado como: (Asistencias + Justificadas) / Total de días hábiles transcurridos * 100.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Tarjeta de métricas clave superior (% global, total faltas, tardanzas) y calendario mensual tipo cuadrícula con tooltip interactivo por día.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-23](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-23.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
