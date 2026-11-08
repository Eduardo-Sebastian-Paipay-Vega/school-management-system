---
name: tabla-orden-dinamico
description: Configura tablas Angular del proyecto con orden de columnas por usuario y, opcionalmente, ajuste de anchos persistente. Úsala al pedir personalización de columnas de una tabla; primero diagnostica su estado, consulta las columnas fijas y la preferencia de ajuste de ancho, y mantiene Acciones siempre fija.
---

# Tabla con orden dinámico por usuario

Aplicar únicamente a la tabla indicada. Si el usuario señala «esta tabla», usar la última pantalla mencionada en la conversación; preguntar solo si hay varios candidatos reales. Crear o editar esta skill no autoriza a modificar otras tablas.

## Antes de editar código funcional

Leer `AGENTS.md`, la documentación relevante de `docs/arquitectura/`, `docs/desarrollo/CODING_STANDARDS.md` y la skill `frontend-standards` disponible en este repositorio.

**Antes de editar código funcional, resolver las preferencias pendientes con el usuario.** Reutilizar las respuestas explícitas de la conversación; no volver a pedir una elección ya resuelta. Mientras falte una respuesta necesaria, continuar únicamente con inspección y documentación de la propuesta.

### Diagnosticar la tabla

Leer su componente, plantilla y estilos. Informar brevemente:

- Tabla/pestaña concreta, archivos y clave estable de preferencias (`tablaId`).
- Si el orden personalizado está desactivado, activo o conectado parcialmente. Revisar tanto el panel «Ordenar» como el arrastre directo de encabezados; no confundirlos con ordenar registros mediante `pSortableColumn`.
- Si cabecera y celdas recorren la misma definición ordenada o si el cuerpo conserva posiciones fijas.
- Columnas visibles, obligatorias, fijas y ocultas; restricciones por permisos y encabezados agrupados. Ser obligatoria significa que no puede ocultarse; no implica necesariamente posición fija.
- Si hay ajuste de ancho, si se restaura al recargar y dónde se persiste. Distinguir un cambio de estilo temporal de un ancho guardado por usuario.
- Si la configuración se almacena por usuario y tabla en el backend. `localStorage` sin esa persistencia no garantiza conservarla entre equipos.

### Resolver preferencias

1. Preguntar: **«Además de Acciones, ¿qué columnas quieres dejar fijas, sin poder moverlas?»** Mostrar las actuales como referencia y aceptar «solo Acciones». No imponer identificadores fijos sin consultar, salvo «N° Orden», que va fija por defecto (ver «Columna N° Orden»).
2. Preguntar: **«¿Quieres poder estirar o reducir el ancho de las columnas y guardar esos anchos por usuario?»** Si el usuario ya lo solicitó o rechazó explícitamente, registrar esa respuesta sin repetir la pregunta.
3. Explicar el estado detectado y los cambios concretos necesarios. Si el usuario pidió revisar antes de tocar código, completar esta fase antes de cualquier modificación funcional.

**Acciones siempre debe permanecer visible y fija en su posición.** Identificar su campo real (`acciones`, `accion` u otro equivalente) y protegerlo también al cargar preferencias antiguas y al recibir eventos de arrastre. Si la tabla no tiene acciones, no crear una columna nueva para cumplir esta regla.

## Aplicar las elecciones

Revisar y reutilizar estos recursos antes de crear otro mecanismo:

- `frontend/src/app/shared/models/columna-tabla.model.ts`.
- `frontend/src/app/shared/utils/columnas-personalizables.ts` (`crearColumnasPersonalizables`, `reordenable`, `camposFijos`).
- `frontend/src/app/shared/ui/selector-columnas/`.
- Directiva `frontend/src/app/shared/ui/selector-columnas/columna-redimensionable.ts`, para evitar ordenar filas al pulsar el borde de ajuste.
- `frontend/src/app/core/services/preferencias-columnas.service.ts`.
- Modelo, serializer y ViewSet de `PreferenciaColumnasTabla` en `BACKEND/usuarios/` y su ruta efectiva en `urls.py`.

Son referencias existentes, no garantía de que todas las capacidades ya estén implementadas: inspeccionar su contrato actual. Cualquier ampliación compartida debe conservar el comportamiento de las tablas que no la activan.

### Orden de columnas

- Activar explícitamente la capacidad en la tabla objetivo y configurar `camposFijos` con Acciones y la selección del usuario.
- En Control de Órdenes de Compra, todas las columnas de datos deben estar disponibles en Mostrar, incluidas Categorías, Marcas, RUC, Orden de Compra y N° Ord. Solo Acciones es obligatoria. No usar `obligatoria` para fijar una posición: ocultaría la columna del selector e impediría al usuario quitarla; usar `camposFijos` para el orden.
- Cabecera y cuerpo deben usar el mismo orden por campo estable. Conservar el contenido de las celdas, acciones, permisos, estilos y paginación existentes.
- Conectar el arrastre **directo de encabezados**, además del panel de orden si existe. Nuestro Stock y Control de Órdenes de Compra contienen referencias con Angular CDK; comprobar su implementación actual antes de reutilizarla.
- Traducir campos visibles a la definición completa al guardar: las columnas ocultas no deben desfasar los índices. Preservar bloques de encabezados agrupados.
- Evitar que el gesto de mover una columna active el ordenamiento de registros o un control del encabezado.
- No agregar íconos `pi pi-bars` a los encabezados: el usuario debe poder arrastrar el encabezado sin ese ícono. Conservar una indicación discreta mediante cursor y texto de ayuda.

### Columna «N° Orden» (referencia: Envíos)

Las tablas de Ganadas x Ejecutar y Control O/C llevan la columna del número de registro de la orden (`Venta.correlativo`), pintada con el azul del encabezado y texto blanco para que se lea como su prolongación. Al pasar una de esas tablas a columnas dinámicas, conservarla como en `frontend/src/app/components/ventas/envio/` (`envio.ts`, `envio.html`):

- Definición: `{ campo: 'venta_correlativo', header: 'N° Orden', obligatoria: true, anchoMinimo: 50, anchoInicial: 56 }`, como primera columna.
- **Fija por defecto**: incluir su campo en `camposFijos` junto a Acciones (`camposFijos: ['venta_correlativo', 'acciones']`), para que siempre quede primera. `obligatoria` solo impide ocultarla; sin `camposFijos` el usuario podría moverla. Al preguntar «¿qué columnas quieres dejar fijas?», presentarla ya marcada como fija; solo dejarla movible si el usuario lo pide. Usar el campo real de la tabla (`venta_correlativo`, `correlativo`, etc.). Al quedar fija, `puedeSoltarColumnaEn` deshabilita el arrastre de su `th` y tampoco se puede soltar otra columna en su lugar; el orden guardado anterior la ignora, sin migración.
- Anchos explícitos obligatorios: sin `anchoInicial` toma el valor por defecto de 160 px y el reparto proporcional de `crearAjusteColumnas` la ensancha. Con `redimensionable`, el `width: 3.5rem` de la clase global queda subordinado al `<col>` del `colgroup`, así que el ancho real lo deciden `anchoInicial`/`anchoMinimo`.
- Celda: un `@case` propio en el `@switch` del cuerpo con `<td class="celda-numero-orden">`, el número corto de `numeroCorrelativo()` (`shared/utils/correlativo-venta.util.ts`) y el correlativo completo en `pTooltip`. La rama sin correlativo también lleva la clase (muestra «—»); si falta, esa celda queda blanca y rompe la franja azul.
- Estilo: solo la clase global `.celda-numero-orden` de `frontend/src/styles.scss` (negrita, cifras tabulares, centrado, fondo `#0b86be`, texto blanco). No copiar esos valores al `.scss` del componente. El color va sobre el `<td>`, no sobre el `<tr>`, para que se mantenga con `[rowHover]` y con `.fila-recien-abierta`.
- Encabezado: el `th` usa la misma rama que los demás (redimensionable y ordenable; el arrastre lo desactiva `camposFijos`); no se le da estilo especial.

### Ancho de columnas, solo si se solicitó

- El controlador compartido dispone de `redimensionable: true`, `anchosColumnas`, `anchoColumna`, `anchoMinimoColumna` y `actualizarAnchos`. Usa `PreferenciasColumnasService.obtenerAnchos/guardarAnchos` y una clave `<tablaId>.anchos`. La implementación de Control de Órdenes de Compra incluye `colgroup` con anchos explícitos desde la carga inicial, cálculo del ancho elegido como ancho anterior más `evento.delta` y eliminación del CSS temporal por índice de PrimeNG; reutilizar el patrón en vez de duplicar la persistencia.
- El contrato actual incorpora `PreferenciaColumnasTabla.anchos_columnas` (migración `usuarios.0033`), un objeto de campos a anchos enteros de 48 a 4000 píxeles. `ColumnaTabla.anchoInicial` y `anchoMinimo` permiten ajustar los valores de cada columna. Confirmar estos recursos en el código antes de asumir que ya están aplicados en la base del entorno objetivo.
- Revisar el soporte real de la versión instalada de PrimeNG: `resizableColumns`, `pResizableColumn`, `columnResizeMode` y `onColResize`.
- Mantener diferenciados el arrastre del encabezado para moverlo y el arrastre de su borde para cambiar el ancho.
- Guardar anchos numéricos por **campo estable, usuario y tabla**, no por índice ni por texto del encabezado. Si hace falta ampliar el contrato del backend, validar el esquema existente, los permisos y las migraciones necesarias antes de implementarlo; no codificar anchos dentro de una lista de nombres de columnas.
- Persistir al terminar el gesto, no en cada movimiento del puntero. Restaurar anchos al recargar y conservarlos al mover, ocultar o volver a mostrar columnas.
- Verificar arrastres sucesivos de ampliar y reducir: las demás columnas deben conservar su ancho. No medir el DOM después del ajuste de PrimeNG para calcular el ancho: el `colgroup` anterior puede impedir reducir o repartir espacio. Consumir también el clic final si el puntero termina sobre otro encabezado.
- Respetar anchos mínimos útiles y el scroll horizontal. Si el objetivo es cambiar solo el ancho elegido, evaluar `expand` para no reducir automáticamente la columna vecina.
- En Control de Órdenes de Compra, mantener el ancho de tabla al 100% con el mínimo igual a la suma de anchos, Acciones como columna que absorbe el espacio libre, y el selector anclado fuera del contenedor desplazable. Permitir varias líneas en encabezados, datos y pastillas al estrechar una columna; no ocultar información con elipsis.
- Mantener el mecanismo como opción por tabla. Si el usuario no desea ajuste de ancho, conservar los anchos y el comportamiento existentes.
- Definir «Restablecer» de forma coherente con las preferencias habilitadas y mantener compatibilidad con usuarios que aún no tengan anchos guardados.

### Alineación visual de Acciones y selector

- Centrar el grupo de botones bajo el texto de Acciones, con separación uniforme y sin estirar los botones para llenar una columna amplia. Mantener el `td` como celda de tabla y colocar el flex en un envoltorio interno; preservar tooltips, permisos y contadores.
- Cuando el encabezado reserve espacio para el selector fijo, aplicar la misma reserva al cuerpo: centrar ambos sin igualar sus espacios laterales produce un desfase visible. Revisar el resultado tanto con pocas columnas como con todas visibles y con filas de varias líneas.
- En Control de Órdenes de Compra, el selector usa fondo `info` y permanece fuera del desplazamiento horizontal. Su fondo debe coincidir con los bordes superior e inferior reales del encabezado, incluido el borde de la tabla. La implementación usa `ResizeObserver` y las variables `--inicio-encabezado-ordenes` / `--alto-encabezado-ordenes`; el observador debe desconectarse al destruir la vista. Evitar asumir una altura fija cuando los títulos pueden envolver.

## Verificar y entregar

Validar la compilación Angular y las pruebas relevantes. Para cambios de persistencia o lógica compartida, comprobar carga inicial, guardado y recuperación por usuario, columnas ocultas, campos nuevos, posiciones fijas y compatibilidad con otras tablas consumidoras. Si cambió el esquema, verificar las migraciones pendientes; no desplegar ni ejecutar migraciones remotas por haber invocado esta skill.

Comprobar en la aplicación en funcionamiento, cuando haya acceso, que el gesto mueve datos y encabezados juntos y que el ajuste de borde conserva el ancho después de recargar. Abrir el `.html` con `file:///` no ejecuta Angular. Si no se pudo probar visualmente, indicarlo sin presentar las pruebas unitarias como validación en navegador.

Al entregar, indicar qué se activó, cuáles columnas quedaron fijas, si se habilitaron anchos persistentes, las verificaciones realizadas y si el cambio sigue local o está desplegado.
