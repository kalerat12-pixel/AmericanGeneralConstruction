"""Download public human / AI text and build a fixed dev/test evaluation set.

    python eval/build_eval_set.py

Writes eval/data/dev.jsonl and eval/data/test.jsonl (not committed — the
source datasets have their own licences). Sources:

HUMAN
  student   PERSUADE 2.0 corpus: US grade 6-12 essays, written 2010-2020
            (before ChatGPT).          hf: realbenpope/PERSUADE_manageable
  esl       Academic paragraphs by authors at non-English-speaking institutions
            (PubMed Central, CC-BY).   hf: textsightai/ai-text-detection-benchmark-2026
  wiki      Wikipedia text from before 2022.   (same benchmark)
AI
  modern    2026 output of Claude Opus 5, Claude Haiku 4.5, GPT-4.1,
            gpt-oss-120b, Qwen 3.8 (academic + encyclopedic).  (same benchmark)
  student_llm  Llama models fine-tuned to imitate the PERSUADE student essays
            (hard, adversarial case).  hf: ramensoft/daigt_v4
  claude_student  Student-style essays written by Claude for this project
            (eval/samples/ai_claude_student/*.txt) — test split only.
"""
from __future__ import annotations

import json
import random
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "data"
SEED = 7
MAX_WORDS = 600

COUNTS = {  # total per source, split 50/50 into dev/test
    ("human", "student"): 120,
    ("human", "esl"): 60,
    ("human", "wiki"): 40,
    ("ai", "modern"): 56,
    ("ai", "student_llm"): 80,
}


def truncate(text: str, max_words: int = MAX_WORDS) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text.strip()
    cut = " ".join(words[:max_words])
    m = list(re.finditer(r"[.!?][\"'”’)]?(\s|$)", cut))
    return cut[: m[-1].end()].strip() if m else cut


def load_sources() -> dict:
    import pandas as pd
    from huggingface_hub import hf_hub_download

    src: dict = {}
    p = hf_hub_download("realbenpope/PERSUADE_manageable", "persuade_full_text.csv", repo_type="dataset")
    df = pd.read_csv(p)
    src[("human", "student")] = [t for t in df["full_text"].dropna().tolist() if 150 <= len(t.split())]

    bench = "textsightai/ai-text-detection-benchmark-2026"

    def jl(name):
        with open(hf_hub_download(bench, f"data/{name}", repo_type="dataset"), encoding="utf-8") as f:
            return [json.loads(l) for l in f if l.strip()]

    src[("human", "esl")] = [r["text"] for r in jl("human_pmc_ccby_nonanglophone.jsonl")]
    src[("human", "wiki")] = [r["text"] for r in jl("human_wikipedia_pre2022.jsonl")]
    modern = jl("ai_generated_2026-09-29.jsonl")
    src[("ai", "modern")] = [(r["text"], r["source"]) for r in modern]

    p = hf_hub_download("ramensoft/daigt_v4", "daigt_magic_generations.csv", repo_type="dataset")
    d = pd.read_csv(p)
    src[("ai", "student_llm")] = [t for t in d[d.label == 1]["text"].dropna().tolist() if 150 <= len(t.split())]
    return src


def main() -> None:
    rng = random.Random(SEED)
    src = load_sources()
    dev, test = [], []
    for (label, source), n in COUNTS.items():
        pool = list(src[(label, source)])
        rng.shuffle(pool)
        picked = pool[:n]
        for i, item in enumerate(picked):
            text, gen = (item if isinstance(item, tuple) else (item, ""))
            row = {"id": f"{source}-{i}", "label": label, "source": source, "generator": gen,
                   "text": truncate(text)}
            (dev if i % 2 == 0 else test).append(row)
    for f in sorted((HERE / "samples" / "ai_claude_student").glob("*.txt")):
        test.append({"id": f"claude_student-{f.stem}", "label": "ai", "source": "claude_student",
                     "generator": "claude", "text": f.read_text(encoding="utf-8").strip()})
    OUT.mkdir(exist_ok=True)
    for name, rows in (("dev", dev), ("test", test)):
        with open(OUT / f"{name}.jsonl", "w", encoding="utf-8") as fh:
            for r in rows:
                fh.write(json.dumps(r) + "\n")
        print(f"{name}: {len(rows)} documents", file=sys.stderr)


if __name__ == "__main__":
    main()
