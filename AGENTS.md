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
   * **Entrega (Outputs):** `squad_1_core.dart` (Dart), middlewares `authenticateJwt` y `requireRoles` (Node.js), endpoints `/api/v1/auth`, `/api/v1/users`, `/api/v1/audit`.
   * **Consume (Inputs):** `docker-compose.yml` (PostgreSQL 16, Redis 7) y `database/init/01_esquema_consolidado.sql`.
2. **Squad 2 - Matrícula y Asistencia:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`) — *Líder de Proyecto*  
   *M4, M5, M6, M7 (RF-15 al RF-35)* — Matrícula, Kiosco Offline-First (IndexedDB/Hive), Carnés QR y Horas SSU.
   * **Entrega (Outputs):** Kiosco de portería (<200ms), carné QR (`RF-26`), endpoint de sync masivo (`POST /api/v1/attendance/sync-batch`), WebSocket Gateway (`RF-27`).
   * **Consume (Inputs):** `squad_1_core.dart` (`AccessControlService`, sesiones), tablas `instituciones`, `usuarios` y `anios_lectivos`.
3. **Squad 3 - Calificaciones y Modo Excel:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`) — *Sub Líder*  
   *M8 (RF-36 al RF-46)* — Planilla "Modo Excel", Debounce 400ms, Conclusiones MINEDU y Conversión Dual.
   * **Entrega (Outputs):** Planilla ágil a 60 FPS por teclado (`RF-38`), asistente de conclusiones (`RF-39`), endpoint en lote (`PATCH /api/v1/grades/batch`) y motor CNEB (`RF-46`).
   * **Consume (Inputs):** `GradingScaleService` (escala CNEB AD, A, B, C de Squad 1), lista de `matriculas` (Squad 2) y tablas `calificaciones` / `evaluaciones`.
4. **Squad 4 - Analítica y Dashboards:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
   *M9, M10 (RF-47 al RF-58)* — Mapas de Calor Drill-Down, Ficha 360°, Deserción y Métricas SSU IS-480.
   * **Entrega (Outputs):** Mapas de calor interactivos (`fl_chart`), radar chart Ficha 360° (`RF-56`), endpoints de agregación (`/api/v1/analytics/*`).
   * **Consume (Inputs):** Récord de asistencia (Squad 2), notas (Squad 3), vistas materializadas `vm_rendimiento_seccion` y `vm_asistencia_mensual`.
5. **Squad 5 - Secretaría y Portal Web:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
   *M11, M13 (RF-59 al RF-64, RF-69 al RF-71)* — Libretas PDF, Verificación QR SHA-256 y Portal Web Institucional.
   * **Entrega (Outputs):** Libretas escolares en PDF vectorial (`RF-59`), Verificador Público QR sin autenticación (`GET /api/v1/public/verify/:token` — `RF-60`), Portal Web en Vercel (`RF-71`).
   * **Consume (Inputs):** Membrete oficial (Squad 1), actas/notas consolidadas (Squad 3), cuadros de mérito (Squad 4), configuración `vercel.json`.

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
   * Contiene únicamente versiones cerradas, probadas y listas para sustentaciones, demos o despliegue oficial.
   * Prohibido hacer push directo a `main`. Solo recibe merges desde `dev` tras alcanzar hitos validados por el líder.
2. **`dev` (Desarrollo Activo e Integración Continua):**
   * Rama principal de trabajo donde convergen los módulos de los 5 squads.
   * Todo avance se prueba (`flutter analyze` y `flutter test`) y se integra directamente en `dev`.
3. **Ramas temporales / de soporte (Opcionales y Efímeras):**
   * Si un desarrollador necesita aislar un experimento o feature específica, crea una rama temporal desde `dev` (ej. `temp/kiosco-test`) y la elimina inmediatamente tras mergearla hacia `dev`, manteniendo el repositorio limpio.

## 5. Preferencia de interfaces: PrimeNG

Por solicitud del usuario, usar la skill local [`primeng`](.agents/skills/primeng/SKILL.md) al diseñar o modificar sus interfaces en este repositorio, especialmente el módulo del Squad 3. Su fuente de referencia es `https://github.com/primefaces/primeng.git`.

PrimeNG pertenece al ecosistema Angular. En el proyecto Flutter, adaptar sus patrones de componentes e interacción a widgets Dart y a los tokens de `AppTheme`. Esta preferencia no cambia el stack tecnológico ni autoriza por sí misma una migración a Angular. Para tareas sin interfaz, continuar con las skills y reglas que correspondan.

---

## 6. Skills de Vercel Labs y Frontend Engineering (Open Agents)

Se incorporaron las skills de ingeniería y diseño frontend procedentes de [`vercel-labs/open-agents`](https://github.com/vercel-labs/open-agents.git) en [`.agents/skills/`](.agents/skills/):

1. **Rendimiento React y Next.js:** [`vercel-react-best-practices`](.agents/skills/vercel-react-best-practices/SKILL.md) — 58 reglas de optimización (eliminación de waterfalls, bundle splitting, React.cache, memoización y server actions).
2. **Diseño de Interfaces de Alta Calidad:** [`frontend-design`](.agents/skills/frontend-design/SKILL.md) y [`emil-design-eng`](.agents/skills/emil-design-eng/SKILL.md) — Directivas visuales de Emil Kowalski y diseño frontend sin patrones genéricos de IA.
3. **Animaciones y Microinteracciones:** [`web-animation-design`](.agents/skills/web-animation-design/SKILL.md) y [`baseline-ui`](.agents/skills/baseline-ui/SKILL.md) — Físicas con Framer Motion, timing curves y accesibilidad visual.
4. **Planificación y Revisión de Código:** [`plan-mode`](.agents/skills/plan-mode/SKILL.md) y [`code-review`](.agents/skills/code-review/SKILL.md) — Análisis arquitectónico sistémico y revisión automatizada de PRs y diffs.
5. **Automatización y Flujos:** [`workflow`](.agents/skills/workflow/SKILL.md), [`agent-browser`](.agents/skills/agent-browser/SKILL.md), [`ai-sdk`](.agents/skills/ai-sdk/SKILL.md) y [`chat-sdk`](.agents/skills/chat-sdk/SKILL.md).

