import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {
  BenchFront,
  Classroom,
  Desks,
  FreezerAisle,
  HIGHWAY_Y,
  Highway,
  PARK_SEAT,
  Park,
} from '../components/Backgrounds';
import {Camera, Stage} from '../components/Camera';
import {Character, INK} from '../components/Character';
import {Cart} from '../components/Props';
import {SceneShell} from '../components/SceneShell';
import {Sfx} from '../components/Sfx';
import {TITLE_FONT} from '../fonts';
import {tween} from '../lib/anim';
import {FrameOverride, useCues, useSceneFrame} from '../lib/scene';
import {sceneById, toFrames} from '../lib/timing';

// Vignette windows (seconds within the scene).
const V = {
  marcus: [1.7, 6.6],
  dev: [6.6, 12.4],
  jace: [12.4, 16.8],
  tank: [16.8, 20.6],
} as const;
const GRID = toFrames(20.6);

const Sad: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{filter: 'saturate(0.45) brightness(0.95)'}}>
    {children}
    <AbsoluteFill style={{background: '#4D6A9C', mixBlendMode: 'multiply', opacity: 0.35}} />
  </AbsoluteFill>
);

const MarcusAlone: React.FC = () => {
  const s = toFrames(V.marcus[0]);
  return (
    <Sad>
      <Camera keys={[{f: s, x: 960, y: 540, z: 1}, {f: toFrames(V.marcus[1]), x: 760, y: 560, z: 1.18}]}>
        <Stage>
          <Classroom />
          <Character who="marcus" x={560} y={920} pose="clip" prop="clipboard" expr="sad" look={0.4} />
          <Desks />
        </Stage>
      </Camera>
    </Sad>
  );
};

const DevAlone: React.FC = () => {
  const frame = useSceneFrame();
  const s = toFrames(V.dev[0]);
  const c = useCues();
  const sadNow = frame > c.end('s7_02');
  return (
    <Sad>
      <Camera keys={[{f: s, x: 960, y: 560, z: 1.05}, {f: toFrames(V.dev[1]), x: 980, y: 540, z: 1.25}]}>
        <Stage>
          <Park />
          <Character who="dev" x={960} y={PARK_SEAT + 150} sitting pose="selfie" prop="phone" expr={sadNow ? 'sad' : 'happy'} look={0.6} lookY={-0.5} />
          <BenchFront />
          {/* "LIVE: 0 watching" badge */}
          <g transform="translate(1190 380)">
            <rect x={0} y={0} width={230} height={86} rx={16} fill="#fff" stroke={INK} strokeWidth={6} />
            <rect x={14} y={14} width={86} height={34} rx={8} fill="#E63946" />
            <text x={57} y={42} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={26} fill="#fff">
              LIVE
            </text>
            <text x={112} y={44} fontFamily={TITLE_FONT} fontSize={26} fill={INK}>
              0
            </text>
            <text x={18} y={76} fontFamily={TITLE_FONT} fontSize={22} fill="#666">
              WATCHING
            </text>
          </g>
          {/* a single falling leaf */}
          <g transform={`translate(${700 + Math.sin(frame * 0.08) * 80} ${interpolate(frame, [s, s + 170], [100, 900])}) rotate(${frame * 4})`}>
            <ellipse rx={18} ry={9} fill="#D68C45" stroke={INK} strokeWidth={3} />
          </g>
        </Stage>
      </Camera>
    </Sad>
  );
};

const JaceAlone: React.FC = () => {
  const frame = useSceneFrame();
  const s = toFrames(V.jace[0]);
  const e = toFrames(V.jace[1]);
  const x = tween(frame, s, e, 520, 1240, (t) => 1 - (1 - t) * (1 - t));
  const weedX = interpolate(frame, [s, e], [2100, -300]);
  return (
    <Sad>
      <Camera keys={[{f: s, x: 900, y: 600, z: 1.05}, {f: e, x: 1150, y: 600, z: 1.1}]}>
        <Stage>
          <Highway scroll={(x - 520) * 0.5} />
          <Character who="jace" x={x - 10} y={HIGHWAY_Y - 70} pose="lap" expr="bored" scale={0.95} />
          <Cart x={x} y={HIGHWAY_Y} spin={x * 2} />
          {/* tumbleweed */}
          <g transform={`translate(${weedX} ${HIGHWAY_Y - 50 - Math.abs(Math.sin(frame * 0.2)) * 60}) rotate(${-frame * 8})`}>
            <circle r={46} fill="none" stroke="#A47148" strokeWidth={6} />
            <path d="M -40 -10 Q 0 30 40 -6 M -30 24 Q 0 -40 34 22 M -10 -44 Q 10 0 -6 44" stroke="#A47148" strokeWidth={5} fill="none" />
          </g>
        </Stage>
      </Camera>
    </Sad>
  );
};

const TankAlone: React.FC = () => {
  const frame = useSceneFrame();
  const s = toFrames(V.tank[0]);
  const open = tween(frame, s + 4, s + 24, 0, 1);
  const hasBox = frame > s + 30;
  return (
    <Sad>
      <Camera keys={[{f: s, x: 960, y: 520, z: 1}, {f: toFrames(V.tank[1]), x: 1080, y: 520, z: 1.25}]}>
        <Stage>
          <FreezerAisle open={open} />
          <Character
            who="tank"
            x={1270}
            y={1010}
            facing={-1}
            pose={hasBox ? 'hold' : 'idle'}
            prop={hasBox ? 'pizzabox' : 'none'}
            expr={frame > s + 75 ? 'happy' : 'sad'}
            look={hasBox ? -0.3 : -1}
            lookY={hasBox ? 1 : 0}
          />
        </Stage>
      </Camera>
    </Sad>
  );
};

const Inner: React.FC = () => {
  const frame = useSceneFrame();
  const at = (k: keyof typeof V) => toFrames(V[k][0]);
  if (frame < GRID) {
    if (frame < at('dev')) return <MarcusAlone />;
    if (frame < at('jace')) return <DevAlone />;
    if (frame < at('tank')) return <JaceAlone />;
    return <TankAlone />;
  }
  // Four-way split of everyone alone.
  const t = frame - GRID;
  const quads: [keyof typeof V, React.FC][] = [
    ['marcus', MarcusAlone],
    ['dev', DevAlone],
    ['jace', JaceAlone],
    ['tank', TankAlone],
  ];
  return (
    <AbsoluteFill style={{background: INK}}>
      {quads.map(([k, Comp], i) => {
        const end = toFrames(V[k][1]);
        const f = end - 32 + (t % 30);
        const slide = interpolate(t, [i * 3, i * 3 + 10], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: (i % 2) * 960 + 6,
              top: Math.floor(i / 2) * 540 + 6,
              width: 948,
              height: 528,
              overflow: 'hidden',
              transform: `translateY(${slide * (i < 2 ? -560 : 560)}px)`,
            }}
          >
            <div style={{width: 1920, height: 1080, transform: 'scale(0.4938)', transformOrigin: '0 0', position: 'relative'}}>
              <FrameOverride frame={f}>
                <Comp />
              </FrameOverride>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const S7Alone: React.FC = () => {
  const s = sceneById('s7');
  const len = toFrames(s.duration);
  return (
    <SceneShell scene={s} card={{a: '#4D6A9C', b: '#3E5885', tag: '#1D3557'}}>
      <Inner />
      <Sfx name="wind" at={51} dur={len - 51} loop volume={0.18} />
      <Sfx name="cart" at={toFrames(V.jace[0])} dur={toFrames(4.2)} volume={0.25} fadeOut={30} />
    </SceneShell>
  );
};
