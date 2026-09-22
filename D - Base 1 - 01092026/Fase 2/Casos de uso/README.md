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

### Módulo 5: Asistencia Estudiantil, Kiosco Offline-First, Carnés QR y App Móvil
- **CU-AST-01:** Registrar Asistencia Diaria en Aula (`RF-20`)
- **CU-AST-02:** Registrar Ingreso Físico en Modo Kiosco de Portería ("Wachiman") (`RF-21`)
- **CU-AST-03:** Justificar Inasistencias y Tardanzas con Evidencia (`RF-22`)
- **CU-AST-04:** Consolidar y Consultar Récord de Asistencia por Estudiante (`RF-23`)
- **CU-AST-05:** Detección de Alertas Preventivas por Ausentismo Crónico (`RF-24`)
- **CU-AST-06:** **[Innovación 1]** Operar Kiosco de Portería en Modo Offline-First y Sincronización Diferida (`RF-25`)
- **CU-AST-07:** **[Innovación 2]** Emitir e Imprimir Carnés Escolares Institucionales con Código QR Criptográfico (`RF-26`)
- **CU-AST-08:** **[Innovación / Requisito Usuario]** Toma Rápida de Asistencia en Aula mediante Aplicación Móvil y Difusión en Tiempo Real vía WebSockets (`RF-27`)

### Módulo 6: Asistencia y Cómputo de Horas de Practicantes
- **CU-PRA-01:** Registrar Marcación de Entrada y Salida con Geolocalización Referencial (`RF-28`)
- **CU-PRA-02:** Calcular y Acumular Horas de Prácticas Preprofesionales Automáticamente (`RF-29`)
- **CU-PRA-03:** Supervisar y Validar Asistencia de Practicantes por Coordinación (`RF-30`)
- **CU-PRA-04:** Generar Constancia de Cumplimiento de Horas para el SSU IS-480 (`RF-31`)

### Módulo 7: Horas de Docentes Contratados y Reprogramación
- **CU-DOC-01:** Registrar Asistencia de Docentes Contratados por Sesión (`RF-32`)
- **CU-DOC-02:** Solicitar y Autorizar Reprogramación de Clases Docentes (`RF-33`)
- **CU-DOC-03:** Consolidar Mensualmente el Cumplimiento de Horas Lectivas Dictadas (`RF-34`)
- **CU-DOC-04:** Supervisar la Cobertura y Puntualidad Docente en Tiempo Real (`RF-35`)

### Módulo 8: Calificaciones en Tiempo Real, Modo Excel, Conclusiones, Llenado Asistido y Conversión CNEB
- **CU-NOT-01:** Parametrizar Rúbricas y Evaluaciones por Asignatura (`RF-36`)
- **CU-NOT-02:** Registrar, Editar y Publicar Calificaciones en Tiempo Real (`RF-37`)
- **CU-NOT-03:** **[Innovación 3]** Ingreso Masivo y Rápido de Calificaciones en Planilla Interactiva "Modo Excel" (`RF-38`)
- **CU-NOT-04:** **[Innovación 4]** Utilizar Asistente y Banco Estructurado de Conclusiones Descriptivas MINEDU (`RF-39`)
- **CU-NOT-05:** Colaboración Supervisada de Practicantes en el Registro de Notas (`RF-40`)
- **CU-NOT-06:** Cálculo Automatizado de Promedios Parciales, Bimestrales y Finales (`RF-41`)
- **CU-NOT-07:** Cierre Oficial de Periodo Académico y Bloqueo de Modificación (`RF-42`)
- **CU-NOT-08:** Flujo Extraordinario de Solicitud y Aprobación de Rectificación (`RF-43`)
- **CU-NOT-09:** Consulta Inmediata y Transparente de Calificaciones para Estudiantes (`RF-44`)
- **CU-NOT-10:** **[Innovación / Requisito Usuario]** Llenado Asistido con Auto-Guardado en Segundo Plano y Conexión Automática de Evaluaciones (`RF-45`)
- **CU-NOT-11:** **[Innovación / Requisito Usuario]** Motor de Conversión y Escala Dual Automatizada de Calificaciones Numéricas (0 a 20) a Escala Cualitativa Literal CNEB (AD, A, B, C) (`RF-46`)

### Módulo 9: Mapas de Calor con Navegación Drill-Down
- **CU-MAP-01:** Visualizar Mapa de Calor de Rendimiento Académico Institucional (`RF-47`)
- **CU-MAP-02:** Visualizar Mapa de Calor de Asistencia y Puntualidad (`RF-48`)
- **CU-MAP-03:** **[Innovación 5]** Navegar Interactivamente en Mapa de Calor mediante Zoom Jerárquico "Drill-Down" (`RF-49`)
- **CU-MAP-04:** Comparativas Visuales de Rendimiento entre Secciones (`RF-50`)
- **CU-MAP-05:** Detección Visual de Asignaturas con Mayor Índice de Riesgo (`RF-51`)

### Módulo 10: Dashboards, Ficha 360° del Alumno y Métricas SSU IS-480
- **CU-DSH-01:** Visualizar Dashboard Directivo Institucional (`RF-52`)
- **CU-DSH-02:** Visualizar Dashboard Operativo de Coordinación (`RF-53`)
- **CU-DSH-03:** Visualizar Dashboard Pedagógico del Docente (`RF-54`)
- **CU-DSH-04:** Visualizar Dashboard Académico del Estudiante (`RF-55`)
- **CU-DSH-05:** **[Innovación 6]** Consultar Ficha Escolar Integral 360° del Estudiante (`RF-56`)
- **CU-DSH-06:** **[Innovación 8]** Monitorear Métricas de Impacto Institucional y Social SSU IS-480 (`RF-57`)
- **CU-DSH-07:** Alertas Preventivas de Deserción y Repitencia Escolar (`RF-58`)

### Módulo 11: Emisión de Reportes y Verificación Criptográfica QR
- **CU-REP-01:** Generar Boletas de Notas Oficiales por Bimestre o Año (`RF-59`)
- **CU-REP-02:** **[Innovación 7]** Generar y Verificar Autenticidad Documental Criptográfica mediante Hash SHA-256 y Código QR Público (`RF-60`)
- **CU-REP-03:** Generar Cuadro de Mérito y Puestos de Honor Institucionales (`RF-61`)
- **CU-REP-04:** Emitir y Descargar Registro Auxiliar Oficial y Actas Finales (`RF-62`)
- **CU-REP-05:** Generar Reportes Consolidados de Asistencia Multiactor (`RF-63`)
- **CU-REP-06:** Exportar Reportes Masivos a Formatos PDF y Hojas de Cálculo (`RF-64`)

### Módulo 12: Trazabilidad, Auditoría y Protección de Datos (Ley 29733)
- **CU-AUD-01:** Registrar Pista de Auditoría para Eventos de Autenticación y Seguridad (`RF-65`)
- **CU-AUD-02:** Registrar Trazabilidad Inmutable de Modificaciones Críticas (`RF-66`)
- **CU-AUD-03:** Consultar y Filtrar Registros de Auditoría por Administradores (`RF-67`)
- **CU-AUD-04:** Garantizar Cumplimiento de Confidencialidad y Protección de Datos Personales (Ley N.° 29733) (`RF-68`)

### Módulo 13: Plataforma de Difusión Digital y Portal Institucional
- **CU-PUB-01:** Gestionar y Publicar Noticias, Comunicados y Circulares Institucionales (`RF-69`)
- **CU-PUB-02:** Publicar Calendario de Actividades y Efemérides Escolares (`RF-70`)
- **CU-PUB-03:** Navegación Pública en Portal Institucional Responsivo y Accesible (`RF-71`)

---

## 3. Ejemplos de Especificación Detallada de Casos de Uso de Innovación

### CU-AST-08: Toma Rápida de Asistencia en Aula con App Móvil y Transmisión en Tiempo Real
- **Requisito Trazable:** `RF-27` (Fase 2) / `RF-AST-08` (Fase 1).
- **Actor Primario:** Docente de Aula / Auxiliar de Educación.
- **Flujo Principal:**
  1. El docente accede a la sesión desde su smartphone o tableta en el salón de clases.
  2. La app carga la lista del aula con estado "Todos Presentes".
  3. El docente toca sobre los alumnos ausentes o retrasados: un toque = Tardanza (amarillo), dos toques = Falta (rojo).
  4. Presiona "Confirmar Asistencia".
  5. El sistema envía el lote al servidor y emite por WebSockets el evento `ATTENDANCE_TAKEN`.
  6. En tiempo real (< 500 ms), el tablero de la Dirección y Coordinación refleja el aula como registrada y actualiza los indicadores de asistencia global del colegio.
- **Postcondiciones:** Asistencia registrada sin demoras y visible en vivo para los directivos.

### CU-NOT-11: Motor de Conversión y Escala Dual Automatizada Vigesimal (0 a 20) a Literal CNEB
- **Requisito Trazable:** `RF-46` (Fase 2) / `RF-NOT-11` (Fase 1).
- **Actor Primario:** Docente Titular del Curso.
- **Flujo Principal:**
  1. El docente califica un examen sobre 20 y digita en la celda: `16`.
  2. El sistema detecta el valor numérico, evalúa la regla del CNEB (14 a 17 = A) y automáticamente despliega la insignia verde `A (Logro Esperado)` junto con el puntaje `(16)`.
  3. Si el docente pega una columna completa de notas vigesimales desde Excel, el sistema convierte todas las filas a sus letras oficiales en menos de 1 segundo.
  4. En las libretas y reportes para MINEDU se emite la escala literal (`A`), mientras que en los análisis internos de promedios se preserva el puntaje exacto.
- **Postcondiciones:** Documentos escolares 100% alineados a la norma MINEDU sin esfuerzo manual de conversión docente.
