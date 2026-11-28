// ═══════════════════════════════════════════════════════════════════════════
//  APP STATE
// ═══════════════════════════════════════════════════════════════════════════
const STRAND_KEYS   = UNIT_KEYS;
const STRAND_LABELS = UNIT_LABELS;

let currentStrand = UNIT_KEYS[0];
let currentTopic  = 0;
let currentStyle  = 'qs';
let revealed  = {};
let hiddenQs  = {};

let viewMode = 15; // 15 = normal, 6 = board mode (rows 0-1 only)

function applyViewMode() {}

function toggleViewMode() {
  viewMode = viewMode === 15 ? 6 : 15;
  document.body.classList.toggle('mode6', viewMode === 6);
  const btn = document.getElementById('btnview');
  if (btn) {
    btn.textContent = viewMode === 6 ? 'Show all' : 'Show 6';
    btn.classList.toggle('active', viewMode === 6);
  }
}

let versions  = {};
let fontSize  = 18;
let printScale = 90;

function currentQs() {
  const topics = TOPICS();
  const topic = topics[currentTopic];
  return topic ? (topic[currentStyle] || topic.qs || []) : [];
}
function qCount() { return currentQs().length; }
function boardTitle() {
  if (typeof BOARD_TITLE === 'string' && BOARD_TITLE) return BOARD_TITLE;
  const pack = DATA.all && DATA.all[0];
  return (pack && pack.u) ? String(pack.u).replace(' · ', ' ') : 'Cycle revision';
}
function verOf(q) {
  if (q && q.q3) return 3;
  if (q && q.q2) return 2;
  return 1;
}
function qText(q, ver) {
  if (ver === 3 && q.q3) return q.q3;
  if (ver === 2 && q.q2) return q.q2;
  return q.q;
}
function aText(q, ver) {
  if (ver === 3 && q.a3) return q.a3;
  if (ver === 2 && q.a2) return q.a2;
  return q.a;
}
function nextVer(q, ver) {
  const max = verOf(q);
  return ver >= max ? 1 : ver + 1;
}
function versionLabel() {
  const v = versions[0] || 1;
  const nxt = v === 1 ? 2 : v === 2 ? 3 : 1;
  return 'Switch to V' + nxt;
}
function setVersionButtons(v) {
  const btn = document.getElementById('btnver');
  if (btn) btn.textContent = 'Switch to V' + (v === 1 ? 2 : v === 2 ? 3 : 1);
  const fv = document.getElementById('fverbtn');
  if (fv) { fv.classList.toggle('on', v !== 1); fv.textContent = 'V' + v; }
  const vv = document.getElementById('vizver');
  if (vv) { vv.classList.toggle('on', v !== 1); vv.textContent = 'V' + v; }
}

// ── Suppress KaTeX console noise ──
(function() {
  const _err = console.error.bind(console);
  console.error = function(...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('KaTeX')) return;
    _err(...args);
  };
})();

// ── KaTeX ──
function initKatex() {
  if (typeof renderMathInElement !== 'undefined' && TOPICS().length > 0) {
    try {
      renderMathInElement(document.getElementById('grid'), {
        delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],
        throwOnError:false,
        strict: false,
        ignoredClasses: ['qhint','qnum','qver','qcbtn','qhiddennum','qhiddenlbl']
      });
    } catch(e) { /* suppress */ }
  }
}

// ── Export HTML with edits baked in ──
function exportHTML() {
  const src = document.documentElement.outerHTML;
  const dataStr = JSON.stringify(DATA, null, 2);
  // Replace the DATA object in the source with the current live version
  const exported = src.replace(
    /const DATA = \{[\s\S]*?\n\};/,
    'const DATA = ' + dataStr + ';'
  );
  const blob = new Blob([exported], {type: 'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'donow-strands.html';
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Print Worksheet ──────────────────────────────────────────────────────────
function printSheet() {
  const topics = TOPICS();
  const topic  = topics[currentTopic];
  if (!topic) return;

  const qs     = currentQs();
  const title  = (topic.u || '') + (topic.l && topic.l !== topic.u ? ' \u2014 ' + topic.l : '') + ' \u2014 ' + boardTitle();
  const activeVer = versions[0] || 1;

  // Pre-render KaTeX in the parent page (already loaded) using temp elements
  function buildSet() {
    let html = '';
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      if (!q) continue;
      const raw = qText(q, activeVer);
      const qShow = raw;
      const tmp = document.createElement('div');
      tmp.innerHTML = qShow;
      try {
        renderMathInElement(tmp, {
          delimiters:[{left:'$',right:'$',display:false}],
          throwOnError:false, strict:false
        });
      } catch(e){}
      html += '<div class="pz-q"><span class="pz-n">' + (i+1) + '</span><div class="pz-t">' + tmp.innerHTML + '</div></div>';
    }
    return html;
  }

  const setHTML = buildSet();
  const pz = document.getElementById('pz');
  pz.innerHTML =
    '<div class="pz-half"><div class="pz-title">' + title + '</div><div class="pz-grid">' + setHTML + '</div></div>' +
    '<div class="pz-half"><div class="pz-title">' + title + '</div><div class="pz-grid">' + setHTML + '</div></div>';
  tagDiagrams(pz);

  // Double rAF ensures browser has painted #pz before print dialog opens
  const scaleFrac = printScale / 100;
  pz.style.transform = scaleFrac < 1 ? 'scale(' + scaleFrac + ')' : '';
  pz.style.width = scaleFrac < 1 ? (100 / scaleFrac) + '%' : '';

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      window.print();
      pz.innerHTML = '';
      pz.style.transform = '';
      pz.style.width = '';
    });
  });
}

function setPrintScale(pct) {
  pct = Math.round(pct / 5) * 5;
  pct = Math.max(50, Math.min(100, pct));
  printScale = pct;
  const inp = document.getElementById('printScaleInput');
  if (inp && parseInt(inp.value) !== pct) inp.value = pct;
}

// ── Strand Bar ──


function TOPICS() {
  return DATA[currentStrand] || [];
}

function buildSubStrandBar() {
  const bar = document.getElementById('substrandbar');
  if (bar) bar.style.display = 'none';
}

function buildStrandBar() {
  const bar = document.getElementById('strandbar');
  bar.innerHTML = '';
  STRAND_KEYS.forEach((key, i) => {
    const btn = document.createElement('button');
    btn.className = 'strandbtn' + (key === currentStrand ? ' active' : '');
    const pack = (DATA[key] || [])[0];
    const count = pack && pack.qs ? pack.qs.length : 0;
    btn.innerHTML = STRAND_LABELS[i] +
      '<span class="strbadge">' + count + '</span>';
    btn.onclick = () => switchStrand(key);
    bar.appendChild(btn);
  });
  buildSubStrandBar();
}

function switchStrand(key) {
  currentStrand = key;
  currentTopic  = 0;
  revealed = {}; hiddenQs = {}; versions = {};
  buildStrandBar();
  populateTopicSelect();
  renderGrid();
}

// ── Topic Select ──
function populateTopicSelect() {
  const sel = document.getElementById('topsel');
  sel.innerHTML = '';
  const topics = TOPICS();
  if (!topics.length) {
    const opt = document.createElement('option');
    opt.textContent = '— No topics available —';
    opt.disabled = true; opt.selected = true;
    sel.appendChild(opt);
    return;
  }
  topics.forEach((t, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = t.u + ' · ' + t.l;
    sel.appendChild(opt);
  });
  sel.value = currentTopic;
}

// ── Font ──
// ── Diagram size: 50% to 200% in steps of 10%, separate from text size ──
let diagramScale = 100;
function changeDiagram(delta) {
  diagramScale = Math.min(200, Math.max(50, diagramScale + delta * 10));
  document.getElementById('dgdisplay').textContent = diagramScale + '%';
  document.documentElement.style.setProperty('--dscale', (diagramScale / 100).toFixed(2));
  if (typeof focusMode !== 'undefined' && focusMode) { if (typeof f3Fit === 'function') f3Fit(); requestAnimationFrame(penRedraw); }
}
// remember each diagram's own width so it can be scaled (KaTeX's internal svgs are left alone)
function tagDiagrams(root) {
  if (!root) return;
  root.querySelectorAll('svg[width]').forEach(sv => {
    if (sv.closest('.katex')) return;
    const w = sv.getAttribute('width');
    if (/^\d+(\.\d+)?$/.test(w)) sv.style.setProperty('--w', w + 'px');
  });
}
function changeFont(delta) {
  fontSize = Math.min(32, Math.max(10, fontSize + delta));
  document.getElementById('szdisplay').textContent = fontSize;
  document.body.style.fontSize = fontSize + 'px';
  // Focus mode text scales with the size buttons too (18 = normal size)
  document.documentElement.style.setProperty('--fscale', (fontSize / 18).toFixed(3));
}

// ── Panel ──
function togglePanel() { document.getElementById('panel').classList.toggle('open'); }
function onStyleChange() { currentStyle = 'qs'; }
function onTopicChange() {}

// ── Load & Render ──
function loadQuestions() {
  if (!TOPICS().length) return;
  currentTopic = parseInt(document.getElementById('topsel').value) || 0;
  currentStyle = 'qs';
  revealed = {}; hiddenQs = {}; versions = {};
  setVersionButtons(1);
  document.getElementById('panel').classList.remove('open');
  renderGrid();
}

function renderGrid(keepFocusQ) {
  const topics = TOPICS();
  const grid       = document.getElementById('grid');
  const empty      = document.getElementById('emptystate');
  const titlestrip = document.getElementById('titlestrip');

  if (!topics.length) {
    grid.style.display = 'none';
    titlestrip.style.display = 'none';
    empty.classList.add('show');
    document.getElementById('toplabel').textContent = STRAND_LABELS[STRAND_KEYS.indexOf(currentStrand)] + ' — No topics yet';
    document.getElementById('tunit').textContent = '';
    document.getElementById('ttopic').textContent = '';
    return;
  }

  empty.classList.remove('show');
  grid.style.display = '';
  titlestrip.style.display = '';

  const topic = topics[currentTopic];
  const qs = currentQs();

  document.getElementById('tunit').textContent  = (topic.u || '') + ' · ';
  document.getElementById('ttopic').textContent = topic.l;
  const strandLabel = STRAND_LABELS[STRAND_KEYS.indexOf(currentStrand)];
  document.getElementById('toplabel').textContent =
    boardTitle() + ' — ' + strandLabel + ' · ' + qs.length + ' topics';

  grid.innerHTML = '';
  const cols = 3;
  const rows = Math.ceil(qs.length / cols) || 1;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;
      const q = qs[idx];
      if (!q) continue;

      const ver      = versions[idx] || 1;
      const displayQ = qText(q, ver);
      const ansHtml  = aText(q, ver);
      const maxV     = verOf(q);
      const hasAlt   = maxV > 1;
      const nxt      = nextVer(q, ver);
      const isHidden = !!hiddenQs[idx];
      const topicBit = q.topic ? '<span class="qtopic">' + q.topic + '</span>' : '';

      const card = document.createElement('div');
      card.className = 'qcard' + (isHidden ? ' qhidden' : '') + (revealed[idx] ? ' rev' : '');
      card.id = 'card' + idx;
      card.dataset.idx = idx;
      card.dataset.col = col;
      card.dataset.row = row;

      card.innerHTML = `
        <div class="qhiddenbar" onclick="event.stopPropagation();showQ(${idx})">
          <span class="qhiddennum">${idx+1}</span>
          <span class="qhiddenlbl">hidden</span>
          <button class="qhiddenshow" onclick="event.stopPropagation();showQ(${idx})">show</button>
        </div>
        <div class="qrow">
          <span class="qnum">${idx+1}${hasAlt ? '<span class="qver"> v'+ver+'</span>' : ''}</span>
          <span class="qtxt">${topicBit}${displayQ}</span>
          <span class="qans${revealed[idx]?' show':''}" id="ans${idx}"><span class="qansmark">✓</span>${ansHtml}</span>
          <span class="qcontrols">
            ${hasAlt ? '<button class="qcbtn qcswap" onclick="event.stopPropagation();swapVersion('+idx+')" title="Swap to v'+nxt+'">⟲ v'+nxt+'</button>' : ''}
            <button class="qcbtn qcedit" onclick="event.stopPropagation();editQuestion(${idx})" title="Edit">✎</button>
            <button class="qcbtn qchide" onclick="event.stopPropagation();hideQ(${idx})" title="Hide">✕</button>
          </span>
        </div>`;
      card.addEventListener('click', () => toggleCard(idx));
      grid.appendChild(card);
    }
  }
  reRenderMath();
  applyViewMode();
  tagDiagrams(document.getElementById('grid'));
  if (focusMode) { const keep = keepFocusQ ? focusIdx : 0; focusRevd = {}; focusIdx = keep; buildFocusDots(); focusGoTo(keep); }
}

// ── FOCUS MODE ──────────────────────────────────────────────────────────────
let focusMode = false;
let focusIdx  = 0;
let focusRevd = {};

function buildFocusDots() {
  const wrap = document.getElementById('fdots');
  wrap.innerHTML = '';
  for (let i = 0; i < qs.length; i++) {
    const d = document.createElement('div');
    d.className = 'fdot';
    d.dataset.i = i;
    d.onclick = () => focusGoTo(i);
    wrap.appendChild(d);
  }
}

function toggleFocusMode() {
  if (typeof vizToggle === 'function' && document.body.classList.contains('vizmode')) vizToggle(false);
  if (typeof toggleBlank === 'function') toggleBlank(false);
  focusMode = !focusMode;
  focusRevd = {};
  focusIdx  = 0;
  document.body.classList.toggle('focusmode', focusMode);
  if (typeof resetFreePos === 'function') { resetFreePos(); if (focusMode) { vizApplyScale(); vizStartLoop(); } }
  const btn = document.getElementById('btnfocus');
  btn.classList.toggle('focuson', focusMode);
  btn.innerHTML = focusMode ? '&#9635; Grid' : '&#9654; Focus';
  if (!focusMode && penOn) penToggle();
  if (focusMode) {
    buildFocusDots();
    focusGoTo(0);
  }
}

function focusGoTo(idx) {
  const topics = TOPICS();
  if (!topics.length) return;
  const topic = topics[currentTopic];
  const qs    = currentQs();
  focusIdx    = Math.max(0, Math.min(qs.length - 1, idx));
  const q     = qs[focusIdx];
  if (!q) return;

  const ver  = versions[focusIdx] || 1;
  const qTxt = (q.topic ? '<div class="qtopic">' + q.topic + '</div>' : '') + qText(q, ver);
  const aTxt = aText(q, ver);
  const rev  = !!focusRevd[focusIdx];
  const total = qs.length;

  document.getElementById('focusqnum').textContent = 'Question ' + (focusIdx + 1) + ' of ' + total;
  document.getElementById('focusq').innerHTML = qTxt;
  document.getElementById('focusa').innerHTML = '<span class="qansmark">✓</span>' + aTxt;
  document.getElementById('focusa').classList.toggle('show', rev);
  document.getElementById('focushint').style.display = rev ? 'none' : '';
  document.getElementById('fprogressbar').style.width = ((focusIdx + 1) / total * 100) + '%';

  document.querySelectorAll('.fdot').forEach((d, i) => {
    d.classList.toggle('cur',  i === focusIdx);
    d.classList.toggle('done', i < focusIdx);
  });
  document.getElementById('fnavprev').style.opacity = focusIdx === 0 ? '0.3' : '1';
  document.getElementById('fnavnext').style.opacity = focusIdx === total - 1 ? '0.3' : '1';

  if (focus3) render3(qs);
  reRenderMath();
  vizApplyScale();
  requestAnimationFrame(penRedraw);
  if (document.body.classList.contains('vizmode')) setTimeout(vizPlace, 120);
}

// ── 3 questions at a time ──
let focus3 = false;
function f3Start() { return focusIdx - (focusIdx % 3); }
function render3(qs) {
  const start = f3Start(), wrap = document.getElementById('focus3wrap');
  let html = '';
  for (let i = start; i < Math.min(start + 3, qs.length); i++) {
    const q = qs[i]; if (!q) continue;
    const ver = versions[i] || 1;
    const qT = (q.topic ? '<div class="qtopic">' + q.topic + '</div>' : '') + qText(q, ver), aT = aText(q, ver);
    html += '<div class="f3card' + (i === focusIdx ? ' cur' : '') + '" data-i="' + i + '" onclick="f3Toggle(' + i + ')">' +
      '<div class="f3num">' + (i + 1) + '</div><div class="f3q">' + qT + '</div>' +
      '<div class="f3a' + (focusRevd[i] ? ' show' : '') + '"><span class="qansmark">✓</span>' + aT + '</div></div>';
  }
  wrap.innerHTML = html;
  f3Fit();
  const total = qs.length;
  document.querySelectorAll('.fdot').forEach((d, i) => {
    d.classList.toggle('cur', i >= start && i < start + 3);
    d.classList.toggle('done', i < start);
  });
  document.getElementById('fprogressbar').style.width = (Math.min(start + 3, total) / total * 100) + '%';
  document.getElementById('fnavprev').style.opacity = start === 0 ? '0.3' : '1';
  document.getElementById('fnavnext').style.opacity = start + 3 >= total ? '0.3' : '1';
}
// with the pen on, the 3 questions stack in the left half: size them to fit the screen height
function f3Fit() {
  const w = document.getElementById('focuswrap'), f = document.getElementById('focus3wrap');
  if (!focus3 || !penOn) { f.style.removeProperty('--f3card'); f.style.removeProperty('--f3svg'); return; }
  const wr = w.getBoundingClientRect(), tr = document.getElementById('pentools').getBoundingClientRect();
  const avail = Math.min(wr.bottom, window.innerHeight) - Math.max(tr.bottom, wr.top) - 70; // visible room under the pen tools
  const card = Math.max(90, Math.floor((avail - 88) / 3));
  f.style.setProperty('--f3card', card + 'px');
  f.style.setProperty('--f3svg', Math.max(50, card - 70) + 'px');
}
function f3Toggle(i) {
  focusRevd[i] = !focusRevd[i];
  const el = document.querySelector('.f3card[data-i="' + i + '"] .f3a');
  if (el) el.classList.toggle('show', !!focusRevd[i]);
}
let f3Single = 0;
function focusThree() {
  if (!focus3) f3Single = focusIdx;                   // remember the single question we came from
  focus3 = !focus3;
  document.body.classList.toggle('focus3', focus3);
  document.getElementById('threebtn').classList.toggle('on', focus3);
  const vt = document.getElementById('vizthree'); if (vt) vt.classList.toggle('on', focus3);
  if (!focus3 && document.body.classList.contains('vizmode')) setTimeout(vizPlace, 50);
  if (focus3) focusGoTo(f3Start());
  else { const s = focusIdx - (focusIdx % 3); focusGoTo(f3Single >= s && f3Single < s + 3 ? f3Single : s); }
}
// tap at a point: in 3-at-a-time reveal the card under the finger, otherwise the single question
function focusTapAt(x, y) {
  if (!focus3) { focusToggleReveal(); return; }
  const card = document.elementsFromPoint(x, y).find(el => el.classList && el.classList.contains('f3card'));
  if (card) f3Toggle(+card.dataset.i);
}

function focusToggleReveal() {
  focusRevd[focusIdx] = !focusRevd[focusIdx];
  const rev = focusRevd[focusIdx];
  document.getElementById('focusa').classList.toggle('show', rev);
  document.getElementById('focushint').style.display = rev ? 'none' : '';
  if (rev) reRenderMath();
  if (document.body.classList.contains('vizmode')) setTimeout(vizPlace, 120);
}

// ── Swipe left / right with a finger to change question ──
let swipeStart = null, swipeAt = 0;
(function swipeInit() {
  const w = document.getElementById('focuswrap'); if (!w) return;
  w.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch') return;
    if (penOn && !penStylusOnly) return;           // finger is being used as the pen
    if (e.target.closest && e.target.closest('#pentools')) return;
    if (document.body.classList.contains('vizmode') && e.target.closest && e.target.closest('#focuscard, #focus3wrap, #vizbox')) return; // dragging the question
    swipeStart = { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId };
  }, true);
  w.addEventListener('pointerup', e => {
    if (!swipeStart || e.pointerId !== swipeStart.id) return;
    const dx = e.clientX - swipeStart.x, dy = e.clientY - swipeStart.y, dt = Date.now() - swipeStart.t;
    swipeStart = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy) && dt < 900) {
      swipeAt = Date.now();
      focusNav(dx < 0 ? 1 : -1);                    // swipe left = next, swipe right = back
    } else if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && dt < 600) {
      swipeAt = Date.now();                         // a finger tap reveals the answer (handled here so it
      focusTapAt(e.clientX, e.clientY);             // works reliably straight after a swipe)
    }
  }, true);
  w.addEventListener('pointercancel', () => { swipeStart = null; }, true);
  // a swipe should not also count as a tap that reveals the answer
  w.addEventListener('click', e => { if (Date.now() - swipeAt < 500) { e.stopPropagation(); e.preventDefault(); } }, true);
})();

// ── Swipe up / down with a finger in Focus mode to hide / show the top options bar ──
(function barSwipeInit() {
  let t0 = null;
  document.addEventListener('touchstart', e => {
    t0 = null;
    if (!focusMode || e.touches.length !== 1) return;
    if (document.body.classList.contains('vizmode')) return;     // visualiser: fingers drag the question instead
    if (penOn && !penStylusOnly) return;                       // finger is the pen
    if (penCur || Date.now() - penLastAt < 1000) return;        // writing: a resting hand is not a swipe
    if (e.target.closest && e.target.closest('#pentools, #topwrap, #panel, button, select, input')) return;
    const p = e.touches[0]; t0 = { x: p.clientX, y: p.clientY, t: Date.now() };
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (!t0) return;
    const p = e.changedTouches[0], dx = p.clientX - t0.x, dy = p.clientY - t0.y, dt = Date.now() - t0.t;
    t0 = null;
    // a long, deliberate vertical swipe only (40% of the screen height), so writing never triggers it
    if ((window.vizDragEndAt && Date.now() - window.vizDragEndAt < 1000) || (vizDrag && vizDrag.moved) || vizRs) return;
    if (penCur || Date.now() - penLastAt < 1000) return;
    if (Math.abs(dy) < Math.max(220, window.innerHeight * 0.4) || Math.abs(dy) < 2.5 * Math.abs(dx) || dt > 800) return;
    if (dy < 0 && barVisible) toggleTopBar();                  // swipe up: hide
    else if (dy > 0 && !barVisible) toggleTopBar();            // swipe down: show
    else return;
    swipeAt = Date.now();
    setTimeout(() => { if (typeof f3Fit === 'function') f3Fit(); penRedraw(); }, 50);
  }, { passive: true });
})();

function focusNav(dir) {
  // arrows only move between questions; the answer is revealed by tapping the question
  if (focus3) { const s = f3Start() + dir * 3; if (s < 0 || s >= qCount()) return; focusGoTo(s); return; }
  focusGoTo(focusIdx + dir);
}


// ── VISUALISER ─────────────────────────────────────────────────────────────
// Shows only the current question with the live camera (document camera / visualiser) underneath.
// The bottom-right button (or the camera button again) brings everything back.
let vizStream = null, vizCams = [], vizCamIdx = 0, vizRot = 0;
function vizMsg(t) { document.getElementById('vizmsg').textContent = t || ''; }
// list every camera the browser can see and fill the picker
let vizLastErr = null;
function vizWhere() {
  let framed = false; try { framed = window.top !== window; } catch (e) { framed = true; }
  if (framed) return 'The app is open inside another page (a preview or viewer), which blocks cameras. Open the file directly in Chrome or Edge.';
  if (!window.isSecureContext) return 'This browser treats the page as not secure, so it blocks cameras. Open the file in Chrome or Edge, or use the web link.';
  return '';
}
// list every camera the browser can see and fill the picker
async function vizDetect(restart) {
  const sel = document.getElementById('vizsel');
  vizLastErr = null;
  let list = [];
  try { list = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput'); } catch (e) { vizLastErr = e; }
  // some browsers (Safari, locked-down Windows) list nothing, or no names, until a camera has been allowed once
  if (!list.length || !list[0].label) {
    try {
      const tmp = await navigator.mediaDevices.getUserMedia({ video: true });
      const lbl = (tmp.getVideoTracks()[0] || {}).label || '';
      tmp.getTracks().forEach(t => t.stop());
      list = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput');
      if (!list.length) list = [{ deviceId: '', label: lbl || 'Camera' }];
    } catch (e) { vizLastErr = e; }
  }
  vizCams = list;
  const cur = vizCams[vizCamIdx] ? vizCams[vizCamIdx].deviceId : null;
  let saved = null; try { saved = localStorage.getItem('vizCam'); } catch (e) {}
  let i = vizCams.findIndex(d => d.deviceId && d.deviceId === (cur || saved));
  if (i < 0) i = vizCams.findIndex(d => /visuali|document|doc ?cam|ipevo|elmo|hue|ziggi|lumens|aver|joy-?it|usb/i.test(d.label));
  if (i < 0) i = vizCams.findIndex(d => !/integrated|built-?in|facetime|front|user facing|ir camera/i.test(d.label));
  vizCamIdx = i < 0 ? 0 : i;
  sel.innerHTML = vizCams.length ? vizCams.map((d, k) => '<option value="' + k + '"' + (k === vizCamIdx ? ' selected' : '') + '>' + (d.label || ('Camera ' + (k + 1))).replace(/</g, '&lt;') + '</option>').join('') : '<option>No cameras found</option>';
  if (restart && document.body.classList.contains('vizmode')) { vizStop(); vizStart(true); }
}
function vizChoose(k) { vizCamIdx = +k; try { localStorage.setItem('vizCam', vizCams[vizCamIdx].deviceId); } catch (e) {} vizStop(); vizStart(true); }
function vizErrText(e, cam) {
  const n = e && e.name, nm = cam && cam.label ? '"' + cam.label + '"' : 'The camera';
  const where = vizWhere();
  if (where) return where;
  if (n === 'NotAllowedError' || n === 'SecurityError') return 'Camera access is blocked. Click the camera (or padlock) icon in the address bar, choose Allow for the camera, then press Detect. If your school blocks cameras in the browser, IT may need to allow it.';
  if (n === 'NotReadableError' || n === 'AbortError') return nm + ' is being used by another program (e.g. the visualiser\'s own software, Teams or Zoom). Close it, then press Detect.';
  if (n === 'NotFoundError' || n === 'OverconstrainedError') return 'No camera found. Plug in the visualiser (try another USB port), wait a few seconds, then press Detect.';
  return 'Could not start the camera' + (n ? ' (' + n + ')' : '') + '. Press Detect, or choose another camera from the list.';
}
async function vizStart(skipDetect) {
  const v = document.getElementById('vizvideo'), pick = document.getElementById('vizpick');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { pick.classList.add('show'); vizMsg(vizWhere() || 'This browser cannot use a camera here. Open the app in Chrome or Edge.'); return; }
  vizMsg('Looking for cameras…');
  if (!skipDetect || !vizCams.length) await vizDetect(false);
  const cam = vizCams[vizCamIdx];
  if (!cam) { pick.classList.add('show'); vizMsg(vizErrText(vizLastErr || { name: 'NotFoundError' })); return; }
  let err = null;
  const tries = cam.deviceId
    ? [{ deviceId: { exact: cam.deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }, { deviceId: { exact: cam.deviceId } }, true]
    : [{ width: { ideal: 1920 }, height: { ideal: 1080 } }, true];
  for (const c of tries) {
    try { vizStream = await navigator.mediaDevices.getUserMedia({ video: c }); break; } catch (e) { err = e; vizStream = null; }
  }
  if (!vizStream) { pick.classList.add('show'); vizMsg(vizErrText(err, cam)); return; }
  v.srcObject = vizStream; try { await v.play(); } catch (e) {}
  vizMsg(''); pick.classList.remove('show');
  try { if (cam.deviceId) localStorage.setItem('vizCam', cam.deviceId); } catch (e) {}
}
if (navigator.mediaDevices && navigator.mediaDevices.addEventListener)
  navigator.mediaDevices.addEventListener('devicechange', () => { if (document.body.classList.contains('vizmode')) vizDetect(!vizStream); });
// middle of the left half: 46% wide, centred vertically
function vizPlace() {
  if (!document.body.classList.contains('vizmode')) return;
  if (vizDragged) return;                               // keep where the teacher dragged it
  const W = window.innerWidth;
  document.body.style.setProperty('--vzl', Math.round(W * 0.02) + 'px');
  document.body.style.setProperty('--vzw', Math.round(W * 0.46) + 'px');
  document.body.style.setProperty('--vzt', '50vh');
  document.body.style.setProperty('--vztf', 'translateY(-50%)');
}
window.addEventListener('resize', vizPlace);
// ── drag the question (or the 3 questions) around: visualiser mode and all focus modes (pen off) ──
// Mouse / stylus: drag straight away. Finger: in visualiser mode straight away; in normal focus mode
// press and hold for a moment first, so quick finger swipes still change question.
let vizDragged = false, vizDrag = null;
function isViz() { return document.body.classList.contains('vizmode'); }
function vizTarget() { return document.getElementById(document.body.classList.contains('focus3') ? 'focus3wrap' : 'focuscard'); }
function canMoveQ() { return typeof focusMode !== 'undefined' && focusMode && (isViz() || !penOn); }
function curScale() { return vizScales[vizSetKey()] || 1; }
// fix the question at its current place on screen so it can be moved / resized from there
function freezeQ(el) {
  const r = el.getBoundingClientRect(), sc = curScale(), B = document.body.style;
  if (isViz()) {
    vizDragged = true;
    if (el.id === 'focuscard') { B.setProperty('--vzl', r.left + 'px'); B.setProperty('--vzt', r.top + 'px'); B.setProperty('--vztf', 'none'); }
    else { el.style.left = r.left + 'px'; el.style.top = r.top + 'px'; el.style.transform = 'none'; }
  } else if (el.id === 'focuscard') {
    if (!document.body.classList.contains('freepos')) B.setProperty('--fpw', (r.width / sc) + 'px');
    B.setProperty('--fpl', r.left + 'px'); B.setProperty('--fpt', r.top + 'px');
    document.body.classList.add('freepos');
  } else {
    if (!document.body.classList.contains('freepos3')) B.setProperty('--f3w', (r.width / sc) + 'px');
    B.setProperty('--f3l', r.left + 'px'); B.setProperty('--f3t', r.top + 'px');
    document.body.classList.add('freepos3');
  }
  return el.getBoundingClientRect();
}
function placeQ(el, l, t) {
  const B = document.body.style;
  if (isViz()) {
    if (el.id === 'focuscard') { B.setProperty('--vzl', l + 'px'); B.setProperty('--vzt', t + 'px'); }
    else { el.style.left = l + 'px'; el.style.top = t + 'px'; }
  } else if (el.id === 'focuscard') { B.setProperty('--fpl', l + 'px'); B.setProperty('--fpt', t + 'px'); }
  else { B.setProperty('--f3l', l + 'px'); B.setProperty('--f3t', t + 'px'); }
}
function resetFreePos() {
  document.body.classList.remove('freepos', 'freepos3');
}
document.addEventListener('pointerdown', e => {
  if (!canMoveQ() || e.button > 0) return;
  const el = e.target.closest && (document.body.classList.contains('focus3') ? e.target.closest('#focus3wrap') : e.target.closest('#focuscard'));
  if (!el) return;
  const hold = e.pointerType === 'touch' && !isViz();
  vizDrag = { el, id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, hold, holdUntil: Date.now() + 350 };
});
document.addEventListener('pointermove', e => {
  if (!vizDrag || e.pointerId !== vizDrag.id) return;
  const dx = e.clientX - vizDrag.x, dy = e.clientY - vizDrag.y;
  if (!vizDrag.moved) {
    if (vizDrag.hold && Date.now() < vizDrag.holdUntil) { if (Math.hypot(dx, dy) > 10) vizDrag = null; return; }   // moved too soon: it's a swipe
    if (Math.hypot(dx, dy) < 8) return;
    vizDrag.moved = true;
    if (typeof swipeStart !== 'undefined') swipeStart = null;              // this is a move, not a swipe or a tap
    const r = freezeQ(vizDrag.el);
    vizDrag.l = r.left; vizDrag.t = r.top; vizDrag.w = r.width;
    try { vizDrag.el.setPointerCapture(e.pointerId); } catch (err) {}
    document.body.classList.add('vzdragging');
  }
  e.preventDefault();
  const W = window.innerWidth, H = window.innerHeight;
  placeQ(vizDrag.el, Math.min(Math.max(vizDrag.l + dx, 40 - vizDrag.w), W - 40), Math.min(Math.max(vizDrag.t + dy, 0), H - 40));
}, { passive: false });
function vizDragEnd(e) {
  if (!vizDrag || (e && e.pointerId !== vizDrag.id)) return;
  if (vizDrag.moved) { swipeAt = Date.now(); window.vizDragEndAt = Date.now(); }   // a drag is not a tap: don't reveal the answer
  document.body.classList.remove('vzdragging');
  vizDrag = null;
}
document.addEventListener('pointerup', vizDragEnd);
document.addEventListener('pointercancel', vizDragEnd);
document.addEventListener('click', e => {
  if (window.vizDragEndAt && Date.now() - window.vizDragEndAt < 400) { e.stopPropagation(); e.preventDefault(); }
}, true);
// ── resize handle (bottom-right of the question). The size is kept per question set (topic + style).
const vizScales = {};
function vizSetKey() { const t = TOPICS()[currentTopic]; return [currentStrand, t ? t.l : '', currentStyle].join('|'); }
function vizApplyScale() { document.body.style.setProperty('--vzs', vizScales[vizSetKey()] || 1); }
let vizLoopOn = false;
function vizHandleLoop() {
  if (!(typeof focusMode !== 'undefined' && focusMode)) { vizLoopOn = false; return; }
  vizLoopOn = true;
  const h = document.getElementById('vizsize'), r = vizTarget().getBoundingClientRect();
  if (r.width) {
    h.style.left = Math.min(window.innerWidth - 12, Math.max(4, r.right - 4)) + 'px';
    h.style.top = Math.min(window.innerHeight - 12, Math.max(4, r.bottom - 4)) + 'px';
  }
  requestAnimationFrame(vizHandleLoop);
}
function vizStartLoop() { if (!vizLoopOn) requestAnimationFrame(vizHandleLoop); }
let vizRs = null;
document.addEventListener('DOMContentLoaded', () => {
  const h = document.getElementById('vizsize'); if (!h) return;
  h.addEventListener('pointerdown', e => {
    if (!canMoveQ()) return;
    e.preventDefault(); e.stopPropagation();
    const r = freezeQ(vizTarget());                 // anchor the top-left corner so the question grows towards the handle
    vizRs = { id: e.pointerId, x: e.clientX, y: e.clientY, w: r.width, h: r.height, s: curScale() };
    try { h.setPointerCapture(e.pointerId); } catch (err) {}
  });
  h.addEventListener('pointermove', e => {
    if (!vizRs || e.pointerId !== vizRs.id) return;
    const f = Math.max((vizRs.w + (e.clientX - vizRs.x)) / vizRs.w, (vizRs.h + (e.clientY - vizRs.y)) / vizRs.h);
    vizScales[vizSetKey()] = Math.min(3, Math.max(0.4, vizRs.s * f)); vizApplyScale();
  });
  const end = e => { if (vizRs && (!e || e.pointerId === vizRs.id)) { vizRs = null; window.vizDragEndAt = Date.now(); swipeAt = Date.now(); } };
  h.addEventListener('pointerup', end); h.addEventListener('pointercancel', end);
});
function vizStop() {
  if (vizStream) vizStream.getTracks().forEach(t => t.stop());
  vizStream = null; const v = document.getElementById('vizvideo'); if (v) v.srcObject = null;
}
function vizToggle(force) {
  const on = force === undefined ? !document.body.classList.contains('vizmode') : force;
  if (on) {
    if (typeof penOn !== 'undefined' && penOn) penToggle();
    // start the question where it is now, then slide it to the middle of the left half (like the pen)
    const card = document.getElementById('focuscard');
    card.style.transition = 'none'; void card.offsetWidth;
    const rc = card.getBoundingClientRect();
    card.style.transition = '';
    document.body.style.setProperty('--vzl', rc.left + 'px');
    document.body.style.setProperty('--vzt', Math.max(8, rc.top) + 'px');
    document.body.style.setProperty('--vzw', rc.width + 'px');
    document.body.style.setProperty('--vztf', 'none');
    vizDragged = false; const f3w = document.getElementById('focus3wrap'); f3w.style.left = f3w.style.top = f3w.style.transform = '';
    vizApplyScale();
    document.body.classList.add('vizmode');
    void card.offsetWidth;
    vizStartLoop();
    document.body.classList.add('vzanim');
    vizPlace();
    setTimeout(() => document.body.classList.remove('vzanim'), 1600);
    document.getElementById('vizbtn').classList.add('on');
    vizStart();
  } else {
    document.body.classList.remove('vizmode');
    vizDragged = false; const f3x = document.getElementById('focus3wrap'); f3x.style.left = f3x.style.top = f3x.style.transform = '';
    document.getElementById('vizbtn').classList.remove('on');
    vizStop();
  }
}
function vizRotate() { vizRot = (vizRot + 90) % 360; document.getElementById('vizvideo').style.transform = 'rotate(' + vizRot + 'deg)'; }

// ── FOCUS PEN ───────────────────────────────────────────────────────────────
// Annotations are kept in memory for each question (strand, topic, style,
// version, question number). They stay until the app is reloaded.
const penStore = {};
let penLastAt = 0;
let penOn = false, penCol = '#111', penCur = null, penErase = false, penW = 3.5, penStylusOnly = true, penLastType = 'mouse';
function penKey() {
  const topics = TOPICS(); const t = topics[currentTopic];
  if (focus3) { const s = f3Start(); return [currentStrand, t ? t.l : '', currentStyle, 'three', s, [0, 1, 2].map(k => versions[s + k] || 1).join('')].join('|'); }
  return [currentStrand, t ? t.l : '', currentStyle, versions[focusIdx] || 1, focusIdx].join('|');
}
function penCanvas() { return document.getElementById('penlayer'); }
function penSize() {
  const c = penCanvas(), r = c.getBoundingClientRect(), d = window.devicePixelRatio || 1;
  const w = Math.round(r.width * d), h = Math.round(r.height * d);
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  return { w: r.width, h: r.height, d: d };
}
function penRedraw() {
  const c = penCanvas(); if (!c) return;
  const sz = penSize(), ctx = c.getContext('2d');
  ctx.setTransform(sz.d, 0, 0, sz.d, 0, 0);
  ctx.clearRect(0, 0, sz.w, sz.h);
  (penStore[penKey()] || []).forEach(st => penDrawStroke(ctx, st, sz));
}
function penDrawStroke(ctx, st, sz) {
  const p = st.pts; if (!p.length) return;
  const lw = st.erase ? 28 : (st.w || 3.5);
  ctx.globalCompositeOperation = st.erase ? 'destination-out' : 'source-over';
  ctx.strokeStyle = st.col; ctx.fillStyle = st.col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (p.length === 1) { ctx.beginPath(); ctx.arc(p[0][0] * sz.w, p[0][1] * sz.h, lw / 2, 0, Math.PI * 2); ctx.fill(); }
  else {
    ctx.beginPath(); ctx.moveTo(p[0][0] * sz.w, p[0][1] * sz.h);
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0] * sz.w, p[i][1] * sz.h);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
}
function penPoint(e) {
  const r = penCanvas().getBoundingClientRect();
  return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
}
function penToggle() {
  penOn = !penOn;
  setTimeout(f3Fit, 0);
  // the question text only animates while sliding; size buttons change it instantly
  document.body.classList.add('penanim');
  clearTimeout(penToggle._t); penToggle._t = setTimeout(() => document.body.classList.remove('penanim'), 1600);
  document.body.classList.toggle('penon', penOn);
  document.getElementById('penbtn').classList.toggle('on', penOn);
  penRedraw();
}
function penColour(col, btn) {
  penCol = col; penErase = false;
  document.querySelectorAll('#pentools .pencol').forEach(b => b.classList.toggle('sel', b === btn));
  document.getElementById('rubberbtn').classList.remove('sel');
}
function penRubber() {
  penErase = !penErase;
  document.getElementById('rubberbtn').classList.toggle('sel', penErase);
  document.querySelectorAll('#pentools .pencol').forEach(b => b.classList.toggle('sel', !penErase && b.style.background && b.title && penCol === ({Black:'#111',Blue:'#1565c0',Red:'#d32f2f',Green:'#2e7d32'})[b.title]));
}
function penWidth(w) {
  penW = w; penErase = false;
  document.getElementById('penfine').classList.toggle('sel', w < 2.5);
  document.getElementById('penthin').classList.toggle('sel', w >= 2.5 && w < 5);
  document.getElementById('penthick').classList.toggle('sel', w >= 5);
  document.getElementById('rubberbtn').classList.remove('sel');
}
function penStylus() {
  penStylusOnly = !penStylusOnly;
  document.getElementById('stylusbtn').classList.toggle('on', penStylusOnly);
}
function penSquared() {
  const on = document.getElementById('focuswrap').classList.toggle('squared');
  document.getElementById('squaredbtn').classList.toggle('on', on);
}
// a finger touch is ignored for writing when "Stylus only" is on
function penAccepts(e) { return !penStylusOnly || e.pointerType !== 'touch'; }
function penUndo() { const k = penKey(); if (penStore[k] && penStore[k].length) { penStore[k].pop(); penRedraw(); } }
function penClear() { delete penStore[penKey()]; penRedraw(); }
(function penInit() {
  const c = penCanvas(); if (!c) return;
  c.addEventListener('pointerdown', e => {
    penLastType = e.pointerType;
    if (!penOn || !penAccepts(e)) return;
    e.preventDefault(); e.stopPropagation();
    try { c.setPointerCapture(e.pointerId); } catch (err) {}
    const k = penKey();
    penCur = { col: penCol, erase: penErase, w: penW, pts: [penPoint(e)] }; penLastAt = Date.now();
    (penStore[k] = penStore[k] || []).push(penCur);
    penRedraw();
  });
  c.addEventListener('pointermove', e => {
    if (!penOn || !penCur || !penAccepts(e)) return;
    e.preventDefault();
    let evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    if (!evs || !evs.length) evs = [e];
    evs.forEach(ev => penCur.pts.push(penPoint(ev)));
    const sz = penSize(), ctx = c.getContext('2d');
    ctx.setTransform(sz.d, 0, 0, sz.d, 0, 0);
    penDrawStroke(ctx, { col: penCur.col, erase: penCur.erase, w: penCur.w, pts: penCur.pts.slice(-evs.length - 1) }, sz);
  });
  const end = () => { if (penCur) penLastAt = Date.now(); penCur = null; };
  c.addEventListener('pointerup', end);
  c.addEventListener('pointercancel', end);
  c.addEventListener('click', e => {
    if (!penOn) return;
    e.stopPropagation();
    if (penStylusOnly && penLastType === 'touch' && Date.now() - swipeAt > 500) focusTapAt(e.clientX, e.clientY);
  });
  window.addEventListener('resize', () => { if (focusMode) { f3Fit(); penRedraw(); } });
})();

// Keyboard support for focus mode
// Presentation clickers send Page Down / Page Up (or the arrow keys) for next / back,
// and "." or "b" for their blank-screen button: here that shows / hides the answer.
document.addEventListener('keydown', e => {
  if (!focusMode) return;
  const k = e.key;
  // clicker "present / switch screen" button: sends F5, Shift+F5 or Escape (often alternating) -> show / hide the answer
  if (k === 'F5' || k === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); if (isBlank()) { toggleBlank(false); return; } clickerAnswer(e); return; }
  if (isBlank() && ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', ' ', 'PageDown', 'PageUp'].includes(k)) { e.preventDefault(); toggleBlank(false); return; }
  if (k === 'ArrowRight' || k === 'ArrowDown' || k === ' ' || k === 'PageDown') { e.preventDefault(); clickerStep(1, e); }
  else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp')            { e.preventDefault(); clickerStep(-1, e); }
  else if (k === '.' || k === 'b' || k === 'B')            { e.preventDefault(); e.stopImmediatePropagation(); clickerReveal(e); }
});
// clicker / arrow keys: always one question at a time (also in "3 at a time", where the page turns after the third)
let clickerAt = 0;
function clickerStep(dir, e) {
  if (e && e.repeat) return;                                  // held button: no auto-repeat
  if (Date.now() - clickerAt < 250) return;                   // clickers that send two keys per press
  clickerAt = Date.now();
  const n = qCount();
  const i = focusIdx + dir;
  if (i < 0 || i >= n) return;
  focusGoTo(i);
}
// clicker blank-screen button: one press = one show/hide. Many clickers send two or three key
// signals per press (e.g. "b" and "."), which used to toggle the answer on and straight back off.
let revealAt = 0;
function clickerReveal(e) {
  if (e && e.repeat) return;
  if (Date.now() - revealAt < 600) return;
  revealAt = Date.now();
  toggleBlank();
}
let answerAt = 0;
function clickerAnswer(e) {
  if (e && e.repeat) return;
  if (Date.now() - answerAt < 600) return;
  answerAt = Date.now();
  focusRevealKey();
}
// blank the board (Focus mode): a black screen over everything; press again, tap it, or use an arrow to bring it back
function toggleBlank(force) {
  let b = document.getElementById('blankscreen');
  if (!b) {
    b = document.createElement('div'); b.id = 'blankscreen';
    b.style.cssText = 'position:fixed;inset:0;background:#000;z-index:2147483000;display:none;cursor:none';
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); toggleBlank(false); });
    document.body.appendChild(b);
  }
  const on = force === undefined ? b.style.display === 'none' : force;
  b.style.display = on ? 'block' : 'none';
}
function isBlank() { const b = document.getElementById('blankscreen'); return !!b && b.style.display !== 'none'; }
// show / hide the answer from the keyboard or clicker (in "3 at a time": all three together)
function focusRevealKey() {
  if (!focus3) { focusToggleReveal(); return; }
  const cards = [...document.querySelectorAll('.f3card')].map(c => +c.dataset.i);
  const show = cards.some(i => !focusRevd[i]);
  cards.forEach(i => { focusRevd[i] = show; const el = document.querySelector('.f3card[data-i="' + i + '"] .f3a'); if (el) el.classList.toggle('show', show); });
  if (show) reRenderMath();
}

// Re-enter focus mode cleanly when topic/style changes

function reRenderMath() {
  setTimeout(() => {
    if (typeof renderMathInElement === 'undefined') return;
    const opts = {
      delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],
      throwOnError:false,
      errorColor:'#cc0000',
      strict: false,
      ignoredClasses: ['qhint','qnum','qver','qcbtn','qhiddennum','qhiddenlbl']
    };
    try {
      if (focusMode) {
        renderMathInElement(document.getElementById('focuswrap'), opts);
      } else {
        renderMathInElement(document.getElementById('grid'), opts);
      }
    } catch(e) { /* suppress */ }
  }, 50);
}

function toggleCard(idx) {
  const card = document.getElementById('card' + idx);
  if (!card || card.classList.contains('qhidden') || card.classList.contains('editing')) return;
  revealed[idx] = !revealed[idx];
  const ans = document.getElementById('ans' + idx);
  if (!ans) return;
  if (revealed[idx]) { ans.classList.add('show'); card.classList.add('rev'); reRenderMath(); }
  else               { ans.classList.remove('show'); card.classList.remove('rev'); }
}

function revealAll() {
  for (let i = 0; i < qCount(); i++) {
    revealed[i] = true;
    const ans = document.getElementById('ans' + i);
    const card = document.getElementById('card' + i);
    if (ans && card && !card.classList.contains('qhidden')) { ans.classList.add('show'); card.classList.add('rev'); }
  }
  reRenderMath();
}
function hideAll() {
  for (let i = 0; i < qCount(); i++) {
    revealed[i] = false;
    const ans = document.getElementById('ans' + i);
    const card = document.getElementById('card' + i);
    if (ans && card) { ans.classList.remove('show'); card.classList.remove('rev'); }
  }
}

function hideQ(idx) { hiddenQs[idx] = true;  const c = document.getElementById('card'+idx); if(c) c.classList.add('qhidden'); }
function showQ(idx) { hiddenQs[idx] = false; const c = document.getElementById('card'+idx); if(c) c.classList.remove('qhidden'); }
function hideAllQs() { for (let i=0;i<qCount();i++) hideQ(i); }
function showAllQs() { for (let i=0;i<qCount();i++) showQ(i); }

function swapVersion(idx) { const q = currentQs()[idx]; versions[idx] = nextVer(q, versions[idx]||1); renderGrid(true); }

function toggleAllVersions() {
  const qs = currentQs();
  const currentV = versions[0] || 1;
  const newV = currentV === 1 ? 2 : currentV === 2 ? 3 : 1;
  for (let i = 0; i < qs.length; i++) {
    if (qs[i] && verOf(qs[i]) >= newV) versions[i] = newV;
    else if (qs[i]) versions[i] = ((versions[i]||1) % verOf(qs[i])) + 1;
  }
  setVersionButtons(newV);
  renderGrid(true);
}

function editQuestion(idx) {
  const topic = TOPICS()[currentTopic];
  const qs    = currentQs();
  const q     = qs[idx];
  const ver   = versions[idx] || 1;
  const qTextVal = qText(q, ver);
  const aTextVal = aText(q, ver);
  const editQ = qTextVal;

  const card = document.getElementById('card' + idx);
  card.classList.add('editing');
  card.innerHTML = `
    <div style="width:100%;display:flex;flex-direction:column;gap:6px">
      <div style="display:flex;align-items:center;gap:8px">
        <span class="qnum">${idx+1}</span>
        <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;opacity:.4">Edit Question</span>
      </div>
      <label style="font-size:9px;font-weight:700;opacity:.4;text-transform:uppercase;letter-spacing:1px">Question</label>
      <textarea class="qeditarea qeditq" id="editq${idx}">${editQ}</textarea>
      <label style="font-size:9px;font-weight:700;opacity:.4;text-transform:uppercase;letter-spacing:1px">Answer</label>
      <textarea class="qeditarea qedita" id="edita${idx}">${aTextVal}</textarea>
      <div class="qeditbtns">
        <button class="qeditbtn save" onclick="event.stopPropagation();saveEdit(${idx})">Save</button>
        <button class="qeditbtn cancel" onclick="event.stopPropagation();cancelEdit(${idx})">Cancel</button>
      </div>
    </div>`;
}

function saveEdit(idx) {
  const newQ = document.getElementById('editq'+idx).value;
  const newA = document.getElementById('edita'+idx).value;
  const q    = currentQs()[idx];
  const ver  = versions[idx] || 1;
  if (ver===3 && q.q3 !== undefined) { q.q3 = newQ; q.a3 = newA; }
  else if (ver===2 && q.q2 !== undefined) { q.q2 = newQ; q.a2 = newA; }
  else                               { q.q  = newQ; q.a  = newA; }
  renderGrid();
}
function cancelEdit(idx) { renderGrid(); }

// ── Fullscreen (F key / ⛶ button only) ──
function toggleFullscreen() {
  const fs = document.body.classList.toggle('fs');
  document.getElementById('btnfs').textContent = fs ? '✕' : '⛶';
  if (fs) {
    document.getElementById('panel').classList.remove('open');
    barVisible = false;
  }
}

// ── Bar toggle — works in and out of fullscreen ──
let barVisible = true;
function toggleTopBar() {
  if (document.body.classList.contains('vizmode')) { vizToggle(false); return; }
  barVisible = !barVisible;
  const inFS = document.body.classList.contains('fs');
  if (barVisible) {
    if (inFS) document.body.classList.remove('fs');
    document.getElementById('topwrap').classList.remove('hidden');
    document.getElementById('strandbar').classList.remove('hidden');
    document.getElementById('btnfs').textContent = '⛶';
  } else {
    document.getElementById('panel').classList.remove('open');
    document.body.classList.add('fs');
    document.getElementById('btnfs').textContent = '✕';
  }
}


// ── Keyboard shortcuts ──
document.addEventListener('keydown', function(e) {
  const tag = document.activeElement.tagName.toLowerCase();
  if (tag==='select'||tag==='input'||tag==='textarea') return;
  const key = e.key;
  if (key==='s'||key==='S') revealAll();
  else if (key==='h'||key==='H') hideAll();
  else if (key==='t'||key==='T') togglePanel();
  else if (key==='Enter') { if (document.getElementById('panel').classList.contains('open')) loadQuestions(); }
  else if (key==='ArrowRight') { if (!focusMode) changeTopic(1); }
  else if (key==='ArrowLeft')  { if (!focusMode) changeTopic(-1); }
  else if (key==='v'||key==='V') toggleAllVersions();
  else if (key==='='||key==='+') changeFont(1);
  else if (key==='-'||key==='_') changeFont(-1);
  else if ((key==='b'||key==='B') && !focusMode) toggleTopBar()
  else if (key==='f'||key==='F') toggleFullscreen();
  else if (key==='?') openKbd();
  else if (key>='1' && key<='8') { const i = parseInt(key,10)-1; if (STRAND_KEYS[i]) switchStrand(STRAND_KEYS[i]); }
  else if (key==='Escape') {
    if (document.getElementById('kbdoverlay').classList.contains('open')) closeKbd();
    else if (document.body.classList.contains('fs')) toggleFullscreen();
    else if (document.getElementById('panel').classList.contains('open')) document.getElementById('panel').classList.remove('open');
  }
});

function changeTopic(delta) {
  const topics = TOPICS();
  if (!topics.length) return;
  const sel  = document.getElementById('topsel');
  const next = Math.min(topics.length-1, Math.max(0, parseInt(sel.value)+delta));
  sel.value = next; currentTopic = next; loadQuestions();
}
function setStyle(s) { currentStyle = 'qs'; }

// ── Keyboard modal ──
function openKbd()  { document.getElementById('kbdoverlay').classList.add('open'); }
function closeKbd(e) {
  if (!e || e.target===document.getElementById('kbdoverlay') || e.currentTarget===document.getElementById('kbdclose'))
    document.getElementById('kbdoverlay').classList.remove('open');
}

// ── INIT ──
(function applyHash() {
  const h = (location.hash || '').replace(/^#/, '');
  if (h && UNIT_KEYS.indexOf(h) !== -1) currentStrand = h;
})();
buildStrandBar();
populateTopicSelect();
renderGrid();
window.addEventListener('load', () => {
  reRenderMath();
  if (location.hash === '#answers') revealAll();
});
