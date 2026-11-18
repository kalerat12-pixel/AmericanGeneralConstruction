"""Build the highlighted-text HTML (hover for a tooltip, click to pin the explanation)."""
from __future__ import annotations

import html
import json

COLORS = {
    "green": ("#d9f2df", "#1e7b34", "Likely human"),
    "yellow": ("#fff1c2", "#8a6a00", "Unclear"),
    "red": ("#ffd6d6", "#b42318", "Likely AI"),
    "gray": ("#ececec", "#666666", "Not enough text"),
}


def highlight_html(text: str, sentences: list[dict], height_hint: int = 0) -> str:
    """Return a self-contained HTML page. All document text is HTML-escaped."""
    parts: list[str] = []
    pos = 0
    info = {}
    for s in sentences:
        if s["start"] < pos:
            continue
        parts.append(_plain(text[pos:s["start"]]))
        bg, fg, name = COLORS.get(s["color"], COLORS["gray"])
        score = "n/a" if s.get("score") is None else f"{s['score']:.0f}/100"
        info[str(s["index"])] = {"label": name, "score": score, "color": fg, "reasons": s.get("reasons", []),
                                 "signals": {k: round(v) for k, v in (s.get("signals") or {}).items()}}
        tip = f"{name} · {score}\n" + "\n".join("• " + r for r in s.get("reasons", [])[:4])
        parts.append(
            f'<span class="s s-{s["color"]}" data-i="{s["index"]}" style="background:{bg}" '
            f'title="{html.escape(tip, quote=True)}" tabindex="0">{_plain(text[s["start"]:s["end"]])}</span>'
        )
        pos = s["end"]
    parts.append(_plain(text[pos:]))
    body = "".join(parts)
    data = json.dumps(info).replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
  body {{ font-family: -apple-system, Segoe UI, Roboto, sans-serif; margin:0; color:#222; }}
  #doc {{ line-height:1.8; font-size:16px; padding:6px 4px; white-space:normal; }}
  .s {{ border-radius:4px; padding:1px 2px; cursor:pointer; }}
  .s:hover, .s.sel {{ outline:2px solid #444; }}
  #panel {{ position:sticky; bottom:0; background:#fafafa; border-top:1px solid #ddd; padding:10px 12px;
            font-size:14px; min-height:44px; }}
  #panel h4 {{ margin:0 0 4px 0; font-size:15px; }}
  #panel ul {{ margin:4px 0 0 18px; padding:0; }}
  .sig {{ color:#555; font-size:12px; margin-top:4px; }}
  .legend span {{ display:inline-block; padding:1px 8px; border-radius:4px; margin-right:6px; font-size:13px; }}
</style></head><body>
<div class="legend">
  <span style="background:{COLORS['green'][0]}">Likely human</span>
  <span style="background:{COLORS['yellow'][0]}">Unclear</span>
  <span style="background:{COLORS['red'][0]}">Likely AI</span>
  <span style="background:{COLORS['gray'][0]}">Not enough text</span>
  <span style="font-size:12px;color:#666">Hover or click a sentence to see why.</span>
</div>
<div id="doc">{body}</div>
<div id="panel"><em>Click any highlighted sentence to see why it got its score.</em></div>
<script>
const INFO = {data};
const NAMES = {{perplexity:"Predictability", classifier:"Classifier", style:"Style rules", uniformity:"Evenness"}};
function esc(t) {{ const d=document.createElement('div'); d.textContent=t; return d.innerHTML; }}
function show(el) {{
  document.querySelectorAll('.s.sel').forEach(e=>e.classList.remove('sel'));
  el.classList.add('sel');
  const d = INFO[el.dataset.i]; if (!d) return;
  const sig = Object.entries(d.signals).map(([k,v]) => esc(NAMES[k]||k)+": "+v).join(" · ");
  document.getElementById('panel').innerHTML =
    '<h4 style="color:'+d.color+'">'+esc(d.label)+' — score '+esc(d.score)+'</h4>' +
    '<ul>'+d.reasons.map(r=>'<li>'+esc(r)+'</li>').join('')+'</ul>' +
    (sig ? '<div class="sig">Signal scores (0 = human-like, 100 = AI-like): '+sig+'</div>' : '');
}}
document.querySelectorAll('.s').forEach(el => {{
  el.addEventListener('click', () => show(el));
  el.addEventListener('keydown', e => {{ if (e.key==='Enter') show(el); }});
}});
</script></body></html>"""


def _plain(t: str) -> str:
    return html.escape(t).replace("\n", "<br>")
