"""Pruebas del linter RF.

Ejecutar: python -I -B -m unittest discover -s .claude/skills/make-rf/tests -v
"""
import importlib.util
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SKILL = Path(__file__).resolve().parents[1]
SCRIPT = SKILL / "scripts" / "lint_rf.py"
spec = importlib.util.spec_from_file_location("lint_rf", SCRIPT)
lint = importlib.util.module_from_spec(spec)
sys.modules["lint_rf"] = lint  # dataclasses necesita el módulo registrado
spec.loader.exec_module(lint)

EXAMPLE = (SKILL / "references" / "ejemplo_rf.md").read_text(encoding="utf-8")
VALID = EXAMPLE[EXAMPLE.index("# RF-42:"):]


def run(text):
    return lint.lint_text(text, Path("RF-test.md"))


class LintTests(unittest.TestCase):
    def test_reference_example_is_valid(self):
        r = run(VALID)
        self.assertEqual(r.errors, [])
        self.assertEqual(r.kind, "completa")
        self.assertGreater(r.pending, 0)

    def test_official_names_in_identification_are_not_vague(self):
        self.assertFalse(any("Rápida" in w for w in run(VALID).warnings))

    def test_v1_style_file_fails(self):
        v1 = "# RF-42: Cierre\n\n## 1. Enunciado Normativo Formal\n\n> El sistema deberá cerrar.\n"
        r = run(v1)
        self.assertIn("Falta la sección '### 3.1 Precondiciones'.", r.errors)

    def test_missing_failure_postcondition(self):
        r = run(VALID.replace("(fallo)", "(final)"))
        self.assertIn("Falta una postcondición marcada '(fallo)'.", r.errors)

    def test_exception_must_be_in_matrix(self):
        text = VALID.replace("| EX-04 / POST-05 | CA-05 |", "| POST-05 | CA-05 |")
        self.assertIn("EX-04 no aparece en la matriz de cobertura 5.2.", run(text).errors)

    def test_placeholder_left_is_error(self):
        text = VALID.replace("Cerrar oficialmente un periodo", "<Verbo + objeto>", 1)
        self.assertTrue(any("Marcador de plantilla" in e for e in run(text).errors))

    def test_vague_term_warns(self):
        text = VALID.replace("El sistema verifica la completitud", "El sistema verifica rápidamente la completitud")
        self.assertTrue(any("rápidamente" in w for w in run(text).warnings))

    def test_duplicate_identifier(self):
        text = VALID.replace("- **PRE-02:**", "- **PRE-01:**")
        self.assertIn("Identificador definido dos veces: PRE-01.", run(text).errors)

    def test_invalid_state_and_id_mismatch(self):
        text = VALID.replace("| Estado | Propuesto |", "| Estado | Terminado |").replace("| ID | RF-42 |", "| ID | RF-43 |")
        errors = run(text).errors
        self.assertTrue(any("Estado 'Terminado'" in e for e in errors))
        self.assertTrue(any("no coincide" in e for e in errors))

    def test_implemented_state_contradicting_trace(self):
        text = VALID.replace("| Estado | Propuesto |", "| Estado | Implementado |").replace(
            "`isClosed`); UI no implementada", "No implementado")
        self.assertTrue(any("contradice la trazabilidad" in e for e in run(text).errors))

    def test_reduced_allows_not_applicable_only_in_optional_sections(self):
        reduced = VALID.replace("**Ficha:** completa", "**Ficha:** reducida")
        body = reduced.split("### 4.2 Flujos alternativos\n", 1)
        rest = body[1].split("### 4.3", 1)[1]
        ok = body[0] + "### 4.2 Flujos alternativos\nNo aplica — consulta simple.\n\n### 4.3" + rest
        self.assertEqual(run(ok).errors, [])
        pre = ok.split("### 3.1 Precondiciones\n", 1)
        bad = pre[0] + "### 3.1 Precondiciones\nNo aplica.\n\n### 3.2" + pre[1].split("### 3.2", 1)[1]
        self.assertTrue(any("3.1 Precondiciones" in e for e in run(bad).errors))

    def test_cli_on_directory(self):
        with tempfile.TemporaryDirectory() as td:
            d = Path(td) / "Squad 9"
            d.mkdir()
            (d / "RF-42.md").write_text(VALID, encoding="utf-8")
            (d / "RF-43.md").write_text("# RF-43: Otro\n", encoding="utf-8")
            out = subprocess.run([sys.executable, "-I", "-B", str(SCRIPT), td], capture_output=True, text=True, encoding="utf-8")
            self.assertEqual(out.returncode, 1)
            self.assertIn("Fichas: 2 | con errores: 1", out.stdout)


if __name__ == "__main__":
    unittest.main()
