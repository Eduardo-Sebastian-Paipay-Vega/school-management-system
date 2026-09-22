# CU-ACD-02: Matrícula Escolar y Asignación de Estudiantes a Secciones

**Requisito Trazable:** [RF-16](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-16.md)  
**Módulo:** Módulo 4: Gestión Académica, Matrícula y Carga Lectiva  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta (Fase de matrícula)  

---

## 1. Resumen y Alcance

Permite formalizar la matrícula anual de un estudiante asignándole un nivel, grado y sección conforme a la disponibilidad de vacantes.

---

## 2. Actores Involucrados

* **Actor Primario:** Personal de Secretaría / Dirección
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* El estudiante está registrado y la sección cuenta con vacantes disponibles.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  No se permite sobrepasar el aforo límite configurado para el aula.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Matrícula registrada con estado 'Matriculado' y emisión de la constancia de matrícula.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El operador busca al estudiante por DNI o apellidos.
2. Accede a la opción 'Matricular en Periodo Actual'.
3. Selecciona el Grado y la Sección destino verificando el aforo disponible (ej. 28/35).
4. Indica la condición de matrícula (Promovido, Repitente, Traslado).
5. Presiona 'Confirmar Matrícula'.
6. El sistema decrementa en 1 la vacante disponible y vincula al estudiante con la sección.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Sección sin vacantes disponibles: El sistema bloquea la asignación y sugiere otras secciones disponibles del mismo grado.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ACD-03: Un estudiante solo puede tener una matrícula activa por año escolar.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Selector visual de grado y sección con medidor de aforo en porcentaje y color indicador de disponibilidad.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-16](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-16.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
