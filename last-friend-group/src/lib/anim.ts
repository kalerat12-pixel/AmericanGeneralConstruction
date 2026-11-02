import {Easing, interpolate, spring} from 'remotion';
import {FPS} from './timing';

/** Clamped, eased interpolation between two frames. */
export const tween = (
  frame: number,
  from: number,
  to: number,
  a: number,
  b: number,
  easing: (t: number) => number = Easing.inOut(Easing.cubic),
) => interpolate(frame, [from, to], [a, b], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

/** Multi-keyframe clamped interpolation with easing between each key. */
export const keys = (frame: number, input: number[], output: number[], easing = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, input, output, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

/** Bouncy 0→1 pop starting at a frame. */
export const pop = (frame: number, start: number, damping = 11, stiffness = 170) =>
  frame < start ? 0 : spring({frame: frame - start, fps: FPS, config: {damping, stiffness, mass: 0.6}});

/** Deterministic pseudo-random number in [0,1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Decaying screen shake offset. */
export const shake = (frame: number, start: number, dur = 12, amp = 18) => {
  if (frame < start || frame > start + dur) return {x: 0, y: 0};
  const k = 1 - (frame - start) / dur;
  return {x: (rand(frame) - 0.5) * 2 * amp * k, y: (rand(frame + 99) - 0.5) * 2 * amp * k};
};

export const between = (frame: number, a: number, b: number) => frame >= a && frame < b;
