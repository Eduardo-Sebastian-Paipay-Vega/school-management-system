# RNF-05: Autenticación Segura con JWT (Tokens de Acceso y Refresco)

- **Squad Responsable:** Squad 1 - Core y Seguridad
- **Desarrollador Responsable:** Brandon Fernando Montero Gutiérrez (@brandonmontero27-g)
- **Dimensión ISO/IEC 25010:** Seguridad
- **Estado:** Especificado y Vigente

---

## 1. Descripción del Requisito
Access Tokens JWT firmados con HMAC-SHA256 con tiempo de vida estricto de 15 minutos. Refresh Tokens seguros con rotación de 7 días transmitidos exclusivamente en cookies HttpOnly y SameSite=Strict.

---

## 2. Métrica y Criterio de Aceptación Cuantificable
El cumplimiento de este requisito no funcional será validado mediante pruebas técnicas automáticas o manuales que certifiquen el cumplimiento estricto del criterio establecido.

---

## 3. Trazabilidad con la Arquitectura (SDD)
Este requisito debe ser abordado y justificado técnicamente en la sección correspondiente del **Documento de Diseño de Software (SDD)** del Squad 1 - Core y Seguridad.
