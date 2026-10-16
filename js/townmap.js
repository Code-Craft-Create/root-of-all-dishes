// The Town screen's map: an isometric (45°) town drawn as SVG. Three districts of houses, landmarks and restaurant lots
// between streets, a harbour in front. Restaurant lots are clickable (data-action town-sel). Pan by dragging, zoom with
// the wheel (or two fingers on a touch screen). Guests walk the streets; a served guest shows a coin float over the restaurant.
(function () {
  'use strict';
  const TW = 64, TH = 32, N = 26, STEP = 5, BLOCK = 4, WATER = 20.6;
  const P = (i, j, z = 0) => [(i - j) * TW / 2, (i + j) * TH / 2 - z];
  const pt = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  const poly = (pts, attrs) => `<polygon points="${pts.map(pt).join(' ')}" ${attrs}/>`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const INK = 'stroke="#3b2b22" stroke-width="1" stroke-linejoin="round"';
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // Shade a #rrggbb colour: f < 1 darker, f > 1 lighter.
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(f < 1 ? v * f : v + (255 - v) * (f - 1)));
    return '#' + c.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
  }

  // ----- Geometry: boxes, roofs and windows in isometric space -----
  // A box on the ground: left face looks along +j (lit), right face along +i (shade), top at height ht.
  function box(i, j, w, h, ht, wall, top, z0 = 0) {
    const L = [P(i, j + h, z0), P(i + w, j + h, z0), P(i + w, j + h, z0 + ht), P(i, j + h, z0 + ht)];
    const R = [P(i + w, j, z0), P(i + w, j + h, z0), P(i + w, j + h, z0 + ht), P(i + w, j, z0 + ht)];
    const T = [P(i, j, z0 + ht), P(i + w, j, z0 + ht), P(i + w, j + h, z0 + ht), P(i, j + h, z0 + ht)];
    return poly(L, `fill="${wall}" ${INK}`) + poly(R, `fill="${shade(wall, 0.78)}" ${INK}`) + (top ? poly(T, `fill="${top}" ${INK}`) : '');
  }
  // A gabled roof on a box of height ht: the ridge runs along i (alongI) or along j.
  function gable(i, j, w, h, ht, rh, col, alongI) {
    if (alongI) {
      const back = [P(i, j, ht), P(i + w, j, ht), P(i + w, j + h / 2, ht + rh), P(i, j + h / 2, ht + rh)];
      const front = [P(i, j + h, ht), P(i + w, j + h, ht), P(i + w, j + h / 2, ht + rh), P(i, j + h / 2, ht + rh)];
      const end = [P(i + w, j, ht), P(i + w, j + h, ht), P(i + w, j + h / 2, ht + rh)];
      return poly(back, `fill="${shade(col, 0.7)}" ${INK}`) + poly(front, `fill="${col}" class="roof" ${INK}`) + poly(end, `fill="WALLR" ${INK}`);
    }
    const back = [P(i, j, ht), P(i, j + h, ht), P(i + w / 2, j + h, ht + rh), P(i + w / 2, j, ht + rh)];
    const front = [P(i + w, j, ht), P(i + w, j + h, ht), P(i + w / 2, j + h, ht + rh), P(i + w / 2, j, ht + rh)];
    const end = [P(i, j + h, ht), P(i + w, j + h, ht), P(i + w / 2, j + h, ht + rh)];
    return poly(back, `fill="${shade(col, 0.7)}" ${INK}`) + poly(front, `fill="${shade(col, 0.82)}" class="roof" ${INK}`) + poly(end, `fill="WALLL" ${INK}`);
  }
  // A pyramid roof (towers, spires, pavilions).
  function pyramid(i, j, w, h, ht, rh, col) {
    const a = P(i + w / 2, j + h / 2, ht + rh);
    return poly([P(i, j + h, ht), P(i + w, j + h, ht), a], `fill="${col}" class="roof" ${INK}`) + poly([P(i + w, j, ht), P(i + w, j + h, ht), a], `fill="${shade(col, 0.75)}" class="roof" ${INK}`);
  }
  // Lit windows and lamps are collected here while the scenery and the lots are built (night glow, glowSvg).
  let GL = null;
  // Windows: on the left face (side 'L', u runs along i) or right face ('R', u runs along j). u, v and sizes in tiles / px.
  const faceAt = (side, i, j, w, h) => (side === 'L' ? (a, z) => P(i + a, j + h, z) : (a, z) => P(i + w, j + a, z));
  function win(side, i, j, w, h, u, v, ww, wh, cls = 'win') {
    const f = faceAt(side, i, j, w, h);
    if (GL && (cls === 'win' || cls === 'glass')) { const [x, y] = f(u + ww / 2, v + wh / 2); GL.push([x, y, cls === 'glass' ? 2 : 1]); }
    return poly([f(u, v), f(u + ww, v), f(u + ww, v + wh), f(u, v + wh)], `class="${cls}" stroke="#3b2b22" stroke-width="0.8"`);
  }
  function door(side, i, j, w, h, u, ww, wh, col = '#6b4529') {
    const f = faceAt(side, i, j, w, h);
    return poly([f(u - 0.03, 0), f(u + ww + 0.03, 0), f(u + ww + 0.03, wh + 2), f(u - 0.03, wh + 2)], 'fill="#fbfaf6" opacity="0.7"') + win(side, i, j, w, h, u, 0, ww, wh, 'door" fill="' + col);
  }
  // A strip across a whole face between heights z0 and z1 (plinths, cornices, stripes).
  function strip(side, i, j, w, h, z0, z1, col) { const f = faceAt(side, i, j, w, h), n = side === 'L' ? w : h; return poly([f(0, z0), f(n, z0), f(n, z1), f(0, z1)], `fill="${col}"`); }
  // A window with a white sill and a glazing bar, and optionally shutters and a flower box (deco).
  function pane(side, i, j, w, h, u, v, ww, wh, deco, rnd) {
    const f = faceAt(side, i, j, w, h);
    let s = '';
    if (deco && deco.shutter) for (const a of [u - 0.075, u + ww + 0.01]) s += poly([f(a, v), f(a + 0.065, v), f(a + 0.065, v + wh), f(a, v + wh)], `fill="${deco.shutter}" stroke="#3b2b22" stroke-width="0.5"`);
    s += win(side, i, j, w, h, u, v, ww, wh);
    s += `<path d="M${pt(f(u + ww / 2, v))} L${pt(f(u + ww / 2, v + wh))} M${pt(f(u, v + wh * 0.55))} L${pt(f(u + ww, v + wh * 0.55))}" class="mull"/>`;
    s += `<path d="M${pt(f(u - 0.03, v - 0.6))} L${pt(f(u + ww + 0.03, v - 0.6))}" class="sill"/>`;
    if (deco && deco.flowers && rnd() < 0.4) {
      s += poly([f(u - 0.02, v - 3), f(u + ww + 0.02, v - 3), f(u + ww + 0.02, v - 0.5), f(u - 0.02, v - 0.5)], 'fill="#7a4b33"');
      for (const a of [0.03, 0.1, 0.17]) { const [x, y] = f(u + a, v - 2.6); s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.5" class="bloom"/>`; }
    }
    return s;
  }
  // A row of windows along both visible faces, floor by floor.
  function windows(i, j, w, h, ht, floor = 14, rnd = Math.random, deco = null) {
    let s = '';
    for (let v = 6; v + 8 < ht - 2; v += floor) {
      for (let u = 0.18; u + 0.2 <= w - 0.1; u += 0.42) if (rnd() > 0.12) s += pane('L', i, j, w, h, u, v, 0.2, 8, deco, rnd);
      for (let u = 0.18; u + 0.2 <= h - 0.1; u += 0.42) if (rnd() > 0.12) s += pane('R', i, j, w, h, u, v, 0.2, 8, deco, rnd);
    }
    return s;
  }
  // Faint tile courses on the front slope of a gabled roof.
  function roofLines(i, j, w, h, ht, rh, alongI) {
    let d = '';
    for (const t of [0.22, 0.44, 0.66, 0.88]) {
      if (alongI) d += `M${pt(P(i, j + h - t * h / 2, ht + t * rh))} L${pt(P(i + w, j + h - t * h / 2, ht + t * rh))} `;
      else d += `M${pt(P(i + w - t * w / 2, j, ht + t * rh))} L${pt(P(i + w - t * w / 2, j + h, ht + t * rh))} `;
    }
    return `<path d="${d}" class="rline"/>`;
  }
  // A brick chimney standing on the front slope; some smoke in winter.
  function chimney(i, j, w, h, ht, rh, alongI, rnd) {
    const cw = 0.13;
    let ci, cj, zb;
    if (alongI) { ci = i + w * (0.15 + rnd() * 0.55); cj = j + h * 0.6; zb = ht + rh * (1 - (cj + cw - (j + h / 2)) / (h / 2)); }
    else { cj = j + h * (0.15 + rnd() * 0.55); ci = i + w * 0.6; zb = ht + rh * (1 - (ci + cw - (i + w / 2)) / (w / 2)); }
    const zt = ht + rh + 5, [x, y] = P(ci + cw / 2, cj + cw / 2, zt);
    return box(ci, cj, cw, cw, zt - zb, '#9a5a44', '#3b2b22', zb) + (rnd() < 0.4 ? `<circle cx="${x.toFixed(1)}" cy="${(y - 5).toFixed(1)}" r="3" class="csmoke"/><circle cx="${(x + 3).toFixed(1)}" cy="${(y - 11).toFixed(1)}" r="4" class="csmoke c2"/>` : '');
  }
  // Soft ground shadows, collected while the scenery is built and drawn under everything. Light comes from the left,
  // so a shadow falls to the right (towards +i and -j).
  let SH = '';
  function shadow(i, j, w, h, ht) {
    const d = Math.min(1.3, ht / 42), di = d * 0.55, dj = d * 0.45;
    SH += poly([P(i, j), P(i + di, j - dj), P(i + w + di, j - dj), P(i + w + di, j + h - dj), P(i + w, j + h), P(i, j + h)], '');
  }
  function house(i, j, w, h, ht, wall, roof, alongI, rnd, rh = 16, deco = null) {
    shadow(i, j, w, h, ht + rh * 0.5);
    const g = gable(i, j, w, h, ht, rh, roof, alongI).replace('WALLR', shade(wall, 0.78)).replace('WALLL', wall);
    return box(i, j, w, h, ht, wall, null) + strip('L', i, j, w, h, 0, 3, shade(wall, 0.82)) + strip('R', i, j, w, h, 0, 3, shade(wall, 0.64)) +
      windows(i, j, w, h, ht, 14, rnd, deco) + door(rnd() < 0.5 ? 'L' : 'R', i, j, w, h, w * 0.4, 0.2, 11) +
      g + roofLines(i, j, w, h, ht, rh, alongI) + (rnd() < 0.7 ? chimney(i, j, w, h, ht, rh, alongI, rnd) : '');
  }
  // Round things are drawn in screen space at the foot point of a tile position.
  // kind 0 leafy, 1 conifer, 2 bushy (two crowns), 3 fruit tree.
  function tree(i, j, s = 1, kind = 0) {
    const [x, y] = P(i, j), sh = `<ellipse cx="${(x + 6 * s).toFixed(1)}" cy="${(y + 1).toFixed(1)}" rx="${(10 * s).toFixed(1)}" ry="${(4 * s).toFixed(1)}" class="tsh"/>`;
    if (kind === 1) return `<g class="tree">${sh}<rect x="${x - 1.5}" y="${y - 8 * s}" width="3" height="${8 * s}" fill="#6b4529"/>` +
      `<path d="M${x} ${y - 34 * s} L${x + 10 * s} ${y - 7 * s} L${x - 10 * s} ${y - 7 * s} Z" class="lf2" ${INK}/>` +
      `<path d="M${x} ${y - 34 * s} L${x - 10 * s} ${y - 7 * s} L${x - 2 * s} ${y - 7 * s} Z" class="lf2-hi"/>` +
      `<path d="M${x - 6 * s} ${y - 17 * s} L${x + 6 * s} ${y - 20 * s} M${x - 8 * s} ${y - 11 * s} L${x + 8 * s} ${y - 14 * s}" class="lf2-ln"/></g>`;
    if (kind === 2) return `<g class="tree">${sh}<rect x="${x - 1.5}" y="${y - 10 * s}" width="3" height="${10 * s}" fill="#6b4529"/>` +
      `<circle cx="${x + 5 * s}" cy="${y - 15 * s}" r="${7.5 * s}" class="lf" ${INK}/><circle cx="${x - 3 * s}" cy="${y - 20 * s}" r="${9 * s}" class="lf" ${INK}/>` +
      `<circle cx="${x - 5 * s}" cy="${y - 23 * s}" r="${4 * s}" class="lf-hi"/><circle cx="${x + 4 * s}" cy="${y - 17 * s}" r="${2.6 * s}" class="lf-hi"/></g>`;
    const fruit = kind === 3 ? [[-4, -18], [3, -21], [5, -14], [-1, -13], [-6, -23]].map(([a, b]) => `<circle cx="${(x + a * s).toFixed(1)}" cy="${(y + b * s).toFixed(1)}" r="${(1.6 * s).toFixed(1)}" class="fruit"/>`).join('') : '';
    return `<g class="tree">${sh}<rect x="${x - 1.5}" y="${y - 10 * s}" width="3" height="${10 * s}" fill="#6b4529"/>` +
      `<circle cx="${x}" cy="${y - 18 * s}" r="${10 * s}" class="lf" ${INK}/><circle cx="${x - 3 * s}" cy="${y - 21 * s}" r="${4.5 * s}" class="lf-hi"/>${fruit}</g>`;
  }
  function lamp(i, j) { const [x, y] = P(i, j); if (GL) GL.push([x, y - 23, 3]); return `<g><rect x="${x - 0.8}" y="${y - 22}" width="1.6" height="22" fill="#3b3b3b"/><circle cx="${x}" cy="${y - 23}" r="2.6" class="lampl"/></g>`; }
  // An isometric circle (a tile-space disc) as an ellipse.
  const disc = (i, j, r, attrs) => { const [x, y] = P(i, j); return `<ellipse cx="${x}" cy="${y}" rx="${r * TW * 0.7071}" ry="${r * TH * 0.7071}" ${attrs}/>`; };
  const ground = (i, j, w, h, attrs) => poly([P(i, j), P(i + w, j), P(i + w, j + h), P(i, j + h)], attrs);

  // ----- The town plan: 5 x 5 blocks of 4 x 4 tiles between one-tile streets; the front row of blocks is harbour water -----
  // kind: houses (style old/mansion/town/harbour), or a landmark. lot: a restaurant lot (2 x 2) at a tile offset in the block.
  const BLOCKS = {
    '0,0': { d: 'old_town', kind: 'houses', style: 'old' },
    '1,0': { d: 'old_town', kind: 'cathedral' },
    '2,0': { d: 'old_town', kind: 'houses', style: 'old', lot: ['ot1', 2, 2] },
    '3,0': { d: 'old_town', kind: 'houses', style: 'mansion', lot: ['rv1', 0, 2] },
    '4,0': { d: 'market', kind: 'park' },
    '0,1': { d: 'old_town', kind: 'houses', style: 'old' },
    '1,1': { d: 'old_town', kind: 'houses', style: 'old' },
    '2,1': { d: 'old_town', kind: 'townhall' },
    '3,1': { d: 'market', kind: 'houses', style: 'town' },
    '4,1': { d: 'market', kind: 'station' },
    '0,2': { d: 'harbour', kind: 'fishmarket' },
    '1,2': { d: 'harbour', kind: 'houses', style: 'harbour' },
    '2,2': { d: 'market', kind: 'markethall' },
    '3,2': { d: 'market', kind: 'houses', style: 'town', lot: ['mk1', 0, 2] },
    '4,2': { d: 'market', kind: 'houses', style: 'town' },
    '0,3': { d: 'harbour', kind: 'warehouses', lot: ['hb1', 0, 2] },
    '1,3': { d: 'harbour', kind: 'houses', style: 'harbour', lot: ['rv2', 2, 2] },
    '2,3': { d: 'harbour', kind: 'houses', style: 'harbour' },
    '3,3': { d: 'market', kind: 'university' },
    '4,3': { d: 'market', kind: 'houses', style: 'town', lot: ['rv3', 2, 2] },
  };
  const GROUND = { old_town: '#d8c6a5', harbour: '#bcc4c2', market: '#e3d2a3' };
  const STYLE = {
    old: { walls: ['#f1e4c8', '#e9d3b0', '#f4efe4', '#e6c9a8', '#efd9c0'], roofs: ['#8e3b2e', '#5c5f6b', '#7a4b33', '#9a4a34'], ht: [36, 50], deco: { shutter: '#4f7a5a', flowers: true } },
    mansion: { walls: ['#f4efe4', '#ece2cc', '#e2d6bd'], roofs: ['#4d5361', '#5c5f6b'], ht: [44, 54], deco: { shutter: '#3b4a5c', flowers: true } },
    town: { walls: ['#e8b4a0', '#a8c8e0', '#f2d58c', '#b8d6a6', '#e6a3b5', '#f4efe4'], roofs: ['#b5452f', '#9a4a34', '#c96a3b'], ht: [26, 40], deco: { flowers: true } },
    harbour: { walls: ['#f7f4ec', '#8fb3cf', '#c8a27a', '#e5e0d0', '#9cc2b8'], roofs: ['#2f4a6b', '#5c5f6b', '#a3302a'], ht: [22, 32], deco: { shutter: '#2f6fa3' } },
  };
  const origin = (bx, by) => [1 + STEP * bx, 1 + STEP * by];
  const LOT_AT = {};
  for (const [k, b] of Object.entries(BLOCKS)) if (b.lot) { const [bx, by] = k.split(',').map(Number), [i0, j0] = origin(bx, by); LOT_AT[b.lot[0]] = [i0 + b.lot[1], j0 + b.lot[2]]; }

  // ----- The countryside around the town: roads and lanes, fields, farms, a windmill, orchards, woods, pastures -----
  const EDGE = 12; // the land reaches EDGE tiles beyond the town on every side
  // Tile-space patterns (field rows, paving): the pattern transform maps pattern x, y to tile i, j.
  const ISO = 'patternUnits="userSpaceOnUse" patternTransform="matrix(32,16,-32,16,0,0)"';
  const DEFS = `<defs>
    <pattern id="tm-rowsI" ${ISO} width="1" height="0.3"><rect width="1" height="0.1" class="frow"/></pattern>
    <pattern id="tm-rowsJ" ${ISO} width="0.3" height="1"><rect width="0.1" height="1" class="frow"/></pattern>
    <pattern id="tm-sun" ${ISO} width="0.3" height="0.3"><circle cx="0.15" cy="0.15" r="0.08" class="sundot"/></pattern>
    <pattern id="tm-vine" ${ISO} width="0.2" height="0.45"><rect y="0.17" width="0.2" height="0.04" fill="#6b4529" opacity="0.5"/><circle cx="0.1" cy="0.16" r="0.075" class="vined"/></pattern>
    <pattern id="tm-cobble" ${ISO} width="0.25" height="0.25"><path d="M0 0 H0.25 M0 0 V0.25" stroke="#5a4630" stroke-opacity="0.13" stroke-width="0.02" fill="none"/></pattern>
    <pattern id="tm-paving" ${ISO} width="0.5" height="0.5"><path d="M0 0 H0.5 M0 0 V0.5" stroke="#5a4630" stroke-opacity="0.1" stroke-width="0.02" fill="none"/></pattern>
  </defs>`;
  const line = (pts, attrs) => `<path d="M${pts.map(pt).join(' L')}" ${attrs}/>`;
  function field(i, j, w, h, kind, alongJ) {
    const pat = kind === 'sun' ? 'tm-sun' : kind === 'vine' ? 'tm-vine' : alongJ ? 'tm-rowsJ' : 'tm-rowsI';
    return ground(i, j, w, h, `class="fld f-${kind}"`) + ground(i, j, w, h, `fill="url(#${pat})"`);
  }
  // A hedge along some edges of a rectangle (sides: n e s w = -j, +i, +j, -i).
  function hedge(i, j, w, h, sides) {
    const E = { n: [[i, j], [i + w, j]], e: [[i + w, j], [i + w, j + h]], s: [[i, j + h], [i + w, j + h]], w: [[i, j], [i, j + h]] };
    let d = '';
    for (const c of sides) { const [a, b] = E[c]; d += `M${pt(P(...a))} L${pt(P(...b))} `; }
    return `<path d="${d}" class="hedge"/><path d="${d}" class="hedge-hi" transform="translate(0,-2.5)"/>`;
  }
  // A wooden fence along one edge, as a depth-sorted object.
  function fence(a, b) {
    const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.45));
    let s = line([P(a[0], a[1], 5), P(b[0], b[1], 5)], 'class="fence"') + line([P(a[0], a[1], 9), P(b[0], b[1], 9)], 'class="fence"');
    for (let k = 0; k <= n; k++) { const t = k / n, ii = a[0] + (b[0] - a[0]) * t, jj = a[1] + (b[1] - a[1]) * t; s += line([P(ii, jj, 0), P(ii, jj, 11)], 'class="fence post"'); }
    return s;
  }
  function sheep(i, j, f) {
    const [x, y] = P(i, j);
    return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${f},1)"><ellipse cx="1" cy="0.5" rx="6" ry="2" class="tsh"/><path d="M-3 -1 v3 M2 -1 v3" stroke="#3b3b3b" stroke-width="1.2"/>` +
      `<ellipse cx="0" cy="-4" rx="5.5" ry="3.8" fill="#f6f3ea" stroke="#8a8478" stroke-width="0.6"/><circle cx="-2" cy="-6" r="2.2" fill="#fbfaf6"/><ellipse cx="5" cy="-5" rx="2" ry="1.7" fill="#3b3b3b"/></g>`;
  }
  function cow(i, j, f) {
    const [x, y] = P(i, j);
    return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${f},1)"><ellipse cx="1" cy="0.5" rx="9" ry="2.4" class="tsh"/><path d="M-5 -2 v4 M-2 -2 v4 M3 -2 v4 M6 -2 v4" stroke="#3b3b3b" stroke-width="1.3"/>` +
      `<rect x="-7" y="-9" width="15" height="8" rx="3.5" fill="#fbfaf6" stroke="#3b3b3b" stroke-width="0.7"/><circle cx="-3" cy="-6" r="2.4" fill="#3b3b3b"/><circle cx="3.5" cy="-4" r="1.8" fill="#3b3b3b"/>` +
      `<rect x="7" y="-10" width="5" height="5" rx="2" fill="#3b3b3b"/><circle cx="11" cy="-6" r="1.4" fill="#e9a3a8"/></g>`;
  }
  function haybale(i, j) {
    const [x, y] = P(i, j);
    return `<g><ellipse cx="${x + 2}" cy="${y + 1}" rx="7" ry="2.4" class="tsh"/><rect x="${x - 5}" y="${y - 8}" width="10" height="8" rx="1" class="hay" stroke="#a8863a" stroke-width="0.7"/>` +
      `<ellipse cx="${x - 5}" cy="${y - 4}" rx="2.6" ry="4" class="hay-end" stroke="#a8863a" stroke-width="0.7"/></g>`;
  }
  function silo(i, j) {
    const [x, y] = P(i, j);
    return `<g><ellipse cx="${x + 8}" cy="${y + 1}" rx="16" ry="5" class="tsh"/><rect x="${x - 8}" y="${y - 46}" width="16" height="46" fill="#d5dade" ${INK}/><rect x="${x}" y="${y - 46}" width="8" height="46" fill="#aeb5bb"/>` +
      `<path d="M${x - 8} ${y - 46} Q${x} ${y - 60} ${x + 8} ${y - 46} Z" fill="#8e3b2e" ${INK}/>` + [14, 26, 38].map((v) => `<path d="M${x - 8} ${y - v} H${x + 8}" stroke="#8a939b" stroke-width="0.8"/>`).join('') + `</g>`;
  }
  function tractor(i, j) {
    const [x, y] = P(i, j);
    return `<g><ellipse cx="${x + 2}" cy="${y + 1}" rx="11" ry="3" class="tsh"/><rect x="${x - 7}" y="${y - 13}" width="14" height="7" rx="1.5" fill="#2f7d4f" ${INK}/>` +
      `<rect x="${x - 6}" y="${y - 21}" width="7" height="8" fill="none" stroke="#3b3b3b" stroke-width="1.2"/><circle cx="${x - 4}" cy="${y - 5}" r="5" fill="#3b3b3b"/><circle cx="${x - 4}" cy="${y - 5}" r="2" fill="#e3a92b"/>` +
      `<circle cx="${x + 6}" cy="${y - 3}" r="3" fill="#3b3b3b"/><rect x="${x + 4}" y="${y - 17}" width="1.6" height="5" fill="#3b3b3b"/></g>`;
  }
  // A windmill with turning sails (the sails spin with CSS around their own centre).
  function windmill(i, j) {
    const [x, y] = P(i, j), hy = y - 58, hx = x + 1;
    const blades = [0, 90, 180, 270].map((a) => {
      const r = (a * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r), q = (u, v) => `${(hx + c * u - s * v).toFixed(1)},${(hy + s * u + c * v).toFixed(1)}`;
      return `<polygon points="${q(5, 0)} ${q(34, 0)} ${q(34, 8)} ${q(7, 8)}" class="sail-cloth" stroke="#6b4529" stroke-width="0.8"/>` +
        `<path d="M${q(0, 0)} L${q(36, 0)} M${q(14, 0)} L${q(14, 8)} M${q(24, 0)} L${q(24, 8)}" stroke="#6b4529" stroke-width="1.1"/>`;
    }).join('');
    return `<g><ellipse cx="${x + 10}" cy="${y + 2}" rx="26" ry="8" class="tsh"/><ellipse cx="${x}" cy="${y}" rx="15" ry="7" fill="#b8a585"/>` +
      `<path d="M${x - 12} ${y} L${x - 7} ${y - 54} L${x + 7} ${y - 54} L${x + 12} ${y} Z" fill="#f1e4c8" ${INK}/><path d="M${x + 1} ${y} L${x + 1} ${y - 54} L${x + 7} ${y - 54} L${x + 12} ${y} Z" fill="#d8c6a5"/>` +
      `<path d="M${x - 9.5} ${y - 24} L${x + 9.5} ${y - 24}" stroke="#7a4b33" stroke-width="2"/><rect x="${x - 4}" y="${y - 12}" width="7" height="12" rx="3" fill="#6b4529"/><rect x="${x - 3}" y="${y - 40}" width="5" height="6" class="win" ${INK}/>` +
      `<path d="M${x - 9} ${y - 53} Q${x} ${y - 72} ${x + 9} ${y - 53} Z" fill="#7a4b33" ${INK}/><g class="sails">${blades}</g><circle cx="${hx}" cy="${hy}" r="3" fill="#3b2b22"/></g>`;
  }
  function greenhouse(i, j, w, h) {
    shadow(i, j, w, h, 16);
    return `<g opacity="0.9">${box(i, j, w, h, 12, '#d6ecef', null)}${gable(i, j, w, h, 12, 9, '#c4e2e8', true).replace('WALLR', '#b8d6dc')}</g>` +
      [0.25, 0.5, 0.75].map((t) => line([P(i + w * t, j + h, 0), P(i + w * t, j + h, 12), P(i + w * t, j + h / 2, 21)], 'stroke="#8aa9ae" stroke-width="0.8" fill="none"')).join('');
  }
  function farm(i, j, w, h, rnd, add, cropKind) {
    let g = ground(i + 0.15, j + 0.15, w - 0.3, 2.1, 'class="yard"');
    add(i + 0.4, j + 0.4, 1.2, 1, house(i + 0.4, j + 0.4, 1.2, 1, 26, '#f4efe4', '#8e3b2e', true, rnd, 16, { shutter: '#4f7a5a', flowers: true }));
    // A red barn with a big door.
    shadow(i + 2.0, j + 0.3, 1.7, 1.3, 36);
    add(i + 2.0, j + 0.3, 1.7, 1.3, box(i + 2, j + 0.3, 1.7, 1.3, 22, '#a3302a', null) + strip('L', i + 2, j + 0.3, 1.7, 1.3, 0, 3, '#7a2420') +
      door('L', i + 2, j + 0.3, 1.7, 1.3, 0.6, 0.5, 16, '#f4efe4') + line([P(i + 2.6, j + 1.6, 0), P(i + 3.1, j + 1.6, 16)], 'stroke="#a3302a" stroke-width="1.2"') + line([P(i + 3.1, j + 1.6, 0), P(i + 2.6, j + 1.6, 16)], 'stroke="#a3302a" stroke-width="1.2"') +
      gable(i + 2, j + 0.3, 1.7, 1.3, 22, 16, '#4d4a48', true).replace('WALLR', shade('#a3302a', 0.78)) + roofLines(i + 2, j + 0.3, 1.7, 1.3, 22, 16, true));
    add(i + w - 0.8, j + 0.8, 0, 0, silo(i + w - 0.8, j + 0.8));
    add(i + w - 1.1, j + 1.9, 0, 0, haybale(i + w - 1.1, j + 1.9));
    add(i + w - 0.6, j + 1.75, 0, 0, haybale(i + w - 0.6, j + 1.75));
    add(i + 1.8, j + 2.0, 0, 0, tractor(i + 1.8, j + 2.0));
    add(i + 0.3, j + 2.0, 0, 0, tree(i + 0.3, j + 2.0, 1.1, 2));
    g += field(i + 0.15, j + 2.45, w - 0.3, h - 2.6, cropKind, rnd() < 0.5);
    return g;
  }
  // addF puts an object on the front layer: anything animated must live there, so the back layer never repaints.
  function country(add, addF) {
    const rnd = rng(4242), A = -EDGE, Z = N + EDGE;
    let g = '';
    // Country roads continue three of the town's streets; dirt lanes make a grid of fields.
    const road = (a, b) => line([P(...a), P(...b)], 'class="croad"') + line([P(...a), P(...b)], 'class="dash"');
    const lane = (a, b) => line([P(...a), P(...b)], 'class="lane"');
    g += lane([A, -6.5], [Z, -6.5]) + lane([-6.5, A], [-6.5, WATER - 1.1]) + lane([32, A], [32, WATER - 1.1]);
    g += road([15.5, -0.4], [15.5, A]) + road([-0.4, 5.5], [A, 5.5]) + road([N - 0.6, 15.5], [Z, 15.5]);
    // Cells: [i0, i1, j0, j1, kind].
    const NI = [[-6.1, -1.4], [-1, 4.6], [5, 10], [10.4, 15], [16, 20.6], [21, 26], [26.4, 31.6], [32.4, 37.8]];
    const rowA = ['orchard', 'wheat', 'farm', 'veg', 'mill', 'sun', 'cows', 'soil'], rowB = ['forest', 'lav', 'soil', 'vine', 'wheat', 'orchard', 'farm', 'wheat'];
    const cells = [];
    NI.forEach(([a, b], k) => { cells.push([a, b, -5.9, -1.4, rowA[k]], [a, b, -11.8, -7.1, rowB[k]]); });
    cells.push([-11.8, -6.9, -11.8, -7.1, 'forest'], [-11.8, -6.9, -5.9, -1.4, 'forest']);
    [[-1, 4.8, 'veg', 'forest'], [6.2, 12.5, 'glass', 'sheep'], [13, 19.2, 'pond', 'farm']].forEach(([a, b, inner, outer]) => cells.push([-6.1, -1.4, a, b, inner], [-11.8, -6.9, a, b, outer]));
    [[-1, 4.5, 'wheat', 'sheep'], [5, 8.7, 'veg', 'soil'], [10.4, 15, 'wheat', 'orchard'], [16, 19.2, 'farm', 'forest']].forEach(([a, b, inner, outer]) => cells.push([26.4, 31.6, a, b, inner], [32.4, 37.8, a, b, outer]));
    for (const [i0, i1, j0, j1, kind] of cells) {
      const w = i1 - i0, h = j1 - j0;
      switch (kind) {
        case 'wheat': case 'veg': case 'soil': case 'sun': case 'lav': case 'vine':
          g += field(i0, j0, w, h, kind, rnd() < 0.5) + hedge(i0, j0, w, h, rnd() < 0.5 ? 'ne' : 'sw'); break;
        case 'farm': g += farm(i0, j0, w, h, rnd, add, rnd() < 0.5 ? 'wheat' : 'veg'); break;
        case 'mill':
          g += field(i0, j0, w, h - 1.6, 'wheat', false) + ground(i0, j1 - 1.5, w, 1.5, 'class="gr2"');
          addF(i0 + 1.2, j1 - 0.8, 0, 0, windmill(i0 + 1.2, j1 - 0.8));
          for (const [a, c] of [[2.6, 0.5], [3.1, 1.0], [3.6, 0.5]]) addF(i0 + a, j1 - 1.5 + c, 0, 0, haybale(i0 + a, j1 - 1.5 + c));
          break;
        case 'orchard':
          g += ground(i0, j0, w, h, 'class="gr2"') + hedge(i0, j0, w, h, 'nesw');
          for (let a = i0 + 0.45; a < i1 - 0.2; a += 0.85) for (let c = j0 + 0.45; c < j1 - 0.2; c += 0.85) add(a, c, 0, 0, tree(a, c, 0.6 + rnd() * 0.1, 3));
          break;
        case 'forest':
          g += ground(i0 - 0.2, j0 - 0.2, w + 0.4, h + 0.4, 'class="gr3"');
          for (let k = 0; k < w * h * 1.4; k++) { const a = i0 + rnd() * w, c = j0 + rnd() * h, t = rnd(); add(a, c, 0, 0, tree(a, c, 0.9 + rnd() * 0.5, t < 0.5 ? 1 : t < 0.8 ? 0 : 2)); }
          break;
        case 'cows': case 'sheep': {
          g += ground(i0, j0, w, h, 'class="gr2"');
          add(i0, j0, w, 0, fence([i0, j0], [i1, j0])); add(i0, j0, 0, h, fence([i0, j0], [i0, j1]));
          add(i0, j1, w, 0, fence([i0, j1], [i1, j1])); add(i1, j0, 0, h, fence([i1, j0], [i1, j1]));
          for (let k = 0; k < (kind === 'cows' ? 7 : 11); k++) { const a = i0 + 0.5 + rnd() * (w - 1), c = j0 + 0.5 + rnd() * (h - 1); add(a, c, 0, 0, (kind === 'cows' ? cow : sheep)(a, c, rnd() < 0.5 ? 1 : -1)); }
          add(i1 - 0.8, j0 + 0.8, 0, 0, tree(i1 - 0.8, j0 + 0.8, 1.2, 0));
          break;
        }
        case 'glass':
          g += ground(i0, j0, w, h, 'class="yard"');
          for (let k = 0; k < 3; k++) add(i0 + 0.4, j0 + 0.4 + k * 2, w - 0.8, 1.4, greenhouse(i0 + 0.4, j0 + 0.4 + k * 2, w - 0.8, 1.2));
          break;
        case 'pond': {
          g += ground(i0, j0, w, h, 'class="gr2"') + disc(i0 + w / 2, j0 + h / 2, 1.6, 'class="water" stroke="#7c9a5a" stroke-width="3"');
          for (let k = 0; k < 9; k++) { const t = rnd() * Math.PI * 2, [x, y] = P(i0 + w / 2 + Math.cos(t) * 1.55, j0 + h / 2 + Math.sin(t) * 1.55); g += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l-2 -9 M${x.toFixed(1)} ${y.toFixed(1)} l1 -11 M${x.toFixed(1)} ${y.toFixed(1)} l3 -8" class="reed"/>`; }
          for (const [a, c] of [[0.6, 0.7], [w - 0.6, 0.6], [0.5, h - 0.6], [w - 0.5, h - 0.7], [w / 2, 0.4]]) add(i0 + a, j0 + c, 0, 0, tree(i0 + a, j0 + c, 1.1, Math.floor(rnd() * 3)));
          { const [x, y] = P(i0 + w / 2 + 0.3, j0 + h / 2); g += `<g class="ducks"><ellipse cx="${x}" cy="${y}" rx="3.5" ry="2" fill="#fbfaf6"/><circle cx="${x + 3}" cy="${y - 2}" r="1.6" fill="#2f7d4f"/><ellipse cx="${x - 12}" cy="${y + 5}" rx="3.5" ry="2" fill="#a88a6a"/><circle cx="${x - 9}" cy="${y + 3}" r="1.5" fill="#6b4529"/></g>`; }
          break;
        }
      }
    }
    // Avenue trees along the country roads.
    for (let c = -1.6; c > A + 0.5; c -= 1.5) { add(14.95, c, 0, 0, tree(14.95, c, 0.85, 2)); add(16.05, c - 0.7, 0, 0, tree(16.05, c - 0.7, 0.85, 2)); }
    for (let a = -1.6; a > A + 0.5; a -= 1.5) { add(a, 4.95, 0, 0, tree(a, 4.95, 0.85, 0)); add(a - 0.7, 6.05, 0, 0, tree(a - 0.7, 6.05, 0.85, 0)); }
    for (let a = N + 0.8; a < Z - 0.5; a += 1.5) add(a, 14.95, 0, 0, tree(a, 14.95, 0.85, 0));
    // Beaches either side of the harbour, with parasols and rocks.
    g += poly([P(A, WATER - 1.1), P(-0.4, WATER - 1.1), P(-0.4, WATER), P(A, WATER)], 'class="sand"') + poly([P(N - 0.6, WATER - 1.1), P(Z, WATER - 1.1), P(Z, WATER), P(N - 0.6, WATER)], 'class="sand"');
    const cols = ['#c0463a', '#e3a92b', '#2f6fa3', '#2f7d4f'];
    for (const [a, k] of [[-3, 0], [-4.4, 1], [-9, 2], [28, 3], [30.5, 0], [34, 1]]) {
      const c = WATER - 0.45, [x, y] = P(a, c);
      add(a, c, 0, 0, `<g>${poly([P(a + 0.15, c - 0.1), P(a + 0.55, c - 0.1), P(a + 0.55, c + 0.12), P(a + 0.15, c + 0.12)], `fill="${cols[(k + 1) % 4]}"`)}<path d="M${x} ${y} V${y - 20}" stroke="#6b4529" stroke-width="1.2"/>` +
        `<path d="M${x - 12} ${y - 16} Q${x} ${y - 28} ${x + 12} ${y - 16} Z" fill="${cols[k]}" ${INK}/><path d="M${x - 4} ${y - 17} Q${x} ${y - 28} ${x + 4} ${y - 17}" fill="#fbfaf6" opacity="0.8"/></g>`);
    }
    return g;
  }

  // ----- The wider land, out to OUT tiles: a patchwork of fields, woods and hamlets, a river, and mountains at the back -----
  const OUT = 46, TUN = N + OUT + 8; // the railway runs on to TUN, well past the edge of the view
  const RIVER = [[-OUT, -8], [-38, -4], [-32, 1], [-28, 6], [-26.5, 11], [-23, 15.5], [-19, 18.5], [-17, WATER + 1]];
  function segDist(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  }
  const riverDist = (p) => Math.min(...RIVER.slice(1).map((b, k) => segDist(p, RIVER[k], b)));
  function mountain(i, j, w, ht, rnd) {
    const [x, y] = P(i, j), px = x + (rnd() - 0.5) * w * 0.3, py = y - ht, mx = px + w * 0.06;
    const sn = 0.3 + rnd() * 0.12, snow = (t) => [px + (x - w / 2 - px) * t, py + (y - py) * t], snowR = (t) => [px + (x + w / 2 - px) * t, py + (y - py) * t];
    const [lx, ly] = snow(sn), [rx, ry] = snowR(sn * 0.85), jag = `${(lx + (px - lx) * 0.35).toFixed(1)},${(ly + 6).toFixed(1)} ${(px - 4).toFixed(1)},${(ly - 2).toFixed(1)} ${(mx).toFixed(1)},${(ry + 7).toFixed(1)} ${(mx + (rx - mx) * 0.5).toFixed(1)},${(ry - 1).toFixed(1)}`;
    return `<g class="mtn"><polygon points="${(x - w / 2).toFixed(1)},${y.toFixed(1)} ${px.toFixed(1)},${py.toFixed(1)} ${mx.toFixed(1)},${y.toFixed(1)}" class="mtn-l" ${INK}/>` +
      `<polygon points="${px.toFixed(1)},${py.toFixed(1)} ${(x + w / 2).toFixed(1)},${y.toFixed(1)} ${mx.toFixed(1)},${y.toFixed(1)}" class="mtn-r" ${INK}/>` +
      `<polygon points="${px.toFixed(1)},${py.toFixed(1)} ${lx.toFixed(1)},${ly.toFixed(1)} ${jag} ${rx.toFixed(1)},${ry.toFixed(1)}" class="snowcap" ${INK}/>` +
      `<path d="M${(x - w * 0.42).toFixed(1)} ${y.toFixed(1)} Q${(x - w * 0.2).toFixed(1)} ${(y - ht * 0.32).toFixed(1)} ${x.toFixed(1)} ${(y - ht * 0.12).toFixed(1)} T${(x + w * 0.45).toFixed(1)} ${y.toFixed(1)} Z" class="foothill"/></g>`;
  }
  function hamlet(i, j, rnd, add) {
    let g = ground(i, j, 5, 5, 'class="yard"') + ground(i, j + 2.2, 5, 0.6, 'fill="#b8ad98"');
    const W = ['#f4efe4', '#f1e4c8', '#e8b4a0', '#e6c9a8'], R = ['#8e3b2e', '#7a4b33', '#5c5f6b'];
    for (const [a, c] of [[0.3, 0.6], [1.5, 0.4], [3.6, 0.7], [0.4, 3.2], [2.4, 3.3], [3.7, 3.4]]) {
      const w = 0.9 + rnd() * 0.3;
      add(i + a, j + c, w, 0.9, house(i + a, j + c, w, 0.9, 22 + rnd() * 10, W[Math.floor(rnd() * 4)], R[Math.floor(rnd() * 3)], rnd() < 0.5, rnd, 14, { flowers: true }));
    }
    // A little church with a spire.
    shadow(i + 2.6, j + 0.4, 0.8, 1.4, 50);
    add(i + 2.6, j + 0.4, 0.8, 1.4, box(i + 2.6, j + 0.4, 0.8, 1.4, 26, '#f4efe4', null) + win('L', i + 2.6, j + 0.4, 0.8, 1.4, 0.3, 8, 0.2, 12, 'glass') +
      gable(i + 2.6, j + 0.4, 0.8, 1.4, 26, 14, '#5c5f6b', false).replace('WALLL', '#f4efe4') + box(i + 2.65, j + 1.35, 0.4, 0.4, 44, '#f4efe4', null) + pyramid(i + 2.65, j + 1.35, 0.4, 0.4, 44, 26, '#4d5361'));
    add(i + 4.6, j + 2.5, 0, 0, tree(i + 4.6, j + 2.5, 1.1, 2));
    return g;
  }
  function cutRect(p, R) {
    const [a0, a1, b0, b1] = p, [r0, r1, s0, s1] = R;
    if (a1 <= r0 || a0 >= r1 || b1 <= s0 || b0 >= s1) return [p];
    const out = [], m0 = Math.max(a0, r0), m1 = Math.min(a1, r1);
    if (a0 < r0) out.push([a0, r0 - 0.3, b0, b1]);
    if (a1 > r1) out.push([r1 + 0.3, a1, b0, b1]);
    if (b0 < s0) out.push([m0, m1, b0, s0 - 0.3]);
    if (b1 > s1) out.push([m0, m1, s1 + 0.3, b1]);
    return out;
  }
  // A patchwork of fields, woods, orchards, pastures and farms over the region I x J, minus the CUT rectangles.
  function patchwork(I, J, CUT, rnd, add) {
    let g = '';
    const S = 6.4, kinds = ['wheat', 'veg', 'soil', 'sun', 'lav', 'vine', 'wheat', 'veg', 'forest', 'forest', 'forest', 'orchard', 'pasture', 'farm'];
    let pieces = [];
    for (let i0 = I[0]; i0 < I[1] - 1; i0 += S) for (let j0 = J[0]; j0 < J[1] - 1.2; j0 += S) {
      let ps = [[i0, Math.min(i0 + S - 0.5, I[1]), j0, Math.min(j0 + S - 0.5, J[1])]];
      for (const R of CUT) ps = ps.flatMap((q) => cutRect(q, R));
      pieces = pieces.concat(ps);
    }
    for (const [i0, i1, j0, j1] of pieces) {
      const w = i1 - i0, h = j1 - j0;
      if (w < 1.4 || h < 1.4) continue;
      const far = Math.min(i0 + OUT, j0 + OUT); // distance from the mountains at the back
      let kind = far < 8 ? 'forest' : kinds[Math.floor(rnd() * kinds.length)];
      // Near the river only plain fields (the river is drawn over them), so nothing stands in the water.
      if (Math.min(...[[i0, j0], [i1, j0], [i0, j1], [i1, j1], [(i0 + i1) / 2, (j0 + j1) / 2]].map(riverDist)) < 1.5) kind = ['wheat', 'veg', 'soil'][Math.floor(rnd() * 3)];
      if (kind === 'farm' && (w < 4.5 || h < 3.5)) kind = 'veg';
      switch (kind) {
        case 'forest':
          g += ground(i0, j0, w, h, 'class="gr3"');
          for (let k = 0; k < w * h * 0.45; k++) { const a = i0 + rnd() * w, c = j0 + rnd() * h, t = rnd(); add(a, c, 0, 0, tree(a, c, 1.1 + rnd() * 0.5, t < 0.6 ? 1 : t < 0.85 ? 0 : 2)); }
          break;
        case 'orchard':
          g += ground(i0, j0, w, h, 'class="gr2"') + hedge(i0, j0, w, h, 'nesw');
          for (let a = i0 + 0.6; a < i1 - 0.3; a += 1.2) for (let c = j0 + 0.6; c < j1 - 0.3; c += 1.2) add(a, c, 0, 0, tree(a, c, 0.7, 3));
          break;
        case 'pasture': {
          g += ground(i0, j0, w, h, 'class="gr2"') + hedge(i0, j0, w, h, 'nesw');
          const cowy = rnd() < 0.5;
          for (let k = 0; k < 7; k++) { const a = i0 + 0.6 + rnd() * (w - 1.2), c = j0 + 0.6 + rnd() * (h - 1.2); add(a, c, 0, 0, (cowy ? cow : sheep)(a, c, rnd() < 0.5 ? 1 : -1)); }
          break;
        }
        case 'farm': g += farm(i0, j0, w, h, rnd, add, rnd() < 0.5 ? 'wheat' : 'soil'); break;
        default: g += field(i0, j0, w, h, kind, rnd() < 0.5) + hedge(i0, j0, w, h, rnd() < 0.5 ? 'ne' : 'sw');
      }
    }
    return g;
  }
  // The far shore across the bay, so the sea never runs on to nothing.
  const SHORE = 47;
  function farShore(add) {
    const rnd = rng(919), A = -OUT - 30, Z = N + OUT + 30, coast = [];
    for (let i = A; i <= Z; i += 2) coast.push([i, SHORE + Math.sin(i * 0.23) * 0.8 + Math.sin(i * 0.071) * 1.6]);
    let g = poly([...coast.map((q) => P(...q)), P(Z, Z + 40), P(A, Z + 40)], 'class="gr"');
    g += poly([...coast.map((q) => P(...q)), ...coast.slice().reverse().map(([a, c]) => P(a, c + 1.1))], 'class="sand"');
    g += line(coast.map(([a, c]) => P(a, c - 0.12)), 'class="surf"');
    const HAM = [[8, SHORE + 4.5], [38, SHORE + 5]];
    for (const [a, c] of HAM) g += hamlet(a, c, rnd, add);
    g += patchwork([-OUT, N + OUT], [SHORE + 3.4, SHORE + 22], HAM.map(([a, c]) => [a - 0.6, a + 5.6, c - 0.6, c + 5.6]), rnd, add);
    return g;
  }
  function outer(add) {
    const rnd = rng(777), I0 = -EDGE - 0.4, I1 = N + EDGE + 0.4;
    let g = '';
    // Roads carry on to the edge; the river winds down from the mountains to the sea, with a bridge on the west road.
    g += line([P(15.5, -EDGE), P(15.5, -OUT)], 'class="croad"') + line([P(-EDGE, 5.5), P(-OUT, 5.5)], 'class="croad"') + line([P(N + EDGE, 15.5), P(N + OUT, 15.5)], 'class="croad"');
    // Hamlets, then a patchwork of cells around them.
    const HAM = [[-26, -24], [44, -22], [52, 4], [-36, 14]];
    for (const [a, c] of HAM) g += hamlet(a, c, rnd, add);
    // Cells on a grid, with the town, roads, railway and hamlets cut out of them (so no wide empty bands).
    const BIG = 999, CUT = [[I0, I1, I0, BIG], [14.8, 16.2, -BIG, -EDGE], [-BIG, -EDGE, 4.8, 6.2], [N + EDGE, BIG, 14.8, 16.2], [N + EDGE, BIG, 8.6, 10.4],
      ...HAM.map(([a, c]) => [a - 0.6, a + 5.6, c - 0.6, c + 5.6])];
    g += patchwork([-OUT, N + OUT], [-OUT, WATER - 1.3], CUT, rnd, add);
    // The river over the fields, and the bridge.
    g += `<path d="M${RIVER.map((p) => pt(P(...p))).join(' L')}" class="river"/><path d="M${RIVER.map((p) => pt(P(...p))).join(' L')}" class="river-hi"/>`;
    { const bi = -28.4; g += ground(bi - 1.3, 5.05, 2.6, 0.9, 'fill="#b8ad98" stroke="#6b6458" stroke-width="1"') + line([P(bi - 1.3, 5.1, 6), P(bi + 1.3, 5.1, 6)], 'class="fence"') + line([P(bi - 1.3, 5.9, 6), P(bi + 1.3, 5.9, 6)], 'class="fence"'); }
    // Avenue trees along the outer roads.
    for (let c = -EDGE - 1; c > -OUT + 6; c -= 2.2) add(14.95, c, 0, 0, tree(14.95, c, 0.9, 2));
    for (let a = -EDGE - 1; a > -OUT + 6; a -= 2.2) if (Math.abs(a + 28.4) > 2) add(a, 4.95, 0, 0, tree(a, 4.95, 0.9, 0));
    // A hazy far range behind everything, so no bare ground shows between the peaks.
    for (let i = -OUT - 8; i < N + OUT + 8; i += 3.5 + rnd() * 2) { const j = -OUT - 9 + rnd() * 2; add(i, j, 0, 0, mountain(i, j, 300 + rnd() * 160, 230 + rnd() * 140, rnd).replace('class="mtn"', 'class="mtn far"')); }
    for (let j = -OUT - 4; j < WATER - 4; j += 3.5 + rnd() * 2) { const i = -OUT - 9 + rnd() * 2; add(i, j, 0, 0, mountain(i, j, 300 + rnd() * 160, 230 + rnd() * 140, rnd).replace('class="mtn"', 'class="mtn far"')); }
    // Mountains along the far edges (the top of the screen), snow-capped, with foothills.
    for (let i = -OUT - 2; i < N + OUT + 4; i += 4.5 + rnd() * 2.5) { const j = -OUT - 3 + rnd() * 3; add(i, j, 0, 0, mountain(i, j, 220 + rnd() * 160, 150 + rnd() * 140, rnd)); }
    for (let j = -OUT + 2; j < WATER - 6; j += 4.5 + rnd() * 2.5) { const i = -OUT - 3 + rnd() * 3; add(i, j, 0, 0, mountain(i, j, 220 + rnd() * 160, 150 + rnd() * 140, rnd)); }
    // A second, lower row of hills in front.
    for (let i = -OUT + 3; i < N + OUT; i += 6 + rnd() * 3) { const j = -OUT + 1 + rnd() * 2; add(i, j, 0, 0, mountain(i, j, 160 + rnd() * 90, 70 + rnd() * 50, rnd)); }
    for (let j = -OUT + 6; j < WATER - 8; j += 6 + rnd() * 3) { const i = -OUT + 1 + rnd() * 2; add(i, j, 0, 0, mountain(i, j, 160 + rnd() * 90, 70 + rnd() * 50, rnd)); }
    // Beaches all along the coast.
    g += poly([P(-OUT - 4, WATER - 1.1), P(-EDGE, WATER - 1.1), P(-EDGE, WATER), P(-OUT - 4, WATER)], 'class="sand"') + poly([P(N + EDGE, WATER - 1.1), P(N + OUT + 4, WATER - 1.1), P(N + OUT + 4, WATER), P(N + EDGE, WATER)], 'class="sand"');
    return g;
  }
  // Things in the sea, drawn after the water: rocks by the beaches, an island, buoys at the harbour mouth.
  function seaDecor(add) {
    let g = '';
    for (const [a, b] of [[-OUT - 4, -0.4], [N - 0.6, N + OUT + 4]]) g += line([P(a, WATER + 0.12), P(b, WATER + 0.12)], 'class="surf"');
    for (const [a, c, r] of [[-1.2, WATER + 0.3, 6], [-7, WATER + 0.2, 8], [-7.6, WATER + 0.5, 5], [26.6, WATER + 0.3, 7], [36, WATER + 0.25, 9], [-20, WATER + 0.4, 7], [47, WATER + 0.3, 8]]) { const [x, y] = P(a, c); g += `<path d="M${x - r} ${y} L${x - r * 0.6} ${y - r * 0.8} L${x + r * 0.3} ${y - r} L${x + r} ${y} Z" class="rock" ${INK}/>`; }
    for (const [ci, cj, r, n] of [[30, 28.5, 1.6, 4], [-6, 36, 2.4, 7], [44, 30, 2, 5]]) {
      g += disc(ci, cj, r, 'class="sand"') + disc(ci + 0.1, cj - 0.1, r * 0.72, 'class="gr2"');
      const rnd = rng(ci * 13 + cj);
      for (let k = 0; k < n; k++) { const t = rnd() * Math.PI * 2, d = rnd() * r * 0.5; add(ci + Math.cos(t) * d, cj + Math.sin(t) * d, 0, 0, tree(ci + Math.cos(t) * d, cj + Math.sin(t) * d, 0.9, Math.floor(rnd() * 3))); }
      const [x, y] = P(ci + r * 0.75, cj + r * 0.5); g += `<path d="M${x - 9} ${y} L${x - 5} ${y - 7} L${x + 3} ${y - 9} L${x + 9} ${y} Z" class="rock" ${INK}/>`;
    }
    for (const [a, c, col] of [[10.6, 27.6, '#c0463a'], [13.4, 27.2, '#2f7d4f'], [4.4, 29.4, '#c0463a'], [21, 29.6, '#e3a92b']]) { const [x, y] = P(a, c); g += `<g class="buoy"><path d="M${x - 4} ${y} L${x} ${y - 11} L${x + 4} ${y} Z" fill="${col}" ${INK}/><circle cx="${x}" cy="${y - 12}" r="1.6" class="lampl"/></g>`; }
    return g;
  }

  // Static scenery is built once: [{ key, s }] objects to depth-sort with the lots, and the ground.
  let scenery = null;
  function buildScenery() {
    const objs = [], add = (i, j, w, h, s) => objs.push({ key: i + w / 2 + j + h / 2, s });
    const cobjs = [], addC = (i, j, w, h, s) => cobjs.push({ key: i + w / 2 + j + h / 2, s });
    let g = '';
    SH = '';
    GL = [];
    const A = -EDGE, Z = N + EDGE;
    // Countryside, the harbour and the streets.
    g += ground(-OUT - 30, -OUT - 30, N + 2 * OUT + 60, N + 2 * OUT + 60, 'class="gr"');
    g += outer(addC) + country(addC, add); // the countryside goes on the back layer, which never needs redrawing
    g += ground(-0.4, -0.4, N - 0.2, WATER + 0.4, 'fill="#9a958a"');
    g += poly([P(-OUT - 30, WATER), P(N + OUT + 30, WATER), P(N + OUT + 30, N + OUT + 30), P(-OUT - 30, N + OUT + 30)], 'class="water"');
    g += poly([P(-0.4, WATER), P(N - 0.6, WATER), P(N - 0.6, WATER, -7), P(-0.4, WATER, -7)], 'fill="#7c7a73"');
    g += farShore(addC) + seaDecor(addC);
    // Zebra crossings on the inner streets, just past each crossing.
    for (let a = 1; a <= 4; a++) for (let b = 1; b <= 3; b++) {
      const ci = STEP * a + 0.5, cj = STEP * b + 0.5;
      for (let t = -0.3; t < 0.31; t += 0.15) {
        g += ground(ci + 0.62, cj + t - 0.04, 0.26, 0.08, 'class="zebra"');
        g += ground(ci + t - 0.04, cj + 0.62, 0.08, 0.26, 'class="zebra"');
      }
    }
    for (let k = 0; k <= 5; k++) {
      const c = STEP * k + 0.5;
      g += `<path d="M${pt(P(c, 0))} L${pt(P(c, WATER - 0.2))}" class="dash"/>`;
      if (k < 5) g += `<path d="M${pt(P(0, c))} L${pt(P(N - 0.6, c))}" class="dash"/>`;
    }
    // Pier into the harbour, and the lighthouse.
    g += ground(6.2, WATER, 1.6, 4.4, 'fill="#b48a5a" stroke="#6b4529" stroke-width="1"');
    for (let a = WATER + 0.3; a < WATER + 4.4; a += 0.4) g += `<path d="M${pt(P(6.2, a))} L${pt(P(7.8, a))}" stroke="#8a6a4a" stroke-width="0.8"/>`;
    g += ground(14.2, WATER, 3, 1.4, 'fill="#9a958a" stroke="#6b6458" stroke-width="1"');
    for (const [bk, b] of Object.entries(BLOCKS)) {
      const [bx, by] = bk.split(',').map(Number), [i0, j0] = origin(bx, by), rnd = rng(bx * 131 + by * 17 + 7);
      const lotT = b.lot ? [i0 + b.lot[1], j0 + b.lot[2]] : null;
      const inLot = (i, j) => lotT && i >= lotT[0] && i < lotT[0] + 2 && j >= lotT[1] && j < lotT[1] + 2;
      // The kerb takes the district's colour, so each district reads as one area on the map.
      g += ground(i0 - 0.16, j0 - 0.16, BLOCK + 0.32, BLOCK + 0.32, `fill="${(Game.district(b.d) || {}).color || '#cfc8b8'}" opacity="0.85"`);
      g += ground(i0, j0, BLOCK, BLOCK, b.kind === 'park' ? 'class="gr2"' : `fill="${GROUND[b.d]}"`);
      if (b.kind !== 'park') g += ground(i0, j0, BLOCK, BLOCK, `fill="url(#${b.d === 'old_town' ? 'tm-cobble' : 'tm-paving'})"`);
      // Street lamps at the block corners.
      add(i0 - 0.2, j0 + BLOCK + 0.2, 0, 0, lamp(i0 - 0.2, j0 + BLOCK + 0.2));
      const st = STYLE[b.style || 'harbour'];
      const fill = (skip = () => false) => {
        for (let dj = 0; dj < BLOCK; dj++) for (let di = 0; di < BLOCK; di++) {
          const i = i0 + di, j = j0 + dj;
          if (inLot(i, j) || skip(di, dj)) continue;
          const inner = di > 0 && di < 3 && dj > 0 && dj < 3;
          if (inner || rnd() < 0.12) {
            g += ground(i + 0.05, j + 0.05, 0.9, 0.9, 'class="gr2"');
            const tk = rnd();
            add(i + 0.5, j + 0.5, 0, 0, tree(i + 0.5, j + 0.55, 0.9 + rnd() * 0.3, tk < 0.25 ? 1 : tk < 0.55 ? 2 : 0));
            continue;
          }
          const ht = st.ht[0] + rnd() * (st.ht[1] - st.ht[0]), wall = st.walls[Math.floor(rnd() * st.walls.length)], roof = st.roofs[Math.floor(rnd() * st.roofs.length)];
          add(i, j, 1, 1, house(i + 0.06, j + 0.06, 0.88, 0.88, ht, wall, roof, rnd() < 0.5, rnd, b.style === 'mansion' ? 12 : 16, st.deco));
        }
      };
      const i = i0, j = j0;
      switch (b.kind) {
        case 'houses': fill(); break;
        case 'cathedral':
          shadow(i + 0.2, j + 1.2, 2.7, 1.6, 60); shadow(i + 2.9, j + 1.45, 1.1, 1.1, 110);
          g += ground(i, j, 4, 4, 'fill="#e2d6bd"');
          add(i + 0.2, j + 1.2, 2.7, 1.6, box(i + 0.2, j + 1.2, 2.7, 1.6, 44, '#e9e1cf', null) +
            [0.4, 1.0, 1.6, 2.2].map((u) => win('L', i + 0.2, j + 1.2, 2.7, 1.6, u, 12, 0.22, 22, 'glass')).join('') +
            gable(i + 0.2, j + 1.2, 2.7, 1.6, 44, 30, '#5c5f6b', true).replace('WALLR', shade('#e9e1cf', 0.78)));
          add(i + 2.9, j + 1.45, 1.1, 1.1, box(i + 2.9, j + 1.45, 1.1, 1.1, 92, '#e9e1cf', null) + win('L', i + 2.9, j + 1.45, 1.1, 1.1, 0.4, 20, 0.3, 34, 'glass') +
            win('R', i + 2.9, j + 1.45, 1.1, 1.1, 0.4, 60, 0.3, 18, 'glass') + door('R', i + 2.9, j + 1.45, 1.1, 1.1, 0.35, 0.4, 16) + pyramid(i + 2.9, j + 1.45, 1.1, 1.1, 92, 58, '#4d5361'));
          add(i + 0.6, j + 3.4, 0, 0, tree(i + 0.6, j + 3.5, 1));
          add(i + 0.6, j + 0.5, 0, 0, tree(i + 0.6, j + 0.6, 1.1, 1));
          break;
        case 'townhall': {
          shadow(i + 0.3, j + 0.3, 3.4, 1.9, 50);
          g += ground(i, j, 4, 4, 'fill="#e2d6bd"');
          const W = '#f1e4c8';
          add(i + 0.3, j + 0.3, 3.4, 1.9, box(i + 0.3, j + 0.3, 3.4, 1.9, 40, W, '#cfc8b8') + strip('L', i + 0.3, j + 0.3, 3.4, 1.9, 0, 4, '#d8c6a5') + strip('R', i + 0.3, j + 0.3, 3.4, 1.9, 0, 4, '#b8a585') +
            strip('L', i + 0.3, j + 0.3, 3.4, 1.9, 36, 40, '#e2d6bd') + strip('R', i + 0.3, j + 0.3, 3.4, 1.9, 36, 40, '#c8bca3') + windows(i + 0.3, j + 0.3, 3.4, 1.9, 40, 16, rnd, { flowers: true }) +
            door('L', i + 0.3, j + 0.3, 3.4, 1.9, 1.5, 0.4, 16) + box(i + 1.5, j + 0.8, 1, 1, 34, W, null, 40) +
            `<circle cx="${P(i + 2, j + 1.8, 60)[0]}" cy="${P(i + 2, j + 1.8, 60)[1]}" r="7" fill="#fbfaf6" stroke="#3b2b22"/>` +
            `<path d="M${pt(P(i + 2, j + 1.8, 60))} l0 -5 M${pt(P(i + 2, j + 1.8, 60))} l4 1" stroke="#3b2b22" stroke-width="1.2"/>` +
            pyramid(i + 1.5, j + 0.8, 1, 1, 74, 26, '#2f6b5a') + `<path d="M${pt(P(i + 2, j + 1.3, 100))} l0 -16" stroke="#3b2b22"/><path d="M${pt(P(i + 2, j + 1.3, 116))} l10 3 l-10 3 Z" fill="#a3302a"/>`);
          add(i + 2, j + 3.1, 0, 0, disc(i + 2, j + 3.1, 0.55, 'fill="#cfc8b8" stroke="#7c7a73" stroke-width="2"') + disc(i + 2, j + 3.1, 0.42, 'class="water"') +
            `<path d="M${pt(P(i + 2, j + 3.1, 2))} l0 -12" stroke="#a9d3f0" stroke-width="3" stroke-linecap="round" class="jet"/>`);
          add(i + 0.4, j + 3.5, 0, 0, tree(i + 0.4, j + 3.5, 0.9));
          add(i + 3.6, j + 3.5, 0, 0, tree(i + 3.6, j + 3.5, 0.9));
          break;
        }
        case 'markethall': {
          shadow(i + 0.3, j + 0.4, 3.4, 1.8, 38);
          add(i + 0.3, j + 0.4, 3.4, 1.8, box(i + 0.3, j + 0.4, 3.4, 1.8, 22, '#f4efe4', null) +
            [0.3, 1.0, 1.7, 2.4].map((u) => win('L', i + 0.3, j + 0.4, 3.4, 1.8, u, 2, 0.5, 14, 'glass')).join('') +
            gable(i + 0.3, j + 0.4, 3.4, 1.8, 22, 26, '#b5452f', true).replace('WALLR', shade('#f4efe4', 0.78)) + roofLines(i + 0.3, j + 0.4, 3.4, 1.8, 22, 26, true));
          const cols = ['#d9483b', '#ee8a33', '#6fae4a', '#e8c26a', '#5b9bd5'];
          for (let k = 0; k < 4; k++) {
            const si = i + 0.3 + k * 0.9, sj = j + 2.9;
            add(si, sj, 0.6, 0.5, box(si, sj, 0.6, 0.5, 8, '#c8a27a', cols[(k + 1) % 5]) + gable(si - 0.05, sj - 0.05, 0.7, 0.6, 16, 6, cols[k], true).replace('WALLR', '#fbfaf6') +
              `<path d="M${pt(P(si, sj + 0.5, 0))} l0 -16 M${pt(P(si + 0.6, sj + 0.5, 0))} l0 -16" stroke="#6b4529"/>`);
          }
          break;
        }
        case 'station': {
          shadow(i + 0.2, j + 0.3, 3.6, 1.6, 42);
          add(i + 0.2, j + 0.3, 3.6, 1.6, box(i + 0.2, j + 0.3, 3.6, 1.6, 34, '#e8b4a0', null) + windows(i + 0.2, j + 0.3, 3.6, 1.6, 34, 16, rnd) +
            door('L', i + 0.2, j + 0.3, 3.6, 1.6, 1.6, 0.4, 16) + gable(i + 0.2, j + 0.3, 3.6, 1.6, 34, 18, '#5c5f6b', true).replace('WALLR', shade('#e8b4a0', 0.78)) + roofLines(i + 0.2, j + 0.3, 3.6, 1.6, 34, 18, true) +
            `<circle cx="${P(i + 2, j + 1.9, 26)[0]}" cy="${P(i + 2, j + 1.9, 26)[1]}" r="5" fill="#fbfaf6" stroke="#3b2b22"/>`);
          // Platform canopy on posts.
          add(i + 0.4, j + 2.3, 3.2, 0.7, [0.5, 1.5, 2.5, 3.4].map((u) => `<path d="M${pt(P(i + u, j + 3, 0))} l0 -20" stroke="#4a4a4a" stroke-width="1.5"/>`).join('') +
            poly([P(i + 0.3, j + 2.2, 20), P(i + 3.7, j + 2.2, 20), P(i + 3.7, j + 3.05, 20), P(i + 0.3, j + 3.05, 20)], `fill="#2f6b5a" ${INK}`));
          break;
        }
        case 'university': {
          shadow(i + 0.3, j + 0.4, 3.4, 2.2, 50);
          g += ground(i, j + 3, 4, 1, 'class="gr2"');
          const W = '#f4efe4';
          add(i + 0.3, j + 0.4, 3.4, 2.2, box(i + 0.3, j + 0.4, 3.4, 2.2, 40, W, '#d8d0bc') + windows(i + 0.3, j + 0.4, 3.4, 2.2, 40, 15, rnd) +
            [0.5, 0.9, 1.3, 1.7, 2.1, 2.5, 2.9].map((u) => win('L', i + 0.3, j + 0.4, 3.4, 2.2, u, 0, 0.12, 30, 'col" fill="#fbfaf6')).join('') +
            poly([P(i + 0.3, j + 2.6, 30), P(i + 3.7, j + 2.6, 30), P(i + 2, j + 2.6, 46)], `fill="${W}" ${INK}`) +
            (() => { const [x, y] = P(i + 2, j + 1.5, 40); return `<path d="M${x - 26} ${y} A26 24 0 0 1 ${x + 26} ${y} Z" fill="#7fa7a0" ${INK}/><rect x="${x - 2}" y="${y - 32}" width="4" height="8" fill="#e3a92b"/>`; })());
          add(i + 0.5, j + 3.5, 0, 0, tree(i + 0.5, j + 3.5, 1));
          add(i + 3.5, j + 3.5, 0, 0, tree(i + 3.5, j + 3.5, 1));
          break;
        }
        case 'park': {
          g += disc(i + 2.4, j + 2.2, 1, 'class="water"');
          g += `<path d="M${pt(P(i, j + 3.5))} Q${pt(P(i + 1.5, j + 1.5))} ${pt(P(i + 4, j + 0.6))}" stroke="#e3d2a3" stroke-width="6" fill="none"/>`;
          const T = [[0.5, 0.5], [1.5, 0.4], [0.4, 1.6], [3.5, 0.5], [3.6, 3.6], [0.6, 3.6], [1.3, 2.8], [3.6, 1.6]];
          T.forEach(([a, c], k) => add(i + a, j + c, 0, 0, tree(i + a, j + c, 0.9 + (k % 3) * 0.15, k % 4 === 1 ? 1 : 0)));
          add(i + 2.6, j + 3.3, 0.6, 0.6, box(i + 2.4, j + 3.1, 0.6, 0.6, 3, '#e9e1cf', '#e9e1cf') +
            [[0, 0], [0.6, 0], [0.6, 0.6], [0, 0.6]].map(([a, c]) => `<path d="M${pt(P(i + 2.4 + a, j + 3.1 + c, 3))} l0 -12" stroke="#fbfaf6" stroke-width="1.5"/>`).join('') + pyramid(i + 2.35, j + 3.05, 0.7, 0.7, 15, 10, '#a3302a'));
          break;
        }
        case 'fishmarket': {
          fill((di, dj) => dj < 2);
          add(i + 0.3, j + 0.3, 3.4, 1.4, [0.4, 1.4, 2.4, 3.4].map((u) => `<path d="M${pt(P(i + 0.3 + u, j + 1.7, 0))} l0 -18" stroke="#6b4529" stroke-width="1.5"/>`).join('') +
            [0.6, 1.4, 2.2].map((u) => box(i + 0.4 + u, j + 1.0, 0.4, 0.4, 6, '#b48a5a', '#9cc2d8')).join('') +
            gable(i + 0.2, j + 0.2, 3.6, 1.6, 18, 14, '#2f4a6b', true).replace('WALLR', 'none'));
          break;
        }
        case 'warehouses': {
          fill((di, dj) => di >= 2);
          for (const dj of [0, 2]) shadow(i + 2.1, j + dj + 0.1, 1.8, 1.8, 30);
          for (const dj of [0, 2]) add(i + 2.1, j + dj + 0.1, 1.8, 1.8, box(i + 2.1, j + dj + 0.1, 1.8, 1.8, 30, '#a65d3f', '#7c4a35') + door('L', i + 2.1, j + dj + 0.1, 1.8, 1.8, 0.6, 0.6, 20, '#5a3a24') +
            win('R', i + 2.1, j + dj + 0.1, 1.8, 1.8, 0.3, 20, 0.25, 6) + win('R', i + 2.1, j + dj + 0.1, 1.8, 1.8, 1.2, 20, 0.25, 6));
          break;
        }
      }
    }
    g += `<g class="tm-shadow">${SH}</g>`;
    // Railway out east from the station platform, drawn after the blocks so the station's paving doesn't cover it:
    // ballast, sleepers, then the two rails on top. Overhead line masts stand behind the track.
    g += ground(25.4, 9.15, TUN - 25.4, 0.8, 'fill="#a59a88"');
    for (let a = 20.6; a < TUN; a += 0.35) g += `<path d="M${pt(P(a, 9.25))} L${pt(P(a, 9.85))}" stroke="#8a6a4a" stroke-width="1.6"/>`;
    for (const rj of [9.35, 9.75]) g += `<path d="M${pt(P(20.5, rj))} L${pt(P(TUN, rj))}" stroke="#6b6458" stroke-width="2.2"/>`;
    g += `<path d="M${pt(P(20.5, 9.25))} L${pt(P(20.5, 9.85))}" stroke="#3b2b22" stroke-width="3"/>`; // buffer stop
    for (let a = 21.2; a < TUN - 1; a += 2) {
      if (a > 25.4) add(a, 9.0, 0, 0, line([P(a, 9.0, 0), P(a, 9.0, 34)], 'class="mast"') + line([P(a, 9.0, 31), P(a, 9.62, 31)], 'class="mast arm"'));
      add(a + 2, 9.55, 0, 0, line([P(a, 9.55, 29), P(Math.min(TUN, a + 2), 9.55, 29)], 'class="wire"'));
    }
    // Lighthouse at the end of the pier (screen space: it's round).
    { const [x, y] = P(7, WATER + 4); add(7, WATER + 4, 0, 0, `<g><path d="M${x - 9} ${y} L${x - 6} ${y - 70} L${x + 6} ${y - 70} L${x + 9} ${y} Z" fill="#fbfaf6" ${INK}/>` +
      [12, 36].map((v) => `<path d="M${x - 8.5 + v * 0.04} ${y - v} L${x - 7.7 + v * 0.04} ${y - v - 12} L${x + 7.7 - v * 0.04} ${y - v - 12} L${x + 8.5 - v * 0.04} ${y - v} Z" fill="#c0463a"/>`).join('') +
      `<rect x="${x - 6}" y="${y - 82}" width="12" height="12" class="beacon" ${INK}/><path d="M${x - 8} ${y - 82} L${x} ${y - 92} L${x + 8} ${y - 82} Z" fill="#c0463a" ${INK}/></g>`);
      GL.push([x, y - 76, 4]); }
    cobjs.sort((a, b) => a.key - b.key);
    scenery = { g, objs, back: cobjs.map((o) => o.s).join(''), glow: GL };
    GL = null;
  }

  // ----- Restaurant lots: drawn from the game state -----
  function lotState(lotId) {
    const l = Game.lot(lotId), r = Game.restaurantAt(lotId);
    if (r) return { l, r, rv: r.bought ? Game.rival(l.rival) : null };
    if (l.rival) { const st = Game.town() && Game.town().rivals[l.rival]; return { l, rv: Game.rival(l.rival), st }; }
    return { l };
  }
  function restaurantBuilding(i, j, colors, style, outOfStock) {
    const [a, b] = colors, W = style === 'chain' ? '#fbfaf6' : style === 'grand' ? '#efe6d2' : '#f4efe4';
    const ht = style === 'grand' ? 50 : style === 'chain' ? 30 : 38, bi = i + 0.2, bj = j + 0.2, w = 1.6, h = 1.6;
    let s = box(bi, bj, w, h, ht, W, style === 'chain' ? a : '#cfc8b8');
    // Big windows and a door on both faces.
    s += [0.15, 0.95].map((u) => win('L', bi, bj, w, h, u, 6, 0.5, 14, 'glass')).join('') + door('R', bi, bj, w, h, 0.6, 0.4, 16, shade(a, 0.7));
    s += win('R', bi, bj, w, h, 1.1, 6, 0.35, 14, 'glass') + win('R', bi, bj, w, h, 0.12, 6, 0.35, 14, 'glass');
    if (ht > 40) s += windows(bi, bj, w, h, ht, 30, rng(i * 7 + j));
    // Striped awnings over the ground floor.
    const aw = (side, u0, u1) => {
      let t = '';
      const f = side === 'L' ? (u, z, out) => P(bi + u, bj + h + out, z) : (u, z, out) => P(bi + w + out, bj + u, z);
      const n = Math.round((u1 - u0) / 0.2);
      for (let k = 0; k < n; k++) { const p = u0 + k * (u1 - u0) / n, q = u0 + (k + 1) * (u1 - u0) / n; t += poly([f(p, 24, 0), f(q, 24, 0), f(q, 16, 0.35), f(p, 16, 0.35)], `fill="${k % 2 ? '#fbfaf6' : a}" stroke="#3b2b22" stroke-width="0.6"`); }
      return t;
    };
    s += aw('L', 0, w) + aw('R', 0, h);
    if (style === 'grand') s += gable(bi, bj, w, h, ht, 18, a, true).replace('WALLR', shade(W, 0.78)) + `<path d="M${pt(P(bi + w / 2, bj + h / 2, ht + 18))} l0 -12" stroke="#3b2b22"/><path d="M${pt(P(bi + w / 2, bj + h / 2, ht + 30))} l9 3 l-9 3 Z" fill="${b}"/>`;
    else if (style === 'chain') { const [x, y] = P(bi + w, bj + h, ht); s += `<rect x="${x - 22}" y="${y - 20}" width="44" height="14" rx="3" fill="${b}" ${INK}/><rect x="${x - 18}" y="${y - 17}" width="36" height="8" rx="2" fill="${a}"/>`; }
    else s += gable(bi, bj, w, h, ht, 14, style === 'wood' ? '#2f4a6b' : '#5c5f6b', false).replace('WALLL', W);
    // Tables outside.
    for (const u of [0.4, 1.2]) s += disc(bi + u, bj + h + 0.55, 0.12, `fill="#fbfaf6" ${INK}`) + `<path d="M${pt(P(bi + u, bj + h + 0.55, 0))} l0 -18" stroke="#6b4529"/>` + `<path d="M${pt(P(bi + u, bj + h + 0.55, 18))} m-9 3 l9 -8 l9 8 Z" fill="${a}" ${INK}/>`;
    return s;
  }
  function lotSvg(lotId, sel) {
    const [i, j] = LOT_AT[lotId], { l, r, rv } = lotState(lotId);
    let s = '';
    if (!r && !rv) {
      // A free lot: an empty plot with a sign.
      s += ground(i + 0.08, j + 0.08, 1.84, 1.84, 'fill="#c9b48a" stroke="#9a6a43" stroke-width="2" stroke-dasharray="6 4"');
      const [x, y] = P(i + 1, j + 1.2);
      // An open lot's TO LET sign is big and bobs gently so it can be found; a district not open yet shows a small SOON sign.
      const open = Game.districtOpen(l.district);
      s += open
        ? `<rect x="${x - 2.5}" y="${y - 34}" width="5" height="34" fill="#6b4529"/><g class="tm-tolet"><rect x="${x - 33}" y="${y - 56}" width="66" height="24" rx="3" fill="#fbfaf6" stroke="#a3302a" stroke-width="2"/><text x="${x}" y="${y - 39.5}" class="tm-sign big">TO LET</text></g>`
        : `<rect x="${x - 2}" y="${y - 26}" width="4" height="26" fill="#6b4529"/><rect x="${x - 22}" y="${y - 40}" width="44" height="16" rx="2" fill="#fbfaf6" ${INK}/>${svgIcon('ui_lock', x - 19, y - 38.5, 11)}<text x="${x + 5}" y="${y - 28.5}" class="tm-sign">SOON</text>`;
    } else {
      const style = rv ? { cw_old_town: 'grand', cw_harbour: 'wood', cw_market: 'chain' }[rv.id] : 'yours';
      const colors = rv ? rv.colors : ['#2f7d4f', '#e3a92b'];
      s += ground(i, j, 2, 2, `fill="${shade(GROUND[l.district], 0.93)}"`);
      s += restaurantBuilding(i, j, colors, style);
    }
    // The selected lot: a gold ring under it and a dashed one on top, so it shows even behind tall neighbours.
    if (sel) s = ground(i - 0.12, j - 0.12, 2.24, 2.24, 'class="tm-selring"') + s + ground(i - 0.12, j - 0.12, 2.24, 2.24, 'class="tm-selring top"');
    return s;
  }
  const mctx = document.createElement('canvas').getContext('2d');
  const textW = (t, font) => { mctx.font = font; return mctx.measureText(t).width; };
  // An SVG icon (assets/icons.js) placed in the town SVG; emoji can't be swapped for icons inside SVG text.
  const svgIcon = (id, x, y, size) => `<image href="${FSI.dataURL(id)}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${size}" height="${size}"/>`;
  const starStr = (v) => (v === null || v === undefined ? 'new' : '★ ' + v.toFixed(1));
  function lotLabel(lotId, sel) {
    const [i, j] = LOT_AT[lotId], { l, r, rv, st } = lotState(lotId), [x, y0] = P(i + 1, j + 1, 0);
    const tall = rv && rv.id === 'cw_old_town' ? 90 : 72, y = y0 - tall;
    let name, sub, bg, alert = '', award = 0;
    if (r) {
      const v = Game.rating(r);
      name = r.name; sub = r.menu.length ? starStr(v) : 'no menu'; bg = '#2f7d4f';
      if (r.menu.some((id) => (Game.S.inv[id] || 0) < 1)) alert = '!';
    } else if (rv) { name = rv.name; sub = starStr(st ? st.rating : rv.base); bg = rv.colors[0]; }
    else return ''; // a free lot has its TO LET sign on the map; no label
    if (Game.awardBoost && Game.awardBoost(lotId) > 1) award = 16; // room for the trophy icon before the name
    const text = name, wpx = Math.max(70, award + textW(text, '700 12px system-ui, sans-serif') + textW(sub, '600 11px system-ui, sans-serif') + 30);
    return `<g class="tm-label ${sel ? 'sel' : ''}" data-action="town-sel" data-arg="${lotId}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
      <rect x="${-wpx / 2}" y="-12" width="${wpx}" height="22" rx="11" fill="${bg}" stroke="${sel ? '#f2c14e' : '#fbfaf6'}" stroke-width="${sel ? 3 : 1.5}"/>
      ${award ? svgIcon('ui_trophy', -wpx / 2 + 9, -6, 14) : ''}<text x="${-wpx / 2 + 11 + award}" y="3.5" class="tm-ln">${esc(text)}</text><text x="${wpx / 2 - 10}" y="3.5" class="tm-ls">${esc(sub)}</text>
      ${alert ? `<circle cx="${wpx / 2 + 2}" cy="-10" r="8" fill="#c0463a" stroke="#fbfaf6" stroke-width="1.5"/><text x="${wpx / 2 + 2}" y="-6" class="tm-alert">!</text>` : ''}
      <path d="M-5 10 L0 17 L5 10 Z" fill="${bg}"/></g>`;
  }
  const DIST_LABEL = { old_town: [6.5, 4.6], harbour: [5.6, 19.9], market: [20.5, 15.5] };
  function districtLabels() {
    return Game.DISTRICTS.map((d) => {
      const [x, y] = P(...DIST_LABEL[d.id]), w = textW(d.name, '800 15px system-ui, sans-serif') + 24;
      return `<g class="tm-dist" transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><rect x="${-w / 2}" y="-14" width="${w}" height="24" rx="6" fill="${d.color}" opacity="0.94" stroke="#fbfaf6" stroke-width="1.5"/>` +
        `<text y="3.5" class="tm-dn">${esc(d.name)}</text></g>`;
    }).join('');
  }

  // ----- Night glow: warm pools of light, like the farm's working buildings after dark -----
  // Points [x, y, kind]: 1 window, 2 shop glass, 3 street lamp, 4 lighthouse, 5 restaurant. Windows close together
  // are merged into one glow (a cell of 14 px), so a whole house gives one soft light rather than dozens of dots.
  const GLOW_DEFS = '<radialGradient id="tmg"><stop offset="0" stop-color="#ffc56e" stop-opacity="1"/><stop offset="0.45" stop-color="#ffb35a" stop-opacity="0.45"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="tmgl"><stop offset="0" stop-color="#fff2c0" stop-opacity="1"/><stop offset="0.35" stop-color="#ffd884" stop-opacity="0.5"/><stop offset="1" stop-color="#ffd884" stop-opacity="0"/></radialGradient>';
  function glowSvg(pts) {
    const cells = new Map();
    let s = '';
    for (const [x, y, k] of pts) {
      if (k >= 3) { const r = [0, 0, 0, 22, 40, 60][k]; s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="url(#${k === 5 ? 'tmg' : 'tmgl'})"/>`; continue; }
      const key = Math.round(x / 14) + ',' + Math.round(y / 14), c = cells.get(key);
      if (c) { c.x += x; c.y += y; c.c++; c.n += k; } else cells.set(key, { x, y, c: 1, n: k });
    }
    for (const c of cells.values()) {
      const m = c.n, x = c.x / c.c, y = c.y / c.c;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(14 + 5 * Math.sqrt(m)).toFixed(1)}" fill="url(#tmg)" opacity="${Math.min(1, 0.55 + 0.15 * m).toFixed(2)}"/>`;
    }
    return s;
  }

  // ----- The SVG, view and animation -----
  const TM = { cam: { x: 40, y: 380, z: 1 }, el: null, svg: null, walkers: [], sig: '' };
  window.TownMap = TM;
  TM.lotAt = LOT_AT;
  const BAND_MIN = -20, BAND_MAX = 72, BANDS = 4;
  const bandOf = (k) => Math.max(0, Math.min((BAND_MAX - BAND_MIN) * BANDS - 1, Math.floor((k - BAND_MIN) * BANDS)));
  TM.render = function (sel) {
    if (!TM.el) return;
    if (!scenery) buildScenery();
    // The scenery is put in the page once; later renders only redraw the lots and their labels.
    if (!TM.svg || TM.el.lastChild !== TM.svg) {
      const objs = scenery.objs.slice();
      for (const id of Object.keys(LOT_AT)) { const [i, j] = LOT_AT[id]; objs.push({ key: i + j + 2, s: `<g class="tm-lot" data-action="town-sel" data-arg="${id}"></g>` }); }
      objs.sort((a, b) => a.key - b.key);
      // Objects go into depth bands (a quarter tile of i + j each), so a walker can be slipped into the band of the spot
      // it stands on: drawn over the buildings behind it and under the ones in front.
      const bands = Array.from({ length: (BAND_MAX - BAND_MIN) * BANDS }, () => []);
      for (const o of objs) bands[bandOf(o.key)].push(o.s);
      // Two layers: the ground and the countryside behind (static), the town with everything that moves in front, so a
      // walker taking a step only redraws the front layer.
      TM.el.innerHTML = `<svg class="tm-svg tm-back" xmlns="http://www.w3.org/2000/svg">${DEFS}${scenery.g}${scenery.back}</svg>` +
        `<svg class="tm-svg" xmlns="http://www.w3.org/2000/svg">${bands.map((b) => `<g class="tm-band">${b.join('')}</g>`).join('')}<g id="tm-boats"></g>${districtLabels()}<g id="tm-labels"></g><g id="tm-float"></g></svg>`;
      TM.back = TM.el.firstChild;
      TM.svg = TM.el.lastChild;
      // Season, night and detail classes are set on the front layer; the back layer follows.
      new MutationObserver(() => TM.back.setAttribute('class', TM.svg.getAttribute('class') + ' tm-back')).observe(TM.svg, { attributes: true, attributeFilter: ['class'] });
      TM.bandEls = TM.svg.querySelectorAll('.tm-band');
      TM.lotEls = {};
      for (const g of TM.svg.querySelectorAll('.tm-lot')) TM.lotEls[g.dataset.arg] = g;
      for (const w of TM.walkers) w.el = null;
      TM.train.els = null;
      for (const bt of TM.boats) bt.el = null;
      // Night lights: a third SVG over the night tint (#town-glow), so lit windows, lamps and restaurants glow instead of being dimmed.
      const ge = document.getElementById('town-glow');
      if (ge) {
        ge.innerHTML = `<svg class="tm-svg" xmlns="http://www.w3.org/2000/svg"><defs>${GLOW_DEFS}</defs><g>${glowSvg(scenery.glow)}</g><g></g></svg>`;
        TM.glowSvg = ge.firstChild;
        TM.lotGlowSig = null;
      }
      TM.applyView();
    }
    GL = [];
    for (const id of Object.keys(LOT_AT)) TM.lotEls[id].innerHTML = lotSvg(id, id === sel);
    // Open restaurants glow brighter: a big warm pool of light on the lot.
    for (const id of Object.keys(LOT_AT)) if (lotState(id).r || lotState(id).rv) { const [i, j] = LOT_AT[id], [x, y] = P(i + 1, j + 1, 14); GL.push([x, y, 5]); }
    const lg = GL.map((p) => p.join()).join(';');
    GL = null;
    if (TM.glowSvg && lg !== TM.lotGlowSig) { TM.lotGlowSig = lg; TM.glowSvg.lastChild.innerHTML = glowSvg(lg ? lg.split(';').map((p) => p.split(',').map(Number)) : []); }
    TM.svg.querySelector('#tm-labels').innerHTML = Object.keys(LOT_AT).map((id) => lotLabel(id, id === sel)).join('');
  };
  TM.applyView = function () {
    if (!TM.svg) return;
    const W = TM.el.clientWidth || 800, H = TM.el.clientHeight || 600, c = TM.cam;
    // Zoomed out, the small details (glazing bars, sills, roof courses, tree shadows) are hidden: too small to see, and costly to draw.
    TM.svg.classList.toggle('lod', c.z < 1.15);
    const vb = `${(c.x - W / 2 / c.z).toFixed(1)} ${(c.y - H / 2 / c.z).toFixed(1)} ${(W / c.z).toFixed(1)} ${(H / c.z).toFixed(1)}`;
    TM.svg.setAttribute('viewBox', vb);
    TM.back.setAttribute('viewBox', vb);
    if (TM.glowSvg) TM.glowSvg.setAttribute('viewBox', vb);
  };
  // Keep the whole view inside the scenery: every corner of the screen must land on drawn land or sea.
  const VIEW = { i0: -OUT - 1, i1: N + OUT - 1, j0: -OUT - 1, j1: SHORE + 12 };
  TM.clamp = function () {
    const c = TM.cam, W = (TM.el && TM.el.clientWidth) || 800, H = (TM.el && TM.el.clientHeight) || 600;
    const span = Math.min(VIEW.i1 - VIEW.i0, VIEW.j1 - VIEW.j0);
    c.z = Math.max(0.45, (W / 64 + H / 32) / span * 1.02, Math.min(2.6, c.z));
    const d = (W / 64 + H / 32) / (2 * c.z); // how far the screen corners reach, in tiles along i and j
    let ci = (c.x / 32 + c.y / 16) / 2, cj = (c.y / 16 - c.x / 32) / 2;
    ci = Math.max(VIEW.i0 + d, Math.min(VIEW.i1 - d, ci)); cj = Math.max(VIEW.j0 + d, Math.min(VIEW.j1 - d, cj));
    c.x = 32 * (ci - cj); c.y = 16 * (ci + cj);
  };
  TM.pan = function (dx, dy) { TM.cam.x += dx; TM.cam.y += dy; TM.clamp(); TM.applyView(); };
  TM.zoomAt = function (px, py, f) {
    const c = TM.cam, W = TM.el.clientWidth, H = TM.el.clientHeight;
    const wx = c.x + (px - W / 2) / c.z, wy = c.y + (py - H / 2) / c.z;
    c.z *= f; TM.clamp();
    c.x = wx - (px - W / 2) / c.z; c.y = wy - (py - H / 2) / c.z; TM.clamp(); TM.applyView();
  };
  // Glide the view so a lot sits in the middle of the part of the map not covered from below (the phone bottom sheet).
  TM.reveal = function (lotId, cover) {
    const at = LOT_AT[lotId];
    if (!at || !TM.el) return;
    const [wx, wy] = P(at[0] + 1, at[1] + 1), c = TM.cam, H = TM.el.clientHeight, W = TM.el.clientWidth;
    const sy = (wy - c.y) * c.z + H / 2, sx = (wx - c.x) * c.z + W / 2;
    if (sy > 40 && sy < H - cover - 40 && sx > 30 && sx < W - 30) return; // already in sight
    const to = { x: wx, y: wy + cover / 2 / c.z }, from = { x: c.x, y: c.y }, t0 = performance.now();
    const step = (now) => {
      if (TM.tween !== step) return;
      const k = Math.min(1, (now - t0) / 350), e = 1 - Math.pow(1 - k, 3);
      c.x = from.x + (to.x - from.x) * e; c.y = from.y + (to.y - from.y) * e; TM.clamp(); TM.applyView();
      if (k < 1) requestAnimationFrame(step); else TM.tween = null;
    };
    TM.tween = step; requestAnimationFrame(step);
  };
  // Fit the whole town on first open.
  TM.fit = function () { const W = TM.el.clientWidth || 800, H = TM.el.clientHeight || 600; TM.cam = { x: 20, y: 400, z: Math.max(0.5, Math.min(1.4, Math.min(W / 1500, H / 900))) }; TM.clamp(); TM.applyView(); };
  TM.bind = function (el) {
    TM.el = el;
    let down = null, pinch = null;
    // Touch only: two fingers pinch to zoom around their midpoint (a mouse never has two pointers down).
    const pts = new Map();
    const pinchState = () => { const [a, b] = [...pts.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
    const lift = (e) => { pts.delete(e.pointerId); if (pts.size < 2 && pinch) { pinch = null; TM.pinchT = performance.now(); } };
    el.addEventListener('pointerdown', (e) => {
      TM.tween = null;
      if (e.pointerType === 'touch') {
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pts.size >= 2) { pinch = pinchState(); down = null; return; }
      }
      down = { x: e.clientX, y: e.clientY, cx: TM.cam.x, cy: TM.cam.y, drag: false };
    });
    window.addEventListener('pointermove', (e) => {
      if (pinch && pts.has(e.pointerId)) {
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const now = pinchState(), r = el.getBoundingClientRect();
        TM.pan((pinch.x - now.x) / TM.cam.z, (pinch.y - now.y) / TM.cam.z);
        TM.zoomAt(now.x - r.left, now.y - r.top, now.d / pinch.d);
        pinch = now;
        return;
      }
      if (!down) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!down.drag && Math.hypot(dx, dy) > 5) { down.drag = true; el.classList.add('dragging'); }
      if (down.drag) { TM.cam.x = down.cx - dx / TM.cam.z; TM.cam.y = down.cy - dy / TM.cam.z; TM.clamp(); TM.applyView(); }
    });
    window.addEventListener('pointerup', (e) => { lift(e); if (down) { TM.dragged = down.drag; el.classList.remove('dragging'); } down = null; });
    window.addEventListener('pointercancel', (e) => { lift(e); down = null; el.classList.remove('dragging'); });
    el.addEventListener('click', (e) => { if (TM.dragged || performance.now() - (TM.pinchT || 0) < 350) { TM.dragged = false; e.stopPropagation(); e.preventDefault(); } }, true);
    el.addEventListener('wheel', (e) => { e.preventDefault(); const r = el.getBoundingClientRect(); TM.zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.12 : 1 / 1.12); }, { passive: false });
    window.addEventListener('resize', () => { TM.clamp(); TM.applyView(); });
    // Guests walking the streets, on the pavements either side of each street's centre line.
    const rnd = rng(5);
    for (let k = 0; k < 44; k++) {
      const alongI = rnd() < 0.5, line = STEP * Math.floor(rnd() * (alongI ? 5 : 6)) + 0.5 + (rnd() < 0.5 ? -0.32 : 0.32);
      TM.walkers.push({ alongI, line, pos: rnd() * (alongI ? N - 1 : WATER - 0.5), dir: rnd() < 0.5 ? 1 : -1, v: 0.35 + rnd() * 0.3,
        col: ['#c0463a', '#2f6fa3', '#e3a92b', '#2f7d4f', '#8a58a8', '#3b2b22', '#ee8a33'][k % 7], night: k % 3 !== 0, el: null });
    }
  };
  // ----- Boats: fishing boats go out to sea and come back to the pier, sailboats cruise, a ferry crosses -----
  // route: waypoints [i, j, wait seconds]; the boat sails from one to the next and starts over (or turns back).
  const HULL = '<path d="M-18 -4 L18 -4 L13 5 L-14 5 Z" fill="COL" ' + INK + '/>';
  const BOAT_KINDS = {
    fish: (c) => `<path d="M7 -4 L7 -28 M7 -24 L-14 -6" stroke="#3b2b22" stroke-width="1.2"/>${HULL.replace('COL', c)}<rect x="-11" y="-14" width="10" height="10" fill="#fbfaf6" ${INK}/><rect x="-9" y="-12" width="3" height="3" class="win"/>`,
    sail: (c) => `<path d="M1 -5 L1 -40 L17 -9 Z" fill="#fbfaf6" ${INK}/><path d="M-1 -8 L-1 -32 L-13 -8 Z" fill="${c}" ${INK}/>${HULL.replace('COL', '#fbfaf6').replace('-18 -4 L18 -4 L13 5 L-14 5', '-15 -4 L16 -4 L11 4 L-11 4')}`,
    ferry: (c) => `<path d="M-30 -4 L30 -4 L24 7 L-26 7 Z" fill="${c}" ${INK}/><rect x="-22" y="-14" width="36" height="10" fill="#fbfaf6" ${INK}/>` +
      [-18, -10, -2, 6].map((x) => `<rect x="${x}" y="-12" width="5" height="4" class="win"/>`).join('') +
      `<rect x="-6" y="-24" width="8" height="10" fill="#c0463a" ${INK}/><circle class="smoke" cx="-2" cy="-30" r="4"/><circle class="smoke s2" cx="-6" cy="-36" r="5"/>`,
    row: (c) => `<path d="M-9 -2 L9 -2 L6 3 L-7 3 Z" fill="${c}" ${INK}/><circle cx="0" cy="-7" r="2.6" fill="#e9c9a8"/><rect x="-2.5" y="-5" width="5" height="4" fill="#2f6fa3"/><path d="M-12 1 L12 -5" stroke="#6b4529" stroke-width="1.2"/>`,
  };
  // Each boat keeps to its own stretch of open water, so routes never cross each other, the pier or the stone quay
  // (pier: i 6.2-7.8 up to j 25; quay: i 14.2-17.2 up to j 22).
  TM.boats = [
    { kind: 'fish', col: '#a3302a', v: 0.55, route: [[8.8, 22.9, 9], [9.8, 24.6], [12, 26.6, 12], [9.8, 24.6]] },
    { kind: 'fish', col: '#2f4a6b', v: 0.5, route: [[4.9, 23.5, 14], [3.6, 25.2], [2, 27.6, 10], [3.6, 25.2]], k: 2 },
    { kind: 'sail', col: '#e3a92b', v: 0.35, route: [[15.5, 24.9], [23.5, 24.9], [25, 27.3], [16.5, 27.3]] },
    { kind: 'sail', col: '#2f7d4f', v: 0.3, route: [[-8, 25.5], [-4, 26], [-3.5, 29], [-8, 29]], k: 1 },
    { kind: 'ferry', col: '#2f6fa3', v: 0.7, route: [[-12, 31.6, 4], [38, 31.6, 6]], k: 1 },
    { kind: 'row', col: '#c8a27a', v: 0.18, route: [[19, 23.1, 3], [23, 23.1, 5]] },
  ];
  for (const bt of TM.boats) { bt.k = bt.k || 0; [bt.i, bt.j] = bt.route[bt.k]; bt.wait = (bt.route[bt.k][2] || 0) * Math.random(); bt.flip = 1; bt.el = null; }
  // Every frame touches only what changed: a moved element, or the boats' order. Each DOM change makes the browser
  // restyle and repaint part of the town's big SVG.
  const setTf = (o, el, tf) => { if (o.tf !== tf || o.tfEl !== el) { el.setAttribute('transform', tf); o.tf = tf; o.tfEl = el; } };
  const show = (el, on) => { const d = on ? '' : 'none'; if (el.style.display !== d) el.style.display = d; };
  function tickBoats(dt) {
    let layer = TM.boatLayer;
    if (!layer || !TM.svg.contains(layer)) layer = TM.boatLayer = TM.svg.querySelector('#tm-boats');
    if (!layer) return;
    // Nearer boats (larger i + j) drawn last, so a boat in front covers the one behind it.
    const order = TM.boats.slice().sort((x, y) => x.i + x.j - (y.i + y.j));
    for (const bt of order) {
      if (!bt.el) {
        bt.el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        bt.el.innerHTML = `<path class="wake" d="M-22 4 q-10 -2 -22 1 M-22 6 q-8 3 -18 3" /><g class="boat">${BOAT_KINDS[bt.kind](bt.col)}</g>`;
        layer.appendChild(bt.el);
      }
      let moving = false;
      if (bt.wait > 0) bt.wait -= dt;
      else {
        const nk = (bt.k + 1) % bt.route.length, [ti, tj, w] = bt.route[nk], di = ti - bt.i, dj = tj - bt.j, d = Math.hypot(di, dj), step = bt.v * dt;
        if (d <= step) { bt.i = ti; bt.j = tj; bt.k = nk; bt.wait = w || 0; }
        else {
          bt.i += (di / d) * step; bt.j += (dj / d) * step; moving = step > 0;
          const sx = di - dj;
          if (Math.abs(sx) > 0.05) bt.flip = sx < 0 ? -1 : 1;
        }
      }
      const [x, y] = P(bt.i, bt.j);
      setTf(bt, bt.el, `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${1.3 * bt.flip},1.3)`);
      bt.el.classList.toggle('moving', moving);
    }
    if (order.some((bt, k) => layer.children[k] !== bt.el)) for (const bt of order) layer.appendChild(bt.el);
  }
  // ----- The train: now and then it comes in from the east, waits at the platform, and leaves again -----
  // A modern three-car multiple unit with a rounded nose at both ends, so it looks right whichever way it runs.
  const TJ0 = 9.32, TJ1 = 9.78, CAR = 1.3, CGAP = 0.07, NOSE = 0.5, TTOP = 19, TBOT = 3, TTIP = 4.5, PLATFORM = 21.2, FAR = TUN + 4.3;
  const BODY = '#f2f4f6', ACCENT = '#c0392b', ROOF = '#c9cfd5';
  const area = (q) => q.reduce((s, p, k) => { const r = q[(k + 1) % q.length]; return s + p[0] * r[1] - r[0] * p[1]; }, 0);
  function trainCar(noseA, noseB, panto) {
    // Profile samples along the car: u (along i), roof height z and side inset t (the nose narrows a little too).
    const S = [], n = 8;
    if (noseA) for (let k = 0; k <= n; k++) { const th = (k / n) * Math.PI / 2; S.push({ u: NOSE * (1 - Math.cos(th)), z: TTIP + (TTOP - TTIP) * Math.sin(th), t: 0.06 * (1 - Math.sin(th)) }); }
    else S.push({ u: 0, z: TTOP, t: 0 });
    if (noseB) for (let k = n; k >= 0; k--) { const th = (k / n) * Math.PI / 2; S.push({ u: CAR - NOSE * (1 - Math.cos(th)), z: TTIP + (TTOP - TTIP) * Math.sin(th), t: 0.06 * (1 - Math.sin(th)) }); }
    else S.push({ u: CAR, z: TTOP, t: 0 });
    const F = (p, z = p.z) => P(p.u, TJ1 - p.t, z), B = (p, z = p.z) => P(p.u, TJ0 + p.t, z);
    const first = S[0], last = S[S.length - 1];
    let s = '';
    // Under-frame and bogies.
    s += poly([P(0.1, TJ1 - 0.05, 0.5), P(CAR - 0.1, TJ1 - 0.05, 0.5), P(CAR - 0.1, TJ1 - 0.05, TBOT), P(0.1, TJ1 - 0.05, TBOT)], 'fill="#3b3b3b"');
    for (const u of [0.22, 0.42, CAR - 0.42, CAR - 0.22]) { const [x, y] = P(u, TJ1 - 0.02, 2); s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="#2a2a2a"/>`; }
    // The visible side.
    s += poly([...S.map((p) => F(p)), F(last, TBOT), F(first, TBOT)], `fill="${BODY}" ${INK}`);
    // Red stripe along the bottom, following the nose.
    s += poly([...S.map((p) => F(p, Math.min(7.5, p.z))), F(last, TBOT), F(first, TBOT)], `fill="${ACCENT}"`);
    s += poly([...S.map((p) => F(p, Math.max(8, Math.min(17, p.z - 1.2)))), ...S.slice().reverse().map((p) => F(p, Math.max(8, Math.min(16.2, p.z - 2))))], `fill="${ACCENT}" opacity="0.85"`);
    // Window band with pillars, and cab side windows that follow the curve of the nose.
    const wa = noseA ? NOSE + 0.06 : 0.08, wb = noseB ? CAR - NOSE - 0.06 : CAR - 0.08;
    s += poly([P(wa, TJ1, 9.5), P(wb, TJ1, 9.5), P(wb, TJ1, 14.5), P(wa, TJ1, 14.5)], `class="twin" ${INK}`);
    let d = '';
    for (let u = wa + 0.2; u < wb - 0.05; u += 0.2) d += `M${pt(P(u, TJ1, 9.5))} L${pt(P(u, TJ1, 14.5))} `;
    s += `<path d="${d}" stroke="${BODY}" stroke-width="1.6"/>`;
    for (const [on, lo, hi] of [[noseA, 0.1, NOSE], [noseB, CAR - NOSE, CAR - 0.1]]) {
      if (!on) continue;
      const pts = S.filter((p) => p.u >= lo && p.u <= hi && p.z - 1.8 > 10.5);
      if (pts.length > 1) s += poly([...pts.map((p) => F(p, Math.min(14.8, p.z - 1.8))), ...pts.slice().reverse().map((p) => F(p, 9.5))], `class="twin" ${INK}`);
    }
    // Doors, one near each end.
    for (const u of [noseA ? NOSE + 0.12 : 0.2, noseB ? CAR - NOSE - 0.24 : CAR - 0.32]) {
      s += poly([P(u, TJ1, TBOT + 0.5), P(u + 0.13, TJ1, TBOT + 0.5), P(u + 0.13, TJ1, 15.5), P(u, TJ1, 15.5)], `fill="#dfe4e8" stroke="#7f8a94" stroke-width="0.8"`);
      s += poly([P(u + 0.025, TJ1, 9.5), P(u + 0.105, TJ1, 9.5), P(u + 0.105, TJ1, 14), P(u + 0.025, TJ1, 14)], 'class="twin"');
    }
    // Flat end facing +i (towards the next car), with the gangway.
    if (!noseB) s += poly([P(CAR, TJ0, TBOT), P(CAR, TJ1, TBOT), P(CAR, TJ1, TTOP), P(CAR, TJ0, TTOP)], `fill="${shade(BODY, 0.8)}" ${INK}`) +
      poly([P(CAR, TJ0 + 0.12, TBOT + 1), P(CAR, TJ1 - 0.12, TBOT + 1), P(CAR, TJ1 - 0.12, TTOP - 2), P(CAR, TJ0 + 0.12, TTOP - 2)], 'fill="#4a4f55"');
    else s += poly([B(last, TBOT), F(last, TBOT), F(last), B(last)], `fill="${shade(ACCENT, 0.8)}" ${INK}`);
    // Roof and nose: strips between the two sides; only the ones facing the viewer are drawn.
    for (let k = 0; k < S.length - 1; k++) {
      const a = S[k], b = S[k + 1], q = [B(a), B(b), F(b), F(a)];
      if (area(q) <= 0 || b.u - a.u < 1e-6) continue;
      const zm = (a.z + b.z) / 2, flat = Math.abs(b.z - a.z) < 0.6;
      let col = flat ? ROOF : b.z < a.z ? shade(BODY, 0.86) : BODY, cls = '';
      if (!flat && zm > 10.5 && zm < 17) cls = 'class="twin" ';
      else if (!flat && zm <= 7.5) col = b.z < a.z ? shade(ACCENT, 0.85) : ACCENT;
      s += poly(q, `${cls}fill="${col}" stroke="${cls ? '#1d2630' : shade(col, 0.8)}" stroke-width="0.6"`);
    }
    // Headlights on the leading nose, a pantograph on the middle car.
    if (noseB) for (const jj of [TJ0 + 0.12, TJ1 - 0.12]) { const [x, y] = P(CAR - 0.03, jj, 6.5); s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="1.8" ry="1.3" class="thl"/>`; }
    if (panto) {
      const jm = (TJ0 + TJ1) / 2;
      s += poly([P(0.5, jm - 0.08, TTOP), P(0.75, jm - 0.08, TTOP), P(0.75, jm + 0.08, TTOP), P(0.5, jm + 0.08, TTOP)], 'fill="#5a5f66"');
      s += line([P(0.52, jm, TTOP), P(0.7, jm, TTOP + 6), P(0.58, jm, TTOP + 10)], 'stroke="#3b3b3b" stroke-width="1.2" fill="none"') + line([P(0.58, jm - 0.15, TTOP + 10), P(0.58, jm + 0.15, TTOP + 10)], 'stroke="#3b3b3b" stroke-width="1.6"');
    }
    return s;
  }
  const TRAIN_CARS = [[true, false, false], [false, false, true], [false, true, false]].map(([a, b, p], k) => ({ off: k * (CAR + CGAP), svg: trainCar(a, b, p) }));
  TM.train = { i: FAR, v: 0, phase: 'away', t: 6 + Math.random() * 10, els: null };
  function tickTrain(dt) {
    const tr = TM.train;
    if (!tr.els) tr.els = TRAIN_CARS.map((c) => { const e = document.createElementNS('http://www.w3.org/2000/svg', 'g'); e.innerHTML = `<g>${c.svg}</g>`; return e; });
    if (tr.phase === 'away') { if ((tr.t -= dt) <= 0) { tr.phase = 'in'; tr.i = FAR; tr.v = 2.2; } }
    else if (tr.phase === 'in') {
      tr.v = Math.max(0.25, Math.min(2.2, (tr.i - PLATFORM) * 0.45)); // slows down into the station
      tr.i -= tr.v * dt;
      if (tr.i <= PLATFORM) { tr.i = PLATFORM; tr.phase = 'stop'; tr.t = 12 + Math.random() * 8; }
    } else if (tr.phase === 'stop') { if ((tr.t -= dt) <= 0) { tr.phase = 'out'; tr.v = 0; } }
    else {
      tr.v = Math.min(2.2, tr.v + 0.5 * dt);
      tr.i += tr.v * dt;
      if (tr.i >= FAR) { tr.phase = 'away'; tr.t = 25 + Math.random() * 40; }
    }
    // Each car sits in the depth band of its far end, so the masts and houses around it overlap correctly.
    TRAIN_CARS.forEach((c, k) => {
      const e = tr.els[k], ci = tr.i + c.off;
      show(e, tr.phase !== 'away');
      setTf(c, e.firstChild, `translate(${(ci * TW / 2).toFixed(1)},${(ci * TH / 2).toFixed(1)})`);
      const band = TM.bandEls[bandOf(ci + CAR + 9.55)];
      if (e.parentNode !== band) band.appendChild(e);
    });
  }
  // Move the walkers: along their street, turning now and then at a crossing.
  TM.tick = function (dt, night) {
    if (!TM.svg) return;
    tickBoats(dt);
    tickTrain(dt);
    for (const w of TM.walkers) {
      if (!w.el) {
        w.el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        w.el.innerHTML = `<rect x="-2.6" y="-10" width="5.2" height="9" rx="2.4" fill="${w.col}"/><circle cy="-12.5" r="2.6" fill="#e9c9a8"/>`;
      }
      const max = w.alongI ? N - 0.5 : WATER - 0.4;
      const before = w.pos;
      w.pos += w.dir * w.v * dt;
      if (w.pos < 0.2 || w.pos > max) { w.dir *= -1; w.pos = Math.max(0.2, Math.min(max, w.pos)); }
      // At a crossing, sometimes turn onto the cross street.
      const cross = (Math.floor((before - 0.5) / STEP) !== Math.floor((w.pos - 0.5) / STEP)) ? STEP * Math.round((w.pos - 0.5) / STEP) + 0.5 : null;
      if (cross !== null && Math.random() < 0.3) {
        const p = w.line;
        w.alongI = !w.alongI; w.line = cross + (Math.random() < 0.5 ? -0.32 : 0.32); w.pos = Math.min(w.alongI ? N - 0.5 : WATER - 0.4, p); w.dir = Math.random() < 0.5 ? 1 : -1;
      }
      const [x, y] = w.alongI ? P(w.pos, w.line) : P(w.line, w.pos);
      setTf(w, w.el, `translate(${x.toFixed(1)},${y.toFixed(1)})`);
      const band = TM.bandEls[bandOf(w.alongI ? w.pos + w.line : w.line + w.pos)];
      if (w.el.parentNode !== band) band.appendChild(w.el);
      show(w.el, !(night && w.night));
    }
  };
  // A little note rising over a lot: money from a guest, an angry face for a guest who found the dish sold out.
  TM.float = function (ev) {
    if (!TM.svg || !LOT_AT[ev.lot]) return;
    const layer = TM.svg.querySelector('#tm-float'), [i, j] = LOT_AT[ev.lot], [x, y] = P(i + 1, j + 1, 0);
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    t.setAttribute('class', 'tm-floater ' + (ev.miss ? 'miss' : ev.rival ? 'rival' : 'pay'));
    // An SVG icon, then the text (if any), centred on cx together.
    const cx = x + (Math.random() - 0.5) * 30, cy = y - 50, [id, label, sz] = ev.miss ? ['ui_angry', 'sold out', 15] : ev.rival ? ['ui_cuisines', '', 15] : ['ui_money', `+${Math.round(ev.pay)}`, 15];
    const tw = label ? textW(label, '800 13px system-ui, sans-serif') + 3 : 0, x0 = cx - (sz + tw) / 2;
    t.innerHTML = svgIcon(id, x0, cy - sz + 3, sz) + (label ? `<text x="${(x0 + sz + 3).toFixed(1)}" y="${cy.toFixed(1)}" style="text-anchor:start">${esc(label)}</text>` : '');
    layer.appendChild(t);
    setTimeout(() => t.remove(), 1700);
  };
})();
