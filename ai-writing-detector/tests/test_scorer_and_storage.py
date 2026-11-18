"""Fast tests: fake model outputs so no models are loaded."""
import copy

from detector.config import load_config
from detector.models import LMStats
from detector.scorer import Analyzer, build_profile, verdict
from detector.segment import split_sentences
from detector.storage import History, MyWriting, compare_scans

TEXT = " ".join(f"This is plain sentence number {i} about my weekend at the lake with friends." for i in range(12))


def fake_mo(text, log_ppl=3.0, clf=0.5, top10=0.6):
    sents = split_sentences(text)
    return {"sents": sents, "lm": [LMStats(log_ppl, top10, 12) for _ in sents],
            "clf": {i: clf for i in range(len(sents))}, "doc_clf": clf}


class FakeAnalyzer(Analyzer):
    def __init__(self, cfg=None, **kw):
        super().__init__(cfg or load_config(), load_models=False)
        self.kw = kw

    def model_outputs(self, text):
        return fake_mo(text, **self.kw)


def test_low_perplexity_high_classifier_is_red():
    a = FakeAnalyzer()
    r = a.analyze(TEXT, "essay", mo=fake_mo(TEXT, log_ppl=2.2, clf=0.99, top10=0.85))
    assert r.status == "ok" and r.ai_percent == 100 and verdict(r, a.cfg) == "Likely AI"
    s = r.sentences[0]
    assert s["color"] == "red"
    assert any("predictable" in x for x in s["reasons"]) and any("classifier" in x for x in s["reasons"])


def test_human_like_is_green():
    a = FakeAnalyzer()
    r = a.analyze(TEXT, "essay", mo=fake_mo(TEXT, log_ppl=5.0, clf=0.02, top10=0.45))
    assert r.ai_percent == 0 and all(s["color"] == "green" for s in r.sentences)
    assert verdict(r, a.cfg) == "Likely human"


def test_too_short_document_gets_no_score():
    a = FakeAnalyzer()
    t = "Short note about the lab. It went fine."
    r = a.analyze(t, "essay", mo=fake_mo(t))
    assert r.status == "too_short" and r.ai_percent is None and r.confidence == "Not enough text"
    assert all(s["score"] is None and s["color"] == "gray" for s in r.sentences)


def test_short_sentence_marked_not_enough_text():
    a = FakeAnalyzer()
    t = TEXT + " Yes indeed."
    r = a.analyze(t, "essay", mo=fake_mo(t))
    last = r.sentences[-1]
    assert last["status"] == "too_short" and last["score"] is None
    assert "Not enough text" in last["reasons"][0]


def test_notes_mode_is_looser():
    a = FakeAnalyzer()
    mo = fake_mo(TEXT, log_ppl=2.8, clf=0.75, top10=0.7)
    essay = a.analyze(TEXT, "essay", mo=mo)
    notes = a.analyze(TEXT, "notes", mo=mo)
    assert notes.ai_percent <= essay.ai_percent
    assert notes.confidence != "High"


def test_calibration_only_lowers_scores():
    a = FakeAnalyzer(log_ppl=2.4, clf=0.8, top10=0.8)  # the user's own writing looks "AI-ish"
    prof = build_profile(a, [TEXT, TEXT])
    assert prof["ok"] and prof["distributions"]["classifier"]
    mo = fake_mo(TEXT, log_ppl=2.4, clf=0.8, top10=0.8)
    base = a.analyze(TEXT, "essay", mo=mo)
    cal = a.analyze(TEXT, "essay", profile=prof, mo=mo)
    assert cal.average_score < base.average_score
    assert any("Matches your own writing" in x for x in cal.sentences[0]["reasons"])
    # something far more human than the profile is never raised
    mo2 = fake_mo(TEXT, log_ppl=5.0, clf=0.01, top10=0.4)
    assert a.analyze(TEXT, "essay", profile=prof, mo=mo2).average_score <= a.analyze(TEXT, "essay", mo=mo2).average_score


def test_profile_needs_enough_words():
    assert build_profile(FakeAnalyzer(), ["only a few words"])["ok"] is False


def test_history_and_compare(tmp_path):
    a = FakeAnalyzer()
    h = History(tmp_path / "h.db")
    r1 = a.analyze(TEXT, "essay", mo=fake_mo(TEXT, clf=0.9, log_ppl=2.3)).to_dict()
    t2 = TEXT + " I rewrote this ending myself after the trip was over."
    r2 = a.analyze(t2, "essay", mo=fake_mo(t2, clf=0.1, log_ppl=4.5)).to_dict()
    i1 = h.save("History essay", r1, TEXT, "Likely AI")
    i2 = h.save("History essay", r2, t2, "Likely human", draft_label="final")
    h.save("Other", r2, t2, "Likely human")
    assert set(h.papers()) == {"History essay", "Other"}
    rows = h.list("History essay")
    assert [r["draft_label"] for r in rows] == ["Draft 1", "final"]
    cmp = compare_scans(h.get(i1), h.get(i2))
    assert cmp["n_new"] == 1 and cmp["n_same"] >= 1 and cmp["ai_percent_change"] < 0
    h.delete(i1)
    assert len(h.list("History essay")) == 1


def test_my_writing_store(tmp_path):
    m = MyWriting(tmp_path / "mw")
    p = m.add("my essay.docx", "hello world " * 50)
    assert m.list()[0]["words"] == 100
    m.save_profile({"ok": True, "x": 1})
    assert m.load_profile()["x"] == 1
    m.add("second", "more text")
    assert m.load_profile() is None  # adding a sample invalidates the profile
    m.remove(p.name)
    m.remove("../../etc/passwd")  # path traversal ignored
    assert len(m.list()) == 1
