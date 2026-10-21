# DOCUMENTO DE ARQUITECTURA DE SOFTWARE Y DISTRIBUCIÓN DE TRABAJO TÉCNICO

**Proyecto:** Sistema de Información Integral de Gestión Administrativa y Plataforma de Difusión Digital  
**Institución Receptora:** Planteles de Aplicación "Guamán Poma de Ayala" - UNSCH  
**Equipo Ejecutor:** EPIS - UNSCH (Servicio Social Universitario IS-480, Semestre 2026-II)  
**Versión del Documento:** 1.0  
**Fecha:** 21 de Septiembre de 2026  

---

## 1. VISIÓN GENERAL Y PRINCIPIOS DE ARQUITECTURA

El sistema está concebido bajo una arquitectura desacoplada, escalable, modular y orientada al dominio (**Domain-Driven Design / Clean Architecture**), garantizando alta disponibilidad, mantenibilidad y resiliencia ante contingencias de conectividad en los planteles escolares.

```mermaid
graph TD
    subgraph Capa_Presentacion ["Capa de Presentación (Multiplataforma)"]
        A1["Next.js Web / PWA (Dirección, Docentes, Secretaría)"]
        A2["Kiosco de Portería en navegador (PWA Offline-First)"]
        A3["Vista móvil responsive (Toma rápida, Estudiantes, Apoderados)"]
    end

    subgraph Capa_Seguridad_Enrutamiento ["Gateway & Seguridad"]
        GW["Reverse Proxy / Nginx + SSL HTTPS"]
        JWT["Auth Interceptor (JWT + RBAC Middleware)"]
    end

    subgraph Capa_Logica_Negocio ["Capa de Aplicación y Backend"]
        B1["API RESTful (Clean Architecture / Controladores & Servicios)"]
        B2["WebSocket Gateway (Socket.io / WS para Difusión en Tiempo Real)"]
        B3["Motor de Conversión CNEB y Criptografía SHA-256"]
    end

    subgraph Capa_Persistencia ["Capa de Datos e Infraestructura"]
        DB[(PostgreSQL 16/18 Multi-Tenant)]
        CACHE[(Redis: Caché de Sesiones y Locks)]
        LOCAL[(IndexedDB: Almacenamiento Local Offline)]
        STORAGE["File Storage (PDFs Oficiales, Carnés QR)"]
    end

    A1 -->|HTTPS / REST| GW
    A2 -->|Almacena en Local| LOCAL
    A2 -.->|Sync Eventual| GW
    A3 -->|WebSockets / Eventos| GW
    GW --> JWT
    JWT --> B1
    JWT --> B2
    B1 --> DB
    B1 --> CACHE
    B1 --> B3
    B1 --> STORAGE
    B2 --> CACHE
```

### Principios Fundamentales del Diseño
1. **Clean Architecture en Frontend y Backend:** Separación tajante entre entidades de dominio, casos de uso, repositorios y capas de presentación.
2. **Aislamiento Multi-Tenant:** Persistencia en PostgreSQL asegurada por clave discriminadora `tenant_id` en todas las consultas y tablas compartidas.
3. **Estrategia Offline-First:** Para el Kiosco de Asistencia (`RF-25`), las transacciones se almacenan localmente en búfer (`IndexedDB`) y se sincronizan atómicamente al restablecer conexión.
4. **Reactividad en Tiempo Real:** Canales WebSockets bidireccionales para propagación de asistencia de aula (`RF-27`) y auto-guardado en segundo plano con cálculo en cascada (`RF-45`).
5. **Inmutabilidad y Sello Criptográfico:** Generación de digests SHA-256 inmutables para documentos oficiales verificables públicamente mediante códigos QR (`RF-60`).

---

## 2. REPARTO ESTRATÉGICO DE FUNCIONALIDADES POR EQUIPOS (SQUADS)

Para la ejecución eficiente durante las **Semanas 4 a 8 (Fase II)**, los **89 Requisitos Funcionales** y los **13 Módulos** se dividen en **5 Squads Técnicos Especializados**. Cada integrante del equipo lidera un squad con responsabilidades directas en Frontend, Backend y Base de Datos.

```mermaid
pie title Distribución de los 89 Requisitos Funcionales
    "Squad 1: Core, Seguridad & Admin (22 RFs)" : 22
    "Squad 2: Matrícula & Asistencia Offline (24 RFs)" : 24
    "Squad 3: Notas, Modo Excel & CNEB (15 RFs)" : 15
    "Squad 4: Analítica & Dashboards 360° (14 RFs)" : 14
    "Squad 5: Reportes QR & Portal Web (14 RFs)" : 14
```

---

### SQUAD 1: Core, Autenticación, Configuración Institucional y Auditoría
* **Líder Técnico:** Montero Gutiérrez, Brandon Fernando (`@brandonmontero27-g`)
* **Módulos a Cargo:** 
  * **Módulo 1:** Acceso, Autenticación JWT y RBAC (`RF-01` a `RF-04`)
  * **Módulo 2:** Administración de Usuarios y Directorio (`RF-05` a `RF-09`, `RF-72`, `RF-73`, `RF-75`, `RF-76`)
  * **Módulo 3:** Configuración Escolar, Periodos y Escalas (`RF-10` a `RF-14`)
  * **Módulo 12:** Trazabilidad, Auditoría y Protección de Datos Ley 29733 (`RF-65` a `RF-68`)
* **Total de Requisitos:** **22 RFs**

| Capa | Entregables y Responsabilidades Técnicas |
|---|---|
| **Base de Datos** | Tablas maestras: `usuarios`, `roles`, `permisos`, `institucion_sedes`, `anios_lectivos`, `periodos_academicos`, `escalas_calificacion`, `logs_auditoria`. Migraciones base y triggers de inmutabilidad en PostgreSQL. |
| **Backend** | Microservicios/módulos de Autenticación (`AuthService`, JWT Access/Refresh tokens con rotación, bcrypt), Guardias de RBAC, CRUD administrativo de usuarios y sedes, Middleware de auditoría inmutable (captura IP, User-Agent, Tenant, Payload diferencial). |
| **Frontend** | Vistas de Login seguro, Recuperación de contraseña, Panel de administración de usuarios (roles, estados, asignación de sedes), Configuración del año académico, y Visor de auditoría para directores. |

---

### SQUAD 2: Gestión Académica, Matrícula y Asistencia Offline-First
* **Líder Técnico:** Paipay Vega, Eduardo Sebastian (`@Eduardo-Sebastian-Paipay-Vega`)
* **Módulos a Cargo:**
  * **Módulo 4:** Gestión Académica, Matrícula y Carga Lectiva (`RF-15` a `RF-19`, `RF-78`)
  * **Módulo 5:** Asistencia Estudiantil, Kiosco Offline-First, App Rápida y Carnés QR (`RF-20` a `RF-27`, `RF-77`)
  * **Módulo 6:** Asistencia y Cómputo de Horas de Practicantes EPIS (`RF-28` a `RF-31`, `RF-74`)
  * **Módulo 7:** Horas de Docentes Contratados y Reprogramación (`RF-32` a `RF-35`)
* **Total de Requisitos:** **24 RFs**

| Capa | Entregables y Responsabilidades Técnicas |
|---|---|
| **Base de Datos** | Tablas: `grados_secciones`, `cursos`, `matriculas`, `carga_docente`, `asistencias_alumnos`, `asistencias_practicantes`, `asistencias_docentes_contratados`, `carnes_qr_log`. |
| **Backend** | API REST de Matrícula y Asignación de carga lectiva; Gateway WebSockets para difusión en tiempo real de asistencia (< 500 ms); Endpoints de sincronización por lotes (`/sync-bulk-attendance`); Lógica de cómputo de horas para el convenio UNSCH. |
| **Frontend** | Pantallas de Matrícula y gestión de secciones; **Módulo Kiosco de Portería Offline-First** (modo pantalla completa, lector de código de barras/QR físico, persistencia en IndexedDB, cola de reintentos); App móvil/web de toma rápida de asistencia en 1 toque; Generador de carnés escolares QR en PDF masivo. |

---

### SQUAD 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB
* **Líder Técnico:** Ovalle Luyo, Steve Smith (`@steveovalle27-lgtm`)
* **Módulos a Cargo:**
  * **Módulo 8:** Calificaciones en Tiempo Real, Modo Excel, Auto-Guardado y Conversión CNEB (`RF-36` a `RF-46`, `RF-79` al `RF-82`)
* **Total de Requisitos:** **15 RFs** *(Núcleo de Innovación y Alta Complejidad UX)*

| Capa | Entregables y Responsabilidades Técnicas |
|---|---|
| **Base de Datos** | Tablas: `evaluaciones`, `criterios_rubricas`, `calificaciones` (campos duales: `nota_vigesimal` NUMERIC(4,2), `nota_literal` VARCHAR(2)), `conclusiones_descriptivas`, `banco_conclusiones_cneb`, `cierres_periodo`. |
| **Backend** | Motor de conversión dual automática (algoritmo vigesimal 0-20 a literales AD, A, B, C oficial MINEDU); Endpoints de auto-guardado concurrente con bloqueo optimista (`debounce` 400 ms); Lógica de cierre formal de periodos con congelamiento de actas; Banco taxonómico de conclusiones descriptivas contextuales. |
| **Frontend** | **Planilla Rápida de Notas ("Modo Excel"):** Componente matricial avanzado en React con soporte completo de navegación por teclado (flechas, Tab, Enter), validación en caliente, pegado masivo desde portapapeles (Ctrl+V); Asistente predictivo de conclusiones descriptivas; Indicador visual de auto-guardado en tiempo real ("Guardado en la nube"). |

---

### SQUAD 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°
* **Líder Técnico:** Rodríguez Quispe, Grissel Arascely (`@Arascely`)
* **Módulos a Cargo:**
  * **Módulo 9:** Mapas de Calor con Navegación Drill-Down (`RF-47` a `RF-51`)
  * **Módulo 10:** Dashboards, Ficha 360° del Alumno y Métricas SSU IS-480 (`RF-52` a `RF-58`, `RF-83`, `RF-89`)
* **Total de Requisitos:** **14 RFs**

| Capa | Entregables y Responsabilidades Técnicas |
|---|---|
| **Base de Datos** | Vistas materializadas y consultas analíticas indexadas: `vm_rendimiento_seccion`, `vm_asistencia_mensual`, `vm_alertas_desercion`; Índices compuestos para agregaciones multidimensionales. |
| **Backend** | Servicios de analítica agregada; Algoritmo de detección temprana de deserción escolar (ponderación de inasistencias consecutivas y caídas de notas); Servicio de métricas de impacto SSU (horas de ejecución, porcentaje de adopción escolar, actas digitales generadas). |
| **Frontend** | **Componente Mapas de Calor:** Visualización cromática interactiva con navegación jerárquica Drill-Down (Colegio -> Nivel -> Grado -> Sección -> Alumno); **Ficha Integral 360° del Estudiante:** Dashboard unificado con kardex, asistencia y gráfico de radar de competencias; Panel de Acreditación SSU IS-480 para docentes tutores UNSCH. |

---

### SQUAD 5: Secretaría Digital, Criptografía Documental y Portal Web
* **Líder Técnico:** Leon Reyna, Cesar Antonio (`@cesarleon27-ai`)
* **Módulos a Cargo:**
  * **Módulo 11:** Emisión de Reportes y Verificación Criptográfica QR (`RF-59` a `RF-64`, `RF-86` al `RF-88`)
  * **Módulo 13:** Plataforma de Difusión Digital y Portal Institucional (`RF-69` a `RF-71`, `RF-84`, `RF-85`)
* **Total de Requisitos:** **14 RFs**

| Capa | Entregables y Responsabilidades Técnicas |
|---|---|
| **Base de Datos** | Tablas: `documentos_emitidos` (almacena `hash_sha256`, `qr_token`, `metadata_firmante`, `fecha_emision`), `comunicados_cartelera`, `eventos_calendario_civico`, `publicaciones_portal`. |
| **Backend** | Motor de generación de reportes y boletas PDF de alta fidelidad con encabezados institucionales; Servicio criptográfico generador de Hash SHA-256 inmutable y token de verificación; Endpoint público sin autenticación para validación de certificados y boletas (`/api/v1/public/verify-document/{token}`). |
| **Frontend** | Interfaz de secretaría para emisión masiva y descarga de boletas y cuadros de mérito; **Página Web Pública de Validación QR** (diseño ligero, responsivo para smartphones); Portal institucional público y cartelera digital de comunicados y calendario cívico escolar. |

---

## 3. MAPA MAESTRO DE ASIGNACIÓN (89 REQUISITOS FUNCIONALES)

| Rango de RFs | Módulo | Squad Asignado | Responsable Principal |
|:---:|---|:---:|---|
| `RF-01` a `RF-04` | M1: Acceso, Autenticación y RBAC | **Squad 1** | Brandon Fernando Montero Gutiérrez |
| `RF-05` a `RF-09` | M2: Administración de Usuarios y Directorio | **Squad 1** | Brandon Fernando Montero Gutiérrez |
| `RF-10` a `RF-14` | M3: Configuración Escolar y Periodos | **Squad 1** | Brandon Fernando Montero Gutiérrez |
| `RF-15` a `RF-19` | M4: Gestión Académica y Matrícula | **Squad 2** | Eduardo Sebastian Paipay Vega |
| `RF-20` a `RF-27` | M5: Asistencia, Kiosco Offline y Carnés QR | **Squad 2** | Eduardo Sebastian Paipay Vega |
| `RF-28` a `RF-31` | M6: Asistencia de Practicantes EPIS | **Squad 2** | Eduardo Sebastian Paipay Vega |
| `RF-32` a `RF-35` | M7: Horas Docentes Contratados | **Squad 2** | Eduardo Sebastian Paipay Vega |
| `RF-36` a `RF-46` | M8: Notas en Tiempo Real, Modo Excel y CNEB | **Squad 3** | Steve Smith Ovalle Luyo |
| `RF-47` a `RF-51` | M9: Mapas de Calor con Drill-Down | **Squad 4** | Grissel Arascely Rodríguez Quispe |
| `RF-52` a `RF-58` | M10: Dashboards, Ficha 360° y Métricas SSU | **Squad 4** | Grissel Arascely Rodríguez Quispe |
| `RF-59` a `RF-64` | M11: Reportes Oficiales y Criptografía QR | **Squad 5** | Cesar Antonio Leon Reyna |
| `RF-65` a `RF-68` | M12: Auditoría Inmutable y Ley 29733 | **Squad 1** | Brandon Fernando Montero Gutiérrez |
| `RF-69` a `RF-71` | M13: Difusión Digital y Portal Web | **Squad 5** | Cesar Antonio Leon Reyna |
| `RF-72` a `RF-73` | M2: Administración de Usuarios y Directorio | **Squad 1** | Brandon Fernando Montero Gutiérrez |
| `RF-74` | M6: Asistencia de Practicantes EPIS | **Squad 2** | Eduardo Sebastian Paipay Vega |
| `RF-75`, `RF-76` | M2: Cuentas de Apoderados y Notificaciones | **Squad 1** | Brandon Fernando Montero Gutiérrez |
| `RF-77`, `RF-78` | M5 / M4: Aviso de Inasistencias e Importación SIAGIE | **Squad 2** | Eduardo Sebastian Paipay Vega |
| `RF-79` a `RF-82` | M8: Actividades, Carga Excel, Plazos y Vista del Apoderado | **Squad 3** | Steve Smith Ovalle Luyo |
| `RF-83`, `RF-89` | M10: Cumplimiento Docente y Agenda de Citas | **Squad 4** | Grissel Arascely Rodríguez Quispe |
| `RF-84` a `RF-88` | M13 / M11: Noticias, Facebook, Mesa de Partes, Certificados y SIAGIE | **Squad 5** | Cesar Antonio Leon Reyna |

---

## 4. ESTRUCTURA DE CARPETAS Y ARQUITECTURA DE CÓDIGO

Para evitar colisiones en Git y garantizar independencia de trabajo entre squads, se implementa una arquitectura modular limpia tanto en el Frontend (Next.js) como en el Backend:

### Frontend (Next.js — Feature-First)
```
frontend/
├── app/                          # App Router de Next.js
│   ├── (landing)/                # Portal público: noticias, cartelera, mesa de partes, verificación QR
│   ├── (intranet)/               # Intranet autenticada por rol (incluye vista del apoderado)
│   ├── globals.css               # Tokens de diseño (variables CSS)
│   └── layout.tsx
├── components/                   # Componentes UI compartidos
├── lib/                          # Cliente HTTP con interceptor JWT, cliente Socket.IO, utilidades
├── modules/
│   ├── shared/                   # Código transversal (sesión, permisos, formato de fechas)
│   ├── landing/                  # [Squad 5] Portal web institucional
│   ├── intranet/                 # Login y hub de la intranet
│   └── squads/
│       ├── squad_1_core/         # [Squad 1] Usuarios, roles, configuración, auditoría, apoderados
│       ├── squad_2_asistencia/   # [Squad 2] Matrícula, Kiosco Offline-First, practicantes
│       ├── squad_3_calificaciones/ # [Squad 3] Planilla Modo Excel, actividades, plazos
│       ├── squad_4_analitica/    # [Squad 4] Mapas de calor, Ficha 360°, citas
│       └── squad_5_secretaria/   # [Squad 5] Boletas, certificados, SIAGIE
├── public/                       # Emblemas e imágenes estáticas
└── tailwind.config.ts            # Tokens expuestos como clases
```

### Backend (Clean Architecture / Modularity)
```
src/
├── core/                         # Infraestructura común
│   ├── database/                 # Pool de conexiones PostgreSQL, transacciones
│   ├── security/                 # JWT, RBAC Guards, Encriptación bcrypt
│   ├── websocket/                # Gateway central de eventos en tiempo real
│   └── middlewares/              # Logger de auditoría inmutable, Error Handler
└── modules/                      # Subdominios de negocio por Squad
    ├── auth/                     # [Squad 1] Controladores, Casos de Uso, Repositorios Auth
    ├── administration/           # [Squad 1] Sedes, Ciclos escolares, Roles, Logs
    ├── academics/                # [Squad 2] Matrícula, Grados, Asignación de Carga
    ├── attendance/               # [Squad 2] Asistencia Alumnos, Sync Offline Kiosco
    ├── staff_tracking/           # [Squad 2] Horas Practicantes UNSCH y Contratados
    ├── grades/                   # [Squad 3] Notas, Motor CNEB, Conclusiones, Cierre
    ├── analytics/                # [Squad 4] Vistas agregadas, Alertas de abandono
    ├── ssu_impact/               # [Squad 4] KPIs de Acreditación IS-480
    ├── document_crypto/          # [Squad 5] Motor PDF, Sello Hash SHA-256, QR Público
    └── portal/                   # [Squad 5] Comunicados y Calendario Cívico
```

---

## 5. FLUJO DE INTEGRACIÓN CONTINUA Y PROTOCOLO GIT

Cada squad trabaja de forma aislada mediante ramas de características (**Feature Branches**), integrando en la rama `develop` antes del paso a `main`:

```mermaid
gitGraph
    commit id: "Inicial (4c7d2e7)"
    commit id: "Docs 71 RFs (aea57e4)"
    branch develop
    checkout develop
    commit id: "Init Setup"
    branch squad-1/auth-core
    branch squad-2/kiosk-attendance
    branch squad-3/excel-gradebook
    branch squad-4/heatmaps-dashboards
    branch squad-5/reports-crypto
    checkout squad-3/excel-gradebook
    commit id: "feat: matrix gradebook"
    checkout develop
    merge squad-3/excel-gradebook id: "PR #1 Merged"
    checkout squad-2/kiosk-attendance
    commit id: "feat: offline kiosk"
    checkout develop
    merge squad-2/kiosk-attendance id: "PR #2 Merged"
    checkout main
    merge develop id: "Release Alpha (Sem 8)"
```

### Convenciones de Ramas por Equipo:
* `feature/squad-1/auth-rbac`
* `feature/squad-2/kiosk-offline`
* `feature/squad-3/gradebook-excel`
* `feature/squad-4/heatmaps-drilldown`
* `feature/squad-5/pdf-crypto-qr`
