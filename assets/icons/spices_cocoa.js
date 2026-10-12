// Spices (whole and ground), spice blends, cocoa / coffee / tea. See assets/STYLE.md.
(function (FSI) {
  const { C, K } = FSI;
  // ---- local helpers ----
  const G = (x, y, r, inner) => `<g transform="translate(${x} ${y}) rotate(${r})">${inner}</g>`;
  // Leaf with its base at 0,0 pointing up (rotate with G).
  const leaf = (len, w, fill, vein = C.leafD) =>
    `<path d="M0 0 C${-w} ${-len * 0.3} ${-w} ${-len * 0.72} 0 ${-len} C${w} ${-len * 0.72} ${w} ${-len * 0.3} 0 0 Z" fill="${fill}"/>` +
    K.line(`M0 -2 V${-len + 5}`, 1.3, vein);
  // Coloured stem drawn as an outlined stroke.
  const stem = (d, fill, w = 3.5) => `<path d="${d}" stroke-width="${w + 2.4}" fill="none"/><path d="${d}" stroke="${fill}" stroke-width="${w}" fill="none"/>`;
  // Small heap of seeds with three large seeds on top.
  const seedHeap = (heap, speck, seed) =>
    K.shadow(26) +
    `<path d="M6 57 C9 48 19 42 32 42 C45 42 55 48 58 57 Z" fill="${heap}"/>` +
    K.dots([[14, 53], [22, 49], [30, 54], [40, 50], [48, 54], [19, 56], [44, 56.5]], 1.4, speck) +
    G(32, 25, -78, seed) + G(18.5, 39, -30, seed) + G(45.5, 40, 30, seed);

  // seed shapes centred at 0,0 along x
  const seedLong = (fill, rib, w = 4.5) =>
    `<path d="M-16 0 C-10 ${-w} 10 ${-w} 16 0 C10 ${w} -10 ${w} -16 0 Z" fill="${fill}"/>` +
    K.line(`M-12 0 H12 M-9 ${-w * 0.5} C-3 ${-w * 0.72} 3 ${-w * 0.72} 9 ${-w * 0.5} M-9 ${w * 0.5} C-3 ${w * 0.72} 3 ${w * 0.72} 9 ${w * 0.5}`, 1.2, rib);

  // ---- processed spices ----
  // Ground spice: wooden-lidded glass spice jar in the spice's colour + badge of the whole spice.
  const badgeM = (m, x = 47, y = 46, r = 13) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.white}"/>` + K.place(m, x, y, (r * 1.55) / 64);
  const spiceJar = (fill, light, src, extra = '') =>
    K.shadow(18, 58, 30) +
    `<rect x="10" y="20" width="34" height="38" rx="6" fill="${C.glass}"/>` +
    `<path d="M12.5 31 C18 27 36 27 41.5 31 V51 C41.5 54 39.5 55.5 37 55.5 H17 C14.5 55.5 12.5 54 12.5 51 Z" fill="${fill}" stroke="none"/>` +
    `<path d="M13 31 C18 27 36 27 41 31 C36 33 18 33 13 31 Z" fill="${light}" stroke="none"/>` + extra +
    `<rect x="10" y="20" width="34" height="38" rx="6" fill="none"/>` +
    `<rect x="11" y="9" width="32" height="12" rx="3" fill="${C.woodL}"/>` + K.line('M17 12.5 V17.5 M24 12.5 V17.5 M30 12.5 V17.5 M37 12.5 V17.5', 1.2, C.woodD) +
    K.hi('M13.5 24 L16.5 24 L16.5 52 L13.5 50 Z') +
    (typeof src === 'string' && FSI.icons[src] ? badgeM(FSI.markup(src)) : badgeM(src));
  // 64-frame glyphs for sources drawn by other groups (kept local so badges never come up empty)
  const chiliPod = (fill, len = 22) =>
    `<path d="M-20 -6 C-8 -10 ${len - 12} -9 ${len - 2} 2 C${len} 4 ${len + 1} 7 ${len + 1} 10 C${len - 6} 6 ${len - 16} 6 -6 6.5 C-14 7 -20 4 -20 -6 Z" fill="${fill}"/>` +
    `<path d="M-19 -7 C-24 -6 -25 4 -19 5 C-21 1 -21 -3 -19 -7 Z" fill="${C.leafD}" stroke-width="2"/>` + K.line('M-22 -4 C-25 -8 -27 -9 -30 -9', 2.5);
  const pepperGlyph = (fill) => G(34, 32, 45, chiliPod(fill));
  const garlicGlyph = `<path d="M32 8 C34 18 51 24 51 40 C51 52 42 58 32 58 C22 58 13 52 13 40 C13 24 30 18 32 8 Z" fill="${C.white}"/>` +
    K.line('M32 16 C25 26 23 44 27 57 M32 16 C39 26 41 44 37 57', 2, C.greyD);
  const onionGlyph = `<path d="M32 6 C34 18 53 22 53 39 C53 52 43 58 32 58 C21 58 11 52 11 39 C11 22 30 18 32 6 Z" fill="${C.orangeL}"/>` +
    K.line('M32 14 C22 24 20 44 26 57 M32 14 C42 24 44 44 38 57', 2, C.orangeD);
  const mustardGlyph = [[20, 42], [44, 42], [32, 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="${C.yellow}"/>` + K.hiE(x - 4, y - 4, 3, 2)).join('');
  const smokeGlyph = (fill) => pepperGlyph(fill) + K.line('M14 26 C10 20 18 16 14 8 M24 20 C20 14 28 10 24 3', 3, C.greyD);
  // peppercorn heap
  const cornHeap = (fill, mark) => {
    const pts = [[13, 50], [26, 50.5], [39, 50.5], [52, 50], [19.5, 39], [32.5, 39], [45.5, 39], [26, 28], [39, 28], [32.5, 17]];
    return K.shadow(26) + pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6.8" fill="${fill}"/>` + mark(x, y)).join('');
  };

  // ---- blends: white dish heaped with three coloured piles, speckled, plus an optional topper ----
  const blend = (a, b, c, specks, top = '') =>
    K.bowl(
      `<path d="M9 32 C10 22 17 16 24 16 C31 16 36 22 38 32 Z" fill="${a}"/>` +
      `<path d="M27 32 C29 22 35 17 41 17 C48 17 54 23 55 32 Z" fill="${b}"/>` +
      `<path d="M17 34 C19 21 25 12 32 12 C39 12 45 21 47 34 Z" fill="${c}"/>` +
      specks + K.hiE(25, 19, 3, 1.6) + top, C.white, a);
  const spk = (cols) => {
    const pts = [[14, 26], [20, 21], [36, 20], [29, 24], [40, 27], [46, 22], [50, 28], [26, 30], [34, 16], [22, 27], [44, 30], [31, 29]];
    return pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.4" fill="${cols[i % cols.length]}" stroke="none"/>`).join('');
  };
  // ---- cocoa / coffee / tea ----
  const cbean = (fill, rib) => `<path d="M-11 0 C-10 -6 -4 -7 0 -7 C6 -7 11 -4 12 0 C11 4 6 7 0 7 C-4 7 -10 6 -11 0 Z" fill="${fill}"/>` + K.line('M-7 0.5 C-3 -1 4 1 8 -0.5', 1.3, rib);
  const coffeeBean = (fill, crease) => `<ellipse rx="9" ry="12" fill="${fill}"/>` + K.line('M0 -11 C-4 -5 4 5 0 11', 2, crease) + K.hiE(-4, -5, 1.8, 3.5, 20);
  const choc = (top, edge, line, wrap) => {
    // bar in 3/4 view, far end still in its paper wrapper with a strip of foil
    const grid = [0.18, 0.36].map((t) => `M${6 + 30 * t} ${34 - 16 * t} l22 12`).join(' ') + ' ' +
      [0.33, 0.66].map((u) => `M${6 + 22 * u} ${34 + 12 * u} l16.5 -8.8`).join(' ');
    return K.shadow(26) +
      `<path d="M6 34 L28 46 V53 L6 41 Z" fill="${edge}"/><path d="M28 46 L58 30 V37 L28 53 Z" fill="${edge}"/>` +
      `<path d="M6 34 L36 18 L58 30 L28 46 Z" fill="${top}"/>` + K.line(grid, 1.6, line) +
      K.sh('M28 46 L58 30 V37 L28 53 Z') +
      `<path d="M21 24 L24 22.5 L46.5 34.5 L43.5 36 Z" fill="${C.steel}" stroke-width="1.8"/>` +
      `<path d="M24 22.5 L37 15.5 L59.5 27.5 L46.5 34.5 Z" fill="${wrap}"/>` +
      `<path d="M46.5 34.5 L59.5 27.5 V35.5 L46.5 42.5 Z" fill="${wrap}"/>` + K.sh('M46.5 34.5 L59.5 27.5 V35.5 L46.5 42.5 Z') +
      K.line('M30 21 L48 30.8', 1.5, C.creamL) + K.hi('M10 33.5 L16 30.3 L19 32 L13 35.2 Z');
  };
  const teaHeap = (heap, piece, rib, topLeaf) => {
    const bits = [[14, 50, 20], [24, 46, -30], [34, 50, 15], [45, 47, -20], [19, 41, -10], [30, 40, 35], [42, 39, -40], [26, 33, 10], [37, 32, -15]];
    return K.shadow(26) + `<path d="M6 57 C8 44 18 30 32 30 C46 30 56 44 58 57 Z" fill="${heap}"/>` +
      bits.map(([x, y, r]) => G(x, y, r, `<path d="M-6 -1 C-4 -4 3 -4 6 -1 C4 3 -3 3.5 -6 -1 Z" fill="${piece}" stroke-width="1.5"/>` + K.line('M-3 0 C-1 -1.5 2 -1.5 3.5 0', 1, rib))).join('') +
      G(30, 30, 30, leaf(24, 8, topLeaf, rib)) + G(36, 31, -35, leaf(17, 6, topLeaf, rib));
  };

  FSI.add('spices_cocoa', {
    // ======== raw crops ========
    saffron_crocus_flowers: () => {
      const flower = (x, y, r) => G(x, y, r,
        stem('M0 0 V22', C.leafL, 3) +
        `<path d="M0 2 C-11 -2 -12 -14 -8 -22 C-4 -16 -2 -8 0 2 Z" fill="${C.purple}"/>` +
        `<path d="M0 2 C11 -2 12 -14 8 -22 C4 -16 2 -8 0 2 Z" fill="${C.purple}"/>` +
        `<path d="M0 2 C-7 -6 -6 -18 0 -25 C6 -18 7 -6 0 2 Z" fill="${C.purpleL}"/>` +
        K.line('M0 -2 V-18', 1.2, C.purpleD) +
        stem('M0 -8 L-5 -27 M0 -8 L0 -30 M0 -8 L5 -27', C.red, 1.8));
      return K.shadow(22) +
        `<path d="M14 58 C14 46 10 38 6 32 M50 58 C50 46 54 38 58 32 M28 58 C26 50 24 46 22 42" stroke="${C.leafD}" stroke-width="2.5" fill="none"/>` +
        flower(20, 38, -12) + flower(42, 35, 10);
    },
    cumin_seeds: () => seedHeap(C.brownL, C.brown, seedLong(C.wheatD, C.brown, 5) + K.line('M16 0 L19 0', 1.4)),
    coriander_seeds: () => {
      const s = `<circle r="8.5" fill="${C.wheat}"/>` + K.line('M0 -8 C-4.5 -3 -4.5 3 0 8 M0 -8 C3.5 -3 3.5 3 0 8', 1.2, C.wheatD) + K.dots([[0, -8.5]], 1.4);
      return seedHeap(C.wheatD, C.brown, s);
    },
    fennel_seeds: () => seedHeap(C.leaf, C.leafD, seedLong(C.leafL, C.leafD, 6.5) + K.line('M16 0 L20 -1', 1.4)),
    caraway_seeds: () => seedHeap(C.brownD, C.choc,
      `<path d="M-17 4 C-11 -8 11 -8 17 4 C11 -1 -11 -1 -17 4 Z" fill="${C.brown}"/>` + K.line('M-11 -1 C-5 -5 5 -5 11 -1', 1.2, C.brownL)),
    fenugreek_seeds: () => seedHeap(C.orangeD, C.brownD,
      `<path d="M-10 -7 L8 -8.5 L10.5 6 L-8.5 8.5 Z" fill="${C.yellowD}"/>` + K.line('M-4 -7 L-1.5 1 L3 3.5', 1.3, C.orangeD)),
    anise_seeds: () => seedHeap(C.creamD, C.wheatD,
      `<path d="M-14 0 C-14 -7.5 2 -8.5 13 0 C2 8.5 -14 7.5 -14 0 Z" fill="${C.cream}"/>` +
      K.line('M-10 0 H9 M-10 -3.5 C-4 -5 2 -4 9 -1.2 M-10 3.5 C-4 5 2 4 9 1.2', 1.2, C.wheatD) + K.line('M13 0 L18 -2', 1.4)),
    bay_leaves: () =>
      K.shadow(18) +
      G(30, 57, -38, leaf(44, 9, C.leafD, C.leafL)) + G(34, 57, 36, leaf(44, 9, C.leafD, C.leafL)) +
      G(32, 58, -4, leaf(52, 10, C.leaf, C.leafD)) + K.hiE(27, 22, 2, 6, 10),
    sumac_berries: () => {
      const rows = [[[32, 13]], [[27.5, 21], [36.5, 21]], [[23, 29], [32, 29], [41, 29]], [[19, 38], [28, 38], [37, 38], [46, 38]], [[16, 47], [25, 47], [34, 47], [43, 47], [50, 49]]];
      return K.shadow(20) + stem('M32 50 V58', C.brown, 3) +
        `<path d="M32 8 C38 14 52 34 53 46 C53 53 43 55 32 55 C21 55 12 53 12 46 C13 34 26 14 32 8 Z" fill="${C.redD}"/>` +
        rows.flat().map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.6" fill="${C.red}" stroke-width="1.5"/>`).join('') +
        K.hiE(22, 28, 2.5, 1.6) + K.hiE(29, 20, 2.2, 1.4);
    },
    sichuan_peppercorns: () => {
      const husk = (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="${C.redD}"/><circle cx="${x + 2.5}" cy="${y - 2.5}" r="3" fill="${C.black}" stroke-width="1.5"/>` +
        K.dots([[x - 3.5, y + 1], [x - 1, y + 4], [x + 3, y + 3.5]], 0.9, C.redL);
      return K.shadow(16) +
        `<path d="M32 58 V40 M32 44 L20 30 M32 44 L45 28 M32 40 L32 18 M26 37 L18 46 M38 38 L47 44" stroke="${C.brownD}" stroke-width="2.2" fill="none"/>` +
        husk(32, 16) + husk(19, 28) + husk(46, 26) + husk(32, 33) + husk(16, 45) + husk(48, 44);
    },
    cocoa_pods: () =>
      K.shadow(24) +
      G(32, 33, -35,
        stem('M-27 0 L-33 0', C.brown, 3.5) +
        `<path d="M-28 0 C-24 -14 -8 -16 4 -15 C17 -14 26 -7 29 0 C26 7 17 14 4 15 C-8 16 -24 14 -28 0 Z" fill="${C.orange}"/>` +
        K.sh('M-26 4 C-20 13 -6 15 4 15 C17 14 26 7 29 0 C20 8 0 11 -26 4 Z') +
        K.line('M-24 -5 C-12 -11 12 -11 26 -3 M-24 5 C-12 11 12 11 26 3 M-26 0 H27', 1.5, C.orangeD) +
        K.hi('M-18 -9 C-10 -13 4 -13 12 -11 C4 -10 -8 -9 -18 -6 Z')),
    coffee_cherries: () => {
      const ch = (x, y, f) => `<circle cx="${x}" cy="${y}" r="7.5" fill="${f}"/>` + K.dots([[x + 3.5, y + 3.5]], 1.4) + K.hiE(x - 3, y - 3, 2.2, 1.4);
      return K.shadow(22) +
        stem('M5 16 C20 24 40 36 57 49', C.brown, 2.5) +
        G(12, 20, -40, leaf(18, 7, C.leafD, C.leafL)) + G(46, 46, 150, leaf(15, 6.5, C.leafD, C.leafL)) +
        G(48, 42, 20, leaf(17, 6.5, C.leafD, C.leafL)) +
        ch(24, 34, C.red) + ch(38, 30, C.redD) + ch(30, 45, C.red) + ch(44, 43, C.red) + ch(18, 46, C.orange);
    },
    tea_leaves: () =>
      K.shadow(14) + stem('M32 58 C32 46 33 30 32 16', C.leafD, 2.5) +
      G(32, 52, -58, leaf(28, 9, C.leaf)) + G(32, 42, 58, leaf(26, 9, C.leaf)) +
      G(32, 31, -40, leaf(19, 6.5, C.leafL)) + G(32, 20, 4, leaf(15, 4, C.leafL)) + K.hiE(18, 40, 2, 4, 50),
    vanilla_pods: () => {
      const pod = (x, l, f) => `<path d="M${x} 13 C${x - 4} ${13 + l * 0.35} ${x - 4} ${13 + l * 0.7} ${x - 1} ${13 + l} C${x + 4} ${13 + l * 0.7} ${x + 4} ${13 + l * 0.35} ${x} 13 Z" fill="${f}"/>`;
      return stem('M5 12 C20 8 40 8 58 13', C.leafD, 2.5) +
        pod(18, 42, C.leaf) + pod(27, 45, C.leafL) + pod(36, 40, C.leaf) +
        G(48, 20, 0, ['0', '72', '144', '216', '288'].map((a) => `<ellipse cx="0" cy="-6" rx="3.5" ry="6" transform="rotate(${a})" fill="${C.yellowL}" stroke-width="1.8"/>`).join('') +
          `<circle r="3" fill="${C.yellow}" stroke-width="1.5"/>`) +
        K.hi('M24.5 20 L26 20 L25.5 44 L24 42 Z');
    },
    pepper_berries: () => {
      const spike = (x0, y0, x1, y1, n, ripe) => {
        let s = stem(`M${x0} ${y0} C${x0} ${(y0 + y1) / 2} ${x1} ${(y0 + y1) / 2} ${x1} ${y1}`, C.leafD, 1.8);
        for (let i = 0; i < n; i++) {
          const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t + (i % 2 ? 4 : -4), y = y0 + (y1 - y0) * t;
          s += `<circle cx="${x}" cy="${y}" r="4.6" fill="${i >= n - ripe ? C.red : C.leaf}" stroke-width="1.8"/>`;
        }
        return s;
      };
      return stem('M4 9 C20 5 44 5 60 10', C.leafD, 2.5) +
        spike(22, 9, 18, 58, 6, 2) + spike(42, 9, 46, 56, 6, 1) +
        G(31, 8, 160, leaf(22, 10, C.leafD, C.leafL));
    },
    cinnamon_bark: () => {
      const quill = (x, y) => G(x, y, -18,
        `<path d="M-24 -6 H22 A3.5 6 0 0 1 22 6 H-24 A3.5 6 0 0 1 -24 -6 Z" fill="${C.terracotta}"/>` +
        K.line('M-20 -2 H17', 1.2, C.brownD) +
        `<ellipse cx="22" cy="0" rx="3.5" ry="6" fill="${C.orangeL}"/>` +
        K.line('M22 -3 C19.5 -3 19.5 3 22 3 C23.6 3 23.6 0 22 0', 1.2, C.brownD));
      return K.shadow(24) + quill(30, 49) + quill(32, 36) + quill(34, 23) + K.hi('M10 30 L40 20 L41 22 L11 32 Z');
    },
    clove_buds: () => {
      const bud = (r, l) => G(32, 42, r,
        `<path d="M-1.5 0 L-3 ${-l} H3 L1.5 0 Z" fill="${C.pinkD}" stroke-width="1.8"/><circle cx="0" cy="${-l - 4}" r="4.8" fill="${C.red}" stroke-width="2"/>`);
      return K.shadow(16) + stem('M32 58 V42', C.leafD, 2.5) +
        G(31, 56, -60, leaf(16, 6, C.leaf)) + G(33, 56, 60, leaf(16, 6, C.leaf)) +
        bud(-70, 17) + bud(70, 17) + bud(-38, 20) + bud(38, 20) + bud(-12, 22) + bud(13, 22);
    },
    nutmeg_fruit: () =>
      K.shadow(22) +
      G(36, 15, 30, leaf(16, 6, C.leaf)) + stem('M32 16 V10', C.brown, 2.5) +
      `<path d="M32 15 C46 15 55 25 55 37 C55 50 45 58 32 58 C19 58 9 50 9 37 C9 25 18 15 32 15 Z" fill="${C.yellowL}"/>` +
      `<path d="M32 18 C24 26 23 46 32 56 C41 46 40 26 32 18 Z" fill="${C.creamL}"/>` +
      `<ellipse cx="32" cy="37" rx="7.5" ry="12" fill="${C.brownD}"/>` +
      K.line('M28 28 C31 34 26 40 29 47 M32 25 C34 32 30 40 33 49 M36 28 C33 34 38 40 35 47', 2, C.red) +
      K.sh('M48 26 C55 36 52 52 40 56 C50 56 55 46 55 37 C55 32 52 28 48 26 Z') + K.hiE(18, 28, 4, 2.5),
    cardamom_pods: () => {
      const pod = `<path d="M-16 0 C-15 -8 -6 -9.5 0 -9.5 C8 -9.5 14 -6 17 0 C14 6 8 9.5 0 9.5 C-6 9.5 -15 8 -16 0 Z" fill="${C.leafL}"/>` +
        K.line('M-12 0 H13 M-11 -4.5 C-4 -6.5 4 -6.5 12 -4 M-11 4.5 C-4 6.5 4 6.5 12 4', 1.2, C.leaf) + K.line('M17 0 L20 -1', 1.5);
      return K.shadow(24) + G(20, 26, -30, pod) + G(44, 26, 30, pod) +
        G(32, 46, -6,
          `<path d="M-17 0 C-12 -9 12 -9 17 0 C12 9 -12 9 -17 0 Z" fill="${C.leafL}"/>` +
          `<path d="M-11 -1 C-6 -6 6 -6 11 -1 C6 3 -6 3 -11 -1 Z" fill="${C.black}" stroke-width="1.5"/>` +
          K.dots([[-6, -2.2], [-1, -3.2], [4, -3], [8, -1.4]], 1.3, C.greyD) + K.line('M17 0 L20 -1', 1.5));
    },
    allspice_berries: () => {
      const b = (x, y) => `<circle cx="${x}" cy="${y}" r="6.3" fill="${C.brown}"/><circle cx="${x}" cy="${y - 3.3}" r="1.5" fill="${C.brownD}" stroke="none"/>` + K.hiE(x - 2.5, y - 1, 1.8, 1.2);
      return K.shadow(16) +
        `<path d="M32 58 V38 M32 40 L20 24 M32 40 L44 24 M32 38 V20" stroke="${C.brownD}" stroke-width="2" fill="none"/>` +
        G(31, 52, -62, leaf(22, 7.5, C.leafD, C.leafL)) + G(33, 50, 62, leaf(22, 7.5, C.leafD, C.leafL)) +
        b(20, 22) + b(44, 22) + b(32, 15) + b(26, 33) + b(38, 33) + b(32, 26);
    },
    star_anise: () => {
      let s = K.shadow(20);
      for (let i = 0; i < 8; i++) {
        s += G(32, 31, i * 45 + 10,
          `<path d="M0 -3 C6 -7 7.5 -17 0 -27 C-7.5 -17 -6 -7 0 -3 Z" fill="${C.brown}"/>` +
          (i % 2 ? K.line('M0 -8 V-22', 1.3, C.brownD) : `<ellipse cx="0" cy="-15" rx="2.6" ry="5" fill="${C.wheat}" stroke-width="1.3"/>`));
      }
      return s + `<circle cx="32" cy="31" r="5" fill="${C.brownD}"/>`;
    },
    ginger: () =>
      K.shadow(24) +
      `<path d="M10 44 C8 38 12 34 18 35 C17 28 18 20 24 19 C30 18 31 26 30 34 C33 33 36 32 38 30 C37 22 40 14 46 15 C52 16 51 25 47 32 C52 32 57 36 56 42 C55 49 48 52 40 51 C32 50 24 53 16 52 C11 51 10 48 10 44 Z" fill="${C.wheat}"/>` +
      K.line('M18 30 C21 31.5 26 31.5 29.5 29 M38 26 C41 27.5 45 27.5 48.5 25 M26 38 C27 43 27 47 26 51 M42 37 C43 42 43 46 42 50', 1.3, C.wheatD) +
      `<ellipse cx="12.5" cy="44.5" rx="4" ry="7" fill="${C.yellowL}"/>` +
      K.sh('M52 34 C56 38 56 46 50 50 C46 52 40 51 36 51 C44 49 52 44 52 34 Z') + K.hiE(24, 25, 2, 4, 10) + K.hiE(44, 21, 2, 4, 10),
    turmeric_root: () => {
      const finger = (x, y, r) => G(x, y, r, `<rect x="-14" y="-5.5" width="28" height="11" rx="5.5" fill="${C.brownL}"/>` + K.line('M-6 -5 C-7 -2 -7 2 -6 5 M3 -5 C2 -2 2 2 3 5', 1.2, C.brown));
      return K.shadow(24) + finger(20, 26, 60) + finger(42, 24, -60) + finger(47, 45, -8) +
        `<ellipse cx="31" cy="43" rx="15" ry="10" fill="${C.brownL}"/>` + K.line('M24 34 C22 39 22 47 24 52 M35 33 C33 39 33 47 35 53', 1.2, C.brown) +
        `<circle cx="14" cy="48" r="9" fill="${C.orange}"/><circle cx="14" cy="48" r="5" fill="${C.orangeL}" stroke="${C.orangeD}" stroke-width="1.2"/>` +
        K.hiE(28, 37, 3, 1.6);
    },
    galangal: () =>
      K.shadow(25) +
      `<path d="M20 34 C19 26 20 20 22 16 C24 13 29 14 29 18 C29 24 29 30 29 34 Z" fill="${C.cream}"/>` +
      `<path d="M22 16 C22 11 24 8 26 6 C28 9 29 13 29 18 C27 16 24 15 22 16 Z" fill="${C.pink}" stroke-width="2"/>` +
      `<path d="M40 33 C40 27 41 23 43 20 C45 18 49 19 49 22 C49 26 49 30 49 33 Z" fill="${C.cream}"/>` +
      `<path d="M43 20 C43 16 45 13 47 11 C49 14 49 18 49 22 C47 20 45 19 43 20 Z" fill="${C.pink}" stroke-width="2"/>` +
      `<path d="M10 38 C10 33 14 32 20 33 C30 34 40 31 50 32 C56 33 57 38 56 43 C55 49 50 50 42 49 C32 48 22 52 14 50 C10 49 9 44 10 38 Z" fill="${C.cream}"/>` +
      K.line('M18 33.5 C16 38 16 45 18 50.5 M28 34 C26 39 26 44 28 49.5 M38 33 C36 38 36 44 38 48.8 M48 32 C46 38 46 44 48 49', 1.4, C.pinkD) +
      `<ellipse cx="53.5" cy="41" rx="3.5" ry="7.5" fill="${C.creamL}"/>` + K.hiE(22, 37, 3, 1.4, -10),
    annatto_seeds: () =>
      K.shadow(20) + stem('M32 10 V4', C.brown, 2.5) +
      `<path d="M32 9 C44 18 54 32 51 45 C49 54 39 57 32 51 C25 57 15 54 13 45 C10 32 20 18 32 9 Z" fill="${C.red}"/>` +
      K.line('M19 20 L15 17 M13 31 L8 30 M12 43 L7 45 M45 20 L49 17 M51 31 L56 30 M52 43 L57 45 M24 13 L21 9 M40 13 L43 9 M22 54 L20 58 M42 54 L44 58', 1.8) +
      `<path d="M32 17 C41 26 43 40 32 49 C21 40 23 26 32 17 Z" fill="${C.orangeL}"/>` +
      K.dots([[30, 25], [34, 28], [29, 32], [34, 35], [29, 39], [34, 42], [31, 45]], 2.4, C.redD) +
      K.sh('M44 24 C51 32 53 44 46 52 C52 50 54 40 50 31 Z') + K.hiE(19, 33, 2.5, 5, 15),
    juniper_berries: () => {
      const b = (x, y) => `<circle cx="${x}" cy="${y}" r="6.5" fill="${C.blueD}"/>` + K.hiE(x - 2.5, y - 2.5, 2, 1.3) +
        K.line(`M${x + 1} ${y + 2.5} l0 -2 M${x + 1} ${y + 0.5} l-1.8 -1 M${x + 1} ${y + 0.5} l1.8 -1`, 1.1, C.blueL);
      let needles = '';
      for (let i = 0; i < 7; i++) {
        const x = 12 + i * 6.3, y = 52 - i * 6.2;
        needles += `M${x} ${y} l-7 -2 M${x} ${y} l2 7 `;
      }
      return K.shadow(20) + K.line(needles, 2.2, C.pine) + stem('M8 56 C20 46 34 32 55 12', C.brownD, 2.2) +
        b(22, 37) + b(36, 31) + b(30, 46) + b(44, 22) + b(46, 37);
    },
    // ======== processed spices ========
    black_peppercorns: () => cornHeap(C.black, (x, y) => K.line(`M${x - 3} ${y - 1} C${x - 1} ${y - 3} ${x + 2} ${y - 2} ${x + 3} ${y + 1} M${x - 2} ${y + 3} C${x} ${y + 1.5} ${x + 2} ${y + 2.5} ${x + 3} ${y + 4}`, 1.2, C.greyD)),
    white_peppercorns: () => cornHeap(C.cream, (x, y) => K.hiE(x - 2.5, y - 2.5, 2, 1.3) + K.dots([[x + 2, y + 2]], 1.1, C.creamD)),
    ground_black_pepper: () => spiceJar(C.black, C.greyD, 'black_peppercorns'),
    ground_white_pepper: () => spiceJar(C.creamD, C.cream, 'white_peppercorns'),
    ground_cinnamon: () => spiceJar(C.terracotta, C.orangeL, 'cinnamon_bark'),
    ground_cardamom: () => spiceJar(C.grey, C.greyL, 'cardamom_pods'),
    ground_allspice: () => spiceJar(C.brownD, C.brown, 'allspice_berries'),
    ground_cumin: () => spiceJar(C.brown, C.brownL, 'cumin_seeds'),
    ground_coriander: () => spiceJar(C.brownL, C.woodL, 'coriander_seeds'),
    ground_ginger: () => spiceJar(C.wheat, C.wheatL, 'ginger'),
    turmeric_powder: () => spiceJar(C.gold, C.yellow, 'turmeric_root'),
    paprika: () => spiceJar(C.red, C.redL, pepperGlyph(C.red)),
    smoked_paprika: () => spiceJar(C.redD, C.red, smokeGlyph(C.redD)) + K.line('M50 30 C46 25 54 21 50 15 C47 11 51 8 50 4 M57 28 C54 24 60 20 57 15', 2.2, C.greyD),
    chili_flakes: () => spiceJar(C.redL, C.redL, 'dried_chilies',
      K.dots([[16, 36], [22, 42], [28, 35], [33, 46], [38, 38], [17, 50], [26, 52], [36, 53], [21, 30.5]], 1.6, C.redD) +
      K.dots([[19, 44], [31, 40], [24, 47], [38, 46], [29, 31]], 1.1, C.yellowL)),
    chili_powder: () => spiceJar(C.orangeD, C.orange, 'dried_chilies'),
    mustard_powder: () => spiceJar(C.yellow, C.yellowL, mustardGlyph),
    garlic_powder: () => spiceJar(C.creamL, C.white, garlicGlyph),
    onion_powder: () => spiceJar(C.wheatL, C.yellowL, onionGlyph),
    sumac: () => spiceJar(C.meatD, C.meat, 'sumac_berries'),
    dried_chilies: () =>
      K.shadow(24) + G(30, 22, 18, chiliPod(C.redD, 26) + K.line('M-10 -2 C0 -4 10 -3 18 1', 1.3, C.meatD)) +
      G(34, 40, 8, chiliPod(C.red, 26) + K.line('M-10 -2 C0 -4 10 -3 18 1', 1.3, C.redD)) + K.hiE(20, 36, 4, 1.5, 0),
    dried_cloves: () => {
      const clove = (x, y, r) => G(x, y, r,
        `<path d="M-2 0 L-3.5 22 C-3 24 3 24 3.5 22 L2 0 Z" fill="${C.brown}"/>` +
        `<path d="M-8 -2 L-5 2 H5 L8 -2 L4 -3 L0 -1 L-4 -3 Z" fill="${C.brownD}" stroke-width="2"/>` +
        `<circle cx="0" cy="-7" r="5.5" fill="${C.brownL}"/>` + K.line('M-3 -8 C-1 -10 2 -10 3 -7', 1.2, C.brown));
      return K.shadow(22) + clove(18, 20, -28) + clove(46, 22, 30) + clove(32, 14, 0);
    },
    nutmeg: () =>
      K.shadow(24) +
      `<ellipse cx="22" cy="38" rx="14" ry="17" transform="rotate(-15 22 38)" fill="${C.brown}"/>` +
      K.line('M14 30 C20 28 26 34 30 30 M12 40 C18 36 24 44 32 40 M15 49 C20 46 25 52 30 48 M22 22 C20 30 24 40 20 52', 1.3, C.brownD) +
      K.hiE(17, 28, 4, 2.2) +
      `<ellipse cx="44" cy="44" rx="14" ry="12" fill="${C.cream}"/>` +
      `<ellipse cx="44" cy="44" rx="10" ry="8.5" fill="${C.brownL}" stroke="none"/>` +
      K.line('M36 40 C40 44 44 38 48 43 C50 46 52 44 53 42 M37 48 C41 46 44 51 49 48 M42 37 C44 40 43 42 45 44', 1.5, C.brownD) +
      `<ellipse cx="44" cy="44" rx="14" ry="12" fill="none"/>`,
    mace: () => {
      const blade = (r, l) => G(32, 54, r, `<path d="M-4 0 C-7 ${-l * 0.4} -6 ${-l * 0.8} -2 ${-l} C0 ${-l - 2} 3 ${-l + 1} 4 ${-l + 4} C6 ${-l * 0.6} 6 ${-l * 0.3} 4 0 Z" fill="${C.orange}"/>` +
        K.line(`M0 -4 C-1 ${-l * 0.4} 0 ${-l * 0.7} 0 ${-l + 4}`, 1.2, C.orangeD));
      return K.shadow(20) + blade(-52, 36) + blade(52, 36) + blade(-26, 44) + blade(26, 44) + blade(0, 48) +
        `<ellipse cx="32" cy="53" rx="9" ry="5" fill="${C.orangeD}"/>` + K.hiE(25, 22, 2, 5, -20);
    },
    cured_vanilla_beans: () => {
      const pod = (y, l) => G(31, y, -40, `<path d="M${-l} 0 C${-l + 6} -4.5 ${l - 6} -4.5 ${l} 0 C${l - 6} 4.5 ${-l + 6} 4.5 ${-l} 0 Z" fill="${C.choc}"/>` +
        K.line(`M${-l + 6} -0.5 C${-l / 2} 1 ${l / 2} -1.5 ${l - 6} 0.5`, 1.2, C.brown));
      return K.shadow(24) + pod(30, 27) + pod(36, 28) + pod(42, 26) +
        G(31, 36, -40, `<rect x="-3.5" y="-12" width="7" height="24" rx="2" fill="${C.cream}"/>` + K.line('M-3.5 -4 H3.5', 1.2, C.creamD)) + K.hiE(14, 40, 4, 1.2, -40);
    },
    saffron_threads: () => {
      const th = (x, y, r, l) => G(x, y, r, `<path d="M-0.9 0 L-3 ${-l} C-1 ${-l - 1.5} 1 ${-l - 1.5} 3 ${-l} L0.9 0 Z" fill="${C.red}" stroke-width="1.6"/>` +
        `<path d="M-1 0 L-1.4 -5 H1.4 L1 0 Z" fill="${C.yellow}" stroke-width="1.2"/>`);
      return K.shadow(27) + `<ellipse cx="32" cy="48" rx="28" ry="10" fill="${C.white}"/>` +
        `<ellipse cx="32" cy="47.5" rx="21" ry="6.5" fill="${C.greyL}" fill-opacity=".45" stroke-width="1.3"/>` +
        th(13, 50, 52, 30) + th(51, 50, -52, 30) + th(20, 52, 22, 32) + th(44, 52, -20, 32) + th(30, 52, -32, 34) + th(34, 52, 34, 34) +
        th(26, 50, 70, 26) + th(38, 50, -72, 26);
    },
    // ======== spice blends ========
    curry_powder: () => blend(C.gold, C.orange, C.yellow, spk([C.orangeD, C.yellowD, C.redD]), G(42, 13, 40, leaf(13, 5, C.leaf))),
    garam_masala: () => blend(C.brown, C.brownD, C.brownL, spk([C.choc, C.black, C.brownD]),
      G(44, 16, -30, `<path d="M-9 0 C-6 -4.5 6 -4.5 9 0 C6 4.5 -6 4.5 -9 0 Z" fill="${C.leafL}" stroke-width="2"/>` + K.line('M-6 0 H6', 1.1, C.leaf)) +
      G(22, 15, 20, `<rect x="-10" y="-3.5" width="20" height="7" rx="3" fill="${C.terracotta}" stroke-width="2"/>`)),
    five_spice_powder: () => blend(C.brownL, C.brown, C.creamD, spk([C.brownD, C.redD, C.wheat]), K.ref('star_anise', 32, 13, 0.38, 10)),
    ras_el_hanout: () => blend(C.orangeD, C.gold, C.terracotta, spk([C.redD, C.yellow, C.brownD, C.pink]),
      G(41, 15, 25, `<path d="M0 4 C-6 2 -6 -6 0 -7 C6 -6 6 2 0 4 Z" fill="${C.pink}" stroke-width="2"/>` + K.line('M-2 -4 C0 -2 2 -3 2 -5', 1.1, C.pinkD))),
    berbere: () => blend(C.redD, C.red, C.orangeD, spk([C.meatD, C.orange, C.brownD]), G(38, 13, -20, chiliPod(C.red, 12))),
    herbes_de_provence: () => blend(C.leafD, C.leaf, C.leafL, spk([C.pine, C.purple, C.leafD, C.purpleD]),
      stem('M44 22 L49 8', C.leafD, 1.6) + K.dots([[47.5, 11], [46.5, 14], [45.5, 17]], 2.2, C.purple)),
    zaatar: () => blend(C.leafD, C.meatD, C.leaf, spk([C.creamL, C.meatD, C.creamL, C.leafL]),
      [[26, 16, 30], [33, 18, -20], [38, 14, 60], [29, 22, -40], [44, 22, 10]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="1.4" ry="2.4" transform="rotate(${r} ${x} ${y})" fill="${C.creamL}" stroke-width="1"/>`).join('')),
    pumpkin_pie_spice: () => blend(C.terracotta, C.brown, C.orangeL, spk([C.brownD, C.wheat, C.orangeD]),
      G(32, 12, -12, `<path d="M-14 -3.5 H12 A2.2 3.5 0 0 1 12 3.5 H-14 A2.2 3.5 0 0 1 -14 -3.5 Z" fill="${C.terracotta}" stroke-width="2"/><ellipse cx="12" cy="0" rx="2.2" ry="3.5" fill="${C.orangeL}" stroke-width="1.6"/>`)),
    cajun_seasoning: () => blend(C.red, C.orange, C.brownL, spk([C.leafD, C.creamL, C.redD, C.leaf, C.black])),
    // ======== cocoa ========
    fermented_cocoa_beans: () =>
      K.shadow(27) +
      `<path d="M4 46 C14 33 46 29 60 39 C48 53 18 57 4 46 Z" fill="${C.leaf}"/>` +
      K.line('M7 46 C22 41 42 39 57 39.5 M18 43 L14 50 M28 41 L25 51 M38 40 L37 50 M48 39.5 L49 47', 1.3, C.leafD) +
      G(20, 39, -15, cbean(C.brown, C.brownD)) + G(44, 37, 15, cbean(C.brown, C.brownD)) +
      G(31, 43, 5, cbean(C.brownL, C.brown)) + G(26, 29, -30, cbean(C.brown, C.brownD)) + G(39, 27, 25, cbean(C.brownL, C.brown)) +
      K.hiE(28, 41, 3, 1.5, -5),
    roasted_cocoa_beans: () =>
      K.shadow(26) +
      G(16, 49, -10, cbean(C.choc, C.brownD)) + G(48, 49, 10, cbean(C.choc, C.brownD)) + G(32, 51, 0, cbean(C.choc, C.brownD)) +
      G(24, 39, -25, cbean(C.choc, C.brownD)) + G(41, 39, 25, cbean(C.choc, C.brownD)) +
      G(33, 27, -10, cbean(C.choc, C.brownD) + `<path d="M-7 -2 C-4 -5.5 4 -5.5 8 -2 C4 2.5 -4 2.5 -7 -2 Z" fill="${C.brown}" stroke-width="1.3"/>` + K.line('M-2 -4.5 L-1 0.8 M3 -4.5 L4 0.5', 1.1, C.choc)) +
      K.hiE(13, 47, 2.5, 1.3, -10) + K.hiE(29, 49, 2.5, 1.3, 0) + K.hiE(21, 37, 2.5, 1.3, -25),
    cocoa_nibs: () => {
      const n = [['M8 54 L13 45 L21 47 L20 55 Z', C.choc], ['M19 55 L22 46 L31 44 L33 54 Z', C.brownD], ['M32 55 L33 45 L42 43 L45 53 Z', C.choc], ['M44 54 L45 44 L53 45 L57 54 Z', C.brownD],
        ['M14 45 L18 36 L27 37 L25 46 Z', C.brownD], ['M26 44 L29 34 L37 35 L38 44 Z', C.choc], ['M38 43 L40 34 L49 36 L49 45 Z', C.brownD],
        ['M21 35 L26 26 L33 28 L31 36 Z', C.choc], ['M33 35 L35 26 L43 28 L44 36 Z', C.brownD], ['M27 26 L31 17 L38 19 L37 27 Z', C.choc]];
      return K.shadow(26) + n.map(([d, f]) => `<path d="${d}" fill="${f}"/>`).join('') +
        K.hi('M15 46 L18 39 L21 40 L18 46 Z') + K.hi('M28 27 L31 20 L33 21 L31 27 Z') + K.hi('M34 46 L35 46 L41 45 L39 47 Z');
    },
    cocoa_mass: () =>
      K.bowl(stem('M40 28 L55 6', C.woodL, 4) + `<path d="M35 31 C34 27 38 25 41 26 C44 27 45 30 43 33 Z" fill="${C.woodL}" stroke-width="2"/>` +
        K.line('M16 30 C20 27 26 33 31 30', 1.5, C.brownD) + K.hiE(22, 28, 5, 1.4, -5), C.steel, C.choc) +
      `<path d="M14 37 C14 42 18 44 18 40 C18 38 16 37 14 37 Z" fill="${C.choc}" stroke-width="1.8"/>`,
    cocoa_powder: () => K.sack(C.brownL, K.ref('cocoa_pods', 32, 41, 0.42) + `<path d="M22 21 C26 17 38 17 42 21" fill="${C.brown}" stroke-width="1.5"/>`, C.brownD),
    cocoa_butter: () =>
      K.shadow(26) +
      `<path d="M6 32 L28 44 V56 L6 44 Z" fill="${C.wheatL}"/><path d="M28 44 L58 28 V40 L28 56 Z" fill="${C.wheat}"/>` +
      `<path d="M6 32 L36 16 L58 28 L28 44 Z" fill="${C.yellowL}"/>` +
      G(32, 30, -28, `<path d="M-12 0 C-9 -6 -2 -6.5 2 -6 C8 -5 11 -2 13 0 C11 2 8 5 2 6 C-2 6.5 -9 6 -12 0 Z" fill="none" stroke="${C.wheatD}" stroke-width="1.5"/>` + K.line('M-9 0 H10', 1.2, C.wheatD)) +
      K.sh('M28 44 L58 28 V40 L28 56 Z') + K.hi('M10 32 L20 26.5 L23 28 L13 33.5 Z'),
    dark_chocolate: () => choc(C.brownD, C.choc, C.choc, C.red),
    milk_chocolate: () => choc(C.brown, C.brownD, C.brownD, C.blue),
    white_chocolate: () => choc(C.creamL, C.cream, C.creamD, C.purple),
    // ======== coffee ========
    green_coffee_beans: () => K.shadow(24) + G(19, 42, -30, coffeeBean(C.leafL, C.leafD)) + G(45, 42, 30, coffeeBean(C.leafL, C.leafD)) +
      G(32, 47, 85, coffeeBean(C.tealL, C.leafD)) + G(31, 23, 10, coffeeBean(C.leafL, C.leafD)),
    roasted_coffee_beans: () => K.shadow(24) + G(19, 42, -30, coffeeBean(C.brownD, C.choc)) + G(45, 42, 30, coffeeBean(C.brownD, C.choc)) +
      G(32, 47, 85, coffeeBean(C.brown, C.choc)) + G(31, 23, 10, coffeeBean(C.brownD, C.choc)),
    ground_coffee: () =>
      K.shadow(24) +
      `<path d="M12 18 H44 L46 56 C46 57.5 45 58 43.5 58 H12.5 C11 58 10 57.5 10 56 Z" fill="${C.black}"/>` +
      `<path d="M12 9 H44 V18 H12 Z" fill="${C.greyD}"/>` + K.line('M16 12 V15 M21 12 V15 M26 12 V15 M31 12 V15 M36 12 V15 M41 12 V15', 1.2, C.black) +
      `<circle cx="28" cy="35" r="9" fill="${C.creamL}"/>` + G(28, 35, 25, `<ellipse rx="4.5" ry="6.5" fill="${C.brownD}" stroke-width="1.5"/>` + K.line('M0 -6 C-2 -2 2 2 0 6', 1.2, C.creamL)) +
      `<path d="M30 58 C32 49 39 44 46 44 C53 44 58 50 59 58 Z" fill="${C.choc}"/>` + K.dots([[38, 53], [44, 50], [50, 54], [46, 56], [53, 51]], 1.1, C.brown) +
      K.hi('M13.5 21 L16.5 21 L15.5 50 L13 48 Z'),
    // ======== tea ========
    green_tea: () => teaHeap(C.leafD, C.leaf, C.leafD, C.leafL),
    black_tea: () => teaHeap(C.black, C.brownD, C.choc, C.brown),
    matcha: () =>
      K.bowl(`<path d="M14 31 C16 20 24 14 32 14 C40 14 48 20 50 31 Z" fill="${C.leafL}"/>` + K.hiE(25, 20, 3.5, 1.6) +
        stem('M44 26 L57 12', C.wheat, 3) + `<path d="M40 27 C40 24 44 22 47 24 C48 26 46 29 43 29 Z" fill="${C.wheat}" stroke-width="1.8"/>`, C.black, C.leafL),
    vanilla_extract: () => K.bottle(C.brownD, 'wine', C.creamL) + K.badge('cured_vanilla_beans', 48, 48, 12),
  });
})(FSI);
