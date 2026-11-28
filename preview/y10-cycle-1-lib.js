function final(expr) { return `$\\boldsymbol{${expr}}$`; }
function finalText(s) { return `$\\boldsymbol{\\text{${s}}}$`; }
function lines(arr) { return arr.join('<br>'); }
function three(make, specs) { return specs.map(make); }

function addFactory(items) {
  return function add(unit, topic, id, versions) {
    if (versions.length !== 3) throw new Error(id + ' needs 3 versions');
    const qs = versions.map(v => v.q);
    const as = versions.map(v => v.a);
    if (new Set(qs).size !== 3) throw new Error(id + ': repeated question');
    if (new Set(as).size !== 3) throw new Error(id + ': repeated answer');
    items.push({
      unit, topic, id,
      q: versions[0].q, a: versions[0].a,
      q2: versions[1].q, a2: versions[1].a,
      q3: versions[2].q, a3: versions[2].a
    });
  };
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const t = b; b = a % b; a = t; }
  return a || 1;
}
function frac(n, d) {
  const g = gcd(n, d);
  n /= g; d /= g;
  if (d < 0) { n = -n; d = -d; }
  if (d === 1) return String(n);
  return `\\dfrac{${n}}{${d}}`;
}
function n1(x) {
  const r = Math.round(x * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}
function n2(x) {
  const r = Math.round(x * 100) / 100;
  return Number.isInteger(r) ? String(r) : r.toFixed(2);
}
function show(x) {
  if (typeof x === 'string') return x;
  if (Number.isInteger(x)) return String(x);
  return String(Math.round(x * 1e10) / 1e10);
}
function deg(rad) { return rad * 180 / Math.PI; }
function sinD(a) { return Math.sin(a * Math.PI / 180); }
function cosD(a) { return Math.cos(a * Math.PI / 180); }
function tanD(a) { return Math.tan(a * Math.PI / 180); }
function asinD(x) { return deg(Math.asin(x)); }
function acosD(x) { return deg(Math.acos(x)); }
function atanD(x) { return deg(Math.atan(x)); }

function fbox(tex) {
  return `<div style="background:#e8f1fb;border-left:3px solid #1a3a5c;padding:5px 8px;margin:4px 0 6px;display:inline-block">$${tex}$</div>`;
}

function lbl(x, y, t, anchor) {
  return `<text x="${x}" y="${y}" font-size="13" font-family="Georgia,serif" text-anchor="${anchor || 'middle'}" fill="#111" stroke="white" stroke-width="3" paint-order="stroke">${t}</text>`;
}

function rightTri({ hyp, opp, adj, ang, unk }) {
  const C = [28, 102], A = [148, 102], B = [28, 22];
  const side = (name, val) => (unk === name ? (name === 'ang' ? 'θ' : '?') : val);
  const hypL = side('hyp', hyp);
  const oppL = side('opp', opp);
  const adjL = side('adj', adj);
  const angL = side('ang', ang + '°');
  const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
  return `<svg width="190" height="130" viewBox="-8 -8 200 140" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;display:block;margin:4px 0">
  <polygon points="${C[0]},${C[1]} ${A[0]},${A[1]} ${B[0]},${B[1]}" fill="#f4f7fb" stroke="#1a1a1a" stroke-width="2"/>
  <rect x="${C[0]}" y="${C[1] - 12}" width="12" height="12" fill="none" stroke="#1a1a1a" stroke-width="1.5"/>
  <path d="M ${A[0] - 18},${A[1]} A 18 18 0 0 0 ${A[0] - 16},${A[1] - 10}" fill="none" stroke="#1a3a5c" stroke-width="1.5"/>
  ${lbl((C[0] + A[0]) / 2, C[1] + 16, adjL)}
  ${lbl(C[0] - 14, (C[1] + B[1]) / 2 + 4, oppL)}
  ${lbl(mx + 14, my - 2, hypL)}
  ${lbl(A[0] - 28, A[1] - 16, angL)}
</svg>`;
}

function lShape({ W, H, cutW, cutH }) {
  const s = 8;
  const x0 = 20, y0 = 20;
  const w = W * s, h = H * s, cw = cutW * s, ch = cutH * s;
  const pts = `${x0},${y0 + h} ${x0 + w},${y0 + h} ${x0 + w},${y0 + ch} ${x0 + w - cw},${y0 + ch} ${x0 + w - cw},${y0} ${x0},${y0}`;
  return `<svg width="200" height="150" viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;display:block;margin:4px 0">
  <polygon points="${pts}" fill="#f4f7fb" stroke="#1a1a1a" stroke-width="2"/>
  ${lbl(x0 + (w - cw) / 2, y0 + h + 14, W + ' cm')}
  ${lbl(x0 - 16, y0 + h / 2, H + ' cm')}
  ${lbl(x0 + w - cw / 2, y0 + ch - 8, cutW + ' cm')}
  ${lbl(x0 + w + 16, y0 + ch / 2 + 4, cutH + ' cm')}
</svg>`;
}

function scaleneTri({ A, B, Cang, a, b, c, unk }) {
  const obtuse = Number(A) > 90;
  const P = obtuse
    ? { A: [90, 108], B: [168, 108], C: [28, 28] }
    : { A: [28, 108], B: [168, 108], C: [78, 22] };
  const side = (name, val) => (unk === name ? '?' : val);
  const mx = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const ab = mx(P.A, P.B), bc = mx(P.B, P.C), ca = mx(P.C, P.A);
  return `<svg width="200" height="140" viewBox="-10 -8 200 140" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;display:block;margin:4px 0">
  <polygon points="${P.A[0]},${P.A[1]} ${P.B[0]},${P.B[1]} ${P.C[0]},${P.C[1]}" fill="#f4f7fb" stroke="#1a1a1a" stroke-width="2"/>
  ${A ? lbl(P.A[0] - 12, P.A[1] - 14, A + '°') : ''}
  ${B ? lbl(P.B[0] + 12, P.B[1] - 14, B + '°') : ''}
  ${Cang ? lbl(P.C[0] + 14, P.C[1] + 22, Cang + '°') : ''}
  ${lbl(ab[0], ab[1] + 16, side('c', c))}
  ${lbl(bc[0] + 16, bc[1], side('a', a))}
  ${lbl(ca[0] - 16, ca[1], side('b', b))}
  ${lbl(P.A[0] - 4, P.A[1] + 16, 'A')}
  ${lbl(P.B[0] + 4, P.B[1] + 16, 'B')}
  ${lbl(P.C[0], P.C[1] - 10, 'C')}
</svg>`;
}

function bearingsFig({ east, north }) {
  return `<svg width="200" height="150" viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;display:block;margin:4px 0">
  <line x1="40" y1="130" x2="40" y2="18" stroke="#1a3a5c" stroke-width="1.5"/>
  <polygon points="40,14 36,24 44,24" fill="#1a3a5c"/>
  ${lbl(28, 22, 'N')}
  <line x1="40" y1="130" x2="150" y2="130" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="150" y1="130" x2="150" y2="40" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="40" y1="130" x2="150" y2="40" stroke="#1a1a1a" stroke-width="2"/>
  <circle cx="40" cy="130" r="3" fill="#1a1a1a"/>
  <circle cx="150" cy="130" r="3" fill="#1a1a1a"/>
  <circle cx="150" cy="40" r="3" fill="#1a1a1a"/>
  ${lbl(32, 144, 'A')}
  ${lbl(162, 144, 'B')}
  ${lbl(162, 38, 'C')}
  ${lbl(95, 146, east + ' km')}
  ${lbl(168, 90, north + ' km')}
  ${lbl(108, 78, '?')}
</svg>`;
}

function cuboidFig({ l, w, h }) {
  const x = 36, y = 88, dx = 70, dy = 44, dz = 28;
  const A = [x, y], B = [x + dx, y], C = [x + dx, y - dy], D = [x, y - dy];
  const E = [x + dz, y - dz], F = [x + dx + dz, y - dz], G = [x + dx + dz, y - dy - dz], H = [x + dz, y - dy - dz];
  const poly = (pts, fill) => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fill}" stroke="#1a1a1a" stroke-width="1.5"/>`;
  return `<svg width="210" height="140" viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;display:block;margin:4px 0">
  ${poly([D, C, G, H], '#eef3f8')}
  ${poly([A, B, C, D], '#f4f7fb')}
  ${poly([B, F, G, C], '#d9e4f0')}
  <line x1="${A[0]}" y1="${A[1]}" x2="${G[0]}" y2="${G[1]}" stroke="#1a3a5c" stroke-width="2"/>
  ${lbl((A[0] + B[0]) / 2, A[1] + 14, l + ' cm')}
  ${lbl(A[0] - 18, (A[1] + D[1]) / 2, h + ' cm')}
  ${lbl(B[0] + 22, (B[1] + F[1]) / 2 + 8, w + ' cm')}
</svg>`;
}

function venn({ aOnly, bOnly, both, outside, aName, bName }) {
  return `<svg width="260" height="150" viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;display:block;margin:4px 0">
  <rect x="8" y="8" width="264" height="144" fill="#fafafa" stroke="#1a1a1a" stroke-width="1.5"/>
  <circle cx="110" cy="80" r="52" fill="#d6e6f7" fill-opacity="0.55" stroke="#1a1a1a" stroke-width="1.5"/>
  <circle cx="170" cy="80" r="52" fill="#f7e2c4" fill-opacity="0.45" stroke="#1a1a1a" stroke-width="1.5"/>
  ${lbl(78, 84, String(aOnly))}
  ${lbl(140, 84, String(both))}
  ${lbl(202, 84, String(bOnly))}
  ${lbl(248, 28, String(outside))}
  ${lbl(88, 28, aName)}
  ${lbl(192, 28, bName)}
</svg>`;
}

function solve2(a1, b1, c1, a2, b2, c2) {
  const d = a1 * b2 - a2 * b1;
  const x = (c1 * b2 - c2 * b1) / d;
  const y = (a1 * c2 - a2 * c1) / d;
  return { x, y };
}

function fmtNum(x) {
  if (Number.isInteger(x)) return String(x);
  const r2 = Math.round(x * 100) / 100;
  if (Math.abs(r2 - x) < 1e-9) {
    return Number.isInteger(r2) ? String(r2) : String(r2);
  }
  return String(Math.round(x * 10) / 10);
}

function termN(n, letter, first) {
  if (n === 0) return first ? '' : '';
  const abs = Math.abs(n);
  const body = letter ? (abs === 1 ? letter : abs + letter) : String(abs);
  if (first) return (n < 0 ? '-' : '') + body;
  return (n < 0 ? '-' : '+') + body;
}

function nthLin(a, b) {
  if (a === 0) return String(b);
  const lead = a === 1 ? 'n' : a === -1 ? '-n' : a + 'n';
  if (b === 0) return lead;
  return lead + (b > 0 ? '+' + b : String(b));
}

function nthQuad(a, b, c) {
  let s = a === 1 ? 'n^{2}' : a === -1 ? '-n^{2}' : a + 'n^{2}';
  if (b) s += termN(b, 'n', false);
  if (c) s += (c > 0 ? '+' + c : String(c));
  return s;
}

function seqStr(arr) { return arr.join(', '); }

function linTerms(a, b, k) {
  const out = [];
  for (let n = 1; n <= k; n++) out.push(a * n + b);
  return out;
}

function quadTerms(a, b, c, k) {
  const out = [];
  for (let n = 1; n <= k; n++) out.push(a * n * n + b * n + c);
  return out;
}

function geoTerms(first, r, k) {
  const out = [first];
  for (let i = 1; i < k; i++) out.push(out[i - 1] * r);
  return out;
}

function eqPair(a1, b1, c1, a2, b2, c2) {
  function one(a, b, c) {
    const xt = a === 1 ? 'x' : a === -1 ? '-x' : a + 'x';
    const yt = (b >= 0 ? '+' : '') + (Math.abs(b) === 1 ? (b < 0 ? '-' : '') + 'y' : b + 'y');
    return `${xt}${yt}=${c}`;
  }
  return `$${one(a1, b1, c1)}$ and $${one(a2, b2, c2)}$`;
}

module.exports = {
  final, finalText, lines, three, addFactory, gcd, frac, n1, n2, show,
  deg, sinD, cosD, tanD, asinD, acosD, atanD, fbox, lbl, rightTri, lShape, scaleneTri, bearingsFig, cuboidFig, venn,
  solve2, fmtNum, nthLin, nthQuad, seqStr, linTerms, quadTerms, geoTerms, eqPair
};
