# CU-AST-07: Generación y Emisión Masiva de Carnés Escolares con Código QR Criptográfico

**Requisito Trazable:** [RF-26](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-26.md)  
**Módulo:** Módulo 5: Asistencia Estudiantil, Kiosco Offline-First, Carnés QR y App Móvil  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Baja (Inicio de año escolar)  

---

## 1. Resumen y Alcance

Permite generar los carnés escolares de los estudiantes en formato credencial imprimible (tipo tarjeta de PVC o papel fotográfico) con su fotografía, datos y un código QR criptográfico seguro que previene la falsificación.

---

## 2. Actores Involucrados

* **Actor Primario:** Personal de Secretaría / Administrador
* **Actores Secundarios / Sistemas:** Generador Criptográfico HMAC-SHA256, Motor de Renderizado PDF

---

## 3. Precondiciones

* Estudiantes matriculados con fotografía actualizada en el sistema.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  El código QR debe incluir un payload firmado criptográficamente con clave institucional HMAC que impida la clonación de carnés.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Hoja de impresión generada en PDF con cuadrícula de carnés listos para recorte o envío a imprenta.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El operador de secretaría ingresa a 'Carnés Escolares > Emisión Masiva'.
2. Filtra por Nivel, Grado y Sección.
3. El sistema lista a los estudiantes verificando la disponibilidad de fotografía.
4. El operador selecciona 'Generar Carnés Imprimibles (PDF)'.
5. El backend genera para cada estudiante un token QR firmado con estructura: Base64(student_id + dni + hash_hmac).
6. Ensambla los carnés en formato estándar (85.6 mm x 53.98 mm) con plantilla gráfica institucional de 'Guamán Poma de Ayala'.
7. El operador descarga el archivo PDF listo para su impresión física.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Estudiantes sin fotografía registrada: El sistema permite emitir el carné con avatar institucional por defecto o excluir temporalmente de la tanda de impresión.**

---

## 7. Reglas de Negocio Asociadas

* **RN-AST-09: El código QR no debe contener información médica ni sensible en texto plano; únicamente identificador firmado.**
* **RN-AST-10: La firma criptográfica HMAC previene que se impriman carnés no oficiales.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Visor de previsualización 3D interactivo del carné frontal y reverso con botón de descarga en alta resolución (300 DPI).

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-26](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-26.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
