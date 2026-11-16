# Auditoría Técnica y Visual de Referencia (`reference-audit.md`)

- **URL de Referencia:** `https://www.bradfordbuiltdifferent.co.uk/`
- **Título Original:** `Bradford - Built Different`
- **Marca de Destino:** Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH (Ayacucho, Perú)
- **Fecha de Inspección:** 16 de noviembre de 2026
- **Herramientas de Inspección Empleadas:** Chrome DevTools MCP (`evaluate_script`, `navigate_page`, `resize_page`) y Playwright MCP (`browser_navigate`, `browser_evaluate`, `browser_take_screenshot`, `browser_run_code_unsafe`).

---

## 1. Inventario Estructural de Secciones

El documento de referencia (`main#main.page-wrap`, altura total `14,513px` en viewport `1440×900`) consta de **10 bloques estructurales** (9 secciones de flujo en el documento + 1 barra de navegación fija `twostep-nav`):

| # | Selector / Tag Original | Nombre Descriptivo | Posición Y (`1440px`) | Altura (`1440px`) | Max-Width / Padding | Distribución / Columnas | Relación y Función |
|---|---|---|---|---|---|---|---|
| **0** | `nav.twostep-nav` | **Floating Two-Step Navbar** | `fixed top: 0` | `80px` barra (`20px` offset sup.) | `1240px` (`padding: 20px 20px 0`) | Flex row `space-between` (Logo izq., 3 links centro, CTA der. + toggle móvil) | Flota sobre todo el viewport con fondo crema `#FFFCF3`, `border-radius: 12px`, y panel desplegable morado `#4F0B54` en móvil/tablet. |
| **1** | `header.section-header` | **Hero Full-Screen con Video/Imagen y Escalado Scroll** | `top: 0px` | `732px` (`100vh` aprox.) | `1297px` (`padding: 0 64px`, interno `64px 64px 96px`) | Grid inferior 2 cols: `631.55px` (H1 izq.) y `505.25px` (2 pills + párrafo der.), `gap: 32px` | Primera impresión inmersiva; al hacer scroll en desktop se reduce ligeramente (`scale`) con bordes inferiores redondeados. |
| **2** | `section#regen.section-bento` | **Bento Grid de Regeneración / Propuesta Institucional** | `top: 732px` | `1331px` | `1297px` (`padding: 32px 0 48px`) | Grid 2 cols asimétrico (`545.48px` / `727.33px`, `gap: 24px`) en fila 1 + Card full-width (`1297×682px`) en fila 2 | Conecta el Hero con la visión estratégica mediante 3 tarjetas Bento: cita institucional (rosa `#FFBFFD`), plan descargable (azul `#4683FF`) y tarjeta panorámica con tarjeta flotante durazno (`#FFF2EC`). |
| **3** | `section.section-grid` | **Banner de Marcos de Desarrollo + Sección Ambición (2 Columnas con Galería Vertical)** | `top: 2063px` | `1186px` | Banner: `1325×185px` (`#A33DA2`, `radius: 16px`); Grid: `1297×960px` | Banner superior con H1 `64px` + 4 botones blancos; debajo Grid 2 cols iguales (`600.4px` / `600.4px`, `gap: 96px`) | Columna izquierda con eyebrow, H2 `104px`, texto descriptivo y botón verde `#48A74F`; columna derecha con 2 columnas de imágenes (`288×375px`, `radius: 16px`) desplazadas en paralelo con gradiente difuminado superior/inferior. |
| **4** | `div.div-block-6` | **Banner Secundario de Descarga / Estudios** | `top: 3294px` | `185px` | `1325px` (`padding: 10px 40px`, `radius: 16px`) | Bloque centrado con H1 `64px` uppercase + fila flex (`gap: 68px`) con 2 botones blancos | Separador de alto contraste (`#A33DA2`) entre la sección de Ambición y los 4 Impulsores Principales. |
| **5** | `section#focus.section-focus` | **Acordeón Horizontal Interactivo: 4 Impulsores ("Our 4 Main Drivers")** | `top: 3479px` | `1054px` | `1297px` (`padding: 128px 0`) | Cabecera + Flex row de 4 tarjetas (`height: 544px`, `gap: 24px`): 1ª expandida (`571px`) y 3 contraídas (`218px` c/u) | Al hacer hover sobre cualquier tarjeta en desktop, esta se expande (`flex: 3` / `width: 300%`) mostrando párrafo, botón e imagen lateral (`244×366px`), mientras las demás se contraen. En `<992px` se transforma en un carrusel deslizable. |
| **6** | `div.section-peview` | **Lista Interactiva de 7 Proyectos Clave ("The 7 Big Game Changers")** | `top: 4533px` | `1988px` | `1297px` (`padding: 96px 0`) | Cabecera con botón a la derecha + Lista de 7 filas (`padding: 40px 0`, borde inferior `1px solid rgba(0,0,0,0.25)`), cada fila en grid 2 cols (`632.4px` / `632.4px`, `gap: 32px`) | En desktop atenúa las filas no activas (`opacity: 0.5`) y muestra una tarjeta flotante (`preview-follower`, `320×400px`, `radius: 12px`) con vista previa visual al pasar el cursor. En `<992px` se convierte en un acordeón vertical (`#EFEEEC`). |
| **7** | `section#growth.section-cards` | **3 Ejes de Ejecución con Tarjetas Apiladas Sticky ("Our 3 Delivery Themes")** | `top: 6521px` | `1345px` | `1297px` (`padding: 128px 0`) | Grid 2 cols (`640.4px` / `640.4px`, `gap: 16px`): columna izquierda `sticky` y columna derecha con 3 tarjetas apiladas (`448px` ancho, `padding: 48px`, `radius: 24px`) | Las 3 tarjetas (`People` `#E35ED8`, `Productivity` `#FF5100` con ligera rotación `-4deg`, `Place` `#53CD5C` con ligera rotación `2deg`) llevan ícono en recuadro de `48×48px` (`radius: 8px`) y se apilan con efecto sticky. |
| **8** | `div.section-stats` | **Sectores Prioritarios y Estadísticas con Transición de Fondo + Video Destacado** | `top: 7866px` | `4901px` | `1297px` (`padding: 0 64px`) | 3 sub-secciones (`stats-orange` `1598px`, `stats-pink` `834px`, `stats-green` `2469px` que incluye `video-component` de `1043px`) | Un `IntersectionObserver` cambia suavemente el color de fondo de toda la sección (`#FFF2EC` → `#FEECFA` → `#F5FFF6`). Cada fila estadística tiene 3 columnas (`467.5px` título+pills, `467.5px` barras horizontales animadas `Jobs`/`Businesses` de `72px` de alto con `radius: 0 16px 16px 0`, y `233.8px` cifra gigante `104px` con count-up). Finaliza con el bloque `"BUILDING WHAT GROWTH NEEDS"` y un reproductor de video (`1297×729px`, `radius: 16px`) con botón play circular rosa (`128×128px`). |
| **9** | `main.section-footer` | **Footer Monumental con CTA, Líneas SVG Animadas y Tarjeta Inferior Redondeada** | `top: 12767px` | `1746px` | `1425px` full-width (`bg: #4F0B54`) | Parte 1 (`section-cta`, `686px`): Eyebrow + H2 `104px` centrado + subtítulo + 2 botones + trazos SVG decorativos. Parte 2 (`section-resource`, `1060px`, `bg: #FFBFFD`, `radius: 64px 64px 0 0`): Grid 3 cols (`Contact Us`, iconos sociales `64×64px`, botones verticales) + logos institucionales + wordmark SVG gigante al pie (`1425×398px`). | Cierre de alto impacto visual con contraste entre morado profundo (`#4F0B54`) y rosa pastel (`#FFBFFD`). |

---

## 2. Sistema Tipográfico

### 2.1 Familias Tipográficas Confirmadas (vía `document.fonts` y CSS Variables)
- **Display / Titulares (`--_typography---font-family--secondary-family`):** `"Roboto Condensed", Impact, sans-serif` — Peso `900` (Black / ExtraBold) y `300` (Light en cifras grandes de estadísticas).
- **Texto Base / UI (`--_typography---font-family--primary-family`):** `Roboto, Arial, sans-serif` — Pesos `300` (Light), `400` (Regular), `500` (Medium) y `700` (Bold).

### 2.2 Escala Tipográfica y Jerarquía Calculada

| Elemento / Clase | Familia | Peso | Tamaño Desktop (`1440px`) |Tamaño Tablet (`768px`) | Tamaño Móvil (`390px`) | Line-Height | Letter-Spacing | Transform |
|---|---|---|---|---|---|---|---|---|
| `h1.heading-style-h1` / `h2.heading-style-h2` | `Roboto Condensed` | `900` | `104px` (`6.5rem`) | `72px` | `48px` | `104px` (`1.0`) a `124.8px` (`1.2`) | `-2.6px` (`-0.025em`) | `uppercase` |
| `.towns-download-heading` (Banner H1) | `Roboto Condensed` | `900` | `64px` (`4rem`) | `44px` | `32px` | `76.8px` (`1.2`) | `-1.6px` (`-0.025em`) | `uppercase` |
| `h2.heading-style-h3` / `h3.heading-style-h3` | `Roboto Condensed` | `900` | `32px` (`2rem`) | `28px` | `24px` | `32px` (`1.0`) a `44.8px` (`1.4`) | `0em` | `uppercase` |
| `h4.heading-style-h4` (Sectores) | `Roboto Condensed` | `900` | `32px` (`2rem`) | `26px` | `24px` | `44.8px` (`1.4`) | `0em` | `uppercase` |
| `h5.heading-style-h6` (`Jobs`, `Businesses`, `Contact Us`) | `Roboto Condensed` | `900` | `20px` (`1.25rem`) | `18px` | `18px` | `28px` (`1.4`) | `0em` | `none` |
| `.text-size-x-large` (Subtítulos destacados / Cifras barras) | `Roboto` | `300` / `500` | `24px` (`1.5rem`) | `20px` | `18px` | `36px` (`1.5`) | `0em` | `none` |
| `.text-size-large` (Párrafos principales Bento/Ambición/Cards) | `Roboto` | `300` / `500` | `20px` (`1.25rem`) | `18px` | `16px` | `30px` (`1.5`) | `0em` | `none` |
| `.text-size-medium` (Párrafo Hero) | `Roboto` | `300` | `18px` (`1.125rem`) | `16px` | `16px` | `27px` (`1.5`) | `0em` | `none` |
| `body` / `.button-text` / Párrafo estándar | `Roboto` | `300` / `500` | `16px` (`1rem`) | `16px` | `16px` | `24px` (`1.5`) | `0em` | `none` |
| `.eyebrow-wrap .btn-text` (Pills / Etiquetas) | `Roboto` | `300` / `400` | `14px` (`0.875rem`) | `14px` | `13px` | `21px` (`1.5`) | `0em` | `none` |

> **Nota técnica observada:** En el CSS embebido (`wizardry-code`), el sitio utiliza `body { font-size: 1vw; }` entre `992px` y `1440px`, fijando `font-size: 16px` en `>=1440px` y restableciendo `font-size: initial` en `<=991px`.

---

## 3. Sistema Cromático

Todos los valores fueron extraídos directamente de `:root` (`document.styleSheets`) y de `getComputedStyle()`:

### 3.1 Superficies y Neutros (Confirmados)
- **Paper Lightest (Fondo general de página y navbar):** `#FFFCF3` (`rgb(255, 252, 243)`)
- **Paper Light (Hover de links en navbar):** `#F5F1E5` (`rgb(245, 241, 229)`)
- **Paper Normal (Eyebrows neutros y botón hamburguesa):** `#E5E0CF` (`rgb(229, 224, 207)`)
- **Paper Darker (Texto de eyebrows neutros):** `#66635C` (`rgb(102, 99, 92)`)
- **Neutral Lightest (Ítems de acordeón móvil):** `#EFEEEC` (`rgb(239, 238, 236)`)
- **Neutral Darkest / Texto Principal (`shade-80`):** `rgba(0, 0, 0, 0.8)` / `#201D1D` (`rgb(32, 29, 29)`)
- **White:** `#FFFFFF`

### 3.2 Familia Púrpura / Rosa (Identidad Primaria del Sitio de Referencia - Confirmados)
- **Pink Darkest:** `#42023C` (`rgb(66, 2, 60)`) — Texto sobre botones blancos y tarjetas rosas.
- **Pink Darker:** `#4F0B54` (`rgb(79, 11, 84)`) — Fondo del Footer CTA, menú desplegable, logo y textos de la sección `stats-pink`.
- **Pink Dark:** `#7D167D` (`rgb(125, 22, 125)`) — Fondo de tarjeta `CULTURE` en `section-focus`.
- **Pink Normal:** `#A33DA3` (`rgb(163, 61, 163)`) — Fondo de botones primarios (`Work with us`, `Be part of it`, `View the plan`), banners de descarga (`#A33DA2`) y pills de `stats-pink`.
- **Pink Light:** `#E35ED8` (`rgb(227, 94, 216)`) — Pills del Hero, círculos de íconos en botones blancos y tarjeta `People` en `section-cards`.
- **Pink Lighter:** `#FF75F3` (`rgb(255, 117, 243)`) — Eyebrow `Regeneration` y palabra destacada `GROWTH` en el Footer CTA.
- **Pink Lightest:** `#FF94FB` (`rgb(255, 148, 251)`) — Título `CULTURE`, botones circulares de redes sociales y wordmark gigante del footer.
- **Pink Pastel 1:** `#FFBFFD` (`rgb(255, 191, 253)`) — Tarjeta Bento 1, barras de `stats-pink`, botón play de video y tarjeta inferior del footer (`section-resource`).
- **Pink Pastel 2 / Transition BG:** `#FFECFE` (`rgb(255, 236, 254)`) / `#FEECFA` — Texto claro sobre botones morados y fondo de transición de `stats-pink`.

### 3.3 Familia Azul (Confirmados)
- **Blue Light:** `#4683FF` (`rgb(70, 131, 255)`) — Fondo de tarjeta Bento 2 y tarjeta `SKILLS` en `section-focus`.
- **Blue Pastel:** `#E4F3FF` (`rgb(228, 243, 255)`) — Texto celeste sobre tarjetas azules.

### 3.4 Familia Naranja / Terracota (Confirmados)
- **Orange Darkest:** `#49130C` (`rgb(73, 19, 12)`) — Texto en eyebrow y botón `Watch the video`.
- **Orange Darker:** `#7A2D14` (`rgb(122, 45, 20)`) — Títulos, textos y líneas divisorias en `stats-orange`.
- **Orange Dark:** `#B34619` (`rgb(179, 70, 25)`) — Texto de la tarjeta interna `Build the station` (Bento 3).
- **Orange Normal:** `#DB4500` (`rgb(219, 69, 0)`) — Cifras gigantes (`104px`) en `stats-orange`.
- **Orange Light:** `#FF5100` (`rgb(255, 81, 0)`) — Tarjeta `Productivity` (`section-cards`) y pills de `stats-orange`.
- **Orange Lighter:** `#FF7B3E` (`rgb(255, 123, 62)`) — Tarjeta `TRANSPORT` en `section-focus`.
- **Orange Lightest:** `#FFAE91` (`rgb(255, 174, 145)`) — Eyebrow `Southern Gateway` y barras horizontales de `stats-orange`.
- **Orange Pastel:** `#FFF2EC` (`rgb(255, 242, 236)`) — Fondo de tarjeta interna Bento 3 y fondo de transición de `stats-orange`.

### 3.5 Familia Verde (Confirmados)
- **Green Darker:** `#155111` (`rgb(21, 81, 17)`) — Títulos, textos y líneas divisorias en `stats-green`.
- **Green Dark:** `#2C8633` (`rgb(44, 134, 51)`) — Color de ícono en tarjeta `Place`.
- **Green Normal:** `#48A74F` (`rgb(72, 167, 79)`) — Botón verde en Ambición, tarjeta `REGEN PIPELINE`, pills y cifras gigantes en `stats-green`.
- **Green Light:** `#53CD5C` (`rgb(83, 205, 92)`) — Tarjeta `Place` en `section-cards`.
- **Green Lightest:** `#ACFFB2` (`rgb(172, 255, 178)`) — Barras horizontales en `stats-green`.
- **Green Pastel:** `#F5FFF6` (`rgb(245, 255, 246)`) — Texto sobre tarjetas verdes y fondo de transición de `stats-green`.

---

## 4. Escalas de Espaciado y Geometría Principal

- **Contenedor Global (`.padding-global`):** `padding-inline: 64px` (`4rem`) en `1440px`, `40.96px` en `1024px`, `20px–24px` en `<992px`.
- **Ancho Máximo de Contenedor (`.container-large`):** `1297px` efectivos dentro de `1440px` (`max-width: 1440px`).
- **Paddings Verticales de Sección:**
  - `.padding-section-small`: `48px 0` (`3rem 0`)
  - `.padding-section-medium`: `32px 0 48px` (Bento) / `96px 0 64px` (Video)
  - `.padding-section-large`: `128px 0` (`8rem 0`)
  - `.preview-container`: `96px 0` (`6rem 0`)
- **Gaps Estructurales:**
  - `24px` (`1.5rem`) en Bento Grid y en el acordeón horizontal de 4 tarjetas (`focus_layout`).
  - `32px` (`2rem`) en Hero bottom grid y en filas de `preview-item__row`.
  - `64px` (`4rem`) entre columnas de `stats-block` y entre cabecera y contenido de sección.
  - `96px` (`6rem`) entre las 2 columnas de `section-grid` (Ambición) y entre bloques principales.
- **Border Radius Confirmados:**
  - `8px` (`0.5rem`): Botones principales (`.button-main`), imágenes internas de focus cards, recuadros de íconos (`48×48px`) y filas de acordeón móvil.
  - `12px` (`0.75rem`): Barra superior del navbar (`.twostep-nav__top`), tarjeta interna Bento 3 (`.bento-inner-card`) y `preview-follower`.
  - `14px` (`0.875rem`): Pills / Eyebrows (`.eyebrow-wrap`, `padding: 10.5px 14px`, `height: 42px`).
  - `16px` (`1rem`): Tarjetas Bento (`.bento-card`), banners morados (`.div-block-6`), tarjetas de `section-focus`, imágenes de galería vertical y reproductor de video.
  - `0px 16px 16px 0px`: Barras estadísticas horizontales (`.stat-pill`, `height: 72px`).
  - `24px` (`1.5rem`): Tarjetas apiladas de `section-cards` (`.layout-card`), fondo del menú desplegable y slides móviles.
  - `64px 64px 0px 0px`: Tarjeta rosa monumental del footer (`.section-resource`).
  - `2048px` / `9999px`: Círculos de íconos dentro de botones (`32×32px`), botones sociales (`64×64px`) y botón play (`128×128px`).

---

## 5. Comportamiento Responsive (Observado en 4 Viewports)

| Viewport | `body` Font-Size | H1 / H2 Size | Navbar | Bento Grid | 4 Main Drivers (`#focus`) | 7 Game Changers (`preview`) | Priority Sectors (`stats`) |
|---|---|---|---|---|---|---|---|
| **1440px** (Desktop) | `16px` | `104px` | Links visibles en barra + botón CTA (`1240×80px`) | 2 cols (`545px` + `727px`) + 1 full-width (`1297px`) | Acordeón horizontal flex de 4 tarjetas (`544px` alto) | Tabla interactiva de 7 filas con follower flotante | 3 secciones completas con barras horizontales y números `104px` |
| **1024px** (Laptop) | `10.24px` (`1vw`) | `66.56px` | Links visibles en barra + botón CTA | 2 cols proporcionales (`388px` + `518px`) + 1 full-width | Acordeón horizontal flex de 4 tarjetas | Tabla interactiva de 7 filas | 3 secciones completas proporcionales |
| **768px** (Tablet) | `16px` | `72px` | Links ocultos; aparece botón hamburguesa `#E5E0CF` (`twostep-nav__toggle`) | 2 cols iguales (`328px` + `328px`) en fila superior + full-width inferior | Cambia a carrusel/slider táctil con tarjetas de `border-radius: 24px` | Cambia a acordeón vertical de 7 ítems (`bg: #EFEEEC`, ícono `+` circular `#D4CEE5`) | Vista adaptada con acordeones por sector y bloques apilados |
| **390px** (Móvil) | `16px` | `48px` (`line-height: 42px`) | Barra compacta con logo + botón hamburguesa; al abrir despliega panel `#4F0B54` con links en `Roboto Condensed` blanco y tarjeta rosa interna | 1 col (`100%` ancho, tarjetas apiladas verticalmente) | Carrusel/tarjetas apiladas de 1 columna con imagen e información | Acordeón vertical interactivo de 7 ítems | Bloques estadísticos en 1 columna y acordeón móvil |

---

## 6. Interacciones y Microinteracciones Confirmadas

1. **Botones `.button-main` con Doble Ícono Elástico:**
   - Estado inicial: el texto tiene margen a la derecha (`margin-right: 2.5em–3em`) y un círculo de `32×32px` a la derecha (`.button-icon-right`, `scale(1)`) con una flecha diagonal (`↗`). A la izquierda hay un círculo idéntico oculto (`.button-icon-left`, `scale(0)`, `opacity: 0`).
   - En `:hover` (dispositivos `pointer: fine`): el texto se desplaza a la derecha (`margin-left: 2.5em`, `margin-right: 0`), el ícono derecho se encoge (`scale(0)`) y el ícono izquierdo emerge con física elástica (`scale(1)`).
2. **Links de Navbar (`.navbar-link`):**
   - Al pasar el cursor, aparece una píldora de fondo crema (`#F5F1E5`, `border-radius: 999px`) detrás del texto con una ligera rotación orgánica (`-3deg` a `3deg`).
3. **Menú Desplegable Two-Step (`twostep-nav`):**
   - Al activar el botón hamburguesa (o abrir el menú), el contenedor `.twostep-nav__back-bg` (`#4F0B54`, `border-radius: 24px`) se expande hacia abajo mostrando los enlaces principales en `Roboto Condensed 900` blanco, el botón `"Work with us"` y la tarjeta destacada rosa (`#FFBFFD`) con el plan institucional. Se cierra con clic en el botón `X`, clic en el fondo oscuro o tecla `Escape`.
4. **Acordeón Horizontal de 4 Tarjetas (`section-focus`):**
   - Por defecto la primera tarjeta (`CULTURE`) está expandida (`flex: 2.6`) mostrando su párrafo, botón de texto e imagen derecha, mientras las otras 3 (`SKILLS`, `TRANSPORT`, `REGEN PIPELINE`) están contraídas (`flex: 1`). Al hacer hover o clic sobre cualquiera de las 4 tarjetas, esa tarjeta pasa al estado expandido y las demás se contraen suavemente (`transition: 0.55s cubic-bezier(0.625, 0.05, 0, 1)`).
5. **Lista de 7 Proyectos Clave (`section-peview`):**
   - En desktop, pasar el cursor sobre una fila atenúa las demás filas (`opacity: 0.5`) y muestra una vista previa flotante (`320×400px`, `border-radius: 12px`). En móvil/tablet (`<992px`), cada proyecto funciona como un ítem de acordeón expandible al hacer clic.
6. **Transición de Color de Fondo en Estadísticas (`section-stats`):**
   - Mediante `IntersectionObserver`, el fondo de `.section-stats` transiciona suavemente (`transition: background-color 0.6s ease`) entre `#FFF2EC` (sección naranja), `#FEECFA` (sección rosa) y `#F5FFF6` (sección verde).
7. **Barras de Estadísticas y Reproductor de Video:**
   - Las barras horizontales (`.stat-pill`, `height: 72px`, `border-radius: 0 16px 16px 0`) muestran visualmente la proporción de cada indicador junto a su cifra numérica, y el bloque de video permite abrir un modal/reproductor interactivo demostrativo.

---

## 7. Limitaciones de Inspección

- Los videos de fondo (`.u-video` en Hero y Bento 3) y el iframe de Vimeo pertenecen al CDN propietario del sitio de referencia (`website-files.com` / `vimeo.com`). Por respeto a los derechos de autor y restricciones del proyecto, **no se descargan ni incrustan activos propietarios de Bradford**, empleándose en su lugar fotografías y emblemas propios autorizados del repositorio (`public/hero-pabellon.webp`, `public/emblema-unsch-grabado.webp`, `public/emblema-unsch.webp`, `public/democra-emblema.png`) combinados con composiciones vectoriales SVG de alta resolución.
- El canvas físico 2D (`Matter.js` en `.canvas-matter`) del footer en el sitio de referencia estaba vacío/inactivo en la captura (`height` sin cuerpos visibles salvo el SVG wordmark inferior), por lo que se prioriza el wordmark SVG monumental y los trazos vectoriales animados del bloque CTA.

---

## 8. Decisiones de Adaptación a "Plantel de Aplicación Guamán Poma de Ayala - UNSCH"

Para lograr la **máxima fidelidad visual, geométrica, cromática y tipográfica** con `https://www.bradfordbuiltdifferent.co.uk/` mientras representamos auténticamente a los **Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH (Ayacucho)** y mantenemos los enlaces a las rutas existentes del portal (`/admision`, `/por-que-elegirnos`, `/niveles`, `/servicios`, `/testimonios`, `/noticias`, `/contacto`, `/intranet`):

| Sección en Referencia (Bradford) | Adaptación Institucional (Guamán Poma de Ayala - UNSCH) |
|---|---|
| **0. Navbar (`BUILT DIFFERENT`)** | **`GUAMÁN POMA · UNSCH`** (con emblema grabado UNSCH) + enlaces centrales (`Propuesta`, `Niveles`, `Ejes`, ` Logros`, `Intranet`) + CTA morado **`Admisión 2027 ↗`** y menú desplegable Two-Step completo. |
| **1. Hero (`SHAPING OUR OWN FUTURE`)** | **`FORJANDO NUESTRO PROPIO FUTURO`** — Pills rosas: `UNSCH 1964–2026` y `Plan Educativo & Admisión 2027`. Párrafo sobre los 62+ años formando líderes en Inicial, Primaria y Secundaria en Ayacucho con respaldo de la UNSCH. |
| **2. Bento Grid (`Regeneration`)** | **Tarjeta 1 (Rosa `#FFBFFD`):** Pill `Identidad`, ícono de comillas grande, cita del **Mg. Yecid Ramírez Chipana — Director General** y botón `Postular ahora ↗`. **Tarjeta 2 (Azul `#4683FF`):** `EL PLAN EDUCATIVO GUAMÁN POMA 2027`, descripción del modelo pedagógico UNSCH, botón `Ver propuesta ↗` y mockup editorial 3D del prospecto institucional. **Tarjeta 3 (Video/Imagen Panorámica + Tarjeta Durazno `#FFF2EC`):** Botón `Conocer el campus ↗` + tarjeta interna `Infraestructura 2026` / `4 LOSAS DEPORTIVAS TECHADAS` (`S/ 2M` de inversión para más de 800 estudiantes). |
| **3. Frameworks Banner + `DRIVING FORWARD AS A CORE CITY`** | **Banner Morado 1 (`#A33DA2`):** `EXPLORA NUESTROS NIVELES Y SERVICIOS` con 4 botones blancos (`Nivel Inicial ↗`, `Nivel Primaria ↗`, `Nivel Secundaria ↗`, `Laboratorios UNSCH ↗`). **Grid 2 Columnas (`Our ambition` → `Nuestra vocación`):** `LIDERANDO LA EDUCACIÓN EN AYACUCHO` + narrativa de escuela de aplicación adscrita a la Facultad de Ciencias de la Educación de la UNSCH + botón verde `Explorar niveles ↗` + doble columna de tarjetas visuales escalonadas con fotografías y vistas del plantel. |
| **4. Banner Morado 2 (`SEE WHAT'S BEHIND...`)** | **`CONOCE EL RESPALDO ACADÉMICO DE NUESTRA INSTITUCIÓN...`** con 2 botones blancos (`Ver Cuadro de Vacantes 2027 ↗` y `Acceder a Intranet Escolar ↗`). |
| **5. `OUR 4 MAIN DRIVERS` (Acordeón Horizontal de 4 Tarjetas)** | **`NUESTROS 4 PILARES`** (`Ejes formativos`): 1. **`CIENCIA Y LABS`** (`#7D167D`), 2. **`EXCELENCIA CNEB`** (`#4683FF`), 3. **`DEPORTE Y CULTURA`** (`#FF7B3E`), 4. **`INGRESO UNSCH`** (`#48A74F`). Con expansión interactiva en hover/clic en desktop y carrusel táctil en móvil. |
| **6. `THE 7 BIG GAME CHANGERS` (Lista Interactiva / Acordeón)** | **`LOS 7 HITOS INSTITUCIONALES`** (`Grandes proyectos`): 1. `COMPLEJO DE 4 LOSAS TECHADAS`, 2. `LABORATORIOS CIENTÍFICOS UNSCH`, 3. `NIVEL INICIAL: PRIMERA INFANCIA`, 4. `NIVEL PRIMARIA: BASE INTEGRAL`, 5. `NIVEL SECUNDARIA Y PRE-UNSCH`, 6. `GESTIÓN DIGITAL E INTRANET 2026`, 7. `IDENTIDAD CULTURAL HUAMANGUINA`. Con vista previa flotante al pasar el cursor en desktop y acordeón en móvil. |
| **7. `OUR 3 DELIVERY THEMES` (Sticky Cards)** | **`NUESTROS 3 NIVELES FORMATIVOS`** (`Crecimiento`): Columna izquierda sticky + 3 tarjetas derechas apiladas: 1. **`INICIAL (3–5 AÑOS)`** (`#E35ED8`), 2. **`PRIMARIA (1°–6°)`** (`#FF5100`), 3. **`SECUNDARIA (1°–5°)`** (`#53CD5C`). |
| **8. `OUR STRENGTHS` (Sectores y Estadísticas + Video)** | **`NUESTRAS FORTALEZAS`** (`Indicadores clave`): 3 bloques cromáticos con transición de fondo (`#FFF2EC` → `#FEECFA` → `#F5FFF6`), barras horizontales proporcionales (`Estudiantes` / `Secciones y Talleres`) y cifras gigantes (`104px`): **Grupo Naranja (`FORMACIÓN ACADÉMICA Y CIENTÍFICA`):** Ciencias y Laboratorios (`62+` años), Razonamiento y Matemática (`800+` alumnos), Comunicación y Humanidades (`100%` cobertura CNEB). **Grupo Rosa (`INNOVACIÓN Y CULTURA`):** Tecnología y Robótica (`24` aulas digitales), Arte y Cultura Ayacuchana (`18` elencos y talleres). **Grupo Verde (`INFRAESTRUCTURA Y BIENESTAR`):** Complejo Polideportivo Techado (`4` losas), Psicopedagogía y Tutoría (`3` niveles), Proyección Universitaria UNSCH (`95%` vocación superior). Seguido de **`CONSTRUYENDO EL FUTURO QUE AYACUCHO NECESITA`** y el reproductor visual interactivo (`1297×729px`). |
| **9. Footer (`GROWTH DOESN'T HAPPEN IN ISOLATION.`)** | **`LA EDUCACIÓN NO CRECE EN AISLAMIENTO.`** (con `LA EDUCACIÓN` en `#FF75F3` y el resto en `#FFBFFD`), subtítulo `¿Quieres formar parte de la familia guamampomina en el proceso de Admisión 2027?`, botones `Admisión 2027 ↗` y `Contacto e Informes ↗`, trazos vectoriales curvos, y tarjeta rosa `#FFBFFD` (`border-radius: 64px 64px 0 0`) con datos reales del plantel (`Pasaje San Joaquín 101, Ayacucho`, `(066) 312510`, `admision@guamanpoma-unsch.edu.pe`), botones sociales, escudos institucionales (UNSCH y Guamán Poma) y wordmark SVG monumental al pie. |
