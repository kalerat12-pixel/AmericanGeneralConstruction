import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {SCENES, SCENE_STARTS, speakingWindow, toFrames} from '../lib/timing';

// Absolute frame windows where someone is talking, used to duck the music.
const VOICE_WINDOWS = SCENES.flatMap((s) =>
  s.lines
    .filter((l) => !l.kind)
    .map((l) => {
      const w = speakingWindow(l);
      return [SCENE_STARTS[s.id] + w.start, SCENE_STARTS[s.id] + w.end] as const;
    }),
);

const duck = (abs: number) => {
  let d = 0;
  for (const [a, b] of VOICE_WINDOWS) {
    if (abs >= a - 6 && abs <= b + 8) {
      const v = abs < a ? (abs - (a - 6)) / 6 : abs > b ? 1 - (abs - b) / 8 : 1;
      d = Math.max(d, v);
    }
  }
  return d;
};

const fadeEnvelope = (f: number, dur: number, fadeIn: number, fadeOut: number) =>
  interpolate(f, [0, fadeIn, dur - fadeOut, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Background music beds for the whole episode, ducked under dialogue. */
export const Music: React.FC = () => {
  const s = (id: string) => SCENE_STARTS[id];
  const sceneLen = (id: string) => toFrames(SCENES.find((x) => x.id === id)!.duration);

  // Comedy bed: from the main title (10s in) to the door slams in the fight.
  const fight = SCENES.find((x) => x.id === 's6')!;
  const lastFightLine = fight.lines[fight.lines.length - 1];
  const comedyStart = s('s1') + toFrames(10);
  const comedyEnd = s('s6') + speakingWindow(lastFightLine).end + 10;
  const comedyDur = comedyEnd - comedyStart;

  const sadStart = s('s7');
  const sadDur = sceneLen('s7');
  const warmStart = s('s8');
  const warmDur = sceneLen('s8') + 30;

  return (
    <>
      <Sequence from={comedyStart} durationInFrames={comedyDur} layout="none">
        <Audio
          src={staticFile('audio/sfx/music_loop.wav')}
          loop
          volume={(f) => fadeEnvelope(f, comedyDur, 10, 6) * (0.2 - 0.12 * duck(comedyStart + f))}
        />
      </Sequence>
      <Sequence from={sadStart} durationInFrames={sadDur} layout="none">
        <Audio src={staticFile('audio/sfx/pad_sad.wav')} volume={(f) => fadeEnvelope(f, sadDur, 30, 30) * (0.32 - 0.12 * duck(sadStart + f))} />
      </Sequence>
      <Sequence from={warmStart} durationInFrames={warmDur} layout="none">
        <Audio
          src={staticFile('audio/sfx/pad_warm.wav')}
          volume={(f) => fadeEnvelope(f, warmDur, 60, 40) * (0.3 - 0.1 * duck(warmStart + f))}
        />
      </Sequence>
    </>
  );
};
