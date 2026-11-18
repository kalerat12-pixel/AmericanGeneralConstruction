"""Rule-based style signal: stock AI phrases, hedging, filler transitions,
em-dashes, lists of three and generic conclusions. All rules live in config.yaml."""
from __future__ import annotations

import math
import re
from dataclasses import dataclass, field

from .segment import Sentence, count_words

CATEGORY_NAMES = {
    "stock_phrase": "Stock AI phrases",
    "hedging": "Too much hedging",
    "filler_transition": "Filler transitions",
    "generic_conclusion": "Generic conclusions",
    "chatbot_leftover": "Chatbot leftovers",
    "em_dash": "Heavy em-dash use",
    "triplet": "Lists of three",
    "transition_overuse": "Transition overuse",
}

# "X, Y, and Z" / "X, Y and Z" with short items (1-4 words each)
_ITEM = r"[A-Za-z][\w'’-]*(?: [\w'’-]+){0,3}"
TRIPLET_RE = re.compile(rf"\b{_ITEM}, {_ITEM},? (?:and|or) {_ITEM}\b")
EM_DASH_RE = re.compile(r"—|(?<=\w) -- (?=\w)|(?<=\w)--(?=\w)")
TRANSITION_START_RE = re.compile(
    r"^\W*(moreover|furthermore|additionally|consequently|nevertheless|nonetheless|notably|importantly|"
    r"ultimately|indeed|thus|hence|in addition|on the other hand|as a result|that being said|however|"
    r"overall|in conclusion|similarly|likewise|therefore)\b",
    re.IGNORECASE,
)


@dataclass
class StyleHit:
    label: str
    category: str
    weight: float
    match: str = ""
    key: str = ""  # stable id used for calibration habits

    def __post_init__(self):
        if not self.key:
            self.key = self.label


@dataclass
class StyleResult:
    score: float  # 0-100
    hits: list[StyleHit] = field(default_factory=list)


class StyleRules:
    def __init__(self, cfg: dict):
        sr = cfg["style_rules"]
        self.rules = [
            (re.compile(r["pattern"], re.IGNORECASE), float(r["weight"]), r["label"], r["category"])
            for r in sr.get("phrases", [])
        ]
        self.em = sr.get("em_dash", {})
        self.tri = sr.get("triplets", {})
        self.trans = sr.get("transitions", {})
        # labels downweighted because they match the user's own habits (set by calibration)
        self.habit_labels: set[str] = set()
        self.habit_factor = 0.2

    # ---- per sentence -------------------------------------------------
    def sentence_hits(self, text: str) -> list[StyleHit]:
        hits: list[StyleHit] = []
        for rx, w, label, cat in self.rules:
            m = rx.search(text)
            if m:
                hits.append(StyleHit(label, cat, w, m.group(0)))
        n_dash = len(EM_DASH_RE.findall(text))
        if self.em and n_dash >= int(self.em.get("per_sentence_threshold", 2)):
            hits.append(StyleHit(f"{n_dash} em-dashes in one sentence", "em_dash", float(self.em.get("weight", 25)), key="em_dash"))
        m = TRIPLET_RE.search(text)
        if self.tri and m:
            hits.append(StyleHit(f'list of three ("{m.group(0)[:60]}")', "triplet", float(self.tri.get("weight", 15)), m.group(0), key="triplet"))
        return hits

    def _score(self, hits: list[StyleHit]) -> float:
        total = 0.0
        for h in hits:
            w = h.weight * (self.habit_factor if h.key in self.habit_labels else 1.0)
            total += w
        # diminishing returns so many small hits don't exceed 100
        return 100.0 * (1.0 - math.exp(-total / 60.0))

    # ---- whole document -----------------------------------------------
    def analyze(self, sentences: list[Sentence]) -> tuple[list[StyleResult], dict]:
        per = [self.sentence_hits(s.text) for s in sentences]
        n = max(1, len(sentences))
        words = max(1, sum(s.n_words for s in sentences))
        doc_notes: dict = {}

        # transition overuse
        starts = [bool(TRANSITION_START_RE.match(s.text)) for s in sentences]
        share = sum(starts) / n
        doc_notes["transition_share"] = share
        if self.trans and len(sentences) >= 5 and share > float(self.trans.get("doc_share_threshold", 0.2)):
            for hits, st in zip(per, starts):
                if st:
                    hits.append(StyleHit(
                        f"{share:.0%} of sentences start with a transition word",
                        "transition_overuse", float(self.trans.get("extra_weight", 15)), key="transition_overuse"))

        # em-dash density
        dashes = sum(len(EM_DASH_RE.findall(s.text)) for s in sentences)
        density = 100.0 * dashes / words
        doc_notes["em_dash_per_100_words"] = density
        if self.em and density > float(self.em.get("per_100_words_doc_threshold", 0.8)) and dashes >= 3:
            for s, hits in zip(sentences, per):
                if EM_DASH_RE.search(s.text) and not any(h.category == "em_dash" for h in hits):
                    hits.append(StyleHit(f"em-dash (document uses {density:.1f} per 100 words)", "em_dash",
                                         float(self.em.get("weight", 25)) * 0.6, key="em_dash"))

        # triplet density
        tri_share = sum(any(h.category == "triplet" for h in hits) for hits in per) / n
        doc_notes["triplet_share"] = tri_share
        if self.tri and len(sentences) >= 5 and tri_share > float(self.tri.get("doc_share_threshold", 0.25)):
            for hits in per:
                for h in hits:
                    if h.category == "triplet":
                        h.weight *= 2
                        h.label += f" — {tri_share:.0%} of sentences use lists of three"

        return [StyleResult(self._score(h), h) for h in per], doc_notes

    # ---- for calibration ----------------------------------------------
    def habit_rates(self, text_sentences: list[Sentence]) -> dict[str, float]:
        """Occurrences per 1000 words of each rule label in the given sentences."""
        words = max(1, sum(s.n_words for s in text_sentences))
        counts: dict[str, int] = {}
        for s in text_sentences:
            for h in self.sentence_hits(s.text):
                counts[h.key] = counts.get(h.key, 0) + 1
        return {k: 1000.0 * v / words for k, v in counts.items()}


def words_in(text: str) -> int:
    return count_words(text)
