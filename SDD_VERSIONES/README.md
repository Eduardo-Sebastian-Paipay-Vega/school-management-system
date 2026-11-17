# Sistema Interno de Control de Cambios y Versiones (SDD_VERSIONES)

### Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)
**Metodología:** Specification-Driven Development (SDD) + Trazabilidad Git/GitHub  
**Regla maestra vinculada:** [`AGENTS.md`](../AGENTS.md) (§ 8)

---

## 1. Propósito y Alcance

`SDD_VERSIONES/` constituye el **registro interno, acumulativo, cronológico y trazable** de todo cambio importante realizado sobre el repositorio real del proyecto.

Su función es responder, en cualquier momento y sin depender de memoria humana:
- **Qué cambió** y **por qué se modificó** (especificación y contexto funcional/arquitectónico).
- **Qué versión** incorporó el cambio y bajo qué identificador documental (`SDD-YYYY-NNN`).
- **Qué módulos y archivos reales** del repositorio fueron afectados.
- **Cómo se implementó** y **qué decisiones o dependencias** aplicaron.
- **Qué pruebas se ejecutaron** y **qué resultados reales se obtuvieron**.
- **Cómo recuperar o revertir** el cambio usando **Git** sin perder el historial.

> [!IMPORTANT]
> **Relación con la documentación existente (sin duplicación):**
> - **Diseño estructural por Squad (IEEE 1016):** permanece en [`D - Base 1 - 01092026/Fase 2/Arquitectura/`](../D%20-%20Base%201%20-%2001092026/Fase%202/Arquitectura/README.md) (regido por [`.agents/rules/sdd_rules.md`](../.agents/rules/sdd_rules.md) y la skill `sdd-authoring`).
> - **Arquitectura operativa, contratos y estado:** permanecen en [`docs/architecture/`](../docs/architecture/00-auditoria-inicial.md), [`docs/requirements/matriz-rf-arquitectura.md`](../docs/requirements/matriz-rf-arquitectura.md), [`docs/core/`](../docs/core/OPERACION_CORE.md) y [`docs/project-health/`](../docs/project-health/AVANCE_2026-11-16.md).
> - **Control evolutivo de cambios y versiones:** reside aquí en `SDD_VERSIONES/`, enlazado directamente con los archivos reales y los commits de Git. **No duplica código fuente** ni reemplaza los SDD de arquitectura IEEE 1016.

---

## 2. Estructura de `SDD_VERSIONES/`

```text
SDD_VERSIONES/
├── README.md                 # Norma central de control de cambios y versiones SDD
├── CHANGELOG.md              # Historial cronológico acumulativo por versión
├── VERSIONES.md              # Inventario real de versiones por paquete y política SemVer
├── MAPA_MODULOS.md           # Conexión entre módulos reales, rutas del repo y RF/CU
├── TRAZABILIDAD.md           # Índice maestro: ID_CAMBIO ↔ Versión ↔ Módulo ↔ Archivos ↔ Git ↔ Pruebas
├── PLANTILLAS/               # Plantillas obligatorias para cada cambio importante
│   ├── SPEC.md
│   ├── PLAN.md
│   ├── TASKS.md
│   ├── IMPLEMENTACION.md
│   ├── TESTING.md
│   └── RELEASE.md
├── MODULOS/                  # Expedientes de cambio por módulo real del sistema
│   ├── squad_1_core/
│   ├── squad_2_asistencia/
│   ├── squad_3_calificaciones/
│   ├── squad_4_analitica/
│   ├── squad_5_secretaria/
│   └── transversal_plataforma/
└── RELEASES/                 # Actas y notas de releases aprobados (con tag Git y evidencia)
```

---

## 3. Procedimiento Obligatorio para Todo Cambio Importante (Pasos 1–7)

Cada vez que se solicite implementar, corregir, mejorar, actualizar o refactorizar una funcionalidad importante, el desarrollador o agente de IA **debe** ejecutar estos 7 pasos en orden:

1. **PASO 1 — IDENTIFICAR:** Determinar el módulo real en [`MAPA_MODULOS.md`](./MAPA_MODULOS.md), los requisitos (`RF-XX` / `RNF-XX` / `CU-XXX`) y las rutas exactas de archivos que serán afectadas en `frontend/`, `backend/`, `database/`, `packages/contracts/` o `docs/`.
2. **PASO 2 — ESPECIFICAR:** Crear la carpeta `SDD_VERSIONES/MODULOS/<modulo>/<ID_CAMBIO>/` (ej. `SDD-2026-001`) y redactar `SPEC.md` usando [`PLANTILLAS/SPEC.md`](./PLANTILLAS/SPEC.md) (problema, objetivo, alcance, criterios de aceptación y no-alcance).
3. **PASO 3 — PLANIFICAR:** Documentar en `PLAN.md` y `TASKS.md` (desde `PLANTILLAS/`) cómo se ejecutará el cambio, sus dependencias, riesgos, validaciones requeridas y estrategia explícita de reversión en Git.
4. **PASO 4 — IMPLEMENTAR:** Realizar los cambios autorizados **directamente sobre los archivos originales del proyecto** (sin duplicar carpetas funcionales ni crear copias paralelas del sistema), respetando la arquitectura Feature-First, ADR vigentes y reglas de `AGENTS.md`.
5. **PASO 5 — VERIFICAR:** Ejecutar las verificaciones reales aplicables (`npm run lint`, `npm run build`, `npm test`, `npm run check`, auditor PrimeReact, lint OpenAPI, etc.) y registrar en `TESTING.md` **únicamente resultados realmente observados**.
6. **PASO 6 — REGISTRAR:** Completar `IMPLEMENTACION.md` y `TESTING.md` dentro de `SDD_VERSIONES/MODULOS/<modulo>/<ID_CAMBIO>/` con la lista exacta de archivos modificados, decisiones tomadas, evidencias de pruebas y referencia al commit/rama Git y comando seguro de reversión.
7. **PASO 7 — VERSIONAR:** Actualizar [`CHANGELOG.md`](./CHANGELOG.md), [`TRAZABILIDAD.md`](./TRAZABILIDAD.md) y el `README.md` del módulo afectado; actualizar [`VERSIONES.md`](./VERSIONES.md) asociando el cambio a la versión vigente en desarrollo o propuesta. **Nunca** crear `RELEASES/<version>.md` ni declarar un release publicado sin aprobación humana, evidencia completa y tag Git autorizado.

---

## 4. Convención de Identificadores y Versionado

- **Identificador documental de cambio (`ID_CAMBIO`):** `SDD-YYYY-NNN` (correlativo anual de 3 dígitos, p. ej. `SDD-2026-001`, `SDD-2026-002`). Es independiente del número de versión del software.
- **Versionado Semántico (SemVer):** `MAJOR.MINOR.PATCH` (detallado en [`VERSIONES.md`](./VERSIONES.md)):
  - **MAJOR:** cambios incompatibles o estructurales relevantes en contratos, esquema o arquitectura.
  - **MINOR:** nuevas funcionalidades o módulos compatibles hacia atrás.
  - **PATCH:** correcciones compatibles de errores, seguridad o ajustes sin ruptura.

---

## 5. Política de Historial y Recuperación con Git

- **Git** es el mecanismo único de control y recuperación del código fuente; **`SDD_VERSIONES/`** es el mecanismo de especificación, decisiones, verificación y trazabilidad.
- **No se duplica el código fuente completo** dentro de `SDD_VERSIONES/`.
- Cada expediente en `MODULOS/<modulo>/<ID_CAMBIO>/` debe registrar el commit base/final y el procedimiento no destructivo de reversión (`git revert <hash>` o `git restore --source <hash_anterior> -- <ruta>`).
- **Prohibido** ejecutar automáticamente operaciones destructivas como `git reset --hard`, `git push --force` o eliminación de ramas sin autorización explícita.
- **Prohibido** eliminar, sobrescribir o reescribir registros históricos previos de `CHANGELOG.md`, `TRAZABILIDAD.md`, `MODULOS/` o `RELEASES/`.

---

## 6. Excepciones y Reglas de Seguridad

### Excepciones (no requieren expediente `SDD-YYYY-NNN` completo)
No se crea una nueva versión documental ni expediente completo para:
- Correcciones ortográficas menores o ajuste de comentarios sin impacto funcional.
- Formateo simple o limpieza estética menor sin cambio de contratos ni comportamiento.
- Archivos o pruebas temporales locales de desarrollo que no alteran la funcionalidad.

Sí requieren **obligatoriamente** expediente SDD (`SDD-YYYY-NNN`): cambios de funcionalidad (`RF-*`), arquitectura, seguridad/RBAC/JWT, APIs y contratos OpenAPI, esquemas o migraciones SQL, dependencias críticas y flujos UI relevantes.

### Reglas de Seguridad y Veracidad
1. No modificar archivos ajenos a la tarea solicitada.
2. No incluir secretos, tokens, contraseñas ni datos personales reales (Ley N.° 29733) en documentos SDD.
3. No afirmar pruebas ejecutadas ni resultados que no se hayan corrido realmente tras la edición final.
4. No declarar versiones publicadas o releases sin aprobación explícita y evidencia verificable.
5. **Urgencias en producción/desarrollo crítico:** si una corrección urgente no puede esperar el expediente previo, aplicar la corrección y registrar el expediente `SDD-YYYY-NNN` inmediatamente después, marcando explícitamente la excepción de registro posterior en `SPEC.md` y `CHANGELOG.md`.
