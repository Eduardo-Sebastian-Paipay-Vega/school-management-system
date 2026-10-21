# Contratos de API REST: Secretaría, Criptografía y Portal Web

---

## 1. Verificación Pública de Documentos (Sin Autenticación)

### `GET /public/verify-document/:token`
Endpoint público y accesible para escanear con la cámara del celular.

* **Response 200 OK (Documento Auténtico):**
```json
{
  "success": true,
  "isValid": true,
  "data": {
    "tipoDocumento": "BOLETA_NOTAS",
    "estudiante": "Mendoza Vega, Carlos Rodrigo",
    "gradoSeccion": "3ro B - Secundaria",
    "periodo": "2do Bimestre 2026",
    "fechaEmision": "2026-09-20T11:45:00Z",
    "hashSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "calificacionesOficiales": [
      { "curso": "Matemática", "nota": "18 (AD)" },
      { "curso": "Comunicación", "nota": "16 (A)" }
    ]
  }
}
```

* **Response 404 Not Found (Documento Falso o No Registrado):**
```json
{
  "success": false,
  "isValid": false,
  "message": "ALERTA: El código QR no corresponde a ningún documento emitido oficialmente por los Planteles de Aplicación."
}
```

---

## 2. Emisión Masiva de Boletas en PDF

### `POST /documents/report-cards/generate-batch`
Genera las boletas PDF de una sección completa con sellos QR integrados.

* **Request Body:** `{ "seccionId": "UUID", "periodoId": "UUID" }`
* **Response 200 OK:**
```json
{
  "success": true,
  "message": "35 boletas generadas con firma digital exitosamente.",
  "downloadZipUrl": "https://storage.planteles.unsch.edu.pe/exports/boletas_3B_2026_II.zip"
}
```

<!-- AMPLIACIÓN RF-72 A RF-89 -->
---

## 3. Noticias del Portal (RF-84)

### `POST /news`
Crea un borrador. Body: `{ "titulo": "...", "resumen": "...", "cuerpoHtml": "<p>...</p>", "categoria": "INSTITUCIONAL", "etiquetas": ["aniversario"], "portadaUrl": "...", "portadaAlt": "Estudiantes en el desfile", "publicarEn": "2026-10-26T08:00:00-05:00", "compartirFacebook": true }`.

### `POST /news/:id/media` (multipart/form-data)
Sube imágenes de galería (máx. 20 de 5 MB); el servidor genera miniaturas. `texto_alternativo` es obligatorio.

### `PATCH /news/:id/status`
Transiciones: `EN_REVISION` (redactor), `APROBADA` o `BORRADOR` con observaciones (Dirección), `RETIRADA` (Dirección). Una noticia `APROBADA` se publica sola en `publicarEn` (RN-PUB-05).

### `GET /public/news?category=INSTITUCIONAL&page=1` · `GET /public/news/:slug`
Sin autenticación. Solo noticias `PUBLICADA`.

---

## 4. Integración con Facebook (RF-85)

### `GET /integrations/facebook/status`
`{ "data": { "estado": "CONECTADA", "pagina": "Planteles de Aplicación UNSCH", "tokenExpiraEn": "2026-12-20T00:00:00Z" } }`

### `POST /integrations/facebook/connect`
Recibe el `code` del flujo OAuth oficial de Meta, lo canjea por el token de página y lo guarda cifrado (RN-PUB-08). Body: `{ "code": "AQB...", "paginaId": "1234567890" }`.

### `DELETE /integrations/facebook`
Desconecta la página.

> Al publicarse una noticia con `compartirFacebook: true`, el worker llama a la Graph API (`POST /{page-id}/feed`) con resumen, portada y enlace, y guarda `facebook_post_id`. Si falla, la noticia sigue publicada en el portal y Comunicaciones recibe un aviso (`facebook_estado = FALLIDO`). Prohibido el scraping (RN-PUB-07).

---

## 5. Mesa de Partes Virtual (RF-86)

### `POST /public/mesa-partes` (multipart/form-data)
Sin autenticación (si hay sesión, se asocia `usuarioId`). Campos: `tipo`, `asunto`, `descripcion`, `nombre`, `dni`, `email`, `telefono`, `adjuntos[]` (PDF/JPG/PNG, máx. 5 de 5 MB).

* **Response 201 Created:**
```json
{ "success": true, "data": { "numero": "MP-2026-000123", "codigoSeguimiento": "K7P4-9QX2", "plazoVence": "2026-11-11" } }
```
El código de seguimiento solo se muestra una vez y se envía por correo; se guarda su hash.

### `GET /public/mesa-partes/track?numero=MP-2026-000123&codigo=K7P4-9QX2`
Devuelve estado, área y línea de tiempo, sin datos personales.

### `GET /mesa-partes?estado=DERIVADO&vencidos=true`
Bandeja interna (Secretaría, áreas, Dirección).

### `POST /mesa-partes/:id/actions`
Body: `{ "accion": "DERIVAR", "aArea": "COORDINACION", "comentario": "..." }`. Acciones: `DERIVAR`, `SOLICITAR_INFO` (suspende el plazo), `RESPONDER` (requiere `respuesta`), `ARCHIVAR`.

---

## 6. Certificados y Constancias en Línea (RF-87)

### `POST /certificates/requests`
Apoderado autenticado. Body: `{ "tipo": "CONSTANCIA_MATRICULA", "estudianteId": "UUID", "periodos": [], "motivo": "Trámite de beca" }`.

### `POST /public/certificates/requests`
Exalumno sin cuenta: `{ "tipo": "CERTIFICADO_ESTUDIOS", "dni": "70112233", "fechaNacimiento": "2008-03-14", "email": "exalumno@gmail.com", "periodos": ["UUID"] }`. Envía un código de verificación al correo antes de registrar la solicitud.

* **Errores:** `PERIOD_NOT_CLOSED` (RN-TRA-04), `NOT_ENTITLED`.

### `GET /certificates/requests?estado=SOLICITADO` · `POST /certificates/requests/:id/approve` · `POST /certificates/requests/:id/observe`
Bandeja de Secretaría. Aprobar genera el PDF, lo sella con SHA-256 y QR (RF-60) y crea el registro en `documentos_emitidos`. `POST /certificates/requests/approve-batch` aprueba constancias simples en lote (RN-TRA-06).

### `GET /certificates/requests/:id/download`
Descarga del PDF durante 30 días.

---

## 7. Archivos de Carga para el SIAGIE (RF-88)

### `POST /siagie/exports`
Body: `{ "periodoId": "UUID", "seccionIds": ["UUID"], "tipo": "NOTAS" }`. Solo periodos cerrados (RN-REP-08).

* **Response 200 OK:**
```json
{ "success": true, "data": [{ "seccion": "1.° A", "estado": "ARCHIVO_GENERADO", "descargaUrl": "/api/v1/siagie/exports/UUID/file", "hash": "9f2c..." }, { "seccion": "1.° B", "estado": "ERROR_VALIDACION", "errores": [{ "estudiante": "Rojas Lima, Pedro", "motivo": "Sin código SIAGIE" }] }] }
```

### `GET /siagie/exports?periodoId=UUID`
Tablero de avance por sección: `PENDIENTE`, `ARCHIVO_GENERADO`, `CARGADA_EN_SIAGIE`, `REQUIERE_NUEVA_CARGA`.

### `PATCH /siagie/exports/:id`
Marca la carga manual: `{ "estado": "CARGADA_EN_SIAGIE" }`. Una rectificación posterior de notas (RF-43) cambia el estado a `REQUIERE_NUEVA_CARGA`. No se guardan credenciales del SIAGIE (RN-REP-09).
