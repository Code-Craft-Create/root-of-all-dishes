// Meat cuts as sold: beef, veal, pork, lamb, goat (3/4 view from slightly above, like `cheddar`).
(function (FSI) {
  const { C, K } = FSI;
  const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
  const N = (d, fill) => `<path d="${d}" fill="${fill}" stroke="none"/>`;
  // Extrude a top-face outline downward by `d` units: thick-outlined side, then the top face.
  const ext = (T, d, top, side, extra = '') => {
    const n = Math.max(1, Math.ceil(d / 1.5)), offs = [];
    for (let i = 0; i <= n; i++) offs.push(((d * i) / n).toFixed(2));
    return `<g fill="${side}" stroke-width="5">${offs.map((o) => `<path d="${T}" transform="translate(0 ${o})"/>`).join('')}</g>` +
      `<g fill="${side}" stroke="none">${offs.map((o) => `<path d="${T}" transform="translate(0 ${o})"/>`).join('')}</g>` +
      `<path d="${T}" fill="${top}"${extra}/>`;
  };
  // Mince heaped in a butcher's tray.
  const mince = (meat, dark, src) =>
    K.shadow(27, 57) +
    `<rect x="4" y="25" width="56" height="18" rx="6" fill="${C.greyL}"/>` +
    P('M9 37 C7 29 13 22 20 23 C22 15 31 13 35 18 C40 12 49 15 49 22 C55 22 58 29 56 37 Z', meat) +
    K.line('M15 30 c2 -2 4 0 2 2 M23 25 c2 -2 4 0 2 2 M31 21 c2 -2 4 0 2 2 M40 20 c2 -2 4 0 2 2 M45 27 c2 -2 4 0 2 2 M27 31 c2 -2 4 0 2 2 M36 29 c2 -2 4 0 2 2 M50 32 c2 -2 4 0 2 2 M20 34 c2 -2 4 0 2 2', 1.3, dark) +
    K.hiE(22, 26, 3.5, 2) +
    P('M4 34 H60 L57 51 C56.6 53 55 54 53 54 H11 C9 54 7.4 53 7 51 Z', C.white) +
    K.sh('M50 34 H60 L57 51 C56.6 53 55 54 53 54 H49 C52 48 52 40 50 34 Z') + K.badge(src, 50, 46, 11);
  // Cartoon bone, horizontal, centred at 0,0 with half-length L.
  const bone = (L, w, fill = C.creamL) =>
    P(`M${-L + 3} ${-w} H${L - 3} C${L - 4} ${-w - 6} ${L + 5} ${-w - 6} ${L + 3} ${-w + 0.5} C${L + 7} ${-w + 1} ${L + 7} ${w - 1} ${L + 3} ${w - 0.5} C${L + 5} ${w + 6} ${L - 4} ${w + 6} ${L - 3} ${w} H${-L + 3} C${-L + 4} ${w + 6} ${-L - 5} ${w + 6} ${-L - 3} ${w - 0.5} C${-L - 7} ${w - 1} ${-L - 7} ${-w + 1} ${-L - 3} ${-w + 0.5} C${-L - 5} ${-w - 6} ${-L + 4} ${-w - 6} ${-L + 3} ${-w} Z`, fill);
  const at = (x, y, r, m) => `<g transform="translate(${x} ${y}) rotate(${r})">${m}</g>`;
  // Fat in a jar (tallow, fats) with the source animal on a badge.
  const fatJar = (fill, lid, src) => K.jar(fill, lid, '') + K.line('M20 30 C26 28 34 31 44 28', 1.3, C.creamD) + K.badge(src, 47, 47, 12);
  // Club-shaped joint (leg / shank) along +x with a bone sticking out on the left.
  const club = (meat, side, fat) =>
    P('M4 -3 H22 V3 H4 Z', C.creamL) + `<circle cx="4" cy="-3.5" r="4" fill="${C.creamL}"/><circle cx="4" cy="3.5" r="4" fill="${C.creamL}"/>` +
    `<path d="M2 -0.5 V0.5" stroke="${C.creamL}" stroke-width="5"/>` +
    P('M18 -5 C24 -14 40 -18 50 -14 C58 -10 60 0 57 8 C54 15 44 18 34 15 C26 13 20 9 18 5 Z', meat) +
    N('M57 2 C56 11 47 16 36 14 C46 18 56 14 57 8 Z', side) +
    (fat ? N('M24 -9 C32 -14 42 -15 48 -13 C44 -11 34 -10 26 -6 Z', fat) : '') + K.hiE(34, -8, 6, 2, -8);

  FSI.add('animals_meat', {
    beef_steak: () =>
      K.shadow(26) +
      ext('M6 28 C6 17 20 11 34 13 C48 15 59 22 57 34 C55 44 44 48 34 46 C27 45 23 41 17 41 C10 41 6 35 6 28 Z', 6, C.meat, C.meatD) +
      N('M34 13.3 C48 15 58.8 22 56.6 34 C55 42 47 46.5 39 46.6 C46 43 51 38 51 31 C51 23 44 18 34 17.5 Z', C.fat) +
      K.line('M34 17.5 C44 18 51 23 51 31 C51 38 46 43 39.5 46.3', 1.5) +
      `<ellipse cx="44" cy="31" rx="3" ry="9" fill="${C.creamL}" stroke-width="1.6"/>` +
      K.line('M14 30 C18 28 21 32 25 30 M24 37 C28 35 31 39 35 37 M20 22 C23 21 26 23 29 22', 1.3, C.meatL) +
      K.hiE(15, 23, 4, 2),
    beef_mince: () => mince(C.meat, C.meatD, 'cattle'),
    beef_brisket: () =>
      K.shadow(27) +
      P('M5 28 L26 39 L59 27 V40 L26 53 L5 42 Z', C.meat) +
      N('M5 28 L26 39 L59 27 V32 L26 44.5 L5 33 Z', C.fat) +
      K.line('M5 33 L26 44.5 L59 32', 1.5) + K.line('M10 37 V44 M16 40 V47 M21 43 V50 M33 46 V50 M41 43 V47 M49 40 V44', 1.2, C.meatD) +
      K.sh('M26 39 L59 27 V40 L26 53 Z') + K.line('M26 39 V53', 2.5) +
      P('M5 28 L37 15 L59 27 L26 39 Z', C.cream) + K.hi('M14 27 L36 18.5 L41 21 L19 30 Z') +
      K.badge('cattle', 50, 49, 11),
    beef_short_ribs: () => {
      const rib = (x, y) =>
        P(`M${x} ${y + 5} H${x + 40} V${y + 11} H${x} Z`, C.creamL) +
        `<ellipse cx="${x}" cy="${y + 8}" rx="2.6" ry="3.6" fill="${C.cream}" stroke-width="2"/>` +
        P(`M${x + 3} ${y + 6} C${x + 3} ${y - 2} ${x + 8} ${y - 5} ${x + 15} ${y - 5} H${x + 34} C${x + 40} ${y - 5} ${x + 44} ${y - 1} ${x + 44} ${y + 6} Z`, C.meat) +
        N(`M${x + 6} ${y - 1} C${x + 9} ${y - 3.5} ${x + 12} ${y - 4} ${x + 16} ${y - 4} H${x + 32} C${x + 28} ${y - 2} ${x + 14} ${y - 1} ${x + 6} ${y + 1} Z`, C.fat);
      return K.shadow(26) + rib(15, 16) + rib(11, 29) + rib(7, 42) + K.line('M18 41 L50 41 M14 54 L48 54', 1.2, C.meatD);
    },
    beef_sirloin: () =>
      K.shadow(27) +
      P('M14 21 H48 C56 21 60 29 60 37 C60 46 56 53 48 53 H14 Z', C.meat) +
      P('M14 21 H48 C54 21 58 25 59.5 31 C52 29 34 28 14 29 Z', C.fat) +
      K.sh('M48 49 C54 49 58 45 59 39 C60 47 56 53 48 53 H14 V49 Z') +
      `<ellipse cx="14" cy="37" rx="10" ry="16" fill="${C.meatL}"/>` +
      N('M14 21.2 C9 21.2 5 25 4.3 31 C7 27 10 26 14 26 C18 26 21 27 23.7 31 C23 25 19 21.2 14 21.2 Z', C.fat) +
      K.line('M4.8 30.5 C7 27 10 26 14 26 C18 26 21 27 23.3 30.5', 1.3) +
      K.line('M8 38 C11 36 15 39 19 37 M9 45 C12 44 15 46 18 45', 1.2, C.meat) + K.hiE(34, 25, 7, 1.6, 0),
    beef_shank: () =>
      K.shadow(25, 56) +
      ext('M8 30 C8 19 20 12 32 12 C46 12 56 20 56 30 C56 40 46 46 32 46 C18 46 8 40 8 30 Z', 7, C.meat, C.meatD) +
      K.line('M14 24 C20 26 22 32 18 38 M42 16 C40 22 44 28 52 28 M30 41 C32 37 38 36 42 40', 1.5, C.fat) +
      `<ellipse cx="33" cy="29" rx="9" ry="6.5" fill="${C.creamL}"/><ellipse cx="33" cy="29" rx="4.5" ry="3" fill="${C.pinkL}" stroke-width="1.6"/>` +
      K.hiE(18, 21, 4, 2) + K.badge('cattle', 50, 49, 11),
    beef_bones: () =>
      K.shadow(24) +
      P('M8 22 C11 30 11 44 8 52 C12 56 26 56 30 52 C27 44 27 30 30 22 Z', C.creamL) +
      `<ellipse cx="19" cy="22" rx="11" ry="5" fill="${C.cream}"/><ellipse cx="19" cy="22" rx="6" ry="2.6" fill="${C.yellowL}" stroke-width="1.6"/>` +
      K.hi('M11 27 C12.5 35 12.5 43 11.5 50 L14 51 C15 43 15 35 13.5 27 Z') +
      P('M30 32 C33 39 33 48 30 54 C34 58 46 58 50 54 C47 48 47 39 50 32 Z', C.creamL) +
      `<ellipse cx="40" cy="32" rx="10" ry="4.5" fill="${C.cream}"/><ellipse cx="40" cy="32" rx="5.5" ry="2.3" fill="${C.yellowL}" stroke-width="1.6"/>` +
      K.badge('cattle', 50, 16, 11),
    beef_tallow: () => fatJar(C.cream, C.red, 'cattle'),
    veal_escalope: () =>
      K.shadow(27, 56) +
      ext('M5 32 C5 22 16 15 28 17 C36 13 50 14 56 22 C61 28 58 38 52 41 C44 46 32 44 22 45 C12 46 5 40 5 32 Z', 3.5, C.pinkL, C.pink) +
      K.line('M14 30 C20 27 24 33 30 30 C34 28 38 32 44 29 M18 38 C24 36 28 39 34 37 M30 22 C34 21 38 23 42 22', 1.3, C.pink) +
      K.hiE(16, 25, 4, 2) + K.badge('calf', 50, 48, 11),
    veal_shank: () =>
      K.shadow(24) + at(8, 30, 22, club(C.pinkL, C.pink, '')) +
      K.line('M30 32 C34 36 40 37 46 35', 1.3, C.pink) + K.badge('calf', 50, 49, 11),
    rennet: () => K.bottle(C.wheatL, 'flask', C.creamL, '') + K.badge('calf', 48, 48, 12),

    pork_chop: () =>
      K.shadow(26) +
      ext('M6 34 C5 24 13 17 24 17 C32 17 36 20 42 18 C50 15 58 19 58 27 C58 33 53 36 50 41 C46 47 38 50 28 50 C16 50 7 44 6 34 Z', 5, C.pink, C.pinkD) +
      N('M7.2 34 C6.4 26 12 19 22 18.3 C16 22 12 28 13 35 C14 42 20 46 28 46.6 C38 47 45 44 49.5 39 C46 45 38 48.8 28 48.8 C17 48.8 8 43 7.2 34 Z', C.fat) +
      K.line('M22 18.4 C16 22 12 28 13 35 C14 42 20 46 28 46.6 C38 47 45 44 49.5 39.5', 1.4) +
      P('M40 19 C48 16 56 19 56 26 C56 31 52 33 49 37 L45 34 C48 30 52 28 51 24 C50 21 46 21 42 23 Z', C.creamL, ' stroke-width="2"') +
      `<ellipse cx="29" cy="33" rx="12" ry="9" fill="${C.pinkL}" stroke="${C.pinkD}" stroke-width="1.3"/>` + K.hiE(23, 29, 4, 1.8),
    pork_belly: () => {
      const band = (a, b) => N(`M5 ${30 + a} L26 ${41 + a} L59 ${29 + a} V${29 + b} L26 ${41 + b} L5 ${30 + b} Z`, C.fat);
      return K.shadow(27) +
        P('M5 30 L26 41 L59 29 V41 L26 53 L5 42 Z', C.pink) + band(1.5, 4) + band(7, 8.5) +
        K.line('M5 34 L26 45 L59 33 M5 38.5 L26 49.5 L59 37.5', 1.1, C.pinkD) +
        K.sh('M26 41 L59 29 V41 L26 53 Z') + `<path d="M5 30 L26 41 L59 29 V41 L26 53 L5 42 Z" fill="none"/>` + K.line('M26 41 V53', 2.5) +
        P('M5 30 L37 17 L59 29 L26 41 Z', C.creamD) +
        K.line('M13 27.5 L34 37.5 M21 24.5 L42 34.5 M29 21 L50 31.5 M38 18.5 L18 33 M48 22 L28 37', 1.2, C.wheatD);
    },
    pork_shoulder: () =>
      K.shadow(26) +
      P('M7 48 C4 34 14 18 32 18 C50 18 60 34 57 48 C50 54 14 54 7 48 Z', C.pink) +
      P('M8 42 C9 30 18 21 32 21 C46 21 55 30 56 42 C50 36 42 34 32 34 C22 34 13 37 8 42 Z', C.pinkL, ' stroke="none"') +
      K.sh('M50 26 C56 32 58 41 57 48 C53 51 46 52 40 52.5 C48 46 52 36 50 26 Z') +
      [18, 32, 46].map((x) => `<path d="M${x} ${x === 32 ? 18 : 22} C${x - 3} ${32} ${x - 3} ${44} ${x} ${x === 32 ? 53 : 51}" fill="none" stroke-width="4"/><path d="M${x} ${x === 32 ? 18 : 22} C${x - 3} 32 ${x - 3} 44 ${x} ${x === 32 ? 53 : 51}" fill="none" stroke="${C.creamL}" stroke-width="1.6"/>`).join('') +
      K.hiE(22, 26, 4, 2) + K.badge('pig', 50, 48, 11),
    pork_mince: () => mince(C.pink, C.pinkD, 'pig'),
    pork_leg: () =>
      K.shadow(26) +
      P('M8 22 C5 26 5 34 9 37 L22 42 C26 52 40 56 50 52 C60 47 60 33 52 26 C44 19 32 22 24 26 L12 21 Z', C.pinkL) +
      P('M50 26 C58 30 61 40 57 47 C54 53 46 55 40 53 C46 50 52 42 50 26 Z', C.pink, ' stroke="none"') +
      `<ellipse cx="43" cy="38" rx="10" ry="12.5" transform="rotate(25 43 38)" fill="${C.fat}"/>` +
      `<ellipse cx="44" cy="38.5" rx="7" ry="9.5" transform="rotate(25 44 38.5)" fill="${C.pink}" stroke-width="1.6"/>` +
      `<ellipse cx="46" cy="37" rx="2" ry="2.6" fill="${C.creamL}" stroke-width="1.5"/>` +
      P('M4 22 C3 26 4 33 8 37 L11 36 C9 31 9 26 10 22 Z', C.pinkD, ' stroke-width="2"') +
      K.hi('M14 25 L26 29 C24 30 22 31 20 33 L13 30 Z') + K.badge('pig', 50, 16, 10),
    pork_cheek: () => {
      const ch = (x, y, r) => at(x, y, r,
        P('M-12 0 C-12 -7 -5 -10 2 -9 C9 -8 13 -4 13 1 C13 7 6 10 -1 9 C-8 8 -12 6 -12 0 Z', C.meatL) +
        K.line('M-7 1 C-2 -2 4 -1 8 2', 1.3, C.fat) + K.hiE(-5, -4, 3, 1.5));
      return K.shadow(25) + ch(20, 26, -10) + ch(42, 26, 15) + ch(29, 44, 5) + K.badge('pig', 51, 49, 10);
    },
    pork_bones: () =>
      K.shadow(24) + at(30, 34, 35, bone(17, 4)) + at(30, 34, -35, bone(17, 4)) +
      K.hi('M20 24 L36 46 L37 44 L22 23 Z') + K.badge('pig', 50, 49, 10),
    lard: () =>
      K.shadow(26) +
      P('M7 28 L27 37 V52 L7 44 Z', C.white) + P('M27 37 L57 25 V40 L27 52 Z', C.white) +
      P('M7 34 L27 43 L57 31 V40 L27 52 L7 44 Z', C.blueL) + K.line('M27 43 V52', 2) +
      K.sh('M27 37 L57 25 V40 L27 52 Z') + K.line('M27 37 V43', 2.5) +
      P('M7 28 L37 17 L57 25 L27 37 Z', C.white) + K.hi('M14 27.5 L36 19.5 L40 21 L18 29.5 Z') +
      K.badge('pig', 50, 49, 10),
    sausage_casings: () => {
      const ring = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke-width="6"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${C.creamL}" stroke-width="2.6"/>`;
      return K.shadow(26) + ring(30, 42, 24, 11) + ring(32, 36, 20, 9) + ring(30, 30, 16, 7.5) +
        `<path d="M44 26 C50 20 54 14 58 12" fill="none" stroke-width="6"/><path d="M44 26 C50 20 54 14 58 12" fill="none" stroke="${C.creamL}" stroke-width="2.6"/>` +
        K.badge('pig', 51, 51, 10);
    },

    lamb_chops: () => {
      const chop = (x, y, r) => at(x, y, r,
        P('M4 -2.5 H34 C37 -2.5 38 2.5 34 2.5 H4 Z', C.creamL) +
        `<ellipse cx="0" cy="0" rx="12" ry="10" fill="${C.fat}"/><ellipse cx="-1.5" cy="1" rx="8" ry="7" fill="${C.meat}" stroke-width="1.6"/>` +
        K.hiE(-4, -2, 3, 1.5));
      return K.shadow(26) + chop(17, 42, -40) + chop(32, 46, -55);
    },
    lamb_leg: () => K.shadow(25) + at(6, 32, 18, club(C.meatL, C.meat, C.fat)) + K.badge('sheep', 50, 50, 10),
    lamb_shoulder: () =>
      K.shadow(26) +
      ext('M6 22 C14 16 30 15 44 20 C54 24 60 32 58 40 C56 46 46 48 36 46 L18 40 C11 37 6 30 6 22 Z', 5, C.meatL, C.meat) +
      N('M8 22 C16 18 30 17 42 21 C34 21 22 22 9 26 Z', C.fat) + K.line('M18 32 C26 30 36 32 44 38 M28 24 C34 24 42 26 48 30', 1.3, C.fat) +
      `<circle cx="10" cy="24" r="4.5" fill="${C.creamL}"/><circle cx="16" cy="24" r="3" fill="${C.creamL}" stroke-width="2"/>` +
      K.hiE(30, 22, 5, 1.6, -5) + K.badge('sheep', 50, 49, 10),
    lamb_mince: () => mince(C.meatL, C.meatD, 'sheep'),
    lamb_bones: () =>
      K.shadow(24) + at(28, 24, -12, bone(16, 3)) + at(30, 36, -12, bone(18, 3.4)) + at(26, 48, -12, bone(13, 3)) +
      K.badge('sheep', 51, 50, 10),

    goat_meat: () => {
      const cube = (x, y) =>
        P(`M${x} ${y} L${x + 9} ${y + 5} V${y + 15} L${x} ${y + 10} Z`, C.meat) +
        P(`M${x + 9} ${y + 5} L${x + 19} ${y} V${y + 10} L${x + 9} ${y + 15} Z`, C.meatD) +
        P(`M${x} ${y} L${x + 10} ${y - 5} L${x + 19} ${y} L${x + 9} ${y + 5} Z`, C.meatL) +
        K.line(`M${x + 3} ${y - 1} L${x + 12} ${y + 3}`, 1.3, C.fat);
      return K.shadow(26) + cube(23, 16) + cube(9, 30) + cube(34, 30) + cube(21, 40) +
        `<ellipse cx="16" cy="25" rx="5" ry="3.5" fill="${C.creamL}" stroke-width="2"/>` + K.badge('goat', 51, 49, 10);
    },
  });
})(FSI);
