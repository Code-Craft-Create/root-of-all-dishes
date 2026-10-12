// Dishes 2: Italian, Spanish & Portuguese, Greek & Middle Eastern finished dishes (see assets/STYLE.md).
(function (FSI) {
  const { C, K } = FSI;

  // ---- local helpers -----------------------------------------------------------
  // Small leaf (basil, sage, mint, parsley) centred at x,y, pointing along rot degrees.
  const leaf = (x, y, rot = 0, len = 9, fill = C.leaf, vein = C.leafD) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    `<path d="M${-len / 2} 0 C${-len / 4} ${-len / 2.6} ${len / 4} ${-len / 2.6} ${len / 2} 0 C${len / 4} ${len / 2.6} ${-len / 4} ${len / 2.6} ${-len / 2} 0 Z" fill="${fill}" stroke-width="1.5"/>` +
    K.line(`M${-len / 2 + 1} 0 H${len / 2 - 1.5}`, 1.2, vein) + `</g>`;
  // Filled blob with no outline (sauce smears, oil pools, browned spots).
  const blob = (d, fill) => `<path d="${d}" fill="${fill}" stroke="none"/>`;
  const ell = (cx, cy, rx, ry, fill, sw = 1.5, rot = 0) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''} fill="${fill}" stroke-width="${sw}"/>`;
  const circ = (cx, cy, r, fill, sw = 1.5) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke-width="${sw}"/>`;
  // Freestanding round pizza in 3/4 view: crust rim, sauce, then toppings.
  const pizza = (sauce, top) =>
    K.shadow(27, 56) +
    `<ellipse cx="32" cy="39" rx="29" ry="15" fill="${C.wheatD}"/>` +
    `<ellipse cx="32" cy="36" rx="29" ry="15" fill="${C.wheat}"/>` +
    `<ellipse cx="32" cy="36" rx="24" ry="11.5" fill="${sauce}" stroke-width="1.6"/>` + top +
    K.hi('M8 31 C10 26 16 23 22 22 C17 25 13 28 11 32 Z');
  // Spaghetti nest heaped on a plate; strand swirls drawn in a darker shade.
  const nest = (fill, strand, top = '') =>
    `<path d="M10 38 C10 27 20 21 32 21 C44 21 54 27 54 38 C54 45 44 48 32 48 C20 48 10 45 10 38 Z" fill="${fill}"/>` +
    K.line('M14 37 C14 29 24 25 33 26 C42 27 49 31 48 38 M18 42 C16 34 26 30 34 31 C42 32 46 37 43 42 M22 27 C30 23 42 24 48 30 M24 44 C22 38 30 35 36 37 C40 38 40 42 37 44', 1.3, strand) + top;
  // Wide shallow pan with two loop handles (paella pan, skillet when one=true).
  const pan = (fill, food = '', one = false) =>
    K.shadow(28, 56) +
    (one ? `<path d="M52 30 L62 22" stroke-width="5"/><path d="M52 30 L62 22" stroke="${C.black}" stroke-width="2.5"/>`
      : `<ellipse cx="5" cy="37" rx="3.5" ry="2.5" fill="none" stroke-width="2.2"/><ellipse cx="59" cy="37" rx="3.5" ry="2.5" fill="none" stroke-width="2.2"/>`) +
    `<ellipse cx="32" cy="40" rx="26" ry="14" fill="${C.black}"/>` +
    `<ellipse cx="32" cy="37" rx="26" ry="14" fill="${C.greyD}"/>` +
    `<ellipse cx="32" cy="37.5" rx="22.5" ry="11" fill="${fill}" stroke-width="1.6"/>` + food;

  // Shrimp curl (head end at left), centred x,y.
  const shrimp = (x, y, r = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">` +
    `<path d="M-5 1 C-6 -5 1 -7 4.5 -4 C7.5 -1 5.5 4 1.5 4" stroke-width="6.5"/>` +
    `<path d="M-5 1 C-6 -5 1 -7 4.5 -4 C7.5 -1 5.5 4 1.5 4" stroke="${C.orangeL}" stroke-width="3.6"/>` +
    `<path d="M1.5 4 L-1.5 6.5 L-1 2 Z" fill="${C.orange}" stroke-width="1.3"/>` +
    K.line('M-1.5 -5.5 L-0.5 -2.5 M3 -4.8 L1.5 -2 M5 -0.5 L2.5 0', 1.1, C.orangeD) + `</g>`;
  // Iso cube (potato, halloumi, turkish delight). s = half width.
  const cube = (x, y, s, top, left, right, sw = 1.6) =>
    `<path d="M${x - s} ${y - s * 0.5} L${x} ${y - s} L${x + s} ${y - s * 0.5} L${x} ${y} Z" fill="${top}" stroke-width="${sw}"/>` +
    `<path d="M${x - s} ${y - s * 0.5} L${x} ${y} V${y + s} L${x - s} ${y + s * 0.5} Z" fill="${left}" stroke-width="${sw}"/>` +
    `<path d="M${x} ${y} L${x + s} ${y - s * 0.5} V${y + s * 0.5} L${x} ${y + s} Z" fill="${right}" stroke-width="${sw}"/>`;

  FSI.add('dishes_2', {
    // ---- pizza ---------------------------------------------------------------
    pizza_margherita: () =>
      pizza(C.red,
        ell(22, 34, 5, 3, C.white) + ell(38, 31, 5, 3, C.white) + ell(33, 42, 5.5, 3.2, C.white) + ell(45, 39, 3.8, 2.4, C.white) +
        leaf(28, 30, -20, 8) + leaf(42, 44, 15, 8) + leaf(18, 41, 30, 7) + leaf(46, 33, -40, 6.5)),
    pizza_marinara: () =>
      pizza(C.redD,
        blob('M14 36 C16 30 24 28 30 30 C26 32 20 33 17 38 Z', C.red) +
        ell(24, 35, 2.6, 1.6, C.creamL, 1.2, 20) + ell(36, 32, 2.6, 1.6, C.creamL, 1.2, -20) + ell(40, 41, 2.6, 1.6, C.creamL, 1.2, 30) +
        ell(28, 42, 2.6, 1.6, C.creamL, 1.2, -10) + ell(47, 35, 2.2, 1.4, C.creamL, 1.2, 10) +
        K.dots([[20, 39], [31, 37], [33, 29], [44, 37], [38, 45], [25, 31], [16, 35], [48, 40], [29, 46]], 1.2, C.leafD)),
    pepperoni_pizza: () =>
      pizza(C.yellowL,
        blob('M13 38 C14 34 18 32 21 33 C19 36 16 38 13 38 Z M43 44 C47 43 50 40 51 37 C52 41 48 45 43 44 Z', C.orange) +
        [[22, 32], [35, 29], [46, 35], [28, 41], [40, 43], [16, 39]].map(([x, y]) => circ(x, y, 4.2, C.red, 1.5) + K.dots([[x - 1.2, y - 1], [x + 1.5, y + 0.8]], 0.8, C.redD)).join('')),
    pizza_quattro_formaggi: () =>
      pizza(C.yellowL,
        K.line('M32 25 V47 M9 36 H55', 1.4, C.wheatD) +
        blob('M14 33 C16 28 24 27 29 28 L29 34 Z', C.creamL) +
        blob('M35 28 C42 27 49 29 51 33 L35 34 Z', C.blueL) + K.dots([[40, 30], [45, 31.5], [38, 32.5]], 1.1, C.blueD) +
        blob('M14 39 L29 38 L29 45 C22 45 16 43 14 39 Z', C.white) +
        blob('M35 38 L50 39 C48 43 42 45 35 45 Z', C.yellow) +
        ell(22, 31, 2.5, 1.5, C.white, 1.2) + ell(42, 42, 2.4, 1.5, C.yellowD, 1.2)),
    pizza_prosciutto_e_funghi: () =>
      pizza(C.red,
        ell(25, 36, 7, 4, C.creamL, 1.3) + ell(40, 38, 6, 3.5, C.creamL, 1.3) +
        `<path d="M16 33 C20 29 24 33 28 29 C29 31 25 35 21 35 C19 37 17 36 16 33 Z" fill="${C.pink}" stroke-width="1.5"/>` +
        `<path d="M35 44 C39 41 43 45 47 41 C48 43 45 47 41 47 C38 48 36 47 35 44 Z" fill="${C.pink}" stroke-width="1.5"/>` +
        [[37, 30], [46, 35], [24, 43], [31, 38]].map(([x, y]) =>
          `<path d="M${x - 4} ${y} C${x - 4} ${y - 4} ${x + 4} ${y - 4} ${x + 4} ${y} Z" fill="${C.brownL}" stroke-width="1.4"/>` +
          `<path d="M${x - 1.3} ${y} V${y + 2.5} H${x + 1.3} V${y}" fill="${C.cream}" stroke-width="1.3"/>`).join('')),

    // ---- pasta ---------------------------------------------------------------
    spaghetti_carbonara: () =>
      K.plate(nest(C.yellowL, C.yellowD,
        [[22, 30], [38, 27], [44, 36], [29, 38], [19, 40]].map(([x, y]) =>
          `<rect x="${x - 2.6}" y="${y - 2.3}" width="5.2" height="4.6" rx="1" fill="${C.pinkL}" stroke-width="1.4"/>` + K.line(`M${x - 1.5} ${y} H${x + 1.5}`, 1.2, C.pinkD)).join('') +
        ell(33, 31, 4.5, 3.2, C.yellow, 1.5) + K.hiE(31.5, 30, 1.6, 0.9, -20) +
        K.dots([[26, 26], [33, 23.5], [42, 31], [15, 36], [36, 40], [48, 33], [25, 44], [40, 44], [30, 34]], 0.9))),
    tagliatelle_al_ragu: () =>
      K.plate(
        `<path d="M10 38 C10 27 20 21 32 21 C44 21 54 27 54 38 C54 45 44 48 32 48 C20 48 10 45 10 38 Z" fill="${C.wheat}"/>` +
        K.line('M13 39 C13 30 22 26 30 27 M18 44 C14 36 20 31 26 32 M44 44 C50 40 52 34 48 29 M40 46 C46 44 49 38 46 34', 2.6, C.wheatD) +
        `<path d="M19 33 C18 26 26 22 33 23 C41 23 47 27 46 33 C45 38 38 40 32 39 C25 39 20 37 19 33 Z" fill="${C.meatD}" stroke-width="2"/>` +
        K.dots([[25, 30], [31, 27], [38, 29], [41, 34], [28, 35], [35, 34]], 1.5, C.choc) +
        `<path d="M26 25 L33 23.5 L32 27.5 Z M35 31 L42 29.5 L40 34 Z M22 33 L28 31.5 L27 35.5 Z" fill="${C.yellowL}" stroke-width="1.2"/>`),
    lasagna_alla_bolognese: () =>
      K.plate(
        `<path d="M10 31 L38 22 L54 30 L26 40 Z" fill="${C.orangeL}"/>` +
        `<path d="M10 31 L26 40 V51 L10 42 Z" fill="${C.red}"/>` +
        `<path d="M26 40 L54 30 V41 L26 51 Z" fill="${C.redD}"/>` +
        K.line('M10 35.5 L26 44.5 L54 34.5 M10 39 L26 48 L54 38', 2.2, C.wheatL) +
        K.line('M10 33 L26 42 L54 32', 1.6, C.creamL) +
        K.line('M26 40 V51', 2) +
        blob('M17 30 C20 28 24 29 26 31 C24 33 20 33 17 30 Z M35 26 C38 25 42 26 43 28 C40 29 37 28 35 26 Z M30 34 C33 33 36 34 37 35 C34 36 31 35 30 34 Z', C.orange) +
        K.hi('M14 31 L36 24 L38 25 L17 32 Z')),
    spaghetti_aglio_e_olio: () =>
      K.plate(nest(C.wheatL, C.wheatD,
        blob('M14 40 C18 46 30 48 40 47 C46 46 50 44 52 41 C48 44 40 45 32 45 C24 45 18 43 14 40 Z', C.gold) +
        [[22, 31, 20], [36, 27, -15], [42, 37, 30], [27, 40, -25], [17, 37, 10]].map(([x, y, r]) => ell(x, y, 2.8, 1.9, C.creamL, 1.3, r) + K.line(`M${x - 1.2} ${y} H${x + 1.2}`, 1.2, C.creamD)).join('') +
        K.dots([[30, 33], [45, 30], [33, 43], [21, 44], [47, 41]], 1.3, C.red) +
        K.dots([[27, 27], [40, 32], [35, 37], [24, 36], [44, 26], [31, 23]], 1.2, C.leafD))),
    cacio_e_pepe: () =>
      K.bowl(
        `<path d="M12 30 C12 20 22 14 32 14 C42 14 52 20 52 30 C46 33 18 33 12 30 Z" fill="${C.cream}"/>` +
        K.line('M16 28 C16 21 25 17 33 18 C41 19 47 23 47 29 M21 30 C20 24 28 21 34 22 C40 23 43 27 41 31 M26 30 C26 26 33 25 36 27', 1.3, C.creamD) +
        blob('M20 22 C24 17 32 16 36 18 C30 19 25 21 22 24 Z', C.white) +
        K.dots([[20, 25], [26, 20], [33, 17], [41, 21], [46, 26], [37, 25], [29, 27], [23, 29], [43, 29], [31, 22], [17, 28], [38, 30]], 1.1),
        C.white, C.creamD),
    penne_allarrabbiata: () => {
      const penne = (x, y, r) =>
        `<g transform="rotate(${r} ${x} ${y})"><path d="M${x - 7} ${y - 2.6} L${x + 5} ${y - 2.6} L${x + 7} ${y + 2.6} L${x - 5} ${y + 2.6} Z" fill="${C.orange}" stroke-width="1.5"/>` +
        `<ellipse cx="${x + 6}" cy="${y}" rx="1.5" ry="2.6" fill="${C.redD}" stroke-width="1.3"/>` + K.line(`M${x - 4} ${y - 1} L${x + 3} ${y - 1} M${x - 3} ${y + 1.2} L${x + 4} ${y + 1.2}`, 1.2, C.orangeD) + `</g>`;
      return K.bowl(
        `<path d="M10 30 C11 22 20 16 32 16 C44 16 53 22 54 30 C46 34 18 34 10 30 Z" fill="${C.red}"/>` +
        penne(20, 26, -20) + penne(35, 21, 15) + penne(44, 28, -35) + penne(29, 29, 5) + penne(25, 20, 40) +
        K.dots([[17, 30], [40, 26], [31, 24], [48, 24]], 1.2, C.redD) + K.dots([[23, 23], [38, 30], [45, 21], [16, 25]], 1.3, C.leafD),
        C.white, C.redD);
    },
    trofie_al_pesto: () => {
      const trofia = (x, y, r) =>
        `<g transform="rotate(${r} ${x} ${y})"><path d="M${x - 5} ${y} C${x - 3} ${y - 3.5} ${x - 1} ${y + 3.5} ${x + 1} ${y} C${x + 2.5} ${y - 3.5} ${x + 4} ${y - 1} ${x + 5} ${y}" stroke="${C.leafD}" stroke-width="4.5"/>` +
        `<path d="M${x - 5} ${y} C${x - 3} ${y - 3.5} ${x - 1} ${y + 3.5} ${x + 1} ${y} C${x + 2.5} ${y - 3.5} ${x + 4} ${y - 1} ${x + 5} ${y}" stroke="${C.leafL}" stroke-width="2"/></g>`;
      return K.bowl(
        `<path d="M10 30 C11 22 20 16 32 16 C44 16 53 22 54 30 C46 34 18 34 10 30 Z" fill="${C.leaf}"/>` +
        trofia(20, 27, 10) + trofia(32, 21, -20) + trofia(43, 26, 30) + trofia(30, 29, -5) + trofia(22, 20, 40) +
        `<rect x="36" y="27" width="6" height="5" rx="1.2" fill="${C.wheatL}" stroke-width="1.4"/><rect x="13" y="22" width="5.5" height="5" rx="1.2" fill="${C.wheatL}" stroke-width="1.4"/>` +
        `<path d="M38 16 L50 22" stroke="${C.leafD}" stroke-width="4.5"/><path d="M38 16 L50 22" stroke="${C.leafL}" stroke-width="1.8"/>` +
        `<path d="M14 31 L24 33" stroke="${C.leafD}" stroke-width="4.5"/>`,
        C.white, C.leafD);
    },
    fettuccine_alfredo: () =>
      K.plate(
        `<path d="M10 38 C10 27 20 21 32 21 C44 21 54 27 54 38 C54 45 44 48 32 48 C20 48 10 45 10 38 Z" fill="${C.cream}"/>` +
        K.line('M14 38 C13 30 22 25 31 26 C40 27 48 31 48 38 M19 43 C17 35 25 31 33 32 C41 33 45 38 42 43 M22 28 C30 24 42 25 49 32 M26 45 C25 40 31 38 36 39', 5, C.creamD) +
        K.line('M14 38 C13 30 22 25 31 26 C40 27 48 31 48 38 M19 43 C17 35 25 31 33 32 C41 33 45 38 42 43 M22 28 C30 24 42 25 49 32 M26 45 C25 40 31 38 36 39', 2.6, C.white) + K.hiE(22, 26, 3, 1.4) +
        blob('M12 40 C14 45 24 48 32 48 C24 46 16 44 12 40 Z', C.wheatL) +
        K.dots([[25, 30], [38, 29], [33, 36], [21, 37], [44, 35]], 1, C.leafD) +
        `<path d="M27 22 L33 21 L32 24 Z M40 26 L45 27 L42 29 Z" fill="${C.yellowL}" stroke-width="1.2"/>`),
    // ---- rice, mains, starters -------------------------------------------------
    risotto_alla_milanese: () =>
      K.plate(
        `<path d="M11 39 C11 30 20 25 32 25 C44 25 53 30 53 39 C53 45 44 48 32 48 C20 48 11 45 11 39 Z" fill="${C.yellow}"/>` +
        [[20, 34, 20], [27, 30, -10], [35, 29, 15], [43, 33, -20], [24, 40, 5], [32, 37, -25], [40, 41, 10], [47, 38, 30], [17, 40, -15]].map(([x, y, r]) =>
          ell(x, y, 2.4, 1.2, C.yellowL, 0, r)).join('') +
        K.line('M29 33 L32 34 M37 35 L39 37 M23 36 L25 38 M42 29 L44 30', 1.4, C.redD) +
        `<path d="M28 26 L34 25 L33 28 Z" fill="${C.creamL}" stroke-width="1.2"/>` +
        K.hiE(19, 31, 4, 2, -20)),
    porcini_risotto: () => {
      const porcino = (x, y, r) =>
        `<g transform="rotate(${r} ${x} ${y})"><path d="M${x - 2.6} ${y} L${x - 3.2} ${y + 6} H${x + 3.2} L${x + 2.6} ${y} Z" fill="${C.cream}" stroke-width="1.4"/>` +
        `<path d="M${x - 6} ${y + 0.5} C${x - 6} ${y - 5} ${x + 6} ${y - 5} ${x + 6} ${y + 0.5} Z" fill="${C.brown}" stroke-width="1.5"/></g>`;
      return K.bowl(
        `<path d="M10 30 C11 21 20 16 32 16 C44 16 53 21 54 30 C46 34 18 34 10 30 Z" fill="${C.cream}"/>` +
        K.dots([[16, 27], [22, 22], [30, 19], [41, 20], [48, 26], [36, 29], [24, 30], [44, 30]], 1.2, C.creamD) +
        porcino(23, 22, -15) + porcino(39, 20, 10) + porcino(31, 26, 0) +
        K.dots([[17, 24], [47, 23], [44, 28], [20, 29], [34, 18]], 1.3, C.leafD),
        C.white, C.creamD);
    },
    osso_buco: () =>
      K.plate(
        blob('M8 38 C8 30 20 27 32 27 C46 27 56 31 56 38 C56 45 46 49 32 49 C18 49 8 45 8 38 Z', C.orange) +
        `<path d="M13 36 C13 28 22 23 32 23 C43 23 51 28 51 36 V41 C51 47 43 50 32 50 C21 50 13 47 13 41 Z" fill="${C.brownD}"/>` +
        `<ellipse cx="32" cy="35" rx="19" ry="11" fill="${C.brown}"/>` +
        K.line('M18 33 C21 28 27 27 30 28 M44 30 C47 33 47 37 44 40 M22 41 C26 44 30 44 32 44', 1.5, C.brownD) +
        `<ellipse cx="33" cy="35" rx="7" ry="4.6" fill="${C.creamL}" stroke-width="2"/><ellipse cx="33" cy="35" rx="3.8" ry="2.3" fill="${C.wheatD}" stroke-width="1.4"/>` +
        K.dots([[21, 31], [41, 29], [24, 41], [44, 39]], 1.3, C.leafD) + K.dots([[27, 29], [40, 40], [19, 37]], 1.2, C.yellow) +
        K.hiE(20, 29, 3.5, 1.5, -15)),
    gnocchi_al_pomodoro: () => {
      const g = (x, y, r) => `<g transform="rotate(${r} ${x} ${y})">` + ell(x, y, 5, 3.3, C.wheatL, 1.5) +
        K.line(`M${x - 2} ${y - 2.4} V${y + 2.4} M${x} ${y - 2.8} V${y + 2.8} M${x + 2} ${y - 2.4} V${y + 2.4}`, 1.2, C.wheatD) + `</g>`;
      return K.bowl(
        `<path d="M10 30 C11 22 20 17 32 17 C44 17 53 22 54 30 C46 34 18 34 10 30 Z" fill="${C.red}"/>` +
        g(19, 27, 10) + g(30, 22, -10) + g(42, 23, 15) + g(28, 29, 0) + g(40, 29, -15) + g(20, 21, -25) + g(49, 28, 25) +
        leaf(35, 16, -30, 10) + leaf(28, 15, 20, 8) +
        `<path d="M14 23 L17 22 L16 25 Z" fill="${C.yellowL}" stroke-width="1"/>`,
        C.white, C.redD);
    },
    caprese_salad: () => {
      const tom = (x, y) => ell(x, y, 7, 5.2, C.red, 2) + ell(x, y, 4.5, 3.2, C.redL, 1.2) + K.dots([[x - 1.6, y - 0.6], [x + 1.6, y + 0.6], [x, y + 1.4]], 0.8, C.yellow);
      const moz = (x, y) => ell(x, y, 7, 5.2, C.white, 2) + K.hiE(x - 2, y - 1.5, 2.5, 1.2);
      return K.plate(
        tom(14, 34) + moz(22, 30) + tom(31, 28) + moz(40, 30) + tom(49, 34) +
        moz(16, 41) + tom(25, 44) + moz(35, 45) + tom(45, 42) +
        leaf(22, 37, 30, 10) + leaf(33, 37, -15, 11) + leaf(43, 36, 20, 9) +
        K.line('M18 26 C26 22 36 23 44 25', 1.6, C.gold));
    },
    bruschetta: () => {
      const slice = (x, y) =>
        `<path d="M${x - 12} ${y + 2} C${x - 14} ${y - 4} ${x - 6} ${y - 9} ${x + 2} ${y - 9} C${x + 10} ${y - 9} ${x + 15} ${y - 4} ${x + 12} ${y + 2} C${x + 10} ${y + 6} ${x - 10} ${y + 6} ${x - 12} ${y + 2} Z" fill="${C.wheatD}"/>` +
        `<path d="M${x - 9.5} ${y + 0.5} C${x - 11} ${y - 3.5} ${x - 5} ${y - 6.5} ${x + 1.5} ${y - 6.5} C${x + 8} ${y - 6.5} ${x + 12} ${y - 3.5} ${x + 9.5} ${y + 0.5} C${x + 7} ${y + 3.5} ${x - 8} ${y + 3.5} ${x - 9.5} ${y + 0.5} Z" fill="${C.wheatL}" stroke="none"/>` +
        [[-6, -3], [-1, -5], [4, -3], [-3, 0], [3, 1], [8, -2]].map(([dx, dy]) => `<rect x="${x + dx - 2}" y="${y + dy - 1.8}" width="4" height="3.6" rx=".8" fill="${C.red}" stroke-width="1.2"/>`).join('') +
        leaf(x + 1, y - 2, -20, 7);
      return K.board(slice(20, 38) + slice(43, 32));
    },
    minestrone: () =>
      K.steam(32, 10) +
      K.bowl(
        ell(18, 29, 3.2, 2, C.leaf, 1.4) + ell(18, 29, 1.6, 0.9, C.leafL, 0) +
        ell(40, 27, 3.2, 2, C.leaf, 1.4) + ell(40, 27, 1.6, 0.9, C.leafL, 0) +
        ell(29, 26, 3, 2, C.orange, 1.4) + ell(48, 31, 2.8, 1.8, C.orange, 1.4) + ell(24, 33, 2.8, 1.8, C.orange, 1.4) +
        ell(33, 31, 2.6, 1.6, C.creamL, 1.3, 20) + ell(13, 32, 2.4, 1.5, C.creamL, 1.3, -20) + ell(46, 25, 2.4, 1.5, C.creamL, 1.3, 20) +
        K.line('M34 25 C35 22 39 22 40 24 M21 25 C22 22 26 22 27 24', 2.6, C.wheatD) + K.line('M34 25 C35 22 39 22 40 24 M21 25 C22 22 26 22 27 24', 1.2, C.wheatL) +
        K.dots([[36, 33], [17, 26], [45, 29]], 1.2, C.leafD),
        C.white, C.orangeD),
    // ---- desserts ----------------------------------------------------------------
    tiramisu: () =>
      K.plate(
        `<path d="M14 27 L36 20 L52 27 L30 35 Z" fill="${C.brown}"/>` +
        `<path d="M14 27 L30 35 V50 L14 42 Z" fill="${C.creamL}"/>` +
        `<path d="M30 35 L52 27 V42 L30 50 Z" fill="${C.cream}"/>` +
        K.line('M14 32 L30 40 L52 32 M14 38.5 L30 46.5 L52 38.5', 3, C.brown) +
        K.line('M30 35 V50', 2) +
        K.dots([[22, 27], [30, 25], [37, 24], [42, 28], [33, 30], [26, 30], [45, 26], [36, 31]], 1.1, C.choc) +
        K.hi('M17 33 L19 34 V40 L17 39 Z')),
    panna_cotta: () =>
      K.plate(
        `<path d="M17 45 C17 39 19 27 23 22 C26 18.5 38 18.5 41 22 C45 27 47 39 47 45 C47 50 17 50 17 45 Z" fill="${C.creamL}"/>` +
        `<path d="M22.5 23 C25 18.5 39 18.5 41.5 23 C40 26 39 30 38 27 C37 25 35 31 33 27 C31 25 29 30 28 26 C27 24 25 28 24 26 Z" fill="${C.redD}" stroke-width="1.8"/>` +
        circ(46, 46, 2.6, C.red, 1.5) + circ(50, 42, 2.3, C.red, 1.5) + leaf(15, 47, 160, 8) +
        K.hi('M21 40 C21 33 23 28 25 25 L27 26 C25 30 24 35 24 41 Z')),
    cannoli: () => {
      const cannolo = (x, y, r, len) =>
        `<g transform="rotate(${r} ${x} ${y})">` +
        `<path d="M${x - len} ${y - 7} L${x + len} ${y - 7} L${x + len - 2} ${y + 7} L${x - len + 2} ${y + 7} Z" fill="${C.brownL}"/>` +
        K.dots([[x - len + 6, y - 2], [x - 4, y + 3], [x + 3, y - 3], [x + len - 7, y + 2], [x - 8, y - 4], [x + 8, y + 4]], 1.1, C.brown) +
        ell(x - len, y, 4, 7.5, C.creamL, 2.2) + ell(x + len, y, 4, 7.5, C.creamL, 2.2) +
        K.dots([[x - len - 1, y - 2], [x - len + 1, y + 3], [x + len + 1, y - 2], [x + len - 1, y + 3]], 1.1, C.choc) +
        `<rect x="${x + len - 1.5}" y="${y - 0.5}" width="2.5" height="2" fill="${C.orange}" stroke="none"/><rect x="${x - len - 1}" y="${y}" width="2.5" height="2" fill="${C.orange}" stroke="none"/>` +
        K.hi(`M${x - len + 4} ${y - 5} H${x + len - 4} V${y - 3} H${x - len + 4} Z`) + `</g>`;
      return K.shadow(26) + cannolo(30, 28, -14, 20) + cannolo(34, 44, -14, 20);
    },
    saltimbocca_alla_romana: () => {
      const esc = (x, y, r) => `<g transform="rotate(${r} ${x} ${y})">` +
        `<path d="M${x - 13} ${y} C${x - 13} ${y - 7} ${x - 4} ${y - 9} ${x + 3} ${y - 8} C${x + 11} ${y - 7} ${x + 14} ${y - 3} ${x + 13} ${y + 1} C${x + 12} ${y + 6} ${x + 4} ${y + 8} ${x - 3} ${y + 7} C${x - 9} ${y + 6} ${x - 13} ${y + 4} ${x - 13} ${y} Z" fill="${C.brownL}"/>` +
        `<path d="M${x - 9} ${y - 1} C${x - 6} ${y - 6} ${x - 2} ${y - 3} ${x + 1} ${y - 6} C${x + 4} ${y - 3} ${x + 8} ${y - 6} ${x + 10} ${y - 1} C${x + 7} ${y + 4} ${x + 3} ${y + 1} ${x} ${y + 4} C${x - 3} ${y + 1} ${x - 7} ${y + 4} ${x - 9} ${y - 1} Z" fill="${C.pink}" stroke-width="1.5"/>` +
        K.line(`M${x - 6} ${y} C${x - 3} ${y - 2} ${x + 3} ${y - 2} ${x + 7} ${y - 1}`, 1.2, C.fat) +
        leaf(x, y - 1, -15, 11, C.leafL, C.leafD) + `</g>`;
      return K.plate(blob('M10 41 C12 47 26 50 36 49 C46 48 53 45 54 40 C50 44 40 46 32 46 C22 46 14 44 10 41 Z', C.gold) +
        esc(22, 33, -8) + esc(40, 40, 8));
    },
    arancini: () =>
      K.plate(
        circ(19, 33, 10, C.orange) + K.dots([[15, 30], [20, 28], [24, 33], [17, 37], [22, 38]], 1, C.orangeD) + K.hiE(15, 29, 3.5, 2) +
        circ(34, 26, 10, C.orange) + K.dots([[30, 23], [36, 22], [39, 27], [32, 30], [36, 32]], 1, C.orangeD) + K.hiE(30, 22, 3.5, 2) +
        `<path d="M30 42 C30 34 38 31 44 31 C51 31 56 35 56 41 C56 47 50 50 43 50 C35 50 30 47 30 42 Z" fill="${C.orangeD}"/>` +
        ell(43, 40, 10.5, 7, C.creamL, 2) +
        `<path d="M38 41 C38 37 41 36 44 36 C47 36 49 38 48 41 C47 44 39 44 38 41 Z" fill="${C.meatD}" stroke-width="1.4"/>` +
        ell(43.5, 39.5, 2.6, 1.7, C.white, 1.2) + K.dots([[36, 37], [50, 41], [41, 45], [47, 44]], 0.9, C.creamD)),
    focaccia: () =>
      K.shadow(27, 56) +
      `<path d="M6 40 L38 27 C40 26.3 42 26.3 44 27 L57 33 C59 34 59 36 57 37 L28 50 C26 50.8 24 50.8 22 50 L7 43 C5 42 5 41 6 40 Z" fill="${C.wheat}"/>` +
      `<path d="M5.5 41.5 V46 C5.5 47 6 48 7 48.5 L22 55.5 C24 56.3 26 56.3 28 55.5 L57 42 C58.5 41.3 58.5 40 58.5 39 V35" fill="${C.wheatD}"/>` +
      `<path d="M6 40 L38 27 C40 26.3 42 26.3 44 27 L57 33 C59 34 59 36 57 37 L28 50 C26 50.8 24 50.8 22 50 L7 43 C5 42 5 41 6 40 Z" fill="${C.wheat}"/>` +
      [[16, 40], [24, 37], [32, 34], [40, 31], [22, 44], [30, 41], [38, 38], [46, 35], [36, 45], [44, 42], [50, 38]].map(([x, y]) => ell(x, y, 1.9, 1.2, C.wheatD, 0)).join('') +
      K.line('M18 35 L26 39 M22 36 L22 34 M22 36.8 L20 38.4 M38 29 L46 33 M42 31 L42 29 M42 31.8 L40 33.4 M30 45 L38 49', 1.5, C.leafD) +
      K.dots([[27, 35], [34, 39], [44, 38], [19, 42], [48, 33]], 0.9, C.white) +
      K.hi('M11 40 L36 29.5 L38 30.5 L13 41 Z'),
    eggplant_parmigiana: () =>
      K.plate(
        `<path d="M14 40 C14 35 22 32 32 32 C42 32 50 35 50 40 V44 C50 49 42 51 32 51 C22 51 14 49 14 44 Z" fill="${C.purpleD}"/>` +
        ell(32, 40, 18, 7.5, C.red, 2) +
        `<path d="M15 33 C15 28 22 25 32 25 C42 25 49 28 49 33 V36 C49 40 42 43 32 43 C22 43 15 40 15 36 Z" fill="${C.purple}"/>` +
        ell(32, 32.5, 17, 7, C.red, 2) +
        `<path d="M17 31 C18 25 26 22 33 22 C41 22 47 25 47 30 C46 32 44 31 43 34 C41 36 39 33 37 35 C34 37 31 34 29 36 C26 37 25 34 22 35 C19 36 18 33 17 31 Z" fill="${C.white}" stroke-width="1.8"/>` +
        ell(27, 27, 2.4, 1.3, C.wheat, 0) + ell(38, 28, 2.2, 1.2, C.wheat, 0) +
        leaf(33, 24, -20, 10) + leaf(26, 23, 35, 7)),
    polenta_e_funghi: () =>
      K.board(
        `<path d="M12 40 C12 32 22 27 32 27 C44 27 52 32 52 39 C52 46 42 50 32 50 C21 50 12 47 12 40 Z" fill="${C.yellow}"/>` +
        K.sh('M48 36 C51 41 48 47 38 49 C46 49 52 45 52 40 Z') + K.hiE(20, 34, 4, 2) +
        [[26, 35, -15], [35, 32, 10], [40, 39, -5], [30, 41, 20], [21, 41, 0]].map(([x, y, r]) =>
          `<g transform="rotate(${r} ${x} ${y})"><path d="M${x - 5} ${y} C${x - 5} ${y - 5} ${x + 5} ${y - 5} ${x + 5} ${y} Z" fill="${C.brown}" stroke-width="1.5"/>` +
          `<path d="M${x - 1.5} ${y} V${y + 3} H${x + 1.5} V${y}" fill="${C.cream}" stroke-width="1.3"/></g>`).join('') +
        K.dots([[33, 37], [24, 31], [45, 36], [36, 45]], 1.2, C.leafD)),
    spinach_ricotta_ravioli: () => {
      const rav = (x, y) =>
        `<path d="M${x} ${y - 7} L${x + 10} ${y - 1} L${x} ${y + 5} L${x - 10} ${y - 1} Z" fill="${C.wheatL}" stroke-width="2"/>` +
        `<path d="M${x} ${y - 4} L${x + 5.5} ${y - 1} L${x} ${y + 2} L${x - 5.5} ${y - 1} Z" fill="${C.leafL}" stroke="none"/>` +
        K.dots([[x - 7, y - 1], [x - 3.5, y - 5], [x + 3.5, y - 5], [x + 7, y - 1], [x + 3.5, y + 3], [x - 3.5, y + 3]], 0.8, C.wheatD);
      return K.plate(blob('M12 38 C14 32 26 30 34 30 C44 30 52 34 52 39 C50 45 40 47 32 47 C22 47 14 44 12 38 Z', C.gold) +
        rav(22, 34) + rav(40, 33) + rav(31, 42) + rav(48, 42) + rav(16, 43) +
        leaf(30, 30, -30, 9, C.leafD, C.pine) + leaf(36, 47, 20, 8, C.leafD, C.pine));
    },
    affogato: () =>
      K.glass(C.brown, 'tumbler',
        blob('M19 22 H45 L44.5 30 C38 33 26 33 19.5 30 Z', C.brownL) +
        `<path d="M21 17 C21 9 26 5 32 5 C38 5 43 9 43 17 C43 21 38 22 32 22 C26 22 21 21 21 17 Z" fill="${C.creamL}"/>` +
        `<path d="M28 6 C35 5 42 9 42 15 C40 19 38 15 37 19 C35 22 34 16 32 18 C30 16 29 12 28 6 Z" fill="${C.brown}" stroke-width="1.6"/>` +
        K.hiE(26, 11, 2.5, 1.5)),
    spaghetti_alle_vongole: () => {
      const clam = (x, y, r) => `<g transform="rotate(${r} ${x} ${y})">` +
        `<path d="M${x - 6} ${y} C${x - 6} ${y - 7} ${x + 6} ${y - 7} ${x + 6} ${y} Z" fill="${C.greyL}" stroke-width="1.6"/>` +
        K.line(`M${x - 3} ${y - 0.5} L${x - 2} ${y - 4} M${x} ${y - 0.5} V${y - 5} M${x + 3} ${y - 0.5} L${x + 2} ${y - 4}`, 1.1, C.greyD) +
        `<path d="M${x - 6} ${y} C${x - 6} ${y + 5} ${x + 6} ${y + 5} ${x + 6} ${y} Z" fill="${C.orangeL}" stroke-width="1.6"/></g>`;
      return K.plate(nest(C.wheatL, C.wheatD,
        clam(20, 32, -15) + clam(38, 27, 10) + clam(45, 38, 20) + clam(28, 41, -5) +
        K.dots([[30, 30], [24, 25], [44, 31], [36, 36], [18, 40], [40, 44]], 1.3, C.leafD)));
    },
    beef_carpaccio: () =>
      K.plate(
        [[14, 37, -20], [17, 30, 20], [27, 26, 5], [38, 26, -5], [48, 30, -20], [50, 38, 20], [40, 44, 5], [24, 44, -5]].map(([x, y, r]) =>
          ell(x, y, 9, 5.6, C.meat, 1.6, r) + K.line(`M${x - 4} ${y} C${x - 1} ${y - 2} ${x + 2} ${y + 1} ${x + 5} ${y - 1}`, 1.2, C.meatL)).join('') +
        [[28, 34, -30], [34, 32, 20], [38, 37, -10], [26, 39, 30], [32, 39, 60]].map(([x, y, r]) => leaf(x, y, r, 9, C.leaf, C.leafD)).join('') +
        `<path d="M21 31 L28 29 L27 33 Z M40 30 L46 31 L43 34 Z M42 40 L47 42 L42 44 Z" fill="${C.yellowL}" stroke-width="1.2"/>`),
    prosciutto_e_melone: () => {
      const wedge = (x, y, r) => `<g transform="rotate(${r} ${x} ${y})">` +
        `<path d="M${x - 18} ${y - 5} C${x - 11} ${y + 12} ${x + 11} ${y + 12} ${x + 18} ${y - 5} C${x + 11} ${y + 8} ${x - 11} ${y + 8} ${x - 18} ${y - 5} Z" fill="${C.leaf}" stroke-width="2"/>` +
        `<path d="M${x - 18} ${y - 5} C${x - 11} ${y + 8} ${x + 11} ${y + 8} ${x + 18} ${y - 5} Z" fill="${C.orange}" stroke-width="2"/>` +
        blob(`M${x - 14} ${y - 4} C${x - 8} ${y + 2} ${x + 8} ${y + 2} ${x + 14} ${y - 4} Z`, C.orangeL) +
        `<path d="M${x - 6} ${y - 7} C${x - 3} ${y - 3} ${x - 7} ${y + 1} ${x - 4} ${y + 6} L${x + 4} ${y + 6} C${x + 1} ${y + 1} ${x + 5} ${y - 3} ${x + 2} ${y - 7} Z" fill="${C.pink}" stroke-width="1.6"/>` +
        K.line(`M${x - 2} ${y - 5} C${x + 1} ${y - 2} ${x - 2} ${y + 1} ${x} ${y + 4}`, 1.2, C.fat) + `</g>`;
      return K.plate(wedge(31, 30, -5) + wedge(34, 42, 4));
    },
    panforte: () =>
      K.board(
        `<path d="M10 33 C10 26 19 22 30 22 C41 22 50 26 50 33 V40 C50 46 41 49 30 49 C19 49 10 46 10 40 Z" fill="${C.brownD}"/>` +
        K.dots([[14, 40], [20, 44], [27, 45]], 1.4, C.wheatL) +
        blob('M38 42.5 L38.5 49.4 C44 48.5 48 46.5 50 43 L50 34.5 Z', C.woodL) +
        `<path d="M30 33 L50 34.5 A20 10 0 1 0 38 42.5 Z" fill="${C.creamL}"/>` +
        `<path d="M30 33 L38 42.5 V49.5 L30 40 Z" fill="${C.brown}"/>` +
        `<path d="M30 33 L50 34.5 V41.5 L30 40 Z" fill="${C.brownL}"/>` +
        ell(35, 37.5, 2, 1.3, C.wheatL, 1) + ell(42, 38.5, 1.8, 1.2, C.leafL, 1) + ell(46, 37, 1.5, 1.1, C.wheatL, 1) + ell(33.5, 43, 1.3, 1, C.orange, 1) +
        K.dots([[18, 30], [24, 27], [33, 27], [41, 29], [22, 34], [15, 35]], 1, C.creamD) + K.hiE(18, 27, 4, 1.8)),
    vitello_tonnato: () =>
      K.plate(
        [[16, 37, -15], [24, 31, -5], [36, 30, 5], [46, 35, 15], [40, 43, 0], [24, 43, 0]].map(([x, y, r]) =>
          ell(x, y, 9.5, 6, C.pinkL, 1.6, r) + ell(x, y, 7, 4, C.pink, 0, r)).join('') +
        `<path d="M18 36 C18 30 26 28 32 29 C40 28 47 32 46 37 C45 41 41 40 39 43 C36 45 33 41 30 43 C26 45 24 41 21 41 C18 41 18 38 18 36 Z" fill="${C.cream}" stroke-width="1.8"/>` +
        K.dots([[26, 33], [33, 32], [39, 35], [30, 37], [36, 39]], 1.4, C.leafD) +
        K.hiE(25, 31, 3, 1.4)),
    // ---- Spanish & Portuguese ------------------------------------------------------
    paella_valenciana: () =>
      pan(C.yellow,
        K.dots([[16, 36], [22, 31], [30, 29], [40, 30], [47, 35], [44, 43], [34, 45], [24, 44], [18, 41], [36, 38]], 1, C.yellowD) +
        [[22, 36, -20], [37, 33, 15], [31, 42, -5]].map(([x, y, r]) =>
          `<path d="M${x - 5} ${y + 2} C${x - 6} ${y - 3} ${x - 1} ${y - 5} ${x + 3} ${y - 4} C${x + 7} ${y - 3} ${x + 7} ${y + 2} ${x + 4} ${y + 3.5} C${x + 1} ${y + 5} ${x - 3} ${y + 5} ${x - 5} ${y + 2} Z" transform="rotate(${r} ${x} ${y})" fill="${C.orangeL}" stroke-width="1.6"/>`).join('') +
        `<path d="M43 28 C46 27 49 28 50 30 C49 33 45 34 43 32 C41 31 41 29 43 28 Z" fill="${C.brownL}" stroke-width="1.6"/>` +
        [['M14 32 L22 28', 0], ['M40 42 L50 38', 0], ['M25 47 L30 39', 0], ['M44 36 L48 44', 0]].map(([d]) =>
          `<path d="${d}" stroke="${C.ink}" stroke-width="4.6"/><path d="${d}" stroke="${C.leaf}" stroke-width="2.2"/>`).join('') +
        ell(19, 42, 2, 1.4, C.leafL, 1.2) + ell(29, 33, 1.8, 1.2, C.redL, 1.2) + ell(48, 33, 1.8, 1.2, C.redL, 1.2)),
    seafood_paella: () =>
      pan(C.orange,
        K.dots([[16, 36], [24, 30], [36, 29], [47, 35], [42, 44], [22, 44], [32, 40]], 1, C.orangeD) +
        [[19, 32], [37, 44]].map(([x, y]) =>
          `<path d="M${x - 6} ${y} C${x - 5} ${y - 4} ${x + 4} ${y - 5} ${x + 6} ${y - 1} C${x + 4} ${y + 3} ${x - 4} ${y + 4} ${x - 6} ${y} Z" fill="${C.black}" stroke-width="1.5"/>` +
          ell(x, y - 0.5, 3.4, 1.6, C.orangeL, 0)).join('') +
        shrimp(30, 32, 10) + shrimp(44, 35, -20) + shrimp(24, 41, 30) +
        ell(46, 44, 3, 2, C.white, 1.4) + ell(46, 44, 1.4, 0.8, C.orange, 0) + ell(37, 28, 2.8, 1.8, C.white, 1.4) + ell(37, 28, 1.3, 0.7, C.orange, 0) +
        `<path d="M10 37 C10 32 14 29 18 28 L19 37 Z" fill="${C.yellow}" stroke-width="1.6"/>` + K.line('M12 36 L16 31', 1.2, C.yellowD)),
    gazpacho: () =>
      K.glass(C.redL, 'tumbler',
        blob('M18.5 22 H45.5 L45.2 25.5 H18.7 Z', C.red) +
        `<rect x="23" y="19" width="5" height="4.5" rx="1" fill="${C.leaf}" stroke-width="1.4"/><rect x="31" y="20" width="4.5" height="4" rx="1" fill="${C.yellow}" stroke-width="1.4"/><rect x="37" y="18.5" width="5" height="4.5" rx="1" fill="${C.wheatL}" stroke-width="1.4"/>` +
        `<path d="M38 10 C38 3 52 3 52 10 L45 17 Z" fill="${C.leaf}" stroke-width="2"/>` +
        `<path d="M40.5 10 C40.5 6 49.5 6 49.5 10 L45 14.5 Z" fill="${C.leafL}" stroke-width="1.2"/>` +
        K.dots([[43, 9], [46.5, 9]], 0.9, C.cream)),
    tortilla_espanola: () =>
      K.plate(
        `<path d="M10 33 C10 26 19 22 30 22 C41 22 50 26 50 33 V41 C50 47 41 50 30 50 C19 50 10 47 10 41 Z" fill="${C.yellowD}"/>` +
        blob('M38 42.5 L38.5 50.4 C44 49.5 48 47.5 50 44 L50 34.5 Z', C.white) +
        `<path d="M30 33 L50 34.5 A20 10 0 1 0 38 42.5 Z" fill="${C.yellow}"/>` +
        `<path d="M30 33 L38 42.5 V50.5 L30 41 Z" fill="${C.yellowL}"/>` +
        `<path d="M30 33 L50 34.5 V42.5 L30 41 Z" fill="${C.yellowL}"/>` +
        K.line('M30 36 L49 37.5 M30 38.6 L49 40 M30.5 36 L37.5 45 M30.5 38.6 L37.5 48', 1.2, C.wheatD) +
        blob('M16 30 C18 27 22 27 23 29 C21 31 18 32 16 30 Z M30 25 C33 24 37 25 37 27 C34 28 31 27 30 25 Z M18 38 C20 37 23 38 23 40 C21 41 19 40 18 38 Z', C.orange) +
        K.hiE(18, 27, 4, 1.8)),
    patatas_bravas: () => {
      const papa = (x, y) => cube(x, y, 7, C.wheatL, C.wheat, C.wheatD) +
        `<path d="M${x - 4.5} ${y - 3.6} C${x - 4} ${y - 7} ${x + 4} ${y - 7.5} ${x + 4.5} ${y - 3.8} C${x + 3} ${y - 1.5} ${x - 3} ${y - 1.2} ${x - 4.5} ${y - 3.6} Z" fill="${C.red}" stroke-width="1.4"/>` +
        circ(x + 1, y - 4.6, 1.5, C.white, 1);
      return K.plate(papa(18, 37) + papa(32, 32) + papa(46, 37) + papa(25, 45) + papa(39, 45) +
        `<path d="M50 20 L40 31" stroke-width="2" stroke="${C.woodD}"/>`);
    },
    gambas_al_ajillo: () =>
      K.steam(32, 9) +
      K.bowl(
        shrimp(20, 27, -10, 0.95) + shrimp(33, 23, 15, 0.95) + shrimp(45, 28, -25, 0.95) + shrimp(31, 32, 0, 0.8) +
        ell(26, 28, 2.4, 1.6, C.creamL, 1.2, 20) + ell(40, 32, 2.4, 1.6, C.creamL, 1.2, -20) + ell(14, 31, 2.2, 1.4, C.creamL, 1.2) +
        `<path d="M38 22 L45 20" stroke="${C.red}" stroke-width="2.5"/>` +
        K.dots([[24, 33], [39, 27], [50, 31], [17, 25]], 1.2, C.leafD),
        C.terracotta, C.gold),
    churros_con_chocolate: () => {
      const churro = (d) => `<path d="${d}" stroke-width="8.5"/><path d="${d}" stroke="${C.wheat}" stroke-width="5.6"/><path d="${d}" stroke="${C.wheatD}" stroke-width="1.2"/>`;
      return churro('M24 22 L8 5') + churro('M30 21 L23 3') +
        K.dots([[12, 9], [16, 13], [10, 7.5], [25, 7], [26, 12], [19, 16]], 0.9, C.white) +
        K.glass(C.choc, 'mug', `<path d="M36 19 C36 23 38 27 40 26 C42 25 41 21 43 19.5 Z" fill="${C.choc}" stroke-width="1.6"/>` + K.hi('M24 17 C27 16 30 16 33 16.5 C30 17.5 27 17.5 24 17 Z'));
    },
    pan_con_tomate: () =>
      K.plate(
        `<path d="M8 40 C6 34 14 28 26 26 C38 24 48 25 49 31 C50 37 42 43 30 45 C18 47 10 46 8 40 Z" fill="${C.wheatD}"/>` +
        `<path d="M11 39 C10 34 17 30 27 28.5 C37 27 45 28 46 32 C46.5 36 40 40 30 42 C20 44 12 43 11 39 Z" fill="${C.redL}" stroke="none"/>` +
        blob('M15 37 C17 33 24 32 28 33 C24 35 21 36 19 39 Z M33 31 C37 30 42 30 43 32 C40 33 37 33 33 31 Z M30 38 C33 36 38 36 39 37 C36 39 33 39 30 38 Z', C.red) +
        K.dots([[22, 35], [36, 34], [27, 39], [41, 35], [17, 39]], 0.9, C.white) +
        `<path d="M44 45 C44 38 58 38 58 45 C58 50 44 50 44 45 Z" fill="${C.red}"/>` + ell(51, 44, 5.5, 3.4, C.redL, 1.4) + K.dots([[49, 44], [53, 44], [51, 45.5]], 0.8, C.yellow) +
        `<path d="M14 49 C14 46 18 45 20 46 C22 47 21 50 18 51 C16 51 14 51 14 49 Z" fill="${C.creamL}" stroke-width="1.5"/>`),
    crema_catalana: () =>
      K.bowl(
        blob('M14 30 C16 26 24 25 28 26 C24 28 18 29 15 32 Z M38 27 C43 26 48 28 49 30 C46 30 42 29 38 27 Z', C.yellowL) +
        K.line('M18 31 L24 29 L27 32 M24 29 L29 26 M33 28 L38 31 L44 30 M38 31 L40 34 M44 30 L49 32', 1.3, C.orangeD) +
        blob('M30 33 C33 32 36 33 37 34 C34 35 31 35 30 33 Z M20 26 C22 25 24 25 25 26 C23 27 21 27 20 26 Z', C.brownD) +
        `<path d="M22 22 L40 25" stroke-width="5"/><path d="M22 22 L40 25" stroke="${C.brown}" stroke-width="2.6"/>`,
        C.terracotta, C.gold),
    bacalhau_a_bras: () =>
      K.plate(
        `<path d="M10 39 C10 30 20 25 32 25 C44 25 54 30 54 39 C54 45 44 48 32 48 C20 48 10 45 10 39 Z" fill="${C.yellowL}"/>` +
        K.line('M15 36 L21 33 M20 41 L27 39 M27 30 L33 29 M36 33 L42 31 M40 41 L47 38 M46 32 L50 35 M24 35 L26 31 M31 43 L36 43 M18 31 L23 29', 1.8, C.wheatD) +
        `<path d="M24 33 C26 31 30 31 31 33 C30 35 26 36 24 33 Z M37 36 C39 34 43 35 43 37 C42 39 38 39 37 36 Z M30 39 C32 38 35 38 35 40 C34 41 31 41 30 39 Z" fill="${C.white}" stroke-width="1.4"/>` +
        circ(20, 38, 2.6, C.black) + circ(42, 29, 2.6, C.black) + circ(35, 46, 2.4, C.black) + circ(48, 41, 2.3, C.black) +
        K.dots([[28, 28], [33, 36], [16, 34], [44, 44], [26, 44], [38, 27]], 1.3, C.leafD)),
    pastel_de_nata: () => {
      const tart = (x, y, rx) =>
        `<path d="M${x - rx} ${y} L${x - rx + 2.5} ${y + rx * 0.75} C${x - rx + 4} ${y + rx * 0.9} ${x + rx - 4} ${y + rx * 0.9} ${x + rx - 2.5} ${y + rx * 0.75} L${x + rx} ${y} Z" fill="${C.wheat}"/>` +
        K.line(`M${x - rx * 0.6} ${y + 2} L${x - rx * 0.5} ${y + rx * 0.8} M${x - rx * 0.2} ${y + 3} V${y + rx * 0.85} M${x + rx * 0.2} ${y + 3} V${y + rx * 0.85} M${x + rx * 0.6} ${y + 2} L${x + rx * 0.5} ${y + rx * 0.8}`, 1.3, C.wheatD) +
        ell(x, y, rx, rx * 0.42, C.wheatL, 2.5) + ell(x, y + 0.3, rx - 3, rx * 0.42 - 2.2, C.yellow, 1.4) +
        blob(`M${x - 4} ${y - 1} C${x - 2} ${y - 3} ${x + 2} ${y - 2} ${x + 1} ${y} C${x} ${y + 2} ${x - 3} ${y + 1} ${x - 4} ${y - 1} Z M${x + rx * 0.45} ${y} C${x + rx * 0.5} ${y - 2} ${x + rx * 0.7} ${y - 1} ${x + rx * 0.6} ${y + 1} Z M${x - rx * 0.6} ${y + 1} C${x - rx * 0.6} ${y - 1} ${x - rx * 0.4} ${y - 1} ${x - rx * 0.45} ${y + 1.5} Z`, C.brownD);
      return K.shadow(26) + tart(22, 22, 14) + tart(39, 39, 17);
    },
    fabada_asturiana: () =>
      K.steam(32, 9) +
      K.pot(
        ell(16, 27, 2.6, 1.6, C.creamL, 1.3) + ell(22, 24, 2.6, 1.6, C.creamL, 1.3) + ell(44, 24, 2.6, 1.6, C.creamL, 1.3) + ell(48, 28, 2.6, 1.6, C.creamL, 1.3) +
        ell(35, 29, 2.6, 1.6, C.creamL, 1.3) + ell(13, 24.5, 2.4, 1.4, C.creamL, 1.3) +
        ell(28, 23, 5, 3.5, C.red, 1.6) + K.dots([[27, 22], [29.5, 24]], 0.9, C.fat) +
        ell(40, 27, 4.5, 3.2, C.choc, 1.6) + K.dots([[39, 26], [41.5, 28]], 0.8, C.cream) +
        `<path d="M18 29 L26 27.5 L27 30 L19 31.5 Z" fill="${C.pinkL}" stroke-width="1.4"/>`,
        C.terracotta),
    pulpo_a_la_gallega: () =>
      K.plate(
        [[16, 38], [27, 44], [40, 44], [49, 37], [33, 33], [21, 31], [44, 30]].map(([x, y]) => ell(x, y, 7, 4.2, C.wheatL, 1.6)).join('') +
        [[20, 36], [31, 41], [43, 38], [28, 30], [39, 30]].map(([x, y]) =>
          ell(x, y, 5.4, 4, C.purple, 1.6) + ell(x, y, 3.2, 2.3, C.pinkL, 0) + circ(x - 4.5, y + 2.5, 1.2, C.pinkL, 1)).join('') +
        K.dots([[17, 33], [24, 38], [34, 35], [36, 44], [46, 34], [48, 41], [25, 28], [44, 27], [31, 46], [14, 41]], 1, C.redD),
        C.woodL, C.wood),
    calamares_fritos: () =>
      K.plate(
        [[19, 33, -15], [33, 29, 10], [46, 34, -10], [26, 42, 15], [40, 43, -5]].map(([x, y, r]) =>
          `<g transform="rotate(${r} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="8" ry="5.6" fill="${C.wheat}"/><ellipse cx="${x}" cy="${y}" rx="3.6" ry="2" fill="${C.white}" stroke-width="1.6"/>` +
          K.dots([[x - 5, y - 1], [x + 4, y - 3], [x + 5, y + 2], [x - 2, y + 4]], 0.9, C.wheatD) + `</g>`).join('') +
        `<path d="M48 48 C50 42 58 42 58 46 Z" fill="${C.yellow}" stroke-width="1.8"/>` +
        `<path d="M50 46 C52 43.5 56 43.5 56.5 45.5" stroke="${C.yellowL}" stroke-width="1.4"/>`),
    jamon_manchego_board: () =>
      K.board(
        [[14, 40, -20], [22, 36, 10], [26, 44, -10]].map(([x, y, r]) =>
          `<g transform="rotate(${r} ${x} ${y})"><path d="M${x - 8} ${y} C${x - 8} ${y - 6} ${x + 8} ${y - 6} ${x + 8} ${y} C${x + 8} ${y + 4} ${x - 8} ${y + 4} ${x - 8} ${y} Z" fill="${C.meatD}" stroke-width="1.8"/>` +
          `<path d="M${x - 6} ${y - 0.5} C${x - 6} ${y - 4} ${x + 6} ${y - 4} ${x + 6} ${y - 0.5}" stroke="${C.meatL}" stroke-width="1.4"/>` +
          `<path d="M${x - 7} ${y + 2} C${x - 4} ${y + 3.5} ${x + 4} ${y + 3.5} ${x + 7} ${y + 2}" stroke="${C.fat}" stroke-width="1.8"/></g>`).join('') +
        K.place(`<path d="M6 36 L44 18 L58 32 V48 L20 56 L6 50 Z" fill="${C.cream}"/>` +
          `<path d="M6 36 L44 18 L58 32 L20 40 Z" fill="${C.creamL}"/>` +
          `<path d="M20 40 L58 32 V48 L20 56 Z" fill="${C.wheatD}"/>` +
          `<path d="M22 45 L27 41 L32 45 L37 40 L42 44 L47 39 L52 43 L56 38 M22 51 L27 47 L32 51 L37 46 L42 50 L47 45 L52 49 L56 44" fill="none" stroke="${C.choc}" stroke-width="2.4"/>` +
          `<path d="M20 40 V56" fill="none"/>` + K.dots([[13, 44], [10, 40]], 2, C.creamD), 44, 33, 0.48) +
        cube(52, 45, 5.5, C.redL, C.red, C.redD, 1.6)),

    // ---- Greek & Middle Eastern ----------------------------------------------------
    greek_salad: () =>
      K.bowl(
        `<path d="M14 28 C14 22 20 19 24 19 L28 28 Z" fill="${C.red}" stroke-width="1.6"/>` +
        `<path d="M42 29 C46 25 52 26 53 30 Z" fill="${C.red}" stroke-width="1.6"/>` +
        ell(38, 22, 4.6, 3, C.leaf, 1.6) + ell(38, 22, 3, 1.8, C.leafL, 0) + ell(17, 31, 4.2, 2.6, C.leaf, 1.6) + ell(17, 31, 2.6, 1.5, C.leafL, 0) +
        K.line('M42 31 C44 29 48 29 50 31 M10 27 C12 25 15 25 17 27', 1.8, C.purple) +
        circ(46, 23, 2.6, C.black) + circ(22, 33, 2.4, C.black) + circ(43, 32, 2.2, C.black) +
        cube(30, 25, 8, C.white, C.creamL, C.cream, 2) +
        K.dots([[27, 19], [32, 18.5], [30, 21], [34, 20]], 0.8, C.leafD),
        C.white, C.leafL),
    moussaka: () =>
      K.plate(
        `<path d="M12 29 L36 21 L52 29 L28 37 Z" fill="${C.wheat}"/>` +
        `<path d="M12 29 L28 37 V52 L12 44 Z" fill="${C.creamL}"/>` +
        `<path d="M28 37 L52 29 V44 L28 52 Z" fill="${C.cream}"/>` +
        `<path d="M12 36 L28 44 L52 36 V40.5 L28 48.5 L12 40.5 Z" fill="${C.brown}" stroke="none"/>` +
        `<path d="M12 40.5 L28 48.5 L52 40.5 V44 L28 52 L12 44 Z" fill="${C.purple}" stroke="none"/>` +
        K.line('M12 36 L28 44 L52 36 M12 40.5 L28 48.5 L52 40.5', 1.3) +
        `<path d="M12 29 L28 37 V52 L12 44 Z M28 37 L52 29 V44 L28 52 Z" fill="none"/>` +
        K.dots([[30, 39.5], [40, 37], [20, 37.5], [46, 34]], 0.9, C.creamD) +
        blob('M20 28 C22 26 27 26 28 28 C26 30 22 30 20 28 Z M36 25 C38 24 42 25 42 27 C40 28 37 27 36 25 Z M33 32 C35 31 38 31 38 33 C36 34 34 34 33 32 Z', C.brown)),
    spanakopita: () => {
      const tri = (x, y, f) =>
        `<path d="M${x - 14 * f} ${y + 4} L${x + 2 * f} ${y - 12} L${x + 14 * f} ${y + 2} V${y + 8} L${x - 14 * f} ${y + 10} Z" fill="${C.wheatD}"/>` +
        `<path d="M${x - 13 * f} ${y + 7.2} L${x + 13 * f} ${y + 5.3}" stroke="${C.leafD}" stroke-width="2.2"/>` +
        K.dots([[x - 6 * f, y + 6.6], [x + 5 * f, y + 5.8]], 0.9, C.white) +
        `<path d="M${x - 14 * f} ${y + 4} L${x + 2 * f} ${y - 12} L${x + 14 * f} ${y + 2} Z" fill="${C.wheat}"/>` +
        K.line(`M${x - 8 * f} ${y + 1} L${x + 2 * f} ${y - 7} M${x - 2 * f} ${y + 1.5} L${x + 4 * f} ${y - 3}`, 1.3, C.wheatD) +
        K.hi(`M${x - 10 * f} ${y + 2} L${x + 1 * f} ${y - 9} L${x + 2 * f} ${y - 8} L${x - 8 * f} ${y + 2.5} Z`);
      return K.plate(tri(23, 32, 1) + tri(41, 40, -1));
    },
    souvlaki_with_tzatziki: () =>
      K.plate(
        `<path d="M8 38 C8 30 20 27 30 28 C42 28 52 31 52 37 C52 43 42 46 30 46 C18 46 8 44 8 38 Z" fill="${C.wheatL}"/>` +
        K.dots([[16, 34], [26, 31], [42, 33], [46, 39], [20, 42]], 1.2, C.wheatD) +
        `<path d="M6 48 L58 24" stroke-width="2.8" stroke="${C.ink}"/><path d="M6 48 L58 24" stroke-width="1.2" stroke="${C.woodL}"/>` +
        [[16, 43.5], [25, 39.5], [34, 35.3], [43, 31.2]].map(([x, y]) =>
          `<path d="M${x - 4.5} ${y - 4} L${x + 3} ${y - 6} L${x + 5} ${y + 2} L${x - 3} ${y + 4} Z" fill="${C.brown}" stroke-width="1.8"/>` + K.line(`M${x - 2} ${y - 3} L${x + 3} ${y - 4}`, 1.3, C.brownD)).join('') +
        `<path d="M40 46 C38 41 44 38 49 39 C54 40 56 44 53 47 C50 50 42 50 40 46 Z" fill="${C.white}" stroke-width="2"/>` +
        K.dots([[45, 42], [49, 44], [44, 46], [51, 41.5]], 0.9, C.leafD) +
        ell(12, 34, 3.4, 2.4, C.red, 1.4) + K.line('M20 26 C22 24 26 24 28 26', 1.8, C.purple)),
    baklava: () => {
      const dia = (x, y) =>
        `<path d="M${x - 12} ${y} L${x} ${y - 6} L${x + 12} ${y} V${y + 5} L${x} ${y + 11} L${x - 12} ${y + 5} Z" fill="${C.wheatD}"/>` +
        K.line(`M${x - 12} ${y + 2.5} L${x} ${y + 8.5} L${x + 12} ${y + 2.5}`, 1.2, C.gold) +
        `<path d="M${x - 12} ${y} L${x} ${y - 6} L${x + 12} ${y} L${x} ${y + 6} Z" fill="${C.gold}"/>` +
        ell(x, y, 4.5, 2.2, C.leaf, 1.3) + K.dots([[x - 1.5, y - 0.5], [x + 1.6, y + 0.4]], 0.7, C.leafL) +
        K.line(`M${x} ${y + 6} V${y + 11}`, 1.6);
      return K.plate(dia(20, 34) + dia(44, 34) + dia(32, 27) + dia(32, 41));
    },
    hummus: () =>
      K.bowl(
        `<path d="M8.5 30 C9 23 19 19 32 19 C45 19 55 23 55.5 30 C48 34 16 34 8.5 30 Z" fill="${C.wheatL}"/>` +
        K.line('M14 29 C16 24 26 22 33 22.5 C42 23 49 25 50 29 M20 29 C22 26 28 25.5 33 26 C39 26.5 42 28 42 30', 1.5, C.wheat) +
        ell(32, 28, 7, 2.6, C.gold, 1.4) +
        K.dots([[28, 27.5], [36, 28.5], [31, 29]], 1.1, C.red) +
        circ(19, 25, 2.4, C.wheat, 1.4) + circ(45, 25, 2.4, C.wheat, 1.4) + circ(24, 23, 2.2, C.wheat, 1.4) +
        K.dots([[40, 23], [15, 28], [49, 28]], 1.2, C.leafD),
        C.white, C.wheatL),
    falafel: () => {
      const ball = (x, y, r) => circ(x, y, r, C.brown, 2.5) + K.dots([[x - r / 2, y - r / 3], [x + r / 3, y - r / 2], [x + r / 2, y + r / 3], [x - r / 4, y + r / 2], [x, y]], 1, C.brownD) + K.hiE(x - r / 2.5, y - r / 2.5, r / 3, r / 6);
      return K.plate(
        `<path d="M10 42 C16 47 28 49 36 48" stroke="${C.ink}" stroke-width="4.6"/><path d="M10 42 C16 47 28 49 36 48" stroke="${C.creamL}" stroke-width="2.4"/>` +
        ball(19, 34, 9) + ball(34, 28, 9) +
        `<path d="M32 43 C32 36 38 33 44 33 C51 33 55 37 55 42 C55 47 50 50 44 50 C37 50 32 48 32 43 Z" fill="${C.brownD}"/>` +
        ell(43.5, 41, 10, 6.5, C.leaf, 2.2) + K.dots([[39, 40], [44, 38.5], [48, 41.5], [42, 43.5]], 1, C.leafD) + K.dots([[46, 40], [40, 42.5]], 0.9, C.leafL) +
        leaf(14, 46, 20, 8));
    },
    tabbouleh: () =>
      K.bowl(
        `<path d="M9 30 C10 21 20 16 32 16 C44 16 54 21 55 30 C46 34 18 34 9 30 Z" fill="${C.leafL}"/>` +
        K.dots([[15, 27], [20, 22], [27, 19], [35, 18.5], [43, 21], [49, 26], [24, 26], [32, 24], [40, 27], [19, 30], [45, 30], [30, 30]], 1.3, C.leafD) +
        K.dots([[17, 24], [29, 22], [38, 23], [46, 24], [22, 29], [35, 28]], 0.9, C.wheatL) +
        [[22, 23], [40, 21], [31, 27], [48, 28], [16, 29]].map(([x, y]) => `<rect x="${x - 2}" y="${y - 1.8}" width="4" height="3.6" rx=".8" fill="${C.red}" stroke-width="1.2"/>`).join('') +
        leaf(33, 17, -20, 10, C.leaf, C.leafD) +
        `<path d="M44 13 C50 12 55 16 55 21 L45 20 Z" fill="${C.yellow}" stroke-width="1.8"/>` + K.line('M46 15.5 C49 15.5 51.5 17 52.5 19', 1.3, C.yellowL),
        C.white, C.leaf),
    shakshuka: () => {
      const egg = (x, y) => `<path d="M${x - 7} ${y} C${x - 8} ${y - 4} ${x - 3} ${y - 6} ${x + 1} ${y - 5} C${x + 6} ${y - 5} ${x + 8} ${y - 2} ${x + 7} ${y + 1} C${x + 6} ${y + 4} ${x - 5} ${y + 4} ${x - 7} ${y} Z" fill="${C.white}" stroke-width="1.8"/>` +
        circ(x, y - 1, 2.8, C.yellow, 1.6) + K.hiE(x - 1, y - 2, 1, 0.6);
      return pan(C.red,
        K.dots([[16, 35], [26, 31], [42, 32], [48, 40], [20, 44], [36, 44]], 1.3, C.redD) +
        egg(22, 37) + egg(38, 33) + egg(36, 44) +
        K.line('M14 40 L19 43 M44 38 L49 36 M27 30 L31 29', 2.4, C.leafD) + K.dots([[30, 38], [46, 44], [17, 33]], 1.2, C.leafL), true);
    },
    baba_ganoush: () =>
      `<g transform="rotate(35 46 14)"><path d="M33 14 C33 9 39 8 46 9 C54 10 58 12 58 15 C58 19 52 20 45 19 C39 18 33 18 33 14 Z" fill="${C.purple}"/>` +
      `<path d="M58 15 C60 14 61 13 62 11 M55 11 L58 13 L55 18" fill="${C.leaf}" stroke-width="2"/>` + K.hi('M37 12 C40 11 44 11 47 11.5 C43 12.5 40 13 37 13 Z') + `</g>` +
      K.bowl(
        `<path d="M8.5 30 C9 24 19 20 32 20 C45 20 55 24 55.5 30 C48 34 16 34 8.5 30 Z" fill="${C.creamD}"/>` +
        K.line('M13 29 C15 25 24 23 31 23.5 M36 24 C43 24 48 26 50 29 M22 30 C25 27 33 26.5 40 28', 1.5, C.brownL) +
        blob('M22 27 C25 25 31 25 33 27 C31 29 25 29 22 27 Z M37 29 C40 28 44 28 45 30 C42 31 39 31 37 29 Z', C.gold) +
        K.dots([[20, 25], [28, 23], [41, 26], [47, 28], [30, 30], [16, 28]], 1.3, C.leafD) + K.dots([[34, 25], [25, 30], [43, 30]], 1.2, C.redD),
        C.white, C.creamD),
    lamb_tagine_with_apricots: () =>
      `<path d="M6 26 C10 22 16 9 22 6 C24 5 26 5 28 6 C33 10 37 20 40 25 C32 29 14 29 6 26 Z" fill="${C.terracotta}"/>` +
      `<circle cx="25" cy="5" r="2.6" fill="${C.terracotta}"/>` +
      K.line('M12 19 C18 21 30 21 36 18', 2.2, C.creamL) + K.hi('M12 21 C15 16 18 11 21 8 L22 9 C20 13 17 18 15 22 Z') +
      K.plate(
        [[22, 36], [37, 33], [30, 43]].map(([x, y]) =>
          `<path d="M${x - 6} ${y + 1} C${x - 7} ${y - 4} ${x - 1} ${y - 6} ${x + 4} ${y - 5} C${x + 8} ${y - 3} ${x + 7} ${y + 3} ${x + 3} ${y + 4} C${x - 1} ${y + 5} ${x - 5} ${y + 4} ${x - 6} ${y + 1} Z" fill="${C.brown}" stroke-width="1.8"/>` +
          K.line(`M${x - 3} ${y - 1} C${x} ${y - 3} ${x + 2} ${y - 2} ${x + 4} ${y - 2}`, 1.2, C.brownD)).join('') +
        [[45, 39], [16, 42], [41, 46], [29, 31]].map(([x, y]) => ell(x, y, 4, 3, C.orange, 1.5) + ell(x - 0.8, y - 0.6, 1.8, 1, C.orangeL, 0)).join('') +
        ell(48, 33, 2.4, 1.3, C.creamL, 1.2, -20) + ell(22, 47, 2.4, 1.3, C.creamL, 1.2, 15) + ell(13, 36, 2.2, 1.2, C.creamL, 1.2, 30) +
        K.dots([[33, 38], [26, 40], [43, 43]], 1.2, C.leafD),
        C.terracotta, C.orangeD),
    vegetable_couscous: () =>
      K.plate(
        `<path d="M9 40 C10 30 20 23 32 23 C44 23 54 30 55 40 C50 46 14 46 9 40 Z" fill="${C.yellowL}"/>` +
        K.dots([[15, 38], [20, 33], [26, 29], [34, 27], [42, 30], [48, 35], [50, 41], [22, 41], [30, 36], [40, 39], [36, 43], [17, 43]], 0.9, C.wheatD) +
        `<path d="M23 31 L35 24" stroke-width="5"/><path d="M23 31 L35 24" stroke="${C.orange}" stroke-width="2.6"/>` +
        `<path d="M33 36 L44 27" stroke-width="5"/><path d="M33 36 L44 27" stroke="${C.orange}" stroke-width="2.6"/>` +
        ell(21, 37, 4.4, 3, C.leaf, 1.6) + ell(21, 37, 2.8, 1.8, C.leafL, 0) + ell(43, 37, 4.4, 3, C.leaf, 1.6) + ell(43, 37, 2.8, 1.8, C.leafL, 0) +
        circ(30, 40, 2.2, C.wheat, 1.3) + circ(35, 42, 2.2, C.wheat, 1.3) + circ(50, 41, 2.1, C.wheat, 1.3) +
        `<path d="M26 28 C28 25 32 26 31 29 C30 31 27 31 26 28 Z" fill="${C.white}" stroke-width="1.4"/>` + K.line('M26.5 27.5 C27.5 26 29.5 26 30.5 27', 1.3, C.purple)),
    chicken_shawarma: () =>
      K.shadow(15) +
      `<g transform="rotate(12 32 34)">` +
      `<path d="M18 16 L46 16 L42 56 C42 58 40 59 38 59 H26 C24 59 22 58 22 56 Z" fill="${C.wheatL}"/>` +
      `<path d="M19 18 C22 11 30 9 36 10 C42 10 46 13 46 16 C40 19 24 19 19 18 Z" fill="${C.orange}" stroke-width="2"/>` +
      `<path d="M24 12 C26 9 29 9 30 11 M34 10.5 C36 8 40 9 41 11.5" stroke="${C.orangeD}" stroke-width="1.6"/>` +
      `<path d="M19 17 C22 14 25 18 28 15 C30 17 31 18 33 16 C36 18 38 15 41 17 C43 15 45 16 46 16" stroke="${C.leaf}" stroke-width="2.4"/>` +
      K.dots([[27, 12.5], [37, 13], [32, 11]], 1.3, C.white) +
      `<path d="M20.5 32 L45 30 L42 56 C42 58 40 59 38 59 H26 C24 59 22 58 22 56 Z" fill="${C.white}"/>` +
      K.line('M23 40 L43.5 38.5 M34 31 L36 58', 1.3, C.greyL) +
      K.hi('M22 20 L25 20 L25 30 L22.5 30.5 Z') + `</g>`,
    lahmacun: () =>
      K.plate(
        `<path d="M6 38 C6 30 18 25 32 25 C46 25 58 30 58 38 C58 46 46 50 32 50 C18 50 6 46 6 38 Z" fill="${C.wheat}" stroke-width="2"/>` +
        `<path d="M9 38 C9 31 20 27.5 32 27.5 C44 27.5 55 31 55 38 C55 44 44 47.5 32 47.5 C20 47.5 9 44 9 38 Z" fill="${C.redD}" stroke="none"/>` +
        K.dots([[15, 37], [22, 32], [30, 30], [40, 31], [48, 35], [50, 41], [40, 44], [28, 45], [18, 42], [33, 39]], 1.3, C.meatD) +
        K.dots([[19, 36], [27, 34], [37, 35], [44, 39], [25, 41]], 1, C.redL) +
        leaf(24, 37, -20, 9) + leaf(38, 39, 30, 9) + leaf(31, 33, 70, 8) +
        `<path d="M44 26 C49 22 57 24 58 29 L47 31 Z" fill="${C.yellow}" stroke-width="1.8"/>` + K.line('M47 26.5 C50 25 54 25.5 55.5 27.5', 1.3, C.yellowL)),
    kofta_kebab: () => {
      const skewer = (y) =>
        `<path d="M4 ${y + 7} L60 ${y - 9}" stroke-width="2.8"/><path d="M4 ${y + 7} L60 ${y - 9}" stroke="${C.woodL}" stroke-width="1.2"/>` +
        `<path d="M13 ${y + 5} C11 ${y + 1} 14 ${y - 2} 18 ${y - 3} L44 ${y - 10} C48 ${y - 11} 51 ${y - 9} 51 ${y - 5} C51 ${y - 2} 49 ${y} 46 ${y + 1} L20 ${y + 8} C17 ${y + 9} 14 ${y + 8} 13 ${y + 5} Z" fill="${C.brown}"/>` +
        K.line(`M22 ${y + 4} L20 ${y - 1} M30 ${y + 2} L28 ${y - 3} M38 ${y} L36 ${y - 5} M46 ${y - 2} L44 ${y - 7}`, 2, C.brownD) +
        K.hi(`M18 ${y - 1} L42 ${y - 7.5} L43 ${y - 6} L19 ${y} Z`);
      return K.plate(skewer(34) + skewer(46) +
        K.line('M12 28 C14 25 19 25 21 28 M14 30 C16 28 19 28 20 30', 1.8, C.purple) +
        leaf(50, 46, -20, 9) + leaf(55, 41, 30, 8));
    },
    mujaddara: () =>
      K.bowl(
        `<path d="M9 30 C10 21 20 16 32 16 C44 16 54 21 55 30 C46 34 18 34 9 30 Z" fill="${C.brownL}"/>` +
        K.dots([[14, 28], [19, 23], [26, 20], [34, 19], [42, 21], [48, 25], [24, 27], [32, 26], [40, 28], [50, 29], [18, 30], [36, 31]], 1.3, C.brownD) +
        [[17, 26, 20], [27, 23, -15], [38, 24, 10], [45, 28, -20], [30, 30, 5]].map(([x, y, r]) => ell(x, y, 1.8, 0.9, C.cream, 0, r)).join('') +
        `<path d="M18 22 C20 17 25 17 26 20 C27 16 32 14 34 18 C36 14 42 16 41 20 C44 18 48 20 46 24" stroke-width="4.6"/>` +
        `<path d="M18 22 C20 17 25 17 26 20 C27 16 32 14 34 18 C36 14 42 16 41 20 C44 18 48 20 46 24" stroke="${C.brownD}" stroke-width="2.2"/>` +
        `<path d="M24 26 C26 22 30 22 31 25 C33 22 37 22 38 26" stroke-width="4.4"/><path d="M24 26 C26 22 30 22 31 25 C33 22 37 22 38 26" stroke="${C.brown}" stroke-width="2"/>`,
        C.white, C.brownL),
    turkish_delight: () =>
      K.plate(
        cube(20, 38, 8, C.pinkL, C.pink, C.pinkD) + cube(44, 38, 8, C.pinkL, C.pink, C.pinkD) +
        cube(32, 44, 8, C.pinkL, C.pink, C.pinkD) + cube(32, 30, 8, C.pinkL, C.pink, C.pinkD) +
        `<path d="M24 46 L32 50 L40 46" fill="none" stroke="none"/>` +
        K.dots([[30, 46], [34, 49], [42, 41], [46, 39], [18, 40], [22, 42], [30, 33], [34, 35]], 0.9, C.leaf) +
        K.dots([[29, 24], [34, 25], [17, 32.5], [44, 33], [32, 38], [47, 32]], 0.9, C.white) +
        K.dots([[10, 46], [55, 45], [52, 30], [12, 32]], 1, C.white)),
    ful_medames: () =>
      K.bowl(
        `<path d="M9 30 C10 22 20 18 32 18 C44 18 54 22 55 30 C46 34 18 34 9 30 Z" fill="${C.brownD}"/>` +
        [[16, 27, 20], [22, 23, -10], [30, 21, 15], [38, 22, -20], [46, 25, 10], [26, 28, 30], [36, 28, -10], [49, 29, -25], [19, 31, 0]].map(([x, y, r]) =>
          ell(x, y, 3.2, 2.2, C.brown, 1.3, r) + ell(x - 0.8, y - 0.6, 1.2, 0.6, C.brownL, 0, r)).join('') +
        ell(31, 26, 5.5, 2.2, C.gold, 1.3) +
        K.dots([[33, 25.5], [29, 26.5]], 1, C.red) + K.dots([[42, 26], [23, 25], [44, 30]], 1.2, C.leafL) +
        `<path d="M40 13 C46 12 51 16 51 21 L41 20 Z" fill="${C.yellow}" stroke-width="1.8"/>` + K.line('M42 15.5 C45 15.5 48 17 49 19', 1.3, C.yellowL),
        C.blueL, C.brownD),
    fattoush: () =>
      K.bowl(
        `<path d="M8 30 C8 22 14 16 20 18 C22 13 30 12 34 15 C38 12 46 14 47 19 C53 19 57 25 56 30 C46 34 18 34 8 30 Z" fill="${C.leaf}"/>` +
        K.line('M14 26 L20 20 M30 22 L34 16 M42 23 L46 19', 1.5, C.leafD) +
        `<path d="M19 22 L29 19 L26 28 Z" fill="${C.wheat}" stroke-width="1.6"/><path d="M38 26 L48 24 L43 31 Z" fill="${C.wheat}" stroke-width="1.6"/>` +
        circ(34, 23, 3.6, C.white, 1.5) + `<path d="M30.5 22 C31 19 37 19 37.5 22" fill="${C.red}" stroke-width="1.4"/>` +
        `<path d="M10 28 C11 24 16 23 18 25 Z" fill="${C.red}" stroke-width="1.5"/>` +
        ell(27, 30, 3.6, 2.2, C.leafL, 1.4) + ell(48, 29, 3, 1.8, C.red, 1.4) +
        K.dots([[24, 24], [31, 27], [40, 21], [45, 27], [16, 30], [36, 30]], 1, C.purpleD),
        C.white, C.leafD),
    manakish_zaatar: () =>
      K.board(
        `<path d="M8 38 C8 30 18 25 31 25 C44 25 54 30 54 38 C54 46 44 50 31 50 C18 50 8 46 8 38 Z" fill="${C.wheat}"/>` +
        `<path d="M12.5 38 C12.5 32 21 28.5 31 28.5 C41 28.5 49.5 32 49.5 38 C49.5 43.5 41 47 31 47 C21 47 12.5 43.5 12.5 38 Z" fill="${C.leafD}" stroke-width="1.5"/>` +
        K.dots([[18, 36], [24, 32], [32, 31], [40, 33], [45, 38], [38, 43], [28, 44], [20, 41], [30, 37], [36, 38], [24, 38]], 1.2, C.pine) +
        K.dots([[21, 34], [35, 34], [42, 41], [27, 41], [33, 40]], 0.9, C.wheatL) +
        blob('M17 34 C20 31 25 30 28 30.5 C24 32 20 34 18 36 Z', C.gold) +
        K.dots([[10, 34], [16, 29], [50, 33], [52, 41], [45, 47]], 0.9, C.wheatD)),
    halloumi_salad: () =>
      K.plate(
        cube(17, 38, 7, C.red, C.redD, C.leaf) + K.dots([[15, 35], [19, 34.5]], 0.9, C.black) +
        cube(45, 40, 7, C.red, C.redD, C.leaf) + K.dots([[43, 37], [47, 36.5]], 0.9, C.black) +
        cube(30, 45, 6, C.red, C.redD, C.leaf) + K.dots([[29, 42.5]], 0.9, C.black) +
        [[24, 30, -12], [38, 31, 12]].map(([x, y, r]) =>
          `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 9}" y="${y - 5.5}" width="18" height="11" rx="2" fill="${C.creamL}"/>` +
          K.line(`M${x - 5} ${y - 4} L${x - 7} ${y + 4} M${x} ${y - 4} L${x - 2} ${y + 4} M${x + 5} ${y - 4} L${x + 3} ${y + 4}`, 2, C.brown) + `</g>`).join('') +
        leaf(30, 38, -30, 9) + leaf(52, 32, 40, 8) + leaf(10, 44, 10, 7)),
    persian_jeweled_rice: () =>
      K.plate(
        `<path d="M9 40 C10 28 20 20 32 20 C44 20 54 28 55 40 C50 46 14 46 9 40 Z" fill="${C.white}"/>` +
        K.dots([[15, 38], [22, 33], [41, 33], [48, 38], [30, 42], [38, 41], [20, 42]], 0.9, C.creamD) +
        blob('M22 26 C25 22 30 21 34 21 C40 21 44 24 45 28 C40 30 34 29 30 30 C26 31 22 29 22 26 Z', C.yellow) +
        circ(26, 27, 1.8, C.red, 1.2) + circ(36, 24, 1.8, C.red, 1.2) + circ(18, 36, 1.8, C.red, 1.2) + circ(44, 36, 1.8, C.red, 1.2) + circ(32, 37, 1.8, C.red, 1.2) +
        ell(31, 25, 2.2, 1.1, C.leaf, 1, 30) + ell(41, 30, 2.2, 1.1, C.leaf, 1, -30) + ell(24, 35, 2.2, 1.1, C.leaf, 1, 20) + ell(39, 40, 2.2, 1.1, C.leaf, 1, -20) +
        K.line('M28 31 L33 33 M45 33 L48 30 M14 40 L18 41', 1.8, C.orange) +
        ell(21, 30, 2.4, 1.1, C.creamL, 1, -40) + ell(48, 40, 2.4, 1.1, C.creamL, 1, 30) +
        K.hiE(18, 30, 3, 1.5)),
  });
})(FSI);
