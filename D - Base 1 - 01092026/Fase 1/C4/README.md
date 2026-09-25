# MODELO DE ARQUITECTURA C4 — ESPECIFICACIÓN DOCUMENTAL DETALLADA

### Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)
**Servicio Social Universitario IS-480 (Semestre 2026-II) — EPIS UNSCH**

---

## 1. INTRODUCCIÓN AL MODELO C4

El **Modelo C4 (Contexto, Contenedores, Componentes y Código)**, creado por Simon Brown, es una metodología estándar para describir la arquitectura de sistemas de software mediante diferentes niveles de abstracción jerárquica.

Esta carpeta contiene la **especificación documental exhaustiva** de los 3 niveles fundamentales del sistema de los Planteles de Aplicación de la UNSCH, detallando actores, contenedores de software, componentes internos, matrices de conexión, protocolos de comunicación y flujos de datos para facilitar su posterior representación gráfica en herramientas como **PlantUML, Structurizr o Mermaid**.

```
┌────────────────────────────────────────────────────────────────────────┐
│  Nivel 1: CONTEXTO DEL SISTEMA (System Context)                        │
│  Vista macro: Actores humanos, el sistema central y sistemas externos  │
│  📄 Documento: [Nivel 1.md](Nivel%201.md)                              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Hace zoom in al Sistema Central
┌───────────────────────────────────▼────────────────────────────────────┐
│  Nivel 2: CONTENEDORES (Containers)                                    │
│  Aplicaciones desplegables: SPA Web, Kiosco Desktop, Nginx, API, BD,   │
│  Redis y Almacenamiento Local Offline-First (Hive/IndexedDB)           │
│  📄 Documento: [Nivel 2.md](Nivel%202.md)                              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Hace zoom in a la API Backend
┌───────────────────────────────────▼────────────────────────────────────┐
│  Nivel 3: COMPONENTES (Components)                                     │
│  Estructura interna: Controladores API, Servicios de Dominio (Modo     │
│  Excel, Motor CNEB, Drill-Down, SHA-256) y Repositorios                │
│  📄 Documento: [Nivel 3.md](Nivel%203.md)                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ÍNDICE DE NIVELES Y ENLACES DIRECTOS

1. 📄 **[Nivel 1: Contexto del Sistema (System Context)](Nivel%201/Nivel%201.md)** | 📊 **[Modelo JSON](Nivel%201/c4_nivel_1_contexto.json)**
   * **Alcance:** 9 Actores humanos (Administrador, Directivos, Docentes, Practicantes, Estudiantes, Portería, Secretaría, Público Verificador) y 4 Sistemas/Entornos Externos (Servidor SMTP, Tutoría SSU EPIS-UNSCH, Hardware Escáner, Navegadores Web).
   * **Contenido:** Catálogo de actores, matriz de conexiones macro, protocolos, modelo JSON tipado y pautas visuales de diagramación.

2. 📄 **[Nivel 2: Contenedores (Containers)](Nivel%202/Nivel%202.md)** | 📊 **[Modelo JSON](Nivel%202/c4_nivel_2_contenedores.json)**
   * **Alcance:** Los 8 contenedores de software del ecosistema (`C-01` a `C-08`):
     * `C-01`: Single Page Application (Flutter Web / PWA).
     * `C-02`: Aplicación Desktop Kiosco (Flutter Windows - Portería Offline-First).
     * `C-03`: Reverse Proxy & Web Server (Nginx Alpine con TLS 1.3).
     * `C-04`: API Gateway & Application Server (Node.js LTS / TypeScript / Clean Architecture).
     * `C-05`: Base de Datos Relacional Principal (PostgreSQL 16+ Multi-Tenant con clave `tenant_id` y triggers de inmutabilidad Ley 29733).
     * `C-06`: Almacén en Memoria y Cola de Eventos (Redis 7+ para sesiones, blacklist de JWT y Pub/Sub).
     * `C-07`: Almacenamiento Local en Cliente (Hive / IndexedDB para contingencia offline).
     * `C-08`: Almacén de Archivos (File System / S3 para boletas PDF y carnés QR).
   * **Contenido:** Matriz exhaustiva de conexiones entre contenedores (protocolos, puertos, encriptación, payloads), modelo JSON y topología de red Docker.

3. 📄 **[Nivel 3: Componentes (Components)](Nivel%203/Nivel%203.md)** | 📊 **[Modelo JSON](Nivel%203/c4_nivel_3_componentes.json)**
   * **Alcance:** Desglose del Contenedor de Aplicación `C-04` en 3 capas según Clean Architecture y los 5 Squads:
     * **13 Controladores API:** Autenticación, Usuarios, Configuración, Académico, Asistencia, Practicantes, Docentes Contratados, Planilla Modo Excel, Mapas de Calor, Dashboard 360°, Reportes Oficiales, Auditoría y Portal Web.
     * **12 Servicios de Dominio:** JWT/RBAC, Kiosco Sync Worker, WebSockets Gateway, Motor Modo Excel (debounce 400ms), Conversor CNEB Dual, Asistente de Conclusiones, Motor Drill-Down, Ficha 360°, Calculadora SSU IS-480, Sello Criptográfico SHA-256 y Logger Ley 29733.
     * **4 Adaptadores de Infraestructura:** PostgreSQL Repository, Redis Client, PdfKit Renderer y Smtp Client.
   * **Contenido:** Matriz de dependencias inter-componentes, métodos, DTOs, modelo JSON estructurado y 3 diagramas de secuencia textuales para flujos críticos.

---

## 3. GUÍA PARA LA GENERACIÓN DE DIAGRAMAS GRÁFICOS

Para transformar estas especificaciones textuales en diagramas visuales formales, se recomienda utilizar:

1. **Mermaid.js (Nativo en Markdown / GitHub):**
   * Usar sintaxis `graph TD` o `flowchart TD` con subgrafos (`subgraph`) para representar los límites del sistema o de los contenedores.
2. **PlantUML C4-PlantUML:**
   * Utilizar la librería oficial C4 (`!include <C4/C4_Context>`, `!include <C4/C4_Container>`, `!include <C4/C4_Component>`).
   * Asignar los tags de color institucional: `#1B4D3E` (Sistema principal), `#0B2F64` (Personas internas), `#0288D1` (Frontend), `#283593` (Base de datos).
3. **Structurizr DSL:**
   * Traducir el catálogo de personas, contenedores y componentes directamente al lenguaje declarativo de Structurizr para exportar automáticamente vistas interactivas en web.
