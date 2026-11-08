# Sprint 7 — Rotación del cifrado de documentos

El cifrado de `personas.documento_cifrado` usa AES-256-GCM. Los registros previos al Sprint 7 no tienen encabezado; los nuevos incluyen `SMSENC01` y un identificador de versión (2–255). El lector acepta ambos formatos mientras sus claves estén disponibles. `DOCUMENT_HMAC_KEY` sigue siendo independiente: este procedimiento **no** rota el índice ciego de DNI ni los hashes de las fichas RF-15.

## Preparación

1. Conservar un respaldo verificable de PostgreSQL y ensayar el procedimiento sobre una copia restaurada con datos ficticios. Proteger las claves fuera de la base y de los logs.
2. Desplegar primero el lector compatible manteniendo la clave legada `ENCRYPTION_MASTER_KEY` como activa. Confirmar que lee registros antiguos y que las suites Core siguen verdes.
3. Incorporar la nueva clave de 32 bytes hexadecimales a `ENCRYPTION_KEYS_JSON`, por ejemplo una entrada con versión `2`, y fijar `ENCRYPTION_ACTIVE_KEY_ID=2`. Mantener todas las claves antiguas mientras exista cualquier fila cifrada con ellas. No reutilizar versiones ni claves.
4. Para cada institución autorizada, ejecutar desde `backend/` con el rol `sms_runtime`:

   ```powershell
   $env:TENANT_ID = '<uuid-del-tenant>'
   npm run recipher:identities
   npm run recipher:identities -- --apply
   npm run recipher:identities
   ```

   El primer y tercer comandos son de solo lectura. El tercero debe informar `Pendientes: 0`. El comando `--apply` actualiza lotes de 100 filas en transacciones aisladas por tenant, comprueba el HMAC antes de escribir y registra cada lote modificado en la cadena Core. Repetirlo es seguro: omite filas ya cifradas con la versión activa.

5. Consultar el evento `RECIPHER_IDENTITIES` en auditoría y volver a verificar la cadena. Comprobar en una copia restaurada que todas las identidades se descifran y que no cambió ninguna fila de otro tenant. Solo entonces retirar la clave antigua de los secretos del entorno.

## Fallo y reversión

Si una fila no descifra o su HMAC no coincide, el lote revierte y el proceso termina con error; no se debe descartar la clave anterior. Corregir la causa y repetir el dry-run. Una versión de aplicación anterior que solo lea el formato legado **no puede** leer filas recifradas; ante un rollback de aplicación, mantener el lector dual o restaurar una copia tomada antes del cambio, con ventana de escritura detenida y verificación posterior. Cambiar `DOCUMENT_HMAC_KEY` requiere otro proceso coordinado que actualice todos los índices y referencias; no forma parte de este comando.

## Evidencia automática

`backend/tests/core.test.cjs` prueba lectura legada, escritura y lectura de versiones 2/3, retiro de una versión y conservación del HMAC. `backend/tests/integration/key-rotation.test.cjs` recifra un tenant ficticio, verifica dry-run/idempotencia, comprueba que el otro tenant conserva sus bytes y exige un evento de auditoría. Las pruebas de integración solo usan PostgreSQL y datos ficticios de CI; el ensayo de claves operativas y recuperación real requiere la copia de despliegue.
