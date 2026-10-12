// Canvas renderer: terrain, buildings, placement ghost and floating text.
(function () {
  const TS = 32;
  const R = {
    TS, cam: { x: 0, y: 0, z: 1 }, canvas: null, ctx: null, terrain: null,
    ghost: null, hover: null, selected: null, floats: [], dpr: 1, flows: false,
  };
  window.Render = R;

  // Ground colours per season (0 spring, 1 summer, 2 autumn, 3 winter); the first shade is the base, the others are
  // soft patches. Tile types: 0 grass, 1 water, 2 forest, 3 rock, 4 sand. Trees, rocks and flowers are sprites (TREES).
  const PAL = [
    { grass: ['#82bb5c', '#7cb456', '#88c162'], water: '#3d84c2', rock: ['#9d978b', '#958f83', '#a49e92'], sand: ['#e4d293', '#dfcd8c'] },
    { grass: ['#7db35a', '#78ad55', '#83b960'], water: '#3d84c2', rock: ['#9d978b', '#958f83', '#a49e92'], sand: ['#e4d293', '#dfcd8c'] },
    { grass: ['#9fae5a', '#98a854', '#a7b562'], water: '#3a7cb5', rock: ['#9d978b', '#958f83', '#a49e92'], sand: ['#dfca8c', '#d9c486'] },
    { grass: ['#e8eef1', '#e1e8ec', '#eef3f5'], water: '#4c7ea8', rock: ['#b9bcbd', '#b1b4b6', '#c2c5c6'], sand: ['#e6e4dc', '#dedbd2'], ice: true },
  ];
  // The forest floor stays darker than open grass.
  const FLOOR = ['#649f4a', '#5f9a46', '#7f8f45', '#d5dde2'];
  function hash(x, y) { let h = x * 374761393 + y * 668265263; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

  R.init = function (canvas) {
    R.canvas = canvas;
    R.ctx = canvas.getContext('2d');
    R.resize();
    window.addEventListener('resize', R.resize);
    // The map area also changes size without a window resize (inspector opening/closing, town mode), so follow it directly;
    // otherwise a canvas sized while the inspector was open leaves a dark strip once it closes.
    if (window.ResizeObserver) new ResizeObserver(() => { if (canvas.parentElement.clientWidth) R.resize(); }).observe(canvas.parentElement);
  };
  R.resize = function () {
    const c = R.canvas, p = c.parentElement;
    R.dpr = window.devicePixelRatio || 1;
    c.width = p.clientWidth * R.dpr;
    c.height = p.clientHeight * R.dpr;
    c.style.width = p.clientWidth + 'px';
    c.style.height = p.clientHeight + 'px';
    R.clampCam();
  };
  R.viewW = () => R.canvas.width / R.dpr;
  R.viewH = () => R.canvas.height / R.dpr;

  // Terrain is drawn as vector shapes plus SVG sprites (assets/icons/terrain.js) into chunks of CH x CH tiles,
  // rasterised at the current zoom so it stays sharp. Chunks are cached per season and zoom step; while a new
  // zoom step is being drawn, the nearest cached step stands in. The map cross-fades when the season changes.
  const CH = 4, PAD = 2, MAX_PX = 48e6; // tiles per chunk, overlap in device px (hides seams), cache budget in pixels
  const TREES = [
    { oak: ['t_oak_spring', 't_oak_spring', 't_oak_bloom', 't_oak_bloom_white'], pine: 't_pine' },
    { oak: ['t_oak_summer'], pine: 't_pine' },
    { oak: ['t_oak_autumn_orange', 't_oak_autumn_red', 't_oak_autumn_yellow', 't_oak_autumn_green'], pine: 't_pine' },
    { oak: ['t_oak_winter'], pine: 't_pine_winter' },
  ];
  const SEASON = ['spring', 'summer', 'autumn', 'winter'];
  const SPRITES = ['t_pine', 't_pine_winter', 't_rock', 't_rock_winter', 't_pebbles', 't_flower_pink', 't_flower_white', 't_flower_yellow',
    't_leaf_orange', 't_leaf_red', 't_leaf_yellow', ...TREES.flatMap((t) => t.oak), ...SEASON.map((n) => 't_tuft_' + n)];
  const spritesReady = () => SPRITES.every((id) => iconImg(id));
  // Each sprite rasterised once per zoom level at the largest size it is drawn (28 world px), then copied
  // smaller, which is far cheaper than rasterising the SVG at every size.
  const spriteCache = new Map();
  function sprite(id, scale) {
    const s = Math.pow(2, Math.ceil(Math.log2(scale))), key = id + '@' + s; // power-of-two steps: few re-rasterisations
    let c = spriteCache.get(key);
    if (!c) {
      c = document.createElement('canvas');
      c.width = c.height = Math.ceil(28 * s);
      c.getContext('2d').drawImage(iconImg(id), 0, 0, c.width, c.height);
      spriteCache.set(key, c);
    }
    return c;
  }
  R.chunks = new Map(); // `${season}|${cx},${cy}` -> Map(scale -> { c, used, partial })
  R.buildTerrain = function () { R.chunks.clear(); spriteCache.clear(); hazes.clear(); R.fade = null; R.terrainSeason = null; };
  const tile = (x, y) => (x < 0 || y < 0 || x >= Game.W || y >= Game.H ? -1 : Game.S.tiles[y * Game.W + x]);
  // Opaque colour of the shallow band along the shore (white or ice over the water).
  function shallow(P) {
    const w = parseInt(P.water.slice(1), 16), [r, g, b, a] = P.ice ? [225, 240, 250, 0.55] : [255, 255, 255, 0.12];
    const mix = (c, sh) => Math.round(((w >> sh) & 255) * (1 - a) + c * a);
    return `rgb(${mix(r, 16)},${mix(g, 8)},${mix(b, 0)})`;
  }
  // Ground layers from the bottom up (water is drawn first); tile types: 0 grass, 1 water, 2 forest, 3 rock, 4 sand.
  const LAYERS = [
    null,
    { color: (P) => P.sand[0], patches: (P) => P.sand },
    { color: (P) => P.grass[0], patches: (P) => P.grass },
    { color: (P) => P.rock[0], patches: (P) => P.rock },
    { color: (P, si) => FLOOR[si] },
  ];
  const LAYER_OF = { [-1]: -1, 0: 2, 1: 0, 2: 4, 3: 3, 4: 1 };

  // Square of side w with its own radius per corner [top-left, top-right, bottom-right, bottom-left], added to a
  // context's current path or a Path2D. Built from plain arcs, which every browser draws the same way.
  function roundBox(p, x, y, w, [tl, tr, br, bl]) {
    p.moveTo(x + tl, y); p.lineTo(x + w - tr, y);
    if (tr) p.arc(x + w - tr, y + tr, tr, -Math.PI / 2, 0);
    p.lineTo(x + w, y + w - br);
    if (br) p.arc(x + w - br, y + w - br, br, 0, Math.PI / 2);
    p.lineTo(x + bl, y + w);
    if (bl) p.arc(x + bl, y + w - bl, bl, Math.PI / 2, Math.PI);
    p.lineTo(x, y + tl);
    if (tl) p.arc(x + tl, y + tl, tl, Math.PI, Math.PI * 1.5);
    p.closePath();
  }
  function drawChunk(g, si, cx, cy, withSprites, scale) {
    const P = PAL[si], SH = shallow(P), R0 = TS * 0.42;
    const tx0 = cx * CH - 1, ty0 = cy * CH - 1, tx1 = cx * CH + CH + 1, ty1 = cy * CH + CH + 1;
    // 1. deep water, then a band of shallow water (ice in winter) hugging the land
    g.save(); g.beginPath(); g.rect(0, 0, Game.W * TS, Game.H * TS); g.clip();
    g.fillStyle = P.water;
    for (let y = ty0; y < ty1; y++) for (let x = tx0; x < tx1; x++) if (tile(x, y) >= 0) g.fillRect(x * TS, y * TS, TS, TS);
    const BAND = TS * 0.24;
    g.fillStyle = SH; g.beginPath();
    for (let y = ty0 - 1; y < ty1 + 1; y++) for (let x = tx0 - 1; x < tx1 + 1; x++) {
      const t = tile(x, y);
      if (t >= 0 && t !== 1) roundBox(g, x * TS - BAND, y * TS - BAND, TS + 2 * BAND, [BAND, BAND, BAND, BAND]);
    }
    g.fill();
    // 2. land as nested layers: each layer covers every tile of its kind or a kind above it, so each kind is one
    //    smooth shape lying on the ones below. Outer corners are rounded, inner corners get a matching fillet.
    for (let k = 1; k < LAYERS.length; k++) {
      const L = LAYERS[k], up = (x, y) => LAYER_OF[tile(x, y)] >= k;
      // Beyond the map edge counts as the same as the tile itself, so the edge stays straight.
      const inSet = (x, y, rx, ry) => (tile(x, y) < 0 ? up(rx, ry) : up(x, y));
      const color = L.color(P, si);
      for (let y = ty0; y < ty1; y++) for (let x = tx0; x < tx1; x++) {
        if (tile(x, y) < 0) continue;
        const X = x * TS, Y = y * TS;
        const side = (dx, dy) => inSet(x + dx, y + dy, x, y);
        if (up(x, y)) {
          const r = (dx, dy) => (!side(dx, 0) && !side(0, dy) && !side(dx, dy) ? R0 : 0); // diagonal touch: joined by fillets instead
          const path = new Path2D();
          roundBox(path, X, Y, TS, [r(-1, -1), r(1, -1), r(1, 1), r(-1, 1)]);
          g.fillStyle = color; g.fill(path);
          // soft patches so open ground doesn't look like a checkerboard
          const sh = LAYER_OF[tile(x, y)] === k && L.patches && L.patches(P);
          if (sh) {
            g.save(); g.clip(path); g.globalAlpha = 0.6;
            for (let n = 0; n < 2; n++) {
              const h = hash(x * 5 + n, y * 3 - n), rr = 5 + h * 6;
              g.fillStyle = sh[1 + ((h * 7) | 0) % (sh.length - 1)];
              g.beginPath(); g.ellipse(X + rr + hash(y, x + n) * (TS - 2 * rr), Y + rr + hash(x + n, y * 7) * (TS - 2 * rr), rr, rr * 0.7, 0, 0, Math.PI * 2); g.fill();
            }
            g.restore();
          }
        } else {
          g.fillStyle = color;
          for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
            if (!side(dx, 0) || !side(0, dy)) continue;
            const CX = X + (dx > 0 ? TS : 0), CY = Y + (dy > 0 ? TS : 0);
            // the corner square minus a quarter circle centred inside the tile
            const ox = CX - dx * R0, oy = CY - dy * R0;
            g.beginPath(); g.moveTo(CX, CY); g.lineTo(ox, CY);
            g.arc(ox, oy, R0, dy > 0 ? Math.PI / 2 : -Math.PI / 2, dx > 0 ? 0 : Math.PI, dx * dy > 0); g.closePath(); g.fill();
          }
        }
      }
    }
    g.restore();
    if (!withSprites) return;
    // 3. sprites, sorted by their ground point so nearer ones overlap farther ones
    const T = TREES[si], list = [];
    const add = (id, x, y, size, rot = 0) => list.push({ id, x, y, size, rot });
    for (let y = ty0; y < ty1 + 1; y++) for (let x = tx0; x < tx1; x++) {
      const t = tile(x, y), h = hash(x, y), X = x * TS, Y = y * TS;
      if (t === 0) {
        if (h > 0.72) add('t_tuft_' + SEASON[si], X + 6 + h * 18, Y + 12 + hash(y, x * 3) * 16, 9 + h * 3);
        if (h > 0.9) add('t_tuft_' + SEASON[si], X + 22 - h * 10, Y + 26, 8);
        if (si === 0 && h < 0.22) for (let k = 0; k < 3; k++)
          add(['t_flower_pink', 't_flower_white', 't_flower_yellow'][(hash(x + k, y * 3) * 3) | 0], X + 5 + hash(x * 7, y + k) * 22, Y + 8 + hash(y * 5 + k, x) * 22, 6.5);
        if (si === 1 && h < 0.07) for (let k = 0; k < 2; k++) add('t_flower_yellow', X + 6 + hash(x * 7, y + k) * 20, Y + 8 + hash(y * 5 + k, x) * 20, 5.5);
        if (si === 2 && h < 0.3) for (let k = 0; k < 3; k++)
          add(['t_leaf_orange', 't_leaf_red', 't_leaf_yellow'][k], X + 4 + hash(x * 3 + k, y) * 24, Y + 6 + hash(y + k * 9, x) * 24, 6, hash(k, x + y) * 360);
      } else if (t === 2) {
        const n = 3 + (h > 0.6 ? 1 : 0);
        for (let k = 0; k < n; k++) {
          const hx = hash(x * 3 + k, y * 7 - k), hy = hash(y * 5 + k, x * 2 + k), hp = hash(x + k * 13, y - k);
          const isPine = hash(x * 17 + k, y * 13) < (si === 3 ? 0.5 : 0.35);
          const id = isPine ? T.pine : T.oak[(hp * T.oak.length) | 0];
          add(id, X + 5 + ((k % 2) * 0.5 + hx * 0.5) * 22, Y + 12 + (k / n) * 14 + hy * 6, 20 + hx * 7);
        }
      } else if (t === 3) {
        for (let k = 0; k < 3; k++) {
          const a = hash(x + k * 11, y - k * 5);
          add(si === 3 ? 't_rock_winter' : 't_rock', X + 7 + a * 18, Y + 12 + hash(y + k, x) * 18, 16 - k * 4);
        }
      } else if (t === 4 && h > 0.8) add('t_pebbles', X + 8 + h * 14, Y + 16 + hash(y, x) * 12, 9);
    }
    list.sort((p, q) => p.y - q.y);
    for (const d of list) {
      const im = sprite(d.id, scale), s = d.size;
      if (!d.rot) { g.drawImage(im, d.x - s / 2, d.y - s * 58 / 64, s, s); continue; }
      g.save(); g.translate(d.x, d.y - s * 0.4); g.rotate(d.rot * Math.PI / 180); g.drawImage(im, -s / 2, -s / 2, s, s); g.restore();
    }
  }
  function buildChunk(si, cx, cy, s) {
    // TS * s is a whole number, so tile edges land on whole pixels and don't leave hairline seams.
    const c = document.createElement('canvas');
    c.width = c.height = CH * TS * s + 2 * PAD;
    const g = c.getContext('2d'), ready = spritesReady();
    g.setTransform(s, 0, 0, s, PAD - cx * CH * TS * s, PAD - cy * CH * TS * s);
    drawChunk(g, si, cx, cy, ready, s);
    return { c, s, used: 0, partial: !ready };
  }
  // Zoom steps of half a device pixel per world pixel.
  const scaleStep = () => Math.min(12, Math.max(0.5, Math.ceil(R.cam.z * R.dpr * 2 - 0.05) / 2));
  let frame = 0;
  // Draws the visible chunks of season si. Builds missing chunks within a small time budget per frame; a chunk
  // with no cached version at all is built at once (at a coarse step if the budget is spent, refined later).
  // Leftover budget pre-builds the ring of chunks just outside the view, so panning and zooming out stay smooth.
  function chunkFor(si, cx, cy, s, t0, budget) {
    const key = si + '|' + cx + ',' + cy;
    let byScale = R.chunks.get(key);
    if (!byScale) R.chunks.set(key, (byScale = new Map()));
    let ch = byScale.get(s);
    if (!ch || ch.partial) {
      const any = [...byScale.values()].filter((v) => !v.partial).sort((a, b) => Math.abs(a.s - s) - Math.abs(b.s - s))[0];
      // A finer stand-in is slow to draw and a coarser chunk is cheap to build, so zooming out gets more budget.
      const fresh = performance.now() - t0 < (any && any.s > s * 1.4 ? budget * 2 : budget);
      if (fresh || !any) { const bs = fresh ? s : Math.min(s, 1); ch = byScale.get(bs) && !byScale.get(bs).partial ? byScale.get(bs) : buildChunk(si, cx, cy, bs); byScale.set(bs, ch); } else ch = any;
    }
    ch.used = frame;
    return ch;
  }
  // Sharp terrain is only needed on owned land and the strip where it fades into the haze (FADE tiles).
  function chunkNeeded(cx, cy) {
    const x0 = cx * CH - FADE - 1, y0 = cy * CH - FADE - 1, x1 = cx * CH + CH + FADE + 1, y1 = cy * CH + CH + FADE + 1;
    for (const k of Game.S.land) {
      const px = (k % Game.PLOTS) * Game.PW, py = Math.floor(k / Game.PLOTS) * Game.PH;
      if (x1 > px && x0 < px + Game.PW && y1 > py && y0 < py + Game.PH) return true;
    }
    return false;
  }
  function drawTerrain(g, si, x0, y0, x1, y1, budget) {
    const s = scaleStep(), t0 = performance.now();
    const c0 = Math.floor(x0 / CH), c1 = Math.floor((x1 - 1) / CH), r0 = Math.floor(y0 / CH), r1 = Math.floor((y1 - 1) / CH);
    for (let cy = r0; cy <= r1; cy++) for (let cx = c0; cx <= c1; cx++) {
      if (!chunkNeeded(cx, cy)) continue;
      const ch = chunkFor(si, cx, cy, s, t0, budget), p = PAD / ch.s;
      // Fading layers skip the overlap, which would otherwise show as lines where its alpha doubles.
      if (g.globalAlpha < 1) g.drawImage(ch.c, PAD, PAD, ch.c.width - 2 * PAD, ch.c.height - 2 * PAD, cx * CH * TS, cy * CH * TS, CH * TS, CH * TS);
      else g.drawImage(ch.c, cx * CH * TS - p, cy * CH * TS - p, CH * TS + 2 * p, CH * TS + 2 * p);
    }
    const mx = Math.ceil(Game.W / CH) - 1, my = Math.ceil(Game.H / CH) - 1;
    for (let cy = Math.max(0, r0 - 1); cy <= Math.min(my, r1 + 1); cy++) for (let cx = Math.max(0, c0 - 1); cx <= Math.min(mx, c1 + 1); cx++) {
      if (performance.now() - t0 >= budget) return;
      if ((cy < r0 || cy > r1 || cx < c0 || cx > c1) && chunkNeeded(cx, cy)) chunkFor(si, cx, cy, s, t0, budget);
    }
    // Then rasterise the sprites for the other zoom levels ahead of time, a few per frame.
    if (!spritesReady()) return;
    for (const lv of [0.5, 1, 2, 4, 8, 16]) for (const id of SPRITES) {
      if (performance.now() - t0 >= budget) return;
      if (!spriteCache.has(id + '@' + lv)) sprite(id, lv);
    }
  }
  // Drops the least recently drawn chunks once the cache holds more than MAX_PX pixels.
  function trimChunks() {
    let px = 0;
    const all = [];
    for (const [key, byScale] of R.chunks) for (const [s, ch] of byScale) { px += ch.c.width * ch.c.height; all.push([key, s, ch]); }
    if (px <= MAX_PX) return;
    all.sort((a, b) => a[2].used - b[2].used);
    for (const [key, s, ch] of all) {
      if (px <= MAX_PX * 0.75 || ch.used === frame) break;
      R.chunks.get(key).delete(s); px -= ch.c.width * ch.c.height;
    }
  }
  function currentSeason(dt) {
    const si = Game.seasonIndex();
    if (R.terrainSeason !== si) {
      if (R.terrainSeason !== null) R.fade = { from: R.terrainSeason, a: 1 };
      R.terrainSeason = si;
    }
    if (R.fade) { R.fade.a -= dt / 2.5; if (R.fade.a <= 0) R.fade = null; }
    return si;
  }

  // ---------- Land beyond the farm ----------
  // Land the farm doesn't own is drawn from one low-resolution, blurred and misted picture of the whole world
  // (HZ px per tile, with a MARGIN of fog around it), laid over the sharp terrain. Its alpha is 0 on owned plots and
  // rises over FADE tiles outside them, so the farm's edge melts into the haze instead of ending in a hard line.
  // Rebuilt when the season changes or land is bought.
  const HZ = 3, MARGIN = 16, FADE = 6, EDGE = 3, FOG = [222, 229, 226];
  const HAZE_TREE = [['#3f7d36', '#d98fa6', '#f2f2ea'], ['#3a7432', '#46803a'], ['#c9772f', '#b8452c', '#d9a93a', '#6d8a3a'], ['#8d9a94', '#5f7a66']];
  const hazes = new Map(); // season -> { c, ver }
  function buildHaze(si) {
    const P = PAL[si], W = Game.W, H = Game.H, cw = (W + 2 * MARGIN) * HZ, chh = (H + 2 * MARGIN) * HZ;
    const base = document.createElement('canvas'); base.width = cw; base.height = chh;
    const b = base.getContext('2d');
    b.fillStyle = `rgb(${FOG})`; b.fillRect(0, 0, cw, chh);
    const COL = [P.grass[0], P.water, FLOOR[si], P.rock[0], P.sand[0]], trees = HAZE_TREE[si];
    // One path per colour: far fewer canvas calls than a fill per tile.
    const paths = new Map(), rect = (col, x, y, w, h) => { let p = paths.get(col); if (!p) paths.set(col, (p = new Path2D())); p.rect(x, y, w, h); };
    // Beyond the world's edge the land is mirrored, so the edge fades into country that seems to go on into the fog.
    const mir = (v, n) => (v < 0 ? -v - 1 : v >= n ? 2 * n - v - 1 : v);
    for (let y = -MARGIN; y < H + MARGIN; y++) for (let x = -MARGIN; x < W + MARGIN; x++) {
      const t = Game.S.tiles[mir(y, H) * W + mir(x, W)], X = (x + MARGIN) * HZ, Y = (y + MARGIN) * HZ;
      if (t === 2) rect(trees[(hash(x, y) * trees.length) | 0], X, Y, HZ, HZ);
      else if (t === 0 && hash(y, x) > 0.8) rect(P.grass[1], X, Y, HZ, HZ);
      else rect(COL[t], X, Y, HZ, HZ);
      if (t === 3 && hash(x, y) > 0.4) rect('#7d776c', X + 1, Y + 1, 1, 1);
    }
    for (const [col, p] of paths) { b.fillStyle = col; b.fill(p); }
    // Blur: a canvas filter where the browser has one, else down- and up-scaling (bilinear) does much the same.
    const c = document.createElement('canvas'); c.width = cw; c.height = chh;
    const g = c.getContext('2d');
    if ('filter' in g) { g.filter = `blur(${HZ * 1.8}px)`; g.drawImage(base, 0, 0); g.filter = 'none'; }
    else {
      const sm = document.createElement('canvas'); sm.width = Math.ceil(cw / 6); sm.height = Math.ceil(chh / 6);
      sm.getContext('2d').drawImage(base, 0, 0, sm.width, sm.height);
      g.drawImage(sm, 0, 0, cw, chh);
    }
    // Mist and the fade mask, per pixel.
    const img = g.getImageData(0, 0, cw, chh), d = img.data;
    const rects = Game.S.land.map((k) => [(k % Game.PLOTS) * Game.PW, Math.floor(k / Game.PLOTS) * Game.PH]);
    const sm = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
    for (let py = 0; py < chh; py++) {
      const ty = (py + 0.5) / HZ - MARGIN;
      for (let px = 0; px < cw; px++) {
        const tx = (px + 0.5) / HZ - MARGIN;
        // distance to the farm from the nearest point inside the world, so mist doesn't jump at the world's edge
        const qx = Math.min(W, Math.max(0, tx)), qy = Math.min(H, Math.max(0, ty));
        let dist = 1e9;
        for (const [rx, ry] of rects) {
          const dx = Math.max(rx - qx, 0, qx - rx - Game.PW), dy = Math.max(ry - qy, 0, qy - ry - Game.PH);
          const dd = dx * dx + dy * dy;
          if (dd < dist) dist = dd;
        }
        const o = (py * cw + px) * 4;
        // Owned land is clear, except for its last EDGE tiles before the world's edge, which melt into the fog
        // beyond it (fully opaque past the edge, where no sharp terrain lies below).
        const out = Math.max(-tx, tx - W, -ty, ty - H), edge = sm((out + EDGE) / (EDGE - 0.75)); // fully hazed just before the edge, where the sharp terrain stops
        if (dist === 0 && edge === 0) { d[o + 3] = 0; continue; }
        dist = Math.sqrt(dist);
        const fade = dist > 0 ? 0.22 + 0.78 * sm(dist / FADE) : 0;
        // mist thickens away from the farm, and beyond the world's edge it thickens into fog
        const fog = Math.max(dist > 0 ? 0.28 + 0.22 * sm(dist / 40) : 0.1, 0.1 + 0.9 * sm(out / (MARGIN - 2)));
        const r = d[o], gg = d[o + 1], bb = d[o + 2], grey = (r + gg + bb) / 3;
        d[o] = (r * 0.8 + grey * 0.2) * (1 - fog) + FOG[0] * fog;
        d[o + 1] = (gg * 0.8 + grey * 0.2) * (1 - fog) + FOG[1] * fog;
        d[o + 2] = (bb * 0.8 + grey * 0.2) * (1 - fog) + FOG[2] * fog;
        d[o + 3] = 255 * Math.max(fade, edge);
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }
  function haze(si) {
    let h = hazes.get(si);
    if (!h || h.ver !== Game.landVer) { h = { c: buildHaze(si), ver: Game.landVer }; hazes.set(si, h); }
    return h.c;
  }
  function drawHaze(g, si) {
    g.drawImage(haze(si), -MARGIN * TS, -MARGIN * TS, (Game.W + 2 * MARGIN) * TS, (Game.H + 2 * MARGIN) * TS);
  }
  // "Buy this land" signs on the plots next to the farm, in screen space; R.signs keeps them for clicks.
  R.signs = [];
  function drawSigns(g) {
    R.signs = [];
    if (R.ghost || R.blueprint) return;
    const z = R.cam.z, cost = Game.landCost(), money = Game.S.money;
    const label = `Buy this land  ${cost.toLocaleString('en')}`;
    g.font = '600 13px system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
    const tw = g.measureText(label).width, w = tw + 44, h = 30;
    const N = Game.PLOTS, IN = 7; // tiles in from the farm's edge
    for (let k = 0; k < N * N; k++) {
      if (!Game.plotBuyable(k)) continue;
      // The sign stands just across the farm's edge, in the middle of the side the plot shares with it.
      const px = k % N, py = Math.floor(k / N);
      const [dx, dy] = [[-1, 0], [1, 0], [0, -1], [0, 1]].find(([ox, oy]) => px + ox >= 0 && px + ox < N && py + oy >= 0 && py + oy < N && Game.plotOwned(k + ox + oy * N));
      const tx = dx ? (dx < 0 ? px * Game.PW + IN : (px + 1) * Game.PW - IN) : (px + 0.5) * Game.PW;
      const ty = dy ? (dy < 0 ? py * Game.PH + IN * 0.7 : (py + 1) * Game.PH - IN * 0.7) : (py + 0.5) * Game.PH;
      const cx = (tx * TS - R.cam.x) * z, cy = (ty * TS - R.cam.y) * z;
      const x = cx - w / 2, y = cy - h / 2;
      if (x > R.viewW() || y > R.viewH() || x + w < 0 || y + h < 0) continue;
      const hov = R.mouse && R.mouse.x >= x && R.mouse.x <= x + w && R.mouse.y >= y && R.mouse.y <= y + h;
      g.fillStyle = hov ? 'rgba(255,250,235,0.98)' : 'rgba(255,250,235,0.9)';
      g.strokeStyle = money >= cost ? 'rgba(90,70,30,0.55)' : 'rgba(170,60,50,0.6)'; g.lineWidth = hov ? 2 : 1;
      g.beginPath(); g.moveTo(x + 15, y); g.arcTo(x + w, y, x + w, y + h, 15); g.arcTo(x + w, y + h, x, y + h, 15); g.arcTo(x, y + h, x, y, 15); g.arcTo(x, y, x + w, y, 15); g.closePath();
      g.fill(); g.stroke();
      drawIcon(g, 'ui_money', x + 18, cy, 18, '💰');
      g.fillStyle = money >= cost ? '#4a3a1a' : '#a33b30'; g.fillText(label, x + 32, cy + 0.5);
      R.signs.push({ k, x, y, w, h });
    }
  }
  R.signAt = (px, py) => R.signs.find((s) => px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h);

  R.centerOn = function (tx, ty) {
    R.cam.x = tx * TS - R.viewW() / 2 / R.cam.z;
    R.cam.y = ty * TS - R.viewH() / 2 / R.cam.z;
    R.clampCam();
  };
  R.clampCam = function () {
    if (!Game.S) return;
    const ww = Game.W * TS, wh = Game.H * TS;
    const vw = R.viewW() / R.cam.z, vh = R.viewH() / R.cam.z;
    const m = 8 * TS; // a glimpse of the fog beyond the world's edge
    R.cam.x = vw >= ww ? (ww - vw) / 2 : Math.max(-m, Math.min(ww - vw + m, R.cam.x));
    R.cam.y = vh >= wh ? (wh - vh) / 2 : Math.max(-m, Math.min(wh - vh + m, R.cam.y));
  };
  R.MAX_Z = 5; // closest zoom (world px per screen px)
  R.zoomAt = function (px, py, factor) {
    const z0 = R.cam.z, z1 = Math.max(0.25, Math.min(R.MAX_Z, z0 * factor));
    const wx = R.cam.x + px / z0, wy = R.cam.y + py / z0;
    R.cam.z = z1;
    R.cam.x = wx - px / z1; R.cam.y = wy - py / z1;
    R.clampCam();
  };
  R.screenToTile = (px, py) => ({ x: Math.floor((R.cam.x + px / R.cam.z) / TS), y: Math.floor((R.cam.y + py / R.cam.z) / TS) });

  R.addFloat = function (b, text, icon) {
    const [w] = FS.buildings[b.type].size;
    if (R.floats.length > 60) R.floats.shift();
    R.floats.push({ x: (b.x + w / 2) * TS, y: b.y * TS, text, icon, t: 0 });
  };

  function emojiFont(px) { return `${px}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; }

  // SVG icons (assets/icons.js) drawn as cached images; the emoji is only a fallback while an image loads.
  const imgs = {};
  function iconImg(id) {
    let im = imgs[id];
    if (!im) {
      im = imgs[id] = new Image();
      if (window.FSI && FSI.has(id)) im.src = FSI.dataURL(id);
    }
    return im.complete && im.naturalWidth ? im : null;
  }
  function drawIcon(g, id, cx, cy, size, fallback) {
    const im = iconImg(id);
    if (im) return g.drawImage(im, cx - size / 2, cy - size / 2, size, size);
    if (!fallback) return;
    g.fillStyle = '#000'; g.font = emojiFont(size * 0.85); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(fallback, cx, cy);
  }

  // A blueprint being placed: its buildings as green (fits) or red (blocked) ghosts, dashed lines between the ones
  // that trade goods, and each one's product in a badge.
  function drawBlueprint(g) {
    const bp = R.blueprint;
    if (bp.ax == null) return;
    const ctr = (it) => { const [w, h] = FS.buildings[it.type].size; return [(it.x + w / 2) * TS, (it.y + h / 2) * TS]; };
    g.setLineDash([5, 4]); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,0.7)';
    for (const [a, b] of bp.links) {
      const [x1, y1] = ctr(bp.items[a]), [x2, y2] = ctr(bp.items[b]);
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    }
    g.setLineDash(bp.pinned ? [] : [4, 3]);
    bp.items.forEach((it, k) => {
      const bt = FS.buildings[it.type], [w, h] = bt.size, x = it.x * TS, y = it.y * TS;
      const hot = bp.drag === k;
      g.fillStyle = it.err ? 'rgba(220,60,50,0.55)' : hot ? 'rgba(120,235,130,0.6)' : 'rgba(80,220,90,0.42)';
      g.fillRect(x, y, w * TS, h * TS);
      g.strokeStyle = it.err ? 'rgba(160,25,20,0.95)' : 'rgba(255,255,255,0.9)'; g.lineWidth = hot ? 2.5 : 1.5;
      g.strokeRect(x + 1, y + 1, w * TS - 2, h * TS - 2);
      g.globalAlpha = 0.85;
      drawIcon(g, 'b_' + it.type, x + (w * TS) / 2, y + (h * TS) / 2, Math.min(w, h) * TS * 0.66, bt.icon);
      const out = FS.recipeById[it.rid].primary, bx = x + w * TS - 8, by = y + h * TS - 8;
      g.globalAlpha = 1;
      g.fillStyle = 'rgba(255,250,235,0.95)'; g.beginPath(); g.arc(bx, by, 8, 0, Math.PI * 2); g.fill();
      drawIcon(g, out, bx, by, 13, FS.items[out].emoji);
    });
    g.setLineDash([]);
  }

  // ---------- Little animations ----------
  // R.t is an animation clock that stops while the game is paused.
  R.t = 0;
  const SMOKY = { Processing: true, Cooking: true };
  const ANIMAL_B = { pasture: 3, pigsty: 2, coop: 2 };
  // Which animal walks around, from what the building makes.
  const ANIMAL_OF = { cow_milk: 'cattle', water_buffalo_milk: 'cattle', sheep_milk: 'sheep', goat_milk: 'goat', chicken_egg: 'broiler_chicken', duck_egg: 'duck' };
  const ANIMAL_DEFAULT = { pasture: 'cattle', pigsty: 'pig', coop: 'broiler_chicken' };
  const animalOf = (b, r) => ANIMAL_OF[r.primary] || (FS.items[r.primary] && FSI.has(r.primary) && ['cattle', 'calf', 'sheep', 'goat', 'pig', 'broiler_chicken', 'duck', 'turkey', 'goose', 'rabbit'].includes(r.primary) ? r.primary : ANIMAL_DEFAULT[b.type]);
  // Animal buildings on screen, for the farmyard sounds: which animal, and where (0..1 across the screen).
  R.visibleAnimals = function () {
    const vw = R.viewW() / R.cam.z, vh = R.viewH() / R.cam.z, out = [];
    for (const b of Game.S.buildings) {
      const r = ANIMAL_B[b.type] && FS.recipeById[b.recipe];
      if (!r) continue;
      const [w, h] = FS.buildings[b.type].size || [1, 1];
      const cx = (b.x + w / 2) * TS - R.cam.x, cy = (b.y + h / 2) * TS - R.cam.y;
      if (cx < 0 || cy < 0 || cx > vw || cy > vh) continue;
      out.push({ animal: animalOf(b, r), sx: cx / vw });
    }
    return out;
  };
  function drawAnimals(g, b, r, x, y, pw, ph) {
    const id = animalOf(b, r);
    const n = ANIMAL_B[b.type], size = b.type === 'coop' ? 11 : 14;
    for (let k = 0; k < n; k++) {
      const sp = 0.25 + hash(b.id, k) * 0.2, ph0 = hash(k, b.id) * 6.28;
      const u = 0.5 + 0.5 * Math.sin(R.t * sp + ph0);
      const ax = x + 6 + size / 2 + (pw - 12 - size) * u;
      const ay = y + ph - 10 - (k % 2) * (ph > TS ? 9 : 4) + Math.abs(Math.sin(R.t * 4 + k)) * -1;
      const dir = Math.cos(R.t * sp + ph0) >= 0 ? 1 : -1;
      g.save(); g.translate(ax, ay); g.scale(-dir, 1);
      drawIcon(g, id, 0, 0, size);
      g.restore();
    }
  }
  function drawSmoke(g, b, sx, sy) {
    for (let k = 0; k < 3; k++) {
      const f = (R.t * 0.5 + k / 3 + hash(b.id, 3) ) % 1;
      g.fillStyle = `rgba(150,150,155,${0.6 * (1 - f)})`;
      g.beginPath(); g.arc(sx + Math.sin((f + k) * 4) * 3 + f * 6, sy - f * 18, 2.5 + f * 4, 0, Math.PI * 2); g.fill();
    }
  }

  // ---------- Weather ----------
  // Screen-space particles and tints for the current weather; tints only with reduced motion.
  const STILL = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TINT = { rain: 'rgba(40,60,90,0.12)', storm: 'rgba(20,30,55,0.28)', drought: 'rgba(255,190,80,0.10)', frost: 'rgba(170,210,255,0.16)', snow: 'rgba(220,230,240,0.08)' };
  let parts = [], partKind = null, flash = 0;
  function weatherKind() {
    const k = (Game.S.weather || {}).kind || 'sunny', si = Game.seasonIndex();
    if (k === 'snow' || (k === 'storm' && si === 3)) return 'snow';
    if (k === 'rain' || k === 'storm') return 'rain';
    if (si === 2 && k === 'sunny') return 'leaves';
    if (si === 0 && k === 'sunny') return 'petals';
    return null;
  }
  // Also used by the Town (R.weather on its own canvas), so the same weather shows there.
  function drawWeather(g, dt, W = R.viewW(), H = R.viewH()) {
    const S = Game.S, k = (S.weather || {}).kind;
    if (TINT[k]) { g.fillStyle = TINT[k]; g.fillRect(0, 0, W, H); }
    if (STILL) return;
    const pk = weatherKind();
    if (pk !== partKind) {
      partKind = pk;
      const n = { rain: k === 'storm' ? 260 : 150, snow: k === 'storm' ? 220 : 120, leaves: 26, petals: 30 }[pk] || 0;
      parts = Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), s: 0.6 + Math.random() * 0.8, p: Math.random() * 6.28 }));
    }
    const storm = k === 'storm';
    for (const q of parts) {
      if (pk === 'rain') {
        q.y += dt * (storm ? 1.6 : 1.1) * q.s; q.x += dt * (storm ? 0.35 : 0.12);
        const px = q.x * W, py = q.y * H;
        g.strokeStyle = 'rgba(200,220,245,0.55)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(px, py); g.lineTo(px - (storm ? 7 : 3), py - 12 * q.s); g.stroke();
      } else if (pk === 'snow') {
        q.y += dt * 0.08 * q.s * (storm ? 2.5 : 1); q.x += dt * (Math.sin(q.p + q.y * 8) * 0.02 + (storm ? 0.12 : 0));
        g.fillStyle = 'rgba(255,255,255,0.9)';
        g.beginPath(); g.arc(q.x * W, q.y * H, 1.2 + q.s * 1.4, 0, Math.PI * 2); g.fill();
      } else {
        q.y += dt * 0.05 * q.s; q.x += dt * (0.03 + Math.sin(q.p + q.y * 10) * 0.03);
        g.save(); g.translate(q.x * W, q.y * H); g.rotate(q.p + q.y * 12);
        g.fillStyle = pk === 'leaves' ? (q.s > 1 ? '#d98a2b' : '#c4602a') : (q.s > 1 ? '#f6c6d8' : '#ffffff');
        g.beginPath(); g.ellipse(0, 0, pk === 'leaves' ? 4 : 2.6, pk === 'leaves' ? 2 : 1.6, 0, 0, Math.PI * 2); g.fill();
        g.restore();
      }
      if (q.y > 1.02) { q.y = -0.02; q.x = Math.random(); }
      if (q.x > 1.02) q.x = -0.02;
    }
    if (storm) {
      // Lightning: a bright flash is a close strike with a sharp crack, a dim one a distant rumble. The thunder starts with the flash.
      if (flash <= 0 && Math.random() < dt * 0.06) {
        const close = Math.random() < 0.3;
        flash = close ? 0.45 : 0.28;
        if (window.SFX) SFX.thunder(close);
      }
      if (flash > 0) { g.fillStyle = `rgba(255,255,255,${flash})`; g.fillRect(0, 0, W, H); flash -= dt * 1.4; }
    }
  }
  R.weather = drawWeather;

  // How well the farm supplies a building: total production of each input across all buildings
  // against what all its users need (Game.rates, capacity per minute). The scarcest input counts;
  // a building with no inputs is always covered. Refreshed twice a second, not every frame.
  let cover = null, coverAt = -1;
  function coverage(r, now) {
    if (!cover || now - coverAt > 500) { cover = Game.rates(); coverAt = now; }
    let c = Infinity;
    for (const i in r.inputs) {
      const used = cover.used[i] || 0;
      if (used > 0) c = Math.min(c, (cover.made[i] || 0) / used);
    }
    return c;
  }
  const BAR = { good: '#5cc85a', short: '#ffd34d', low: '#e8513f', full: '#a5652a', frost: '#d8eefa' };
  // Out of season (too cold to grow): the whole building frosts over instead of showing an icon.
  const frozen = (b) => b.cold && (b.status === 'season' || (b.running && b.mult === 0));
  // Green: inputs covered (≥ 100% of what is needed). Yellow: 50–99%. Red: under 50%.
  // Brown and full: storage full. Icy and full: out of season. Pulsing: waiting for inputs. No bar when idle, paused, out of season or out of money.
  function barState(b, r) {
    const now = performance.now();
    if (b.status === 'full' && !b.running) return { color: BAR.full, full: true };
    if (frozen(b)) return { color: BAR.frost, full: true, frost: true };
    const wait = !b.running && (b.status === 'missing' || b.status === 'yield');
    if (!b.running && !wait) return null;
    const c = coverage(r, now);
    return { color: c >= 0.999 ? BAR.good : c >= 0.5 ? BAR.short : BAR.low, wait };
  }

  // A building that can only make one thing (a well draws water) needs no product badge.
  const single = {};
  const onlyOne = (type) => {
    if (single[type] === undefined) single[type] = Object.keys(FS.recipeById).filter((id) => id.startsWith(type + ':')).length === 1;
    return single[type];
  };

  const badgeR = (h) => (h >= 2 ? 14 : 11); // product / ? badge radius by building height
  function drawQuestion(g, cx, cy, rad) {
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.arc(cx, cy, rad, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#5a4632'; g.font = `bold ${Math.round(rad * 1.5)}px system-ui, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', cx, cy + rad * 0.08);
  }
  function roundRect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  // Two white bars with a dark outline, no background, sized to the building (1x1 tiles too).
  function drawPause(g, cx, cy, s) {
    const h = Math.min(22, s * 0.48), w = h * 0.32, gap = h * 0.22;
    g.fillStyle = '#fff'; g.strokeStyle = '#2b2118'; g.lineWidth = Math.max(1.5, h / 12); g.lineJoin = 'round';
    for (const dx of [-gap / 2 - w, gap / 2]) { roundRect(g, cx + dx, cy - h / 2, w, h, w * 0.25); g.fill(); g.stroke(); }
  }
  // Two coins crossed out in red: not enough money to start the next batch.
  function drawBroke(g, cx, cy, s) {
    const rad = Math.min(8, s * 0.17), lw = Math.max(1.2, rad / 6), k = rad * 1.6;
    // The red cross goes behind the coins so they stay readable as coins.
    g.lineCap = 'round';
    g.strokeStyle = '#2b2118'; g.lineWidth = lw * 3.6;
    g.beginPath(); g.moveTo(cx - k, cy - k); g.lineTo(cx + k, cy + k); g.moveTo(cx + k, cy - k); g.lineTo(cx - k, cy + k); g.stroke();
    g.strokeStyle = '#e8402f'; g.lineWidth = lw * 2;
    g.beginPath(); g.moveTo(cx - k, cy - k); g.lineTo(cx + k, cy + k); g.moveTo(cx + k, cy - k); g.lineTo(cx - k, cy + k); g.stroke();
    g.lineCap = 'butt';
    for (const [dx, dy] of [[-rad * 0.55, rad * 0.25], [rad * 0.55, -rad * 0.25]]) {
      g.fillStyle = '#f2c230'; g.strokeStyle = '#2b2118'; g.lineWidth = lw;
      g.beginPath(); g.arc(cx + dx, cy + dy, rad, 0, Math.PI * 2); g.fill(); g.stroke();
      g.strokeStyle = '#b8860b'; g.beginPath(); g.arc(cx + dx, cy + dy, rad * 0.62, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(cx + dx - rad * 0.35, cy + dy - rad * 0.35, rad * 0.18, 0, Math.PI * 2); g.fill(); // shine
    }
  }

  function drawBuilding(g, b, now) {
    const bt = FS.buildings[b.type];
    const [w, h] = bt.size;
    const x = b.x * TS, y = b.y * TS, pw = w * TS, ph = h * TS;
    const r = FS.recipeById[b.recipe];
    const prog = r && b.running ? Math.min(1, b.progress / r.time) : 0;
    if (b.type === 'field') {
      g.fillStyle = '#7a5631'; g.fillRect(x + 1, y + 1, pw - 2, ph - 2);
      g.fillStyle = '#6a4826';
      for (let k = 0; k < 4; k++) g.fillRect(x + 3, y + 5 + k * 7, pw - 6, 2);
      if (R.terrainSeason === 3 && !(b.running && b.mult > 0)) { // snow lies in the furrows
        g.fillStyle = 'rgba(240,245,248,0.85)';
        for (let k = 0; k < 4; k++) g.fillRect(x + 3, y + 3 + k * 7, pw - 6, 2);
      }
      if (r) {
        g.fillStyle = `rgba(${120 - prog * 40},${150 + prog * 60},${60},${0.25 + prog * 0.6})`;
        for (let k = 0; k < 4; k++) g.fillRect(x + 3, y + 3 + k * 7, (pw - 6) * Math.max(0.15, prog), 4);
        // The crop shows from planting on, faint while it is young.
        g.globalAlpha = 0.55 + 0.45 * Math.min(1, prog / 0.45);
        drawIcon(g, r.primary, x + pw / 2, y + ph / 2, 12 + prog * 14, FS.items[r.primary].emoji);
        g.globalAlpha = 1;
      }
      if (frozen(b)) { g.fillStyle = 'rgba(215,236,250,0.45)'; g.fillRect(x + 1, y + 1, pw - 2, ph - 2); }
    } else {
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x + 4, y + 5, pw - 5, ph - 5);
      g.fillStyle = bt.color; g.fillRect(x + 2, y + 2, pw - 4, ph - 4);
      // roof stripe
      g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x + 2, y + 2, pw - 4, Math.min(8, ph / 4));
      g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1; g.strokeRect(x + 2.5, y + 2.5, pw - 5, ph - 5);
      // The building itself, with what it is making in a small round badge (a dairy pasture shows cows, not milk).
      // Working buildings breathe gently; stopped ones are dimmed so a glance shows what runs.
      const live = (b.running && b.mult !== 0) || (b.type === 'academy' && !b.paused && Game.academyBusy());
      const bob = live ? 1 + Math.sin(R.t * 3 + b.id) * 0.025 : 1;
      // 1x1 buildings that can make several things show the product big like a field crop, growing with the batch,
      // over a faded building so the kind of building still shows.
      const tile1 = r && w === 1 && h === 1 && !onlyOne(b.type);
      if (tile1) g.globalAlpha *= 0.55;
      drawIcon(g, 'b_' + b.type, x + pw / 2, y + ph / 2 + 1, Math.min(pw, ph) * (tile1 ? 0.9 : 0.8) * bob, bt.icon);
      if (tile1) {
        g.globalAlpha /= 0.55;
        const a0 = g.globalAlpha;
        g.globalAlpha *= 0.6 + 0.4 * Math.min(1, prog / 0.45);
        drawIcon(g, r.primary, x + pw / 2, y + ph / 2, 14 + prog * 10, FS.items[r.primary].emoji);
        g.globalAlpha = a0;
      }
      if (r && ANIMAL_B[b.type]) drawAnimals(g, b, r, x, y, pw, ph);
      if (!live && b.type !== 'farmhouse') {
        g.fillStyle = frozen(b) ? 'rgba(215,236,250,0.5)' : 'rgba(60,60,60,0.22)'; g.fillRect(x + 2, y + 2, pw - 4, ph - 4);
      }
      if (b.type === 'farmhouse' || (live && SMOKY[bt.group])) drawSmoke(g, b, x + pw * 0.72, y + 6);
      if (r && b.type !== 'farmhouse' && !onlyOne(b.type) && !tile1) {
        // Product badge: half see-through, bigger on buildings two tiles high or more.
        // It peeks just a little past the building's top-left corner.
        const br = badgeR(h), bc = br * 0.88;
        g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(x + bc, y + bc, br, 0, Math.PI * 2); g.fill();
        drawIcon(g, r.primary, x + bc, y + bc, br * (h >= 2 ? 1.8 : 1.67), FS.items[r.primary].emoji);
      }
    }
    // The progress bar carries the building's state through its colour (see barState).
    const bar = r && b.type !== 'farmhouse' ? barState(b, r) : null;
    // Bars are drawn after the daylight tint (drawBars), so their colours read the same at dusk and at night.
    if (bar) R.bars.push({ bar, x, y: y + ph - 7, w: pw, fill: bar.wait || bar.full ? 1 : prog, a: g.globalAlpha });
    // No recipe yet: a question mark where the product badge would be.
    if (!r && b.type !== 'farmhouse' && b.type !== 'academy') {
      if (b.type === 'field') drawQuestion(g, x + pw / 2, y + ph / 2, 9);
      else { const qr = badgeR(h); drawQuestion(g, x + qr * 0.88, y + qr * 0.88, qr); }
    }
    // Paused and out of money are drawn straight over the building, product badge included.
    // Each sits on the same faint white tint over the whole building.
    const VEIL = 'rgba(255,255,255,0.35)';
    const veil = (c) => { g.fillStyle = c; g.fillRect(x + 1, y + 1, pw - 2, ph - 2); };
    if (r && b.status === 'paused') { veil(VEIL); drawPause(g, x + pw / 2, y + ph / 2, Math.min(pw, ph)); }
    else if (r && b.status === 'nomoney') { veil(VEIL); drawBroke(g, x + pw / 2, y + ph / 2, Math.min(pw, ph)); }
    // Stopped by the weather (a dock in a storm): the storm cloud over the middle of the building.
    else if (r && !frozen(b) && ((b.status === 'season' && !b.running) || (b.running && b.mult === 0))) {
      veil(VEIL);
      const pulse = 1 + Math.sin(now / 400) * 0.05;
      drawIcon(g, 'weather_storm', x + pw / 2, y + ph / 2, Math.min(32, Math.min(pw, ph) * 0.68) * pulse, '⛈️');
    }
    if (R.selected === b.id) {
      g.strokeStyle = '#ffe14d'; g.lineWidth = 2.5; g.strokeRect(x + 1, y + 1, pw - 2, ph - 2);
    }
  }

  // Supply-chain links: an arrow from each building to every building that uses what it makes.
  // Red when the consumer is waiting for that ingredient. All links with the overlay on, else only the selected building's.
  function drawFlows(g, z) {
    const S = Game.S;
    if (!R.flows && !R.selected) return;
    const makers = {};
    for (const b of S.buildings) {
      const r = FS.recipeById[b.recipe];
      if (r) for (const o in r.outputs) (makers[o] = makers[o] || []).push(b);
    }
    const centre = (b) => { const [w, h] = FS.buildings[b.type].size; return [(b.x + w / 2) * TS, (b.y + h / 2) * TS]; };
    const links = [];
    for (const b of S.buildings) {
      const r = FS.recipeById[b.recipe];
      if (!r) continue;
      for (const i in r.inputs) for (const p of makers[i] || []) {
        const sel = R.selected === b.id || R.selected === p.id;
        // Water goes almost everywhere, so only draw it for the selected building.
        if (p === b || (!R.flows && !sel) || (i === 'water' && !sel)) continue;
        links.push({ p, b, i, bad: b.status === 'missing' && !b.running && (b.missing || []).includes(i) });
      }
    }
    // Missing ingredients that no building on the farm makes: a red dashed stub that leads nowhere.
    const orphans = [];
    for (const b of S.buildings) {
      if (b.status !== 'missing' || b.running || (!R.flows && R.selected !== b.id)) continue;
      for (const i of b.missing || []) if (!(makers[i] || []).length) orphans.push({ b, i });
    }
    if (!links.length && !orphans.length) return;
    g.save();
    g.lineCap = 'round';
    for (const L of links) {
      const [x1, y1] = centre(L.p), [x2, y2] = centre(L.b);
      const mx = (x1 + x2) / 2 + (y2 - y1) * 0.15, my = (y1 + y2) / 2 - (x2 - x1) * 0.15;
      g.strokeStyle = L.bad ? 'rgba(230,70,58,0.9)' : 'rgba(255,214,77,0.85)';
      g.lineWidth = 2.5 / Math.max(0.7, z);
      g.setLineDash(L.bad ? [6, 5] : []);
      g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mx, my, x2, y2); g.stroke();
      // arrow head near the consumer
      const t = 0.82, ax = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2, ay = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t * t * y2;
      const ang = Math.atan2(y2 - ay, x2 - ax), hs = 7 / Math.max(0.7, z);
      g.setLineDash([]); g.fillStyle = g.strokeStyle;
      g.beginPath(); g.moveTo(ax + Math.cos(ang) * hs, ay + Math.sin(ang) * hs);
      g.lineTo(ax + Math.cos(ang + 2.5) * hs, ay + Math.sin(ang + 2.5) * hs); g.lineTo(ax + Math.cos(ang - 2.5) * hs, ay + Math.sin(ang - 2.5) * hs); g.fill();
      if (z >= 0.8) {
        const ex = 0.25 * x1 + 0.5 * mx + 0.25 * x2, ey = 0.25 * y1 + 0.5 * my + 0.25 * y2;
        g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.arc(ex, ey, 8, 0, Math.PI * 2); g.fill();
        drawIcon(g, L.i, ex, ey, 13, FS.items[L.i].emoji);
      }
    }
    // Stubs fan out above the building, one per missing ingredient, each ending in the ingredient and a red "?".
    const per = {};
    for (const O of orphans) {
      const k = per[O.b.id] = (per[O.b.id] || 0) + 1, n = orphans.filter((x) => x.b === O.b).length;
      const [x2, y2] = centre(O.b), len = 2.6 * TS, ang = -Math.PI / 2 + (k - (n + 1) / 2) * 0.55 - 0.35;
      const x1 = x2 + Math.cos(ang) * len, y1 = y2 + Math.sin(ang) * len;
      g.strokeStyle = 'rgba(230,70,58,0.9)'; g.lineWidth = 2.5 / Math.max(0.7, z);
      g.setLineDash([6, 5]); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.setLineDash([]);
      g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.arc(x1, y1, 11, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(230,70,58,0.9)'; g.lineWidth = 2; g.stroke();
      drawIcon(g, O.i, x1, y1, 15, FS.items[O.i].emoji);
      g.fillStyle = 'rgb(230,70,58)'; g.beginPath(); g.arc(x1 + 9, y1 - 9, 6, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fff'; g.font = 'bold 10px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', x1 + 9, y1 - 8.5);
    }
    g.restore();
  }

  // ---------- Daylight ----------
  // Purely visual: the map is multiplied by a sky colour that follows the clock (600 s = 24 h, 00:00 at the
  // start of a day). Reddish sunrise, plain daylight from mid-morning to late afternoon, a warm then violet dusk
  // and a short dark night around midnight. On day 1 the map stays in plain midday light until 12:00, so a new farm opens in daylight.
  // Each key: hour, multiply colour (darkens), and a wash [r, g, b, alpha] laid over it for the warm sunrise and dusk hues.
  const NIGHT = [[150, 160, 210], [40, 50, 110, 0.08]], NOON = [[255, 255, 255], [255, 255, 255, 0]];
  const SKY = [
    [0, ...NIGHT], [0.5, ...NIGHT], [1.5, [185, 180, 215], [90, 60, 120, 0.06]],
    [2.5, [235, 215, 215], [255, 110, 120, 0.14]], [3.5, [252, 240, 232], [255, 150, 120, 0.06]], [5, ...NOON],
    [19.5, ...NOON], [20.5, [255, 238, 215], [255, 160, 70, 0.10]], [21.5, [225, 195, 190], [255, 110, 70, 0.16]],
    [22.3, [195, 180, 210], [130, 60, 140, 0.10]], [23, ...NIGHT], [24, ...NIGHT],
  ];
  R.hour = function () {
    const S = Game.S;
    if (Game.cheat.hour != null) return Game.cheat.hour;
    const h = ((S.time % 600) / 600) * 24;
    return S.time < 600 && h < 12 ? 12 : h;
  };
  // Returns { mul: [r, g, b], wash: [r, g, b, a] } for hour h.
  R.sky = function (h = R.hour()) {
    let i = 0;
    while (i < SKY.length - 2 && SKY[i + 1][0] <= h) i++;
    const a = SKY[i], b = SKY[i + 1], f = Math.min(1, Math.max(0, (h - a[0]) / (b[0] - a[0])));
    const mix = (x, y) => x.map((v, k) => v + (y[k] - v) * f);
    return { mul: mix(a[1], b[1]).map(Math.round), wash: mix(a[2], b[2]) };
  };
  function drawDaylight(g) {
    const { mul: c, wash: w } = R.sky(), W = R.viewW(), H = R.viewH();
    if (c.every((v) => v >= 254) && w[3] < 0.01) return;
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = `rgba(${w.slice(0, 3).map(Math.round).join(',')},${w[3].toFixed(3)})`; g.fillRect(0, 0, W, H);
    // After dark, working buildings glow warmly so the farm stays readable.
    const dark = 1 - (c[0] + c[1] + c[2]) / 765;
    if (dark < 0.3) return;
    const z = R.cam.z, a = Math.min(1, (dark - 0.3) / 0.25) * 0.35;
    g.globalCompositeOperation = 'lighter';
    for (const b of Game.S.buildings) {
      if (!b.running && b.type !== 'farmhouse') continue;
      const [w, h] = FS.buildings[b.type].size;
      const x = ((b.x + w / 2) * TS - R.cam.x) * z, y = ((b.y + h / 2) * TS - R.cam.y) * z, r = Math.max(w, h) * TS * z * 0.75;
      if (x < -r || y < -r || x > W + r || y > H + r) continue;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(255,190,110,${a})`); grad.addColorStop(1, 'rgba(255,190,110,0)');
      g.fillStyle = grad; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    g.globalCompositeOperation = 'source-over';
  }
  R.bars = [];
  function drawBars(g, now) {
    const z = R.cam.z;
    g.setTransform(R.dpr * z, 0, 0, R.dpr * z, -R.cam.x * z * R.dpr, -R.cam.y * z * R.dpr);
    for (const { bar, x, y, w, fill, a } of R.bars) {
      g.globalAlpha = a;
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(x + 3, y, w - 6, 4);
      if (bar.wait) g.globalAlpha = a * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(now / 320))); // a gentle pulse while waiting
      g.fillStyle = bar.color; g.fillRect(x + 3, y, (w - 6) * fill, 4);
      if (bar.frost) { g.fillStyle = 'rgba(255,255,255,0.9)'; for (let k = x + 5; k < x + w - 5; k += 6) g.fillRect(k, y, 2, 1); }
    }
    g.globalAlpha = 1;
    R.bars = [];
    g.setTransform(R.dpr, 0, 0, R.dpr, 0, 0);
  }
  R.draw = function (now, dt) {
    const g = R.ctx, S = Game.S;
    if (!S || R.off) return; // R.off: the Town screen is showing instead of the farm
    const si = currentSeason(dt);
    frame++;
    if (S.speed) R.t += dt;
    g.setTransform(R.dpr, 0, 0, R.dpr, 0, 0);
    g.fillStyle = `rgb(${FOG})`; g.fillRect(0, 0, R.viewW(), R.viewH());
    const z = R.cam.z;
    g.setTransform(R.dpr * z, 0, 0, R.dpr * z, -R.cam.x * z * R.dpr, -R.cam.y * z * R.dpr);
    const x0 = Math.max(0, Math.floor(R.cam.x / TS)), y0 = Math.max(0, Math.floor(R.cam.y / TS));
    const x1 = Math.min(Game.W, Math.ceil((R.cam.x + R.viewW() / z) / TS) + 1), y1 = Math.min(Game.H, Math.ceil((R.cam.y + R.viewH() / z) / TS) + 1);
    g.imageSmoothingEnabled = true;
    drawTerrain(g, si, x0, y0, x1, y1, 6);
    if (R.fade) { g.globalAlpha = R.fade.a; drawTerrain(g, R.fade.from, x0, y0, x1, y1, 0); g.globalAlpha = 1; }
    trimChunks();
    // water shimmer
    g.fillStyle = 'rgba(255,255,255,0.18)';
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      if (S.tiles[y * Game.W + x] !== 1 || !Game.owns(x, y)) continue;
      const ph = hash(x, y) * 6.28 + now / 900;
      g.fillRect(x * TS + 6 + Math.sin(ph) * 4, y * TS + 10 + hash(y, x) * 12, 10, 1.5);
    }
    drawHaze(g, si);
    if (R.fade) { g.globalAlpha = R.fade.a; drawHaze(g, R.fade.from); g.globalAlpha = 1; }
    // grid when placing
    if (R.ghost || R.blueprint) {
      g.strokeStyle = 'rgba(0,0,0,0.08)'; g.lineWidth = 1;
      for (let x = x0; x <= x1; x++) { g.beginPath(); g.moveTo(x * TS, y0 * TS); g.lineTo(x * TS, y1 * TS); g.stroke(); }
      for (let y = y0; y <= y1; y++) { g.beginPath(); g.moveTo(x0 * TS, y * TS); g.lineTo(x1 * TS, y * TS); g.stroke(); }
    }
    for (const b of S.buildings) {
      const [w, h] = FS.buildings[b.type].size;
      if (b.x + w < x0 || b.x > x1 || b.y + h < y0 || b.y > y1) continue;
      if (b.id === R.ghostMove) { g.globalAlpha = 0.35; drawBuilding(g, b, now); g.globalAlpha = 1; } else drawBuilding(g, b, now);
    }
    drawFlows(g, z);
    if (R.blueprint) drawBlueprint(g);
    if (R.ghost && R.hover) {
      const bt = FS.buildings[R.ghost];
      const [w, h] = bt.size;
      const err = Game.canPlace(R.ghost, R.hover.x, R.hover.y, R.ghostMove);
      g.fillStyle = err ? 'rgba(220,60,50,0.45)' : 'rgba(80,220,90,0.45)';
      g.fillRect(R.hover.x * TS, R.hover.y * TS, w * TS, h * TS);
      // Proximity zones: makers inside the rings save 15%, 10% and 5% of an input. A ring sits where Game.PROX steps down.
      if (!err || err === 'Not enough money') {
        g.setLineDash([4, 4]); g.lineWidth = 1.5;
        let k = 0;
        Game.PROX.forEach((d, gap) => {
          if (Game.PROX[gap + 1] === d) return;
          const e = gap + 1;
          g.strokeStyle = `rgba(255,255,255,${0.7 - k++ * 0.2})`;
          g.strokeRect((R.hover.x - e) * TS, (R.hover.y - e) * TS, (w + 2 * e) * TS, (h + 2 * e) * TS);
        });
        g.setLineDash([]);
      }
      g.globalAlpha = 0.8; drawIcon(g, 'b_' + R.ghost, (R.hover.x + w / 2) * TS, (R.hover.y + h / 2) * TS, Math.min(w, h) * TS * 0.8, bt.icon); g.globalAlpha = 1;
    } else if (R.hover && !R.ghost && !R.blueprint) {
      g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 1.5;
      g.strokeRect(R.hover.x * TS + 0.5, R.hover.y * TS + 0.5, TS - 1, TS - 1);
    }
    // floating production text
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const f of R.floats) {
      f.t += dt;
      const a = Math.max(0, 1 - f.t / 1.6);
      g.globalAlpha = a;
      g.font = 'bold 12px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      const fy = f.y - f.t * 22, tx = f.icon ? f.x - 8 : f.x;
      g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,0.6)';
      g.strokeText(f.text, tx, fy);
      g.fillStyle = '#fff'; g.fillText(f.text, tx, fy);
      if (f.icon) drawIcon(g, f.icon, tx + g.measureText(f.text).width / 2 + 9, fy, 16);
    }
    g.globalAlpha = 1;
    R.floats = R.floats.filter((f) => f.t < 1.6);
    g.setTransform(R.dpr, 0, 0, R.dpr, 0, 0);
    drawSigns(g);
    drawWeather(g, dt);
    drawDaylight(g);
    drawBars(g, now);
  };
})();
