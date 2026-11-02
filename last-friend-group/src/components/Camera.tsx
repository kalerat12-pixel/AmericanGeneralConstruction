import React from 'react';
import {Easing, interpolate} from 'remotion';
import {shake} from '../lib/anim';
import {useSceneFrame} from '../lib/scene';

export interface CamKey {
  /** Scene-relative frame. */
  f: number;
  /** World point to center on (default 960,540) and zoom (default 1). */
  x?: number;
  y?: number;
  z?: number;
}

export interface Shake {
  f: number;
  dur?: number;
  amp?: number;
}

const resolve = (keys: CamKey[]) => {
  const out: Required<CamKey>[] = [];
  let prev: Required<CamKey> = {f: 0, x: 960, y: 540, z: 1};
  for (const k of [...keys].sort((a, b) => a.f - b.f)) {
    prev = {f: k.f, x: k.x ?? prev.x, y: k.y ?? prev.y, z: k.z ?? prev.z};
    out.push(prev);
  }
  return out.length ? out : [prev];
};

/** Wraps a 1920x1080 world and moves a virtual camera over it (pans, zooms, shakes). */
export const Camera: React.FC<{keys: CamKey[]; shakes?: Shake[]; children: React.ReactNode}> = ({keys, shakes = [], children}) => {
  const frame = useSceneFrame();
  const k = resolve(keys);
  let x = k[0].x;
  let y = k[0].y;
  let z = k[0].z;
  if (k.length > 1) {
    const fs = k.map((q) => q.f);
    // Make frames strictly increasing for interpolate().
    for (let i = 1; i < fs.length; i++) if (fs[i] <= fs[i - 1]) fs[i] = fs[i - 1] + 0.001;
    const opts = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: Easing.inOut(Easing.cubic)};
    x = interpolate(frame, fs, k.map((q) => q.x), opts);
    y = interpolate(frame, fs, k.map((q) => q.y), opts);
    z = interpolate(frame, fs, k.map((q) => q.z), opts);
  }
  let sx = 0;
  let sy = 0;
  for (const s of shakes) {
    const o = shake(frame, s.f, s.dur ?? 12, s.amp ?? 18);
    sx += o.x;
    sy += o.y;
  }
  return (
    <div
      style={{
        position: 'absolute',
        width: 1920,
        height: 1080,
        transformOrigin: '0 0',
        transform: `translate(${960 + sx}px, ${540 + sy}px) scale(${z}) translate(${-x}px, ${-y}px)`,
      }}
    >
      {children}
    </div>
  );
};

/** Full-frame SVG stage in world coordinates (content may extend past the edges). */
export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{overflow: 'visible', position: 'absolute'}}>
    {children}
  </svg>
);
