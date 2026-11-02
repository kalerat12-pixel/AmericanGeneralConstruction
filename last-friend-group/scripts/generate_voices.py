#!/usr/bin/env python3
"""
Generate placeholder voice lines with Piper (free, offline text-to-speech),
then write src/config/voice-manifest.json, which the video reads to know
which audio files exist and how long each one is.

Usage:
  python3 scripts/generate_voices.py            # generate every line with Piper
  python3 scripts/generate_voices.py s2_01 s3_04  # regenerate just these lines
  python3 scripts/generate_voices.py --scan     # don't generate; just index the
                                                # files already in public/audio/voice

Swapping in real voiceover:
  Drop your recording into public/audio/voice/ named after the line id
  (e.g. s2_01.wav or s2_01.mp3), delete the old placeholder, and run --scan.

Requires: pip install piper-tts, plus ffmpeg on PATH.
Voice models download automatically into ./voices (not committed).
"""
import json
import re
import os
import subprocess
import sys
import tempfile
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIALOGUE = os.path.join(ROOT, "src", "config", "dialogue.json")
MANIFEST = os.path.join(ROOT, "src", "config", "voice-manifest.json")
OUT_DIR = os.path.join(ROOT, "public", "audio", "voice")
MODELS_DIR = os.environ.get("PIPER_MODELS_DIR", os.path.join(ROOT, "voices"))
HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main"
AUDIO_EXTS = (".wav", ".mp3", ".m4a", ".ogg", ".aac")


def run(cmd, **kw):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, **kw)


def ensure_model(name):
    """Download a Piper voice (e.g. en_US-ryan-medium) if it's not already local."""
    os.makedirs(MODELS_DIR, exist_ok=True)
    onnx = os.path.join(MODELS_DIR, name + ".onnx")
    lang, speaker, quality = name.split("-")
    base = f"{HF}/{lang.split('_')[0]}/{lang}/{speaker}/{quality}/{name}"
    for suffix in (".onnx", ".onnx.json"):
        path = os.path.join(MODELS_DIR, name + suffix)
        if not os.path.exists(path):
            print(f"  downloading {name}{suffix} ...")
            urllib.request.urlretrieve(base + suffix, path)
    return onnx


def tts_text(line):
    """Text sent to the TTS engine. ALL-CAPS words get normal casing so they
    aren't spelled out letter by letter."""
    if "tts" in line:
        text = line["tts"]
    else:
        words = []
        for w in line["text"].split(" "):
            letters = "".join(c for c in w if c.isalpha())
            words.append(w.capitalize() if len(letters) > 1 and letters.isupper() else w)
        text = " ".join(words)
    # "..." mid-line becomes a sentence break so the voice actually pauses.
    text = text.lstrip(". ")
    text = text.replace("... ", ". ").replace("...", ".")
    return re.sub(r"\. ([a-z])", lambda m: ". " + m.group(1).upper(), text)


def synth(voice, text, out_wav):
    model = ensure_model(voice["model"])
    raw = out_wav + ".raw.wav"
    run([sys.executable, "-m", "piper", "-m", model, "-f", raw,
         "--length-scale", str(voice.get("lengthScale", 1.0)),
         "--sentence-silence", "0.35"], input=text.encode())

    pitch = voice.get("pitch", 1.0)
    filters = []
    if abs(pitch - 1.0) > 1e-3:
        # Shift pitch without changing speed.
        filters += [f"asetrate=22050*{pitch}", "aresample=44100", f"atempo={1/pitch:.4f}"]
    else:
        filters += ["aresample=44100"]
    # Trim silence at both ends, then leave a tiny pad.
    trim = "silenceremove=start_periods=1:start_threshold=-45dB"
    filters += [trim, "areverse", trim, "areverse", "apad=pad_dur=0.08"]
    if voice.get("effect") == "radio":
        filters += ["highpass=f=450", "lowpass=f=2800", "acrusher=bits=10:mix=0.4",
                    "volume=1.6", "alimiter=limit=0.9"]
    run(["ffmpeg", "-y", "-i", raw, "-af", ",".join(filters), "-ac", "1", out_wav])
    os.remove(raw)


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "default=nw=1:nk=1", path], capture_output=True, text=True)
    return round(float(out.stdout.strip()), 3)


def build_manifest(data):
    manifest = {}
    files = os.listdir(OUT_DIR) if os.path.isdir(OUT_DIR) else []
    for scene in data["scenes"]:
        for line in scene["lines"]:
            match = [f for f in files if os.path.splitext(f)[0] == line["id"]
                     and f.lower().endswith(AUDIO_EXTS)]
            if match:
                f = sorted(match)[0]
                manifest[line["id"]] = {"file": f"audio/voice/{f}",
                                        "duration": duration(os.path.join(OUT_DIR, f))}
    with open(MANIFEST, "w") as fh:
        json.dump(manifest, fh, indent=2)
    print(f"Wrote {os.path.relpath(MANIFEST, ROOT)} ({len(manifest)} voiced lines)")


def main():
    args = sys.argv[1:]
    with open(DIALOGUE) as fh:
        data = json.load(fh)
    os.makedirs(OUT_DIR, exist_ok=True)

    if "--scan" not in args:
        only = set(a for a in args if not a.startswith("--"))
        voices = data["voices"]
        for scene in data["scenes"]:
            for line in scene["lines"]:
                if line.get("kind") or (only and line["id"] not in only):
                    continue
                speakers = line["speaker"] if isinstance(line["speaker"], list) else [line["speaker"]]
                out = os.path.join(OUT_DIR, line["id"] + ".wav")
                text = tts_text(line)
                print(f"{line['id']:6} {'+'.join(speakers):12} {text}")
                if len(speakers) == 1:
                    synth(voices[speakers[0]], text, out)
                else:
                    # Several characters saying the same line at once: mix them.
                    with tempfile.TemporaryDirectory() as tmp:
                        parts = []
                        for i, sp in enumerate(speakers):
                            p = os.path.join(tmp, f"{i}.wav")
                            synth(voices[sp], text, p)
                            parts.append(p)
                        cmd = ["ffmpeg", "-y"]
                        for p in parts:
                            cmd += ["-i", p]
                        cmd += ["-filter_complex",
                                f"amix=inputs={len(parts)}:duration=longest:normalize=0,volume=0.8",
                                "-ac", "1", out]
                        run(cmd)
    build_manifest(data)


if __name__ == "__main__":
    main()
