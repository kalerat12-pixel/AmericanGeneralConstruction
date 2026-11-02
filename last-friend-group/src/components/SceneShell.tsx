import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {SceneProvider} from '../lib/scene';
import {SceneData, toFrames, voiceFor} from '../lib/timing';
import {Captions} from './Captions';
import {Sfx} from './Sfx';
import {TitleCard} from './TitleCard';

/**
 * Wraps a scene: provides its dialogue data, plays every voice line at its
 * timing slot, burns in captions and shows the title card.
 */
export const SceneShell: React.FC<{
  scene: SceneData;
  children: React.ReactNode;
  card?: {a?: string; b?: string; tag?: string};
  captions?: boolean;
}> = ({scene, children, card, captions = true}) => (
  <SceneProvider scene={scene}>
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>{children}</AbsoluteFill>
    {scene.lines
      .filter((l) => !l.kind && voiceFor(l.id))
      .map((l) => (
        <Sequence key={l.id} from={toFrames(l.at)} layout="none">
          <Audio src={staticFile(voiceFor(l.id).file)} volume={l.speaker === 'radio' ? 0.9 : 1} />
        </Sequence>
      ))}
    {captions && <Captions />}
    {scene.title && (
      <>
        <TitleCard title={scene.title} subtitle={scene.subtitle} {...card} />
        <Sfx name="whoosh" at={0} volume={0.5} />
        <Sfx name="hit" at={3} volume={0.55} />
      </>
    )}
  </SceneProvider>
);
