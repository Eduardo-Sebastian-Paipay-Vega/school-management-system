# Informe de Verificación de Rutas Públicas (Landing)

**Fecha:** 2026-11-16  
**Proyecto:** Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)  
**Herramienta:** Landing Design Guardian (`/landing-verificar` / `/landing-aplicar`)  
**Compilador:** Next.js 15.5.28 (Turbopack / Webpack)  
**Veredicto General:** **APROBADO** (Todas las rutas compilan limpiamente como páginas estáticas SSG sin errores de tipo ni advertencias en el landing).

---

## 1. Inventario y Estado de Compilación Post-Aplicación

| Ruta | Archivo Fuente | Estado Build (SSG) | Tamaño JS | First Load JS | Estado General |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `/` | `frontend/app/(landing)/page.tsx` | PASS (Static) | 10.6 kB | 131 kB | APROBADO |
| `/niveles` | `frontend/app/(landing)/niveles/page.tsx` | PASS (Static) | 5.06 kB | 164 kB | APROBADO |
| `/admision` | `frontend/app/(landing)/admision/page.tsx` | PASS (Static) | 5.60 kB | 126 kB | APROBADO |
| `/servicios` | `frontend/app/(landing)/servicios/page.tsx` | PASS (Static) | 5.69 kB | 156 kB | APROBADO |
| `/por-que-elegirnos` | `frontend/app/(landing)/por-que-elegirnos/page.tsx` | PASS (Static) | 5.39 kB | 156 kB | APROBADO |
| `/noticias` | `frontend/app/(landing)/noticias/page.tsx` | PASS (Static) | 7.72 kB | 167 kB | APROBADO |
| `/testimonios` | `frontend/app/(landing)/testimonios/page.tsx` | PASS (Static) | 5.48 kB | 170 kB | APROBADO |
| `/contacto` | `frontend/app/(landing)/contacto/page.tsx` | PASS (Static) | 5.12 kB | 111 kB | APROBADO |

---

## 2. Verificación de Uniformidad Visual

1. **Tipografía Display Unificada:** Los hero headers de las 8 rutas ahora utilizan `Roboto Condensed` (`bbd-font-display`) con jerarquía y espaciado consistente.
2. **Lienzo Institucional Continuo:** Todas las subpáginas adoptaron el fondo cálido `#FFFCF8` (`--bbd-paper-lightest`) de la identidad institucional borgoña.
3. **Cero Advertencias en Landing:** Depuradas 35+ advertencias de imports no utilizados en las subpáginas públicas.
4. **Protección de Alcance (Guard Check):** Modificaciones restringidas estrictamente a `frontend/app/(landing)/`. El sistema interno de intranet y backend quedan 100% protegidos.
