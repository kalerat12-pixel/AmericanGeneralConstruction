import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {SPEAKERS} from '../config/characters';
import {TITLE_FONT} from '../fonts';
import {pop} from '../lib/anim';
import {useSceneData, useSceneFrame} from '../lib/scene';
import {captionWindow, speakersOf, speakingWindow} from '../lib/timing';

/** Big burned-in captions for every spoken line, colored by speaker. */
export const Captions: React.FC = () => {
  const scene = useSceneData();
  const frame = useSceneFrame();
  const active = scene.lines
    .filter((l) => l.kind !== 'chat')
    .filter((l) => {
      const w = captionWindow(l);
      return frame >= w.start && frame < w.end;
    })
    .sort((a, b) => b.at - a.at)[0];
  if (!active) return null;

  const w = captionWindow(active);
  const sw = speakingWindow(active);
  const speakers = speakersOf(active);
  const color = speakers.length > 1 ? '#FFFFFF' : SPEAKERS[speakers[0]].color;
  const name = speakers.map((s) => SPEAKERS[s].name).join(' & ');
  const isAction = active.kind === 'action';
  const s = pop(frame, w.start, 12, 220);
  const out = interpolate(frame, [w.end - 4, w.end], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const words = active.text.toUpperCase().split(' ');
  // Approximate which word is being spoken right now (by character count).
  const progress = (frame - sw.start) / Math.max(1, sw.end - sw.start);
  const total = words.reduce((n, x) => n + x.length + 1, 0);
  let acc = 0;
  let current = -1;
  if (progress >= 0 && progress < 1 && !isAction) {
    for (let i = 0; i < words.length; i++) {
      acc += words[i].length + 1;
      if (acc / total >= progress) {
        current = i;
        break;
      }
    }
  }

  const fontSize = isAction ? 56 : active.text.length > 48 ? 68 : 80;
  const renderWords = (stroke: boolean) =>
    words.map((wd, i) => (
      <span
        key={i}
        style={{
          display: 'inline-block',
          margin: '0 0.24em',
          transform: i === current ? 'scale(1.07) translateY(-3px)' : undefined,
          color: stroke ? 'transparent' : isAction ? '#fff' : color,
          WebkitTextStroke: stroke ? `${Math.round(fontSize * 0.2)}px #121016` : undefined,
        }}
      >
        {wd}
      </span>
    ));

  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 64, pointerEvents: 'none'}}>
      <div
        style={{
          transform: `scale(${0.6 + 0.4 * s})`,
          opacity: out,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 1560,
          filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.35))',
        }}
      >
        {!isAction && (
          <div
            style={{
              fontFamily: TITLE_FONT,
              fontSize: 34,
              letterSpacing: 2,
              color: '#121016',
              background: color,
              border: '5px solid #121016',
              borderRadius: 14,
              padding: '6px 18px 0',
              marginBottom: 10,
              transform: 'rotate(-2deg)',
            }}
          >
            {name}
          </div>
        )}
        <div style={{position: 'relative', fontFamily: TITLE_FONT, fontSize, lineHeight: 1.08, textAlign: 'center', letterSpacing: 1}}>
          <div>{renderWords(true)}</div>
          <div style={{position: 'absolute', inset: 0}}>{renderWords(false)}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
