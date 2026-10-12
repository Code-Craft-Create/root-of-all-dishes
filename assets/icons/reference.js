// Reference icons: the examples every other group follows (see assets/STYLE.md).
(function (FSI) {
  const { C, K } = FSI;
  FSI.add('reference', {
    // Crop: the plant part you harvest, upright, filling the frame.
    wheat: () => {
      const ear = (x, y, rot) =>
        `<g transform="rotate(${rot} ${x} ${y})">` +
        `<path d="M${x} ${y + 2} C${x - 5} ${y - 2} ${x - 5} ${y - 14} ${x} ${y - 22} C${x + 5} ${y - 14} ${x + 5} ${y - 2} ${x} ${y + 2} Z" fill="${C.wheat}"/>` +
        K.line(`M${x} ${y - 20} V${y} M${x - 3.5} ${y - 13} L${x} ${y - 9} L${x + 3.5} ${y - 13} M${x - 3.5} ${y - 6} L${x} ${y - 2} L${x + 3.5} ${y - 6}`, 1.3, C.wheatD) +
        K.line(`M${x} ${y - 22} V${y - 28}`, 1.3) +
        K.hi(`M${x - 2} ${y - 4} C${x - 4} ${y - 8} ${x - 3.5} ${y - 13} ${x - 1.5} ${y - 17} Z`) + `</g>`;
      return K.shadow(12) +
        `<path d="M32 58 C31 46 26 36 18 28 M32 58 V26 M32 58 C33 46 38 36 46 28" stroke-width="3" fill="none" stroke="${C.wheatD}"/>` +
        `<path d="M32 58 C31 46 26 36 18 28 M32 58 V26 M32 58 C33 46 38 36 46 28" stroke-width="1" fill="none" stroke="${C.wheatL}"/>` +
        ear(18, 30, -28) + ear(46, 30, 28) + ear(32, 28, 0) +
        `<path d="M24 48 C28 46 36 46 40 48" stroke="${C.leafD}" stroke-width="2"/>`;
    },
    // Animal: whole animal in side view facing left, standing on its shadow.
    cattle: () =>
      K.shadow(26) +
      `<path d="M17 40 V55 H22 V43 M44 42 V55 H49 V40" fill="${C.brown}"/>` +
      `<path d="M14 26 C14 21 18 19 24 19 H46 C53 19 57 24 57 31 V40 C57 45 53 46 48 46 H22 C17 46 14 43 14 38 Z" fill="${C.brown}"/>` +
      `<path d="M25 46 V56 H30 V46 M37 46 V56 H42 V46" fill="${C.brownD}"/>` +
      `<path d="M57 25 C61 28 61 36 59 41" stroke-width="2" fill="none"/>` +
      `<path d="M4 22 C4 16 8 13 13 13 C18 13 21 16 21 22 V31 C21 35 18 37 13 37 C8 37 4 35 4 31 Z" fill="${C.brown}"/>` +
      `<path d="M3 29 C3 26 6 25 12.5 25 C19 25 22 26 22 29 V33 C22 36 18 38 12.5 38 C7 38 3 36 3 33 Z" fill="${C.pink}"/>` +
      K.dots([[9, 31], [16, 31]], 1.3) + K.dots([[8, 20], [17, 20]], 1.6) +
      `<path d="M5 15 C2 13 1 10 2 8 M20 15 C23 13 24 10 23 8" stroke="${C.ink}" stroke-width="2.5" fill="none"/>` +
      `<path d="M4.5 15 C2 13 1.5 10 2 8.5 M20.5 15 C23 13 23.5 10 23 8.5" stroke="${C.creamL}" stroke-width="1" fill="none"/>` +
      K.hi('M24 22 H42 C40 24 30 25 24 25 Z') + K.sh('M48 44 C53 44 56 42 56 37 V40 C56 44 53 46 48 46 Z'),
    // Dairy cow (spotted) is drawn by the livestock group; dairy products get a badge of their source.
    cow_milk: () => K.bottle(C.milk, 'oil', C.blueL) + K.badge('cattle', 48, 48, 12),
    // Processed good: shared container from the kit plus a glyph of the main input.
    wheat_flour: () => K.sack(C.creamL, K.ref('wheat', 32, 41, 0.42) + `<path d="M22 21 C26 17 38 17 42 21" fill="${C.white}" stroke-width="1.5"/>`),
    cheddar: () =>
      K.shadow(24) +
      `<path d="M6 36 L44 18 L58 32 V48 L20 56 L6 50 Z" fill="${C.orange}"/>` +
      `<path d="M6 36 L44 18 L58 32 L20 40 Z" fill="${C.orangeL}"/>` + K.line('M20 40 V56', 2.5) +
      K.sh('M20 40 L58 32 V48 L20 56 Z') +
      `<ellipse cx="34" cy="47" rx="3" ry="2" fill="${C.orangeD}" stroke="none"/><ellipse cx="47" cy="41" rx="2" ry="1.5" fill="${C.orangeD}" stroke="none"/><ellipse cx="12" cy="45" rx="2" ry="1.6" fill="${C.orangeD}" stroke="none"/>`,
    tomato: () =>
      K.shadow(22) +
      `<path d="M32 18 C46 16 56 26 56 38 C56 50 46 58 32 58 C18 58 8 50 8 38 C8 26 18 16 32 18 Z" fill="${C.red}"/>` +
      K.sh('M50 30 C54 40 50 52 38 56 C48 56 56 48 56 38 C56 34 54 32 50 30 Z') +
      K.hiE(20, 30, 6, 3.5) +
      `<path d="M32 21 L24 16 L29 17 L27 11 L32 15 L37 11 L35 17 L40 16 Z" fill="${C.leaf}" stroke-width="1.8"/>` +
      `<path d="M32 15 C32 11 33 8 35 6" stroke="${C.leafD}" stroke-width="2.5"/>`,
    honey: () =>
      K.jar(C.gold, C.yellowD,
        `<path d="M32 34 L37 37 V44 L32 47 L27 44 V37 Z" fill="${C.yellow}" stroke-width="1.5"/>` +
        K.line('M32 37.5 V43.5', 1.2)),
    // Dish: served on its plate or in its bowl, the defining ingredients visible.
    buttered_toast: () =>
      K.plate(
        `<path d="M14 42 C9 38 10 29 17 28 C19 21 28 19 33 23 L51 29 C56 31 57 37 53 40 L41 50 C39 52 35 52 33 51 Z" fill="${C.woodL}"/>` +
        `<path d="M17 39.5 C14 37 15 31 19.5 31 C21 26 28 24 32 27 L49 32.5 C52 33.5 52.5 36.5 50 38.5 L40 46.5 C38.5 47.8 36 48 34.5 47.3 Z" fill="${C.wheatL}" stroke="none"/>` +
        `<path d="M27 31 L40 34.5 L36 41 L23 37.5 Z" fill="${C.yellowL}" stroke-width="1.8"/>` +
        K.hi('M28.5 32.3 L36 34.3 L34.5 36.3 L27 34.3 Z')),
    // Building: small 3/4 view structure on a grass tile.
    b_mill: () =>
      `<ellipse cx="32" cy="55" rx="27" ry="6" fill="${C.leafL}"/>` +
      `<path d="M22 56 L26 24 H38 L42 56 Z" fill="${C.cream}"/>` +
      `<path d="M24 25 L32 15 L40 25 Z" fill="${C.terracotta}"/>` +
      K.sh('M36 25 H38 L42 56 H38 Z') +
      `<path d="M29 56 V47 C29 44 35 44 35 47 V56 Z" fill="${C.woodD}"/>` +
      `<rect x="29.5" y="31" width="5" height="6" rx="1" fill="${C.blueL}" stroke-width="1.8"/>` +
      `<g transform="rotate(20 32 22)">` +
      ['M32 22 L32 3 L37 4 L37 20 Z', 'M32 22 L51 22 L50 27 L34 27 Z', 'M32 22 L32 41 L27 40 L27 24 Z', 'M32 22 L13 22 L14 17 L30 17 Z']
        .map((d) => `<path d="${d}" fill="${C.woodL}" stroke-width="2"/>`).join('') +
      `</g><circle cx="32" cy="22" r="2.5" fill="${C.brownD}"/>`,
    b_field: () =>
      `<path d="M4 44 L32 30 L60 44 L32 58 Z" fill="${C.brown}"/>` +
      K.line('M11 47.5 L39 33.5 M18 51 L46 37 M25 54.5 L53 40.5', 2, C.brownD) +
      [[18, 44], [25, 40.5], [32, 37], [25, 48], [32, 44.5], [39, 41], [32, 51.5], [39, 48], [46, 44.5]]
        .map(([x, y]) => `<path d="M${x} ${y} C${x} ${y - 4} ${x - 4} ${y - 6} ${x - 6} ${y - 5} C${x - 5} ${y - 2} ${x - 2} ${y - 1} ${x} ${y} C${x} ${y - 4} ${x + 3} ${y - 7} ${x + 6} ${y - 6} C${x + 5} ${y - 2} ${x + 2} ${y - 1} ${x} ${y} Z" fill="${C.leaf}" stroke-width="1.5"/>`).join(''),
  });
})(FSI);
