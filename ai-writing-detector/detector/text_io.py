"""Extract plain text from pasted text or uploaded .txt / .docx / .pdf files."""
from __future__ import annotations

import io
import re

BULLET_RE = re.compile(r"^\s*([-*•▪◦‣–]|\d+[.)]|[a-zA-Z][.)])\s+")
END_PUNCT = tuple(".!?:;\"'”’)")


class UnsupportedFile(ValueError):
    pass


def extract_text(filename: str, data: bytes) -> str:
    name = filename.lower()
    if name.endswith(".txt") or name.endswith(".md"):
        return _decode(data)
    if name.endswith(".docx"):
        return _docx(data)
    if name.endswith(".pdf"):
        return _pdf(data)
    raise UnsupportedFile(f"Unsupported file type: {filename}. Use .txt, .docx or .pdf")


def _decode(data: bytes) -> str:
    for enc in ("utf-8-sig", "utf-16", "cp1252", "latin-1"):
        try:
            text = data.decode(enc)
            if enc == "utf-16" and not data[:2] in (b"\xff\xfe", b"\xfe\xff"):
                continue
            return normalize(text)
        except UnicodeDecodeError:
            continue
    return normalize(data.decode("utf-8", errors="replace"))


def _docx(data: bytes) -> str:
    import docx  # python-docx

    doc = docx.Document(io.BytesIO(data))
    lines = []
    for p in doc.paragraphs:
        text = p.text.strip()
        if not text:
            lines.append("")
            continue
        style = (p.style.name or "").lower() if p.style is not None else ""
        is_list = "list" in style or p._p.pPr is not None and p._p.pPr.numPr is not None
        lines.append(("- " + text) if is_list and not BULLET_RE.match(text) else text)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text.strip():
                    lines.append(cell.text.strip())
    return normalize("\n".join(lines))


def _pdf(data: bytes) -> str:
    pages: list[str] = []
    try:
        import pdfplumber

        with pdfplumber.open(io.BytesIO(data)) as pdf:
            pages = [_pdf_page_geometry(pg) for pg in pdf.pages]
    except Exception:
        from pypdf import PdfReader

        pages = [reflow_pdf_lines(pg.extract_text() or "") for pg in PdfReader(io.BytesIO(data)).pages]
    if not "".join(pages).strip():
        raise UnsupportedFile("No text found in this PDF (it may be a scanned image).")
    return normalize("\n\n".join(pages))


def _pdf_page_geometry(page) -> str:
    """Rebuild paragraphs/bullets from line positions: a big vertical gap, a line
    that stopped well short of the right margin, or a change of indentation starts
    a new unit; indented lines after a break become bullet items."""
    lines = [l for l in page.extract_text_lines() if l["text"].strip()]
    if not lines:
        return ""
    gaps = [b["top"] - a["top"] for a, b in zip(lines, lines[1:]) if b["top"] > a["top"]]
    step = sorted(gaps)[len(gaps) // 2] if gaps else 0
    body_x0 = min(l["x0"] for l in lines)
    right = max(l["x1"] for l in lines)
    width = max(1.0, right - body_x0)
    out = ""
    prev = None
    for l in lines:
        text = l["text"].strip()
        indented = l["x0"] > body_x0 + 0.03 * width
        bullet_glyph = bool(BULLET_RE.match(text))
        if prev is None:
            out = ("- " + text) if indented and not bullet_glyph else text
            prev = l
            continue
        gap = l["top"] - prev["top"]
        prev_short = prev["x1"] < body_x0 + 0.8 * width
        prev_indented = prev["x0"] > body_x0 + 0.03 * width
        hard = (step and gap > 1.45 * step) or prev_short or bullet_glyph or (indented != prev_indented)
        if not hard and abs(l["x0"] - prev["x0"]) > 0.03 * width and indented:
            hard = True
        if hard:
            sep = "\n" if (indented or bullet_glyph) else "\n\n"
            out += sep + (("- " + text) if indented and not bullet_glyph else text)
        elif out.endswith("-") and not out.endswith(" -"):
            out = out[:-1] + text
        else:
            out += " " + text
        prev = l
    return out


def reflow_pdf_lines(text: str) -> str:
    """PDFs break lines at the page edge. Re-join wrapped lines into paragraphs,
    but keep real breaks (blank lines, bullets, lines ending a sentence that are short)."""
    out: list[str] = []
    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            out.append("")
            continue
        if out and out[-1] and not BULLET_RE.match(line):
            prev = out[-1]
            if prev.endswith("-") and not prev.endswith(" -"):
                out[-1] = prev[:-1] + line  # hyphenated word split
                continue
            if not prev.endswith(END_PUNCT) or len(prev) > 60:
                out[-1] = prev + " " + line
                continue
        out.append(line)
    return "\n".join(out)


def normalize(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n").replace(" ", " ")
    text = text.replace("​", "").replace("﻿", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
