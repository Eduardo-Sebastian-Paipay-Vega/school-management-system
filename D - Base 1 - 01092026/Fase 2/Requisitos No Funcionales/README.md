# Catálogo de Requisitos No Funcionales (RNF)

### Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)
**Servicio Social Universitario IS-480 (2026-II)**  
**Estándar:** IEEE 830 / ISO/IEC 25010 (Modelos de Calidad de Software)

---

## 📌 Organización del Directorio

Este directorio almacena la especificación formal de los **20 Requisitos No Funcionales (`RNF-01` al `RNF-20`)** organizados según el estándar internacional **ISO/IEC 25010** y asignados a los **5 Squads Técnicos Especializados**:

```text
Requisitos No Funcionales/
├── README.md                                 # Este documento de navegación y matriz de trazabilidad
├── requisitos_no_funcionales.md              # Documento maestro integral con métricas cuantificables
├── Squad 1 - Core y Seguridad/               # RNFs de JWT, RBAC, Cifrado Ley 29733 y Disponibilidad
├── Squad 2 - Matricula y Asistencia/         # RNFs de Kiosco Offline, Latencia QR e Integridad ACID
├── Squad 3 - Calificaciones y Modo Excel/    # RNFs de Debounce 400ms, Navegación de Teclado y Latencia UI
├── Squad 4 - Analitica y Dashboards/         # RNFs de Renderizado de Mapas de Calor y Accesibilidad WCAG
└── Squad 5 - Secretaria y Portal Web/        # RNFs de Hash SHA-256 en QR, Responsividad y Navegadores
```

---

## 📊 Matriz de Asignación de RNFs por Squad y Dimensión ISO 25010

| Squad Técnico | Miembro Asignado | Códigos RNF | Dimensión ISO 25010 | Foco Crítico de Calidad |
|---|---|:---:|---|---|
| **Squad 1 - Core y Seguridad** | Brandon Montero (`@brandonmontero27-g`) | `RNF-05`, `RNF-06`, `RNF-07`, `RNF-08`, `RNF-10`, `RNF-16` | Seguridad, Fiabilidad, Mantenibilidad | JWT 15m, RBAC estricto, bcrypt cost 12, Ley 29733 (AES-256) y SLA 99.5%. |
| **Squad 2 - Matrícula y Asistencia** | Sebastian Paipay (`@Eduardo-Sebastian-Paipay-Vega`) | `RNF-03`, `RNF-11`, `RNF-12` | Eficiencia, Fiabilidad | Escaneo QR < 300ms, Kiosco Offline-First (IndexedDB/Hive) y transacciones ACID. |
| **Squad 3 - Calificaciones y Modo Excel** | Steve Ovalle (`@steveovalle27-lgtm`) | `RNF-01`, `RNF-02`, `RNF-14` | Eficiencia, Usabilidad | Debounce de 400ms, latencia < 1.5s y ergonomía de teclado (hoja de cálculo). |
| **Squad 4 - Analítica y Dashboards** | Aracely Rodríguez (`@Arascely`) | `RNF-04`, `RNF-15` | Eficiencia, Usabilidad | Renderizado analítico < 2s (5,000 registros) y accesibilidad WCAG 2.1 AA. |
| **Squad 5 - Secretaría y Portal Web** | Cesar Leon (`@cesarleon27-ai`) | `RNF-09`, `RNF-13`, `RNF-19`, `RNF-20` | Seguridad, Usabilidad, Portabilidad | Hash SHA-256 en QR de libretas, diseño responsivo y compatibilidad en navegadores. |

---

## 🔗 Documentos Relacionados

* 📘 **[Documento Maestro Completo de RNFs](requisitos_no_funcionales.md)**
* 📋 **[Catálogo de Requisitos Funcionales (RF)](../Requisitos%20Funcionales/requisitos_funcionales.md)**
* 📐 **[Directivas de Arquitectura y SDDs](../Arquitectura/GUIA_RAPIDA_SDD.md)**
