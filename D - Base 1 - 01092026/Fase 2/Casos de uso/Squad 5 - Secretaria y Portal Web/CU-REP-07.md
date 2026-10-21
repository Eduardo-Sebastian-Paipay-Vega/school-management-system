# CU-REP-07: Generación de Archivos de Carga para el SIAGIE con Validación y Control de Envíos

**Requisito Trazable:** [RF-88](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-88.md)  
**Módulo:** Módulo 11: Emisión de Reportes y Verificación QR  
**Squad Asignado:** Squad 5: Secretaría Digital, Criptografía Documental y Portal Web  
**Responsable Técnico:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
**Rama de Trabajo:** `feature/squad-5/secretary-portal`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Bimestral (Al cierre de cada periodo)  

---

## 1. Resumen y Alcance

Prepara las notas y la asistencia en el formato exacto del SIAGIE, para que la carga oficial sea rápida y sin errores.

---

## 2. Actores Involucrados

* **Actor Primario:** Secretaría Académica
* **Actores Secundarios / Sistemas:** Dirección (supervisa el avance), Persona autorizada en el SIAGIE

---

## 3. Precondiciones

* Periodo cerrado (RF-42).
* Estudiantes con código SIAGIE registrado (RF-78).

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Con errores de validación no se genera ningún archivo.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Cada sección tiene su archivo válido y su estado de carga registrado.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. Secretaría abre 'SIAGIE > Generar archivos' y elige el periodo.
2. Selecciona el nivel, el grado y las secciones.
3. El sistema valida y muestra el resultado por sección.
4. Secretaría descarga los archivos válidos.
5. Tras cargarlos en el SIAGIE, los marca como cargados.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Errores de validación: el sistema lista los estudiantes y competencias a corregir.**
* **5a. Rectificación posterior de notas (RF-43): el sistema marca la sección como 'Requiere nueva carga'.**

---

## 7. Reglas de Negocio Asociadas

* **RN-REP-08: Solo se exportan periodos cerrados.**
* **RN-REP-09: No se almacenan credenciales del SIAGIE ni se automatiza su portal.**
* **RN-REP-10: Cada exportación guarda la huella SHA-256 del archivo generado.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Tablero por grado y sección con estados (Pendiente, Archivo generado, Cargada en SIAGIE, Requiere nueva carga) y botón de descarga por sección o en lote.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-88](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-88.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/esquema_datos.sql)
