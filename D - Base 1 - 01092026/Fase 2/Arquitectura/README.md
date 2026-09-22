# Arquitectura del Sistema y Distribución por Squads

Esta carpeta contiene la documentación formal de la arquitectura de software, patrones de diseño, diagramas de componentes y las carpetas de trabajo técnico especializadas por cada **Squad** para los **Planteles de Aplicación "Guamán Poma de Ayala" - UNSCH**:

---

## 📄 Documento Maestro de Arquitectura
* **[arquitectura_sistema.md](file:///d:/zapata%202026%20-%20II/school-management-system/D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/arquitectura_sistema.md)**:  
  Documento maestro de arquitectura (SAD), diagramas C4 (Contexto, Contenedores, Componentes), Clean Architecture para Flutter y Backend, principios Offline-First, WebSockets, motor CNEB, y la matriz global de asignación de los 71 Requisitos Funcionales.

---

## 📁 Carpetas de Trabajo por Squad

Cada carpeta contiene el `README.md` con los requisitos funcionales detallados, modelo de datos relacional, endpoints API y componentes Flutter a cargo del responsable:

1. 🔐 **[Squad 1 - Core y Seguridad/README.md](file:///d:/zapata%202026%20-%20II/school-management-system/D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/README.md)**
   * **Responsable:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)
   * **Módulos:** M1 (Auth JWT/RBAC), M2 (Usuarios/Directorio), M3 (Configuración Escolar), M12 (Auditoría Inmutable y Ley 29733).
   * **Alcance:** `RF-01` al `RF-14`, `RF-65` al `RF-68` *(18 RFs)*.

2. ⏱️ **[Squad 2 - Matricula y Asistencia/README.md](file:///d:/zapata%202026%20-%20II/school-management-system/D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/README.md)**
   * **Responsable:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)
   * **Módulos:** M4 (Gestión Académica/Matrícula), M5 (Asistencia Kiosco Offline-First/Carnés QR), M6 (Practicantes EPIS), M7 (Docentes Contratados).
   * **Alcance:** `RF-15` al `RF-35` *(21 RFs)*.

3. 📊 **[Squad 3 - Calificaciones y Modo Excel/README.md](file:///d:/zapata%202026%20-%20II/school-management-system/D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/README.md)**
   * **Responsable:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)
   * **Módulos:** M8 (Planilla Rápida Modo Excel, Auto-guardado, Conversión Dual CNEB, Asistente de Conclusiones).
   * **Alcance:** `RF-36` al `RF-46` *(11 RFs)*.

4. 🗺️ **[Squad 4 - Analitica y Dashboards/README.md](file:///d:/zapata%202026%20-%20II/school-management-system/D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/README.md)**
   * **Responsable:** Grissel Arascely Rodríguez Quispe (`@Arascely`)
   * **Módulos:** M9 (Mapas de Calor con Navegación Drill-Down), M10 (Dashboards, Ficha 360° del Alumno, Métricas SSU IS-480).
   * **Alcance:** `RF-47` al `RF-58` *(12 RFs)*.

5. 📑 **[Squad 5 - Secretaria y Portal Web/README.md](file:///d:/zapata%202026%20-%20II/school-management-system/D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/README.md)**
   * **Responsable:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)
   * **Módulos:** M11 (Boletas Oficiales PDF, Verificación Criptográfica QR SHA-256), M13 (Difusión Digital y Portal Web).
   * **Alcance:** `RF-59` al `RF-64`, `RF-69` al `RF-71` *(9 RFs)*.
