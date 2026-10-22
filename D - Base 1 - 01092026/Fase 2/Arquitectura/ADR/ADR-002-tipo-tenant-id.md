# ADR-002: Tipo, origen y alcance del `tenant_id`

- **Estado:** Propuesto (borrador)
- **Fecha:** 2026-10-22
- **Decisores:** Líder de proyecto (Squad 2), Squad 1 (Brandon Montero), Squad 3 (Steve Ovalle)
- **Squads afectados:** S1, S2, S3, S4, S5
- **Formaliza:** subdecisiones 1 y 2 de D-04 en [`F0_DECISIONES_ARQUITECTURA_PENDIENTES.md`](../../../../docs/F0_DECISIONES_ARQUITECTURA_PENDIENTES.md) y el modelo C1.2 de [`F0_CIERRE_OBSERVACIONES.md`](../../../../docs/F0_CIERRE_OBSERVACIONES.md)
- **No decide:** la autoridad del modelo de notas (K1, K2 o K3 de D-04). Queda para un ADR propio.
- **Requisitos relacionados:** RNF-06, RNF-08; RF de configuración institucional del Squad 1

## Contexto

Las fuentes del repositorio se contradicen sobre qué es un tenant y de qué tipo es:

| Fuente | Definición |
|---|---|
| [`.agents/rules/sdd_rules.md`](../../../../.agents/rules/sdd_rules.md) §2.1 | `tenant_id VARCHAR(50) NOT NULL` |
| `database/init/01_esquema_consolidado.sql` | `tenant_id UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT` (44 líneas mencionan `tenant_id`) |
| `backend/squad_3_calificaciones/migrations/001_grades.sql` | `tenant_id VARCHAR(50)` sin FK, con RLS por `current_setting('app.tenant_id')` |
| `backend/src/middlewares/tenant.middleware.ts` | Lee `X-Tenant-ID` de la cabecera; si falta, usa `'unsch-guaman-poma-2026'` |
| Semilla Flutter histórica (D-04) | La **sede** actúa como tenant |

Esto tiene consecuencias concretas en el código actual:

1. **El tenant por defecto no es un UUID.** `AuthService.login` compara `u.tenant_id = $2` (columna `UUID`) con `'unsch-guaman-poma-2026'`. PostgreSQL rechaza la consulta con `invalid input syntax for type uuid`.
2. **El tenant se puede suplantar.** En `GET /api/v1/audit/verify-chain` (`audit.routes.ts`) el código usa `req.tenantId || req.user?.tenantId`: la cabecera enviada por el cliente **tiene prioridad sobre el JWT**. Un usuario autenticado de un colegio podría consultar la auditoría de otro.
3. **El consolidado no tiene RLS.** El aislamiento depende solo de que cada consulta recuerde filtrar por `tenant_id`.

## Opciones consideradas

1. **`VARCHAR(50)` con un código legible** (p. ej. `unsch-guaman-poma`).
   - A favor: legible en logs y URL; coincide con `sdd_rules.md` y M8.
   - En contra: sin integridad referencial; hay que reescribir todas las columnas `tenant_id` del consolidado; el código es un identificador público y adivinable.
2. **`UUID` con FK a `instituciones(id)`.**
   - A favor: integridad referencial; ya es el tipo del consolidado; un UUID en texto (36 caracteres) cabe en el `VARCHAR(50)` de M8, así que M8 funciona sin cambios.
   - En contra: menos legible; requiere actualizar `sdd_rules.md`.
3. **Sede como tenant.**
   - En contra: el alcance cubre un plantel; multiplicaría tenants y rompería los reportes por institución.

## Decisión

Se adopta la **opción 2**, con estas reglas:

1. **Qué es un tenant:** una fila de `instituciones`. La sede no es un tenant: si hace falta, es un atributo (`sede_id`).
2. **Tipo canónico:** `tenant_id UUID NOT NULL REFERENCES instituciones(id) ON DELETE RESTRICT`, con índice `idx_[tabla]_tenant`. Se corrige `sdd_rules.md` §2.1.
3. **M8 no cambia en esta etapa.** Su columna `VARCHAR(50)` almacena el UUID en texto. Convertirla a `UUID` es una migración posterior con *dry-run* y reversión (D-04, subdecisión 3).
4. **Origen del tenant en cada solicitud:**
   - **Antes de autenticarse** (login, portal público, verificador QR): el tenant se resuelve en el servidor a partir de un identificador público de la institución, `instituciones.codigo_modular`, enviado en el cuerpo del login o deducido del dominio. Nunca se acepta un UUID enviado por el cliente.
   - **Después de autenticarse:** el tenant sale **solo** del claim `tenant_id` del JWT. Se elimina el uso de `X-Tenant-ID` como fuente. Si el cliente envía la cabecera y no coincide con el JWT, la respuesta es `403 TENANT_MISMATCH`.
   - **Se elimina el tenant por defecto** en todo el código, también en desarrollo. El entorno local obtiene su institución desde la semilla.
5. **Defensa en profundidad (doble barrera):**
   - **Aplicación:** cada transacción ejecuta `SET LOCAL app.tenant_id = '<uuid del JWT>'`.
   - **Base de datos:** toda tabla con `tenant_id` activa RLS con la política `tenant_id = current_setting('app.tenant_id', true)::uuid`, igual que ya hace M8. La aplicación se conecta con un rol sin `BYPASSRLS`. El detalle de las políticas queda en la Etapa 3.1 del plan (ADR-003).
6. **Claim del JWT:** el nombre canónico es `tenant_id` (snake_case), como en M8 y en C1.3. El backend común deja de emitir `tenantId`.

```mermaid
sequenceDiagram
    actor U as Usuario
    participant FE as Next.js
    participant API as Backend común
    participant DB as PostgreSQL (RLS)
    U->>FE: usuario + clave (+ código modular)
    FE->>API: POST /api/v1/auth/login
    API->>DB: SELECT id FROM instituciones WHERE codigo_modular = $1
    API->>DB: valida credenciales en ese tenant
    API-->>FE: access token con tenant_id = UUID
    FE->>API: GET /api/v1/... (Bearer)
    API->>API: tenant_id SOLO desde el JWT
    API->>DB: BEGIN; SET LOCAL app.tenant_id = UUID
    DB-->>API: filas del tenant (RLS filtra el resto)
```

## Consecuencias

- **Base de datos:** ninguna columna del consolidado cambia de tipo. Se agregan las políticas RLS y el rol de aplicación sin `BYPASSRLS` (Etapa 3.1).
- **Backend común:**
  - `tenant.middleware.ts` deja de leer la cabecera como fuente y pasa a fijar `app.tenant_id` desde el JWT.
  - `AuthService` emite `tenant_id` en lugar de `tenantId`.
  - Se retiran los literales `'unsch-guaman-poma-2026'` de `tenant.middleware.ts`, `auth.controller.ts` y `audit.routes.ts`.
- **Contrato de login:** `POST /api/v1/auth/login` acepta `codigo_modular` (o lo deduce del dominio). Se refleja en el OpenAPI del Core (ADR-005).
- **M8:** sin cambios de código. Recibe el UUID en texto en el token interno del gateway (ADR-001).
- **Squads 2, 4 y 5:** sus `esquema_datos.sql` y SDD usan `UUID` con FK. Las tablas nuevas (`asistencias_docentes_contratados`, `cuadros_merito`) se crean con esa regla.
- **Pruebas obligatorias:**
  - Un usuario del tenant A no lee ni escribe datos del tenant B, ni por API ni con SQL directo bajo el rol de aplicación.
  - Una cabecera `X-Tenant-ID` distinta del JWT devuelve `403`.
  - Un login con un `codigo_modular` inexistente devuelve `401` sin revelar si la institución existe.

## Hallazgo colateral (fuera del alcance de este ADR)

`AuthService.login` filtra por `u.activo = true`, pero la tabla `usuarios` del consolidado no tiene columna `activo`: tiene `estado estado_usuario_enum DEFAULT 'ACTIVO'`. El login falla aunque el tenant sea correcto. Lo debe corregir el Squad 1 junto con este cambio.

## Preguntas abiertas para la revisión

1. ¿El login identifica la institución por `codigo_modular` en el cuerpo, o por dominio o subdominio? Para un solo plantel, el cuerpo es suficiente.
2. ¿Se convierte `squad3.tenant_id` a `UUID` antes del Gate de la Fase 3 o después?
