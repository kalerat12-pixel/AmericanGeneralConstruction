"""Combine all signals into per-sentence scores, reasons, an overall score,
a confidence level and a summary of patterns."""
from __future__ import annotations

import bisect
import math
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass, field

import numpy as np

from .config import SIGNALS, load_config
from .models import get_classifier, get_language_model
from .segment import Sentence, count_words, split_sentences
from .style_rules import CATEGORY_NAMES, StyleRules

COLORS = ("green", "yellow", "red")


@dataclass
class SentenceResult:
    index: int
    text: str
    start: int
    end: int
    n_words: int
    status: str  # "scored" | "too_short"
    score: float | None = None
    color: str = "gray"
    signals: dict = field(default_factory=dict)  # 0-100 per signal (after calibration)
    raw_signals: dict = field(default_factory=dict)  # 0-100 per signal (before calibration)
    details: dict = field(default_factory=dict)
    reasons: list = field(default_factory=list)
    style_hits: list = field(default_factory=list)  # [{"label","category"}]


@dataclass
class DocumentResult:
    mode: str
    status: str  # "ok" | "too_short"
    n_words: int
    ai_percent: float | None  # % of scored words in red sentences
    unclear_percent: float | None  # % of scored words in yellow sentences
    average_score: float | None
    confidence: str  # High / Medium / Low / Not enough text
    confidence_reasons: list
    patterns: list  # [{"name","count","examples"}]
    doc_signals: dict
    sentences: list
    calibrated: bool = False
    classifier_name: str = ""

    def to_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------------
def _lin(x: float, ai_like: float, human_like: float) -> float:
    """Map x to 0-100, 100 at ai_like, 0 at human_like (either direction)."""
    if ai_like == human_like:
        return 50.0
    t = (x - human_like) / (ai_like - human_like)
    return float(min(100.0, max(0.0, 100.0 * t)))


class Analyzer:
    def __init__(self, cfg: dict | None = None, load_models: bool = True):
        self.cfg = cfg or load_config()
        m = self.cfg["models"]
        self.lm = get_language_model(m["language_model"]) if load_models else None
        self.clf = get_classifier(m.get("classifier", "none")) if load_models else None
        self.style = StyleRules(self.cfg)

    # ------------------------------------------------------------------
    def model_outputs(self, text: str) -> dict:
        """The slow part: run GPT-2 and the classifier once. Result can be cached."""
        sents = split_sentences(text)
        out: dict = {"sents": sents, "lm": None, "clf": {}, "doc_clf": None}
        if not sents:
            return out
        if self.lm is not None:
            out["lm"] = self.lm.sentence_stats(text, sents)
        if self.clf is not None:
            ctx = int(self.cfg["models"].get("classifier_context_sentences", 1))
            idx = [i for i, s in enumerate(sents) if s.n_words >= 3]
            windows = [" ".join(x.text for x in sents[max(0, i - ctx): i + ctx + 1]) for i in idx]
            if windows:
                out["clf"] = dict(zip(idx, self.clf.predict(windows)))
            out["doc_clf"] = self.clf.predict_document(text)
        return out

    def raw_signals(self, text: str, mode: str = "essay", mo: dict | None = None
                    ) -> tuple[list[Sentence], list[SentenceResult], dict]:
        """Compute uncalibrated 0-100 signals for every sentence."""
        mo = mo if mo is not None else self.model_outputs(text)
        mcfg = self.cfg["modes"][mode]
        pcfg = self.cfg["perplexity"]
        sents = mo["sents"]
        results = [
            SentenceResult(i, s.text, s.start, s.end, s.n_words,
                           "scored" if s.n_words >= mcfg["min_words_sentence"] else "too_short")
            for i, s in enumerate(sents)
        ]
        doc: dict = {}
        if not sents:
            return sents, results, doc

        # --- style --------------------------------------------------------
        style_res, style_notes = self.style.analyze(sents)
        doc.update(style_notes)
        for r, sr in zip(results, style_res):
            r.raw_signals["style"] = sr.score
            r.style_hits = [{"label": h.label, "category": h.category, "key": h.key} for h in sr.hits]

        # --- GPT-2 predictability ----------------------------------------
        if mo["lm"] is not None:
            stats = mo["lm"]
            for r, st in zip(results, stats):
                if st.log_ppl is None:
                    continue
                r.details["perplexity"] = round(math.exp(st.log_ppl), 1)
                r.details["log_ppl"] = st.log_ppl
                r.details["top10_rate"] = st.top10_rate
                a = _lin(st.log_ppl, pcfg["ai_like"], pcfg["human_like"])
                b = _lin(st.top10_rate, pcfg.get("top10_ai_like", 0.80), pcfg.get("top10_human_like", 0.55))
                r.raw_signals["perplexity"] = 0.5 * a + 0.5 * b
            lp = [r.details["log_ppl"] for r in results if "log_ppl" in r.details and r.status == "scored"]
            if lp:
                doc["mean_perplexity"] = float(math.exp(np.mean(lp)))
                doc["perplexity_spread"] = float(np.std(lp))

        # --- uniformity / burstiness (local window) -----------------------
        ucfg = self.cfg.get("uniformity", {})
        k = int(ucfg.get("window", 3))
        lengths = [s.n_words for s in sents]
        for i, r in enumerate(results):
            lo, hi = max(0, i - k), min(len(sents), i + k + 1)
            win = [j for j in range(lo, hi) if results[j].status == "scored"]
            if len(win) < 4:
                continue
            L = np.array([lengths[j] for j in win], dtype=float)
            cv = float(L.std() / max(1.0, L.mean()))
            parts = [_lin(cv, ucfg.get("length_cv_ai_like", 0.20), ucfg.get("length_cv_human_like", 0.60))]
            P = [results[j].details["log_ppl"] for j in win if "log_ppl" in results[j].details]
            if len(P) >= 4:
                sd = float(np.std(P))
                parts.append(_lin(sd, ucfg.get("ppl_sd_ai_like", 0.25), ucfg.get("ppl_sd_human_like", 0.75)))
                r.details["local_ppl_sd"] = sd
            r.details["local_length_range"] = (int(L.min()), int(L.max()))
            r.details["local_length_cv"] = cv
            r.raw_signals["uniformity"] = float(np.mean(parts))
        scored_len = np.array([lengths[i] for i, r in enumerate(results) if r.status == "scored"], dtype=float)
        if len(scored_len) >= 3:
            doc["length_cv"] = float(scored_len.std() / max(1.0, scored_len.mean()))

        # --- classifier ----------------------------------------------------
        for i, p in mo["clf"].items():
            if results[i].status == "scored":
                results[i].raw_signals["classifier"] = 100.0 * p
                results[i].details["classifier_prob"] = p
        if mo["doc_clf"] is not None:
            doc["document_classifier"] = mo["doc_clf"]
        return sents, results, doc

    # ------------------------------------------------------------------
    def analyze(self, text: str, mode: str = "essay", profile: dict | None = None,
                mo: dict | None = None) -> DocumentResult:
        mcfg = self.cfg["modes"][mode]
        weights = {k: float(v) for k, v in mcfg["weights"].items() if float(v) > 0}
        th = mcfg["thresholds"]
        strength = float(self.cfg["calibration"].get("strength", 0.6)) if profile else 0.0

        # habits from the user's own writing soften matching style rules
        self.style.habit_labels = set(profile.get("habits", [])) if profile else set()
        sents, results, doc = self.raw_signals(text, mode, mo)
        self.style.habit_labels = set()
        n_words = count_words(text)

        too_short_doc = n_words < mcfg["min_words_document"] or not any(r.status == "scored" for r in results)
        for r in results:
            if too_short_doc:
                r.status = "too_short"
            if r.status != "scored":
                r.reasons = [f"Not enough text to judge (fewer than {mcfg['min_words_sentence']} words)"
                             if not too_short_doc else
                             f"Not enough text to judge (document is under {mcfg['min_words_document']} words)"]
                continue
            r.signals = dict(r.raw_signals)
            if profile and strength > 0:
                for s in ("perplexity", "classifier", "uniformity"):
                    dist = profile.get("distributions", {}).get(s)
                    if s in r.signals and dist:
                        v = r.signals[s]
                        pct = 100.0 * bisect.bisect_left(dist, v) / len(dist)
                        r.signals[s] = (1 - strength) * v + strength * min(v, pct)
            usable = {k: w for k, w in weights.items() if k in r.signals}
            if not usable:
                r.status = "too_short"
                r.reasons = ["Not enough text to judge"]
                continue
            total_w = sum(usable.values())
            r.score = round(sum(r.signals[k] * w for k, w in usable.items()) / total_w, 1)
            raw_score = sum(r.raw_signals[k] * w for k, w in usable.items()) / total_w
            r.color = "green" if r.score < th["green_below"] else ("red" if r.score >= th["red_at_or_above"] else "yellow")
            r.reasons = self._reasons(r, raw_score if profile else None)

        scored = [r for r in results if r.status == "scored"]
        if too_short_doc or not scored:
            return DocumentResult(
                mode=mode, status="too_short", n_words=n_words, ai_percent=None, unclear_percent=None,
                average_score=None, confidence="Not enough text",
                confidence_reasons=[f"Only {n_words} words — need at least {mcfg['min_words_document']} "
                                    f"in {mode} mode for a meaningful estimate."],
                patterns=self._patterns(results), doc_signals=doc, sentences=[asdict(r) for r in results],
                calibrated=bool(profile), classifier_name=self._clf_name())

        words = sum(r.n_words for r in scored)
        red = sum(r.n_words for r in scored if r.color == "red")
        yellow = sum(r.n_words for r in scored if r.color == "yellow")
        avg = float(np.average([r.score for r in scored], weights=[r.n_words for r in scored]))
        ai_pct = 100.0 * red / words
        conf, conf_reasons = self._confidence(mode, n_words, scored, doc, ai_pct)
        return DocumentResult(
            mode=mode, status="ok", n_words=n_words, ai_percent=round(ai_pct, 1),
            unclear_percent=round(100.0 * yellow / words, 1), average_score=round(avg, 1),
            confidence=conf, confidence_reasons=conf_reasons, patterns=self._patterns(results),
            doc_signals=doc, sentences=[asdict(r) for r in results], calibrated=bool(profile),
            classifier_name=self._clf_name())

    def _clf_name(self) -> str:
        return self.clf.name if self.clf is not None else "none"

    # ------------------------------------------------------------------
    def _reasons(self, r: SentenceResult, raw_score: float | None) -> list[str]:
        out: list[str] = []
        s, d = r.signals, r.details
        if s.get("perplexity", 0) >= 60:
            out.append(f"Very predictable wording: GPT-2 guessed {d.get('top10_rate', 0):.0%} of the words "
                       f"among its top 10 (perplexity {d.get('perplexity', 0):.0f}; lower = more predictable)")
        elif s.get("perplexity", 100) <= 25 and "perplexity" in d:
            out.append(f"Less predictable, human-like word choices (perplexity {d['perplexity']:.0f})")
        if s.get("classifier", 0) >= 60:
            out.append(f"The AI-text classifier rated this passage {d.get('classifier_prob', 0):.0%} likely AI")
        elif "classifier" in s and s["classifier"] <= 25:
            out.append(f"The AI-text classifier rated this passage as likely human ({d.get('classifier_prob', 0):.0%} AI)")
        for h in r.style_hits:
            prefix = CATEGORY_NAMES.get(h["category"], h["category"]).rstrip("s")
            out.append(f"{prefix}: {h['label']}")
        if s.get("uniformity", 0) >= 60:
            lo, hi = d.get("local_length_range", (0, 0))
            out.append(f"Sentence lengths and predictability are very even around here ({lo}–{hi} words per sentence)")
        if raw_score is not None and r.score is not None and raw_score - r.score >= 3:
            out.append(f"Matches your own writing style — score lowered by {raw_score - r.score:.0f} points")
        if not out:
            out.append("No strong signals either way")
        return out

    def _patterns(self, results: list[SentenceResult]) -> list[dict]:
        counts: Counter = Counter()
        examples: dict = defaultdict(Counter)
        for r in results:
            seen = set()
            for h in r.style_hits:
                cat = CATEGORY_NAMES.get(h["category"], h["category"])
                if cat not in seen:
                    counts[cat] += 1
                    seen.add(cat)
                examples[cat][h["label"]] += 1
            if r.status != "scored":
                continue
            if r.signals.get("perplexity", 0) >= 60:
                counts["Very predictable wording"] += 1
            if r.signals.get("uniformity", 0) >= 60:
                counts["Even sentence lengths (low burstiness)"] += 1
            if r.signals.get("classifier", 0) >= 60:
                counts["Classifier flagged as AI-like"] += 1
        return [{"name": k, "count": v, "examples": [e for e, _ in examples[k].most_common(3)]}
                for k, v in counts.most_common()]

    def _confidence(self, mode, n_words, scored, doc, ai_pct) -> tuple[str, list[str]]:
        pts, why = 0, []
        if n_words >= 300:
            pts += 2
        elif n_words >= 150:
            pts += 1
            why.append("Fairly short text — estimates get steadier with 300+ words")
        else:
            why.append("Short text — estimates are unreliable under ~150 words")
        if mode == "essay":
            pts += 1
        else:
            why.append("Notes mode: fragments and bullet points are hard to judge")
        if self.clf is not None:
            pts += 1
        else:
            why.append("The AI classifier is turned off")
        # do the independent signals agree?
        means = {k: np.mean([r.signals[k] for r in scored if k in r.signals])
                 for k in SIGNALS if any(k in r.signals for r in scored)}
        main = {k: v for k, v in means.items() if k in ("perplexity", "classifier")}
        if len(main) == 2:
            if (main["perplexity"] >= 50) == (main["classifier"] >= 50):
                pts += 1
            else:
                pts -= 1
                why.append("The predictability measure and the classifier disagree")
        if ai_pct >= 70 or ai_pct <= 10:
            pts += 1
        else:
            why.append("Mixed result — some parts look AI-like and others don't")
        level = "High" if pts >= 5 else "Medium" if pts >= 3 else "Low"
        if mode == "notes" and level == "High":
            level = "Medium"
        if not why:
            why.append("Long text, signals agree, and the result is clear-cut")
        return level, why


# ---------------------------------------------------------------------
def verdict(res: "DocumentResult", cfg: dict) -> str:
    """One-line label shown next to the overall score."""
    if res.status != "ok":
        return "Not enough text"
    rep = cfg.get("report", {})
    if res.ai_percent >= float(rep.get("flag_ai_percent", 50)):
        return "Likely AI"
    if res.ai_percent >= float(rep.get("mixed_ai_percent", 20)):
        return "Mixed / unclear"
    return "Likely human"


def build_profile(analyzer: Analyzer, samples: list[str], min_words: int = 150) -> dict:
    """Baseline from text the user wrote: distributions of each signal plus style habits."""
    dists: dict[str, list[float]] = {s: [] for s in ("perplexity", "classifier", "uniformity", "style")}
    all_sents: list[Sentence] = []
    words = 0
    for text in samples:
        if not text.strip():
            continue
        sents, results, _ = analyzer.raw_signals(text, "essay")
        all_sents += sents
        words += count_words(text)
        for r in results:
            if r.status == "scored":
                for k in dists:
                    if k in r.raw_signals:
                        dists[k].append(float(r.raw_signals[k]))
    if words < min_words:
        return {"ok": False, "words": words, "message": f"Add more of your writing: {words} words so far, "
                                                         f"need at least {min_words}."}
    rates = analyzer.style.habit_rates(all_sents)
    habit_th = float(analyzer.cfg["calibration"].get("habit_rate_per_1000_words", 1.0))
    habits = sorted(k for k, v in rates.items() if v >= habit_th)
    return {
        "ok": True,
        "words": words,
        "n_samples": len([s for s in samples if s.strip()]),
        "distributions": {k: sorted(v) for k, v in dists.items() if v},
        "medians": {k: float(np.median(v)) for k, v in dists.items() if v},
        "habits": habits,
    }
