import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Suburb} from '../components/Backgrounds';
import {Camera, Stage} from '../components/Camera';
import {Character} from '../components/Character';
import {Bucket, Cart, Radio} from '../components/Props';
import {SceneShell} from '../components/SceneShell';
import {Sfx} from '../components/Sfx';
import {TITLE_FRAMES} from '../components/TitleCard';
import {pop} from '../lib/anim';
import {useCues, useSceneFrame} from '../lib/scene';
import {sceneById} from '../lib/timing';
import {TITLE_FONT} from '../fonts';

const GROUND = 960;

const Inner: React.FC = () => {
  const frame = useSceneFrame();
  const c = useCues();
  const jaceGo = c.end('s2_03') + 4;
  const crunch = c.start('s2_05') - 16;
  const leave = c.end('s2_07') + 6;
  const stampF = c.end('s2_08') + 10;

  const jaceX = interpolate(frame, [jaceGo, jaceGo + 28], [1640, 2500], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const leaveT = (x: number, delay: number) =>
    interpolate(frame, [leave + delay, leave + delay + 70], [x, x + 1200], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const devX = leaveT(1080, 0);
  const tankX = leaveT(1330, 8);
  const devWalking = frame > leave && devX < 2300;
  const tankWalking = frame > leave + 8 && tankX < 2300;
  const stamp = pop(frame, stampF, 9, 260);

  const marcusPose = frame < c.start('s2_02') ? 'clip' : frame < c.end('s2_06') ? 'clipPoint' : 'clip';
  const marcusExpr = frame > c.end('s2_07') ? 'sad' : frame > c.end('s2_03') && frame < c.start('s2_04') ? 'bored' : 'neutral';

  return (
    <>
      <Camera
        keys={[
          {f: TITLE_FRAMES, x: 960, y: 560, z: 1.0},
          {f: c.start('s2_02'), x: 820, y: 560, z: 1.12},
          {f: c.start('s2_03'), x: 1300, y: 560, z: 1.12},
          {f: c.start('s2_04'), x: 900, y: 560, z: 1.08},
          {f: c.start('s2_05'), x: 1250, y: 520, z: 1.25},
          {f: c.start('s2_06'), x: 860, y: 560, z: 1.1},
          {f: c.start('s2_07'), x: 1080, y: 520, z: 1.25},
          {f: leave, x: 960, y: 560, z: 1.0},
          {f: c.start('s2_08') + 10, x: 600, y: 560, z: 1.45},
        ]}
      >
        <Stage>
          <Suburb />
          <Radio x={760} y={GROUND - 10} scale={0.8} />
          <Bucket x={560} y={GROUND + 6} />
          <Character who="marcus" x={560} y={GROUND - 88} facing={1} pose={marcusPose} prop="clipboard" expr={marcusExpr} look={frame > leave ? 1 : 0.6} />
          <Character
            who="dev"
            x={devX}
            y={GROUND}
            facing={devWalking ? 1 : -1}
            pose="phone"
            prop="phone"
            expr="bored"
            lookY={1}
            walking={devWalking}
            glow
          />
          <Character
            who="tank"
            x={tankX}
            y={GROUND}
            facing={tankWalking ? 1 : -1}
            pose="hold"
            prop="chips"
            expr={frame > crunch && frame < c.start('s2_05') + 50 ? 'chew' : 'neutral'}
            walking={tankWalking}
            look={-0.6}
          />
          {jaceX < 2400 && (
            <g>
              {frame < c.start('s2_03') ? (
                <>
                  <Cart x={1780} y={GROUND} scale={0.9} />
                  <Character who="jace" x={1580} y={GROUND} facing={-1} pose="hips" expr="bored" look={-1} />
                </>
              ) : (
                <>
                  <Character who="jace" x={jaceX - 20} y={GROUND - 80} facing={1} pose="wave" expr="happy" scale={0.9} />
                  <Cart x={jaceX} y={GROUND} scale={0.9} spin={frame * 30} />
                </>
              )}
            </g>
          )}
        </Stage>
      </Camera>
      {frame >= stampF && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div
            style={{
              transform: `scale(${3 - 2 * stamp}) rotate(-10deg)`,
              opacity: Math.min(1, stamp * 1.5),
              border: '14px solid #D62828',
              borderRadius: 24,
              padding: '24px 48px 6px',
              fontFamily: TITLE_FONT,
              fontSize: 120,
              color: '#D62828',
              background: 'rgba(255,255,255,0.85)',
              marginTop: -180,
            }}
          >
            RULES FOLLOWED: 0
          </div>
        </AbsoluteFill>
      )}
      <Sfx name="static" at={TITLE_FRAMES} dur={c.sceneEnd - TITLE_FRAMES} loop volume={0.06} />
      <Sfx name="wind" at={TITLE_FRAMES} dur={c.sceneEnd - TITLE_FRAMES} loop volume={0.15} />
      <Sfx name="cart" at={jaceGo} dur={60} volume={0.5} />
      <Sfx name="crunch" at={crunch} volume={0.9} />
      <Sfx name="crunch" at={crunch + 22} volume={0.7} />
      <Sfx name="hit" at={stampF} volume={0.8} />
    </>
  );
};

export const S2Rules: React.FC = () => (
  <SceneShell scene={sceneById('s2')}>
    <Inner />
  </SceneShell>
);
