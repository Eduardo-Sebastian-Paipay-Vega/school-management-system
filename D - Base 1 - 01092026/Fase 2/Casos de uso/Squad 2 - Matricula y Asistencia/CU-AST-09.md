# CU-AST-09: Aviso Automático de Inasistencias y Tardanzas al Apoderado

**Requisito Trazable:** [RF-77](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-77.md)  
**Módulo:** Módulo 5: Asistencia Estudiantil, Kiosco Offline-First y Carnés QR  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Diaria (Al cierre de cada turno)  

---

## 1. Resumen y Alcance

Informa a los padres, el mismo día, cuando su hijo falta o llega tarde.

---

## 2. Actores Involucrados

* **Actor Primario:** Sistema (proceso programado)
* **Actores Secundarios / Sistemas:** Apoderado, Centro de Notificaciones (RF-76)

---

## 3. Precondiciones

* Estudiante con apoderado vinculado y activo.
* Asistencia del turno registrada (RF-20, RF-21 o RF-27).

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Si la notificación falla, el registro de asistencia no se altera y el envío se reintenta.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Cada apoderado de un estudiante con falta o tardanza recibe un solo aviso por turno.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. Se cumple la hora de corte del turno configurada por Coordinación.
2. El sistema consulta las faltas y tardanzas del turno.
3. Agrupa por apoderado (un apoderado con dos hijos recibe un solo aviso).
4. Envía la notificación con el detalle y el enlace de justificación.
5. Registra el envío para no duplicarlo.

---

## 6. Flujos Alternativos y Excepciones

* **2a. La asistencia del aula aún no se cerró: el sistema espera al cierre o a la segunda hora de corte.**
* **4a. Asistencia corregida a Presente después del aviso: se envía un aviso de rectificación.**

---

## 7. Reglas de Negocio Asociadas

* **RN-AST-12: Solo se notifica tras el cierre de la toma o la hora de corte, nunca durante la toma.**
* **RN-AST-13: Máximo un aviso por estudiante y turno, salvo rectificaciones.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Notificación con ícono de calendario, estado en color (rojo falta, ámbar tardanza) y botón 'Justificar'.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-77](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-77.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
