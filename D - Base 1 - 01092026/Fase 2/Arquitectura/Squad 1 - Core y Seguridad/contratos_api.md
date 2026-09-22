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
