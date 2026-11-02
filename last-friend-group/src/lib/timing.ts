import dialogue from '../config/dialogue.json';
import manifestJson from '../config/voice-manifest.json';
import type {SpeakerId} from '../config/characters';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export interface Line {
  id: string;
  speaker: SpeakerId | SpeakerId[];
  text: string;
  /** Seconds from the start of the scene when the line begins. */
  at: number;
  /** Minimum seconds the caption stays up (the slot length). */
  hold: number;
  /** "chat" = text message shown on a phone; "action" = caption only, no voice. */
  kind?: 'chat' | 'action';
  tts?: string;
}

export interface SceneData {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  duration: number;
  lines: Line[];
}

type Manifest = Record<string, {file: string; duration: number}>;
const manifest = manifestJson as Manifest;

export const SCENES = (dialogue as unknown as {scenes: SceneData[]}).scenes;

export const toFrames = (sec: number) => Math.round(sec * FPS);

export const voiceFor = (id: string) => manifest[id];

export const speakersOf = (line: Line): SpeakerId[] =>
  Array.isArray(line.speaker) ? line.speaker : [line.speaker];

/** Frames (relative to scene) when the caption for a line is on screen. */
export const captionWindow = (line: Line) => {
  const v = voiceFor(line.id);
  const len = Math.max(line.hold, v ? v.duration + 0.25 : 0);
  return {start: toFrames(line.at), end: toFrames(line.at + len)};
};

/** Frames (relative to scene) when a character's mouth should move. */
export const speakingWindow = (line: Line) => {
  const v = voiceFor(line.id);
  return {start: toFrames(line.at), end: toFrames(line.at + (v ? v.duration : line.hold))};
};

export const sceneById = (id: string) => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};

export const SCENE_STARTS: Record<string, number> = {};
let acc = 0;
for (const s of SCENES) {
  SCENE_STARTS[s.id] = acc;
  acc += toFrames(s.duration);
}
export const TOTAL_FRAMES = acc;
