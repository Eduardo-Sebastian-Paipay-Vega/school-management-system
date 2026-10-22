#!/usr/bin/env python3
"""Linter de fichas RF (plantilla RF v2.0).

Uso:
  python -I lint_rf.py <ficha.md | carpeta> [...] [--verbose]

Comprueba estructura, identificadores, contrato PRE/POST, cobertura de
excepciones y términos ambiguos. No valida que las reglas sean correctas
para el negocio. Con carpetas revisa todos los RF-*.md que contengan.

Salida: 0 sin errores, 1 con errores, 2 uso incorrecto.
"""
from __future__ import annotations

import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

REQUIRED_HEADINGS = [
    "## 1. Identificación",
    "## 2. Especificación funcional",
    "### 2.1 Enunciado normativo",
    "### 2.2 Descripción",
    "### 2.3 Objetivo de negocio",
    "### 2.4 Actores",
    "### 2.5 Disparador",
    "### 2.6 Alcance",
    "## 3. Contrato de ejecución",
    "### 3.1 Precondiciones",
    "### 3.2 Entradas",
    "### 3.3 Salidas",
    "### 3.4 Postcondiciones",
    "## 4. Comportamiento",
    "### 4.1 Flujo principal",
    "### 4.2 Flujos alternativos",
    "### 4.3 Excepciones",
    "### 4.4 Reglas de negocio",
    "### 4.5 Validaciones",
    "## 5. Verificación",
    "### 5.1 Criterios de aceptación",
    "### 5.2 Matriz de cobertura",
    "### 5.3 Casos de prueba y evidencias",
    "## 6. Gobernanza",
    "### 6.1 Dependencias",
    "### 6.2 RNF vinculados",
    "### 6.3 Trazabilidad",
    "### 6.4 Decisiones pendientes",
    "### 6.5 Historial de cambios",
]
# Secciones que la ficha reducida puede declarar «No aplica».
OPTIONAL_IN_REDUCED = {
    "### 2.2 Descripción", "### 2.3 Objetivo de negocio", "### 2.6 Alcance",
    "### 3.3 Salidas", "### 4.2 Flujos alternativos", "### 4.4 Reglas de negocio",
    "### 4.5 Validaciones", "### 5.2 Matriz de cobertura", "### 5.3 Casos de prueba y evidencias",
    "### 6.1 Dependencias", "### 6.2 RNF vinculados", "### 6.4 Decisiones pendientes",
}
STATES = {"Borrador", "Propuesto", "Aprobado", "Implementado", "Verificado", "Aceptado", "Rechazado", "Obsoleto"}
PRIORITIES = {"Esencial", "Deseable", "Opcional"}
ID_FIELDS = ["ID", "Nombre", "Versión", "Estado", "Prioridad", "Módulo / submódulo", "Caso de uso"]
VAGUE = [
    "rápido", "rápida", "rápidamente", "lento", "eficiente", "eficientemente", "fácil", "fácilmente",
    "intuitivo", "intuitiva", "amigable", "robusto", "robusta", "flexible", "adecuado", "adecuada",
    "adecuadamente", "correctamente", "óptimo", "óptima", "moderno", "moderna", "etc", "y/o",
    "entre otros", "aproximadamente", "suficiente", "normalmente", "generalmente",
    "en lo posible", "cuando sea necesario",
]
VAGUE_RE = re.compile(r"(?<![\w/])(" + "|".join(re.escape(v) for v in VAGUE) + r")(?![\w/])", re.IGNORECASE)
DEF_RE = re.compile(r"\*\*((?:PRE|FA|EX|POST|DEP|RN-[A-Z]{2,4})-\d{2,})\b[^*]*:\*\*")
ROW_ID_RE = re.compile(r"^\|\s*((?:EN|SAL|VAL|DP)-\d{2,})\s*\|", re.MULTILINE)
CA_RE = re.compile(r"^\s*Escenario:\s*(CA-\d{2,})\b", re.MULTILINE)
PLACEHOLDER_RE = re.compile(r"<(?!!--)[^<>\n]{2,60}>|<!--")


@dataclass
class Result:
    path: Path
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    pending: int = 0
    kind: str = "?"


def sections(text: str) -> dict[str, str]:
    """Mapea cada encabezado requerido a su cuerpo (hasta el siguiente ## o ###)."""
    found: dict[str, str] = {}
    lines = text.splitlines()
    idx = [i for i, l in enumerate(lines) if re.match(r"^#{2,3} ", l)]
    for n, i in enumerate(idx):
        end = idx[n + 1] if n + 1 < len(idx) else len(lines)
        found[lines[i].strip()] = "\n".join(lines[i + 1:end]).strip()
    return found


def table_fields(body: str) -> dict[str, str]:
    out = {}
    for line in body.splitlines():
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) >= 2 and cells[0] not in ("Campo", "") and not set(cells[0]) <= set("-: "):
            out[cells[0]] = cells[1]
    return out


def lint_text(text: str, path: Path) -> Result:
    r = Result(path)
    match = re.search(r"^# (RF-\d{2,}): .+$", text, re.MULTILINE)
    if not match:
        r.errors.append("Falta el título '# RF-NN: <Título>'.")
        return r
    rf_id = match.group(1)
    text = text[match.start():]

    kind = re.search(r"\*\*Ficha:\*\*\s*(completa|reducida)", text, re.IGNORECASE)
    r.kind = kind.group(1).lower() if kind else "?"
    if not kind:
        r.errors.append("Falta la línea '> **Ficha:** completa|reducida'.")

    secs = sections(text)
    for heading in REQUIRED_HEADINGS:
        if heading not in secs:
            r.errors.append(f"Falta la sección '{heading}'.")
            continue
        body = secs[heading]
        if heading.startswith("## ") and heading != "## 1. Identificación":
            continue  # los bloques de nivel 2 agrupan subsecciones
        if not body:
            r.errors.append(f"Sección vacía: '{heading}'.")
        elif body.lower().startswith("no aplica"):
            if r.kind != "reducida" or heading not in OPTIONAL_IN_REDUCED:
                r.errors.append(f"'{heading}' no puede ser «No aplica» en una ficha {r.kind}.")

    ident = table_fields(secs.get("## 1. Identificación", ""))
    for name in ID_FIELDS:
        if not ident.get(name):
            r.errors.append(f"Identificación: falta el campo '{name}'.")
    if ident.get("ID") and ident["ID"] != rf_id:
        r.errors.append(f"Identificación: ID '{ident['ID']}' no coincide con el título '{rf_id}'.")
    if ident.get("Estado") and ident["Estado"] not in STATES:
        r.errors.append(f"Estado '{ident['Estado']}' no permitido: {', '.join(sorted(STATES))}.")
    if ident.get("Prioridad") and ident["Prioridad"] not in PRIORITIES:
        r.errors.append(f"Prioridad '{ident['Prioridad']}' no permitida: Esencial, Deseable u Opcional.")

    if "deberá" not in secs.get("### 2.1 Enunciado normativo", ""):
        r.errors.append("El enunciado normativo debe usar «deberá».")

    defs = DEF_RE.findall(text) + ROW_ID_RE.findall(text)
    seen = set()
    for d in defs:
        if d in seen:
            r.errors.append(f"Identificador definido dos veces: {d}.")
        seen.add(d)
    for prefix, label in (("PRE-", "precondición"), ("EN-", "entrada"), ("POST-", "postcondición")):
        if not any(d.startswith(prefix) for d in defs):
            r.errors.append(f"No hay ninguna {label} con ID {prefix}NN.")

    posts = secs.get("### 3.4 Postcondiciones", "")
    if "(éxito)" not in posts:
        r.errors.append("Falta una postcondición marcada '(éxito)'.")
    if "(fallo)" not in posts:
        r.errors.append("Falta una postcondición marcada '(fallo)'.")

    if not re.search(r"^\s*1\.\s+\S", secs.get("### 4.1 Flujo principal", ""), re.MULTILINE):
        r.errors.append("El flujo principal debe ser una lista numerada desde 1.")

    cas = CA_RE.findall(secs.get("### 5.1 Criterios de aceptación", ""))
    if not cas:
        r.errors.append("No hay criterios 'Escenario: CA-NN …' en 5.1.")
    elif len(cas) != len(set(cas)):
        r.errors.append("Hay criterios de aceptación con ID repetido.")
    ca_body = secs.get("### 5.1 Criterios de aceptación", "")
    for kw in ("Dado", "Cuando", "Entonces"):
        if cas and not re.search(rf"^\s*{kw}\b", ca_body, re.MULTILINE):
            r.errors.append(f"Los criterios Gherkin no usan '{kw}'.")
    if len(cas) < 2 and r.kind == "completa":
        r.warnings.append("Una ficha completa debería tener al menos un CA de éxito y uno de fallo.")

    exceptions = [d for d in defs if d.startswith("EX-")]
    matrix = secs.get("### 5.2 Matriz de cobertura", "")
    if not matrix.lower().startswith("no aplica"):
        for ex in exceptions:
            if ex not in matrix:
                r.errors.append(f"{ex} no aparece en la matriz de cobertura 5.2.")

    for m in PLACEHOLDER_RE.finditer(text):
        r.errors.append(f"Marcador de plantilla sin rellenar: '{m.group(0)}'.")

    ident_lines = set(secs.get("## 1. Identificación", "").splitlines())
    for lineno, line in enumerate(text.splitlines(), 1):
        if lineno == 1 or (line in ident_lines and line.strip()):
            continue  # título oficial y nombres de squads y módulos («Planilla Rápida»)
        if line.lstrip().startswith("|") and "DP-" in line:
            continue  # las decisiones pendientes pueden citar textos ambiguos de las fuentes
        for m in VAGUE_RE.finditer(line):
            r.warnings.append(f"Línea {lineno}: término ambiguo «{m.group(1)}»; cuantifique o cite un RNF.")

    r.pending = len(re.findall(r"\[PENDIENTE", text))
    state = ident.get("Estado", "")
    trace = secs.get("### 6.3 Trazabilidad", "")
    if state in {"Implementado", "Verificado", "Aceptado"} and "No implementado" in trace:
        r.errors.append(f"Estado '{state}' contradice la trazabilidad ('No implementado').")
    if state in {"Aprobado", "Implementado", "Verificado", "Aceptado"} and r.pending:
        r.warnings.append(f"Estado '{state}' con {r.pending} pendiente(s) sin resolver.")
    return r


def collect(paths: list[str]) -> list[Path]:
    files: list[Path] = []
    for p in map(Path, paths):
        if p.is_dir():
            files += sorted(p.rglob("RF-*.md"))
        elif p.is_file():
            files.append(p)
        else:
            raise FileNotFoundError(p)
    return files


def main(argv: list[str]) -> int:
    args = [a for a in argv[1:] if not a.startswith("--")]
    verbose = "--verbose" in argv
    if not args:
        print(__doc__.strip().splitlines()[2], file=sys.stderr)
        return 2
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    try:
        files = collect(args)
    except FileNotFoundError as exc:
        print(f"No existe: {exc}", file=sys.stderr)
        return 2
    results = [lint_text(f.read_text(encoding="utf-8-sig"), f) for f in files]
    single = len(files) == 1
    for f, r in zip(files, results):
        status = "OK" if not r.errors else "FALLA"
        print(f"{status:5} {f}  [ficha {r.kind}] errores={len(r.errors)} avisos={len(r.warnings)} pendientes={r.pending}")
        if single or verbose:
            for e in r.errors:
                print(f"  ERROR  {e}")
            for w in r.warnings:
                print(f"  AVISO  {w}")
    failing = sum(1 for r in results if r.errors)
    print(f"Fichas: {len(files)} | con errores: {failing}")
    print("Nota: el linter revisa estructura y redacción; no valida las reglas de negocio.")
    return 1 if failing else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
