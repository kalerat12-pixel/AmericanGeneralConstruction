from detector.config import load_config
from detector.segment import split_sentences
from detector.style_rules import StyleRules


def rules():
    return StyleRules(load_config())


def test_stock_phrases_fire():
    r = rules()
    hits = r.sentence_hits("In today's fast-paced world, it's important to note that we must delve into the data.")
    cats = {h.category for h in hits}
    labels = " ".join(h.label for h in hits)
    assert "stock_phrase" in cats and "hedging" in cats
    assert "delve" in labels and "fast-paced" in labels


def test_plain_human_sentence_is_clean():
    r = rules()
    assert r.sentence_hits("My brother forgot his lunch so I drove it to school on my way to practice.") == []


def test_em_dash_and_triplet():
    r = rules()
    hits = r.sentence_hits("The plan was simple — cheap, fast, and reliable — and it worked.")
    cats = {h.category for h in hits}
    assert {"em_dash", "triplet"} <= cats


def test_transition_overuse_doc_level():
    text = ("Moreover, the sky is blue today. Furthermore, the grass is green here. Additionally, the sun is bright now. "
            "The dog sleeps in the yard. Consequently, we stay outside all day long.")
    res, notes = rules().analyze(split_sentences(text))
    assert notes["transition_share"] > 0.5
    assert any(h.category == "transition_overuse" for h in res[0].hits)
    assert res[3].score == 0


def test_scores_saturate_below_100_and_habits_reduce():
    r = rules()
    s = split_sentences("In conclusion, it is important to note that delving into this tapestry will pave the way for generations to come.")
    before = r.analyze(s)[0][0].score
    assert 80 < before < 100
    r.habit_labels = {h.key for h in r.sentence_hits(s[0].text)}
    after = r.analyze(s)[0][0].score
    assert after < before * 0.6


def test_habit_rates():
    r = rules()
    rates = r.habit_rates(split_sentences("Moreover, I like dogs a lot more than cats. " * 10))
    assert any(v > 50 for v in rates.values())
