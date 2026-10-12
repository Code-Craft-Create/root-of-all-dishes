// Livestock, eggs (see animals_meat-2.js for meat cuts and charcuterie).
(function (FSI) {
  const { C, K } = FSI;
  const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
  // Thin legs/feet drawn as an ink line with a coloured core.
  const leg = (d, col, w = 3.5) => `<path d="${d}" fill="none" stroke-width="${w}"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w - 2}"/>`;
  const egg = (cx, top, w, h, fill) => {
    const b = top + h, r = w / 2, m = top + h * 0.6;
    return `M${cx} ${top} C${cx + r * 0.72} ${top} ${cx + r} ${top + h * 0.38} ${cx + r} ${m} C${cx + r} ${b - h * 0.12} ${cx + r * 0.55} ${b} ${cx} ${b} C${cx - r * 0.55} ${b} ${cx - r} ${b - h * 0.12} ${cx - r} ${m} C${cx - r} ${top + h * 0.38} ${cx - r * 0.72} ${top} ${cx} ${top} Z`;
  };
  FSI.animals_meat = { P, leg, egg };

  FSI.add('animals_meat', {
    // ---- livestock: whole animal, side view facing left, like `cattle` ----
    calf: () =>
      K.shadow(22) +
      P('M22 40 V55 H26.5 V42 M45 40 V55 H49.5 V40', C.greyL) +
      P('M19 32 C19 27 22 26 27 26 H46 C51 26 54 29 54 34 V39 C54 43 51 45 46 45 H25 C21 45 19 43 19 39 Z', C.white) +
      `<path d="M33 27 C38 26 43 28 42 33 C41 37 35 38 32 35 C30 32 30 28 33 27 Z M46 27 C50 26 53 29 53 33 C50 34 46 32 46 27 Z M24 38 C27 36 30 39 28 43 C26 44 22 43 22 41 Z" fill="${C.black}" stroke="none"/>` +
      P('M28 44 V56 H32.5 V44 M40 44 V56 H44.5 V44', C.white) +
      `<path d="M54 30 C57 33 57 39 56 43" stroke-width="2" fill="none"/>` +
      P('M8 21 L1 20 C1 24 4 26 8 25 Z M20 21 L27 20 C27 24 24 26 20 25 Z', C.black) +
      P('M7 23 C7 19 10 17 14 17 C18 17 21 19 21 23 V31 C21 34 18 36 14 36 C10 36 7 34 7 31 Z', C.white) +
      `<path d="M14 17 C18 17 21 19 21 23 V27 C18 27 15 24 14 17 Z" fill="${C.black}" stroke="none"/>` +
      P('M6 30 C6 28 9 27 14 27 C19 27 22 28 22 30 V33 C22 36 18 38 14 38 C10 38 6 36 6 33 Z', C.pinkL) +
      K.dots([[10.5, 32], [17.5, 32]], 1.2) + K.dots([[10, 22], [18, 22]], 1.5) +
      K.sh('M47 43 C51 43 53 41 53 37 V39 C53 43 51 45 46 45 Z'),
    pig: () =>
      K.shadow(26) +
      P('M19 42 V55 H24 V44 M45 42 V55 H50 V42', C.pink) +
      `<path d="M57 31 C61 28 63 33 60 35 C57 37 56 33 59 32" stroke-width="2" fill="none"/>` +
      P('M12 33 C12 23 20 18 31 18 H44 C53 18 58 24 58 33 C58 42 53 48 44 48 H27 C18 48 12 42 12 33 Z', C.pink) +
      P('M25 45 V56 H30 V45 M38 45 V56 H43 V45', C.pinkD) +
      P('M8 27 C8 21 12 18 18 18 C23 18 26 22 26 28 V34 C26 39 22 42 16 42 C11 42 8 39 8 34 Z', C.pink) +
      P('M18 19 L22 10 L25 20 Z', C.pinkD) +
      `<ellipse cx="6.5" cy="32" rx="3.8" ry="5.5" fill="${C.pinkL}"/>` +
      K.dots([[5.5, 30.5], [5.5, 33.5]], 1.1) + K.dots([[13, 26]], 1.6) +
      P('M11 21 L7 11 L17 18 Z', C.pinkD) +
      K.hi('M30 21 H46 C44 23.5 36 24.5 30 24 Z') + K.sh('M44 46 C51 46 56 41 57 35 C57 42 53 48 44 48 Z'),
    sheep: () =>
      K.shadow(25) +
      P('M24 40 V55 H28.5 V40 M46 40 V55 H50.5 V40', C.black) +
      P('M19 24 C19 18 26 16 30 19 C33 15 41 15 44 19 C48 16 56 18 56 24 C61 27 61 35 57 38 C59 44 53 48 48 46 C45 50 37 50 34 46 C30 50 22 49 20 45 C15 44 14 37 16 34 C13 30 15 25 19 24 Z', C.creamL) +
      K.line('M30 24 C32 26 35 26 37 24 M44 30 C46 32 49 32 51 30 M26 36 C28 38 31 38 33 36 M40 40 C42 42 45 42 47 40', 1.3, C.creamD) +
      P('M29 45 V56 H33.5 V45 M41 45 V56 H45.5 V45', C.black) +
      P('M8 25 L1 26 L4 30 L9 29 Z', C.black) +
      P('M8 23 C8 19 12 17 16 17 C20 18 23 21 22 26 L20 36 C19 39 16 41 12 40 C8 40 6 38 6 35 Z', C.black) +
      P('M11 20 C10 14 15 12 18 14 C21 12 26 15 24 20 C22 23 13 24 11 20 Z', C.creamL) +
      K.dots([[13, 27]], 1.6, C.white) +
      K.hi('M26 21 C30 18 34 18 37 21 C33 20 29 21 26 23 Z'),
    goat: () =>
      K.shadow(22) +
      P('M24 38 V55 H28 V38 M45 38 V55 H49 V38', C.grey) +
      P('M51 25 L55 15 L56 26 Z', C.greyL) +
      P('M18 28 C18 24 21 23 26 23 H48 C52 23 55 26 55 30 V36 C55 40 52 42 48 42 H25 C21 42 18 40 18 36 Z', C.greyL) +
      P('M29 41 V56 H33 V41 M41 41 V56 H45 V41', C.grey) +
      P('M17 15 C16 7 22 3 29 6 C24 6 20 9 20 15 Z', C.brownL) +
      P('M14 15 C18 13 22 15 23 19 L26 30 C24 33 20 33 18 31 L14 27 L7 25 C4 24 4 20 7 19 Z', C.greyL) +
      P('M20 18 L29 22 L21 23 Z', C.grey) +
      P('M8 24 L10 32 L13 26 Z', C.greyD) +
      K.dots([[14, 19]], 1.6) + K.dots([[6.5, 21]], 1) +
      K.hi('M26 25.5 H44 C42 27.5 32 28.5 26 28 Z') + K.sh('M48 40 C52 40 54 38 54 34 V36 C54 40 52 42 48 42 Z'),
    broiler_chicken: () =>
      K.shadow(18, 58, 33) +
      leg('M28 49 V56 M24 56 H31', C.orange) + leg('M37 49 V56 M34 56 H41', C.orange) +
      P('M42 30 C45 16 54 9 60 12 C61 22 58 33 51 38 Z', C.white) +
      K.line('M50 18 C49 24 48 28 46 32 M56 16 C55 24 53 30 50 35', 1.3, C.greyL) +
      P('M14 26 C17 21 22 22 26 27 C31 31 40 29 48 30 C56 33 56 45 49 50 C43 55 27 55 20 49 C14 44 12 33 14 26 Z', C.white) +
      P('M27 37 C33 33 43 34 46 40 C42 46 32 47 27 41 Z', C.cream, ' stroke-width="2"') +
      K.line('M32 41 C36 42 40 42 43 40', 1.2, C.creamD) +
      P('M11 11 C10 6 14 5 16 8 C17 4 21 4 21 8 C23 6 26 9 23 13 Z', C.red) +
      `<circle cx="17" cy="18" r="7.5" fill="${C.white}"/>` +
      P('M10 16.5 L4 19 L10 21.5 Z', C.orange, ' stroke-width="2"') +
      P('M11 23 C10 29 15 29 14.5 23 Z', C.red, ' stroke-width="2"') +
      K.dots([[15, 16.5]], 1.6) +
      K.sh('M50 36 C54 40 53 47 48 50 C42 54 30 54 24 51 C34 52 46 48 50 36 Z'),
    duck: () =>
      K.shadow(22, 58, 33) +
      leg('M29 47 V55', C.orange) + leg('M37 47 V55', C.orange) +
      P('M23 57 L29 54 L33 57 Z M31 57 L37 54 L41 57 Z', C.orange, ' stroke-width="1.8"') +
      P('M14 36 C14 30 20 27 28 28 H48 C54 28 58 25 60 22 C61 34 56 46 42 48 H26 C18 48 14 43 14 36 Z', C.greyL) +
      P('M14 36 C14 30 20 27 28 28 C24 33 24 42 29 48 H26 C18 48 14 43 14 36 Z', C.brown) +
      P('M31 33 C38 30 50 30 55 31 C51 40 40 43 33 40 C31 38 30 35 31 33 Z', C.grey, ' stroke-width="2"') +
      K.line('M40 39 L47 37', 2.5, C.blue) +
      `<path d="M55 25 C57 21 61 22 59 25" stroke-width="2" fill="none"/>` +
      P('M10 18 C10 12 14 9 18 9 C23 9 25 13 24 18 L22 30 L14 31 L13 24 C11 23 10 21 10 18 Z', C.pine) +
      K.line('M13.5 27 L22.4 26.5', 2, C.white) +
      P('M11 16 C7 16 3 18 2 21 C5 22 9 22 12 20 Z', C.yellow, ' stroke-width="2"') +
      K.dots([[16.5, 15]], 1.5) + K.hi('M17 11 C20 10 22 12 22 14 C20 13 18 12 17 11 Z') +
      K.sh('M50 36 C54 32 58 28 60 24 C60 34 54 46 42 48 C47 45 50 41 50 36 Z'),
    turkey: () =>
      K.shadow(22, 58, 35) +
      leg('M30 49 V56 M26 56 H33', C.pink) + leg('M39 49 V56 M36 56 H43', C.pink) +
      P('M38 38 L26 16 C32 5 50 3 59 12 C63 18 63 30 61 38 Z', C.brown) +
      `<path d="M30 15 C37 8 50 7 57 14 C60 19 61 27 60 34" fill="none" stroke="${C.wheat}" stroke-width="3"/>` +
      K.line('M38 38 L36 9 M38 38 L46 7 M38 38 L55 11 M38 38 L60 22 M38 38 L30 13', 1.3, C.brownD) +
      P('M15 34 C15 27 22 24 30 26 C41 25 51 31 51 40 C51 48 43 52 33 52 C22 52 15 46 15 38 Z', C.brownD) +
      P('M29 36 C35 32 44 34 47 40 C43 46 33 46 29 41 Z', C.brown, ' stroke-width="2"') +
      K.line('M33 40 C37 41 41 41 44 40', 1.2, C.wheat) +
      P('M11 21 C9 15 11 10 16 10 C20 10 22 14 21 19 L24 30 L16 32 Z', C.blueL) +
      P('M8 16 L4 18 L9 19.5 Z', C.yellow, ' stroke-width="1.8"') +
      `<path d="M11 12 C8 14 7 19 8 23" stroke="${C.red}" stroke-width="2.5" fill="none"/>` +
      P('M14 21 C11 27 15 32 19 29 C20 26 18 22 14 21 Z', C.red, ' stroke-width="2"') +
      K.dots([[15, 15]], 1.5) +
      K.hi('M22 30 C26 28 30 28 33 29 C29 30 25 31 22 33 Z'),
    goose: () =>
      K.shadow(22, 58, 36) +
      leg('M33 47 V55', C.orange) + leg('M41 47 V55', C.orange) +
      P('M27 57 L33 54 L37 57 Z M35 57 L41 54 L45 57 Z', C.orange, ' stroke-width="1.8"') +
      P('M19 37 C19 30 25 27 33 28 L50 29 C55 29 59 27 61 25 C62 35 57 46 45 48 H29 C23 48 19 43 19 37 Z', C.greyL) +
      P('M30 33 C38 30 51 30 58 31 C54 40 43 43 34 41 C31 39 29 36 30 33 Z', C.grey, ' stroke-width="2"') +
      K.line('M38 37 C44 37 50 36 54 34 M40 40 C45 40 49 39 52 38', 1.2, C.greyD) +
      P('M19 39 C17 31 20 25 16 19 C13 15 12 10 15 7 C19 4 24 6 24 11 C24 16 25 25 31 30 Z', C.greyL) +
      P('M14 9 C10 9 5 11 3 14 C7 15 11 15 15 13 Z', C.orange, ' stroke-width="2"') +
      K.dots([[19, 10]], 1.5) +
      K.hi('M21 37 C21 33 25 31 29 31 C26 33 24 36 23 40 Z') +
      K.sh('M52 37 C56 34 59 30 61 26 C61 36 56 46 45 48 C49 45 52 41 52 37 Z'),
    rabbit: () =>
      K.shadow(24, 58, 34) +
      P('M54 40 C60 38 62 45 57 48 C54 49 51 46 54 40 Z', C.white) +
      P('M22 32 C26 24 34 22 42 23 C52 24 58 33 57 43 C56 52 50 56 42 56 H26 C20 56 17 52 18 46 Z', C.brownL) +
      K.line('M42 40 C48 40 51 46 50 52', 1.5, C.brownD) +
      P('M26 18 C24 9 28 2 32 4 C35 6 33 14 29 21 Z', C.brown) +
      P('M20 19 C17 10 20 3 24 4 C28 5 28 13 25 21 Z', C.brownL) +
      K.line('M22.5 10 C22.5 13 23 16 24 18', 1.5, C.pink) +
      P('M8 31 C8 23 14 18 21 19 C28 20 31 26 30 33 C29 39 24 42 18 42 C12 42 8 38 8 31 Z', C.brownL) +
      P('M17 51 C13 51 11 53 12 55.5 C13 57 20 57 22 56 Z', C.brownL, ' stroke-width="2"') +
      `<circle cx="9" cy="31" r="1.8" fill="${C.pinkD}" stroke="none"/>` +
      K.dots([[16, 27]], 1.8) +
      K.hi('M34 26 C40 25 46 26 49 29 C44 28 38 28 34 30 Z') + K.sh('M50 50 C55 46 57 42 57 40 C58 50 52 56 42 56 C46 55 48 53 50 50 Z'),

    // ---- eggs ----
    chicken_egg: () =>
      K.shadow(15) + P(egg(32, 13, 34, 45), C.woodL) +
      K.sh('M45 32 C49 42 47 53 37 57 C46 56 49 48 49 40 C49 37 48 34 45 32 Z') + K.hiE(24, 26, 4.5, 7.5, 20),
    duck_egg: () =>
      K.shadow(19) + P(egg(32, 5, 42, 53), C.glass) +
      K.sh('M48 28 C54 40 51 53 39 57 C50 56 53 47 53 37 C53 34 51 31 48 28 Z') + K.hiE(22, 22, 5, 8.5, 20),
    quail_egg: () => {
      const q = (cx, top, rot) =>
        `<g transform="rotate(${rot} ${cx} ${top + 12})">` + P(egg(cx, top, 18, 24), C.cream) +
        `<path d="M${cx - 3} ${top + 7} c2 -1 3 1 1 2 c-2 1 -2 -1 -1 -2 Z M${cx + 4} ${top + 11} c2 0 2 3 0 3 c-2 0 -2 -3 0 -3 Z M${cx - 5} ${top + 16} c2 -1 4 1 2 2.5 c-2 1 -3 -1 -2 -2.5 Z M${cx + 2} ${top + 19} c1.5 0 2 2 0 2 c-1.5 0 -1.5 -2 0 -2 Z M${cx - 1} ${top + 13} c1 0 1.5 1.5 0 1.5 c-1 0 -1 -1.5 0 -1.5 Z" fill="${C.choc}" stroke="none"/>` +
        K.hiE(cx - 4, top + 6, 2, 3.5, 20) + `</g>`;
      return K.shadow(24) + q(32, 9, 6) + q(19, 32, -14) + q(44, 32, 12);
    },
    egg_yolk: () =>
      K.shadow(20) +
      `<circle cx="32" cy="27" r="14" fill="${C.yellow}"/>` + K.hiE(26, 21, 4.5, 3) +
      P('M11 33 L17 29 L21 34 L26 29 L31 34 L36 29 L41 34 L46 29 L53 33 C53 48 44 58 32 58 C20 58 11 48 11 33 Z', C.woodL) +
      K.sh('M47 37 C48 47 44 54 36 57 C46 57 52 48 53 34 Z') + K.hi('M15 37 C16 44 19 49 23 52 L21 53 C17 50 14 44 14 37 Z'),
    egg_white: () =>
      K.bowl(
        P('M10 31 C11 24 16 22 20 23 C21 16 26 13 30 15 C32 8 37 11 36 16 C40 14 46 17 46 22 C51 22 55 26 54 31 Z', C.white) +
        K.line('M30 15 C29 19 30 22 33 24 M20 23 C22 26 25 28 28 28 M46 22 C44 25 41 27 38 27', 1.3, C.greyL),
        C.blueL, C.white),
  });
})(FSI);
