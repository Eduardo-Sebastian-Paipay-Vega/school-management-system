---
name: frontend-standards
description: Guía de estandarización del frontend Angular para el sistema de decisión de licitaciones públicas (Perú) — módulos de licitaciones/scoring, órdenes de compra, cobranzas/expedientes, catálogo, stock, ensamblaje, plazo de entrega y cobertura. USA ESTA SKILL SIEMPRE que se escriba, revise o modifique código Angular en este proyecto — componentes, servicios, formularios, tablas, gráficos ECharts, estilos — incluso si el usuario no menciona explícitamente "estándar" o "convención". También úsala al revisar código existente para detectar desviaciones del estándar.
---

# Estandarización Frontend — Sistema de Licitaciones (Angular)

Stack de referencia: **Angular (LTS, standalone components) + PrimeNG + Angular Material (secundario) + ECharts + Signals**, consumiendo un backend **Django REST Framework**.

Esta skill existe para que cualquier componente, servicio o página que se genere sea indistinguible de uno escrito por el resto del equipo. Si vas a escribir código Angular para este proyecto, sigue esto antes de improvisar una estructura propia.

## Regla de oro sobre las dos librerías de UI

- **PrimeNG es la librería primaria.** Úsala por defecto para tablas, dialogs, formularios, menús, toasts.
- **Angular Material solo se usa cuando PrimeNG no cubre bien el caso** (ej. un control específico que PrimeNG no tiene o resuelve peor).
- Cuando uses Material, deja un comentario en el componente explicando por qué no se usó PrimeNG. Esto evita que la próxima persona "normalice" el uso de Material por comodidad.
- Nunca mezcles el mismo tipo de componente de ambas librerías en el mismo módulo (ej. no uses `p-table` y `mat-table` en la misma pantalla).

## Tema PrimeNG y color primario

`app.config.ts` no usa el preset `Aura` tal cual: lo envuelve con un `CompusurPreset = definePreset(Aura, { semantic: { primary: {...} } })` que redefine el token `primary` a la paleta `sky` (la misma que PrimeNG usa para `severity="info"`), en vez del `emerald` (verde) que trae Aura por defecto.

- **Por qué**: Aura sin tocar deja `primary = emerald`, y como el foco de todo campo de formulario (`formField.focusBorderColor`), los checkboxes/radios sin `severity`, los tabs activos, etc. resuelven a `{primary.color}`, toda la app salía con borde de foco **verde** — se leía como un estado "success" sin serlo. `sky` es el mismo azul que ya usa el resto del sistema para `severity="info"` (el `severity` por defecto de los botones primarios en este proyecto, ver ejemplos de arriba), así que el cambio los deja consistentes entre sí.
- **Es un cambio global, no por componente**: no hace falta (ni se debe) sobreescribir el borde de foco a mano en cada `shared/ui/` — cualquier control PrimeNG sin `severity` explícito ya hereda el nuevo azul automáticamente. Si un color se ve "verde" en algún lugar nuevo, revisar primero si tiene un `severity="success"` explícito antes de tocar el preset.
- Para agregar/ajustar otro token semántico (ej. `secondary`, `surface`), extender el mismo objeto `semantic` de `CompusurPreset` en `app.config.ts` — no crear un segundo `definePreset` ni un preset por módulo.
- Detalle completo en `docs/arquitectura/contexto-proyecto.md` § "Diseño / UI".

## 1. Estructura de carpetas

Organización por *feature*, no por tipo de archivo:

```
src/app/
├── core/                     # singletons: interceptors, guards, config
│   ├── interceptors/
│   ├── guards/
│   └── services/              # servicios transversales (auth, error-handler)
├── shared/                   # reutilizable entre features
│   ├── ui/                    # componentes de presentación puros (standalone)
│   ├── directives/
│   ├── pipes/
│   └── models/                 # interfaces compartidas (tipos que reflejan los serializers de Django REST Framework)
├── features/
│   ├── licitaciones/
│   │   ├── pages/              # componentes de ruta (smart components)
│   │   ├── components/         # componentes de UI propios del feature (dumb components)
│   │   ├── services/            # llamadas HTTP + estado del feature
│   │   ├── models/
│   │   └── licitaciones.routes.ts
│   ├── ordenes-compra/
│   ├── cobranzas-expedientes/
│   ├── catalogo/
│   ├── stock/
│   ├── ensamblaje/
│   ├── plazo-entrega/
│   └── cobertura/
└── app.routes.ts               # lazy loading por feature
```

Regla: cada carpeta bajo `features/` corresponde 1:1 a un módulo de negocio del documento de alcance. No crear jerarquías nuevas sin antes revisar si el feature ya existe.

**Módulos reales del sidebar hoy** (pueden no coincidir con los nombres de ejemplo de arriba, que son genéricos del documento de alcance): Catálogos PC, A Batallar (grupo desplegable con CG-Computadoras, CG-Impresoras, CG-Baterías y Accs., CG-Multimedia), Ventas (antes "Cobranzas"). Ver `docs/arquitectura/contexto-proyecto.md` en la raíz del repo para el estado actualizado.

**Estado actual vs. estructura objetivo**: mientras un módulo sea solo un placeholder ("en construcción", sin servicios ni estado propio), puede vivir como componente suelto en `components/<modulo>/` referenciado desde `features/home/home.routes.ts` y listado en `features/home/nav.config.ts` — es el patrón usado hoy por todos los módulos de negocio. Cuando un módulo necesite lógica real (llamadas HTTP, estado con signals, formularios), **promoverlo** a `features/<modulo>/` siguiendo la estructura completa de arriba (`pages/`, `components/`, `services/`, `models/`).

## 2. Convenciones de nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Selector de componente | prefijo `app-` + kebab-case | `app-licitacion-tabla` |
| Archivo de componente | `nombre.component.ts` | `licitacion-tabla.component.ts` |
| Servicio | `nombre.service.ts`, sufijo `Service` | `licitaciones.service.ts` / `LicitacionesService` |
| Interfaz de modelo | PascalCase, sin prefijo `I` | `Licitacion`, `OrdenCompra` |
| Signal privado (estado interno) | prefijo `_` | `private _licitaciones = signal<Licitacion[]>([])` |
| Signal público expuesto (readonly) | sin prefijo | `licitaciones = this._licitaciones.asReadonly()` |
| Rutas | kebab-case, en español (coincide con el dominio del negocio) | `/licitaciones/scoring` |

No abreviar nombres de dominio (usar `licitacion`, no `lic`; usar `ordenCompra`, no `oc`) — el equipo trabaja directamente con esta terminología con el cliente.

## 3. Componentes

- **Standalone siempre.** No usar NgModules salvo justificación explícita.
- **`ChangeDetectionStrategy.OnPush` en todos los componentes.** Con signals esto es casi automático, pero decláralo explícito.
- Separar **smart components** (en `pages/`, orquestan servicios y estado) de **dumb components** (en `components/` o `shared/ui/`, reciben datos por `input()` y emiten por `output()`, sin llamadas HTTP propias).
- Usar la nueva API de inputs/outputs basada en funciones (`input()`, `output()`, `model()`), no los decoradores clásicos `@Input()`/`@Output()`, salvo que el proyecto ya tenga código legado con decoradores (en ese caso no migrar código existente solo por estilo — ver "Principio de no sorpresa" abajo).

### Diálogos (`p-dialog`)

- El header de un diálogo es **solo el título, sin fondo de color ni ícono**: usa el input `header` de `p-dialog` cuando el título es un string estático (`header="Nuevo Proveedor"`), o un `ng-template #header` con un único `<span>` en negrita cuando el título necesita interpolación (ej. mostrar el nombre de la entidad que se está editando: `<span>Editar Proveedor: <strong>{{ entidad().nombre }}</strong></span>`).
- No agregues `background`/`linear-gradient` ni íconos al header vía `styleClass` + `::ng-deep` — deja que el tema (Aura) resuelva el color de fondo y el radio del borde por defecto. Algunos diálogos de "crear" en `a-batallar/` (ej. `nuevo-cg-computadoras`) todavía usan un header con degradado — es un patrón legado, no lo repliques en diálogos nuevos (ver "Principio de no sorpresa" si vas a tocar esos archivos).
- Diálogos de alta/edición: `[modal]="true" [dismissableMask]="false" [closeOnEscape]="true" [draggable]="true" [closable]="true"` (**todo** `p-dialog` es arrastrable y se cierra con Esc — ver "Todos los diálogos: arrastrables y cierre con Esc" más abajo), con `ng-template #footer` (botón "Cancelar" + botón de acción primaria con ícono). Ver "Validación en diálogos: alerta flotante, no botón deshabilitado" más abajo — el botón de guardar ya **no** se deshabilita con un `computed` `formularioInvalido`.
- **Botón "Cancelar" del footer: exactamente el mismo estilo que el botón "Limpiar" de una toolbar — `<p-button label="Cancelar" severity="secondary" [raised]="true" />`, SIN `[outlined]="true"`** (decidido 2026-09-07, a pedido explícito del usuario: no le gusta que "Cancelar" tenga un estilo distinto — borde en vez de relleno — al resto de los botones secundarios de la app). Es un botón secundario sólido y elevado, igual que "Limpiar". Los diálogos viejos que todavía tengan `[outlined]="true"` en "Cancelar" son una desviación: corregir al `[raised]` sólido cuando se toque ese archivo por otra razón (Principio de no sorpresa), o en una pasada dedicada si el usuario la pide.
- **Título de una sección dentro de un diálogo: siempre `<h4>`, nunca `<h3>` ni otro nivel.** El header del propio `p-dialog` ya ocupa el rol de título de nivel 1 de esa ventana — cada bloque interno (`detalle-pedido.html`: "Detalles del pedido", "Datos de la orden de compra", "Recepciones", "Historial de Sucesos", etc.) es un `<h4>` con el mismo estilo (`font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--p-text-color)`, ver `.detalle-pedido-seccion h4` en `detalle-pedido.scss`). Corregido (2026-08-25) en `enviar-a-ensamblaje.html`, que tenía "Productos" en `<h3>` — un nivel de encabezado inventado que no existe en ningún otro diálogo de la app.
- Formularios dentro de diálogos: un signal por campo (no reactive forms), con `effect()` reaccionando a `visible()` para limpiar el formulario (alta) o clonar los datos recibidos por `input()` a un buffer local (edición). Ejemplo real: `components/cotizador/proveedores/modal/`.
- Un campo obligatorio con un valor por defecto razonable (ej. "quien registra el pedido es, por defecto, el responsable de compra") se precarga en el mismo `effect()` de reseteo del formulario en vez de nacer vacío — sigue siendo editable, solo ahorra un clic en el caso más común. Ejemplo real: `components/ventas/pedidos/modal/nuevo-pedido/nuevo-pedido.ts` precarga "Responsable de compra" con `AuthService.user()?.id` y "Origen" con el valor más frecuente del negocio (`PROVEEDOR_EXTERNO`).

**Gotcha de PrimeNG — scroll horizontal fantasma en `.p-dialog-content`**: el CSS base de PrimeNG (`@primeuix/styles/dialog`) define `.p-dialog-content` con `overflow-y: auto` y nunca fija `overflow-x` — por la regla de overflow del CSSOM (si un eje no es `visible` y el otro sí, el otro pasa a computar `auto` también), el navegador trata el eje horizontal como `auto` en **todo** diálogo de la app. Cualquier desborde mínimo de subpíxel (muy fácil de disparar con una grilla `repeat(N, 1fr)` + `gap`, ver "Grillas de formulario en diálogos" abajo) dispara una barra de scroll horizontal casi vacía entre el contenido y el footer — se ve como si el diálogo estuviera "roto", aunque ningún campo se desborda visiblemente. Corregido de raíz (2026-08-22) con `.p-dialog-content { overflow-x: hidden; }` **global** en `styles.scss` — es un bug del tema, no de un diálogo puntual, así que no se parchea por componente. Si un diálogo nuevo vuelve a mostrar este síntoma, sospechar primero de una regresión en esa regla global antes de agregar un override local.

**Gotcha — un `p-dialog` nunca va anidado dentro del contenido de otro `p-dialog`**: `.p-dialog` trae `transform: scale(1)` en el CSS base de PrimeNG (siempre presente, incluso en reposo) — cualquier `transform` en un ancestro crea un nuevo *containing block* para sus descendientes `position: fixed`. Si el diálogo hijo (ej. un sub-diálogo "Adjuntar documento" o "Registrar un evento") se declara literalmente DENTRO de las etiquetas `<p-dialog>...</p-dialog>` del diálogo padre, su mask (`position: fixed`, pensado para cubrir el viewport) deja de medirse contra el viewport y pasa a medirse contra la caja del padre — el padre termina con un scroll gigante y las esquinas redondeadas se ven "rotas" en cuanto el hijo se abre. Corregido (2026-08-24) en `components/ventas/pedidos/modal/{detalle-pedido,registrar-recepcion}/*.html`: el `p-dialog` del sub-diálogo se saca de las etiquetas del padre y se declara como **hermano**, después del `</p-dialog>` principal — mismo lugar donde ya vivía `app-visor-documento`. Ningún binding se rompe por sacarlo (las variables/señales siguen siendo del mismo componente); solo cambia dónde queda en el árbol del DOM. Regla: todo `p-dialog` adicional de un componente (sub-diálogo de confirmación, subida de archivo, etc.) se declara siempre fuera de las etiquetas del `p-dialog` principal, nunca en su contenido — si hace falta abrirlo desde dentro visualmente no importa, el `[(visible)]` ya lo posiciona con su propio mask.

### Diálogos que encadenan una segunda acción: no cerrar ni avisar hasta persistir la final

Decidido en `components/ventas/ordenes-compra/ordenes-compra.ts:guardarConfirmacion` (2026-08-22): el diálogo "Enviar a Ensamblar" guarda primero una confirmación y, según el resultado, abre un segundo diálogo ("Nuevo pedido" o el alta de un proceso de ensamblaje) para completar el flujo.

- Si guardar el primer paso **no** es la información final (hay una segunda acción por delante), el diálogo no se cierra (`visible.set(false)`) ni se muestra el toast de éxito todavía — se queda abierto, apilado detrás del segundo diálogo, hasta que ESA acción también termine de persistirse. Cerrar y avisar apenas termina el primer paso da una falsa impresión de "listo" mientras el usuario todavía tiene un formulario pendiente por completar.
- Solo la rama que de verdad llega al final del flujo (sin abrir nada más — ej. "Conforme", que navega directo a otra pantalla) cierra y avisa de inmediato.
- Si hace falta distinguir, dentro de una función que también se llama sola desde otro lugar (ej. `gestionarEnsamblaje`, que además es el handler del botón "Enviar" de la tabla), si la llamada actual viene de ese flujo encadenado, leer el signal de visibilidad del diálogo anterior ANTES de cerrarlo (`const vieneDeConfirmacion = this.dialogoConfirmacionVisible();`) — así el toast/comportamiento extra solo aplica cuando corresponde, no en el uso suelto.

### Validación en diálogos: alerta flotante, no botón deshabilitado

Decidido tras `components/configuracion/parametros/marcas/modal/` (piloto) y aplicado después a `components/ventas/ordenes-compra/modal/` (formulario y "Registrar evento" de Consulta SIAF). Reemplaza el patrón anterior (botón "Guardar" con `[disabled]="formularioInvalido()"`) en todo diálogo nuevo; los diálogos existentes se migran cuando se toquen por otra razón (ver "Principio de no sorpresa").

- **El botón de guardar/registrar de un diálogo siempre está habilitado.** No usar `[disabled]="formularioInvalido()"` en el `p-button` del footer.
- Al hacer clic, el método `guardar*()`/`registrar*()` valida los campos obligatorios él mismo, **antes** de emitir el `output()`: si falta alguno, no emite y no cierra el diálogo.
- Por cada campo obligatorio incompleto se muestra una **alerta flotante** anclada al campo (clase global `.alerta-flotante-campo`, definida en `styles.scss`) — no un `p-toast` genérico en una esquina de la pantalla. Se pueden mostrar varias a la vez si faltan varios campos.
- Los wrappers de `shared/ui/` que participan en formularios de diálogo (`input-texto`, `selector`, `selector-fecha`) exponen un `input()` `error: string | null` — al setearlo, el wrapper resalta el borde del campo y renderiza la alerta flotante debajo. El componente contenedor solo necesita `position: relative` (cada wrapper ya lo trae en su propio `envoltura`).
- Para un campo de PrimeNG usado **directo** (sin wrapper de `shared/ui/`, ej. `p-autoComplete`, `p-inputnumber`), replicar el mismo patrón a mano: el contenedor (`.formulario-*-campo` o equivalente) necesita `position: relative`, y se agrega el `<div class="alerta-flotante-campo" role="alert">` condicionado al signal de error de ese campo — no hace falta tocar el borde del control de PrimeNG si eso requeriría `::ng-deep` extra (la alerta ya es suficiente señal visual).
- **Gotcha — `p-autoComplete` usado directo no ocupa el 100% del contenedor por sí solo**: a diferencia de `app-input-texto`/`app-selector` (que sí estiran su campo interno), el `<input>` de `p-autoComplete` no hereda el ancho del host — se queda con un ancho angosto por defecto y el `placeholder` (ej. "Buscar por razón social o RUC...") se corta a la mitad. Confirmado dos veces: `formulario-orden-compra.scss` (`.formulario-orden-campo .p-autocomplete`) y `components/ventas/contacto/modal/{nuevo-contacto,editar-contacto}/*.scss` ("Entidad", 2026-09-04). Fix de dos reglas, sobre el contenedor `.mi-dialogo-campo` que ya envuelve el `p-autoComplete`:
  ```scss
  ::ng-deep .mi-dialogo-campo .p-autocomplete {
    display: flex;
    width: 100%;
  }
  ::ng-deep .mi-dialogo-campo .p-autocomplete-input {
    width: 100%;
    min-width: 0;
  }
  ```
  Aplicar esto por defecto en TODO diálogo nuevo que use `p-autoComplete` directo — no esperar a que se note el placeholder cortado.
- Patrón en el componente (repetir por cada campo obligatorio, sin abstraer una clase base salvo que un diálogo termine con más de ~5 campos obligatorios):

```typescript
protected errorNombre = signal<string | null>(null);
private readonly timeoutsError: Record<string, ReturnType<typeof setTimeout>> = {};

constructor() {
  // Se limpia sola en cuanto el usuario corrige el campo.
  effect(() => {
    if (this.nombre().trim()) this.errorNombre.set(null);
  });
}

guardar(): void {
  if (!this.nombre().trim()) {
    this.mostrarError('nombre', this.errorNombre, 'El nombre es obligatorio.');
    return;
  }
  this.guardarEvento.emit({ nombre: this.nombre().trim() });
  this.visible.set(false);
}

private mostrarError(campo: string, destino: WritableSignal<string | null>, mensaje: string): void {
  clearTimeout(this.timeoutsError[campo]);
  destino.set(mensaje);
  this.timeoutsError[campo] = setTimeout(() => destino.set(null), 4000); // auto-desaparece
}
```

- Reglas de negocio cruzadas entre campos (ej. "la fecha de vencimiento no puede ser anterior a la fecha de la orden") **no** usan este mecanismo — siguen como una nota inline visible siempre que la condición se cumpla (`<p class="...-nota-alerta">`, ver `formulario-orden-compra.html`), porque no apuntan a un único campo y ya son visibles sin necesidad de un clic en "Guardar".
- Ejemplos reales: `components/configuracion/parametros/marcas/modal/{nueva-marca,editar-marca}/`, `components/ventas/ordenes-compra/modal/formulario-orden-compra/`, `components/ventas/ordenes-compra/modal/consulta-siaf/` (formulario "Registrar una fila del expediente").

### Grillas de formulario en diálogos (`*-grid`, `*-grid-2`, `*-grid-3`)

Patrón repetido en todos los diálogos de alta/edición (`formulario-orden-compra`, `nuevo-pedido`, etc.): cada fila de campos es un `<div class="mi-dialogo-grid mi-dialogo-grid-N">` (`display: grid`, `gap` + `margin-bottom` propios) con `grid-template-columns: repeat(N, 1fr)` (o fracciones específicas si los campos no deben pesar igual), y cada campo adentro es un `.mi-dialogo-campo` (`position: relative; display:flex; flex-direction:column; gap:...`) — `position: relative` es lo que ancla la alerta flotante de validación (ver arriba). Para que dos campos queden del mismo ancho que otra fila del mismo diálogo, usar la misma proporción de columnas (ej. `repeat(2, 1fr)`), no solo "que se vean parecidos".

- **Gotcha de CSS Grid — los márgenes no colapsan entre un grid y sus ítems**: si `.mi-dialogo-campo` tiene su propio `margin-bottom` (necesario para cuando se usa suelto, fuera de una grilla — ej. un campo de ancho completo como "Detalle del pedido") y la fila-grilla que lo contiene TAMBIÉN tiene su propio `margin-bottom`, los dos se suman en vez de que uno "absorba" al otro (a diferencia de bloques normales en flujo, donde los márgenes verticales adyacentes sí colapsan) — el síntoma es que las filas se ven separadas casi el doble de lo esperado. La corrección es anular el margen del hijo dentro de la grilla: `.mi-dialogo-grid > .mi-dialogo-campo { margin-bottom: 0; }`. Corregido en `nuevo-pedido.scss` (2026-08-22); si se detecta el mismo síntoma en otro diálogo con esta retícula, aplicar la misma regla ahí en vez de reinventar el arreglo.
- **No dejar filas-grilla vacías** como placeholder visual para "dejar espacio" — un `<div class="mi-dialogo-grid"></div>` sin contenido igual aporta su `margin-bottom`/`gap` y termina duplicando la separación con la fila siguiente sin que se note por qué. Corregido en `formulario-orden-compra.html` (2026-08-22, tenía dos filas vacías de este tipo entre "Plazo de Entrega" e "Inicio de Entrega", y entre "Inicio de Entrega" y "Observaciones"). Si hace falta espacio extra deliberado, usar `margin`/`padding` explícito, no un div vacío.

### Selects con muchas opciones (`app-selector`, `p-select`)

`app-selector` (`shared/ui/selector/`) envuelve `p-select` con `appendTo="body"` — el panel de opciones no hereda un ancho máximo del campo que lo abre, solo un `min-width` (PrimeNG lo fija por JS igual al ancho del trigger). Con etiquetas largas (ej. razón social de un proveedor), el panel se ensancha hasta el ancho del texto más largo y se sale del diálogo. `selector.html`/`selector.scss` ya lo resuelven a nivel de componente compartido — `panelStyleClass="selector-panel"` + `::ng-deep .selector-panel { max-width: min(26rem, 90vw); .p-select-option-label { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; } }` — cualquier uso nuevo de `app-selector` ya lo hereda solo, no hace falta tocar nada por pantalla.

**Combobox — `[filtro]="true"` en todo `app-selector` respaldado por un catálogo/lista dinámica** (2026-08-31, `mi_tienda/inventario` y `mi_tienda/control-caja`): cualquier `app-selector` cuyas opciones vengan de un catálogo con más de un puñado de valores (marca, categoría, usuario/responsable, motivo de un kardex, etc. — no un enum fijo de 2-3 valores) lleva `[filtro]="true"` para poder escribir y buscar en vez de scrollear una lista larga. Antes de esta fecha era inconsistente: Categoría/Marca ya lo tenían, pero los selectores de "Responsable"/"Quién" de Control de Caja y el de "Motivo" del kardex de Inventario no — se corrigió en los cinco (`control-caja.html` filtro "Quién", `abrir-caja`/`cerrar-caja`/`registrar-gasto`/`registrar-venta` "Responsable", `ajustar-stock` "Motivo"/"Responsable"). Un enum chico y fijo (ej. "Tipo de venta" con 2 opciones vía `p-selectbutton`, o "Tipo de servicio" con 6 vía `app-selector`) no lo necesita — la regla es para listas respaldadas por un catálogo, no para cualquier select.

**Gotcha — dos `app-selector`/`app-input-texto` sueltos y consecutivos (sin grid) quedan pegados sin espacio**: `app-selector`/`app-selector-fecha`/`app-input-texto` (`shared/ui/`) no traen `margin` propio en su `:host` — solo `gap` interno entre su etiqueta y su campo. Si dos de estos componentes van como hermanos directos en el HTML sin un contenedor con `margin`/`gap` entre ellos (fuera del patrón de grid de "Grillas de formulario en diálogos", que sí resuelve esto), quedan visualmente pegados. Pasa solo cuando **ninguno de los dos vecinos** aporta margen — si alguno de los dos ya está envuelto en un wrapper local con `margin` (ej. `.mi-dialogo-campo { margin: 1rem 0; }`, patrón ya usado en varios diálogos para campos de `p-inputnumber`), ese margen solo alcanza para separarlo de SU lado, así que el otro extremo puede seguir sin espacio si también es un campo suelto. Corregido (2026-08-31) en `mi_tienda/inventario/modal/ajustar-stock/ajustar-stock.html` (Motivo y Responsable, ambos sueltos, sin ningún margen entre sí) y en `mi_tienda/control-caja/modal/registrar-venta/registrar-venta.html` (Responsable de la venta, suelto justo después de un bloque sin `margin-bottom`) — envolver cada campo suelto en el wrapper `*-campo` local que ya usa el resto del diálogo para `p-inputnumber` (tiene `margin: 1rem 0`), aunque el campo en sí sea un `app-selector` y no un número. Mismo síntoma confirmado (2026-09-04) con `app-select-editable` — tampoco trae `margin` propio en su `:host` — en `components/ventas/contacto/modal/nuevo-contacto/nuevo-contacto.html` ("Área" quedaba pegado a "Nombre completo"); se resolvió envolviendo el campo "Área" en el mismo wrapper `*-campo` del diálogo (que además ya hacía falta para anclar su propia alerta flotante de validación, ver sección siguiente).

**Gotcha — `app-select-editable` (`shared/ui/select-editable/`) no tenía el mismo estilo de etiqueta que sus hermanos** (2026-09-04, primer uso real del componente, `components/ventas/contacto/modal/{nuevo-contacto,editar-contacto}/`): `.select-editable-label` tenía `font-size: 1rem; font-weight: 400` (sin mayúsculas ni `letter-spacing`) — un estilo nunca terminado, distinto de `.input-texto-label`/`.selector-label`/`.selector-fecha-label` (todos con `font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase`). Al usar `app-select-editable` junto a `app-input-texto` en el mismo diálogo (campo "Área" junto a "Nombre completo"/"Celular"), las etiquetas se veían con dos diseños distintos en la misma pantalla. Corregido igualando `.select-editable-label` a esas otras tres — cualquier uso nuevo de `app-select-editable` ya lo hereda solo, no hace falta tocar nada por pantalla (mismo criterio que el panel de `app-selector` de arriba).

**Bug preexistente, sin corregir de raíz — `color: var(--);` es CSS inválido y aparece en ~24 archivos**, incluyendo las 3 clases de etiqueta de arriba (`input-texto.scss`, `selector.scss`, `selector-fecha.scss`) y varios diálogos de `a-batallar/`, `configuracion/`, `ventas/ordenes-compra/`. `--` sin al menos un carácter después no es un nombre de custom property válido — el navegador descarta toda la declaración `color: var(--)` como inválida, y como `color` es una propiedad heredable, el elemento simplemente hereda el color de su ancestro más cercano en vez de aplicar ningún token a propósito. Como el bug es idéntico en todos esos archivos, hoy no se nota (todas esas etiquetas ya vienen heredando el mismo color ambiente) — pero es la razón por la que, al fijar `.nuevo-contacto-label`/`.editar-contacto-label` (`components/ventas/contacto/modal/`) con un color explícito válido (`var(--p-text-muted-color)`, un intento inicial de estas dos clases nuevas) se veían distintas al resto: se corrigió quitándoles el `color` explícito para que hereden igual que sus vecinas, en vez de "reparar" el bug ahí. **No se corrigió el bug de raíz en los ~24 archivos** (blast radius grande, fuera del alcance de esa tarea) — si se decide encarar esa limpieza, el reemplazo correcto por consistencia con el resto de la guía es `color: var(--p-text-color);` (mismo token ya usado para títulos `<h4>` de diálogo, ver sección "Diálogos" arriba), no inventar uno nuevo.

### Listas cortas desplegables (`p-popover`)

Para un botón que despliega una lista corta de opciones (no un formulario, no una tabla) — ej. elegir a cuál de varios productos de una orden ver la ficha técnica — usar `p-popover` en vez de un `p-select`/`p-menu` fuera de lugar: un botón dispara `miPopover.toggle($event)`, el contenido son botones simples dentro de un `<div>` con `min-width`/`max-width` propios, y se cierra explícito con `miPopover.hide()` en el `(click)` de cada ítem. Si el texto de cada ítem puede ser largo (ej. la descripción de un producto tal como vino de una fuente externa), truncarlo con `text-overflow: ellipsis` y poner el texto completo en un `pTooltip` del botón — no dejar que el popover se ensanche para acomodar el texto más largo (mismo problema que el de `app-selector` de arriba). Primer uso real en el proyecto: `components/ventas/pedidos/modal/nuevo-pedido/nuevo-pedido.html` (selector de "Ficha técnica" cuando la orden tiene varios productos).

### Placeholders de formularios

- El `placeholder` de un campo de formulario (`app-input-texto` u otro control de `shared/ui/`) **no muestra un dato de ejemplo** — indica la acción esperada, con el formato `Introducir <nombre del campo>` (minúscula, sin abreviar, usando el mismo nombre que la `etiqueta` del campo pero sin el asterisco de obligatorio). Ej.: `etiqueta="Razón Social*"` → `placeholder="Introducir razón social"`; `etiqueta="RUC*"` → `placeholder="Introducir RUC"`; `etiqueta="Nombre Comercial"` → `placeholder="Introducir nombre comercial"`.
- No uses valores de ejemplo como `"Ej: Ingram Micro Perú S.A.C."` o datos ficticios (`"20123456789"`, `"ventas@proveedor.com"`) como placeholder — se pueden confundir con un valor ya cargado en el campo y no comunican qué se espera ingresar. Algunos formularios de `a-batallar/` (ej. `nuevo-cg-computadoras`) todavía usan placeholders de ejemplo — es un patrón legado, no lo repliques en formularios nuevos.
- Esta regla es para campos de captura de datos (alta/edición). No aplica a `app-input-busqueda`, donde el placeholder sí puede describir qué campos cubre la búsqueda (ej. `"Razón social, RUC, email..."`).
- Ejemplo real: `components/cotizador/proveedores/modal/nuevo-proveedor/nuevo-proveedor.html` y `modal/editar-proveedor/editar-proveedor.html`.
- **Excepción — columna angosta de una fila tipo tabla, sin `etiqueta` propia visible** (ej. las columnas de `p-inputnumber`/`pInputText` de "Cantidad recibida ahora" en `registrar-recepcion.html` o de "Ítems del pedido" en `nuevo-pedido.html`, ambas ~140px de ancho fijo o una fracción angosta de un grid `Nfr`): usar solo el nombre del campo (`"Cantidad"`, `"N.° de parte (opcional)"`), **sin** el prefijo `Introducir` — es más prolijo en un espacio compacto, aunque no es la causa del bug de abajo (el placeholder no afecta el ancho del input).

**Gotcha real — el `<input>` nativo de PrimeNG no se achica en una columna angosta de flex/grid** (2026-08-22, `registrar-recepcion.html` → `nuevo-pedido.html` preventivo): fijar `width` en `.p-inputnumber` (el wrapper) o en el `pInputText` **no alcanza** dentro de una fila `display: flex` o `display: grid` con columnas angostas — el `<input>` nativo trae su propio ancho mínimo implícito del navegador (basado en el atributo `size`, ~20 caracteres, **sin relación con el largo del placeholder** — probé acortar el placeholder primero y no resolvió nada), y por defecto un ítem de flex/grid no se achica por debajo del contenido mínimo de sus hijos (`min-width: auto`). El resultado: el input ignora el ancho fijado, se desborda hacia la derecha y sale del diálogo — mismo bug de fondo que `.p-datatable-table-container { min-height: 0 }` en `styles.scss`, pero en el eje horizontal en vez del vertical. Corrección: agregar `min-width: 0` en dos niveles — en el ítem de flex/grid que contiene el campo, y en `::ng-deep .p-inputnumber-input` directamente (el wrapper `.p-inputnumber` no alcanza por sí solo). Ejemplos reales: `registrar-recepcion.scss` (`.registrar-recepcion-fila`) y `nuevo-pedido.scss` (`.nuevo-pedido-fila-item`). Si un `p-inputnumber`/`pInputText` con ancho fijo dentro de una fila angosta se ve desbordado, sospechar de esto antes que del placeholder.

### Validación de campos por tipo de dato

Principio: la validación del frontend refleja las restricciones **reales** del modelo Django (tipo de campo, `null`/`blank`, `max_length`, `unique`, rango de negocio) — no inventa reglas nuevas ni relaja las que ya impone el backend. Revisa el modelo (`bi_app/models.py` u otro módulo) antes de definir un formulario nuevo.

- **Numérico** (cantidades, precios, stock, duraciones, tramos): **nunca negativos** — usa `p-inputnumber` de PrimeNG directamente (no `app-input-texto[tipo="number"]`, que es solo un `<input type="number">` nativo sin control de rango) con `[min]="0"`. Si el campo es una cantidad entera (unidades, cantidad mínima/máxima de un tramo de precio), agrega `[step]="1"` para bloquear decimales; si es dinero (`DecimalField`), usa `mode="currency"` o `[minFractionDigits]="2" [maxFractionDigits]="2"` acorde a `decimal_places` del modelo. Excepción: campos que representan una diferencia/ajuste (variación de precio, delta de stock) sí pueden ser negativos — evalúa el significado de negocio del campo, no apliques la regla a ciegas.
- **Texto** (`CharField`): `[maxlength]` en el input debe coincidir con el `max_length` del campo Django — evita que el usuario escriba de más y recién se entere con un 400 al guardar. Obligatorio en el frontend (validado al hacer clic en guardar, ver "Validación en diálogos" abajo) si y solo si el campo Django **no** tiene `null=True, blank=True`.
- **RUC** (caso recurrente de texto en este dominio): exactamente 11 dígitos numéricos (`CharField(max_length=11, unique=True)`) — `maxlength="11"` + solo dígitos, validado en el signal antes de emitir el payload (o con `p-inputmask` con máscara `99999999999`).
- **Email**: `tipo="email"` de `app-input-texto` alcanza (activa la validación nativa `type="email"` del navegador) — no hace falta una librería de validación adicional para formularios de alta/edición simples.
- **Teléfono**: sin formato numérico único (Perú usa fijo/móvil, con o sin código de área) — solo limita `maxlength` a un valor razonable, sin máscara rígida salvo que el negocio la pida explícitamente.
- **Fecha** (`DateField`/`DateTimeField`): si el campo es una fecha de negocio que ya ocurrió (ej. fecha de una lista de precios recibida), restringe `app-selector-fecha` para que no acepte futuro (`[maxDate]` = hoy); si es una fecha de vigencia/entrega futura, restringe lo contrario (`[minDate]` = hoy). Depende del significado del campo — no hay un límite genérico único para "toda fecha".
- **Booleano** (`activo`, toggles): sin validación adicional — un `p-toggleswitch`/checkbox ya solo tiene dos estados válidos.
- **Selects / choices** (`TextChoices` de Django, ej. `EstadoLista`, `DisponibilidadStock`): las opciones del `app-selector` deben ser exactamente las del `choices` del modelo (mismo `value`) — no inventar opciones en el frontend que no existan en el backend.

```html
<!-- Campo numérico de cantidad — nunca negativo, sin decimales -->
<p-inputnumber [(ngModel)]="unidadesDisponibles" [min]="0" [step]="1" mode="decimal" />
```

### Tablas: cabecera y paginador fijos, scroll solo en las filas

Decidido en `components/ventas/envio/envio.html` (piloto) y a aplicar en toda tabla nueva o al tocar una existente por otra razón (ver "Principio de no sorpresa").

- El contenedor de la `p-table` lleva la clase global `.tabla-scroll` (definida en `styles.scss`) — ya resuelve que el scroll vertical quede acotado a las filas, sin mover el header ni el paginador ni la página completa: `.p-datatable` con `max-height: 65vh` y `display:flex; flex-direction:column`, `.p-datatable-table-container` con `flex:1 1 auto; min-height:0` (ahí cae el overflow-y), y `.p-paginator` con `flex-shrink:0` para que quede siempre fuera del área que scrollea.
- Para que la cabecera de columnas (`thead`) quede fija arriba mientras las filas scrollean debajo, la `p-table` necesita `[scrollable]="true"` — sin ese input, PrimeNG no aplica `position: sticky` al `thead` y termina scrolleando junto con las filas dentro del mismo contenedor `.tabla-scroll`. No hace falta declarar `scrollHeight`: el `max-height` ya lo pone `.tabla-scroll` vía CSS.
- No uses `position: sticky` a mano sobre el `thead` ni reimplementes el contenedor de scroll por tabla — `.tabla-scroll` + `[scrollable]="true"` es la combinación completa; alcanza con envolver la `p-table` en un `<div class="tabla-scroll">` (ya el patrón estándar del proyecto) y agregar el input.
- Ejemplo real: `components/ventas/envio/envio.html`.

**Gotcha — `display: flex` puesto directo en un `<td>` rompe la igualación de alto de fila** (2026-08-31, `mi_tienda/inventario/inventario.html`, columna "Auditoría"): si la clase con `display: flex; flex-direction: column` se aplica directo al `<td>` (en vez de a un `<div>` interno), esa celda deja de estirarse a la misma altura que sus hermanas en la misma fila — medido con `getBoundingClientRect()`, la celda "Auditoría" quedaba en 49px mientras el resto de la fila medía 202px. El síntoma visual es que la línea divisoria entre filas se ve "cortada"/desalineada justo en esa columna (el borde-bottom de esa celda aparece muy por encima del de las demás). La celda de "Stock" del mismo archivo, que envuelve su `display:flex` en un `<div>` interno (`<td><div class="inventario-stock-celda">...</div></td>`) en vez de aplicarlo al `<td>`, nunca tuvo el problema. **Regla**: cualquier celda de una `p-table`/`<table>` plana que necesite layout flex (para apilar/alinear su contenido) lo aplica siempre a un `<div>` (u otro elemento) DENTRO del `<td>`, nunca a una clase puesta directo en el `<td>`.

**Gotcha — con muchas columnas, las angostas (acciones, auditoría, badges cortos) se comprimen si no llevan ancho sugerido** (2026-08-31, mismo archivo, al pasar de 6 a 10 columnas): sin un `width` en el `<th>`, el layout automático de la tabla reparte el ancho según el contenido de TODAS las columnas — una columna con texto largo en otra parte de la fila puede dejar a "Acciones" (varios íconos) o "Auditoría" (dos líneas de texto) con menos espacio del que necesitan, comprimiéndolas o desbordándolas. Igual que ya hacían `ordenes-compra`/`pedidos` para su columna de acciones, la columna `acciones` lleva la clase `tabla-acciones-th` en el `<th>` y `tabla-acciones` en el `<td>` (ambas con `white-space: nowrap` local al componente) y columnas de texto corto/predecible (badges de estado, fecha+usuario tipo "Auditoría") llevan un `width` en píxeles explícito en su `<th>` (ej. `style="width: 190px"`) — no hace falta tocarlo en columnas de texto libre (nombre, descripción), que absorben el resto del ancho disponible.

```html
<div class="tabla-scroll">
  <p-table [value]="filas()" [paginator]="true" [rows]="10" [scrollable]="true" [tableStyle]="{ 'min-width': '1080px' }">
    ...
  </p-table>
</div>
```

### Tablas planas dentro de un diálogo (no `p-table`): heredar el estilo real de `p-table`, no inventar uno propio

Cuando una pantalla de detalle (dentro de un `p-dialog`) necesita una tabla simple de solo lectura sin paginación/orden/scroll propio (ej. "Bitácora", "Recepciones", "Datos de la orden de compra" en `detalle-pedido.html`) — un `p-table` completo sería exceso para eso —, se usa un `<table>` HTML plano con una clase propia del componente. Su `<th>` **debe heredar el estilo real del encabezado de `p-table`**, no inventar uno nuevo.

Corregido (2026-08-24) en `detalle-pedido.scss`: el `<th>` tenía `text-transform: uppercase`, `letter-spacing` y `font-size` reducido — un estilo inventado que no corresponde a ningún componente real de la app. El estilo REAL del encabezado de `p-table` (tema Aura, token `datatable.columnTitle`) es `font-weight: 600`, el **mismo** tamaño de fuente que el texto normal de la tabla, y el color de texto completo (`var(--p-text-color)`, no `var(--p-text-muted-color)`) — sin mayúsculas ni `letter-spacing`. Se puede confirmar el valor exacto de cualquier token de un componente PrimeNG cargando `@primeuix/themes/dist/aura/<componente>/index.mjs` (export default) en vez de adivinarlo.

- **No confundir con la etiqueta de un filtro o campo de formulario** (`.busqueda-global-label`, la `etiqueta` de `app-selector`, `.formulario-documento-label`, etc.) — esas SÍ son legítimamente mayúsculas + chicas + `letter-spacing` (convención establecida para etiquetas de campo/filtro, ver "Búsqueda global" en `pedidos.html`). Es una convención distinta para un elemento distinto (una etiqueta de campo, no el encabezado de una tabla) — aplicar el estilo de una a la otra es mezclar dos convenciones que en la app real nunca se mezclan.
- **El `<td>` va en peso normal, sin `<strong>` ni `font-weight` propio** — mismo error de fondo que el del `<th>` de arriba (inventar énfasis que ningún `p-table` real de la app usa: las celdas de un `p-table` son texto normal, el único elemento con `font-weight: 600` es el encabezado). Corregido (2026-08-25) en `components/ventas/ensamblaje/modal/enviar-a-ensamblaje/enviar-a-ensamblaje.scss`, que había puesto `td { font-weight: 700; }` al migrar una tarjeta con borde (`<strong>` + `<span>`, ver el gotcha de abajo) a esta tabla plana, arrastrando el énfasis visual de la tarjeta original sin que corresponda al patrón de tabla. Ejemplo real correcto (sin negrita en `<td>`): `detalle-pedido.scss`.
- **Gotcha — migrar una tarjeta con borde (`<div>`/`<span>`/`<strong>`) a una tabla plana arrastra estilos que ya no aplican**: al reemplazar un resumen tipo tarjeta (bordeado, con `<span>` mudo como etiqueta y `<strong>` como valor) por la tabla de esta sección, no copiar el `font-weight` que tenía el `<strong>` — la etiqueta (antes `<span>`) pasa a ser el `<th>` con su propio peso (600) y el valor (antes `<strong>`) pasa a ser un `<td>` en peso normal, no una negrita heredada de la tarjeta anterior. Corregido en el mismo `enviar-a-ensamblaje` (2026-08-25) al convertir su tarjeta "Orden de compra / Entidad / Empresa adjudicada" (con borde + `box-shadow`) en tabla informativa.
- **Regla general, no solo para tablas**: antes de escribir CSS nuevo para un elemento (encabezado, título, etiqueta, botón), primero revisar cómo se ve el elemento equivalente real ya construido en la app (el `p-table` de verdad, la etiqueta de un filtro ya existente) y copiar esos valores — no inventar `font-size`/`letter-spacing`/`text-transform`/`font-weight` a criterio propio. Si no hay un equivalente real ya construido para copiar, preguntar antes de inventar uno.
- **Cuando solo una PARTE de una tarjeta es informativa** (ej. la cabecera de un producto dentro de una lista con controles interactivos debajo — checkbox de selección, cantidad editable, requisitos agregables), convertir a tabla únicamente esa parte informativa (nombre/marca/código/cantidad, en este ejemplo), dejando los controles interactivos (checkbox, `p-inputnumber`, botones "Agregar"/"Quitar") como ya estaban, fuera de la tabla. No forzar los controles interactivos dentro de celdas `<td>` solo por consistencia — esta sección describe cómo mostrar información de solo lectura, no cómo maquetar un formulario. Ejemplo real: `enviar-a-ensamblaje.html` (2026-08-25) — la cabecera de cada producto (nombre, marca, código, cantidad OC) pasó de `<label><strong>/<span></label>` a `.producto-resumen-tabla`, mientras que el checkbox de selección, "Unidades físicas", "Requiere intervención" y la lista de requisitos siguen igual que antes, debajo de la tabla.

### Vista fija: ninguna tabla debe scrollear la página completa (con o sin tabs)

Regla estricta (no solo recomendación), general para **cualquier pantalla con una `p-table`, tenga o no tabs**: el header/breadcrumb del módulo, el buscador, los filtros y la cabecera de la tabla **siempre** deben quedar visibles en pantalla, igual que el paginador — nunca debe aparecer un scroll de página completa que los saque de vista. La única zona que scrollea es la lista de filas. Aplica igual de estricto a una pantalla simple (un buscador + una tabla, sin tabs) que a una con `p-tabs`/`p-tablist`/`p-tabpanels`/`p-tabpanel` — el problema y la solución son los mismos, con un eslabón extra en la cadena cuando hay tabs de por medio.

**Este patrón está automatizado**: en vez de aplicar los pasos de abajo a mano, invocar `/mejorar-vista-fija` (skill `.agents/skills/mejorar-vista-fija/`) sobre el componente — hace exactamente esto, incluida la detección de si la pantalla tiene tabs o no.

Decidido y resuelto primero en `components/ventas/ordenes-compra/ordenes-compra.html` (tab "Control de Órdenes de Compra", que tiene buscador + 5 filtros encima de la tabla — más alto que lo que `.tabla-scroll` con su `max-height: 65vh` fijo podía absorber sin desbordar `.shell-content`).

**Por qué el patrón simple (`.tabla-scroll` + `[scrollable]="true"` de la sección anterior) no alcanza cuando el header de la pantalla crece**: `max-height: 65vh` es una fracción fija del viewport, pensada para pantallas con poco contenido arriba de la tabla. En cuanto el buscador + los filtros (con o sin tabs encima) ocupan una porción variable y a veces grande del alto disponible, 65vh puede pasarse del espacio que realmente queda, y es `.shell-content` (el contenedor de página, `shell.scss`, que tiene `overflow-y: auto`) quien termina scrolleando la PÁGINA entera para mostrar el resto, tapando filtros y paginador.

**La solución real es una cadena de `flex: 1` + `min-height: 0` de arriba a abajo, sin usar `height: 100%` (porcentaje) en ningún eslabón intermedio** — un porcentaje necesita que TODOS los antepasados tengan una altura ya resuelta como "definida", y basta que uno solo no la tenga para que la cadena se corte en silencio (síntoma: filtros/paginador se ven, pero la tabla no crece para llenar el resto y queda un hueco en blanco). `flex: 1` no tiene ese problema: cada hijo  simplemente crece para llenar lo que sobra de su padre.

1. **El host del propio componente** (`:host` en su `.scss`) — el elemento real que Angular inserta en el DOM es el selector del componente (`<app-mi-pagina>`), no el `<div>` raíz de la plantilla. Sin darle altura al host mismo (`display: inline` por defecto, sin alto propio), el `flex`/`height` del div raíz de abajo no tiene contra qué resolverse:
   ```scss
   :host {
     display: flex;
     flex-direction: column;
     height: 100%; // el único porcentaje de toda la cadena — ver por qué abajo
     min-height: 0;
   }
   ```
   Este es el ÚNICO punto de la cadena donde un porcentaje es inevitable (el padre real, `.shell-content`, no es un contenedor flex — es un `<main>` normal con `overflow-y: auto`), pero es seguro: `.shell-content` sí tiene una altura definida de sobra (es `flex: 1; min-height: 0` dentro de `.shell-body`, que tiene `height: 100vh` — ver `shared/layout/shell/shell.scss`).
2. **Sin tabs** (caso general, el más común): el `<div>` raíz de la plantilla va `flex: 1; display: flex; flex-direction: column; min-height: 0;` igual que `:host` — dentro de él, el buscador/filtros con `flex-shrink: 0` (alto natural) y `.tabla-scroll` con `flex: 1; min-height: 0` (se queda con TODO el resto). Saltar directo al paso 5.
3. **Con tabs**: el `<div>` raíz, `p-tabs`, `p-tabpanels` y el `p-tabpanel` que necesita esta altura (los otros tabs de la misma pantalla NO tienen por qué llevar esto — ver más abajo) van todos con `flex: 1; display: flex; flex-direction: column; min-height: 0;`. `p-tabs`, `p-tablist`, `p-tabpanels` y `p-tabpanel` son los propios elementos host de esos componentes de PrimeNG (`host: { class: cx('root') }` en su código fuente) — no hace falta `::ng-deep` para darles estas reglas, solo para lo que ellos rendericen POR DENTRO.
4. **Solo el panel del tab que lo necesita** lleva una clase propia (ej. `.mi-pagina-panel-principal`) combinada con `.p-tabpanel-active` (la clase que PrimeNG agrega al panel activo) — los demás tabs de la misma pantalla NO deben tocarse si no lo pidió el usuario: sin esta clase, su tamaño sigue siendo el de su contenido de siempre, y si no entra en el alto disponible, `.shell-content` lo sigue scrolleando como hacía antes (comportamiento sin cambios). No agregar `overflow: hidden` a `p-tabpanels`: eso SÍ afectaría a todos los tabs por igual, recortando el contenido de los que no se adaptaron a este esquema en vez de dejarlo desbordar hacia el scroll de página de siempre. Dentro del panel: mismo patrón que el paso 2 (buscador/filtros `flex-shrink: 0` + `.tabla-scroll` `flex: 1; min-height: 0`).
5. **En el propio `<p-table>`, agregar `scrollHeight="flex"`** (string plano, sin corchetes) además de `[scrollable]="true"`. Esto NO es opcional para este caso: es el mecanismo oficial de PrimeNG (`@primeuix/styles/datatable`) para que `.p-datatable`/`.p-datatable-table-container` lleven `display:flex; height:100%` ya resuelto por la librería — reimplementar esas mismas reglas a mano vía `::ng-deep` (duplicando lo que ya trae `scrollHeight="flex"`) es frágil y fue exactamente lo que fallaba en la primera vuelta de este arreglo. Con `scrollHeight="flex"`, lo único que sigue haciendo falta localmente es anular el `max-height: 65vh` de `.tabla-scroll` (misma especificidad que la regla global — hay que igualarla combinando las dos clases del wrapper, ej. `.tabla-scroll.mi-pagina-tabla ::ng-deep .p-datatable { max-height: none; }`).

Ejemplo real completo (caso con tabs): `components/ventas/ordenes-compra/ordenes-compra.html` + `ordenes-compra.scss` (buscar `:host`, `.ordenes-compra-panel-principal`, `.ordenes-compra-tabla`).

**Gotcha — `[tableStyle]` con `min-width` fijo dispara scroll horizontal aunque las columnas quepan** (2026-08-24, `pedidos.html`): `pedidos.html` tenía `[tableStyle]="{ 'min-width': '1350px' }"` (siguiendo al pie de la letra el ejemplo de `min-width: 1080px` de la sección anterior) y mostraba una barra de scroll horizontal en el viewport típico de la app, mientras que `ordenes-compra.html` — con una cantidad de columnas comparable — no la mostraba. La diferencia real entre ambos no estaba en `.tabla-scroll`/`[scrollable]`/`scrollHeight="flex"` (idénticos en los dos), sino en `[tableStyle]`: `ordenes-compra` usa `{ width: '100%' }`, dejando que PrimeNG reparta el ancho disponible entre las columnas sin forzar un mínimo — un `min-width` fijo, en cambio, obliga a la tabla a ser al menos esa cifra sin importar si el contenido real la necesita, y en cuanto el contenedor (con sidebar) es más angosto que eso aparece el scroll. Corregido: `pedidos.html` pasó a `[tableStyle]="{ width: '100%' }" [rowHover]="true"`. Regla: usar `{ width: '100%' }` por defecto (patrón confirmado sin scroll fantasma en `ordenes-compra`); reservar `min-width` en píxeles solo si se confirma que, incluso con `width: 100%`, las columnas quedan demasiado apretadas para leerse — y en ese caso probar primero con un valor bajo antes de copiar 1080/1350 a ciegas.

**Gotcha — diálogos al final del contenedor con `gap` le roban altura real al panel con `flex: 1`** (2026-08-24, `catalogos/computadoras.html` y los 4 módulos de `a-batallar/cg-*`): en toda pantalla de este patrón, los componentes de diálogo (`p-dialog` de "Ver detalle", "Nuevo", "Editar", `p-confirmdialog`, etc.) van como hermanos al final del `<div>` raíz o de `.cg-mi-pagina` — DESPUÉS de `</p-tabs>` — dentro del mismo contenedor `display: flex; gap: ...`. Aunque cada uno de esos diálogos mida 0px de alto mientras está cerrado (no renderiza nada hasta que `[(visible)]="true"`), `gap` se aplica entre CADA PAR de flex items sin importar su tamaño — con 3 diálogos al final eso son 3 gaps de más, y le restan esa altura exacta a `p-tabs` (el único hermano con `flex: 1`), dejando la tabla más baja de lo que le corresponde y el paginador más arriba de lo debido. El síntoma es sutil porque no hay "hueco en blanco" visible (el error clásico de este patrón) — la tabla simplemente mide menos de lo que debería, y solo se nota comparando con DevTools (`getBoundingClientRect()` de `p-tabs` vs. la suma de sus hijos visibles + gaps esperados) o notando que aparecen menos filas de las que el alto de pantalla debería permitir. **Fix**: `position: absolute` en los componentes de diálogo (selector por tag, ej. `app-ver-detalle-ficha-ceam, app-visor-documento, app-subir-excel-fichas { position: absolute; }`) — los saca del flujo flex por completo (dejan de contar para `gap`) sin afectar el propio `p-dialog`/`p-confirmdialog` que renderizan, porque PrimeNG los posiciona con `position: fixed` (o los porta a `document.body`) cuando están abiertos, independiente de la posición de este host. Verificar siempre con DevTools (`getBoundingClientRect()` antes/después) en vez de asumir que el fix funcionó — en la misma sesión, probar primero con `display: contents` en esos mismos elementos NO recuperó el espacio (empíricamente no elimina el gap en este caso), así que `position: absolute` es la técnica confirmada, no la primera que se te ocurra.

### Botones: siempre con borde visible, salvo el ícono de acción de una fila de tabla

Todo `p-button` con `label` (no solo ícono) debe verse como un botón sólido (relleno + sombra con `[raised]="true"`), nunca como un link. **No uses `[text]="true"` a secas** en un botón con texto — sin borde ni fondo se lee como un enlace y se pierde entre varios botones juntos (pie de diálogo, aviso con acción). El estilo por defecto es el sólido según `severity` (`info` para la acción primaria, `secondary` para "Cancelar"/"Limpiar"). **Evitá también `[outlined]="true"`** — la app usa botones secundarios sólidos, no con solo borde (ver "Botón Cancelar del footer" en "Diálogos"). Si encontrás `[outlined]="true"` en código viejo, es una desviación a corregir cuando toques ese archivo.

- **Única excepción**: el ícono de acción por fila de una `p-table` (ver "Tablas: íconos de acciones" abajo) — ese SÍ usa `[text]="true" [plain]="true"` sin borde, a propósito, porque es un ícono suelto dentro de una celda angosta, no un botón de acción independiente.
- Si un botón con `label` usa `[text]="true"` o `[outlined]="true"` en código existente y no es el caso de arriba, es una desviación — corregirla al estilo sólido (`severity` + `[raised]="true"`, sin `[outlined]`) cuando se toque ese archivo por otra razón (no hace falta una pasada masiva solo por esto, ver "Principio de no sorpresa").

**`[raised]="true"` (sombra elevada) en todo botón de acción visible fuera de una celda de tabla** (decidido 2026-08-31, a pedido explícito del usuario tras ver el botón "Registrar Ajuste" del kardex de Inventario sin sombra junto al showcase de PrimeNG): botones de la barra de filtros/toolbar (`app-boton [elevado]="true"`, ya el patrón de "Limpiar"/"+Nuevo" en `ordenes-compra`/`pedidos`), el botón de acción principal de una pantalla (ej. "Abrir Caja"/"Cerrar Caja" en `control-caja.html`), y el pie de un diálogo de acción (Cancelar + el botón primario) llevan `[raised]="true"`. Aplicado (2026-08-31) a `mi_tienda/inventario` ("Nuevo Producto", "+ Ajustar stock", pie de `ajustar-stock`) y a `mi_tienda/control-caja` (Abrir/Cerrar Caja, "Registrar venta"/"Registrar gasto", y el pie de `abrir-caja`/`cerrar-caja`/`registrar-gasto`/`registrar-venta`). **Diálogos de otros módulos que no se tocaron en esa fecha siguen sin `[raised]`** (patrón previo, sin sombra) — es una desviación pendiente de la nueva regla, no un error: corregir cuando se toque ese diálogo por otra razón, igual que el resto de "Principio de no sorpresa". No confundir con `[outlined]`/`severity` (arriba) — son ejes independientes, un botón puede llevar ambos.

### Tarjetas con color de identidad: borde completo del color, no barra superior

Decidido 2026-10-06 (pedido explícito del usuario sobre el modal de trazabilidad de Penalidad y las tarjetas de sección de "Ganadas por ejecutar"). Cuando una tarjeta lleva un color propio que la identifica (un tramo del proceso, una sección, un estado), **ese color va en el borde completo de la tarjeta** (con el borde superior más grueso), no solo en una barra superior (`border-top` grueso o `::before` de 4px) con el resto del marco en gris.

- Borde de `2px solid` en el color de identidad, ya en reposo, con **el borde superior más grueso** (`border-top-width: 5px`) para que el encabezado se lea como la franja de color de la tarjeta, y el inferior más delgado (`border-bottom-width: 1px`). Hover y activo no cambian el color del borde; se marcan con sombra, anillo (`box-shadow` con spread) o fondo, como ya hacían.
- El color sale de una custom property por modificador (ej. `--tarjeta-color` en `.tab-tarjeta-*` de `ordenes-compra.scss`, `--c` en `.tramo-*` del modal `detalle-trazabilidad`), nunca repetido a mano en cada regla. En modo oscuro se redefine solo la variable con un tono más claro.
- Una tarjeta que necesita destacarse sobre las demás (ej. "Mayor demora de la orden") cambia el color de su borde (rojo de peligro), no agrega un `outline` encima del borde de color.
- Una tarjeta pendiente o futura conserva el color con `border-style: dashed`.
- No aplica a los contenedores de sección de un diálogo: esos van sin marco, separados solo por espacio y con el subtítulo de sección (mayúsculas, negrita, color de texto normal).
- Aplicado en: tarjetas de sección de `components/ventas/ordenes-compra/ordenes-compra.html` (Control de Órdenes de Compra, Consulta Perú Compras, Comparativa histórica, Penalidad 10%) y tarjetas de tramo y de despacho de `seguimiento-demoras/modal/detalle-trazabilidad/`. Otras tarjetas con barra superior en código existente son una desviación a corregir cuando se toque ese archivo (ver "Principio de no sorpresa").

### Tablas: íconos de acciones

- Las acciones por fila de una `p-table` (ver, editar, eliminar, etc.) se implementan con `p-button` directamente — no con un wrapper de `shared/ui/` — usando `[text]="true" [plain]="true"`, `pTooltip` + `tooltipPosition="top"`, y `[attr.aria-label]` describiendo la acción y la fila afectada (ej. `[attr.aria-label]="'Editar ' + fila.razonSocial"`).
- Sin `severity`: el ícono queda en gris neutro (`plain`) incluso para acciones destructivas como eliminar — la barrera de seguridad es la confirmación (`p-confirmdialog` + `ConfirmationService`) antes de ejecutar, no el color del ícono.
- Ejemplo real: columna `acciones` de la tabla "Detalle de Productos" en `components/a-batallar/cg-computadoras/cg-computadoras.html` (o cualquier otro módulo de `a-batallar/`).
- **El ícono más a la derecha de la columna `acciones` usa `tooltipPosition="left"`, no `"top"`**: al estar pegado al borde derecho de la tabla/pantalla, un tooltip `"top"` (centrado sobre el ícono) se desborda hacia la derecha y queda cortado o pegado al borde. Corregido (2026-08-24) en `pedidos.html` (ícono "Registrar recepción", último de la fila). Los íconos que NO son el último de la fila siguen con `"top"` sin problema.

### Tablas: fila recién abierta al abrir un diálogo

Decidido 2026-09-10 (piloto aprobado por el usuario en `components/ventas/ordenes-compra/ordenes-compra.{ts,html}`, tab "Control de Órdenes de Compra"): al abrir un diálogo desde una fila de una `p-table` (Ver detalles, Editar, Documentos, Eliminar, etc.), esa fila queda con el fondo pintado hasta que se abre otra — así, al cerrar el diálogo, el usuario la reconoce de un vistazo en vez de volver a buscarla entre decenas de filas parecidas.

- **Estilo**: clase global `.fila-recien-abierta` (`styles.scss`, sección "7. Fila recién abierta") — mismos tokens que PrimeNG usa para una fila seleccionada (`--p-datatable-row-selected-background`/`-color` y `--p-datatable-body-cell-selected-border-color`, azul `sky` del `CompusurPreset`). No se redefine por pantalla ni se inventa otro color.
- **Por pantalla**: un signal dedicado con el id de la última fila abierta (ej. `idOrdenRecienAbierta = signal<number | null>(null)`), seteado en la primera línea de cada handler que abre un diálogo para una fila — revisando todas las celdas, no solo "Acciones" —, y `[class.fila-recien-abierta]="fila.id === idOrdenRecienAbierta()"` en el `<tr>` del body.
- Siempre por **id**, nunca por referencia de objeto (el listado se reemplaza al guardar y la marca se perdería). Sin usar la selección de PrimeNG (`selectionMode`, `.p-datatable-row-selected`) — la marca es solo visual. No se borra al cerrar el diálogo.
- **Hover** (agregado 2026-09-11): la tabla lleva además `[rowHover]="true"` — sin CSS propio, PrimeNG ya resuelve un gris neutro de hover (`content.hover.background`, distinto del `sky` de la marca) sobre cualquier `<tr>` de `.p-datatable-tbody`. Mientras el mouse está encima de la fila marcada, el gris del hover tapa el celeste a propósito (más específico); al salir, el celeste vuelve solo.
- **Este patrón está automatizado**: invocar `/resaltar-fila-abierta` (skill `.agents/skills/resaltar-fila-abierta/`) sobre el componente. Hoy se aplica pantalla por pantalla, a pedido — no se decidió todavía si es obligatorio en toda tabla nueva ni una pasada masiva sobre las existentes.

### Notificaciones (`p-toast`)

- Hay un único `<app-toast />` (wrapper de `shared/ui/toast/`) montado en la raíz de la app (`app.html`), no en cada feature — así funciona en cualquier pantalla, incluida `/login`. No agregues otro `<app-toast />` ni un `<p-toast />` suelto dentro de un componente de feature.
- `MessageService` (de `primeng/api`) está provisto una sola vez a nivel app, en `app.config.ts` — cualquier componente o servicio lo inyecta directamente (`private messageService = inject(MessageService);`) y llama `.add({ severity, summary, detail })`. No declares `providers: [MessageService]` en un componente de feature: crearía una instancia aislada que nunca llega al `<app-toast />` global.
- Severidades disponibles (las mismas que PrimeNG): `success`, `info`, `warn`, `error`, `secondary`, `contrast` — usa la que corresponda semánticamente, no siempre `success`/`error`.

```typescript
private messageService = inject(MessageService);

guardarProveedor(): void {
  // ...
  this.messageService.add({
    severity: 'success',
    summary: 'Proveedor guardado',
    detail: 'Se creó el proveedor correctamente.',
  });
}
```

## 4. Manejo de estado — Signals

Ya que se descartó RxJS como store, la regla es:

- **Estado de UI y de feature vive en signals**, no en `BehaviorSubject`.
- **RxJS se usa únicamente para streams HTTP** (el `HttpClient` sigue devolviendo `Observable`). Conviértelo a signal en el borde del servicio con `toSignal()`, no lo propagues como Observable hacia los componentes.
- Patrón estándar de servicio de feature:

```typescript
@Injectable({ providedIn: 'root' })
export class LicitacionesService {
  private http = inject(HttpClient);

  private _licitaciones = signal<Licitacion[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  licitaciones = this._licitaciones.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  cargar(filtros: LicitacionFiltro): void {
    this._loading.set(true);
    this._error.set(null);
    this.http.get<Licitacion[]>('/api/licitaciones', { params: { ...filtros } })
      .subscribe({
        next: (data) => this._licitaciones.set(data),
        error: (err) => this._error.set(this.mensajeError(err)),
      })
      .add(() => this._loading.set(false));
  }
}
```

- Usa `computed()` para derivados (totales, filtrados, agregados para gráficos ECharts) en vez de recalcular en el template o duplicar estado.
- Usa `effect()` solo para efectos secundarios reales (logging, sincronizar con algo fuera de Angular). No lo uses como sustituto de `computed()`.
- **Excepción para métodos de comando (crear/actualizar/eliminar)**: pueden devolver `Observable<T>` en vez de `void`, para que el componente que llama sepa cuándo la operación realmente terminó (ej. mostrar un toast de éxito solo tras la confirmación del backend, no de forma optimista). Esto no contradice la regla de arriba: el **estado de lista** (`proveedores`, `cargando`, `error`) sigue viviendo en signals dentro del servicio — el `Observable` devuelto es solo la notificación de finalización de una acción puntual, actualiza esos signals internamente con `tap()`/`catchError()` antes de devolverlo. Ejemplo real: `components/cotizador/proveedores/proveedores.service.ts`.

## 5. Comunicación con el backend (Django REST Framework)

- Las interfaces en `models/` deben reflejar 1:1 los serializers de Django REST Framework (mismo nombre de campos, mismo casing — DRF responde en `snake_case` por defecto; decide explícitamente si se transforma a `camelCase` en un interceptor o se mantiene `snake_case` en el frontend; **no mezclar ambos criterios en el mismo proyecto**).
- Un interceptor HTTP central (`core/interceptors/error.interceptor.ts`, funcional — `HttpInterceptorFn`, registrado en `app.config.ts` vía `provideHttpClient(withInterceptors([errorInterceptor]))`) maneja errores y dispara `p-toast` — los servicios de feature no deben mostrar toasts de error directamente, solo setean su signal `_error` (los toasts de **éxito** de una acción sí puede mostrarlos el componente, ver nota de "Manejo de estado" arriba — son mensaje de negocio, no manejo genérico de errores HTTP).
- Todas las URLs de API pasan por un `environment.ts` / `environment.prod.ts`, nunca hardcodeadas en un servicio.

## 6. Gráficos (ECharts) — análisis horizontal y vertical

Para las visualizaciones comparativas (análisis horizontal y vertical de precios entre entidades/tiempo):

- Crear un wrapper `shared/ui/echarts-wrapper.component.ts` que reciba `option: EChartsOption` por `input()` — no incrustar configuración de ECharts directamente en los componentes de feature.
- Los datos para el gráfico se preparan con un `computed()` en el servicio o componente smart, nunca dentro del wrapper.

## 7. Checklist antes de dar por terminado un componente

- [ ] ¿Es standalone y `OnPush`?
- [ ] ¿Usa PrimeNG por defecto? Si usa Material, ¿hay comentario justificando por qué?
- [ ] ¿El estado usa signals, no `BehaviorSubject`?
- [ ] ¿Los nombres de dominio están en español y sin abreviar?
- [ ] ¿Está en la carpeta de feature correcta según el módulo de negocio?
- [ ] ¿Los errores de HTTP se manejan vía interceptor + signal `_error`, no con lógica ad-hoc?

## 8. Responsividad — la app también se usa desde el celular

Breakpoint único del proyecto: **767px** — por debajo es "móvil" (`@media (max-width: 767px)`), en 768px o más es "escritorio". Coincide con el `@media (min-width: 768px)` que ya usa la grilla global `.fila`/`.col-N` en `styles.scss` (mobile-first) — no inventar un segundo breakpoint para esto; el proyecto ya tenía valores dispersos (480/560/620/640/700/720/780/820/860/900/1400px) en distintos componentes antes de esta convención, y no se retocan salvo que se toque ese componente por otra razón (ver "Principio de no sorpresa").

- **El shell (`shared/layout/{shell,sidebar,navbar}`) es el punto de partida obligatorio.** Sin que sidebar/navbar funcionen en <768px, ninguna pantalla es usable en un celular real por más que se ajuste su propio contenido — hoy el sidebar mide 240px/64px fijo, sin drawer ni overlay. Pasa a un drawer oculto (`transform: translateX(-100%)`) que se abre con un botón hamburguesa en el navbar, con overlay para cerrarlo.
- **Todo `p-dialog`/`p-confirmdialog` respeta el viewport en móvil por una regla global**, no por componente: `styles.scss` tiene `@media (max-width: 767px) { .p-dialog:not(.p-dialog-maximized) { width: 88vw; max-width: 88vw; } }` — el `max-width` es imprescindible porque el `[style]="{ width: '640px' }"` de cada diálogo es inline y le gana a `width`, (agregada 2026-09-10, mismo criterio que el fix global de `.p-dialog-content { overflow-x: hidden }` de la sección de Diálogos arriba — el valor arrancó en 92vw y se bajó a 88vw el mismo día porque 92vw se sentía pegado al borde de la pantalla) — un diálogo nuevo no necesita ningún ajuste de ancho para móvil por su cuenta. El input oficial de PrimeNG para esto (`[breakpoints]`) funciona en un `<p-dialog>` de template, pero **no** en un `<p-confirmdialog />` abierto vía `ConfirmationService.confirm()` — no usarlo ahí, la regla global ya lo cubre.
- **Regla por pantalla**: preservar exactamente el layout de escritorio (nada de esto se toca en ≥768px) y agregar solo los overrides de <768px que hagan falta — normalmente: la barra de filtros/acciones pasa de fila a columna, las grillas de formulario (`*-grid-2`/`*-grid-3`, ver §3 "Grillas de formulario en diálogos") colapsan a una sola columna, y las tablas anchas permiten scroll horizontal dentro de `.tabla-scroll` en vez de comprimir u ocultar columnas.
- **Este patrón está automatizado**: en vez de aplicar los pasos a mano, invocar `/responsividad` (skill `.agents/skills/responsividad/`) sobre el componente — mismo criterio que `/mejorar-vista-fija` para la vista fija de tablas, incluida la detección de si el shell ya tiene el modo drawer aplicado.

## Principio de no sorpresa

Si encuentras código existente en el proyecto que no sigue esta guía (ej. usa `@Input()` clásico o `BehaviorSubject`), no lo reescribas de golpe "porque la skill lo dice". Señálalo, pregunta si se migra ahora o se deja para después, y sigue el patrón ya existente en ese archivo mientras tanto — consistencia local por encima de la regla, hasta que el equipo decida migrar.
