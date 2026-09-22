# CU-REP-02: Verificación Pública Criptográfica de Documentos mediante Hash SHA-256 y Código QR

**Requisito Trazable:** [RF-60](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-60.md)  
**Módulo:** Módulo 11: Emisión de Reportes y Verificación Criptográfica QR  
**Squad Asignado:** Squad 5: Secretaría Digital, Criptografía Documental y Portal Web  
**Responsable Técnico:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
**Rama de Trabajo:** `feature/squad-5/secretary-portal`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta  

---

## 1. Resumen y Alcance

Permite a cualquier persona verificar la autenticidad e integridad de un certificado, boleta de notas o constancia física emitida por el colegio escaneando su código QR público con un smartphone sin requerir usuario ni contraseña.

---

## 2. Actores Involucrados

* **Actor Primario:** Cualquier ciudadano, Autoridad de UGEL, Universidad, Empleador
* **Actores Secundarios / Sistemas:** Servidor Público de Validación, Base de Datos

---

## 3. Precondiciones

* El documento físico o digital cuenta con el código QR y hash SHA-256 impreso en el pie de página.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Garantía de cero falsificación: si el documento impreso fue alterado en una sola nota o texto, el hash no coincidirá y el validador alertará de la adulteración.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Pantalla pública oficial que certifica la autenticidad del documento mostrando los datos originales y copia fiel para contrastar.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. La persona interesada escanea el código QR impreso en la boleta o constancia con la cámara de su teléfono.
2. El navegador abre la URL pública de validación: `https://guamanpoma.edu.pe/verificar?doc=UUID&hash=SHA256`.
3. El servidor consulta el registro del documento y recalcula el hash SHA-256.
4. Verifica que el hash coincida con el emitido formalmente por el colegio.
5. Despliega una pantalla oficial de verificación verde: 'Documento Auténtico y Válido'.
6. Muestra los metadatos: Estudiante, Grado, Fecha de Emisión, Autoridad Firmante y un botón para visualizar la copia digital fiel original.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Documento no encontrado o adulterado: El validador despliega una alerta roja: 'ADVERTENCIA: Documento No Válido o No Emitido por la Institución Educativa Guamán Poma de Ayala'.**

---

## 7. Reglas de Negocio Asociadas

* **RN-REP-02: La ruta de validación pública debe ser de acceso libre y responder en menos de 500 ms.**
* **RN-REP-03: El hash SHA-256 se genera a partir del contenido canónico del documento al momento de su firma.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Página web pública responsiva de verificación con escudo del plantel y la UNSCH, sello verde de verificación de seguridad y detalles legibles en móvil.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-60](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-60.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/esquema_datos.sql)
