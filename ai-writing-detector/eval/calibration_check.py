"""Does the "My writing" baseline help? Proxy experiment:

For each human writing group (students, non-native academics, Wikipedia), build a
profile from 4 DEV documents of that group (standing in for "your own samples"),
then score the TEST documents of that group and all AI test documents with and
without the profile.

    python eval/calibration_check.py      (needs evaluate.py --split dev/test run first)
"""
from __future__ import annotations

import pickle
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

from detector.config import load_config  # noqa: E402
from detector.scorer import Analyzer  # noqa: E402
from eval.evaluate import load_rows  # noqa: E402


class CachedAnalyzer(Analyzer):
    def __init__(self, cfg, cache):
        super().__init__(cfg, load_models=False)
        self.cache = cache

    def model_outputs(self, text):
        return self.cache[text]


def main():
    cfg = load_config()
    clf = cfg["models"]["classifier"].replace("/", "__")
    flag = float(cfg.get("report", {}).get("flag_ai_percent", 50))
    cache = {}
    rows = {}
    for split in ("dev", "test"):
        rows[split] = [r for r in load_rows(split) if r["mode"] == "essay"]
        # caches are produced locally by evaluate.py; safe to unpickle
        mo = pickle.loads((HERE / "data" / f"cache_{split}_{clf}.pkl").read_bytes())
        for r in rows[split]:
            cache[r["text"]] = mo[r["id"]]
    an = CachedAnalyzer(cfg, cache)
    ai_test = [r for r in rows["test"] if r["label"] == "ai"]
    print(f"| Profile built from | Human test docs flagged (no → with baseline) | AI test docs caught (no → with) |")
    print("|---|---|---|")
    for src in ("student", "esl", "wiki"):
        samples = [r["text"] for r in rows["dev"] if r["source"] == src][:4]
        from detector.scorer import build_profile

        prof = build_profile(an, samples)
        human = [r for r in rows["test"] if r["source"] == src]

        def rate(docs, profile):
            res = [an.analyze(r["text"], "essay", profile=profile, mo=cache[r["text"]]) for r in docs]
            return np.mean([x.status == "ok" and x.ai_percent >= flag for x in res])

        print(f"| 4 {src} essays ({prof['words']} words) | {rate(human, None):.0%} → {rate(human, prof):.0%} "
              f"| {rate(ai_test, None):.0%} → {rate(ai_test, prof):.0%} |")


if __name__ == "__main__":
    main()
