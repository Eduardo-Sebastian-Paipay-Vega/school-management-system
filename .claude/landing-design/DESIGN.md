# Contrato de Diseño Maestro del Landing (DESIGN.md)

**Institución:** Planteles de Aplicación "Guamán Poma de Ayala" — Universidad Nacional de San Cristóbal de Huamanga (UNSCH)  
**Versión:** 1.0.0 (Identidad Cromática Institucional Borgoña)  
**Documento Generado por:** `/landing-recopilar` (Landing Design Guardian)  
**Fecha:** 2026-11-16  

---

## 1. Filosofía y Regla de Oro

> [!IMPORTANT]
> **La implementación existente del landing es la única fuente de verdad visual.**  
> Este documento codifica con trazabilidad absoluta la arquitectura visual, cromática y de interacción construida en el portal público, garantizando que futuras adiciones o revisiones respeten rigurosamente los tokens oficiales sin contaminar los sistemas internos del colegio ni inventar elementos estéticos ajenos.

---

## 2. Jerarquía de Fuentes y Certeza

* **Nivel A (Medido y Verificado en Código y CSS):**
  * Paleta Borgoña Institucional (`#4F000B`, `#3A0008`, `#8F1025`, `#C32942`, `#F9A7B1`, `#FCE0E4`).
  * Tipografías y escala de encabezados: `Roboto Condensed 900` para Display/H1/H2 y `Roboto 300/400/500` para cuerpo de texto.
  * Componente Two-Step Nav (`Navbar.tsx`) con drawer borgoña `#3A0008` y animación cubic-bezier.
  * Botón interactivo de flecha dual (`BbdButton.tsx`) con 4 variantes de color.
  * Cierre monumental en 3 fases (`Footer.tsx`) con wordmark SVG inferior de gran formato.
* **Nivel B (Inferido por Patrones Repetidos):**
  * Curvas de border-radius institucional: `8px` para botones y controles, `14px` para pills, `16px` para tarjetas Bento estándar, `24px` para tarjetas elevadas, y `64px` para bordes de transición de sección.
* **Nivel C (No encontrado / No aplicable):**
  * No existen temas oscuros (`dark mode`) forzados en el landing público: la identidad es intencionalmente editorial, cálida y de alto contraste sobre fondo marfil (`#FFFCF8`).

---

## 3. Paleta Cromática Institucional

### 3.1 Familia Principal: Borgoña Institucional (UNSCH)
| Token | Código HEX | Rol Semántico | Certeza |
| :--- | :--- | :--- | :---: |
| `--bbd-pink-dark` | `#4F000B` | Color principal de la marca institucional UNSCH / Banners oficiales | Nivel A |
| `--bbd-pink-darker` | `#3A0008` | Titulares H1/H2, background del footer monumental y drawer del menú | Nivel A |
| `--bbd-pink-darkest` | `#290006` | Texto de lectura sobre fondos pasteles o tarjetas de acento | Nivel A |
| `--bbd-pink-normal` | `#8F1025` | Botón de acción principal (`variant="purple"`) y color de selección de texto | Nivel A |
| `--bbd-pink-light` | `#C32942` | Tarjeta "Personas", badges de efeméride y acentos de alto impacto | Nivel A |
| `--bbd-pink-lighter` | `#E64B63` | Resaltados de texto ("EL CRECIMIENTO") en llamadas a la acción | Nivel A |
| `--bbd-pink-lightest`| `#F47788` | Wordmark inferior vectorial y botones circulares de redes sociales | Nivel A |
| `--bbd-pink-pastel-1`| `#F9A7B1` | Tarjeta Bento de la Dirección General y tarjeta de contacto del footer | Nivel A |
| `--bbd-pink-pastel-2`| `#FCE0E4` | Pills de subtítulos y fondos suaves | Nivel A |

### 3.2 Superficie y Fondo (Paper Neutro)
| Token | Código HEX | Rol Semántico | Certeza |
| :--- | :--- | :--- | :---: |
| `--bbd-paper-lightest`| `#FFFCF8` | Fondo global de todas las páginas del landing (`.bbd-page`) | Nivel A |
| `--bbd-paper-light` | `#F5EBE8` | Indicador de fondo hover en enlaces de barra superior | Nivel A |
| `--bbd-paper-normal`| `#E8D8D4` | Bordes finos de tarjetas y botón toggle de navegación móvil | Nivel A |
| `--bbd-ink` | `#291719` | Texto neutro de alta legibilidad en barra superior y enlaces | Nivel A |
| `--bbd-shade-80` | `rgba(41,23,25,0.8)` | Color semántico de párrafos descriptivos y subtítulos | Nivel A |

### 3.3 Colores de Acompañamiento Temático
* **Azul Academia e Investigación (`#5099D5`, `#103354`, `#E7F3FC`):** Representa la articulación científica con la UNSCH y el plan de futuro.
* **Dorado Distinción (`#FFF5DC`, `#4A3008`, `#D49A22`):** Pills de excelencia académica y acreditación institucional.
* **Verde Crecimiento (`#32965C`, `#16432B`, `#EAF8EE`):** Ejes de desarrollo y sostenibilidad, aplicado en lip curvo superior del footer.
* **Naranja Innovación (`#ED7B32`, `#803711`, `#FFF0E5`):** Conductores de ciencia experimental y métricas de infraestructura.

---

## 4. Tipografía y Escalas

### 4.1 Familias Tipográficas
* **Display / Titulares:** `Roboto Condensed, Impact, sans-serif` (`font-weight: 900`, `letter-spacing: -0.025em`, `text-transform: uppercase`).
* **Lectura / Cuerpo:** `Roboto, Arial, sans-serif` (`font-weight: 300` para párrafos, `400` regular, `500` semibold en destacados).

### 4.2 Escala Responsive de Encabezados
* **`.bbd-h1`:**
  * Desktop (≥1280px): `104px` / line-height `1.00`
  * Laptop (≥1024px): `66.56px` / line-height `1.00`
  * Tablet (≥768px): `72px` / line-height `0.95`
  * Móvil (<768px): `48px` / line-height `0.92`
* **`.bbd-banner-h1`:**
  * Desktop (≥1280px): `64px` / line-height `1.20`
  * Laptop (≥1024px): `48px` / line-height `1.20`
  * Tablet (≥768px): `44px` / line-height `1.18`
  * Móvil (<768px): `32px` / line-height `1.15`

---

## 5. Patrones de Layout e Interacción

1. **Two-Step Nav:** Barra flotante fija con borde superior redondeado de 12px y drawer borgoña `#3A0008` con radio expandible de 24px al activarse.
2. **Bento Grid Asimétrico:** Proporción de `545fr` a `727fr` a 1440px con gap de 24px para crear dinamismo entre citas textuales y folletos 3D.
3. **Botón Interactivo BbdButton:** Microinteracción bidireccional donde la flecha derecha desaparece y emerge la izquierda con traslación simultánea del texto.
4. **Underline Animado:** Enlaces de texto con pseudo-elemento `::after` escalable (`transform: scaleX(1)`) de izquierda a derecha.
5. **Transiciones Curvas de Sección:** Separación entre bloques con bordes curvos cóncavos y convexos de 32px a 64px para eliminar cortes horizontales rígidos.

---

## 6. Blindaje de Alcance

Queda estrictamente prohibido:
* Alterar los tokens de color del dashboard o intranet (`PrimeReact Lara Theme`, fondos oscuros o barras de datos).
* Introducir dependencias pesadas de terceros cuando los componentes nativos en Tailwind y SVG resuelven el diseño.
* Modificar componentes de los Squads 1, 2, 3 o 4 sin una solicitud explícita de integración.
