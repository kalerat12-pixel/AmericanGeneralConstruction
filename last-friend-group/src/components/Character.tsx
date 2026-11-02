import React from 'react';
import type {Who} from '../config/characters';
import {useSceneFrame, useSpeaking} from '../lib/scene';
import {Chips, Clipboard, Phone, PizzaBox, PizzaRoll, Pretzel} from './Props';

export const INK = '#1d1b22';
const SW = 6; // outline width

export type Pose =
  | 'idle'
  | 'phone'
  | 'phone1'
  | 'selfie'
  | 'clip'
  | 'clipPoint'
  | 'point'
  | 'cheer'
  | 'shrug'
  | 'hips'
  | 'cross'
  | 'wave'
  | 'climb'
  | 'holdUp'
  | 'hold'
  | 'food'
  | 'reach'
  | 'lap'
  | 'cup'
  | 'thumbsUp';

export type Expr = 'neutral' | 'happy' | 'angry' | 'sad' | 'shock' | 'smug' | 'sleep' | 'laugh' | 'bored' | 'chew';

export type PropKind = 'clipboard' | 'phone' | 'chips' | 'pizzabox' | 'pizzaboxOpen' | 'roll' | 'pretzel' | 'none';

interface Look {
  skin: string;
  skinShade: string;
  top: string;
  topShade: string;
  pants: string;
  shoes: string;
  hair: string;
  sleeve: 'long' | 'short' | 'none';
}

export const LOOKS: Record<Who, Look> = {
  marcus: {skin: '#8B5A2B', skinShade: '#6F4520', top: '#E63946', topShade: '#B42532', pants: '#2C3E63', shoes: '#F4F4F4', hair: '#17141a', sleeve: 'long'},
  dev: {skin: '#C68642', skinShade: '#A66C30', top: '#2DBE6C', topShade: '#1F9452', pants: '#3A3A50', shoes: '#FF8A3D', hair: '#121016', sleeve: 'long'},
  tank: {skin: '#F2C48D', skinShade: '#D9A770', top: '#8C929C', topShade: '#6E747E', pants: '#30343c', shoes: '#4b4f57', hair: '#8a6a48', sleeve: 'none'},
  jace: {skin: '#E2AE72', skinShade: '#C79358', top: '#FFD166', topShade: '#E5B347', pants: '#4E72A8', shoes: '#E63946', hair: '#5b3a1f', sleeve: 'short'},
};

// [upperArmOutward, forearmOutwardRelative] in degrees, for left then right arm.
// 0 = hanging straight down. Positive = swing away from the body.
type ArmPose = [number, number];
const POSES: Record<Pose, {l: ArmPose; r: ArmPose; lFront?: boolean; rFront?: boolean}> = {
  idle: {l: [8, -6], r: [8, -6]},
  phone: {l: [14, -130], r: [14, -130], lFront: true, rFront: true},
  phone1: {l: [8, -6], r: [14, -130], rFront: true},
  selfie: {l: [8, -6], r: [120, -40]},
  clip: {l: [16, -122], r: [8, -6], lFront: true},
  clipPoint: {l: [16, -122], r: [98, -8], lFront: true},
  point: {l: [8, -6], r: [98, -8]},
  cheer: {l: [150, 15], r: [150, 15]},
  shrug: {l: [48, 100], r: [48, 100]},
  hips: {l: [42, -88], r: [42, -88]},
  cross: {l: [14, -124], r: [16, -118], lFront: true, rFront: true},
  wave: {l: [8, -6], r: [140, 30]},
  climb: {l: [165, 0], r: [165, 0]},
  holdUp: {l: [8, -6], r: [160, -5]},
  hold: {l: [8, -6], r: [30, -95], rFront: true},
  food: {l: [8, -6], r: [22, -138], rFront: true},
  reach: {l: [8, -6], r: [70, -25]},
  lap: {l: [12, -40], r: [12, -40], lFront: true, rFront: true},
  cup: {l: [60, -150], r: [60, -150], lFront: true, rFront: true},
  thumbsUp: {l: [8, -6], r: [130, 20]},
};

export interface CharacterProps {
  who: Who;
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  pose?: Pose;
  expr?: Expr;
  /** Force mouth flapping on/off. Defaults to "is one of my voice lines playing?" */
  talking?: boolean;
  /** Pupil direction, -1..1 (screen-relative after facing). */
  look?: number;
  lookY?: number;
  walking?: boolean;
  sitting?: boolean;
  prop?: PropKind;
  rot?: number;
  opacity?: number;
  /** Extra vertical bounce amount (e.g. laughing). */
  bounce?: number;
  /** Bluish screen-glow on the face. */
  glow?: boolean;
}

const DEFAULT_PROP: Record<Who, PropKind> = {marcus: 'none', dev: 'none', tank: 'none', jace: 'none'};

const seedOf: Record<Who, number> = {marcus: 0, dev: 17, tank: 33, jace: 51};

const dir = (side: number, deg: number) => {
  const r = (deg * Math.PI) / 180;
  return {x: side * Math.sin(r), y: Math.cos(r)};
};

export const Character: React.FC<CharacterProps> = (p) => {
  const {who, x, y, scale = 1, facing = 1, pose = 'idle', expr = 'neutral', look = 0, lookY = 0} = p;
  const frame = useSceneFrame();
  const autoTalk = useSpeaking(who);
  const talking = p.talking ?? autoTalk;
  const L = LOOKS[who];
  const big = who === 'tank';
  const W = big ? 1.28 : 1; // body width multiplier
  const S = scale * (big ? 1.12 : 1);
  const seed = seedOf[who];
  const prop = p.prop ?? DEFAULT_PROP[who];

  // Idle bob, walking bob and extra bounce.
  const bobY = Math.sin((frame + seed) * 0.11) * 3;
  const walkT = frame * 0.42;
  const walkBob = p.walking ? -Math.abs(Math.cos(walkT)) * 9 : 0;
  const bounce = p.bounce ? -Math.abs(Math.sin(frame * 0.55)) * p.bounce : 0;
  const breathe = 1 + Math.sin((frame + seed) * 0.11) * 0.008;

  // Blink every ~3 seconds.
  const bt = (frame + seed * 7) % 97;
  const blink = bt < 2 ? 0.15 : bt < 4 ? 0.5 : 1;

  // Mouth flap while talking (or chewing).
  const flapSeq = [0.25, 0.95, 0.55, 1, 0.35, 0.8, 0.15, 0.9, 0.6, 0.3];
  const flap = flapSeq[Math.floor((frame + seed) / 3) % flapSeq.length];
  const mouthOpen = talking ? flap : expr === 'chew' ? (Math.sin(frame * 0.6) > 0 ? 0.3 : 0.05) : 0;

  // Arms
  const ps = POSES[pose];
  let lA = ps.l;
  let rA = ps.r;
  if (pose === 'climb') {
    const c = Math.sin(frame * 0.35) * 18;
    lA = [165 + c, 0];
    rA = [165 - c, 0];
  }
  if (pose === 'wave') rA = [140, 30 + Math.sin(frame * 0.5) * 25];
  if (p.walking && pose === 'idle') {
    const s = Math.sin(walkT) * 14;
    lA = [8 + s, -10];
    rA = [8 - s, -10];
  }
  const shoulderY = -318;
  const shoulderX = 62 * W;
  const upperLen = 86;
  const foreLen = 80;
  const armW = big ? 40 : 30;

  const arm = (side: number, a: ArmPose) => {
    const sx = side * shoulderX;
    const d1 = dir(side, a[0]);
    const ex = sx + d1.x * upperLen;
    const ey = shoulderY + d1.y * upperLen;
    const d2 = dir(side, a[0] + a[1]);
    const hx = ex + d2.x * foreLen;
    const hy = ey + d2.y * foreLen;
    return {sx, sy: shoulderY, ex, ey, hx, hy, d2};
  };
  const la = arm(-1, lA);
  const ra = arm(1, rA);

  const drawArm = (g: ReturnType<typeof arm>, key: string, pointing = false, thumb = false) => {
    const path = `M ${g.sx} ${g.sy} L ${g.ex} ${g.ey} L ${g.hx} ${g.hy}`;
    const sleeveColor = L.sleeve === 'long' ? L.top : L.skin;
    const shortSleeve =
      L.sleeve === 'short'
        ? `M ${g.sx} ${g.sy} L ${g.sx + (g.ex - g.sx) * 0.45} ${g.sy + (g.ey - g.sy) * 0.45}`
        : null;
    return (
      <g key={key}>
        <path d={path} stroke={INK} strokeWidth={armW + SW * 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={path} stroke={sleeveColor} strokeWidth={armW} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {shortSleeve && (
          <path d={shortSleeve} stroke={L.top} strokeWidth={armW + 8} fill="none" strokeLinecap="round" />
        )}
        {pointing && (
          <line
            x1={g.hx}
            y1={g.hy}
            x2={g.hx + g.d2.x * 34}
            y2={g.hy + g.d2.y * 34}
            stroke={INK}
            strokeWidth={16}
            strokeLinecap="round"
          />
        )}
        {pointing && (
          <line x1={g.hx} y1={g.hy} x2={g.hx + g.d2.x * 34} y2={g.hy + g.d2.y * 34} stroke={L.skin} strokeWidth={6} strokeLinecap="round" />
        )}
        {thumb && (
          <>
            <line x1={g.hx} y1={g.hy} x2={g.hx} y2={g.hy - 32} stroke={INK} strokeWidth={18} strokeLinecap="round" />
            <line x1={g.hx} y1={g.hy} x2={g.hx} y2={g.hy - 32} stroke={L.skin} strokeWidth={7} strokeLinecap="round" />
          </>
        )}
        <circle cx={g.hx} cy={g.hy} r={big ? 21 : 17} fill={L.skin} stroke={INK} strokeWidth={SW - 1} />
      </g>
    );
  };

  // Legs
  const hipY = -168;
  const legX = 27 * W;
  const legW = big ? 46 : 36;
  const legLen = p.sitting ? 95 : 150;
  const legSwing = p.walking ? Math.sin(walkT) * 22 : p.sitting ? Math.sin((frame + seed) * 0.08) * 8 : 0;
  const leg = (side: number, swing: number) => {
    const a = (swing * Math.PI) / 180;
    const fx = side * legX + Math.sin(a) * legLen;
    const fy = hipY + Math.cos(a) * legLen;
    const path = `M ${side * legX} ${hipY} L ${fx} ${fy}`;
    return (
      <g key={`leg${side}`}>
        <path d={path} stroke={INK} strokeWidth={legW + SW * 2} strokeLinecap="round" />
        <path d={path} stroke={L.pants} strokeWidth={legW} strokeLinecap="round" />
        <ellipse cx={fx + 8} cy={fy + 8} rx={big ? 36 : 30} ry={big ? 17 : 15} fill={L.shoes} stroke={INK} strokeWidth={SW - 1} />
        <path d={`M ${fx - 18} ${fy + 14} L ${fx + 34} ${fy + 14}`} stroke={INK} strokeWidth={3} opacity={0.35} />
      </g>
    );
  };

  // Face geometry
  const headY = -408;
  const headR = big ? 74 : 70;
  const fx = 7; // 3/4 view offset towards facing direction
  const eyeY = headY - 4;
  const eyeL = -22 + fx;
  const eyeR = 26 + fx;
  // Pupils: `look` is screen-relative, so undo the facing flip.
  const px = look * 5 * facing;
  const py = lookY * 5 + 1;

  const eyes = () => {
    if (expr === 'sleep') {
      return (
        <g stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round">
          <path d={`M ${eyeL - 12} ${eyeY + 2} Q ${eyeL} ${eyeY + 10} ${eyeL + 12} ${eyeY + 2}`} />
          <path d={`M ${eyeR - 12} ${eyeY + 2} Q ${eyeR} ${eyeY + 10} ${eyeR + 12} ${eyeY + 2}`} />
        </g>
      );
    }
    if (expr === 'happy' || expr === 'laugh') {
      return (
        <g stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round">
          <path d={`M ${eyeL - 12} ${eyeY + 4} Q ${eyeL} ${eyeY - 12} ${eyeL + 12} ${eyeY + 4}`} />
          <path d={`M ${eyeR - 12} ${eyeY + 4} Q ${eyeR} ${eyeY - 12} ${eyeR + 12} ${eyeY + 4}`} />
        </g>
      );
    }
    const big = expr === 'shock';
    const rx = big ? 15 : 13;
    const ry = (big ? 19 : 16) * blink;
    const pr = big ? 5 : 6.5;
    const lid = expr === 'bored' || expr === 'smug';
    return (
      <g>
        {[eyeL, eyeR].map((ex, i) => (
          <g key={i}>
            <ellipse cx={ex} cy={eyeY} rx={rx} ry={Math.max(ry, 1.5)} fill="#fff" stroke={INK} strokeWidth={4} />
            {blink > 0.4 && <circle cx={ex + px} cy={eyeY + py} r={pr} fill={INK} />}
            {blink > 0.4 && <circle cx={ex + px + 2} cy={eyeY + py - 2.5} r={1.8} fill="#fff" />}
            {lid && blink > 0.4 && (
              <path
                d={`M ${ex - rx - 2} ${eyeY} A ${rx + 2} ${ry + 2} 0 0 1 ${ex + rx + 2} ${eyeY} Z`}
                fill={L.skin}
                stroke={INK}
                strokeWidth={4}
              />
            )}
          </g>
        ))}
      </g>
    );
  };

  const brows = () => {
    const by = eyeY - (expr === 'shock' ? 32 : 26);
    let tiltL = 0;
    let tiltR = 0;
    if (expr === 'angry') {
      tiltL = 20;
      tiltR = -20;
    } else if (expr === 'sad') {
      tiltL = -16;
      tiltR = 16;
    } else if (expr === 'smug') {
      tiltL = 0;
      tiltR = -14;
    }
    const color = who === 'tank' ? '#6b4f33' : L.hair;
    return (
      <g stroke={color} strokeWidth={big ? 9 : 8} strokeLinecap="round">
        <line x1={eyeL - 13} y1={by} x2={eyeL + 13} y2={by} transform={`rotate(${tiltL} ${eyeL} ${by})`} />
        <line
          x1={eyeR - 13}
          y1={by - (expr === 'smug' ? 6 : 0)}
          x2={eyeR + 13}
          y2={by - (expr === 'smug' ? 6 : 0)}
          transform={`rotate(${tiltR} ${eyeR} ${by})`}
        />
      </g>
    );
  };

  const mouth = () => {
    const mx = 4 + fx;
    const my = headY + 38;
    if (mouthOpen > 0.02 || expr === 'shock' || expr === 'laugh') {
      const o = expr === 'laugh' ? 0.85 + flap * 0.15 : expr === 'shock' && !talking ? 0.75 : mouthOpen;
      const rx = expr === 'laugh' ? 22 : 13 + o * 4;
      const ry = 3 + o * 14;
      if (expr === 'laugh') {
        return (
          <g>
            <path d={`M ${mx - rx} ${my - 4} Q ${mx} ${my - 8} ${mx + rx} ${my - 4} Q ${mx + rx} ${my + ry * 1.3} ${mx} ${my + ry * 1.3} Q ${mx - rx} ${my + ry * 1.3} ${mx - rx} ${my - 4} Z`} fill="#5b1620" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
            <ellipse cx={mx} cy={my + ry * 0.95} rx={rx * 0.55} ry={ry * 0.3} fill="#ff7a8a" />
          </g>
        );
      }
      return (
        <g>
          <ellipse cx={mx} cy={my + ry * 0.4} rx={rx} ry={ry} fill="#5b1620" stroke={INK} strokeWidth={4.5} />
          {ry > 8 && <ellipse cx={mx} cy={my + ry * 0.4 + ry * 0.55} rx={rx * 0.6} ry={ry * 0.32} fill="#ff7a8a" />}
        </g>
      );
    }
    const common = {stroke: INK, strokeWidth: 5, fill: 'none', strokeLinecap: 'round' as const};
    switch (expr) {
      case 'happy':
        return <path d={`M ${mx - 18} ${my - 2} Q ${mx} ${my + 18} ${mx + 18} ${my - 2}`} {...common} />;
      case 'sad':
        return <path d={`M ${mx - 14} ${my + 8} Q ${mx} ${my - 6} ${mx + 14} ${my + 8}`} {...common} />;
      case 'angry':
        return <path d={`M ${mx - 14} ${my + 4} Q ${mx} ${my - 2} ${mx + 14} ${my + 4}`} {...common} />;
      case 'smug':
        return <path d={`M ${mx - 12} ${my + 4} Q ${mx + 6} ${my + 8} ${mx + 18} ${my - 6}`} {...common} />;
      case 'bored':
      case 'sleep':
        return <path d={`M ${mx - 11} ${my + 3} L ${mx + 11} ${my + 3}`} {...common} />;
      default:
        return <path d={`M ${mx - 13} ${my + 1} Q ${mx} ${my + 8} ${mx + 13} ${my + 1}`} {...common} />;
    }
  };

  const hair = () => {
    switch (who) {
      case 'marcus':
        return (
          <path
            d={`M -71 ${headY + 2} C -74 ${headY - 52} -52 ${headY - 78} 0 ${headY - 80} C 52 ${headY - 78} 74 ${headY - 52} 71 ${headY + 2} C 64 ${headY - 30} 50 ${headY - 46} 18 ${headY - 50} C -10 ${headY - 52} -48 ${headY - 46} -71 ${headY + 2} Z`}
            fill={L.hair}
            stroke={INK}
            strokeWidth={SW - 1}
            strokeLinejoin="round"
          />
        );
      case 'dev':
        return (
          <g>
            <path
              d={`M -72 ${headY + 6} C -80 ${headY - 60} -40 ${headY - 92} 10 ${headY - 88} C 62 ${headY - 86} 82 ${headY - 50} 72 ${headY - 4} C 66 ${headY - 34} 50 ${headY - 40} 30 ${headY - 44} C 14 ${headY - 24} -14 ${headY - 26} -30 ${headY - 40} C -48 ${headY - 34} -62 ${headY - 20} -72 ${headY + 6} Z`}
              fill={L.hair}
              stroke={INK}
              strokeWidth={SW - 1}
              strokeLinejoin="round"
            />
            <path
              d={`M 20 ${headY - 86} C 70 ${headY - 100} 96 ${headY - 70} 84 ${headY - 40} C 76 ${headY - 64} 56 ${headY - 74} 30 ${headY - 70} Z`}
              fill={L.hair}
              stroke={INK}
              strokeWidth={SW - 1}
              strokeLinejoin="round"
            />
          </g>
        );
      case 'tank':
        return (
          <path
            d={`M -73 ${headY - 6} C -74 ${headY - 60} -44 ${headY - 78} 0 ${headY - 78} C 44 ${headY - 78} 74 ${headY - 60} 73 ${headY - 6} C 62 ${headY - 40} 36 ${headY - 52} 0 ${headY - 52} C -36 ${headY - 52} -62 ${headY - 40} -73 ${headY - 6} Z`}
            fill={L.hair}
            opacity={0.85}
          />
        );
      case 'jace':
        return (
          <g>
            {/* curls peeking out */}
            {[-74, -64, 66, 76].map((cx, i) => (
              <circle key={i} cx={cx} cy={headY - 18 + (i % 2) * 14} r={15} fill={L.hair} stroke={INK} strokeWidth={4} />
            ))}
            {/* backwards cap: dome + brim pointing back */}
            <path
              d={`M -74 ${headY - 16} C -76 ${headY - 76} -40 ${headY - 96} 4 ${headY - 96} C 50 ${headY - 96} 78 ${headY - 70} 74 ${headY - 16} Z`}
              fill="#2F6BFF"
              stroke={INK}
              strokeWidth={SW}
              strokeLinejoin="round"
            />
            <path
              d={`M -66 ${headY - 34} C -110 ${headY - 40} -136 ${headY - 26} -132 ${headY - 12} C -110 ${headY - 6} -86 ${headY - 12} -66 ${headY - 14} Z`}
              fill="#1F4FCC"
              stroke={INK}
              strokeWidth={SW - 1}
              strokeLinejoin="round"
            />
            {/* strap gap showing hair at the front */}
            <path d={`M ${fx - 16} ${headY - 16} Q ${fx} ${headY - 40} ${fx + 16} ${headY - 16} Z`} fill={L.hair} stroke={INK} strokeWidth={4} />
            <circle cx={4} cy={headY - 92} r={6} fill="#1F4FCC" stroke={INK} strokeWidth={3} />
          </g>
        );
    }
  };

  const torso = () => {
    const tw = 66 * W;
    const top = -338;
    const bottom = -150;
    if (who === 'tank') {
      return (
        <g>
          <rect x={-tw} y={top} width={tw * 2} height={bottom - top} rx={30} fill={L.top} stroke={INK} strokeWidth={SW} />
          {/* tank-top neckline and arm holes */}
          <path d={`M -30 ${top} Q 0 ${top + 46} 30 ${top}`} fill={L.skin} stroke={INK} strokeWidth={SW - 1} />
          <path d={`M ${-tw} ${top + 6} Q ${-tw + 24} ${top + 40} ${-tw + 4} ${top + 72}`} fill="none" stroke={INK} strokeWidth={4} opacity={0.6} />
          <path d={`M ${tw} ${top + 6} Q ${tw - 24} ${top + 40} ${tw - 4} ${top + 72}`} fill="none" stroke={INK} strokeWidth={4} opacity={0.6} />
          <rect x={-tw} y={bottom - 18} width={tw * 2} height={18} rx={8} fill={L.topShade} />
        </g>
      );
    }
    if (who === 'jace') {
      return (
        <g>
          <rect x={-tw} y={top} width={tw * 2} height={bottom - top} rx={30} fill={L.top} stroke={INK} strokeWidth={SW} />
          <path d={`M -24 ${top} Q 0 ${top + 28} 24 ${top}`} fill={L.skin} stroke={INK} strokeWidth={SW - 1} />
          {/* lightning bolt graphic */}
          <path d={`M 6 ${top + 50} L -16 ${top + 98} L 2 ${top + 98} L -8 ${top + 140} L 22 ${top + 84} L 4 ${top + 84} L 16 ${top + 50} Z`} fill="#2F6BFF" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
        </g>
      );
    }
    // Hoodie
    return (
      <g>
        <rect x={-tw} y={top} width={tw * 2} height={bottom - top} rx={34} fill={L.top} stroke={INK} strokeWidth={SW} />
        <rect x={-tw + 3} y={bottom - 20} width={tw * 2 - 6} height={17} rx={8} fill={L.topShade} />
        <rect x={-40} y={bottom - 76} width={80} height={46} rx={14} fill={L.topShade} stroke={INK} strokeWidth={3.5} />
        <path d={`M -46 ${top + 2} Q 0 ${top + 52} 46 ${top + 2}`} fill={L.topShade} stroke={INK} strokeWidth={SW - 1} />
        <line x1={-14} y1={top + 26} x2={-16} y2={top + 70} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
        <line x1={14} y1={top + 26} x2={16} y2={top + 70} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
      </g>
    );
  };

  const propAt = (g: ReturnType<typeof arm>) => {
    switch (prop) {
      case 'clipboard':
        return <Clipboard x={g.hx + 18} y={g.hy - 10} />;
      case 'phone':
        return <Phone x={g.hx} y={g.hy - 22} />;
      case 'chips':
        return <Chips x={g.hx + 6} y={g.hy - 30} />;
      case 'pizzabox':
        return <PizzaBox x={g.hx} y={g.hy - 6} />;
      case 'pizzaboxOpen':
        return <PizzaBox x={g.hx} y={g.hy - 6} open />;
      case 'roll':
        return <PizzaRoll x={g.hx} y={g.hy - 20} />;
      case 'pretzel':
        return <Pretzel x={g.hx} y={g.hy - 22} />;
      default:
        return null;
    }
  };
  // Which hand holds the prop
  const propHand = prop === 'clipboard' ? la : ra;
  const phoneBoth = prop === 'phone' && pose === 'phone';
  const phoneCenter = {hx: (la.hx + ra.hx) / 2, hy: (la.hy + ra.hy) / 2} as ReturnType<typeof arm>;

  const pointing = pose === 'point' || pose === 'clipPoint';
  const thumb = pose === 'thumbsUp';
  const lFront = !!ps.lFront;
  const rFront = !!ps.rFront;

  return (
    <g transform={`translate(${x} ${y}) rotate(${p.rot ?? 0}) scale(${S * facing} ${S})`} opacity={p.opacity ?? 1}>
      <g transform={`translate(0 ${bobY + walkBob + bounce})`}>
        {/* ground shadow */}
        {!p.sitting && <ellipse cx={0} cy={6 - bobY - walkBob - bounce} rx={80 * W} ry={14} fill="#000" opacity={0.18} />}
        {leg(-1, -legSwing)}
        {leg(1, legSwing)}
        {!lFront && drawArm(la, 'la')}
        {!rFront && drawArm(ra, 'ra', pointing, thumb)}
        <g transform={`translate(0 ${-150}) scale(1 ${breathe}) translate(0 150)`}>{torso()}</g>
        {/* neck */}
        <rect x={-17} y={-352} width={34} height={26} fill={L.skinShade} stroke={INK} strokeWidth={4} />
        {/* ears */}
        <circle cx={-headR + 2} cy={headY + 4} r={15} fill={L.skin} stroke={INK} strokeWidth={SW - 1} />
        <circle cx={headR - 2} cy={headY + 4} r={15} fill={L.skin} stroke={INK} strokeWidth={SW - 1} />
        <circle cx={0} cy={headY} r={headR} fill={L.skin} stroke={INK} strokeWidth={SW} />
        {p.glow && <circle cx={0} cy={headY} r={headR - 3} fill="#8fe3ff" opacity={0.13} />}
        {hair()}
        {brows()}
        {eyes()}
        {/* nose */}
        <path d={`M ${fx + 6} ${headY + 8} Q ${fx + 16} ${headY + 20} ${fx + 4} ${headY + 22}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        {(expr === 'laugh' || expr === 'happy') && (
          <>
            <ellipse cx={eyeL - 10} cy={headY + 26} rx={11} ry={6} fill="#ff6b6b" opacity={0.35} />
            <ellipse cx={eyeR + 10} cy={headY + 26} rx={11} ry={6} fill="#ff6b6b" opacity={0.35} />
          </>
        )}
        {mouth()}
        {lFront && drawArm(la, 'la')}
        {rFront && drawArm(ra, 'ra', pointing, thumb)}
        {phoneBoth ? (
          <Phone x={phoneCenter.hx} y={phoneCenter.hy - 24} />
        ) : (
          // Un-mirror props so their labels read correctly when facing left.
          <g transform={`translate(${propHand.hx} 0) scale(${facing} 1) translate(${-propHand.hx} 0)`}>{propAt(propHand)}</g>
        )}
        {phoneBoth && (
          <>
            <circle cx={la.hx} cy={la.hy} r={big ? 21 : 17} fill={L.skin} stroke={INK} strokeWidth={SW - 1} />
            <circle cx={ra.hx} cy={ra.hy} r={big ? 21 : 17} fill={L.skin} stroke={INK} strokeWidth={SW - 1} />
          </>
        )}
      </g>
    </g>
  );
};
