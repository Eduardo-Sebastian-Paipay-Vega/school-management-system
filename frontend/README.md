# Frontend Principal — Sistema de Gestión Escolar
### Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)
**Servicio Social Universitario IS-480 (2026-II)**

Frontend modular de última generación desarrollado en **Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS**, concebido para unificar la presencia pública institucional y el acceso centralizado a los módulos operativos de los 5 squads técnicos.

---

## 🏛️ Arquitectura Modular

La aplicación desacopla la presentación de la lógica de negocio organizándose en módulos independientes:

```text
frontend/
├── modules/
│   ├── landing/                   # Módulo 1: Portal Web Público Institucional (RF-71)
│   │   ├── components/            # Navbar, Footer, Home, Secciones
│   │   └── index.ts
│   ├── intranet/                  # Módulo 2: Hub Central y Autenticación RBAC
│   │   ├── components/            # LoginForm, IntranetHub
│   │   ├── types.ts               # Sesiones, roles (Estudiante, Docente, Administrativo)
│   │   └── index.ts
│   ├── squads/                    # Módulos especializados por Squad
│   │   ├── squad_1_core/          # Identidad, RBAC y Auditoría Ley 29733
│   │   ├── squad_2_asistencia/    # Kiosco Offline-First y lector QR portería (<200ms)
│   │   ├── squad_3_calificaciones/# Planilla Modo Excel 60 FPS (Debounce 400ms, CNEB)
│   │   ├── squad_4_analitica/     # Ficha 360°, Mapas de Calor y Alerta Temprana
│   │   ├── squad_5_secretaria/    # Emisión de Libretas PDF y Verificador QR SHA-256
│   │   └── index.ts
│   └── shared/                    # Utilidades y tokens transversales
├── app/
│   ├── (landing)/                 # Grupo de rutas públicas (con layout institucional)
│   │   ├── layout.tsx             # Shell con Navbar + Footer
│   │   ├── page.tsx               # Portada principal
│   │   ├── admision/              # Proceso de admisión 2027
│   │   ├── contacto/              # Mesa de partes y contacto
│   │   ├── niveles/               # Inicial, Primaria, Secundaria
│   │   ├── noticias/              # Comunicados oficiales
│   │   ├── por-que-elegirnos/     # Pilares educativos UNSCH
│   │   ├── servicios/             # Laboratorios, losas y bibliotecas
│   │   └── testimonios/           # Comunidad educativa
│   ├── (intranet)/                # Grupo de rutas de intranet y gestión escolar
│   │   ├── layout.tsx             # Shell seguro con barra institucional
│   │   └── intranet/              # Rutas de gestión
│   │       ├── page.tsx           # Hub de acceso / Login
│   │       ├── calificaciones/    # Planilla Squad 3
│   │       ├── asistencia/        # Kiosco Squad 2
│   │       ├── usuarios/          # Squad 1
│   │       ├── analitica/         # Squad 4
│   │       └── libretas/          # Squad 5
│   ├── layout.tsx                 # Root layout (HTML, Body, Metadata, CSS)
│   └── globals.css                # Variables de diseño y tokens UNSCH
└── public/                        # Activos estáticos oficiales (Escudo UNSCH, Pabellón)
```

---

## 🚀 Puesta en Marcha

```bash
cd frontend
npm install
npm run dev
```

* **Portal Público:** [http://localhost:3000](http://localhost:3000)
* **Intranet / Hub de Squads:** [http://localhost:3000/intranet](http://localhost:3000/intranet)
* **Planilla Calificaciones (Squad 3):** [http://localhost:3000/intranet/calificaciones](http://localhost:3000/intranet/calificaciones)
* **Kiosco de Asistencia (Squad 2):** [http://localhost:3000/intranet/asistencia](http://localhost:3000/intranet/asistencia)

Para compilar la versión de producción:
```bash
npm run build
npm run start
```
