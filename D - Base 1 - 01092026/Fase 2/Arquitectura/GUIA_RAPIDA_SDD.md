# Guía Rápida: ¿Cómo y Dónde se elabora el SDD de cada Squad?

### Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)
**Servicio Social Universitario IS-480 (2026-II)**

Esta guía explica en **3 pasos sencillos** dónde debe crearse el **Documento de Diseño de Software (SDD)** de cada Squad, de dónde se extrae la información y cómo queda el documento terminado.

---

## 📍 1. ¿Dónde se guarda el SDD de cada Squad? (Ubicación Oficial)

Cada Squad debe guardar su archivo `sdd_squad_[X].md` dentro de su carpeta en `Fase 2/Arquitectura/`:

| Squad | Responsable | Archivo SDD Oficial | Insumos Requeridos |
|---|---|---|---|
| **Squad 1** | Brandon Fernando Montero | [`Arquitectura/Squad 1 - Core y Seguridad/sdd_squad_1.md`](Squad%201%20-%20Core%20y%20Seguridad/sdd_squad_1.md) | `RF-01` al `RF-14`, `RF-65` al `RF-68`, `CU-SEG`, `CU-USR`, `CU-INS`, `CU-AUD` |
| **Squad 2** | Eduardo Sebastian Paipay | [`Arquitectura/Squad 2 - Matricula y Asistencia/sdd_squad_2.md`](Squad%202%20-%20Matricula%20y%20Asistencia/sdd_squad_2.md) | `RF-15` al `RF-35`, `CU-ACD`, `CU-AST`, `CU-PRA`, `CU-DOC` |
| **Squad 3** | Steve Smith Ovalle | [`Arquitectura/Squad 3 - Calificaciones y Modo Excel/sdd_squad_3.md`](Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/sdd_squad_3.md) | `RF-36` al `RF-46`, `CU-NOT-01` al `CU-NOT-11` |
| **Squad 4** | Grissel Arascely Rodríguez | [`Arquitectura/Squad 4 - Analitica y Dashboards/sdd_squad_4.md`](Squad%204%20-%20Analitica%20y%20Dashboards/sdd_squad_4.md) | `RF-47` al `RF-58`, `CU-MAP`, `CU-DSH` |
| **Squad 5** | Cesar Antonio Leon | [`Arquitectura/Squad 5 - Secretaria y Portal Web/sdd_squad_5.md`](Squad%205%20-%20Secretaria%20y%20Portal%20Web/sdd_squad_5.md) | `RF-59` al `RF-64`, `RF-69` al `RF-71`, `CU-REP`, `CU-PUB` |

---

## 🔄 2. ¿Cómo se construye el SDD? (Flujo en 5 Minutos)

El SDD **unifica** los artefactos que el Squad ya tiene preparados en el repositorio:

```text
       [Requisitos Funcionales (RF)]       [Casos de Uso (CU)]
                      \                        /
                       \                      /
     [esquema_datos.sql] ---> [ SDD DEL SQUAD ] <--- [contratos_api.md]
                                   |
                                   v
                      [Código Flutter en lib/features/]
```

1. **Paso 1: Copiar la Plantilla**
   * Abrir la plantilla canónica: [`.agents/skills/sdd-authoring/resources/plantilla_sdd.md`](../../../.agents/skills/sdd-authoring/resources/plantilla_sdd.md).
   * Guardarla como `sdd_squad_[X].md` en la carpeta del squad.
2. **Paso 2: Rellenar Metadatos y Alcance**
   * Poner nombre del responsable, módulos a cargo y lista de RFs/CUs.
3. **Paso 3: Pegar el Diagrama C4 y Componentes**
   * El diagrama de cómo interactúa Flutter con los controladores y la BD.
4. **Paso 4: Integrar el Esquema SQL y Contratos API**
   * Copiar las tablas del archivo `esquema_datos.sql` del squad.
   * Copiar los endpoints JSON del archivo `contratos_api.md`.
5. **Paso 5: Trazabilidad**
   * Rellenar la tabla final: `RF-XX` ↔ `CU-XXX` ↔ `Tabla BD` ↔ `Endpoint` ↔ `Pantalla Flutter`.

---

## 🌟 3. Ejemplo Real Terminado para Inspección Inmediata

Ya puedes revisar el primer SDD 100% completado como referencia canónica:
👉 **[Ver Ejemplo Modelo: SDD Squad 1 (Core y Seguridad)](Squad%201%20-%20Core%20y%20Seguridad/sdd_squad_1.md)**

---

## 🤖 4. ¿Cómo pedirle a Antigravity que te genere tu SDD?

Simplemente escribe en el chat:
> *"Genera el SDD completo para el Squad 2 siguiendo la skill sdd-authoring"*

La IA leerá los requisitos de tu squad, tu base de datos y tus endpoints, y redactará el documento completo de forma automática.
