# CU-NOT-07: Cierre Oficial de Periodo Académico y Bloqueo de Modificación

**Requisito Trazable:** [RF-42](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-42.md)  
**Módulo:** Módulo 8: Calificaciones en Tiempo Real, Modo Excel, Conclusiones y Motor CNEB  
**Squad Asignado:** Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB  
**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama de Trabajo:** `feature/squad-3/grades-engine`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media (4 veces al año)  

---

## 1. Resumen y Alcance

Ejecuta el congelamiento formal y cierre definitivo de las calificaciones de un bimestre o año lectivo, bloqueando cualquier modificación directa en la planilla de notas por parte de los docentes.

---

## 2. Actores Involucrados

* **Actor Primario:** Director / Subdirector Académico
* **Actores Secundarios / Sistemas:** Base de Datos, Servicio de Generación de Actas

---

## 3. Precondiciones

* Fecha límite de entrega de notas cumplida y periodo en estado de revisión.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Inmutabilidad total de las notas tras el cierre sin un proceso formal de rectificación.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Estado del periodo actualizado a 'Cerrado', actas oficiales consolidadas y planillas en modo de solo lectura.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El subdirector ingresa a 'Cierre de Periodo'.
2. El sistema realiza un chequeo de consistencia: porcentaje de notas completadas por curso y docentes con pendientes.
3. Si se alcanza el umbral exigido, el subdirector presiona 'Ejecutar Cierre Oficial de Bimestre'.
4. El sistema solicita confirmación con contraseña directiva.
5. Ejecuta una transacción que cambia el estado a 'Cerrado' y bloquea los permisos de edición para el rol docente.
6. Genera una instantánea (Snapshot) inmutable de las notas del bimestre en la base de datos.
7. Registra el evento formal en la bitácora de auditoría.

---

## 6. Flujos Alternativos y Excepciones

* **2a. Cursos con más del 10% de notas no registradas: El sistema emite informe de bloqueo preventivo exigiendo completar o justificar los registros pendientes.**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-10: Toda nota cerrada queda congelada y no puede ser editada por docentes sin el flujo formal de rectificación (RF-43).**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Pantalla de diagnóstico de cierre con gráfico de dona de cobertura global y botón de cierre en rojo protegido con doble confirmación.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-42](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-42.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql)
