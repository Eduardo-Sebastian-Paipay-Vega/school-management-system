# CU-PUB-05: Publicación en la Página Oficial de Facebook y Feed Integrado en el Portal

**Requisito Trazable:** [RF-85](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-85.md)  
**Módulo:** Módulo 13: Plataforma de Difusión Digital y Portal Web  
**Squad Asignado:** Squad 5: Secretaría Digital, Criptografía Documental y Portal Web  
**Responsable Técnico:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
**Rama de Trabajo:** `feature/squad-5/secretary-portal`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Media  

---

## 1. Resumen y Alcance

Las noticias del portal se comparten solas en la página de Facebook del colegio, y el portal muestra lo último de esa página.

---

## 2. Actores Involucrados

* **Actor Primario:** Comunicaciones
* **Actores Secundarios / Sistemas:** API Graph de Meta, Administrador de la página de Facebook

---

## 3. Precondiciones

* Página oficial de Facebook del colegio conectada por un administrador de la página, con permisos otorgados mediante el flujo oficial de Meta.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Si Facebook falla, la noticia sigue publicada en el portal.

* **Garantía de Éxito (Postcondición Exitosa):**  
  La noticia aparece en la página de Facebook con el enlace al portal.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. Un administrador de la página conecta la cuenta desde 'Integraciones > Facebook'.
2. Al publicar una noticia, Comunicaciones marca 'Compartir en Facebook'.
3. El sistema crea la publicación en la página y guarda su identificador.
4. El portal muestra el feed actualizado de la página.

---

## 6. Flujos Alternativos y Excepciones

* **1a. El administrador no otorga los permisos: la integración queda desconectada y la opción 'Compartir' no aparece.**
* **3a. Límite de uso de la API: el sistema reintenta más tarde.**

---

## 7. Reglas de Negocio Asociadas

* **RN-PUB-07: Solo se usa la API oficial de Meta; está prohibido el scraping.**
* **RN-PUB-08: El token de la página se guarda cifrado y solo lo usa el servicio de publicación.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Pantalla de integración con estado (Conectada / Desconectada), casilla 'Compartir en Facebook' en el editor de noticias y bloque de feed en la portada.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-85](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-85.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/esquema_datos.sql)
