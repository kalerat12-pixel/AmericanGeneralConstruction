"""AI-Writing Detector — local Streamlit app.

Run with:  streamlit run app.py   (or use run.sh / run.bat)
Everything runs on this computer. Your text is never sent anywhere.
"""
from __future__ import annotations

import hashlib
import json
import os

os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")

import pandas as pd
import streamlit as st
import streamlit.components.v1 as components

from detector.config import DEFAULT_CONFIG_PATH, ConfigError, load_config
from detector.render import highlight_html
from detector.scorer import Analyzer, build_profile, verdict
from detector.storage import History, MyWriting, compare_scans
from detector.text_io import UnsupportedFile, extract_text

st.set_page_config(page_title="AI-Writing Detector", page_icon="🔍", layout="wide")

DISCLAIMER = (
    "**This is an estimate, not proof.** AI detectors — including this one — make mistakes in both "
    "directions. They wrongly flag real human writing (especially formal, simple, or non-native-English "
    "writing and short texts) and they miss AI text that has been edited. Use the highlights to review "
    "your own writing; never treat a score as evidence that someone cheated."
)
VERDICT_ICON = {"Likely AI": "🔴", "Mixed / unclear": "🟡", "Likely human": "🟢", "Not enough text": "⚪"}
CONF_ICON = {"High": "●●●", "Medium": "●●○", "Low": "●○○", "Not enough text": "○○○"}


# ---------------------------------------------------------------------
@st.cache_resource(show_spinner="Loading local AI models (first time can take a minute)…")
def get_analyzer(models_key: str) -> Analyzer:
    cfg = load_config()
    cfg["models"] = json.loads(models_key)
    return Analyzer(cfg)


def current_config() -> dict:
    try:
        return load_config()
    except (ConfigError, Exception) as e:  # show config problems clearly
        st.error(f"There is a problem in config.yaml: {e}")
        st.stop()


def analyzer_for(cfg: dict) -> Analyzer:
    an = get_analyzer(json.dumps(cfg["models"], sort_keys=True))
    an.cfg = cfg  # always use the latest weights/thresholds/rules without reloading models
    from detector.style_rules import StyleRules

    an.style = StyleRules(cfg)
    return an


def profile_key(cfg: dict) -> str:
    relevant = {k: cfg[k] for k in ("models", "perplexity", "uniformity", "style_rules", "calibration") if k in cfg}
    return hashlib.sha1(json.dumps(relevant, sort_keys=True).encode()).hexdigest()[:12]


def get_profile(cfg: dict, an: Analyzer, mw: MyWriting) -> dict | None:
    texts = mw.texts()
    if not texts:
        return None
    prof = mw.load_profile()
    if prof and prof.get("config_key") == profile_key(cfg):
        return prof
    with st.spinner("Learning your writing style from your samples…"):
        prof = build_profile(an, texts)
    if prof.get("ok"):
        prof["config_key"] = profile_key(cfg)
        mw.save_profile(prof)
        return prof
    return None


def read_upload(f) -> str | None:
    try:
        return extract_text(f.name, f.getvalue())
    except UnsupportedFile as e:
        st.error(str(e))
    except Exception as e:  # corrupt files etc.
        st.error(f"Couldn't read {f.name}: {e}")
    return None


# ---------------------------------------------------------------------
cfg = current_config()
history = History()
mw = MyWriting()

with st.sidebar:
    st.title("🔍 AI-Writing Detector")
    st.caption("Runs 100% on your computer. Nothing you paste or upload leaves this machine.")
    mode_label = st.radio("What are you checking?", ["Essay", "Notes"], horizontal=True,
                          help="Notes = short fragments and bullet points. Notes mode uses looser thresholds "
                               "and relies more on the style rules, because detectors misread notes a lot.")
    mode = mode_label.lower()
    st.divider()
    st.subheader("Save to history")
    papers = history.papers()
    paper = st.text_input("Paper name", value=st.session_state.get("paper", papers[0] if papers else ""),
                          placeholder="e.g. English essay – The Great Gatsby",
                          help="Scans with the same paper name are grouped so you can compare drafts.")
    st.session_state["paper"] = paper
    draft_label = st.text_input("Draft label (optional)", placeholder="e.g. rough draft, final")
    save_scan = st.checkbox("Save this scan", value=True)
    st.divider()
    n_samples = len(mw.list())
    use_profile = st.checkbox(f"Use my writing baseline ({n_samples} sample{'s' if n_samples != 1 else ''})",
                              value=n_samples > 0, disabled=n_samples == 0,
                              help="Add samples in the 'My writing' tab first.")
    st.divider()
    st.caption(f"Classifier: `{cfg['models']['classifier']}`  \nLanguage model: `{cfg['models']['language_model']}`  \n"
               f"Settings file: `{DEFAULT_CONFIG_PATH.name}`")
    st.warning(DISCLAIMER)

tab_scan, tab_mine, tab_hist, tab_about = st.tabs(["📝 Scan", "✍️ My writing", "🕘 History & compare", "ℹ️ How it works"])


# =====================================================================
def show_result(res: dict, text: str, key: str) -> None:
    v = verdict(_Obj(res), cfg)
    c1, c2, c3 = st.columns([2, 1, 1])
    if res["status"] != "ok":
        c1.metric("AI-like text", "Not enough text")
        st.info(" ".join(res["confidence_reasons"]))
    else:
        c1.markdown(f"## {res['ai_percent']:.0f}% of this text reads as AI-like",
                    help="Share of the words that sit in red (likely AI) sentences.")
        c1.markdown(f"### {VERDICT_ICON[v]} {v}")
        c2.metric("Confidence", f"{res['confidence']}  {CONF_ICON[res['confidence']]}")
        c3.metric("Unclear (yellow)", f"{res['unclear_percent']:.0f}%")
        c3.caption(f"Average sentence score {res['average_score']:.0f}/100 · {res['n_words']} words · "
                   f"{res['mode']} mode" + (" · calibrated to your writing" if res.get("calibrated") else ""))
        with c2.expander("Why this confidence?"):
            for r in res["confidence_reasons"]:
                st.write("• " + r)
    st.caption("⚠️ " + DISCLAIMER.replace("**", ""))

    n_sent = max(1, len(res["sentences"]))
    components.html(highlight_html(text, res["sentences"]), height=min(1400, 220 + 26 * n_sent + len(text) // 9),
                    scrolling=True)

    left, right = st.columns([1, 1])
    with left:
        st.subheader("Most common patterns")
        if not res["patterns"]:
            st.write("No AI-typical patterns found.")
        for p in res["patterns"][:8]:
            ex = f" — e.g. {', '.join(p['examples'][:2])}" if p["examples"] else ""
            st.write(f"• **{p['name']}**: {p['count']} sentence{'s' if p['count'] != 1 else ''}{ex}")
    with right:
        st.subheader("Document-level signals")
        d = res["doc_signals"]
        if d.get("document_classifier") is not None:
            st.write(f"• Classifier, whole document: **{100 * d['document_classifier']:.0f}% AI-like**")
        if d.get("mean_perplexity"):
            st.write(f"• Average perplexity: **{d['mean_perplexity']:.0f}** (lower = more predictable; "
                     "AI text is often below ~20)")
        if d.get("length_cv") is not None:
            st.write(f"• Sentence-length variation: **{d['length_cv']:.2f}** (human writing is usually "
                     "above ~0.5; very even writing is below ~0.35)")
        if d.get("transition_share") is not None:
            st.write(f"• Sentences starting with a transition word: **{100 * d['transition_share']:.0f}%**")
        if d.get("em_dash_per_100_words") is not None:
            st.write(f"• Em-dashes per 100 words: **{d['em_dash_per_100_words']:.1f}**")

    flagged = [s for s in res["sentences"] if s["color"] in ("red", "yellow")]
    with st.expander(f"List of flagged sentences ({len(flagged)})"):
        for s in sorted(flagged, key=lambda s: -(s["score"] or 0)):
            st.markdown(f"**{'🔴' if s['color'] == 'red' else '🟡'} {s['score']:.0f}** — {s['text']}")
            for r in s["reasons"]:
                st.caption("• " + r)


class _Obj:
    """Wrap a result dict so verdict() can read attributes."""

    def __init__(self, d):
        self.__dict__.update(d)


# =====================================================================
with tab_scan:
    st.header("Check your writing")
    up = st.file_uploader("Upload a file (.docx, .pdf, .txt)", type=["docx", "pdf", "txt"], key="scan_upload")
    initial = ""
    if up is not None:
        initial = read_upload(up) or ""
    text = st.text_area("…or paste your text here", value=initial, height=260,
                        key=f"scan_text_{up.name if up else 'paste'}")
    go = st.button("Scan", type="primary", disabled=not text.strip())
    if go and text.strip():
        an = analyzer_for(cfg)
        prof = get_profile(cfg, an, mw) if use_profile else None
        with st.spinner("Scanning… (runs locally; long papers can take 20-60 seconds)"):
            res = an.analyze(text, mode, profile=prof).to_dict()
        st.session_state["last"] = (res, text)
        if save_scan:
            history.save(paper, res, text, verdict(_Obj(res), cfg), draft_label, up.name if up else "pasted text")
            st.toast(f"Saved to history under “{(paper or 'Untitled paper').strip()}”")
    if "last" in st.session_state:
        show_result(*st.session_state["last"], key="scan")


# =====================================================================
with tab_mine:
    st.header("My writing (calibration)")
    st.write("Add a few things you **know you wrote yourself** — old essays, homework, emails. The detector learns "
             "your normal level of predictability, the classifier scores your writing usually gets, and the "
             "phrases you habitually use. Sentences that match your normal style are then scored lower. "
             "Calibration can only **lower** scores, never raise them. Aim for 500+ words in total.")
    c1, c2 = st.columns(2)
    with c1:
        files = st.file_uploader("Upload samples", type=["docx", "pdf", "txt"], accept_multiple_files=True,
                                 key="mine_upload")
        if st.button("Add uploaded files", disabled=not files):
            for f in files:
                t = read_upload(f)
                if t and t.strip():
                    mw.add(f.name, t)
            st.success("Added. Your baseline will be rebuilt on the next scan.")
            st.rerun()
    with c2:
        name = st.text_input("Sample name", placeholder="e.g. history homework, 9th grade")
        pasted = st.text_area("Or paste a sample", height=150, key="mine_paste")
        if st.button("Add pasted sample", disabled=not pasted.strip()):
            mw.add(name or "pasted", pasted)
            st.success("Added.")
            st.rerun()

    samples = mw.list()
    total = sum(s["words"] for s in samples)
    st.subheader(f"Your samples — {len(samples)} sample(s), {total} words")
    if samples and total < 150:
        st.warning("Add more writing: calibration needs at least 150 words (500+ is better).")
    for s in samples:
        a, b = st.columns([6, 1])
        a.markdown(f"**{s['name']}** · {s['words']} words  \n<small>{s['preview']}…</small>", unsafe_allow_html=True)
        if b.button("Remove", key="rm_" + s["file"]):
            mw.remove(s["file"])
            st.rerun()
    if samples and total >= 150:
        if st.button("Build / refresh my baseline now"):
            mw.clear_profile()
            prof = get_profile(cfg, analyzer_for(cfg), mw)
        prof = mw.load_profile()
        if prof:
            st.success(f"Baseline ready from {prof['words']} words.")
            med = prof.get("medians", {})
            st.write(
                f"Your typical sentence scores (0 = human-like, 100 = AI-like): predictability "
                f"**{med.get('perplexity', 0):.0f}**, classifier **{med.get('classifier', 0):.0f}**, "
                f"style rules **{med.get('style', 0):.0f}**, evenness **{med.get('uniformity', 0):.0f}**.")
            if prof.get("habits"):
                st.write("Phrases/patterns you use often (now mostly ignored): " + ", ".join(prof["habits"]))


# =====================================================================
with tab_hist:
    st.header("Past scans")
    papers = history.papers()
    if not papers:
        st.info("No scans saved yet. Scans are saved automatically when “Save this scan” is ticked.")
    else:
        sel = st.selectbox("Paper", papers)
        rows = history.list(sel)
        df = pd.DataFrame(rows)[["id", "when", "draft_label", "mode", "ai_percent", "confidence", "verdict",
                                 "n_words", "source_name"]]
        df.columns = ["ID", "When", "Draft", "Mode", "AI-like %", "Confidence", "Verdict", "Words", "Source"]
        st.dataframe(df, hide_index=True, use_container_width=True)
        if len(rows) >= 2:
            st.line_chart(pd.DataFrame({"AI-like %": [r["ai_percent"] or 0 for r in rows]},
                                       index=[f"{r['draft_label']} (#{r['id']})" for r in rows]))
        def _pct(v):
            return "n/a" if v is None else f"{v:.0f}%"

        labels = {r["id"]: f"#{r['id']} · {r['draft_label']} · {r['when']} · {_pct(r['ai_percent'])}" for r in rows}
        ids = list(labels)
        if len(ids) >= 2:
            st.subheader("Compare two drafts")
            c1, c2 = st.columns(2)
            a_id = c1.selectbox("Older draft", ids, index=len(ids) - 2, format_func=labels.get)
            b_id = c2.selectbox("Newer draft", ids, index=len(ids) - 1, format_func=labels.get)
            if a_id != b_id:
                old, new = history.get(a_id), history.get(b_id)
                cmp = compare_scans(old, new)
                m1, m2, m3 = st.columns(3)
                m1.metric("AI-like %", "n/a" if new["ai_percent"] is None else f"{new['ai_percent']:.0f}%",
                          delta=None if cmp["ai_percent_change"] is None else f"{cmp['ai_percent_change']:+.0f} pts",
                          delta_color="inverse")
                m2.metric("Average score", "n/a" if new["average_score"] is None else f"{new['average_score']:.0f}",
                          delta=None if cmp["average_score_change"] is None else f"{cmp['average_score_change']:+.0f}",
                          delta_color="inverse")
                m3.metric("Sentences", f"{cmp['n_same']} kept", f"{cmp['n_new']} new · {cmp['n_removed']} removed",
                          delta_color="off")
                icon = {"red": "🔴", "yellow": "🟡", "green": "🟢", "gray": "⚪"}
                table = [{"Change": r["change"], "": icon[r["color"]], "Old score": r["old"], "New score": r["new"],
                          "Sentence": r["text"]} for r in cmp["rows"] + cmp["removed"]]
                st.dataframe(pd.DataFrame(table), hide_index=True, use_container_width=True)
        st.subheader("Open or delete a scan")
        pick = st.selectbox("Scan", ids[::-1], format_func=labels.get, key="open_scan")
        c1, c2 = st.columns([1, 6])
        if c1.button("Delete", key="del_scan"):
            history.delete(pick)
            st.rerun()
        scan = history.get(pick)
        if scan:
            show_result(scan["result"], scan["text"], key=f"hist{pick}")


# =====================================================================
with tab_about:
    st.header("How it works")
    st.markdown(f"""
Each sentence gets four **signals** (0 = human-like, 100 = AI-like), which are combined using the weights in
`config.yaml`:

| Signal | What it measures | Essay weight | Notes weight |
|---|---|---|---|
| **Predictability** | How easily GPT-2 (a small language model running on your computer) guesses each word. AI text tends to be very predictable (low *perplexity*). | {cfg['modes']['essay']['weights'].get('perplexity', 0)} | {cfg['modes']['notes']['weights'].get('perplexity', 0)} |
| **Classifier** | `{cfg['models']['classifier']}`, an open-source model trained to tell AI and human text apart. It reads each sentence with its neighbours. | {cfg['modes']['essay']['weights'].get('classifier', 0)} | {cfg['modes']['notes']['weights'].get('classifier', 0)} |
| **Style rules** | Stock AI phrases ("delve", "it's important to note"), hedging, filler transitions, em-dashes, lists of three, generic conclusions. Edit the list in `config.yaml`. | {cfg['modes']['essay']['weights'].get('style', 0)} | {cfg['modes']['notes']['weights'].get('style', 0)} |
| **Evenness** ("burstiness") | Humans vary sentence length and predictability; AI text is often very even. | {cfg['modes']['essay']['weights'].get('uniformity', 0)} | {cfg['modes']['notes']['weights'].get('uniformity', 0)} |

**Colours (essay mode):** green below {cfg['modes']['essay']['thresholds']['green_below']}, red at
{cfg['modes']['essay']['thresholds']['red_at_or_above']}+, yellow in between. Notes mode: green below
{cfg['modes']['notes']['thresholds']['green_below']}, red at {cfg['modes']['notes']['thresholds']['red_at_or_above']}+.

**Overall score** = the share of words in red sentences. **Verdict**: "Likely AI" at
{cfg.get('report', {}).get('flag_ai_percent', 50)}%+, "Mixed / unclear" at
{cfg.get('report', {}).get('mixed_ai_percent', 20)}%+, otherwise "Likely human".

**Confidence** goes up with length (300+ words), essay mode, the classifier being on, the predictability and
classifier signals agreeing, and a clear-cut result.

**Privacy:** the models are downloaded once from Hugging Face (only model files are fetched, never your text)
and then loaded from your computer. Scans and samples are stored in the `data/` folder.
""")
    res_file = os.path.join(os.path.dirname(__file__), "eval", "results_test.md")
    if os.path.exists(res_file):
        st.subheader("Measured accuracy (test set)")
        st.markdown(open(res_file, encoding="utf-8").read())
    st.warning(DISCLAIMER)
