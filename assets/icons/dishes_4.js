// Dishes group 4, part 1: Southeast Asian dishes (see assets/STYLE.md, reference buttered_toast).
(function (FSI) {
  const { C, K } = FSI;
  // ---- local helpers -------------------------------------------------------
  const P = (d, fill, sw) => `<path d="${d}" fill="${fill}"${sw === 0 ? ' stroke="none"' : sw ? ` stroke-width="${sw}"` : ''}/>`;
  const E = (cx, cy, rx, ry, fill, sw, rot) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${sw === 0 ? ' stroke="none"' : sw ? ` stroke-width="${sw}"` : ''}${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
  const O = (cx, cy, r, fill, sw) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${sw === 0 ? ' stroke="none"' : sw ? ` stroke-width="${sw}"` : ''}/>`;
  const G = (x, y, rot, s, m) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${m}</g>`;
  // outlined strand (noodle, stick, stem): ink underlay plus coloured core
  const tube = (d, col, w = 2.2) => K.line(d, w + 2.6, C.ink) + K.line(d, w, col);
  const leaf = (x, y, rot, fill = C.leaf, len = 10) =>
    G(x, y, rot, 1, `<path d="M0 0 C${len * 0.3} ${-len * 0.4} ${len * 0.75} ${-len * 0.4} ${len} 0 C${len * 0.75} ${len * 0.4} ${len * 0.3} ${len * 0.4} 0 0 Z" fill="${fill}" stroke-width="1.5"/>`);
  const shrimp = (x, y, rot = 0, s = 1) =>
    G(x, y, rot, s,
      `<path d="M-2.5 2.5 L-9 7.5 L-2 8 Z" fill="${C.orange}" stroke-width="1.6"/>` +
      `<path d="M-7.5 1.5 C-9 -6 -1.5 -10 5 -7.5 C10 -5 10 2.5 6 6.5 L2.5 2.5 C5 0 4 -4 1 -4 C-2.5 -4 -4 -1.5 -2.5 2.5 Z" fill="${C.pinkL}" stroke-width="1.8"/>` +
      K.line('M0 -8.5 L0.6 -4 M5 -7 L3.2 -2.8 M-5.6 -4.4 L-2.6 -2', 1.2, C.pinkD));
  const lime = (x, y, rot = 0) =>
    G(x, y, rot, 1, `<path d="M-7 0 A7 7 0 0 0 7 0 Z" fill="${C.leaf}" stroke-width="1.8"/><path d="M-4.6 0.8 A4.6 4.6 0 0 0 4.6 0.8 Z" fill="${C.leafL}" stroke="none"/>` +
      K.line('M0 1 V5 M-2.5 1 L-3.5 3.8 M2.5 1 L3.5 3.8', 1, C.leafD));
  const egg = (x, y, s = 1) =>
    G(x, y, 0, s, `<path d="M-10 0 C-11 -5 -5 -7 0 -6 C6 -8 11 -4 10 1 C9 5 3 6 -1 5.5 C-6 6 -10 4 -10 0 Z" fill="${C.white}" stroke-width="1.8"/>` +
      `<ellipse cx="0" cy="-0.5" rx="4.2" ry="3.4" fill="${C.yellow}" stroke-width="1.6"/>` + K.hiE(-1.3, -1.5, 1.6, 0.9, -10));
  const chili = (x, y, rot = 0) => G(x, y, rot, 1, `<ellipse cx="0" cy="0" rx="2.6" ry="2.2" fill="${C.red}" stroke-width="1.3"/><circle cx="0" cy="0" r="0.9" fill="${C.yellowL}" stroke="none"/>`);
  const rice = (d) => P(d, C.white) + K.dots([[24, 30], [28, 26], [33, 28], [21, 35], [30, 33], [36, 32], [26, 38], [34, 37]].map(([x, y]) => [x, y]), 0.9, C.greyL);

  FSI.add('dishes_4', {
    // Stir-fried rice noodles with shrimp, peanuts and lime.
    pad_thai: () => K.plate(
      P('M10 40 C8 31 19 24 32 24 C46 24 56 31 54 40 C52 48 42 50 32 50 C21 50 12 47 10 40 Z', C.orangeL) +
      K.line('M14 38 C20 32 26 42 32 34 C38 27 42 40 50 33 M16 44 C22 40 28 47 34 42 C40 37 44 45 50 40 M20 30 C26 27 32 33 40 28', 1.5, C.orangeD) +
      shrimp(23, 32, -10) + shrimp(39, 30, 15) +
      K.dots([[30, 41], [33, 43], [27, 44], [36, 39]], 1.3, C.brownD) +
      leaf(16, 46, -20, C.leaf, 7) + lime(48, 45, -15)),

    // Green coconut curry with chicken, Thai eggplant and basil.
    thai_green_curry: () => K.bowl(
      `<rect x="11" y="20" width="12" height="9" rx="3" fill="${C.cream}" stroke-width="1.8"/><rect x="34" y="23" width="12" height="9" rx="3" fill="${C.cream}" stroke-width="1.8"/>` +
      O(27, 28, 5.5, C.leaf, 1.8) + O(27, 28, 2.4, C.leafL, 0) + O(48, 23, 5, C.leaf, 1.8) + O(48, 23, 2.2, C.leafL, 0) +
      leaf(14, 32, -20, C.leafD, 12) + leaf(40, 19, -160, C.leafD, 12) + leaf(26, 18, -60, C.leaf, 10),
      C.white, C.leafL),

    // Red curry with shrimp, red pepper and basil.
    thai_red_curry_with_shrimp: () => K.bowl(
      shrimp(20, 25, -10) + shrimp(42, 24, 20) +
      `<path d="M26 33 C29 30 34 29 38 30" stroke="${C.ink}" stroke-width="5.4"/><path d="M26 33 C29 30 34 29 38 30" stroke="${C.red}" stroke-width="2.8"/>` +
      `<path d="M10 31 C12 29 16 29 18 30" stroke="${C.ink}" stroke-width="5.4"/><path d="M10 31 C12 29 16 29 18 30" stroke="${C.redD}" stroke-width="2.8"/>` +
      leaf(29, 22, -30, C.leafD, 12) + leaf(53, 30, 195, C.leaf, 10),
      C.white, C.orange),

    // Mild brown curry with beef, potato and peanuts.
    massaman_curry: () => K.bowl(
      `<rect x="10" y="21" width="13" height="11" rx="4" fill="${C.yellowL}" stroke-width="1.8"/><rect x="39" y="19" width="13" height="11" rx="4" fill="${C.yellowL}" stroke-width="1.8"/>` +
      `<rect x="24" y="21" width="13" height="11" rx="3" fill="${C.brownD}" stroke-width="1.8"/>` + K.hi('M26.5 23.5 H33 V25.5 H26.5 Z') +
      E(48, 33, 3.2, 2.2, C.woodL, 1.4) + E(19, 35, 3.2, 2.2, C.woodL, 1.4) + E(40, 35, 3.2, 2.2, C.woodL, 1.4) + E(29, 35.5, 3.2, 2.2, C.woodL, 1.4),
      C.white, C.brownL),

    // Hot and sour shrimp soup: red broth, mushrooms, chilies, lime leaves.
    tom_yum_goong: () => K.steam(32, 10) + K.bowl(
      shrimp(19, 26, -15) + shrimp(41, 26, 25) +
      `<path d="M25 33 C25 26 37 26 37 33 Z" fill="${C.creamD}" stroke-width="1.8"/>` + K.line('M31 33 V29', 1.2) +
      chili(30, 22) + chili(13, 33) + chili(50, 33) + leaf(46, 19, 170, C.leafD, 11),
      C.white, C.redL),

    // Coconut chicken soup: pale broth, galangal, mushroom, lime leaf, chili.
    tom_kha_gai: () => K.steam(32, 10) + K.bowl(
      `<rect x="11" y="22" width="12" height="8" rx="3" fill="${C.wheatL}" stroke-width="1.8"/><rect x="38" y="25" width="12" height="8" rx="3" fill="${C.wheatL}" stroke-width="1.8"/>` +
      `<path d="M23 34 C23 27 34 27 34 34 Z" fill="${C.greyL}" stroke-width="1.8"/>` + K.line('M28.5 34 V30', 1.2) +
      leaf(39, 21, 165, C.leaf, 13) + chili(18, 34) + chili(46, 34) + E(31, 21, 4, 2.6, C.cream, 1.5),
      C.white, C.creamL),

    // Green papaya salad: pale green shreds, cherry tomatoes, peanuts, chili.
    som_tam: () => K.plate(
      P('M10 41 C7 33 17 24 31 23 C46 22 57 31 54 41 C51 49 41 51 32 51 C21 51 12 48 10 41 Z', C.leafL) +
      K.line('M14 39 C22 33 30 36 40 29 M17 45 C26 39 34 43 48 35 M22 30 C30 28 36 31 46 27 M24 47 C32 44 40 47 50 41', 1.4, C.leaf) +
      O(22, 36, 4.5, C.red, 1.8) + O(22, 36, 2.4, C.redL, 0) + O(41, 41, 4.5, C.red, 1.8) + O(41, 41, 2.4, C.redL, 0) +
      K.dots([[31, 40], [34, 43], [29, 45]], 1.5, C.brownD) + chili(34, 30) + chili(48, 34)),

    // Sticky rice with mango slices and coconut sauce.
    mango_sticky_rice: () => K.plate(
      P('M8 40 C6 32 13 26 22 27 C30 26 34 33 33 40 C32 46 27 48 20 48 C13 48 9 45 8 40 Z', C.white) +
      P('M11 33 C15 29 26 28 31 34 C27 36 23 33 19 36 C16 34 13 36 11 33 Z', C.creamL, 1.4) +
      K.dots([[16, 41], [21, 43], [26, 40], [13, 39], [24, 45]], 0.9, C.greyD) +
      [[40, 0], [44, 8], [48, 16]].map(([x, r]) =>
        G(x, 37, r - 25, 1, `<path d="M-6 -10 C2 -14 10 -4 6 10 C4 13 -1 13 -2 10 C-6 3 -10 -4 -6 -10 Z" fill="${C.yellow}" stroke-width="1.8"/>`)).join('') +
      K.hiE(36, 29, 2.5, 1.2) + K.dots([[24, 31], [20, 33], [27, 33]], 0.8, C.ink)),

    // Beef noodle soup: clear broth, rice noodles, beef slices, herbs, lime.
    pho_bo: () => K.steam(32, 9) + K.bowl(
      tube('M12 31 C16 21 22 33 27 23 C30 17 35 30 38 22', C.white, 2.2) + tube('M24 33 C28 25 33 34 37 26 C40 20 45 30 50 24', C.white, 2.2) +
      P('M14 24 C16 18 26 18 29 22 C27 26 18 27 14 24 Z', C.brownL, 1.8) + P('M33 20 C36 15 45 16 47 21 C44 25 36 24 33 20 Z', C.brownL, 1.8) +
      leaf(39, 31, -10, C.leaf, 11) + leaf(11, 31, -35, C.leafD, 10) + lime(50, 27, 200),
      C.white, C.wheatL),

    // Baguette split and filled with pork, pickled carrot, cucumber and cilantro.
    banh_mi: () => K.shadow(26, 56) + G(32, 36, -12, 1,
      P('M-27 2 C-27 9 -23 13 -16 13 H16 C23 13 27 9 27 2 C13 5 -12 5 -27 2 Z', C.wheat) +
      P('M-25 -2 C-12 -4 13 -4 26 -2 L26 3 C12 5 -12 5 -26 3 Z', C.meatL, 1.6) +
      tube('M-20 -5 L-12 -2 M-8 -6 L-1 -2 M4 -5 L11 -2', C.orange, 1.8) +
      tube('M14 -6 L21 -2', C.leafL, 1.8) +
      leaf(-24, -6, -40, C.leaf, 8) + leaf(18, -7, -60, C.leaf, 8) + leaf(-4, -8, -100, C.leaf, 7) +
      P('M-25 -6 C-26 -12 -21 -16 -14 -16 H14 C21 -16 26 -13 26 -7 C13 -9 -12 -9 -25 -6 Z', C.wheat) +
      K.line('M-14 -14 L-10 -10 M-4 -14 L0 -10 M6 -14 L10 -10', 1.5, C.wheatD) +
      K.hi('M-20 -12 C-16 -14 -10 -14 -6 -14 C-10 -12 -16 -11 -20 -10 Z')),

    // Fresh rice-paper rolls, shrimp and herbs showing through, hoisin dip.
    goi_cuon: () => K.plate(
      [[27, 33], [35, 43]].map(([x, y]) => G(x, y, -14, 1,
        `<rect x="-17" y="-7" width="34" height="14" rx="7" fill="${C.creamL}"/>` +
        `<path d="M-13 -1 C-9 -6 -1 -6 2 -1 C-2 2 -9 3 -13 -1 Z" fill="${C.leafL}" stroke="none"/>` +
        `<path d="M3 -3 C6 -6 11 -5 12 -1 C11 1 8 1 7 -1 C6 -2 4 -1 3 -3 Z" fill="${C.pinkL}" stroke="${C.pinkD}" stroke-width="1.2"/>` +
        `<path d="M-10 3 C-5 1 -1 4 4 2" fill="none" stroke="${C.leaf}" stroke-width="1.4"/>` +
        `<rect x="-17" y="-7" width="34" height="14" rx="7" fill="none"/>` + K.hi('M-12 -5 H6 V-3.5 H-12 Z'))).join('') +
      E(50, 33, 6, 3.5, C.white, 1.8) + E(50, 33, 4, 2.2, C.brown, 0)),

    // Grilled turmeric chicken skewers with peanut sauce and cucumber.
    chicken_satay: () => K.plate(
      [[0, 0], [7, 7]].map(([dx, dy]) =>
        tube(`M${8 + dx} ${46 + dy} L${48 + dx} ${24 + dy}`, C.woodL, 1.6) +
        [[16, 41.6], [24, 37.2], [32, 32.8], [40, 28.4]].map(([x, y]) =>
          `<rect x="${x + dx - 4}" y="${y + dy - 3.5}" width="8" height="7" rx="2.5" fill="${C.orange}" stroke-width="1.6" transform="rotate(-29 ${x + dx} ${y + dy})"/>`).join('') +
        K.line(`M${21 + dx} ${38.5 + dy} L${26 + dx} ${36 + dy} M${37 + dx} ${29.5 + dy} L${42 + dx} ${27 + dy}`, 1.2, C.orangeD)).join('') +
      E(49, 43, 7, 4, C.white, 1.8) + E(49, 43, 5, 2.6, C.brownL, 0) + K.dots([[48, 42.5], [51, 43.5]], 0.8, C.brownD) +
      O(12, 32, 3.5, C.leafL, 1.6) + O(19, 29, 3.5, C.leafL, 1.6)),

    // Indonesian fried rice with a fried egg on top.
    nasi_goreng: () => K.plate(
      P('M9 42 C7 33 17 25 31 25 C46 25 56 32 54 41 C52 48 42 50 32 50 C21 50 11 48 9 42 Z', C.brownL) +
      K.dots([[15, 42], [20, 46], [26, 47], [38, 47], [46, 45], [50, 40], [14, 35], [18, 31], [47, 33], [42, 29]], 1.1, C.brown) +
      K.dots([[12, 39], [34, 48], [51, 37]], 1.1, C.red) +
      egg(32, 34, 1.15) + chili(18, 38) + leaf(45, 39, -30, C.leaf, 8)),

    // Slow-cooked dry beef curry: dark chunks with chili and coconut.
    beef_rendang: () => K.plate(
      [[18, 38, 0], [30, 33, 20], [42, 38, -10], [26, 44, 10], [38, 45, -20], [32, 27, -15]].map(([x, y, r]) =>
        `<rect x="${x - 7}" y="${y - 5}" width="14" height="10" rx="4" fill="${C.brownD}" transform="rotate(${r} ${x} ${y})"/>`).join('') +
      K.hi('M14 35 L21 34 L20 36 L14 37 Z') + K.hi('M27 30 L34 30 L33 31.5 L27 32 Z') +
      K.dots([[23, 38], [34, 40], [44, 33], [31, 47], [19, 44], [36, 29]], 1, C.wheatL) +
      chili(48, 44) + chili(10, 42) + leaf(44, 27, -150, C.leafD, 10)),

    // Coconut curry noodle soup: orange broth, yellow noodles, shrimp, tofu puff.
    laksa: () => K.steam(32, 9) + K.bowl(
      tube('M11 31 C15 22 21 33 26 24 C29 19 33 30 37 23', C.yellowL, 2.2) + tube('M26 34 C30 26 35 34 39 27 C42 21 47 31 51 26', C.yellowL, 2.2) +
      shrimp(20, 23, -20) + shrimp(44, 22, 20) +
      `<rect x="27" y="17" width="10" height="9" rx="2.5" fill="${C.wheat}" stroke-width="1.8"/>` + K.hi('M29 19 H34 V20.5 H29 Z') +
      leaf(10, 26, -30, C.leaf, 9) + lime(48, 32, 200),
      C.white, C.orangeL),

    // Filipino chicken stewed in soy and vinegar with garlic and bay leaves.
    chicken_adobo: () => K.bowl(
      `<path d="M10 29 C8 21 15 16 22 18 C27 19 28 24 30 25 L39 22 C41 19 45 20 44 24 C47 25 46 29 42 28 L32 31 C30 35 24 36 18 35 C13 34 11 32 10 29 Z" fill="${C.brown}"/>` +
      K.hi('M14 23 C16 20 21 19 23 21 C20 22 17 23 16 25 Z') +
      `<path d="M39 22 C41 19 45 20 44 24 C47 25 46 29 42 28" fill="${C.creamL}" stroke-width="1.8"/>` +
      `<path d="M44 33 C46 29 52 29 53 33 C52 37 46 37 44 33 Z" fill="${C.creamL}" stroke-width="1.6"/>` + K.line('M46 33 H51', 1, C.creamD) +
      leaf(29, 18, -25, C.leafD, 13) + leaf(30, 34, 10, C.leafD, 11),
      C.white, C.brownD),

    // Poached chicken slices on rice with cucumber and chili sauce.
    hainanese_chicken_rice: () => K.plate(
      `<path d="M8 38 C7 29 14 24 22 24 C30 24 35 30 34 38 C33 44 26 46 20 46 C13 46 9 43 8 38 Z" fill="${C.white}"/>` +
      K.dots([[14, 33], [19, 30], [25, 31], [16, 39], [23, 37], [29, 35], [20, 42]], 0.9, C.greyD) +
      [[30, 46], [36, 42], [42, 38]].map(([x, y]) => G(x, y, -30, 1,
        `<path d="M-9 -2 C-9 -5 9 -6 10 -3 L9 3 C2 5 -6 5 -9 3 Z" fill="${C.cream}" stroke-width="1.8"/>` +
        `<path d="M-9 -2 C-9 -5 9 -6 10 -3 L10 -0.5 C3 -2.5 -4 -1.5 -9 0.5 Z" fill="${C.yellow}" stroke="none"/>`)).join('') +
      O(50, 46, 3.5, C.leafL, 1.5) + O(56, 41, 3.5, C.leafL, 1.5) +
      E(46, 28, 5.5, 3.2, C.white, 1.8) + E(46, 28, 3.6, 2, C.red, 0) + leaf(9, 46, -10, C.leaf, 7)),
  });
})(FSI);
