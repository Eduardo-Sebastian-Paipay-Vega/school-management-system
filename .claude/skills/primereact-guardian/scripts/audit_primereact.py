#!/usr/bin/env python3
"""Auditor de solo lectura para imports de PrimeReact.

Uso: python -I audit_primereact.py <raiz_frontend>

Revisa package.json, la versión instalada y los imports de los archivos
fuente. Detecta imports de otros frameworks (PrimeNG/PrimeVue), paquetes de
otra major de PrimeReact y rutas `primereact/<x>` que no existen en la
versión instalada. No valida JSX, props ni UX.

Código de salida: 0 sin errores, 1 con errores, 2 uso incorrecto.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

SOURCE_EXTS = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}
SKIP_DIRS = {"node_modules", ".next", "dist", "build", "out", ".git", "coverage"}

IMPORT_RE = re.compile(
    r"""(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)['"]([^'"]+)['"]"""
)

# Nombres de v11 / PrimeNG / PrimeVue que en PrimeReact 10 tienen otro nombre.
V10_RENAMES = {
    "select": "dropdown",
    "datepicker": "calendar",
    "toggleswitch": "inputswitch",
    "drawer": "sidebar",
    "popover": "overlaypanel",
    "textarea": "inputtextarea",
    "tabs": "tabview",
    "inputchips": "chips",
}

FOREIGN_PREFIXES = ("primeng", "@primeng/", "primevue", "@primevue/")
V11_PREFIXES = ("@primereact/", "@primeuix/")


def major_of(version: str | None) -> int | None:
    if not version:
        return None
    match = re.search(r"(\d+)", version)
    return int(match.group(1)) if match else None


def detect_version(root: Path) -> tuple[str | None, str]:
    installed = root / "node_modules" / "primereact" / "package.json"
    if installed.is_file():
        data = json.loads(installed.read_text(encoding="utf-8"))
        return data.get("version"), "node_modules"
    pkg = root / "package.json"
    if pkg.is_file():
        data = json.loads(pkg.read_text(encoding="utf-8"))
        for section in ("dependencies", "devDependencies", "peerDependencies"):
            spec = data.get(section, {}).get("primereact")
            if spec:
                return spec, f"package.json ({section})"
    return None, "no encontrada"


def iter_sources(root: Path):
    for path in root.rglob("*"):
        if any(part in SKIP_DIRS for part in path.relative_to(root).parts):
            continue
        if path.is_file() and path.suffix in SOURCE_EXTS:
            yield path


def audit(root: Path) -> tuple[list[str], list[str], dict]:
    errors: list[str] = []
    warnings: list[str] = []
    version, source = detect_version(root)
    major = major_of(version)
    pr_dir = root / "node_modules" / "primereact"
    can_check_paths = pr_dir.is_dir()
    used: set[str] = set()

    if version is None:
        warnings.append("No se encontró primereact en node_modules ni en package.json.")
    if not can_check_paths:
        warnings.append("node_modules/primereact ausente: no se validan rutas de import (ejecutar npm install).")

    for path in iter_sources(root):
        rel = path.relative_to(root).as_posix()
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            warnings.append(f"{rel}: no es UTF-8, omitido.")
            continue
        for lineno, line in enumerate(text.splitlines(), 1):
            for spec in IMPORT_RE.findall(line):
                where = f"{rel}:{lineno}"
                if spec.startswith(FOREIGN_PREFIXES):
                    errors.append(f"{where}: '{spec}' pertenece a Angular/Vue, no a React.")
                elif spec.startswith(V11_PREFIXES):
                    if major is not None and major < 11:
                        errors.append(f"{where}: '{spec}' es de PrimeReact 11+; instalada {version}.")
                elif spec == "primereact":
                    warnings.append(f"{where}: import del paquete completo; usar 'primereact/<componente>'.")
                elif spec.startswith("primereact/"):
                    sub = spec.split("/")[1]
                    used.add(sub)
                    if sub == "resources" and "/themes/" in spec:
                        warnings.append(
                            f"{where}: tema de PrimeReact importado directamente; "
                            "el proyecto usa un tema institucional generado."
                        )
                    if can_check_paths and not (pr_dir / sub).exists():
                        hint = V10_RENAMES.get(sub)
                        extra = f" ¿Querías 'primereact/{hint}'?" if hint else ""
                        errors.append(f"{where}: '{spec}' no existe en primereact {version}.{extra}")

    summary = {
        "version": version,
        "version_source": source,
        "major": major,
        "modules_used": sorted(used),
    }
    return errors, warnings, summary


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__.strip().splitlines()[2], file=sys.stderr)
        return 2
    root = Path(argv[1]).resolve()
    if not root.is_dir():
        print(f"No es un directorio: {root}", file=sys.stderr)
        return 2

    errors, warnings, summary = audit(root)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    print(f"Raíz: {root}")
    print(f"PrimeReact: {summary['version']} (fuente: {summary['version_source']})")
    print(f"Módulos usados: {', '.join(summary['modules_used']) or 'ninguno'}")
    for msg in errors:
        print(f"ERROR  {msg}")
    for msg in warnings:
        print(f"AVISO  {msg}")
    print(f"Resultado: {len(errors)} error(es), {len(warnings)} aviso(s).")
    print("Nota: el auditor solo revisa imports y versión; no valida JSX, props ni UX.")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
