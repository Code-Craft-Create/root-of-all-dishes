// Dishes group 4, part 2: Mexican and Latin American dishes (see assets/STYLE.md, reference buttered_toast).
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


  const chip = (x, y, rot, fill = C.yellow) => G(x, y, rot, 1, `<path d="M-7 4 L0 -8 L7 4 Z" fill="${fill}" stroke-width="1.8"/>` + K.dots([[-1, -1], [2, 1.5]], 0.7, C.yellowD));
  const taco = (x, y) => G(x, y, 0, 1,
    `<path d="M-21 2 C-21 -11 21 -11 21 2 Z" fill="${C.wheat}"/>` +
    `<rect x="-17" y="-9" width="9" height="8" rx="2.5" fill="${C.orange}" stroke-width="1.7"/><rect x="-7" y="-12" width="9" height="8" rx="2.5" fill="${C.redL}" stroke-width="1.7"/>` +
    `<rect x="5" y="-10" width="8" height="7" rx="1.5" fill="${C.yellow}" stroke-width="1.7"/>` +
    leaf(-5, -8, -70, C.leaf, 9) + leaf(12, -7, -30, C.leaf, 9) + K.dots([[-10, -2], [1, -4], [15, -2]], 1.5, C.white) +
    `<path d="M-22 -1 C-22 18 22 18 22 -1 C13 4 -13 4 -22 -1 Z" fill="${C.wheatL}"/>` +
    K.dots([[-12, 7], [-3, 10], [8, 8], [14, 4]], 1.2, C.wheatD) + K.hi('M-18 4 C-16 9 -12 11 -8 12 L-9 10 C-13 8 -15 5 -15 3 Z'));

  FSI.add('dishes_4', {
    // Two corn tortilla tacos with red-marinated pork, pineapple, cilantro and onion.
    tacos_al_pastor: () => K.shadow(28) + taco(24, 29) + taco(39, 44),

    // Mashed avocado in a stone molcajete with tomato, onion and tortilla chips.
    guacamole: () => chip(18, 18, -20) + chip(43, 17, 25) + K.bowl(
      P('M10 30 C12 21 22 18 32 18 C43 18 52 21 54 30 C46 33 18 33 10 30 Z', C.leaf, 1.8) +
      K.dots([[24, 24], [38, 23], [30, 28], [45, 27]], 1.6, C.red) + K.dots([[19, 27], [34, 21], [41, 29]], 1.4, C.white) +
      leaf(26, 21, -30, C.leafD, 7) + K.hiE(22, 22, 3, 1.4),
      C.greyD, C.leafL),

    // Tortilla chips heaped on a plate under melted cheese, jalapenos and sour cream.
    nachos: () => K.plate(
      chip(14, 38, -60) + chip(50, 38, 60) + chip(22, 30, -20) + chip(42, 29, 15) + chip(32, 26, 5) + chip(20, 44, 160) + chip(44, 45, 190) + chip(32, 46, 180) +
      P('M14 36 C18 30 27 33 32 31 C38 29 46 32 50 37 C47 41 44 38 41 42 C37 46 34 40 31 43 C27 46 24 40 20 42 C16 43 13 40 14 36 Z', C.orange, 1.8) +
      K.hi('M20 34 C24 33 27 34 30 33 C27 35 23 36 20 36 Z') +
      O(25, 36, 3.2, C.leaf, 1.5) + O(25, 36, 1.4, C.leafL, 0) + O(42, 37, 3.2, C.leaf, 1.5) + O(42, 37, 1.4, C.leafL, 0) +
      P('M30 31 C28 27 32 24 35 26 C38 26 38 30 36 32 C34 33 31 33 30 31 Z', C.white, 1.6) + K.dots([[35, 40], [19, 39]], 1.6, C.red)),

    // Rolled corn tortillas under red chili sauce, crumbled cotija and crema.
    chicken_enchiladas: () => K.plate(
      [[22, 32], [30, 39], [38, 46]].map(([x, y]) => G(x, y, -20, 1, `<rect x="-17" y="-5.5" width="34" height="11" rx="5.5" fill="${C.wheatL}"/>`)).join('') +
      P('M17 33 C21 28 28 26 33 26 C39 25 43 28 44 31 C47 36 45 42 42 46 C38 50 32 51 28 50 C23 49 19 45 21 42 C17 41 15 37 17 33 Z', C.red) +
      K.sh('M41 30 C45 34 45 41 42 45 C39 48 35 50 31 50 C37 46 41 40 41 30 Z') +
      K.line('M21 40 C24 36 27 42 30 37 C33 32 36 38 40 33', 2, C.creamL) +
      K.dots([[24, 34], [29, 31], [35, 30], [39, 40], [33, 44], [26, 45], [41, 36]], 1.6, C.white) + leaf(30, 37, -20, C.leaf, 7)),

    // Foil-wrapped flour tortilla burrito, cut end showing rice, beans, beef and salsa.
    beef_burrito: () => K.shadow(25) + G(31, 35, -28, 1,
      `<path d="M-6 -12 H-20 C-27 -12 -29 -6 -29 0 C-29 6 -27 12 -20 12 H-6 Z" fill="${C.steel}"/>` +
      K.line('M-24 -8 L-20 -3 L-24 2 M-15 -10 L-12 -4 L-16 4 L-12 9', 1.3, C.greyD) +
      `<path d="M-8 -12 H18 V12 H-8 C-5 6 -11 0 -6 -5 C-9 -8 -7 -10 -8 -12 Z" fill="${C.cream}"/>` +
      K.line('M2 -12 C0 -4 4 4 2 12', 1.4, C.creamD) + K.dots([[-2, -6], [8, 5], [10, -8], [-3, 7]], 1.2, C.wheatD) +
      `<ellipse cx="18" cy="0" rx="7" ry="12" fill="${C.creamL}"/>` +
      `<path d="M16 -8 C21 -9 23 -4 22 0 C20 1 17 -1 15 -3 Z" fill="${C.leafL}" stroke-width="1.3"/>` +
      `<path d="M14 0 C18 -1 22 1 22 5 C20 8 16 8 14 5 Z" fill="${C.brown}" stroke-width="1.3"/>` +
      K.dots([[19, -3], [17, 9], [21, -6]], 1.4, C.red) + K.dots([[16, 3], [19, 4]], 1, C.brownD) +
      K.hi('M-6 -9 H14 V-7 H-6 Z')),

    // Folded flour tortilla wedges, grill-marked, oozing cheese.
    quesadillas: () => K.plate(
      [[0, 0], [17, 6]].map(([dx, dy]) => G(dx, dy, 0, 1,
        P('M11 43 L33 26 C38 32 40 39 38 46 Z', C.yellow, 1.6) +
        P('M9 41 L31 24 C36 30 38 37 36 44 Z', C.cream) +
        K.line('M18 38 L32 31 M21 42 L34 37 M28 30 L35 27', 1.6, C.wheatD) +
        K.dots([[24, 44.5], [30, 45.3]], 1.4, C.leaf) + K.dots([[27, 45], [35, 37]], 1.3, C.red))).join('') +
      K.hi('M14 39 L28 28 L29 30 L16 40 Z')),

    // Turkey leg coated in dark chocolate-chili mole with sesame, beside rice.
    mole_poblano: () => K.plate(
      P('M34 30 C34 23 42 20 49 22 C55 24 57 30 55 35 C52 38 42 38 37 37 C35 35 34 33 34 30 Z', C.white) +
      K.dots([[40, 27], [46, 25], [50, 30], [44, 32]], 0.9, C.greyD) +
      P('M8 40 C7 34 14 30 22 32 C28 33 34 36 40 39 C44 37 49 39 48 43 C51 45 48 49 45 47 C42 48 39 46 39 44 C33 46 26 49 19 49 C12 49 9 45 8 40 Z', C.choc) +
      `<path d="M40 39 C44 37 49 39 48 43 C51 45 48 49 45 47 C42 48 39 46 39 44" fill="${C.creamL}" stroke-width="1.8"/>` +
      K.hi('M13 37 C16 34 22 34 26 35 C21 36 16 37 14 39 Z') +
      K.dots([[18, 42], [24, 39], [29, 44], [14, 44], [33, 40], [21, 46]], 1, C.creamL)),

    // Batter-fried poblano pepper on tomato sauce.
    chiles_rellenos: () => K.plate(
      P('M8 40 C7 32 18 28 32 28 C46 28 57 32 56 40 C55 47 45 50 32 50 C19 50 9 47 8 40 Z', C.red, 1.8) +
      K.sh('M50 36 C54 40 53 46 46 48 C40 50 34 50 30 50 C42 47 50 44 50 36 Z') +
      P('M12 40 C11 33 19 29 28 30 C36 30 42 32 47 30 C51 33 50 40 44 44 C38 48 28 48 20 47 C15 46 12 44 12 40 Z', C.wheatL) +
      P('M18 36 C22 33 28 34 32 35 C29 38 24 37 20 39 Z', C.leaf, 1.2) +
      K.dots([[16, 42], [24, 44], [33, 43], [40, 40], [38, 35]], 1.3, C.wheat) +
      tube('M47 31 C49 27 51 25 55 24', C.leafD, 2.4) + K.hi('M16 35 C19 32 24 32 27 32 C23 33 19 35 17 37 Z')),

    // Corn-husk tamales, one opened to show masa and red pork filling.
    tamales: () => K.plate(
      G(26, 33, -15, 1,
        P('M-20 0 C-14 -8 10 -9 22 -4 C24 -2 24 2 22 4 C10 9 -14 8 -20 0 Z', C.wheat) +
        K.line('M-14 -2 C-4 -3 8 -3 18 -1 M-14 2 C-4 3 8 3 18 1', 1.2, C.wheatD) +
        `<rect x="10" y="-6" width="3.5" height="12" rx="1" fill="${C.woodL}" stroke-width="1.5"/>`) +
      G(34, 44, -10, 1,
        P('M-22 0 C-16 -11 12 -11 24 -3 C26 -1 26 2 24 4 C12 11 -16 11 -22 0 Z', C.wheatL) +
        P('M-12 0 C-9 -6 8 -7 14 -2 C15 0 14 3 12 4 C6 7 -9 6 -12 0 Z', C.yellowL, 1.8) +
        P('M-6 0 C-3 -2 5 -2 8 0 C5 2 -3 2 -6 0 Z', C.red, 1.3) +
        K.line('M-18 4 C-12 7 -2 8 6 7', 1.2, C.wheat))),

    // Red pork and hominy stew topped with radish, cabbage and lime.
    pozole_rojo: () => K.steam(32, 9) + K.bowl(
      O(17, 27, 4, C.creamL, 1.6) + O(25, 31, 4, C.creamL, 1.6) + O(44, 31, 4, C.creamL, 1.6) + O(37, 33, 3.6, C.creamL, 1.6) +
      `<rect x="31" y="22" width="11" height="8" rx="3" fill="${C.brownL}" stroke-width="1.6"/>` +
      tube('M18 21 C21 18 25 20 28 18 M22 24 C25 22 28 24 31 22', C.leafL, 1.6) +
      O(48, 25, 4.5, C.red, 1.5) + O(48, 25, 2.8, C.white, 0) + O(12, 33, 4, C.red, 1.5) + O(12, 33, 2.4, C.white, 0) + lime(52, 33, 200),
      C.white, C.red),

    // Lime-cured raw fish with red onion, cilantro, sweet potato and corn.
    ceviche: () => K.bowl(
      [[18, 26], [29, 23], [40, 25], [24, 31], [35, 31]].map(([x, y]) => `<rect x="${x - 5}" y="${y - 4}" width="10" height="8" rx="2.5" fill="${C.white}" stroke-width="1.7"/>`).join('') +
      tube('M13 30 C15 26 19 24 22 25 M41 32 C43 28 47 27 50 28', C.purple, 1.8) +
      leaf(31, 20, -50, C.leaf, 8) + leaf(45, 22, -150, C.leaf, 8) +
      E(52, 26, 5, 3.6, C.orange, 1.6) + E(52, 26, 2.8, 1.8, C.orangeL, 0) + K.dots([[11, 27], [14, 24]], 1.6, C.yellow),
      C.white, C.creamL),

    // Milk-soaked sponge cake slice with cream and cinnamon in a pool of milk.
    tres_leches_cake: () => K.plate(
      E(32, 42, 22, 8, C.creamL, 1.6) +
      P('M14 28 L38 21 L52 27 L28 34 Z', C.white) +
      P('M14 28 L28 34 V48 L14 42 Z', C.wheatL) + P('M28 34 L52 27 V41 L28 48 Z', C.wheatL) +
      P('M14 28 L28 34 L52 27 V31 L28 38 L14 32 Z', C.white) +
      K.sh('M28 38 L52 31 V41 L28 48 Z') +
      K.dots([[24, 27], [30, 25], [36, 27], [42, 25], [28, 29.5]], 0.9, C.brown) +
      `<path d="M30 23 C30 19 36 18 37 22 C38 25 31 26 30 23 Z" fill="${C.white}" stroke-width="1.6"/>` + O(34, 18, 2.8, C.red, 1.5)),

    // Grilled corn on a stick with mayo, cotija, chili powder and lime.
    elote: () => K.shadow(24) + tube('M13 56 L22 46', C.woodL, 2.5) + G(34, 30, -40, 1,
      `<path d="M-22 0 C-22 -8 -14 -10 0 -10 C14 -10 22 -6 24 0 C22 6 14 10 0 10 C-14 10 -22 8 -22 0 Z" fill="${C.yellow}"/>` +
      K.line('M-16 -5 V5 M-10 -8 V8 M-4 -9 V9 M2 -9 V9 M8 -9 V9 M14 -7 V7 M19 -5 V5 M-20 -3 H22 M-20 3 H22', 1, C.yellowD) +
      K.dots([[-12, -4], [-6, 2], [0, -5], [6, 4], [12, -2], [16, 3], [-16, 2], [3, -1]], 1.7, C.white) +
      K.dots([[-9, -1], [-2, 6], [4, -6], [9, 1], [15, -4], [-14, -6], [18, 1]], 1, C.red) +
      K.hi('M-14 -7 C-6 -8 4 -8 10 -7 L10 -6 C2 -6 -6 -6 -14 -5 Z')) + lime(50, 48, -10),

    // Black bean and pork stew in a clay pot with sausage and an orange slice.
    feijoada: () => K.steam(30, 9) + K.pot(
      P('M10 26 C12 20 22 18 32 18 C42 18 52 20 54 26 C46 30 18 30 10 26 Z', C.black) +
      K.dots([[16, 25], [22, 22], [28, 26], [41, 22], [47, 25], [35, 27]], 1.4, C.purpleD) +
      O(22, 24, 4, C.meat, 1.6) + O(22, 24, 2, C.meatL, 0) + O(38, 22, 4, C.meat, 1.6) + O(38, 22, 2, C.meatL, 0) +
      `<rect x="27" y="17" width="8" height="6" rx="2" fill="${C.pinkL}" stroke-width="1.5"/>` +
      G(53, 22, 0, 1, `<path d="M-7 0 A7 7 0 0 1 7 0 Z" fill="${C.orange}" stroke-width="1.8"/><path d="M-4.5 -0.5 A4.5 4.5 0 0 1 4.5 -0.5 Z" fill="${C.orangeL}" stroke="none"/>` + K.line('M0 -1 V-5 M-2.5 -1 L-3.5 -4 M2.5 -1 L3.5 -4', 1, C.orangeD)),
      C.terracotta),

    // Little golden cheese bread rolls.
    pao_de_queijo: () => K.shadow(25) +
      [[20, 31, 10], [43, 31, 10], [31, 24, 9], [15, 46, 10.5], [32, 45, 11], [49, 46, 10.5]].map(([x, y, r]) =>
        O(x, y, r, C.wheat) + P(`M${x - r * 0.6} ${y - r * 0.45} C${x - r * 0.2} ${y - r * 0.9} ${x + r * 0.5} ${y - r * 0.8} ${x + r * 0.7} ${y - r * 0.3} C${x + r * 0.3} ${y - r * 0.1} ${x - r * 0.3} ${y - r * 0.1} ${x - r * 0.6} ${y - r * 0.45} Z`, C.wheatL, 1.3) +
        K.line(`M${x - r * 0.2} ${y - r * 0.55} L${x + r * 0.1} ${y - r * 0.3}`, 1.1, C.wheatD) + K.dots([[x + r * 0.3, y + r * 0.4]], 0.8, C.wheatD)).join('') +
      K.hiE(28, 41, 3, 1.5),

    // Chocolate fudge balls with sprinkles in paper cups.
    brigadeiros: () => K.shadow(26) +
      [[32, 26, C.red], [18, 42, C.yellow], [46, 42, C.pink]].map(([x, y, cup]) =>
        P(`M${x - 11} ${y + 1} L${x - 8} ${y + 13} H${x + 8} L${x + 11} ${y + 1} Z`, cup) +
        K.line(`M${x - 5} ${y + 2} L${x - 4} ${y + 12} M${x} ${y + 2} V${y + 12} M${x + 5} ${y + 2} L${x + 4} ${y + 12}`, 1.2, C.ink) +
        O(x, y - 2, 10, C.choc) + K.hiE(x - 4, y - 6, 3, 1.6) +
        K.line(`M${x - 3} ${y - 8} l2 1 M${x + 3} ${y - 6} l1 2 M${x - 5} ${y} l2 -1 M${x + 4} ${y + 1} l-1 2 M${x} ${y - 2} l2 0`, 1.3, C.brownL)).join(''),

    // Baked half-moon pastries with a twisted crimped edge.
    empanadas: () => K.shadow(26) +
      [[24, 30], [38, 44]].map(([x, y]) => G(x, y, 0, 1,
        P('M-21 6 C-22 -9 -10 -16 0 -16 C10 -16 22 -9 21 6 C12 10 -12 10 -21 6 Z', C.wheat) +
        P('M-17 4 C-17 -7 -8 -12 0 -12 C8 -12 17 -7 17 4 C10 6 -10 6 -17 4 Z', C.wheatL, 0) +
        K.line('M-19 2 L-16 0 M-19 -4 L-15 -4 M-16 -9 L-13 -7 M-11 -13 L-9 -10 M-5 -15 L-4 -12 M1 -15.5 V-12 M7 -14.5 L6 -11.5 M12 -12 L10 -9.5 M16 -8 L13.5 -6 M19 -3 L16 -2 M20 2 L17 2', 1.4, C.wheatD) +
        K.hi('M-11 -4 C-9 -8 -4 -10 0 -10 C-4 -8 -8 -5 -9 -2 Z') + K.dots([[4, 1], [-5, 3]], 0.9, C.wheatD))).join(''),

    // Grilled cross-cut short ribs and chorizo on a board, with chimichurri.
    asado_with_chimichurri: () => K.board(
      G(26, 39, -18, 1,
        `<rect x="-20" y="-6" width="40" height="12" rx="3" fill="${C.brown}"/>` +
        [-13, 0, 13].map((x) => E(x, 0, 3.2, 2.4, C.creamL, 1.5)).join('') +
        K.line('M-8 -6 L-5 6 M5 -6 L8 6 M16 -6 L19 6', 1.5, C.brownD) + K.hi('M-18 -4 H10 V-2.5 H-18 Z')) +
      G(40, 46, -18, 1, `<rect x="-12" y="-3.5" width="24" height="7" rx="3.5" fill="${C.red}"/>` + K.line('M-6 -3 V3 M4 -3 V3', 1.3, C.redD) + K.hi('M-9 -2 H4 V-1 H-9 Z')) +
      E(48, 26, 9, 5, C.white) + E(48, 25.5, 6.5, 3.2, C.leaf, 0) + K.dots([[45, 25], [50, 26], [48, 24]], 0.9, C.red) + K.dots([[46, 27], [51, 24.5]], 0.8, C.leafD)),

    // Split corn arepa stuffed with creamy avocado chicken salad.
    arepas_reina_pepiada: () => K.shadow(25) +
      P('M9 40 V45 C9 51 55 51 55 45 V40 Z', C.wheatL) + K.sh('M46 41 H55 V45 C55 48 51 49.5 46 50 Z') +
      K.dots([[16, 46], [26, 48], [40, 48], [48, 45]], 1.2, C.wheatD) +
      P('M6 38 C5 30 14 27 20 30 C24 26 33 27 36 29 C41 26 52 26 56 31 C60 35 58 41 53 41 C42 44 22 44 11 42 C8 42 6 40 6 38 Z', C.leafL) +
      `<rect x="13" y="32" width="7" height="5" rx="1.6" fill="${C.creamL}" stroke-width="1.4"/><rect x="34" y="35" width="7" height="5" rx="1.6" fill="${C.creamL}" stroke-width="1.4"/>` +
      K.dots([[27, 37], [46, 35], [22, 39]], 1.3, C.leaf) +
      P('M14 30 C13 21 22 15 32 15 C43 15 51 21 50 29 C50 32 44 33 32 33 C20 33 14 32 14 30 Z', C.wheatL) +
      K.dots([[24, 21], [32, 19], [40, 22], [28, 26], [44, 27]], 1.4, C.wheatD) + K.hiE(22, 21, 4.5, 2),

    // Peruvian stir-fried beef with tomato, red onion and fries.
    lomo_saltado: () => K.plate(
      [[12, 44, -30], [17, 47, -10], [46, 46, 20], [52, 42, 40], [22, 48, 15]].map(([x, y, r]) =>
        `<rect x="${x - 2}" y="${y - 8}" width="4" height="16" rx="1" fill="${C.yellow}" stroke-width="1.6" transform="rotate(${r} ${x} ${y})"/>`).join('') +
      [[22, 33, -20], [34, 30, 10], [30, 39, -35], [42, 37, 15], [18, 39, 25]].map(([x, y, r]) =>
        `<rect x="${x - 7}" y="${y - 3}" width="14" height="6" rx="2.5" fill="${C.brown}" stroke-width="1.8" transform="rotate(${r} ${x} ${y})"/>`).join('') +
      P('M38 27 C40 22 47 22 49 27 Z', C.red, 1.6) + P('M24 43 C26 38 33 38 35 43 Z', C.red, 1.6) +
      tube('M44 32 C47 30 50 31 52 33 M12 33 C14 30 17 30 19 31', C.purple, 1.8) + K.dots([[30, 34], [37, 41], [27, 28]], 1.2, C.leaf)),

    // Cornstarch sandwich cookies with dulce de leche, rolled in coconut.
    alfajores: () => K.shadow(25) +
      [[22, 28], [36, 42]].map(([x, y]) =>
        P(`M${x - 18} ${y} V${y + 9} C${x - 18} ${y + 15} ${x + 18} ${y + 15} ${x + 18} ${y + 9} V${y} Z`, C.wheatL) +
        P(`M${x - 18} ${y + 3} C${x - 18} ${y + 9} ${x + 18} ${y + 9} ${x + 18} ${y + 3} V${y + 7} C${x + 18} ${y + 13} ${x - 18} ${y + 13} ${x - 18} ${y + 7} Z`, C.orangeD, 1.6) +
        K.dots([[x - 13, y + 7.5], [x - 6, y + 9.5], [x + 1, y + 10], [x + 8, y + 9.5], [x + 14, y + 7.5]], 1.1, C.white) +
        E(x, y, 18, 6, C.wheatL) + K.dots([[x - 8, y - 1], [x - 2, y + 2], [x + 5, y - 2], [x + 10, y + 1], [x + 1, y - 3.5], [x - 12, y + 1.5]], 1.1, C.white) + K.hiE(x - 7, y - 1.5, 4, 1.6, -5) + K.sh(`M${x + 12} ${y + 10} C${x + 16} ${y + 9} ${x + 18} ${y + 7} ${x + 18} ${y + 3} V${y + 9} C${x + 18} ${y + 12} ${x + 15} ${y + 13} ${x + 10} ${y + 14} Z`)).join(''),

    // Tortilla chips in green salsa topped with a fried egg, crema and cotija.
    chilaquiles: () => K.plate(
      chip(14, 38, -60, C.wheatL) + chip(50, 38, 60, C.wheatL) + chip(22, 46, 170, C.wheatL) + chip(42, 46, 190, C.wheatL) +
      P('M10 39 C10 31 20 27 32 27 C45 27 54 31 54 39 C53 45 45 49 32 49 C19 49 11 45 10 39 Z', C.leaf) +
      chip(18, 33, -30, C.wheatL) + chip(46, 34, 30, C.wheatL) +
      egg(31, 35, 1.15) + K.line('M15 43 C19 40 22 45 26 42 M38 44 C41 41 45 45 49 41', 2, C.white) +
      K.dots([[21, 39], [42, 39], [33, 45]], 1.5, C.white)),

    // Caramelised sweet plantain slices.
    fried_plantains: () => K.plate(
      [[16, 37, -25], [28, 32, -25], [41, 32, -25], [22, 46, -25], [35, 44, -25], [48, 41, -25]].map(([x, y, r]) =>
        E(x, y, 8.5, 5.2, C.orangeD, 1.9, r) + E(x - 0.5, y - 0.5, 6, 3.2, C.orange, 0, r) + K.hiE(x - 3, y - 2, 2.2, 1, r)).join('') +
      K.dots([[30, 40], [44, 38], [20, 42]], 0.8, C.white)),

    // Brazilian picanha slices curled on a skewer.
    churrasco: () => K.shadow(18) + G(32, 31, 15, 1,
      `<path d="M0 -27 V27" stroke="${C.ink}" stroke-width="5"/><path d="M0 -27 V27" stroke="${C.steel}" stroke-width="2.4"/>` +
      `<rect x="-2.5" y="22" width="5" height="9" rx="1.5" fill="${C.woodD}"/>` +
      [-14, 0, 14].map((y) =>
        P(`M-16 ${y + 6} C-16 ${y - 8} 16 ${y - 8} 16 ${y + 6} L10 ${y + 6} C10 ${y - 2} -10 ${y - 2} -10 ${y + 6} Z`, C.meat) +
        P(`M-16 ${y + 6} C-16 ${y - 8} 16 ${y - 8} 16 ${y + 6} L13 ${y + 6} C13 ${y - 5} -13 ${y - 5} -13 ${y + 6} Z`, C.fat, 1.4) +
        K.line(`M-9 ${y - 3} L-6 ${y - 1} M5 ${y - 3} L8 ${y - 1}`, 1.2, C.meatD)).join('') +
      K.hi('M-12 -16 C-9 -19 -4 -20 0 -20 C-4 -19 -8 -17 -10 -14 Z')),
  });
})(FSI);
