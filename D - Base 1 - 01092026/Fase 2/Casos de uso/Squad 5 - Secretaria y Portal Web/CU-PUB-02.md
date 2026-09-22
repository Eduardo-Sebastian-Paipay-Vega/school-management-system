# CU-PUB-02: Publicación y Consulta del Calendario Cívico y Escolar Interactivo

**Requisito Trazable:** [RF-70](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-70.md)  
**Módulo:** Módulo 13: Plataforma de Difusión Digital y Portal Institucional  
**Squad Asignado:** Squad 5: Secretaría Digital, Criptografía Documental y Portal Web  
**Responsable Técnico:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
**Rama de Trabajo:** `feature/squad-5/secretary-portal`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta  

---

## 1. Resumen y Alcance

Permite calendarizar y consultar en un calendario interactivo las efemérides patrias, fechas cívicas de Ayacucho, aniversarios escolares, feriados y semanas de exámenes bimestrales.

---

## 2. Actores Involucrados

* **Actor Primario:** Coordinador de Actividades (Gestor) - Toda la Comunidad (Consulta)
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* Año escolar activo.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Visualización clara de eventos por mes con código de colores según tipo de actividad.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Calendario escolar público y sincronizable con Google Calendar.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El coordinador accede a 'Calendario Escolar > Gestionar Eventos'.
2. Crea un evento indicando fecha, hora, lugar, descripción y categoría (Cívico, Exámenes, Suspensión de Clases, Celebración).
3. Guarda el evento.
4. Cualquier estudiante, docente o padre de familia puede ver el calendario en el portal público o en su panel privado.
5. Opción para hacer clic en 'Sincronizar con mi Calendario personal' (formato .ics).

---

## 6. Flujos Alternativos y Excepciones

* **2a. Suspensión imprevista de labores: Permite marcar un día lectivo como suspendido por emergencia emitiendo alerta general.**

---

## 7. Reglas de Negocio Asociadas

* **RN-PUB-02: Las efemérides patrias y fechas cívicas regionales deben respetar el calendario cívico escolar de la DREA.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Calendario mensual y semanal estilo Google Calendar con eventos destacados en chips de colores y modal de detalle.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-70](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-70.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/esquema_datos.sql)
