# CU-INS-03: Estructuración de Niveles Educativos, Grados y Secciones

**Requisito Trazable:** [RF-12](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-12.md)  
**Módulo:** Módulo 3: Configuración Escolar, Periodos y Escalas  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Baja  

---

## 1. Resumen y Alcance

Permite configurar los grados académicos y sus secciones (ej. 1° 'A', 2° 'B') definiendo los límites de vacantes por aula.

---

## 2. Actores Involucrados

* **Actor Primario:** Administrador / Coordinador Académico
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* El año lectivo y los niveles educativos están activos.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  No se pueden eliminar secciones que contengan estudiantes matriculados.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Estructura de grados y secciones creada y lista para el proceso de matrícula.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El usuario navega a 'Estructura Escolar > Grados y Secciones'.
2. Selecciona el nivel (Primaria o Secundaria).
3. Agrega una nueva sección indicando grado, letra identificadora, turno y capacidad máxima de alumnos (aforo).
4. Presiona 'Guardar Sección'.
5. El sistema verifica que no exista duplicidad de sección en el mismo grado y guarda el registro.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Sección duplicada: Mensaje de error 'La sección 1° A ya se encuentra registrada en este periodo'.**

---

## 7. Reglas de Negocio Asociadas

* **RN-INS-04: El aforo máximo por aula no debe exceder las 35 vacantes salvo autorización directiva expresa.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Árbol jerárquico expandible (Nivel > Grado > Sección) con conteo de vacantes en tiempo real.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-12](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-12.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
