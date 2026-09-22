# Catálogo Maestro de Casos de Uso del Sistema (Fase 2)

### Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH (SSU IS-480)

Este directorio documenta la especificación formal de los **71 Casos de Uso del Sistema** que implementan la totalidad de los Requisitos Funcionales (`RF-01` al `RF-71`), organizados modularmente en **5 Squads Técnicos Especializados**.

---

## 1. Organización y Distribución por Squads de Trabajo

| Squad | Responsable Técnico | Módulos a Cargo | Casos de Uso | Requisitos Trazables | Enfoque Principal |
|---|---|---|---|---|---|
| [**Squad 1: Core y Seguridad**](Squad%201%20-%20Core%20y%20Seguridad/README.md) | Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`) | M1, M2, M3, M12 | **18 CUs** (CU-SEG, CU-USR, CU-INS, CU-AUD) | `RF-01` al `RF-14`<br>`RF-65` al `RF-68` | Seguridad, JWT, RBAC, configuración escolar, multi-tenant y auditoría inmutable (Ley 29733). |
| [**Squad 2: Matrícula y Asistencia**](Squad%202%20-%20Matricula%20y%20Asistencia/README.md) | Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`) | M4, M5, M6, M7 | **21 CUs** (CU-ACD, CU-AST, CU-PRA, CU-DOC) | `RF-15` al `RF-35` | Matrícula, Kiosco de portería Offline-First (IndexedDB/Hive), carnés QR, WebSockets y control de horas. |
| [**Squad 3: Calificaciones y Modo Excel**](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/README.md) | Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`) | M8 | **11 CUs** (CU-NOT) | `RF-36` al `RF-46` | Planilla interactiva "Modo Excel", debounce 400ms, banco de conclusiones MINEDU y conversión dual. |
| [**Squad 4: Analítica y Dashboards**](Squad%204%20-%20Analitica%20y%20Dashboards/README.md) | Grissel Arascely Rodríguez Quispe (`@Arascely`) | M9, M10 | **12 CUs** (CU-MAP, CU-DSH) | `RF-47` al `RF-58` | Mapas de calor con navegación Drill-Down, alertas de deserción, Ficha 360° y tablero SSU IS-480. |
| [**Squad 5: Secretaría y Portal Web**](Squad%205%20-%20Secretaria%20y%20Portal%20Web/README.md) | Cesar Antonio Leon Reyna (`@cesarleon27-ai`) | M11, M13 | **9 CUs** (CU-REP, CU-PUB) | `RF-59` al `RF-64`<br>`RF-69` al `RF-71` | Libretas y actas en PDF, verificación criptográfica SHA-256 + QR público, cartelera y portal web. |

---

## 2. Matriz General de Actores del Sistema

| Actor | Responsabilidad Primaria | Squads con los que Interactúa |
|---|---|---|
| **Superadmin / Administrador** | Configuración general, gestión de usuarios, roles, sedes, periodos y auditoría. | Squad 1, Squad 2, Squad 4, Squad 5 |
| **Director / Subdirector** | Aprobación de actas, supervisión integral, mapas de calor, reportes y métricas SSU. | Squad 1, Squad 2, Squad 3, Squad 4, Squad 5 |
| **Docente (Nombrado/Contratado)** | Registro de notas (Modo Excel), conclusiones CNEB, asistencia en aula y reprogramación. | Squad 2, Squad 3, Squad 4 |
| **Practicante Preprofesional** | Marcación de jornada, registro asistido de notas y seguimiento de horas SSU IS-480. | Squad 2, Squad 3, Squad 4 |
| **Personal de Portería ('Wachiman')** | Operación del Kiosco Offline-First de asistencia y validación de carnés con código QR. | Squad 2 |
| **Estudiante** | Consulta de notas consolidadas, historial de asistencia y carné escolar digital. | Squad 2, Squad 3, Squad 4, Squad 5 |
| **Público General / Comunidad UNSCH** | Consulta del portal de difusión digital y verificación pública de documentos con QR. | Squad 5 |

---

## 3. Catálogo Completo de Casos de Uso por Squad

### [Squad 1: Core, Seguridad, Configuración y Auditoría](Squad%201%20-%20Core%20y%20Seguridad/README.md)

**Responsable:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`) | **Total:** 18 Casos de Uso

| ID | Requisito | Título del Caso de Uso | Frecuencia |
|---|---|---|---|
| [CU-SEG-01](Squad%201%20-%20Core%20y%20Seguridad/CU-SEG-01.md) | [RF-01](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-01.md) | Iniciar Sesión en la Plataforma | Muy Alta (Múltiples veces por día) |
| [CU-SEG-02](Squad%201%20-%20Core%20y%20Seguridad/CU-SEG-02.md) | [RF-02](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-02.md) | Cierre de Sesión Seguro y Terminación por Inactividad | Alta (Al finalizar la jornada o cambio de turno) |
| [CU-SEG-03](Squad%201%20-%20Core%20y%20Seguridad/CU-SEG-03.md) | [RF-03](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-03.md) | Restablecimiento Asistido de Contraseñas de Acceso | Media |
| [CU-SEG-04](Squad%201%20-%20Core%20y%20Seguridad/CU-SEG-04.md) | [RF-04](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-04.md) | Control de Privilegios y Acceso Basado en Roles (RBAC) | Baja (Configuración inicial o reasignaciones) |
| [CU-USR-01](Squad%201%20-%20Core%20y%20Seguridad/CU-USR-01.md) | [RF-05](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-05.md) | Registro y Alta Formal de Personal Institucional | Media |
| [CU-USR-02](Squad%201%20-%20Core%20y%20Seguridad/CU-USR-02.md) | [RF-06](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-06.md) | Importación Masiva de Usuarios desde Archivos Excel / CSV | Baja (Inicio de año o semestre) |
| [CU-USR-03](Squad%201%20-%20Core%20y%20Seguridad/CU-USR-03.md) | [RF-07](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-07.md) | Gestión de Sedes y Planteles Escolares Multi-Tenant | Muy Baja (Configuración inicial) |
| [CU-USR-04](Squad%201%20-%20Core%20y%20Seguridad/CU-USR-04.md) | [RF-08](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-08.md) | Directorio Escolar y Búsqueda Rápida de Personal | Alta |
| [CU-USR-05](Squad%201%20-%20Core%20y%20Seguridad/CU-USR-05.md) | [RF-09](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-09.md) | Gestión de Perfil Personal y Cambio Autónomo de Credenciales | Baja |
| [CU-INS-01](Squad%201%20-%20Core%20y%20Seguridad/CU-INS-01.md) | [RF-10](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-10.md) | Parametrización del Año Lectivo y Calendario Escolar | Baja (Anual) |
| [CU-INS-02](Squad%201%20-%20Core%20y%20Seguridad/CU-INS-02.md) | [RF-11](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-11.md) | Apertura, Parametrización y Cierre de Periodos Académicos | Media (4 veces al año en régimen bimestral) |
| [CU-INS-03](Squad%201%20-%20Core%20y%20Seguridad/CU-INS-03.md) | [RF-12](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-12.md) | Estructuración de Niveles Educativos, Grados y Secciones | Baja |
| [CU-INS-04](Squad%201%20-%20Core%20y%20Seguridad/CU-INS-04.md) | [RF-13](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-13.md) | Definición de Escalas de Calificación Institucionales (Dual CNEB) | Muy Baja |
| [CU-INS-05](Squad%201%20-%20Core%20y%20Seguridad/CU-INS-05.md) | [RF-14](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-14.md) | Parámetros Globales del Sistema y Membretes Institucionales | Baja |
| [CU-AUD-01](Squad%201%20-%20Core%20y%20Seguridad/CU-AUD-01.md) | [RF-65](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-65.md) | Registro Inmutable de Auditoría de Eventos y Seguridad | Constante (En cada petición sensible) |
| [CU-AUD-02](Squad%201%20-%20Core%20y%20Seguridad/CU-AUD-02.md) | [RF-66](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-66.md) | Trazabilidad Histórica de Modificaciones en Notas y Asistencias | Muy Alta (En cada guardado de notas o cambios de asistencia) |
| [CU-AUD-03](Squad%201%20-%20Core%20y%20Seguridad/CU-AUD-03.md) | [RF-67](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-67.md) | Módulo de Búsqueda y Monitoreo de Bitácoras de Auditoría | Media |
| [CU-AUD-04](Squad%201%20-%20Core%20y%20Seguridad/CU-AUD-04.md) | [RF-68](../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-68.md) | Cumplimiento y Protección de Datos Personales (Ley N.° 29733) | Baja |

### [Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First](Squad%202%20-%20Matricula%20y%20Asistencia/README.md)

**Responsable:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`) | **Total:** 21 Casos de Uso

| ID | Requisito | Título del Caso de Uso | Frecuencia |
|---|---|---|---|
| [CU-ACD-01](Squad%202%20-%20Matricula%20y%20Asistencia/CU-ACD-01.md) | [RF-15](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-15.md) | Registro, Filiación y Actualización de Ficha de Estudiante | Alta (En periodos de inscripción) |
| [CU-ACD-02](Squad%202%20-%20Matricula%20y%20Asistencia/CU-ACD-02.md) | [RF-16](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-16.md) | Matrícula Escolar y Asignación de Estudiantes a Secciones | Alta (Fase de matrícula) |
| [CU-ACD-03](Squad%202%20-%20Matricula%20y%20Asistencia/CU-ACD-03.md) | [RF-17](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-17.md) | Catálogo Curricular y Planes de Estudio oficiales según CNEB | Baja |
| [CU-ACD-04](Squad%202%20-%20Matricula%20y%20Asistencia/CU-ACD-04.md) | [RF-18](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-18.md) | Asignación y Distribución de Carga Lectiva Docente | Media |
| [CU-ACD-05](Squad%202%20-%20Matricula%20y%20Asistencia/CU-ACD-05.md) | [RF-19](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-19.md) | Consulta y Generación de Nóminas Oficiales de Aula | Alta |
| [CU-AST-01](Squad%202%20-%20Matricula%20y%20Asistencia/CU-AST-01.md) | [RF-20](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-20.md) | Registro Ordinario de Asistencia Escolar en el Aula | Diaria (Al inicio de cada jornada) |
| [CU-AST-02](Squad%202%20-%20Matricula%20y%20Asistencia/CU-AST-02.md) | [RF-21](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-21.md) | Registro de Ingreso Físico en Modo Kiosco de Portería ('Wachiman') | Muy Alta (Pico de 7:15 AM a 8:00 AM) |
| [CU-AST-03](Squad%202%20-%20Matricula%20y%20Asistencia/CU-AST-03.md) | [RF-22](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-22.md) | Gestión y Justificación Formal de Inasistencias y Tardanzas | Media |
| [CU-AST-04](Squad%202%20-%20Matricula%20y%20Asistencia/CU-AST-04.md) | [RF-23](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-23.md) | Consolidación y Consulta del Récord de Asistencia por Estudiante | Alta |
| [CU-AST-05](Squad%202%20-%20Matricula%20y%20Asistencia/CU-AST-05.md) | [RF-24](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-24.md) | Detección y Generación de Alertas por Ausentismo Crónico | Diaria (Al finalizar la toma de asistencia) |
| [CU-AST-06](Squad%202%20-%20Matricula%20y%20Asistencia/CU-AST-06.md) | [RF-25](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-25.md) | Operar Kiosco de Portería en Modo Offline-First y Sincronización Diferida | Alta (En contingencias de corte de internet en portería) |
| [CU-AST-07](Squad%202%20-%20Matricula%20y%20Asistencia/CU-AST-07.md) | [RF-26](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-26.md) | Generación y Emisión Masiva de Carnés Escolares con Código QR Criptográfico | Baja (Inicio de año escolar) |
| [CU-AST-08](Squad%202%20-%20Matricula%20y%20Asistencia/CU-AST-08.md) | [RF-27](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-27.md) | Toma Rápida en App Móvil y Difusión en Tiempo Real vía WebSockets | Diaria (Primera hora de clases) |
| [CU-PRA-01](Squad%202%20-%20Matricula%20y%20Asistencia/CU-PRA-01.md) | [RF-28](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-28.md) | Registro Diario de Jornada y Permanencia de Practicantes EPIS-UNSCH | Diaria (Entrada y Salida de turno) |
| [CU-PRA-02](Squad%202%20-%20Matricula%20y%20Asistencia/CU-PRA-02.md) | [RF-29](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-29.md) | Asignación de Docente Guía y Asesor Institucional | Baja (Inicio de ciclo universitario) |
| [CU-PRA-03](Squad%202%20-%20Matricula%20y%20Asistencia/CU-PRA-03.md) | [RF-30](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-30.md) | Cómputo Acumulado de Horas Efectivas de Prácticas Universitarias | Alta |
| [CU-PRA-04](Squad%202%20-%20Matricula%20y%20Asistencia/CU-PRA-04.md) | [RF-31](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-31.md) | Emisión de Fichas Oficiales de Prácticas para la UNSCH | Baja (Cierre de ciclo universitario) |
| [CU-DOC-01](Squad%202%20-%20Matricula%20y%20Asistencia/CU-DOC-01.md) | [RF-32](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-32.md) | Registro y Marcación de Horas Lectivas de Docentes Contratados | Diaria (Por cada bloque pedagógico) |
| [CU-DOC-02](Squad%202%20-%20Matricula%20y%20Asistencia/CU-DOC-02.md) | [RF-33](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-33.md) | Registro de Justificaciones y Reprogramación de Clases Docentes | Media |
| [CU-DOC-03](Squad%202%20-%20Matricula%20y%20Asistencia/CU-DOC-03.md) | [RF-34](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-34.md) | Consolidación Mensual de Cumplimiento de Horas Lectivas Dictadas | Mensual (Al cierre de cada mes) |
| [CU-DOC-04](Squad%202%20-%20Matricula%20y%20Asistencia/CU-DOC-04.md) | [RF-35](../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-35.md) | Supervisión y Monitoreo de Cobertura y Puntualidad de Clases | Diaria / Continua |

### [Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/README.md)

**Responsable:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`) | **Total:** 11 Casos de Uso

| ID | Requisito | Título del Caso de Uso | Frecuencia |
|---|---|---|---|
| [CU-NOT-01](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/CU-NOT-01.md) | [RF-36](../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-36.md) | Parametrización de Rúbricas y Evaluaciones por Asignatura | Media (Al inicio de cada periodo) |
| [CU-NOT-02](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/CU-NOT-02.md) | [RF-37](../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-37.md) | Ingreso, Edición y Publicación de Calificaciones en Tiempo Real | Muy Alta |
| [CU-NOT-03](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/CU-NOT-03.md) | [RF-38](../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-38.md) | Planilla Ágil de Notas en Modo Matriz Rápida ('Modo Excel / Teclado') | Muy Alta (Cierre de evaluaciones) |
| [CU-NOT-04](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/CU-NOT-04.md) | [RF-39](../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-39.md) | Asistente y Banco Estructurado de Conclusiones Descriptivas Sugeridas por Logro (MINEDU) | Alta (En cada cierre de bimestre) |
| [CU-NOT-05](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/CU-NOT-05.md) | [RF-40](../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-40.md) | Colaboración Supervisada de Practicantes en el Registro de Notas | Media |
| [CU-NOT-06](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/CU-NOT-06.md) | [RF-41](../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-41.md) | Cálculo Automatizado de Promedios Parciales, Bimestrales y Finales | Automática e Instantánea ante cualquier cambio |
| [CU-NOT-07](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/CU-NOT-07.md) | [RF-42](../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-42.md) | Cierre Oficial de Periodo Académico y Bloqueo de Modificación | Media (4 veces al año) |
| [CU-NOT-08](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/CU-NOT-08.md) | [RF-43](../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-43.md) | Flujo Extraordinario de Solicitud y Aprobación de Rectificación de Notas | Baja (Casos excepcionales) |
| [CU-NOT-09](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/CU-NOT-09.md) | [RF-44](../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-44.md) | Consulta Inmediata y Transparente de Calificaciones para Estudiantes | Alta |
| [CU-NOT-10](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/CU-NOT-10.md) | [RF-45](../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-45.md) | Llenado Asistido con Auto-Guardado en Segundo Plano (Debounce 400ms) | Constante durante la edición de notas |
| [CU-NOT-11](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/CU-NOT-11.md) | [RF-46](../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-46.md) | Motor de Conversión Escala Vigesimal (0-20) a Literal CNEB (AD, A, B, C) | Muy Alta |

### [Squad 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°](Squad%204%20-%20Analitica%20y%20Dashboards/README.md)

**Responsable:** Grissel Arascely Rodríguez Quispe (`@Arascely`) | **Total:** 12 Casos de Uso

| ID | Requisito | Título del Caso de Uso | Frecuencia |
|---|---|---|---|
| [CU-MAP-01](Squad%204%20-%20Analitica%20y%20Dashboards/CU-MAP-01.md) | [RF-47](../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-47.md) | Visualizar Mapa de Calor de Rendimiento Académico por Sección | Media (Cierre de bimestre y reuniones pedagógicas) |
| [CU-MAP-02](Squad%204%20-%20Analitica%20y%20Dashboards/CU-MAP-02.md) | [RF-48](../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-48.md) | Visualizar Mapa de Calor de Asistencia y Puntualidad | Semanal / Mensual |
| [CU-MAP-03](Squad%204%20-%20Analitica%20y%20Dashboards/CU-MAP-03.md) | [RF-49](../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-49.md) | Navegación Interactiva en Mapas de Calor con Zoom Jerárquico 'Drill-Down' | Alta durante análisis institucional |
| [CU-MAP-04](Squad%204%20-%20Analitica%20y%20Dashboards/CU-MAP-04.md) | [RF-50](../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-50.md) | Análisis Gráfico Comparativo de Rendimiento entre Secciones y Grados | Media |
| [CU-MAP-05](Squad%204%20-%20Analitica%20y%20Dashboards/CU-MAP-05.md) | [RF-51](../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-51.md) | Detección Visual de Asignaturas con Mayor Índice de Riesgo Académico | Media |
| [CU-DSH-01](Squad%204%20-%20Analitica%20y%20Dashboards/CU-DSH-01.md) | [RF-52](../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-52.md) | Tablero de Control Ejecutivo de Indicadores Clave para Dirección | Diaria |
| [CU-DSH-02](Squad%204%20-%20Analitica%20y%20Dashboards/CU-DSH-02.md) | [RF-53](../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-53.md) | Tablero de Control Curricular y Cumplimiento para Coordinación | Diaria / Semanal |
| [CU-DSH-03](Squad%204%20-%20Analitica%20y%20Dashboards/CU-DSH-03.md) | [RF-54](../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-54.md) | Tablero de Resumen Pedagógico y Clases Diarias para el Docente | Diaria (Al iniciar sesión) |
| [CU-DSH-04](Squad%204%20-%20Analitica%20y%20Dashboards/CU-DSH-04.md) | [RF-55](../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-55.md) | Generación Automatizada de Alertas de Deserción y Repitencia Escolar | Semanal / Al cierre de evaluaciones |
| [CU-DSH-05](Squad%204%20-%20Analitica%20y%20Dashboards/CU-DSH-05.md) | [RF-56](../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-56.md) | Ficha Integral y Radiografía Escolar 360° del Estudiante en 1 Clic | Alta durante atención a padres o consejos de grado |
| [CU-DSH-06](Squad%204%20-%20Analitica%20y%20Dashboards/CU-DSH-06.md) | [RF-57](../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-57.md) | Tablero de Seguimiento, Impacto y Acreditación del SSU (IS-480) | Semanal / Al cierre de ciclo |
| [CU-DSH-07](Squad%204%20-%20Analitica%20y%20Dashboards/CU-DSH-07.md) | [RF-58](../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-58.md) | Generador de Reportes de Diagnóstico Integral para Consejos Académicos | Bimestral |

### [Squad 5: Secretaría Digital, Criptografía Documental y Portal Web](Squad%205%20-%20Secretaria%20y%20Portal%20Web/README.md)

**Responsable:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`) | **Total:** 9 Casos de Uso

| ID | Requisito | Título del Caso de Uso | Frecuencia |
|---|---|---|---|
| [CU-REP-01](Squad%205%20-%20Secretaria%20y%20Portal%20Web/CU-REP-01.md) | [RF-59](../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-59.md) | Emisión Oficial de Boletas de Información Escolar / Libretas en PDF | Bimestral / Anual |
| [CU-REP-02](Squad%205%20-%20Secretaria%20y%20Portal%20Web/CU-REP-02.md) | [RF-60](../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-60.md) | Verificación Pública Criptográfica de Documentos mediante Hash SHA-256 y Código QR | Alta |
| [CU-REP-03](Squad%205%20-%20Secretaria%20y%20Portal%20Web/CU-REP-03.md) | [RF-61](../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-61.md) | Generación del Cuadro de Mérito y Puestos de Honor Institucionales | Bimestral y Anual (Clausura escolar) |
| [CU-REP-04](Squad%205%20-%20Secretaria%20y%20Portal%20Web/CU-REP-04.md) | [RF-62](../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-62.md) | Emisión y Descarga del Registro Auxiliar Oficial y Actas Finales | Bimestral / Fin de Año |
| [CU-REP-05](Squad%205%20-%20Secretaria%20y%20Portal%20Web/CU-REP-05.md) | [RF-63](../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-63.md) | Reportes Consolidados de Asistencia Multiactor del Plantel | Mensual |
| [CU-REP-06](Squad%205%20-%20Secretaria%20y%20Portal%20Web/CU-REP-06.md) | [RF-64](../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-64.md) | Exportación de Datos en Formatos Estándar Abiertos (PDF y Excel SIAGIE) | Media |
| [CU-PUB-01](Squad%205%20-%20Secretaria%20y%20Portal%20Web/CU-PUB-01.md) | [RF-69](../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-69.md) | Cartelera Digital y Publicación de Comunicados Institucionales | Alta |
| [CU-PUB-02](Squad%205%20-%20Secretaria%20y%20Portal%20Web/CU-PUB-02.md) | [RF-70](../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-70.md) | Publicación y Consulta del Calendario Cívico y Escolar Interactivo | Alta |
| [CU-PUB-03](Squad%205%20-%20Secretaria%20y%20Portal%20Web/CU-PUB-03.md) | [RF-71](../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-71.md) | Navegación Pública en Portal Institucional Responsivo y Accesible | Muy Alta |

---

## 4. Trazabilidad con Requisitos y Arquitectura

* 📁 [Requisitos Funcionales por Squads](../Requisitos%20Funcionales/)
* 📁 [Arquitectura y Contratos API por Squads](../Arquitectura/)
* 📄 [Documento Maestro de Arquitectura (SAD)](../Arquitectura/arquitectura_sistema.md)
