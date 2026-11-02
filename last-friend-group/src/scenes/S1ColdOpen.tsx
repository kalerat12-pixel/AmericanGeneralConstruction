import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {CityStreet} from '../components/Backgrounds';
import {Camera, Stage} from '../components/Camera';
import {Character, INK} from '../components/Character';
import {Avatar} from '../components/PhoneUI';
import {Cart, Puff} from '../components/Props';
import {SceneShell} from '../components/SceneShell';
import {Sfx} from '../components/Sfx';
import {Outlined} from '../components/TitleCard';
import {pop, tween} from '../lib/anim';
import {useCues, useSceneFrame} from '../lib/scene';
import {sceneById, toFrames} from '../lib/timing';
import type {Who} from '../config/characters';

const ROAD = 1000;

const MainTitle: React.FC<{f: number}> = ({f}) => {
  const s = pop(f, 4, 9, 170);
  const s2 = pop(f, 0, 12, 160);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1B1F3B, #3D2C8D)'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {Array.from({length: 60}).map((_, i) => (
          <circle key={i} cx={(i * 337) % 1920} cy={(i * 191) % 640} r={2 + (i % 3)} fill="#fff" opacity={0.3 + 0.3 * Math.sin(f * 0.1 + i)} />
        ))}
        {Array.from({length: 16}).map((_, i) => {
          const h = 160 + ((i * 97) % 260);
          return <rect key={i} x={i * 124 - 20} y={1080 - h} width={118} height={h} fill="#141631" />;
        })}
      </svg>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginTop: -60}}>
        <div style={{transform: `translateY(${(1 - s2) * -300}px)`, opacity: s2}}>
          <Outlined text="LIFE AS THE" size={90} color="#fff" stroke={18} />
        </div>
        <div style={{transform: `scale(${2.4 - 1.4 * s}) rotate(${-3 * s}deg)`, opacity: Math.min(1, s * 2), marginTop: 6}}>
          <Outlined text="LAST FRIEND GROUP" size={170} color="#FFD60A" stroke={30} />
        </div>
        <div style={{display: 'flex', gap: 30, marginTop: 40}}>
          {(['marcus', 'dev', 'tank', 'jace'] as Who[]).map((w, i) => {
            const p = pop(f, 16 + i * 5, 10, 200);
            return (
              <div key={w} style={{transform: `translateY(${(1 - p) * 300 + Math.sin(f * 0.15 + i) * 6}px)`}}>
                <Avatar who={w} size={130} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Inner: React.FC = () => {
  const frame = useSceneFrame();
  const c = useCues();
  const rideStart = c.start('s1_01') + 26;
  const crashF = toFrames(6.8);
  const okay = c.start('s1_02');
  const titleF = toFrames(10);

  const cartX = interpolate(frame, [rideStart, crashF], [-400, 1480], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const riding = frame < crashF;
  const paperX = interpolate(frame, [0, 260], [-200, 2200]);

  // Carts flung by the crash
  const flung = [
    {dx: -260, dy: -420, r: -260, land: [1420, ROAD - 10, -20]},
    {dx: 240, dy: -520, r: 300, land: [1860, ROAD - 30, 35]},
    {dx: 40, dy: -680, r: 200, land: [1640, ROAD - 150, 170]},
  ];
  const ft = interpolate(frame, [crashF, crashF + 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <>
      <Camera
        keys={[
          {f: 0, x: 960, y: 540, z: 1.02},
          {f: rideStart, x: 860, y: 560, z: 1.1},
          {f: crashF - 6, x: 1300, y: 640, z: 1.18},
          {f: okay + 30, x: 1560, y: 760, z: 1.45},
        ]}
        shakes={[{f: crashF, dur: 18, amp: 30}]}
      >
        <Stage>
          <CityStreet frame={frame} />
          {/* tumbling newspaper */}
          <g transform={`translate(${paperX} ${880 + Math.sin(frame * 0.2) * 30}) rotate(${frame * 9})`}>
            <rect x={-34} y={-24} width={68} height={48} fill="#f5f1e6" stroke={INK} strokeWidth={4} />
            <line x1={-24} y1={-10} x2={20} y2={-10} stroke="#999" strokeWidth={4} />
            <line x1={-24} y1={4} x2={14} y2={4} stroke="#999" strokeWidth={4} />
          </g>
          {/* row of parked carts (the pile) */}
          {[1580, 1700, 1820].map((x, i) => (
            <Cart key={i} x={x} y={ROAD} scale={0.9} rot={frame >= crashF ? [-12, 8, -4][i] : 0} />
          ))}
          {frame >= crashF && (
            <>
              {flung.map((fl, i) => {
                const x = 1600 + fl.dx * ft + (fl.land[0] - 1600 - fl.dx) * ft * ft;
                const y = ROAD - 40 + fl.dy * Math.sin(ft * Math.PI) + (fl.land[1] - ROAD + 40) * ft;
                return <Cart key={i} x={x} y={y} scale={0.9} rot={fl.r * ft + fl.land[2] * ft} spin={frame * 20} />;
              })}
              {/* Jace buried in the pile: thumbs up */}
              {frame >= okay - 8 && (
                <g>
                  <Character
                    who="jace"
                    x={1640}
                    y={interpolate(frame, [okay - 8, okay + 4], [1330, 1215], {extrapolateRight: 'clamp'})}
                    pose="thumbsUp"
                    expr="happy"
                    scale={0.95}
                    rot={-8}
                  />
                  <Cart x={1600} y={ROAD + 20} scale={1.05} rot={-8} />
                </g>
              )}
              <Puff x={1600} y={ROAD - 120} t={(frame - crashF) / 26} size={1.4} />
            </>
          )}
          {riding && (
            <g>
              <Character who="jace" x={cartX - 10} y={ROAD - 90} pose="cheer" expr="laugh" scale={0.95} talking={false} />
              <Cart x={cartX} y={ROAD} spin={frame * 30} />
              {/* speed lines */}
              {frame > rideStart &&
                [0, 1, 2].map((i) => (
                  <line key={i} x1={cartX - 200 - i * 40} y1={ROAD - 160 + i * 50} x2={cartX - 380 - i * 60} y2={ROAD - 160 + i * 50} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
                ))}
            </g>
          )}
        </Stage>
      </Camera>
      {frame >= titleF && <MainTitle f={frame - titleF} />}
      <Sfx name="wind" at={0} dur={titleF + 10} loop volume={0.55} fadeIn={20} fadeOut={20} />
      <Sfx name="cart" at={rideStart} dur={crashF - rideStart} volume={0.7} fadeIn={20} />
      <Sfx name="crash" at={crashF} volume={0.9} />
      <Sfx name="whoosh" at={titleF - 4} volume={0.6} />
      <Sfx name="hit" at={titleF + 4} volume={0.8} />
    </>
  );
};

export const S1ColdOpen: React.FC = () => (
  <SceneShell scene={sceneById('s1')}>
    <Inner />
  </SceneShell>
);
