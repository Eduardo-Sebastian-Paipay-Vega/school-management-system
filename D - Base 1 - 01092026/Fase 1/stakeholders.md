# MATRIZ INTEGRAL DE STAKEHOLDERS (PARTES INTERESADAS) Y PLANIFICACIÓN DE USUARIOS

## TÍTULO DEL PROYECTO

**DESARROLLO E IMPLEMENTACIÓN DE UNA PLATAFORMA WEB PARA LA GESTIÓN ACADÉMICA E INFORMACIÓN INSTITUCIONAL EN LOS PLANTELES DE APLICACIÓN DE LA UNSCH**

---

## 1. INTRODUCCIÓN Y ENFOQUE

El presente documento define, clasifica y mapea de forma exhaustiva a todas las **partes interesadas (Stakeholders)** del sistema, considerando tanto la fase piloto actual como su proyección futura y escalabilidad multiinstitucional.

Asimismo, se estructuran los **perfiles de usuario**, roles del sistema (RBAC), niveles de acceso, necesidades operativas y planes de evolución para la gestión de accesos, incorporando a la comunidad académica, personal administrativo y personal de soporte operativo y seguridad física de las instalaciones.

---

## 2. CLASIFICACIÓN GENERAL DE STAKEHOLDERS

Los stakeholders se agrupan en dos grandes categorías:

### 2.1 Stakeholders internos

- **Dirección general:** Máxima autoridad directiva del plantel.
- **Coordinación académica:** Gestión curricular, monitoreo docente y seguimiento del rendimiento.
- **Docentes nombrados:** Registro de calificaciones, asistencias y evaluaciones.
- **Docentes contratados:** Registro de cumplimiento de horas dictadas, asistencia y calificaciones.
- **Practicantes:** Apoyo pedagógico, registro de asistencia propia y control de horas de práctica.
- **Estudiantes:** Consulta de rendimiento académico, flujo de notas en tiempo real y asistencia.
- **Personal de portería y vigilancia ("Wachiman"):** Control y registro de ingreso/salida de personal y alumnos.
- **Secretaría académica y administrativa:** Emisión de constancias, actas, certificados y archivo institucional.
- **Equipo ejecutor de desarrollo (EPIS-UNSCH):** Diseño, desarrollo, pruebas, despliegue y soporte del sistema.

### 2.2 Stakeholders externos

- **Docente tutor y coordinación de SSU (EPIS - UNSCH):** Supervisión académica, seguimiento de hitos y validación de impacto social.
- **Padres de familia y apoderados:** Seguimiento del progreso académico, asistencia y comunicados institucionales.
- **Comunidad universitaria y autoridades de la UNSCH:** Promoción de la digitalización y articulación del Servicio Social Universitario.
- **Entidades rectoras y normativas (MINEDU, DREA, UGEL Huamanga):** Cumplimiento de lineamientos pedagógicos y normativa de protección de datos (Ley N.° 29733).

---

## 3. MATRIZ DETALLADA DE STAKEHOLDERS

| ID | Stakeholder | Tipo | Nivel de influencia | Nivel de interés | Expectativas clave | Riesgos asociados |
|:---:|---|---|:---:|:---:|---|---|
| **STK-01** | Dirección General | Interno | Alto | Alto | Dashboards ejecutivos, mapas de calor institucionales, reportes consolidados y modernización de procesos. | Resistencia al cambio organizativo; limitaciones de tiempo para revisión de indicadores. |
| **STK-02** | Coordinación Académica | Interno | Alto | Alto | Monitoreo de notas en tiempo real, control de asistencia multiactor, alertas tempranas de bajo rendimiento. | Sobrecarga operativa en cierres de periodo; inconsistencia de datos cargados por docentes. |
| **STK-03** | Docentes Nombrados | Interno | Medio | Alto | Interfaz rápida y sencilla para registrar notas y asistencia diaria sin duplicar tareas manuales. | Brecha digital en personal veterano; fallas de conectividad en aulas. |
| **STK-04** | Docentes Contratados | Interno | Medio | Alto | Registro ágil de asistencia y horas dictadas para sustento laboral y registro oportuno de notas. | Rotación periódica de personal; falta de inducción en la plataforma. |
| **STK-05** | Practicantes | Interno | Bajo | Alto | Registro exacto de horas de asistencia y soporte en el ingreso de calificaciones bajo supervisión. | Omisiones en el registro de entradas y salidas; dudas en permisos del sistema. |
| **STK-06** | Estudiantes | Interno | Bajo | Alto | Consulta inmediata y transparente de notas y récord de asistencias; acceso a comunicados oficiales. | Olvido de credenciales de acceso; disparidad en acceso a dispositivos en el hogar. |
| **STK-07** | Personal de Portería / Vigilancia ("Wachiman") | Interno | Medio | Medio | Interfaz ultrarrápida (kiosco/búsqueda por DNI o lector de código) para validar e ingresar asistencia en puerta. | Dificultad con interfaces complejas; ausencia de terminal o conectividad en portería. |
| **STK-08** | Secretaría y Mesa de Partes | Interno | Medio | Alto | Generación automática de nóminas, consolidados de notas y reportes en PDF y Excel. | Desfase con formatos manuales o legados anteriores. |
| **STK-09** | Equipo de Desarrollo (EPIS) | Interno | Alto | Alto | Cumplimiento del plan de 16 semanas, estabilidad técnica, cumplimiento de KPIs y sustentación exitosa. | Limitaciones de tiempo frente a la carga académica universitaria. |
| **STK-10** | Tutor SSU (UNSCH) | Externo | Alto | Medio | Cumplimiento riguroso del plan de trabajo, verificación de entregables y transferencia tecnológica formal. | Desalineamiento con el cronograma académico universitario. |
| **STK-11** | Padres de Familia / Apoderados | Externo | Medio | Alto | Transparencia en la asistencia de sus hijos, detección temprana de inasistencias y reportes periódicos. | Desconfianza tecnológica o desconocimiento del uso de plataformas web. |
| **STK-12** | Entidades Normativas (MINEDU/DREA) | Externo | Alto | Bajo | Cumplimiento de escalas oficiales de calificación y respeto irrestricto de la Ley de Protección de Datos Personales. | Modificaciones regulatorias en escalas evaluativas a nivel nacional. |

---

## 4. CUADRANTE DE GESTIÓN (PODER VS. INTERÉS)

### 4.1 Gestionar de cerca (Alto poder / Alto interés)

- Dirección General del Plantel.
- Coordinación Académica.
- Equipo Ejecutor de Desarrollo (EPIS).

### 4.2 Mantener satisfechos (Alto poder / Bajo o medio interés)

- Docente Tutor y Comisión SSU - UNSCH.
- Entidades Rectoras y Normativas (MINEDU, DREA, UGEL).

### 4.3 Mantener informados (Bajo o medio poder / Alto interés)

- Docentes Nombrados y Contratados.
- Practicantes de Educación.
- Estudiantes.
- Padres de Familia y Apoderados.
- Secretaría Institucional.

### 4.4 Monitorear (Bajo poder / Bajo o medio interés)

- Personal de Portería / Vigilancia ("Wachiman").
- Personal de apoyo y servicios generales.

---

## 5. MAPEO DE ROLES Y PERMISOS DEL SISTEMA (RBAC)

### 5.1 Roles incluidos en la fase piloto

| Rol del sistema | Actor asociado | Alcance funcional y permisos | Mecanismo de acceso |
|---|---|---|---|
| `ROLE_ADMIN` | Administrador TI / Equipo de Desarrollo | Gestión completa de usuarios, asignación de roles, configuración de periodos académicos, auditoría y logs. | Autenticación robusta con credenciales de administrador. |
| `ROLE_DIRECTOR` | Dirección General | Acceso a dashboards globales, mapas de calor institucionales, estadísticas de asistencia y reportes consolidados. | Interfaz web de alta dirección. |
| `ROLE_COORDINATOR` | Coordinación Académica | Gestión de carga lectiva docente, consolidación de notas, monitoreo del flujo en tiempo real y mapas de calor. | Interfaz web de coordinación. |
| `ROLE_TEACHER` | Docentes Nombrados y Contratados | Registro de notas por periodo/competencia, control de asistencia por curso/sección y visualización de listas de alumnos. | Interfaz web responsiva. |
| `ROLE_PRACTITIONER` | Practicantes de Educación | Registro de asistencia propia, visualización de horas acumuladas y apoyo en calificaciones supervisado por el docente titular. | Interfaz web responsiva. |
| `ROLE_STUDENT` | Estudiantes | Consulta de notas en tiempo real, récord de asistencias y faltas acumuladas, avisos y comunicados escolares. | Interfaz web simplificada de solo lectura. |

### 5.2 Roles planificados para fases posteriores y escalamiento

| Rol del sistema | Actor asociado | Fase de incorporación | Alcance proyectado |
|---|---|:---:|---|
| `ROLE_SECURITY` | Personal de Portería / Vigilancia ("Wachiman") | **Fase posterior inmediata** | Interfaz tipo Kiosco para registro rápido de ingreso/salida por DNI o código de barras/QR con cálculo automático de tardanzas. |
| `ROLE_SECRETARY` | Secretaría y Trámite Documentario | **Fase posterior inmediata** | Generación de certificados oficiales de notas, constancias de matrícula, padrones y constancias de conducta. |
| `ROLE_PARENT` | Padres de Familia / Apoderados | **Fase de expansión** | Visualización de libretas de notas, reportes de asistencia en tiempo real de sus hijos y citaciones institucionales. |
| `ROLE_SUPERADMIN` | Superadministrador Multiinstitución | **Fase de consolidación multi-tenant** | Aprovisionamiento de nuevas instituciones, gestión global de tenants, monitoreo centralizado de servidores y facturación de servicios. |

---

## 6. ESPECIFICACIÓN DEL MÓDULO DE PORTERÍA ("WACHIMAN")

Para responder a la necesidad operativa del control de acceso físico en las instalaciones escolares:

- **Propósito:** Agilizar el registro de asistencia matutina y vespertina sin cuellos de botella en la puerta del plantel.
- **Características funcionales:**
  - Modo Kiosco de un solo clic o digitación de DNI.
  - Soporte para escaneo de carné físico mediante lector de código de barras o QR.
  - Retroalimentación auditiva y visual inmediata (verde: asistencia registrada; rojo: fuera de horario o no matriculado).
  - Cálculo automatizado de minutos de tardanza contra el horario escolar parametrizado.
  - Posibilidad de funcionamiento en tablets o computadoras de bajas especificaciones con navegador web.

---

## 7. ESTRATEGIA DE COMUNICACIÓN Y CAPACITACIÓN

Para asegurar el cumplimiento de las metas de adopción institucional (≥ 80% de usuarios activos):

| Stakeholder | Canal prioritario | Frecuencia | Responsable | Mecanismo de validación |
|---|---|---|---|---|
| Dirección y Coordinación | Sesiones de trabajo y reuniones ejecutivas | Quincenal | Líder de Proyecto | Actas de reunión y aprobación de requerimientos. |
| Docentes y Practicantes | Talleres prácticos presenciales y soporte in situ | Semanal (desde Sem. 12) | Equipo Ejecutor | Formularios de usabilidad y encuestas de satisfacción. |
| Personal de Portería y Secretaría | Inducción directa en el puesto de trabajo | 2 sesiones guiadas | Sub Líder de Proyecto | Pruebas operativas con usuarios simulados. |
| Estudiantes | Guías ilustradas digitales y avisos en plataforma | Al inicio de cada periodo | Equipo Ejecutor | Métricas de inicio de sesión y consultas registradas. |
| Tutor SSU - UNSCH | Informes periódicos por fase y reuniones de seguimiento | Mensual | Líder de Proyecto | Visado de informes de avance de Servicio Social. |

---

## 8. DISPOSICIONES DE SEGURIDAD Y PRIVACIDAD DE DATOS

En concordancia con la **Ley N.° 29733 (Ley de Protección de Datos Personales del Perú)** y la política institucional:

- **Privilegio mínimo:** Cada usuario únicamente visualizará y modificará la información estrictamente ligada a sus competencias.
- **Protección de datos de menores de edad:** Las notas y registros de asistencia son confidenciales y no se expondrán en listados públicos sin autorización.
- **Trazabilidad y auditoría:** Todas las acciones críticas (modificación de calificaciones, justificación de inasistencias o creación de usuarios) quedarán registradas con usuario, fecha, hora y dirección IP en la bitácora de auditoría.
