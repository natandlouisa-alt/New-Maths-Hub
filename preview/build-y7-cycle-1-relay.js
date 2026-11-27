#!/usr/bin/env node
/**
 * Year 7 Cycle 1 revision board (preview).
 * One fluency question per topic, three versions, Do Now classroom controls.
 * Nothing is inserted into y7index.
 */
const fs = require('fs');
const path = require('path');

const NAMES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions'];

function placeOf(n, digit) {
  const s = String(n);
  const idx = s.indexOf(String(digit));
  if (idx < 0) throw new Error(`digit ${digit} not in ${n}`);
  const power = s.length - 1 - idx;
  return { power, name: NAMES[power], value: digit * 10 ** power };
}
function decPlaces(str) {
  const p = String(str).split('.')[1];
  return p ? p.length : 0;
}
function toScaled(str, scale) {
  const [w, f = ''] = String(str).split('.');
  const frac = (f + '0'.repeat(scale)).slice(0, scale);
  const sign = String(str).trim().startsWith('-') ? -1 : 1;
  return sign * (Math.abs(Number(w)) * 10 ** scale + Number(frac || 0));
}
function fromScaled(int, scale) {
  const sign = int < 0 ? '-' : '';
  const v = Math.abs(int);
  if (scale === 0) return sign + String(v);
  const s = String(v).padStart(scale + 1, '0');
  const whole = s.slice(0, -scale);
  const frac = s.slice(-scale).replace(/0+$/, '');
  return sign + whole + (frac ? '.' + frac : '');
}
function decOp(a, b, op) {
  const scale = Math.max(decPlaces(a), decPlaces(b));
  const A = toScaled(a, scale);
  const B = toScaled(b, scale);
  return fromScaled(op === 'add' ? A + B : A - B, scale);
}
function roundByDigit(n, unit) {
  const shifted = n / unit;
  const base = Math.floor(shifted);
  const next = Math.floor((shifted - base) * 10 + 1e-9);
  return (next >= 5 ? base + 1 : base) * unit;
}
function roundDpByDigit(n, dp) {
  const f = 10 ** dp;
  const shifted = n * f;
  const base = Math.floor(shifted + 1e-9);
  const next = Math.floor((shifted - base) * 10 + 1e-8);
  return fromScaled(next >= 5 ? base + 1 : base, dp);
}
function thou(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
}
function final(expr) { return `$\\boldsymbol{${expr}}$`; }
function lines(arr) { return arr.join('<br>'); }
function decDigit(numStr, digit) {
  const dec = numStr.split('.')[1];
  const idx = dec.indexOf(String(digit));
  if (idx < 0) throw new Error('decimal digit missing in ' + numStr);
  const names = ['tenths', 'hundredths', 'thousandths'];
  return { name: names[idx], value: fromScaled(digit, idx + 1) };
}
function mulPow(numStr, zeros) {
  const d = decPlaces(numStr);
  return fromScaled(toScaled(numStr, d) * 10 ** zeros, d);
}
function divPow(numStr, zeros) {
  const d = decPlaces(numStr);
  return fromScaled(toScaled(numStr, d), d + zeros);
}
function mul2(a, b) {
  const tens = Math.floor(b / 10) * 10;
  const ones = b % 10;
  const p1 = a * tens, p2 = a * ones, ans = p1 + p2;
  if (ans !== a * b) throw new Error('mul');
  return { p1, p2, ans };
}
function divDec(dividendStr, divisor) {
  const scale = decPlaces(dividendStr) + 2;
  const num = toScaled(dividendStr, scale);
  if (num % divisor !== 0) throw new Error('not exact ' + dividendStr);
  return fromScaled(num / divisor, scale);
}
function like(terms) {
  const acc = {};
  for (const [coef, letter] of terms) acc[letter] = (acc[letter] || 0) + coef;
  return acc;
}
function likeTex(acc, order) {
  const parts = [];
  for (const letter of order) {
    const c = acc[letter];
    if (!c) continue;
    parts.push((c < 0 ? '-' : parts.length ? '+' : '') + (Math.abs(c) === 1 ? '' : Math.abs(c)) + letter);
  }
  return parts.join('');
}

const items = [];
function add(unit, topic, id, versions) {
  if (versions.length !== 3) throw new Error(id + ' needs 3 versions');
  const qs = versions.map(v => v.q);
  const as = versions.map(v => v.a);
  if (new Set(qs).size !== 3) throw new Error(id + ': repeated question');
  if (new Set(as).size !== 3) throw new Error(id + ': repeated answer');
  if (qs.some(q => /<(?!br\/?>)/.test(q)) || as.some(a => /<(?!br\/?>)/.test(a))) {
    throw new Error(id + ': raw <');
  }
  items.push({
    unit, topic, id,
    q: versions[0].q, a: versions[0].a,
    q2: versions[1].q, a2: versions[1].a,
    q3: versions[2].q, a3: versions[2].a
  });
}

function three(make, specs) {
  return specs.map(make);
}

// ── Number Sense ──────────────────────────────────────────
add('Number Sense', 'Integer place value', 'int-place-value', three(({ n, d }) => {
  const p = placeOf(n, d);
  return { q: `Write the value of the digit $${d}$ in $${thou(n)}$.`, a: lines([`The $${d}$ is in the ${p.name} column.`, final(String(p.value))]) };
}, [{ n: 47362, d: 7 }, { n: 82045, d: 8 }, { n: 15208, d: 5 }]));

add('Number Sense', 'Decimal place value', 'dec-place-value', three(({ num, d }) => {
  const p = decDigit(num, d);
  return { q: `Write the value of the digit $${d}$ in $${num}$.`, a: lines([`The $${d}$ is in the ${p.name} column.`, final(p.value)]) };
}, [{ num: '3.068', d: 6 }, { num: '5.074', d: 4 }, { num: '2.519', d: 5 }]));

add('Number Sense', 'Rounding to powers of ten', 'rounding-powers', three(({ n, unit, digit, up }) => {
  const ans = roundByDigit(n, unit);
  if (ans !== Math.round(n / unit) * unit) throw new Error('round pow ' + n);
  return { q: `Round $${thou(n)}$ to the nearest $${unit >= 1000 ? thou(unit) : unit}$.`, a: lines([`The ${digit} digit is ${up ? '5 or more, so round up' : 'less than 5, so the column stays'}.`, final(thou(ans))]) };
}, [
  { n: 47386, unit: 1000, digit: 'hundreds', up: false },
  { n: 26850, unit: 100, digit: 'tens', up: true },
  { n: 39420, unit: 1000, digit: 'hundreds', up: false }
]));

add('Number Sense', 'Rounding to integers', 'rounding-int', three(({ n }) => {
  const ans = roundDpByDigit(Number(n), 0);
  if (Number(ans) !== Math.round(Number(n))) throw new Error('int round ' + n);
  const tenths = n.split('.')[1][0];
  const up = Number(tenths) >= 5;
  return { q: `Round $${n}$ to the nearest whole number.`, a: lines([`The tenths digit is $${tenths}$, so ${up ? 'round up' : 'round down'}.`, final(ans)]) };
}, [{ n: '8.74' }, { n: '6.48' }, { n: '12.51' }]));

add('Number Sense', 'Rounding to decimal places', 'rounding-dp', three(({ n, dp, look, up }) => {
  const ans = roundDpByDigit(n, dp);
  return { q: `Round $${n}$ to $${dp}$ decimal place${dp === 1 ? '' : 's'}.`, a: lines([`The next digit is $${look}$, so ${up ? 'round up' : 'the digit stays'}.`, final(ans)]) };
}, [
  { n: 3.476, dp: 1, look: 7, up: true },
  { n: 8.264, dp: 2, look: 4, up: false },
  { n: 5.851, dp: 1, look: 5, up: true }
]));

// ── Calculation ───────────────────────────────────────────
add('Calculation', 'Adding decimals', 'add-dec', three(({ a, b }) => {
  const ans = decOp(a, b, 'add');
  const pad = fromScaled(toScaled(b, 2), 2);
  return { q: `Work out $${a} + ${b}$.`, a: lines([`$${a} + ${pad} = ${ans}$`, final(ans)]) };
}, [{ a: '3.47', b: '1.6' }, { a: '2.85', b: '0.9' }, { a: '4.06', b: '2.7' }]));

add('Calculation', 'Subtracting decimals', 'sub-dec', three(({ a, b }) => {
  const ans = decOp(a, b, 'sub');
  const pad = fromScaled(toScaled(a, 2), 2);
  return { q: `Work out $${a} - ${b}$.`, a: lines([`$${pad} - ${b} = ${ans}$`, final(ans)]) };
}, [{ a: '5.3', b: '2.17' }, { a: '6.4', b: '1.85' }, { a: '7.2', b: '3.46' }]));

add('Calculation', 'Multiplying by powers of ten', 'mult-powers', three(({ n, z }) => {
  const ans = mulPow(n, z);
  return { q: `Work out $${n} \\times ${10 ** z}$.`, a: lines([`Move the digits $${z}$ places left.`, final(ans)]) };
}, [{ n: '3.4', z: 2 }, { n: '0.27', z: 3 }, { n: '5.8', z: 2 }]));

add('Calculation', 'Dividing by powers of ten', 'div-powers', three(({ n, z }) => {
  const ans = divPow(n, z);
  return { q: `Work out $${n} \\div ${10 ** z}$.`, a: lines([`Move the digits $${z}$ places right.`, final(ans)]) };
}, [{ n: '340', z: 2 }, { n: '58', z: 3 }, { n: '720', z: 2 }]));

add('Calculation', 'Multiplication', 'multiplication', three(({ a, b }) => {
  const m = mul2(a, b);
  return { q: `Work out $${a} \\times ${b}$.`, a: lines([`$${a} \\times ${Math.floor(b / 10) * 10} = ${m.p1}$`, `$${a} \\times ${b % 10} = ${m.p2}$`, `$${m.p1} + ${m.p2} = ${m.ans}$`, final(String(m.ans))]) };
}, [{ a: 23, b: 14 }, { a: 36, b: 15 }, { a: 42, b: 13 }]));

add('Calculation', 'Short division with decimals', 'short-div', three(({ n, d }) => {
  const ans = divDec(n, d);
  return { q: `Work out $${n} \\div ${d}$.`, a: lines([`$${n} \\div ${d} = ${ans}$`, final(ans)]) };
}, [{ n: '9.6', d: 4 }, { n: '8.55', d: 5 }, { n: '7.2', d: 6 }]));

// ── Negatives 1 ───────────────────────────────────────────
function fmtList(nums) { return nums.map(n => String(n)).join(',\\; '); }
add('Negatives 1 — Add & Subtract', 'Ordering negatives', 'ordering-neg', three(({ nums }) => {
  const ordered = [...nums].sort((a, b) => a - b);
  return { q: `Write in order, smallest first: $${fmtList(nums)}$.`, a: final(fmtList(ordered)) };
}, [{ nums: [-5, 2, -1, 0] }, { nums: [-8, 3, -2, 1] }, { nums: [-4, 5, -7, 0] }]));

add('Negatives 1 — Add & Subtract', 'Zero pairs', 'zero-pairs', three(({ n }) => {
  return { q: `Which number makes a zero pair with $-${n}$?`, a: lines([`$-${n} + ${n} = 0$`, final('+' + n)]) };
}, [{ n: 6 }, { n: 9 }, { n: 4 }]));

add('Negatives 1 — Add & Subtract', 'Adding negatives', 'adding-neg', three(({ a, b }) => {
  const ans = a + b;
  return { q: `Work out $${a} + (${b})$.`, a: lines([`Adding $${b}$ moves left by $${Math.abs(b)}$.`, final(String(ans))]) };
}, [{ a: -2, b: -4 }, { a: -5, b: -3 }, { a: -7, b: -2 }]));

add('Negatives 1 — Add & Subtract', 'Subtracting negatives', 'subbing-neg', three(({ a, b }) => {
  const ans = a + b;
  return { q: `Work out $${a} - (-${b})$.`, a: lines([`$${a} - (-${b}) = ${a} + ${b}$`, final(String(ans))]) };
}, [{ a: 5, b: 3 }, { a: 7, b: 4 }, { a: 2, b: 9 }]));

add('Negatives 1 — Add & Subtract', 'Adding & subtracting (mixed)', 'mixed-neg-1', three(({ a, b }) => {
  const ans = a + b;
  return { q: `Work out $${a} - (-${b})$.`, a: lines([`$${a} - (-${b}) = ${a} + ${b}$`, final(String(ans))]) };
}, [{ a: -3, b: 7 }, { a: -6, b: 2 }, { a: -1, b: 8 }]));

// ── Order of operations ───────────────────────────────────
add('Order of Operations', 'Order of operations 1', 'bidmas-1', three(({ a, b, c }) => {
  const prod = b * c, ans = a + prod;
  return { q: `Work out $${a} + ${b} \\times ${c}$.`, a: lines([`$${b} \\times ${c} = ${prod}$`, `$${a} + ${prod} = ${ans}$`, final(String(ans))]) };
}, [{ a: 3, b: 4, c: 2 }, { a: 5, b: 6, c: 3 }, { a: 8, b: 2, c: 7 }]));

add('Order of Operations', 'Order of operations 2', 'bidmas-2', three(({ k, p, q }) => {
  const inside = p + q, sq = inside ** 2, ans = k * sq;
  return { q: `Work out $${k} \\times (${p}+${q})^{2}$.`, a: lines([`$${p}+${q} = ${inside}$`, `$${inside}^{2} = ${sq}$`, `$${k} \\times ${sq} = ${ans}$`, final(String(ans))]) };
}, [{ k: 2, p: 2, q: 3 }, { k: 3, p: 1, q: 3 }, { k: 4, p: 2, q: 1 }]));

add('Order of Operations', 'Squares and roots', 'squares-roots', three(({ n }) => {
  const ans = n * n;
  return { q: `Work out $${n}^{2}$.`, a: lines([`$${n} \\times ${n} = ${ans}$`, final(String(ans))]) };
}, [{ n: 12 }, { n: 13 }, { n: 11 }]));

add('Order of Operations', 'Cubes and roots', 'cubes-roots', three(({ n }) => {
  const ans = n * n * n;
  return { q: `Work out $${n}^{3}$.`, a: lines([`$${n} \\times ${n} \\times ${n} = ${ans}$`, final(String(ans))]) };
}, [{ n: 4 }, { n: 5 }, { n: 3 }]));

add('Order of Operations', 'Commutativity and Associativity', 'commutativity', three(({ a, b }) => {
  const left = a - b, right = b - a;
  return { q: `Does $${a} - ${b}$ equal $${b} - ${a}$?`, a: lines([`$${a} - ${b} = ${left}$`, `$${b} - ${a} = ${right}$`, final('No')]) };
}, [{ a: 8, b: 3 }, { a: 9, b: 2 }, { a: 6, b: 4 }]));

// ── Expressions ───────────────────────────────────────────
add('Expressions', 'Algebraic notation & terminology', 'alg-notation', three(({ n, letter }) => {
  return { q: `Write $${n} \\times ${letter} \\times ${letter}$ in algebraic notation.`, a: lines([`$${letter} \\times ${letter} = ${letter}^{2}$`, final(`${n}${letter}^{2}`)]) };
}, [{ n: 4, letter: 'a' }, { n: 7, letter: 'b' }, { n: 5, letter: 'n' }]));

add('Expressions', 'Algebra tiles', 'alg-tiles', three(({ x, units }) => {
  return { q: `Tiles show $+${x}x$, $-${x}x$ and $+${units}$. What is left after zero pairs cancel?`, a: lines([`$+${x}x$ and $-${x}x$ cancel.`, final(String(units))]) };
}, [{ x: 2, units: 3 }, { x: 4, units: 5 }, { x: 3, units: 7 }]));

add('Expressions', 'Collecting like terms', 'like-terms', [
  { q: 'Simplify $4y + 6x + 6y - 2x$.', a: lines(['$4y + 6y = 10y$', '$6x - 2x = 4x$', final('10y+4x')]) },
  { q: 'Simplify $3a + 5b + 4a - 2b$.', a: lines(['$3a + 4a = 7a$', '$5b - 2b = 3b$', final('7a+3b')]) },
  { q: 'Simplify $7p - 2q + 3p + 5q$.', a: lines(['$7p + 3p = 10p$', '$-2q + 5q = 3q$', final('10p+3q')]) }
]);
if (likeTex(like([[7, 'p'], [-2, 'q'], [3, 'p'], [5, 'q']]), ['p', 'q']) !== '10p+3q') throw new Error('like v3');

add('Expressions', 'Forming expressions', 'forming-exp', three(({ n, letter }) => {
  return { q: `Write an expression for $${n}$ less than $${letter}$.`, a: lines([`Start with $${letter}$, then subtract $${n}$.`, final(`${letter}-${n}`)]) };
}, [{ n: 5, letter: 'x' }, { n: 8, letter: 'n' }, { n: 3, letter: 'y' }]));

add('Expressions', 'Substitution', 'substitution', three(({ cx, cy, x, y }) => {
  const ans = cx * x + cy * y;
  return { q: `Work out $${cx}x + ${cy}y$ when $x = ${x}$ and $y = ${y}$.`, a: lines([`$${cx}(${x}) + ${cy}(${y})$`, `$= ${cx * x} + ${cy * y}$`, final(String(ans))]) };
}, [{ cx: 4, cy: 6, x: 3, y: 5 }, { cx: 3, cy: 5, x: 4, y: 2 }, { cx: 2, cy: 7, x: 5, y: 3 }]));

add('Expressions', 'Function machines', 'fn-machines', three(({ input, m, add }) => {
  const mid = input * m, ans = mid + add;
  return { q: `A function machine does $\\times ${m}$, then $+ ${add}$. The input is $${input}$. What is the output?`, a: lines([`$${input} \\times ${m} = ${mid}$`, `$${mid} + ${add} = ${ans}$`, final(String(ans))]) };
}, [{ input: 5, m: 3, add: 2 }, { input: 4, m: 5, add: 3 }, { input: 6, m: 2, add: 7 }]));

// ── Equations ─────────────────────────────────────────────
add('Solving Equations', 'Solving one step (adding)', 'solve-add', three(({ c, total }) => {
  const ans = total - c;
  return { q: `Solve $x + ${c} = ${total}$.`, a: lines([`$x = ${total} - ${c}$`, final(`x=${ans}`)]) };
}, [{ c: 7, total: 12 }, { c: 9, total: 20 }, { c: 4, total: 15 }]));

add('Solving Equations', 'Solving one step (multiplying)', 'solve-mult', three(({ c, total }) => {
  const ans = total / c;
  if (!Number.isInteger(ans)) throw new Error('not int');
  return { q: `Solve $${c}x = ${total}$.`, a: lines([`$x = ${total} \\div ${c}$`, final(`x=${ans}`)]) };
}, [{ c: 3, total: 15 }, { c: 4, total: 28 }, { c: 5, total: 35 }]));

add('Solving Equations', 'Solving two step (multiply)', 'solve-2-mult', three(({ m, c, total }) => {
  const after = total - c, ans = after / m;
  if (!Number.isInteger(ans)) throw new Error('not int');
  return { q: `Solve $${m}x + ${c} = ${total}$.`, a: lines([`$${m}x = ${after}$`, `$x = ${after} \\div ${m}$`, final(`x=${ans}`)]) };
}, [{ m: 2, c: 6, total: 18 }, { m: 3, c: 5, total: 26 }, { m: 4, c: 3, total: 23 }]));

add('Solving Equations', 'Solving two step (divide)', 'solve-2-div', three(({ d, c, total }) => {
  const after = total - c, ans = after * d;
  return { q: `Solve $\\dfrac{x}{${d}} + ${c} = ${total}$.`, a: lines([`$\\dfrac{x}{${d}} = ${after}$`, `$x = ${after} \\times ${d}$`, final(`x=${ans}`)]) };
}, [{ d: 3, c: 4, total: 7 }, { d: 4, c: 2, total: 5 }, { d: 5, c: 6, total: 8 }]));

// ── Negatives 2 ───────────────────────────────────────────
add('Negatives 2 — Multiply & Divide', 'Multiplying positive × negative', 'pos-neg-mult', three(({ a, b }) => {
  const ans = -(a * b);
  return { q: `Work out $${a} \\times (-${b})$.`, a: lines([`$${a} \\times ${b} = ${a * b}$`, `Positive $\\times$ negative is negative.`, final(String(ans))]) };
}, [{ a: 3, b: 4 }, { a: 6, b: 5 }, { a: 7, b: 2 }]));

add('Negatives 2 — Multiply & Divide', 'Multiplying negative × negative', 'neg-neg-mult', three(({ a, b }) => {
  const ans = a * b;
  return { q: `Work out $(-${a}) \\times (-${b})$.`, a: lines([`$${a} \\times ${b} = ${ans}$`, `Negative $\\times$ negative is positive.`, final(String(ans))]) };
}, [{ a: 3, b: 4 }, { a: 6, b: 5 }, { a: 7, b: 2 }]));

add('Negatives 2 — Multiply & Divide', 'Dividing with negatives', 'div-neg', three(({ a, b }) => {
  const ans = -(a / b);
  return { q: `Work out $-${a} \\div ${b}$.`, a: lines([`$${a} \\div ${b} = ${a / b}$`, `Different signs, so the answer is negative.`, final(String(ans))]) };
}, [{ a: 18, b: 6 }, { a: 28, b: 7 }, { a: 36, b: 4 }]));

add('Negatives 2 — Multiply & Divide', 'Mixed negatives', 'mixed-neg-2', three(({ a, b, c }) => {
  const mid = a * b, ans = mid * c;
  return { q: `Work out $(${a}) \\times ${b} \\times (${c})$.`, a: lines([`$(${a}) \\times ${b} = ${mid}$`, `$${mid} \\times (${c}) = ${ans}$`, final(String(ans))]) };
}, [{ a: -2, b: 5, c: -3 }, { a: -4, b: 3, c: -2 }, { a: -5, b: 2, c: -4 }]));

add('Negatives 2 — Multiply & Divide', 'Negatives on a calculator', 'neg-calc', three(({ n }) => {
  const ans = n * n;
  return { q: `Work out $(-${n})^{2}$.`, a: lines([`$(-${n}) \\times (-${n}) = ${ans}$`, final(String(ans))]) };
}, [{ n: 6 }, { n: 8 }, { n: 9 }]));

if (items.length !== 36) throw new Error('expected 36 items, got ' + items.length);

const units = [];
for (const it of items) {
  let u = units.find(x => x.name === it.unit);
  if (!u) { u = { name: it.unit, qs: [] }; units.push(u); }
  u.qs.push(it);
}

const UNIT_KEYS = ['all', ...units.map((_, i) => 'u' + i)];
const UNIT_LABELS = ['Whole cycle', ...units.map(u => u.name.replace(' — Add & Subtract', '').replace(' — Multiply & Divide', ''))];

const DATA = { all: [{ u: 'Year 7 · Cycle 1', l: 'Whole cycle', qs: items }] };
units.forEach((u, i) => {
  DATA['u' + i] = [{ u: u.name, l: u.name, qs: u.qs }];
});

const css = fs.readFileSync(path.join(__dirname, 'do-now-app.css'), 'utf8');
const runtime = fs.readFileSync(path.join(__dirname, 'do-now-app.js'), 'utf8');
const body = fs.readFileSync(path.join(__dirname, 'do-now-body.html'), 'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Year 7 Cycle 1 revision — preview</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
<style>
${css}
</style>
</head>
${body}
<script>
const UNIT_KEYS = ${JSON.stringify(UNIT_KEYS)};
const UNIT_LABELS = ${JSON.stringify(UNIT_LABELS)};
const DATA = ${JSON.stringify(DATA, null, 2)};
${runtime}
</script>
<div id="pz"></div>
</body>
</html>
`;

const out = path.join(__dirname, 'y7-cycle-1-relay.html');
fs.writeFileSync(out, html);
console.log('wrote', out);
console.log('items', items.length, 'units', units.map(u => u.name + ' ' + u.qs.length).join(' | '));
