# CATÁLOGO Y ESPECIFICACIÓN DOCUMENTAL DE REQUISITOS FUNCIONALES (RF)

## TÍTULO DEL PROYECTO
**DESARROLLO E IMPLEMENTACIÓN DE UNA PLATAFORMA WEB PARA LA GESTIÓN ACADÉMICA E INFORMACIÓN INSTITUCIONAL EN LOS PLANTELES DE APLICACIÓN DE LA UNSCH**

- **Institución Beneficiaria:** Planteles de Aplicación "Guamán Poma de Ayala" – UNSCH (Ayacucho, Perú)
- **Marco Académico:** Servicio Social Universitario (IS-480) – Escuela Profesional de Ingeniería de Sistemas (EPIS-UNSCH)
- **Fase del Proyecto:** Fase II – Diseño y Desarrollo de Software
- **Documento:** Especificación Documental de Requisitos Funcionales del Software (Estándar IEEE 830 / ISO 29148)
- **Fuente de Entrada:** Ficha de Diagnóstico, Delimitaciones, Limitaciones, Metadatos, Matriz de Stakeholders y Requerimientos Fase I.

---

## 1. INTRODUCCIÓN Y MARCO NORMATIVO

El presente documento constituye la **Especificación Documental de los Requisitos Funcionales (RF)** del software en la **Fase II (Diseño y Desarrollo)**. A diferencia de las necesidades preliminares de usuario levantadas en la Fase I, este catálogo formaliza los requisitos como **enunciados normativos y contractuales de ingeniería de software** (utilizando la convención formal de obligatoriedad: *"El sistema deberá..."*), estableciendo de manera inequívoca las capacidades operativas, precondiciones, flujos documentales, postcondiciones y criterios de verificación que la plataforma web brindará a la comunidad educativa de los Planteles de Aplicación de la UNSCH.

### 1.1 Criterios Documentales Aplicados
- **Trazabilidad:** Cada requisito funcional formal mantiene correspondencia directa con los módulos operativos institucionales y las partes interesadas (Stakeholders).
- **Literalidad y Claridad:** Redacción explícita sin ambigüedades, orientada a procesos escolares y administrativos.
- **Verificabilidad:** Todo requisito posee criterios de aceptación objetivos y comprobables mediante pruebas funcionales (UAT y QA).
- **Conformidad con el Alcance:** Respeta estrictamente los límites del piloto (exclusión de procesos contables, pagos, planillas, aplicaciones nativas o inteligencia artificial predictiva).

---

## 2. TABLA MAESTRA Y LISTA ESTRUCTURADA DE REQUISITOS FUNCIONALES

| ID Requisito | Denominación Oficial del Requisito Funcional | Módulo de Trabajo | Actor Principal | Prioridad |
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
| **RF-25** | Registro Diario de Jornada y Permanencia de Practicantes | M6: Practicantes | Practicantes de Educación | Esencial |
| **RF-26** | Cómputo Acumulado de Horas Efectivas de Prácticas Universitarias | M6: Practicantes | Practicantes / Coordinación / EPIS | Esencial |
| **RF-27** | Conformidad y Validación Periódica de Horas por el Docente Tutor | M6: Practicantes | Docentes Tutores / Coordinación | Esencial |
| **RF-28** | Emisión de Fichas Oficiales de Prácticas para la UNSCH | M6: Practicantes | Coordinación Académica / Practicantes| Deseable |
| **RF-29** | Registro y Marcación de Horas Lectivas de Docentes Contratados | M7: Docentes Contratados | Docentes Contratados / Coordinación | Esencial |
| **RF-30** | Registro de Justificaciones y Reprogramación de Clases Docentes | M7: Docentes Contratados | Docentes Contratados / Coordinación | Deseable |
| **RF-31** | Consolidación Mensual de Cumplimiento de Horas Lectivas Dictadas | M7: Docentes Contratados | Coordinación / Secretaría / Dirección | Esencial |
| **RF-32** | Supervisión y Monitoreo de Cobertura y Puntualidad de Clases | M7: Docentes Contratados | Coordinación Académica | Deseable |
| **RF-33** | Parametrización de Rúbricas y Evaluaciones por Asignatura | M8: Calificaciones | Docentes Titulares del Curso | Esencial |
| **RF-34** | Ingreso, Edición y Publicación de Calificaciones en Tiempo Real | M8: Calificaciones | Docentes Titulares del Curso | Esencial |
| **RF-35** | Colaboración Supervisada de Practicantes en el Registro de Notas | M8: Calificaciones | Practicantes / Docentes Tutores | Deseable |
| **RF-36** | Cálculo Automatizado de Promedios Parciales, Bimestrales y Finales | M8: Calificaciones | Sistema / Coordinación Académica | Esencial |
| **RF-37** | Cierre Oficial de Periodo Académico y Bloqueo de Modificación | M8: Calificaciones | Coordinación / Dirección General | Esencial |
| **RF-38** | Flujo Extraordinario de Solicitud y Aprobación de Rectificación | M8: Calificaciones | Docentes / Coordinación / Dirección | Deseable |
| **RF-39** | Consulta Inmediata y Transparente de Calificaciones para Estudiantes | M8: Calificaciones | Estudiantes del Plantel | Esencial |
| **RF-40** | Generación de Mapa de Calor de Rendimiento Académico por Sección | M9: Mapas de Calor | Dirección / Coordinación / Docentes | Esencial |
| **RF-41** | Generación de Mapa de Calor de Asistencia y Puntualidad | M9: Mapas de Calor | Dirección / Coordinación / Auxiliares | Esencial |
| **RF-42** | Análisis Gráfico Comparativo de Rendimiento entre Secciones | M9: Mapas de Calor | Coordinación Académica / Dirección | Deseable |
| **RF-43** | Detección Visual de Asignaturas con Mayor Índice de Riesgo | M9: Mapas de Calor | Dirección General / Coordinación | Deseable |
| **RF-44** | Tablero de Control Ejecutivo de Indicadores Clave para Dirección | M10: Monitoreo y Dashboards | Dirección General | Esencial |
| **RF-45** | Tablero de Control Curricular y Cumplimiento para Coordinación | M10: Monitoreo y Dashboards | Coordinación Académica | Esencial |
| **RF-46** | Tablero de Resumen Pedagógico y Clases Diarias para el Docente | M10: Monitoreo y Dashboards | Docentes Nombrados y Contratados | Esencial |
| **RF-47** | Tablero de Resumen de Situación Escolar para el Estudiante | M10: Monitoreo y Dashboards | Estudiantes del Plantel | Esencial |
| **RF-48** | Generación Automatizada de Alertas de Deserción y Repitencia | M10: Monitoreo y Dashboards | Coordinación Académica / Tutores | Esencial |
| **RF-49** | Emisión Oficial de Boletas de Información Escolar / Libretas en PDF | M11: Reportes Oficiales | Secretaría / Docentes / Alumnos | Esencial |
| **RF-50** | Generación del Cuadro de Mérito y Puestos de Honor Institucionales | M11: Reportes Oficiales | Dirección General / Coordinación | Deseable |
| **RF-51** | Emisión y Descarga del Registro Auxiliar Oficial y Actas Finales | M11: Reportes Oficiales | Docentes / Secretaría Académica | Esencial |
| **RF-52** | Reportes Consolidados de Asistencia Multiactor del Plantel | M11: Reportes Oficiales | Dirección / Coordinación / Secretaría | Deseable |
| **RF-53** | Exportación de Datos en Formatos Estándar Abiertos (PDF y Excel) | M11: Reportes Oficiales | Toda la comunidad autorizada | Esencial |
| **RF-54** | Registro Inmutable de Auditoría de Accesos y Eventos de Seguridad | M12: Auditoría y Seguridad | Administrador TI / Dirección | Esencial |
| **RF-55** | Trazabilidad Histórica de Modificaciones en Notas y Asistencias | M12: Auditoría y Seguridad | Administrador TI / Dirección / Coord. | Esencial |
| **RF-56** | Módulo de Búsqueda y Monitoreo de Bitácoras de Auditoría | M12: Auditoría y Seguridad | Administrador TI / Dirección | Deseable |
| **RF-57** | Cumplimiento y Protección de Datos Personales (Ley N.° 29733) | M12: Auditoría y Seguridad | Toda la comunidad escolar | Esencial |
| **RF-58** | Cartelera Digital y Publicación de Comunicados Institucionales | M13: Difusión Digital | Dirección / Toda la comunidad | Deseable |
| **RF-59** | Publicación y Consulta del Calendario Cívico y Escolar Interactivo | M13: Difusión Digital | Toda la comunidad escolar | Deseable |
| **RF-60** | Portal Informativo Institucional y Normas de Convivencia Escolar | M13: Difusión Digital | Toda la comunidad y público general | Opcional |

---

## 3. ESPECIFICACIÓN DETALLADA DE REQUISITOS FUNCIONALES POR MÓDULO

```
========================================================================================
MÓDULO 1: CONTROL DE ACCESO, AUTENTICACIÓN Y GESTIÓN DE SESIONES
========================================================================================
```

### RF-01: Autenticación Segura de Usuarios mediante Credenciales Institucionales
- **Enunciado Normativo:** El sistema deberá autenticar a los usuarios institucionales (Directivos, Coordinadores, Docentes, Practicantes, Estudiantes, Personal de Portería y Administradores) mediante la validación de su documento de identidad (DNI) o correo electrónico institucional y su respectiva contraseña secreta.
- **Precondiciones:** El usuario debe encontrarse previamente registrado en la base de datos institucional y su estado debe ser "Activo".
- **Entradas:** Número de DNI (8 dígitos) o correo institucional, y contraseña de acceso.
- **Proceso / Comportamiento:**
  1. El sistema valida el formato de los datos ingresados.
  2. Verifica la existencia de la cuenta y comprueba que no se encuentre bloqueada por intentos fallidos.
  3. Realiza la comparación criptográfica de la contraseña.
  4. Si es válida, inicializa la sesión de usuario, carga sus privilegios y lo redirige a su panel principal.
  5. Si es inválida, contabiliza el fallo e informa mediante un mensaje genérico. Al tercer intento consecutivo erróneo, bloquea temporalmente la cuenta por 15 minutos.
- **Salidas:** Acceso al panel de trabajo del rol correspondiente y mensaje de bienvenida, o notificación de credenciales inválidas.
- **Postcondiciones:** Sesión de trabajo activa registrada en la bitácora del sistema.
- **Criterio de Aceptación:** Acceso concedido a usuarios legítimos en menos de 2 segundos y bloqueo estricto de accesos no autorizados.

---

### RF-02: Cierre de Sesión Seguro y Terminación Automática por Inactividad
- **Enunciado Normativo:** El sistema deberá permitir al usuario finalizar voluntariamente su sesión activa en cualquier momento, y deberá suspender y cerrar automáticamente la sesión tras 20 minutos de inactividad continua detectada en la interfaz del navegador web.
- **Precondiciones:** Usuario con sesión de trabajo autenticada.
- **Entradas:** Clic en "Cerrar Sesión" o detección de ausencia de eventos de usuario durante 20 minutos.
- **Proceso / Comportamiento:**
  1. El sistema invalida los identificadores de sesión activa.
  2. Limpia el estado de trabajo en memoria del cliente.
  3. Redirige a la pantalla pública de inicio de sesión impidiendo volver a pantallas previas mediante el historial del navegador.
- **Salidas:** Redirección a la pantalla de login con confirmación de sesión cerrada.
- **Postcondiciones:** Sesión revocada; ningún dato confidencial de notas o alumnos queda visible en pantalla.
- **Criterio de Aceptación:** Prohibición absoluta de consultar pantallas privadas pulsando el botón "Atrás" tras el cierre.

---

### RF-03: Restablecimiento Asistido de Contraseñas de Acceso
- **Enunciado Normativo:** El sistema deberá proporcionar un flujo de restablecimiento de contraseña mediante el envío de un enlace temporal de recuperación al correo registrado, y un mecanismo administrativo para que el Administrador TI o Coordinación restablezca credenciales a valores iniciales seguros en caso de contingencia.
- **Precondiciones:** La cuenta de usuario debe existir en el sistema.
- **Entradas:** DNI y correo electrónico registrado, o solicitud administrativa directa ante soporte.
- **Proceso / Comportamiento:**
  1. Valida los datos y genera un código de seguridad con vigencia de 30 minutos.
  2. Envía instrucciones seguras al correo institucional.
  3. Permite al usuario definir una nueva contraseña que cumpla los criterios mínimos de seguridad (8 caracteres, letras y números).
- **Salidas:** Notificación de confirmación y actualización de la credencial en el sistema.
- **Postcondiciones:** Antigua contraseña invalidada de forma permanente.
- **Criterio de Aceptación:** El usuario recupera su acceso de forma autónoma o con asistencia administrativa en menos de 3 minutos.

---

### RF-04: Control de Privilegios y Acceso Basado en Roles (RBAC)
- **Enunciado Normativo:** El sistema deberá restringir la visualización de menús, ejecución de operaciones de modificación y generación de reportes de acuerdo con el rol específico asignado a la cuenta (Principio de Privilegio Mínimo).
- **Precondiciones:** Usuario autenticado con rol vigente asignado.
- **Entradas:** Intento de acceso a un módulo o ejecución de una acción en la plataforma.
- **Proceso / Comportamiento:**
  1. El sistema evalúa si el rol del usuario posee la autorización requerida.
  2. Si cuenta con permiso, ejecuta la operación solicitada.
  3. Si carece de permiso, deniega la acción, emite un aviso de "Acceso Denegado" y asienta el evento de seguridad.
- **Salidas:** Interfaz contextualizada exclusivamente a las facultades del cargo del usuario.
- **Postcondiciones:** Se preserva la integridad de los datos de notas, matrículas y configuraciones.
- **Criterio de Aceptación:** Un estudiante jamás puede visualizar módulos docentes ni alterar registros; un docente no puede editar asignaturas ajenas.

---

```
========================================================================================
MÓDULO 2: ADMINISTRACIÓN DE USUARIOS Y DIRECTORIO INSTITUCIONAL
========================================================================================
```

### RF-05: Registro y Alta Formal de Cuentas de Personal Institucional
- **Enunciado Normativo:** El sistema deberá permitir al Administrador del Sistema y Dirección registrar a los integrantes del personal educativo y administrativo del plantel, asignando sus datos de identidad, condición laboral y rol institucional.
- **Precondiciones:** Usuario administrador autenticado.
- **Entradas:** DNI, nombres completos, apellidos, correo institucional, teléfono, condición (Nombrado, Contratado, Practicante, Portería) y rol asignado.
- **Proceso / Comportamiento:**
  1. Verifica que el DNI y correo no se encuentren previamente registrados en el plantel.
  2. Da de alta la cuenta con estado "Activo" y contraseña provisional de primer uso.
- **Salidas:** Ficha del trabajador creada y credenciales iniciales emitidas.
- **Postcondiciones:** Usuario habilitado para operar según su rol.
- **Criterio de Aceptación:** Imposibilidad de registrar dos usuarios con el mismo número de DNI.

---

### RF-06: Modificación de Datos y Baja Lógica de Usuarios del Plantel
- **Enunciado Normativo:** El sistema deberá permitir la actualización de datos informativos del personal y la deshabilitación del acceso mediante baja lógica (cambio a estado "Inactivo" o "Cesado"), preservando intacto todo su historial de calificaciones, asistencias y firmas en actas.
- **Precondiciones:** Registro de usuario existente.
- **Entradas:** Identificador del usuario, campos a editar o comando de desactivación con motivo justificado.
- **Proceso / Comportamiento:**
  1. Actualiza los datos informativos o cambia el estado de la cuenta a "Inactivo".
  2. Revoca de inmediato cualquier sesión activa del usuario desactivado.
  3. Bloquea todo intento de borrado físico si existen registros académicos vinculados.
- **Salidas:** Notificación de actualización o desactivación exitosa.
- **Postcondiciones:** Usuario deshabilitado para iniciar sesión; datos históricos conservados para auditoría.
- **Criterio de Aceptación:** Ninguna cuenta desactivada puede ingresar al sistema; no se pierde ningún registro histórico.

---

### RF-07: Reasignación Dinámica de Roles y Jerarquías del Personal
- **Enunciado Normativo:** El sistema deberá permitir reasignar el rol de un usuario activo cuando asuma nuevas responsabilidades institucionales (por ejemplo, docente que asume funciones de coordinación), actualizando sus permisos a partir de su siguiente inicio de sesión.
- **Precondiciones:** Usuario existente y autorización directiva.
- **Entradas:** Selección del nuevo rol y fecha de designación.
- **Proceso / Comportamiento:**
  1. Registra el cambio de rol en el legajo del usuario.
  2. Asienta el cambio en la bitácora de auditoría institucional.
- **Salidas:** Confirmación del cambio de privilegios asignados.
- **Postcondiciones:** El usuario opera con sus nuevas facultades en su próxima sesión.
- **Criterio de Aceptación:** Transición inmediata de permisos sin alterar las acciones pasadas registradas bajo su rol previo.

---

### RF-08: Directorio y Búsqueda Avanzada de Personal Institucional
- **Enunciado Normativo:** El sistema deberá proporcionar a la Dirección y Coordinación un directorio de búsqueda ágil de todo el personal del plantel, con filtros por apellidos, DNI, rol y estado.
- **Precondiciones:** Acceso con rol directivo o administrativo.
- **Entradas:** Criterios de texto libre o filtros estructurados de búsqueda.
- **Proceso / Comportamiento:** Realiza la búsqueda y presenta los resultados ordenados alfabéticamente en menos de 1 segundo.
- **Salidas:** Listado interactivo en pantalla con información de contacto y opción de descarga del padrón.
- **Postcondiciones:** Consulta completada sin alteración de datos.
- **Criterio de Aceptación:** Búsqueda exacta y por coincidencia parcial en la nómina del colegio.

---

### RF-09: Gestión de Perfil Personal y Actualización de Medios de Contacto
- **Enunciado Normativo:** El sistema deberá permitir a todo usuario consultar su información de perfil personal, actualizar su número telefónico y correo personal, y cambiar su contraseña de acceso institucional.
- **Precondiciones:** Usuario autenticado.
- **Entradas:** Contraseña actual, nueva contraseña y confirmación.
- **Proceso / Comportamiento:** Valida la contraseña actual, comprueba la solidez de la nueva y actualiza el registro.
- **Salidas:** Mensaje de confirmación de actualización exitosa.
- **Postcondiciones:** Nueva credencial vigente de forma inmediata.
- **Criterio de Aceptación:** Prohibición de cambio de contraseña sin suministrar la clave actual correcta.

---

```
========================================================================================
MÓDULO 3: CONFIGURACIÓN Y ESTRUCTURA ORGANIZACIONAL ESCOLAR
========================================================================================
```

### RF-10: Parametrización de Datos Institucionales del Plantel y Sedes
- **Enunciado Normativo:** El sistema deberá permitir registrar y actualizar los datos formales de los Planteles de Aplicación "Guamán Poma de Ayala" (nombre oficial, código modular, logotipo, autoridades, teléfono y dirección física), para su inclusión automática en membretes y reportes oficiales.
- **Precondiciones:** Acceso con rol de Administrador o Director General.
- **Entradas:** Datos institucionales y archivo de imagen del logotipo.
- **Proceso / Comportamiento:** Valida las dimensiones del logotipo y actualiza la ficha institucional del plantel.
- **Salidas:** Visualización del nuevo membrete y datos oficiales en toda la plataforma.
- **Postcondiciones:** Todos los reportes PDF emitidos a partir del guardado reflejan los nuevos datos institucionales.
- **Criterio de Aceptación:** Actualización consistente en el 100% de los documentos generados.

---

### RF-11: Apertura, Configuración y Cierre de Periodos Académicos
- **Enunciado Normativo:** El sistema deberá permitir configurar el año escolar activo y estructurar sus subdivisiones lectivas (bimestres o trimestres), estableciendo fechas de inicio, término y fecha límite obligatoria para la entrega de calificaciones docentes.
- **Precondiciones:** Rol directivo o coordinación académica.
- **Entradas:** Nombre del año escolar, fechas de inicio y fin, modalidad bimestral/trimestral y plazos límite de entrega de notas.
- **Proceso / Comportamiento:**
  1. Valida que las fechas no se traslapen cronológicamente.
  2. Activa el periodo para la gestión escolar del año.
  3. Al cumplirse la fecha límite, bloquea automáticamente el ingreso de calificaciones regulares a los docentes.
- **Salidas:** Calendario lectivo activo en el sistema.
- **Postcondiciones:** Estructura temporal oficial habilitada para matrícula y notas.
- **Criterio de Aceptación:** Inhabilitación automática del ingreso de notas una vez vencido el plazo formal.

---

### RF-12: Estructuración de Niveles Educativos, Grados y Secciones
- **Enunciado Normativo:** El sistema deberá permitir dar de alta los niveles educativos atendidos (Primaria y Secundaria), los grados pedagógicos correspondientes y las secciones habilitadas (A, B, C), definiendo el aforo máximo de estudiantes por aula física.
- **Precondiciones:** Año académico activo.
- **Entradas:** Nivel educativo, grado, letra de sección, turno y aforo máximo.
- **Proceso / Comportamiento:** Registra las secciones asegurando la no duplicidad de aulas en el mismo grado.
- **Salidas:** Catálogo de secciones disponible para matrícula y asignación horaria.
- **Postcondiciones:** Secciones listas para la recepción de nóminas escolares.
- **Criterio de Aceptación:** Alerta preventiva si se intenta matricular por encima del aforo configurado.

---

### RF-13: Parametrización del Plan de Estudios y Competencias Curriculares
- **Enunciado Normativo:** El sistema deberá permitir configurar las áreas curriculares (Matemática, Comunicación, etc.), asignaturas y competencias pedagógicas oficiales para cada grado de primaria y secundaria, conforme a las directrices vigentes del Currículo Nacional.
- **Precondiciones:** Grados educativos creados.
- **Entradas:** Denominación de la asignatura, área curricular, horas semanales y lista de competencias evaluables.
- **Proceso / Comportamiento:** Asocia las competencias al curso para estructurar los futuros registros de evaluación.
- **Salidas:** Plan de estudios oficial registrado en la plataforma.
- **Postcondiciones:** Asignaturas listas para ser asignadas a docentes.
- **Criterio de Aceptación:** Cada curso cuenta con al menos una competencia formalmente asociada.

---

### RF-14: Definición de Escalas de Calificación Oficiales (Vigesimal y Literal)
- **Enunciado Normativo:** El sistema deberá permitir parametrizar las escalas de calificación oficiales vigentes, soportando tanto la escala vigesimal numérica (0 a 20 con nota aprobatoria mínima de 11) como la escala cualitativa literal del MINEDU (AD, A, B, C) con sus respectivas reglas de redondeo y tablas de equivalencia.
- **Precondiciones:** Asignación de nivel educativo.
- **Entradas:** Tipo de escala (vigesimal o cualitativa), nota mínima aprobatoria y reglas de conversión.
- **Proceso / Comportamiento:** Configura las reglas de validación que gobernarán transversalmente las matrices de notas y actas.
- **Salidas:** Reglas evaluativas aplicadas en las planillas de los docentes.
- **Postcondiciones:** Bloqueo de cualquier calificación fuera de la escala establecida.
- **Criterio de Aceptación:** El sistema rechaza cualquier valor inferior a 0, mayor a 20 o letras no normadas.

---

```
========================================================================================
MÓDULO 4: GESTIÓN ACADÉMICA, PADRÓN ESCOLAR Y CARGA LECTIVA
========================================================================================
```

### RF-15: Registro, Filiación y Actualización del Padrón de Estudiantes
- **Enunciado Normativo:** El sistema deberá permitir el registro individual y masivo de los estudiantes en el padrón del plantel, capturando sus datos de filiación, documento de identidad (DNI), fecha de nacimiento y teléfonos de contacto, en estricto apego a la confidencialidad de datos personales.
- **Precondiciones:** Acceso con rol de Secretaría o Administración.
- **Entradas:** DNI, nombres y apellidos, fecha de nacimiento, sexo y datos de domicilio y contacto.
- **Proceso / Comportamiento:** Verifica la unicidad del DNI y da de alta la ficha del estudiante en el padrón institucional.
- **Salidas:** Ficha del estudiante registrada y usuario de consulta generado.
- **Postcondiciones:** Estudiante habilitado para el proceso de matrícula escolar.
- **Criterio de Aceptación:** Prohibición de duplicación de DNI en el padrón institucional.

---

### RF-16: Matrícula Escolar y Asignación de Estudiantes a Secciones
- **Enunciado Normativo:** El sistema deberá permitir matricular formalmente a los estudiantes registrados en un grado y sección específicos para el periodo escolar vigente, incorporándolos automáticamente en las listas de asistencia y registros de notas de todas las asignaturas correspondientes a dicha sección.
- **Precondiciones:** Estudiante en padrón y sección con vacantes disponibles.
- **Entradas:** Selección del estudiante, año lectivo, grado y sección.
- **Proceso / Comportamiento:** Comprueba el aforo del aula, asienta la matrícula y asocia al alumno con los registros pedagógicos.
- **Salidas:** Constancia interna de matrícula y actualización de la nómina de la sección.
- **Postcondiciones:** El alumno es visible de inmediato para todos los docentes de esa sección.
- **Criterio de Aceptación:** Actualización inmediata de las listas de clase sin desfases de sincronización.

---

### RF-17: Asignación y Distribución de Carga Lectiva Docente
- **Enunciado Normativo:** El sistema deberá permitir a la Coordinación Académica asignar la carga de asignaturas, grados y secciones a los docentes nombrados y contratados, delimitando de manera automática sus permisos para registrar notas y tomar asistencia diaria.
- **Precondiciones:** Docente activo y asignaturas configuradas en el plan de estudios.
- **Entradas:** Docente seleccionado, asignaturas, secciones y horas semanales asignadas.
- **Proceso / Comportamiento:** Asocia la carga horaria al profesor y habilita los cursos en su entorno personal.
- **Salidas:** Horario docente registrado y cursos desplegados en el panel del profesor.
- **Postcondiciones:** Docente legitimado como titular del registro de calificaciones.
- **Criterio de Aceptación:** Un docente solo puede registrar calificaciones en los cursos que tiene formalmente asignados.

---

### RF-18: Vinculación y Asignación Pedagógica de Practicantes de Educación
- **Enunciado Normativo:** El sistema deberá permitir vincular formalmente a los practicantes preprofesionales con los docentes tutores nombrados y con las aulas escolares en las que prestarán apoyo pedagógico, permitiendo la supervisión de sus horas y actividades.
- **Precondiciones:** Practicante y docente tutor registrados en el sistema.
- **Entradas:** Practicante, docente titular responsable y sección asignada.
- **Proceso / Comportamiento:** Establece el enlace pedagógico y delimita el acceso del practicante a dicha sección bajo supervisión.
- **Salidas:** Confirmación de vinculación y notificación al docente tutor.
- **Postcondiciones:** Practicante habilitado para marcar asistencia y apoyar en calificaciones.
- **Criterio de Aceptación:** Toda actividad del practicante queda supeditada a la supervisión de su tutor.

---

### RF-19: Consulta y Generación de Nóminas Oficiales de Aula
- **Enunciado Normativo:** El sistema deberá permitir a los docentes y directivos consultar y exportar en cualquier momento la lista oficial de estudiantes matriculados en una sección, ordenada alfabéticamente por apellidos.
- **Precondiciones:** Matrícula consolidada en la sección.
- **Entradas:** Grado y sección seleccionados.
- **Proceso / Comportamiento:** Compila la lista de estudiantes regulares activos con su estado de matrícula.
- **Salidas:** Nómina oficial desplegada en pantalla y descargable en formatos PDF y Excel.
- **Postcondiciones:** Consulta informativa sin modificación de datos.
- **Criterio de Aceptación:** Generación y despliegue del listado en menos de 1 segundo.

---

```
========================================================================================
MÓDULO 5: CONTROL Y GESTIÓN DE ASISTENCIA DE ESTUDIANTES
========================================================================================
```

### RF-20: Registro Ordinario de Asistencia Escolar en el Aula
- **Enunciado Normativo:** El sistema deberá permitir a los docentes registrar la asistencia de los estudiantes en cada sesión de clase, ofreciendo una función de marcado rápido ("Marcar Todos Presentes") y permitiendo seleccionar los estados: Presente (P), Tardanza (T), Falta Injustificada (F) y Falta Justificada (J).
- **Precondiciones:** Sesión de clase programada en el horario del docente.
- **Entradas:** Selección de estados de asistencia para los estudiantes de la nómina y fecha de la sesión.
- **Proceso / Comportamiento:**
  1. Muestra la nómina con estado "Presente" por defecto.
  2. El docente modifica las excepciones de ausencias o retrasos.
  3. Guarda los registros computando la marca de tiempo oficial del servidor.
- **Salidas:** Asistencia guardada y reflejada de inmediato en el consolidado del estudiante.
- **Postcondiciones:** Registro cerrado para edición transcurridas 24 horas.
- **Criterio de Aceptación:** Registro de una lista de 35 estudiantes en menos de 30 segundos.

---

### RF-21: Registro de Ingreso Físico en Modo Kiosco de Portería ("Wachiman")
- **Enunciado Normativo:** El sistema deberá proporcionar una interfaz de alta velocidad optimizada para el personal de vigilancia y portería ("Wachiman"), permitiendo registrar el ingreso físico de los alumnos digitando el DNI o escaneando el código de barras/QR del carné, calculando automáticamente la puntualidad o los minutos de tardanza con retroalimentación visual y sonora instantánea.
- **Precondiciones:** Horario de entrada institucional parametrizado.
- **Entradas:** Lectura o tipeo del DNI del alumno al cruzar la puerta escolar.
- **Proceso / Comportamiento:**
  1. Identifica al estudiante en menos de 1 segundo.
  2. Compara la hora de entrada con el horario escolar.
  3. Despliega pantalla verde (Puntual) o amarilla (Tardanza con minutos computados).
  4. Si no pertenece al colegio, emite pantalla roja de advertencia.
- **Salidas:** Registro de entrada asentado en el sistema y preparación inmediata del campo para el siguiente alumno.
- **Postcondiciones:** Marca de tiempo real almacenada en el récord diario del estudiante.
- **Criterio de Aceptación:** Procesamiento de cada alumno en menos de 1 segundo sin retrasar el ingreso en puerta.

---

### RF-22: Gestión y Justificación Formal de Inasistencias y Tardanzas Escolares
- **Enunciado Normativo:** El sistema deberá permitir a la Coordinación Académica y Auxiliares registrar justificaciones formales de inasistencia presentadas por los apoderados, adjuntando el motivo y número de documento de sustento, actualizando el estado de la falta y recalculando el récord disciplinario.
- **Precondiciones:** Inasistencia previamente registrada.
- **Entradas:** Estudiante, fecha de inasistencia, motivo y documento de sustento médico o familiar.
- **Proceso / Comportamiento:** Cambia el estado a "Falta Justificada" y descuenta la falta del cómputo de sanciones.
- **Salidas:** Constancia de justificación registrada en el legajo del estudiante.
- **Postcondiciones:** Récord escolar actualizado de forma inmediata.
- **Criterio de Aceptación:** Descuento instantáneo de la inasistencia en las alertas de riesgo escolar.

---

### RF-23: Consolidación y Consulta del Récord de Asistencia por Estudiante
- **Enunciado Normativo:** El sistema deberá consolidar continuamente el porcentaje de asistencia acumulado por cada estudiante, permitiendo a los directivos, docentes y al propio alumno consultar en tiempo real el total de presencias, tardanzas y faltas acumuladas por periodo.
- **Precondiciones:** Marcas de asistencia registradas en el periodo.
- **Entradas:** Consulta del estudiante o selección en el panel docente.
- **Proceso / Comportamiento:** Calcula el balance porcentual sobre el total de clases dictadas a la fecha.
- **Salidas:** Gráfico y reporte detallado de asistencia mensual y periódica.
- **Postcondiciones:** Información disponible para la emisión de libretas escolares.
- **Criterio de Aceptación:** Exactitud aritmética del 100% de las sesiones evaluadas.

---

### RF-24: Detección y Generación de Alertas por Ausentismo Crónico
- **Enunciado Normativo:** El sistema deberá supervisar de manera automática las inasistencias y generar una alerta temprana visible para la Coordinación Académica y Tutores cuando un estudiante acumule 3 faltas injustificadas consecutivas o supere el 10% de ausencias en el periodo lectivo.
- **Precondiciones:** Registro diario de asistencias en curso.
- **Entradas:** Disparo automático tras guardar la lista de asistencia.
- **Proceso / Comportamiento:** Evalúa los umbrales configurados y activa la insignia de riesgo en el panel tutorial.
- **Salidas:** Notificación destacada en el tablero de control de Coordinación.
- **Postcondiciones:** Estudiante incorporado en la lista de seguimiento preventivo contra la deserción.
- **Criterio de Aceptación:** Emisión de la alerta en tiempo real al registrarse la falta que rebasa el umbral.

---

```
========================================================================================
MÓDULO 6: CONTROL DE ASISTENCIA Y CUMPLIMIENTO DE PRACTICANTES
========================================================================================
```

### RF-25: Registro Diario de Jornada y Permanencia de Practicantes
- **Enunciado Normativo:** El sistema deberá permitir a los practicantes preprofesionales registrar su horario de entrada y de salida en cada jornada de apoyo pedagógico, calculando la duración cronológica y pedagógica de la sesión de práctica cumplida.
- **Precondiciones:** Practicante activo con vinculación pedagógica a un aula.
- **Entradas:** Comando de marcación de entrada y marcación de salida.
- **Proceso / Comportamiento:** Computa la marca temporal inalterable del servidor y calcula las horas cumplidas.
- **Salidas:** Registro de jornada almacenado en estado "Pendiente de Validación".
- **Postcondiciones:** Horas registradas en espera del visto bueno del tutor.
- **Criterio de Aceptación:** Prohibición de registrar salida sin tener una entrada registrada en la misma fecha.

---

### RF-26: Cómputo Acumulado de Horas Efectivas de Prácticas Universitarias
- **Enunciado Normativo:** El sistema deberá llevar el cómputo oficial acumulativo de las horas de práctica efectivamente validadas de cada practicante, mostrando su porcentaje de avance frente a la meta fijada por su plan universitario (por ejemplo, 96 horas lectivas).
- **Precondiciones:** Horas de práctica validadas en el sistema.
- **Entradas:** Consulta del perfil de prácticas.
- **Proceso / Comportamiento:** Totaliza las horas aprobadas y proyecta las horas pendientes de cumplimiento.
- **Salidas:** Barra de progreso visual y resumen de horas cumplidas.
- **Postcondiciones:** Datos listos para emisión de constancias formales de Servicio Social.
- **Criterio de Aceptación:** Actualización inmediata tras la validación de cada jornada docente.

---

### RF-27: Conformidad y Validación Periódica de Horas por el Docente Tutor
- **Enunciado Normativo:** El sistema deberá proveer una bandeja de supervisión para que los docentes tutores revisen semanalmente las asistencias registradas por sus practicantes a cargo y emitan su visto bueno formal ("Aprobado" u "Observado").
- **Precondiciones:** Jornadas de práctica registradas por el practicante.
- **Entradas:** Aprobación individual o en bloque de las sesiones de la semana.
- **Proceso / Comportamiento:** Cambia el estado de las horas a "Oficiales y Validadas" con registro del tutor responsable.
- **Salidas:** Horas formalizadas en el legajo del practicante.
- **Postcondiciones:** Solo las horas validadas se computan en las fichas para la universidad.
- **Criterio de Aceptación:** Trazabilidad estricta del usuario docente que otorgó la conformidad.

---

### RF-28: Emisión de Fichas Oficiales de Prácticas para la UNSCH
- **Enunciado Normativo:** El sistema deberá generar la Ficha Oficial de Asistencia y Cumplimiento de Prácticas en formato PDF, con el membrete institucional y el consolidado de horas validadas, apta para ser presentada ante la EPIS / Facultad de Educación de la UNSCH.
- **Precondiciones:** Horas validadas por el docente tutor y coordinación.
- **Entradas:** Selección del practicante y periodo a certificar.
- **Proceso / Comportamiento:** Compila las fechas, horas y firmas pedagógicas en un documento estructurado.
- **Salidas:** Documento oficial en PDF listo para firma digital o física e impresión.
- **Postcondiciones:** Documento registrado para acreditación curricular.
- **Criterio de Aceptación:** Generación del documento completo en PDF en menos de 2 segundos.

---

```
========================================================================================
MÓDULO 7: CONTROL DE ASISTENCIA Y HORAS DE DOCENTES CONTRATADOS
========================================================================================
```

### RF-29: Registro y Marcación de Horas Lectivas de Docentes Contratados
- **Enunciado Normativo:** El sistema deberá registrar la asistencia y cumplimiento de horas de los docentes contratados para cada una de sus clases programadas, cotejando automáticamente la hora de inicio con su horario oficial asignado para calificar la puntualidad o demora.
- **Precondiciones:** Horario de clases del docente contratado registrado en el sistema.
- **Entradas:** Marcación de inicio de clase por parte del docente.
- **Proceso / Comportamiento:** Compara contra el bloque lectivo y determina si existió puntualidad, tardanza o inasistencia.
- **Salidas:** Registro de cumplimiento de clase asentado en el sistema.
- **Postcondiciones:** Información acumulada para el consolidado mensual de horas dictadas.
- **Criterio de Aceptación:** Registro inmediato de la marca temporal sin desfases de horario.

---

### RF-30: Registro de Justificaciones y Reprogramación de Clases Docentes
- **Enunciado Normativo:** El sistema deberá permitir a los docentes contratados presentar justificaciones por inasistencias y registrar la programación de sesiones pedagógicas de recuperación, requiriendo la aprobación expresa de la Coordinación Académica.
- **Precondiciones:** Clase no dictada en el horario regular.
- **Entradas:** Fecha no asistida, motivo, sustento adjunto y fecha/hora propuesta para la clase de recuperación.
- **Proceso / Comportamiento:** Coordinación valida la propuesta y programa la sesión de recuperación en el calendario escolar.
- **Salidas:** Notificación de recuperación aprobada y actualización del horario de aula.
- **Postcondiciones:** La clase se computa como dictada únicamente tras su efectiva realización.
- **Criterio de Aceptación:** Registro transparente del ciclo de inasistencia, reprogramación y dictado.

---

### RF-31: Consolidación Mensual de Cumplimiento de Horas Lectivas Dictadas
- **Enunciado Normativo:** El sistema deberá consolidar al término de cada mes el total de horas pedagógicas efectivamente dictadas, tardanzas acumuladas y faltas de cada docente contratado frente a su carga comprometida, emitiendo el cuadro oficial de cumplimiento de servicios (sin incluir cálculos de remuneraciones ni planillas salariales).
- **Precondiciones:** Mes lectivo culminado con marcas docentes asentadas.
- **Entradas:** Selección del mes calendario y filtro de personal contratado.
- **Proceso / Comportamiento:** Totaliza las horas de 45 minutos dictadas y genera la sábana mensual de cumplimiento.
- **Salidas:** Cuadro consolidado de horas de docentes contratados en PDF y Excel.
- **Postcondiciones:** Documento oficial de sustento administrativo archivado.
- **Criterio de Aceptación:** Cálculo aritmético exacto de las horas dictadas sin discrepancias.

---

### RF-32: Supervisión y Monitoreo de Cobertura y Puntualidad de Clases
- **Enunciado Normativo:** El sistema deberá ofrecer a la Coordinación Académica un panel en tiempo real para verificar el estado de las clases del día, resaltando aquellas aulas que presenten demoras mayores a 10 minutos en su inicio para facilitar la atención inmediata.
- **Precondiciones:** Jornada escolar en curso.
- **Entradas:** Acceso al tablero de supervisión del día.
- **Proceso / Comportamiento:** Monitorea las marcas docentes y colorea las secciones con retraso o sin profesor.
- **Salidas:** Matriz de monitoreo de asistencia docente del día en pantalla.
- **Postcondiciones:** Detección oportuna de horas libres o clases no cubiertas.
- **Criterio de Aceptación:** Visualización clara del estado de todas las aulas del turno en una sola vista.

---

```
========================================================================================
MÓDULO 8: REGISTRO, FLUJO Y SEGUIMIENTO DE CALIFICACIONES EN TIEMPO REAL
========================================================================================
```

### RF-33: Parametrización de Rúbricas y Evaluaciones por Asignatura
- **Enunciado Normativo:** El sistema deberá permitir a los docentes estructurar los criterios, actividades o rúbricas de evaluación del periodo en sus asignaturas, asignando su ponderación porcentual asociada a las competencias oficiales del curso.
- **Precondiciones:** Carga docente asignada y periodo académico abierto.
- **Entradas:** Denominación de la evaluación, competencia vinculada y peso relativo (la suma debe totalizar 100%).
- **Proceso / Comportamiento:** Valida que la suma de ponderaciones equivalga al 100% y crea las columnas evaluativas en la planilla.
- **Salidas:** Planilla de calificaciones estructurada con sus criterios oficiales.
- **Postcondiciones:** Registro auxiliar listo para el ingreso de notas.
- **Criterio de Aceptación:** Validación obligatoria del 100% de la suma de pesos antes de permitir el guardado.

---

### RF-34: Ingreso, Edición y Publicación de Calificaciones en Tiempo Real
- **Enunciado Normativo:** El sistema deberá permitir a los docentes ingresar y modificar calificaciones en una planilla interactiva en tiempo real, validando los valores contra la escala oficial, recalculando instantáneamente los promedios y dejándolos disponibles de inmediato para la consulta de las autoridades y estudiantes.
- **Precondiciones:** Periodo académico abierto y usuario con titularidad en el curso.
- **Entradas:** Notas ingresadas por estudiante en la columna de evaluación correspondiente.
- **Proceso / Comportamiento:**
  1. Valida los rangos de la escala oficial.
  2. Asienta las calificaciones y recalcula los promedios en tiempo real.
  3. Emite la actualización hacia los paneles de consulta sin recargar la página.
- **Salidas:** Planilla actualizada y confirmación visual de guardado.
- **Postcondiciones:** Registro de auditoría con fecha, hora y usuario que ingresó la nota.
- **Criterio de Aceptación:** Actualización inmediata de la calificación en menos de 1 segundo tras presionar guardar.

---

### RF-35: Colaboración Supervisada de Practicantes en el Registro de Notas
- **Enunciado Normativo:** El sistema deberá permitir que los practicantes colaboren digitando notas de actividades evaluativas asignadas en modo borrador ("Propuesta"), requiriendo la revisión y aprobación expresa del docente titular para que adquieran carácter oficial.
- **Precondiciones:** Practicante vinculado al aula y autorización del docente titular.
- **Entradas:** Notas digitadas por el practicante.
- **Proceso / Comportamiento:** Las notas quedan en estado "Pendiente de Aprobación" hasta que el titular las valide.
- **Salidas:** Notificación al docente titular sobre notas pendientes de revisión.
- **Postcondiciones:** Las notas solo se publican para los estudiantes tras el visto bueno del docente tutor.
- **Criterio de Aceptación:** Imposibilidad de publicación de notas ingresadas por practicantes sin aprobación docente.

---

### RF-36: Cálculo Automatizado de Promedios Parciales, Bimestrales y Finales
- **Enunciado Normativo:** El sistema deberá calcular de manera matemática y automatizada los promedios de cada competencia, los promedios bimestrales y el promedio final anual de cada asignatura, aplicando las reglas de ponderación y redondeo oficial del plantel.
- **Precondiciones:** Notas parciales registradas en el sistema.
- **Entradas:** Calificaciones vigentes en el registro auxiliar.
- **Proceso / Comportamiento:** Ejecuta el algoritmo de promedio aritmético o ponderado y aplica las equivalencias literales o redondeo vigesimal.
- **Salidas:** Promedios consolidados reflejados en actas, libretas y dashboards.
- **Postcondiciones:** Inmutabilidad del cálculo frente a manipulaciones manuales arbitrarias.
- **Criterio de Aceptación:** Cero margen de error aritmético en los cálculos del sistema.

---

### RF-37: Cierre Oficial de Periodo Académico y Bloqueo de Modificación
- **Enunciado Normativo:** El sistema deberá permitir a la Coordinación y Dirección General ejecutar el cierre oficial de un periodo lectivo (bimestre/trimestre), bloqueando de forma automática e inmediata la edición de notas para todos los docentes y garantizando la inmutabilidad de los resultados.
- **Precondiciones:** Vencimiento del plazo oficial de entrega de notas.
- **Entradas:** Confirmación directiva de cierre de periodo.
- **Proceso / Comportamiento:** Cambia el estado del periodo a "Cerrado" y desactiva los controles de edición en las planillas docentes.
- **Salidas:** Notificación de cierre formal y actas consolidadas oficiales listas.
- **Postcondiciones:** Las planillas docentes pasan a modo de solo lectura.
- **Criterio de Aceptación:** Bloqueo absoluto de cualquier edición ordinaria posterior al cierre.

---

### RF-38: Flujo Extraordinario de Solicitud y Aprobación de Rectificación
- **Enunciado Normativo:** El sistema deberá disponer de un flujo formal para la corrección de errores materiales en periodos cerrados, mediante el cual el docente formula una solicitud fundamentada indicando la nota errónea y la nueva nota propuesta, la cual surtirá efecto únicamente tras la autorización explícita de la Dirección General.
- **Precondiciones:** Periodo académico cerrado y existencia de justificación formal.
- **Entradas:** Solicitud docente con sustento escrito y propuesta de calificación rectificada.
- **Proceso / Comportamiento:** La Dirección aprueba la solicitud; el sistema aplica el cambio, recalcula los promedios y registra el evento en auditoría.
- **Salidas:** Nota rectificada en el registro oficial y notificación de conformidad al docente.
- **Postcondiciones:** Registro completo en auditoría de quién solicitó, quién autorizó y los valores antes/después.
- **Criterio de Aceptación:** Ninguna rectificación puede aplicarse sin la doble autorización registrada.

---

### RF-39: Consulta Inmediata y Transparente de Calificaciones para Estudiantes
- **Enunciado Normativo:** El sistema deberá proporcionar a los estudiantes un portal de consulta individual y confidencial, donde puedan visualizar en tiempo real sus notas por competencia, evaluaciones parciales oficializadas y promedios por periodo, en modo estrictamente de solo lectura.
- **Precondiciones:** Estudiante autenticado y notas oficializadas por los docentes.
- **Entradas:** Selección del periodo académico a consultar.
- **Proceso / Comportamiento:** Despliega las asignaturas matriculadas con sus respectivas calificaciones y estados de logro.
- **Salidas:** Visualización clara de la libreta electrónica del alumno.
- **Postcondiciones:** Estudiante informado sobre su progreso académico.
- **Criterio de Aceptación:** Acceso exclusivo a sus propios registros escolares sin posibilidad de ver datos ajenos.

---

```
========================================================================================
MÓDULO 9: MAPAS DE CALOR Y ANÁLISIS VISUAL DEL RENDIMIENTO Y ASISTENCIA
========================================================================================
```

### RF-40: Generación de Mapa de Calor de Rendimiento Académico por Sección
- **Enunciado Normativo:** El sistema deberá generar matrices visuales interactivas en forma de mapas de calor (Heatmaps), donde las filas representen a los estudiantes y las columnas las asignaturas o competencias, coloreando cada celda según el rendimiento obtenido (verde: logro destacado; amarillo: umbral de riesgo; rojo: desaprobado).
- **Precondiciones:** Calificaciones registradas en la sección seleccionada.
- **Entradas:** Grado, sección y periodo académico a visualizar.
- **Proceso / Comportamiento:** Compila las notas y asigna la escala cromática térmica, mostrando detalles al pasar el cursor.
- **Salidas:** Cuadrícula térmica interactiva en pantalla y exportable a PDF.
- **Postcondiciones:** Identificación visual inmediata de áreas críticas de aprendizaje.
- **Criterio de Aceptación:** Generación del mapa de calor para una sección completa en menos de 2 segundos.

---

### RF-41: Generación de Mapa de Calor de Asistencia y Puntualidad
- **Enunciado Normativo:** El sistema deberá generar mapas de calor cronológicos para visualizar la asistencia estudiantil a lo largo de los días y semanas lectivas, permitiendo evidenciar patrones colectivos de ausentismo o tardanzas concentradas en fechas específicas.
- **Precondiciones:** Marcas de asistencia registradas en el rango temporal.
- **Entradas:** Selección de sección y rango de fechas a consultar.
- **Proceso / Comportamiento:** Calcula la densidad de faltas por día y representa la intensidad del ausentismo mediante colores graduados.
- **Salidas:** Matriz térmica cronológica con semaforización de ausentismo.
- **Postcondiciones:** Información analítica disponible para tutores y auxiliares.
- **Criterio de Aceptación:** Identificación de días con ausentismo atípico a simple vista.

---

### RF-42: Análisis Gráfico Comparativo de Rendimiento entre Secciones
- **Enunciado Normativo:** El sistema deberá permitir contrastar de manera simultánea los perfiles cromáticos y mapas de calor de secciones paralelas del mismo grado (ejemplo: 3° A vs. 3° B), facilitando a la Coordinación Académica la identificación de brechas pedagógicas.
- **Precondiciones:** Dos o más secciones del mismo grado con notas consolidadas.
- **Entradas:** Grado académico y selección de secciones a comparar.
- **Proceso / Comportamiento:** Despliega matrices lado a lado con sus promedios consolidados y dispersión.
- **Salidas:** Vista comparativa de rendimiento institucional.
- **Postcondiciones:** Detección de brechas para nivelación curricular.
- **Criterio de Aceptación:** Despliegue sincronizado de las secciones evaluadas en una sola pantalla.

---

### RF-43: Detección Visual de Asignaturas con Mayor Índice de Riesgo
- **Enunciado Normativo:** El sistema deberá proveer una matriz macro-institucional que exhiba en tonalidades rojas de alerta aquellas asignaturas del plan de estudios que concentren el mayor porcentaje de alumnos en riesgo o desaprobados en todo el colegio.
- **Precondiciones:** Periodo académico con notas registradas a nivel de plantel.
- **Entradas:** Acceso de la Dirección General al módulo de radiografía escolar.
- **Proceso / Comportamiento:** Procesa los porcentajes globales de desaprobación y genera el ranking térmico de áreas críticas.
- **Salidas:** Tablero térmico macro con semáforo institucional de cursos críticos.
- **Postcondiciones:** Priorización de programas de refuerzo escolar y asesoría tutorial.
- **Criterio de Aceptación:** Resumen global institucional visualizable en una sola vista ejecutiva.

---

```
========================================================================================
MÓDULO 10: MONITOREO INSTITUCIONAL, DASHBOARDS Y ALERTAS TEMPRANAS
========================================================================================
```

### RF-44: Tablero de Control Ejecutivo de Indicadores Clave para Dirección
- **Enunciado Normativo:** El sistema deberá ofrecer a la Dirección General un panel de control con indicadores clave de desempeño (KPIs): porcentaje de asistencia global diaria, tasa de docentes al día en calificaciones, índice de aprobación institucional y conteo de alumnos en riesgo.
- **Precondiciones:** Datos operativos registrados en la jornada escolar.
- **Entradas:** Acceso directivo al panel principal.
- **Proceso / Comportamiento:** Calcula dinámicamente las métricas del plantel y las presenta en gráficos ejecutivos limpios.
- **Salidas:** Tablero de mando integral directivo interactivo.
- **Postcondiciones:** Autoridades informadas en tiempo real para la toma de decisiones.
- **Criterio de Aceptación:** Carga completa de todos los widgets del tablero en menos de 2 segundos.

---

### RF-45: Tablero de Control Curricular y Cumplimiento para Coordinación
- **Enunciado Normativo:** El sistema deberá proveer a la Coordinación Académica un panel de control enfocado en el seguimiento docente: porcentaje de avance en el llenado de notas por profesor, registros pendientes por entregar y alertas de rendimiento escolar.
- **Precondiciones:** Cronograma lectivo y plazos de entrega configurados.
- **Entradas:** Consulta del panel de coordinación.
- **Proceso / Comportamiento:** Compara el avance de cada profesor contra el cronograma y emite semáforos de cumplimiento.
- **Salidas:** Lista de seguimiento docente con identificación de registros atrasados.
- **Postcondiciones:** Notificación y gestión oportuna de rezagos docentes.
- **Criterio de Aceptación:** Identificación de docentes con retrasos en menos de 5 segundos.

---

### RF-46: Tablero de Resumen Pedagógico y Clases Diarias para el Docente
- **Enunciado Normativo:** El sistema deberá mostrar al docente, tras autenticarse, un resumen de su jornada escolar: accesos directos para tomar asistencia en sus clases del día, estado de avance de sus planillas de notas y alertas de alumnos con bajo rendimiento.
- **Precondiciones:** Docente autenticado con carga lectiva activa.
- **Entradas:** Inicio de sesión del profesor.
- **Proceso / Comportamiento:** Contextualiza la jornada del día y provee atajos directos a sus listas de estudiantes.
- **Salidas:** Tablero de trabajo docente optimizado.
- **Postcondiciones:** Agilización en la toma de asistencia y registro evaluativo.
- **Criterio de Aceptación:** Reducción sustancial del tiempo requerido para registrar asistencia diaria.

---

### RF-47: Tablero de Resumen de Situación Escolar para el Estudiante
- **Enunciado Normativo:** El sistema deberá presentar al estudiante un panel amigable y adaptativo que sintetice su situación académica general: porcentaje de asistencia acumulada, estado de cursos aprobados o en riesgo y comunicados institucionales vigentes.
- **Precondiciones:** Estudiante con matrícula regular activa.
- **Entradas:** Acceso del alumno a su perfil.
- **Proceso / Comportamiento:** Procesa y muestra los indicadores académicos personales de forma clara y motivadora.
- **Salidas:** Panel personal responsivo apto para celulares, tabletas y computadoras.
- **Postcondiciones:** Estudiante consciente de su propio desempeño escolar.
- **Criterio de Aceptación:** Visualización clara y legible en cualquier tamaño de pantalla.

---

### RF-48: Generación Automatizada de Alertas de Deserción y Repitencia
- **Enunciado Normativo:** El sistema deberá cruzar diariamente las inasistencias acumuladas y las materias desaprobadas para identificar a estudiantes en riesgo preventivo de repitencia o deserción, listándolos en una bandeja especial para el acompañamiento tutorial.
- **Precondiciones:** Asistencias y notas actualizadas en el sistema.
- **Entradas:** Ejecución automática de las reglas de umbral de riesgo al cierre del día.
- **Proceso / Comportamiento:** Identifica alumnos con 3 o más cursos en riesgo o más del 10% de inasistencias y genera la alerta.
- **Salidas:** Listado de estudiantes en riesgo visible para Tutores y Coordinación.
- **Postcondiciones:** Activación oportuna de planes de recuperación pedagógica.
- **Criterio de Aceptación:** Detección automática y oportuna de casos de riesgo antes del cierre del periodo.

---

```
========================================================================================
MÓDULO 11: EMISIÓN DE REPORTES, LIBRETAS Y DOCUMENTACIÓN ESCOLAR
========================================================================================
```

### RF-49: Emisión Oficial de Boletas de Información Escolar / Libretas en PDF
- **Enunciado Normativo:** El sistema deberá generar y emitir las Boletas de Información Escolar (Libretas de Calificaciones) oficiales en formato PDF para un periodo específico o acumulado anual, con membrete oficial, calificaciones por competencia, récord de asistencia y código de verificación.
- **Precondiciones:** Periodo académico cerrado con notas consolidadas.
- **Entradas:** Selección de sección o estudiante particular.
- **Proceso / Comportamiento:** Compila las calificaciones y récord de faltas generando el documento oficial listo para impresión.
- **Salidas:** Boleta escolar en formato PDF de alta calidad.
- **Postcondiciones:** Documento listo para su entrega formal a la comunidad escolar.
- **Criterio de Aceptación:** Generación fidedigna de la libreta en menos de 2 segundos.

---

### RF-50: Generación del Cuadro de Mérito y Puestos de Honor Institucionales
- **Enunciado Normativo:** El sistema deberá procesar y emitir el Cuadro de Mérito oficial por sección, grado y nivel, ordenando a los estudiantes en estricto orden descendente según su promedio ponderado acumulado para la asignación de diplomas y reconocimientos de honor.
- **Precondiciones:** Cierre formal del periodo o año escolar.
- **Entradas:** Grado y periodo lectivo a procesar.
- **Proceso / Comportamiento:** Ordena matemáticamente a los alumnos aplicando las reglas institucionales de desempate.
- **Salidas:** Reporte oficial del Cuadro de Mérito con puestos asignados.
- **Postcondiciones:** Padrón oficial de primeros puestos resguardado.
- **Criterio de Aceptación:** Ordenamiento matemático exacto sin discrepancias de cómputo.

---

### RF-51: Emisión y Descarga del Registro Auxiliar Oficial y Actas Finales
- **Enunciado Normativo:** El sistema deberá permitir a cada docente descargar su Registro Auxiliar de Evaluación oficial con la sábana completa de notas por competencia, y a la Secretaría generar las Actas Consolidadas Oficiales de Evaluación para el archivo institucional.
- **Precondiciones:** Notas registradas en la asignatura y sección.
- **Entradas:** Curso, sección y periodo lectivo a consolidar.
- **Proceso / Comportamiento:** Genera la sábana integral de notas con firmas y membrete institucional en PDF o Excel.
- **Salidas:** Archivo del Registro Auxiliar oficial descargable.
- **Postcondiciones:** Respaldo documental archivado para fines de supervisión.
- **Criterio de Aceptación:** Inclusión del 100% de los criterios y notas evaluadas en el documento.

---

### RF-52: Reportes Consolidados de Asistencia Multiactor del Plantel
- **Enunciado Normativo:** El sistema deberá emitir reportes consolidados mensuales de asistencia para estudiantes por aula, horas dictadas por docentes contratados y jornadas cumplidas por practicantes preprofesionales.
- **Precondiciones:** Registros de asistencia del mes asentados en el sistema.
- **Entradas:** Mes calendario y tipo de actor a reportar.
- **Proceso / Comportamiento:** Totaliza asistencias, tardanzas y ausencias con porcentajes de cumplimiento.
- **Salidas:** Cuadros consolidados de asistencia en PDF y Excel.
- **Postcondiciones:** Documentos de control interno para la Dirección y Secretaría.
- **Criterio de Aceptación:** Cruce exacto con las marcas de tiempo registradas en el sistema.

---

### RF-53: Exportación de Datos en Formatos Estándar Abiertos (PDF y Excel)
- **Enunciado Normativo:** El sistema deberá permitir que todos los reportes, listas de clase, registros auxiliares y consolidados estadísticos generados puedan ser exportados en formatos estándar: PDF (listo para impresión) y hojas de cálculo Excel / CSV (para conciliación administrativa).
- **Precondiciones:** Vista o reporte desplegado en pantalla.
- **Entradas:** Clic en "Exportar a Excel" o "Descargar en PDF".
- **Proceso / Comportamiento:** Procesa y descarga directamente el archivo formateado en el dispositivo del usuario.
- **Salidas:** Archivo descargado en la computadora o dispositivo móvil.
- **Postcondiciones:** Información disponible para uso fuera de línea.
- **Criterio de Aceptación:** Exportación de nóminas completas en menos de 5 segundos.

---

```
========================================================================================
MÓDULO 12: TRAZABILIDAD, SEGURIDAD Y AUDITORÍA INSTITUCIONAL
========================================================================================
```

### RF-54: Registro Inmutable de Auditoría de Accesos y Eventos de Seguridad
- **Enunciado Normativo:** El sistema deberá registrar de forma automática y desatendida una bitácora inmutable de todos los eventos de autenticación: inicios exitosos, intentos fallidos, bloqueos, cierres de sesión e IP de procedencia.
- **Precondiciones:** Toda operación de acceso realizada en la plataforma.
- **Entradas:** Acción del usuario en las pantallas de acceso.
- **Proceso / Comportamiento:** Escribe el registro en la bitácora con sello de tiempo sin posibilidad de borrado manual.
- **Salidas:** Entrada de auditoría almacenada.
- **Postcondiciones:** Trazabilidad completa disponible para investigaciones de seguridad.
- **Criterio de Aceptación:** Registro del 100% de los intentos de inicio de sesión sin pérdidas.

---

### RF-55: Trazabilidad Histórica de Modificaciones en Notas y Asistencias
- **Enunciado Normativo:** El sistema deberá registrar de manera obligatoria cada modificación realizada sobre calificaciones y registros de asistencia, capturando con exactitud el usuario responsable, fecha, hora, valor anterior y nuevo valor asignado.
- **Precondiciones:** Alteración de una nota o asistencia en el sistema.
- **Entradas:** Guardado o rectificación de un dato académico.
- **Proceso / Comportamiento:** Captura el snapshot "Antes" y "Después" y lo asienta en la bitácora histórica.
- **Salidas:** Registro de auditoría histórica inalterable.
- **Postcondiciones:** Evidencia documental fehaciente ante cualquier reclamo de calificaciones.
- **Criterio de Aceptación:** Trazabilidad absoluta de todas las modificaciones de calificaciones.

---

### RF-56: Módulo de Búsqueda y Monitoreo de Bitácoras de Auditoría
- **Enunciado Normativo:** El sistema deberá proporcionar una consola administrativa para que la Dirección y el Administrador TI puedan filtrar las bitácoras de auditoría por fecha, usuario, tipo de acción o estudiante afectado.
- **Precondiciones:** Acceso con rol de Administrador o Director General.
- **Entradas:** Criterios de búsqueda y rangos temporales de auditoría.
- **Proceso / Comportamiento:** Presenta la secuencia cronológica de eventos registrados en la plataforma.
- **Salidas:** Reporte visual de auditoría con opción de exportación no editable.
- **Postcondiciones:** Verificación de la integridad de los procesos escolares.
- **Criterio de Aceptación:** Búsqueda ágil y precisa en el historial de eventos institucionales.

---

### RF-57: Cumplimiento y Protección de Datos Personales (Ley N.° 29733)
- **Enunciado Normativo:** El sistema deberá salvaguardar la privacidad de los estudiantes menores de edad en concordancia con la Ley N.° 29733 de Protección de Datos Personales del Perú, garantizando que sus notas y datos de filiación no se expongan de forma pública ni accesible a terceros no autorizados.
- **Precondiciones:** Políticas institucionales y normativas vigentes.
- **Entradas:** Peticiones de consulta hacia la base de datos institucional.
- **Proceso / Comportamiento:** Aplica controles de acceso estricto y encriptación de datos en tránsito y reposo.
- **Salidas:** Protección absoluta de la confidencialidad de los estudiantes del colegio.
- **Postcondiciones:** Cumplimiento pleno del marco normativo nacional de privacidad.
- **Criterio de Aceptación:** Cero filtraciones o exposición de notas en accesos públicos sin autenticación.

---

```
========================================================================================
MÓDULO 13: PLATAFORMA DE DIFUSIÓN DIGITAL Y COMUNICACIÓN INSTITUCIONAL
========================================================================================
```

### RF-58: Cartelera Digital y Publicación de Comunicados Institucionales
- **Enunciado Normativo:** El sistema deberá contar con un módulo de cartelera digital institucional donde la Dirección y Coordinación publiquen avisos oficiales, circulares y comunicados con adjuntos PDF, segmentando el público destinatario (general, solo docentes o solo alumnos).
- **Precondiciones:** Acceso con rol de Dirección o Coordinación.
- **Entradas:** Título, contenido, público objetivo, fecha de vigencia y archivo PDF adjunto.
- **Proceso / Comportamiento:** Publica el aviso en la cartelera y lo exhibe en los paneles de los destinatarios hasta su caducidad.
- **Salidas:** Comunicado visible de forma destacada en la plataforma.
- **Postcondiciones:** Comunidad escolar informada oportunamente sobre las directivas del plantel.
- **Criterio de Aceptación:** Visualización inmediata del comunicado por los destinatarios al iniciar sesión.

---

### RF-59: Publicación y Consulta del Calendario Cívico y Escolar Interactivo
- **Enunciado Normativo:** El sistema deberá ofrecer un calendario escolar interactivo donde se publiquen las fechas cívicas, periodos de evaluación, feriados y aniversarios del plantel, permitiendo su consulta mensual o semanal por toda la comunidad escolar.
- **Precondiciones:** Hitos escolares planificados por la Dirección.
- **Entradas:** Título de la actividad, fechas y descripción del evento.
- **Proceso / Comportamiento:** Incorpora las actividades en la vista gráfica del calendario escolar.
- **Salidas:** Calendario interactivo navegable disponible en la web.
- **Postcondiciones:** Mayor orden y anticipación en el cumplimiento de las actividades del colegio.
- **Criterio de Aceptación:** Visualización clara de los hitos y fechas escolares en un calendario mensual navegable.

---

### RF-60: Portal Informativo Institucional y Normas de Convivencia Escolar
- **Enunciado Normativo:** El sistema deberá incorporar una sección informativa de acceso abierto en la plataforma web donde se difunda la reseña histórica de los Planteles de Aplicación "Guamán Poma de Ayala", misión, visión institucional, autoridades y el reglamento con las normas de convivencia escolar vigentes.
- **Precondiciones:** Información institucional redactada por la Dirección.
- **Entradas:** Contenidos institucionales aprobados por las autoridades del plantel.
- **Proceso / Comportamiento:** Despliega las páginas informativas en formato adaptativo para computadoras y dispositivos móviles.
- **Salidas:** Portal institucional informativo público de libre consulta.
- **Postcondiciones:** Difusión y fortalecimiento de la identidad institucional en la comunidad.
- **Criterio de Aceptación:** Acceso rápido y óptimo formato de lectura sin requerir inicio de sesión previo.

---

## 4. MATRIZ DE TRAZABILIDAD DOCUMENTAL (FASE I VS. FASE II)

| Código RF Fase II | Denominación Oficial del Requisito | Código Requerimiento Fase I | Rol / Stakeholder Principal | Prioridad |
|:---:|---|:---:|---|:---:|
| `RF-01` | Autenticación Segura de Usuarios | `RF-SEG-01` | Toda la comunidad escolar | Esencial |
| `RF-02` | Cierre de Sesión Seguro y Expiración | `RF-SEG-02` | Toda la comunidad escolar | Esencial |
| `RF-03` | Restablecimiento Asistido de Contraseñas | `RF-SEG-03` | Usuarios / Administrador TI | Deseable |
| `RF-04` | Control de Privilegios y Acceso (RBAC) | `RF-SEG-04` | Administrador / Directivos | Esencial |
| `RF-05` | Registro y Alta de Personal Institucional | `RF-USU-01` | Administrador / Dirección | Esencial |
| `RF-06` | Modificación y Baja Lógica de Usuarios | `RF-USU-02` | Administrador / Coordinación | Esencial |
| `RF-07` | Reasignación Dinámica de Roles | `RF-USU-03` | Administrador / Dirección | Deseable |
| `RF-08` | Directorio y Búsqueda de Personal | `RF-USU-04` | Dirección / Coordinación / Secretaría | Deseable |
| `RF-09` | Gestión de Perfil Personal | `RF-USU-05` | Todos los usuarios autenticados | Deseable |
| `RF-10` | Parametrización de Datos del Plantel | `RF-ADM-01` | Dirección General / Administrador | Esencial |
| `RF-11` | Configuración de Periodos Académicos | `RF-ADM-02` | Coordinación / Dirección General | Esencial |
| `RF-12` | Definición de Niveles, Grados y Secciones | `RF-ADM-03` | Coordinación Académica / Secretaría | Esencial |
| `RF-13` | Parametrización del Plan de Estudios | `RF-ADM-04` | Coordinación Académica | Esencial |
| `RF-14` | Configuración de Escalas de Calificación | `RF-ADM-05` | Coordinación / Dirección General | Esencial |
| `RF-15` | Registro del Padrón de Estudiantes | `RF-ACA-01` | Secretaría Académica / Dirección | Esencial |
| `RF-16` | Matrícula y Asignación a Secciones | `RF-ACA-02` | Secretaría Académica / Coordinación | Esencial |
| `RF-17` | Asignación de Carga Lectiva Docente | `RF-ACA-03` | Coordinación Académica / Dirección | Esencial |
| `RF-18` | Vinculación Pedagógica de Practicantes | `RF-ACA-04` | Coordinación / Docentes Tutores | Esencial |
| `RF-19` | Consulta de Nóminas Oficiales de Aula | `RF-ACA-05` | Docentes / Coordinación / Secretaría | Deseable |
| `RF-20` | Registro Ordinario de Asistencia en Aula | `RF-AST-01` | Docentes Titulares y Contratados | Esencial |
| `RF-21` | Registro en Kiosco de Portería ("Wachiman") | `RF-AST-02` | Personal de Vigilancia / Auxiliares | Deseable |
| `RF-22` | Justificación Formal de Inasistencias | `RF-AST-03` | Coordinación Académica / Auxiliares | Deseable |
| `RF-23` | Consulta de Récord de Asistencia | `RF-AST-04` | Estudiantes / Docentes / Dirección | Esencial |
| `RF-24` | Alertas por Ausentismo Crónico | `RF-AST-05` | Coordinación Académica / Tutores | Esencial |
| `RF-25` | Registro Diario de Jornada de Practicantes | `RF-PRA-01` | Practicantes de Educación | Esencial |
| `RF-26` | Cómputo Acumulado de Horas de Prácticas | `RF-PRA-02` | Practicantes / Coordinación / EPIS | Esencial |
| `RF-27` | Conformidad de Horas por Docente Tutor | `RF-PRA-03` | Docentes Tutores / Coordinación | Esencial |
| `RF-28` | Emisión de Fichas de Prácticas para UNSCH | `RF-PRA-04` | Coordinación Académica / Practicantes| Deseable |
| `RF-29` | Marcación de Horas Docentes Contratados | `RF-DOC-01` | Docentes Contratados / Coordinación | Esencial |
| `RF-30` | Justificaciones y Reprogramación de Clases | `RF-DOC-02` | Docentes Contratados / Coordinación | Deseable |
| `RF-31` | Consolidado Mensual de Horas Dictadas | `RF-DOC-03` | Coordinación / Secretaría / Dirección | Esencial |
| `RF-32` | Supervisión de Puntualidad Docente | `RF-DOC-04` | Coordinación Académica | Deseable |
| `RF-33` | Rúbricas y Evaluaciones por Asignatura | `RF-NOT-01` | Docentes Titulares del Curso | Esencial |
| `RF-34` | Calificaciones en Tiempo Real | `RF-NOT-02` | Docentes Titulares del Curso | Esencial |
| `RF-35` | Colaboración Supervisada de Practicantes | `RF-NOT-03` | Practicantes / Docentes Tutores | Deseable |
| `RF-36` | Cálculo Automatizado de Promedios | `RF-NOT-04` | Sistema / Coordinación Académica | Esencial |
| `RF-37` | Cierre Oficial y Bloqueo de Periodos | `RF-NOT-05` | Coordinación / Dirección General | Esencial |
| `RF-38` | Rectificación Extraordinaria de Notas | `RF-NOT-06` | Docentes / Coordinación / Dirección | Deseable |
| `RF-39` | Consulta de Calificaciones para Alumnos | `RF-NOT-07` | Estudiantes del Plantel | Esencial |
| `RF-40` | Mapa de Calor de Rendimiento por Aula | `RF-CAL-01` | Dirección / Coordinación / Docentes | Esencial |
| `RF-41` | Mapa de Calor de Asistencia y Ausentismo | `RF-CAL-02` | Dirección / Coordinación / Auxiliares | Esencial |
| `RF-42` | Comparativa Gráfica entre Secciones | `RF-CAL-03` | Coordinación Académica / Dirección | Deseable |
| `RF-43` | Detección Visual de Cursos Críticos | `RF-CAL-04` | Dirección General / Coordinación | Deseable |
| `RF-44` | Tablero de Control para Dirección | `RF-MON-01` | Dirección General | Esencial |
| `RF-45` | Tablero de Monitoreo para Coordinación | `RF-MON-02` | Coordinación Académica | Esencial |
| `RF-46` | Tablero de Clases Diarias para Docentes | `RF-MON-03` | Docentes Nombrados y Contratados | Esencial |
| `RF-47` | Tablero Personal para el Estudiante | `RF-MON-04` | Estudiantes del Plantel | Esencial |
| `RF-48` | Alertas de Deserción y Repitencia | `RF-MON-05` | Coordinación Académica / Tutores | Esencial |
| `RF-49` | Boletas de Calificaciones Oficiales PDF | `RF-REP-01` | Secretaría / Docentes / Alumnos | Esencial |
| `RF-50` | Cuadro de Mérito y Puestos de Honor | `RF-REP-02` | Dirección General / Coordinación | Deseable |
| `RF-51` | Registro Auxiliar y Actas Finales | `RF-REP-03` | Docentes / Secretaría Académica | Esencial |
| `RF-52` | Reportes de Asistencia Multiactor | `RF-REP-04` | Dirección / Coordinación / Secretaría | Deseable |
| `RF-53` | Exportación Abierta en PDF y Excel | `RF-REP-05` | Toda la comunidad autorizada | Esencial |
| `RF-54` | Bitácora Inmutable de Auditoría | `RF-AUD-01` | Administrador TI / Dirección | Esencial |
| `RF-55` | Trazabilidad Histórica de Cambios | `RF-AUD-02` | Administrador TI / Dirección / Coord. | Esencial |
| `RF-56` | Monitoreo y Búsqueda en Auditoría | `RF-AUD-03` | Administrador TI / Dirección | Deseable |
| `RF-57` | Protección de Datos (Ley N.° 29733) | `RF-AUD-04` | Toda la comunidad escolar | Esencial |
| `RF-58` | Cartelera Digital de Comunicados | `RF-DIF-01` | Dirección / Toda la comunidad | Deseable |
| `RF-59` | Calendario Cívico y Escolar Interactivo | `RF-DIF-02` | Toda la comunidad escolar | Deseable |
| `RF-60` | Portal Informativo y Convivencia Escolar | `RF-DIF-03` | Toda la comunidad y público general | Opcional |
