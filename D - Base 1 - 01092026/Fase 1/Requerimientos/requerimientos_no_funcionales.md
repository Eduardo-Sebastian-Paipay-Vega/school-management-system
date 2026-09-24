# ESPECIFICACIÓN PRELIMINAR DE REQUERIMIENTOS NO FUNCIONALES (RNF)

## TÍTULO DEL PROYECTO
**DESARROLLO E IMPLEMENTACIÓN DE UNA PLATAFORMA WEB PARA LA GESTIÓN ACADÉMICA E INFORMACIÓN INSTITUCIONAL EN LOS PLANTELES DE APLICACIÓN DE LA UNSCH**

- **Institución Beneficiaria:** Planteles de Aplicación "Guamán Poma de Ayala" – UNSCH (Ayacucho, Perú)
- **Marco Institucional:** Servicio Social Universitario (IS-480) – Escuela Profesional de Ingeniería de Sistemas (EPIS-UNSCH)
- **Fase del Proyecto:** Fase I – Diagnóstico y Formulación
- **Naturaleza del Documento:** Especificación de Atributos de Calidad, Restricciones Operativas y Directivas de Ingeniería (Enfoque Institucional, Normativo y de Calidad de Software ISO/IEC 25010)

---

## 1. INTRODUCCIÓN Y MARCO METODOLÓGICO

El presente documento consolida la especificación formal y exhaustiva de los **Requerimientos No Funcionales (RNF)** para la plataforma de gestión escolar e información institucional de los Planteles de Aplicación "Guamán Poma de Ayala". Mientras que los Requerimientos Funcionales (`requerimientos_funcionales.md`) determinan *qué* funciones ejecuta el software para resolver los procesos pedagógicos y administrativos, los Requerimientos No Funcionales establecen *bajo qué condiciones de calidad, rendimiento, seguridad, fiabilidad, usabilidad y mantenibilidad* debe operar la solución tecnológica.

Esta especificación ha sido elaborada a partir del análisis riguroso y la síntesis cruzada de los instrumentos fundacionales del diagnóstico institucional:
1. **Delimitaciones del Proyecto (`deliminatacions.md`):** Garantiza la viabilidad operativa del piloto en los planteles de aplicación, preservando la arquitectura multi-tenant (`tenant_id`) para futura escalabilidad y consagrando las capacidades de innovación de alto impacto: Kiosco Offline-First de portería, carné escolar QR, planilla rápida por teclado ("Modo Excel"), asistente taxonómico CNEB, autoguardado inteligente en segundo plano, mapas de calor multidimensionales con drill-down, Ficha 360° del alumno y verificación documental criptográfica SHA-256.
2. **Limitaciones del Proyecto (`limitaciones.md`):** Reconoce las fronteras reales del entorno escolar: infraestructura de red vulnerable con cortes intermitentes de internet en Ayacucho, presupuesto autofinanciado acotado (S/ 1,000.00), servidor VPS en la nube con recursos acotados de hardware, prohibición de almacenar datos biométricos o sensibles de menores sin estricto amparo de la Ley N.° 29733, exclusión de módulos financieros o nóminas y horizonte temporal estricto de 16 semanas académicas.
3. **Metadatos Institucionales (`metadatos.md`):** Incorpora los indicadores clave de desempeño (KPIs) definidos para el proyecto: latencia de respuesta general menor a 2 segundos, tasa de disponibilidad (uptime) del 99.5% durante horario escolar lectivo (lunes a viernes de 07:00 a 19:00 hrs), meta de adopción efectiva superior al 80% del personal y reducción de tiempos de tramitación administrativa en más del 40%.
4. **Matriz Integral de Stakeholders (`stakeholders.md`):** Responde a las capacidades, hábitos y restricciones de los 12 actores del ecosistema: personal de portería/vigilancia con necesidad de interfaces instantáneas sin fricción, docentes con marcada brecha digital requiriendo curvas de aprendizaje menores a 30 minutos, secretaría con necesidad de descargas masivas de documentos inalterables, y la coordinación de SSU de la EPIS-UNSCH que exige trazabilidad de horas y cumplimiento de hitos.
5. **Estándar Internacional ISO/IEC 25010:** Adopta el modelo canónico de calidad de sistemas y software (System and Software Quality Requirements and Evaluation - SQuaRE), agrupando los atributos de calidad en 6 dimensiones primarias y 26 subcaracterísticas verificables.

---

## 2. MATRIZ RESUMEN DE REQUERIMIENTOS NO FUNCIONALES (ISO/IEC 25010)

| Código | Denominación del Requerimiento No Funcional | Dimensión ISO 25010 | Actores Impactados | Módulos Relacionados | Prioridad | Métrica Cuantificable / Criterio de Aceptación |
|:---:|---|---|---|---|:---:|---|
| **RNF-DES-01** | Latencia y Tiempo de Respuesta UI | Eficiencia de Desempeño | Todos los usuarios | M1 al M13 | **Crítica** | Carga de vistas <= 1.5s; interacciones locales y filtrado <= 100ms. |
| **RNF-DES-02** | Persistencia con Debounce en Planilla | Eficiencia de Desempeño | Docentes | M8 (`RF-36`, `RF-45`) | **Alta** | Ventana de debounce de 400ms tras última pulsación antes de enviar petición. |
| **RNF-DES-03** | Decodificación y Feedback en Kiosco | Eficiencia de Desempeño | Vigilancia, Alumnos | M5 (`RF-21`, `RF-25`) | **Crítica** | Lectura QR, validación de hash y confirmación auditiva/visual en <= 300ms. |
| **RNF-DES-04** | Rendimiento de Mapas de Calor | Eficiencia de Desempeño | Directivos, Tutores | M9, M10 (`RF-47` al `RF-51`) | **Alta** | Generación de matrices térmicas con 5,000 registros en <= 2.0s. |
| **RNF-DES-05** | Capacidad y Concurrencia en Horas Pico | Eficiencia de Desempeño | Toda la comunidad | M1, M5, M8 | **Alta** | Soporte estable de hasta 150 sesiones simultáneas sin degradación > 10%. |
| **RNF-DES-06** | Consumo Eficiente de Ancho de Banda | Eficiencia de Desempeño | Docentes, Portería | M5, M8, M13 | **Media** | Payload de vistas comprimido <= 1.2 MB; sincronización por deltas JSON. |
| **RNF-SEG-01** | Autenticación Segura mediante JWT | Seguridad | Todos los usuarios | M1 (`RF-01`, `RF-02`) | **Crítica** | Access Token HMAC-SHA256 (15 min); Refresh Token HttpOnly/Secure (7 días). |
| **RNF-SEG-02** | Control de Acceso RBAC y Multi-Tenant | Seguridad | Administrador, Roles | M1, M2, M3 | **Crítica** | Validación estricta en 100% de rutas; filtrado forzoso por `tenant_id`. |
| **RNF-SEG-03** | Hashing Criptográfico de Contraseñas | Seguridad | Todos los usuarios | M1, M2 (`RF-01`, `RF-05`) | **Crítica** | Algoritmo bcrypt con factor de costo (salt rounds) >= 12; cero texto plano. |
| **RNF-SEG-04** | Protección de Datos (Ley N.° 29733) | Seguridad | Menores, Docentes | M4, M12 (`RF-65` al `RF-68`)| **Crítica** | Cifrado en reposo AES-256 para datos sensibles; bitácora de auditoría inmutable. |
| **RNF-SEG-05** | Verificación Criptográfica QR SHA-256 | Seguridad | Secretaría, Público | M11 (`RF-59`, `RF-60`) | **Alta** | Hash SHA-256 institucional en QR de libretas; validación pública en < 1.0s. |
| **RNF-SEG-06** | Mitigación OWASP Top 10 y HTTPS | Seguridad | Infraestructura | M1 al M13 | **Crítica** | Tráfico forzado TLS 1.3 / HTTPS; sanitización estricta contra SQLi, XSS y CSRF. |
| **RNF-FIA-01** | Alta Disponibilidad del Servicio Escolar | Fiabilidad | Toda la comunidad | M1 al M13 | **Alta** | Uptime >= 99.5% durante jornada lectiva (lunes a viernes 07:00 a 19:00 hrs). |
| **RNF-FIA-02** | Resiliencia Offline-First en Kiosco | Fiabilidad | Vigilancia, Portería | M5 (`RF-21`, `RF-25`) | **Crítica** | Operación desconectada 100% autónoma en buffer IndexedDB con sincronización ráfaga. |
| **RNF-FIA-03** | Integridad Transaccional ACID | Fiabilidad | Secretaría, Docentes | M4, M8 (`RF-16`, `RF-40`) | **Crítica** | Matrícula masiva y consolidación de notas bajo transacciones atómicas; rollback < 500ms. |
| **RNF-FIA-04** | Respaldo Automatizado y Recuperación | Fiabilidad | Administrador TI | Infraestructura | **Alta** | Backups diarios automáticos; RPO <= 24 horas y RTO <= 2 horas ante desastre. |
| **RNF-USA-01** | Diseño Adaptativo Multi-Dispositivo | Usabilidad | Todos los usuarios | M1 al M13 | **Alta** | Layout fluido sin desbordamientos desde 360px (móvil) hasta 1920px (escritorio). |
| **RNF-USA-02** | Ergonomía por Teclado ("Modo Excel") | Usabilidad | Docentes | M8 (`RF-36` al `RF-38`) | **Alta** | Navegación 100% por teclas direccionales, Tab y Enter sin dependencia de mouse. |
| **RNF-USA-03** | Accesibilidad Visual (WCAG 2.1 AA) | Usabilidad | Toda la comunidad | M8, M9, M10 | **Alta** | Contraste de color mínimo 4.5:1; información no condicionada exclusivamente al color. |
| **RNF-USA-04** | Curva de Aprendizaje y Brecha Digital | Usabilidad | Docentes, Portería | M5, M8 | **Alta** | Capacitación efectiva <= 30 minutos; operaciones críticas completadas en <= 3 clics. |
| **RNF-USA-05** | Prevención y Tolerancia a Errores UI | Usabilidad | Docentes, Secretaría | M4, M8 | **Alta** | Cuadros de confirmación modal para acciones destructivas; mensajes claros sin tecnicismos. |
| **RNF-MAN-01** | Arquitectura Modular Feature-First | Mantenibilidad | Desarrolladores | Núcleo de Software | **Crítica** | Código aislado por squad en `lib/features/squad_[X]_[modulo]/`; bajo acoplamiento. |
| **RNF-MAN-02** | Análisis Estático y Cobertura de QA | Mantenibilidad | Desarrolladores | CI/CD | **Crítica** | Cero (0) errores y cero (0) advertencias en `flutter analyze`; pruebas con `flutter test`. |
| **RNF-MAN-03** | Estandarización Documental IEEE 1016 | Mantenibilidad | Desarrolladores, SSU | Documentación | **Alta** | 100% de módulos formalizados con SDD conforme a plantilla canónica y trazabilidad a RFs. |
| **RNF-POR-01** | Portabilidad y Despliegue Nativo | Portabilidad | Toda la comunidad | Multiplataforma | **Alta** | Compilación verificada para Flutter Web (PWA instalable) y Windows Desktop (.exe). |
| **RNF-POR-02** | Compatibilidad con Navegadores Web | Portabilidad | Toda la comunidad | Web | **Alta** | Soporte probado en Chrome >= 100, Edge >= 100, Firefox >= 100 y Safari >= 15. |
| **RNF-POR-03** | Localización Regional y Lingüística | Portabilidad | Toda la comunidad | M1 al M13 | **Alta** | Zona horaria `America/Lima` (UTC-5), moneda Soles (PEN) y formatos de fecha DD/MM/AAAA. |
| **RNF-POR-04** | Conformidad con Normativa CNEB/MINEDU | Portabilidad | Docentes, Dirección | M3, M8, M11 | **Crítica** | Cumplimiento de escalas oficiales cualitativas (AD, A, B, C) y vigesimales (0-20). |

---

## 3. ESPECIFICACIÓN DETALLADA POR DIMENSIÓN ISO/IEC 25010

```
========================================================================================
DIMENSIÓN 1: EFICIENCIA DE DESEMPEÑO (PERFORMANCE EFFICIENCY)
========================================================================================
```

### RNF-DES-01: Latencia y Tiempo de Respuesta de la Interfaz de Usuario
- **Dimensión ISO 25010:** Eficiencia de Desempeño — Comportamiento Temporal.
- **Módulos Asociados:** Transversal a los 13 módulos del sistema.
- **Actores Impactados:** Todos los usuarios autenticados y visitantes del portal web.
- **Prioridad:** Crítica.
- **Descripción Extensa:** Las interacciones del usuario dentro del sistema deben ofrecer una experiencia fluida e inmediata que minimice la fatiga cognitiva y agilice los trámites escolares. En condiciones normales de conexión de red institucional (ancho de banda nominal >= 5 Mbps), cualquier navegación entre vistas o pantallas debe completarse en un tiempo no mayor a 1.5 segundos. Las transacciones y operaciones locales (validación de campos de formularios, ordenamiento en tablas, filtros en memoria y alternancia de pestañas) no deben experimentar ningún retardo perceptible por el ojo humano, ejecutándose en menos de 100 milisegundos.
- **Métrica Cuantificable:**
  - Tiempo de carga y renderizado de pantalla completa (FCP / LCP): `<= 1.5 s` (percentil 95).
  - Tiempo de respuesta a eventos de interfaz locales: `<= 100 ms`.
- **Condiciones Operativas del Plantel:** Aplicable tanto a computadoras de escritorio de secretaría y sala de cómputo como a laptops docentes conectadas por Wi-Fi institucional o redes móviles 4G.
- **Método de Validación:** Medición de telemetría en DevTools de Flutter / Chrome Lighthouse y pruebas de carga simulada con latencias de red inducidas de hasta 200ms.

---

### RNF-DES-02: Auto-Guardado Asíncrono con Ventana de Debounce en Planilla de Notas
- **Dimensión ISO 25010:** Eficiencia de Desempeño — Utilización de Recursos / Capacidad.
- **Módulos Asociados:** Módulo 8 (Registro de Calificaciones — `RF-36`, `RF-45`).
- **Actores Impactados:** Docentes Nombrados, Docentes Contratados, Practicantes supervisados.
- **Prioridad:** Alta.
- **Descripción Extensa:** Durante el llenado intensivo de la planilla de calificaciones, los docentes ingresan valores numéricos o literales de forma consecutiva y acelerada. Para evitar saturar el servidor con una petición HTTP por cada carácter o tecla presionada, el sistema debe implementar un temporizador de amortiguamiento asíncrono (*debounce*). Cada vez que el docente modifica una celda, el contador se reinicia; únicamente cuando transcurran 400 milisegundos ininterrumpidos sin nuevas pulsaciones, el sistema empaquetará los cambios pendientes y disparará la sincronización en segundo plano con el servidor. La interfaz no debe bloquearse en ningún momento y debe proveer un indicador visual discreto de estado (*"Guardando..."*, *"Guardado en la nube"*, *"Error de conexión: guardado localmente"*).
- **Métrica Cuantificable:**
  - Ventana de espera del temporizador de debounce: `400 ms ± 20 ms`.
  - Impacto en UI: `0 ms` de congelamiento del hilo principal (*framerate* constante a 60 fps).
- **Condiciones Operativas del Plantel:** Evita que el servidor VPS colapse cuando 30 docentes asienten calificaciones simultáneamente en semanas de cierre bimestral.
- **Método de Validación:** Inspección en DevTools de la frecuencia de solicitudes de red durante tipeo acelerado sostenido (120 caracteres por minuto).

---

### RNF-DES-03: Latencia Ultrarrápida de Decodificación y Registro en Kiosco de Portería
- **Dimensión ISO 25010:** Eficiencia de Desempeño — Comportamiento Temporal.
- **Módulos Asociados:** Módulo 5 (Asistencia Estudiantil — `RF-21`, `RF-25`).
- **Actores Impactados:** Personal de Portería / Vigilancia ("Wachiman"), Estudiantes.
- **Prioridad:** Crítica.
- **Descripción Extensa:** El flujo de ingreso de estudiantes en la puerta principal del colegio concentra más de 800 alumnos en un lapso de 45 minutos (07:15 a 08:00 hrs). El sistema de kiosco debe operar con una velocidad sub-segundo para prevenir la formación de cuellos de botella o aglomeraciones en la vía pública. El tiempo comprendido entre la presentación física del carné escolar con código QR frente al lector óptico o cámara web, su decodificación interna, la comprobación del hash de integridad, el almacenamiento del registro de marcación en el buffer local y la emisión del feedback audiovisual (indicador verde de éxito + tono auditivo distintivo) no debe superar bajo ninguna circunstancia los 300 milisegundos.
- **Métrica Cuantificable:**
  - Latencia punta a punta (escaneo ➔ persistencia local ➔ feedback): `<= 300 ms`.
  - Tasa de rendimiento sostenido: Al menos 25 lecturas exitosas por minuto por terminal de portería.
- **Condiciones Operativas del Plantel:** Terminal de cómputo en caseta de vigilancia con cámara USB estándar (720p) o lector de pistola de códigos 2D.
- **Método de Validación:** Grabación en video de alta velocidad a 60 fps midiendo el diferencial temporal entre la exposición del carné y el destello de confirmación en pantalla.

---

### RNF-DES-04: Capacidad y Rendimiento de Renderizado de Dashboards y Mapas de Calor
- **Dimensión ISO 25010:** Eficiencia de Desempeño — Capacidad / Comportamiento Temporal.
- **Módulos Asociados:** Módulo 9 (`RF-47` al `RF-51`) y Módulo 10 (`RF-52` al `RF-58`).
- **Actores Impactados:** Dirección General, Coordinación Académica, Docentes Tutores.
- **Prioridad:** Alta.
- **Descripción Extensa:** Los mapas de calor institucionales procesan matrices multidimensionales complejas que correlacionan niveles educativos, grados, secciones, áreas curriculares, competencias CNEB y asistencias acumuladas. La agregación matemática de datos y el renderizado vectorial de celdas cromáticas interactivas debe efectuarse de manera eficiente en el cliente. Para un volumen de información de hasta 5,000 registros escolares históricos bimestrales, el sistema debe computar y dibujar la visualización completa en un lapso no superior a 2.0 segundos, permitiendo navegación interactiva por clics (*drill-down*) con transiciones visuales inferiores a 400 milisegundos.
- **Métrica Cuantificable:**
  - Tiempo de procesamiento y renderizado inicial de matriz (hasta 5,000 celdas): `<= 2.0 s`.
  - Tiempo de actualización tras clic de drill-down a nivel inferior: `<= 400 ms`.
- **Condiciones Operativas del Plantel:** Navegador web en computadoras con procesadores de gama media-baja (Intel Core i3 de 4ta generación o equivalente).
- **Método de Validación:** Pruebas de rendimiento con datasets sintéticos de 5,000 evaluaciones bimestrales ejecutadas en Google Chrome con estrangulamiento de CPU (CPU 4x slowdown).

---

### RNF-DES-05: Concurrencia y Capacidad de Carga en Horas Pico Escolares
- **Dimensión ISO 25010:** Eficiencia de Desempeño — Capacidad y Concurrencia.
- **Módulos Asociados:** Módulo 1 (Autenticación), Módulo 5 (Asistencia), Módulo 8 (Notas).
- **Actores Impactados:** Toda la comunidad institucional.
- **Prioridad:** Alta.
- **Descripción Extensa:** El sistema debe soportar los picos estacionales y horarios críticos de uso del colegio sin degradación de servicio ni reinicios de servidor. Específicamente, debe garantizar el servicio concurrente durante dos momentos críticos: (a) el ingreso diario matutino (07:00 a 08:15 hrs) con sincronización intensiva de portería y aulas, y (b) las últimas 72 horas del cierre de cada bimestre escolar, donde hasta 45 docentes registran notas de forma simultánea. La infraestructura debe soportar al menos 150 sesiones activas simultáneas con un incremento en los tiempos de respuesta no mayor al 10% respecto a la línea base.
- **Métrica Cuantificable:**
  - Usuarios simultáneos concurrentes soportados: `>= 150 usuarios activos`.
  - Tasa de error en solicitudes concurrentes bajo carga pico: `< 0.1%`.
- **Condiciones Operativas del Plantel:** Servidor VPS Cloud en el escalón presupuestal financiado por el proyecto (1 a 2 vCPU, 2 a 4 GB RAM).
- **Método de Validación:** Ejecución de pruebas de estrés y carga mediante herramientas de benchmarking (k6 o Apache JMeter) simulando ráfagas de 150 usuarios virtuales.

---

### RNF-DES-06: Optimización de Consumo de Ancho de Banda y Operación en Redes Degradadas
- **Dimensión ISO 25010:** Eficiencia de Desempeño — Utilización de Recursos.
- **Módulos Asociados:** Módulo 5 (Asistencia), Módulo 8 (Notas), Módulo 13 (Portal Institucional).
- **Actores Impactados:** Docentes, Portería, Estudiantes accediendo desde móviles.
- **Prioridad:** Media.
- **Descripción Extensa:** La conectividad en las instituciones educativas públicas de Ayacucho experimenta con frecuencia congestión de banda y fluctuaciones de velocidad. El sistema debe optimizar al máximo la transferencia de datos en red. La carga inicial de los paquetes compilados de Flutter Web debe emplear compresión gzip/brotli para mantenerse por debajo de 1.2 MB. Toda comunicación subsiguiente con el backend debe realizarse mediante cargas útiles ligeras en JSON transmitiendo exclusivamente los datos modificados (*deltas*), evitando la retransmisión de catálogos estáticos que deben quedar cacheados en el navegador del cliente.
- **Métrica Cuantificable:**
  - Peso total transferido en primera carga (*bundle size* comprimido): `<= 1.2 MB`.
  - Peso promedio de peticiones REST de sincronización de notas o asistencia: `<= 15 KB`.
- **Condiciones Operativas del Plantel:** Redes Wi-Fi escolares compartidas y planes de datos móviles 3G/4G del personal docente.
- **Método de Validación:** Auditoría de red en panel Network de Chrome DevTools midiendo bytes transferidos y tiempo de transferencia bajo emulación *Slow 3G*.

---

```
========================================================================================
DIMENSIÓN 2: SEGURIDAD Y PRIVACIDAD DE LA INFORMACIÓN (SECURITY)
========================================================================================
```

### RNF-SEG-01: Autenticación Segura Basada en Tokens JWT con Rotación
- **Dimensión ISO 25010:** Seguridad — Confidencialidad y Autenticidad.
- **Módulos Asociados:** Módulo 1 (Control de Acceso y Sesiones — `RF-01`, `RF-02`).
- **Actores Impactados:** Todos los usuarios autenticados.
- **Prioridad:** Crítica.
- **Descripción Extensa:** El acceso a la plataforma debe blindarse contra ataques de suplantación de identidad, interceptación de tráfico y robo de sesiones (*session hijacking*). El sistema debe implementar autenticación basada en JSON Web Tokens (JWT) mediante un esquema dual:
  1. **Access Token:** Con tiempo de vida corto (estrictamente 15 minutos), firmado criptográficamente con algoritmo HMAC-SHA256 (utilizando una clave secreta institucional de alta entropía) o RSA-256. Debe viajar en la cabecera `Authorization: Bearer <token>`.
  2. **Refresh Token:** Con tiempo de vida de 7 días, almacenado y transmitido obligatoriamente en una cookie HTTP con las directivas de seguridad activas: `HttpOnly` (inaccesible desde scripts JavaScript del navegador para neutralizar ataques XSS), `Secure` (transmitido solo por HTTPS) y `SameSite=Strict` (para mitigar ataques CSRF).
- **Métrica Cuantificable:**
  - Expiración de Access Token: `15 minutos`.
  - Expiración de Refresh Token: `7 días` con revocación inmediata al cerrar sesión.
  - Atributos de Cookie: `HttpOnly = true`, `Secure = true`, `SameSite = Strict`.
- **Condiciones Operativas del Plantel:** Equipos compartidos en salas de docentes y aulas de innovación donde múltiples personas usan el mismo navegador.
- **Método de Validación:** Inspección de almacenamiento en navegador y pruebas automáticas de rechazo de tokens vencidos o adulterados.

---

### RNF-SEG-02: Control de Acceso Basado en Roles (RBAC) y Aislamiento Multi-Tenant
- **Dimensión ISO 25010:** Seguridad — Autorización y No Repudio.
- **Módulos Asociados:** Módulo 1, Módulo 2 y Módulo 3.
- **Actores Impactados:** Administrador TI, Directores, Coordinadores, Docentes, Practicantes, Estudiantes.
- **Prioridad:** Crítica.
- **Descripción Extensa:** Ningún usuario debe tener acceso a información o funciones ajenas a sus atribuciones institucionales formalmente asignadas. El sistema debe aplicar un control de acceso basado en roles (RBAC) estricto y desacoplado:
  - En el **Frontend (Flutter):** Los menús, botones de acción y rutas de navegación deben estar condicionados al rol del usuario, impidiendo la visualización de módulos no autorizados.
  - En el **Backend (API REST):** Cada endpoint debe verificar de manera mandatoria e independiente el rol y permisos asociados en el token JWT antes de procesar cualquier consulta o mutación, retornando un código `403 Forbidden` ante cualquier intento no autorizado.
  - **Aislamiento Multi-Tenant:** Todas las consultas a la base de datos deben inyectar forzosamente el identificador institucional (`tenant_id`) en la cláusula `WHERE`, garantizando el aislamiento lógico absoluto entre instituciones o niveles.
- **Métrica Cuantificable:**
  - Cobertura de verificación de permisos en endpoints protegidos: `100%`.
  - Fugas de datos entre instituciones o roles en pruebas de penetración: `0 incidencias`.
- **Condiciones Operativas del Plantel:** Previene que un estudiante o usuario curioso altere notas manipulando llamadas en el navegador.
- **Método de Validación:** Ejecución de suites de pruebas de seguridad intentando acceder a endpoints administrativos utilizando credenciales de perfil estudiante.

---

### RNF-SEG-03: Hashing Criptográfico Robusto de Contraseñas con Salt Dinámico
- **Dimensión ISO 25010:** Seguridad — Confidencialidad e Integridad.
- **Módulos Asociados:** Módulo 1 y Módulo 2 (`RF-01`, `RF-05`).
- **Actores Impactados:** Toda la comunidad con credenciales de acceso.
- **Prioridad:** Crítica.
- **Descripción Extensa:** Queda estrictamente prohibido el almacenamiento de contraseñas de usuarios en texto claro o mediante algoritmos criptográficamente vulnerables o rotos (tales como MD5, SHA-1 o SHA-256 simple sin sal). Todas las claves de acceso deben ser procesadas mediante una función de derivación de claves resistente a ataques por fuerza bruta y diccionarios con aceleración por GPU. Se debe utilizar el estándar **bcrypt** con un factor de trabajo o costo computacional (*salt rounds*) igual o superior a 12, garantizando la generación de sales aleatorias únicas para cada credencial.
- **Métrica Cuantificable:**
  - Algoritmo de hash: `bcrypt` con `cost factor >= 12` (o alternativamente `Argon2id`).
  - Tiempo de cómputo de verificación de hash: Entre `150 ms` y `350 ms` por intento de login (balance óptimo entre seguridad y experiencia de usuario).
- **Condiciones Operativas del Plantel:** Salvaguarda las credenciales de docentes y directivos ante eventuales volcados no autorizados de la base de datos.
- **Método de Validación:** Inspección directa del esquema de la tabla de usuarios en PostgreSQL verificando la longitud (60 caracteres estándar de bcrypt) y el prefijo `$2b$12$`.

---

### RNF-SEG-04: Cumplimiento de la Ley N.° 29733 (Protección de Datos Personales de Menores)
- **Dimensión ISO 25010:** Seguridad — Confidencialidad y Rendición de Cuentas.
- **Módulos Asociados:** Módulo 4 (Alumnos), Módulo 12 (Auditoría — `RF-65` al `RF-68`).
- **Actores Impactados:** Estudiantes (menores de edad), Padres/Apoderados, Personal institucional.
- **Prioridad:** Crítica.
- **Descripción Extensa:** En estricta concordancia con la Ley N.° 29733 (Ley de Protección de Datos Personales de la República del Perú) y su Reglamento (D.S. 003-2013-JUS), el sistema debe tratar la información de los estudiantes menores de edad como datos de especial tutela y confidencialidad. Específicamente:
  1. **Cifrado en Reposo:** Los campos que revelen la identidad, residencia o condiciones de vulnerabilidad del menor (número de DNI, teléfono de contacto familiar, dirección domiciliaria, diagnósticos de necesidades educativas especiales y observaciones conductuales) deben cifrarse en reposo en la base de datos utilizando el estándar simétrico **AES-256**.
  2. **Trazabilidad de Accesos:** Toda visualización, exportación o modificación de datos sensibles debe registrar un asiento en la bitácora inmutable de auditoría con marca temporal, IP de origen, usuario actuante y motivo de la consulta.
  3. **Principio de Proporcionalidad:** No se recopilarán datos biométricos, financieros o no pertinentes a la relación escolar.
- **Métrica Cuantificable:**
  - Cifrado en campos de datos sensibles: `100% de registros encriptados con AES-256`.
  - Inmutabilidad de bitácora de auditoría: Cero posibilidad de edición o eliminación de registros por parte de usuarios operativos o docentes.
- **Condiciones Operativas del Plantel:** Exigencia legal ineludible impuesta por el MINEDU, la DREA y la Defensoría del Pueblo.
- **Método de Validación:** Auditoría de base de datos verificando ilegibilidad de datos sensibles sin la clave maestra institucional y comprobación de generación de registros en la tabla de auditoría.

---

### RNF-SEG-05: Verificación Criptográfica Documental con Hash SHA-256 en Códigos QR
- **Dimensión ISO 25010:** Seguridad — Autenticidad, Integridad y No Repudio.
- **Módulos Asociados:** Módulo 11 (Emisión de Documentos y Reportes — `RF-59`, `RF-60`, `RF-69`).
- **Actores Impactados:** Secretaría Académica, Dirección, Padres de familia, Terceras entidades.
- **Prioridad:** Alta.
- **Descripción Extensa:** Los documentos oficiales emitidos por el sistema (Boletas de Notas bimestrales, Certificados de Estudios, Constancias de Matrícula y Reportes de SSU IS-480) deben contar con un mecanismo de inviolabilidad que impida su falsificación o adulteración impresa. Cada documento generado en PDF debe incluir un código QR visible que codifique una URL pública hacia el portal web institucional. Dicha URL incorporará un hash criptográfico **SHA-256** generado a partir de la concatenación inmutable de: `código_estudiante + periodo_academico + resumen_calificaciones + timestamp_emision + salt_secreto_institucional`. Al escanear el QR desde cualquier teléfono inteligente, el portal web recalculará el hash y mostrará de inmediato la versión oficial original sin requerir inicio de sesión.
- **Métrica Cuantificable:**
  - Algoritmo de firma digital: `SHA-256` con semilla salina institucional (*salt*).
  - Tiempo de resolución y verificación pública del documento al escanear QR: `<= 1.0 s`.
- **Condiciones Operativas del Plantel:** Permite a directores y apoderados comprobar la autenticidad de una libreta física en cualquier momento con un celular convencional.
- **Método de Validación:** Prueba de alteración intencional de notas en un documento PDF impreso y escaneo del código QR verificando que el portal detecte la inconsistencia o muestre los datos reales inmutables.

---

### RNF-SEG-06: Mitigación de Vulnerabilidades OWASP Top 10 y Cifrado en Tránsito
- **Dimensión ISO 25010:** Seguridad — Integridad y Confidencialidad en Tránsito.
- **Módulos Asociados:** Transversal a toda la infraestructura y servicios.
- **Actores Impactados:** Toda la comunidad usuaria.
- **Prioridad:** Crítica.
- **Descripción Extensa:** La plataforma debe diseñarse e implementarse siguiendo las directivas de seguridad para aplicaciones web establecidas por el proyecto OWASP (Open Web Application Security Project). Se debe garantizar:
  1. **Cifrado en Tránsito:** 100% de las comunicaciones entre el navegador/cliente y el servidor deben transmitirse bajo el protocolo seguro HTTPS con certificados digitales válidos (TLS 1.2 o TLS 1.3), forzando la redirección automática desde HTTP plano.
  2. **Inyección SQL (SQLi):** Todas las consultas a PostgreSQL deben utilizar consultas preparadas y parametrizadas (*Prepared Statements* / ORM), quedando terminantemente prohibida la concatenación de texto en queries.
  3. **Cross-Site Scripting (XSS):** Todo dato renderizado en la interfaz debe pasar por mecanismos de sanitización y escape de entidades HTML.
  4. **Protección de Cabeceras HTTP:** Implementación de encabezados seguros (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`).
- **Métrica Cuantificable:**
  - Vulnerabilidades críticas o altas en escaneo OWASP ZAP: `0 vulnerabilidades`.
  - Calificación SSL en SSL Labs: `Grado A o superior`.
- **Condiciones Operativas del Plantel:** Protección integral ante accesos indebidos desde internet hacia el servidor VPS institucional.
- **Método de Validación:** Ejecución de escaneo automatizado con herramientas de seguridad estática y dinámica (OWASP ZAP / Snyk / SonarQube).

---

```
========================================================================================
DIMENSIÓN 3: FIABILIDAD, DISPONIBILIDAD Y RESILIENCIA (RELIABILITY)
========================================================================================
```

### RNF-FIA-01: Alta Disponibilidad Operativa del Servicio Escolar (SLA 99.5%)
- **Dimensión ISO 25010:** Fiabilidad — Disponibilidad y Madurez.
- **Módulos Asociados:** Transversal a los 13 módulos.
- **Actores Impactados:** Toda la comunidad educativa.
- **Prioridad:** Alta.
- **Descripción Extensa:** El sistema de gestión escolar es una herramienta de uso continuo durante la jornada formativa. La plataforma debe ofrecer una tasa de disponibilidad efectiva (*uptime*) igual o superior al 99.5% durante el horario escolar oficial (lunes a viernes de 07:00 a 19:00 horas). Los periodos de mantenimiento preventivo, actualización de versiones o aplicación de parches deben programarse estrictamente fuera del horario escolar (fines de semana o madrugadas) y comunicarse al personal con al menos 48 horas de anticipación.
- **Métrica Cuantificable:**
  - Tasa de disponibilidad en horario lectivo: `>= 99.5%` (máximo 1.2 horas de indisponibilidad acumulada por mes).
  - Tiempo medio entre fallas (MTBF): `>= 30 días continuos`.
- **Condiciones Operativas del Plantel:** Previene la parálisis del ingreso en portería, el dictado de clases y los trámites de secretaría durante la jornada laboral.
- **Método de Validación:** Monitoreo continuo del uptime mediante sondas de disponibilidad externas (UptimeRobot o Health Checks HTTP cada 60 segundos).

---

### RNF-FIA-02: Resiliencia Operativa y Persistencia Local Offline-First en Kiosco
- **Dimensión ISO 25010:** Fiabilidad — Tolerancia a Fallos y Capacidad de Recuperación.
- **Módulos Asociados:** Módulo 5 (Asistencia Estudiantil — `RF-21`, `RF-25`).
- **Actores Impactados:** Personal de Portería / Vigilancia ("Wachiman"), Estudiantes.
- **Prioridad:** Crítica.
- **Descripción Extensa:** Debido a los cortes recurrentes de energía o conectividad a internet en la ciudad de Ayacucho, la toma de asistencia en portería no puede depender exclusivamente del enlace a la nube. El componente de Kiosco debe operar bajo la filosofía **Offline-First**:
  1. **Almacenamiento Local:** Si se interrumpe la conexión de red, la aplicación continuará funcionando con autonomía absoluta, validando los carnés contra el padrón escolar previamente cacheado en el almacenamiento local del cliente (IndexedDB en navegador web o base local Hive en ejecutable Windows).
  2. **Buffer de Contingencia:** Las marcaciones registradas se encolarán de forma persistente en una cola local protegida contra cierres accidentales de la ventana.
  3. **Sincronización en Ráfagas:** Al reanudarse la conectividad, el sistema detectará el evento de red y sincronizará automáticamente el buffer con el servidor central en segundo plano (*Background Sync*), resolviendo marcas con marca de tiempo del cliente y garantizando **cero pérdida de asistencias**.
- **Métrica Cuantificable:**
  - Capacidad de almacenamiento en buffer local: Hasta `5,000 registros de marcación` sin conexión.
  - Tasa de pérdida de marcaciones tras corte imprevisto de red: `0.0%`.
  - Tiempo de inicio de sincronización automática al volver la red: `<= 5 segundos`.
- **Condiciones Operativas del Plantel:** Escenario real de caída de fibra óptica de la UNSCH o cortes zonales de servicio eléctrico durante la mañana.
- **Método de Validación:** Desconexión física deliberada del cable de red o Wi-Fi durante el registro de 100 alumnos, reconexión posterior y verificación de consistencia exacta de registros en la base de datos central PostgreSQL.

---

### RNF-FIA-03: Consistencia e Integridad Transaccional ACID en Operaciones Masivas
- **Dimensión ISO 25010:** Fiabilidad — Integridad y Recuperabilidad.
- **Módulos Asociados:** Módulo 4 (Matrícula Escolar) y Módulo 8 (Cierre de Calificaciones).
- **Actores Impactados:** Secretaría Académica, Coordinación, Docentes.
- **Prioridad:** Crítica.
- **Descripción Extensa:** Los procesos escolares que involucran la creación o actualización coordinada de múltiples entidades de base de datos (por ejemplo: matrícula masiva de una sección completa con 35 alumnos, asignación de carga lectiva o cierre y consolidación bimestral de notas) deben ejecutarse bajo transacciones atómicas que cumplan rigurosamente las propiedades **ACID** (Atomicidad, Consistencia, Aislamiento y Durabilidad). Si ocurre un fallo eléctrico, pérdida de red o excepción inesperada en cualquiera de las operaciones intermedias, el sistema debe revertir automáticamente el 100% de los cambios parciales (*ROLLBACK*) en menos de 500 milisegundos, evitando dejar la base de datos en estados inconsistentes, huérfanos o corruptos.
- **Métrica Cuantificable:**
  - Nivel de aislamiento en PostgreSQL: `READ COMMITTED` o `REPEATABLE READ`.
  - Tiempo de reversión de transacción fallida (*rollback*): `<= 500 ms`.
  - Registros inconsistentes o corruptos en base de datos: `0 tolerados`.
- **Condiciones Operativas del Plantel:** Garantiza que si falla la matrícula del alumno número 30 de una nómina, no se registre una nómina incompleta o una asignación de cupos desfasada.
- **Método de Validación:** Inyección de fallas controladas (desconexión forzada del socket de base de datos en mitad de una transacción masiva) y comprobación de la integridad del estado.

---

### RNF-FIA-04: Respaldo Automatizado y Estrategia de Recuperación ante Desastres (RTO / RPO)
- **Dimensión ISO 25010:** Fiabilidad — Recuperabilidad y Disponibilidad.
- **Módulos Asociados:** Transversal a toda la infraestructura de datos.
- **Actores Impactados:** Administrador TI, Dirección General.
- **Prioridad:** Alta.
- **Descripción Extensa:** Para prevenir la pérdida irreparable del historial académico escolar por catástrofes físicas, fallos de disco o incidentes de ciberseguridad, el sistema debe implementar una política estricta de copias de seguridad automatizadas. Diariamente, a las 02:00 horas, el servidor debe generar un volcado completo de la base de datos PostgreSQL, comprimirlo, cifrarlo con AES-256 y replicarlo hacia una ubicación de almacenamiento geográficamente separada (Cloud Object Storage o repositorio institucional UNSCH). Se establecen las siguientes metas de continuidad operativa:
  - **RPO (Recovery Point Objective):** Máximo 24 horas de desfase de datos (pérdida máxima acotada a la jornada en curso).
  - **RTO (Recovery Time Objective):** Tiempo máximo de restitución del servicio en un nuevo entorno virtual menor a 2 horas.
- **Métrica Cuantificable:**
  - Frecuencia de respaldo automático: `Diaria (cada 24 horas a las 02:00 hrs)`.
  - RPO: `<= 24 horas`.
  - RTO: `<= 2 horas`.
  - Retención de respaldos: 30 días para respaldos diarios y 12 meses para respaldos mensuales de fin de bimestre.
- **Condiciones Operativas del Plantel:** Preservación del patrimonio académico histórico de la institución educativa.
- **Método de Validación:** Simulación semestral de recuperación ante desastres (*DR drill*), restaurando un respaldo en un servidor vacío y midiendo el tiempo de recuperación efectivo.

---

```
========================================================================================
DIMENSIÓN 4: USABILIDAD, ERGONOMÍA Y ACCESIBILIDAD (USABILITY)
========================================================================================
```

### RNF-USA-01: Diseño Adaptativo y Fluido Multi-Dispositivo (Responsive Design)
- **Dimensión ISO 25010:** Usabilidad — Operabilidad y Estética de Interfaz.
- **Módulos Asociados:** Transversal a los 13 módulos del sistema.
- **Actores Impactados:** Toda la comunidad usuaria.
- **Prioridad:** Alta.
- **Descripción Extensa:** Los usuarios de la plataforma acceden desde una amplia diversidad de dispositivos tecnológicos: computadoras de escritorio en oficinas, laptops personales de docentes, tablets en aulas y teléfonos inteligentes de practicantes o directivos en tránsito. La interfaz desarrollada en Flutter debe implementar una arquitectura de maquetación adaptativa fluida (*Fluid Responsive Layout*) que reorganice dinámicamente sus componentes según el ancho de pantalla disponible:
  - Móvil vertical (`360px` a `599px`): Menú tipo drawer hamburguesa, navegación inferior, tablas compactadas en tarjetas verticales.
  - Tablet (`600px` a `1023px`): Barra lateral colapsable, formularios en doble columna.
  - Escritorio (`1024px` a `1920px+`): Sidebar extendido permanente, visualización tabular completa en modo hoja de cálculo.
  Queda terminantemente prohibida la aparición de errores visuales de desbordamiento de pantalla (como las bandas de error amarillo con rayas negras características de Flutter — *Overflows*).
- **Métrica Cuantificable:**
  - Rango de resoluciones soportado sin degradación: `360 px` a `1920 px`.
  - Errores de desbordamiento visual de widgets (*RenderFlex overflow*): `0 incidencias`.
- **Condiciones Operativas del Plantel:** Asegura que un docente pueda registrar asistencia desde su celular en el patio o desde la laptop en la sala de profesores sin pérdida funcional.
- **Método de Validación:** Pruebas de renderizado responsive automatizadas con emulación de dispositivos en Flutter Test y pruebas manuales en 5 factores de forma físicos.

---

### RNF-USA-02: Ergonomía de Captura de Datos por Teclado ("Modo Excel")
- **Dimensión ISO 25010:** Usabilidad — Facilidad de Aprendizaje y Eficiencia Operativa.
- **Módulos Asociados:** Módulo 8 (Registro de Calificaciones — `RF-36` al `RF-38`).
- **Actores Impactados:** Docentes Nombrados, Docentes Contratados.
- **Prioridad:** Alta.
- **Descripción Extensa:** Uno de los principales motivos de resistencia al cambio en sistemas de gestión escolar es la lentitud ocasionada por tener que alternar constantemente entre el teclado y el mouse para asentar notas. La planilla de calificaciones debe operar con la agilidad y ergonomía de una hoja de cálculo tradicional tipo Microsoft Excel:
  1. **Navegación 100% por Teclado:** El usuario debe poder desplazarse fluidamente entre celdas contiguas mediante las teclas de dirección (`Flecha Arriba`, `Flecha Abajo`, `Flecha Izquierda`, `Flecha Derecha`).
  2. **Flujo de Asentamiento:** Al pulsar la tecla `Enter`, el sistema debe confirmar el valor ingresado y desplazar automáticamente el foco a la celda del estudiante de la fila inferior. Al pulsar `Tab`, debe avanzar a la siguiente competencia de la misma fila.
  3. **Pegado Matricial Masivo:** El docente debe poder copiar un rango de celdas desde su archivo Excel personal y pegarlo mediante `Ctrl+V` directamente sobre la planilla web, distribuyendo automáticamente las notas en la cuadrícula en menos de 1 segundo.
- **Métrica Cuantificable:**
  - Tasa de operaciones realizables sin tocar el mouse en la planilla de notas: `100%`.
  - Tiempo de procesamiento y asignación tras pegado masivo de 35 filas: `<= 800 ms`.
- **Condiciones Operativas del Plantel:** Permite a los docentes registrar las calificaciones de toda una sección en menos de 3 minutos, reduciendo drásticamente la carga de trabajo.
- **Método de Validación:** Prueba de usabilidad cronometrada comparando el llenado tradicional con mouse versus el flujo por teclado "Modo Excel".

---

### RNF-USA-03: Accesibilidad Visual y Contraste Semántico (Estándar WCAG 2.1 AA)
- **Dimensión ISO 25010:** Usabilidad — Accesibilidad.
- **Módulos Asociados:** Transversal (especial énfasis en Módulos 8, 9 y 10).
- **Actores Impactados:** Toda la comunidad, especialmente usuarios con agudeza visual reducida o daltonismo.
- **Prioridad:** Alta.
- **Descripción Extensa:** La interfaz de usuario debe ser accesible e inclusiva, cumpliendo con las pautas de accesibilidad para el contenido web **WCAG 2.1 en su nivel de conformidad AA**. La paleta de colores institucional (Verde Botella Institucional `#1B4D3E`, Azul UNSCH `#002855`, Gris Neutro) debe garantizar una relación de contraste mínima de 4.5:1 para texto normal y de 3.0:1 para textos grandes o componentes interactivos frente al fondo. Asimismo, ningún estado crítico del sistema (nivel de logro CNEB: AD, A, B, C; estado de asistencia: Presente, Tardanza, Falta; o alertas de deserción) debe codificarse **únicamente mediante el color**; cada elemento cromático debe complementarse de forma obligatoria con un icono representativo, un texto explícito o un patrón visual distintivo.
- **Métrica Cuantificable:**
  - Ratio de contraste de texto normal: `>= 4.5:1`.
  - Ratio de contraste de componentes gráficos e interactivos: `>= 3.0:1`.
  - Dependencia exclusiva del color para comunicar estados: `0% (siempre acompañado de icono/etiqueta)`.
- **Condiciones Operativas del Plantel:** Facilita la lectura a docentes adultos mayores y garantiza la distinción de estados a personas con deuteranopía o protanopía.
- **Método de Validación:** Evaluación automática con herramientas de contraste en Chrome DevTools y simulación de filtros daltónicos en la interfaz.

---

### RNF-USA-04: Facilidad de Aprendizaje y Mitigación de la Brecha Digital
- **Dimensión ISO 25010:** Usabilidad — Reconocibilidad y Facilidad de Aprendizaje.
- **Módulos Asociados:** Módulo 5 (Asistencia), Módulo 8 (Notas).
- **Actores Impactados:** Docentes Nombrados de avanzada edad, Personal de Vigilancia ("Wachiman").
- **Prioridad:** Alta.
- **Descripción Extensa:** El diagnóstico situacional identificó una marcada heterogeneidad en las competencias digitales de los usuarios, existiendo docentes veteranos y personal de vigilancia con dificultades para interactuar con sistemas informáticos complejos. El diseño de la plataforma debe priorizar interfaces limpias, desprovistas de jerga técnica y con affordances evidentes:
  - Los términos en pantalla deben reflejar el vocabulario escolar cotidiano (*"Asistencia"*, *"Notas"*, *"Sección"*, *"Justificación"* en lugar de términos abstractos como *"CRUD"*, *"Query"*, *"Payload"*).
  - La interfaz del vigilante de portería debe requerir únicamente mirar la pantalla tras apuntar el carné QR, sin menús intermedios ni configuraciones complejas.
  - El tiempo promedio requerido para que un docente titular aprenda a registrar su asistencia y cargar notas de su área curricular tras recibir una inducción básica no debe exceder los 30 minutos.
- **Métrica Cuantificable:**
  - Tiempo de inducción para uso autónomo básico: `<= 30 minutos`.
  - Pasos requeridos para registrar asistencia o notas: `<= 3 clics` desde el panel de inicio.
- **Condiciones Operativas del Plantel:** Garantiza el éxito de los talleres de capacitación de la Fase IV del plan de trabajo de Servicio Social Universitario.
- **Método de Validación:** Medición del índice de satisfacción del usuario (CSAT >= 4/5) y tasa de éxito en tareas en las sesiones de validación UAT (Semana 11).

---

### RNF-USA-05: Prevención y Tolerancia a Errores de Usuario en la Interfaz
- **Dimensión ISO 25010:** Usabilidad — Protección contra Errores de Usuario.
- **Módulos Asociados:** Módulo 4 (Matrículas), Módulo 8 (Notas), Módulo 11 (Cierre).
- **Actores Impactados:** Docentes, Secretaría, Coordinación.
- **Prioridad:** Alta.
- **Descripción Extensa:** El sistema debe prevenir activamente las equivocaciones accidentales de los usuarios durante la operación cotidiana:
  1. **Validación Temprana:** Al ingresar calificaciones numéricas, el sistema debe impedir de inmediato el tipeo de valores fuera del rango legal (menores a 0 o mayores a 20), o letras inválidas distintas a AD, A, B, C en escala literal.
  2. **Acciones Destructivas:** Cualquier operación irreversible (eliminación de una matrícula, reasignación de carga lectiva o cierre oficial bimestral de periodo) debe desplegar un cuadro de diálogo modal de confirmación obligatoria con tipografía en color de advertencia, requiriendo que el usuario confirme explícitamente la acción.
  3. **Protección ante Navegación Involuntaria:** Si un docente tiene cambios sin guardar en una planilla e intenta cambiar de pestaña o cerrar el navegador, la aplicación debe interceptar el evento (*WillPopScope* / *beforeunload*) y advertir: *"Tienes calificaciones pendientes de sincronizar. ¿Deseas salir de todas formas?"*.
- **Métrica Cuantificable:**
  - Intercepción de datos fuera de rango antes de enviar a base de datos: `100% de los campos numéricos`.
  - Cuadros de confirmación modal en operaciones críticas: `100% obligatorio`.
- **Condiciones Operativas del Plantel:** Evita la corrupción accidental de actas o el borrado no deseado de datos escolares por error humano.
- **Método de Validación:** Ejecución de pruebas de aserción de validadores en formularios Flutter y simulación de intentos de escape de pantalla con cambios no guardados.

---

```
========================================================================================
DIMENSIÓN 5: MANTENIBILIDAD Y CALIDAD DE CÓDIGO (MAINTAINABILITY)
========================================================================================
```

### RNF-MAN-01: Arquitectura Modular Feature-First y Bajo Acoplamiento por Squads
- **Dimensión ISO 25010:** Mantenibilidad — Modularidad y Reusabilidad.
- **Módulos Asociados:** Núcleo de la solución de software (Flutter y Backend).
- **Actores Impactados:** Equipo Ejecutor de Desarrollo (los 5 desarrolladores del SSU).
- **Prioridad:** Crítica.
- **Descripción Extensa:** Para permitir el desarrollo paralelo eficiente de los 5 integrantes del equipo sin bloqueos ni colisiones de código en Git, la estructura del proyecto debe seguir rigurosamente el patrón de **Arquitectura Modular Orientada a Funcionalidades (Feature-First Clean Architecture)**:
  - Todo el código de un módulo funcional debe residir única y exclusivamente en su subdirectorio asignado: `lib/features/squad_[X]_[modulo]/`.
  - Cada módulo de squad debe organizarse internamente en capas bien definidas: `presentation/` (widgets y pantallas), `domain/` (entidades y casos de uso) y `data/` (modelos y repositorios).
  - El código transversal (temas, constantes, clientes HTTP base, widgets genéricos) reside exclusivamente en `lib/core/`.
  - Ningún squad puede realizar importaciones de archivos internos de otro squad; la comunicación inter-módulos debe realizarse únicamente a través del archivo barril público expuesto en la raíz del feature o mediante interfaces de `lib/core/`.
- **Métrica Cuantificable:**
  - Violaciones de frontera modular o dependencias circulares entre squads: `0 incidencias`.
  - Índice de acoplamiento eferente inter-squads: Mínimo indispensable vía contratos públicos.
- **Condiciones Operativas del Plantel:** Garantiza que el software pueda seguir siendo mantenido, ampliado o transferido formalmente a futuras generaciones de la EPIS-UNSCH.
- **Método de Validación:** Análisis estático de dependencias de archivos mediante herramientas de linting de Dart y revisión obligatoria en Pull Requests.

---

### RNF-MAN-02: Aseguramiento de Calidad Estática y Batería de Pruebas Automatizadas
- **Dimensión ISO 25010:** Mantenibilidad — Comprobabilidad y Analizabilidad.
- **Módulos Asociados:** Transversal a todo el repositorio de código fuente.
- **Actores Impactados:** Equipo de Desarrollo, Revisor de Código (Tech Lead).
- **Prioridad:** Crítica.
- **Descripción Extensa:** Todo aporte de código incorporado al repositorio central debe someterse a estándares rigurosos de control de calidad e higiene sintáctica antes de su integración a la rama base (`dev`):
  1. **Análisis Estático Obligatorio:** El código debe satisfacer al 100% las directivas del paquete oficial `flutter_lints` configuradas en `analysis_options.yaml`. El comando `flutter analyze` debe arrojar exactamente **cero (0) errores y cero (0) advertencias (warnings)**.
  2. **Pruebas Automatizadas:** Todo módulo nuevo debe acompañarse de su correspondiente batería de pruebas unitarias (para lógica de negocio y cálculos de promedios/conversiones) y pruebas de widgets (para pantallas críticas). La suite completa ejecutada mediante el comando `flutter test` debe aprobar al 100% sin excepciones.
- **Métrica Cuantificable:**
  - Salida de `flutter analyze`: `0 errors, 0 warnings, 0 infos no justificadas`.
  - Tasa de éxito en suite `flutter test`: `100% de tests pasando`.
- **Condiciones Operativas del Plantel:** Previene la introducción de regresiones o caídas imprevistas del sistema durante sustentaciones académicas o uso en producción.
- **Método de Validación:** Ejecución obligatoria de `flutter analyze` y `flutter test` en los flujos de integración continua (CI) de GitHub Actions previo al merge de Pull Requests.

---

### RNF-MAN-03: Estandarización Documental de Software (SDD según IEEE 1016)
- **Dimensión ISO 25010:** Mantenibilidad — Analizabilidad y Modificabilidad.
- **Módulos Asociados:** Documentación técnica de arquitectura de los 5 Squads.
- **Actores Impactados:** Equipo de Desarrollo, Docente Tutor SSU, Futuros Mantenedores.
- **Prioridad:** Alta.
- **Descripción Extensa:** Conforme a las directrices metodológicas de ingeniería de software consagradas en `AGENTS.md` y `.agents/rules/sdd_rules.md`, cada uno de los 5 squads técnicos debe elaborar y mantener actualizado su respectivo **Documento de Diseño de Software (SDD - Software Design Document)**. Cada SDD debe apegarse estrictamente a la plantilla canónica IEEE 1016 (`.agents/skills/sdd-authoring/resources/plantilla_sdd.md`) y ubicarse en `D - Base 1 - 01092026/Fase 2/Arquitectura/Squad [X]/sdd_squad_[X].md`. Debe contener diagramas C4 de componentes, diagramas de secuencia de operaciones clave, esquemas DDL de tablas y contratos formales JSON de APIs REST, garantizando **trazabilidad bidireccional estricta hacia los Requisitos Funcionales (`RF-01` al `RF-71`) y los Casos de Uso**.
- **Métrica Cuantificable:**
  - Cobertura de SDDs elaborados por los 5 Squads: `100% (5 de 5)`.
  - Trazabilidad hacia RFs y CUs documentada en matrices del SDD: `100%`.
- **Condiciones Operativas del Plantel:** Garantiza el sustento técnico y la acreditación académica requerida para la aprobación de la asignatura IS-480.
- **Método de Validación:** Auditoría documental cruzada comparando la plantilla IEEE 1016 contra los SDDs entregados por cada desarrollador.

---

```
========================================================================================
DIMENSIÓN 6: PORTABILIDAD, COMPATIBILIDAD Y CONFORMIDAD (PORTABILITY & COMPLIANCE)
========================================================================================
```

### RNF-POR-01: Portabilidad Multiplataforma y Empaquetado Dual (PWA Web y Desktop)
- **Dimensión ISO 25010:** Portabilidad — Adaptabilidad y Facilidad de Instalación.
- **Módulos Asociados:** Transversal a toda la plataforma.
- **Actores Impactados:** Toda la comunidad usuaria.
- **Prioridad:** Alta.
- **Descripción Extensa:** El sistema debe construirse sobre una base de código unificada (Single Codebase en Flutter) capaz de compilarse nativamente para múltiples entornos de ejecución sin requerir reescrituras de lógica de negocio:
  1. **Flutter Web / PWA:** La plataforma debe operar como una Progressive Web App instalable desde el navegador, con capacidades de manifest (`manifest.json`), service worker para cacheo de assets estáticos y funcionamiento autónomo sin marcos de navegador visibles.
  2. **Windows Desktop (.exe):** La solución debe soportar compilación nativa para el sistema operativo Windows (versiones 10 y 11 de 64 bits), empaquetada como ejecutable liviano de alto rendimiento, optimizado especialmente para la terminal fija de Kiosco en la caseta de portería.
- **Métrica Cuantificable:**
  - Compilación exitosa en web: `flutter build web --release` sin advertencias de librerías incompatibles.
  - Compilación exitosa en Windows: `flutter build windows --release` generando binario autónomo funcional.
- **Condiciones Operativas del Plantel:** Flexibilidad para usar el sistema en las computadoras de escritorio institucionales con Windows o desde el navegador en cualquier equipo portátil.
- **Método de Validación:** Ejecución de los scripts de compilación de release en ambos entornos y verificación de operatividad en terminales limpias sin Flutter SDK instalado.

---

### RNF-POR-02: Compatibilidad Garantizada con Motores de Navegación Web Modernos
- **Dimensión ISO 25010:** Compatibilidad — Coexistencia e Interoperabilidad.
- **Módulos Asociados:** Plataforma Web Institucional y Portal de Difusión.
- **Actores Impactados:** Todos los usuarios que acceden vía navegador.
- **Prioridad:** Alta.
- **Descripción Extensa:** Dado que los docentes y directivos utilizan diversos navegadores según sus preferencias personales o sistemas operativos, la aplicación web debe ofrecer paridad funcional y visual idéntica en los cuatro motores de renderizado más extendidos del mercado:
  - **Google Chrome:** Motor Chromium, versión 100 o superior.
  - **Microsoft Edge:** Motor Chromium, versión 100 o superior.
  - **Mozilla Firefox:** Motor Gecko, versión 100 o superior.
  - **Apple Safari:** Motor WebKit, versión 15 o superior.
  No debe requerirse la instalación de plugins propietarios de terceros (como Silverlight, Flash, Java Applets o extensiones de navegador).
- **Métrica Cuantificable:**
  - Tasa de paridad funcional en navegadores soportados: `100% de características operativas`.
  - Requisito de extensiones adicionales: `0 plugins requeridos`.
- **Condiciones Operativas del Plantel:** Evita problemas de soporte técnico por versiones de navegador desactualizadas o heterogéneas.
- **Método de Validación:** Pruebas de compatibilidad multi-browser cruzadas (Cross-Browser Testing) ejecutando flujos de login, asistencia y notas en cada navegador.

---

### RNF-POR-03: Localización Geográfica, Horaria, Monetaria y Lingüística
- **Dimensión ISO 25010:** Portabilidad — Adaptabilidad a Contextos Regionales.
- **Módulos Asociados:** Transversal a los 13 módulos.
- **Actores Impactados:** Toda la comunidad usuaria.
- **Prioridad:** Alta.
- **Descripción Extensa:** Todos los datos temporales, numéricos y lingüísticos procesados y presentados por el sistema deben ajustarse rigurosamente a las convenciones y husos horarios de la República del Perú:
  - **Zona Horaria Oficial:** Todos los timestamps de base de datos y cálculos de tardanzas deben regirse por la zona horaria `America/Lima` (UTC-5), garantizando que las marcas de asistencia en portería no registren desfases horarios con el reloj oficial peruano.
  - **Idioma y Terminología:** Interfaz 100% redactada en idioma español con giros y nomenclaturas formales de la educación peruana (*"Bimestre"*, *"Nivel Inicial"*, *"Grado"*, *"Sección"*, *"DNI"*, *"UGEL"*).
  - **Formatos de Fecha y Hora:** Formato de fecha estándar `DD/MM/AAAA` y formato horario de 12 horas con indicador am/pm o 24 horas institucional.
  - **Símbolo Monetario:** En los módulos donde se parametrice información presupuestal o constancias, se utilizará exclusivamente el Sol peruano (`S/`).
- **Métrica Cuantificable:**
  - Precisión de sincronización horaria de marcas de asistencia: `± 1 segundo respecto a la hora UTC-5`.
  - Cobertura de traducción y localización en español: `100% (cero textos en inglés en la UI)`.
- **Condiciones Operativas del Plantel:** Impide confusiones de fechas o discordancias en justificaciones horarias de docentes y alumnos.
- **Método de Validación:** Inspección visual de interfaces y verificación de configuración regional `es_PE` en controladores de formato de Dart/Flutter.

---

### RNF-POR-04: Conformidad con Normativa Curricular y Escalas Oficiales CNEB/MINEDU
- **Dimensión ISO 25010:** Conformidad Normativa y Restricciones de Dominio.
- **Módulos Asociados:** Módulo 3 (Configuración Escolar), Módulo 8 (Calificaciones), Módulo 11 (Libretas).
- **Actores Impactados:** Docentes, Coordinación Académica, Dirección General, MINEDU/DREA.
- **Prioridad:** Crítica.
- **Descripción Extensa:** El sistema debe operar en estricto cumplimiento de la normativa pedagógica emitida por el Ministerio de Educación del Perú (MINEDU), consagrada en la Resolución Viceministerial N.° 094-2020-MINEDU (*Norma que regula la Evaluación de las Competencias de los Estudiantes de la Educación Básica*) y el Currículo Nacional de la Educación Básica (CNEB):
  1. **Escala Cualitativa Oficial:** Para Educación Inicial, Primaria y grados correspondientes de Secundaria, el sistema debe operar con la escala descriptiva oficial de cuatro niveles:
     - **AD:** Logro Destacado.
     - **A:** Logro Esperado.
     - **B:** En Proceso.
     - **C:** En Inicio.
  2. **Motor de Conversión Dual:** Para aquellos periodos o asignaturas que requieran aún cómputo vigesimal (escala 0 a 20), el sistema debe incorporar un motor de cálculo que efectúe la conversión automática y bidireccional entre la escala vigesimal y literal oficial, persistiendo ambos valores para asegurar compatibilidad con los sistemas centrales del MINEDU (SIAGIE).
  3. **Conclusiones Descriptivas:** La plataforma debe proveer campos obligatorios para el ingreso de conclusiones descriptivas cuando el nivel de logro obtenido sea "C" o "B", conforme a la directiva pedagógica nacional.
- **Métrica Cuantificable:**
  - Apego de escalas evaluativas al marco R.V.M. N.° 094-2020-MINEDU: `100% de cumplimiento`.
  - Consistencia matemática en conversión dual vigesimal-literal: `100% de correspondencia exacta`.
- **Condiciones Operativas del Plantel:** Garantiza la validez legal y pedagógica de las libretas de notas emitidas ante la DREA Ayacucho y el SIAGIE.
- **Método de Validación:** Auditoría de fórmulas de cálculo y cotejo de boletas generadas contra los formatos canónicos del MINEDU.

---

## 4. MATRIZ DE TRAZABILIDAD CRUZADA: RNF VS. RESTRICCIONES DE PROYECTO

La siguiente matriz evidencia la articulación directa entre los Requerimientos No Funcionales formalizados y los documentos de diagnóstico institucional de la Fase I:

| Código RNF | Atributo ISO 25010 | Instrumento Fuente de Diagnóstico | Fundamento / Cláusula de Origen en la Información Base |
|---|---|---|---|
| **RNF-DES-01** | Latencia UI <= 1.5s | `metadatos.md` (KPIs) | Meta institucional: "Rendimiento del sistema: Tiempo de respuesta < 2 segundos". |
| **RNF-DES-02** | Debounce de 400ms | `deliminatacions.md` / `RF-45` | Innovación 6: "Auto-guardado en segundo plano con debounce de 400ms para evitar sobrecarga". |
| **RNF-DES-03** | Decodificación QR <= 300ms | `deliminatacions.md` / `stakeholders.md` | Expectativa STK-07 (Wachiman): "Interfaz ultrarrápida sin fricción en puerta". |
| **RNF-DES-04** | Mapas de Calor <= 2s | `deliminatacions.md` / `RF-47` al `RF-51` | Innovación 8: "Visualización jerárquica con drill-down sin retardos computacionales". |
| **RNF-DES-05** | Concurrencia 150 usuarios | `limitaciones.md` (Infraestructura) | Limitación técnica: Servidor VPS con recursos moderados en presupuesto de S/ 1,000. |
| **RNF-DES-06** | Bundle Web <= 1.2 MB | `limitaciones.md` (Tecnológica) | Limitación de conectividad: Operación sobre enlaces lentos y Wi-Fi escolar compartido. |
| **RNF-SEG-01** | Autenticación JWT dual | `deliminatacions.md` (Arquitectura) | Delimitación conceptual: Autenticación segura JWT y sesiones desacopladas. |
| **RNF-SEG-02** | RBAC y Multi-Tenant | `stakeholders.md` / `deliminatacions.md` | Mapeo de 6 roles en sección 5 de stakeholders y aislamiento por `tenant_id`. |
| **RNF-SEG-03** | bcrypt salt rounds >= 12 | `metadatos.md` / Buenas prácticas | Directiva de seguridad: Prohibición expresa de almacenamiento en texto plano. |
| **RNF-SEG-04** | Ley N.° 29733 (AES-256) | `limitaciones.md` / `stakeholders.md` | Limitación de datos y STK-12: Protección irrestricta de datos personales de menores. |
| **RNF-SEG-05** | Hash SHA-256 en QR | `deliminatacions.md` / `RF-60` | Innovación 11: "Verificación documental criptográfica pública sin inicio de sesión". |
| **RNF-SEG-06** | HTTPS y OWASP Top 10 | `metadatos.md` / `deliminatacions.md` | Despliegue en VPS Cloud con certificado SSL obligatorio y arquitectura web segura. |
| **RNF-FIA-01** | Uptime >= 99.5% | `metadatos.md` (KPIs) | Meta institucional: "Disponibilidad: Uptime 99.5% en horario lectivo escolar". |
| **RNF-FIA-02** | Resiliencia Offline-First | `deliminatacions.md` / `limitaciones.md` | Innovación 1 y Limitación 5: "Buffer de contingencia local en portería (IndexedDB)". |
| **RNF-FIA-03** | Consistencia ACID | `limitaciones.md` (Datos) | Limitación de calidad: Integridad garantizada en matrículas y consolidación de notas. |
| **RNF-FIA-04** | Respaldo RPO/RTO | `limitaciones.md` (Mantenimiento) | Política de continuidad y respaldo ante fallas de infraestructura en servidor VPS. |
| **RNF-USA-01** | Responsive Design | `deliminatacions.md` / `limitaciones.md` | Exclusión de apps nativas; soporte web responsive fluido de móvil a escritorio. |
| **RNF-USA-02** | Modo Excel por Teclado | `deliminatacions.md` / `RF-38` | Innovación 4: "Planilla rápida con navegación por flechas de teclado, Enter y Tab". |
| **RNF-USA-03** | WCAG 2.1 AA | `stakeholders.md` / `metadatos.md` | Accesibilidad para docentes de toda edad y paleta oficial accesible de AppTheme. |
| **RNF-USA-04** | Brecha Digital <= 30 min | `stakeholders.md` (STK-03, STK-07) | Riesgo de brecha digital docente; mitigación con interfaces limpias y directas. |
| **RNF-USA-05** | Prevención de Errores | `stakeholders.md` (STK-02, STK-08) | Evitar sobrecarga operativa por rectificaciones o cierres de notas accidentales. |
| **RNF-MAN-01** | Feature-First Clean Arch | `metadatos.md` / `AGENTS.md` | Trabajo colaborativo de 5 desarrolladores organizados en squads sin colisiones. |
| **RNF-MAN-02** | 0 Errores en Flutter QA | `metadatos.md` / `AGENTS.md` | Calidad de código: `flutter_lints 5.0.0`, `flutter analyze` y `flutter test`. |
| **RNF-MAN-03** | SDD según IEEE 1016 | `AGENTS.md` / `.agents/rules/` | Entregable formal de ingeniería: Documento de Diseño de Software estandarizado. |
| **RNF-POR-01** | Web PWA + Desktop .exe | `metadatos.md` (Stack) | Flutter multiplataforma garantizando PWA web y ejecutable Windows de portería. |
| **RNF-POR-02** | Compatibilidad Navegadores | `limitaciones.md` (Tecnológica) | Navegadores modernos actualizados (Chrome, Edge, Firefox, Safari). |
| **RNF-POR-03** | Localización America/Lima | `deliminatacions.md` (Espacial) | Ámbito territorial en Ayacucho (Perú), moneda Soles (S/) y fecha DD/MM/AAAA. |
| **RNF-POR-04** | Normativa CNEB/MINEDU | `deliminatacions.md` / `stakeholders.md` | Cumplimiento pedagógico nacional (R.V.M. N.° 094-2020-MINEDU, AD/A/B/C y 0-20). |

---

## 5. CONCLUSIONES Y TRANSICIÓN HACIA LA FASE II

La presente especificación de Requerimientos No Funcionales para la **Fase I (Diagnóstico y Formulación)** sienta las bases normativas y los compromisos de ingeniería de software que rigen el diseño arquitectural de la **Fase II (Diseño y Desarrollo)**:

1. **Correspondencia con la Arquitectura:** Los 28 requerimientos no funcionales definidos se traducen de forma directa en decisiones de diseño reflejadas en el Modelo C4 (`C4/`), en los contratos de API REST (`contratos_api.md`), en el esquema relacional (`esquema_datos.sql`) y en los Documentos de Diseño de Software de cada Squad (`sdd_squad_[X].md`).
2. **Coherencia Bidireccional:** Se garantiza la perfecta alineación entre este catálogo fundacional de Fase 1 y la especificación técnica de la Fase 2 (`D - Base 1 - 01092026/Fase 2/Requisitos No Funcionales/requisitos_no_funcionales.md`), permitiendo verificar el cumplimiento de cada métrica mediante pruebas automatizadas y procedimientos de auditoría de calidad.
