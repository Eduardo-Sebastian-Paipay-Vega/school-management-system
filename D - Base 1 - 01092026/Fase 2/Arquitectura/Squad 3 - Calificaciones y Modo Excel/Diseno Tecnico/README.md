# Diseño Técnico y Arquitectura de Implementación - Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB

**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama Git:** `feature/squad-3/gradebook-excel`  
**Requisitos Asignados:** RF-36, RF-37, RF-38, RF-39, RF-40, RF-41, RF-42, RF-43, RF-44, RF-45, RF-46  

---

## 1. Visión Técnica y Alcance del Squad

Planilla matricial ultra-rápida ('Modo Excel') en Flutter con navegación por teclado y pegado masivo (Ctrl+V), auto-guardado en segundo plano (debounce 400 ms) y motor de conversión dual 0-20 a literales CNEB.

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
