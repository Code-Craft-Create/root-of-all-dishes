// Sauces, stocks, condiments and preserves (see assets/STYLE.md).
(function (FSI) {
  const { C, K } = FSI;

  // ---- local helpers ----------------------------------------------------------
  // Glyphs are drawn around (0,0), about 16 units wide; G() places them.
  const G = (m, x = 32, y = 41, s = 1, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${m}</g>`;
  const gl = {
    strawberry: `<path d="M-7 -3 C-7 -7 7 -7 7 -3 C7 2 3 7 0 8 C-3 7 -7 2 -7 -3 Z" fill="${C.red}" stroke-width="1.5"/>` +
      K.dots([[-3, -1], [3, -1], [0, 2], [-1.5, 5], [1.5, 5], [0, -3.5]], 0.9, C.yellowL) +
      `<path d="M-5 -5 L-3 -8.5 L0 -6 L3 -8.5 L5 -5 L0 -3.5 Z" fill="${C.leaf}" stroke-width="1.2"/>`,
    raspberry: [[-4, -2.5], [0, -3], [4, -2.5], [-2.2, 1.5], [2.2, 1.5], [0, 5.2]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="2.9" fill="${C.meat}" stroke-width="1.2"/>`).join('') +
      `<path d="M-3 -5.5 L0 -8.5 L3 -5.5 Z" fill="${C.leaf}" stroke-width="1.1"/>`,
    apricot: `<circle cx="0" cy="1" r="7" fill="${C.orange}" stroke-width="1.5"/>` + K.line('M0 -5.5 C-3 -2 -3 4 0 7.5', 1.1, C.orangeD) +
      `<path d="M1 -6 C3 -9 7 -9 8 -7 C6 -5 3 -5 1 -6 Z" fill="${C.leaf}" stroke-width="1.1"/>` + K.hiE(-3, -2, 2, 1.2),
    cherry: K.line('M-3.5 1 C-2 -3 1 -6 3 -8 M4 0 C4 -3 3.5 -6 3 -8', 1.3, C.leafD) +
      `<circle cx="-3.8" cy="3.8" r="4" fill="${C.redD}" stroke-width="1.4"/><circle cx="4.2" cy="3" r="4" fill="${C.redD}" stroke-width="1.4"/>` +
      K.dots([[-5, 2.5], [3, 1.7]], 0.9, '#fff'),
    blueberry: [[-3.8, 2.5], [3.8, 2.5], [0, -3.5]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="4" fill="${C.blueD}" stroke-width="1.4"/>`).join('') +
      K.dots([[-3.8, 1.5], [3.8, 1.5], [0, -4.5]], 0.9, C.ink),
    fig: `<path d="M0 -8 C1.5 -8 1.5 -5.5 2.5 -4.5 C7 -2.5 8 3 6 6 C4 8.5 -4 8.5 -6 6 C-8 3 -7 -2.5 -2.5 -4.5 C-1.5 -5.5 -1.5 -8 0 -8 Z" fill="${C.purple}" stroke-width="1.5"/>` +
      `<path d="M-3.5 4 C-3.5 0 3.5 0 3.5 4 C3.5 6.5 -3.5 6.5 -3.5 4 Z" fill="${C.pinkL}" stroke-width="1"/>` + K.dots([[-1.5, 3.5], [1.5, 3.5], [0, 5]], 0.6, C.pinkD),
    plum: `<ellipse cx="0" cy="1.5" rx="6.5" ry="7" fill="${C.purpleD}" stroke-width="1.5"/>` + K.line('M-1 -4.5 C-3 -1 -3 4 -1 8', 1.1, C.purpleL) +
      K.line('M0 -5 L1.5 -8.5', 1.3) + `<path d="M1.5 -7 C4 -9 7 -8 8 -6 C5 -5 3 -5 1.5 -7 Z" fill="${C.leaf}" stroke-width="1.1"/>`,
    blackcurrant: K.line('M-6 -8 C-2 -6 2 -4 6 -5', 1.3, C.leafD) +
      [[-5, -2], [0.5, 0], [5.5, -0.5], [-2.5, 5], [3.5, 5.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${C.black}" stroke-width="1.2"/>`).join('') +
      K.dots([[-5.8, -2.8], [-0.3, -0.8], [4.7, -1.3]], 0.7, '#fff'),
    lingonberry: `<path d="M-1 -2 C-5 -9 -9 -6 -8 -3 C-6 -2 -3 -2 -1 -2 Z M1 -2 C5 -9 9 -6 8 -3 C6 -2 3 -2 1 -2 Z" fill="${C.leafD}" stroke-width="1.1"/>` +
      [[-3.5, 2], [3, 1.5], [0, 6], [-5, 6.5], [5, 6.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${C.red}" stroke-width="1.1"/>`).join(''),
    slice: (f, l, d) => `<circle cx="0" cy="0" r="8" fill="${f}" stroke-width="1.5"/><circle cx="0" cy="0" r="6" fill="${l}" stroke="${d}" stroke-width="1"/>` +
      K.line('M0 -6 V6 M-6 0 H6 M-4.2 -4.2 L4.2 4.2 M-4.2 4.2 L4.2 -4.2', 1, d),
    apple: `<path d="M0 -4 C5 -8 9 -4 8 1 C7 6 4 8 1.5 7 C1 6.7 -1 6.7 -1.5 7 C-4 8 -7 6 -8 1 C-9 -4 -5 -8 0 -4 Z" fill="${C.red}" stroke-width="1.5"/>` +
      K.line('M0 -4 C0 -6 1 -8 2 -9', 1.3) + `<path d="M1 -6 C3 -9 7 -9 7.5 -7.5 C5.5 -6 3 -5.5 1 -6 Z" fill="${C.leaf}" stroke-width="1.1"/>` + K.hiE(-4, -2, 2, 1.2),
    tomato: `<circle cx="0" cy="1" r="7.5" fill="${C.red}" stroke-width="1.5"/>` +
      `<path d="M0 -5 L-4 -7.5 L-1.5 -7 L-2 -9.5 L0 -7.5 L2 -9.5 L1.5 -7 L4 -7.5 Z" fill="${C.leaf}" stroke-width="1"/>` + K.hiE(-3.5, -1.5, 2, 1.2),
    chili: `<path d="M-7 -5 C-3 -5 3 -2 7 7 C1 5 -5 1 -7 -5 Z" fill="${C.red}" stroke-width="1.4"/>` +
      `<path d="M-8.5 -7.5 C-8 -5.5 -6.5 -4 -4.5 -4.5" fill="none" stroke="${C.leafD}" stroke-width="2"/>`,
    jalapeno: `<path d="M-7 -4 C-2 -6 4 -3 7 5 C5 8 1 7 -2 4 C-5 1 -7 -1 -7 -4 Z" fill="${C.leafD}" stroke-width="1.4"/>` +
      `<path d="M-8.5 -7.5 C-8 -5.5 -7 -4 -5.5 -4.5" fill="none" stroke="${C.leaf}" stroke-width="2"/>` + K.hiE(-2, -3, 2.2, 1),
    fish: `<path d="M-8.5 0 C-5 -5.5 2 -5.5 4 -1 L8.5 -4.5 V4.5 L4 1 C2 5.5 -5 5.5 -8.5 0 Z" fill="${C.blueL}" stroke-width="1.4"/>` +
      K.dots([[-5, -1]], 0.9) + K.line('M-2 -3.5 C-1 -1 -1 1 -2 3.5', 1, C.blueD),
    soy: `<path d="M-8 3 C-8 -2 -5 -3 -3 -2 C-1 -4 2 -4 3 -2 C5 -4 8 -3 8 1 C8 5 5 5 3 4 C1 6 -2 6 -3 4 C-5 6 -8 6 -8 3 Z" fill="${C.leaf}" stroke-width="1.4"/>` +
      K.line('M-5.5 1 V2.5 M0 1 V2.5 M5.5 1 V2.5', 1.6, C.leafD),
    egg: `<path d="M0 -8.5 C4.5 -8.5 7 -1 7 2 C7 6 4 8.5 0 8.5 C-4 8.5 -7 6 -7 2 C-7 -1 -4.5 -8.5 0 -8.5 Z" fill="${C.cream}" stroke-width="1.5"/>` + K.hiE(-2.5, -2.5, 1.8, 2.8, 20),
    yolk: `<path d="M-8 1 C-8 -5 -3 -7 1 -6 C6 -6 8 -2 7 2 C6 6 2 7 -2 7 C-6 7 -8 5 -8 1 Z" fill="${C.white}" stroke-width="1.4"/><circle cx="0" cy="0.5" r="3.6" fill="${C.yellow}" stroke-width="1.2"/>`,
    basil: `<path d="M-1 8 C-8 4 -8 -5 0 -9 C8 -5 7 4 -1 8 Z" fill="${C.leaf}" stroke-width="1.5"/>` +
      K.line('M-1 8 L0 -6 M-0.5 2 L-4 -1 M-0.5 2 L3.5 -1', 1.1, C.leafD),
    garlic: `<path d="M0 -8 C1 -5 7 -3 7 2 C7 6 4 8 0 8 C-4 8 -7 6 -7 2 C-7 -3 -1 -5 0 -8 Z" fill="${C.white}" stroke-width="1.5"/>` + K.line('M0 -3 C-2 1 -2 5 0 8 M0 -3 C2 1 2 5 0 8', 1, C.greyD),
    chestnut: `<path d="M-7.5 3 C-7.5 -3 -3 -7 0 -8.5 C3 -7 7.5 -3 7.5 3 C7.5 6.5 4 8 0 8 C-4 8 -7.5 6.5 -7.5 3 Z" fill="${C.brownD}" stroke-width="1.5"/>` +
      `<path d="M-7.3 3.5 C-4 5.5 4 5.5 7.3 3.5 C7 6.5 4 8 0 8 C-4 8 -7 6.5 -7.3 3.5 Z" fill="${C.brownL}" stroke-width="1.1"/>` + K.hiE(-3, -2, 1.6, 2.6, 20),
    tamarind: `<path d="M-9 2 C-9 -1 -7 -2 -5 -1 C-4 -4 0 -4 1 -1.5 C2 -4.5 6 -4 7 -1 C9 0 9 3 7 4 C5 6 2 5 1 3.5 C0 5.5 -4 5.5 -5 3.5 C-7 5 -9 4 -9 2 Z" fill="${C.brownL}" stroke-width="1.4"/>` +
      K.line('M-6 1 C-2 2 3 1 6 0', 1, C.brown),
    peanut: `<path d="M-2 -7.5 C2 -9 5 -6 4 -3 C3.5 -1.5 3.5 0 4.5 1.5 C6.5 5 4 9 0 8.5 C-4 8 -6 4 -4 1 C-3 -0.5 -3 -2 -4 -3.5 C-5 -5.5 -4.5 -7 -2 -7.5 Z" fill="${C.woodL}" stroke-width="1.4"/>` +
      K.dots([[-1, -4.5], [1.5, -3], [0, 3], [2.5, 5], [-1.5, 5.5]], 0.7, C.woodD),
    oyster: `<path d="M-9 1 C-9 -5 -2 -8 4 -6 C9 -4 10 2 6 6 C2 9 -6 8 -9 1 Z" fill="${C.greyL}" stroke-width="1.4"/>` +
      `<path d="M-6 1 C-6 -3 -1 -5 3 -3.5 C6 -2 6 2 4 4 C1 6 -4 5 -6 1 Z" fill="${C.creamL}" stroke-width="1"/><circle cx="0" cy="0.5" r="1.6" fill="${C.white}" stroke-width="0.8"/>`,
    bone: `<path d="M-5 -2 H5 C5 -6 10 -6 9.5 -3 C12 -2 12 2 9.5 3 C10 6 5 6 5 2 H-5 C-5 6 -10 6 -9.5 3 C-12 2 -12 -2 -9.5 -3 C-10 -6 -5 -6 -5 -2 Z" fill="${C.cream}" stroke-width="1.4"/>`,
    drumstick: `<path d="M-2 2 C-8 0 -9 -7 -4 -9 C1 -11 7 -6 4 -1 L6 3 C8 2 10 4 8.5 5.5 C10 7.5 7.5 9.5 6 7.5 C4.5 9 2.5 7 4 5.5 L1.5 2 Z" fill="${C.orangeL}" stroke-width="1.4"/>` +
      `<path d="M4 -1 L6 3 C8 2 10 4 8.5 5.5 C10 7.5 7.5 9.5 6 7.5 C4.5 9 2.5 7 4 5.5 L1.5 2 Z" fill="${C.creamL}" stroke-width="1.2"/>`,
    anise: (() => { let d = ''; for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, b = a + Math.PI / 8, c = a - Math.PI / 8; d += `${i ? 'L' : 'M'}${(2.6 * Math.cos(c)).toFixed(1)} ${(2.6 * Math.sin(c)).toFixed(1)} L${(8.5 * Math.cos(a)).toFixed(1)} ${(8.5 * Math.sin(a)).toFixed(1)} L${(2.6 * Math.cos(b)).toFixed(1)} ${(2.6 * Math.sin(b)).toFixed(1)} `; }
      return `<path d="${d}Z" fill="${C.brown}" stroke-width="1.2"/>` + `<circle cx="0" cy="0" r="1.4" fill="${C.brownD}" stroke="none"/>`; })(),
    flame: `<path d="M0 9 C-6 9 -8 4 -6.5 0 C-5 -3 -3 -4 -3 -8 C1 -6 2 -3 1.5 -1 C3 -2 4 -4 4 -5 C7 -2 8 3 6 6 C5 8 3 9 0 9 Z" fill="${C.orange}" stroke-width="1.4"/>` +
      `<path d="M0 8 C-3 8 -3.5 5 -2 3 C-1 2 -0.5 1 -0.5 -0.5 C2 1 3.5 4 2.5 6 C2 7.5 1 8 0 8 Z" fill="${C.yellow}" stroke="none"/>`,
    skewer: K.line('M-9 9 L9 -9', 1.5, C.woodD) + [[-4, 4], [0, 0], [4, -4]].map(([x, y]) =>
      `<rect x="${x - 3}" y="${y - 3}" width="6" height="6" rx="1.8" transform="rotate(45 ${x} ${y})" fill="${C.brown}" stroke-width="1.2"/>`).join('') + K.dots([[-4.5, 3], [-0.5, -1], [3.5, -5]], 0.7, C.white),
    seeds: [[-4, 3], [0, 3.5], [4, 3], [-2, -0.5], [2, -0.5], [0, -4]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="2.4" fill="${C.yellowD}" stroke-width="1.1"/>`).join(''),
    bean: [[-3.5, 3, -20], [3.5, 2.5, 25], [0, -3.5, 0]].map(([x, y, r]) =>
      `<ellipse cx="${x}" cy="${y}" rx="4" ry="3" transform="rotate(${r} ${x} ${y})" fill="${C.redD}" stroke-width="1.2"/>`).join('') +
      K.dots([[-3.5, 2.5], [3.5, 2], [0, -4]], 0.7, C.white),
    quince: `<path d="M0 -6 C5 -7 8 -3 7.5 2 C7 6 4 8.5 0 8.5 C-4 8.5 -7 6 -7.5 2 C-8 -3 -5 -7 0 -6 Z" fill="${C.yellow}" stroke-width="1.5"/>` +
      K.line('M0 -6 L1 -9', 1.3) + `<path d="M1 -7.5 C3 -10 7 -10 8 -8 C6 -6.5 3 -6.5 1 -7.5 Z" fill="${C.leaf}" stroke-width="1.1"/>`,
  };
  // Jam jar: kit jar with a cloth cover tied over the lid.
  const jam = (fill, cloth, glyph) =>
    K.jar(fill, cloth, G(glyph)) +
    `<path d="M15 21 C12 17 15 9 32 9 C49 9 52 17 49 21 L45.5 23.5 L42 21 L38.5 23.5 L35 21 L32 23.5 L29 21 L25.5 23.5 L22 21 L18.5 23.5 Z" fill="${cloth}"/>` +
    K.line('M15.5 18 C24 20.5 40 20.5 48.5 18', 2.2, C.ink) + K.dots([[22, 13], [32, 12], [42, 13], [27, 16], [37, 16]], 1.3, C.creamL);
  // Jar without a label, showing pieces in brine or oil (same body as K.jar).
  const pjar = (brine, lid, pieces) =>
    `${K.shadow(17)}<rect x="15" y="19" width="34" height="39" rx="7" fill="${C.glass}"/>` +
    `<rect x="17.5" y="24" width="29" height="31.5" rx="5" fill="${brine}" stroke="none"/>` + pieces +
    `<rect x="15" y="19" width="34" height="39" rx="7" fill="none"/>` +
    `<rect x="17" y="10" width="30" height="10" rx="3" fill="${lid}"/>` + K.line('M21 13.5 V17 M27 13.5 V17 M32 13.5 V17 M37 13.5 V17 M43 13.5 V17', 1.2) +
    K.hi('M18.5 24 L21.5 24 L21.5 52 L18.5 50 Z');
  // Squeeze bottle with nozzle cap.
  const squeeze = (fill, cap, glyph) =>
    K.shadow(17) + `<path d="M29.5 15 L31 5 H33 L34.5 15 Z" fill="${cap}"/>` +
    `<path d="M19 24 C19 20 23 15 27 15 H37 C41 15 45 20 45 24 V54 C45 56.5 43.5 58 41 58 H23 C20.5 58 19 56.5 19 54 Z" fill="${fill}"/>` +
    `<path d="M19.2 23 H44.8" fill="none" stroke-width="2"/>` +
    `<rect x="22" y="31" width="20" height="19" rx="3" fill="${C.creamL}"/>` + G(glyph, 32, 40.5, 0.95) +
    K.hi('M22 25 L25 25 L25 29 L22 29 Z M22 51 L25 51 L25 55 L22 54 Z');
  // Tin can with a printed label.
  const can = (label, glyph, top = '') =>
    K.shadow(19) + `<path d="M13 17 V52 C13 56 21 58.5 32 58.5 C43 58.5 51 56 51 52 V17 Z" fill="${C.steel}"/>` +
    `<path d="M13 23 C13 27 21 29 32 29 C43 29 51 27 51 23 V47 C51 51 43 53 32 53 C21 53 13 51 13 47 Z" fill="${label}"/>` +
    `<ellipse cx="32" cy="17" rx="19" ry="5.5" fill="${C.greyL}"/>` + (top || `<ellipse cx="32" cy="17" rx="15" ry="3.6" fill="none" stroke="${C.greyD}" stroke-width="1.3"/>`) +
    `<ellipse cx="32" cy="40" rx="8.5" ry="8.5" fill="${C.creamL}" stroke-width="1.5"/>` + G(glyph, 32, 40, 0.85) +
    K.hi('M16 30 L19 31 L19 46 L16 45 Z');
  // Glass jug (stocks): liquid colour + badge glyph.
  const jug = (liquid, glyph) =>
    K.shadow(19) + `<path d="M46 24 C57 24 58 44 46 46" fill="none" stroke-width="6"/><path d="M46 24 C57 24 58 44 46 46" fill="none" stroke="${C.glass}" stroke-width="1.5"/>` +
    `<path d="M10 13 L17 18 H47 C48 30 49 42 48 52 C48 56 45 58 41 58 H23 C19 58 16 56 16 52 C15 42 15 30 16 22 Z" fill="${C.glass}"/>` +
    `<path d="M16.5 30 C24 32 40 28 47.3 30 C47.8 38 47.5 46 46.8 52 C46.5 55 44.5 56.5 41 56.5 H23 C19.5 56.5 17.5 55 17.4 52 C16.8 44 16.6 37 16.5 30 Z" fill="${liquid}" stroke="none"/>` +
    `<path d="M10 13 L17 18 H47 C48 30 49 42 48 52 C48 56 45 58 41 58 H23 C19 58 16 56 16 52 C15 42 15 30 16 22 Z" fill="none"/>` +
    K.line('M16.5 30 C24 32 40 28 47.3 30', 1.5) + K.line('M42 24 H47 M43 36 H47.5 M43 46 H47.5', 1.3, C.greyD) +
    K.hi('M19.5 22 L22.5 22 L22.5 50 L19.5 49 Z') +
    `<circle cx="27" cy="44" r="9" fill="${C.white}" stroke-width="2"/>` + G(glyph, 27, 44, 0.8);
  // Saucepan with long handle, sauce seen from above.
  const pan = (sauce, body, extra = '') =>
    K.shadow(24) + `<path d="M48 33 L61 26" stroke-width="6"/><path d="M48 33 L61 26" stroke="${C.black}" stroke-width="2"/>` +
    `<path d="M5 30 H51 V49 C51 54 47 57 42 57 H14 C9 57 5 54 5 49 Z" fill="${body}"/>` +
    `<ellipse cx="28" cy="30" rx="23" ry="7" fill="${C.greyL}"/><ellipse cx="28" cy="31" rx="20" ry="5" fill="${sauce}" stroke-width="1.5"/>` + extra +
    K.hi('M8 37 L11 37 L11 50 C11 52 10 52 8 50 Z') + K.sh('M44 38 L51 36 V49 C51 54 47 57 42 57 C46 54 45 45 44 38 Z');
  // Sauce boat on a saucer.
  const boat = (sauce, extra = '') =>
    K.shadow(26, 57) + `<ellipse cx="33" cy="51" rx="26" ry="6" fill="${C.white}"/>` +
    `<path d="M51 30 C61 28 61 43 49 44" fill="none" stroke-width="5.5"/><path d="M51 30 C61 28 61 43 49 44" fill="none" stroke="${C.white}" stroke-width="1.2"/>` +
    `<path d="M4 23 C10 25 13 28 15 33 C17 44 24 51 33 51 C45 51 52 42 53 28 Z" fill="${C.white}"/>` +
    `<path d="M4 23 C18 18 42 19 53 28 C42 34 22 34 4 23 Z" fill="${sauce}"/>` + extra +
    K.hi('M18 37 C19 42 22 46 26 48 L27 46 C24 44 22 41 21 37 Z') + K.sh('M44 36 C47 34 52 32 53 30 C52 41 46 49 36 51 C42 46 44 41 44 36 Z');
  // Stone mortar and pestle with a paste.
  const mortar = (paste, flecks) =>
    K.shadow(24) + `<ellipse cx="30" cy="28" rx="24" ry="7.5" fill="${C.grey}"/>` +
    `<ellipse cx="30" cy="28.5" rx="20" ry="5" fill="${paste}" stroke-width="1.5"/>` + K.dots(flecks, 1.2, C.ink) +
    `<path d="M35 29 L50 5 C52 3 56 5 55 8 L41 31 Z" fill="${C.greyL}"/>` +
    `<path d="M6 28 C6 46 16 55 30 55 C44 55 54 46 54 28 C54 33 44 36.5 30 36.5 C16 36.5 6 33 6 28 Z" fill="${C.grey}"/>` +
    `<path d="M20 54 L19 58 H41 L40 54" fill="${C.greyD}"/>` +
    K.hi('M10 36 C11 42 14 47 19 50 L20 48 C17 45 15 41 14 37 Z') + K.sh('M46 38 C44 45 40 50 34 53 C44 53 51 46 53 36 Z');
  // Slim hot-sauce bottle.
  const slim = (fill, cap, glyph) =>
    K.shadow(13) + `<path d="M28.5 13 H35.5 V22 C35.5 26 43 27 43 33 V55 C43 57 42 58 40 58 H24 C22 58 21 57 21 55 V33 C21 27 28.5 26 28.5 22 Z" fill="${fill}"/>` +
    `<path d="M27.5 3 H36.5 V13 H27.5 Z" fill="${cap}"/>` + K.line('M30 6 V10 M34 6 V10', 1.2) +
    `<rect x="23.5" y="35" width="17" height="16" rx="2" fill="${C.creamL}"/>` + G(glyph, 32, 43, 0.9) +
    K.hi('M24 31 L27 29 L27 33 L24 34 Z');

  FSI.add('sauces_preserves', {
    // ---- bottled sauces ----
    soy_sauce: () =>
      K.shadow(15) +
      `<path d="M22 58 H42 C44.5 58 46 56 45.5 53 L42 31 C41 26 38 24 37 22 V18 H27 V22 C26 24 23 26 22 31 L18.5 53 C18 56 19.5 58 22 58 Z" fill="${C.glass}"/>` +
      `<path d="M21 35 H43 L45 53 C45.5 55.5 44 56.5 42 56.5 H22 C20 56.5 18.5 55.5 19 53 Z" fill="${C.choc}" stroke="none"/>` +
      `<path d="M22 58 H42 C44.5 58 46 56 45.5 53 L42 31 C41 26 38 24 37 22 V18 H27 V22 C26 24 23 26 22 31 L18.5 53 C18 56 19.5 58 22 58 Z" fill="none"/>` +
      K.line('M21 35 H43', 1.5) +
      `<path d="M28 11 L15 7 L16 12 L27 15 Z" fill="${C.red}"/>` +
      `<path d="M25 19 H39 V12 C39 8 36 6 32 6 C28 6 25 8 25 12 Z" fill="${C.red}"/>` +
      K.hi('M24.5 31 L27 28 L25 47 L22.5 48 Z'),
    fish_sauce: () => K.bottle(C.orangeD, 'wine', C.creamL, G(gl.fish, 32, 43, 0.95)),
    worcestershire_sauce: () =>
      K.bottle(C.choc, 'wine', '', '') +
      `<path d="M20 31 C23 28 41 28 44 31 V53 C41 55 23 55 20 53 Z" fill="${C.orange}"/>` +
      K.line('M22 33 C26 31.5 38 31.5 42 33 M22 51 C26 52.5 38 52.5 42 51', 1.2, C.orangeD) +
      `<path d="M32 36 L38 42 L32 48 L26 42 Z" fill="${C.creamL}" stroke-width="1.5"/>` + K.dots([[32, 42]], 1.6, C.redD),
    hot_sauce: () => slim(C.red, C.leafD, gl.chili),
    lacto_fermented_hot_sauce: () =>
      K.bottle(C.orange, 'flask', C.creamL, G(gl.jalapeno, 32, 42.5, 0.8)) +
      K.dots([[22, 47], [41, 49], [38, 53], [27, 54]], 1.2, C.orangeL),
    ketchup: () => squeeze(C.red, C.redD, gl.tomato),
    mustard: () => squeeze(C.yellow, C.yellowD, gl.seeds),
    bbq_sauce: () => K.bottle(C.redD, 'oil', C.creamL, G(gl.flame, 32, 44.5, 0.75)) ,
    teriyaki_sauce: () => K.bottle(C.brownD, 'flask', C.yellowL, G(gl.skewer, 32, 42.5, 0.65)),
    oyster_sauce: () => K.bottle(C.brown, 'oil', C.creamL, G(gl.oyster, 32, 44.5, 0.8)),
    kecap_manis: () =>
      K.bottle(C.black, 'oil', C.yellow, G(gl.soy, 32, 44.5, 0.8)) +
      `<path d="M28 6 H36 L37 3 H27 Z" fill="${C.redD}" stroke-width="1.5"/>`,
    // ---- tomato products ----
    tomato_passata: () => K.bottle(C.red, 'wine', C.creamL, G(gl.tomato, 32, 43, 0.85)),
    tomato_paste: () =>
      K.shadow(25) +
      `<g transform="rotate(-18 32 36)">` +
      `<path d="M7 26 L44 27.5 C47 28 47 44 44 44.5 L7 46 Z" fill="${C.red}"/>` +
      `<path d="M4 25 H9 V47 H4 Z" fill="${C.steel}"/>` + K.line('M4 29 H9 M4 33 H9 M4 37 H9 M4 41 H9 M4 45 H9', 1) +
      `<path d="M46 31 H51 V41 H46 Z" fill="${C.steel}"/><rect x="51" y="29" width="8" height="14" rx="2" fill="${C.white}"/>` +
      `<rect x="15" y="29.5" width="22" height="13" rx="2" fill="${C.creamL}" stroke-width="1.5"/>` + G(gl.tomato, 26, 36, 0.62, 18) +
      K.hi('M10 29 L42 30 L42 32 L10 32 Z') + `</g>`,
    canned_tomatoes: () =>
      can(C.red, gl.tomato,
        `<ellipse cx="32" cy="17" rx="16" ry="4" fill="${C.redD}" stroke-width="1.5"/>` +
        `<path d="M19 17 C19 11 27 10 28 15 C29 9 37 9 38 15 C39 10 46 11 45 17 Z" fill="${C.red}" stroke-width="1.6"/>` +
        K.line('M26 13 C27 15 27 16 26 17 M37 12 C38 14 38 15 37 17', 1.1, C.redD)),
    sun_dried_tomatoes: () => {
      const piece = (x, y, rot, f) =>
        `<g transform="rotate(${rot} ${x} ${y})"><path d="M${x - 13} ${y} C${x - 14} ${y - 8} ${x - 6} ${y - 11} ${x} ${y - 9} C${x + 6} ${y - 11} ${x + 14} ${y - 8} ${x + 13} ${y} C${x + 12} ${y + 8} ${x + 4} ${y + 10} ${x} ${y + 8} C${x - 5} ${y + 10} ${x - 12} ${y + 8} ${x - 13} ${y} Z" fill="${f}"/>` +
        K.line(`M${x - 8} ${y - 3} C${x - 4} ${y - 1} ${x - 2} ${y - 5} ${x + 2} ${y - 2} C${x + 5} ${y} ${x + 7} ${y - 3} ${x + 9} ${y - 1} M${x - 7} ${y + 3} C${x - 3} ${y + 5} ${x + 2} ${y + 1} ${x + 7} ${y + 4}`, 1.3, C.meatD) + `</g>`;
      return K.shadow(26, 57) + piece(22, 42, -12, C.redD) + piece(42, 46, 10, C.redD) + piece(34, 28, 4, C.meat) + K.hiE(27, 23, 4, 1.8, -10);
    },
    // ---- jams & sweet preserves ----
    strawberry_jam: () => jam(C.red, C.redL, gl.strawberry),
    raspberry_jam: () => jam(C.meat, C.pink, gl.raspberry),
    apricot_jam: () => jam(C.orange, C.yellow, gl.apricot),
    cherry_jam: () => jam(C.redD, C.white, gl.cherry),
    blueberry_jam: () => jam(C.purpleD, C.blueL, gl.blueberry),
    fig_jam: () => jam(C.brownD, C.purpleL, gl.fig),
    plum_jam: () => jam(C.purple, C.leafL, gl.plum),
    blackcurrant_jam: () => jam(C.black, C.purpleL, gl.blackcurrant),
    lingonberry_jam: () => jam(C.redD, C.leafL, gl.lingonberry),
    orange_marmalade: () => jam(C.orangeL, C.orange, gl.slice(C.orange, C.orangeL, C.orangeD)),
    lemon_marmalade: () => jam(C.yellowL, C.yellow, gl.slice(C.yellow, C.yellowL, C.yellowD)),

    quince_paste: () =>
      K.shadow(25) +
      `<path d="M5 34 L36 22 L57 30 V44 L26 56 L5 48 Z" fill="${C.orangeD}"/>` +
      `<path d="M5 34 L36 22 L57 30 L26 42 Z" fill="${C.orange}"/>` + K.line('M26 42 V56', 2.5) +
      K.sh('M26 42 L57 30 V44 L26 56 Z') + K.hi('M10 34 L34 25 L37 26.5 L13 35.5 Z') +
      G(gl.quince, 46, 18, 0.95),
    applesauce: () => K.jar(C.yellowL, C.leaf, G(gl.apple, 32, 41, 1.05)),
    cranberry_sauce: () =>
      K.plate(
        `<path d="M14 38 V26 C14 21 22 18 32 18 C42 18 50 21 50 26 V38 C50 43 42 46 32 46 C22 46 14 43 14 38 Z" fill="${C.redD}"/>` +
        `<ellipse cx="32" cy="26" rx="18" ry="7" fill="${C.red}"/>` +
        K.line('M14 31 C18 34 46 34 50 31 M14 36 C18 39 46 39 50 36', 1.4, C.meatD) +
        K.hiE(25, 24, 6, 2, -5) + K.dots([[38, 27], [42, 25]], 1.3, C.redL) +
        `<circle cx="51" cy="44" r="3.5" fill="${C.red}" stroke-width="1.5"/><circle cx="45" cy="47.5" r="3.5" fill="${C.redD}" stroke-width="1.5"/>`),
    tamarind_paste: () => K.jar(C.brownD, C.brown, G(gl.tamarind, 32, 41, 1.05)),
    red_bean_paste: () => K.jar(C.meatD, C.choc, G(gl.bean, 32, 41, 1.05)),
    chestnut_puree: () => can(C.brown, gl.chestnut),
    // ---- pickles: pieces in brine ----
    pickled_ginger: () => pjar(C.pinkL, C.white,
      [[25, 30, -20], [36, 33, 15], [27, 41, 10], [38, 45, -15], [26, 51, -5], [37, 52, 20]].map(([x, y, r]) =>
        `<path d="M${x - 7} ${y + 2} C${x - 5} ${y - 4} ${x + 5} ${y - 4} ${x + 7} ${y + 2} C${x + 3} ${y} ${x - 3} ${y} ${x - 7} ${y + 2} Z" transform="rotate(${r} ${x} ${y})" fill="${C.pink}" stroke-width="1.4"/>`).join('')),
    pickled_jalapenos: () => pjar(C.yellowL, C.leafD,
      [[25, 30], [38, 32], [31, 41], [24, 50], [39, 49]].map(([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="6" fill="${C.leaf}" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="3" fill="${C.leafL}" stroke-width="1"/>` + K.dots([[x - 1, y - 1], [x + 1, y + 1]], 0.8, C.creamL)).join('')),
    pickled_red_onions: () => pjar(C.pinkL, C.purpleD,
      [[25, 31, 7, 4, -20], [37, 34, 7, 4, 15], [30, 44, 8, 4.5, 5], [25, 52, 6, 3.5, 20], [39, 52, 6, 3.5, -10]].map(([x, y, rx, ry, r]) =>
        `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${x} ${y})" fill="none" stroke="${C.purple}" stroke-width="3"/>` +
        `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${x} ${y})" fill="none" stroke="${C.purpleL}" stroke-width="1"/>`).join('')),
    do_chua_pickles: () => pjar(C.creamL, C.red,
      [[21, 27, 4, C.orange], [26.5, 26, -3, C.white], [32, 27, 6, C.orange], [37.5, 26, -5, C.white], [43, 27, 2, C.orange], [24, 28, -8, C.orange], [40, 28, 9, C.white]].map(([x, y, r, f]) =>
        `<rect x="${x - 2.3}" y="${y}" width="4.6" height="28" rx="1" transform="rotate(${r} ${x} ${y + 14})" fill="${f}" stroke-width="1.3"/>`).join('')),
    chili_oil: () => pjar(C.redD, C.choc,
      `<rect x="17.5" y="24" width="29" height="10" fill="${C.orange}" stroke="none"/>` + K.line('M17.5 34 H46.5', 1.2, C.meatD) +
      K.dots([[22, 39], [28, 43], [35, 38], [41, 44], [25, 49], [33, 51], [40, 50], [30, 46], [22, 54], [37, 45]], 1.4, C.choc) +
      K.dots([[25, 41], [38, 41], [32, 54], [43, 53]], 1.1, C.creamL) +
      `<path d="M29 30 C30 27 33 26 35 27 C34 29 32 31 29 30 Z" fill="${C.redL}" stroke-width="1"/>`),
    // ---- pastes, spreads, emulsions ----
    mayonnaise: () => K.jar(C.creamL, C.blue, G(gl.egg, 32, 41, 1.05)) +
      `<rect x="17.5" y="26" width="29" height="5" fill="${C.cream}" stroke="none"/>`,
    pesto: () => K.jar(C.leafD, C.steel, G(gl.basil, 32, 41, 1.05)) + K.dots([[20, 28], [26, 29], [40, 28], [44, 29], [21, 53], [43, 53]], 1, C.leafL),
    hoisin_sauce: () => K.jar(C.choc, C.redD, G(gl.anise, 32, 41, 1.05)),
    harissa: () => K.jar(C.redD, C.yellow, G(gl.chili, 32, 41, 1.05)) + K.dots([[21, 29], [42, 28], [21, 53], [43, 53]], 1, C.orange),
    peanut_sauce: () => K.jar(C.orangeD, C.brownL, G(gl.peanut, 32, 41, 1.05)),
    red_curry_paste: () => mortar(C.redD, [[22, 28], [30, 30], [37, 27], [26, 26]]),
    green_curry_paste: () => mortar(C.leaf, [[22, 28], [30, 30], [37, 27], [26, 26]]),
    // ---- stocks & broths ----
    chicken_stock: () => jug(C.yellow, gl.drumstick),
    beef_stock: () => jug(C.brown, gl.bone),
    fish_stock: () => jug(C.creamD, gl.fish),
    vegetable_stock: () =>
      `<path d="M36 26 L48 6 C49 4 52 5 51.5 7.5 L41 27 Z" fill="${C.orange}"/>` + K.line('M44 18 L47 19 M46 14 L49 15', 1.3, C.orangeD) +
      `<path d="M50 6 C52 3 55 2 57 3 C56 5 53 7 50 6 Z" fill="${C.leaf}" stroke-width="1.5"/>` +
      `<path d="M20 27 L15 6 C14.5 4 17.5 3 18.5 5 L25 27 Z" fill="${C.leafL}"/>` +
      `<path d="M13 7 C10 4 12 1 15 2 C16 0 20 1 19 4 C21 5 20 8 17 7 Z" fill="${C.leaf}" stroke-width="1.5"/>` +
      K.pot(`<ellipse cx="32" cy="26.5" rx="21" ry="4" fill="${C.wheat}" stroke="none"/>` +
        `<ellipse cx="25" cy="26.5" rx="3" ry="1.5" fill="${C.orange}" stroke-width="1.2"/><ellipse cx="38" cy="27" rx="3" ry="1.5" fill="${C.leafL}" stroke-width="1.2"/>`, C.leaf),
    pork_bone_broth: () =>
      K.pot(`<ellipse cx="32" cy="26.5" rx="21" ry="4" fill="${C.creamL}" stroke="none"/>` +
        G(gl.bone, 38, 19, 1.1, -50) + `<ellipse cx="38" cy="26.5" rx="6" ry="1.6" fill="${C.creamL}" stroke="none"/>` +
        K.dots([[21, 26], [26, 27.5], [30, 25.5]], 1.2, C.fat), C.steel) + K.steam(22, 12),
    dashi: () =>
      K.bowl(
        `<path d="M16 29 C20 25 26 27 28 24 C31 27 36 25 38 28 C35 31 30 29 27 32 C24 30 19 32 16 29 Z" fill="${C.pine}" stroke-width="1.5"/>` +
        `<path d="M38 26 L44 24 L46 28 L40 30 Z M43 30 L49 28.5 L50 31.5 L45 33 Z" fill="${C.pinkL}" stroke-width="1.2"/>`,
        C.black, C.wheat) + K.steam(32, 12),
    // ---- cooked sauces ----
    demi_glace: () => pan(C.choc, C.orangeD, K.hiE(20, 30, 5, 1.4, -5) + K.hiE(33, 33, 3, 1, -5)),
    bechamel: () => pan(C.creamL, C.steel,
      K.line('M23 31 C25 29 30 33 33 31', 1.2, C.creamD) +
      `<path d="M37 24 L47 4" stroke="${C.ink}" stroke-width="5"/><path d="M37 24 L47 4" stroke="${C.greyD}" stroke-width="2"/>` +
      `<ellipse cx="34" cy="28" rx="3.5" ry="8" transform="rotate(27 34 28)" fill="none" stroke="${C.greyD}" stroke-width="1.8"/>` +
      `<ellipse cx="34" cy="28" rx="6" ry="8" transform="rotate(27 34 28)" fill="none" stroke="${C.ink}" stroke-width="1.5"/>`),
    tomato_sauce: () => pan(C.red, C.black, G(gl.basil, 30, 30, 0.75, 70) + K.dots([[19, 31], [40, 30]], 1.2, C.redD)),
    hollandaise: () => boat(C.yellowL, K.hiE(22, 23, 5, 1.4, -5)) + G(gl.slice(C.yellow, C.yellowL, C.yellowD), 53, 52, 0.75),
    gravy: () => boat(C.brownD, K.hiE(22, 23, 5, 1.4, -5)),
    roux: () =>
      K.shadow(22) + `<path d="M45 30 L61 22" stroke-width="6"/><path d="M45 30 L61 22" stroke="${C.woodD}" stroke-width="2"/>` +
      `<path d="M4 32 C4 46 14 52 26 52 C38 52 48 46 48 32 Z" fill="${C.black}"/>` +
      `<ellipse cx="26" cy="32" rx="22" ry="9" fill="${C.black}"/><ellipse cx="26" cy="33" rx="18.5" ry="6.5" fill="${C.wheat}" stroke-width="1.5"/>` +
      K.line('M15 33 C18 31 22 35 26 33 C30 31 33 35 37 33', 1.3, C.wheatD) +
      `<path d="M30 33 L48 6" stroke="${C.ink}" stroke-width="5"/><path d="M30 33 L48 6" stroke="${C.woodL}" stroke-width="2"/>` +
      `<ellipse cx="28" cy="35" rx="4" ry="2.5" transform="rotate(-55 28 35)" fill="${C.woodL}" stroke-width="2"/>` +
      K.hi('M8 38 C10 44 14 47 19 49 L19 47 C15 45 12 42 11 38 Z'),
    bolognese_ragu: () =>
      K.pot(`<ellipse cx="32" cy="26.5" rx="21" ry="4" fill="${C.redD}" stroke="none"/>` +
        K.dots([[18, 26], [24, 27.5], [29, 25.5], [35, 27.5], [41, 26], [46, 27], [27, 28]], 1.7, C.brownD) +
        K.dots([[21, 25.5], [38, 25], [44, 28]], 1.1, C.orange) +
        `<path d="M36 26 L52 4" stroke="${C.ink}" stroke-width="5"/><path d="M36 26 L52 4" stroke="${C.woodL}" stroke-width="2"/>`, C.orange) + K.steam(20, 12),
    // ---- bowls of fresh sauces ----
    mole_sauce: () => K.bowl(K.dots([[22, 29], [28, 31], [35, 28], [41, 31], [30, 27], [45, 28]], 1.3, C.creamL) + K.hiE(24, 27, 6, 1.4, -5), C.terracotta, C.choc),
    tzatziki: () => K.bowl(
      `<circle cx="38" cy="28" r="5.5" fill="${C.leafD}" stroke-width="1.5"/><circle cx="38" cy="28" r="3.8" fill="${C.leafL}" stroke="none"/>` + K.dots([[37, 27], [39.5, 29]], 0.7, C.cream) +
      K.line('M18 28 L28 26 M21 27 L20 24 M24 26.5 L24 23 M21 27.5 L21 30.5 M25 26.8 L26 29.5', 1.3, C.leafD) +
      K.dots([[31, 31], [45, 26]], 1.2, C.wheat), C.blueL, C.white),
    chimichurri: () => K.bowl(
      K.dots([[16, 30], [20, 27], [25, 31], [29, 26], [33, 29], [38, 32], [42, 27], [47, 30], [23, 28], [36, 26], [44, 32]], 1.6, C.pine) +
      K.dots([[19, 31], [31, 31], [40, 29], [46, 27], [27, 28]], 1.1, C.red), C.white, C.leaf),
    salsa_verde: () =>
      K.shadow(24) + `<path d="M14 50 L11 58 M50 50 L53 58 M32 54 V58" stroke-width="5"/><path d="M14 50 L11 58 M50 50 L53 58 M32 54 V58" stroke="${C.grey}" stroke-width="2"/>` +
      `<ellipse cx="32" cy="30" rx="27" ry="9" fill="${C.grey}"/><ellipse cx="32" cy="30" rx="23.5" ry="6.5" fill="${C.leafL}" stroke-width="1.5"/>` +
      K.dots([[18, 30], [24, 27.5], [30, 31.5], [37, 28], [44, 31], [47, 28], [27, 33]], 1.6, C.leaf) + K.dots([[21, 32], [34, 27], [41, 33]], 1.1, C.creamL) +
      `<path d="M38 26 C40 20 48 19 50 22 C49 26 43 27 38 26 Z" fill="${C.leaf}" stroke-width="1.6"/><path d="M40 25.5 C42 22 47 21.5 48.5 23" fill="none" stroke="${C.leafL}" stroke-width="1.3"/>` +
      `<path d="M5 30 C5 45 17 54 32 54 C47 54 59 45 59 30 C59 35 47 39 32 39 C17 39 5 35 5 30 Z" fill="${C.grey}"/>` +
      K.dots([[16, 43], [26, 48], [40, 47], [48, 42], [33, 44]], 1, C.greyD) + K.sh('M50 38 C47 45 42 50 35 53 C46 52 55 45 57 36 Z'),
  });
})(FSI);
