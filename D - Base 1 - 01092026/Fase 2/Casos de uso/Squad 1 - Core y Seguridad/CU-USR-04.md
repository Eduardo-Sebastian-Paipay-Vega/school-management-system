# CU-USR-04: Directorio Escolar y Búsqueda Rápida de Personal

**Requisito Trazable:** [RF-08](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-08.md)  
**Módulo:** Módulo 2: Administración de Usuarios y Directorio  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta  

---

## 1. Resumen y Alcance

Permite consultar y filtrar en tiempo real el directorio institucional de personal y docentes por nombre, DNI, rol o área curricular.

---

## 2. Actores Involucrados

* **Actor Primario:** Directivos, Personal Administrativo, Docentes
* **Actores Secundarios / Sistemas:** Motor de Búsqueda PostgreSQL / Índices GIN

---

## 3. Precondiciones

* El usuario está autenticado con permisos de consulta de directorio.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Tiempos de respuesta menores a 200 ms gracias a índices de base de datos.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Lista paginada de resultados coincidentes con información de contacto institucional y estado.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El usuario navega a la sección 'Directorio Escolar'.
2. Escribe el término de búsqueda en la barra (DNI, apellido o especialidad).
3. Aplica filtros opcionales por rol o nivel educativo.
4. El sistema ejecuta una consulta paginada utilizando búsqueda difusa/trigramas.
5. El sistema presenta los resultados con tarjeta de perfil y acciones disponibles según permisos.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Sin coincidencias: El sistema muestra ilustración amigable sugiriendo revisar los términos de búsqueda.**

---

## 7. Reglas de Negocio Asociadas

* **RN-USR-05: La búsqueda debe tener debounce de 300 ms en el cliente para no saturar el backend.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Barra de búsqueda superior con autocompletado, chips de filtros rápidos por rol y tabla/cuadrícula responsiva con paginación.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-08](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-08.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
