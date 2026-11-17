# Informe de Auditoría y Aplicación de Diseño del Landing (AUDIT.md)

**Proyecto:** Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)  
**Fecha:** 2026-11-16  
**Fase:** `/landing-aplicar` (Landing Design Guardian v1.0)  
**Ruta de Referencia:** `/` (`frontend/app/(landing)/page.tsx`)  
**Páginas Auditadas y Uniformizadas:** 8 rutas públicas autorizadas + Acceso Institucional (`/login`)  

---

## 1. Resumen de Cambios Aplicados Iniciales (Uniformización)

Se aplicaron con éxito las correcciones visuales de uniformización en las 7 subpáginas públicas autorizadas dentro de `frontend/app/(landing)/`, respetando estrictamente la línea base del landing de referencia y el contrato de diseño.

| Ruta Pública | Archivo Fuente | Cambios Aplicados | Estado Post-Aplicar |
| :--- | :--- | :--- | :---: |
| **`/`** (Home) | `page.tsx` | Referencia visual intacta (sin modificaciones requeridas). | **PASS (Referencia)** |
| **`/niveles`** | `niveles/page.tsx` | H1 con `bbd-font-display`, fondo `bg-[#FFFCF8]`, 7 imports no usados removidos. | **RESUELTO (PASS)** |
| **`/admision`** | `admision/page.tsx` | H1 con `bbd-font-display`, fondo `bg-[#FFFCF8]`, 10 imports no usados removidos. | **RESUELTO (PASS)** |
| **`/servicios`** | `servicios/page.tsx` | H1 con `bbd-font-display`, fondo `bg-[#FFFCF8]`, import `Calendar` removido. | **RESUELTO (PASS)** |
| **`/por-que-elegirnos`** | `por-que-elegirnos/page.tsx` | H1 con `bbd-font-display`, fondo `bg-[#FFFCF8]`, 4 imports no usados removidos. | **RESUELTO (PASS)** |
| **`/noticias`** | `noticias/page.tsx` | H1 con `bbd-font-display`, fondo `bg-[#FFFCF8]`, 6 imports no usados removidos. | **RESUELTO (PASS)** |
| **`/testimonios`** | `testimonios/page.tsx` | H1 con `bbd-font-display`, fondo `bg-[#FFFCF8]`, 6 imports no usados removidos. | **RESUELTO (PASS)** |
| **`/contacto`** | `contacto/page.tsx` | H1 con `bbd-font-display`, fondo `bg-[#FFFCF8]`, 6 imports no usados removidos. | **RESUELTO (PASS)** |

---

## 2. Detalle de Mejoras por Categoría

### 2.1 Tipografía y Jerarquía Visual
* **Antes:** Los titulares `h1` de los hero headers utilizaban la fuente sans-serif genérica del sistema (`font-black tracking-[-0.03em]`).
* **Ahora:** Todos los `h1` incorporan la clase `.bbd-font-display` (`Roboto Condensed` 900, uppercase, `letter-spacing: -0.025em`), igualando la personalidad tipográfica de la Home.

### 2.2 Fondo de Lienzo Institucional (Paper Marfil)
* **Antes:** Las subpáginas utilizaban `bg-white`, rompiendo la calidez del fondo `#FFFCF8` (`--bbd-paper-lightest`) declarado en `LandingLayout`.
* **Ahora:** Todas las subpáginas usan `bg-[#FFFCF8]`, garantizando una transición cromática suave y continua.

### 2.3 Salud del Código y Compilación (Linter)
* **Antes:** 35+ advertencias de ESLint (`@typescript-eslint/no-unused-vars`) por íconos y utilidades no utilizados.
* **Ahora:** **0 advertencias** de linter en el grupo `frontend/app/(landing)/`. El build de Next.js compila al 100% como páginas estáticas (SSG 22/22).

---

## 3. Despeje de Cabecera Flotante (Solución al Solapamiento)

* **Problema Auditado (Evidencia Usuario):** La barra de navegación flotante (`fixed top-0`, altura ~100px) solapaba los breadcrumbs ("Inicio > ...") y badges superiores en subpáginas debido a un padding insuficiente (`py-20` = 80px).
* **Solución Implementada:** Se aplicó la **Regla de Despeje Canónico** (`pt-36 sm:pt-40 lg:pt-44 pb-20`), asegurando entre 44px y 64px de respiro limpio debajo de la barra en todas las resoluciones.
* **Estado:** **RESUELTO (PASS)** en las 7 subpáginas: `/admision`, `/contacto`, `/niveles`, `/noticias`, `/por-que-elegirnos`, `/servicios`, `/testimonios`.

---

## 4. Cobertura de Rutas y Botones en la Cabecera (`Navbar.tsx`)

* **Problema Auditado:** La barra solo exponía anclas internas de la Home (`#regen`, `#ambition`, `#focus`) en lugar de las rutas completas del colegio.
* **Solución Implementada:**
  * **Barra Principal (Desktop):** Expone las rutas institucionales reales: `Inicio` (`/`), `Propuesta` (`/por-que-elegirnos`), `Niveles` (`/niveles`), `Servicios` (`/servicios`), `Noticias` (`/noticias`), `Testimonios` (`/testimonios`), `Contacto` (`/contacto`), `Intranet` (`/login`), más el botón de acción principal `Admisión 2027` (`/admision`).
  * **Drawer Desplegable (Móvil / Tablet / Desktop):** Contiene la lista monumental display con todas las 9 rutas del portal, tarjeta institucional del Plan 2027 y 4 botones de acción rápida (`Admisión 2027`, `Mesa de Partes`, `Ver el plan`, `Acceso Intranet`).
* **Estado:** **RESUELTO (PASS)**. Todas las rutas y botones son 100% funcionales.

---

## 5. Extensión del Diseño al 100% en Acceso Institucional (`/login`)

* **Problema Auditado:** La pantalla de login no utilizaba la identidad cromática institucional borgoña, empleaba un fondo frío gris (`bg-slate-50`), etiquetas `<img>` no optimizadas y tipografías desvinculadas.
* **Solución Implementada:**
  * Layout unificado con fondo de papel marfil (`#FFFCF8`), texto `#291719` y selección borgoña `#8F1025`.
  * Cabecera institucional con `Image` de Next.js, emblema UNSCH y tipografía display `Roboto Condensed`.
  * Formulario `LoginForm.tsx` con títulos `bbd-font-display`, inputs con foco borgoña (`focus:border-[#4F000B] focus:ring-[#8F1025]/20`), botón de validación en borgoña institucional y enlace de retorno al Portal Web.
* **Estado:** **RESUELTO (PASS)**.
