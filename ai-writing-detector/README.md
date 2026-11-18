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

CLASSIFIER_CHOICE_PLACEHOLDER

---

## How accurate is it?

ACCURACY_PLACEHOLDER

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
