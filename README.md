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

## Funcionalidades

- **Gestión Administrativa** — Módulos para la administración integral de la institución.
- **Plataforma de Difusión** — Canal digital para comunicación institucional.
- **Dashboard Analítico** — Panel de métricas e indicadores clave (KPIs).
- **Gestión de Usuarios** — Control de acceso basado en roles (Administrador / Usuario).
- **Reportes** — Generación de informes y métricas de uso.

---

## Arquitectura

El proyecto sigue una arquitectura modular desarrollada con **Flutter** para garantizar compatibilidad multiplataforma (Android, iOS, Web, Desktop).

```
┌──────────────────────────────────────────────┐
│              CAPA DE PRESENTACIÓN            │
│         Flutter (Material Design 3)          │
├──────────────────────────────────────────────┤
│              CAPA DE NEGOCIO                 │
│        Lógica de negocio + APIs              │
├──────────────────────────────────────────────┤
│            CAPA DE DATOS                     │
│      Base de Datos + Servicios Cloud         │
├──────────────────────────────────────────────┤
│            INFRAESTRUCTURA                   │
│     VPS Cloud + Dominio + SSL                │
└──────────────────────────────────────────────┘
```

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| **Frontend** | Flutter 3.x, Dart 3.x, Material Design 3 |
| **Backend** | Por definir (APIs RESTful) |
| **Base de Datos** | Por definir |
| **Infraestructura** | VPS Cloud, Dominio con SSL |
| **Control de Versiones** | Git + GitHub |
| **Metodología** | Scrum (Sprints semanales) |

---

## Estructura del Proyecto

```
school-management-system/
├── android/                    # Configuración Android
├── ios/                        # Configuración iOS
├── lib/                        # Código fuente principal (Dart/Flutter)
│   └── main.dart               # Punto de entrada de la aplicación
├── linux/                      # Configuración Linux
├── macos/                      # Configuración macOS
├── web/                        # Configuración Web
├── windows/                    # Configuración Windows
├── test/                       # Pruebas unitarias y de integración
├── D - Base 1 - 01092026/     # Documentación del proyecto
│   └── plan_trabajo.md         # Plan de trabajo y gestión (16 semanas)
├── pubspec.yaml                # Dependencias del proyecto
├── analysis_options.yaml       # Reglas de análisis estático
├── LICENSE                     # Licencia MIT
└── README.md                   # Este archivo
```

---

## Instalación

### Requisitos previos

- [Flutter SDK](https://docs.flutter.dev/get-started/install) >= 3.9.2
- [Dart SDK](https://dart.dev/get-dart) >= 3.9.2
- [Git](https://git-scm.com/)
- Un editor: [VS Code](https://code.visualstudio.com/), [Android Studio](https://developer.android.com/studio) o [Antigravity IDE](https://antigravity.dev)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system.git

# 2. Acceder al directorio
cd school-management-system

# 3. Instalar dependencias
flutter pub get

# 4. Verificar el entorno
flutter doctor

# 5. Ejecutar la aplicación
flutter run
```

### Ejecutar en plataformas específicas

```bash
# Android
flutter run -d android

# iOS (requiere macOS)
flutter run -d ios

# Web
flutter run -d chrome

# Windows
flutter run -d windows

# Linux
flutter run -d linux
```

---

## Testing

```bash
# Ejecutar todas las pruebas
flutter test

# Ejecutar pruebas con cobertura
flutter test --coverage

# Analizar código estático
flutter analyze
```

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
| Ovalle Luyo, Steve Smith | Desarrollador | [@steveovalle27-lgtm](https://github.com/steveovalle27-lgtm) |
| Rodríguez Quispe, Grissel Arascely | Desarrolladora | [@Arascely](https://github.com/Arascely) |

**Institución Académica:** Universidad Nacional de San Cristóbal de Huamanga (UNSCH)
**Escuela Profesional:** Ingeniería de Sistemas (EPIS)
**Asignatura:** Servicio Social Universitario (IS-480)
**Periodo:** Semestre Académico 2026-II

---

## Documentación

| Documento | Descripción | Enlace |
|---|---|---|
| Plan de Trabajo | Programación completa de 16 semanas con artefactos y entregables. | [plan_trabajo.md](D%20-%20Base%201%20-%2001092026/plan_trabajo.md) |
| SRS | Especificación de Requisitos del Software. | Pendiente (Semana 4) |
| Manuales | Manual de Administrador y Manual de Usuario. | Pendiente (Semana 12) |

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
