# Diseño Técnico y Arquitectura de Implementación - Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First

**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama Git:** `feature/squad-2/kiosk-attendance`  
**Requisitos Asignados:** RF-15, RF-16, RF-17, RF-18, RF-19, RF-20, RF-21, RF-22, RF-23, RF-24, RF-25, RF-26, RF-27, RF-28, RF-29, RF-30, RF-31, RF-32, RF-33, RF-34, RF-35  

---

## 1. Visión Técnica y Alcance del Squad

Arquitectura del Kiosco de portería Offline-First con Hive/IndexedDB, carnetización escolar con QR, WebSockets para difusión de asistencia de aula en tiempo real (< 500 ms) y gestión de matrícula.

---

## 2. Componentes Técnicos a Implementar

### A. Capa de Base de Datos (PostgreSQL)
* Implementación de tablas, migraciones y restricciones de integridad para soportar los requisitos del squad.
* Índices compuestos y optimización de consultas asegurando aislamiento multi-tenant por `tenant_id`.

### B. Capa de Backend (API REST / WebSockets)
* Controladores limpios con validación estricta de DTOs de entrada.
* Servicios de dominio encapsulados con inyección de dependencias.
* Respuestas HTTP tipadas y códigos de error consistentes (200, 201, 400, 401, 403, 404, 500).

### C. Capa de Frontend (Flutter Multiplataforma)
* Pantallas y widgets desacoplados bajo Clean Architecture (carpeta `lib/features/...`).
* Gestión de estado reactiva y validación visual de formularios.
* Manejo amigable de errores de red y estados de carga.

---

## 3. Enlaces Rápidos
* 📄 **[Requisitos Funcionales Individuales](../Requisitos/README.md)**
* 📄 **[Arquitectura Global del Sistema](../../arquitectura_sistema.md)**
