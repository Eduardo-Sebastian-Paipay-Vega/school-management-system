# CU-USR-05: Gestión de Perfil Personal y Cambio Autónomo de Credenciales

**Requisito Trazable:** [RF-09](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-09.md)  
**Módulo:** Módulo 2: Administración de Usuarios y Directorio  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Baja  

---

## 1. Resumen y Alcance

Permite al usuario actualizar sus datos de contacto personales y cambiar su contraseña de acceso verificando su clave actual.

---

## 2. Actores Involucrados

* **Actor Primario:** Cualquier usuario autenticado
* **Actores Secundarios / Sistemas:** Servicio de Autenticación, Base de Datos

---

## 3. Precondiciones

* El usuario tiene sesión activa.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Si la contraseña actual no coincide, no se aplica ningún cambio y se registra la tentativa.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Contraseña actualizada, sesiones secundarias revocadas y datos de contacto refrescados.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El usuario accede a 'Mi Perfil'.
2. Visualiza sus datos institucionales (no modificables) y sus datos de contacto (editables).
3. Ingresa a la pestaña 'Seguridad'.
4. Digita su contraseña actual, nueva contraseña y confirmación.
5. Presiona 'Actualizar Contraseña'.
6. El sistema valida la contraseña actual contra el hash en base de datos.
7. El sistema verifica las políticas de seguridad de la nueva contraseña.
8. Actualiza el hash en PostgreSQL y envía correo de notificación de seguridad.

---

## 6. Flujos Alternativos y Excepciones

* **5a. Contraseña actual incorrecta: Error 'La contraseña actual no es correcta'.**
* **6a. Nueva contraseña igual a la anterior: Error 'La nueva contraseña debe ser distinta a las anteriores'.**

---

## 7. Reglas de Negocio Asociadas

* **RN-USR-06: No se permite reutilizar las últimas 3 contraseñas.**
* **RN-USR-07: Los campos como DNI y Rol solo pueden ser modificados por el Administrador.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Pestañas 'Información General' y 'Seguridad y Privacidad', campos de formulario con indicadores visuales de validación.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-09](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-09.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
