# CU-AUD-03: Módulo de Búsqueda y Monitoreo de Bitácoras de Auditoría

**Requisito Trazable:** [RF-67](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-67.md)  
**Módulo:** Módulo 12: Trazabilidad, Auditoría y Protección de Datos (Ley 29733)  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media  

---

## 1. Resumen y Alcance

Permite consultar, filtrar y exportar los registros de auditoría del sistema por rango de fechas, usuario, tipo de acción y módulo afectado.

---

## 2. Actores Involucrados

* **Actor Primario:** Superadmin / Director General
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* El usuario posee credenciales con privilegios de auditoría institucional.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Los registros se presentan en modo de solo lectura sin posibilidad de edición.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Listado cronológico filtrado con posibilidad de descarga en formato CSV firmado.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El administrador accede a 'Seguridad > Auditoría del Sistema'.
2. Aplica filtros: rango de fechas (ej. última semana), usuario específico o tipo de acción ('LOGIN_FAIL', 'GRADE_CHANGE').
3. Presiona 'Buscar'.
4. El sistema consulta la tabla audit_logs de forma indexada y devuelve los registros paginados.
5. El usuario puede hacer clic en cualquier fila para ver el payload JSON completo del evento.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Exportación masiva: El sistema genera un archivo CSV o JSON inmutable para inspección forense.**

---

## 7. Reglas de Negocio Asociadas

* **RN-AUD-03: La retención mínima de los logs de auditoría es de 5 años conforme a normativa técnica.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Buscador avanzado con selectores de evento, tabla con resaltado de severidad (Info = Azul, Warning = Amarillo, Critical = Rojo) y panel lateral con detalle JSON.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-67](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-67.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
