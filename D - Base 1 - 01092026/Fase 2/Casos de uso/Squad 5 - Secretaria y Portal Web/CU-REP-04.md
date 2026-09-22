# CU-REP-04: Emisión y Descarga del Registro Auxiliar Oficial y Actas Finales

**Requisito Trazable:** [RF-62](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-62.md)  
**Módulo:** Módulo 11: Emisión de Reportes y Verificación Criptográfica QR  
**Squad Asignado:** Squad 5: Secretaría Digital, Criptografía Documental y Portal Web  
**Responsable Técnico:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
**Rama de Trabajo:** `feature/squad-5/secretary-portal`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Bimestral / Fin de Año  

---

## 1. Resumen y Alcance

Permite generar el Registro Auxiliar Docente oficial exigido por la supervisión pedagógica de la UGEL, conteniendo todas las evaluaciones parciales, competencias, conclusiones y firmas.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente Titular / Secretaría
* **Actores Secundarios / Sistemas:** Generador de Reportes PDF y Excel

---

## 3. Precondiciones

* Calificaciones registradas por el docente.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Formato reglamentario según normativa de la UGEL Huamanga.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Documento en formato apaisado (A4 horizontal) con todas las celdas cuadradas y membretes oficiales.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente ingresa a 'Mis Cursos > Registro Auxiliar'.
2. Selecciona el curso, grado y sección.
3. Presiona 'Descargar Registro Auxiliar Oficial'.
4. El sistema renderiza la sábana completa de notas con todas las competencias y capacidades evaluadas.
5. Descarga el archivo PDF y la copia de respaldo en hoja de cálculo Excel.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Descarga consolidada por Secretaría: Permite a Secretaría descargar en un solo paquete todas las actas de todos los profesores del colegio.**

---

## 7. Reglas de Negocio Asociadas

* **RN-REP-05: El registro auxiliar debe incluir la celda de firma del docente y visto bueno de la Subdirección.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Visor de sábana de notas en orientación horizontal con zoom y botón de exportación directa a PDF y Excel.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-62](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-62.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/esquema_datos.sql)
