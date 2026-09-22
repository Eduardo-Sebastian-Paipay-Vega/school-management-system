# Fase 2: Diseño y Desarrollo de Software

La documentación formal y estructurada de requisitos y casos de uso del sistema para la Fase II se encuentra organizada en tres documentos complementarios:

1. 📄 **[Requisitos Funcionales/requisitos_funcionales.md](Requisitos%20Funcionales/requisitos_funcionales.md)**  
   *Catálogo y Especificación Documental Formal (Estándar IEEE 830 / ISO 29148):* Enunciados normativos (*"El sistema deberá..."*), precondiciones, entradas, procesos, salidas, postcondiciones y criterios de aceptación para los **71 Requisitos Funcionales (`RF-01` al `RF-71`)**.

2. 📄 **[Requisitos No Funcionales/requisitos_no_funcionales.md](Requisitos%20No%20Funcionales/requisitos_no_funcionales.md)**  
   *Especificación Documental de Requisitos No Funcionales (Estándar ISO/IEC 25010):* 20 RNF cuantificables (Rendimiento, Seguridad JWT/RBAC/Ley 29733, Resiliencia Offline-First, WCAG 2.1 AA, Clean Architecture) asignados a los 5 Squads.

3. 📄 **[Requisitos Funcionales/requisitos_funcionales_tecnicos.md](Requisitos%20Funcionales/requisitos_funcionales_tecnicos.md)**  
   *Especificación Técnica de Software (SRS Técnico):* Arquitectura Flutter Web + Backend REST + PostgreSQL Multi-Tenant + Redis + WebSockets, contratos JSON tipados de API, esquemas SQL, transacciones ACID, lógica Offline-First y verificación criptográfica SHA-256.

4. 📄 **[Casos de uso/README.md](Casos%20de%20uso/README.md)**  
   *Catálogo Maestro de Casos de Uso (CU UML):* Trazabilidad de actores, flujos principales y alternativos para la ejecución de los 71 requisitos y las capacidades de innovación del sistema.

5. 📄 **[Arquitectura/arquitectura_sistema.md](Arquitectura/arquitectura_sistema.md)**  
   *Documento de Arquitectura de Software y Plan de Distribución Técnica:* Diagramas C4, Clean Architecture, estrategias Offline-First, WebSockets y la **matriz de asignación de los 71 RFs y 20 RNFs en 5 Squads técnicos especializados**.

---

## Módulos del Sistema y Capacidades de Innovación

- **Módulo 1: Acceso, Autenticación JWT y RBAC** (`RF-01` al `RF-04`)
- **Módulo 2: Administración de Usuarios y Directorio** (`RF-05` al `RF-09`)
- **Módulo 3: Configuración Escolar, Periodos y Escalas** (`RF-10` al `RF-14`)
- **Módulo 4: Gestión Académica, Matrícula y Carga Lectiva** (`RF-15` al `RF-19`)
- **Módulo 5: Asistencia Estudiantil, Kiosco Offline-First, App Rápida y Carnés QR** (`RF-20` al `RF-27`)
- **Módulo 6: Asistencia y Cómputo de Horas de Practicantes** (`RF-28` al `RF-31`)
- **Módulo 7: Horas de Docentes Contratados y Reprogramación** (`RF-32` al `RF-35`)
- **Módulo 8: Calificaciones en Tiempo Real, Auto-Guardado y Conversión CNEB** (`RF-36` al `RF-46`)
- **Módulo 9: Mapas de Calor con Navegación Drill-Down** (`RF-47` al `RF-51`)
- **Módulo 10: Dashboards, Ficha 360° del Alumno y Métricas SSU IS-480** (`RF-52` al `RF-58`)
- **Módulo 11: Emisión de Reportes y Verificación Criptográfica QR** (`RF-59` al `RF-64`)
- **Módulo 12: Trazabilidad, Auditoría y Protección de Datos (Ley 29733)** (`RF-65` al `RF-68`)
- **Módulo 13: Plataforma de Difusión Digital y Portal Institucional** (`RF-69` al `RF-71`)
