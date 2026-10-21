# CU-DSH-09: Agenda de Citas entre Apoderados y Tutores o Docentes

**Requisito Trazable:** [RF-89](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-89.md)  
**Módulo:** Módulo 10: Dashboards, Ficha 360° y Métricas SSU  
**Squad Asignado:** Squad 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°  
**Responsable Técnico:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
**Rama de Trabajo:** `feature/squad-4/analytics-dashboards`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media  

---

## 1. Resumen y Alcance

Organiza las entrevistas entre padres y tutores sin llamadas ni cuadernos de control.

---

## 2. Actores Involucrados

* **Actor Primario:** Apoderado
* **Actores Secundarios / Sistemas:** Tutor o Docente, Centro de Notificaciones (RF-76)

---

## 3. Precondiciones

* Apoderado con vínculo vigente (RF-75).
* Tutor o docente con horarios de atención publicados.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Una franja nunca queda reservada por dos apoderados.

* **Garantía de Éxito (Postcondición Exitosa):**  
  La cita queda agendada para ambos y, al cerrarse, con sus acuerdos registrados.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El apoderado abre 'Citas' y elige al tutor o docente.
2. El sistema muestra las franjas disponibles.
3. El apoderado elige una franja, indica el motivo y confirma.
4. El sistema notifica al docente y envía recordatorios.
5. Tras la entrevista, el docente registra los acuerdos.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Convocatoria del tutor: el tutor propone una franja y el apoderado la acepta o propone otra.**
* **4a. Cancelación con menos de 2 horas de anticipación: se registra como cancelación tardía.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ANA-15: Una franja admite una sola cita.**
* **RN-ANA-16: Los acuerdos de la cita solo son visibles para el apoderado, el tutor, el docente y Coordinación.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Calendario de franjas en verde (libre) y gris (ocupada), y formulario de acuerdos al cerrar la cita.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-89](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-89.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/esquema_datos.sql)
