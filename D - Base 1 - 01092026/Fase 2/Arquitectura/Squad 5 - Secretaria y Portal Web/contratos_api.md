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
