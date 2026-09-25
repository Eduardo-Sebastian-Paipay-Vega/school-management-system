# MODELO C4 — NIVEL 3: DIAGRAMA DE COMPONENTES (COMPONENT DIAGRAM)

### Sistema de Gestión Escolar e Información Institucional
**Institución Beneficiaria:** Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH (Ayacucho, Perú)  
**Marco Académico:** Servicio Social Universitario IS-480 (Semestre 2026-II) — EPIS UNSCH  
**Estándar de Modelado:** Modelo C4 (Simon Brown) — Nivel 3: Componentes  

---

## 1. PROPÓSITO DEL NIVEL 3

El **Diagrama de Componentes (Component Diagram)** profundiza en la estructura interna del contenedor principal de procesamiento (**C-04: API Gateway & Application Server**) y su correlación con la arquitectura **Clean Architecture** y los **5 Squads Técnicos**.

En este nivel se descomponen las interfaces de entrada (Controladores RESTful y Gateways), los servicios de aplicación y casos de uso (Lógica de Dominio), y los adaptadores de infraestructura (Acceso a Datos PostgreSQL, Caché Redis, Criptografía y Generadores PDF), especificando los contratos, métodos e intercambios entre módulos para cumplir con los **71 Requisitos Funcionales (`RF-01` al `RF-71`)**.

---

## 2. CATÁLOGO DE COMPONENTES POR CAPAS

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               CONTENEDOR C-04: API GATEWAY & APPLICATION SERVER (NODE.JS / TS)         │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ CAPA 1: CONTROLADORES Y ADAPTADORES DE ENTRADA (REST & WEBSOCKETS)             │   │
│   │ [AuthController] [UserController] [SchoolConfigController] [AcademicController]│   │
│   │ [AttendanceController] [PractitionerController] [ContractedTeacherController]  │   │
│   │ [GradesExcelController] [HeatmapController] [Dashboard360Controller]           │   │
│   │ [OfficialReportController] [AuditLogController] [PortalPublicController]       │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
│                                           │ Invoca Casos de Uso (DTOs tipados)         │
│                                           ▼                                            │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ CAPA 2: SERVICIOS DE DOMINIO Y CASOS DE USO (BUSINESS LOGIC ENGINE)            │   │
│   │ • AuthService (JWT HS256/RS256, bcrypt)     • RBACGuard (Validación Roles)     │   │
│   │ • KioskSyncWorker (Idempotencia Offline)    • WebSocketBroadcastGateway        │   │
│   │ • GradeExcelDebounceEngine (Buffer 400ms)   • CNEBConversionEngine (Dual)      │   │
│   │ • DescriptiveConclusionEngine (Catálogo)    • HeatmapDrillDownEngine (Matrix)  │   │
│   │ • Radar360Engine (Métricas Holísticas)      • SSUImpactCalculator (Acredita)   │   │
│   │ • CryptoDocumentSigner (SHA-256 + QR)       • AuditLoggerService (Ley 29733)   │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
│                                           │ Persistencia y Servicios Externos          │
│                                           ▼                                            │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ CAPA 3: ADAPTADORES DE INFRAESTRUCTURA Y REPOSITORIOS                          │   │
│   │ • PostgresRepository (Multi-Tenant `tenant_id`, Transacciones ACID, Triggers)  │   │
│   │ • RedisCacheClient (Tokens Blacklist, Pub/Sub WebSockets, Rate Limiting)       │   │
│   │ • PdfKitReportRenderer (Maquetación Vectorial de Boletas y Carnés Oficiales)   │   │
│   │ • SmtpEmailClient (Notificaciones de Recuperación y Alertas Directivas)        │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.1 Componentes de Entrada (Controladores API REST y Gateways)

| ID | Componente | Squad | Responsabilidad y Trazabilidad a Requisitos Funcionales |
|---|---|:---:|---|
| **CMP-01** | **`AuthController`** | Squad 1 | Expone `/api/v1/auth/login`, `/refresh`, `/logout` y `/recover`. Procesa credenciales institucionales, emite Access Tokens (JWT) y Refresh Tokens. (`RF-01` a `RF-04`). |
| **CMP-02** | **`UserController`** | Squad 1 | Expone `/api/v1/users`. Gestiona altas, bajas lógicas, asignación de roles RBAC, medios de contacto y directorio institucional. (`RF-05` a `RF-09`). |
| **CMP-03** | **`SchoolConfigController`** | Squad 1 | Expone `/api/v1/config/school`. Parametriza sedes, periodos académicos, grados, secciones, áreas curriculares y escalas evaluativas oficiales. (`RF-10` a `RF-14`). |
| **CMP-04** | **`AcademicController`** | Squad 2 | Expone `/api/v1/academic`. Controla el padrón estudiantil, matrícula de alumnos, asignación de carga lectiva docente y generación de nóminas oficiales. (`RF-15` a `RF-19`). |
| **CMP-05** | **`AttendanceController`** | Squad 2 | Expone `/api/v1/attendance`. Procesa marcaciones de aula en tiempo real, justificaciones, alertas de ausentismo crónico y el endpoint de sincronización del Kiosco. (`RF-20` a `RF-27`). |
| **CMP-06** | **`PractitionerController`** | Squad 2 | Expone `/api/v1/practitioners`. Controla el registro de permanencia de practicantes de Educación, cómputo acumulativo de horas y fichas oficiales para EPIS-UNSCH. (`RF-28` a `RF-31`). |
| **CMP-07** | **`ContractedTeacherController`** | Squad 2 | Expone `/api/v1/teachers/contracted`. Supervisa el cumplimiento de horas lectivas dictadas, registro de asistencias y reprogramación de clases compensatorias. (`RF-32` a `RF-35`). |
| **CMP-08** | **`GradesExcelController`** | Squad 3 | Expone `/api/v1/grades/spreadsheet`. Maneja el guardado interactivo de notas ("Modo Excel"), auto-guardado en cascada, conversión CNEB y conclusiones descriptivas. (`RF-36` a `RF-46`). |
| **CMP-09** | **`HeatmapController`** | Squad 4 | Expone `/api/v1/analytics/heatmaps`. Genera matrices térmicas bidimensionales de rendimiento y asistencia con soporte para navegación jerárquica Drill-Down. (`RF-47` a `RF-51`). |
| **CMP-10** | **`Dashboard360Controller`** | Squad 4 | Expone `/api/v1/analytics/dashboards`. Sirve la radiografía escolar integral (Ficha 360° del alumno), alertas de deserción escolar y el panel de impacto del SSU IS-480. (`RF-52` a `RF-58`). |
| **CMP-11** | **`OfficialReportController`** | Squad 5 | Expone `/api/v1/reports`. Genera boletas de notas oficiales en PDF con sello SHA-256, actas consolidadas en Excel, cuadros de mérito y resuelve la verificación pública QR. (`RF-59` a `RF-64`). |
| **CMP-12** | **`AuditLogController`** | Squad 1 | Expone `/api/v1/audit/logs`. Permite a la Dirección y Administrador consultar la bitácora inmutable de eventos críticos bajo la Ley N.° 29733. (`RF-65` a `RF-68`). |
| **CMP-13** | **`PortalPublicController`** | Squad 5 | Expone `/api/v1/portal/public`. Publica y sirve noticias institucionales, avisos escolares, cartelera digital y el calendario cívico escolar sin autenticación. (`RF-69` a `RF-71`). |

---

### 2.2 Componentes de Dominio y Lógica de Negocio (Core Services)

| ID | Componente | Responsabilidad de Dominio |
|---|---|---|
| **SRV-01** | **`AuthService`** | Hashing de contraseñas con `bcrypt` (12 rounds), generación de claims en tokens JWT (HS256/RS256), rotación de Refresh Tokens y revocación inmediata. |
| **SRV-02** | **`RBACGuard`** | Middleware interceptor que valida el token Bearer y verifica que el rol del usuario posea los permisos exigidos por el endpoint en ejecución. |
| **SRV-03** | **`KioskSyncWorker`** | Procesa paquetes masivos de asistencias recibidos desde el Kiosco de Portería, deduplica registros mediante `idempotency_key` y valida retardos contra horario. |
| **SRV-04** | **`WebSocketBroadcastGateway`** | Emite eventos reactivos hacia clientes suscritos (ej. refresco instantáneo de la asistencia en portería cuando un docente toma asistencia en el aula con su móvil). |
| **SRV-05** | **`GradeExcelDebounceEngine`** | Recibe micro-transacciones de notas emitidas tras un debounce de 400ms, aplica auto-guardado en segundo plano y recalcula promedios ponderados en cascada. |
| **SRV-06** | **`CNEBConversionEngine`** | Motor de conversión matemática y normativa: transforma calificaciones numéricas vigesimales (0 a 20) a la escala literal oficial CNEB (`AD`, `A`, `B`, `C`) según rangos MINEDU. |
| **SRV-07** | **`DescriptiveConclusionEngine`** | Asistente inteligente basado en reglas pedagógicas: provee sugerencias predefinidas de logros, dificultades y recomendaciones de mejora según el nivel del alumno. |
| **SRV-08** | **`HeatmapDrillDownEngine`** | Agrega y calcula matrices estadísticas de notas y ausentismo; permite navegar interactivamente desde Nivel Educativo -> Grado -> Sección -> Alumno. |
| **SRV-09** | **`Radar360Engine`** | Compila y correlaciona notas, asistencia, conducta, cumplimiento de tareas y antecedentes del alumno para conformar la Ficha Escolar 360°. |
| **SRV-10** | **`SSUImpactCalculator`** | Computa las métricas exigidas para la acreditación universitaria del SSU IS-480 (docentes capacitados, horas de práctica validadas, estudiantes beneficiados). |
| **SRV-11** | **`CryptoDocumentSigner`** | Construye la cadena canónica del documento escolar oficial, calcula el digest SHA-256 e incrusta el hash y la URL pública en el código QR del PDF. |
| **SRV-12** | **`AuditLoggerService`** | Interceptor global que registra en la tabla inmutable `logs_auditoria`: `ip_origen`, `user_agent`, `tenant_id`, `usuario_id`, `accion` y payload diferencial JSONB. |

---

### 2.3 Componentes de Infraestructura y Repositorios

* **`PostgresRepository` (INF-01):** Capa de abstracción de datos para PostgreSQL. Ejecuta consultas preparadas mediante pool de conexiones (`pg-pool`), garantiza transacciones ACID y propaga el discriminador `tenant_id` en cada consulta.
* **`RedisCacheClient` (INF-02):** Cliente de conexión a Redis para control de tokens en lista negra, almacenamiento de sesiones transitorias y bus Pub/Sub.
* **`PdfKitReportRenderer` (INF-03):** Motor de renderizado vectorial de documentos PDF institucionales (boletas oficiales y carnés con código QR).
* **`SmtpEmailClient` (INF-04):** Conector hacia el servidor de correo electrónico institucional para despacho de notificaciones asíncronas.

---

## 3. MATRIZ DETALLADA DE CONEXIONES INTER-COMPONENTES (NIVEL 3)

| Componente Origen | Componente Destino | Método / Operación Invocada | DTO / Parámetros | Tipo de Retorno / Efecto | Trazabilidad RF |
|---|---|---|---|---|:---:|
| `AuthController` | `AuthService` | `authenticateUser(credentialsDto)` | `{ email, password, tenantId }` | `{ accessToken, refreshToken, user }` | `RF-01` |
| `AuthController` | `RedisCacheClient` | `revokeRefreshToken(token)` | `refreshTokenUUID` | Invalida token en lista negra (Blacklist) | `RF-02` |
| `AttendanceController` | `KioskSyncWorker` | `syncOfflineBatch(batchDto)` | `[ { dni, timestamp, carnetHash, idempotencyKey } ]` | `{ processed: N, duplicates: M, errors: [] }` | `RF-25` |
| `AttendanceController` | `WebSocketBroadcastGateway` | `broadcastAttendanceUpdate(event)` | `{ aulaId, fecha, presentes: X, ausentes: Y }` | Emisión WSS a clientes conectados en vivo | `RF-27` |
| `GradesExcelController` | `GradeExcelDebounceEngine` | `saveCellGrade(gradeCellDto)` | `{ studentId, evaluacionId, nota, tipo }` | `{ saved: true, updatedAvg: 16.5, scale: 'A' }` | `RF-38`, `RF-45` |
| `GradeExcelDebounceEngine` | `CNEBConversionEngine` | `convertToCNEB(vigesimalScore)` | `number (0.0 - 20.0)` | `Enum ('AD', 'A', 'B', 'C')` | `RF-46` |
| `GradesExcelController` | `DescriptiveConclusionEngine`| `getSuggestions(competenciaId, escala)`| `{ competenciaId, escala: 'B' }` | `string[] (Plantillas pedagógicas sugeridas)` | `RF-39` |
| `HeatmapController` | `HeatmapDrillDownEngine` | `generateMatrix(periodoId, nivel, grado)`| `{ tenantId, periodoId, nivelId, gradoId }` | Matriz bidimensional de calor con semáforos | `RF-49` |
| `Dashboard360Controller` | `Radar360Engine` | `buildStudentProfile360(studentId)` | `studentUUID` | `{ radarMetrics, asistenciaPct, riesgoDesercion }` | `RF-56` |
| `Dashboard360Controller` | `SSUImpactCalculator` | `computeSSUMetrics(semestreId)` | `semestreId: '2026-II'` | `{ horasSSU, docentesAtendidos, kpiAlcanzado }`| `RF-57` |
| `OfficialReportController` | `CryptoDocumentSigner` | `generateSignedReportPdf(reportDto)` | `{ studentId, periodoId, consolidados }` | `{ pdfBuffer, sha256Hash, qrValidationUrl }` | `RF-59`, `RF-60` |
| *Cualquier Controlador* | `AuditLoggerService` | `logSecurityEvent(auditDto)` | `{ userId, ip, action, oldData, newData }` | Inserta registro inmutable en PostgreSQL | `RF-65` |

---

## 4. FLUJOS CLAVE DE INTERACCIÓN INTER-COMPONENTES

### Flujo 1: Calificación en Planilla "Modo Excel" con Conversión CNEB Dual
1. El docente ingresa una nota en una celda de la planilla en Flutter y presiona `Enter` para pasar a la fila siguiente.
2. Flutter aplica un debounce de 400ms (`RF-45`) y emite una petición `PATCH /api/v1/grades/spreadsheet/cell`.
3. `GradesExcelController` recibe la petición y llama a `GradeExcelDebounceEngine.saveCellGrade()`.
4. El motor invoca a `CNEBConversionEngine.convertToCNEB()`, el cual convierte instantáneamente el valor numérico (ej. `17`) al código literal oficial (`A` o `AD`).
5. El motor persiste el cambio en `PostgresRepository` mediante una transacción ACID, actualizando el promedio en cascada.
6. `AuditLoggerService` guarda el diferencial del cambio en la bitácora inmutable.
7. Se retorna al cliente la respuesta `{ success: true, cneb: 'AD', nuevoPromedio: 17.5 }` en menos de 200ms.

### Flujo 2: Kiosco de Portería Offline-First con Sincronización Diferida
1. El vigilante escanea el carné QR de un estudiante en la entrada del colegio.
2. Si no hay internet, el Kiosco almacena la marcación localmente en `Hive / IndexedDB`.
3. Al restablecerse la conectividad, el cliente emite `POST /api/v1/attendance/kiosk/batch-sync`.
4. `AttendanceController` pasa el lote a `KioskSyncWorker`.
5. El worker analiza cada `idempotency_key` contra `PostgresRepository` para descartar duplicados y persiste las asistencias válidas con su timestamp real de ingreso.
6. `KioskSyncWorker` notifica a `WebSocketBroadcastGateway`, el cual emite un evento `ATTENDANCE_RECORDED` hacia los dashboards directivos en tiempo real.

### Flujo 3: Emisión de Boleta Oficial y Verificación Criptográfica QR
1. Secretaría solicita la boleta oficial de fin de periodo para un estudiante.
2. `OfficialReportController` invoca a `CryptoDocumentSigner.generateSignedReportPdf()`.
3. El componente extrae las notas definitivas desde `PostgresRepository`, compone la cadena canónica y calcula el digest criptográfico `SHA-256`.
4. El hash se almacena en la tabla `documentos_verificacion` y se incrusta en el código QR del documento vectorial generado por `PdfKitReportRenderer`.
5. Cualquier usuario externo escanea el QR con su teléfono y `OfficialReportController.verifyPublicDocument(docId, hash)` certifica de forma pública la validez e inmutabilidad del documento sin requerir login.

---

## 5. ESPECIFICACIÓN TEXTUAL PARA EL DIAGRAMA GRÁFICO (C4 NIVEL 3)

Para la diagramación gráfica:
1. **Límites Visuales:**
   * Dibujar el marco contenedor `Contenedor C-04: API Gateway & Application Server`.
2. **Capas Verticales:**
   * **Capa Superior:** Los 13 Controladores API (`CMP-01` a `CMP-13`) agrupados en un submarco `Controladores y Adaptadores de Entrada`.
   * **Capa Intermedia:** Los 12 Servicios de Negocio (`SRV-01` a `SRV-12`) agrupados en el submarco `Servicios de Dominio y Casos de Uso`.
   * **Capa Inferior:** Los 4 Adaptadores de Infraestructura (`INF-01` a `INF-04`) agrupados en el submarco `Adaptadores de Infraestructura y Repositorios`.
3. **Flechas y Conexiones:**
   * Flechas dirigidas estrictamente hacia abajo (los controladores invocan a los servicios, y los servicios consumen la infraestructura), respetando el principio de inversión de dependencias de Clean Architecture.
4. **Código de Colores:**
   * **Controladores API:** Verde Botella Suave (`#2E7D32`).
   * **Servicios de Negocio:** Azul Marino Técnico (`#1565C0`).
   * **Infraestructura y Persistencia:** Púrpura Oscuro (`#4A148C`).
