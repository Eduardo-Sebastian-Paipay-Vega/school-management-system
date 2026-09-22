# CU-REP-05: Reportes Consolidados de Asistencia Multiactor del Plantel

**Requisito Trazable:** [RF-63](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-63.md)  
**Módulo:** Módulo 11: Emisión de Reportes y Verificación Criptográfica QR  
**Squad Asignado:** Squad 5: Secretaría Digital, Criptografía Documental y Portal Web  
**Responsable Técnico:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
**Rama de Trabajo:** `feature/squad-5/secretary-portal`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Mensual  

---

## 1. Resumen y Alcance

Permite emitir reportes consolidados mensuales de asistencia para los distintos estamentos: estudiantes (para libreta y UGEL), docentes contratados (para planillas) y practicantes (para SSU).

---

## 2. Actores Involucrados

* **Actor Primario:** Personal de Secretaría / Dirección / Coordinación
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* Asistencias registradas y cerradas en el mes.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Cálculo preciso de porcentajes de puntualidad, inasistencias justificadas e injustificadas.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Reporte consolidado listo para anexar a los expedientes de gestión del mes.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El usuario accede a 'Reportes de Asistencia > Consolidado Mensual'.
2. Selecciona el estamento (Estudiantes, Docentes o Practicantes) y el mes correspondiente.
3. El sistema totaliza los días hábiles, asistencias, faltas y tardanzas de cada persona.
4. Muestra el resumen estadístico con tasas de puntualidad.
5. Permite descargar el consolidado formal en PDF firmado y en archivo Excel para trámite administrativo.

---

## 6. Flujos Alternativos y Excepciones

* **2a. Filtrado por aula o tutor: Permite emitir el consolidado exclusivo de un aula para la reunión de entrega de libretas.**

---

## 7. Reglas de Negocio Asociadas

* **RN-REP-06: El reporte debe especificar la cantidad exacta de horas pedagógicas o cronológicas dictadas o asistidas.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Panel con pestañas por estamento, tabla con colores de semáforo de asistencia y botón de exportación.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-63](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-63.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/esquema_datos.sql)
