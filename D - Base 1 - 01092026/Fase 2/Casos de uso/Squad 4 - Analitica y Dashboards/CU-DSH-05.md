# CU-DSH-05: Ficha Integral y Radiografía Escolar 360° del Estudiante en 1 Clic

**Requisito Trazable:** [RF-56](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-56.md)  
**Módulo:** Módulo 10: Dashboards, Ficha 360° del Alumno y Métricas SSU IS-480  
**Squad Asignado:** Squad 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°  
**Responsable Técnico:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
**Rama de Trabajo:** `feature/squad-4/analytics-dashboards`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta durante atención a padres o consejos de grado  

---

## 1. Resumen y Alcance

Permite acceder en un solo clic a la radiografía completa del estudiante reuniendo en una sola pantalla: foto, datos de contacto de apoderados, notas históricas, récord de asistencia, justificaciones, intervenciones tutoriales y reconocimientos.

---

## 2. Actores Involucrados

* **Actor Primario:** Director, Tutor, Docente, Psicólogo Escolar
* **Actores Secundarios / Sistemas:** Base de Datos Consolidada

---

## 3. Precondiciones

* Usuario con privilegios pedagógicos sobre el estudiante.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Toda la información del estudiante unificada en menos de 1 segundo sin navegar por múltiples módulos.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Ficha 360° desplegada con pestañas temáticas y opción de exportación a PDF de entrega.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El usuario busca al estudiante en cualquier módulo o hace clic sobre su nombre en la nómina.
2. El sistema carga la vista 'Ficha Escolar 360°'.
3. Encabezado: Fotografía ampliada, DNI, grado, sección, nombres de apoderados y teléfonos directos.
4. Cuerpo interactivo con 4 pestañas: 1. Rendimiento Académico (radar de notas), 2. Asistencia y Puntualidad (calendario), 3. Observaciones y Convivencia Escolar, 4. Documentos y Carné.
5. El usuario puede imprimir un informe resumido en PDF para la reunión con el padre de familia.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Datos médicos o sensibles restringidos: Solo visibles si el usuario tiene rol de Dirección o Psicología Escolar.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ANA-10: Los datos de contacto del apoderado deben contar con botón de llamada o mensaje directo para emergencias escolares.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Perfil estilo ficha ejecutiva con header flotante, tabs limpios y botones rápidos de 'Llamar Apoderado' y 'Descargar Informe 360°'.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-56](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-56.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/esquema_datos.sql)
