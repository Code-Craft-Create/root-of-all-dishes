// dishes_5: Central & Northern European dishes, African dishes (see assets/STYLE.md).
(function (FSI) {
  const { C, K } = FSI;
  // local helpers
  const P = (d, fill, sw) => `<path d="${d}" fill="${fill}"${sw ? ` stroke-width="${sw}"` : ''}/>`;
  const E = (cx, cy, rx, ry, fill, sw, rot) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${sw ? ` stroke-width="${sw}"` : ''}${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
  const F = (d, fill) => `<path d="${d}" fill="${fill}" stroke="none"/>`; // fill only, no outline
  // thick outlined strand (sausage, pretzel dough): ink stroke under a coloured stroke
  const strand = (d, w, fill) =>
    `<path d="${d}" fill="none" stroke-width="${w + 5}"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}"/>`;
  // dollop of cream / sour cream
  const dollop = (x, y, s = 1, fill = C.white) =>
    P(`M${x - 6 * s} ${y + 2 * s} C${x - 8 * s} ${y - 2 * s} ${x - 4 * s} ${y - 5 * s} ${x - 1 * s} ${y - 4 * s} C${x} ${y - 7 * s} ${x + 5 * s} ${y - 6 * s} ${x + 5 * s} ${y - 2 * s} C${x + 8 * s} ${y - 1 * s} ${x + 7 * s} ${y + 4 * s} ${x + 3 * s} ${y + 4 * s} C${x} ${y + 5 * s} ${x - 4 * s} ${y + 5 * s} ${x - 6 * s} ${y + 2 * s} Z`, fill, 1.8);
  // small sprig of herb leaves (dill/parsley) around x,y
  const sprig = (x, y, col = C.leaf) =>
    K.line(`M${x - 5} ${y + 3} L${x + 4} ${y - 3} M${x - 2} ${y + 1} L${x - 3} ${y - 3} M${x + 1} ${y - 1} L${x + 1} ${y - 5} M${x - 2} ${y + 1} L${x + 1} ${y + 4} M${x + 1} ${y - 1} L${x + 5} ${y + 1}`, 1.8, col);

  FSI.add('dishes_5', {
    wiener_schnitzel: () =>
      K.plate(
        P('M8 38 C7 31 14 26 22 27 C29 23 40 23 46 27 C52 30 53 38 48 43 C43 49 32 50 23 48 C14 48 9 44 8 38 Z', C.wheat) +
        K.dots([[16, 34], [24, 31], [33, 29], [41, 31], [20, 41], [29, 37], [38, 36], [45, 39], [27, 45], [36, 44], [14, 40]], 1.1, C.wheatD) +
        K.hiE(19, 32, 6, 2.2, -12) +
        P('M40 47 L55 37 C59 41 58 48 51 50 C47 51 43 50 40 47 Z', C.yellow) +
        F('M43.5 47.5 L54 40 C55.5 43 54.5 47 50 48 C47.5 48.6 45.5 48.4 43.5 47.5 Z', C.yellowL) +
        K.line('M47 47.5 L54 41', 1.2, C.yellowD) +
        sprig(13, 46, C.leafD)),

    bratwurst_with_sauerkraut: () =>
      K.plate(
        P('M10 36 C9 29 18 25 26 27 C32 23 42 24 46 29 C50 34 45 38 36 38 C26 39 11 40 10 36 Z', C.wheatL) +
        K.line('M15 33 c2 -2 4 1 6 -1 M24 29 c2 -2 4 1 6 -1 M33 30 c2 -2 4 1 6 -1 M20 36 c2 -2 4 1 6 -1 M36 34 c2 -2 4 1 6 -1', 1.3, C.wheatD) +
        strand('M14 42 C24 38 36 37 48 33', 7, C.brown) + K.line('M15 40 C24 36.5 35 35.5 46 32', 1.6, C.brownL) +
        strand('M17 49 C28 46 40 45 51 40', 7, C.brownD) + K.line('M18 47 C28 44 39 43 49 38.5', 1.6, C.brown) +
        K.line('M24 41.5 L27 37 M33 40 L36 35.5 M42 37.5 L45 33 M27 49 L30 44.5 M36 47.5 L39 43 M45 45 L48 40.5', 1.5, C.choc) +
        P('M50 30 C48 27 51 24 54 25 C57 24 59 27 57 30 C56 32 51 32 50 30 Z', C.yellow, 1.8)),

    kasespatzle: () =>
      K.bowl(
        P('M10 30 C12 21 22 17 32 18 C42 17 52 21 54 30 C46 34 18 34 10 30 Z', C.yellowL) +
        K.line('M15 28 c1.5 -2.5 3 1 4.5 -1.5 s3 1 4.5 -1.5 M27 24 c1.5 -2.5 3 1 4.5 -1.5 s3 1 4.5 -1.5 M38 28 c1.5 -2.5 3 1 4.5 -1.5 s3 1 4.5 -1.5 M22 31 c1.5 -2.5 3 1 4.5 -1.5 M33 31 c1.5 -2.5 3 1 4.5 -1.5', 1.4, C.yellowD) +
        `<g fill="none" stroke="${C.brownD}" stroke-width="2.2">` +
        '<path d="M26 22 C24 19 28 17 30 20"/><path d="M33 20 C33 16 38 16 38 20"/><path d="M40 23 C40 20 44 19 45 22"/><path d="M19 25 C18 22 22 21 23 23"/></g>' +
        K.dots([[30, 27], [36, 25], [24, 28], [43, 27]], 1.2, C.leafD),
        C.white, C.yellowL),

    black_forest_cake: () => {
      // slice: top face, left frosted face, right cut face with layers
      const band = (a, b, fill) => F(`M20 ${31 + a} L58 ${23 + a * 0.92} L58 ${23 + b * 0.92} L20 ${31 + b} Z`, fill);
      return K.shadow(24) +
        P('M20 31 L58 23 V45 L20 55 Z', C.choc) +
        band(6, 9.5, C.creamL) + band(9.5, 11, C.red) + band(15, 18.5, C.creamL) +
        P('M20 31 L58 23 V45 L20 55 Z', 'none') +
        P('M6 27 L20 31 V55 L6 49 Z', C.creamL) +
        K.dots([[10, 34], [14, 39], [9, 43], [16, 47], [12, 49]], 1.3, C.choc) +
        P('M6 27 L42 13 L58 23 L20 31 Z', C.creamL) +
        K.dots([[16, 25], [28, 22], [44, 20], [34, 26], [22, 28]], 1.1, C.choc) +
        P('M27 22 C24 18 28 15 31 17 C34 15 37 18 35 21 C34 24 28 24 27 22 Z', C.white, 1.8) +
        P('M41 17 C38 13 42 10 45 12 C48 10 51 13 49 16 C48 19 42 19 41 17 Z', C.white, 1.8) +
        K.line('M31 13 C32 9 34 6 37 5 M45 8 C45 5 43 3 41 2.5', 1.6, C.leafD) +
        E(31, 15.5, 3.6, 3.6, C.redD) + E(45, 10, 3.6, 3.6, C.redD) +
        K.dots([[30, 14.3], [44, 8.8]], 1, '#fff') +
        K.sh('M48 25 L58 23 V45 L48 47.5 Z');
    },

    apple_strudel: () =>
      K.plate(
        P('M10 40 C10 33 14 30 20 29 L45 24 C52 23 57 27 57 32 C57 37 54 40 47 42 L21 47 C15 48 10 46 10 40 Z', C.wheat) +
        K.line('M24 30 C26 35 26 41 25 46 M33 28 C35 33 35 39 34 44 M42 26 C44 31 44 37 43 42', 1.5, C.wheatD) +
        K.dots([[28, 32], [37, 30], [46, 28], [30, 38], [39, 36], [50, 31], [21, 34]], 1.2, C.white) +
        E(15.5, 38, 6, 8.8, C.wheatL, 2.2) +
        F('M15.5 31.5 C19.5 32 20 37 18.5 40 C17 43 13 43.5 12 40 C11 37 13 35 15.5 35.5 C17.5 36 17.5 39 15.5 39.5', C.yellowL) +
        K.line('M15.5 31.5 C19.5 32 20 37 18.5 40 C17 43 13 43.5 12 40 C11 37 13 35 15.5 35.5 C17.5 36 17.5 39 15.5 39.5', 1.4, C.brown) +
        K.dots([[13, 34], [18, 43]], 1, C.brownD) +
        K.hi('M22 30.5 L44 26 C42 27.5 30 30 22 32.5 Z')),

    sachertorte: () =>
      K.plate(
        P('M9 33 L22 39 V51 L9 45 Z', C.choc) +
        P('M22 39 L47 30 V42 L22 51 Z', C.brownD) +
        K.line('M22 45 L47 36', 2.2, C.orange) +
        P('M22 39 L47 30 V42 L22 51 Z', 'none') +
        P('M9 33 L35 23 L47 30 L22 39 Z', C.choc) +
        K.hiE(24, 30, 7, 1.8, -20) +
        dollop(48, 45, 1.1)),

    soft_pretzels: () => {
      const d = 'M20 51 C29 42 37 32 39 24 C41 15 33 11 27 14 C18 18 7 24 9 37 C11 49 24 55 32 55 C40 55 53 49 55 37 C57 24 46 18 37 14 C31 11 23 15 25 24 C27 32 35 42 44 51';
      return K.shadow(24) + strand(d, 7, C.brown) +
        K.line('M14 26 C17 21 22 18 26 16.5 M41 16 C45 17.5 49 20 51 24', 1.6, C.brownL) +
        `<g fill="${C.white}" stroke="none">` +
        [[13, 34], [20, 51], [31, 52.5], [44, 52], [52, 40], [33, 19], [29, 33], [36, 37], [24, 16], [46, 18]].map(([x, y]) => `<rect x="${x - 1}" y="${y - 1}" width="2.2" height="2" rx=".4"/>`).join('') + '</g>';
    },

    hungarian_goulash: () =>
      K.steam(32, 11) +
      K.pot(
        E(32, 26.5, 21, 4, C.redD, 0) +
        P('M14 27 C13 21 18 19 22 20.5 C25 19 29 21 28 25 C27 29 15 30 14 27 Z', C.brown, 1.8) +
        P('M34 27.5 C33 22 38 20 42 21.5 C45 20.5 49 23 47.5 27 C46 30 35 30.5 34 27.5 Z', C.brown, 1.8) +
        P('M26 26 C26 21 33 20 33.5 25 Z', C.red, 1.6) + P('M46 25 C47 21 53 21 52.5 26 Z', C.leaf, 1.6) +
        K.dots([[18, 23], [39, 24], [44, 24.5]], 1.1, C.brownL),
        C.greyD),

    pierogi: () => {
      const dump = (x, y) =>
        P(`M${x - 11} ${y + 3} C${x - 10} ${y - 10} ${x + 10} ${y - 10} ${x + 11} ${y + 3} C${x + 5} ${y + 6} ${x - 5} ${y + 6} ${x - 11} ${y + 3} Z`, C.wheatL) +
        `<path d="M${x - 8.5} ${y + 1} C${x - 7.5} ${y - 6.5} ${x + 7.5} ${y - 6.5} ${x + 8.5} ${y + 1}" fill="none" stroke="${C.wheatD}" stroke-width="1.5" stroke-dasharray="1.2 2.4"/>` +
        E(x + 3, y + 1, 3, 1.5, C.wheat, 0, -10).replace('/>', ' stroke="none"/>');
      return K.plate(
        dump(19, 36) + dump(41, 34) + dump(29, 45) +
        dollop(47, 45, 0.9) +
        K.dots([[14, 44], [17, 47], [52, 37], [37, 27], [24, 28]], 1.4, C.brownD));
    },

    borscht: () =>
      K.steam(32, 11) +
      K.bowl(
        dollop(30, 29, 1.15) +
        sprig(42, 27, C.leafD) + sprig(19, 30, C.leafD) +
        K.dots([[24, 33], [44, 32], [36, 34]], 1.4, C.redD),
        C.white, C.meatD),

    beef_stroganoff: () =>
      K.plate(
        P('M8 38 C7 30 17 26 26 28 C31 33 30 43 24 47 C15 48 9 45 8 38 Z', C.yellowL) +
        K.line('M11 34 c2 -2 4 2 6 0 s4 2 6 0 M10 39 c2 -2 4 2 6 0 s4 2 6 0 M13 44 c2 -2 4 2 6 0', 1.4, C.yellowD) +
        P('M27 33 C28 26 42 24 50 28 C57 32 56 42 48 45 C40 49 29 45 27 33 Z', C.woodL) +
        K.line('M33 31 L39 29.5 M42 34 L49 32 M32 39 L38 37.5 M40 42 L46 40.5', 3.4, C.brownD) +
        P('M44 28 C44 25 50 25 50 28 Z M46.5 28 V30.5', C.cream, 1.6) +
        P('M35 44 C35 41 41 41 41 44 Z M37.5 44 V46', C.cream, 1.6) +
        K.dots([[37, 34], [45, 37], [31, 36]], 1.2, C.leafD)),

    chicken_kiev: () =>
      K.plate(
        P('M38 42 C44 45 50 41 56 44 C56 49 46 50 39 48 Z', C.yellowL, 1.8) +
        K.dots([[44, 46], [49, 45], [53, 46.5], [41, 46]], 1.1, C.leafD) +
        E(25, 37, 17, 10, C.wheat, 0, -8) +
        K.dots([[14, 36], [20, 32], [27, 30], [17, 41], [24, 41], [31, 36], [27, 45]], 1.1, C.wheatD) +
        K.hiE(18, 33, 6, 2, -20) +
        E(40, 35, 5, 8.5, C.creamL, 2.2, -8) +
        E(40.3, 35, 2.3, 4, C.leaf, 1.4, -8)),

    blini_with_salmon_roe: () => {
      const blin = (x, y) => E(x, y + 2, 11, 5.5, C.wheatD) + E(x, y, 11, 5.5, C.wheat) +
        K.dots([[x - 6, y + 1], [x + 6, y - 1], [x + 3, y + 3]], 1.1, C.wheatD) +
        dollop(x, y - 1, 0.7) +
        [[x - 2, y - 3], [x + 1.5, y - 3.5], [x, y - 0.5], [x + 3.5, y - 1], [x - 3, y]].map(([a, b]) => E(a, b, 1.7, 1.7, C.orange, 1)).join('');
      return K.plate(blin(20, 33) + blin(44, 33) + blin(32, 43));
    },

    swedish_meatballs: () =>
      K.plate(
        P('M9 39 C8 31 20 27 32 28 C44 27 55 31 54 39 C53 46 42 48 32 48 C20 48 10 46 9 39 Z', C.woodL, 1.8) +
        [[19, 35], [31, 32], [43, 35], [25, 42], [37, 43]].map(([x, y]) => E(x, y, 6, 5.5, C.brown) + K.hiE(x - 2.5, y - 2, 2, 1.1)).join('') +
        P('M45 46 C43 42 47 39 51 41 C55 39 58 43 56 46 C55 49 47 49 45 46 Z', C.redD, 1.8) +
        K.dots([[49, 43], [52, 44.5], [48, 46]], 1.2, C.red) +
        sprig(13, 43, C.leafD)),

    gravlax: () => {
      const slice = (x, y) =>
        P(`M${x - 13} ${y + 4} C${x - 10} ${y - 3} ${x + 6} ${y - 7} ${x + 13} ${y - 5} C${x + 11} ${y + 1} ${x - 4} ${y + 6} ${x - 13} ${y + 4} Z`, C.orangeL) +
        K.line(`M${x - 6} ${y + 3} C${x - 4} ${y} ${x - 4} ${y - 2} ${x - 5} ${y - 3} M${x + 1} ${y + 2} C${x + 3} ${y - 1} ${x + 3} ${y - 3} ${x + 2} ${y - 5} M${x + 7} ${y} C${x + 9} ${y - 2} ${x + 9} ${y - 3} ${x + 8} ${y - 5}`, 1.3, C.fat) +
        K.line(`M${x - 11} ${y + 1.5} C${x - 8} ${y - 3} ${x + 5} ${y - 7} ${x + 12} ${y - 6}`, 2.2, C.leafD);
      return K.board(slice(24, 40) + slice(32, 44) + slice(40, 36) + sprig(50, 42, C.leafD) + sprig(14, 47, C.leafD));
    },

    kanelbullar: () =>
      K.shadow(24) +
      P('M8 36 C8 47 19 55 32 55 C45 55 56 47 56 36 Z', C.wheatD) +
      E(32, 35, 24, 14, C.wheat) +
      K.line('M32 35 C36 35 36 30 32 30 C26 30 25 37 30 39.5 C37 42 44 37 42 30.5 C40 24.5 30 23 23 26.5 C15 30.5 15 40 23 44 C32 48 46 46 52 38', 3.2, C.brownD) +
      K.hiE(19, 28, 5, 2) +
      `<g fill="${C.white}" stroke="none">` +
      [[26, 33], [38, 33], [34, 26], [20, 37], [44, 41], [28, 44], [47, 31], [36, 39]].map(([x, y]) => `<rect x="${x - 1.1}" y="${y - 1}" width="2.2" height="2" rx=".4"/>`).join('') + '</g>',

    cheese_fondue: () =>
      K.pot(
        E(32, 26.5, 21, 4, C.yellow, 0) +
        K.line('M18 26 C22 24 26 28 30 26 M36 27 C40 25 44 28 48 26', 1.3, C.yellowD) +
        K.line('M48 4 L35 22', 2, C.ink) + K.line('M48 4 L35 22', 0.8, C.steel) +
        P('M30 18 L37 16 L39 23 L32 25 Z', C.wheatL, 2) +
        K.line('M14 4 L24 20', 2, C.ink) + K.line('M14 4 L24 20', 0.8, C.steel) +
        P('M20 16 L27 15 L28 22 L21 23 Z', C.wheatL, 2) +
        P('M33 23.5 C33 27 35 28 36 26 L36 23 Z', C.yellow, 1.3),
        C.red),

    rosti: () =>
      K.plate(
        E(31, 39, 21, 10.5, C.orangeD) + E(31, 36, 21, 10.5, C.orangeL) +
        K.line('M16 33 L20 32 M24 30 L28 31 M33 29 L37 28 M41 31 L45 30 M15 38 L19 39 M22 36 L26 35 M30 34 L34 35 M38 36 L42 35 M46 37 L49 38 M20 42 L24 41 M28 40 L32 41 M36 42 L40 41', 1.5, C.orange) +
        K.hiE(22, 31, 5, 1.8, -10) +
        sprig(43, 33, C.leafD)),

    raclette: () =>
      K.plate(
        E(18, 33, 7.5, 5.8, C.wheat) + E(31, 30, 7.5, 5.8, C.wheat) +
        K.dots([[15, 32], [21, 31], [29, 28.5], [34, 31]], 1.1, C.brownD) +
        P('M9 40 C11 32 27 31 41 34 C45 35 45 39 42 41 C42 46 38 47 37 42.5 C35 46 31 47 30 43.5 C27 47 23 47 22 43.5 C19 46 14 46 14.5 42.5 C10 43 8.5 42 9 40 Z', C.yellow) +
        K.hi('M13 37 C17 34 26 33.5 34 35 C26 35.5 19 36.5 14 39 Z') +
        E(48, 36, 8, 3.6, C.leaf, 0, -25) + K.dots([[45, 37], [48.5, 35], [51, 33.5]], 1, C.leafD) +
        E(46, 45, 8, 3.6, C.leafD, 0, -8) + K.dots([[43, 45.5], [47, 44.8], [50, 44.5]], 1, C.pine) +
        `<ellipse cx="44" cy="27" rx="5.5" ry="3" fill="none" stroke="${C.ink}" stroke-width="4.4"/><ellipse cx="44" cy="27" rx="5.5" ry="3" fill="none" stroke="${C.pink}" stroke-width="1.8"/>`),

    zurcher_geschnetzeltes: () =>
      K.plate(
        E(19, 38.5, 11, 7, C.orangeD) + E(19, 36.5, 11, 7, C.orangeL) +
        K.line('M13 35 L16 34 M19 33 L22 34 M14 39 L17 38 M21 37 L24 38 M18 41 L21 40', 1.4, C.orange) +
        P('M30 36 C30 28 42 26 50 29 C57 32 57 42 49 45 C41 48 30 45 30 36 Z', C.cream) +
        K.line('M35 33 L40 32 M43 36 L49 35 M35 40 L40 39.5 M44 42 L49 40', 3.2, C.brownL) +
        P('M41 30 C41 27 47 27 47 30 Z M44 30 V32', C.creamD, 1.6) +
        P('M37 44.5 C37 41.5 43 41.5 43 44.5 Z', C.creamD, 1.6) +
        K.dots([[39, 36], [47, 38], [34, 37]], 1.2, C.leafD)),
  
    alplermagronen: () => {
      const mac = (x, y, r = -15) => `<g transform="rotate(${r} ${x} ${y})">` + strand(`M${x - 3} ${y} H${x + 3}`, 3.6, C.yellowL) + E(x + 3, y, 1.2, 1.9, C.yellowD, 0).replace('/>', ' stroke="none"/>') + '</g>';
      return K.plate(
        P('M8 38 C8 30 18 26 28 27 C38 26 44 31 43 38 C42 45 32 48 24 48 C15 48 8 45 8 38 Z', C.cream) +
        mac(16, 34, -20) + mac(26, 31, 10) + mac(35, 34, -30) + mac(18, 42, 15) + mac(30, 43, -10) + mac(37, 40, 25) +
        `<rect x="22" y="35" width="5" height="4.5" rx="1" fill="${C.wheat}" stroke-width="1.5"/><rect x="11" y="38" width="5" height="4.5" rx="1" fill="${C.wheat}" stroke-width="1.5"/>` +
        `<g fill="none" stroke="${C.brownD}" stroke-width="2.2"><path d="M20 30 C19 27 23 26 24 28.5"/><path d="M30 37 C30 34 34 34 34.5 37"/><path d="M38 30 C38 27 42 27 42 30"/></g>` +
        P('M43 42 C42 37 47 34 51 36 C55 35 58 39 56 43 C55 47 45 47 43 42 Z', C.wheatL, 2) +
        K.dots([[47, 39], [51, 40.5], [49, 43]], 1, C.wheatD));
    },

    bundner_gerstensuppe: () =>
      K.steam(32, 11) +
      K.bowl(
        K.dots([[14, 30], [19, 27], [25, 25.5], [33, 25], [41, 26], [47, 28], [50, 31], [17, 33], [28, 34], [38, 33.5], [45, 33]], 1.6, C.creamL) +
        `<rect x="20" y="28" width="4.5" height="4" rx="1" fill="${C.orange}" stroke-width="1.4"/><rect x="40" y="29" width="4.5" height="4" rx="1" fill="${C.orange}" stroke-width="1.4"/>` +
        `<rect x="30" y="29.5" width="5" height="4" rx="1" fill="${C.meatL}" stroke-width="1.4"/><rect x="12" y="29" width="4.5" height="3.5" rx="1" fill="${C.meatL}" stroke-width="1.4"/>` +
        E(29, 26.5, 3, 1.8, C.leafL, 1.4) + E(46, 31.5, 2.8, 1.6, C.leafL, 1.4) + E(36, 25.5, 2.5, 1.5, C.leaf, 1.3) +
        K.dots([[24, 31.5], [43, 26.5]], 1.2, C.leafD),
        C.white, C.wheatL),

    engadiner_nusstorte: () =>
      K.shadow(28) +
      P('M5 28 V37 C5 44 15 48 26 48 C37 48 47 44 47 37 V28 Z', C.wheatD) +
      E(26, 28, 21, 10, C.wheat) +
      E(26, 28, 16.5, 7.2, C.wheatL, 1.4) +
      K.dots([[18, 26], [22, 24], [27, 23.5], [32, 24.5], [35, 27.5], [30, 30.5], [24, 31.5], [18, 30], [26, 27.5]], 1, C.wheatD) +
      K.hiE(15, 25, 5, 2) +
      P('M30 50 L47 33 L59 42 Z', C.wheat) +
      P('M30 50 L59 42 V50 L30 58 Z', C.wheatD) +
      F('M30 52.2 L59 44.2 V48 L30 56 Z', C.brownD) +
      K.line('M30 52.2 L59 44.2 M30 56 L59 48', 1.2) +
      K.dots([[35, 53.3], [40, 52.2], [45, 50.6], [50, 49.2], [55, 47.8], [37.5, 54], [47.5, 51.2]], 1.1, C.brownL) +
      K.dots([[44, 39], [49, 42], [41, 44], [52, 39.5]], 1, C.wheatD),

    chicken_paprikash: () =>
      K.plate(
        P('M8 38 C7 30 20 26 32 27 C45 26 57 31 56 39 C55 46 43 49 32 49 C19 49 9 46 8 38 Z', C.orange, 1.8) +
        P('M13 37 C12 31 19 28 25 30 C30 31 32 36 30 40 C27 44 15 43 13 37 Z', C.orangeL, 2) +
        P('M33 35 C32 29 40 26 46 29 C51 32 52 38 47 41 C42 44 34 41 33 35 Z', C.orangeL, 2) +
        K.line('M17 33 C20 31 24 32 26 34 M37 32 C40 30 44 30 47 32', 1.4, C.orangeD) +
        dollop(30, 44, 0.85) +
        K.dots([[20, 44], [41, 45], [50, 38], [11, 41]], 1.2, C.redD) + sprig(44, 44, C.leafD)),

    smorrebrod: () =>
      K.shadow(26) +
      P('M5 36 L27 47 V54 L5 43 Z', C.choc) + P('M27 47 L59 32 V39 L27 54 Z', C.brownD) +
      P('M5 36 L37 21 L59 32 L27 47 Z', C.brownD) +
      K.dots([[10, 36.5], [52, 32.5], [27, 44]], 1, C.choc) +
      P('M10 37 C17 30 32 24 46 24 C52 24 55 27 52 31 C46 36 32 42 23 44 C16 45 9 42 10 37 Z', C.orange) +
      K.line('M16 35 L20 39 M22 32 L26 36.5 M28 29.5 L32 34 M34 27.5 L38 31.5 M40 26 L44 29.5 M46 25 L49 28', 1.4, C.orangeD) +
      K.hi('M15 34 C22 29 32 25.5 42 25 C34 27.5 25 31 17 36 Z') +
      `<ellipse cx="22" cy="36" rx="5.5" ry="2.8" fill="none" stroke="${C.ink}" stroke-width="4.2"/><ellipse cx="22" cy="36" rx="5.5" ry="2.8" fill="none" stroke="${C.purpleL}" stroke-width="1.7"/>` +
      `<ellipse cx="39" cy="29" rx="5.5" ry="2.8" fill="none" stroke="${C.ink}" stroke-width="4.2"/><ellipse cx="39" cy="29" rx="5.5" ry="2.8" fill="none" stroke="${C.purpleL}" stroke-width="1.7"/>` +
      sprig(30, 33, C.leafD) + sprig(48, 27, C.leafD),

    rabbit_stew: () =>
      K.steam(32, 11) +
      K.pot(
        E(32, 26.5, 21, 4, C.brown, 0) +
        P('M24 27 C22 22 28 18 34 20 C38 21 40 23 41 22 C42 20 45 20 45.5 22 C47 22 47.5 25 45 25.5 C43 26 42 26 40 27 C36 30 26 30 24 27 Z', C.brownL, 1.8) +
        E(15, 25, 3.6, 2.2, C.orange, 1.6) + E(48, 27.5, 3.4, 2, C.orange, 1.6) + E(19, 28.5, 3.2, 1.9, C.orange, 1.5) +
        K.line('M8 20 L20 16 M10 19.5 L10 17 M13 18.5 L13 16 M16 17.5 L15.5 15', 1.6, C.leafD),
        C.terracotta),

    roast_goose_with_red_cabbage: () =>
      K.plate(
        P('M28 33 C28 26 40 23 49 26 C56 29 57 37 51 41 C45 45 30 42 28 33 Z', C.purple) +
        K.line('M33 31 c2 -2 4 1 6 -1 M42 28 c2 -2 4 1 6 -1 M37 37 c2 -2 4 1 6 -1 M47 34 c2 -2 4 1 6 -1', 1.5, C.purpleL) +
        strand('M30 44 L40 48', 3, C.white) + E(42, 48, 2.8, 2.4, C.white, 1.6) + E(41.5, 50.5, 2.6, 2.2, C.white, 1.6) +
        P('M8 38 C7 31 15 27 22 29 C29 30 33 36 33 41 C33 46 26 48 19 47 C12 46 8 43 8 38 Z', C.orangeD) +
        K.hiE(15, 33, 5, 2.2, -25) +
        K.line('M14 42 C19 44 25 44 29 42', 1.4, C.brownD) +
        P('M44 50 C44 46 50 44 54 46 C56 48 54 51 50 51 C47 51.5 45 51.5 44 50 Z', C.yellowL, 1.8)),

    linzer_torte: () =>
      K.shadow(26) +
      P('M6 34 V42 C6 50 18 55 32 55 C46 55 58 50 58 42 V34 Z', C.brown) +
      E(32, 34, 26, 13, C.brownL) +
      E(32, 34, 21, 10, C.redD, 2) +
      K.line('M20 26 L44 42 M18 32 L36 44 M26 24 L46 37', 6.5, C.ink) +
      K.line('M44 26 L20 42 M46 32 L28 44 M38 24 L18 37', 6.5, C.ink) +
      K.line('M20 26 L44 42 M18 32 L36 44 M26 24 L46 37', 3, C.brownL) +
      K.line('M44 26 L20 42 M46 32 L28 44 M38 24 L18 37', 3, C.brownL) +
      K.dots([[10, 34], [15, 27], [24, 22.5], [40, 22.5], [50, 26.5], [55, 33], [50, 42], [14, 42]], 1, C.white) +
      K.sh('M50 44 C56 42 58 40 58 38 V42 C58 48 50 53 40 54.5 C46 52 50 48 50 44 Z'),

    jollof_rice: () =>
      K.plate(
        P('M8 40 C8 30 18 23 30 23 C42 23 47 31 46 40 C45 46 36 48 27 48 C16 48 8 46 8 40 Z', C.orange) +
        K.line('M14 37 l2 -1 M20 32 l2 -1 M27 29 l2 -1 M34 30 l2 -1 M40 34 l2 -1 M18 41 l2 -1 M25 37 l2 -1 M32 37 l2 -1 M38 41 l2 -1 M28 44 l2 -1 M13 43 l2 -1 M22 27 l2 -1', 1.6, C.orangeL) +
        K.line('M17 35 l2 -1 M30 33 l2 -1 M24 43 l2 -1 M36 45 l2 -1 M38 28 l1.5 -1', 1.6, C.redD) +
        K.hiE(18, 30, 5, 2, -30) +
        `<rect x="22" y="32" width="4" height="3" rx="1" fill="${C.leaf}" stroke-width="1.4"/><rect x="34" y="38" width="4" height="3" rx="1" fill="${C.leaf}" stroke-width="1.4"/>` +
        E(51, 40, 7, 4.5, C.red, 2.2) + E(51, 39.6, 4.4, 2.6, C.redL, 1.2) + K.dots([[49, 39.5], [53, 39.5]], 0.9, C.yellowL) +
        E(49, 30, 6, 4, C.red, 2.2) + E(49, 29.6, 3.6, 2.3, C.redL, 1.2)),

    doro_wat: () =>
      K.plate(
        E(32, 37, 26, 12.5, C.creamD) +
        K.dots([[12, 37], [16, 31], [24, 28], [44, 27], [52, 32], [53, 41], [46, 46], [14, 43], [22, 47], [36, 48]], 1, C.wheatD) +
        P('M14 37 C14 30 24 27 32 28 C42 27 50 31 50 37 C50 43 40 45 32 45 C22 45 14 43 14 37 Z', C.redD) +
        strand('M24 31 L16 24', 3, C.white) + E(15, 23, 2.5, 2.2, C.white, 1.5) +
        P('M19 36 C17 30 24 27 29 30 C33 32 32 38 28 39 C24 40 20 39 19 36 Z', C.meatD, 1.8) +
        E(38, 34, 7, 5.5, C.white) + E(38.5, 34.5, 3.2, 2.6, C.yellow, 1.5) +
        K.dots([[26, 42], [45, 40], [33, 41]], 1.1, C.orangeD)),

    misir_wot: () =>
      K.plate(
        E(32, 37, 26, 12.5, C.creamD) +
        K.dots([[12, 37], [16, 31], [24, 28], [52, 32], [53, 41], [14, 43], [22, 47]], 1, C.wheatD) +
        P('M14 38 C13 30 22 26 30 27 C39 27 43 33 41 39 C39 44 32 46 26 46 C19 46 14 43 14 38 Z', C.orangeD) +
        K.dots([[19, 33], [24, 31], [30, 30], [35, 33], [21, 39], [27, 36], [33, 38], [26, 42], [36, 42], [17, 41]], 1.2, C.orange) +
        K.hiE(21, 31, 4, 1.6, -25) +
        `<g transform="rotate(-20 49 39)"><rect x="41" y="34" width="16" height="10" rx="5" fill="${C.creamD}"/><ellipse cx="42" cy="39" rx="2.2" ry="4.6" fill="${C.wheatL}" stroke-width="1.6"/></g>` +
        K.dots([[47, 39], [52, 36]], 1, C.wheatD)),

    bobotie: () =>
      K.shadow(27) +
      P('M5 34 V41 C5 49 17 54 32 54 C47 54 59 49 59 41 V34 Z', C.terracotta) +
      E(32, 34, 27, 13, C.terracotta) +
      E(32, 33.5, 22.5, 10, C.brown, 2) +
      E(32, 33, 20, 8.5, C.yellowL, 0).replace('/>', ' stroke="none"/>') +
      K.dots([[22, 32], [30, 29], [40, 31], [27, 36], [37, 37], [46, 34], [18, 35]], 1.4, C.wheatD) +
      P('M24 30 C28 24 36 24 38 26 C35 31 28 32 24 30 Z', C.leafD, 1.8) + K.line('M25 29.5 C29 27 33 26 37 26', 1.2, C.leafL) +
      P('M36 34 C40 30 47 30 49 32 C46 36 40 37 36 34 Z', C.leafD, 1.8) + K.line('M37 34 C40 32.5 44 32 48 32', 1.2, C.leafL) +
      K.hi('M9 39 C11 45 16 49 22 51 L21 48 C16 46 12 43 11 39 Z'),

    maafe: () =>
      K.steam(32, 11) +
      K.bowl(
        P('M17 30 C16 25 22 23 26 25 C29 26 29 30 26 32 C22 33 18 33 17 30 Z', C.wheat, 1.6) +
        `<rect x="34" y="25" width="6" height="5" rx="1" fill="${C.orange}" stroke-width="1.5"/><rect x="43" y="28" width="6" height="5" rx="1" fill="${C.orange}" stroke-width="1.5"/>` +
        P('M29 23 C27 21 29 18 32 19.5 C34 18 37 20 36 22.5 C35 25 31 25 29 23 Z', C.wheatL, 1.4) + K.line('M32.5 19.6 V24.6', 1, C.wheatD) +
        K.dots([[31, 30], [38, 33], [22, 28]], 1.1, C.redD),
        C.white, C.brownL),

    kelewele: () => {
      const cube = (x, y) => P(`M${x - 4} ${y - 2} L${x} ${y - 4} L${x + 4} ${y - 2} V${y + 2} L${x} ${y + 4} L${x - 4} ${y + 2} Z`, C.orange, 1.6) +
        F(`M${x - 4} ${y - 2} L${x} ${y - 4} L${x + 4} ${y - 2} L${x} ${y} Z`, C.orangeL) + F(`M${x} ${y} L${x + 4} ${y - 2} V${y + 2} L${x} ${y + 4} Z`, C.orangeD);
      return K.plate(
        [[18, 34], [27, 31], [36, 30], [45, 33], [14, 41], [23, 39], [32, 37], [41, 39], [50, 40], [20, 46], [29, 45], [38, 45]].map(([x, y]) => cube(x, y)).join('') +
        K.dots([[18, 33.5], [36, 29.5], [23, 38.5], [41, 38.5], [29, 44.5], [50, 39.5]], 1, C.redD) +
        P('M47 27 C50 24 56 23 58 26 C55 27 51 29 49 31 Z', C.red, 1.8) + K.line('M58 26 L60 24', 1.8, C.leafD));
    },

    fufu_with_light_soup: () =>
      K.steam(18, 11) +
      K.bowl(
        P('M20 30 C19 21 26 15 32 15 C38 15 45 21 44 30 C40 33 24 33 20 30 Z', C.creamL) +
        K.hiE(27, 21, 4, 2.2, -35) +
        P('M10 30 C10 27 14 26 16 27.5 C18 26.5 21 28 20 31 C19 33 12 33 10 30 Z', C.brown, 1.6) +
        P('M45 30 C45 27 49 26 51 27.5 C53 26.5 55 28 54.5 30.5 C53.5 33 46 33 45 30 Z', C.brown, 1.6) +
        P('M36 33 C38 31 42 31 43 33 C41 34.5 37 34.5 36 33 Z', C.red, 1.4) +
        K.dots([[25, 34], [17, 34], [48, 34]], 1.1, C.orangeL),
        C.white, C.orange),

    shakshouka_tunisienne: () => {
      const egg = (x, y) => P(`M${x - 7} ${y} C${x - 8} ${y - 4} ${x - 3} ${y - 6} ${x} ${y - 5} C${x + 4} ${y - 6} ${x + 8} ${y - 3} ${x + 7} ${y + 1} C${x + 6} ${y + 4} ${x - 5} ${y + 4} ${x - 7} ${y} Z`, C.white, 1.8) +
        E(x, y - 1, 3, 2.5, C.yellow, 1.5) + K.hiE(x - 1, y - 2, 1.2, 0.7);
      return K.shadow(26) +
        K.line('M48 36 L60 28', 7, C.ink) + K.line('M48 36 L60 28', 2.5, C.black) +
        P('M4 36 V40 C4 48 16 54 30 54 C44 54 56 48 56 40 V36 Z', C.black) +
        E(30, 36, 26, 13, C.black) + E(30, 36, 22, 10, C.red, 1.8) +
        egg(20, 34) + egg(36, 31) + egg(31, 42) +
        K.dots([[44, 38], [13, 38], [24, 28], [42, 43]], 1.3, C.leafD) + K.dots([[46, 34], [20, 43]], 1.2, C.redD);
    },

    chakalaka: () =>
      K.bowl(
        [[16, 28], [24, 31], [34, 27], [42, 31], [48, 27], [29, 25]].map(([x, y]) => E(x, y, 3, 2, C.cream, 1.4)).join('') +
        `<rect x="19" y="24" width="4" height="3" rx="1" fill="${C.leaf}" stroke-width="1.4"/><rect x="37" y="23" width="4" height="3" rx="1" fill="${C.leaf}" stroke-width="1.4"/>` +
        K.line('M28 31 L33 32.5 M44 25 L48 23 M12 31 L15 32', 2.2, C.orangeL) +
        K.dots([[21, 33], [36, 33], [46, 34]], 1.1, C.redD),
        C.white, C.red),

    // ---- drinks: kit glasses and mugs, told apart by liquid, garnish and glass ----
    espresso: () =>
      K.steam(32, 11) +
      E(32, 52, 26, 6, C.white) + E(32, 51, 15, 3, C.greyL, 1.3) +
      K.place(K.glass(C.brownL, 'mug', E(30, 18, 9, 1.8, C.brown, 0).replace('/>', ' stroke="none"/>')).replace(K.shadow(19), ''), 31, 34, 0.7),

    cappuccino: () =>
      K.glass(C.creamL, 'mug',
        P('M15.5 18 C15 10 23 8 30 8.5 C38 8 46 10 44.5 18 C38 21 22 21 15.5 18 Z', C.creamL) +
        P('M26 13 C24 11 27 9.5 30 11.5 C33 9.5 36 11 34 13 L30 16 Z', C.brownL, 1.4) +
        K.dots([[20, 14], [40, 14], [37, 17], [22, 17.5]], 1, C.brown) +
        `<rect x="14" y="40" width="32" height="5" fill="${C.brownL}" stroke-width="1.6"/>`),

    hot_chocolate: () =>
      K.steam(48, 11) +
      K.glass(C.choc, 'mug',
        `<rect x="18" y="11" width="8" height="7" rx="1.5" fill="${C.pinkL}" stroke-width="1.8" transform="rotate(-12 22 14.5)"/>` +
        `<rect x="27" y="12" width="8" height="7" rx="1.5" fill="${C.white}" stroke-width="1.8" transform="rotate(10 31 15.5)"/>` +
        `<rect x="34" y="14" width="7" height="6" rx="1.5" fill="${C.pinkL}" stroke-width="1.8" transform="rotate(-6 37.5 17)"/>` +
        `<rect x="14" y="34" width="32" height="8" fill="${C.red}" stroke-width="1.6"/>` +
        K.line('M14 46 H46', 1.6, C.red)),

    cup_of_tea: () =>
      K.steam(26, 11) +
      K.glass(C.brownL, 'mug',
        K.line('M38 18 C40 22 40 26 39 31', 1.3) +
        `<rect x="35" y="30" width="8" height="8" rx="1" fill="${C.yellow}" stroke-width="1.6"/>` +
        `<rect x="14" y="44" width="32" height="5" fill="${C.blue}" stroke-width="1.6"/>`),

    pot_of_green_tea: () =>
      K.shadow(22) +
      P('M15 38 C9 37 7 31 3 26 L7 23.5 C10 27 12 30 17 31 Z', C.teal, 2) +
      `<path d="M48 28 C59 26 60 44 48 46" fill="none" stroke-width="6"/><path d="M48 28 C59 26 60 44 48 46" fill="none" stroke="${C.tealD}" stroke-width="2"/>` +
      P('M13 38 C13 26 21 21 32 21 C43 21 51 26 51 38 C51 51 43 57 32 57 C21 57 13 51 13 38 Z', C.teal) +
      P('M20 23 C22 17 42 17 44 23 C40 26 24 26 20 23 Z', C.tealL) +
      E(32, 15.5, 3.5, 2.5, C.tealD, 2) +
      P('M24 44 C23 37 30 32 38 32 C39 39 33 45 24 44 Z', C.leafL, 1.8) + K.line('M25 43 C29 39 33 36 37 33', 1.3, C.leafD) +
      K.hiE(19, 32, 2.5, 5, 20) + K.sh('M44 30 C50 36 50 48 40 55 C48 52 51 45 51 38 C51 34 48 31 44 30 Z') +
      K.line('M6 20 C4 16 8 14 6 10 M11 18 C9 14 13 12 11 8', 2, C.greyD),

    lemonade: () =>
      K.glass(C.yellow, 'tumbler',
        `<rect x="23" y="26" width="9" height="8" rx="2" fill="${C.glass}" stroke-width="1.4"/><rect x="31" y="35" width="9" height="8" rx="2" fill="${C.glass}" stroke-width="1.4"/>` +
        K.line('M34 50 L40 3', 5, C.ink) + K.line('M34 50 L40 3', 2.4, C.white) + K.line('M39.5 7 L39 11 M38.6 15 L38.1 19', 2.4, C.red) +
        E(48, 12, 9, 9, C.yellow, 2.2) + E(48, 12, 6.5, 6.5, C.yellowL, 1.2) + K.line('M48 6 V18 M42 12 H54 M43.5 7.5 L52.5 16.5 M52.5 7.5 L43.5 16.5', 1.1, C.yellowD)),

    sangria: () =>
      K.glass(C.redD, 'tumbler',
        `<rect x="23" y="30" width="7" height="6" rx="1" fill="${C.creamL}" stroke-width="1.4"/><rect x="33" y="40" width="7" height="6" rx="1" fill="${C.leafL}" stroke-width="1.4"/><rect x="25" y="44" width="6" height="5" rx="1" fill="${C.creamL}" stroke-width="1.4"/>` +
        P('M33 27 C33 32 41 34 43 29 Z', C.orange, 1.6) +
        E(47, 12, 9, 9, C.orange, 2.2) + E(47, 12, 6.5, 6.5, C.orangeL, 1.2) + K.line('M47 6 V18 M41 12 H53 M42.5 7.5 L51.5 16.5 M51.5 7.5 L42.5 16.5', 1.1, C.orangeD)),

    mulled_wine: () =>
      K.steam(24, 11) +
      K.glass(C.redD, 'mug',
        strand('M33 18 L41 7', 3.5, C.brown) + K.line('M34 16 L40.5 7.5', 1, C.brownD) +
        P('M38 18 C38 13 46 11 49 14 C50 16 48 18 45 18 Z', C.orange, 1.6) +
        `<g transform="translate(23 15) scale(.55) translate(-28 -34)">` + P('M26 32 L28 26 L30 32 L36 32 L31 35.5 L33 41 L28 37.5 L23 41 L25 35.5 L20 32 Z', C.brownD, 2.4) + '</g>' +
        `<rect x="14" y="36" width="32" height="6" fill="${C.leafD}" stroke-width="1.6"/>`),

    mojito: () =>
      K.glass(C.leafL, 'tumbler',
        `<rect x="22" y="23" width="9" height="8" rx="2" fill="${C.glass}" stroke-width="1.4"/><rect x="31" y="29" width="9" height="8" rx="2" fill="${C.glass}" stroke-width="1.4"/>` +
        [[26, 40, -30], [36, 44, 25], [30, 50, -10]].map(([x, y, r]) => E(x, y, 5, 2.6, C.leaf, 1.5, r)).join('') +
        P('M24 18 C20 12 24 7 28 6 C30 10 29 15 24 18 Z M27 18 C30 12 36 11 38 13 C36 17 31 19 27 18 Z', C.leafD, 1.8) +
        K.line('M30 50 L38 3', 5, C.ink) + K.line('M30 50 L38 3', 2.4, C.leafD) +
        P('M44 4 C52 3 58 9 57 17 L44 10 Z', C.leaf, 2) + F('M46 6.5 C51 6 55 10 54.5 14 L46 9.5 Z', C.leafL)),

    pina_colada: () =>
      K.glass(C.creamL, 'wine',
        P('M40 18 L44 6 L56 12 Z', C.yellow, 2) + K.line('M45 9 L48 12.5 M49 9 L50 13', 1.2, C.yellowD) +
        P('M44 7 C42 3 45 2.5 47 4.5 C48 2.5 51 2.5 50 5 C53 4.5 54 7 51 8.5 Z', C.leaf, 1.8) +
        E(25, 12, 3.6, 3.6, C.red, 2) + K.line('M26 9 C27 6 29 4 31 3', 1.5, C.leafD) +
        K.dots([[28, 22], [36, 23], [32, 27]], 1.2, C.yellowD)),

    elderflower_cordial: () =>
      K.glass(C.cream, 'tumbler',
        `<rect x="22" y="28" width="9" height="8" rx="2" fill="${C.glass}" stroke-width="1.4"/>` +
        K.line('M36 24 C38 18 40 12 43 8 M40 15 C44 13 48 12 52 12 M39 16 C36 12 32 9 28 8', 1.6, C.leafD) +
        P('M48 18 C46 15 50 13 52 14 C54 12 59 14 57 17 C55 19 50 20 48 18 Z', C.leaf, 1.6) +
        [[43, 8, 5], [52, 11, 4.5], [28, 8, 4.5]].map(([x, y, r]) => E(x, y, r, r * 0.75, C.creamL, 1.6) +
          K.dots([[x - r * 0.45, y - r * 0.15], [x + r * 0.4, y - r * 0.2], [x, y + r * 0.25]], 1, C.yellow)).join('')),

    iced_coffee: () =>
      K.glass(C.brownL, 'tumbler',
        F('M18.5 22 H45.5 L45 30 C38 27 26 32 19 29 Z', C.creamL) +
        F('M21 44 C28 46 36 42 43.6 45 L43.2 54.5 C43 56 41.5 56.5 40 56.5 H24 C22.5 56.5 21 56 20.8 54.5 Z', C.brown) +
        `<rect x="22" y="31" width="9" height="8" rx="2" fill="${C.glass}" stroke-width="1.4"/><rect x="31" y="36" width="9" height="8" rx="2" fill="${C.glass}" stroke-width="1.4"/>` +
        K.line('M36 50 L42 3', 5, C.ink) + K.line('M36 50 L42 3', 2.4, C.choc)),
  });
})(FSI);
