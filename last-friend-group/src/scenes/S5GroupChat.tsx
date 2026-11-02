import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUCH_SEAT, CouchFront, LivingRoom} from '../components/Backgrounds';
import {Camera, Stage} from '../components/Camera';
import {Character, Expr, Pose} from '../components/Character';
import {ChatMsg, GroupChat, TextPopup} from '../components/PhoneUI';
import {SceneShell} from '../components/SceneShell';
import {Sfx} from '../components/Sfx';
import {TITLE_FRAMES} from '../components/TitleCard';
import {useCues, useSceneData, useSceneFrame} from '../lib/scene';
import {sceneById, toFrames} from '../lib/timing';
import type {Who} from '../config/characters';

const SEAT_Y = COUCH_SEAT + 168;

const Inner: React.FC = () => {
  const frame = useSceneFrame();
  const c = useCues();
  const scene = useSceneData();
  const chats = scene.lines.filter((l) => l.kind === 'chat');
  const inChat = chats.filter((l) => l.id !== 'c09');
  const chatIn = c.start('c01') - 30;
  const chatOut = c.start('s5_01') - 18;
  const stareF = c.end('s5_01') + 4;
  const backF = c.start('c09') - 22;

  const msgs: ChatMsg[] = inChat.map((l) => ({id: l.id, who: l.speaker as Who, text: l.text, at: toFrames(l.at) - chatIn}));

  if (frame >= chatIn && frame < chatOut) {
    return (
      <>
        <GroupChat frame={frame - chatIn} msgs={msgs} title="LAST ONES STANDING" enter={0} />
        <Sfx name="whoosh" at={chatIn} volume={0.4} />
        {inChat.map((l) => (
          <Sfx key={l.id} name="ding" at={toFrames(l.at)} volume={0.45} />
        ))}
      </>
    );
  }

  const staring = frame >= stareF && frame < backF;
  const jaceTalking = frame >= c.start('s5_01') - 6 && frame < stareF;
  const other = (who: Who, x: number, lookToJace: number): React.ReactElement => {
    const pose: Pose = 'phone';
    const expr: Expr = staring ? 'neutral' : 'bored';
    return (
      <Character
        who={who}
        x={x}
        y={who === 'tank' ? SEAT_Y + 20 : SEAT_Y}
        sitting
        pose={pose}
        prop="phone"
        expr={expr}
        glow={!staring}
        look={staring ? lookToJace : 0}
        lookY={staring ? 0 : 1}
        facing={staring ? (lookToJace > 0 ? 1 : -1) : 1}
      />
    );
  };

  return (
    <>
      <Camera
        keys={
          frame < chatIn
            ? [
                {f: TITLE_FRAMES, x: 960, y: 560, z: 1},
                {f: chatIn, x: 960, y: 560, z: 1.12},
              ]
            : [
                {f: chatOut, x: 820, y: 560, z: 1.3},
                {f: stareF, x: 900, y: 560, z: 1.15},
                {f: backF, x: 960, y: 560, z: 1.05},
              ]
        }
      >
        <Stage>
          <LivingRoom frame={frame} />
          {other('marcus', 600, 1)}
          <Character
            who="jace"
            x={830}
            y={SEAT_Y}
            sitting
            pose={jaceTalking || staring ? 'lap' : 'phone'}
            prop={jaceTalking || staring ? 'none' : 'phone'}
            expr={frame >= c.start('c09') ? 'angry' : jaceTalking ? 'neutral' : 'bored'}
            glow={!(jaceTalking || staring)}
            lookY={jaceTalking || staring ? 0 : 1}
            look={staring ? 0.4 : 0}
          />
          {other('dev', 1070, -1)}
          {other('tank', 1330, -1)}
          <CouchFront />
        </Stage>
      </Camera>
      {frame >= c.start('c09') && (
        <AbsoluteFill style={{alignItems: 'flex-end', paddingTop: 70, paddingRight: 150}}>
          <TextPopup who="tank" text="no" frame={frame} at={c.start('c09')} />
        </AbsoluteFill>
      )}
      <Sfx name="ding" at={c.start('c09')} volume={0.6} />
    </>
  );
};

export const S5GroupChat: React.FC = () => (
  <SceneShell scene={sceneById('s5')} card={{a: '#06D6A0', b: '#05B386', tag: '#118AB2'}}>
    <Inner />
  </SceneShell>
);
