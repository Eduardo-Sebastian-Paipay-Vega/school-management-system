Claro. Te lo dejo **limpio en formato Markdown (.md)**, manteniendo toda la estructura y contenido para que puedas copiarlo directamente a Visual Studio Code.

```markdown
# DELIMITACIONES DEL PROYECTO

## TÍTULO DEL PROYECTO

**DESARROLLO E IMPLEMENTACIÓN DE UNA PLATAFORMA WEB PARA LA GESTIÓN ACADÉMICA E INFORMACIÓN INSTITUCIONAL EN LOS PLANTELES DE APLICACIÓN DE LA UNSCH**

---

## 1. DELIMITACIÓN CONCEPTUAL

El proyecto se delimita al diseño, desarrollo e implementación de una plataforma web orientada a la gestión académica y la información institucional en los **Planteles de Aplicación de la UNSCH**, incorporando:

- Control de asistencia de estudiantes.
- Control de asistencia de practicantes.
- Control de asistencia de docentes contratados.
- Flujo de notas en tiempo real.
- Mapas de calor para visualizar rendimiento académico y asistencia.
- Gestión de información institucional y académica.
- Monitoreo del rendimiento académico.

La plataforma será concebida como un **producto general y escalable para instituciones educativas**, pero su primera implementación y validación se realizará en los Planteles de Aplicación de la UNSCH como piloto institucional.

### Incluye

- Autenticación, usuarios, roles y permisos.
- Gestión académica básica e intermedia.
- Asistencia multiactor: estudiantes, practicantes y docentes contratados.
- Flujo de notas en tiempo real.
- Mapas de calor académicos y de asistencia.
- Dashboards, reportes y auditoría.
- Arquitectura preparada para escalar a otras instituciones.

### No incluye

- Gestión financiera, contable, tesorería o planillas.
- Aplicaciones móviles nativas.
- Integraciones complejas con todos los sistemas de la UNSCH.
- Analítica predictiva avanzada con inteligencia artificial.
- Personalizaciones profundas por institución durante la fase piloto.
- Superadministración global multiinstitución durante el piloto.

---

## 2. DELIMITACIÓN ESPACIAL O GEOGRÁFICA

El proyecto se ejecutará inicialmente en los **Planteles de Aplicación de la UNSCH**, ubicados en la ciudad de Ayacucho, Perú.

### Alcance espacial del piloto

- Una o más sedes de los Planteles de Aplicación de la UNSCH.
- Acceso mediante navegador web desde cualquier ubicación con conexión a internet.
- Infraestructura alojada en servicios en la nube o servidores institucionales de la UNSCH.

### Proyección escalable

- El producto podrá desplegarse posteriormente en otras instituciones educativas.
- La arquitectura contemplará configuración multiinstitución, pero no se realizará un despliegue masivo durante el piloto.

---

## 3. DELIMITACIÓN TEMPORAL

| Fase | Duración estimada |
|---|---:|
| Análisis y diseño | 3 semanas |
| Desarrollo | 8 a 10 semanas |
| Pruebas | 3 semanas |
| Despliegue y estabilización | 2 semanas |
| **Total del piloto** | **16 a 18 semanas** |
| Escalamiento por instituciones | Fase posterior al piloto |

### Incluye

- Validación con datos reales o simulados correspondientes a un periodo académico.
- Ajustes posteriores a la retroalimentación de los Planteles de Aplicación de la UNSCH.

### No incluye

- Operación y mantenimiento indefinido.
- Migración histórica completa de todos los años académicos.
- Capacitación masiva a todas las instituciones desde el inicio.

---

## 4. DELIMITACIÓN INSTITUCIONAL U ORGANIZACIONAL

El proyecto se circunscribe inicialmente a los **Planteles de Aplicación de la UNSCH**, involucrando a los siguientes actores:

- Dirección general.
- Coordinación académica.
- Docentes nombrados y contratados.
- Practicantes.
- Estudiantes.
- Administradores del sistema.
- Stakeholders institucionales.

### Incluye

- Parametrización básica por plantel: nombre, logo, periodos, grados, secciones y escalas de calificación.
- Aislamiento lógico de datos por institución mediante `tenant_id` o esquema equivalente.

### No incluye

- Adaptación a reglamentos internos particulares de cada institución durante el piloto.
- Flujos de aprobación exclusivos de cada institución.
- Formatos de reportes personalizados para cada institución.
- Integración con sistemas académicos legados de la UNSCH.

### Proyección

- Cada institución podrá configurar el producto sin necesidad de modificar el núcleo del sistema.
- Las personalizaciones específicas podrán desarrollarse como extensiones en fases posteriores.

---

## 5. DELIMITACIÓN POBLACIONAL

| Tipo de usuario | Incluido en el piloto |
|---|---|
| Administrador del sistema | Sí |
| Dirección / Stakeholders | Sí |
| Coordinadores académicos | Sí |
| Docentes nombrados | Sí |
| Docentes contratados | Sí |
| Practicantes | Sí |
| Estudiantes | Sí |
| Padres de familia | No |
| Personal administrativo no académico | No |
| Superadministrador global | No |

### Volumetría estimada del piloto

- **100 a 200 usuarios concurrentes.**
- **1,000 a 5,000 estudiantes registrados.**
- **Hasta 100,000 registros académicos y de asistencia almacenados.**

---

## 6. DELIMITACIÓN FUNCIONAL

### 6.1 Módulos incluidos en el piloto

| Módulo | Funcionalidades incluidas |
|---|---|
| Autenticación | Inicio y cierre de sesión, recuperación de contraseña, sesiones seguras, roles y permisos. |
| Usuarios | Registro, modificación, eliminación y consulta de usuarios. |
| Administración institucional | Planteles, sedes, periodos académicos, niveles, grados, secciones, cursos y escalas. |
| Gestión académica | Registro de estudiantes, docentes, practicantes, matrículas, evaluaciones y calificaciones. |
| Asistencia de estudiantes | Registro, consulta, reportes y alertas de asistencia. |
| Asistencia de practicantes | Registro, control, reportes y seguimiento de asistencia. |
| Asistencia de docentes contratados | Registro, control, reportes y seguimiento del cumplimiento de asistencia. |
| Flujo de notas en tiempo real | Registro, actualización, consolidación y visualización inmediata de calificaciones. |
| Mapas de calor | Visualización del rendimiento académico y asistencia por estudiante, sección, curso, docente o periodo. |
| Monitoreo | Dashboards por rol, indicadores, tendencias, comparativos y alertas tempranas. |
| Reportes | Reportes institucionales, por estudiante, docente y asistencia, con exportación a PDF y Excel. |
| Auditoría | Registro de eventos de autenticación, cambios críticos y consultas de logs. |
| Escalabilidad | Arquitectura preparada para múltiples instituciones mediante `tenant_id`. |

### 6.2 Funcionalidades excluidas del piloto

- Facturación, pagos, cobranzas o planillas.
- Biblioteca, transporte, comedor u otros servicios complementarios.
- Comunicación masiva mediante SMS o WhatsApp.
- Firma digital avanzada.
- Analítica predictiva mediante modelos de inteligencia artificial.
- Aplicaciones móviles nativas.
- Integraciones complejas con sistemas externos.
- Personalización ilimitada por institución.
- Acceso para padres de familia o apoderados.

---

## 7. DELIMITACIÓN DE DATOS

### Incluye

- Datos de identificación: DNI, nombres, apellidos y fecha de nacimiento.
- Datos académicos: cursos, secciones, evaluaciones, calificaciones y asistencia.
- Datos de asistencia de estudiantes, practicantes y docentes contratados.
- Datos institucionales: plantel, sede, periodo, grado, sección y escala de calificación.
- Datos de auditoría: inicios de sesión, fallos de autenticación, cierres de sesión y cambios críticos.

### No incluye

- Datos financieros.
- Datos médicos o psicológicos.
- Datos biométricos.
- Información de terceros no vinculada al ámbito académico.
- Migración histórica completa de todas las instituciones.

### Proyección

- El modelo de datos permitirá incorporar nuevas instituciones sin requerir un rediseño estructural del sistema.

---

## 8. DELIMITACIÓN TÉCNICA

| Componente | Decisión para el piloto |
|---|---|
| Arquitectura | Monolito modular + API REST |
| Frontend | SPA responsive |
| Backend | Node.js, Python, Java o tecnología equivalente |
| Base de datos | PostgreSQL |
| Caché | Redis |
| Almacenamiento | Servicio de objetos compatible con S3 |
| Contenedores | Docker |
| Orquestación | Básica |
| CI/CD | Implementado |
| Seguridad | HTTPS, hash de contraseñas, rate limiting y JWT/sesiones seguras |
| Comunicación en tiempo real | WebSockets o Server-Sent Events |
| Mapas de calor | Librerías JavaScript especializadas |
| Microservicios | No implementados en el piloto, pero contemplados para evolución futura |
| Kubernetes | No obligatorio durante el piloto |

---

## 9. DELIMITACIÓN METODOLÓGICA

El desarrollo del proyecto utilizará una metodología ágil basada en entregas incrementales y validación continua.

Se consideran las siguientes actividades:

- Aplicación de Scrum o Kanban.
- Desarrollo mediante entregas incrementales.
- Validación con usuarios de los Planteles de Aplicación de la UNSCH.
- Pruebas funcionales.
- Pruebas de carga.
- Pruebas de seguridad.
- Pruebas de usabilidad.
- Documentación técnica y funcional.
- Capacitación inicial a usuarios clave.

---

## 10. DELIMITACIÓN ECONÓMICA

- Presupuesto acotado para el desarrollo del piloto.
- Uso de infraestructura en la nube o servidores institucionales de la UNSCH.
- Uso prioritario de tecnologías de código abierto.
- No se contemplan licencias comerciales de alto costo.
- Se consideran costos de infraestructura, capacitación y soporte inicial.

---

## 11. DELIMITACIÓN LEGAL Y NORMATIVA

El proyecto considerará las disposiciones legales y normativas aplicables al tratamiento de información académica y datos personales, entre ellas:

- Ley N.° 29733, Ley de Protección de Datos Personales del Perú.
- Normativas y disposiciones internas de la UNSCH.
- Políticas de privacidad y tratamiento de datos personales.
- Principios de minimización y protección de datos.
- Uso responsable de credenciales, sesiones y tokens de autenticación.
- Control de acceso según roles y permisos.

El sistema evitará el almacenamiento de información sensible que no sea necesaria para las funciones contempladas dentro del alcance del proyecto.

---

## 12. DELIMITACIÓN DE ESCALABILIDAD

El producto será diseñado con una arquitectura general y preparada para operar bajo un modelo multiinstitución. Sin embargo, la implementación inicial estará limitada a los Planteles de Aplicación de la UNSCH.

### Alcance del piloto

- Implementación inicial en los Planteles de Aplicación de la UNSCH.
- Aislamiento lógico de información mediante `tenant_id`.
- Validación de rendimiento y comportamiento bajo la volumetría definida.
- Evaluación de la arquitectura para futuras ampliaciones.

### Métricas objetivo del piloto

- **100 a 200 usuarios concurrentes.**
- **1,000 a 5,000 estudiantes registrados.**
- **Hasta 100,000 registros académicos y de asistencia.**

### Proyección de escalabilidad

Una vez validado el piloto, el sistema podrá evolucionar progresivamente hacia:

- **1,000 o más usuarios concurrentes.**
- **N instituciones educativas.**
- **50,000 o más estudiantes registrados.**
- **1 millón o más de registros académicos.**
- Réplicas de lectura.
- Particionado de base de datos.
- Optimización de consultas.
- Servicios desacoplados cuando la carga lo justifique.
- Infraestructura de mayor disponibilidad.

---

## 13. SUPUESTOS

Para la ejecución del proyecto se consideran los siguientes supuestos:

- Los Planteles de Aplicación de la UNSCH proporcionarán los datos y accesos necesarios para el desarrollo y validación.
- Existirá conectividad a internet estable para los usuarios del sistema.
- Los usuarios contarán con conocimientos básicos de navegación web.
- Se contará con el apoyo de la dirección y coordinación académica.
- Se dispondrá de infraestructura tecnológica adecuada para el despliegue.
- Se contará con los recursos necesarios para el desarrollo y operación inicial del piloto.
- La institución aceptará las políticas relacionadas con privacidad y protección de datos personales.
- Los usuarios autorizados proporcionarán retroalimentación durante las etapas de validación.

---

## 14. RESTRICCIONES

El proyecto estará sujeto a las siguientes restricciones:

- Tiempo limitado para el desarrollo del piloto.
- Equipo de desarrollo reducido.
- Dependencia de la infraestructura tecnológica disponible.
- Cumplimiento de las normativas de protección de datos personales.
- Dependencia de la disponibilidad de información proporcionada por la institución.
- No se realizará el escalamiento a múltiples instituciones antes de validar el piloto.
- Presupuesto acotado.
- Las funcionalidades no contempladas en el alcance deberán ser evaluadas como posibles extensiones posteriores.

---

## 15. CRITERIOS DE ÉXITO DEL PILOTO

| Criterio | Meta |
|---|---:|
| Usuarios capacitados que utilizan el sistema | ≥ 90 % |
| Reducción del tiempo de generación de reportes | ≥ 50 % |
| Disponibilidad del sistema | ≥ 99.5 % |
| Tiempo de respuesta P95 | < 3 segundos |
| Satisfacción de los usuarios | ≥ 80 % |
| Arquitectura validada para futuras ampliaciones | Sí |
| Incidentes críticos de seguridad | 0 |

Los criterios de éxito serán evaluados durante la etapa de validación y estabilización del piloto, utilizando métricas técnicas y retroalimentación de los usuarios institucionales.

---

## 16. HOJA DE RUTA DE ESCALAMIENTO POR INSTITUCIONES

| Fase | Descripción |
|---|---|
| **Fase 1** | Implementación y validación del piloto en los Planteles de Aplicación de la UNSCH. |
| **Fase 2** | Ajustes de arquitectura multiinstitución, superadministración, aislamiento de datos y plantillas de configuración. |
| **Fase 3** | Despliegue controlado en 3 a 5 instituciones educativas. |
| **Fase 4** | Escalamiento progresivo mediante réplicas de lectura, particionado y optimización de infraestructura. |
| **Fase 5** | Consolidación del producto como plataforma general multiinstitución. |

---

## 17. CONCLUSIÓN DE LA DELIMITACIÓN

El proyecto se delimita como un **piloto funcional, institucional y escalable** de una plataforma web orientada a la gestión académica e información institucional de los Planteles de Aplicación de la UNSCH.

La primera implementación estará restringida a los Planteles de Aplicación de la UNSCH, con funcionalidades claramente definidas para la gestión de usuarios, información académica, notas, asistencia, monitoreo, reportes, mapas de calor y auditoría.

El producto será desarrollado bajo una arquitectura preparada para su evolución hacia un modelo multiinstitución. Sin embargo, la incorporación de otras instituciones, el incremento de la volumetría y las funcionalidades adicionales se desarrollarán únicamente después de validar técnica y funcionalmente el piloto.

De esta manera, el proyecto mantiene un **alcance controlado y viable para su primera implementación**, al mismo tiempo que establece una base tecnológica para un futuro escalamiento institucional sin requerir un rediseño completo del sistema.
```