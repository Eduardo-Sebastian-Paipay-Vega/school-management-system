# Contratos de API REST y WebSockets: Asistencia y Kiosco

---

## 1. Endpoints de Kiosco y Sincronización en Lote

### `POST /attendance/kiosk/scan`
Procesa la lectura óptica directa de un código QR en portería.

* **Request Body:**
```json
{
  "qrToken": "SCH-QR-9821039821-A9B8C7",
  "scannedAt": "2026-09-22T07:42:15-05:00"
}
```
* **Response 200 OK (Dentro de horario):**
```json
{
  "success": true,
  "status": "PRESENTE",
  "student": {
    "nombres": "Carlos Rodrigo",
    "apellidos": "Mendoza Vega",
    "grado": "3ro Secundaria",
    "seccion": "A",
    "fotoUrl": "https://storage.planteles.unsch.edu.pe/photos/std-9821.jpg"
  }
}
```

---

### `POST /attendance/sync-bulk`
Recibe el paquete de sincronización acumulado en modo offline por el Kiosco.

* **Request Body:**
```json
{
  "deviceId": "KIOSK-PORTERIA-PUERTA-1",
  "records": [
    {
      "matriculaId": "3b29c920-1a22-482a-921a-482910cbe901",
      "fecha": "2026-09-22",
      "hora": "07:44:10",
      "estado": "PRESENTE",
      "origen": "KIOSCO_PORTERIA"
    }
  ]
}
```
* **Response 200 OK:**
```json
{
  "success": true,
  "syncedCount": 48,
  "skippedDuplicates": 2
}
```

---

## 2. Eventos de WebSockets (Socket.io)

### Namespace: `/ws/attendance`
* **Evento Emitido por App Móvil:** `classroom_mark`
  ```json
  {
    "seccionId": "UUID",
    "estudianteId": "UUID",
    "estado": "TARDANZA_INJUSTIFICADA",
    "timestamp": "2026-09-22T08:05:00Z"
  }
  ```
* **Evento Difundido a Dirección:** `live_attendance_update`
  ```json
  {
    "tipo": "ALUMNO_MARCADO",
    "totalPresentesHoy": 842,
    "totalTardanzasHoy": 24,
    "ultimoRegistro": {
      "alumno": "Carlos Mendoza",
      "aula": "3ro A",
      "estado": "TARDANZA_INJUSTIFICADA"
    }
  }
  ```

<!-- AMPLIACIÓN RF-72 A RF-89 -->
---

## 3. Conformidad de Horas de Practicantes (RF-74)

### `GET /practitioners/sessions?estado=PENDIENTE&desde=2026-10-14&hasta=2026-10-20`
Docente guía: solo sus practicantes asignados. Coordinación: todos.

* **Response 200 OK:**
```json
{ "success": true, "data": [{ "practicanteId": "UUID", "nombre": "Ana Ccori", "horasPendientes": 25.0, "jornadas": [{ "id": "UUID", "fecha": "2026-10-15", "horaIngreso": "07:45", "horaSalida": "12:45", "horas": 5.0, "estadoValidacion": "PENDIENTE" }] }] }
```

### `POST /practitioners/batch-approve`
* **Request Body:**
```json
{ "items": [{ "id": "UUID", "decision": "VALIDADA" }, { "id": "UUID", "decision": "OBSERVADA", "comentario": "Falta registrar la hora de salida" }] }
```
* **Response 200 OK:** `{ "success": true, "data": { "validadas": 4, "observadas": 1, "horasValidadasAcumuladas": 94.0 } }`
* **Errores:** `403 NOT_PRACTITIONER_TUTOR` (RN-PRA-05), `COMMENT_REQUIRED` (RN-PRA-07), `MISSING_CHECKOUT` si la jornada no tiene salida (RN-PRA-03).

### `POST /practitioners/sessions/:id/revert`
Solo Coordinación. Revierte una jornada validada a `PENDIENTE`. Body: `{ "motivo": "Error en la hora de ingreso" }`.

---

## 4. Aviso de Inasistencias al Apoderado (RF-77)

No expone endpoint público. El job `AbsenceGuardianNotifier` corre a la hora de corte de cada turno y llama a `NotificationService.notify` con:

```json
{ "categoria": "ASISTENCIA", "prioridad": "ALTA", "titulo": "Falta registrada: Luis Huamán", "mensaje": "Turno mañana del 21/10/2026.", "enlace": "/apoderado/asistencia/UUID/justificar" }
```
Registra cada envío en `avisos_inasistencia` (único por asistencia, apoderado y tipo) para no duplicarlo.

---

## 5. Importación de Nóminas SIAGIE (RF-78)

### `POST /enrollments/import-siagie` (multipart/form-data)
Campos: `archivo` (.xlsx), `anioLectivoId`. Valida y devuelve la vista previa sin aplicar cambios.

* **Response 200 OK:**
```json
{ "success": true, "data": { "importacionId": "UUID", "totalFilas": 32, "nuevos": 30, "actualizados": 1, "sinCambios": 0, "conError": [{ "fila": 17, "dni": "71234567", "motivo": "Estudiante ya matriculado en 2.° A" }] } }
```
* **Errores:** `UNRECOGNIZED_FORMAT` (columnas esperadas en `message`), `SECTION_NOT_FOUND`.

### `POST /enrollments/import-siagie/:importacionId/confirm`
Aplica las filas válidas en una transacción. Respuesta: `{ "success": true, "data": { "creados": 30, "actualizados": 1, "rechazados": 1, "reporteUrl": "/api/v1/enrollments/import-siagie/UUID/rejections.xlsx" } }`
