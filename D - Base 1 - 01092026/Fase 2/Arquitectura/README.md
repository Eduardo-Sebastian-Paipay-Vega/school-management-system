# Arquitectura de Software y Diseño de Ingeniería por Squads

Esta carpeta contiene la **documentación de arquitectura técnica de software, diagramas C4, esquemas de persistencia DDL en PostgreSQL y contratos de API REST / WebSockets** para los **Planteles de Aplicación 'Guamán Poma de Ayala' - UNSCH**.

---

## 📄 Documento Maestro de Arquitectura (SAD) y Estándar SDD
* **[arquitectura_sistema.md](arquitectura_sistema.md)**:  
  Documento maestro de arquitectura (SAD), diagramas de contexto y contenedores C4, principios Offline-First, WebSockets y matriz global de asignación de responsabilidades.
* 🛠️ **Skill y Plantilla de Diseño SDD (IEEE 1016):**  
  Para redactar el **Software Design Document (SDD)** de cualquier squad, activar la skill [`.agents/skills/sdd-authoring/`](../../../.agents/skills/sdd-authoring/SKILL.md) o usar directamente la plantilla canónica [`.agents/skills/sdd-authoring/resources/plantilla_sdd.md`](../../../.agents/skills/sdd-authoring/resources/plantilla_sdd.md).

---

## 🏛️ Carpetas Arquitectónicas Especializadas por Squad

Cada carpeta contiene el documento de arquitectura técnica del squad, su script DDL de base de datos (`esquema_datos.sql`) y sus contratos de endpoints (`contratos_api.md`):

1. 🔐 **[Squad 1 - Core y Seguridad](Squad%201%20-%20Core%20y%20Seguridad/README.md)**
   * **Líder Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)
   * **Artefactos:** [Arquitectura](Squad%201%20-%20Core%20y%20Seguridad/README.md) | [Esquema DDL SQL](Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql) | [Contratos API](Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
   * **Enfoque:** Auth JWT dual, Redis blacklist, aislamiento Multi-Tenant y triggers de auditoría inmutable (Ley 29733).

2. ⏱️ **[Squad 2 - Matricula y Asistencia](Squad%202%20-%20Matricula%20y%20Asistencia/README.md)**
   * **Líder Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)
   * **Artefactos:** [Arquitectura](Squad%202%20-%20Matricula%20y%20Asistencia/README.md) | [Esquema DDL SQL](Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql) | [Contratos API](Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
   * **Enfoque:** Kiosco portería Offline-First (Hive/IndexedDB), cola de sincronización, carnés QR y WebSockets de aula (< 500 ms).

3. 📊 **[Squad 3 - Calificaciones y Modo Excel](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/README.md)**
   * **Líder Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)
   * **Artefactos:** [Arquitectura](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/README.md) | [Esquema DDL SQL](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql) | [Contratos API](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
   * **Enfoque:** Planilla matricial Flutter con navegación por teclado y pegado masivo (Ctrl+V), auto-guardado debounce (400 ms) y motor de conversión dual CNEB.

4. 🗺️ **[Squad 4 - Analitica y Dashboards](Squad%204%20-%20Analitica%20y%20Dashboards/README.md)**
   * **Líder Técnico:** Grissel Arascely Rodríguez Quispe (`@Arascely`)
   * **Artefactos:** [Arquitectura](Squad%204%20-%20Analitica%20y%20Dashboards/README.md) | [Esquema DDL SQL](Squad%204%20-%20Analitica%20y%20Dashboards/esquema_datos.sql) | [Contratos API](Squad%204%20-%20Analitica%20y%20Dashboards/contratos_api.md)
   * **Enfoque:** Vistas materializadas analíticas, mapas de calor con navegación Drill-Down interactiva, Ficha 360° del alumno y métricas SSU IS-480.

5. 📑 **[Squad 5 - Secretaria y Portal Web](Squad%205%20-%20Secretaria%20y%20Portal%20Web/README.md)**
   * **Líder Técnico:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)
   * **Artefactos:** [Arquitectura](Squad%205%20-%20Secretaria%20y%20Portal%20Web/README.md) | [Esquema DDL SQL](Squad%205%20-%20Secretaria%20y%20Portal%20Web/esquema_datos.sql) | [Contratos API](Squad%205%20-%20Secretaria%20y%20Portal%20Web/contratos_api.md)
   * **Enfoque:** Generador de boletas oficiales PDF, firmado criptográfico SHA-256 inmutable + QR público sin login, y portal institucional.

---

> La especificación funcional y normativa de los requisitos (`RF-01.md` al `RF-71.md`) se encuentra en **[Fase 2 / Requisitos Funcionales](../Requisitos%20Funcionales/README.md)**.
