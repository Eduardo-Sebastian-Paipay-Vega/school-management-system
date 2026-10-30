# Sprint 2 — Resultados y puertas de cierre

**Corte técnico:** 2026-10-30. **Estado:** implementación en revisión. Este registro no equivale a aceptación de los ADR ni a autorización para desplegar otros planteles.

| Historia | Evidencia implementada | Verificación |
|---|---|---|
| S2-00 | Tabla de transición JWT/códigos en `SPRINT_02_TRANSICION_CONTRATOS.md` | Revisión formal de consumidores y consejo de diseño pendiente. |
| S2-01 | OpenAPI dividido en `openapi.yaml`, `paths/` y `components/`; inventario inmutable | `check:inventory`: 46 rutas y 57 operaciones; Redocly válido con 113 advertencias heredadas. |
| S2-02 | `school-contracts` genera `.d.ts`; frontend y backend consumen tipos de sesión | `check:generated` reproducible; builds FE/BE. Los DTO genéricos restantes siguen siendo deuda de contrato. |
| S2-03 | Códigos 400/401/403/429 normalizados; sobre y `timestamp` en auditoría | Backend 10/10 unitarias; suite HTTP integrada para 400/401/403/404/413/429/503. |
| S2-04 | JWT nuevo emite `tenant_id`; lector legado acotado; cabecera discordante rechazada | Unitarias de claims; prueba integrada de sesión A con tenant B y `X-Tenant-ID`. |
| S2-05 | App HTTP testeable, CI PostgreSQL 16/Redis 7 y fixtures ficticios A/B | CI integrada pendiente de ejecución y revisión de resultado. |
| S2-06 | Inventario manual de usos directos del pool | `SPRINT_02_AUDITORIA_TENANT.md`; guard automatizado aplazado. |

**Verificaciones locales:** `backend/npm run lint`, `backend/npm test` (10/10), `database/npm test` (33/33), `frontend/npm run lint` (0 errores, 66 advertencias previas), `frontend/npm run build`, `packages/contracts/npm run lint`, `check:inventory` y `check:generated`. La suite integrada requiere PostgreSQL 16 y Redis 7 y se ejecuta en GitHub Actions.

**Pendiente para cerrar S2:** CI verde en la rama/PR, revisión de los consumidores de los DTO y la transición, y aceptación formal de ADR-002/005 por los responsables exigidos en el índice ADR. No se solicitaron revisiones ni se atribuyen firmas. Hasta entonces S2-03/04 no se fusionan a `dev` ni se despliegan.

**Riesgos transferidos:** SMTP y migración *contract* de identidad (S3); aislamiento completo de WebSocket, colas, archivos y exportaciones (S7); advertencias de rutas ambiguas y DTO de operaciones aún genéricas antes de que otros squads dependan de ellas.
