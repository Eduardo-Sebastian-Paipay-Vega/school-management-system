# CU-INS-05: Parámetros Globales del Sistema y Membretes Institucionales

**Requisito Trazable:** [RF-14](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-14.md)  
**Módulo:** Módulo 3: Configuración Escolar, Periodos y Escalas  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Baja  

---

## 1. Resumen y Alcance

Permite cargar el logo oficial del colegio 'Guamán Poma de Ayala', insignia de la UNSCH, membrete institucional, firmas digitales de autoridades y pie de página de reportes.

---

## 2. Actores Involucrados

* **Actor Primario:** Administrador / Secretario General
* **Actores Secundarios / Sistemas:** Almacenamiento de Archivos, Base de Datos

---

## 3. Precondiciones

* El usuario posee permisos de administración global.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Solo se aceptan archivos de imagen en formato PNG/SVG con resolución adecuada.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Membretes y firmas integrados en todos los generadores de reportes PDF y carátulas.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El usuario ingresa a 'Configuración > Identidad Institucional'.
2. Sube el logotipo del plantel en formato vectorial o PNG transparente.
3. Ingresa los nombres y cargos de las autoridades firmantes (Director y Subdirector).
4. Carga los sellos y firmas escaneadas para emisión de documentos oficiales.
5. Guarda los cambios y visualiza la vista previa del membrete oficial.

---

## 6. Flujos Alternativos y Excepciones

* **2a. Archivo de imagen demasiado pesado (> 2 MB): El sistema solicita optimizar la imagen antes de subir.**

---

## 7. Reglas de Negocio Asociadas

* **RN-INS-05: Todo reporte oficial emitido por el sistema debe portar el membrete formal y logos correspondientes.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Visor de previsualización de documentos A4 con reemplazo dinámico de membrete y firmas.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-14](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-14.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
