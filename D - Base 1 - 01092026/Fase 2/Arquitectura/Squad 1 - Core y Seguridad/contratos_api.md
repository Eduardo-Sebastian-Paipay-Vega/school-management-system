# Contratos de API REST: Core, Seguridad y Auditoría

**Base URL:** `/api/v1`  
**Autenticación:** Cabecera `Authorization: Bearer <accessToken>` (salvo `/auth/login` y `/auth/refresh-token`).  

---

## 1. Autenticación y Sesiones

### `POST /auth/login`
Inicia sesión en la plataforma y genera tokens de acceso y refresco.

* **Request Body:**
```json
{
  "tenantModularCode": "0382910",
  "username": "72819203",
  "password": "Password123!"
}
```

* **Response 200 OK:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "dni": "72819203",
      "nombres": "Juan Carlos",
      "apellidos": "Quispe Flores",
      "roles": ["DOCENTE"],
      "tenantId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    }
  }
}
```
* **Cabeceras de Respuesta:**  
  `Set-Cookie: refreshToken=eyJhbGci...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/api/v1/auth`

---

### `POST /auth/refresh-token`
Renueva el Access Token utilizando la cookie segura HttpOnly.

* **Response 200 OK:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new...",
    "expiresIn": 900
  }
}
```

---

### `POST /auth/logout`
Revoca la sesión activa e ingresa el token actual en la lista negra de Redis.

* **Response 200 OK:**
```json
{
  "success": true,
  "message": "Sesión cerrada satisfactoriamente y token revocado."
}
```

---

## 2. Gestión de Usuarios

### `GET /users`
Lista paginada de usuarios de la sede activa.

* **Query Params:** `page=1`, `limit=20`, `role=DOCENTE`, `query=Quispe`, `estado=ACTIVO`
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "dni": "72819203",
        "nombres": "Juan Carlos",
        "apellidos": "Quispe Flores",
        "email": "jquispe@planteles.unsch.edu.pe",
        "roles": ["DOCENTE"],
        "estado": "ACTIVO"
      }
    ],
    "meta": { "totalItems": 42, "currentPage": 1, "totalPages": 3 }
  }
}
```

---

## 3. Bitácoras de Auditoría Inmutable

### `GET /audit/logs`
Consulta forense para directores (requiere rol `DIRECTIVO` o `SUPERADMIN`).

* **Query Params:** `from=2026-09-01`, `to=2026-09-21`, `modulo=NOTAS`, `userId=UUID`
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1892",
        "usuario": "Prof. Juan Carlos Quispe",
        "modulo": "NOTAS",
        "accion": "UPDATE",
        "ipOrigen": "190.119.245.12",
        "timestampUtc": "2026-09-21T18:30:10Z",
        "payloadAnterior": { "notaVigesimal": 11, "notaLiteral": "B" },
        "payloadNuevo": { "notaVigesimal": 16, "notaLiteral": "A" }
      }
    ]
  }
}
```

<!-- AMPLIACIÓN RF-72 A RF-89 -->
---

## 4. Edición, Baja Lógica y Roles de Usuarios (RF-72, RF-73)

### `PATCH /users/:id`
Modifica datos de una cuenta. Solo se persisten los campos enviados. DNI y roles solo los cambia el Administrador (RN-USR-07). Rol mínimo: `SUPERADMIN`, `DIRECTIVO`.

* **Request Body:**
```json
{ "email": "jperez@planteles.unsch.edu.pe", "telefono": "966123456", "nombres": "Juan Carlos" }
```
* **Response 200 OK:**
```json
{ "success": true, "data": { "id": "UUID", "estado": "ACTIVO", "updatedAt": "2026-10-21T14:05:00Z" } }
```
* **Errores:** formato estándar del backend:
```json
{ "success": false, "error": { "code": "EMAIL_ALREADY_IN_USE", "message": "El correo ya pertenece a otra cuenta del plantel." }, "timestamp": "2026-10-21T14:05:00Z" }
```

### `POST /users/:id/deactivate`
Baja lógica: estado `INACTIVO`, revoca los tokens activos (lista negra en Redis) y conserva el historial.

* **Request Body:** `{ "motivo": "Fin de contrato" }` (obligatorio)
* **Response 200 OK:**
```json
{ "success": true, "data": { "id": "UUID", "estado": "INACTIVO", "fechaBaja": "2026-10-21T14:05:00Z", "sesionesRevocadas": 2, "asignacionesPorReasignar": [{ "tipo": "CARGA_LECTIVA", "id": "UUID" }] } }
```
* **Errores:** formato estándar del backend:
```json
{ "success": false, "error": { "code": "CANNOT_DEACTIVATE_SELF", "message": "No puedes dar de baja tu propia cuenta." }, "timestamp": "2026-10-21T14:05:00Z" }
```

### `POST /users/:id/reactivate`
Devuelve la cuenta a `ACTIVO` y fuerza el cambio de contraseña (`PENDIENTE_CAMBIO_CLAVE`).

### `PUT /users/:id/roles`
Reemplaza la lista de roles del usuario. Invalida sus tokens vigentes para que el siguiente token incluya los nuevos permisos.

* **Request Body:**
```json
{ "roles": ["DOCENTE", "COORDINADOR_ACADEMICO"], "motivo": "Resolución Directoral N.° 045-2026" }
```
* **Response 200 OK:** `{ "success": true, "data": { "id": "UUID", "roles": ["DOCENTE", "COORDINADOR_ACADEMICO"], "permisosAgregados": 12, "permisosRetirados": 0 } }`
* **Errores:** formato estándar del backend:
```json
{ "success": false, "error": { "code": "LAST_ADMIN_REQUIRED", "message": "El plantel debe conservar al menos un administrador activo." }, "timestamp": "2026-10-21T14:05:00Z" }
```

Otros códigos: `USER_WITHOUT_ROLES` (lista vacía), `ROLE_NOT_FOUND`.

---

## 5. Apoderados (RF-75)

### `POST /guardians/invitations`
Secretaría invita a un apoderado registrado en la ficha del estudiante. Si el apoderado ya tiene cuenta, solo se agrega el vínculo.

* **Request Body:**
```json
{ "estudianteId": "UUID", "dni": "40112233", "email": "rosa.huaman@gmail.com", "telefono": "988776655", "parentesco": "MADRE" }
```
* **Response 201 Created:** `{ "success": true, "data": { "invitacionId": "UUID", "expiraEn": "2026-10-24T14:05:00Z", "cuentaExistente": false } }`
* **Errores:** formato estándar del backend:
```json
{ "success": false, "error": { "code": "GUARDIAN_DNI_MISMATCH", "message": "El DNI no coincide con el apoderado registrado en la ficha del estudiante." }, "timestamp": "2026-10-21T14:05:00Z" }
```

### `POST /public/guardians/activate`
Sin autenticación. Activa la cuenta con el token de un solo uso y registra el consentimiento.

* **Request Body:**
```json
{ "token": "c2f1...", "password": "Clave$egura2026", "aceptaConsentimiento": true, "versionConsentimiento": "2026-1" }
```
* **Response 200 OK:** `{ "success": true, "data": { "accessToken": "eyJ...", "expiresIn": 900 } }`
* **Errores:** `INVITATION_EXPIRED`, `INVITATION_USED`, `CONSENT_REQUIRED`.

### `GET /guardian/students`
Rol `APODERADO`. Lista los estudiantes vinculados.

* **Response 200 OK:**
```json
{ "success": true, "data": [{ "estudianteId": "UUID", "nombres": "Luis Huamán Quispe", "gradoSeccion": "2.° B - Secundaria", "fotoUrl": null }] }
```

### `DELETE /guardians/:guardianId/students/:studentId`
Desvincula al apoderado del estudiante; pierde el acceso de inmediato.

> **Regla transversal:** todo endpoint `/guardian/*` responde `403 GUARDIAN_NOT_LINKED` si el estudiante no está vinculado al apoderado, y registra el intento en `logs_auditoria`.

---

## 6. Centro de Notificaciones (RF-76)

### `GET /notifications?unread=true&page=1`
* **Response 200 OK:**
```json
{ "success": true, "data": { "noLeidas": 3, "items": [{ "id": "UUID", "categoria": "RECORDATORIO", "prioridad": "NORMAL", "titulo": "Registro de notas pendiente", "mensaje": "Matemática 3.° A vence en 2 días.", "enlace": "/intranet/notas/3A", "leidaEn": null, "createdAt": "2026-10-21T08:00:00Z" }] } }
```

### `PATCH /notifications/:id/read` · `POST /notifications/read-all`
Marcan como leídas. Respuesta `204 No Content`.

### `GET /notifications/preferences` · `PUT /notifications/preferences`
* **Request Body (PUT):** `{ "preferencias": [{ "categoria": "RECORDATORIO", "porCorreo": false }] }`
* **Errores:** `CATEGORY_MANDATORY` si se intenta desactivar el correo de `SEGURIDAD` (RN-USR-16).

### Evento WebSocket `notification:new` (namespace `/ws/notifications`)
Se emite al usuario destinatario en cuanto se crea la notificación: `{ "id": "UUID", "titulo": "...", "categoria": "...", "noLeidas": 4 }`.

### Contrato interno para los demás módulos
Los módulos no envían correos por su cuenta: llaman a `NotificationService.notify({ tenantId, usuarioIds, categoria, prioridad, titulo, mensaje, enlace })`, que guarda en `notificaciones`, emite el evento y encola en `envios_correo` según preferencias.
