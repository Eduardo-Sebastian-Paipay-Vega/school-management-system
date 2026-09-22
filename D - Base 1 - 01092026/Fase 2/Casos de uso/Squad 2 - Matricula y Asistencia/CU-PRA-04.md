# CU-PRA-04: Emisión de Fichas Oficiales de Prácticas para la UNSCH

**Requisito Trazable:** [RF-31](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-31.md)  
**Módulo:** Módulo 6: Asistencia y Cómputo de Horas de Practicantes  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Baja (Cierre de ciclo universitario)  

---

## 1. Resumen y Alcance

Permite emitir la constancia oficial de cumplimiento del Servicio Social Universitario (SSU IS-480) y la ficha consolidada de actividades con firma digital y código de validación QR para la UNSCH.

---

## 2. Actores Involucrados

* **Actor Primario:** Coordinador de Prácticas / Director del Plantel
* **Actores Secundarios / Sistemas:** Generador de PDF Criptográfico, Base de Datos

---

## 3. Precondiciones

* El practicante ha completado el 100% de las horas requeridas y cuenta con la aprobación final de su docente guía.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  No se puede emitir la constancia oficial si restan horas por cumplir o aprobar.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Documento oficial generado en PDF con sello institucional, hash SHA-256 y código QR de autenticidad verificable.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El coordinador accede a 'Practicantes > Emisión de Constancias'.
2. Selecciona al practicante que completó sus horas.
3. Revisa el informe consolidado de horas y actividades.
4. Presiona 'Aprobar y Emitir Constancia SSU'.
5. El sistema genera el hash SHA-256 del documento y ensambla el código QR de verificación pública.
6. Genera el documento en formato formal de la UNSCH y lo firma electrónicamente.
7. El practicante puede descargar su constancia directamente desde su portal personal.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Horas insuficientes: El sistema desactiva el botón de emisión e indica las horas faltantes.**

---

## 7. Reglas de Negocio Asociadas

* **RN-PRA-04: La constancia debe contener obligatoriamente el código de resolución rectoral del convenio UNSCH - Guamán Poma de Ayala.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Vista previa del certificado oficial con marcas de agua, datos del estudiante universitario y botón de firma y descarga.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-31](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-31.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
