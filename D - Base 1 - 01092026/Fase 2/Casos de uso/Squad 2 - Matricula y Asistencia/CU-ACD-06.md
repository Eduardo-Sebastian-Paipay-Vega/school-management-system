# CU-ACD-06: Importación Masiva de Estudiantes y Matrícula desde Nóminas Excel (Formato SIAGIE)

**Requisito Trazable:** [RF-78](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-78.md)  
**Módulo:** Módulo 4: Gestión Académica, Matrícula y Carga Lectiva  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Baja (Inicio del año escolar)  

---

## 1. Resumen y Alcance

Evita digitar a mano la matrícula: se carga la nómina oficial del SIAGIE y el sistema crea o actualiza a los estudiantes.

---

## 2. Actores Involucrados

* **Actor Primario:** Secretaría Académica
* **Actores Secundarios / Sistemas:** Procesador de archivos, PostgreSQL

---

## 3. Precondiciones

* Año lectivo, grados y secciones configurados (RF-10, RF-12).
* Archivo de nómina SIAGIE en formato .xlsx.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Si el archivo tiene errores estructurales, no se aplica ningún cambio.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Todas las filas válidas se importan en una transacción y las rechazadas se reportan con su motivo.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. Secretaría entra a 'Matrícula > Importar nómina SIAGIE'.
2. Sube el archivo Excel y elige el año lectivo.
3. El sistema valida y muestra la vista previa con Nuevos, Actualizados, Sin cambios y Con error.
4. Secretaría revisa y confirma.
5. El sistema aplica los cambios y ofrece el reporte de rechazos.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Formato no reconocido: el sistema rechaza el archivo e indica las columnas esperadas.**
* **3b. Sección inexistente: las filas de esa sección quedan con error hasta crearla (RF-12).**

---

## 7. Reglas de Negocio Asociadas

* **RN-ACD-07: El código de estudiante SIAGIE se guarda como identificador externo único por tenant.**
* **RN-ACD-08: La importación nunca elimina estudiantes; los ausentes en la nómina se listan para revisión manual.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Asistente de 3 pasos (Subir, Revisar, Confirmar) con tabla de vista previa coloreada por estado.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-78](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-78.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
