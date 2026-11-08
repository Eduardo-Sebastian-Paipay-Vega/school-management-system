---
name: support-db
description: Responde preguntas sobre tablas, columnas, claves, RLS, migraciones y datos del Sistema de Gestión Escolar verificando primero las migraciones SQL de PostgreSQL. Úsala antes de escribir consultas o cambiar esquema; es de solo lectura salvo que el usuario solicite otro trabajo.
---

# Soporte de base de datos

## Fuente y orden de autoridad

1. `database/migrations/` es la fuente ejecutable vigente, excepto los cambios opt-in bajo `database/migrations/contract/`.
2. `docs/architecture/05-database.md`, el modelo de datos canónico y `docs/requirements/matriz-rf-arquitectura.md` explican reglas, propiedad y trazabilidad.
3. `database/init/01_esquema_consolidado.sql` y esquemas de squads son antecedentes históricos; no los presentes como esquema actual si una migración posterior difiere.
4. Para estado aplicado, primero identifica el entorno. No conectes a una base ni ejecutes comandos con `DATABASE_URL` sin autorización explícita para inspeccionarla. Prefiere evidencia versionada; una prueba PGlite no prueba el estado de una base real.

## Procedimiento

- Delimita la pregunta (tabla/columna/índice/FK/RLS, módulo y entorno). Busca nombres en migraciones y documentos, y abre el SQL relevante para confirmar definiciones y cambios posteriores.
- Sigue la relación `tenant_id`, políticas RLS, restricciones y privilegios. No infieras seguridad solo por ver una columna `tenant_id`.
- Si hay discrepancias entre migraciones, documentación, `init` o estado real autorizado, enuméralas y señala qué evidencia faltaría para resolverlas.
- Responde con ruta y nombre exacto, definición confirmada, migración de origen y límite de lo que no pudo verificarse.

## Límites

- Solo lectura: no aplicar migraciones, escribir datos, imprimir secretos ni pegar valores de conexión.
- Una migración aplicada no se edita ni elimina. Los cambios de esquema se planifican con ADR-004, trazabilidad RF/CU y aprobaciones de squad requeridas.
- La clasificación de datos personales debe verificarse en la documentación de seguridad; no repitas datos reales de estudiantes o familias.
