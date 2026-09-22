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
