// Bakery group, part 2: breads, doughs and crumbs (each bread drawn by its shape).
(function (FSI) {
  const { C, K } = FSI;
  // Tin loaf in 3/4 view: cut end at front-left showing the crumb, body receding to the upper right.
  const tinLoaf = (crust, crumb, extra = '', crumbDetail = '') =>
    K.shadow(26, 57, 31) +
    `<path d="M14 21 C16 17 19 16 22 16 L42 9 C51 8 58 13 58 21 V47 C58 50 57 51 55 52 L32 57 H12 Z" fill="${crust}"/>` +
    K.hi('M24 18 L42 11.5 C46 11 49 12 51 13.5 L26 21 Z') + K.sh('M56 22 C57 30 57 40 56 50 L34 56 L36 52 L54 47 Z') + extra +
    `<path d="M6 33 C6 24 12 20 20 20 C28 20 34 24 34 33 V55 C34 56.5 33 57 31.5 57 H8.5 C7 57 6 56.5 6 55 Z" fill="${crust}"/>` +
    `<path d="M9.5 33.5 C9.5 26.5 14 23.5 20 23.5 C26 23.5 30.5 26.5 30.5 33.5 V53.5 H9.5 Z" fill="${crumb}" stroke="none"/>` + crumbDetail;
  // Oval loaf on its shadow with slashes.
  const ovalLoaf = (crust, cut, extra = '') =>
    K.shadow(26) +
    `<path d="M5 44 C5 31 17 22 32 22 C47 22 59 31 59 44 C59 52 50 57 32 57 C14 57 5 52 5 44 Z" fill="${crust}"/>` +
    K.sh('M52 32 C57 38 58 46 54 51 C49 55 40 56.5 30 56.8 C46 54 54 47 52 32 Z') + extra +
    [[19, 36], [32, 33], [45, 36]].map(([x, y]) => `<path d="M${x - 5} ${y + 6} C${x - 4} ${y} ${x + 1} ${y - 5} ${x + 5} ${y - 6} C${x + 4} ${y} ${x - 1} ${y + 5} ${x - 5} ${y + 6} Z" fill="${cut}" stroke-width="1.6"/>`).join('');
  const cube = (x, y, s = 1) =>
    `<path d="M${x} ${y - 7 * s} L${x + 7 * s} ${y - 4 * s} L${x} ${y - 1 * s} L${x - 7 * s} ${y - 4 * s} Z" fill="${C.wheatL}" stroke-width="2"/>` +
    `<path d="M${x - 7 * s} ${y - 4 * s} L${x} ${y - 1 * s} V${y + 7 * s} L${x - 7 * s} ${y + 4 * s} Z" fill="${C.wheat}" stroke-width="2"/>` +
    `<path d="M${x + 7 * s} ${y - 4 * s} L${x} ${y - 1 * s} V${y + 7 * s} L${x + 7 * s} ${y + 4 * s} Z" fill="${C.wheatD}" stroke-width="2"/>` +
    K.dots([[x - 2 * s, y - 4 * s], [x + 2 * s, y - 3 * s]], 0.7, C.wheatD);
  // Stack of flat discs (tortillas, wrappers) in 3/4 view.
  const discStack = (fill, edge, spots, n = 3) => {
    let m = K.shadow(26, 57);
    for (let i = n - 1; i >= 0; i--) {
      const y = 36 + i * 5;
      m += `<ellipse cx="32" cy="${y + 2}" rx="27" ry="12" fill="${edge}"/><ellipse cx="32" cy="${y}" rx="27" ry="12" fill="${fill}"/>`;
    }
    return m + K.hiE(20, 31, 7, 2.5, -10) + spots;
  };
  const spots = (pts, fill, rx = 2.2) => pts.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.65}" fill="${fill}" stroke="none"/>`).join('');

  FSI.add('bakery', {
    bread_loaf: () => ovalLoaf(C.wheatD, C.wheatL, K.hi('M14 32 C18 27 24 25 28 25 C22 28 18 31 16 35 Z')),
    sourdough_bread: () =>
      K.shadow(25) +
      `<path d="M7 43 C7 27 18 17 32 17 C46 17 57 27 57 43 C57 52 47 57 32 57 C17 57 7 52 7 43 Z" fill="${C.brown}"/>` +
      `<path d="M12 33 C16 25 23 21 32 21 C41 21 48 25 52 33 C46 30 40 29 32 29 C24 29 18 30 12 33 Z" fill="${C.creamD}" stroke="none"/>` +
      K.sh('M50 30 C56 38 56 48 50 53 C45 56 38 57 32 57 C44 53 52 45 50 30 Z') +
      `<path d="M14 42 C20 34 34 30 50 36 C46 38 36 37 28 40 C22 42 18 44 14 42 Z" fill="${C.wheatL}" stroke-width="1.8"/>` +
      K.line('M17 41 C24 37 34 35 46 36.5', 1.4, C.wheatD) +
      K.dots([[20, 27], [28, 24], [38, 25], [44, 28], [24, 50], [40, 51]], 1, C.creamL),
    rye_bread: () =>
      K.shadow(26) +
      `<path d="M5 44 C5 31 17 22 32 22 C47 22 59 31 59 44 C59 52 50 57 32 57 C14 57 5 52 5 44 Z" fill="${C.brownD}"/>` +
      `<path d="M10 36 C16 28 24 25 32 25 C42 25 50 29 54 36 C46 33 40 32 32 32 C24 32 16 33 10 36 Z" fill="${C.brown}" stroke="none"/>` +
      K.line('M14 38 L20 34 L24 39 L30 34 L35 39 L41 34 L45 38 L50 35 M20 34 L19 29 M30 34 L31 28 M41 34 L42 29', 1.4, C.creamD) +
      K.sh('M52 34 C57 40 58 47 54 51 C49 55 40 56.5 30 56.8 C46 54 54 47 52 34 Z') +
      K.dots([[16, 46], [23, 50], [30, 46], [37, 50], [44, 46], [49, 41]], 1, C.wheatL),
    white_bread: () =>
      tinLoaf(C.wheat, C.creamL,
        K.line('M36 12 C38 13 38 16 38 18 V54.5 M44 10 C46 11 46.5 13 46.5 16 V52.5', 1.4, C.wheatD),
        K.hiE(15, 30, 3.5, 1.6)),
    whole_wheat_bread: () =>
      tinLoaf(C.brown, C.brownL,
        `<ellipse cx="33" cy="14" rx="2.2" ry="1.2" fill="${C.wheatL}" stroke-width="1"/><ellipse cx="42" cy="11.5" rx="2.2" ry="1.2" fill="${C.wheatL}" stroke-width="1"/><ellipse cx="50" cy="12" rx="2.2" ry="1.2" fill="${C.wheatL}" stroke-width="1"/>`,
        K.dots([[14, 32], [22, 30], [26, 38], [16, 42], [23, 46], [13, 50], [27, 51]], 1.1, C.brownD)),
    brioche: () =>
      K.shadow(22) +
      `<path d="M8 36 L16 55 C17 56.5 18 57 20 57 H44 C46 57 47 56.5 48 55 L56 36 Z" fill="${C.orange}"/>` +
      K.line('M15 38 L21 55.5 M24 39 L27 56.5 M32 39.5 V57 M40 39 L37 56.5 M49 38 L43 55.5', 1.4, C.orangeD) +
      `<path d="M6 36 C6 29 18 26 32 26 C46 26 58 29 58 36 C58 41 46 43 32 43 C18 43 6 41 6 36 Z" fill="${C.orangeL}"/>` +
      `<circle cx="32" cy="21" r="11" fill="${C.orange}"/>` +
      K.sh('M40 15 C44 20 43 28 37 31 C41 26 42 20 40 15 Z') + K.hiE(27, 16, 3.5, 2) + K.hiE(18, 32, 4, 1.5, -5),
    baguette: () =>
      K.shadow(24, 57) +
      `<path d="M6 51 C3 47 6 41 12 37 L46 13 C51 9 57 8 59 11 C61 15 57 20 52 24 L18 52 C13 56 8 55 6 51 Z" fill="${C.wheat}"/>` +
      K.sh('M58 14 C57 18 54 21 52 24 L18 52 C13 56 8 55 6 51 C12 52 16 50 20 47 L52 21 C55 19 57 17 58 14 Z') +
      [[14, 44], [24, 37], [34, 30], [44, 23], [53, 16]].map(([x, y]) => `<path d="M${x - 5} ${y + 3} C${x - 3} ${y - 1} ${x + 2} ${y - 4} ${x + 6} ${y - 4} C${x + 4} ${y} ${x - 1} ${y + 3} ${x - 5} ${y + 3} Z" fill="${C.wheatL}" stroke-width="1.5"/>`).join(''),
    ciabatta: () =>
      K.shadow(27) +
      `<path d="M5 40 C5 33 9 30 16 29 L48 27 C55 27 59 31 59 37 V45 C59 50 55 53 48 53 L16 55 C9 55 5 52 5 47 Z" fill="${C.wheat}"/>` +
      `<path d="M5 40 C5 33 9 30 16 29 L48 27 C55 27 59 31 59 37 C59 42 55 44 48 44 L16 46 C9 46 5 44 5 40 Z" fill="${C.wheatL}"/>` +
      `<path d="M10 37 C12 33 17 33 20 35 C24 32 30 33 31 36 C27 39 20 40 14 40 C11 40 10 39 10 37 Z M36 32 C40 30 46 31 47 33 C51 33 54 35 52 38 C47 40 40 39 36 37 C34 35 34 33 36 32 Z" fill="${C.creamL}" stroke="none"/>` +
      K.dots([[24, 37], [42, 35]], 1, C.creamL) + K.sh('M57 40 C59 44 58 49 54 51 C50 53 30 54 16 55 L48 50 C53 49 56 46 57 40 Z'),
    pita_bread: () =>
      K.shadow(27) +
      `<ellipse cx="34" cy="31" rx="25" ry="13" fill="${C.wheatL}"/>` + spots([[24, 27], [40, 26], [48, 33], [32, 33]], C.wheat, 2.6) +
      `<path d="M6 50 C6 40 17 36 31 36 C45 36 56 40 56 50 Z" fill="${C.wheatL}"/>` +
      `<path d="M8 50 C8 44 18 41 31 41 C44 41 54 44 54 50 C50 47 42 46 31 46 C20 46 12 47 8 50 Z" fill="${C.brownD}" stroke="none"/>` +
      `<path d="M6 50 C6 54 17 57 31 57 C45 57 56 54 56 50 Z" fill="${C.wheat}"/>` + K.hiE(18, 40, 4, 1.4, -10),
    naan: () =>
      K.shadow(25) +
      `<path d="M6 46 C4 38 10 30 22 26 C34 22 50 12 57 18 C62 24 58 38 50 46 C42 54 28 58 18 56 C11 55 7 51 6 46 Z" fill="${C.wheatL}"/>` +
      K.sh('M57 22 C58 32 52 44 42 51 C32 56 22 57 15 55 C30 54 44 48 50 40 C54 34 57 28 57 22 Z') +
      spots([[16, 40], [26, 34], [38, 28], [48, 22], [30, 46], [44, 38], [20, 50]], C.brown, 2.4) +
      spots([[18, 37], [36, 31], [42, 44]], C.wheatD, 3.4) +
      K.dots([[22, 44], [34, 38], [44, 30], [27, 52], [51, 30]], 0.9, C.leafD),
    injera: () =>
      K.shadow(28, 57) +
      `<ellipse cx="32" cy="42" rx="28" ry="14" fill="${C.creamD}"/>` +
      K.dots([[12, 42], [18, 37], [18, 48], [26, 34], [25, 52], [38, 53], [46, 50], [52, 44], [48, 37], [55, 40], [34, 31], [42, 32]], 1.2, C.wheatD) +
      `<path d="M16 34 L42 22 C47 20 51 22 52 26 C53 30 50 33 46 35 L20 46 Z" fill="${C.creamD}"/>` +
      `<ellipse cx="18" cy="40" rx="5" ry="6.5" transform="rotate(-24 18 40)" fill="${C.cream}"/>` +
      K.line('M18 37 C20 38 21 40 20 43', 1.3, C.wheatD) +
      K.dots([[28, 33], [34, 29], [40, 30], [44, 27], [32, 36], [46, 31]], 1.1, C.wheatD) + K.hi('M24 32 L42 24 C44 23.5 46 23.5 47 24.5 L26 34 Z'),
    corn_tortillas: () => discStack(C.yellowL, C.yellow, spots([[18, 34], [30, 30], [44, 33], [38, 40], [24, 41], [48, 39]], C.wheatD)),
    flour_tortillas: () => discStack(C.creamL, C.cream, spots([[18, 34], [30, 30], [44, 33], [38, 40], [24, 41], [48, 39]], C.brownL, 2.6)),
    burger_buns: () =>
      K.shadow(25) +
      `<path d="M8 47 C8 44 18 43 32 43 C46 43 56 44 56 47 V51 C56 55 46 57 32 57 C18 57 8 55 8 51 Z" fill="${C.orange}"/>` +
      `<ellipse cx="32" cy="47" rx="24" ry="4" fill="${C.creamL}" stroke-width="2"/>` +
      `<path d="M6 36 C6 22 18 13 32 13 C46 13 58 22 58 36 C58 39 46 41 32 41 C18 41 6 39 6 36 Z" fill="${C.orange}"/>` +
      K.sh('M50 21 C56 27 58 34 56 38 C52 40 44 40.5 38 41 C48 37 53 30 50 21 Z') + K.hiE(20, 21, 5, 2.4) +
      [[24, 20, -20], [33, 18, 10], [42, 22, 30], [20, 30, -10], [30, 28, 0], [40, 30, 20], [48, 31, 40], [26, 35, 0], [36, 36, 10]]
        .map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="1.9" ry="1.1" transform="rotate(${r} ${x} ${y})" fill="${C.creamL}" stroke-width="0.9"/>`).join(''),
    pizza_dough: () =>
      K.shadow(28, 57) +
      `<path d="M47 46 L58 54 C60 55.5 59 58 57 57.5 L44 50 Z" fill="${C.wood}" stroke-width="2"/>` +
      `<ellipse cx="29" cy="38" rx="25" ry="16" fill="${C.woodL}"/>` +
      `<ellipse cx="29" cy="36.5" rx="21" ry="12.5" fill="${C.cream}"/>` +
      `<ellipse cx="29" cy="36" rx="16" ry="8.5" fill="${C.creamL}" stroke-width="1.4"/>` +
      K.hiE(20, 31, 4, 1.5, -10) + K.dots([[24, 39], [35, 33], [37, 40], [18, 36]], 0.8, C.creamD),
    english_muffins: () =>
      K.shadow(25) +
      `<path d="M8 38 V48 C8 53 18 57 32 57 C46 57 56 53 56 48 V38 Z" fill="${C.creamL}"/>` +
      `<path d="M8 48 C8 53 18 57 32 57 C46 57 56 53 56 48 V51 C56 55 46 58 32 58 C18 58 8 55 8 51 Z" fill="${C.wheatD}"/>` +
      `<path d="M8.5 44 C12 45 16 43 20 45 C25 47 28 44 33 46 C38 48 42 45 47 46 C51 47 54 45 55.5 44" stroke="${C.creamD}" stroke-width="1.4"/>` +
      `<ellipse cx="32" cy="36" rx="24" ry="11" fill="${C.wheat}"/>` +
      K.sh('M52 30 C57 34 57 39 52 42 C46 45 38 46.5 32 47 C44 44 52 38 52 30 Z') + K.hiE(22, 31, 6, 2, -8) +
      K.dots([[18, 36], [24, 32], [32, 31], [40, 33], [46, 37], [28, 38], [37, 40], [22, 40], [44, 30]], 0.9, C.yellowL),
    puff_pastry: () =>
      K.shadow(26) +
      `<path d="M6 30 L30 22 L58 30 L34 39 Z" fill="${C.wheatL}"/>` +
      `<path d="M6 30 L34 39 V56 L6 47 Z" fill="${C.creamL}"/>` + `<path d="M34 39 L58 30 V47 L34 56 Z" fill="${C.cream}"/>` +
      K.line('M6 33.4 L34 42.4 L58 33.4 M6 36.8 L34 45.8 L58 36.8 M6 40.2 L34 49.2 L58 40.2 M6 43.6 L34 52.6 L58 43.6', 1.6, C.yellow) +
      K.line('M34 39 V56', 2.2) + K.hi('M14 29.5 L30 24.5 L36 26.3 L20 31.5 Z'),
    phyllo_dough: () =>
      K.shadow(27) +
      `<path d="M6 46 L22 52 L58 42 L58 46 L22 57 L6 50 Z" fill="${C.cream}"/>` +
      `<path d="M6 41 L22 47 L58 37 L58 42 L22 52 L6 46 Z" fill="${C.creamL}"/>` +
      `<path d="M6 41 L22 47 L58 37 C52 33 46 33 40 31 C34 29 30 30 24 32 Z" fill="${C.wheatL}"/>` +
      `<path d="M24 32 C30 30 34 29 40 31 C46 33 52 33 58 37 C54 26 50 18 44 12 C38 16 30 17 24 18 C28 23 27 28 24 32 Z" fill="${C.creamL}"/>` +
      K.line('M30 19 C33 23 33 27 31 31 M38 17 C41 22 42 26 41 30', 1.2, C.creamD) + K.hi('M27 20 C30 24 30 28 28 31 L26 31.5 C28 28 28 24 26 20 Z'),
    shortcrust_pastry: () =>
      K.shadow(27) +
      `<path d="M5 41 C5 33 17 28 32 28 C47 28 59 33 59 41 V45 C59 52 47 56 32 56 C17 56 5 52 5 45 Z" fill="${C.wheat}"/>` +
      `<path d="M5 41 C5 33 17 28 32 28 C47 28 59 33 59 41 C59 48 47 52 32 52 C17 52 5 48 5 41 Z" fill="${C.wheatL}"/>` +
      K.line('M7 37 L10 38 M20 30 L21 32.5 M45 30.5 L44 33 M56 37 L53 38.5 M14 49 L16 47', 1.4, C.wheatD) +
      `<path d="M8 22 L54 14 M54 14 L60 13 M8 22 L3 23" stroke-width="5"/>` + `<path d="M12 23 L52 15.5 L53 21 L13 28.5 Z" fill="${C.woodL}"/>` +
      `<path d="M8 22 L3 23 M54 14 L60 13" stroke="${C.wood}" stroke-width="2.4"/>` + K.hi('M14 24 L50 17 L50.4 18.5 L14.3 25.5 Z'),
    sweet_shortcrust: () =>
      K.shadow(27) +
      `<path d="M6 36 L10 50 C14 55 22 57 32 57 C42 57 50 55 54 50 L58 36 Z" fill="${C.wheat}"/>` +
      K.line('M10 41 L13 52 M17 44 L19 55 M25 45 L26 56.6 M33 45.3 V57 M40 45 L39.5 56.6 M47 44 L45.5 55 M54 41 L51 52', 1.3, C.wheatD) +
      `<ellipse cx="32" cy="36" rx="26" ry="10" fill="${C.yellowL}"/>` +
      `<ellipse cx="32" cy="37" rx="20" ry="6.5" fill="${C.wheatL}" stroke-width="1.6"/>` +
      K.sh('M12 37 C14 33 22 31 32 30.5 C22 32 16 35 12 37 Z') + K.dots([[24, 39], [32, 41], [40, 38], [35, 36]], 0.9, C.white),
    croutons: () => K.shadow(25) + cube(20, 33) + cube(42, 31) + cube(32, 44, 1.1) + cube(14, 48, 0.9) + cube(50, 46, 0.9),
    breadcrumbs: () =>
      K.bowl(`<path d="M12 30 C16 21 24 17 32 17 C40 17 48 21 52 30 Z" fill="${C.wheat}" stroke-width="1.6"/>` +
        K.dots([[18, 27], [24, 23], [31, 20], [38, 22], [45, 26], [26, 28], [34, 26], [41, 29], [20, 31], [48, 31], [30, 31], [37, 32]], 1.3, C.orangeD) +
        K.dots([[21, 24], [28, 25], [35, 23], [42, 24], [33, 29]], 1, C.wheatL), C.white, C.wheat),
    panko: () =>
      K.bowl([[16, 29, -30], [22, 24, 20], [29, 21, -10], [36, 21, 30], [43, 24, -20], [48, 29, 10], [25, 30, 40], [33, 27, -40], [40, 30, 0]]
        .map(([x, y, r]) => `<path d="M${x - 5} ${y} L${x - 1} ${y - 3} L${x + 1} ${y - 1} L${x + 5} ${y - 2} L${x + 3} ${y + 2} L${x - 2} ${y + 2.5} Z" transform="rotate(${r} ${x} ${y})" fill="${C.creamL}" stroke-width="1.3"/>`).join(''), C.tealL, C.cream),
    graham_crackers: () =>
      K.shadow(26) +
      `<path d="M4 38 L36 26 L60 36 L28 50 Z" fill="${C.wheatD}"/><path d="M4 38 L28 50 V54 L4 42 Z M28 50 L60 36 V40 L28 54 Z" fill="${C.brown}"/>` +
      `<path d="M8 30 L34 18 L56 28 L30 40 Z" fill="${C.wheat}"/><path d="M8 30 L30 40 V44 L8 34 Z M30 40 L56 28 V32 L30 44 Z" fill="${C.wheatD}"/>` +
      K.line('M21 24 L43 34', 1.4, C.brown) + K.dots([[20, 30], [26, 33], [29, 23], [34, 26], [38, 25], [42, 29], [24, 27], [33, 31]], 1, C.brown) + K.hi('M14 29 L33 20.3 L36 21.6 L17 30.4 Z'),
  });
})(FSI);
