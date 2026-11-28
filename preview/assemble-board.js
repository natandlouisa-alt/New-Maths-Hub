const fs = require('fs');
const path = require('path');

function checkKatex(items) {
  let katex;
  try { katex = require('/tmp/katexpkg/node_modules/katex'); }
  catch (e) { return; }
  const fields = ['q', 'a', 'q2', 'a2', 'q3', 'a3'];
  const errors = [];
  for (const it of items) {
    for (const f of fields) {
      const s = (it[f] || '').replace(/<br>/g, ' ');
      let i = 0;
      while (i < s.length) {
        if (s[i] === '$') {
          const j = s.indexOf('$', i + 1);
          if (j < 0) { errors.push(it.topic + ' ' + f + ' unpaired $'); break; }
          const bit = s.slice(i + 1, j);
          try { katex.renderToString(bit, { throwOnError: true, strict: 'ignore' }); }
          catch (err) { errors.push(it.topic + ' ' + f + ': ' + err.message.split('\n')[0] + ' :: ' + bit); }
          i = j + 1;
        } else i++;
      }
    }
  }
  if (errors.length) {
    throw new Error('KaTeX errors:\n' + errors.join('\n'));
  }
}

function writeBoard({ year, cycle, items, tag, fileBase, title }) {
  checkKatex(items);
  const boardTitle = title || `Year ${year} Cycle ${cycle}`;
  const units = [];
  for (const it of items) {
    let u = units.find(x => x.name === it.unit);
    if (!u) { u = { name: it.unit, qs: [] }; units.push(u); }
    u.qs.push(it);
  }
  const UNIT_KEYS = ['all', ...units.map((_, i) => 'u' + i)];
  const UNIT_LABELS = ['Whole cycle', ...units.map(u => u.name.replace(/ — .*/, ''))];
  const DATA = { all: [{ u: boardTitle.replace(' Cycle ', ' · Cycle '), l: 'Whole cycle', qs: items }] };
  units.forEach((u, i) => { DATA['u' + i] = [{ u: u.name, l: u.name, qs: u.qs }]; });

  const dir = __dirname;
  const css = fs.readFileSync(path.join(dir, 'do-now-app.css'), 'utf8');
  const runtime = fs.readFileSync(path.join(dir, 'do-now-app.js'), 'utf8');
  let body = fs.readFileSync(path.join(dir, 'do-now-body.html'), 'utf8');
  body = body.replace('>Preview<', '>' + tag + '<');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${boardTitle} revision</title>
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
const BOARD_TITLE = ${JSON.stringify(boardTitle)};
const UNIT_KEYS = ${JSON.stringify(UNIT_KEYS)};
const UNIT_LABELS = ${JSON.stringify(UNIT_LABELS)};
const DATA = ${JSON.stringify(DATA, null, 2)};
${runtime}
</script>
<div id="pz"></div>
</body>
</html>
`;

  const name = `${fileBase || ('y' + year + '-cycle-' + cycle + '-revision')}.html`;
  const root = path.join(dir, '..', name);
  const preview = path.join(dir, name);
  fs.writeFileSync(root, html);
  fs.writeFileSync(preview, html);
  console.log('wrote', root);
  console.log('items', items.length, 'units', units.map(u => u.name + ' ' + u.qs.length).join(' | '));
}

module.exports = { writeBoard, checkKatex };
