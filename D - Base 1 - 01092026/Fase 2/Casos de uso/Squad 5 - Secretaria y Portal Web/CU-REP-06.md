# CU-REP-06: Exportación de Datos en Formatos Estándar Abiertos (PDF y Excel SIAGIE)

**Requisito Trazable:** [RF-64](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-64.md)  
**Módulo:** Módulo 11: Emisión de Reportes y Verificación Criptográfica QR  
**Squad Asignado:** Squad 5: Secretaría Digital, Criptografía Documental y Portal Web  
**Responsable Técnico:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
**Rama de Trabajo:** `feature/squad-5/secretary-portal`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media  

---

## 1. Resumen y Alcance

Permite exportar las nóminas de matrícula y las calificaciones finales en la estructura exacta de columnas que exige el sistema oficial SIAGIE del Ministerio de Educación, facilitando la carga masiva sin doble digitación.

---

## 2. Actores Involucrados

* **Actor Primario:** Operador de SIAGIE / Secretaría
* **Actores Secundarios / Sistemas:** Generador XLSX, Base de Datos

---

## 3. Precondiciones

* Información académica registrada en el sistema.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Compatibilidad 100% con los formatos de importación de archivos Excel de SIAGIE v3.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Archivo XLSX generado listo para ser cargado en el portal del SIAGIE sin errores de sintaxis.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El operador de secretaría ingresa a 'Exportaciones > Compatibilidad SIAGIE'.
2. Selecciona el tipo de plantilla a generar (ej. 'Nómina de Matrícula' o 'Calificaciones Finales').
3. Selecciona Grado y Sección.
4. El sistema extrae los datos y los acomoda en la estructura oficial de celdas requerida por SIAGIE.
5. Descarga el archivo Excel normalizado.
6. El operador ingresa al portal del MINEDU y sube el archivo generado exitosamente.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Advertencia de datos faltantes: Si algún estudiante no tiene DNI registrado o nota completa, el sistema le alerta antes de generar el archivo.**

---

## 7. Reglas de Negocio Asociadas

* **RN-REP-07: Respetar estrictamente los códigos de asignaturas y formatos de fecha que exige el software del MINEDU.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Selector de plantillas oficiales con indicador de compatibilidad y botón 'Descargar Plantilla Lista para SIAGIE'.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-64](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-64.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/esquema_datos.sql)
