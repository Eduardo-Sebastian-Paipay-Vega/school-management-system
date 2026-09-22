# CU-ACD-03: Catálogo Curricular y Planes de Estudio oficiales según CNEB

**Requisito Trazable:** [RF-17](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-17.md)  
**Módulo:** Módulo 4: Gestión Académica, Matrícula y Carga Lectiva  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Baja  

---

## 1. Resumen y Alcance

Permite administrar el plan de estudios por nivel y grado, definiendo las áreas curriculares oficiales (Matemática, Comunicación, etc.), competencias y horas semanales.

---

## 2. Actores Involucrados

* **Actor Primario:** Coordinador Académico
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* Año lectivo configurado.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Las competencias curriculares deben ajustarse a la normativa oficial CNEB del MINEDU.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Malla curricular aprobada y asignable a los docentes.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El coordinador accede a 'Planes de Estudio > Malla Curricular'.
2. Selecciona el nivel y grado educativo.
3. Define o importa las áreas curriculares y sus competencias asociadas.
4. Asigna las horas lectivas semanales por curso.
5. Presiona 'Aprobar Malla Curricular'.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Importación de plantilla oficial: Permite cargar el estándar CNEB preconfigurado con un clic.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ACD-04: Todo curso debe contar con al menos una competencia evaluable definida.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Tabla interactiva de áreas con tarjetas desplegables para competencias y capacidades asociadas.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-17](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-17.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
