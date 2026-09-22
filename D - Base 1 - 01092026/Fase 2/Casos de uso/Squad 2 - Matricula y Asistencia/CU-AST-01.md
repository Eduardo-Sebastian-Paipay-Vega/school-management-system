# CU-AST-01: Registro Ordinario de Asistencia Escolar en el Aula

**Requisito Trazable:** [RF-20](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-20.md)  
**Módulo:** Módulo 5: Asistencia Estudiantil, Kiosco Offline-First, Carnés QR y App Móvil  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Diaria (Al inicio de cada jornada)  

---

## 1. Resumen y Alcance

Permite registrar el estado de asistencia de cada estudiante (Presente, Tardanza, Falta, Falta Justificada) en la primera hora de clase o por sesión.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente de Aula / Auxiliar de Educación
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* El docente tiene asignada la sección y la fecha corresponde a un día lectivo.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Si no se confirma el envío, los cambios no confirmados se conservan en memoria local.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Asistencia registrada en la base de datos con fecha, hora y usuario que la tomó.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente ingresa a 'Asistencia > Tomar Asistencia'.
2. Selecciona su sección del día.
3. El sistema presenta la nómina con el estado por defecto 'Presente' para agilizar el proceso.
4. El docente marca con un toque a los alumnos con Tardanza o Falta.
5. Presiona 'Guardar Asistencia'.
6. El sistema persiste el lote de asistencias y actualiza los indicadores.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Modificación dentro de la misma jornada: El docente puede rectificar el estado de asistencia antes del cierre diario.**

---

## 7. Reglas de Negocio Asociadas

* **RN-AST-01: Por defecto, todos los estudiantes inician marcados como 'Presentes' para reducir el tiempo de pase de lista a menos de 45 segundos.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Botones de alternancia de estado (Toggle Buttons) con colores intuitivos: Verde = Presente, Amarillo = Tardanza, Rojo = Falta, Azul = Justificada.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-20](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-20.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
