---
name: actualizar-contexto
description: Revisa cambios recientes del repositorio y determina si requieren actualizar la arquitectura, trazabilidad RF, estado de módulos o convenciones del Sistema de Gestión Escolar. Úsala al cerrar trabajo que cambió módulos, endpoints, esquemas, integraciones o decisiones técnicas.
---

# Actualizar contexto del proyecto

Mantén la documentación canónica alineada con el estado comprobable del código. No registres cada cambio de implementación ni conviertas una hipótesis en hecho.

## 1. Reunir evidencia

- Lee `git status --short`, `git diff HEAD` y `git log --oneline -15`.
- Si el usuario define un rango, usa ese rango; no asumas que los cambios de la rama completa son de la sesión actual.
- Para cambios funcionales, relaciona el módulo con `docs/requirements/matriz-rf-arquitectura.md` y los RF/CU correspondientes. Para arquitectura, revisa `docs/architecture/` y los ADR aplicables.
- Inspecciona los archivos de código afectados antes de describir comportamiento.

## 2. Decidir si actualizar

Es relevante un cambio verificado en módulos/rutas, contratos de API, tablas o migraciones, integraciones, decisiones de arquitectura, ubicación de código, seguridad o convenciones transversales. Cambios internos sin efecto documentable, ajustes visuales menores y renombres locales normalmente no requieren actualizar contexto.

## 3. Elegir el documento canónico

- Mapa o decisión de arquitectura: `docs/architecture/` y, si aplica, el ADR fuente.
- Trazabilidad funcional: `docs/requirements/matriz-rf-arquitectura.md` y documentación de RF/CU.
- Estado de sprints y evidencia del Core: `docs/core/`.
- Despliegue y operación: `docs/deployment/`.
- No crear una segunda fuente de verdad si ya existe un documento propietario del tema. Si la documentación contradice un ADR, el ADR manda y se debe señalar la corrección necesaria.

## 4. Proponer y editar

Si el usuario pidió una auditoría o propuesta, entrega los documentos/secciones sugeridos sin editar. Si pidió actualizar la documentación, edita solo lo necesario, conserva contenido vigente y enlaza afirmaciones a evidencia. No crees commits ni hagas push como parte de esta skill.

## 5. Reportar

Indica qué cambió, qué documento se actualizó y qué no se pudo verificar. Si no hay cambios documentables, dilo brevemente y no edites.
