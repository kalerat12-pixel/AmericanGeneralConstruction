"""PrepNest showreel soundtrack, synthesized from scratch (no samples).

120 BPM, F major (Dm - Bb - F - C). Every hit, whoosh and UI sound is placed on the
same timeline as scene.js. Output: 48 kHz stereo float WAV.
"""
import sys
import numpy as np
import scipy.signal as ss
from scipy.io import wavfile

SR = 48000
DUR = 25.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
BUS = {k: np.zeros((2, N + SR * 3)) for k in ('drums', 'sc', 'lead', 'sfx', 'send')}


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def pan2(x, pan):
    th = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(th), x * np.sin(th)]) * np.sqrt(2)


def add(bus, x, t0, pan=0.0, gain=1.0, send=0.0):
    if x.ndim == 1:
        x = pan2(x, pan)
    i0 = int(round(t0 * SR))
    if i0 < 0:
        x = x[:, -i0:]
        i0 = 0
    n = min(x.shape[1], BUS[bus].shape[1] - i0)
    BUS[bus][:, i0:i0 + n] += x[:, :n] * gain
    if send:
        BUS['send'][:, i0:i0 + n] += x[:, :n] * gain * send


def mx(*xs):
    n = max(len(x) for x in xs)
    out = np.zeros(n)
    for x in xs:
        out[:len(x)] += x
    return out


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def bp(x, lo, hi, order=2):
    sos = ss.butter(order, [lo, min(hi, SR / 2 - 100)], btype='band', fs=SR, output='sos')
    return ss.sosfilt(sos, x)


def hp(x, f, order=2):
    return ss.sosfilt(ss.butter(order, f, btype='high', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return ss.sosfilt(ss.butter(order, min(f, SR / 2 - 100), btype='low', fs=SR, output='sos'), x)


def sweep_filter(x, f0, f1, kind='low', block=256, q_bw=0.6):
    """Time-varying filter: coefficients recomputed per block, exponential sweep."""
    y = np.zeros_like(x)
    nb = int(np.ceil(len(x) / block))
    zi = None
    for b in range(nb):
        u = b / max(1, nb - 1)
        f = f0 * (f1 / f0) ** u
        if kind == 'low':
            sos = ss.butter(2, min(f, SR / 2 - 200), btype='low', fs=SR, output='sos')
        else:
            lo, hi = f * (1 - q_bw / 2), min(f * (1 + q_bw / 2), SR / 2 - 200)
            sos = ss.butter(1, [lo, hi], btype='band', fs=SR, output='sos')
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        seg = x[b * block:(b + 1) * block]
        y[b * block:b * block + len(seg)], zi = ss.sosfilt(sos, seg, zi=zi)
    return y


def saw(freq, n, ph0=0.0):
    dt = np.full(n, freq / SR) if np.isscalar(freq) else freq / SR
    ph = (ph0 + np.cumsum(dt)) % 1.0
    y = 2 * ph - 1
    m = ph < dt
    t1 = ph[m] / dt[m]
    y[m] -= t1 + t1 - t1 * t1 - 1
    m = ph > 1 - dt
    t2 = (ph[m] - 1) / dt[m]
    y[m] -= t2 * t2 + t2 + t2 + 1
    return y


def adsr(n, a=0.005, d=0.1, s=0.7, r=0.1):
    e = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = max(1, min(na, n))
    e[:na] = np.linspace(0, 1, na)
    nd = min(nd, n - na)
    if nd > 0:
        e[na:na + nd] = np.linspace(1, s, nd)
    nr = min(nr, n)
    e[n - nr:] *= np.linspace(1, 0, nr)
    return e


# ---------------------------------------------------------------- drums
def kick(vel=1.0, dark=False):
    t = tt(0.5)
    f = 44 + 120 * np.exp(-t * 32) + 30 * np.exp(-t * 8)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 6.5) * (1 - np.exp(-t * 3000))
    click = hp(noise(0.5), 3000) * np.exp(-t * 300) * 0.25
    x = np.tanh(1.8 * (body + click)) * vel
    return lp(x, 600) if dark else x


def clap():
    t = tt(0.35)
    n = bp(noise(0.35), 900, 3200)
    env = np.zeros_like(t)
    for k, o in enumerate((0, 0.011, 0.022)):
        m = t >= o
        env[m] += np.exp(-(t[m] - o) * (180 if k < 2 else 22))
    return n * env * 0.8


def hat(open_=False):
    t = tt(0.3 if open_ else 0.06)
    return hp(noise(len(t) / SR), 7500) * np.exp(-t * (14 if open_ else 70))


def snare(vel=1.0):
    t = tt(0.2)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    nz = bp(noise(0.2), 1500, 9000) * np.exp(-t * 24)
    return (0.5 * tone + nz) * vel


# ---------------------------------------------------------------- tonal
def supersaw(notes, dur, cutoff=2600, detune=(-18, -11, -5, 0, 5, 11, 18)):
    n = int(dur * SR)
    out = np.zeros((2, n))
    for m in notes:
        for j, c in enumerate(detune):
            f = mtof(m) * 2 ** (c / 1200)
            v = saw(f, n, rng.random())
            out += pan2(v, (j - 3) / 3 * 0.8) / len(detune)
    out = np.stack([lp(out[0], cutoff), lp(out[1], cutoff)])
    return out / len(notes)


def pluck(m, dur=0.35, bright=4000, decay=9.0):
    t = tt(dur)
    f = mtof(m)
    x = 0.6 * saw(f, len(t), rng.random()) + 0.4 * np.sign(np.sin(2 * np.pi * f * t)) * 0.5
    x = sweep_filter(x * np.exp(-t * decay), bright, 400, 'low', block=128)
    return x * adsr(len(t), 0.002, 0.05, 1, 0.03)


def bell(m, dur=1.6, idx=2.2, ratio=3.5):
    t = tt(dur)
    f = mtof(m)
    mod = np.sin(2 * np.pi * f * ratio * t) * idx * np.exp(-t * 4)
    x = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 3.2)
    x += 0.3 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 6)
    return x * adsr(len(t), 0.001, 0.01, 1, 0.05)


def bass_note(m, dur):
    t = tt(dur)
    f = mtof(m)
    x = 0.7 * saw(f, len(t)) + 0.5 * np.sin(2 * np.pi * f / 2 * t)
    x = lp(x, 1200)
    return np.tanh(1.5 * x) * adsr(len(t), 0.003, 0.08, 0.8, 0.04)


def sub(m, dur):
    t = tt(dur)
    return np.sin(2 * np.pi * mtof(m) * t) * adsr(len(t), 0.01, 0.1, 1, 0.08)


# ---------------------------------------------------------------- fx
def impact(size=1.0):
    t = tt(2.2)
    f = 30 + 55 * np.exp(-t * 3.5)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) * (1 - np.exp(-t * 800))
    thump = lp(noise(2.2), 180) * np.exp(-t * 12) * 2.5
    crashL = hp(noise(2.2), 2500) * np.exp(-t * 2.4)
    crashR = hp(noise(2.2), 2500) * np.exp(-t * 2.4)
    mono = np.tanh(1.6 * (boom + thump)) * size
    return np.stack([mono + 0.28 * crashL * size, mono + 0.28 * crashR * size])


def riser(dur, f0=300, f1=9000, pitch=True):
    t = tt(dur)
    env = (t / dur) ** 2.2
    nz = sweep_filter(noise(dur), f0, f1, 'band', q_bw=0.8) * 2.2
    x = nz
    if pitch:
        fr = mtof(50) * 2 ** (2.0 * t / dur)
        x = x + 0.25 * lp(saw(fr, len(t)), 3000)
    return x * env


def whoosh(dur, f0=400, f1=5000, pan0=-0.8, pan1=0.8):
    t = tt(dur)
    u = t / dur
    env = np.sin(np.pi * np.clip(u ** 0.8, 0, 1)) ** 2
    x = sweep_filter(noise(dur), f0, f1, 'band', q_bw=1.0) * env * 2.0
    pans = pan0 + (pan1 - pan0) * u
    th = (pans + 1) * np.pi / 4
    return np.stack([x * np.cos(th), x * np.sin(th)]) * 1.4


def reverse_cym(dur):
    t = tt(dur)
    x = hp(noise(dur), 3000) * np.exp(-(dur - t) * 3.0) * (t / dur)
    return x


def pop(f0=700):
    t = tt(0.12)
    f = f0 * (1 + 0.6 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38) * (1 - np.exp(-t * 4000))


def tick(f=2600, dec=160):
    t = tt(0.05)
    return (np.sin(2 * np.pi * f * t) + 0.4 * hp(noise(0.05), 4000)) * np.exp(-t * dec)


def blip(m, dur=0.16):
    t = tt(dur)
    f = mtof(m)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 26)


def buzz(dur=0.22):
    t = tt(dur)
    x = np.sign(np.sin(2 * np.pi * 98 * t)) + np.sign(np.sin(2 * np.pi * 103.5 * t))
    return lp(x, 1400) * adsr(len(t), 0.003, 0.05, 0.8, 0.05) * 0.35


def typeclick():
    t = tt(0.03)
    return (hp(noise(0.03), 2000) * 0.7 + np.sin(2 * np.pi * 900 * t)) * np.exp(-t * 220)


def suck(dur):
    """Reverse whoosh into the centre."""
    t = tt(dur)
    x = sweep_filter(noise(dur), 6000, 300, 'band', q_bw=1.0) * (t / dur) ** 2 * 2.0
    return x


# ================================================================ ARRANGEMENT
DM, BB, FM, CM = [62, 65, 69, 74], [58, 62, 65, 70], [60, 65, 69, 72], [60, 64, 67, 72]
ROOT = {'Dm': 38, 'Bb': 34, 'F': 41, 'C': 36}
VO = {'Dm': DM, 'Bb': BB, 'F': FM, 'C': CM}
PROG = ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'F', 'C']  # bars from 4 s

# ---- intro (0-4): hook hits, ticking clock, tension pad, risers
add('sfx', impact(0.55), 0.0, gain=0.55, send=0.3)
add('sc', supersaw([50, 57, 62], 1.6, cutoff=900) * np.exp(-tt(1.6) * 2.0), 0.0, gain=0.55, send=0.4)
add('sfx', impact(0.8), 0.5, gain=0.6, send=0.3)
add('sc', supersaw([50, 57, 62, 65], 1.6, cutoff=1400) * np.exp(-tt(1.6) * 1.6), 0.5, gain=0.55, send=0.5)
pad = supersaw([50, 57, 62, 65], 2.0, cutoff=8000)
pad = np.concatenate([pad, supersaw([46, 53, 58, 62], 2.0, cutoff=8000)], axis=1)
pad = np.stack([sweep_filter(pad[0], 250, 3500), sweep_filter(pad[1], 250, 3500)])
add('sc', pad * np.linspace(0.2, 1.0, pad.shape[1]), 0.0, gain=0.35, send=0.4)
for i in range(7):  # day cards: D minor scale pops
    add('sfx', pluck([74, 76, 77, 79, 81, 82, 84][i], 0.4, 5000, 10), 1.0 + i * 0.25, pan=-0.6 + i * 0.2, gain=0.32, send=0.35)
for i in range(12):  # worry pills
    add('sfx', pop(900 + 160 * (i % 5)), 1.55 + i * 0.118, pan=float(rng.uniform(-0.9, 0.9)), gain=0.18, send=0.2)
for k in range(int((3.0 - 1.0) / 0.25)):  # clock ticks
    tk = 1.0 + k * 0.25
    add('drums', tick(2400 if k % 2 else 1900, 140), tk, gain=0.22 + 0.1 * (tk - 1))
    if tk >= 2.5:
        add('drums', tick(2200, 160), tk + 0.125, gain=0.25)
for k in range(6):  # heartbeat
    add('drums', kick(0.7, dark=True), 1.0 + k * 0.5, gain=0.45 + 0.1 * k)
rolls = [3.0 + 0.25 * i for i in range(2)] + [3.5 + 0.125 * i for i in range(2)] + [3.75 + 0.0625 * i for i in range(3)]
for i, tk in enumerate(rolls):
    add('drums', snare(0.4 + 0.08 * i), tk, gain=0.5, send=0.15)
add('sfx', riser(1.9), 1.98, gain=0.2, send=0.2)
add('sfx', suck(0.5), 3.0, gain=0.22)
add('sfx', reverse_cym(0.85), 3.07, gain=0.22, send=0.2)

# ---- drop (4-20)
kicks = [4.0 + 0.5 * i for i in range(32)] + [20.0, 20.5, 21.0] + [22.0 + 0.5 * i for i in range(4)] + [24.0]
for k in kicks:
    add('drums', kick(1.0), k, gain=0.8)
for i in range(16):
    t0 = 4.0 + i * 1.0 + 0.5
    if 10 <= t0 < 12:
        continue  # allergy section breathes: no claps
    add('drums', clap(), t0, gain=0.6, send=0.25)
for t0 in (22.5, 23.5):
    add('drums', clap(), t0, gain=0.55, send=0.25)
for i in range(16 * 4):
    t0 = 4.0 + i * 0.125
    if i % 4 == 0:
        continue
    if i % 4 == 2:
        if not (10 <= t0 < 12):
            add('drums', hat(True), t0, pan=0.2, gain=0.2)
    else:
        add('drums', hat(False), t0, pan=-0.3 + 0.6 * (i % 8 > 3), gain=0.10 + 0.04 * (i % 2))
for i in range(4 * 4 * 2, 16 * 4 * 2):
    t0 = 4.0 + i * 0.125
    if t0 >= 20:
        break
    if i % 4 == 0 or i % 4 == 2:
        continue
    add('drums', hat(False), t0 + 0.0625, pan=0.5, gain=0.05)
for i in range(16):
    add('drums', hat(False), 22.0 + i * 0.125, pan=0.3, gain=0.1 if i % 2 else 0.05)
for i in range(4):
    add('drums', hat(True), 22.25 + i * 0.5, pan=0.2, gain=0.2)

# chords + bass + arp + lead per bar
LEAD = {
    'Dm': [81, None, 77, 81, 86, None, 84, 81],
    'Bb': [86, None, 82, 77, None, 86, 84, None],
    'F': [84, None, 81, 77, 81, None, 84, 86],
    'C': [88, None, 84, 79, None, 88, 86, 84],
}
for b, ch in enumerate(PROG):
    t0 = 4.0 + b * 2.0
    cut = 1100 if b == 3 else (3400 if b % 4 else 4400)
    add('sc', supersaw(VO[ch], 2.0, cutoff=cut) * adsr(int(2 * SR), 0.01, 0.1, 0.9, 0.05), t0, gain=0.62, send=0.35)
    add('sc', supersaw([m + 12 for m in VO[ch][1:3]], 2.0, cutoff=cut + 2000) * adsr(int(2 * SR), 0.01, 0.1, 0.9, 0.05), t0, gain=0.16 if b != 3 else 0.0, send=0.5)
    add('sc', sub(ROOT[ch], 2.0), t0, gain=0.24)
    for e in range(4):  # offbeat bass
        add('sc', bass_note(ROOT[ch] + 12, 0.24), t0 + e * 0.5 + 0.25, gain=0.4)
    tones = sorted(VO[ch]) + [VO[ch][1] + 12]
    pat = [0, 2, 1, 3, 2, 4, 3, 1]
    for s16 in range(16):
        m = tones[pat[s16 % 8]] + 12
        add('sc', pluck(m, 0.25, 3500, 14), t0 + s16 * 0.125, pan=-0.5 if s16 % 2 else 0.5, gain=0.14 if b != 3 else 0.2, send=0.3)
    if 2 <= b <= 7 and not (b == 3):  # lead melody (plan + shop sections, rests in the allergy bar)
        for e, m in enumerate(LEAD[ch]):
            if m is not None:
                add('lead', pluck(m, 0.45, 5200, 7) * 0.6 + bell(m, 0.45, 1.2, 2.0) * 0.4, t0 + e * 0.25, pan=0.1, gain=0.4, send=0.45)

# ---- recap stabs (20-22)
for t0, ch in ((20.0, 'Bb'), (20.5, 'Bb'), (21.0, 'C')):
    st = supersaw(VO[ch] + [VO[ch][0] - 12], 0.48, cutoff=4200) * np.exp(-tt(0.48) * 4)
    add('sc', st, t0, gain=0.7, send=0.5)
    add('sc', sub(ROOT[ch], 0.45), t0, gain=0.28)
    add('sfx', impact(0.5), t0, gain=0.35, send=0.2)
for i, tk in enumerate([21.25, 21.375, 21.5, 21.5625, 21.625, 21.6875, 21.75, 21.78125, 21.8125]):
    add('drums', snare(0.35 + 0.07 * i), tk, gain=0.55, send=0.15)
add('sfx', riser(0.82, 500, 10000), 21.0, gain=0.22)
add('sfx', suck(0.22), 21.7, gain=0.35)

# ---- end (22-25)
add('sfx', impact(1.15), 22.0, gain=0.9, send=0.4)
endpad = supersaw(FM + [53], 3.0, cutoff=3000) * adsr(int(3 * SR), 0.01, 0.3, 0.8, 1.2)
add('sc', endpad, 22.0, gain=0.62, send=0.5)
add('sc', sub(41, 2.0), 22.0, gain=0.24)
for e in range(4):
    add('sc', bass_note(53, 0.24), 22.0 + e * 0.5 + 0.25, gain=0.42)
for i, m in enumerate([77, 81, 84, 89, 93, 89, 84, 81, 77, 81, 84, 89, 93, 96, 93, 89]):
    add('lead', bell(m, 1.0, 1.4, 3.0), 22.0 + i * 0.125, pan=-0.6 + 1.2 * (i % 2), gain=0.12, send=0.6)
final = supersaw([53, 60, 65, 69, 72, 77], 1.0, cutoff=5000) * np.exp(-tt(1.0) * 2.6)
add('sc', final, 24.0, gain=0.55, send=0.7)
add('sc', sub(41, 1.0) * np.exp(-tt(1.0) * 2), 24.0, gain=0.3)
add('lead', bell(89, 1.0, 1.0, 2.0), 24.0, gain=0.25, send=0.7)

def crash(dur=1.8):
    t = tt(dur)
    return np.stack([hp(noise(dur), 4000) * np.exp(-t * 2.6), hp(noise(dur), 4000) * np.exp(-t * 2.6)])


for t0 in (6.0, 12.0, 16.0, 18.0):
    add('drums', crash(), t0, gain=0.22, send=0.2)

# ---- scene SFX synced to scene.js
# logo
for i, m in enumerate((77, 81, 84)):
    add('sfx', bell(m, 1.2), 4.05 + i * 0.12, pan=-0.3 + 0.3 * i, gain=0.22, send=0.5)
add('sfx', whoosh(0.5, 600, 4000, -0.4, 0.4), 4.75, gain=0.18)
add('sfx', riser(0.5, 800, 9000, pitch=False), 5.5, gain=0.35)
add('sfx', whoosh(0.45, 300, 6000, 0, 0), 5.6, gain=0.3)
# plan
add('sfx', whoosh(0.6, 250, 2500, 0.6, 0.3), 6.0, gain=0.25)
for i in range(7):
    add('sfx', tick(3200, 200), 6.5 + i * 0.5, pan=0.5, gain=0.14)
for i in range(8):
    add('sfx', pop(520 + 40 * i), 6.45 + i * 0.13, pan=0.5, gain=0.07)
for i in range(3):
    add('sfx', blip(84 + 3 * i), 6.75 + i * 0.18, pan=-0.5, gain=0.12, send=0.2)
for i in range(2):
    add('sfx', pop(950), 7.35 + i * 0.12, pan=-0.5, gain=0.15)
for t0, m in ((7.6, 86), (8.2, 89), (8.75, 93)):
    add('sfx', pop(800), t0, gain=0.2)
    add('sfx', bell(m, 0.6), t0 + 0.02, gain=0.1, send=0.4)
# whip to allergy
add('sfx', whoosh(0.45, 300, 7000, 0.9, -0.9), 9.78, gain=0.5)
add('sfx', impact(0.45), 10.0, gain=0.35, send=0.2)
add('sfx', bell(86, 1.0) + bell(93, 1.0) * 0.6, 10.5, gain=0.18, send=0.5)
INGR_OK = [1, 1, 1, 0, 1, 1, 0, 1]
for i, ok in enumerate(INGR_OK):
    t0 = 10.0 + i * 0.25 + 0.04
    if ok:
        add('sfx', blip(93 + (i % 3) * 2, 0.12), t0, pan=0.5, gain=0.12, send=0.2)
    else:
        add('sfx', buzz(), t0, pan=0.5, gain=0.4)
add('sfx', whoosh(0.5, 200, 3000, -0.6, 0.6), 11.78, gain=0.4)
add('sfx', impact(0.35), 12.0, gain=0.25, send=0.2)
# shop
add('sfx', whoosh(0.6, 250, 2500, -0.6, -0.3), 12.0, gain=0.25)
for k in range(46):
    u = k / 45
    add('sfx', tick(3400, 260), 12.35 + 1.1 * (1 - (1 - u) ** 2), pan=-0.5, gain=0.07)
add('sfx', bell(96, 0.6), 13.45, pan=-0.5, gain=0.12, send=0.4)
for i in range(3):
    add('sfx', blip(88 + 2 * i), 12.95 + i * 0.14, pan=0.4, gain=0.1)
add('sfx', tick(1500, 120), 13.2, pan=-0.5, gain=0.25)
for i in range(4):
    add('sfx', blip(84 + 4 * i, 0.1) + blip(91 + 4 * i, 0.1) * 0.5, 13.5 + i * 0.25, pan=-0.5, gain=0.14, send=0.2)
add('sfx', pop(800), 13.45, pan=-0.2, gain=0.18)
add('sfx', pop(700), 13.95, pan=-0.7, gain=0.18)
add('sfx', whoosh(0.4, 400, 3000, 0.7, 0.5), 14.45, gain=0.2)
for j in range(6):
    add('sfx', mx(tick(1400 + 180 * j, 90), pop(1200 + 120 * j) * 0.4), 14.75 + j * 0.125, pan=0.5, gain=0.25)
add('sfx', bell(98, 0.8), 15.4, pan=0.5, gain=0.12, send=0.5)
add('sfx', whoosh(0.4, 300, 7000, 0, 0), 15.84, gain=0.5)
# cook
add('sfx', impact(0.45), 16.0, gain=0.35, send=0.2)
for i in range(17):
    add('sfx', typeclick(), 16.3 + i * 0.045, pan=-0.5, gain=0.12)
add('sfx', mx(tick(1200, 80), pop(500) * 0.5), 16.5, pan=0.5, gain=0.35)
for k in range(18):
    add('sfx', tick(3000, 200), 16.65 + 1.2 * (k / 18), pan=0.5, gain=0.08)
for m in (84, 88, 91, 96):
    add('sfx', bell(m, 1.4), 17.86, pan=0.5, gain=0.12, send=0.5)
# cook once
add('sfx', impact(0.4), 18.0, gain=0.3, send=0.2)
add('sfx', pop(600), 18.1, pan=-0.4, gain=0.2)
add('sfx', pop(700), 18.25, pan=0.4, gain=0.2)
add('sfx', whoosh(0.6, 400, 4000, -0.6, 0.6), 18.55, gain=0.3)
add('sfx', lp(noise(0.15), 300) * np.exp(-tt(0.15) * 30) * 2, 19.15, pan=0.4, gain=0.5)
add('sfx', tick(900, 70) * 2, 19.42, pan=0.4, gain=0.3)
add('sfx', pop(900), 19.4, pan=0.4, gain=0.2)
add('sfx', bell(93, 0.8), 19.45, pan=0.4, gain=0.1, send=0.4)
# end card shimmer
for t0 in (23.5, 24.4):
    for i, m in enumerate((96, 100, 103)):
        add('sfx', bell(m, 0.7, 0.8, 4.0), t0 + i * 0.05, pan=-0.4 + 0.4 * i, gain=0.06, send=0.6)

# ================================================================ MIX
def sidechain(times, depth=0.75, rel=0.11):
    g = np.ones(BUS['sc'].shape[1])
    t = np.arange(len(g)) / SR
    last = np.full(len(g), -10.0)
    for k in sorted(times):
        last[int(k * SR):] = k
    dt = t - last
    att = np.clip(dt / 0.004, 0, 1)
    g = 1 - depth * np.exp(-dt / rel) * att
    return g


g = sidechain([k for k in kicks if k >= 4.0])
BUS['sc'] *= g
BUS['lead'] *= 1 - 0.35 * (1 - g)


def reverb(x, rt=1.9):
    n = int(rt * SR)
    t = np.arange(n) / SR
    out = []
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-t * 6.9 / rt)
        ir = lp(ir, 5500)
        ir[:int(0.012 * SR)] = 0
        ir /= np.sqrt(np.sum(ir ** 2))
        out.append(ss.fftconvolve(x[ch], ir)[:x.shape[1]])
    return np.stack(out)


def delay(x, d=0.375, fb=0.35, mix=0.25):
    y = x.copy()
    n = int(d * SR)
    for k in range(1, 5):
        sh = n * k
        y[(k % 2), sh:] += x[0 if k % 2 else 1, :-sh] * (fb ** k) * mix * 2
    return y


rev = reverb(np.stack([hp(BUS['send'][0], 200), hp(BUS['send'][1], 200)]))
lead = delay(BUS['lead'])
mix = BUS['drums'] * 1.0 + BUS['sc'] * 0.9 + lead * 1.0 + BUS['sfx'] * 1.0 + rev * 0.55
mix = mix[:, :N]
# gentle master EQ: tame mud, add air
mix = np.stack([hp(mix[ch], 28) for ch in range(2)])
peak = np.max(np.abs(mix))
mix = mix / peak * 1.25
mix = np.tanh(mix) / np.tanh(1.25)
# fades
fi = int(0.004 * SR)
mix[:, :fi] *= np.linspace(0, 1, fi)
fo = int(0.35 * SR)
mix[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
mix *= 0.89
out = sys.argv[1] if len(sys.argv) > 1 else 'music.wav'
wavfile.write(out, SR, mix.T.astype(np.float32))
print('wrote', out, mix.shape, 'peak', np.max(np.abs(mix)))
