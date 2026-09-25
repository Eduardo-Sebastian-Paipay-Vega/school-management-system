# Guía de Directivas y Reglas para Agentes (AGENTS.md)

### Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)
**Servicio Social Universitario IS-480 (2026-II)**  
**Repositorio Oficial:** `https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system`

## 0. Secuencia y Orden Obligatorio de Lectura (Para no perderse en el proyecto)

> [!IMPORTANT]
> Todo desarrollador, evaluador o agente de IA que interactúe con el repositorio **DEBE seguir la ruta de lectura ordenada** antes de realizar consultas complejas, modificar código o redactar documentación:
> 1. **Consultar la regla de navegación:** [`.agents/rules/orden_lectura_obligatorio.md`](.agents/rules/orden_lectura_obligatorio.md).
> 2. **Activar la skill de navegación:** [`.agents/skills/guia-lectura-proyecto/SKILL.md`](.agents/skills/guia-lectura-proyecto/SKILL.md).
> 3. **Secuencia de 5 Fases:**
>    * **Paso 0:** Límites y Out-of-Scope (`limites_y_alcance_proyecto.md`).
>    * **Paso 1:** 71 Requisitos Funcionales (`requisitos_funcionales.md`) y 71 Casos de Uso.
>    * **Paso 2:** Stack Tecnológico (`stack_tecnologico_proyecto.md`) y Arquitectura C4 (`arquitectura_sistema.md`).
>    * **Paso 3:** Diseño de Detalle por Squad (Reglas SDD y SDD del Squad asignado).
>    * **Paso 4:** Código en Flutter (`lib/core/theme/` y `lib/features/squad_[X]_[modulo]/`).

---

## 1. Contexto del Proyecto y Squads

El proyecto cuenta con **71 Requisitos Funcionales (`RF-01` al `RF-71`)** y **71 Casos de Uso** distribuidos en **5 Squads Técnicos Especializados**:

1. **Squad 1 - Core y Seguridad:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
   *M1, M2, M3, M12 (RF-01 al RF-14, RF-65 al RF-68)* — JWT, RBAC, Configuración escolar y Auditoría Ley 29733.
2. **Squad 2 - Matrícula y Asistencia:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
   *M4, M5, M6, M7 (RF-15 al RF-35)* — Matrícula, Kiosco Offline-First (IndexedDB/Hive), Carnés QR y Horas SSU.
3. **Squad 3 - Calificaciones y Modo Excel:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
   *M8 (RF-36 al RF-46)* — Planilla "Modo Excel", Debounce 400ms, Conclusiones MINEDU y Conversión Dual.
4. **Squad 4 - Analítica y Dashboards:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
   *M9, M10 (RF-47 al RF-58)* — Mapas de Calor Drill-Down, Ficha 360°, Deserción y Métricas SSU IS-480.
5. **Squad 5 - Secretaría y Portal Web:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
   *M11, M13 (RF-59 al RF-64, RF-69 al RF-71)* — Libretas PDF, Verificación QR SHA-256 y Portal Web Institucional.

---

## 2. Elaboración de SDDs (Software Design Documents)

Cuando se solicite crear, estructurar o revisar un **SDD (Documento de Diseño de Software)**:
1. **Activar y consultar la skill `sdd-authoring`** ubicada en [`.agents/skills/sdd-authoring/SKILL.md`](.agents/skills/sdd-authoring/SKILL.md).
2. **Utilizar la plantilla canónica IEEE 1016** ubicada en [`.agents/skills/sdd-authoring/resources/plantilla_sdd.md`](.agents/skills/sdd-authoring/resources/plantilla_sdd.md).
3. **Aplicar las reglas técnicas de diseño** estipuladas en [`.agents/rules/sdd_rules.md`](.agents/rules/sdd_rules.md).
4. **Trazabilidad estricta:** Todo SDD debe mapear a sus Requisitos Funcionales (`D - Base 1 - 01092026/Fase 2/Requisitos Funcionales/Squad X/`) y Casos de Uso (`D - Base 1 - 01092026/Fase 2/Casos de uso/Squad X/`).

---

## 3. Directivas de Código en Flutter

1. **Arquitectura Feature-First:**
   * El código del squad debe residir exclusivamente en `lib/features/squad_[X]_[modulo]/`.
   * El código transversal y compartido reside en `lib/core/`.
2. **Calidad de Código:**
   * Todo cambio en Flutter debe pasar limpiamente:
     * `flutter analyze` (0 errores, 0 warnings).
     * `flutter test` (todos los tests pasando).
3. **Identidad Visual:**
   * Utilizar exclusivamente los tokens de diseño de [`lib/core/theme/app_theme.dart`](lib/core/theme/app_theme.dart) (Verde botella institucional, Azul UNSCH y colores oficiales CNEB).

---

## 4. Política de Ramas Git (GitFlow Ligero)

1. **`main` (Blindada / Producción):**
   * Contiene únicamente código estable, probado y listo para sustentaciones, demos o despliegue.
   * Prohibido hacer push directo a `main`. Solo recibe merges desde `dev` tras alcanzar hitos validados.
2. **`dev` (Integración Continua):**
   * Rama base de desarrollo donde convergen los módulos de los 5 squads.
   * Todos los Pull Requests de features se abren hacia `dev`.
3. **`feature/squad-[X]-[nombre-funcionalidad]` (Desarrollo por Squad):**
   * Ramas de trabajo individuales para cada desarrollador/squad (ej. `feature/squad-1-jwt-auth`, `feature/squad-2-kiosco-qr`).

