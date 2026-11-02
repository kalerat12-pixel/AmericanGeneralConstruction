import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CATWALK_Y, WaterTowerWorld} from '../components/Backgrounds';
import {Camera, Stage} from '../components/Camera';
import {Character, Expr, Pose} from '../components/Character';
import {PostScreen, SignalBars} from '../components/PhoneUI';
import {SceneShell} from '../components/SceneShell';
import {Sfx} from '../components/Sfx';
import {TITLE_FRAMES} from '../components/TitleCard';
import {tween} from '../lib/anim';
import {useCues, useSceneFrame} from '../lib/scene';
import {sceneById} from '../lib/timing';

const Inner: React.FC = () => {
  const frame = useSceneFrame();
  const c = useCues();
  const climbStart = c.start('s4_02') - 12;
  const topF = c.start('s4_03') - 18;
  const barF = c.start('s4_03') - 6;
  const postF = c.end('s4_04') + 8;
  const postEnd = c.start('s4_05') - 8;
  const wideF = c.start('s4_06') - 14;

  const climbing = frame >= climbStart && frame < topF;
  const devY = frame < climbStart ? 1000 : tween(frame, climbStart, topF, 1000, CATWALK_Y, (t) => t);
  const devX = frame < climbStart ? 820 : 960;

  let pose: Pose = 'phone1';
  let expr: Expr = 'neutral';
  let prop: 'phone' | 'none' = 'phone';
  let lookY = 0;
  if (frame < climbStart) {
    lookY = -1;
    expr = 'neutral';
  } else if (climbing) {
    pose = 'climb';
    prop = 'none';
    expr = 'shock';
    lookY = -1;
  } else if (frame < c.start('s4_03')) {
    pose = 'holdUp';
    expr = 'neutral';
    lookY = -1;
  } else if (frame < c.end('s4_03') + 4) {
    pose = 'holdUp';
    expr = 'happy';
  } else if (frame < wideF) {
    pose = 'phone';
    expr = frame > postEnd ? 'bored' : 'happy';
    lookY = 1;
  } else {
    pose = 'phone1';
    expr = 'bored';
    lookY = 1;
  }

  const bars = frame < barF ? (Math.floor(frame / 5) % 7 === 0 ? 1 : 0) : 1;
  const showBars = frame >= topF && frame < postF;

  return (
    <>
      <Camera
        keys={[
          {f: TITLE_FRAMES, x: 960, y: 620, z: 1},
          {f: c.start('s4_01'), x: 900, y: 640, z: 1.25},
          {f: climbStart, x: 960, y: 560, z: 1.1},
          {f: topF, x: 960, y: CATWALK_Y - 300, z: 1.1},
          {f: c.start('s4_03'), x: 960, y: CATWALK_Y - 280, z: 1.3},
          {f: postEnd, x: 960, y: CATWALK_Y - 270, z: 1.3},
          {f: postEnd + 1, x: 960, y: CATWALK_Y - 280, z: 1.6},
          {f: wideF, x: 960, y: CATWALK_Y - 280, z: 1.6},
          {f: wideF + 12, x: 1000, y: 220, z: 0.44},
        ]}
        shakes={[{f: c.start('s4_03'), dur: 10, amp: 10}]}
      >
        <Stage>
          <WaterTowerWorld frame={frame} />
          <Character
            who="dev"
            x={devX}
            y={devY}
            pose={pose}
            prop={prop}
            expr={expr}
            lookY={lookY}
            bounce={frame >= c.start('s4_03') && frame < c.end('s4_03') ? 14 : 0}
            glow={pose === 'phone'}
          />
          {showBars && <SignalBars x={1110} y={CATWALK_Y - 520} bars={bars} flash={frame >= barF} scale={0.9} />}
          {frame >= wideF - 20 && <Character who="tank" x={1380} y={1000} facing={-1} pose="cup" lookY={-1} expr="neutral" />}
        </Stage>
      </Camera>
      {frame >= postF && frame < postEnd && <PostScreen frame={frame - postF} />}
      <Sfx name="wind" at={TITLE_FRAMES} dur={c.sceneEnd - TITLE_FRAMES} loop volume={0.25} />
      <Sfx name="wind" at={topF} dur={c.sceneEnd - topF} loop volume={0.35} fadeIn={20} />
      <Sfx name="ding" at={barF} volume={0.6} />
      <Sfx name="pop" at={postF + 22} volume={0.6} />
      <Sfx name="cricket" at={postF + 40} volume={0.5} />
    </>
  );
};

export const S4Wifi: React.FC = () => (
  <SceneShell scene={sceneById('s4')} card={{a: '#3A86FF', b: '#2667CC', tag: '#FFBE0B'}}>
    <Inner />
  </SceneShell>
);
