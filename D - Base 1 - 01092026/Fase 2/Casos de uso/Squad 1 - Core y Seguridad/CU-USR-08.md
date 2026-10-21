# CU-USR-08: Cuenta del Apoderado con Vínculo Verificado y Consentimiento de Datos

**Requisito Trazable:** [RF-75](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-75.md)  
**Módulo:** Módulo 2: Administración de Usuarios y Directorio  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta (Inicio del año escolar)  

---

## 1. Resumen y Alcance

Da acceso de solo lectura a los padres o tutores legales para que sigan las notas, tareas, exámenes y asistencia de sus hijos, con vínculo verificado y consentimiento de datos.

---

## 2. Actores Involucrados

* **Actor Primario:** Secretaría Académica
* **Actores Secundarios / Sistemas:** Apoderado, Servicio de Correo, Servicio de Auditoría (RF-65)

---

## 3. Precondiciones

* El estudiante tiene ficha registrada con al menos un apoderado (RF-15).
* Sesión de Secretaría Académica para la vinculación.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Si el DNI no coincide con la ficha del estudiante o el consentimiento no se acepta, no se crea ni activa ninguna cuenta.

* **Garantía de Éxito (Postcondición Exitosa):**  
  El apoderado accede con su cuenta propia y solo ve a los estudiantes vinculados.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. Secretaría abre la ficha del estudiante y elige 'Invitar apoderado'.
2. El sistema muestra los apoderados registrados en la ficha y Secretaría selecciona uno.
3. El sistema valida el DNI y el correo, y envía la invitación.
4. El apoderado abre el enlace, define su contraseña y lee el consentimiento de datos.
5. El apoderado acepta el consentimiento y el sistema activa la cuenta.
6. El apoderado ve el panel con la lista de sus hijos vinculados.

---

## 6. Flujos Alternativos y Excepciones

* **3a. El apoderado ya tiene cuenta por otro hijo: el sistema agrega el nuevo vínculo sin crear otra cuenta.**
* **4a. Enlace vencido: el apoderado solicita uno nuevo a Secretaría.**
* **5a. El apoderado rechaza el consentimiento: la cuenta queda sin activar.**

---

## 7. Reglas de Negocio Asociadas

* **RN-USR-13: Un apoderado solo puede vincularse a estudiantes en cuya ficha figura con el mismo DNI.**
* **RN-USR-14: El rol Apoderado es de solo lectura sobre los datos de sus estudiantes vinculados.**
* **RN-USR-15: El consentimiento de datos se registra con versión, fecha e IP, y puede revocarse.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Panel del apoderado con tarjetas por hijo (foto, grado y sección) y accesos a Notas, Tareas y exámenes, Asistencia y Comunicados.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-75](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-75.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
