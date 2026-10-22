import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

HERE = Path(__file__).resolve().parents[1]
SCRIPT = HERE / "scripts" / "project_health.py"
spec = importlib.util.spec_from_file_location("project_health", SCRIPT)
ph = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ph)


def synthetic(state="accepted"):
    evidence = {"not_started": [],
                "specified": [{"kind": "spec", "ref": "docs/rf.md#ejemplo"}],
                "implemented": [{"kind": "implementation", "ref": "src/example.py:10"}],
                "verified": [{"kind": "implementation", "ref": "src/example.py:10"}, {"kind": "test", "ref": "ci/42:test-ok"}],
                "accepted": [{"kind": "implementation", "ref": "src/example.py:10"}, {"kind": "test", "ref": "ci/42:test-ok"}, {"kind": "acceptance", "ref": "UAT-001"}]}
    data = {
        "project": "SISTEMA SINTÉTICO",
        "audit": {"date": "2026-10-21", "branch": "dev", "commit": "abcdef1234", "dirty_worktree": False},
        "scope": {"inventory_status": "complete", "all_modules_in_scope": True,
                  "expected_modules": ["Core"], "reviewed_modules": ["Core"],
                  "requirements_sources": ["docs/requisitos.md, versión 1"],
                  "unresolved_scope_conflicts": [], "limitations": []},
        "items": [], "phases": [{"id": f"F{i:02}", "state": "no_verificable", "reference": "Por validar"} for i in range(16)], "findings": [],
        "gates": {"uat_approved": False, "security_approved": False, "deployment_verified": False,
                  "monitoring_verified": False, "release_authorized": False}}
    for cat in ph.DOMAIN:
        item = {"id": cat + "-1", "title": "Control sintético", "category": cat,
                "priority": "medium", "state": state, "evidence": copy.deepcopy(evidence[state])}
        if cat == "RF":
            item.update({"module": "Core", "acceptance_criteria": "UAT sintético"})
        data["items"].append(item)
    return data


class ProjectHealthTests(unittest.TestCase):
    def test_weights_sum_to_1000(self):
        self.assertEqual(sum(ph.DOMAIN.values()), 1000)

    def test_complete_accepted_scores_1000_without_claiming_prod(self):
        d = synthetic("accepted")
        ph.validate(d)
        out = ph.calculate(d)
        self.assertEqual(out["score"], 1000)
        self.assertNotEqual(out["status"], "EN PRODUCCIÓN VERIFICADA")

    def test_missing_inventory_no_numeric_score(self):
        d = synthetic()
        d["scope"]["inventory_status"] = "partial"
        out = ph.calculate(ph.validate(d))
        self.assertIsNone(out["score"])
        self.assertEqual(out["status"], "NO VERIFICABLE")

    def test_missing_phase_inventory_no_numeric_score(self):
        d = synthetic()
        d["phases"] = d["phases"][:-1]
        self.assertIsNone(ph.calculate(ph.validate(d))["score"])

    def test_missing_domain_no_numeric_score(self):
        d = synthetic()
        d["items"] = [x for x in d["items"] if x["category"] != "SEC"]
        self.assertIsNone(ph.calculate(ph.validate(d))["score"])

    def test_inadequate_evidence_rejected(self):
        d = synthetic()
        d["items"][0]["evidence"] = []
        with self.assertRaises(ph.AuditError):
            ph.validate(d)

    def test_critical_finding_blocks(self):
        d = synthetic()
        d["findings"] = [{"id":"B1", "severity":"CRITICAL", "title":"Prueba",
                          "module":"Core", "reference":"tests/fail.log", "action":"Corregir", "state":"open"}]
        self.assertEqual(ph.calculate(ph.validate(d))["status"], "BLOQUEADO")

    def test_prod_requires_gates(self):
        d = synthetic()
        d["gates"] = dict.fromkeys(d["gates"], True)
        self.assertEqual(ph.calculate(ph.validate(d))["status"], "EN PRODUCCIÓN VERIFICADA")

    def test_readme_idempotence_and_preservation(self):
        initial = "# Mi proyecto\n\nInformación original\n"
        block = ph.render_block(synthetic(), ph.calculate(synthetic()), "docs/project-health/ESTADO_PROYECTO.md")
        one = ph.update_readme(initial, block)
        two = ph.update_readme(one, block)
        self.assertEqual(one, two)
        self.assertIn("Información original", two)
        self.assertEqual(two.count(ph.START), 1)

    def test_conflicting_markers_abort(self):
        with self.assertRaises(ph.AuditError):
            ph.update_readme("# Proyecto\n" + ph.START, "x")
        with self.assertRaises(ph.AuditError):
            ph.update_readme(ph.END + ph.START, "x")

    def test_sanitize_untrusted_html_markdown(self):
        s = ph.safe('<img src="x">|\nBAD')
        self.assertNotIn("<img", s)
        self.assertNotIn("\n", s)
        self.assertIn("\\|", s)

    def test_cli_dry_run_then_write_then_repeat(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            evidence = root / "evidence.json"
            readme = root / "README.md"
            report = root / "docs" / "ESTADO_PROYECTO.md"
            evidence.write_text(json.dumps(synthetic()), encoding="utf-8")
            readme.write_text("# Original\n\nContent\n", encoding="utf-8")
            cmd = [sys.executable, str(SCRIPT), "--input", str(evidence),
                   "--readme", str(readme), "--report", str(report)]
            run = subprocess.run(cmd, capture_output=True, text=True)
            self.assertEqual(run.returncode, 0, run.stderr)
            self.assertFalse(report.exists())
            self.assertNotIn(ph.START, readme.read_text(encoding="utf-8"))
            self.assertEqual(subprocess.run(cmd + ["--write"], capture_output=True).returncode, 0)
            first = readme.read_bytes()
            self.assertEqual(subprocess.run(cmd + ["--write"], capture_output=True).returncode, 0)
            self.assertEqual(first, readme.read_bytes())
            self.assertTrue(report.exists())
            self.assertIn("Content", readme.read_text(encoding="utf-8"))

    def test_claude_hidden_readme_report_link(self):
        d = synthetic("specified")
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            (root / ".github").mkdir()
            (root / "docs").mkdir()
            evidence = root / "evidence.json"
            evidence.write_text(json.dumps(d), encoding="utf-8")
            cmd = [sys.executable, str(SCRIPT), "--input", str(evidence),
                   "--readme", str(root / ".github" / "README.md"),
                   "--report", str(root / "docs" / "ESTADO_PROYECTO.md"), "--write"]
            run = subprocess.run(cmd, capture_output=True, text=True)
            self.assertEqual(run.returncode, 0, run.stderr)
            self.assertIn("../docs/ESTADO_PROYECTO.md", (root / ".github" / "README.md").read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
