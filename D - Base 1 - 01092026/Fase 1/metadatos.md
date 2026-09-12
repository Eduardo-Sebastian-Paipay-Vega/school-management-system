# Metadatos del Proyecto y Repositorio

Ficha técnica y metadatos integrales del proyecto y repositorio institucional.

---

## 1. Información General del Proyecto

| Parámetro | Valor / Descripción |
|---|---|
| **Nombre Oficial del Proyecto** | Implementación de un Sistema de Información Integral de Gestión Administrativa y Plataforma de Difusión Digital |
| **Nombre Corto / Identificador** | `school-management-system` |
| **Institución Beneficiaria** | Planteles de Aplicación "Guamán Poma de Ayala" |
| **Institución Académica** | Universidad Nacional de San Cristóbal de Huamanga (UNSCH) |
| **Facultad / Escuela** | Facultad de Ingeniería de Minas, Geología y Civil — Escuela Profesional de Ingeniería de Sistemas (EPIS) |
| **Asignatura** | Servicio Social Universitario (IS-480) |
| **Semestre Académico** | 2026-II |
| **Duración** | 16 Semanas Académicas (96 horas por integrante) |
| **Modalidad de Financiación** | Autofinanciado por el equipo ejecutor (Presupuesto estimado: S/ 1,000.00) |
| **Licencia del Software** | MIT License |
| **Estado Actual del Proyecto** | En Desarrollo / Fase I - Diagnóstico y Formulación |

---

## 2. Metadatos del Repositorio de Código

| Clave | Detalle |
|---|---|
| **URL Remota (Origin)** | `https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system.git` |
| **Rama Principal** | `main` |
| **Propietario del Repositorio** | `Eduardo-Sebastian-Paipay-Vega` |
| **Sistema de Control de Versiones** | Git / GitHub |
| **Estrategia de Ramas** | Git Flow / Feature branching (`feature/*` -> `main` vía Pull Requests con revisión obligatoria) |
| **Convención de Commits** | Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`) |

---

## 3. Equipo de Trabajo y Roles

| Integrante | Rol en el Proyecto | Usuario de GitHub |
|---|---|---|
| **Paipay Vega, Eduardo Sebastian** | Líder de Proyecto | [@Eduardo-Sebastian-Paipay-Vega](https://github.com/Eduardo-Sebastian-Paipay-Vega) |
| **Ovalle Luyo, Steve Smith** | Sub Líder de Proyecto | [@steveovalle27-lgtm](https://github.com/steveovalle27-lgtm) |
| **Leon Reyna, Cesar Antonio** | Desarrollador | [@cesarleon27-ai](https://github.com/cesarleon27-ai) |
| **Montero Gutiérrez, Brandon Fernando** | Desarrollador | [@brandonmontero27-g](https://github.com/brandonmontero27-g) |
| **Rodríguez Quispe, Grissel Arascely** | Desarrolladora | [@Arascely](https://github.com/Arascely) |

---

## 4. Stack Tecnológico y Entorno

| Entorno / Capa | Tecnología / Herramienta | Versión / Especificación |
|---|---|---|
| **Framework Frontend** | Flutter (Multiplataforma: Android, iOS, Web, Windows, Linux, macOS) | Flutter 3.x (SDK: `^3.9.2`) |
| **Lenguaje de Programación** | Dart | Dart 3.x (SDK: `^3.9.2`) |
| **Diseño y UI** | Material Design 3 / Cupertino Icons (`^1.0.8`) | — |
| **Backend** | APIs RESTful (Arquitectura orientada a servicios) | En definición |
| **Base de Datos** | Relacional / Cloud | En definición |
| **Infraestructura Cloud** | Servidor VPS Cloud + Dominio institucional con Certificado SSL | Despliegue programado para Semana 10 |
| **Linter y Calidad de Código** | `flutter_lints` | `^5.0.0` (definido en `analysis_options.yaml`) |
| **Metodología de Desarrollo** | Scrum (Sprints semanales) + Aprendizaje-Servicio | 4 Fases en 16 semanas |

---

## 5. Arquitectura del Sistema

```
┌────────────────────────────────────────────────────────┐
│                  CAPA DE PRESENTACIÓN                  │
│       Flutter (Material Design 3 Multiplataforma)       │
├────────────────────────────────────────────────────────┤
│                    CAPA DE NEGOCIO                     │
│               Lógica de Negocio + APIs                 │
├────────────────────────────────────────────────────────┤
│                     CAPA DE DATOS                      │
│            Base de Datos + Servicios Cloud             │
├────────────────────────────────────────────────────────┤
│                    INFRAESTRUCTURA                     │
│               VPS Cloud + Dominio + SSL                │
└────────────────────────────────────────────────────────┘
```

---

## 6. Módulos y Objetivos Funcionales

1. **Gestión Administrativa:** Centralización de trámites, registros y operaciones escolares internas.
2. **Plataforma de Difusión Digital:** Portal y canales informativos para la comunidad educativa.
3. **Dashboard Analítico:** Panel de indicadores clave (KPIs) y métricas institucionales.
4. **Control de Acceso y Usuarios (RBAC):** Autenticación y roles diferenciados (Administrador, Directivo, Docente, Personal Administrativo).
5. **Generación de Reportes:** Informes automatizados y métricas de uso del sistema.

---

## 7. Métricas e Indicadores de Rendimiento (KPIs)

- **KPI-1 (Tasa de Adopción):** Al menos el 80% del personal administrativo utilizando la plataforma activamente.
- **KPI-2 (Satisfacción del Usuario):** Calificación promedio superior a 4/5 en encuestas de satisfacción.
- **KPI-3 (Rendimiento):** Tiempo de respuesta menor a 2 segundos bajo carga estándar.
- **KPI-4 (Disponibilidad / Uptime):** 99% de disponibilidad durante la jornada institucional (8:00 AM - 6:00 PM).
- **KPI-5 (Eficiencia Operativa):** Reducción de al menos un 40% en el tiempo dedicado a trámites manuales rutinarios.

---

## 8. Estructura y Árbol de Archivos del Repositorio

```
school-management-system/
├── .editorconfig                       # Configuración de formateo y estilo de editores
├── .gitignore                          # Exclusiones de control de versiones Git
├── .metadata                           # Metadatos del entorno Flutter
├── analysis_options.yaml               # Reglas de análisis estático Dart/Flutter
├── LICENSE                             # Licencia MIT (Copyright 2026 Eduardo Sebastian Paipay Vega)
├── pubspec.yaml                        # Manifiesto de paquetes y dependencias Flutter
├── pubspec.lock                        # Lockfile con versiones fijadas de dependencias
├── README.md                           # Documentación principal del repositorio
├── lib/                                # Código fuente de la aplicación Flutter
│   └── main.dart                       # Punto de entrada principal de la aplicación
├── test/                               # Suites de pruebas automáticas
│   └── widget_test.dart                # Pruebas de widgets unitarias
├── android/                            # Módulo nativo y configuración para Android
├── ios/                                # Módulo nativo y configuración para iOS
├── web/                                # Configuración y activos para despliegue Web
├── windows/                            # Configuración del ejecutable para Windows
├── linux/                              # Configuración del ejecutable para Linux
├── macos/                              # Configuración del ejecutable para macOS
└── D - Base 1 - 01092026/              # Documentación de ingeniería y gestión del proyecto
    ├── plan_trabajo.md                 # Plan de trabajo integral de 16 semanas (IS-480)
    ├── Fase 1/                         # Fase I: Diagnóstico y Formulación
    │   ├── metadatos.md                # Este documento de metadatos integrales
    │   ├── stakeholders.md             # Matriz de interesados / partes interesadas
    │   ├── deliminatacions.md          # Delimitaciones del alcance del proyecto
    │   ├── limitaciones.md             # Limitaciones y restricciones del proyecto
    │   ├── C4/                         # Diagramas de Arquitectura (Modelo C4)
    │   │   ├── Nivel 1.md              # Contexto del sistema
    │   │   ├── Nivel 2.md              # Contenedores
    │   │   └── Nivel 3.md              # Componentes
    │   ├── Casos de uso/               # Especificación de casos de uso
    │   └── Requerimientos/             # Requisitos funcionales y no funcionales
    └── Fase 2/                         # Fase II: Diseño y Desarrollo de Software
```

---

## 9. Registro de Fases y Cronograma Resumido

- **Fase I: Diagnóstico y Formulación (Semanas 1-3):** Diagnóstico situacional (As-Is), análisis de brecha digital, Project Charter, WBS, delimitaciones, requerimientos y arquitectura C4.
- **Fase II: Diseño y Desarrollo (Semanas 4-8):** Especificación formal SRS, modelado de Base de Datos, prototipos de alta fidelidad UI/UX, desarrollo de Frontend y Backend, e integración Alpha.
- **Fase III: Pruebas e Implementación (Semanas 9-11):** Pruebas de calidad QA, configuración del servidor VPS, despliegue a producción (Go-Live) y validación UAT.
- **Fase IV: Capacitación, Evaluación y Cierre (Semanas 12-16):** Manuales técnicos y de usuario, talleres de capacitación y alfabetización digital, medición de impacto (KPIs), redacción del informe final y sustentación pública.
