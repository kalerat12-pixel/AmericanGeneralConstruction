"""Local storage: past scans (SQLite) and your "My writing" samples.

Everything lives in the `data/` folder next to the app (or AIDETECT_DATA_DIR).
Nothing is uploaded anywhere.
"""
from __future__ import annotations

import json
import os
import re
import sqlite3
import time
from datetime import datetime
from pathlib import Path

from .config import ROOT

DATA_DIR = Path(os.environ.get("AIDETECT_DATA_DIR", ROOT / "data"))


def _data_dir() -> Path:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    return DATA_DIR


# =====================================================================
#  Scan history
# =====================================================================
SCHEMA = """
CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created REAL NOT NULL,
    paper TEXT NOT NULL,
    draft_label TEXT,
    source_name TEXT,
    mode TEXT NOT NULL,
    ai_percent REAL,
    unclear_percent REAL,
    average_score REAL,
    confidence TEXT,
    verdict TEXT,
    n_words INTEGER,
    calibrated INTEGER,
    text TEXT NOT NULL,
    result_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS scans_paper ON scans(paper);
"""


class History:
    def __init__(self, path: str | Path | None = None):
        self.path = Path(path) if path else _data_dir() / "history.db"
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self._conn() as c:
            c.executescript(SCHEMA)

    def _conn(self):
        c = sqlite3.connect(self.path)
        c.row_factory = sqlite3.Row
        return c

    def save(self, paper: str, result: dict, text: str, verdict: str, draft_label: str = "",
             source_name: str = "") -> int:
        paper = (paper or "").strip() or "Untitled paper"
        with self._conn() as c:
            n = c.execute("SELECT COUNT(*) FROM scans WHERE paper = ?", (paper,)).fetchone()[0]
            cur = c.execute(
                "INSERT INTO scans (created, paper, draft_label, source_name, mode, ai_percent, unclear_percent, "
                "average_score, confidence, verdict, n_words, calibrated, text, result_json) "
                "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                (time.time(), paper, draft_label.strip() or f"Draft {n + 1}", source_name, result["mode"],
                 result["ai_percent"], result["unclear_percent"], result["average_score"], result["confidence"],
                 verdict, result["n_words"], int(bool(result.get("calibrated"))), text, json.dumps(result)),
            )
            return int(cur.lastrowid)

    def papers(self) -> list[str]:
        with self._conn() as c:
            return [r[0] for r in c.execute(
                "SELECT paper FROM scans GROUP BY paper ORDER BY MAX(created) DESC")]

    def list(self, paper: str | None = None) -> list[dict]:
        q = ("SELECT id, created, paper, draft_label, source_name, mode, ai_percent, unclear_percent, "
             "average_score, confidence, verdict, n_words, calibrated FROM scans")
        args: tuple = ()
        if paper:
            q += " WHERE paper = ?"
            args = (paper,)
        with self._conn() as c:
            rows = [dict(r) for r in c.execute(q + " ORDER BY created ASC, id ASC", args)]
        for r in rows:
            r["when"] = datetime.fromtimestamp(r["created"]).strftime("%Y-%m-%d %H:%M")
        return rows

    def get(self, scan_id: int) -> dict | None:
        with self._conn() as c:
            r = c.execute("SELECT * FROM scans WHERE id = ?", (scan_id,)).fetchone()
        if not r:
            return None
        d = dict(r)
        d["result"] = json.loads(d.pop("result_json"))
        return d

    def delete(self, scan_id: int) -> None:
        with self._conn() as c:
            c.execute("DELETE FROM scans WHERE id = ?", (scan_id,))


def compare_scans(old: dict, new: dict) -> dict:
    """Match sentences between two drafts by normalised text."""
    def key(t: str) -> str:
        return re.sub(r"\W+", " ", t.lower()).strip()

    old_s = {key(s["text"]): s for s in old["result"]["sentences"]}
    new_s = {key(s["text"]): s for s in new["result"]["sentences"]}
    rows = []
    for k, s in new_s.items():
        o = old_s.get(k)
        if o is None:
            rows.append({"change": "new", "text": s["text"], "old": None, "new": s.get("score"), "color": s["color"]})
        else:
            rows.append({"change": "same", "text": s["text"], "old": o.get("score"), "new": s.get("score"),
                         "color": s["color"]})
    removed = [{"change": "removed", "text": s["text"], "old": s.get("score"), "new": None, "color": s["color"]}
               for k, s in old_s.items() if k not in new_s]

    def d(field):
        a, b = old.get(field), new.get(field)
        return None if a is None or b is None else round(b - a, 1)

    return {
        "ai_percent_change": d("ai_percent"),
        "average_score_change": d("average_score"),
        "rows": rows,
        "removed": removed,
        "n_new": sum(r["change"] == "new" for r in rows),
        "n_removed": len(removed),
        "n_same": sum(r["change"] == "same" for r in rows),
    }


# =====================================================================
#  "My writing" samples + calibration profile
# =====================================================================
class MyWriting:
    def __init__(self, folder: str | Path | None = None):
        self.folder = Path(folder) if folder else _data_dir() / "my_writing"
        self.samples_dir = self.folder / "samples"
        self.samples_dir.mkdir(parents=True, exist_ok=True)
        self.profile_path = self.folder / "profile.json"

    def add(self, name: str, text: str) -> Path:
        safe = re.sub(r"[^A-Za-z0-9_.-]+", "_", name).strip("._")[:60] or "sample"
        path = self.samples_dir / f"{int(time.time() * 1000)}_{safe}.txt"
        path.write_text(text, encoding="utf-8")
        self.clear_profile()
        return path

    def list(self) -> list[dict]:
        out = []
        for p in sorted(self.samples_dir.glob("*.txt")):
            t = p.read_text(encoding="utf-8")
            out.append({"file": p.name, "name": p.stem.split("_", 1)[-1], "words": len(t.split()),
                        "preview": t[:160]})
        return out

    def texts(self) -> list[str]:
        return [p.read_text(encoding="utf-8") for p in sorted(self.samples_dir.glob("*.txt"))]

    def remove(self, file: str) -> None:
        p = (self.samples_dir / file).resolve()
        if p.parent == self.samples_dir.resolve() and p.exists():
            p.unlink()
        self.clear_profile()

    def save_profile(self, profile: dict) -> None:
        self.profile_path.write_text(json.dumps(profile), encoding="utf-8")

    def load_profile(self) -> dict | None:
        if not self.profile_path.exists():
            return None
        p = json.loads(self.profile_path.read_text(encoding="utf-8"))
        return p if p.get("ok") else None

    def clear_profile(self) -> None:
        if self.profile_path.exists():
            self.profile_path.unlink()
