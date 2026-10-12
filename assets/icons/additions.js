// Icons for items added after the first icon pass (tarte flambée and its chain).
(function (FSI) {
  const { C, K } = FSI;
  // Small isometric cube: top face light, front face base, side dark.
  const cube = (x, y, s, top, front, side) =>
    `<path d="M${x} ${y} l${s} -${s / 2} l${s} ${s / 2} l-${s} ${s / 2} Z" fill="${top}" stroke-width="1.5"/>` +
    `<path d="M${x} ${y} l${s} ${s / 2} v${s} l-${s} -${s / 2} Z" fill="${front}" stroke-width="1.5"/>` +
    `<path d="M${x + s} ${y + s / 2} l${s} -${s / 2} v${s} l-${s} ${s / 2} Z" fill="${side}" stroke-width="1.5"/>`;
  const lardon = (x, y, s = 5) => cube(x, y, s, C.meatL, C.meat, C.meatD) + K.line(`M${x + 0.5} ${y + s * 0.55} l${s - 0.5} ${s / 2}`, 1.6, C.fat);
  FSI.add('additions', {
    tarte_flambee: () =>
      K.shadow(28, 58) +
      `<path d="M44 46 L60 58" stroke-width="7"/><path d="M44 46 L60 58" stroke="${C.woodD}" stroke-width="3"/>` +
      `<path d="M3 26 C2 22 5 20 9 19 L47 11 C52 10 55 12 56 16 L61 38 C62 42 60 44 56 45 L15 54 C10 55 7 53 6 49 Z" fill="${C.woodL}"/>` +
      `<path d="M7 27 C6 24 8 23 11 22.5 C13 20 16 21 18 21 L44 15.5 C46 14 49 14.5 51 16 C53 17 53.5 19 54 21 L57.5 36 C59 38 58 40.5 56 41 C54 43 52 42.5 50 43 L19 49.5 C17 51 14 51 12.5 49.5 C10.5 49 10 47 9.5 45 Z" fill="${C.wheat}"/>` +
      `<path d="M11.5 28 C11 26 12.5 25 14.5 24.5 L45 18 C47.5 17.5 49.5 18.5 50 20.5 L53.5 35.5 C54 37.5 53 39 51 39.4 L19 46 C16.8 46.5 15 45.5 14.5 43.5 Z" fill="${C.creamL}" stroke="none"/>` +
      K.dots([[9, 31], [8, 40], [12, 48], [22, 48.5], [34, 46], [47, 43], [56, 38], [55, 27], [52, 17], [40, 16.5], [26, 19.5], [15, 22]], 1.6, C.brownD) +
      K.line('M16 30 C18 27.5 22 27.5 23 29.5 M33 25 C35 22.5 39 22.5 40 24.5 M40 34 C42 31.5 46 31.5 47 33.5 M22 39 C24 36.5 28 36.5 29 38.5 M30 32 C32 29.5 36 29.5 37 31.5 M43 23 C45 20.5 49 20.5 50 22.5', 1.5, C.purple) +
      lardon(18, 33, 4) + lardon(27, 27, 4) + lardon(36, 37.5, 4) + lardon(45, 27, 4) + lardon(24, 42, 4) + lardon(39, 21, 3.5) + lardon(46, 37, 3.5) + lardon(14, 37.5, 3.5) +
      K.hi('M13 27.5 C13 26.5 14 26 15 25.8 L30 22.6 L29.5 24 L15.5 27 Z'),
    fromage_blanc: () =>
      K.bowl(`<path d="M18 30 C18 22 26 17 32 17 C38 17 46 22 46 30 Z" fill="${C.white}"/>` + K.line('M26 24 C29 21 35 21 37 24', 1.5, C.greyL) +
        K.hiE(25, 22, 4, 2), C.terracotta, C.white) + K.badge('cattle', 50, 50, 11),
    lardons: () =>
      K.plate(lardon(12, 35, 6) + lardon(24, 30, 6) + lardon(36, 31, 6) + lardon(18, 41, 6) + lardon(30, 38, 6) + lardon(42, 38, 6) + lardon(25, 26, 5) + lardon(28, 44, 5), C.white) +
      `<path d="M47 20 C45 16 49 13 47 9 M53 22 C51 18 55 15 53 11" stroke="${C.greyD}" stroke-width="2" fill="none"/>`,
    flammkuchen_dough: () =>
      K.shadow(27) +
      `<path d="M5 44 C4 36 16 30 32 30 C48 30 60 36 59 44 C58 51 47 55 32 55 C17 55 6 51 5 44 Z" fill="${C.creamL}"/>` +
      K.sh('M50 50 C55 48 58 46 58.5 43 C58 49 52 53 44 54.5 Z') +
      K.dots([[18, 40], [26, 46], [40, 41], [46, 47], [33, 36]], 1, C.creamD) +
      `<path d="M10 25 L50 13" stroke-width="9"/><path d="M10 25 L50 13" stroke="${C.woodL}" stroke-width="5"/>` +
      `<path d="M4 27 L10 25 M50 13 L58 10.5" stroke-width="5"/><path d="M4 27 L10 25 M50 13 L58 10.5" stroke="${C.woodD}" stroke-width="2"/>`,
  });
})(FSI);
