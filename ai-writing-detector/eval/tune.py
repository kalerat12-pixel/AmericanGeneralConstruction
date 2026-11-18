"""Search signal weights + red threshold on the DEV split (never the test split).

    python eval/tune.py [--classifier NAME] [--max-fpr 0.05]

Objective: catch as much AI text as possible while flagging at most `max-fpr`
of human documents as "Likely AI" (false accusations are the costly error).
Prints the best settings; copy them into config.yaml yourself.
"""
from __future__ import annotations

import argparse
import itertools
import pickle
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

from detector.config import load_config  # noqa: E402
from detector.scorer import Analyzer  # noqa: E402
from eval.evaluate import auc, load_rows  # noqa: E402

SIG = ("perplexity", "classifier", "style", "uniformity")


def doc_matrices(cfg, rows, outputs, mode="essay"):
    an = Analyzer(cfg, load_models=False)
    docs = []
    for r in rows:
        _, res, _ = an.raw_signals(r["text"], r["mode"], outputs[r["id"]])
        sc = [x for x in res if x.status == "scored"]
        if not sc:
            continue
        M = np.array([[x.raw_signals.get(k, np.nan) for k in SIG] for x in sc])
        w = np.array([x.n_words for x in sc], dtype=float)
        docs.append((r["label"] == "ai", r["source"], M, w))
    return docs


def score_docs(docs, weights, red, flag_at):
    W = np.array(weights)
    flagged, avg = [], []
    for _, _, M, w in docs:
        mask = ~np.isnan(M)
        num = np.nansum(M * W, axis=1)
        den = (mask * W).sum(axis=1)
        s = np.where(den > 0, num / np.maximum(den, 1e-9), 0)
        ai_pct = 100 * w[s >= red].sum() / w.sum()
        flagged.append(ai_pct >= flag_at)
        avg.append(np.average(s, weights=w))
    return np.array(flagged), np.array(avg)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--classifier", default=None)
    ap.add_argument("--max-fpr", type=float, default=0.05)
    args = ap.parse_args()
    cfg = load_config()
    if args.classifier:
        cfg["models"]["classifier"] = args.classifier
    clf = cfg["models"]["classifier"].replace("/", "__")
    rows = [r for r in load_rows("dev") if r["mode"] == "essay"]
    # Cache of model outputs written by evaluate.py on this machine; safe to unpickle.
    outputs = pickle.loads((HERE / "data" / f"cache_dev_{clf}.pkl").read_bytes())
    docs = doc_matrices(cfg, rows, outputs)
    y = np.array([d[0] for d in docs])
    flag_at = float(cfg.get("report", {}).get("flag_ai_percent", 50))
    best = []
    grid = itertools.product([0, 0.1, 0.2, 0.3], [0.3, 0.4, 0.5, 0.6, 0.7], [0, 0.1, 0.2, 0.3],
                             [0, 0.1, 0.2], range(50, 86, 5))
    for wp, wc, ws, wu, red in grid:
        f, avg = score_docs(docs, (wp, wc, ws, wu), red, flag_at)
        fpr = f[~y].mean()
        tpr = f[y].mean()
        if fpr <= args.max_fpr:
            best.append((tpr, -fpr, auc(list(avg[y]), list(avg[~y])), (wp, wc, ws, wu), red))
    best.sort(reverse=True)
    print(f"dev docs: {len(docs)} ({y.sum()} AI, {(~y).sum()} human); max FPR {args.max_fpr:.0%}")
    for tpr, nfpr, a, w, red in best[:10]:
        print(f"  catch {tpr:.0%}  FPR {-nfpr:.0%}  AUC {a:.3f}  weights p/c/s/u={w}  red>={red}")


if __name__ == "__main__":
    main()
