---
name: diccionario-datos
description: Documenta el esquema y la clasificación de datos del Sistema de Gestión Escolar a partir de las migraciones SQL, el modelo canónico y requisitos de privacidad. Úsala cuando se solicite actualizar o crear el diccionario de datos tras cambios de esquema.
---

# Diccionario de datos del sistema escolar

El esquema se define mediante SQL y migraciones `node-pg-migrate`, no mediante modelos Django. No copies la convención de seis letras ni nombres de otra aplicación.

## Preparación

1. Lee `AGENTS.md`, `docs/architecture/05-database.md`, ADR-004, el modelo de datos canónico y las reglas de privacidad aplicables.
2. Usa `database/migrations/` como fuente de columnas, tipos, constraints, índices y RLS. Considera las migraciones `contract` por separado y marca su estado opt-in.
3. Comprueba si ya existe un diccionario o sección equivalente antes de crear archivos. `docs/architecture/05-database.md` es la guía actual de arquitectura; evita duplicar sus convenciones.

## Documentación

Por tabla, registra nombre físico y propósito, squad propietario, RF/CU asociado, columnas con tipo/nullabilidad/default, PK/FK/unique/check, índices, política tenant/RLS y sensibilidad de datos cuando la fuente permita clasificarla. Diferencia explícitamente: confirmado en migración, definido en modelo canónico, heredado sin auditar o pendiente de validación.

No inventes propósito ni clasificación. Si la documentación actual no alcanza, registra la brecha y deja el valor como pendiente. No incluyas filas reales, credenciales, valores personales ni secretos. Conserva la terminología y rutas de `docs/architecture/`; si no existe un diccionario dedicado y el usuario pidió uno, propone `docs/architecture/diccionario-datos.md` enlazado desde `05-database.md`.

## Verificación

- Revisa el diff para confirmar que cada tabla/columna descrita existe en la migración indicada.
- Comprueba que no se modificaron migraciones para “hacerlas coincidir” con el documento.
- Para cambios de esquema, sigue además la skill `support-db` y las compuertas de base documentadas; no ejecutes migraciones compartidas sin autorización explícita.
- No generes Word ni otra exportación a menos que el usuario lo pida.
