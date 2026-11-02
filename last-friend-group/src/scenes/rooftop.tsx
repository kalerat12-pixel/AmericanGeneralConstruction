import {interpolate} from 'remotion';
import {LEDGE_Y, ROOF_Y} from '../components/Backgrounds';

export const DOOR_X = 1720;
export const SIT_Y = LEDGE_Y + 175;
export const SEATS = {marcus: 640, dev: 860, jace: 1080, tank: 1320} as const;

/** Character walks out of the rooftop door, stops, then hops onto the ledge to sit. */
export const arrival = (
  frame: number,
  o: {door: number; stopX: number; stopF: number; seatX: number; walkToSeat: number; sitF: number},
) => {
  const visible = frame >= o.door + 6;
  if (frame < o.walkToSeat) {
    const x = interpolate(frame, [o.door + 6, o.stopF], [DOOR_X, o.stopX], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return {visible, x, y: ROOF_Y, walking: frame < o.stopF, sitting: false, facing: -1 as const};
  }
  if (frame < o.sitF - 8) {
    const x = interpolate(frame, [o.walkToSeat, o.sitF - 8], [o.stopX, o.seatX], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return {visible, x, y: ROOF_Y, walking: true, sitting: false, facing: -1 as const};
  }
  // hop onto the ledge
  const t = interpolate(frame, [o.sitF - 8, o.sitF], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const y = ROOF_Y + (SIT_Y - ROOF_Y) * t - Math.sin(t * Math.PI) * 60;
  return {visible, x: o.seatX, y, walking: false, sitting: t > 0.5, facing: -1 as const};
};

export const doorOpen = (frame: number, doors: number[]) =>
  Math.min(
    1,
    doors.reduce(
      (acc, d) =>
        acc +
        interpolate(frame, [d, d + 6, d + 40, d + 48], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
      0,
    ),
  );
