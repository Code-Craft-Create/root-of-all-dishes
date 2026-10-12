// Bakery group, part 3: pasta, noodles and wrappers (each drawn by its shape).
(function (FSI) {
  const { C, K } = FSI;
  // Tied bundle of straight dried strands; rot tilts it.
  const bundle = (fill, line, band, rot, bandMark = '') =>
    `<g transform="rotate(${rot} 32 32)">` +
    `<rect x="4" y="25" width="56" height="14" rx="2" fill="${fill}"/>` +
    K.line('M5 28.5 H59 M5 32 H59 M5 35.5 H59', 1.1, line) +
    `<rect x="26" y="22.5" width="12" height="19" rx="1.5" fill="${band}"/>` + bandMark +
    K.hi('M6 26.5 H26 V28 H6 Z') + `</g>`;
  // Hollow tube (penne) with diagonal cuts.
  const penne = (x, y, rot) =>
    `<g transform="rotate(${rot} ${x} ${y})">` +
    `<path d="M${x - 8} ${y - 5.5} H${x + 13} L${x + 9} ${y + 5.5} H${x - 12} Z" fill="${C.yellow}" stroke-width="2.2"/>` +
    K.line(`M${x - 7} ${y - 2} H${x + 9} M${x - 9} ${y + 1.5} H${x + 8}`, 1.1, C.yellowD) +
    `<ellipse cx="${x - 10}" cy="${y}" rx="2.6" ry="5.8" transform="rotate(20 ${x - 10} ${y})" fill="${C.yellowL}" stroke-width="2"/>` +
    `<ellipse cx="${x - 10}" cy="${y}" rx="1.1" ry="3" transform="rotate(20 ${x - 10} ${y})" fill="${C.yellowD}" stroke="none"/></g>`;
  // Elbow macaroni: a thick bent tube, outline drawn as a wide ink stroke under a narrower fill stroke.
  const elbow = (x, y, rot) =>
    `<g transform="rotate(${rot} ${x} ${y})">` +
    `<path d="M${x - 8} ${y + 6} C${x - 8} ${y - 4} ${x - 2} ${y - 8} ${x + 8} ${y - 7}" stroke="${C.ink}" stroke-width="11.5" stroke-linecap="butt"/>` +
    `<path d="M${x - 8} ${y + 6} C${x - 8} ${y - 4} ${x - 2} ${y - 8} ${x + 8} ${y - 7}" stroke="${C.yellow}" stroke-width="7" stroke-linecap="butt"/>` +
    K.line(`M${x - 10} ${y - 1} C${x - 9} ${y - 7} ${x - 4} ${y - 10} ${x + 1} ${y - 10}`, 1, C.yellowL) +
    `<ellipse cx="${x - 8}" cy="${y + 6}" rx="5.6" ry="2.4" fill="${C.yellowL}" stroke-width="2"/><ellipse cx="${x - 8}" cy="${y + 6}" rx="2.6" ry="1" fill="${C.yellowD}" stroke="none"/>` +
    `<ellipse cx="${x + 8}" cy="${y - 7}" rx="2.4" ry="5.6" fill="${C.yellowL}" stroke-width="2"/></g>`;
  // Round nest of thin wavy noodles.
  const nest = (x, y, r, fill, line) =>
    `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.72}" fill="${fill}"/>` +
    K.line(`M${x - r * 0.75} ${y} C${x - r * 0.6} ${y - r * 0.6} ${x + r * 0.2} ${y - r * 0.6} ${x + r * 0.5} ${y - r * 0.2} C${x + r * 0.8} ${y + r * 0.2} ${x + r * 0.2} ${y + r * 0.55} ${x - r * 0.3} ${y + r * 0.35} C${x - r * 0.7} ${y + r * 0.2} ${x - r * 0.4} ${y - r * 0.3} ${x} ${y - r * 0.2} C${x + r * 0.3} ${y - r * 0.1} ${x + r * 0.2} ${y + r * 0.2} ${x - r * 0.1} ${y + r * 0.1}` +
      ` M${x - r * 0.9} ${y + r * 0.15} C${x - r * 0.8} ${y + r * 0.6} ${x + r * 0.4} ${y + r * 0.75} ${x + r * 0.85} ${y + r * 0.1}`, 1.2, line) +
    K.hiE(x - r * 0.45, y - r * 0.35, r * 0.25, r * 0.12);
  // Short cylinder lying on its side, end facing left.
  const roll = (x, y, len, r, fill, end) =>
    `<path d="M${x} ${y - r} H${x + len} C${x + len + r * 0.6} ${y - r} ${x + len + r * 0.6} ${y + r} ${x + len} ${y + r} H${x} Z" fill="${fill}"/>` +
    `<ellipse cx="${x}" cy="${y}" rx="${r * 0.55}" ry="${r}" fill="${end}"/>` + K.hi(`M${x + 2} ${y - r + 1.5} H${x + len - 1} V${y - r + 3} H${x + 2} Z`);
  const flatStack = (fill, edge, n, extra) => {
    let m = K.shadow(26, 57);
    for (let i = n - 1; i >= 0; i--) {
      const y = 38 + i * 3.5;
      m += `<ellipse cx="32" cy="${y + 1.5}" rx="26" ry="12" fill="${edge}" stroke-width="2"/><ellipse cx="32" cy="${y}" rx="26" ry="12" fill="${fill}" stroke-width="2"/>`;
    }
    return m + extra;
  };

  FSI.add('bakery', {
    dried_spaghetti: () => K.shadow(22, 57) + bundle(C.yellowL, C.yellowD, C.blue, -40, K.line('M28 32 H36', 1.4, C.white)),
    soba_noodles: () => K.shadow(26, 50) + bundle(C.brownL, C.brownD, C.white, -10, K.line('M30 25 V39 M34 25 V39', 1.4, C.red)),
    penne: () => K.shadow(24) + penne(24, 30, -20) + penne(42, 32, 25) + penne(30, 46, 5),
    macaroni: () => K.shadow(24) + elbow(22, 28, 0) + elbow(44, 32, 70) + elbow(30, 48, -40),
    fresh_egg_pasta: () =>
      K.board(
        `<path d="M10 42 L40 32 L52 38 L22 49 Z" fill="${C.yellowL}" stroke-width="2"/>` +
        K.line('M28 36 L40 41.5 M32 34.5 L44 40 M36 33.3 L48 38.6', 1.3, C.yellowD) +
        `<path d="M40 41.5 C42 46 40 49 44 51 M44 40 C47 44 45 48 49 49" stroke="${C.ink}" stroke-width="4.5"/>` +
        `<path d="M40 41.5 C42 46 40 49 44 51 M44 40 C47 44 45 48 49 49" stroke="${C.yellowL}" stroke-width="2"/>` +
        K.hi('M14 41.5 L28 37 L30 38 L16 42.6 Z')) +
      `<ellipse cx="15" cy="27" rx="7.5" ry="9.5" fill="${C.creamL}"/>` + K.hiE(12.5, 23, 2, 3.2, 15),
    lasagna_sheets: () => {
      const sheet = (dy, fill) =>
        `<path d="M6 ${38 + dy} L36 ${28 + dy} C38 ${30 + dy} 40 ${27 + dy} 42 ${30 + dy} C44 ${32 + dy} 46 ${29 + dy} 48 ${32 + dy} C50 ${34 + dy} 52 ${31 + dy} 58 ${35 + dy} L28 ${45 + dy} C26 ${43 + dy} 24 ${46 + dy} 22 ${43 + dy} C20 ${41 + dy} 18 ${44 + dy} 16 ${41 + dy} C14 ${39 + dy} 12 ${42 + dy} 6 ${38 + dy} Z" fill="${fill}"/>`;
      return K.shadow(26, 56) + sheet(10, C.yellow) + sheet(5, C.yellowL) + sheet(0, C.yellowL) + K.dots([[20, 37], [30, 35], [38, 33], [26, 40], [44, 36]], 0.9, C.yellowD) + K.hi('M12 37.5 L32 31 L34 32 L14 38.6 Z');
    },
    gnocchi: () => {
      const g = (x, y, r) =>
        `<g transform="rotate(${r} ${x} ${y})"><path d="M${x - 9} ${y} C${x - 9} ${y - 7} ${x + 9} ${y - 7} ${x + 9} ${y} C${x + 9} ${y + 7} ${x - 9} ${y + 7} ${x - 9} ${y} Z" fill="${C.wheatL}"/>` +
        K.line(`M${x - 4} ${y - 3.8} C${x - 5} ${y - 1} ${x - 5} ${y + 1} ${x - 4} ${y + 3.8} M${x} ${y - 4.2} C${x - 1} ${y - 1} ${x - 1} ${y + 1} ${x} ${y + 4.2} M${x + 4} ${y - 3.8} C${x + 3} ${y - 1} ${x + 3} ${y + 1} ${x + 4} ${y + 3.8}`, 1.2, C.wheat) + `</g>`;
      return K.shadow(26) + g(20, 26, -15) + g(42, 24, 20) + g(31, 38, 5) + g(14, 46, 25) + g(48, 44, -20) + K.dots([[30, 28], [8, 36], [56, 34], [32, 52]], 1, C.white);
    },
    couscous: () =>
      K.bowl(`<path d="M10 30 C14 18 24 14 32 14 C40 14 50 18 54 30 Z" fill="${C.yellowL}" stroke-width="1.6"/>` +
        K.dots([[16, 27], [21, 23], [26, 20], [32, 18], [38, 20], [43, 23], [48, 27], [24, 27], [30, 24], [36, 25], [41, 28], [19, 30], [28, 30], [34, 29], [45, 30], [32, 21]], 1.1, C.yellowD),
        C.terracotta, C.yellowL),
    ramen_noodles: () =>
      K.shadow(27) +
      `<path d="M5 32 L32 22 L59 32 L32 42 Z" fill="${C.yellowL}"/>` +
      `<path d="M5 32 L32 42 V55 L5 45 Z" fill="${C.yellow}"/><path d="M32 42 L59 32 V45 L32 55 Z" fill="${C.yellowD}"/>` +
      K.line('M11 32 C14 30 16 34 19 32 C22 30 24 34 27 32 C30 30 32 34 35 32 C38 30 40 34 43 32 C46 30 48 34 51 32 M18 28 C21 26 23 30 26 28 C29 26 31 30 34 28 C37 26 39 30 42 28 M20 36 C23 34 25 38 28 36 C31 34 33 38 36 36 C39 34 41 38 44 36', 1.3, C.wheatD) +
      K.line('M8 39 C10 37 12 41 14 39 C16 37 18 41 20 39 C22 37 24 41 26 39 C28 37 29 42 30 41 M35 48 C37 46 39 50 41 47 C43 45 45 49 47 46 C49 44 51 48 53 45', 1.2, C.yellowD),
    udon_noodles: () => {
      const s = (d) => `<path d="${d}" stroke="${C.ink}" stroke-width="7.5"/><path d="${d}" stroke="${C.white}" stroke-width="3.5"/>`;
      return K.shadow(25) +
        s('M10 52 C8 40 20 34 30 40 C38 45 50 40 52 30') + s('M14 30 C18 20 32 18 36 28 C40 38 52 42 56 50') +
        s('M8 40 C14 28 28 50 38 48 C46 46 50 54 54 54') + s('M24 54 C26 44 36 36 46 22');
    },
    egg_noodles: () => K.shadow(26) + nest(22, 40, 16, C.yellow, C.orangeD) + nest(42, 30, 16, C.yellow, C.orangeD) + nest(44, 48, 12, C.yellow, C.orangeD),
    rice_noodles: () =>
      K.shadow(26, 56) +
      `<path d="M12 30 H52 C59 30 59 46 52 46 H12 C5 46 5 30 12 30 Z" fill="${C.white}"/>` +
      K.line('M12 34 H52 M12 38 H52 M12 42 H52', 1.2, C.greyL) +
      `<path d="M12 30 C4 30 4 46 12 46 M52 30 C60 30 60 46 52 46" stroke="${C.greyD}" stroke-width="1.2"/>` +
      `<path d="M12 46 H52 C59 46 59 54 52 54 H12 C5 54 5 46 12 46 Z" fill="${C.milk}"/>` + K.line('M12 50 H52', 1.2, C.greyL) +
      `<rect x="27" y="27" width="10" height="30" rx="1.5" fill="${C.red}"/>` + K.hi('M14 31.5 H26 V33 H14 Z'),
    glass_noodles: () =>
      K.shadow(26) +
      `<path d="M8 32 C6 20 22 18 30 28 C34 33 38 33 42 28 C50 18 60 22 58 34 C57 46 46 48 40 42 C36 38 34 38 30 42 C22 50 9 46 8 32 Z" fill="${C.glass}"/>` +
      K.line('M12 34 C12 24 24 26 28 32 C24 40 14 42 12 34 M16 32 C18 28 22 30 24 33 M54 34 C54 24 42 26 38 32 C42 40 52 42 54 34 M50 32 C48 28 44 30 42 33', 1.3, C.blue) +
      `<rect x="29" y="27" width="7" height="17" rx="1.5" fill="${C.pink}"/>` + K.hiE(16, 26, 3.5, 1.5, -20),
    rice_paper: () =>
      flatStack(C.creamL, C.cream, 3,
        K.line('M14 34 L26 46 M20 30 L36 46 M28 28 L44 44 M38 28 L50 40 M14 42 L28 28 M20 46 L38 28 M30 47 L46 31 M42 45 L50 37', 1.1, C.creamD) + K.hiE(18, 33, 5, 2, -15)),
    rice_cakes: () =>
      K.shadow(26) + roll(14, 46, 14, 6, C.white, C.creamL) + roll(34, 48, 14, 6, C.white, C.creamL) + roll(22, 34, 14, 6, C.white, C.creamL) + roll(40, 30, 12, 6, C.white, C.creamL),
    mochi_dough: () =>
      K.plate(`<path d="M9 40 C9 28 20 20 32 20 C44 20 55 28 55 40 C55 46 46 48 32 48 C18 48 9 46 9 40 Z" fill="${C.white}"/>` +
        K.sh('M48 27 C54 32 55 38 54 42 C51 45 44 46.5 38 47 C48 42 51 35 48 27 Z') + K.hiE(22, 28, 6, 3) +
        K.dots([[18, 40], [26, 44], [38, 43], [46, 38], [30, 36]], 0.9, C.greyL), C.pinkL, C.pink),
    dumpling_wrappers: () =>
      flatStack(C.white, C.creamL, 4, K.hiE(20, 34, 5, 2, -10) + K.dots([[26, 37], [36, 35], [42, 40], [30, 42], [20, 40]], 1, C.creamD)),
  });
})(FSI);
