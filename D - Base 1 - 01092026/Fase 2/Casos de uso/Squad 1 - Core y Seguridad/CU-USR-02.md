# CU-USR-02: Importación Masiva de Usuarios desde Archivos Excel / CSV

**Requisito Trazable:** [RF-06](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-06.md)  
**Módulo:** Módulo 2: Administración de Usuarios y Directorio  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Baja (Inicio de año o semestre)  

---

## 1. Resumen y Alcance

Permite cargar lotes masivos de usuarios mediante una plantilla Excel/CSV normalizada, validando inconsistencias antes de la inserción transaccional.

---

## 2. Actores Involucrados

* **Actor Primario:** Administrador del Sistema
* **Actores Secundarios / Sistemas:** Procesador de Archivos en Background, PostgreSQL

---

## 3. Precondiciones

* El archivo cumple con la estructura de columnas requerida por el sistema.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Validación 'Dry-Run': Ninguna fila se inserta si existen errores estructurales mayores, o se genera reporte de filas descartadas sin corromper la base de datos.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Todos los registros válidos son creados en una sola transacción ACID con reporte descargable de resultados.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El administrador descarga la plantilla oficial XLSX/CSV desde el panel.
2. Llena los datos del personal o estudiantes y sube el archivo al sistema.
3. El sistema procesa el archivo en memoria y ejecuta validaciones de esquema (DNI válido, emails únicos, roles existentes).
4. El sistema muestra una vista previa con contador de registros válidos y lista de observaciones si las hubiera.
5. El administrador confirma la importación.
6. El sistema inserta los registros en PostgreSQL dentro de una transacción ACID.
7. El sistema genera credenciales y emite un reporte final de importación.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Archivo con formato incorrecto o columnas faltantes: El sistema rechaza el archivo y detalla los encabezados requeridos.**

---

## 7. Reglas de Negocio Asociadas

* **RN-USR-03: Límite máximo de 1000 registros por lote de importación.**
* **RN-USR-04: Transaccionalidad completa por lote o descarte controlado con log de errores.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Zona de arrastrar y soltar archivo (Drag & Drop), visor de progreso con barra porcentual y tabla de vista previa con resaltado de celdas con error en rojo.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-06](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-06.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
