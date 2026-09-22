# CU-SEG-03: Restablecimiento Asistido de Contraseñas de Acceso

**Requisito Trazable:** [RF-03](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-03.md)  
**Módulo:** Módulo 1: Acceso, Autenticación JWT y RBAC  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media  

---

## 1. Resumen y Alcance

Permite restablecer la contraseña institucional mediante un enlace temporal firmado criptográficamente o por asistencia directa del Administrador.

---

## 2. Actores Involucrados

* **Actor Primario:** Usuario con contraseña olvidada / Administrador institucional
* **Actores Secundarios / Sistemas:** Servicio de Correo Institucional / SMS, Base de Datos

---

## 3. Precondiciones

* El usuario debe tener registrado un correo electrónico verificado o DNI en el padrón institucional.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  No se revela si el usuario o correo existe en el sistema para evitar enumeración de usuarios.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Se emite un token de restablecimiento de uso único (expiración 15 min) y se actualiza la contraseña con un nuevo hash bcrypt.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El usuario hace clic en '¿Olvidó su contraseña?' en la pantalla de inicio de sesión.
2. Ingresa su DNI o correo institucional registrado.
3. El sistema genera un token criptográfico HMAC de 64 caracteres con validez de 15 minutos.
4. El sistema envía el correo con el enlace seguro de restablecimiento.
5. El usuario accede al enlace, ingresa una nueva contraseña cumpliendo las políticas de complejidad y la confirma.
6. El backend valida el token, actualiza el hash bcrypt, invalida todas las sesiones previas y confirma el cambio.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Token expirado o reutilizado: El sistema informa que el enlace ya no es válido y solicita generar uno nuevo.**
* **2a. Asistencia por Secretaría/Admin: Un directivo genera una contraseña provisional que requerirá cambio forzoso en el siguiente login.**

---

## 7. Reglas de Negocio Asociadas

* **RN-SEG-06: La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y símbolo especial.**
* **RN-SEG-07: Los enlaces de recuperación expiran en exactamente 15 minutos y son de único uso.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Pantalla de solicitud de recuperación con verificación de captcha; formulario de ingreso de nueva contraseña con medidor de fortaleza en tiempo real.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-03](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-03.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
