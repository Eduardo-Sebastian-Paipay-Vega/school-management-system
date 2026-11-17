# Informe de Auditoría y Aplicación de Diseño del Landing (AUDIT.md)

**Proyecto:** Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)  
**Fecha:** 2026-11-16  
**Fase:** `/landing-aplicar` (Landing Design Guardian v1.0)  
**Ruta de Referencia:** `/` (`frontend/app/(landing)/page.tsx`)  
**Páginas Auditadas y Uniformizadas:** 8 rutas públicas autorizadas + Acceso Institucional (`/login`)  

---

## 1. Despeje de Cabecera Flotante (Solución al Solapamiento)

* **Problema Auditado (Evidencia Usuario):** La barra de navegación flotante (`fixed top-0`, altura ~100px) solapaba los breadcrumbs ("Inicio > ...") y badges superiores en subpáginas debido a un padding insuficiente (`py-20` = 80px).
* **Solución Implementada:** Se aplicó la **Regla de Despeje Canónico** (`pt-36 sm:pt-40 lg:pt-44 pb-20`), asegurando entre 44px y 64px de respiro limpio debajo de la barra en todas las resoluciones.
* **Estado:** **RESUELTO (PASS)** en las 7 subpáginas: `/admision`, `/contacto`, `/niveles`, `/noticias`, `/por-que-elegirnos`, `/servicios`, `/testimonios`.

---

## 2. Cobertura de Rutas y Botones en la Cabecera (`Navbar.tsx`)

* **Problema Auditado:** La barra solo exponía anclas internas de la Home (`#regen`, `#ambition`, `#focus`) en lugar de las rutas completas del colegio.
* **Solución Implementada:**
  * **Barra Principal (Desktop):** Expone las rutas institucionales reales: `Inicio` (`/`), `Propuesta` (`/por-que-elegirnos`), `Niveles` (`/niveles`), `Servicios` (`/servicios`), `Noticias` (`/noticias`), `Testimonios` (`/testimonios`), `Contacto` (`/contacto`), `Intranet` (`/login`), más el botón de acción principal `Admisión 2027` (`/admision`).
  * **Drawer Desplegable (Móvil / Tablet / Desktop):** Contiene la lista monumental display con todas las 9 rutas del portal, tarjeta institucional del Plan 2027 y 4 botones de acción rápida (`Admisión 2027`, `Mesa de Partes`, `Ver el plan`, `Acceso Intranet`).
* **Estado:** **RESUELTO (PASS)**. Todas las rutas y botones son 100% funcionales.

---

## 3. Extensión del Diseño al 100% en Acceso Institucional (`/login`)

* **Problema Auditado:** La pantalla de login no utilizaba la identidad cromática institucional borgoña, empleaba un fondo frío gris (`bg-slate-50`), etiquetas `<img>` no optimizadas y tipografías desvinculadas.
* **Solución Implementada:**
  * Layout unificado con fondo de papel marfil (`#FFFCF8`), texto `#291719` y selección borgoña `#8F1025`.
  * Cabecera institucional con `Image` de Next.js, emblema UNSCH y tipografía display `Roboto Condensed`.
  * Formulario `LoginForm.tsx` con títulos `bbd-font-display`, inputs con foco borgoña (`focus:border-[#4F000B] focus:ring-[#8F1025]/20`), botón de validación en borgoña institucional y enlace de retorno al Portal Web.
* **Estado:** **RESUELTO (PASS)**.
