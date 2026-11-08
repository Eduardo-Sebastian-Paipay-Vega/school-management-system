---
name: frontend-review
description: Revisa un componente/módulo Angular completo contra la guía frontend-standards (estructura de carpetas, nombres, diálogos, validación de formularios, tablas/vista fija, signals, comunicación con backend) y corrige directamente las desviaciones claras; señala y pregunta antes de tocar patrones legado ya asentados. Se invoca manualmente (/frontend-review <componente>) sobre el componente que el usuario indique, el abierto en el IDE, o el mencionado en la conversación — nunca se dispara sola.
---

# Frontend Review — checklist + corrección aplicada

Automatiza recorrer `frontend/.claude/skills/frontend-standards/SKILL.md` sobre un componente concreto en vez de tener que releer el documento entero a mano cada vez: usa esa guía como checklist, corrige lo que es una desviación clara y sin ambigüedad, y se detiene a preguntar antes de tocar cualquier patrón legado — respetando el "Principio de no sorpresa" que la propia guía define en su última sección.

Para el sub-caso de tablas sin vista fija, esta skill delega en `/mejorar-vista-fija` en vez de reimplementar esa cadena de CSS aparte (ver Paso 2).

## Paso 0 — Identificar el componente objetivo

- Si el usuario nombró un componente, pantalla o ruta, usar ese.
- Si no, usar el archivo abierto en el IDE o el mencionado más recientemente en la conversación.
- Si hay ambigüedad real (más de un candidato razonable, ej. el módulo tiene varias sub-pantallas y no está claro cuál), preguntar antes de tocar nada.

Leer **todos** los archivos del componente antes de editar (`.ts`, `.html`, `.scss`, y si tiene `modal/`, sus subcomponentes; si tiene `*.service.ts` propio, también) — no asumir el contenido por el nombre del archivo.

## Paso 1 — Leer la fuente de verdad

Releer `frontend/.claude/skills/frontend-standards/SKILL.md` completo antes de evaluar nada — no confiar en un resumen mental de sesiones anteriores, la guía se actualiza (ver ejemplos fechados 2026-08-22 dentro de ese archivo).

## Paso 2 — Recorrer el checklist sección por sección

Para cada punto, verificar contra el componente objetivo y anotar el hallazgo (archivo:línea) si se desvía:

- **Estructura de carpetas**: ¿vive en `components/<modulo>/` (correcto solo si sigue siendo placeholder, sin servicios/estado propio) o en `features/<modulo>/` (correcto si ya tiene lógica real)? Si tiene lógica real pero sigue en `components/`, señalarlo como candidato a promoción — no moverlo sin confirmar con el usuario (mover carpetas afecta rutas y otros imports).
- **Nombres**: selector `app-` + kebab-case, archivo `nombre.component.ts`, servicio con sufijo `Service`, signal privado con `_`, signal público sin prefijo y `.asReadonly()`, sin abreviar términos de dominio.
- **Componentes**: `standalone`, `ChangeDetectionStrategy.OnPush` explícito, `input()`/`output()`/`model()` en vez de `@Input()`/`@Output()` clásicos.
- **Diálogos** (si el componente tiene `p-dialog`): header sin degradado/ícono, config estándar (`[modal]`, `[dismissableMask]="false"`, etc.), formulario con un signal por campo + `effect()` de reseteo/precarga (no reactive forms), validación con alerta flotante en vez de `[disabled]="formularioInvalido()"`, grillas `*-grid-N` con `margin-bottom: 0` en los campos hijos, sin filas-grilla vacías.
- **Placeholders de formulario**: formato `Introducir <campo>`, nunca datos de ejemplo (`"Ej: ..."`, RUC/email ficticios).
- **Validación por tipo de dato**: numéricos con `p-inputnumber` `[min]="0"` (y `[step]="1"` si es entero), `[maxlength]` de texto igual al `max_length` del modelo Django correspondiente (revisar `BACKEND/.../models.py` si hace falta confirmar), RUC 11 dígitos, selects con las mismas opciones que el `choices` del modelo.
- **Tablas — base**: wrapper `.tabla-scroll` + `[scrollable]="true"` en toda `p-table`.
- **Vista fija**: si el componente tiene una `p-table`, verificar si ya cumple el patrón completo usando el checklist del Paso 3 de `mejorar-vista-fija/SKILL.md` (`:host` con `height:100%`, cadena `flex:1; min-height:0`, `scrollHeight="flex"`, override de `max-height` con las dos clases del wrapper). Si falta, **invocar `/mejorar-vista-fija` sobre este mismo componente** en vez de reimplementar los pasos aquí — es una regla estricta de la guía, así que se corrige sin necesidad de preguntar, salvo que el usuario ya haya dicho explícitamente que no toque esa pantalla.
- **Íconos de acciones en tablas**: `p-button` `[text]="true" [plain]="true"` + `pTooltip` + `[attr.aria-label]`, sin `severity` incluso en eliminar.
- **Notificaciones**: sin `<p-toast>`/`providers: [MessageService]` locales duplicados, severity semánticamente correcta.
- **Estado (signals)**: sin `BehaviorSubject`, RxJS solo en el borde HTTP (`toSignal()`), `computed()` para derivados en vez de recalcular en template, `effect()` no usado como sustituto de `computed()`.
- **Comunicación con backend**: modelos en `models/` reflejan 1:1 el serializer DRF (mismo casing, sin mezclar `camelCase`/`snake_case`), sin URLs hardcodeadas (todo vía `environment.ts`), errores manejados por el interceptor + signal `_error` (no lógica ad-hoc de error en el componente).
- **Checklist final** (sección 7 de `frontend-standards`): repasarlo completo como cierre.

## Paso 3 — Clasificar cada hallazgo: corregir directo vs. preguntar primero

- **Corregir directo** (sin preguntar): desviaciones que no reflejan una decisión deliberada ya asentada en ese archivo — placeholder de ejemplo en un formulario nuevo, falta `[min]="0"` en un numérico, `<p-toast>` local duplicado, tabla sin vista fija, `[maxlength]` que no coincide con el modelo, opciones de un select que no coinciden con el `choices` del backend.
- **Señalar y preguntar antes de tocar** (Principio de no sorpresa — código legado usado de forma consistente en ese archivo): `@Input()`/`@Output()` clásicos, `BehaviorSubject` como store, header de diálogo con degradado, botón de guardar deshabilitado con `formularioInvalido()`. Agrupar todos estos en **una sola pregunta al usuario** (no una por hallazgo): migrar ahora o dejar para después.

## Paso 4 — Reportar y aplicar

Presentar una lista corta agrupada en "Corregido" y "Señalado, pendiente de tu decisión" (archivo:línea + 1 línea de motivo cada uno). Aplicar solo lo clasificado como corrección directa en el Paso 3; lo señalado espera la respuesta del usuario antes de tocarse.

## Paso 5 — No commitear

Esta skill solo deja el working tree modificado. Generar el commit es un paso aparte y explícito, siguiendo `docs/desarrollo/COMMIT_CONVENTION.md` — no asumir que el usuario quiere commitear solo porque pidió una revisión.
