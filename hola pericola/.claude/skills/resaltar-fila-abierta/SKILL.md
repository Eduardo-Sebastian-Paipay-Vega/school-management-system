---
name: resaltar-fila-abierta
description: Marca visualmente la fila de una p-table desde la que se acaba de abrir un diálogo (Ver detalles, Editar, Documentos, Eliminar, etc.) — la fila queda con el fondo pintado al cerrar el diálogo, para que el usuario no tenga que volver a buscarla con la vista entre decenas de filas parecidas — y además activa el hover nativo de PrimeNG (`[rowHover]="true"`) para que se note qué fila tiene el mouse encima antes de hacer clic. Usa la clase global `.fila-recien-abierta` (styles.scss) + un signal con el id de la última fila abierta en el componente. Se invoca manualmente (/resaltar-fila-abierta) sobre el componente que el usuario indique (o el abierto en el IDE / mencionado en el chat) — nunca se dispara sola. Requiere confirmación visual del usuario al final porque el agente no puede abrir un navegador.
---

# Resaltar fila abierta — marca visual de la fila del último diálogo abierto

**Problema que resuelve**: en un listado largo (ej. Control de Órdenes de Compra: ~100 filas con códigos OCAM, entidades y badges muy parecidos entre sí), el usuario abre un diálogo desde una fila, lo cierra, y tiene que volver a buscar con la vista en qué fila estaba. Con este patrón esa fila queda pintada hasta que se abre otra.

**Implementación de referencia** (piloto aprobado por el usuario, 2026-09-10; hover agregado 2026-09-11): `frontend/src/app/components/ventas/ordenes-compra/ordenes-compra.{ts,html}`, tab "Control de Órdenes de Compra" — buscar `idOrdenRecienAbierta` y `[rowHover]="true"`.

Esta skill complementa `.claude/skills/frontend-standards/SKILL.md` (sección "Tablas: fila recién abierta al abrir un diálogo") — ahí está la regla resumida; acá, el cómo aplicarla sin olvidar handlers ni caer en los errores ya descartados.

## Qué ya existe y NO se toca por pantalla

La clase global `.fila-recien-abierta` en `frontend/src/styles.scss` (sección "7. Fila recién abierta", dentro del estándar global de tablas). Pinta la fila con los mismos tokens que PrimeNG usa para una fila seleccionada — no con un color propio:

| Qué | Token CSS | Valor (Aura + `CompusurPreset`, modo claro) |
|---|---|---|
| Fondo | `--p-datatable-row-selected-background` (→ `highlight.background`) | `sky-50` |
| Texto | `--p-datatable-row-selected-color` (→ `highlight.color`) | `sky-700` |
| Líneas divisorias de arriba y abajo | `--p-datatable-body-cell-selected-border-color` | `sky-100` |

En modo oscuro los tres tokens ya traen su propia variante. Por pantalla solo se agrega **un signal en el `.ts` y un binding en el `<tr>` del `.html`** — no se escribe CSS local, ni `::ng-deep`, ni un color propio (se heredan tokens del tema, no se inventan estilos). Si el usuario pide un tono distinto, se cambia en la regla global, para todas las pantallas a la vez; nunca con un override por componente.

## Paso 0 — Identificar el componente objetivo

- Si el usuario nombró un componente o pantalla, usar ese.
- Si no, usar el archivo abierto en el IDE o el mencionado más recientemente en la conversación.
- Si hay ambigüedad real (más de un candidato razonable y ninguna pista clara), preguntar antes de tocar nada.

Leer el `.ts` y el `.html` completos del componente antes de editar — los handlers que abren diálogos suelen estar repartidos por todo el archivo, no solo en la columna "Acciones".

## Paso 1 — Diagnosticar la pantalla

Del `.html`:

- **La `p-table` objetivo** y su template de fila (`<ng-template #body let-fila>`, o el legado `<ng-template pTemplate="body" let-fila>`). Anotar el nombre real de la variable de fila (`fila`, `producto`, `pedido`...) — se usa tal cual, no se renombra.
- Si hay varias `p-table` (ej. una por tab) y el usuario no dijo cuál, preguntar. Cada tabla lleva su propio signal (Paso 2).
- **El campo que identifica la fila**: normalmente `id` (coincide con `dataKey="id"` si la tabla lo declara). Si la fila no tiene `id`, usar el mismo campo del `dataKey` o el identificador único del modelo (ej. `codigo`) — nunca el índice de la fila (`let-rowIndex`), que cambia al ordenar, filtrar o paginar.
- **¿El `<p-table>` ya tiene `[rowHover]="true"`?** Verificar ANTES de tocar nada — una pasada separada, ajena a esta skill ("agregando hover a las tablas de módulos", 2026-09-11), ya lo agregó a buena parte de las tablas del proyecto (`usuario.html` es un caso real: llegó con `[rowHover]="true"` puesto, pero sin el signal ni el binding del `<tr>` — la fila puede estar a medio aplicar). Si ya está, no volver a agregarlo ni tocar ese atributo — pasar directo al resto del Paso 2. Si falta, agregarlo ahí (ver "Hover" más abajo). Mismo criterio para `[class.fila-recien-abierta]="..."` en el `<tr>`: si el `<tr>` YA referencia un signal (`idXRecienAbierto`/`idXRecienAbierta`) que no existe todavía en el `.ts`, es la misma señal de una aplicación a medias — completar el `.ts` con ESE nombre en vez de inventar uno nuevo o duplicar el binding.
- **Todo control de la fila que abre un diálogo para ESA fila** — revisar cada `(click)`/`(onClick)` dentro del `<tr>`, celda por celda, no solo la columna "Acciones". En el piloto eran siete controles: ver detalles (ojo) y la campanita de alertas (ambos → `verDetalle`), documentos, consulta SIAF, editar, eliminar (`p-confirmdialog` también cuenta como diálogo) y el botón "Enviar" de la columna Ensamblaje (`abrirConfirmacion`).

Clasificar cada handler encontrado:

| El handler... | ¿Marca la fila? |
|---|---|
| Abre un `p-dialog`, un componente de diálogo hijo o un `p-confirmdialog` con los datos de la fila | **Sí** |
| Solo navega a otra pantalla (`router.navigate`, `routerLink`) | **No** — el componente se destruye y el signal se pierde igual. Persistir la marca entre pantallas (sessionStorage, etc.) no está decidido: no agregarlo sin que el usuario lo pida. |
| A veces navega y a veces abre un diálogo, según el estado de la fila | **Sí**, si desde la tabla puede terminar abriendo un diálogo — marcar al inicio es inofensivo si al final navega. Si desde la tabla solo puede navegar (ej. `gestionarEnsamblaje` en el piloto, que desde la fila solo se alcanza con un proceso ya existente), no. |
| No depende de una fila ("+ Nuevo", "Limpiar", exportar) | **No** — no hay fila que marcar. Resaltar la fila recién creada al guardar un alta no está decidido: no agregarlo sin pedido explícito. |

Del `.ts`: dónde vive cada handler. Si el `<tr>` está en un componente hijo (dumb) que solo emite un `output()` y el diálogo vive en el padre, el signal va en el componente que renderiza el `<tr>` (el hijo) y se setea en su propio handler de clic, justo antes de emitir — no hace falta subirlo al padre.

## Paso 2 — Aplicar

### `.ts` — un signal dedicado por tabla

Nombre: `id<Entidad>RecienAbierta` o `id<Entidad>RecienAbierto` según el género del sustantivo de dominio, en español y sin abreviar (`idOrdenRecienAbierta`, `idPedidoRecienAbierto`, `idProductoRecienAbierto`). Tipo según el campo identificador (`signal<number | null>(null)` para un `id` numérico). Copiar el comentario del piloto, adaptando la lista de acciones:

```typescript
/** Última orden cuyo diálogo se abrió desde una fila de la tabla (Ver
 * detalles, Editar, Documentos, SIAF, Enviar, Eliminar). Esa fila queda
 * pintada con `.fila-recien-abierta` (styles.scss) para que, al cerrar el
 * diálogo, el usuario la reconozca de un vistazo en vez de volver a
 * buscarla entre decenas de filas parecidas. Guarda el id, no la fila: el
 * listado se reemplaza al guardar/registrar (ver `ordenEnConsulta`) y la
 * marca tiene que sobrevivir a eso. Se queda hasta que se abre otra fila. */
protected readonly idOrdenRecienAbierta = signal<number | null>(null);
```

Y como **primera línea** de cada handler que el Paso 1 clasificó con "Sí":

```typescript
verDetalle(orden: Venta): void {
  this.idOrdenRecienAbierta.set(orden.id);
  this.ordenSeleccionada.set(orden);
  this.dialogoDetalleVisible.set(true);
}
```

**Por qué un signal nuevo y no reusar el que ya guarda la fila del diálogo** (`ordenSeleccionada`, `ordenEnDocumentos`, `ordenParaConfirmar`...): cada diálogo suele tener su propio signal (en el piloto eran tres distintos para siete controles), y algunos se resetean por motivos ajenos a la tabla — `agregarNueva()` pone `ordenSeleccionada` en `null`, así que reusarlo borraría la marca apenas se abre "+ Orden de Compra". Un signal dedicado solo cambia cuando se abre otra fila.

### `.html` — binding en el `<tr>` del body

```html
<ng-template #body let-fila>
  <tr [class.fila-recien-abierta]="fila.id === idOrdenRecienAbierta()">
```

- Solo en el `<tr>` principal del template `body` — no en filas de expansión (`#expandedrow`), ni en `#header`/`#emptymessage`.
- Si el `<tr>` ya tiene `[ngClass]`, agregar la clave `'fila-recien-abierta'` ahí en vez de sumar un `[class.…]` al lado (principio de no sorpresa: seguir el patrón que ya usa el archivo).

### `.scss` — nada

Ni el `.scss` del componente ni `styles.scss` se tocan (ver "Qué ya existe").

### Hover: `[rowHover]="true"` en el `<p-table>`

Agregado 2026-09-11 (pedido explícito del usuario sobre el piloto): toda tabla a la que se le aplica esta skill lleva además `[rowHover]="true"` en el `<p-table>`, para que el usuario vea de un vistazo qué fila tiene el mouse encima antes de hacer clic — mismo criterio de usabilidad que la propia marca de "recién abierta", pero para la fila que está a punto de abrirse.

- **No hace falta CSS ni clase adicional en el `<tr>`.** `[rowHover]="true"` agrega por sí solo la clase `.p-datatable-hoverable` a la tabla — PrimeNG (`@primeuix/styles/datatable`) ya trae la regla `.p-datatable-hoverable .p-datatable-tbody > tr:not(.p-datatable-row-selected):hover`, resuelta al token `datatable.row.hover.background` (→ `content.hover.background`, un gris neutro `surface.100`/`surface.800` según modo — **no** el `sky` de `.fila-recien-abierta`). Se aplica a cualquier `<tr>` dentro de `.p-datatable-tbody`, incluido el de un `#body` propio — no requiere una clase `p-selectable-row` (esa nota de la documentación de PrimeNG es para directivas de reordenamiento/selección avanzada, no para este CSS puro).
- **Es intencional que el hover (gris) tape momentáneamente el resaltado (celeste) de `.fila-recien-abierta`** mientras el mouse está encima de esa fila — la regla de hover de PrimeNG es más específica (ver "Lo que NO hacer" más abajo) y gana mientras dura el `:hover`; al sacar el mouse, el celeste vuelve solo. No es un bug ni hace falta ajustar especificidad — es el mismo comportamiento que ya distinguía la skill antes de tener hover propio.
- Agregar el atributo alcanza — no fijar `hoverable`, `stripedRows` ni `selectionMode` junto a esto sin que el usuario lo pida (son ejes independientes).

## Lo que NO hacer (ya descartado)

- **Comparar por referencia de objeto** (`fila === ordenSeleccionada()`): al guardar o registrar, el servicio reemplaza la fila en el listado por un objeto nuevo y la marca se pierde justo cuando el usuario vuelve a la tabla. Siempre por id.
- **Usar la selección de PrimeNG** (`selectionMode`, `[(selection)]`, `[pSelectableRow]`) o poner a mano su clase interna `.p-datatable-row-selected`: activan comportamiento de selección (clic en cualquier parte de la fila, teclado) que la pantalla no tiene y atan el resultado a una clase interna de la librería. La marca es solo visual; `.fila-recien-abierta` usa los mismos colores sin ese comportamiento.
- **Borrar la marca al cerrar el diálogo** o desvanecerla con un `setTimeout`: el objetivo es justamente que se vea DESPUÉS de cerrar. Se mueve solo cuando se abre otra fila.
- **CSS local o un color propio** (ver "Qué ya existe").
- **El índice de fila como identificador** (ver Paso 1).

**Gotcha — el hover (gris) tapa el resaltado (celeste) mientras el mouse está encima**: desde 2026-09-11 esta skill agrega `[rowHover]="true"` a toda tabla (ver sección "Hover" arriba) — su regla de hover de PrimeNG (`.p-datatable-hoverable .p-datatable-tbody > tr:not(.p-datatable-row-selected):hover`) es más específica que `.fila-recien-abierta` y gana mientras dura el `:hover`, devolviendo el celeste al sacar el mouse. Es el comportamiento esperado — no pelearlo con `!important` ni intentar que el celeste "gane" durante el hover.

## Paso 3 — Verificar

1. Compilar desde la raíz del repo — valida el template y los estilos:
   ```
   npm --prefix frontend run build -- --configuration development
   ```
2. Checklist:
   - [ ] Un signal por tabla, `id<Entidad>RecienAbierta/o`, con el comentario del por qué.
   - [ ] `.set(fila.<id>)` como primera línea de TODOS los handlers que abren un diálogo para una fila (revisados celda por celda, no solo "Acciones") y de ninguno que solo navega o no depende de una fila.
   - [ ] Binding en el `<tr>` principal del body, comparando por id.
   - [ ] `[rowHover]="true"` en el `<p-table>`.
   - [ ] Ningún cambio en el `.scss` del componente ni en `styles.scss`.
3. **Verificación visual (obligatoria, la hace el usuario)** — el agente no puede abrir un navegador. Pedirle que recargue y confirme:
   1. Abrir un diálogo de una fila a mitad de la tabla y cerrarlo → la fila queda pintada.
   2. Abrir un diálogo de otra fila → la marca pasa a esa.
   3. Guardar una edición → la fila sigue pintada después de que el listado se refresca.
   4. Pasar el mouse sobre cualquier fila (sin hacer clic) → se ve un gris suave de hover; al sacarlo, si esa fila tenía la marca celeste, vuelve a verse.
   5. En modo oscuro la fila se sigue distinguiendo (marca y hover).

Si la fila no se pinta, los sospechosos, en orden: se está comparando por referencia en vez de por id; el campo usado no existe en la fila (`fila.id` vs. el identificador real); la tabla no es una `p-table` — la regla global está acotada a `.p-datatable`, así que un `<table>` HTML plano (ej. dentro de un diálogo) no la recibe, y ese caso no está cubierto por esta skill.
