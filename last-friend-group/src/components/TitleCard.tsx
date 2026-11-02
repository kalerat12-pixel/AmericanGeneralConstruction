import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {TITLE_FONT} from '../fonts';
import {pop} from '../lib/anim';
import {useSceneFrame} from '../lib/scene';

export const TITLE_FRAMES = 51;

/** Radial comic "burst" background. */
export const Burst: React.FC<{a: string; b: string; spin: number}> = ({a, b, spin}) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
    <rect width={1920} height={1080} fill={a} />
    <g transform={`translate(960 540) rotate(${spin})`}>
      {Array.from({length: 18}).map((_, i) => {
        const a0 = (i / 18) * Math.PI * 2;
        const a1 = a0 + Math.PI / 18;
        const R = 1600;
        return <path key={i} d={`M 0 0 L ${Math.cos(a0) * R} ${Math.sin(a0) * R} L ${Math.cos(a1) * R} ${Math.sin(a1) * R} Z`} fill={b} />;
      })}
    </g>
  </svg>
);

export const Outlined: React.FC<{text: string; size: number; color: string; stroke?: number; style?: React.CSSProperties}> = ({
  text,
  size,
  color,
  stroke,
  style,
}) => (
  <div style={{position: 'relative', fontFamily: TITLE_FONT, fontSize: size, lineHeight: 1, textAlign: 'center', ...style}}>
    <div style={{color: 'transparent', WebkitTextStroke: `${stroke ?? Math.round(size * 0.14)}px #121016`}}>{text}</div>
    <div style={{position: 'absolute', inset: 0, color}}>{text}</div>
  </div>
);

/** Punchy "DAY 3 / THE MALL" card that slams in and slides away. */
export const TitleCard: React.FC<{title: string; subtitle: string; a?: string; b?: string; tag?: string}> = ({
  title,
  subtitle,
  a = '#FFD60A',
  b = '#FFC300',
  tag = '#E63946',
}) => {
  const frame = useSceneFrame();
  if (frame >= TITLE_FRAMES) return null;
  const s = pop(frame, 2, 9, 200);
  const s2 = pop(frame, 9, 10, 180);
  const exit = interpolate(frame, [TITLE_FRAMES - 8, TITLE_FRAMES], [0, -2100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const enter = interpolate(frame, [0, 5], [2100, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{transform: `translateX(${enter + exit}px)`}}>
      <Burst a={a} b={b} spin={frame * 0.6} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <div style={{transform: `scale(${2.6 - 1.6 * s}) rotate(${-4 * s}deg)`, opacity: Math.min(1, s * 2)}}>
          <Outlined text={title} size={260} color="#fff" stroke={34} />
        </div>
        {subtitle && (
          <div
            style={{
              marginTop: 20,
              transform: `translateY(${(1 - s2) * 200}px) rotate(2deg)`,
              background: tag,
              border: '8px solid #121016',
              borderRadius: 20,
              padding: '16px 40px 4px',
              boxShadow: '0 12px 0 rgba(0,0,0,0.35)',
            }}
          >
            <Outlined text={subtitle} size={96} color="#fff" stroke={18} />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
