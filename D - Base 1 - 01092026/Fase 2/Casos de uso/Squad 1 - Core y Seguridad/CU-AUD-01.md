# CU-AUD-01: Registro Inmutable de Auditoría de Eventos y Seguridad

**Requisito Trazable:** [RF-65](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-65.md)  
**Módulo:** Módulo 12: Trazabilidad, Auditoría y Protección de Datos (Ley 29733)  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Subfunción del Sistema  
**Frecuencia de Uso:** Constante (En cada petición sensible)  

---

## 1. Resumen y Alcance

Registra automáticamente en una bitácora inmutable (solo inserción, sin update ni delete) todo intento de inicio de sesión, cambio de roles y acceso no autorizado.

---

## 2. Actores Involucrados

* **Actor Primario:** Sistema (Automático por eventos del usuario)
* **Actores Secundarios / Sistemas:** Tabla audit_logs, PostgreSQL

---

## 3. Precondiciones

* Ocurrencia de un evento de seguridad en cualquier capa de la aplicación.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Si el registro de auditoría falla, la transacción de seguridad sensible se cancela (Fail-Secure).

* **Garantía de Éxito (Postcondición Exitosa):**  
  Fila insertada en audit_logs con timestamp UTC, user_id, ip_address, user_agent, action y payload.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El interceptor HTTP/Service detecta una acción de seguridad (ej. login, logout, cambio de clave).
2. Extrae los metadatos de la solicitud: dirección IP, navegador, ID de usuario y sede.
3. Construye el registro de auditoría serializado en JSONB.
4. Ejecuta el INSERT en la tabla audit_logs dentro de la transacción.
5. La base de datos asegura mediante triggers que no existan operaciones de modificación o borrado.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Petición no autenticada: Se registra user_id=NULL e ip_address con la acción 'ANONYMOUS_SECURITY_EVENT'.**

---

## 7. Reglas de Negocio Asociadas

* **RN-AUD-01: Prohibida la eliminación o modificación física de registros de auditoría por cualquier rol de usuario.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Transparente para el usuario final; visible únicamente en el módulo de auditoría de administradores.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-65](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-65.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
