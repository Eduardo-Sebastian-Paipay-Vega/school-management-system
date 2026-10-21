# CU-TRA-01: Mesa de Partes Virtual para Solicitudes, Consultas y Quejas

**Requisito Trazable:** [RF-86](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-86.md)  
**Módulo:** Módulo 11: Emisión de Reportes y Verificación QR  
**Squad Asignado:** Squad 5: Secretaría Digital, Criptografía Documental y Portal Web  
**Responsable Técnico:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
**Rama de Trabajo:** `feature/squad-5/secretary-portal`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta  

---

## 1. Resumen y Alcance

Un único canal en línea para pedir información, presentar documentos o quejarse, con número de expediente y seguimiento.

---

## 2. Actores Involucrados

* **Actor Primario:** Solicitante (apoderado, estudiante, personal o público)
* **Actores Secundarios / Sistemas:** Secretaría, Áreas responsables, Dirección

---

## 3. Precondiciones

* Tipos de trámite y áreas responsables configurados por Dirección.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Ningún expediente se pierde: si falla la derivación, queda en la bandeja de Secretaría.

* **Garantía de Éxito (Postcondición Exitosa):**  
  El solicitante recibe acuse, seguimiento y respuesta dentro del plazo.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El solicitante entra a 'Mesa de Partes' en el portal.
2. Elige el tipo de trámite y completa el formulario con sus adjuntos.
3. Envía la solicitud y el sistema muestra el número de expediente.
4. Secretaría valida y deriva al área (o el sistema deriva automáticamente según el tipo).
5. El área atiende y responde; el solicitante recibe la respuesta.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Expediente incompleto: el área solicita información y el plazo se suspende hasta recibirla.**
* **5a. Plazo vencido: el sistema alerta a Dirección.**

---

## 7. Reglas de Negocio Asociadas

* **RN-TRA-01: El número de expediente es único y correlativo por año.**
* **RN-TRA-02: Las quejas y reclamos deben responderse en un plazo máximo configurable (por defecto, 15 días hábiles).**
* **RN-TRA-03: Los datos del solicitante solo los ven Secretaría y el área asignada.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Formulario público de 3 pasos, página de seguimiento por código con línea de tiempo, y bandeja interna de expedientes con filtros por estado y plazo.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-86](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-86.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/esquema_datos.sql)
