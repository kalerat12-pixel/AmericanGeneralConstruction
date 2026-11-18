# AI-Writing Detector (runs on your own computer)

Check your own essays and class notes **before you turn them in** and see which sentences read as
"AI-like", and *why*. Everything runs locally: no accounts, no paid APIs, and **your text never leaves
your computer**.

> ⚠️ **This is an estimate, not proof.** Every AI detector, including this one, makes mistakes in both
> directions. See [How accurate is it?](#how-accurate-is-it) below for measured error rates.

---

## Quick start (one command)

You need **Python 3.10 or newer**. If you don't have it, install it from
<https://www.python.org/downloads/>. On Windows, tick **"Add python.exe to PATH"** during install.

**Windows:** double-click **`run.bat`**

**Mac / Linux:** open Terminal in this folder and run:

```bash
./run.sh
```

The first run sets everything up, which takes about 5–10 minutes and downloads about 1–2 GB (Python
packages plus the AI models). After that, it starts in a few seconds. Your browser opens at
**http://localhost:8501**. To stop the app, press `Ctrl+C` in the terminal window (or close it).

<details>
<summary>Manual setup (if you prefer)</summary>

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m detector.download      # one-time model download
streamlit run app.py
```
</details>

**Laptop requirements:** about 4 GB of free RAM and 3 GB of disk. No graphics card needed. A 1,000-word
essay takes roughly 5–15 seconds to scan.

---

## How to use it

1. **Pick Essay or Notes** in the left sidebar. *Notes* mode is for fragments and bullet points. It uses
   looser thresholds and relies mostly on the style rules, because detectors misread notes a lot.
2. **Paste text or upload** a `.docx`, `.pdf` or `.txt` file, then click **Scan**.
3. Read the results:
   - **"X% of this text reads as AI-like"**: the share of words in red sentences, plus a verdict
     (Likely human / Mixed / Likely AI) and a **confidence level** (High / Medium / Low).
   - Each sentence is highlighted **🟢 green** (likely human), **🟡 yellow** (unclear),
     **🔴 red** (likely AI), or **⚪ gray** (not enough text to judge).
   - **Hover or click** a sentence to see *why*: predictable wording, stock AI phrases, too-even sentence
     lengths, hedging, filler transitions, and so on.
   - **Most common patterns** summarizes what showed up across the whole document.
4. **Name the paper** in the sidebar (for example, "Gatsby essay"). Every scan is saved under that name, so in
   **History & compare** you can watch the score change across drafts and see which sentences you added,
   removed or changed.

### Calibrate it to your writing ("My writing" tab)

Add a few things you **know you wrote yourself** (old essays, homework, emails), ideally 500+ words in total.
The app learns:

- how predictable your writing normally is to the language model,
- what scores the classifier usually gives your writing,
- which "AI-ish" phrases you naturally use (for example, if you always start sentences with "Moreover",
  that rule mostly stops counting against you).

Then tick **"Use my writing baseline"** in the sidebar. Calibration can only **lower** scores for sentences
that look like your normal writing. It never raises them.

---

## How it works

Each sentence gets four signals, each a 0–100 "AI-likeness" number. They're combined using weights you can edit:

| Signal | What it measures |
|---|---|
| **Predictability (perplexity)** | GPT-2, a small open language model running locally, measures how easily it can guess each word. AI text tends to be very predictable. Also counts how many words were among GPT-2's top-10 guesses. |
| **Classifier** | An open-source AI-text classifier from Hugging Face reads each sentence together with its neighbors. See [Which classifier and why](#which-classifier-and-why). |
| **Style rules** | Stock AI phrases ("delve", "it's important to note", "in today's fast-paced world"), hedging, filler transitions and their overuse, em-dash overuse, lists of three, generic conclusions, chatbot leftovers. |
| **Evenness (burstiness)** | Humans vary their sentence lengths and predictability; AI text is often very even. Measured over nearby sentences. |

Sentences under 6 words (4 in Notes mode) and documents under 100 words (40 in Notes mode) get **"not enough
text"** instead of a made-up score.

### Changing the settings: `config.yaml`

Open `config.yaml` in any text editor. You can:

- add or remove **style phrases** (each has a pattern, a weight, a label and a category),
- change the **weights** of the four signals, separately for Essay and Notes mode,
- change the **green/red thresholds** and the "not enough text" limits,
- switch the **classifier** (or set it to `none`),
- change how strongly your **"My writing"** samples pull scores down.

Save the file and click **Scan** again. The app picks up the changes without restarting. If you make a
typo, the app tells you which line is wrong.

### Which classifier and why

I compared the AI-text classifiers on Hugging Face that are open-source, current, and small enough for a
laptop (see `eval/` for the full comparison):

| Model | Size | Speed (500 words, 4-core CPU) | Whole-document AUC* | Notes |
|---|---|---|---|---|
| **[desklib/ai-text-detector-v1.01](https://huggingface.co/desklib/ai-text-detector-v1.01)**: **chosen** | 1.7 GB | ~8 s | **0.985** | DeBERTa-v3-large, MIT license; topped the public RAID benchmark |
| [fakespot-ai/roberta-base-ai-text-detection-v1](https://huggingface.co/fakespot-ai/roberta-base-ai-text-detection-v1) | 0.5 GB | ~2 s | 0.861 | Mozilla/Fakespot, Apache-2.0. Good "fast mode" for older laptops |
| openai-community/roberta-base-openai-detector | 0.5 GB | — | not tested | Trained on GPT-2 output (2019); outdated for modern chatbots |
| Lukkinen/ai-text-detector | 3 × 0.7 GB | — | not tested | Promising self-reported results, but released weeks ago with no track record |

\*AUC on this project's held-out test set (1.0 = perfect, 0.5 = coin flip).

**Why desklib:** on the same test documents, with the other settings tuned for each, it made fewer mistakes
in both directions (2% vs 4% false alarms on human writing; 34% vs 36% missed AI), and its whole-document
judgment was much stronger. It still runs on an ordinary laptop. To use the faster model, set
`classifier: fakespot-ai/roberta-base-ai-text-detection-v1` in `config.yaml`.

One thing to know: single sentences are too short for any classifier. In testing, desklib called a casual
human sentence ("my dog ate like half the pizza… lol") 91% AI when it read the sentence alone. That's why
each sentence is judged together with its neighbors **and** its whole paragraph.

---

## How accurate is it?

I tested it on **186 documents it had never seen** (a held-out "test" set). All the weights and
thresholds were tuned on a *separate* set of 178 documents, so the test numbers aren't flattered by tuning.

**Human writing (110 documents), written before ChatGPT existed or by people:**
- 60 real student essays (grades 6–12) from the PERSUADE corpus
- 30 academic paragraphs by researchers at non-English-speaking institutions (a group detectors often misjudge)
- 20 Wikipedia passages from before 2022

**AI writing (76 documents):**
- 28 passages from 2026 models (Claude Opus 5, Claude Haiku 4.5, GPT-4.1, gpt-oss-120b, Qwen), from a
  benchmark built specifically to be hard on detectors
- 40 essays from AI models fine-tuned to imitate student essays (the hardest case)
- 8 student-style essays and notes written by Claude, some deliberately casual

| | Result |
|---|---|
| **Human writing wrongly flagged "Likely AI"** | **2 of 110 (≈2%)**: both were student essays, and both were labelled **Low** confidence |
| **AI writing missed** (not flagged "Likely AI") | **26 of 76 (≈34%)**: many of these showed as "Mixed / unclear" rather than "Likely human" |
| AI from current 2026 chatbots, missed | 11 of 28 (39%) |
| AI imitating students, missed | 13 of 40 (32%) |

**Rough rule of thumb:** it wrongly flags about **1 in 50** human-written essays, and misses about **1 in 3**
AI-written ones. It's tuned this way on purpose: wrongly accusing someone is the worse mistake.

**The confidence level matters.** When the app gave a clear verdict ("Likely AI" or "Likely human"):

| Confidence | How often that verdict was wrong (test set) |
|---|---|
| High | 2 of 89 (2%) |
| Medium | 4 of 50 (8%) |
| Low | 12 of 27 (44%), so treat Low as "can't tell" |

**Calibration ("My writing"):** in a stand-in experiment, building a baseline from 4 essays in the same
style cut false flags on student essays from 3% to 2%, and didn't let any extra AI text through. With your
*own* writing the effect should be larger, but this has not been measured.

**Not measured:** Notes mode. There's no public set of real human class notes to test with. The one AI
notes sample in the test set was *not* flagged (0% AI-like), which shows how hard notes are to judge. In
Notes mode, rely on the highlighted style patterns more than on the score.

Full reports: [`eval/results_test.md`](eval/results_test.md) (test) and [`eval/results_dev.md`](eval/results_dev.md) (tuning set).

**What this means for you:**

- A **red** sentence is a prompt to reread it, not proof. Formal, textbook-style writing (lab reports,
  definitions, summaries) is naturally predictable and can look "AI-like".
- **Short texts and notes are much less reliable.** Treat a Low-confidence result as "can't tell".
- **Non-native English writers get more false flags** with every detector, because simpler, more
  standard phrasing is more predictable.
- **AI text that has been heavily edited, or that imitates student writing, is often missed.**
- Your teacher's tool (Turnitin, GPTZero and others) uses different methods and may disagree with this one.

To re-run the evaluation yourself:

```bash
python eval/build_eval_set.py     # downloads the public test data (one time)
python eval/evaluate.py --split test
```

---

## Privacy

- Your text is processed only on your computer. Nothing is sent to any server or API.
- Hugging Face is contacted only to download the model files the first time. After that, the app loads
  them from your disk and works offline.
- Streamlit's usage statistics are turned off (`.streamlit/config.toml`), and the app only listens on
  `localhost`, so other devices on your network can't reach it.
- Saved scans and your writing samples live in the `data/` folder. Delete that folder to erase everything.

## Files

```
app.py               the web interface (Streamlit)
config.yaml          settings you can edit: style phrases, weights, thresholds, models
detector/            the detection code
  segment.py         sentence splitting
  text_io.py         reading .docx / .pdf / .txt
  style_rules.py     style-rule signal
  models.py          GPT-2 predictability + Hugging Face classifier
  scorer.py          combines signals, reasons, confidence, calibration
  storage.py         scan history (SQLite) + "My writing" samples
  render.py          the colored highlight view
eval/                accuracy testing (dataset builder, evaluator, results)
tests/               automated tests (run: python -m pytest tests)
data/                your saved scans and samples (created on first use, private)
```
