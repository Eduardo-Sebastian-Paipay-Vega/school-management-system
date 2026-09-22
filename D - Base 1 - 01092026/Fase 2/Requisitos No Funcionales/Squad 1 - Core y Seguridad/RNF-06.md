# RNF-06: Control de Acceso Basado en Roles (RBAC Estricto)

- **Squad Responsable:** Squad 1 - Core y Seguridad
- **Desarrollador Responsable:** Brandon Fernando Montero Gutiérrez (@brandonmontero27-g)
- **Dimensión ISO/IEC 25010:** Seguridad
- **Estado:** Especificado y Vigente

---

## 1. Descripción del Requisito
100% de las rutas en Flutter y endpoints en el Backend deben validar los permisos del rol del usuario (Administrador, Director, Coordinador, Docente, Auxiliar, Secretaría). Intentos no autorizados retornan HTTP 403 Forbidden y se auditan.

---

## 2. Métrica y Criterio de Aceptación Cuantificable
El cumplimiento de este requisito no funcional será validado mediante pruebas técnicas automáticas o manuales que certifiquen el cumplimiento estricto del criterio establecido.

---

## 3. Trazabilidad con la Arquitectura (SDD)
Este requisito debe ser abordado y justificado técnicamente en la sección correspondiente del **Documento de Diseño de Software (SDD)** del Squad 1 - Core y Seguridad.
