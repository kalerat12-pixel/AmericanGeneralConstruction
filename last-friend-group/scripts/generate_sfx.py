#!/usr/bin/env python3
"""
Synthesize every sound effect and music bed from scratch with numpy
(no samples, no downloads), writing WAVs into public/audio/sfx/.

Usage: python3 scripts/generate_sfx.py
"""
import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "audio", "sfx")
rng = np.random.default_rng(7)


def t(sec):
    return np.arange(int(SR * sec)) / SR


def write(name, x, peak=0.9):
    x = np.asarray(x, dtype=np.float64)
    m = np.max(np.abs(x)) or 1.0
    x = x / m * peak
    data = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f"  {name}.wav  {len(x) / SR:.2f}s")


def lowpass(x, cutoff):
    """One-pole low-pass filter (cheap, good enough for noise shaping)."""
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def lowpass_fast(x, cutoff):
    # FFT brick-ish low-pass with a soft roll-off; fast for long signals.
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def bandpass_fast(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / (1 + (lo / np.maximum(f, 1)) ** 4)) * (1 / (1 + (f / hi) ** 4))
    return np.fft.irfft(X, len(x))


def env(n, attack, release, sustain_level=1.0):
    e = np.ones(n) * sustain_level
    a = int(attack * SR)
    r = int(release * SR)
    if a:
        e[:a] = np.linspace(0, sustain_level, a)
    if r:
        e[-r:] *= np.linspace(1, 0, r)
    return e


def decay(sec, rate):
    return np.exp(-t(sec) * rate)


def wind():
    n = int(SR * 24)
    x = lowpass_fast(rng.standard_normal(n), 500)
    gust = 0.55 + 0.45 * np.sin(2 * np.pi * t(24) / 8) * np.sin(2 * np.pi * t(24) / 3.1 + 1)
    x *= gust
    # Crossfade the ends so it loops cleanly.
    fade = int(SR * 2)
    x[:fade] = x[:fade] * np.linspace(0, 1, fade) + x[-fade:] * np.linspace(1, 0, fade)
    return x[:-fade]


def crash():
    out = np.zeros(int(SR * 2.2))
    for k, start in enumerate([0.0, 0.07, 0.16, 0.3, 0.46, 0.7]):
        dur = 1.4 - start * 0.6
        tt = t(dur)
        partials = rng.uniform(300, 4200, 7)
        s = sum(np.sin(2 * np.pi * f * tt + rng.uniform(0, 6)) * rng.uniform(0.3, 1) for f in partials)
        s *= np.exp(-tt * rng.uniform(5, 11))
        s += rng.standard_normal(len(tt)) * np.exp(-tt * 25) * 1.5
        s *= 1.0 / (1 + k * 0.45)
        i = int(start * SR)
        out[i:i + len(s)] += s[: len(out) - i]
    thump = np.sin(2 * np.pi * 70 * t(0.4)) * decay(0.4, 9) * 3
    out[: len(thump)] += thump
    return out


def ding():
    x = np.zeros(int(SR * 0.9))
    for start, f in [(0.0, 1318.5), (0.09, 1975.5)]:
        tt = t(0.8)
        s = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2 * tt)) * np.exp(-tt * 7)
        i = int(start * SR)
        x[i:i + len(s)] += s[: len(x) - i]
    return x


def pop():
    tt = t(0.12)
    f = 500 + 1400 * tt / 0.12
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 30)


def whoosh():
    n = int(SR * 0.7)
    x = rng.standard_normal(n)
    x = bandpass_fast(x, 300, 2500)
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return x * e


def hit():
    tt = t(0.9)
    f = 120 * np.exp(-tt * 4) + 45
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 4.5)
    click = rng.standard_normal(len(tt)) * np.exp(-tt * 60) * 0.6
    return boom + click


def slam():
    tt = t(0.6)
    boom = np.sin(2 * np.pi * np.cumsum(90 * np.exp(-tt * 6) + 50) / SR) * np.exp(-tt * 10)
    knock = lowpass_fast(rng.standard_normal(len(tt)), 1800) * np.exp(-tt * 35) * 3
    rattle = bandpass_fast(rng.standard_normal(len(tt)), 2000, 5000) * np.exp(-tt * 14) * 0.25
    return boom * 1.4 + knock + rattle


def crunch():
    n = int(SR * 0.7)
    x = np.zeros(n)
    for _ in range(26):
        i = rng.integers(0, n - 2000)
        L = rng.integers(200, 1600)
        x[i:i + L] += bandpass_fast(rng.standard_normal(L), 1200, 7000) * np.exp(-np.arange(L) / (L / 4)) * rng.uniform(0.3, 1)
    return x


def static():
    n = int(SR * 8)
    x = bandpass_fast(rng.standard_normal(n), 400, 5000) * 0.35
    for _ in range(120):
        i = rng.integers(0, n - 400)
        x[i:i + 300] += rng.standard_normal(300) * rng.uniform(0.5, 1.5) * np.exp(-np.arange(300) / 60)
    x *= 0.8 + 0.2 * np.sin(2 * np.pi * t(8) * 0.7)
    return x


def cricket():
    x = np.zeros(int(SR * 2.4))
    for burst in [0.0, 0.8, 1.6]:
        for k in range(3):
            tt = t(0.045)
            s = np.sin(2 * np.pi * 4300 * tt) * np.sin(np.pi * tt / 0.045)
            i = int((burst + k * 0.06) * SR)
            x[i:i + len(s)] += s
    return x


def snore():
    tt = t(3.0)
    breath = np.clip(np.sin(2 * np.pi * tt / 3.0), 0, None) ** 1.5
    buzz = np.sin(2 * np.pi * 55 * tt) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 27 * tt)))
    noise = lowpass_fast(rng.standard_normal(len(tt)), 400)
    return (buzz * 0.4 + noise) * breath


def cart():
    n = int(SR * 4)
    x = lowpass_fast(rng.standard_normal(n), 900) * 0.5
    clicks = np.zeros(n)
    for i in range(0, n, int(SR * 0.045)):
        j = i + rng.integers(0, 400)
        L = 300
        if j + L < n:
            clicks[j:j + L] += rng.standard_normal(L) * np.exp(-np.arange(L) / 50) * rng.uniform(0.4, 1)
    x += bandpass_fast(clicks, 1500, 6000)
    return x * env(n, 0.2, 0.4)


def tone(f, dur, kind="pluck"):
    tt = t(dur)
    if kind == "pluck":
        s = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) + 0.12 * np.sin(2 * np.pi * 3 * f * tt)
        return s * np.exp(-tt * 6)
    if kind == "bass":
        s = np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 2 * f * tt)
        return s * np.exp(-tt * 3.5)
    raise ValueError(kind)


def note(name):
    names = {"C": 0, "C#": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11}
    pitch, octave = name[:-1], int(name[-1])
    return 440 * 2 ** ((names[pitch] + 12 * (octave + 1) - 69) / 12)


def music_loop():
    """Light, bouncy comedy bed: 8 bars at 112 bpm, loops seamlessly."""
    bpm = 112
    beat = 60 / bpm
    bars = 8
    n = int(SR * beat * 4 * bars)
    x = np.zeros(n)
    def add(sig, at, gain):
        i = int(at * SR) % n
        L = min(len(sig), n - i)
        x[i:i + L] += sig[:L] * gain
        if L < len(sig):  # wrap around for seamless looping
            x[: len(sig) - L] += sig[L:] * gain
    chords = [["C4", "E4", "G4"], ["A3", "C4", "E4"], ["F3", "A3", "C4"], ["G3", "B3", "D4"]]
    roots = ["C2", "A1", "F1", "G1"]
    for bar in range(bars):
        c = chords[bar % 4]
        r = roots[bar % 4]
        for b in range(4):
            at = (bar * 4 + b) * beat
            # kick on 1 and 3, hat on offbeats
            if b in (0, 2):
                tt = t(0.25)
                add(np.sin(2 * np.pi * np.cumsum(60 + 100 * np.exp(-tt * 30)) / SR) * np.exp(-tt * 14), at, 0.9)
            add(bandpass_fast(rng.standard_normal(1600), 6000, 14000) * np.exp(-np.arange(1600) / 250), at + beat / 2, 0.25)
            if b in (1, 3):
                add(bandpass_fast(rng.standard_normal(5000), 900, 5000) * np.exp(-np.arange(5000) / 900), at, 0.35)
            add(tone(note(r) * (2 if b % 2 else 1), beat * 0.9, "bass"), at, 0.5)
        # bouncy arpeggio
        pattern = [0, 1, 2, 1, 0, 2, 1, 2]
        for k, p in enumerate(pattern):
            f = note(c[p]) * 2
            add(tone(f, beat * 0.6), bar * 4 * beat + k * beat / 2, 0.22)
    return x


def pad(chord_names, bar_sec=4.0, bright=0.15):
    """Slow, soft chord pad for the emotional beats."""
    n = int(SR * bar_sec * len(chord_names))
    x = np.zeros(n)
    for i, chord in enumerate(chord_names):
        tt = t(bar_sec + 1.5)
        e = np.minimum(1, tt / 1.2) * np.clip((bar_sec + 1.5 - tt) / 1.5, 0, 1)
        for nm in chord:
            f = note(nm)
            s = sum(np.sin(2 * np.pi * f * d * tt) for d in (0.997, 1.0, 1.003))
            s += bright * np.sin(2 * np.pi * 2 * f * tt)
            sig = s * e
            st = int(i * bar_sec * SR)
            L = min(len(sig), n - st)
            x[st:st + L] += sig[:L]
    return x * env(n, 0.5, 2.0)


def main():
    os.makedirs(OUT, exist_ok=True)
    print("Synthesizing sound effects:")
    write("wind", wind(), 0.6)
    write("crash", crash())
    write("ding", ding(), 0.7)
    write("pop", pop(), 0.6)
    write("whoosh", whoosh(), 0.6)
    write("hit", hit())
    write("slam", slam())
    write("crunch", crunch(), 0.8)
    write("static", static(), 0.5)
    write("cricket", cricket(), 0.4)
    write("snore", snore(), 0.5)
    write("cart", cart(), 0.6)
    write("music_loop", music_loop(), 0.7)
    write("pad_sad", pad([["A3", "C4", "E4"], ["F3", "A3", "C4"], ["C3", "E3", "G3"], ["G3", "B3", "D4"],
                          ["A3", "C4", "E4"], ["F3", "A3", "C4"]], 4.0), 0.6)
    write("pad_warm", pad([["F3", "A3", "C4", "E4"], ["C3", "G3", "C4", "E4"], ["A2", "E3", "A3", "C4"],
                           ["F3", "A3", "C4"], ["G3", "B3", "D4"], ["C3", "E3", "G3", "C4"],
                           ["F3", "A3", "C4", "E4"], ["C3", "G3", "C4", "E4"], ["C3", "G3", "C4", "E4"]], 4.0), 0.6)


if __name__ == "__main__":
    main()
