// Dishes 3b: Japanese, Korean (served dishes, see assets/STYLE.md).
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

  // ---- Japanese / Korean extras ----
  // ramen toppings
  const noodles = (d, fill = C.wheatL, w = 2) => K.line(d, w + 2.2) + K.line(d, w, fill);
  const chashu = (x, y, r = 6.5) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.brownL}"/><circle cx="${x}" cy="${y}" r="${r - 2}" fill="${C.pinkL}" stroke="none"/>` +
    K.line(`M${x - 2} ${y - 1} C${x} ${y - 3} ${x + 3} ${y - 1} ${x + 1} ${y + 1.5}`, 1.2, C.pink);
  const eggHalf = (x, y, r = 0) => E(x, y, 6.5, 4.5, C.white, r, 2) + E(x + 0.5, y + 0.3, 3.3, 2.4, C.orange, r, 1.3);
  const rings = (pts) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.9" fill="${C.leafL}" stroke="${C.leafD}" stroke-width="1.2"/>`).join('');
  const naruto = (x, y) => E(x, y, 5, 3.5, C.white, 0, 1.6) + K.line(`M${x} ${y} C${x + 2} ${y - 1} ${x + 2} ${y + 2} ${x} ${y + 1.8} C${x - 3} ${y + 1.8} ${x - 3.5} ${y - 2} ${x} ${y - 2}`, 1.3, C.pinkD);
  // sushi roll piece: side wrap, top ring, rice, centre markup
  const maki = (x, y, r, side, ring, centre, sideExtra = '') =>
    `<path d="M${x - r} ${y} V${y + r * 0.7} C${x - r} ${y + r * 1.25} ${x + r} ${y + r * 1.25} ${x + r} ${y + r * 0.7} V${y} Z" fill="${side}"/>` + sideExtra +
    E(x, y, r, r * 0.52, ring, 0, 2.5) + E(x, y, r * 0.78, r * 0.38, C.white, 0, 1.2) + centre;
  // breaded cutlet sliced into strips (katsu); x,y centre
  const katsu = (x, y, rr = -15) =>
    `<g transform="rotate(${rr} ${x} ${y})">` + R(x, y, 34, 13, C.orangeL, 0, 2.5, 5) +
    K.line(`M${x - 8} ${y - 6.5} V${y + 6.5} M${x} ${y - 6.5} V${y + 6.5} M${x + 8} ${y - 6.5} V${y + 6.5}`, 3.6) +
    K.line(`M${x - 8} ${y - 5} V${y + 5} M${x} ${y - 5} V${y + 5} M${x + 8} ${y - 5} V${y + 5}`, 1.6, C.creamL) +
    K.dots([[x - 13, y - 2], [x - 4, y + 2], [x + 4, y - 3], [x + 12, y + 1], [x - 12, y + 3]], 1, C.orangeD) +
    K.hi(`M${x - 15} ${y - 4} H${x - 9.5} V${y - 2.5} H${x - 15} Z`) + `</g>`;
  const sesame = (pts) => pts.map(([x, y]) => E(x, y, 1.1, 0.7, C.creamL, 30, 0.8)).join('');

  FSI.add('dishes_3', {
    // ---------- Japanese ----------
    // salmon and tuna nigiri on a wooden geta, wasabi and ginger
    nigiri_sushi: () => {
      const nig = (x, y, fish, stripe) =>
        `<g transform="rotate(-18 ${x} ${y})">` + R(x, y + 2, 21, 9, C.white, 0, 2.5, 4.5) +
        P(`M${x - 12} ${y - 1} C${x - 12} ${y - 6} ${x - 6} ${y - 7} ${x} ${y - 6.5} C${x + 7} ${y - 7} ${x + 13} ${y - 5} ${x + 12} ${y} C${x + 8} ${y + 2} ${x - 8} ${y + 2} ${x - 12} ${y - 1} Z`, fish) +
        (stripe ? K.line(`M${x - 6} ${y - 5.5} L${x - 8} ${y + 0.5} M${x} ${y - 5.5} L${x - 2} ${y + 1} M${x + 6} ${y - 5.5} L${x + 4} ${y + 0.8}`, 1.4, stripe) : '') +
        K.hiE(x - 6, y - 4, 3, 1, 0) + `</g>`;
      return K.board(nig(22, 40, C.orange, C.orangeL) + nig(41, 33, C.red, '') +
        P('M50 40 C49 37 55 36 56 39 C57 42 51 43 50 40 Z', C.leaf, 1.8) + P('M8 43 C9 40 14 40 15 42 C13 45 10 46 8 43 Z', C.pinkL, 1.8));
    },
    // three nori-wrapped rolls with a red tuna centre
    tuna_maki: () =>
      K.plate(
        maki(21, 28, 10, C.black, C.black, E(21, 28, 3.6, 1.9, C.red, 0, 1.2)) +
        maki(43, 28, 10, C.black, C.black, E(43, 28, 3.6, 1.9, C.red, 0, 1.2)) +
        maki(32, 39, 10, C.black, C.black, E(32, 39, 3.6, 1.9, C.red, 0, 1.2)) +
        P('M51 45 C50 42 56 41 57 44 C58 47 52 48 51 45 Z', C.leaf, 1.8)),
    // inside-out rolls: rice and sesame outside, crab, avocado and cucumber inside
    california_roll: () => {
      const cal = (x, y) => maki(x, y, 12, C.white, C.white,
        E(x, y, 5.5, 2.8, C.black, 0, 1.2) + E(x - 2, y - 0.3, 2.2, 1.6, C.leaf, 0, 1) + E(x + 2.3, y - 0.5, 2.2, 1.5, C.redL, 0, 1) + E(x + 0.3, y + 1.5, 1.8, 1, C.leafL, 0, 1),
        K.dots([[x - 7, y + 6], [x - 2, y + 8.5], [x + 4, y + 7.5], [x + 8, y + 5], [x - 10, y + 3]], 1.1, C.orange) +
        sesame([[x - 4, y + 5], [x + 1, y + 6], [x + 6, y + 9], [x - 8, y + 9]]));
      return K.plate(cal(21, 30) + cal(43, 33) + K.dots([[16, 30], [26, 26.5], [48, 30], [38, 36.5]], 1, C.orange));
    },
    // fanned salmon and tuna slices on shiso and shredded daikon
    sashimi_platter: () => {
      const sl = (x, y, fill, line) => R(x, y, 9, 15, fill, 25, 2, 3) + (line ? K.line(`M${x - 3} ${y - 3} L${x + 2} ${y - 5} M${x - 2} ${y + 2} L${x + 3} ${y}`, 1.3, line) : '');
      return K.plate(
        P('M10 34 C12 24 24 20 34 23 C26 27 18 31 10 34 Z', C.leaf) + K.line('M12 32 C18 28 25 25 32 23.5', 1.3, C.leafD) +
        P('M38 22 C40 16 52 15 56 22 C56 28 40 28 38 22 Z', C.white) + K.line('M42 20 C44 23 47 24 50 24 M45 18 C48 21 51 22 53 21', 1.2, C.greyL) +
        sl(17, 38, C.orange, C.orangeL) + sl(24, 36, C.orange, C.orangeL) + sl(31, 34, C.orange, C.orangeL) +
        sl(38, 37, C.red, '') + sl(45, 39, C.red, '') +
        P('M48 47 C47 44 53 43 54 46 C55 49 49 50 48 47 Z', C.leaf, 1.8));
    },
    // miso broth in a black lacquer bowl, tofu cubes, wakame, scallion
    miso_soup: () =>
      K.steam(32, 12) +
      K.bowl(
        cube(20, 28, 3.2, C.white, C.creamD) + cube(36, 25, 3.2, C.white, C.creamD) + cube(42, 31, 3.2, C.white, C.creamD) +
        P('M24 32 C26 29 31 29 31 32 C29 34 26 34 24 32 Z', C.leafD, 1.3) + P('M43 24 C45 22 50 23 49 26 C47 27 44 26 43 24 Z', C.leafD, 1.3) + P('M14 30 C15 27 19 27 19 30 Z', C.leafD, 1.3) +
        rings([[29, 25], [33, 33], [49, 30], [24, 25]]),
        C.black, C.wheat),
    // creamy pork broth, chashu, egg, nori sheet, scallion
    tonkotsu_ramen: () =>
      K.steam(18, 12) +
      K.bowl(
        P('M41 12 L52 14.5 L50 29 L39 27 Z', C.black, 2) +
        noodles('M11 31 C15 27 19 33 23 29 M28 33 C32 29 36 35 40 31 C44 28 48 33 53 30', C.wheatL) +
        chashu(21, 25) + eggHalf(35, 26, -8) + rings([[46, 31], [42, 34], [15, 30], [27, 32]]),
        C.white, C.cream),
    // clear brown soy broth in a red bowl, chashu, egg, naruto, menma
    shoyu_ramen: () =>
      K.steam(18, 12) +
      K.bowl(
        noodles('M11 31 C15 27 19 33 23 29 M28 33 C32 29 36 35 40 31 C44 28 48 33 53 30', C.yellowL) +
        chashu(22, 25) + eggHalf(38, 24, 8) + naruto(45, 31) +
        R(31, 31, 7, 2.5, C.wheatD, 20, 1.2, 1) + R(29, 22, 6, 2.5, C.wheatD, -30, 1.2, 1) +
        rings([[14, 30], [34, 34], [51, 27]]),
        C.redD, C.brownL),
    // battered prawns with red tails and a sweet-potato slice
    tempura: () => {
      const prawn = (x, y, r) =>
        `<g transform="rotate(${r} ${x} ${y})">` +
        P(`M${x + 13} ${y - 3} L${x + 21} ${y - 8} L${x + 19} ${y} L${x + 21} ${y + 7} L${x + 13} ${y + 3} Z`, C.red, 2) +
        P(`M${x - 17} ${y} C${x - 18} ${y - 4} ${x - 13} ${y - 7} ${x - 9} ${y - 5} C${x - 6} ${y - 8} ${x - 1} ${y - 6} ${x + 1} ${y - 7} C${x + 5} ${y - 8} ${x + 9} ${y - 5} ${x + 11} ${y - 6} C${x + 16} ${y - 5} ${x + 16} ${y + 4} ${x + 11} ${y + 5} C${x + 7} ${y + 7} ${x + 2} ${y + 5} ${x - 2} ${y + 7} C${x - 7} ${y + 8} ${x - 10} ${y + 5} ${x - 13} ${y + 6} C${x - 17} ${y + 6} ${x - 19} ${y + 3} ${x - 17} ${y} Z`, C.wheatL) +
        K.dots([[x - 10, y - 1], [x - 3, y + 2], [x + 4, y - 2], [x + 9, y + 1]], 1.2, C.wheat) + K.hiE(x - 8, y - 3, 4, 1.2, 0) + `</g>`;
      return K.plate(
        E(46, 41, 8, 6, C.purple, -10) + E(46, 40.5, 6, 4.3, C.yellowL, -10, 1.2) + K.dots([[44, 40], [48, 41.5]], 1, C.yellowD) +
        prawn(26, 38, -35) + prawn(30, 30, -12));
    },
    // glazed salmon fillet with sesame, a little rice behind
    teriyaki_salmon: () =>
      K.plate(
        P('M33 30 C33 22 40 19 47 19 C54 19 58 23 57 30 C52 33 38 33 33 30 Z', C.white) + K.dots([[42, 24], [49, 23], [52, 27], [45, 28]], 1, C.creamD) +
        P('M10 37 L26 46 V51 L10 42 Z', C.orange) + P('M26 46 L52 36 V41 L26 51 Z', C.orangeD) +
        P('M10 37 L36 28 L52 36 L26 46 Z', C.orangeL) +
        K.line('M17 34.5 L32 43 M25 31.5 L40 40 M33 29 L47 37', 1.4, C.white) +
        swirl('M16 38 C22 35 28 38 34 34 C38 32 42 34 46 33', C.brownD, 1.8) +
        K.line('M12 40 L24 47', 1.3, C.orangeL) + sesame([[22, 37], [30, 35], [34, 40], [40, 36], [29, 41]]) +
        K.dots([[45, 33], [17, 34]], 1.6, C.leaf)),
    // white rice, sliced katsu and a pool of brown curry
    chicken_katsu_curry: () =>
      K.plate(
        P('M30 40 C34 30 46 26 54 30 C60 34 58 44 50 47 C42 49 32 47 30 40 Z', C.brown) +
        R(46, 40, 4, 4, C.orange, 10, 1.3, 1) + R(52, 36, 3.5, 3.5, C.orange, -10, 1.3, 1) +
        P('M6 38 C6 28 14 22 24 22 C32 22 36 28 35 35 C30 40 12 42 6 38 Z', C.white) + K.dots([[14, 30], [20, 27], [26, 31], [12, 35]], 1, C.creamD) +
        katsu(32, 36, -18) + swirl('M38 31 C42 33 44 37 48 36', C.brownD, 1.6)),
    // sliced pork cutlet, shredded cabbage, lemon and brown sauce
    tonkatsu: () =>
      K.plate(
        P('M30 30 C30 20 40 16 48 18 C56 19 60 26 57 33 C50 36 36 36 30 30 Z', C.leafL) +
        K.line('M34 28 C38 22 44 20 50 21 M37 31 C42 26 48 25 54 27 M40 23 C44 21 50 19 53 22', 1.3, C.leaf) +
        katsu(26, 38, -15) + swirl('M15 39 C20 36 26 40 31 36 C34 34 37 36 39 34', C.brownD, 1.8) +
        P('M45 42 C46 37 53 36 56 40 Z', C.yellow, 2) + K.line('M48 40.5 L51 38.5', 1.2, C.yellowD)),
    // thick savoury pancake with brown sauce, mayo zigzag, aonori and bonito
    okonomiyaki: () =>
      K.plate(
        P('M8 32 V38 C8 44 19 48 32 48 C45 48 56 44 56 38 V32 Z', C.wheatD) +
        E(32, 32, 24, 10, C.brownD) +
        swirl('M15 31 L20 26 L24 34 L29 25 L34 35 L39 25 L43 34 L48 27', C.creamL, 1.5) +
        K.dots([[18, 34], [26, 30], [36, 30.5], [46, 33], [31, 37], [41, 37]], 1.2, C.leafL) +
        P('M22 28 c2 -2 4 0 6 -2 l1 2 c-2 2 -4 0 -6 2 Z M38 35 c2 -2 4 0 6 -2 l1 2 c-2 2 -4 0 -6 2 Z', C.pinkL, 1) +
        K.hiE(16, 28, 4, 1.4, -10)),
    // octopus balls with sauce, mayo, bonito flakes and a toothpick
    takoyaki: () => {
      const ball = (x, y) =>
        `<circle cx="${x}" cy="${y}" r="7" fill="${C.wheat}"/>` +
        P(`M${x - 6.8} ${y - 1} C${x - 6} ${y - 8} ${x + 6} ${y - 8} ${x + 6.8} ${y - 1} C${x + 3} ${y + 1} ${x - 3} ${y + 1} ${x - 6.8} ${y - 1} Z`, C.brownD, 0) +
        K.line(`M${x - 4} ${y - 3} L${x - 1.5} ${y - 5.5} L${x + 1} ${y - 3} L${x + 3.5} ${y - 5.5}`, 1.3, C.creamL) +
        `<circle cx="${x}" cy="${y}" r="7" fill="none"/>`;
      return K.plate(
        ball(18, 31) + ball(32, 28) + ball(46, 31) + ball(24, 41) + ball(40, 41) +
        P('M27 23 c2 -2 4 0 6 -2 l1 2 c-2 2 -4 0 -6 2 Z M41 36 c2 -2 4 0 5 -2 l1 2 c-2 2 -4 0 -5 2 Z M13 36 c2 -2 4 0 5 -2 l1 2 c-2 2 -4 0 -5 2 Z', C.pinkL, 1) +
        K.dots([[20, 27], [35, 25], [48, 28], [26, 37], [38, 37]], 1, C.leaf) +
        K.line('M45 39 L56 14', 3.6) + K.line('M45 39 L56 14', 1.6, C.woodL));
    },
    // pan-fried dumplings in a row with crisp golden bottoms
    gyoza: () =>
      K.plate(
        crescent(45, 27, 0.92, C.creamL, C.wheatD) + crescent(37, 32, 0.92, C.creamL, C.wheatD) +
        crescent(28, 37, 0.92, C.creamL, C.wheatD) + crescent(19, 42, 0.92, C.creamL, C.wheatD) +
        E(52, 45, 5.5, 2.8, C.white, 0, 2) + E(52, 44.5, 3.8, 1.6, C.brown, 0, 1.2)),
    // triangular rice ball with a nori band and salmon filling
    onigiri: () =>
      K.shadow(24) +
      P('M32 7 C36 7 40 12 46 21 C52 31 57 39 56 47 C55 54 48 57 32 57 C16 57 9 54 8 47 C7 39 12 31 18 21 C24 12 28 7 32 7 Z', C.white) +
      K.sh('M50 31 C55 39 57 47 54 52 C51 56 45 57 40 57 C48 52 52 42 50 31 Z') +
      P('M23 37 H41 V57 C38 57.2 35 57.2 32 57.2 C29 57.2 26 57.2 23 57 Z', C.black) +
      K.line('M26 41 V54 M32 41 V55 M38 41 V54', 1.2, C.pine) +
      P('M27 24 C27 20 37 20 37 24 C37 28 27 28 27 24 Z', C.orange, 2) + K.line('M29 23 L33 25 M32 22 L35 24', 1.2, C.orangeL) +
      K.hiE(19, 30, 4.5, 2, -55) + K.dots([[24, 31], [40, 31], [44, 37], [17, 40]], 1, C.greyL),
    // soft pink and white mochi, one cut to show red bean paste
    daifuku_mochi: () =>
      K.plate(
        P('M30 32 C30 20 37 15 43 15 C51 15 57 21 57 32 C52 36 35 36 30 32 Z', C.pinkL) + K.hiE(38, 21, 4, 2) +
        K.dots([[45, 20], [50, 25], [41, 28]], 1, C.white) +
        P('M7 40 C7 28 14 23 22 23 C31 23 38 28 38 40 C32 45 13 45 7 40 Z', C.white) +
        E(22.5, 38, 13, 5.5, C.white, 0, 2) + E(22.5, 38, 8.5, 3.6, C.choc, 0, 1.5) + K.dots([[20, 37], [25, 39]], 1, C.brownL) +
        K.hiE(15, 28, 4, 2) + K.dots([[27, 27], [31, 31], [12, 33]], 1, C.greyL)),
    // green matcha latte in a mug with milk-foam leaf art
    matcha_latte: () =>
      K.glass(C.leaf, 'mug',
        P('M21 18 C24 15.5 34 15.5 39 18 C34 20.5 24 20.5 21 18 Z', C.leafL, 1.2) + K.line('M22 18 H38', 1.2, C.leafD) +
        leaf(30, 38, -35, C.leaf, 2) + K.line('M24 41 L36 35', 1.3, C.leafD)),
    // thick white udon in amber dashi, kamaboko and scallion
    kake_udon: () =>
      K.steam(32, 12) +
      K.bowl(
        noodles('M11 30 C16 26 20 33 25 28 C29 24 33 32 38 28 C42 25 47 31 53 28', C.white, 3.6) +
        noodles('M15 34 C19 31 24 35 29 32 C33 30 37 35 43 33', C.white, 3.6) +
        P('M33 25 C33 20 43 20 43 25 Z', C.white, 1.8) + K.line('M34.5 24.5 C35 21.8 41 21.8 41.5 24.5', 2, C.pink) +
        rings([[20, 25], [24, 30], [47, 25], [50, 31], [16, 31]]),
        C.blue, C.wheat),
    // grey-brown soba heaped on a bamboo tray, nori strips, dipping cup
    zaru_soba: () =>
      K.board(
        K.line('M12 47 L52 34 M20 50 L57 37 M8 44 L48 31', 1.2, C.wood) +
        P('M12 40 C12 31 20 25 30 25 C40 25 48 30 48 37 C42 44 18 45 12 40 Z', C.brownL) +
        noodles('M15 37 C19 32 23 39 27 33 C31 28 35 37 39 31 C42 28 45 34 46 36 M18 32 C22 28 26 33 30 29 C34 26 38 31 42 29', C.greyL, 1.2) +
        K.line('M22 28 l4 -2 M29 25 l5 0 M36 27 l4 1 M28 30 l4 -1', 2.4, C.black) +
        `<path d="M43 40 L45 52 C45 54 55 54 55 52 L57 40 Z" fill="${C.blue}"/>` + E(50, 40, 7, 2.6, C.choc, 0, 2) +
        K.line('M46 46 H54', 1.3, C.blueL)),
    // two skewers of glazed chicken and leek
    yakitori: () => {
      const stick = (y) =>
        K.line(`M6 ${y + 14} L58 ${y - 10}`, 3.5) + K.line(`M6 ${y + 14} L58 ${y - 10}`, 1.5, C.woodL) +
        [[17, y + 9, C.brown], [25, y + 5, C.leafL], [33, y + 1.5, C.brown], [41, y - 2, C.leafL], [49, y - 6, C.brown]].map(([x, yy, f]) =>
          f === C.brown ? R(x, yy, 9, 9, f, -25, 2.2, 3) + K.hiE(x - 2, yy - 2, 2, 1, -25) : R(x, yy, 6, 8, f, -25, 1.8, 2) + E(x, yy - 0.5, 1.5, 3, C.creamL, -25, 0)).join('');
      return K.plate(stick(28) + stick(38));
    },
    // chicken simmered in egg over rice, onion and herbs
    oyakodon: () =>
      K.bowl(heap(C.yellow,
        P('M14 28 C18 25 22 27 26 25 C24 30 18 31 14 28 Z M38 22 C42 20 47 22 50 24 C46 27 41 26 38 22 Z', C.yellowL, 1.2) +
        R(22, 24, 8, 6, C.brownL, -12) + R(36, 28, 8, 6, C.brownL, 10) + R(45, 25, 7, 5.5, C.brownL, -5) +
        K.line('M28 22 C31 20 34 21 35 23 M14 32 C17 30 20 31 21 33', 1.6, C.creamL) +
        leaf(31, 21, -20, C.leaf, 1) + leaf(51, 29, 20, C.leaf, 0.9)),
        C.white, C.white),
    // thin beef and onion over rice with a heap of pink ginger
    gyudon: () =>
      K.bowl(heap(C.brown,
        K.line('M13 30 C17 25 21 31 25 26 C28 23 31 29 34 25 M23 22 C27 18 31 24 35 20 M30 30 C34 26 37 31 41 27', 3, C.brownD) +
        K.line('M16 25 C19 22 22 22 24 24 M36 27 C39 24 42 24 44 26 M18 32 C21 30 24 30 26 32', 1.8, C.creamL) +
        P('M40 22 C40 17 52 16 53 22 C53 27 41 28 40 22 Z', C.pink, 1.8) + K.line('M43 21 C45 19 48 19 50 21 M43 24 C46 22 48 22 51 24', 1.2, C.pinkD) +
        rings([[30, 22]])),
        C.white, C.white),
    // glazed grilled eel over rice in a lacquer box
    unadon: () =>
      K.shadow(27) +
      `<rect x="5" y="26" width="54" height="31" rx="4" fill="${C.black}"/>` +
      K.line('M5 49 H59', 1.5, C.redD) +
      `<rect x="5" y="14" width="54" height="26" rx="4" fill="${C.redD}"/>` +
      `<rect x="9" y="17" width="46" height="20" rx="2" fill="${C.white}" stroke-width="1.8"/>` +
      `<rect x="10.5" y="18.5" width="20" height="17" rx="3" fill="${C.brown}" stroke-width="1.8"/>` +
      `<rect x="33.5" y="18.5" width="20" height="17" rx="3" fill="${C.brown}" stroke-width="1.8"/>` +
      K.line('M14 22 L19 32 M20 21 L25 31 M37 22 L42 32 M43 21 L48 31', 1.5, C.brownD) +
      K.hiE(15, 21, 3, 1.2, 0) + K.hiE(38, 21, 3, 1.2, 0) + K.dots([[25, 24], [46, 28], [28, 30]], 1, C.leafD) +
      K.hi('M8 42 H11 V54 H8 Z'),
    // golden sea-urchin tongues on rice with nori strips and wasabi
    uni_don: () =>
      K.bowl(heap(C.white,
        K.line('M12 25 L15 31 M50 23 L53 29', 3, C.black) +
        [[20, 26, -20], [27, 23, -10], [34, 22, 5], [41, 24, 15], [30, 29, 0], [38, 30, 10], [23, 31, -10]].map(([x, y, r]) =>
          E(x, y, 5, 3, C.orangeL, r, 1.6) + K.line(`M${x - 3} ${y - 0.5} H${x + 3}`, 1, C.orange)).join('') +
        P('M44 30 C43 27 48 26 50 28 C51 31 46 32 44 30 Z', C.leaf, 1.6)),
        C.white, C.white),
    // sticky fermented beans on rice, mustard and scallion
    natto_gohan: () =>
      K.bowl(heap(C.white,
        P('M18 26 C18 20 30 18 36 20 C44 19 48 24 45 28 C40 31 22 31 18 26 Z', C.brown, 1.8) +
        [[22, 25], [27, 22.5], [32, 25.5], [37, 22], [42, 25], [27, 28], [36, 28.5], [31, 21]].map(([x, y]) => E(x, y, 2.4, 1.8, C.wheatD, 0, 1.1)).join('') +
        K.line('M24 22 C28 18 34 18 38 21 M30 27 C33 24 37 25 40 28', 1, C.creamL) +
        P('M45 21 C46 18 51 18 51 21 C50 23 46 23 45 21 Z', C.yellow, 1.6) +
        rings([[14, 30], [48, 30], [22, 31]])),
        C.white, C.white),
    // ---------- Korean ----------
    // stone bowl of rice topped with vegetables, beef and a fried egg
    bibimbap: () =>
      K.bowl(heap(C.white,
        P('M10 29 C10 24 16 21 22 21 L27 27 L17 31 Z', C.leafD, 1.5) +
        K.line('M24 20 l3 6 M28 19.5 l2 6 M32 19 l0 6', 2.6, C.orange) + K.line('M24 20 l3 6 M28 19.5 l2 6 M32 19 l0 6', 0, C.orange) +
        P('M36 19 C44 19 50 21 54 27 L44 28 L37 25 Z', C.brownD, 1.5) +
        K.line('M44 30 C47 31 50 30 52 28 M41 32 C44 33 48 33 51 31', 1.8, C.creamL) +
        K.line('M11 31 C14 33 17 33 20 32', 1.8, C.creamL) +
        P('M22 29 C20 24 27 21 33 22 C40 22 44 26 41 30 C37 33 25 33 22 29 Z', C.white, 1.8) +
        `<circle cx="31.5" cy="26.5" r="3.6" fill="${C.yellow}" stroke-width="1.5"/>` + K.hiE(30.5, 25.5, 1.2, 0.7) +
        E(45, 23, 2.6, 1.6, C.red, 0, 1.2)),
        C.greyD, C.white),
    // red kimchi stew bubbling in an earthenware pot, tofu and pork
    kimchi_jjigae: () =>
      K.steam(32, 12) +
      K.pot(
        P('M13 26 C13 21 20 19 24 22 C23 25 18 28 13 26 Z', C.red, 1.6) + P('M40 22 C44 18 51 21 50 25 C47 27 42 26 40 22 Z', C.redL, 1.6) +
        cube(27, 24, 3.5, C.white, C.creamD) + cube(36, 26, 3.5, C.white, C.creamD) +
        R(46, 27, 8, 3, C.pinkL, 10, 1.4, 1) + rings([[20, 26], [32, 21], [43, 21]]),
        C.choc),
    // marinated beef slices on a lettuce leaf with sesame and scallion
    bulgogi: () =>
      K.plate(
        P('M7 40 C5 33 9 28 14 30 C14 24 22 22 26 25 C30 20 38 21 40 25 C45 22 53 25 52 30 C58 31 59 39 55 42 C46 47 16 47 7 40 Z', C.leafL) +
        K.line('M12 36 C20 34 28 36 34 33 C40 30 46 32 52 33', 1.3, C.leaf) +
        K.line('M14 38 C18 33 22 39 26 34 C29 30 33 37 37 32 C40 29 44 35 49 31 M18 30 C22 26 26 31 30 27 C33 24 37 29 41 26', 5.5) +
        K.line('M14 38 C18 33 22 39 26 34 C29 30 33 37 37 32 C40 29 44 35 49 31 M18 30 C22 26 26 31 30 27 C33 24 37 29 41 26', 3, C.brown) +
        sesame([[22, 33], [30, 31], [38, 33], [27, 37], [44, 30], [34, 27]]) + rings([[17, 34], [45, 35], [36, 26]])),
    // sticky gochujang-glazed wings with sesame
    korean_fried_chicken: () => {
      const wing = (x, y, r) =>
        `<g transform="rotate(${r} ${x} ${y})">` +
        P(`M${x - 11} ${y - 1} C${x - 11} ${y - 6} ${x - 4} ${y - 7} ${x} ${y - 5} C${x + 4} ${y - 7} ${x + 11} ${y - 5} ${x + 11} ${y} C${x + 11} ${y + 5} ${x + 4} ${y + 6} ${x} ${y + 4} C${x - 4} ${y + 6} ${x - 11} ${y + 4} ${x - 11} ${y - 1} Z`, C.redD) +
        K.hiE(x - 5, y - 3, 3, 1.3, 0) + `</g>`;
      return K.plate(
        wing(20, 30, -20) + wing(42, 28, 15) + wing(30, 40, 5) + wing(47, 39, -25) + wing(15, 41, 30) +
        sesame([[19, 28], [24, 31], [40, 26], [45, 30], [28, 38], [33, 41], [47, 38], [15, 40]]) + rings([[31, 31], [36, 47]]));
    },
    // chewy rice-cake cylinders and fish cake in red chilli sauce
    tteokbokki: () => {
      const cake = (x, y, r) =>
        `<g transform="rotate(${r} ${x} ${y})">` + R(x, y, 16, 6.5, C.redL, 0, 2.2, 3.2) + E(x + 8, y, 2, 3.25, C.pinkL, 0, 1.4) + `</g>`;
      return K.plate(
        P('M8 40 C8 31 18 25 32 25 C46 25 56 31 56 40 C46 46 18 46 8 40 Z', C.red) +
        P('M33 28 L45 24 L43 34 Z', C.wheat, 1.8) + P('M14 34 L24 38 L14 43 Z', C.wheat, 1.8) +
        cake(22, 30, -15) + cake(38, 38, 10) + cake(28, 40, -5) + cake(47, 31, -20) +
        rings([[34, 33], [19, 38], [44, 43]]) + sesame([[26, 29], [40, 35], [31, 38]]));
    },
    // glossy glass noodles tossed with carrot, spinach and mushroom
    japchae: () => {
      const nd = 'M10 39 C14 32 18 42 22 35 C26 29 30 41 34 34 C38 28 42 40 46 33 C49 29 52 36 54 38 M13 34 C17 27 22 36 26 29 C30 24 34 32 38 27 C42 22 47 30 50 28 M16 42 C21 38 26 45 31 41 C36 37 41 44 47 40';
      return K.plate(
        P('M8 40 C8 30 19 23 32 23 C45 23 56 30 56 40 C46 46 18 46 8 40 Z', C.brownL) +
        K.line(nd, 1.3, C.creamL) +
        K.line('M17 33 l8 -3 M35 40 l7 -2 M38 27 l7 2', 2.8, C.orange) +
        P('M22 38 C24 34 30 35 30 38 C28 41 24 41 22 38 Z M41 31 C43 27 49 28 49 31 C47 34 43 34 41 31 Z', C.leafD, 1.5) +
        E(29, 29, 3.5, 2, C.brownD, -15, 1.4) + E(47, 37, 3, 1.8, C.brownD, 10, 1.4) +
        sesame([[20, 30], [33, 34], [42, 35], [26, 42], [36, 28]]) + K.hiE(18, 27, 4, 1.3, -15));
    },
    // fiery rice fried with kimchi and bacon, topped with a fried egg
    kimchi_fried_rice: () =>
      K.plate(
        P('M7 41 C7 29 19 20 32 20 C45 20 57 29 57 41 C48 47 16 47 7 41 Z', C.orange) +
        K.line('M12 37 l3 -1 M47 40 l3 -1 M51 35 l2 -2 M16 31 l3 -1 M44 30 l2 1', 1.3, C.orangeD) +
        R(14, 35, 5, 3.5, C.red, -20, 1.4, 1) + R(48, 34, 5, 3.5, C.red, 15, 1.4, 1) + R(40, 41, 5, 3, C.pinkD, 0, 1.4, 1) + R(21, 41, 5, 3, C.pinkD, 10, 1.4, 1) +
        P('M18 29 C15 22 24 17 31 19 C38 15 48 20 46 27 C49 32 41 36 33 34 C26 37 17 35 18 29 Z', C.white) +
        `<circle cx="32" cy="26.5" r="5" fill="${C.yellow}"/>` + K.hiE(30.5, 25, 1.8, 1) +
        rings([[20, 38], [44, 37]]) + sesame([[29, 38], [36, 39], [13, 40]])),
    // crisp scallion-and-seafood pancake cut into wedges
    haemul_pajeon: () =>
      K.plate(
        E(32, 37, 25, 12, C.wheat) +
        K.line('M12 35 C22 31 36 31 52 33 M13 41 C24 38 38 38 51 40 M18 30 C28 27 38 27 47 29', 4.2) +
        K.line('M12 35 C22 31 36 31 52 33 M13 41 C24 38 38 38 51 40 M18 30 C28 27 38 27 47 29', 2, C.leaf) +
        K.line('M24 26 L20 48 M42 26 L45 48', 1.5, C.wheatD) +
        P('M30 38 C27 35 30 32 34 33 C36 34 36 37 34 38', C.orangeL, 1.6) +
        `<circle cx="17" cy="38" r="2.6" fill="${C.creamL}" stroke-width="1.5"/><circle cx="46" cy="36" r="2.6" fill="${C.creamL}" stroke-width="1.5"/>` +
        K.hiE(18, 31, 4, 1.4, -10)),
  });
})(FSI);
