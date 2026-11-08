---
name: responsividad
description: Agrega soporte móvil para pantallas menores de 768 px sin alterar el layout de escritorio. Se invoca manualmente sobre una pantalla Angular y requiere validación visual del usuario.
---

# Responsividad — móvil sin tocar escritorio

Automatiza la sección "Responsividad" (§8) de `.agents/skills/frontend-standards/SKILL.md` — esa sección es la fuente de verdad del breakpoint y del *por qué* del patrón; esta skill es el *cómo* aplicarlo sin reinventar la cadena cada vez, igual que `/mejorar-vista-fija` lo es para la vista fija de tablas.

## Regla no negociable: el escritorio no cambia

Todo lo que ya se ve en ≥768px queda **pixel-idéntico**. Cada cambio de esta skill vive dentro de `@media (max-width: 767px) { ... }` (o una clase que solo se activa en ese rango) — nunca se edita una regla existente sin envolverla en el media query, y nunca se usa `min-width` para el caso móvil (eso invertiría a qué lado del breakpoint aplica el cambio).

Breakpoint único del proyecto: **767px** (`@media (max-width: 767px)` = móvil). Coincide con el `@media (min-width: 768px)` que ya usa la grilla global `.fila`/`.col-N` en `styles.scss` — no inventar un segundo valor.

## Paso 0 — Identificar el objetivo y el estado del shell

- Si el usuario nombró un componente, usar ese. Si no, usar el archivo abierto en el IDE o el mencionado más recientemente en la conversación. Si hay ambigüedad real, preguntar antes de tocar nada.
- Antes de tocar la pantalla objetivo, comprobar si el shell ya tiene el modo drawer aplicado: buscar en `frontend/src/app/shared/layout/sidebar/sidebar.scss` un `@media (max-width: 767px)` con `transform: translateX(...)`.
  - Si **no existe todavía**, aplicar primero el Paso 1 (shell) — es prerequisito de cualquier pantalla y se hace una sola vez en todo el proyecto, no por cada pantalla que se toque después.
  - Si **ya existe**, saltar directo al Paso 2 con la pantalla pedida por el usuario.

## Paso 1 — Shell en modo drawer (una sola vez por proyecto)

Archivos: `shared/layout/shell/{shell.ts,shell.html,shell.scss}`, `shared/layout/sidebar/{sidebar.ts,sidebar.html,sidebar.scss}`, `shared/layout/navbar/{navbar.ts,navbar.html,navbar.scss}`. Releer los seis antes de tocar nada — no asumir el estado por esta descripción, que puede quedar desactualizada.

**Estado de referencia (confirmar releyendo, no asumir):** `Shell` ya tiene un signal `collapsed` + `toggleCollapse()` para el riel angosto/expandido de escritorio (64px/240px) — el drawer de móvil es un estado **aparte**: en escritorio el sidebar nunca se oculta del todo, en móvil sí. `Sidebar` usa `@Input()`/`@Output()` clásicos; `Navbar` ya usa `input()` (sin outputs todavía). Al agregar el estado nuevo, seguir el patrón que **ya tiene cada archivo** (Principio de no sorpresa de `frontend-standards`) — no migrar Sidebar a la nueva API de paso, ni bajar Navbar a decoradores clásicos.

1. **`Shell`** (`shell.ts`): agregar `protected menuMobileAbierto = signal(false);`, `toggleMenuMobile(): void { this.menuMobileAbierto.update(v => !v); }` y `cerrarMenuMobile(): void { this.menuMobileAbierto.set(false); }`.
2. **`shell.html`**:
   - `<app-sidebar>` recibe `[menuMobileAbierto]="menuMobileAbierto()"` y `(cerrarMobile)="cerrarMenuMobile()"` (nuevos `@Input`/`@Output` de Sidebar, ver punto 4).
   - `<app-navbar>` recibe `(menuMobileToggle)="toggleMenuMobile()"` (nuevo `output()` de Navbar, ver punto 3).
   - Agregar `<div class="shell-overlay-mobile" (click)="cerrarMenuMobile()" [class.shell-overlay-mobile--visible]="menuMobileAbierto()"></div>` como hermano de `<app-sidebar>`, antes de `.shell-body`.
3. **`Navbar`**: agregar `menuMobileToggle = output<void>();` (misma API que ya usa el archivo) y un botón hamburguesa al principio de `.navbar`, antes de `.navbar-titulo`:
   ```html
   <button type="button" class="navbar-menu-toggle" aria-label="Abrir menú" (click)="menuMobileToggle.emit()">
     <i class="pi pi-bars"></i>
   </button>
   ```
   En `navbar.scss`: `.navbar-menu-toggle { display: none; }` fuera del media query, y dentro de `@media (max-width: 767px) { display: flex; ... }` — nunca al revés (si nace visible por defecto y se oculta solo en escritorio, un olvido en el selector lo deja visible también en desktop).
4. **`Sidebar`**: agregar `@Input() menuMobileAbierto = false;` y `@Output() cerrarMobile = new EventEmitter<void>();` (mismo estilo clásico que ya usa el resto del archivo). En `sidebar.html`, cada `<a routerLink>` de navegación (no los botones que solo expanden/colapsan un grupo) agrega `(click)="cerrarMobile.emit()"` — así el drawer se cierra solo al navegar a otra pantalla.
5. **`sidebar.html`**: agregar la clase `[class.sidebar--menu-abierto]="menuMobileAbierto"` junto a la ya existente `[class.sidebar--collapsed]="collapsed"` en el `<aside>`.
6. **`sidebar.scss`**, dentro de `@media (max-width: 767px)` (agregar el bloque al final del archivo):
   ```scss
   @media (max-width: 767px) {
     .sidebar {
       position: fixed;
       inset: 0 auto 0 0;
       z-index: 50;
       transform: translateX(-100%);
       transition: transform $transition;
       width: $sidebar-width; // ancho de escritorio EXPANDIDO — en móvil no existe el riel angosto

       &--menu-abierto {
         transform: translateX(0);
       }

       // El riel colapsado es un concepto de escritorio; en el drawer de
       // móvil siempre se ve expandido, sin importar si el usuario lo había
       // colapsado antes de achicar la ventana.
       &--collapsed {
         width: $sidebar-width;
       }
     }
   }
   ```
7. **`shell.scss`**: agregar
   ```scss
   .shell-overlay-mobile {
     display: none;
   }

   @media (max-width: 767px) {
     .shell-overlay-mobile {
       display: none; // sigue oculto salvo el modificador de abajo
       position: fixed;
       inset: 0;
       z-index: 40; // debajo del sidebar (50)
       background: rgba(0, 0, 0, 0.4);

       &--visible {
         display: block;
       }
     }
   }
   ```

No tocar `.shell-content`/`.shell-body` en este paso — su comportamiento en móvil (contenido de la pantalla) es responsabilidad del Paso 2 en adelante, pantalla por pantalla.

## Paso 2 — Diagnosticar la pantalla objetivo

Leer los tres archivos del componente (`.ts`, `.html`, `.scss`) antes de editar — no asumir la estructura por el nombre. Identificar:

- **Barra de buscador/filtros/botones de acción** (normalmente `display: flex` en fila, encima de una tabla) → candidata a apilar en columna en móvil.
- **Grillas de formulario en diálogos** (`*-grid-2`, `*-grid-3`, ver `frontend-standards/SKILL.md` §3 "Grillas de formulario en diálogos") → candidatas a `grid-template-columns: 1fr` en móvil. No buscarlas solo por nombre de clase: correr `grep grid-template-columns` sobre las carpetas `modal/` del módulo. En `configuracion/parametros` aparecieron grillas con otros nombres que también había que colapsar: `*-cuenta-grid` (3 columnas), `*-fila-contacto` (5), `*-resumen` (3) y `.contactar-proveedor-contacto` (4).
- **`p-tabs` con muchas pestañas** → no hace falta nada: `.p-tablist-viewport` de PrimeNG ya trae `overflow-x: auto` y flechas de navegación cuando las pestañas no entran (confirmado en `configuracion/parametros`, 8 pestañas).
- **Breakpoints legacy** (`@media (max-width: 720px)`, `640px`, etc.) en los archivos que se van a tocar → migrarlos a 767px y completarlos con el patrón entero, no dejarlos a medias. `alertas-correo.scss` tenía uno de 720px con solo `flex-basis: 100%`, sin `flex-wrap`, sin `min-width: 0` y sin la cadena del botón; `nueva-marca`/`editar-marca` (720px) y `formulario-suscripcion-alerta` (640px) también.
- **`p-table` con columnas fijas** (`[tableStyle]="{ width: '100%' }" [rowHover]="true"` o `<th>` con `width` en px, ver §3 "Tablas") → en móvil **no se ocultan ni comprimen columnas**: se permite scroll horizontal dentro del propio `.tabla-scroll`. Confirmar primero si ya scrollea (es probable que sí, por herencia de `overflow` del `.p-datatable-table-container`) antes de agregar `overflow-x: auto` de más.
- **Tarjetas estadísticas / KPIs en fila** (`shared/ui/tarjeta-estadistica`, grids de resumen) → candidatas a apilar (1 columna) o pasar a 2 columnas, según cuántas quepan legibles en ~375px.
- **`p-dialog`/`p-confirmdialog` angosto** → **ya no hace falta tocar nada por diálogo**: `styles.scss` tiene una regla global (`@media (max-width: 767px) { .p-dialog:not(.p-dialog-maximized) { width: 88vw; max-width: 88vw; } }`, agregada 2026-09-10 en `configuracion/usuario` y ajustada el mismo día de 92vw a 88vw porque 92vw se sentía pegado al borde de la pantalla). **El `max-width` es lo que hace el trabajo real**: casi todo diálogo trae `[style]="{ width: '640px' }"` (o 900px), que PrimeNG aplica inline y le gana a `width` de cualquier hoja de estilos — la máscara flex lo encoge al 100% del viewport y queda pegado a los bordes. `max-width` recorta cualquier `width`, inline incluido, sin `!important`. La regla acota el ancho de **todo** diálogo de la app, incluidos los abiertos vía `ConfirmationService.confirm()`; si uno vuelve a verse pegado al borde, revisar primero que siga teniendo `max-width`. Solo agregar algo por diálogo si ese caso puntual necesita un ancho DISTINTO de 88vw (raro) — nunca reintentar `[breakpoints]` en un `p-confirmdialog` (ver gotcha en Paso 3, no aplica ahí aunque sea el input oficial de PrimeNG).
- **Etiquetas de campo/filtro que no combinan entre sí** (ej. una en mayúscula+negrita y la de al lado en texto normal) → aunque no es estrictamente "responsividad", revisar si dos `shared/ui/` distintos usados en la misma barra (típicamente `app-input-busqueda` + `app-selector`) tienen convenciones de etiqueta distintas — es un bug de consistencia visual real, no algo que inventar; frontend-standards §3 ya documenta que las etiquetas de campo/filtro van en mayúscula+chica+negrita. Si aparece, corregirlo en el componente `shared/ui/` compartido (avisando que el efecto es global, no solo de esta pantalla) en vez de parchear localmente.

## Paso 3 — Aplicar los overrides

Para cada punto identificado en el Paso 2, agregar (nunca reemplazar) dentro de un único `@media (max-width: 767px) { ... }` al final del `.scss` del componente:

- **Barra de filtros/acciones**: `flex-direction: column; flex-wrap: nowrap; align-items: stretch;` en el contenedor (ej. `.filtros-fila`). Los hijos que en escritorio tenían `max-width`/`min-width` en px (ej. `.filtro-item { min-width: 200px; max-width: 320px; }`) pasan a `width: 100%; max-width: none; min-width: 0;` — quitar el tope, no solo agregar `width:100%` encima (dejar un `max-width` de escritorio activo compite con el 100% y da anchos inconsistentes entre campos).
- **Gotcha (el más engañoso de toda la skill) — `flex-wrap: wrap` heredado de escritorio rompe el ancho de UN SOLO ítem apilado, dejando a los demás bien**: si el contenedor ya traía `flex-wrap: wrap` para su fila de escritorio y el override de mobile solo cambia `flex-direction` a `column` sin tocar `flex-wrap`, el wrap sigue activo — pero en un contenedor `column`, `flex-wrap: wrap` no envuelve texto, envuelve creando una **columna nueva** si el contenido no entra en la altura disponible. Síntoma real (`configuracion/parametros`, 2026-09-10, medido en DevTools): con 3 campos apilados (buscador, selector, botón), los dos primeros se estiraban bien a 320px pero el botón "Nueva Empresa" medía solo 156px — se había "cortado" a su propia columna, sizeada por su contenido, mientras los otros dos quedaban juntos en la primera columna. Ni `width: 100%` ni `align-items: stretch` en el ítem alcanzan para arreglarlo — el problema es el wrap, no el sizing del ítem. Agregar siempre `flex-wrap: nowrap` junto con `flex-direction: column` en este patrón, sin excepción.
- **Gotcha — el campo real de PrimeNG no se achica solo con `width:100%` en el wrapper**: mismo gotcha que `p-inputnumber` en formularios (frontend-standards §3) pero aplica igual a `app-input-busqueda`/`app-selector` en una barra de filtros — agregar `min-width: 0` también en el elemento nativo real (`.p-iconfield input`, `.p-select`), no solo en el `<div>` wrapper. Ejemplo real (`usuario.scss`):
  ```scss
  :host ::ng-deep {
    .filtro-item-busqueda .p-iconfield input { min-width: 0; }
    .filtro-item .p-select { min-width: 0; }
  }
  ```
- **Regla dura — todo `::ng-deep` necesita un ancla de scoping antes**: nunca escribir `::ng-deep .algo { ... }` a secas dentro del `.scss` de un componente. Nombres de wrapper de filtros como `.filtro-item`, `.filtro-item-busqueda` o `.boton-nuevo` se repiten tal cual en más de una decena de otras pantallas de este proyecto (`clientes`, `proveedores`, `marcas`, `inventario`, etc.) — un `::ng-deep` sin ancestro sale **global** (Angular solo scopea lo que está ANTES de `::ng-deep` en el selector) y termina tocando esas pantallas también, sin que nadie lo pida. Anteponer siempre `:host` (o, si ya hay un wrapper único de este componente delante, ese wrapper alcanza — ver el caso de `.boton-nuevo` abajo, que sí queda scopeado porque `.boton-nuevo` está antes del `::ng-deep`).
- **Botón de acción (`app-boton`/`p-button`) full-width en la columna apilada**: `app-boton` es `:host{display:inline-block}` y el `p-button` real que tiene adentro es `display:inline-flex` (CSS base de PrimeNG) — ninguno de los dos se ensancha solo porque su contenedor sea 100%; un inline-block/inline-flex se sigue midiendo por su contenido salvo que se lo fuerce a bloque en CADA nivel de la cadena. Forzar `display:block; width:100%` en los tres niveles (wrapper propio, host de `app-boton`, y `p-button`/`.p-button` reales vía `::ng-deep`):
  ```scss
  .boton-nuevo {
    width: 100%;

    app-boton { display: block; width: 100%; }

    ::ng-deep {
      p-button { display: block; width: 100%; }
      .p-button { width: 100%; justify-content: center; }
    }
  }
  ```
- **`p-dialog`/`p-confirmdialog` angosto**: normalmente no hace falta hacer nada — el ancho ya lo resuelve la regla global de `styles.scss` (ver Paso 2). Si además el diálogo tiene grillas `*-grid-2`/`*-grid-3` (frontend-standards §3 "Grillas de formulario en diálogos"), esas sí se colapsan por diálogo: `grid-template-columns: 1fr;` — una sola regla por clase de grilla, no una por campo hijo.
- **Gotcha — `[breakpoints]` de PrimeNG no funciona en un `p-confirmdialog` abierto vía `ConfirmationService`**: es el input oficial y documentado de PrimeNG para achicar un diálogo por breakpoint, y funciona bien en un `<p-dialog>` literal del template (probado en 4 diálogos reales de `configuracion/usuario`) — pero en un `<p-confirmdialog />` disparado dinámicamente con `this.confirmationService.confirm({...})`, no tuvo ningún efecto en la práctica (2026-09-10). No perder tiempo intentándolo ahí: confiar en la regla global de `styles.scss` en su lugar.
- **Gotcha — `gap` del contenedor + `margin-bottom` de la barra de filtros se suman, y encima cada campo apilado suma su propio `gap` interno**: si el contenedor raíz del componente ya usa `gap` (patrón de "Vista fija", ver frontend-standards §3) Y la barra de filtros tiene ADEMÁS su propio `margin-bottom` (pensado para separarla de la tabla en escritorio) Y su propio `gap` entre campos (pensado para una sola fila), en la columna apilada de móvil los tres se acumulan: el `gap` de filtros ahora cuenta 2-3 veces (uno entre cada campo apilado) en vez de una, más el `gap` del root, más el `margin-bottom` — el resultado se ve como un hueco exagerado antes de la tabla/botón siguiente aunque cada valor individual parezca chico. Recortar los tres a la vez, no solo el `margin-bottom` (una primera pasada que solo bajó `.usuario` de 2rem a 1rem sin tocar el `gap` de `.filtros-fila` seguía viéndose "con mucho aire" en `configuracion/parametros`, 2026-09-10):
  ```scss
  .usuario { gap: 0.5rem; }        // antes 2rem
  .filtros-fila {
    gap: 0.6rem;                    // antes 1rem — ahora cuenta 2-3 veces al estar apilado
    margin-bottom: 0;               // el gap del padre ya separa; no duplicar
  }
  ```
- Tablas: si `.tabla-scroll` ya scrollea horizontalmente, no tocar nada; si no (caso raro, confirmar antes de asumir), agregar `overflow-x: auto` local a la clase propia del wrapper de esa pantalla (nunca a la regla global `.tabla-scroll` de `styles.scss`).
- KPIs/tarjetas: `grid-template-columns: 1fr;` o `repeat(2, 1fr)` — decidir tras ver cuál se lee mejor en la prueba del Paso 5, no a priori.

No agregar clases HTML nuevas si el override es puramente de CSS sobre un selector que ya existe — reservar clases nuevas para comportamiento que no tiene equivalente en escritorio (ej. el botón hamburguesa del Paso 1).

**Módulo con varias sub-pantallas iguales** (ej. un `p-tabs` donde cada pestaña es un componente propio con la misma barra de filtros): aplicar el mismo bloque en cada una cambiando solo el nombre de la clase raíz, y omitir las reglas que no tienen a qué apuntar (ej. `.filtro-item .p-select` en una pantalla sin selector de Estado, como `marcas` o `entidades-contratantes`). No copiar reglas muertas.

Ejemplos reales: `components/configuracion/usuario/{usuario.html,usuario.scss}` (pantalla suelta) y `components/configuracion/parametros/*/` (8 pestañas + 16 diálogos). Buscar `@media (max-width: 767px)`. La regla global de ancho de diálogos vive en `styles.scss`, sección "Diálogos: ancho acotado en móvil".

## Paso 4 — Checklist antes de dar por terminado

- [ ] Ningún estilo fuera de `@media (max-width: 767px)` cambió — el CSS de escritorio existente no se editó, solo se agregó.
- [ ] Si `.filtros-fila` (o equivalente) pasó a `flex-direction: column`, también lleva `flex-wrap: nowrap` explícito — si el contenedor heredaba `flex-wrap: wrap` de escritorio, sin este override el último ítem puede "cortarse" a su propia columna y quedar sin estirar (ver gotcha en Paso 3).
- [ ] Si se tocó el shell en esta sesión: el drawer usa un signal/estado propio (`menuMobileAbierto`), sin reutilizar `collapsed` de escritorio.
- [ ] El botón hamburguesa del navbar está oculto en escritorio por defecto (`display: none` fuera del media query) y visible solo dentro de `@media (max-width: 767px)`.
- [ ] El overlay (`z-index: 40`) queda por debajo del sidebar (`z-index: 50`), y ambos ocultos fuera de móvil.
- [ ] Las grillas de formulario colapsadas siguen validando igual — solo se tocó CSS, ningún signal ni lógica de validación.
- [ ] Ninguna tabla perdió columnas en móvil: scrollean horizontalmente, no se ocultan datos.
- [ ] Ningún `::ng-deep` quedó sin ancla de scoping (`:host` u otro selector único de este componente) antes — buscar `::ng-deep` en el diff y confirmar que cada uno tiene algo delante.
- [ ] Ningún ancho de diálogo se repitió por componente (`[breakpoints]`, `[style]` con un `vw`) — el ancho en móvil ya lo resuelve la regla global de `styles.scss`; si se agregó algo local, confirmar que hace falta un valor distinto de 88vw, no que se reinventó la rueda.
- [ ] El espaciado entre bloques apilados (gap del contenedor + margin de cada bloque) no quedó duplicado — revisar visualmente que no sobre un hueco raro entre el último filtro/botón y lo que sigue.
- [ ] `grep "@media (max-width:"` sobre el módulo solo devuelve 767px: no quedó ningún breakpoint legacy.
- [ ] `grep grid-template-columns` sobre las carpetas `modal/` del módulo: toda grilla de 2+ columnas tiene su colapso a `1fr`.
- [ ] Si se sacó o movió un atributo de un tag en un `.html` (ej. un `[breakpoints]`), el tag sigue cerrado con `>`. Al borrar un atributo pegado al `>` final es fácil llevárselo también y romper el template: pasó en `nuevo-usuario.html` y `actualizar-mi-foto.html` (2026-09-10), con el error de compilación "Error occurs in the template of component NuevoUsuario".

## Paso 5 — Verificación visual (obligatoria, la hace el usuario)

El agente no puede abrir un navegador. Al terminar, pedirle explícitamente al usuario que abra DevTools (F12 → modo responsive, probar en ~375×667) y confirme:

1. En ≥768px nada cambió respecto a antes de esta skill (comparar con la pantalla tal como estaba).
2. En <768px: el botón hamburguesa abre/cierra el sidebar como drawer con overlay, y el drawer se cierra solo al navegar a otra pantalla.
3. En la pantalla objetivo: buscador/filtros apilados, formularios de una columna, tablas con scroll horizontal (nunca columnas cortadas o datos ocultos), sin scroll horizontal accidental en el resto de la página (`.shell-content` tiene `overflow-x: hidden` a propósito — ver comentario en `shell.scss` — cualquier desborde ahí es un bug nuevo, no ruido esperado).

**Si el usuario dice que algo "se ve mal" sin precisar qué, no adivinar.** Pedirle que inspeccione en DevTools los dos elementos que deberían coincidir y mande el tooltip de ancho × alto de cada uno (ej. `div.filtro-item 320 × 56.71` contra `div.boton-nuevo 156.02 × 35.31`). Esa medición fue lo que destrabó el gotcha del `flex-wrap`, después de varias vueltas de ajustes a ciegas que no lo arreglaban.

Si algo falla, los sospechosos en orden:
1. Un ítem apilado más angosto que sus hermanos → falta `flex-wrap: nowrap`.
2. Un diálogo pegado al borde de la pantalla → falta `max-width` en la regla global de `styles.scss`.
3. Un `min-width` usado por error en vez de `max-width`.
4. Un estilo de escritorio pisado sin querer al escribir el override, en vez de agregarlo aparte.
