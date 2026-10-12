// Dairy & cheese icons: milks, creams, butter, yogurts, whey and cheeses (see assets/STYLE.md).
(function (FSI) {
  const { C, K } = FSI;
  // ---- local helpers --------------------------------------------------------
  // Badge circle with locally drawn glyph markup (drawn in a 64 box, scaled down like K.badge).
  const badgeG = (glyph, x = 48, y = 48, r = 12) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.white}"/>` + K.place(glyph, x, y, (r * 1.55) / 64);
  const milk = (label, badge, fill = C.milk) => K.bottle(fill, 'oil', label) + badge;
  // Glyphs for "made from" badges (64 box).
  const G = {
    buffalo:
      `<path d="M8 22 C2 18 2 8 10 4 C8 10 12 16 20 18 Z M56 22 C62 18 62 8 54 4 C56 10 52 16 44 18 Z" fill="${C.greyL}" stroke-width="3"/>` +
      `<path d="M18 16 C24 12 40 12 46 16 C50 26 48 40 44 48 C40 56 24 56 20 48 C16 40 14 26 18 16 Z" fill="${C.greyD}" stroke-width="3"/>` +
      `<path d="M8 22 L20 24 M56 22 L44 24" stroke-width="5"/>` +
      `<ellipse cx="32" cy="48" rx="11" ry="7" fill="${C.grey}" stroke-width="3"/>` + K.dots([[24, 30], [40, 30]], 3) + K.dots([[28, 48], [36, 48]], 2.5),
    coconut:
      `<path d="M6 28 C6 48 18 58 32 58 C46 58 58 48 58 28 Z" fill="${C.brown}" stroke-width="3.5"/>` +
      `<ellipse cx="32" cy="28" rx="26" ry="9" fill="${C.creamL}" stroke-width="3.5"/><ellipse cx="32" cy="28" rx="17" ry="5" fill="${C.white}" stroke="${C.creamD}" stroke-width="2.5"/>` +
      `<path d="M14 12 C22 6 40 6 50 12 C46 16 18 16 14 12 Z" fill="${C.brownD}" stroke-width="3.5"/>`,
    soy:
      `<path d="M6 44 C4 36 10 30 18 32 C22 22 32 18 40 22 C46 12 58 12 60 20 C62 30 54 34 46 34 C42 44 32 48 24 46 C18 54 8 52 6 44 Z" fill="${C.leaf}" stroke-width="3.5"/>` +
      `<ellipse cx="15" cy="42" rx="6" ry="5" fill="${C.leafL}" stroke="none"/><ellipse cx="31" cy="34" rx="6" ry="5" fill="${C.leafL}" stroke="none"/><ellipse cx="48" cy="24" rx="6" ry="5" fill="${C.leafL}" stroke="none"/>`,
    almond:
      `<path d="M32 4 C46 14 52 32 48 46 C45 56 38 60 32 60 C26 60 19 56 16 46 C12 32 18 14 32 4 Z" fill="${C.brownL}" stroke-width="3.5"/>` +
      K.line('M32 12 C26 24 26 40 32 54 M24 26 C22 34 23 42 26 48 M40 26 C42 34 41 42 38 48', 2.5, C.brownD),
    oat:
      `<path d="M32 62 V4" stroke="${C.wheatD}" stroke-width="5"/>` +
      [[18, 20, 30], [46, 20, -30], [14, 40, 20], [50, 40, -20]].map(([x, y, r]) =>
        `<path d="M32 ${y - 12} C${(32 + x) / 2} ${y - 14} ${x} ${y - 10} ${x} ${y - 4}" stroke="${C.wheatD}" stroke-width="3.5"/>` +
        `<ellipse cx="${x}" cy="${y + 4}" rx="7" ry="11" transform="rotate(${r} ${x} ${y + 4})" fill="${C.wheat}" stroke-width="3.5"/>`).join('') +
      `<ellipse cx="32" cy="10" rx="6" ry="9" fill="${C.wheat}" stroke-width="3.5"/>`,
  };
  // Simple tin can: label colour, extra markup on top.
  const can = (label, extra = '', top = '') =>
    K.shadow(18) +
    `<path d="M15 16 V52 C15 56 22 58 32 58 C42 58 49 56 49 52 V16 Z" fill="${C.steel}"/>` +
    `<path d="M15 23 C15 26 22 28 32 28 C42 28 49 26 49 23 V47 C49 50 42 52 32 52 C22 52 15 50 15 47 Z" fill="${label}" stroke-width="2"/>` +
    `<ellipse cx="32" cy="16" rx="17" ry="5" fill="${C.greyL}"/>` + top + extra +
    K.hi('M18 29 L21 30 L21 47 L18 46 Z') + K.sh('M44 28 C47 27 48 26 48 24 V47 C48 49 46 50 44 51 Z');
  // Yogurt-style pot: tapered tub with coloured band; top = markup above rim (contents drawn by ellipse).
  const pot = (band, contents = C.white, top = '', back = '') =>
    K.shadow(16) + back +
    `<path d="M15 20 H49 L45.5 54 C45.3 56.5 43.5 58 41 58 H23 C20.5 58 18.7 56.5 18.5 54 Z" fill="${C.white}"/>` +
    `<path d="M16.2 31 H47.8 L46.6 43 H17.4 Z" fill="${band}" stroke-width="1.8"/>` +
    `<ellipse cx="32" cy="20" rx="17" ry="4.5" fill="${C.creamD}"/><ellipse cx="32" cy="20.3" rx="14.5" ry="3" fill="${contents}" stroke="none"/>` + top +
    K.hi('M18.5 23 L21.5 23 L22.5 52 L20.5 52 Z') + K.sh('M44 22 L48 22 L44.6 55 C44.3 56.5 43 57 41.5 57 Z');

  // Cheese wheel in 3/4 view with a wedge cut out of the front-right; h = rind height.
  const wheel = (rind, top, paste, h = 18, extra = '') => {
    const yt = 46 - h, p1 = `54.5 ${yt + 5}`, p2 = `27.5 ${yt + 9.85}`;
    return K.shadow(26) +
      `<path d="M${p2} A26 10 0 0 1 6 ${yt} V46 A26 10 0 0 0 27.5 ${55.85} Z" fill="${rind}"/>` +
      `<path d="M58 ${yt} A26 10 0 0 1 ${p1} V${yt + 5 + h} A26 10 0 0 0 58 46 Z" fill="${rind}"/>` +
      `<path d="M32 ${yt} L${p1} V${yt + 5 + h} L32 ${yt + h} Z" fill="${paste}"/>` +
      `<path d="M32 ${yt} L${p2} V${55.85} L32 ${yt + h} Z" fill="${paste}"/>` + K.sh(`M32 ${yt} L${p2} V${55.85} L32 ${yt + h} Z`) +
      `<path d="M32 ${yt} L${p1} A26 10 0 1 0 ${p2} Z" fill="${top}"/>` + extra +
      K.hi(`M8.5 ${yt + 4} C9.5 ${yt + 6} 11 ${yt + 7} 12.5 ${yt + 7.5} V${44 + 3} C11 ${46.5} 9.5 ${45.5} 8.5 ${44} Z`);
  };
  // Triangular wedge, tip front-left, rind along the back-right edge.
  const wedge = (top, front, rind, extra = '') =>
    K.shadow(25) +
    `<path d="M6 40 L58 32 V46 L6 54 Z" fill="${front}"/>` +
    `<path d="M52 32.9 L58 32 V46 L52 46.9 Z" fill="${rind}" stroke-width="2"/>` +
    `<path d="M6 40 L44 16 L58 32 Z" fill="${top}"/>` +
    `<path d="M44 16 L58 32 L53 32.8 L40.5 18.2 Z" fill="${rind}" stroke-width="2"/>` + extra +
    K.hi('M12 39 L38 22 L40 24 L16 39 Z');

  FSI.add('dairy_cheese', {
    // ---- milks: same bottle as cow_milk, badge of the source --------------------
    water_buffalo_milk: () => milk(C.greyL, badgeG(G.buffalo)),
    sheep_milk: () => milk(C.pinkL, K.badge('sheep', 48, 48, 12), C.creamL),
    goat_milk: () => milk(C.yellowL, K.badge('goat', 48, 48, 12), C.white),
    coconut_milk: () => milk(C.brownL, badgeG(G.coconut), C.creamL),
    coconut_cream: () => can(C.brownL, K.place(G.coconut, 32, 40, 0.3),
      `<ellipse cx="32" cy="16.4" rx="14" ry="3.4" fill="${C.creamL}" stroke="none"/>` +
      `<path d="M22 16 C24 11 30 10 33 12 C36 9 41 11 42 15 C36 18 28 18 22 16 Z" fill="${C.white}" stroke-width="1.8"/>`),
    soy_milk: () => milk(C.leafL, badgeG(G.soy), C.cream),
    almond_milk: () => milk(C.orangeL, badgeG(G.almond), C.creamL),
    oat_milk: () => milk(C.wheatL, badgeG(G.oat), C.cream),
    skim_milk: () => milk(C.blue, K.badge('cattle', 48, 48, 12), C.glass),
    // ---- creams, butter, cultured milks ------------------------------------------
    cream: () =>
      K.shadow(20) +
      `<path d="M45 24 C57 24 58 42 46 46" stroke-width="6.5"/><path d="M45 24 C57 24 58 42 46 46" stroke="${C.white}" stroke-width="2"/>` +
      `<path d="M17 18 C18 26 13 34 13 44 C13 53 19 58 27 58 H37 C45 58 51 53 51 44 C51 34 46 26 47 18 Z" fill="${C.white}"/>` +
      `<path d="M18 16 L6 12 L17 22 Z" fill="${C.white}"/>` +
      `<ellipse cx="32" cy="18" rx="15" ry="4" fill="${C.white}"/><ellipse cx="32.5" cy="18.3" rx="12.5" ry="2.6" fill="${C.cream}" stroke="none"/>` +
      `<path d="M14.6 35 C24 38.5 40 38.5 49.4 35 L50.4 40 C40 43.5 24 43.5 13.6 40 Z" fill="${C.blue}" stroke-width="1.8"/>` +
      K.hi('M17 44 C17 39 18 33 20 28 L22 28 C20.5 34 20 40 20 46 Z') + K.sh('M45 26 C48 34 50 40 50 46 C50 52 46 56 40 57 C46 52 47 40 45 26 Z'),
    butter: () =>
      K.shadow(25) +
      `<path d="M5 33 L27 41 V55 L5 47 Z" fill="${C.yellow}"/>` +
      `<path d="M27 41 L59 30 V44 L27 55 Z" fill="${C.yellow}"/>` + K.sh('M27 41 L59 30 V44 L27 55 Z') +
      `<path d="M5 33 L37 22 L59 30 L27 41 Z" fill="${C.yellowL}"/>` +
      `<path d="M23 27.5 L37 22 L59 30 L45 35.5 Z M45 35.5 L59 30 V44 L45 49 Z" fill="${C.white}" stroke-width="2"/>` +
      K.line('M45 35.5 V49', 2) + K.line('M27 29 L31 30.8 L27 32.4 L31 34 L27 35.6', 1.2, C.yellowD) +
      K.hi('M8 33 L22 28 L25 29 L11 34 Z'),
    buttermilk: () => K.bottle(C.creamL, 'flask', C.yellowL,
      `<path d="M32 38.5 C34.5 42 35.5 43.5 35.5 45 C35.5 47 34 48 32 48 C30 48 28.5 47 28.5 45 C28.5 43.5 29.5 42 32 38.5 Z" fill="${C.cream}" stroke-width="1.4"/>`),
    ghee: () => K.jar(C.yellow, C.teal,
      `<path d="M32 33 C36 38.5 38 41.5 38 44 C38 47.5 35.5 49.5 32 49.5 C28.5 49.5 26 47.5 26 44 C26 41.5 28 38.5 32 33 Z" fill="${C.gold}" stroke-width="1.5"/>` +
      K.hiE(30, 43, 1.4, 2.6, 15)),
    clotted_cream: () =>
      K.shadow(26) +
      `<path d="M6 34 C6 40 7 51 10 54 C13 57 20 58 32 58 C44 58 51 57 54 54 C57 51 58 40 58 34 Z" fill="${C.white}"/>` +
      `<ellipse cx="32" cy="34" rx="26" ry="10" fill="${C.white}"/><ellipse cx="32" cy="34.3" rx="22.5" ry="7.3" fill="${C.yellowL}" stroke-width="1.5"/>` +
      `<path d="M13 34 C16 30 24 28.5 30 29.5 C26 31.5 19 31.5 15.5 36 Z M33 39.5 C38 37.5 46 37.5 51 34 C50 38 42 41 35 41 Z M33 30 C37 28.5 43 29 47 31 C43 31.5 38 31.5 33 30 Z" fill="${C.wheat}" stroke="none"/>` +
      `<path d="M37 34 L51 9" stroke-width="5.5"/><path d="M37 34 L51 9" stroke="${C.steel}" stroke-width="2"/>` +
      K.hi('M9 40 L12 41 C12 46 12.5 50 14 53 L11.5 52 C10 49 9 45 9 40 Z') + K.sh('M53 40 C55 39 56.5 37.5 57 36 C57 44 56 51 53.5 54 C51 56 48 57 45 57.5 C51 52 52.5 46 53 40 Z'),
    sour_cream: () =>
      K.shadow(24) +
      `<path d="M14 28 C10 20 14 10 26 8 C38 6 50 10 52 22" fill="${C.leaf}"/>` +
      `<path d="M8 30 H56 L53 54 C53 56.5 51 58 48 58 H16 C13 58 11 56.5 11 54 Z" fill="${C.white}"/>` +
      `<path d="M9.1 38 H54.9 L53.9 46.5 H10.1 Z" fill="${C.leaf}" stroke-width="1.8"/>` +
      `<ellipse cx="32" cy="30" rx="24" ry="6" fill="${C.creamD}"/><ellipse cx="32" cy="30.4" rx="21" ry="4.2" fill="${C.white}" stroke="none"/>` +
      `<path d="M18 31 C18 26 24 24 28 22 C30 21 31 17 33 17 C35 18 34 22 36 23 C41 24 46 27 46 31 C40 34 24 34 18 31 Z" fill="${C.white}" stroke-width="2"/>` +
      K.line('M24 28 C28 30 34 29 38 26', 1.4, C.creamD) +
      K.hi('M11.5 33 L14.5 33 L16 54 L14 54 Z') + K.sh('M52 31 L55 31 L52 55 C51.5 56.5 50 57 48.5 57 Z'),
    creme_fraiche: () => K.jar(C.creamL, C.blue,
      `<path d="M23 44 C23 39 27 37 30 36 C31 34 33 33 34 34 C34.5 36 34 37 36 37.5 C39 38.5 41 41 41 44 Z" fill="${C.white}" stroke-width="1.4"/>` +
      K.line('M23 44 H41', 1.4) + K.line('M29 41 C32 42 35 41 37 39.5', 1.1, C.creamD)),
    yogurt: () => pot(C.blue, C.white,
      `<path d="M37 20 L47 4" stroke-width="5"/><path d="M37 20 L47 4" stroke="${C.steel}" stroke-width="2"/>` +
      `<ellipse cx="47.5" cy="4" rx="3" ry="2" fill="${C.steel}" stroke-width="1.5"/>`,
      `<path d="M16 19 C12 10 20 3 30 4 C40 5 45 10 45 18 Z" fill="${C.steel}"/>` + K.line('M21 14 C25 11 31 10 37 11', 1.3, C.greyD)) +
      K.dots([[25, 37], [32, 38.5], [39, 37]], 2, C.white),
    greek_yogurt: () => pot(C.teal, C.white,
      `<path d="M17.5 21 C17.5 14 24 12 28 10 C30 9 30 5 33 5 C35 6 34 9 36 11 C42 12 46.5 15 46.5 21 C39 24.5 25 24.5 17.5 21 Z" fill="${C.white}" stroke-width="2"/>` +
      K.line('M23 17 C28 19 35 18 40 15', 1.4, C.creamD)) +
      K.line('M17 37 H47', 1.6, C.white),
    whey: () =>
      K.shadow(24) +
      `<path d="M7 40 C7 51 18 58 32 58 C46 58 57 51 57 40 Z" fill="${C.glass}"/>` +
      `<path d="M9.6 43 C12 51 21 55.6 32 55.6 C43 55.6 52 51 54.4 43 Z" fill="${C.yellowL}" stroke="none"/>` +
      `<ellipse cx="32" cy="40" rx="25" ry="4.5" fill="${C.glass}"/><ellipse cx="32" cy="41" rx="21" ry="2.8" fill="${C.yellowL}" stroke="none"/>` +
      `<path d="M7 40 C7 51 18 58 32 58 C46 58 57 51 57 40" fill="none"/>` +
      `<path d="M26 9 C17 15 15 26 19 31 C23 36 41 36 45 31 C49 26 47 15 38 9 Z" fill="${C.white}"/>` +
      K.line('M27 13 L28 31 M32 12 V33 M37 13 L36 31', 1.3, C.greyL) +
      `<rect x="6" y="5" width="52" height="5" rx="2.5" fill="${C.wood}"/>` +
      `<path d="M26 8 L22 15 M38 8 L42 15" stroke-width="2"/>` +
      K.hi('M11 45 C13 50 17 53 22 54.5 L21 52 C17 50.5 15 48.5 13.5 45 Z'),
    kefir: () => K.bottle(C.milk, 'wine', C.purpleL,
      `<circle cx="27.5" cy="42" r="2.6" fill="${C.creamL}" stroke-width="1.3"/><circle cx="33" cy="40.5" r="2.6" fill="${C.creamL}" stroke-width="1.3"/>` +
      `<circle cx="36.5" cy="45" r="2.6" fill="${C.creamL}" stroke-width="1.3"/><circle cx="31" cy="46" r="2.6" fill="${C.creamL}" stroke-width="1.3"/>`),
    condensed_milk: () => can(C.red,
      `<path d="M32 33 C36 38 37.5 40 37.5 42.5 C37.5 45.5 35 47 32 47 C29 47 26.5 45.5 26.5 42.5 C26.5 40 28 38 32 33 Z" fill="${C.white}" stroke-width="1.6"/>`,
      `<ellipse cx="32" cy="16.4" rx="14" ry="3.4" fill="${C.cream}" stroke="none"/>` +
      `<path d="M19 18 C20 22 18.5 28 20.5 31 C22.5 33.5 25.5 32 25 28 C24.5 24 25.5 21 29 20.5 C24 20.3 21 19.5 19 18 Z" fill="${C.cream}" stroke-width="1.8"/>`),
    evaporated_milk: () => can(C.blue,
      `<path d="M32 33 C36 38 37.5 40 37.5 42.5 C37.5 45.5 35 47 32 47 C29 47 26.5 45.5 26.5 42.5 C26.5 40 28 38 32 33 Z" fill="${C.white}" stroke-width="1.6"/>` +
      K.line('M20 31 C26 33 38 33 44 31 M20 49 C26 51 38 51 44 49', 1.2, C.white),
      `<ellipse cx="32" cy="16" rx="11" ry="2.8" fill="none" stroke="${C.greyD}" stroke-width="1.4"/><path d="M40 16 L46 12" stroke-width="2"/>`),
    milk_powder: () => K.sack(C.white,
      `<path d="M32 31 C37.5 38 40 41.5 40 44.5 C40 48.5 36.5 51 32 51 C27.5 51 24 48.5 24 44.5 C24 41.5 26.5 38 32 31 Z" fill="${C.blueL}" stroke-width="2"/>` +
      K.hiE(29, 44, 1.6, 3, 15) + `<path d="M22 21 C26 16 38 16 42 21" fill="${C.white}" stroke-width="1.5"/>`, C.blue),
    // ---- cheeses ------------------------------------------------------------------
    mozzarella: () =>
      K.shadow(26) +
      `<path d="M30 52 C20 58 6 56 4 46 C12 42 24 44 30 52 Z" fill="${C.leaf}"/>` + K.line('M29 51.5 C20 48 12 47 6 47', 1.3, C.leafD) +
      `<circle cx="28" cy="33" r="20" fill="${C.white}"/>` +
      `<path d="M23 14.5 C25 10 31 10 33 14.5 C30 16 26 16 23 14.5 Z" fill="${C.white}" stroke-width="2"/>` +
      K.sh('M44 22 C50 32 46 48 32 52.5 C42 53 50 45 48 32 C47.5 28 46 25 44 22 Z') + K.hiE(19, 25, 6, 3.5) +
      `<circle cx="48" cy="47" r="11" fill="${C.white}"/>` + K.hiE(44, 42, 3.5, 2) +
      K.sh('M55 41 C58 47 55 55 47 57.5 C53 58 58 53 58.5 47 C58.5 45 57 42.5 55 41 Z'),
    parmesan: () =>
      K.shadow(26) +
      `<path d="M8 10 H28 L31 52 H5 Z" fill="${C.steel}"/>` + `<path d="M13 10 C13 4 23 4 23 10" stroke-width="3"/>` +
      K.dots([[12, 17], [18, 17], [24, 17], [11, 24], [17, 24], [23, 24], [11, 31], [17, 31], [23, 31], [10, 38], [16, 38], [22, 38]], 1.2) +
      K.hi('M10 13 L13 13 L12 48 L8.5 48 Z') +
      `<path d="M22 46 L46 30 L59 38 V50 L35 58 L22 52 Z" fill="${C.wheat}"/>` +
      `<path d="M22 46 L46 30 L59 38 L35 50 Z" fill="${C.wheatL}"/>` + K.line('M35 50 V58', 2.5) +
      `<path d="M46 30 L59 38 V50 L54.5 51.5 V40.5 L42 32.6 Z" fill="${C.wheatD}" stroke-width="2"/>` +
      K.sh('M35 50 L54.5 40.5 V51.5 L35 58 Z') +
      K.dots([[30, 46], [38, 42], [44, 38], [36, 47]], 1.1, C.wheatD) + K.dots([[56.5, 43], [56.5, 47]], 1, C.wheatL),
    pecorino_romano: () => wheel(C.black, C.greyD, C.creamL, 18,
      K.dots([[40, 38], [46, 44], [37, 46], [29, 44]], 1.1, C.creamD)) + K.badge('sheep', 50, 15, 10),
    feta: () =>
      K.shadow(27) +
      `<ellipse cx="32" cy="48" rx="28" ry="9" fill="${C.blue}"/><ellipse cx="32" cy="47" rx="23" ry="6" fill="${C.blueL}" stroke-width="1.5"/>` +
      `<path d="M8 30 L10 33 L9 36 L10 40 L9 44 L26 51 L28 47 L27 44 L28 40 L27 36 L28 37 Z" fill="${C.white}"/>` +
      `<path d="M27 37 L54 28 L53 32 L55 35 L54 39 L55 42 L26 51 L28 47 L27 44 L28 40 Z" fill="${C.white}"/>` + K.sh('M27 37 L54 28 L53 32 L55 35 L54 39 L55 42 L26 51 L28 47 L27 44 L28 40 Z') +
      `<path d="M8 30 L22 25 L24 26 L36 21 L40 23 L54 28 L27 37 Z" fill="${C.milk}"/>` +
      K.dots([[18, 41], [14, 37], [36, 41], [44, 37], [24, 29], [38, 26]], 1, C.greyD) +
      `<path d="M44 46 L48 44 L51 46 L49 49 L45 49 Z M11 49 L14 47 L17 49 L14 51 Z" fill="${C.white}" stroke-width="1.6"/>` + K.hi('M12 31 L20 28 L22 29 L14 32 Z'),
    goat_cheese: () =>
      K.shadow(26) +
      `<path d="M14 22 H46 C51 22 54 28 54 36 C54 44 51 50 46 50 H14 C9 50 6 44 6 36 C6 28 9 22 14 22 Z" fill="${C.white}"/>` +
      K.line('M18 23 C17 30 17 42 18 49', 1.2, C.greyL) +
      `<ellipse cx="46" cy="36" rx="8" ry="14" fill="${C.creamL}"/>` + K.dots([[44, 30], [48, 38], [45, 43]], 0.9, C.creamD) +
      K.sh('M14 46 H40 C42 48 44 49 46 50 H14 C11 50 9 48 8 46 Z') + K.hi('M14 25 H34 V28 H12 Z') +
      `<ellipse cx="36" cy="52" rx="13" ry="5" fill="${C.creamL}"/><path d="M23 52 V54 C23 57 49 57 49 54 V52" fill="${C.white}"/>` +
      `<ellipse cx="36" cy="52" rx="13" ry="5" fill="${C.creamL}"/>`,
    ricotta: () =>
      K.shadow(24) +
      `<path d="M8 33 C8 20 19 11 32 11 C45 11 56 20 56 33 Z" fill="${C.white}"/>` +
      K.dots([[20, 22], [28, 17], [37, 18], [44, 24], [24, 28], [33, 25], [41, 30], [16, 29], [49, 30]], 1.3, C.creamD) + K.hiE(21, 19, 5, 2.5) +
      `<path d="M7 32 H57 L50 56 C49.5 57.5 48.5 58 47 58 H17 C15.5 58 14.5 57.5 14 56 Z" fill="${C.woodL}"/>` +
      K.line('M9 38 H55 M10.5 44 H53.5 M12.5 50 H51.5', 1.4, C.woodD) + K.line('M18 33 L21 57 M27 33 L28.5 58 M37 33 L35.5 58 M46 33 L43 57', 1.4, C.woodD) +
      K.sh('M48 33 L56 33 L50 56 C49.5 57.5 48.5 58 47 58 Z'),
    gruyere: () => wheel(C.brownL, C.wheat, C.yellowL, 18,
      `<ellipse cx="42" cy="40" rx="2" ry="1.6" fill="${C.yellowD}" stroke="none"/><ellipse cx="36" cy="45" rx="1.4" ry="1.2" fill="${C.yellowD}" stroke="none"/><ellipse cx="29.5" cy="44" rx="1.2" ry="1.4" fill="${C.yellowD}" stroke="none"/>` +
      K.line('M15 22 C22 18 40 17 50 21', 1.3, C.wheatD)),
    emmental: () => wedge(C.yellowL, C.yellow, C.yellowD,
      `<ellipse cx="20" cy="46" rx="4" ry="3" fill="${C.yellowD}" stroke-width="1.5"/><ellipse cx="36" cy="44" rx="3" ry="3.4" fill="${C.yellowD}" stroke-width="1.5"/><ellipse cx="46" cy="40.5" rx="2.2" ry="2" fill="${C.yellowD}" stroke-width="1.5"/>` +
      `<ellipse cx="34" cy="28" rx="3.5" ry="2.2" fill="${C.yellow}" stroke-width="1.5"/><ellipse cx="44" cy="25" rx="2.2" ry="1.5" fill="${C.yellow}" stroke-width="1.5"/><ellipse cx="22" cy="37" rx="2.4" ry="1.5" fill="${C.yellow}" stroke-width="1.5"/>` +
      `<path d="M27 50.5 C27 47 32 47 32 49.8 Z" fill="${C.yellowD}" stroke-width="1.5"/>`),
    raclette_cheese: () =>
      K.shadow(27) +
      `<path d="M6 32 A26 10 0 0 1 58 32 V46 H6 Z" fill="${C.orangeL}"/>` +
      `<path d="M6 32 A26 10 0 0 1 58 32 Z" fill="${C.orangeL}"/>` + K.line('M14 26 C24 22 40 22 50 26', 1.3, C.orange) +
      `<path d="M6 32 H58 V46 C58 50 54 50 53 48 C52 54 48 56 46 50 C44 47 42 49 40 50 C39 57 34 58 33 51 C32 48 28 48 26 50 C24 53 20 53 19 49 C17 46 12 50 10 49 C7 48 6 47 6 46 Z" fill="${C.yellow}"/>` +
      `<path d="M8 32 H56 V36 C50 39 44 36 38 38 C32 40 26 37 20 39 C14 41 10 38 8 36 Z" fill="${C.yellowL}" stroke="none"/>` +
      K.hiE(15, 41, 3, 1.5, -10) + K.dots([[30, 44], [44, 42], [22, 45]], 1.4, C.yellowD),
    gouda: () => wheel(C.red, C.redL, C.yellow, 16,
      K.dots([[40, 42], [33, 46], [46, 44]], 1.1, C.yellowD)),
    brie: () => wheel(C.white, C.milk, C.yellowL, 10,
      `<path d="M32 46 C30 50 27 52 27.5 55.8 L28.5 47 Z" fill="${C.yellow}" stroke-width="1.5"/>` +
      K.dots([[16, 30], [24, 33], [40, 28], [48, 30], [30, 29]], 0.9, C.creamD)),
    blue_cheese: () => wedge(C.creamL, C.cream, C.creamD,
      K.line('M12 45 C16 43 18 47 22 44 C25 42 26 46 30 44 M34 47 C37 44 40 46 44 42 M24 52 C27 49 30 51 33 49', 1.6, C.blueD) +
      K.line('M20 36 C24 33 26 36 30 32 M34 26 C37 24 38 27 42 23 M38 32 C41 30 44 31 47 28', 1.6, C.blue) +
      K.dots([[16, 48], [40, 45], [48, 43], [28, 37], [44, 27]], 1.3, C.blueD)),
    cream_cheese: () =>
      K.shadow(28) +
      `<path d="M2 44 L9 39 L6 35 L32 25 L37 28 L43 25 L62 37 L56 41 L60 45 L33 57 L28 54 L22 57 Z" fill="${C.steel}"/>` +
      K.line('M9 44 L17 47 M47 46 L54 43 M38 29 L44 31', 1.3, C.greyD) +
      `<path d="M14 36 L30 42 V52 L14 46 Z" fill="${C.white}"/>` +
      `<path d="M30 42 L52 34 V44 L30 52 Z" fill="${C.white}"/>` + K.sh('M30 42 L52 34 V44 L30 52 Z') +
      `<path d="M14 36 L36 28 L52 34 L30 42 Z" fill="${C.milk}"/>` +
      K.hi('M18 36 L33 30.5 L35 31.3 L20 37 Z'),
    mascarpone: () => K.bowl(
      `<path d="M14 31 C16 25 24 25 28 22 C30 20 31 16 34 16 C36 17 35 21 37 22 C44 23 50 27 50 31 C40 34 24 34 14 31 Z" fill="${C.white}" stroke-width="2"/>` +
      K.line('M21 28 C27 30 35 29 41 25', 1.4, C.creamD) +
      `<path d="M44 26 L56 8" stroke-width="5"/><path d="M44 26 L56 8" stroke="${C.steel}" stroke-width="2"/>`,
      C.blueL, C.white),
    paneer: () => {
      const cube = (x, y, s = 1) => {
        const a = 9 * s, b = 7 * s, h = 13 * s;
        return `<path d="M${x - a} ${y} L${x} ${y + b * 0.5} V${y + b * 0.5 + h} L${x - a} ${y + h} Z" fill="${C.cream}"/>` +
          `<path d="M${x} ${y + b * 0.5} L${x + a} ${y} V${y + h} L${x} ${y + b * 0.5 + h} Z" fill="${C.cream}"/>` + K.sh(`M${x} ${y + b * 0.5} L${x + a} ${y} V${y + h} L${x} ${y + b * 0.5 + h} Z`) +
          `<path d="M${x - a} ${y} L${x} ${y - b * 0.5} L${x + a} ${y} L${x} ${y + b * 0.5} Z" fill="${C.creamL}"/>` +
          K.dots([[x - a * 0.5, y + h * 0.55], [x + a * 0.45, y + h * 0.45]], 0.9, C.creamD);
      };
      return K.shadow(27) + cube(32, 17, 1.1) + cube(17, 37, 1.1) + cube(47, 37, 1.1) +
        `<path d="M8 26 C5 22 8 17 12 19 C12 15 17 14 18 18" fill="${C.leaf}" stroke-width="2"/>`;
    },
    halloumi: () =>
      K.shadow(27) +
      `<path d="M4 38 L27 47 V55 L4 46 Z" fill="${C.cream}"/>` +
      `<path d="M27 47 L60 34 V42 L27 55 Z" fill="${C.cream}"/>` + K.sh('M27 47 L60 34 V42 L27 55 Z') +
      `<path d="M4 38 L37 25 L60 34 L27 47 Z" fill="${C.creamL}"/>` +
      K.line('M13 35 L36 44 M22 31 L45 40.5 M31 28 L52 37', 3.2, C.brown) + K.line('M13 35 L36 44 M22 31 L45 40.5 M31 28 L52 37', 1.2, C.brownD) +
      `<path d="M14 16 C14 10 20 12 20 6 M24 18 C24 12 30 14 30 8" stroke="${C.greyD}" stroke-width="2"/>`,
    cotija: () =>
      K.shadow(27) +
      `<ellipse cx="32" cy="40" rx="27" ry="8" fill="${C.terracotta}"/>` +
      `<path d="M9 41 C9 34 13 28 18 27 L20 23 L25 22 L28 18 L34 19 L38 17 L42 21 L47 22 L49 27 C53 30 55 35 55 41 C46 45 18 45 9 41 Z" fill="${C.white}"/>` +
      `<path d="M20 30 L23 28 L25 31 L22 33 Z M30 25 L33 24 L35 27 L32 28 Z M40 29 L43 28 L44 31 L41 32 Z M26 36 L29 35 L31 38 L27 39 Z M44 37 L47 36 L48 39 L45 40 Z M15 37 L18 36 L19 39 Z" fill="${C.cream}" stroke-width="1.3"/>` +
      K.hiE(22, 26, 4, 2) +
      `<path d="M5 40 C5 50 16 57 32 57 C48 57 59 50 59 40 C59 45 47 49 32 49 C17 49 5 45 5 40 Z" fill="${C.terracotta}"/>` +
      K.sh('M50 47 C55 45 58 43 59 40 C59 48 52 54 42 56 C47 53 49 50 50 47 Z') +
      `<path d="M50 14 L53 12 L55 15 L52 17 Z M56 22 L58 20 L60 23 L57 24 Z" fill="${C.white}" stroke-width="1.5"/>`,
    cheese_curds: () => {
      const lump = (x, y, r) => `<path d="M${x - r} ${y} C${x - r} ${y - r * 0.8} ${x - r * 0.3} ${y - r} ${x + r * 0.2} ${y - r * 0.9} C${x + r} ${y - r * 0.7} ${x + r * 1.1} ${y + r * 0.1} ${x + r * 0.8} ${y + r * 0.6} C${x + r * 0.4} ${y + r} ${x - r * 0.6} ${y + r} ${x - r} ${y} Z" fill="${C.yellowL}"/>` +
        K.hiE(x - r * 0.4, y - r * 0.4, r * 0.3, r * 0.15);
      return K.shadow(26) + lump(32, 22, 9) + lump(20, 34, 9) + lump(43, 34, 10) + lump(12, 48, 8) + lump(30, 47, 10) + lump(50, 49, 9) +
        K.sh('M52 41 C56 44 58 50 56 54 C54 57 48 58 44 57 C50 54 53 48 52 41 Z');
    },
  });
})(FSI);
