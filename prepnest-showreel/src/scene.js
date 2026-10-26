// PrepNest showreel: every pixel is drawn with Canvas2D code.
// render(t) draws the frame at time t (seconds). 25 s at 60 fps.
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const BUF = [mk(), mk(), mk(), mk()];

// Brand palette, taken from getprepnest.com
const C = {
  dark: '#13110E', dark2: '#1C1915', dark3: '#24211C', darkLine: '#2E2A24',
  forest: '#1F3D2E', forest2: '#2C5A42', forestDeep: '#152B20', forestLite: '#9BC2A7',
  cream: '#F6F1E8', surface: '#FBF8F2', raised: '#FFFFFF', sunken: '#EEE7DA',
  gold: '#C4A36B', goldD: '#A6824A', goldL: '#D8BD87', goldSoft: '#F1E8D6',
  ink: '#1B1A17', ink2: '#4A4640', ink3: '#6B655B', ink4: '#9A9183', paleInk: '#C4BBAB', creamInk: '#F3ECDF',
  hair: '#E2D9C8', soft: '#E4EBE3', danger: '#8A2E2A', dangerL: '#E39A90', teal: '#2E8B7A',
};

// ---------- math / easing ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  outExpo: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  inExpo: t => t <= 0 ? 0 : Math.pow(2, 10 * t - 10),
  inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  inOutQuint: t => t < .5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  outQuint: t => 1 - Math.pow(1 - t, 5),
  outBack: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
// damped spring 0 -> 1 with overshoot
const spring = (t, f = 2.2, d = 7) => t <= 0 ? 0 : 1 - Math.exp(-d * t) * Math.cos(2 * Math.PI * f * t);
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const BEAT = 0.5;
// kick envelope, matches the drum pattern in music.py
function kick(t) {
  const on = (t >= 4 && t < 20) || (t >= 22 && t < 24);
  if (!on) return 0;
  const ph = (t % BEAT);
  return Math.exp(-ph * 9);
}

// ---------- drawing helpers ----------
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function fontStr(size, w = 400, fam = 'serif', it = false) {
  return `${it ? 'italic ' : ''}${w} ${size}px ${fam === 'sans' ? 'Inter' : 'Fraunces'}`;
}
function txt(c, s, x, y, o = {}) {
  c.save();
  c.font = fontStr(o.size || 40, o.w || 400, o.fam || 'serif', o.it);
  c.letterSpacing = (o.ls || 0) + 'px';
  c.fillStyle = o.color || C.ink;
  c.textAlign = o.align || 'left';
  c.textBaseline = o.base || 'alphabetic';
  if (o.alpha !== undefined) c.globalAlpha *= o.alpha;
  c.fillText(s, x, y);
  c.restore();
}
function measure(c, s, size, w = 400, fam = 'serif', it = false, ls = 0) {
  c.save(); c.font = fontStr(size, w, fam, it); c.letterSpacing = ls + 'px';
  const m = c.measureText(s).width; c.restore(); return m;
}
// Rich line with per-word "rise from mask" reveal.
// parts: [{s, it, color, w}]  o: {size, fam, start, stagger, dur, align, t, ls}
function richLine(c, parts, x, y, o) {
  const size = o.size, fam = o.fam || 'serif';
  const words = [];
  for (const p of parts) for (const tk of p.s.split(/(?<= )/)) if (tk) words.push({ ...p, s: tk });
  let total = 0; const ws = words.map(wd => { const m = measure(c, wd.s, size, wd.w || o.w || 400, fam, wd.it, o.ls || 0); total += m; return m; });
  let cx = x - (o.align === 'center' ? total / 2 : o.align === 'right' ? total : 0);
  const t = o.t ?? 99, st = o.start ?? 0, stag = o.stagger ?? 0.06, dur = o.dur ?? 0.7;
  words.forEach((wd, i) => {
    const p = E.outExpo(seg(t, st + i * stag, st + i * stag + dur));
    if (p > 0) {
      c.save();
      c.beginPath(); c.rect(cx - 10, y - size * 1.08, ws[i] + 30, size * 1.45); c.clip();
      const dy = (1 - p) * size * 1.15;
      txt(c, wd.s, cx, y + dy, { size, w: wd.w || o.w || 400, fam, it: wd.it, color: wd.color || o.color, ls: o.ls || 0 });
      c.restore();
    }
    cx += ws[i];
  });
  return total;
}
function shadowCard(c, x, y, w, h, r, fill, sh = 0.16, blur = 50, oy = 20) {
  c.save();
  c.shadowColor = `rgba(60,45,20,${sh})`; c.shadowBlur = blur; c.shadowOffsetY = oy;
  rr(c, x, y, w, h, r); c.fillStyle = fill; c.fill();
  c.restore();
}
function label(c, s, x, y, color, t, start) {
  const p = E.outExpo(seg(t, start, start + 0.6));
  c.save(); c.globalAlpha *= p;
  c.fillStyle = color; c.fillRect(x, y - 9, 48 * p, 3);
  txt(c, s, x + 66 - (1 - p) * 20, y, { size: 24, w: 600, fam: 'sans', ls: 5, color });
  c.restore();
}
function fmtMoney(v) { return '$' + v.toFixed(2); }
function fmtInt(v) { return Math.round(v).toLocaleString('en-US'); }

// ---------- logo (egg in a nest), 1024-unit space ----------
function quadPts(x0, y0, cx, cy, x1, y1, n = 48) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1]); }
  return pts;
}
const STRANDS = {
  back: { pts: quadPts(262, 538, 512, 446, 762, 538), col: C.goldD, w: 30 },
  s1: { pts: quadPts(252, 540, 512, 682, 774, 540), col: C.goldL, w: 46 },
  s2: { pts: quadPts(296, 620, 512, 752, 730, 620), col: C.gold, w: 46 },
  s3: { pts: quadPts(356, 696, 512, 800, 668, 696), col: C.goldD, w: 46 },
};
function strokePartial(c, pts, p, fromCenter = true) {
  if (p <= 0) return;
  const n = pts.length - 1;
  let a = 0, b = n;
  if (fromCenter) { a = Math.floor(n / 2 - p * n / 2); b = Math.ceil(n / 2 + p * n / 2); }
  else b = Math.ceil(p * n);
  c.beginPath(); c.moveTo(pts[a][0], pts[a][1]);
  for (let i = a + 1; i <= b; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.stroke();
}
// st: {egg, back, s1, s2, s3, border, bg} each 0..1
function drawLogo(c, cx, cy, s, st) {
  c.save(); c.translate(cx, cy); c.scale(s, s); c.translate(-512, -512);
  c.lineCap = 'round'; c.lineJoin = 'round';
  if (st.bg) { c.save(); c.globalAlpha *= st.bg; rr(c, 92, 92, 840, 840, 170); c.fillStyle = '#1B3628'; c.fill(); c.restore(); }
  if (st.border > 0) {
    c.save(); c.strokeStyle = C.gold; c.lineWidth = 9;
    const per = 4 * (840 - 340) + 2 * Math.PI * 170;
    c.setLineDash([per * st.border, per]); c.lineDashOffset = -per * 0.125;
    rr(c, 92, 92, 840, 840, 170); c.stroke(); c.restore();
  }
  const S = STRANDS;
  c.strokeStyle = S.back.col; c.lineWidth = S.back.w; strokePartial(c, S.back.pts, st.back);
  if (st.egg > 0) {
    c.save();
    c.translate(512, 440); c.scale(st.egg, st.egg);
    c.shadowColor = 'rgba(246,241,232,0.35)'; c.shadowBlur = st.glow ? 60 * st.glow : 0;
    c.beginPath(); c.ellipse(0, 0, 150, 186, 0, 0, Math.PI * 2); c.fillStyle = st.eggCol || C.cream; c.fill();
    c.restore();
  }
  for (const k of ['s1', 's2', 's3']) { c.strokeStyle = S[k].col; c.lineWidth = S[k].w; strokePartial(c, S[k].pts, st[k]); }
  c.restore();
}

// ---------- vector food ----------
function food(c, kind, x, y, r, seed = 1) {
  const R = rng(seed * 977 + kind.length * 31);
  c.save(); c.translate(x, y);
  const plate = (rim, inner) => {
    c.save(); c.shadowColor = 'rgba(40,30,15,0.28)'; c.shadowBlur = r * 0.25; c.shadowOffsetY = r * 0.08;
    c.beginPath(); c.arc(0, 0, r, 0, 7); c.fillStyle = rim; c.fill(); c.restore();
    c.beginPath(); c.arc(0, 0, r * 0.84, 0, 7); c.fillStyle = inner; c.fill();
    c.beginPath(); c.arc(0, 0, r * 0.84, 0, 7); c.clip();
  };
  const dots = (n, cx, cy, rad, sz, cols, squash = 1) => {
    for (let i = 0; i < n; i++) {
      const a = R() * 6.283, d = Math.sqrt(R()) * rad;
      c.beginPath(); c.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, sz * (0.8 + R() * 0.4), sz * squash * (0.8 + R() * 0.4), R() * 3, 0, 7);
      c.fillStyle = cols[Math.floor(R() * cols.length)]; c.fill();
    }
  };
  const leaf = (lx, ly, s, rot, col) => { c.save(); c.translate(lx, ly); c.rotate(rot); c.beginPath(); c.ellipse(0, 0, s, s * 0.45, 0, 0, 7); c.fillStyle = col; c.fill(); c.restore(); };
  if (kind === 'burrito') {
    plate('#25406B', '#EFE8DA');
    dots(70, -r * 0.4, -r * 0.25, r * 0.38, r * 0.05, ['#FBF8F0', '#F1ECE0', '#E9E2D2'], 0.45); // rice
    dots(46, -r * 0.1, r * 0.45, r * 0.33, r * 0.055, ['#2A2220', '#3A2C27', '#1E1917'], 0.7); // beans
    dots(55, r * 0.45, r * 0.18, r * 0.3, r * 0.05, ['#F4C542', '#F7D25C', '#E8B12A']); // corn
    for (let i = 0; i < 9; i++) { c.save(); c.translate(r * (0.25 + R() * 0.35), -r * (0.25 + R() * 0.35)); c.rotate(R() * 3); rr(c, -r * 0.16, -r * 0.035, r * 0.32, r * 0.07, r * 0.03); c.fillStyle = ['#D8432E', '#E9A23B', '#C93624'][i % 3]; c.fill(); c.restore(); }
    for (let i = 0; i < 7; i++) { c.save(); c.translate(-r * 0.05 + (R() - .5) * r * 0.35, -r * 0.42 + (R() - .5) * r * 0.25); c.rotate(R() * 3); rr(c, -r * 0.1, -r * 0.07, r * 0.2, r * 0.14, r * 0.04); c.fillStyle = ['#C9874B', '#B97437', '#D79A5C'][i % 3]; c.fill(); c.restore(); }
    c.beginPath(); c.moveTo(r * 0.12, -r * 0.05); c.arc(r * 0.12, -r * 0.05, r * 0.24, -0.4, 1.3); c.closePath(); c.fillStyle = '#93BE45'; c.fill();
    c.beginPath(); c.moveTo(r * 0.12, -r * 0.05); c.arc(r * 0.12, -r * 0.05, r * 0.19, -0.4, 1.3); c.closePath(); c.fillStyle = '#C9E07A'; c.fill();
    for (let i = 0; i < 8; i++) leaf(-r * 0.35 + R() * r * 0.5, -r * 0.1 + R() * r * 0.3, r * 0.05, R() * 3, '#3F7D3A');
  } else if (kind === 'salmon') {
    plate('#E9E1D2', '#F7F3EC');
    for (let i = 0; i < 6; i++) { c.save(); c.translate(-r * 0.05, r * 0.35); c.rotate(-0.35 + i * 0.07); rr(c, -r * 0.6, -r * 0.035 + i * r * 0.075, r * 1.1, r * 0.06, r * 0.03); c.fillStyle = i % 2 ? '#5E8F3A' : '#6FA344'; c.fill(); c.fillStyle = '#3F6B2A'; c.beginPath(); c.ellipse(r * 0.48, i * r * 0.075, r * 0.07, r * 0.035, 0, 0, 7); c.fill(); c.restore(); }
    c.save(); c.translate(-r * 0.08, -r * 0.15); c.rotate(-0.25); rr(c, -r * 0.48, -r * 0.26, r * 0.96, r * 0.52, r * 0.2); c.fillStyle = '#EE8A5E'; c.fill();
    c.strokeStyle = 'rgba(255,214,190,0.7)'; c.lineWidth = r * 0.03; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * r * 0.12 - r * 0.05, -r * 0.24); c.quadraticCurveTo(i * r * 0.12 + r * 0.08, 0, i * r * 0.12 - r * 0.05, r * 0.24); c.stroke(); }
    c.fillStyle = 'rgba(190,90,40,0.35)'; rr(c, -r * 0.48, r * 0.1, r * 0.96, r * 0.16, r * 0.08); c.fill(); c.restore();
    c.beginPath(); c.arc(r * 0.5, -r * 0.42, r * 0.17, 0, 7); c.fillStyle = '#F2D24B'; c.fill(); c.beginPath(); c.arc(r * 0.5, -r * 0.42, r * 0.13, 0, 7); c.fillStyle = '#F8E78A'; c.fill();
    dots(14, -r * 0.1, -r * 0.18, r * 0.35, r * 0.025, ['#4E7D2E', '#F5E7B5']);
  } else if (kind === 'shakshuka') {
    c.save(); c.fillStyle = '#1F1C19'; rr(c, r * 0.8, -r * 0.09, r * 0.55, r * 0.18, r * 0.08); c.fill(); c.restore();
    plate('#2B2622', '#B83A22');
    dots(30, 0, 0, r * 0.75, r * 0.07, ['#A52E1A', '#C8492C', '#992817']);
    for (const [ex, ey] of [[-r * 0.3, -r * 0.25], [r * 0.32, -r * 0.1], [-r * 0.05, r * 0.38]]) {
      c.beginPath(); c.ellipse(ex, ey, r * 0.24, r * 0.21, R(), 0, 7); c.fillStyle = '#FAF6EE'; c.fill();
      c.beginPath(); c.arc(ex + r * 0.02, ey, r * 0.1, 0, 7); c.fillStyle = '#F4AE1A'; c.fill();
      c.beginPath(); c.arc(ex - r * 0.01, ey - r * 0.03, r * 0.03, 0, 7); c.fillStyle = 'rgba(255,255,255,0.6)'; c.fill();
    }
    for (let i = 0; i < 14; i++) leaf((R() - .5) * r * 1.3, (R() - .5) * r * 1.3, r * 0.05, R() * 3, '#3F7D3A');
    dots(10, 0, 0, r * 0.7, r * 0.04, ['#F3EEE4']);
  } else if (kind === 'parfait') {
    plate('#F2EDE4', '#F8F5EF');
    dots(40, r * 0.25, r * 0.2, r * 0.4, r * 0.07, ['#C79A5B', '#B5854A', '#D9AE6E']);
    dots(16, -r * 0.25, -r * 0.2, r * 0.35, r * 0.11, ['#36427E', '#2D3870', '#43508F']);
    dots(9, -r * 0.1, r * 0.25, r * 0.4, r * 0.12, ['#C2263A', '#D73A4C']);
    leaf(r * 0.15, -r * 0.35, r * 0.13, 0.6, '#5A9A48'); leaf(r * 0.28, -r * 0.3, r * 0.11, 1.4, '#6CAF57');
  } else if (kind === 'hummus') {
    plate('#C46A45', '#E9D3A6');
    c.strokeStyle = 'rgba(190,150,90,0.55)'; c.lineWidth = r * 0.03; for (let i = 1; i < 4; i++) { c.beginPath(); c.arc(0, 0, r * 0.18 * i, 0.3 * i, 0.3 * i + 4.5); c.stroke(); }
    c.beginPath(); c.arc(0, 0, r * 0.14, 0, 7); c.fillStyle = '#D9B13C'; c.fill();
    dots(18, r * 0.35, r * 0.3, r * 0.22, r * 0.07, ['#D8B278', '#CDA468']);
    for (let i = 0; i < 4; i++) { const a = -2.4 + i * 0.45; c.beginPath(); c.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.13, 0, 7); c.fillStyle = '#5E9B48'; c.fill(); c.beginPath(); c.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.1, 0, 7); c.fillStyle = '#CFE3A6'; c.fill(); }
    for (let i = 0; i < 3; i++) { const a = 0.9 + i * 0.5; c.beginPath(); c.arc(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6 - r * 0.05, r * 0.1, 0, 7); c.fillStyle = '#D93A2B'; c.fill(); }
    dots(16, 0, 0, r * 0.3, r * 0.02, ['#B8442A']);
  } else if (kind === 'pancakes') {
    plate('#E9E1D2', '#F7F3EC');
    for (let i = 3; i >= 0; i--) { c.beginPath(); c.arc(-i * r * 0.03, -i * r * 0.04, r * 0.6, 0, 7); c.fillStyle = i ? '#C78B3F' : '#D9A35A'; c.fill(); }
    c.beginPath(); c.arc(0, 0, r * 0.45, 0, 7); c.fillStyle = '#E2B067'; c.fill();
    rr(c, -r * 0.12, -r * 0.14, r * 0.24, r * 0.2, r * 0.04); c.fillStyle = '#F8E7A6'; c.fill();
    dots(10, r * 0.2, r * 0.25, r * 0.25, r * 0.08, ['#36427E', '#C2263A']);
  } else if (kind === 'fajita') {
    plate('#2B2622', '#EDE6D6');
    dots(80, r * 0.25, r * 0.15, r * 0.45, r * 0.05, ['#FBF8F0', '#F3EEE2'], 0.8);
    for (let i = 0; i < 12; i++) { c.save(); c.translate(-r * 0.25 + (R() - .5) * r * 0.5, -r * 0.1 + (R() - .5) * r * 0.6); c.rotate(R() * 3); rr(c, -r * 0.18, -r * 0.04, r * 0.36, r * 0.08, r * 0.04); c.fillStyle = ['#D8432E', '#E9A23B', '#6E9E3C', '#C9874B'][i % 4]; c.fill(); c.restore(); }
    c.beginPath(); c.arc(r * 0.45, -r * 0.4, r * 0.15, 0, 7); c.fillStyle = '#93BE45'; c.fill(); c.beginPath(); c.arc(r * 0.45, -r * 0.4, r * 0.11, 0, 7); c.fillStyle = '#C9E07A'; c.fill();
  } else if (kind === 'pasta') {
    plate('#E9E1D2', '#F7F3EC');
    c.strokeStyle = '#E9C46A'; c.lineWidth = r * 0.045;
    for (let i = 0; i < 16; i++) { c.beginPath(); const a = R() * 6, b = r * 0.2 + R() * r * 0.4; c.arc((R() - .5) * r * 0.3, (R() - .5) * r * 0.3, b, a, a + 2 + R() * 2); c.stroke(); }
    c.beginPath(); c.arc(0, 0, r * 0.4, 0, 7); c.fillStyle = 'rgba(184,58,34,0.85)'; c.fill();
    for (const [mx, my] of [[-r * 0.15, -r * 0.1], [r * 0.18, -r * 0.05], [0, r * 0.2]]) { c.beginPath(); c.arc(mx, my, r * 0.14, 0, 7); c.fillStyle = '#7A3E25'; c.fill(); c.beginPath(); c.arc(mx - r * 0.03, my - r * 0.04, r * 0.05, 0, 7); c.fillStyle = 'rgba(255,255,255,0.15)'; c.fill(); }
    leaf(r * 0.05, -r * 0.3, r * 0.1, 0.4, '#3F7D3A'); leaf(-r * 0.25, r * 0.15, r * 0.08, 2, '#4E9A45');
  }
  c.restore();
  // glossy rim highlight
  c.save(); c.translate(x, y); c.beginPath(); c.arc(0, 0, r * 0.92, 3.6, 4.6); c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = r * 0.05; c.lineCap = 'round'; c.stroke(); c.restore();
}

// ---------- icons ----------
const SHIELD = new Path2D('M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z');
const CHECK = new Path2D('M8.5 12l2.5 2.5 4.5-5');
function checkIcon(c, x, y, s, col, p = 1, lw = 2.6) {
  c.save(); c.translate(x - s / 2, y - s / 2); c.scale(s / 24, s / 24);
  c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round';
  c.setLineDash([12 * p, 20]); c.beginPath(); c.moveTo(6.5, 12.5); c.lineTo(10, 16); c.lineTo(17.5, 8); c.stroke();
  c.restore();
}

// ---------- phone ----------
function phone(c, cx, cy, h, rot, screenFn) {
  const w = h * 0.488;
  c.save(); c.translate(cx, cy); c.rotate(rot);
  c.save(); c.shadowColor = 'rgba(40,28,10,0.38)'; c.shadowBlur = 90; c.shadowOffsetY = 50; c.shadowOffsetX = -10;
  rr(c, -w / 2, -h / 2, w, h, w * 0.17); c.fillStyle = '#0E0D0B'; c.fill(); c.restore();
  rr(c, -w / 2 + 1.5, -h / 2 + 1.5, w - 3, h - 3, w * 0.17); c.strokeStyle = '#4A443B'; c.lineWidth = 3; c.stroke();
  const b = w * 0.036, sw = w - 2 * b, sh = h - 2 * b;
  c.save(); rr(c, -sw / 2, -sh / 2, sw, sh, w * 0.135); c.clip(); c.translate(-sw / 2, -sh / 2);
  const s = sw / 390; c.scale(s, s);
  const SH = sh / s;
  c.fillStyle = C.cream; c.fillRect(0, 0, 390, SH);
  screenFn(c, 390, SH);
  // status bar
  c.fillStyle = C.cream; c.fillRect(0, 0, 390, 54);
  txt(c, '9:41', 44, 38, { size: 16, w: 600, fam: 'sans', color: C.ink });
  c.fillStyle = C.ink; for (let i = 0; i < 4; i++) c.fillRect(300 + i * 6, 34 - i * 3, 4, 4 + i * 3);
  rr(c, 332, 24, 26, 13, 4); c.strokeStyle = C.ink; c.lineWidth = 1.5; c.stroke(); c.fillRect(334, 26, 19, 9);
  // home indicator
  rr(c, 130, SH - 14, 130, 5, 3); c.fillStyle = 'rgba(27,26,23,0.85)'; c.fill();
  c.restore();
  rr(c, -w * 0.155, -h / 2 + b + w * 0.032, w * 0.31, w * 0.088, w * 0.05); c.fillStyle = '#0B0A09'; c.fill();
  // glass sheen
  c.save(); rr(c, -sw / 2, -sh / 2, sw, sh, w * 0.135); c.clip();
  const g = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(0.4, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h); c.restore();
  c.restore();
}
function tabBar(c, W2, H2, active) {
  c.fillStyle = 'rgba(251,248,242,0.96)'; c.fillRect(0, H2 - 84, W2, 84);
  c.fillStyle = C.hair; c.fillRect(0, H2 - 84, W2, 1);
  ['Plan', 'Groceries', 'Cook', 'You'].forEach((n, i) => {
    const x = 49 + i * 97, on = i === active;
    c.beginPath(); c.arc(x, H2 - 58, 10, 0, 7); c.strokeStyle = on ? C.forest : C.ink4; c.lineWidth = 2; c.stroke();
    if (on) { c.fillStyle = C.forest; c.fill(); }
    txt(c, n, x, H2 - 32, { size: 11, w: on ? 600 : 500, fam: 'sans', color: on ? C.forest : C.ink4, align: 'center' });
  });
}

// ---------- backgrounds / fx ----------
function bgSolid(c, col) { c.fillStyle = col; c.fillRect(0, 0, W, H); }
function bgRadial(c, inner, outer, x = W / 2, y = H / 2, r = 1300) {
  const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, inner); g.addColorStop(1, outer);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function blobs(c, t, cols) {
  cols.forEach((col, i) => {
    const x = W * (0.2 + 0.6 * ((i * 0.37) % 1)) + Math.sin(t * 0.6 + i * 2) * 60;
    const y = H * (0.3 + 0.5 * ((i * 0.61) % 1)) + Math.cos(t * 0.5 + i) * 50;
    const g = c.createRadialGradient(x, y, 0, x, y, 520); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  });
}
function shockwave(c, x, y, t, col, maxR = 900, dur = 0.7, lw = 10) {
  const p = seg(t, 0, dur); if (p <= 0 || p >= 1) return;
  c.save(); c.globalAlpha *= (1 - p) * 0.9; c.strokeStyle = col; c.lineWidth = lw * (1 - p) + 1;
  c.beginPath(); c.arc(x, y, E.outExpo(p) * maxR, 0, 7); c.stroke(); c.restore();
}
function burst(c, x, y, t, seed, n = 70, col = C.gold, spd = 900) {
  if (t <= 0 || t > 1.6) return;
  const R = rng(seed);
  c.save();
  for (let i = 0; i < n; i++) {
    const a = R() * 6.283, v = spd * (0.3 + R() * 0.9), sz = 2 + R() * 6, life = 0.6 + R() * 0.9;
    const k = 3.2; const d = v * (1 - Math.exp(-k * t)) / k;
    const p = t / life; if (p >= 1) continue;
    c.globalAlpha = (1 - p) * (0.6 + 0.4 * R());
    c.fillStyle = R() < 0.25 ? C.cream : col;
    c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d + 60 * t * t, sz * (1 - p * 0.5), 0, 7); c.fill();
  }
  c.restore();
}
function dust(c, t, seed, n, col, alpha = 0.5) {
  const R = rng(seed); c.save(); c.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const x0 = R() * W, y0 = R() * H, sp = 20 + R() * 50, sz = 1 + R() * 3, ph = R() * 6;
    const y = ((y0 - t * sp) % H + H) % H, x = x0 + Math.sin(t * 0.8 + ph) * 20;
    c.globalAlpha = alpha * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 2 + ph)));
    c.beginPath(); c.arc(x, y, sz, 0, 7); c.fill();
  }
  c.restore();
}
function speedRays(c, t, col, n = 48, seed = 3) {
  const R = rng(seed); c.save(); c.translate(W / 2, H / 2); c.rotate(t * 0.4); c.fillStyle = col;
  for (let i = 0; i < n; i++) { const a = i / n * 6.283 + R() * 0.05, w = 0.012 + R() * 0.025; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 1400, a, a + w); c.closePath(); c.fill(); }
  c.restore();
}

// =====================================================================
// SCENE 1: HOOK  (0 - 4 s)  "What's for dinner?" chaos -> implode
// =====================================================================
const PILLS = ['calories?', 'protein?', 'allergies?', 'budget?', 'grocery list?', "what's on sale?", 'leftovers?', 'macros?', 'which store?', "what's in the fridge?", 'prices?', 'who eats what?'];
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
function vortex(x, y, t) {
  const u = E.inCubic(seg(t, 3.0, 3.5));
  if (u <= 0) return [x, y, 1, 1];
  const dx = x - W / 2, dy = y - H / 2, a = u * 2.6, k = 1 - u;
  return [W / 2 + (dx * Math.cos(a) - dy * Math.sin(a)) * k, H / 2 + (dx * Math.sin(a) + dy * Math.cos(a)) * k, Math.max(0.02, 1 - u * 0.95), 1 - u * u];
}
function hook(c, t) {
  bgSolid(c, C.dark);
  bgRadial(c, `rgba(70,55,30,${0.35 + 0.25 * seg(t, 2, 3.4)})`, 'rgba(19,17,14,0)', W / 2, H / 2, 1100);
  const anx = seg(t, 2.0, 3.0); // anxiety, adds shake
  // day cards
  const cw = 200, ch = 250, gap = 24, x0 = (W - (7 * cw + 6 * gap)) / 2;
  DAYS.forEach((d, i) => {
    const st = 1.0 + i * 0.25; const p = spring(t - st, 2.4, 8); if (t < st) return;
    let x = x0 + i * (cw + gap) + cw / 2, y = 640;
    x += Math.sin(t * 31 + i * 7) * 6 * anx; y += Math.cos(t * 27 + i * 3) * 6 * anx;
    const [vx, vy, vs, va] = vortex(x, y, t);
    c.save(); c.translate(vx, vy); c.rotate(Math.sin(t * 20 + i) * 0.04 * anx + (1 - vs) * 2); c.scale(p * vs, p * vs); c.globalAlpha *= va;
    rr(c, -cw / 2, -ch / 2, cw, ch, 28); c.fillStyle = C.dark2; c.fill(); c.strokeStyle = C.darkLine; c.lineWidth = 2; c.stroke();
    txt(c, d, 0, -ch / 2 + 50, { size: 24, w: 600, fam: 'sans', ls: 4, color: C.ink4, align: 'center' });
    txt(c, '?', 0, 45, { size: 130, it: true, color: C.gold, align: 'center' });
    c.fillStyle = C.darkLine; rr(c, -60, 80, 120, 10, 5); c.fill(); rr(c, -40, 100, 80, 10, 5); c.fill();
    c.restore();
  });
  // headline
  {
    const mv = E.inOutQuint(seg(t, 0.95, 1.45));
    const sc = lerp(1, 0.52, mv), y = lerp(585, 270, mv);
    const [vx, vy, vs, va] = vortex(W / 2, y, t);
    c.save(); c.translate(vx + Math.sin(t * 40) * 3 * anx, vy); c.scale(sc * vs, sc * vs); c.globalAlpha *= va;
    const size = 190;
    const w1 = measure(c, "What's for ", size), w2 = measure(c, 'dinner?', size, 400, 'serif', true);
    const L = -(w1 + w2) / 2 + (w2 / 2 + measure(c, ' ', size) / 2) * (1 - E.outExpo(seg(t, 0.5, 0.85)));
    const slam = (s0, wd, x, it, col) => {
      const p = seg(t, s0, s0 + 0.32); if (p <= 0) return;
      const e = E.outExpo(p);
      c.save(); c.translate(x + wd / 2, 0); c.scale(lerp(1.55, 1, e), lerp(1.55, 1, e)); c.globalAlpha *= clamp(p * 5);
      if (p < 0.6) c.filter = `blur(${(1 - p / 0.6) * 14}px)`;
      txt(c, it ? 'dinner?' : "What's for", -wd / 2, size * 0.33, { size, it, color: col });
      c.restore();
    };
    slam(-0.2, w1 - measure(c, ' ', size), L, false, C.creamInk);
    slam(0.5, w2, L + w1, true, C.gold);
    c.restore();
  }
  // worry pills
  const R = rng(42);
  PILLS.forEach((s, i) => {
    const st = 1.55 + i * 0.118;
    const ang = R() * 6.283, rad = 0.55 + R() * 0.45;
    let x = W / 2 + Math.cos(ang) * 820 * rad, y = H / 2 + 60 + Math.sin(ang) * 400 * rad;
    x = clamp(x, 220, W - 220); y = clamp(y, 120, H - 90);
    if (t < st) return;
    const p = spring(t - st, 2.6, 9);
    const drift = (t - st);
    x += Math.cos(ang + 1.6) * drift * 40 + Math.sin(t * 29 + i) * 4 * anx; y += Math.sin(ang + 1.6) * drift * 30;
    const [vx, vy, vs, va] = vortex(x, y, t);
    const size = 30, tw = measure(c, s, size, 500, 'sans');
    c.save(); c.translate(vx, vy); c.rotate((R() - .5) * 0.25 + (1 - vs) * 3); c.scale(p * vs, p * vs); c.globalAlpha *= va;
    rr(c, -tw / 2 - 28, -32, tw + 56, 64, 32); c.fillStyle = 'rgba(36,33,28,0.95)'; c.fill();
    c.strokeStyle = i % 3 === 0 ? C.gold : '#4A443B'; c.lineWidth = 2; c.stroke();
    txt(c, s, 0, 11, { size, w: 500, fam: 'sans', color: C.creamInk, align: 'center' });
    c.restore();
  });
  // implode -> glowing egg
  const g = seg(t, 3.3, 4.0);
  if (g > 0) {
    const e = E.inExpo(g);
    c.save();
    const halo = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 80 + 500 * e);
    halo.addColorStop(0, `rgba(216,189,135,${0.25 + 0.5 * g})`); halo.addColorStop(1, 'rgba(216,189,135,0)');
    c.fillStyle = halo; c.fillRect(0, 0, W, H);
    // rotating rays
    c.globalAlpha = 0.18 * g; speedRays(c, t * 2, 'rgba(216,189,135,0.6)', 36, 9);
    c.restore();
    const s = 4 + 66 * E.inCubic(g);
    c.save(); c.translate(W / 2, H / 2); c.shadowColor = 'rgba(246,241,232,0.9)'; c.shadowBlur = 40 + 60 * g;
    c.beginPath(); c.ellipse(0, 0, s * 0.81, s, 0, 0, 7); c.fillStyle = C.cream; c.fill(); c.restore();
    const mp = E.outExpo(seg(t, 3.45, 3.8));
    txt(c, 'Meet', W / 2, H / 2 - 150 - (1 - mp) * 30, { size: 84, it: true, color: C.goldL, align: 'center', alpha: mp * (1 - seg(t, 3.92, 4.0)) });
  }
}

// =====================================================================
// SCENE 2: LOGO  (4 - 6 s)
// =====================================================================
function logoScene(c, lt) {
  bgSolid(c, C.forest);
  bgRadial(c, `rgba(60,110,80,${0.55 + 0.25 * kick(lt + 4)})`, 'rgba(21,43,32,0)', W / 2, H / 2, 1200);
  speedRays(c, lt * 0.5, 'rgba(255,255,255,0.025)', 40, 5);
  dust(c, lt + 4, 7, 50, C.goldL, 0.35);
  const mv = E.inOutQuint(seg(lt, 0.8, 1.25));
  const wordW = measure(c, 'PrepNest', 200, 500);
  const sEnd = 0.40, groupW = 840 * sEnd + 60 + wordW;
  const endCx = W / 2 - groupW / 2 + 420 * sEnd;
  const cx = lerp(W / 2, endCx, mv), cy = lerp(H / 2 + 40, 470, mv);
  const s = lerp(0.62, sEnd, mv) * (1 + 0.04 * (1 - spring(lt, 2, 6)));
  const eggS = lerp(0.62, 1, spring(lt, 2.2, 7));
  // zoom into the egg
  const z = seg(lt, 1.55, 2.0);
  const eggX = cx, eggY = cy + (440 - 512) * s;
  c.save();
  if (z > 0) { const k = Math.pow(70, E.inCubic(z)); c.translate(eggX, eggY); c.scale(k, k); c.translate(-eggX, -eggY); }
  drawLogo(c, cx, cy, s, {
    egg: eggS, glow: 1 - seg(lt, 0, 1),
    back: E.outExpo(seg(lt, 0.40, 0.8)),
    s1: E.outExpo(seg(lt, 0.05, 0.5)), s2: E.outExpo(seg(lt, 0.17, 0.62)), s3: E.outExpo(seg(lt, 0.29, 0.74)),
    border: E.inOut(seg(lt, 0.3, 0.95)),
  });
  // wordmark + tagline
  const wx = endCx + 420 * sEnd + 60;
  richLine(c, [{ s: 'PrepNest', color: C.creamInk }], wx, 545, { size: 200, w: 500, t: lt, start: 0.95, dur: 0.6 });
  richLine(c, [{ s: 'Your week, ', color: C.creamInk }, { s: 'curated.', it: true, color: C.goldL }], wx + 6, 655, { size: 74, t: lt, start: 1.1, stagger: 0.08 });
  c.restore();
  shockwave(c, W / 2, H / 2, lt, C.goldL, 1100, 0.8, 14);
  shockwave(c, W / 2, H / 2, lt - 0.08, C.cream, 800, 0.7, 6);
  burst(c, W / 2, H / 2, lt, 11, 90, C.gold, 1100);
  // flash
  c.fillStyle = `rgba(255,248,230,${0.85 * (1 - E.outCubic(seg(lt, 0, 0.3)))})`; c.fillRect(0, 0, W, H);
  if (z > 0.7) { c.fillStyle = `rgba(246,241,232,${seg(z, 0.7, 1)})`; c.fillRect(0, 0, W, H); }
}

// =====================================================================
// SCENE 3: PLAN  (6 - 10 s)
// =====================================================================
const MEALS = [
  { day: 'MONDAY, OCTOBER 26' },
  { kind: 'parfait', label: 'BREAKFAST', title: ['Greek yogurt parfait', 'with berries'], meta: '10 min · $1.96 a serving', mac: '318 kcal · 24 g protein' },
  { kind: 'burrito', label: 'LUNCH', title: ['Chicken burrito bowls'], meta: '35 min · $3.41 a serving', mac: '546 kcal · 46 g protein', chip: 'Leftovers from Sunday’s dinner' },
  { kind: 'fajita', label: 'DINNER', title: ['Chicken fajita bowls', 'with cauliflower rice'], meta: '35 min · $5.42 a serving', mac: '424 kcal · 45 g protein' },
  { day: 'TUESDAY, OCTOBER 27' },
  { kind: 'pancakes', label: 'BREAKFAST', title: ['Cottage cheese', 'protein pancakes'], meta: '20 min · $1.38 a serving', mac: '402 kcal · 33 g protein' },
  { kind: 'hummus', label: 'LUNCH', title: ['Mediterranean', 'hummus bowls'], meta: '15 min · $2.87 a serving', mac: '488 kcal · 21 g protein' },
  { kind: 'salmon', label: 'DINNER', title: ['Garlic butter salmon', 'with asparagus'], meta: '25 min · $6.10 a serving', mac: '512 kcal · 41 g protein' },
];
function mealCard(c, m, y, p, seed) {
  const h = m.chip ? 142 : 116;
  c.save(); c.globalAlpha *= clamp(p * 2); c.translate((1 - E.outExpo(p)) * 260, 0);
  shadowCard(c, 16, y, 358, h, 18, C.raised, 0.08, 18, 6);
  c.save(); rr(c, 28, y + 14, 84, 84, 14); c.clip(); c.fillStyle = '#E7DFD0'; c.fillRect(28, y + 14, 84, 84); food(c, m.kind, 70, y + 56, 44, seed); c.restore();
  txt(c, m.label, 126, y + 30, { size: 10.5, w: 600, fam: 'sans', ls: 1.4, color: C.ink3 });
  m.title.forEach((l, i) => txt(c, l, 126, y + 52 + i * 21, { size: 18.5, color: C.ink }));
  const my = y + 52 + m.title.length * 21;
  txt(c, m.meta, 126, my, { size: 12.5, fam: 'sans', color: C.ink2 });
  txt(c, m.mac, 126, my + 17, { size: 12.5, fam: 'sans', color: C.ink2 });
  if (m.chip) { rr(c, 126, my + 26, 236, 26, 13); c.fillStyle = C.sunken; c.fill(); txt(c, '↻  ' + m.chip, 138, my + 43, { size: 11.5, w: 500, fam: 'sans', color: C.ink2 }); }
  c.restore();
  return h + 12;
}
function planScreen(c, W2, H2, lt) {
  const scroll = E.inOut(seg(lt, 2.0, 3.7)) * 330;
  c.save(); c.translate(0, -scroll);
  txt(c, 'This week', 22, 100, { size: 34, color: C.ink });
  txt(c, 'Oct 26 – Nov 1 · 2,100 kcal · 150 g protein a day', 22, 124, { size: 12.5, fam: 'sans', color: C.ink3 });
  // day strip
  const act = clamp((lt - 0.5) / 0.5, 0, 6);
  const ax = 22 + 25 + act * 49.3;
  ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) => {
    const x = 22 + 25 + i * 49.3, done = act >= i;
    c.beginPath(); c.arc(x, 168, 21, 0, 7); c.fillStyle = C.surface; c.fill(); c.strokeStyle = C.hair; c.lineWidth = 1; c.stroke();
    if (done) { c.beginPath(); c.arc(x, 199, 2.6, 0, 7); c.fillStyle = C.gold; c.fill(); }
  });
  c.beginPath(); c.arc(ax, 168, 21, 0, 7); c.fillStyle = C.forest; c.fill();
  ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) => {
    const x = 22 + 25 + i * 49.3, on = Math.abs(ax - x) < 20;
    txt(c, d, x, 162, { size: 10, w: 600, fam: 'sans', color: on ? C.goldL : C.ink3, align: 'center' });
    txt(c, String(i < 6 ? 26 + i : 1), x, 179, { size: 13, w: 600, fam: 'sans', color: on ? C.creamInk : C.ink, align: 'center' });
  });
  let y = 222;
  MEALS.forEach((m, i) => {
    const p = seg(lt, 0.45 + i * 0.13, 1.05 + i * 0.13);
    if (m.day) { c.save(); c.globalAlpha *= p; txt(c, m.day, 22, y + 20, { size: 11, w: 600, fam: 'sans', ls: 1.6, color: C.ink3 }); c.fillStyle = C.hair; c.fillRect(22, y + 32, 346, 1); c.restore(); y += 44; }
    else y += mealCard(c, m, y, p, i);
  });
  c.restore();
  tabBar(c, W2, H2, 0);
}
function goalsCard(c, x, y, lt) {
  const p0 = E.outExpo(seg(lt, 0.55, 1.2));
  c.save(); c.globalAlpha *= p0; c.translate(0, (1 - p0) * 60);
  shadowCard(c, x, y, 660, 350, 30, C.raised, 0.12, 50, 18);
  txt(c, 'YOUR GOALS', x + 36, y + 52, { size: 18, w: 600, fam: 'sans', ls: 3, color: C.ink3 });
  const rows = [
    { n: 'Calories', v: 2100, f: v => fmtInt(v) + ' kcal', bar: 0.82 },
    { n: 'Protein', v: 150, f: v => fmtInt(v) + ' g', bar: 0.68 },
    { n: 'Budget', v: 120, f: v => '$' + fmtInt(v) + ' / week', bar: 0.56 },
  ];
  rows.forEach((r, i) => {
    const st = 0.75 + i * 0.18, p = E.outExpo(seg(lt, st, st + 0.8)), ry = y + 108 + i * 66;
    c.save(); c.globalAlpha *= clamp(p * 3);
    txt(c, r.n, x + 36, ry, { size: 26, w: 500, fam: 'sans', color: C.ink });
    txt(c, r.f(r.v * p), x + 624, ry, { size: 30, color: C.forest, align: 'right' });
    rr(c, x + 36, ry + 16, 588, 7, 4); c.fillStyle = C.sunken; c.fill();
    rr(c, x + 36, ry + 16, 588 * r.bar * p, 7, 4); c.fillStyle = C.forest2; c.fill();
    c.restore();
  });
  const ay = y + 312;
  const ap = seg(lt, 1.3, 1.6);
  c.save(); c.globalAlpha *= ap;
  txt(c, 'Allergies', x + 36, ay, { size: 26, w: 500, fam: 'sans', color: C.ink });
  let cx2 = x + 200;
  ['No peanuts', 'No shellfish'].forEach((s, i) => {
    const pp = spring(lt - 1.35 - i * 0.12, 2.5, 8); const tw = measure(c, s, 20, 600, 'sans');
    c.save(); c.translate(cx2 + tw / 2 + 22, ay - 8); c.scale(pp, pp);
    rr(c, -tw / 2 - 22, -22, tw + 44, 44, 22); c.fillStyle = C.soft; c.fill();
    txt(c, s, 0, 7, { size: 20, w: 600, fam: 'sans', color: C.forest, align: 'center' }); c.restore();
    cx2 += tw + 60;
  });
  c.restore();
  c.restore();
}
function badge(c, x, y, p, w, h, drawFn, dark = false) {
  if (p <= 0) return;
  const s = E.outBack(clamp(p));
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha *= clamp(p * 3);
  shadowCard(c, -w / 2, -h / 2, w, h, h / 2 > 40 ? 28 : h / 2, dark ? C.forest : C.raised, 0.22, 40, 16);
  drawFn(c);
  c.restore();
}
function planScene(c, lt) {
  bgSolid(c, C.cream);
  blobs(c, lt, ['rgba(228,235,227,0.9)', 'rgba(241,232,214,0.9)']);
  label(c, '01 — PLAN', 150, 238, C.forest2, lt, 0.1);
  richLine(c, [{ s: 'A week that fits', color: C.ink }], 150, 360, { size: 104, t: lt, start: 0.12 });
  richLine(c, [{ s: 'your goal.', it: true, color: C.forest2 }], 150, 470, { size: 104, t: lt, start: 0.3 });
  richLine(c, [{ s: 'Planned around your calories, protein, allergies and budget.', color: C.ink2 }], 152, 545, { size: 29, fam: 'sans', t: lt, start: 0.45, stagger: 0.02 });
  goalsCard(c, 150, 600, lt);
  // phone
  const pe = E.outExpo(seg(lt, 0.0, 0.9));
  const py = 560 + (1 - pe) * 1000 + Math.sin(lt * 1.4) * 8;
  phone(c, 1330, py, 970, lerp(-0.18, -0.035, pe), (cc, W2, H2) => planScreen(cc, W2, H2, lt));
  // floating badges
  badge(c, 1040, 790, seg(lt, 1.6, 2.0), 330, 120, cc => {
    const v = E.outExpo(seg(lt, 1.6, 2.3));
    txt(cc, fmtInt(546 * v), -95, 18, { size: 54, color: C.ink, align: 'center' });
    txt(cc, 'kcal', -95, 44, { size: 16, w: 600, fam: 'sans', ls: 2, color: C.ink3, align: 'center' });
    cc.fillStyle = C.hair; cc.fillRect(0, -36, 2, 72);
    txt(cc, fmtInt(46 * v) + ' g', 85, 18, { size: 54, color: C.forest2, align: 'center' });
    txt(cc, 'protein', 85, 44, { size: 16, w: 600, fam: 'sans', ls: 2, color: C.ink3, align: 'center' });
  });
  badge(c, 1700, 250, seg(lt, 2.2, 2.6), 300, 130, cc => {
    const v = E.outExpo(seg(lt, 2.2, 2.9));
    txt(cc, fmtInt(150 * v) + (v > 0.98 ? '+' : ''), 0, 18, { size: 66, color: C.goldL, align: 'center' });
    txt(cc, 'RECIPES', 0, 48, { size: 16, w: 600, fam: 'sans', ls: 4, color: C.forestLite, align: 'center' });
  }, true);
  badge(c, 1640, 880, seg(lt, 2.75, 3.15), 470, 104, cc => {
    cc.beginPath(); cc.arc(-180, 0, 30, 0, 7); cc.fillStyle = C.soft; cc.fill();
    cc.save(); cc.translate(-192, -12); cc.strokeStyle = C.forest; cc.lineWidth = 2.4; cc.lineJoin = 'round'; cc.lineCap = 'round'; cc.stroke(SHIELD); cc.stroke(CHECK); cc.restore();
    txt(cc, 'Checked against your allergies', -136, -4, { size: 21, w: 600, fam: 'sans', color: C.ink });
    txt(cc, 'Every ingredient, every recipe', -136, 24, { size: 18, fam: 'sans', color: C.ink3 });
  });
}

// =====================================================================
// SCENE 4: ALLERGY  (10 - 12 s)
// =====================================================================
const INGR = [
  ['Olive oil', 1], ['Red onion', 1], ['Avocado', 1],
  ['Chicken thighs', 1], ['Lime', 1], ['Black beans', 1], ['Peanut sauce', 0, 'Contains peanuts'], ['Sweet corn', 1], ['Jasmine rice', 1],
  ['Shrimp', 0, 'Shellfish'], ['Cilantro', 1], ['Bell peppers', 1], ['Greek yogurt', 1], ['Garlic', 1], ['Cumin', 1],
];
function allergyScene(c, lt) {
  bgSolid(c, C.forestDeep);
  bgRadial(c, `rgba(44,90,66,${0.75 + 0.2 * kick(lt + 10)})`, 'rgba(21,43,32,0)', 520, 520, 1100);
  dust(c, lt + 10, 21, 40, C.forestLite, 0.25);
  label(c, '02 — SAFE', 150, 200, C.goldL, lt, 0.0);
  // shield
  const sp = E.inOut(seg(lt, 0.0, 0.45)), ck = E.outExpo(seg(lt, 0.5, 0.75)), pop = spring(lt - 0.5, 2.4, 6);
  c.save(); c.translate(330, 390); const ss = 11 * (1 + 0.08 * (pop - 1) * -1); c.scale(ss, ss); c.translate(-12, -12);
  c.lineJoin = 'round'; c.lineCap = 'round';
  if (ck > 0) { c.save(); c.globalAlpha = 0.18 * ck; c.fillStyle = C.forestLite; c.fill(SHIELD); c.restore(); }
  c.strokeStyle = C.goldL; c.lineWidth = 1.3; c.setLineDash([62 * sp, 80]); c.stroke(SHIELD);
  c.strokeStyle = C.creamInk; c.lineWidth = 1.6; c.setLineDash([12 * ck, 20]); c.stroke(CHECK);
  c.restore();
  shockwave(c, 330, 390, lt - 0.55, C.forestLite, 380, 0.6, 8);
  richLine(c, [{ s: 'Checked against', color: C.creamInk }], 150, 690, { size: 100, t: lt, start: 0.1 });
  richLine(c, [{ s: 'your allergies.', it: true, color: C.goldL }], 150, 800, { size: 100, t: lt, start: 0.25 });
  richLine(c, [{ s: 'Every ingredient, every recipe. Free for everyone.', color: C.paleInk }], 152, 880, { size: 30, fam: 'sans', t: lt, start: 0.5, stagger: 0.03 });
  // conveyor scanner
  const CX = 1390, LINE = 560, GAP = 100;
  const k = Math.floor(lt / 0.25), fr = (lt % 0.25) / 0.25;
  const scroll = (k + E.outExpo(clamp(fr * 1.6))) * GAP;
  // avoiding chips
  const ap = E.outExpo(seg(lt, 0.05, 0.5));
  c.save(); c.globalAlpha *= ap;
  txt(c, 'AVOIDING', 1110, 162, { size: 20, w: 600, fam: 'sans', ls: 4, color: C.ink4 });
  [['Peanuts', 1250], ['Shellfish', 1430]].forEach(([s, x]) => { rr(c, x, 126, 160, 50, 25); c.strokeStyle = C.dangerL; c.lineWidth = 2; c.stroke(); txt(c, s, x + 80, 159, { size: 22, w: 600, fam: 'sans', color: C.dangerL, align: 'center' }); });
  c.restore();
  c.save(); rr(c, 1050, 210, 680, 800, 30); c.clip();
  INGR.forEach(([name, ok, why], i) => {
    const idx = i - 3;
    const y = LINE + idx * GAP - scroll + 0.0;
    if (y < 120 || y > 1080) return;
    const scanned = y <= LINE + 1;
    const tSince = (scroll - idx * GAP) / GAP * 0.25; // seconds since crossing
    let x = CX, alpha = clamp(1 - Math.abs(y - LINE) / 460);
    if (scanned && !ok) { const out = E.inCubic(seg(tSince, 0.18, 0.5)); x += out * 520; alpha *= 1 - out; }
    c.save(); c.globalAlpha *= alpha; c.translate(x, y);
    const fresh = scanned ? spring(tSince, 3, 9) : 0;
    const sc = 1 + 0.08 * (1 - clamp(tSince * 4)) * (scanned ? 1 : 0);
    c.scale(sc, sc);
    rr(c, -270, -38, 540, 76, 38);
    c.fillStyle = !scanned ? 'rgba(255,255,255,0.05)' : ok ? 'rgba(155,194,167,0.16)' : 'rgba(227,154,144,0.20)'; c.fill();
    c.strokeStyle = !scanned ? 'rgba(255,255,255,0.12)' : ok ? C.forestLite : C.dangerL; c.lineWidth = 2; c.stroke();
    txt(c, name, -232, 10, { size: 30, w: 500, fam: 'sans', color: !scanned ? C.paleInk : ok ? C.creamInk : C.dangerL });
    if (scanned && !ok) { const tw = measure(c, name, 30, 500, 'sans'); c.fillStyle = C.dangerL; c.fillRect(-236, -1, (tw + 8) * clamp(fresh), 3); txt(c, why, 150, 8, { size: 19, w: 600, fam: 'sans', color: C.dangerL, align: 'right' }); }
    if (scanned) {
      c.beginPath(); c.arc(222, 0, 22, 0, 7); c.fillStyle = ok ? C.forestLite : C.dangerL; c.fill();
      if (ok) checkIcon(c, 222, 0, 34, C.forestDeep, clamp(fresh), 3.2);
      else { c.strokeStyle = C.forestDeep; c.lineWidth = 4; c.lineCap = 'round'; const q = 8 * clamp(fresh); c.beginPath(); c.moveTo(222 - q, -q); c.lineTo(222 + q, q); c.moveTo(222 + q, -q); c.lineTo(222 - q, q); c.stroke(); }
    }
    c.restore();
  });
  c.restore();
  // scan line
  const glow = c.createLinearGradient(0, LINE - 60, 0, LINE + 60); glow.addColorStop(0, 'rgba(216,189,135,0)'); glow.addColorStop(0.5, 'rgba(216,189,135,0.22)'); glow.addColorStop(1, 'rgba(216,189,135,0)');
  c.fillStyle = glow; c.fillRect(1060, LINE - 60, 660, 120);
  c.fillStyle = C.goldL; c.fillRect(1060, LINE + 44, 660, 3);
  c.save(); c.shadowColor = C.goldL; c.shadowBlur = 20; c.fillRect(1060, LINE + 44, 660, 3); c.restore();
}

// =====================================================================
// SCENE 5: SHOP  (12 - 16 s)
// =====================================================================
const GROC = [
  { sec: 'PRODUCE' },
  { n: 'Avocado', d: '4 ct · Mission', p: 5.99, sub: '2½ left over · 3 recipes' },
  { n: 'Celery', d: '1 ct', p: 2.09, sub: '8 left over · 2 recipes' },
  { n: 'Baby spinach', d: '5 oz', p: 3.49, sub: 'Used in 3 recipes' },
  { n: 'Limes', d: '3 ct', p: 1.47, sub: 'Used in 2 recipes' },
  { sec: 'MEAT & SEAFOOD' },
  { n: 'Chicken thighs', d: '2 lb · boneless', p: 7.98, sub: 'Used in 4 recipes' },
  { n: 'Salmon fillets', d: '1 lb', p: 11.99, sub: 'Used in 1 recipe' },
  { sec: 'DAIRY & EGGS' },
  { n: 'Greek yogurt', d: '32 oz · plain', p: 5.29, sub: 'Used in 3 recipes' },
];
function odometer(c, value, x, y, size, col) {
  const places = [2, 1, 0, -1, -2];
  c.save(); c.font = fontStr(size); c.letterSpacing = '0px';
  const FIN = ['1', '0', '5', '4', '3'];
  let cx = x;
  txt(c, '$', cx, y, { size, color: col }); cx += c.measureText('$').width;
  places.forEach((k, idx) => {
    const dw = c.measureText(FIN[idx]).width;
    if (k === -1) { txt(c, '.', cx, y, { size, color: col }); cx += c.measureText('.').width; }
    const d = (value / Math.pow(10, k)) % 10;
    const base = Math.floor(d); let fr = d - base;
    if (k > -2) fr = clamp((fr - 0.85) / 0.15);
    const lead = k >= 0 && value < Math.pow(10, k) && k > 0;
    c.save(); c.beginPath(); c.rect(cx - 2, y - size * 0.95, dw + 4, size * 1.2); c.clip();
    const a = lead ? 0.18 : 1;
    txt(c, String(base % 10), cx + dw / 2, y - fr * size * 1.1, { size, color: col, alpha: a, align: 'center' });
    txt(c, String((base + 1) % 10), cx + dw / 2, y + (1 - fr) * size * 1.1, { size, color: col, alpha: a, align: 'center' });
    c.restore(); cx += dw;
  });
  c.restore();
}
function shopScreen(c, W2, H2, lt) {
  const scroll = E.inOut(seg(lt, 2.4, 3.8)) * 300;
  c.save(); c.translate(0, -scroll);
  txt(c, 'Groceries', 22, 102, { size: 36, color: C.ink });
  shadowCard(c, 16, 126, 358, 196, 22, C.surface, 0.07, 14, 4);
  txt(c, 'LEFT TO BUY', 38, 162, { size: 11.5, w: 600, fam: 'sans', ls: 1.6, color: C.ink3 });
  rr(c, 262, 146, 98, 26, 13); c.fillStyle = C.sunken; c.fill(); txt(c, '◆ Live prices', 311, 164, { size: 12, w: 500, fam: 'sans', color: C.ink, align: 'center' });
  const v = 105.43 * E.outCubic(seg(lt, 0.35, 1.45));
  odometer(c, v, 36, 222, 52, C.ink);
  txt(c, '$105.43 for the whole week · $2.92 off on sales', 38, 252, { size: 12.5, fam: 'sans', color: C.ink2, alpha: seg(lt, 1.3, 1.6) });
  const ticked = (lt >= 1.5) + (lt >= 1.75) + (lt >= 2.0) + (lt >= 2.25);
  rr(c, 38, 270, 314, 4, 2); c.fillStyle = C.hair; c.fill();
  rr(c, 38, 270, 314 * ticked / 29, 4, 2); c.fillStyle = C.forest2; c.fill();
  txt(c, `${ticked} of 29 ticked off`, 38, 300, { size: 12.5, fam: 'sans', color: C.ink2 });
  rr(c, 16, 338, 358, 50, 25); c.strokeStyle = C.hair; c.lineWidth = 1.5; c.stroke();
  txt(c, '✦  Compare stores near you', 195, 369, { size: 15, w: 600, fam: 'sans', color: C.ink, align: 'center' });
  shadowCard(c, 16, 402, 358, 76, 20, C.surface, 0.06, 12, 3);
  txt(c, 'I have the basics', 36, 432, { size: 15.5, w: 600, fam: 'sans', color: C.ink });
  txt(c, 'Salt, pepper, oil and spices stay off the list.', 36, 455, { size: 11.5, fam: 'sans', color: C.ink3 });
  const tg = E.outExpo(seg(lt, 1.15, 1.45));
  rr(c, 316, 426, 44, 26, 13); c.fillStyle = tg > 0.5 ? C.teal : '#D6CFC2'; c.fill();
  c.beginPath(); c.arc(329 + 18 * tg, 439, 11, 0, 7); c.fillStyle = '#fff'; c.fill();
  let y = 500, item = 0;
  GROC.forEach(g => {
    if (g.sec) { txt(c, g.sec, 22, y + 14, { size: 11, w: 600, fam: 'sans', ls: 1.6, color: C.ink3 }); y += 28; return; }
    const tickT = 1.5 + item * 0.25, tp = item < 4 ? E.outExpo(seg(lt, tickT, tickT + 0.25)) : 0;
    c.fillStyle = C.surface; rr(c, 16, y, 358, 74, 0); c.fill(); c.fillStyle = C.hair; c.fillRect(64, y + 73, 310, 1);
    c.beginPath(); c.arc(40, y + 37, 12, 0, 7); c.strokeStyle = tp > 0 ? C.forest2 : '#CFC6B6'; c.lineWidth = 1.6; c.stroke();
    if (tp > 0) { c.save(); c.beginPath(); c.arc(40, y + 37, 12 * spring(lt - tickT, 3, 9), 0, 7); c.fillStyle = C.forest2; c.fill(); c.restore(); checkIcon(c, 40, y + 37, 20, '#fff', tp, 3); }
    c.save(); c.globalAlpha *= 1 - 0.45 * tp;
    txt(c, g.n, 66, y + 28, { size: 17, color: C.ink });
    if (tp > 0) { c.fillStyle = C.ink3; c.fillRect(66, y + 22, measure(c, g.n, 17) * tp, 1.5); }
    txt(c, g.d, 66, y + 47, { size: 12.5, fam: 'sans', color: C.ink2 });
    txt(c, g.sub, 66, y + 63, { size: 11, fam: 'sans', color: C.ink3 });
    txt(c, fmtMoney(g.p), 360, y + 40, { size: 16, w: 600, fam: 'sans', color: C.ink, align: 'right' });
    c.restore();
    y += 74; item++;
  });
  c.restore();
  tabBar(c, W2, H2, 1);
}
function shopScene(c, lt) {
  bgSolid(c, C.cream);
  blobs(c, lt + 3, ['rgba(241,232,214,0.95)', 'rgba(228,235,227,0.8)']);
  const pe = E.outExpo(seg(lt, 0.0, 0.85));
  phone(c, 540, 560 + (1 - pe) * 900 + Math.sin(lt * 1.3) * 8, 970, lerp(0.16, 0.035, pe), (cc, W2, H2) => shopScreen(cc, W2, H2, lt));
  label(c, '03 — SHOP', 980, 200, C.forest2, lt, 0.1);
  richLine(c, [{ s: 'One list, priced', color: C.ink }], 980, 320, { size: 104, t: lt, start: 0.15 });
  richLine(c, [{ s: 'at your store.', it: true, color: C.forest2 }], 980, 430, { size: 104, t: lt, start: 0.3 });
  ['Live prices at Kroger-family stores', 'Grouped by aisle. The package math, done.', 'Clear estimates everywhere else'].forEach((s, i) => {
    const st = 0.85 + i * 0.14, p = E.outExpo(seg(lt, st, st + 0.6)), y = 525 + i * 62;
    c.save(); c.globalAlpha *= p; c.translate((1 - p) * 40, 0);
    c.beginPath(); c.arc(1000, y - 10, 17, 0, 7); c.fillStyle = C.soft; c.fill(); checkIcon(c, 1000, y - 10, 26, C.forest2, seg(lt, st + 0.1, st + 0.4), 3);
    txt(c, s, 1034, y, { size: 30, fam: 'sans', color: C.ink2 });
    c.restore();
  });
  // share-code card
  const sp = E.outExpo(seg(lt, 2.45, 2.95));
  c.save(); c.globalAlpha *= sp; c.translate(0, (1 - sp) * 80);
  shadowCard(c, 980, 730, 760, 230, 30, C.raised, 0.13, 50, 18);
  txt(c, 'Share your list', 1020, 790, { size: 38, color: C.ink });
  txt(c, 'Anyone can open it with a six-character code.', 1020, 828, { size: 22, fam: 'sans', color: C.ink3 });
  const CODE = 'K4R7NQ', AL = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let j = 0; j < 6; j++) {
    const x = 1020 + j * 110, land = 2.75 + j * 0.125, done = lt >= land;
    rr(c, x, 850, 94, 88, 16); c.fillStyle = done ? C.soft : C.sunken; c.fill();
    c.save(); c.beginPath(); c.rect(x, 850, 94, 88); c.clip();
    if (done) { const b = spring(lt - land, 3, 8); txt(c, CODE[j], x + 47, 912 + (1 - b) * 30, { size: 58, w: 500, color: C.forest, align: 'center' }); }
    else { const fi = Math.floor(lt * 60 + j * 7); const off = ((lt * 60) % 1) * 40; txt(c, AL[fi % AL.length], x + 47, 912 - off, { size: 58, w: 500, color: C.ink4, align: 'center', alpha: 0.6 }); txt(c, AL[(fi + 5) % AL.length], x + 47, 952 - off, { size: 58, w: 500, color: C.ink4, align: 'center', alpha: 0.6 }); }
    c.restore();
  }
  c.restore();
  // floating badges near phone
  badge(c, 800, 640, seg(lt, 1.45, 1.85), 290, 110, cc => {
    txt(cc, '$3.41', 0, 14, { size: 52, color: C.forest2, align: 'center' });
    txt(cc, 'A SERVING', 0, 40, { size: 15, w: 600, fam: 'sans', ls: 3, color: C.ink3, align: 'center' });
  });
  badge(c, 230, 860, seg(lt, 1.95, 2.35), 300, 110, cc => {
    txt(cc, '–$2.92', 0, 14, { size: 52, color: C.goldL, align: 'center' });
    txt(cc, 'OFF ON SALES', 0, 40, { size: 15, w: 600, fam: 'sans', ls: 3, color: C.forestLite, align: 'center' });
  }, true);
}

// =====================================================================
// SCENE 6: COOK MODE  (16 - 18 s)
// =====================================================================
const STEP = 'Rinse the rice and simmer it with 1 cup water and a pinch of salt, covered, until tender.'.split(' ');
function cookScene(c, lt) {
  bgSolid(c, C.dark);
  bgRadial(c, `rgba(120,80,30,${0.30 + 0.15 * kick(lt + 16)})`, 'rgba(19,17,14,0)', 1400, 560, 900);
  dust(c, lt + 16, 33, 40, C.goldL, 0.25);
  label(c, '04 — COOK', 150, 190, C.goldL, lt, 0.0);
  richLine(c, [{ s: 'Cook Mode, ', color: C.creamInk }, { s: 'one step at a time.', it: true, color: C.goldL }], 150, 300, { size: 80, t: lt, start: 0.05, stagger: 0.05 });
  // step progress
  txt(c, 'STEP 1 OF 5', 150, 420, { size: 22, w: 600, fam: 'sans', ls: 4, color: C.ink4, alpha: seg(lt, 0.2, 0.4) });
  for (let i = 0; i < 5; i++) { rr(c, 150 + i * 132, 442, 120, 6, 3); c.fillStyle = C.darkLine; c.fill(); }
  rr(c, 150, 442, 120 * E.outExpo(seg(lt, 0.3, 0.8)), 6, 3); c.fillStyle = C.gold; c.fill();
  // typed step
  let x = 150, y = 540; const size = 58, maxW = 880;
  c.save(); c.font = fontStr(size);
  STEP.forEach((wd, i) => {
    const w = c.measureText(wd + ' ').width;
    if (x + w - 150 > maxW) { x = 150; y += 72; }
    const st = 0.3 + i * 0.045, p = E.outExpo(seg(lt, st, st + 0.35));
    if (p > 0) txt(c, wd, x, y + (1 - p) * 20, { size, color: /1 cup|cup/.test(wd) || wd === '1' ? C.goldL : C.creamInk, alpha: p });
    x += w;
  });
  c.restore();
  txt(c, 'Amounts adjusted for 2 servings.', 150, y + 62, { size: 26, fam: 'sans', color: C.ink4, alpha: seg(lt, 1.1, 1.4) });
  // timer ring
  const CX = 1440, CY = 500, R = 250;
  const rp = E.outExpo(seg(lt, 0.0, 0.6));
  c.save(); c.translate(CX, CY); c.scale(lerp(0.7, 1, rp), lerp(0.7, 1, rp)); c.globalAlpha *= rp;
  for (let i = 0; i < 60; i++) { const a = i / 60 * 6.283 - Math.PI / 2, l = i % 5 ? 10 : 22; c.strokeStyle = i % 5 ? '#3A352D' : '#6B655B'; c.lineWidth = i % 5 ? 2 : 4; c.beginPath(); c.moveTo(Math.cos(a) * (R + 40), Math.sin(a) * (R + 40)); c.lineTo(Math.cos(a) * (R + 40 + l), Math.sin(a) * (R + 40 + l)); c.stroke(); }
  c.beginPath(); c.arc(0, 0, R, 0, 7); c.strokeStyle = C.darkLine; c.lineWidth = 26; c.stroke();
  const run = E.inOut(seg(lt, 0.65, 1.85)), remain = 18 * 60 * (1 - run);
  const frac = remain / (18 * 60);
  const g = c.createLinearGradient(-R, -R, R, R); g.addColorStop(0, C.goldL); g.addColorStop(1, C.goldD);
  c.strokeStyle = g; c.lineCap = 'round'; c.lineWidth = 26;
  if (frac > 0.002) { c.beginPath(); c.arc(0, 0, R, -Math.PI / 2, -Math.PI / 2 + frac * 6.283); c.stroke(); }
  const ha = -Math.PI / 2 + frac * 6.283;
  c.save(); c.shadowColor = C.goldL; c.shadowBlur = 30; c.beginPath(); c.arc(Math.cos(ha) * R, Math.sin(ha) * R, 16, 0, 7); c.fillStyle = C.cream; c.fill(); c.restore();
  const mm = Math.floor(remain / 60), ss = Math.floor(remain % 60);
  const done = lt > 1.86;
  if (!done) txt(c, `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, 0, 50, { size: 150, color: C.creamInk, align: 'center' });
  else { const b = spring(lt - 1.86, 3, 8); c.save(); c.scale(b, b); txt(c, 'Ready.', 0, 40, { size: 120, it: true, color: C.goldL, align: 'center' }); c.restore(); }
  txt(c, done ? 'RICE IS DONE' : 'SIMMER', 0, 110, { size: 22, w: 600, fam: 'sans', ls: 5, color: C.ink4, align: 'center' });
  c.restore();
  // steam
  c.save(); c.strokeStyle = 'rgba(246,241,232,0.10)'; c.lineWidth = 10; c.lineCap = 'round';
  for (let i = 0; i < 4; i++) { c.beginPath(); for (let k = 0; k <= 30; k++) { const yy = CY - R - 90 - k * 7, xx = CX - 75 + i * 50 + Math.sin(k * 0.3 + lt * 5 + i) * 14; k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.globalAlpha = rp; c.stroke(); }
  c.restore();
  // start timer button
  const press = lt > 0.5 && lt < 0.65 ? 0.94 : 1;
  c.save(); c.translate(CX, 905); c.scale(press, press); c.globalAlpha *= seg(lt, 0.15, 0.4);
  rr(c, -250, -44, 500, 88, 44); c.fillStyle = lt > 0.5 ? C.gold : 'rgba(0,0,0,0)'; c.fill(); c.strokeStyle = C.gold; c.lineWidth = 2.5; c.stroke();
  txt(c, lt > 0.5 ? '⏱  Timer running' : '⏱  Start 18-minute timer', 0, 11, { size: 30, w: 600, fam: 'sans', color: lt > 0.5 ? C.dark : C.creamInk, align: 'center' });
  c.restore();
  txt(c, 'We’ll alert you even if you leave the app.', CX, 990, { size: 22, fam: 'sans', color: C.ink4, align: 'center', alpha: seg(lt, 0.6, 0.9) });
  if (lt > 0.5) shockwave(c, CX, 905, lt - 0.5, C.goldL, 300, 0.5, 4);
  if (done) { shockwave(c, CX, CY, lt - 1.86, C.goldL, 500, 0.5, 8); }
}

// =====================================================================
// SCENE 7: COOK ONCE, EAT TWICE  (18 - 20 s)
// =====================================================================
function containerBody(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.save(); c.shadowColor = 'rgba(40,30,15,0.25)'; c.shadowBlur = 30; c.shadowOffsetY = 14;
  rr(c, -150, -110, 300, 220, 36); c.fillStyle = '#F3EEE6'; c.fill(); c.restore();
  rr(c, -150, -110, 300, 220, 36); c.strokeStyle = 'rgba(160,150,135,0.6)'; c.lineWidth = 4; c.stroke();
  c.restore();
}
function containerLid(c, x, y, s, lid) {
  if (lid <= 0) return;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.globalAlpha *= clamp(lid * 3); c.translate(0, -(1 - E.outCubic(lid)) * 160);
  c.save(); c.shadowColor = 'rgba(20,30,20,0.3)'; c.shadowBlur = 20; c.shadowOffsetY = 8;
  rr(c, -162, -122, 324, 244, 42); c.fillStyle = C.forest; c.fill(); c.restore();
  rr(c, -110, -60, 220, 24, 12); c.fillStyle = 'rgba(255,255,255,0.14)'; c.fill();
  txt(c, 'TUE', 0, 22, { size: 30, w: 600, fam: 'sans', ls: 6, color: C.goldL, align: 'center' });
  txt(c, 'Lunch', 0, 70, { size: 40, it: true, color: C.creamInk, align: 'center' });
  c.restore();
}
function cookOnceScene(c, lt) {
  bgSolid(c, C.cream);
  blobs(c, lt + 5, ['rgba(241,232,214,0.95)', 'rgba(228,235,227,0.9)']);
  richLine(c, [{ s: 'Cook once, ', color: C.ink }, { s: 'eat twice.', it: true, color: C.forest2 }], W / 2, 220, { size: 120, t: lt, start: 0.0, align: 'center', stagger: 0.07 });
  richLine(c, [{ s: 'Tonight’s dinner becomes tomorrow’s lunch.', color: C.ink2 }], W / 2, 300, { size: 34, fam: 'sans', t: lt, start: 0.2, align: 'center', stagger: 0.03 });
  const cards = [[600, 'MONDAY · DINNER', 0.1], [1320, 'TUESDAY · LUNCH', 0.22]];
  cards.forEach(([x, l, st]) => {
    const p = spring(lt - st, 2.2, 8); if (lt < st) return;
    c.save(); c.translate(x, 680); c.scale(p, p);
    shadowCard(c, -280, -260, 560, 520, 36, C.raised, 0.14, 60, 22);
    txt(c, l, 0, -200, { size: 20, w: 600, fam: 'sans', ls: 4, color: C.ink3, align: 'center' });
    txt(c, 'Chicken burrito bowls', 0, 210, { size: 36, color: C.ink, align: 'center' });
    c.restore();
  });
  if (lt > 0.1) food(c, 'burrito', 600, 690, 150 * spring(lt - 0.15, 2.2, 8), 3);
  // arrow
  const ar = E.inOut(seg(lt, 0.4, 0.85));
  if (ar > 0) { c.save(); c.strokeStyle = C.gold; c.lineWidth = 6; c.lineCap = 'round'; c.setLineDash([2, 18]); strokePartial(c, quadPts(895, 600, 960, 470, 1025, 600), ar, false); c.restore(); }
  // flying portion
  const f = seg(lt, 0.55, 1.15);
  const lid = seg(lt, 1.2, 1.45);
  const cs = spring(lt - 0.25, 2.2, 8) * (1 + 0.05 * Math.sin(seg(lt, 1.15, 1.35) * Math.PI));
  if (lt > 0.25) containerBody(c, 1320, 690, cs);
  if (f > 0) {
    const e = E.inOut(f);
    const x = lerp(600, 1320, e), y = 690 - Math.sin(e * Math.PI) * 170;
    const sc = 0.62 * E.outBack(clamp(f * 3)) * (1 + 0.15 * Math.sin(e * Math.PI));
    c.save(); c.translate(x, y); c.rotate(e * 6.283); food(c, 'burrito', 0, 0, 150 * sc, 3); c.restore();
  }
  containerLid(c, 1320, 690, cs, lid);
  if (lt > 1.15) burst(c, 1320, 690, lt - 1.15, 77, 40, C.gold, 600);
  const cp = spring(lt - 1.4, 2.6, 8);
  if (lt > 1.4) {
    c.save(); c.translate(1320, 975); c.scale(cp, cp);
    const s = '↻  Leftovers from Monday’s dinner', tw = measure(c, s, 26, 500, 'sans');
    rr(c, -tw / 2 - 30, -32, tw + 60, 64, 32); c.fillStyle = C.forest; c.fill();
    txt(c, s, 0, 9, { size: 26, w: 500, fam: 'sans', color: C.creamInk, align: 'center' }); c.restore();
  }
}

// =====================================================================
// SCENE 8: RECAP  (20 - 22 s)
// =====================================================================
function recapScene(c, lt) {
  const words = [['Plan.', C.forest, C.creamInk, C.goldL], ['Shop.', C.gold, C.forest, C.forest2], ['Cook.', C.cream, C.ink, C.gold]];
  if (lt < 1.5) {
    const i = Math.floor(lt / 0.5), l = lt - i * 0.5, [w, bg, fg, acc] = words[i];
    bgSolid(c, bg);
    c.save(); c.globalAlpha = 0.12; speedRays(c, lt * 3 + i, fg, 44, 4 + i); c.restore();
    const p = E.outExpo(seg(l, 0, 0.3));
    c.save(); c.translate(W / 2, H / 2 + 20); c.scale(lerp(1.5, 1, p) + l * 0.12, lerp(1.5, 1, p) + l * 0.12); c.rotate((1 - p) * -0.06);
    if (p < 0.5) c.filter = `blur(${(1 - p / 0.5) * 16}px)`;
    txt(c, w, 0, 110, { size: 340, it: i === 1, color: fg, align: 'center' });
    c.restore();
    txt(c, `0${i + 1}`, W / 2, 250, { size: 30, w: 600, fam: 'sans', ls: 8, color: acc, align: 'center', alpha: p });
  } else {
    const l = lt - 1.5;
    bgSolid(c, C.dark);
    bgRadial(c, 'rgba(90,70,40,0.5)', 'rgba(19,17,14,0)', W / 2, H / 2, 900);
    const imp = E.inExpo(seg(l, 0.22, 0.42));
    c.save(); c.translate(W / 2, H / 2); c.scale(1 - imp * 0.97, 1 - imp * 0.97); c.globalAlpha *= 1 - imp;
    const ws = ['Plan.', 'Shop.', 'Cook.'], cols = [C.creamInk, C.goldL, C.creamInk];
    const tot = ws.reduce((a, s, i) => a + measure(c, s + ' ', 150, 400, 'serif', i === 1), 0);
    let x = -tot / 2;
    ws.forEach((s, i) => { const p = E.outExpo(seg(l, i * 0.05, i * 0.05 + 0.25)); txt(c, s, x, 50 + (1 - p) * 60, { size: 150, it: i === 1, color: cols[i], alpha: p }); x += measure(c, s + ' ', 150, 400, 'serif', i === 1); });
    c.restore();
    if (l > 0.3) { const e = seg(l, 0.3, 0.5); c.save(); c.shadowColor = C.cream; c.shadowBlur = 40; c.beginPath(); c.ellipse(W / 2, H / 2, 10 + 30 * e, 12 + 37 * e, 0, 0, 7); c.fillStyle = C.cream; c.fill(); c.restore(); }
  }
}

// =====================================================================
// SCENE 9: END CARD  (22 - 25 s)
// =====================================================================
function endScene(c, lt) {
  bgSolid(c, C.forest);
  bgRadial(c, `rgba(60,110,80,${0.6 + 0.2 * kick(lt + 22)})`, 'rgba(21,43,32,0)', W / 2, 420, 1200);
  dust(c, lt + 22, 55, 70, C.goldL, 0.45);
  const z = 1 + 0.035 * E.outCubic(seg(lt, 0, 3));
  c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
  // logo + wordmark group
  const s = 0.29, ww = measure(c, 'PrepNest', 170, 500), gw = 840 * s + 54 + ww;
  const lx = W / 2 - gw / 2 + 420 * s, ly = 360;
  const lp = spring(lt, 2.0, 6.5);
  c.save(); c.translate(lx, ly); c.scale(lp, lp); c.translate(-lx, -ly);
  drawLogo(c, lx, ly, s, {
    bg: 1, egg: spring(lt - 0.02, 2.4, 7), glow: 1 - seg(lt, 0, 1),
    back: E.outExpo(seg(lt, 0.25, 0.6)), s1: E.outExpo(seg(lt, 0.05, 0.4)), s2: E.outExpo(seg(lt, 0.12, 0.47)), s3: E.outExpo(seg(lt, 0.19, 0.54)),
    border: E.inOut(seg(lt, 0.0, 0.6)),
  });
  c.restore();
  richLine(c, [{ s: 'PrepNest', color: C.creamInk }], lx + 420 * s + 54, ly + 60, { size: 170, w: 500, t: lt, start: 0.12, dur: 0.6 });
  richLine(c, [{ s: 'Your week, ', color: C.creamInk }, { s: 'curated.', it: true, color: C.goldL }], W / 2, 585, { size: 84, t: lt, start: 0.35, align: 'center', stagger: 0.08 });
  // launch pill
  const pp = E.outExpo(seg(lt, 0.65, 1.1));
  c.save(); c.globalAlpha *= pp; c.translate(0, (1 - pp) * 30);
  const ps = 'Coming to the App Store this November', pw = measure(c, ps, 30, 500, 'sans');
  rr(c, W / 2 - pw / 2 - 60, 650, pw + 100, 66, 33); c.fillStyle = 'rgba(255,255,255,0.07)'; c.fill(); c.strokeStyle = 'rgba(216,189,135,0.45)'; c.lineWidth = 2; c.stroke();
  const pulse = 0.5 + 0.5 * Math.sin(lt * 8);
  c.beginPath(); c.arc(W / 2 - pw / 2 - 26, 683, 8 + 6 * pulse, 0, 7); c.fillStyle = `rgba(216,189,135,${0.3 * (1 - pulse)})`; c.fill();
  c.beginPath(); c.arc(W / 2 - pw / 2 - 26, 683, 8, 0, 7); c.fillStyle = C.goldL; c.fill();
  txt(c, ps, W / 2 + 20, 694, { size: 30, w: 500, fam: 'sans', color: C.creamInk, align: 'center' });
  c.restore();
  // CTA
  const cp = spring(lt - 0.9, 2.2, 7);
  if (lt > 0.9) {
    c.save(); c.translate(W / 2, 810); c.scale(cp, cp);
    const cs = 'Join the waitlist at getprepnest.com', cw = measure(c, cs, 42, 600, 'sans') + 120;
    c.save(); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 40; c.shadowOffsetY = 14; rr(c, -cw / 2, -52, cw, 104, 52); c.fillStyle = C.cream; c.fill(); c.restore();
    c.save(); rr(c, -cw / 2, -52, cw, 104, 52); c.clip();
    for (const st of [1.5, 2.4]) { const sh = seg(lt, st, st + 0.55); if (sh > 0 && sh < 1) { const sx = lerp(-cw, cw, E.inOut(sh)); const g = c.createLinearGradient(sx - 120, 0, sx + 120, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(216,189,135,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(-cw / 2, -52, cw, 104); } }
    c.restore();
    txt(c, cs, 0, 15, { size: 42, w: 600, fam: 'sans', color: C.forest, align: 'center' });
    c.restore();
  }
  txt(c, 'Free for everyone  ·  For iPhone  ·  PrepNest Pro for more', W / 2, 945, { size: 26, w: 500, fam: 'sans', ls: 1, color: C.forestLite, align: 'center', alpha: seg(lt, 1.2, 1.6) });
  c.restore();
  shockwave(c, lx, ly, lt, C.goldL, 1300, 0.9, 16);
  shockwave(c, lx, ly, lt - 0.1, C.cream, 900, 0.8, 6);
  burst(c, lx, ly, lt, 99, 110, C.gold, 1300);
  c.fillStyle = `rgba(255,248,230,${0.9 * (1 - E.outCubic(seg(lt, 0, 0.35)))})`; c.fillRect(0, 0, W, H);
}

// =====================================================================
// TRANSITIONS + POST
// =====================================================================
function drawTo(buf, fn) { const b = buf.getContext('2d'); b.setTransform(1, 0, 0, 1, 0, 0); b.filter = 'none'; b.globalAlpha = 1; fn(b); return buf; }
function motionBlurComposite(c, src, dx, dy, n) {
  c.save(); c.globalAlpha = 1; c.drawImage(src, 0, 0);
  for (let k = 1; k < n; k++) { c.globalAlpha = 1 / (k + 1); const f = k / (n - 1) - 0.5; c.drawImage(src, dx * f, dy * f); }
  c.restore();
}
function whip(c, u, fa, fb, axis) {
  const e = E.inOutQuint(u);
  const comp = drawTo(BUF[2], b => {
    const A = drawTo(BUF[0], fa), B = drawTo(BUF[1], fb);
    if (axis === 'x') { b.drawImage(A, -e * W, 0); b.drawImage(B, (1 - e) * W, 0); }
    else { b.drawImage(A, 0, -e * H); b.drawImage(B, 0, (1 - e) * H); }
  });
  const vel = Math.sin(u * Math.PI); // 0..1..0
  const L = 460 * vel;
  const p1 = drawTo(BUF[0], b => motionBlurComposite(b, comp, axis === 'x' ? L : 0, axis === 'y' ? L : 0, 10));
  motionBlurComposite(c, p1, axis === 'x' ? L / 10 : 0, axis === 'y' ? L / 10 : 0, 10);
}
function circleWipe(c, u, fa, fb, x, y) {
  fa(c);
  const r = E.inOut(u) * 2300;
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip(); fb(c); c.restore();
  c.save(); c.strokeStyle = C.goldL; c.lineWidth = 18 * (1 - u) + 2; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); c.restore();
}
const IMPACTS = [[0, 10], [0.5, 12], [4.0, 22], [10.0, 7], [12.0, 6], [16.0, 7], [18.0, 8], [20.0, 12], [20.5, 12], [21.0, 12], [22.0, 24]];
function shake(t) {
  let a = 0; for (const [ti, amp] of IMPACTS) if (t >= ti && t < ti + 0.5) a += amp * Math.exp(-(t - ti) * 9);
  return [Math.sin(t * 91.7) * a, Math.cos(t * 77.3) * a, a];
}
let GRAIN = [];
function makeGrain() {
  const R = rng(1234);
  for (let k = 0; k < 6; k++) {
    const g = document.createElement('canvas'); g.width = W / 2; g.height = H / 2;
    const gc = g.getContext('2d'), im = gc.createImageData(W / 2, H / 2);
    for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (R() + R() + R() - 1.5) * 120; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    gc.putImageData(im, 0, 0); GRAIN.push(g);
  }
}
let VIG;
function makeVignette() {
  VIG = document.createElement('canvas'); VIG.width = W; VIG.height = H; const v = VIG.getContext('2d');
  const g = v.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.38)');
  v.fillStyle = g; v.fillRect(0, 0, W, H);
}
function post(c, t, light) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = light ? 0.35 : 0.8; c.drawImage(VIG, 0, 0);
  c.globalCompositeOperation = 'overlay'; c.globalAlpha = light ? 0.05 : 0.07;
  c.imageSmoothingEnabled = true; c.drawImage(GRAIN[Math.floor(t * 30) % GRAIN.length], 0, 0, W, H);
  c.restore();
}
function sceneAt(c, t) {
  if (t < 4) { hook(c, t); return false; }
  if (t < 6) { logoScene(c, t - 4); return false; }
  if (t < 9.8) { planScene(c, t - 6); return true; }
  if (t < 10.2) { whip(c, seg(t, 9.8, 10.2), b => planScene(b, t - 6), b => allergyScene(b, t - 10), 'x'); return true; }
  if (t < 11.8) { allergyScene(c, t - 10); return false; }
  if (t < 12.25) { circleWipe(c, seg(t, 11.8, 12.25), b => allergyScene(b, t - 10), b => shopScene(b, t - 12), 330, 390); return true; }
  if (t < 15.85) { shopScene(c, t - 12); return true; }
  if (t < 16.2) { whip(c, seg(t, 15.85, 16.2), b => shopScene(b, t - 12), b => cookScene(b, t - 16), 'y'); return false; }
  if (t < 18) { cookScene(c, t - 16); return false; }
  if (t < 20) { cookOnceScene(c, t - 18); return true; }
  if (t < 22) { recapScene(c, t - 20); return false; }
  endScene(c, t - 22); return false;
}
function render(t) {
  const c = ctx;
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.filter = 'none'; c.globalCompositeOperation = 'source-over';
  const [sx, sy, a] = shake(t);
  if (a > 0.05) {
    const comp = drawTo(BUF[3], b => sceneAt(b, t));
    const light = false; c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    const k = 1 + a * 0.0025;
    c.save(); c.translate(W / 2 + sx, H / 2 + sy); c.scale(k, k); c.drawImage(comp, -W / 2, -H / 2); c.restore();
    post(c, t, false);
  } else {
    const light = sceneAt(c, t);
    post(c, t, light);
  }
}
window.render = render;
window.ready = (async () => {
  await Promise.all([
    document.fonts.load('400 50px Fraunces'), document.fonts.load('italic 400 50px Fraunces'), document.fonts.load('500 50px Fraunces'),
    document.fonts.load('400 50px Inter'), document.fonts.load('500 50px Inter'), document.fonts.load('600 50px Inter'),
  ]);
  makeGrain(); makeVignette();
  return true;
})();
