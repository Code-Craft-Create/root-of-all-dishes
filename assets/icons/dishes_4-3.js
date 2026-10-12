// Dishes group 4, part 3: North American dishes (see assets/STYLE.md, reference buttered_toast).
(function (FSI) {
  const { C, K } = FSI;
  // ---- local helpers -------------------------------------------------------
  const P = (d, fill, sw) => `<path d="${d}" fill="${fill}"${sw === 0 ? ' stroke="none"' : sw ? ` stroke-width="${sw}"` : ''}/>`;
  const E = (cx, cy, rx, ry, fill, sw, rot) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${sw === 0 ? ' stroke="none"' : sw ? ` stroke-width="${sw}"` : ''}${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
  const O = (cx, cy, r, fill, sw) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${sw === 0 ? ' stroke="none"' : sw ? ` stroke-width="${sw}"` : ''}/>`;
  const G = (x, y, rot, s, m) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${m}</g>`;
  // outlined strand (noodle, stick, stem): ink underlay plus coloured core
  const tube = (d, col, w = 2.2) => K.line(d, w + 2.6, C.ink) + K.line(d, w, col);
  const leaf = (x, y, rot, fill = C.leaf, len = 10) =>
    G(x, y, rot, 1, `<path d="M0 0 C${len * 0.3} ${-len * 0.4} ${len * 0.75} ${-len * 0.4} ${len} 0 C${len * 0.75} ${len * 0.4} ${len * 0.3} ${len * 0.4} 0 0 Z" fill="${fill}" stroke-width="1.5"/>`);
  const shrimp = (x, y, rot = 0, s = 1) =>
    G(x, y, rot, s,
      `<path d="M-2.5 2.5 L-9 7.5 L-2 8 Z" fill="${C.orange}" stroke-width="1.6"/>` +
      `<path d="M-7.5 1.5 C-9 -6 -1.5 -10 5 -7.5 C10 -5 10 2.5 6 6.5 L2.5 2.5 C5 0 4 -4 1 -4 C-2.5 -4 -4 -1.5 -2.5 2.5 Z" fill="${C.pinkL}" stroke-width="1.8"/>` +
      K.line('M0 -8.5 L0.6 -4 M5 -7 L3.2 -2.8 M-5.6 -4.4 L-2.6 -2', 1.2, C.pinkD));
  const lime = (x, y, rot = 0) =>
    G(x, y, rot, 1, `<path d="M-7 0 A7 7 0 0 0 7 0 Z" fill="${C.leaf}" stroke-width="1.8"/><path d="M-4.6 0.8 A4.6 4.6 0 0 0 4.6 0.8 Z" fill="${C.leafL}" stroke="none"/>` +
      K.line('M0 1 V5 M-2.5 1 L-3.5 3.8 M2.5 1 L3.5 3.8', 1, C.leafD));
  const egg = (x, y, s = 1) =>
    G(x, y, 0, s, `<path d="M-10 0 C-11 -5 -5 -7 0 -6 C6 -8 11 -4 10 1 C9 5 3 6 -1 5.5 C-6 6 -10 4 -10 0 Z" fill="${C.white}" stroke-width="1.8"/>` +
      `<ellipse cx="0" cy="-0.5" rx="4.2" ry="3.4" fill="${C.yellow}" stroke-width="1.6"/>` + K.hiE(-1.3, -1.5, 1.6, 0.9, -10));
  const chili = (x, y, rot = 0) => G(x, y, rot, 1, `<ellipse cx="0" cy="0" rx="2.6" ry="2.2" fill="${C.red}" stroke-width="1.3"/><circle cx="0" cy="0" r="0.9" fill="${C.yellowL}" stroke="none"/>`);
  const rice = (d) => P(d, C.white) + K.dots([[24, 30], [28, 26], [33, 28], [21, 35], [30, 33], [36, 32], [26, 38], [34, 37]].map(([x, y]) => [x, y]), 0.9, C.greyL);


  // scalloped (crispy) outline around an ellipse
  const bumpy = (cx, cy, rx, ry, n, amp, rot = 0) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * 2 * Math.PI, a1 = ((i + 1) / n) * 2 * Math.PI, am = (a0 + a1) / 2;
      const p = (a, k) => `${(cx + Math.cos(a) * rx * k).toFixed(1)} ${(cy + Math.sin(a) * ry * k).toFixed(1)}`;
      d += (i ? '' : `M${p(a0, 1)} `) + `Q${p(am, 1 + amp)} ${p(a1, 1)} `;
    }
    return { d: d + 'Z', rot };
  };
  // whole pie in its crust, 3/4 view
  const pie = (fill, top) => K.shadow(27) +
    `<path d="M5 34 L9 47 C11 53 20 56 32 56 C44 56 53 53 55 47 L59 34 Z" fill="${C.wheatD}"/>` +
    `<ellipse cx="32" cy="34" rx="27" ry="13" fill="${C.wheat}"/>` +
    `<ellipse cx="32" cy="34" rx="21.5" ry="9.5" fill="${fill}" stroke-width="2"/>` +
    K.line('M7 30 L10 31 M9 26 L12 28 M14 23 L16 25.5 M21 21.5 L22 24 M28 21 V23.5 M35 21 L34.5 23.5 M42 21.5 L41 24 M49 23 L47 25.5 M54 26 L51.5 28 M57 30 L54 31 M57 38 L54 37 M53 43 L50.5 41 M46 46 L44.5 43.5 M38 47.5 L37.5 44.5 M30 47.6 L30 44.5 M22 46.5 L23 43.8 M15 43.5 L17 41.5 M9.5 39 L12 37.5', 1.3, C.wheatD) +
    top + K.hiE(14, 29, 3.5, 1.5, -25);
  // triangular wedge of pie or cake on a plate: top colour, side colour, base (crust) colour
  const wedge = (top, side, base, extra = '') => K.plate(
    `<path d="M8 32 L22 38 V50 L8 44 Z" fill="${side}"/><path d="M22 38 L56 30 V42 L22 50 Z" fill="${side}"/>` +
    `<path d="M8 40 L22 46 V50 L8 44 Z M22 46 L56 38 V42 L22 50 Z" fill="${base}" stroke-width="1.8"/>` +
    K.sh('M22 38 L56 30 V42 L22 50 Z') +
    `<path d="M8 32 L42 16 L56 30 L22 38 Z" fill="${top}"/>` + extra);
  const sesame = (pts) => pts.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="1.6" ry="0.9" fill="${C.creamL}" stroke="${C.wheatD}" stroke-width="0.8" transform="rotate(${r} ${x} ${y})"/>`).join('');

  FSI.add('dishes_4', {
    // Stacked burger: sesame bun, lettuce, tomato, melted cheese, beef patty.
    cheeseburger: () => K.shadow(24) +
      P('M11 46 H53 C53 53 48 56 41 56 H23 C16 56 11 53 11 46 Z', C.wheat) +
      P('M8 41 C8 37 12 36 16 36 H48 C52 36 56 37 56 41 C56 45 52 47 48 47 H16 C12 47 8 45 8 41 Z', C.brownD) +
      P('M10 35 H54 L51 39 L47 37.5 L43 43 L39 38 H23 L19 42 L16 38 L12 38 Z', C.yellow, 2) +
      `<rect x="12" y="30" width="40" height="6" rx="2" fill="${C.red}" stroke-width="2"/>` +
      P('M6 31 C9 27 12 32 15 28 C18 32 21 27 24 31 C27 27 30 32 33 28 C36 32 39 27 42 31 C45 27 48 32 51 28 C54 31 57 29 58 31 L55 34 H9 Z', C.leaf, 2) +
      P('M9 29 C9 15 19 8 32 8 C45 8 55 15 55 29 Z', C.wheat) +
      sesame([[22, 15, -20], [30, 12, 0], [38, 14, 15], [44, 19, 30], [26, 20, -10], [35, 20, 10], [17, 22, -30]]) +
      K.hiE(20, 17, 5, 2.2, -25),

    // Sausage in a soft bun with mustard and ketchup.
    hot_dog: () => K.shadow(27) + G(32, 36, -10, 1,
      P('M-25 1 C-25 -12 25 -12 25 1 Z', C.wheatD) +
      `<rect x="-30" y="-9" width="60" height="13" rx="6.5" fill="${C.meat}"/>` + K.hi('M-27 -6.5 H22 V-4.5 H-27 Z') +
      tube('M-22 -4 L-17 0 L-12 -4 L-7 0 L-2 -4 L3 0 L8 -4 L13 0 L18 -4', C.yellow, 2) +
      P('M-27 -1 C-27 17 27 17 27 -1 C15 5 -15 5 -27 -1 Z', C.wheat) +
      K.hi('M-23 4 C-21 9 -16 12 -10 13 L-11 10.5 C-15 9.5 -18 7 -19 4 Z')),

    // Elbow macaroni in cheese sauce with toasted breadcrumbs.
    mac_and_cheese: () => K.bowl(
      P('M9 30 C10 21 20 17 32 17 C44 17 54 21 55 30 C46 34 18 34 9 30 Z', C.yellow, 1.8) +
      [[17, 25, 10], [27, 21, -20], [38, 22, 30], [46, 26, -10], [24, 29, 40], [35, 28, -40], [14, 30, 0], [44, 31, 20]].map(([x, y, r]) =>
        G(x, y, r, 1, tube('M-4 2 C-4 -3 4 -3 4 2', C.yellowL, 2.4))).join('') +
      K.dots([[20, 22], [32, 19], [42, 21], [30, 25], [50, 28], [21, 26]], 1.2, C.orangeD),
      C.white, C.yellowD),

    // Shredded barbecue pork piled in a bun with coleslaw.
    bbq_pulled_pork: () => K.shadow(25) +
      P('M11 45 H53 C53 52 48 55 41 55 H23 C16 55 11 52 11 45 Z', C.wheat) +
      P('M6 41 C5 35 10 33 13 35 C14 31 19 30 22 32 C25 29 30 30 32 32 C35 29 41 29 43 32 C47 30 52 31 53 35 C58 35 60 40 57 43 C55 47 50 45 47 47 C42 48 38 46 34 48 C29 49 25 46 20 48 C15 49 12 46 10 46 C7 46 6 44 6 41 Z', C.brown) +
      K.line('M12 40 C18 37 24 42 30 38 M34 41 C40 37 46 42 52 38 M18 44 L24 41 M40 45 L46 42', 1.5, C.redD) +
      P('M9 33 C10 29 16 29 20 30 C26 28 38 28 44 30 C48 29 54 30 55 33 C50 35 14 35 9 33 Z', C.creamL, 1.8) +
      K.line('M14 32 L18 31 M24 31.5 L28 30.5 M36 31 L40 32 M46 31 L50 32', 1.3, C.purple) + K.line('M20 33 L23 32 M31 32.5 L34 31.5 M42 33 L45 32', 1.3, C.leaf) +
      P('M10 30 C10 17 20 11 32 11 C44 11 54 17 54 30 Z', C.orangeL) + K.hiE(21, 19, 5, 2.2, -25),

    // Saucy chicken wings with celery and blue cheese dip.
    buffalo_wings: () => K.plate(
      [[18, 34, -20], [32, 30, 10], [30, 44, -5]].map(([x, y, r]) => G(x, y, r, 1,
        `<path d="M-11 -1 C-11 -7 -3 -8 2 -5 L8 -6 C11 -8 14 -5 12 -3 C14 -1 12 3 9 1 L2 3 C-2 7 -11 6 -11 -1 Z" fill="${C.orangeD}"/>` +
        K.hiE(-5, -3, 3, 1.3, -10) + K.dots([[-3, 2], [3, -1]], 0.9, C.redD))).join('') +
      tube('M44 46 L56 36 M42 42 L53 33', C.leafL, 2.6) +
      E(48, 26, 7.5, 4.5, C.white) + E(48, 25.5, 5.4, 2.8, C.creamL, 0) + K.dots([[46, 25], [50, 26.5], [49, 24]], 0.9, C.blueD)),

    // Creamy clam chowder with potato and bacon, a clam shell on the rim.
    new_england_clam_chowder: () => K.steam(28, 9) + K.bowl(
      `<rect x="13" y="24" width="8" height="7" rx="2" fill="${C.yellowL}" stroke-width="1.6"/><rect x="30" y="27" width="8" height="7" rx="2" fill="${C.yellowL}" stroke-width="1.6"/>` +
      `<rect x="22" y="21" width="7" height="5" rx="1.5" fill="${C.meatL}" stroke-width="1.5"/><rect x="38" y="22" width="7" height="5" rx="1.5" fill="${C.meatL}" stroke-width="1.5"/>` +
      K.dots([[27, 31], [19, 33], [42, 31]], 1.3, C.leaf) +
      G(50, 23, 15, 1, `<path d="M-9 4 C-10 -4 -4 -9 0 -9 C4 -9 10 -4 9 4 Z" fill="${C.greyL}"/>` + K.line('M0 -8 V3 M-5 -6 L-3 3 M5 -6 L3 3', 1.2, C.greyD) + `<rect x="-3" y="3" width="6" height="3" rx="1" fill="${C.grey}" stroke-width="1.4"/>`),
      C.white, C.cream),

    // Crispy buttermilk fried chicken drumsticks.
    southern_fried_chicken: () => K.plate(
      [[22, 34, -25], [38, 42, 15]].map(([x, y, r]) => {
        const b = bumpy(0, 0, 13, 9, 12, 0.13);
        return G(x, y, r, 1,
          `<path d="M10 -2 L19 -2" stroke="${C.ink}" stroke-width="6"/><path d="M10 -2 L19 -2" stroke="${C.creamL}" stroke-width="3"/>` +
          `<circle cx="20" cy="-4" r="2.6" fill="${C.creamL}" stroke-width="1.6"/><circle cx="20" cy="0" r="2.6" fill="${C.creamL}" stroke-width="1.6"/>` +
          `<path d="${b.d}" fill="${C.orange}"/>` +
          K.dots([[-6, -2], [-1, 3], [4, -3], [-3, -5], [6, 3], [-8, 3]], 1.2, C.orangeD) + K.hiE(-5, -4, 4, 1.8, -10));
      }).join('')),

    // Golden cornbread square with butter and honey.
    cornbread: () => K.shadow(24) +
      P('M10 32 L32 40 V53 L10 45 Z', C.yellowL) + P('M32 40 L54 32 V45 L32 53 Z', C.yellowL) + K.sh('M32 40 L54 32 V45 L32 53 Z') +
      K.dots([[15, 40], [20, 45], [25, 43], [38, 47], [44, 41], [49, 43], [18, 37]], 1, C.yellowD) +
      P('M10 32 L32 24 L54 32 L32 40 Z', C.orange) +
      K.line('M18 31 C22 30 24 33 28 32 M34 28 C38 29 40 27 44 29', 1.3, C.orangeD) +
      P('M26 30 L33 27.5 L39 30 L32 32.5 Z', C.yellowL, 1.6) +
      P('M33 32.5 C37 33 40 35 42 34 L41 40 C40 41 39 41 39 40 L39 36 C37 36 35 35 33 32.5 Z', C.gold, 1.4),

    // Dark roux stew with okra, sausage and shrimp around a scoop of rice.
    gumbo: () => K.steam(32, 8) + K.bowl(
      P('M24 27 C24 19 40 19 40 27 C36 29 28 29 24 27 Z', C.white, 1.8) + K.dots([[29, 22], [33, 24], [36, 22]], 0.8, C.greyD) +
      [[15, 27], [47, 30]].map(([x, y]) => O(x, y, 4.3, C.leaf, 1.6) + K.line(`M${x} ${y - 2.5} V${y + 2.5} M${x - 2.4} ${y - 1} L${x + 2.4} ${y + 1} M${x + 2.4} ${y - 1} L${x - 2.4} ${y + 1}`, 1, C.leafL)).join('') +
      O(20, 33, 4, C.meat, 1.6) + O(20, 33, 2, C.meatL, 0) + O(40, 33, 4, C.meat, 1.6) + O(40, 33, 2, C.meatL, 0) +
      shrimp(48, 23, 20, 0.85) + leaf(13, 33, 190, C.leafD, 6),
      C.white, C.brown),

    // Cajun rice with sausage, shrimp and peppers in a cast-iron pot.
    jambalaya: () => K.pot(
      P('M9 26 C11 17 21 13 32 13 C43 13 53 17 55 26 C46 30 18 30 9 26 Z', C.orangeL) +
      K.dots([[16, 22], [24, 17], [33, 16], [42, 18], [48, 23], [20, 26], [37, 25]], 1, C.orange) +
      O(22, 21, 4, C.meat, 1.6) + O(22, 21, 2, C.meatL, 0) + O(40, 23, 4, C.meat, 1.6) + O(40, 23, 2, C.meatL, 0) +
      shrimp(31, 18, 10, 0.9) + `<rect x="45" y="17" width="6" height="4" rx="1" fill="${C.leaf}" stroke-width="1.4"/><rect x="13" y="24" width="6" height="4" rx="1" fill="${C.red}" stroke-width="1.4"/>`,
      C.black),

    // Creamy baked cheesecake wedge on a graham cracker crust.
    new_york_cheesecake: () => wedge(C.wheatL, C.creamL, C.brown, K.hiE(24, 26, 6, 2, -22)),

    // Fudgy chocolate brownie squares with walnuts.
    brownies: () => K.shadow(24) +
      [[0, 14], [0, 0]].map(([dx, dy]) => G(dx, dy, 0, 1,
        P('M8 30 L30 38 V46 L8 38 Z', C.choc) + P('M30 38 L56 30 V38 L30 46 Z', C.choc) + K.sh('M30 38 L56 30 V38 L30 46 Z') +
        P('M8 30 L34 21 L56 30 L30 38 Z', C.brown) +
        K.line('M18 29 L24 28 L27 31 M36 26 L40 28 L45 27 M30 33 L34 32', 1.2, C.brownD))).join('') +
      E(26, 28, 3, 2, C.woodL, 1.4) + E(40, 30, 3, 2, C.woodL, 1.4) + K.hiE(18, 27, 4, 1.4, -18),

    // Chocolate chip cookies, one standing behind one lying flat.
    chocolate_chip_cookies: () => K.shadow(26) +
      O(39, 25, 17, C.wheat) + K.dots([[33, 18], [44, 15], [47, 27], [37, 30], [30, 26], [42, 21]], 2.1, C.choc) + K.hiE(31, 15, 4, 2) +
      P('M6 44 V47 C6 53 16 57 28 57 C40 57 50 53 50 47 V44 Z', C.wheatD) +
      E(28, 44, 22, 10, C.wheat) +
      K.dots([[18, 42], [27, 39], [36, 43], [24, 47], [33, 49], [40, 46], [15, 46]], 2.1, C.choc) + K.hiE(17, 39, 4, 1.6, -10),

    // Spiced pumpkin pie with a dollop of whipped cream.
    pumpkin_pie: () => pie(C.orange,
      `<path d="M26 34 C24 30 29 27 32 29 C35 26 40 30 38 34 C36 36 28 36 26 34 Z" fill="${C.white}" stroke-width="1.8"/>` +
      K.line('M30 31 C31 30 33 30 34 31', 1.2, C.greyL) + K.dots([[22, 37], [42, 38], [38, 30]], 0.9, C.orangeD)),

    // Pecan pie: glossy dark filling studded with pecan halves.
    pecan_pie: () => pie(C.brownD,
      [[20, 33, -20], [28, 29, 0], [37, 29, 10], [45, 33, 25], [24, 38, -10], [33, 35, 0], [42, 38, 15]].map(([x, y, r]) =>
        `<ellipse cx="${x}" cy="${y}" rx="4.2" ry="2.4" fill="${C.brown}" stroke-width="1.4" transform="rotate(${r} ${x} ${y})"/>` + K.line(`M${x - 2.6} ${y} H${x + 2.6}`, 1, C.brownD)).join('')),

    // Key lime pie wedge: graham crust, pale lime custard, cream and lime slice.
    key_lime_pie: () => wedge(C.yellowL, C.leafL, C.woodL,
      `<path d="M30 26 C27 22 32 18 36 21 C40 19 44 24 41 27 C38 29 33 29 30 26 Z" fill="${C.white}" stroke-width="1.8"/>` +
      G(42, 22, -20, 1, `<path d="M-6 0 A6 6 0 0 1 6 0 Z" fill="${C.leaf}" stroke-width="1.6"/><path d="M-4 -0.5 A4 4 0 0 1 4 -0.5 Z" fill="${C.leafL}" stroke="none"/>`) +
      K.hiE(18, 30, 5, 1.6, -22)),

    // Loaf of banana bread with a slice cut and a banana.
    banana_bread: () => K.shadow(27) +
      P('M8 30 C8 19 16 16 26 16 H36 C46 16 50 20 50 30 V48 C50 51 48 53 45 53 H13 C10 53 8 51 8 48 Z', C.brown) +
      P('M12 24 C18 20 30 18 44 22', C.brownD, 0) + K.line('M14 24 C20 20 32 19 44 23', 2, C.brownD) +
      K.hi('M12 30 H16 V48 H12 Z') +
      P('M36 30 C36 24 42 22 46 24 C50 22 56 25 56 31 V52 C56 54 55 55 53 55 H39 C37 55 36 54 36 52 Z', C.brownL) +
      `<path d="M38 31 C38 26 43 25 46 27 C49 25 54 27 54 31 V51 C54 52 53 53 52 53 H40 C39 53 38 52 38 51 Z" fill="${C.wheat}" stroke="none"/>` +
      K.dots([[42, 33], [49, 37], [44, 44], [50, 48], [41, 50]], 1.3, C.brownD) +
      P('M5 52 C9 58 22 58 28 52 C26 51 25 50 25 49 C20 53 12 53 8 49 Z', C.yellow, 2),

    // Buttered split-top bun overflowing with lobster and chives.
    lobster_roll: () => K.shadow(26) +
      P('M8 36 H56 V46 C56 51 52 54 46 54 H18 C12 54 8 51 8 46 Z', C.wheat) +
      K.line('M12 44 H52', 1.4, C.wheatD) +
      P('M8 37 C7 30 12 27 17 29 C19 23 26 22 29 26 C32 21 39 21 41 25 C45 22 52 24 52 29 C57 29 59 34 56 37 Z', C.redL) +
      [[15, 32], [26, 28], [38, 27], [48, 31], [32, 33]].map(([x, y]) => P(`M${x - 4} ${y} C${x - 3} ${y - 4} ${x + 3} ${y - 4} ${x + 4} ${y} C${x + 2} ${y + 1} ${x - 2} ${y + 1} ${x - 4} ${y} Z`, C.creamL, 1.3)).join('') +
      K.dots([[21, 31], [34, 25], [44, 29], [27, 34], [51, 33]], 1.2, C.leaf) +
      P('M6 38 H58 L56 46 C44 49 20 49 8 46 Z', C.wheatL) + K.hi('M11 40 H22 V42 H11 Z'),

    // Romaine leaves with croutons and shaved parmesan.
    caesar_salad: () => K.bowl(
      P('M10 31 C8 20 14 12 20 11 C23 18 24 25 22 31 Z', C.leafL) + K.line('M15 29 C15 22 17 16 19 13', 1.3, C.leaf) +
      P('M24 30 C21 18 28 8 35 7 C38 16 37 24 33 30 Z', C.leaf) + K.line('M28 29 C28 21 31 13 34 9', 1.3, C.leafD) +
      P('M38 30 C38 20 44 13 52 13 C54 21 50 27 44 31 Z', C.leafL) + K.line('M41 29 C43 23 47 18 50 15', 1.3, C.leaf) +
      `<rect x="16" y="26" width="7" height="6" rx="1.5" fill="${C.wheat}" stroke-width="1.6"/><rect x="34" y="26" width="7" height="6" rx="1.5" fill="${C.wheat}" stroke-width="1.6"/><rect x="45" y="29" width="6" height="5" rx="1.5" fill="${C.wheat}" stroke-width="1.6"/>` +
      P('M24 33 L32 31 L31 34 Z', C.creamL, 1.3) + P('M10 32 L16 30 L15 33 Z', C.creamL, 1.3) + K.dots([[28, 28], [42, 27]], 0.8, C.ink),
      C.white, C.leafD),

    // Composed salad in rows: chicken, bacon, egg, avocado, tomato, blue cheese.
    cobb_salad: () => K.plate(
      P('M8 38 C8 30 18 25 32 25 C46 25 56 30 56 38 C56 46 46 50 32 50 C18 50 8 46 8 38 Z', C.leaf, 1.8) +
      [[13, C.cream], [21, C.meatL], [29, C.white], [37, C.leafL], [45, C.red], [53, C.creamL]].map(([x, f], i) => {
        const h = [7, 10.5, 12, 12, 10.5, 7][i];
        return `<rect x="${x - 3.6}" y="${38 - h}" width="7.2" height="${h * 2}" rx="3.6" fill="${f}" stroke-width="1.6"/>`;
      }).join('') +
      K.dots([[29, 32], [29, 41]], 2, C.yellow) + K.dots([[53, 36], [53, 41]], 0.9, C.blueD) + K.dots([[21, 33], [21, 42]], 0.9, C.meatD) + K.dots([[37, 34], [37, 43]], 0.9, C.leaf)),

    // Fries smothered in gravy with squeaky cheese curds.
    poutine: () => K.bowl(
      [[16, 22, -20], [24, 18, -5], [33, 17, 10], [42, 19, 20], [48, 24, 35], [20, 27, 30]].map(([x, y, r]) =>
        `<rect x="${x - 2.5}" y="${y - 9}" width="5" height="18" rx="1" fill="${C.yellow}" stroke-width="1.7" transform="rotate(${r} ${x} ${y})"/>`).join('') +
      P('M11 30 C14 24 20 26 24 23 C28 25 34 22 38 25 C43 23 49 26 53 30 C46 35 18 35 11 30 Z', C.brown, 1.8) +
      K.hi('M18 28 C22 26 26 27 29 26 C26 28 22 29 19 29.5 Z') +
      [[21, 29], [31, 27], [41, 29], [36, 32], [26, 32]].map(([x, y]) => P(`M${x - 3} ${y + 1} C${x - 4} ${y - 3} ${x + 3} ${y - 4} ${x + 3} ${y} C${x + 3} ${y + 2} ${x - 2} ${y + 3} ${x - 3} ${y + 1} Z`, C.creamL, 1.4)).join(''),
      C.white, C.brownD),

    // Banana halves with vanilla scoops, chocolate sauce, cream, peanuts and a cherry.
    banana_split: () => K.plate(
      P('M6 33 C12 24 52 22 58 29 L57 33 C48 28 16 30 7 37 Z', C.yellowL, 2) +
      [[18, 33], [46, 33], [32, 30]].map(([x, y]) =>
        O(x, y, 9.5, C.creamL) +
        P(`M${x - 8} ${y - 4} C${x - 6} ${y - 11} ${x + 6} ${y - 11} ${x + 8} ${y - 4} C${x + 6} ${y - 1} ${x + 4} ${y - 5} ${x + 1} ${y - 2} C${x - 2} ${y - 5} ${x - 5} ${y} ${x - 8} ${y - 4} Z`, C.choc, 1.6)).join('') +
      P('M5 39 C14 47 50 47 59 37 C59 44 52 52 32 52 C14 52 6 46 5 39 Z', C.yellow, 2) +
      P('M8 40 C16 46 48 46 56 39 C52 44 44 47 32 47 C20 47 12 45 8 40 Z', C.yellowL, 0) +
      O(32, 17, 3.8, C.red, 1.8) + K.line('M33 13.5 C34 10 36 8 39 7', 1.5) + K.hiE(30.5, 16, 1.2, 0.7) +
      K.dots([[16, 26], [44, 26], [27, 22]], 1.2, C.woodL)),

    // Pink milkshake topped with whipped cream, a straw and a strawberry.
    strawberry_milkshake: () => K.glass(C.pink, 'tumbler',
      tube('M36 14 L44 4', C.red, 2.4) +
      P('M15 13 C14 8 19 6 22 8 C24 4 30 4 32 7 C35 4 41 5 42 8 C46 7 50 10 49 13 C40 16 24 16 15 13 Z', C.white) +
      G(46, 14, 15, 1, `<path d="M-5 -3 C-5 4 -2 7 0 7 C2 7 5 4 5 -3 C3 -4 -3 -4 -5 -3 Z" fill="${C.red}" stroke-width="1.8"/><path d="M-4 -3 L-2 -6 L0 -3.5 L2 -6 L4 -3 Z" fill="${C.leaf}" stroke-width="1.3"/>` + K.dots([[-2, 0], [1.5, 1], [0, 3.5]], 0.6, C.yellowL)) +
      K.dots([[28, 30], [36, 38], [26, 44], [38, 50]], 1, C.pinkD)),

    // Toasted marshmallow and chocolate sandwiched between graham crackers.
    smores: () => K.shadow(25) +
      `<rect x="8" y="44" width="46" height="9" rx="2" fill="${C.wheat}"/>` +
      `<rect x="12" y="39" width="38" height="6" rx="1.5" fill="${C.choc}"/>` +
      P('M9 37 C7 31 12 27 18 28 C24 25 40 25 46 28 C52 27 56 31 54 37 C52 41 47 40 44 42 C38 40 26 40 20 42 C16 40 11 41 9 37 Z', C.white) +
      P('M14 29 C20 26 42 26 50 29 C46 31 20 31 14 29 Z', C.woodL, 0) +
      G(31, 21, -7, 1, `<rect x="-24" y="-5" width="48" height="10" rx="2" fill="${C.wheat}"/>` + K.dots([[-16, 0], [-8, 0], [0, 0], [8, 0], [16, 0]], 1.1, C.wheatD) + K.line('M0 -5 V5', 1.3, C.wheatD) + K.hi('M-21 -3 H-4 V-1.5 H-21 Z')) +
      K.dots([[16, 48.5], [24, 48.5], [32, 48.5], [40, 48.5], [48, 48.5]], 1.1, C.wheatD),

    // Golden roast turkey with drumsticks, cranberry sauce and sage.
    roast_turkey_with_cranberry: () => K.plate(
      P('M10 36 C8 24 20 17 32 18 C44 18 52 25 50 35 C49 42 40 46 30 46 C19 46 11 43 10 36 Z', C.brownL) +
      K.line('M30 19 C27 26 27 36 31 45', 1.4, C.brown) +
      K.hiE(20, 26, 6, 2.5, -30) +
      [[42, 36, -55], [21, 36, 235]].map(([x, y, r]) => G(x, y, r, 1,
        `<path d="M-5 -6 C3 -9 10 -5 10 -1 L15 -1 V2 L10 2 C10 6 2 8 -5 6 C-9 4 -9 -4 -5 -6 Z" fill="${C.brown}"/>` +
        `<path d="M13 -3.5 L18 -5 L19 -2.5 L18 0 L19 2.5 L18 5 L13 3.5 Z" fill="${C.white}" stroke-width="1.5"/>`)).join('') +
      E(50, 46, 7, 4, C.white, 1.8) + E(50, 45.5, 5, 2.6, C.redD, 0) + K.dots([[49, 45], [52, 46]], 0.9, C.red) +
      leaf(54, 32, -60, C.tealD, 8) + leaf(10, 46, 200, C.tealD, 8)),

    // Tall pastrami stack on rye with mustard and a pickle spear.
    pastrami_on_rye: () => K.shadow(26) +
      `<rect x="6" y="46" width="40" height="9" rx="3" fill="${C.brownL}"/>` +
      P('M5 46 C5 42 9 41 12 43 C15 40 20 41 22 43 C26 40 31 41 33 43 C37 40 43 41 47 44 L46 47 H6 Z', C.yellow, 1.6) +
      P('M4 42 C3 36 8 34 12 36 C14 31 22 32 24 35 C28 31 36 31 38 35 C42 32 49 34 48 40 C50 44 46 46 42 45 C36 47 16 47 8 46 C5 46 4 44 4 42 Z', C.meat) +
      K.line('M8 40 C14 37 20 41 26 38 C32 35 38 40 44 37 M10 44 C18 41 26 45 34 42', 1.4, C.meatD) +
      K.dots([[12, 38], [22, 37], [33, 36], [42, 38], [17, 43]], 0.9, C.ink) +
      P('M7 33 C6 27 11 24 17 24 H35 C41 24 46 27 45 33 Z', C.brownL) + K.line('M7 32 H45', 2.6, C.brown) +
      K.dots([[16, 28], [24, 27], [32, 29], [38, 27]], 0.9, C.brownD) + K.hi('M12 27 H21 V28.5 H12 Z') +
      G(52, 38, 12, 1, `<rect x="-5.5" y="-18" width="11" height="36" rx="5.5" fill="${C.leaf}"/>` + K.dots([[-2, -10], [2, -3], [-2, 5], [2, 11]], 1, C.leafD) + K.hi('M-3 -14 H-1 V8 H-3 Z')),

    // Grilled Reuben half: corned beef, sauerkraut and melted Swiss on rye.
    reuben_sandwich: () => K.shadow(27) +
      P('M6 30 H58 V51 C58 53 57 54 55 54 H9 C7 54 6 53 6 51 Z', C.brownL) +
      `<rect x="6" y="35" width="52" height="7" fill="${C.meatL}" stroke-width="2"/>` +
      P('M6 42 H58 V45 H52 C51 49 49 49 48 45 H22 C21 48 19 48 18 45 H6 Z', C.yellowL, 1.8) +
      `<rect x="6" y="45" width="52" height="3" fill="${C.creamL}" stroke-width="1.5"/>` +
      K.line('M11 36.5 L15 40 M24 37 L28 40.5 M40 36.5 L44 40', 1.3, C.meat) +
      P('M6 30 L40 12 L58 30 Z', C.brown) +
      K.line('M18 26 L34 18 M24 29 L42 20 M32 30 L46 23', 1.6, C.brownD) + K.dots([[20, 22], [30, 25], [40, 17], [44, 26]], 0.9, C.brownD) +
      K.hiE(28, 19, 5, 1.5, -28),

    // Stack of buttermilk pancakes with maple syrup, butter and pecans.
    maple_pecan_pancakes: () => K.plate(
      [44, 38, 32, 26].map((y) => P(`M12 ${y - 4} V${y} C12 ${y + 5} 52 ${y + 5} 52 ${y} V${y - 4} Z`, C.wheatD, 1.8)).join('') +
      E(32, 22, 20, 5.5, C.wheat, 2) +
      P('M15 22 C15 18 24 17 32 17 C42 17 49 18 49 22 C49 26 46 25 46 30 C46 33 43 33 43 30 C43 27 40 26 34 27 C26 27 22 27 20 30 C20 33 17 33 17 29 C17 26 15 25 15 22 Z', C.orangeD, 1.6) +
      K.hi('M20 20 C24 19 28 19 31 19 C28 20 24 21 21 21.5 Z') +
      P('M27 18 L34 16.5 L38 19 L31 20.5 Z', C.yellowL, 1.4) +
      E(22, 21, 3.2, 2, C.brown, 1.3) + E(41, 21, 3.2, 2, C.brown, 1.3)),

    // White bread sandwich cut on the diagonal: peanut butter and jam.
    peanut_butter_jelly: () => K.shadow(26) +
      G(0, 0, 0, 1,
        P('M6 34 H58 V52 C58 54 57 55 55 55 H9 C7 55 6 54 6 52 Z', C.creamL) +
        `<rect x="6" y="39" width="52" height="5" fill="${C.woodL}" stroke-width="1.8"/>` +
        P('M6 44 H58 V48 H50 C49 51 47 51 46 48 H20 C19 50 17 50 16 48 H6 Z', C.purple, 1.8) +
        K.line('M6 34 H58', 2.6) +
        P('M5 34 L41 11 L59 34 Z', C.wheat) + P('M11 32 L41 14.5 L54 32 Z', C.white, 0) +
        K.hiE(30, 22, 6, 1.6, -32)),
  });
})(FSI);
