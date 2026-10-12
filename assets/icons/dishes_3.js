// Dishes 3a: Indian & South Asian, Chinese (served dishes, see assets/STYLE.md).
(function (FSI) {
  const { C, K } = FSI;
  // ---- local helpers ----
  const rot = (r, x, y) => (r ? ` transform="rotate(${r} ${x} ${y})"` : '');
  const E = (cx, cy, rx, ry, fill, r = 0, sw = 1.5) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${rot(r, cx, cy)} fill="${fill}" stroke-width="${sw}"/>`;
  // rounded chunk centred on x,y
  const R = (x, y, w, h, fill, r = 0, sw = 1.5, rr = 1.8) =>
    `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${rr}"${rot(r, x, y)} fill="${fill}" stroke-width="${sw}"/>`;
  const P = (d, fill, sw = 2.5) => `<path d="${d}" fill="${fill}"${sw !== 2.5 ? ` stroke-width="${sw}"` : ''}/>`;
  // small herb leaf (cilantro / mint / curry leaf), centred on x,y
  const leaf = (x, y, r = 0, fill = C.leaf, s = 1) =>
    `<path d="M${x - 4 * s} ${y} C${x - 2 * s} ${y - 3 * s} ${x + 2 * s} ${y - 3 * s} ${x + 4 * s} ${y} C${x + 2 * s} ${y + 3 * s} ${x - 2 * s} ${y + 3 * s} ${x - 4 * s} ${y} Z"${rot(r, x, y)} fill="${fill}" stroke-width="1.2"/>`;
  // outlined drizzle / swirl line
  const swirl = (d, fill = C.creamL, w = 2) => K.line(d, w + 2.2) + K.line(d, w, fill);
  // little cube seen from above (paneer, tofu): top face light, front face base
  const cube = (x, y, s, top, side) =>
    P(`M${x - s} ${y - s * 0.4} L${x - s * 0.4} ${y - s} H${x + s} V${y + s * 0.4} L${x + s * 0.4} ${y + s} H${x - s} Z`, side, 1.5) +
    P(`M${x - s} ${y - s * 0.4} L${x - s * 0.4} ${y - s} H${x + s} L${x + s * 0.4} ${y - s * 0.4} Z`, top, 1.2);
  // sauce heaped above the bowl rim; contents lifted onto it
  const heap = (fill, food) =>
    `<path d="M8 31 C10 22 20 17 32 17 C44 17 54 22 56 31 Z" fill="${fill}" stroke="none"/>` +
    K.line('M8.5 29.5 C10.5 22 20 17 32 17 C44 17 53.5 22 55.5 29.5', 1.5) + `<g transform="translate(0 -3.5)">${food}</g>`;
  // crescent dumpling standing on its flat seam-side, pleats along the top (jiaozi / gyoza), centred x,y
  const crescent = (x, y, s = 1, fill = C.creamL, crust = '') =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-12 3 C-12 -6 -5 -10 1 -10 C7 -10 12 -5 12 3 C6 6 -6 6 -12 3 Z', fill) +
    (crust ? P('M-12 3 C-11.5 0.5 -11 -0.5 -10.5 -1 C-4 1.5 4 1.5 11.5 -1 C11.8 0 12 1.5 12 3 C6 6 -6 6 -12 3 Z', crust, 1.5) : '') +
    K.line('M-8 -5.5 C-6 -3 -6 -1 -6.5 1 M-3 -8.5 C-1.5 -5 -1.5 -2 -2 1 M2 -9 C3 -6 3 -2 2.5 1 M7 -7 C7.5 -4 7.5 -1 7 1', 1.2, C.creamD) +
    K.hiE(-6, -4, 2.5, 1.2) + `</g>`;
  // bamboo steamer basket (same footprint as K.bowl); food = markup in the opening (y about 18..34)
  const steamer = (food = '') =>
    `${K.shadow(26)}<path d="M5 30 V48 C5 53 17 57 32 57 C47 57 59 53 59 48 V30 Z" fill="${C.wheat}"/>` +
    `<ellipse cx="32" cy="30" rx="27" ry="9" fill="${C.wheatL}"/><ellipse cx="32" cy="30" rx="23" ry="6.5" fill="${C.leafL}" stroke-width="1.5"/>` +
    food +
    `<path d="M5 30 C5 35 17 39 32 39 C47 39 59 35 59 30 V40 C59 45 47 49 32 49 C17 49 5 45 5 40 Z" fill="${C.wheatD}"/>` +
    K.line('M5 44 C8 50 20 53 32 53 C44 53 56 50 59 44 M14 47 V54 M24 49 V56 M40 49 V56 M50 47 V54', 1.3, C.wheatD) +
    K.sh('M52 42 C55 41 58 39 59 37 V48 C59 51 56 53 52 54 Z') + K.hi('M8 42 L11 43.5 V50 L8 48 Z');
  // dumpling purse with spiral pleats (xiaolongbao), base centred x,y
  const purse = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-10 0 C-12 -6 -6 -12 0 -13 C6 -12 12 -6 10 0 C6 3 -6 3 -10 0 Z', C.white) +
    K.line('M0 -12 C-3 -9 -7 -5 -8 -1 M0 -12 C-1 -8 -2 -3 -2.5 1 M0 -12 C1 -8 3 -3 3.5 1 M0 -12 C3 -9 7 -5 8 -1', 1.2, C.creamD) +
    `<circle cx="0" cy="-12.5" r="1.8" fill="${C.creamL}" stroke-width="1.2"/>` + K.hiE(-5, -6, 2.4, 1.3) + `</g>`;
  // broccoli floret
  const floret = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` + P('M-2 0 L-2 5 H2 L2 0', C.leafL, 1.5) +
    P('M-6 1 C-9 -1 -8 -6 -4 -6 C-3 -9 3 -9 4 -6 C8 -6 9 -1 6 1 Z', C.leaf, 1.8) + K.dots([[-3, -3], [1, -5], [3, -2]], 1, C.leafD) + `</g>`;
  // dried chilli pod
  const chili = (x, y, r = 0, fill = C.red) =>
    `<g${rot(r, x, y)}>${P(`M${x - 7} ${y} C${x - 4} ${y - 3} ${x + 3} ${y - 3} ${x + 6} ${y - 1} C${x + 3} ${y + 2} ${x - 4} ${y + 3} ${x - 7} ${y} Z`, fill, 1.4)}` +
    K.line(`M${x + 6} ${y - 1} L${x + 9} ${y - 2}`, 1.6, C.leafD) + `</g>`;

  FSI.add('dishes_3', {
    // ---------- Indian & South Asian ----------
    // orange sauce, chicken pieces, cream swirl and a melting butter pat
    butter_chicken: () =>
      K.bowl(heap(C.orange, 
        R(19, 27, 8, 6, C.orangeL, -12) + R(43, 27, 8, 6, C.orangeL, 15) + R(30, 32, 8, 6, C.orangeL, 5) +
        swirl('M14 31 C19 27 24 33 30 28 C35 24 41 31 47 28') +
        R(32, 23.5, 8, 5.5, C.yellowL, -8, 1.5, 1.2) + K.hi('M29.5 22.3 H33 L32.6 23.6 H29.2 Z')),
        C.white, C.orange),
    // deeper orange-red sauce, charred tikka chunks, cilantro
    chicken_tikka_masala: () =>
      K.bowl(heap(C.orangeD, 
        R(19, 28, 9, 7, C.brownL, -15) + K.line('M16 27 L20 30 M19 25.5 L22.5 28', 1.3, C.brownD) +
        R(32, 25, 9, 7, C.brownL, 8) + K.line('M29 24 L33 27.5 M32 22.5 L36 25.5', 1.3, C.brownD) +
        R(44, 29, 9, 7, C.brownL, 18) + K.line('M41 28 L45 31.5', 1.3, C.brownD) +
        swirl('M22 33.5 C27 31 34 34.5 40 32', C.cream, 1.6) +
        leaf(26, 30, -30) + leaf(39, 24, 25)),
        C.white, C.orangeD),
    // green spinach gravy with white paneer cubes and cream
    palak_paneer: () =>
      K.bowl(heap(C.leafD, 
        cube(20, 28, 4.5, C.white, C.creamD) + cube(33, 25, 4.5, C.white, C.creamD) + cube(44, 29.5, 4.5, C.white, C.creamD) +
        swirl('M22 33.5 C27 31 33 35 41 32.5')),
        C.white, C.leafD),
    // yellow lentils in a steel katori, tadka of chilli, cumin and ghee
    dal_tadka: () =>
      K.bowl(
        E(24, 28, 6, 2.2, C.yellowL, -5, 1.2) + E(41, 31.5, 5, 1.8, C.yellowL, 5, 1.2) +
        chili(31, 27, -12, C.redD) + chili(44, 26, 20, C.red) +
        K.dots([[18, 31], [21, 33], [28, 32], [36, 33.5], [38, 29], [16, 28]], 1.2, C.brownD) +
        leaf(20, 27, 20, C.leaf, 0.9),
        C.steel, C.yellow),
    // brown gravy full of chickpeas, cilantro
    chana_masala: () =>
      K.bowl(heap(C.brown, 
        [[15, 30], [21, 27], [27, 30.5], [33, 26], [39, 30], [45, 27], [49, 31], [24, 33.5], [36, 33.5], [30, 23.5], [42, 23.5]]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${C.wheat}" stroke-width="1.3"/>` + K.hiE(x - 1, y - 1, 1.2, 0.8))
          .join('') + leaf(27, 25, -20) + leaf(42, 31, 30)),
        C.white, C.brown),
    // mound of white and saffron rice, a chicken leg and mint
    chicken_biryani: () =>
      K.plate(
        P('M7 41 C7 28 19 18 32 18 C45 18 57 28 57 41 C48 47 16 47 7 41 Z', C.cream) +
        P('M14 30 C18 24 24 21 30 21 C27 26 30 30 24 33 C20 35 15 34 14 30 Z M38 33 C42 29 48 30 53 36 C50 40 44 41 40 39 Z', C.yellow, 0) +
        K.line('M12 38 l3 -1 M20 40 l3 0 M44 41 l3 -1 M50 38 l2 -2 M27 37 l3 1 M35 39 l3 0 M22 27 l2 -2 M41 25 l3 0', 1.3, C.wheatD) +
        K.line('M37 30 L49 17', 4.5) + K.line('M37 30 L49 17', 2, C.creamL) + E(50, 16, 3, 2.2, C.creamL, -45, 1.5) +
        E(29, 32, 10, 6.5, C.orangeD, -40) + K.hiE(26, 30, 3.5, 1.6, -40) +
        leaf(17, 25, -30, C.leaf, 1.1) + leaf(45, 34, 25, C.leaf, 1.1),
        C.white),
    // two golden triangular pastries with a pot of green chutney
    samosas: () =>
      K.plate(
        P('M28 19 L48 42 L36 46 Z', C.wheatD) + P('M28 19 L36 46 L10 44 Z', C.wheat) +
        K.hi('M27 24 L31 25 L17 41 L14 41 Z') +
        P('M43 16 L58 34 L50 37 Z', C.wheatD) + P('M43 16 L50 37 L34 34 Z', C.wheat) +
        K.line('M13 41.5 L34 43.5 M29 22 L45 40', 1.3, C.wheatD) +
        E(14, 52, 6, 3, C.white, 0, 2) + E(14, 51.5, 4, 1.7, C.leaf, 0, 1.2)),
    // teardrop naan on a board, charred blisters, garlic and herbs
    garlic_naan: () =>
      K.board(
        P('M6 42 C6 31 26 22 44 22 C57 22 61 30 55 37 C49 44 30 51 17 51 C10 51 6 48 6 42 Z', C.wheatL) +
        K.sh('M55 37 C49 44 30 51 17 51 C25 47 43 42 54 33 Z') +
        E(19, 40, 3.5, 2, C.wheatD, -15, 0) + E(37, 29, 4, 2.2, C.wheatD, -15, 0) + E(42, 40, 3, 1.8, C.wheatD, -15, 0) + E(27, 46, 2.5, 1.5, C.wheatD, 0, 0) +
        K.dots([[26, 36], [33, 38], [44, 33], [23, 43], [50, 30], [35, 44]], 1.5, C.white) +
        K.dots([[29, 32], [38, 35], [20, 46], [48, 36], [15, 42]], 1.1, C.leafD) +
        K.hiE(22, 32, 6, 2, -15)),
    // potatoes and cauliflower in turmeric, cilantro
    aloo_gobi: () => {
      const floret = (x, y) =>
        P(`M${x - 2} ${y + 6} L${x - 1.5} ${y + 1} M${x + 2} ${y + 6} L${x + 1.5} ${y + 1}`, 'none', 2) +
        P(`M${x - 6} ${y + 1} C${x - 9} ${y - 3} ${x - 5} ${y - 8} ${x - 1} ${y - 6} C${x + 1} ${y - 9} ${x + 7} ${y - 8} ${x + 7} ${y - 3} C${x + 9} ${y} ${x + 6} ${y + 3} ${x + 3} ${y + 2} H${x - 3} C${x - 4} ${y + 2.5} ${x - 5.5} ${y + 2} ${x - 6} ${y + 1} Z`, C.yellowL, 2) +
        K.line(`M${x - 2} ${y - 3} c1 -1 2 -1 3 0 M${x + 2} ${y - 1} c1 -1 2 -1 3 0`, 1.2, C.yellowD);
      return K.plate(
        floret(22, 29) + floret(41, 27) +
        cube(30, 40, 5, C.yellowL, C.yellow) + cube(17, 39, 4.5, C.yellowL, C.yellow) + cube(45, 39, 4.5, C.yellowL, C.yellow) +
        cube(32, 29, 4, C.yellowL, C.yellow) +
        leaf(24, 41, -25) + leaf(39, 35, 30));
    },
    // dark red-brown gravy, lamb chunks, oil sheen and a cardamom pod
    lamb_rogan_josh: () =>
      K.bowl(heap(C.redD, 
        R(20, 28, 9, 7, C.brownD, -10) + R(33, 25, 9, 7, C.brownD, 12) + R(44, 30, 9, 7, C.brownD, -6) +
        K.hiE(19, 26.5, 2.4, 1.2, -10) + K.hiE(32, 23.5, 2.4, 1.2, 10) +
        E(27, 32.5, 5, 1.5, C.redL, 0, 0) + E(39, 26, 3, 1.1, C.redL, 0, 0) +
        E(16, 32.5, 3.2, 1.6, C.leafL, 20, 1.2)),
        C.white, C.redD),
    // fiery red sauce, pork chunks and whole dried chillies
    pork_vindaloo: () =>
      K.bowl(heap(C.red, 
        R(19, 29, 8, 6.5, C.pinkD, -10) + R(33, 32, 8, 6.5, C.pinkD, 8) + R(45, 29, 8, 6.5, C.pinkD, 14) +
        chili(27, 24, -20, C.redD) + chili(41, 23, 25, C.redD) + K.hi('M23 23 L28 21.5 L28.5 22.6 L23.7 24 Z')),
        C.white, C.red),
    // long golden crisp crepe roll, potato filling at the open end, chutneys
    masala_dosa: () =>
      K.plate(
        E(16, 46, 6, 3, C.white, 0, 1.8) + E(16, 45.5, 4.3, 1.8, C.creamD, 0, 1.2) +
        E(49, 47, 6, 3, C.white, 0, 1.8) + E(49, 46.5, 4.3, 1.8, C.orange, 0, 1.2) +
        `<g transform="rotate(-18 32 32)">` +
        P('M6 25 H52 C56 25 58 29.5 58 33 C58 36.5 56 41 52 41 H6 C3 41 3 25 6 25 Z', C.wheat) +
        K.line('M14 29 C20 30 26 29 32 30 M20 36 C26 37 34 35 42 36.5', 1.3, C.wheatD) +
        E(53, 33, 4.5, 7.5, C.yellow, 0, 1.8) + K.dots([[52, 30.5], [54, 34.5], [51.5, 35.5]], 1, C.brownD) +
        K.hi('M9 27.5 H40 V29 H9 Z') + `</g>`),
    // mango yoghurt drink with a straw and a mango cube on the rim
    mango_lassi: () =>
      K.glass(C.yellow, 'tumbler',
        `<rect x="35" y="2" width="4.5" height="20" rx="1.5" transform="rotate(14 37 12)" fill="${C.redL}" stroke-width="2"/>` +
        `<path d="M19 22.5 H45 C43 25 38 26 32 25.5 C26 26 21 25 19 22.5 Z" fill="${C.yellowL}" stroke="none"/>` +
        K.dots([[26, 23.5], [31, 24.3], [38, 23.5]], 1, C.leafD) +
        P('M14 11 C14 3.5 27 3.5 27 11 Z', C.orange, 2) + P('M16.5 10.5 C17 6.5 24 6.5 24.5 10.5 Z', C.yellowL, 1.2)),
    // dark syrupy balls in golden syrup, pistachio slivers
    gulab_jamun: () =>
      K.bowl(
        `<circle cx="20" cy="27" r="7" fill="${C.brownD}"/>` + K.hiE(17.5, 24.5, 2.4, 1.4) +
        `<circle cx="44" cy="27" r="7" fill="${C.brownD}"/>` + K.hiE(41.5, 24.5, 2.4, 1.4) +
        `<circle cx="32" cy="23" r="7.5" fill="${C.brownD}"/>` + K.hiE(29.3, 20.3, 2.6, 1.5) +
        K.line('M30 31 l3 -1 M24 34 l2.5 1 M38 34 l2.5 -1', 1.8, C.leaf),
        C.white, C.gold),
    // creamy rice pudding, pistachio and saffron
    kheer: () =>
      K.bowl(
        K.dots([[15, 29], [20, 32], [26, 28], [31, 33], [37, 29], [43, 32], [48, 29], [22, 25.5], [40, 25.5], [33, 25]], 1.3, C.creamD) +
        K.line('M20 28.5 l4 -1.5 M34 30.5 l4 1 M44 27 l3.5 -2 M28 25 l3 1.5', 2, C.leaf) +
        K.line('M24 32 l3 0.5 M41 29.5 l2 2 M30 28 l2.5 -1', 1.3, C.orange) +
        K.hiE(16, 26, 4, 1.2, -5),
        C.white, C.cream),
    // craggy golden onion fritters
    onion_pakora: () => {
      const fritter = (x, y, s, fill) =>
        P(`M${x - 11 * s} ${y + 2 * s} C${x - 13 * s} ${y - 3 * s} ${x - 9 * s} ${y - 8 * s} ${x - 5 * s} ${y - 7 * s} C${x - 4 * s} ${y - 11 * s} ${x + 2 * s} ${y - 11 * s} ${x + 3 * s} ${y - 8 * s} C${x + 8 * s} ${y - 10 * s} ${x + 12 * s} ${y - 5 * s} ${x + 10 * s} ${y - 1 * s} C${x + 13 * s} ${y + 2 * s} ${x + 10 * s} ${y + 7 * s} ${x + 5 * s} ${y + 6 * s} C${x + 1 * s} ${y + 9 * s} ${x - 5 * s} ${y + 8 * s} ${x - 7 * s} ${y + 6 * s} C${x - 11 * s} ${y + 7 * s} ${x - 13 * s} ${y + 5 * s} ${x - 11 * s} ${y + 2 * s} Z`, fill) +
        K.line(`M${x - 7 * s} ${y - 2 * s} C${x - 3 * s} ${y - 6 * s} ${x + 3 * s} ${y - 5 * s} ${x + 6 * s} ${y - 1 * s} M${x - 6 * s} ${y + 3 * s} C${x - 2 * s} ${y} ${x + 3 * s} ${y + 1 * s} ${x + 5 * s} ${y + 3 * s}`, 1.5, C.wheatL) +
        K.dots([[x - 2 * s, y - 1 * s], [x + 3 * s, y + 4.5 * s]], 1.3, C.leafD);
      return K.plate(fritter(19, 34, 1, C.orange) + fritter(44, 33, 1, C.orangeD) + fritter(31, 24, 1.05, C.orange) +
        K.hiE(26, 18, 3, 1.4));
    },
    // orange coconut curry with fish steaks, curry leaves, in a clay bowl
    goan_fish_curry: () =>
      K.bowl(heap(C.orangeL, 
        R(21, 28, 11, 7, C.creamL, -10, 1.8, 3) + K.line('M18 25.5 C19 28 18 30 17 31 M23 25 C24 28 23 30 22 31.5', 1.2, C.creamD) +
        R(41, 27, 11, 7, C.creamL, 12, 1.8, 3) + K.line('M38 24.5 C39 27 38 29.5 37 30.5 M43 25 C44 28 43 30 42 31.5', 1.2, C.creamD) +
        swirl('M17 34 C23 32 27 35 32 33', C.creamL, 1.5) +
        leaf(31, 23.5, -15, C.leafD, 1.1) + leaf(48, 33, 25, C.leafD, 1)),
        C.terracotta, C.orangeL),
    // spiced milky tea in a clay kulhad, cinnamon stick, steam
    masala_chai: () =>
      K.shadow(18) + K.steam(32, 11) +
      P('M14 19 H50 L45 53 C44.5 56.5 42 58 38 58 H26 C22 58 19.5 56.5 19 53 Z', C.terracotta) +
      E(32, 19, 18, 4, C.terracotta, 0, 2.5) + E(32, 19.5, 15, 2.6, C.brownL, 0, 1.5) +
      K.line('M17.5 30 H46.5', 1.5, C.brownD) +
      K.hi('M18 24 L21 24 L23.5 51 L21.5 51 Z') + K.sh('M44 24 L47 24 L42.5 55 C41 57 39 57.5 38 57.5 Z') +
      `<rect x="44" y="40" width="16" height="5" rx="2.5" transform="rotate(-25 52 42.5)" fill="${C.brown}" stroke-width="2"/>` +
      K.line('M47 45 L57 40', 1.2, C.brownD),
    // dark-green spiced spinach with yellow potatoes, on a plate
    saag_aloo: () =>
      K.plate(
        P('M8 40 C7 32 15 25 24 25 C30 20 40 21 44 26 C53 26 58 33 56 40 C46 46 18 46 8 40 Z', C.leafD) +
        K.line('M14 36 C17 34 19 36 22 33 M42 31 C45 30 47 32 50 30 M30 26 C33 25 35 27 38 25', 1.4, C.pine) +
        cube(22, 33, 5, C.yellowL, C.yellow) + cube(38, 34, 5, C.yellowL, C.yellow) + cube(31, 26, 4.5, C.yellowL, C.yellow) +
        cube(47, 38, 4, C.yellowL, C.yellow) + cube(15, 39, 3.8, C.yellowL, C.yellow) +
        K.dots([[28, 37], [43, 28], [19, 30]], 1.2, C.ink)),
    // skewer of charred paneer, pepper and red onion, lemon wedge
    paneer_tikka: () =>
      K.plate(
        K.line('M5 49 L59 18', 3.5) + K.line('M5 49 L59 18', 1.5, C.woodL) +
        R(15, 43.5, 9, 9, C.orangeL, -30) + K.line('M12 44 L17 40', 1.4, C.brownD) +
        R(24.5, 38, 6, 8, C.leaf, -30) +
        R(32.5, 33.5, 9, 9, C.orangeL, -30) + K.line('M29.5 34 L34.5 30', 1.4, C.brownD) +
        R(41, 28.5, 6, 8, C.purple, -30) +
        R(49.5, 23.5, 9, 9, C.orangeL, -30) + K.line('M46.5 24 L51.5 20', 1.4, C.brownD) +
        P('M38 46 C40 40 50 39 54 44 Z', C.yellow, 2) + K.line('M41 44 L46 42 L51 44', 1.2, C.yellowD)),

    // ---------- Chinese ----------
    // golden rice mound speckled with egg, peas and carrot, scallion
    egg_fried_rice: () =>
      K.plate(
        P('M7 40 C7 28 19 19 32 19 C45 19 57 28 57 40 C48 46 16 46 7 40 Z', C.wheatL) +
        K.line('M13 36 l3 -1 M20 39 l3 0 M46 39 l3 -1 M51 34 l2 -2 M28 35 l3 1 M37 37 l3 0 M22 28 l2 -2 M40 25 l3 0 M33 29 l2 -1', 1.3, C.wheatD) +
        E(19, 31, 4, 2.5, C.yellow, -15, 1.3) + E(37, 23, 3.5, 2.2, C.yellow, 20, 1.3) + E(44, 33, 4, 2.4, C.yellow, 10, 1.3) + E(27, 40, 3.5, 2, C.yellow, 0, 1.3) +
        K.dots([[26, 27], [31, 33], [41, 29], [15, 37], [49, 38], [34, 40], [23, 34]], 1.9, C.leaf) +
        R(30, 25, 3, 3, C.orange, 20, 1.1, 0.6) + R(47, 29, 3, 3, C.orange, -10, 1.1, 0.6) + R(20, 39, 3, 3, C.orange, 10, 1.1, 0.6) + R(39, 37, 3, 3, C.orange, 0, 1.1, 0.6) +
        K.hiE(20, 25, 5, 1.8)),
    // glossy chicken cubes, peanuts and dried red chillies
    kung_pao_chicken: () =>
      K.plate(
        P('M8 40 C8 31 18 25 32 25 C46 25 56 31 56 40 C46 45 18 45 8 40 Z', C.brown, 0) +
        R(18, 35, 8, 7, C.orangeL, -10) + R(30, 30, 8, 7, C.orangeL, 12) + R(42, 35, 8, 7, C.orangeL, -5) + R(29, 41, 8, 6.5, C.orangeL, 4) + R(43, 26, 7, 6, C.orangeL, 20) +
        [[22, 28], [36, 38], [49, 32], [14, 41], [36, 24]].map(([x, y]) => E(x, y, 2.6, 1.8, C.woodL, 30, 1.3)).join('') +
        chili(23, 22, -25) + chili(48, 41, 15) + chili(14, 30, 70, C.redD) +
        K.dots([[33, 35], [26, 36], [39, 30]], 1.6, C.leaf)),
    // silky tofu cubes in red chilli-bean sauce, minced pork, scallion
    mapo_tofu: () =>
      K.bowl(heap(C.red,
        cube(19, 28, 5, C.white, C.creamD) + cube(32, 25, 5, C.white, C.creamD) + cube(45, 28, 5, C.white, C.creamD) + cube(26, 33, 4.5, C.white, C.creamD) + cube(39, 33, 4.5, C.white, C.creamD) +
        K.dots([[25, 26.5], [38, 27], [13, 31], [51, 32], [32, 32]], 1.5, C.brownD) +
        K.dots([[21, 22.5], [35, 20], [44, 23], [30, 30]], 1.4, C.leafL)),
        C.white, C.redD),
    // glossy orange pork, pineapple and green pepper
    sweet_and_sour_pork: () =>
      K.plate(
        P('M9 40 C9 32 19 27 32 27 C45 27 55 32 55 40 C46 45 18 45 9 40 Z', C.orangeL, 0) +
        E(19, 34, 6.5, 5.5, C.orange) + K.hiE(17, 32, 2.2, 1.2) + E(32, 29, 6.5, 5.5, C.orange) + K.hiE(30, 27, 2.2, 1.2) +
        E(43, 35, 6.5, 5.5, C.orange) + K.hiE(41, 33, 2.2, 1.2) + E(28, 40, 6, 4.5, C.orangeD) +
        P('M38 20 L46 22 L44 28 L36 26 Z', C.yellow, 1.6) + P('M11 41 L18 42 L16 47 L9 46 Z', C.yellow, 1.6) +
        P('M21 22 C24 19 30 20 30 23 L26 25 Z', C.leaf, 1.6) + P('M46 40 C50 38 55 40 54 43 L49 44 Z', C.leaf, 1.6) + P('M37 41 C39 38 44 39 43 42 L40 45 Z', C.red, 1.6)),
    // whole lacquered roast duck, pancakes and scallion
    peking_duck: () =>
      K.plate(
        P('M14 30 C12 22 10 17 13 14 C16 11 21 12 21 16 C21 20 18 23 21 28', C.orangeD) +
        P('M10.5 15 L4 17 L10 19 Z', C.choc, 1.8) +
        P('M14 34 C14 25 24 21 36 21 C49 21 57 28 56 36 C55 43 46 46 34 46 C21 46 14 42 14 34 Z', C.orangeD) +
        K.sh('M52 30 C56 36 52 44 38 46 C47 44 54 39 52 30 Z') + K.hiE(27, 26, 7, 2.6, -10) +
        K.line('M30 35 C36 38 44 37 49 33', 1.4, C.brownD) + `<circle cx="14.5" cy="15.5" r="1.2" fill="${C.ink}" stroke="none"/>` +
        E(51, 48, 8, 3, C.cream, 0, 1.8) + E(51, 46, 8, 3, C.creamL, 0, 1.8) +
        K.line('M8 47 L24 44', 4) + K.line('M8 47 L24 44', 1.8, C.leafL)),
    // boiled crescent dumplings with a dish of black vinegar
    jiaozi: () =>
      K.plate(
        crescent(20, 29, 0.95) + crescent(44, 29, 0.95) + crescent(32, 40, 1.05) +
        E(53, 46, 5.5, 2.8, C.white, 0, 2) + E(53, 45.5, 3.8, 1.6, C.choc, 0, 1.2)),
    // wontons with silky tails in clear broth, scallion, steam
    wonton_soup: () =>
      K.steam(32, 12) +
      K.bowl(
        [[19, 27], [32, 23.5], [44, 28]].map(([x, y]) =>
          P(`M${x - 6} ${y + 2} C${x - 9} ${y - 3} ${x - 4} ${y - 7} ${x} ${y - 5} C${x + 4} ${y - 7} ${x + 9} ${y - 3} ${x + 6} ${y + 2} C${x + 8} ${y + 4} ${x + 4} ${y + 5} ${x + 2} ${y + 3} C${x} ${y + 5} ${x - 3} ${y + 5} ${x - 4} ${y + 3} C${x - 7} ${y + 5} ${x - 9} ${y + 3} ${x - 6} ${y + 2} Z`, C.creamL, 1.8) +
          K.line(`M${x - 3} ${y - 1} C${x - 1} ${y + 1} ${x + 1} ${y + 1} ${x + 3} ${y - 1}`, 1.2, C.creamD)).join('') +
        [[25, 32], [38, 32.5], [13, 30], [51, 31]].map(([x, y]) => E(x, y, 1.8, 1.2, C.leafL, 0, 1.2)).join(''),
        C.white, C.wheatL),
    // red-edged barbecue pork slices fanned on a plate
    char_siu: () =>
      K.plate(
        [[16, 41], [23, 36], [30, 31], [37, 26]].map(([x, y]) =>
          `<g transform="rotate(-25 ${x + 8} ${y - 2})">` + R(x + 8, y - 2, 19, 15, C.redD, 0, 2.5, 3) +
          `<rect x="${x + 0.5}" y="${y - 7.5}" width="15" height="11" rx="2" fill="${C.pinkL}" stroke="none"/>` +
          K.line(`M${x + 3} ${y - 4} H${x + 13} M${x + 3} ${y} H${x + 11}`, 1.2, C.pink) + `</g>`).join('') +
        K.hiE(39, 19, 3, 1.2, -25) + K.dots([[16, 30], [12, 34]], 1.6, C.leaf)),
    // dark tangy broth with tofu strips, mushrooms and egg ribbons, steam
    hot_and_sour_soup: () =>
      K.steam(32, 12) +
      K.bowl(
        R(20, 27, 9, 3, C.creamL, -15, 1.3, 1) + R(40, 30, 9, 3, C.creamL, 20, 1.3, 1) + R(31, 33, 8, 2.6, C.creamL, 0, 1.3, 1) +
        swirl('M13 31 C17 28 21 32 26 29 M34 25 C38 22 43 26 49 24', C.yellow, 1.8) +
        E(30, 26, 4, 2, C.choc, 10, 1.3) + E(46, 29, 3.5, 1.8, C.brownD, -10, 1.3) + E(17, 32, 3, 1.5, C.choc, 0, 1.3) +
        K.dots([[24, 32], [37, 27], [44, 33]], 1, C.ink),
        C.white, C.brown),
    // tangle of stir-fried egg noodles, chicken, bok choy and bean sprouts
    chicken_chow_mein: () => {
      const nd = 'M10 40 C14 32 18 44 22 36 C26 28 30 42 34 34 C38 26 42 40 46 32 C49 27 52 36 55 38 M13 34 C17 26 22 36 26 28 C30 22 34 32 38 26 C42 20 47 30 50 26 M16 43 C21 38 26 46 31 41 C36 37 41 45 47 40';
      return K.plate(
        P('M8 41 C8 30 19 22 32 22 C45 22 56 30 56 41 C46 46 18 46 8 41 Z', C.wheat) +
        K.line(nd, 3, C.wheatD) + K.line(nd, 1.4, C.wheatL) +
        R(22, 30, 9, 4.5, C.creamL, -20, 1.5, 1.5) + R(40, 36, 9, 4.5, C.creamL, 15, 1.5, 1.5) +
        P('M33 26 C36 19 46 18 48 23 C44 27 38 28 33 26 Z', C.leaf, 1.8) + K.line('M34 25.5 L46 21.5', 1.6, C.leafL) +
        P('M12 37 C13 31 20 31 22 34 C19 37 15 38 12 37 Z', C.leaf, 1.8) +
        K.line('M28 38 l5 3 M45 30 l4 -3 M17 42 l5 0', 2.2, C.creamL));
    },
    // three crisp golden rolls, one cut to show the vegetables
    spring_rolls: () =>
      K.plate(
        `<g transform="rotate(-20 32 34)">` +
        `<rect x="10" y="17" width="42" height="11" rx="5.5" fill="${C.orangeL}"/>` + K.line('M18 19 L22 26 M30 19 L34 26 M42 19 L46 26', 1.3, C.orange) +
        `<rect x="7" y="30" width="44" height="11" rx="5.5" fill="${C.wheat}"/>` + K.line('M15 32 L19 39 M27 32 L31 39 M39 32 L43 39', 1.3, C.wheatD) +
        `<rect x="14" y="43" width="34" height="11" rx="5.5" fill="${C.orangeL}"/>` +
        E(48, 48.5, 4.5, 5.5, C.creamL, 0, 2) + K.dots([[47, 46.5], [49.5, 50]], 1.3, C.leaf) + K.dots([[49.5, 46], [46.5, 50.5]], 1.3, C.orange) +
        K.hi('M13 32.5 H40 V34 H13 Z') + `</g>`),
    // plain rice porridge in a blue bowl, scallion and ginger, steam
    congee: () =>
      K.steam(32, 12) +
      K.bowl(heap(C.creamL,
        K.line('M24 25 l6 -2 M34 26 l5 1 M28 29 l4 -1', 1.6, C.yellowD) +
        [[19, 26], [37, 21.5], [44, 27], [29, 22], [33, 30], [22, 31]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="${C.leafL}" stroke="${C.leafD}" stroke-width="1.3"/>`).join('') +
        K.hiE(18, 22, 4, 1.4, -15)),
        C.blueL, C.creamL),
    // noodles in red chilli oil topped with crispy pork mince and bok choy
    dan_dan_noodles: () =>
      K.bowl(
        swirl('M11 30 C15 25 19 33 23 27 C27 22 30 31 34 27 M30 33 C34 28 38 35 42 30 C45 27 49 32 53 29 M15 34 C19 31 22 35 26 32', C.wheatL, 2) +
        P('M22 25 C22 19 31 17 35 20 C40 18 44 22 42 26 C36 29 27 29 22 25 Z', C.brownD, 1.8) +
        K.dots([[27, 22.5], [33, 21], [37, 23.5], [30, 25]], 1.3, C.brownL) +
        P('M41 25 C44 18 53 19 54 24 C51 27 45 28 41 25 Z', C.leaf, 1.8) + K.line('M42 24.5 L52 22', 1.5, C.leafL) +
        K.dots([[18, 32], [44, 33]], 1.3, C.leafL),
        C.white, C.red),
    // a whole embossed mooncake and a half showing bean paste and salted yolk
    mooncakes: () =>
      K.shadow(26) +
      P('M5 25 V35 C5 41 14 45 25 45 C36 45 45 41 45 35 V25 Z', C.wheatD) +
      E(25, 25, 20, 9, C.wheat) +
      K.line('M25 18 C29 18 31 21 31 24 C34 24 36 26 34 28 C31 31 19 31 16 28 C14 26 16 24 19 24 C19 21 21 18 25 18 Z', 1.4, C.wheatD) +
      E(25, 25, 3, 1.6, C.wheatD, 0, 1.3) + K.hiE(14, 22, 4, 1.5, -10) +
      K.sh('M40 31 C43 33 45 31 45 28 V35 C45 39 41 42 36 43 Z') +
      P('M22 46 C22 39 32 34 42 34 C52 34 60 39 60 46 Z', C.choc) +
      P('M22 46 C22 39 32 34 42 34 C52 34 60 39 60 46 V50 C60 53 52 57 41 57 C30 57 22 53 22 50 Z', 'none') +
      P('M22 46 H60 V50 C60 53 52 57 41 57 C30 57 22 53 22 50 Z', C.wheatD) +
      P('M24 46 C24 40.5 32 36.5 41 36.5 C50 36.5 58 40.5 58 46 Z', C.choc, 0) +
      P('M33 46 C33 41 37 39 41 39 C45 39 49 41 49 46 Z', C.orange, 1.6) + K.hiE(38, 42, 2, 1.1, -10),
    // two flaky tart shells with glossy custard
    egg_tarts: () => {
      const tart = (x, y, s) =>
        `<g transform="translate(${x} ${y}) scale(${s})">` +
        P('M-17 -4 L-13 9 C-12 12 -6 13 0 13 C6 13 12 12 13 9 L17 -4 Z', C.wheat) +
        K.line('M-11 -1 L-9 10 M-5 0 L-4 12 M1 0 V12.5 M7 0 L6 12 M12 -1 L10 10', 1.3, C.wheatD) +
        E(0, -4, 17, 6, C.wheatL, 0, 2.5) + E(0, -4.5, 13.5, 4.3, C.yellow, 0, 1.5) +
        E(-4, -5, 2.5, 1.2, C.orangeD, 0, 0) + E(5, -3.5, 1.8, 1, C.orangeD, 0, 0) + K.hiE(-7, -6, 3.5, 1.2, -5) + `</g>`;
      return K.shadow(27) + tart(20, 30, 0.95) + tart(41, 41, 1.05);
    },
    // whole steamed fish under ginger and scallion shreds, soy around it
    steamed_fish_with_ginger: () =>
      K.plate(
        P('M8 40 C14 32 30 31 44 34 C50 35 54 39 56 40 C54 41 50 45 44 46 C30 49 14 48 8 40 Z', C.brownD, 0) +
        P('M5 37 C9 29 22 26 36 28 C42 29 46 32 50 34 L58 27 C59 32 58 39 59 44 L50 39 C46 42 41 44 34 44 C20 46 8 44 5 37 Z', C.greyL) +
        K.line('M16 30 C14 33 14 38 16 41', 1.5, C.greyD) + `<circle cx="10.5" cy="34" r="1.5" fill="${C.ink}" stroke="none"/>` +
        K.sh('M20 43 C30 44 40 42 48 38 C44 43 38 45 30 45 C25 45 22 44 20 43 Z') +
        swirl('M22 32 C27 30 31 34 37 31 M24 37 C29 35 34 39 41 35', C.leaf, 1.6) +
        K.line('M28 30 l5 4 M33 35 l4 -3 M20 35 l4 1 M41 33 l3 2', 1.7, C.yellowL) + K.hiE(22, 30, 4, 1.2, -5)),
    // dark beef slices and bright broccoli florets
    beef_with_broccoli: () =>
      K.plate(
        P('M10 40 C10 32 20 27 32 27 C44 27 54 32 54 40 C45 45 19 45 10 40 Z', C.brownD, 0) +
        R(22, 36, 13, 5, C.brown, -15, 1.8, 2.5) + R(37, 39, 13, 5, C.brown, 10, 1.8, 2.5) + R(33, 30, 12, 5, C.brown, -5, 1.8, 2.5) +
        K.hiE(20, 34.5, 3, 0.9, -15) + K.hiE(35, 37.5, 3, 0.9, 10) +
        floret(16, 27, 1.15) + floret(46, 27, 1.2) + floret(29, 21, 1.1) + floret(48, 39, 1) +
        K.dots([[26, 39], [40, 34]], 1.2, C.creamL)),
    // soup dumplings with spiral pleats in a bamboo steamer, steam
    xiaolongbao: () =>
      steamer(purse(20, 32, 1) + purse(44, 32, 1) + purse(32, 26, 1.05) + purse(32, 37, 0.85)),
    // curled pork belly slices with leek and red pepper
    twice_cooked_pork: () => {
      const slice = (x, y, r) =>
        `<g transform="rotate(${r} ${x} ${y})">` + P(`M${x - 9} ${y - 5} C${x - 3} ${y - 8} ${x + 3} ${y - 3} ${x + 9} ${y - 6} L${x + 9} ${y + 4} C${x + 3} ${y + 7} ${x - 3} ${y + 2} ${x - 9} ${y + 5} Z`, C.fat, 2) +
        P(`M${x - 9} ${y - 1} C${x - 3} ${y - 4} ${x + 3} ${y + 1} ${x + 9} ${y - 2} L${x + 9} ${y + 4} C${x + 3} ${y + 7} ${x - 3} ${y + 2} ${x - 9} ${y + 5} Z`, C.meatL, 0) +
        K.line(`M${x - 9} ${y - 5} C${x - 3} ${y - 8} ${x + 3} ${y - 3} ${x + 9} ${y - 6}`, 2.2, C.brownL) + `</g>`;
      return K.plate(
        P('M10 40 C10 32 20 27 32 27 C44 27 54 32 54 40 C45 45 19 45 10 40 Z', C.redD, 0) +
        slice(21, 35, -10) + slice(41, 36, 12) + slice(31, 27, -5) +
        P('M12 42 L22 44 L21 47 L11 45 Z', C.leaf, 1.6) + P('M42 23 L52 26 L51 29 L41 26 Z', C.leaf, 1.6) + P('M28 41 L36 41 L35 45 L27 44 Z', C.leafL, 1.6) +
        P('M47 42 C50 39 55 41 54 44 L49 46 Z', C.red, 1.6) + P('M15 24 C18 21 23 23 22 26 L17 27 Z', C.red, 1.6));
    },
  });
})(FSI);
