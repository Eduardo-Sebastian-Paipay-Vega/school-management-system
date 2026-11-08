---
name: crear-manual-usuario
description: Redacta una guía no técnica para el usuario final y, después de su aprobación, la convierte a Word. Se invoca manualmente al pedir un manual o instructivo y nunca se dispara sola.
---

# Crear manual de usuario final

`docs/manuales/` ya tiene guías integrales (`GUIA_MODULO_*.md`) que mezclan
manual de usuario **y** documentación técnica para desarrollo/soporte (ver
`GUIA_MODULO_ORDENES_COMPRA_OCAM.md`, que lo declara explícito: "secciones 2
a 9 son el manual para usuarios... secciones 10 a 14 explican la
implementación"). Esta skill existe para el caso distinto: un documento que
se **entrega tal cual al cliente/usuario final**, sin nada de eso — sin
rutas de archivo, sin clases, sin endpoints, sin nombres de tabla ni de
modelo, sin diagramas Mermaid (Word no los renderiza). Por eso no reutiliza
ni edita las guías `GUIA_MODULO_*.md` existentes: genera un archivo nuevo,
con un prefijo distinto (`GUIA_USUARIO_<MODULO>.md`), para no confundir un
documento con el otro ni pisar la guía técnica que el equipo ya mantiene.

Flujo en dos fases, con una pausa real entre medio — no se generan ambos
archivos de una sola pasada:

1. **Redactar el `.md`** y mostrárselo al usuario para que lo revise.
2. Solo si el usuario confirma (puede pedir cambios antes), **convertir a
   `.docx`** con el script incluido en esta skill.

No hay `pandoc` instalado en esta máquina (verificado) — la fase 2 usa
`md_a_docx.py`, un conversor propio basado en `python-docx` (si tampoco
está instalado, `pip install python-docx`) empaquetado junto a este
`SKILL.md`. No es un parser de Markdown completo: cubre encabezados
`#`-`####`, párrafos, listas con viñeta/numeradas (con un nivel de
anidamiento), tablas, citas `>`, negrita/cursiva/código en línea, enlaces y
bloques de código — que es exactamente el subconjunto que ya usan las guías
de este repositorio. Si hace falta algo más, es más simple ajustar el
resultado directamente en Word que ampliar el script.

## Paso 1 — Reunir el comportamiento real del módulo

Nunca redactar de memoria ni asumir. Antes de escribir una sola línea:

- Leer el componente Angular real del módulo (`.ts`/`.html`) — qué botones
  existen, qué modales abre cada uno, qué campos son obligatorios, qué
  mensajes de error o alertas muestra, qué pasa después de cada acción.
- Si ya existe una `GUIA_MODULO_<NOMBRE>.md` para ese módulo en
  `docs/manuales/`, leer sus secciones de usuario como referencia de
  comportamiento — pero no copiarlas ni traducirlas literalmente: están
  escritas para un lector con contexto técnico y esta guía es para alguien
  que nunca vio el código. Verificar igual contra el código actual: una
  guía existente puede haber quedado desactualizada.
- Si el módulo tiene reglas de negocio no obvias (ej. "Cancelada significa
  que ya se pagó, no que se anuló"), confirmarlas contra el código o
  preguntarle al usuario antes de explicarlas mal.

Si el pedido no especifica qué módulo, preguntar cuál antes de continuar —
no adivinar entre varios módulos posibles.

## Paso 2 — Redactar el `.md`

Reglas de tono y contenido, en este orden de prioridad:

- **Lenguaje cotidiano, sin jerga de sistema.** "La pantalla guarda la
  información" en vez de "el backend persiste el registro"; "escribe el
  código de la orden" en vez de "completa el campo `codigo_orden_compra`".
  Nunca nombrar clases, archivos, endpoints, tablas ni modelos — eso es
  exactamente lo que ya cubren las guías técnicas.
- **Pasos numerados para cada tarea**, en el orden real en que se hacen clic
  los botones — no una lista de funcionalidades sueltas.
- **Sin diagramas Mermaid.** Si una guía técnica de referencia tiene uno,
  describir el mismo flujo en un par de frases o en una lista de pasos.
- **Marcar dónde va una captura de pantalla real** con una línea propia:
  `[CAPTURA: descripción de qué debe mostrar]` — esta skill no genera
  imágenes; alguien las agrega a mano en Word antes de entregar el
  documento (o se le puede pedir a Codex por separado, como tarea aparte).
- **No hace falta escribir un índice a mano** — el conversor aplica los
  estilos `Heading` de Word a los encabezados, así que en Word alcanza con
  insertar una Tabla de Contenido automática (Referencias → Tabla de
  contenido) sobre el documento ya generado.

Estructura recomendada (ajustar según el módulo, no es un molde rígido):

```
# Guía de uso: <nombre del módulo, en el vocabulario del cliente>

Un párrafo breve: para qué sirve esta pantalla y quién la usa.

## Antes de empezar

Dónde se encuentra en el menú y qué permiso hace falta, en una frase.

## <Una sección H2 por pantalla o acción principal>

Qué se logra acá, en una frase. Luego los pasos:

1. Paso uno.
2. Paso dos.
   ...

[CAPTURA: pantalla de ejemplo de esta sección]

### Qué revisar antes de guardar (si aplica)

- Punto de atención 1.
- Punto de atención 2.

## Preguntas frecuentes (opcional, si el módulo lo amerita)

**¿Pregunta real que haría un usuario?**
Respuesta breve.
```

Guardar el resultado en `docs/manuales/GUIA_USUARIO_<NOMBRE_MODULO>.md`
(mismo estilo de nombre en mayúsculas que ya usan los `GUIA_MODULO_*.md`,
solo cambia el prefijo). Mostrarle al usuario un resumen de las secciones
escritas — no hace falta pegar el archivo completo en el chat si es largo —
y preguntar si lo aprueba o si hay que ajustar algo antes de seguir.

## Paso 3 — Confirmar antes de convertir

No generar el `.docx` automáticamente apenas se termina el `.md`. Esperar
una confirmación explícita del usuario (o un pedido de cambios, que vuelve
al paso 2). Es una pausa real: cambiar de opinión sobre el `.md` después de
convertido implica repetir la conversión, así que vale la pena revisar
antes.

## Paso 4 — Generar el `.docx`

Con el `.md` ya aprobado:

```powershell
python ".agents/skills/crear-manual-usuario/md_a_docx.py" "docs/manuales/GUIA_USUARIO_<NOMBRE_MODULO>.md" "docs/manuales/GUIA_USUARIO_<NOMBRE_MODULO>.docx"
```

Si el comando falla por `ModuleNotFoundError: docx`, instalar la dependencia
(`pip install python-docx`) y reintentar — no reescribir el conversor para
evitar la dependencia.

Confirmar que el archivo se generó (el script imprime la ruta final) y
avisarle al usuario dónde quedó. Recordarle, si el `.md` tenía marcadores
`[CAPTURA: ...]`, que el Word generado los deja como texto plano entre
corchetes — hay que reemplazarlos a mano por las imágenes reales antes de
entregar el documento.

## Qué no hace esta skill

- No commitea nada — ver la regla general del proyecto: nunca commitear sin
  que el usuario lo pida explícitamente.
- No le pone logo, portada ni membrete de Compusur al Word: genera un
  documento limpio y editable: cualquier identidad visual final se agrega a
  mano en Word antes de entregarlo.
- No reemplaza ni recorta las guías técnicas `GUIA_MODULO_*.md` — son
  documentos con audiencias distintas y ambos se conservan.
