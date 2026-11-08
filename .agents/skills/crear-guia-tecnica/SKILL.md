---
name: crear-guia-tecnica
description: Crea o actualiza documentación operativa y de soporte de un módulo Next.js/Node.js del Sistema de Gestión Escolar. Úsala al pedir una guía técnica, runbook, diagnóstico o instrucciones de mantenimiento; para diseño arquitectónico formal usa sdd-authoring.
---

# Guía técnica operativa

Esta skill cubre guías para operación, soporte y mantenimiento. No sustituye un SDD IEEE 1016, un plan de sprint ni la documentación de arquitectura.

## Reconocer antes de escribir

1. Sigue la secuencia de lectura de `AGENTS.md` y la guía de navegación del repositorio.
2. Busca una guía existente en `docs/` y léela completa antes de actualizarla.
3. Inspecciona la implementación real: frontend en `frontend/app/` y `frontend/modules/`; backend en `backend/src/`; migraciones en `database/migrations/`; configuración y despliegue cuando aplique.
4. Confirma cada flujo, permiso, entrada, estado, endpoint, variable de entorno y comando en el código o documentación canónica. Nunca traslades rutas, comandos o contratos del repositorio de origen.

## Contenido

Adapta la profundidad al módulo. Incluye solo las secciones que correspondan:

- propósito, alcance, roles y prerrequisitos;
- flujo operativo y estados;
- pantallas, formularios, validaciones y mensajes visibles;
- contratos HTTP y componentes/servicios involucrados;
- tablas, migraciones, auditoría y retención;
- configuración, comandos de operación y runbooks;
- síntomas, diagnóstico y recuperación segura;
- limitaciones conocidas y checklist previo a producción.

Usa Mermaid para flujos con actores o decisiones. Usa PowerShell cuando describas comandos del entorno Windows. Enlaza archivos con rutas relativas válidas. No publiques secretos ni valores de `.env`.

## Guardarraíles

- No duplicar `docs/architecture/`, SDDs, planes de sprint o runbooks existentes.
- Si el tema es diseño de software, activar `sdd-authoring`; si es despliegue, consultar `docs/deployment/` y las instrucciones vigentes.
- No inventar comportamiento ni presentar una limitación como una decisión oficial.
- Al actualizar, conserva secciones que sigan correctas. Deja la documentación sin commit salvo pedido expreso.
- Entrega un resumen de las secciones creadas/actualizadas y las verificaciones pendientes.
