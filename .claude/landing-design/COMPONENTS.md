# Inventario de Componentes del Landing

**Proyecto:** Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)  
**Fecha de Recopilación:** 2026-11-16  
**Fase:** `/landing-recopilar`  

---

## 1. Componentes Globales de Navegación y Estructura

### `Navbar` (`frontend/modules/landing/components/Navbar.tsx`)
* **Propósito:** Barra flotante fija Two-Step Nav (`data-twostep-nav`) con comportamiento colapsable/expandible.
* **Comportamiento:**
  * **Barra Superior (Crema `#FFFCF8`):** Logo institucional oficial UNSCH + texto display `GUAMÁN POMA`, 5 enlaces directos con badges inclinados aleatoriamente (`rotation`), botón CTA `Admisión 2027` y botón toggle hamburguesa para móviles y tablets.
  * **Drawer Desplegable (Borgoña Profundo `#3A0008`):** Se expande con curva cubic-bezier suave; incluye columna izquierda con enlaces monumentales (`34px–42px`), botón de contacto, y columna derecha con tarjeta rosa destacada (`#F9A7B1`) "EL PLAN EDUCATIVO GUAMÁN POMA 2027".
  * **Accesibilidad:** Cierre con tecla `Escape`, `aria-expanded`, `aria-controls`, `aria-label` en botón toggle y backdrop overlay clicable con blur suave.

---

### `Footer` (`frontend/modules/landing/components/Footer.tsx`)
* **Propósito:** Cierre monumental institucional de la experiencia visual.
* **Estructura en 3 Capas:**
  1. **Lip Curvo Superior:** Radio `rounded-b-[32px]` / `rounded-b-[64px]` con fondo `#EAF8EE` que suaviza la transición con la sección anterior.
  2. **Sección CTA Monumental (`#3A0008`):** Cintas vectoriales cruzadas en borgoña oscuro `#4F000B`, titular gigante en `#F9A7B1` ("EL CRECIMIENTO NO OCURRE EN AISLAMIENTO") y botones duales de acción rápida.
  3. **Tarjeta de Recursos y Contacto (`#F9A7B1`):** Radio curvo superior de 64px, datos oficiales de mesa de partes, correo `admision@guamanpoma-unsch.edu.pe`, teléfono `(066) 312510`, enlaces institucionales, redes sociales en círculos `#F47788` y wordmark monumental en SVG inferior: `"FORJANDO NUESTRO PROPIO FUTURO"` (fontSize 178–196).

---

### `BbdButton` (`frontend/modules/landing/components/BbdButton.tsx`)
* **Propósito:** Botón institucional interactivo con animación bidireccional de flecha diagonal (microinteracción).
* **Variantes Implementadas:**
  * `purple` (Fondo borgoña `#8F1025`, texto `#FCE0E4`, círculo icono `#FCE0E4` con flecha `#8F1025`).
  * `white` (Fondo blanco `#FFFFFF`, texto `#290006`, círculo icono `#C32942`).
  * `orange` (Fondo blanco, texto `#54230C`, círculo icono `#ED7B32`).
  * `green` (Fondo verde `#32965C`, texto `#EAF8EE`, círculo icono `#EAF8EE`).
* **Estados y Transición:**
  * Estado normal: El círculo derecho está visible (`scale(1)`), el izquierdo oculto (`scale(0)`).
  * Hover: El círculo derecho desaparece y el círculo izquierdo emerge con traslación suave (`0.55s ease`), mientras el texto se desplaza `36px` hacia la derecha.

---

## 2. Componentes de Secciones del Home (`/`)

| Componente | Archivo | Características y Tokens Destacados |
| :--- | :--- | :--- |
| **`HeroSection`** | `HeroSection.tsx` | Cabecera a pantalla completa con efecto parallax de escala suave (1 a 0.915) y curvatura dinámica en bordes inferiores según scroll. Titular display en 2 líneas, imagen `/hero-pabellon.webp` con gradiente atmosférico y pills duales (`#C32942` y `#FFF5DC`). |
| **`BentoSection`** | `BentoSection.tsx` | Grid Bento de 2 columnas asimétricas (`545fr : 727fr`). Tarjeta 1 en rosa borgoña `#F9A7B1` con comillas monumentales SVG (233x144) y cita del Director General; Tarjeta 2 en azul académico `#5099D5` con 3 folletos del Plan Institucional en perspectiva isométrica fanned (`rotate -16deg`, `skewX 12deg`). |
| **`AmbitionSection`** | `AmbitionSection.tsx` | Banner institucional superior borgoña `#4F000B` ("CONOCE NUESTROS MARCOS FORMATIVOS") con 4 botones de nivel, seguido de grid de 6 tarjetas fotográficas con gradientes cromáticos por área formativa (Ciencia `#103354`, Deporte `#3A0008`, Cultura `#803711`). |
| **`FocusDriversSection`** | `FocusDriversSection.tsx` | Acordeón horizontal interactivo de 4 conductores de enfoque: CULTURA (`#4F000B`), TALENTO (`#5099D5`), CIENCIA (`#ED7B32`) y FUTURO. Transición fluida al expandir la columna activa con imágenes de estudiantes reales. |
| **`GameChangersSection`** | `GameChangersSection.tsx` | Lista interactiva de los 7 Grandes Cambios Institucionales: Complejo de 4 Losas techadas, Laboratorios UNSCH, Nivel Inicial, Primaria, Secundaria y Plataforma Intranet 2026. Selección y vista previa de imagen en tiempo real. |
| **`DeliveryThemesSection`**| `DeliveryThemesSection.tsx`| Layout de 2 columnas: columna izquierda pegajosa (sticky top-28) con titular "NUESTROS 3 EJES DE EJECUCIÓN", columna derecha con tarjetas apiladas: PERSONAS (`#C32942`), PROPÓSITO (`#17466F`) y LUGAR. |
| **`StrengthsStatsSection`** | `StrengthsStatsSection.tsx` | Módulo de estadísticas prioritarias con barras de progreso métricas, números gigantes (`62 años`, `100% UNSCH`) y reproductor de video institucional de soporte. |

---

## 3. Componentes de Páginas Interiores

* **`AdmisionPage` (`app/(landing)/admision/page.tsx`):**
  * Itinerario de 4 pasos para vacantes 2027.
  * Formulario reactivo de pre-inscripción con validación, selector de nivel y generación de código de confirmación.
  * Acordeón de FAQs con toggle individual y rotación de chevron a 180°.
* **`NivelesPage` (`app/(landing)/niveles/page.tsx`):**
  * Selector de pestañas dinámicas (Inicial, Primaria, Secundaria) con mallas curriculares diferenciadas y horarios oficiales.
* **`ContactoPage` (`app/(landing)/contacto/page.tsx`):**
  * 4 tarjetas de canales institucionales (Sede, Central, Correos, Horario) y formulario de mesa de partes con ticket generado.
* **`NoticiasPage` (`app/(landing)/noticias/page.tsx`):**
  * Buscador en tiempo real por término clave, selector de tags y modal de lectura expandida (`AnimatePresence`).
* **`TestimoniosPage` (`app/(landing)/testimonios/page.tsx`):**
  * Filtrado por categoría (exalumnos, padres, catedráticos) con citas formateadas y perfil curricular.
