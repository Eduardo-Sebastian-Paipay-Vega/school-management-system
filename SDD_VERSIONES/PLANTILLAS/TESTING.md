# Evidencia de Pruebas y Verificación — `[ID_CAMBIO: SDD-YYYY-NNN]`

> Completar este archivo en `SDD_VERSIONES/MODULOS/<modulo>/<ID_CAMBIO>/TESTING.md` durante el **Paso 5**.
> **Regla estricta:** registrar únicamente comandos ejecutados después de la edición final y resultados reales observados. Nunca inventar ni extrapolar pruebas.

## 1. Entorno de Verificación

| Campo | Detalle |
|---|---|
| **Fecha de ejecución** | `YYYY-MM-DD` |
| **Rama / Commit evaluado** | `[rama / hash]` |
| **Servicios activos (si aplica)** | `[Ej. PGlite en memoria / Docker Postgres 16 + Redis 7 / Sin BD viva]` |

---

## 2. Comandos Ejecutados y Resultados Reales

| Verificación | Directorio | Comando exacto | Resultado real | Observaciones / Alcance |
|---|---|---|---|---|
| Lint Frontend | `frontend/` | `npm run lint` | `No ejecutado` \| `0 errores, N avisos` | ... |
| Build Frontend | `frontend/` | `npm run build` | `No ejecutado` \| `OK` \| `Falló` | ... |
| Auditor PrimeReact | `.` | `py -I .claude/skills/primereact-guardian/scripts/audit_primereact.py frontend` | `No aplica` \| `OK` | ... |
| Lint Backend | `backend/` | `npm run lint` | `No ejecutado` \| `OK` | ... |
| Build / Test Backend | `backend/` | `npm test` | `No ejecutado` \| `N/N OK` | ... |
| Servicio M8 | `backend/squad_3_calificaciones/` | `npm run check && npm test` | `No ejecutado` \| `N/N OK` | ... |
| Migraciones BD | `database/` | `npm test` | `No ejecutado` \| `N/N OK` | ... |
| Contratos OpenAPI | `packages/contracts/` | `npm run lint` | `No ejecutado` \| `OK` | ... |

---

## 3. Verificación de Criterios de Aceptación (`SPEC.md`)

| Criterio | Estado | Evidencia observada |
|---|---|---|
| `CA-01` | `Cumplido` \| `Parcial` \| `Pendiente` | `[archivo, prueba o salida real]` |

---

## 4. Limitaciones o Brechas No Probadas

Indicar explícitamente qué quedó fuera de alcance (p. ej., pruebas E2E con navegador, PostgreSQL/Redis reales no levantados, etc.).
