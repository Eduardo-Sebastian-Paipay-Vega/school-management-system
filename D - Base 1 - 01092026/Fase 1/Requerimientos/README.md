# Catálogo de Requerimientos de Software (Fase 1)

### Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)
**Servicio Social Universitario IS-480 (2026-II) — Fase I: Diagnóstico y Formulación**

Este directorio contiene las especificaciones completas de los requerimientos del sistema en su etapa inicial de diagnóstico, orientadas al modelado del negocio escolar y los atributos de calidad institucional:

---

## 📚 Documentos Oficiales de Requerimientos

| Documento | Enfoque Metodológico | Cobertura | Archivo Oficial |
|---|---|---|:---:|
| **Requerimientos Funcionales (RF)** | Necesidades operativas y reglas de negocio escolar (Enfoque No Técnico). | 71 RFs organizados en 13 módulos de trabajo. | 📋 **[requerimientos_funcionales.md](requerimientos_funcionales.md)** |
| **Requerimientos No Funcionales (RNF)** | Atributos de calidad, restricciones y directivas de ingeniería (**ISO/IEC 25010**). | 28 RNFs clasificados en 6 dimensiones de calidad. | ⚙️ **[requerimientos_no_funcionales.md](requerimientos_no_funcionales.md)** |

---

## 1. Resumen de Módulos de Requerimientos Funcionales (71 RF)

1. **MÓDULO 1: Control de Acceso, Autenticación y Gestión de Sesiones** (`RF-SEG-01` al `RF-SEG-04`)
2. **MÓDULO 2: Administración de Usuarios y Directorio Institucional** (`RF-USU-01` al `RF-USU-05`)
3. **MÓDULO 3: Configuración y Estructura Organizacional Escolar** (`RF-ADM-01` al `RF-ADM-05`)
4. **MÓDULO 4: Gestión Académica, Padrón Escolar y Carga Lectiva** (`RF-ACA-01` al `RF-ACA-05`)
5. **MÓDULO 5: Control y Gestión de Asistencia de Estudiantes** (`RF-AST-01` al `RF-AST-08`, incluye portería "Wachiman", kiosco offline, carné QR y app móvil en tiempo real)
6. **MÓDULO 6: Control de Asistencia y Cumplimiento de Practicantes** (`RF-PRA-01` al `RF-PRA-04`)
7. **MÓDULO 7: Control de Asistencia y Horas de Docentes Contratados** (`RF-DOC-01` al `RF-DOC-04`)
8. **MÓDULO 8: Registro, Flujo y Seguimiento de Calificaciones en Tiempo Real** (`RF-NOT-01` al `RF-NOT-11`, incluye Modo Excel, conclusiones CNEB, auto-guardado conectado y conversión 0-20 a letras AD/A/B/C)
9. **MÓDULO 9: Mapas de Calor y Análisis Visual del Rendimiento y Asistencia** (`RF-CAL-01` al `RF-CAL-05`, incluye drill-down)
10. **MÓDULO 10: Monitoreo Institucional, Dashboards y Alertas Tempranas** (`RF-MON-01` al `RF-MON-07`, incluye Ficha 360° y panel SSU IS-480)
11. **MÓDULO 11: Emisión de Reportes, Libretas y Documentación Escolar** (`RF-REP-01` al `RF-REP-06`, incluye verificación criptográfica QR)
12. **MÓDULO 12: Trazabilidad, Seguridad y Auditoría Institucional** (`RF-AUD-01` al `RF-AUD-04`, conforme a Ley N.° 29733)
13. **MÓDULO 13: Plataforma de Difusión Digital y Comunicación Institucional** (`RF-DIF-01` al `RF-DIF-03`)

*Para revisar el detalle extenso (descripciones, actores, datos de entrada, reglas de negocio, flujos y criterios de aceptación de cada uno de los 71 requerimientos), consulte [requerimientos_funcionales.md](requerimientos_funcionales.md).*

---

## 2. Resumen de Dimensiones de Requerimientos No Funcionales (ISO/IEC 25010)

1. **Eficiencia de Desempeño (`RNF-DES`):** Latencia UI < 1.5s, debounce de 400ms, decodificación en portería < 300ms, mapas de calor < 2.0s y soporte de 150 usuarios concurrentes.
2. **Seguridad y Privacidad (`RNF-SEG`):** JWT dual (15m/7d), RBAC estricto, bcrypt cost 12, protección de menores (Ley 29733 con AES-256), verificación documental QR con SHA-256 y mitigación OWASP.
3. **Fiabilidad y Resiliencia (`RNF-FIA`):** Alta disponibilidad lectiva 99.5%, kiosco de portería Offline-First (IndexedDB/Hive), consistencia transaccional ACID y copias de seguridad RPO < 24h / RTO < 2h.
4. **Usabilidad y Accesibilidad (`RNF-USA`):** Diseño responsivo (360px a 1920px), navegación de planilla por teclado ("Modo Excel"), accesibilidad WCAG 2.1 AA y mitigación de brecha digital (< 30 min).
5. **Mantenibilidad de Software (`RNF-MAN`):** Arquitectura Feature-First desacoplada por Squads, 0 errores/warnings en `flutter analyze`, suite automatizada `flutter test` y SDDs canónicos IEEE 1016.
6. **Portabilidad y Conformidad (`RNF-POR`):** Flutter Web PWA y Windows Desktop, compatibilidad en navegadores modernos, localización regional `America/Lima` y normas pedagógicas CNEB/MINEDU.

*Para revisar las fichas completas, métricas cuantificables y trazabilidad de los atributos de calidad, consulte [requerimientos_no_funcionales.md](requerimientos_no_funcionales.md).*
