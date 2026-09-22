# CU-AUD-04: Cumplimiento y Protección de Datos Personales (Ley N.° 29733)

**Requisito Trazable:** [RF-68](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-68.md)  
**Módulo:** Módulo 12: Trazabilidad, Auditoría y Protección de Datos (Ley 29733)  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Baja  

---

## 1. Resumen y Alcance

Garantiza el ejercicio de los derechos ARCO (Acceso, Rectificación, Cancelación y Oposición), enmascaramiento de datos sensibles de menores y consentimientos informados.

---

## 2. Actores Involucrados

* **Actor Primario:** Estudiante / Padre de Familia / Administrador
* **Actores Secundarios / Sistemas:** Servicio de Cifrado y Anonimización

---

## 3. Precondiciones

* Usuario con datos personales almacenados en el sistema.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Los datos sensibles de menores de edad nunca se exponen en APIs públicas ni en vistas no autorizadas.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Datos sensibles cifrados en reposo (AES-256), reportes de datos personales descargables por el titular y registro de consentimiento.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El titular de los datos o tutor legal solicita acceso a su expediente de datos personales registrados.
2. El administrador verifica la identidad del solicitante mediante DNI físico o validado.
3. El sistema genera un extracto estructurado de todos los datos personales y registros asociados al alumno.
4. El sistema permite registrar la solicitud formal de rectificación o supresión de datos no reglamentarios.
5. Se emite la constancia de atención de solicitud ARCO cumpliendo los plazos de la Ley 29733.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Solicitud de eliminación de notas o récords académicos oficiales: El sistema rechaza la supresión indicando que las actas académicas son registros públicos de custodia obligatoria por Ley General de Educación.**

---

## 7. Reglas de Negocio Asociadas

* **RN-AUD-04: DNI, direcciones domiciliarias y teléfonos de contacto enmascarados en reportes públicos.**
* **RN-AUD-05: El consentimiento informado para tratamiento de datos de menores debe estar firmado al momento de la matrícula.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Módulo de privacidad en la ficha del estudiante con estado de consentimiento y botón de descarga de extracto de datos personales.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-68](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-68.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
