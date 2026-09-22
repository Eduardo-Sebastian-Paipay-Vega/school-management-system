<div align="center">

# Sistema de Información Integral de Gestión Administrativa

### Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH

[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter&logoColor=white)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.x-0175C2?logo=dart&logoColor=white)](https://dart.dev)
[![License: MIT](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)
[![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)]()

</div>

---

## Descripción

Sistema de información integral orientado a la **gestión administrativa** y plataforma de **difusión digital** para los Planteles de Aplicación "Guamán Poma de Ayala" de la Universidad Nacional de San Cristóbal de Huamanga (UNSCH).

Este proyecto se desarrolla en el marco del **Servicio Social Universitario (IS-480)** durante el Semestre Académico **2026-II**, con una duración de **16 semanas académicas** (96 horas por persona).

---

## Objetivo

Reducir la brecha digital y modernizar los procesos administrativos de la institución educativa mediante la implementación de una solución tecnológica integral que:

- Centralice la gestión administrativa en una plataforma única.
- Digitalice procesos que actualmente se realizan de forma manual.
- Mejore la comunicación institucional a través de una plataforma de difusión digital.
- Capacite al personal en el uso eficiente de herramientas tecnológicas.

---

## Funcionalidades y Módulos del Sistema (71 Requisitos)

El sistema integra **13 módulos funcionales** con un total de **71 requerimientos normativos formalizados**, incorporando capacidades de innovación operativa y pedagógica de alto impacto:

1. 🔐 **Módulo 1: Acceso, Autenticación JWT y RBAC** (`RF-01` al `RF-04`)
2. 👥 **Módulo 2: Administración de Usuarios y Directorio** (`RF-05` al `RF-09`)
3. 🏫 **Módulo 3: Configuración Escolar, Periodos y Escalas** (`RF-10` al `RF-14`)
4. 📚 **Módulo 4: Gestión Académica, Matrícula y Carga Lectiva** (`RF-15` al `RF-19`)
5. ⏱️ **Módulo 5: Asistencia Estudiantil, Kiosco Offline-First, App Rápida y Carnés QR** (`RF-20` al `RF-27`) — *[Innovación 1, 2 y 3]*
6. 🎓 **Módulo 6: Asistencia y Cómputo de Horas de Practicantes** (`RF-28` al `RF-31`)
7. 👨‍🏫 **Módulo 7: Horas de Docentes Contratados y Reprogramación** (`RF-32` al `RF-35`)
8. 📊 **Módulo 8: Calificaciones en Tiempo Real, Modo Excel, Auto-Guardado y Conversión CNEB** (`RF-36` al `RF-46`) — *[Innovación 4, 5, 6 y 7]*
9. 🗺️ **Módulo 9: Mapas de Calor con Navegación Drill-Down** (`RF-47` al `RF-51`) — *[Innovación 8]*
10. 📈 **Módulo 10: Dashboards, Ficha 360° del Alumno y Métricas SSU IS-480** (`RF-52` al `RF-58`) — *[Innovación 9 y 10]*
11. 📑 **Módulo 11: Emisión de Reportes y Verificación Criptográfica QR** (`RF-59` al `RF-64`) — *[Innovación 11]*
12. 🛡️ **Módulo 12: Trazabilidad, Auditoría y Protección de Datos (Ley 29733)** (`RF-65` al `RF-68`)
13. 🌐 **Módulo 13: Plataforma de Difusión Digital y Portal Institucional** (`RF-69` al `RF-71`)

---

## Innovaciones Estratégicas del Sistema

| # | Innovación | Módulo Relacionado | Valor para la Institución |
|:---:|---|:---:|---|
| 1 | **Kiosco de Portería Offline-First** | Módulo 5 (`RF-25`) | Registro de ingreso de alumnos sin caídas ante cortes de internet (buffer local IndexedDB con sync automática). |
| 2 | **Emisión de Carnés Escolares con QR** | Módulo 5 (`RF-26`) | Carnés imprimibles en PDF A4 con código QR institucional de lectura instantánea. |
| 3 | **Toma Rápida de Asistencia Móvil (WebSockets)** | Módulo 5 (`RF-27`) | Marcación táctil ágil en aula en 1 toque con difusión en tiempo real a dirección (< 500 ms). |
| 4 | **Planilla Rápida de Notas (Modo Excel)** | Módulo 8 (`RF-38`) | Interfaz ultra-rápida con flechas de teclado, Tab, Enter y pegado matricial masivo desde hojas de cálculo. |
| 5 | **Asistente de Conclusiones CNEB/MINEDU** | Módulo 8 (`RF-39`) | Banco taxonómico de retroalimentación pedagógica contextual según nivel de logro (AD, A, B, C). |
| 6 | **Auto-Guardado Conectado en Segundo Plano** | Módulo 8 (`RF-45`) | Registro transparente con debounce de 400 ms, sin bloqueos de pantalla ni pérdida de datos. |
| 7 | **Motor de Conversión Dual (0-20 a Literal CNEB)**| Módulo 8 (`RF-46`) | Conversión automática de notas vigesimales a letras (AD, A, B, C) oficial MINEDU con persistencia dual. |
| 8 | **Mapas de Calor con Navegación Drill-Down** | Módulo 9 (`RF-49`) | Análisis jerárquico interactivo por clics (Plantel -> Nivel -> Grado -> Sección -> Estudiante). |
| 9 | **Ficha Escolar Integral 360° del Estudiante** | Módulo 10 (`RF-56`) | Perfil unificado con kardex de notas, asistencia, inasistencias y alertas tempranas en un solo clic. |
| 10 | **Dashboard de Impacto Social SSU IS-480** | Módulo 10 (`RF-57`) | Monitoreo de KPIs de brecha digital, adopción y horas de servicio social universitario. |
| 11 | **Verificación Documental Criptográfica SHA-256 + QR** | Módulo 11 (`RF-60`) | Boletas y reportes inalterables verificables desde cualquier celular sin inicio de sesión. |

---

## Arquitectura

El proyecto sigue una arquitectura modular desarrollada con **Flutter** para garantizar compatibilidad multiplataforma (Android, iOS, Web, Desktop) y resiliencia offline.

```
┌──────────────────────────────────────────────┐
│              CAPA DE PRESENTACIÓN            │
│       Flutter Web (Material Design 3)        │
├──────────────────────────────────────────────┤
│              CAPA DE NEGOCIO                 │
│    APIs RESTful + WebSockets + Offline Buffer│
├──────────────────────────────────────────────┤
│              CAPA DE DATOS                   │
│   PostgreSQL Multi-Tenant + Redis + IndexedDB│
├──────────────────────────────────────────────┤
│            INFRAESTRUCTURA                   │
│       VPS Cloud + Dominio + SSL HTTPS        │
└──────────────────────────────────────────────┘
```

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| **Frontend** | Flutter 3.x, Dart 3.x, Material Design 3, Hive / IndexedDB (Offline-First) |
| **Backend** | Node.js / Python (APIs RESTful con arquitectura limpia) |
| **Tiempo Real** | WebSockets / Server-Sent Events (SSE) |
| **Base de Datos** | PostgreSQL (Aislamiento Multi-Tenant por `tenant_id`) |
| **Caché & Sesiones** | Redis |
| **Infraestructura** | VPS Cloud, Dominio institucional, Certificados SSL (HTTPS) |
| **Control de Versiones** | Git + GitHub |
| **Metodología** | Scrum (Sprints semanales) |

---

## Estructura del Proyecto

```text
school-management-system/
├── .agents/                    # Reglas, skills y plantilla canónica SDD (IEEE 1016)
│   ├── rules/sdd_rules.md      # Reglas técnicas de arquitectura y diseño
│   └── skills/sdd-authoring/   # Skill para elaboración paso a paso de SDDs
├── AGENTS.md                   # Directivas y reglas obligatorias para agentes de IA
├── lib/                        # Código fuente modular (Clean Architecture Feature-First)
│   ├── main.dart               # Shell de navegación interactivo por Squads
│   ├── core/                   # Módulos transversales compartidos
│   │   ├── constants/          # Constantes globales, URLs base de API y metadatos
│   │   ├── theme/              # Paleta oficial (Verde Guamán Poma, Azul UNSCH, escala CNEB)
│   │   └── widgets/            # Tarjetas de squad y componentes reutilizables
│   └── features/               # Módulos independientes asignados a los 5 Squads
│       ├── squad_1_core_seguridad/        # Brandon Montero (JWT, RBAC, Auditoría)
│       ├── squad_2_matricula_asistencia/  # Sebastian Paipay (Kiosco Offline, QR)
│       ├── squad_3_calificaciones/        # Steve Ovalle (Modo Excel, CNEB 400ms)
│       ├── squad_4_analitica_dashboards/  # Aracely Rodríguez (Drill-Down, Ficha 360°)
│       └── squad_5_secretaria_portal/     # Cesar Leon (Libretas PDF, QR Público)
├── web/                        # Configuración Web PWA (Metadatos y Branding Oficial)
├── test/                       # Batería de pruebas unitarias y de widgets
├── D - Base 1 - 01092026/     # Documentación técnica, RFs, CUs y Arquitectura
│   └── Fase 2/
│       ├── Requisitos Funcionales/ # 71 RFs organizados por Squad
│       ├── Casos de uso/           # 71 CUs organizados por Squad
│       └── Arquitectura/           # SAD maestro, DDLs, APIs y SDDs
├── pubspec.yaml                # Dependencias del proyecto
└── README.md                   # Este archivo
```

---

## ⚡ Guía de Inicio Rápido (Quick Start Dev)

### 1. Iniciar el Servidor de Desarrollo (Equivalente a `npm run dev`)

Para ejecutar la aplicación localmente y ver los cambios en vivo en el navegador o en el escritorio:

```bash
# Iniciar en Google Chrome (Modo Web con Hot Reload) — RECOMENDADO
flutter run -d chrome

# Iniciar en Chrome fijando un puerto específico (ej. 3000)
flutter run -d chrome --web-port 3000

# Iniciar en Microsoft Edge
flutter run -d edge

# Iniciar como aplicación de escritorio nativa de Windows (.exe)
flutter run -d windows
```

> 💡 **Con 1 Clic desde el Editor:** Puedes presionar la tecla **`F5`** (o *Run > Start Debugging*) en VS Code, Cursor o Antigravity IDE para lanzar la aplicación automáticamente.

---

### 2. Atajos de Desarrollo en Tiempo Real (Mientras corre la App)

Mientras el comando `flutter run` se encuentra activo en tu terminal:

| Tecla | Acción | ¿Para qué sirve? |
|:---:|---|---|
| **`r`** | **Hot Reload** | Aplica cambios visuales instantáneamente (< 1 seg) sin reiniciar la app ni perder el estado. |
| **`R`** | **Hot Restart** | Reinicia la aplicación por completo recargando todos los estados. |
| **`h`** | **Help** | Muestra la lista completa de comandos de depuración disponibles. |
| **`q`** | **Quit** | Detiene el servidor de desarrollo y cierra la aplicación. |

---

### 3. Instalación Inicial desde Cero

```bash
# 1. Clonar el repositorio
git clone https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system.git

# 2. Acceder al directorio
cd school-management-system

# 3. Descargar dependencias de Flutter
flutter pub get

# 4. Verificar estado de herramientas
flutter doctor

# 5. Ejecutar la app
flutter run -d chrome
```

---

## 🌿 Estrategia de Ramas Git (GitFlow Ligero)

Para coordinar el trabajo paralelo de los **5 Squads Técnicos** sin generar conflictos ni romper la estabilidad del sistema, seguimos la siguiente política de ramas:

| Rama | Propósito | Regla de Oro |
|---|---|---|
| **`main`** | **Producción / Hitos Oficiales** | Solo código 100% probado y estable. Es la versión para sustentaciones y despliegue. **Prohibido push directo.** |
| **`dev`** | **Integración Continua** | Punto de encuentro de los 5 squads. Todos los desarrollos se integran aquí antes de pasar a `main`. |
| **`feature/squad-[X]-[nombre]`** | **Nuevas Funcionalidades** | Ramas temporales creadas desde `dev` para cada requerimiento funcional (RF). |

### Flujo de Trabajo para Desarrolladores

```bash
# 1. Asegurarse de estar en 'dev' y tener lo último
git checkout dev
git pull origin dev

# 2. Crear una rama para tu funcionalidad (ejemplo Squad 2)
git checkout -b feature/squad-2-kiosco-qr

# 3. Desarrollar, probar y commitear cambios
git add .
git commit -m "feat(squad-2): implementar lectura de qr para kiosco (RF-22)"

# 4. Subir la rama a GitHub
git push -u origin feature/squad-2-kiosco-qr

# 5. Abrir un Pull Request (PR) en GitHub con destino hacia la rama 'dev'
```

---

## 🧪 Pruebas de Calidad y Verificación (QA)

Antes de realizar cualquier commit o pull request, el código debe pasar limpiamente:

```bash
# 1. Análisis estático de código (0 errores, 0 warnings requeridos)
flutter analyze

# 2. Ejecutar todas las pruebas automáticas
flutter test

# 3. Limpiar caché en caso de inconsistencias
flutter clean && flutter pub get
```

---

## 📐 Documentos de Diseño de Software (SDD - IEEE 1016)

Cada uno de los 5 Squads cuenta con herramientas estandarizadas para elaborar su diseño técnico:

* 📖 **[Guía Rápida: ¿Cómo y Dónde se elabora el SDD?](D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/GUIA_RAPIDA_SDD.md)**
* 📋 **[Plantilla Canónica SDD (IEEE 1016)](.agents/skills/sdd-authoring/resources/plantilla_sdd.md)**
* 🌟 **[Ejemplo Modelo Completo: SDD Squad 1](D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/sdd_squad_1.md)**
* 🛠️ **Skill para Asistentes de IA:** Ubicada en [`.agents/skills/sdd-authoring/SKILL.md`](.agents/skills/sdd-authoring/SKILL.md).

---

## Deployment

| Entorno | Descripción | Estado |
|---|---|---|
| **Desarrollo** | Local (Flutter SDK) | Activo |
| **Producción** | VPS Cloud con dominio y SSL | Pendiente (Semana 10) |

El despliegue a producción se realizará en la **Semana 10** del cronograma, incluyendo configuración de servidor VPS, dominio y certificados SSL.

---

## Metodología de Desarrollo

El proyecto se ejecuta en **4 fases** utilizando metodologías ágiles (Scrum):

| Fase | Semanas | Descripción |
|---|:---:|---|
| I. Diagnóstico y Formulación | 1 - 3 | Levantamiento de información, análisis de brecha digital, Project Charter. |
| II. Diseño y Desarrollo | 4 - 8 | Arquitectura, prototipado UI/UX, desarrollo Frontend y Backend. |
| III. Pruebas e Implementación | 9 - 11 | QA, corrección de bugs, despliegue en VPS (Go-Live). |
| IV. Capacitación y Cierre | 12 - 16 | Capacitación al personal, evaluación de impacto, sustentación final. |

> Para más detalle, consultar el [Plan de Trabajo completo](D%20-%20Base%201%20-%2001092026/plan_trabajo.md).

---

## KPIs del Proyecto

| Indicador | Meta |
|---|---|
| Tasa de Adopción | >= 80% del personal usando el sistema |
| Satisfacción del Usuario | Calificación promedio > 4/5 |
| Rendimiento del Sistema | Tiempo de respuesta < 2 segundos |
| Disponibilidad | Uptime 99% en horario escolar |
| Reducción de Tiempo | >= 40% menos en trámites administrativos |

---

## Equipo de Desarrollo

| Nombre | Rol | GitHub |
|---|---|---|
| Paipay Vega, Eduardo Sebastian | Líder de Proyecto | [@Eduardo-Sebastian-Paipay-Vega](https://github.com/Eduardo-Sebastian-Paipay-Vega) |
| Leon Reyna, Cesar Antonio | Desarrollador | [@cesarleon27-ai](https://github.com/cesarleon27-ai) |
| Montero Gutiérrez, Brandon Fernando | Desarrollador | [@brandonmontero27-g](https://github.com/brandonmontero27-g) |
| Ovalle Luyo, Steve Smith | Sub Líder | [@steveovalle27-lgtm](https://github.com/steveovalle27-lgtm) |
| Rodríguez Quispe, Grissel Arascely | Desarrolladora | [@Arascely](https://github.com/Arascely) |

**Institución Académica:** Universidad Nacional de San Cristóbal de Huamanga (UNSCH)
**Escuela Profesional:** Ingeniería de Sistemas (EPIS)
**Asignatura:** Servicio Social Universitario (IS-480)
**Periodo:** Semestre Académico 2026-II

---

## Documentación del Proyecto

| Fase / Artefacto | Descripción | Enlace |
|---|---|---|
| **Plan de Trabajo** | Programación completa de 16 semanas con artefactos, KPIs y entregables SSU. | [plan_trabajo.md](file:///e:/zapata%202026%20-%20II/school-management-system/D%20-%20Base%201%20-%2001092026/plan_trabajo.md) |
| **Fase 1: Requerimientos de Usuario** | Especificación no técnica de necesidades para los 71 requerimientos y 13 módulos. | [requerimientos_funcionales.md](file:///e:/zapata%202026%20-%20II/school-management-system/D%20-%20Base%201%20-%2001092026/Fase%201/Requerimientos/requerimientos_funcionales.md) |
| **Fase 2: Catálogo Documental IEEE 830** | Especificación formal y normativa de requisitos (`RF-01` al `RF-71`) con flujos y aceptación. | [requisitos_funcionales.md](file:///e:/zapata%202026%20-%20II/school-management-system/D%20-%20Base%201%20-%2001092026/Fase%202/Requisitos%20Funcionales/requisitos_funcionales.md) |
| **Fase 2: SRS Técnico de Arquitectura** | Contratos de API REST, controladores Flutter, consultas PostgreSQL, Redis y WebSockets. | [requisitos_funcionales_tecnicos.md](file:///e:/zapata%202026%20-%20II/school-management-system/D%20-%20Base%201%20-%2001092026/Fase%202/Requisitos%20Funcionales/requisitos_funcionales_tecnicos.md) |
| **Manuales de Usuario y Admin** | Guías de operación para personal docente, portería y dirección. | Programado para Semana 12 |

---

## Contribución

Este repositorio tiene acceso restringido. Solo los miembros autorizados del equipo pueden realizar cambios.

### Flujo de trabajo

1. Crear una rama desde `main`:
   ```bash
   git checkout -b feature/nombre-de-la-funcionalidad
   ```
2. Realizar los cambios y hacer commit:
   ```bash
   git add .
   git commit -m "feat: descripción del cambio"
   ```
3. Subir la rama:
   ```bash
   git push origin feature/nombre-de-la-funcionalidad
   ```
4. Crear un **Pull Request** en GitHub hacia `main`.
5. Esperar la **aprobación** de al menos 1 miembro del equipo.
6. Hacer **merge** una vez aprobado.

### Convención de Commits

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de errores |
| `docs:` | Cambios en documentación |
| `style:` | Cambios de formato (sin afectar lógica) |
| `refactor:` | Reestructuración de código |
| `test:` | Agregar o modificar pruebas |
| `chore:` | Tareas de mantenimiento |

---

## Licencia

Este proyecto está licenciado bajo la **MIT License**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License - Copyright (c) 2026 Eduardo Sebastian Paipay Vega
```
