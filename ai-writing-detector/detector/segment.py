"""Split text into sentences, keeping character offsets.

Line breaks are treated as hard boundaries so bullet points and note lines
each become their own unit. Within a line we split on . ! ? while skipping
common abbreviations, initials and decimals.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

ABBREVIATIONS = {
    "mr", "mrs", "ms", "dr", "prof", "sr", "jr", "st", "vs", "etc", "e.g", "i.e", "eg", "ie",
    "fig", "no", "vol", "pp", "p", "ch", "sec", "approx", "dept", "est", "inc", "ltd", "co",
    "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "sept", "oct", "nov", "dec",
    "u.s", "u.k", "a.m", "p.m", "ph.d", "cf", "al", "ca", "mt", "ave", "rd", "govt",
}
_BULLET = re.compile(r"^\s*([-*•▪◦‣–]|\d+[.)]|[a-zA-Z][.)])\s+")
_WORD = re.compile(r"[A-Za-z0-9]+(?:['’\-][A-Za-z0-9]+)*")
# candidate end: punctuation, optional closing quotes/brackets, then whitespace
_END = re.compile(r"[.!?]+[\"'”’)\]]*(?=\s+)")


@dataclass
class Sentence:
    text: str
    start: int
    end: int
    is_bullet: bool = False
    paragraph: int = 0

    @property
    def n_words(self) -> int:
        return count_words(self.text)


def count_words(text: str) -> int:
    return len(_WORD.findall(text))


def split_sentences(text: str) -> list[Sentence]:
    sentences: list[Sentence] = []
    pos = 0
    paragraph = 0
    for line in text.split("\n"):
        line_start = pos
        pos += len(line) + 1
        if not line.strip():
            paragraph += 1
            continue
        is_bullet = bool(_BULLET.match(line))
        for s, e in _split_line(line):
            chunk = line[s:e]
            stripped = chunk.strip()
            if not stripped or not _WORD.search(stripped):
                continue
            lead = len(chunk) - len(chunk.lstrip())
            sentences.append(
                Sentence(
                    text=stripped,
                    start=line_start + s + lead,
                    end=line_start + s + lead + len(stripped),
                    is_bullet=is_bullet,
                    paragraph=paragraph,
                )
            )
    return sentences


def _split_line(line: str) -> list[tuple[int, int]]:
    spans = []
    start = 0
    for m in _END.finditer(line):
        end = m.end()
        if _is_abbreviation(line, m.start(), m.group()):
            continue
        nxt = line[end:].lstrip()
        # next piece should look like a sentence start (capital, digit, quote, bullet)
        if nxt and not (nxt[0].isupper() or nxt[0].isdigit() or nxt[0] in "\"'“‘([-*•"):
            continue
        spans.append((start, end))
        start = end
    if start < len(line):
        spans.append((start, len(line)))
    return spans


def _is_abbreviation(line: str, dot_pos: int, punct: str) -> bool:
    if not punct.startswith(".") or len(punct.rstrip("\"'”’)]")) > 1:
        return False
    before = line[:dot_pos]
    m = re.search(r"([A-Za-z][A-Za-z.]*)$", before)
    if not m:
        # a number like "3." in "Figure 3. Results" is fine to split; decimals never reach here
        return False
    word = m.group(1).lower().rstrip(".")
    if word in ABBREVIATIONS:
        return True
    # single capital initial like "J. K. Rowling"
    if len(word) == 1 and m.group(1).isupper():
        return True
    return False
