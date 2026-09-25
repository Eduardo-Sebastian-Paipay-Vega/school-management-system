# MODELO C4 — NIVEL 1: DIAGRAMA DE CONTEXTO DEL SISTEMA (SYSTEM CONTEXT)

### Sistema de Gestión Escolar e Información Institucional
**Institución Beneficiaria:** Planteles de Aplicación "Guamán Poma de Ayala" — UNSCH (Ayacucho, Perú)  
**Marco Académico:** Servicio Social Universitario IS-480 (Semestre 2026-II) — EPIS UNSCH  
**Estándar de Modelado:** Modelo C4 (Simon Brown) — Nivel 1: Contexto  

---

## 1. PROPÓSITO DEL NIVEL 1

El **Diagrama de Contexto del Sistema (System Context)** establece la vista panorámica del ecosistema de software a nivel macro (*zoom out* de 10,000 metros). Su objetivo es ilustrar **quiénes son los actores humanos (usuarios)**, cuál es el **sistema de software central** a construir y con qué **sistemas externos y entidades del entorno** se comunica, definiendo con exactitud las fronteras del producto y los flujos de información bidireccionales.

---

## 2. ELEMENTOS DEL MODELO DE CONTEXTO

### 2.1 El Sistema Central (Software System Boundary)

* **Identificador:** `SYS-GP`
* **Nombre Oficial:** **Sistema de Gestión Escolar "Guamán Poma de Ayala" (UNSCH)**
* **Descripción:** Plataforma integral web y desktop modular para la administración escolar, control de asistencia multiactor (con Kiosco Offline-First y carnés QR), registro ágil de calificaciones en tiempo real ("Modo Excel"), mapas de calor diagnósticos con navegación Drill-Down, Ficha Escolar 360°, emisión de boletas oficiales con verificación criptográfica SHA-256/QR, panel de impacto SSU IS-480 y portal web institucional de difusión digital.
* **Frontera:** El sistema opera bajo un entorno de despliegue controlado, con aislamiento lógico multi-tenant (`tenant_id`) preparado para el plantel escolar.

---

### 2.2 Catálogo de Personas / Actores (Users)

| ID Actor | Nombre del Actor / Rol | Tipo | Descripción y Responsabilidad en el Contexto |
|---|---|---|---|
| **ACT-01** | **Administrador de TI / Equipo SSU** | Persona (Interno) | Gestiona cuentas institucionales, asigna roles RBAC, parametriza años lectivos, supervisa la bitácora de auditoría inmutable (Ley N.° 29733) y asegura la continuidad operativa. |
| **ACT-02** | **Dirección General / Coordinación** | Persona (Interno) | Monitorea indicadores globales, analiza mapas de calor con navegación Drill-Down, supervisa alertas de ausentismo y deserción, y aprueba actas y cierres de periodo. |
| **ACT-03** | **Docentes Titulares (Nombrados)** | Persona (Interno) | Registran asistencia diaria en aula, califican en planilla rápida ("Modo Excel" con auto-guardado de 400ms), usan el asistente de conclusiones descriptivas CNEB y generan consolidados. |
| **ACT-04** | **Docentes Contratados** | Persona (Interno) | Registran y marcan el cumplimiento de sus horas lectivas contractuales, gestionan reprogramaciones compensatorias y registran calificaciones asignadas. |
| **ACT-05** | **Practicantes de Educación (UNSCH)** | Persona (Interno) | Estudiantes universitarios de Educación que marcan su jornada de prácticas, consultan sus horas acumuladas validadas por su tutor y emiten su ficha de conformidad para la UNSCH. |
| **ACT-06** | **Estudiantes** | Persona (Interno) | Alumnos de los niveles Primaria y Secundaria que consultan su récord de asistencia, calificaciones en vivo, Ficha 360° y comunicados del portal escolar. |
| **ACT-07** | **Personal de Portería / Vigilancia ("Wachiman")** | Persona (Interno) | Operador del Kiosco de Asistencia física en la puerta del colegio; escanea carnés escolares QR/Barras en milisegundos con soporte Offline-First ante caídas de internet. |
| **ACT-08** | **Secretaría Académica** | Persona (Interno) | Administra matrículas, asigna estudiantes a secciones, emite masivamente carnés escolares en PDF y expide boletas de notas oficiales con código QR. |
| **ACT-09** | **Público General / Terceros Verificadores** | Persona (Externo) | Padres, empleadores, universidades o entidades reguladoras que escanean el código QR impreso en una boleta oficial para constatar su autenticidad sin requerir inicio de sesión. |

---

### 2.3 Sistemas Externos y Entidades del Entorno (External Systems)

| ID Sistema | Nombre del Sistema Externo | Tipo | Descripción de la Interacción |
|---|---|---|---|
| **EXT-01** | **Servidor de Correo SMTP Institucional** | Sistema de Software Externo | Servicio de mensajería (servidor de correo UNSCH o SMTP relay) empleado para el envío asíncrono de enlaces de restablecimiento de contraseñas y alertas críticas directivas. |
| **EXT-02** | **Comisión y Tutoría SSU — EPIS UNSCH** | Entidad / Stakeholder Académico | Destinatario institucional que recibe y audita los reportes e indicadores del **Tablero de Impacto Social del SSU (IS-480)** para la acreditación académica de los ejecutores. |
| **EXT-03** | **Dispositivos Periféricos de Entrada / Salida** | Hardware Externo | Hardware físico de oficina conectado al cliente: lectores ópticos de código de barras/QR (USB/Bluetooth), cámaras web estándar e impresoras láser para carnés y boletas. |
| **EXT-04** | **Navegadores Web Estándar (Clientes)** | Entorno de Ejecución Externo | Google Chrome, Microsoft Edge, Mozilla Firefox y Safari ejecutándose en PCs de escritorio, laptops o dispositivos móviles donde se renderiza la aplicación web (PWA). |

---

## 3. MATRIZ DETALLADA DE CONEXIONES E INTERACCIONES (NIVEL 1)

Esta matriz describe cada enlace del diagrama de contexto, detallando el flujo de información, el protocolo y la justificación operativa:

| Origen | Destino | Etiqueta / Verbo de la Relación | Protocolo / Canal | Datos que Fluyen (Payload / Información) | Frecuencia / Naturaleza |
|---|---|---|:---:|---|---|
| **ACT-01** (Admin TI) | **SYS-GP** | Configura el sistema, gestiona usuarios y audita eventos | HTTPS (TLS 1.3) | Credenciales, datos de usuarios, sedes, periodos y consulta de logs de auditoría inmutables. | Periódica / Alta prioridad |
| **ACT-02** (Directivos) | **SYS-GP** | Supervisa indicadores, mapas térmicos y alertas | HTTPS (TLS 1.3) | Solicitud de vistas analíticas, navegación drill-down, filtros de rendimiento y cierre de actas. | Diaria / Operativa |
| **ACT-03** (Docente Titular) | **SYS-GP** | Registra asistencia y notas en "Modo Excel" | HTTPS / WSS | Calificaciones vigesimales y CNEB, conclusiones descriptivas, pulsaciones de teclas y marcas de asistencia. | Continua en horario escolar |
| **ACT-04** (Docente Contratado) | **SYS-GP** | Marca horas lectivas y registra notas | HTTPS (TLS 1.3) | Marcación de inicio/fin de clase, justificaciones, reprogramaciones y notas. | Diaria según carga lectiva |
| **ACT-05** (Practicante) | **SYS-GP** | Registra permanencia y genera ficha de prácticas | HTTPS (TLS 1.3) | Marcaciones horarias de entrada/salida, solicitud de consolidado de horas acumuladas para EPIS. | Diaria en jornada |
| **ACT-06** (Estudiante) | **SYS-GP** | Consulta calificaciones, récord de asistencia y Ficha 360° | HTTPS (TLS 1.3) | Credenciales de estudiante (DNI), visualización de boleta digital y avisos institucionales. | Frecuente / Consulta |
| **ACT-07** (Portería) | **SYS-GP** | Escanea carnés escolares en Kiosco Offline-First | Local / HTTPS | Lectura de cadena de carné (DNI/código QR), hora de marcación local; sincronización en lote. | Masiva matutina y vespertina |
| **ACT-08** (Secretaría) | **SYS-GP** | Matricula alumnos, genera carnés QR y boletas PDF | HTTPS (TLS 1.3) | Fichas de matrícula, generación de carnés vectoriales, actas oficiales y cuadros de mérito. | Diaria / Administrativa |
| **ACT-09** (Público/Verificador) | **SYS-GP** | Escanea código QR para validar autenticidad de boleta | HTTPS (Público) | Identificador de documento y hash SHA-256; recibe pantalla oficial con estado de validez institucional. | Ocasional / Pública |
| **SYS-GP** | **EXT-01** (Servidor SMTP) | Envía notificaciones de recuperación de credenciales | SMTP / SMTPS (Puerto 587/465) | Correo emisor, destinatario institucional, token criptográfico temporal de recuperación y plantilla HTML. | Por demanda / Asíncrono |
| **SYS-GP** | **EXT-02** (Tutor SSU EPIS) | Exporta informe de impacto y cumplimiento de metas | PDF / Excel vía HTTPS | Reporte ejecutivo con métricas de cobertura escolar, horas SSU acreditadas y consolidado de beneficiarios. | Mensual y fin de semestre |
| **EXT-03** (Hardware Escáner) | **SYS-GP** | Envía cadena decodificada como pulsaciones de teclado | Emulación HID USB / Serial | String alfanumérico decodificado del código QR o de barras del carné escolar del estudiante. | Tiempo real en portería (< 200ms) |

---

## 4. ESPECIFICACIÓN TEXTUAL PARA EL DIAGRAMA GRÁFICO (C4 NIVEL 1)

Para plasmar este nivel en herramientas gráficas (Mermaid, PlantUML o Structurizr), se deben aplicar las siguientes directivas visuales:

1. **Límites Visuales:**
   * Dibujar un recuadro contenedor central rotulado: `[Sistema de Software] Sistema de Gestión Escolar "Guamán Poma de Ayala" (UNSCH)`.
2. **Posicionamiento de Actores:**
   * **Parte Superior:** Administrador TI (`ACT-01`), Dirección y Coordinación (`ACT-02`), Secretaría (`ACT-08`).
   * **Costado Izquierdo:** Docentes Nombrados (`ACT-03`), Docentes Contratados (`ACT-04`), Practicantes (`ACT-05`).
   * **Costado Derecho:** Personal de Portería / "Wachiman" (`ACT-07`), Estudiantes (`ACT-06`).
   * **Parte Inferior:** Público General / Terceros Verificadores (`ACT-09`).
3. **Posicionamiento de Sistemas Externos:**
   * **Extremo Superior Derecho:** Servidor de Correo SMTP (`EXT-01`).
   * **Extremo Inferior Derecho:** Comisión de SSU EPIS-UNSCH (`EXT-02`).
   * **Extremo Izquierdo:** Dispositivos Periféricos / Lector de Carnés (`EXT-03`).
4. **Convención de Colores Recomendada:**
   * **Personas Internas:** Azul Oscuro Institucional (`#0B2F64`) con texto blanco.
   * **Personas Externas:** Gris Neutro (`#546E7A`) con texto blanco.
   * **Sistema Central:** Verde Botella Institucional (`#1B4D3E`) destacado con borde grueso.
   * **Sistemas Externos:** Gris Pizarra (`#37474F`) con borde punteado.
