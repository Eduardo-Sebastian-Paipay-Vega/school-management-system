---
name: project-reverse-architect
description: Audita repositorios full-stack (backend y frontend) para descubrir funcionalidades existentes o en desarrollo, extraer y redactar todos los Requerimientos Funcionales (RF) y Casos de Uso (CU), organizarlos por módulos y submódulos, y generar documentación arquitectónica en archivos .md (corazón del proyecto, catálogo completo de RF/CU, limitaciones y deuda técnica). Úsalo siempre que el usuario pida mapear un proyecto desde el código, levantar requerimientos inversos o documentar la arquitectura funcional.
---

# Project Reverse Architect

Ejecuta este flujo secuencial de 4 fases cada vez que se solicite analizar un proyecto y generar su documentación funcional. Mantén un enfoque de **auditoría de solo lectura** sobre el código fuente antes de escribir cualquier archivo `.md`.

## Fase 1: Descubrimiento y Auditoría Full-Stack (Backend + Frontend)
Inspecciona el código fuente del proyecto para identificar tanto las funcionalidades cerradas como los indicios de funcionalidades incompletas o en progreso:

1. **Rastreo en Backend:**
   - Revisa modelos de datos / esquemas ORM (`models.py`, `schema.prisma`, migraciones) para identificar las entidades centrales del negocio.
   - Inspecciona rutas, controladores, vistas y serializadores (`urls.py`, `views.py`, `routes/`, `controllers/`) para listar todos los endpoints expuestos.
   - Busca tareas asíncronas, webhooks, integraciones externas y servicios (`services/`, `tasks.py`).
   - **Detección de indicios:** Busca endpoints sin conectar, modelos sin vistas asociadas, comentarios `TODO` / `FIXME`, validaciones comentadas o campos preparados para futuras fases.
2. **Rastreo en Frontend:**
   - Revisa el árbol de rutas / navegación (`app.routes.ts`, `pages/`, `app/`) para mapear pantallas, guardias de permisos y roles.
   - Inspecciona componentes, modales, formularios y servicios HTTP (`services/`, `api/`) para verificar qué endpoints del backend se consumen realmente.
   - **Detección de indicios:** Identifica botones deshabilitados, pestañas ocultas, rutas sin componente final, servicios mockeados o interfaces sin conexión al backend.

## Fase 2: Clasificación y Jerarquización (Módulos → Submódulos → RF / CU)
Ordena toda la información recolectada en una estructura jerárquica limpia:

1. Agrupa las funcionalidades por **Módulos** de negocio (ej. `M01 - Autenticación y Roles`, `M02 - Cotizaciones`, etc.).
2. Subdivide cada módulo en **Submódulos** operativos.
3. Redacta para cada submódulo:
   - **Requerimientos Funcionales (`RF-XXX`):** Qué debe hacer el sistema, reglas de negocio detectadas y estado real (`[Implementado]`, `[Parcial / Indicio en código]`, `[Solo Backend]`, `[Solo Frontend]`).
   - **Casos de Uso (`CU-XXX`):** Actor principal, precondiciones, flujo normal, flujos alternativos/excepciones y postcondición.

## Fase 3: Síntesis del "Corazón del Proyecto" y Limitaciones
Antes de redactar los entregables, consolida la visión estratégica del sistema:
- **Corazón del proyecto (Core Domain):** Identifica el flujo crítico que da valor al negocio (ej. ciclo de vida principal de los datos y qué módulos son indispensables vs. satélites).
- **Limitaciones y brechas:** Documenta funcionalidades a medio construir (indicios detectados en Fase 1), falta de validaciones, dependencias rígidas, ausencia de pruebas o riesgos de escalabilidad/seguridad observados en el código.

## Fase 4: Generación de Documentos `.md`
Crea una carpeta `docs/arquitectura-funcional/` (o la ruta que indique el usuario) y genera los siguientes archivos Markdown estructurados siguiendo las plantillas de `references/templates-md.md`:

1. `00-CORAZON-DEL-PROYECTO.md`: Visión general, propósito del sistema, mapa de módulos, flujo principal de negocio (core) y stack tecnológico detectado.
2. `01-CATALOGO-RF-CU.md`: Listado completo, numerado y ordenado por Módulo y Submódulo de todos los RF y CU, indicando su estado de implementación y trazabilidad (archivos/rutas de backend y frontend donde viven).
3. `02-INDICIOS-Y-FUNCIONALIDADES-OCULTAS.md`: Inventario de funcionalidades detectadas parcialmente en código (endpoints huérfanos, vistas sin conectar, modelos preparados) con recomendaciones para completarlas.
4. `03-LIMITACIONES-Y-DEUDA-TECNICA.md`: Restricciones actuales del sistema, cuellos de botella, brechas entre frontend y backend, y riesgos técnicos.

## Reglas de Ejecución
- **Cero suposiciones sin evidencia:** Todo RF, CU o indicio debe respaldarse con la ruta del archivo, modelo, endpoint o componente donde se encontró.
- **Orden estricto:** Nunca generes los archivos `.md` sin haber completado primero el cruce entre backend y frontend.
- **Consistencia de IDs:** Mantén una nomenclatura uniforme (`M01`, `SM01.1`, `RF-001`, `CU-001`) a lo largo de todos los documentos.
