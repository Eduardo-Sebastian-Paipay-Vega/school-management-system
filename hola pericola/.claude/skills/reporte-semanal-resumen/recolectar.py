"""Junta en una sola corrida todo lo que necesita /reporte-semanal-resumen.

Uso (desde la raíz del repo):
    python .claude/skills/reporte-semanal-resumen/recolectar.py [AAAA-MM-DD] [--sin-fetch]

La fecha opcional es cualquier día de la semana a reportar (por defecto, hoy).
Semana = domingo a sábado, por FECHA DE AUTORÍA del commit (no la de subida).
Imprime: persona, rangos, commits de la semana actual y la anterior con sus
«zonas» (carpetas que tocan), cambios sin commitear y el «Siguiente trabajo» de
los planes tocados. Solo lee: no modifica nada.
"""
import datetime as dt
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

# Nombre en el informe → correos con los que commitea (una persona usa varios).
ALIAS = {
    "BICHENSO": ["bichensog@gmail.com"],
    "ROY": ["roybrayamgp17@gmail.com", "106459434+Roy-Gomez@users.noreply.github.com"],
    "LUIS": ["luisfernandezcardenas0@gmail.com", "118979738+Luis-Fernadez-Cardenas@users.noreply.github.com"],
    "HAFID": ["hafidjosephapazasulca@gmail.com", "106459498+HafidJoss@users.noreply.github.com"],
    "SEBASTIAN": ["paipayvegabastian@gmail.com", "sebastian.olarte.19@unsch.edu.pe"],
}
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
         "septiembre", "octubre", "noviembre", "diciembre"]


def git(*args: str) -> str:
    r = subprocess.run(["git", *args], capture_output=True, text=True, encoding="utf-8", errors="replace")
    return r.stdout


def zona(ruta: str) -> str | None:
    """Carpeta que identifica el submódulo: 'front:recursos-humanos/remuneracion', 'back:planillas'…"""
    p = ruta.split("/")
    if p[0] == "frontend" and len(p) > 3 and p[2] == "app":
        resto = p[3:]
        if resto[0] == "features" and len(resto) > 2:
            return f"front:{resto[1]}"
        if resto[0] == "components" and len(resto) > 2:
            return f"front:{resto[1]}/{resto[2]}" if "." not in resto[2] else f"front:{resto[1]}"
        if resto[0] in ("shared", "core") and len(resto) > 2:
            return f"front:{resto[0]}/{resto[1]}"
        if "plataforma" in resto[0]:
            return "front:plataforma"
        return "front:app"
    if p[0] == "BACKEND" and len(p) > 1:
        return f"back:{p[1]}" if "." not in p[1] else "back:raiz"
    if p[0] == "docs":
        return None  # la documentación no es avance visible
    return p[0]


def rango_semana(dia: dt.date) -> tuple[dt.date, dt.date]:
    domingo = dia - dt.timedelta(days=(dia.weekday() + 1) % 7)
    return domingo, domingo + dt.timedelta(days=6)


def commits(correos: list[str], refs: list[str], desde: dt.date, hasta: dt.date) -> list[tuple]:
    autores = [f"--author={c}" for c in correos]
    # --since filtra por fecha de commit: margen amplio y luego se filtra por autoría (%ad).
    salida = git("log", *refs, "--no-merges", *autores, f"--since={desde - dt.timedelta(days=45)}",
                 "--format=@@%h|%ad|%s", "--date=short", "--name-only")
    vistos, lista = set(), []
    for bloque in salida.split("@@")[1:]:
        lineas = [l for l in bloque.strip().splitlines() if l.strip()]
        h, fecha, asunto = lineas[0].split("|", 2)
        if h in vistos or not (desde.isoformat() <= fecha <= hasta.isoformat()):
            continue
        vistos.add(h)
        zonas = sorted({z for z in (zona(f) for f in lineas[1:]) if z})
        planes = sorted({f for f in lineas[1:] if re.match(r"docs/desarrollo/PLAN_.*\.md$", f)})
        lista.append((fecha, h, asunto, zonas, planes))
    return sorted(lista)


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")  # la consola de Windows no es UTF-8 por defecto
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dia = dt.date.fromisoformat(args[0]) if args else dt.date.today()
    if "--sin-fetch" not in sys.argv:
        git("fetch", "origin", "dev", "-q")

    correo = git("config", "user.email").strip()
    persona = next((n for n, cs in ALIAS.items() if correo in cs), None)
    if not persona:
        print(f"PERSONA: DESCONOCIDA ({correo}) — preguntar su nombre y agregarlo a ALIAS")
        return
    refs = [r for r in ("dev", "origin/dev", "HEAD") if git("rev-parse", "--verify", "-q", r).strip()]

    desde, hasta = rango_semana(dia)
    desde_ant, hasta_ant = desde - dt.timedelta(days=7), desde - dt.timedelta(days=1)
    ahora = dt.datetime.now()
    hora = ahora.strftime("%I:%M %p").replace("AM", "a.m.").replace("PM", "p.m.")
    print(f"PERSONA: {persona}")
    print(f"FECHA: {desde.day} de {MESES[desde.month - 1]} al {hasta.day} de {MESES[hasta.month - 1]} de {hasta.year}")
    print(f"HORA DE CORTE: {hora}")

    planes_tocados: set[str] = set()
    for titulo, (d, h) in (("ACTUAL", (desde, hasta)), ("ANTERIOR", (desde_ant, hasta_ant))):
        lista = commits(ALIAS[persona], refs, d, h)
        solo_docs = sum(1 for c in lista if not c[3])
        print(f"\n=== {titulo} {d} a {h} ({len(lista)} commits; {solo_docs} solo de documentación, omitidos)")
        for fecha, hsh, asunto, zonas, planes in lista:
            if zonas:
                print(f"{fecha} {hsh} {asunto}  [{', '.join(zonas[:6])}]")
            if titulo == "ACTUAL":
                planes_tocados.update(planes)

    sin_commitear = Counter()
    for linea in git("status", "--porcelain").splitlines():
        ruta = linea[3:].strip().strip('"').split(" -> ")[-1]
        z = zona(ruta)
        if z:
            sin_commitear[z] += 1
    print("\n=== SIN COMMITEAR (zona: archivos)")
    print(", ".join(f"{z}: {n}" for z, n in sin_commitear.most_common()) or "nada")

    print("\n=== SIGUIENTE TRABAJO EN PLANES TOCADOS")
    for plan in sorted(planes_tocados):
        texto = Path(plan).read_text(encoding="utf-8", errors="replace") if Path(plan).exists() else ""
        m = re.search(r"\*\*Siguiente trabajo:?\*\*:?\s*(.+)", texto)
        print(f"{plan}: {m.group(1)[:500] if m else '(sin sección «Siguiente trabajo»)'}")


if __name__ == "__main__":
    main()
