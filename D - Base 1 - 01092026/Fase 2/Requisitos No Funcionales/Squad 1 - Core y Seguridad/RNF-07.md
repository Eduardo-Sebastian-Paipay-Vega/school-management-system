# RNF-07: Hashing Criptográfico de Contraseñas con bcrypt

- **Squad Responsable:** Squad 1 - Core y Seguridad
- **Desarrollador Responsable:** Brandon Fernando Montero Gutiérrez (@brandonmontero27-g)
- **Dimensión ISO/IEC 25010:** Seguridad
- **Estado:** Especificado y Vigente

---

## 1. Descripción del Requisito
Las credenciales de acceso se almacenan utilizando bcrypt con un factor de trabajo (salt rounds) mínimo de 12. Queda estrictamente prohibido el almacenamiento de contraseñas en texto claro.

---

## 2. Métrica y Criterio de Aceptación Cuantificable
El cumplimiento de este requisito no funcional será validado mediante pruebas técnicas automáticas o manuales que certifiquen el cumplimiento estricto del criterio establecido.

---

## 3. Trazabilidad con la Arquitectura (SDD)
Este requisito debe ser abordado y justificado técnicamente en la sección correspondiente del **Documento de Diseño de Software (SDD)** del Squad 1 - Core y Seguridad.
