// Fruit & nuts group: orchard fruit, citrus, berries, nuts, tropical crops and their simple products.
(function (FSI) {
  const { C, K } = FSI;
  // local helpers
  const leaf = (x, y, rot, L = 14, fill = C.leaf, w = 0.4) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 C${L * 0.3} ${-L * w} ${L * 0.7} ${-L * w} ${L} 0 C${L * 0.7} ${L * w} ${L * 0.3} ${L * w} 0 0 Z" fill="${fill}" stroke-width="2"/>` +
    K.line(`M2 0 H${L * 0.75}`, 1.2, C.leafD) + `</g>`;
  const stem = (d, col = C.brownD, w = 3) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  // crescent shade on the lower right of a circle
  const shc = (cx, cy, r) => K.sh(`M${cx + r * 0.71} ${cy - r * 0.71} A${r} ${r} 0 0 1 ${cx - r * 0.71} ${cy + r * 0.71} A${r * 1.15} ${r * 1.15} 0 0 0 ${cx + r * 0.71} ${cy - r * 0.71} Z`);
  const ball = (cx, cy, r, fill, sw) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${sw ? ` stroke-width="${sw}"` : ''}/>` + shc(cx, cy, r) + K.hiE(cx - r * 0.42, cy - r * 0.42, r * 0.28, r * 0.17);
  const grape = (x, y, r, fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke-width="2"/>` + K.hiE(x - r * 0.38, y - r * 0.38, r * 0.3, r * 0.18);

  // teardrop centred on 0,0, point up: half-length L, half-width W
  const drop = (L, W) => `M0 ${-L} C${W * 0.5} ${-L * 0.6} ${W} ${-L * 0.1} ${W} ${L * 0.25} C${W} ${L * 0.75} ${W * 0.5} ${L} 0 ${L} C${-W * 0.5} ${L} ${-W} ${L * 0.75} ${-W} ${L * 0.25} C${-W} ${-L * 0.1} ${-W * 0.5} ${-L * 0.6} 0 ${-L} Z`;
  // peanut pod (two lobes with a waist), about 22 x 12
  const pod = (x, y, rot, fill, s = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    `<path d="M-11 0 C-11 -6 -5 -7 -2 -4 C0 -3 2 -3 4 -5 C8 -8 12 -4 12 0 C12 5 8 7 4 5 C2 3.5 0 3.5 -2 5 C-6 7.5 -11 5 -11 0 Z" fill="${fill}" stroke-width="2"/>` +
    K.line('M-7 -2 L-5 1 M-4 -3 L-6 3 M5 -3 L7 2 M8 -4 L6 3', 1, C.wheatD) + `</g>`;
  FSI.add('fruit_nuts', {
    strawberry: () =>
      K.shadow(18) +
      `<path d="M32 19 C45 15 56 22 54 34 C52 46 40 55 32 58 C24 55 12 46 10 34 C8 22 19 15 32 19 Z" fill="${C.red}"/>` +
      K.sh('M50 26 C55 36 50 48 36 56 C46 52 54 44 54 34 C54 31 52 28 50 26 Z') +
      K.hiE(18, 29, 4, 2.4) +
      K.dots([[26, 27], [34, 26.5], [42, 28.5], [17, 37], [25, 35], [33, 34.5], [41, 35], [48, 37], [21, 44], [29, 43], [37, 43], [44, 45], [27, 50], [35, 50.5]], 1.2, C.yellowL) +
      `<path d="M32 22 L19 18.5 L26 15.5 L22 9 L30.5 13 L32 6 L35 13 L43 9 L39 15.5 L46 18.5 Z" fill="${C.leaf}" stroke-width="1.8"/>` +
      stem('M33 9 C33.5 6.5 35 4.5 37 3.5', C.leafD, 2.5),
    watermelon: () =>
      K.shadow(24) +
      `<g transform="rotate(-10 32 36)">` +
      `<path d="M6 26 H58 C58 44 46 55 32 55 C18 55 6 44 6 26 Z" fill="${C.leafD}"/>` +
      `<path d="M9.5 26 H54.5 C54.5 41.5 44.5 51.5 32 51.5 C19.5 51.5 9.5 41.5 9.5 26 Z" fill="${C.creamL}" stroke="none"/>` +
      `<path d="M12 26 H52 C52 39.5 43 49 32 49 C21 49 12 39.5 12 26 Z" fill="${C.red}" stroke-width="1.5"/>` +
      K.hi('M15 28 H24 C21 30 18 33 17 36 C15.5 33 15 30 15 28 Z') +
      [[21, 32], [29, 35], [37, 35], [45, 32], [25, 41], [33, 43], [41, 40.5]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.3" ry="2.1" fill="${C.black}" stroke="none"/>`).join('') +
      `</g>`,
    melon: () =>
      K.shadow(26) +
      `<ellipse cx="26" cy="35" rx="21" ry="20" fill="${C.wheat}"/>` +
      K.line('M26 15 C16 22 14 46 26 55 M26 15 C36 22 38 46 26 55 M26 15 C20 25 20 45 26 55 M26 15 C9 22 7 44 20 54 M26 15 C43 22 45 44 32 54', 1.3, C.wheatD) +
      K.hiE(15, 26, 4, 2.5) +
      stem('M26 15 V10', C.brownD, 3) +
      `<path d="M28 44 C38 52 52 50 59 40 C60 50 52 58 41 58 C34 58 29 53 28 44 Z" fill="${C.leafL}"/>` +
      `<path d="M28 44 C38 52 52 50 59 40 C57 47 50 53.5 41 54 C35 54.5 30 50 28 44 Z" fill="${C.orange}" stroke="none"/>` +
      `<path d="M28 44 C38 52 52 50 59 40" fill="none"/>` +
      K.line('M33 47.5 C40 50 49 48.5 54 44', 1.3, C.orangeD),
    apple: () =>
      K.shadow(22) +
      `<path d="M32 22 C26 15 10 16 9 32 C8 46 18 58 27 57 C30 56.5 34 56.5 37 57 C46 58 56 46 55 32 C54 16 38 15 32 22 Z" fill="${C.red}"/>` +
      K.sh('M50 25 C56 34 54 48 42 55 C51 54 55 44 55 34 C55 30 53 27 50 25 Z') +
      K.hiE(18, 29, 5, 3) +
      stem('M32 23 C32 17 33 13 36 8') + leaf(35, 13, -25, 15),
    pear: () =>
      K.shadow(18) +
      `<path d="M32 9 C27 9 25 15 25 21 C25 27 14 32 14 44 C14 53 22 58 32 58 C42 58 50 53 50 44 C50 32 39 27 39 21 C39 15 37 9 32 9 Z" fill="${C.leafL}"/>` +
      K.sh('M45 34 C50 40 50 50 42 56 C47 55 50 50 50 44 C50 40 48 37 45 34 Z') +
      K.hiE(21, 39, 4, 2.6) + K.dots([[30, 26], [36, 33], [27, 45], [40, 47], [34, 52]], 0.9, C.leafD) +
      stem('M32 10 C32 7 33 5.5 35 4.5') + leaf(33, 9, -5, 13),
    quince: () =>
      K.shadow(22) +
      `<path d="M32 15 C28 15 26 19 25 22 C16 25 9 32 9 42 C9 52 19 58 32 58 C45 58 55 52 55 42 C55 32 48 25 39 22 C38 19 36 15 32 15 Z" fill="${C.yellow}"/>` +
      K.line('M23 30 C20 38 21 48 26 55 M41 30 C44 38 44 47 40 55', 1.4, C.yellowD) +
      K.sh('M48 30 C54 38 53 50 44 56 C51 54 55 49 55 42 C55 37 52 33 48 30 Z') +
      K.hiE(17, 36, 4, 2.6) +
      `<circle cx="18" cy="47" r="2.2" fill="${C.greyL}" stroke="none"/><circle cx="23" cy="49.5" r="1.6" fill="${C.greyL}" stroke="none"/>` +
      stem('M32 16 V10') + leaf(31, 12, -168, 16) + leaf(33, 11, -12, 16),
    cherry: () =>
      K.shadow(22) +
      stem('M20 34 C21 22 29 13 36 9 M42 36 C41 24 39 16 36 9', C.leafD, 2.5) +
      leaf(36, 9, 0, 17) + ball(20, 44, 11, C.redD) + ball(42, 46, 11, C.redD),
    sour_cherry: () =>
      K.shadow(24) +
      stem('M16 37 C18 25 25 15 32 9 M32 41 C33 29 33 18 32 9 M48 36 C46 25 39 15 32 9', C.leafD, 2.5) +
      stem('M32 9 L35 5', C.brownD, 3) +
      ball(16, 46, 9, C.red) + ball(48, 45, 9, C.red) + ball(32, 49, 9, C.red),
    plum: () =>
      K.shadow(22) +
      `<path d="M32 16 C46 16 54 26 54 38 C54 50 44 58 31 58 C18 58 10 49 10 37 C10 24 20 16 32 16 Z" fill="${C.purple}"/>` +
      K.line('M31 17 C24 26 23 42 29 57', 1.6, C.purpleD) +
      K.sh('M48 26 C54 34 54 48 42 56 C50 54 54 46 54 38 C54 33 52 29 48 26 Z') +
      K.hiE(19, 30, 4.5, 3) +
      stem('M32 17 C32 13 33 11 35 8') + leaf(34, 10, -5, 15),
    peach: () =>
      K.shadow(23) +
      `<path d="M32 19 C40 13 56 19 56 37 C56 50 46 58 32 58 C18 58 8 50 8 37 C8 21 24 14 32 19 Z" fill="${C.orangeL}"/>` +
      `<path d="M34 21 C43 16 54 22 55 35 C56 45 50 54 40 57 C46 48 46 33 34 21 Z" fill="${C.redL}" stroke="none"/>` +
      `<path d="M32 19 C40 13 56 19 56 37 C56 50 46 58 32 58 C18 58 8 50 8 37 C8 21 24 14 32 19 Z" fill="none"/>` +
      K.line('M32 20 C27 29 26 44 30 57', 1.6, C.orangeD) +
      K.hiE(18, 30, 4.5, 3) +
      leaf(31, 17, -145, 15) + leaf(33, 16, -35, 16),
    apricot: () =>
      K.shadow(25) +
      ball(22, 33, 16, C.orange) + K.line('M22 18 C17 25 16 38 20 48', 1.4, C.orangeD) +
      stem('M22 17 L23 12') + leaf(23, 13, -30, 12) +
      `<circle cx="44" cy="44" r="14" fill="${C.orange}"/><circle cx="44" cy="44" r="11.5" fill="${C.orangeL}" stroke="none"/>` +
      `<ellipse cx="45" cy="44" rx="5" ry="7" transform="rotate(20 45 44)" fill="${C.brown}" stroke-width="2"/>` +
      K.line('M43 38.5 C45 42 46 46 46.5 49.5', 1.2, C.brownD),
    fig: () =>
      K.shadow(26) +
      `<path d="M24 10 C27 10 28 14 29 18 C38 24 42 32 40 42 C38 52 30 56 22 56 C13 56 6 50 6 40 C6 30 12 24 19 18 C20 14 21 10 24 10 Z" fill="${C.purpleD}"/>` +
      K.hiE(14, 34, 3.5, 2.2) + stem('M24 10 L25 5', C.leafD, 3) +
      `<path d="M46 22 C49 22 50 26 51 29 C58 33 60 40 59 47 C58 54 52 58 45 58 C38 58 32 54 32 47 C32 40 35 33 41 29 C42 26 43 22 46 22 Z" fill="${C.purpleD}"/>` +
      `<path d="M46 27.5 C47 30 48 32 49.5 33 C55 36 56.5 41 56 47 C55 52 51 55.5 45.5 55.5 C40 55.5 35 52 35 47 C35 42 37 37 42.5 33 C44 31 45 29.5 46 27.5 Z" fill="${C.creamL}" stroke="none"/>` +
      `<path d="M45.5 35 C50 38 52 43 51 47 C50 51 48 52 45.5 52 C43 52 40 51 39.5 47 C39 43 41 38 45.5 35 Z" fill="${C.pinkD}" stroke-width="1.3"/>` +
      K.dots([[44, 40], [47, 42], [43, 45], [47, 46.5], [45, 49]], 0.9, C.yellowL),
    grapes: () => {
      const r = 6.8, f = C.leafL;
      return K.shadow(16) + stem('M32 14 C32 9 34 6 38 4', C.brownD, 3) + K.line('M33 10 C28 9 26 5 29 3', 1.4, C.leafD) +
        [[20, 20], [32, 19], [44, 20], [14, 31], [26, 30], [38, 30], [50, 31], [20, 41], [32, 41], [44, 41], [26, 51], [38, 51]].map(([x, y]) => grape(x, y, r, f)).join('');
    },
    wine_grapes: () => {
      const r = 6.3, f = C.purple;
      return K.shadow(14, 58, 34) + leaf(30, 15, -165, 22, C.leaf, 0.45) + stem('M34 17 C34 12 37 9 41 7', C.brownD, 3) +
        [[25, 22], [36, 21], [47, 22], [19.5, 32], [30.5, 32], [41.5, 32], [52.5, 32], [25, 42], [36, 42], [47, 42], [30.5, 51.5], [41.5, 51.5]].map(([x, y]) => grape(x, y, r, f)).join('');
    },
    pomegranate: () =>
      K.shadow(23) +
      `<path d="M25 21 L23 9 L28 13 L32 6 L36 13 L41 9 L39 21 Z" fill="${C.redD}"/>` +
      `<path d="M32 18 C46 18 56 28 56 40 C56 51 46 58 32 58 C18 58 8 51 8 40 C8 28 18 18 32 18 Z" fill="${C.meat}"/>` +
      `<path d="M26 22 C28 20 36 20 38 22 L36 18 H28 Z" fill="${C.redD}" stroke-width="2"/>` +
      K.sh('M50 28 C55 36 54 50 42 56 C51 54 56 47 56 40 C56 35 54 31 50 28 Z') +
      K.hiE(18, 31, 5, 3) + K.line('M18 50 C22 53 26 54 30 54.5', 1.3, C.redD),
    persimmon: () =>
      K.shadow(24) +
      `<path d="M32 22 C47 22 57 30 57 41 C57 52 46 58 32 58 C18 58 7 52 7 41 C7 30 17 22 32 22 Z" fill="${C.orange}"/>` +
      K.sh('M52 32 C57 40 55 51 42 56 C51 55 57 49 57 41 C57 37 55 34 52 32 Z') +
      K.hiE(17, 33, 5, 3) + K.line('M32 30 C30 40 30 48 32 56', 1.3, C.orangeD) +
      leaf(32, 26, -170, 13, C.leafD, 0.5) + leaf(32, 26, -10, 13, C.leafD, 0.5) + leaf(32, 26, 155, 11, C.leafD, 0.5) + leaf(32, 26, 25, 11, C.leafD, 0.5) +
      `<rect x="29.5" y="18" width="5" height="7" rx="1.5" fill="${C.brown}" stroke-width="2"/>`,
    kiwi: () =>
      K.shadow(26) +
      `<ellipse cx="24" cy="30" rx="18" ry="14" transform="rotate(-30 24 30)" fill="${C.brown}"/>` +
      K.dots([[16, 26], [21, 21], [27, 18], [14, 33], [20, 31], [26, 26], [32, 22]], 0.8, C.brownD) +
      K.hiE(16, 24, 3.5, 2) +
      `<circle cx="42" cy="42" r="16" fill="${C.brownL}"/><circle cx="42" cy="42" r="13" fill="${C.leaf}" stroke="none"/>` +
      `<ellipse cx="42" cy="42" rx="5" ry="3.5" fill="${C.leafL}" stroke="none"/>` +
      K.line('M42 31 V36 M42 48 V53 M31 42 H35 M49 42 H53 M34.5 34.5 L37.5 37.5 M46.5 46.5 L49.5 49.5 M49.5 34.5 L46.5 37.5 M34.5 49.5 L37.5 46.5', 1.2, C.leafL) +
      K.dots([[42, 37], [42, 47], [36.5, 42], [47.5, 42], [38, 38.5], [46, 45.5], [46, 38.5], [38, 45.5]], 1.1, C.black),
    olives: () => {
      const olive = (x, y, rot, f) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="9.5" transform="rotate(${rot} ${x} ${y})" fill="${f}"/>` + K.hiE(x - 2.5, y - 3.5, 2, 1.3, -40 + rot);
      return K.shadow(22, 58, 30) +
        stem('M57 8 C48 13 38 20 26 32', C.brown, 3.5) +
        leaf(50, 12, -162, 17, C.tealD, 0.28) + leaf(40, 18, -125, 14, C.tealD, 0.28) + leaf(31, 26, -165, 17, C.tealD, 0.28) + leaf(46, 14, 20, 16, C.tealD, 0.28) +
        stem('M26 32 L20 38 M36 23 L38 34 M44 16 L50 28', C.brown, 2) +
        olive(18, 45, 15, C.black) + olive(38, 42, -10, C.leaf) + olive(51, 33, -25, C.black);
    },
    // ---- citrus ----
    lemon: () =>
      K.shadow(22) +
      `<g transform="rotate(-20 32 37)">` +
      `<path d="M5 37 C8 36 10 34 12 31 C18 22 42 21 50 29 C52 32 55 34 59 35 C56 38 55 40 53 43 C46 53 22 54 13 45 C10 42 8 39 5 37 Z" fill="${C.yellow}"/>` +
      K.sh('M51 37 C48 45 40 50 27 51 C40 53 50 49 53 43 C54 41 55 39 56 38 Z') +
      K.hiE(22, 31, 6, 2.5, -5) + K.dots([[30, 35], [38, 33], [44, 39], [24, 42], [34, 44]], 0.9, C.yellowD) +
      `</g>` + stem('M50 22 C50 18 52 15 54 13', C.brownD, 2.5) + leaf(52, 16, -110, 14, C.leaf),
    lime: () =>
      K.shadow(24) +
      leaf(28, 25, -150, 16, C.leafD) + leaf(31, 24, -60, 14, C.leafD) +
      `<circle cx="22" cy="41" r="14" fill="${C.leaf}"/>` + `<circle cx="9" cy="35" r="2" fill="${C.leaf}" stroke-width="2"/>` +
      shc(22, 41, 14) + K.hiE(16, 35, 4, 2.4) +
      `<circle cx="43" cy="44" r="13" fill="${C.leaf}"/>` + `<circle cx="55" cy="38.5" r="2" fill="${C.leaf}" stroke-width="2"/>` +
      shc(43, 44, 13) + K.hiE(37.5, 38.5, 3.8, 2.3) +
      K.dots([[25, 46], [19, 48], [28, 39], [46, 49], [40, 50], [49, 43]], 0.8, C.leafD),
    orange: () =>
      K.shadow(22) + ball(32, 37, 21, C.orange) +
      K.dots([[24, 27], [33, 24], [42, 28], [20, 36], [30, 33], [40, 36], [48, 40], [26, 45], [36, 44], [44, 49], [31, 52]], 0.9, C.orangeD) +
      stem('M32 17 V12', C.brownD, 2.5) + leaf(33, 13, -20, 17) + leaf(31, 14, -170, 12) +
      `<path d="M32 18.5 L28.5 15.5 L32 16.5 L35.5 15.5 Z" fill="${C.leafD}" stroke-width="1.8"/>`,
    mandarin: () =>
      K.shadow(26) +
      `<ellipse cx="28" cy="38" rx="23" ry="16" fill="${C.orangeD}"/>` +
      K.dots([[18, 32], [27, 30], [36, 31], [14, 41], [23, 39], [32, 39], [41, 38], [20, 47], [29, 47], [38, 46]], 0.9, C.redD) +
      K.sh('M46 30 C51 36 50 46 40 52 C46 52 51 46 51 38 C51 35 49 32 46 30 Z') +
      K.hiE(15, 31, 5, 2.5) + leaf(28, 23, -35, 15) + stem('M28 23 V19', C.brownD, 2.5) +
      `<path d="M40 56 C42 48 50 43 59 45 C60 52 54 57 47 58 C44 58 41 57.5 40 56 Z" fill="${C.orange}"/>` +
      K.line('M44 55 C46 50 51 47 56 47', 1.2, C.orangeL),
    grapefruit: () =>
      K.shadow(26) + ball(23, 29, 19, C.orangeL) +
      K.dots([[18, 32], [26, 24], [14, 26]], 0.9, C.orangeD) +
      `<circle cx="42" cy="43" r="16" fill="${C.yellow}"/><circle cx="42" cy="43" r="13.5" fill="${C.creamL}" stroke="none"/>` +
      `<circle cx="42" cy="43" r="12" fill="${C.pinkD}" stroke-width="1.3"/>` +
      K.line('M42 32 V54 M31 43 H53 M34.2 35.2 L49.8 50.8 M49.8 35.2 L34.2 50.8', 1.5, C.creamL) +
      `<circle cx="42" cy="43" r="2.4" fill="${C.creamL}" stroke="none"/>`,
    lemon_juice: () => K.bottle(C.yellowL, 'oil', C.creamL) + K.badge('lemon', 48, 48, 12),
    lime_juice: () => K.bottle(C.leafL, 'oil', C.creamL) + K.badge('lime', 48, 48, 12),
    lemon_zest: () =>
      K.bowl(`<path d="M12 31 C15 22 24 17 32 18 C41 17 50 23 52 31 C44 34 22 34 12 31 Z" fill="${C.yellow}" stroke-width="2"/>` +
        K.line('M17 28 C19 24 23 26 21 29 M24 24 C27 20 31 24 28 27 M32 26 C34 21 39 23 37 27 M40 24 C43 22 46 25 44 29 M26 30 C29 28 33 30 31 32 M37 30 C40 28 44 31 46 30', 1.4, C.yellowD), C.white, C.yellow) +
      K.badge('lemon', 50, 47, 11),
    lime_zest: () =>
      K.bowl(`<path d="M12 31 C15 22 24 17 32 18 C41 17 50 23 52 31 C44 34 22 34 12 31 Z" fill="${C.leafL}" stroke-width="2"/>` +
        K.line('M17 28 C19 24 23 26 21 29 M24 24 C27 20 31 24 28 27 M32 26 C34 21 39 23 37 27 M40 24 C43 22 46 25 44 29 M26 30 C29 28 33 30 31 32 M37 30 C40 28 44 31 46 30', 1.4, C.leafD), C.white, C.leafL) +
      K.badge('lime', 50, 47, 11),
    // ---- berries ----
    raspberry: () => {
      const pts = [[24, 24], [32, 22], [40, 24], [19, 32], [27, 31], [35, 30], [43, 32], [17, 40], [25, 39], [33, 38], [41, 39], [48, 40], [21, 48], [29, 47], [37, 47], [44, 48], [27, 54], [36, 54]];
      return K.shadow(19) +
        `<path d="M32 17 C46 17 54 27 53 40 C52 51 43 58 32 58 C21 58 12 51 11 40 C10 27 18 17 32 17 Z" fill="${C.meat}"/>` +
        pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="none" stroke="${C.meatD}" stroke-width="1.2"/>`).join('') +
        K.dots(pts.map(([x, y]) => [x - 1.2, y - 1.2]), 0.9, C.pinkL) +
        K.sh('M48 26 C54 34 53 48 42 56 C50 54 53 47 53 40 C53 34 51 29 48 26 Z') +
        `<path d="M32 19 L23 15 L28 14 L26 9 L32 13 L38 9 L36 14 L41 15 Z" fill="${C.leaf}" stroke-width="1.8"/>` +
        stem('M32 12 C32 9 33 6 35 4', C.leafD, 2.5);
    },
    blackberry: () => {
      const pts = [[27, 22], [36, 22], [22, 30], [31, 29], [40, 30], [20, 38], [28, 37], [36, 37], [44, 38], [21, 46], [29, 45], [37, 45], [44, 46], [25, 53], [33, 53], [40, 52]];
      return K.shadow(16) +
        `<path d="M32 16 C43 16 49 24 49 36 C49 49 42 58 32 58 C22 58 15 49 15 36 C15 24 21 16 32 16 Z" fill="${C.purpleD}"/>` +
        pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.8" fill="none" stroke="${C.ink}" stroke-width="1.2"/>`).join('') +
        K.dots(pts.map(([x, y]) => [x - 1.2, y - 1.2]), 1, C.purpleL) +
        `<path d="M32 18 L20 13 L27 12.5 L24 7 L32 11 L40 7 L37 12.5 L44 13 Z" fill="${C.leaf}" stroke-width="1.8"/>` +
        stem('M32 10 C32 7 33 5 35 3', C.leafD, 2.5);
    },
    blueberry: () => {
      const star = (x, y, R) => 'M' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? R * 0.45 : R; return `${(x + q * Math.cos(a)).toFixed(1)} ${(y + q * Math.sin(a)).toFixed(1)}`; }).join(' L') + ' Z';
      const b = (x, y, r) => ball(x, y, r, C.blue) + `<path d="${star(x + 1, y - 2, r * 0.42)}" fill="${C.blueD}" stroke-width="1.4"/>`;
      return K.shadow(25) + b(20, 28, 13) + b(42, 30, 13) + b(31, 45, 14);
    },
    redcurrant: () =>
      K.shadow(18) + stem('M14 9 C24 12 32 18 36 30 C38 38 40 44 40 50', C.leafD, 2.5) +
      leaf(14, 9, 0, 16, C.leaf, 0.45) +
      stem('M27 15 L22 20 M33 24 L27 30 M36 32 L44 33 M38 40 L31 44 M40 47 L47 49', C.leafD, 1.8) +
      [[21, 24], [26, 33], [46, 34], [30, 46], [40, 52], [49, 50]].map(([x, y]) => ball(x, y, 6, C.red, 2) + `<circle cx="${x}" cy="${y + 4}" r="0.9" fill="${C.ink}" stroke="none"/>`).join(''),
    blackcurrant: () =>
      K.shadow(18) +
      `<path d="M8 22 C6 14 12 8 18 10 C20 4 30 4 30 11 C36 10 38 18 32 21 C30 26 22 28 18 24 C14 27 9 26 8 22 Z" fill="${C.leaf}" stroke-width="2"/>` +
      K.line('M26 20 L14 13 M26 20 L22 9 M26 20 L33 15', 1.2, C.leafD) +
      stem('M26 20 C32 24 36 30 38 38 C39 43 40 47 40 52', C.leafD, 2.5) +
      stem('M34 27 L26 31 M37 35 L45 34 M38 42 L30 46 M40 48 L48 49', C.leafD, 1.8) +
      [[24, 36], [47, 37], [28, 48], [40, 53], [50, 50]].map(([x, y]) => ball(x, y, 6.5, C.black, 2)).join(''),
    cranberry: () => {
      const cr = (x, y, rot) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="9" transform="rotate(${rot} ${x} ${y})" fill="${C.redD}"/>` +
        K.dots([[x + 3, y + 2], [x - 2, y + 4], [x + 5, y - 2]], 1.1, C.meatL) + K.hiE(x - 4, y - 3.5, 3.2, 1.8);
      return K.shadow(26) + cr(22, 30, -20) + cr(43, 31, 15) + cr(18, 47, 10) + cr(36, 47, -5) + cr(49, 46, 30);
    },
    elderberry: () => {
      const pts = [[14, 22], [20, 18], [27, 16], [34, 15], [41, 16], [48, 18], [54, 22], [12, 29], [19, 26], [26, 23], [33, 22], [40, 23], [47, 25], [53, 29], [17, 33], [24, 30], [31, 29], [38, 29], [45, 31], [51, 35], [22, 37], [29, 36], [36, 36], [43, 37]];
      return K.shadow(12) +
        stem('M32 58 V46 M32 46 C26 42 20 38 14 30 M32 46 C30 40 27 34 24 26 M32 46 C34 40 37 34 40 26 M32 46 C38 42 44 38 51 31', C.redD, 2) +
        pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${C.purpleD}" stroke-width="1.3"/>`).join('') +
        K.dots(pts.map(([x, y]) => [x - 1, y - 1]), 0.8, C.purpleL);
    },
    lingonberries: () =>
      K.shadow(24) + stem('M6 46 C18 40 34 30 56 14', C.brownD, 2.5) +
      [[14, 42, -150], [22, 38, -60], [30, 32, -150], [40, 26, -70], [46, 22, -160], [52, 17, -80]].map(([x, y, r]) => leaf(x, y, r, 11, C.leafD, 0.45)).join('') +
      [[24, 47], [34, 44], [44, 39], [29, 54], [40, 52], [50, 47]].map(([x, y]) => ball(x, y, 5.5, C.red, 2)).join(''),
    // ---- nuts ----
    almonds: () =>
      K.shadow(25) +
      `<g transform="translate(23 33) rotate(-18)"><path d="${drop(22, 13)}" fill="${C.creamD}"/>` +
      K.dots([[-5, -6], [2, -10], [5, -2], [-2, 2], [-7, 7], [3, 8], [7, 13], [-2, 14], [0, -15]], 1.1, C.wheatD) + K.hiE(-6, -8, 2.5, 5, 10) + `</g>` +
      `<g transform="translate(44 43) rotate(25)"><path d="${drop(15, 9)}" fill="${C.brown}"/>` +
      K.line('M-3 -8 C-5 -2 -5 6 -3 11 M3 -6 C4 0 4 6 2 11', 1.2, C.brownD) + K.hiE(-4, -4, 1.6, 3.5, 10) + `</g>`,
    walnuts: () =>
      K.shadow(26) +
      `<circle cx="24" cy="32" r="19" fill="${C.woodL}"/>` +
      K.line('M24 13 C21 22 27 40 24 51', 2.2, C.woodD) +
      K.line('M12 24 C15 26 13 30 17 31 M10 38 C14 37 15 42 19 41 M17 19 C19 22 17 24 20 25 M36 21 C33 24 35 27 31 28 M38 36 C34 36 34 41 30 41 M32 47 C30 44 27 46 27 44', 1.3, C.wood) +
      shc(24, 32, 19) + K.hiE(14, 22, 3.5, 2.2) +
      `<path d="M30 46 C30 38 38 33 45 33 C52 33 59 38 59 46 C59 53 52 58 45 58 C38 58 30 53 30 46 Z" fill="${C.woodL}"/>` +
      `<path d="M34 46 C34 40 39 37 44 38 C46 36 52 37 54 41 C56 44 55 49 52 51 C50 54 46 55 44 53 C41 55 36 52 35 49 C34 48 34 47 34 46 Z" fill="${C.wheat}" stroke-width="1.6"/>` +
      K.line('M44 38.5 V53 M38 43 C40 45 39 47 41 49 M50 42 C48 44 49 46 47 49', 1.2, C.wheatD),
    hazelnuts: () => {
      const hz = (x, y, rot, s) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="${drop(15, 14)}" fill="${C.brown}"/>` +
        `<path d="M-14 4 C-14 10 -7 15 0 15 C7 15 14 10 14 4 C8 7 -8 7 -14 4 Z" fill="${C.creamD}" stroke-width="2"/>` +
        K.line('M-5 -10 C-8 -4 -8 2 -7 5 M4 -11 C6 -5 6 1 5 5', 1.3, C.brownD) + K.hiE(-6, -6, 2, 4, 20) + `</g>`;
      return K.shadow(26) + leaf(16, 40, -150, 15) + leaf(18, 42, 160, 13) + leaf(22, 46, 120, 13) +
        hz(24, 30, -15, 1) + hz(44, 42, 15, 0.95);
    },
    chestnuts: () => {
      const sp = Array.from({ length: 18 }, (_, i) => { const t = (i / 18) * 2 * Math.PI; return `M${(23 + 14 * Math.cos(t)).toFixed(1)} ${(27 + 14 * Math.sin(t)).toFixed(1)} L${(23 + 19.5 * Math.cos(t + 0.08)).toFixed(1)} ${(27 + 19.5 * Math.sin(t + 0.08)).toFixed(1)}`; }).join(' ');
      return K.shadow(26) +
        K.line(sp, 2, C.leafD) + `<circle cx="23" cy="27" r="15" fill="${C.leaf}"/>` +
        K.dots([[16, 20], [24, 17], [31, 21], [14, 29], [20, 34], [28, 30], [33, 36]], 1.1, C.leafD) +
        `<path d="M40 24 C43 24 44 27 46 29 C53 33 58 39 58 46 C58 53 51 57 40 57 C29 57 22 53 22 46 C22 39 27 33 34 29 C36 27 37 24 40 24 Z" fill="${C.choc}"/>` +
        `<path d="M22.3 47 C23 53 30 57 40 57 C50 57 57.5 53 57.7 47 C50 51 30 51 22.3 47 Z" fill="${C.creamD}" stroke-width="2"/>` +
        K.hiE(31, 38, 5, 2.5) + K.line('M40 24 L39.5 20', 2);
    },
    pistachios: () => {
      const pi = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})">` +
        `<path d="M-13 0 C-13 -8 -5 -11 2 -11 C9 -11 14 -6 14 0 C14 6 9 11 2 11 C-5 11 -13 8 -13 0 Z" fill="${C.cream}"/>` +
        `<path d="M-4 -7 C2 -10 10 -7 11 0 C10 6 3 8 -3 6 C-1 2 -1 -3 -4 -7 Z" fill="${C.leaf}" stroke-width="1.8"/>` +
        `<path d="M-4 -7 C-1 -3 -1 2 -3 6 C-6 2 -6 -3 -4 -7 Z" fill="${C.purple}" stroke-width="1.4"/>` +
        K.hiE(-7, -5, 3, 1.6, 0) + `</g>`;
      return K.shadow(26) + pi(22, 26, -20) + pi(42, 30, 25) + pi(30, 46, 5);
    },
    pecans: () =>
      K.shadow(25) +
      `<ellipse cx="24" cy="30" rx="11" ry="20" transform="rotate(-25 24 30)" fill="${C.brown}"/>` +
      K.line('M17 15 C12 24 14 34 20 44 M27 13 C23 22 24 34 29 46', 1.6, C.choc) +
      K.hiE(16, 22, 2, 5, -25) +
      `<path d="M34 50 C34 40 42 34 50 32 C56 31 59 36 58 42 C57 50 50 56 42 57 C37 57.5 34 55 34 50 Z" fill="${C.brownL}"/>` +
      K.line('M38 52 C42 46 48 40 55 37 M40 45 C42 43 41 40 44 38 M47 50 C47 47 50 47 50 44', 1.4, C.brownD),
    pine_nuts: () => {
      const k = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 -6 C3 -6 3.5 -1 3 3 C2.5 6 -2.5 6 -3 3 C-3.5 -1 -3 -6 0 -6 Z" fill="${C.creamL}" stroke-width="1.6"/></g>`;
      return K.shadow(27) +
        stem('M18 10 L19 5', C.brownD, 3) +
        `<ellipse cx="18" cy="28" rx="12" ry="18" fill="${C.brown}"/>` +
        K.line('M8 18 L18 23 L28 18 M6.5 26 L18 31 L29.5 26 M7 34 L18 39 L29 34 M10 41.5 L18 45 L26 41.5 M12 13 L18 16 L24 13', 1.5, C.brownD) +
        K.hiE(11, 20, 2, 3.5, 0) +
        [[34, 50, 20], [41, 46, -30], [48, 51, 60], [39, 55, 80], [52, 44, 10], [56, 52, -20], [45, 39, 50], [30, 54, -60], [47, 55, 30]].map(([x, y, r]) => k(x, y, r)).join('');
    },
    cashew_nuts: () => {
      const cs = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(0.85)">` +
        `<path d="M-7 -7 C-9 4 -2 9 4 8 C8 7 10 3 9.5 -1" fill="none" stroke-width="16"/>` +
        `<path d="M-7 -7 C-9 4 -2 9 4 8 C8 7 10 3 9.5 -1" fill="none" stroke="${C.cream}" stroke-width="11"/>` +
        K.line('M-4 -3 C-4 2 0 4 4 3.5', 1.3, C.creamD) + K.hiE(-10, -3, 1.4, 3, 0) + `</g>`;
      return K.shadow(26) + cs(17, 21, -15) + cs(46, 23, 25) + cs(31, 47, 5);
    },
    macadamia_nuts: () =>
      K.shadow(26) + ball(24, 31, 18, C.brownL) + K.line('M10 26 C14 30 14 36 12 40', 1.3, C.brown) + `<circle cx="27" cy="19" r="1.8" fill="${C.brownD}" stroke="none"/>` +
      ball(46, 46, 11, C.creamL) + K.line('M38 49 C42 53 50 53 54 48', 1.2, C.creamD),
    roasted_peanuts: () =>
      K.bowl(pod(18, 28, -15, C.wheat) + pod(32, 23, 10, C.wheat) + pod(44, 29, -25, C.wheat) +
        `<ellipse cx="27" cy="33" rx="4" ry="3" fill="${C.brownL}" stroke-width="1.6"/><ellipse cx="37" cy="33" rx="4" ry="3" fill="${C.brownL}" stroke-width="1.6"/>`,
        C.white, C.brown),
    roasted_hazelnuts: () =>
      K.bowl(
        [[18, 27], [27, 24], [36, 23], [45, 27], [22, 32], [32, 31], [42, 32]].map(([x, y]) =>
          `<circle cx="${x}" cy="${y}" r="5.5" fill="${C.woodL}" stroke-width="1.8"/><path d="M${x + 1} ${y - 5} C${x + 5} ${y - 4} ${x + 6} ${y} ${x + 4} ${y + 3} C${x + 2} ${y} ${x + 1} ${y - 2} ${x + 1} ${y - 5} Z" fill="${C.brownD}" stroke="none"/>`).join(''),
        C.white, C.brown) + K.badge('hazelnuts', 50, 48, 11),
    peanut_butter: () => K.jar(C.brownL, C.red, pod(32, 41, -15, C.wheat, 0.95)),
    tahini: () =>
      K.jar(C.creamD, C.teal,
        [[26, 37, -30], [33, 35, 10], [39, 39, 40], [28, 45, 20], [36, 46, -20]].map(([x, y, r]) =>
          `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="3.6" transform="rotate(${r} ${x} ${y})" fill="${C.cream}" stroke-width="1.3"/>`).join('')),
    // ---- tropical ----
    sugarcane: () => {
      const cane = (x, rot, h) => `<g transform="translate(${x} 56) rotate(${rot})"><rect x="-4.5" y="${-h}" width="9" height="${h}" rx="2" fill="${C.leafL}"/>` +
        K.line(Array.from({ length: Math.floor(h / 10) }, (_, i) => `M-4.5 ${-8 - i * 10} H4.5`).join(' '), 1.8, C.leafD) +
        `<ellipse cx="0" cy="${-h}" rx="4.5" ry="1.8" fill="${C.creamL}" stroke-width="1.8"/>` + K.hi(`M-3 -6 H-1 V${-h + 4} H-3 Z`) + `</g>`;
      return K.shadow(22) +
        leaf(31, 20, -125, 17, C.leaf, 0.2) + leaf(33, 20, -55, 18, C.leaf, 0.2) + leaf(30, 21, -170, 18, C.leaf, 0.2) + leaf(34, 21, -10, 18, C.leaf, 0.2) +
        cane(20, -12, 36) + cane(44, 12, 36) + cane(32, 0, 40);
    },
    banana: () => {
      const b = (rot) => `<g transform="rotate(${rot} 46 12)"><path d="M48 12 C51 34 38 50 13 52 C9 52 8 49 10 47 C30 45 40 32 42 13 Z" fill="${C.yellow}"/>` +
        K.line('M44 18 C42 34 32 44 16 47.5', 1.3, C.yellowD) + `<path d="M8.5 48.5 L10 47 L13 52 L10.5 52.5 Z" fill="${C.choc}" stroke-width="1.5"/></g>`;
      return K.shadow(22, 58, 32) + `<g transform="translate(5 0)">` + b(18) + b(4) + b(-10) + `<rect x="40" y="6" width="9" height="9" rx="2" fill="${C.leafD}"/>` + K.hiE(23, 45, 4, 1.6, -20) + `</g>`;
    },
    plantain: () => {
      const p = (rot, f) => `<g transform="rotate(${rot} 50 10)"><path d="M52 10 C54 30 44 48 14 55 C10 56 7 54 8 51 C34 44 44 30 45 11 Z" fill="${f}"/>` +
        K.line('M48.5 16 C48 32 38 45 15 51.5', 1.5, C.leafD) + `<path d="M6.5 52.5 L8 51 L11 55.5 L8 56 Z" fill="${C.choc}" stroke-width="1.5"/></g>`;
      return K.shadow(24, 58, 32) + `<g transform="translate(3 0)">` + p(8, C.leaf) + p(-6, C.leafL) + `<rect x="44" y="4" width="10" height="9" rx="2" fill="${C.brown}"/>` +
        K.dots([[27, 42], [33, 38], [22, 46]], 1.2, C.leafD) + `</g>`;
    },
    pineapple: () =>
      K.shadow(18) +
      `<path d="M32 26 L24 6 L31 16 L32 3 L35 16 L42 7 L36 26 Z" fill="${C.leaf}" stroke-width="2"/>` +
      `<path d="M30 27 L14 14 L27 20 Z M34 27 L50 14 L37 20 Z" fill="${C.leafD}" stroke-width="2"/>` +
      `<ellipse cx="32" cy="42" rx="15" ry="16" fill="${C.yellow}"/>` +
      K.line('M20 33 L36 57 M25 28 L44 54 M33 26.5 L46.5 46 M17 42 L27 57.5 M44 33 L28 57 M39 28 L20 54 M31 26.5 L17.5 46 M47 42 L37 57.5', 1.3, C.orangeD) +
      K.sh('M42 31 C48 38 48 50 40 56 C46 55 47 48 47 42 C47 37 45 34 42 31 Z') + K.hiE(23, 34, 3, 2),
    mango: () => {
      const body = 'M9 40 C6 28 16 15 32 13 C47 11 58 20 56 32 C55 40 49 44 43 47 C35 52 30 57 22 56 C15 55 10 49 9 40 Z';
      return K.shadow(24) +
        `<path d="${body}" fill="${C.yellow}"/>` +
        `<path d="M32 13.5 C47 11.5 58 20 56 32 C55 37 52 41 48 43.5 C50 32 44 21 32 13.5 Z" fill="${C.red}" stroke="none"/>` +
        `<path d="M10 42 C11 50 16 55 22 55.5 C28 56 31 53 36 50 C26 50 16 47 10 42 Z" fill="${C.leafL}" stroke="none"/>` +
        `<path d="${body}" fill="none"/>` +
        K.hiE(20, 26, 6, 2.8) + stem('M31 14 C29 10 26 8 23 7', C.brownD, 3) + leaf(24, 8, 175, 18, C.leaf, 0.3);
    },
    papaya: () =>
      K.shadow(26) +
      `<g transform="rotate(-35 32 34)">` +
      `<path d="M32 5 C38 5 41 12 42 18 C47 26 48 44 44 52 C41 58 23 58 20 52 C16 44 17 26 22 18 C23 12 26 5 32 5 Z" fill="${C.leaf}"/>` +
      `<path d="M32 8.5 C36.5 8.5 38.5 14 39 19 C44 27 44.5 43 41.5 50.5 C39 55 25 55 22.5 50.5 C19.5 43 20 27 25 19 C25.5 14 27.5 8.5 32 8.5 Z" fill="${C.orange}" stroke="none"/>` +
      `<path d="M32 21 C36 25 38 34 37 42 C36 48 28 48 27 42 C26 34 28 25 32 21 Z" fill="${C.orangeD}" stroke-width="1.6"/>` +
      K.dots([[31, 27], [33, 31], [30, 35], [34, 37], [31, 41], [33.5, 44], [29.5, 46]], 1.7, C.black) +
      `</g>`,
    avocado: () =>
      K.shadow(26) +
      `<g transform="translate(22 30) rotate(-20)"><path d="${drop(20, 14)}" fill="${C.pine}"/>` + K.dots([[-5, -6], [3, -9], [-8, 4], [6, 2], [0, 10]], 1, C.leafD) + K.hiE(-7, -4, 2, 4, 20) + `</g>` +
      `<g transform="translate(43 40) rotate(20)"><path d="${drop(18, 13)}" fill="${C.pine}"/>` +
      `<path d="${drop(15.5, 10.7)}" fill="${C.leafL}" stroke="none"/><path d="${drop(11, 7.5)}" transform="translate(0 2)" fill="${C.yellowL}" stroke="none"/>` +
      `<circle cx="0" cy="5" r="6.5" fill="${C.brown}"/>` + K.hiE(-2.5, 2.5, 2, 1.2) + `</g>`,
    coconut: () =>
      K.shadow(26) +
      `<circle cx="24" cy="29" r="19" fill="${C.brown}"/>` +
      K.line('M10 22 C12 18 14 17 16 17 M8 32 L12 30 M12 42 L16 39 M30 14 L33 17 M38 24 L41 22 M37 39 L40 41 M22 46 L24 43', 1.4, C.brownD) +
      K.dots([[21, 18], [27, 18], [24, 23]], 2, C.choc) + shc(24, 29, 19) + K.hiE(14, 22, 3, 2) +
      `<path d="M28 42 C28 36 36 32 44 32 C52 32 60 36 60 42 C60 52 52 58 44 58 C36 58 28 52 28 42 Z" fill="${C.brownD}"/>` +
      `<ellipse cx="44" cy="42" rx="16" ry="10" fill="${C.white}"/><ellipse cx="44" cy="42.5" rx="11.5" ry="6.5" fill="${C.creamL}" stroke-width="1.4"/>`,
    dates: () => {
      const d = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><ellipse cx="0" cy="0" rx="6.5" ry="11" fill="${C.brownD}"/>` +
        K.line('M-2 -6 C-3 -1 -1 3 -3 7 M2 -3 C3 1 1 4 2 8', 1.2, C.choc) + K.hiE(-2.5, -4.5, 1.4, 3, 10) + `</g>`;
      return K.shadow(22) + stem('M32 4 C32 10 33 14 32 20 M32 12 C26 16 20 22 16 28 M32 12 C38 16 44 22 48 28', C.wheatD, 2.5) +
        d(16, 36, 10) + d(48, 36, -10) + d(26, 42, 5) + d(38, 42, -5) + d(32, 33, 0) + d(21, 48, 25);
    },
    passion_fruit: () =>
      K.shadow(26) + ball(22, 29, 17, C.purpleD) + K.line('M12 30 C15 28 17 31 20 29 M24 36 C27 34 29 37 31 35', 1.2, C.purple) +
      stem('M22 12 L23 7', C.leafD, 2.5) +
      `<circle cx="43" cy="43" r="15" fill="${C.purpleD}"/><circle cx="43" cy="43" r="12.5" fill="${C.creamL}" stroke="none"/>` +
      `<circle cx="43" cy="43" r="10" fill="${C.yellow}" stroke-width="1.4"/>` +
      K.dots([[39, 39], [46, 38], [43, 43], [38, 46], [47, 46], [42, 49], [49, 42]], 1.6, C.black),
    lychee: () =>
      K.shadow(25) + stem('M22 13 C24 8 28 6 32 5', C.brownD, 2.5) + leaf(30, 6, 10, 15) +
      `<circle cx="21" cy="30" r="16" fill="${C.red}"/>` +
      K.line('M12 22 l3 2 l-3 2 M20 18 l3 2 l-3 2 M28 21 l3 2 l-3 2 M10 32 l3 2 l-3 2 M18 28 l3 2 l-3 2 M27 30 l3 2 l-3 2 M15 39 l3 2 l-3 2 M24 38 l3 2 l-3 2', 1.2, C.redD) +
      shc(21, 30, 16) + K.hiE(13, 22, 3, 1.8) +
      `<path d="M30 50 C28 42 34 38 40 38 C34 46 36 52 40 56 C35 56 31 54 30 50 Z" fill="${C.red}" stroke-width="2"/>` +
      `<ellipse cx="46" cy="45" rx="12" ry="12.5" fill="${C.creamL}"/>` + K.hiE(41, 40, 3.2, 2) + K.line('M51 41 C54 45 53 50 49 53', 1.2, C.creamD),
    tamarind: () => {
      const pod = (pts, f) => pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke-width="5"/>`).join('') +
        pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="none"/>`).join('');
      return K.shadow(26) + `<g transform="translate(1 0)">` +
        pod([[9, 22, 5], [16, 18, 6], [24, 17, 6], [32, 18, 6], [40, 21, 6], [47, 26, 5.5]], C.brownL) +
        K.line('M13 16 V24 M20 13 V23 M28 12 V22 M36 14 V24 M44 18 V28', 1.2, C.brown) + K.hi('M14 14 C20 12 30 12 36 14 L35 16 C29 14.5 21 14.5 15 16 Z') +
        pod([[10, 44, 5], [17, 40, 6], [25, 39, 6]], C.brownL) +
        pod([[33, 41, 6], [41, 44, 6], [48, 48, 5.5], [54, 52, 4.5]], C.choc) +
        K.line('M36 38 C40 41 45 44 52 49 M32 46 C37 46 42 48 47 52', 1.2, C.brownD) + K.line('M21 34 V45', 1.2, C.brown) + `</g>`;
    },
    oil_palm_fruit: () => {
      const pts = [[22, 18], [32, 15], [42, 18], [16, 26], [26, 25], [37, 24], [47, 27], [13, 35], [22, 34], [32, 33], [42, 34], [51, 36], [16, 44], [26, 43], [37, 43], [47, 44], [22, 52], [32, 52], [42, 52]];
      const col = [C.orangeD, C.black, C.red, C.black, C.orange, C.redD, C.black, C.red, C.black, C.orangeD, C.black, C.redD, C.orange, C.black, C.red, C.black, C.orangeD, C.red, C.black];
      return K.shadow(24) +
        K.line('M14 16 L9 11 M50 16 L56 11 M8 30 L3 28 M56 30 L61 28 M10 46 L5 49 M54 46 L59 49 M32 8 V4', 2, C.brownD) +
        `<ellipse cx="32" cy="34" rx="24" ry="23" fill="${C.brownD}"/>` +
        pts.map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="5.2" ry="6" fill="${col[i]}" stroke-width="1.6"/>` + K.hiE(x - 1.6, y - 2.2, 1.3, 0.8)).join('');
    },
    // ---- dried fruit & coconut ----
    raisins: () =>
      K.shadow(24, 58, 28) +
      [[12, 47, 20], [22, 48, -10], [32, 47, 30], [17, 39, -30], [27, 39, 10], [37, 38, -20], [22, 31, 40], [32, 30, -10], [27, 23, 15]].map(([x, y, r]) =>
        `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-6 -1 C-6 -5 -2 -6 1 -5.5 C5 -5 6.5 -2 6 1 C5.5 5 2 6 -1 5.5 C-4.5 5 -6 3 -6 -1 Z" fill="${C.purpleD}" stroke-width="2"/>` +
        K.line('M-3 -2 C-1 0 1 -1 3 1 M-3 2 C-1 3 1 2 2 4', 1, C.purpleL) + `</g>`).join('') +
      K.badge('grapes', 50, 48, 11),
    prunes: () => {
      const pr = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-12 0 C-12 -7 -6 -10 0 -9.5 C7 -9 12 -6 12 0 C12 6 7 9.5 0 9.5 C-7 9.5 -12 6 -12 0 Z" fill="${C.black}"/>` +
        K.line('M-7 -4 C-4 -1 -6 3 -3 5 M0 -6 C2 -2 -1 2 2 6 M6 -5 C8 -1 6 2 8 4', 1.3, C.purple) + K.hiE(-6, -5, 2.5, 1.4, -10) + `</g>`;
      return K.shadow(24, 58, 28) + pr(19, 47, 10) + pr(22, 30, -10) + pr(42, 29, 15) + K.badge('plum', 50, 48, 11);
    },
    dried_apricots: () => {
      const ap = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-12 1 C-12 -6 -6 -10 1 -10 C8 -10 12 -5 12 1 C12 7 6 9 0 9 C-7 9 -12 7 -12 1 Z" fill="${C.orange}"/>` +
        K.line('M-4 -8 C-6 -2 -5 4 -2 8 M3 -3 C5 -1 7 0 9 -1', 1.3, C.orangeD) + K.hiE(-6, -5, 2.4, 1.4) + `</g>`;
      return K.shadow(25, 58, 28) + ap(18, 47, -10) + ap(22, 30, 5) + ap(43, 28, 15) + K.badge('apricot', 50, 48, 11);
    },
    dried_figs: () => {
      const fg = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 -10 C2 -10 3 -8 4 -6 C10 -5 13 -1 13 3 C13 8 7 10 0 10 C-7 10 -13 8 -13 3 C-13 -1 -10 -5 -4 -6 C-3 -8 -2 -10 0 -10 Z" fill="${C.brownL}"/>` +
        K.line('M-4 -3 C-6 1 -5 5 -3 8 M4 -3 C6 1 5 5 3 8', 1.2, C.brown) + K.hiE(-7, -2, 2.4, 1.4) + `<path d="M0 -10 L0.5 -13" stroke-width="2.5"/></g>`;
      return K.shadow(25, 58, 28) + fg(18, 47, -10) + fg(22, 29, 5) + fg(43, 28, 12) + K.badge('fig', 50, 48, 11);
    },
    dried_cranberries: () =>
      K.shadow(24, 58, 28) +
      [[11, 47, 20], [20, 49, -30], [29, 48, 60], [15, 39, -50], [24, 40, 30], [33, 39, -10], [19, 31, 10], [28, 31, -40], [37, 30, 50], [32, 22, 10]].map(([x, y, r]) =>
        `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-5 -1 C-5 -4 -2 -5 0 -4 C3 -5 5.5 -3 5 0 C5 3 3 4.5 0 4.5 C-3 5 -5 3 -5 -1 Z" fill="${C.redD}" stroke-width="2"/>` + K.line('M-2.5 -1 C-1 0 1 -1.5 2.5 0', 1, C.redL) + `</g>`).join('') +
      K.badge('cranberry', 50, 48, 11),
    dried_mango: () => {
      const st = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-17 -3 C-12 -8 -4 -4 2 -6 C8 -8 14 -7 17 -3 C16 2 12 5 6 4 C0 3 -6 7 -12 5 C-15 4 -17 1 -17 -3 Z" fill="${C.yellow}"/>` +
        K.line('M-12 0 C-6 -2 0 0 6 -1 C9 -2 12 -2 14 -3', 1.3, C.orange) + K.hiE(-10, -4, 2.6, 1.2, 0) + `</g>`;
      return K.shadow(26, 58, 28) + st(24, 48, -5) + st(26, 37, 10) + st(30, 25, -12) + K.badge('mango', 50, 48, 11);
    },
    desiccated_coconut: () =>
      K.sack(C.white, K.ref('coconut', 32, 41, 0.42) + `<path d="M22 21 C26 17 38 17 42 21" fill="${C.white}" stroke-width="1.5"/>`),
  });
})(FSI);
