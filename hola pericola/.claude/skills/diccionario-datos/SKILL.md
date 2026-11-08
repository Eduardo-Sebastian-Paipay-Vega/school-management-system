---
name: diccionario-datos
description: Crea o modifica modelos Django del backend siguiendo la convención de nombres de tablas (6 letras minúsculas = 2 de área + 4 de entidad, ej. rhusua) con comentario en la tabla y en CADA columna dentro de PostgreSQL (db_table_comment / db_comment), y regenera el diccionario de datos (docs/arquitectura/diccionario-datos.md y el Word por jsreport). Úsala SIEMPRE que se cree una tabla/modelo nuevo o se agregue una columna a una tabla ya convencionada, aunque el usuario no mencione "diccionario" ni "convención". Los modelos históricos no se renombran salvo que el usuario lo pida.
---

# Diccionario de datos y convención de tablas

Una sola fuente de verdad: los comentarios del modelo. `Meta.db_table_comment` y `Field(db_comment=...)` se escriben en PostgreSQL con la migración (se ven en el campo *Comment* de DataGrip) y de ahí salen el `.md` y el Word de jsreport. Nunca se redacta el diccionario a mano.

Código: `BACKEND/comun/diccionario_datos.py` (mapa de áreas `AREAS`, construcción, Markdown, Word) · comando `generar_diccionario_datos` · plantilla `jsreport/data/DICCIONARIO_DATOS/`. Propuesta completa y mapa de las tablas históricas: `docs/arquitectura/propuesta-convencion-tablas.md`.

## Cuándo aplica
- **Tabla nueva** → siempre con convención y comentarios completos.
- **Columna nueva en una tabla convencionada** → con `db_comment`.
- **Tabla histórica** (ej. `ventas`, `bi_app_*`) → NO se renombra (el renombrado es una fase aparte que decide el usuario). Si ya se está editando su modelo, se pueden añadir los comentarios (`db_table_comment`/`db_comment`) sin cambiar `db_table`; así sale de «Pendientes de describir».

## Pasos

1. **Elegir el nombre** (`db_table`): `<ÁREA 2 letras><ENTIDAD 4 letras>` en minúsculas, sin guion bajo. El prefijo sale de `AREAS` en `comun/diccionario_datos.py` según la app (rrhh→`RH`, ventas→`VE`, envios→`EN`…). Las 4 letras: 1 palabra = sus 4 primeras letras (`Usuario`→`USUA`); 2 palabras = 2+2 (`FichaLaboral`→`FILA`); 3 = 2+1+1; 4 o más = iniciales. Si choca con otra tabla de la misma área, cambiar la última letra. Si el código coincide con una palabra real de una tabla histórica de 6 letras (`envios`, `marcas`, `ventas`: lista `HISTORICAS_DE_SEIS_LETRAS` en `comun/diccionario_datos.py`), cambiar la última letra: en minúsculas el validador solo distingue las tablas nuevas por esa lista. Confirmar el nombre con el usuario si hay ambigüedad. Una app nueva sin prefijo: proponer 2 letras libres y agregarlas a `AREAS`.
2. **Columnas en minúsculas** (desde 2026-10-24, solo tablas nuevas): cada campo lleva `db_column` en minúsculas con guion bajo (`db_column='estado'`, `db_column='empresa_id'`), igual que el atributo Python; incluye `id`, FK y fechas. Con minúsculas **no hacen falta comillas** en SQL manual ni en DataGrip. El test falla si una columna de una tabla convencionada tiene mayúsculas. El `.md` y el Word (jsreport) muestran los nombres tal cual y cada ficha se titula `código : ÁREA` (ej. `vepedi : VENTAS Y COBRANZA`) con la línea «Entidad: …» debajo; los nombres de área sí van en MAYÚSCULAS en el Word (`datos_para_word()` en `comun/diccionario_datos.py`).
3. **Comentarios en español, orientados al negocio** (qué es y para qué sirve, no repetir el nombre del campo):
   ```python
   class Usuario(models.Model):
       """Personas con acceso al sistema desde Recursos Humanos."""
       estado = models.CharField(max_length=20, db_column='estado', db_comment='Situación laboral actual: ACTIVO o CESADO.')

       class Meta:
           db_table = 'rhusua'
           db_table_comment = 'Personas con acceso al sistema desde Recursos Humanos.'
   ```
   **Todas** las columnas llevan `db_comment`, incluidas FK, fechas y banderas (`id` automático no se puede comentar sin declararlo: declarar `id = models.BigAutoField(primary_key=True, db_column='ID', db_comment='…')`). Unidades y formatos en el comentario (soles/USD, UTC, etc.).
4. **Migración**: `python manage.py makemigrations <app>` y revisar que traiga `AlterModelTableComment`/`db_comment` (en un modelo nuevo vienen dentro del `CreateModel`). No ejecutar `migrate` en staging sin permiso.
5. **Regenerar el diccionario**: `python manage.py generar_diccionario_datos` (actualiza `docs/arquitectura/diccionario-datos.md`). Revisar el diff: la tabla nueva aparece en su área y sale de «Pendientes de describir» si era histórica.
   **Lista de tablas por área:** el `.md` (sección «Lista de tablas por área») y el Word listan **todas** las áreas con **todas** sus tablas, igual que «Usuarios y seguridad (US)»: primero las descritas con su comentario y luego las históricas con «Pendiente de describir.»; el prefijo de cada área sale de `AREAS`. Si un área no aparece o con el prefijo equivocado, corregir `AREAS` en `comun/diccionario_datos.py`, no el documento.
6. **Word con el logo de Data Join** (formato del entregable «Diccionario de Datos»: carátula, historial de versiones, índice, acrónimos de áreas, lista de tablas y una ficha por tabla con cabecera y pie; jsreport en `localhost:5488` con `npm start` en `jsreport/`): `python manage.py generar_diccionario_datos --word` genera `docs/arquitectura/diccionario-datos.docx`. Si jsreport no está levantado, avisar y dejar solo el `.md`. Si el Studio de jsreport muestra datos viejos (títulos vacíos, columnas en minúsculas), es caché: recargar el Studio (Ctrl+F5) y volver a elegir los datos de ejemplo `diccionario-datos-compusur-data`; si sigue, reiniciar `npm start`.
7. **Verificar**: `python manage.py test comun.tests_diccionario_datos` (falla si una tabla convencionada no tiene todos los comentarios o si el `.md` quedó viejo) y `python manage.py makemigrations --check`.
8. **Documentación**: si el modelo es parte de un módulo, seguir con `/actualizar-contexto`. En el mensaje de commit usar `feat(back)`/`docs(db)` según `COMMIT_CONVENTION.md`; no commitear sin que el usuario lo pida.

## Reglas
- Nombres de tabla y columna en minúsculas ⇒ SQL manual sin comillas (`SELECT * FROM rhusua`). Las tablas creadas antes del 2026-10-24 con MAYÚSCULAS (si las hay) sí exigen comillas.
- No renombrar tablas históricas ni tocar `origen_publico` (base ajena de solo lectura).
- El `.md` y el `.docx` son generados: nunca editarlos a mano.
- La plantilla Word se reconstruye con `python jsreport/data/DICCIONARIO_DATOS/construir_plantilla_docx.py` (logo `logo-datajoin.png`; anchos de tabla en px para no generar medidas decimales que Word rechaza). Los cambios se commitean y requieren redesplegar `bi-jsreport-staging`.
