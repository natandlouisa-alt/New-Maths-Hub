#!/usr/bin/env node
/**
 * Year 9 Cycle 1 revision board. One fluency question per topic, three versions.
 */
function final(expr) { return `$\\boldsymbol{${expr}}$`; }
function finalText(s) { return `$\\boldsymbol{\\text{${s}}}$`; }
function gbp(n) { return `\\text{£}${n}`; }
function lines(arr) { return arr.join('<br>'); }
function three(make, specs) { return specs.map(make); }
function sf(a, n) { return `${a}\\times 10^{${n}}`; }

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

add('Fractions & Percentages', 'Percentage change (formula)', 'percentage-change-formula', three(({ oldAmt, neu }) => {
  const change = neu - oldAmt;
  const pct = (change / oldAmt) * 100;
  const word = change > 0 ? 'increase' : 'decrease';
  return {
    q: `A price changes from $${gbp(oldAmt)}$ to $${gbp(neu)}$. Work out the percentage change.`,
    a: lines([
      `Change $= ${neu}-${oldAmt}=${change}$`,
      `$\\dfrac{${change}}{${oldAmt}}\\times 100 = ${Math.abs(pct)}$`,
      final(`${Math.abs(pct)}\\%\\ \\text{${word}}`)
    ])
  };
}, [{ oldAmt: 40, neu: 46 }, { oldAmt: 50, neu: 40 }, { oldAmt: 80, neu: 100 }]));

add('Fractions & Percentages', 'Reverse percentages (Original amount)', 'reverse-percentages', three(({ neu, pct, up }) => {
  const m = up ? 1 + pct / 100 : 1 - pct / 100;
  const orig = neu / m;
  return {
    q: `After a $${pct}\\%$ ${up ? 'increase' : 'decrease'}, an amount is $${gbp(neu)}$. Find the original amount.`,
    a: lines([
      `Multiplier $= ${m}$`,
      `Original $= ${neu} \\div ${m} = ${orig}$`,
      final(gbp(orig))
    ])
  };
}, [{ neu: 60, pct: 20, up: true }, { neu: 72, pct: 10, up: false }, { neu: 105, pct: 5, up: true }]));

add('Fractions & Percentages', 'Simple Interest', 'simple-interest', three(({ p, r, t }) => {
  const i = p * r * t / 100;
  return {
    q: `Find the simple interest on $${gbp(p)}$ at $${r}\\%$ for $${t}$ years.`,
    a: lines([
      `$I = \\dfrac{P \\times R \\times T}{100}$`,
      `$I = \\dfrac{${p}\\times ${r}\\times ${t}}{100} = ${i}$`,
      final(gbp(i))
    ])
  };
}, [{ p: 500, r: 4, t: 3 }, { p: 800, r: 5, t: 2 }, { p: 600, r: 3, t: 5 }]));

add('Fractions & Percentages', 'Compound Interest', 'compound-interest', three(({ p, r, t, total, interest }) => {
  const m = 1 + r / 100;
  return {
    q: `$${gbp(p)}$ is invested at $${r}\\%$ compound interest for $${t}$ years. Find the total amount.`,
    a: lines([
      `Amount $= ${p}\\times ${m}^{${t}}$`,
      `$= ${total}$`,
      final(gbp(total))
    ])
  };
}, [
  { p: 500, r: 4, t: 2, total: '540.80' },
  { p: 200, r: 10, t: 2, total: '242' },
  { p: 1000, r: 5, t: 2, total: '1102.50' }
]));

add('Probability', 'Experimental probability', 'experimental-probability', three(({ fav, tot, num, den }) => {
  return {
    q: `A spinner lands on red $${fav}$ times in $${tot}$ spins. Write the experimental probability of red as a fraction in its simplest form.`,
    a: lines([`$\\dfrac{${fav}}{${tot}} = \\dfrac{${num}}{${den}}$`, final(`\\dfrac{${num}}{${den}}`)])
  };
}, [{ fav: 18, tot: 30, num: 3, den: 5 }, { fav: 14, tot: 21, num: 2, den: 3 }, { fav: 21, tot: 28, num: 3, den: 4 }]));

add('Probability', 'Expected outcomes', 'expected-outcomes', three(({ pNum, pDen, n }) => {
  const ans = n * pNum / pDen;
  return {
    q: `$P(\\text{win})=\\dfrac{${pNum}}{${pDen}}$. In $${n}$ games, how many wins are expected?`,
    a: lines([`$\\dfrac{${pNum}}{${pDen}}\\times ${n} = ${ans}$`, final(String(ans))])
  };
}, [{ pNum: 1, pDen: 4, n: 80 }, { pNum: 1, pDen: 6, n: 30 }, { pNum: 3, pDen: 5, n: 40 }]));

add('Probability', 'Frequency trees – draw', 'frequency-trees-draw', three(({ total, sport }) => {
  const none = total - sport;
  return {
    q: `$${total}$ students. $${sport}$ play sport. How many do not play sport?`,
    a: lines([`$${total}-${sport}=${none}$`, final(String(none))])
  };
}, [{ total: 100, sport: 60 }, { total: 80, sport: 50 }, { total: 120, sport: 75 }]));

add('Probability', 'Frequency trees – interpret', 'frequency-trees-interpret', three(({ total, sport, football }) => {
  const notFoot = sport - football;
  return {
    q: `A frequency tree shows $${total}$ students, $${sport}$ play sport, and $${football}$ of those play football. Work out $P(\\text{sport but not football})$.`,
    a: lines([
      `Sport but not football $= ${sport}-${football}=${notFoot}$`,
      `$P=\\dfrac{${notFoot}}{${total}}$`,
      final(`\\dfrac{${notFoot}}{${total}}`)
    ])
  };
}, [{ total: 100, sport: 60, football: 40 }, { total: 80, sport: 50, football: 30 }, { total: 120, sport: 90, football: 54 }]));

add('Standard Form', 'Add and subtract standard form', 'standard-form-add-subtract', three(({ a, n, b, m, ansA, ansN }) => {
  return {
    q: `Work out $${sf(a, n)}+${sf(b, m)}$. Give your answer in standard form.`,
    a: lines([
      `Write with the same power of $10$, then add.`,
      final(sf(ansA, ansN))
    ])
  };
}, [
  { a: 3, n: 3, b: 2, m: 2, ansA: 3.2, ansN: 3 },
  { a: 4, n: 4, b: 5, m: 3, ansA: 4.5, ansN: 4 },
  { a: 6, n: 2, b: 4, m: 1, ansA: 6.4, ansN: 2 }
]));

add('Standard Form', 'Multiplying and dividing with standard form', 'standard-form-multiply-divide', three(({ a, n, b, m, ansA, ansN }) => {
  return {
    q: `Work out $(${sf(a, n)})\\times(${sf(b, m)})$. Give your answer in standard form.`,
    a: lines([
      `$${a}\\times ${b}=${a * b}$, and $${n}+${m}=${n + m}$`,
      final(sf(ansA, ansN))
    ])
  };
}, [
  { a: 2, n: 3, b: 3, m: 2, ansA: 6, ansN: 5 },
  { a: 4, n: 4, b: 2, m: 1, ansA: 8, ansN: 5 },
  { a: 5, n: 2, b: 3, m: 3, ansA: 1.5, ansN: 6 }
]));

add('Standard Form', 'Standard form on a calculator', 'standard-form-calculator', [
  { q: 'A calculator shows $2.5\\text{E}7$. Write this in standard form.', a: final('2.5\\times 10^{7}') },
  { q: 'A calculator shows $3.2\\text{E}5$. Write this in standard form.', a: final('3.2\\times 10^{5}') },
  { q: 'A calculator shows $4.1\\text{E}-3$. Write this in standard form.', a: final('4.1\\times 10^{-3}') }
]);

add('Inequalities', 'Solving inequalities one step', 'inequalities-one-step', three(({ add, rhs }) => {
  const ans = rhs - add;
  return {
    q: `Solve $x+${add}>${rhs}$.`,
    a: lines([`$x>${rhs}-${add}$`, final(`x>${ans}`)])
  };
}, [{ add: 4, rhs: 9 }, { add: 6, rhs: 14 }, { add: 2, rhs: 11 }]));

add('Inequalities', 'Solving inequalities multi step', 'inequalities-multi-step', three(({ k, add, rhs }) => {
  const mid = rhs - add, ans = mid / k;
  return {
    q: `Solve $${k}x+${add}<${rhs}$.`,
    a: lines([
      `$${k}x<${mid}$`,
      final(`x<${ans}`)
    ])
  };
}, [{ k: 3, add: 5, rhs: 20 }, { k: 4, add: 2, rhs: 18 }, { k: 2, add: 3, rhs: 15 }]));

add('Inequalities', 'Solving double inequalities', 'inequalities-double', three(({ a, sub, b }) => {
  const left = a + sub, right = b + sub;
  return {
    q: `Solve $${a}<x-${sub}<${b}$.`,
    a: lines([
      `Add $${sub}$ to all three parts.`,
      final(`${left}<x<${right}`)
    ])
  };
}, [{ a: -2, sub: 3, b: 5 }, { a: 1, sub: 4, b: 10 }, { a: -5, sub: 2, b: 3 }]));

add('Inequalities', 'Solving inequalities unknowns both sides', 'inequalities-both-sides', three(({ a, p, b, q }) => {
  const left = a - b, right = q + p, ans = right / left;
  return {
    q: `Solve $${a}x-${p}>${b}x+${q}$.`,
    a: lines([
      `Collect $x$ terms on one side.`,
      `$${left}x>${right}$`,
      final(`x>${ans}`)
    ])
  };
}, [{ a: 5, p: 2, b: 2, q: 7 }, { a: 7, p: 1, b: 3, q: 15 }, { a: 6, p: 2, b: 2, q: 18 }]));

add('Inequalities', 'Solving inequalities (switching signs)', 'inequalities-switching-signs', three(({ k, rhs }) => {
  const ans = rhs / k;
  return {
    q: `Solve $-${k}x<${rhs}$.`,
    a: lines([
      `Divide by $-${k}$ and flip the inequality.`,
      final(`x>${-ans}`)
    ])
  };
}, [{ k: 2, rhs: 8 }, { k: 3, rhs: 15 }, { k: 4, rhs: 12 }]));

add('Quadratics', 'Equivalent expressions', 'equivalent-expressions', [
  { q: 'Are $2(x+3)$ and $2x+6$ equivalent?', a: lines(['Expand: $2(x+3)=2x+6$.', finalText('Yes')]) },
  { q: 'Are $(x+3)^{2}$ and $x^{2}+9$ equivalent?', a: lines(['$(x+3)^{2}=x^{2}+6x+9$.', finalText('No')]) },
  { q: 'Are $3(x-2)$ and $3x-6$ equivalent?', a: lines(['Expand: $3(x-2)=3x-6$.', finalText('Yes')]) }
]);

add('Quadratics', 'Expanding double brackets (positive)', 'expanding-double-brackets-positive', three(({ a, b }) => {
  const mid = a + b, c = a * b;
  return {
    q: `Expand $(x+${a})(x+${b})$.`,
    a: lines([
      `$x^{2}+${b}x+${a}x+${c}$`,
      final(`x^{2}+${mid}x+${c}`)
    ])
  };
}, [{ a: 2, b: 3 }, { a: 4, b: 5 }, { a: 1, b: 6 }]));

add('Quadratics', 'Expanding double brackets (negatives)', 'expanding-double-brackets-negative', three(({ a, b }) => {
  const mid = -(a + b), c = a * b;
  return {
    q: `Expand $(x-${a})(x-${b})$.`,
    a: lines([
      `$x^{2}-${b}x-${a}x+${c}$`,
      final(`x^{2}${mid}x+${c}`)
    ])
  };
}, [{ a: 2, b: 3 }, { a: 4, b: 1 }, { a: 5, b: 2 }]));

add('Quadratics', 'Expanding double brackets (coefficients)', 'expanding-double-brackets-coefficients', three(({ p, q, r, s }) => {
  const x2 = p * r, x = p * s + q * r, c = q * s;
  return {
    q: `Expand $(${p}x+${q})(${r}x+${s})$.`,
    a: lines([
      `$${x2}x^{2}+${p * s}x+${q * r}x+${c}$`,
      final(`${x2}x^{2}+${x}x+${c}`)
    ])
  };
}, [{ p: 2, q: 1, r: 3, s: 4 }, { p: 3, q: 2, r: 2, s: 5 }, { p: 4, q: 1, r: 2, s: 3 }]));

add('Quadratics', 'Sum and product', 'sum-and-product', three(({ sum, prod, a, b }) => {
  return {
    q: `Find two numbers that sum to $${sum}$ and multiply to $${prod}$.`,
    a: lines([`Factor pairs of $${prod}$.`, final(`${a}\\ \\text{and}\\ ${b}`)])
  };
}, [{ sum: 7, prod: 12, a: 3, b: 4 }, { sum: 8, prod: 15, a: 3, b: 5 }, { sum: 9, prod: 20, a: 4, b: 5 }]));

add('Quadratics', 'Factorising quadratics (positives)', 'factorising-quadratics-positive', three(({ b, c, p, q }) => {
  return {
    q: `Factorise $x^{2}+${b}x+${c}$.`,
    a: lines([`$ ${p}+${q}=${b}$, and $${p}\\times ${q}=${c}$`, final(`(x+${p})(x+${q})`)])
  };
}, [{ b: 5, c: 6, p: 2, q: 3 }, { b: 7, c: 12, p: 3, q: 4 }, { b: 8, c: 15, p: 3, q: 5 }]));

add('Quadratics', 'Factorising quadratics (negatives)', 'factorising-quadratics-negative', [
  { q: 'Factorise $x^{2}-x-6$.', a: lines(['Two numbers that sum to $-1$ and multiply to $-6$: $-3$ and $2$.', final('(x-3)(x+2)')]) },
  { q: 'Factorise $x^{2}+x-12$.', a: lines(['Two numbers that sum to $1$ and multiply to $-12$: $4$ and $-3$.', final('(x+4)(x-3)')]) },
  { q: 'Factorise $x^{2}-49$.', a: lines(['Difference of two squares.', final('(x-7)(x+7)')]) }
]);

add('Quadratics', 'Solving with factorising', 'solving-with-factorising', [
  { q: 'Solve $x^{2}+2x-8=0$.', a: lines(['$(x+4)(x-2)=0$', final('x=-4\\ \\text{or}\\ x=2')]) },
  { q: 'Solve $x^{2}+5x=0$.', a: lines(['$x(x+5)=0$', final('x=0\\ \\text{or}\\ x=-5')]) },
  { q: 'Solve $x^{2}-9=0$.', a: lines(['$(x-3)(x+3)=0$', final('x=3\\ \\text{or}\\ x=-3')]) }
]);

add('Formulae', 'Manipulating equations (function machines with letters)', 'manipulating-equations-function-machines', [
  { q: 'Write the function machine for $y=3x+2$.', a: finalText('input x → ×3 → +2 → output y') },
  { q: 'Write the function machine for $y=2x-5$.', a: finalText('input x → ×2 → −5 → output y') },
  { q: 'Write the function machine for $y=\\dfrac{x}{4}+1$.', a: finalText('input x → ÷4 → +1 → output y') }
]);

add('Formulae', 'One step rearranging', 'one-step-rearranging', three(({ add }) => {
  return {
    q: `Make $x$ the subject of $y=x+${add}$.`,
    a: lines([`Subtract $${add}$ from both sides.`, final(`x=y-${add}`)])
  };
}, [{ add: 5 }, { add: 8 }, { add: 3 }]));

add('Formulae', 'Change the subject – two step', 'change-subject-two-step', three(({ k, add }) => {
  return {
    q: `Make $x$ the subject of $y=${k}x+${add}$.`,
    a: lines([
      `$y-${add}=${k}x$`,
      final(`x=\\dfrac{y-${add}}{${k}}`)
    ])
  };
}, [{ k: 2, add: 3 }, { k: 5, add: 1 }, { k: 4, add: 7 }]));

add('Formulae', 'Change the subject – multi step', 'change-subject-multi-step', [
  { q: 'Make $x$ the subject of $y=2(x+1)-3$.', a: lines(['$y=2x-1$', '$y+1=2x$', final('x=\\dfrac{y+1}{2}')]) },
  { q: 'Make $x$ the subject of $y=3(x-2)+4$.', a: lines(['$y=3x-2$', '$y+2=3x$', final('x=\\dfrac{y+2}{3}')]) },
  { q: 'Make $x$ the subject of $y=4(x+3)-1$.', a: lines(['$y=4x+11$', '$y-11=4x$', final('x=\\dfrac{y-11}{4}')]) }
]);

add('Formulae', 'Change the subject of formulae', 'change-subject-of-formulae', [
  { q: 'Make $h$ the subject of $A=\\dfrac{1}{2}bh$.', a: lines(['$2A=bh$', final('h=\\dfrac{2A}{b}')]) },
  { q: 'Make $r$ the subject of $C=2\\pi r$.', a: final('r=\\dfrac{C}{2\\pi}') },
  { q: 'Make $b$ the subject of $A=\\dfrac{1}{2}bh$.', a: lines(['$2A=bh$', final('b=\\dfrac{2A}{h}')]) }
]);

add('Constructions', 'Bisecting angles', 'bisecting-angles', [
  { q: 'An angle of $60^{\\circ}$ is bisected. What two angles are formed?', a: final('30^{\\circ}\\ \\text{and}\\ 30^{\\circ}') },
  { q: 'An angle of $90^{\\circ}$ is bisected. What two angles are formed?', a: final('45^{\\circ}\\ \\text{and}\\ 45^{\\circ}') },
  { q: 'An angle of $40^{\\circ}$ is bisected. What two angles are formed?', a: final('20^{\\circ}\\ \\text{and}\\ 20^{\\circ}') }
]);

add('Constructions', 'Perpendicular and line bisectors', 'perpendicular-line-bisectors', [
  { q: 'The perpendicular bisector of a $10$ cm line passes through which point on the line?', a: lines(['It meets the line at its midpoint, at $90^{\\circ}$.', final('5\\ \\text{cm from each end}')]) },
  { q: 'The perpendicular bisector of an $8$ cm line passes through which point on the line?', a: final('4\\ \\text{cm from each end}') },
  { q: 'The perpendicular bisector of a $12$ cm line passes through which point on the line?', a: final('6\\ \\text{cm from each end}') }
]);

add('Circles', 'Support 1 - Circumference of a Circle', 'support-circumference', three(({ d }) => {
  return {
    q: `A circle has diameter $${d}$ cm. Find the circumference in terms of $\\pi$.`,
    a: lines([`$C=\\pi d=\\pi\\times ${d}$`, final(`${d}\\pi\\ \\text{cm}`)])
  };
}, [{ d: 10 }, { d: 8 }, { d: 14 }]));

add('Circles', 'Support 2 - Area of a Circle', 'support-area-circle', three(({ r }) => {
  return {
    q: `A circle has radius $${r}$ cm. Find the area in terms of $\\pi$.`,
    a: lines([`$A=\\pi r^{2}=\\pi\\times ${r}^{2}=${r * r}\\pi$`, final(`${r * r}\\pi\\ \\text{cm}^{2}`)])
  };
}, [{ r: 5 }, { r: 4 }, { r: 6 }]));

add('Circles', 'Area of circles and Quarters', 'area-circles-quarters', three(({ r }) => {
  const full = r * r;
  const qtr = full / 4;
  return {
    q: `A circle has radius $${r}$ cm. Find the area of a quarter of the circle in terms of $\\pi$.`,
    a: lines([
      `Full area $= ${full}\\pi$`,
      `Quarter $= \\dfrac{${full}\\pi}{4}=${qtr}\\pi$`,
      final(`${qtr}\\pi\\ \\text{cm}^{2}`)
    ])
  };
}, [{ r: 4 }, { r: 6 }, { r: 8 }]));

add('Circles', 'Area of sectors', 'area-sectors', three(({ ang, r }) => {
  const full = r * r;
  const sector = full * ang / 360;
  return {
    q: `A sector has angle $${ang}^{\\circ}$ and radius $${r}$ cm. Find its area in terms of $\\pi$.`,
    a: lines([
      `$\\dfrac{${ang}}{360}\\times\\pi\\times ${r}^{2}=${sector}\\pi$`,
      final(`${sector}\\pi\\ \\text{cm}^{2}`)
    ])
  };
}, [{ ang: 90, r: 6 }, { ang: 180, r: 4 }, { ang: 60, r: 6 }]));

add('Circles', 'Perimeter of circles and Quarters', 'perimeter-circles-quarters', three(({ r }) => {
  const arc = (2 * r) / 4;
  const peri = `${arc}\\pi+${2 * r}`;
  return {
    q: `A quarter circle has radius $${r}$ cm. Find its perimeter in terms of $\\pi$.`,
    a: lines([
      `Arc $= \\dfrac{1}{4}\\times 2\\pi r=\\dfrac{${r}}{2}\\pi$`,
      `Add two radii: $+ ${2 * r}$`,
      final(`${peri}\\ \\text{cm}`)
    ])
  };
}, [{ r: 6 }, { r: 4 }, { r: 8 }]));

add('Circles', 'Arc length', 'arc-length', three(({ ang, r, ans }) => {
  return {
    q: `A sector has angle $${ang}^{\\circ}$ and radius $${r}$ cm. Find the arc length in terms of $\\pi$.`,
    a: lines([
      `$\\dfrac{${ang}}{360}\\times 2\\pi\\times ${r}=${ans}\\pi$`,
      final(`${ans}\\pi\\ \\text{cm}`)
    ])
  };
}, [{ ang: 90, r: 6, ans: 3 }, { ang: 180, r: 5, ans: 5 }, { ang: 120, r: 6, ans: 4 }]));

add('Circles', 'Surface area of cylinders', 'surface-area-cylinders', three(({ r, h, ans }) => {
  return {
    q: `A cylinder has radius $${r}$ cm and height $${h}$ cm. Find the total surface area in terms of $\\pi$.`,
    a: lines([
      `$2\\pi r^{2}+2\\pi rh=2\\pi r(r+h)$`,
      `$=2\\pi\\times ${r}\\times ${r + h}=${ans}\\pi$`,
      final(`${ans}\\pi\\ \\text{cm}^{2}`)
    ])
  };
}, [{ r: 3, h: 10, ans: 78 }, { r: 2, h: 5, ans: 28 }, { r: 4, h: 3, ans: 56 }]));

add('Circles', 'Volume of cylinders', 'volume-cylinders', three(({ r, h }) => {
  const ans = r * r * h;
  return {
    q: `A cylinder has radius $${r}$ cm and height $${h}$ cm. Find the volume in terms of $\\pi$.`,
    a: lines([
      `$V=\\pi r^{2}h=\\pi\\times ${r * r}\\times ${h}=${ans}\\pi$`,
      final(`${ans}\\pi\\ \\text{cm}^{3}`)
    ])
  };
}, [{ r: 3, h: 10 }, { r: 2, h: 7 }, { r: 5, h: 4 }]));

if (items.length !== 39) throw new Error('expected 39 items, got ' + items.length);

const { writeBoard } = require('./assemble-board');
writeBoard({ year: 9, cycle: 1, items, tag: 'Year 9' });
