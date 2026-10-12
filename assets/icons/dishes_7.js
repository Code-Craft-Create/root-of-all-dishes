// Dishes: more Indian & South Asian, and Around the World (group dishes_7), plus their new ingredients. See assets/STYLE.md.
(function (FSI) {
  const { C, K } = FSI;
  // ---- local helpers (same as dishes_6) ----
  const sw = (w) => ` stroke-width="${w}"`;
  const NS = ' stroke="none"';
  const tr = (x, y, a = 0, s = 1) => ` transform="translate(${x} ${y}) rotate(${a})${s !== 1 ? ` scale(${s})` : ''}"`;
  const E = (cx, cy, rx, ry, f, x = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}"${x}/>`;
  const O = (cx, cy, r, f, x = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${x}/>`;
  const P = (d, f, x = '') => `<path d="${d}" fill="${f}"${x}/>`;
  const R = (x, y, w, h, f, x2 = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.2" fill="${f}"${x2}/>`;
  const leaf = (x, y, a, l = 8, w = 3, f = C.leaf, s = 1.5) =>
    P(`M0 0 C${l * 0.3} ${-w} ${l * 0.7} ${-w} ${l} 0 C${l * 0.7} ${w} ${l * 0.3} ${w} 0 0 Z`, f, sw(s) + tr(x, y, a));
  const swirl = (d, col = C.white, w = 2.2) => K.line(d, w + 2.3) + K.line(d, w, col);
  const sprig = (x, y, a, f = C.leaf, n = 3) => {
    let s = K.line(`M0 0 H${n * 4 + 2}`, 1.3, C.leafD);
    for (let i = 0; i < n; i++) s += E(i * 4 + 4, i % 2 ? 2.4 : -2.4, 2.6, 1.9, f, sw(1.2));
    return `<g${tr(x, y, a)}>${s}</g>`;
  };
  const cube = (x, y, s, top, side) =>
    P(`M${x} ${y} l${s} ${-s * 0.4} l${s} ${s * 0.4} v${s} l${-s} ${s * 0.4} l${-s} ${-s * 0.4} Z`, side, sw(1.3)) +
    P(`M${x} ${y} l${s} ${-s * 0.4} l${s} ${s * 0.4} l${-s} ${s * 0.4} Z`, top, sw(1.3));
  const lemonWedge = (x, y, a = 0, f = C.yellow, fl = C.yellowL) =>
    `<g${tr(x, y, a)}>` + P('M-8 0 C-8 6 8 6 8 0 Z', f, sw(1.8)) + P('M-6 0.6 C-5.5 4 5.5 4 6 0.6 Z', fl, NS) +
    K.line('M0 0.6 V4 M-3.5 0.6 L-2.5 3.3 M3.5 0.6 L2.5 3.3', 1, f) + '</g>';
  const bean = (x, y, a, f = C.meatD, s = 1) =>
    P('M-3.5 -1 C-3 -3.5 3 -3.5 3.5 -1 C4 2 0 1 -1 2.5 C-3 3.5 -4 1 -3.5 -1 Z', f, sw(1.2) + tr(x, y, a, s));
  const pea = (x, y, f = C.leaf) => O(x, y, 1.9, f, sw(1.1));
  const grains = (pts, f = C.white) => pts.map(([x, y, a = 0]) => E(x, y, 1.9, 1, f, sw(0.9) + ` transform="rotate(${a} ${x} ${y})"`)).join('');
  // dumpling seen from the side: pleated top
  const dumpling = (x, y, s = 1, f = C.creamL) =>
    `<g${tr(x, y, 0, s)}>` + P('M-11 4 C-12 -4 -5 -9 0 -9 C5 -9 12 -4 11 4 C6 6 -6 6 -11 4 Z', f, sw(1.8)) +
    K.line('M-4 -7 C-3 -3 -3 0 -4 3 M0 -9 V3 M4 -7 C3 -3 3 0 4 3', 1.1, C.creamD) + K.hiE(-6, -4, 2.4, 1.2) + '</g>';
  // round flatbread seen from above, golden with bubbles
  const flatbread = (x, y, rx, ry, f = C.wheatL) =>
    E(x, y, rx, ry, f) + K.dots([[x - rx * 0.5, y - ry * 0.2], [x + rx * 0.3, y - ry * 0.4], [x + rx * 0.1, y + ry * 0.4], [x - rx * 0.2, y + ry * 0.1]], 1.6, C.wheatD);
  // fish seen from the side, head left
  const fish = (x, y, s = 1, body = C.grey, belly = C.greyL, a = 0) =>
    `<g${tr(x, y, a, s)}>` +
    P('M14 0 L23 -7 L22 0 L23 7 Z', body, sw(2)) +
    P('M-20 0 C-16 -9 -2 -11 8 -7 C12 -5 14 -2 15 0 C14 2 12 5 8 7 C-2 11 -16 9 -20 0 Z', body, sw(2)) +
    P('M-18 1.5 C-12 7 0 8 10 4.5 C2 5 -10 4.5 -18 1.5 Z', belly, NS) +
    O(-13, -2, 1.8, C.white, sw(1.2)) + O(-12.7, -2, 0.7, C.ink, NS) + K.line('M-8 -5 C-6 -1 -6 2 -8 6', 1.4) +
    K.hiE(-2, -5, 5, 1.5, -5) + '</g>';
  const skewer = (x1, y1, x2, y2) => K.line(`M${x1} ${y1} L${x2} ${y2}`, 3.6) + K.line(`M${x1} ${y1} L${x2} ${y2}`, 1.6, C.woodL);

  FSI.add('dishes_7', {
    // ======== new ingredients ========
    ackee: () =>
      K.shadow(20) +
      P('M32 14 C44 14 53 24 52 37 C51 48 43 55 32 55 C21 55 13 48 12 37 C11 24 20 14 32 14 Z', C.red) +
      P('M32 22 C28 30 28 42 32 50 C36 42 36 30 32 22 Z', C.yellowL, sw(1.8)) +
      P('M20 26 C18 34 20 43 25 48 C27 40 26 31 20 26 Z', C.yellowL, sw(1.6)) +
      P('M44 26 C46 34 44 43 39 48 C37 40 38 31 44 26 Z', C.yellowL, sw(1.6)) +
      O(32, 21, 3.6, C.black, sw(1.5)) + O(21.5, 25.5, 3.2, C.black, sw(1.5)) + O(42.5, 25.5, 3.2, C.black, sw(1.5)) +
      P('M31 14 C31 10 33 7 36 6', 'none', sw(2.4)) + K.hiE(17, 22, 3, 1.6) + K.sh('M50 36 C49 46 43 53 34 54.5 C43 50 48 44 50 36 Z'),
    barramundi: () => K.shadow(26) + fish(31, 34, 1.15, C.greyD, C.steel),
    ajvar: () => K.jar(C.redD, C.leafD, P('M24 41 C24 36 30 34 33 36 C36 34 41 37 40 42 C39 46 34 48 32 46 C29 48 24 46 24 41 Z', C.red, sw(1.5)) +
      K.line('M32 36 C32 34 33 33 34 32.5', 1.6, C.leafD)),
    pickled_herring: () => K.jar(C.glass, C.blue,
      '') + fish(32, 34, 0.55, C.steel, C.white, -25) + fish(32, 46, 0.55, C.steel, C.white, 20) +
      O(22, 40, 2, C.purpleL, sw(1.1)) + O(42, 38, 2, C.purpleL, sw(1.1)) + O(40, 51, 1.8, C.purpleL, sw(1.1)) + K.line('M20 28 L24 31 M44 45 L47 48', 1.2, C.leafD),
    honeycomb_toffee: () =>
      K.shadow(24) +
      P('M8 34 L22 20 L44 18 L56 30 L50 50 L28 54 L12 48 Z', C.yellow) +
      P('M8 34 L22 20 L44 18 L56 30 L38 33 Z', C.yellowL) +
      [[18, 40], [27, 44], [37, 42], [45, 38], [22, 48], [33, 49], [44, 46]].map(([x, y]) => E(x, y, 2.6, 2, C.yellowD, sw(1.2))).join('') +
      [[24, 27], [33, 24], [42, 26], [30, 30]].map(([x, y]) => E(x, y, 2, 1.2, C.orange, sw(1))).join('') +
      K.sh('M50 50 L56 30 L38 33 L42 52 Z') + K.hi('M13 33 L23 23 L26 24 L16 34 Z'),

    // ======== Indian & South Asian ========
    tandoori_chicken: () =>
      K.plate(P('M14 40 C10 32 16 24 26 26 C34 27 36 36 30 42 C26 46 18 46 14 40 Z', C.redD) +
        K.line('M28 41 L34 46', 5) + K.line('M28 41 L34 46', 2.6, C.creamL) +
        P('M34 36 C32 28 40 22 48 26 C55 30 52 40 46 42 C41 44 36 41 34 36 Z', C.red) +
        K.line('M18 32 C21 30 24 31 26 33 M38 30 C41 28 45 29 47 31', 1.4, C.redL) +
        P('M40 47 C40 44 47 43 52 45 C50 48 44 49 40 47 Z', C.creamL, sw(1.6)) + O(44, 46, 1, C.leafD, NS) +
        lemonWedge(17, 47, 15) + O(23, 49, 1.6, C.purpleL, sw(1)), C.white),
    chole_bhature: () =>
      K.plate(P('M6 34 C6 22 22 16 30 22 C34 26 30 36 22 40 C14 43 7 41 6 34 Z', C.wheatL) +
        K.hiE(14, 25, 4, 2) + K.dots([[16, 31], [22, 27], [12, 35]], 1.4, C.wheatD) +
        E(42, 40, 14, 7.5, C.woodD) + E(42, 39, 12, 5.8, C.orangeD, NS) +
        [[35, 38], [39, 41], [44, 37.5], [48, 40.5], [42, 42.5]].map(([x, y]) => O(x, y, 2.2, C.wheat, sw(1.2))).join('') +
        leaf(37, 35.5, -20, 5, 2, C.leafD, 1) + P('M18 46 C20 44 26 44 28 46 C26 48 20 48 18 46 Z', C.purpleL, sw(1.4)), C.white),
    rajma_chawal: () =>
      K.plate(P('M8 38 C8 30 18 28 26 30 C30 33 30 42 24 45 C16 47 8 45 8 38 Z', C.white) +
        grains([[13, 36, 20], [17, 33, -10], [21, 37, 40], [15, 41, 0], [22, 42, -30], [25, 34, 10]], C.white) +
        P('M28 36 C28 28 40 26 50 29 C57 32 57 42 50 45 C42 48 30 46 28 36 Z', C.orangeD) +
        [[34, 35, 10], [40, 32, -20], [46, 36, 30], [38, 40, -10], [50, 40, 60], [44, 42, 0]].map(([x, y, a]) => bean(x, y, a, C.meatD)).join('') +
        leaf(36, 30, -30, 5, 2, C.leafD, 1), C.white),
    pav_bhaji: () =>
      K.plate(E(36, 39, 15, 8, C.orangeD) + E(36, 38, 12.5, 6, C.orange, NS) +
        P('M33 36 C35 33 40 33 42 35 C40 37 35 37 33 36 Z', C.yellowL, sw(1.3)) +
        K.dots([[30, 39], [44, 40], [38, 42]], 1.2, C.leafD) + O(27, 36, 1.6, C.purpleL, sw(1)) +
        P('M6 34 C6 26 12 24 16 24 C20 24 24 26 24 34 Z', C.wheat) + P('M14 34 C14 26 20 24 24 24 C28 24 31 27 30 34 Z', C.wheat) +
        R(6, 33, 24, 4, C.wheatL, sw(1.6)) + K.hiE(11, 27, 2.5, 1.3) + K.hiE(21, 27, 2.5, 1.3) +
        lemonWedge(50, 47, -15), C.white),
    idli_with_sambar: () =>
      K.plate(E(18, 38, 9, 5, C.white) + E(18, 36.5, 7, 3, C.milk, NS) + E(30, 44, 9, 5, C.white) + E(30, 42.5, 7, 3, C.milk, NS) +
        E(45, 36, 12, 7, C.steel) + E(45, 35, 10, 5.2, C.orangeD, NS) +
        cube(40, 34, 2.2, C.orangeL, C.orange) + O(48, 35, 1.8, C.leaf, sw(1)) + O(45, 37.5, 1.5, C.yellowL, sw(1)) +
        K.dots([[42, 37.5], [50, 33.5]], 0.9, C.ink), C.leafD, C.leaf),
    malai_kofta: () =>
      K.bowl(O(20, 30, 4.6, C.wheat, sw(1.8)) + O(32, 29, 4.6, C.wheat, sw(1.8)) + O(44, 31, 4.6, C.wheat, sw(1.8)) +
        K.hiE(18.5, 28, 1.6, 0.9) + K.hiE(30.5, 27, 1.6, 0.9) + K.hiE(42.5, 29, 1.6, 0.9) +
        swirl('M24 34 C28 36 34 36 38 34', C.creamL, 1.6) + leaf(36, 25, -40, 5, 2, C.leafD, 1),
      C.terracotta, C.orange) + K.steam(32, 12),
    momos: () =>
      K.plate(dumpling(19, 37, 0.85) + dumpling(34, 33, 0.85) + dumpling(29, 45, 0.85) +
        E(48, 43, 7, 4, C.white) + E(48, 42.5, 5.5, 2.8, C.red, NS) + K.dots([[46, 42], [50, 43]], 0.9, C.redD), C.woodL, C.wood),
    machher_jhol: () =>
      K.bowl(P('M14 29 C15 25 24 24 28 27 C29 31 20 33 14 29 Z', C.white, sw(1.6)) + K.line('M17 28 C20 27 23 27 26 28', 1, C.greyL) +
        P('M34 28 C35 24 44 23 48 26 C49 30 40 32 34 28 Z', C.white, sw(1.6)) +
        cube(28, 30, 3, C.yellowL, C.yellow) + leaf(42, 32, 10, 6, 2.2, C.leafD, 1.1) + E(22, 33, 2.2, 1.1, C.red, sw(1)),
      C.white, C.yellow) + K.steam(32, 12),
    appam_with_vegetable_stew: () =>
      K.plate(E(22, 38, 16, 9, C.wheat) + E(22, 37.5, 11, 6, C.creamL, NS) + K.line('M10 38 C14 33 30 33 34 38', 1, C.wheatD) +
        E(45, 35, 11, 6.5, C.creamD) + E(45, 34.5, 9, 4.8, C.white, NS) +
        cube(40, 33, 2.4, C.orangeL, C.orange) + cube(46, 32, 2.4, C.yellowL, C.wheat) + pea(50, 35.5) + leaf(44, 37, 0, 5, 1.8, C.leafD, 1), C.white),
    jalebi: () =>
      K.plate([[20, 36], [33, 32], [44, 38], [30, 44]].map(([x, y]) =>
        swirl(`M${x} ${y} C${x + 2} ${y - 2} ${x + 5} ${y} ${x + 3} ${y + 3} C${x + 1} ${y + 6} ${x - 5} ${y + 4} ${x - 5} ${y} C${x - 5} ${y - 5} ${x + 2} ${y - 7} ${x + 7} ${y - 4}`, C.orange, 2.6)).join('') +
        K.dots([[26, 31], [40, 30], [37, 45]], 1, C.yellowL), C.white),

    // ======== Eastern Europe, Caucasus, Central Asia ========
    golabki: () =>
      K.plate(E(32, 39, 23, 9, C.red) +
        [[20, 37, -10], [32, 35, 0], [44, 37, 10]].map(([x, y, a]) =>
          `<g${tr(x, y, a)}>` + P('M-8 -4 C-8 -8 8 -8 8 -4 V4 C8 8 -8 8 -8 4 Z', C.leafL, sw(1.8)) + K.line('M-4 -6 C-2 -2 2 2 3 6 M2 -6 C1 -2 -1 0 -3 2', 1.1, C.leaf) + '</g>').join('') +
        swirl('M24 46 C28 48 34 48 38 46', C.white, 1.6), C.white),
    pelmeni: () =>
      K.bowl([[16, 30], [25, 27.5], [34, 30], [43, 27], [48, 31], [29, 33.5]].map(([x, y]) =>
        P(`M${x - 4} ${y} C${x - 4} ${y - 4} ${x + 4} ${y - 4} ${x + 4} ${y} C${x + 2} ${y + 2.4} ${x - 2} ${y + 2.4} ${x - 4} ${y} Z`, C.creamL, sw(1.5))).join('') +
        P('M36 25 C36 22 44 22 44 25 C42 27 38 27 36 25 Z', C.white, sw(1.4)) + sprig(38, 24, -20, C.leaf, 2),
      C.blueD, C.yellowL),
    syrniki: () =>
      K.plate([[18, 37], [32, 33], [44, 39]].map(([x, y]) => E(x, y + 2, 8.5, 4.5, C.wheatD) + E(x, y, 8.5, 4.2, C.wheat) + K.hiE(x - 3, y - 1, 2.5, 1.1)).join('') +
        P('M24 44 C24 41 32 41 34 44 C32 47 26 47 24 44 Z', C.white, sw(1.5)) +
        P('M38 46 C38 43 46 43 47 46 C45 48 40 48 38 46 Z', C.red, sw(1.5)), C.white),
    olivier_salad: () =>
      K.bowl(E(32, 28, 19, 5.5, C.creamL, NS) +
        cube(17, 28, 2.6, C.yellowL, C.creamD) + cube(26, 26, 2.6, C.orangeL, C.orange) + cube(36, 28, 2.6, C.pinkL, C.pink) + cube(43, 25.5, 2.4, C.leafL, C.leaf) +
        pea(23, 31) + pea(31, 31.5) + pea(46, 30) + pea(34, 25) + sprig(13, 26, -15, C.leaf, 2), C.white, C.creamL),
    bigos: () =>
      K.pot(E(32, 26.5, 21, 4, C.wheat, NS) +
        K.line('M14 26 C18 24 22 28 26 26 M30 27 C34 25 38 29 42 26 M20 28.5 C24 27 26 30 30 28.5', 1.4, C.wheatL) +
        O(20, 25.5, 3, C.meat, sw(1.3)) + O(20, 25.5, 1.4, C.meatL, NS) + O(38, 24.5, 3, C.meat, sw(1.3)) + O(38, 24.5, 1.4, C.meatL, NS) +
        cube(28, 23.5, 2.6, C.brownL, C.brown) + E(45, 27, 2.2, 1.5, C.purpleD, sw(1.1)), C.brownD) + K.steam(32, 12),
    langos: () =>
      K.plate(P('M8 38 C6 28 18 24 32 25 C48 26 58 31 56 40 C54 49 40 52 30 51 C16 50 9 46 8 38 Z', C.wheat) +
        P('M14 38 C13 32 22 29 32 30 C44 31 50 34 49 40 C48 45 38 47 30 46 C20 45 15 43 14 38 Z', C.creamL, NS) +
        K.line('M18 36 L24 38 M28 33 L35 35 M38 37 L44 36 M24 42 L30 43 M34 41 L40 42', 1.8, C.yellow) +
        K.dots([[22, 34], [40, 33], [33, 39]], 0.9, C.creamD), C.white),
    cevapi: () =>
      K.plate(E(30, 40, 22, 10, C.wheatL) + K.dots([[14, 40], [42, 46], [46, 34]], 1.4, C.wheatD) +
        [[22, 35], [28, 39], [34, 43]].map(([x, y]) => `<g${tr(x, y, -18)}>` + R(-10, -3, 20, 6, C.brownD, sw(1.8)) + K.hiE(-4, -1.4, 3, 0.9, 0) + '</g>').join('') +
        P('M42 36 C42 33 50 32 52 35 C51 38 44 39 42 36 Z', C.red, sw(1.5)) +
        K.line('M14 46 C16 44 18 44 20 45 M18 48 C20 46 22 46 24 47', 1.6, C.purpleL), C.white),
    khachapuri: () =>
      K.plate(P('M5 38 C14 26 26 24 32 24 C38 24 50 26 59 38 C50 50 38 52 32 52 C26 52 14 50 5 38 Z', C.wheat) +
        P('M14 38 C20 31 27 30 32 30 C37 30 44 31 50 38 C44 45 37 46 32 46 C27 46 20 45 14 38 Z', C.yellowL) +
        E(32, 38, 6, 4.2, C.white, sw(1.4)) + O(32, 38, 2.8, C.orange, sw(1.3)) +
        R(40, 34, 5, 3.5, C.yellow, sw(1.3)) + K.hiE(12, 33, 3, 1.3) + K.sh('M50 40 L59 38 C54 45 48 49 40 51 C46 47 48 44 50 40 Z'), C.white),
    plov: () =>
      K.plate(P('M8 40 C8 30 20 26 32 26 C44 26 56 30 56 40 C56 46 44 48 32 48 C20 48 8 46 8 40 Z', C.wheatL) +
        grains([[16, 38, 20], [22, 34, -10], [28, 42, 30], [40, 43, 0], [46, 38, -20], [48, 33, 10], [14, 43, 0], [36, 31, 40]], C.yellowL) +
        K.line('M18 40 L22 37 M42 34 L45 31 M34 44 L38 41 M24 30 L27 28', 1.8, C.orange) +
        P('M26 33 C26 29 38 29 38 33 C38 37 26 37 26 33 Z', C.brownD, sw(1.6)) + K.hiE(29, 31.5, 2.4, 1) +
        E(42, 31, 3, 2.6, C.creamL, sw(1.3)) + K.line('M42 29 V33', 1, C.creamD), C.terracotta, C.terracotta),

    // ======== Scandinavia ========
    karelian_pies: () =>
      K.plate([[20, 38, -10], [42, 36, 12]].map(([x, y, a]) => `<g${tr(x, y, a)}>` +
        P('M-13 0 C-13 -7 -6 -8 0 -8 C6 -8 13 -7 13 0 C13 7 6 8 0 8 C-6 8 -13 7 -13 0 Z', C.brown, sw(1.8)) +
        P('M-9 0 C-9 -4 -5 -5 0 -5 C5 -5 9 -4 9 0 C9 4 5 5 0 5 C-5 5 -9 4 -9 0 Z', C.yellowL, sw(1.3)) +
        K.line('M-12 -3 L-9 -2 M-12 3 L-9 2 M12 -3 L9 -2 M12 3 L9 2 M-6 -7 L-5 -4.5 M6 -7 L5 -4.5 M-6 7 L-5 4.5 M6 7 L5 4.5', 1.2, C.brownD) +
        K.dots([[-3, -1], [2, 1], [4, -2]], 0.8, C.wheatD) + '</g>').join('') +
        P('M28 47 C28 44 36 44 37 47 C35 50 30 50 28 47 Z', C.yellow, sw(1.4)), C.white),
    janssons_temptation: () =>
      `${K.shadow(26)}<path d="M5 30 C5 26 9 24 13 24 H51 C55 24 59 26 59 30 V46 C59 52 55 55 49 55 H15 C9 55 5 52 5 46 Z" fill="${C.white}"/>` +
      P('M9 30 C9 28 11 27 14 27 H50 C53 27 55 28 55 30 V35 H9 Z', C.wheat, NS) +
      K.line('M13 30 C17 28 20 32 24 29 C28 27 31 32 36 29 C40 27 44 31 48 29 C50 28 52 30 53 31', 1.6, C.wheatD) +
      K.dots([[16, 32], [27, 31], [40, 32], [49, 33], [33, 33]], 1.2, C.brown) +
      K.line('M5 35 H59', 1.5) + K.line('M13 41 L22 41 M27 44 L36 44 M40 41 L50 41', 1.5, C.greyL) +
      K.hi('M8 38 H11 V48 C10 48 8 47 8 45 Z') + K.steam(32, 14),
    norwegian_fish_soup: () =>
      K.bowl(P('M15 29 C16 26 22 25 24 27 C25 30 19 32 15 29 Z', C.white, sw(1.5)) +
        P('M36 31 C36 28 42 27 44 29 C45 32 39 34 36 31 Z', C.white, sw(1.5)) +
        cube(26, 28, 2.6, C.orangeL, C.orange) + O(45, 26, 2.4, C.leafL, sw(1.2)) + O(45, 26, 1, C.leafD, NS) +
        K.line('M30 33 L33 32 M20 33.5 L22 32 M47 30.5 L49 32', 1.6, C.leafD), C.blueL, C.milk) + K.steam(32, 12),
    pickled_herring_on_rye: () =>
      K.board(`<g${tr(32, 40, -18)}>` + R(-17, -7, 34, 14, C.brownD, sw(2)) + R(-15, -5.5, 30, 3, C.brown, NS) + '</g>' +
        fish(31, 36, 0.62, C.steel, C.white, -18) +
        P('M38 31 C38 28 45 28 46 31 C44 33 40 33 38 31 Z', C.white, sw(1.4)) +
        O(22, 40, 2.4, C.purpleL, sw(1.2)) + O(26, 43, 2.2, C.purpleL, sw(1.2)) + sprig(40, 34, -40, C.leaf, 2)),
    aebleskiver: () =>
      K.plate([[20, 38], [32, 33], [44, 38], [32, 44]].map(([x, y]) => O(x, y, 6, C.wheat, sw(1.8)) + K.hiE(x - 2, y - 2.5, 2.2, 1) +
        P(`M${x - 5} ${y - 2} C${x - 3} ${y - 6} ${x + 3} ${y - 6} ${x + 5} ${y - 2}`, C.white, NS)).join('') +
        P('M45 48 C45 45 52 45 53 48 C51 50 47 50 45 48 Z', C.red, sw(1.4)), C.white),

    // ======== Australia, New Zealand, Pacific ========
    aussie_meat_pie: () =>
      `${K.shadow(22)}` + P('M10 38 L14 54 C14 56 16 57 18 57 H46 C48 57 50 56 50 54 L54 38 Z', C.wheatD) +
      K.line('M18 40 L19 55 M26 40 L26.5 56 M34 40 V56 M42 40 L41.5 56 M48 40 L47 55', 1.2, C.brown) +
      P('M7 38 C7 26 20 21 32 21 C44 21 57 26 57 38 C57 41 50 42 32 42 C14 42 7 41 7 38 Z', C.wheat) +
      K.line('M26 31 L30 28 M34 28 L38 31', 1.6, C.wheatD) + K.hiE(17, 28, 4, 2) +
      P('M24 25 C24 19 34 16 38 20 C40 23 36 26 32 27 C28 28 24 28 24 25 Z', C.red, sw(1.8)),
    lamingtons: () =>
      K.plate(cube(10, 36, 10, C.choc, C.brownD) + K.dots([[16, 32], [20, 35], [24, 31], [13, 34], [22, 38]], 0.9, C.white) +
        K.dots([[14, 42], [18, 46], [12, 47]], 0.9, C.white) + K.line('M10 41 L20 45 L30 41', 1.2, C.yellowL) +
        cube(30, 32, 10, C.choc, C.brownD) + K.dots([[36, 28], [40, 31], [44, 27], [33, 30], [42, 34]], 0.9, C.white) +
        K.dots([[34, 38], [38, 42], [47, 38]], 0.9, C.white) + K.line('M30 37 L40 41 L50 37', 1.2, C.yellowL), C.white),
    anzac_biscuits: () =>
      K.plate([[20, 40], [34, 34], [44, 42]].map(([x, y]) => E(x, y + 1.5, 9, 5, C.brown) + E(x, y, 9, 4.6, C.wheatD) +
        K.line(`M${x - 5} ${y - 1} L${x - 2} ${y} M${x + 1} ${y - 2} L${x + 4} ${y - 1} M${x - 2} ${y + 2} L${x + 1} ${y + 2.5}`, 1.1, C.brownD) +
        K.dots([[x + 5, y + 1], [x - 4, y + 2]], 0.8, C.wheatL)).join(''), C.white),
    grilled_barramundi: () =>
      K.plate(fish(30, 37, 0.95, C.greyD, C.steel) +
        K.line('M18 32 L22 42 M26 31 L30 42 M34 31 L37 41', 1.6, C.choc) +
        lemonWedge(48, 46, -10) + O(14, 46, 3, C.wheatL, sw(1.3)) + O(20, 48, 3, C.wheatL, sw(1.3)) + sprig(42, 30, -20, C.leaf, 2), C.white),
    hokey_pokey_ice_cream: () =>
      `${K.shadow(14)}` + P('M20 30 L32 58 L44 30 Z', C.wheat) + K.line('M24 34 L37 47 M30 31 L40 41 M38 31 L28 45 M42 34 L34 52', 1.2, C.wheatD) +
      P('M16 30 C14 22 20 14 32 14 C44 14 50 22 48 30 C44 33 20 33 16 30 Z', C.creamL) +
      [[24, 22], [36, 20], [30, 27], [41, 27], [21, 28]].map(([x, y]) => P(`M${x - 3} ${y} L${x} ${y - 3} L${x + 3} ${y - 1} L${x + 2} ${y + 2.5} L${x - 2} ${y + 2.5} Z`, C.yellow, sw(1.2))).join('') +
      K.hiE(22, 18, 3, 1.5),
    poke_bowl: () =>
      K.bowl(E(32, 30, 22, 6, C.white, NS) + grains([[13, 30], [17, 33], [48, 32], [44, 34.5]], C.white) +
        cube(18, 27, 3.4, C.meatL, C.meat) + cube(26, 29.5, 3.4, C.meatL, C.meat) + cube(22, 24, 3.2, C.meatL, C.meat) +
        P('M36 26 C38 23 44 23 46 26 C44 29 38 29 36 26 Z', C.leafL, sw(1.4)) + P('M38 27 C40 25 43 25 44 26.5 C42 28 40 28 38 27 Z', C.yellowL, NS) +
        P('M34 31 C36 29 42 29 44 31 C42 33 36 33 34 31 Z', C.leafL, sw(1.4)) +
        K.dots([[30, 25], [33, 33], [28, 34], [49, 28]], 0.8, C.ink) + K.line('M12 27 L14 29 M50 27 L52 29', 1.6, C.leaf),
      C.white, C.white),

    // ======== Caribbean ========
    jerk_chicken: () =>
      K.plate(P('M10 38 C8 30 16 25 26 27 C34 29 35 38 28 43 C22 46 12 45 10 38 Z', C.choc) +
        K.line('M28 41 L34 46', 5) + K.line('M28 41 L34 46', 2.6, C.creamL) +
        P('M33 35 C31 27 40 22 48 26 C55 30 52 40 46 42 C41 44 35 41 33 35 Z', C.brownD) +
        K.line('M14 34 L24 31 M15 39 L26 36 M37 32 L48 29 M38 37 L50 34', 1.6, C.black) +
        K.dots([[18, 30], [42, 30], [22, 40]], 1, C.red) + lemonWedge(17, 47, 15, C.leaf, C.leafL) + sprig(40, 46, -10, C.leaf, 2), C.white),
    rice_and_peas: () =>
      K.plate(P('M10 38 C10 29 20 27 32 27 C44 27 54 29 54 38 C54 45 44 48 32 48 C20 48 10 45 10 38 Z', C.white) +
        grains([[16, 36, 20], [22, 33, -10], [28, 42, 30], [40, 43, 0], [46, 37, -20], [36, 31, 40], [20, 42, 10]], C.white) +
        [[18, 39, 10], [26, 35, -20], [34, 39, 30], [42, 34, 0], [30, 45, 60], [46, 41, -30], [24, 30, 20]].map(([x, y, a]) => bean(x, y, a, C.meatD, 0.8)).join('') +
        sprig(38, 28, -20, C.leaf, 2), C.white),
    ackee_and_saltfish: () =>
      K.plate(P('M10 40 C10 32 20 28 32 28 C44 28 54 32 54 40 C54 46 44 49 32 49 C20 49 10 46 10 40 Z', C.yellowL) +
        [[18, 36], [30, 33], [42, 37], [24, 43], [38, 44]].map(([x, y]) => P(`M${x - 4} ${y} C${x - 4} ${y - 4} ${x + 4} ${y - 4} ${x + 4} ${y} C${x + 3} ${y + 3} ${x - 3} ${y + 3} ${x - 4} ${y} Z`, C.yellow, sw(1.4))).join('') +
        [[26, 37], [44, 42], [33, 41]].map(([x, y]) => P(`M${x - 3} ${y - 1} L${x + 3} ${y - 2} L${x + 2} ${y + 2} L${x - 3} ${y + 2} Z`, C.creamL, sw(1.2))).join('') +
        K.dots([[20, 41], [36, 36], [47, 34]], 1.3, C.red) + K.line('M14 40 L16 38 M48 41 L50 39', 1.6, C.leafD), C.white),
    doubles: () =>
      K.plate(E(32, 40, 20, 9, C.wheat) + E(30, 36, 20, 9, C.wheatL) + E(30, 35.5, 13, 5.5, C.yellow, NS) +
        [[24, 35], [30, 33], [36, 36], [28, 38], [33, 39]].map(([x, y]) => O(x, y, 2, C.wheat, sw(1.1))).join('') +
        K.line('M20 37 C24 33 30 40 36 34', 1.4, C.brownD) + K.dots([[38, 33], [22, 34]], 1.1, C.red), C.white),

    // ======== More from around the world ========
    lumpia: () =>
      K.plate([[24, 34, -20], [32, 40, -20], [40, 46, -20]].map(([x, y, a]) => `<g${tr(x, y, a)}>` +
        R(-15, -4.5, 30, 9, C.wheat, sw(1.8)) + E(-15, 0, 2, 4.5, C.yellowD, sw(1.5)) +
        K.line('M-9 -4.5 C-7 0 -7 2 -9 4.5 M2 -4.5 C4 0 4 2 2 4.5', 1.1, C.wheatD) + '</g>').join('') +
        E(50, 32, 6, 3.4, C.white) + E(50, 31.5, 4.8, 2.4, C.redL, NS), C.white),
    sinigang: () =>
      K.bowl(P('M14 29 C15 26 22 25 24 27 C25 30 19 32 14 29 Z', C.pinkL, sw(1.5)) + K.line('M16 28 H23', 1, C.pinkD) +
        O(31, 27.5, 3.4, C.white, sw(1.3)) + O(31, 27.5, 1.6, C.white, NS) + O(42, 29, 3, C.red, sw(1.3)) +
        K.line('M24 33 L30 32 M36 33 L42 32', 2.6) + K.line('M24 33 L30 32 M36 33 L42 32', 1.4, C.leaf) +
        leaf(44, 26, -20, 7, 2.6, C.leafD, 1.2), C.white, C.yellowL) + K.steam(32, 12),
    causa_limena: () =>
      K.plate(`${''}` + E(32, 46, 13, 4, C.yellowD) +
        P('M19 46 V30 H45 V46 Z', C.yellow) + R(19, 36, 26, 4, C.leafL, NS) + R(19, 40, 26, 3, C.creamL, NS) +
        K.line('M19 36 H45 M19 40 H45 M19 43 H45', 1.2) + E(32, 30, 13, 4, C.yellowL) +
        E(32, 26, 4, 2.4, C.white, sw(1.3)) + O(32, 26, 1.4, C.orange, NS) + O(26, 28.5, 1.4, C.black, sw(1)) + O(38, 29, 1.4, C.black, sw(1)) +
        K.hi('M21 32 H24 V44 H21 Z'), C.white),
    moqueca: () =>
      K.pot(E(32, 26.5, 21, 4, C.orange, NS) +
        P('M14 26 C15 23 22 22 24 24 C25 27 19 29 14 26 Z', C.white, sw(1.4)) + P('M34 27 C35 24 42 23 44 25 C45 28 39 30 34 27 Z', C.white, sw(1.4)) +
        O(28, 24.5, 2.6, C.red, sw(1.2)) + R(45, 24, 4, 3, C.leafL, sw(1.1)) + K.dots([[20, 28], [38, 23], [48, 28.5]], 1.1, C.leafD), C.terracotta) + K.steam(32, 12),
    suya: () =>
      K.plate(skewer(10, 48, 50, 26) + skewer(16, 52, 56, 32) +
        [[22, 41], [30, 37], [38, 33], [28, 45], [36, 41], [44, 37]].map(([x, y]) => cube(x - 3, y - 1, 3.4, C.brown, C.brownD)).join('') +
        K.dots([[24, 39], [32, 35], [40, 31], [30, 43], [38, 39], [46, 35]], 0.9, C.red) +
        O(14, 34, 3, C.purpleL, sw(1.2)) + O(19, 31, 2.6, C.purpleL, sw(1.2)), C.white),
    menemen: () =>
      `${K.shadow(26)}` + K.line('M54 40 L62 44', 5) + K.line('M54 40 L62 44', 2.2, C.greyD) +
      E(30, 38, 26, 13, C.greyD) + E(30, 37, 22, 10.5, C.red, NS) +
      P('M14 36 C15 31 22 30 25 33 C27 37 20 40 14 36 Z', C.yellowL, sw(1.4)) + P('M32 39 C33 34 40 33 43 36 C45 40 38 43 32 39 Z', C.yellowL, sw(1.4)) +
      O(22, 35, 2.4, C.yellow, sw(1.2)) + O(39, 38, 2.4, C.yellow, sw(1.2)) +
      K.line('M26 42 L30 40 M40 31 L44 33 M16 41 L20 42', 2, C.leaf) + K.dots([[30, 33], [45, 40], [20, 32]], 1, C.redD),
    sabich: () =>
      `${K.shadow(20)}` + P('M12 30 C12 50 20 57 32 57 C44 57 52 50 52 30 Z', C.wheatL) +
      O(20, 26, 6, C.purple, sw(1.8)) + O(20, 26, 3, C.yellowL, NS) +
      E(31, 23, 6, 4.5, C.white, sw(1.6)) + O(31, 23, 2.6, C.yellow, sw(1.2)) +
      O(42, 27, 4.4, C.red, sw(1.5)) + O(26, 31, 3, C.leafL, sw(1.2)) + K.line('M36 30 C38 28 44 31 46 29', 1.8, C.creamL) +
      P('M12 30 C12 50 20 57 32 57 C44 57 52 50 52 30 C46 34 18 34 12 30 Z', C.wheat) + K.hi('M15 36 C16 45 19 51 23 54 L21 54 C17 50 14 44 14 36 Z'),
    butter_tarts: () =>
      K.plate([[20, 38], [44, 38], [32, 46]].map(([x, y]) => E(x, y + 1, 10, 5.5, C.wheatD) + E(x, y, 10, 5, C.wheat) +
        E(x, y, 7, 3.4, C.brown, sw(1.3)) + K.line(`M${x - 8} ${y - 3} L${x - 7} ${y - 1} M${x + 8} ${y - 3} L${x + 7} ${y - 1}`, 1.1, C.brownD) +
        K.hiE(x - 2, y - 1, 2, 0.8) + O(x + 2, y + 0.5, 1, C.choc, NS)).join(''), C.white),
  });
})(FSI);
