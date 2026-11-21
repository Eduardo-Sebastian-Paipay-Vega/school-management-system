# Plantillas de Entregables Markdown

## Plantilla para `01-CATALOGO-RF-CU.md`

```markdown
# Catálogo de Requerimientos Funcionales y Casos de Uso

## Módulo M01: [Nombre del Módulo]
**Descripción:** [Propósito del módulo dentro del sistema]

### Submódulo SM01.1: [Nombre del Submódulo]

#### Requerimientos Funcionales
| ID | Nombre | Descripción / Regla de Negocio | Estado | Evidencia (Back / Front) |
|---|---|---|---|---|
| RF-001 | [Título] | [Descripción detallada] | Implementado / Indicio | `views.py` / `comp.ts` |

#### Casos de Uso
- **CU-001: [Nombre del Caso de Uso]** (Asociado a `RF-001`)
  - **Actor:** [Rol]
  - **Precondición:** [Estado previo]
  - **Flujo Principal:**
    1. [Paso 1]
    2. [Paso 2]
  - **Flujos Alternativos / Errores:** [Validaciones detectadas en código]
  - **Postcondición:** [Resultado en base de datos / UI]
```

## Plantilla para `02-INDICIOS-Y-FUNCIONALIDADES-OCULTAS.md`

```markdown
# Indicios de Funcionalidades y Desarrollo Incompleto

| ID Indicio | Capa | Ubicación en Código | Qué se encontró | Funcionalidad Inferida | Acción Sugerida |
|---|---|---|---|---|---|
| IND-001 | Backend | `models.py` (línea X) | Campo/tabla sin endpoint | [Funcionalidad] | [Completar API / Limpiar] |
```
