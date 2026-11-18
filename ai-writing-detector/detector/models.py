"""Local model wrappers: GPT-2 predictability and the Hugging Face AI-text classifier.

Models are downloaded once from Hugging Face the first time they are used and
then loaded from the local cache. Your text is never sent anywhere: the
download only fetches model files.
"""
from __future__ import annotations

import math
import os
import re
from dataclasses import dataclass
from functools import lru_cache
from html import unescape

import numpy as np

from .segment import Sentence


os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")


def _load(loader, name: str, **kw):
    """Use the local copy if we already have it (no network at all); otherwise download once."""
    try:
        return loader(name, local_files_only=True, **kw)
    except Exception:
        return loader(name, **kw)


def _torch():
    import torch

    torch.set_grad_enabled(False)
    return torch


# =====================================================================
#  GPT-2 predictability (perplexity / "top-10 token" rate)
# =====================================================================
@dataclass
class LMStats:
    log_ppl: float | None  # mean negative log-likelihood per token (nats)
    top10_rate: float | None  # share of tokens that were among GPT-2's 10 best guesses
    n_tokens: int


class LanguageModel:
    def __init__(self, name: str = "openai-community/gpt2", window: int = 512, stride: int = 256):
        torch = _torch()
        from transformers import AutoModelForCausalLM, AutoTokenizer

        self.tok = _load(AutoTokenizer.from_pretrained, name)
        self.model = _load(AutoModelForCausalLM.from_pretrained, name).eval()
        self.window, self.stride = window, stride
        self.torch = torch

    def token_scores(self, text: str):
        """Return (offsets, nll, rank) for every token after the first, using a sliding window."""
        torch = self.torch
        enc = self.tok(text, return_offsets_mapping=True, add_special_tokens=False)
        ids = enc["input_ids"]
        offsets = enc["offset_mapping"]
        n = len(ids)
        nll = np.full(n, np.nan)
        rank = np.full(n, np.nan)
        if n < 2:
            return offsets, nll, rank
        bos = self.tok.bos_token_id
        start = 0
        while True:
            end = min(start + self.window - 1, n)
            chunk = [bos] + ids[start:end]
            logits = self.model(torch.tensor([chunk])).logits[0, :-1].float()
            logp = torch.log_softmax(logits, -1)
            targets = torch.tensor(chunk[1:])
            tok_lp = logp[torch.arange(len(targets)), targets]
            ranks = (logp > tok_lp.unsqueeze(-1)).sum(-1)
            # only fill tokens not already scored with more context
            first_new = 0 if start == 0 else self.window - 1 - self.stride
            for j in range(first_new, len(targets)):
                i = start + j
                if i == 0:
                    continue  # first token has no context
                nll[i] = -float(tok_lp[j])
                rank[i] = float(ranks[j])
            if end >= n:
                break
            start += self.stride
        return offsets, nll, rank

    def sentence_stats(self, text: str, sentences: list[Sentence]) -> list[LMStats]:
        offsets, nll, rank = self.token_scores(text)
        buckets: list[list[int]] = [[] for _ in sentences]
        si = 0
        for ti, (a, b) in enumerate(offsets):
            if b <= a:
                continue
            pos = b - 1
            while si < len(sentences) and sentences[si].end <= pos:
                si += 1
            if si >= len(sentences):
                break
            if sentences[si].start <= pos < sentences[si].end:
                buckets[si].append(ti)
        out = []
        for idx in buckets:
            vals = [nll[i] for i in idx if not math.isnan(nll[i])]
            rks = [rank[i] for i in idx if not math.isnan(rank[i])]
            if len(vals) < 3:
                out.append(LMStats(None, None, len(vals)))
                continue
            out.append(LMStats(float(np.mean(vals)), float(np.mean(np.array(rks) < 10)), len(vals)))
        return out


# =====================================================================
#  AI-text classifier
# =====================================================================
def clean_for_classifier(t: str) -> str:
    """Same idea as fakespot's clean_text: strip markdown/bullets, collapse whitespace."""
    t = re.sub(r"`[^`]*`", "", t)
    t = re.sub(r"\[([^\]]+)\]\(.*?\)", r"\1", t)
    t = re.sub(r"(\*\*|__)(.*?)\1", r"\2", t)
    t = re.sub(r"^\s*(#+|[-*+•]|\d+\.)\s+", "", t, flags=re.MULTILINE)
    t = re.sub(r"<.*?>", "", unescape(t))
    t = re.sub(r"\s+", " ", t.replace(" ,", ","))
    return t.strip()


class Classifier:
    """Returns P(AI) in [0, 1] for each input text."""

    def __init__(self, name: str):
        torch = _torch()
        from transformers import AutoConfig, AutoTokenizer

        self.torch = torch
        self.name = name
        self.tok = _load(AutoTokenizer.from_pretrained, name)
        cfg = _load(AutoConfig.from_pretrained, name)
        if "desklib" in name.lower():
            self.kind = "desklib"
            self.model = _load(_desklib_model_class().from_pretrained, name).eval()
        else:
            from transformers import AutoModelForSequenceClassification

            self.kind = "seqcls"
            self.model = _load(AutoModelForSequenceClassification.from_pretrained, name).eval()
            self.ai_index = _find_ai_label(cfg.id2label)

    def predict(self, texts: list[str], batch_size: int = 16, max_length: int = 512) -> list[float]:
        torch = self.torch
        out: list[float] = []
        texts = [clean_for_classifier(t) for t in texts]
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            enc = self.tok(batch, return_tensors="pt", padding=True, truncation=True, max_length=max_length)
            if self.kind == "desklib":
                p = torch.sigmoid(self.model(enc["input_ids"], enc["attention_mask"]))
            else:
                p = torch.softmax(self.model(**enc).logits.float(), -1)[:, self.ai_index]
            out.extend(float(x) for x in p)
        return out

    def predict_document(self, text: str, max_tokens: int = 500) -> float:
        """Whole-document P(AI): average over ~500-token chunks, weighted by length."""
        ids = self.tok(clean_for_classifier(text), add_special_tokens=False)["input_ids"]
        if not ids:
            return 0.0
        chunks = [self.tok.decode(ids[i : i + max_tokens]) for i in range(0, len(ids), max_tokens)]
        probs = self.predict(chunks)
        weights = [min(max_tokens, len(ids) - i * max_tokens) for i in range(len(chunks))]
        return float(np.average(probs, weights=weights))


def _find_ai_label(id2label: dict) -> int:
    for i, lab in id2label.items():
        l = str(lab).lower()
        if any(k in l for k in ("ai", "fake", "machine", "generated", "chatgpt", "gpt")) and "human" not in l:
            return int(i)
    return 1  # convention: LABEL_1 = AI


@lru_cache(maxsize=1)
def _desklib_model_class():
    torch = _torch()
    import torch.nn as nn
    from transformers import AutoConfig, AutoModel, PreTrainedModel

    class DesklibAIDetectionModel(PreTrainedModel):
        config_class = AutoConfig

        def __init__(self, config):
            super().__init__(config)
            self.model = AutoModel.from_config(config)
            self.classifier = nn.Linear(config.hidden_size, 1)
            self.post_init()

        def forward(self, input_ids, attention_mask):
            h = self.model(input_ids, attention_mask=attention_mask)[0]
            m = attention_mask.unsqueeze(-1).float()
            pooled = (h * m).sum(1) / m.sum(1).clamp(min=1e-9)
            return self.classifier(pooled).squeeze(-1)

    return DesklibAIDetectionModel


# ---------------------------------------------------------------------
@lru_cache(maxsize=2)
def get_language_model(name: str) -> LanguageModel:
    return LanguageModel(name)


@lru_cache(maxsize=2)
def get_classifier(name: str) -> Classifier | None:
    if not name or name.lower() == "none":
        return None
    return Classifier(name)
