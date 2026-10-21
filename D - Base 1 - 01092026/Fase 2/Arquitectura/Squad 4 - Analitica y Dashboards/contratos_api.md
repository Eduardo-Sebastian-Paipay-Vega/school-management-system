# Contratos de API REST: Analítica y Dashboards

---

## 1. Mapas de Calor Jerárquicos (Drill-Down)

### `GET /analytics/heatmaps/drilldown`
Obtiene los datos agregados para renderizar el nivel jerárquico solicitado.

* **Query Params:** `scope=GRADE`, `targetId=UUID_SECCION`, `periodoId=UUID`
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "scope": "SECTION",
    "title": "Rendimiento 3ro B - Secundaria",
    "heatCells": [
      {
        "studentId": "std-01",
        "studentName": "Alarcón Gómez, María",
        "courses": {
          "Matemática": { "vigesimal": 16.5, "colorHex": "#2E7D32" },
          "Comunicación": { "vigesimal": 10.0, "colorHex": "#C62828" }
        },
        "riskScore": 25.0
      }
    ]
  }
}
```

---

## 2. Ficha Escolar 360° del Estudiante

### `GET /students/:id/profile-360`
Retorna la radiografía holística del alumno en un solo payload consolidado.

* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "student": { "id": "std-01", "nombres": "María", "apellidos": "Alarcón Gómez" },
    "academicKardex": { "promedioGeneral": 15.4, "ordenMerito": 3, "totalCursos": 11 },
    "radarCompetencies": [
      { "area": "Matemática", "score": 85 },
      { "area": "Comunicación", "score": 60 },
      { "area": "Ciencias", "score": 90 }
    ],
    "attendanceSummary": { "presentes": 92.5, "tardanzas": 5.0, "faltas": 2.5 },
    "riskLevel": "BAJO"
  }
}
```

<!-- AMPLIACIÓN RF-72 A RF-89 -->
---

## 3. Cumplimiento del Registro de Notas (RF-83)

### `GET /analytics/grade-compliance?periodId=UUID&nivel=SECUNDARIA&teacherId=UUID`
Calculado sobre la vista `v_avance_registro_notas` y los plazos de RF-81.

* **Response 200 OK:**
```json
{ "success": true, "data": [{ "docenteId": "UUID", "docente": "Quispe Flores, Juan", "avance": 60.0, "semaforo": "ROJO", "plazoVencido": true, "cursosPendientes": [{ "curso": "Matemática", "seccion": "4.° C", "avance": 40.0 }], "alertasEmitidas": { "RECORDATORIO": 1, "AVISO": 1, "LLAMADO_ATENCION": 1 } }] }
```
* **Errores:** `DEADLINES_NOT_CONFIGURED` si el periodo no tiene plazos.

### `GET /analytics/grade-compliance/export?periodId=UUID&format=xlsx|pdf`
Exporta el tablero (RF-64).

---

## 4. Agenda de Citas (RF-89)

### `POST /appointments/slots`
Docente o tutor publica franjas. Body: `{ "franjas": [{ "inicio": "2026-10-23T15:00:00-05:00", "fin": "2026-10-23T15:20:00-05:00", "modalidad": "PRESENCIAL", "lugarOEnlace": "Sala de profesores" }] }`.

### `GET /appointments/slots?teacherId=UUID&from=...&to=...`
Franjas con `disponible: true|false`.

### `POST /appointments`
Rol `APODERADO`. Body: `{ "franjaId": "UUID", "estudianteId": "UUID", "motivo": "Rendimiento en Matemática" }`.

* **Response 201 Created:** `{ "success": true, "data": { "citaId": "UUID", "estado": "RESERVADA" } }`
* **Errores:** `409 SLOT_TAKEN` con `siguienteFranjaLibre` en el cuerpo (RN-ANA-15), `403 GUARDIAN_NOT_LINKED`.

### `PATCH /appointments/:id`
Cancelar (`{ "estado": "CANCELADA" }`; con menos de 2 h se guarda como `CANCELACION_TARDIA`) o cerrar con acuerdos (`{ "estado": "REALIZADA", "acuerdos": "..." }`, solo docente).
