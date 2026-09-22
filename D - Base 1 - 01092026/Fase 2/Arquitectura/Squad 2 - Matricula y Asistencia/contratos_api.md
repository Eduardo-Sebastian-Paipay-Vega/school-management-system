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
