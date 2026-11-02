import React from 'react';
import {TITLE_FONT} from '../fonts';

const INK = '#1d1b22';

interface P {
  x: number;
  y: number;
  scale?: number;
  rot?: number;
}

const T: React.FC<P & {children: React.ReactNode}> = ({x, y, scale = 1, rot = 0, children}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>{children}</g>
);

export const Clipboard: React.FC<P> = (p) => (
  <T {...p}>
    <rect x={-46} y={-70} width={92} height={124} rx={8} fill="#B5713A" stroke={INK} strokeWidth={5} />
    <rect x={-36} y={-56} width={72} height={100} fill="#fffdf3" stroke={INK} strokeWidth={3} />
    {[0, 1, 2, 3, 4].map((i) => (
      <line key={i} x1={-26} x2={i === 4 ? 4 : 26} y1={-34 + i * 16} y2={-34 + i * 16} stroke="#9aa3b5" strokeWidth={4} strokeLinecap="round" />
    ))}
    <path d="M -18 -74 L 18 -74 L 14 -56 L -14 -56 Z" fill="#c9ced6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </T>
);

export const Phone: React.FC<P & {screen?: boolean}> = (p) => (
  <T {...p}>
    <rect x={-22} y={-38} width={44} height={76} rx={9} fill="#26242c" stroke={INK} strokeWidth={4.5} />
    {p.screen ? (
      <rect x={-17} y={-32} width={34} height={64} rx={5} fill="#7fd6ff" />
    ) : (
      <>
        <circle cx={-9} cy={-26} r={5} fill="#555" />
        <rect x={-6} y={-6} width={12} height={12} rx={3} fill="#3a3842" />
      </>
    )}
  </T>
);

export const Chips: React.FC<P & {empty?: boolean}> = (p) => (
  <T {...p}>
    <path
      d="M -40 -58 L -30 -66 L -20 -58 L -10 -66 L 0 -58 L 10 -66 L 20 -58 L 30 -66 L 40 -58 L 46 50 L -46 50 Z"
      fill="#FF5C39"
      stroke={INK}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    <ellipse cx={0} cy={-2} rx={30} ry={24} fill="#FFD23F" stroke={INK} strokeWidth={3.5} />
    <text x={0} y={7} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={22} fill="#C9302C">
      CHIPS
    </text>
    <rect x={-44} y={30} width={88} height={10} fill="#C9302C" />
  </T>
);

export const PizzaBox: React.FC<P & {open?: boolean; empty?: boolean}> = (p) => (
  <T {...p}>
    {p.open && (
      <>
        <path d="M -78 -10 L -66 -66 L 66 -66 L 78 -10 Z" fill="#E9E2D0" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        {!p.empty &&
          [-48, -20, 8, 36, -34, -6, 22, 50].map((cx, i) => (
            <rect key={i} x={cx - 12} y={i < 4 ? -50 : -32} width={24} height={14} rx={7} fill="#E8A852" stroke={INK} strokeWidth={3} />
          ))}
      </>
    )}
    <rect x={-80} y={-12} width={160} height={42} rx={6} fill="#D62828" stroke={INK} strokeWidth={5} />
    <text x={0} y={18} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={21} fill="#FFE8A3">
      PIZZA ROLLS
    </text>
  </T>
);

export const PizzaRoll: React.FC<P> = (p) => (
  <T {...p}>
    <rect x={-15} y={-9} width={30} height={18} rx={9} fill="#E8A852" stroke={INK} strokeWidth={3.5} />
    <path d="M -6 -3 Q 0 2 6 -3" stroke="#B5651D" strokeWidth={2.5} fill="none" />
  </T>
);

export const Pretzel: React.FC<P> = (p) => (
  <T {...p}>
    <path
      d="M 0 14 C -40 -10 -34 -40 -12 -34 C 6 -30 0 0 0 14 C 0 0 -6 -30 12 -34 C 34 -40 40 -10 0 14 Z"
      fill="none"
      stroke={INK}
      strokeWidth={17}
      strokeLinejoin="round"
    />
    <path
      d="M 0 14 C -40 -10 -34 -40 -12 -34 C 6 -30 0 0 0 14 C 0 0 -6 -30 12 -34 C 34 -40 40 -10 0 14 Z"
      fill="none"
      stroke="#B9732F"
      strokeWidth={9}
      strokeLinejoin="round"
    />
  </T>
);

/** Side-view shopping cart. Origin = ground between the wheels. */
export const Cart: React.FC<P & {spin?: number}> = (p) => (
  <T {...p}>
    {/* handle */}
    <path d="M -122 -196 L -150 -200" stroke={INK} strokeWidth={16} strokeLinecap="round" />
    <path d="M -122 -196 L -150 -200" stroke="#E63946" strokeWidth={8} strokeLinecap="round" />
    {/* basket */}
    <path d="M -126 -200 L 120 -186 L 98 -72 L -104 -72 Z" fill="#cfd6df" fillOpacity={0.35} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[-80, -40, 0, 40, 80].map((gx, i) => (
      <line key={i} x1={gx - 2} y1={-196 + i * 2} x2={gx - 6} y2={-74} stroke="#8a95a5" strokeWidth={3.5} />
    ))}
    {[-160, -130, -100].map((gy, i) => (
      <line key={i} x1={-120 + i * 6} y1={gy} x2={114 - i * 6} y2={gy + 8} stroke="#8a95a5" strokeWidth={3.5} />
    ))}
    {/* frame */}
    <path d="M -104 -72 L -90 -30 L 92 -30 L 98 -72" fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[-80, 80].map((wx, i) => (
      <g key={i} transform={`translate(${wx} -16) rotate(${p.spin ?? 0})`}>
        <circle r={16} fill="#2a2830" stroke={INK} strokeWidth={4} />
        <line x1={-10} y1={0} x2={10} y2={0} stroke="#888" strokeWidth={3} />
      </g>
    ))}
  </T>
);

export const Radio: React.FC<P & {glow?: number}> = (p) => (
  <T {...p}>
    <line x1={50} y1={-70} x2={92} y2={-170} stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <circle cx={92} cy={-170} r={7} fill="#888" stroke={INK} strokeWidth={3} />
    <rect x={-90} y={-76} width={180} height={76} rx={14} fill="#F4A259" stroke={INK} strokeWidth={6} />
    <rect x={-60} y={-92} width={120} height={18} rx={6} fill="#3a3a3a" stroke={INK} strokeWidth={4} />
    <circle cx={-44} cy={-38} r={26} fill="#3a3842" stroke={INK} strokeWidth={4} />
    {[-14, -4, 6].map((r, i) => (
      <circle key={i} cx={-44} cy={-38} r={18 + r / 2} fill="none" stroke="#56535f" strokeWidth={2} />
    ))}
    <rect x={2} y={-60} width={70} height={26} rx={5} fill={p.glow ? '#ffe28a' : '#d8c08a'} stroke={INK} strokeWidth={4} />
    {p.glow ? <rect x={2} y={-60} width={70} height={26} rx={5} fill="#fff3b0" opacity={p.glow} /> : null}
    <line x1={20} y1={-58} x2={20} y2={-36} stroke="#d62828" strokeWidth={3} />
    <circle cx={20} cy={-14} r={8} fill="#3a3842" stroke={INK} strokeWidth={3} />
    <circle cx={54} cy={-14} r={8} fill="#3a3842" stroke={INK} strokeWidth={3} />
  </T>
);

export const Bucket: React.FC<P> = (p) => (
  <T {...p}>
    <path d="M -62 -90 L 62 -90 L 50 0 L -50 0 Z" fill="#F77F00" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-66} y={-98} width={132} height={16} rx={6} fill="#FCBF49" stroke={INK} strokeWidth={5} />
  </T>
);

/** Floating "Z" letters for sleeping characters. */
export const Zzz: React.FC<{x: number; y: number; frame: number}> = ({x, y, frame}) => (
  <g>
    {[0, 1, 2].map((i) => {
      const t = ((frame + i * 20) % 60) / 60;
      return (
        <text
          key={i}
          x={x + t * 60 + i * 10}
          y={y - t * 120}
          fontFamily={TITLE_FONT}
          fontSize={36 + i * 10}
          fill="#fff"
          stroke={INK}
          strokeWidth={5}
          paintOrder="stroke"
          opacity={1 - t}
        >
          Z
        </text>
      );
    })}
  </g>
);

/** Cartoon dust/impact puff. */
export const Puff: React.FC<{x: number; y: number; t: number; size?: number}> = ({x, y, t, size = 1}) => {
  if (t <= 0 || t >= 1) return null;
  return (
    <g opacity={1 - t}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        const d = 30 + t * 120 * size;
        return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d * 0.5} r={(30 + t * 26) * size} fill="#e9e4d8" stroke={INK} strokeWidth={4} />;
      })}
    </g>
  );
};
