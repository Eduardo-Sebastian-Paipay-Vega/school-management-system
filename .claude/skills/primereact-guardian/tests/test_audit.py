"""Pruebas del auditor con proyectos sintéticos.

Ejecutar: python -I -m unittest discover -s .claude/skills/primereact-guardian/tests -v
"""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "audit_primereact.py"
spec = importlib.util.spec_from_file_location("audit_primereact", SCRIPT)
audit_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit_mod)


def make_project(root: Path, version: str, modules=(), files=None, installed=True):
    (root / "package.json").write_text(
        json.dumps({"dependencies": {"primereact": f"^{version}"}}), encoding="utf-8"
    )
    if installed:
        pr = root / "node_modules" / "primereact"
        pr.mkdir(parents=True)
        (pr / "package.json").write_text(json.dumps({"version": version}), encoding="utf-8")
        for mod in modules:
            (pr / mod).mkdir()
    for rel, content in (files or {}).items():
        path = root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")


class AuditTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def run_audit(self):
        return audit_mod.audit(self.root)

    def test_valid_v10_project_has_no_errors(self):
        make_project(self.root, "10.9.9", ["button", "datatable", "api"], {
            "app/page.tsx": "import { Button } from 'primereact/button';\n"
                            "import { DataTable } from \"primereact/datatable\";\n"
                            "import { FilterMatchMode } from 'primereact/api';\n",
        })
        errors, warnings, summary = self.run_audit()
        self.assertEqual(errors, [])
        self.assertEqual(summary["major"], 10)
        self.assertEqual(summary["modules_used"], ["api", "button", "datatable"])

    def test_v11_name_in_v10_suggests_rename(self):
        make_project(self.root, "10.9.9", ["dropdown"], {
            "a.tsx": "import { Select } from 'primereact/select';\n",
        })
        errors, _, _ = self.run_audit()
        self.assertEqual(len(errors), 1)
        self.assertIn("primereact/dropdown", errors[0])
        self.assertIn("a.tsx:1", errors[0])

    def test_v11_scoped_package_on_v10_is_error(self):
        make_project(self.root, "10.9.9", [], {
            "a.tsx": "import { Button } from '@primereact/ui/button';\n",
        })
        errors, _, _ = self.run_audit()
        self.assertEqual(len(errors), 1)
        self.assertIn("11+", errors[0])

    def test_v11_scoped_package_on_v11_is_allowed(self):
        make_project(self.root, "11.0.0", [], {
            "a.tsx": "import { Button } from '@primereact/ui/button';\n",
        })
        errors, _, _ = self.run_audit()
        self.assertEqual(errors, [])

    def test_primeng_and_primevue_are_errors(self):
        make_project(self.root, "10.9.9", [], {
            "a.ts": "import { TableModule } from 'primeng/table';\n",
            "b.ts": "const x = require('primevue/button');\n",
        })
        errors, _, _ = self.run_audit()
        self.assertEqual(len(errors), 2)

    def test_node_modules_ignored_and_warnings(self):
        make_project(self.root, "10.9.9", ["resources"], {
            "node_modules/lib/x.js": "import 'primeng/table';\n",
            "app/layout.tsx": "import 'primereact/resources/themes/lara-light-blue/theme.css';\n"
                              "import * as P from 'primereact';\n",
        })
        errors, warnings, _ = self.run_audit()
        self.assertEqual(errors, [])
        self.assertEqual(len(warnings), 2)

    def test_without_node_modules_skips_path_check(self):
        make_project(self.root, "10.9.9", installed=False, files={
            "a.tsx": "import { Select } from 'primereact/select';\n",
        })
        errors, warnings, summary = self.run_audit()
        self.assertEqual(errors, [])
        self.assertEqual(summary["version_source"], "package.json (dependencies)")
        self.assertTrue(any("node_modules/primereact ausente" in w for w in warnings))


if __name__ == "__main__":
    unittest.main()
