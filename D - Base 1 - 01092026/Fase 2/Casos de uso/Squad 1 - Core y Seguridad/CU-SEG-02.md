# CU-SEG-02: Cierre de Sesión Seguro y Terminación por Inactividad

**Requisito Trazable:** [RF-02](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-02.md)  
**Módulo:** Módulo 1: Acceso, Autenticación JWT y RBAC  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta (Al finalizar la jornada o cambio de turno)  

---

## 1. Resumen y Alcance

Permite al usuario finalizar su sesión activa o ser desconectado automáticamente tras 30 minutos de inactividad, invalidando sus credenciales de sesión.

---

## 2. Actores Involucrados

* **Actor Primario:** Cualquier usuario con sesión activa
* **Actores Secundarios / Sistemas:** Servicio de Autenticación, Redis (Token Blacklist)

---

## 3. Precondiciones

* El usuario cuenta con una sesión iniciada y tokens válidos.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  La sesión en el cliente se destruye localmente aun si falla la conexión de red al servidor.

* **Garantía de Éxito (Postcondición Exitosa):**  
  El Refresh Token es revocado en base de datos, el Access Token se agrega a la lista de revocación en Redis, las cookies se limpian y se redirige a la pantalla de login.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El usuario hace clic en su avatar de perfil y selecciona 'Cerrar Sesión'.
2. El frontend envía la solicitud POST /api/v1/auth/logout.
3. El backend extrae el token JWT, lo añade a la blacklist en Redis con TTL igual a su expiración remanente.
4. El backend elimina la cookie HttpOnly del Refresh Token configurándola con Max-Age=0.
5. El backend registra el evento de cierre de sesión en audit_logs.
6. El frontend limpia todos los estados de sesión en memoria (Riverpod/Bloc) y redirige a /login.

---

## 6. Flujos Alternativos y Excepciones

* **1a. Terminación automática por inactividad: El temporizador del cliente detecta 30 minutos sin eventos de teclado/ratón/touch; despliega un modal con cuenta regresiva de 60 segundos; si no hay respuesta, ejecuta el flujo de logout automáticamente.**

---

## 7. Reglas de Negocio Asociadas

* **RN-SEG-04: Todo token invalidado debe ser rechazado inmediatamente en solicitudes subsiguientes.**
* **RN-SEG-05: El tiempo máximo de inactividad sin interacción es de 30 minutos en quioscos y aulas.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Menú desplegable en la esquina superior derecha con botón de cierre de sesión destacado en color rojo; modal emergente de aviso previo por inactividad.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-02](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-02.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
