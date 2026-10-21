# CU-PUB-04: Gestor de Noticias Institucionales con Editor, Galería y Publicación Programada

**Requisito Trazable:** [RF-84](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-84.md)  
**Módulo:** Módulo 13: Plataforma de Difusión Digital y Portal Web  
**Squad Asignado:** Squad 5: Secretaría Digital, Criptografía Documental y Portal Web  
**Responsable Técnico:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
**Rama de Trabajo:** `feature/squad-5/secretary-portal`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media (Varias veces por semana)  

---

## 1. Resumen y Alcance

Permite al colegio publicar sus noticias con fotos y programarlas, sin depender de un tercero.

---

## 2. Actores Involucrados

* **Actor Primario:** Redactor o Comunicaciones
* **Actores Secundarios / Sistemas:** Dirección (aprueba), Servicio de imágenes

---

## 3. Precondiciones

* Usuario con permiso de publicación de noticias.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Una noticia sin aprobar nunca se publica.

* **Garantía de Éxito (Postcondición Exitosa):**  
  La noticia se publica en la fecha indicada, con imágenes optimizadas.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El redactor elige 'Nueva noticia' y completa el contenido.
2. Sube la portada y la galería.
3. Guarda y envía a revisión.
4. Dirección revisa y aprueba.
5. El sistema publica la noticia en la fecha programada.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Dirección devuelve la noticia con observaciones: vuelve a borrador.**
* **5a. Despublicación: Dirección retira una noticia publicada y queda en el archivo interno.**

---

## 7. Reglas de Negocio Asociadas

* **RN-PUB-05: Toda noticia requiere aprobación de Dirección antes de publicarse.**
* **RN-PUB-06: Las fotos con estudiantes identificables requieren autorización de imagen registrada (Ley N.° 29733).**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Editor con vista previa, panel lateral de publicación (estado, fecha, categoría) y cargador de galería con arrastrar y soltar.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-84](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-84.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/esquema_datos.sql)
