import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Kitchen} from '../components/Backgrounds';
import {Camera, CamKey, Stage} from '../components/Camera';
import {Character, Expr, Pose, PropKind} from '../components/Character';
import {PizzaBox} from '../components/Props';
import {SceneShell} from '../components/SceneShell';
import {Sfx} from '../components/Sfx';
import {Outlined, TITLE_FRAMES} from '../components/TitleCard';
import {SPEAKERS} from '../config/characters';
import {pop} from '../lib/anim';
import {useCues, useSceneFrame} from '../lib/scene';
import {sceneById} from '../lib/timing';

const GROUND = 1000;
const X = {jace: 400, marcus: 790, dev: 1180, tank: 1530};

const Inner: React.FC = () => {
  const frame = useSceneFrame();
  const c = useCues();
  const during = (id: string) => frame >= c.start(id) && frame < c.end(id) + 6;
  const exitF = c.end('s6_11') + 8;
  const slams = [exitF + 16, exitF + 24, exitF + 32, exitF + 40];
  const splitF = slams[3] + 6;

  // Punch-in on whoever is talking.
  const speakerOf: Record<string, keyof typeof X> = {
    s6_01: 'marcus', s6_02: 'jace', s6_03: 'dev', s6_04: 'tank', s6_05: 'marcus', s6_06: 'jace',
    s6_07: 'marcus', s6_08: 'dev', s6_09: 'jace', s6_10: 'dev', s6_11: 'jace',
  };
  const keys: CamKey[] = [{f: TITLE_FRAMES, x: 960, y: 560, z: 1}];
  for (const [id, who] of Object.entries(speakerOf)) {
    const s = c.start(id);
    keys.push({f: s - 6, z: keys[keys.length - 1].z});
    keys.push({f: s, x: X[who], y: 560, z: id === 's6_05' || id === 's6_07' ? 1.45 : 1.3});
  }
  keys.push({f: exitF, x: 960, y: 560, z: 1});

  // Poses per beat
  const marcus = (): {pose: Pose; expr: Expr; prop: PropKind; facing: 1 | -1} => {
    if (during('s6_07')) return {pose: 'point', expr: 'angry', prop: 'none', facing: -1};
    if (frame >= c.start('s6_07')) return {pose: 'hips', expr: 'angry', prop: 'none', facing: 1};
    if (during('s6_01') || during('s6_05')) return {pose: 'holdUp', expr: 'angry', prop: 'pizzabox', facing: 1};
    return {pose: 'hold', expr: 'angry', prop: 'pizzabox', facing: frame > c.start('s6_03') ? 1 : -1};
  };
  const jace = (): {pose: Pose; expr: Expr} => {
    if (during('s6_02')) return {pose: 'shrug', expr: 'bored'};
    if (during('s6_06')) return {pose: 'point', expr: 'angry'};
    if (during('s6_09')) return {pose: 'hips', expr: 'angry'};
    if (during('s6_11')) return {pose: 'point', expr: 'angry'};
    if (frame > c.end('s6_10')) return {pose: 'cross', expr: 'sad'};
    return {pose: 'cross', expr: frame > c.start('s6_05') ? 'angry' : 'neutral'};
  };
  const dev = (): {pose: Pose; expr: Expr; facing: 1 | -1} => {
    if (during('s6_03')) return {pose: 'point', expr: 'smug', facing: 1};
    if (during('s6_08')) return {pose: 'shrug', expr: 'smug', facing: -1};
    if (during('s6_10')) return {pose: 'shrug', expr: 'shock', facing: -1};
    return {pose: 'phone1', expr: 'neutral', facing: -1};
  };
  const m = marcus();
  const j = jace();
  const d = dev();

  const leaving = frame >= exitF;
  const walk = (x: number, dir: number, delay: number) =>
    interpolate(frame, [exitF + delay, exitF + delay + 40], [x, x + dir * 1300], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const split = pop(frame, splitF, 12, 180);
  const colors = [SPEAKERS.marcus.color, SPEAKERS.dev.color, SPEAKERS.tank.color, SPEAKERS.jace.color];

  return (
    <>
      <Camera keys={keys} shakes={[{f: c.start('s6_05'), dur: 10, amp: 12}, {f: c.start('s6_07'), dur: 10, amp: 12}, ...slams.map((f) => ({f, dur: 8, amp: 24}))]}>
        <Stage>
          <Kitchen frame={frame} />
          {frame >= c.start('s6_07') && <PizzaBox x={880} y={GROUND - 10} rot={-8} />}
          <Character who="jace" x={leaving ? walk(X.jace, -1, 0) : X.jace} y={GROUND} facing={leaving ? -1 : 1} pose={leaving ? 'idle' : j.pose} expr={j.expr} walking={leaving} look={1} />
          <Character
            who="marcus"
            x={leaving ? walk(X.marcus, -1, 6) : X.marcus}
            y={GROUND}
            facing={leaving ? -1 : m.facing}
            pose={leaving ? 'idle' : m.pose}
            prop={leaving ? 'none' : m.prop}
            expr={m.expr}
            walking={leaving}
          />
          <Character who="dev" x={leaving ? walk(X.dev, 1, 3) : X.dev} y={GROUND} facing={leaving ? 1 : d.facing} pose={leaving ? 'idle' : d.pose} prop={d.pose === 'phone1' ? 'phone' : 'none'} expr={d.expr} walking={leaving} />
          <Character
            who="tank"
            x={leaving ? walk(X.tank, 1, 10) : X.tank}
            y={GROUND}
            facing={leaving ? 1 : -1}
            pose="idle"
            expr={during('s6_04') ? 'bored' : frame > c.start('s6_03') ? 'bored' : 'neutral'}
            walking={leaving}
            look={-1}
          />
        </Stage>
      </Camera>
      {frame >= splitF && (
        <AbsoluteFill>
          {colors.map((col, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: (i % 2) * 960,
                top: Math.floor(i / 2) * 540,
                width: 960,
                height: 540,
                background: col,
                border: '8px solid #121016',
                transform: `translate(${(i % 2 ? 1 : -1) * (1 - split) * 1000}px, 0)`,
              }}
            />
          ))}
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div style={{transform: `scale(${2.5 - 1.5 * split}) rotate(-4deg)`, opacity: split}}>
              <Outlined text="SPLIT UP." size={230} color="#fff" stroke={34} />
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      {slams.map((f, i) => (
        <Sfx key={i} name="slam" at={f} volume={0.9} />
      ))}
      <Sfx name="hit" at={splitF} volume={0.7} />
    </>
  );
};

export const S6Fight: React.FC = () => (
  <SceneShell scene={sceneById('s6')} card={{a: '#EF476F', b: '#D62F57', tag: '#121016'}}>
    <Inner />
  </SceneShell>
);
