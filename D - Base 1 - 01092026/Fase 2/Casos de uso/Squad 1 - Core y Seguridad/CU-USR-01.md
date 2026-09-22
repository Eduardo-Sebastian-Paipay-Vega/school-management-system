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

Permite registrar un nuevo miembro del personal (docente, administrativo, directivo o practicante) asignándole credenciales institucionales y rol.

---

## 2. Actores Involucrados

* **Actor Primario:** Administrador / Responsable de Recursos Humanos
* **Actores Secundarios / Sistemas:** Servicio RENIEC (Validación DNI referencial), Base de Datos

---

## 3. Precondiciones

* El administrador cuenta con los privilegios de creación de usuarios.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  No se crean usuarios duplicados; la transacción se revierte si el DNI o email ya existen.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Usuario creado en tabla users con perfil asociado, credenciales provisionales generadas y notificación enviada.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El administrador ingresa al módulo 'Directorio > Nuevo Usuario'.
2. Ingresa DNI, nombres, apellidos, correo institucional, teléfono y tipo de contrato.
3. Asigna el rol principal (Docente, Administrativo, Portería, Practicante).
4. Presiona 'Crear Usuario'.
5. El sistema valida la unicidad del DNI y correo electrónico.
6. Genera una contraseña segura provisional y registra al usuario en PostgreSQL.
7. Envía las credenciales al correo del usuario y registra el evento en auditoría.

---

## 6. Flujos Alternativos y Excepciones

* **4a. DNI o correo duplicado: El sistema muestra mensaje de error indicando el usuario existente con enlace a su ficha.**

---

## 7. Reglas de Negocio Asociadas

* **RN-USR-01: El DNI debe ser exactamente de 8 dígitos numéricos válidos.**
* **RN-USR-02: Todo usuario nuevo debe ser forzado a cambiar su contraseña provisional en su primer acceso.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Formulario de dos columnas con validación reactiva, selector de roles con insignias y botón de guardado con estado de carga.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-05](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-05.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
