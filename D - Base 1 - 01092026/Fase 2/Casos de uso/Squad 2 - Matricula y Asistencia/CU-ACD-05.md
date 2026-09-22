# CU-ACD-05: Consulta y Generación de Nóminas Oficiales de Aula

**Requisito Trazable:** [RF-19](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-19.md)  
**Módulo:** Módulo 4: Gestión Académica, Matrícula y Carga Lectiva  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta  

---

## 1. Resumen y Alcance

Permite visualizar y descargar la nómina de matrícula oficial de cada sección ordenada alfabéticamente por apellidos y nombres con DNI y estado.

---

## 2. Actores Involucrados

* **Actor Primario:** Docentes, Secretaría, Directivos
* **Actores Secundarios / Sistemas:** Generador de Reportes, Base de Datos

---

## 3. Precondiciones

* Estudiantes matriculados en la sección.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Listado fiel a la base de datos sin omisiones.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Nómina descargable en PDF con membrete institucional o exportable a Excel.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El usuario accede a 'Gestión de Aulas > Nóminas'.
2. Filtra por Nivel, Grado y Sección.
3. El sistema muestra la lista de estudiantes con foto, DNI, edad y condición.
4. Presiona 'Exportar Nómina Oficial (PDF)'.
5. El sistema genera el documento formateado listo para impresión.

---

## 6. Flujos Alternativos y Excepciones

* **2a. Sección sin estudiantes matriculados: Mensaje informativo 'No se registran alumnos matriculados en esta sección'.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ACD-06: El orden de la nómina debe ser estrictamente alfabético por apellido paterno, materno y nombres.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Tabla con vista de lista o tarjetas de carné, botón de exportación rápida a PDF y Excel.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-19](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-19.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
