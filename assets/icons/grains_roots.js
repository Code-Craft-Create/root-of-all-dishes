// Grains, roots and tubers, legumes and oilseeds (raw crops).
(function (FSI) {
  const { C, K } = FSI;
  // ---- local helpers ----
  const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
  const E = (cx, cy, rx, ry, fill, rot = 0, sw = '') =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''} fill="${fill}"${sw ? ` stroke-width="${sw}"` : ''}/>`;
  const Ci = (cx, cy, r, fill, sw = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${sw ? ` stroke-width="${sw}"` : ''}/>`;
  const G = (rot, x, y, m) => `<g transform="rotate(${rot} ${x} ${y})">${m}</g>`;
  // Two-tone stalk (like the wheat reference).
  const stalk = (d, col = C.wheatD, lt = C.wheatL) =>
    `<path d="${d}" stroke-width="3" fill="none" stroke="${col}"/><path d="${d}" stroke-width="1" fill="none" stroke="${lt}"/>`;
  // Grass leaf blade from (x,y) curving out.
  const blade = (d, fill = C.leaf) => `<path d="${d}" fill="${fill}" stroke-width="1.8"/>`;
  // Generic grain ear: base (x,y), length len, half width w.
  const ear = (x, y, rot, o) => {
    const { len = 22, w = 5, fill = C.wheat, dk = C.wheatD, awn = 0, awnCol = C.ink, steps = 3 } = o;
    let m = `<path d="M${x} ${y + 2} C${x - w} ${y - 2} ${x - w} ${y - len * 0.65} ${x} ${y - len} C${x + w} ${y - len * 0.65} ${x + w} ${y - 2} ${x} ${y + 2} Z" fill="${fill}"/>`;
    let ln = `M${x} ${y - len + 2} V${y}`;
    let aw = '';
    for (let i = 0; i < steps; i++) {
      const yy = y - 2 - i * ((len - 6) / steps);
      ln += ` M${x - w * 0.7} ${yy - 4} L${x} ${yy} L${x + w * 0.7} ${yy - 4}`;
      if (awn) aw += `M${x - w * 0.7} ${yy - 4} L${x - w * 0.7 - awn * 0.3} ${yy - 4 - awn} M${x + w * 0.7} ${yy - 4} L${x + w * 0.7 + awn * 0.3} ${yy - 4 - awn} `;
    }
    if (awn) aw += `M${x} ${y - len} V${y - len - awn}`;
    m += K.line(ln, 1.3, dk) + (awn ? K.line(aw, 1.2, awnCol) : '') +
      K.hi(`M${x - w * 0.4} ${y - 4} C${x - w * 0.8} ${y - len * 0.35} ${x - w * 0.7} ${y - len * 0.55} ${x - w * 0.3} ${y - len * 0.75} Z`);
    return G(rot, x, y, m);
  };
  // Small mound of seeds; dots = [[x,y,fill]].
  const heap = (fill, seeds, rx = 22) =>
    K.shadow(rx + 2) + P(`M${32 - rx} 57 C${32 - rx + 4} 44 ${26} 36 32 36 C${38} 36 ${32 + rx - 4} 44 ${32 + rx} 57 Z`, fill) + seeds +
    K.hi(`M${32 - rx + 6} 53 C${32 - rx + 9} 46 25 41 29 39 C27 43 ${32 - rx + 12} 48 ${32 - rx + 9} 54 Z`);

  // Tapered root lying along +x from its crown (0,0), placed at (x,y) rotated rot.
  // o: len, t (half thickness), fill, dk (ring colour), cut (flesh colour of a cut crown), rings.
  const root = (x, y, rot, o) => {
    const { len = 40, t = 7, fill = C.orange, dk = C.orangeD, cut = '', rings = 4, tail = 4 } = o;
    let m = `<path d="M0 ${-t} C${len * 0.45} ${-t} ${len * 0.8} ${-t * 0.35} ${len} 0 L${len + tail} 0.5 L${len} 1 C${len * 0.8} ${t * 0.4} ${len * 0.45} ${t} 0 ${t} C${cut ? -t * 0.35 : -t * 0.7} ${t} ${cut ? -t * 0.35 : -t * 0.7} ${-t} 0 ${-t} Z" fill="${fill}"/>`;
    let r = '';
    for (let i = 1; i <= rings; i++) {
      const xx = (len * 0.8 * i) / (rings + 1), w = t * (1 - (0.6 * xx) / len);
      r += `M${xx.toFixed(1)} ${(-w * 0.95).toFixed(1)} q1.6 ${(w * 0.4).toFixed(1)} 0 ${(w * 0.8).toFixed(1)} M${(xx + len / (rings + 1) / 2).toFixed(1)} ${(w * 0.95).toFixed(1)} q1.4 ${(-w * 0.35).toFixed(1)} 0 ${(-w * 0.6).toFixed(1)} `;
    }
    m += K.line(r, 1.3, dk) + K.hi(`M${t * 0.6} ${-t * 0.6} C${len * 0.3} ${-t * 0.75} ${len * 0.5} ${-t * 0.6} ${len * 0.65} ${-t * 0.35} C${len * 0.5} ${-t * 0.3} ${len * 0.3} ${-t * 0.35} ${t * 0.6} ${-t * 0.2} Z`);
    if (cut) m += E(0, 0, t * 0.45, t, cut, 0, 2) + E(0, 0, t * 0.22, t * 0.55, 'none', 0, 1.2).replace('fill="none"', `fill="none" stroke="${dk}"`);
    return `<g transform="translate(${x} ${y}) rotate(${rot})">${m}</g>`;
  };
  // Leafy top: a fan of leaves from (x,y).
  const tops = (x, y, angles, len = 14, fill = C.leaf, stem = '') => angles.map((a) => {
    const r = (a * Math.PI) / 180, ex = x + len * Math.sin(r), ey = y - len * Math.cos(r);
    const nx = Math.cos(r) * 3.5, ny = Math.sin(r) * 3.5;
    const mx = (x + ex) / 2, my = (y + ey) / 2;
    return `<path d="M${x} ${y} Q${(mx - nx).toFixed(1)} ${(my - ny).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)} Q${(mx + nx).toFixed(1)} ${(my + ny).toFixed(1)} ${x} ${y} Z" fill="${fill}" stroke-width="1.8"/>` +
      (stem ? K.line(`M${x} ${y} L${((x + ex * 2) / 3).toFixed(1)} ${((y + ey * 2) / 3).toFixed(1)}`, 1.4, stem) : '');
  }).join('');

  // ---- legumes ----
  const at = (x, y, rot, m) => `<g transform="translate(${x} ${y}) rotate(${rot})">${m}</g>`;
  // Bean shapes in local coords at size s; each returns markup.
  const BEAN = {
    oval: (f, s) => E(0, 0, 4.4 * s, 3.1 * s, f, 0, 1.6),
    small: (f, s) => E(0, 0, 3.2 * s, 2.3 * s, f, 0, 1.3),
    kidney: (f, s) => P(`M${-5.4 * s} 0 C${-5.4 * s} ${-3.6 * s} ${-2 * s} ${-3.8 * s} 0 ${-2.2 * s} C${2 * s} ${-3.8 * s} ${5.4 * s} ${-3.6 * s} ${5.4 * s} 0 C${5.4 * s} ${3.8 * s} ${-5.4 * s} ${3.8 * s} ${-5.4 * s} 0 Z`, f, ' stroke-width="1.6"'),
    round: (f, s) => Ci(0, 0, 3.9 * s, f, 1.6),
    chick: (f, s) => P(`M${-4 * s} ${-2 * s} C${-3 * s} ${-5 * s} ${3 * s} ${-5 * s} ${4.3 * s} ${-0.5 * s} C${5 * s} ${3 * s} ${2 * s} ${4.6 * s} 0 ${4.4 * s} C${-3 * s} ${4.4 * s} ${-5 * s} ${2 * s} ${-4.6 * s} ${-1 * s} L${-5.6 * s} ${-3 * s} Z`, f, ' stroke-width="1.6"'),
    lens: (f, s) => E(0, 0, 3.4 * s, 2.5 * s, f, 0, 1.3),
  };
  const MARK = {
    none: () => '',
    hi: (s) => K.hiE(-1.6 * s, -1 * s, 1.5 * s, 0.8 * s, -10),
    hilumW: (s) => K.line(`M${-1.8 * s} ${-1.2 * s} Q0 ${-2 * s} ${1.8 * s} ${-1.2 * s}`, 1.1, C.white),
    hilumK: (s) => K.line(`M${-1.6 * s} ${-1.4 * s} Q0 ${-2 * s} ${1.6 * s} ${-1.4 * s}`, 1.1, C.brownD),
    eye: (s) => E(0.4 * s, -0.6 * s, 1.8 * s, 1.2 * s, C.black, 0, 0.8) + K.hiE(-2.2 * s, -0.6 * s, 1.2 * s, 0.6 * s, -10),
    speck: (s) => K.dots([[-2.2 * s, -0.6 * s], [0.4 * s, 1 * s], [2.4 * s, -0.8 * s], [-0.8 * s, -1.6 * s]], 0.9 * s, C.brown),
    beak: (s) => K.line(`M${-1 * s} ${-1.8 * s} Q${1 * s} ${-0.5 * s} ${2 * s} ${1.6 * s}`, 1.1, C.wheatD),
  };
  // Dried pod (open, beans showing) + a heap of loose beans in front.
  const PILE_BIG = [[22, 53, -10], [33, 54, 15], [44, 53, -20], [54, 50, 10], [27, 46, 20], [38, 46, -5], [49, 43, 25], [33, 39, 0], [44, 37, -15]];
  const PILE_SMALL = [];
  for (let r = 0; r < 5; r++) for (let i = 0; i < 6 - r; i++) PILE_SMALL.push([+(19 + r * 3.3 + i * 7.2).toFixed(1), 54 - r * 4.6, (i * 47 + r * 31) % 90 - 45]);
  const pulse = (o) => {
    const { shape = 'oval', fill, mark = 'hi', pod = C.wheat, podIn = C.wheatL, podDk = C.wheatD, small = false, fuzz = false, s = small ? 1.15 : 1.3 } = o;
    const b = (x, y, r, sz = s) => at(x, y, r, BEAN[shape](fill, sz) + MARK[mark](sz));
    let podM = `<path d="M-25 1 C-20 -8 16 -10 24 -3 L28 -6 L26 0 C18 9 -18 9 -25 1 Z" fill="${pod}"/>` +
      `<path d="M-20 1 C-14 -4.5 14 -5.5 21 -1 C14 4.5 -14 5.5 -20 1 Z" fill="${podIn}" stroke-width="1.5"/>` +
      [-12, -3.5, 5, 13.5].map((x) => b(x, 0, 0, small ? 0.9 : 1)).join('') +
      K.line('M-24 3 C-14 9 14 8 24 1', 1.2, podDk);
    if (fuzz) podM += K.line('M-18 -6 l-1 -2.5 M-8 -8 l0 -2.5 M2 -8.5 l0.5 -2.5 M12 -7.5 l1 -2.5 M-14 7 l-0.5 2.5 M-2 8 l0 2.5 M10 7 l0.5 2.5', 1.1, podDk);
    return K.shadow(26) + at(28, 24, -22, podM) + (small ? PILE_SMALL : PILE_BIG).map(([x, y, r]) => b(x, y, r)).join('');
  };
  // Long fresh bean drawn as a two-tone stroke.
  const greenBean = (d, f = C.leaf, w = 6) => `<path d="${d}" stroke-width="${w + 2.5}" fill="none"/><path d="${d}" stroke="${f}" stroke-width="${w}" fill="none"/>`;

  FSI.add('grains_roots', {
    // ---------------- grains ----------------
    durum_wheat: () => K.shadow(12) +
      stalk('M32 58 C31 46 26 40 19 34 M32 58 V32 M32 58 C33 46 38 40 45 34') +
      ear(19, 36, -26, { len: 20, w: 6, fill: C.orangeL, dk: C.orangeD, awn: 11, steps: 3 }) +
      ear(45, 36, 26, { len: 20, w: 6, fill: C.orangeL, dk: C.orangeD, awn: 11, steps: 3 }) +
      ear(32, 33, 0, { len: 20, w: 6, fill: C.orangeL, dk: C.orangeD, awn: 11, steps: 3 }) +
      `<path d="M25 50 C29 47 35 47 39 50" stroke="${C.leafD}" stroke-width="2"/>`,
    spelt: () => {
      const sp = (x, y, rot) => {
        let m = '';
        for (let i = 0; i < 6; i++) {
          const yy = y - i * 4.2, s = i % 2 ? 1 : -1;
          m += E(x + s * 2.4, yy - 2, 3.3, 4.3, C.brownL, s * 25, 1.6);
        }
        m += E(x, y - 26, 2.6, 3.6, C.brownL, 0, 1.6) + K.line(`M${x} ${y + 2} V${y - 24}`, 1.2, C.brownD);
        return G(rot, x, y, m);
      };
      return K.shadow(12) + stalk('M32 58 C31 46 25 42 18 36 M32 58 V32 M32 58 C33 46 39 42 46 36') +
        sp(18, 36, -24) + sp(46, 36, 24) + sp(32, 32, 0);
    },
    rye: () => K.shadow(12) +
      stalk('M32 58 C30 44 22 34 15 30 M32 58 V30 M32 58 C34 44 42 34 49 30') +
      ear(16, 32, -30, { len: 24, w: 3.6, fill: C.greyL, dk: C.greyD, awn: 7, awnCol: C.greyD, steps: 4 }) +
      ear(32, 31, 0, { len: 26, w: 3.6, fill: C.greyL, dk: C.greyD, awn: 7, awnCol: C.greyD, steps: 4 }) +
      ear(48, 32, 30, { len: 24, w: 3.6, fill: C.greyL, dk: C.greyD, awn: 7, awnCol: C.greyD, steps: 4 }),
    barley: () => {
      // nodding ear with long whiskers
      let g = '', aw = '';
      for (let i = 0; i < 6; i++) {
        const y = -2 - i * 4.4;
        g += E(-2.6, y, 2.8, 4.2, C.yellowL, -25, 1.5) + E(2.6, y, 2.8, 4.2, C.yellowL, 25, 1.5);
        aw += `M-4 ${y - 3} L${-9 - i} ${y - 22} M4 ${y - 3} L${9 + i} ${y - 22} `;
      }
      return K.shadow(12, 58, 40) + stalk('M42 58 C42 40 46 24 40 14', C.wheatD) +
        blade('M42 50 C48 44 54 42 60 42 C54 45 48 48 42 54 Z') +
        `<g transform="translate(40 14) rotate(-118)">` + K.line(aw, 1.2, C.wheatD) + g +
        E(0, -28, 2.4, 3.6, C.yellowL, 0, 1.5) + K.line('M0 0 V-27', 1.2, C.wheatD) + `</g>`;
    },
    oats: () => {
      let m = stalk('M32 58 V12', C.wheatD);
      m += K.line('M32 18 C26 18 20 22 16 28 M32 18 C38 18 44 22 48 28 M32 30 C26 30 22 34 20 40 M32 30 C38 30 42 34 44 40', 1.5, C.wheatD);
      const sp = (x, y) => P(`M${x} ${y - 4} C${x - 3.5} ${y - 1} ${x - 3.5} ${y + 6} ${x} ${y + 9} C${x + 3.5} ${y + 6} ${x + 3.5} ${y - 1} ${x} ${y - 4} Z`, C.wheatL, ' stroke-width="1.8"') +
        K.line(`M${x} ${y - 2} V${y + 6}`, 1, C.wheatD);
      m += sp(16, 30) + sp(48, 30) + sp(20, 42) + sp(44, 42) + sp(32, 14) + sp(25, 21) + sp(39, 21);
      return K.shadow(12) + m + blade('M32 52 C26 48 20 47 14 48 C20 50 26 52 32 56 Z');
    },
    corn: () => K.shadow(16) +
      P('M24 54 C14 40 18 18 34 6 C48 18 46 42 38 54 Z', C.yellow) +
      K.line('M26 46 C24 36 27 22 33 12 M31 50 C30 38 32 24 36 13 M37 49 C38 38 40 26 39 16 M23 40 L42 40 M22 32 L43 32 M24 24 L42 24 M28 17 L39 17', 1.2, C.yellowD) +
      K.hiE(27, 24, 2.5, 7, 20) +
      P('M30 58 C20 54 12 42 12 28 C18 36 24 44 32 48 Z', C.leaf) +
      P('M30 58 C40 54 50 44 54 30 C46 38 40 44 34 48 Z', C.leafD) +
      P('M28 55 H34 L33 60 H29 Z', C.leafD, ' stroke-width="1.8"'),
    paddy_rice: () => {
      let g = '';
      const pts = [[42, 12, 10], [47, 16, 30], [50, 22, 50], [52, 29, 70], [52, 36, 90], [40, 18, 20], [44, 24, 40], [46, 31, 60], [46, 38, 80], [36, 22, 30], [38, 29, 50], [39, 36, 75]];
      pts.forEach(([x, y, r]) => (g += E(x, y, 2.2, 3.8, C.wheat, r, 1.5)));
      return K.shadow(14, 58, 30) +
        blade('M26 58 C18 44 10 36 4 34 C12 34 22 42 29 56 Z') +
        stalk('M30 58 C28 40 30 18 38 9 C46 8 52 18 53 30', C.leafD, C.leafL) +
        K.line('M38 10 C42 16 45 26 46 38 M38 10 C38 20 39 30 39 38', 1.3, C.leafD) + g +
        blade('M32 58 C36 46 44 42 54 42 C46 46 38 50 35 58 Z', C.leafL) + K.hiE(41, 11, 1, 2, 10);
    },
    glutinous_rice: () => K.shadow(20) +
      // woven sticky-rice basket heaped with opaque white grains
      P('M14 26 C12 40 16 54 32 57 C48 54 52 40 50 26 Z', C.wheat) +
      K.line('M16 34 H48 M17 42 H47 M20 50 H44 M22 26 L25 56 M32 26 V57 M42 26 L39 56', 1.2, C.wheatD) +
      P('M12 27 C14 13 50 13 52 27 C44 30 20 30 12 27 Z', C.white) +
      [[22, 21], [28, 18], [35, 18], [42, 21], [26, 25], [33, 23], [40, 25], [19, 26], [46, 26]].map(([x, y], i) => E(x, y, 2.6, 1.6, C.white, i % 2 ? 20 : -20, 1.2)).join('') +
      P('M10 27 C20 31 44 31 54 27 L52 31 C44 34 20 34 12 31 Z', C.wheatD, ' stroke-width="2"') +
      K.hi('M17 36 C17 44 19 50 23 53 L25 52 C21 47 20 42 20 36 Z'),
    sorghum: () => {
      let s = '';
      const pts = [[32, 8], [27, 12], [37, 12], [24, 18], [32, 15], [40, 18], [27, 22], [37, 22], [32, 21], [24, 26], [40, 26], [29, 28], [35, 28], [32, 32]];
      pts.forEach(([x, y]) => (s += Ci(x, y, 3.3, C.terracotta, 1.5)));
      return K.shadow(12) + stalk('M32 58 V30', C.leafD, C.leafL) +
        blade('M32 48 C24 42 16 42 8 46 C16 46 24 48 32 54 Z') + blade('M32 40 C40 34 48 33 56 36 C48 37 40 40 32 46 Z', C.leafD) +
        P('M32 4 C42 6 46 20 42 30 C40 34 24 34 22 30 C18 20 22 6 32 4 Z', C.redD) + s +
        K.hiE(26, 13, 1.6, 3, 20);
    },
    millet: () => {
      let d = [];
      for (let i = 0; i < 14; i++) d.push([20 + i * 2.3 + (i % 2) * 1.5, 14 + Math.sin(i / 2.5) * 2 + i * 1.9 + (i % 3) * 2]);
      return K.shadow(12, 58, 40) + stalk('M40 58 C40 40 40 20 30 12', C.leafD, C.leafL) +
        P('M30 10 C40 6 52 14 54 30 C55 40 52 48 48 50 C44 50 44 40 42 32 C40 22 34 18 28 16 C26 14 26 11 30 10 Z', C.yellow) +
        K.dots([[33, 13], [38, 15], [43, 18], [47, 23], [50, 29], [51, 36], [50, 43], [36, 18], [41, 22], [45, 28], [47, 35], [48, 42], [43, 32], [45, 39]], 1.3, C.yellowD) +
        K.line('M30 10 L27 6 M36 9 L36 4 M44 12 L48 8 M51 20 L56 18 M54 31 L59 31 M53 42 L58 44', 1.2, C.wheatD) +
        K.hiE(36, 13, 1.5, 3.5, -60) +
        blade('M40 50 C32 44 22 44 12 48 C22 49 32 51 40 56 Z');
    },
    buckwheat: () => {
      const seed = (x, y, rot) => G(rot, x, y, P(`M${x} ${y - 10} L${x + 8} ${y + 7} L${x - 8} ${y + 7} Z`, C.brownD) +
        P(`M${x} ${y - 10} L${x + 8} ${y + 7} L${x + 1} ${y + 7} Z`, C.choc, ' stroke-width="1.5"') + K.hi(`M${x - 1} ${y - 6} L${x - 5} ${y + 4} L${x - 3} ${y + 4} Z`));
      const fl = (x, y) => [0, 72, 144, 216, 288].map((a) => E(x + 3 * Math.cos(a * Math.PI / 180), y + 3 * Math.sin(a * Math.PI / 180), 2.4, 2.4, C.pinkL, 0, 1.2)).join('') + Ci(x, y, 1.4, C.pink, 1);
      return K.shadow(24) +
        K.line('M44 40 C44 30 46 22 48 16 M46 24 C40 20 36 16 34 12', 2, C.leafD) +
        P('M46 28 C50 22 58 24 56 32 C54 36 48 36 46 28 Z', C.leaf, ' stroke-width="1.8"') +
        fl(49, 12) + fl(41, 9) + fl(32, 12) +
        seed(18, 46, -10) + seed(46, 49, 12) + seed(32, 42, 0);
    },
    quinoa: () => {
      // heap of tiny tri-colour seeds
      const cols = [C.creamL, C.redD, C.creamL, C.black, C.creamL, C.wheat, C.creamL];
      const pts = [];
      for (let r = 0; r < 7; r++) {
        const y = 53 - r * 4.6, half = 22 - r * 3.3;
        for (let x = -half + 2; x <= half - 2; x += 4.4) pts.push([+(32 + x + ((r * 3 + x) % 3) * 0.7 + (r % 2) * 2).toFixed(1), +(y + (x % 2) * 0.8).toFixed(1)]);
      }
      return K.shadow(26) + P('M6 57 C10 42 22 22 32 22 C42 22 54 42 58 57 Z', C.cream) +
        pts.map(([x, y], i) => Ci(x, y, 1.7, cols[(i * 5) % cols.length], 1)).join('') +
        K.hi('M12 52 C15 42 21 33 27 27 C24 34 18 43 16 53 Z');
    },
    teff: () => {
      const d = [];
      for (let r = 0; r < 6; r++) {
        const y = 54 - r * 3.4, half = 22 - r * 3.4;
        for (let x = -half + 2; x <= half - 2; x += 3.6) d.push([+(32 + x + (r % 2) * 1.8).toFixed(1), y]);
      }
      return K.line('M32 40 C31 28 30 18 28 6 M30 28 C24 24 18 18 14 12 M30 20 C36 16 42 12 48 6 M29 13 C24 9 20 7 18 3 M31 32 C38 28 44 24 52 20 M31 33 C24 31 18 29 10 28', 1.5, C.brownD) +
        K.dots([[14, 12], [18, 3], [48, 6], [52, 20], [10, 28], [28, 6], [20, 16], [40, 11], [44, 24], [17, 29], [24, 8], [36, 15], [23, 21], [41, 27]], 1.6, C.brown) +
        K.shadow(26) + P('M6 57 C10 46 22 36 32 36 C42 36 54 46 58 57 Z', C.brownL) +
        K.dots(d, 0.9, C.brownD) + K.hi('M12 53 C15 47 20 42 26 40 C23 44 18 48 16 54 Z');
    },
    hay: () => K.shadow(26) +
      // square bale in 3/4 view
      P('M6 28 L36 20 L58 28 L28 36 Z', C.wheatL) +
      P('M6 28 L28 36 V56 L6 48 Z', C.wheat) +
      P('M28 36 L58 28 V48 L28 56 Z', C.wheatD) +
      K.line('M10 34 L24 39 M9 41 L25 47 M12 47 L22 51 M33 42 L52 36 M32 49 L54 42', 1.2, C.wheatD) +
      K.line('M33 42 L52 36 M32 49 L54 42', 1.2, C.brown) +
      K.line('M15 25.5 L37 33 V53.5 M27 22.5 L49 30.5 V50.5', 2, C.brownD) +
      K.line('M2 30 L6 31 M60 26 L57 27 M30 18 L32 21', 1.4, C.wheatD) +
      K.hi('M10 28 L36 22 L40 23.5 L14 30 Z'),

    // ---------------- roots and tubers ----------------
    potato: () => K.shadow(26) +
      P('M6 38 C5 27 14 21 26 22 C39 23 44 30 44 39 C44 49 36 54 24 53 C12 52 7 47 6 38 Z', C.brownL) +
      K.sh('M40 30 C44 38 42 48 32 52 C38 53 44 48 44 39 C44 35 42 32 40 30 Z') +
      K.dots([[15, 33], [28, 30], [35, 42], [19, 45]], 1.3, C.brownD) + K.line('M13 31 C14 30 16 30 17 31 M26 28 C27 27 29 27 30 28', 1.2, C.brownD) +
      K.hiE(15, 28, 5, 2.5, -15) +
      E(44, 47, 15, 10, C.brownL) + E(44, 46.5, 12, 7.6, C.yellowL, 0, 1.4) +
      K.hiE(39, 44, 4, 1.8, -10),
    sweet_potato: () => K.shadow(26) +
      P('M4 40 C6 32 18 22 34 18 C48 15 58 18 58 24 C58 31 46 40 30 45 C18 49 6 48 4 40 Z', C.pinkD) +
      K.line('M18 28 q2 3 0 6 M30 22 q2 3 0 6 M44 19 q2 3 0 6 M24 40 q1.5 -3 0 -5 M38 34 q1.5 -3 0 -5', 1.3, C.redD) +
      K.line('M58 22 L62 20', 1.6) + K.hi('M10 36 C14 30 24 24 32 22 C24 26 16 32 12 38 Z') +
      // cut chunk showing orange flesh
      P('M30 52 C30 44 40 40 48 41 C56 42 58 48 56 52 C54 57 44 58 38 57 C33 56 30 55 30 52 Z', C.pinkD) +
      E(43, 48, 12, 6.5, C.orange, -6, 2) + K.hiE(39, 46, 4, 1.6, -10),
    cassava: () => K.shadow(26) +
      root(10, 38, -28, { len: 48, t: 9, fill: C.brown, dk: C.brownD, cut: C.creamL, rings: 5, tail: 2 }) +
      root(10, 50, -10, { len: 46, t: 8, fill: C.brown, dk: C.brownD, cut: C.creamL, rings: 5, tail: 2 }),
    yam: () => K.shadow(26) +
      P('M14 22 C22 14 40 12 50 18 C58 24 58 34 52 44 C46 54 34 58 24 54 C14 50 10 42 10 34 C10 28 11 25 14 22 Z', C.brownD) +
      K.line('M20 22 l-3 -3 M30 18 l-1 -4 M42 17 l2 -4 M52 24 l4 -2 M54 36 l4 1 M48 48 l3 3 M14 40 l-4 1 M20 32 l3 2 M32 26 l3 2 M44 28 l3 2 M26 42 l3 2 M40 40 l3 2', 1.3, C.choc) +
      K.hi('M16 26 C22 20 30 18 38 18 C30 21 22 24 18 30 Z') +
      // cut slice with purple flesh
      E(46, 48, 13, 8.5, C.brownD) + E(46, 47.5, 10.5, 6.5, C.purpleL, 0, 1.4) + E(46, 47.5, 5, 3, C.purple, 0, 0.1).replace('stroke-width="0.1"', 'stroke="none"') +
      K.hiE(41, 45.5, 3, 1.3, -10),
    taro: () => K.shadow(24) +
      P('M14 46 C8 36 12 22 24 18 C28 16 36 16 40 18 C52 22 56 36 50 46 C46 54 40 57 32 57 C24 57 18 54 14 46 Z', C.brown) +
      K.line('M13 30 C24 34 40 34 52 30 M11 40 C24 45 40 45 53 40 M15 49 C24 53 40 53 49 49', 1.6, C.brownD) +
      K.line('M18 24 l-2 -2 M46 23 l2 -2 M10 36 l-3 0 M54 36 l3 0 M12 46 l-3 1 M52 46 l3 1', 1.2, C.brownD) +
      P('M28 18 C26 12 28 6 32 3 C36 6 38 12 36 18 Z', C.pink, ' stroke-width="2"') +
      K.hi('M18 28 C20 24 24 21 28 20 C24 24 22 28 21 32 Z'),
    carrot: () => K.shadow(22, 58, 36) +
      tops(18, 14, [-60, -30, 0], 12) +
      root(18, 14, 62, { len: 44, t: 7.5, fill: C.orange, dk: C.orangeD, rings: 4 }) +
      tops(36, 16, [-20, 10, 40], 12) +
      root(36, 16, 80, { len: 38, t: 6.5, fill: C.orange, dk: C.orangeD, rings: 4 }),
    beetroot: () => K.shadow(18) +
      K.line('M30 23 L17 13 M31 23 L26 11 M33 23 L38 11 M34 23 L47 13', 2.5, C.redD) +
      E(14, 11, 4.5, 6.5, C.leaf, -50, 1.8) + E(25, 8.5, 4, 5.5, C.leafD, -10, 1.8) + E(39, 8.5, 4, 5.5, C.leaf, 10, 1.8) + E(50, 11, 4.5, 6.5, C.leafD, 50, 1.8) +
      K.line('M30 23 L17 13 M31 23 L26 11 M33 23 L38 11 M34 23 L47 13', 1.5, C.redD) +
      P('M32 22 C44 22 52 30 50 40 C48 50 40 54 34 56 L32 60.5 L30 56 C24 54 16 50 14 40 C12 30 20 22 32 22 Z', C.purple) +
      K.sh('M44 26 C50 32 50 44 42 52 C48 50 52 44 51 36 C50 32 48 28 44 26 Z') +
      K.line('M22 40 q4 2 8 1 M36 46 q3 1 6 -1', 1.3, C.purpleD) + K.hiE(22, 31, 5, 2.6, -40),
    sugar_beet: () => K.shadow(16) +
      tops(32, 18, [-50, -22, 4, 30, 54], 16, C.leaf) +
      P('M18 18 C24 14 40 14 46 18 C50 26 44 40 38 50 L32 60 L28 50 C22 40 14 26 18 18 Z', C.cream) +
      P('M18 18 C24 14 40 14 46 18 C42 21 22 21 18 18 Z', C.leafL, ' stroke-width="2"') +
      K.line('M24 28 q3 2 6 1 M34 36 q3 1 6 -1 M28 44 q2 1 5 0', 1.3, C.creamD) +
      K.sh('M42 22 C44 30 40 40 34 50 L36 50 C42 40 46 30 44 22 Z') + K.hiE(24, 26, 2.5, 6, 15),
    parsnip: () => K.shadow(22, 58, 34) +
      tops(16, 16, [-55, -25, 5], 11, C.leafD) +
      root(16, 16, 58, { len: 46, t: 8, fill: C.creamL, dk: C.creamD, rings: 5 }) +
      tops(42, 14, [-15, 15, 45], 11, C.leafD) +
      root(42, 14, 100, { len: 40, t: 7, fill: C.creamL, dk: C.creamD, rings: 4 }),
    turnip: () => K.shadow(18) +
      tops(32, 20, [-45, -15, 15, 45], 16, C.leaf) +
      P('M32 20 C46 20 54 30 52 40 C50 50 42 54 34 55 L32 62 L30 55 C22 54 14 50 12 40 C10 30 18 20 32 20 Z', C.white) +
      P('M32 20 C46 20 54 30 52 37 C44 41 20 41 12 37 C10 28 18 20 32 20 Z', C.purple, ' stroke="none"') +
      P('M32 20 C46 20 54 30 52 40 C50 50 42 54 34 55 L32 62 L30 55 C22 54 14 50 12 40 C10 30 18 20 32 20 Z', 'none') +
      K.line('M12.5 37 C20 41 44 41 51.5 37', 1.2, C.purpleD) + K.hiE(21, 28, 5, 2.6, -35) +
      K.sh('M46 40 C46 48 40 53 34 55 C42 54 50 49 51.5 40 Z'),
    radish: () => {
      const r = (x, y, sz) =>
        P(`M${x} ${y - sz} C${x + sz * 1.1} ${y - sz} ${x + sz * 1.2} ${y + sz * 0.4} ${x + sz * 0.4} ${y + sz * 0.9} L${x} ${y + sz * 1.8} L${x - sz * 0.4} ${y + sz * 0.9} C${x - sz * 1.2} ${y + sz * 0.4} ${x - sz * 1.1} ${y - sz} ${x} ${y - sz} Z`, C.red) +
        P(`M${x - sz * 0.62} ${y + sz * 0.62} C${x - sz * 0.3} ${y + sz * 0.8} ${x + sz * 0.3} ${y + sz * 0.8} ${x + sz * 0.62} ${y + sz * 0.62} C${x + sz * 0.4} ${y + sz * 0.9} ${x + sz * 0.1} ${y + sz * 1.2} ${x} ${y + sz * 1.8} C${x - sz * 0.1} ${y + sz * 1.2} ${x - sz * 0.4} ${y + sz * 0.9} ${x - sz * 0.62} ${y + sz * 0.62} Z`, C.white, ' stroke-width="1.5"') +
        K.hiE(x - sz * 0.45, y - sz * 0.35, sz * 0.32, sz * 0.18, -35);
      return K.shadow(22) + tops(22, 22, [-35, -5], 16) + tops(42, 26, [5, 35], 16) + tops(32, 24, [-15, 15], 18, C.leafD) +
        r(22, 32, 11) + r(43, 36, 10);
    },
    daikon: () => K.shadow(24, 58, 34) +
      tops(14, 14, [-80, -50, -20, 10], 13, C.leaf) +
      root(14, 14, 45, { len: 52, t: 9.5, fill: C.white, dk: C.greyL, rings: 4, tail: 3 }) +
      `<g transform="translate(14 14) rotate(45)">${P('M0 -9.5 C4 -9.5 9 -9 12 -8.6 L12 8.6 C9 9 4 9.5 0 9.5 C-3.3 9.5 -3.3 -9.5 0 -9.5 Z', C.leafL, ' stroke="none"')}${P('M0 -9.5 C-3.3 -9.5 -3.3 9.5 0 9.5', 'none')}</g>`,
    horseradish: () => K.shadow(24) +
      tops(16, 16, [-50, -15, 15], 15, C.leafD) +
      root(16, 16, 40, { len: 50, t: 7, fill: C.wheat, dk: C.wheatD, rings: 6, tail: 3 }) +
      K.line('M30 36 l-4 3 M40 46 l4 -2 M24 27 l4 -3', 1.5, C.wheatD) +
      // cut chunk
      E(48, 26, 6.5, 9, C.wheatD, -20) + E(46, 25, 5.5, 8.5, C.creamL, -20, 2) + K.dots([[45, 23], [47, 27], [45, 27]], 0.8, C.creamD),
    celeriac: () => K.shadow(22) +
      K.line('M26 20 C24 14 22 8 18 4 M32 20 V3 M38 20 C40 14 42 8 46 4', 3.5, C.leafD) +
      K.line('M26 20 C24 14 22 8 18 4 M32 20 V3 M38 20 C40 14 42 8 46 4', 1.2, C.leafL) +
      K.line('M18 50 l-4 6 M24 53 l-2 6 M32 54 v6 M40 53 l2 6 M46 50 l4 6', 1.6, C.brownD) +
      P('M14 36 C12 26 20 18 32 18 C44 18 52 26 50 36 C52 44 46 54 32 54 C18 54 12 46 14 36 Z', C.creamD) +
      P('M14 36 C12 26 20 18 32 18 C44 18 52 26 50 36 C40 30 24 30 14 36 Z', C.leafL, ' stroke="none"') +
      P('M14 36 C12 26 20 18 32 18 C44 18 52 26 50 36 C52 44 46 54 32 54 C18 54 12 46 14 36 Z', 'none') +
      K.line('M20 42 q3 -1 5 1 M34 46 q3 -1 5 1 M28 38 q2 -1 4 0 M42 38 q2 -1 4 1 M22 50 q2 -1 4 0', 1.3, C.brown) +
      K.hiE(22, 26, 4, 2, -35) + K.sh('M46 36 C48 44 44 51 36 53 C46 53 52 46 50 36 Z'),
    // ---------------- legumes ----------------
    green_beans: () => K.shadow(24) +
      greenBean('M10 50 C18 36 30 22 46 10') + greenBean('M14 56 C26 46 40 32 54 18') + greenBean('M8 40 C16 30 22 20 30 8', C.leafL) +
      K.line('M10 50 C18 36 30 22 46 10 M14 56 C26 46 40 32 54 18', 1.2, C.leafD) +
      K.line('M46 10 L50 5 M54 18 L59 15 M30 8 L32 3', 2.2, C.leafD) +
      K.hi('M12 46 C18 36 26 26 36 18 C28 26 20 36 14 47 Z'),
    peas: () => K.shadow(26) + at(33, 33, -18,
      '<path d="M-28 0 C-22 -12 20 -14 28 -2 L31 -5 L30 1 C22 14 -20 14 -28 0 Z" fill="' + C.leaf + '"/>' +
      '<path d="M-23 0 C-16 -8 16 -9 25 -1 C16 6 -16 7 -23 0 Z" fill="' + C.leafL + '" stroke-width="1.6"/>' +
      [-15, -5, 5, 15].map((x) => Ci(x, 0, 5.2, C.leafL, 2) + K.hiE(x - 1.8, -1.8, 1.8, 1, -20)).join('') +
      K.line('M-26 4 C-16 12 16 12 27 3', 1.3, C.leafD) +
      '<path d="M-28 0 C-30 -2 -31 -4 -30 -7" stroke="' + C.leafD + '" stroke-width="2.5" fill="none"/>'),
    snow_peas: () => {
      const pod = (rot, x, y, f) => at(x, y, rot,
        `<path d="M-24 0 C-18 -8 18 -8 24 -1 L28 -3 L26 1 C18 7 -18 7 -24 0 Z" fill="${f}"/>` +
        [-13, -4, 5, 14].map((xx) => `<ellipse cx="${xx}" cy="0" rx="3.4" ry="2.6" fill="${C.leaf}" fill-opacity=".45" stroke="none"/>`).join('') +
        K.line('M-22 -2 C-14 -6 14 -6 23 -2', 1.2, C.leafD) +
        P('M-24 0 C-27 -4 -26 -8 -22 -9 C-23 -5 -22 -3 -20 -1 Z', C.leafD, ' stroke-width="1.5"'));
      return K.shadow(26) + pod(-28, 30, 24, C.leafL) + pod(-8, 33, 43, C.leafL) + K.hi('M14 38 C20 34 34 33 44 35 C34 36 22 37 15 40 Z');
    },
    broad_beans: () => K.shadow(26) + at(30, 26, -20,
      '<path d="M-28 2 C-24 -14 22 -16 30 -2 L33 -4 L32 2 C24 16 -22 16 -28 2 Z" fill="' + C.leafD + '"/>' +
      '<path d="M-23 2 C-17 -9 18 -10 26 0 C18 9 -17 10 -23 2 Z" fill="' + C.creamL + '" stroke-width="1.6"/>' +
      [-13, 0, 13].map((x) => E(x, 0.5, 6, 4.6, C.leafL, 0, 2) + K.line(`M${x - 2} -3 Q${x} -4.2 ${x + 2} -3`, 1.2, C.leafD)).join('') +
      K.line('M-26 6 C-16 14 16 14 29 4', 1.3, C.pine)) +
      at(22, 50, 15, E(0, 0, 7, 5.2, C.leafL, 0, 2) + K.line('M-2 -3.5 Q0 -4.6 2 -3.5', 1.2, C.leafD) + K.hiE(-3, -1.5, 2, 1, -10)) +
      at(40, 52, -10, E(0, 0, 7, 5.2, C.leafL, 0, 2) + K.line('M-2 -3.5 Q0 -4.6 2 -3.5', 1.2, C.leafD) + K.hiE(-3, -1.5, 2, 1, -10)),
    chickpeas: () => pulse({ shape: 'chick', fill: C.wheat, mark: 'beak', s: 1.2 }),
    lentils: () => pulse({ shape: 'lens', fill: C.brownL, mark: 'none', small: true, pod: C.wheat }),
    red_lentils: () => pulse({ shape: 'lens', fill: C.orange, mark: 'none', small: true, pod: C.wheat }),
    black_beans: () => pulse({ shape: 'oval', fill: C.black, mark: 'hi' }),
    kidney_beans: () => pulse({ shape: 'kidney', fill: C.redD, mark: 'hi' }),
    white_beans: () => pulse({ shape: 'oval', fill: C.creamL, mark: 'hi' }),
    pinto_beans: () => pulse({ shape: 'oval', fill: C.pinkL, mark: 'speck' }),
    soybeans: () => pulse({ shape: 'round', fill: C.yellowL, mark: 'hilumK', pod: C.wheatD, podIn: C.wheat, podDk: C.brownD, fuzz: true }),
    mung_beans: () => pulse({ shape: 'small', fill: C.leaf, mark: 'hi', small: true, pod: C.brownD, podIn: C.brownL, podDk: C.choc }),
    adzuki_beans: () => pulse({ shape: 'small', fill: C.redD, mark: 'hilumW', small: true }),
    black_gram: () => pulse({ shape: 'small', fill: C.black, mark: 'hilumW', small: true, pod: C.brownD, podIn: C.brownL, podDk: C.choc, fuzz: true }),
    black_eyed_peas: () => pulse({ shape: 'kidney', fill: C.creamL, mark: 'eye', s: 1.15 }),
    peanuts: () => {
      const shell = (x, y, r) => at(x, y, r,
        P('M-20 -1 C-20 -9 -8 -10 -4 -5 C-1 -3 2 -3 5 -6 C10 -10 22 -8 21 0 C20 8 10 9 5 6 C2 4 -1 4 -4 6 C-9 10 -20 8 -20 -1 Z', C.wheatL) +
        K.line('M-15 -6 V5 M-9 -7 V6 M10 -7 V5 M16 -6 V5 M-19 -1 H-5 M5 -1 H20', 1.1, C.wheatD) +
        K.hiE(-13, -5, 3, 1.2, -5));
      const nut = (x, y, r) => at(x, y, r, E(0, 0, 5, 3.6, C.terracotta, 0, 1.8) + K.line('M-4 0.5 Q0 2 4 0.5', 1, C.redD) + K.hiE(-2, -1.6, 1.6, 0.8, -10));
      return K.shadow(26) + shell(28, 22, -25) + shell(34, 38, 8) + nut(18, 52, -15) + nut(32, 53, 10) + nut(46, 52, -5) + nut(25, 47, 20);
    },
    // ---------------- oilseeds ----------------
    sunflower_seeds: () => {
      const seed = (x, y, r) => at(x, y, r,
        P('M0 -10 C5 -7 6 3 4 8 C2 10.5 -2 10.5 -4 8 C-6 3 -5 -7 0 -10 Z', C.black) +
        K.line('M-2 -5 L-2.6 6 M2 -5 L2.4 6 M0 -8 V8', 1.2, C.greyL) + K.hiE(-2, -4, 1, 2.4, 10));
      let pet = '';
      for (let i = 0; i < 12; i++) pet += at(40, 20, i * 30, E(0, -12.5, 3.4, 6, C.yellow, 0, 1.8));
      return K.shadow(24) + pet + Ci(40, 20, 9, C.brown) + K.dots([[37, 17], [42, 16], [44, 21], [39, 23], [36, 21], [41, 20]], 1.1, C.choc) +
        seed(14, 44, -30) + seed(26, 48, -5) + seed(38, 50, 25) + seed(50, 48, 50);
    },
    rapeseed: () => {
      const fl = (x, y) => [[-3, -3], [3, -3], [0, 2]].map(([dx, dy]) =>
        [[0, -2.3], [2.3, 0], [0, 2.3], [-2.3, 0]].map(([px, py]) => Ci(x + dx + px, y + dy + py, 2.1, C.yellow, 1)).join('') + Ci(x + dx, y + dy, 1, C.yellowD, 0.6)).join('');
      return K.shadow(22) +
        K.line('M30 58 C28 44 22 30 16 16 M30 58 C31 40 32 26 32 10 M30 58 C34 44 40 32 46 18', 2.5, C.leafD) +
        K.line('M24 34 L18 30 M33 30 L39 26 M40 34 L46 31 M27 46 L21 44', 1.8, C.leaf) +
        P('M30 50 C22 46 12 46 6 50 C14 50 22 52 30 56 Z', C.leaf, ' stroke-width="1.8"') +
        fl(16, 15) + fl(32, 9) + fl(46, 17) +
        K.shadow(10, 58, 50) + P('M38 58 C41 50 46 46 50 46 C54 46 59 50 61 58 Z', C.black, ' stroke-width="2"') +
        K.dots([[44, 54], [48, 51], [52, 54], [56, 55], [49, 56], [51, 49]], 0.9, C.greyD);
    },
    flaxseed: () => {
      const seed = (x, y, r) => at(x, y, r, E(0, 0, 5.6, 3, C.brown, 0, 1.6) + K.hiE(-2, -1, 2, 0.8, -5) + P('M5 -1 L7.5 -2.5 L6 0.5 Z', C.brown, ' stroke-width="1"'));
      let pet = '';
      for (let i = 0; i < 5; i++) pet += at(20, 16, i * 72, P('M0 0 C-6 -4 -6 -12 0 -13 C6 -12 6 -4 0 0 Z', C.blue, ' stroke-width="1.8"') + K.line('M0 -3 V-10', 1, C.blueD));
      return K.shadow(26) + K.line('M20 24 C22 32 28 36 32 40', 2, C.leafD) + pet + Ci(20, 16, 2.6, C.yellow, 1.4) +
        P('M8 57 C12 46 22 38 32 38 C44 38 54 46 58 57 Z', C.brownD) +
        seed(18, 52, -15) + seed(30, 53, 10) + seed(43, 52, -10) + seed(53, 54, 25) + seed(24, 46, 15) + seed(36, 45, -20) + seed(47, 46, 10) + seed(31, 40, 5);
    },
    sesame_seeds: () => {
      const seed = (x, y, r, f = C.creamL) => at(x, y, r, P('M0 -4.4 C2.6 -3 3 2 1.4 3.6 C0.6 4.2 -0.6 4.2 -1.4 3.6 C-3 2 -2.6 -3 0 -4.4 Z', f, ' stroke-width="1.3"'));
      const pts = [];
      for (let r = 0; r < 5; r++) for (let i = 0; i < 6 - r; i++) pts.push([+(30 + r * 2.8 + i * 5.6).toFixed(1), 55 - r * 4.4, (i * 53 + r * 29) % 80 - 40]);
      return K.shadow(26) +
        K.line('M18 58 V40', 2.5, C.leafD) +
        P('M10 40 C8 28 10 14 18 8 C26 14 28 28 26 40 C24 46 12 46 10 40 Z', C.wheatL) +
        P('M14 8 L18 4 L22 8 L18 14 Z', C.wheatD, ' stroke-width="1.8"') +
        K.line('M14 12 C12 22 12 34 14 44 M22 12 C24 22 24 34 22 44 M18 14 V45', 1.3, C.wheatD) +
        K.hi('M11 30 C11 22 12 17 15 13 C14 20 14 26 13 32 Z') +
        P('M30 57 C34 46 40 36 44 36 C50 36 56 46 59 57 Z', C.cream) +
        pts.map(([x, y, r]) => seed(x, y, r)).join('');
    },
    poppy_seeds: () => {
      const d = [];
      for (let r = 0; r < 6; r++) for (let i = 0; i < 9 - r; i++) d.push([+(32 + r * 1.6 + i * 3.4).toFixed(1), 55 - r * 3.4]);
      return K.shadow(26) +
        K.line('M20 58 C20 50 19 44 20 38', 2.5, C.leafD) +
        P('M8 24 C8 12 32 12 32 24 C32 34 26 40 20 40 C14 40 8 34 8 24 Z', C.tealL) +
        K.line('M14 16 C12 24 13 32 16 38 M26 16 C28 24 27 32 24 38', 1.3, C.teal) +
        P('M9 14 L14 8 L20 12 L26 8 L31 14 C26 16 14 16 9 14 Z', C.teal, ' stroke-width="2"') +
        K.line('M14 8 L20 13 L26 8', 1.2, C.tealD) + K.hiE(13, 23, 2, 5, 10) +
        P('M28 57 C32 46 40 38 45 38 C50 38 58 46 61 57 Z', C.blueD) + K.dots(d, 0.85, C.blueL);
    },
    mustard_seeds: () => {
      const pts = [];
      for (let r = 0; r < 6; r++) for (let i = 0; i < 7 - r; i++) pts.push([+(17 + r * 3.1 + i * 6.2).toFixed(1), 54 - r * 5]);
      const pod = (x, y, r) => at(x, y, r, P('M-14 0 C-10 -3 10 -3 14 -0.5 L19 0 L14 0.5 C10 3 -10 3 -14 0 Z', C.wheat, ' stroke-width="1.8"') + K.line('M-12 0 H13', 1, C.wheatD));
      return K.shadow(26) + pod(18, 26, -50) + pod(46, 24, 45) +
        P('M8 57 C12 42 24 26 32 26 C42 26 54 42 58 57 Z', C.yellowD) +
        pts.map(([x, y]) => Ci(x, y, 2.7, C.yellow, 1.3)).join('') + K.hiE(14, 50, 1.2, 4, 25);
    },
    toasted_sesame_seeds: () => {
      const pts = [[18, 34, 20], [24, 30, -30], [30, 34, 60], [36, 30, 10], [42, 33, -40], [22, 38, 80], [28, 40, -10], [34, 38, 40], [40, 39, -70], [46, 36, 30], [26, 26, 50], [33, 25, -20], [40, 27, 70], [17, 30, -60], [30, 30, -80]];
      const seed = (x, y, r, f) => at(x, y, r, P('M0 -3.4 C2 -2.3 2.3 1.5 1.1 2.8 C0.5 3.2 -0.5 3.2 -1.1 2.8 C-2.3 1.5 -2 -2.3 0 -3.4 Z', f, ' stroke-width="1.1"'));
      return K.shadow(26, 57, 28) +
        K.line('M52 34 L59 28', 6) + K.line('M52 34 L59 28', 3, C.woodD) +
        E(30, 34, 25, 15, C.black) + E(30, 33.5, 21, 11.5, C.greyD, 0, 1.5) +
        pts.map(([x, y, r], i) => seed(x, y, r, i % 3 ? C.wheatD : C.brownL)).join('') +
        P('M5 35 C5 46 16 52 30 52 C44 52 55 46 55 35 C55 42 44 49 30 49 C16 49 5 42 5 35 Z', C.black) +
        K.hiE(15, 42, 3, 1, 25);
    },
  });
})(FSI);
