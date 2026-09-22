# CU-AST-03: Gestión y Justificación Formal de Inasistencias y Tardanzas

**Requisito Trazable:** [RF-22](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-22.md)  
**Módulo:** Módulo 5: Asistencia Estudiantil, Kiosco Offline-First, Carnés QR y App Móvil  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media  

---

## 1. Resumen y Alcance

Permite registrar una justificación formal ante una inasistencia o tardanza de un estudiante, adjuntando motivo documentado (médico, viaje, fuerza mayor).

---

## 2. Actores Involucrados

* **Actor Primario:** Auxiliar de Educación / Personal de Secretaría / Apoderado
* **Actores Secundarios / Sistemas:** Almacenamiento de Archivos (Evidencias), Base de Datos

---

## 3. Precondiciones

* El estudiante presenta una falta o tardanza registrada en el sistema.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  No se puede justificar sin seleccionar un motivo y dejar constancia de quién autoriza.

* **Garantía de Éxito (Postcondición Exitosa):**  
  El estado de la asistencia cambia a 'Justificada' y no computa negativamente para el índice de ausentismo crítico.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El auxiliar accede a 'Asistencias > Justificaciones'.
2. Busca al estudiante por nombre o DNI.
3. Selecciona la fecha o fechas a justificar.
4. Selecciona el motivo (Salud, Trámite familiar, Duelo, etc.) e ingresa un comentario explicativo.
5. Opcionalmente adjunta constancia médica o carta en PDF/JPG.
6. Presiona 'Aprobar Justificación'.
7. El sistema actualiza el registro de asistencia y deja pista en auditoría.

---

## 6. Flujos Alternativos y Excepciones

* **5a. Archivo adjunto no válido: Alerta indicando formatos soportados (PDF, JPG, PNG menor a 5MB).**

---

## 7. Reglas de Negocio Asociadas

* **RN-AST-04: Toda justificación debe realizarse dentro del plazo máximo de 72 horas hábiles tras ocurrida la inasistencia.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Modal con campos de fecha, selector de motivo, área de carga de comprobante y vista previa del historial reciente del estudiante.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-22](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-22.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
