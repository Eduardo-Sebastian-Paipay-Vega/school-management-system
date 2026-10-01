<div align="center">

# Sistema Integral de Gestión Escolar e Información Institucional

### Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH
**Servicio Social Universitario (SSU IS-480, Semestre 2026-II) · EPIS UNSCH**

[![Flutter](https://img.shields.io/badge/Flutter-3.35.x_Web-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.9.x-0175C2?style=for-the-badge&logo=dart&logoColor=white)](https://dart.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7+-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![QA Quality](https://img.shields.io/badge/Flutter_Analyze-0_Errors_|_0_Warnings-brightgreen?style=for-the-badge&logo=flutter)](https://flutter.dev)
[![Tests](https://img.shields.io/badge/Tests-48%2F48_Passed_(100%25)-brightgreen?style=for-the-badge)](https://flutter.dev)
[![Git Flow](https://img.shields.io/badge/Git_Branches-main_%7C_dev-orange?style=for-the-badge&logo=git&logoColor=white)](https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-blue.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Descripción del Proyecto

Plataforma Web integral orientada a la **modernización de la gestión académica, asistencia escolar en tiempo real, planilla de calificaciones ágil y difusión digital** para los Planteles de Aplicación "Guamán Poma de Ayala" de la Universidad Nacional de San Cristóbal de Huamanga (UNSCH), en la ciudad de Ayacucho, Perú.

Desarrollada por **5 Squads Técnicos Especializados** de la Escuela Profesional de Ingeniería de Sistemas (EPIS) en el marco del **Servicio Social Universitario (IS-480)**, abarcando **71 Requisitos Funcionales (`RF-01` al `RF-71`)**, **20 Requisitos No Funcionales (ISO/IEC 25010)** y el cumplimiento estricto de la normativa de protección de datos personales (**Ley N.° 29733**).

---

## 🎯 Objetivos de Impacto

- **Erradicar la pérdida de clases y tiempo administrativo:** Reducir en más de 40% el tiempo dedicado al llenado de actas manuales y registro de asistencia.
- **Resiliencia Operativa Offline-First:** Garantizar que el control de portería funcione sin internet y sincronice automáticamente al reanudar conexión (<200 ms de respuesta).
- **Planilla de Notas a 60 FPS:** Permitir a los docentes registrar calificaciones a máxima velocidad mediante teclado en "Modo Excel" con auto-guardado en segundo plano (debounce 400 ms).
- **Trazabilidad Institucional y Anticorrupción:** Auditoría inmutable con sellado criptográfico SHA-256 para cada cambio en notas y asistencias.
- **Acreditación Universitaria y Transparencia:** Panel de indicadores del SSU IS-480 y verificación pública documental mediante códigos QR sin requerir inicio de sesión.

---

## 🚀 Funcionalidades y Módulos del Sistema (71 RFs)

El sistema integra **13 módulos funcionales** distribuidos estratégicamente entre los 5 squads técnicos:

1. 🔐 **Módulo 1: Acceso, Autenticación JWT y RBAC** (`RF-01` al `RF-04`) — Squad 1
2. 👥 **Módulo 2: Administración de Usuarios y Directorio** (`RF-05` al `RF-09`) — Squad 1
3. 🏫 **Módulo 3: Configuración Escolar, Periodos y Escalas** (`RF-10` al `RF-14`) — Squad 1
4. 📚 **Módulo 4: Gestión Académica, Matrícula y Carga Lectiva** (`RF-15` al `RF-19`) — Squad 2
5. ⏱️ **Módulo 5: Asistencia Estudiantil, Kiosco Offline-First y Carnés QR** (`RF-20` al `RF-27`) — Squad 2
6. 🎓 **Módulo 6: Asistencia y Cómputo de Horas de Practicantes SSU** (`RF-28` al `RF-31`) — Squad 2
7. 👨‍🏫 **Módulo 7: Horas de Docentes Contratados y Reprogramación** (`RF-32` al `RF-35`) — Squad 2
8. 📊 **Módulo 8: Calificaciones en Tiempo Real, Modo Excel y Motor CNEB** (`RF-36` al `RF-46`) — Squad 3
9. 🗺️ **Módulo 9: Mapas de Calor con Navegación Drill-Down** (`RF-47` al `RF-51`) — Squad 4
10. 📈 **Módulo 10: Dashboards, Ficha 360° del Alumno y Métricas SSU IS-480** (`RF-52` al `RF-58`) — Squad 4
11. 📑 **Módulo 11: Emisión de Reportes y Verificación Criptográfica QR** (`RF-59` al `RF-64`) — Squad 5
12. 🛡️ **Módulo 12: Trazabilidad, Auditoría Inmutable y Ley 29733** (`RF-65` al `RF-68`) — Squad 1
13. 🌐 **Módulo 13: Plataforma de Difusión Digital y Portal Institucional** (`RF-69` al `RF-71`) — Squad 5

---

## 💡 Innovaciones Estratégicas del Sistema

| # | Innovación Tecnológica | Módulo & RF | Valor Agregado para el Plantel |
|:---:|---|:---:|---|
| 1 | **Kiosco de Portería Offline-First** | M5 (`RF-25`) | Registro de ingreso de estudiantes (<200 ms) sin caídas ante cortes de red gracias al búfer local en IndexedDB/Hive. |
| 2 | **Carnés Escolares con Token QR** | M5 (`RF-26`) | Emisión e impresión de credenciales en PDF vectorial con token criptográfico para control de portería. |
| 3 | **Toma Rápida en Aula con WebSockets** | M5 (`RF-27`) | Marcación táctil en 1 clic desde el celular del docente con difusión en tiempo real a dirección y monitores. |
| 4 | **Planilla Ágil de Notas ("Modo Excel")** | M8 (`RF-38`) | Interfaz ultra-rápida a 60 FPS con navegación completa por teclado (flechas, Enter, Tab) y pegado masivo. |
| 5 | **Asistente de Conclusiones CNEB/MINEDU** | M8 (`RF-39`) | Banco taxonómico de retroalimentación pedagógica contextual según nivel de logro (AD, A, B, C). |
| 6 | **Auto-Guardado Asistido (Debounce 400 ms)** | M8 (`RF-45`) | Guardado transparente en segundo plano que evita pérdida de información y bloqueos de interfaz. |
| 7 | **Motor de Conversión Dual (Vigesimal ➔ CNEB)** | M8 (`RF-46`) | Conversión algorítmica canónica de notas 0-20 a escala cualitativa oficial del MINEDU (AD, A, B, C). |
| 8 | **Mapas de Calor con Navegación Drill-Down** | M9 (`RF-49`) | Diagnóstico visual interactivo por clics jerárquicos: Plantel ➔ Nivel ➔ Grado ➔ Sección ➔ Alumno. |
| 9 | **Ficha Escolar Integral 360° del Estudiante** | M10 (`RF-56`) | Radiografía individual con gráfico de Radar, historial de notas, ausentismo y alertas de deserción en 1 pantalla. |
| 10 | **Dashboard de Impacto Social SSU IS-480** | M10 (`RF-57`) | Monitoreo continuo de KPIs de adopción, horas de servicio social y metas del proyecto para la UNSCH. |
| 11 | **Verificación Criptográfica QR SHA-256** | M11 (`RF-60`) | Consulta pública instantánea de autenticidad de boletas y certificados sin necesidad de login. |
| 12 | **Cadena Inmutable de Auditoría (Ley 29733)** | M12 (`RF-65`) | Cadena criptográfica `SHA-256` encadenada desde `genesisHash` con trigger de inmutabilidad en PostgreSQL. |

---

## 🏛️ Arquitectura del Sistema (Desacoplada y Cloud)

El sistema implementa una arquitectura desacoplada **Clean Architecture + Feature-First**, optimizada para la nube y la resiliencia en red escolar:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CAPA DE FRONTEND (CLIENTE)                                │
│       Flutter 3.35.x Web (CanvasKit / WebAssembly) • PWA • Material Design 3           │
│   [Desplegado globalmente en Vercel CDN • Modo Kiosco Offline-First en IndexedDB/Hive] │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           │ HTTPS (TLS 1.3) / WSS (WebSockets RFC 6455)
                                           │ Contratos JSON Tipados / OpenAPI 3.0
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CAPA DE BACKEND (SERVICIOS)                               │
│       Node.js v20+ LTS • TypeScript 5.x • Express Modular • Clean Architecture         │
│   [Auth JWT/RBAC • Sync Worker Kiosco • Grading Engine • WebSocket Gateway • QR Verifier]
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           │ Conexión Segura TCP Pool (Puertos 5432 y 6379)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         CAPA DE PERSISTENCIA Y CACHÉ                                   │
│   • PostgreSQL 16+: Motor relacional ACID con discriminador multi-tenant (tenant_id)   │
│   • Redis 7+: Almacén en RAM para token blacklist, rate limiting y Pub/Sub WebSockets  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Estructura del Repositorio (Monorepo Modular)

```text
school-management-system/
├── backend/                       # Servidor API RESTful y Gateway WebSockets
│   ├── src/
│   │   ├── config/                # Conexiones a PostgreSQL 16 (pg Pool) y Redis 7 (ioredis)
│   │   ├── middlewares/           # authenticateJwt (RF-01) y requireRoles (RF-04)
│   │   ├── routes/                # Rutas REST (/api/v1/health, auth, users, etc.)
│   │   └── server.ts              # Servidor Express con Helmet, CORS y Morgan
│   ├── .env.example               # Plantilla de variables de entorno cloud
│   ├── package.json               # Dependencias de producción (Node.js/TypeScript)
│   └── tsconfig.json              # Configuración estricta de TypeScript 5
│
├── database/                      # Esquema de Base de Datos PostgreSQL
│   └── init/
│       └── 01_esquema_consolidado.sql # DDL unificado de los 5 Squads con triggers y semillas
│
├── docker-compose.yml             # Orquestador local (Postgres 16, Redis 7 y Adminer :8080)
├── vercel.json                    # Despliegue de Flutter Web (SPA Rewrites y Cache Wasm)
│
├── lib/                           # Código Fuente Frontend (Flutter 3.35 / Dart 3.9)
│   ├── main.dart                  # Shell institucional y selector interactivo de squads
│   ├── core/                      # Componentes transversales compartidos
│   │   ├── constants/             # Constantes globales y metadatos
│   │   ├── theme/app_theme.dart   # Tokens visuales (Verde Botella, Azul UNSCH, Escala CNEB)
│   │   └── widgets/               # Widgets y botones reutilizables (AsyncActionButton, etc.)
│   └── features/                  # Módulos por Squads (Arquitectura Feature-First)
│       ├── squad_1_core_seguridad/        # M1, M2, M3, M12 (JWT, RBAC, Auditoría)
│       ├── squad_2_matricula_asistencia/  # M4, M5, M6, M7 (Kiosco Offline, QR)
│       ├── squad_3_calificaciones/        # M8 (Planilla Modo Excel a 60 FPS)
│       ├── squad_4_analitica_dashboards/  # M9, M10 (Mapas Drill-Down, Ficha 360°)
│       └── squad_5_secretaria_portal/     # M11, M13 (Libretas PDF, Portal Web)
│
├── test/                          # Batería de 48 Pruebas Unitarias y de Widgets
├── web/                           # PWA Manifest y metadatos HTML5
├── pubspec.yaml                   # Dependencias de Flutter (Crypto, PDF, Printing, etc.)
├── AGENTS.md                      # Directivas y reglas obligatorias para agentes de IA
└── README.md                      # Documentación maestra del proyecto
```

---

## ⚡ Guía de Inicio Rápido (Quick Start Dev)

Sigue estos 3 pasos para levantar el entorno completo de desarrollo en local:

### Paso 1: Levantar Base de Datos y Caché (Docker Compose)

```bash
# Levantar PostgreSQL 16 (:5432), Redis 7 (:6379) y Adminer (:8080) en segundo plano
docker compose up -d

# Verificar que los 3 contenedores estén corriendo saludablemente
docker compose ps
```

* **Gestor Web de Base de Datos:** Abre [http://localhost:8080](http://localhost:8080) en tu navegador.
  * **Sistema:** PostgreSQL | **Servidor:** `postgres` | **Usuario:** `postgres` | **Contraseña:** `postgrespassword2026!` | **Base de Datos:** `school_management`

### Paso 2: Iniciar el Backend API (Node.js + TypeScript)

```bash
cd backend
npm install
npm run dev
```

* **Servidor API:** Activo en [http://localhost:3000](http://localhost:3000)
* **Health Check:** [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health) (Valida conexión a PostgreSQL y Redis en tiempo real).

### Paso 3: Iniciar el Frontend (Flutter Web)

En una nueva terminal, desde la raíz del proyecto:

```bash
# 1. Descargar paquetes de Flutter
flutter pub get

# 2. Iniciar en Google Chrome con renderizador CanvasKit / Wasm (RECOMENDADO)
flutter run -d chrome

# Opciones alternativas:
# flutter run -d chrome --web-port 3000
# flutter run -d edge
# flutter run -d windows
```

> 💡 **Con 1 Clic desde el Editor:** Puedes presionar la tecla **`F5`** (o *Run > Start Debugging*) en VS Code, Cursor o Antigravity IDE para lanzar la aplicación automáticamente.

#### Atajos de Teclado Útiles Mientras Corre Flutter:
* **`r`**: **Hot Reload** (aplica cambios visuales en < 1 segundo sin reiniciar la app).
* **`R`**: **Hot Restart** (reinicia la aplicación y recarga estados).
* **`q`**: **Quit** (detiene la aplicación).

---

## 🧭 ¿Cómo Usar el Software y por Dónde Empezar? (Flujo por Fases)

### 1. Punto de Partida: Hub Central de Navegación (`lib/main.dart`)

Al ejecutar el proyecto, se despliega el **Hub Central Interactivo**, donde podrás:
- Explorar los paneles de trabajo de los **5 Squads**.
- Visualizar los entregables asignados (`RF` y `RNF`).
- Acceder al visor en vivo del **SDD (Documento de Diseño de Software IEEE 1016)**.

---

### 2. Secuencia Lógica del Ciclo Escolar

Para ingresar datos o validar el software en orden coherente, se debe seguir la secuencia del ciclo académico escolar:

```text
   [1️⃣ Squad 1: Core y Configuración]
         │  (Configura Año Lectivo 2026, Periodos, Grados y Usuarios JWT/RBAC)
         ▼
   [2️⃣ Squad 2: Matrícula y Asistencia]
         │  (Matricula estudiantes en las secciones creadas, emite carnés QR y Kiosco Offline)
         ▼
   [3️⃣ Squad 3: Calificaciones y Modo Excel]
         │  (Docentes asientan notas por competencias CNEB con autoguardado 400ms)
         ▼
   [4️⃣ Squad 4: Analítica y Dashboards]
         │  (Dirección supervisa Mapas de Calor Drill-Down, Ficha 360° y Alertas de Deserción)
         ▼
   [5️⃣ Squad 5: Secretaría y Portal Web]
            (Emisión masiva de Libretas PDF con QR SHA-256 y difusión en Portal Web)
```

1. **Fase 1 (Cimiento del Sistema) ➔ Squad 1 - Core y Seguridad:**
   * **¿Por qué empezar aquí?:** Sin configuración del año escolar ni cuentas de usuario autenticadas con roles (RBAC), ningún otro módulo puede operar.
   * **Qué hacer:** Configurar el Año Lectivo 2026, periodos bimestrales, escalas de calificación y registrar las cuentas de Directivos, Docentes y Auxiliares.
2. **Fase 2 (Población Escolar) ➔ Squad 2 - Matrícula y Asistencia:**
   * **¿Por qué sigue esto?:** Se requiere tener las secciones configuradas por el Squad 1 para poder matricular a los estudiantes.
   * **Qué hacer:** Matricular alumnos en Inicial, Primaria y Secundaria, asignar carga horaria a docentes, generar los carnés escolares con código QR y registrar asistencia en el Kiosco Offline-First de portería.
3. **Fase 3 (Operación Académica) ➔ Squad 3 - Calificaciones y Modo Excel:**
   * **¿Por qué sigue esto?:** Los docentes necesitan que los alumnos ya estén matriculados en sus respectivas áreas para poder evaluarlos.
   * **Qué hacer:** Ingresar a la planilla rápida "Modo Excel" (navegación 100% por teclado), registrar calificaciones por competencias CNEB y redactar conclusiones descriptivas con autoguardado de 400ms.
4. **Fase 4 (Supervisión y Análisis) ➔ Squad 4 - Analítica y Dashboards:**
   * **¿Por qué sigue esto?:** Se nutre de la asistencia acumulada (Squad 2) y las calificaciones registradas (Squad 3).
   * **Qué hacer:** La Dirección analiza los Mapas de Calor con navegación Drill-Down (colegio ➔ grado ➔ sección ➔ alumno), consulta la Ficha 360° para alertas de deserción escolar y monitorea los indicadores del SSU IS-480.
5. **Fase 5 (Salida Oficial y Cierre) ➔ Squad 5 - Secretaría y Portal Web:**
   * **¿Por qué es la fase final?:** Requiere que las notas y asistencias estén consolidadas para emitir los reportes oficiales.
   * **Qué hacer:** Emisión masiva de Libretas de Calificaciones en PDF con código QR firmado con hash SHA-256 (para verificación pública sin login) y publicación de novedades en el Portal Web Institucional.

---

## 👥 Equipo de Desarrollo y Matriz de Responsabilidades

El proyecto se desarrolla bajo el marco del **Servicio Social Universitario (SSU IS-480, Semestre 2026-II)** de la **Escuela Profesional de Ingeniería de Sistemas (EPIS - UNSCH)** para los **Planteles de Aplicación "Guamán Poma de Ayala"**.

### Matriz Técnica de Funciones, Entregables y Dependencias por Integrante

| Integrante | Rol en el Proyecto | Squad Asignado | Módulos & RFs | 📦 Qué debe Entregar / Desarrollar (Outputs) | 📥 Qué debe Usar / Consumir (Inputs) |
|---|---|---|:---:|---|---|
| **Paipay Vega, Eduardo Sebastian**<br>([@Eduardo-Sebastian-Paipay-Vega](https://github.com/Eduardo-Sebastian-Paipay-Vega)) | **Líder de Proyecto** | **Squad 2:<br>Matrícula y Asistencia** | **M4, M5, M6, M7**<br>(RF-15 al RF-35) | • **Frontend:** Kiosco Offline-First (`RF-21`, `RF-25`) en IndexedDB/Hive, escaneo QR (<200ms), carnés escolares (`RF-26`), matrícula y nóminas.<br>• **Backend:** Endpoint de matrícula ACID, sync masivo del Kiosco (`POST /api/v1/attendance/sync-batch`), WebSocket Gateway (`RF-27`), control de practicantes y docentes contratados. | • **De Squad 1:** `squad_1_core.dart` (`AccessControlService`, sesiones y sedes).<br>• **De BD:** Tablas `instituciones`, `usuarios`, `anios_lectivos`.<br>• **De Docker:** `docker compose up -d` para PostgreSQL y Redis. |
| **Ovalle Luyo, Steve Smith**<br>([@steveovalle27-lgtm](https://github.com/steveovalle27-lgtm)) | **Sub Líder de Proyecto** | **Squad 3:<br>Calificaciones y Modo Excel** | **M8**<br>(RF-36 al RF-46) | • **Frontend:** Planilla ágil tipo Excel (`RF-38`) a 60 FPS con navegación 100% por teclado, debounce 400ms (`RF-45`), asistente de conclusiones CNEB (`RF-39`).<br>• **Backend:** Endpoint de guardado en lote idempotente (`PATCH /api/v1/grades/batch`), motor canónico CNEB (`RF-46`), bloqueo de cierre de actas (`RF-42`). | • **De Squad 1:** `GradingScaleService` (escala CNEB AD, A, B, C de `RF-13`) y `AcademicCalendarService` (fechas límites).<br>• **De Squad 2:** Lista de estudiantes matriculados (`matriculas`).<br>• **De BD:** Tablas `evaluaciones`, `calificaciones`, `banco_conclusiones_cneb`. |
| **Montero Gutiérrez, Brandon Fernando**<br>([@brandonmontero27-g](https://github.com/brandonmontero27-g)) | **Desarrollador** | **Squad 1:<br>Core y Seguridad** | **M1, M2, M3, M12**<br>(RF-01 al RF-14,<br>RF-65 al RF-68) | • **Frontend:** Login, Perfil, Sedes, Configuración Escolar, Matriz RBAC, Bitácora de Auditoría y exportador PDF sellado.<br>• **Backend:** Endpoints de Auth JWT (`/api/v1/auth`), CRUD de usuarios y carga masiva (`/api/v1/users`), configuración y servicio inmutable Ley 29733.<br>• **Core:** Middlewares `authenticateJwt`, `requireRoles` y biblioteca `squad_1_core.dart`. | • **De BD:** Tablas `instituciones`, `usuarios`, `roles`, `periodos_academicos`, `logs_auditoria`.<br>• **De Infra:** Redis para token blacklist y Docker Compose local. |
| **Rodríguez Quispe, Grissel Arascely**<br>([@Arascely](https://github.com/Arascely)) | **Desarrolladora** | **Squad 4:<br>Analítica y Dashboards** | **M9, M10**<br>(RF-47 al RF-58) | • **Frontend:** Mapas de calor interactivos Drill-Down (`fl_chart`), Gráfico de Radar de la Ficha 360° (`RF-56`), Dashboards para Dirección (`RF-52`), Coordinación (`RF-53`), Docentes y panel de impacto SSU IS-480 (`RF-57`).<br>• **Backend:** Endpoints de analítica agregada (`/api/v1/analytics/heatmap`, `/student-360/:id`). | • **De Squad 2:** Récord de asistencia acumulada para ausentismo crónico (`RF-24`).<br>• **De Squad 3:** Calificaciones y notas vigesimales.<br>• **De BD:** Vistas materializadas `vm_rendimiento_seccion`, `vm_asistencia_mensual` y `metricas_impacto_ssu`. |
| **Leon Reyna, Cesar Antonio**<br>([@cesarleon27-ai](https://github.com/cesarleon27-ai)) | **Desarrollador** | **Squad 5:<br>Secretaría y Portal Web** | **M11, M13**<br>(RF-59 al RF-64,<br>RF-69 al RF-71) | • **Frontend:** Maquetación vectorial e impresión de Libretas Escolares PDF (`RF-59`), Cuadros de Mérito (`RF-61`), y Portal Web Institucional responsive con cartelera y calendario cívico.<br>• **Backend:** Servicio de firma SHA-256 de documentos y Verificador Público QR sin autenticación (`GET /api/v1/public/verify/:token` — `RF-60`). | • **De Squad 1:** Membrete oficial y escudo institucional.<br>• **De Squad 3:** Notas y conclusiones consolidadas para boletas PDF.<br>• **De Squad 4:** Cuadro de méritos.<br>• **De Cloud:** `vercel.json` para entrega CDN estática. |

---

## 🌿 Estrategia de Ramas Git Unificada (`main` y `dev`)

Para mantener el repositorio libre de conflictos y simplificar la colaboración de los 5 squads, el equipo opera bajo una política simplificada de **Integración Continua**:

| Rama | Propósito | Regla de Oro |
|---|---|---|
| **`main`** | **Producción / Despliegue Oficial** | Contiene únicamente versiones cerradas, probadas y listas para sustentaciones del SSU IS-480. **Prohibido push directo.** Solo recibe merges desde `dev`. |
| **`dev`** | **Desarrollo Activo e Integración Continua** | **Rama de trabajo diaria.** Los 5 squads integran y prueban aquí sus avances de forma continua. |

### Flujo Diario de Trabajo:

```bash
# 1. Al comenzar la jornada, sincronizar la última versión de dev
git checkout dev
git pull origin dev

# 2. Realizar cambios en el código
# 3. Comprobar calidad y tests antes de subir
flutter analyze
flutter test

# 4. Guardar y enviar cambios a dev
git add .
git commit -m "feat(squad-X): avance del módulo (RF-XX)"
git push origin dev
```

### Convención de Commits:

| Prefijo | Significado | Ejemplo |
|---|---|---|
| `feat:` | Nueva funcionalidad | `feat(squad-2): implementación del lector QR de portería (RF-25)` |
| `fix:` | Corrección de bug | `fix(squad-1): resolver validación de correo institucional (RF-05)` |
| `docs:` | Actualización de documentación | `docs: actualizar SDD de calificaciones (RF-38)` |
| `test:` | Adición o ajuste de pruebas | `test: agregar test de debounce para guardado de notas` |
| `refactor:` | Refactorización de código | `refactor: optimizar pool de conexiones a PostgreSQL` |
| `chore:` | Tareas de configuración | `chore: actualizar dependencias en pubspec.yaml` |

---

## 🧪 Pruebas de Calidad y Verificación (QA)

Antes de realizar cualquier commit a la rama `dev`, el código debe superar satisfactoriamente:

```bash
# 1. Análisis estático de código Flutter (0 errores, 0 warnings requeridos)
flutter analyze

# 2. Ejecución de la batería de pruebas (48 pruebas pasando)
flutter test

# 3. Compilación y verificación del Backend
cd backend && npm run build
```

---

## 📚 Documentación Técnica e Ingeniería de Software

El proyecto cuenta con documentación formal de ingeniería de software con trazabilidad bidireccional:

* 📋 **Requisitos Funcionales (RF):** [Catálogo Maestro de 71 RFs (IEEE 830)](D%20-%20Base%201%20-%2001092026/Fase%202/Requisitos%20Funcionales/requisitos_funcionales.md) y [SRS Técnico con Contratos JSON](D%20-%20Base%201%20-%2001092026/Fase%202/Requisitos%20Funcionales/requisitos_funcionales_tecnicos.md).
* ⚙️ **Requisitos No Funcionales (RNF):** [Especificación de 20 RNFs Cuantificables (ISO/IEC 25010)](D%20-%20Base%201%20-%2001092026/Fase%202/Requisitos%20No%20Funcionales/requisitos_no_funcionales.md) y [Navegación por Squads](D%20-%20Base%201%20-%2001092026/Fase%202/Requisitos%20No%20Funcionales/README.md).
* 🎭 **Casos de Uso UML (CU):** [Catálogo Maestro de 71 Casos de Uso por Squad](D%20-%20Base%201%20-%2001092026/Fase%202/Casos%20de%20uso/README.md).
* 📐 **Diseño de Software (SDD - IEEE 1016):**
  * 📖 **[Guía Rápida: ¿Cómo y Dónde se elabora el SDD?](D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/GUIA_RAPIDA_SDD.md)**
  * 📋 **[Plantilla Canónica SDD (IEEE 1016)](.agents/skills/sdd-authoring/resources/plantilla_sdd.md)**
  * 🌟 **[Ejemplo Modelo Completo: SDD Squad 1](D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/sdd_squad_1.md)**
  * 🛠️ **Skill para Asistentes de IA:** Ubicada en [`.agents/skills/sdd-authoring/SKILL.md`](.agents/skills/sdd-authoring/SKILL.md).
* 📅 **Plan de Trabajo y Cronograma SSU:** [Plan de Trabajo IS-480 (16 Semanas)](D%20-%20Base%201%20-%2001092026/plan_trabajo.md).

---

## 🌐 Despliegue e Infraestructura Cloud

| Componente | Plataforma / Entorno | Estrategia de Entrega |
|---|---|---|
| **Frontend Web (Flutter)** | **Vercel CDN** | Despliegue continuo con renderizado CanvasKit/Wasm, headers de caché estático y SPA rewrites ([`vercel.json`](vercel.json)). |
| **Backend REST & WebSockets** | **Cloud VPS / Render / Railway** | Contenedor Node.js v20 LTS con TypeScript compilado y proxies Nginx/TLS. |
| **Base de Datos & Caché** | **PostgreSQL 16 + Redis 7** | Aislamiento multi-tenant por `tenant_id`, pools gestionados y triggers de inmutabilidad Ley 29733. |

---

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License - Copyright (c) 2026 Eduardo Sebastian Paipay Vega & Equipo SSU IS-480 (EPIS UNSCH)
```
