# CU-SEG-01: Iniciar Sesión en la Plataforma

**Requisito Trazable:** [RF-01](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-01.md)  
**Módulo:** Módulo 1: Acceso, Autenticación JWT y RBAC  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Muy Alta (Múltiples veces por día)  

---

## 1. Resumen y Alcance

Permite al usuario autenticarse de forma segura mediante sus credenciales institucionales (DNI o username y contraseña cifrada), obteniendo tokens de acceso y sesión según su rol.

---

## 2. Actores Involucrados

* **Actor Primario:** Toda la comunidad escolar (Directivos, Docentes, Estudiantes, Personal de Portería, Superadmin)
* **Actores Secundarios / Sistemas:** Servicio de Autenticación, PostgreSQL, Redis (Rate Limiting)

---

## 3. Precondiciones

* El usuario debe existir en el directorio institucional, encontrarse en estado 'activo' y pertenecer a una sede habilitada.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Acceso denegado, no se emite ningún token. Si supera 5 intentos fallidos por IP o usuario, se bloquea temporalmente por 15 minutos y se registra en audit_logs.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Se emite un par de tokens JWT (Access Token de 15 min en memoria, Refresh Token de 7 días en cookie segura HttpOnly). Redirección inmediata a la vista dashboard correspondiente al rol.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El usuario accede a la URL institucional y visualiza la pantalla de autenticación.
2. El usuario ingresa su DNI o nombre de usuario institucional y su contraseña.
3. El usuario presiona el botón 'Iniciar Sesión'.
4. El frontend envía la solicitud POST /api/v1/auth/login cifrada mediante HTTPS.
5. El backend valida el rate limiting en Redis (máximo 5 intentos por ventana de 15 minutos).
6. El backend consulta la base de datos PostgreSQL comparando el hash bcrypt de la contraseña.
7. El backend verifica que el usuario esté activo y resuelve sus roles y permisos asignados.
8. El backend genera el Access Token JWT y el Refresh Token con claims de roles y tenant_id.
9. El backend registra el evento de inicio de sesión exitoso en la tabla inmutable audit_logs.
10. El frontend recibe la respuesta exitosa, almacena el token en memoria segura y redirige al dashboard del usuario.

---

## 6. Flujos Alternativos y Excepciones

* **2a. Credenciales incorrectas: El sistema incrementa el contador de intentos en Redis, retorna error 401 Unauthorized ('Credenciales inválidas') y registra el intento fallido en audit_logs.**
* **2b. Cuenta inactiva o suspendida: El sistema retorna error 403 Forbidden indicando que la cuenta se encuentra deshabilitada y remite a Secretaría.**
* **2c. Tasa de intentos excedida (Rate Limit): El sistema rechaza la solicitud con código 429 Too Many Requests bloqueando la IP por 15 minutos.**
* **2d. Primer inicio de sesión o contraseña provisional: El sistema fuerza la redirección al CU-USR-05 para el cambio obligatorio de contraseña.**

---

## 7. Reglas de Negocio Asociadas

* **RN-SEG-01: Contraseñas almacenadas exclusivamente con algoritmo bcrypt (factor de coste >= 12).**
* **RN-SEG-02: Rate limiting de máximo 5 intentos fallidos antes de bloqueo temporal de 15 minutos.**
* **RN-SEG-03: Refresh token almacenado estrictamente en cookie HttpOnly, Secure, SameSite=Strict.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Formulario centrado con logo institucional del plantel 'Guamán Poma de Ayala', campos de texto con validación en vivo para DNI y contraseña con botón mostrar/ocultar contraseña, y botón de acción principal.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-01](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-01.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
