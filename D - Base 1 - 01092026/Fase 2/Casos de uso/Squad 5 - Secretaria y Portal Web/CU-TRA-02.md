# CU-TRA-02: Solicitud y Emisión Rápida de Certificados y Constancias en Línea

**Requisito Trazable:** [RF-87](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-87.md)  
**Módulo:** Módulo 11: Emisión de Reportes y Verificación QR  
**Squad Asignado:** Squad 5: Secretaría Digital, Criptografía Documental y Portal Web  
**Responsable Técnico:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
**Rama de Trabajo:** `feature/squad-5/secretary-portal`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta (Picos a fin de año y en traslados)  

---

## 1. Resumen y Alcance

Reduce de días a horas la entrega de certificados: se piden en línea, el sistema los arma y Secretaría solo revisa y aprueba.

---

## 2. Actores Involucrados

* **Actor Primario:** Apoderado o Exalumno
* **Actores Secundarios / Sistemas:** Secretaría Académica, Servicio de firma SHA-256 y QR (RF-60)

---

## 3. Precondiciones

* Estudiante o exalumno con registros académicos en el sistema.
* Plantillas oficiales de certificados configuradas.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Ningún documento se entrega sin la aprobación de Secretaría.

* **Garantía de Éxito (Postcondición Exitosa):**  
  El solicitante descarga el documento oficial verificable.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El solicitante elige 'Solicitar certificado' y el tipo de documento.
2. Selecciona al estudiante y los periodos.
3. El sistema valida el derecho del solicitante y que los periodos estén cerrados.
4. El sistema genera el borrador y lo envía a la bandeja de Secretaría.
5. Secretaría revisa y aprueba.
6. El solicitante recibe la notificación y descarga el PDF.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Exalumno sin cuenta: valida su identidad con DNI y fecha de nacimiento, y recibe un código en su correo.**
* **5a. Secretaría observa datos inconsistentes: devuelve la solicitud con un comentario.**

---

## 7. Reglas de Negocio Asociadas

* **RN-TRA-04: Solo se certifican periodos cerrados.**
* **RN-TRA-05: Todo certificado emitido lleva hash SHA-256 y código QR verificable.**
* **RN-TRA-06: Las constancias simples (matrícula) pueden aprobarse en lote.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Formulario de solicitud con selector de tipo de documento, línea de tiempo del estado y bandeja de Secretaría con vista previa del PDF y botón 'Aprobar y emitir'.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-87](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-87.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/esquema_datos.sql)
