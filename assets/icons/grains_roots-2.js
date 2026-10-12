// Grains, roots and legumes: processed grains, feeds and soy products.
(function (FSI) {
  const { C, K } = FSI;
  const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
  const E = (cx, cy, rx, ry, fill, rot = 0, sw = '') =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''} fill="${fill}"${sw ? ` stroke-width="${sw}"` : ''}/>`;
  const Ci = (cx, cy, r, fill, sw = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${sw ? ` stroke-width="${sw}"` : ''}/>`;
  const at = (x, y, rot, m) => `<g transform="translate(${x} ${y}) rotate(${rot})">${m}</g>`;
  // A scatter of grains (rx, ry) at given points: [[x, y, rot], ...].
  const grains = (pts, rx, ry, fill, sw = 1.3, crease = '') =>
    pts.map(([x, y, r]) => at(x, y, r, E(0, 0, rx, ry, fill, 0, sw) + (crease ? K.line(`M0 ${-ry * 0.6} V${ry * 0.6}`, 1, crease) : ''))).join('');
  // Grain glyph for sack fronts (centre 32,41).
  const SACKPTS = [[25, 36, -25], [32, 34, 5], [39, 36, 30], [22, 44, -40], [29, 42, -10], [36, 43, 20], [43, 44, 45], [27, 50, -20], [34, 50, 10], [40, 50, 35]];
  const flakes = (pts, f, dk) => pts.map(([x, y, r]) => at(x, y, r, P('M-3.5 -1.5 L1 -3 L3.8 0 L1.5 2.6 L-3 2 Z', f, ' stroke-width="1.2"') + K.line('M-1.5 -0.5 L1.5 0.5', 0.9, dk))).join('');
  const mini = (x, y) => `<path d="M${x} ${y + 9} V${y - 4}" stroke="${C.wheatD}" stroke-width="1.6"/>` +
    `<path d="M${x} ${y + 1} C${x - 3.5} ${y - 2} ${x - 3.5} ${y - 9} ${x} ${y - 14} C${x + 3.5} ${y - 9} ${x + 3.5} ${y - 2} ${x} ${y + 1} Z" fill="${C.wheat}" stroke-width="1.5"/>` +
    K.line(`M${x - 2} ${y - 8} L${x} ${y - 6} L${x + 2} ${y - 8} M${x - 2} ${y - 4} L${x} ${y - 2} L${x + 2} ${y - 4}`, 1, C.wheatD);
  // Small rice panicle glyph (drooping).
  const panicle = (x, y) => K.line(`M${x} ${y + 10} C${x} ${y} ${x + 3} ${y - 6} ${x + 8} ${y - 8}`, 1.5, C.wheatD) +
    [[x + 1, y - 2, 20], [x + 4, y - 6, 40], [x + 8, y - 6, 80], [x + 5, y, 60], [x + 9, y - 2, 90]].map(([a, b, r]) => E(a, b, 1.6, 2.8, C.wheat, r, 1.2)).join('');
  // Low heap of something on the ground.
  const mound = (fill, top = 26, rx = 26) => K.shadow(rx) + P(`M${32 - rx} 57 C${32 - rx + 4} ${top + 14} ${24} ${top} 32 ${top} C40 ${top} ${32 + rx - 4} ${top + 14} ${32 + rx} 57 Z`, fill);

  FSI.add('grains_roots', {
    white_rice: () => K.sack(C.white, grains(SACKPTS, 2.2, 4.4, C.white)),
    basmati_rice: () => K.sack(C.wheatL,
      grains([[24, 40, -35], [30, 38, -10], [36, 38, 15], [42, 40, 35], [26, 49, -25], [33, 47, 0], [40, 49, 25]], 1.6, 6, C.white, 1.2), C.leafD),
    brown_rice: () => {
      const pts = [];
      for (let r = 0; r < 3; r++) for (let i = 0; i < 6 - r; i++) pts.push([+(25 + r * 3 + i * 5.6).toFixed(1), 30 - r * 4, (i * 37 + r * 50) % 80 - 40]);
      return K.shadow(26) +
        K.line('M6 18 L22 30', 7) + K.line('M6 18 L22 30', 4, C.wood) +
        P('M14 30 C14 22 58 22 58 30 C58 46 48 56 36 56 C24 56 14 46 14 30 Z', C.woodL) +
        P('M16 30 C20 18 52 18 56 30 C50 33 22 33 16 30 Z', C.brownL, ' stroke-width="2"') +
        grains(pts, 1.9, 3.6, C.brownL, 1.2) +
        K.sh('M50 36 C52 44 46 52 38 55 C48 54 56 46 57 34 Z') + K.hi('M18 36 C19 42 22 47 26 50 L27 48 C24 45 22 41 21 36 Z') +
        grains([[10, 52, 30], [16, 55, -20], [6, 57, 70]], 1.9, 3.6, C.brownL, 1.2);
    },
    arborio_rice: () => {
      const pts = [];
      for (let r = 0; r < 5; r++) for (let i = 0; i < 6 - r; i++) pts.push([+(15 + r * 3.6 + i * 7.2).toFixed(1), 53 - r * 6.2, (i * 41 + r * 23) % 70 - 35]);
      return mound(C.creamD, 22) + grains(pts, 3, 4.6, C.creamL, 1.4) +
        pts.filter((_, i) => i % 3 === 0).map(([x, y]) => K.hiE(x - 0.8, y - 1.5, 0.9, 1.6, 0)).join('');
    },
    pearl_barley: () => {
      const pts = [[14, 28, 20], [21, 26, -10], [28, 25, 15], [35, 25, -20], [42, 26, 10], [49, 28, -15], [18, 22, -30], [25, 20, 0], [32, 19, 30], [39, 20, -5], [46, 22, 25], [28, 14, 10], [35, 14, -20], [22, 16, 40], [42, 16, -35]];
      return K.bowl(grains(pts, 3.4, 3.8, C.creamL, 1.4, C.creamD), C.woodL, C.creamD);
    },
    bulgur: () => K.sack(C.orangeL,
      flakes([[24, 44, 10], [31, 46, -30], [38, 44, 50], [27, 51, 70], [35, 52, 20], [42, 51, -40]], C.wheat, C.wheatD) + mini(32, 38)),
    wheat_bran: () => K.sack(C.brownL,
      flakes([[23, 47, 15], [29, 52, -25], [36, 52, 40], [42, 47, -10], [26, 40, 60], [39, 40, -50]], C.brown, C.brownD) + mini(32, 42)),
    rice_bran: () => K.sack(C.creamD,
      flakes([[23, 47, 15], [29, 52, -25], [36, 52, 40], [42, 47, -10]], C.wheatL, C.wheatD) + panicle(28, 40)),
    malted_barley: () => K.sack(C.wheat,
      [[25, 38, -30], [37, 37, 25], [24, 49, -15], [36, 49, 20]].map(([x, y, r]) =>
        at(x, y, r, K.line('M0 4 C-2 7 -1 9 2 10 M0 4 C2 7 4 7 5 9', 1.2, C.creamL) + E(0, 0, 3, 5, C.yellowL, 0, 1.4) + K.line('M0 -5 C2 -8 4 -9 6 -9', 1.6, C.leaf))).join('')),
    soybean_meal: () => K.sack(C.yellowL,
      flakes([[24, 49, 10], [30, 53, -30], [37, 52, 40], [43, 48, -20], [26, 42, 60], [40, 41, -50]], C.wheat, C.wheatD) +
      Ci(32, 40, 5.2, C.yellow, 1.5) + K.line('M29.8 37.6 Q32 36.4 34.2 37.6', 1.1, C.brownD) + K.hiE(30.4, 38.8, 1.4, 0.8, -10)),
    fish_meal: () => K.sack(C.greyL,
      `<path d="M22 40 C26 34 36 34 40 40 C36 46 26 46 22 40 Z" fill="${C.blueL}" stroke-width="1.6"/><path d="M40 40 L46 35 V45 Z" fill="${C.blueL}" stroke-width="1.6"/>` +
      K.dots([[26, 39]], 1, C.ink) + K.line('M31 37 Q33 40 31 43', 1, C.blueD) +
      flakes([[25, 50, 10], [32, 52, -30], [39, 50, 40]], C.greyD, C.ink)),
    cocoa_husks: () => K.sack(C.brown,
      [[25, 38, -20], [38, 37, 30], [24, 49, 40], [32, 46, -10], [40, 49, 15]].map(([x, y, r]) =>
        at(x, y, r, P('M-5 -2 C-3 -5 3 -5 5 -2 C4 1 3 3 0 3 C-3 3 -5 1 -5 -2 Z', C.brownL, ' stroke-width="1.3"') + K.line('M-3 -1.5 C-1 0 1 0 3 -1.5', 1, C.brownD))).join('')),
    animal_feed: () => {
      const pel = [];
      const cols = [C.brownL, C.wheat, C.leafD, C.brownL, C.wheatD];
      for (let r = 0; r < 4; r++) for (let i = 0; i < 8 - r * 2; i++) pel.push([+(14 + r * 7 + i * 5.2).toFixed(1), 30 - r * 4.6, (i * 61 + r * 17) % 140 - 70]);
      return K.crate(C.woodL, P('M8 31 C12 22 24 14 32 14 C40 14 52 22 56 31 Z', C.brownL) +
        pel.map(([x, y, r], i) => at(x, y, r, `<rect x="-3.2" y="-1.8" width="6.4" height="3.6" rx="1.6" fill="${cols[i % 5]}" stroke-width="1.2"/>`)).join(''));
    },
    spent_grain: () => {
      const pts = [];
      for (let r = 0; r < 5; r++) for (let i = 0; i < 7 - r; i++) pts.push([+(12 + r * 3.8 + i * 6.6).toFixed(1), 53 - r * 5.6, (i * 43 + r * 29) % 90 - 45]);
      return mound(C.brownD, 28) + grains(pts, 2.2, 3.8, C.brown, 1.2) + K.steam(32, 14) + K.hi('M10 52 C13 44 18 38 24 33 C21 39 16 46 14 53 Z');
    },
    nixtamalized_corn: () => {
      const pts = [[13, 27], [20, 25], [27, 24], [34, 24], [41, 25], [48, 27], [17, 21], [24, 19], [31, 18], [38, 19], [45, 21], [27, 13], [34, 13], [21, 15], [41, 15]];
      return K.bowl(pts.map(([x, y], i) =>
        P(`M${x - 3.5} ${y + 1} C${x - 4} ${y - 4} ${x - 1} ${y - 4.5} ${x} ${y - 3} C${x + 1} ${y - 4.5} ${x + 4} ${y - 4} ${x + 3.5} ${y + 1} C${x + 3} ${y + 4} ${x - 3} ${y + 4} ${x - 3.5} ${y + 1} Z`, i % 4 ? C.creamL : C.yellowL, ' stroke-width="1.4"')).join(''),
      C.terracotta, C.yellowL);
    },
    okara: () => K.bowl(
      P('M10 28 C9 23 13 20 17 21 C17 15 24 14 27 17 C29 12 37 12 39 16 C42 13 48 15 48 19 C52 19 55 23 54 28 C46 32 18 32 10 28 Z', C.cream, ' stroke-width="1.8"') +
      K.dots([[16, 24], [21, 20], [27, 22], [33, 17], [38, 21], [44, 19], [49, 24], [24, 27], [31, 26], [41, 26], [36, 29], [18, 28], [46, 28]], 1.3, C.creamD) +
      K.dots([[19, 25], [30, 21], [42, 23], [26, 18], [35, 24]], 1.5, C.creamL) +
      K.hiE(22, 17, 3, 1.3, -20),
      C.blueL, C.cream) + K.badge('soybeans', 50, 48, 11),
    tofu: () => K.shadow(26) +
      P('M6 30 L30 22 L58 30 L34 40 Z', C.white) +
      P('M6 30 L34 40 V56 L6 46 Z', C.creamL) +
      P('M34 40 L58 30 V46 L34 56 Z', C.cream) +
      K.sh('M34 40 L58 30 V46 L34 56 Z') +
      K.line('M14 30 L36 37.5 M20 28 L42 35.5', 1, C.creamD) +
      K.hi('M12 30 L30 24 L35 25.5 L17 31.8 Z'),
    silken_tofu: () => K.shadow(28) +
      E(32, 44, 29, 12, C.white) + E(32, 43.5, 24, 8.5, C.blueL, 0, 1.4) +
      P('M11 31 V41 C11 46 27 52 32 52 C37 52 53 46 53 41 V31 Z', C.creamL) +
      P('M11 31 C11 27 27 21 32 21 C37 21 53 27 53 31 C53 35 37 41 32 41 C27 41 11 35 11 31 Z', C.white) +
      E(42, 29.5, 6, 3.4, C.cream, -8, 1.6) + K.sh('M39 30 C40 28 44 27 47 28 C45 28.5 42 29 39 31 Z') +
      K.sh('M44 39 C49 37 53 35 53 31 V41 C53 44 49 46 44 48 Z') +
      K.hiE(22, 28, 6, 2, -12) + K.hi('M14 36 L16 37 V45 L14 44 Z'),
    sushi_rice: () => {
      const pts = [[14, 30], [20, 27], [26, 29], [32, 27], [38, 29], [44, 27], [50, 30], [17, 34], [23, 33], [29, 34], [35, 33], [41, 34], [47, 34], [26, 25], [40, 25]];
      return K.shadow(28) +
        E(32, 32, 28, 11, C.woodL) +
        P('M7 30 C10 22 54 22 57 30 C54 38 10 38 7 30 Z', C.white, ' stroke-width="1.6"') +
        pts.map(([x, y], i) => E(x, y, 2.6, 1.5, C.white, i % 2 ? 25 : -25, 1.1)).join('') +
        P('M4 32 C4 44 16 52 32 52 C48 52 60 44 60 32 C60 39 48 43 32 43 C16 43 4 39 4 32 Z', C.woodL) +
        K.line('M5 38 C10 44 54 44 59 38 M7 44 C14 50 50 50 57 44', 2, C.orangeD) +
        at(44, 18, 35, P('M-4 -6 C-4 -12 4 -12 4 -6 V2 C4 3 -4 3 -4 2 Z', C.wood) + `<rect x="-1.6" y="2" width="3.2" height="14" rx="1.4" fill="${C.wood}"/>`) +
        K.hi('M8 38 C10 44 14 47 20 49 L20 47 C15 45 12 42 10 37 Z');
    },
  });
})(FSI);
