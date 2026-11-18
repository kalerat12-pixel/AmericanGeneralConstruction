import io

import docx
import pytest

from detector.config import load_config, validate, ConfigError
from detector.segment import split_sentences
from detector.text_io import extract_text, reflow_pdf_lines, UnsupportedFile


def test_config_loads_and_patterns_compile():
    cfg = load_config()
    assert cfg["modes"]["essay"]["weights"]["classifier"] > 0


def test_config_rejects_bad_regex():
    cfg = load_config()
    cfg["style_rules"]["phrases"].append({"pattern": "(unclosed", "weight": 1, "label": "x", "category": "y"})
    with pytest.raises(ConfigError):
        validate(cfg)


def test_split_basic_and_abbreviations():
    s = split_sentences("Dr. Smith arrived at 3.30 p.m. today. He was late! Was he? J. K. Rowling wrote it, e.g. the books.")
    assert [x.text for x in s] == [
        "Dr. Smith arrived at 3.30 p.m. today.",
        "He was late!",
        "Was he?",
        "J. K. Rowling wrote it, e.g. the books.",
    ]


def test_offsets_match_text():
    text = "First one here.  Second one.\n\n- bullet point\n- another bullet"
    for s in split_sentences(text):
        assert text[s.start:s.end] == s.text
    sents = split_sentences(text)
    assert [x.is_bullet for x in sents] == [False, False, True, True]
    assert sents[2].paragraph > sents[0].paragraph


def test_quotes_and_lowercase_continuation():
    s = split_sentences('She said "stop." Then she left. The value was approx. ten units.')
    assert len(s) == 3


def test_txt_and_docx_extraction():
    assert extract_text("a.txt", "Hello\r\nworld".encode()) == "Hello\nworld"
    assert extract_text("a.txt", "caf\xe9".encode("cp1252")) == "café"
    d = docx.Document()
    d.add_paragraph("Title paragraph.")
    d.add_paragraph("item one", style="List Bullet")
    buf = io.BytesIO(); d.save(buf)
    out = extract_text("x.docx", buf.getvalue())
    assert "Title paragraph." in out and "- item one" in out


def test_pdf_reflow():
    raw = "This is a long line that wraps at the edge of the page and\ncontinues here. Next sentence\nends.\n\n- bullet one\n- bullet two"
    out = reflow_pdf_lines(raw)
    assert "page and continues here." in out
    assert "\n- bullet one\n- bullet two" in out


def test_unsupported():
    with pytest.raises(UnsupportedFile):
        extract_text("x.png", b"123")


def test_real_pdf_paragraphs_and_bullets():
    from pathlib import Path
    data = (Path(__file__).parent / "fixtures" / "sample.pdf").read_bytes()
    sents = split_sentences(extract_text("sample.pdf", data))
    texts = [s.text for s in sents]
    assert texts[0] == "Lab Report: Dissolving Sugar"
    assert texts[1].startswith("We measured") and texts[1].endswith("on Tuesday.")
    assert [s.is_bullet for s in sents] == [False, False, False, True, True, False]
    assert texts[-1] == 'Dr. Lee said the results were "pretty solid" overall.'
