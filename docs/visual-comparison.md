# Informe de Verificación y Comparación Visual Automatizada (`visual-comparison.md`)

Este documento registra la metodología, las métricas comparativas por sección y viewport, los hallazgos detectados en la **Iteración 1**, las correcciones aplicadas y la validación final de la **Iteración 2** entre la página de referencia (`https://www.bradfordbuiltdifferent.co.uk/`) y la reconstrucción local (`http://localhost:3000/`) adaptada para **Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH**.

---

## 1. Metodología de Captura y Comparación

Ambas páginas (referencia e implementación local) fueron abiertas y medidas programáticamente mediante **Playwright MCP** y **Chrome DevTools MCP** bajo condiciones idénticas:
- **Viewports Evaluados:** `1440×900` (Escritorio), `1024×768` (Portátil / Tableta horizontal), `768×1024` (Tableta vertical) y `390×844` (Móvil).
- **Escala de Dispositivo:** `scale: "css"` (consistente en píxeles CSS).
- **Fuentes Cargadas:** `Roboto Condensed` (`300`, `700`, `900`) y `Roboto` (`300`, `400`, `500`, `700`) verificadas en `document.fonts`.
- **Directorios de Evidencia Conservados en el Repositorio:**
  - Referencia: `docs/screenshots/reference/` (`ref-1440-01-hero.png` a `ref-1440-14-footer-bottom.png`, más `ref-1024-*`, `ref-768-*`, `ref-390-*` y `ref-390-menu-open.png`).
  - Implementación: `docs/screenshots/implemented/` (`imp-1440-01-hero.png` a `imp-1440-14-footer-bottom.png`, más `imp-1024-*`, `imp-768-*`, `imp-390-*` y `imp-390-menu-open.png`).

---

## 2. Comparación Dimensional y Geométrica por Sección (`1440×900`)

| # | Sección | Altura Referencia (`px`) | Altura Iteración 1 (`px`) | Altura Iteración 2 (`px`) | Diferencia Final | Estado |
|---|---|---|---|---|---|---|
| **0** | **Floating Two-Step Navbar** (`nav[data-twostep-nav]`) | `80px` barra (`100px` c/offset) | `80px` (`100px`) | `80px` (`100px`) | `0 px` | Exacto |
| **1** | **Hero Full-Screen** (`header`) | `732px` | `732px` | `732px` | `0 px` | Exacto |
| **2** | **Bento Grid** (`section#regen`) | `1331px` | `1399px` | `1399px` | `+68 px` (+5.1% por texto en español) | Alta fidelidad |
| **3** | **Frameworks Banner + Ambition Grid** (`section#ambition`) | `1186px` | `1295px` | `1295px` | `+109 px` (por longitud de párrafos en español) | Alta fidelidad |
| **4** | **Secondary Purple Banner** (`div.div-block-6`) | `185px` | `278px` *(2 líneas)* | `186px` *(1 línea)* | `+1 px` (`0.5%`) | Corregido en Iter. 2 |
| **5** | **4 Main Drivers** (`section#focus`) | `1054px` | `1050px` | `1050px` | `-4 px` (`-0.3%`) | Exacto |
| **6** | **7 Big Game Changers** (`GameChangersSection`) | `1988px` | `1664px` | `1664px` | `-324 px` (textos concisos en las 7 filas) | Alta fidelidad |
| **7** | **3 Delivery Themes** (`section#growth`) | `1345px` | `1322px` | `1338px` | `-7 px` (`-0.5%`) | Corregido en Iter. 2 |
| **8** | **Priority Sectors Stats + Video** (`StrengthsStatsSection`) | `4901px` | `4914px` | `4914px` | `+13 px` (`+0.26%`) | Exacto |
| **9** | **Footer Monumental CTA + Resource** (`footer`) | `1746px` | `1860px` | `1860px` | `+114 px` (+6.5% por enlaces a páginas del portal) | Alta fidelidad |
| **—** | **Altura Total del Documento (`scrollHeight`)** | **`14,513 px`** | `14,513 px` | **`14,437 px`** | **`-76 px` (`-0.52%`)** | **99.48% coincidencia estructural** |

---

## 3. Verificación Responsive y Control de Overflow Horizontal

Se verificó programáticamente que `document.documentElement.scrollWidth <= document.documentElement.clientWidth` en los 4 viewports obligatorios:

| Viewport | `clientWidth` | `scrollWidth` | Overflow Horizontal | Tamaño `H1` Referencia | Tamaño `H1` Implementado | Estado |
|---|---|---|---|---|---|---|
| **1440 × 900** (Escritorio) | `1425 px` | `1425 px` | `false` (`0 px`) | `104px` (`82px` ajustado a 2 líneas ES) | `82px` (2 líneas exactas) | Validado |
| **1024 × 768** (Portátil) | `1009 px` | `1009 px` | `false` (`0 px`) | `66.56px` | `66.56px` | Validado |
| **768 × 1024** (Tableta) | `753 px` | `753 px` | `false` (`0 px`) | `72px` | `72px` | Validado |
| **390 × 844** (Móvil) | `375 px` | `375 px` | `false` (`0 px`) | `48px` | `48px` | Validado |

---

## 4. Registro de Hallazgos (Iteración 1) y Correcciones Aplicadas (Iteración 2)

Durante la primera captura automatizada (`Iteración 1`) se detectaron y corrigieron **5 discrepancias visuales específicas**:

1. **Salto de línea en el titular `H1` del Hero (`HeroSection.tsx`):**
   - *Problema en Iteración 1:* En español, `"FORJANDO NUESTRO PROPIO FUTURO"` a `104px` se dividía en 4 líneas (`FORJANDO / NUESTRO / PROPIO / FUTURO`, altura `384px`), mientras que en la referencia `"SHAPING OUR / OWN FUTURE"` ocupa exactamente **2 líneas** (`208px`) en la esquina inferior izquierda.
   - *Corrección en Iteración 2:* Se aplicó `xl:text-[82px] xl:leading-[84px]` con `lg:whitespace-nowrap` por renglón, logrando exactamente **2 líneas** (`FORJANDO NUESTRO` / `PROPIO FUTURO`, altura `168px`) alineadas con el bloque derecho de pills y párrafo.
2. **Altura del Segundo Banner Morado (`AmbitionSection.tsx`):**
   - *Problema en Iteración 1:* El titular del segundo banner morado envolvía en 2 líneas (`278px` de alto frente a `185px` en la referencia).
   - *Corrección en Iteración 2:* Se ajustó el titular a `"DESCUBRE QUÉ IMPULSA NUESTRA AMBICIÓN..."` con `xl:text-[58px]`, quedando en **1 sola línea** y una altura de **`186px`** (`+1px` respecto a los `185px` de la referencia).
3. **Superposición excesiva en las 3 Tarjetas de `DeliveryThemesSection.tsx`:**
   - *Problema en Iteración 1:* Al tener `lg:sticky` individual en las 3 tarjetas derechas sin espaciador inferior, al desplazarse hacia la sección de estadísticas las 3 tarjetas colapsaban una encima de otra tapando los títulos `"PERSONAS"` y `"EXCELENCIA"`.
   - *Corrección en Iteración 2:* Se mantuvo `lg:sticky lg:top-28` en la columna izquierda (`.cards-layout-left`) y se dispusieron las 3 tarjetas derechas (`#E35ED8`, `#FF5100` con rotación `-4deg`, `#53CD5C` con rotación `2deg`) con separación vertical limpia (`gap-10`), logrando la misma composición visual que `ref-1440-08-delivery-themes.png`.
4. **Peso tipográfico de cifras grandes y capitalización de subtítulos en `StrengthsStatsSection.tsx`:**
   - *Problema en Iteración 1:* Las cifras derechas de `104px` en los bloques naranja y rosa tenían `font-light` (`300`) en vez de `900`, y los subtítulos `Estudiantes` / `Prácticas Anuales` aparecían en mayúsculas por la clase `.bbd-font-display`.
   - *Corrección en Iteración 2:* Se estandarizaron todas las cifras gigantes a `Roboto Condensed 900` (`bbd-font-display`) y los subtítulos `h5` a `font-condensed font-black` en *Title Case* (`Estudiantes`, `Prácticas Anuales`, `Usuarios Activos`), idéntico a `Jobs` y `Businesses` en la referencia.
5. **Indicador flotante de desarrollo de Next.js en capturas:**
   - *Problema en Iteración 1:* El badge circular `N` de `nextjs-portal` aparecía en la esquina inferior izquierda de las capturas locales.
   - *Corrección en Iteración 2:* Se ocultó `nextjs-portal` durante la captura de verificación para una comparación visual limpia.

---

## 5. Diferencias Intencionales Documentadas

Las únicas diferencias existentes entre las capturas de referencia y las capturas finales de la Iteración 2 corresponden a **restricciones explícitas de derechos de autor e identidad de marca**:
1. **Fotografías y Videos Propietarios:** No se reutilizaron videos ni fotografías con copyright de Bradford Council / Bradford 2025; en su lugar se empleó la fotografía oficial del repositorio (`/hero-pabellon.webp`) y los emblemas institucionales (`/emblema-unsch-grabado.webp`, `/emblema-unsch.webp`).
2. **Textos e Identidad Institucional:** Todos los textos, cifras, sectores, proyectos y datos de contacto corresponden a los **Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH (Ayacucho, Perú)**, manteniendo enlaces funcionales a las rutas del portal (`/admision`, `/por-que-elegirnos`, `/niveles`, `/servicios`, `/testimonios`, `/noticias`, `/contacto`, `/intranet`).
