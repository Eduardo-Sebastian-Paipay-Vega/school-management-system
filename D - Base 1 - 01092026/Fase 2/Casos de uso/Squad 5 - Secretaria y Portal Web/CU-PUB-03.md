# CU-PUB-03: Navegación Pública en Portal Institucional Responsivo y Accesible

**Requisito Trazable:** [RF-71](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-71.md)  
**Módulo:** Módulo 13: Plataforma de Difusión Digital y Portal Institucional  
**Squad Asignado:** Squad 5: Secretaría Digital, Criptografía Documental y Portal Web  
**Responsable Técnico:** Cesar Antonio Leon Reyna (`@cesarleon27-ai`)  
**Rama de Trabajo:** `feature/squad-5/secretary-portal`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Muy Alta  

---

## 1. Resumen y Alcance

Permite a cualquier visitante navegar libremente en el portal institucional del plantel 'Guamán Poma de Ayala', conociendo la reseña histórica, oferta educativa, normas de convivencia, ubicación, enlaces de interés y acceso al validador público de documentos.

---

## 2. Actores Involucrados

* **Actor Primario:** Público General, Postulantes, Padres de Familia, Comunidad UNSCH
* **Actores Secundarios / Sistemas:** Servidor Web Frontend

---

## 3. Precondiciones

* El visitante cuenta con conexión a internet y cualquier navegador web.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Diseño web 100% responsivo, adaptado a smartphones, tabletas y computadoras, con estándar de accesibilidad web (WCAG 2.1).

* **Garantía de Éxito (Postcondición Exitosa):**  
  Experiencia de navegación rápida (< 1.5 seg de carga), estética institucional y acceso directo a servicios escolares.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El visitante accede a la dirección web principal del colegio.
2. Visualiza la cabecera institucional con los escudos del plantel y de la UNSCH.
3. Navega por las secciones: 'Nosotros', 'Niveles Educativos', 'Comunicados', 'Reglamento Interno' y 'Contacto'.
4. Accede a los accesos directos destacados: 'Portal de Calificaciones', 'Verificar Documento QR' y 'Mesa de Partes Virtual'.
5. Visualiza los canales de contacto, mapa geolocalizado del plantel y redes sociales oficiales.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Navegación en dispositivo móvil: El menú se pliega automáticamente en un menú hamburguesa lateral accesible y ergonómico.**

---

## 7. Reglas de Negocio Asociadas

* **RN-PUB-03: El portal no debe requerir inicio de sesión para acceder a noticias, reglamentos, calendario ni al validador público.**
* **RN-PUB-04: Contraste de colores y tipografía conforme al nivel AA de accesibilidad digital.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Portal web moderno con tipografía Google Fonts (Inter / Outfit), banner principal con fotografía del plantel, tarjetas de acceso rápido y pie de página con enlaces institucionales y créditos SSU IS-480.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-71](../../Requisitos%20Funcionales/Squad%205%20-%20Secretaria%20y%20Portal%20Web/RF-71.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%205%20-%20Secretaria%20y%20Portal%20Web/esquema_datos.sql)
