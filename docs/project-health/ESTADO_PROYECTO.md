# Auditoría del estado del proyecto

**Proyecto:** Sistema de Gestión Escolar — Planteles de Aplicación Guamán Poma de Ayala (UNSCH)
**Resultado:** 251 / 1000 — EN DESARROLLO
**Fecha:** 2026-10-22  |  **Rama:** dev  |  **Commit:** d566f4dc
**Árbol modificado:** Sí

## Alcance y cobertura

- Inventario: complete; cobertura total declarada: sí
- Módulos esperados: M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11, M12, M13
- Módulos revisados: M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11, M12, M13
- RF aceptados: 0 / 89; probados o aceptados: 0 / 89

### Fuentes de RF

- D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/requisitos_funcionales.md (89 RF, tabla maestra)
- D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad */RF-XX.md (89 fichas con criterios)
- D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (20 RNF)
- D - Base 1 - 01092026/Fase 2/Casos de uso (89 CU)

### Conflictos de alcance

- Ninguno registrado

### Limitaciones

- Árbol modificado: 18 archivos sin commit, incluido el core de autenticación auditado (backend/src/controllers, services, routes)
- Sin ejecución E2E con PostgreSQL/Redis reales ni revisión visual en navegador
- No se consultaron issues, tableros ni aceptaciones formales fuera del repositorio
- Prioridad mapeada: Esencial=high, Deseable=medium, Opcional=low; RNF sin prioridad oficial = medium
- Controles QA/INT/SEC/ARCH/OPS/DOC definidos por el auditor a partir de RNF y AGENTS.md
- Correcciones PH-001/002/008 comprobadas con pruebas ad hoc fuera del repo (PGlite + pgcrypto; arranque sin secretos); no hay pruebas versionadas del core

## Matriz de madurez /1000

| Área | Puntaje de rúbrica | Máximo |
|---|---:|---:|
| Requisitos funcionales | 64 | 400 |
| Requisitos no funcionales | 22 | 100 |
| Calidad y pruebas | 69 | 150 |
| Integraciones y E2E | 18 | 100 |
| Seguridad e integridad | 39 | 100 |
| Arquitectura y datos | 21 | 70 |
| Operación y despliegue | 13 | 50 |
| Documentación y consistencia | 7 | 30 |

**Advertencia:** la puntuación requiere inventario integral. La existencia de código o test no garantiza un RF aceptado.

## Requisitos y controles auditados

| ID | Área | Módulo | Prioridad | Estado | Evidencia localizada |
|---|---|---|---|---|---|
| RF-01 — Autenticación Segura de Usuarios mediante Credenciales Institucionales | RF | M1: Acceso y Seguridad | high | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-01.md §3 Criterios de Aceptación; implementation: backend/src/services/auth.service.ts login: bcrypt vía pgcrypto crypt(), sin usuarios de respaldo (frontend aún no integrado) |
| RF-02 — Cierre de Sesión Seguro y Terminación Automática por Inactividad | RF | M1: Acceso y Seguridad | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-02.md §3 Criterios de Aceptación |
| RF-03 — Restablecimiento Asistido de Contraseñas de Acceso | RF | M1: Acceso y Seguridad | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-03.md §3 Criterios de Aceptación |
| RF-04 — Control de Privilegios y Acceso Basado en Roles (RBAC) | RF | M1: Acceso y Seguridad | high | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-04.md §3 Criterios de Aceptación; implementation: backend/src/middlewares/rbac.middleware.ts:8 requireRoles (sin pruebas; UI no aplica roles reales) |
| RF-05 — Registro y Alta Formal de Cuentas de Personal Institucional | RF | M2: Gestión de Usuarios | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-05.md §3 Criterios de Aceptación |
| RF-06 — Importación Masiva de Usuarios desde Archivos Excel / CSV | RF | M2: Gestión de Usuarios | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-06.md §3 Criterios de Aceptación |
| RF-07 — Gestión de Sedes y Planteles Escolares Multi-Tenant | RF | M2: Gestión de Usuarios | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-07.md §3 Criterios de Aceptación |
| RF-08 — Directorio Escolar y Búsqueda Rápida de Personal | RF | M2: Gestión de Usuarios | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-08.md §3 Criterios de Aceptación |
| RF-09 — Gestión de Perfil Personal y Cambio Autónomo de Credenciales | RF | M2: Gestión de Usuarios | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-09.md §3 Criterios de Aceptación |
| RF-10 — Parametrización del Año Lectivo y Calendario Escolar | RF | M3: Configuración Escolar | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-10.md §3 Criterios de Aceptación |
| RF-11 — Apertura, Parametrización y Cierre de Periodos Académicos | RF | M3: Configuración Escolar | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-11.md §3 Criterios de Aceptación |
| RF-12 — Estructuración de Niveles Educativos, Grados y Secciones | RF | M3: Configuración Escolar | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-12.md §3 Criterios de Aceptación |
| RF-13 — Definición de Escalas de Calificación Institucionales (Dual CNEB) | RF | M3: Configuración Escolar | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-13.md §3 Criterios de Aceptación |
| RF-14 — Parámetros Globales del Sistema y Membretes Institucionales | RF | M3: Configuración Escolar | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-14.md §3 Criterios de Aceptación |
| RF-15 — Registro, Filiación y Actualización del Padrón de Estudiantes | RF | M4: Gestión Académica | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-15.md §3 Criterios de Aceptación |
| RF-16 — Matrícula Escolar y Asignación de Estudiantes a Secciones | RF | M4: Gestión Académica | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-16.md §3 Criterios de Aceptación |
| RF-17 — Catálogo Curricular y Planes de Estudio oficiales según CNEB | RF | M4: Gestión Académica | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-17.md §3 Criterios de Aceptación |
| RF-18 — Asignación y Distribución de Carga Lectiva Docente | RF | M4: Gestión Académica | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-18.md §3 Criterios de Aceptación |
| RF-19 — Consulta y Generación de Nóminas Oficiales de Aula | RF | M4: Gestión Académica | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-19.md §3 Criterios de Aceptación |
| RF-20 — Registro Ordinario de Asistencia Escolar en el Aula | RF | M5: Asistencia Estudiantil | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-20.md §3 Criterios de Aceptación |
| RF-21 — Registro de Ingreso Físico en Modo Kiosco de Portería | RF | M5: Asistencia Estudiantil | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-21.md §3 Criterios de Aceptación |
| RF-22 — Gestión y Justificación Formal de Inasistencias y Tardanzas | RF | M5: Asistencia Estudiantil | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-22.md §3 Criterios de Aceptación |
| RF-23 — Consolidación y Consulta del Récord de Asistencia por Estudiante | RF | M5: Asistencia Estudiantil | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-23.md §3 Criterios de Aceptación |
| RF-24 — Detección y Generación de Alertas por Ausentismo Crónico | RF | M5: Asistencia Estudiantil | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-24.md §3 Criterios de Aceptación |
| RF-25 — Kiosco de Portería Resiliente con Modo Desconectado (Offline-First) | RF | M5: Asistencia Estudiantil | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-25.md §3 Criterios de Aceptación |
| RF-26 — Generación y Emisión Masiva de Carnés Escolares con Código QR/Barras | RF | M5: Asistencia Estudiantil | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-26.md §3 Criterios de Aceptación |
| RF-27 — Toma Rápida en App Móvil y Difusión en Tiempo Real (WebSockets) | RF | M5: Asistencia Estudiantil | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-27.md §3 Criterios de Aceptación |
| RF-28 — Registro Diario de Jornada y Permanencia de Practicantes EPIS-UNSCH | RF | M6: Practicantes | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-28.md §3 Criterios de Aceptación |
| RF-29 — Asignación de Docente Guía y Asesor Institucional | RF | M6: Practicantes | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-29.md §3 Criterios de Aceptación |
| RF-30 — Cómputo Acumulado de Horas Efectivas de Prácticas Universitarias | RF | M6: Practicantes | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-30.md §3 Criterios de Aceptación |
| RF-31 — Emisión de Fichas Oficiales de Prácticas para la UNSCH | RF | M6: Practicantes | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-31.md §3 Criterios de Aceptación |
| RF-32 — Registro y Marcación de Horas Lectivas de Docentes Contratados | RF | M7: Docentes Contratados | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-32.md §3 Criterios de Aceptación |
| RF-33 — Registro de Justificaciones y Reprogramación de Clases Docentes | RF | M7: Docentes Contratados | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-33.md §3 Criterios de Aceptación |
| RF-34 — Consolidación Mensual de Cumplimiento de Horas Lectivas Dictadas | RF | M7: Docentes Contratados | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-34.md §3 Criterios de Aceptación |
| RF-35 — Supervisión y Monitoreo de Cobertura y Puntualidad de Clases | RF | M7: Docentes Contratados | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-35.md §3 Criterios de Aceptación |
| RF-36 — Parametrización de Rúbricas y Evaluaciones por Asignatura | RF | M8: Calificaciones | high | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 3 - Calificaciones y Modo Excel/RF-36.md §3 Criterios de Aceptación; implementation: backend/squad_3_calificaciones/src/domain.ts:106 acción evaluation (solo backend; UI mock); other: cmd: npm test en backend/squad_3_calificaciones -&gt; 16/16 OK (2026-10-22, PGlite en memoria) (prueba de dominio; sin recorrido UI integrado) |
| RF-37 — Ingreso, Edición y Publicación de Calificaciones en Tiempo Real | RF | M8: Calificaciones | high | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 3 - Calificaciones y Modo Excel/RF-37.md §3 Criterios de Aceptación; implementation: backend/squad_3_calificaciones/src/domain.ts:82 applyBatch + :125 publish (solo backend); other: cmd: npm test en backend/squad_3_calificaciones -&gt; 16/16 OK (2026-10-22, PGlite en memoria) (prueba de dominio; sin recorrido UI integrado) |
| RF-38 — Planilla Ágil de Notas en Modo Matriz Rápida (&quot;Modo Excel / Teclado&quot;) | RF | M8: Calificaciones | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 3 - Calificaciones y Modo Excel/RF-38.md §3 Criterios de Aceptación |
| RF-39 — Asistente de Conclusiones Descriptivas Sugeridas por Logro (MINEDU) | RF | M8: Calificaciones | medium | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 3 - Calificaciones y Modo Excel/RF-39.md §3 Criterios de Aceptación; implementation: backend/squad_3_calificaciones/src/domain.ts:131 conclusion B/C obligatoria (solo backend); other: cmd: npm test en backend/squad_3_calificaciones -&gt; 16/16 OK (2026-10-22, PGlite en memoria) (prueba de dominio; sin recorrido UI integrado) |
| RF-40 — Colaboración Supervisada de Practicantes en el Registro de Notas | RF | M8: Calificaciones | medium | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 3 - Calificaciones y Modo Excel/RF-40.md §3 Criterios de Aceptación; implementation: backend/squad_3_calificaciones/src/domain.ts:114-124 approve/reject practicante (solo backend); other: cmd: npm test en backend/squad_3_calificaciones -&gt; 16/16 OK (2026-10-22, PGlite en memoria) (prueba de dominio; sin recorrido UI integrado) |
| RF-41 — Cálculo Automatizado de Promedios Parciales, Bimestrales y Finales | RF | M8: Calificaciones | high | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 3 - Calificaciones y Modo Excel/RF-41.md §3 Criterios de Aceptación; implementation: backend/squad_3_calificaciones/src/domain.ts:62 summary y :188 annualSummary (solo backend); other: cmd: npm test en backend/squad_3_calificaciones -&gt; 16/16 OK (2026-10-22, PGlite en memoria) (prueba de dominio; sin recorrido UI integrado) |
| RF-42 — Cierre Oficial de Periodo Académico y Bloqueo de Modificación | RF | M8: Calificaciones | high | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 3 - Calificaciones y Modo Excel/RF-42.md §3 Criterios de Aceptación; implementation: backend/squad_3_calificaciones/src/domain.ts:53 isClosed y :137 close (solo backend); other: cmd: npm test en backend/squad_3_calificaciones -&gt; 16/16 OK (2026-10-22, PGlite en memoria) (prueba de dominio; sin recorrido UI integrado) |
| RF-43 — Flujo Extraordinario de Solicitud y Aprobación de Rectificación de Notas | RF | M8: Calificaciones | medium | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 3 - Calificaciones y Modo Excel/RF-43.md §3 Criterios de Aceptación; implementation: backend/squad_3_calificaciones/src/domain.ts:142-170 rectification/decide (solo backend); other: cmd: npm test en backend/squad_3_calificaciones -&gt; 16/16 OK (2026-10-22, PGlite en memoria) (prueba de dominio; sin recorrido UI integrado) |
| RF-44 — Consulta Inmediata y Transparente de Calificaciones para Estudiantes | RF | M8: Calificaciones | high | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 3 - Calificaciones y Modo Excel/RF-44.md §3 Criterios de Aceptación; implementation: backend/squad_3_calificaciones/src/domain.ts:205 view con aislamiento por estudiante (solo backend); other: cmd: npm test en backend/squad_3_calificaciones -&gt; 16/16 OK (2026-10-22, PGlite en memoria) (prueba de dominio; sin recorrido UI integrado) |
| RF-45 — Llenado Asistido con Auto-Guardado y Conexión Automática en Segundo Plano | RF | M8: Calificaciones | high | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 3 - Calificaciones y Modo Excel/RF-45.md §3 Criterios de Aceptación; implementation: backend/squad_3_calificaciones/src/app.ts:66 PATCH /api/v1/grades/auto-save y revisiones (solo backend); other: cmd: npm test en backend/squad_3_calificaciones -&gt; 16/16 OK (2026-10-22, PGlite en memoria) (prueba de dominio; sin recorrido UI integrado) |
| RF-46 — Motor de Conversión Escala Vigesimal (0-20) a Literal CNEB (AD, A, B, C) | RF | M8: Calificaciones | high | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 3 - Calificaciones y Modo Excel/RF-46.md §3 Criterios de Aceptación; implementation: backend/squad_3_calificaciones/src/domain.ts:41 literal 0-20 -&gt; AD/A/B/C (solo backend); other: cmd: npm test en backend/squad_3_calificaciones -&gt; 16/16 OK (2026-10-22, PGlite en memoria) (prueba de dominio; sin recorrido UI integrado) |
| RF-47 — Generación de Mapa de Calor de Rendimiento Académico por Sección | RF | M9: Mapas de Calor | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 4 - Analitica y Dashboards/RF-47.md §3 Criterios de Aceptación |
| RF-48 — Generación de Mapa de Calor de Asistencia y Puntualidad | RF | M9: Mapas de Calor | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 4 - Analitica y Dashboards/RF-48.md §3 Criterios de Aceptación |
| RF-49 — Mapas de Calor Interactivos con Navegación a Detalle (Drill-Down) | RF | M9: Mapas de Calor | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 4 - Analitica y Dashboards/RF-49.md §3 Criterios de Aceptación |
| RF-50 — Análisis Gráfico Comparativo de Rendimiento entre Secciones | RF | M9: Mapas de Calor | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 4 - Analitica y Dashboards/RF-50.md §3 Criterios de Aceptación |
| RF-51 — Detección Visual de Asignaturas con Mayor Índice de Riesgo | RF | M9: Mapas de Calor | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 4 - Analitica y Dashboards/RF-51.md §3 Criterios de Aceptación |
| RF-52 — Tablero de Control Ejecutivo de Indicadores Clave para Dirección | RF | M10: Monitoreo y Dashboards | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 4 - Analitica y Dashboards/RF-52.md §3 Criterios de Aceptación |
| RF-53 — Tablero de Control Curricular y Cumplimiento para Coordinación | RF | M10: Monitoreo y Dashboards | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 4 - Analitica y Dashboards/RF-53.md §3 Criterios de Aceptación |
| RF-54 — Tablero de Resumen Pedagógico y Clases Diarias para el Docente | RF | M10: Monitoreo y Dashboards | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 4 - Analitica y Dashboards/RF-54.md §3 Criterios de Aceptación |
| RF-55 — Generación Automatizada de Alertas de Deserción y Repitencia | RF | M10: Monitoreo y Dashboards | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 4 - Analitica y Dashboards/RF-55.md §3 Criterios de Aceptación |
| RF-56 — Ficha Integral y Radiografía Escolar 360° del Estudiante en 1 Clic | RF | M10: Monitoreo y Dashboards | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 4 - Analitica y Dashboards/RF-56.md §3 Criterios de Aceptación |
| RF-57 — Tablero de Seguimiento, Impacto y Acreditación del SSU (IS-480) | RF | M10: Monitoreo y Dashboards | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 4 - Analitica y Dashboards/RF-57.md §3 Criterios de Aceptación |
| RF-58 — Generador de Reportes de Diagnóstico Integral para Consejos Académicos | RF | M10: Monitoreo y Dashboards | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 4 - Analitica y Dashboards/RF-58.md §3 Criterios de Aceptación |
| RF-59 — Emisión Oficial de Boletas de Información Escolar / Libretas en PDF | RF | M11: Reportes Oficiales | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 5 - Secretaria y Portal Web/RF-59.md §3 Criterios de Aceptación |
| RF-60 — Verificación Pública Criptográfica de Documentos Escolares mediante Código QR | RF | M11: Reportes Oficiales | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 5 - Secretaria y Portal Web/RF-60.md §3 Criterios de Aceptación |
| RF-61 — Generación del Cuadro de Mérito y Puestos de Honor Institucionales | RF | M11: Reportes Oficiales | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 5 - Secretaria y Portal Web/RF-61.md §3 Criterios de Aceptación |
| RF-62 — Emisión y Descarga del Registro Auxiliar Oficial y Actas Finales | RF | M11: Reportes Oficiales | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 5 - Secretaria y Portal Web/RF-62.md §3 Criterios de Aceptación |
| RF-63 — Reportes Consolidados de Asistencia Multiactor del Plantel | RF | M11: Reportes Oficiales | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 5 - Secretaria y Portal Web/RF-63.md §3 Criterios de Aceptación |
| RF-64 — Exportación de Datos en Formatos Estándar Abiertos (PDF y Excel SIAGIE) | RF | M11: Reportes Oficiales | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 5 - Secretaria y Portal Web/RF-64.md §3 Criterios de Aceptación |
| RF-65 — Registro Inmutable de Auditoría de Eventos y Seguridad | RF | M12: Auditoría y Seguridad | high | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-65.md §3 Criterios de Aceptación; implementation: backend/src/services/audit.service.ts:24-60 cadena SHA-256 prev_hash (sin pruebas) |
| RF-66 — Trazabilidad Histórica de Modificaciones en Notas y Asistencias | RF | M12: Auditoría y Seguridad | high | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-66.md §3 Criterios de Aceptación; implementation: backend/squad_3_calificaciones/migrations/001_grades.sql historial inmutable de notas; implementation: backend/src/services/audit.service.ts registro LOGIN; other: cmd: npm test en backend/squad_3_calificaciones -&gt; 16/16 OK (2026-10-22, PGlite en memoria) (prueba de dominio; sin recorrido UI integrado) |
| RF-67 — Módulo de Búsqueda y Monitoreo de Bitácoras de Auditoría | RF | M12: Auditoría y Seguridad | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-67.md §3 Criterios de Aceptación |
| RF-68 — Cumplimiento y Protección de Datos Personales (Ley N.° 29733) | RF | M12: Auditoría y Seguridad | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-68.md §3 Criterios de Aceptación |
| RF-69 — Cartelera Digital y Publicación de Comunicados Institucionales | RF | M13: Difusión Digital | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 5 - Secretaria y Portal Web/RF-69.md §3 Criterios de Aceptación |
| RF-70 — Publicación y Consulta del Calendario Cívico y Escolar Interactivo | RF | M13: Difusión Digital | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 5 - Secretaria y Portal Web/RF-70.md §3 Criterios de Aceptación |
| RF-71 — Portal Informativo Institucional y Normas de Convivencia Escolar | RF | M13: Difusión Digital | low | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 5 - Secretaria y Portal Web/RF-71.md §3 Criterios de Aceptación; implementation: frontend/app/(landing)/* portal estático: niveles, admision, servicios, contacto |
| RF-72 — Modificación de Datos y Baja Lógica de Usuarios del Plantel | RF | M2: Gestión de Usuarios | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-72.md §3 Criterios de Aceptación |
| RF-73 — Reasignación Dinámica de Roles y Jerarquías del Personal | RF | M2: Gestión de Usuarios | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-73.md §3 Criterios de Aceptación |
| RF-74 — Conformidad y Validación Periódica de Horas por el Docente Tutor | RF | M6: Practicantes | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-74.md §3 Criterios de Aceptación |
| RF-75 — Cuenta del Apoderado con Vínculo Verificado y Consentimiento de Datos | RF | M2: Gestión de Usuarios | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-75.md §3 Criterios de Aceptación |
| RF-76 — Centro de Notificaciones Internas y por Correo Electrónico | RF | M2: Gestión de Usuarios | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 1 - Core y Seguridad/RF-76.md §3 Criterios de Aceptación |
| RF-77 — Aviso Automático de Inasistencias y Tardanzas al Apoderado | RF | M5: Asistencia Estudiantil | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-77.md §3 Criterios de Aceptación |
| RF-78 — Importación Masiva de Estudiantes y Matrícula desde Nóminas Excel (Formato SIAGI | RF | M4: Gestión Académica | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 2 - Matricula y Asistencia/RF-78.md §3 Criterios de Aceptación |
| RF-79 — Programación de Tareas, Exámenes y Actividades Evaluativas con Calendario | RF | M8: Calificaciones | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 3 - Calificaciones y Modo Excel/RF-79.md §3 Criterios de Aceptación |
| RF-80 — Carga Masiva de Calificaciones desde Plantilla Excel Precargada | RF | M8: Calificaciones | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 3 - Calificaciones y Modo Excel/RF-80.md §3 Criterios de Aceptación |
| RF-81 — Control de Plazos de Registro de Notas y Alertas Escalonadas a Docentes | RF | M8: Calificaciones | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 3 - Calificaciones y Modo Excel/RF-81.md §3 Criterios de Aceptación |
| RF-82 — Consulta de Notas, Tareas y Exámenes por el Apoderado | RF | M8: Calificaciones | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 3 - Calificaciones y Modo Excel/RF-82.md §3 Criterios de Aceptación |
| RF-83 — Tablero de Cumplimiento y Puntualidad del Registro de Notas por Docente | RF | M10: Monitoreo y Dashboards | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 4 - Analitica y Dashboards/RF-83.md §3 Criterios de Aceptación |
| RF-84 — Gestor de Noticias Institucionales con Editor, Galería y Publicación Programada | RF | M13: Difusión Digital | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 5 - Secretaria y Portal Web/RF-84.md §3 Criterios de Aceptación |
| RF-85 — Publicación en la Página Oficial de Facebook y Feed Integrado en el Portal | RF | M13: Difusión Digital | low | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 5 - Secretaria y Portal Web/RF-85.md §3 Criterios de Aceptación |
| RF-86 — Mesa de Partes Virtual para Solicitudes, Consultas y Quejas | RF | M11: Reportes Oficiales | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 5 - Secretaria y Portal Web/RF-86.md §3 Criterios de Aceptación |
| RF-87 — Solicitud y Emisión Rápida de Certificados y Constancias en Línea | RF | M11: Reportes Oficiales | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 5 - Secretaria y Portal Web/RF-87.md §3 Criterios de Aceptación |
| RF-88 — Generación de Archivos de Carga para el SIAGIE con Validación y Control de Envío | RF | M11: Reportes Oficiales | high | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 5 - Secretaria y Portal Web/RF-88.md §3 Criterios de Aceptación |
| RF-89 — Agenda de Citas entre Apoderados y Tutores o Docentes | RF | M10: Monitoreo y Dashboards | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad 4 - Analitica y Dashboards/RF-89.md §3 Criterios de Aceptación |
| RNF-01 — Latencia y Tiempo de Respuesta UI | RNF | transversal | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-01) |
| RNF-02 — Auto-guardado con Debounce | RNF | transversal | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-02) |
| RNF-03 — Latencia de Decodificación en Kiosco | RNF | transversal | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-03) |
| RNF-04 — Renderizado de Dashboards Analíticos | RNF | transversal | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-04) |
| RNF-05 — Autenticación Segura con JWT | RNF | transversal | medium | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-05); implementation: backend/src/services/auth.service.ts:25-50 HS256 15m + refresh cookie HttpOnly (secretos con fallback inseguro) |
| RNF-06 — Control de Acceso Basado en Roles (RBAC) | RNF | transversal | medium | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-06); implementation: backend/src/middlewares/rbac.middleware.ts (solo endpoints de auditoría; UI sin RBAC real) |
| RNF-07 — Hashing de Contraseñas con Salt Dinámico | RNF | transversal | medium | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-07); implementation: backend/src/services/auth.service.ts: password_hash = crypt(clave, password_hash) con hashes gen_salt(&#x27;bf&#x27;, 12) |
| RNF-08 — Protección de Datos Personales (Ley 29733) | RNF | transversal | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-08) |
| RNF-09 — Verificación Criptográfica Documental QR | RNF | transversal | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-09) |
| RNF-10 — Alta Disponibilidad del Servicio | RNF | transversal | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-10) |
| RNF-11 — Resiliencia Offline-First en Kiosco | RNF | transversal | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-11) |
| RNF-12 — Integridad Transaccional ACID | RNF | transversal | medium | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-12); implementation: backend/squad_3_calificaciones/test/postgres.test.ts transacción con rollback (solo notas; matrícula masiva no existe) |
| RNF-13 — Diseño Responsivo y Soporte Multi-Dispositivo | RNF | transversal | medium | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-13); implementation: frontend/app/** clases responsive Tailwind (sin verificación visual en esta auditoría) |
| RNF-14 — Ergonomía de Teclado (&quot;Modo Excel&quot;) | RNF | transversal | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-14) |
| RNF-15 — Accesibilidad Visual y Contraste (WCAG 2.1 AA) | RNF | transversal | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-15) |
| RNF-16 — Arquitectura Modular Feature-First | RNF | transversal | medium | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-16); implementation: frontend/modules/squads/squad_[1-5]_*/ estructura Feature-First observada |
| RNF-17 — Análisis Estático y Cobertura de Pruebas | RNF | transversal | medium | implemented | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-17); implementation: frontend lint 0 errores/78 avisos y build OK; backend tsc OK; backend npm test (jest) no instalado |
| RNF-18 — Estandarización Documental de Software (SDD) | RNF | transversal | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-18) |
| RNF-19 — Portabilidad y Despliegue Multiplataforma | RNF | transversal | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-19) |
| RNF-20 — Compatibilidad con Navegadores Modernos | RNF | transversal | medium | specified | spec: D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md (RNF-20) |
| QA-01 — Lint frontend sin errores | QA | transversal | high | verified | implementation: frontend/eslint.config.mjs; test: npm run lint -&gt; 0 errores, 78 avisos (2026-10-22) |
| QA-02 — Build frontend Next.js | QA | transversal | high | verified | implementation: frontend/package.json build; test: npm run build -&gt; OK, 18 páginas (2026-10-22) |
| QA-03 — Compilación TypeScript backend core | QA | transversal | high | verified | implementation: backend/tsconfig.json; test: npx tsc --noEmit -&gt; OK (2026-10-22) |
| QA-04 — Suite de pruebas backend core | QA | transversal | high | not_started | Sin evidencia |
| QA-05 — Suite de pruebas Squad 3 | QA | transversal | high | verified | implementation: backend/squad_3_calificaciones/test/*.test.ts; test: cmd: npm test en backend/squad_3_calificaciones -&gt; 16/16 OK (2026-10-22, PGlite en memoria) |
| QA-06 — Pruebas automatizadas frontend | QA | transversal | medium | not_started | Sin evidencia |
| QA-07 — CI que ejecute lint/build/test | QA | transversal | high | not_started | Sin evidencia |
| QA-08 — Lint backend ejecutable | QA | transversal | low | not_started | Sin evidencia |
| INT-01 — Login frontend contra API de autenticación | INT | transversal | high | not_started | Sin evidencia |
| INT-02 — Módulos frontend de squads consumen APIs reales | INT | transversal | high | not_started | Sin evidencia |
| INT-03 — Contrato JWT común core &lt;-&gt; Squad 3 | INT | transversal | high | not_started | Sin evidencia |
| INT-04 — REST + WebSocket Squad 3 integrados | INT | transversal | medium | verified | implementation: backend/squad_3_calificaciones/src/app.ts; test: backend/squad_3_calificaciones/test/http.test.ts -&gt; OK (2026-10-22) |
| INT-05 — Esquema BD cargado por docker-compose | INT | transversal | medium | implemented | implementation: docker-compose.yml:14 monta database/init (no ejecutado) |
| INT-06 — Revocación de tokens vía Redis aplicada | INT | transversal | medium | specified | spec: backend/src/services/auth.service.ts revokeToken (middleware no lo consulta) |
| SEC-01 — Verificación real de contraseña | SEC | transversal | critical | implemented | implementation: backend/src/services/auth.service.ts login con crypt() y sin respaldo |
| SEC-02 — Secretos JWT sin valores por defecto | SEC | transversal | high | implemented | implementation: backend/src/config/jwt.ts exige JWT_SECRET/JWT_REFRESH_SECRET &gt;= 32 |
| SEC-03 — CORS con lista blanca efectiva | SEC | transversal | high | not_started | Sin evidencia |
| SEC-04 — Tenant ligado al JWT en core | SEC | transversal | high | specified | spec: RF-07 / backend/src/middlewares/tenant.middleware.ts |
| SEC-05 — Autorización y RLS por tenant en Squad 3 | SEC | transversal | high | verified | implementation: backend/squad_3_calificaciones/migrations/001_grades.sql RLS; test: backend/squad_3_calificaciones/test/postgres.test.ts tenant RLS -&gt; OK (2026-10-22) |
| SEC-06 — Bitácora de auditoría encadenada SHA-256 | SEC | transversal | medium | implemented | implementation: backend/src/services/audit.service.ts:40 |
| SEC-07 — Cabeceras de seguridad y límite de cuerpo | SEC | transversal | low | implemented | implementation: backend/src/server.ts helmet + express.json limit |
| SEC-08 — Hash de contraseñas bcrypt &gt;= 12 | SEC | transversal | high | implemented | implementation: pgcrypto gen_salt(&#x27;bf&#x27;, 12) verificado en prueba ad hoc ($2a$12$) |
| ARCH-01 — Esquema consolidado PostgreSQL | ARCH | transversal | high | implemented | implementation: database/init/01_esquema_consolidado.sql (42 tablas, pgcrypto) |
| ARCH-02 — Arquitectura C4 documentada y seguida | ARCH | transversal | medium | implemented | implementation: D - Base 1 - 01092026/Fase 2/Arquitectura/arquitectura_sistema.md + estructura monorepo |
| ARCH-03 — Migraciones versionadas en core | ARCH | transversal | medium | specified | spec: solo database/init y squad_3 001_grades.sql |
| ARCH-04 — Decisión de backend único vs servicios por squad | ARCH | transversal | medium | specified | spec: docs/F0_DECISIONES_ARQUITECTURA_PENDIENTES.md |
| OPS-01 — Entorno local reproducible (Docker Compose) | OPS | transversal | medium | implemented | implementation: docker-compose.yml PostgreSQL 16 + Redis 7 |
| OPS-02 — Configuración de despliegue frontend | OPS | transversal | medium | implemented | implementation: vercel.json (despliegue no verificado) |
| OPS-03 — Despliegue backend | OPS | transversal | medium | not_started | Sin evidencia |
| OPS-04 — Monitoreo, backup y restore | OPS | transversal | medium | not_started | Sin evidencia |
| OPS-05 — Endpoint de salud | OPS | transversal | low | implemented | implementation: backend/src/routes/health.routes.ts |
| DOC-01 — Catálogo RF/CU/RNF completo con criterios | DOC | transversal | high | implemented | implementation: D - Base 1 - 01092026/Fase 2: 89 RF con §3 criterios, 89 CU, 20 RNF |
| DOC-02 — README coherente con el código | DOC | transversal | medium | specified | spec: README.md:87 menciona PrimeNG; el código usa PrimeReact |
| DOC-03 — Acta de cambio de arquitectura aprobada | DOC | transversal | medium | specified | spec: docs/F0_ACTA_CAMBIO_ARQUITECTURA_BORRADOR.md (sin firmas) |
| DOC-04 — SDD por cada squad (IEEE 1016) | DOC | transversal | medium | specified | spec: Solo sdd_squad_1.md y sdd_squad_3.md |

## Fases F00–F15

| Fase | Estado | Evidencia |
|---|---|---|
| F00 | evidenciada | docs/F0_*.md y Fase 1 (delimitaciones, limitaciones, stakeholders) |
| F01 | evidenciada | D - Base 1 - 01092026/Fase 1/Requerimientos y stakeholders.md |
| F02 | evidenciada | 89 RF con criterios, 89 CU, 20 RNF en Fase 2 |
| F03 | en_progreso | plan_trabajo.md; sin backlog/hitos verificables en repo |
| F04 | en_progreso | C4 y arquitectura_sistema.md; acta D-01 sin aprobar |
| F05 | en_progreso | Esquema SQL consolidado; sin OpenAPI ni migraciones del core |
| F06 | en_progreso | Portal e intranet con datos simulados; sin validación de UX/accesibilidad |
| F07 | en_progreso | Git + Docker Compose; CI solo PR-Agent, sin lint/build/test |
| F08 | en_progreso | Login con bcrypt y secretos obligatorios; RBAC parcial, tenant no ligado al JWT, sin pruebas versionadas |
| F09 | en_progreso | Solo Squad 3 tiene dominio backend probado; demás squads sin implementación |
| F10 | no_iniciada | Frontend no consume APIs; contratos JWT incompatibles |
| F11 | no_iniciada | Sin pruebas de seguridad ni rendimiento |
| F12 | no_iniciada | Sin UAT ni piloto |
| F13 | no_iniciada | Sin evidencia de infraestructura, secretos gestionados ni backups |
| F14 | no_verificable | vercel.json existe; despliegue real no comprobado |
| F15 | no_iniciada | Sin monitoreo ni procedimientos de incidentes |

## Hallazgos

| ID | Severidad | Estado | Componente | Evidencia | Acción |
|---|---|---|---|---|---|
| PH-001 — Login acepta cualquier contraseña de 6+ caracteres y concede SUPERADMIN a usuari | BLOCKER | closed | M1 Core | backend/src/services/auth.service.ts:76 y :107 (archivo sin commit) | Validar con bcrypt contra password_hash y eliminar usuarios de respaldo fuera de un modo demo explícito |
| PH-002 — Secretos JWT con valor por defecto en código | CRITICAL | closed | M1 Core | backend/src/services/auth.service.ts:7-8; auth.middleware.ts:35 | Exigir JWT_SECRET y REFRESH_TOKEN_SECRET al arrancar y fallar si faltan |
| PH-003 — CORS permite cualquier origen con credenciales | HIGH | open | M1 Core | backend/src/server.ts:27 | Rechazar orígenes fuera de CORS_ORIGIN |
| PH-004 — Tenant tomado de cabecera del cliente con valor por defecto y no contrastado con | HIGH | open | M2 Multi-tenant | backend/src/middlewares/tenant.middleware.ts:18 | Derivar tenant del token y rechazar discrepancias |
| PH-005 — Login de la intranet simulado: no llama al backend y el rol lo elige el cliente | HIGH | open | Frontend intranet | frontend/modules/intranet/components/LoginForm.tsx:40-52 | Integrar con POST /api/v1/auth/login |
| PH-006 — Las 5 vistas de squads usan datos simulados; el frontend no hace ninguna llamada | HIGH | open | Frontend squads | frontend/modules/squads/*/ (sin fetch); CalificacionesModuleView.tsx:31 | Conectar vistas a endpoints reales |
| PH-007 — Contratos JWT incompatibles entre core y Squad 3 (tenantId/roles vs tenant_id/ro | HIGH | open | Integración | backend/squad_3_calificaciones/src/app.ts:11 vs backend/src/services/auth.service.ts:28 | Acordar un contrato de token único |
| PH-008 — Contraseñas sin bcrypt (RNF-07); comparación en texto plano | HIGH | closed | M1 Core | backend/src/services/auth.service.ts:76; bcrypt ausente en backend/package.json | Usar bcrypt cost &gt;= 12 |
| PH-009 — Logout guarda el JTI en Redis pero el middleware no consulta la lista negra | MEDIUM | open | M1 Core | backend/src/middlewares/auth.middleware.ts:37 | Verificar blacklist en authenticateJwt |
| PH-010 — GET /audit/logs responde success:true con lista vacía ante cualquier error de BD | MEDIUM | open | M12 Auditoría | backend/src/routes/audit.routes.ts:80-90 | Devolver error 5xx |
| PH-011 — Backend core: npm test (jest) y npm run lint (eslint) no tienen dependencias ins | MEDIUM | open | QA | backend/package.json scripts | Añadir framework de pruebas y lint |
| PH-012 — No hay CI de calidad; solo workflow PR-Agent | MEDIUM | open | QA | .github/workflows/pr_agent.yml | Workflow con lint, build y tests |
| PH-013 — SDD solo para Squads 1 y 3 (RNF-18) | MEDIUM | open | Documentación | D - Base 1 - 01092026/Fase 2/Arquitectura/Squad */ | Redactar SDD de Squads 2, 4 y 5 |
| PH-014 — Acta de cambio de arquitectura D-01 sin firmar pese a estar implementada | MEDIUM | open | Gobierno | docs/F0_ACTA_CAMBIO_ARQUITECTURA_BORRADOR.md | Aprobar o revertir |
| PH-015 — README dice PrimeNG y muestra la insignia Vercel-Deployed sin despliegue verific | LOW | open | Documentación | README.md:15 y :87; SecretariaModuleView.tsx:58 | Corregir textos |
| PH-016 — 78 avisos de lint (imports sin uso) | LOW | open | Frontend | npm run lint | Limpiar imports |
| PH-017 — Debounce de 400 ms simulado con setTimeout sin persistencia | MEDIUM | open | M8 Calificaciones UI | CalificacionesModuleView.tsx:58-65 | Conectar a /api/v1/grades/auto-save |

## Compuertas de entrega

- uat_approved: no evidenciada
- security_approved: no evidenciada
- deployment_verified: no evidenciada
- monitoring_verified: no evidenciada
- release_authorized: no evidenciada

## Interpretación

La escala 0–1000 es una rúbrica interna de evaluación de evidencias. No es porcentaje de esfuerzo, certificación oficial, validación exhaustiva de seguridad ni aprobación automática de salida a producción.
