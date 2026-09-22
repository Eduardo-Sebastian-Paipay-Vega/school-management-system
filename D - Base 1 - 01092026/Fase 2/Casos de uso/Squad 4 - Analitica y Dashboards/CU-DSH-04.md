# CU-DSH-04: Generación Automatizada de Alertas de Deserción y Repitencia Escolar

**Requisito Trazable:** [RF-55](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-55.md)  
**Módulo:** Módulo 10: Dashboards, Ficha 360° del Alumno y Métricas SSU IS-480  
**Squad Asignado:** Squad 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°  
**Responsable Técnico:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
**Rama de Trabajo:** `feature/squad-4/analytics-dashboards`  
**Nivel del Caso de Uso:** Subfunción del Sistema  
**Frecuencia de Uso:** Semanal / Al cierre de evaluaciones  

---

## 1. Resumen y Alcance

Evalúa continuamente el cruce de asistencia y calificaciones para clasificar a los estudiantes en niveles de riesgo de deserción o repitencia (Bajo, Medio, Alto, Crítico) y disparar protocolos de intervención oportuna.

---

## 2. Actores Involucrados

* **Actor Primario:** Sistema (Motor Predictivo) / Notificación a Tutoría y Dirección
* **Actores Secundarios / Sistemas:** Base de Datos, Servicio de Correo / Notificaciones

---

## 3. Precondiciones

* Registros de asistencia y notas de periodo procesados.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Detección temprana antes de que el estudiante alcance situación de inhabilitación irreversible.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Alerta generada y asignación de caso de seguimiento al departamento de Psicología o Tutoría.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El motor analítico evalúa a todos los estudiantes cruzando: % de asistencia < 80% y 2 o más áreas con nota C.
2. Calcula el puntaje de vulnerabilidad escolar (0 a 100).
3. Si supera el umbral crítico (> 70 puntos), genera un ticket de alerta preventiva.
4. Notifica al Tutor de aula y al Coordinador de TOE (Tutoría y Orientación Educativa).
5. Incorpora al estudiante en la lista de seguimiento prioritario del dashboard institucional.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Estudiante con justificación médica integral: El tutor puede modular la severidad de la alerta registrando el informe médico.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ANA-09: Toda alerta crítica requiere contacto documentado con el apoderado dentro de las 48 horas de emitida.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Lista priorizada con avatar del alumno, nivel de riesgo en badge de color, causas principales y botón 'Iniciar Ficha de Tutoría'.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-55](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-55.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/esquema_datos.sql)
