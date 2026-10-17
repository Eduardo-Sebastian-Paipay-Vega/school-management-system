# Contratos REST y WebSocket — M8 / Squad 3

Implementación: `backend/squad_3_calificaciones/src/`. Diseño: [sdd_squad_3.md](sdd_squad_3.md). Estas rutas reemplazan el borrador anterior de este archivo. Respuestas con `Content-Type: application/json`, `Cache-Control: no-store` y `timestamp` ISO-8601.

## Autenticación y ámbito

`Authorization: Bearer <JWT>` firmado HS256 por Squad 1. Claims requeridos: `sub` (UUID de usuario), `tenant_id`, `role`, `iss`, `aud`, `iat`, `exp`. Se valida emisor y audiencia configurados, máximo 30 minutos de edad y vigencia. Roles: `teacher`, `practitioner`, `coordinator`, `director`, `student`; también se admiten los nombres `ROLE_TEACHER`, `ROLE_PRACTITIONER`, `ROLE_COORDINATOR`, `ROLE_DIRECTOR`, `ROLE_STUDENT`.

El servicio no emite tokens ni acepta el tenant/actor desde el payload. `bookId` identifica una planilla aprovisionada con la matrícula y asignaciones reales. Para docente/practicante se comprueba su asignación; para estudiantes se resuelve su matrícula por el `sub` del token. Dirección/coordinación operan dentro de su institución.

## GET `/api/v1/grades/matrix?bookId=UUID`

RF-36–RF-46. Devuelve el agregado autorizado y resúmenes calculados. No hay paginación en esta versión: la UI virtualiza las filas del conjunto recibido, hasta 5000 matrículas al aprovisionar.

```json
{
  "success": true,
  "data": {
    "id": "00000000-0000-4000-8000-000000000010",
    "revision": 2,
    "title": "Matemática · 3 A · Bimestre I",
    "closed": false,
    "deadline": "2026-11-01T04:59:59Z",
    "level": "secondary",
    "scale": {"ad": 17.5, "a": 13.5, "b": 10.5},
    "evaluations": [{"id": "ev1", "name": "Práctica", "weight": 1, "competency": "Cantidad", "rubric": "Argumentación"}],
    "students": [{"id": "mat1", "name": "Estudiante de ejemplo"}],
    "grades": {"mat1/ev1": {"numeric": 18, "literal": "AD", "status": "approved", "authorId": "00000000-0000-4000-8000-000000000001"}},
    "conclusions": {},
    "requests": [],
    "conclusionBank": [],
    "summaries": {"mat1": {"partial": {"numeric": 18, "literal": "AD"}, "period": {"numeric": 18, "literal": "AD"}}}
  },
  "timestamp": "2026-10-16T15:00:00Z"
}
```

Ejemplo abreviado: el agregado también contiene configuración de curso, sección, año, periodos esperados y competencias. `grades` usa claves `matriculaId/evaluacionId`. En primaria el resumen numérico del servidor es `null` y se calcula nivel predominante. El estudiante recibe solo su fila y la instantánea publicada; nunca `publishedGrades` como colección completa ni solicitudes de rectificación.

## PATCH `/api/v1/grades/batch`

RF-37, RF-38, RF-40, RF-45 y RF-46. Rol docente o practicante asignado. La revisión es del agregado completo; un lote inválido no guarda ninguna celda.

```json
{
  "bookId": "00000000-0000-4000-8000-000000000010",
  "revision": 2,
  "items": [
    {"studentId": "mat1", "evaluationId": "ev1", "input": "18.5"},
    {"studentId": "mat2", "evaluationId": "ev1", "input": "B"}
  ]
}
```

- `items`: 1–2000 celdas distintas y pertenecientes a la planilla; hasta 512 KB por solicitud HTTP.
- `input`: texto con nota 0–20 y hasta dos decimales, punto o coma, o literal AD/A/B/C. Vacío, NaN, infinito, notación científica y valores fuera de rango se rechazan.
- El backend calcula y persiste numeric/literal; no confía en una conversión enviada por el cliente.
- Docente: `approved`; practicante: `draft`, conservando el valor anterior cuando existe. Un borrador nunca modifica la publicación vigente.
- Respuesta 200: misma envoltura y vista de `matrix`, con revisión incrementada. Conflicto: 409, sin sobrescritura.
- Alias: PATCH `batch-save`, PATCH `auto-save`, POST `batch-upsert`, todos bajo `/api/v1/grades/`, aceptan exactamente este payload. Los payloads antiguos con `versionLock` por celda necesitan adaptarse; no se consideran compatibles.

## POST `/api/v1/grades/actions`

Cuerpo común: `{bookId: UUID, revision: integer, action: string, ...campos}`. Respuesta 200: agregado actualizado autorizado. Todas las acciones se auditan en la misma transacción.

| Acción | Rol | Campos adicionales / validación |
|---|---|---|
| `evaluation` | Docente titular | `name` ≤100, `weight` >0 y ≤100, `competency` del catálogo importado, `rubric` ≤2000; máximo 40 evaluaciones |
| `approve` | Docente titular | Aprueba borradores conservando autoría del practicante |
| `reject` | Docente titular | `reason` obligatorio ≤500; restaura nota anterior o elimina el borrador nuevo |
| `publish` | Docente titular | Sin borradores; exige conclusiones para resúmenes B/C; toma instantánea |
| `conclusion` | Docente titular | `studentId`, `text` obligatorio ≤500; se publica en la siguiente publicación |
| `close` | Coordinación / dirección | Exige matriz completa y aprobada, y conclusiones obligatorias |
| `rectification` | Docente titular | Periodo cerrado; `studentId`, `evaluationId`, `input`, `reason`, `document` (referencia probatoria ≤500) |
| `decide` | Dirección | `requestId`, `approve` boolean; si aprueba, `signature` identificatoria ≤200; si rechaza, `reason` obligatorio |

Ejemplo de rectificación:

```json
{
  "bookId": "00000000-0000-4000-8000-000000000010",
  "revision": 5,
  "action": "rectification",
  "studentId": "mat1",
  "evaluationId": "ev1",
  "input": "19",
  "reason": "Error material en la transcripción del acta",
  "document": "EXP-2026-001 / acta custodiada por secretaría"
}
```

La aprobación conserva solicitante, nota anterior, nota propuesta, expediente, aprobador y fecha; actualiza la nota publicada si ya existía, recalcula resúmenes y mantiene el periodo cerrado. No se permite autoaprobación, solicitud duplicada pendiente ni decidir dos veces. La confirmación electrónica está vinculada a una sesión autenticada; no constituye una firma digital PKI. Los archivos probatorios se custodian en el expediente institucional; este servicio recibe su referencia, no archivos binarios.

La solicitud admite `conclusion` opcional (máximo 500 caracteres). Si la rectificación produce un resumen B/C sin conclusión existente, este campo es obligatorio. La aprobación actualiza también esa conclusión y su instantánea publicada cuando corresponda.

## GET `/api/v1/grades/annual?bookId=UUID`

RF-41 y RF-44. Usa los periodos de la misma institución, sección, curso y año que el actor puede consultar. Devuelve `{students:[{id,name,periods:[{periodId,weight,summary,closed}],annual:{numeric,literal}|null}]}` en la envoltura estándar. Para estudiantes utiliza únicamente notas publicadas y devuelve su fila. No produce anual hasta que estén presentes todos los periodos configurados en `expectedPeriods` y sus notas estén completas y cerradas. La configuración `annualMode` admite `weighted`, `predominant` o `latest`; primaria no usa promedio numérico.

## WS `/api/v1/grades/live`

Conectar por WSS en producción. Dentro de los primeros cinco segundos enviar:

```json
{"token":"JWT vigente","bookId":"00000000-0000-4000-8000-000000000010"}
```

La credencial no viaja en la URL. El servidor valida JWT y acceso antes de suscribir, responde `{"event":"SUBSCRIBED","bookId":"..."}` y después notifica `{"event":"GRADE_UPDATED","bookId":"..."}` tras transacciones confirmadas. El cliente recarga por REST su vista autorizada. La conexión se renueva periódicamente y se cierra al caducar la sesión. Existe refresco REST de respaldo cada 10 segundos. El bus actual es local a una instancia; el adaptador Redis institucional es una integración posterior para varias réplicas.

## Errores

```json
{"success":false,"error":{"code":"VERSION_CONFLICT","message":"La planilla cambió; recargue antes de continuar"},"timestamp":"2026-10-16T15:00:00Z"}
```

| HTTP | Condición |
|---|---|
| 400 | JSON, identificador, nota, versión o campos inválidos |
| 401 | JWT ausente, inválido, expirado o con emisor/audiencia incorrectos |
| 403 | Rol, institución, asignación u origen CORS no autorizado |
| 404 | Ruta o planilla inexistente en el ámbito del actor |
| 409 | Revisión o nota original de rectificación desactualizada |
| 413 | Payload mayor de 512 KB |
| 422 | Cierre, borradores, conclusión, competencia u otra regla pedagógica |
| 500 | Fallo interno; sin exposición de SQL o credenciales |

## Proveedores externos

El script de aprovisionamiento usa `SQUAD1_SCALE_URL`, `SQUAD2_ROSTER_URL` y un token de servicio en `PROVIDER_TOKEN`. No hay URL inventada ni cuenta de prueba incorporada al servidor.

Proveedor curricular: `{success:true,data:{tenantId,scale:{ad,a,b},competencies:[string],conclusionBank:[{level,competency,text}]}}`.

Proveedor de matrícula/asignación: `{success:true,data:{tenantId,courseId,sectionId,periodId,teacherId,practitionerIds:[UUID],students:[{id:UUID,userId:UUID,name}]}}`.

Estas formas son el límite de integración propuesto de M8; los servicios concretos de otros squads deben adaptar o confirmar el contrato. `validateBook` valida el resultado antes de insertarlo. No se considera una integración institucional probada hasta ejecutarla con esos proveedores reales.
