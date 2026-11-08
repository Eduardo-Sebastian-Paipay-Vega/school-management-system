"""Convert a practical subset of Markdown into a Word document.

Usage: python md_a_docx.py input.md output.docx
Dependency: python-docx (install separately; this script changes no project deps).
"""
import re
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Pt, RGBColor

LINK = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
INLINE = re.compile(r"(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)")
TABLE = re.compile(r"^\s*\|(.+)\|\s*$")
SEPARATOR = re.compile(r"^\s*\|?[-:|\s]+\|?\s*$")
HEADING = re.compile(r"^(#{1,4})\s+(.*)$")
QUOTE = re.compile(r"^>\s?(.*)$")
NUMBER = re.compile(r"^(\s*)\d+\.\s+(.*)$")
BULLET = re.compile(r"^(\s*)[-*]\s+(.*)$")


def add_inline(paragraph, value):
    value = LINK.sub(lambda m: f"{m.group(1)} ({m.group(2)})" if m.group(2).startswith("http") else m.group(1), value)
    for part in INLINE.split(value):
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            paragraph.add_run(part[2:-2]).bold = True
        elif part.startswith("*") and part.endswith("*"):
            paragraph.add_run(part[1:-1]).italic = True
        elif part.startswith("`") and part.endswith("`"):
            run = paragraph.add_run(part[1:-1])
            run.font.name = "Consolas"
            run.font.size = Pt(10)
        else:
            paragraph.add_run(part)


def add_table(doc, lines):
    rows = [[cell.strip() for cell in line.strip().strip("|").split("|")] for line in lines]
    table = doc.add_table(rows=len(rows), cols=len(rows[0]))
    table.style = "Table Grid"
    for ri, row in enumerate(rows):
        for ci, value in enumerate(row):
            cell = table.cell(ri, ci)
            cell.text = ""
            add_inline(cell.paragraphs[0], value)
            if ri == 0:
                for run in cell.paragraphs[0].runs:
                    run.bold = True
                props = cell._tc.get_or_add_tcPr()
                props.append(props.makeelement(qn("w:shd"), {qn("w:val"): "clear", qn("w:fill"): "D9E2F3"}))
    doc.add_paragraph()


def convert(source: Path, target: Path):
    lines = source.read_text(encoding="utf-8").splitlines()
    doc = Document()
    for name, size in (("Heading 1", 18), ("Heading 2", 15), ("Heading 3", 13), ("Title", 24)):
        doc.styles[name].font.color.rgb = RGBColor(0x1F, 0x3A, 0x5F)
        doc.styles[name].font.size = Pt(size)
    doc.styles["Normal"].font.name = "Calibri"
    doc.styles["Normal"].font.size = Pt(11)

    paragraph_buffer, code_buffer, table_buffer = [], [], []
    in_code = False
    mermaid = False

    def flush_paragraph():
        if paragraph_buffer:
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            add_inline(p, " ".join(paragraph_buffer))
            paragraph_buffer.clear()

    i = 0
    while i < len(lines):
        line = lines[i]
        if line.strip().startswith("```"):
            flush_paragraph()
            if not in_code:
                in_code = True
                mermaid = "mermaid" in line.lower()
                if mermaid:
                    doc.add_paragraph("[Diagrama disponible en la versión digital; Word no representa Mermaid.]", style="Quote")
            else:
                if code_buffer and not mermaid:
                    p = doc.add_paragraph()
                    run = p.add_run("\n".join(code_buffer))
                    run.font.name = "Consolas"
                    run.font.size = Pt(9)
                code_buffer.clear()
                in_code = mermaid = False
            i += 1
            continue
        if in_code:
            if not mermaid:
                code_buffer.append(line)
            i += 1
            continue
        if TABLE.match(line):
            flush_paragraph()
            if i + 1 < len(lines) and SEPARATOR.match(lines[i + 1]) and "|" in lines[i + 1]:
                table_buffer = [line]
                i += 2
                while i < len(lines) and TABLE.match(lines[i]):
                    table_buffer.append(lines[i])
                    i += 1
                add_table(doc, table_buffer)
                continue
        heading = HEADING.match(line)
        if heading:
            flush_paragraph()
            level = len(heading.group(1))
            style = "Title" if level == 1 else f"Heading {level - 1}"
            add_inline(doc.add_paragraph(style=style), heading.group(2))
        elif QUOTE.match(line):
            flush_paragraph()
            add_inline(doc.add_paragraph(style="Quote"), QUOTE.match(line).group(1))
        elif BULLET.match(line) or NUMBER.match(line):
            flush_paragraph()
            match = BULLET.match(line) or NUMBER.match(line)
            numbered = bool(NUMBER.match(line))
            depth = min(len(match.group(1)) // 2, 2)
            base = "List Number" if numbered else "List Bullet"
            style = base if depth == 0 else f"{base} {depth + 1}"
            try:
                p = doc.add_paragraph(style=style)
            except KeyError:
                p = doc.add_paragraph(style=base)
            add_inline(p, match.group(2))
        elif line.strip() in ("---", "***", "___"):
            flush_paragraph()
        elif not line.strip():
            flush_paragraph()
        else:
            paragraph_buffer.append(line.strip())
        i += 1
    flush_paragraph()
    if code_buffer and not mermaid:
        p = doc.add_paragraph()
        run = p.add_run("\n".join(code_buffer))
        run.font.name = "Consolas"
        run.font.size = Pt(9)
    target.parent.mkdir(parents=True, exist_ok=True)
    doc.save(target)


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Uso: python md_a_docx.py <entrada.md> <salida.docx>")
    source, target = map(Path, sys.argv[1:])
    if not source.is_file():
        raise SystemExit(f"No existe el archivo de entrada: {source}")
    if source.resolve() == target.resolve():
        raise SystemExit("La entrada y la salida deben ser archivos distintos.")
    convert(source, target)
    print(f"Generado: {target}")


if __name__ == "__main__":
    main()
