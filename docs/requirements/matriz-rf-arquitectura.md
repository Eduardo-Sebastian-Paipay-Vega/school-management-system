# Matriz de trazabilidad RF → arquitectura

**Fecha:** 2026-10-25 · **Fuente de los RF:** `D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/requisitos_funcionales.md` (tabla maestra, 89 RF) · **Reparto por squad:** `AGENTS.md` §1.

Esta matriz relaciona cada requisito con su **ubicación arquitectónica**. Que un RF tenga carpeta o tabla **no significa que esté implementado**: la columna *Estado* lo dice explícitamente.

## Leyenda de estado

| Estado | Significado |
|---|---|
| Código + contrato; aceptación integrada pendiente | Hay rutas, servicio, migración y operación en `core.yaml`; compila y tiene pruebas unitarias, pero no se probó de punta a punta con PostgreSQL, Redis y SMTP (`PLAN.md`) |
| Implementado en M8 | Cubierto por el servicio M8 según la matriz §7 de `sdd_squad_3.md`; aún no lo consume el frontend ni pasa por el gateway (ADR-001) |
| Ubicación definida; sin estructura física de backend | Squad, módulo destino, frontend y tablas identificados; no hay rutas ni contrato. **No implementado** |
| Pendiente de clasificación | Ninguna fuente fija el módulo de backend; lo decide el squad en su SDD |
| Bloqueado | Depende de una decisión ⛔ de `docs/F0_DECISIONES_ARQUITECTURA_PENDIENTES.md` |
| Sin diseño | El SDD del squad no lo cubre todavía |

Columnas: **Frontend** relativo a `frontend/modules/squads/` salvo indicación; **Backend** es el módulo destino de [04-backend.md](../architecture/04-backend.md) y, entre paréntesis, el archivo actual cuando existe; **Datos** son tablas de `database/migrations/`; **Contrato** se refiere a `packages/contracts/openapi/`.

## Resumen

| Estado | Cantidad | RF |
|---|---:|---|
| Código + contrato (S1) | 21 | RF-01–14, 65, 67, 68, 72, 73, 75, 76 (RF-13 con publicación de rangos bloqueada por D-16) |
| Implementado en M8 (S3) | 11 | RF-36–46 |
| Ubicación definida, sin estructura física | 48 | Resto de S2, S4 y S5, más RF-66 |
| Sin diseño en el SDD | 4 | RF-79–82 |
| Pendiente de clasificación de backend | 4 | RF-86–89 |
| Bloqueado | 1 | RF-25 (D-15) |
| **Total** | **89** | |

## Matriz

| RF | Nombre | Módulo | Squad | Frontend | Backend | Datos | Contrato | Estado |
|---|---|---|---|---|---|---|---|---|
| RF-01 | Autenticación Segura de Usuarios mediante Credenciales Institucionales | M1 | S1 | `squad_1_core` | `auth` (`routes/auth.routes.ts`) | `usuarios`, `sesiones_usuario` | `core.yaml` /auth/login, /auth/me | Código + contrato; aceptación integrada pendiente |
| RF-02 | Cierre de Sesión Seguro y Terminación Automática por Inactividad | M1 | S1 | `squad_1_core` | `auth` | `sesiones_usuario`, Redis (jti revocados) | `core.yaml` /auth/logout, /auth/refresh-token | Código + contrato; aceptación integrada pendiente |
| RF-03 | Restablecimiento Asistido de Contraseñas de Acceso | M1 | S1 | `squad_1_core` | `auth` | `enlaces_acceso` | `core.yaml` /auth/forgot-password, /auth/reset-password | Código + contrato; aceptación integrada pendiente |
| RF-04 | Control de Privilegios y Acceso Basado en Roles (RBAC) | M1 | S1 | `squad_1_core` | `auth` (`middlewares/rbac.middleware.ts`) | `roles`, `usuario_roles`, `permisos_core`, `rol_permisos_core` | `core.yaml` /users/roles, /users/permissions | Código + contrato; aceptación integrada pendiente |
| RF-05 | Registro y Alta Formal de Cuentas de Personal Institucional | M2 | S1 | `squad_1_core` | `administration` (`routes/users.routes.ts`) | `personas`, `usuarios`, `enlaces_acceso` | `core.yaml` POST /users, /users/{id}/invite, /auth/activate | Código + contrato; aceptación integrada pendiente; cambio a enlace de activación por formalizar |
| RF-06 | Importación Masiva de Usuarios desde Archivos Excel / CSV | M2 | S1 | `squad_1_core` | `administration` (`services/user-import.service.ts`) | `personas`, `usuarios` | `core.yaml` /users/import/* | Código + contrato; aceptación integrada pendiente |
| RF-07 | Gestión de Sedes y Planteles Escolares Multi-Tenant | M2 | S1 | `squad_1_core` | `administration` (`routes/school.routes.ts`) | `instituciones`, `sedes` | `core.yaml` /school/sites | Código + contrato; aceptación integrada pendiente |
| RF-08 | Directorio Escolar y Búsqueda Rápida de Personal | M2 | S1 | `squad_1_core` | `administration` (`routes/users.routes.ts`) | `personas`, `usuarios` | `core.yaml` GET /users | Código + contrato; aceptación integrada pendiente |
| RF-09 | Gestión de Perfil Personal y Cambio Autónomo de Credenciales | M2 | S1 | `squad_1_core` | `administration` (`routes/users.routes.ts`) | `usuarios` | `core.yaml` /users/me, /users/me/change-password | Código + contrato; aceptación integrada pendiente |
| RF-10 | Parametrización del Año Lectivo y Calendario Escolar | M3 | S1 | `squad_1_core` | `administration` (`routes/school.routes.ts`) | `anios_lectivos`, `dias_no_lectivos` | `core.yaml` /school/years, …/non-school-days | Código + contrato; aceptación integrada pendiente |
| RF-11 | Apertura, Parametrización y Cierre de Periodos Académicos | M3 | S1 | `squad_1_core` | `administration` (`routes/school.routes.ts`) | `periodos_academicos` | `core.yaml` …/periods, /school/periods/{id}/close | Código + contrato; aceptación integrada pendiente |
| RF-12 | Estructuración de Niveles Educativos, Grados y Secciones | M3 | S1 | `squad_1_core` | `administration` (`routes/school.routes.ts`) | `grados_secciones` | `core.yaml` …/sections | Código + contrato; aceptación integrada pendiente (solapamiento S-02) |
| RF-13 | Definición de Escalas de Calificación Institucionales (Dual CNEB) | M3 | S1 | `squad_1_core` | `administration` (`routes/school.routes.ts`) | `escalas_calificacion`, `rangos_escala` | `core.yaml` …/scales, /school/scales/{id}/approve | Código + contrato; **bloqueado** para publicar rangos (D-16) |
| RF-14 | Parámetros Globales del Sistema y Membretes Institucionales | M3 | S1 | `squad_1_core` | `administration` (`routes/school.routes.ts`) | `configuracion_institucional` | `core.yaml` /school/institution | Código + contrato; aceptación integrada pendiente |
| RF-15 | Registro, Filiación y Actualización del Padrón de Estudiantes | M4 | S2 | `squad_2_asistencia` | `academics` | `personas`, `matriculas` | Pendiente `paths/enrollments.yaml` | Ubicación definida; sin estructura física de backend |
| RF-16 | Matrícula Escolar y Asignación de Estudiantes a Secciones | M4 | S2 | `squad_2_asistencia` | `academics` | `matriculas`, `grados_secciones` | Pendiente `paths/enrollments.yaml` | Ubicación definida; sin estructura física de backend |
| RF-17 | Catálogo Curricular y Planes de Estudio oficiales según CNEB | M4 | S2 | `squad_2_asistencia` | `academics` | `cursos`, `competencias`, `plan_estudios` | Pendiente `paths/enrollments.yaml` | Ubicación definida; sin estructura física de backend |
| RF-18 | Asignación y Distribución de Carga Lectiva Docente | M4 | S2 | `squad_2_asistencia` | `academics` | `carga_lectiva` | Pendiente `paths/enrollments.yaml` | Ubicación definida; sin estructura física de backend |
| RF-19 | Consulta y Generación de Nóminas Oficiales de Aula | M4 | S2 | `squad_2_asistencia` | `academics` | `matriculas` | Pendiente `paths/enrollments.yaml` | Ubicación definida; sin estructura física de backend |
| RF-20 | Registro Ordinario de Asistencia Escolar en el Aula | M5 | S2 | `squad_2_asistencia` | `attendance` | `asistencias_alumnos` | Pendiente `paths/attendance.yaml` | Ubicación definida; sin estructura física de backend |
| RF-21 | Registro de Ingreso Físico en Modo Kiosco de Portería | M5 | S2 | `squad_2_asistencia` | `attendance` | `asistencias_alumnos` | Pendiente `paths/attendance.yaml` | Ubicación definida; sin estructura física de backend |
| RF-22 | Gestión y Justificación Formal de Inasistencias y Tardanzas | M5 | S2 | `squad_2_asistencia` | `attendance` | `asistencias_alumnos` | Pendiente `paths/attendance.yaml` | Ubicación definida; sin estructura física de backend |
| RF-23 | Consolidación y Consulta del Récord de Asistencia por Estudiante | M5 | S2 | `squad_2_asistencia` | `attendance` | `asistencias_alumnos` | Pendiente `paths/attendance.yaml` | Ubicación definida; sin estructura física de backend |
| RF-24 | Detección y Generación de Alertas por Ausentismo Crónico | M5 | S2 | `squad_2_asistencia` | `attendance` | `asistencias_alumnos`; avisos M2 | Pendiente `paths/attendance.yaml` | Ubicación definida; sin estructura física de backend |
| RF-25 | Kiosco de Portería Resiliente con Modo Desconectado (Offline-First) | M5 | S2 | `squad_2_asistencia` | `attendance` | IndexedDB (cliente) + `asistencias_alumnos` | Pendiente `paths/attendance.yaml` | **Bloqueado** por D-15 (datos offline, Ley 29733) |
| RF-26 | Generación y Emisión Masiva de Carnés Escolares con Código QR/Barras | M5 | S2 | `squad_2_asistencia` | `attendance` | `carnes_escolares` | Pendiente `paths/attendance.yaml` | Ubicación definida; sin estructura física de backend |
| RF-27 | Toma Rápida en App Móvil y Difusión en Tiempo Real (WebSockets) | M5 | S2 | `squad_2_asistencia` | `attendance` | `asistencias_alumnos`; WebSocket | Pendiente `paths/attendance.yaml` | Ubicación definida; gateway WS por decidir (S-03) |
| RF-28 | Registro Diario de Jornada y Permanencia de Practicantes EPIS-UNSCH | M6 | S2 | `squad_2_asistencia` | `staff_tracking` | `asistencias_practicantes` | Pendiente | Ubicación definida; sin estructura física de backend |
| RF-29 | Asignación de Docente Guía y Asesor Institucional | M6 | S2 | `squad_2_asistencia` | `staff_tracking` | `asistencias_practicantes` | Pendiente | Ubicación definida; sin estructura física de backend |
| RF-30 | Cómputo Acumulado de Horas Efectivas de Prácticas Universitarias | M6 | S2 | `squad_2_asistencia` | `staff_tracking` | `asistencias_practicantes` | Pendiente | Ubicación definida; sin estructura física de backend |
| RF-31 | Emisión de Fichas Oficiales de Prácticas para la UNSCH | M6 | S2 | `squad_2_asistencia` | `staff_tracking` | `asistencias_practicantes` | Pendiente | Ubicación definida; librería PDF pendiente (D-17) |
| RF-32 | Registro y Marcación de Horas Lectivas de Docentes Contratados | M7 | S2 | `squad_2_asistencia` | `staff_tracking` | *(pendiente)* sin tabla | Pendiente | Ubicación definida; sin estructura física de backend |
| RF-33 | Registro de Justificaciones y Reprogramación de Clases Docentes | M7 | S2 | `squad_2_asistencia` | `staff_tracking` | *(pendiente)* sin tabla | Pendiente | Ubicación definida; sin estructura física de backend |
| RF-34 | Consolidación Mensual de Cumplimiento de Horas Lectivas Dictadas | M7 | S2 | `squad_2_asistencia` | `staff_tracking` | *(pendiente)* sin tabla | Pendiente | Ubicación definida; sin estructura física de backend |
| RF-35 | Supervisión y Monitoreo de Cobertura y Puntualidad de Clases | M7 | S2 | `squad_2_asistencia` | `staff_tracking` | *(pendiente)* sin tabla | Pendiente | Ubicación definida; sin estructura física de backend |
| RF-36 | Parametrización de Rúbricas y Evaluaciones por Asignatura | M8 | S3 | `squad_3_calificaciones` | Servicio M8 | `squad3.gradebooks` | Pendiente `paths/grades.yaml` (describir M8 tal como está) | Implementado en M8 (16 pruebas); sin gateway ni UI integrada |
| RF-37 | Ingreso, Edición y Publicación de Calificaciones en Tiempo Real | M8 | S3 | `squad_3_calificaciones` | Servicio M8 | `squad3.gradebooks` | Pendiente `paths/grades.yaml` (describir M8 tal como está) | Implementado en M8 (16 pruebas); sin gateway ni UI integrada |
| RF-38 | Planilla Ágil de Notas en Modo Matriz Rápida ("Modo Excel / Teclado") | M8 | S3 | `squad_3_calificaciones` | Servicio M8 | `squad3.gradebooks` | Pendiente `paths/grades.yaml` (describir M8 tal como está) | Implementado en M8 (16 pruebas); sin gateway ni UI integrada |
| RF-39 | Asistente de Conclusiones Descriptivas Sugeridas por Logro (MINEDU) | M8 | S3 | `squad_3_calificaciones` | Servicio M8 | `squad3.gradebooks` | Pendiente `paths/grades.yaml` (describir M8 tal como está) | Implementado en M8 (16 pruebas); sin gateway ni UI integrada |
| RF-40 | Colaboración Supervisada de Practicantes en el Registro de Notas | M8 | S3 | `squad_3_calificaciones` | Servicio M8 | `squad3.gradebooks` | Pendiente `paths/grades.yaml` (describir M8 tal como está) | Implementado en M8 (16 pruebas); sin gateway ni UI integrada |
| RF-41 | Cálculo Automatizado de Promedios Parciales, Bimestrales y Finales | M8 | S3 | `squad_3_calificaciones` | Servicio M8 | `squad3.gradebooks` | Pendiente `paths/grades.yaml` (describir M8 tal como está) | Implementado en M8 (16 pruebas); sin gateway ni UI integrada |
| RF-42 | Cierre Oficial de Periodo Académico y Bloqueo de Modificación | M8 | S3 | `squad_3_calificaciones` | Servicio M8 | `squad3.gradebooks` | Pendiente `paths/grades.yaml` (describir M8 tal como está) | Implementado en M8 (16 pruebas); sin gateway ni UI integrada |
| RF-43 | Flujo Extraordinario de Solicitud y Aprobación de Rectificación de Notas | M8 | S3 | `squad_3_calificaciones` | Servicio M8 | `squad3.gradebooks`, `squad3.grade_audit_history` | Pendiente `paths/grades.yaml` (describir M8 tal como está) | Implementado en M8 (16 pruebas); sin gateway ni UI integrada |
| RF-44 | Consulta Inmediata y Transparente de Calificaciones para Estudiantes | M8 | S3 | `squad_3_calificaciones` | Servicio M8 | `squad3.gradebooks` | Pendiente `paths/grades.yaml` (describir M8 tal como está) | Implementado en M8 (16 pruebas); sin gateway ni UI integrada |
| RF-45 | Llenado Asistido con Auto-Guardado y Conexión Automática en Segundo Plano | M8 | S3 | `squad_3_calificaciones` | Servicio M8 | `squad3.gradebooks` | Pendiente `paths/grades.yaml` (describir M8 tal como está) | Implementado en M8 (16 pruebas); sin gateway ni UI integrada |
| RF-46 | Motor de Conversión Escala Vigesimal (0-20) a Literal CNEB (AD, A, B, C) | M8 | S3 | `squad_3_calificaciones` | Servicio M8 | `squad3.gradebooks` | Pendiente `paths/grades.yaml` (describir M8 tal como está) | Implementado en M8 (16 pruebas); sin gateway ni UI integrada |
| RF-47 | Generación de Mapa de Calor de Rendimiento Académico por Sección | M9 | S4 | `squad_4_analitica` | `analytics` | `vm_rendimiento_seccion` | Pendiente `paths/analytics.yaml` | Ubicación definida; sin estructura física de backend |
| RF-48 | Generación de Mapa de Calor de Asistencia y Puntualidad | M9 | S4 | `squad_4_analitica` | `analytics` | `vm_asistencia_mensual` *(pendiente)* | Pendiente `paths/analytics.yaml` | Ubicación definida; sin estructura física de backend |
| RF-49 | Mapas de Calor Interactivos con Navegación a Detalle (Drill-Down) | M9 | S4 | `squad_4_analitica` | `analytics` | `vm_rendimiento_seccion` | Pendiente `paths/analytics.yaml` | Ubicación definida; sin estructura física de backend |
| RF-50 | Análisis Gráfico Comparativo de Rendimiento entre Secciones | M9 | S4 | `squad_4_analitica` | `analytics` | `vm_rendimiento_seccion` | Pendiente `paths/analytics.yaml` | Ubicación definida; sin estructura física de backend |
| RF-51 | Detección Visual de Asignaturas con Mayor Índice de Riesgo | M9 | S4 | `squad_4_analitica` | `analytics` | `vm_rendimiento_seccion` | Pendiente `paths/analytics.yaml` | Ubicación definida; sin estructura física de backend |
| RF-52 | Tablero de Control Ejecutivo de Indicadores Clave para Dirección | M10 | S4 | `squad_4_analitica` | `analytics` | vistas `vm_*` *(pendiente)* | Pendiente `paths/analytics.yaml` | Ubicación definida; sin estructura física de backend |
| RF-53 | Tablero de Control Curricular y Cumplimiento para Coordinación | M10 | S4 | `squad_4_analitica` | `analytics` | vistas `vm_*` *(pendiente)* | Pendiente `paths/analytics.yaml` | Ubicación definida; sin estructura física de backend |
| RF-54 | Tablero de Resumen Pedagógico y Clases Diarias para el Docente | M10 | S4 | `squad_4_analitica` | `analytics` | vistas `vm_*` *(pendiente)* | Pendiente `paths/analytics.yaml` | Ubicación definida; sin estructura física de backend |
| RF-55 | Generación Automatizada de Alertas de Deserción y Repitencia | M10 | S4 | `squad_4_analitica` | `analytics` | vistas `vm_*` *(pendiente)*; avisos M2 | Pendiente `paths/analytics.yaml` | Ubicación definida; sin estructura física de backend |
| RF-56 | Ficha Integral y Radiografía Escolar 360° del Estudiante en 1 Clic | M10 | S4 | `squad_4_analitica` | `analytics` | vistas `vm_*` *(pendiente)* | Pendiente `paths/analytics.yaml` | Ubicación definida; sin estructura física de backend |
| RF-57 | Tablero de Seguimiento, Impacto y Acreditación del SSU (IS-480) | M10 | S4 | `squad_4_analitica` | `ssu_impact` | `metricas_impacto_ssu` | Pendiente `paths/analytics.yaml` | Ubicación definida; sin estructura física de backend |
| RF-58 | Generador de Reportes de Diagnóstico Integral para Consejos Académicos | M10 | S4 | `squad_4_analitica` | `analytics` | vistas `vm_*` *(pendiente)* | Pendiente `paths/analytics.yaml` | Ubicación definida; sin estructura física de backend |
| RF-59 | Emisión Oficial de Boletas de Información Escolar / Libretas en PDF | M11 | S5 | `squad_5_secretaria` | `document_crypto` | `documentos_emitidos` | Pendiente `paths/documents.yaml` | Ubicación definida; sin estructura física de backend |
| RF-60 | Verificación Pública Criptográfica de Documentos Escolares mediante Código QR | M11 | S5 | `squad_5_secretaria` | `document_crypto` + `fn_verificar_documento` (ADR-003) | `documentos_emitidos` | Pendiente `paths/public.yaml` (GET /public/verify/{token}) | Ubicación definida; sin estructura física de backend |
| RF-61 | Generación del Cuadro de Mérito y Puestos de Honor Institucionales | M11 | S5 | `squad_5_secretaria` | `analytics` (cálculo) + `document_crypto` (emisión) | vistas `vm_*` *(pendiente)* | Pendiente `paths/documents.yaml` | Ubicación definida; solapamiento S-05 |
| RF-62 | Emisión y Descarga del Registro Auxiliar Oficial y Actas Finales | M11 | S5 | `squad_5_secretaria` | `document_crypto` | `documentos_emitidos` | Pendiente `paths/documents.yaml` | Ubicación definida; sin estructura física de backend |
| RF-63 | Reportes Consolidados de Asistencia Multiactor del Plantel | M11 | S5 | `squad_5_secretaria` | `document_crypto` | `asistencias_alumnos` (lectura) | Pendiente `paths/documents.yaml` | Ubicación definida; sin estructura física de backend |
| RF-64 | Exportación de Datos en Formatos Estándar Abiertos (PDF y Excel SIAGIE) | M11 | S5 | `squad_5_secretaria` | `document_crypto` | `documentos_emitidos`, `exportaciones_siagie` | Pendiente `paths/documents.yaml` | Ubicación definida; sin estructura física de backend |
| RF-65 | Registro Inmutable de Auditoría de Eventos y Seguridad | M12 | S1 | `squad_1_core` | `administration` (`services/audit.service.ts`) | `logs_auditoria` (cadena hash) | `core.yaml` /audit/verify-chain | Código + contrato; aceptación integrada pendiente |
| RF-66 | Trazabilidad Histórica de Modificaciones en Notas y Asistencias | M12 | S1 | `squad_1_core` | `administration` + M8 | `logs_auditoria`, `squad3.grade_audit_history` | Pendiente (integración S2/S3) | Ubicación definida; contrato pendiente (S-04) |
| RF-67 | Módulo de Búsqueda y Monitoreo de Bitácoras de Auditoría | M12 | S1 | `squad_1_core` | `administration` (`routes/audit.routes.ts`) | `logs_auditoria` | `core.yaml` /audit/logs, /audit/export.pdf | Código + contrato; aceptación integrada pendiente |
| RF-68 | Cumplimiento y Protección de Datos Personales (Ley N.° 29733) | M12 | S1 | `squad_1_core` | `administration` (`core/identity-crypto.ts`) | `personas` (documento cifrado + índice ciego) | `core.yaml` /users/{id}/document | Código + contrato; aceptación integrada pendiente |
| RF-69 | Cartelera Digital y Publicación de Comunicados Institucionales | M13 | S5 | `modules/landing`, `app/(landing)` | `portal` | `comunicados_cartelera` | Pendiente `paths/public.yaml` | Ubicación definida; sin estructura física de backend |
| RF-70 | Publicación y Consulta del Calendario Cívico y Escolar Interactivo | M13 | S5 | `modules/landing`, `app/(landing)` | `portal` | `dias_no_lectivos` (lectura, S-07) | Pendiente `paths/public.yaml` | Ubicación definida; sin estructura física de backend |
| RF-71 | Portal Informativo Institucional y Normas de Convivencia Escolar | M13 | S5 | `modules/landing`, `app/(landing)` | `portal` (sin API: páginas estáticas) | — | No requiere API por ahora | Páginas estáticas en `app/(landing)` |
| RF-72 | Modificación de Datos y Baja Lógica de Usuarios del Plantel | M2 | S1 | `squad_1_core` | `administration` (`routes/users.routes.ts`) | `usuarios`, `personas` | `core.yaml` PATCH /users/{id}, …/deactivate, …/reactivate | Código + contrato; aceptación integrada pendiente |
| RF-73 | Reasignación Dinámica de Roles y Jerarquías del Personal | M2 | S1 | `squad_1_core` | `administration` (`routes/users.routes.ts`) | `usuario_roles` | `core.yaml` PUT /users/{id}/roles | Código + contrato; aceptación integrada pendiente |
| RF-74 | Conformidad y Validación Periódica de Horas por el Docente Tutor | M6 | S2 | `squad_2_asistencia` | `staff_tracking` | `asistencias_practicantes` | Pendiente | Ubicación definida; sin estructura física de backend |
| RF-75 | Cuenta del Apoderado con Vínculo Verificado y Consentimiento de Datos | M2 | S1 | `squad_1_core` | `administration` (`routes/guardians.routes.ts`) | `apoderados_estudiantes`, `invitaciones_apoderado`, `consentimientos_datos` | `core.yaml` /guardians/* | Código + contrato; aceptación integrada pendiente; texto de consentimiento pendiente |
| RF-76 | Centro de Notificaciones Internas y por Correo Electrónico | M2 | S1 | `squad_1_core` | `administration` (`services/notifications.service.ts`) | `notificaciones`, `preferencias_notificacion`, `envios_correo` | `core.yaml` /notifications/*; WS sin contrato AsyncAPI | Código + contrato; aceptación integrada pendiente |
| RF-77 | Aviso Automático de Inasistencias y Tardanzas al Apoderado | M5 | S2 | `squad_2_asistencia` | `attendance` | `avisos_inasistencia`; avisos M2 | Pendiente `paths/attendance.yaml` | Ubicación definida; sin estructura física de backend |
| RF-78 | Importación Masiva de Estudiantes y Matrícula desde Nóminas Excel (Formato SIAGIE) | M4 | S2 | `squad_2_asistencia` | `academics` | `importaciones_nomina`, `personas`, `matriculas` | Pendiente `paths/enrollments.yaml` | Ubicación definida; sin estructura física de backend |
| RF-79 | Programación de Tareas, Exámenes y Actividades Evaluativas con Calendario | M8 | S3 | `squad_3_calificaciones` | Destino por decidir (M8 o `grades`) | `actividades_evaluativas` | Pendiente | Sin diseño en `sdd_squad_3.md` |
| RF-80 | Carga Masiva de Calificaciones desde Plantilla Excel Precargada | M8 | S3 | `squad_3_calificaciones` | Destino por decidir (M8 o `grades`) | `importaciones_notas` | Pendiente | Sin diseño en `sdd_squad_3.md` |
| RF-81 | Control de Plazos de Registro de Notas y Alertas Escalonadas a Docentes | M8 | S3 | `squad_3_calificaciones` | Destino por decidir (M8 o `grades`) | `plazos_registro_notas`, `alertas_docentes` | Pendiente | Sin diseño en `sdd_squad_3.md` |
| RF-82 | Consulta de Notas, Tareas y Exámenes por el Apoderado | M8 | S3 | `squad_3_calificaciones` | Destino por decidir (M8 o `grades`) | `squad3.gradebooks` (publicado); vínculo RF-75 | Pendiente | Sin diseño en `sdd_squad_3.md` |
| RF-83 | Tablero de Cumplimiento y Puntualidad del Registro de Notas por Docente | M10 | S4 | `squad_4_analitica` | `analytics` | `plazos_registro_notas`, `alertas_docentes` | Pendiente `paths/analytics.yaml` | Ubicación definida; sin estructura física de backend |
| RF-84 | Gestor de Noticias Institucionales con Editor, Galería y Publicación Programada | M13 | S5 | `modules/landing`, `app/(landing)` | `portal` | `noticias`, `noticias_galeria` | Pendiente `paths/public.yaml` | Ubicación definida; sin estructura física de backend |
| RF-85 | Publicación en la Página Oficial de Facebook y Feed Integrado en el Portal | M13 | S5 | `modules/landing`, `app/(landing)` | `portal` | `integraciones_redes` | Pendiente `paths/public.yaml` | Integración externa (Facebook) sin especificación técnica |
| RF-86 | Mesa de Partes Virtual para Solicitudes, Consultas y Quejas | M11 | S5 | `squad_5_secretaria` | **Pendiente de clasificación** | `expedientes_mesa_partes`, `expedientes_movimientos`, `expedientes_adjuntos`, `expedientes_correlativos` | Pendiente | Pendiente de clasificación (módulo backend no fijado en las fuentes) |
| RF-87 | Solicitud y Emisión Rápida de Certificados y Constancias en Línea | M11 | S5 | `squad_5_secretaria` | **Pendiente de clasificación** | `solicitudes_certificado`, `documentos_emitidos` | Pendiente | Pendiente de clasificación (módulo backend no fijado en las fuentes) |
| RF-88 | Generación de Archivos de Carga para el SIAGIE con Validación y Control de Envíos | M11 | S5 | `squad_5_secretaria` | **Pendiente de clasificación** | `exportaciones_siagie` | Pendiente | Pendiente de clasificación (módulo backend no fijado en las fuentes) |
| RF-89 | Agenda de Citas entre Apoderados y Tutores o Docentes | M10 | S4 | `squad_4_analitica` | **Pendiente de clasificación** | `franjas_atencion`, `citas_apoderados` | Pendiente | Pendiente de clasificación (módulo backend no fijado en las fuentes) |

## Inconsistencias registradas

- **RF-86 a RF-89:** ninguna fuente asigna módulo de backend (`arquitectura_sistema.md` §4 no los lista). Lo fija el SDD del squad dueño.
- **RF-79 a RF-82:** asignados a M8 en los RF, pero fuera de la matriz de `sdd_squad_3.md`. Falta decidir si se implementan dentro del servicio M8 o en el futuro módulo `grades`.
- **M7 (RF-32 a RF-35):** la línea base no tiene una tabla para horas lectivas de docentes contratados.
- **Vistas `vm_*`:** solo existe `vm_rendimiento_seccion`; `vm_asistencia_mensual`, citada en `AGENTS.md` para el Squad 4, no está en ninguna migración.
- **Tablas de la línea base para S2, S4 y S5:** existen, pero su diseño es anterior al modelo canónico (P-15 de la auditoría); deben revisarse antes de construir sobre ellas.
- Solapamientos S-01 a S-07: ver [01-mapa-modular.md](../architecture/01-mapa-modular.md) §3.
