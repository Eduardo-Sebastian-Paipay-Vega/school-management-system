# Sprint 1 — Propuestas de enmienda normativa del Core

**Estado:** propuesta para revisión; no altera RF, CU ni SDD vigentes. **Corte:** 2026-10-30. Se aplicó la guía `sdd-authoring` y `.agents/rules/sdd_rules.md`; los cambios definitivos requieren aprobación del dueño funcional y del Squad 1.

## 1. RF-05 y CU-USR-01: activación segura de cuenta

### Discrepancia comprobada

- `RF-05.md` §2 exige generar y enviar credenciales provisionales y dejar la cuenta `ACTIVO`; `CU-USR-01.md` §§4–7 exige generar contraseña y enviarla por correo.
- `backend/src/services/users.service.ts` crea `usuarios` con hash aleatorio no conocido y estado `PENDIENTE_CAMBIO_CLAVE`; `backend/src/services/auth.service.ts` emite vínculo `ACTIVACION` de 72 horas, verifica uso único y deja la cuenta activa cuando el usuario define la clave. La clave se guarda con `crypt(..., gen_salt('bf',12))`.
- `backend/src/routes/users.routes.ts` separa `POST /users` de `POST /users/:id/invite`. Crear la cuenta **no envía automáticamente** el enlace. El proceso exacto debe decidirse antes de reescribir la postcondición normativa.

### Redacción propuesta para RF-05

**Enunciado:** «El sistema deberá permitir el alta formal de personas del personal y de sus cuentas de acceso en el plantel correspondiente, validar documento y correo según las reglas institucionales, asignar el rol inicial autorizado y activar cada cuenta únicamente después de que su titular consuma una invitación de un solo uso y defina su propia contraseña».

**Proceso:** 1) buscar identidad dentro del tenant sin exponer resultados de otro; 2) crear o vincular `persona` y cuenta pendiente, sin almacenar ni transmitir contraseñas provisionales; 3) asignar rol inicial; 4) generar y enviar invitación de un solo uso al correo verificado; 5) al consumirse dentro de 72 horas, establecer hash bcrypt de coste mínimo 12, activar y auditar. Si el envío falla, la cuenta sigue pendiente y se permite reintentar de forma auditada.

**Postcondición:** cuenta pendiente tras el alta, activa únicamente después de invitación válida. **Decisión del líder del proyecto, 2026-10-30:** el envío es una acción explícita posterior mediante `POST /users/:id/invite`, como implementa el código actual. La enmienda normativa queda preparada con esa semántica; Dirección y Squad 1 deben revisar la redacción final.

**Aceptación:** alta repetida no duplica persona/cuenta; documento o correo de otro tenant no se revela; ningún correo contiene contraseña; invitación vencida/usada falla; antes de activación el login falla; después de activación el login funciona; alta, invitación y activación dejan auditoría. Incluir el escenario de fallo SMTP y reenvío sin crear otra cuenta.

### Edición propuesta para CU-USR-01

- §4 garantía de éxito: cuenta pendiente e invitación enviada o entrega pendiente registrada, sin credenciales provisionales.
- §5 pasos 5–7: resolver identidad dentro del tenant, crear cuenta pendiente y rol; enviar enlace; titular define clave y activa; registrar ambos eventos. El paso de activación puede describirse como flujo posterior enlazado a CU-SEG si el modelado lo requiere.
- §6: duplicados muestran respuesta que no divulga identidad de otro tenant; agregar invitación vencida, SMTP fallido y reintento.
- §7 RN-USR-02: «La cuenta no podrá autenticarse antes de que su titular establezca la contraseña mediante una invitación de un solo uso vigente». Eliminar cambio obligatorio de una contraseña provisional inexistente.
- §2: retirar a RENIEC como «sistema secundario»: `limites_y_alcance_proyecto.md` prohíbe conexión directa con RENIEC. La comprobación de formato del DNI es local.

## 2. RF-07 / CU-USR-03: distinguir plantel y sede

`RF-07.md` §2 afirma que una sede se registra en `instituciones` y equivale a un `tenant_id`; el esquema y `backend/src/routes/school.routes.ts` registran sedes en `sedes` con `tenant_id` de la institución. **Decisión del líder del proyecto, 2026-10-30:** **institución = tenant** y **sede = unidad del tenant**, conforme al código y ADR-014. Propuesta: enmendar RF-07 y CU-USR-03 para describir esta relación, con una prueba A/B entre instituciones y otra de autorización entre sedes de la misma institución. El despliegue real sigue limitado al piloto hasta una futura ampliación de alcance.

## 3. SDD del Squad 1: actualización a los 22 RF/CU vigentes

La tabla de metadatos de `sdd_squad_1.md` declara 18 RF/CU (`RF-01–14`, `RF-65–68`), pero el alcance de `AGENTS.md`, el índice maestro de CU y la matriz arquitectónica incluye además `RF-72`, `RF-73`, `RF-75`, `RF-76` con `CU-USR-06` a `CU-USR-09`. La matriz §7 del SDD contiene esos cuatro, pero solo **16 filas** en total: faltan `RF-06`, `RF-07`, `RF-09`, `RF-12`, `RF-13` y `RF-14`.

### Cambios exactos propuestos

| Sección | Enmienda necesaria |
|---|---|
| Metadatos | Cambiar a 22 RF: `RF-01–14`, `RF-65–68`, `RF-72`, `RF-73`, `RF-75`, `RF-76`; 22 CU: `SEG-01–04`, `USR-01–09`, `INS-01–05`, `AUD-01–04`. Marcar la siguiente versión «En revisión» hasta aprobación. |
| §1 alcance | Incluir baja/roles, apoderados con consentimiento y notificaciones; distinguir `SUPERADMIN` local del operador SaaS propuesto en ADR-014. |
| §2 componentes | Sustituir nombres conceptuales `AuthNotifier`/`TenantConfigService` por piezas reales o marcar explícitamente diseño futuro; reflejar `withTenant()`, RLS y `SessionProvider`. |
| §3 persistencia | Actualizar modelo hacia `database/migrations/`: `personas` separada de `usuarios`, `enlaces_acceso`, sesiones, permisos, apoderados, notificaciones, `logs_auditoria`; no presentar el DDL histórico del SDD como esquema ejecutable. `tenant_id` canónico es UUID, sujeto a ADR-002. |
| §4 contratos | Usar `packages/contracts/openapi/core.yaml` y rutas actuales `/api/v1/*`; distinguir registro e invitación; quitar rutas inexistentes como `/public/guardians/activate` y `POST /audit/logs` como operación cliente. |
| §5 UI | Reflejar archivos existentes (`SessionProvider.tsx`, `AccessLinkForm.tsx`, `CoreModuleView.tsx`) y páginas del App Router; marcar subcomponentes separados como diseño futuro. |
| §6 calidad | Vincular RNF-05–08 y RNF-17–18 a pruebas reales y a las pruebas integradas faltantes; no declarar SLA o latencias no medidos como aceptación cumplida. |
| §7 trazabilidad | Añadir las seis filas omitidas y corregir las dieciséis existentes contra RF/CU, ruta, tabla, UI y estado. RF-66 depende de la integración S2/S3, no de un trigger genérico. |

### Seis filas faltantes para §7

| RF / CU | Persistencia | API vigente | UI o consumidor |
|---|---|---|---|
| RF-06 / CU-USR-02 | `personas`, `usuarios` | `POST /users/import/preview`, `POST /users/import/commit` | `CoreModuleView.tsx` |
| RF-07 / CU-USR-03 | `instituciones`, `sedes` | `GET/POST /school/sites`; provisión SaaS pendiente | `CoreModuleView.tsx` / operador técnico futuro |
| RF-09 / CU-USR-05 | `usuarios`, `sesiones_usuario` | `GET/PATCH /users/me`, `POST /users/me/change-password` | `CoreModuleView.tsx` |
| RF-12 / CU-INS-03 | `grados_secciones` | `GET/POST /school/years/{id}/sections` | `CoreModuleView.tsx` y Squads 2/3 |
| RF-13 / CU-INS-04 | `escalas_calificacion`, `rangos_escala` | `GET/POST /school/years/{id}/scales`, `POST /school/scales/{id}/approve` | `CoreModuleView.tsx` y Squad 3; rangos bloqueados D-16 |
| RF-14 / CU-INS-05 | `configuracion_institucional` | `GET/PATCH /school/institution` | `CoreModuleView.tsx` y Squad 5 |

## 4. Orden de revisión

1. Squad 1 y Dirección validan el texto de RF-05/CU-USR-01 con envío explícito decidido por el líder.
2. Squad 1 actualiza RF-07/CU-USR-03 con institución como tenant, decidido por el líder, y revisa sus controles de acceso por sede.
3. Squad 1 revisa la versión SDD con los 22 RF/CU y contratos OpenAPI; Squads 2/3/5 confirman interfaces que consumen.
4. Tras las aprobaciones, modificar los documentos normativos con su control de versión y ejecutar revisión de enlaces y trazabilidad; no marcar como aceptado lo que aún carece de prueba integrada.
