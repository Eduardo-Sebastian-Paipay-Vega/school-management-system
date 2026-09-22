# Reglas Técnicas y Directivas de Diseño de Software (SDD)

### Sistema de Gestión Escolar — Guamán Poma de Ayala (UNSCH)
**Aplicable a:** Todos los Squads, Desarrolladores y Agentes de IA

---

## 1. Reglas Generales de Elaboración de SDDs

1. **Estándar Oficial:** Todo Documento de Diseño de Software (SDD) debe estructurarse conforme al estándar internacional **IEEE 1016-2009 / ISO/IEC/IEEE 42010**.
2. **Ubicación Canónica de los Documentos:**
   * Cada Squad debe almacenar su SDD en su respectiva carpeta de arquitectura:
     `D - Base 1 - 01092026/Fase 2/Arquitectura/Squad X - [Nombre]/sdd_[squad].md`
   * Debe existir enlace directo en el `README.md` de arquitectura del Squad.
3. **Uso Obligatorio de Diagramas Mermaid:**
   * Prohibido describir arquitecturas complejas únicamente en texto plano.
   * Es obligatorio incluir al menos un diagrama de componentes (`flowchart`), un diagrama de entidad-relación (`erDiagram`) y diagramas de secuencia (`sequenceDiagram`) para flujos críticos (ej. login, auto-guardado, offline sync).

---

## 2. Reglas del Modelo de Datos (PostgreSQL)

1. **Aislamiento Multi-Tenant:**
   * Toda tabla transaccional o maestra DEBE incluir la columna `tenant_id VARCHAR(50) NOT NULL` con su correspondiente índice B-tree `idx_[tabla]_tenant`.
2. **Claves Primarias:**
   * Usar UUID v4 (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`) para evitar colisiones en sincronización offline.
3. **Pistas de Auditoría:**
   * Toda tabla debe incluir: `created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL` y `created_by UUID NOT NULL`.
4. **Triggers de Inmutabilidad:**
   * Tablas de auditoría (`audit_logs`) o de historial de notas (`grade_audit_history`) deben contar con triggers que impidan `UPDATE` y `DELETE`.

---

## 3. Reglas de Contratos de API

1. **Estandarización RESTful:**
   * Verbos HTTP correctos: `GET` (lectura), `POST` (creación), `PUT`/`PATCH` (actualización), `DELETE` (desactivación lógica).
2. **Estructura de Respuestas JSON:**
   * Éxito: `{ "success": true, "data": { ... }, "timestamp": "ISO-8601" }`
   * Error: `{ "success": false, "error": { "code": "ERR_CODE", "message": "Detalle para usuario" }, "timestamp": "ISO-8601" }`
3. **Respuestas HTTP Requeridas:**
   * Especificar explícitamente códigos `200/201`, `400` (validación), `401` (JWT no válido), `403` (RBAC denegado), `422` (regla pedagógica) y `500` (error interno).

---

## 4. Reglas de Frontend (Flutter)

1. **Feature-First Estricto:**
   * Ningún archivo de pantalla o modelo de un squad debe ubicarse fuera de `lib/features/squad_[X]_[modulo]/`.
2. **Separación de Responsabilidades:**
   * Las vistas (`presentation/screens`) no deben realizar llamadas HTTP directas ni contener SQL; deben comunicarse a través de controladores y repositorios.
3. **Experiencia de Usuario (UX):**
   * Todo botón de acción debe contemplar estados: inactivo, cargando (spinner), éxito y error.
   * Planillas de notas deben respetar debounce de 400 ms antes de enviar al servidor.

---

## 5. Trazabilidad Obligatoria

Cada elemento de diseño del SDD debe contar con su identificador cruzado:
* Requisito Funcional: `RF-XX`
* Caso de Uso: `CU-XXX-YY`
* Endpoint: `VERBO /ruta`
* Tabla SQL: `nombre_tabla`
* Widget Flutter: `NombreScreen`
