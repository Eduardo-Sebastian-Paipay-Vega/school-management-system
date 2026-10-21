# CU-NOT-14: Control de Plazos de Registro de Notas y Alertas Escalonadas a Docentes

**Requisito Trazable:** [RF-81](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-81.md)  
**Módulo:** Módulo 8: Calificaciones en Tiempo Real y Modo Excel  
**Squad Asignado:** Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB  
**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama de Trabajo:** `feature/squad-3/grades-engine`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Diaria (Proceso programado)  

---

## 1. Resumen y Alcance

Evita que las notas lleguen tarde: el sistema recuerda, avisa y, si hace falta, emite un llamado de atención formal.

---

## 2. Actores Involucrados

* **Actor Primario:** Sistema (proceso programado)
* **Actores Secundarios / Sistemas:** Docente, Coordinación Académica, Centro de Notificaciones (RF-76)

---

## 3. Precondiciones

* Periodo académico con fechas límite configuradas.
* Docentes con carga lectiva asignada.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Un docente que ya completó el registro nunca recibe avisos de incumplimiento.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Cada docente con registro pendiente recibe la alerta que corresponde a su nivel de retraso.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. Coordinación configura las fechas límite del periodo y los umbrales.
2. El proceso diario calcula el avance de cada docente.
3. El sistema envía recordatorios, avisos o llamados de atención según corresponda.
4. El docente abre la alerta y va directo a la planilla pendiente.
5. Al completar el registro, la alerta se cierra.

---

## 6. Flujos Alternativos y Excepciones

* **3a. El docente tiene una justificación aprobada (licencia, RF-33): el sistema suspende las alertas durante ese periodo.**
* **5a. Coordinación amplía el plazo: los avisos se recalculan con la nueva fecha.**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-20: El llamado de atención solo se emite tras el aviso de incumplimiento y superado el umbral.**
* **RN-NOT-21: Todo llamado de atención queda en el historial del docente y en la bitácora; no se elimina.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Configuración de plazos en Coordinación y, para el docente, un banner en su tablero con los cursos pendientes y la cuenta regresiva.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-81](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-81.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql)
