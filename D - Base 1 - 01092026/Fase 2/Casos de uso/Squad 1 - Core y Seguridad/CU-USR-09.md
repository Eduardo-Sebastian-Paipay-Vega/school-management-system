# CU-USR-09: Centro de Notificaciones Internas y por Correo Electrónico

**Requisito Trazable:** [RF-76](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-76.md)  
**Módulo:** Módulo 2: Administración de Usuarios y Directorio  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Constante  

---

## 1. Resumen y Alcance

Reúne en un solo lugar los avisos del sistema y permite elegir cuáles llegan también por correo.

---

## 2. Actores Involucrados

* **Actor Primario:** Cualquier usuario autenticado
* **Actores Secundarios / Sistemas:** Módulos emisores, Servidor de correo (SMTP), Gateway WebSocket

---

## 3. Precondiciones

* Usuario con sesión activa y correo verificado para avisos por correo.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Si el correo falla, la notificación igual queda en la bandeja de la plataforma y el envío se reintenta.

* **Garantía de Éxito (Postcondición Exitosa):**  
  El usuario recibe el aviso por los canales que eligió y puede marcarlo como leído.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El usuario abre la campana de notificaciones.
2. El sistema lista las notificaciones recientes, con las no leídas resaltadas.
3. El usuario abre una notificación y el sistema lo lleva a la pantalla relacionada.
4. El sistema la marca como leída.
5. El usuario entra a 'Preferencias' y activa o desactiva el correo por categoría.

---

## 6. Flujos Alternativos y Excepciones

* **2a. Sin notificaciones: el sistema muestra un estado vacío.**
* **5a. Categoría obligatoria (por ejemplo, seguridad de la cuenta): el correo no puede desactivarse.**

---

## 7. Reglas de Negocio Asociadas

* **RN-USR-16: Las notificaciones de seguridad de la cuenta siempre se envían por correo.**
* **RN-USR-17: Las notificaciones se conservan 180 días.**
* **RN-USR-18: No se usan canales de mensajería pagados (WhatsApp, SMS).**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Ícono de campana con contador, panel desplegable con pestañas 'Todas' y 'No leídas', y página de preferencias con interruptores por categoría.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-76](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-76.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
