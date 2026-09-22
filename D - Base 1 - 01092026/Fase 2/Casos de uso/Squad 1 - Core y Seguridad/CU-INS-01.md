# CU-INS-01: Parametrización del Año Lectivo y Calendario Escolar

**Requisito Trazable:** [RF-10](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-10.md)  
**Módulo:** Módulo 3: Configuración Escolar, Periodos y Escalas  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Baja (Anual)  

---

## 1. Resumen y Alcance

Permite configurar los parámetros del año lectivo oficial (ej. 2026), fechas de inicio y término, lema del año y cronograma general de actividades.

---

## 2. Actores Involucrados

* **Actor Primario:** Director / Administrador
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* El usuario posee rol directivo o de administración central.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  No se puede aperturar un año con solapamiento de fechas con un año activo.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Año escolar creado en estado 'planificado' o 'activo' disponible para matrículas y periodos.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El directivo ingresa a 'Configuración > Año Escolar'.
2. Ingresa el año calendario, nombre oficial nacional del año, fecha de inicio y cierre de clases.
3. Configura el régimen de evaluación (Bimestral o Trimestral).
4. Presiona 'Crear / Activar Año Escolar'.
5. El sistema valida consistencia de fechas y persiste la entidad academic_years.

---

## 6. Flujos Alternativos y Excepciones

* **2a. Fechas inconsistentes (inicio posterior a fin): El sistema impide el guardado con validación de formulario.**

---

## 7. Reglas de Negocio Asociadas

* **RN-INS-02: Solo puede existir un único año escolar con estado 'activo' a la vez.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Formulario con selectores de fecha calendario y switch para activar el año académico actual con confirmación en modal.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-10](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-10.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
