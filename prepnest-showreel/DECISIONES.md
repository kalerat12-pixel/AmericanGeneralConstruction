# PrepNest Showreel: Decisions

**Deliverable:** `prepnest-showreel.mp4`, 1920×1080, 60 fps, 25.00 s (1,500 frames), H.264 High + AAC 320 kbps, mixed to −14 LUFS / −1 dBTP for social platforms.
**Cover/thumbnail:** `cover.png` (the end card).
**Total time:** about **25 minutes** of wall-clock work, from the first look at getprepnest.com (14:56 UTC) to the final encode and this document (≈15:21 UTC). The machine render is fast (1,500 frames in ~50 s on 4 headless Chromium workers, encode in ~2 min), which is why there was room for review loops.

Everything you see and hear is code:
- **Visuals:** a hand-written Canvas2D motion engine (`src/scene.js`) rendered frame by frame in headless Chromium (`src/render.js`). No stock footage, photos or image/video-generation models. The phone UIs, the food, the logo, the icons, the particles and the grain are all drawn with vector code.
- **Audio:** `src/music.py` synthesizes every sound from oscillators and filtered noise with numpy/scipy (saws with PolyBLEP, FM bells, a synthetic kick/clap/hats, a noise-based reverb impulse). No samples, no audio-generation models.

---

## 1. What I decided

### The brief, translated
"A showreel for a résumé" plus "an ad to make people interested" became a **problem → reveal → proof → call to action** arc. A showreel has to show craft (kinetic type, match cuts, motion blur, on-beat editing). An ad has to show the product and end on one clear action. I kept both goals in every decision.

### Source of truth: the real product
I read getprepnest.com before designing anything and kept the copy factual. The headlines and numbers all come from the site:
- Tagline **"Your week, curated."**, launch line **"Coming to the App Store this November"**, CTA **"Join the waitlist"**.
- **150+ recipes**, **546 kcal · 46 g protein** (chicken burrito bowls), **$3.41 a serving**, **$105.43 for the whole week · $2.92 off on sales**, **0 of 29 ticked off**, **Live prices at Kroger-family stores**, **a six-character share code**, **Start 18-minute timer**, **"We'll alert you even if you leave the app"**, **"Cook once, eat twice. Tonight's dinner becomes tomorrow's lunch."**, **Checked against your allergies: every ingredient, every recipe. Free for everyone.**
- The recipe names in the plan come from the site's own recipe ribbon. A few per-meal numbers on secondary cards (e.g. parfait kcal) are illustrative UI filler, never headline claims.

### Brand system
- **Palette:** pulled directly from the site's CSS variables: cream `#F6F1E8`, forest `#1F3D2E`/`#2C5A42`, gold `#C4A36B`/`#A6824A`, warm dark `#13110E`.
- **Type:** the site's own **Fraunces** (regular, italic, medium; downloaded from getprepnest.com) for headlines, with the italic in gold or green for the "payoff" word, as the site does with *curated.* **Inter** stands in for the site's system sans (SF Pro isn't available on Linux).
- **Logo:** rebuilt in vector from the app icon (egg + three nest strands + rounded gold frame), so the strands can *draw themselves* on the beat.
- **App screens:** redrawn in code from the real Plan, Groceries, Recipe and Cook Mode screenshots (same layout, labels and hierarchy), so the product looks like itself.

### Structure (120 BPM, so 1 bar = 2 s and every cut lands on the grid)

| Time | Scene | What happens | Sound |
|---|---|---|---|
| 0–4 s | **Hook** | "What's for *dinner?*" slams in on beats 1 and 2. Seven day cards with "?" pop on 8th notes and twelve worry-pills ("protein?", "budget?", "which store?") pile up and shake. Everything spirals into one glowing point that becomes an egg. "*Meet*" | Two impacts, ticking clock, heartbeat kick, snare roll, riser, 60 ms of silence |
| 4–6 s | **Logo drop** | Flash + shockwave + gold particle burst. The nest strands draw on 16th notes, then the wordmark and *Your week, curated.* The camera dives into the egg, whose cream becomes the next background (match cut) | Drop: full beat; three bell notes (F–A–C) on the strands |
| 6–10 s | **01 Plan** | Phone rises with the week plan. The day strip advances one day per beat. Goal sliders count up (2,100 kcal / 150 g / $120). Badges: 546 kcal · 46 g, 150+ recipes, the allergy badge | Lead melody enters; UI ticks and pops on the cues |
| 9.8–10.2 | Whip pan | Horizontal whip with two-pass motion blur | Stereo whoosh L→R + hit |
| 10–12 s | **02 Safe** | Shield draws and checks. Ingredients run through a scanner on 8th notes: ✓ green, ✕ red and struck through for **Peanut sauce** and **Shrimp**, which slide away | Section "breathes" (no claps, filtered chords); chime per ✓, low buzz per ✕ |
| 11.8–12.25 | Circle wipe | Cream circle grows out of the shield | Whoosh + hit |
| 12–16 s | **03 Shop** | Odometer rolls $0 → **$105.43**, items tick off (1–4 of 29), *$3.41 a serving* / *–$2.92 off on sales* badges, share code **K4R7NQ** lands slot-machine style on 16ths | Re-drop with crash; rattle ticks for the odometer, ascending clicks per code letter |
| 15.85–16.2 | Vertical whip | | Whoosh |
| 16–18 s | **04 Cook** | Cook Mode step types itself; "Start 18-minute timer" is pressed and the ring time-lapses 18:00 → *Ready.* with steam | Typing clicks, ticks, bell chord on "Ready." |
| 18–20 s | **Cook once, eat twice** | A portion arcs from Monday's dinner into a Tuesday lunch container, the lid closes, chip "Leftovers from Monday's dinner" | Whoosh, thud, lid clack |
| 20–22 s | **Recap** | **Plan.** / ***Shop.*** / **Cook.** full-screen on three brand colors, then one line that implodes into the egg | Three stabs with impacts, snare build, silence |
| 22–25 s | **End card** | Logo + PrepNest + *Your week, curated.* + "Coming to the App Store this November" + **Join the waitlist at getprepnest.com** (with shine sweeps) + "Free for everyone · For iPhone" | Final drop in F (the progression finally resolves to the tonic), bell arpeggio, last chord rings out |

### Social-first choices
- **Frame 0 isn't blank:** "What's for" is already on screen at t = 0, so autoplay feeds and thumbnails show a question, not black.
- **The hook is a relatable question,** not the logo. The logo arrives at 4 s as the answer.
- **Readable at phone size:** the claims live in huge Fraunces headlines and floating badges. The phone UI is texture and proof, not something you need to read.
- **The end card holds for 3 s,** long enough to read the URL, and doubles as the cover image.
- **Audio** is normalized to −14 LUFS, and the mix was rebalanced toward mids so it still works on phone speakers.

### Craft details
- Per-word "rise from mask" text reveals, staggered 50–80 ms.
- Spring physics (damped overshoot) for every pop-in.
- Match cut egg → cream background.
- Whip pans with **two-pass directional motion blur** (100 effective samples).
- Camera shake on every impact, sized to the hit.
- An animated film-grain overlay and vignette to avoid banding and the flat "vector" look.
- Background glows that pulse with the kick.
- Seeded randomness, so every render is identical.

### Music
- **Key and harmony:** F major, progression **Dm – B♭ – F – C** (vi–IV–I–V), which feels hopeful but unresolved. The final card lands on **F**, so the music literally resolves when the product answers the question.
- **Instruments:** 7-voice supersaw chords with kick sidechain pumping, an offbeat house bass plus a sine sub, a 16th-note pluck arpeggio, a pluck/FM-bell lead with ping-pong delay, and a synthetic kick, clap and hats.
- **FX:** risers, reverse cymbals, impacts and whooshes, plus a convolution reverb from a generated noise impulse.
- **Sound design shares the visual timeline:** every pop, tick, check, buzz and whoosh is placed at the same timestamp as its animation in `scene.js`. The day cards even pop on the notes of a rising D-minor scale.

---

## 2. What I discarded (and why)

- **Using the site's real food photos and screenshots.** They would look great, but the brief says "only code". All food is vector illustration (burrito bowl, salmon, shakshuka, parfait, hummus, pancakes, fajitas) drawn procedurally.
- **A 3D phone with perspective (WebGL/three.js).** Discarded for render determinism and time. A floating, slightly rotated phone with a strong shadow and glass sheen reads as premium, and the 2D engine stays debuggable.
- **Per-frame motion blur on everything (sub-frame accumulation).** It would multiply render cost ~8× for little gain at 60 fps. I kept blur only where motion is fast (whips, word slams).
- **A voice-over or text-to-speech.** That would be a generation model, and social video is mostly watched muted anyway. The type carries the story.
- **Pricing details on screen ($5.99 / $39.99).** Too dense for 25 s and it risks reading like a price ad. The end card says "Free for everyone" and mentions Pro without numbers.
- **Naming Kroger in a big headline.** It stays in a supporting bullet ("Live prices at Kroger-family stores"), matching the site, without leaning on a third-party trademark.
- **A vertical 9:16 cut.** It wasn't requested (1920×1080 was). The engine can produce it by changing `W/H` and the layouts.
- **A "Meet PrepNest" title card on its own.** Merged into the hook's implosion instead, which is faster.

---

## 3. Iterations

1. **Research:** read the site's copy, CSS tokens, fonts, app icon and the four app screenshots, and extracted the real numbers and phrasing.
2. **v1 visuals:** wrote the whole engine and all nine scenes, then rendered 26 test stills across the timeline and reviewed them as contact sheets.
   - Fixed: the macro badge collided with the Plan headline; the phone status bar overlapped scrolled content (added a backdrop); the check icons were mispositioned by a transform bug (stray chevrons floated beside the phone); the odometer garbled its digits (rewrote it with per-slot widths and carry-only rolling); a badge overlapped the Shop headline; the frame-0 text wasn't centered; the leftovers food drew over the closing lid (split the container into body and lid layers); the whip blur showed visible stepping (moved to two-pass blur); a buffer conflict between the shake and whip compositors.
3. **v2 visuals:** re-rendered 11 stills to verify every fix, then tuned the flying-portion arc and the odometer spacing.
4. **v1 music:** analyzed it with a spectrogram, waveform and loudness meter (I can't listen, so I measured).
   - Findings: the build risers peaked *louder than the drop*; 80% of the energy was below 120 Hz (it would vanish on phone speakers); 4–20 s was one flat block of energy.
5. **v2 music:**
   - Risers and reverse cymbals −5 to −6 dB, with a clean gap before each drop.
   - Sub −6 dB; chords, lead and arp up; brighter bass filter. Result: sub −1.5 / low-mid −7.8 / mid −10.2 / high −18 dB, a modern pop-house balance.
   - The allergy section now "breathes" (no claps or open hats, filtered chords) and slams back at 12 s with a crash.
   - Crashes on every section change.
6. **Final render and QA:** 1,500 frames, then the encode with two-pass loudnorm (−14.1 LUFS integrated, −1.2 dBTP peak). Verified the frame count, duration and fps with ffprobe and re-checked a frame every 0.5 s of the *encoded* file.

---

## 4. Rebuild

```bash
cd src
python3 music.py music.wav                     # ~15 s
node render.js frames ../frames 0 1500 1        # or split across workers: start=w, step=4
ffmpeg -framerate 60 -i ../frames/f%05d.jpg -i music.wav \
  -af loudnorm=I=-14:TP=-1 -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p \
  -c:a aac -b:a 320k -movflags +faststart -t 25 ../prepnest-showreel.mp4
node render.js stills ../stills 4.5 12.3 23    # quick PNG previews at any timestamps
```
Requirements: Node + Playwright (Chromium), Python 3 + numpy + scipy, ffmpeg, and the Inter font installed. Fraunces is bundled in `src/fonts` (SIL Open Font License, the same files getprepnest.com serves).
