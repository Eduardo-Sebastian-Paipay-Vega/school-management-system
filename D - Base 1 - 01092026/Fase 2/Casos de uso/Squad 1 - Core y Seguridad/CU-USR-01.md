# CU-USR-01: Registro y Alta Formal de Personal Institucional

**Requisito Trazable:** [RF-05](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-05.md)  
**Módulo:** Módulo 2: Administración de Usuarios y Directorio  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media  

---

## 1. Resumen y Alcance

Permite registrar un miembro del personal en su institución y asignarle un rol. La invitación para activar la cuenta se envía mediante una acción explícita posterior al alta.

---

## 2. Actores Involucrados

* **Actor Primario:** Administrador / Responsable de Recursos Humanos
* **Actores Secundarios / Sistemas:** Base de Datos, servicio de correo transaccional. La validación de formato del DNI es local; no existe conexión directa con RENIEC.

---

## 3. Precondiciones

* El administrador cuenta con los privilegios de creación de usuarios.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  No se crean usuarios duplicados; la transacción se revierte si el DNI o email ya existen.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Persona y cuenta pendientes registradas en `personas` y `usuarios`, con rol asociado y auditoría. La invitación se envía solo por acción explícita; la activación requiere que el titular defina su contraseña.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El administrador ingresa al módulo 'Directorio > Nuevo Usuario'.
2. Ingresa DNI, nombres, apellidos, correo institucional, teléfono y tipo de contrato.
3. Asigna el rol principal (Docente, Administrativo, Portería, Practicante).
4. Presiona 'Crear Usuario'.
5. El sistema valida identidad y correo dentro de la institución sin divulgar datos de otra.
6. Registra o vincula la persona y crea la cuenta pendiente, sin contraseña provisional conocida; registra el alta en auditoría.
7. Posteriormente, el administrador acciona «Enviar invitación» y el sistema envía un enlace de un solo uso; el titular define su contraseña y activa la cuenta dentro del plazo de 72 horas.

---

## 6. Flujos Alternativos y Excepciones

* **4a. DNI o correo duplicado:** El sistema impide duplicar la cuenta sin revelar información de otro tenant.
* **7a. Fallo de correo:** La cuenta queda pendiente, se informa el fallo y el administrador puede reintentar la invitación sin duplicar el alta.
* **7b. Enlace vencido o usado:** No se activa la cuenta; el administrador puede emitir una nueva invitación.

---

## 7. Reglas de Negocio Asociadas

* **RN-USR-01: El DNI debe ser exactamente de 8 dígitos numéricos válidos.**
* **RN-USR-02: La cuenta no puede autenticarse hasta que su titular defina la contraseña mediante una invitación vigente de un solo uso.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Formulario de dos columnas con validación reactiva, selector de roles con insignias y botón de guardado con estado de carga.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-05](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-05.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
