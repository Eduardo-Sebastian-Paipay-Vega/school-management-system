# CU-DSH-02: Tablero de Control Curricular y Cumplimiento para Coordinación

**Requisito Trazable:** [RF-53](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-53.md)  
**Módulo:** Módulo 10: Dashboards, Ficha 360° del Alumno y Métricas SSU IS-480  
**Squad Asignado:** Squad 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°  
**Responsable Técnico:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
**Rama de Trabajo:** `feature/squad-4/analytics-dashboards`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Diaria / Semanal  

---

## 1. Resumen y Alcance

Proporciona al equipo de coordinación el seguimiento en vivo del avance de unidades didácticas, entrega de notas bimestrales por docente y cobertura horaria.

---

## 2. Actores Involucrados

* **Actor Primario:** Coordinador Académico / Jefe de Laboratorios
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* Usuario con rol de Coordinación Académica.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Visibilidad total del estado de entrega de notas de todos los docentes.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Lista de control de cumplimiento curricular con semáforo por docente.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El coordinador accede a 'Panel de Coordinación'.
2. Visualiza el avance del calendario escolar y días restantes para el cierre de notas.
3. Revisa la lista de docentes y su estado: Notas Completadas (Verde), En Digitación (Amarillo), Sin Avance (Rojo).
4. Envía recordatorios masivos con un clic a los docentes con pendientes.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Notificación por correo: El sistema envía automáticamente correos institucionales a los docentes rezagados.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ANA-07: Las alertas de retraso en entrega de notas se activan a 48 horas del vencimiento del plazo.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Barra de progreso de avance curricular y tabla de docentes con chips de estado y botón de recordatorio.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-53](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-53.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/esquema_datos.sql)
