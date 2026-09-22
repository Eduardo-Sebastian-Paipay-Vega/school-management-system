# CU-PRA-01: Registro Diario de Jornada y Permanencia de Practicantes EPIS-UNSCH

**Requisito Trazable:** [RF-28](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-28.md)  
**Módulo:** Módulo 6: Asistencia y Cómputo de Horas de Practicantes  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Diaria (Entrada y Salida de turno)  

---

## 1. Resumen y Alcance

Permite al practicante registrar su hora de ingreso y salida en el plantel, verificando que se encuentre físicamente en las instalaciones mediante la IP de la red local o geolocalización referencial.

---

## 2. Actores Involucrados

* **Actor Primario:** Practicante Preprofesional (Estudiante EPIS-UNSCH)
* **Actores Secundarios / Sistemas:** Servicio de Geolocalización / Red del Colegio, Base de Datos

---

## 3. Precondiciones

* El practicante se encuentra asignado a un proyecto o labor en el plantel.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  No se permite marcar salida sin haber registrado entrada en la misma jornada.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Marcación de jornada registrada con cálculo automático de horas cronológicas transcurridas.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El practicante se conecta a la red institucional o activa su ubicación dentro del perímetro del colegio.
2. Accede al portal institucional y presiona 'Marcar Entrada'.
3. El sistema verifica que se encuentre dentro del rango autorizado (IP o geocerca).
4. Registra la hora de inicio de jornada.
5. Al finalizar sus actividades, ingresa un breve resumen de tareas realizadas y presiona 'Marcar Salida'.
6. El sistema calcula las horas efectivas y actualiza su acumulado de prácticas.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Intento de marcación fuera del plantel: El sistema emite advertencia 'Marcación fuera del perímetro del colegio. Se requiere validación de su tutor'.**

---

## 7. Reglas de Negocio Asociadas

* **RN-PRA-01: El tiempo máximo por sesión diaria computable no puede exceder las 6 horas cronológicas.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Botón circular grande de marcación con cronómetro en vivo de tiempo transcurrido y campo de texto para bitácora de actividades.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-28](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-28.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
