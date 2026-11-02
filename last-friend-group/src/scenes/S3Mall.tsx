import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Arcade, FeastTable, FoodCourt, MATTRESS_TOP, MattressStore, MattressTower} from '../components/Backgrounds';
import {Camera, Stage} from '../components/Camera';
import {Character, Expr, Pose, PropKind} from '../components/Character';
import {Zzz} from '../components/Props';
import {SceneShell} from '../components/SceneShell';
import {Sfx} from '../components/Sfx';
import {TITLE_FRAMES} from '../components/TitleCard';
import {tween} from '../lib/anim';
import {useCues, useSceneFrame} from '../lib/scene';
import {sceneById} from '../lib/timing';

const Inner: React.FC = () => {
  const frame = useSceneFrame();
  const c = useCues();
  const shotB = c.start('s3_05') - 26;
  const shotC = c.start('s3_06') - 22;
  const pretzelF = c.end('s3_04') + 6;

  const during = (id: string) => frame >= c.start(id) && frame < c.end(id) + 8;

  if (frame < shotB) {
    // --- Food court ---
    const jacePose: Pose = during('s3_01') ? 'cheer' : during('s3_04') ? 'shrug' : 'idle';
    const jaceExpr: Expr = during('s3_01') ? 'happy' : during('s3_04') ? 'smug' : 'neutral';
    const devPose: Pose = during('s3_02') ? 'cheer' : 'food';
    const devProp: PropKind = during('s3_02') ? 'none' : 'pretzel';
    const devExpr: Expr = during('s3_02') ? 'happy' : 'chew';
    const marcusPose: Pose = frame >= pretzelF ? 'food' : during('s3_03') ? 'cross' : 'idle';
    const marcusExpr: Expr = frame >= pretzelF ? 'chew' : during('s3_03') ? 'bored' : during('s3_04') || frame > c.end('s3_04') ? 'shock' : 'neutral';
    return (
      <Camera
        keys={[
          {f: TITLE_FRAMES, x: 960, y: 540, z: 1},
          {f: c.start('s3_01'), x: 520, y: 520, z: 1.18},
          {f: c.start('s3_02'), x: 1180, y: 520, z: 1.2},
          {f: c.start('s3_03'), x: 860, y: 520, z: 1.2},
          {f: c.start('s3_04'), x: 560, y: 520, z: 1.25},
          {f: pretzelF, x: 860, y: 520, z: 1.4},
        ]}
      >
        <Stage>
          <FoodCourt />
          <Character who="jace" x={520} y={900} pose={jacePose} expr={jaceExpr} facing={1} look={1} />
          <Character who="marcus" x={860} y={1000} pose={marcusPose} prop={frame >= pretzelF ? 'pretzel' : 'none'} expr={marcusExpr} facing={-1} look={-1} />
          <Character who="dev" x={1180} y={1000} pose={devPose} prop={devProp} expr={devExpr} facing={-1} look={-0.5} />
          <FeastTable />
        </Stage>
      </Camera>
    );
  }
  if (frame < shotC) {
    // --- Mattress store: Tank asleep on a mattress tower ---
    return (
      <>
        <Camera
          keys={[
            {f: shotB, x: 960, y: 520, z: 1},
            {f: shotC, x: 960, y: 440, z: 1.2},
          ]}
        >
          <Stage>
            <MattressStore />
            <MattressTower />
            <Character who="tank" x={1150} y={MATTRESS_TOP - 70} rot={-90} expr="sleep" pose="idle" />
            <Zzz x={740} y={MATTRESS_TOP - 120} frame={frame} />
          </Stage>
        </Camera>
        <Sfx name="snore" at={shotB} dur={shotC - shotB} loop volume={0.5} />
      </>
    );
  }
  // --- Arcade standoff ---
  const devY = tween(frame, c.start('s3_09') - 10, c.start('s3_09') + 4, 1500, 1110);
  const shout = during('s3_10');
  const after = frame >= c.end('s3_10');
  return (
    <>
      <Camera
        keys={[
          {f: shotC, x: 960, y: 520, z: 1.05},
          {f: c.start('s3_07'), x: 960, y: 500, z: 1.2},
          {f: c.start('s3_09'), x: 960, y: 560, z: 1.12},
          {f: c.start('s3_10'), x: 960, y: 560, z: 1.3},
        ]}
        shakes={[{f: c.start('s3_10'), dur: 14, amp: 22}]}
      >
        <Stage>
          <Arcade frame={frame} />
          <Character who="marcus" x={760} y={1000} facing={1} pose={during('s3_06') ? 'hips' : shout ? 'point' : 'cross'} expr="angry" look={shout || after ? 0.5 : 1} lookY={shout || after ? 1 : 0} />
          <Character who="jace" x={1170} y={1000} facing={-1} pose={during('s3_07') ? 'point' : shout ? 'point' : 'hips'} expr="angry" look={shout || after ? -0.5 : -1} lookY={shout || after ? 1 : 0} />
          {frame >= c.start('s3_09') - 10 && (
            <Character who="dev" x={965} y={devY} facing={1} pose={after ? 'idle' : 'shrug'} expr={after || shout ? 'shock' : 'neutral'} scale={1.05} lookY={-0.6} />
          )}
        </Stage>
      </Camera>
      {after && <AbsoluteFill style={{background: '#fff', opacity: Math.max(0, 0.5 - (frame - c.end('s3_10')) * 0.1)}} />}
    </>
  );
};

export const S3Mall: React.FC = () => (
  <SceneShell scene={sceneById('s3')} card={{a: '#9B5DE5', b: '#8338EC', tag: '#F15BB5'}}>
    <Inner />
  </SceneShell>
);
