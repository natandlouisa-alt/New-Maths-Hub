#!/usr/bin/env node
/**
 * Year 8 Cycle 1 revision board. One fluency question per topic, three versions.
 */
function final(expr) { return `$\\boldsymbol{${expr}}$`; }
function finalText(s) { return `$\\boldsymbol{\\text{${s}}}$`; }
function gbp(n) { return `\\text{£}${n}`; }
function lines(arr) { return arr.join('<br>'); }
function three(make, specs) { return specs.map(make); }

const items = [];
function add(unit, topic, id, versions) {
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
}

function pctOf(amount, pct) {
  return amount * pct / 100;
}

add('Percentages', 'Percentage of amounts', 'percentage-of-amounts', three(({ amount, pct }) => {
  const ans = pctOf(amount, pct);
  return { q: `Work out $${pct}\\%$ of $${amount}$.`, a: lines([`$\\dfrac{${pct}}{100} \\times ${amount} = ${ans}$`, final(String(ans))]) };
}, [{ amount: 60, pct: 15 }, { amount: 80, pct: 25 }, { amount: 45, pct: 20 }]));

add('Percentages', 'Percentage increase (non calc)', 'percentage-increase-non-calc', three(({ amount, pct }) => {
  const extra = pctOf(amount, pct), ans = amount + extra;
  return { q: `Increase $${amount}$ by $${pct}\\%$.`, a: lines([`$${pct}\\%$ of $${amount} = ${extra}$`, `$${amount} + ${extra} = ${ans}$`, final(String(ans))]) };
}, [{ amount: 40, pct: 20 }, { amount: 50, pct: 10 }, { amount: 60, pct: 25 }]));

add('Percentages', 'Percentage decrease (non calc)', 'percentage-decrease-non-calc', three(({ amount, pct }) => {
  const drop = pctOf(amount, pct), ans = amount - drop;
  return { q: `Decrease $${amount}$ by $${pct}\\%$.`, a: lines([`$${pct}\\%$ of $${amount} = ${drop}$`, `$${amount} - ${drop} = ${ans}$`, final(String(ans))]) };
}, [{ amount: 80, pct: 15 }, { amount: 40, pct: 10 }, { amount: 90, pct: 20 }]));

add('Percentages', 'Percentage of amount (multipliers)', 'percentage-of-amount-multipliers', three(({ amount, pct }) => {
  const m = pct / 100, ans = amount * m;
  const mTex = Number.isInteger(m * 100) && pct % 1 === 0 ? m.toString() : String(m);
  return { q: `Work out $${pct}\\%$ of $${amount}$ using a multiplier.`, a: lines([`Multiplier $= ${mTex}$`, `$${amount} \\times ${mTex} = ${ans}$`, final(String(ans))]) };
}, [{ amount: 60, pct: 15 }, { amount: 50, pct: 12 }, { amount: 80, pct: 35 }]));

add('Percentages', 'Percentage increase (multipliers)', 'percentage-increase-multipliers', three(({ amount, pct }) => {
  const m = 1 + pct / 100, ans = amount * m;
  return { q: `Increase $${amount}$ by $${pct}\\%$ using a multiplier.`, a: lines([`Multiplier $= ${m}$`, `$${amount} \\times ${m} = ${ans}$`, final(String(ans))]) };
}, [{ amount: 40, pct: 20 }, { amount: 80, pct: 10 }, { amount: 25, pct: 40 }]));

add('Percentages', 'Percentage decrease (multipliers)', 'percentage-decrease-multipliers', three(({ amount, pct }) => {
  const m = 1 - pct / 100, ans = amount * m;
  return { q: `Decrease $${amount}$ by $${pct}\\%$ using a multiplier.`, a: lines([`Multiplier $= ${m}$`, `$${amount} \\times ${m} = ${ans}$`, final(String(ans))]) };
}, [{ amount: 80, pct: 15 }, { amount: 60, pct: 10 }, { amount: 50, pct: 25 }]));

function money(a, b, op) {
  const scale = 2;
  const A = Math.round(a * 100), B = Math.round(b * 100);
  const out = op === 'add' ? A + B : A - B;
  return (out / 100).toFixed(2);
}
add('Money', 'Calculating with money', 'calculating-with-money', three(({ a, b }) => {
  const ans = money(a, b, 'add');
  const aTex = a.toFixed(2), bTex = b.toFixed(2);
  return { q: `Work out $${gbp(aTex)}+${gbp(bTex)}$.`, a: lines([`$${gbp(aTex)}+${gbp(bTex)}=${gbp(ans)}$`, final(gbp(ans))]) };
}, [{ a: 3.45, b: 7.80 }, { a: 2.60, b: 4.75 }, { a: 9.99, b: 1.50 }]));

add('Money', 'Best buys', 'best-buys', [
  { q: `Which is better value: $${gbp('2.40')}$ for $6$, or $${gbp('3.00')}$ for $8$?`, a: lines([`$${gbp('2.40')} \\div 6 = 40$p each`, `$${gbp('3.00')} \\div 8 = 37.5$p each`, finalText('£3.00 for 8')]) },
  { q: `Which is better value: $${gbp('1.80')}$ for $4$, or $${gbp('2.50')}$ for $5$?`, a: lines([`$${gbp('1.80')} \\div 4 = 45$p each`, `$${gbp('2.50')} \\div 5 = 50$p each`, finalText('£1.80 for 4')]) },
  { q: `Which is better value: $${gbp('4.20')}$ for $6$, or $${gbp('5.20')}$ for $8$?`, a: lines([`$${gbp('4.20')} \\div 6 = 70$p each`, `$${gbp('5.20')} \\div 8 = 65$p each`, finalText('£5.20 for 8')]) }
]);

add('Indices', 'Index laws – multiplying', 'index-laws-multiplying', three(({ base, p, q }) => {
  const ans = p + q;
  return { q: `Simplify $${base}^{${p}} \\times ${base}^{${q}}$.`, a: lines([`Same base, add the powers.`, `$${p} + ${q} = ${ans}$`, final(`${base}^{${ans}}`)]) };
}, [{ base: 'a', p: 3, q: 4 }, { base: 'x', p: 2, q: 5 }, { base: 'm', p: 6, q: 1 }]));

add('Indices', 'Index laws – dividing', 'index-laws-dividing', three(({ base, p, q }) => {
  const ans = p - q;
  return { q: `Simplify $${base}^{${p}} \\div ${base}^{${q}}$.`, a: lines([`Same base, subtract the powers.`, `$${p} - ${q} = ${ans}$`, final(`${base}^{${ans}}`)]) };
}, [{ base: 'a', p: 7, q: 3 }, { base: 'x', p: 9, q: 4 }, { base: 'n', p: 5, q: 2 }]));

add('Indices', 'Index laws – brackets', 'index-laws-brackets', three(({ base, p, q }) => {
  const ans = p * q;
  return { q: `Simplify $(${base}^{${p}})^{${q}}$.`, a: lines([`Multiply the powers.`, `$${p} \\times ${q} = ${ans}$`, final(`${base}^{${ans}}`)]) };
}, [{ base: 'a', p: 3, q: 2 }, { base: 'x', p: 4, q: 3 }, { base: 'b', p: 2, q: 5 }]));

add('Indices', 'Index laws – negative powers to fractions', 'index-laws-negative-powers-to-fractions', three(({ base, p }) => {
  return { q: `Write $${base}^{-${p}}$ as a fraction.`, a: lines([`A negative power is the reciprocal.`, final(`\\dfrac{1}{${base}^{${p}}}`)]) };
}, [{ base: 'x', p: 2 }, { base: 'a', p: 3 }, { base: 'n', p: 4 }]));

add('Indices', 'Simplifying algebraic fractions', 'simplifying-algebraic-fractions', [
  { q: 'Simplify $\\dfrac{6a^{3}}{2a}$.', a: lines(['$\\dfrac{6}{2}=3$', '$a^{3} \\div a = a^{2}$', final('3a^{2}')]) },
  { q: 'Simplify $\\dfrac{10x^{5}}{2x^{2}}$.', a: lines(['$\\dfrac{10}{2}=5$', '$x^{5} \\div x^{2} = x^{3}$', final('5x^{3}')]) },
  { q: 'Simplify $\\dfrac{12m^{4}}{3m}$.', a: lines(['$\\dfrac{12}{3}=4$', '$m^{4} \\div m = m^{3}$', final('4m^{3}')]) }
]);

add('Equations', 'Solving in the form x+a/b=c', 'solving-in-the-form-x-a-b-c', three(({ a, b, c }) => {
  const ans = c * b - a;
  return { q: `Solve $\\dfrac{x+${a}}{${b}} = ${c}$.`, a: lines([`$x + ${a} = ${c * b}$`, `$x = ${c * b} - ${a}$`, final(`x=${ans}`)]) };
}, [{ a: 3, b: 5, c: 4 }, { a: 2, b: 3, c: 6 }, { a: 5, b: 4, c: 3 }]));

add('Equations', 'Solving equations with brackets', 'solving-equations-with-brackets', three(({ k, a, total }) => {
  const after = total - k * a, ans = after / k;
  if (!Number.isInteger(ans)) throw new Error('not int brackets');
  return { q: `Solve $${k}(x+${a}) = ${total}$.`, a: lines([`$${k}x + ${k * a} = ${total}$`, `$${k}x = ${after}$`, final(`x=${ans}`)]) };
}, [{ k: 3, a: 2, total: 21 }, { k: 4, a: 1, total: 20 }, { k: 5, a: 3, total: 40 }]));

add('Equations', 'Solving equations (unknown denominator)', 'solving-equations-unknown-denominator', three(({ num, rhs }) => {
  const ans = num / rhs;
  if (!Number.isInteger(ans)) throw new Error('not int den');
  return { q: `Solve $\\dfrac{${num}}{x} = ${rhs}$.`, a: lines([`$${num} = ${rhs}x$`, `$x = ${num} \\div ${rhs}$`, final(`x=${ans}`)]) };
}, [{ num: 12, rhs: 3 }, { num: 20, rhs: 4 }, { num: 18, rhs: 6 }]));

add('Equations', 'Solving equations (unknown both sides)', 'solving-equations-unknown-both-sides', three(({ a, p, b, q }) => {
  const left = a - b, right = q - p, ans = right / left;
  if (!Number.isInteger(ans)) throw new Error('not int both');
  return { q: `Solve $${a}x + ${p} = ${b}x + ${q}$.`, a: lines([`$${a}x - ${b}x = ${q} - ${p}$`, `$${left}x = ${right}$`, final(`x=${ans}`)]) };
}, [{ a: 5, p: 3, b: 2, q: 18 }, { a: 7, p: 4, b: 3, q: 20 }, { a: 6, p: 1, b: 2, q: 17 }]));

add('Equations', 'Constructing and solving', 'constructing-and-solving', three(({ addend, total }) => {
  const ans = total - addend;
  return { q: `A number plus $${addend}$ is $${total}$. Find the number.`, a: lines([`$x + ${addend} = ${total}$`, `$x = ${total} - ${addend}$`, final(String(ans))]) };
}, [{ addend: 7, total: 20 }, { addend: 9, total: 31 }, { addend: 12, total: 40 }]));

add('Sequences', 'Term to term rule', 'term-to-term-rule', three(({ seq, rule }) => {
  return { q: `Write the term-to-term rule for $${seq}$.`, a: final(rule) };
}, [{ seq: '2,\\ 5,\\ 8,\\ 11', rule: '+3' }, { seq: '20,\\ 16,\\ 12,\\ 8', rule: '-4' }, { seq: '3,\\ 6,\\ 12,\\ 24', rule: '\\times 2' }]));

add('Sequences', 'Generating sequences', 'generating-sequences', three(({ first, step }) => {
  const seq = [first, first + step, first + 2 * step, first + 3 * step];
  return { q: `The first term is $${first}$ and the rule is $+${step}$. Write the first four terms.`, a: final(seq.join(',\\ ') ) };
}, [{ first: 3, step: 4 }, { first: 5, step: 6 }, { first: 8, step: 3 }]));

add('Sequences', 'Problem Solving with Patterns', 'problem-solving-with-sequences', three(({ first, step, over }) => {
  let n = 1, t = first;
  while (t <= over) { n++; t = first + (n - 1) * step; }
  return { q: `The sequence is $${first},\\ ${first + step},\\ ${first + 2 * step},\\ ${first + 3 * step},\\ \\ldots$ What is the first term greater than $${over}$?`, a: lines([`Term-to-term rule $+${step}$.`, `Keep adding until the term is greater than $${over}$.`, final(String(t))]) };
}, [{ first: 4, step: 3, over: 50 }, { first: 5, step: 4, over: 30 }, { first: 2, step: 7, over: 40 }]));

add('Sequences', 'Special sequences', 'special-sequences', [
  { q: 'What type of special sequence is $1,\\ 4,\\ 9,\\ 16,\\ 25$?', a: finalText('Square numbers') },
  { q: 'What type of special sequence is $1,\\ 8,\\ 27,\\ 64,\\ 125$?', a: finalText('Cube numbers') },
  { q: 'What type of special sequence is $1,\\ 1,\\ 2,\\ 3,\\ 5,\\ 8$?', a: finalText('Fibonacci') }
]);

add('Sequences', 'Nth term ascending', 'nth-term-ascending', three(({ d, t1 }) => {
  const c = t1 - d;
  const tex = c < 0 ? `${d}n${c}` : `${d}n+${c}`;
  return { q: `Find the $n$th term of $${t1},\\ ${t1 + d},\\ ${t1 + 2 * d},\\ ${t1 + 3 * d}$.`, a: lines([`Common difference $= ${d}$`, `Term $1$: $${d}\\times 1 + (${c}) = ${t1}$`, final(tex)]) };
}, [{ d: 4, t1: 3 }, { d: 5, t1: 2 }, { d: 3, t1: 7 }]));

add('Sequences', 'Nth term descending', 'nth-term-descending', three(({ d, t1 }) => {
  const c = t1 - d;
  const tex = `${c}${d}n`;
  return { q: `Find the $n$th term of $${t1},\\ ${t1 + d},\\ ${t1 + 2 * d},\\ ${t1 + 3 * d}$.`, a: lines([`Common difference $= ${d}$`, `Term $1$: $${d}\\times 1 + ${c} = ${t1}$`, final(tex)]) };
}, [{ d: -3, t1: 20 }, { d: -4, t1: 19 }, { d: -2, t1: 11 }]));

add('Sequences', 'Is it in the sequence?', 'is-it-in-the-sequence', three(({ d, c, val }) => {
  // nth = d n + c, or 4n-1 style
  const n = (val - c) / d;
  const inSeq = Number.isInteger(n) && n >= 1;
  const nth = c < 0 ? `${d}n${c}` : `${d}n+${c}`;
  return { q: `Is $${val}$ in the sequence with $n$th term $${nth}$?`, a: lines([`$${nth} = ${val}$`, `$${d}n = ${val - c}$`, `$n = ${n}$`, finalText(inSeq ? 'Yes' : 'No')]) };
}, [{ d: 4, c: -1, val: 41 }, { d: 3, c: 2, val: 20 }, { d: 5, c: -2, val: 33 }]));

add('Ratio', 'Intro to ratio', 'intro-to-ratio', [
  { q: 'In the ratio $3:2$ of red to blue, what does the $3$ stand for?', a: finalText('3 red for every 2 blue') },
  { q: 'In the ratio $5:1$ of girls to boys, what does the $5$ stand for?', a: finalText('5 girls for every 1 boy') },
  { q: 'In the ratio $4:3$ of flour to sugar, what does the $4$ stand for?', a: finalText('4 parts flour for every 3 parts sugar') }
]);

add('Ratio', 'Simplifying ratios', 'simplifying-ratios', three(({ a, b, hcf }) => {
  return { q: `Simplify $${a}:${b}$.`, a: lines([`Divide both parts by $${hcf}$.`, final(`${a / hcf}:${b / hcf}`)]) };
}, [{ a: 12, b: 8, hcf: 4 }, { a: 18, b: 24, hcf: 6 }, { a: 15, b: 25, hcf: 5 }]));

add('Ratio', 'Equivalent ratios', 'equivalent-ratios', three(({ a, b, k }) => {
  return { q: `Write a ratio equivalent to $${a}:${b}$ by multiplying both parts by $${k}$.`, a: final(`${a * k}:${b * k}`) };
}, [{ a: 2, b: 3, k: 4 }, { a: 5, b: 2, k: 3 }, { a: 3, b: 7, k: 2 }]));

add('Ratio', 'Applying ratios', 'applying-ratios', three(({ a, b, given, which }) => {
  const other = which === 'first' ? given * b / a : given * a / b;
  const ask = which === 'first' ? `flour is $${given}$ kg` : `sugar is $${given}$ kg`;
  const find = which === 'first' ? 'sugar' : 'flour';
  return { q: `Flour to sugar is $${a}:${b}$. If ${ask}, how much ${find} is needed?`, a: lines([`$${a}$ parts flour : $${b}$ parts sugar.`, final(`${other}\\ \\text{kg}`)]) };
}, [{ a: 2, b: 3, given: 10, which: 'first' }, { a: 4, b: 5, given: 12, which: 'first' }, { a: 3, b: 2, given: 8, which: 'second' }]));

add('Ratio', 'Writing ratio in the form 1:n', 'writing-ratio-in-the-form-1-n', three(({ a, b }) => {
  const n = b / a;
  return { q: `Write $${a}:${b}$ in the form $1:n$.`, a: lines([`Divide both parts by $${a}$.`, final(`1:${n}`)]) };
}, [{ a: 4, b: 10 }, { a: 5, b: 8 }, { a: 2, b: 7 }]));

add('Ratio', 'Ratio to fraction', 'ratio-to-fraction', three(({ a, b }) => {
  const t = a + b;
  return { q: `Write $${a}:${b}$ as two fractions of the whole.`, a: lines([`Total parts $= ${t}$`, final(`\\dfrac{${a}}{${t}}\\ \\text{and}\\ \\dfrac{${b}}{${t}}`)]) };
}, [{ a: 3, b: 5 }, { a: 2, b: 7 }, { a: 4, b: 1 }]));

add('Ratio', 'Fraction to ratio', 'fraction-to-ratio', three(({ n, d }) => {
  const other = d - n;
  return { q: `$\\dfrac{${n}}{${d}}$ of a class are boys. Write the ratio of boys to girls.`, a: lines([`Girls $= \\dfrac{${other}}{${d}}$`, final(`${n}:${other}`)]) };
}, [{ n: 2, d: 5 }, { n: 3, d: 8 }, { n: 5, d: 9 }]));

add('Ratio', 'Sharing ratio (whole)', 'sharing-ratio-whole', three(({ total, a, b }) => {
  const parts = a + b, one = total / parts;
  if (!Number.isInteger(one)) throw new Error('share whole');
  return { q: `Share $${gbp(total)}$ in the ratio $${a}:${b}$.`, a: lines([`$${a}+${b}=${parts}$ parts`, `$1$ part $=${gbp(one)}$`, final(`${gbp(one * a)}:${gbp(one * b)}`)]) };
}, [{ total: 40, a: 3, b: 5 }, { total: 56, a: 3, b: 4 }, { total: 72, a: 1, b: 5 }]));

add('Ratio', 'Sharing ratio (part)', 'sharing-ratio-part', three(({ a, b, partVal, part }) => {
  const one = partVal / (part === 'a' ? a : b);
  const total = one * (a + b);
  return { q: `A ratio is $${a}:${b}$. The first share is $${gbp(partVal)}$. What is the total?`, a: lines([`$1$ part $=${gbp(one)}$`, `$${a + b}$ parts $=${gbp(total)}$`, final(gbp(total))]) };
}, [{ a: 2, b: 3, partVal: 12, part: 'a' }, { a: 4, b: 1, partVal: 20, part: 'a' }, { a: 5, b: 3, partVal: 15, part: 'a' }]));

add('Ratio', 'Sharing ratio (difference)', 'sharing-ratio-difference', three(({ a, b, diff }) => {
  const dParts = Math.abs(b - a);
  const one = diff / dParts;
  return { q: `A ratio is $${a}:${b}$. The shares differ by $${gbp(diff)}$. Find the two shares.`, a: lines([`Difference $= ${dParts}$ parts $=${gbp(diff)}$`, `$1$ part $=${gbp(one)}$`, final(`${gbp(one * a)}:${gbp(one * b)}`)]) };
}, [{ a: 3, b: 5, diff: 20 }, { a: 2, b: 7, diff: 30 }, { a: 1, b: 4, diff: 18 }]));

add('Ratio', 'Sharing ratio (mixed)', 'sharing-ratio-mixed', [
  { q: `Share $${gbp(60)}$ in the ratio $2:3$.`, a: lines([`$5$ parts, $1$ part $=${gbp(12)}$`, final(`${gbp(24)}:${gbp(36)}`)]) },
  { q: `Ratio $3:5$. The smaller share is $${gbp(12)}$. Find the larger share.`, a: lines([`$1$ part $=${gbp(4)}$`, final(gbp(20))]) },
  { q: `Ratio $4:7$. The shares differ by $${gbp(15)}$. Find the smaller share.`, a: lines([`$3$ parts $=${gbp(15)}$, $1$ part $=${gbp(5)}$`, final(gbp(20))]) }
]);

add('Ratio', 'Maps and scales', 'maps-and-scales', three(({ scale, cm }) => {
  const realCm = cm * scale;
  const km = realCm / 100000;
  return { q: `A map scale is $1:${scale}$. A road is $${cm}$ cm on the map. How long is it in real life?`, a: lines([`$${cm} \\times ${scale} = ${realCm}$ cm`, `$${realCm}$ cm $= ${km}$ km`, final(`${km}\\ \\text{km}`)]) };
}, [{ scale: 25000, cm: 4 }, { scale: 50000, cm: 3 }, { scale: 10000, cm: 6 }]));

if (items.length !== 37) throw new Error('expected 37 items, got ' + items.length);

const { writeBoard } = require('./assemble-board');
writeBoard({ year: 8, cycle: 1, items, tag: 'Year 8' });
