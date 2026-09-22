# CU-AST-05: Detección y Generación de Alertas por Ausentismo Crónico

**Requisito Trazable:** [RF-24](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-24.md)  
**Módulo:** Módulo 5: Asistencia Estudiantil, Kiosco Offline-First, Carnés QR y App Móvil  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Subfunción del Sistema  
**Frecuencia de Uso:** Diaria (Al finalizar la toma de asistencia)  

---

## 1. Resumen y Alcance

Detecta automáticamente a los estudiantes que superen los umbrales de alerta (3 faltas injustificadas consecutivas o 5 acumuladas) y emite alertas preventivas a tutores y directivos.

---

## 2. Actores Involucrados

* **Actor Primario:** Sistema (Proceso Automático) / Notificación a Directivo y Tutor
* **Actores Secundarios / Sistemas:** Servicio de Notificaciones, Base de Datos

---

## 3. Precondiciones

* Procesamiento de asistencia diaria finalizado.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Garantizar que ningún alumno en riesgo de deserción por ausentismo pase desapercibido.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Alerta generada en el buzón del tutor, directivo y destacada en el dashboard pedagógico.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El servicio cron de asistencia analiza los registros de inasistencias tras la jornada escolar.
2. Identifica alumnos con 3 o más faltas consecutivas sin justificar o porcentaje de asistencia inferior al 85%.
3. Genera una alerta de riesgo con nivel (Moderado, Alto, Crítico).
4. Envía notificación en tiempo real a la bandeja del Tutor y Coordinación.
5. Agrega la insignia de alerta en la lista de asistencia del aula.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Alumno justificado a tiempo: Si la falta se justifica posteriormente, la alerta se archiva automáticamente con estado 'Resuelto'.**

---

## 7. Reglas de Negocio Asociadas

* **RN-AST-06: Más de 30% de inasistencias injustificadas amerita reporte de inhabilitación por norma MINEDU.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Bolsa de alertas en la barra superior con campana roja y panel con lista priorizada de alumnos que requieren contacto urgente.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-24](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-24.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
