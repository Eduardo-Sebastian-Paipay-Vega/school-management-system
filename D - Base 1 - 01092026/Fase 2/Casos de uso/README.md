# Catálogo Maestro de Casos de Uso del Sistema (Fase 2)

### Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH (SSU IS-480)

Este directorio documenta la especificación funcional basada en Casos de Uso (Use Cases - UML) que implementan los **68 Requisitos Funcionales (`RF-01` al `RF-68`)** formalizados en el [Catálogo Documental IEEE 830](file:///e:/zapata%202026%20-%20II/school-management-system/D%20-%20Base%201%20-%2001092026/Fase%202/Requisitos%20Funcionales/requisitos_funcionales.md) y el [SRS Técnico](file:///e:/zapata%202026%20-%20II/school-management-system/D%20-%20Base%201%20-%2001092026/Fase%202/Requisitos%20Funcionales/requisitos_funcionales_tecnicos.md).

---

## 1. Matriz de Trazabilidad: Actores vs. Módulos

| Actor | Responsabilidad Primaria | Módulos Asociados |
|---|---|---|
| **Superadmin / Admin** | Configuración general, gestión de usuarios, roles, periodos, mallas y auditoría. | Módulo 1, 2, 3, 4, 10, 11, 12, 13 |
| **Director / Subdirector** | Aprobación de actas, supervisión integral, mapas de calor, reportes y métricas SSU. | Módulo 5, 6, 7, 8, 9, 10, 11, 12 |
| **Docente (Nombrado/Contratado)** | Registro de notas (Modo Excel), conclusiones CNEB, asistencia en aula y reprogramación. | Módulo 5, 7, 8, 9, 10 |
| **Practicante Preprofesional** | Marcación de jornada, justificación de inasistencias y seguimiento de horas acumuladas. | Módulo 6, 10 |
| **Personal de Portería / Vigilancia** | Operación del Kiosco Offline-First de asistencia y validación de carnés con código QR. | Módulo 5 |
| **Estudiante** | Consulta de notas consolidadas, historial de asistencia y carné escolar digital. | Módulo 5, 8, 10, 13 |
| **Público General / Comunidad UNSCH** | Consulta del portal de difusión digital y verificación pública de documentos con QR. | Módulo 11, 13 |

---

## 2. Índice General de Casos de Uso por Módulo

### Módulo 1: Acceso, Autenticación JWT y RBAC
- **CU-SEG-01:** Iniciar Sesión en la Plataforma (`RF-01`)
- **CU-SEG-02:** Recuperar Contraseña mediante Token Temporal (`RF-02`)
- **CU-SEG-03:** Cerrar Sesión e Invalidar Tokens JWT (`RF-03`)
- **CU-SEG-04:** Control de Acceso Basado en Roles y Permisos Granulares (`RF-04`)

### Módulo 2: Administración de Usuarios y Directorio
- **CU-USR-01:** Registrar Usuario en el Directorio Institucional (`RF-05`)
- **CU-USR-02:** Modificar Datos y Asignaciones de Usuario (`RF-06`)
- **CU-USR-03:** Desactivar Lógicamente a un Usuario del Sistema (`RF-07`)
- **CU-USR-04:** Consultar Directorio con Búsqueda Paginada y Filtros (`RF-08`)
- **CU-USR-05:** Gestionar Roles Secundarios y Permisos Especiales (`RF-09`)

### Módulo 3: Configuración Escolar, Periodos y Escalas
- **CU-INS-01:** Parametrizar Datos Institucionales y Sedes (`RF-10`)
- **CU-INS-02:** Aperturar y Cerrar Años y Periodos Académicos (`RF-11`)
- **CU-INS-03:** Configurar Niveles Educativos, Grados y Secciones (`RF-12`)
- **CU-INS-04:** Administrar Planes de Estudio y Catálogo de Cursos (`RF-13`)
- **CU-INS-05:** Configurar Escalas Oficiales de Calificación (CNEB y Vigesimal) (`RF-14`)

### Módulo 4: Gestión Académica, Matrícula y Carga Lectiva
- **CU-ACD-01:** Registrar y Actualizar Ficha de Estudiante (`RF-15`)
- **CU-ACD-02:** Registrar y Asignar Carga a Docentes y Practicantes (`RF-16`)
- **CU-ACD-03:** Matricular Estudiantes en Grado y Sección (`RF-17`)
- **CU-ACD-04:** Asignar Carga Lectiva y Horarios a Docentes (`RF-18`)
- **CU-ACD-05:** Consultar Nóminas de Matrícula Oficiales (`RF-19`)

### Módulo 5: Asistencia Estudiantil, Kiosco Offline-First y Carnés QR
- **CU-AST-01:** Registrar Asistencia Diaria en Aula (`RF-20`)
- **CU-AST-02:** Justificar Inasistencias y Tardanzas con Evidencia (`RF-21`)
- **CU-AST-03:** Generar Reportes y Porcentajes de Asistencia Escolar (`RF-22`)
- **CU-AST-04:** Alertas Preventivas por Inasistencias Críticas (`RF-23`)
- **CU-AST-05:** Marcación Rápida de Asistencia por Escaneo de Código de Barras / DNI (`RF-24`)
- **CU-AST-06:** **[Innovación 1]** Operar Kiosco de Portería en Modo Offline-First y Sincronización Diferida (`RF-25`)
- **CU-AST-07:** **[Innovación 2]** Emitir e Imprimir Carnés Escolares Institucionales con Código QR Criptográfico (`RF-26`)

### Módulo 6: Asistencia y Cómputo de Horas de Practicantes
- **CU-PRA-01:** Registrar Marcación de Entrada y Salida con Geolocalización Referencial (`RF-27`)
- **CU-PRA-02:** Calcular y Acumular Horas de Prácticas Preprofesionales Automáticamente (`RF-28`)
- **CU-PRA-03:** Supervisar y Validar Asistencia de Practicantes por Coordinación (`RF-29`)
- **CU-PRA-04:** Generar Constancia de Cumplimiento de Horas para el SSU IS-480 (`RF-30`)

### Módulo 7: Horas de Docentes Contratados y Reprogramación
- **CU-DOC-01:** Registrar Asistencia de Docentes Contratados por Sesión (`RF-31`)
- **CU-DOC-02:** Computar Horas Lectivas Dictadas frente a Horas Contractuales (`RF-32`)
- **CU-DOC-03:** Solicitar y Autorizar Reprogramación de Sesiones de Clase (`RF-33`)
- **CU-DOC-04:** Generar Reporte Mensual Consolidado para Gestión de Personal (`RF-34`)

### Módulo 8: Calificaciones en Tiempo Real, Modo Excel y Conclusiones
- **CU-NOT-01:** Registrar y Actualizar Calificaciones por Competencia y Criterio (`RF-35`)
- **CU-NOT-02:** Consolidar Calificaciones Bimestrales y Anuales Automáticamente (`RF-36`)
- **CU-NOT-03:** Notificar Calificaciones en Tiempo Real vía WebSockets (`RF-37`)
- **CU-NOT-04:** Aperturar y Bloquear Periodos de Ingreso de Calificaciones (`RF-38`)
- **CU-NOT-05:** Registrar Conclusiones Descriptivas por Competencia según CNEB (`RF-39`)
- **CU-NOT-06:** Consultar Historial de Calificaciones e Histórico Académico (`RF-40`)
- **CU-NOT-07:** Exportar Calificaciones Consolidadas a Hojas de Cálculo (`RF-41`)
- **CU-NOT-08:** **[Innovación 3]** Ingreso Masivo y Rápido de Calificaciones en Planilla Interactiva "Modo Excel" (`RF-42`)
- **CU-NOT-09:** **[Innovación 4]** Utilizar Asistente y Banco Estructurado de Conclusiones Descriptivas MINEDU (`RF-43`)

### Módulo 9: Mapas de Calor con Navegación Drill-Down
- **CU-MAP-01:** Visualizar Mapa de Calor de Rendimiento Académico Institucional (`RF-44`)
- **CU-MAP-02:** Visualizar Mapa de Calor de Asistencia y Puntualidad (`RF-45`)
- **CU-MAP-03:** Filtrar y Segmentar Mapas de Calor por Variables Multidimensionales (`RF-46`)
- **CU-MAP-04:** Exportar Mapas de Calor a Formatos Gráficos y Tabulares (`RF-47`)
- **CU-MAP-05:** **[Innovación 5]** Navegar Interactivamente en Mapa de Calor mediante Zoom Jerárquico "Drill-Down" (`RF-48`)

### Módulo 10: Dashboards, Ficha 360° del Alumno y Métricas SSU IS-480
- **CU-DSH-01:** Visualizar Dashboard Directivo Institucional (`RF-49`)
- **CU-DSH-02:** Visualizar Dashboard Operativo del Docente (`RF-50`)
- **CU-DSH-03:** Visualizar Dashboard Académico del Estudiante (`RF-51`)
- **CU-DSH-04:** Alertas Tempranas en Tablero de Control (`RF-52`)
- **CU-DSH-05:** Comparativo Histórico de Desempeño entre Periodos (`RF-53`)
- **CU-DSH-06:** **[Innovación 6]** Consultar Ficha Escolar Integral 360° del Estudiante (`RF-54`)
- **CU-DSH-07:** **[Innovación 8]** Monitorear Métricas de Impacto Institucional y Social SSU IS-480 (`RF-55`)

### Módulo 11: Emisión de Reportes y Verificación Criptográfica QR
- **CU-REP-01:** Generar Boletas de Notas Oficiales por Bimestre o Año (`RF-56`)
- **CU-REP-02:** Generar Actas Consolidadas de Evaluación Final (`RF-57`)
- **CU-REP-03:** Generar Reportes Estadísticos Institucionales de Asistencia y Rendimiento (`RF-58`)
- **CU-REP-04:** Generar Constancias de Estudio con Parámetros Institucionales (`RF-59`)
- **CU-REP-05:** Exportar Reportes Masivos a Formatos PDF y Hojas de Cálculo (`RF-60`)
- **CU-REP-06:** **[Innovación 7]** Generar y Verificar Autenticidad Documental Criptográfica mediante Hash SHA-256 y Código QR Público (`RF-61`)

### Módulo 12: Trazabilidad, Auditoría y Protección de Datos (Ley 29733)
- **CU-AUD-01:** Registrar Pista de Auditoría para Eventos de Autenticación y Seguridad (`RF-62`)
- **CU-AUD-02:** Registrar Trazabilidad Inmutable de Modificaciones Críticas (`RF-63`)
- **CU-AUD-03:** Consultar y Filtrar Registros de Auditoría por Administradores (`RF-64`)
- **CU-AUD-04:** Garantizar Cumplimiento de Confidencialidad y Protección de Datos Personales (Ley N.° 29733) (`RF-65`)

### Módulo 13: Plataforma de Difusión Digital y Portal Institucional
- **CU-PUB-01:** Gestionar y Publicar Noticias, Comunicados y Circulares Institucionales (`RF-66`)
- **CU-PUB-02:** Publicar Calendario de Actividades y Efemérides Escolares (`RF-67`)
- **CU-PUB-03:** Navegación Pública en Portal Institucional Responsivo y Accesible (`RF-68`)

---

## 3. Ejemplo de Especificación Detallada de Caso de Uso de Innovación

### CU-AST-06: Operar Kiosco de Portería en Modo Offline-First y Sincronización Diferida
- **Requisito Trazable:** `RF-25` (Fase 2) / `RF-AST-06` (Fase 1).
- **Actor Primario:** Personal de Portería / Vigilancia.
- **Precondiciones:** La terminal (PC/Tablet en portería) ha iniciado sesión previamente y descargado el roster encriptado en el almacenamiento local del navegador (IndexedDB).
- **Flujo Principal:**
  1. El personal de vigilancia activa el modo "Kiosco de Entrada" en el navegador.
  2. El estudiante aproxima su carné escolar al lector de códigos de barras o cámara QR.
  3. El sistema lee el identificador, valida contra la base local (tiempo de respuesta < 200 ms) y muestra en pantalla: Fotografía, Nombre completo, Grado/Sección y estado ("PUNTUAL" en verde o "TARDANZA" en amarillo).
  4. El sistema almacena la marcación en la cola `offline_attendance_queue` en IndexedDB.
  5. Si hay conexión a internet activa, el servicio de sincronización envía inmediatamente la transacción al backend mediante `POST /api/v1/attendance/kiosk/batch-sync`.
  6. Si la conexión se interrumpe (evento `window.onoffline`), el sistema conmuta a modo desconectado, muestra indicador amarillo de "Modo Local" y continúa registrando marcaciones sin interrumpir el ingreso escolar.
  7. Al reanudarse la conectividad (evento `window.ononline`), el sincronizador descarga la cola acumulada, confirma la persistencia en PostgreSQL y limpia el buffer local.
- **Postcondiciones:** Todas las asistencias quedan registradas de manera fehaciente sin pérdida de datos ni duplicación de registros.
