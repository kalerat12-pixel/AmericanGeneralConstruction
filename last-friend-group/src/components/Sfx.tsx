import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';

export type SfxName =
  | 'wind'
  | 'crash'
  | 'ding'
  | 'pop'
  | 'whoosh'
  | 'hit'
  | 'slam'
  | 'crunch'
  | 'static'
  | 'cricket'
  | 'snore'
  | 'cart'
  | 'music_loop'
  | 'pad_sad'
  | 'pad_warm';

interface Props {
  name: SfxName;
  /** Scene-relative start frame. */
  at: number;
  volume?: number;
  /** Length in frames (needed for loops). */
  dur?: number;
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
}

/** Plays one of the synthesized sound effects at a frame. */
export const Sfx: React.FC<Props> = ({name, at, volume = 1, dur, loop, fadeIn = 0, fadeOut = 0}) => (
  <Sequence from={Math.round(at)} durationInFrames={dur} layout="none">
    <Audio
      src={staticFile(`audio/sfx/${name}.wav`)}
      loop={loop}
      volume={(f) => {
        let v = volume;
        if (fadeIn > 0) v *= interpolate(f, [0, fadeIn], [0, 1], {extrapolateRight: 'clamp'});
        if (fadeOut > 0 && dur) v *= interpolate(f, [dur - fadeOut, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return v;
      }}
    />
  </Sequence>
);
