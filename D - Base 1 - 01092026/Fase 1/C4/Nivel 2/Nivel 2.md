# MODELO C4 — NIVEL 2: DIAGRAMA DE CONTENEDORES (CONTAINER DIAGRAM)

### Sistema de Gestión Escolar e Información Institucional
**Institución Beneficiaria:** Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH (Ayacucho, Perú)  
**Marco Académico:** Servicio Social Universitario IS-480 (Semestre 2026-II) — EPIS UNSCH  
**Estándar de Modelado:** Modelo C4 (Simon Brown) — Nivel 2: Contenedores  

---

## 1. PROPÓSITO DEL NIVEL 2

El **Diagrama de Contenedores (Container Diagram)** hace un primer acercamiento (*zoom in*) al interior del sistema de software `SYS-GP`. En la terminología C4, un **contenedor** es una unidad de software ejecutable de forma autónoma o un almacén de datos (servidor web, aplicación cliente frontend, API backend, base de datos relacional, almacén en memoria o almacenamiento local).

Este documento especifica la responsabilidad, tecnología, protocolos de enlace, puertos y flujos de datos entre cada contenedor, permitiendo a los desarrolladores y arquitectos entender cómo se distribuye y ejecuta la solución.

---

## 2. CATÁLOGO DE CONTENEDORES DEL SISTEMA

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTERA DEL SISTEMA (SYS-GP)                             │
│                                                                                        │
│   ┌────────────────────────────────────────┐  ┌────────────────────────────────────┐   │
│   │ C-01: Single Page Application (SPA)    │  │ C-02: Aplicación Kiosco Desktop    │   │
│   │ Flutter Web / PWA (Dart 3.9)           │  │ Flutter Windows Desktop (Dart 3.9) │   │
│   │ UI Responsiva para Directivos/Docentes │  │ Portería Offline-First ("Wachiman")│   │
│   └───────────────────┬────────────────────┘  └─────────────────┬──────────────────┘   │
│                       │ HTTPS / WSS                             │ Local / Sync HTTPS   │
│                       ▼                                         ▼                      │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ C-03: Reverse Proxy & Web Server (Nginx 1.24+ / Alpine Linux)                  │   │
│   │ Terminación SSL TLS 1.3 • Proxy Pass REST & WebSockets • Entrega de Estáticos  │   │
│   └───────────────────┬────────────────────────────────────────────────────────────┘   │
│                       │ HTTP/2 Interno (Puerto 3000) & WSS Upgrade                     │
│                       ▼                                                                │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ C-04: API Gateway & Application Server (Node.js LTS / TypeScript / Clean Arch) │   │
│   │ RESTful APIs • JWT/RBAC • WebSockets • Engine Modo Excel • Motor CNEB • SHA256 │   │
│   └───────────────┬────────────────────────────┬───────────────────────────┬───────┘   │
│                   │ TCP 5432                   │ TCP 6379                  │ FS / I/O  │
│                   ▼                            ▼                           ▼           │
│   ┌─────────────────────────────┐ ┌─────────────────────────────┐ ┌────────────────┐   │
│   │ C-05: BD Relacional ACID    │ │ C-06: Memoria & Eventos     │ │ C-08: Almacén  │   │
│   │ PostgreSQL 16+ Multi-Tenant │ │ Redis 7+ In-Memory Cache    │ │ Archivos (PDF) │   │
│   │ (`tenant_id`, Ley 29733)    │ │ (Tokens, PubSub, RateLimit) │ │ Boletas/Carnés │   │
│   └─────────────────────────────┘ └─────────────────────────────┘ └────────────────┘   │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ C-07: Almacenamiento Local en Cliente (Hive / IndexedDB en C-01 y C-02)        │   │
│   │ Búfer local de contingencia Offline-First para marcaciones de portería         │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.1 Especificación Individual de Contenedores

#### C-01: Single Page Application (SPA Web) — Flutter Web / PWA
* **Tecnología:** Flutter SDK 3.35.x, Dart 3.9.x, Material Design 3, Riverpod / Provider.
* **Descripción:** Aplicación cliente rica ejecutada en el navegador web de directivos, docentes, secretaría y estudiantes. Renderiza dashboards, la planilla de notas ("Modo Excel"), mapas de calor con navegación Drill-Down y la Ficha Escolar 360°.
* **Despliegue:** Compilado a estáticos HTML5, WebAssembly/CanvasKit y JavaScript; entregado por el servidor Nginx.

#### C-02: Aplicación Desktop Kiosco — Flutter Windows Desktop
* **Tecnología:** Flutter Desktop Windows (x64), Dart 3.9.x, Hive Local DB.
* **Descripción:** Aplicación nativa de alta velocidad instalada en la computadora de portería del plantel. Diseñada para responder en menos de 200 ms ante el escaneo de carnés escolares con lector óptico USB.
* **Capacidad Especial:** Opera en modo **Offline-First** almacenando marcaciones localmente cuando se cae la red institucional.

#### C-03: Reverse Proxy & Web Server — Nginx
* **Tecnología:** Nginx 1.24+ sobre Alpine Linux en contenedor Docker.
* **Descripción:** Puerta de entrada perimetral de red. Gestiona la terminación TLS 1.3 con certificados SSL/HTTPS, comprime activos mediante Gzip/Brotli, sirve los archivos estáticos de la SPA Web y enruta las peticiones dinámicas (`/api/*`) y los canales WebSockets (`/ws/*`) hacia el servidor de aplicación.

#### C-04: API Gateway & Application Server — Backend Node.js / TypeScript
* **Tecnología:** Node.js v20+ LTS, TypeScript 5.x, Clean Architecture (Express o NestJS).
* **Descripción:** Núcleo transaccional de lógica de negocio. Expone la API RESTful bajo especificación OpenAPI/JSON, gestiona la autenticación JWT con control de acceso basado en roles (RBAC), ejecuta el servidor de WebSockets para difusión en tiempo real, procesa el motor de conversión a escala CNEB, asiste en la redacción de conclusiones descriptivas y genera el sello criptográfico SHA-256 para documentos oficiales.

#### C-05: Base de Datos Relacional Principal — PostgreSQL 16+
* **Tecnología:** PostgreSQL 16+ con soporte de JSONB, extensiones UUID (`uuid-ossp`) y triggers procedurales PL/pgSQL.
* **Descripción:** Repositorio central de persistencia con transacciones ACID. Contiene todas las tablas maestras y transaccionales aisladas lógicamente mediante la columna `tenant_id`. Incluye triggers de inmutabilidad que impiden la alteración o borrado de la bitácora de auditoría (cumplimiento Ley N.° 29733).

#### C-06: Almacén en Memoria y Cola de Eventos — Redis 7+
* **Tecnología:** Redis 7+ en memoria RAM con persistencia periódica RDB/AOF.
* **Descripción:** Capa de ultra-baja latencia (< 5ms). Se utiliza para:
  1. Lista negra de revocación de Refresh Tokens JWT (bloqueo instantáneo ante logout).
  2. Rate Limiting distribuido para mitigar ataques de fuerza bruta en el login.
  3. Canal Pub/Sub para propagar eventos de WebSockets entre múltiples instancias.
  4. Caché de catálogos y consolidados curriculares para cumplir con el RNF de tiempo de respuesta P95 < 3 segundos.

#### C-07: Almacenamiento Local en Cliente — Hive / IndexedDB
* **Tecnología:** Hive NoSQL local (en Flutter Windows) / IndexedDB (en Flutter Web).
* **Descripción:** Búfer de persistencia local en el dispositivo del cliente. Almacena las transacciones de marcación de asistencia de portería en cola atómica durante desconexiones accidentales de internet, coordinando la sincronización en lote mediante claves de idempotencia (`idempotency_key`) al restablecerse la red.

#### C-08: Almacén de Archivos y Documentos — File Storage / Object Storage
* **Tecnología:** Sistema de Archivos local montado en volumen Docker persistente (o compatible con AWS S3).
* **Descripción:** Repositorio de almacenamiento seguro para boletas de notas oficiales en formato PDF, carnés escolares vectoriales generados y plantillas de actas institucionales.

---

## 3. MATRIZ EXHAUSTIVA DE CONEXIONES ENTRE CONTENEDORES (NIVEL 2)

| Origen | Destino | Protocolo / Puerto | Tipo de Flujo | Payload / Formato | Seguridad / Cifrado | Justificación y Flujo Operativo |
|---|---|:---:|:---:|---|:---:|---|
| **C-01** (SPA Web) | **C-03** (Nginx) | HTTPS / 443 | Sincrónico | HTTP Request (JSON / Estáticos) | TLS 1.3 / Certificado SSL | Descarga inicial de la aplicación compilada e intercambio de operaciones REST. |
| **C-01** (SPA Web) | **C-03** (Nginx) | WSS / 443 | Asincrónico / Full-Duplex | Tramas WebSocket JSON | TLS 1.3 (WSS) | Escucha de eventos de asistencia de aula en tiempo real (`RF-27`) y notificaciones directivas. |
| **C-02** (Desktop Kiosco) | **C-03** (Nginx) | HTTPS / 443 | Sincrónico por Lotes | JSON `batch_sync` con arreglo de asistencias | TLS 1.3 / Bearer JWT | Envío de marcaciones de portería acumuladas con resolución de conflictos por timestamp. |
| **C-02** (Desktop Kiosco) | **C-07** (Hive Local) | Memoria / E-S Local | Sincrónico Inmediato | Estructura Binaria Hive | Cifrado AES-256 local | Escritura inmediata de marcaciones en puerta ante ausencia de conexión a internet. |
| **C-03** (Nginx) | **C-04** (Backend API) | HTTP/2 / 3000 | Sincrónico / Proxy Pass | `application/json` | Red privada Docker (`school_net`) | Enrutamiento transparente de peticiones REST (`/api/v1/*`) con cabeceras `X-Forwarded-For`. |
| **C-03** (Nginx) | **C-04** (Backend API) | WebSocket / 3000 | Bidireccional / Upgrade | Tramas TCP WebSocket | Red privada Docker (`school_net`) | Mantenimiento de conexiones persistentes para difusión de eventos escolares. |
| **C-04** (Backend API) | **C-05** (PostgreSQL) | TCP / 5432 | Sincrónico (ACID) | Consultas SQL con parámetros tipados | Credenciales seguras en variable de entorno | Operaciones CRUD de usuarios, matrícula, notas, asistencia y bitácora de auditoría. |
| **C-04** (Backend API) | **C-06** (Redis) | TCP / 6379 | Sincrónico / Ultra-rápido | Protocolo RESP (Comandos GET, SET, PUBLISH) | Contraseña de autenticación Redis | Verificación de validez de tokens, control de límites de peticiones y caché de notas. |
| **C-04** (Backend API) | **C-08** (File Storage) | POSIX FS / E-S Disco | Sincrónico I/O | Flujo de bytes binarios (Archivos `.pdf`) | Permisos de lectura/escritura UNIX | Guardado y lectura de boletas de calificaciones firmadas y carnés estudiantiles QR. |

---

## 4. TOPOLOGÍA DE RED Y DESPLIEGUE EN CONTENEDORES (DOCKER)

Todos los contenedores del servidor se orquestan bajo una red privada virtual denominada `school_network` gestionada por Docker Compose:

1. **Zona Desmilitarizada (DMZ / Pública):**
   * Único contenedor expuesto a la red pública: **C-03 (Nginx)** a través de los puertos estándar `80` (HTTP con redirección forzada) y `443` (HTTPS).
2. **Zona de Aplicación (Aislada / Privada):**
   * **C-04 (Backend API):** Escucha únicamente en la interfaz interna de red Docker en el puerto `3000`. No tiene acceso directo desde internet sin pasar por Nginx.
3. **Zona de Datos (Blindada / Privada):**
   * **C-05 (PostgreSQL)** y **C-06 (Redis):** Escuchan exclusivamente en la red interna (`5432` y `6379`). Bloqueado el acceso a cualquier dirección IP externa.
   * Volúmenes persistentes mapeados: `pg_data` para integridad de datos y `redis_data` para copias RDB.

---

## 5. ESPECIFICACIÓN TEXTUAL PARA EL DIAGRAMA GRÁFICO (C4 NIVEL 2)

Al diagramar gráficamente este nivel, aplicar las siguientes convenciones:

1. **Contenedor Límite Principal:**
   * Dibujar el recuadro envolvente `Frontera del Sistema: Sistema de Gestión Escolar "Guamán Poma de Ayala"`.
2. **Distribución en Cuadrantes:**
   * **Nivel Superior (Clientes Frontend):** `C-01 (SPA Flutter Web)` a la izquierda y `C-02 (Desktop Kiosco)` a la derecha. Asociar `C-07 (Hive)` debajo de `C-02`.
   * **Nivel Medio Superior (Puerta de Enlace):** `C-03 (Nginx Reverse Proxy)` abarcando el ancho central.
   * **Nivel Central (Lógica de Aplicación):** `C-04 (API Gateway & Application Server Node.js)`.
   * **Nivel Inferior (Persistencia y Almacenamiento):** `C-05 (PostgreSQL)` a la izquierda, `C-06 (Redis)` al centro y `C-08 (File Storage)` a la derecha.
3. **Código de Colores:**
   * **Frontend / Clientes:** Azul Océano (`#0288D1`) con texto blanco.
   * **Proxy / Pasarela:** Gris Oscuro (`#424242`) con texto blanco.
   * **Servidor de Aplicación (Backend):** Verde Botella Institucional (`#1B4D3E`) con texto blanco.
   * **Almacenes de Datos (BD / Redis / FS):** Azul Petróleo / Púrpura Técnico (`#283593` y `#4527A0`).
