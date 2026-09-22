# Requisitos No Funcionales — Squad 1 - Core y Seguridad

**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (@brandonmontero27-g)  
**Marco:** Servicio Social Universitario IS-480 (UNSCH) — Planteles de Aplicación "Guamán Poma de Ayala"

---

## Catálogo de RNFs Asignados

| Código | Requisito No Funcional | Dimensión ISO 25010 | Criterio Clave |
|:---:|---|---|---|
| **[RNF-05](RNF-05.md)** | Autenticación Segura con JWT (Tokens de Acceso y Refresco) | Seguridad | Access Tokens JWT firmados con HMAC-SHA256 con tiempo de vida estricto de 15 min... |
| **[RNF-06](RNF-06.md)** | Control de Acceso Basado en Roles (RBAC Estricto) | Seguridad | 100% de las rutas en Flutter y endpoints en el Backend deben validar los permiso... |
| **[RNF-07](RNF-07.md)** | Hashing Criptográfico de Contraseñas con bcrypt | Seguridad | Las credenciales de acceso se almacenan utilizando bcrypt con un factor de traba... |
| **[RNF-08](RNF-08.md)** | Protección de Datos Personales de Menores (Ley N° 29733 - Perú) | Seguridad | Cifrado en reposo (AES-256) para campos sensibles de estudiantes menores de edad... |
| **[RNF-10](RNF-10.md)** | Alta Disponibilidad del Servicio Escolar (Uptime 99.5%) | Fiabilidad | Disponibilidad mínima del 99.5% durante las horas lectivas (lunes a viernes 07:0... |
| **[RNF-16](RNF-16.md)** | Arquitectura Modular Feature-First y Clean Architecture | Mantenibilidad | Estructura de código modular en lib/features/squad_1_core_seguridad/ organizada ... |

---

## 🔗 Trazabilidad
* Ver documento maestro consolidado: **[requisitos_no_funcionales.md](../requisitos_no_funcionales.md)**
