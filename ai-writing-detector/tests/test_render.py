from detector.render import highlight_html


def test_escapes_document_text_and_reasons():
    text = 'Hello <script>alert(1)</script> world. Second "line" here.'
    sents = [
        {"index": 0, "start": 0, "end": 39, "color": "red", "score": 80.0,
         "reasons": ["<img src=x onerror=alert(1)>"], "signals": {"style": 80}},
        {"index": 1, "start": 40, "end": len(text), "color": "green", "score": 10.0, "reasons": [], "signals": {}},
    ]
    out = highlight_html(text, sents)
    assert "<script>alert(1)</script>" not in out
    assert "&lt;script&gt;" in out
    assert "<img src=x" not in out  # reason JSON is escaped in the data blob / tooltip
    assert 'data-i="0"' in out and 'data-i="1"' in out


def test_newlines_preserved_and_gray():
    text = "- one bullet\n- two bullet"
    sents = [{"index": 0, "start": 0, "end": 12, "color": "gray", "score": None, "reasons": ["Not enough text"]},
             {"index": 1, "start": 13, "end": 25, "color": "gray", "score": None, "reasons": []}]
    out = highlight_html(text, sents)
    assert "<br>" in out and "n/a" in out
