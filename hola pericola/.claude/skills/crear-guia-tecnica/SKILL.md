---
name: crear-guia-tecnica
description: Redacta o actualiza la guía técnica de un módulo del sistema, orientada al personal técnico interno (desarrollo y soporte) — no al usuario final. Cubre accesos y roles, flujo operativo, modales, estados, implementación (archivos/endpoints/tablas/comandos), diagnóstico y checklist de validación antes de producción, con diagramas Mermaid cuando el flujo tiene ramas o varios actores. Se guarda como docs/manuales/GUIA_MODULO_<MODULO>.md. Se invoca manualmente (/crear-guia-tecnica <módulo>) cuando se pide una guía técnica, guía operativa, documentación de soporte o "una guía como GUIA_MODULO_ENSAMBLAJE.md" — nunca se dispara sola. Si ya existe una guía para ese módulo, la actualiza sección por sección en vez de reemplazarla o duplicarla.
---

# Crear guía técnica de un módulo

`docs/manuales/` ya tiene dos convenciones de guía con audiencias opuestas:

- `GUIA_USUARIO_<MODULO>.md` (skill `crear-manual-usuario`): para el cliente
  final, sin jerga de sistema, se convierte a `.docx` para entregar.
- `GUIA_MODULO_<MODULO>.md` (esta skill): para el equipo de Compusur —
  desarrollo, soporte, quien capacita técnicos o administra el sistema. Nombra
  clases, archivos, endpoints, tablas y comandos sin traducirlos; asume que
  quien lee puede abrir el código si necesita más detalle.

Dos guías de referencia real en el repositorio, con dos profundidades
distintas según la complejidad del módulo — leerlas antes de escribir una
nueva, no solo como ejemplo de formato sino para calibrar cuánto detalle
amerita el módulo que se está documentando:

- `docs/manuales/GUIA_MODULO_ENSAMBLAJE.md` — forma **compacta** (13
  secciones): un módulo de flujo acotado, una entidad central con estados,
  dos roles (administrador/técnico).
- `docs/manuales/GUIA_MODULO_ORDENES_COMPRA_OCAM.md` — forma **integral** (19
  secciones): reglas de negocio cruzadas, tres roles, un proceso automático
  programado y una integración externa (Perú Compras, SIAF). Se declara
  explícitamente en su cabecera: "secciones 2 a 9 son el manual para
  usuarios y administradores... secciones 10 a 19 explican la
  implementación para desarrollo y soporte" — ese mismo documento ya mezcla
  ambos niveles de lectura a propósito, no hace falta separarlos en dos
  archivos.

Esta skill nunca produce un `.docx`: la guía técnica vive en Git, versionada
junto al código que describe, no es un entregable para el cliente.

## Cuándo actualizar en vez de crear

Antes de escribir una sola línea, revisar si ya existe
`docs/manuales/GUIA_MODULO_<NOMBRE>.md` para el módulo pedido (buscar por
nombre aproximado, los módulos no siempre coinciden 1:1 con la carpeta de
código — ver `docs/arquitectura/estructura-proyecto.md`).

- **Si ya existe**: es una tarea de actualización, no de reemplazo. Leer el
  archivo completo primero, verificar cada sección contra el código actual, y
  actualizar solo lo que cambió — nunca borrar ni simplificar una sección que
  sigue siendo correcta (regla general de `CLAUDE.md`: "No eliminar ni
  simplificar documentación existente en `docs/`"). Si aparece una
  funcionalidad nueva que no encaja en ninguna sección existente, agregar una
  sección nueva y renumerar lo que sigue, incluyendo cualquier referencia
  cruzada al número de sección (ej. "las secciones 10 a 14 explican..." en el
  encabezado). Actualizar también la fecha/versión del encabezado
  (`> Documento... al DD/MM/AAAA` o `> Versión implementada: AAAA-MM-DD`,
  según el formato que ya use ese archivo).
- **Si no existe**: crear siguiendo la estructura del Paso 2, eligiendo la
  profundidad (compacta o integral) según el módulo.

## Paso 1 — Reunir el comportamiento real

Nunca redactar de memoria ni asumir — a diferencia de un manual de usuario,
acá también hace falta leer el backend, no solo el frontend:

- **Frontend**: el componente Angular real del módulo (`.ts`/`.html`/`.scss`)
  — qué botones existen, qué modales abre cada uno, qué campos son
  obligatorios, qué validaciones corren en el cliente, qué mensajes de error
  o alertas muestra, qué pasa después de cada acción, qué columnas tiene cada
  tabla.
- **Backend**: `models.py` (campos, choices, reglas de negocio en el modelo),
  `serializers.py` (validaciones cruzadas, campos calculados), `views.py`
  (acciones del `ModelViewSet`, permisos), y cualquier `services/` o
  `management/commands/` asociado (procesos programados, sincronizaciones,
  envío de correo).
- **Migraciones recientes**: si el módulo tiene lógica de negocio no obvia
  ligada a una migración puntual (ej. un campo que cambió de significado),
  confirmarlo contra el código actual, no contra lo que diga una guía vieja.
- Si ya existe una guía para ese módulo, usarla como punto de partida de qué
  revisar, pero verificar cada afirmación contra el código actual — una guía
  existente puede haber quedado desactualizada (mismo módulo, funcionalidad
  agregada después de la fecha que declara el encabezado).
- Si el pedido no especifica qué pantalla o submódulo exacto (un grupo del
  sidebar puede tener varios hijos, ver `nav.config.ts`), preguntar cuál
  antes de continuar — no adivinar ni documentar el grupo entero de una sola
  vez si no fue lo pedido.

## Paso 2 — Elegir la profundidad y la estructura

Esqueleto combinado de las dos guías de referencia — no es un molde rígido,
se ajusta según el módulo (varias secciones son opcionales):

```
# Guía [operativa|integral] del módulo de <Nombre>

> Metadatos: versión/fecha implementada, ruta del módulo, de dónde nacen sus
> datos (si aplica).

## 1. Para qué sirve / Objetivo de esta guía
## 2. Accesos y responsabilidades (por rol)
## 3. Idea central / conceptos que no se deben confundir (si hay varios
      "estados" parecidos que se prestan a confusión, como Perú Compras vs.
      seguimiento interno vs. SIAF en la guía de Órdenes de Compra)
## 4. Flujo principal paso a paso (crear/registrar, tal como se hace clic)
## 5. Pantalla(s) principal(es): columnas, filtros, acciones por fila
## 6. Modales operativos (uno por cada uno, con sus pasos y validaciones)
## 7. Estados (tabla o diagrama de transiciones)
## 8. Acciones administrativas (solo si hay un rol privilegiado con acciones
      propias: cancelar, reabrir, cerrar, confirmar)
## 9. Historial y auditoría (si el módulo guarda un log de eventos)
## 10. Cuándo se genera y envía un correo/notificación (si aplica)
## 11. Implementación técnica de punta a punta (request → backend → tablas)
## 12. Tablas / modelos principales (una fila por modelo, con su responsabilidad)
## 13. Contrato HTTP (método + endpoint + uso)
## 14. Archivos clave para desarrollo y soporte (enlaces relativos, frontend y backend por separado)
## 15. Configuración técnica / operación de procesos programados (comandos, variables de entorno)
## 16. Monitoreo y diagnóstico / solución rápida de problemas (tabla síntoma → revisión)
## 17. Validación antes de usar en producción (checklist)
## 18. Limitaciones actuales que deben comunicarse
## 19. Diagrama de flujo del proceso (Mermaid)
```

Un módulo simple (como Ensamblaje) no necesita las secciones 3, 9 ni 10;
uno con integración externa y proceso programado (como Órdenes de Compra)
sí. Elegir con criterio, no copiar las 19 secciones si el módulo no las
amerita — una guía inflada con secciones vacías es tan mala como una
incompleta.

## Paso 3 — Reglas de tono y contenido

Exactamente lo opuesto de `crear-manual-usuario`:

- **Nombrar lo técnico sin traducirlo**: clases (`Venta`, `IncidenciaOrdenCompra`),
  archivos, endpoints (`POST /api/ventas/<id>/estado-entrega/`), tablas
  (`ventas_incidencias_ocam`), comandos de gestión, variables de entorno.
- **Diagramas Mermaid** (`flowchart TD`/`LR`) para cualquier flujo con más de
  un actor o con ramas condicionales — ver el patrón ya usado en ambas guías
  de referencia (uno técnico de datos, uno operativo de punta a punta).
- **Tabla síntoma → revisión** para diagnóstico rápido (ver §11 de la guía de
  Ensamblaje o §16 de la guía de Órdenes de Compra).
- **Checklist de validación antes de producción** cuando el módulo toca
  dinero, transiciones de estado irreversibles, o una integración externa.
- **Enlaces relativos a los archivos reales** con Markdown
  (`[texto](../../frontend/src/app/...)`) en la sección de "Archivos clave" —
  no solo nombrarlos, enlazarlos.
- **Bloques de comando en PowerShell**, mismo entorno que el resto de la
  documentación del proyecto (`$env:DEBUG='False'`, no `export`).
- **No inventar comportamiento**: cada afirmación debe poder rastrearse a una
  línea de código concreta. Si algo es una limitación conocida y no una
  funcionalidad, decirlo en la sección "Limitaciones actuales" en vez de
  omitirlo.

## Paso 4 — Redactar o actualizar el archivo

Guardar en `docs/manuales/GUIA_MODULO_<NOMBRE_MODULO>.md` (mayúsculas, mismo
prefijo que las guías existentes — revisar `estructura-proyecto.md` si hay
duda de cómo se llama el módulo formalmente). Si es una actualización, editar
el archivo existente con `Edit` sección por sección — no reescribirlo entero
con `Write` salvo que el usuario lo pida explícitamente, para no arriesgar
perder contenido correcto que no se llegó a revisar.

## Paso 5 — Mostrar al usuario antes de dar por terminado

Mostrar un resumen de qué secciones se escribieron o cambiaron (no hace falta
pegar el archivo completo si es largo) y preguntar si hay que ajustar algo
antes de darlo por definitivo — mismo criterio de revisión que
`crear-manual-usuario`, pero sin la fase de conversión a `.docx`: esta guía
termina en Markdown.

## Qué no hace esta skill

- No genera el manual para el cliente final — para eso existe
  `crear-manual-usuario`, que produce `GUIA_USUARIO_<MODULO>.md` y su
  `.docx`. Si el pedido es para el usuario final, usar esa skill en vez de
  esta.
- No commitea nada — ver la regla general del proyecto: nunca commitear sin
  que el usuario lo pida explícitamente.
- No elimina ni recorta contenido existente de una guía ya publicada — solo
  agrega o corrige (ver "Cuándo actualizar en vez de crear" arriba).
- No documenta comportamiento que no pudo verificarse leyendo el código real.
