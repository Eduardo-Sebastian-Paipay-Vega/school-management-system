# CATÁLOGO Y ESPECIFICACIÓN DOCUMENTAL DE REQUISITOS FUNCIONALES (RF)

## TÍTULO DEL PROYECTO
**DESARROLLO E IMPLEMENTACIÓN DE UNA PLATAFORMA WEB PARA LA GESTIÓN ACADÉMICA E INFORMACIÓN INSTITUCIONAL EN LOS PLANTELES DE APLICACIÓN DE LA UNSCH**

- **Institución Beneficiaria:** Planteles de Aplicación "Guamán Poma de Ayala" – UNSCH (Ayacucho, Perú)
- **Marco Académico:** Servicio Social Universitario (IS-480) – Escuela Profesional de Ingeniería de Sistemas (EPIS-UNSCH)
- **Fase del Proyecto:** Fase II – Diseño y Desarrollo de Software
- **Documento:** Especificación Documental de Requisitos Funcionales del Software (Estándar IEEE 830 / ISO 29148)
- **Alcance Incorporado:** Sistema Integral con Módulos de Aula Rápida ("Modo Excel"), Kiosco Offline-First, Carnés Escolares QR, Ficha 360° del Alumno, Mapas de Calor con Drill-Down, Verificación Documental Criptográfica QR y Dashboard de Impacto SSU.

---

## 1. INTRODUCCIÓN Y MARCO NORMATIVO

El presente documento constituye la **Especificación Documental Integral de los Requisitos Funcionales (RF)** del software para la **Fase II (Diseño y Desarrollo)**. Cada requisito está formulado bajo el estándar prescriptivo formal de ingeniería de software (*"El sistema deberá..."*), definiendo con rigor las capacidades operativas, precondiciones, flujos de procesamiento, postcondiciones y criterios de verificación para la plataforma web de los Planteles de Aplicación "Guamán Poma de Ayala".

El catálogo integra formalmente los **módulos de innovación operativa, pedagógica e institucional** diseñados para maximizar la adopción real por los docentes (modo teclado de alta velocidad tipo Excel y asistente de conclusiones descriptivas), la resiliencia en infraestructura escolar (kiosco offline-first con carnés QR), la toma de decisiones directivas (ficha 360° y mapas térmicos con drill-down) y la acreditación universitaria (verificación documental con firma digital QR y panel de impacto SSU IS-480).

---

## 2. TABLA MAESTRA Y LISTA ESTRUCTURADA DE REQUISITOS FUNCIONALES (71 RF)

| ID | Denominación Oficial del Requisito Funcional | Módulo de Trabajo | Actor Principal | Prioridad |
|:---:|---|---|---|:---:|
| **RF-01** | Autenticación Segura de Usuarios mediante Credenciales Institucionales | M1: Acceso y Seguridad | Toda la comunidad escolar | Esencial |
| **RF-02** | Cierre de Sesión Seguro y Terminación Automática por Inactividad | M1: Acceso y Seguridad | Toda la comunidad escolar | Esencial |
| **RF-03** | Restablecimiento Asistido de Contraseñas de Acceso | M1: Acceso y Seguridad | Usuarios / Administrador TI | Deseable |
| **RF-04** | Control de Privilegios y Acceso Basado en Roles (RBAC) | M1: Acceso y Seguridad | Administrador TI / Directivos | Esencial |
| **RF-05** | Registro y Alta Formal de Cuentas de Personal Institucional | M2: Gestión de Usuarios | Administrador TI / Dirección | Esencial |
| **RF-06** | Modificación de Datos y Baja Lógica de Usuarios del Plantel | M2: Gestión de Usuarios | Administrador TI / Coordinación | Esencial |
| **RF-07** | Reasignación Dinámica de Roles y Jerarquías del Personal | M2: Gestión de Usuarios | Administrador TI / Dirección | Deseable |
| **RF-08** | Directorio y Búsqueda Avanzada de Personal Institucional | M2: Gestión de Usuarios | Dirección / Coordinación / Secretaría | Deseable |
| **RF-09** | Gestión de Perfil Personal y Actualización de Medios de Contacto | M2: Gestión de Usuarios | Todos los usuarios autenticados | Deseable |
| **RF-10** | Parametrización de Datos Institucionales del Plantel y Sedes | M3: Configuración Escolar | Dirección General / Administrador | Esencial |
| **RF-11** | Apertura, Configuración y Cierre de Periodos Académicos | M3: Configuración Escolar | Coordinación / Dirección General | Esencial |
| **RF-12** | Estructuración de Niveles Educativos, Grados y Secciones | M3: Configuración Escolar | Coordinación Académica / Secretaría | Esencial |
| **RF-13** | Parametrización del Plan de Estudios y Competencias Curriculares | M3: Configuración Escolar | Coordinación Académica | Esencial |
| **RF-14** | Definición de Escalas de Calificación Oficiales (Vigesimal y Literal) | M3: Configuración Escolar | Coordinación / Dirección General | Esencial |
| **RF-15** | Registro, Filiación y Actualización del Padrón de Estudiantes | M4: Gestión Académica | Secretaría Académica / Dirección | Esencial |
| **RF-16** | Matrícula Escolar y Asignación de Estudiantes a Secciones | M4: Gestión Académica | Secretaría Académica / Coordinación | Esencial |
| **RF-17** | Asignación y Distribución de Carga Lectiva Docente | M4: Gestión Académica | Coordinación Académica / Dirección | Esencial |
| **RF-18** | Vinculación y Asignación Pedagógica de Practicantes de Educación | M4: Gestión Académica | Coordinación / Docentes Tutores | Esencial |
| **RF-19** | Consulta y Generación de Nóminas Oficiales de Aula | M4: Gestión Académica | Docentes / Coordinación / Secretaría | Deseable |
| **RF-20** | Registro Ordinario de Asistencia Escolar en el Aula | M5: Asistencia Estudiantil | Docentes Titulares y Contratados | Esencial |
| **RF-21** | Registro de Ingreso Físico en Modo Kiosco de Portería ("Wachiman") | M5: Asistencia Estudiantil | Personal de Vigilancia / Auxiliares | Deseable |
| **RF-22** | Gestión y Justificación Formal de Inasistencias y Tardanzas Escolares | M5: Asistencia Estudiantil | Coordinación Académica / Auxiliares | Deseable |
| **RF-23** | Consolidación y Consulta del Récord de Asistencia por Estudiante | M5: Asistencia Estudiantil | Estudiantes / Docentes / Dirección | Esencial |
| **RF-24** | Detección y Generación de Alertas por Ausentismo Crónico | M5: Asistencia Estudiantil | Coordinación Académica / Tutores | Esencial |
| **RF-25** | Kiosco de Portería Resiliente con Modo Desconectado (Offline-First) | M5: Asistencia Estudiantil | Personal de Vigilancia / Portería | Esencial |
| **RF-26** | Generación y Emisión Masiva de Carnés Escolares con Código QR/Barras| M5: Asistencia Estudiantil | Secretaría Académica / Dirección | Deseable |
| **RF-27** | Toma Rápida en App Móvil y Difusión en Tiempo Real (WebSockets) | M5: Asistencia Estudiantil | Docentes / Auxiliares / Dirección | Esencial |
| **RF-28** | Registro Diario de Jornada y Permanencia de Practicantes | M6: Practicantes | Practicantes de Educación | Esencial |
| **RF-29** | Cómputo Acumulado de Horas Efectivas de Prácticas Universitarias | M6: Practicantes | Practicantes / Coordinación / EPIS | Esencial |
| **RF-30** | Conformidad y Validación Periódica de Horas por el Docente Tutor | M6: Practicantes | Docentes Tutores / Coordinación | Esencial |
| **RF-31** | Emisión de Fichas Oficiales de Prácticas para la UNSCH | M6: Practicantes | Coordinación Académica / Practicantes| Deseable |
| **RF-32** | Registro y Marcación de Horas Lectivas de Docentes Contratados | M7: Docentes Contratados | Docentes Contratados / Coordinación | Esencial |
| **RF-33** | Registro de Justificaciones y Reprogramación de Clases Docentes | M7: Docentes Contratados | Docentes Contratados / Coordinación | Deseable |
| **RF-34** | Consolidación Mensual de Cumplimiento de Horas Lectivas Dictadas | M7: Docentes Contratados | Coordinación / Secretaría / Dirección | Esencial |
| **RF-35** | Supervisión y Monitoreo de Cobertura y Puntualidad de Clases | M7: Docentes Contratados | Coordinación Académica | Deseable |
| **RF-36** | Parametrización de Rúbricas y Evaluaciones por Asignatura | M8: Calificaciones | Docentes Titulares del Curso | Esencial |
| **RF-37** | Ingreso, Edición y Publicación de Calificaciones en Tiempo Real | M8: Calificaciones | Docentes Titulares del Curso | Esencial |
| **RF-38** | Planilla Ágil de Notas en Modo Matriz Rápida ("Modo Excel / Teclado")| M8: Calificaciones | Docentes Titulares y Contratados | Esencial |
| **RF-39** | Asistente de Conclusiones Descriptivas Sugeridas por Logro (MINEDU) | M8: Calificaciones | Docentes Titulares del Curso | Deseable |
| **RF-40** | Colaboración Supervisada de Practicantes en el Registro de Notas | M8: Calificaciones | Practicantes / Docentes Tutores | Deseable |
| **RF-41** | Cálculo Automatizado de Promedios Parciales, Bimestrales y Finales | M8: Calificaciones | Sistema / Coordinación Académica | Esencial |
| **RF-42** | Cierre Oficial de Periodo Académico y Bloqueo de Modificación | M8: Calificaciones | Coordinación / Dirección General | Esencial |
| **RF-43** | Flujo Extraordinario de Solicitud y Aprobación de Rectificación | M8: Calificaciones | Docentes / Coordinación / Dirección | Deseable |
| **RF-44** | Consulta Inmediata y Transparente de Calificaciones para Estudiantes | M8: Calificaciones | Estudiantes del Plantel | Esencial |
| **RF-45** | Llenado Asistido con Auto-Guardado y Conexión Automática | M8: Calificaciones | Docentes / Coordinación | Esencial |
| **RF-46** | Motor de Conversión Escala Vigesimal (0-20) a Literal CNEB (AD, A, B, C) | M8: Calificaciones | Docentes / Dirección / Coordinación | Esencial |
| **RF-47** | Generación de Mapa de Calor de Rendimiento Académico por Sección | M9: Mapas de Calor | Dirección / Coordinación / Docentes | Esencial |
| **RF-48** | Generación de Mapa de Calor de Asistencia y Puntualidad | M9: Mapas de Calor | Dirección / Coordinación / Auxiliares | Esencial |
| **RF-49** | Mapas de Calor Interactivos con Navegación a Detalle (Drill-Down) | M9: Mapas de Calor | Coordinación Académica / Dirección | Esencial |
| **RF-50** | Análisis Gráfico Comparativo de Rendimiento entre Secciones | M9: Mapas de Calor | Coordinación Académica / Dirección | Deseable |
| **RF-51** | Detección Visual de Asignaturas con Mayor Índice de Riesgo | M9: Mapas de Calor | Dirección General / Coordinación | Deseable |
| **RF-52** | Tablero de Control Ejecutivo de Indicadores Clave para Dirección | M10: Monitoreo y Dashboards | Dirección General | Esencial |
| **RF-53** | Tablero de Control Curricular y Cumplimiento para Coordinación | M10: Monitoreo y Dashboards | Coordinación Académica | Esencial |
| **RF-54** | Tablero de Resumen Pedagógico y Clases Diarias para el Docente | M10: Monitoreo y Dashboards | Docentes Nombrados y Contratados | Esencial |
| **RF-55** | Tablero de Resumen de Situación Escolar para el Estudiante | M10: Monitoreo y Dashboards | Estudiantes del Plantel | Esencial |
| **RF-56** | Ficha Integral y Radiografía Escolar 360° del Estudiante en 1 Clic | M10: Monitoreo y Dashboards | Dirección / Coordinación / Tutores | Esencial |
| **RF-57** | Tablero de Seguimiento, Impacto y Acreditación del SSU (IS-480) | M10: Monitoreo y Dashboards | Tutor SSU - UNSCH / Líder Proyecto | Esencial |
| **RF-58** | Generación Automatizada de Alertas de Deserción y Repitencia | M10: Monitoreo y Dashboards | Coordinación Académica / Tutores | Esencial |
| **RF-59** | Emisión Oficial de Boletas de Información Escolar / Libretas en PDF | M11: Reportes Oficiales | Secretaría / Docentes / Alumnos | Esencial |
| **RF-60** | Verificación Pública Criptográfica de Documentos con Código QR | M11: Reportes Oficiales | Comunidad / Entidades Externas | Esencial |
| **RF-61** | Generación del Cuadro de Mérito y Puestos de Honor Institucionales | M11: Reportes Oficiales | Dirección General / Coordinación | Deseable |
| **RF-62** | Emisión y Descarga del Registro Auxiliar Oficial y Actas Finales | M11: Reportes Oficiales | Docentes / Secretaría Académica | Esencial |
| **RF-63** | Reportes Consolidados de Asistencia Multiactor del Plantel | M11: Reportes Oficiales | Dirección / Coordinación / Secretaría | Deseable |
| **RF-64** | Exportación de Datos en Formatos Estándar Abiertos (PDF y Excel) | M11: Reportes Oficiales | Toda la comunidad autorizada | Esencial |
| **RF-65** | Registro Inmutable de Auditoría de Accesos y Eventos de Seguridad | M12: Auditoría y Seguridad | Administrador TI / Dirección | Esencial |
| **RF-66** | Trazabilidad Histórica de Modificaciones en Notas y Asistencias | M12: Auditoría y Seguridad | Administrador TI / Dirección / Coord. | Esencial |
| **RF-67** | Módulo de Búsqueda y Monitoreo de Bitácoras de Auditoría | M12: Auditoría y Seguridad | Administrador TI / Dirección | Deseable |
| **RF-68** | Cumplimiento y Protección de Datos Personales (Ley N.° 29733) | M12: Auditoría y Seguridad | Toda la comunidad escolar | Esencial |
| **RF-69** | Cartelera Digital y Publicación de Comunicados Institucionales | M13: Difusión Digital | Dirección / Toda la comunidad | Deseable |
| **RF-70** | Publicación y Consulta del Calendario Cívico y Escolar Interactivo | M13: Difusión Digital | Toda la comunidad escolar | Deseable |
| **RF-71** | Portal Informativo Institucional y Normas de Convivencia Escolar | M13: Difusión Digital | Toda la comunidad y público general | Opcional |

---

## 3. ESPECIFICACIÓN DETALLADA DE LOS REQUISITOS DE INNOVACIÓN Y VALOR AGREGADO

*(Para consultar los requisitos RF-01 al RF-24 y RF-27 al RF-36 base, refiérase a la sección general; a continuación se detalla formalmente la especificación prescriptiva de las nuevas capacidades incorporadas transversalmente en el sistema)*:

```
========================================================================================
AMPLIACIÓN MÓDULO 5: CONTROL DE ASISTENCIA Y PORTERÍA INTELIGENTE
========================================================================================
```

### RF-25: Kiosco de Portería Resiliente con Modo Desconectado (Offline-First) y Sincronización Automática
- **Enunciado Normativo:** El sistema deberá permitir al personal de portería ("Wachiman") registrar ingresos y salidas escolares de manera ininterrumpida aun cuando se presenten micro-cortes, caídas totales o intermitencias en la conexión a internet. El sistema deberá almacenar los eventos de marcación con su marca de tiempo exacta de manera local y encriptada en el dispositivo cliente, y deberá sincronizarlos de forma desatendida y automática con el servidor central apenas se restablezca la conectividad.
- **Precondiciones:** Dispositivo de portería (PC o tableta) con la aplicación web abierta en el navegador.
- **Entradas:** Lectura de DNI o código QR del estudiante mediante escáner o teclado físico durante una pérdida de conexión.
- **Proceso / Comportamiento:**
  1. El sistema detecta la pérdida de enlace con el servidor mediante monitoreo activo de red.
  2. Almacena el evento de entrada en la base de datos local del cliente (`IndexedDB` / almacenamiento seguro local) registrando: DNI, fecha, hora local inalterada y estado preliminar.
  3. Proporciona retroalimentación inmediata visual y sonora al portero ("Guardado Local").
  4. Al detectar la reconexión a internet, despacha en segundo plano la cola de eventos acumulados sin duplicar registros ni bloquear la interfaz de atención.
- **Salidas:** Mensaje informativo: *"Modo sin conexión: 14 marcas pendientes de envío"*; y confirmación: *"Sincronización completada exitosamente"* al volver la red.
- **Postcondiciones:** El récord diario de los alumnos se consolida en la base de datos central sin pérdida de información ni demoras en la puerta.
- **Criterio de Aceptación:** El portero puede registrar 50 ingresos seguidos con el cable de red desconectado y todos los registros se sincronizan íntegros y exactos en el servidor al reconectar.

---

### RF-26: Generación y Emisión Masiva de Carnés Escolares con Código QR / Código de Barras
- **Enunciado Normativo:** El sistema deberá permitir al personal de secretaría y dirección generar de forma automatizada pliegos de carnés escolares en formato PDF estándar A4 listos para impresión y enmicado, incluyendo para cada estudiante: fotografía oficial, nombres completos, número de DNI, grado, sección, año escolar y un código QR / código de barras unívoco de alta legibilidad para el escáner de portería.
- **Precondiciones:** Estudiantes con matrícula activa y asignación de sección consolidada.
- **Entradas:** Selección de grado y sección a emitir (ejemplo: "2° B de Secundaria").
- **Proceso / Comportamiento:**
  1. El sistema recupera la nómina de estudiantes matriculados.
  2. Genera para cada alumno su código identificador en formato QR o Code-128 con protocolo seguro.
  3. Maqueta los carnés organizados en cuadrículas de 8 o 10 unidades por hoja A4 con marcas de corte y membrete oficial del plantel.
- **Salidas:** Archivo PDF descargable e imprimible de alta resolución.
- **Postcondiciones:** Documento listo para entrega física a los estudiantes al inicio del año lectivo.
- **Criterio de Aceptación:** Los códigos QR impresos son leídos por el escáner del módulo de portería en menos de 0.5 segundos a una distancia de 15 cm.

---

### RF-27: Toma Rápida de Asistencia en Aula mediante Aplicación Móvil/Web y Difusión en Tiempo Real vía WebSockets
- **Enunciado Normativo:** El sistema deberá proporcionar una interfaz de usuario optimizada para teléfonos móviles y tabletas que permita a los docentes y auxiliares pasar lista en el aula mediante toques táctiles ultra-rápidos (*"Fast-Tap"*), alternando el estado de cada estudiante (*Presente* $\rightarrow$ *Tardanza* $\rightarrow$ *Falta Injustificada*) con retroalimentación inmediata, y emitiendo los cambios al servidor en tiempo real. El sistema deberá difundir dichos eventos vía WebSockets / SSE a los tableros de supervisión de Dirección y Coordinación en un tiempo no mayor a 500 ms, permitiendo monitorear en vivo la asistencia de todo el plantel sin recargar pantallas.
- **Precondiciones:** Docente autenticado desde dispositivo móvil o navegador de aula con sesión activa.
- **Entradas:** Toques táctiles en la tarjeta del estudiante o escaneo con cámara móvil.
- **Proceso / Comportamiento:**
  1. La interfaz despliega la nómina del aula con estado por defecto "Todos Presentes".
  2. El docente toca sobre los estudiantes que registran inasistencia o tardanza.
  3. Al pulsar "Confirmar Asistencia", el cliente envía el paquete al endpoint `POST /api/v1/attendance/classroom/live-batch`.
  4. El servidor persiste la transacción y emite un broadcast por el canal WebSocket `institution:{tenant_id}:attendance`.
  5. Los tableros directivos reciben el payload y actualizan instantáneamente los medidores de puntualidad y ausentismo del turno.
- **Salidas:** Pantalla de confirmación háptica en móvil y actualización en vivo en tableros directivos.
- **Postcondiciones:** Asistencia consolidada en base de datos central y visible para todos los roles autorizados en tiempo real.
- **Criterio de Aceptación:** Registro completo de un aula de 35 estudiantes en menos de 15 segundos y propagación del evento a la Dirección en menos de 500 ms.

---

```
========================================================================================
AMPLIACIÓN MÓDULO 8: CALIFICACIONES DE ALTA VELOCIDAD Y ASISTENCIA PEDAGÓGICA
========================================================================================
```

### RF-38: Planilla Ágil de Notas en Modo Matriz Rápida ("Modo Hoja de Cálculo / Excel")
- **Enunciado Normativo:** El sistema deberá proporcionar a los docentes una interfaz de ingreso de calificaciones optimizada para digitación rápida con el teclado físico, permitiendo desplazarse entre celdas mediante las teclas de dirección (flechas ↑, ↓, ←, →), avanzar al siguiente alumno con la tecla *Enter*, autoguardar cambios al perder el foco y admitir la operación de pegado masivo desde el portapapeles (copiar una columna de notas desde Excel y pegarla directamente en la planilla web).
- **Precondiciones:** Docente autenticado en la planilla de calificaciones de su curso asignado.
- **Entradas:** Calificaciones numéricas o cualitativas digitadas con teclado o pegadas desde el portapapeles del sistema operativo (`Ctrl + V`).
- **Proceso / Comportamiento:**
  1. La matriz intercepta los eventos de teclado físico para permitir la navegación fluida idéntica a una hoja de cálculo de escritorio.
  2. Al pegar datos, parsea la columna de texto, valida que los valores correspondan al orden alfabético de los estudiantes y a la escala permitida.
  3. Resalta en color verde las notas válidas y en rojo las celdas con valores erróneos, previniendo el guardado de datos inválidos.
  4. Realiza el guardado asíncrono sin recargar la pantalla.
- **Salidas:** Planilla completa llenada en segundos con confirmación visual de guardado.
- **Postcondiciones:** Calificaciones guardadas en la base de datos y promedios recalculados de inmediato.
- **Criterio de Aceptación:** El docente puede llenar las notas de una sección de 35 estudiantes en menos de 1 minuto mediante navegación con teclado o pegado directo.

---

### RF-39: Asistente de Conclusiones Descriptivas Sugeridas por Nivel de Logro (MINEDU)
- **Enunciado Normativo:** El sistema deberá integrar un catálogo pedagógico de conclusiones descriptivas estándar sugeridas para la evaluación formativa y cualitativa (escala literal AD, A, B, C), permitiendo al docente seleccionar con un solo clic una frase pedagógica contextualizada a la competencia curricular evaluada y editarla o personalizarla para el estudiante según corresponda.
- **Precondiciones:** Curso con escala cualitativa y competencias parametrizadas.
- **Entradas:** Selección del nivel de logro del alumno (ejemplo: "B - En Proceso") y clic en "Sugerir Conclusión Descriptiva".
- **Proceso / Comportamiento:**
  1. El sistema filtra las frases pedagógicas oficiales almacenadas para esa competencia y ese nivel de logro.
  2. Despliega un menú flotante con 3 a 5 alternativas pedagógicas normadas.
  3. Al seleccionar una alternativa, la inserta en el campo de texto de la libreta, permitiendo al docente añadir comentarios específicos si lo desea.
- **Salidas:** Conclusión descriptiva formal completada en la boleta del estudiante.
- **Postcondiciones:** Reducción drástica del tiempo de digitación de informes cualitativos por aula.
- **Criterio de Aceptación:** Ahorro comprobado de más del 70% en el tiempo de llenado de conclusiones formativas en los niveles de primaria y primeros grados de secundaria.

---

### RF-45: Asistencia Conectada de Llenado Eficiente con Auto-Guardado en Segundo Plano y Sincronización Automática de Evaluaciones
- **Enunciado Normativo:** El sistema deberá incorporar un motor reactivo de asistencia de llenado que guarde automáticamente las notas en segundo plano (debounce de 400 ms) tras cada edición del docente, prescindiendo del clic repetitivo en botones manuales de guardado y evitando la pérdida accidental de datos por cortes de fluido eléctrico o desconexión fortuita. Asimismo, el sistema deberá mantener conectadas las evaluaciones parciales, tareas y rúbricas con las competencias oficiales, jalando y consolidando de manera automática el promedio de periodo en cascada en tiempo real.
- **Precondiciones:** Docente autenticado con planilla de evaluación abierta.
- **Entradas:** Modificación de cualquier celda de evaluación o rúbrica.
- **Proceso / Comportamiento:**
  1. El sistema detecta el cambio en la celda y activa un temporizador de debounce (400 ms).
  2. Al cesar el tipeo, envía silenciosamente un requerimiento PATCH al backend (`/api/v1/grades/auto-save`).
  3. Muestra un indicador sutil de estado (spinner $\rightarrow$ check verde "Guardado").
  4. El backend computa en cascada los promedios ponderados de la competencia curricular y actualiza las columnas consolidadas automáticamente.
- **Salidas:** Celda confirmada, indicador de auto-guardado en verde y promedios consolidados recalculados.
- **Postcondiciones:** Información persistida íntegramente en base de datos relacional y cero pérdida de notas ante cierres de ventana.
- **Criterio de Aceptación:** Guardado asíncrono comprobado en menos de 300 ms sin interrupción de la digitación del docente.

---

### RF-46: Motor de Conversión y Escala Dual Automatizada de Calificaciones Numéricas (0 a 20) a Escala Cualitativa Literal CNEB (AD, A, B, C)
- **Enunciado Normativo:** El sistema deberá integrar un motor de conversión automática que permita a los docentes digitar o importar notas en la escala vigesimal tradicional (de 0 a 20 puntos) o puntajes de rúbricas, y el sistema automáticamente jalará, calculará y transformará el valor ingresado a la escala cualitativa oficial exigida por el Currículo Nacional de la Educación Básica (CNEB - MINEDU):
  - **AD (Logro Destacado):** 18 a 20 puntos.
  - **A (Logro Esperado):** 14 a 17 puntos.
  - **B (En Proceso):** 11 a 13 puntos.
  - **C (En Inicio):** 00 a 10 puntos.
  El sistema deberá desplegar una visualización en **"Escala Dual"**, exhibiendo de manera simultánea la cifra numérica y la letra oficial asignada con su respectivo color distintivo (AD azul, A verde, B amarillo, C rojo). El sistema permitirá la entrada tanto en números (con autoconversión a letras) como directamente en letras (validando los niveles permitidos), y permitirá a la Coordinación Académica personalizar los umbrales de corte por nivel educativo.
- **Precondiciones:** Periodo académico activo y escala dual configurada en la institución.
- **Entradas:** Digitación de un valor numérico entre 0 y 20 o pegado de columnas de notas vigesimales.
- **Proceso / Comportamiento:**
  1. El docente ingresa un puntaje numérico (ejemplo: `15`).
  2. El motor de equivalencias evalúa los umbrales paramétricos y asigna de inmediato el valor cualitativo `A`.
  3. La celda muestra en pantalla la letra `A` con fondo verde claro y una pequeña etiqueta indicando `(15)`.
  4. El sistema almacena ambos valores en la base de datos: el valor numérico para análisis estadístico interno y el valor literal para actas y boletas oficiales del MINEDU.
- **Salidas:** Calificación asentada en escala cualitativa con respaldo cuantitativo.
- **Postcondiciones:** Generación de boletas oficiales en letras sin que el docente tenga que realizar conversiones manuales.
- **Criterio de Aceptación:** Conversión 100% precisa e instantánea sin retrasos en la interfaz y correspondencia exacta con las directivas del CNEB.

---

```
========================================================================================
AMPLIACIÓN MÓDULO 9: MAPAS DE CALOR ANALÍTICOS Y PROFUNDIZACIÓN PEDAGÓGICA
========================================================================================
```

### RF-49: Mapas de Calor Interactivos con Navegación a Detalle (Drill-Down)
- **Enunciado Normativo:** El sistema deberá permitir a los directivos y coordinadores académicos realizar una navegación analítica a profundidad (*Drill-Down*) sobre los mapas de calor, de modo que al hacer clic en cualquier celda o indicador de alerta roja/amarilla (área crítica), el sistema despliegue una vista lateral o modal que desglosa el rendimiento por competencias específicas, evaluaciones parciales reprobadas y el historial de asistencia del alumno o sección analizada.
- **Precondiciones:** Mapa de calor de rendimiento o asistencia generado en pantalla.
- **Entradas:** Clic del usuario sobre una celda o asignatura en el mapa de calor.
- **Proceso / Comportamiento:**
  1. El sistema captura la coordenada de la celda (Estudiante + Curso, o Sección + Curso).
  2. Consulta de forma instantánea el desglose curricular de calificaciones parciales.
  3. Despliega un panel lateral con gráficos de barras de las competencias y el listado de evaluaciones donde se originó el bajo rendimiento.
- **Salidas:** Panel de diagnóstico pedagógico pormenorizado en pantalla.
- **Postcondiciones:** El Coordinador Académico cuenta con evidencia fehaciente para programar tutorías o retroalimentar al docente de aula.
- **Criterio de Aceptación:** Despliegue del análisis detallado en menos de 1 segundo tras el clic en la celda.

---

```
========================================================================================
AMPLIACIÓN MÓDULO 10: RADIOGRAFÍA 360° Y TABLERO DE IMPACTO SSU (IS-480)
========================================================================================
```

### RF-56: Ficha Integral y Radiografía Escolar 360° del Estudiante en 1 Clic
- **Enunciado Normativo:** El sistema deberá proporcionar a la Dirección General, Coordinación Académica y Tutores una vista unificada denominada "Ficha 360° del Estudiante", que consolide en una única pantalla de alta legibilidad toda la información crítica del menor: fotografía y contacto, gráfico evolutivo de notas a lo largo de los bimestres, semáforo de asistencia y puntualidad del mes, mini mapa de calor de sus competencias y el listado de alertas de riesgo activas.
- **Precondiciones:** Estudiante matriculado con registros en el año escolar vigente.
- **Entradas:** Selección de un estudiante desde cualquier listado o búsqueda rápida por DNI/apellidos.
- **Proceso / Comportamiento:**
  1. Compila en una sola consulta relacional la situación académica, disciplinaria y de asistencia del alumno.
  2. Genera tarjetas ejecutivas con semaforización de estado y gráficos de progreso temporal.
  3. Permite descargar la radiografía en una sola hoja PDF para entrevistas con los padres de familia o apoderados.
- **Salidas:** Panel interactivo 360° desplegado y opción de exportación en PDF.
- **Postcondiciones:** Diagnóstico inmediato y holístico de la situación escolar del alumno.
- **Criterio de Aceptación:** Despliegue de la ficha completa con todos sus gráficos en menos de 1.5 segundos.

---

### RF-57: Tablero de Seguimiento, Impacto y Acreditación del Servicio Social Universitario (SSU - IS-480)
- **Enunciado Normativo:** El sistema deberá incorporar un módulo de seguimiento institucional orientado a la supervisión del Servicio Social Universitario para el Docente Tutor de la UNSCH y la Comisión Académica de la EPIS, mostrando en tiempo real los indicadores de impacto y cumplimiento del proyecto: porcentaje de adopción de la plataforma en el colegio (meta ≥ 80%), horas de trabajo administrativo ahorradas, actas digitales generadas y el registro cronológico del cumplimiento de las 96 horas de servicio de los 5 integrantes del equipo ejecutor.
- **Precondiciones:** Proyecto en ejecución en el semestre 2026-II.
- **Entradas:** Acceso al módulo "Métricas SSU IS-480" mediante credenciales de supervisión universitaria.
- **Proceso / Comportamiento:**
  1. Procesa las bitácoras de uso, registros generados y tiempos de respuesta del sistema frente a los procesos manuales anteriores.
  2. Muestra los indicadores contractuales fijados en el Plan de Trabajo (KPI-1 al KPI-5).
  3. Genera automáticamente los reportes periódicos de avance y el borrador de acta de transferencia tecnológica requerida para la sustentación.
- **Salidas:** Tablero de impacto social y reporte consolidado para la sustentación final del SSU.
- **Postcondiciones:** Evidencia objetiva para la calificación final y cierre formal de la asignatura IS-480.
- **Criterio de Aceptación:** Cálculo automático de métricas de impacto que sustenta objetivamente el cumplimiento de las metas del proyecto.

---

```
========================================================================================
AMPLIACIÓN MÓDULO 11: SEGURIDAD Y VERIFICACIÓN DOCUMENTAL CRIPTOGRÁFICA
========================================================================================
```

### RF-60: Verificación Pública Criptográfica de Documentos Escolares mediante Código QR
- **Enunciado Normativo:** El sistema deberá incrustar en el pie de página de todas las Boletas de Calificaciones, Certificados y Constancias Oficiales de Notas emitidas en PDF un código QR único vinculado a un sello de firma criptográfica (hash SHA-256 inmutable), de tal modo que cualquier usuario externo o institución pueda escanear el papel impreso con la cámara de su teléfono móvil y verificar en una página pública del colegio si el documento es auténtico y coincide exactamente con las calificaciones oficiales registradas en el sistema.
- **Precondiciones:** Documento oficial generado y registrado en el repositorio institucional.
- **Entradas:** Escaneo del código QR impreso en la boleta desde cualquier dispositivo móvil con navegador web.
- **Proceso / Comportamiento:**
  1. El QR redirige a la URL pública: `https://planteles.unsch.edu.pe/verificar?doc=<codigoHash>`.
  2. El sistema valida el hash criptográfico contra la base de datos.
  3. Despliega una pantalla oficial con fondo verde de autenticidad: muestra el nombre del estudiante, grado, fecha de emisión, promedio oficial y la leyenda: *"Documento Oficial Auténtico expedido por los Planteles de Aplicación de la UNSCH"*.
  4. Si el documento fue alterado físicamente o el código no existe, emite pantalla roja de advertencia: *"Documento no válido o no registrado"*.
- **Salidas:** Pantalla pública de certificación y validación de autenticidad documental.
- **Postcondiciones:** Erradicación total de falsificaciones o adulteraciones manuales de libretas escolares.
- **Criterio de Aceptación:** Verificación instantánea sin requerir que el verificador externo tenga una cuenta o inicie sesión en el sistema.

---

## 4. MATRIZ DE TRAZABILIDAD DOCUMENTAL EXPANDIDA (RF-01 AL RF-71)

| ID Fase II | Nombre Oficial del Requisito Funcional | Módulo | Actor Primario | Prioridad | Carácter de Innovación |
|:---:|---|:---:|---|:---:|:---:|
| `RF-01` a `RF-04` | Seguridad, Autenticación JWT y RBAC | M1 | Toda la comunidad | Esencial | Seguridad y Privacidad |
| `RF-05` a `RF-09` | Administración de Usuarios y Directorio | M2 | Administración / Dirección | Esencial | Control de Personal |
| `RF-10` a `RF-14` | Configuración Escolar, Periodos y Escalas | M3 | Coordinación / Dirección | Esencial | Parametrización |
| `RF-15` a `RF-19` | Padrón Estudiantil, Matrícula y Carga Lectiva | M4 | Secretaría / Docentes | Esencial | Gestión Escolar |
| `RF-20` a `RF-24` | Control de Asistencia Diaria y Alertas | M5 | Docentes / Coordinación | Esencial | Seguimiento Escolar |
| **`RF-25`** | **Kiosco de Portería Resiliente Offline-First** | **M5** | **Portería ("Wachiman")** | **Esencial** | **Innovación Operativa** |
| **`RF-26`** | **Generación Masiva de Carnés Escolares QR** | **M5** | **Secretaría / Portería** | **Deseable** | **Digitalización Física** |
| **`RF-27`** | **Toma Rápida en App Móvil y Difusión en Tiempo Real** | **M5** | **Docentes / Auxiliares / Dirección** | **Esencial** | **Tiempo Real / WebSockets** |
| `RF-28` a `RF-31` | Asistencia y Fichas de Practicantes | M6 | Practicantes / EPIS | Esencial | Convenio UNSCH |
| `RF-32` a `RF-35` | Asistencia y Cumplimiento Docente Contratado| M7 | Docentes Contratados | Esencial | Sustento Laboral |
| `RF-36` a `RF-37` | Rúbricas y Registro en Tiempo Real | M8 | Docentes Titulares | Esencial | Flujo en Vivo |
| **`RF-38`** | **Planilla Rápida de Notas ("Modo Excel")** | **M8** | **Docentes del Plantel** | **Esencial** | **Alta Usabilidad UX** |
| **`RF-39`** | **Asistente de Conclusiones Descriptivas** | **M8** | **Docentes Titulares** | **Deseable** | **Eficiencia Pedagógica** |
| `RF-40` a `RF-44` | Practicantes, Promedios, Cierre y Consulta | M8 | Docentes / Alumnos | Esencial | Control de Notas |
| **`RF-45`** | **Llenado Asistido con Auto-Guardado y Conexión Automática** | **M8** | **Docentes / Coordinación** | **Esencial** | **Productividad y Conexión** |
| **`RF-46`** | **Motor Conversión Escala Vigesimal (0-20) a CNEB (AD, A, B, C)** | **M8** | **Docentes / Dirección** | **Esencial** | **Escala Dual Automatizada** |
| `RF-47` a `RF-48` | Mapas de Calor de Rendimiento y Asistencia | M9 | Dirección / Coordinación | Esencial | Analítica Visual |
| **`RF-49`** | **Mapas de Calor con Navegación Drill-Down** | **M9** | **Coordinación / Dirección**| **Esencial** | **Diagnóstico Profundo** |
| `RF-50` a `RF-51` | Comparativas entre Secciones y Riesgo | M9 | Dirección General | Deseable | Macro-Diagnóstico |
| `RF-52` a `RF-55` | Dashboards para Directivos, Docentes y Alumnos | M10 | Todos los estamentos | Esencial | Monitoreo Operativo |
| **`RF-56`** | **Ficha Integral y Radiografía Escolar 360°** | **M10** | **Tutores / Directivos** | **Esencial** | **Visión Holística** |
| **`RF-57`** | **Tablero de Impacto y Acreditación SSU** | **M10** | **Tutor SSU / Comisión** | **Esencial** | **Acreditación IS-480** |
| `RF-58` | Alertas Automatizadas de Deserción Escolar | M10 | Coordinación / Tutores | Esencial | Prevención Temprana |
| `RF-59` | Boletas de Calificaciones Oficiales PDF | M11 | Secretaría / Alumnos | Esencial | Documento Oficial |
| **`RF-60`** | **Verificación Pública Criptográfica QR** | **M11** | **Público / Entidades** | **Esencial** | **Anti-Falsificación** |
| `RF-61` a `RF-64` | Cuadro de Mérito, Actas y Exportación Excel | M11 | Secretaría / Dirección | Esencial | Gestión Documental |
| `RF-65` a `RF-68` | Auditoría Inmutable y Ley N.° 29733 | M12 | Administrador / Legal | Esencial | Seguridad Jurídica |
| `RF-69` a `RF-71` | Cartelera, Calendario Cívico y Portal Web | M13 | Toda la comunidad | Deseable | Difusión Digital |

