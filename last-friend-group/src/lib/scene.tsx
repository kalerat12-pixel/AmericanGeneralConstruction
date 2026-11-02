import React, {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';
import type {SpeakerId} from '../config/characters';
import {Line, SceneData, speakersOf, speakingWindow, toFrames} from './timing';

const SceneCtx = createContext<SceneData | null>(null);
const FrameCtx = createContext<number | null>(null);

export const SceneProvider: React.FC<{scene: SceneData; children: React.ReactNode}> = ({scene, children}) => (
  <SceneCtx.Provider value={scene}>{children}</SceneCtx.Provider>
);

/** Override the frame for everything inside (used for split-screen replays). */
export const FrameOverride: React.FC<{frame: number; children: React.ReactNode}> = ({frame, children}) => (
  <FrameCtx.Provider value={frame}>{children}</FrameCtx.Provider>
);

export const useSceneData = () => {
  const s = useContext(SceneCtx);
  if (!s) throw new Error('useSceneData outside SceneProvider');
  return s;
};

/** Frame relative to the current scene (respects FrameOverride). */
export const useSceneFrame = () => {
  const real = useCurrentFrame();
  const o = useContext(FrameCtx);
  return o ?? real;
};

/** Cue helpers: scene-relative frames for the start/end of any line id. */
export const useCues = () => {
  const scene = useSceneData();
  const get = (id: string): Line => {
    const l = scene.lines.find((x) => x.id === id);
    if (!l) throw new Error(`No line ${id} in scene ${scene.id}`);
    return l;
  };
  return {
    start: (id: string) => toFrames(get(id).at),
    end: (id: string) => speakingWindow(get(id)).end,
    sceneEnd: toFrames(scene.duration),
  };
};

/** True while one of this speaker's voiced lines is playing. */
export const useSpeaking = (who: SpeakerId) => {
  const scene = useContext(SceneCtx);
  const frame = useSceneFrame();
  if (!scene) return false;
  return scene.lines.some((l) => {
    if (l.kind) return false;
    if (!speakersOf(l).includes(who)) return false;
    const w = speakingWindow(l);
    return frame >= w.start && frame < w.end;
  });
};
