#!/usr/bin/env node
/**
 * Year 7 Cycle 1 relay preview.
 * One fluency question per topic. Answers are computed here, then checked
 * a second way before the page is written. Nothing is inserted into y7index.
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
  const out = op === 'add' ? A + B : A - B;
  return fromScaled(out, scale);
}

function roundByDigit(n, unit) {
  // unit is 1, 10, 100, 1000, or a decimal place count via roundDp
  const shifted = n / unit;
  const base = Math.floor(shifted);
  const next = Math.floor((shifted - base) * 10 + 1e-9);
  const rounded = next >= 5 ? base + 1 : base;
  return rounded * unit;
}

function roundDpByDigit(n, dp) {
  const f = 10 ** dp;
  const shifted = n * f;
  const base = Math.floor(shifted + 1e-9);
  const next = Math.floor((shifted - base) * 10 + 1e-8);
  const rounded = next >= 5 ? base + 1 : base;
  return fromScaled(rounded, dp);
}

function thou(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
}

function final(expr) {
  return `$\\boldsymbol{${expr}}$`;
}

function lines(arr) {
  return arr.join('<br>');
}

const items = [];

function add(unit, topic, id, note, v1, v2, check) {
  if (v1.q === v2.q) throw new Error(`${id}: V2 repeats the question`);
  if (v1.a === v2.a) throw new Error(`${id}: V2 repeats the answer`);
  check(v1, v2);
  items.push({ unit, topic, id, note, v1, v2 });
}

// 1 Integer place value
add('Number Sense', 'Integer place value', 'int-place-value',
  'The digit’s column decides its value. A longer number is not automatically bigger.',
  (() => {
    const n = 47362, d = 7;
    const p = placeOf(n, d);
    return { q: `Write the value of the digit $${d}$ in $${thou(n)}$.`, a: lines([`The $${d}$ is in the ${p.name} column.`, final(String(p.value))]), value: p.value };
  })(),
  (() => {
    const n = 82045, d = 8;
    const p = placeOf(n, d);
    return { q: `Write the value of the digit $${d}$ in $${thou(n)}$.`, a: lines([`The $${d}$ is in the ${p.name} column.`, final(String(p.value))]), value: p.value };
  })(),
  (v1, v2) => {
    if (v1.value !== 7000 || v2.value !== 80000) throw new Error('place value');
  }
);

// 2 Decimal place value
function decDigit(numStr, digit) {
  const dec = numStr.split('.')[1];
  const idx = dec.indexOf(String(digit));
  if (idx < 0) throw new Error('decimal digit missing');
  const names = ['tenths', 'hundredths', 'thousandths'];
  const value = fromScaled(digit, idx + 1);
  return { name: names[idx], value };
}
add('Number Sense', 'Decimal place value', 'dec-place-value',
  'A zero on the end of a decimal does not change the value. 0.5 and 0.50 are equal.',
  (() => {
    const num = '3.068', d = 6;
    const p = decDigit(num, d);
    return { q: `Write the value of the digit $${d}$ in $${num}$.`, a: lines([`The $${d}$ is in the ${p.name} column.`, final(p.value)]), value: p.value };
  })(),
  (() => {
    const num = '5.074', d = 4;
    const p = decDigit(num, d);
    return { q: `Write the value of the digit $${d}$ in $${num}$.`, a: lines([`The $${d}$ is in the ${p.name} column.`, final(p.value)]), value: p.value };
  })(),
  (v1, v2) => { if (v1.value !== '0.06' || v2.value !== '0.004') throw new Error('dec place'); }
);

// 3 Rounding to powers of ten
function roundPow(n, unit) {
  const byDigit = roundByDigit(n, unit);
  const byRound = Math.round(n / unit) * unit;
  if (byDigit !== byRound) throw new Error(`round mismatch ${n} ${unit}: ${byDigit} vs ${byRound}`);
  return byDigit;
}
add('Number Sense', 'Rounding to powers of ten', 'rounding-powers',
  'Look at the single digit just to the right of the column you are rounding to.',
  (() => {
    const n = 47386, unit = 1000, ans = roundPow(n, unit);
    return { q: `Round $${thou(n)}$ to the nearest $${thou(unit)}$.`, a: lines([`The hundreds digit is $3$, so the thousands digit stays.`, final(thou(ans))]), ans };
  })(),
  (() => {
    const n = 26850, unit = 100, ans = roundPow(n, unit);
    return { q: `Round $${thou(n)}$ to the nearest $${unit}$.`, a: lines([`The tens digit is $5$, so round up.`, final(thou(ans))]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 47000 || v2.ans !== 26900) throw new Error('round pow'); }
);

// 4 Rounding to integers
add('Number Sense', 'Rounding to integers', 'rounding-int',
  'Only the first decimal digit decides. 5 or more rounds up.',
  (() => {
    const n = '8.74';
    const ans = roundDpByDigit(Number(n), 0);
    if (Number(ans) !== Math.round(Number(n))) throw new Error('int round');
    return { q: `Round $${n}$ to the nearest whole number.`, a: lines([`The tenths digit is $7$, so round up.`, final(ans)]), ans };
  })(),
  (() => {
    const n = '6.48';
    const ans = roundDpByDigit(Number(n), 0);
    if (Number(ans) !== Math.round(Number(n))) throw new Error('int round');
    return { q: `Round $${n}$ to the nearest whole number.`, a: lines([`The tenths digit is $4$, so round down.`, final(ans)]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== '9' || v2.ans !== '6') throw new Error('round int'); }
);

// 5 Rounding to decimal places
add('Number Sense', 'Rounding to decimal places', 'rounding-dp',
  'Count the decimal places, then look at only the next digit.',
  (() => {
    const n = 3.476, dp = 1, ans = roundDpByDigit(n, dp);
    const check = (Math.round(n * 10) / 10).toFixed(dp);
    if (Number(ans) !== Number(check)) throw new Error('dp');
    return { q: `Round $${n}$ to $${dp}$ decimal place.`, a: lines([`The hundredths digit is $7$, so round up.`, final(ans)]), ans };
  })(),
  (() => {
    const n = 8.264, dp = 2, ans = roundDpByDigit(n, dp);
    const check = (Math.round(n * 100) / 100).toFixed(dp);
    if (Number(ans) !== Number(check)) throw new Error('dp');
    return { q: `Round $${n}$ to $${dp}$ decimal places.`, a: lines([`The thousandths digit is $4$, so the hundredths digit stays.`, final(ans)]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== '3.5' || v2.ans !== '8.26') throw new Error('round dp'); }
);

// 6 Adding decimals
add('Calculation', 'Adding decimals', 'add-dec',
  'Line up the decimal points. A missing hundredth can be written as 0.',
  (() => {
    const a = '3.47', b = '1.6', ans = decOp(a, b, 'add');
    const check = fromScaled(toScaled(a, 2) + toScaled('1.60', 2), 2);
    if (ans !== check) throw new Error('add');
    return { q: `Work out $${a} + ${b}$.`, a: lines([`$3.47 + 1.60 = ${ans}$`, final(ans)]), ans };
  })(),
  (() => {
    const a = '2.85', b = '0.9', ans = decOp(a, b, 'add');
    const check = fromScaled(toScaled(a, 2) + toScaled('0.90', 2), 2);
    if (ans !== check) throw new Error('add');
    return { q: `Work out $${a} + ${b}$.`, a: lines([`$2.85 + 0.90 = ${ans}$`, final(ans)]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== '5.07' || v2.ans !== '3.75') throw new Error('add dec'); }
);

// 7 Subtracting decimals
add('Calculation', 'Subtracting decimals', 'sub-dec',
  'Line up the decimal points, then borrow in the usual way.',
  (() => {
    const a = '5.3', b = '2.17', ans = decOp(a, b, 'sub');
    return { q: `Work out $${a} - ${b}$.`, a: lines([`$5.30 - 2.17 = ${ans}$`, final(ans)]), ans };
  })(),
  (() => {
    const a = '6.4', b = '1.85', ans = decOp(a, b, 'sub');
    return { q: `Work out $${a} - ${b}$.`, a: lines([`$6.40 - 1.85 = ${ans}$`, final(ans)]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== '3.13' || v2.ans !== '4.55') throw new Error('sub dec'); }
);

// 8 Multiplying by powers of ten
function shift(numStr, zeros, dir) {
  const scale = decPlaces(numStr) + zeros;
  const int = toScaled(numStr, decPlaces(numStr));
  const moved = dir === 'left' ? int * 10 ** zeros : int;
  const outScale = dir === 'left' ? Math.max(0, decPlaces(numStr) - zeros) : decPlaces(numStr) + zeros;
  // rebuild from the original integer digits
  const digits = toScaled(numStr, decPlaces(numStr));
  if (dir === 'left') return fromScaled(digits * 10 ** (zeros - Math.max(0, zeros - decPlaces(numStr)) + Math.max(0, zeros - decPlaces(numStr))), Math.max(0, decPlaces(numStr) - zeros));
  return fromScaled(digits, decPlaces(numStr) + zeros);
}
function mulPow(numStr, zeros) {
  const d = decPlaces(numStr);
  const digits = toScaled(numStr, d);
  return fromScaled(digits * 10 ** zeros, d);
}
function divPow(numStr, zeros) {
  const d = decPlaces(numStr);
  const digits = toScaled(numStr, d);
  return fromScaled(digits, d + zeros);
}
add('Calculation', 'Multiplying by powers of ten', 'mult-powers',
  'Multiplying by 100 moves every digit two places to the left.',
  (() => {
    const ans = mulPow('3.4', 2);
    return { q: `Work out $3.4 \\times 100$.`, a: lines([`Move the digits $2$ places left.`, final(ans)]), ans };
  })(),
  (() => {
    const ans = mulPow('0.27', 3);
    return { q: `Work out $0.27 \\times 1000$.`, a: lines([`Move the digits $3$ places left.`, final(ans)]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== '340' || v2.ans !== '270') throw new Error('mul pow ' + v1.ans + ' ' + v2.ans); }
);

// 9 Dividing by powers of ten
add('Calculation', 'Dividing by powers of ten', 'div-powers',
  'Dividing by a power of ten moves the digits to the right.',
  (() => {
    const ans = divPow('340', 2);
    return { q: `Work out $340 \\div 100$.`, a: lines([`Move the digits $2$ places right.`, final(ans)]), ans };
  })(),
  (() => {
    const ans = divPow('58', 3);
    return { q: `Work out $58 \\div 1000$.`, a: lines([`Move the digits $3$ places right.`, final(ans)]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== '3.4' || v2.ans !== '0.058') throw new Error('div pow ' + v1.ans + ' ' + v2.ans); }
);

// 10 Multiplication
function mul2(a, b) {
  const tens = Math.floor(b / 10) * 10;
  const ones = b % 10;
  const p1 = a * tens;
  const p2 = a * ones;
  const ans = p1 + p2;
  if (ans !== a * b) throw new Error('mul');
  return { p1, p2, tens, ones, ans };
}
add('Calculation', 'Multiplication', 'multiplication',
  'When multiplying by the tens digit, the row is a multiple of ten.',
  (() => {
    const m = mul2(23, 14);
    return { q: `Work out $23 \\times 14$.`, a: lines([`$23 \\times 10 = ${m.p1}$`, `$23 \\times 4 = ${m.p2}$`, `$${m.p1} + ${m.p2} = ${m.ans}$`, final(String(m.ans))]), ans: m.ans };
  })(),
  (() => {
    const m = mul2(36, 15);
    return { q: `Work out $36 \\times 15$.`, a: lines([`$36 \\times 10 = ${m.p1}$`, `$36 \\times 5 = ${m.p2}$`, `$${m.p1} + ${m.p2} = ${m.ans}$`, final(String(m.ans))]), ans: m.ans };
  })(),
  (v1, v2) => { if (v1.ans !== 322 || v2.ans !== 540) throw new Error('mul'); }
);

// 11 Short division with decimals
function divDec(dividendStr, divisor) {
  const d = decPlaces(dividendStr);
  const scale = d + 2;
  const num = toScaled(dividendStr, scale);
  if (num % divisor !== 0) throw new Error('not exact ' + dividendStr);
  return fromScaled(num / divisor, scale);
}
add('Calculation', 'Short division with decimals', 'short-div',
  'Carry the remainder to the next digit, and keep the decimal point in line.',
  (() => {
    const ans = divDec('9.6', 4);
    return { q: `Work out $9.6 \\div 4$.`, a: lines([`$9.6 \\div 4 = ${ans}$`, final(ans)]), ans };
  })(),
  (() => {
    const ans = divDec('8.55', 5);
    return { q: `Work out $8.55 \\div 5$.`, a: lines([`$8.55 \\div 5 = ${ans}$`, final(ans)]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== '2.4' || v2.ans !== '1.71') throw new Error('div ' + v1.ans + ' ' + v2.ans); }
);

// 12 Ordering negatives
function orderList(nums) {
  return [...nums].sort((a, b) => a - b);
}
function fmtList(nums) {
  return nums.map(n => (n < 0 ? n : String(n))).join(',\\; ');
}
add('Negatives 1 — Add & Subtract', 'Ordering negatives', 'ordering-neg',
  'Further left is smaller. −8 is less than −3.',
  (() => {
    const nums = [-5, 2, -1, 0];
    const ordered = orderList(nums);
    return { q: `Write in order, smallest first: $${fmtList(nums)}$.`, a: final(fmtList(ordered)), ordered: ordered.join(',') };
  })(),
  (() => {
    const nums = [-8, 3, -2, 1];
    const ordered = orderList(nums);
    return { q: `Write in order, smallest first: $${fmtList(nums)}$.`, a: final(fmtList(ordered)), ordered: ordered.join(',') };
  })(),
  (v1, v2) => { if (v1.ordered !== '-5,-1,0,2' || v2.ordered !== '-8,-2,1,3') throw new Error('order'); }
);

// 13 Zero pairs
add('Negatives 1 — Add & Subtract', 'Zero pairs', 'zero-pairs',
  'A number and its opposite cancel completely. Nothing is left over.',
  (() => {
    const n = 6;
    return { q: `Which number makes a zero pair with $-${n}$?`, a: lines([`$-${n} + ${n} = 0$`, final('+' + n)]), ans: n };
  })(),
  (() => {
    const n = 9;
    return { q: `Which number makes a zero pair with $-${n}$?`, a: lines([`$-${n} + ${n} = 0$`, final('+' + n)]), ans: n };
  })(),
  (v1, v2) => { if (v1.ans + v2.ans !== 15) throw new Error('zero'); }
);

// 14 Adding negatives
add('Negatives 1 — Add & Subtract', 'Adding negatives', 'adding-neg',
  'Adding a negative moves left. The result gets smaller.',
  (() => {
    const a = -2, b = -4, ans = a + b;
    return { q: `Work out $${a} + (${b})$.`, a: lines([`Adding $${b}$ moves left by $${Math.abs(b)}$.`, final(String(ans))]), ans };
  })(),
  (() => {
    const a = -5, b = -3, ans = a + b;
    return { q: `Work out $${a} + (${b})$.`, a: lines([`Adding $${b}$ moves left by $${Math.abs(b)}$.`, final(String(ans))]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== -6 || v2.ans !== -8) throw new Error('add neg'); }
);

// 15 Subtracting negatives
add('Negatives 1 — Add & Subtract', 'Subtracting negatives', 'subbing-neg',
  'Subtracting a negative is the same as adding.',
  (() => {
    const a = 5, b = 3, ans = a + b;
    return { q: `Work out $${a} - (-${b})$.`, a: lines([`$${a} - (-${b}) = ${a} + ${b}$`, final(String(ans))]), ans };
  })(),
  (() => {
    const a = 7, b = 4, ans = a + b;
    return { q: `Work out $${a} - (-${b})$.`, a: lines([`$${a} - (-${b}) = ${a} + ${b}$`, final(String(ans))]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 8 || v2.ans !== 11) throw new Error('sub neg'); }
);

// 16 Mixed add/sub negatives
add('Negatives 1 — Add & Subtract', 'Adding & subtracting (mixed)', 'mixed-neg-1',
  'Simplify each pair of signs first. − (−) becomes +.',
  (() => {
    const a = -3, b = 7, ans = a + b;
    return { q: `Work out $${a} - (-${b})$.`, a: lines([`$${a} - (-${b}) = ${a} + ${b}$`, final(String(ans))]), ans };
  })(),
  (() => {
    const a = -6, b = 2, ans = a + b;
    return { q: `Work out $${a} - (-${b})$.`, a: lines([`$${a} - (-${b}) = ${a} + ${b}$`, final(String(ans))]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 4 || v2.ans !== -4) throw new Error('mixed neg'); }
);

// 17 BIDMAS 1
add('Order of Operations', 'Order of operations 1', 'bidmas-1',
  'Multiply before you add. Do not work strictly left to right.',
  (() => {
    const a = 3, b = 4, c = 2;
    const prod = b * c, ans = a + prod;
    return { q: `Work out $${a} + ${b} \\times ${c}$.`, a: lines([`$${b} \\times ${c} = ${prod}$`, `$${a} + ${prod} = ${ans}$`, final(String(ans))]), ans };
  })(),
  (() => {
    const a = 5, b = 6, c = 3;
    const prod = b * c, ans = a + prod;
    return { q: `Work out $${a} + ${b} \\times ${c}$.`, a: lines([`$${b} \\times ${c} = ${prod}$`, `$${a} + ${prod} = ${ans}$`, final(String(ans))]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 11 || v2.ans !== 23) throw new Error('bidmas'); }
);

// 18 BIDMAS 2
add('Order of Operations', 'Order of operations 2', 'bidmas-2',
  'Finish everything inside the brackets before you square.',
  (() => {
    const k = 2, p = 2, q = 3;
    const inside = p + q, sq = inside ** 2, ans = k * sq;
    return { q: `Work out $${k} \\times (${p}+${q})^{2}$.`, a: lines([`$${p}+${q} = ${inside}$`, `$${inside}^{2} = ${sq}$`, `$${k} \\times ${sq} = ${ans}$`, final(String(ans))]), ans };
  })(),
  (() => {
    const k = 3, p = 1, q = 3;
    const inside = p + q, sq = inside ** 2, ans = k * sq;
    return { q: `Work out $${k} \\times (${p}+${q})^{2}$.`, a: lines([`$${p}+${q} = ${inside}$`, `$${inside}^{2} = ${sq}$`, `$${k} \\times ${sq} = ${ans}$`, final(String(ans))]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 50 || v2.ans !== 48) throw new Error('bidmas2'); }
);

// 19 Squares
add('Order of Operations', 'Squares and roots', 'squares-roots',
  'Squaring means multiply a number by itself, not by 2.',
  (() => {
    const n = 12, ans = n * n;
    return { q: `Work out $${n}^{2}$.`, a: lines([`$${n} \\times ${n} = ${ans}$`, final(String(ans))]), ans };
  })(),
  (() => {
    const n = 13, ans = n * n;
    return { q: `Work out $${n}^{2}$.`, a: lines([`$${n} \\times ${n} = ${ans}$`, final(String(ans))]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 144 || v2.ans !== 169) throw new Error('squares'); }
);

// 20 Cubes
add('Order of Operations', 'Cubes and roots', 'cubes-roots',
  'Cubing means multiply a number by itself three times, not by 3.',
  (() => {
    const n = 4, ans = n * n * n;
    return { q: `Work out $${n}^{3}$.`, a: lines([`$${n} \\times ${n} \\times ${n} = ${ans}$`, final(String(ans))]), ans };
  })(),
  (() => {
    const n = 5, ans = n * n * n;
    return { q: `Work out $${n}^{3}$.`, a: lines([`$${n} \\times ${n} \\times ${n} = ${ans}$`, final(String(ans))]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 64 || v2.ans !== 125) throw new Error('cubes'); }
);

// 21 Commutativity
add('Order of Operations', 'Commutativity and Associativity', 'commutativity',
  'Addition can swap order. Subtraction cannot.',
  (() => {
    const a = 8, b = 3, left = a - b, right = b - a;
    return {
      q: `Does $${a} - ${b}$ equal $${b} - ${a}$?`,
      a: lines([`$${a} - ${b} = ${left}$`, `$${b} - ${a} = ${right}$`, final('No')]),
      left, right
    };
  })(),
  (() => {
    const a = 9, b = 2, left = a - b, right = b - a;
    return {
      q: `Does $${a} - ${b}$ equal $${b} - ${a}$?`,
      a: lines([`$${a} - ${b} = ${left}$`, `$${b} - ${a} = ${right}$`, final('No')]),
      left, right
    };
  })(),
  (v1, v2) => { if (v1.left !== 5 || v1.right !== -5 || v2.left !== 7 || v2.right !== -7) throw new Error('comm'); }
);

// 22 Algebraic notation
add('Expressions', 'Algebraic notation & terminology', 'alg-notation',
  'a × a is a². It is not 2a. Write the number first.',
  (() => {
    const n = 4, letter = 'a';
    return { q: `Write $${n} \\times ${letter} \\times ${letter}$ in algebraic notation.`, a: lines([`$${letter} \\times ${letter} = ${letter}^{2}$`, final(`${n}${letter}^{2}`)]) };
  })(),
  (() => {
    const n = 7, letter = 'b';
    return { q: `Write $${n} \\times ${letter} \\times ${letter}$ in algebraic notation.`, a: lines([`$${letter} \\times ${letter} = ${letter}^{2}$`, final(`${n}${letter}^{2}`)]) };
  })(),
  () => {}
);

// 23 Algebra tiles
add('Expressions', 'Algebra tiles', 'alg-tiles',
  'An x-tile and a unit tile are different. They do not combine. Opposite tiles cancel.',
  (() => {
    const x = 2, units = 3;
    return { q: `Tiles show $+${x}x$, $-${x}x$ and $+${units}$. What is left after zero pairs cancel?`, a: lines([`$+${x}x$ and $-${x}x$ cancel.`, final(String(units))]), units };
  })(),
  (() => {
    const x = 4, units = 5;
    return { q: `Tiles show $+${x}x$, $-${x}x$ and $+${units}$. What is left after zero pairs cancel?`, a: lines([`$+${x}x$ and $-${x}x$ cancel.`, final(String(units))]), units };
  })(),
  (v1, v2) => { if (v1.units !== 3 || v2.units !== 5) throw new Error('tiles'); }
);

// 24 Like terms
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
    const body = (c < 0 ? '-' : parts.length ? '+' : '') + (Math.abs(c) === 1 && letter ? '' : Math.abs(c)) + letter;
    parts.push(body);
  }
  return parts.join('');
}
add('Expressions', 'Collecting like terms', 'like-terms',
  'Only terms with the same letter combine. 3x + 2y stays as two terms.',
  (() => {
    const acc = like([[4, 'y'], [6, 'x'], [6, 'y'], [-2, 'x']]);
    const expr = likeTex(acc, ['y', 'x']);
    if (acc.y !== 10 || acc.x !== 4) throw new Error('like');
    return { q: `Simplify $4y + 6x + 6y - 2x$.`, a: lines([`$4y + 6y = 10y$`, `$6x - 2x = 4x$`, final(expr)]), expr };
  })(),
  (() => {
    const acc = like([[3, 'a'], [5, 'b'], [4, 'a'], [-2, 'b']]);
    const expr = likeTex(acc, ['a', 'b']);
    if (acc.a !== 7 || acc.b !== 3) throw new Error('like');
    return { q: `Simplify $3a + 5b + 4a - 2b$.`, a: lines([`$3a + 4a = 7a$`, `$5b - 2b = 3b$`, final(expr)]), expr };
  })(),
  (v1, v2) => { if (v1.expr !== '10y+4x' || v2.expr !== '7a+3b') throw new Error(v1.expr + ' ' + v2.expr); }
);

// 25 Forming expressions
add('Expressions', 'Forming expressions', 'forming-exp',
  '“5 less than x” starts at x and subtracts 5. It is x − 5.',
  (() => {
    const n = 5, letter = 'x';
    return { q: `Write an expression for $${n}$ less than $${letter}$.`, a: lines([`Start with $${letter}$, then subtract $${n}$.`, final(`${letter}-${n}`)]) };
  })(),
  (() => {
    const n = 8, letter = 'n';
    return { q: `Write an expression for $${n}$ less than $${letter}$.`, a: lines([`Start with $${letter}$, then subtract $${n}$.`, final(`${letter}-${n}`)]) };
  })(),
  () => {}
);

// 26 Substitution
add('Expressions', 'Substitution', 'substitution',
  'Replace every letter, and put the value in brackets.',
  (() => {
    const x = 3, y = 5, ans = 4 * x + 6 * y;
    return { q: `Work out $4x + 6y$ when $x = ${x}$ and $y = ${y}$.`, a: lines([`$4(${x}) + 6(${y})$`, `$= ${4 * x} + ${6 * y}$`, final(String(ans))]), ans };
  })(),
  (() => {
    const x = 4, y = 2, ans = 3 * x + 5 * y;
    return { q: `Work out $3x + 5y$ when $x = ${x}$ and $y = ${y}$.`, a: lines([`$3(${x}) + 5(${y})$`, `$= ${3 * x} + ${5 * y}$`, final(String(ans))]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 42 || v2.ans !== 22) throw new Error('sub'); }
);

// 27 Function machines
add('Expressions', 'Function machines', 'fn-machines',
  'Do the operations in order. To go backwards, undo the last one first.',
  (() => {
    const input = 5, m = 3, add = 2;
    const mid = input * m, ans = mid + add;
    return { q: `A function machine does $\\times ${m}$, then $+ ${add}$. The input is $${input}$. What is the output?`, a: lines([`$${input} \\times ${m} = ${mid}$`, `$${mid} + ${add} = ${ans}$`, final(String(ans))]), ans };
  })(),
  (() => {
    const input = 4, m = 5, add = 3;
    const mid = input * m, ans = mid + add;
    return { q: `A function machine does $\\times ${m}$, then $+ ${add}$. The input is $${input}$. What is the output?`, a: lines([`$${input} \\times ${m} = ${mid}$`, `$${mid} + ${add} = ${ans}$`, final(String(ans))]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 17 || v2.ans !== 23) throw new Error('fn'); }
);

// 28 Solve add
add('Solving Equations', 'Solving one step (adding)', 'solve-add',
  'Do the opposite to both sides.',
  (() => {
    const c = 7, total = 12, ans = total - c;
    return { q: `Solve $x + ${c} = ${total}$.`, a: lines([`$x = ${total} - ${c}$`, final(`x=${ans}`)]), ans };
  })(),
  (() => {
    const c = 9, total = 20, ans = total - c;
    return { q: `Solve $x + ${c} = ${total}$.`, a: lines([`$x = ${total} - ${c}$`, final(`x=${ans}`)]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 5 || v2.ans !== 11) throw new Error('solve add'); }
);

// 29 Solve multiply
add('Solving Equations', 'Solving one step (multiplying)', 'solve-mult',
  'Undo × by dividing both sides. Do not subtract the coefficient.',
  (() => {
    const c = 3, total = 15, ans = total / c;
    return { q: `Solve $${c}x = ${total}$.`, a: lines([`$x = ${total} \\div ${c}$`, final(`x=${ans}`)]), ans };
  })(),
  (() => {
    const c = 4, total = 28, ans = total / c;
    return { q: `Solve $${c}x = ${total}$.`, a: lines([`$x = ${total} \\div ${c}$`, final(`x=${ans}`)]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 5 || v2.ans !== 7) throw new Error('solve mul'); }
);

// 30 Two step multiply
add('Solving Equations', 'Solving two step (multiply)', 'solve-2-mult',
  'Undo the add or subtract first, then divide.',
  (() => {
    const m = 2, c = 6, total = 18;
    const after = total - c, ans = after / m;
    if (!Number.isInteger(ans)) throw new Error('not int');
    return { q: `Solve $${m}x + ${c} = ${total}$.`, a: lines([`$${m}x = ${after}$`, `$x = ${after} \\div ${m}$`, final(`x=${ans}`)]), ans };
  })(),
  (() => {
    const m = 3, c = 5, total = 26;
    const after = total - c, ans = after / m;
    if (!Number.isInteger(ans)) throw new Error('not int');
    return { q: `Solve $${m}x + ${c} = ${total}$.`, a: lines([`$${m}x = ${after}$`, `$x = ${after} \\div ${m}$`, final(`x=${ans}`)]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 6 || v2.ans !== 7) throw new Error('two mul'); }
);

// 31 Two step divide
add('Solving Equations', 'Solving two step (divide)', 'solve-2-div',
  'Undo the add or subtract first, then multiply.',
  (() => {
    const d = 3, c = 4, total = 7;
    const after = total - c, ans = after * d;
    return { q: `Solve $\\dfrac{x}{${d}} + ${c} = ${total}$.`, a: lines([`$\\dfrac{x}{${d}} = ${after}$`, `$x = ${after} \\times ${d}$`, final(`x=${ans}`)]), ans };
  })(),
  (() => {
    const d = 4, c = 2, total = 5;
    const after = total - c, ans = after * d;
    return { q: `Solve $\\dfrac{x}{${d}} + ${c} = ${total}$.`, a: lines([`$\\dfrac{x}{${d}} = ${after}$`, `$x = ${after} \\times ${d}$`, final(`x=${ans}`)]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 9 || v2.ans !== 12) throw new Error('two div'); }
);

// 32 Positive × negative
add('Negatives 2 — Multiply & Divide', 'Multiplying positive × negative', 'pos-neg-mult',
  'A positive times a negative is negative.',
  (() => {
    const a = 3, b = 4, ans = -(a * b);
    return { q: `Work out $${a} \\times (-${b})$.`, a: lines([`$${a} \\times ${b} = ${a * b}$`, `Positive $\\times$ negative is negative.`, final(String(ans))]), ans };
  })(),
  (() => {
    const a = 6, b = 5, ans = -(a * b);
    return { q: `Work out $${a} \\times (-${b})$.`, a: lines([`$${a} \\times ${b} = ${a * b}$`, `Positive $\\times$ negative is negative.`, final(String(ans))]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== -12 || v2.ans !== -30) throw new Error('pos neg'); }
);

// 33 Negative × negative
add('Negatives 2 — Multiply & Divide', 'Multiplying negative × negative', 'neg-neg-mult',
  'A negative times a negative is positive.',
  (() => {
    const a = 3, b = 4, ans = a * b;
    return { q: `Work out $(-${a}) \\times (-${b})$.`, a: lines([`$${a} \\times ${b} = ${ans}$`, `Negative $\\times$ negative is positive.`, final(String(ans))]), ans };
  })(),
  (() => {
    const a = 6, b = 5, ans = a * b;
    return { q: `Work out $(-${a}) \\times (-${b})$.`, a: lines([`$${a} \\times ${b} = ${ans}$`, `Negative $\\times$ negative is positive.`, final(String(ans))]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 12 || v2.ans !== 30) throw new Error('neg neg'); }
);

// 34 Dividing negatives
add('Negatives 2 — Multiply & Divide', 'Dividing with negatives', 'div-neg',
  'Division uses the same sign rules as multiplication.',
  (() => {
    const a = 18, b = 6, ans = -(a / b);
    return { q: `Work out $-${a} \\div ${b}$.`, a: lines([`$${a} \\div ${b} = ${a / b}$`, `Different signs, so the answer is negative.`, final(String(ans))]), ans };
  })(),
  (() => {
    const a = 28, b = 7, ans = -(a / b);
    return { q: `Work out $-${a} \\div ${b}$.`, a: lines([`$${a} \\div ${b} = ${a / b}$`, `Different signs, so the answer is negative.`, final(String(ans))]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== -3 || v2.ans !== -4) throw new Error('div neg'); }
);

// 35 Mixed negatives (three factors)
add('Negatives 2 — Multiply & Divide', 'Mixed negatives', 'mixed-neg-2',
  'Track the sign after each multiply. An even count of negatives gives a positive.',
  (() => {
    const a = -2, b = 5, c = -3;
    const mid = a * b, ans = mid * c;
    return { q: `Work out $(${a}) \\times ${b} \\times (${c})$.`, a: lines([`$(${a}) \\times ${b} = ${mid}$`, `$${mid} \\times (${c}) = ${ans}$`, final(String(ans))]), ans };
  })(),
  (() => {
    const a = -4, b = 3, c = -2;
    const mid = a * b, ans = mid * c;
    return { q: `Work out $(${a}) \\times ${b} \\times (${c})$.`, a: lines([`$(${a}) \\times ${b} = ${mid}$`, `$${mid} \\times (${c}) = ${ans}$`, final(String(ans))]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 30 || v2.ans !== 24) throw new Error('mixed mul'); }
);

// 36 Calculator negatives
add('Negatives 2 — Multiply & Divide', 'Negatives on a calculator', 'neg-calc',
  'Use the (−) key and brackets. The minus key is for subtraction. −6² means −(6²).',
  (() => {
    const n = 6, ans = n * n;
    return { q: `Work out $(-${n})^{2}$.`, a: lines([`$(-${n}) \\times (-${n}) = ${ans}$`, final(String(ans))]), ans };
  })(),
  (() => {
    const n = 8, ans = n * n;
    return { q: `Work out $(-${n})^{2}$.`, a: lines([`$(-${n}) \\times (-${n}) = ${ans}$`, final(String(ans))]), ans };
  })(),
  (v1, v2) => { if (v1.ans !== 36 || v2.ans !== 64) throw new Error('calc'); }
);

if (items.length !== 36) throw new Error('expected 36 items, got ' + items.length);

const rawLt = items.some(it => [it.v1.q, it.v2.q, it.v1.a, it.v2.a].some(s => /<(?!br>)/.test(s)));
if (rawLt) throw new Error('raw < in a question or answer');

const publicItems = items.map(({ unit, topic, id, note, v1, v2 }) => ({
  unit, topic, id, note,
  v1: { q: v1.q, a: v1.a },
  v2: { q: v2.q, a: v2.a }
}));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Year 7 Cycle 1 relay — preview</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
<style>
  :root { --ink:#1a1a1a; --c1:#1a3a5c; --bg:#f7f7f5; --card:#fff; --rule:#e2e2e2; --soft:#888; }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body { font-family: 'Segoe UI', system-ui, Arial, sans-serif; background: var(--bg); color: var(--ink); }
  header { background: var(--ink); color: #fff; min-height: 52px; display: flex; align-items: center; gap: 14px; padding: 8px 20px; flex-wrap: wrap; }
  header h1 { font-size: 15px; margin: 0; font-weight: 700; }
  header .tag { font-size: 11px; letter-spacing: .04em; text-transform: uppercase; background: #b45309; color: #fff; border-radius: 3px; padding: 3px 8px; font-weight: 700; }
  header .sub { color: rgba(255,255,255,.55); font-size: 12px; }
  header .spacer { flex: 1; }
  button, select { font-family: inherit; cursor: pointer; }
  .bar-btn { background: rgba(255,255,255,.12); color: #fff; border: 0; border-radius: 3px; padding: 6px 10px; font-size: 12px; font-weight: 700; }
  .bar-btn[aria-pressed="true"] { background: #fff; color: var(--ink); }
  main { height: calc(100% - 52px); display: flex; flex-direction: column; }
  .progress { display: flex; gap: 4px; padding: 10px 20px 0; flex-wrap: wrap; }
  .dot { width: 18px; height: 6px; border-radius: 3px; background: #ddd; border: 0; padding: 0; }
  .dot.on { background: var(--c1); }
  .dot.past { background: #8aa0b8; }
  .stage { flex: 1; display: flex; flex-direction: column; padding: 12px 28px 20px; min-height: 0; }
  .meta { color: var(--c1); font-size: 13px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
  .topic { margin-top: 4px; font-size: 16px; color: #333; }
  .count { color: var(--soft); font-weight: 600; font-size: 13px; margin-left: 8px; }
  .q { margin-top: 28px; font-size: 40px; line-height: 1.35; }
  .q .katex { font-size: 1em; }
  .reveal { margin-top: auto; }
  .show { width: 100%; text-align: left; background: var(--card); border: 1px solid var(--rule); border-radius: 6px; padding: 16px 18px; font-size: 16px; font-weight: 700; color: var(--c1); }
  .answer { display: none; background: #fffbf0; border: 1px solid #ead9a8; border-radius: 6px; padding: 16px 18px 14px; }
  .answer.show { display: block; }
  .answer .work { font-size: 28px; line-height: 1.45; }
  .note { margin-top: 10px; font-size: 14px; color: #5c4a12; }
  .note strong { font-size: 11px; letter-spacing: .06em; text-transform: uppercase; display: block; margin-bottom: 2px; }
  .nav { display: flex; gap: 8px; margin-top: 12px; }
  .nav button { background: var(--c1); color: #fff; border: 0; border-radius: 4px; padding: 10px 16px; font-weight: 700; font-size: 14px; }
  .nav button.ghost { background: #fff; color: var(--ink); border: 1px solid var(--rule); }
  .keys { margin-top: 8px; color: var(--soft); font-size: 12px; }
  #all { display: none; padding: 20px 28px 48px; }
  #all.open { display: block; }
  main.hidden { display: none; }
  .card { background: #fff; border: 1px solid var(--rule); border-radius: 6px; padding: 14px 16px; margin: 0 0 12px; }
  .card h2 { font-size: 13px; margin: 0 0 8px; color: var(--c1); text-transform: uppercase; letter-spacing: .04em; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .pair h3 { margin: 0 0 6px; font-size: 12px; color: var(--soft); }
  .aq { font-size: 18px; }
  .aa { margin-top: 8px; background: #fffbf0; border-radius: 4px; padding: 8px 10px; font-size: 16px; }
  .notes { background: #fff; border: 1px solid var(--rule); border-radius: 6px; padding: 14px 16px; margin-bottom: 16px; font-size: 14px; line-height: 1.5; }
  .notes h2 { margin: 0 0 8px; font-size: 15px; }
  @media (max-width: 800px) { .q { font-size: 28px; } .pair { grid-template-columns: 1fr; } .answer .work { font-size: 22px; } }
</style>
</head>
<body>
<header>
  <span class="tag">Preview</span>
  <h1>Year 7 · Cycle 1 relay</h1>
  <span class="sub">Not on the year page</span>
  <span class="spacer"></span>
  <button class="bar-btn" id="vBtn" type="button">V1</button>
  <button class="bar-btn" id="allBtn" type="button" aria-pressed="false">All 36</button>
</header>
<main id="lesson">
  <div class="progress" id="dots"></div>
  <div class="stage">
    <div><span class="meta" id="unit"></span><span class="count" id="count"></span></div>
    <div class="topic" id="topic"></div>
    <div class="q" id="q"></div>
    <div class="reveal">
      <button class="show" id="showBtn" type="button">Show answer</button>
      <div class="answer" id="answer">
        <div class="work" id="work"></div>
        <div class="note"><strong>Teacher note</strong><span id="note"></span></div>
      </div>
      <div class="nav">
        <button class="ghost" id="prev" type="button">Previous</button>
        <button id="next" type="button">Next</button>
      </div>
      <div class="keys">Arrow keys move. Space shows the answer. V switches to the other set of numbers.</div>
    </div>
  </div>
</main>
<div id="all"></div>
<script>
const ITEMS = ${JSON.stringify(publicItems)};
let i = 0;
let version = 'v1';
let revealed = false;
let allMode = false;

function renderMath(el) {
  if (!window.renderMathInElement) return;
  renderMathInElement(el, { delimiters: [{ left: '$', right: '$', display: false }], throwOnError: false });
}

function side(item) { return item[version]; }

function paint() {
  const item = ITEMS[i];
  document.getElementById('unit').textContent = item.unit;
  document.getElementById('topic').textContent = item.topic;
  document.getElementById('count').textContent = (i + 1) + ' of ' + ITEMS.length;
  document.getElementById('q').innerHTML = side(item).q;
  document.getElementById('work').innerHTML = side(item).a;
  document.getElementById('note').textContent = item.note;
  document.getElementById('showBtn').style.display = revealed ? 'none' : 'block';
  document.getElementById('answer').classList.toggle('show', revealed);
  document.getElementById('vBtn').textContent = version.toUpperCase();
  document.getElementById('next').textContent = i === ITEMS.length - 1 ? 'End' : 'Next';
  const dots = document.getElementById('dots');
  dots.innerHTML = '';
  ITEMS.forEach((it, n) => {
    const b = document.createElement('button');
    b.className = 'dot' + (n === i ? ' on' : n < i ? ' past' : '');
    b.type = 'button';
    b.title = it.topic;
    b.addEventListener('click', () => { i = n; revealed = false; paint(); });
    dots.appendChild(b);
  });
  renderMath(document.getElementById('lesson'));
  const hash = (i + 1) + '/' + version + (revealed ? '/show' : '');
  if (location.hash.slice(1) !== hash && !allMode) history.replaceState(null, '', '#' + hash);
}

function paintAll() {
  const root = document.getElementById('all');
  const slips = '<div class="notes"><h2>Notes for you</h2><p>One fluency question for each of the 36 Cycle 1 topics. V2 is the same skill with different numbers. Answers were worked out in code, then checked again.</p><p>Four examples already on the scheme do not calculate, so they were not copied: 347 + 16 = 507, 53 − 217 = 313, 23 × 54 ÷ 100 = 1242, and 25 ÷ 4 = 625. The decimal-places example 24362 → 24 is missing a decimal point.</p><p>These are the one-step questions, the kind a class can answer in about 45 seconds. Say insert when you want this on the Year 7 page.</p></div>';
  let html = slips;
  let unit = '';
  ITEMS.forEach((it, n) => {
    if (it.unit !== unit) { unit = it.unit; html += '<h2 style="font-size:18px;margin:18px 0 8px">' + unit + '</h2>'; }
    html += '<article class="card"><h2>' + (n + 1) + '. ' + it.topic + '</h2><div class="pair"><div><h3>V1</h3><div class="aq">' + it.v1.q + '</div><div class="aa">' + it.v1.a + '</div></div><div><h3>V2</h3><div class="aq">' + it.v2.q + '</div><div class="aa">' + it.v2.a + '</div></div></div><div class="note"><strong>Teacher note</strong>' + it.note + '</div></article>';
  });
  root.innerHTML = html;
  renderMath(root);
}

function readHash() {
  const h = location.hash.replace('#', '');
  if (h === 'all') { allMode = true; return; }
  const m = h.match(/^(\\d+)\\/(v1|v2)(\\/show)?$/);
  if (!m) return;
  const n = Number(m[1]);
  if (n >= 1 && n <= ITEMS.length) i = n - 1;
  version = m[2];
  revealed = !!m[3];
}

function setMode(all) {
  allMode = all;
  document.getElementById('lesson').classList.toggle('hidden', all);
  document.getElementById('all').classList.toggle('open', all);
  document.getElementById('allBtn').setAttribute('aria-pressed', all ? 'true' : 'false');
  if (all) { paintAll(); history.replaceState(null, '', '#all'); }
  else paint();
}

document.getElementById('showBtn').addEventListener('click', () => { revealed = true; paint(); });
document.getElementById('next').addEventListener('click', () => { if (i < ITEMS.length - 1) { i++; revealed = false; paint(); } });
document.getElementById('prev').addEventListener('click', () => { if (i > 0) { i--; revealed = false; paint(); } });
document.getElementById('vBtn').addEventListener('click', () => { version = version === 'v1' ? 'v2' : 'v1'; revealed = false; paint(); });
document.getElementById('allBtn').addEventListener('click', () => setMode(!allMode));
document.addEventListener('keydown', (e) => {
  if (allMode) return;
  if (e.key === 'ArrowRight') { if (i < ITEMS.length - 1) { i++; revealed = false; paint(); } }
  if (e.key === 'ArrowLeft') { if (i > 0) { i--; revealed = false; paint(); } }
  if (e.key === ' ') { e.preventDefault(); revealed = !revealed; paint(); }
  if (e.key === 'v' || e.key === 'V') { version = version === 'v1' ? 'v2' : 'v1'; revealed = false; paint(); }
});

function boot() {
  readHash();
  setMode(allMode);
}
if (document.readyState === 'complete') boot();
else window.addEventListener('load', boot);
</script>
</body>
</html>
`;

const out = path.join(__dirname, 'y7-cycle-1-relay.html');
fs.writeFileSync(out, html);
console.log('wrote', out, 'items', items.length);
