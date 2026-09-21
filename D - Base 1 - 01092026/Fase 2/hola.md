# Fase 2: Diseño y Desarrollo de Software

La especificación técnica formal y estructurada de los requisitos del sistema se encuentra disponible en:

👉 **[requisitos_funcionales_tecnicos.md](file:///e:/zapata%202026%20-%20II/school-management-system/D%20-%20Base%201%20-%2001092026/Fase%202/Requisitos%20Funcionales/requisitos_funcionales_tecnicos.md)**

---

## Contenido de la Especificación Técnica (SRS)

1. **Arquitectura Técnica de Referencia:** Flutter Web SPA, Backend RESTful API, PostgreSQL Relacional con particionado multi-tenant (`tenant_id`), Redis Caché / Tokens y WebSockets en tiempo real.
2. **Estándares Técnicos Transversales:** Contratos de API, tokens JWT (HS256/RS256), esquema `ApiResponse<T>`, manejo de errores y rate limiting.
3. **13 Módulos Técnicos Especificados:**
   - Módulo 1: Servicios de Autenticación, JWT, RBAC y Sesiones (`RF-TEC-SEG`)
   - Módulo 2: API de Gestión de Usuarios, Directorio y Cuentas (`RF-TEC-USU`)
   - Módulo 3: API de Parametrización y Estructura Organizacional (`RF-TEC-ADM`)
   - Módulo 4: API de Gestión Académica, Matrícula y Carga Lectiva (`RF-TEC-ACA`)
   - Módulo 5: API de Asistencia Estudiantil y Servicio de Kiosco/Portería (`RF-TEC-AST`)
   - Módulo 6: API de Asistencia y Cómputo de Horas de Practicantes (`RF-TEC-PRA`)
   - Módulo 7: API de Control de Asistencia y Horas Docentes Contratados (`RF-TEC-DOC`)
   - Módulo 8: Motor de Calificaciones en Tiempo Real y WebSockets (`RF-TEC-NOT`)
   - Módulo 9: Motor de Generación y Agregación de Mapas de Calor (`RF-TEC-CAL`)
   - Módulo 10: API de Tableros de Control, Métricas y Alertas Tempranas (`RF-TEC-MON`)
   - Módulo 11: Servicio de Generación y Exportación de Reportes PDF/Excel (`RF-TEC-REP`)
   - Módulo 12: Motor de Trazabilidad, Bitácora de Auditoría y Ley 29733 (`RF-TEC-AUD`)
   - Módulo 13: API de Difusión Digital, Cartelera y Contenidos (`RF-TEC-DIF`)
4. **Matriz Completa de Trazabilidad Técnica:** Cruce detallado entre los requerimientos de usuario de la Fase 1 y los contratos técnicos, endpoints, métodos HTTP, entidades de PostgreSQL y roles RBAC de la Fase 2.
