# BORRADOR — Acta de cambio de arquitectura tecnológica (D-01)

> **ESTADO: BORRADOR SIN APROBAR.** Este documento no tiene validez institucional hasta que lo firmen las personas indicadas en la §7. Ninguna firma, fecha de aprobación ni conformidad que figure aquí ha sido otorgada. Los campos `[ ]` están pendientes.

**Proyecto:** Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH), Servicio Social Universitario IS-480 (2026-II)
**Repositorio:** `https://github.com/Eduardo-Sebastian-Paipay-Vega/school-management-system`
**Redactado:** 17/10/2026 · **Referencia técnica:** `docs/F0_*.md`
**Solicitante:** líder de proyecto (Eduardo Sebastian Paipay Vega)

---

## 1. Objeto

Autorizar el cambio de la tecnología objetivo del cliente, de Flutter/Dart a TypeScript (React/Next.js para la web; React Native/Expo como fase futura), manteniendo:
- los **71 requisitos funcionales** y los **20 no funcionales**;
- el *scope freeze* de `limites_y_alcance_proyecto.md`, salvo en lo estrictamente tecnológico;
- la operación de Flutter hasta demostrar equivalencia.

## 2. Situación actual verificada

| Hecho | Evidencia |
|---|---|
| El backend existente ya es Node.js + TypeScript | `backend/package.json`, `backend/squad_3_calificaciones/package.json` |
| La lógica de dominio más completa y probada está en TypeScript (M8: 218 líneas y 16 pruebas) | `backend/squad_3_calificaciones/src/domain.ts`, `test/` |
| La misma regla de calificación existe duplicada en Dart y TypeScript, con diferencias de escala por defecto | `lib/.../gradebook.dart:25` frente a la escala del proveedor en M8 |
| Squad 1 en Flutter ejecuta JWT, hash y cifrado en el cliente, documentado como demo | `jwt_codec.dart:6-11`, `password_hasher.dart:5-14`, `data_protection_service.dart:19` |
| Squads 2, 4 y 5 en Flutter son prototipos visuales sin lógica de servidor | `F0_MATRIZ_PARIDAD_FLUTTER_REACT.md` |
| Existe un portal Next.js/React sin rastrear y con procedencia pendiente | `las-condes-replica/` (D-08) |

## 3. Justificación de TypeScript

1. **Un lenguaje en servidor, web y móvil.** Contratos, validaciones y tipos compartidos (`packages/contracts`, `packages/domain`) eliminan la deriva Dart↔TypeScript ya observada.
2. **Reutilización de lo más maduro.** El dominio y las pruebas de M8 se conservan sin reescritura. El cliente web consume la misma API que hoy usa Flutter.
3. **Seguridad por diseño.** La migración obliga a mover autenticación, hash y cifrado al servidor (hoy simulados en el cliente) y a separar los tokens por servicio.
4. **Ecosistema web.** El SEO del portal público (RF-71), la verificación pública de documentos (RF-60) y las páginas accesibles se benefician del DOM y de Next.js.
5. **Capacidad del equipo y mantenibilidad** posteriores al SSU: el conocimiento JS/TS es más transferible para el mantenimiento institucional. *(Afirmación a validar por los responsables; no se aportan datos.)*

**Costes reconocidos:**
- se reescriben las interfaces de los Squads 1 y 3;
- el rendimiento de la planilla RF-38 debe demostrarse en DOM (benchmark obligatorio);
- habrá un periodo de doble mantenimiento;
- el equipo debe aprender el stack nuevo durante el ciclo académico.

## 4. Lo que **no** cambia

- Los RF-01 a RF-71 y los RNF vigentes: **ningún requisito se agrega ni se elimina** con esta acta.
- El *scope freeze*, los módulos prohibidos, la población de usuarios del piloto (sin apoderados) y el piloto en un solo plantel.
- PostgreSQL 16 y Redis 7, el multi-tenant por `tenant_id`, la auditoría inmutable y la Ley 29733.
- La política de ramas `main`/`dev`/temporales.
- **Flutter sigue siendo la implementación operativa** de cada módulo hasta su acta de equivalencia. Mientras tanto solo recibe mantenimiento correctivo (D-20).

## 5. Lo que cambia (sujeto a aprobación)

| Ámbito | Antes | Después |
|---|---|---|
| Cliente web administrativo | Flutter Web/PWA | Next.js + React + TypeScript, incorporado módulo a módulo |
| Kiosco offline (RF-25) | Flutter + Hive/IndexedDB | Web (PWA) TypeScript + IndexedDB, con sincronización idempotente |
| Portal público (RF-71) | Flutter Web | Next.js (**sujeto a D-08**) |
| Móvil (RF-27 "toma rápida en app") | Fuera de alcance como app nativa | **Fase futura** React Native + Expo, **no autorizada por esta acta**. Requiere un acta propia tras el piloto, con política de datos (D-15) |
| DoD | `flutter analyze` 0/0 + `flutter test` | Ver §6 |

## 6. Documentos que requieren actualización

| Documento | Sección o línea | Cambio propuesto |
|---|---|---|
| `D - Base 1 - 01092026/Fase 2/limites_y_alcance_proyecto.md` | `:59` Plataformas | "Plataforma web responsive (Flutter Web durante la transición; Next.js/React como objetivo)". Se mantiene la prohibición de publicar apps en tiendas durante el piloto |
| ídem | `:39` diagrama out-of-scope | Añadir: "App móvil React Native/Expo: fase posterior al piloto, sujeta a acta propia" |
| ídem | `:83` Kiosco | "buffer local en IndexedDB (navegador)"; retirar Hive como objetivo |
| ídem | `:121-129` DoD | Ver la DoD de transición abajo |
| `D - Base 1 - 01092026/Fase 2/stack_tecnologico_proyecto.md` | `:18-32` diagrama, `:42-47` tabla, `§3` (`:59-79`), `:170` contenedor frontend, `:186-187` calidad, `:195-199` tabla por squad | Reemplazar Flutter como capa objetivo; conservar una sección "Implementación de transición Flutter"; añadir Next.js, Vitest, Playwright y npm workspaces |
| `AGENTS.md` | §0 paso 4; §3 "Directivas de Código en Flutter"; §5 PrimeNG | Paso 4 → código en `apps/*` y `packages/*` además de `lib/` durante la transición; §3 → reglas TS (estricto, sin secretos en el cliente, contratos primero) y reglas Flutter solo correctivas; §5 → según D-09 (PrimeReact u otra) |
| `README.md` | Stack y quickstart | Añadir el stack objetivo y el estado de transición |
| `.agents/rules/orden_lectura_obligatorio.md`, `.agents/skills/guia-lectura-proyecto/SKILL.md` | Paso de código | Incluir `docs/F0_*` y las rutas TS |
| `.agents/skills/primeng/SKILL.md` | Integra | Revisar tras D-09 |
| SDD por squad (`Arquitectura/Squad X/`) | Secciones de presentación | Actualizar al migrar cada módulo, no en bloque |

**DoD de transición propuesta:**
1. Mientras exista código Flutter: `flutter analyze` (0 errores, 0 warnings) y `flutter test` en verde.
2. Para el código TS: `tsc --noEmit` estricto, lint sin errores, Vitest en verde, Playwright E2E del módulo en verde.
3. M8: `npm run check` y `npm test` en verde, sin modificar sus pruebas para hacerlas pasar.
4. El kiosco registra sin conexión y sincroniza sin duplicados (sin cambios respecto de la DoD actual).
5. Un módulo Flutter solo se retira con su acta de equivalencia (`F0_MATRIZ_PARIDAD_FLUTTER_REACT.md`, plantilla final).

## 7. Responsables de aprobación

| Rol | Persona | Alcance de su aprobación | Firma | Fecha |
|---|---|---|---|---|
| Líder de proyecto (solicitante) | Eduardo Sebastian Paipay Vega | Técnica y de coordinación | [ ] | [ ] |
| Sub líder / Squad 3 | Steve Smith Ovalle Luyo | Impacto en M8 y la planilla | [ ] | [ ] |
| Squad 1 | Brandon Fernando Montero Gutiérrez | Identidad, seguridad y auditoría | [ ] | [ ] |
| Squad 4 | Grissel Arascely Rodríguez Quispe | Analítica y proyecciones | [ ] | [ ] |
| Squad 5 | Cesar Antonio Leon Reyna | Portal, reportes y D-08 | [ ] | [ ] |
| Docente asesor/supervisor del SSU IS-480 | **[nombre por completar]** | Autorización académica del cambio de alcance tecnológico | [ ] | [ ] |
| Dirección de los Planteles de Aplicación (o su delegado) | **[nombre por completar]** | Conformidad institucional como usuario del sistema; requisito para D-15 | [ ] | [ ] |

**Condición de validez:** firmas del líder de proyecto y del docente asesor del SSU como mínimo, más conformidad de los líderes de squad. La conformidad de la Dirección es necesaria para cualquier decisión sobre datos de estudiantes (D-15) y para una futura app móvil.

## 8. Efectos

- **Al aprobarse:** se habilita F1-B y la actualización documental de la §6, mediante un PR documental a `dev`.
- **Si se rechaza:** se mantiene Flutter como objetivo. F1-A sigue siendo válida (es neutral respecto del stack) y el plan F0 se reorienta a "Flutter cliente + TS backend".
- **Reversibilidad:** antes de F7 (retirada de Flutter), esta decisión puede revertirse sin pérdida de funcionalidad.

---

## Anexo A — Decisiones vinculadas que permanecen abiertas

- **D-04:** autoridad del esquema; K1 precisada en `F0_CIERRE_OBSERVACIONES.md` §C2.
- **D-08:** portal; requiere verificar propiedad, procedencia de las imágenes y autorización. **No se mueve ni se borra.**
- **D-15:** política de datos offline (Dirección y responsable de datos).
- **D-16:** escala CNEB oficial (coordinación académica).

## Anexo B — Registro de aprobación de decisiones técnicas

Estas decisiones son **técnicas** y pueden aprobarse por el líder de proyecto con los líderes afectados, con independencia del acta institucional. Las marcadas "requiere D-01" solo se ejecutan si se aprueba la §1.

| ID | Decisión propuesta | Alcance / archivos | Requiere D-01 | Riesgo | Reversión | Aprobador | Estado |
|---|---|---|---|---|---|---|---|
| **D-03** | Protección Git y secretos: `.gitignore` raíz; `.env.example` sin valores reutilizables; sin `.env` rastreados; los valores demo publicados se declaran comprometidos y no utilizables fuera de desarrollo local; escaneo de secretos | `.gitignore`, `backend/.env.example` (ver F1-A) | No | Bajo | `git revert` | Líder de proyecto | [ ] Pendiente |
| **D-11** | Vitest (paquetes y React, temporizadores falsos) + Playwright (E2E). M8 conserva `node:test` + `tsx`. Se elimina el script `jest` huérfano del backend común | F1-B | Sí | Bajo | Retirar dependencias de desarrollo | Líder + Squad 3 | [ ] Pendiente |
| **D-12** | npm workspaces progresivos: `apps/*`, `packages/*`; `backend/` se integra en F2 tras verificar lockfiles; Flutter permanece en la raíz | F1-B: `package.json` raíz | Sí | Medio (resolución de dependencias) | Eliminar el `package.json` raíz | Líder | [ ] Pendiente |
| **D-13** | GitHub Actions: jobs Flutter, M8, TS y secretos; protección de `dev` y `main` con CI requerido | F1-B: `.github/workflows/*.yml`; ajustes del repositorio | Parcial (el job Flutter no requiere D-01) | Bajo | Desactivar el workflow | Dueño del repositorio | [ ] Pendiente |
| **D-18** | Contrato canónico: sobre M8 `{success, data | error{code,message}, timestamp}`; catálogo de errores sembrado con los códigos M8; `statusCode` de S1 opcional o retirado; OpenAPI 3.1 como fuente | F1-B: `packages/contracts/` | Sí | Medio (S1 aún no implementado: bajo impacto real) | Versión de contrato | Squad 1 + Squad 3 | [ ] Pendiente |
| **D-20** | Flutter solo en mantenimiento correctivo: defectos, seguridad y compatibilidad de contrato. Sin features nuevas | Política; `AGENTS.md` | Sí (pierde sentido si se rechaza D-01) | Bajo | Levantar la política | Líder + squads | [ ] Pendiente |
| D-08 | **Pendiente**: no se propone aprobación | `las-condes-replica/` intacto | — | — | — | Squad 5 + autor | ⛔ En verificación |
