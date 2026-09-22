# CU-REP-03: Generación del Cuadro de Mérito y Puestos de Honor Institucionales

**Requisito Trazable:** [RF-61](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-61.md)  
**Módulo:** Módulo 11: Emisión de Reportes y Verificación Criptográfica QR  
**Squad Asignado:** Squad 5: Secretaría Digital, Criptografía Documental y Portal Web  
**Responsable Técnico:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
**Rama de Trabajo:** `feature/squad-5/secretary-portal`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Bimestral y Anual (Clausura escolar)  

---

## 1. Resumen y Alcance

Calcula y emite el Cuadro de Mérito oficial ordenando a los estudiantes de mayor a menor rendimiento por sección, grado y nivel general, aplicando reglas rigurosas de desempate por puntaje acumulado y conducta.

---

## 2. Actores Involucrados

* **Actor Primario:** Comisión de Cuadro de Honor / Dirección
* **Actores Secundarios / Sistemas:** Motor de Ordenamiento y Desempate, Base de Datos

---

## 3. Precondiciones

* Todas las calificaciones del periodo han sido cerradas.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Cálculo matemático exacto y transparente de los primeros puestos sin margen de error humano.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Acta del Cuadro de Mérito generada con los 5 primeros puestos destacados por grado y nivel.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El operador accede a 'Cuadro de Mérito > Generar'.
2. Selecciona el Año y Nivel educativo.
3. El motor procesa el ordenamiento: primero por cantidad de AD, luego A, y en secundaria por promedio vigesimal exacto.
4. Aplica reglas de desempate en caso de igualdad estricta.
5. Presenta el listado preliminar con los puestos 1°, 2°, 3°, 4° y 5°.
6. La Dirección revisa y aprueba la emisión oficial del Cuadro de Honor.
7. Exporta el documento oficial para premiación y expediente anual.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Empate persistente: El sistema resalta a los alumnos empatados para que la comisión aplique el criterio de asistencia o evaluación complementaria.**

---

## 7. Reglas de Negocio Asociadas

* **RN-REP-04: No pueden integrar el cuadro de honor estudiantes con asignaturas en nivel 'C' o faltas graves de conducta.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Tabla de honor con medallas dorada (1°), plateada (2°) y bronce (3°), puntajes exactos y diploma de honor imprimible con 1 clic.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-61](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-61.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/esquema_datos.sql)
