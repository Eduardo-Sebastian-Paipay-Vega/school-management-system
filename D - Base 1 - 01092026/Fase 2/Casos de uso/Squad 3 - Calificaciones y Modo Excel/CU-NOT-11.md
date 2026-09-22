# CU-NOT-11: Motor de Conversión Escala Vigesimal (0-20) a Literal CNEB (AD, A, B, C)

**Requisito Trazable:** [RF-46](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-46.md)  
**Módulo:** Módulo 8: Calificaciones en Tiempo Real, Modo Excel, Conclusiones y Motor CNEB  
**Squad Asignado:** Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB  
**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama de Trabajo:** `feature/squad-3/grades-engine`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Muy Alta  

---

## 1. Resumen y Alcance

Permite al docente ingresar calificaciones en escala numérica tradicional (0 a 20) y obtener de forma simultánea e instantánea la equivalencia cualitativa oficial del CNEB (AD, A, B, C), manteniendo ambos valores sincronizados para reportes pedagógicos y actas del MINEDU.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente Titular / Sistema
* **Actores Secundarios / Sistemas:** Motor de Reglas Pedagógicas, Base de Datos

---

## 3. Precondiciones

* Asignatura configurada con escala dual.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Mapeo unívoco y exacto según la tabla oficial normativa sin ambigüedades en los límites de rango.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Cada nota almacena tanto el puntaje numérico exacto (para rankings y promedios) como la letra oficial (para libretas y SIAGIE).

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente ingresa una nota numérica (ej. '16') en la celda de evaluación.
2. El motor de conversión evalúa el valor en tiempo real: 18 a 20 = AD (Logro Destacado), 14 a 17 = A (Logro Esperado), 11 a 13 = B (En Proceso), 00 a 10 = C (En Inicio).
3. La celda muestra inmediatamente la insignia de color con la letra `A` y el número `(16)` entre paréntesis.
4. Al generar la boleta de notas oficial para MINEDU, el sistema emite automáticamente la letra `A`.
5. Al generar el cuadro de mérito interno para el colegio, el sistema utiliza el puntaje `16` para desempatar puestos de honor con precisión matemática.

---

## 6. Flujos Alternativos y Excepciones

* **1a. Ingreso directo de letra: Si el docente digita directamente la letra 'A', el sistema la acepta y le asigna el valor mediano de referencia.**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-14: Regla oficial de conversión: 18-20 = AD, 14-17 = A, 11-13 = B, 00-10 = C.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Insignia visual estilizada (Badge) en cada celda: Fondo verde con texto blanco 'A' junto al número en tipografía secundaria.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-46](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-46.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql)
