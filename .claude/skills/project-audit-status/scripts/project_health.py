#!/usr/bin/env python3
"""Calculate a reproducible 0-1000 project-health score from audited evidence.

This does NOT inspect or test the software. It checks a structured audit produced
by a human/agent and updates only a marked README section plus a report.
Python >= 3.9; standard library only. Dry-run by default.
"""
import argparse
import datetime as dt
import difflib
import html
import json
import os
from pathlib import Path
import re
import sys
import tempfile
from decimal import Decimal, ROUND_HALF_UP

DOMAIN = {"RF": 400, "RNF": 100, "QA": 150, "INT": 100,
          "SEC": 100, "ARCH": 70, "OPS": 50, "DOC": 30}
LABEL = {"RF":"Requisitos funcionales", "RNF":"Requisitos no funcionales",
         "QA":"Calidad y pruebas", "INT":"Integraciones y E2E",
         "SEC":"Seguridad e integridad", "ARCH":"Arquitectura y datos",
         "OPS":"Operación y despliegue", "DOC":"Documentación y consistencia"}
PRIORITY = {"critical": 5, "high": 3, "medium": 2, "low": 1}
FRACTION = {"not_started": Decimal("0"), "specified": Decimal("0.10"),
            "implemented": Decimal("0.45"), "verified": Decimal("0.80"),
            "accepted": Decimal("1")}
REQUIRED_EVIDENCE = {"not_started": set(), "specified": {"spec"},
                     "implemented": {"implementation"},
                     "verified": {"implementation", "test"},
                     "accepted": {"implementation", "test", "acceptance"}}
PHASE_STATE = {"no_iniciada", "en_progreso", "evidenciada", "bloqueada", "no_verificable"}
SEVERITY = {"BLOCKER", "CRITICAL", "HIGH", "MEDIUM", "LOW"}
START = "<!-- PROJECT-HEALTH:START -->"
END = "<!-- PROJECT-HEALTH:END -->"


class AuditError(Exception):
    pass


def require(condition, message):
    if not condition:
        raise AuditError(message)


def safe(value, limit=200):
    """Escape Markdown/HTML separators from UNTRUSTED audit data."""
    s = str(value)[:limit].replace("\r", " ").replace("\n", " ")
    return html.escape(s, quote=True).replace("|", "\\|").replace("`", "&#96;")


def nonempty_str(obj, field, where):
    val = obj.get(field)
    require(isinstance(val, str) and val.strip(), f"{where}.{field} debe ser texto no vacío")
    return val


def validate(raw):
    require(isinstance(raw, dict), "La raíz de evidence.json debe ser objeto JSON")
    nonempty_str(raw, "project", "root")
    audit = raw.get("audit")
    scope = raw.get("scope")
    require(isinstance(audit, dict), "Falta audit")
    require(isinstance(scope, dict), "Falta scope")
    date = nonempty_str(audit, "date", "audit")
    try:
        dt.date.fromisoformat(date)
    except ValueError as e:
        raise AuditError("audit.date debe ser fecha ISO YYYY-MM-DD") from e
    nonempty_str(audit, "branch", "audit")
    nonempty_str(audit, "commit", "audit")
    require(isinstance(audit.get("dirty_worktree"), bool), "audit.dirty_worktree debe ser booleano")
    require(scope.get("inventory_status") in ("complete", "partial", "unknown"), "scope.inventory_status inválido")
    require(isinstance(scope.get("all_modules_in_scope"), bool), "scope.all_modules_in_scope debe ser booleano")
    for key in ("expected_modules", "reviewed_modules", "requirements_sources", "unresolved_scope_conflicts", "limitations"):
        require(isinstance(scope.get(key), list), f"scope.{key} debe ser array")
        require(all(isinstance(x, str) and x.strip() for x in scope[key]), f"scope.{key} requiere cadenas no vacías")
    require(len(scope["expected_modules"]) == len(set(scope["expected_modules"])), "Módulos esperados duplicados")
    require(len(scope["reviewed_modules"]) == len(set(scope["reviewed_modules"])), "Módulos revisados duplicados")
    items = raw.get("items")
    require(isinstance(items, list), "items debe ser array")
    ids = set()
    for idx, item in enumerate(items):
        where = f"items[{idx}]"
        require(isinstance(item, dict), f"{where} debe ser objeto")
        code = nonempty_str(item, "id", where)
        nonempty_str(item, "title", where)
        require(code not in ids, f"ID repetido: {code}")
        ids.add(code)
        require(item.get("category") in DOMAIN, f"{where}.category inválida")
        require(item.get("priority") in PRIORITY, f"{where}.priority inválida")
        require(item.get("state") in FRACTION, f"{where}.state inválido")
        if item["category"] == "RF":
            nonempty_str(item, "module", where)
            if item["state"] != "not_started":
                nonempty_str(item, "acceptance_criteria", where)
        evidences = item.get("evidence")
        require(isinstance(evidences, list), f"{where}.evidence debe ser array")
        kinds = set()
        for j, evidence in enumerate(evidences):
            require(isinstance(evidence, dict), f"{where}.evidence[{j}] debe ser objeto")
            kind = nonempty_str(evidence, "kind", f"{where}.evidence[{j}]")
            ref = nonempty_str(evidence, "ref", f"{where}.evidence[{j}]")
            require(kind in ("spec", "implementation", "test", "acceptance", "other"), f"Tipo de evidencia inválido: {kind}")
            require(not any(x in ref for x in ("\n", "\r", "\x00")), "Referencia de evidencia malformada")
            kinds.add(kind)
        missing = REQUIRED_EVIDENCE[item["state"]] - kinds
        require(not missing, f"{code}: estado {item['state']} sin evidencia {sorted(missing)}")
    findings = raw.get("findings")
    require(isinstance(findings, list), "findings debe ser array")
    f_ids = set()
    for i, finding in enumerate(findings):
        require(isinstance(finding, dict), f"findings[{i}] debe ser objeto")
        fid = nonempty_str(finding, "id", f"findings[{i}]")
        require(fid not in f_ids, f"Hallazgo duplicado: {fid}")
        f_ids.add(fid)
        require(finding.get("severity") in SEVERITY, f"findings[{i}].severity inválido")
        for key in ("title", "module", "reference", "action"):
            nonempty_str(finding, key, f"findings[{i}]")
        require(finding.get("state", "open") in ("open", "closed", "mitigated"), "Hallazgo con state inválido")
    phases = raw.get("phases")
    require(isinstance(phases, list), "phases debe ser array")
    seen = set()
    for ph in phases:
        require(isinstance(ph, dict), "Cada fase debe ser objeto")
        pid = nonempty_str(ph, "id", "phase")
        require(re.fullmatch(r"F(0[0-9]|1[0-5])", pid) is not None, f"Fase inválida: {pid}")
        require(pid not in seen, f"Fase duplicada: {pid}")
        seen.add(pid)
        require(ph.get("state") in PHASE_STATE, f"Fase {pid} estado inválido")
        nonempty_str(ph, "reference", f"phase {pid}")
    gates = raw.get("gates")
    require(isinstance(gates, dict), "Falta gates")
    for key in ("uat_approved", "security_approved", "deployment_verified", "monitoring_verified", "release_authorized"):
        require(isinstance(gates.get(key), bool), f"gates.{key} debe ser booleano")
    return raw


def calculate(data):
    by_domain = {key: [] for key in DOMAIN}
    for item in data["items"]:
        by_domain[item["category"]].append(item)
    scope = data["scope"]
    complete = (scope["inventory_status"] == "complete" and scope["all_modules_in_scope"]
                and bool(scope["expected_modules"])
                and set(scope["expected_modules"]) == set(scope["reviewed_modules"])
                and bool(scope["requirements_sources"])
                and not scope["unresolved_scope_conflicts"]
                and all(by_domain.values()) and len(data["phases"]) == 16)
    domain_scores = {}
    for code, maximum in DOMAIN.items():
        observations = by_domain[code]
        if not observations:
            domain_scores[code] = None
            continue
        divisor = Decimal(sum(PRIORITY[x["priority"]] for x in observations))
        total = sum((Decimal(PRIORITY[x["priority"]]) * FRACTION[x["state"]] for x in observations), Decimal(0))
        domain_scores[code] = Decimal(maximum) * total / divisor
    score = None
    if complete:
        score = int(sum(domain_scores.values(), Decimal(0)).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        score = max(0, min(1000, score))
    active_blockers = [f for f in data["findings"] if f["severity"] in ("BLOCKER", "CRITICAL") and f.get("state", "open") == "open"]
    critical_pending = [x for x in by_domain["RF"] if x["priority"] == "critical" and x["state"] != "accepted"]
    gates = data["gates"]
    if not complete:
        status = "NO VERIFICABLE"
    elif active_blockers:
        status = "BLOQUEADO"
    elif all(gates.values()) and not critical_pending:
        status = "EN PRODUCCIÓN VERIFICADA"
    elif gates["uat_approved"] and gates["security_approved"] and not critical_pending:
        status = "LISTO PARA PILOTO"
    elif score >= 600 or gates["uat_approved"]:
        status = "EN VALIDACIÓN"
    else:
        status = "EN DESARROLLO"
    rf = by_domain["RF"]
    return {"score": score, "status": status, "domain_scores": domain_scores,
            "rf_total": len(rf), "rf_accepted": sum(x["state"] == "accepted" for x in rf),
            "rf_tested": sum(x["state"] in ("verified", "accepted") for x in rf),
            "active_blockers": active_blockers, "critical_pending": critical_pending,
            "complete": complete}


def pct_bar(score):
    if score is None:
        return "Sin puntuación verificable"
    full = min(20, max(0, (score * 20 + 500) // 1000))
    return "█" * full + "░" * (20 - full) + f" {score / 10:.1f}% de la rúbrica"


def render_block(data, result, report_link):
    score_txt = f"{result['score']} / 1000" if result["score"] is not None else "N/D / 1000"
    rf_text = f"{result['rf_accepted']} aceptados / {result['rf_total']} inventariados"
    scope = data["scope"]
    lines = [START, "## 📊 ESTADO ACTUAL DEL PROYECTO", "",
             f"### {score_txt} — {safe(result['status'])}", "",
             f"**Avance verificado:** {pct_bar(result['score'])}", "",
             "| Indicador | Resultado |", "|---|---|",
             f"| RF | {rf_text} |",
             f"| RF probados o aceptados | {result['rf_tested']} / {result['rf_total']} |",
             f"| Bloqueadores abiertos | {len(result['active_blockers'])} |",
             f"| Inventario del alcance | {safe(scope['inventory_status'])} |",
             f"| Última auditoría | {safe(data['audit']['date'])} |",
             f"| Rama / commit | {safe(data['audit']['branch'], 70)} / {safe(data['audit']['commit'], 70)} |",
             "", "**Detalle por área (máximo 1000):**", "",
             "| Área | Puntos | Máximo |", "|---|---:|---:|"]
    for code, maximum in DOMAIN.items():
        points = result["domain_scores"][code]
        val = "N/D" if result["score"] is None or points is None else str(int(points.quantize(Decimal("1"), rounding=ROUND_HALF_UP)))
        lines.append(f"| {LABEL[code]} | {val} | {maximum} |")
    lines += ["", "_Esta nota refleja evidencias del snapshot auditado, no una certificación ni una autorización de despliegue._",
              "_Los requisitos pendientes deben permanecer visibles en el informe; no se asignan puntos sin evidencia._", "",
              f"[Ver auditoría completa]({report_link})", END]
    return "\n".join(lines) + "\n"


def render_report(data, result):
    score_txt = f"{result['score']} / 1000" if result["score"] is not None else "N/D / 1000"
    a, scope = data["audit"], data["scope"]
    out = ["# Auditoría del estado del proyecto", "",
           f"**Proyecto:** {safe(data['project'])}", f"**Resultado:** {score_txt} — {safe(result['status'])}",
           f"**Fecha:** {safe(a['date'])}  |  **Rama:** {safe(a['branch'])}  |  **Commit:** {safe(a['commit'])}",
           f"**Árbol modificado:** {'Sí' if a['dirty_worktree'] else 'No'}", "",
           "## Alcance y cobertura", "",
           f"- Inventario: {safe(scope['inventory_status'])}; cobertura total declarada: {'sí' if scope['all_modules_in_scope'] else 'no'}",
           f"- Módulos esperados: {', '.join(safe(x) for x in scope['expected_modules']) or 'No determinados'}",
           f"- Módulos revisados: {', '.join(safe(x) for x in scope['reviewed_modules']) or 'Ninguno'}",
           f"- RF aceptados: {result['rf_accepted']} / {result['rf_total']}; probados o aceptados: {result['rf_tested']} / {result['rf_total']}", ""]
    out += ["### Fuentes de RF", ""] + [f"- {safe(x, 350)}" for x in scope["requirements_sources"]]
    out += ["", "### Conflictos de alcance", ""] + ([f"- {safe(x, 350)}" for x in scope["unresolved_scope_conflicts"]] or ["- Ninguno registrado"])
    out += ["", "### Limitaciones", ""] + ([f"- {safe(x, 350)}" for x in scope["limitations"]] or ["- Ninguna registrada"])
    out += ["", "## Matriz de madurez /1000", "", "| Área | Puntaje de rúbrica | Máximo |", "|---|---:|---:|"]
    for code, maximum in DOMAIN.items():
        points = result["domain_scores"][code]
        val = "N/D" if result["score"] is None or points is None else str(int(points.quantize(Decimal("1"), rounding=ROUND_HALF_UP)))
        out.append(f"| {LABEL[code]} | {val} | {maximum} |")
    out += ["", "**Advertencia:** la puntuación requiere inventario integral. La existencia de código o test no garantiza un RF aceptado.", "", "## Requisitos y controles auditados", "",
            "| ID | Área | Módulo | Prioridad | Estado | Evidencia localizada |", "|---|---|---|---|---|---|"]
    for item in data["items"]:
        evidence = "; ".join(f"{safe(e['kind'], 25)}: {safe(e['ref'], 160)}" for e in item["evidence"]) or "Sin evidencia"
        out.append(f"| {safe(item['id'])} — {safe(item['title'], 80)} | {safe(item['category'])} | {safe(item.get('module', 'transversal'))} | {safe(item['priority'])} | {safe(item['state'])} | {evidence} |")
    out += ["", "## Fases F00–F15", "", "| Fase | Estado | Evidencia |", "|---|---|---|"]
    by_phase = {p["id"]: p for p in data["phases"]}
    for i in range(16):
        pid = f"F{i:02}"
        if pid in by_phase:
            p = by_phase[pid]
            out.append(f"| {pid} | {safe(p['state'])} | {safe(p['reference'], 200)} |")
        else:
            out.append(f"| {pid} | NO VERIFICABLE | Sin registro de evidencia |")
    out += ["", "## Hallazgos", "", "| ID | Severidad | Estado | Componente | Evidencia | Acción |", "|---|---|---|---|---|---|"]
    for f in data["findings"]:
        out.append(f"| {safe(f['id'])} — {safe(f['title'], 80)} | {safe(f['severity'])} | {safe(f.get('state', 'open'))} | {safe(f['module'])} | {safe(f['reference'], 160)} | {safe(f['action'], 160)} |")
    if not data["findings"]:
        out.append("| — | — | — | — | No se registraron hallazgos; esto no prueba ausencia de defectos | — |")
    out += ["", "## Compuertas de entrega", ""]
    for key, val in data["gates"].items():
        out.append(f"- {safe(key)}: {'evidenciada' if val else 'no evidenciada'}")
    out += ["", "## Interpretación", "", "La escala 0–1000 es una rúbrica interna de evaluación de evidencias. No es porcentaje de esfuerzo, certificación oficial, validación exhaustiva de seguridad ni aprobación automática de salida a producción.", ""]
    return "\n".join(out)


def read_utf8(path):
    if not path.exists():
        return "", False, "\n"
    raw = path.read_bytes()
    bom = raw.startswith(b"\xef\xbb\xbf")
    try:
        txt = raw.decode("utf-8-sig")
    except UnicodeError as e:
        raise AuditError(f"No se puede leer UTF-8: {path}") from e
    newline = "\r\n" if txt.count("\r\n") > (txt.count("\n") - txt.count("\r\n")) else "\n"
    return txt, bom, newline


def update_readme(existing, block):
    starts, ends = existing.count(START), existing.count(END)
    require(starts == ends and starts <= 1, "README: marcadores faltantes, duplicados o desbalanceados; abortar")
    if starts == 1:
        a, b = existing.index(START), existing.index(END)
        require(a < b, "README: marcadores invertidos")
        after = b + len(END)
        if existing[after:after + 2] == "\r\n":
            after += 2
        elif existing[after:after + 1] == "\n":
            after += 1
        return existing[:a] + block + existing[after:]
    if not existing:
        return block
    # Put the status immediately below the first H1 if present; preserve other content.
    match = re.search(r"(?m)^# (?!#).*(?:\r?\n|$)", existing)
    if match:
        return existing[:match.end()] + "\n" + block + "\n" + existing[match.end():]
    return block + "\n" + existing


def atomic_write(path, text, bom, newline):
    path.parent.mkdir(parents=True, exist_ok=True)
    normalized = text.replace("\r\n", "\n").replace("\n", newline)
    data = (b"\xef\xbb\xbf" if bom else b"") + normalized.encode("utf-8")
    fd, temp = tempfile.mkstemp(dir=path.parent, prefix=".project-health-")
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(data)
        os.replace(temp, path)
    finally:
        if os.path.exists(temp):
            os.remove(temp)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path, help="JSON producido por una auditoría de repositorio real")
    parser.add_argument("--readme", required=True, type=Path)
    parser.add_argument("--report", required=True, type=Path)
    parser.add_argument("--write", action="store_true", help="Publica bloque README e informe; sin flag: solo diff")
    args = parser.parse_args(argv)
    # Windows usa cp1252 en salidas redirigidas; el bloque incluye emoji y caracteres de barra.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")
    try:
        for p in (args.input, args.readme, args.report):
            require(p.suffix.lower() in (".md", ".json"), f"Extensión inesperada: {p}")
        require(args.readme.resolve() != args.report.resolve(), "README y reporte no pueden tener misma ruta")
        require(args.input.resolve() not in (args.readme.resolve(), args.report.resolve()), "Entrada no debe ser salida")
        data = validate(json.loads(args.input.read_text(encoding="utf-8-sig")))
        result = calculate(data)
        readme, bom, newline = read_utf8(args.readme)
        report_link = os.path.relpath(args.report.resolve(), args.readme.resolve().parent).replace(os.sep, "/")
        require(not report_link.startswith("../../") and report_link != "..", "Reporte fuera del ámbito README: especificar ruta segura")
        block = render_block(data, result, report_link)
        target = update_readme(readme.replace("\r\n", "\n"), block)
        new_report = render_report(data, result)
        print(f"Estado: {result['status']} | Puntaje: {result['score'] if result['score'] is not None else 'N/D'}/1000")
        print(f"RF: {result['rf_accepted']}/{result['rf_total']} aceptados | Bloqueadores: {len(result['active_blockers'])}")
        if args.write:
            atomic_write(args.readme, target, bom, newline)
            atomic_write(args.report, new_report, False, "\n")
            print(f"ESCRITO: {args.readme} y {args.report}")
        else:
            delta = list(difflib.unified_diff(readme.replace("\r\n", "\n").splitlines(True), target.splitlines(True),
                                              fromfile=str(args.readme), tofile=f"{args.readme} (propuesto)"))
            print("DRY-RUN: no se modificó ningún archivo")
            print("".join(delta[:120]) or "README sin cambios", end="\n")
            print(f"REPORTE PROPUESTO: {args.report} ({len(new_report)} caracteres)")
        return 0
    except (AuditError, json.JSONDecodeError, OSError, UnicodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
