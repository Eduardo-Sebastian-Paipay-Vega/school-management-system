# 01 — Mapa modular

Deriva de los 13 módulos funcionales (M1–M13) de `requisitos_funcionales.md`, del reparto por squad de `AGENTS.md` §1 y de los módulos de backend de `arquitectura_sistema.md` §4. No se inventan módulos: donde ninguna fuente fija un destino, se marca **pendiente de clasificación**.

## 1. Inventario

| ID | Módulo | Squad | Módulo backend (destino) | Frontend | RF | Dependencias permitidas | Estado de definición |
|---|---|---|---|---|---|---|---|
| M1 | Acceso y seguridad | S1 | `auth` | `squads/squad_1_core`, `modules/intranet` | 01–04 | Ninguna (es la base) | Contrato OpenAPI + código; aceptación integrada pendiente |
| M2 | Usuarios, apoderados y avisos | S1 | `administration` (usuarios, `guardians`, `notifications`) | `squads/squad_1_core` | 05–09, 72, 73, 75, 76 | M1, M12 | Contrato + código; texto de consentimiento pendiente |
| M3 | Configuración escolar | S1 | `administration` (`school`) | `squads/squad_1_core` | 10–14 | M1, M12 | Contrato + código; rangos CNEB bloqueados (D-16) |
| M12 | Auditoría y protección de datos | S1 | `administration` (`audit`) | `squads/squad_1_core` | 65–68 | M1 | Contrato + código; integración RF-66 con S2/S3 pendiente |
| M4 | Gestión académica (padrón, matrícula, carga) | S2 | `academics` | `squads/squad_2_asistencia` | 15–19, 78 | M1, M2, M3, M12 | Solo tablas; sin contrato ni código |
| M5 | Asistencia estudiantil y kiosco | S2 | `attendance` | `squads/squad_2_asistencia` | 20–27, 77 | M1, M3, M4, M12, avisos de M2 | Solo tablas; kiosco offline bloqueado (D-15) |
| M6 | Practicantes EPIS-UNSCH | S2 | `staff_tracking` | `squads/squad_2_asistencia` | 28–31, 74 | M1, M2, M3 | Solo tablas |
| M7 | Docentes contratados | S2 | `staff_tracking` | `squads/squad_2_asistencia` | 32–35 | M1, M3, M4 | Sin tabla identificada; pendiente de modelo |
| M8 | Calificaciones | S3 | Servicio M8 (`backend/squad_3_calificaciones/`); a futuro `grades` (ADR-001) | `squads/squad_3_calificaciones` | 36–46, 79–82 | M1 (vía gateway), M3 (escala), M4 (nómina), M12 | RF-36–46 implementados en M8; RF-79–82 sin diseño |
| M9 | Mapas de calor | S4 | `analytics` | `squads/squad_4_analitica` | 47–51 | Lectura de M4, M5, M8 | Solo una vista materializada (`vm_rendimiento_seccion`) |
| M10 | Monitoreo, dashboards y citas | S4 | `analytics`; `ssu_impact` (RF-57); citas: **pendiente de clasificación** | `squads/squad_4_analitica` | 52–58, 83, 89 | Lectura de M4–M8; M2 (avisos) | Solo tablas |
| M11 | Reportes oficiales y secretaría | S5 | `document_crypto` (59, 60, 62, 64); mesa de partes, certificados y SIAGIE: **pendiente de clasificación** | `squads/squad_5_secretaria` | 59–64, 86–88 | M3 (membrete), M4, M8, M9/M10 (mérito) | Solo tablas; librería PDF pendiente (D-17) |
| M13 | Difusión digital y portal | S5 | `portal` | `modules/landing`, `app/(landing)` | 69–71, 84, 85 | M1 (publicación), M3 (calendario) | Portal estático en Next; sin API |

Las rutas de frontend son relativas a `frontend/modules/`. Total: 89 RF, todos con destino; detalle por RF en [matriz-rf-arquitectura.md](../requirements/matriz-rf-arquitectura.md).

## 2. Límites

### Pertenece al módulo
Rutas HTTP, casos de uso, consultas y tablas propias, vistas de su squad. Cada squad escribe las migraciones de sus tablas (ADR-004 regla 7).

### Infraestructura transversal (una sola ubicación)

| Responsabilidad | Ubicación canónica | Propietario |
|---|---|---|
| Conexión, transacción y contexto de tenant | `backend/src/config/database.ts` (`withTenant`) | S1 |
| Autenticación y permisos | `backend/src/middlewares/auth.middleware.ts`, `rbac.middleware.ts` | S1 |
| Errores HTTP y 404 | `backend/src/core/http/errors.ts` | S1 |
| Auditoría | `fn_registrar_auditoria()` + `backend/src/services/audit.service.ts` | S1 |
| Avisos (bandeja, correo, tiempo real) | `backend/src/services/notifications.service.ts`, `realtime.service.ts` | S1 |
| Sesión web y cliente HTTP | `frontend/modules/squads/squad_1_core/SessionProvider.tsx` (`useCoreSession().request`) y `frontend/modules/shared/api/` | S1 |
| Tema y proveedores UI | `frontend/modules/shared/prime/`, `tailwind.config.ts`, `globals.css` | Líder |
| Contrato API | `packages/contracts/openapi/` (`components/` de S1, `paths/` de cada squad) | S1 + cada squad |
| Migraciones | `database/migrations/` | Cada squad, S1 aprueba el núcleo |

### Privado de cada módulo
Repositorios SQL y reglas de cálculo. Ningún módulo lee tablas de otro: consume los servicios internos del kernel (ADR-001 §1) — `AccessControlService`, `EnrollmentQueryService`, `GradingScaleService`, `AuditService`. Hoy solo existe `AuditService`; los demás se crean con su primer consumidor real.

## 3. Solapamientos detectados

| ID | Solapamiento | Propuesta | Decide |
|---|---|---|---|
| S-01 | RF-06 (importar usuarios, S1) vs RF-78 (importar estudiantes y matrícula, S2) | Ya resuelto en `PLAN.md`: S1 crea `personas`/cuentas, S2 crea `matriculas` | — |
| S-02 | RF-12 (S1 define secciones) vs migración `s2_nucleo_estructura_academica` | S1 escribe `grados_secciones` por `/school/years/:id/sections`; S2 solo lee y matricula | S1 + S2 |
| S-03 | RF-27 (gateway WebSocket, S2) vs canal `/api/v1/notifications/ws` (S1) y `/api/v1/grades/live` (M8) | Un único servidor WebSocket en el backend común; cada módulo publica eventos por canal | S1 + S2 + S3 |
| S-04 | RF-66 (auditoría de cambios de notas, S1) vs `squad3.grade_audit_history` (M8) | M8 conserva su historial inmutable y además notifica a `fn_registrar_auditoria()` | S1 + S3 |
| S-05 | RF-61 (cuadro de mérito, S5) vs `AGENTS.md`: S5 "consume cuadros de mérito (S4)" | Cálculo en `analytics` (S4), emisión del documento en `document_crypto` (S5) | S4 + S5 |
| S-06 | RF-24 (alertas de ausentismo, S2) vs RF-55 (alertas de deserción, S4) | Cada uno calcula su regla; ambos entregan por el servicio de avisos de M2 | S2 + S4 |
| S-07 | RF-70 (calendario cívico, S5) vs RF-10 (calendario escolar, S1) | El calendario escolar es de S1; S5 publica una vista pública de él | S1 + S5 |

## 4. Cómo se agrega un módulo

1. Confirmar que sus RF existen y están asignados a un squad (no se crean módulos sin RF).
2. Registrar su fila en la tabla §1 y en la matriz RF.
3. Proponer su `paths/<modulo>.yaml` en `packages/contracts/openapi/` (ADR-005, API-first).
4. Crear la migración de sus tablas en `database/migrations/` (ADR-004).
5. Backend: crear `backend/src/modules/<modulo>/` según [04-backend.md](04-backend.md) y montarlo en `server.ts`.
6. Frontend: código en `frontend/modules/squads/squad_X_*/` y página delgada en `frontend/app/(intranet)/intranet/<ruta>/page.tsx` según [03-frontend.md](03-frontend.md).
