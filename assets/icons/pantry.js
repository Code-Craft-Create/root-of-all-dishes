// Pantry group: oils and fats, sugars and syrups, minerals and water, drinks, ferments and vinegars.
(function (FSI) {
  const { C, K } = FSI;

  // ---- local helpers ----------------------------------------------------------
  // A small glyph drawn in a 20x20 box centred on 0,0, placed at (x, y) and scaled by s.
  // The stroke width is compensated so its outline stays about 1.4 wide whatever the scale.
  const gl = (m, x, y, s = 0.55, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" stroke-width="${(1.4 / s).toFixed(2)}">${m}</g>`;
  // Round "made from" badge holding a local glyph (like K.badge, but for glyphs drawn here).
  const bdg = (m, x = 48, y = 48, r = 11.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.white}"/>` + gl(m, x, y, (r * 1.55) / 20);
  // Isometric cube with its front-top corner at (x, y); w = width; colours [top, left, right].
  const cube = (x, y, w, [t, l, r]) => {
    const a = w / 2, b = w / 4, h = w * 0.55;
    return `<path d="M${x} ${y} L${x + a} ${y - b} L${x} ${y - 2 * b} L${x - a} ${y - b} Z" fill="${t}"/>` +
      `<path d="M${x - a} ${y - b} L${x} ${y} V${y + h} L${x - a} ${y - b + h} Z" fill="${l}"/>` +
      `<path d="M${x} ${y} L${x + a} ${y - b} V${y - b + h} L${x} ${y + h} Z" fill="${r}"/>`;
  };
  // Slab seen from slightly above (tempeh, sake lees, shrimp paste): colours [top, front, side].
  const slab = ([t, f, s], top = '') =>
    K.shadow(26) +
    `<path d="M5 34 L39 22 L59 31 L25 45 Z" fill="${t}"/>` +
    `<path d="M5 34 L25 45 V56 L5 45 Z" fill="${f}"/><path d="M25 45 L59 31 V42 L25 56 Z" fill="${s}"/>` + top;

  // Glyphs (20x20 box, centred on 0,0).
  const G = {
    olive: `<ellipse cx="-2" cy="2" rx="6" ry="7.5" transform="rotate(-25 -2 2)" fill="${C.leaf}"/>` +
      `<path d="M1 -4 C3 -9 8 -10 10 -9.5 C9 -5 5 -3 1 -4 Z" fill="${C.leafD}"/>` + K.hiE(-4.5, -1, 1.6, 2.6, 25),
    sunflower: [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<ellipse cx="0" cy="-6" rx="3" ry="4.2" transform="rotate(${a})" fill="${C.yellow}"/>`).join('') +
      `<circle r="4.5" fill="${C.brownD}"/>`,
    rapeseed: `<path d="M0 3 V11" stroke="${C.leafD}"/>` +
      [[0, -6.5], [5, -2], [0, 2.5], [-5, -2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${C.yellow}"/>`).join('') +
      `<circle cx="0" cy="-2" r="2" fill="${C.yellowD}"/>`,
    peanut: `<g transform="rotate(35)"><path d="M0 -10 C5 -10 6 -5 4 -2 C3 0 3 1 5 4 C7 8 4 10.5 0 10.5 C-4 10.5 -7 8 -5 4 C-3 1 -3 0 -4 -2 C-6 -5 -5 -10 0 -10 Z" fill="${C.wheat}"/>` +
      `<path d="M-1.5 -6 L1.5 -5 M-1.5 4 L1.5 5 M-2 7 L1 8" fill="none" stroke="${C.wheatD}"/></g>`,
    sesame: [[-5, 3, -25], [1.5, -4, 10], [5.5, 5, 35]].map(([x, y, r]) =>
      `<path d="M0 -5.5 C3.2 -2 3.2 3 0 5.5 C-3.2 3 -3.2 -2 0 -5.5 Z" transform="translate(${x} ${y}) rotate(${r})" fill="${C.creamL}"/>`).join(''),
    corn: `<ellipse cy="-1" rx="5" ry="9.5" fill="${C.yellow}"/>` +
      `<path d="M-4.5 -4 H4.5 M-5 1 H5 M-4 -8 H4 M0 -10 V7" fill="none" stroke="${C.yellowD}"/>` +
      `<path d="M0 10 C-7 8 -9 0 -8 -5 C-5 0 -3 5 0 10 Z M0 10 C7 8 9 0 8 -5 C5 0 3 5 0 10 Z" fill="${C.leaf}"/>`,
    soy: [[-5, -3], [4, -4], [0, 4.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.6" fill="${C.wheatL}"/><path d="M${x - 1.5} ${y + 1} H${x + 1.5}" stroke="${C.brown}"/>`).join(''),
    coconut: `<path d="M-10 -2 C-10 6 -5 10 0 10 C5 10 10 6 10 -2 Z" fill="${C.brown}"/>` +
      `<ellipse cy="-2" rx="10" ry="4.5" fill="${C.white}"/><ellipse cy="-2" rx="6" ry="2.3" fill="${C.creamD}"/>`,
    palm: `<circle cx="-4.5" cy="3" r="5" fill="${C.orange}"/><circle cx="4.5" cy="3.5" r="5" fill="${C.red}"/><circle cx="0" cy="-4.5" r="5" fill="${C.redD}"/>` +
      K.hiE(-6, 1.5, 1.3, 2),
    walnut: `<ellipse rx="8.5" ry="9.5" fill="${C.brownL}"/>` +
      `<path d="M0 -9.5 V9.5 M-5 -5 C-2 -3 -6 0 -3 3 C-5 5 -4 7 -3 8 M5 -5 C2 -3 6 0 3 3 C5 5 4 7 3 8" fill="none" stroke="${C.brownD}"/>`,
    flax: [0, 72, 144, 216, 288].map((a) => `<circle cx="0" cy="-5" r="4" transform="rotate(${a})" fill="${C.blue}"/>`).join('') +
      `<circle r="2.4" fill="${C.yellowL}"/>`,
    pumpkin: `<path d="M0 -5 C-6 -8 -10 -3 -10 2 C-10 7 -6 10 0 9 C6 10 10 7 10 2 C10 -3 6 -8 0 -5 Z" fill="${C.orange}"/>` +
      `<path d="M-4 -5 C-6 0 -6 5 -4 9 M4 -5 C6 0 6 5 4 9" fill="none" stroke="${C.orangeD}"/>` +
      `<path d="M-1 -5 C-1 -8 0 -10 2 -11" stroke="${C.leafD}" stroke-width="3"/>`,
    fish: `<path d="M-10 0 C-6 -6.5 2 -6.5 5 -1 L10 -6 V6 L5 1 C2 6.5 -6 6.5 -10 0 Z" fill="${C.blue}"/>` +
      `<circle cx="-6" cy="-1.2" r="1.3" fill="${C.ink}" stroke="none"/><path d="M-2.5 -4 C-1 -1 -1 1 -2.5 4" fill="none" stroke="${C.blueD}"/>`,
    apple: `<path d="M0 -5 C4 -9 10 -6 9 1 C8 7 4 10 0 9 C-4 10 -8 7 -9 1 C-10 -6 -4 -9 0 -5 Z" fill="${C.red}"/>` +
      `<path d="M0 -5 C0 -8 1 -9.5 2 -10.5" fill="none"/><path d="M1.5 -7.5 C3 -11 7 -11 8 -10 C7 -7.5 4 -6.5 1.5 -7.5 Z" fill="${C.leaf}"/>` + K.hiE(-5, -2, 1.6, 2.6, 20),
    orange: `<circle r="9.5" fill="${C.orange}"/><circle r="7" fill="${C.orangeL}"/>` +
      `<path d="M0 -6.5 V6.5 M-5.6 -3.3 L5.6 3.3 M-5.6 3.3 L5.6 -3.3" fill="none" stroke="${C.orange}"/>`,
    grape: (f = C.purple) => `<path d="M0 -7 V-10.5" fill="none"/><path d="M0 -8.5 C3 -12 8 -11 9 -10 C7 -7 3 -7 0 -8.5 Z" fill="${C.leaf}"/>` +
      [[-5, -3.5], [0, -3.5], [5, -3.5], [-2.5, 1.5], [2.5, 1.5], [0, 6.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.3" fill="${f}"/>`).join(''),
    pomegranate: `<path d="M-3 -6 L-4.5 -10.5 L-1.5 -8.5 L0 -11 L1.5 -8.5 L4.5 -10.5 L3 -6 Z" fill="${C.redD}"/>` +
      `<circle cy="1.5" r="8.5" fill="${C.red}"/>` + K.hiE(-4, -2, 1.6, 2.6),
    tomato: `<circle cy="1" r="9" fill="${C.red}"/><path d="M0 -6 L-5 -9 L-2 -8.5 L-3 -12 L0 -9 L3 -12 L2 -8.5 L5 -9 Z" fill="${C.leaf}"/>` + K.hiE(-4.5, -2, 1.6, 2.6),
    carrot: `<path d="M0 -6 C-4 -8 -6 -11 -4 -11.5 C-2 -11 0 -9 0 -6 C0 -9 1 -12 3 -12 C5 -11 4 -8 0 -6 Z" fill="${C.leaf}"/>` +
      `<path d="M-5 -4 C-5 -7 5 -7 5 -4 L1.2 9 C0.6 10.6 -0.6 10.6 -1.2 9 Z" fill="${C.orange}"/>` +
      `<path d="M-3.5 -1 H-1 M1 2.5 H3 M-2 5.5 H0" fill="none" stroke="${C.orangeD}"/>`,
    cane: `<rect x="-7" y="-9" width="5" height="20" rx="1.5" fill="${C.yellowL}"/><rect x="1" y="-6" width="5" height="17" rx="1.5" fill="${C.leafL}"/>` +
      `<path d="M-7 -2 H-2 M-7 5 H-2 M1 1 H6 M1 7 H6" fill="none" stroke="${C.leafD}"/>` +
      `<path d="M4 -5 C6 -9 9 -11 11 -11 C10 -7 8 -5 5 -3 Z" fill="${C.leaf}"/>`,
    maple: `<path d="M0 -10.5 L2 -6 L5 -8 L4.5 -3 L9.5 -5 L8 -1 L10.5 1 L4 3 L5 6 L0.8 4.5 L-0.8 4.5 L-5 6 L-4 3 L-10.5 1 L-8 -1 L-9.5 -5 L-4.5 -3 L-5 -8 L-2 -6 Z" fill="${C.red}"/>` +
      `<path d="M0 3 V10.5" fill="none"/>`,
    date: `<ellipse cx="-3.5" cy="1" rx="4.5" ry="8.5" transform="rotate(-20 -3.5 1)" fill="${C.brownD}"/><ellipse cx="4" cy="1" rx="4.5" ry="8.5" transform="rotate(15 4 1)" fill="${C.brown}"/>` +
      K.hiE(2.5, -3, 1.2, 2.5, 15),
    rice: [[-5.5, 1.5, -25], [0, -2, 0], [5.5, 1.5, 25]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="2.8" ry="5.5" transform="rotate(${r} ${x} ${y})" fill="${C.white}"/>`).join(''),
    cherry: `<path d="M-4.5 3 C-3 -3 0 -7 4 -10 M4.5 4 C4.5 -2 4.5 -6 4 -10" fill="none" stroke="${C.leafD}"/>` +
      `<path d="M4 -10 C6 -11 9 -10 10 -8 C8 -7 6 -7 4 -10 Z" fill="${C.leaf}"/>` +
      `<circle cx="-4.5" cy="5" r="4.8" fill="${C.redD}"/><circle cx="4.5" cy="5.5" r="4.8" fill="${C.red}"/>`,
    lemon: `<path d="M-10.5 0 C-8 -1 -7 -7 0 -7 C7 -7 8 -1 10.5 0 C8 1 7 7 0 7 C-7 7 -8 1 -10.5 0 Z" fill="${C.yellow}"/>` + K.hiE(-4, -3, 1.4, 2.6, 70),
    chili: `<path d="M-6 -6 C-2 -4 4 0 7 7 C8 9.5 6 10.5 4.5 9 C1 4 -4 0 -8 -2 C-10 -3 -8.5 -7 -6 -6 Z" fill="${C.red}"/>` +
      `<path d="M-7.5 -5 C-9 -8 -8 -10 -6 -11" fill="none" stroke="${C.leafD}" stroke-width="3"/>`,
    ear: (awns) => `<path d="M0 10 C-4.5 6 -4.5 -4 0 -9 C4.5 -4 4.5 6 0 10 Z" fill="${C.wheat}"/>` +
      `<path d="M-3 -3 L0 0 L3 -3 M-3 3 L0 6 L3 3 M0 -7 V8" fill="none" stroke="${C.wheatD}"/>` +
      (awns ? `<path d="M-2 -5 L-5.5 -11.5 M2 -5 L5.5 -11.5 M0 -9 V-12" fill="none"/>` : ''),
    bean: `<path d="M-9 -1 C-9 -7 -2 -8 1 -5 C3 -3 5 -4 7 -3.5 C10.5 -2 9.5 7 2 7 C-4 8 -9 4 -9 -1 Z" fill="${C.leafL}"/>` +
      `<path d="M2 -1.5 C3 0 5 0 6 -1" fill="none" stroke="${C.leafD}"/>`,
    crystal: (t = C.white, l = C.blueL, r = C.blue) => cube(0, -1, 17, [t, l, r]),
    drop: (f = C.blue) => `<path d="M0 -10.5 C3 -5 8 0 8 4 C8 8 4.5 10.5 0 10.5 C-4.5 10.5 -8 8 -8 4 C-8 0 -3 -5 0 -10.5 Z" fill="${f}"/>` + K.hiE(-3.5, 3, 1.5, 2.8, 15),
    bubbles: `<circle cx="-3.5" cy="3" r="6" fill="${C.blueL}"/><circle cx="5" cy="-4" r="4" fill="${C.blueL}"/><circle cx="6" cy="6" r="2.6" fill="${C.blueL}"/>` + K.hiE(-5.5, 1, 1.3, 2.2),
    noodles: [-5, 0, 5].map((y) => `<path d="M-9 ${y} C-7 ${y - 4} -5 ${y + 3} -3 ${y} S1 ${y + 3} 3 ${y} S7 ${y + 3} 9 ${y}" fill="none" stroke="${C.ink}" stroke-width="4.6"/>` +
      `<path d="M-9 ${y} C-7 ${y - 4} -5 ${y + 3} -3 ${y} S1 ${y + 3} 3 ${y} S7 ${y + 3} 9 ${y}" fill="none" stroke="${C.yellowL}" stroke-width="2"/>`).join(''),
    pretzel: ['5.5', '2.6'].map((w, i) => `<path d="M0 -2 C2 -6 1 -10 -3.5 -10 C-7.5 -10 -10.5 -6.5 -10.5 -1 C-10.5 5 -5.5 9.5 0 9.5 C5.5 9.5 10.5 5 10.5 -1 C10.5 -6.5 7.5 -10 3.5 -10 C-1 -10 -2 -6 0 -2 L-5 6 M0 -2 L5 6" fill="none" stroke="${i ? C.brown : C.ink}" stroke-width="${w}"/>`).join(''),
    shrimp: `<path d="M7 -6 C-3 -11 -10 -3 -8.5 3 C-7 8.5 0 9.5 3 5.5 C-1 6 -3.5 3 -3 0 C-2.5 -3 2 -4 6 -2 Z" fill="${C.pink}"/>` +
      `<path d="M-2 -6.5 C-1 -4.5 -1 -3.5 -2.5 -2.2 M-7 -2 C-5 -2 -4 -1 -3.4 0.5 M-6 5 C-5 3.5 -3.5 3 -2.5 3.5" fill="none" stroke="${C.pinkD}"/>` +
      `<path d="M3 5.5 L6 9 L8 4.5 Z" fill="${C.pinkD}"/><circle cx="4.5" cy="-4.2" r="1" fill="${C.ink}" stroke="none"/>`,
    muffin: `<path d="M-7 1 H7 L5 10 H-5 Z" fill="${C.blueL}"/><path d="M-9 2 C-10 -6 -4 -10 0 -10 C4 -10 10 -6 9 2 Z" fill="${C.brownL}"/>` +
      `<path d="M-3 1.5 L-2 10 M3 1.5 L2 10" fill="none" stroke="${C.blueD}"/>`,
    rock: (f = C.greyL) => `<path d="M-10 7 L-8 -3 L-2 -8 L6 -6 L10 2 L7 8 Z" fill="${f}"/><path d="M-2 -8 L0 0 L10 2 M0 0 L-10 7" fill="none" stroke="${C.greyD}"/>`,
  };

  // Bottles not in the kit.
  // Vinegar cruet: slim neck, pear body, glass ball stopper; glyph sits in a round label on the belly.
  const cruet = (fill, glyph) =>
    K.shadow(15) +
    `<path d="M29 12 H35 V28 C41 31 47 38 47 46 C47 53 41 58 32 58 C23 58 17 53 17 46 C17 38 23 31 29 28 Z" fill="${fill}"/>` +
    `<path d="M28 12 H36 V15 H28 Z" fill="${C.greyL}"/><circle cx="32" cy="8" r="4.5" fill="${C.glass}"/>` +
    `<circle cx="32" cy="46" r="9" fill="${C.creamL}"/>` + gl(glyph, 32, 46, 0.72) +
    K.hi('M21 41 C21 37 23 34 26 32 L27 34 C25 36 24 38 24 41 Z');
  // Fruit juice: a tumbler of the juice with a badge of the fruit.
  const juice = (fill, glyph) => K.glass(fill, 'tumbler') + bdg(glyph, 47, 47, 12);

  FSI.add('pantry', {
    // ---------------------------------------------------------------- minerals and water
    water: () =>
      K.shadow(15) +
      `<path d="M30 5 C36 16 48 27 48 40 C48 51 40 58 30 58 C20 58 12 51 12 40 C12 27 24 16 30 5 Z" fill="${C.blue}"/>` +
      K.sh('M42 30 C47 38 47 50 38 55 C45 54 48 47 48 40 C48 36 45 32 42 30 Z') +
      K.hiE(20, 40, 3.5, 7, 15) +
      `<path d="M53 30 C55 34 58 37 58 40 C58 43 56 45 53 45 C50 45 48 43 48 40 C48 37 51 34 53 30 Z" fill="${C.blueL}"/>`,
    salt: () =>
      K.shadow(16) +
      `<path d="M18 26 C18 22 20 20 22 20 H42 C44 20 46 22 46 26 V54 C46 56.5 44.5 58 42 58 H22 C19.5 58 18 56.5 18 54 Z" fill="${C.glass}"/>` +
      `<path d="M20.5 34 C26 32 38 36 43.5 33 V54 C43.5 55 42.5 55.5 41.5 55.5 H22.5 C21.5 55.5 20.5 55 20.5 54 Z" fill="${C.white}" stroke="none"/>` +
      `<path d="M18 26 C18 22 20 20 22 20 H42 C44 20 46 22 46 26 V54 C46 56.5 44.5 58 42 58 H22 C19.5 58 18 56.5 18 54 Z" fill="none"/>` +
      `<path d="M17 21 C17 8 47 8 47 21 Z" fill="${C.steel}"/>` + K.dots([[27, 13], [32, 12], [37, 13], [29.5, 17], [34.5, 17]], 1.3) +
      K.line("M20.5 34 C26 32 38 36 43.5 33", 1.3, C.greyD) + K.dots([[26, 44], [31, 48], [37, 42], [35, 51], [25, 51]], 1.1, C.grey) +
      K.hi('M21 25 L24 25 L24 52 L21 50 Z'),
    fleur_de_sel: () =>
      K.shadow(25) +
      `<path d="M9 35 C11 21 22 13 32 13 C43 13 53 21 55 35 Z" fill="${C.white}"/>` +
      [[22, 25, 0], [32, 19, 20], [41, 26, -15], [29, 30, 40], [16, 32, -10], [47, 32, 15], [37, 32, 0]].map(([x, y, r]) =>
        `<path d="M${x - 3.5} ${y} L${x} ${y - 2.5} L${x + 3.5} ${y - 0.5} L${x + 1} ${y + 2} Z" transform="rotate(${r} ${x} ${y})" fill="${C.blueL}" stroke-width="1.2"/>`).join('') +
      `<path d="M5 34 H59 C59 48 48 57 32 57 C16 57 5 48 5 34 Z" fill="${C.wood}"/>` +
      `<path d="M5 34 H59" stroke="${C.woodL}" stroke-width="1.5"/>` + K.sh('M50 37 H57 C55 47 48 53 40 55 C46 50 49 44 50 37 Z') +
      K.hi('M9 38 H13 C14 43 16 46 19 49 L17 50 C13 47 10 43 9 38 Z'),
    rock_salt: () =>
      K.shadow(26) +
      `<path d="M30 56 L24 30 L36 14 L52 22 L58 46 L46 57 Z" fill="${C.pink}"/><path d="M24 30 L36 14 L52 22 L40 32 Z" fill="${C.pinkL}"/>` +
      K.line('M40 32 L46 57 M40 32 L58 46', 1.5, C.pinkD) + K.sh('M40 32 L58 46 L46 57 Z') +
      `<path d="M6 54 L8 40 L18 34 L28 40 L29 54 L22 58 L10 58 Z" fill="${C.pink}"/><path d="M8 40 L18 34 L28 40 L18 45 Z" fill="${C.pinkL}"/>` +
      K.line('M18 45 V58', 1.5, C.pinkD) +
      K.hiE(33, 21, 2, 4, 40),
    limestone: () =>
      K.shadow(27) +
      `<path d="M5 44 L9 26 L24 16 L46 15 L58 27 L59 48 L47 57 L14 56 Z" fill="${C.cream}"/>` +
      `<path d="M9 26 L24 16 L46 15 L58 27 L38 31 Z" fill="${C.creamL}"/>` +
      K.line('M7 35 C18 37 28 34 38 37 C46 39 52 36 58.5 37 M6 46 C18 48 30 45 40 48 C48 50 54 47 59 48', 1.5, C.creamD) +
      `<path d="M24 48 C20 48 19 44 22 43 C25 42 27 45 25 47 C23 48 22 46 23 45.5" fill="none" stroke="${C.greyD}" stroke-width="1.5"/>` +
      K.sh('M38 31 L58 27 L59 48 L47 57 Z'),
    trona: () =>
      K.shadow(26) +
      `<path d="M6 55 L10 42 L22 38 L42 37 L56 42 L58 55 Z" fill="${C.grey}"/>` +
      [[16, 44, 8, 20, -15, C.creamL], [25, 42, 8, 30, -5, C.cream], [34, 42, 8, 26, 8, C.yellowL], [44, 43, 8, 18, 22, C.creamL]].map(([x, y, w, h, r, f]) =>
        `<g transform="rotate(${r} ${x} ${y})"><path d="M${x - w / 2} ${y} V${y - h} L${x} ${y - h - 5} L${x + w / 2} ${y - h} V${y} Z" fill="${f}"/>` +
        `<path d="M${x} ${y} V${y - h - 5}" stroke="${C.creamD}" stroke-width="1.3"/></g>`).join('') +
      K.line('M10 49 C20 51 40 49 56 50', 1.5, C.greyD),
    nigari: () => K.sack(C.white, gl(G.crystal(C.white, C.tealL, C.teal), 32, 41, 0.95), C.teal),
    cream_of_tartar: () => K.jar(C.white, C.purple, gl(G.grape(C.purple), 32, 41, 0.75)),
    baking_soda: () =>
      K.shadow(22) +
      `<path d="M44 18 L54 13 V52 L44 57 Z" fill="${C.orangeD}"/>` +
      `<path d="M14 18 L24 13 H54 L44 18 Z" fill="${C.orangeL}"/>` +
      `<rect x="14" y="18" width="30" height="39" fill="${C.orange}"/>` +
      `<rect x="18" y="27" width="22" height="22" rx="3" fill="${C.creamL}"/>` + gl(G.bubbles, 29, 38, 0.85) +
      K.hi('M16 20 H19 V55 H16 Z'),
    baking_powder: () =>
      K.shadow(18) +
      `<path d="M14 16 V52 C14 55.5 22 58 32 58 C42 58 50 55.5 50 52 V16 Z" fill="${C.blue}"/>` +
      `<ellipse cx="32" cy="15" rx="18" ry="5" fill="${C.steel}"/><ellipse cx="32" cy="15" rx="13" ry="3" fill="${C.greyL}" stroke-width="1.4"/>` +
      `<path d="M14 28 C20 30 44 30 50 28 V46 C44 48 20 48 14 46 Z" fill="${C.creamL}"/>` + gl(G.muffin, 32, 37.5, 0.75) +
      K.hi('M17 21 L20 22 V54 L17 52 Z'),
    slaked_lime: () => K.sack(C.greyL, gl(G.rock(C.white), 30, 42, 0.8) + gl(G.drop(C.blueL), 41, 37, 0.42), C.greyD),
    kansui: () => K.bottle(C.yellowL, 'flask', C.creamL, gl(G.noodles, 32, 42.5, 0.55)),
    lye: () => K.jar(C.white, C.black, gl(G.pretzel, 32, 41, 0.75)),

    // ---------------------------------------------------------------- oils and fats
    olive_oil: () => K.bottle(C.leafL, 'oil', C.creamL, gl(G.olive, 32, 44.5, 0.6)),
    sunflower_oil: () => K.bottle(C.yellow, 'oil', C.leafL, gl(G.sunflower, 32, 44.5, 0.55)),
    rapeseed_oil: () => K.bottle(C.yellowL, 'oil', C.leafL, gl(G.rapeseed, 32, 44.5, 0.6)),
    peanut_oil: () => K.bottle(C.wheat, 'oil', C.creamL, gl(G.peanut, 32, 44.5, 0.6)),
    sesame_oil: () => K.bottle(C.brown, 'wine', C.creamL, gl(G.sesame, 32, 43, 0.6)),
    corn_oil: () => K.bottle(C.gold, 'oil', C.creamL, gl(G.corn, 32, 44.5, 0.6)),
    soybean_oil: () => K.bottle(C.wheatL, 'oil', C.leaf, gl(G.soy, 32, 44.5, 0.55)),
    coconut_oil: () => K.jar(C.white, C.brown, gl(G.coconut, 32, 41, 0.8)),
    palm_oil: () => K.bottle(C.orangeD, 'oil', C.creamL, gl(G.palm, 32, 44.5, 0.55)),
    walnut_oil: () => K.bottle(C.wheatD, 'wine', C.creamL, gl(G.walnut, 32, 43, 0.62)),
    flaxseed_oil: () => K.bottle(C.yellowD, 'oil', C.creamL, gl(G.flax, 32, 44.5, 0.6)),
    pumpkin_seed_oil: () => K.bottle(C.pine, 'oil', C.creamL, gl(G.pumpkin, 32, 44.5, 0.58)),
    fish_oil: () => K.bottle(C.yellow, 'flask', C.blueL, gl(G.fish, 32, 42.5, 0.6)),
  });

  // Low drum of solid sugar (palm sugar cakes).
  const disc = (cx, cy, rx, ry, h, side, top) =>
    `<path d="M${cx - rx} ${cy} V${cy + h} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy + h} V${cy} Z" fill="${side}"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${top}"/>`;
  const heap = (f, d) => `<path d="M-10.5 7 C-7 -3 -3 -8 0 -8 C3 -8 7 -3 10.5 7 Z" fill="${f}"/>` +
    K.dots([[-4, 2], [2, -3], [4, 4], [-1, 5], [6, 0]], 1.2, d);

  FSI.add('pantry', {
    // ---------------------------------------------------------------- sugars and syrups
    maple_sap: () =>
      K.shadow(26) +
      `<path d="M5 4 H23 V58 H5 Z" fill="${C.brown}"/>` + K.line('M10 9 V20 M17 27 V42 M10 38 V52', 1.8, C.brownD) +
      `<path d="M23 20 H37 L38 24 H23 Z" fill="${C.steel}"/>` +
      `<path d="M37 27 C38.5 29.5 40 31.5 40 33 C40 34.8 38.8 36 37 36 C35.2 36 34 34.8 34 33 C34 31.5 35.5 29.5 37 27 Z" fill="${C.blueL}" stroke-width="1.6"/>` +
      `<path d="M20 39 H56 L52.5 55.5 C52.2 57 51 58 49.5 58 H26.5 C25 58 23.8 57 23.5 55.5 Z" fill="${C.steel}"/>` +
      `<ellipse cx="38" cy="39" rx="18" ry="3.5" fill="${C.blueL}"/>` + K.line('M22.5 47 H53.5', 1.5, C.greyD) +
      K.sh('M46 42 H54 L51 56 C51 57 50 57.5 49 57.5 H44 Z') +
      gl(G.maple, 48, 15, 0.95, 12),
    raw_cane_sugar: () => K.sack(C.wheat, gl(G.cane, 32, 41, 0.95), C.brownD),
    molasses: () => K.jar(C.choc, C.brownD, gl(G.cane, 32, 41, 0.75)),
    white_sugar: () =>
      K.shadow(25) +
      cube(21, 40, 22, [C.white, C.milk, C.greyL]) + cube(43, 40, 22, [C.white, C.milk, C.greyL]) +
      cube(32, 25, 22, [C.white, C.milk, C.greyL]) +
      K.dots([[24, 26.5], [28, 20.5], [36, 22], [16, 35], [45, 36], [40, 31]], 1, C.greyD),
    brown_sugar: () => K.sack(C.brownL, gl(heap(C.brown, C.brownD), 32, 42, 0.95), C.brownD),
    powdered_sugar: () =>
      K.sack(C.white, gl(`<path d="M-10 -2 H6 C6 6 2 9 -2 9 C-6 9 -10 6 -10 -2 Z" fill="${C.steel}"/>` +
        `<path d="M-7 1.5 H3 M-6 5 H2" fill="none" stroke="${C.greyD}"/><path d="M6 -2 L11 -6" fill="none" stroke-width="3"/>` +
        K.dots([[-4, -7], [0, -9], [-7, -9], [3, -6]], 1.3, C.greyD), 32, 42, 0.95), C.pink),
    caramel: () =>
      K.shadow(25) +
      `<g transform="rotate(-18 30 26)"><path d="M18 26 L6 17 L8 26 L6 35 Z M42 26 L54 17 L52 26 L54 35 Z" fill="${C.glass}"/>` +
      `<rect x="16" y="15" width="28" height="22" rx="6" fill="${C.orange}"/><rect x="16" y="15" width="28" height="7" rx="3.5" fill="${C.orangeL}" stroke="none"/>` +
      `<rect x="16" y="15" width="28" height="22" rx="6" fill="none"/>` + K.hiE(22, 20, 1.6, 3, 60) + `</g>` +
      `<path d="M30 40 L44 34 L58 40 V50 L44 57 L30 50 Z" fill="${C.orangeD}"/><path d="M30 40 L44 34 L58 40 L44 46 Z" fill="${C.orange}"/>` +
      K.line('M44 46 V57', 1.8) + K.hiE(40, 39, 1.4, 3.5, 65),
    maple_syrup: () =>
      `<path d="M36 13 C45 11 47 21 40 23" fill="none" stroke-width="6"/><path d="M36 13 C45 11 47 21 40 23" fill="none" stroke="${C.orangeD}" stroke-width="2"/>` +
      K.bottle(C.orangeD, 'oil', C.creamL, gl(G.maple, 32, 44.5, 0.6)),
    corn_syrup: () => K.bottle(C.creamL, 'flask', C.yellowL, gl(G.corn, 32, 42.5, 0.5)),
    palm_sugar: () =>
      K.shadow(25) +
      disc(32, 44, 24, 7, 8, C.brown, C.brownL) + disc(30, 30, 19, 6, 8, C.brown, C.brownL) +
      K.line('M18 30 C22 33 38 33 42 30', 1.3, C.brownD) + K.hiE(22, 28.5, 3, 1.4, 0) +
      K.sh('M44 44 H56 V52 C56 55 50 57.5 44 58 Z'),
    golden_syrup: () =>
      K.shadow(19) +
      `<path d="M13 16 V52 C13 55.5 21.5 58 32 58 C42.5 58 51 55.5 51 52 V16 Z" fill="${C.gold}"/>` +
      `<ellipse cx="32" cy="15" rx="19" ry="5" fill="${C.yellowL}"/><ellipse cx="32" cy="15" rx="14" ry="3" fill="${C.gold}" stroke-width="1.4"/>` +
      `<path d="M13 27 C19 29.5 45 29.5 51 27 V46 C45 48.5 19 48.5 13 46 Z" fill="${C.pine}"/>` +
      gl(G.drop(C.yellow), 32, 37.5, 0.7) + K.hi('M16 21 L19 22 V54 L16 52 Z'),
    date_syrup: () => K.bottle(C.choc, 'flask', C.creamL, gl(G.date, 32, 42.5, 0.5)),

    // ---------------------------------------------------------------- juices and drinks
    apple_juice: () => juice(C.yellow, G.apple),
    orange_juice: () => juice(C.orange, G.orange),
    grape_juice: () => juice(C.purple, G.grape()),
    pomegranate_juice: () => juice(C.meatD, G.pomegranate),
    tomato_juice: () => juice(C.red, G.tomato),
    carrot_juice: () => juice(C.terracotta, G.carrot),
    grape_must: () =>
      K.shadow(26) +
      `<path d="M7 32 H57 L53 55 C52.6 57 51 58 49 58 H15 C13 58 11.4 57 11 55 Z" fill="${C.wood}"/>` +
      K.line('M9 41 H55 M11 51 H53', 2.5, C.woodD) + K.line('M22 38 L23 58 M42 38 L41 58', 1.3, C.woodD) +
      `<ellipse cx="32" cy="32" rx="25" ry="6" fill="${C.woodL}"/><ellipse cx="32" cy="32.5" rx="21.5" ry="4" fill="${C.purpleD}" stroke-width="1.6"/>` +
      gl(G.grape(C.purple), 32, 19, 1.05) + K.sh('M47 38 H55 L52 55 C52 57 50 57.5 49 57.5 H45 Z'),
    beer: () =>
      K.shadow(19) +
      `<path d="M44 27 C55 27 55 47 44 47" fill="none" stroke-width="7"/><path d="M44 27 C55 27 55 47 44 47" fill="none" stroke="${C.glass}" stroke-width="2.2"/>` +
      `<path d="M13 18 H45 V54 C45 56.5 43.5 58 41 58 H17 C14.5 58 13 56.5 13 54 Z" fill="${C.glass}"/>` +
      `<path d="M15.5 22 H42.5 V54 C42.5 55 41.5 55.5 40.5 55.5 H17.5 C16.5 55.5 15.5 55 15.5 54 Z" fill="${C.gold}" stroke="none"/>` +
      `<path d="M13 18 H45 V54 C45 56.5 43.5 58 41 58 H17 C14.5 58 13 56.5 13 54 Z" fill="none"/>` +
      `<path d="M11 23 C8 17 12 11 17 13 C19 7 27 7 29 11 C32 7 40 8 41 12 C46 11 49 17 46 23 C46 27 43 28 42 25 C38 26 15 26 11 23 Z" fill="${C.white}"/>` +
      K.dots([[24, 37], [30, 45], [35, 33], [22, 49]], 1.3, C.yellowL) + K.hi('M17 28 L20 28 L20 52 L17 51 Z'),
    red_wine: () => K.bottle(C.redD, 'wine', C.creamL, gl(G.grape(C.purple), 32, 43, 0.6)),
    white_wine: () => K.bottle(C.tealL, 'wine', C.creamL, gl(G.grape(C.leafL), 32, 43, 0.6)),
    cider: () => K.bottle(C.yellow, 'wine', C.creamL, gl(G.apple, 32, 43, 0.6)),
    sake: () =>
      K.shadow(25, 58, 34) +
      `<path d="M21 8 C21 5.5 33 5.5 33 8 C33 10 30.5 11 30.5 15 C30.5 21 42 28 42 42 C42 52 36 58 27 58 C18 58 12 52 12 42 C12 28 23.5 21 23.5 15 C23.5 11 21 10 21 8 Z" fill="${C.white}"/>` +
      `<path d="M13.5 35 C20 37.5 34 37.5 40.5 35 V40 C34 42.5 20 42.5 13.2 40 Z" fill="${C.blue}" stroke-width="1.6"/>` +
      K.hi('M16 44 C16 49 18 52 21 54 L22 52 C20 50 19 47 19 44 Z') +
      `<path d="M40 44 H58 L56 55 C55.5 57 54 58 52 58 H46 C44 58 42.5 57 42 55 Z" fill="${C.white}"/>` +
      `<ellipse cx="49" cy="44" rx="9" ry="2.6" fill="${C.creamL}" stroke-width="1.6"/>` + K.line('M41.5 50 H56.5', 1.5, C.blue),
    mirin: () => K.bottle(C.orangeL, 'oil', C.red, gl(G.rice, 32, 44.5, 0.6)),
    neutral_spirit: () => K.bottle(C.glass, 'wine', C.greyL, gl(G.ear(false), 32, 43, 0.62)),
    rum: () => K.bottle(C.orangeD, 'flask', C.creamL, gl(G.cane, 32, 42.5, 0.5)),
    brandy: () =>
      K.shadow(14) +
      `<path d="M22 9 H42 C50 15 54 24 52 33 C50 41 42 45 32 45 C22 45 14 41 12 33 C10 24 14 15 22 9 Z" fill="${C.glass}"/>` +
      `<path d="M13 31 H51 C50 39 42 43 32 43 C22 43 14 39 13 31 Z" fill="${C.orangeD}" stroke="none"/>` +
      `<ellipse cx="32" cy="31" rx="19" ry="2.5" fill="${C.orange}" stroke-width="1.4"/>` +
      `<path d="M22 9 H42 C50 15 54 24 52 33 C50 41 42 45 32 45 C22 45 14 41 12 33 C10 24 14 15 22 9 Z" fill="none"/>` +
      `<path d="M32 45 V54" stroke-width="3.5"/><path d="M21 58 C22 54 42 54 43 58 Z" fill="${C.glass}"/>` +
      K.hi('M17 22 C18 18 20 15 23 13 L25 14 C22 17 20 21 20 24 Z'),
    kirsch: () => K.bottle(C.glass, 'flask', C.white, gl(G.cherry, 32, 42.5, 0.55)),

    // ---------------------------------------------------------------- ferments
    yeast: () =>
      K.shadow(24) + cube(30, 35, 40, [C.creamL, C.cream, C.creamD]) +
      `<path d="M50 32 L50 26 L45 28 Z" fill="${C.cream}" stroke-width="1.6"/>` +
      `<path d="M52 53 L57 51 L58 55 L54 57 Z M47 56 L50 55 L50.5 58 L47.5 58.5 Z" fill="${C.cream}" stroke-width="1.6"/>` +
      K.dots([[22, 23], [30, 19], [36, 24], [27, 28]], 1.3, C.creamD) + K.dots([[20, 42], [16, 37], [38, 44], [43, 38]], 1.2, C.greyD) +
      K.hiE(20, 24, 2, 5, 65),
    sourdough_starter: () =>
      K.jar(C.cream, C.woodL, '') +
      `<path d="M15.5 37 H48.5" stroke="${C.red}" stroke-width="3.5"/>` +
      [[24, 31, 2.6], [36, 29.5, 2], [29, 45, 3], [40, 41, 2.4], [23, 51, 2], [37, 51, 1.8]].map(([x, y, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.creamL}" stroke-width="1.3"/>`).join(''),
    koji: () =>
      K.board(`<path d="M9 44 C10 32 22 23 33 23 C45 23 53 30 54 37 C44 43 28 50 18 50 Z" fill="${C.creamL}"/>` +
        [[20, 36, 20], [28, 30, -10], [37, 28, 30], [44, 33, -20], [30, 40, 10], [22, 45, -30], [39, 40, 40], [14, 42, 0]].map(([x, y, r]) =>
          `<ellipse cx="${x}" cy="${y}" rx="2.3" ry="4" transform="rotate(${r} ${x} ${y})" fill="${C.white}" stroke-width="1.2"/>`).join('') +
        K.dots([[25, 35], [33, 34], [42, 29], [35, 45], [18, 40]], 1.1, C.leafL)),
    miso: () => K.jar(C.wheatD, C.brown, gl(G.soy, 32, 41, 0.75)),
    doubanjiang: () => K.jar(C.redD, C.black, gl(G.bean, 32, 41, 0.75)),
    gochujang: () =>
      K.shadow(23) +
      `<path d="M10 27 H54 V52 C54 55.5 51 58 47 58 H17 C13 58 10 55.5 10 52 Z" fill="${C.red}"/>` +
      `<path d="M8 21 C8 18.5 9.5 17 12 17 H52 C54.5 17 56 18.5 56 21 V27.5 H8 Z" fill="${C.redD}"/>` +
      `<rect x="17" y="32" width="30" height="20" rx="3" fill="${C.creamL}"/>` + gl(G.chili, 32, 42, 0.78) +
      K.hi('M13 31 H16 V53 L13 51 Z'),
    kimchi: () =>
      K.jar(C.red, C.leaf, '') +
      `<path d="M19 31 C25 27 31 32 29 39 C26 44 19 43 19 37 Z M33 30 C38 27 45 31 45 37 C42 41 35 39 33 30 Z M22 47 C27 43 36 44 40 49 C35 54 26 54 22 47 Z" fill="${C.yellowL}" stroke-width="1.5"/>` +
      K.line('M21 34 C24 34 26 36 27 40 M35 31 C38 33 41 35 43 37 M25 48 C30 47 34 48 38 49', 1.3, C.redD) +
      K.dots([[31, 43], [44, 44], [20, 52], [30, 36], [43, 52]], 1.1, C.redD),
    sauerkraut: () =>
      K.shadow(22) +
      `<path d="M14 23 C14 13 23 9 32 10 C42 9 50 13 50 23 Z" fill="${C.yellowL}"/>` +
      K.line('M19 20 C22 16 25 15 28 15 M27 21 C30 17 34 15 38 16 M36 21 C38 18 42 17 45 18 M22 13 C26 12 29 13 31 14', 1.3, C.wheatD) +
      `<path d="M8 25 H12 M52 25 H56" stroke-width="5"/>` +
      `<path d="M11 21 H53 L51 53 C51 56 48.5 58 45 58 H19 C15.5 58 13 56 13 53 Z" fill="${C.greyL}"/>` +
      `<path d="M12 29 H52 V34 H12 Z M13 46 H51 V49 H13 Z" fill="${C.blue}" stroke-width="1.4"/>` +
      K.sh('M44 22 H52 L50.5 53 C50.5 55.5 48.5 57.5 45 57.5 H42 Z') + K.hi('M15 24 H18 V52 L16 50 Z'),
    dill_pickles: () =>
      K.jar(C.leafL, C.leafD, '') +
      [[24, 33, 52, -6], [32.5, 31, 53, 0], [41, 33, 52, 6]].map(([x, y1, y2, r]) =>
        `<rect x="${x - 4}" y="${y1}" width="8" height="${y2 - y1}" rx="4" transform="rotate(${r} ${x} ${(y1 + y2) / 2})" fill="${C.leaf}" stroke-width="1.6"/>`).join('') +
      K.dots([[23, 38], [25, 45], [32, 36], [33.5, 44], [40, 40], [42, 47]], 1.1, C.leafD) +
      K.line('M45 28 L39 23 M42 26 L44 22 M41 25 L37 26', 1.4, C.leafD),
    preserved_lemons: () =>
      K.jar(C.yellowL, C.blue, '') +
      [[25, 34, 7], [39, 37, 7], [30, 48, 7]].map(([x, y, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.yellow}" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="${r - 2.2}" fill="${C.yellowL}" stroke="none"/>` +
        K.line(`M${x} ${y - r + 2.5} V${y + r - 2.5} M${x - r + 2.5} ${y} H${x + r - 2.5}`, 1.2, C.yellowD)).join(''),
    tempeh: () =>
      slab([C.creamL, C.cream, C.creamD],
        [[14, 34], [21, 30], [28, 27], [35, 24], [20, 37], [27, 34], [34, 31], [41, 28], [27, 40], [34, 37], [41, 34], [48, 31]].map(([x, y]) =>
          `<ellipse cx="${x}" cy="${y}" rx="3" ry="2" fill="${C.wheat}" stroke-width="1.2"/>`).join('') +
        K.dots([[14, 42], [19, 45], [13, 47], [34, 48], [44, 43], [52, 38]], 1.3, C.wheatD)),
    sake_lees: () =>
      slab([C.white, C.creamL, C.cream],
        `<path d="M12 30 L32 23 L36 26 L40 24 L50 29 L44 31.5 L46 34 L26 41 Z" fill="${C.white}"/>` +
        `<path d="M12 30 L26 41 V45 L12 34 Z" fill="${C.cream}"/><path d="M26 41 L46 34 V37.5 L26 45 Z" fill="${C.creamD}"/>` +
        K.hiE(22, 29, 1.6, 4, 70)),
    shrimp_paste: () =>
      slab([C.purpleL, C.purple, C.purpleD], gl(G.shrimp, 32, 33, 0.95, 10)),
    cured_olives: () =>
      K.bowl([[17, 28, C.purpleD], [27, 26, C.leaf], [37, 26, C.purpleD], [46, 28, C.leaf], [22, 33, C.leaf], [32, 32, C.purpleD], [42, 33, C.purpleD]].map(([x, y, f]) =>
        `<ellipse cx="${x}" cy="${y}" rx="5.5" ry="4.2" fill="${f}" stroke-width="1.8"/>` + K.hiE(x - 2, y - 1.5, 1, 1.8, 60)).join(''), C.terracotta, C.leafD),
    natto: () =>
      `<path d="M41 7 L28 28 M49 9 L33 30" stroke-width="5"/><path d="M41 7 L28 28 M49 9 L33 30" stroke="${C.woodL}" stroke-width="2"/>` +
      K.bowl([[16, 29], [23, 26], [31, 25], [39, 26], [46, 29], [20, 33], [28, 31], [36, 31], [44, 33]].map(([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="3.6" fill="${C.brownL}" stroke-width="1.6"/>`).join('') +
        K.line('M16 27 C20 18 26 18 28 29 M33 24 C36 16 42 17 44 31', 1.3, C.white), C.white, C.brown),
    red_wine_vinegar: () => cruet(C.redD, G.grape(C.purple)),
    white_wine_vinegar: () => cruet(C.yellowL, G.grape(C.leafL)),
    apple_cider_vinegar: () => cruet(C.orange, G.apple),
    rice_vinegar: () => cruet(C.wheatL, G.rice),
    malt_vinegar: () => cruet(C.brown, G.ear(true)),
    balsamic_vinegar: () => cruet(C.black, G.grape(C.purpleD)),
  });
})(FSI);
