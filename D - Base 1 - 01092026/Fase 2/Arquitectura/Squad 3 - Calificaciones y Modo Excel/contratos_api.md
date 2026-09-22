# Contratos de API REST: Calificaciones y Planilla Modo Excel

---

## 1. Matriz de Calificaciones para Planilla Docente

### `GET /grades/matrix`
Obtiene los estudiantes de la sección y las columnas de evaluación activas.

* **Query Params:** `seccionId=UUID`, `cursoId=UUID`, `periodoId=UUID`
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "columns": [
      { "id": "ev-1", "nombre": "Práctica 1", "peso": 1.0 },
      { "id": "ev-2", "nombre": "Rúbrica Oral", "peso": 1.5 }
    ],
    "students": [
      {
        "matriculaId": "mat-101",
        "orden": 1,
        "apellidosNombres": "Alarcón Gómez, María",
        "grades": {
          "ev-1": { "calificacionId": "cal-1", "vigesimal": 17.5, "literal": "A", "version": 2 },
          "ev-2": { "calificacionId": "cal-2", "vigesimal": 19.0, "literal": "AD", "version": 1 }
        },
        "promedioCalculado": { "vigesimal": 18.4, "literal": "AD" }
      }
    ]
  }
}
```

---

## 2. Guardado Masivo Asistido (Auto-Guardado con Debounce)

### `PATCH /grades/batch-save`
Persiste concurrentemente las modificaciones de celdas con bloqueo optimista.

* **Request Body:**
```json
{
  "items": [
    {
      "matriculaId": "mat-101",
      "evaluacionId": "ev-1",
      "notaVigesimal": 18.0,
      "versionLock": 2
    }
  ]
}
```
* **Response 200 OK:**
```json
{
  "success": true,
  "updatedCount": 1,
  "results": [
    {
      "evaluacionId": "ev-1",
      "matriculaId": "mat-101",
      "notaVigesimal": 18.0,
      "notaLiteral": "AD",
      "newVersion": 3,
      "status": "SAVED"
    }
  ]
}
```
