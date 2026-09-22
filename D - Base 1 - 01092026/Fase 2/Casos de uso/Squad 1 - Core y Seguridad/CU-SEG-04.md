# CU-SEG-04: Control de Privilegios y Acceso Basado en Roles (RBAC)

**Requisito Trazable:** [RF-04](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-04.md)  
**Módulo:** Módulo 1: Acceso, Autenticación JWT y RBAC  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Baja (Configuración inicial o reasignaciones)  

---

## 1. Resumen y Alcance

Permite definir y asignar roles granulares (Admin, Director, Docente, Practicante, Alumno, Portería) y restringir el acceso a vistas y endpoints de API.

---

## 2. Actores Involucrados

* **Actor Primario:** Superadmin / Director Institucional
* **Actores Secundarios / Sistemas:** Middleware de Autorización, Base de Datos

---

## 3. Precondiciones

* El actor debe tener el rol de Superadmin o Director General.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Denegación por defecto (Deny by default) ante cualquier ruta o acción no explícitamente autorizada.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Matriz de permisos persistida en base de datos e integrada en las directivas de seguridad del backend.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El administrador accede a la sección 'Seguridad > Roles y Permisos'.
2. Selecciona un rol existente o crea uno nuevo.
3. Marca los permisos específicos por módulo (lectura, escritura, edición, eliminación, aprobación).
4. Guarda los cambios.
5. El sistema actualiza la matriz en PostgreSQL y en el caché de autorización.
6. Cualquier petición subsiguiente de usuarios con ese rol aplica los nuevos privilegios inmediatamente.

---

## 6. Flujos Alternativos y Excepciones

* **5a. Intento de acceso a recurso no autorizado: El middleware intercepta la petición y responde con 403 Forbidden, registrando la alerta en audit_logs.**

---

## 7. Reglas de Negocio Asociadas

* **RN-SEG-08: Principio de mínimo privilegio aplicado estrictamente.**
* **RN-SEG-09: El rol de Superadmin no puede ser eliminado ni despojado de sus permisos críticos.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Matriz interactiva tipo checkbox por módulo y acción con switches de activación inmediata y resumen de usuarios afectados.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-04](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-04.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
