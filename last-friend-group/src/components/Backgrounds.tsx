import React from 'react';
import {TITLE_FONT} from '../fonts';
import {rand} from '../lib/anim';

const INK = '#1d1b22';

// ---------- building blocks ----------

export const SkyGrad: React.FC<{id: string; stops: [string, string, string?]; y0?: number; y1?: number; x?: number; w?: number}> = ({
  id,
  stops,
  y0 = -600,
  y1 = 1080,
  x = -800,
  w = 3520,
}) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={stops[0]} />
        {stops[2] ? <stop offset="0.6" stopColor={stops[1]} /> : null}
        <stop offset="1" stopColor={stops[2] ?? stops[1]} />
      </linearGradient>
    </defs>
    <rect x={x} y={y0} width={w} height={y1 - y0} fill={`url(#${id})`} />
  </>
);

export const Cloud: React.FC<{x: number; y: number; s?: number; color?: string; opacity?: number}> = ({x, y, s = 1, color = '#fff', opacity = 0.9}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <ellipse cx={0} cy={0} rx={90} ry={40} fill={color} />
    <ellipse cx={-60} cy={10} rx={60} ry={30} fill={color} />
    <ellipse cx={60} cy={8} rx={70} ry={32} fill={color} />
    <ellipse cx={10} cy={-26} rx={56} ry={40} fill={color} />
  </g>
);

/** Row of simple buildings. */
export const Skyline: React.FC<{
  seed: number;
  base: number;
  minH: number;
  maxH: number;
  colors: string[];
  windows?: string;
  outline?: boolean;
  x0?: number;
  x1?: number;
  litWindows?: string;
}> = ({seed, base, minH, maxH, colors, windows, outline, x0 = -800, x1 = 2720, litWindows}) => {
  const items: React.ReactNode[] = [];
  let x = x0;
  let i = 0;
  while (x < x1) {
    const w = 110 + rand(seed + i) * 170;
    const h = minH + rand(seed + i * 3.1) * (maxH - minH);
    const c = colors[i % colors.length];
    const top = base - h;
    items.push(
      <g key={i}>
        <rect x={x} y={top} width={w} height={h + 4} fill={c} stroke={outline ? INK : 'none'} strokeWidth={outline ? 5 : 0} />
        {rand(seed + i * 7) > 0.6 && <rect x={x + w * 0.3} y={top - 30} width={w * 0.2} height={30} fill={c} stroke={outline ? INK : 'none'} strokeWidth={outline ? 4 : 0} />}
        {windows &&
          Array.from({length: Math.floor((h - 40) / 48)}).map((_, r) =>
            Array.from({length: Math.floor((w - 24) / 36)}).map((__, col) => (
              <rect
                key={`${r}-${col}`}
                x={x + 16 + col * 36}
                y={top + 22 + r * 48}
                width={20}
                height={28}
                fill={litWindows && rand(seed + i * 13 + r * 5 + col) > 0.93 ? litWindows : windows}
              />
            )),
          )}
      </g>,
    );
    x += w + 6 + rand(seed + i * 5) * 20;
    i++;
  }
  return <g>{items}</g>;
};

export const Car: React.FC<{x: number; y: number; color: string; s?: number; flip?: boolean}> = ({x, y, color, s = 1, flip}) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <path d="M -170 -30 L -160 -78 L -90 -84 L -50 -134 L 70 -134 L 120 -84 L 168 -76 L 174 -30 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -40 -122 L 62 -122 L 100 -86 L -76 -86 Z" fill="#bfe3f2" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <line x1={14} y1={-122} x2={14} y2={-86} stroke={INK} strokeWidth={4} />
    <rect x={150} y={-70} width={20} height={12} rx={3} fill="#ffe08a" stroke={INK} strokeWidth={3} />
    {[-100, 110].map((wx, i) => (
      <g key={i}>
        <circle cx={wx} cy={-28} r={32} fill="#2a2830" stroke={INK} strokeWidth={5} />
        <circle cx={wx} cy={-28} r={13} fill="#9aa0a8" />
      </g>
    ))}
  </g>
);

export const Tree: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#4CAF50'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-16} y={-150} width={32} height={150} fill="#8B5E3C" stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={-200} r={90} fill={color} stroke={INK} strokeWidth={6} />
    <circle cx={-60} cy={-160} r={56} fill={color} stroke={INK} strokeWidth={6} />
    <circle cx={64} cy={-162} r={60} fill={color} stroke={INK} strokeWidth={6} />
    <circle cx={-10} cy={-176} r={70} fill={color} />
  </g>
);

export const GrassTufts: React.FC<{y: number; seed: number; color?: string; count?: number; h?: number; x0?: number; x1?: number}> = ({
  y,
  seed,
  color = '#3E8E41',
  count = 30,
  h = 40,
  x0 = -300,
  x1 = 2220,
}) => (
  <g>
    {Array.from({length: count}).map((_, i) => {
      const x = x0 + rand(seed + i) * (x1 - x0);
      const hh = h * (0.6 + rand(seed + i * 2) * 0.8);
      return (
        <path
          key={i}
          d={`M ${x - 14} ${y} L ${x - 8} ${y - hh} L ${x - 2} ${y - 6} L ${x + 4} ${y - hh * 1.2} L ${x + 8} ${y - 4} L ${x + 16} ${y - hh * 0.8} L ${x + 18} ${y} Z`}
          fill={color}
        />
      );
    })}
  </g>
);

// ---------- locations ----------

/** Empty downtown street (cold open). */
export const CityStreet: React.FC<{frame: number}> = ({frame}) => {
  const blink = Math.floor(frame / 18) % 2 === 0;
  return (
    <g>
      <SkyGrad id="cityS" stops={['#A9C6DE', '#E3ECF1']} />
      <Cloud x={300} y={160} s={1.4} opacity={0.7} />
      <Cloud x={1400} y={120} s={1.1} opacity={0.6} />
      <Skyline seed={3} base={660} minH={260} maxH={520} colors={['#9DB0C4', '#8FA3B8', '#A8B9CB']} windows="#8396ab" />
      <Skyline seed={11} base={660} minH={180} maxH={380} colors={['#6D7D92', '#B0846A', '#7E8FA6', '#9B6B5A']} windows="#3d4656" outline />
      {/* sidewalk */}
      <rect x={-800} y={650} width={3520} height={70} fill="#C7C5C0" stroke={INK} strokeWidth={5} />
      {Array.from({length: 40}).map((_, i) => (
        <line key={i} x1={-800 + i * 110} y1={650} x2={-800 + i * 110} y2={720} stroke="#a9a7a2" strokeWidth={3} />
      ))}
      <rect x={-800} y={720} width={3520} height={16} fill="#9a9893" />
      {/* road */}
      <rect x={-800} y={736} width={3520} height={700} fill="#4B4F58" />
      {Array.from({length: 30}).map((_, i) => (
        <rect key={i} x={-800 + i * 180} y={900} width={100} height={14} fill="#F4D35E" />
      ))}
      <GrassTufts y={652} seed={5} color="#6a9c4f" count={18} h={30} />
      {/* traffic light */}
      <g transform="translate(1180 650)">
        <rect x={-8} y={-360} width={16} height={360} fill="#3a3d44" stroke={INK} strokeWidth={4} />
        <rect x={-30} y={-460} width={60} height={130} rx={10} fill="#2b2d33" stroke={INK} strokeWidth={5} />
        <circle cx={0} cy={-432} r={15} fill="#5a2a2a" />
        <circle cx={0} cy={-395} r={15} fill={blink ? '#FFC300' : '#5a4a1a'} />
        {blink && <circle cx={0} cy={-395} r={34} fill="#FFC300" opacity={0.25} />}
        <circle cx={0} cy={-358} r={15} fill="#1f3a2a" />
      </g>
      {/* hydrant */}
      <g transform="translate(420 700)">
        <rect x={-18} y={-60} width={36} height={60} rx={8} fill="#E63946" stroke={INK} strokeWidth={5} />
        <rect x={-30} y={-46} width={60} height={14} rx={6} fill="#E63946" stroke={INK} strokeWidth={4} />
        <circle cx={0} cy={-64} r={16} fill="#E63946" stroke={INK} strokeWidth={5} />
      </g>
      <Car x={240} y={1010} color="#5DA9E9" />
      <Car x={1720} y={830} color="#F6AE2D" s={0.8} flip />
    </g>
  );
};

/** Overgrown suburban cul-de-sac. */
export const Suburb: React.FC = () => (
  <g>
    <SkyGrad id="subS" stops={['#5EC2F2', '#BDE8FA']} />
    <Cloud x={260} y={150} s={1.2} />
    <Cloud x={1500} y={110} s={0.9} />
    <Cloud x={980} y={230} s={0.6} opacity={0.7} />
    {/* back lawns */}
    <rect x={-800} y={560} width={3520} height={200} fill="#7BC950" />
    {[
      {x: 60, c: '#F4A259', r: '#9C4A3D'},
      {x: 520, c: '#A0C4FF', r: '#3D5A80'},
      {x: 1000, c: '#FFD6A5', r: '#8C5E58'},
      {x: 1480, c: '#CDB4DB', r: '#5E548E'},
      {x: 1960, c: '#B9FBC0', r: '#386641'},
      {x: -420, c: '#FFADAD', r: '#7f3b3b'},
    ].map((h, i) => (
      <g key={i} transform={`translate(${h.x} 600)`}>
        <rect x={0} y={-200} width={340} height={200} fill={h.c} stroke={INK} strokeWidth={6} />
        <path d="M -30 -196 L 170 -330 L 370 -196 Z" fill={h.r} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <rect x={140} y={-110} width={64} height={110} fill="#6B4226" stroke={INK} strokeWidth={5} />
        <circle cx={190} cy={-56} r={5} fill="#FFD166" />
        <rect x={34} y={-150} width={70} height={60} fill="#cfefff" stroke={INK} strokeWidth={5} />
        <rect x={238} y={-150} width={70} height={60} fill="#cfefff" stroke={INK} strokeWidth={5} />
        <line x1={69} y1={-150} x2={69} y2={-90} stroke={INK} strokeWidth={3} />
        <line x1={273} y1={-150} x2={273} y2={-90} stroke={INK} strokeWidth={3} />
      </g>
    ))}
    <Tree x={-60} y={640} s={1} color="#55A630" />
    <Tree x={1880} y={640} s={1.1} color="#2B9348" />
    <GrassTufts y={760} seed={21} color="#5AA43B" count={60} h={55} />
    {/* sidewalk + road */}
    <rect x={-800} y={740} width={3520} height={40} fill="#D9D6CF" stroke={INK} strokeWidth={5} />
    <rect x={-800} y={780} width={3520} height={700} fill="#5B6170" />
    <path d="M -800 960 L 2720 960" stroke="#f4f1e8" strokeWidth={10} strokeDasharray="70 60" />
    {/* cracks in the road with grass */}
    <path d="M 300 1020 l 30 -20 l 20 16 l 40 -26" stroke={INK} strokeWidth={4} fill="none" opacity={0.5} />
    <GrassTufts y={1014} seed={77} color="#5AA43B" count={4} h={30} x0={300} x1={400} />
    {/* mailbox */}
    <g transform="translate(1720 760)">
      <rect x={-6} y={-110} width={12} height={110} fill="#6B4226" stroke={INK} strokeWidth={4} />
      <rect x={-46} y={-170} width={92} height={60} rx={26} fill="#3D5A80" stroke={INK} strokeWidth={5} />
      <rect x={34} y={-170} width={8} height={36} fill="#E63946" stroke={INK} strokeWidth={3} />
    </g>
  </g>
);

const Storefront: React.FC<{x: number; w: number; name: string; color: string; awning: string; sign?: string}> = ({x, w, name, color, awning, sign = '#fff'}) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={0} y={250} width={w} height={390} fill={color} stroke={INK} strokeWidth={6} />
    <rect x={20} y={360} width={w - 40} height={240} fill="#2f2b3a" stroke={INK} strokeWidth={5} />
    <rect x={30} y={370} width={w - 60} height={60} fill="#ffffff" opacity={0.08} />
    {Array.from({length: Math.floor(w / 60)}).map((_, i) => (
      <path key={i} d={`M ${i * 60} 300 L ${i * 60 + 30} 300 L ${i * 60 + 30} 350 Q ${i * 60 + 15} 362 ${i * 60} 350 Z`} fill={i % 2 ? awning : '#fff'} stroke={INK} strokeWidth={3} />
    ))}
    <rect x={20} y={262} width={w - 40} height={38} rx={8} fill={sign} stroke={INK} strokeWidth={4} />
    <text x={w / 2} y={292} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={30} fill={INK}>
      {name}
    </text>
  </g>
);

/** Empty mall food court. */
export const FoodCourt: React.FC = () => (
  <g>
    <rect x={-800} y={-600} width={3520} height={1300} fill="#F3E9D2" />
    {/* skylight */}
    <rect x={-800} y={-600} width={3520} height={250} fill="#d9cdb2" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <path key={i} d={`M ${-200 + i * 380} 0 L ${-60 + i * 380} 0 L ${60 + i * 380} 660 L ${-260 + i * 380} 660 Z`} fill="#fffbe6" opacity={0.25} />
    ))}
    <rect x={-800} y={200} width={3520} height={50} fill="#C9B79C" stroke={INK} strokeWidth={5} />
    <Storefront x={-140} w={420} name="PRETZEL PLANET" color="#F6BD60" awning="#E76F51" />
    <Storefront x={320} w={420} name="WOK THIS WAY" color="#E63946" awning="#1D3557" sign="#FFE8A3" />
    <Storefront x={780} w={420} name="PIZZA PALACE" color="#2A9D8F" awning="#E9C46A" />
    <Storefront x={1240} w={420} name="SMOOTHIE SPOT" color="#9B5DE5" awning="#F15BB5" />
    <Storefront x={1700} w={420} name="TACO TOWER" color="#F77F00" awning="#FCBF49" />
    {/* checker floor */}
    <rect x={-800} y={640} width={3520} height={800} fill="#E8E2D4" />
    {Array.from({length: 7}).map((_, r) =>
      Array.from({length: 40}).map((__, c) =>
        (r + c) % 2 ? <rect key={`${r}-${c}`} x={-800 + c * 90} y={640 + r * 70} width={90} height={70} fill="#CFC6B4" /> : null,
      ),
    )}
    <line x1={-800} y1={640} x2={2720} y2={640} stroke={INK} strokeWidth={6} />
    {/* planters */}
    {[60, 1860].map((px, i) => (
      <g key={i} transform={`translate(${px} 700)`}>
        <rect x={-60} y={-70} width={120} height={70} fill="#8D6346" stroke={INK} strokeWidth={5} />
        <ellipse cx={0} cy={-120} rx={70} ry={70} fill="#52B788" stroke={INK} strokeWidth={5} />
        <ellipse cx={-30} cy={-160} rx={36} ry={50} fill="#40916C" />
      </g>
    ))}
  </g>
);

/** Food court table piled with everything (drawn in front of seated characters). */
export const FeastTable: React.FC = () => (
  <g transform="translate(960 790)">
    <rect x={-560} y={0} width={1120} height={40} rx={10} fill="#E9C46A" stroke={INK} strokeWidth={6} />
    <rect x={-540} y={40} width={1080} height={240} fill="#B08968" stroke={INK} strokeWidth={6} />
    {/* pizza box open */}
    <g transform="translate(-380 -10)">
      <path d="M -100 10 L -110 -60 L 110 -60 L 100 10 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={0} cy={-26} r={46} fill="#F4A261" stroke={INK} strokeWidth={4} />
      {[[-18, -36], [16, -20], [-6, -6], [22, -44]].map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={8} fill="#D62828" />
      ))}
    </g>
    {/* takeout boxes */}
    <g transform="translate(-120 -14)">
      <path d="M -44 0 L -54 -70 L 54 -70 L 44 0 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -20 -70 Q 0 -100 20 -70" fill="none" stroke={INK} strokeWidth={4} />
      <rect x={-24} y={-50} width={48} height={22} fill="#E63946" />
    </g>
    {/* pretzels */}
    {[100, 170].map((px, i) => (
      <g key={i} transform={`translate(${px} -30)`}>
        <path d="M 0 14 C -40 -10 -34 -40 -12 -34 C 6 -30 0 0 0 14 C 0 0 -6 -30 12 -34 C 34 -40 40 -10 0 14 Z" fill="none" stroke={INK} strokeWidth={17} />
        <path d="M 0 14 C -40 -10 -34 -40 -12 -34 C 6 -30 0 0 0 14 C 0 0 -6 -30 12 -34 C 34 -40 40 -10 0 14 Z" fill="none" stroke="#B9732F" strokeWidth={9} />
      </g>
    ))}
    {/* smoothie */}
    <g transform="translate(330 0)">
      <path d="M -34 0 L -42 -110 L 42 -110 L 34 0 Z" fill="#F15BB5" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-46} y={-122} width={92} height={16} rx={6} fill="#fff" stroke={INK} strokeWidth={4} />
      <line x1={10} y1={-122} x2={30} y2={-180} stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <line x1={10} y1={-122} x2={30} y2={-180} stroke="#00BBF9" strokeWidth={5} strokeLinecap="round" />
    </g>
    {/* fries */}
    <g transform="translate(470 -4)">
      {[-20, -8, 4, 16].map((fx2, i) => (
        <rect key={i} x={fx2} y={-80 + (i % 2) * 10} width={10} height={60} fill="#FFD166" stroke={INK} strokeWidth={3} />
      ))}
      <path d="M -34 -30 L 34 -30 L 26 0 L -26 0 Z" fill="#E63946" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    </g>
  </g>
);

/** Mattress store with a giant stack in the middle. */
export const MattressStore: React.FC = () => (
  <g>
    <rect x={-800} y={-400} width={3520} height={1100} fill="#CDB4DB" />
    <rect x={-800} y={-400} width={3520} height={260} fill="#BDE0FE" opacity={0.5} />
    <g transform="translate(960 150)">
      <rect x={-420} y={-60} width={840} height={110} rx={18} fill="#fff" stroke={INK} strokeWidth={7} />
      <text x={0} y={22} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={74} fill="#7B2CBF">
        MATTRESS KINGDOM
      </text>
      <path d="M -60 -60 L -40 -110 L -10 -80 L 0 -122 L 10 -80 L 40 -110 L 60 -60 Z" fill="#FFD60A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    </g>
    <rect x={-800} y={700} width={3520} height={700} fill="#8E7DBE" />
    <line x1={-800} y1={700} x2={2720} y2={700} stroke={INK} strokeWidth={6} />
    {/* display beds */}
    {[220, 1700].map((bx, i) => (
      <g key={i} transform={`translate(${bx} 760)`}>
        <rect x={-180} y={-60} width={360} height={70} rx={20} fill={i ? '#A2D2FF' : '#FFC8DD'} stroke={INK} strokeWidth={6} />
        <rect x={-150} y={-90} width={110} height={40} rx={18} fill="#fff" stroke={INK} strokeWidth={5} />
        <rect x={-190} y={-200} width={20} height={210} fill="#8D6346" stroke={INK} strokeWidth={5} />
        <text x={0} y={-112} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={34} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">
          {i ? '70% OFF' : 'SALE'}
        </text>
      </g>
    ))}
  </g>
);

/** Tower of mattresses; returns the y of the top surface via constant. */
export const MATTRESS_TOP = 470;
export const MattressTower: React.FC = () => {
  const colors = ['#FFAFCC', '#A2D2FF', '#FFC8DD', '#BDE0FE', '#CDEAC0', '#FFE5A5', '#FFAFCC', '#A2D2FF', '#E2C2FF', '#FFD6A5', '#C8F7DC'];
  return (
    <g>
      {colors.map((c, i) => (
        <rect
          key={i}
          x={960 - 300 + (i % 3) * 8 - 8}
          y={MATTRESS_TOP + (colors.length - 1 - i) * 30}
          width={600}
          height={34}
          rx={14}
          fill={c}
          stroke={INK}
          strokeWidth={5}
        />
      ))}
    </g>
  );
};

/** Neon arcade. */
export const Arcade: React.FC<{frame: number}> = ({frame}) => {
  const flick = 0.75 + 0.25 * Math.sin(frame * 0.3);
  const cab = (x: number, color: string, screen: string, i: number) => (
    <g key={i} transform={`translate(${x} 700)`}>
      <path d="M -90 0 L -90 -380 L -70 -420 L 90 -420 L 90 0 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-70} y={-400} width={140} height={40} fill="#111" stroke={INK} strokeWidth={4} />
      <rect x={-66} y={-340} width={132} height={110} rx={8} fill={screen} stroke={INK} strokeWidth={5} />
      <rect x={-66} y={-340} width={132} height={110} rx={8} fill="#fff" opacity={0.12 * flick} />
      <path d="M -90 -200 L 90 -200 L 110 -150 L -110 -150 Z" fill="#2b2b38" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <line x1={-40} y1={-176} x2={-40} y2={-210} stroke={INK} strokeWidth={6} />
      <circle cx={-40} cy={-214} r={10} fill="#E63946" stroke={INK} strokeWidth={3} />
      <circle cx={20} cy={-176} r={9} fill="#FFD60A" stroke={INK} strokeWidth={3} />
      <circle cx={50} cy={-176} r={9} fill="#00BBF9" stroke={INK} strokeWidth={3} />
    </g>
  );
  return (
    <g>
      <rect x={-800} y={-500} width={3520} height={1300} fill="#1E1236" />
      {Array.from({length: 26}).map((_, i) => (
        <circle key={i} cx={-200 + rand(i) * 2400} cy={-100 + rand(i + 50) * 700} r={3} fill="#fff" opacity={0.25} />
      ))}
      <g transform="translate(960 250)" opacity={flick}>
        <text x={0} y={0} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={140} fill="none" stroke="#F15BB5" strokeWidth={22} opacity={0.35}>
          BLAST ZONE
        </text>
        <text x={0} y={0} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={140} fill="#FFD1F0" stroke="#F15BB5" strokeWidth={6}>
          BLAST ZONE
        </text>
      </g>
      {cab(-80, '#7B2CBF', '#00F5D4', 0)}
      {cab(180, '#F15BB5', '#FEE440', 1)}
      {cab(440, '#00BBF9', '#F15BB5', 2)}
      {cab(1480, '#FEE440', '#9B5DE5', 3)}
      {cab(1740, '#00F5D4', '#F15BB5', 4)}
      {cab(2000, '#7B2CBF', '#FEE440', 5)}
      <rect x={-800} y={700} width={3520} height={700} fill="#2D1B4E" />
      {Array.from({length: 120}).map((_, i) => (
        <rect
          key={i}
          x={-400 + rand(i * 3) * 2800}
          y={720 + rand(i * 7) * 380}
          width={14}
          height={14}
          fill={['#F15BB5', '#00F5D4', '#FEE440', '#00BBF9'][i % 4]}
          opacity={0.55}
          transform={`rotate(${rand(i) * 90} ${-400 + rand(i * 3) * 2800} ${720 + rand(i * 7) * 380})`}
        />
      ))}
      <line x1={-800} y1={700} x2={2720} y2={700} stroke="#F15BB5" strokeWidth={6} opacity={0.7} />
    </g>
  );
};

/** Tall water-tower world. Ground at y=1080, catwalk at y=CATWALK_Y. */
export const CATWALK_Y = -470;
export const WaterTowerWorld: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <SkyGrad id="towerS" stops={['#3A86FF', '#8ECAE6', '#CDEFFF']} y0={-2200} y1={1100} x={-2400} w={6800} />
    <Cloud x={200 + frame * 0.3} y={-900} s={1.6} />
    <Cloud x={1500 + frame * 0.2} y={-1300} s={1.2} />
    <Cloud x={700 + frame * 0.25} y={-200} s={1.0} opacity={0.7} />
    <Cloud x={1700 + frame * 0.25} y={300} s={1.3} opacity={0.8} />
    {/* tiny town far below */}
    <Skyline seed={41} base={980} minH={60} maxH={160} colors={['#F4A259', '#A0C4FF', '#FFD6A5', '#CDB4DB', '#B9FBC0']} outline x0={-2400} x1={4400} />
    <rect x={-2400} y={980} width={6800} height={800} fill="#7BC950" stroke={INK} strokeWidth={6} />
    <GrassTufts y={985} seed={9} color="#5AA43B" count={70} h={40} x0={-1600} x1={3500} />
    {/* tower legs */}
    {[
      [700, 1000, 820, CATWALK_Y],
      [1220, 1000, 1100, CATWALK_Y],
    ].map(([x1, y1, x2, y2], i) => (
      <g key={i}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={34} strokeLinecap="round" />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7D8597" strokeWidth={22} strokeLinecap="round" />
      </g>
    ))}
    {[0, 1, 2, 3].map((i) => {
      const yA = 860 - i * 340;
      const yB = yA - 340;
      const lx = (y: number) => 700 + ((1000 - y) / (1000 - CATWALK_Y)) * 120;
      const rx = (y: number) => 1220 - ((1000 - y) / (1000 - CATWALK_Y)) * 120;
      return (
        <g key={i} stroke="#5C677D" strokeWidth={10}>
          <line x1={lx(yA)} y1={yA} x2={rx(yB)} y2={yB} />
          <line x1={rx(yA)} y1={yA} x2={lx(yB)} y2={yB} />
          <line x1={lx(yA)} y1={yA} x2={rx(yA)} y2={yA} />
        </g>
      );
    })}
    {/* ladder */}
    <g>
      <line x1={930} y1={1000} x2={930} y2={CATWALK_Y} stroke={INK} strokeWidth={14} />
      <line x1={990} y1={1000} x2={990} y2={CATWALK_Y} stroke={INK} strokeWidth={14} />
      <line x1={930} y1={1000} x2={930} y2={CATWALK_Y} stroke="#ADB5BD" strokeWidth={6} />
      <line x1={990} y1={1000} x2={990} y2={CATWALK_Y} stroke="#ADB5BD" strokeWidth={6} />
      {Array.from({length: 48}).map((_, i) => (
        <line key={i} x1={930} x2={990} y1={990 - i * 31} y2={990 - i * 31} stroke="#ADB5BD" strokeWidth={6} />
      ))}
    </g>
    {/* tank */}
    <g>
      <path d={`M 640 ${CATWALK_Y - 20} L 640 ${CATWALK_Y - 420} Q 960 ${CATWALK_Y - 640} 1280 ${CATWALK_Y - 420} L 1280 ${CATWALK_Y - 20} Q 960 ${CATWALK_Y + 40} 640 ${CATWALK_Y - 20} Z`} fill="#90A4C3" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d={`M 700 ${CATWALK_Y - 60} L 700 ${CATWALK_Y - 400}`} stroke="#fff" strokeWidth={16} opacity={0.25} strokeLinecap="round" />
      <text x={960} y={CATWALK_Y - 230} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={110} fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke">
        NOWHERE
      </text>
      <circle cx={960} cy={CATWALK_Y - 560} r={14} fill="#90A4C3" stroke={INK} strokeWidth={6} />
    </g>
    {/* catwalk + railing */}
    <rect x={560} y={CATWALK_Y - 10} width={800} height={24} fill="#6C757D" stroke={INK} strokeWidth={6} />
    <line x1={560} y1={CATWALK_Y - 110} x2={1360} y2={CATWALK_Y - 110} stroke={INK} strokeWidth={8} />
    {Array.from({length: 11}).map((_, i) => (
      <line key={i} x1={560 + i * 80} y1={CATWALK_Y - 110} x2={560 + i * 80} y2={CATWALK_Y} stroke={INK} strokeWidth={6} />
    ))}
  </g>
);

/** Fancy living room at night. Couch seat top at y=COUCH_SEAT. */
export const COUCH_SEAT = 720;
export const LivingRoom: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <rect x={-800} y={-400} width={3520} height={1200} fill="#4A3F7A" />
    {/* window */}
    <g transform="translate(1500 180)">
      <rect x={-200} y={-140} width={400} height={300} fill="#0E1A3A" stroke={INK} strokeWidth={8} />
      {Array.from({length: 14}).map((_, i) => (
        <circle key={i} cx={-180 + rand(i) * 360} cy={-120 + rand(i + 9) * 260} r={2 + rand(i + 3) * 2} fill="#fff" opacity={0.5 + 0.5 * Math.sin(frame * 0.1 + i)} />
      ))}
      <circle cx={100} cy={-60} r={40} fill="#FFF3B0" />
      <line x1={0} y1={-140} x2={0} y2={160} stroke={INK} strokeWidth={8} />
      <line x1={-200} y1={10} x2={200} y2={10} stroke={INK} strokeWidth={8} />
    </g>
    {/* painting */}
    <g transform="translate(380 180)">
      <rect x={-150} y={-100} width={300} height={200} fill="#E9C46A" stroke={INK} strokeWidth={8} />
      <rect x={-130} y={-80} width={260} height={160} fill="#2A9D8F" />
      <circle cx={40} cy={-20} r={30} fill="#F4A261" />
      <path d="M -130 80 L -40 0 L 30 60 L 80 20 L 130 80 Z" fill="#264653" />
    </g>
    {/* lamp */}
    <g transform="translate(140 820)">
      <ellipse cx={0} cy={-470} rx={160} ry={90} fill="#FFE8A3" opacity={0.18} />
      <line x1={0} y1={0} x2={0} y2={-420} stroke={INK} strokeWidth={10} />
      <path d="M -70 -420 L 70 -420 L 46 -520 L -46 -520 Z" fill="#FFD166" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
    {/* floor + rug */}
    <rect x={-800} y={820} width={3520} height={600} fill="#6B4E3D" />
    <line x1={-800} y1={820} x2={2720} y2={820} stroke={INK} strokeWidth={6} />
    <ellipse cx={960} cy={980} rx={760} ry={110} fill="#C8553D" stroke={INK} strokeWidth={6} />
    <ellipse cx={960} cy={980} rx={640} ry={80} fill="none" stroke="#F4D35E" strokeWidth={6} />
    {/* couch back */}
    <rect x={380} y={460} width={1160} height={280} rx={60} fill="#3D5A80" stroke={INK} strokeWidth={8} />
    <rect x={420} y={COUCH_SEAT - 30} width={1080} height={70} rx={24} fill="#4F6D96" stroke={INK} strokeWidth={6} />
  </g>
);

export const CouchFront: React.FC = () => (
  <g>
    <rect x={360} y={COUCH_SEAT + 30} width={1200} height={90} rx={20} fill="#2E4A6B" stroke={INK} strokeWidth={8} />
    <rect x={320} y={560} width={110} height={270} rx={40} fill="#3D5A80" stroke={INK} strokeWidth={8} />
    <rect x={1490} y={560} width={110} height={270} rx={40} fill="#3D5A80" stroke={INK} strokeWidth={8} />
  </g>
);

/** Kitchen with an open freezer. */
export const Kitchen: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <rect x={-800} y={-400} width={3520} height={1200} fill="#E8F1F2" />
    {Array.from({length: 40}).map((_, i) => (
      <line key={i} x1={-800 + i * 90} y1={300} x2={-800 + i * 90} y2={560} stroke="#c9dadd" strokeWidth={3} />
    ))}
    {Array.from({length: 4}).map((_, i) => (
      <line key={i} x1={-800} y1={300 + i * 65} x2={2720} y2={300 + i * 65} stroke="#c9dadd" strokeWidth={3} />
    ))}
    {/* upper cabinets */}
    {[560, 820, 1080, 1340, 1600].map((cx, i) => (
      <g key={i}>
        <rect x={cx} y={20} width={240} height={220} fill="#F4A259" stroke={INK} strokeWidth={6} />
        <circle cx={cx + (i % 2 ? 30 : 210)} cy={200} r={8} fill={INK} />
      </g>
    ))}
    {/* counter */}
    <rect x={480} y={560} width={2000} height={30} fill="#D9D9D9" stroke={INK} strokeWidth={6} />
    <rect x={500} y={590} width={1960} height={250} fill="#F4A259" stroke={INK} strokeWidth={6} />
    {/* fridge */}
    <g transform="translate(110 0)">
      <rect x={-20} y={60} width={360} height={780} rx={20} fill="#DDE5ED" stroke={INK} strokeWidth={8} />
      <line x1={-20} y1={330} x2={340} y2={330} stroke={INK} strokeWidth={6} />
      <rect x={300} y={380} width={14} height={120} rx={6} fill="#9aa5b1" stroke={INK} strokeWidth={4} />
      {/* open freezer door */}
      <rect x={-6} y={74} width={332} height={244} fill="#B8E0F6" stroke={INK} strokeWidth={5} />
      <path d={`M 340 64 L 440 30 L 440 360 L 340 326 Z`} fill="#DDE5ED" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 30) % 90) / 90;
        return <ellipse key={i} cx={160 + i * 40} cy={300 + t * 160} rx={60 + t * 40} ry={18} fill="#fff" opacity={0.5 * (1 - t)} />;
      })}
    </g>
    <rect x={-800} y={840} width={3520} height={600} fill="#D4C5A1" />
    {Array.from({length: 4}).map((_, r) =>
      Array.from({length: 40}).map((__, c) =>
        (r + c) % 2 ? <rect key={`${r}-${c}`} x={-800 + c * 100} y={840 + r * 80} width={100} height={80} fill="#BBAA86" /> : null,
      ),
    )}
    <line x1={-800} y1={840} x2={2720} y2={840} stroke={INK} strokeWidth={6} />
  </g>
);

/** Classroom with a whiteboard full of rules. */
export const Classroom: React.FC = () => (
  <g>
    <rect x={-800} y={-400} width={3520} height={1200} fill="#E9D8A6" />
    <g transform="translate(1140 330)">
      <rect x={-460} y={-250} width={920} height={460} fill="#FDFDFD" stroke={INK} strokeWidth={10} />
      <text x={-420} y={-180} fontFamily={TITLE_FONT} fontSize={46} fill="#D62828">
        RULES (UPDATED)
      </text>
      {['1. NOBODY GOES ANYWHERE ALONE', '2. RATION FOOD', '3. RADIO STAYS ON', '...', '40. NO PIZZA ROLL THEFT', '41. ???'].map((r, i) => (
        <text key={i} x={-420} y={-120 + i * 54} fontFamily={TITLE_FONT} fontSize={36} fill={i === 5 ? '#D62828' : '#1D3557'}>
          {r}
        </text>
      ))}
      <rect x={-460} y={210} width={920} height={20} fill="#ADB5BD" stroke={INK} strokeWidth={5} />
    </g>
    <g transform="translate(250 160)">
      <circle r={70} fill="#fff" stroke={INK} strokeWidth={8} />
      <line x1={0} y1={0} x2={0} y2={-44} stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <line x1={0} y1={0} x2={34} y2={10} stroke={INK} strokeWidth={7} strokeLinecap="round" />
    </g>
    <rect x={-800} y={760} width={3520} height={600} fill="#A47148" />
    <line x1={-800} y1={760} x2={2720} y2={760} stroke={INK} strokeWidth={6} />
  </g>
);

export const Desks: React.FC = () => (
  <g>
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i} transform={`translate(${-60 + i * 330} 1000)`}>
        <rect x={-110} y={-110} width={220} height={26} fill="#E9C46A" stroke={INK} strokeWidth={6} />
        <rect x={-96} y={-84} width={14} height={90} fill="#6C757D" stroke={INK} strokeWidth={4} />
        <rect x={82} y={-84} width={14} height={90} fill="#6C757D" stroke={INK} strokeWidth={4} />
      </g>
    ))}
  </g>
);

/** Park with a bench. Bench seat at y=PARK_SEAT. */
export const PARK_SEAT = 760;
export const Park: React.FC = () => (
  <g>
    <SkyGrad id="parkS" stops={['#9DB4C0', '#DDE6ED']} />
    <Cloud x={400} y={180} s={1.3} color="#eef2f5" />
    <Cloud x={1500} y={240} s={1} color="#eef2f5" />
    <Skyline seed={61} base={640} minH={160} maxH={340} colors={['#A9B4C2', '#B8C2CE']} />
    <rect x={-800} y={620} width={3520} height={800} fill="#8DB580" />
    <Tree x={360} y={720} s={1.3} color="#6A994E" />
    <Tree x={1640} y={700} s={1.1} color="#A7C957" />
    <g transform="translate(1260 760)">
      <rect x={-8} y={-360} width={16} height={360} fill="#3a3d44" />
      <circle cx={0} cy={-370} r={26} fill="#FFF3B0" stroke={INK} strokeWidth={5} />
    </g>
    <rect x={-800} y={900} width={3520} height={200} fill="#C2B280" />
    <line x1={-800} y1={900} x2={2720} y2={900} stroke={INK} strokeWidth={5} />
    {/* bench back */}
    <rect x={690} y={PARK_SEAT - 170} width={540} height={30} rx={8} fill="#A0522D" stroke={INK} strokeWidth={6} />
    <rect x={690} y={PARK_SEAT - 120} width={540} height={30} rx={8} fill="#A0522D" stroke={INK} strokeWidth={6} />
    <rect x={680} y={PARK_SEAT - 20} width={560} height={30} rx={8} fill="#B5651D" stroke={INK} strokeWidth={6} />
  </g>
);

export const BenchFront: React.FC = () => (
  <g>
    <rect x={700} y={PARK_SEAT + 10} width={18} height={130} fill="#3a3d44" stroke={INK} strokeWidth={4} />
    <rect x={1202} y={PARK_SEAT + 10} width={18} height={130} fill="#3a3d44" stroke={INK} strokeWidth={4} />
  </g>
);

/** Empty highway. Road surface at y=HIGHWAY_Y. */
export const HIGHWAY_Y = 900;
export const Highway: React.FC<{scroll: number}> = ({scroll}) => (
  <g>
    <SkyGrad id="hwyS" stops={['#8FB8DE', '#E8EEF2']} />
    <path d={`M -800 640 Q -200 520 400 620 Q 900 700 1400 580 Q 2000 470 2720 600 L 2720 760 L -800 760 Z`} fill="#94B49F" />
    <path d={`M -800 700 Q 200 620 900 700 Q 1600 760 2720 680 L 2720 780 L -800 780 Z`} fill="#7FA98B" />
    <rect x={-800} y={760} width={3520} height={700} fill="#55595F" />
    <line x1={-800} y1={760} x2={2720} y2={760} stroke={INK} strokeWidth={6} />
    {/* guardrail */}
    <rect x={-800} y={720} width={3520} height={22} fill="#C0C6CC" stroke={INK} strokeWidth={5} />
    {Array.from({length: 30}).map((_, i) => {
      const x = ((i * 160 - scroll) % 3520 + 3520) % 3520 - 800;
      return <rect key={i} x={x} y={742} width={14} height={30} fill="#8A9097" stroke={INK} strokeWidth={3} />;
    })}
    {Array.from({length: 26}).map((_, i) => {
      const x = ((i * 220 - scroll) % 3520 + 3520) % 3520 - 800;
      return <rect key={i} x={x} y={1000} width={120} height={14} fill="#F4F1E8" />;
    })}
    {/* overhead sign */}
    <g transform={`translate(${1500 - scroll * 0.4} 0)`}>
      <rect x={-10} y={300} width={20} height={430} fill="#6C757D" stroke={INK} strokeWidth={4} />
      <rect x={-200} y={240} width={400} height={130} rx={10} fill="#2D6A4F" stroke={INK} strokeWidth={6} />
      <text x={0} y={300} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={40} fill="#fff">
        ANYWHERE
      </text>
      <text x={0} y={350} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={34} fill="#fff">
        EXIT 1 MILE
      </text>
    </g>
  </g>
);

/** Grocery freezer aisle. */
export const FreezerAisle: React.FC<{open: number}> = ({open}) => (
  <g>
    <rect x={-800} y={-400} width={3520} height={1200} fill="#DCE3E8" />
    {Array.from({length: 8}).map((_, i) => (
      <rect key={i} x={-300 + i * 340} y={-40} width={220} height={24} rx={10} fill="#fffbe6" opacity={0.9} />
    ))}
    <rect x={-800} y={100} width={3520} height={60} fill="#2A9D8F" stroke={INK} strokeWidth={6} />
    <text x={960} y={146} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={48} fill="#fff">
      FROZEN FOODS
    </text>
    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
      const x = -140 + i * 320;
      const isOpen = i === 3;
      return (
        <g key={i}>
          <rect x={x} y={180} width={300} height={620} fill="#A9D6E5" stroke={INK} strokeWidth={6} />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x={x + 10} y={330 + r * 170} width={280} height={12} fill="#7f9aa8" />
              {(!isOpen || r !== 1) &&
                [0, 1, 2, 3].map((k) =>
                  rand(i * 11 + r * 4 + k) > 0.55 ? (
                    <rect key={k} x={x + 22 + k * 66} y={258 + r * 170} width={52} height={72} fill={['#E76F51', '#F4A261', '#2A9D8F', '#E9C46A'][k]} stroke={INK} strokeWidth={3} opacity={0.5} />
                  ) : null,
                )}
            </g>
          ))}
          {isOpen ? (
            <g>
              <path d={`M ${x} 180 L ${x - 140 * open} ${200} L ${x - 140 * open} 780 L ${x} 800 Z`} fill="#cfeaf5" fillOpacity={0.6} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
              <ellipse cx={x + 150} cy={560} rx={160 * open} ry={60 * open} fill="#fff" opacity={0.25} />
            </g>
          ) : (
            <rect x={x} y={180} width={300} height={620} fill="#ffffff" opacity={0.25} />
          )}
        </g>
      );
    })}
    <rect x={-800} y={800} width={3520} height={600} fill="#BFC8CF" />
    <line x1={-800} y1={800} x2={2720} y2={800} stroke={INK} strokeWidth={6} />
  </g>
);

/** Rooftop with the city behind. Ledge top at y=LEDGE_Y, roof walking line at ROOF_Y. */
export const LEDGE_Y = 770;
export const ROOF_Y = 745;
export const Rooftop: React.FC<{frame: number; mode: 'sunset' | 'night'; sunY?: number; door?: number}> = ({frame, mode, sunY = 520, door = 0}) => {
  const night = mode === 'night';
  return (
    <g>
      {night ? (
        <SkyGrad id="roofN" stops={['#070B1F', '#16224A', '#2B3A67']} />
      ) : (
        <SkyGrad id="roofS" stops={['#3D2C8D', '#F25F5C', '#FFB563']} />
      )}
      {night ? (
        <g>
          {Array.from({length: 90}).map((_, i) => (
            <circle
              key={i}
              cx={-300 + rand(i) * 2500}
              cy={-300 + rand(i + 200) * 820}
              r={1.5 + rand(i + 9) * 2.5}
              fill="#fff"
              opacity={0.4 + 0.6 * Math.abs(Math.sin(frame * 0.05 + i))}
            />
          ))}
          <circle cx={1500} cy={170} r={70} fill="#FFF6D5" />
          <circle cx={1530} cy={150} r={64} fill="#16224A" opacity={0.0} />
          <circle cx={1500} cy={170} r={120} fill="#FFF6D5" opacity={0.1} />
        </g>
      ) : (
        <g>
          <circle cx={1180} cy={sunY} r={210} fill="#FFD166" opacity={0.3} />
          <circle cx={1180} cy={sunY} r={150} fill="#FFE29A" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-800} y={240 + i * 90} width={3520} height={8} fill="#FFD6A5" opacity={0.25} />
          ))}
          <Cloud x={300} y={260} s={1.5} color="#FF9F80" opacity={0.6} />
          <Cloud x={1700} y={200} s={1.1} color="#FFB3A7" opacity={0.5} />
        </g>
      )}
      <Skyline seed={81} base={660} minH={110} maxH={260} colors={night ? ['#151C38', '#1A2244'] : ['#7B3F7A', '#8C4A82']} windows={night ? '#10162e' : '#6d3570'} />
      <Skyline seed={91} base={690} minH={60} maxH={170} colors={night ? ['#0D1229', '#111733'] : ['#4A2155', '#5B2A63']} windows={night ? '#0a0f22' : '#3c1a45'} />
      {/* roof surface */}
      <rect x={-800} y={640} width={3520} height={140} fill={night ? '#2A2F45' : '#7A5C6E'} />
      {/* stair hut with door */}
      <g transform="translate(1720 0)">
        <rect x={-150} y={430} width={300} height={320} fill={night ? '#3A3F5C' : '#B5838D'} stroke={INK} strokeWidth={7} />
        <rect x={-170} y={410} width={340} height={30} fill={night ? '#2A2F45' : '#8E5E6B'} stroke={INK} strokeWidth={6} />
        <rect x={-60} y={540} width={120} height={210} fill="#1b1622" stroke={INK} strokeWidth={6} />
        <g transform={`translate(-60 0) scale(${1 - door * 0.85} 1)`}>
          <rect x={0} y={540} width={120} height={210} fill={night ? '#4D5B7C' : '#6D597A'} stroke={INK} strokeWidth={6} />
          <circle cx={100} cy={650} r={8} fill="#FFD166" stroke={INK} strokeWidth={3} />
        </g>
      </g>
      {/* AC unit */}
      <g transform="translate(240 700)">
        <rect x={-110} y={-120} width={220} height={120} fill={night ? '#454B66' : '#C9ADA7'} stroke={INK} strokeWidth={6} />
        <circle cx={0} cy={-60} r={44} fill={night ? '#30354d' : '#9A8C98'} stroke={INK} strokeWidth={5} />
        <g transform={`rotate(${frame * 6} 0 -60)`}>
          <line x1={-36} y1={-60} x2={36} y2={-60} stroke={INK} strokeWidth={6} />
          <line x1={0} y1={-96} x2={0} y2={-24} stroke={INK} strokeWidth={6} />
        </g>
      </g>
    </g>
  );
};

/** The ledge + building face in front of the seated characters' legs. */
export const LedgeFront: React.FC<{mode: 'sunset' | 'night'}> = ({mode}) => {
  const night = mode === 'night';
  return (
    <g>
      <rect x={-800} y={LEDGE_Y} width={3520} height={36} fill={night ? '#3F4563' : '#C08497'} stroke={INK} strokeWidth={7} />
      <rect x={-800} y={LEDGE_Y + 36} width={3520} height={700} fill={night ? '#2C3150' : '#9C6B7E'} />
      {Array.from({length: 7}).map((_, r) =>
        Array.from({length: 32}).map((__, c) => (
          <rect
            key={`${r}-${c}`}
            x={-800 + c * 120 + (r % 2) * 60}
            y={LEDGE_Y + 36 + r * 50}
            width={120}
            height={50}
            fill="none"
            stroke={night ? '#232842' : '#8A5A6D'}
            strokeWidth={4}
          />
        )),
      )}
    </g>
  );
};
