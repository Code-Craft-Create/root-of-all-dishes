// Herbs (fresh sprigs and bunches, each recognisable by its leaf shape) and dried herbs.
(function (FSI) {
  const { C, K } = FSI;
  const f1 = (n) => Math.round(n * 10) / 10;
  const P = (d, fill, sw) => `<path d="${d}" fill="${fill}"${sw ? ` stroke-width="${sw}"` : ''}/>`;
  const R = (a, x, y, m) => (a ? `<g transform="rotate(${a} ${x} ${y})">${m}</g>` : m);
  // stroke drawn twice: ink outline under a coloured core (stems, tubes, needles, round-cap dots)
  const dbl = (d, w, col) => K.line(d, w + 2.4) + K.line(d, w, col);
  const dotsD = (pts) => pts.map(([x, y]) => `M${f1(x)} ${f1(y)}h0`).join('');
  // leaf from base (x,y) pointing up (then rotated by rot), length L, half width w; teeth > 0 gives a serrated edge
  const sLeaf = (x, y, L, w, fill, rot = 0, teeth = 0, vein = C.leafD, sw = 2, ex = 0.8) => {
    const n = teeth ? teeth * 2 : 10, l = [], r = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const hw = w * Math.pow(Math.sin(Math.PI * Math.pow(t, ex)), 0.9) + (teeth && i % 2 && i < n ? 1.4 : 0);
      l.push([x - hw, y - L * t]); r.unshift([x + hw, y - L * t]);
    }
    const pts = l.concat(r.slice(1));
    const d = (teeth ? 'M' + pts.map(([a, b]) => `${f1(a)} ${f1(b)}`).join(' L') :
      `M${x} ${y} C${x - w * 1.3} ${y - L * 0.3} ${x - w} ${y - L * 0.75} ${x} ${y - L} C${x + w} ${y - L * 0.75} ${x + w * 1.3} ${y - L * 0.3} ${x} ${y}`) + ' Z';
    return R(rot, x, y, P(d, fill, sw) + (vein ? K.line(`M${x} ${y - 1} V${f1(y - L * 0.82)}` + (L > 14 ? ` M${x} ${f1(y - L * 0.35)} l-${f1(w * 0.55)} -${f1(L * 0.14)} M${x} ${f1(y - L * 0.35)} l${f1(w * 0.55)} -${f1(L * 0.14)} M${x} ${f1(y - L * 0.6)} l-${f1(w * 0.45)} -${f1(L * 0.12)} M${x} ${f1(y - L * 0.6)} l${f1(w * 0.45)} -${f1(L * 0.12)}` : ''), 1.2, vein) : ''));
  };
  // points along a straight line from (x,y) at angle a (deg, 0 = up, + = clockwise), length L
  const along = (x, y, a, L) => (t) => [x + Math.sin((a * Math.PI) / 180) * L * t, y - Math.cos((a * Math.PI) / 180) * L * t];
  // feathery frond: rachis plus short pinnae on both sides
  const frond = (x, y, a, L, step, pl, spread) => {
    const at = along(x, y, a, L);
    const [ex, ey] = at(1);
    let d = `M${x} ${y} L${f1(ex)} ${f1(ey)}`;
    for (let s = 0.3; s < 0.98; s += step / L) {
      const [px, py] = at(s);
      const len = pl * (1 - s * 0.45);
      for (const sg of [-1, 1]) {
        const b = ((a + sg * spread) * Math.PI) / 180;
        d += ` M${f1(px)} ${f1(py)} l${f1(Math.sin(b) * len)} ${f1(-Math.cos(b) * len)}`;
      }
    }
    return d;
  };
  // round ruffled cluster (curly parsley)
  const ruffle = (cx, cy, r, n, fill, sw) => {
    let d = '';
    const br = f1(r * Math.sin(Math.PI / n) * 1.25);
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const px = f1(cx + Math.cos(a) * r), py = f1(cy + Math.sin(a) * r);
      d += i ? ` A${br} ${br} 0 0 1 ${px} ${py}` : `M${px} ${py}`;
    }
    return P(d + ' Z', fill, sw);
  };
  // dried herb: spice jar with crumbled herb and a label showing the fresh herb
  const dried = (herb, fill, lid) => () =>
    K.jar(fill, lid, K.ref(herb, 32, 41, 0.3)) +
    K.dots([[22, 28.5], [27, 29], [33, 28], [38, 29.5], [43, 28.5], [24, 53.5], [31, 53], [37, 54], [42, 53]], 1.1, C.ink);

  FSI.add('veg_herbs', {
    hops: () => {
      const rows = [[21, 23, 4], [20, 31, 4], [21, 39, 4], [24, 47, 3]].map(([x, y, n], k) => {
        let d = `M${x + (k % 2) * 3} ${y}`;
        for (let q = 0; q < n; q++) { const x0 = x + (k % 2) * 3 + q * 6.5; d += ` Q${x0 + 3.25} ${y + 6} ${x0 + 6.5} ${y}`; }
        return d;
      }).join(' ');
      return K.shadow(14) +
        sLeaf(43, 21, 18, 9, C.leaf, 42, 5) +
        K.line('M24 3 C30 4 33 8 32 15 M32 8 C38 10 41 15 43 21', 2.6, C.leafD) +
        P('M32 14 C42 14 46 24 45 34 C44 44 38 52 32 58 C26 52 20 44 19 34 C18 24 22 14 32 14 Z', C.leafL) +
        K.line(rows, 1.6, C.leaf) + K.sh('M42 24 C46 34 42 46 33 56 C40 48 44 38 42 24 Z') + K.hiE(26, 24, 2.2, 4, 15);
    },
    basil: () =>
      K.shadow(16) + dbl('M32 60 V24', 2.6, C.leafD) +
      sLeaf(31, 46, 24, 10, C.leaf, -64) + sLeaf(33, 46, 24, 10, C.leaf, 64) +
      sLeaf(31, 34, 22, 9.5, C.leaf, -28) + sLeaf(33, 34, 22, 9.5, C.leaf, 28) +
      sLeaf(32, 27, 22, 8.5, C.leafL, 0) + K.hiE(29, 13, 1.6, 4, 10),
    thai_basil: () =>
      K.shadow(16) + dbl('M32 60 V12', 2.4, C.purple) +
      sLeaf(31, 50, 22, 5.5, C.leafD, -62, 0, C.pine) + sLeaf(33, 50, 22, 5.5, C.leafD, 62, 0, C.pine) +
      sLeaf(31, 38, 20, 5.5, C.leafD, -38, 0, C.pine) + sLeaf(33, 38, 20, 5.5, C.leafD, 38, 0, C.pine) +
      [[32, 25, 5.5], [32, 19.5, 4.6], [32, 14.5, 3.8], [32, 10, 3]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.62}" fill="${C.purpleL}" stroke-width="1.8"/>`).join('') +
      K.dots([[29, 25], [35, 25], [30, 19.5], [34, 19.5]], 1.1, C.purpleD) + `<ellipse cx="32" cy="6" rx="2" ry="2.6" fill="${C.purple}" stroke-width="1.8"/>`,
    parsley: () => {
      const cl = [[16, 26, 10], [32, 15, 11], [48, 26, 10], [25, 37, 9], [40, 38, 9]];
      return K.shadow(14) +
        dbl('M32 60 L16 26 M32 60 L32 15 M32 60 L48 26 M32 60 L25 37 M32 60 L40 38', 2, C.leaf) +
        cl.map(([x, y, r]) => ruffle(x, y, r, 9, C.leafD) + ruffle(x - 1, y - 1, r * 0.48, 6, C.leaf, 1.5)).join('');
    },
    cilantro: () => {
      const lf = (x, y, rot) =>
        R(rot, x, y, K.place(P(`M${x} ${y} L${x - 7} ${y - 4} A4 4 0 0 1 ${x - 7} ${y - 12} A4.2 4.2 0 0 1 ${x - 2} ${y - 17} A4.2 4.2 0 0 1 ${x + 3} ${y - 17} A4.2 4.2 0 0 1 ${x + 7} ${y - 12} A4 4 0 0 1 ${x + 7} ${y - 4} Z`, C.leafL, 2) +
          K.line(`M${x} ${y} L${x - 4} ${y - 10} M${x} ${y} V${y - 13} M${x} ${y} L${x + 4} ${y - 10}`, 1.2, C.leaf), x + (32 - x) * 0.85, y + (32 - y) * 0.85, 0.85));
      const tips = [[18, 28, -50], [25, 21, -22], [39, 21, 22], [46, 28, 50], [32, 24, 0], [20, 42, -70], [44, 42, 70]];
      return K.shadow(14) + K.line(tips.map(([x, y]) => `M32 60 L${x} ${y}`).join(' '), 2, C.leafD) + tips.map(([x, y, r]) => lf(x, y, r)).join('');
    },
    dill: () => {
      const fr = [[-40, 44], [-16, 50], [16, 50], [40, 44], [0, 54]].map(([a, L]) => frond(32, 59, a, L, 3.4, 7, 38)).join(' ');
      return K.shadow(14) + K.line(fr, 4) + K.line(fr, 1.6, C.leaf) +
        K.dots([[32, 5], [28.5, 6.5], [35.5, 6.5]], 1.8, C.yellow);
    },
    mint: () =>
      K.shadow(16) + dbl('M32 60 V12', 2.6, C.leafD) +
      sLeaf(31, 52, 19, 8.5, C.leafL, -76, 5) + sLeaf(33, 52, 19, 8.5, C.leafL, 76, 5) +
      sLeaf(31, 38, 20, 9, C.leafL, -58, 5) + sLeaf(33, 38, 20, 9, C.leafL, 58, 5) +
      sLeaf(31, 25, 17, 8, C.leafL, -32, 4) + sLeaf(33, 25, 17, 8, C.leafL, 32, 4) +
      sLeaf(32, 16, 13, 5.5, C.leafL, 0, 3),
    chives: () => {
      const tb = [[22, 16], [27, 8], [33, 5], [39, 9], [44, 18], [13, 26], [51, 26]].map(([x, y]) => `M${32 + (x - 32) * 0.12} 58 L${x} ${y}`).join(' ');
      return K.shadow(12) + K.line(tb, 5.6) + K.line(tb, 3, C.leaf) +
        `<rect x="26" y="40" width="12" height="5" rx="2" fill="${C.woodL}" stroke-width="1.8"/>` +
        `<circle cx="22" cy="14" r="6" fill="${C.purpleL}"/>` + `<circle cx="44" cy="16" r="6" fill="${C.purpleL}"/>` +
        K.dots([[20, 13], [24, 15], [22, 11], [42, 15], [46, 17], [44, 13]], 1.2, C.purpleD);
    },
    rosemary: () => {
      const sp = (x, y, a, L) => frond(x, y, a, L, 3.2, 8, 34);
      const d = sp(22, 59, -14, 52) + ' ' + sp(40, 59, 12, 50) + ' ' + sp(31, 59, -1, 40);
      const stems = 'M22 59 L9.4 8.5 M40 59 L50.4 10.1 M31 59 L30.3 19';
      return K.shadow(16) + K.line(d, 4.6) + K.line(d, 2.2, C.pine) + K.line(stems, 2.6, C.woodD);
    },
    thyme: () => {
      const br = [[32, 59, -30, 50], [32, 59, 0, 52], [32, 59, 28, 50], [32, 59, -12, 34], [32, 59, 14, 36]];
      const stem = br.map(([x, y, a, L]) => { const [ex, ey] = along(x, y, a, L)(1); return `M${x} ${y} L${f1(ex)} ${f1(ey)}`; }).join(' ');
      const pts = [];
      br.forEach(([x, y, a, L]) => { const at = along(x, y, a, L); for (let t = 0.32; t <= 1.001; t += 0.12) { const [px, py] = at(t); pts.push([px - 2.4, py + 0.5], [px + 2.4, py + 0.5]); } pts.push(at(1.04)); });
      return K.shadow(14) + K.line(stem, 2.2, C.brownD) + K.line(dotsD(pts), 5.4) + K.line(dotsD(pts), 3.2, C.leafD);
    },
    oregano: () => {
      const pair = (x, y, a, s) => sLeaf(x, y, 9 * s, 4.6 * s, C.leaf, a - 62, 0, null, 1.8) + sLeaf(x, y, 9 * s, 4.6 * s, C.leaf, a + 62, 0, null, 1.8);
      const br = [[-26, 52], [0, 52], [26, 52]];
      let m = K.shadow(14) + K.line(br.map(([a, L]) => { const [ex, ey] = along(32, 59, a, L)(1); return `M32 59 L${f1(ex)} ${f1(ey)}`; }).join(' '), 2.2, C.leafD);
      br.forEach(([a, L]) => { const at = along(32, 59, a, L); [[0.42, 1.25], [0.66, 1.1], [0.87, 0.9]].forEach(([t, s]) => { const [px, py] = at(t); m += pair(f1(px), f1(py), a, s); }); });
      br.forEach(([a, L]) => { const [px, py] = along(32, 59, a, L + 3)(1); m += `<circle cx="${f1(px)}" cy="${f1(py)}" r="3.2" fill="${C.pink}" stroke-width="1.6"/>`; });
      return m;
    },
    sage: () =>
      K.shadow(14) + K.line('M32 60 V44', 3, C.leafD) +
      sLeaf(31, 48, 30, 8, C.tealL, -34, 0, C.tealD) + sLeaf(33, 48, 30, 8, C.tealL, 34, 0, C.tealD) + sLeaf(32, 46, 34, 9, C.teal, 0, 0, C.tealD) +
      K.dots([[28.5, 26], [35.5, 26], [29, 34], [35, 34], [30, 19], [34, 19]], 0.9, C.tealD) + K.hiE(28, 22, 1.5, 4, 10),
    tarragon: () => {
      let m = K.shadow(14) + dbl('M32 60 C32 44 30 26 26 6 M31 40 C38 30 46 22 52 16', 2, C.leafD);
      [[31, 52, -58], [32, 46, 50], [30, 38, -50], [30.5, 28, -40], [29, 20, 30], [27.5, 12, -24], [36, 34, 20], [41, 28, 70], [45.5, 22, 10], [50, 18, 60]]
        .forEach(([x, y, r]) => (m += sLeaf(x, y, 18, 2.6, C.leaf, r, 0, null, 1.8)));
      return m;
    },
    marjoram: () => {
      const pair = (x, y, a, s) => sLeaf(x, y, 8 * s, 4.4 * s, C.leafL, a - 60, 0, null, 1.8) + sLeaf(x, y, 8 * s, 4.4 * s, C.leafL, a + 60, 0, null, 1.8);
      const br = [[-26, 46], [0, 46], [26, 46]];
      let m = K.shadow(14) + K.line(br.map(([a, L]) => { const [ex, ey] = along(32, 59, a, L)(1); return `M32 59 L${f1(ex)} ${f1(ey)}`; }).join(' '), 2.2, C.leafD);
      br.forEach(([a, L]) => { const at = along(32, 59, a, L); [[0.45, 1.25], [0.72, 1.05]].forEach(([t, s]) => { const [px, py] = at(t); m += pair(f1(px), f1(py), a, s); }); });
      br.forEach(([a, L]) => {
        const [px, py] = along(32, 59, a, L + 6)(1);
        m += `<ellipse cx="${f1(px)}" cy="${f1(py)}" rx="4.6" ry="6" fill="${C.creamD}" transform="rotate(${a} ${f1(px)} ${f1(py)})"/>` +
          R(a, f1(px), f1(py), K.line(`M${f1(px - 4)} ${f1(py - 1.5)} H${f1(px + 4)} M${f1(px - 3.6)} ${f1(py + 2.5)} H${f1(px + 3.6)}`, 1.2, C.wheatD));
      });
      return m;
    },
    lavender: () => {
      const st = [[-20, 52], [-7, 54], [7, 54], [20, 52]];
      let m = K.shadow(12) + K.line(st.map(([a, L]) => { const [ex, ey] = along(32, 60, a, L)(1); return `M32 60 L${f1(ex)} ${f1(ey)}`; }).join(' '), 2.4, C.tealD);
      st.forEach(([a, L], k) => {
        const at = along(32, 60, a, L);
        for (let t = 0.6; t <= 1.01; t += 0.09) {
          const [px, py] = at(t), r = 4.2 - (t - 0.6) * 4;
          m += `<ellipse cx="${f1(px)}" cy="${f1(py)}" rx="${f1(r)}" ry="${f1(r * 0.75)}" fill="${k % 2 ? C.purple : C.purpleL}" stroke-width="1.6" transform="rotate(${a} ${f1(px)} ${f1(py)})"/>`;
        }
      });
      return m + sLeaf(31, 58, 16, 2.4, C.tealL, -50, 0, null, 1.8) + sLeaf(33, 58, 16, 2.4, C.tealL, 50, 0, null, 1.8);
    },
    shiso: () =>
      K.shadow(16) + K.line('M32 60 V46', 3, C.purpleD) +
      sLeaf(31, 50, 30, 13, C.purpleD, -40, 7, C.purpleL, 2, 0.65) +
      sLeaf(33, 52, 40, 15, C.purple, 14, 8, C.purpleL, 2, 0.65) + K.hiE(30, 30, 2, 5, 15),
    lovage: () => {
      const tri = (x, y, a) => sLeaf(x, y, 13, 7, C.leafD, a - 40, 3, C.pine, 1.8, 0.55) + sLeaf(x, y, 13, 7, C.leafD, a + 40, 3, C.pine, 1.8, 0.55) + sLeaf(x, y, 15, 7.5, C.leafD, a, 3, C.pine, 1.8, 0.55);
      return K.shadow(14) + dbl('M32 60 V30 M32 44 L18 30 M32 44 L46 30', 2.6, C.leaf) +
        tri(18, 30, -40) + tri(46, 30, 40) + tri(32, 30, 0);
    },
    lemongrass: () => {
      const st = (x, top, lean, base) =>
        K.line(`M${x} 30 C${x} 20 ${x + lean * 0.5} 12 ${x + lean} ${top}`, 4.6) + K.line(`M${x} 30 C${x} 20 ${x + lean * 0.5} 12 ${x + lean} ${top}`, 2.2, C.leaf) +
        P(`M${x - 3} 30 C${x - 3.5} 40 ${x - 5} 50 ${x - 3.5} 56 C${x - 2} 59 ${x + 2} 59 ${x + 3.5} 56 C${x + 5} 50 ${x + 3.5} 40 ${x + 3} 30 C${x + 3} 26 ${x - 3} 26 ${x - 3} 30 Z`, base, 2) +
        K.line(`M${x - 3} 38 Q${x} 40 ${x + 3} 38 M${x - 4} 47 Q${x} 49 ${x + 4} 47`, 1.2, C.creamD);
      return K.shadow(18) + st(20, 6, -12, C.leafL) + st(44, 6, 12, C.leafL) + st(32, 3, 0, C.creamL) +
        K.line('M18 28 C10 20 8 14 6 12 M46 28 C54 20 56 16 58 14', 2.5, C.leafD);
    },
    kaffir_lime_leaves: () => {
      const kl = (rot, f) =>
        R(rot, 32, 58, P('M32 58 C26 54 25 44 28 37 C30 36 31 36 32 35 C33 36 34 36 36 37 C39 44 38 54 32 58 Z', f) +
          P('M32 36 C22 32 20 18 25 10 C28 6 31 4 32 3 C33 4 36 6 39 10 C44 18 42 32 32 36 Z', f) +
          K.line('M32 57 V5', 1.3, C.leafL) + K.hi('M27 26 C26 20 27 15 30 10 L31 12 C29 17 28.5 21 29 26 Z'));
      return K.shadow(16) + kl(-26, C.leafD) + kl(18, C.pine);
    },
    wild_garlic: () =>
      K.shadow(16) +
      sLeaf(29, 59, 46, 7.5, C.leaf, -24, 0, C.leafD) + sLeaf(35, 59, 44, 7.5, C.leafD, 26, 0, C.pine) +
      dbl('M32 59 V20', 1.8, C.leafL) + K.line('M32 20 L22 12 M32 20 L28 8 M32 20 L36 8 M32 20 L42 12 M32 20 L32 6', 1.4, C.leafD) +
      [[22, 12], [28, 7], [36, 7], [42, 12], [32, 5], [32, 16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="${C.white}" stroke-width="1.6"/>`).join('') +
      K.dots([[22, 12], [28, 7], [36, 7], [42, 12], [32, 5], [32, 16]], 1, C.yellow),
    elderflowers: () => {
      const um = [[18, 22], [32, 16], [46, 22], [25, 30], [39, 30]];
      const pts = [];
      um.forEach(([cx, cy]) => [[0, 0], [-4, 1], [4, 1], [-2, -3.5], [2, -3.5], [-6, -2.5], [6, -2.5], [0, -6]].forEach(([dx, dy]) => pts.push([cx + dx, cy + dy])));
      return K.shadow(16) +
        sLeaf(30, 56, 18, 6, C.leaf, -66, 4) + sLeaf(34, 56, 18, 6, C.leaf, 66, 4) +
        K.line(um.map(([x, y]) => `M32 58 L${x} ${y + 1}`).join(' '), 2.2, C.leafD) +
        K.line(dotsD(pts), 6) + K.line(dotsD(pts), 3.8, C.creamL) + K.dots(um.map(([x, y]) => [x, y - 2]), 0.9, C.yellow);
    },
    dried_oregano: dried('oregano', C.leafD, C.red),
    dried_thyme: dried('thyme', C.brownL, C.woodD),
    dried_rosemary: dried('rosemary', C.pine, C.greyD),
    dried_mint: dried('mint', C.leaf, C.teal),
    dried_lavender: dried('lavender', C.purple, C.purpleD),
  });
})(FSI);
