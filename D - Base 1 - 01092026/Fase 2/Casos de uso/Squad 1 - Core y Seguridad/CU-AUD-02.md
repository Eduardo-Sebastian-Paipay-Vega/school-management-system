# CU-AUD-02: Trazabilidad Histórica de Modificaciones en Notas y Asistencias

**Requisito Trazable:** [RF-66](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-66.md)  
**Módulo:** Módulo 12: Trazabilidad, Auditoría y Protección de Datos (Ley 29733)  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Subfunción del Sistema  
**Frecuencia de Uso:** Muy Alta (En cada guardado de notas o cambios de asistencia)  

---

## 1. Resumen y Alcance

Registra el valor anterior y el nuevo valor de cada celda de calificación o registro de asistencia modificado, documentando autor, fecha y motivo.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente / Auxiliar / Administrador (Generador del cambio)
* **Actores Secundarios / Sistemas:** PostgreSQL (Triggers / Temporal Tables)

---

## 3. Precondiciones

* Modificación de un registro existente de nota o asistencia.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Garantía de trazabilidad completa: nunca se sobrescribe un dato histórico sin conservar su versión previa.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Registro de versionado insertado en grade_audit_history o attendance_audit_history con diff de valores.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El usuario modifica una nota o justificación de asistencia.
2. El backend captura el valor previo (old_value) y el nuevo valor (new_value).
3. Inserta en la tabla histórica el cambio con la justificación ingresada.
4. Actualiza el registro maestro.
5. Emite evento de auditoría para consulta histórica.

---

## 6. Flujos Alternativos y Excepciones

* **2a. Rectificación de nota cerrada: Exige obligatoriamente el código de resolución o motivo justificado.**

---

## 7. Reglas de Negocio Asociadas

* **RN-AUD-02: Las rectificaciones de notas cerradas deben almacenar el motivo obligatorio y usuario autorizante.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Icono de reloj en cada celda del registro de notas que al cliquear abre el historial con línea de tiempo de cambios.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-66](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-66.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
