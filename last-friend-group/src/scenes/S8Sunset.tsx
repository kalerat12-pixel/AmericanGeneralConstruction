import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {LEDGE_Y, LedgeFront, Rooftop} from '../components/Backgrounds';
import {Camera, Stage} from '../components/Camera';
import {Character, CharacterProps, Expr, Pose, PropKind} from '../components/Character';
import {Radio} from '../components/Props';
import {SceneShell} from '../components/SceneShell';
import {useCues, useSceneFrame} from '../lib/scene';
import {sceneById} from '../lib/timing';
import {SEATS, SIT_Y, arrival, doorOpen} from './rooftop';

const Inner: React.FC = () => {
  const frame = useSceneFrame();
  const c = useCues();
  const during = (id: string) => frame >= c.start(id) && frame < c.end(id) + 6;

  const devDoor = c.start('s8_01') - 52;
  const dev = arrival(frame, {door: devDoor, stopX: 1160, stopF: c.start('s8_01') - 4, walkToSeat: c.end('s8_02') + 8, seatX: SEATS.dev, sitF: c.end('s8_02') + 44});
  const jaceDoor = c.start('s8_03') - 24;
  const jace = arrival(frame, {door: jaceDoor, stopX: 1300, stopF: c.end('s8_03'), walkToSeat: c.end('s8_04') + 6, seatX: SEATS.jace, sitF: c.end('s8_04') + 30});
  const tankDoor = c.end('s8_04') + 45;
  const tank = arrival(frame, {door: tankDoor, stopX: SEATS.tank, stopF: tankDoor + 62, walkToSeat: tankDoor + 62, seatX: SEATS.tank, sitF: tankDoor + 72});
  const boxOpenF = tankDoor + 88;
  const rollF = {marcus: tankDoor + 104, dev: tankDoor + 112, jace: tankDoor + 120};
  const laughS = c.start('s8_laugh');
  const laughE = c.start('s8_06') - 4;
  const laughing = frame >= laughS && frame < laughE;
  const tankLine = frame >= c.start('s8_05') - 10;

  const sunY = interpolate(frame, [0, c.sceneEnd], [430, 690]);
  const door = doorOpen(frame, [devDoor, jaceDoor, tankDoor]);

  const seatedLook = (who: 'marcus' | 'dev' | 'jace'): number => {
    if (tankLine && frame < laughS) return 1;
    if (during('s8_06')) return who === 'marcus' ? 1 : -1;
    if (during('s8_07')) return who === 'jace' ? -1 : 1;
    return 0;
  };
  const exprFor = (who: 'marcus' | 'dev' | 'jace' | 'tank', base: Expr): Expr => {
    if (laughing) return 'laugh';
    if (frame >= laughE) return 'happy';
    return base;
  };
  const withRoll = (who: 'marcus' | 'dev' | 'jace'): {pose: Pose; prop: PropKind} =>
    frame >= rollF[who] ? {pose: 'food', prop: 'roll'} : {pose: 'lap', prop: 'none'};

  const marcusProps: CharacterProps = {
    who: 'marcus',
    x: SEATS.marcus,
    y: SIT_Y,
    sitting: true,
    ...withRoll('marcus'),
    expr: exprFor('marcus', frame < c.start('s8_01') ? 'sad' : 'neutral'),
    facing: 1,
    look: frame < c.start('s8_01') - 10 ? -0.3 : seatedLook('marcus') || 1,
    bounce: laughing ? 8 : 0,
  };

  const walker = (who: 'dev' | 'jace' | 'tank', a: ReturnType<typeof arrival>, base: Expr): CharacterProps => {
    const seated = a.sitting;
    const roll = who !== 'tank' ? withRoll(who) : {pose: 'hold' as Pose, prop: (frame >= boxOpenF ? 'pizzaboxOpen' : 'pizzabox') as PropKind};
    return {
      who,
      x: a.x,
      y: a.y,
      walking: a.walking,
      sitting: seated,
      facing: seated ? (who === 'tank' ? -1 : 1) : -1,
      pose: seated ? roll.pose : who === 'tank' ? 'hold' : 'idle',
      prop: seated ? roll.prop : who === 'tank' ? 'pizzabox' : 'none',
      expr: exprFor(who, base),
      look: seated && who !== 'tank' ? seatedLook(who) : seated ? -1 : -1,
      bounce: laughing ? 8 : 0,
    };
  };

  const chars = [
    marcusProps,
    dev.visible ? walker('dev', dev, 'neutral') : null,
    jace.visible ? walker('jace', jace, during('s8_03') ? 'smug' : 'neutral') : null,
    tank.visible ? walker('tank', tank, 'neutral') : null,
  ].filter(Boolean) as CharacterProps[];

  return (
    <>
      <Camera
        keys={[
          {f: 0, x: 900, y: 560, z: 1.12},
          {f: c.start('s8_01'), x: 900, y: 560, z: 1.0},
          {f: tankDoor, x: 960, y: 560, z: 1.0},
          {f: c.start('s8_05'), x: 980, y: 640, z: 1.22},
          {f: laughE, x: 980, y: 640, z: 1.15},
          {f: c.sceneEnd, x: 960, y: 520, z: 0.98},
        ]}
      >
        <Stage>
          <Rooftop frame={frame} mode="sunset" sunY={sunY} door={door} />
          {chars.filter((p) => !p.sitting).map((p) => (
            <Character key={p.who} {...p} />
          ))}
          <LedgeFront mode="sunset" />
          <Radio x={450} y={LEDGE_Y} scale={0.75} />
          {chars.filter((p) => p.sitting).map((p) => (
            <Character key={p.who} {...p} />
          ))}
        </Stage>
      </Camera>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,140,66,0.0) 0%, rgba(255,120,60,0.22) 100%)', mixBlendMode: 'soft-light'}} />
    </>
  );
};

export const S8Sunset: React.FC = () => (
  <SceneShell scene={sceneById('s8')}>
    <Inner />
  </SceneShell>
);
