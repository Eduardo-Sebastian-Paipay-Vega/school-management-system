# Contrato RF-15 → RF-75: filiación verificable

Squad 2 es propietario de la ficha del estudiante (RF-15). Cuando la ficha oficial registra un apoderado, Squad 2 debe publicar en `fichas_apoderados_verificados` una fila con `tenant_id`, `fuente_ficha_id`, `estudiante_id` (persona Core), `apoderado_documento_hash`, `parentesco` y `verificado_en`. El hash se calcula con el mismo `DOCUMENT_HMAC_KEY` y algoritmo de identidad de Core; el DNI completo no se almacena en esta tabla. `fuente_ficha_id` identifica el registro de origen para conciliación y revocación.

La carga debe ocurrir en una transacción autenticada del proceso de matrícula, después de verificar DNI, documento de filiación o tutela y consistencia del estudiante. El rol de ejecución Core (`sms_app`) solo tiene `SELECT` sobre esta tabla; Secretaría no puede fabricar una fuente mediante `/guardians/links`. Una corrección de la ficha marca `revocado_en`; no se reutiliza el registro anterior para otro parentesco.

Core compara el hash del documento de la persona apoderada, el estudiante, el parentesco y el tenant antes de crear el vínculo. Repite la comprobación en invitación, activación y cada consulta del apoderado. Una fuente ausente o revocada bloquea el acceso. El texto libre `verificacion` se eliminó como prueba de filiación.

**Despliegue del piloto:** no cargar datos reales antes de que Squad 2 valide la ficha RF-15 y la institución apruebe `GUARDIAN_CONSENT_VERSION` y `GUARDIAN_CONSENT_TEXT`. CI usa registros ficticios A/B para probar el mecanismo. El script/proceso de importación de fichas oficiales pertenece a Squad 2 y requiere su propia evidencia de trazabilidad y control de acceso.
