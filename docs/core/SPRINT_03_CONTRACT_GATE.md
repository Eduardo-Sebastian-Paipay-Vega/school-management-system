# Sprint 3 — Gate de retirada de identidad legada

**Estado:** migración opt-in preparada en `database/migrations/contract/`; la ejecución sobre el piloto sigue condicionada al ensayo con sus datos y claves autorizados. Institución = tenant; la prueba de CI utiliza únicamente instituciones ficticias.

## Inventario de consumidores (corte 2026-11-02)

| Ubicación | Uso de identidad legada | Tratamiento |
|---|---|---|
| `backend/src/scripts/backfill-identities.ts` | Lee `usuarios.dni` para poblar `personas.documento_hash` y `documento_cifrado` antes del *contract*. | Consumidor de transición: detecta que la columna ya fue retirada y termina sin consultar `u.dni` tras el *contract*. |
| `database/tests/migraciones.test.mjs` | Prueba histórica de la fase *expand*: inserta y comprueba `usuarios.dni` antes del *contract*. Las pruebas del núcleo consultan nombres en `personas`. | Se conserva como evidencia de compatibilidad *expand*; la prueba *contract* se ejecuta separadamente en PostgreSQL 16 sobre copia restaurada. |
| `database/migrations/20261022000000_baseline_consolidado.sql`, `20261022010100_s1_nucleo_identidad.sql` | Definen y copian columnas legadas al reconstruir desde cero. | Historia inmutable; no editar. Una migración nueva debe retirar columnas tras ejecutar ambas. |
| `backend/src/`, `backend/squad_3_calificaciones/`, `frontend/` | Sin lecturas activas de `usuarios.dni` ni de los demás campos legados en rutas de ejecución. La UI de M8 contiene DNI de muestra estáticos, no una consulta de `usuarios`. | Mantener el inventario actualizado antes de la entrega *contract*. |

## Evidencia y decisión

El [CI de Sprint 3](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system/actions/runs/41490863165) respalda con `pg_dump -Fc`, restaura en otra base, compara conteos, comprueba RLS, auditoría y descifrado, y ejecuta el backfill atómico dos veces en la copia. Un DNI inválido detiene el conteo, revierte el lote y bloquea el *contract*. Corregido el fixture, la copia acepta la migración y supera de nuevo las 15 pruebas HTTP. Esto comprueba el mecanismo sobre fixtures ficticios, pero no verifica que el padrón real esté completo ni mide RTO/RPO con volumen representativo.

**Gate previo a aplicar el *contract* al piloto:** (1) restauración operativa del piloto con custodia separada de claves; (2) conteo de pendientes igual a cero tras `--apply` y segunda ejecución sin cambios; (3) cero lectores y escritores legados en ejecución; (4) ventana de compatibilidad y reversión hacia adelante documentadas; (5) autorización de ejecución en el entorno compartido. Si cualquiera falla, conservar columnas y registrar la anomalía. La migración preparada se invoca con `npm run migrate:contract` y una confirmación explícita; el CI solo la aplica en la copia ficticia después de probar que rechaza un DNI sin migrar. No editar migraciones ya aplicadas ni aplicar el *contract* desde CI sobre datos reales.
