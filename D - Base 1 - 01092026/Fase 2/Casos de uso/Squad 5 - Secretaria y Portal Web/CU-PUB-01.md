# CU-PUB-01: Cartelera Digital y Publicación de Comunicados Institucionales

**Requisito Trazable:** [RF-69](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-69.md)  
**Módulo:** Módulo 13: Plataforma de Difusión Digital y Portal Institucional  
**Squad Asignado:** Squad 5: Secretaría Digital, Criptografía Documental y Portal Web  
**Responsable Técnico:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
**Rama de Trabajo:** `feature/squad-5/secretary-portal`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta  

---

## 1. Resumen y Alcance

Permite redactar, programar y publicar noticias, circulares urgentes y comunicados institucionales en la cartelera digital del portal web y en la app escolar.

---

## 2. Actores Involucrados

* **Actor Primario:** Secretaría / Dirección (Publicador) - Comunidad Escolar (Lector)
* **Actores Secundarios / Sistemas:** Servicio de Archivos Multimedia, Base de Datos

---

## 3. Precondiciones

* El usuario cuenta con el rol de Publicador o Administrador.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Publicación inmediata y visible en el portal público institucional y en el feed de la app.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Comunicado publicado con imágenes adjuntas, PDF descargable y fecha de vigencia.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El operador ingresa a 'Cartelera Digital > Nuevo Comunicado'.
2. Escribe el título, categoría (Urgente, Académico, Actividad, Citación) y cuerpo del mensaje con editor enriquecido.
3. Adjunta imágenes o documentos oficiales en PDF.
4. Define la fecha de inicio y vencimiento de la publicación.
5. Presiona 'Publicar en Cartelera'.
6. El comunicado aparece de inmediato en la página principal del portal y genera notificación a la comunidad.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Publicación programada: Permite fijar una fecha futura para que el comunicado se publique automáticamente.**

---

## 7. Reglas de Negocio Asociadas

* **RN-PUB-01: Los comunicados marcados como 'Urgente' se destacan con banner superior en toda la plataforma.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Editor de texto enriquecido (WYSIWYG) con vista previa simultánea en versión web de escritorio y versión móvil.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-69](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-69.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/esquema_datos.sql)
