# ADR-005: Contratos de API — OpenAPI 3.1 como fuente única, sobre y catálogo de errores

- **Estado:** Propuesto (borrador)
- **Fecha:** 2026-10-22
- **Decisores:** Líder de proyecto (Squad 2), Squad 1 (Brandon Montero), Squad 3 (Steve Ovalle)
- **Squads afectados:** S1, S2, S3, S4, S5
- **Formaliza:** decisión D-18 de [`F0_DECISIONES_ARQUITECTURA_PENDIENTES.md`](../../../../docs/F0_DECISIONES_ARQUITECTURA_PENDIENTES.md) y el paquete `packages/contracts` de §5.4 de [`F0_PLAN_MIGRACION_TYPESCRIPT.md`](../../../../docs/F0_PLAN_MIGRACION_TYPESCRIPT.md)
- **Requisitos relacionados:** RNF-16, RNF-17, RNF-18; [`sdd_rules.md`](../../../../.agents/rules/sdd_rules.md) §3
- **Estado de implementación S2:** el PR #2 modulariza las 46 rutas y 57 operaciones del Core y genera tipos; la validación completa de cada respuesta contra OpenAPI y los contratos de otros squads siguen pendientes. La decisión permanece propuesta.

## Contexto

Al redactarse este ADR, los contratos vivían en cinco archivos Markdown (`Squad X/contratos_api.md`) sin validación automática. En el PR #2, el contrato vigente del Core reside en `packages/contracts/openapi/openapi.yaml`, con `components/` y `paths/`; `core.yaml` se conserva como instantánea para comprobar el inventario. Redocly, la generación reproducible de tipos y pruebas HTTP representativas corren en CI. Todavía no se valida cada respuesta real contra su esquema OpenAPI ni se han incorporado las rutas de los otros squads. La tabla distingue reglas y desvíos que motivaron la decisión:

| Fuente | Forma de error real |
|---|---|
| `sdd_rules.md` §3.2 | `{ success: false, error: { code, message }, timestamp }` |
| M8 (`app.ts`, función `send`) | Cumple la regla |
| `contratos_api.md` del Squad 1 | Agrega `statusCode` dentro del cuerpo |
| `auth.middleware.ts` y `rbac.middleware.ts` antes de S2 | Usaban el sobre `{ success: false, error: { code, message }, timestamp }`, pero mantenían códigos como `UNAUTHORIZED`, `TOKEN_INVALID` y `FORBIDDEN` fuera del catálogo propuesto; el PR #2 normaliza las rutas representativas |
| `core/http/errors.ts` y `audit.routes.ts` | Usan el sobre canónico; el middleware de tenant histórico ya no existe |

El lint y la generación de tipos compartidos del Core pasan en el PR #2. Las pruebas integradas comprueban estado, código y sobre en casos representativos, pero no validan todas las respuestas contra los esquemas OpenAPI. Los squads consumidores (S3 ← S2, S4 ← S2/S3, S5 ← S3/S4) aún requieren revisión de sus DTO y pruebas proveedor-consumidor antes de depender de contratos estables.

## Opciones consideradas

1. **Seguir con Markdown.**
   - En contra: no se puede validar, generar tipos ni probar.
2. **Zod como fuente, con OpenAPI generado** (p. ej. `zod-to-openapi`).
   - A favor: un solo lenguaje para validar y documentar en el backend común (que ya usa `zod` en `auth.controller.ts`).
   - En contra: M8 no usa `zod` y no se modifica (ADR-001), así que sus rutas quedarían fuera o habría que duplicarlas a mano.
3. **OpenAPI 3.1 como fuente única, con tipos generados y `zod` como validador en tiempo de ejecución.**
   - A favor: describe por igual el backend común y M8 sin tocar M8; genera tipos TypeScript para el frontend; habilita pruebas de contrato.
   - En contra: los esquemas `zod` del backend común deben mantenerse alineados con el YAML. Se controla con pruebas de contrato en CI.

## Decisión

Se adopta la **opción 3**.

1. **Ubicación:** `packages/contracts/`, como propone el plan de migración:

   ```text
   packages/contracts/
   ├── openapi/
   │   ├── openapi.yaml            # raíz: info, servers, seguridad, $ref a cada módulo
   │   ├── components/
   │   │   ├── envelope.yaml       # ApiSuccess<T>, ApiError
   │   │   ├── errors.yaml         # catálogo de códigos
   │   │   └── pagination.yaml
   │   └── paths/
   │       ├── auth.yaml           # S1
   │       ├── users.yaml          # S1
   │       ├── audit.yaml          # S1
   │       ├── enrollments.yaml    # S2
   │       ├── attendance.yaml     # S2
   │       ├── grades.yaml         # S3 (describe M8 tal como está)
   │       ├── analytics.yaml      # S4
   │       ├── documents.yaml      # S5
   │       └── public.yaml         # S5 (verificador QR, portal)
   ├── events/
   │   └── asyncapi.yaml           # eventos WebSocket (catálogo de la Etapa 3.2)
   └── src/
       └── generated.ts            # tipos generados; no se editan a mano
   ```

   Cada squad es dueño de su archivo en `paths/`. `components/` pertenece al Squad 1 y cualquier cambio requiere la aprobación de los 5 squads.
2. **Sobre canónico** (D-18). Se retira `statusCode` del cuerpo, porque ese dato ya va en el código HTTP:

   ```json
   { "success": true,  "data": { },                                 "timestamp": "2026-10-22T14:05:00.000Z" }
   { "success": false, "error": { "code": "ACCESS_DENIED", "message": "Texto para el usuario", "details": [ ] }, "timestamp": "2026-10-22T14:05:00.000Z" }
   ```

   `details` es opcional y solo se usa para errores de validación por campo (`400`). Las listas paginadas devuelven `data: { items: [], page, limit, total }`.
3. **Catálogo de errores estable** en `components/errors.yaml`. Arranca con los códigos de M8 (D-18). Un código publicado no se renombra ni se reutiliza.

   | HTTP | Familia | Ejemplos |
   |---|---|---|
   | 400 | Validación | `INVALID_JSON`, `VALIDATION_FAILED` |
   | 401 | Autenticación | `UNAUTHENTICATED` |
   | 403 | Autorización y tenant | `ACCESS_DENIED`, `TENANT_MISMATCH` (ADR-002), `ORIGIN_DENIED` |
   | 404 | Recurso | `NOT_FOUND` |
   | 409 | Concurrencia | `VERSION_CONFLICT` |
   | 413 | Tamaño | `BODY_TOO_LARGE` |
   | 422 | Regla pedagógica o de negocio | `PERIOD_CLOSED`, `INVALID_GRADE`, `SELF_APPROVAL` |
   | 429 | Límite de tasa | `RATE_LIMITED` |
   | 500 | Interno | `INTERNAL_ERROR` (nunca expone el detalle técnico) |

4. **Flujo de trabajo, API-first:**
   1. El squad propone el cambio en su `paths/*.yaml` dentro de su SDD.
   2. El consumidor lo revisa y lo aprueba en el mismo PR.
   3. Recién entonces se implementa el endpoint.
5. **Herramientas** (por fijar al crear el paquete; sugeridas):
   - lint del OpenAPI con Redocly CLI o Spectral;
   - generación de tipos con `openapi-typescript` para `frontend/` y para el backend común;
   - validación en tiempo de ejecución con `zod` en el backend común;
   - pruebas de contrato: cada respuesta de las pruebas de integración se valida contra el esquema OpenAPI.
6. **Versionado:**
   - Prefijo `/api/v1`. Agregar campos opcionales o endpoints nuevos no rompe la versión.
   - Quitar o renombrar un campo, cambiar un tipo o cambiar la semántica de un código **sí** la rompe: requiere ADR y convivencia con `/api/v2` hasta que los consumidores migren.
7. **Los `contratos_api.md` dejan de ser normativos.** Se conservan como explicación en lenguaje natural, con un enlace al YAML. Si discrepan, manda el YAML.

## Consecuencias

- **Squad 1:** crea `packages/contracts/` con `components/` y los `paths/` de auth, users y audit, y corrige `auth.middleware.ts` y `rbac.middleware.ts` al sobre canónico. Esto es Etapa 3.2 del plan.
- **Squad 3:** describe M8 en `paths/grades.yaml` **tal como funciona hoy**, sin cambiar código (§4.1 del plan de migración). Las rutas alias de M8 (`batch-save`, `auto-save`, `batch-upsert`) se documentan como obsoletas, con una sola ruta canónica: `PATCH /api/v1/grades/batch`.
- **Squads 2, 4 y 5:** su SDD (Etapa 3.3) entrega su `paths/*.yaml` en lugar de solo Markdown.
- **Frontend:** el cliente HTTP compartido está en `frontend/modules/shared/api/`; el PR #2 incorpora tipos generados para sesión y sobre. Ningún módulo debería definir a mano tipos de respuesta del servidor una vez publicado el contrato tipado.
- **CI:** se agregan dos puertas: lint del OpenAPI y pruebas de contrato. El PR falla si el YAML no compila o si una respuesta real no cumple su esquema.
- **`sdd_rules.md` §3:** se agrega que el contrato normativo es `packages/contracts/openapi/` y se incorporan los códigos 404, 409, 413 y 429 a las respuestas requeridas.
- **Plan de la Fase 3:** las rutas `docs/api/openapi.yaml`, `docs/api/errores.md` y `docs/api/eventos.md` de [`plan_fase_3_diseno.md`](../plan_fase_3_diseno.md) se reemplazan por `packages/contracts/`.

## Preguntas abiertas para la revisión

1. ¿`packages/contracts` se crea ya como *workspace* de npm (D-12) o, por ahora, como carpeta simple?
2. ¿Se documentan los eventos WebSocket con AsyncAPI o basta un esquema JSON por evento dentro del OpenAPI?
3. ¿El mensaje de error se redacta para el usuario final (español, sin jerga) o el frontend lo traduce a partir del `code`?
