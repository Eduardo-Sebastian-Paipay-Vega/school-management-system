# ESPECIFICACIÓN DOCUMENTAL DE REQUISITOS NO FUNCIONALES (RNF)

## TÍTULO DEL PROYECTO
**DESARROLLO E IMPLEMENTACIÓN DE UNA PLATAFORMA WEB PARA LA GESTIÓN ACADÉMICA E INFORMACIÓN INSTITUCIONAL EN LOS PLANTELES DE APLICACIÓN DE LA UNSCH**

- **Institución Beneficiaria:** Planteles de Aplicación "Guamán Poma de Ayala" – UNSCH (Ayacucho, Perú)
- **Marco Académico:** Servicio Social Universitario (IS-480) – Escuela Profesional de Ingeniería de Sistemas (EPIS-UNSCH)
- **Fase del Proyecto:** Fase II – Diseño y Desarrollo de Software
- **Estándares Aplicados:** IEEE 830 (SRS) / ISO/IEC 25010 (System and Software Quality Models)
- **Alcance Operativo:** 20 Requisitos No Funcionales clasificados en 6 dimensiones de calidad y distribuidos en los 5 Squads Técnicos Especializados.

---

## 1. MARCO METODOLÓGICO Y DIMENSIONES ISO/IEC 25010

Los Requisitos No Funcionales (RNF) determinan los atributos de calidad, rendimiento, restricciones de seguridad y directivas de ingeniería bajo los cuales debe operar la plataforma escolar. Se estructuran en conformidad con el estándar internacional **ISO/IEC 25010**:

1. **Eficiencia de Desempeño (Performance Efficiency):** Comportamiento temporal, utilización de recursos y capacidad.
2. **Seguridad (Security):** Confidencialidad, integridad, no repudio, autenticidad y rendición de cuentas.
3. **Fiabilidad y Disponibilidad (Reliability & Availability):** Madurez, tolerancia a fallos, recuperabilidad y disponibilidad.
4. **Usabilidad (Usability):** Reconocibilidad, aprendizaje, operabilidad y accesibilidad (WCAG 2.1).
5. **Mantenibilidad (Maintainability):** Modularidad, reusabilidad, analizabilidad, modificabilidad y comprobabilidad.
6. **Portabilidad y Compatibilidad (Portability & Compatibility):** Adaptabilidad, facilidad de instalación y coexistencia multiplataforma.

---

## 2. MATRIZ MAESTRA DE REQUISITOS NO FUNCIONALES

| Código | Requisito No Funcional | Dimensión ISO 25010 | Squad Responsable | Métrica / Criterio de Aceptación Cuantificable |
|:---:|---|---|---|---|
| **RNF-01** | Latencia y Tiempo de Respuesta UI | Eficiencia de Desempeño | Squad 3 / Transversal | Tiempo de respuesta en transacciones CRUD < 1.5s en red estándar; render local < 100ms. |
| **RNF-02** | Auto-guardado con Debounce | Eficiencia de Desempeño | Squad 3 (Calificaciones) | Ventana de debounce de 400ms tras la última tecla pulsada antes de sincronizar con el backend. |
| **RNF-03** | Latencia de Decodificación en Kiosco | Eficiencia de Desempeño | Squad 2 (Matrícula/Asistencia) | Procesamiento, decodificación de carné QR y feedback auditivo/visual en < 300ms. |
| **RNF-04** | Renderizado de Dashboards Analíticos | Eficiencia de Desempeño | Squad 4 (Analítica/Dashboards) | Carga inicial y generación de mapas de calor con hasta 5,000 registros en < 2.0s. |
| **RNF-05** | Autenticación Segura con JWT | Seguridad | Squad 1 (Core/Seguridad) | Access Tokens firmados con HMAC-SHA256 (expiración 15 min) y Refresh Tokens en cookie HttpOnly. |
| **RNF-06** | Control de Acceso Basado en Roles (RBAC) | Seguridad | Squad 1 (Core/Seguridad) | Validación obligatoria de rol (Admin, Director, Docente, Auxiliar, Secretaría) a nivel UI y endpoints. |
| **RNF-07** | Hashing de Contraseñas con Salt Dinámico | Seguridad | Squad 1 (Core/Seguridad) | Algoritmo bcrypt con factor de costo (salt rounds) >= 12; prohibido almacenamiento en texto claro. |
| **RNF-08** | Protección de Datos Personales (Ley 29733) | Seguridad | Squad 1 (Core/Seguridad) | Cifrado AES-256 para campos sensibles de menores (DNI, diagnósticos, observaciones conductuales). |
| **RNF-09** | Verificación Criptográfica Documental QR | Seguridad | Squad 5 (Secretaría/Portal) | Hash SHA-256 generado con salt institucional incrustado en el QR de libretas y certificados. |
| **RNF-10** | Alta Disponibilidad del Servicio | Fiabilidad | Squad 1 / Infraestructura | Uptime del 99.5% durante el periodo escolar lectivo (lunes a viernes 07:00 a 19:00 hrs). |
| **RNF-11** | Resiliencia Offline-First en Kiosco | Fiabilidad | Squad 2 (Matrícula/Asistencia) | Capacidad de operar 100% desconectado en portería usando IndexedDB/Hive y sincronización en ráfagas. |
| **RNF-12** | Integridad Transaccional ACID | Fiabilidad | Transversal / Squad 2 y 3 | Operaciones de matrícula masiva y cierre bimestral de notas envueltas en transacciones atómicas. |
| **RNF-13** | Diseño Responsivo y Soporte Multi-Dispositivo | Usabilidad | Squad 5 / Transversal | Adaptabilidad fluida (Fluid Layout) para resoluciones desde 360px (móvil) hasta 1920px (escritorio). |
| **RNF-14** | Ergonomía de Teclado ("Modo Excel") | Usabilidad | Squad 3 (Calificaciones) | Navegación 100% por teclado (flechas, Enter, Tab, Esc) sin requerir uso obligatorio del mouse. |
| **RNF-15** | Accesibilidad Visual y Contraste (WCAG 2.1 AA) | Usabilidad | Squad 4 / Transversal | Razón de contraste mínima de 4.5:1 para texto normal, paleta semántica institucional accesible. |
| **RNF-16** | Arquitectura Modular Feature-First | Mantenibilidad | Transversal (Squads 1 al 5) | Estructura de código aislada por squad en `lib/features/squad_[X]_[modulo]/` con bajo acoplamiento. |
| **RNF-17** | Análisis Estático y Cobertura de Pruebas | Mantenibilidad | Transversal (Squads 1 al 5) | 0 errores y 0 advertencias en `flutter analyze`; suite automatizada ejecutando con `flutter test`. |
| **RNF-18** | Estandarización Documental de Software (SDD) | Mantenibilidad | Transversal (Squads 1 al 5) | Cada squad debe mantener su SDD conforme al estándar IEEE 1016 con trazabilidad a RFs y CUs. |
| **RNF-19** | Portabilidad y Despliegue Multiplataforma | Portabilidad | Transversal | Soporte compilado nativo en Flutter Web (PWA), Windows Desktop y preconfiguración móvil. |
| **RNF-20** | Compatibilidad con Navegadores Modernos | Compatibilidad | Squad 5 / Transversal | Ejecución garantizada en Google Chrome >= 100, Microsoft Edge >= 100, Firefox >= 100 y Safari >= 15. |

---

## 3. ESPECIFICACIÓN DETALLADA DE REQUISITOS NO FUNCIONALES

### RNF-01: Latencia y Tiempo de Respuesta UI
- **Descripción:** Las interacciones del usuario en el navegador o cliente de escritorio deben ejecutarse con fluidez perceptible inmediata.
- **Métrica:** Tiempo de carga de pantalla <= 1.5 segundos en conexiones de banda ancha estándar (>= 5 Mbps). Las acciones locales (validación de formularios, cambios de pestaña y filtros en memoria) deben responder en <= 100 milisegundos.
- **Trazabilidad:** RF-36 al RF-46 (Squad 3) y navegación general de la plataforma.

### RNF-02: Auto-guardado con Debounce en Planilla de Calificaciones
- **Descripción:** Para evitar la sobrecarga de solicitudes HTTP y prevenir colisiones durante el tipeo continuo de calificaciones, el sistema debe implementar una ventana de amortiguamiento (debounce).
- **Métrica:** El timer de debounce debe configurarse en 400 milisegundos. Solo tras transcurrir 400ms sin nuevas pulsaciones del teclado se disparará la petición asíncrona de persistencia. La UI debe proveer retroalimentación visual del estado ("Guardando...", "Guardado", "Error de red").
- **Trazabilidad:** RF-36, RF-37 (Squad 3).

### RNF-03: Latencia de Decodificación y Registro en Kiosco Offline
- **Descripción:** El Kiosco de asistencia de portería debe procesar el flujo de ingreso de estudiantes sin generar filas ni aglomeraciones en la puerta de la institución.
- **Métrica:** Tiempo total entre la captura óptica del código QR por la cámara o lector óptico, su decodificación, la validación del hash del carné y el almacenamiento en base de datos local (IndexedDB/Hive) <= 300 milisegundos. Confirmación audiovisual simultánea (beep + indicador verde/rojo).
- **Trazabilidad:** RF-20, RF-21, RF-22 (Squad 2).

### RNF-04: Rendimiento de Renderizado de Dashboards Analíticos y Mapas de Calor
- **Descripción:** Los directores y coordinadores deben acceder a resúmenes analíticos y mapas de calor multidimensionales sin retardos computacionales.
- **Métrica:** El procesamiento matemático de matrices de rendimiento y su representación gráfica vectorial en Flutter debe renderizarse en un tiempo <= 2.0 segundos para un conjunto de datos de hasta 5,000 registros históricos bimestrales.
- **Trazabilidad:** RF-47 al RF-51 (Squad 4).

### RNF-05: Autenticación Segura con JWT (Tokens de Acceso y Refresco)
- **Descripción:** El mecanismo de sesión debe garantizar seguridad contra secuestro de sesiones (session hijacking) y ataques XSS/CSRF.
- **Métrica:** Los Access Tokens JWT deben tener un periodo de expiración estricto de 15 minutos y firmarse con HMAC-SHA256 (o RSA-256). Los Refresh Tokens deben expirar a los 7 días y transmitirse exclusivamente mediante cookies marcadas con las directivas `HttpOnly`, `Secure` y `SameSite=Strict`.
- **Trazabilidad:** RF-01, RF-02, RF-03 (Squad 1).

### RNF-06: Control de Acceso Basado en Roles (RBAC Estricto)
- **Descripción:** Cada acción, ruta en Flutter y endpoint en el backend debe validar de forma independiente los permisos del usuario activo.
- **Métrica:** 100% de las rutas protegidas y endpoints REST deben pasar por un middleware interceptor RBAC. Cualquier solicitud sin permisos suficientes debe retornar código HTTP 403 Forbidden y registrar un evento en la bitácora de auditoría.
- **Trazabilidad:** RF-04, RF-05, RF-06 (Squad 1).

### RNF-07: Hashing Criptográfico de Credenciales con Salt Dinámico
- **Descripción:** Las contraseñas de los usuarios no deben almacenarse en texto plano bajo ninguna circunstancia.
- **Métrica:** Se debe utilizar el algoritmo bcrypt con un factor de costo computacional (salt rounds) igual o superior a 12. En caso de migración o autenticación federada, se requerirá un estándar criptográfico equivalente o superior (Argon2id).
- **Trazabilidad:** RF-01, RF-05 (Squad 1).

### RNF-08: Protección de Datos Personales (Ley N° 29733 - Perú)
- **Descripción:** El sistema debe salvaguardar la intimidad de los estudiantes menores de edad y el personal docente en estricto cumplimiento de la Ley de Protección de Datos Personales del Perú.
- **Métrica:** Los datos sensibles (DNI, dirección, teléfonos de apoderados, observaciones de salud y socioeconómicas) deben cifrarse en reposo en la base de datos utilizando el estándar AES-256. Todo acceso o modificación a estos campos debe quedar registrado con fecha, hora, IP y usuario responsable.
- **Trazabilidad:** RF-65, RF-66, RF-67, RF-68 (Squad 1).

### RNF-09: Verificación Criptográfica Documental con SHA-256 en Códigos QR
- **Descripción:** Las libretas de notas, constancias de matrícula y reportes de SSU emitidos en PDF deben ser inalterables y verificables públicamente sin requerir inicio de sesión.
- **Métrica:** El código QR impreso en cada documento debe codificar una URL pública segura que contiene el hash criptográfico SHA-256 generado a partir de los datos inmutables del documento (ID de estudiante, periodo, notas finales y sal secreta institucional). Al escanear el QR, el portal web debe verificar el hash en < 1 segundo y mostrar la validez oficial.
- **Trazabilidad:** RF-59, RF-60, RF-61, RF-69 (Squad 5).

### RNF-10: Alta Disponibilidad del Servicio Escolar
- **Descripción:** La plataforma debe permanecer operativa y accesible durante las actividades lectivas cotidianas.
- **Métrica:** Tasa de disponibilidad (uptime) mínima del 99.5% durante el horario de jornada escolar (lunes a viernes de 07:00 a 19:00 horas). Los periodos de mantenimiento programado deben notificarse con al menos 48 horas de anticipación y ejecutarse en fines de semana o fuera de horario de clases.
- **Trazabilidad:** Módulos M1 al M13 (Infraestructura / Squad 1).

### RNF-11: Resiliencia Operativa y Persistencia Local Offline-First
- **Descripción:** La toma de asistencia en portería no debe interrumpirse si ocurre una caída del enlace de internet o corte temporal de energía en la institución.
- **Métrica:** La aplicación del Kiosco debe operar con autonomía total en modo desconectado, persistiendo los registros en el almacenamiento local del cliente (IndexedDB en navegador / Hive en desktop). Al recuperar la conexión a internet, el sistema debe sincronizar automáticamente en ráfagas (background sync) resolviendo conflictos mediante la política Last-Write-Wins y garantizando cero pérdida de marcaciones.
- **Trazabilidad:** RF-20, RF-21, RF-22, RF-23 (Squad 2).

### RNF-12: Integridad Transaccional y Consistencia ACID
- **Descripción:** Las operaciones que involucran inserciones o actualizaciones múltiples deben ejecutarse de manera atómica para prevenir estados corruptos o inconsistencias en la base de datos.
- **Métrica:** 100% de los procesos de matrícula masiva, cierre de periodos académicos y consolidación bimestral de notas deben ejecutarse bajo transacciones de base de datos con nivel de aislamiento `READ COMMITTED` o superior. Si ocurre un fallo en cualquier paso intermedio, el sistema debe ejecutar un `ROLLBACK` completo en < 500ms.
- **Trazabilidad:** RF-15 al RF-19 (Squad 2), RF-36 al RF-46 (Squad 3).

### RNF-13: Diseño Responsivo y Soporte Multi-Dispositivo
- **Descripción:** La interfaz de usuario debe adaptarse fluidamente a diversos factores de forma y tamaños de pantalla.
- **Métrica:** Soporte verificado mediante layouts fluidos (`LayoutBuilder`, `MediaQuery`) para resoluciones desde teléfonos móviles (>= 360px), tablets (>= 768px), laptops (>= 1024px) y monitores de escritorio (>= 1920px). No deben producirse desbordamientos visuales (overflows amarillos/negros en Flutter).
- **Trazabilidad:** Transversal a los 5 Squads (liderado por Squad 5).

### RNF-14: Ergonomía de Entrada de Datos y Navegación de Teclado ("Modo Excel")
- **Descripción:** La planilla de calificaciones debe permitir a los docentes registrar notas con la velocidad y comodidad de una hoja de cálculo tradicional.
- **Métrica:** El 100% de la navegación entre celdas de estudiantes y competencias debe operarse mediante teclas de dirección (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`), `Enter` (bajar fila) y `Tab` (siguiente competencia). El foco debe retenerse de manera automática al ingresar notas.
- **Trazabilidad:** RF-36 al RF-41 (Squad 3).

### RNF-15: Accesibilidad Visual y Contraste (WCAG 2.1 Nivel AA)
- **Descripción:** Las personas con visión reducida o daltonismo deben poder distinguir claramente estados, notas y advertencias.
- **Métrica:** Cumplimiento del ratio de contraste mínimo de 4.5:1 para texto normal y 3:1 para texto grande/componentes gráficos interactivos. En la escala CNEB (AD, A, B, C) y mapas de calor, los estados no deben identificarse únicamente por color, sino acompañarse de iconos, etiquetas textuales o patrones visuales.
- **Trazabilidad:** RF-47 al RF-51 (Squad 4) y `lib/core/theme/app_theme.dart`.

### RNF-16: Arquitectura Modular Feature-First y Clean Architecture
- **Descripción:** El código fuente debe estructurarse modularmente para que los 5 desarrolladores puedan trabajar en paralelo sin colisiones en Git ni dependencias circulares.
- **Métrica:** Cada módulo de squad debe residir exclusivamente en su subcarpeta `lib/features/squad_[X]_[modulo]/`, estructurado internamente en capas (`presentation`, `domain`, `data`). Ningún squad puede importar archivos internos de otro squad sin pasar por contratos públicos expuestos en su archivo barril o en `lib/core/`.
- **Trazabilidad:** AGENTS.md, Directivas de Ingeniería.

### RNF-17: Aseguramiento de Calidad Estática y Cobertura de Pruebas
- **Descripción:** Todo código incorporado al repositorio debe cumplir con las normas de estilo y calidad del equipo.
- **Métrica:** Cero (0) errores y cero (0) advertencias en el análisis estático ejecutado con `flutter analyze`. Todo Pull Request debe contar con pruebas unitarias o de widgets asociadas que se ejecuten y aprueben al 100% mediante `flutter test`.
- **Trazabilidad:** Políticas de CI/CD y QA.

### RNF-18: Estandarización Documental de Software (SDD según IEEE 1016)
- **Descripción:** Cada squad debe mantener actualizada la especificación de diseño técnico de su módulo.
- **Métrica:** 100% de los módulos implementados deben contar con su Documento de Diseño de Software (SDD) redactado conforme a la plantilla canónica IEEE 1016 (`.agents/skills/sdd-authoring/resources/plantilla_sdd.md`), vinculando cada componente técnico a sus respectivos RFs y Casos de Uso.
- **Trazabilidad:** `.agents/skills/sdd-authoring/SKILL.md`.

### RNF-19: Portabilidad y Despliegue Multiplataforma
- **Descripción:** La plataforma debe ejecutarse como aplicación web progresiva y contar con capacidad de empaquetado nativo para escritorio.
- **Métrica:** La compilación en modo producción (`flutter build web --release` y `flutter build windows --release`) debe generar binarios y paquetes web completamente funcionales sin errores de enlace ni dependencias de plataforma no soportadas.
- **Trazabilidad:** Configuración de `web/`, `windows/` y `pubspec.yaml`.

### RNF-20: Compatibilidad con Motores de Navegación Web Modernos
- **Descripción:** Los usuarios deben poder acceder a la plataforma desde los navegadores más utilizados en las instituciones educativas sin pérdida de funcionalidad.
- **Métrica:** Compatibilidad garantizada y probada en Google Chrome (Chromium >= 100), Microsoft Edge (Chromium >= 100), Mozilla Firefox (Gecko >= 100) y Safari (WebKit >= 15).
- **Trazabilidad:** Squad 5 / Portal Web.
