const L = require('./y10-cycle-1-lib');
const {
  final, finalText, lines, three, addFactory, frac, n1,
  sinD, cosD, tanD, asinD, acosD, atanD, fbox, rightTri, lShape, scaleneTri, bearingsFig, cuboidFig, venn,
  solve2, fmtNum, nthLin, nthQuad, seqStr, linTerms, quadTerms, geoTerms, eqPair, show, n2
} = L;

const SEQ = 'Sequences';
const TRIG = 'Trigonometry - sides';
const SIM = 'Simultaneous Equations';
const GEO = 'Geometrical Reasoning';
const CALC = 'Calculating';
const RISK = 'Understanding Risk';

function addSharedSequences(add, pack) {
  add(SEQ, 'Identify and describe sequences', 'identify-describe-sequences', three(({ seq, kind }) => ({
    q: `What type of sequence is $${seq}$?`,
    a: lines([`Look at how the terms change.`, finalText(kind)])
  }), pack.identify));

  add(SEQ, 'Terms in a linear sequence', 'terms-in-linear-sequence', three(({ a, b, n }) => {
    const val = a * n + b;
    return {
      q: `The $n$th term of a sequence is $${nthLin(a, b)}$. Find the $${n}$th term.`,
      a: lines([
        `$${a === 1 ? '' : a}\\times ${n}${b >= 0 ? '+' + b : b}=${val}$`,
        final(String(val))
      ])
    };
  }, pack.linearTerms));

  add(SEQ, 'Generate geometric sequences', 'generate-geometric-sequences', three(({ first, r }) => {
    const terms = geoTerms(first, r, 4);
    return {
      q: `A geometric sequence has first term $${first}$ and common ratio $${r}$. Write the first four terms.`,
      a: lines([
        `Multiply by $${r}$ each time.`,
        final(seqStr(terms))
      ])
    };
  }, pack.geometric));

  add(SEQ, 'Generate quadratic sequences', 'generate-quadratic-sequences', three(({ a, b, c }) => {
    const terms = quadTerms(a, b, c, 5);
    return {
      q: `The $n$th term is $${nthQuad(a, b, c)}$. Write the first five terms.`,
      a: lines([
        `Substitute $n=1$ to $n=5$.`,
        final(seqStr(terms))
      ])
    };
  }, pack.genQuad));

  add(SEQ, 'Nth term - quadratic pattern spotting', 'nth-term-quadratic-pattern', three(({ a, b, c }) => {
    const terms = quadTerms(a, b, c, 5);
    const d2 = 2 * a;
    return {
      q: `Find the $n$th term of $${seqStr(terms)},\\ldots$`,
      a: lines([
        `Second difference $= ${d2}$, so $a=${a}$.`,
        `Remainder is linear, giving $${nthQuad(a, b, c)}$.`,
        final(nthQuad(a, b, c))
      ])
    };
  }, pack.pattern));
}

function addFoundationOnlySequences(add) {
  add(SEQ, 'Nth term of linear ascending sequences', 'nth-term-linear-ascending-recap', three(({ a, b }) => {
    const terms = linTerms(a, b, 4);
    return {
      q: `Find the $n$th term of $${seqStr(terms)},\\ldots$`,
      a: lines([
        `Difference $= ${a}$, zeroth term $= ${b}$.`,
        final(nthLin(a, b))
      ])
    };
  }, [{ a: 4, b: -1 }, { a: 3, b: 2 }, { a: 5, b: -3 }]));

  add(SEQ, 'Nth term - descending sequences', 'nth-term-linear-descending-recap', three(({ a, b }) => {
    const terms = linTerms(a, b, 4);
    return {
      q: `Find the $n$th term of $${seqStr(terms)},\\ldots$`,
      a: lines([
        `Difference $= ${a}$, zeroth term $= ${b}$.`,
        final(nthLin(a, b))
      ])
    };
  }, [{ a: -3, b: 23 }, { a: -5, b: 40 }, { a: -2, b: 19 }]));
}

function addHigherOnlySequences(add) {
  add(SEQ, 'Nth term quadratic $ax^{2}+b$', 'nth-term-quadratic-ax2b', three(({ a, b }) => {
    const terms = quadTerms(a, 0, b, 5);
    return {
      q: `Find the $n$th term of $${seqStr(terms)},\\ldots$`,
      a: lines([
        `Second difference $= ${2 * a}$, so $a=${a}$.`,
        `$an^{2}$ compared with the sequence leaves $+${b}$.`,
        final(nthQuad(a, 0, b))
      ])
    };
  }, [{ a: 2, b: 0 }, { a: 3, b: 1 }, { a: 1, b: 4 }]));

  add(SEQ, 'Nth term quadratic $ax^{2}+bx+c$', 'nth-term-quadratic-ax2bxc', three(({ a, b, c }) => {
    const terms = quadTerms(a, b, c, 5);
    return {
      q: `Find the $n$th term of $${seqStr(terms)},\\ldots$`,
      a: lines([
        `Second difference $= ${2 * a}$, so $a=${a}$.`,
        `Subtract $an^{2}$ to leave a linear sequence.`,
        final(nthQuad(a, b, c))
      ])
    };
  }, [{ a: 2, b: 1, c: 1 }, { a: 1, b: 2, c: -1 }, { a: 3, b: -2, c: 1 }]));
}

function addSharedTrig(add, pack) {
  add(TRIG, 'Intro to trig', 'intro-to-trig', three(({ ask, ans, hyp, opp, adj, ang }) => ({
    q: rightTri({ hyp, opp, adj, ang, unk: null }) + `Which side is the ${ask}?`,
    a: lines([`The ${ask} is labelled from the right angle and the marked angle.`, finalText(ans)])
  }), pack.intro));

  add(TRIG, 'Sine - lengths', 'sine-lengths', three(({ hyp, ang }) => {
    const opp = hyp * sinD(ang);
    const shown = n1(opp);
    return {
      q: fbox('\\sin\\theta=\\dfrac{O}{H}') + rightTri({ hyp: hyp + ' cm', opp: '?', adj: '', ang, unk: 'opp' }) +
        `Find the opposite side. Give an exact value if possible.`,
      a: lines([
        `$\\sin ${ang}^{\\circ}=\\dfrac{O}{${hyp}}$`,
        `$O=${hyp}\\sin ${ang}^{\\circ}=${shown}$`,
        final(`${shown}\\ \\text{cm}`)
      ])
    };
  }, pack.sine));

  add(TRIG, 'Cosine - lengths', 'cosine-lengths', three(({ hyp, ang }) => {
    const adj = hyp * cosD(ang);
    const shown = n1(adj);
    return {
      q: fbox('\\cos\\theta=\\dfrac{A}{H}') + rightTri({ hyp: hyp + ' cm', opp: '', adj: '?', ang, unk: 'adj' }) +
        `Find the adjacent side.`,
      a: lines([
        `$\\cos ${ang}^{\\circ}=\\dfrac{A}{${hyp}}$`,
        `$A=${hyp}\\cos ${ang}^{\\circ}=${shown}$`,
        final(`${shown}\\ \\text{cm}`)
      ])
    };
  }, pack.cosine));

  add(TRIG, 'Tangent - lengths', 'tangent-lengths', three(({ adj, ang }) => {
    const opp = adj * tanD(ang);
    const shown = n1(opp);
    return {
      q: fbox('\\tan\\theta=\\dfrac{O}{A}') + rightTri({ hyp: '', opp: '?', adj: adj + ' cm', ang, unk: 'opp' }) +
        `Find the opposite side.`,
      a: lines([
        `$\\tan ${ang}^{\\circ}=\\dfrac{O}{${adj}}$`,
        `$O=${adj}\\tan ${ang}^{\\circ}=${shown}$`,
        final(`${shown}\\ \\text{cm}`)
      ])
    };
  }, pack.tangent));

  add(TRIG, 'Mixed ratios', 'mixed-ratios', three(({ kind, hyp, adj, ang }) => {
    let q, a, shown;
    if (kind === 'sin') {
      shown = n1(hyp * sinD(ang));
      q = fbox('\\sin\\theta=\\dfrac{O}{H}') + rightTri({ hyp: hyp + ' cm', opp: '?', adj: '', ang, unk: 'opp' }) +
        `Find the opposite side.`;
      a = lines([`$O=${hyp}\\sin ${ang}^{\\circ}=${shown}$`, final(`${shown}\\ \\text{cm}`)]);
    } else if (kind === 'cos') {
      shown = n1(hyp * cosD(ang));
      q = fbox('\\cos\\theta=\\dfrac{A}{H}') + rightTri({ hyp: hyp + ' cm', opp: '', adj: '?', ang, unk: 'adj' }) +
        `Find the adjacent side.`;
      a = lines([`$A=${hyp}\\cos ${ang}^{\\circ}=${shown}$`, final(`${shown}\\ \\text{cm}`)]);
    } else {
      shown = n1(adj * tanD(ang));
      q = fbox('\\tan\\theta=\\dfrac{O}{A}') + rightTri({ hyp: '', opp: '?', adj: adj + ' cm', ang, unk: 'opp' }) +
        `Find the opposite side.`;
      a = lines([`$O=${adj}\\tan ${ang}^{\\circ}=${shown}$`, final(`${shown}\\ \\text{cm}`)]);
    }
    return { q, a };
  }, pack.mixed));
}

function addHigherTrig(add) {
  add(TRIG, 'Sine Ratio - angles', 'sine-ratio-angles', three(({ opp, hyp }) => {
    const th = n1(asinD(opp / hyp));
    return {
      q: fbox('\\theta=\\sin^{-1}\\!\\left(\\dfrac{O}{H}\\right)') +
        rightTri({ hyp: hyp + ' cm', opp: opp + ' cm', adj: '', ang: 'θ', unk: 'ang' }) +
        `Find $\\theta$ to 1 d.p.`,
      a: lines([
        `$\\sin\\theta=\\dfrac{${opp}}{${hyp}}$`,
        `$\\theta=\\sin^{-1}\\!\\left(\\dfrac{${opp}}{${hyp}}\\right)=${th}^{\\circ}$`,
        final(`${th}^{\\circ}`)
      ])
    };
  }, [{ opp: 3, hyp: 5 }, { opp: 5, hyp: 13 }, { opp: 8, hyp: 17 }]));

  add(TRIG, 'Cosine and Tangent - angles', 'cosine-tangent-angles', three(({ kind, adj, hyp, opp }) => {
    if (kind === 'cos') {
      const th = n1(acosD(adj / hyp));
      return {
        q: fbox('\\theta=\\cos^{-1}\\!\\left(\\dfrac{A}{H}\\right)') +
          rightTri({ hyp: hyp + ' cm', opp: '', adj: adj + ' cm', ang: 'θ', unk: 'ang' }) +
          `Find $\\theta$ to 1 d.p.`,
        a: lines([
          `$\\cos\\theta=\\dfrac{${adj}}{${hyp}}$`,
          `$\\theta=\\cos^{-1}\\!\\left(\\dfrac{${adj}}{${hyp}}\\right)=${th}^{\\circ}$`,
          final(`${th}^{\\circ}`)
        ])
      };
    }
    const th = n1(atanD(opp / adj));
    return {
      q: fbox('\\theta=\\tan^{-1}\\!\\left(\\dfrac{O}{A}\\right)') +
        rightTri({ hyp: '', opp: opp + ' cm', adj: adj + ' cm', ang: 'θ', unk: 'ang' }) +
        `Find $\\theta$ to 1 d.p.`,
      a: lines([
        `$\\tan\\theta=\\dfrac{${opp}}{${adj}}$`,
        `$\\theta=\\tan^{-1}\\!\\left(\\dfrac{${opp}}{${adj}}\\right)=${th}^{\\circ}$`,
        final(`${th}^{\\circ}`)
      ])
    };
  }, [{ kind: 'cos', adj: 4, hyp: 5 }, { kind: 'tan', opp: 5, adj: 12 }, { kind: 'cos', adj: 8, hyp: 17 }]));

  add(TRIG, 'Mixed Angles & Sides', 'mixed-angles-sides', three(({ kind, hyp, ang, opp, adj }) => {
    if (kind === 'side') {
      const shown = n1(hyp * sinD(ang));
      return {
        q: fbox('\\sin\\theta=\\dfrac{O}{H}') +
          rightTri({ hyp: hyp + ' cm', opp: '?', adj: '', ang, unk: 'opp' }) +
          `Find the opposite side to 1 d.p.`,
        a: lines([`$O=${hyp}\\sin ${ang}^{\\circ}=${shown}$`, final(`${shown}\\ \\text{cm}`)])
      };
    }
    const th = n1(atanD(opp / adj));
    return {
      q: fbox('\\theta=\\tan^{-1}\\!\\left(\\dfrac{O}{A}\\right)') +
        rightTri({ hyp: '', opp: opp + ' cm', adj: adj + ' cm', ang: 'θ', unk: 'ang' }) +
        `Find $\\theta$ to 1 d.p.`,
      a: lines([
        `$\\tan\\theta=\\dfrac{${opp}}{${adj}}$`,
        `$\\theta=${th}^{\\circ}$`,
        final(`${th}^{\\circ}`)
      ])
    };
  }, [
    { kind: 'side', hyp: 11, ang: 40 },
    { kind: 'angle', opp: 7, adj: 24 },
    { kind: 'side', hyp: 15, ang: 50 }
  ]));

  add(TRIG, 'EXTENSION Trig and Bearings', 'trig-bearings', three(({ east, north }) => {
    const th = n1(atanD(east / north));
    const bearing = String(Math.round(Number(th))).padStart(3, '0');
    return {
      q: fbox('\\tan\\theta=\\dfrac{O}{A}') + bearingsFig({ east, north }) +
        `Point $B$ is $${east}$ km due East of $A$. Point $C$ is $${north}$ km due North of $B$. Find the bearing of $C$ from $A$ to the nearest degree.`,
      a: lines([
        `$\\tan\\theta=\\dfrac{${east}}{${north}}$, $\\theta=${th}^{\\circ}$`,
        `Bearing $= ${bearing}^{\\circ}$ (clockwise from North).`,
        final(`${bearing}^{\\circ}`)
      ])
    };
  }, [{ east: 5, north: 12 }, { east: 8, north: 15 }, { east: 7, north: 24 }]));

  add(TRIG, '3D trig', 'trig-3d', three(({ l, w, h }) => {
    const base = Math.sqrt(l * l + w * w);
    const th = n1(atanD(h / base));
    return {
      q: fbox('\\tan\\theta=\\dfrac{O}{A}') + cuboidFig({ l, w, h }) +
        `A cuboid is $${l}$ cm by $${w}$ cm by $${h}$ cm. Find the angle between the space diagonal and the base, to 1 d.p.`,
      a: lines([
        `Base diagonal $=\\sqrt{${l}^{2}+${w}^{2}}=${n1(base)}$`,
        `$\\tan\\theta=\\dfrac{${h}}{${n1(base)}}$, $\\theta=${th}^{\\circ}$`,
        final(`${th}^{\\circ}`)
      ])
    };
  }, [{ l: 3, w: 4, h: 12 }, { l: 5, w: 12, h: 9 }, { l: 9, w: 12, h: 8 }]));

  add(TRIG, 'Sine rule', 'sine-rule', three(({ A, B, b }) => {
    const a = b * sinD(A) / sinD(B);
    const shown = n1(a);
    return {
      q: fbox('\\dfrac{a}{\\sin A}=\\dfrac{b}{\\sin B}') +
        scaleneTri({ A, B, a: 'a', b: b + ' cm', c: '', unk: 'a' }) +
        `In triangle $ABC$, $A=${A}^{\\circ}$, $B=${B}^{\\circ}$ and $b=${b}$ cm. Find $a$ to 1 d.p.`,
      a: lines([
        `$\\dfrac{a}{\\sin ${A}^{\\circ}}=\\dfrac{${b}}{\\sin ${B}^{\\circ}}$`,
        `$a=\\dfrac{${b}\\sin ${A}^{\\circ}}{\\sin ${B}^{\\circ}}=${shown}$`,
        final(`${shown}\\ \\text{cm}`)
      ])
    };
  }, [{ A: 50, B: 70, b: 8 }, { A: 40, B: 80, b: 12 }, { A: 35, B: 55, b: 12 }]));

  add(TRIG, 'Cosine rule', 'cosine-rule', three(({ b, c, A }) => {
    const a2 = b * b + c * c - 2 * b * c * cosD(A);
    const a = Math.sqrt(a2);
    const shown = n1(a);
    return {
      q: fbox('a^{2}=b^{2}+c^{2}-2bc\\cos A') +
        scaleneTri({ A, B: '', a: 'a', b: b + ' cm', c: c + ' cm', unk: 'a' }) +
        `In triangle $ABC$, $b=${b}$ cm, $c=${c}$ cm and $A=${A}^{\\circ}$. Find $a$ to 1 d.p.`,
      a: lines([
        `$a^{2}=${b}^{2}+${c}^{2}-2\\times ${b}\\times ${c}\\cos ${A}^{\\circ}$`,
        `$a=${shown}$`,
        final(`${shown}\\ \\text{cm}`)
      ])
    };
  }, [{ b: 5, c: 7, A: 60 }, { b: 8, c: 6, A: 40 }, { b: 9, c: 4, A: 120 }]));
}

function addSharedSim(add, pack) {
  add(SIM, 'Elimination by subtraction', 'elimination-by-subtraction', three(({ a, b1, c1, b2, c2 }) => {
    const { x, y } = solve2(a, b1, c1, a, b2, c2);
    return {
      q: `Solve ${eqPair(a, b1, c1, a, b2, c2)} by subtracting.`,
      a: lines([
        `Subtract: $${b1 - b2}y=${c1 - c2}$, $y=${fmtNum(y)}$`,
        `Then $x=${fmtNum(x)}$`,
        final(`x=${fmtNum(x)},\\ y=${fmtNum(y)}`)
      ])
    };
  }, pack.elimSub));

  add(SIM, 'Elimination by subtraction - further practice', 'elimination-by-subtraction-further', three(({ a, b1, c1, b2, c2 }) => {
    const { x, y } = solve2(a, b1, c1, a, b2, c2);
    return {
      q: `Solve ${eqPair(a, b1, c1, a, b2, c2)}.`,
      a: lines([
        `Subtract the matching $x$ terms.`,
        `$y=${fmtNum(y)}$, $x=${fmtNum(x)}$`,
        final(`x=${fmtNum(x)},\\ y=${fmtNum(y)}`)
      ])
    };
  }, pack.elimSubF));

  add(SIM, 'Elimination by addition', 'elimination-by-addition', three(({ a1, b, c1, a2, c2 }) => {
    const { x, y } = solve2(a1, b, c1, a2, -b, c2);
    return {
      q: `Solve ${eqPair(a1, b, c1, a2, -b, c2)} by adding.`,
      a: lines([
        `Add to eliminate $y$.`,
        `$x=${fmtNum(x)}$, $y=${fmtNum(y)}$`,
        final(`x=${fmtNum(x)},\\ y=${fmtNum(y)}`)
      ])
    };
  }, pack.elimAdd));

  add(SIM, 'Simultaneous equations graphically', 'simultaneous-equations-graphically', three(({ m1, c1, m2, c2 }) => {
    const x = (c2 - c1) / (m1 - m2);
    const y = m1 * x + c1;
    return {
      q: `The lines $y=${nthLin(m1, c1).replace(/n/g, 'x')}$ and $y=${nthLin(m2, c2).replace(/n/g, 'x')}$ meet at a point. Write the solution of the simultaneous equations.`,
      a: lines([
        `Set equal: $${m1}x${c1 >= 0 ? '+' + c1 : c1}=${m2}x${c2 >= 0 ? '+' + c2 : c2}$`,
        `$x=${fmtNum(x)}$, $y=${fmtNum(y)}$`,
        final(`x=${fmtNum(x)},\\ y=${fmtNum(y)}`)
      ])
    };
  }, pack.graphical));

  add(SIM, 'Multiply one equation', 'multiply-one-equation', three(({ a1, b1, c1, a2, b2, c2 }) => {
    const { x, y } = solve2(a1, b1, c1, a2, b2, c2);
    return {
      q: `Solve ${eqPair(a1, b1, c1, a2, b2, c2)} by multiplying one equation first.`,
      a: lines([
        `Scale so one pair of coefficients matches, then eliminate.`,
        `$x=${fmtNum(x)}$, $y=${fmtNum(y)}$`,
        final(`x=${fmtNum(x)},\\ y=${fmtNum(y)}`)
      ])
    };
  }, pack.mulOne));

  add(SIM, 'Multiply both equations', 'multiply-both-equations', three(({ a1, b1, c1, a2, b2, c2 }) => {
    const { x, y } = solve2(a1, b1, c1, a2, b2, c2);
    return {
      q: `Solve ${eqPair(a1, b1, c1, a2, b2, c2)} by multiplying both equations.`,
      a: lines([
        `Scale both equations to a common coefficient, then eliminate.`,
        `$x=${fmtNum(x)},\\ y=${fmtNum(y)}$`,
        final(`x=${fmtNum(x)},\\ y=${fmtNum(y)}`)
      ])
    };
  }, pack.mulBoth));
}

function addFoundationOnlySim(add) {
  add(SIM, 'Solving by noticing', 'solving-by-noticing-recap', three(({ s, d }) => {
    const x = (s + d) / 2;
    const y = (s - d) / 2;
    return {
      q: `Solve $x+y=${s}$ and $x-y=${d}$ by noticing.`,
      a: lines([
        `Add: $2x=${s + d}$, $x=${fmtNum(x)}$`,
        `Then $y=${fmtNum(y)}$`,
        final(`x=${fmtNum(x)},\\ y=${fmtNum(y)}`)
      ])
    };
  }, [{ s: 10, d: 2 }, { s: 14, d: 4 }, { s: 9, d: 3 }]));

  add(SIM, 'Elimination - add or subtract', 'elimination-add-or-subtract', three(({ mode, a, b, c1, c2 }) => {
    let x, y, q;
    if (mode === 'add') {
      ({ x, y } = solve2(a, b, c1, a, -b, c2));
      q = `Do you add or subtract to eliminate $y$ in ${eqPair(a, b, c1, a, -b, c2)}? Then solve.`;
    } else {
      ({ x, y } = solve2(a, b, c1, a, b, c2));
      q = `Do you add or subtract to eliminate $x$ in ${eqPair(a, b, c1, a, b, c2)}? Then solve.`;
    }
    return {
      q,
      a: lines([
        mode === 'add' ? 'Opposite signs on $y$: add.' : 'Matching $x$ terms: subtract.',
        `$x=${fmtNum(x)}$, $y=${fmtNum(y)}$`,
        final(`x=${fmtNum(x)},\\ y=${fmtNum(y)}`)
      ])
    };
  }, [
    { mode: 'add', a: 4, b: 1, c1: 10, c2: 2 },
    { mode: 'sub', a: 3, b: 2, c1: 16, c2: 11 },
    { mode: 'add', a: 2, b: 5, c1: 17, c2: 3 }
  ]));
}

function addHigherOnlySim(add) {
  add(SIM, 'Substitution method', 'substitution-method', three(({ m, k, a, b, c }) => {
    const x = (c - b * k) / (a + b * m);
    const y = m * x + k;
    const xs = m === 1 ? 'x' : m === -1 ? '-x' : m + 'x';
    const rhs = k === 0 ? xs : xs + (k > 0 ? '+' + k : k);
    const xt = a === 1 ? 'x' : a === -1 ? '-x' : a + 'x';
    const yt = b === 1 ? '+y' : b === -1 ? '-y' : (b > 0 ? '+' : '') + b + 'y';
    return {
      q: `Solve $y=${rhs}$ and $${xt}${yt}=${c}$ by substitution.`,
      a: lines([
        `Substitute $y$ into the second equation.`,
        `$x=${fmtNum(x)}$, $y=${fmtNum(y)}$`,
        final(`x=${fmtNum(x)},\\ y=${fmtNum(y)}`)
      ])
    };
  }, [{ m: 1, k: 2, a: 3, b: 1, c: 14 }, { m: 2, k: -1, a: 1, b: 1, c: 11 }, { m: -1, k: 5, a: 2, b: 1, c: 7 }]));

  add(SIM, 'Solving involving quadratics', 'solving-involving-quadratics', three(({ m, k, p, q, r }) => {
    const A = p;
    const B = q - m;
    const C = r - k;
    const disc = B * B - 4 * A * C;
    const x1 = (-B + Math.sqrt(disc)) / (2 * A);
    const x2 = (-B - Math.sqrt(disc)) / (2 * A);
    const y1 = m * x1 + k;
    const y2 = m * x2 + k;
    const line = `y=${m === 1 ? '' : m === -1 ? '-' : m}x${k === 0 ? '' : (k > 0 ? '+' + k : k)}`;
    const quad = `y=${p === 1 ? '' : p}x^{2}${q === 0 ? '' : (q > 0 ? '+' + q : q) + 'x'}${r === 0 ? '' : (r > 0 ? '+' + r : r)}`;
    return {
      q: `Solve $ ${line} $ and $ ${quad} $ simultaneously.`,
      a: lines([
        `Substitute the line into the quadratic and solve.`,
        `$x=${fmtNum(x1)}$ or $x=${fmtNum(x2)}$`,
        final(`(${fmtNum(x1)},${fmtNum(y1)}),\\ (${fmtNum(x2)},${fmtNum(y2)})`)
      ])
    };
  }, [
    { m: 1, k: 1, p: 1, q: 0, r: -5 },
    { m: 2, k: 0, p: 1, q: -3, r: 0 },
    { m: 1, k: -2, p: 1, q: 0, r: -4 }
  ]));
}

function addSharedGeo(add, pack) {
  add(GEO, 'Coordinate problems', 'coordinate-problems', three(({ x1, y1, x2, y2, kind }) => {
    if (kind === 'mid') {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      return {
        q: `Find the midpoint of $(${x1},${y1})$ and $(${x2},${y2})$.`,
        a: lines([
          `$\\left(\\dfrac{${x1}+${x2}}{2},\\dfrac{${y1}+${y2}}{2}\\right)$`,
          final(`(${fmtNum(mx)},${fmtNum(my)})`)
        ])
      };
    }
    const d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return {
      q: `Find the distance between $(${x1},${y1})$ and $(${x2},${y2})$.`,
      a: lines([
        `$\\sqrt{(${x2}-${x1})^{2}+(${y2}-${y1})^{2}}=${fmtNum(d)}$`,
        final(String(fmtNum(d)))
      ])
    };
  }, pack.coord));

  add(GEO, 'Area and perimeter problems', 'area-perimeter-problems', three(({ W, H, cutW, cutH }) => {
    const area = W * H - cutW * cutH;
    return {
      q: lShape({ W, H, cutW, cutH }) + `Find the area of the L-shape.`,
      a: lines([
        `Large rectangle $-$ cut-out: $${W}\\times ${H}-${cutW}\\times ${cutH}=${area}$`,
        final(`${area}\\ \\text{cm}^{2}`)
      ])
    };
  }, pack.area));

  add(GEO, 'Give a reason', 'give-a-reason', three(({ given, ans, reason }) => ({
    q: `An angle of $${given}^{\\circ}$ sits on a straight line with an unknown angle $x$. Find $x$ and give a reason.`,
    a: lines([
      `$x=180-${given}=${ans}$`,
      finalText(reason)
    ])
  }), pack.reason));

  add(GEO, 'Angle problems', 'angle-problems', three(({ kind, given }) => {
    if (kind === 'co') {
      const ans = 180 - given;
      return {
        q: `Co-interior angles sum to $180^{\\circ}$. One angle is $${given}^{\\circ}$. Find the other.`,
        a: lines([`$180-${given}=${ans}$`, final(`${ans}^{\\circ}`)])
      };
    }
    if (kind === 'iso') {
      const ans = (180 - given) / 2;
      return {
        q: `An isosceles triangle has vertex angle $${given}^{\\circ}$. Find a base angle.`,
        a: lines([`$\\dfrac{180-${given}}{2}=${ans}$`, final(`${ans}^{\\circ}`)])
      };
    }
    const ans = 360 - given;
    return {
      q: `Angles around a point sum to $360^{\\circ}$. One angle is $${given}^{\\circ}$ and the rest form a single unknown angle. Find it.`,
      a: lines([`$360-${given}=${ans}$`, final(`${ans}^{\\circ}`)])
    };
  }, pack.angles));

  add(GEO, 'Congruent triangles', 'congruent-triangles', three(({ cond, why }) => ({
    q: `Two triangles have ${why}. Which congruence condition is this?`,
    a: lines([`Name the matching sides and angles.`, finalText(cond)])
  }), pack.congru));

  add(GEO, 'Forming and solving equations', 'forming-solving-equations-geo', three(({ a, b, k, total }) => {
    const x = (total - k) / (a + b);
    return {
      q: `Angles on a straight line are $${a}x$, $${b}x$ and $${k}^{\\circ}$. Find $x$.`,
      a: lines([
        `$${a}x+${b}x+${k}=${total}$`,
        `$${(a + b)}x=${total - k}$, $x=${fmtNum(x)}$`,
        final(String(fmtNum(x)))
      ])
    };
  }, pack.form));
}

function addHigherGeo(add) {
  add(GEO, 'The area rule', 'area-rule', three(({ a, b, C }) => {
    const area = 0.5 * a * b * sinD(C);
    const shown = n1(area);
    return {
      q: fbox('\\text{Area}=\\tfrac{1}{2}ab\\sin C') +
        scaleneTri({ A: '', B: '', Cang: C, a: a + ' cm', b: b + ' cm', c: '', unk: 'c' }) +
        `A triangle has sides $${a}$ cm and $${b}$ cm with included angle $${C}^{\\circ}$. Find the area to 1 d.p.`,
      a: lines([
        `$\\tfrac{1}{2}\\times ${a}\\times ${b}\\times\\sin ${C}^{\\circ}=${shown}$`,
        final(`${shown}\\ \\text{cm}^{2}`)
      ])
    };
  }, [{ a: 7, b: 9, C: 50 }, { a: 8, b: 6, C: 40 }, { a: 10, b: 12, C: 30 }]));
}

function addSharedCalc(add, pack) {
  add(CALC, 'Upper and lower bounds', 'upper-lower-bounds', three(({ val, half, unit }) => {
    const lo = show(val - half);
    const hi = show(val + half);
    return {
      q: `A length is given as $${val}$ ${unit}. Find the lower and upper bounds.`,
      a: lines([
        `Half a unit $= ${show(half)}$.`,
        final(`${lo}\\le\\text{true value}\\lt ${hi}`)
      ])
    };
  }, pack.bounds));

  add(CALC, 'Error intervals', 'error-intervals', three(({ val, half }) => {
    const lo = show(val - half);
    const hi = show(val + half);
    return {
      q: `$x=${val}$ has been rounded. Write the error interval.`,
      a: lines([
        `Lower bound $${lo}$, upper bound $${hi}$.`,
        final(`${lo}\\le x\\lt ${hi}`)
      ])
    };
  }, pack.error));

  add(CALC, 'Recognising powers', 'recognising-powers', three(({ n, form }) => ({
    q: `Write $${n}$ as a power of a whole number.`,
    a: lines([`$${n}=${form}$`, final(form)])
  }), pack.powers));

  add(CALC, 'Negative indices', 'negative-indices', three(({ base, p }) => {
    const den = base ** p;
    return {
      q: `Evaluate $${base}^{-${p}}$.`,
      a: lines([
        `$${base}^{-${p}}=\\dfrac{1}{${base}^{${p}}}=\\dfrac{1}{${den}}$`,
        final(frac(1, den))
      ])
    };
  }, pack.negIdx));

  add(CALC, 'Fractional indices', 'fractional-indices', three(({ base, n, m, root, ans }) => ({
    q: `Evaluate $${base}^{${m}/${n}}$.`,
    a: lines([
      `$${base}^{${m}/${n}}=(${base}^{1/${n}})^{${m}}=${root}^{${m}}=${ans}$`,
      final(String(ans))
    ])
  }), pack.fracIdx));
}

function addFoundationOnlyCalc(add) {
  add(CALC, 'Rounding to decimal places', 'rounding-dp-recap', three(({ n, dp, ans }) => ({
    q: `Round $${n}$ to $${dp}$ d.p.`,
    a: lines([`Look at the next digit.`, final(ans)])
  }), [
    { n: '3.847', dp: 2, ans: '3.85' },
    { n: '12.351', dp: 1, ans: '12.4' },
    { n: '0.6666', dp: 3, ans: '0.667' }
  ]));

  add(CALC, 'Rounding to significant figures', 'rounding-sf-recap', three(({ n, sf, ans }) => ({
    q: `Round $${n}$ to $${sf}$ s.f.`,
    a: lines([`Count from the first non-zero digit.`, final(ans)])
  }), [
    { n: '0.03847', sf: 2, ans: '0.038' },
    { n: '47291', sf: 3, ans: '47300' },
    { n: '6.085', sf: 3, ans: '6.09' }
  ]));

  add(CALC, 'Truncation', 'truncation-recap', three(({ n, dp, ans }) => ({
    q: `Truncate $${n}$ to $${dp}$ d.p.`,
    a: lines([`Cut off extra digits; do not round.`, final(ans)])
  }), [
    { n: '3.847', dp: 2, ans: '3.84' },
    { n: '9.999', dp: 2, ans: '9.99' },
    { n: '0.4567', dp: 1, ans: '0.4' }
  ]));

  add(CALC, 'Estimation', 'estimation-recap', three(({ a, b, ea, eb }) => {
    const est = ea * eb;
    return {
      q: `Estimate $${a}\\times ${b}$ by rounding each value to 1 s.f.`,
      a: lines([
        `$${a}\\approx ${ea}$, $${b}\\approx ${eb}$`,
        `$${ea}\\times ${eb}=${est}$`,
        final(String(est))
      ])
    };
  }, [
    { a: 29.6, b: 5.1, ea: 30, eb: 5 },
    { a: 81.2, b: 3.9, ea: 80, eb: 4 },
    { a: 48.7, b: 2.1, ea: 50, eb: 2 }
  ]));

  add(CALC, 'Powers and roots', 'powers-roots-recap', [
    { q: 'Evaluate $5^{3}$.', a: lines(['$5^{3}=125$', final('125')]) },
    { q: 'Evaluate $\\sqrt[3]{64}$.', a: lines(['$4^{3}=64$', final('4')]) },
    { q: 'Evaluate $(-5)^{2}$.', a: lines(['$(-5)\\times(-5)=25$', final('25')]) }
  ]);
}

function addHigherOnlyCalc(add) {
  add(CALC, 'Solve problems using bounds', 'solve-problems-bounds', three(({ d, t, dUnit, tUnit }) => {
    const dHalf = dUnit / 2, tHalf = tUnit / 2;
    const max = (d + dHalf) / (t - tHalf);
    const shown = n2(Number(max));
    return {
      q: `Distance $= ${d}$ m to the nearest ${dUnit === 1 ? 'metre' : dUnit + ' m'}. Time $= ${t}$ s to the nearest ${tUnit === 1 ? 'second' : tUnit + ' s'}. Find the maximum possible speed in m/s.`,
      a: lines([
        `Max speed $= \\dfrac{\\text{max distance}}{\\text{min time}}=\\dfrac{${n1(d + dHalf)}}{${n1(t - tHalf)}}=${shown}$`,
        final(`${shown}\\ \\text{m/s}`)
      ])
    };
  }, [
    { d: 100, t: 10, dUnit: 1, tUnit: 1 },
    { d: 50, t: 8, dUnit: 1, tUnit: 1 },
    { d: 200, t: 25, dUnit: 10, tUnit: 1 }
  ]));

  add(CALC, 'Non-calc powers and roots', 'noncalc-powers-roots', three(({ q, work, ans }) => ({
    q, a: lines([work, final(ans)])
  }), [
    { q: 'Evaluate $\\sqrt{144}$.', work: '$12^{2}=144$', ans: '12' },
    { q: 'Evaluate $\\sqrt[3]{27}$.', work: '$3^{3}=27$', ans: '3' },
    { q: 'Evaluate $2^{5}$.', work: '$2^{5}=32$', ans: '32' }
  ]));

  add(CALC, 'Simplifying surds', 'simplifying-surds', three(({ n, sq, rest }) => ({
    q: `Simplify $\\sqrt{${n}}$.`,
    a: lines([
      `$\\sqrt{${n}}=\\sqrt{${sq}\\times ${rest}}=${Math.sqrt(sq)}\\sqrt{${rest}}$`,
      final(`${Math.sqrt(sq)}\\sqrt{${rest}}`)
    ])
  }), [{ n: 50, sq: 25, rest: 2 }, { n: 72, sq: 36, rest: 2 }, { n: 18, sq: 9, rest: 2 }]));

  add(CALC, 'Calculating with surds', 'calculating-surds', three(({ a, b, surd }) => ({
    q: `Simplify $${a}\\sqrt{${surd}}+${b}\\sqrt{${surd}}$.`,
    a: lines([
      `Like surds: $(${a}+${b})\\sqrt{${surd}}=${a + b}\\sqrt{${surd}}$`,
      final(`${a + b}\\sqrt{${surd}}`)
    ])
  }), [{ a: 3, b: 5, surd: 2 }, { a: 7, b: 2, surd: 3 }, { a: 4, b: 9, surd: 5 }]));

  add(CALC, 'Expanding brackets with surds', 'expanding-brackets-surds', three(({ k, n }) => {
    const inner = k * Math.sqrt(n);
    return {
      q: `Expand and simplify $\\sqrt{${n}}(${k}+\\sqrt{${n}})$.`,
      a: lines([
        `$k\\sqrt{${n}}+${n}$`,
        final(`${n}+${k}\\sqrt{${n}}`)
      ])
    };
  }, [{ k: 3, n: 2 }, { k: 4, n: 3 }, { k: 5, n: 2 }]));

  add(CALC, 'Rationalising the denominator', 'rationalising-denominator', three(({ n }) => ({
    q: `Rationalise the denominator of $\\dfrac{1}{\\sqrt{${n}}}$.`,
    a: lines([
      `$\\dfrac{1}{\\sqrt{${n}}}\\times\\dfrac{\\sqrt{${n}}}{\\sqrt{${n}}}=\\dfrac{\\sqrt{${n}}}{${n}}$`,
      final(`\\dfrac{\\sqrt{${n}}}{${n}}`)
    ])
  }), [{ n: 3 }, { n: 2 }, { n: 5 }]));

  add(CALC, 'Rationalising the denominator - further', 'rationalising-denominator-further', three(({ a, n }) => {
    const den = a * a - n;
    return {
      q: `Rationalise $\\dfrac{1}{${a}+\\sqrt{${n}}}$.`,
      a: lines([
        `Multiply by the conjugate $${a}-\\sqrt{${n}}$.`,
        `$\\dfrac{${a}-\\sqrt{${n}}}{${a}^{2}-${n}}=\\dfrac{${a}-\\sqrt{${n}}}{${den}}$`,
        final(den === 1 ? `${a}-\\sqrt{${n}}` : `\\dfrac{${a}-\\sqrt{${n}}}{${den}}`)
      ])
    };
  }, [{ a: 2, n: 3 }, { a: 3, n: 2 }, { a: 5, n: 5 }]));
}

function addFoundationRisk(add) {
  add(RISK, 'Frequency trees', 'frequency-trees-recap', three(({ total, sport, football }) => {
    const notFoot = sport - football;
    return {
      q: `$${total}$ students, $${sport}$ play sport, and $${football}$ of those play football. How many play sport but not football?`,
      a: lines([`$${sport}-${football}=${notFoot}$`, final(String(notFoot))])
    };
  }, [{ total: 100, sport: 60, football: 40 }, { total: 80, sport: 50, football: 30 }, { total: 120, sport: 90, football: 54 }]));

  add(RISK, 'AND rule', 'and-rule-recap', three(({ pA, pB, ans }) => ({
    q: `Events $A$ and $B$ are independent. $P(A)=${pA}$, $P(B)=${pB}$. Find $P(A\\text{ and }B)$.`,
    a: lines([`$P(A)\\times P(B)=${ans}$`, final(ans)])
  }), [
    { pA: '0.5', pB: '\\dfrac{1}{6}', ans: '\\dfrac{1}{12}' },
    { pA: '\\dfrac{1}{3}', pB: '\\dfrac{1}{2}', ans: '\\dfrac{1}{6}' },
    { pA: '0.2', pB: '0.4', ans: '0.08' }
  ]));

  add(RISK, 'OR rule', 'or-rule-recap', three(({ pA, pB, ans }) => ({
    q: `$A$ and $B$ are mutually exclusive. $P(A)=${pA}$, $P(B)=${pB}$. Find $P(A\\text{ or }B)$.`,
    a: lines([`$P(A)+P(B)=${ans}$`, final(ans)])
  }), [
    { pA: '0.3', pB: '0.2', ans: '0.5' },
    { pA: '\\dfrac{1}{5}', pB: '\\dfrac{2}{5}', ans: '\\dfrac{3}{5}' },
    { pA: '0.15', pB: '0.45', ans: '0.6' }
  ]));

  add(RISK, 'Venn diagrams - interpret', 'venn-diagrams-interpret', three(({ aOnly, bOnly, both, outside, ask, ans }) => {
    const total = aOnly + bOnly + both + outside;
    return {
      q: venn({ aOnly, bOnly, both, outside, aName: 'A', bName: 'B' }) +
        `The Venn diagram shows ${total} students. ${ask}`,
      a: lines([`Read the regions shown.`, final(ans)])
    };
  }, [
    { aOnly: 12, bOnly: 7, both: 8, outside: 13, ask: 'How many are in both sets?', ans: '8' },
    { aOnly: 15, bOnly: 10, both: 5, outside: 20, ask: 'How many are in set $A$ in total?', ans: '20' },
    { aOnly: 9, bOnly: 6, both: 4, outside: 11, ask: 'How many are in neither set?', ans: '11' }
  ]));

  add(RISK, 'Venn diagrams - create', 'venn-diagrams-create', three(({ a, b, both }) => {
    const aOnly = a - both, bOnly = b - both;
    return {
      q: `$${a}$ like maths, $${b}$ like art, $${both}$ like both. How many like maths only?`,
      a: lines([`Maths only $= ${a}-${both}=${aOnly}$`, final(String(aOnly))])
    };
  }, [{ a: 20, b: 15, both: 8 }, { a: 30, b: 18, both: 6 }, { a: 25, b: 22, both: 10 }]));

  add(RISK, 'Relative frequency', 'relative-frequency', three(({ fav, tot, num, den }) => ({
    q: `A coin lands heads $${fav}$ times in $${tot}$ flips. Write the relative frequency of heads as a fraction in its simplest form.`,
    a: lines([
      `$\\dfrac{${fav}}{${tot}}=\\dfrac{${num}}{${den}}$`,
      final(`\\dfrac{${num}}{${den}}`)
    ])
  }), [
    { fav: 18, tot: 30, num: 3, den: 5 },
    { fav: 14, tot: 21, num: 2, den: 3 },
    { fav: 16, tot: 40, num: 2, den: 5 }
  ]));

  add(RISK, 'Tree diagrams - interpret', 'tree-diagrams-interpret', three(({ p }) => {
    const ans = n2(p * p);
    return {
      q: `$P(\\text{win})=${p}$ on each independent game. Find $P(\\text{win then win})$.`,
      a: lines([`Multiply along the path: $${p}\\times ${p}=${ans}$`, final(String(ans))])
    };
  }, [{ p: 0.4 }, { p: 0.3 }, { p: 0.5 }]));

  add(RISK, 'Tree diagrams - draw', 'tree-diagrams-draw', three(({ p }) => {
    const qv = show(1 - p);
    return {
      q: `On a probability tree, $P(\\text{Win})=${p}$. What probability goes on the Lose branch?`,
      a: lines([`Branches from a point sum to $1$.`, `$1-${p}=${qv}$`, final(String(qv))])
    };
  }, [{ p: 0.4 }, { p: 0.3 }, { p: 0.25 }]));
}

const F_PACK = {
  identify: [
    { seq: '2,4,8,16,\\ldots', kind: 'geometric' },
    { seq: '3,7,11,15,\\ldots', kind: 'linear' },
    { seq: '1,4,9,16,\\ldots', kind: 'quadratic' }
  ],
  linearTerms: [{ a: 3, b: 2, n: 10 }, { a: 5, b: -1, n: 8 }, { a: 4, b: 7, n: 6 }],
  geometric: [{ first: 3, r: 2 }, { first: 5, r: 3 }, { first: 8, r: 0.5 }],
  genQuad: [{ a: 1, b: 0, c: 1 }, { a: 1, b: 2, c: 0 }, { a: 2, b: 0, c: 3 }],
  pattern: [{ a: 1, b: 2, c: -1 }, { a: 1, b: 1, c: 1 }, { a: 2, b: 0, c: 1 }],
  intro: [
    { ask: 'hypotenuse', ans: 'hypotenuse', hyp: '', opp: '', adj: '', ang: 30 },
    { ask: 'side opposite the marked angle', ans: 'opposite', hyp: '', opp: '', adj: '', ang: 40 },
    { ask: 'side adjacent to the marked angle', ans: 'adjacent', hyp: '', opp: '', adj: '', ang: 50 }
  ],
  sine: [{ hyp: 10, ang: 30 }, { hyp: 8, ang: 30 }, { hyp: 14, ang: 30 }],
  cosine: [{ hyp: 8, ang: 60 }, { hyp: 10, ang: 60 }, { hyp: 12, ang: 60 }],
  tangent: [{ adj: 6, ang: 45 }, { adj: 5, ang: 45 }, { adj: 9, ang: 45 }],
  mixed: [
    { kind: 'sin', hyp: 20, ang: 30 },
    { kind: 'cos', hyp: 16, ang: 60 },
    { kind: 'tan', adj: 7, ang: 45 }
  ],
  elimSub: [{ a: 3, b1: 2, c1: 16, b2: 1, c2: 11 }, { a: 4, b1: 3, c1: 18, b2: 1, c2: 10 }, { a: 2, b1: 5, c1: 19, b2: 3, c2: 13 }],
  elimSubF: [{ a: 5, b1: 3, c1: 19, b2: -2, c2: -1 }, { a: 4, b1: 5, c1: 23, b2: -1, c2: 5 }, { a: 6, b1: 2, c1: 14, b2: -3, c2: -4 }],
  elimAdd: [{ a1: 2, b: 3, c1: 13, a2: 2, c2: 1 }, { a1: 5, b: 2, c1: 16, a2: 3, c2: 4 }, { a1: 1, b: 4, c1: 14, a2: 3, c2: 2 }],
  graphical: [{ m1: 1, c1: 1, m2: -1, c2: 5 }, { m1: 2, c1: 0, m2: -1, c2: 6 }, { m1: 1, c1: -2, m2: 0.5, c2: 1 }],
  mulOne: [{ a1: 1, b1: 2, c1: 8, a2: 2, b2: 3, c2: 18 }, { a1: 1, b1: 3, c1: 11, a2: 3, b2: 2, c2: 16 }, { a1: 2, b1: 1, c1: 9, a2: 4, b2: 5, c2: 23 }],
  mulBoth: [{ a1: 2, b1: 3, c1: 13, a2: 3, b2: 2, c2: 12 }, { a1: 2, b1: 5, c1: 16, a2: 3, b2: 4, c2: 18 }, { a1: 3, b1: 4, c1: 17, a2: 2, b2: 5, c2: 16 }],
  coord: [
    { x1: 2, y1: 3, x2: 8, y2: 7, kind: 'mid' },
    { x1: 0, y1: 0, x2: 3, y2: 4, kind: 'dist' },
    { x1: 1, y1: 5, x2: 7, y2: 9, kind: 'mid' }
  ],
  area: [{ W: 10, H: 8, cutW: 4, cutH: 3 }, { W: 12, H: 7, cutW: 5, cutH: 2 }, { W: 9, H: 6, cutW: 3, cutH: 4 }],
  reason: [
    { given: 125, ans: 55, reason: 'angles on a straight line sum to 180 degrees' },
    { given: 110, ans: 70, reason: 'angles on a straight line sum to 180 degrees' },
    { given: 47, ans: 133, reason: 'angles on a straight line sum to 180 degrees' }
  ],
  angles: [
    { kind: 'co', given: 115 },
    { kind: 'iso', given: 70 },
    { kind: 'pt', given: 140 }
  ],
  congru: [
    { cond: 'SSS', why: 'three pairs of equal sides' },
    { cond: 'SAS', why: 'two sides and the included angle equal' },
    { cond: 'RHS', why: 'a right angle, the hypotenuse and another side equal' }
  ],
  form: [{ a: 3, b: 2, k: 40, total: 180 }, { a: 4, b: 1, k: 30, total: 180 }, { a: 5, b: 3, k: 20, total: 180 }],
  bounds: [
    { val: 8, half: 0.5, unit: 'cm to the nearest cm' },
    { val: 7.4, half: 0.05, unit: 'cm to 1 d.p.' },
    { val: 120, half: 5, unit: 'm to the nearest 10 m' }
  ],
  error: [
    { val: 7.4, half: 0.05 },
    { val: 24, half: 0.5 },
    { val: 6.0, half: 0.05 }
  ],
  powers: [
    { n: 64, form: '8^{2}' },
    { n: 27, form: '3^{3}' },
    { n: 81, form: '3^{4}' }
  ],
  negIdx: [{ base: 2, p: 3 }, { base: 5, p: 2 }, { base: 3, p: 2 }],
  fracIdx: [
    { base: 8, n: 3, m: 1, root: 2, ans: 2 },
    { base: 27, n: 3, m: 2, root: 3, ans: 9 },
    { base: 16, n: 4, m: 3, root: 2, ans: 8 }
  ]
};

const H_PACK = {
  identify: [
    { seq: '5,10,20,40,\\ldots', kind: 'geometric' },
    { seq: '9,6,3,0,\\ldots', kind: 'linear' },
    { seq: '2,8,18,32,\\ldots', kind: 'quadratic' }
  ],
  linearTerms: [{ a: 4, b: -3, n: 12 }, { a: 7, b: 1, n: 9 }, { a: -2, b: 15, n: 7 }],
  geometric: [{ first: 2, r: 4 }, { first: 81, r: 1 / 3 }, { first: -3, r: -2 }],
  genQuad: [{ a: 2, b: 1, c: 0 }, { a: 1, b: -1, c: 2 }, { a: 3, b: 0, c: -1 }],
  pattern: [{ a: 2, b: 1, c: 1 }, { a: 1, b: -2, c: 3 }, { a: 3, b: 1, c: 0 }],
  intro: [
    { ask: 'hypotenuse', ans: 'hypotenuse', hyp: '', opp: '', adj: '', ang: 35 },
    { ask: 'side opposite the marked angle', ans: 'opposite', hyp: '', opp: '', adj: '', ang: 55 },
    { ask: 'side adjacent to the marked angle', ans: 'adjacent', hyp: '', opp: '', adj: '', ang: 25 }
  ],
  sine: [{ hyp: 12, ang: 30 }, { hyp: 20, ang: 30 }, { hyp: 16, ang: 45 }],
  cosine: [{ hyp: 14, ang: 60 }, { hyp: 18, ang: 60 }, { hyp: 10, ang: 45 }],
  tangent: [{ adj: 8, ang: 45 }, { adj: 4, ang: 60 }, { adj: 10, ang: 30 }],
  mixed: [
    { kind: 'sin', hyp: 18, ang: 30 },
    { kind: 'cos', hyp: 12, ang: 45 },
    { kind: 'tan', adj: 6, ang: 60 }
  ],
  elimSub: [{ a: 5, b1: 2, c1: 19, b2: 1, c2: 11 }, { a: 6, b1: 4, c1: 26, b2: 1, c2: 11 }, { a: 7, b1: 3, c1: 24, b2: 2, c2: 17 }],
  elimSubF: [{ a: 4, b1: 7, c1: 25, b2: -3, c2: -5 }, { a: 8, b1: 5, c1: 29, b2: -2, c2: 4 }, { a: 3, b1: 6, c1: 21, b2: -1, c2: 2 }],
  elimAdd: [{ a1: 3, b: 4, c1: 18, a2: 5, c2: 2 }, { a1: 6, b: 1, c1: 13, a2: 2, c2: 5 }, { a1: 4, b: 5, c1: 23, a2: 1, c2: 7 }],
  graphical: [{ m1: 3, c1: -1, m2: -1, c2: 7 }, { m1: 0.5, c1: 2, m2: -0.5, c2: 6 }, { m1: 2, c1: 3, m2: -2, c2: 11 }],
  mulOne: [{ a1: 1, b1: 4, c1: 14, a2: 3, b2: 5, c2: 27 }, { a1: 2, b1: 3, c1: 17, a2: 4, b2: 1, c2: 19 }, { a1: 1, b1: 5, c1: 16, a2: 2, b2: 3, c2: 17 }],
  mulBoth: [{ a1: 3, b1: 5, c1: 19, a2: 2, b2: 3, c2: 12 }, { a1: 4, b1: 3, c1: 23, a2: 3, b2: 5, c2: 21 }, { a1: 5, b1: 2, c1: 16, a2: 3, b2: 4, c2: 17 }],
  coord: [
    { x1: -2, y1: 4, x2: 6, y2: 10, kind: 'mid' },
    { x1: 1, y1: 2, x2: 13, y2: 7, kind: 'dist' },
    { x1: -3, y1: -1, x2: 5, y2: 15, kind: 'dist' }
  ],
  area: [{ W: 14, H: 9, cutW: 6, cutH: 4 }, { W: 11, H: 10, cutW: 3, cutH: 5 }, { W: 15, H: 8, cutW: 7, cutH: 3 }],
  reason: [
    { given: 118, ans: 62, reason: 'angles on a straight line sum to 180 degrees' },
    { given: 73, ans: 107, reason: 'angles on a straight line sum to 180 degrees' },
    { given: 154, ans: 26, reason: 'angles on a straight line sum to 180 degrees' }
  ],
  angles: [
    { kind: 'co', given: 108 },
    { kind: 'iso', given: 52 },
    { kind: 'pt', given: 215 }
  ],
  congru: [
    { cond: 'ASA', why: 'two angles and the included side equal' },
    { cond: 'SSS', why: 'three pairs of equal sides' },
    { cond: 'SAS', why: 'two sides and the included angle equal' }
  ],
  form: [{ a: 2, b: 5, k: 12, total: 180 }, { a: 7, b: 2, k: 18, total: 180 }, { a: 3, b: 6, k: 45, total: 360 }],
  bounds: [
    { val: 8, half: 0.5, unit: 'cm to the nearest cm' },
    { val: 3.6, half: 0.05, unit: 'cm to 1 d.p.' },
    { val: 40, half: 5, unit: 'kg to the nearest 10 kg' }
  ],
  error: [
    { val: 24, half: 0.5 },
    { val: 3.80, half: 0.005 },
    { val: 150, half: 5 }
  ],
  powers: [
    { n: 64, form: '4^{3}' },
    { n: 81, form: '9^{2}' },
    { n: 32, form: '2^{5}' }
  ],
  negIdx: [{ base: 4, p: 2 }, { base: 2, p: 4 }, { base: 10, p: 3 }],
  fracIdx: [
    { base: 27, n: 3, m: 2, root: 3, ans: 9 },
    { base: 32, n: 5, m: 1, root: 2, ans: 2 },
    { base: 81, n: 4, m: 3, root: 3, ans: 27 }
  ]
};

function orderBy(items, ids) {
  const map = Object.fromEntries(items.map(it => [it.id, it]));
  return ids.map(id => {
    if (!map[id]) throw new Error('missing topic ' + id);
    return map[id];
  });
}

const F_ORDER = [
  'nth-term-linear-ascending-recap', 'nth-term-linear-descending-recap', 'identify-describe-sequences',
  'terms-in-linear-sequence', 'generate-geometric-sequences', 'generate-quadratic-sequences',
  'nth-term-quadratic-pattern', 'intro-to-trig', 'sine-lengths', 'cosine-lengths', 'tangent-lengths',
  'mixed-ratios', 'solving-by-noticing-recap', 'elimination-by-subtraction',
  'elimination-by-subtraction-further', 'elimination-by-addition', 'elimination-add-or-subtract',
  'simultaneous-equations-graphically', 'multiply-one-equation', 'multiply-both-equations',
  'coordinate-problems', 'area-perimeter-problems', 'give-a-reason', 'angle-problems',
  'congruent-triangles', 'forming-solving-equations-geo', 'rounding-dp-recap', 'rounding-sf-recap',
  'truncation-recap', 'estimation-recap', 'powers-roots-recap', 'upper-lower-bounds',
  'error-intervals', 'recognising-powers', 'negative-indices', 'fractional-indices',
  'frequency-trees-recap', 'and-rule-recap', 'or-rule-recap', 'venn-diagrams-interpret',
  'venn-diagrams-create', 'relative-frequency', 'tree-diagrams-interpret', 'tree-diagrams-draw'
];

const H_ORDER = [
  'identify-describe-sequences', 'terms-in-linear-sequence', 'generate-geometric-sequences',
  'generate-quadratic-sequences', 'nth-term-quadratic-pattern', 'nth-term-quadratic-ax2b',
  'nth-term-quadratic-ax2bxc', 'intro-to-trig', 'sine-lengths', 'cosine-lengths', 'tangent-lengths',
  'mixed-ratios', 'sine-ratio-angles', 'cosine-tangent-angles', 'mixed-angles-sides',
  'trig-bearings', 'trig-3d', 'sine-rule', 'cosine-rule', 'elimination-by-subtraction',
  'elimination-by-subtraction-further', 'elimination-by-addition',
  'simultaneous-equations-graphically', 'multiply-one-equation', 'multiply-both-equations',
  'substitution-method', 'solving-involving-quadratics', 'coordinate-problems',
  'area-perimeter-problems', 'give-a-reason', 'angle-problems', 'congruent-triangles',
  'forming-solving-equations-geo', 'area-rule', 'upper-lower-bounds', 'error-intervals',
  'solve-problems-bounds', 'recognising-powers', 'noncalc-powers-roots', 'negative-indices',
  'fractional-indices', 'simplifying-surds', 'calculating-surds', 'expanding-brackets-surds',
  'rationalising-denominator', 'rationalising-denominator-further'
];

function buildFoundation() {
  const items = [];
  const add = addFactory(items);
  addFoundationOnlySequences(add);
  addSharedSequences(add, F_PACK);
  addSharedTrig(add, F_PACK);
  addFoundationOnlySim(add);
  addSharedSim(add, F_PACK);
  addSharedGeo(add, F_PACK);
  addFoundationOnlyCalc(add);
  addSharedCalc(add, F_PACK);
  addFoundationRisk(add);
  return orderBy(items, F_ORDER);
}

function buildHigher() {
  const items = [];
  const add = addFactory(items);
  addSharedSequences(add, H_PACK);
  addHigherOnlySequences(add);
  addSharedTrig(add, H_PACK);
  addHigherTrig(add);
  addSharedSim(add, H_PACK);
  addHigherOnlySim(add);
  addSharedGeo(add, H_PACK);
  addHigherGeo(add);
  addSharedCalc(add, H_PACK);
  addHigherOnlyCalc(add);
  return orderBy(items, H_ORDER);
}

module.exports = { buildFoundation, buildHigher };
