# CU-REP-01: Emisión Oficial de Boletas de Información Escolar / Libretas en PDF

**Requisito Trazable:** [RF-59](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-59.md)  
**Módulo:** Módulo 11: Emisión de Reportes y Verificación Criptográfica QR  
**Squad Asignado:** Squad 5: Secretaría Digital, Criptografía Documental y Portal Web  
**Responsable Técnico:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
**Rama de Trabajo:** `feature/squad-5/secretary-portal`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Bimestral / Anual  

---

## 1. Resumen y Alcance

Permite generar masiva o individualmente las libretas oficiales de calificaciones en formato PDF según el formato estándar del MINEDU, con membrete oficial, firmas digitales y conclusiones descriptivas por competencia.

---

## 2. Actores Involucrados

* **Actor Primario:** Secretaría, Docente Tutor, Director
* **Actores Secundarios / Sistemas:** Generador PDF (Puppeteer / PDFKit), Base de Datos

---

## 3. Precondiciones

* Periodo académico cerrado o con calificaciones publicadas.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Documento con formato idéntico al estipulado por las directivas del MINEDU.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Archivo PDF generado con diseño profesional, sellado criptográfico y código QR de validación.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El operador de secretaría ingresa a 'Boletas de Notas > Emisión Oficial'.
2. Selecciona Grado y Sección o un estudiante individual.
3. Selecciona el Bimestre o informe final anual.
4. Presiona 'Generar Boletas en PDF'.
5. El sistema compila notas, conclusiones descriptivas de cada curso y asistencia acumulada.
6. Genera el PDF con membrete de la I.E. 'Guamán Poma de Ayala', sellos oficiales y código QR público.
7. Permite descargar el archivo individual o un archivo ZIP con las libretas de toda la sección.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Emisión directa desde el portal del estudiante: El alumno o padre de familia puede descargar su propia boleta en cualquier momento.**

---

## 7. Reglas de Negocio Asociadas

* **RN-REP-01: La boleta debe contener obligatoriamente la escala cualitativa oficial del CNEB (AD, A, B, C).**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Selector de grado y sección con botón de descarga individual o por lote ZIP y barra de progreso de compilación PDF.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-59](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-59.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/esquema_datos.sql)
