# CU-USR-06: Modificación de Datos y Baja Lógica de Usuarios del Plantel

**Requisito Trazable:** [RF-72](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-72.md)  
**Módulo:** Módulo 2: Administración de Usuarios y Directorio  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media (Cambios de personal, fin de contratos y correcciones de datos)  

---

## 1. Resumen y Alcance

Permite corregir los datos de una cuenta existente y darla de baja sin borrarla, de modo que la persona deje de acceder al sistema mientras su historial académico y de auditoría se conserva intacto. Incluye la reactivación de cuentas dadas de baja.

---

## 2. Actores Involucrados

* **Actor Primario:** Administrador del Sistema
* **Actores Secundarios / Sistemas:** Dirección General (solicita la baja), Redis (lista negra de tokens), Servicio de Auditoría (RF-65), PostgreSQL

---

## 3. Precondiciones

* El usuario existe en el mismo tenant que el administrador.
* El administrador tiene una sesión activa con rol Administrador TI o Dirección General.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Si la operación falla, la cuenta conserva su estado y datos anteriores; no quedan cambios parciales.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Los datos quedan actualizados o la cuenta queda en estado INACTIVO con sus sesiones revocadas, y la bitácora registra el valor anterior y el nuevo.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El administrador busca al usuario en el directorio (CU-USR-04) y abre su ficha.
2. Elige "Editar datos", modifica los campos necesarios y guarda.
3. El sistema valida los campos, persiste solo los cambiados y registra la modificación en la bitácora.
4. Para una baja, el administrador elige "Dar de baja" e ingresa el motivo.
5. El sistema muestra un resumen del impacto: sesiones activas y asignaciones vigentes (carga lectiva, tutorías de practicantes).
6. El administrador confirma la baja.
7. El sistema cambia el estado a INACTIVO, revoca los tokens activos y registra la acción con su motivo.

---

## 6. Flujos Alternativos y Excepciones

* **2a. Correo duplicado: el sistema rechaza el cambio e indica que el correo ya pertenece a otra cuenta del plantel.**
* **5a. Usuario con asignaciones vigentes: el sistema permite la baja pero las asignaciones quedan señaladas para su reasignación por Coordinación.**
* **6a. Intento de darse de baja a sí mismo: el sistema rechaza la operación.**
* **7a. Reactivación: el administrador abre una cuenta INACTIVA y elige "Reactivar"; el sistema la devuelve a ACTIVO y fuerza el cambio de contraseña en el siguiente acceso (RN-USR-02).**

---

## 7. Reglas de Negocio Asociadas

* **RN-USR-07: Los campos como DNI y Rol solo pueden ser modificados por el Administrador.**
* **RN-USR-08: Ninguna cuenta se elimina físicamente; la baja es siempre lógica y requiere motivo.**
* **RN-USR-09: Una cuenta inactiva no puede iniciar sesión ni recibir asignaciones nuevas.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Ficha del usuario con modo edición en línea, insignia de estado (Activo / Inactivo) y botón "Dar de baja" en color de advertencia que abre un diálogo de confirmación con el campo de motivo y el resumen de impacto.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-72](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-72.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
