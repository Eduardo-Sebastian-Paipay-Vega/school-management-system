# Sprint 3 — Gate de retirada de identidad legada

**Estado:** condicionado; no se ejecuta `DROP COLUMN` en este sprint mientras falte el ensayo del piloto con datos y claves autorizados. Institución = tenant; la prueba de CI utiliza únicamente instituciones ficticias.

## Inventario de consumidores (corte 2026-11-02)

| Ubicación | Uso de identidad legada | Tratamiento |
|---|---|---|
| `backend/src/scripts/backfill-identities.ts` | Lee `usuarios.dni` para poblar `personas.documento_hash` y `documento_cifrado`. | Consumidor necesario de transición; se retira o reemplaza **después** de verificar el backfill del piloto. |
| `database/tests/migraciones.test.mjs` | Comprueba `usuarios.nombres` del usuario sistema. | Actualizar a la relación `personas` en la misma entrega *contract*. |
| `database/migrations/20261022000000_baseline_consolidado.sql`, `20261022010100_s1_nucleo_identidad.sql` | Definen y copian columnas legadas al reconstruir desde cero. | Historia inmutable; no editar. Una migración nueva debe retirar columnas tras ejecutar ambas. |
| `backend/src/`, `backend/squad_3_calificaciones/`, `frontend/` | Sin lecturas activas de `usuarios.dni` ni de los demás campos legados en rutas de ejecución. La UI de M8 contiene DNI de muestra estáticos, no una consulta de `usuarios`. | Mantener el inventario actualizado antes de la entrega *contract*. |

## Evidencia y decisión

El CI de Sprint 3 respalda con `pg_dump -Fc`, restaura en otra base, compara conteos, comprueba RLS, auditoría y descifrado, y ejecuta el backfill atómico dos veces en la copia. Un DNI inválido detiene también el conteo y revierte el lote completo. Esto comprueba el mecanismo sobre fixtures ficticios, pero no verifica que el padrón real esté completo ni mide RTO/RPO con volumen representativo.

**Gate previo a una nueva migración *contract*:** (1) restauración operativa del piloto con custodia separada de claves; (2) conteo de pendientes igual a cero tras `--apply` y segunda ejecución sin cambios; (3) inventario de lectores y escritores legados igual a cero, incluida la prueba de migraciones; (4) ventana de compatibilidad y reversión hacia adelante documentadas; (5) autorización de ejecución en el entorno compartido. Si cualquiera falla, conservar columnas y registrar la anomalía. No editar migraciones ya aplicadas ni aplicar el *contract* desde CI sobre datos reales.
