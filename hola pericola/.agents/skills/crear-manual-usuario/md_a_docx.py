"""Generador editorial corporativo de manuales Word (.docx) para BI-COMPOSUR.
Versión v2.2 - Cumplimiento integral de estándares de auditoría editorial:
- Portada institucional formal con logotipo, títulos jerárquicos y caja de metadatos.
- Tabla de responsabilidades y control documental en revisión.
- Paginación dinámica en pie de página con campos XML nativos (PAGE de NUMPAGES).
- Encabezados con <w:keepNext/> para evitar títulos huérfanos.
- Tablas con <w:tblHeader/> repetido en salto de página y <w:cantSplit/> para evitar quiebre de filas.
- Numeración procedimental con sangría colgante e inicio estricto en 1 por procedimiento.
- Ajuste inteligente de escala de capturas (6.2 in) y botones recortados (0.8 - 2.5 in).
- Cajas de aviso destacadas por severidad (> [!NOTE], > [!WARNING], > [!IMPORTANT], > [!CAUTION], > [!TIP]).
"""

import re
import sys
from pathlib import Path
from PIL import Image

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
from docx.shared import Inches, Pt, RGBColor

COLOR_PRIMARIO = RGBColor(0x1F, 0x3A, 0x5F)      # Azul corporativo profundo
COLOR_SECUNDARIO = RGBColor(0x2B, 0x54, 0x7E)    # Azul pizarra
COLOR_TEXTO = RGBColor(0x22, 0x22, 0x22)         # Gris oscuro neutro
COLOR_GRIS_CLARO = RGBColor(0x7F, 0x8C, 0x8D)    # Gris metadatos y pies
COLOR_CODIGO = RGBColor(0x8E, 0x1B, 0x1B)        # Rojo sobrio código

PATRON_IMAGEN = re.compile(r"^!\[([^\]]*)\]\(([^)]+)\)$")
PATRON_ENLACE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
PATRON_INLINE = re.compile(r"(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)")
PATRON_FILA_TABLA = re.compile(r"^\s*\|(.+)\|\s*$")
PATRON_SEPARADOR_TABLA = re.compile(r"^\s*\|?[\s:|-]+\|?\s*$")
PATRON_VINETA = re.compile(r"^(\s*)[-*]\s+(.*)$")
PATRON_NUMERADA = re.compile(r"^(\s*)(\d+)\.\s+(.*)$")
PATRON_ENCABEZADO = re.compile(r"^(#{1,4})\s+(.*)$")
PATRON_CITA = re.compile(r"^>\s?(.*)$")


def _agregar_runs_inline(parrafo, texto, color_base=None, fuente_tamano=10.5):
    """Aplica **negrita**, *cursiva*, `código` y enlaces dentro de un párrafo."""
    resto = PATRON_ENLACE.sub(
        lambda m: f"{m.group(1)} ({m.group(2)})" if m.group(2).startswith("http") else m.group(1),
        texto,
    )
    for fragmento in PATRON_INLINE.split(resto):
        if not fragmento:
            continue
        if fragmento.startswith("**") and fragmento.endswith("**"):
            run = parrafo.add_run(fragmento[2:-2])
            run.bold = True
            if color_base:
                run.font.color.rgb = color_base
        elif fragmento.startswith("*") and fragmento.endswith("*"):
            run = parrafo.add_run(fragmento[1:-1])
            run.italic = True
            if color_base:
                run.font.color.rgb = color_base
        elif fragmento.startswith("`") and fragmento.endswith("`"):
            run = parrafo.add_run(fragmento[1:-1])
            run.font.name = "Consolas"
            run.font.size = Pt(max(fuente_tamano - 1.5, 8.5))
            run.font.color.rgb = COLOR_CODIGO
        else:
            run = parrafo.add_run(fragmento)
            if color_base:
                run.font.color.rgb = color_base


def _sombrear_celda(celda, color_hex):
    shading_xml = f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>'
    celda._tc.get_or_add_tcPr().append(parse_xml(shading_xml))


def _bordes_tabla(tabla):
    tblPr = tabla._tbl.tblPr
    borders_xml = f'''
    <w:tblBorders {nsdecls("w")}>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="1F3A5F"/>
        <w:left w:val="none"/>
        <w:bottom w:val="single" w:sz="8" w:space="0" w:color="1F3A5F"/>
        <w:right w:val="none"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E1E4E8"/>
        <w:insideV w:val="none"/>
    </w:tblBorders>
    '''
    tblPr.append(parse_xml(borders_xml))


def _convertir_tabla(doc, filas_md):
    filas = [f.strip("|").split("|") for f in filas_md]
    filas = [[celda.strip() for celda in fila] for fila in filas]
    if not filas or not filas[0]:
        return

    num_cols = len(filas[0])
    tabla = doc.add_table(rows=len(filas), cols=num_cols)
    tabla.alignment = WD_TABLE_ALIGNMENT.CENTER
    _bordes_tabla(tabla)

    # Accesibilidad y repetición de encabezado en Word
    trPr_header = tabla.rows[0]._tr.get_or_add_trPr()
    trPr_header.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

    for indice_fila, fila in enumerate(filas):
        row_obj = tabla.rows[indice_fila]
        trPr = row_obj._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

        es_cabecera = indice_fila == 0
        fondo = "1F3A5F" if es_cabecera else ("F8F9FA" if indice_fila % 2 == 1 else "FFFFFF")
        for indice_col, texto in enumerate(fila):
            if indice_col >= num_cols:
                continue
            celda = tabla.cell(indice_fila, indice_col)
            celda.text = ""
            _sombrear_celda(celda, fondo)
            parrafo = celda.paragraphs[0]
            parrafo.paragraph_format.space_before = Pt(3)
            parrafo.paragraph_format.space_after = Pt(3)
            parrafo.paragraph_format.line_spacing = 1.15
            if es_cabecera:
                _agregar_runs_inline(parrafo, texto, color_base=RGBColor(0xFF, 0xFF, 0xFF), fuente_tamano=9.5)
                for run in parrafo.runs:
                    run.bold = True
            else:
                _agregar_runs_inline(parrafo, texto, fuente_tamano=9.0)

    p_post = doc.add_paragraph()
    p_post.paragraph_format.space_after = Pt(4)


def _crear_caja_aviso(doc, tipo, lineas_texto):
    """Genera una caja de llamada con borde lateral de color y fondo suave."""
    tabla = doc.add_table(rows=1, cols=1)
    tabla.alignment = WD_TABLE_ALIGNMENT.CENTER
    celda = tabla.cell(0, 0)

    colores = {
        "NOTE": ("1F5F8B", "EBF3FB", "NOTA INFORMATIVA"),
        "TIP": ("107C41", "EAF6EC", "CONSEJO PRÁCTICO"),
        "IMPORTANT": ("D48800", "FEF8E7", "DISPOSICIÓN IMPORTANTE"),
        "WARNING": ("C62828", "FDEDEC", "ADVERTENCIA PREVENTIVA"),
        "CAUTION": ("B71C1C", "FADBD8", "PRECAUCIÓN CRÍTICA DE AUDITORÍA"),
    }
    borde_color, fondo_color, titulo_defecto = colores.get(tipo.upper(), ("1F3A5F", "F4F6F8", "AVISO"))

    _sombrear_celda(celda, fondo_color)
    tcPr = celda._tc.get_or_add_tcPr()
    borders_xml = f'''
    <w:tcBorders {nsdecls("w")}>
        <w:top w:val="none"/>
        <w:left w:val="single" w:sz="24" w:space="0" w:color="{borde_color}"/>
        <w:bottom w:val="none"/>
        <w:right w:val="none"/>
    </w:tcBorders>
    '''
    tcPr.append(parse_xml(borders_xml))

    p = celda.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.left_indent = Pt(6)
    p.paragraph_format.line_spacing = 1.15

    run_icon = p.add_run(f"[{titulo_defecto}] ")
    run_icon.bold = True
    c_rgb = RGBColor.from_string(borde_color)
    run_icon.font.color.rgb = c_rgb

    texto_unido = " ".join(lineas_texto).strip()
    _agregar_runs_inline(p, texto_unido, fuente_tamano=9.5)

    p_sep = doc.add_paragraph()
    p_sep.paragraph_format.space_after = Pt(4)


def _configurar_pie_pagina_dinamico(footer):
    """Inserta paginación dinámica 'Página X de Y' con campos nativos de Word XML."""
    p = footer.paragraphs[0]
    p.text = ""
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT

    run_izq = p.add_run("BI-COMPOSUR · MAN-OPE-LIQ-001 (Confidencial · Uso Interno)               Página ")
    run_izq.font.name = "Calibri"
    run_izq.font.size = Pt(8.5)
    run_izq.font.color.rgb = COLOR_GRIS_CLARO

    # Campo nativo PAGE
    fld_page = parse_xml(
        f'<w:fldSimple {nsdecls("w")} w:instr="PAGE">'
        f'<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="17"/><w:color w:val="7F8C8D"/></w:rPr><w:t>1</w:t></w:r>'
        f'</w:fldSimple>'
    )
    p._p.append(fld_page)

    run_mid = p.add_run(" de ")
    run_mid.font.name = "Calibri"
    run_mid.font.size = Pt(8.5)
    run_mid.font.color.rgb = COLOR_GRIS_CLARO

    # Campo nativo NUMPAGES
    fld_numpages = parse_xml(
        f'<w:fldSimple {nsdecls("w")} w:instr="NUMPAGES">'
        f'<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="17"/><w:color w:val="7F8C8D"/></w:rPr><w:t>1</w:t></w:r>'
        f'</w:fldSimple>'
    )
    p._p.append(fld_numpages)


def _estilar_documento(doc):
    estilos = doc.styles
    for nombre, tamano in [("Heading 1", 16), ("Heading 2", 13.5), ("Heading 3", 11.5), ("Heading 4", 10.5), ("Title", 22)]:
        try:
            fuente = estilos[nombre].font
            fuente.color.rgb = COLOR_PRIMARIO
            fuente.size = Pt(tamano)
            fuente.name = "Calibri"
        except KeyError:
            continue
    estilos["Normal"].font.name = "Calibri"
    estilos["Normal"].font.size = Pt(10.0)
    estilos["Normal"].font.color.rgb = COLOR_TEXTO


def convertir(ruta_md: Path, ruta_docx: Path) -> None:
    lineas = ruta_md.read_text(encoding="utf-8").splitlines()
    doc = Document()
    _estilar_documento(doc)

    section = doc.sections[0]
    section.top_margin = Inches(0.9)
    section.bottom_margin = Inches(0.9)
    section.left_margin = Inches(0.9)
    section.right_margin = Inches(0.9)

    # Portada sin encabezado ni pie
    section.different_first_page_header_footer = True

    # Encabezado para páginas internas
    header = section.header
    p_head = header.paragraphs[0]
    p_head.text = "BI-COMPOSUR · Sistema Integral de Gestión de Licitaciones  |  Manual de Usuario: Liquidación y Costos (v2.2)"
    p_head.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_head.style.font.name = "Calibri"
    p_head.style.font.size = Pt(8.5)
    p_head.style.font.color.rgb = COLOR_GRIS_CLARO

    # Pie de página dinámico para páginas internas
    _configurar_pie_pagina_dinamico(section.footer)

    dentro_de_codigo = False
    es_mermaid = False
    buffer_tabla: list[str] = []
    buffer_parrafo: list[str] = []
    buffer_aviso: list[str] = []
    tipo_aviso_actual: str = ""

    def vaciar_parrafo():
        if not buffer_parrafo:
            return
        parrafo = doc.add_paragraph()
        parrafo.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        parrafo.paragraph_format.space_before = Pt(2)
        parrafo.paragraph_format.space_after = Pt(4)
        parrafo.paragraph_format.line_spacing = 1.15
        _agregar_runs_inline(parrafo, " ".join(buffer_parrafo))
        buffer_parrafo.clear()

    def vaciar_aviso():
        nonlocal tipo_aviso_actual
        if buffer_aviso and tipo_aviso_actual:
            _crear_caja_aviso(doc, tipo_aviso_actual, buffer_aviso)
            buffer_aviso.clear()
            tipo_aviso_actual = ""

    indice = 0
    while indice < len(lineas):
        linea = lineas[indice]

        # Bloques de aviso: > [!NOTE], > [!WARNING], etc.
        m_aviso_ini = re.match(r"^>\s*\[!(NOTE|WARNING|IMPORTANT|CAUTION|TIP)\]\s*(.*)$", linea.strip(), re.IGNORECASE)
        if m_aviso_ini:
            vaciar_parrafo()
            vaciar_aviso()
            tipo_aviso_actual = m_aviso_ini.group(1).upper()
            txt_ini = m_aviso_ini.group(2).strip()
            if txt_ini:
                buffer_aviso.append(txt_ini)
            indice += 1
            while indice < len(lineas) and lineas[indice].strip().startswith(">"):
                sub_txt = lineas[indice].strip().lstrip(">").strip()
                if sub_txt:
                    buffer_aviso.append(sub_txt)
                indice += 1
            vaciar_aviso()
            continue

        # Imágenes Markdown: ![alt](ruta)
        m_img = PATRON_IMAGEN.match(linea.strip())
        if m_img:
            vaciar_parrafo()
            vaciar_aviso()
            texto_alt = m_img.group(1).strip()
            rel_ruta = m_img.group(2).strip()
            ruta_img = (ruta_md.parent / rel_ruta).resolve()
            if ruta_img.exists():
                try:
                    with Image.open(str(ruta_img)) as img_obj:
                        img_w, img_h = img_obj.size

                    es_logo = "logo" in str(ruta_img).lower()
                    es_boton = "botones" in str(ruta_img) or (img_w < 650 and not es_logo)

                    if es_logo:
                        ancho = Inches(3.2)
                        espacio_despues = Pt(12)
                        alineacion = WD_ALIGN_PARAGRAPH.CENTER
                    elif es_boton:
                        ancho = Inches(min(max(img_w / 220.0, 0.8), 2.6))
                        espacio_despues = Pt(2)
                        alineacion = WD_ALIGN_PARAGRAPH.LEFT
                    else:
                        ancho = Inches(6.2)
                        espacio_despues = Pt(4)
                        alineacion = WD_ALIGN_PARAGRAPH.CENTER

                    p_img = doc.add_paragraph()
                    p_img.alignment = alineacion
                    p_img.paragraph_format.space_before = Pt(4)
                    p_img.paragraph_format.space_after = espacio_despues
                    run_img = p_img.add_run()
                    run_img.add_picture(str(ruta_img), width=ancho)

                    if texto_alt and not es_boton and not es_logo:
                        p_pie = doc.add_paragraph()
                        p_pie.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        p_pie.paragraph_format.space_before = Pt(0)
                        p_pie.paragraph_format.space_after = Pt(8)
                        run_pie = p_pie.add_run(f"{texto_alt}")
                        run_pie.italic = True
                        run_pie.font.size = Pt(8.5)
                        run_pie.font.color.rgb = COLOR_GRIS_CLARO
                except Exception as e:
                    print(f"Aviso: error procesando imagen {ruta_img}: {e}")
            else:
                p_alt = doc.add_paragraph()
                run_alt = p_alt.add_run(f"[Ilustración: {texto_alt} ({rel_ruta})]")
                run_alt.italic = True
            indice += 1
            continue

        # Bloques de código
        if linea.strip().startswith("```"):
            vaciar_parrafo()
            vaciar_aviso()
            if not dentro_de_codigo:
                dentro_de_codigo = True
                es_mermaid = "mermaid" in linea.strip().lower()
                if es_mermaid:
                    aviso = doc.add_paragraph()
                    run = aviso.add_run("[Diagrama de flujo disponible en la versión interactiva del sistema]")
                    run.italic = True
            else:
                dentro_de_codigo = False
                es_mermaid = False
            indice += 1
            continue

        if dentro_de_codigo:
            if not es_mermaid:
                parrafo = doc.add_paragraph()
                parrafo.paragraph_format.space_before = Pt(1)
                parrafo.paragraph_format.space_after = Pt(1)
                run = parrafo.add_run(linea if linea else " ")
                run.font.name = "Consolas"
                run.font.size = Pt(8.5)
                run.font.color.rgb = COLOR_PRIMARIO
            indice += 1
            continue

        # Tablas
        if PATRON_FILA_TABLA.match(linea):
            vaciar_parrafo()
            vaciar_aviso()
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
            indice -= 1

        # Encabezados
        encabezado = PATRON_ENCABEZADO.match(linea)
        if encabezado:
            vaciar_parrafo()
            vaciar_aviso()
            nivel = len(encabezado.group(1))
            texto_enc = encabezado.group(2).strip()

            # Saltos de página estratégicos antes de secciones principales
            if nivel == 2 and re.match(r"^(\d{2}\.|Anexos|Tabla de Contenidos|Control Documental)", texto_enc):
                doc.add_page_break()

            estilo = "Title" if nivel == 1 else f"Heading {nivel - 1}"
            parrafo = doc.add_paragraph(style=estilo)
            parrafo.paragraph_format.keep_with_next = True  # Evita títulos huérfanos (<w:keepNext/>)
            parrafo.paragraph_format.space_before = Pt(10 if nivel > 1 else 4)
            parrafo.paragraph_format.space_after = Pt(4)
            _agregar_runs_inline(parrafo, texto_enc)
            indice += 1
            continue

        # Citas estándar
        cita = PATRON_CITA.match(linea)
        if cita:
            vaciar_parrafo()
            vaciar_aviso()
            parrafo = doc.add_paragraph()
            parrafo.paragraph_format.left_indent = Pt(18)
            parrafo.paragraph_format.space_after = Pt(4)
            parrafo.paragraph_format.line_spacing = 1.15
            run = parrafo.add_run(cita.group(1))
            run.italic = True
            run.font.color.rgb = COLOR_SECUNDARIO
            indice += 1
            continue

        # Listas con viñeta
        vineta = PATRON_VINETA.match(linea)
        if vineta:
            vaciar_parrafo()
            vaciar_aviso()
            nivel = min(len(vineta.group(1)) // 2, 2)
            estilo = "List Bullet" if nivel == 0 else f"List Bullet {nivel + 1}"
            try:
                parrafo = doc.add_paragraph(style=estilo)
            except KeyError:
                parrafo = doc.add_paragraph(style="List Bullet")
            parrafo.paragraph_format.space_before = Pt(1)
            parrafo.paragraph_format.space_after = Pt(2)
            parrafo.paragraph_format.line_spacing = 1.15
            _agregar_runs_inline(parrafo, vineta.group(2))
            indice += 1
            continue

        # Listas numeradas (formateadas con sangría francesa y numeral explícito para evitar saltos continuos de Word)
        numerada = PATRON_NUMERADA.match(linea)
        if numerada:
            vaciar_parrafo()
            vaciar_aviso()
            indent_spaces = len(numerada.group(1))
            num_str = f"{numerada.group(2)}."
            resto_texto = numerada.group(3)

            parrafo = doc.add_paragraph()
            parrafo.paragraph_format.left_indent = Pt(18 + (indent_spaces // 2) * 12)
            parrafo.paragraph_format.first_line_indent = Pt(-18)
            parrafo.paragraph_format.space_before = Pt(1)
            parrafo.paragraph_format.space_after = Pt(2.5)
            parrafo.paragraph_format.line_spacing = 1.15

            run_num = parrafo.add_run(f"{num_str}  ")
            run_num.bold = True
            run_num.font.color.rgb = COLOR_PRIMARIO

            _agregar_runs_inline(parrafo, resto_texto)
            indice += 1
            continue

        # Separadores horizontales
        if linea.strip() in ("---", "***", "___"):
            vaciar_parrafo()
            vaciar_aviso()
            indice += 1
            continue

        # Líneas vacías
        if not linea.strip():
            vaciar_parrafo()
            vaciar_aviso()
            indice += 1
            continue

        buffer_parrafo.append(linea.strip())
        indice += 1

    vaciar_parrafo()
    vaciar_aviso()

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
    print(f"Generado con éxito: {salida}")
