# CU-NOT-08: Flujo Extraordinario de Solicitud y Aprobación de Rectificación de Notas

**Requisito Trazable:** [RF-43](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-43.md)  
**Módulo:** Módulo 8: Calificaciones en Tiempo Real, Modo Excel, Conclusiones y Motor CNEB  
**Squad Asignado:** Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB  
**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama de Trabajo:** `feature/squad-3/grades-engine`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Baja (Casos excepcionales)  

---

## 1. Resumen y Alcance

Permite tramitar una rectificación excepcional de una nota ya cerrada debido a error material o recalificación justificada, requiriendo solicitud formal del docente y aprobación de la Subdirección.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente Titular (Solicitante) / Subdirector (Aprobador)
* **Actores Secundarios / Sistemas:** Base de Datos, Historial de Auditoría

---

## 3. Precondiciones

* El periodo donde se encuentra la nota está en estado 'Cerrado'.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  No se puede cambiar una nota cerrada sin registrar el motivo, número de documento de sustento y usuario autorizante.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Nota actualizada con trazabilidad completa registrada en el historial histórico de auditoría.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente ingresa a 'Solicitudes de Rectificación > Nueva Solicitud'.
2. Selecciona el estudiante, curso, periodo y la evaluación a rectificar.
3. Ingresa la nota actual, la nota propuesta y redacta el sustento pedagógico.
4. Adjunta el documento o examen físico probatorio.
5. Envía la solicitud.
6. El subdirector recibe la alerta de solicitud de rectificación.
7. Evalúa el sustento y presiona 'Aprobar Rectificación'.
8. El sistema aplica el cambio en la base de datos, recalcula los promedios afectados y deja constancia indeleble en auditoría.

---

## 6. Flujos Alternativos y Excepciones

* **7a. Subdirector rechaza la solicitud: El sistema notifica al docente con el motivo del rechazo y mantiene la nota original intacta.**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-11: Cada rectificación genera un registro inmutable con usuario, fecha, nota anterior, nota nueva y documento de sustento.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Bandeja de solicitudes de rectificación con estados (Pendiente, Aprobada, Rechazada) y visor de evidencias adjuntas.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-43](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-43.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql)
