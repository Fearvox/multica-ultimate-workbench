import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
CLI = REPO_ROOT / "scripts" / "workbench-dataset"


class WorkbenchDatasetCliTest(unittest.TestCase):
    def run_cli(self, *args, cwd=None):
        return subprocess.run(
            [sys.executable, str(CLI), *args],
            cwd=cwd or REPO_ROOT,
            text=True,
            capture_output=True,
            check=False,
        )

    def test_public_fixture_pipeline_emits_local_only_report(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            fixture_dir = tmp_path / "fixtures" / "public-msw"
            out_dir = tmp_path / "dataset-alpha"

            init_result = self.run_cli("init", "--fixture", "public-msw", "--out", str(fixture_dir))
            self.assertEqual(init_result.returncode, 0, init_result.stderr)
            self.assertTrue((fixture_dir / "public-policy.txt").exists())

            ingest_result = self.run_cli("ingest", str(fixture_dir), "--out", str(out_dir))
            self.assertEqual(ingest_result.returncode, 0, ingest_result.stderr)
            self.assertTrue((out_dir / "manifest.json").exists())
            self.assertTrue((out_dir / "normalized" / "public-policy.txt").exists())
            self.assertTrue((out_dir / "chunks" / "public-policy-000.json").exists())

            deid_result = self.run_cli("deid-check", str(out_dir / "normalized"))
            self.assertEqual(deid_result.returncode, 0, deid_result.stderr)
            findings = json.loads((out_dir / "deid-findings.json").read_text())
            self.assertEqual(findings["finding_count"], 0)

            index_result = self.run_cli("index", str(out_dir / "chunks"), "--local-only")
            self.assertEqual(index_result.returncode, 0, index_result.stderr)
            index = json.loads((out_dir / "local-index.json").read_text())
            self.assertEqual(index["local_only"], True)
            self.assertGreater(index["chunk_count"], 0)

            report_result = self.run_cli("report", str(out_dir), "--format", "markdown")
            self.assertEqual(report_result.returncode, 0, report_result.stderr)
            self.assertIn("DATASET_PIPELINE_ALPHA_REPORT", report_result.stdout)
            self.assertIn("local_only: yes", report_result.stdout)
            self.assertIn("remote_upload_used: no", report_result.stdout)
            self.assertIn("verdict: PASS", report_result.stdout)
            self.assertTrue((out_dir / "lineage-report.md").exists())

    def test_deid_check_reports_sensitive_patterns_without_uploading(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            normalized = tmp_path / "dataset-alpha" / "normalized"
            normalized.mkdir(parents=True)
            (normalized / "bad-fixture.txt").write_text(
                "Contact jane@example.com or 555-123-4567 about patient notes.",
                encoding="utf-8",
            )

            result = self.run_cli("deid-check", str(normalized))
            self.assertEqual(result.returncode, 0, result.stderr)
            findings_path = tmp_path / "dataset-alpha" / "deid-findings.json"
            findings = json.loads(findings_path.read_text())
            self.assertEqual(findings["remote_upload_used"], False)
            self.assertEqual(findings["finding_count"], 3)
            self.assertEqual(findings["verdict"], "FLAG")


if __name__ == "__main__":
    unittest.main()
