import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Skyline} from './components/Backgrounds';
import {Character, INK} from './components/Character';
import {Cart} from './components/Props';
import {Outlined} from './components/TitleCard';
import {TITLE_FONT} from './fonts';

/** YouTube thumbnail (render at 1280x720). Drawn in 1920x1080 space. */
export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{background: '#2B1B5A'}}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="thumbGlow" cx="0.68" cy="0.55" r="0.75">
          <stop offset="0" stopColor="#FFB347" />
          <stop offset="0.45" stopColor="#F2545B" />
          <stop offset="1" stopColor="#2B1B5A" />
        </radialGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#thumbGlow)" />
      {/* light rays */}
      <g transform="translate(1300 600)" opacity={0.18}>
        {Array.from({length: 16}).map((_, i) => {
          const a0 = (i / 16) * Math.PI * 2;
          const a1 = a0 + Math.PI / 22;
          return <path key={i} d={`M 0 0 L ${Math.cos(a0) * 2200} ${Math.sin(a0) * 2200} L ${Math.cos(a1) * 2200} ${Math.sin(a1) * 2200} Z`} fill="#FFF3B0" />;
        })}
      </g>
      <Skyline seed={81} base={820} minH={160} maxH={420} colors={['#4A2155', '#5B2A63']} windows="#3c1a45" x0={-200} x1={2200} />
      <rect x={0} y={810} width={1920} height={300} fill="#3A3550" />
      <rect x={0} y={810} width={1920} height={14} fill={INK} opacity={0.5} />
      {Array.from({length: 9}).map((_, i) => (
        <rect key={i} x={i * 240} y={960} width={130} height={16} fill="#F4D35E" />
      ))}

      {/* Jace flying in a cart */}
      <g transform="translate(330 1150) rotate(-8)">
        {[0, 1, 2].map((i) => (
          <line key={i} x1={-230 - i * 30} y1={-300 + i * 70} x2={-460 - i * 60} y2={-300 + i * 70} stroke="#fff" strokeWidth={14} strokeLinecap="round" opacity={0.85} />
        ))}
        <Character who="jace" x={-10} y={-105} scale={1.05} pose="cheer" expr="laugh" />
        <Cart x={0} y={0} scale={1.1} />
      </g>

      <Character who="marcus" x={1010} y={1220} scale={1.55} pose="clip" prop="clipboard" expr="shock" look={-1} />
      <Character who="dev" x={1380} y={1240} scale={1.55} pose="holdUp" prop="phone" expr="sad" lookY={-1} facing={-1} />
      <Character who="tank" x={1760} y={1280} scale={1.5} pose="hold" prop="chips" expr="chew" facing={-1} look={-1} />

      {/* "0 likes" bubble over Dev's phone */}
      <g transform="translate(1110 260) rotate(-6)">
        <rect x={0} y={0} width={250} height={100} rx={26} fill="#fff" stroke={INK} strokeWidth={8} />
        <path d="M 200 96 L 236 150 L 160 96 Z" fill="#fff" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <rect x={150} y={90} width={70} height={14} fill="#fff" />
        <path d="M 62 82 L 30 50 C 16 34 32 10 62 30 C 92 10 108 34 94 50 Z" fill="#FF006E" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <text x={124} y={74} fontFamily={TITLE_FONT} fontSize={62} fill={INK}>
          0
        </text>
      </g>
    </svg>

    {/* Headline */}
    <div style={{position: 'absolute', left: 70, top: 70, transform: 'rotate(-4deg)', transformOrigin: 'left top'}}>
      <Outlined text="EVERYONE" size={164} color="#FFE14D" stroke={36} style={{textAlign: 'left'}} />
      <Outlined text="VANISHED" size={164} color="#FFE14D" stroke={36} style={{textAlign: 'left', marginTop: -10}} />
      <div
        style={{
          display: 'inline-block',
          marginTop: 14,
          marginLeft: 10,
          background: '#E63946',
          border: '9px solid #121016',
          borderRadius: 20,
          padding: '14px 30px 0',
          transform: 'rotate(3deg)',
          boxShadow: '0 12px 0 rgba(0,0,0,0.35)',
        }}
      >
        <Outlined text="...EXCEPT US" size={78} color="#fff" stroke={16} />
      </div>
    </div>
  </AbsoluteFill>
);
