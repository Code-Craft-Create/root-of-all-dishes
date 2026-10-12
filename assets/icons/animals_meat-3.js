// Poultry and rabbit cuts, animal fats, charcuterie.
(function (FSI) {
  const { C, K } = FSI;
  const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
  const N = (d, fill) => `<path d="${d}" fill="${fill}" stroke="none"/>`;
  const at = (x, y, r, m, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r})${s !== 1 ? ` scale(${s})` : ''}">${m}</g>`;
  const ext = (T, d, top, side, extra = '') => {
    const n = Math.max(1, Math.ceil(d / 1.5)), offs = [];
    for (let i = 0; i <= n; i++) offs.push(((d * i) / n).toFixed(2));
    return `<g fill="${side}" stroke-width="5">${offs.map((o) => `<path d="${T}" transform="translate(0 ${o})"/>`).join('')}</g>` +
      `<g fill="${side}" stroke="none">${offs.map((o) => `<path d="${T}" transform="translate(0 ${o})"/>`).join('')}</g>` +
      `<path d="${T}" fill="${top}"${extra}/>`;
  };
  // Drumstick along +x, bone knob at the origin, about 46 long.
  const drum = (meat, side, len = 1) => {
    const b = 16 * len;
    return P(`M0 -2.6 H${b} V2.6 H0 Z`, C.creamL) +
      `<circle cx="-1" cy="-3" r="3.2" fill="${C.creamL}"/><circle cx="-1" cy="3" r="3.2" fill="${C.creamL}"/><path d="M-1 -1.5 V1.5" stroke="${C.creamL}" stroke-width="4"/>` +
      P(`M${b - 3} 0 C${b - 3} -6 ${b + 4} -11 ${b + 14} -11 C${b + 24} -11 ${b + 29} -5 ${b + 29} 0 C${b + 29} 6 ${b + 24} 11 ${b + 14} 11 C${b + 4} 11 ${b - 3} 6 ${b - 3} 0 Z`, meat) +
      N(`M${b + 27} 3 C${b + 25} 8 ${b + 20} 10.5 ${b + 13} 10.5 C${b + 5} 10.5 ${b} 7 ${b - 2} 3 C${b + 6} 7 ${b + 20} 7 ${b + 27} 3 Z`, side) +
      K.hiE(b + 10, -5, 5, 1.8, 0);
  };
  // Whole raw bird, trussed, drumsticks up.
  const bird = (skin, side) =>
    K.shadow(26) + at(20, 9, 52, drum(skin, side, 0.55)) +
    P('M6 40 C5 28 16 21 30 21 C46 21 59 28 58 40 C57 50 46 56 32 56 C18 56 7 50 6 40 Z', skin) +
    N('M52 28 C58 35 58 46 50 52 C45 55 38 56 32 56 C44 51 53 42 52 28 Z', side) +
    `<ellipse cx="54" cy="36" rx="3" ry="5" fill="${side}" stroke-width="2"/>` +
    P('M30 30 C36 28 44 32 44 38 C44 44 38 46 32 44 Z', skin, ' stroke-width="2"') +
    at(11, 13, 48, drum(skin, side, 0.55)) + K.hiE(15, 30, 4, 2, -20);
  const fatJar = (fill, lid, src) => K.jar(fill, lid, '') + K.line('M20 30 C26 28 34 31 44 28', 1.3, C.creamD) + K.badge(src, 47, 47, 12);
  // Wavy rasher strip between y and y+h.
  const wave = (y, h, x0 = 6, x1 = 58) => {
    const m = (x0 + x1) / 2, q = (x1 - x0) / 4;
    return `M${x0} ${y} C${x0 + q} ${y - 5} ${m - q / 2} ${y + 5} ${m} ${y} C${m + q / 2} ${y - 5} ${x1 - q} ${y + 5} ${x1} ${y} L${x1} ${y + h} C${x1 - q} ${y + h + 5} ${m + q / 2} ${y + h - 5} ${m} ${y + h} C${m - q / 2} ${y + h + 5} ${x0 + q} ${y + h - 5} ${x0} ${y + h} Z`;
  };
  const speck = (pts, r = 1.1) => K.dots(pts, r, C.fat);

  FSI.add('animals_meat', {
    // ---- poultry ----
    chicken_breast: () => {
      const T = 'M-24 0 C-24 -8 -12 -11 0 -10 C12 -9 24 -4 24 3 C24 9 12 10 0 9 C-12 8 -24 7 -24 0 Z';
      return K.shadow(26) + at(32, 22, -8, ext(T, 4, C.pinkL, C.pink) + K.line('M-14 0 C-6 -3 6 -2 14 2', 1.3, C.pink) + K.hiE(-12, -4, 4, 1.6)) +
        at(28, 40, 6, ext(T, 4, C.pinkL, C.pink) + K.line('M-14 0 C-6 -3 6 -2 14 2', 1.3, C.pink) + K.hiE(-12, -4, 4, 1.6)) +
        K.badge('broiler_chicken', 51, 50, 10);
    },
    chicken_thighs: () => {
      const th = (x, y, r) => at(x, y, r,
        `<ellipse cx="-14" cy="2" rx="3.2" ry="3.8" fill="${C.creamL}" stroke-width="2"/>` +
        ext('M-12 -2 C-12 -10 -3 -13 5 -12 C13 -11 17 -5 16 2 C15 9 7 12 -1 11 C-9 10 -12 6 -12 -2 Z', 4, C.pinkL, C.pink) +
        K.line('M-8 -4 C-2 -8 6 -8 11 -3', 1.3, C.pink) + K.dots([[-3, 1], [4, -1], [8, 4], [-1, 5]], 0.9, C.pink) + K.hiE(-4, -7, 4, 1.6));
      return K.shadow(26) + th(22, 24, -10) + th(40, 40, 12) + K.badge('broiler_chicken', 14, 49, 10);
    },
    chicken_wings: () =>
      K.shadow(26) +
      P('M46 20 C48 13 53 9 58 10 C60 14 58 19 55 23 Z', C.pinkL) +
      P('M20 40 C20 34 26 30 33 28 L46 18 C51 15 57 18 55 24 L44 37 C40 43 32 47 26 47 C22 47 20 44 20 40 Z', C.pinkL) +
      N('M55 24 L44 37 C40 43 32 47 26 47 C34 44 42 38 51 25 Z', C.pink) +
      P('M3 44 C3 38 9 34 17 35 C24 36 28 40 27 46 C26 51 20 53 13 52 C7 51 3 48 3 44 Z', C.pinkL) +
      K.dots([[10, 41], [16, 39], [20, 45], [30, 36], [38, 31], [12, 46]], 0.9, C.pink) + K.hiE(11, 39, 4, 1.6, -10) +
      K.badge('broiler_chicken', 50, 50, 10),
    chicken_carcass: () =>
      K.shadow(26) +
      P('M6 42 C6 28 18 16 32 16 C46 16 58 28 58 42 C50 50 14 50 6 42 Z', C.creamL) +
      P('M14 40 C14 30 22 24 32 24 C42 24 50 30 50 40 C42 44 22 44 14 40 Z', C.pinkL, ' stroke-width="1.6"') +
      K.line('M22 26 C20 32 20 38 21 42 M28 24.5 C27 31 27 37 28 43 M36 24.5 C37 31 37 37 36 43 M42 26 C44 32 44 38 43 42', 2.2, C.creamL) +
      K.line('M32 16 V24', 2) + K.hiE(14, 30, 3.5, 2) + K.badge('broiler_chicken', 51, 50, 10),
    whole_chicken: () => bird(C.pinkL, C.pink),

    duck_breast: () =>
      K.shadow(26) +
      ext('M6 30 C6 20 18 14 32 15 C46 16 58 22 58 30 C58 38 46 42 32 41 C18 40 6 38 6 30 Z', 9, C.cream, C.meatD) +
      K.line('M7 37 C10 43 20 46 32 47 C44 48 55 44 57.5 38', 2, C.fat) +
      K.line('M16 20 L34 39 M26 17 L46 38 M38 16 L54 32 M10 28 L24 17 M18 36 L40 17 M30 39.5 L52 21', 1.2, C.creamD) +
      K.hiE(16, 24, 4, 1.8) + K.badge('duck', 51, 50, 10),
    duck_legs: () => K.shadow(26) + at(10, 20, 25, drum(C.meatL, C.meat)) + at(8, 38, 5, drum(C.meatL, C.meat)) + K.badge('duck', 51, 50, 10),
    duck_fat: () => fatJar(C.wheatL, C.teal, 'duck'),
    whole_duck: () => bird(C.wheatL, C.wheat) + K.badge('duck', 50, 49, 10),
    turkey_breast: () =>
      K.shadow(27) +
      P('M3 44 C1 38 4 33 9 34 L12 40 Z M61 44 C63 38 60 33 55 34 L52 40 Z', C.pinkL, ' stroke-width="2"') +
      P('M7 47 C5 31 16 16 32 16 C48 16 59 31 57 47 C50 53 14 53 7 47 Z', C.pinkL) +
      N('M49 24 C56 31 58 40 57 47 C53 50 48 51 42 52 C50 45 53 34 49 24 Z', C.pink) +
      K.line('M32 17 C29 28 29 40 32 51', 1.8, C.pinkD) +
      K.dots([[18, 30], [22, 38], [14, 40], [42, 30], [46, 38], [38, 42], [24, 26]], 0.9, C.pink) +
      K.hiE(18, 27, 5, 2.5) + K.badge('turkey', 51, 50, 10),
    turkey_legs: () => K.shadow(26) + at(9, 13, 38, drum(C.pink, C.pinkD, 1.2)) + K.badge('turkey', 14, 49, 10),
    goose_meat: () => {
      const sl = (x, y) => at(x, y, -14,
        ext('M-14 -6 C-14 -9 -11 -10 -8 -10 H10 C13 -10 15 -8 15 -5 V5 C15 8 13 9 10 9 H-9 C-12 9 -14 7 -14 4 Z', 4, C.meat, C.meatD) +
        N('M-12.7 -7 C-12 -8.8 -10 -8.8 -8 -8.8 H10 C12.5 -8.8 13.8 -7.4 13.9 -5 V-3 H-12.8 Z', C.fat) + K.line('M-13 -3 H14', 1.3));
      return K.shadow(26) + sl(18, 22) + sl(30, 30) + sl(42, 38) + K.badge('goose', 14, 49, 10);
    },
    goose_fat: () => fatJar(C.creamL, C.blue, 'goose'),
    rabbit_meat: () =>
      K.shadow(26) +
      ext('M6 26 C6 21 10 19 16 19 H46 C52 19 55 22 55 26 C55 30 52 33 46 33 H16 C10 33 6 31 6 26 Z', 4, C.pinkL, C.pink) +
      K.line('M16 23 V30 M24 22 V31 M32 22 V31 M40 22 V31', 1.3, C.pink) +
      at(8, 45, -6, drum(C.pinkL, C.pink, 0.8), 0.95) + K.badge('rabbit', 51, 50, 10),

    // ---- charcuterie ----
    bacon: () => {
      const r = (y, x0, x1) => P(wave(y, 12, x0, x1), C.meat) + N(wave(y, 3.5, x0, x1), C.fat) + N(wave(y + 7, 2, x0, x1), C.fat) +
        `<path d="${wave(y, 12, x0, x1)}" fill="none"/>`;
      return K.shadow(26) + r(9, 8, 58) + r(25, 4, 56) + r(41, 7, 59);
    },
    pancetta: () =>
      K.shadow(25) +
      P('M24 14 H46 C55 14 60 24 60 36 C60 48 55 58 46 58 H24 Z', C.creamD) +
      K.line('M34 14.5 C37 24 37 48 34 57.5 M46 14.5 C50 24 50 48 46 57.5', 2.5, C.brownL) +
      K.dots([[41, 22], [44, 34], [40, 46], [53, 26], [55, 40], [52, 50]], 1, C.ink) +
      `<ellipse cx="24" cy="36" rx="16" ry="22" fill="${C.fat}"/>` +
      K.line('M24 36 C24 32 28 32 28 37 C28 42 20 43 19 36 C18 28 31 26 32 37 C33 48 16 50 14 37 C12 24 26 18 34 22', 3.2, C.meat) +
      K.hiE(14, 22, 3, 2),
    guanciale: () =>
      K.shadow(26) +
      ext('M5 30 L26 14 C38 11 52 15 59 24 L38 41 C26 43 12 38 5 30 Z', 11, C.creamD, C.fat) +
      K.line('M6 37 C14 44 26 48 38 47 L58 31', 2.4, C.pink) +
      K.dots([[16, 28], [22, 22], [28, 18], [36, 16], [44, 18], [50, 22], [26, 28], [34, 24], [42, 26], [32, 33], [20, 33], [44, 32]], 1.1, C.ink) +
      K.hi('M10 30 L27 17 L31 18 L14 31 Z'),
    prosciutto: () =>
      K.shadow(24, 58, 36) +
      K.line('M17 9 L15 3', 1.6) +
      P('M13 9 C16 6 21 7 22 11 L26 20 C40 18 56 28 58 42 C60 54 48 60 36 57 C22 53 13 43 15 30 L12 14 C11.5 12 12 10 13 9 Z', C.woodL) +
      N('M56 38 C58 50 50 58 40 57.5 C50 54 55 47 56 38 Z', C.wood) +
      `<ellipse cx="40" cy="42" rx="13" ry="10" transform="rotate(-35 40 42)" fill="${C.fat}"/>` +
      `<ellipse cx="41" cy="42" rx="9.5" ry="7" transform="rotate(-35 41 42)" fill="${C.meatD}" stroke-width="1.6"/>` +
      K.line('M36 46 C39 42 43 40 46 38', 1.3, C.meat) +
      K.hi('M16 15 L20 15 L22 26 C20 30 19 34 19 38 L17 36 C16 30 16 24 16 15 Z'),
    ham: () =>
      K.shadow(26) +
      `<path d="M20 22 L9 10" stroke-width="7"/><path d="M20 22 L9 10" stroke="${C.creamL}" stroke-width="3.5"/>` +
      `<circle cx="6.5" cy="10" r="3.2" fill="${C.creamL}" stroke-width="2"/><circle cx="9" cy="6.5" r="3.2" fill="${C.creamL}" stroke-width="2"/>` +
      P('M18 20 C28 12 50 14 57 28 C62 42 52 56 36 56 C22 56 10 48 10 36 C10 29 13 24 18 20 Z', C.orange) +
      N('M54 26 C60 38 56 52 42 55.5 C52 50 56 40 54 26 Z', C.orangeD) +
      K.line('M30 18 L50 46 M40 16 L56 38 M24 26 L40 52 M36 52 L54 26 M28 46 L46 18', 1.3, C.orangeD) +
      `<ellipse cx="21" cy="39" rx="11" ry="14" fill="${C.fat}"/><ellipse cx="22" cy="39.5" rx="8" ry="11" fill="${C.pink}" stroke-width="1.6"/>` +
      K.hiE(19, 34, 2.5, 3.5, 10),
    pork_sausages: () => {
      const s = (x, y) => at(x, y, -34, P('M-5 -6.5 H5 C13 -6.5 13 6.5 5 6.5 H-5 C-13 6.5 -13 -6.5 -5 -6.5 Z', C.pink) + K.hiE(-2, -3, 5, 1.4, 0));
      return K.shadow(26) + s(14, 45) + s(32, 33) + s(50, 21) +
        `<circle cx="23" cy="39" r="2.2" fill="${C.pinkD}" stroke-width="1.6"/><circle cx="41" cy="27" r="2.2" fill="${C.pinkD}" stroke-width="1.6"/>` +
        K.dots([[10, 46], [16, 43], [30, 34], [35, 31], [48, 22], [53, 19]], 0.9, C.pinkD);
    },
    chorizo: () => {
      const U = 'M14 50 C5 30 17 10 32 10 C47 10 59 30 50 50';
      return K.shadow(26) + `<path d="${U}" stroke-width="15" fill="none"/><path d="${U}" stroke="${C.redD}" stroke-width="10" fill="none"/>` +
        `<path d="M11.5 32 C12 22 20 15 28 13.5" stroke="#fff" stroke-opacity=".3" stroke-width="2.5" fill="none"/>` +
        speck([[14, 40], [20, 22], [44, 18], [52, 34], [30, 13], [48, 44]]) +
        K.line('M10 52 L18 49 M46 49 L54 52', 2.5) +
        `<ellipse cx="32" cy="46" rx="10" ry="7" fill="${C.redL}"/>` + K.dots([[27, 45], [33, 43], [36, 48], [30, 49], [38, 44]], 1.2, C.fat);
    },
    salami: () =>
      K.shadow(26) +
      P('M14 12 H48 C58 12 58 36 48 36 H14 Z', C.greyL) +
      K.line('M24 12.5 V35.5 M34 12.5 V35.5 M44 12.5 V35.5 M14.5 24 H55', 1.2, C.grey) +
      `<ellipse cx="14" cy="24" rx="6.5" ry="12" fill="${C.meat}"/>` + K.dots([[12, 19], [15, 25], [12, 30], [16, 17]], 1.1, C.fat) +
      at(24, 47, 0, `<ellipse cx="0" cy="0" rx="13" ry="8" fill="${C.meat}"/>` + K.dots([[-6, -2], [0, -4], [5, 1], [-2, 3], [7, -3], [-8, 3]], 1.2, C.fat)) +
      at(44, 47, 0, `<ellipse cx="0" cy="0" rx="13" ry="8" fill="${C.meat}"/>` + K.dots([[-6, -2], [0, -4], [5, 1], [-2, 3], [7, -3], [-8, 3]], 1.2, C.fat)),
    pepperoni: () => {
      const sl = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="6.5" fill="${C.red}"/>` + K.dots([[x - 4, y - 2], [x + 2, y - 3], [x + 4, y + 1.5], [x - 1, y + 2]], 1.1, C.redD);
      return K.shadow(26) +
        `<path d="M10 34 L52 10" stroke-width="10"/><path d="M10 34 L52 10" stroke="${C.redD}" stroke-width="5.5"/>` +
        sl(16, 48) + sl(30, 44) + sl(44, 48) + sl(23, 37) + sl(38, 36);
    },
    pastrami: () => {
      const sl = (x, y, r) => at(x, y, r,
        P('M-20 -6 C-20 -10 -16 -11 -12 -11 H16 C20 -11 22 -8 21 -4 L19 6 C18 10 15 11 12 11 H-14 C-18 11 -21 8 -20 4 Z', C.choc) +
        `<g transform="scale(.82)">${N('M-20 -6 C-20 -10 -16 -11 -12 -11 H16 C20 -11 22 -8 21 -4 L19 6 C18 10 15 11 12 11 H-14 C-18 11 -21 8 -20 4 Z', C.meatL)}</g>` +
        K.line('M-12 -4 C-6 -1 4 -3 12 0 M-10 3 C-4 5 4 4 10 6', 1.2, C.meat) + K.dots([[-17, -6], [-9, -10], [6, -10], [19, -4], [17, 5], [3, 10], [-12, 10], [-19, 2]], 0.9, C.ink));
      return K.shadow(26) + sl(28, 20, -8) + sl(34, 31, -2) + sl(30, 43, 4);
    },
    corned_beef: () =>
      K.shadow(27) +
      P('M5 28 L26 39 L59 27 V40 L26 53 L5 42 Z', C.pink) +
      N('M5 28 L26 39 L59 27 V30.5 L26 42.5 L5 31.5 Z', C.fat) +
      K.line('M5 31.5 L26 42.5 L59 30.5', 1.3) + K.line('M10 37 V44 M16 40 V47 M21 43 V50 M33 46 V50 M41 43 V47 M49 40 V44', 1.2, C.pinkD) +
      K.sh('M26 39 L59 27 V40 L26 53 Z') + K.line('M26 39 V53', 2.5) +
      P('M5 28 L37 15 L59 27 L26 39 Z', C.pinkL) + K.line('M12 28 L40 18 M18 31 L46 21 M24 34 L52 24', 1.2, C.pink) +
      K.hi('M14 27 L36 18.5 L41 21 L19 30 Z') + K.badge('cattle', 50, 49, 11),
  });
})(FSI);
