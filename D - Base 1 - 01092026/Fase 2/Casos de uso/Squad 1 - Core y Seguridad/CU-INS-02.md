# CU-INS-02: Apertura, Parametrización y Cierre de Periodos Académicos

**Requisito Trazable:** [RF-11](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-11.md)  
**Módulo:** Módulo 3: Configuración Escolar, Periodos y Escalas  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media (4 veces al año en régimen bimestral)  

---

## 1. Resumen y Alcance

Permite aperturar los bimestres lectivos, definir las fechas límite de digitación de notas y ejecutar el cierre formal con bloqueo de edición.

---

## 2. Actores Involucrados

* **Actor Primario:** Director / Subdirector Académico
* **Actores Secundarios / Sistemas:** Base de Datos, Motor de Calificaciones

---

## 3. Precondiciones

* Existe un año lectivo activo.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  El cierre de periodo no puede revertirse sin una solicitud extraordinaria aprobada por Dirección.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Periodo configurado, notificaciones enviadas a docentes y bloqueo automático de notas tras la fecha límite.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El directivo accede a 'Periodos Académicos'.
2. Selecciona el Bimestre a configurar (ej. I Bimestre).
3. Establece fecha de inicio, fecha de fin y fecha límite de subida de calificaciones.
4. Activa el periodo para permitir el registro de evaluaciones.
5. Al finalizar el plazo, ejecuta la acción 'Cerrar Periodo Oficial'.
6. El sistema cambia el estado del periodo a 'Cerrado' e inhabilita las ediciones de notas para los docentes.

---

## 6. Flujos Alternativos y Excepciones

* **5a. Docentes con notas incompletas al intentar cerrar: El sistema despliega un listado de advertencia con las aulas pendientes antes de confirmar el cierre.**

---

## 7. Reglas de Negocio Asociadas

* **RN-INS-03: Una vez cerrado el periodo, cualquier modificación requiere el flujo de rectificación (RF-43).**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Línea de tiempo interactiva de los 4 bimestres con estados visuales (Planificado, Abierto, Por Cerrar, Cerrado) y botón de cierre.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-11](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-11.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
