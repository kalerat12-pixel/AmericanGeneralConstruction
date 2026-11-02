import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {LEDGE_Y, LedgeFront, Rooftop} from '../components/Backgrounds';
import {Camera, Stage} from '../components/Camera';
import {Character, Expr, Pose} from '../components/Character';
import {Radio} from '../components/Props';
import {SceneShell} from '../components/SceneShell';
import {Sfx} from '../components/Sfx';
import {Outlined} from '../components/TitleCard';
import {pop, rand} from '../lib/anim';
import {useCues, useSceneFrame} from '../lib/scene';
import {sceneById} from '../lib/timing';
import {SEATS, SIT_Y} from './rooftop';

const RADIO_X = 450;

const Inner: React.FC = () => {
  const frame = useSceneFrame();
  const c = useCues();
  const radioOn = frame >= c.start('s9_01') && frame < c.end('s9_01');
  const wake = c.start('s9_01') + 22;
  const glance = c.end('s9_01') + 4;
  const cutF = c.end('s9_04') + 3;
  const during = (id: string) => frame >= c.start(id) && frame < c.end(id) + 6;

  if (frame >= cutF) {
    const t = frame - cutF;
    const s = pop(frame, cutF + 12, 10, 160);
    const glitch = t > 12 && rand(Math.floor(t / 3)) > 0.8 ? (rand(t) - 0.5) * 30 : 0;
    return (
      <AbsoluteFill style={{background: '#000', justifyContent: 'center', alignItems: 'center'}}>
        {t > 12 && (
          <div style={{position: 'relative', transform: `scale(${0.6 + 0.4 * s})`, opacity: s}}>
            <div style={{position: 'absolute', left: glitch, top: 0, opacity: 0.6}}>
              <Outlined text="EPISODE 2?" size={200} color="#00F5D4" stroke={0} />
            </div>
            <div style={{position: 'absolute', left: -glitch, top: 0, opacity: 0.6}}>
              <Outlined text="EPISODE 2?" size={200} color="#F15BB5" stroke={0} />
            </div>
            <Outlined text="EPISODE 2?" size={200} color="#fff" stroke={30} />
          </div>
        )}
        <Sfx name="hit" at={cutF + 12} volume={0.9} />
      </AbsoluteFill>
    );
  }

  const awake = frame >= wake;
  const jump = awake ? -Math.max(0, Math.sin(Math.min(1, (frame - wake) / 10) * Math.PI)) * 50 : 0;

  const state = (who: 'marcus' | 'dev' | 'jace' | 'tank'): {pose: Pose; expr: Expr; look: number; facing: 1 | -1; rot: number} => {
    if (!awake) return {pose: 'lap', expr: 'sleep', look: 0, facing: 1, rot: {marcus: -4, dev: 5, jace: -6, tank: 4}[who]};
    if (frame < glance) return {pose: 'lap', expr: 'shock', look: -1, facing: -1, rot: 0};
    if (who === 'dev' && during('s9_02')) return {pose: 'shrug', expr: 'shock', look: -1, facing: -1, rot: 0};
    if (who === 'jace' && frame >= c.start('s9_03')) return {pose: 'cheer', expr: 'happy', look: -1, facing: -1, rot: 0};
    if (who === 'marcus' && frame >= c.start('s9_04')) return {pose: 'holdUp', expr: 'angry', look: 1, facing: 1, rot: 0};
    // Everyone looks at each other.
    const look = {marcus: 1, dev: 1, jace: -1, tank: -1}[who];
    return {pose: 'lap', expr: 'shock', look, facing: look > 0 ? 1 : -1, rot: 0};
  };

  return (
    <>
      <Camera
        keys={[
          {f: 0, x: 960, y: 560, z: 1.0},
          {f: c.start('s9_01'), x: 700, y: 640, z: 1.2},
          {f: glance, x: 880, y: 620, z: 1.1},
          {f: c.start('s9_04'), x: 760, y: 640, z: 1.35},
        ]}
        shakes={[{f: wake, dur: 8, amp: 10}]}
      >
        <Stage>
          <Rooftop frame={frame} mode="night" />
          <LedgeFront mode="night" />
          <Radio x={RADIO_X} y={LEDGE_Y} scale={0.75} glow={radioOn ? 0.5 + 0.5 * Math.sin(frame * 0.8) : 0} rot={radioOn ? Math.sin(frame * 1.7) * 2 : 0} />
          {radioOn &&
            [0, 1, 2].map((i) => {
              const t = ((frame + i * 8) % 24) / 24;
              return (
                <path
                  key={i}
                  d={`M ${RADIO_X + 80 + t * 60} ${LEDGE_Y - 120 - t * 40} q 30 40 0 80`}
                  stroke="#FFB703"
                  strokeWidth={6}
                  fill="none"
                  opacity={1 - t}
                  transform={`translate(${-40} 0)`}
                />
              );
            })}
          {(['marcus', 'dev', 'jace', 'tank'] as const).map((who) => {
            const s = state(who);
            return (
              <Character
                key={who}
                who={who}
                x={SEATS[who]}
                y={SIT_Y + (who === 'tank' ? 10 : 0) + jump}
                sitting
                pose={s.pose}
                expr={s.expr}
                look={s.look}
                facing={s.facing}
                rot={s.rot}
              />
            );
          })}
        </Stage>
      </Camera>
      <AbsoluteFill style={{background: '#1B2A6B', mixBlendMode: 'multiply', opacity: 0.28}} />
      {radioOn && <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 70%, rgba(255,183,3,0.18), rgba(0,0,0,0) 40%)'}} />}
      <Sfx name="static" at={0} dur={cutF} loop volume={0.12} />
      <Sfx name="static" at={c.start('s9_01') - 6} dur={c.end('s9_01') - c.start('s9_01') + 12} loop volume={0.25} />
      <Sfx name="cricket" at={10} volume={0.3} />
      <Sfx name="cricket" at={60} volume={0.25} />
    </>
  );
};

export const S9Tag: React.FC = () => (
  <SceneShell scene={sceneById('s9')}>
    <Inner />
  </SceneShell>
);
