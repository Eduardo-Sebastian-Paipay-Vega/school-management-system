# Sprint 2 — Transición de JWT y códigos de error

**Estado:** propuesta técnica implementable en la rama de S2; ADR-002 y ADR-005 siguen `Propuesto`. Ningún cambio incompatible debe fusionarse a `dev` hasta registrar la revisión de los consumidores y del consejo de diseño. El despliegue real continúa limitado al piloto.

## Decisiones para la implementación

| Área | Antes | Después | Compatibilidad |
|---|---|---|---|
| Claim de tenant | `tenantId` en access/refresh JWT del backend común | `tenant_id` canónico, UUID de `instituciones.id` | Lector puede aceptar `tenantId` solo durante una ventana explícita de hasta 7 días desde el corte; tokens nuevos siempre emiten `tenant_id`. Si ambos claims existen y difieren, rechazar. Sin ventana configurada, no aceptar legado. |
| Autoridad del tenant | Código modular resuelto antes de login; luego sesión validada | Igual; tenant de JWT/sesión, jamás de cabecera/cuerpo | `X-Tenant-ID` ausente o igual al tenant autenticado no cambia contexto; discordante responde 403 `TENANT_MISMATCH`. |
| Audiencias | `sms-web` y `sms-refresh` en Core; M8 usa `sms-grades` | Se conservan en S2 | La transición de claim se revisa con Squad 3 antes del futuro gateway; el navegador no recibe credenciales internas de M8. |

La ventana de legado usa un fin absoluto `JWT_LEGACY_TENANT_ACCEPT_UNTIL` en formato ISO UTC, fijado al desplegar. El lector acepta un JWT legado solo si aún está vigente, su `iat` no supera el reloj por más de 60 segundos, tiene antigüedad máxima de siete días y la fecha fin no ha llegado. La respuesta emite solo formato nuevo; el código nuevo no emite tokens legados ni extiende la fecha fin al rotar refresh. Si la variable falta, venció, es inválida o excede siete días desde el arranque, el lector rechaza el claim legado.

## Mapa de códigos HTTP

| HTTP | Código actual | Código objetivo | Política |
|---:|---|---|---|
| 400 | `VALIDATION_ERROR` | `VALIDATION_FAILED` | Mantener mensaje público y `timestamp`; `INVALID_JSON` sigue específico. |
| 401 | `UNAUTHORIZED`, `TOKEN_INVALID`, `SESSION_EXPIRED` | `UNAUTHENTICATED` | No revelar por código si no hay token, expiró o se revocó; cliente solicita nuevo login/refresh según flujo. |
| 403 | `FORBIDDEN` | `ACCESS_DENIED` | `TENANT_MISMATCH` y `ORIGIN_DENIED` siguen específicos. |
| 429 | `TOO_MANY_ATTEMPTS` | `RATE_LIMITED` | Mantener límites y respuesta uniforme de login/recuperación. |
| 503 | `AUTH_UNAVAILABLE`, `AUDIT_UNAVAILABLE` | Se conservan como fallos de dependencia | Falla cerrado; no convertir a 401/403 ni exponer detalles internos. |

Otros códigos de dominio publicados (por ejemplo, enlace inválido, periodo cerrado) conservan su semántica hasta que el catálogo ADR-005 enumere cada uno. La tabla anterior no autoriza renombrarlos por búsqueda global. El sobre de error es `{ success:false, error:{code,message,details?}, timestamp }`; `details` solo aparece en validación por campo. Una petición del tenant A con recurso B nunca devuelve la existencia ni los datos de B.

## Orden de publicación y verificación

1. Congelar esta tabla con Squad 1 y consumidores S2/S3/S5; registrar decisión en el acta de S1/ADR-002/005.
2. Publicar el OpenAPI modular y tipos generados con ejemplos de errores, preservando las 46 rutas y 57 operaciones hasta una migración de URI acordada.
3. Desplegar el lector dual acotado y emisor de `tenant_id`; comprobar access/refresh antiguos, nuevos y claims discordantes. Registrar la fecha absoluta de retirada del lector legado. No permitir la ventana por defecto indefinida.
4. Cambiar productor y cliente de errores en la misma entrega; probar 400/401/403/404/413/429/503, incluido Redis indisponible y cabecera tenant discordante.
5. Retirar la lectura legada tras `JWT_LEGACY_TENANT_ACCEPT_UNTIL` mediante cambio revisado; no confundir esta retirada operativa con la migración *contract* de columnas de identidad de S3.

**Puerta de aceptación:** pruebas automatizadas de sobre/código, compatibilidad JWT y aislamiento A/B; OpenAPI y tipos reproducibles; frontend/backend compilados; evidencia de revisión formal. Hasta ese momento el documento es una propuesta de la rama S2.
