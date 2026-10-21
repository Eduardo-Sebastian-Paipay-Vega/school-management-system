# CU-USR-07: Reasignación Dinámica de Roles y Jerarquías del Personal

**Requisito Trazable:** [RF-73](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-73.md)  
**Módulo:** Módulo 2: Administración de Usuarios y Directorio  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Baja (Inicio de año o cambios de cargo)  

---

## 1. Resumen y Alcance

Permite cambiar los roles de un usuario existente, por ejemplo cuando un docente asume la coordinación académica, sin recrear su cuenta. Los nuevos permisos se aplican desde su siguiente petición.

---

## 2. Actores Involucrados

* **Actor Primario:** Administrador del Sistema
* **Actores Secundarios / Sistemas:** Dirección General (autoriza el cambio de cargo), Motor RBAC (RF-04), Redis (invalidación de tokens), Servicio de Auditoría (RF-65)

---

## 3. Precondiciones

* El usuario está activo en el tenant.
* Los roles de destino existen en la matriz RBAC.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  El usuario conserva sus roles anteriores; ningún cambio se aplica de forma parcial.

* **Garantía de Éxito (Postcondición Exitosa):**  
  El usuario opera con los permisos de sus roles vigentes desde su siguiente petición y la bitácora registra el cambio con su motivo.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El administrador abre la ficha del usuario y elige "Gestionar roles".
2. El sistema muestra los roles actuales y los disponibles en la matriz RBAC, con el resumen de permisos de cada uno.
3. El administrador agrega o retira roles e ingresa el motivo (por ejemplo, el número de resolución).
4. El sistema valida las reglas de negocio y muestra la diferencia de permisos (qué gana y qué pierde).
5. El administrador confirma.
6. El sistema persiste los roles, invalida los tokens vigentes del usuario y registra el cambio en la bitácora.

---

## 6. Flujos Alternativos y Excepciones

* **4a. El usuario quedaría sin roles: el sistema rechaza el cambio.**
* **4b. Se retira el rol de Administrador al último administrador activo, o el administrador intenta quitárselo a sí mismo: el sistema rechaza el cambio.**
* **4c. El rol retirado sostiene asignaciones vigentes (por ejemplo, carga lectiva de un docente): el sistema advierte y las señala para su revisión por Coordinación.**

---

## 7. Reglas de Negocio Asociadas

* **RN-USR-07: Los campos como DNI y Rol solo pueden ser modificados por el Administrador.**
* **RN-USR-10: Todo usuario activo debe conservar al menos un rol.**
* **RN-USR-11: Cada tenant debe mantener al menos un usuario activo con rol Administrador.**
* **RN-USR-12: Todo cambio de rol exige un motivo, que queda en la bitácora de auditoría.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Lista de roles con casillas de selección, panel lateral con la diferencia de permisos (agregados en verde, retirados en rojo) y campo de motivo obligatorio antes de habilitar el botón "Aplicar cambios".

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-73](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-73.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
