# Contrato RF-15 → RF-75: filiación verificable

Squad 2 es propietario de la ficha del estudiante (RF-15). Cuando la ficha oficial registra un apoderado, Squad 2 debe publicar en `fichas_apoderados_verificados` una fila con `tenant_id`, `fuente_ficha_id`, `estudiante_id` (persona Core), `apoderado_documento_hash`, `parentesco` y `verificado_en`. El hash se calcula con el mismo `DOCUMENT_HMAC_KEY` y algoritmo de identidad de Core; el DNI completo no se almacena en esta tabla. `fuente_ficha_id` identifica el registro de origen para conciliación y revocación.

La carga debe ocurrir en una transacción autenticada del proceso de matrícula, después de verificar DNI, documento de filiación o tutela y consistencia del estudiante. El rol de ejecución Core (`sms_app`) solo tiene `SELECT` sobre esta tabla; Secretaría no puede fabricar una fuente mediante `/guardians/links`. Una corrección de la ficha marca `revocado_en`; no se reutiliza el registro anterior para otro parentesco.

Core compara el hash del documento de la persona apoderada, el estudiante, el parentesco y el tenant antes de crear el vínculo. Repite la comprobación en invitación, activación y cada consulta del apoderado. Una fuente ausente o revocada bloquea el acceso. El texto libre `verificacion` se eliminó como prueba de filiación.

**Despliegue del piloto:** no cargar datos reales antes de que Squad 2 valide la ficha RF-15 y la institución apruebe `GUARDIAN_CONSENT_VERSION` y `GUARDIAN_CONSENT_TEXT`. CI usa registros ficticios A/B para probar el mecanismo. El script/proceso de importación de fichas oficiales pertenece a Squad 2 y requiere su propia evidencia de trazabilidad y control de acceso.

## Mecanismo de publicación (Squad 2, `20261107001000_s2_permisos_asistencia_matricula.sql`)

- `fn_publicar_ficha_apoderado(fuente_ficha_id, estudiante_id, apoderado_documento_hash, parentesco, ip, request_id)` y `fn_revocar_ficha_apoderado(ficha_id, motivo, ip, request_id)` son `SECURITY DEFINER` con `search_path = public, pg_temp`. Exigen `app.tenant_id` y `app.user_id`, comprueban `tenant_id = app_tenant_id()` de forma explícita (un estudiante o una fila de otro tenant responde igual que uno inexistente) y escriben `GUARDIAN_RECORD_PUBLISHED` o `GUARDIAN_RECORD_REVOKED` (módulo `academics`) con `fn_registrar_auditoria()` en la misma transacción. La auditoría no guarda el DNI ni su hash. `sms_app` solo tiene `EXECUTE` sobre ellas; sigue sin `INSERT`, `UPDATE` ni `DELETE` sobre la tabla.
- HTTP: `POST /api/v1/enrollments/guardian-records` (`{fuenteFichaId, estudianteId, apoderadoDni, parentesco}`) y `POST /api/v1/enrollments/guardian-records/{id}/revoke` (`{motivo}`, 10 a 500 caracteres), con el permiso `guardian-records:publish`. El servidor calcula `apoderado_documento_hash` con `documentHash()` de `core/identity-crypto.ts` y descarta el DNI; la respuesta nunca lo incluye.
- La revocación marca `revocado_en` y conserva la fila; una corrección publica una fila nueva. La misma filiación vigente dos veces responde 409 (`uq_ficha_apoderado_activa`).
- `fuente_ficha_id` lo envía el cliente: aún no existe la tabla de la ficha RF-15 del Squad 2. Cuando exista, la función deberá validar que la fuente pertenece al tenant y al estudiante.
- Prueba: `database/tests/s2_permisos_y_ficha.test.mjs` y `backend/tests/integration/squad2.test.cjs` (publicar → Core acepta `/guardians/links`, invitación y activación → revocar → `/guardians/students` vacío y vínculo rechazado).

La activación real del piloto sigue bloqueada: no cargar datos reales hasta que Squad 2 valide la ficha RF-15 y la institución apruebe `GUARDIAN_CONSENT_VERSION` y `GUARDIAN_CONSENT_TEXT`.
