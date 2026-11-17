# Inventario de Rutas y Páginas del Landing

**Proyecto:** Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)  
**Fecha de Recopilación:** 2026-11-16  
**Fase:** `/landing-recopilar` (Landing Design Guardian v1.0)  

---

## 1. Clasificación de Rutas del Repositorio

### A. Rutas Públicas (En Alcance - Marketing / Portal Institucional)

| Ruta Pública | Archivo Fuente | Propósito y Contenido | Layout y Componentes Principales |
| :--- | :--- | :--- | :--- |
| **`/`** (Home) | `frontend/app/(landing)/page.tsx` | Página principal de presentación institucional de los Planteles de Aplicación de la UNSCH. | `HeroSection`, `BentoSection`, `AmbitionSection`, `FocusDriversSection`, `GameChangersSection`, `DeliveryThemesSection`, `StrengthsStatsSection` |
| **`/niveles`** | `frontend/app/(landing)/niveles/page.tsx` | Oferta educativa detallada en 3 niveles: Inicial (3-5 años), Primaria (1°-6°) y Secundaria (1°-5°). | Tabs interactivos por nivel, directores, horarios, mallas curriculares, requisitos. |
| **`/admision`** | `frontend/app/(landing)/admision/page.tsx` | Convocatoria y proceso de matrícula oficial 2027. | Itinerario de 4 pasos, formulario de pre-inscripción interactivo, preguntas frecuentes (FAQ accordion). |
| **`/servicios`** | `frontend/app/(landing)/servicios/page.tsx` | Infraestructura, laboratorios universitarios UNSCH, complejo deportivo 2026 y círculos preuniversitarios. | Grid de servicios con badges institucionales y métricas de inversión. |
| **`/por-que-elegirnos`** | `frontend/app/(landing)/por-que-elegirnos/page.tsx` | Argumentos de valor institucional, acreditación universitaria y pilares pedagógicos al 2035. | Bento grid asimétrico con pilares de investigación, losas techadas y modelo pedagógico. |
| **`/noticias`** | `frontend/app/(landing)/noticias/page.tsx` | Comunicados oficiales, efemérides (62° aniversario), convenios e inauguraciones de obras. | Buscador, filtrado por categorías, tarjetas informativas con modal de lectura completa. |
| **`/testimonios`** | `frontend/app/(landing)/testimonios/page.tsx` | Voces de la comunidad educativa: egresados de éxito, docentes universitarios y familias guamampominas. | Filtros de categoría, citas destacadas, métricas de impacto de egresados. |
| **`/contacto`** | `frontend/app/(landing)/contacto/page.tsx` | Mesa de partes virtual, teléfonos, canales de atención ciudadana y ubicación de la sede colegial. | Grid de 4 canales de contacto, formulario de trámite documentario con generación de ticket (`MPV-2026-XXXXX`). |

---

### B. Rutas Internas y Privadas (Fuera de Alcance - Sistema Protegido)

| Ruta Protegida | Archivo Fuente | Justificación de Protección |
| :--- | :--- | :--- |
| **`/login`** | `frontend/app/(intranet)/login/page.tsx` | Acceso autenticado al sistema operativo escolar (Docentes, Administrativos, Directivos). |
| **`/intranet`** | `frontend/app/(intranet)/intranet/page.tsx` | Dashboard principal autenticado. |
| **`/intranet/asistencia`** | `frontend/app/(intranet)/intranet/asistencia/` | Módulo operativo del Squad 2 (Kiosco offline, sincronización). |
| **`/intranet/calificaciones`** | `frontend/app/(intranet)/intranet/calificaciones/` | Módulo operativo del Squad 3 (Planilla Modo Excel PrimeReact). |
| **`/intranet/analitica`** | `frontend/app/(intranet)/intranet/analitica/` | Módulo operativo del Squad 4 (Dashboards y gráficos analíticos). |
| **`/intranet/libretas`** | `frontend/app/(intranet)/intranet/libretas/` | Módulo operativo del Squad 5 (Generación y emisión de libretas PDF). |
| **`/intranet/usuarios`** | `frontend/app/(intranet)/intranet/usuarios/` | Módulo de administración de usuarios y RBAC (Squad 1). |
| **`/activar-cuenta`** | `frontend/app/(intranet)/activar-cuenta/page.tsx` | Flujo de seguridad y activación de credenciales. |
| **`/activar-apoderado`** | `frontend/app/(intranet)/activar-apoderado/page.tsx` | Flujo de enrolamiento seguro de familias. |
| **`/recuperar-clave`** | `frontend/app/(intranet)/recuperar-clave/page.tsx` | Recuperación de contraseñas. |
| **`/restablecer-clave`**| `frontend/app/(intranet)/restablecer-clave/page.tsx`| Restablecimiento de credenciales de acceso. |
| **`/api/*`** | `backend/src/` | Endpoints REST, GraphQL y lógica transaccional del backend. |

---

## 2. Allowlist y Protected Source Paths

### Allowed Source Paths (Autorizados para estilizado y uniformización)
* `frontend/app/(landing)/`
* `frontend/modules/landing/`

### Protected Source Paths (Estrictamente bloqueados ante cualquier edición visual automática)
* `backend/`
* `database/`
* `frontend/app/(intranet)/`
* `frontend/modules/squads/`
* `frontend/modules/shared/`

---

## 3. Acoplamiento e Interfaces Compartidas

1. **Tokens Globales:**
   * Definidos en `frontend/app/globals.css`.
   * El landing utiliza su propio namespace semántico (`.bbd-page`, `.bbd-*`, `--bbd-*`) que convive de forma no invasiva con los tokens globales del sistema escolar.
2. **Fuentes:**
   * Las fuentes `Roboto` y `Roboto Condensed` se aplican a nivel de `.bbd-page` y clases display, sin forzar la tipografía de las tablas y dashboards de la intranet.
3. **Componentes:**
   * `Navbar` y `Footer` son exclusivos del grupo `(landing)`. No se renderizan dentro de `(intranet)`.
