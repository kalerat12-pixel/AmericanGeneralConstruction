import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {SPEAKERS, Who} from '../config/characters';
import {TITLE_FONT, UI_FONT} from '../fonts';
import {pop} from '../lib/anim';
import {Chips} from './Props';
import {LOOKS} from './Character';

const INK = '#121016';

/** Tiny round avatar of a character's face. */
export const Avatar: React.FC<{who: Who; size?: number}> = ({who, size = 64}) => {
  const L = LOOKS[who];
  const hair: Record<Who, React.ReactNode> = {
    marcus: <path d="M -31 -6 C -32 -30 -20 -38 0 -38 C 20 -38 32 -30 31 -6 C 24 -20 12 -24 0 -24 C -12 -24 -24 -20 -31 -6 Z" fill={L.hair} />,
    dev: <path d="M -32 -2 C -36 -30 -14 -42 6 -40 C 30 -40 40 -24 32 -4 C 26 -18 14 -22 4 -22 C -6 -14 -20 -18 -32 -2 Z" fill={L.hair} />,
    tank: <path d="M -32 -8 C -32 -30 -16 -36 0 -36 C 16 -36 32 -30 32 -8 C 22 -22 -22 -22 -32 -8 Z" fill={L.hair} opacity={0.8} />,
    jace: <path d="M -33 -8 C -34 -36 -16 -44 2 -44 C 22 -44 34 -32 33 -8 Z" fill="#2F6BFF" stroke={INK} strokeWidth={3} />,
  };
  return (
    <svg width={size} height={size} viewBox="-40 -40 80 80">
      <circle r={38} fill={SPEAKERS[who].color} stroke={INK} strokeWidth={4} />
      <circle r={30} cy={4} fill={L.skin} stroke={INK} strokeWidth={3} />
      {hair[who]}
      <circle cx={-9} cy={2} r={4} fill={INK} />
      <circle cx={11} cy={2} r={4} fill={INK} />
      <path d="M -8 16 Q 2 22 12 16" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
    </svg>
  );
};

export interface ChatMsg {
  id: string;
  who: Who;
  text: string;
  at: number; // frame relative to the chat UI
}

const PHOTO_H = 300;
// Estimated rendered height of a message (bubbles wrap at ~22 characters).
const msgHeight = (m: ChatMsg) => (m.text === '[photo]' ? PHOTO_H : 84 + Math.ceil(m.text.length / 22) * 42);

/** Full-screen group chat on a big phone. */
export const GroupChat: React.FC<{frame: number; msgs: ChatMsg[]; title: string; enter: number}> = ({frame, msgs, title, enter}) => {
  const visible = msgs.filter((m) => frame >= m.at);
  const heights = visible.map(msgHeight);
  const total = heights.reduce((a, b) => a + b, 0);
  const viewH = 640;
  // Smoothly scroll so the newest message is in view.
  const scrollTarget = Math.max(0, total - viewH);
  const last = visible[visible.length - 1];
  const prevTotal = total - (heights[heights.length - 1] ?? 0);
  const prevScroll = Math.max(0, prevTotal - viewH);
  const scroll = last ? interpolate(pop(frame, last.at, 14, 160), [0, 1], [prevScroll, scrollTarget]) : 0;
  const next = msgs.find((m) => frame < m.at && frame >= m.at - 14);
  const s = pop(frame, enter, 13, 140);

  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #6A4C93 0%, #2B1B47 75%)'}}>
      {Array.from({length: 18}).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: (i * 211) % 1880,
            top: ((i * 137 + frame * (1 + (i % 3))) % 1300) - 150,
            width: 70,
            height: 50,
            borderRadius: 18,
            background: 'rgba(255,255,255,0.06)',
          }}
        />
      ))}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            width: 640,
            height: 1010,
            borderRadius: 70,
            background: '#16141c',
            border: `8px solid ${INK}`,
            boxShadow: '0 30px 0 rgba(0,0,0,0.35)',
            padding: 22,
            transform: `translateY(${(1 - s) * 1100}px) rotate(${(1 - s) * 8 - 1.5}deg)`,
          }}
        >
          <div style={{width: '100%', height: '100%', borderRadius: 50, background: '#F4F1FA', overflow: 'hidden', position: 'relative'}}>
            {/* header */}
            <div
              style={{
                height: 150,
                background: '#2F2A3D',
                display: 'flex',
                alignItems: 'center',
                padding: '30px 30px 0',
                gap: 18,
                fontFamily: UI_FONT,
                color: '#fff',
              }}
            >
              <div style={{display: 'flex', marginRight: 6}}>
                {(['marcus', 'dev', 'tank', 'jace'] as Who[]).map((w, i) => (
                  <div key={w} style={{marginLeft: i ? -26 : 0}}>
                    <Avatar who={w} size={56} />
                  </div>
                ))}
              </div>
              <div>
                <div style={{fontWeight: 800, fontSize: 30, letterSpacing: 0.5}}>{title}</div>
                <div style={{fontWeight: 600, fontSize: 22, opacity: 0.7}}>4 members · all in the same room</div>
              </div>
            </div>
            {/* messages */}
            <div style={{position: 'absolute', top: 160, left: 0, right: 0, bottom: 110, overflow: 'hidden'}}>
              <div style={{transform: `translateY(${-scroll}px)`, padding: '10px 24px'}}>
                {visible.map((m) => {
                  const p = pop(frame, m.at, 11, 220);
                  const photo = m.text === '[photo]';
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        gap: 14,
                        alignItems: 'flex-start',
                        height: msgHeight(m) - 12,
                        marginBottom: 12,
                        transform: `scale(${0.4 + 0.6 * p})`,
                        transformOrigin: 'left center',
                        opacity: Math.min(1, p * 2),
                      }}
                    >
                      <Avatar who={m.who} size={58} />
                      <div>
                        <div style={{fontFamily: UI_FONT, fontWeight: 800, fontSize: 22, color: shade(m.who), marginBottom: 4}}>
                          {SPEAKERS[m.who].name}
                        </div>
                        <div
                          style={{
                            background: '#fff',
                            border: `4px solid ${INK}`,
                            borderRadius: '6px 26px 26px 26px',
                            padding: photo ? 10 : '12px 22px',
                            fontFamily: UI_FONT,
                            fontWeight: 800,
                            fontSize: 32,
                            lineHeight: '42px',
                            color: INK,
                            maxWidth: 460,
                          }}
                        >
                          {photo ? (
                            <svg width={230} height={190} viewBox="-115 -95 230 190" style={{display: 'block', borderRadius: 14, background: '#d8d3e6'}}>
                              <Chips x={0} y={22} scale={1.0} rot={-14} />
                              <text x={0} y={-66} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={26} fill="#C9302C">
                                (EMPTY)
                              </text>
                            </svg>
                          ) : (
                            m.text
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {next && (
                  <div style={{display: 'flex', gap: 14, alignItems: 'center', opacity: 0.85}}>
                    <Avatar who={next.who} size={58} />
                    <div style={{background: '#fff', border: `4px solid ${INK}`, borderRadius: 26, padding: '14px 22px', display: 'flex', gap: 8}}>
                      {[0, 1, 2].map((d) => (
                        <div
                          key={d}
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            background: '#8a8496',
                            transform: `translateY(${Math.sin(frame * 0.5 + d) * 4}px)`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* input bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: 24,
                right: 24,
                height: 70,
                borderRadius: 35,
                background: '#fff',
                border: `4px solid ${INK}`,
                fontFamily: UI_FONT,
                fontWeight: 600,
                fontSize: 26,
                color: '#9a94a8',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 26,
              }}
            >
              Message...
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const shade = (w: Who) => ({marcus: '#C81E1E', dev: '#13924A', tank: '#5E6672', jace: '#1F6FD1'})[w];

/** Signal-strength bars. */
export const SignalBars: React.FC<{x: number; y: number; bars: number; scale?: number; flash?: boolean}> = ({x, y, bars, scale = 1, flash}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-20} y={-120} width={170} height={140} rx={20} fill="#fff" stroke={INK} strokeWidth={6} />
    {[0, 1, 2, 3].map((i) => (
      <rect
        key={i}
        x={i * 34}
        y={-20 - (i + 1) * 22}
        width={24}
        height={(i + 1) * 22}
        rx={4}
        fill={i < bars ? (flash ? '#2DBE6C' : '#1d1b22') : '#d5d2dc'}
        stroke={INK}
        strokeWidth={3}
      />
    ))}
  </g>
);

/** Dev's post, full screen. */
export const PostScreen: React.FC<{frame: number}> = ({frame}) => {
  const s = pop(frame, 0, 13, 150);
  const posting = frame < 22;
  const progress = interpolate(frame, [2, 20], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shakeZero = frame > 45 && frame < 60 ? Math.sin(frame * 2) * 4 : 0;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #3A86FF 0%, #1B3B7A 80%)'}}>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            width: 660,
            height: 1010,
            borderRadius: 70,
            background: '#16141c',
            border: `8px solid ${INK}`,
            padding: 22,
            transform: `scale(${0.7 + 0.3 * s}) rotate(${1.5 - s * 1.5}deg)`,
            boxShadow: '0 30px 0 rgba(0,0,0,0.35)',
          }}
        >
          <div style={{width: '100%', height: '100%', borderRadius: 50, background: '#fff', overflow: 'hidden', fontFamily: UI_FONT, color: INK}}>
            <div style={{height: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 34px 16px', borderBottom: '3px solid #eee'}}>
              <div style={{fontFamily: TITLE_FONT, fontSize: 46, color: '#FF006E'}}>flexr</div>
              <svg width={150} height={40} viewBox="0 0 150 40">
                {[0, 1, 2, 3].map((i) => (
                  <rect key={i} x={i * 20} y={36 - (i + 1) * 9} width={13} height={(i + 1) * 9} rx={2} fill={i < 1 ? INK : '#d5d2dc'} />
                ))}
                <text x={96} y={34} fontFamily={UI_FONT} fontWeight={800} fontSize={22} fill={INK}>
                  1 bar
                </text>
              </svg>
            </div>
            {posting ? (
              <div style={{padding: 60, textAlign: 'center'}}>
                <div style={{fontWeight: 800, fontSize: 38, marginTop: 220}}>Posting...</div>
                <div style={{marginTop: 30, height: 22, borderRadius: 11, background: '#eee', overflow: 'hidden', border: `3px solid ${INK}`}}>
                  <div style={{width: `${progress}%`, height: '100%', background: '#FF006E'}} />
                </div>
              </div>
            ) : (
              <div style={{padding: '24px 30px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                  <Avatar who="dev" size={70} />
                  <div>
                    <div style={{fontWeight: 800, fontSize: 30}}>dev.online</div>
                    <div style={{fontWeight: 600, fontSize: 22, color: '#888'}}>just now · 0 followers</div>
                  </div>
                </div>
                <div style={{fontWeight: 800, fontSize: 34, margin: '20px 0', lineHeight: 1.2}}>
                  day 5 of the apocalypse. still thriving.
                  <span style={{color: '#3A86FF'}}> #lastonesstanding</span>
                </div>
                <div style={{height: 330, borderRadius: 24, border: `4px solid ${INK}`, overflow: 'hidden', background: 'linear-gradient(#3A86FF, #8ECAE6)'}}>
                  <svg width="100%" height="100%" viewBox="0 0 560 330">
                    <ellipse cx={120} cy={70} rx={70} ry={30} fill="#fff" opacity={0.8} />
                    <rect x={0} y={260} width={560} height={70} fill="#90A4C3" />
                    <circle cx={300} cy={190} r={90} fill={LOOKS.dev.skin} stroke={INK} strokeWidth={6} />
                    <path d="M 206 180 C 200 110 260 84 310 88 C 370 90 400 130 392 176 C 380 140 350 130 320 130 C 300 150 260 150 240 130 C 222 140 212 160 206 180 Z" fill={LOOKS.dev.hair} stroke={INK} strokeWidth={5} />
                    <circle cx={272} cy={190} r={10} fill={INK} />
                    <circle cx={330} cy={190} r={10} fill={INK} />
                    <path d="M 270 230 Q 300 260 336 230" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
                    <path d="M 420 250 L 470 200 L 520 250" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div style={{display: 'flex', gap: 40, marginTop: 26, fontWeight: 800, fontSize: 34, alignItems: 'center'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12, transform: `translateX(${shakeZero}px)`}}>
                    <svg width={44} height={40} viewBox="0 0 44 40">
                      <path d="M 22 38 L 4 20 C -4 10 6 -4 22 8 C 38 -4 48 10 40 20 Z" fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
                    </svg>
                    0
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <svg width={44} height={40} viewBox="0 0 44 40">
                      <path d="M 6 4 H 38 Q 42 4 42 8 V 26 Q 42 30 38 30 H 16 L 6 38 V 30 Q 2 30 2 26 V 8 Q 2 4 6 4 Z" fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
                    </svg>
                    0
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <svg width={44} height={40} viewBox="0 0 44 40">
                      <path d="M 4 36 L 40 4 M 18 4 H 40 V 26" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    0
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Small notification bubble above a character. */
export const TextPopup: React.FC<{who: Who; text: string; frame: number; at: number}> = ({who, text, frame, at}) => {
  const p = pop(frame, at, 10, 220);
  if (frame < at) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#fff',
        border: `5px solid ${INK}`,
        borderRadius: 30,
        padding: '10px 26px 10px 12px',
        transform: `scale(${1.6 * p})`,
        transformOrigin: 'top right',
        boxShadow: '0 8px 0 rgba(0,0,0,0.3)',
      }}
    >
      <Avatar who={who} size={56} />
      <div style={{fontFamily: UI_FONT, fontWeight: 800}}>
        <div style={{fontSize: 20, color: shade(who)}}>{SPEAKERS[who].name}</div>
        <div style={{fontSize: 40, color: INK, lineHeight: 1}}>{text}</div>
      </div>
    </div>
  );
};
