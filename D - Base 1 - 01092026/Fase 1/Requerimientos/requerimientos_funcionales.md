# ESPECIFICACIÓN PRELIMINAR DE REQUERIMIENTOS FUNCIONALES (RF)

## TÍTULO DEL PROYECTO
**DESARROLLO E IMPLEMENTACIÓN DE UNA PLATAFORMA WEB PARA LA GESTIÓN ACADÉMICA E INFORMACIÓN INSTITUCIONAL EN LOS PLANTELES DE APLICACIÓN DE LA UNSCH**

- **Institución Beneficiaria:** Planteles de Aplicación "Guamán Poma de Ayala" – UNSCH (Ayacucho, Perú)
- **Marco Institucional:** Servicio Social Universitario (IS-480) – Escuela Profesional de Ingeniería de Sistemas (EPIS-UNSCH)
- **Fase del Proyecto:** Fase I – Diagnóstico y Formulación
- **Naturaleza del Documento:** Especificación Funcional de Negocio y Gestión Escolar (Enfoque No Técnico)

---

## 1. INTRODUCCIÓN Y CRITERIOS DE DEFINICIÓN

El presente documento consolida la lista preliminar y detallada de los **Requerimientos Funcionales (RF)** para la plataforma web de gestión académica e información institucional. La especificación ha sido construida a partir del análisis riguroso de:
1. Las **Delimitaciones del Proyecto** (`deliminatacions.md`), garantizando la cobertura de los módulos del piloto institucional y su preparación para escalabilidad futura.
2. Las **Limitaciones del Proyecto** (`limitaciones.md`), respetando las fronteras operativas del piloto (exclusión de módulos financieros, contables, planillas, aplicaciones nativas, servicios masivos de mensajería externa, algoritmos predictivos o acceso de padres de familia en esta etapa inicial).
3. Los **Metadatos Institucionales** (`metadatos.md`), asegurando la concordancia con los objetivos de difusión digital, administración integral y metas de rendimiento (KPIs).
4. La **Matriz Integral de Stakeholders** (`stakeholders.md`), respondiendo a las expectativas de la Dirección General, Coordinación Académica, Docentes Nombrados, Docentes Contratados, Practicantes de Educación, Estudiantes, Personal de Portería y Vigilancia ("Wachiman"), y Secretaría Académica.

### Enfoque No Técnico y Extenso
Conforme a las directrices metodológicas de ingeniería de software, cada requerimiento funcional describe **QUÉ** debe realizar el sistema desde la perspectiva del usuario y del proceso escolar, prescindiendo deliberadamente de tecnicismos de implementación (sin alusiones a sintaxis de bases de datos, código de programación o librerías específicas). Cada requerimiento se expone de manera extensa, especificando:
- **Código Identificador y Nombre**
- **Módulo de Trabajo Asociado**
- **Actores / Stakeholders Involucrados**
- **Nivel de Prioridad en el Piloto (Alta, Media, Baja)**
- **Descripción Extensa del Comportamiento Esperado**
- **Datos de Entrada**
- **Reglas de Negocio y Restricciones Operativas**
- **Flujo Funcional de la Operación**
- **Resultados y Salidas Producidas**
- **Criterios de Aceptación Funcionales**

---

## 2. ESTRUCTURA DE MÓDULOS DE TRABAJO

Los requerimientos funcionales se encuentran organizados en trece (13) módulos de trabajo:

1. **MÓDULO 1: Control de Acceso, Autenticación y Gestión de Sesiones** (`RF-SEG`)
2. **MÓDULO 2: Administración de Usuarios y Directorio Institucional** (`RF-USU`)
3. **MÓDULO 3: Configuración y Estructura Organizacional Escolar** (`RF-ADM`)
4. **MÓDULO 4: Gestión Académica, Padrón Escolar y Carga Lectiva** (`RF-ACA`)
5. **MÓDULO 5: Control y Gestión de Asistencia de Estudiantes** (`RF-AST`)
6. **MÓDULO 6: Control de Asistencia y Cumplimiento de Practicantes** (`RF-PRA`)
7. **MÓDULO 7: Control de Asistencia y Horas de Docentes Contratados** (`RF-DOC`)
8. **MÓDULO 8: Registro, Flujo y Seguimiento de Calificaciones en Tiempo Real** (`RF-NOT`)
9. **MÓDULO 9: Visualización mediante Mapas de Calor Institucionales** (`RF-CAL`)
10. **MÓDULO 10: Monitoreo Institucional, Dashboards y Alertas Tempranas** (`RF-MON`)
11. **MÓDULO 11: Emisión de Reportes, Actas y Documentación Escolar** (`RF-REP`)
12. **MÓDULO 12: Trazabilidad, Seguridad y Auditoría Institucional** (`RF-AUD`)
13. **MÓDULO 13: Plataforma de Difusión Digital y Comunicación Institucional** (`RF-DIF`)

---

## 3. MATRIZ DETALLADA DE REQUERIMIENTOS FUNCIONALES

```
========================================================================================
MÓDULO 1: CONTROL DE ACCESO, AUTENTICACIÓN Y GESTIÓN DE SESIONES (RF-SEG)
========================================================================================
```

### RF-SEG-01: Autenticación e Inicio de Sesión de Usuarios
- **Módulo:** Control de Acceso, Autenticación y Gestión de Sesiones
- **Actores:** Todos los roles autorizados (Administrador, Director, Coordinador, Docente Nombrado, Docente Contratado, Practicante, Estudiante, Personal de Portería).
- **Prioridad:** Alta (Crítica para el funcionamiento).
- **Descripción:** El sistema debe permitir a cualquier integrante de la comunidad educativa autenticarse de manera segura utilizando su identificador único institucional (número de DNI o correo institucional asignado) y su clave secreta personal. La interfaz de acceso debe validar la existencia y estado activo de la cuenta, verificando que el usuario pertenezca a la institución y posea un rol asignado vigente. Si los datos son correctos, el sistema debe redirigir al usuario inmediatamente a su panel de trabajo principal según su perfil.
- **Entradas:** Identificador de usuario (DNI o correo electrónico institucional) y contraseña secreta.
- **Reglas de Negocio:**
  - Solo podrán acceder aquellos usuarios con estado "Activo" en el periodo escolar vigente.
  - El sistema no debe permitir el ingreso con campos vacíos o con formatos inválidos de DNI/correo.
  - Ante tres (3) intentos consecutivos fallidos de inicio de sesión, el sistema debe bloquear temporalmente el acceso por un lapso configurable (por ejemplo, 15 minutos) para salvaguardar la seguridad de la cuenta.
  - Los mensajes de error ante credenciales incorrectas deben ser genéricos ("Credenciales no válidas") para no exponer si el error fue el usuario o la contraseña.
- **Flujo Funcional:**
  1. El usuario accede al portal web institucional y selecciona la opción de ingreso al sistema.
  2. Ingresa su DNI/correo y su contraseña secreta, y presiona el botón "Iniciar Sesión".
  3. El sistema valida la información ingresada.
  4. Si las credenciales son válidas y la cuenta está activa, el sistema genera la sesión de trabajo y presenta el panel inicial correspondiente al rol del usuario.
  5. Si las credenciales son inválidas, se muestra el mensaje de error y se contabiliza el intento fallido.
- **Salidas:** Acceso al panel de trabajo personalizado según rol y mensaje de bienvenida, o mensaje de alerta de error en caso de fallo.
- **Criterios de Aceptación:** El usuario legítimo ingresa en menos de 2 segundos. Usuarios bloqueados o con datos erróneos no acceden bajo ninguna circunstancia.

---

### RF-SEG-02: Cierre de Sesión Seguro y Control de Expiración por Inactividad
- **Módulo:** Control de Acceso, Autenticación y Gestión de Sesiones
- **Actores:** Todos los usuarios del sistema.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe ofrecer la opción explícita y visible de "Cerrar Sesión" en cualquier pantalla de la plataforma, permitiendo terminar la jornada de trabajo de forma inmediata y revocando el acceso activo en el navegador. Asimismo, el sistema debe monitorear la inactividad del usuario: si transcurre un periodo continuo sin interacción (por ejemplo, 20 minutos), el sistema debe suspender y cerrar automáticamente la sesión, solicitando nuevamente las credenciales para retomar la actividad, con el fin de proteger la privacidad de las notas y datos de los alumnos en computadoras compartidas de aulas o laboratorios.
- **Entradas:** Selección del comando "Cerrar Sesión" o detección de inactividad temporal en la interfaz.
- **Reglas de Negocio:**
  - Al cerrar sesión voluntariamente o por tiempo expirado, el usuario no debe poder retroceder en el navegador para ver información confidencial cargada previamente.
  - Toda modificación de notas o asistencias no guardada antes del cierre forzoso por inactividad debe prevenirse mediante advertencias previas en pantalla.
- **Flujo Funcional:**
  1. El usuario hace clic en su nombre de perfil y presiona "Cerrar Sesión", o bien transcurre el tiempo límite sin actividad de teclado o ratón.
  2. El sistema finaliza la sesión activa y limpia la información de trabajo del usuario.
  3. El sistema redirige automáticamente a la pantalla de inicio de sesión con un mensaje informativo de "Sesión cerrada correctamente" o "Sesión expirada por inactividad".
- **Salidas:** Retorno a la pantalla de identificación y confirmación de sesión cerrada.
- **Criterios de Aceptación:** Ninguna pantalla protegida debe ser visible tras el cierre de sesión mediante el botón "Atrás" del navegador.

---

### RF-SEG-03: Recuperación y Restablecimiento Asistido de Contraseña
- **Módulo:** Control de Acceso, Autenticación y Gestión de Sesiones
- **Actores:** Docentes, Practicantes, Estudiantes, Personal Administrativo, Administrador del Sistema.
- **Prioridad:** Media.
- **Descripción:** El sistema debe proporcionar un mecanismo para aquellos usuarios que hayan olvidado su contraseña secreta. El usuario podrá solicitar el restablecimiento ingresando su DNI y correo electrónico registrado; el sistema enviará un enlace temporal y seguro para fijar una nueva clave. Adicionalmente, para aquellos estudiantes o personal que no cuenten con correo activo o presenten dificultades, el Administrador del Sistema o la Coordinación Académica dispondrán de una función administrativa para restablecer la contraseña a un valor predeterminado seguro, obligando al usuario a cambiarla en su siguiente acceso.
- **Entradas:** DNI o correo registrado en la pantalla de recuperación; o solicitud administrativa directa ante soporte.
- **Reglas de Negocio:**
  - El enlace de restablecimiento tendrá una vigencia máxima de 30 minutos y solo podrá utilizarse una única vez.
  - La nueva contraseña debe cumplir con los requisitos mínimos institucionales de seguridad (mínimo 8 caracteres, combinación de letras y números).
  - No se permite reutilizar la misma contraseña inmediata anterior.
- **Flujo Funcional:**
  1. El usuario selecciona "¿Olvidó su contraseña?" en la pantalla de ingreso.
  2. Digita su documento de identidad y correo institucional o personal vinculado.
  3. El sistema verifica la coincidencia y remite las instrucciones de restablecimiento.
  4. El usuario abre el enlace recibido, define y confirma su nueva contraseña secreta.
  5. El sistema actualiza la contraseña y confirma que puede iniciar sesión nuevamente.
- **Salidas:** Mensaje de confirmación en pantalla, correo de notificación de restablecimiento y actualización de credencial en el sistema.
- **Criterios de Aceptación:** El usuario logra restaurar su acceso sin asistencia técnica externa en menos de 5 minutos, o con asistencia del administrador mediante reseteo seguro inmediato.

---

### RF-SEG-04: Control de Acceso Basado en Roles (RBAC) y Principio de Privilegio Mínimo
- **Módulo:** Control de Acceso, Autenticación y Gestión de Sesiones
- **Actores:** Administrador del Sistema, Dirección, Coordinación, Docentes, Practicantes, Estudiantes, Portería.
- **Prioridad:** Alta (Seguridad e integridad).
- **Descripción:** El sistema debe aplicar un control riguroso de accesos basado en perfiles y funciones institucionales (Role-Based Access Control). Cada pantalla, menú, botón de acción y reporte estará supeditado a los permisos del rol activo del usuario. Ningún usuario podrá visualizar, editar ni consultar información que no corresponda a su ámbito pedagógico o directivo asignado. Específicamente, los estudiantes solo tendrán facultades de consulta de sus propios registros académicos; los docentes solo gestionarán sus cursos y secciones asignadas; los practicantes registrarán su asistencia y apoyarán en calificaciones bajo supervisión; la portería solo accederá al registro de ingresos; y la alta dirección dispondrá de vistas consolidadas.
- **Entradas:** Rol asignado a la cuenta del usuario verificado tras la autenticación.
- **Reglas de Negocio:**
  - Los estudiantes no tienen bajo ninguna circunstancia permiso para registrar o modificar notas, justificaciones o asistencias.
  - Los docentes solo tienen acceso a los estudiantes inscritos en los cursos y secciones que tienen formalmente asignados en su carga lectiva.
  - Los directivos y coordinadores no pueden alterar notas directamente sin un procedimiento formal de apertura o justificación institucional.
- **Flujo Funcional:**
  1. El usuario inicia sesión.
  2. El sistema consulta su perfil y permisos asignados.
  3. Se renderiza la navegación mostrando exclusivamente los módulos y opciones autorizadas.
  4. Si el usuario intenta acceder a una sección no autorizada introduciendo una dirección web directa, el sistema intercepta la acción, deniega el acceso y registra el evento de seguridad.
- **Salidas:** Menú y panel adaptado estrictamente al rol correspondiente; mensajes de "Acceso Denegado" ante intentos no autorizados.
- **Criterios de Aceptación:** Un estudiante no puede acceder a interfaces de edición ni visualizar datos de otros compañeros. Un docente no puede alterar cursos de otros profesores.

---

```
========================================================================================
MÓDULO 2: ADMINISTRACIÓN DE USUARIOS Y DIRECTORIO INSTITUCIONAL (RF-USU)
========================================================================================
```

### RF-USU-01: Alta y Registro Centralizado de Cuentas de Personal Institucional
- **Módulo:** Administración de Usuarios y Directorio Institucional
- **Actores:** Administrador del Sistema, Coordinación Académica, Dirección General.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir el registro individual y masivo del personal institucional que labora en los Planteles de Aplicación (directivos, coordinadores pedagógicos, docentes nombrados, docentes contratados, practicantes de educación y personal de vigilancia/portería). El formulario de registro debe capturar la información personal y laboral requerida para su identificación en el plantel, asignando de manera obligatoria el rol operativo que desempeñará.
- **Entradas:** Tipo y número de documento (DNI), nombres completos, apellidos, fecha de nacimiento, sexo, correo electrónico institucional/personal, número telefónico de contacto, condición laboral (nombrado, contratado, practicante) y rol del sistema asignado.
- **Reglas de Negocio:**
  - El DNI es único en el sistema; no se permite registrar a dos usuarios con el mismo número de documento.
  - El correo electrónico debe ser válido y único para cada usuario registrado.
  - Al dar de alta una cuenta, el sistema debe generar una contraseña provisional que deberá ser modificada de manera obligatoria en el primer ingreso.
- **Flujo Funcional:**
  1. El administrador ingresa al módulo de "Gestión de Personal y Usuarios".
  2. Selecciona la opción "Nuevo Usuario".
  3. Completa los datos personales y de vinculación laboral, y asigna el rol correspondiente.
  4. Presiona "Guardar Registro".
  5. El sistema valida los datos (unicidad de DNI y correo) y da de alta al usuario, enviando las credenciales iniciales de acceso.
- **Salidas:** Ficha de usuario creada, notificación de alta y confirmación en pantalla.
- **Criterios de Aceptación:** El usuario registrado puede iniciar sesión con las credenciales provisionales generadas.

---

### RF-USU-02: Modificación, Actualización de Datos y Desactivación (Baja Lógica) de Usuarios
- **Módulo:** Administración de Usuarios y Directorio Institucional
- **Actores:** Administrador del Sistema, Coordinación Académica.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir modificar los datos informativos del personal institucional en caso de correcciones ortográficas, cambio de número telefónico o actualización de correo de contacto. Asimismo, cuando un docente, practicante o trabajador culmine su relación contractual o periodo de prácticas con el plantel, el sistema debe permitir deshabilitar su cuenta mediante una baja lógica (cambio de estado a "Inactivo" o "Cesado"), inhabilitando su acceso a la plataforma sin borrar su historial académico, asistencias pasadas ni calificaciones registradas.
- **Entradas:** Búsqueda del usuario por DNI o apellidos, edición de los campos habilitados, o selección de la acción "Desactivar Cuenta" con indicación del motivo del cese.
- **Reglas de Negocio:**
  - No se permite la eliminación física (borrado permanente) de usuarios que posean registros históricos de notas, asistencias o firmas en actas.
  - Una cuenta en estado "Inactivo" no podrá iniciar sesión bajo ninguna circunstancia.
  - Toda reactivación de cuenta debe ser ejecutada por el Administrador con registro de motivo.
- **Flujo Funcional:**
  1. El administrador localiza la cuenta del usuario en el listado institucional.
  2. Selecciona "Editar" para actualizar datos o "Desactivar" para suspender el acceso.
  3. Confirma los cambios realizados.
  4. El sistema actualiza el registro e impide inmediatamente futuros accesos si fue desactivado.
- **Salidas:** Registro de usuario actualizado y cambio de estado visible en el directorio.
- **Criterios de Aceptación:** El usuario desactivado no puede ingresar al sistema; todos sus registros históricos se conservan intactos.

---

### RF-USU-03: Asignación y Cambio de Roles del Personal
- **Módulo:** Administración de Usuarios y Directorio Institucional
- **Actores:** Administrador del Sistema, Dirección General.
- **Prioridad:** Media.
- **Descripción:** El sistema debe permitir cambiar o ajustar el rol asignado a un usuario existente cuando se presenten promociones o reasignaciones internas (por ejemplo, un docente nombrado que asume la función de Coordinador Académico, o un practicante que pasa a docente contratado). La modificación del rol debe actualizar de inmediato los permisos de acceso y navegación en la plataforma a partir de su siguiente sesión.
- **Entradas:** Selección del usuario institucional, elección del nuevo rol en el catálogo predefinido y fecha de vigencia de la designación.
- **Reglas de Negocio:**
  - Solo el Administrador del Sistema con visto bueno de la Dirección General puede realizar cambios de rol a perfiles jerárquicos (Directores o Coordinadores).
  - Si un usuario cambia de rol, sus acciones pasadas registradas bajo su rol anterior quedan inalteradas en la auditoría.
- **Flujo Funcional:**
  1. El administrador ingresa a los detalles del usuario y accede a "Roles y Privilegios".
  2. Selecciona el nuevo rol correspondiente y guarda los cambios.
  3. El sistema registra el cambio en la bitácora institucional y actualiza los privilegios del perfil.
- **Salidas:** Notificación de actualización de permisos y asignación del nuevo rol.
- **Criterios de Aceptación:** Al volver a ingresar, el usuario dispone de los menús y funciones de su nuevo cargo.

---

### RF-USU-04: Consulta, Búsqueda Avanzada y Filtro del Directorio de Personal
- **Módulo:** Administración de Usuarios y Directorio Institucional
- **Actores:** Dirección General, Coordinación Académica, Secretaría, Administrador del Sistema.
- **Prioridad:** Media.
- **Descripción:** El sistema debe contar con una herramienta ágil de búsqueda y consulta del directorio de personal institucional. Debe ser posible realizar búsquedas en tiempo real por apellidos, nombres, número de DNI, rol desempeñado, condición laboral (nombrado, contratado, practicante) y estado de la cuenta (activo, inactivo).
- **Entradas:** Criterios de búsqueda ingresados por el usuario (texto libre o filtros combinados).
- **Reglas de Negocio:**
  - El tiempo de respuesta de las búsquedas en el directorio no debe superar los 2 segundos para la nómina del plantel.
  - Los resultados deben ordenarse alfabéticamente por defecto.
- **Flujo Funcional:**
  1. El usuario directivo o administrativo ingresa a la opción "Directorio de Personal".
  2. Aplica los filtros de búsqueda (por ejemplo, rol: "Docente Contratado" y estado: "Activo").
  3. El sistema muestra la lista consolidada de coincidencias con su información básica de contacto y asignación.
- **Salidas:** Tabla en pantalla con los usuarios coincidentes, con opciones para ver su legajo o descargar el listado en formato imprimible.
- **Criterios de Aceptación:** Búsqueda rápida y exacta con coincidencias parciales por nombre o DNI.

---

### RF-USU-05: Gestión del Perfil Personal y Cambio de Contraseña por el Usuario
- **Módulo:** Administración de Usuarios y Directorio Institucional
- **Actores:** Todos los usuarios del sistema (Docentes, Practicantes, Estudiantes, Directivos).
- **Prioridad:** Media.
- **Descripción:** El sistema debe ofrecer a cada usuario autenticado una sección privada para consultar sus datos básicos de identificación, actualizar sus medios de contacto (correo electrónico personal, número de teléfono móvil) y modificar periódicamente su contraseña de acceso institucional para mantener la seguridad de su cuenta.
- **Entradas:** Contraseña actual (para validar identidad), nueva contraseña deseada, confirmación de la nueva contraseña y datos de contacto actualizados.
- **Reglas de Negocio:**
  - Para cambiar la contraseña, el usuario debe ingresar obligatoriamente su contraseña actual correcta.
  - Los campos sensibles de identidad (como número de DNI o nombres y apellidos oficiales) no pueden ser modificados por el propio usuario, debiendo ser tramitados ante la secretaría o administración.
- **Flujo Funcional:**
  1. El usuario hace clic en su fotografía/nombre y selecciona "Mi Perfil".
  2. Visualiza sus datos personales y selecciona la pestaña "Seguridad".
  3. Ingresa su clave actual y la nueva clave dos veces.
  4. Presiona "Actualizar Contraseña".
  5. El sistema valida las condiciones de seguridad y actualiza la clave.
- **Salidas:** Mensaje de éxito en pantalla y confirmación de contraseña actualizada.
- **Criterios de Aceptación:** La nueva clave surte efecto inmediato; las credenciales anteriores quedan invalidadas.

---

```
========================================================================================
MÓDULO 3: ADMINISTRACIÓN Y ESTRUCTURA ORGANIZACIONAL ESCOLAR (RF-ADM)
========================================================================================
```

### RF-ADM-01: Configuración de Datos Institucionales del Plantel y Sedes
- **Módulo:** Administración y Estructura Organizacional Escolar
- **Actores:** Administrador del Sistema, Dirección General.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir parametrizar y mantener actualizada la ficha general de los Planteles de Aplicación "Guamán Poma de Ayala", incluyendo su nombre oficial, código modular, logotipo institucional, dirección de la sede física en Huamanga/Ayacucho, teléfono institucional, lema y datos de las autoridades educativas. Estos datos se utilizarán de forma transversal en los membretes, reportes oficiales, actas escolares y boletas de notas.
- **Entradas:** Nombre oficial del plantel, código modular, dirección física, logotipo en formato de imagen, correo institucional de contacto, teléfono y nombre del Director(a) General.
- **Reglas de Negocio:**
  - El sistema debe validar que el logotipo cargado sea una imagen de formato estándar y dimensiones adecuadas para no distorsionar los encabezados de reportes.
  - Los cambios en la información institucional se reflejarán automáticamente en todos los documentos y reportes que se generen a partir de la fecha de guardado.
- **Flujo Funcional:**
  1. El administrador ingresa a "Configuración Institucional".
  2. Actualiza los campos correspondientes a la sede institucional del plantel.
  3. Carga el logotipo oficial de los Planteles de Aplicación.
  4. Presiona "Guardar Configuración".
- **Salidas:** Ficha institucional actualizada y visualización del nuevo membrete en los formatos y encabezados del sistema.
- **Criterios de Aceptación:** Los reportes y boletas muestran el membrete y logotipo actualizado correctamente.

---

### RF-ADM-02: Parametrización y Gestión de Periodos Lectivos y Calendario Escolar
- **Módulo:** Administración y Estructura Organizacional Escolar
- **Actores:** Dirección General, Coordinación Académica, Administrador del Sistema.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir crear y estructurar los años académicos (por ejemplo, "Año Escolar 2026"), dividiéndolos en sus periodos regulares de evaluación pedagógica (bimestres o trimestres). Para cada periodo se deben definir las fechas exactas de inicio, fin y las fechas límites permitidas para el ingreso regular de calificaciones por parte de los docentes.
- **Entradas:** Denominación del año lectivo, fecha de inicio y finalización del año, modalidad de periodos (bimestral o trimestral), denominación de cada periodo (Bimestre I, Bimestre II, etc.), fechas de inicio y cierre de cada periodo, y fecha límite de entrega de calificaciones.
- **Reglas de Negocio:**
  - Solo puede existir un único año académico en estado "En Curso" de manera simultánea en el plantel.
  - Los rangos de fechas de los bimestres/trimestres no deben traslaparse cronológicamente.
  - Al vencer la fecha límite de un periodo, el sistema debe inhabilitar de manera automática el registro ordinario de calificaciones docentes en dicho periodo.
- **Flujo Funcional:**
  1. El coordinador o administrador ingresa a "Periodos Académicos".
  2. Crea el periodo escolar correspondiente y define la división bimestral con sus fechas límite.
  3. Guarda la estructura del año.
  4. El sistema habilita el periodo para las operaciones de matrícula, carga lectiva y asistencia.
- **Salidas:** Calendario lectivo activo en el sistema y visualización de plazos en los módulos docentes.
- **Criterios de Aceptación:** El sistema restringe la carga de notas una vez alcanzada la fecha de cierre del periodo sin excepción.

---

### RF-ADM-03: Definición y Gestión de Niveles Educativos, Grados y Secciones
- **Módulo:** Administración y Estructura Organizacional Escolar
- **Actores:** Coordinación Académica, Administrador del Sistema.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir parametrizar la estructura educativa formal del plantel, incluyendo los niveles atendidos (Primaria, Secundaria), sus correspondientes grados lectivos (desde 1° hasta 6° de Primaria; 1° a 5° de Secundaria) y las secciones correspondientes (por ejemplo, Sección "A", "B", "C"). Asimismo, se debe permitir especificar el aforo máximo de estudiantes por sección y el aula física designada.
- **Entradas:** Selección del nivel educativo, número y nombre del grado, identificador de sección, turno (mañana/tarde), aula física y capacidad máxima de vacantes.
- **Reglas de Negocio:**
  - No pueden existir dos secciones con la misma denominación en el mismo nivel y grado dentro de un mismo periodo.
  - El aforo máximo debe servir como límite preventivo al momento de matricular estudiantes.
- **Flujo Funcional:**
  1. El usuario administrativo accede a "Estructura Escolar -> Grados y Secciones".
  2. Selecciona el nivel y grado académico.
  3. Agrega las secciones requeridas para el año escolar activo y define su capacidad máxima.
  4. Guarda la configuración.
- **Salidas:** Estructura de grados y secciones disponible para matrícula y asignación horaria.
- **Criterios de Aceptación:** Las secciones creadas aparecen habilitadas para la conformación de nóminas de estudiantes.

---

### RF-ADM-04: Parametrización del Catálogo Curricular y Planes de Estudio (Áreas y Cursos)
- **Módulo:** Administración y Estructura Organizacional Escolar
- **Actores:** Coordinación Académica, Dirección General.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir configurar el plan de estudios institucional conforme a las directrices pedagógicas vigentes (alineadas con el Currículo Nacional / MINEDU), organizando las áreas curriculares (por ejemplo: Matemática, Comunicación, Ciencias Sociales, Ciencia y Tecnología, Educación para el Trabajo, etc.) y las asignaturas o cursos específicos que las integran para cada grado de primaria y secundaria. Asimismo, debe permitir registrar las competencias y criterios pedagógicos base asociados a cada área.
- **Entradas:** Código del curso, nombre de la asignatura, área curricular a la que pertenece, nivel educativo, grado al que corresponde, número de horas semanales y lista de competencias a evaluar.
- **Reglas de Negocio:**
  - Cada curso debe estar obligatoriamente vinculado a un grado y área curricular específica.
  - Cada curso debe tener al menos una competencia evaluable definida para el cálculo de calificaciones.
- **Flujo Funcional:**
  1. El coordinador académico ingresa a "Plan de Estudios / Malla Curricular".
  2. Selecciona el grado educativo y presiona "Agregar Asignatura".
  3. Define el nombre del curso, área, horas lectivas y detalla las competencias pedagógicas.
  4. Presiona "Guardar Asignatura".
- **Salidas:** Catálogo curricular institucional configurado y listo para la asignación de carga docente.
- **Criterios de Aceptación:** Cada grado muestra su plan de asignaturas completo con sus respectivas competencias curriculares.

---

### RF-ADM-05: Parametrización de Escalas de Calificación y Criterios Evaluativos
- **Módulo:** Administración y Estructura Organizacional Escolar
- **Actores:** Coordinación Académica, Dirección General, Administrador del Sistema.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir configurar la escala oficial de calificación aplicable en la institución según el nivel educativo y las normas del sector, soportando tanto la escala vigesimal tradicional (numérica de 0 a 20 con nota mínima aprobatoria de 11) como la escala cualitativa / formativa literal (AD: Logro Destacado, A: Logro Esperado, B: En Proceso, C: En Inicio). Debe permitir definir el valor aprobatorio mínimo y la tabla de equivalencias oficial para los reportes consolidados.
- **Entradas:** Tipo de escala (vigesimal o literal), rango mínimo y máximo de calificación, nota mínima de aprobación, y textos descriptivos de cada nivel de logro.
- **Reglas de Negocio:**
  - El sistema debe impedir el ingreso de valores fuera del rango parametrizado (por ejemplo, notas negativas o superiores a 20 en la vigesimal, o letras no reconocidas en la literal).
  - Una vez iniciado el año lectivo y habiendo notas registradas, la escala evaluativa no podrá modificarse sin la debida autorización de la Dirección General.
- **Flujo Funcional:**
  1. La Coordinación accede a "Parámetros de Calificación".
  2. Define la escala para cada nivel (por ejemplo, literal para primaria y los primeros grados de secundaria, o vigesimal según la directiva del plantel).
  3. Establece los rangos de aprobación y redondeo oficial.
  4. Guarda las reglas evaluativas.
- **Salidas:** Reglas de validación aplicadas transversalmente a todos los registros de notas y actas.
- **Criterios de Aceptación:** Los formularios de ingreso de notas impiden estrictamente caracteres o números fuera de la escala definida.

---

```
========================================================================================
MÓDULO 4: GESTIÓN ACADÉMICA, PADRÓN ESCOLAR Y CARGA LECTIVA (RF-ACA)
========================================================================================
```

### RF-ACA-01: Registro y Mantenimiento del Padrón de Estudiantes
- **Módulo:** Gestión Académica, Padrón Escolar y Carga Lectiva
- **Actores:** Secretaría Académica, Coordinación, Administrador del Sistema.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir registrar, consultar y actualizar la información de filiación e identidad de los estudiantes de los Planteles de Aplicación. La ficha del estudiante debe almacenar sus datos personales esenciales de identificación, fecha de nacimiento, sexo, lugar de residencia, así como los datos de contacto de referencia (sin incluir datos sensibles médicos ni financieros, de acuerdo con la delimitación del proyecto).
- **Entradas:** DNI del estudiante, nombres y apellidos completos, fecha de nacimiento, sexo, dirección de domicilio, número telefónico de referencia y estado del alumno (regular, trasladado, retirado).
- **Reglas de Negocio:**
  - El DNI del estudiante debe ser único en toda la base de datos institucional.
  - En cumplimiento de la Ley N.° 29733 de Protección de Datos Personales, la información de los estudiantes menores de edad es estrictamente confidencial y solo accesible por el personal autorizado.
  - No se eliminan estudiantes con historial académico; se gestionan mediante estados escolares.
- **Flujo Funcional:**
  1. El personal de secretaría accede a "Padrón de Estudiantes".
  2. Selecciona "Registrar Estudiante" (o carga masiva de nómina institucional).
  3. Digita los datos de identificación del menor y valida que no existan duplicados.
  4. Guarda el registro escolar.
- **Salidas:** Ficha del estudiante creada en el padrón institucional y generación de su usuario de consulta.
- **Criterios de Aceptación:** El estudiante queda habilitado para ser matriculado en el grado y sección correspondiente.

---

### RF-ACA-02: Matrícula y Asignación de Estudiantes a Grados y Secciones
- **Módulo:** Gestión Académica, Padrón Escolar y Carga Lectiva
- **Actores:** Secretaría Académica, Coordinación Académica.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir matricular a los estudiantes debidamente registrados en el padrón dentro de un grado y sección específicos para el periodo escolar vigente. Asimismo, debe permitir la reubicación de sección y la emisión inmediata de la nómina preliminar de alumnos matriculados por aula.
- **Entradas:** Selección del estudiante desde el padrón, selección del año académico, nivel, grado y sección destino, y condición de matrícula (nuevo ingreso, promovido, repitente).
- **Reglas de Negocio:**
  - Un estudiante solo puede estar matriculado en una única sección durante un periodo académico activo.
  - El sistema debe alertar al operador si la sección destino ha alcanzado o superado el aforo máximo parametrizado.
- **Flujo Funcional:**
  1. El usuario de secretaría ingresa a "Matrícula Escolar".
  2. Busca al estudiante por su DNI o apellidos.
  3. Selecciona el grado y sección en el que será matriculado.
  4. Confirma la matrícula.
  5. El sistema incorpora al estudiante en las listas de asistencia y registros de notas de todas las asignaturas correspondientes a dicha aula.
- **Salidas:** Constancia de matrícula interna y actualización inmediata de la nómina de la sección.
- **Criterios de Aceptación:** El alumno aparece automáticamente en los listados de clase de todos los docentes asignados a esa sección.

---

### RF-ACA-03: Asignación de Carga Lectiva Docente (Nombrados y Contratados)
- **Módulo:** Gestión Académica, Padrón Escolar y Carga Lectiva
- **Actores:** Coordinación Académica, Dirección General.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir a la Coordinación Académica distribuir y asignar la carga horaria y pedagógica de cada docente (nombrado o contratado), vinculándolo formalmente con las asignaturas, grados y secciones que tendrá a su cargo durante el año lectivo. Esta asignación definirá automáticamente los permisos de cada profesor para registrar notas y tomar asistencia diaria.
- **Entradas:** Selección del docente institucional, selección de la asignatura, grado, sección y número de horas semanales de dedicación.
- **Reglas de Negocio:**
  - No se puede asignar un mismo curso en la misma sección a dos docentes titulares distintos, a menos que se trate de un esquema de co-enseñanza formalmente habilitado.
  - El docente asignado es el único habilitado para registrar y firmar digitalmente las calificaciones del curso correspondiente.
- **Flujo Funcional:**
  1. El Coordinador ingresa a "Distribución de Carga Lectiva".
  2. Selecciona al docente del directorio.
  3. Agrega las asignaturas y secciones a su cargo.
  4. Guarda la asignación lectiva.
- **Salidas:** Horario y carga académica del profesor registrada; habilitación de cursos en el panel docente.
- **Criterios de Aceptación:** El docente, al iniciar sesión, visualiza de inmediato los cursos y listas de estudiantes que le fueron asignados.

---

### RF-ACA-04: Asignación Pedagógica y Vinculación de Practicantes de Educación
- **Módulo:** Gestión Académica, Padrón Escolar y Carga Lectiva
- **Actores:** Coordinación Académica, Docentes Titulares.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir vincular a los practicantes preprofesionales de las facultades de educación de la UNSCH con los docentes tutores nombrados y con las aulas/secciones en las que desarrollarán su apoyo pedagógico. Esta vinculación delimitará su rango de acción y habilitará la supervisión de sus actividades y asistencia.
- **Entradas:** Selección del practicante, docente tutor asignado, área curricular de práctica, sección y turno escolar.
- **Reglas de Negocio:**
  - Todo practicante debe tener obligatoriamente un docente titular como supervisor institucional.
  - Las acciones pedagógicas del practicante (como apoyo en registro de notas) estarán condicionadas a la supervisión y validación del docente tutor.
- **Flujo Funcional:**
  1. La Coordinación accede a "Gestión de Practicantes".
  2. Selecciona al practicante y le asigna el docente tutor titular y el aula asignada.
  3. Confirma la vinculación.
- **Salidas:** Registro de vinculación pedagógica activa y notificación al docente tutor sobre su practicante a cargo.
- **Criterios de Aceptación:** El docente tutor y el coordinador visualizan al practicante en el panel de su aula correspondiente.

---

### RF-ACA-05: Consulta y Directorio del Legajo Académico de Estudiantes por Sección
- **Módulo:** Gestión Académica, Padrón Escolar y Carga Lectiva
- **Actores:** Dirección, Coordinación, Docentes de Sección, Secretaría.
- **Prioridad:** Media.
- **Descripción:** El sistema debe ofrecer una vista unificada y ordenada de la nómina de estudiantes por cada grado y sección. Esta vista permitirá a los docentes y directivos consultar la lista oficial de alumnos con fotografía (opcional), condición escolar, porcentaje de asistencia acumulada y resumen de estado de calificaciones por periodo.
- **Entradas:** Filtro por nivel, grado y sección.
- **Reglas de Negocio:**
  - Los docentes solo pueden visualizar la nómina completa de las secciones donde imparten clases.
  - La información de contacto personal se mantiene restringida de acuerdo con el perfil del usuario.
- **Flujo Funcional:**
  1. El docente o coordinador selecciona un grado y sección de su panel.
  2. Presiona "Ver Nómina de Alumnos".
  3. El sistema lista a los estudiantes ordenados alfabéticamente por apellido paterno, materno y nombres.
- **Salidas:** Tabla en pantalla con la nómina de alumnos y opciones para exportar o imprimir la lista oficial de clase.
- **Criterios de Aceptación:** Despliegue de la nómina completa en menos de 1 segundo.

---

```
========================================================================================
MÓDULO 5: CONTROL Y GESTIÓN DE ASISTENCIA DE ESTUDIANTES (RF-AST)
========================================================================================
```

### RF-AST-01: Registro Diario de Asistencia Escolar por Sesión de Clase
- **Módulo:** Control y Gestión de Asistencia de Estudiantes
- **Actores:** Docentes Nombrados, Docentes Contratados, Practicantes (apoyo autorizado).
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir a los docentes registrar la asistencia de los estudiantes en cada sesión o bloque de clases programado. La interfaz debe mostrar la nómina oficial del aula en una cuadrícula intuitiva, permitiendo marcar de forma rápida el estado de cada estudiante: Presente (P), Tardanza (T), Falta Injustificada (F) o Falta Justificada (J). Por defecto, el sistema ofrecerá una opción de marcado rápido ("Marcar Todos Presentes") para agilizar el registro y enfocar el tiempo en las excepciones (faltas o demoras).
- **Entradas:** Selección de fecha, bloque horario/curso, sección, y asignación de estado de asistencia a cada estudiante de la lista.
- **Reglas de Negocio:**
  - No se permite registrar asistencia de fechas futuras.
  - La edición de una asistencia pasada solo se permite dentro de las 24 horas posteriores a la clase; fuera de dicho lapso, cualquier modificación requerirá justificación formal aprobada por Coordinación.
  - El registro debe computar la fecha y hora exacta en la que el docente guardó la información.
- **Flujo Funcional:**
  1. El docente ingresa a "Control de Asistencia" y selecciona su curso y sección del día.
  2. El sistema muestra la lista de estudiantes con el estado "Presente" preseleccionado.
  3. El docente modifica el estado de los alumnos ausentes o con tardanza.
  4. Presiona "Guardar Asistencia".
  5. El sistema consolida la información y emite confirmación de guardado.
- **Salidas:** Registro de asistencia guardado y visible en el panel del estudiante y de coordinación.
- **Criterios de Aceptación:** Registro ágil de una lista de 35 estudiantes en menos de 30 segundos mediante marcado rápido.

---

### RF-AST-02: Registro Ágil de Asistencia e Ingreso Físico en Portería ("Wachiman")
- **Módulo:** Control y Gestión de Asistencia de Estudiantes
- **Actores:** Personal de Portería y Vigilancia ("Wachiman"), Auxiliares de Educación.
- **Prioridad:** Media (Módulo Operativo de Portería).
- **Descripción:** El sistema debe proporcionar una interfaz web simplificada en modo kiosco/terminal rápida, diseñada específicamente para el personal de portería y control de puerta ("Wachiman"). La interfaz permitirá registrar el ingreso físico de los alumnos al plantel al momento de cruzar la puerta escolar, digitando el número de DNI o mediante la lectura del código de barras/QR del carné escolar utilizando un lector óptico estándar. El sistema registrará el segundo exacto del ingreso y calculará automáticamente si el alumno ingresó en hora puntual o con minutos de tardanza en función del horario de entrada institucional parametrizado.
- **Entradas:** Lectura o digitación del DNI del estudiante al ingresar por la puerta del plantel.
- **Reglas de Negocio:**
  - La interfaz debe emitir una retroalimentación visual clara e inmediata (pantalla verde con sonido positivo: "Ingreso Autorizado Puntual"; pantalla amarilla: "Tardanza Registrada"; pantalla roja con sonido de alerta: "DNI no registrado / Alumno no matriculado").
  - Si el ingreso ocurre después de la hora límite matutina/vespertina, se cataloga automáticamente como "Tardanza" registrando los minutos de demora.
- **Flujo Funcional:**
  1. El vigilante escolar mantiene abierta la pantalla de "Control de Puerta".
  2. Al aproximarse el alumno, se escanea su código de carné o se tipea su DNI de 8 dígitos.
  3. El sistema procesa el documento en tiempo real, registra la marca de tiempo de entrada y muestra la fotografía, nombre del alumno, grado y sección.
  4. Muestra el estado (Puntual o Tardanza) y limpia automáticamente el campo para el siguiente estudiante en 1 segundo.
- **Salidas:** Registro instantáneo de ingreso en el récord diario del alumno y alerta visual en pantalla.
- **Criterios de Aceptación:** Procesamiento de cada ingreso en menos de 1 segundo sin bloquear la fila de entrada.

---

### RF-AST-03: Registro y Justificación de Inasistencias y Tardanzas Escolares
- **Módulo:** Control y Gestión de Asistencia de Estudiantes
- **Actores:** Coordinación Académica, Auxiliares de Educación, Secretaría.
- **Prioridad:** Media.
- **Descripción:** El sistema debe permitir gestionar y registrar las justificaciones formales de inasistencias o tardanzas presentadas por los apoderados o alumnos (por motivos médicos, familiares o fortuitos). Al aprobar una justificación, el sistema debe cambiar el estado de la asistencia de "Falta Injustificada" a "Falta Justificada", registrando el documento de sustento, motivo y la fecha de atención.
- **Entradas:** Selección del estudiante, fecha(s) de la inasistencia a justificar, motivo de la justificación, número de documento de sustento y observaciones.
- **Reglas de Negocio:**
  - Solo el personal autorizado (Coordinación Académica y Auxiliares) puede formalizar justificaciones de inasistencia.
  - Al justificarse una falta, el cómputo del récord disciplinario y las alertas de deserción se recalculan inmediatamente.
- **Flujo Funcional:**
  1. El personal de coordinación ingresa a "Justificación de Asistencias".
  2. Localiza al alumno por su DNI y selecciona el rango de fechas a justificar.
  3. Ingresa los datos del sustento (por ejemplo, "Certificado médico N° 124") y guarda el trámite.
  4. El sistema actualiza el registro diario de asistencia del estudiante a "Justificada".
- **Salidas:** Estado de asistencia actualizado y constancia interna de justificación registrada en el legajo del alumno.
- **Criterios de Aceptación:** Las faltas justificadas se descuentan del índice de inasistencia sancionable de forma inmediata.

---

### RF-AST-04: Consolidación y Consulta del Récord Histórico de Asistencias por Estudiante
- **Módulo:** Control y Gestión de Asistencia de Estudiantes
- **Actores:** Estudiantes, Docentes, Coordinación, Dirección General.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe procesar y consolidar continuamente el récord de asistencia de cada estudiante a lo largo del año lectivo, permitiendo consultar el total de asistencias puntuales, tardanzas justificadas e injustificadas, y faltas registradas, calculando el porcentaje global de asistencia del alumno por periodo y por asignatura.
- **Entradas:** Selección del periodo o rango de fechas, y selección del estudiante o consulta propia del alumno autenticado.
- **Reglas de Negocio:**
  - El estudiante tiene acceso de solo lectura exclusivamente a su propio récord personal de asistencia.
  - El sistema debe calcular el porcentaje acumulado sobre la base de las sesiones efectivamente programadas y dictadas hasta la fecha.
- **Flujo Funcional:**
  1. El usuario (o el alumno desde su perfil) hace clic en "Mi Asistencia".
  2. El sistema despliega un calendario interactivo o tabla con el detalle diario y el balance porcentual (ejemplo: 95% de asistencia).
- **Salidas:** Reporte visual del récord de asistencias y balance consolidado.
- **Criterios de Aceptación:** Cálculo aritmético exacto del 100% de las sesiones registradas sin discrepancias.

---

### RF-AST-05: Detección y Notificación de Alertas por Inasistencia Reiterada
- **Módulo:** Control y Gestión de Asistencia de Estudiantes
- **Actores:** Coordinación Académica, Dirección General, Docentes Tutores.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe supervisar de forma automatizada las inasistencias acumuladas por los estudiantes. Cuando un alumno alcance un umbral crítico parametrizado (por ejemplo, tres inasistencias injustificadas consecutivas o el 10% de inasistencias en el periodo), el sistema debe generar una alerta preventiva visible en el panel del docente y del coordinador académico para evitar la deserción escolar y coordinar acciones tutoriales inmediatas.
- **Entradas:** Evaluación automática de las marcas de asistencia registradas en el sistema.
- **Reglas de Negocio:**
  - La alerta se activa de inmediato tras el guardado de la lista de asistencia que supera el límite establecido.
  - Las alertas de riesgo por inasistencia se categorizan en niveles (Amarillo: Preventivo; Naranja: Riesgo moderado; Rojo: Riesgo grave de deserción).
- **Flujo Funcional:**
  1. El docente registra la inasistencia de un alumno.
  2. El sistema detecta que se alcanzó el límite configurado.
  3. El sistema añade una insignia de alerta junto al nombre del alumno en las listas del aula y notifica en el panel de Coordinación Académica.
- **Salidas:** Notificación en el panel de control y resalte visual en los listados del aula.
- **Criterios de Aceptación:** Visualización clara del indicador de riesgo escolar en el panel directivo.

---

```
========================================================================================
MÓDULO 6: CONTROL DE ASISTENCIA Y CUMPLIMIENTO DE PRACTICANTES (RF-PRA)
========================================================================================
```

### RF-PRA-01: Registro Diario de Ingreso, Salida y Permanencia de Practicantes
- **Módulo:** Control de Asistencia y Cumplimiento de Practicantes
- **Actores:** Practicantes de Educación, Personal de Portería, Coordinación Académica.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir a los practicantes de las facultades de educación registrar su jornada de apoyo pedagógico en el plantel, marcando de forma precisa su horario de entrada y de salida. El marcaje se podrá realizar desde un terminal autorizado en portería o mediante la sesión web del practicante dentro de la red del colegio, registrando la hora exacta, el aula o docente titular con el que colaboró durante la jornada.
- **Entradas:** Identificación del practicante, registro de marca de entrada, registro de marca de salida, y selección de actividades o docente apoyado.
- **Reglas de Negocio:**
  - El practicante no puede registrar su salida si no cuenta con una entrada registrada el mismo día.
  - El sistema no permite modificar la hora del sistema registrada por el reloj del servidor.
- **Flujo Funcional:**
  1. El practicante ingresa a su módulo "Marcación de Prácticas".
  2. Al llegar presiona "Registrar Entrada"; el sistema guarda la marca temporal.
  3. Al concluir su jornada pedagógica presiona "Registrar Salida".
  4. El sistema calcula las horas y minutos cronológicos cumplidos en la sesión.
- **Salidas:** Registro de jornada diaria almacenado con sello de tiempo.
- **Criterios de Aceptación:** Registro inalterable de la jornada con hora y minuto exacto.

---

### RF-PRA-02: Cómputo Acumulativo de Horas Efectivas de Práctica Preprofesional
- **Módulo:** Control de Asistencia y Cumplimiento de Practicantes
- **Actores:** Practicantes, Coordinación Académica, Docentes Tutores.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe mantener una cuenta corriente acumulativa de las horas de práctica efectivamente asistidas y validadas por cada practicante a lo largo de su periodo de asignación en los Planteles de Aplicación. El practicante y sus supervisores podrán consultar en cualquier momento el total de horas acumuladas respecto a la meta establecida para su plan de prácticas universitarias (por ejemplo, 96 horas lectivas).
- **Entradas:** Consulta por practicante del periodo de práctica.
- **Reglas de Negocio:**
  - Solo se contabilizan en el cómputo oficial las horas que hayan recibido la conformidad del docente tutor o coordinación.
  - El cómputo debe diferenciar entre horas presenciales de aula y horas de apoyo en actividades extracurriculares.
- **Flujo Funcional:**
  1. El practicante ingresa a "Mi Progreso de Prácticas".
  2. El sistema exhibe una barra de avance con las horas aprobadas, pendientes y el total requerido.
- **Salidas:** Gráfico de avance y tabla consolidada de horas cumplidas.
- **Criterios de Aceptación:** Actualización inmediata del contador tras la validación de cada jornada.

---

### RF-PRA-03: Validación y Aprobación Periódica de Horas por el Docente Titular o Coordinador
- **Módulo:** Control de Asistencia y Cumplimiento de Practicantes
- **Actores:** Docentes Titulares, Coordinación Académica.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe ofrecer al docente tutor titular una bandeja de revisión para validar las asistencias y horas registradas por los practicantes asignados a su aula. El docente podrá dar su conformidad ("Aprobado"), solicitar corrección o rechazar jornadas en caso de que el practicante se haya ausentado o no haya cumplido con las tareas encomendadas.
- **Entradas:** Lista de jornadas pendientes de validación, selección de estado (Aprobar/Observar) y comentarios del docente.
- **Reglas de Negocio:**
  - La validación es requisito indispensable para que las horas se consideren oficiales en los informes universitarios.
  - El docente no puede validar jornadas correspondientes a otros practicantes fuera de su asignación.
- **Flujo Funcional:**
  1. El docente accede a "Supervisión de Practicantes".
  2. Revisa el listado de entradas y salidas de la semana registradas por su practicante.
  3. Presiona "Dar Conformidad a la Semana".
  4. El sistema actualiza el estado de las horas a "Validadas".
- **Salidas:** Horas validadas con firma digital del docente tutor y cambio de estado del registro.
- **Criterios de Aceptación:** Trazabilidad completa sobre quién validó las horas y en qué fecha.

---

### RF-PRA-04: Generación de Reportes de Cumplimiento de Prácticas para la EPIS/UNSCH
- **Módulo:** Control de Asistencia y Cumplimiento de Practicantes
- **Actores:** Coordinación Académica, Dirección General, Practicantes.
- **Prioridad:** Media.
- **Descripción:** El sistema debe generar reportes consolidados y fichas oficiales de asistencia y horas cumplidas por los practicantes, listos para ser presentados ante las escuelas profesionales de la UNSCH (como la EPIS o la Facultad de Educación) para la acreditación formal de sus prácticas preprofesionales o Servicio Social Universitario.
- **Entradas:** Selección del practicante, periodo académico y formato de exportación deseado.
- **Reglas de Negocio:**
  - El documento debe incluir el membrete oficial del plantel, detalle pormenorizado de fechas, horas totales y la firma o visto bueno de la Coordinación Académica y Dirección.
- **Flujo Funcional:**
  1. La Coordinación selecciona al practicante y hace clic en "Generar Ficha de Asistencia de Prácticas".
  2. El sistema compila todas las horas validadas y genera el reporte estructurado en formato PDF.
- **Salidas:** Documento en PDF con la relación pormenorizada de asistencia y horas de prácticas.
- **Criterios de Aceptación:** Generación del reporte en PDF en menos de 3 segundos listo para impresión formal.

---

```
========================================================================================
MÓDULO 7: CONTROL DE ASISTENCIA Y HORAS DE DOCENTES CONTRATADOS (RF-DOC)
========================================================================================
```

### RF-DOC-01: Registro y Marcación de Asistencia de Docentes Contratados por Sesión Programada
- **Módulo:** Control de Asistencia y Horas de Docentes Contratados
- **Actores:** Docentes Contratados, Personal de Portería, Coordinación Académica.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe registrar la asistencia y puntualidad de los docentes contratados para cada una de sus clases programadas en el horario semanal. La marcación se podrá realizar al momento de iniciar la clase en el aula o al ingresar a la institución, verificando el cumplimiento de la carga horaria comprometida en su contrato de locación o designación lectiva.
- **Entradas:** Identificador del docente, selección del curso y bloque de horario a dictar, y registro de marcación presencial.
- **Reglas de Negocio:**
  - El sistema debe comparar la hora real del registro con el horario oficial parametrizado para la clase, marcando automáticamente si existió puntualidad, tardanza o inasistencia.
  - La marcación no puede realizarse anticipadamente con más de 20 minutos de anticipación al inicio del bloque lectivo.
- **Flujo Funcional:**
  1. El docente contratado inicia su sesión en el plantel y confirma su inicio de clase en el sistema.
  2. El sistema compara contra el horario del día y registra la asistencia efectiva de la clase.
- **Salidas:** Registro de asistencia docente de la sesión guardado.
- **Criterios de Aceptación:** Cotejo automatizado e instantáneo contra el horario escolar asignado.

---

### RF-DOC-02: Registro de Justificaciones de Inasistencia y Recuperación de Sesiones Docentes
- **Módulo:** Control de Asistencia y Horas de Docentes Contratados
- **Actores:** Docentes Contratados, Coordinación Académica, Dirección.
- **Prioridad:** Media.
- **Descripción:** El sistema debe permitir a los docentes contratados registrar solicitudes de justificación en caso de inasistencia justificada (por salud o motivos institucionales) y programar la fecha de recuperación pedagógica de las horas no dictadas. La Coordinación Académica podrá revisar la solicitud, autorizar la reprogramación y registrar el cumplimiento posterior de dicha sesión de recuperación.
- **Entradas:** Fecha de la inasistencia, motivo, documento adjunto de justificación, y fecha/hora propuesta para la clase de recuperación.
- **Reglas de Negocio:**
  - Toda justificación requiere la aprobación explícita de la Coordinación Académica para surtir efecto sobre el cómputo de horas.
  - Las horas recuperadas solo se contabilizan una vez dictada y registrada la clase correspondiente.
- **Flujo Funcional:**
  1. El docente registra la solicitud de justificación y propuesta de recuperación en el sistema.
  2. El Coordinador revisa los datos y presiona "Aprobar Recuperación".
  3. Tras ejecutarse la clase de recuperación, se asienta la conformidad en la plataforma.
- **Salidas:** Estado de asistencia regularizado y programación de sesión de recuperación en el calendario.
- **Criterios de Aceptación:** Registro claro del ciclo completo: falta, justificación, reprogramación y recuperación efectiva.

---

### RF-DOC-03: Consolidación Mensual de Cumplimiento de Horas Lectivas Dictadas
- **Módulo:** Control de Asistencia y Horas de Docentes Contratados
- **Actores:** Coordinación Académica, Secretaría, Dirección General.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe consolidar mensualmente las horas dictadas, tardanzas acumuladas e inasistencias de cada docente contratado, emitiendo el cuadro de horas pedagógicas efectivamente dictadas frente a las horas programadas. Este informe sirve de sustento directo para la gestión administrativa interna y supervisión del cumplimiento de los servicios educativos en el plantel (sin incluir cálculos de planillas salariales ni pagos, de acuerdo con las limitaciones del proyecto).
- **Entradas:** Selección del mes calendario y filtro por docente o por departamento pedagógico.
- **Reglas de Negocio:**
  - El cálculo de horas debe regirse estrictamente por la duración oficial de la hora pedagógica (por ejemplo, 45 minutos por bloque lectivo).
  - Los consolidados mensuales deben ser inmutables una vez cerrados por la Dirección.
- **Flujo Funcional:**
  1. El personal administrativo selecciona el mes a procesar (ejemplo: "Septiembre 2026").
  2. Presiona "Generar Consolidado de Asistencia Docente".
  3. El sistema totaliza las horas de cada docente y genera la sábana mensual de cumplimiento.
- **Salidas:** Cuadro consolidado de horas dictadas, tardanzas y ausencias por docente.
- **Criterios de Aceptación:** Cálculo aritmético exacto de las horas pedagógicas sin desfases cronológicos.

---

### RF-DOC-04: Supervisión y Monitoreo de Puntualidad Docente por Coordinación Académica
- **Módulo:** Control de Asistencia y Horas de Docentes Contratados
- **Actores:** Coordinación Académica, Dirección General.
- **Prioridad:** Media.
- **Descripción:** El sistema debe proporcionar a la Coordinación Académica una vista en tiempo real sobre el estado de las clases del día, permitiendo verificar qué docentes han iniciado sus sesiones a tiempo, quiénes presentan retrasos y en qué aulas no se ha registrado actividad docente, facilitando la toma de medidas correctivas inmediatas en el plantel.
- **Entradas:** Panel de monitoreo del día lectivo en curso.
- **Reglas de Negocio:**
  - La información debe reflejar las marcas registradas en el sistema de manera inmediata.
  - Se debe resaltar con códigos de color visuales las clases que registran más de 10 minutos de retraso en su inicio.
- **Flujo Funcional:**
  1. El Coordinador ingresa a su tablero de "Supervisión del Día".
  2. Visualiza todas las secciones activas en el turno con indicadores de estado de la clase.
- **Salidas:** Matriz de monitoreo de asistencia docente en tiempo real.
- **Criterios de Aceptación:** Visualización clara de la cobertura docente del día a simple vista.

---

```
========================================================================================
MÓDULO 8: REGISTRO, FLUJO Y SEGUIMIENTO DE CALIFICACIONES EN TIEMPO REAL (RF-NOT)
========================================================================================
```

### RF-NOT-01: Definición de Criterios y Rúbricas de Evaluación por Asignatura
- **Módulo:** Registro, Flujo y Seguimiento de Calificaciones en Tiempo Real
- **Actores:** Docentes Titulares, Coordinación Académica.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir a los docentes estructurar las evaluaciones que conformarán la calificación del periodo para su asignatura, definiendo los criterios, rubros o actividades (por ejemplo: Evaluaciones escritas, Trabajos prácticos, Participación en clase, Proyecto integrador) y asociando cada uno a las competencias oficiales del curso con sus respectivos pesos porcentuales o ponderaciones.
- **Entradas:** Nombre de la evaluación, fecha programada, competencia asociada, descripción del criterio y peso relativo o ponderación.
- **Reglas de Negocio:**
  - La suma de los pesos de las evaluaciones que componen una competencia o periodo debe equivaler exactamente al 100% de la ponderación.
  - Los criterios de evaluación deben definirse antes o durante el desarrollo del periodo lectivo, no pudiendo agregarse de forma retroactiva tras el cierre del periodo.
- **Flujo Funcional:**
  1. El docente ingresa a "Registro de Calificaciones" y selecciona su asignatura y sección.
  2. Entra a "Configurar Evaluaciones del Periodo".
  3. Añade los criterios evaluativos con sus ponderaciones y guarda la configuración.
- **Salidas:** Registro auxiliar estructurado con las columnas de evaluación configuradas.
- **Criterios de Aceptación:** El sistema valida que la distribución porcentual sume exactamente el 100%.

---

### RF-NOT-02: Ingreso y Modificación Oportuna de Calificaciones en Tiempo Real
- **Módulo:** Registro, Flujo y Seguimiento de Calificaciones en Tiempo Real
- **Actores:** Docentes Nombrados y Contratados.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe proporcionar una matriz de calificaciones ágil y responsive que simule un registro auxiliar digital. El docente podrá ingresar las notas de cada estudiante de manera individual o por columnas de evaluación. Conforme el docente digita las notas y presiona "Guardar", los valores deben validarse contra la escala establecida y actualizarse en tiempo real, recalculando automáticamente los promedios y quedando inmediatamente disponibles para la consulta autorizada de directivos y del propio estudiante.
- **Entradas:** Calificaciones ingresadas para cada alumno en la columna de la evaluación seleccionada.
- **Reglas de Negocio:**
  - El sistema debe impedir estrictamente ingresar valores no permitidos según la escala oficial (por ejemplo, números mayores a 20 o letras fuera de AD, A, B, C).
  - Cada modificación queda registrada con la fecha, hora y usuario que la realizó para garantizar la trazabilidad.
  - Las calificaciones no pueden ser modificadas si el periodo académico formalmente ha sido cerrado.
- **Flujo Funcional:**
  1. El docente abre la planilla de notas de su sección.
  2. Digita las calificaciones de los alumnos en la columna correspondiente.
  3. Presiona "Guardar Calificaciones".
  4. El sistema valida los rangos, actualiza los registros y calcula de inmediato el promedio parcial en pantalla.
- **Salidas:** Planilla de calificaciones guardada y promedios actualizados en tiempo real.
- **Criterios de Aceptación:** Actualización inmediata de notas en la plataforma en menos de 1 segundo tras el guardado.

---

### RF-NOT-03: Asistencia y Colaboración en el Registro de Notas por Practicantes
- **Módulo:** Registro, Flujo y Seguimiento de Calificaciones en Tiempo Real
- **Actores:** Practicantes de Educación, Docentes Titulares.
- **Prioridad:** Media.
- **Descripción:** El sistema debe contemplar la colaboración de los practicantes de educación en el apoyo al registro de notas y revisión de trabajos escolares asignados por el docente titular. El practicante podrá digitar las notas asignadas en un modo "Borrador" o "Propuesta"; dichas calificaciones no serán consideradas oficiales ni visibles para los estudiantes hasta que el docente titular a cargo revise la nómina y otorgue su aprobación formal en el sistema.
- **Entradas:** Digitación de notas por el practicante en las actividades designadas por el docente titular.
- **Reglas de Negocio:**
  - Las notas registradas por un practicante tienen el estado "Pendiente de Aprobación Docente".
  - Solo el docente titular asignado a la sección tiene la potestad de aprobar o rectificar las notas antes de su publicación definitiva.
- **Flujo Funcional:**
  1. El practicante accede con su usuario a la sección asignada y digita las notas de la práctica revisada.
  2. El sistema envía una notificación interna al docente titular: "Notas pendientes de revisión por practicante".
  3. El docente titular ingresa a la planilla, verifica los valores y hace clic en "Aprobar y Publicar Notas".
  4. Las notas pasan al estado "Oficial".
- **Salidas:** Calificaciones formalizadas tras la revisión del docente titular.
- **Criterios de Aceptación:** Las notas ingresadas por practicantes jamás se publican sin el visto bueno del docente titular.

---

### RF-NOT-04: Cálculo Automatizado de Promedios Periódicos y de Cierre Escolar
- **Módulo:** Registro, Flujo y Seguimiento de Calificaciones en Tiempo Real
- **Actores:** Sistema (Proceso automatizado), Docentes, Coordinación Académica.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe calcular de forma automática e inmediata los promedios parciales de cada competencia curricular, los promedios bimestrales/trimestrales y el promedio final anual de cada estudiante en cada asignatura. El cálculo debe aplicar con exactitud las fórmulas de promedio aritmético o ponderado parametrizadas para el curso, así como las reglas de redondeo institucional establecidas.
- **Entradas:** Calificaciones registradas en las distintas evaluaciones del periodo.
- **Reglas de Negocio:**
  - Para escala vigesimal, el redondeo oficial a número entero (si aplica) solo se ejecuta en el promedio final del periodo, manteniéndose los decimales en las notas parciales intermedias.
  - Para escala cualitativa (literal), el sistema debe aplicar la regla pedagógica oficial de consolidación de niveles de logro conforme a las directivas del MINEDU.
  - El cálculo debe actualizarse instantáneamente cada vez que se agregue o rectifique una nota.
- **Flujo Funcional:**
  1. Al guardarse cualquier calificación individual, el motor de reglas del sistema ejecuta el recálculo en cascada.
  2. Se actualiza el promedio de la competencia.
  3. Se actualiza el promedio del bimestre/periodo del estudiante.
  4. Se reflejan los nuevos valores en las planillas de los docentes y en la libreta del alumno.
- **Salidas:** Promedios consolidados visibles en todas las pantallas y reportes del sistema.
- **Criterios de Aceptación:** Cero margen de error matemático en los cálculos consolidados.

---

### RF-NOT-05: Cierre Oficial de Periodo Académico y Bloqueo de Modificación de Notas
- **Módulo:** Registro, Flujo y Seguimiento de Calificaciones en Tiempo Real
- **Actores:** Coordinación Académica, Dirección General.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir a la Coordinación Académica y Dirección General ejecutar el cierre oficial de un periodo lectivo (bimestre o trimestre) una vez culminado el plazo de entrega de calificaciones. Al cerrarse el periodo, el sistema debe bloquear inmediatamente la edición de notas en todas las asignaturas de dicho periodo, asegurando la inmutabilidad de los resultados para la emisión de libretas y reportes institucionales.
- **Entradas:** Selección del periodo académico a cerrar y confirmación con credenciales directivas.
- **Reglas de Negocio:**
  - No se puede cerrar un periodo si existen cursos sin notas registradas, salvo autorización expresa con justificación asentada en el sistema.
  - Tras el cierre, los docentes pasan a modo de "Solo Lectura" respecto a las notas de dicho periodo.
- **Flujo Funcional:**
  1. La Coordinación verifica en el panel que el 100% de los docentes ha completado sus registros.
  2. Presiona "Ejecutar Cierre Oficial del Periodo".
  3. El sistema valida las condiciones, bloquea la edición de notas y consolida el estado académico de los estudiantes.
- **Salidas:** Periodo cerrado oficialmente, planillas docentes en modo solo lectura y actas listas para emisión.
- **Criterios de Aceptación:** Imposibilidad absoluta de alterar notas en periodos cerrados por parte de los docentes regulares.

---

### RF-NOT-06: Solicitud y Autorización Extraordinaria de Rectificación de Calificaciones
- **Módulo:** Registro, Flujo y Seguimiento de Calificaciones en Tiempo Real
- **Actores:** Docentes Titulares, Coordinación Académica, Dirección General.
- **Prioridad:** Media.
- **Descripción:** En caso de cometerse un error material involuntario en el asentamiento de una calificación tras el cierre formal de un periodo, el sistema debe contar con un flujo formal de rectificación. El docente titular deberá formular una solicitud electrónica en la plataforma indicando al estudiante, la asignatura, la nota errónea, la nueva nota propuesta y el motivo del error. La solicitud deberá ser aprobada formalmente por la Coordinación Académica o Dirección para que el cambio surta efecto.
- **Entradas:** Solicitud de rectificación, justificación escrita, nota anterior y nueva nota.
- **Reglas de Negocio:**
  - Ningún docente puede rectificar una nota cerrada de manera unilateral.
  - La rectificación aprobada debe registrar en la bitácora de auditoría al docente que la solicitó, la autoridad que la autorizó, la justificación, la fecha y hora, y los valores antes y después del cambio.
- **Flujo Funcional:**
  1. El docente ingresa a "Solicitud de Rectificación de Nota".
  2. Selecciona al alumno y la nota cerrada que requiere corrección, adjuntando el motivo y sustento.
  3. La Coordinación recibe la solicitud en su bandeja directiva.
  4. Tras verificar el caso, presiona "Aprobar Rectificación".
  5. El sistema actualiza la calificación, recalcula los promedios y asienta el evento en la bitácora de auditoría.
- **Salidas:** Nota rectificada en el registro oficial y notificación de conformidad enviada al docente.
- **Criterios de Aceptación:** Total trazabilidad del cambio y cumplimiento irrestricto del flujo de doble autorización.

---

### RF-NOT-07: Consulta Transparente e Inmediata de Calificaciones por el Estudiante
- **Módulo:** Registro, Flujo y Seguimiento de Calificaciones en Tiempo Real
- **Actores:** Estudiantes de los Planteles de Aplicación.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe proporcionar a los estudiantes un portal de consulta individual y seguro donde puedan visualizar en tiempo real sus calificaciones obtenidas en cada curso y periodo académico. La interfaz debe presentar de manera transparente el desglose de notas por competencia, las evaluaciones parciales publicadas por sus docentes y sus promedios acumulados, garantizando que el estudiante conozca su progreso pedagógico de forma oportuna.
- **Entradas:** Inicio de sesión del estudiante y selección del periodo académico a consultar.
- **Reglas de Negocio:**
  - El estudiante solo tiene acceso de consulta estricto a su propia información académica; no puede bajo ningún concepto visualizar las notas de otros alumnos.
  - Solo se mostrarán aquellas notas que hayan sido guardadas y oficializadas por los docentes.
  - La interfaz para el estudiante es 100% de solo lectura.
- **Flujo Funcional:**
  1. El estudiante inicia sesión en la plataforma con sus credenciales personales.
  2. Accede a "Mis Calificaciones".
  3. Selecciona el periodo lectivo deseado (ejemplo: "Bimestre I").
  4. El sistema despliega la lista de asignaturas, las notas por competencia y los promedios oficiales en un formato gráfico y comprensible.
- **Salidas:** Visualización detallada de la libreta electrónica del estudiante.
- **Criterios de Aceptación:** El estudiante visualiza sus notas con exactitud y rapidez desde cualquier navegador web sin capacidad de edición.

---

```
========================================================================================
MÓDULO 9: MAPAS DE CALOR Y ANÁLISIS VISUAL DEL RENDIMIENTO Y ASISTENCIA (RF-CAL)
========================================================================================
```

### RF-CAL-01: Visualización mediante Mapa de Calor del Rendimiento Académico por Sección y Área
- **Módulo:** Mapas de Calor y Análisis Visual del Rendimiento y Asistencia
- **Actores:** Dirección General, Coordinación Académica, Docentes.
- **Prioridad:** Alta (Innovación funcional clave del proyecto).
- **Descripción:** El sistema debe procesar las calificaciones consolidadas y generar representaciones visuales interactivas en forma de **Mapas de Calor (Heatmaps)**. En esta matriz visual, las filas representarán a los estudiantes de la sección y las columnas corresponderán a las asignaturas o competencias evaluadas; cada celda adoptará un color gradual intuitivo acorde con el nivel de rendimiento alcanzado (por ejemplo: verde intenso para logro destacado / notas sobresalientes; verde claro para aprobatorio regular; amarillo para rendimiento en riesgo en el umbral aprobatorio; y rojo/naranja para notas desaprobatorias o áreas críticas).
- **Entradas:** Selección de grado, sección, periodo académico y área curricular a visualizar.
- **Reglas de Negocio:**
  - La graduación cromática del mapa de calor debe ajustarse estrictamente a las escalas oficiales del plantel.
  - Los mapas de calor tienen un enfoque netamente descriptivo y analítico (sin incorporar modelos predictivos de inteligencia artificial en la fase piloto, respetando las limitaciones del proyecto).
  - Al pasar el cursor sobre cualquier celda, se debe mostrar una ficha emergente con el nombre del alumno, asignatura y nota numérica/cualitativa exacta.
- **Flujo Funcional:**
  1. El directivo, coordinador o docente accede a "Mapas de Calor -> Rendimiento Académico".
  2. Selecciona el grado ("3° de Secundaria") y sección ("B").
  3. El sistema procesa las calificaciones del periodo y renderiza instantáneamente la cuadrícula térmica de colores.
  4. El usuario analiza visualmente las zonas rojas (dificultades colectivas o individuales) para priorizar el refuerzo escolar.
- **Salidas:** Matriz gráfica en pantalla en mapa de calor con leyenda de colores y opción de exportación a PDF.
- **Criterios de Aceptación:** Generación fluida del mapa de calor para un aula de hasta 40 estudiantes en menos de 2 segundos.

---

### RF-CAL-02: Visualización mediante Mapa de Calor de Asistencia y Puntualidad
- **Módulo:** Mapas de Calor y Análisis Visual del Rendimiento y Asistencia
- **Actores:** Dirección General, Coordinación Académica, Auxiliares de Educación.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe generar un mapa de calor específico para monitorear la asistencia y puntualidad de los estudiantes a lo largo de las semanas lectivas. Las celdas representarán los días de clase y permitirán identificar patrones temporales de ausentismo o tardanzas (por ejemplo, detectar si las inasistencias se concentran sistemáticamente en días lunes o viernes, o en las primeras horas lectivas del día).
- **Entradas:** Rango de fechas, selección de grado y sección, o filtro multiactor (estudiantes, practicantes, docentes contratados).
- **Reglas de Negocio:**
  - Los colores representarán la densidad de inasistencias y tardanzas acumuladas (verde: asistencia completa; amarillo: tardanzas frecuentes; rojo: concentración de ausencias).
- **Flujo Funcional:**
  1. El usuario accede a "Mapas de Calor -> Asistencia Institucional".
  2. Filtra por mes y grado escolar.
  3. El sistema genera el mapa térmico cronológico del aula o del plantel.
- **Salidas:** Matriz visual cronológica de asistencia con identificación inmediata de patrones de ausentismo.
- **Criterios de Aceptación:** Detección visual clara de patrones de inasistencia sin necesidad de revisar registros individuales día por día.

---

### RF-CAL-03: Comparativas Visuales y Detección de Brechas de Rendimiento entre Secciones
- **Módulo:** Mapas de Calor y Análisis Visual del Rendimiento y Asistencia
- **Actores:** Dirección General, Coordinación Académica.
- **Prioridad:** Media.
- **Descripción:** El sistema debe permitir contrastar simultáneamente los mapas de calor o perfiles cromáticos de dos o más secciones del mismo grado (por ejemplo: 2° "A" frente a 2° "B" y 2° "C"), permitiendo a la Coordinación Académica evidenciar si existen brechas significativas en el rendimiento promedio de una misma asignatura impartida por distintos docentes o en distintos turnos.
- **Entradas:** Selección del grado y selección de las secciones paralelas a contrastar.
- **Reglas de Negocio:**
  - La comparación se realizará sobre datos consolidados del mismo periodo académico.
- **Flujo Funcional:**
  1. El Coordinador ingresa a "Análisis Comparativo por Secciones".
  2. Selecciona las secciones a contrastar y el curso de interés (ejemplo: Matemática).
  3. El sistema despliega los mapas de calor lado a lado con sus indicadores promedios.
- **Salidas:** Vista comparativa de mapas térmicos de rendimiento con resumen estadístico.
- **Criterios de Aceptación:** Despliegue sincronizado y comparativo de las secciones evaluadas en una sola pantalla.

---

### RF-CAL-04: Detección Visual de Asignaturas con Alta Tasa de Riesgo o Desaprobación
- **Módulo:** Mapas de Calor y Análisis Visual del Rendimiento y Asistencia
- **Actores:** Dirección General, Coordinación Académica.
- **Prioridad:** Media.
- **Descripción:** El sistema debe ofrecer una vista térmica consolidada a nivel de todo el plantel escolar, donde las filas representen las asignaturas del plan de estudios y las columnas los grados/secciones. Esto permitirá a la Dirección General ubicar con una sola mirada cuáles asignaturas del colegio presentan la mayor concentración de notas en niveles de riesgo o desaprobación a nivel institucional.
- **Entradas:** Selección del periodo académico consolidado y nivel educativo.
- **Reglas de Negocio:**
  - Las áreas con mayor porcentaje de desaprobados deben teñirse automáticamente con tonalidades rojas más intensas para capturar la atención prioritaria de las autoridades educativas.
- **Flujo Funcional:**
  1. El Director General accede a "Radiografía Académica Institucional".
  2. El sistema compila todas las notas oficiales del periodo y despliega la matriz macro-institucional.
- **Salidas:** Tablero térmico global con semaforización de asignaturas prioritarias de atención.
- **Criterios de Aceptación:** Compilación visual de toda la institución en una pantalla intuitiva y sin sobrecarga visual.

---

```
========================================================================================
MÓDULO 10: MONITOREO INSTITUCIONAL, DASHBOARDS Y ALERTAS TEMPRANAS (RF-MON)
========================================================================================
```

### RF-MON-01: Tablero de Control Ejecutivo para la Dirección General
- **Módulo:** Monitoreo Institucional, Dashboards y Alertas Tempranas
- **Actores:** Dirección General, Stakeholders Institucionales.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe ofrecer a la Dirección General un panel de control ejecutivo (Dashboard) que consolide en tiempo real los principales indicadores clave de desempeño (KPIs) del plantel: tasa global de asistencia estudiantil, porcentaje de docentes con notas al día, cantidad de alumnos matriculados por nivel, índice general de aprobación institucional y resumen de incidencias críticas del día.
- **Entradas:** Acceso al panel inicial de la Dirección tras autenticación.
- **Reglas de Negocio:**
  - Los indicadores deben calcularse dinámicamente con la información registrada en el sistema hasta el momento de la consulta.
  - La presentación debe basarse en gráficos descriptivos limpios (barras, circulares y tarjetas métricas).
- **Flujo Funcional:**
  1. El Director General ingresa al sistema.
  2. El sistema despliega el Dashboard Ejecutivo con widgets informativos y métricas globales.
  3. Puede hacer clic en cualquier métrica para profundizar en el detalle del grado o sección correspondiente.
- **Salidas:** Panel de control directivo interactivo con gráficos e indicadores consolidados.
- **Criterios de Aceptación:** Carga completa del tablero con todas las métricas en menos de 2 segundos.

---

### RF-MON-02: Tablero de Control y Monitoreo Curricular para la Coordinación Académica
- **Módulo:** Monitoreo Institucional, Dashboards y Alertas Tempranas
- **Actores:** Coordinación Académica.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe proporcionar a la Coordinación Académica un panel de seguimiento pedagógico enfocado en el cumplimiento de los plazos escolares: porcentaje de avance en el llenado de notas por cada docente, relación de registros pendientes por entregar, cumplimiento de la jornada de practicantes y alertas de estudiantes con rendimiento crítico.
- **Entradas:** Panel de trabajo de la Coordinación Académica.
- **Reglas de Negocio:**
  - El sistema debe listar de forma prominente a aquellos docentes que presenten retrasos con respecto al cronograma oficial de entrega de calificaciones.
- **Flujo Funcional:**
  1. El Coordinador ingresa a su panel de gestión.
  2. Visualiza el semáforo de cumplimiento docente (Verde: notas al día; Amarillo: parcialmente cargado; Rojo: sin avance de notas a pocos días del cierre).
- **Salidas:** Listado de seguimiento y avance de registros pedagógicos por asignatura y docente.
- **Criterios de Aceptación:** Identificación en menos de 5 segundos de los docentes con notas atrasadas en el periodo.

---

### RF-MON-03: Tablero de Seguimiento Académico y Pedagógico para el Docente
- **Módulo:** Monitoreo Institucional, Dashboards y Alertas Tempranas
- **Actores:** Docentes Nombrados y Contratados.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe presentar al docente, tras iniciar sesión, un resumen ejecutivo de su labor en el plantel: accesos directos a sus cursos del día, listado de tareas pendientes (por ejemplo, lista de asistencia no tomada hoy o notas pendientes por guardar), estadísticas promedio de notas de sus aulas asignadas y alertas sobre los alumnos con bajo rendimiento o inasistencias en sus materias.
- **Entradas:** Acceso del docente a su entorno personal de trabajo.
- **Reglas de Negocio:**
  - El panel del docente solo muestra información pertinente a sus cursos, secciones y alumnos a cargo.
- **Flujo Funcional:**
  1. El profesor ingresa al sistema.
  2. Visualiza su horario de clases del día y el estado de sus planillas.
  3. Hace clic directo sobre su clase para pasar asistencia o ingresar calificaciones.
- **Salidas:** Panel docente operativo y contextualizado a la jornada escolar.
- **Criterios de Aceptación:** Reducción sustancial del tiempo necesario para acceder a la toma de asistencia diaria.

---

### RF-MON-04: Panel de Resumen del Progreso Escolar para el Estudiante
- **Módulo:** Monitoreo Institucional, Dashboards y Alertas Tempranas
- **Actores:** Estudiantes de los Planteles de Aplicación.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe proporcionar al estudiante un panel amigable que sintetice su estado académico actual: tarjeta de presentación escolar, resumen de su porcentaje de asistencia global, listado de asignaturas cursadas con su estado actual (aprobado, en proceso o en riesgo) y avisos institucionales relevantes publicados por la dirección o sus profesores.
- **Entradas:** Acceso del estudiante con sus credenciales institucionales.
- **Reglas de Negocio:**
  - Panel informativo claro, motivador y sin tecnicismos pedagógicos complejos.
  - Totalmente adaptado para su visualización en computadoras de escritorio, portátiles, tabletas y teléfonos móviles mediante diseño responsive.
- **Flujo Funcional:**
  1. El estudiante inicia sesión en la plataforma.
  2. Visualiza su estado general, sus promedios bimestrales y su récord de asistencia.
- **Salidas:** Pantalla gráfica de resumen escolar personal.
- **Criterios de Aceptación:** Visualización clara y legible en cualquier tamaño de pantalla.

---

### RF-MON-05: Generación de Alertas Preventivas de Deserción y Bajo Rendimiento Académico
- **Módulo:** Monitoreo Institucional, Dashboards y Alertas Tempranas
- **Actores:** Coordinación Académica, Docentes Tutores, Dirección General.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe consolidar automáticamente los factores de riesgo de cada estudiante (combinando inasistencias acumuladas injustificadas y calificaciones reprobatorias en dos o más áreas fundamentales) para catalogar al estudiante en semáforo de riesgo preventivo. El sistema listará a estos alumnos en una bandeja especial de tutoría para que la Coordinación y los tutores adopten medidas oportunas de acompañamiento antes del cierre del año escolar.
- **Entradas:** Cruce automático de datos de asistencia y notas registradas en el sistema.
- **Reglas de Negocio:**
  - Un estudiante se considera en alerta académica cuando presenta 3 o más cursos desaprobados en el periodo, o cuando acumula más del 15% de inasistencias.
  - La asignación de alertas es descriptiva en base a reglas de umbral predeterminadas.
- **Flujo Funcional:**
  1. El sistema evalúa diariamente las notas y asistencias tras cada cierre de jornada.
  2. Si un estudiante rebasa los umbrales de riesgo, lo incluye en la "Bandeja de Atención Tutorial".
  3. El Coordinador y el docente tutor reciben la alerta en sus paneles de monitoreo.
- **Salidas:** Listado de estudiantes en riesgo pedagógico con detalle de las asignaturas críticas.
- **Criterios de Aceptación:** Identificación automática y oportuna de estudiantes con riesgo de repitencia o deserción.

---

```
========================================================================================
MÓDULO 11: EMISIÓN DE REPORTES, LIBRETAS Y DOCUMENTACIÓN ESCOLAR (RF-REP)
========================================================================================
```

### RF-REP-01: Generación y Emisión de Boletas de Calificaciones / Libretas de Información
- **Módulo:** Emisión de Reportes, Libretas y Documentación Escolar
- **Actores:** Secretaría Académica, Coordinación, Dirección General, Estudiantes.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe generar de manera automatizada las Boletas de Calificaciones (Libretas de Información Escolar) de cada estudiante para un periodo específico o para el consolidado anual. El formato debe incluir el membrete oficial de los Planteles de Aplicación de la UNSCH, los datos de identificación del menor, el desglose de áreas curriculares con sus notas y conclusiones descriptivas, el récord de asistencia del periodo, la escala oficial de calificación y los espacios de firma institucional.
- **Entradas:** Selección del periodo lectivo, grado, sección o estudiante específico.
- **Reglas de Negocio:**
  - La boleta oficial solo puede generarse una vez que el periodo académico ha sido formalmente cerrado.
  - El formato debe cumplir con la estructura exigida por la normativa educativa del MINEDU y de los Planteles de Aplicación.
- **Flujo Funcional:**
  1. El personal administrativo o docente tutor ingresa a "Emisión de Libretas de Notas".
  2. Selecciona la sección o un estudiante particular.
  3. Presiona "Generar Boleta".
  4. El sistema compila todas las notas y asistencias y genera el documento en formato imprimible.
- **Salidas:** Boleta de calificaciones lista para visualización, descarga o impresión en PDF.
- **Criterios de Aceptación:** Generación fidedigna de la libreta escolar completa en menos de 2 segundos.

---

### RF-REP-02: Generación del Cuadro de Mérito y Listados de Desempeño Académico
- **Módulo:** Emisión de Reportes, Libretas y Documentación Escolar
- **Actores:** Dirección General, Coordinación Académica, Secretaría.
- **Prioridad:** Media.
- **Descripción:** El sistema debe calcular y emitir el Cuadro de Mérito oficial por sección, por grado y por nivel al término de cada periodo lectivo y del año escolar, ordenando a los estudiantes en estricto orden descendente de acuerdo con su promedio ponderado general acumulado, permitiendo distinguir a los primeros puestos para reconocimientos y diplomas de honor.
- **Entradas:** Selección del periodo o año lectivo, nivel educativo, grado y sección.
- **Reglas de Negocio:**
  - El cálculo del orden de mérito debe aplicar con exactitud los criterios institucionales de desempate en caso de promedios idénticos.
  - El cuadro de mérito es confidencial y solo accesible por el personal administrativo y directivo.
- **Flujo Funcional:**
  1. La Coordinación accede a "Cuadro de Mérito Institucional".
  2. Selecciona el grado a evaluar y presiona "Procesar Orden de Mérito".
  3. El sistema calcula y exhibe el listado ordenado del 1° puesto al último.
- **Salidas:** Tabla y reporte imprimible del Cuadro de Mérito Escolar con promedios y puestos oficiales.
- **Criterios de Aceptación:** Ordenamiento matemático exacto sin inconsistencias.

---

### RF-REP-03: Emisión del Registro Auxiliar Oficial y Actas Consolidadas de Evaluación
- **Módulo:** Emisión de Reportes, Libretas y Documentación Escolar
- **Actores:** Docentes Titulares, Coordinación Académica, Secretaría.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir a cada docente generar y descargar en cualquier momento su Registro Auxiliar de Evaluación oficial, el cual contiene la sábana completa de calificaciones de todos los alumnos de su sección, desglosada por competencias, criterios y evaluaciones individuales. Asimismo, debe permitir a la secretaría emitir el Acta Consolidada de Evaluación oficial del plantel para el archivo administrativo.
- **Entradas:** Selección de asignatura, sección y periodo lectivo a consolidar.
- **Reglas de Negocio:**
  - El registro auxiliar debe contener el nombre completo del docente, firma digital o espacio físico para rúbrica, y sello institucional.
- **Flujo Funcional:**
  1. El docente entra a su curso y presiona "Descargar Registro Auxiliar".
  2. El sistema compila todas las notas ingresadas hasta la fecha y genera el archivo oficial en PDF o Excel.
- **Salidas:** Archivo del Registro Auxiliar oficial con formato estructurado del colegio.
- **Criterios de Aceptación:** Generación del registro auxiliar con el 100% de los criterios y notas cargadas.

---

### RF-REP-04: Reporte Consolidado de Asistencia y Faltas de la Comunidad Educativa
- **Módulo:** Emisión de Reportes, Libretas y Documentación Escolar
- **Actores:** Dirección General, Coordinación Académica, Secretaría.
- **Prioridad:** Media.
- **Descripción:** El sistema debe generar reportes consolidados de asistencia multiactor que integren en documentos formales: (a) el reporte mensual de asistencia estudiantil por aula; (b) el reporte consolidado de horas de docentes contratados; y (c) el récord de horas de prácticas preprofesionales de practicantes, permitiendo verificar los niveles de puntualidad y permanencia de toda la comunidad escolar.
- **Entradas:** Selección del mes o periodo lectivo, y selección del actor (estudiantes, practicantes o docentes).
- **Reglas de Negocio:**
  - El reporte debe incluir totales de asistencias, tardanzas, faltas justificadas e injustificadas y porcentajes de cumplimiento.
- **Flujo Funcional:**
  1. El usuario administrativo ingresa a "Reportes de Asistencia".
  2. Elige el tipo de reporte y rango de fechas.
  3. Presiona "Generar Reporte Consolidado".
- **Salidas:** Documento en PDF y Excel con la estadística y relación detallada de asistencia.
- **Criterios de Aceptación:** Cruce exacto de las horas y días registrados en el sistema.

---

### RF-REP-05: Exportación de Reportes en Formatos Estándar (PDF y Hojas de Cálculo Excel)
- **Módulo:** Emisión de Reportes, Libretas y Documentación Escolar
- **Actores:** Dirección, Coordinación, Docentes, Secretaría, Administrador.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe permitir que todos los reportes, cuadros estadísticos, nóminas de alumnos, sábanas de notas y registros de asistencia generados puedan ser exportados en formatos estándar abiertos: formato PDF de alta fidelidad visual (listo para firma e impresión) y formato de hoja de cálculo editable (Excel / CSV) para facilitar labores de archivo, análisis o conciliación de datos por parte del personal administrativo.
- **Entradas:** Selección del botón de exportación "Descargar en PDF" o "Exportar a Excel" en la vista correspondiente.
- **Reglas de Negocio:**
  - Los archivos PDF deben respetar la identidad corporativa institucional (logo, membrete, tipografía clara).
  - Los archivos Excel deben mantener los encabezados de columna ordenados y con tipos de datos correctos (texto, números con decimales).
- **Flujo Funcional:**
  1. El usuario visualiza cualquier reporte en pantalla.
  2. Hace clic en "Exportar a Excel" o "Descargar PDF".
  3. El sistema procesa la información y descarga el archivo directamente en el navegador del usuario.
- **Salidas:** Archivo descargado en la computadora o dispositivo del usuario en el formato elegido.
- **Criterios de Aceptación:** Generación y descarga de archivos de hasta 5,000 registros en menos de 5 segundos.

---

```
========================================================================================
MÓDULO 12: TRAZABILIDAD, SEGURIDAD Y AUDITORÍA INSTITUCIONAL (RF-AUD)
========================================================================================
```

### RF-AUD-01: Registro Cronológico de Eventos de Acceso y Gestión de Cuentas
- **Módulo:** Trazabilidad, Seguridad y Auditoría Institucional
- **Actores:** Administrador del Sistema, Dirección General.
- **Prioridad:** Alta.
- **Descripción:** El sistema debe registrar de forma automática y desatendida una bitácora cronológica e inalterable de todos los eventos de autenticación: inicios de sesión exitosos, intentos fallidos de acceso, bloqueos de cuenta, cierres de sesión y modificaciones de contraseñas. Cada entrada debe registrar la marca temporal exacta (fecha y hora), la identificación del usuario, el rol ejercido y la dirección IP de procedencia.
- **Entradas:** Registro transparente del sistema ante cada acción de acceso de los usuarios.
- **Reglas de Negocio:**
  - La bitácora de eventos es estrictamente de solo lectura; ningún usuario, ni siquiera el administrador, puede modificar o borrar entradas del historial de accesos.
  - El registro se almacenará de forma segura para permitir investigaciones ante cualquier incidente de seguridad.
- **Flujo Funcional:**
  1. El usuario ejecuta cualquier acción de autenticación.
  2. El sistema asienta el evento en el registro de auditoría de forma instantánea sin ralentizar la experiencia del usuario.
- **Salidas:** Registro de evento asentado en la bitácora de seguridad.
- **Criterios de Aceptación:** Cero pérdida de registros de inicio o intento fallido de sesión.

---

### RF-AUD-02: Registro de Auditoría de Modificaciones de Calificaciones y Asistencias
- **Módulo:** Trazabilidad, Seguridad y Auditoría Institucional
- **Actores:** Administrador del Sistema, Dirección General, Coordinación Académica.
- **Prioridad:** Alta (Seguridad jurídica y transparencia institucional).
- **Descripción:** El sistema debe mantener una trazabilidad estricta y detallada de toda alteración, modificación o eliminación que se efectúe sobre datos académicos críticos (notas y asistencias). La bitácora debe capturar con exactitud: qué usuario realizó el cambio, en qué fecha y hora exacta, cuál era el valor anterior y cuál es el nuevo valor registrado, garantizando la máxima transparencia ante cualquier reclamo de calificaciones o faltas.
- **Entradas:** Registro automático al guardarse o rectificarse una nota o asistencia.
- **Reglas de Negocio:**
  - Es obligatorio capturar el estado "Antes" y "Después" en toda modificación de nota efectuada.
  - Esta bitácora constituirá la prueba de auditoría interna ante cualquier controversia evaluativa.
- **Flujo Funcional:**
  1. Un docente o coordinador modifica una calificación o aprueba una rectificación.
  2. El sistema actualiza el dato y simultáneamente escribe el registro de cambio histórico en la bitácora de auditoría.
- **Salidas:** Entrada de auditoría generada con detalle de los valores antes y después.
- **Criterios de Aceptación:** Trazabilidad del 100% de los cambios efectuados en las calificaciones institucionales.

---

### RF-AUD-03: Consulta, Filtrado y Monitoreo de la Bitácora de Auditoría
- **Módulo:** Trazabilidad, Seguridad y Auditoría Institucional
- **Actores:** Administrador del Sistema, Dirección General.
- **Prioridad:** Media.
- **Descripción:** El sistema debe proporcionar una consola administrativa para consultar, buscar y filtrar los eventos registrados en las bitácoras de auditoría. Debe ser posible filtrar por rango de fechas, usuario responsable, tipo de acción (ingreso de nota, rectificación, justificación, login fallido) o estudiante afectado.
- **Entradas:** Filtros de auditoría ingresados por el administrador.
- **Reglas de Negocio:**
  - El acceso a este módulo está restringido de forma exclusiva a la Dirección General y al Administrador TI.
- **Flujo Funcional:**
  1. El administrador ingresa a "Bitácora de Auditoría del Sistema".
  2. Aplica filtros para investigar un incidente (por ejemplo: cambios de notas en 4° de Secundaria en la última semana).
  3. El sistema presenta la secuencia cronológica de todas las acciones con sus responsables.
- **Salidas:** Reporte visual de auditoría con opción de exportación no modificable.
- **Criterios de Aceptación:** Búsqueda rápida y exacta en el historial de eventos institucionales.

---

### RF-AUD-04: Resguardo y Protección de la Privacidad de Datos Personales de Menores
- **Módulo:** Trazabilidad, Seguridad y Auditoría Institucional
- **Actores:** Sistema (Políticas transversales), Administrador.
- **Prioridad:** Alta (Cumplimiento Legal - Ley N.° 29733).
- **Descripción:** En estricto cumplimiento de la **Ley N.° 29733 (Ley de Protección de Datos Personales del Perú)**, el sistema debe garantizar que la información académica, asistencias y datos de filiación de los estudiantes menores de edad permanezcan resguardados bajo estricto secreto y confidencialidad. Ningún listado con notas públicas o datos privados debe ser expuesto de forma abierta o accesible a terceros no autorizados.
- **Entradas:** Directivas institucionales de protección de datos aplicadas en los componentes del sistema.
- **Reglas de Negocio:**
  - No se expondrán apellidos y nombres vinculados a notas en accesos públicos sin autenticación.
  - El sistema no almacena datos de índole médica, psicológica, financiera ni biométrica.
- **Flujo Funcional:**
  1. El sistema verifica transversalmente los privilegios en cada solicitud de datos.
  2. Ofusca o restringe cualquier dato sensible que no corresponda al rol del solicitante.
- **Salidas:** Protección efectiva de la privacidad de la comunidad estudiantil.
- **Criterios de Aceptación:** Cumplimiento total de las directrices normativas de privacidad y protección de menores.

---

```
========================================================================================
MÓDULO 13: PLATAFORMA DE DIFUSIÓN DIGITAL Y COMUNICACIÓN INSTITUCIONAL (RF-DIF)
========================================================================================
```

### RF-DIF-01: Publicación y Difusión de Avisos, Comunicados y Circulares Institucionales
- **Módulo:** Plataforma de Difusión Digital y Comunicación Institucional
- **Actores:** Dirección General, Coordinación Académica, Toda la Comunidad Escolar.
- **Prioridad:** Media (Componente de Difusión Digital conforme a Metadatos).
- **Descripción:** El sistema debe contar con un módulo de difusión y cartelera digital donde las autoridades del plantel (Dirección y Coordinación) puedan redactar y publicar comunicados oficiales, avisos de interés general, circulares institucionales y convocatorias. Cada comunicado podrá ser dirigido a toda la institución o segmentado por roles (solo a docentes, solo a estudiantes o general).
- **Entradas:** Título del comunicado, cuerpo del mensaje, público objetivo (docentes, alumnos, general), fecha de vigencia de la publicación y archivos adjuntos (en formato PDF).
- **Reglas de Negocio:**
  - Los comunicados caducados dejan de mostrarse en la cartelera principal automáticamente según la fecha de vigencia establecida.
  - Solo los usuarios autorizados de Dirección y Coordinación pueden publicar o archivar comunicados.
- **Flujo Funcional:**
  1. La Dirección accede a "Cartelera Digital Institucional -> Nuevo Comunicado".
  2. Redacta el título, contenido, público de destino y adjunta un archivo PDF si aplica.
  3. Presiona "Publicar Comunicado".
  4. El aviso aparece de forma destacada en los paneles de inicio de los destinatarios.
- **Salidas:** Comunicado publicado en la cartelera digital y visible en los paneles de los usuarios seleccionados.
- **Criterios de Aceptación:** Visualización inmediata del comunicado por los usuarios destinatarios al iniciar sesión.

---

### RF-DIF-02: Publicación y Consulta del Calendario Institucional de Actividades
- **Módulo:** Plataforma de Difusión Digital y Comunicación Institucional
- **Actores:** Dirección, Coordinación, Docentes, Practicantes, Estudiantes.
- **Prioridad:** Media.
- **Descripción:** El sistema debe ofrecer un calendario cívico y académico institucional interactivo donde se publiquen las fechas y eventos trascendentes de los Planteles de Aplicación (inicio y cierre de bimestres, feriados cívicos, aniversarios del plantel, jornadas pedagógicas, periodos de evaluación y desfiles escolares). Los integrantes de la comunidad escolar podrán consultar el calendario en formato mensual o semanal para organizar sus actividades.
- **Entradas:** Título del evento, fecha de inicio y fin, tipo de actividad (académica, cívica, institucional) y breve descripción.
- **Reglas de Negocio:**
  - Solo la Coordinación y Dirección pueden crear o modificar eventos en el calendario institucional.
  - Todos los usuarios tienen permiso de lectura y consulta del calendario.
- **Flujo Funcional:**
  1. La Coordinación registra un nuevo hito escolar (ejemplo: "Evaluaciones Bimestrales del 15 al 22 de Octubre").
  2. Guarda el evento.
  3. El evento queda visible de inmediato en la vista del calendario general de la plataforma.
- **Salidas:** Calendario escolar institucional interactivo y actualizado.
- **Criterios de Aceptación:** Visualización clara de los hitos y fechas clave en un calendario mensual navegable.

---

### RF-DIF-03: Consulta de la Información Institucional, Misión y Normas de Convivencia
- **Módulo:** Plataforma de Difusión Digital y Comunicación Institucional
- **Actores:** Toda la comunidad educativa y público institucional.
- **Prioridad:** Baja.
- **Descripción:** El sistema debe incorporar una sección informativa institucional de acceso abierto y público en la plataforma, donde se difunda la identidad de los Planteles de Aplicación "Guamán Poma de Ayala", incluyendo su reseña histórica, misión, visión institucional, autoridades, organigrama y el reglamento interno con las normas de convivencia escolar vigentes, promoviendo la transparencia y la pertenencia en la comunidad educativa.
- **Entradas:** Redacción y actualización de los contenidos institucionales por parte de la Dirección.
- **Reglas de Negocio:**
  - Esta sección es de libre lectura y no requiere inicio de sesión para su consulta general.
- **Flujo Funcional:**
  1. Cualquier usuario o visitante institucional ingresa al portal de los Planteles de Aplicación.
  2. Accede a la pestaña "Institucional / Quiénes Somos".
  3. Consulta la misión, visión, autoridades y normas de convivencia del plantel.
- **Salidas:** Páginas informativas institucionales con diseño responsive y corporativo.
- **Criterios de Aceptación:** Acceso rápido y óptimo formato de lectura en cualquier dispositivo.

---

## 4. MATRIZ DE TRAZABILIDAD: MÓDULOS, REQUERIMIENTOS Y STAKEHOLDERS

| Módulo de Trabajo | Código RF | Nombre del Requerimiento Funcional | Stakeholder / Actor Principal | Prioridad |
|---|:---:|---|---|:---:|
| **1. Seguridad y Acceso** | `RF-SEG-01` | Autenticación e Inicio de Sesión de Usuarios | Todos los usuarios | Alta |
| | `RF-SEG-02` | Cierre de Sesión Seguro y Control de Inactividad | Todos los usuarios | Alta |
| | `RF-SEG-03` | Recuperación y Restablecimiento Asistido de Contraseñas | Todos los usuarios / Administrador | Media |
| | `RF-SEG-04` | Control de Acceso Basado en Roles (RBAC) y Privilegio Mínimo | Administrador / Toda la institución | Alta |
| **2. Usuarios y Perfiles** | `RF-USU-01` | Alta y Registro Centralizado de Cuentas de Personal | Administrador / Dirección | Alta |
| | `RF-USU-02` | Modificación de Datos y Desactivación (Baja Lógica) | Administrador / Coordinación | Alta |
| | `RF-USU-03` | Asignación y Cambio de Roles del Personal | Administrador / Dirección | Media |
| | `RF-USU-04` | Búsqueda, Filtrado y Directorio Institucional de Personal | Dirección / Coordinación / Secretaría | Media |
| | `RF-USU-05` | Gestión de Perfil Personal y Cambio de Contraseña | Todos los usuarios | Media |
| **3. Configuración Institucional** | `RF-ADM-01` | Configuración de Datos Institucionales del Plantel y Sedes | Dirección / Administrador | Alta |
| | `RF-ADM-02` | Parametrización y Gestión de Periodos y Calendario Lectivo | Coordinación / Dirección | Alta |
| | `RF-ADM-03` | Definición de Niveles Educativos, Grados y Secciones | Coordinación / Secretaría | Alta |
| | `RF-ADM-04` | Parametrización del Catálogo Curricular (Áreas y Cursos) | Coordinación Académica | Alta |
| | `RF-ADM-05` | Configuración de Escalas de Calificación y Criterios | Coordinación / Dirección | Alta |
| **4. Gestión Académica** | `RF-ACA-01` | Registro y Mantenimiento del Padrón de Estudiantes | Secretaría / Coordinación | Alta |
| | `RF-ACA-02` | Matrícula y Asignación de Estudiantes a Secciones | Secretaría / Coordinación | Alta |
| | `RF-ACA-03` | Asignación de Carga Lectiva Docente (Nombrados y Contratados) | Coordinación / Dirección | Alta |
| | `RF-ACA-04` | Asignación y Vinculación Pedagógica de Practicantes | Coordinación / Docentes Tutores | Alta |
| | `RF-ACA-05` | Consulta del Legajo Académico de Estudiantes por Aula | Docentes / Coordinación / Secretaría | Media |
| **5. Asistencia Estudiantil** | `RF-AST-01` | Registro Diario de Asistencia Escolar por Sesión | Docentes / Practicantes | Alta |
| | `RF-AST-02` | Registro Ágil de Ingreso Físico en Portería ("Wachiman") | Personal de Portería / Auxiliares | Media |
| | `RF-AST-03` | Registro y Justificación de Inasistencias y Tardanzas | Coordinación / Auxiliares | Media |
| | `RF-AST-04` | Consolidación y Récord Histórico de Asistencias | Estudiantes / Docentes / Dirección | Alta |
| | `RF-AST-05` | Detección y Notificación de Alertas por Inasistencia | Coordinación / Docentes Tutores | Alta |
| **6. Asistencia de Practicantes** | `RF-PRA-01` | Registro Diario de Ingreso, Salida y Permanencia | Practicantes / Portería | Alta |
| | `RF-PRA-02` | Cómputo Acumulativo de Horas Efectivas de Práctica | Practicantes / Coordinación | Alta |
| | `RF-PRA-03` | Validación y Aprobación Periódica de Horas de Práctica | Docentes Tutores / Coordinación | Alta |
| | `RF-PRA-04` | Reportes de Cumplimiento de Prácticas para la UNSCH | Coordinación / Practicantes | Media |
| **7. Asistencia Docente Contratado** | `RF-DOC-01` | Marcación de Asistencia Docente por Sesión Programada | Docentes Contratados / Coordinación | Alta |
| | `RF-DOC-02` | Justificaciones de Inasistencia y Recuperación de Clases | Docentes Contratados / Coordinación | Media |
| | `RF-DOC-03` | Consolidación Mensual de Cumplimiento de Horas Lectivas | Coordinación / Secretaría / Dirección | Alta |
| | `RF-DOC-04` | Supervisión de Puntualidad Docente en Tiempo Real | Coordinación Académica | Media |
| **8. Calificaciones en Tiempo Real** | `RF-NOT-01` | Definición de Criterios y Rúbricas Evaluativas por Curso | Docentes Titulares | Alta |
| | `RF-NOT-02` | Ingreso y Modificación de Calificaciones en Tiempo Real | Docentes Titulares | Alta |
| | `RF-NOT-03` | Apoyo en Registro de Notas por Practicantes con V°B° | Practicantes / Docentes Tutores | Media |
| | `RF-NOT-04` | Cálculo Automatizado de Promedios Periódicos y Finales | Sistema / Docentes / Coordinación | Alta |
| | `RF-NOT-05` | Cierre Oficial de Periodo Académico y Bloqueo de Notas | Coordinación / Dirección | Alta |
| | `RF-NOT-06` | Solicitud y Autorización de Rectificación de Notas | Docentes / Coordinación / Dirección | Media |
| | `RF-NOT-07` | Consulta Transparente e Inmediata de Notas por Alumnos | Estudiantes | Alta |
| **9. Mapas de Calor** | `RF-CAL-01` | Mapa de Calor de Rendimiento Académico por Sección | Dirección / Coordinación / Docentes | Alta |
| | `RF-CAL-02` | Mapa de Calor de Asistencia y Puntualidad | Dirección / Coordinación / Auxiliares | Alta |
| | `RF-CAL-03` | Comparativas Visuales de Rendimiento entre Secciones | Coordinación / Dirección | Media |
| | `RF-CAL-04` | Detección Visual de Asignaturas con Alta Tasa de Riesgo | Dirección General / Coordinación | Media |
| **10. Monitoreo y Dashboards** | `RF-MON-01` | Tablero de Control Ejecutivo para Dirección General | Dirección General | Alta |
| | `RF-MON-02` | Tablero de Control y Monitoreo para Coordinación | Coordinación Académica | Alta |
| | `RF-MON-03` | Tablero de Seguimiento Pedagógico para el Docente | Docentes Nombrados y Contratados | Alta |
| | `RF-MON-04` | Panel de Resumen del Progreso para el Estudiante | Estudiantes | Alta |
| | `RF-MON-05` | Alertas Preventivas de Deserción y Bajo Rendimiento | Coordinación / Docentes Tutores | Alta |
| **11. Emisión de Reportes** | `RF-REP-01` | Generación de Boletas de Calificaciones / Libretas | Secretaría / Docentes / Alumnos | Alta |
| | `RF-REP-02` | Generación del Cuadro de Mérito y Puestos Oficiales | Dirección / Coordinación / Secretaría | Media |
| | `RF-REP-03` | Emisión del Registro Auxiliar y Actas Consolidadas | Docentes / Secretaría Académica | Alta |
| | `RF-REP-04` | Reporte Consolidado de Asistencia Multiactor | Dirección / Coordinación / Secretaría | Media |
| | `RF-REP-05` | Exportación de Reportes en Formatos Estándar (PDF y Excel) | Todos los usuarios autorizados | Alta |
| **12. Auditoría Institucional** | `RF-AUD-01` | Registro Cronológico de Eventos de Acceso y Sesión | Administrador TI / Dirección | Alta |
| | `RF-AUD-02` | Auditoría de Modificaciones de Calificaciones y Faltas | Administrador / Dirección / Coord. | Alta |
| | `RF-AUD-03` | Consulta y Filtrado de la Bitácora de Auditoría | Administrador TI / Dirección | Media |
| | `RF-AUD-04` | Resguardo de la Privacidad de Datos de Menores | Toda la comunidad / Marco Legal | Alta |
| **13. Difusión Digital** | `RF-DIF-01` | Publicación de Avisos, Comunicados y Circulares | Dirección / Toda la comunidad | Media |
| | `RF-DIF-02` | Publicación y Consulta del Calendario Institucional | Toda la comunidad escolar | Media |
| | `RF-DIF-03` | Consulta de Información Institucional y Convivencia | Comunidad educativa y público | Baja |

---

## 5. ALINEAMIENTO CON LAS LIMITACIONES Y EXCLUSIONES DEL PILOTO

Para garantizar la viabilidad del proyecto dentro del marco de 16 semanas y las condiciones del piloto institucional, la presente lista de requerimientos respeta estrictamente las siguientes fronteras:

1. **Exclusión de Procesos Financieros:** Ningún requerimiento contempla pagos de matrículas, pensiones, cobranzas, emisión de boletas de pago ni planillas salariales de personal.
2. **Exclusión de Aplicaciones Móviles Nativas:** Todas las interfaces especificadas corresponden a una aplicación web responsiva accesible desde cualquier navegador estándar.
3. **Población en Fase Piloto:** Los requerimientos estudiantiles son estrictamente de consulta. El acceso de padres de familia y apoderados se encuentra explícitamente delimitado para fases posteriores del producto.
4. **Analítica Descriptiva vs. Predictiva:** Los mapas de calor y cuadros de monitoreo son de naturaleza descriptiva visual; no se emplean algoritmos predictivos ni modelos complejos de IA durante el piloto.
5. **Autonomía Tecnológica:** El sistema opera con autenticación directa institucional y control de auditoría propio, prescindiendo en esta etapa de integraciones complejas con sistemas legados o plataformas externas del MINEDU/SIAGIE.
