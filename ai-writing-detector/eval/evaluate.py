"""Measure how often the detector is wrong.

    python eval/build_eval_set.py          # once
    python eval/evaluate.py --split test   # writes eval/results_<split>.md

A document counts as "flagged as AI" when the app's verdict is "Likely AI",
i.e. ai_percent >= report.flag_ai_percent in config.yaml.
"""
from __future__ import annotations

import argparse
import json
import pickle
import sys
import time
from collections import defaultdict
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

from detector.config import load_config  # noqa: E402
from detector.scorer import Analyzer, verdict  # noqa: E402


def load_rows(split: str) -> list[dict]:
    with open(HERE / "data" / f"{split}.jsonl", encoding="utf-8") as f:
        rows = [json.loads(l) for l in f]
    for r in rows:
        r.setdefault("mode", "notes" if "notes" in r["id"] else "essay")
    return rows


def model_outputs(an: Analyzer, rows: list[dict], split: str, clf_name: str) -> dict:
    # Cache of GPT-2/classifier outputs. It is only ever written by this script on your own
    # machine (never downloaded), so loading it with pickle is safe.
    cache = HERE / "data" / f"cache_{split}_{clf_name.replace('/', '__')}.pkl"
    store = pickle.loads(cache.read_bytes()) if cache.exists() else {}
    for r in rows:  # older caches: add paragraph-level classifier scores only (cheap)
        if r["id"] in store and "para_clf" not in store[r["id"]] and an.clf is not None:
            store[r["id"]]["para_clf"] = an.paragraph_probs(store[r["id"]]["sents"])
    t0, todo = time.time(), [r for r in rows if r["id"] not in store]
    for i, r in enumerate(todo):
        store[r["id"]] = an.model_outputs(r["text"])
        if (i + 1) % 25 == 0:
            print(f"  {i + 1}/{len(todo)} docs  ({(time.time() - t0) / (i + 1):.1f}s/doc)", file=sys.stderr)
            cache.write_bytes(pickle.dumps(store))
    cache.write_bytes(pickle.dumps(store))
    return store


def auc(pos: list[float], neg: list[float]) -> float:
    if not pos or not neg:
        return float("nan")
    p, n = np.array(pos)[:, None], np.array(neg)[None, :]
    return float((p > n).mean() + 0.5 * (p == n).mean())


def evaluate(cfg: dict, rows: list[dict], outputs: dict, an: Analyzer) -> dict:
    an.cfg = cfg
    flag_at = float(cfg.get("report", {}).get("flag_ai_percent", 50))
    per_doc = []
    for r in rows:
        res = an.analyze(r["text"], r["mode"], mo=outputs[r["id"]])
        sents = [s for s in res.sentences if s["status"] == "scored"]
        per_doc.append({
            "id": r["id"], "label": r["label"], "source": r["source"], "mode": r["mode"],
            "status": res.status, "ai_percent": res.ai_percent, "avg": res.average_score,
            "verdict": verdict(res, cfg), "confidence": res.confidence,
            "doc_clf": res.doc_signals.get("document_classifier"),
            "flagged": res.status == "ok" and res.ai_percent >= flag_at,
            "red_sent_share": (sum(s["color"] == "red" for s in sents) / len(sents)) if sents else None,
        })
    return {"docs": per_doc, "flag_at": flag_at}


def summarize(ev: dict) -> str:
    docs = ev["docs"]
    lines = []
    by_src = defaultdict(list)
    for d in docs:
        by_src[(d["label"], d["source"])].append(d)
    lines.append(f"Document flagged as AI when ≥{ev['flag_at']:.0f}% of its words are in red sentences.\n")
    lines.append("| Group | Docs | Wrong | Error rate | Mean AI% | Too short |")
    lines.append("|---|---:|---:|---:|---:|---:|")
    for lab in ("human", "ai"):
        group = [d for d in docs if d["label"] == lab and d["status"] == "ok"]
        for (l, src), ds in sorted(by_src.items()):
            if l != lab:
                continue
            ok = [d for d in ds if d["status"] == "ok"]
            wrong = sum(d["flagged"] != (lab == "ai") for d in ok)
            lines.append(f"| {lab} / {src} | {len(ok)} | {wrong} | {100 * wrong / max(1, len(ok)):.0f}% | "
                         f"{np.mean([d['ai_percent'] for d in ok]):.0f} | {len(ds) - len(ok)} |")
        wrong = sum(d["flagged"] != (lab == "ai") for d in group)
        name = "FALSE POSITIVES (human flagged as AI)" if lab == "human" else "MISSED AI (AI not flagged)"
        lines.append(f"| **{name}** | **{len(group)}** | **{wrong}** | **{100 * wrong / max(1, len(group)):.0f}%** | | |")
    ok = [d for d in docs if d["status"] == "ok"]
    h = [d["avg"] for d in ok if d["label"] == "human"]
    a = [d["avg"] for d in ok if d["label"] == "ai"]
    hc = [d["doc_clf"] for d in ok if d["label"] == "human" and d["doc_clf"] is not None]
    ac = [d["doc_clf"] for d in ok if d["label"] == "ai" and d["doc_clf"] is not None]
    lines.append("")
    lines.append(f"AUC (combined average score): {auc(a, h):.3f}   |   AUC (classifier alone, whole doc): {auc(ac, hc):.3f}")
    lines.append("")
    lines.append("How often the verdict was wrong at each confidence level (Mixed/unclear verdicts excluded):")
    lines.append("")
    lines.append("| Confidence | Docs with a Likely AI / Likely human verdict | Wrong |")
    lines.append("|---|---:|---:|")
    for c in ("High", "Medium", "Low"):
        ds = [d for d in ok if d["confidence"] == c and d["verdict"] in ("Likely AI", "Likely human")]
        wrong = sum((d["verdict"] == "Likely AI") != (d["label"] == "ai") for d in ds)
        lines.append(f"| {c} | {len(ds)} | {wrong} ({100 * wrong / max(1, len(ds)):.0f}%) |")
    vc = defaultdict(lambda: defaultdict(int))
    for d in docs:
        vc[d["label"]][d["verdict"]] += 1
    lines.append("")
    lines.append("Verdicts shown in the app: " + "; ".join(
        f"{lab}: " + ", ".join(f"{k} {v}" for k, v in sorted(vc[lab].items())) for lab in ("human", "ai")))
    return "\n".join(lines)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--split", default="test", choices=["dev", "test"])
    ap.add_argument("--classifier", default=None, help="override models.classifier from config.yaml")
    ap.add_argument("--config", default=None)
    args = ap.parse_args()
    cfg = load_config(args.config)
    if args.classifier:
        cfg["models"]["classifier"] = args.classifier
    rows = load_rows(args.split)
    an = Analyzer(cfg)
    outputs = model_outputs(an, rows, args.split, cfg["models"]["classifier"])
    ev = evaluate(cfg, rows, outputs, an)
    report = f"# Evaluation — {args.split} split — classifier: {cfg['models']['classifier']}\n\n" + summarize(ev)
    (HERE / f"results_{args.split}.md").write_text(report + "\n", encoding="utf-8")
    (HERE / "data" / f"per_doc_{args.split}.json").write_text(json.dumps(ev["docs"], indent=1))
    print(report)


if __name__ == "__main__":
    main()
