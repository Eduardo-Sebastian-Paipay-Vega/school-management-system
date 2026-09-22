# CU-ACD-01: Registro, Filiación y Actualización de Ficha de Estudiante

**Requisito Trazable:** [RF-15](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-15.md)  
**Módulo:** Módulo 4: Gestión Académica, Matrícula y Carga Lectiva  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta (En periodos de inscripción)  

---

## 1. Resumen y Alcance

Permite registrar y actualizar la información de filiación del estudiante: datos personales, DNI, dirección, datos de los padres/apoderados y ficha médica básica.

---

## 2. Actores Involucrados

* **Actor Primario:** Personal de Secretaría / Administrador
* **Actores Secundarios / Sistemas:** Base de Datos PostgreSQL

---

## 3. Precondiciones

* Usuario con privilegios de Secretaría o Administración.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  No se permite registrar dos estudiantes con el mismo DNI.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Ficha del estudiante persistida y asignación de código único de estudiante (ej. EST-2026-XXXX).

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El operador de secretaría ingresa a 'Estudiantes > Nuevo Registro'.
2. Digita el DNI del estudiante y el sistema valida formato y no duplicidad.
3. Completa nombres, apellidos, fecha de nacimiento, sexo, dirección y lengua materna.
4. Registra los datos del apoderado legal (nombre, parentesco, teléfono y correo).
5. Presiona 'Guardar Ficha del Estudiante'.
6. El sistema almacena el registro y genera el código institucional de matrícula.

---

## 6. Flujos Alternativos y Excepciones

* **2a. DNI existente: El sistema advierte que el estudiante ya existe y ofrece abrir su expediente actual.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ACD-01: El DNI debe ser único por estudiante.**
* **RN-ACD-02: Es obligatorio consignar al menos un apoderado con teléfono de contacto.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Formulario por pasos (Wizard: 1. Datos Personales, 2. Apoderados, 3. Información Adicional) con guardado automático de borrador.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-15](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-15.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
