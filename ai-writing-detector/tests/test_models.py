"""Slow tests: load real models (downloaded once). Run with: pytest tests/test_models.py"""
import numpy as np
import pytest

from detector.models import LanguageModel, get_classifier, get_language_model, clean_for_classifier
from detector.segment import split_sentences

HUMAN = "my dog ate like half the pizza before anyone noticed lol, so we just ordered more and watched the game."
AI = ("In today's fast-paced world, it is important to note that technology plays a pivotal role in shaping how we "
      "communicate, learn, and grow. By embracing these innovations, we can foster a more connected society.")


def test_sliding_window_matches_full_context():
    lm = get_language_model("openai-community/gpt2")
    text = " ".join(["The quick brown fox jumps over the lazy dog near the river bank."] * 12)
    full = lm.token_scores(text)[1]
    small = LanguageModel.__new__(LanguageModel)
    small.__dict__.update(lm.__dict__)
    small.window, small.stride = 64, 32
    win = small.token_scores(text)[1]
    assert np.isnan(win[0]) and np.isnan(full[0])
    assert not np.isnan(win[1:]).any()  # every token after the first gets scored, no gaps
    # first 63 tokens see identical context in both
    assert np.allclose(full[1:63], win[1:63], atol=1e-3)


def test_ai_text_more_predictable_than_casual_human():
    lm = get_language_model("openai-community/gpt2")
    text = HUMAN + " " + AI
    sents = split_sentences(text)
    stats = lm.sentence_stats(text, sents)
    assert len(stats) == len(sents) == 3
    assert stats[0].log_ppl > stats[1].log_ppl  # casual sentence is more surprising
    assert all(s.n_tokens > 3 for s in stats)


def test_classifier_direction():
    clf = get_classifier("fakespot-ai/roberta-base-ai-text-detection-v1")
    p_h, p_ai = clf.predict([HUMAN, AI])
    assert p_ai > 0.8 and p_h < 0.5
    assert 0 <= clf.predict_document(HUMAN + " " + AI) <= 1


def test_none_classifier():
    assert get_classifier("none") is None


def test_clean():
    assert clean_for_classifier("- **bold** item\n- [link](http://x)") == "bold item link"
