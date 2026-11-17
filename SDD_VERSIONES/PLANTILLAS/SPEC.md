# Especificación del Cambio — `[ID_CAMBIO: SDD-YYYY-NNN]`

> Copiar este archivo como `SDD_VERSIONES/MODULOS/<modulo>/<ID_CAMBIO>/SPEC.md` en el **Paso 2**.

## 1. Metadatos

| Campo | Valor |
|---|---|
| **ID de Cambio** | `SDD-YYYY-NNN` |
| **Versión objetivo / asociada** | `[Sin liberar / vX.Y.Z]` (`MAJOR` / `MINOR` / `PATCH`) |
| **Módulo real** | `[squad_X_nombre / transversal_plataforma]` |
| **Squad / Responsable** | `[Squad X / Nombre o Agente]` |
| **RF / RNF / CU vinculados** | `[RF-XX, RNF-YY, CU-XXX]` |
| **Rama Git de trabajo** | `[dev / feature/...]` |
| **Fecha de creación** | `YYYY-MM-DD` |
| **Estado** | `Borrador` \| `En ejecución` \| `Verificado` \| `Registrado` |
| **Registro urgente posterior** | `No` \| `Sí (justificación de excepción según § 9)` |

---

## 2. Problema o Necesidad (Por qué se modifica)

Describir de forma concreta el problema detectado, defecto, requerimiento nuevo o deuda técnica que motiva el cambio, con enlaces a la evidencia existente (RF, CU, ADR o hallazgo).

---

## 3. Objetivo y Alcance (Qué cambiará)

- **Objetivo:** ...
- **Dentro del alcance:**
  - ...
- **Fuera del alcance (Límites de `limites_y_alcance_proyecto.md`):**
  - ...

---

## 4. Archivos Reales Afectados (Identificados en Paso 1)

| Capa | Ruta real del archivo | Tipo de cambio |
|---|---|---|
| Frontend | `frontend/...` | Modificar / Crear |
| Backend | `backend/...` | Modificar / Crear |
| Base de Datos | `database/migrations/...` | Nueva migración (nunca editar aplicadas) |
| Contratos OpenAPI | `packages/contracts/openapi/...` | Modificar / Crear |
| Documentación | `docs/...` | Actualizar si aplica |

---

## 5. Requisitos y Criterios de Aceptación

1. **CA-01:** ...
2. **CA-02:** ...
3. **Calidad técnica obligatoria:** `npm run lint`, `npm run build` y pruebas aplicables sin errores.
