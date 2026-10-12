// Renders a contact sheet PNG of SVG icons and checks that each one parses.
// Usage: node tools/icon-sheet.js <out.png> [group|id ...]
//   groups/ids default to every icon; each icon is shown at 96px and 28px, with the emoji it replaces.
// Needs Playwright (preinstalled in the cloud container).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');

(async () => {
  const [out = 'icon-sheet.png', ...want] = process.argv.slice(2);
  const scripts = ['js/data/core.js', 'js/data/buildings.js', 'js/data/raw.js', 'js/data/processing.js', 'js/data/dishes.js', 'assets/kit.js', 'assets/ui-icons.js',
    ...fs.readdirSync(path.join(root, 'assets/icons')).filter((f) => f.endsWith('.js')).sort().map((f) => 'assets/icons/' + f)];
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;padding:10px;font:11px sans-serif;background:#fbf7ee;width:1180px}
    .c{display:inline-flex;flex-direction:column;align-items:center;width:112px;height:150px;margin:2px;vertical-align:top;background:#fff;border-radius:6px}
    .r{display:flex;align-items:center;gap:6px;font-size:22px}.n{text-align:center;padding:0 3px;overflow:hidden;max-height:28px}
    .bad{background:#fdd}</style><body><div id="o"></div>
    ${scripts.map((s) => `<script>${fs.readFileSync(path.join(root, s), 'utf8')}</script>`).join('')}`;
  const browser = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.setContent(html);
  const res = await page.evaluate((want) => {
    const all = Object.keys(FSI.icons);
    const ids = want.length ? want.flatMap((w) => FSI.groups[w] || (FSI.icons[w] ? [w] : [])) : all;
    const ui = Object.fromEntries((FSI.uiList || []).map(([i, e]) => [i, e]));
    const emoji = (id) => ui[id] || (id.startsWith('b_') ? (FS.buildings[id.slice(2)] || {}).icon : (FS.items[id] || {}).emoji) || '';
    const bad = [];
    const o = document.getElementById('o');
    for (const id of ids) {
      let s = '';
      try { s = FSI.svg(id, 96); } catch (e) { bad.push(id + ': ' + e.message); }
      const doc = new DOMParser().parseFromString(s || '<x', 'image/svg+xml');
      const ok = s && !doc.querySelector('parsererror');
      if (!ok && s) bad.push(id + ': SVG does not parse');
      if (/<(linearGradient|radialGradient|filter|image|text|style|script)\b|\bid=/.test(s)) bad.push(id + ': uses a forbidden element or id');
      o.insertAdjacentHTML('beforeend', `<div class="c${ok ? '' : ' bad'}">${ok ? s : ''}<div class="r">${emoji(id)}${ok ? FSI.svg(id, 28) : ''}</div><div class="n">${id}</div></div>`);
    }
    return { n: ids.length, bad, dups: FSI.dups };
  }, want);
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log(`${res.n} icons -> ${out}`);
  [...errs, ...res.bad].forEach((e) => console.log('ERROR', e));
  if (res.dups.length) console.log('Duplicate ids:', res.dups.join(', '));
  process.exit(errs.length || res.bad.length ? 1 : 0);
})();
