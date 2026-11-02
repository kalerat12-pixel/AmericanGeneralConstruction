# Life as the Last Friend Group — Episode 1

A ~3:53 animated short for a faceless YouTube channel, built entirely in code with
[Remotion](https://www.remotion.dev/) (React → MP4). Everyone on Earth has vanished
except four teenage best friends, who still act exactly like a normal friend group.

- **Script:** [`script.md`](script.md)
- **Rendered episode:** [`renders/life-as-the-last-friend-group.mp4`](renders/life-as-the-last-friend-group.mp4) (1920×1080, 30fps, H.264 + AAC)
- **Art:** flat 2D SVG, drawn in React. No external images.

## Quick start

```bash
npm install
npm run studio     # live preview / scrub the timeline in the browser
npm run render     # -> out/life-as-the-last-friend-group.mp4
npm run thumbnail  # -> out/thumbnail.png (1280x720)
```

## Where things live

| Path | What it is |
|------|------------|
| `script.md` | The full episode script |
| `src/Thumbnail.tsx` | YouTube thumbnail (`renders/thumbnail.png`, 1280×720) |
| `src/config/dialogue.json` | **Every line of dialogue and its timing slot** (see below) |
| `src/config/voice-manifest.json` | Auto-generated: which voice files exist and how long they are |
| `src/config/characters.ts` | Speaker names and caption colors |
| `src/components/Character.tsx` | The reusable character rig (poses, expressions, blink, idle bob, walk, sit, mouth flap) |
| `src/components/Backgrounds.tsx` | All the locations |
| `src/components/Captions.tsx` | Burned-in captions in each speaker's color |
| `src/components/TitleCard.tsx` | "DAY 3 / THE MALL" style cards |
| `src/components/PhoneUI.tsx` | Group chat, Dev's post, signal bars, text popups |
| `src/scenes/S1…S9*.tsx` | One file per scene. Animation is keyed to line timings, so it follows the config |
| `public/audio/voice/` | One audio file per voiced line, named by line id (`s2_01.wav`, …) |
| `public/audio/sfx/` | Synthesized sound effects and music beds |
| `scripts/` | Voice generator, SFX generator, timing checker, still renderer |

## Dialogue timing slots

Every line in `src/config/dialogue.json` looks like this:

```json
{ "id": "s2_03", "speaker": "jace", "text": "Cool. Bye!", "at": 10.71, "hold": 1.15 }
```

- `at`: when the line starts, in seconds from the start of its scene
- `hold`: minimum time the caption stays on screen (the slot length)
- `kind: "chat"`: a text message shown on the phone UI (no voice)
- `kind: "action"`: a caption only, like `*everyone laughs*`

Character mouths flap automatically while their line's audio plays, and the scene
animations (camera punch-ins, reactions, exits) are keyed to these cues. If you move a
line, its animation moves with it. Change a scene's `duration` if you need more room.

## Swapping in real voiceover

The current voices are **placeholder text-to-speech** made with [Piper](https://github.com/rhasspy/piper)
(free, offline), a different voice per character:

| Character | Piper voice | Tweaks |
|-----------|-------------|--------|
| Marcus | `en_US-ryan-medium` | none |
| Dev | `en_US-kusal-medium` | slightly faster, pitch −2% |
| Tank | `en_US-norman-medium` | slower, pitch −10% |
| Jace | `en_US-joe-medium` | faster, pitch +16% |
| Radio voice | `en_US-hfc_female-medium` | band-passed "radio" filter |

To replace them with real recordings:

1. Record each line and name the file after its line id (`s2_01.wav`, `s8_05.mp3`, …).
   The ids are listed in `script.md` order in `dialogue.json`.
2. Drop the files into `public/audio/voice/`, replacing the placeholders.
3. Run `npm run voices:scan` to re-index the files and their lengths.
4. Run `npm run check` to see if any new take runs into the next line, and nudge `at`
   values in `dialogue.json` if needed.
5. `npm run render`.

To regenerate the placeholder voices (e.g. after editing a line's text):

```bash
pip install piper-tts                 # needs ffmpeg on PATH too
npm run voices                        # all lines (downloads voice models into ./voices)
python3 scripts/generate_voices.py s3_04 s6_10   # just specific lines
```

A line's optional `tts` field overrides the text sent to the voice engine (useful for
spelling things phonetically) without changing the caption.

## Sound

All sound effects and music are synthesized from scratch with numpy
(`npm run sfx`): wind, cart rattle, crash, notification ding, chat pop, whoosh, impact
hit, door slam, chip crunch, radio static, crickets, snore, a light comedy music loop,
and two soft chord pads for the lonely montage and the rooftop sunset. Music ducks
automatically under dialogue (`src/components/Music.tsx`).

## Handy commands

```bash
npm run check                        # runtime + timing overlaps
npm run stills -- s3_05 s8_05+20 120  # preview PNGs by line id (+/- frames) or frame number
npm run typecheck
```

## Credits

- Fonts: Luckiest Guy (Apache 2.0) and Nunito (SIL OFL), bundled in `public/fonts/`
- Placeholder voices: Piper TTS voice models (see each model's card on Hugging Face for its license)
