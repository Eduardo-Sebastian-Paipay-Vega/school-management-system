# ADR-004: Migraciones de base de datos versionadas

- **Estado:** Aceptado por el líder del proyecto el 2026-10-30 para el cierre de S1/S2; ensayo de restauración pendiente antes de migraciones contract.
- **Fecha:** 2026-10-22
- **Decisores:** Líder de proyecto (Squad 2), Squad 1 (Brandon Montero), Squad 3 (Steve Ovalle)
- **Squads afectados:** S1, S2, S3, S4, S5
- **Formaliza:** subdecisión 3 de D-04 en [`F0_DECISIONES_ARQUITECTURA_PENDIENTES.md`](../../../../docs/F0_DECISIONES_ARQUITECTURA_PENDIENTES.md): "una sola carpeta `database/migrations/` versionada que absorba `database/init/` y `squad3/001_grades.sql` sin reescribirlos"
- **Requisitos relacionados:** RNF-12, RNF-17

## Contexto

Antes de crear `database/migrations/`, el esquema se creaba de tres maneras distintas, ninguna versionada. La tabla conserva el diagnóstico de aquella línea base:

| Mecanismo | Qué hace | Problema |
|---|---|---|
| `docker-compose.yml` monta `database/init/` en `docker-entrypoint-initdb.d` | Ejecuta `01_esquema_consolidado.sql` **solo** la primera vez que se crea el volumen | Un cambio posterior no llega a ninguna base existente; hay que borrar el volumen y perder los datos |
| `01_esquema_consolidado.sql` | Usa `IF NOT EXISTS` y `ALTER ... ADD COLUMN IF NOT EXISTS` para ser "reejecutable" | No registra qué se aplicó, no detecta cambios de tipo ni de restricciones, y mezcla la historia (comentarios "bases creadas antes de RF-75") |
| `backend/squad_3_calificaciones/src/provision.ts migrate` | Ejecuta `001_grades.sql` en una transacción | Usa `CREATE TABLE` sin `IF NOT EXISTS`: falla si se ejecuta dos veces, y no hay registro de lo aplicado |
| 5 archivos `esquema_datos.sql` | Copias parciales por squad | Ya divergen del consolidado; el del Squad 2 ni siquiera se ejecuta ([modelo canónico](../modelo_datos_canonico.md) §1.2) |

Al 2026-10-30, `database/migrations/` es la fuente ejecutable y contiene diez archivos; `docker-compose.yml` todavía monta `database/init/` para bases nuevas. Las pruebas cubren el camino de migración de una base ya creada por ese *init*. Queda pendiente probar respaldo y restauración antes de una migración *contract* de identidad.

## Opciones consideradas

1. **Seguir con scripts reejecutables (`IF NOT EXISTS`).**
   - En contra: los problemas de la tabla anterior.
2. **ORM con migraciones (Prisma, TypeORM, Knex).**
   - En contra: el proyecto escribe SQL a mano (`pg`), usa RLS, triggers, particiones y FK compuestas, que los ORM manejan mal o no manejan. Introducir un ORM ahora es una migración de stack.
3. **Migraciones en SQL puro con un ejecutor ligero.**
   - Candidatas: `node-pg-migrate` (Node, mismo ecosistema que el backend; admite archivos `.sql`) o `dbmate` (binario único, independiente del lenguaje).
   - A favor: el SQL es el mismo que revisan los SDD; registra lo aplicado en una tabla; toma un bloqueo para que dos procesos no migren a la vez.

## Decisión

Se adopta la **opción 3**, con `node-pg-migrate` como ejecutor sugerido (alternativa: `dbmate`). La herramienta final se confirma al instalarla, verificando que cumple las reglas de esta sección.

### 1. Estructura prevista al redactar el ADR

```text
database/
├── migrations/
│   ├── 20261026000000_baseline_consolidado.sql   # copia exacta de database/init/01_esquema_consolidado.sql
│   ├── 20261026000100_baseline_squad3.sql        # copia exacta de backend/squad_3_calificaciones/migrations/001_grades.sql
│   ├── 20261028120000_s1_roles_y_contexto.sql    # roles sms_*, app_tenant_id(), app_user_id()
│   ├── 20261028130000_s1_nucleo_personas.sql     # DM-01 y DM-02 del modelo canónico
│   └── ...
├── seeds/
│   ├── obligatorias/        # roles, banco CNEB, cursos y competencias: se aplican en todos los entornos
│   └── demo/                # datos ficticios: solo desarrollo y pruebas
└── tests/                   # pruebas de restricciones y RLS (modelo canónico §5, ADR-003)
```

### 2. Reglas

1. **Nombres con marca de tiempo UTC:** `AAAAMMDDHHMMSS_s<squad>_<descripcion>.sql`. Con 5 squads trabajando en paralelo, una numeración secuencial (`0001`, `0002`) colisionaría en cada merge.
2. **Línea base sin reescribir** (D-04): las dos primeras migraciones son copias exactas de los archivos actuales. Toda corrección (tipos, `created_by`, `tenant_id`, RLS) va en migraciones posteriores.
3. **Una migración aplicada no se edita nunca.** El ejecutor guarda su nombre; si hace falta corregir, se escribe otra migración.
4. **Solo hacia adelante en entornos compartidos.** Las secciones `down` se permiten solo para desarrollo local. En `dev`, staging y producción, una reversión es una migración nueva, respaldada por el volcado previo al despliegue.
5. **Cambios incompatibles en dos pasos (*expand / contract*):** primero se agrega lo nuevo y se adapta el código; en un despliegue posterior se elimina lo viejo. Ejemplo: mover `dni` de `usuarios` a `personas`.
6. **Una transacción por migración.** Excepción documentada: `CREATE INDEX CONCURRENTLY` y `ALTER TYPE ... ADD VALUE` cuando el valor se usa a continuación. Esas migraciones van solas y lo indican en su encabezado.
7. **Dueño:** cada squad escribe las migraciones de sus tablas. Las que tocan tablas del núcleo ([modelo canónico](../modelo_datos_canonico.md) §4.1) requieren aprobación del Squad 1 en el PR.
8. **Las semillas no son migraciones**, salvo las obligatorias que una migración necesite (p. ej. los roles). Los datos de demostración nunca se ejecutan en producción.
9. **Los `esquema_datos.sql` de cada squad dejan de ser normativos**, igual que `contratos_api.md` en ADR-005. Se conservan como referencia, con un enlace a sus migraciones.

### 3. Ejecución

| Entorno | Cómo se aplica |
|---|---|
| Local | `docker compose up` levanta PostgreSQL vacío (el *init* solo crea roles y base); luego `npm run db:migrate` y `npm run db:seed` |
| CI | Base nueva → todas las migraciones → semillas obligatorias → pruebas de `database/tests/` → pruebas del backend |
| `dev` / producción | Paso explícito del despliegue (ADR-012), con volcado previo, ejecutado por `sms_migrator` |

## Consecuencias

- **`docker-compose.yml`:** deja de montar `01_esquema_consolidado.sql` como *init*. Monta un script mínimo que crea los roles de ADR-003.
- **`database/init/01_esquema_consolidado.sql`** queda congelado como línea base histórica. Un aviso en su encabezado indicará que no se edita.
- **M8:** `provision.ts migrate` deja de ser la vía oficial para crear `squad3`. El código de M8 no cambia (ADR-001); solo cambia quién ejecuta su SQL.
- **CI:** nueva puerta "migraciones desde cero + pruebas de base de datos" (plan §3.4.8).
- **Línea base verificada (2026-10-22):** `01_esquema_consolidado.sql` y `001_grades.sql` se ejecutaron en PGlite 0.3.16, **cada uno dentro de una sola transacción**, sobre una base vacía. Ambos pasaron: se crearon 44 tablas (42 en `public` y 2 en `squad3`) y los 12 roles. El `ALTER TYPE ... ADD VALUE IF NOT EXISTS` seguido del `INSERT` no falla en una base nueva, porque el valor ya existe desde el `CREATE TYPE`. Falta repetir la prueba con la herramienta elegida.

## Implementación (iniciada el 2026-10-22; estado al 2026-10-30)

- Paquete [`database/`](../../../../database/README.md) con `node-pg-migrate` 9.0.0 y pruebas en PGlite 0.3.16.
- `node-pg-migrate` toma un archivo `.sql` sin marcadores `-- Up Migration` como migración completa, sin sección `down`. Por eso las dos copias de la línea base son **idénticas byte a byte** a sus originales (D-04).
- Hay diez migraciones versionadas. La verificación documentada más reciente ejecutó 33 pruebas en PGlite (`docs/architecture/06-verificacion-y-pendientes.md`); no equivale a una restauración probada en PostgreSQL real.
- La suite `npm test` cubre tres caminos: base nueva, actualización de una base con datos existentes y base ya creada por el *init* de Docker. También comprueba que la migración se detiene con un mensaje claro cuando no puede resolver los datos sola.

## Preguntas abiertas para la revisión

1. ¿`node-pg-migrate` o `dbmate`? El primero no agrega un binario; el segundo es independiente del lenguaje.
2. ¿Quién ejecuta las migraciones en `dev` compartido: el CI tras cada merge o el líder manualmente?
