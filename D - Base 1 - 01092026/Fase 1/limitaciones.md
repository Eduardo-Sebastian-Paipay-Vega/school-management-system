# LIMITACIONES DEL PROYECTO

## TÍTULO DEL PROYECTO

**DESARROLLO E IMPLEMENTACIÓN DE UNA PLATAFORMA WEB PARA LA GESTIÓN ACADÉMICA E INFORMACIÓN INSTITUCIONAL EN LOS PLANTELES DE APLICACIÓN DE LA UNSCH**

---

## 1. LIMITACIONES DE ALCANCE

- El proyecto se limitará inicialmente a los **Planteles de Aplicación de la UNSCH**.
- El piloto no contempla la implementación simultánea en otras instituciones educativas.
- El escalamiento multiinstitución quedará como una fase posterior.
- No se desarrollarán módulos financieros, contables, de planillas, biblioteca, transporte o comedor.
- No se desarrollará una aplicación móvil nativa; el acceso será mediante una plataforma web responsive.

---

## 2. LIMITACIONES INSTITUCIONALES

- La ejecución y validación dependerán de la disponibilidad y colaboración de las autoridades, docentes y demás usuarios institucionales.
- Los procesos, reglamentos y formatos internos pueden presentar particularidades que no serán completamente parametrizadas durante el piloto.
- No se contemplará la integración con sistemas académicos legados de la UNSCH.
- La adopción del sistema estará condicionada a la disposición de los usuarios para incorporar la nueva herramienta en sus actividades.

---

## 3. LIMITACIONES FUNCIONALES

- No se incluirán procesos de facturación, pagos, cobranzas, tesorería ni planillas.
- No se implementará un sistema integral de admisión o matrícula automatizada.
- No se incorporarán servicios avanzados de comunicación mediante SMS, WhatsApp u otros canales externos.
- No se implementará firma digital avanzada.
- El acceso de padres de familia o apoderados no formará parte del piloto.
- No se implementará un superadministrador global multiinstitución durante esta etapa.
- Los dashboards y mapas de calor tendrán un enfoque principalmente descriptivo y no predictivo.

---

## 4. LIMITACIONES DE USUARIOS

- Los estudiantes tendrán acceso principalmente a la consulta de su información académica y asistencia, sin permisos para modificar registros oficiales.
- Los docentes contratados podrán gestionar las funciones relacionadas con sus actividades autorizadas, sin acceso a la administración global del sistema.
- Los practicantes estarán limitados a las funcionalidades relacionadas con su asistencia y seguimiento.
- Los padres de familia no estarán incluidos en el piloto.
- El personal administrativo no académico no formará parte de los usuarios principales del sistema.
- No se implementará un superadministrador global durante la primera etapa.

---

## 5. LIMITACIONES TECNOLÓGICAS

- El funcionamiento de los módulos de gestión y administración dependerá de una conexión estable a internet.
- No se contemplará funcionamiento offline para los módulos centrales (a excepción del Kiosco de Asistencia de Portería, que dispone de un buffer local de contingencia Offline-First mediante IndexedDB/Cache).
- El sistema dependerá de navegadores web compatibles y actualizados.
- La capacidad de infraestructura disponible puede limitar el rendimiento y crecimiento inicial del sistema.
- No se implementará una arquitectura basada en microservicios durante el piloto.
- Kubernetes no será un requisito para el despliegue inicial.
- Las funcionalidades en tiempo real dependerán de la calidad de la red y de los recursos disponibles en el servidor.
- Las integraciones con sistemas externos requerirán desarrollos adicionales.

---

## 6. LIMITACIONES DE DATOS

- No se realizará la migración completa de la información histórica de todos los años académicos.
- La validación se realizará utilizando información correspondiente a uno o pocos periodos académicos.
- La calidad de los resultados dependerá de la integridad y calidad de los datos proporcionados por la institución.
- No se incluirán datos financieros, médicos, psicológicos o biométricos.
- El uso de datos anonimizados o simulados durante determinadas pruebas puede limitar la representación exacta de algunos escenarios reales.

---

## 7. LIMITACIONES TEMPORALES

- El desarrollo del piloto estará condicionado a un periodo estimado de **16 a 18 semanas**.
- El tiempo disponible puede limitar la profundidad de determinadas funcionalidades.
- La validación con usuarios reales se realizará dentro de un periodo establecido.
- No se contempla operación y mantenimiento indefinido dentro del proyecto.
- La capacitación estará dirigida principalmente a usuarios clave y no a todas las posibles instituciones futuras.

---

## 8. LIMITACIONES ECONÓMICAS

- El proyecto contará con un presupuesto limitado durante la fase piloto.
- Se priorizará el uso de tecnologías de código abierto.
- No se contemplará la adquisición de licencias comerciales de alto costo.
- Los recursos disponibles para infraestructura, almacenamiento y procesamiento pueden limitar el escalamiento inmediato.
- El soporte y mantenimiento posterior al piloto dependerán de la disponibilidad de recursos.

---

## 9. LIMITACIONES DE RECURSOS HUMANOS

- El equipo de desarrollo será reducido, por lo que algunas actividades deberán priorizarse según su importancia.
- La disponibilidad de especialistas en seguridad, DevOps, infraestructura y análisis de datos puede ser limitada.
- La capacitación de usuarios dependerá del tiempo disponible del personal institucional.
- La curva de aprendizaje de los usuarios puede afectar la adopción inicial del sistema.

---

## 10. LIMITACIONES DE ESCALABILIDAD

- El piloto estará orientado a una única institución y no representará una operación multiinstitución real.
- La arquitectura estará preparada para futuras ampliaciones, pero no será validada inicialmente a escala masiva.
- No se implementarán mecanismos avanzados de escalamiento, como réplicas de lectura, particionado avanzado o infraestructura distribuida.
- El sistema estará dimensionado inicialmente para aproximadamente **100 a 200 usuarios concurrentes**.
- El soporte para volúmenes superiores requerirá pruebas, optimizaciones e infraestructura adicional.

---

## 11. LIMITACIONES DE SEGURIDAD

- La autenticación multifactor no será obligatoria durante el piloto.
- No se implementará Single Sign-On (SSO) institucional en esta etapa.
- No se contempla una auditoría de seguridad avanzada o certificación formal.
- Las pruebas de seguridad estarán enfocadas en vulnerabilidades relevantes para el alcance del piloto.
- La protección efectiva de las cuentas dependerá también del cumplimiento de buenas prácticas por parte de los usuarios.

---

## 12. LIMITACIONES DE INTEGRACIÓN

- No se contemplará integración con sistemas ERP, MINEDU u otras plataformas externas durante el piloto.
- No se integrará con plataformas de pagos, bibliotecas digitales o sistemas de videoconferencia.
- No se expondrán APIs públicas para terceros durante la primera implementación.
- Las necesidades de interoperabilidad que surjan posteriormente requerirán desarrollos adicionales.

---

## 13. LIMITACIONES DE RENDIMIENTO

- El sistema será dimensionado inicialmente para **100 a 200 usuarios concurrentes**.
- No se garantizará un rendimiento óptimo ante cargas significativamente superiores a las previstas para el piloto.
- Los reportes y consultas de alta complejidad pueden presentar mayores tiempos de respuesta.
- Los dashboards y mapas de calor pueden verse afectados por grandes volúmenes de información o conexiones de baja calidad.
- Las optimizaciones avanzadas de infraestructura se realizarán únicamente si son necesarias para fases posteriores.

---

## 14. LIMITACIONES METODOLÓGICAS

- La evaluación se realizará en un único contexto institucional.
- Los resultados obtenidos no podrán generalizarse directamente a todas las instituciones educativas.
- La participación de usuarios dependerá de su disponibilidad.
- No se realizará un estudio experimental con grupo de control.
- La evaluación se centrará principalmente en aspectos funcionales, técnicos, de usabilidad y aceptación del sistema.

---

## 15. LIMITACIONES LEGALES Y NORMATIVAS

- El tratamiento de datos estará sujeto a la **Ley N.° 29733, Ley de Protección de Datos Personales del Perú**, y a las disposiciones aplicables.
- El proyecto deberá respetar las normativas y políticas internas de la UNSCH.
- El tratamiento de información requerirá las autorizaciones y mecanismos correspondientes.
- Se limitará la recopilación de información a los datos necesarios para las funcionalidades del sistema.
- El alojamiento de información en servicios externos estará condicionado por las políticas institucionales aplicables.

---

## 16. LIMITACIONES DE ANALÍTICA Y VISUALIZACIÓN

- Los mapas de calor tendrán principalmente un carácter descriptivo.
- Los dashboards estarán orientados al monitoreo de indicadores académicos y de asistencia.
- No se implementarán modelos predictivos ni técnicas de machine learning durante el piloto.
- No se generarán recomendaciones automáticas avanzadas.
- La actualización en tiempo real dependerá de la infraestructura y conectividad disponible.

---

## 17. LIMITACIONES DE MANTENIMIENTO Y SOPORTE

- El mantenimiento posterior al piloto no estará garantizado de manera indefinida.
- El soporte posterior dependerá de los recursos humanos y económicos disponibles.
- Las nuevas funcionalidades deberán evaluarse como mejoras o extensiones posteriores.
- La capacitación continua de los usuarios no estará incluida en el alcance inicial.
- La documentación se concentrará en los componentes necesarios para la operación y mantenimiento básico del sistema.

---

## 18. LIMITACIONES DE VALIDACIÓN

- La validación funcional se realizará principalmente en los Planteles de Aplicación de la UNSCH.
- No se realizará una validación simultánea en múltiples instituciones.
- La cantidad de usuarios participantes puede ser limitada.
- La carga real durante la operación puede diferir de los escenarios utilizados en las pruebas.
- Los resultados de aceptación y usabilidad pueden variar en otros contextos institucionales.

---

## 19. RESUMEN DE LIMITACIONES

| Categoría | Limitación principal |
|---|---|
| Alcance | Piloto limitado a los Planteles de Aplicación de la UNSCH. |
| Institucional | Dependencia de la colaboración y procesos internos de la institución. |
| Funcional | No incluye módulos financieros, servicios complementarios ni aplicación móvil nativa. |
| Usuarios | Sin padres de familia ni superadministrador global en el piloto. |
| Tecnológica | Dependencia de internet y navegadores compatibles. |
| Datos | Sin migración histórica completa. |
| Temporal | Desarrollo limitado a 16–18 semanas. |
| Económica | Presupuesto e infraestructura acotados. |
| Recursos humanos | Equipo de desarrollo reducido. |
| Escalabilidad | Validación inicial limitada a una institución y carga controlada. |
| Seguridad | Sin MFA, SSO ni auditoría de seguridad avanzada. |
| Integración | Sin integración con sistemas externos durante el piloto. |
| Rendimiento | Dimensionado inicialmente para 100–200 usuarios concurrentes. |
| Metodológica | Validación en un único contexto institucional. |
| Legal | Sujeto a la normativa peruana de protección de datos y disposiciones de la UNSCH. |
| Analítica | Visualización descriptiva, sin IA predictiva. |
| Mantenimiento | Soporte y mantenimiento posterior sujetos a disponibilidad de recursos. |
| Validación | Resultados no generalizables directamente a otras instituciones. |

---

## 20. CONCLUSIÓN DE LAS LIMITACIONES

Las limitaciones establecen las condiciones técnicas, funcionales, institucionales, económicas y temporales bajo las cuales se desarrollará el proyecto. Estas restricciones permiten mantener un **alcance controlado y viable para la fase piloto**, evitando comprometer recursos en funcionalidades que no son prioritarias para la primera implementación.

El sistema se diseñará con capacidad de evolución y escalamiento; sin embargo, la incorporación de nuevas instituciones, integraciones externas, mayores volúmenes de usuarios, funcionalidades avanzadas y mecanismos de analítica predictiva serán evaluados y desarrollados en fases posteriores, de acuerdo con los resultados obtenidos durante la validación del piloto.
```
