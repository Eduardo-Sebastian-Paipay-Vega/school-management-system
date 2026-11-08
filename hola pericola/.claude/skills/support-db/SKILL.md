---
name: support-db
description: Da información actualizada y verificada del esquema de base de datos de BI-COMPOSUR (apps, modelos, campos, tipos, choices, relaciones FK/M2M, y qué migraciones están aplicadas o pendientes) leyendo directamente el código fuente (`models.py` y `migrations/`) en vez de un doc cacheado que puede haberse desactualizado. Pensada para ser consultada por el propio Claude Code o por otras skills/agentes de esta sesión antes de escribir un serializer, una vista, una migración o una consulta — cuando necesiten confirmar el nombre exacto de un campo, una relación entre modelos, o si el esquema en `models.py` ya está aplicado en la base real. Se invoca manualmente (/support-db <pregunta>) o por referencia desde otra skill ("consultar /support-db"). Es de solo lectura: nunca edita `models.py`, nunca genera ni aplica migraciones.
---

# Soporte de base de datos — BI-COMPOSUR

Esta skill existe porque `docs/arquitectura/contexto-proyecto.md` documenta **arquitectura y estado a alto nivel** (qué app existe, cuántos modelos tiene, si un módulo es mock o real), no el esquema campo por campo — y ese detalle cambia con cada migración. Confiar en memoria o en un doc para responder "¿qué campos tiene `Venta`?" o "¿cómo se relaciona `EntregaOrdenOCAM` con `OrdenFormalizada`?" es exactamente el tipo de respuesta que se desactualiza sola. Esta skill nunca responde de memoria: siempre relee el código fuente en el momento de la consulta.

`BACKEND/` usa PostgreSQL vía `python-decouple` (config en `.env`, ver `docs/instalacion/levantar-proyecto.md`). El entorno virtual vive en `BACKEND/.venv`.

## Paso 1 — Identificar la(s) app(s) relevantes a la pregunta

Cada app Django vive en `BACKEND/<app>/`. Mapa de dominio (basado en `estructura-proyecto.md` y en los modelos reales, no en suposición):

| App | Dominio | Modelos clave |
| --- | --- | --- |
| `usuarios` | Autenticación/autorización — `AUTH_USER_MODEL` propio | `Usuario`, `PermisoModulo`, `RestablecimientoPassword` |
| `bi_app` | Catálogo, "Mis Empresas", proveedores, transporte, listas de precio manuales/externas | `Marca`, `Categoria`, `Empresa`, `Proveedor`, `Producto`, `DetalleProducto`, `ListaPrecio`, `MarcaImportador` |
| `catalogo_electronico` | Catálogo electrónico Perú Compras (CEAM/Acuerdo Marco), fichas técnicas, órdenes formalizadas | `FichaProducto`, `FichaCatalogoCEAM`, `EntregaOrdenOCAM`, `OrdenCompraAcuerdoMarco`, `OrdenFormalizada`, `PrecioReferencialEstado` |
| `contrataciones` | Procesos de contratación pública, entidades, competidores, seguimiento de licitaciones/scoring | `EntidadContratante`, `AcuerdoMarco`, `ProcesoContratacion`, `ItemProceso`, `Competidor`, `AdjudicacionHistorica`, `SeguimientoProceso` |
| `ventas` | Órdenes de compra OCAM, ciclo de gasto SIAF, alertas de vencimiento | `Venta`, `EntregaVentaOcam`, `ConfirmacionOrdenCompra`, `AlertaOrdenCompra`, `SeguimientoCicloGasto` |
| `envios` | Seguimiento de envíos/transportistas (incluye integración Palomino vía `relay-palomino/`) | `Envio`, `EtapaEnvio`, `ConfiguracionIntegracionTransportista`, `HistorialEstadoEnvio` |
| `pedidos` | Pedidos internos, recepción, documentos y eventos asociados | `Pedido`, `ItemPedido`, `RecepcionPedido`, `EventoPedido` |
| `proformas` | Cotizaciones/proformas y registro de precios | `Proforma`, `RegistroPrecio` |
| `facturacion` | Comprobantes, guías de remisión, retenciones, notas de venta (integración Nubefact) | `Comprobante`, `ItemComprobante`, `GuiaRemision`, `Retencion`, `NotaVenta` |
| `ensamblaje` | Proceso técnico de ensamblaje ligado a `ventas.Venta` (snapshot propio, no duplica la orden) | `ProcesoEnsamblaje`, `ItemEnsamblaje`, `UnidadEnsamblada`, `VerificacionTecnica`, `BloqueoEnsamblaje` |
| `logistica` | Plazos de entrega y cobertura por empresa | `PlazoEntregaMaximo`, `PlazoEntregaOfertado`, `CapacidadLogisticaInterna`, `CoberturaEmpresa` |
| `importacion` | Ingesta: archivos subidos a mano + sincronización contra APIs externas (observabilidad de pipelines) | `LoteImportacion`, `LineaImportacion`, `LoteSincronizacionCatalogo`, `EstadoSincronizacionFuente` |
| `comun` | Catálogos/enumeraciones compartidos entre varias apps (Ubigeo, moneda) | `Moneda`, `Departamento`, `Provincia` |

Si la pregunta no calza claramente en una fila (ej. "¿dónde vive el precio referencial?"), buscar el nombre del modelo con Grep sobre `BACKEND/*/models.py` antes de asumir la app — los modelos a veces se mueven de app por decisión de arquitectura documentada (ver ejemplo de `ensamblaje` desacoplado de `ventas` a propósito).

## Paso 2 — Leer el `models.py` real de la(s) app(s) identificadas

Nunca responder de memoria ni citar `estructura-proyecto.md` como si fuera el schema — ese documento resume, no reemplaza el código. Leer con la herramienta Read el archivo `BACKEND/<app>/models.py` completo o la clase específica (Grep primero por `^class NombreModelo` para ubicar la línea, luego Read alrededor).

Prestar atención a:
- **Nombre exacto de cada campo** (`db_field` no siempre coincide con lo que sugiere el nombre de la clase) — CLAUDE.md exige que el nombre del campo del modelo, del serializer y del modelo TypeScript del frontend puedan compararse 1:1.
- **`choices`** definidos como `models.TextChoices`/`models.IntegerChoices` en el mismo archivo, arriba del modelo — son la fuente de verdad de los enums de dominio (ej. `EstadoPedido`, `CategoriaNegocioOrdenCEAM`).
- **Relaciones** (`ForeignKey`, `OneToOneField`, `ManyToManyField`): anotar `related_name`, `on_delete` (¿`PROTECT`, `CASCADE`, `SET_NULL`?) y si apunta a otra app (import cruzado).
- **`Meta`**: `ordering`, `unique_together`/`constraints`, `db_table` si está sobreescrito.
- Si el modelo hereda de una base abstracta (ej. `DocumentoComercialBase` en `facturacion`), leer también la base — los campos heredados son reales aunque no estén en la clase hija.

## Paso 3 — Verificar si el esquema de `models.py` ya está aplicado en la base real

Esto es lo que distingue a esta skill de simplemente "leer el código": el código puede ir adelantado a la base de datos si alguien generó una migración y no la corrió. Verificar el estado real (requiere el entorno virtual local activado, ver `docs/instalacion/levantar-proyecto.md`):

```powershell
BACKEND\.venv\Scripts\Activate.ps1
python BACKEND\manage.py showmigrations <app>
```

- `[X]` = migración aplicada en la base local. `[ ]` = generada pero no aplicada todavía — el campo/modelo existe en `models.py` pero **no** en la tabla real; señalarlo explícitamente si la pregunta del usuario depende de eso (ej. antes de escribir una query o un serializer sobre un campo así de nuevo).
- Si el entorno virtual no existe o falla la conexión a la base configurada en `.env`, no asumir el estado — decir que no se pudo verificar en vivo y responder solo con lo que dice `models.py`, aclarando la limitación.
- No ejecutar `migrate` desde esta skill bajo ninguna circunstancia (ver "Qué NO hacer").

## Paso 4 — Responder en el idioma y formato que otros agentes puedan reutilizar directamente

- Terminología de dominio en español, sin abreviar (regla de `CLAUDE.md`), usando el nombre **exacto** tal cual aparece en el código — no traducir ni "normalizar" un nombre de campo.
- Citar archivo:línea (`BACKEND/<app>/models.py:123`) para que quien reciba la respuesta pueda verificarlo por su cuenta.
- Si la pregunta involucra relación entre módulos (ej. "¿cómo conecta `Venta` con `EntregaOrdenOCAM`?"), trazar la cadena de FKs completa en vez de responder solo con el modelo final.
- Si hay migraciones pendientes detectadas en el Paso 3, mencionarlo aunque no se haya preguntado explícitamente — es información que cambia la respuesta correcta.

## Qué NO hacer

- No crear, modificar ni sugerir cambios a `models.py` — esta skill es de consulta, no de implementación (crear un modelo nuevo sigue el flujo normal de `models.py` → `serializers.py` → `views.py` de `CLAUDE.md`, fuera de esta skill).
- No generar (`makemigrations`) ni aplicar (`migrate`) migraciones.
- No conectarse a la base de datos con SQL crudo (`psql`, `dbshell` con `UPDATE`/`DELETE`) — el único comando de base de datos permitido acá es `showmigrations`, de solo lectura.
- No responder con información de `docs/contexto-proyecto.md` o de memoria de la conversación como si fuera el schema actual — siempre releer `models.py` en el momento de la consulta, incluso si ya se leyó antes en la misma sesión (pudo cambiar).
