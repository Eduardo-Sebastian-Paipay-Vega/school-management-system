"""Convierte un manual en Markdown (docs/manuales/*.md) a un documento Word
(.docx), sin depender de pandoc (no está instalado en esta máquina — ver
SKILL.md). Soporta el subconjunto de Markdown que ya usan las guías de
docs/manuales: encabezados #-####, párrafos, listas con viñeta y numeradas
(con anidamiento por indentación), tablas, citas ">", bloques de código
(los ```mermaid se reemplazan por un aviso: Word no renderiza diagramas
Mermaid), negrita/cursiva/código en línea y enlaces [texto](url).

Uso:
    python md_a_docx.py <entrada.md> <salida.docx>

No busca ser un parser de Markdown completo (no maneja tablas con celdas
que abarcan varias columnas, listas de definición, HTML embebido, etc.) —
alcanza para el estilo de documento ya usado en este repositorio. Si el
manual de turno usa algo que no cubre este script, es más simple ajustar el
.md antes de convertir que ampliar el parser.
"""

import re
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Pt, RGBColor

COLOR_TITULO = RGBColor(0x1F, 0x3A, 0x5F)
COLOR_ENLACE = RGBColor(0x1F, 0x5F, 0x8B)

PATRON_ENLACE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
PATRON_INLINE = re.compile(r"(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)")
PATRON_FILA_TABLA = re.compile(r"^\s*\|(.+)\|\s*$")
PATRON_SEPARADOR_TABLA = re.compile(r"^\s*\|?[\s:|-]+\|?\s*$")
PATRON_VINETA = re.compile(r"^(\s*)[-*]\s+(.*)$")
PATRON_NUMERADA = re.compile(r"^(\s*)\d+\.\s+(.*)$")
PATRON_ENCABEZADO = re.compile(r"^(#{1,4})\s+(.*)$")
PATRON_CITA = re.compile(r"^>\s?(.*)$")


def _agregar_runs_inline(parrafo, texto):
    """Aplica **negrita**, *cursiva*, `código` y [texto](url) dentro de un
    párrafo ya creado — separado de la lógica de bloque (listas/tablas/
    encabezados) para no repetirlo en cada tipo de elemento."""
    resto = PATRON_ENLACE.sub(lambda m: f"{m.group(1)} ({m.group(2)})" if m.group(2).startswith("http") else m.group(1), texto)
    for fragmento in PATRON_INLINE.split(resto):
        if not fragmento:
            continue
        if fragmento.startswith("**") and fragmento.endswith("**"):
            run = parrafo.add_run(fragmento[2:-2])
            run.bold = True
        elif fragmento.startswith("*") and fragmento.endswith("*"):
            run = parrafo.add_run(fragmento[1:-1])
            run.italic = True
        elif fragmento.startswith("`") and fragmento.endswith("`"):
            run = parrafo.add_run(fragmento[1:-1])
            run.font.name = "Consolas"
            run.font.size = Pt(10)
        else:
            parrafo.add_run(fragmento)


def _celda_sin_bordes_extra(celda):
    """python-docx no trae un helper directo para pintar el fondo de una
    celda de cabecera — se arma el XML mínimo (`w:shd`) a mano."""
    sombreado = celda._tc.get_or_add_tcPr()
    fondo = sombreado.makeelement(qn("w:shd"), {qn("w:val"): "clear", qn("w:fill"): "D9E2F3"})
    sombreado.append(fondo)


def _convertir_tabla(doc, filas_md):
    filas = [f.strip("|").split("|") for f in filas_md]
    filas = [[celda.strip() for celda in fila] for fila in filas]
    tabla = doc.add_table(rows=len(filas), cols=len(filas[0]))
    tabla.style = "Table Grid"
    for indice_fila, fila in enumerate(filas):
        for indice_col, texto in enumerate(fila):
            celda = tabla.cell(indice_fila, indice_col)
            celda.text = ""
            parrafo = celda.paragraphs[0]
            _agregar_runs_inline(parrafo, texto)
            if indice_fila == 0:
                for run in parrafo.runs:
                    run.bold = True
                _celda_sin_bordes_extra(celda)
    doc.add_paragraph()


def _estilo_titulo(doc):
    estilos = doc.styles
    for nombre, tamano in [("Heading 1", 18), ("Heading 2", 15), ("Heading 3", 13), ("Title", 24)]:
        try:
            fuente = estilos[nombre].font
            fuente.color.rgb = COLOR_TITULO
            fuente.size = Pt(tamano)
        except KeyError:
            continue
    estilos["Normal"].font.name = "Calibri"
    estilos["Normal"].font.size = Pt(11)


def convertir(ruta_md: Path, ruta_docx: Path) -> None:
    lineas = ruta_md.read_text(encoding="utf-8").splitlines()
    doc = Document()
    _estilo_titulo(doc)

    dentro_de_codigo = False
    es_mermaid = False
    buffer_tabla: list[str] = []
    # Markdown solo corta un párrafo en una línea en blanco — líneas de texto
    # plano consecutivas (el reflow habitual a ~90 columnas de estas guías)
    # son UN párrafo lógico, no uno por línea física. Se acumulan acá y se
    # vacían como un solo `add_paragraph()` en cuanto aparece una línea en
    # blanco o arranca otro tipo de bloque (encabezado, lista, tabla...).
    buffer_parrafo: list[str] = []

    def vaciar_parrafo():
        if not buffer_parrafo:
            return
        parrafo = doc.add_paragraph()
        parrafo.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        _agregar_runs_inline(parrafo, " ".join(buffer_parrafo))
        buffer_parrafo.clear()

    indice = 0
    while indice < len(lineas):
        linea = lineas[indice]

        if linea.strip().startswith("```"):
            vaciar_parrafo()
            if not dentro_de_codigo:
                dentro_de_codigo = True
                es_mermaid = "mermaid" in linea.strip().lower()
                if es_mermaid:
                    aviso = doc.add_paragraph()
                    run = aviso.add_run("[Diagrama disponible en la versión digital de esta guía — no se muestra en el documento Word.]")
                    run.italic = True
            else:
                dentro_de_codigo = False
                es_mermaid = False
            indice += 1
            continue

        if dentro_de_codigo:
            if not es_mermaid:
                parrafo = doc.add_paragraph()
                run = parrafo.add_run(linea if linea else " ")
                run.font.name = "Consolas"
                run.font.size = Pt(9.5)
            indice += 1
            continue

        if PATRON_FILA_TABLA.match(linea):
            vaciar_parrafo()
            buffer_tabla = [linea]
            indice += 1
            if indice < len(lineas) and PATRON_SEPARADOR_TABLA.match(lineas[indice]) and "|" in lineas[indice]:
                indice += 1
                while indice < len(lineas) and PATRON_FILA_TABLA.match(lineas[indice]):
                    buffer_tabla.append(lineas[indice])
                    indice += 1
                _convertir_tabla(doc, buffer_tabla)
                buffer_tabla = []
                continue
            # No era una tabla real (sin fila separadora) — se procesa como
            # párrafo normal, sin perder la línea ya leída.
            indice -= 1

        encabezado = PATRON_ENCABEZADO.match(linea)
        if encabezado:
            vaciar_parrafo()
            nivel = len(encabezado.group(1))
            estilo = "Title" if nivel == 1 else f"Heading {nivel - 1}"
            parrafo = doc.add_paragraph(style=estilo)
            _agregar_runs_inline(parrafo, encabezado.group(2))
            indice += 1
            continue

        cita = PATRON_CITA.match(linea)
        if cita:
            vaciar_parrafo()
            parrafo = doc.add_paragraph()
            parrafo.paragraph_format.left_indent = Pt(24)
            run = parrafo.add_run(cita.group(1))
            run.italic = True
            run.font.color.rgb = RGBColor(0x55, 0x55, 0x55)
            indice += 1
            continue

        vineta = PATRON_VINETA.match(linea)
        if vineta:
            vaciar_parrafo()
            nivel = min(len(vineta.group(1)) // 2, 2)
            estilo = "List Bullet" if nivel == 0 else f"List Bullet {nivel + 1}"
            try:
                parrafo = doc.add_paragraph(style=estilo)
            except KeyError:
                parrafo = doc.add_paragraph(style="List Bullet")
            _agregar_runs_inline(parrafo, vineta.group(2))
            indice += 1
            continue

        numerada = PATRON_NUMERADA.match(linea)
        if numerada:
            vaciar_parrafo()
            nivel = min(len(numerada.group(1)) // 2, 2)
            estilo = "List Number" if nivel == 0 else f"List Number {nivel + 1}"
            try:
                parrafo = doc.add_paragraph(style=estilo)
            except KeyError:
                parrafo = doc.add_paragraph(style="List Number")
            _agregar_runs_inline(parrafo, numerada.group(2))
            indice += 1
            continue

        if linea.strip() in ("---", "***", "___"):
            vaciar_parrafo()
            indice += 1
            continue

        if not linea.strip():
            vaciar_parrafo()
            indice += 1
            continue

        # Línea de texto plano: se acumula, no se emite todavía (ver
        # `buffer_parrafo` arriba) — así varias líneas físicas seguidas
        # quedan en un solo párrafo de Word, igual que en Markdown.
        buffer_parrafo.append(linea.strip())
        indice += 1

    vaciar_parrafo()  # por si el archivo no termina con una línea en blanco
    ruta_docx.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(ruta_docx))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python md_a_docx.py <entrada.md> <salida.docx>")
        sys.exit(1)
    entrada = Path(sys.argv[1])
    salida = Path(sys.argv[2])
    if not entrada.exists():
        print(f"No existe el archivo de entrada: {entrada}")
        sys.exit(1)
    convertir(entrada, salida)
    print(f"Generado: {salida}")
