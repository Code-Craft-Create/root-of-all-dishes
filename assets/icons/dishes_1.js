// Dishes 1: Everyday Basics, British & Irish, French.
(function (FSI) {
  const { C, K } = FSI;
  // ---- local helpers -------------------------------------------------------
  const P = (d, fill, x = '') => `<path d="${d}" fill="${fill}"${x}/>`;
  const E = (cx, cy, rx, ry, fill, rot = 0, x = '') =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}${x}/>`;
  const O = (cx, cy, r, fill, x = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${x}/>`;
  const R = (x, y, w, h, rx, fill, rot = 0, ex = '') =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${rot ? ` transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"` : ''}${ex}/>`;
  const G = (inner, tx = 0, ty = 0, rot = 0) => `<g transform="translate(${tx} ${ty}) rotate(${rot})">${inner}</g>`;
  const SW = (w) => ` stroke-width="${w}"`;
  // butter pat (small 3/4 square) centred at x,y
  const butter = (x, y, s = 1) =>
    P(`M${x - 6 * s} ${y} L${x} ${y - 3.5 * s} L${x + 6 * s} ${y} L${x} ${y + 3.5 * s} Z`, C.yellowL, SW(1.6)) +
    P(`M${x - 6 * s} ${y} V${y + 2 * s} L${x} ${y + 5.5 * s} L${x + 6 * s} ${y + 2 * s} V${y} L${x} ${y + 3.5 * s} Z`, C.yellow, SW(1.6));
  // stacked sandwich half: triangle top face A(6,y0) B(34,y0-14) C(54,y0+4); layers = [[fill, thickness], ...] from top
  const sandwich = (top, layers, y0 = 34, extra = '') => {
    const A = [6, y0], B = [32, y0 - 16], Cc = [56, y0 + 4];
    let t = 0, bands = '';
    for (const [f, h] of layers) {
      bands += P(`M${A[0]} ${A[1] + t} L${Cc[0]} ${Cc[1] + t} V${Cc[1] + t + h} L${A[0]} ${A[1] + t + h} Z`, f, SW(1.5));
      t += h;
    }
    return K.shadow(26, 58) + bands +
      P(`M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${Cc[0]} ${Cc[1]} Z`, top) +
      P(`M${A[0]} ${A[1]} L${Cc[0]} ${Cc[1]} V${Cc[1] + t} L${A[0]} ${A[1] + t} Z`, 'none') + extra;
  };
  const strawberry = (x, y, rot = 0) =>
    G(P('M-6 -2 C-6 -6 6 -6 6 -2 C6 3 3 7 0 8 C-3 7 -6 3 -6 -2 Z', C.red, SW(2)) +
      K.dots([[-2.5, 0], [2.5, 0], [0, 3.5]], 0.8, C.yellowL) +
      P('M-4 -4.5 L0 -3 L4 -4.5 L2 -6.5 L0 -5 L-2 -6.5 Z', C.leaf, SW(1.3)), x, y, rot);
  const friedEgg = (x, y, s = 1) =>
    G(P('M-10 1 C-12 -5 -6 -9 -1 -8 C4 -10 11 -7 10 -1 C13 3 8 8 2 7 C-3 9 -11 7 -10 1 Z', C.white) + O(0, -0.5, 4, C.yellow, SW(1.8)) + K.hiE(-1.3, -1.8, 1.4, 0.8, 0), x, y) ;
  const sausage = (x, y, len, rot, f = C.brown) =>
    G(R(-len / 2, -3.8, len, 7.6, 3.8, f) + K.hi(`M${-len / 2 + 3} -2.2 H${len / 2 - 3} V-0.8 H${-len / 2 + 3} Z`), x, y, rot);
  const bacon = (x, y, rot, len = 24) =>
    G(P(`M${-len / 2} -3 C${-len / 4} -7 ${-len / 4} 1 0 -3 C${len / 4} -7 ${len / 4} 1 ${len / 2} -3 V3 C${len / 4} 7 ${len / 4} -1 0 3 C${-len / 4} 7 ${-len / 4} -1 ${-len / 2} 3 Z`, C.meat) +
      K.line(`M${-len / 2 + 1} 0 C${-len / 4} -4 ${-len / 4} 4 0 0 C${len / 4} -4 ${len / 4} 4 ${len / 2 - 1} 0`, 1.6, C.fat), x, y, rot);
  const mash = (x, y, w = 14, h = 11) =>
    P(`M${x - w} ${y} C${x - w} ${y - h * 0.7} ${x - w * 0.5} ${y - h} ${x} ${y - h} C${x + w * 0.5} ${y - h} ${x + w} ${y - h * 0.7} ${x + w} ${y} C${x + w * 0.5} ${y + 3} ${x - w * 0.5} ${y + 3} ${x - w} ${y} Z`, C.creamL) +
    K.line(`M${x - w * 0.55} ${y - h * 0.45} C${x - w * 0.2} ${y - h * 0.8} ${x + w * 0.2} ${y - h * 0.5} ${x + w * 0.5} ${y - h * 0.65}`, 1.4, C.creamD);
  // bread slice outline (upright, centre 0,0, about 30 wide)
  const SLICE_O = 'M-15 9 V-6 C-19 -10 -15 -17 -8 -15 C-4 -19 4 -19 8 -15 C15 -17 19 -10 15 -6 V9 C15 11 13 12 11 12 H-11 C-13 12 -15 11 -15 9 Z';
  const SLICE_I = 'M-12.5 8 V-6.5 C-15 -9.5 -12.5 -13.5 -7.5 -12.5 C-4 -16 4 -16 7.5 -12.5 C12.5 -13.5 15 -9.5 12.5 -6.5 V8 C12.5 9 11.5 9.5 10.5 9.5 H-10.5 C-11.5 9.5 -12.5 9 -12.5 8 Z';
  const slice = (x, y, rot, crust, crumb, top = '') => G(P(SLICE_O, crust) + P(SLICE_I, crumb, ' stroke="none"') + top, x, y, rot);
  // round cake / cylinder side band between y a and b (cx 32, half-width w, ellipse ry)
  const band = (a, b, f, w = 26, ry = 9, cx = 32) =>
    P(`M${cx - w} ${a} V${b} C${cx - w} ${b + ry * 1.33} ${cx + w} ${b + ry * 1.33} ${cx + w} ${b} V${a} C${cx + w} ${a + ry * 1.33} ${cx - w} ${a + ry * 1.33} ${cx - w} ${a} Z`, f);
  // scale every number in a path (no arcs) by k, so shapes grow without thickening the outline
  const sc = (d, k) => d.replace(/-?\d+(\.\d+)?/g, (n) => +(n * k).toFixed(2));
  const steamOn = (m, x = 32, y = 12) => m + K.steam(x, y);

  FSI.add('dishes_1', {
    // ===== Everyday Basics ===================================================
    boiled_eggs: () =>
      K.shadow(27) +
      // egg in a cup
      P('M10 34 C10 18 15 7 22 7 C29 7 34 18 34 34 Z', C.cream) + K.hiE(17, 17, 2.5, 5, 15) +
      P('M8 32 H36 C36 42 31 47 22 47 C13 47 8 42 8 32 Z', C.teal) +
      P('M17 46 L15 54 C15 57 29 57 29 54 L27 46 Z', C.teal) +
      K.sh('M30 34 H36 C36 40 33 45 27 46.5 C31 43 31 38 30 34 Z') +
      // halved egg
      P('M33 46 C33 54 39 57.5 46 57.5 C53 57.5 59 54 59 46 Z', C.white) +
      E(46, 46, 13, 6, C.white) + E(46, 46, 6, 3.3, C.yellow, 0, SW(1.5)) + K.hiE(44, 45, 2, 1, 0),
    garden_salad: () =>
      K.bowl(
        P('M8 31 C5 23 12 17 18 21 C19 14 28 12 31 18 C34 11 44 12 45 19 C51 15 59 22 56 31 Z', C.leaf) +
        K.line('M14 27 L18 22 M38 22 L41 18 M48 26 L51 22', 1.5, C.leafD) +
        O(21, 26, 5.5, C.red) + P('M17 26 C18 23 24 23 25 26', C.redL, SW(1.3)) +
        O(40, 26, 6, C.leafD) + O(40, 26, 4.2, C.leafL, SW(1.2)) + K.dots([[38.5, 25], [41.5, 25], [40, 27.5]], 0.9, C.leafD) +
        O(31, 30, 4.8, C.leafD) + O(31, 30, 3.2, C.leafL, SW(1.2)),
        C.woodL, C.leafL),
    baked_potato: () =>
      K.plate(
        E(32, 35, 21, 12.5, C.brown) +
        P('M15 32 C19 25 27 28 32 24 C37 28 45 25 49 32 C45 38 19 38 15 32 Z', C.creamL) + K.line('M21 32 C25 30 27 34 31 31 M35 33 C38 31 41 33 43 31', 1.4, C.creamD) +
        P('M11 37 C12 47 22 51 32 51 C42 51 52 47 53 37 L49 41 L45 38 L41 42 L37 39 L33 43 L29 39 L25 42 L21 38 L17 41 Z', C.steel) +
        K.line('M20 45 L23 48 M40 46 L44 44', 1.2, C.greyD) +
        butter(32, 28, 1.05) + K.hiE(17, 31, 3, 1.6)),
    porridge: () =>
      K.bowl(
        P('M9 30 C12 21 21 16 32 16 C43 16 52 21 55 30 Z', C.cream) +
        K.dots([[17, 26], [24, 21], [44, 23], [49, 27], [27, 27], [38, 19.5]], 1.2, C.creamD) +
        P('M27 21 C27 17 43 17 43 21 C43 23 40 24 39 24 C39 28 36 28 36 25 C33 25 27 24 27 21 Z', C.gold, SW(1.8)) +
        K.line('M14 28 C18 24.5 22 27 25 24.5', 2.2, C.gold) + K.hiE(32, 19.5, 2.5, 0.9, 0),
        C.white, C.cream),
    scrambled_eggs: () =>
      K.plate(
        P('M13 39 C9 34 14 28 20 30 C21 24 29 23 32 27 C35 22 44 24 44 29 C50 27 55 33 51 38 C54 43 47 47 42 45 C38 49 30 49 27 45 C22 48 14 45 16 41 Z', C.yellow) +
        K.line('M21 33 C24 31 27 33 28 36 M36 31 C39 30 42 32 42 35 M24 41 C27 39 31 40 32 43 M43 39 C45 38 47 39 48 40', 1.5, C.yellowD) +
        K.hiE(22, 30, 3, 1.5) + K.hiE(36, 27, 3, 1.3) +
        K.dots([[30, 34], [38, 37], [25, 38], [45, 34]], 0.9)),
    omelette: () =>
      K.plate(
        P('M8 39 C11 29 25 23 40 24 C50 25 57 31 55 39 C44 46 20 46 8 39 Z', C.yellow) +
        P('M9 39 C22 35 42 35 55 39 C44 46 20 46 9 39 Z', C.yellowD, SW(1.6)) +
        K.hi('M16 32 C22 27 30 26 36 26 C30 28 23 30 18 34 Z') +
        K.line('M20 30 l3 -2 M29 28 l3 -1.5 M38 28 l3 0 M45 31 l2 -2 M25 33 l3 -1 M34 32 l3 0.5', 2.2, C.leafD)),
    fruit_salad: () =>
      K.bowl(
        P('M30 29 C31 20 39 16 46 18 C45 24 38 29 30 29 Z', C.creamL) + K.line('M31 27 C33 21 39 17.5 45 18.5', 2.6, C.red) +
        R(42, 21, 10, 8, 2, C.yellowL, -15) + K.line('M42.5 22.5 L51.5 20', 2.2, C.leaf) +
        strawberry(19, 23, -20) + strawberry(29, 24, 15) +
        O(15, 30, 3.2, C.purple, SW(1.6)) + O(48, 31, 3.2, C.purple, SW(1.6)),
        C.glass, C.yellowL),
    mashed_potatoes: () =>
      K.bowl(
        P('M11 31 C12 21 21 13 32 13 C43 13 52 21 53 31 Z', C.creamL) +
        K.line('M18 26 C22 21 30 19 34 22 M28 29 C32 26 40 25 45 27', 1.6, C.creamD) +
        P('M27 15 L35 13 L39 18 L31 20 Z', C.yellowL, SW(1.6)) + P('M31 20 L39 18 C40 21 37 23 36 21 C34 23 32 23 31 20 Z', C.yellow, SW(1.4)) +
        K.dots([[22, 30], [42, 30], [36, 28]], 0.9),
        C.blueL, C.creamL),
    corn_on_the_cob: () =>
      K.plate(
        `<g transform="rotate(-16 32 36)">` +
        R(4, 34, 8, 4, 1.5, C.brown) + R(52, 34, 8, 4, 1.5, C.brown) +
        E(32, 36, 21, 9, C.yellow) +
        K.line('M14 32 H50 M12 36 H52 M14 40 H50', 1.3, C.yellowD) +
        K.line('M18 28.5 V43.5 M24 27.5 V44.5 M30 27 V45 M36 27 V45 M42 27.5 V44.5 M47 29 V43', 1.3, C.yellowD) +
        K.hi('M16 30 C22 28 36 27 46 28.5 L46 31 C36 30 24 31 16 32 Z') +
        `</g>` + butter(30, 30, 1)),
    grilled_cheese_sandwich: () =>
      sandwich(C.wheat,
        [[C.wheatL, 4], [C.orange, 4], [C.wheatL, 5]], 36,
        K.line('M14 33 L29 25 M22 35 L37 26 M30 36 L45 30', 2, C.wheatD) +
        P('M18 45 C18 49 21 49 21 46 M36 47 C36 52 39 52 39 48 M47 48 C47 51 49 51 49 49', C.orange, SW(1.5)) +
        K.hi('M12 33 L30 22 L31 24 L15 33 Z')),
    ham_cheese_sandwich: () =>
      sandwich(C.creamL,
        [[C.wheatL, 4], [C.yellow, 2.5], [C.pink, 4.5], [C.wheatL, 4]], 33,
        P('M6 39.5 C3 41 3 43 6 44 M56 43.5 C59 45 59 47 56 48', C.pink, SW(1.5)) +
        P('M10 31.5 L32 18 L50 35 Z', 'none', ` stroke="${C.wheat}" stroke-width="1.5"`) +
        K.hi('M12 31 L30 20 L31 22 L15 31 Z')),
    pancakes: () => {
      const cake = (y) => P(`M13 ${y} V${y + 4} C13 ${y + 8} 22 ${y + 10} 32 ${y + 10} C42 ${y + 10} 51 ${y + 8} 51 ${y + 4} V${y} Z`, C.wheat) +
        E(32, y, 19, 6, C.brownL);
      return K.plate(
        cake(40) + cake(33) + cake(26) +
        P('M22 25 C22 21 42 21 42 25 C42 28 38 28 37 30 V37 C37 39 34.5 39 34.5 37 V31 C30 31 22 29 22 25 Z', C.orangeD, SW(1.8)) +
        K.hiE(28, 24, 3, 1, 0) + butter(32, 22, 0.9));
    },
    french_toast: () => {
      const slice = (x, y, rot, top) => G(
        P('M-15 9 V-6 C-19 -10 -15 -17 -8 -15 C-4 -19 4 -19 8 -15 C15 -17 19 -10 15 -6 V9 C15 11 13 12 11 12 H-11 C-13 12 -15 11 -15 9 Z', C.brown) +
        P('M-12.5 8 V-6.5 C-15 -9.5 -12.5 -13.5 -7.5 -12.5 C-4 -16 4 -16 7.5 -12.5 C12.5 -13.5 15 -9.5 12.5 -6.5 V8 C12.5 9 11.5 9.5 10.5 9.5 H-10.5 C-11.5 9.5 -12.5 9 -12.5 8 Z', C.yellow, ' stroke="none"') +
        top, x, y, rot);
      return K.plate(
        slice(23, 34, -18, K.dots([[-6, -6], [2, -9], [6, 2], [-4, 4]], 1.1, C.brownD)) +
        slice(40, 38, 14, K.dots([[-5, -7], [3, -5], [7, 3], [-6, 3], [0, 6]], 1.1, C.brownD) + K.dots([[-2, -2], [5, -10], [-8, -3], [3, 3]], 1.3, C.white) + K.hiE(-6, -8, 3, 1.3)));
    },
    waffles: () =>
      K.plate(
        P('M9 37 L32 25 L55 37 V41 L32 53 L9 41 Z', C.wheatD) +
        P('M9 37 L32 25 L55 37 L32 49 Z', C.wheat) +
        K.line('M14.75 34 L37.75 46 M20.5 31 L43.5 43 M26.25 28 L49.25 40 M14.75 40 L37.75 28 M20.5 43 L43.5 31 M26.25 46 L49.25 34', 1.6, C.wheatD) +
        K.line('M32 49 V53', 1.6) +
        K.dots([[20, 37], [26, 34], [38, 33], [44, 37], [32, 43], [26, 40], [38, 41]], 1.1, C.white) + butter(32, 35, 0.85)),
    crepes: () => {
      const fold = (x, y, rot) => G(
        P('M0 10 L-14 -12 C-6 -16 6 -16 14 -12 Z', C.wheatL) + P('M0 10 L-14 -12 C-8 -8 8 -8 14 -12 Z', C.wheat, SW(1.6)) +
        K.dots([[-3, -11], [5, -12], [-7, -13]], 1.2, C.wheatD) + K.dots([[0, -5], [-4, -1], [4, -6]], 1.2, C.wheatD), x, y, rot);
      return K.plate(fold(21, 36, -30) + fold(42, 36, 30) + butter(32, 43, 0.8));
    },
    vegetable_soup: () =>
      steamOn(K.bowl(
        O(17, 30, 3.2, C.orange, SW(1.5)) + O(39, 27, 3.2, C.orange, SW(1.5)) + O(28, 33, 3, C.orange, SW(1.5)) +
        R(23, 24.5, 5, 4.5, 1, C.cream, 10, SW(1.5)) + R(44, 29, 5, 4.5, 1, C.cream, -10, SW(1.5)) +
        O(31, 26, 3.4, C.leafL, SW(1.5)) + O(31, 26, 1.4, C.cream, SW(1)) + O(48, 25.5, 2.5, C.leaf, SW(1.5)) +
        O(14, 25.5, 2.3, C.leaf, SW(1.4)),
        C.white, C.orangeL), 32, 12),
    roasted_vegetables: () => {
      const root = (x, y, rot, f, d) => G(P('M-13 -4 C-4 -5 6 -3 13 -0.5 C14.5 0.5 14.5 1.5 13 2 C6 4 -4 5 -13 4 C-15 3 -15 -3 -13 -4 Z', f) + K.line('M-6 -2 l1.5 2.5 M3 -1.5 l1.5 2.5', 1.3, d), x, y, rot);
      const beet = (x, y, rot) => G(P('M-7 -5 C-2 -8 6 -7 7 -1 C8 5 2 7 -3 6 C-8 5 -10 -2 -7 -5 Z', C.purple) + P('M-5 -4 C-2 -6 3 -5.5 4 -2', 'none', ` stroke="${C.purpleL}" stroke-width="1.6"`), x, y, rot);
      return K.plate(
        root(22, 41, 20, C.creamL, C.wheatD) + root(41, 43, -18, C.orange, C.orangeD) + root(23, 30, -12, C.orange, C.orangeD) +
        beet(43, 30, 10) + beet(32, 40, -20) +
        K.line('M26 22 C32 22 40 23 46 21', 1.8, C.pine) +
        K.line('M30 22 l-2 -3 M34 22.3 l-1 -3.5 M38 22.5 l0 -3.5 M42 22 l1 -3.2 M30 22 l-1.5 3 M34 22.3 l-0.5 3.2 M38 22.5 l0.5 3.2 M42 22 l1.5 3', 1.6, C.leafD));
    },
    bircher_muesli: () =>
      K.bowl(
        P('M9 30 C12 25 21 22 32 22 C43 22 52 25 55 30 Z', C.creamL) +
        K.dots([[14, 28], [20, 25.5], [27, 27.5], [44, 24.5], [50, 28], [37, 28.5]], 1.4, C.wheat) +
        P('M17 27 C18 20 24 16 30 17 C29 22 24 26 17 27 Z', C.creamL) + K.line('M18 25.5 C19.5 20 24 17.5 29.5 17.5', 2.6, C.red) +
        P('M33 25 C34 18 40 15 46 16 C45 21 40 25 33 25 Z', C.creamL) + K.line('M34 23.5 C35.5 18 40 16 45.5 16.5', 2.6, C.leaf) +
        O(28, 24, 3.3, C.brown, SW(1.6)) + O(42, 28, 3.3, C.brown, SW(1.6)) + P('M25.2 23 C26 20 30 20 30.8 23', C.brownL, SW(1.2)),
        C.blue, C.creamL),
    smoothie: () =>
      K.glass(C.pink, 'tumbler',
        P('M37 30 L44 3 L48 4 L41 30 Z', C.white, SW(2)) + K.line('M38.5 24 L45 25.5 M40.3 17 L46.5 18.5 M42 10 L48 11.5', 2.2, C.red) +
        P('M18.5 22 H45.5 L45.2 26 C40 28 36 24 32 26 C28 28 24 24 18.8 26 Z', C.pinkL, ' stroke="none"') +
        strawberry(19, 9, -25) + P('M47 17 A6 6 0 0 1 41 11 H47 Z', C.yellowL, SW(1.8))),
    avocado_toast: () =>
      K.board(
        E(25, 39, 17, 10, C.brown, -12) + E(25, 38, 14, 7.5, C.wheatL, -12, ' stroke="none"') +
        P('M14 38 C14 33 22 31 28 32 C34 31 38 35 36 39 C35 43 26 45 20 44 C16 43 14 41 14 38 Z', C.leafL, SW(1.8)) +
        K.dots([[19, 37], [26, 35], [31, 39], [23, 41], [29, 34]], 1.2, C.red) + K.dots([[22, 36], [32, 36]], 1, C.leaf) +
        G(P('M0 -14 C7 -14 10 -5 10 2 C10 9 6 13 0 13 C-6 13 -10 9 -10 2 C-10 -5 -7 -14 0 -14 Z', C.leafD) +
          P('M0 -10.5 C4.5 -10.5 7 -4 7 2 C7 7 4 10 0 10 C-4 10 -7 7 -7 2 C-7 -4 -4.5 -10.5 0 -10.5 Z', C.yellowL, SW(1.5)) +
          O(0, 3, 4.5, C.brown), 47, 31, 60)),

    // ===== British & Irish ===================================================
    full_english_breakfast: () =>
      K.plate(
        bacon(42, 29, -12, 22) +
        sausage(37, 44, 22, -8) + sausage(42, 38, 20, -14) +
        P('M8 38 C8 33 14 32 18 33 C22 33 25 36 24 40 C23 45 16 47 12 45 C9 44 8 41 8 38 Z', C.orange) +
        K.dots([[13, 37], [17, 36], [20, 39], [15, 41], [11, 40], [19, 43]], 1.5, C.orangeD) +
        friedEgg(22, 29) + O(53, 41, 4.5, C.red, SW(1.8)) + O(53, 41, 2, C.redL, ' stroke="none"')),
    eggs_benedict: () => {
      const k = 1.3;
      const stack = (x, y) => G(
        P(sc('M-11 4 V8 C-11 11.5 11 11.5 11 8 V4 Z', k), C.wheat) + E(0, 4 * k, 11 * k, 4 * k, C.wheatL) +
        P(sc('M-12 2 C-12 -2 12 -2 12 2 C12 6 -12 6 -12 2 Z', k), C.pink) +
        P(sc('M-8 2 C-8 -10 8 -10 8 2 C8 4 -8 4 -8 2 Z', k), C.white) +
        P(sc('M-8 -2 C-6 -9 6 -9 8 -2 C8 1 6.5 4 5.5 1.5 C4 -0.5 1 3 -0.5 0 C-2.5 -1.5 -5 2.5 -6.5 0.5 C-7.5 -0.5 -8 -1 -8 -2 Z', k), C.yellow, SW(1.8)) +
        K.hiE(-3, -6.5, 2.6, 1.2, -20) + K.dots([[2.5, -6.5], [-5, -4]], 1, C.red), x, y);
      return K.plate(stack(19, 32) + stack(44, 36));
    },
    blt_sandwich: () =>
      sandwich(C.wheat, [[C.wheatL, 4], [C.meat, 3], [C.red, 3.5], [C.leaf, 3], [C.wheatL, 4]], 34,
        K.line('M7.5 44 C5 45 4 47 6 48 M55.5 48 C58 50 58 52 56 52.5', 2.4, C.leaf) +
        K.line('M8 39.5 l46 4', 1.2, C.fat) + O(28, 46, 1.6, C.redL, ' stroke="none"') +
        K.hi('M12 31 L30 20 L31 22 L15 31 Z')),
    club_sandwich: () =>
      sandwich(C.wheatL, [[C.wheatL, 3.5], [C.creamD, 3], [C.leaf, 2.5], [C.wheatL, 3], [C.meat, 2.5], [C.red, 3], [C.wheatL, 3.5]], 30,
        P('M10.5 28 L32 14.5 L51 32 Z', 'none', ` stroke="${C.wheat}" stroke-width="1.5"`) +
        K.line('M31 22 L30 7', 2.2) + P('M30 8 C26 4 34 2.5 32 6 C36 4 36 11 30 8 Z', C.red, SW(1.4))),
    fish_and_chips: () =>
      K.plate(
        [[40, 40, -60], [45, 41, -75], [50, 39, -65], [36, 44, -80], [44, 46, -95], [52, 45, -100]]
          .map(([x, y, r]) => R(x - 2.5, y - 9, 5, 18, 1, C.yellowL, r + 90, SW(1.8))).join('') +
        P('M6 31 C10 24 22 20 32 22 C36 23 38 25 39 27 L46 21 C48 25 48 33 46 37 L39 32 C36 37 26 41 16 40 C9 39 5 35 6 31 Z', C.wheat) +
        K.line('M14 27 C16 26 18 27 19 26 M24 24.5 C26 24 28 25 30 24 M15 35 C17 36 20 35 22 36 M27 35 C29 36 32 35 34 34', 1.5, C.wheatD) +
        K.hiE(16, 29, 4, 1.6) + O(12, 30, 1.3, C.ink, ' stroke="none"')),
    shepherds_pie: () =>
      K.plate(
        P('M10 30 L32 38 V52 L10 44 Z', C.brownD) + P('M32 38 L54 30 V44 L32 52 Z', C.brown) +
        P('M10 30 L32 38 V43 L10 35 Z M32 38 L54 30 V35 L32 43 Z', C.creamL, SW(1.6)) +
        K.dots([[16, 41], [24, 44], [20, 46], [38, 46], [46, 41], [43, 46]], 1.8, C.leaf) + K.dots([[27, 47], [49, 39]], 1.6, C.orange) +
        P('M10 30 L32 22 L54 30 L32 38 Z', C.wheatL) +
        K.line('M16 30 L32 24.5 M21 32 L37 26.5 M27 34 L43 28.5 M33 35.5 L48 30', 1.5, C.wheatD) +
        K.sh('M32 38 L54 30 V44 L32 52 Z')),
    cottage_pie: () =>
      K.pot(
        P('M9 27 C10 16 20 12 32 12 C44 12 54 16 55 27 C50 31 14 31 9 27 Z', C.wheatL) +
        K.line('M15 23 C18 19 22 17 26 16 M21 26 C25 21 30 19 36 18 M30 27 C34 23 40 21 46 21 M42 27 C45 25 48 24 51 24', 1.8, C.wheatD) +
        K.hiE(20, 18, 3, 1.4), C.blue),
    beef_wellington: () =>
      K.board(
        P('M43 24 L15 31 C8 33 7 46 13 48 L43 47 Z', C.wheat) +
        K.line('M14 34 L21 46 M20 32.5 L27 46 M26 31 L33 45.5 M32 29.5 L38 45 M18 46 L24 32 M25 46 L31 30.5 M32 45.5 L37 29', 1.4, C.wheatD) +
        K.hi('M15 33 L40 26.5 L40 28.5 L15 35 Z') +
        E(43, 35.5, 9, 11.5, C.wheat) + E(43, 35.5, 7, 9.3, C.brownD, 0, SW(1.5)) + E(43, 35.5, 5.6, 7.8, C.meatD, 0, ' stroke="none"') +
        E(43, 35.5, 4.6, 6.5, C.meat, 0, ' stroke="none"') + E(43, 35.5, 2.6, 4, C.pinkL, 0, ' stroke="none"')),
    roast_chicken: () =>
      K.plate(
        P('M12 31 C10 25 16 19 26 18 C36 17 46 21 48 28 C50 35 44 41 32 42 C20 43 13 38 12 31 Z', C.orange) +
        G(P('M-6 -4 C0 -9 10 -6 10 0 C10 5 3 7 -3 5 L-9 9 C-11 10 -13 8 -12 6 Z', C.orange) + O(-12.5, 7.5, 2, C.creamL, SW(1.6)) + O(-10.5, 9.5, 2, C.creamL, SW(1.6)), 42, 40, 200) +
        G(P('M-6 -4 C0 -9 10 -6 10 0 C10 5 3 7 -3 5 L-9 9 C-11 10 -13 8 -12 6 Z', C.orange) + O(-12.5, 7.5, 2, C.creamL, SW(1.6)) + O(-10.5, 9.5, 2, C.creamL, SW(1.6)), 30, 42, 210) +
        K.line('M20 24 C25 22 32 22 36 24', 1.5, C.orangeD) + K.hiE(22, 23, 5, 2) +
        P('M8 42 C8 37 17 37 17 42 Z', C.yellow) + P('M10 42 C10 39 15 39 15 42 Z', C.yellowL, SW(1.2)) +
        K.line('M50 45 l6 -5 M52 43.5 l-1 -3 M54 41.8 l-0.5 -3 M52 43.5 l3 1 M54 41.8 l2.5 1', 1.6, C.leafD)),
    roast_beef_yorkshire_pudding: () =>
      K.plate(
        E(22, 43, 15, 6, C.brownD, -5) + 
        E(19, 34, 12, 8, C.brown, -20) + E(19, 34, 9.5, 6, C.meatL, -20, SW(1.3)) +
        E(25, 41, 12, 8, C.brown, -10) + E(25, 41, 9.5, 6, C.meatL, -10, SW(1.3)) + K.line('M19 40 C22 39 27 41 30 40', 1.2, C.meat) +
        P('M35 36 C33 27 38 21 44 23 C48 18 56 22 56 29 C59 33 56 40 51 40 H40 C37 40 35 39 35 36 Z', C.wheat) +
        E(46, 30, 6.5, 3.5, C.brownD, 0, SW(1.6)) + K.hiE(39, 27, 1.5, 3, 15) + K.sh('M54 30 C57 34 55 39 51 40 H46 C51 38 54 35 54 30 Z')),
    scones_with_jam_cream: () => {
      const scone = (x, y, cream) => G(
        P('M-11 0 V5 C-11 9.5 11 9.5 11 5 V0 Z', C.wheat) + K.line('M-9 5 C-4 7 4 7 9 5', 1.3, C.wheatD) +
        E(0, 0, 11, 4.5, C.cream) +
        (cream ? P('M-8 -1 C-10 -5 -4 -8 0 -6 C4 -9 10 -5 8 -1 C5 2 -5 2 -8 -1 Z', C.white) + P('M-4 -4 C-4 -8 4 -8 4 -4 C2 -2 -2 -2 -4 -4 Z', C.red, SW(1.6))
          : E(0, -0.5, 8.5, 3, C.red, 0, SW(1.6)) + P('M-5 -2 C-6 -6 -1 -9 2 -7 C6 -8 7 -3 5 -1.5 C2 0 -2 0 -5 -2 Z', C.white) + K.hiE(-1, -5, 2, 1, -10)), x, y);
      return K.plate(scone(21, 35, false) + scone(42, 39, true) + strawberry(47, 26, 20));
    },
    apple_pie: () =>
      K.shadow(26) +
      P('M8 34 L12 50 C13 54 51 54 52 50 L56 34 Z', C.steel) + K.line('M10 41 C20 45 44 45 54 41', 1.2, C.greyD) +
      E(32, 32, 26, 12, C.wheat) + E(32, 32, 21, 9, C.yellowL, 0, SW(1.6)) +
      K.dots([[17, 31], [27, 27], [37, 37], [46, 31], [25, 36], [40, 26]], 1.2, C.yellowD) +
      `<path d="M22 24.1 V39.9 M32 23 V41 M42 24.1 V39.9 M13.2 28 H50.8 M13.2 36 H50.8" stroke-width="5.5"/>` +
      `<path d="M22 24.1 V39.9 M32 23 V41 M42 24.1 V39.9 M13.2 28 H50.8 M13.2 36 H50.8" stroke="${C.wheat}" stroke-width="3"/>` +
      K.dots([[9, 30], [12, 37], [18, 41.5], [26, 43.5], [34, 44], [42, 42.5], [49, 39.5], [54.5, 34], [55, 28], [50, 23], [42, 20.5], [32, 20], [22, 21], [14, 24]], 1.2, C.wheatD) +
      K.hiE(17, 25, 4, 1.6),
    sticky_toffee_pudding: () =>
      K.plate(
        E(32, 44, 22, 7, C.creamL, 0, SW(1.6)) +
        P('M17 27 L32 33 V48 L17 42 Z', C.brownD) + P('M32 33 L47 27 V42 L32 48 Z', C.brown) +
        P('M17 27 L32 21 L47 27 L32 33 Z', C.brown) +
        P('M16 27 C20 20 44 20 48 27 V30 C48 33 46 33 46 30 C44 32 41 34 40 31 C38 36 35 36 35 33 C32 34 30 33 29 31 C27 36 24 36 24 32 C21 33 19 33 18 31 C17 33 16 32 16 30 Z', C.orangeD) +
        K.hiE(26, 25, 4, 1.4) + K.sh('M32 33 L47 27 V42 L32 48 Z')),
    victoria_sponge: () =>
      K.shadow(27) +
      band(24, 48, C.wheat) + band(32, 37, C.white) + band(36, 39.5, C.red, 26, 9) +
      E(32, 24, 26, 9, C.wheatL) +
      K.dots([[18, 22], [24, 26], [30, 20], [36, 25], [42, 21], [47, 26], [22, 19], [40, 28], [13, 25], [51, 22]], 1.3, C.white) +
      K.hi('M9 29 L12 30.5 L12 44 L9 42 Z') + K.sh('M52 32 L58 24 V48 C58 50 56 52 52 53.5 Z'),
    trifle: () => {
      const xl = (y) => 17.2 + (y - 10) * 3 / 45, xr = (y) => 46.8 - (y - 10) * 3 / 45;
      const lay = (a, b, f) => P(`M${xl(a)} ${a} H${xr(a)} L${xr(b)} ${b} H${xl(b)} Z`, f, ' stroke="none"');
      return K.glass(C.wheat, 'tumbler',
        lay(14, 24, C.white) + lay(24, 34, C.yellow) + lay(34, 42, C.red) + lay(42, 44, C.redD) +
        K.line('M18 24 C24 22 28 26 34 24 C38 22 42 26 46 24 M18 34 C22 32 28 36 34 34 C38 32 42 36 46 34 M19 42 H45', 1.4) +
        P('M22 38 C22 35 28 35 28 38 C28 41 25 42 25 42 C25 42 22 41 22 38 Z', C.redL, SW(1.3)) +
        P('M38 38 C38 35 44 35 44 38 C44 41 41 42 41 42 C41 42 38 41 38 38 Z', C.redL, SW(1.3)) +
        P('M17 10 H47 L46.6 16 C42 19 38 14 32 16 C26 18 22 14 17.4 16 Z', C.white, ' stroke="none"') +
        P('M17 10 H47 L44 55 C44 57 42 58 40 58 H24 C22 58 20 57 20 55 Z', 'none') +
        P('M22 13 C22 6 42 6 42 13 Z', C.white) + strawberry(32, 10, 0));
    },
    kedgeree: () =>
      K.plate(
        P('M8 38 C8 29 20 25 32 25 C44 25 56 29 56 38 C56 45 44 48 32 48 C20 48 8 45 8 38 Z', C.yellowL) +
        K.dots([[14, 38], [20, 33], [28, 30], [38, 31], [47, 34], [51, 40], [24, 44], [36, 43], [44, 44], [16, 42]], 1.1, C.yellowD) +
        G(P('M-9 3 C-9 -6 9 -6 9 3 Z', C.white) + P('M-5 3 C-5 -2 5 -2 5 3 Z', C.yellow, SW(1.6)), 20, 36, -10) +
        G(P('M-9 3 C-9 -6 9 -6 9 3 Z', C.white) + P('M-5 3 C-5 -2 5 -2 5 3 Z', C.yellow, SW(1.6)), 42, 41, 12) +
        P('M28 32 C30 28 36 28 37 31 L40 36 C36 38 31 38 28 36 Z', C.orangeL, SW(1.8)) + K.line('M31 31 L33 36 M34 30 L36 35', 1.2, C.orange) +
        K.dots([[16, 30], [26, 42], [47, 31], [36, 45], [51, 37]], 1.6, C.leaf)),
    cornish_pasty: () =>
      K.shadow(26) +
      P('M5 50 C4 34 17 20 32 20 C47 20 60 34 59 50 C59 54 55 55 50 55 H14 C9 55 5 54 5 50 Z', C.wheat) +
      K.sh('M50 30 C56 36 59 43 59 50 C59 54 55 55 50 55 H38 C48 52 53 42 50 30 Z') +
      P('M8 40 C12 27 22 21 32 21 C42 21 52 27 56 40', 'none', ` stroke="${C.wheatD}" stroke-width="7"`) +
      P('M8 40 C12 27 22 21 32 21 C42 21 52 27 56 40', 'none', ` stroke="${C.wheat}" stroke-width="4"`) +
      K.line('M9 37 l3 1 M11.5 32 l3 1.5 M14.5 28 l2.8 2 M18.5 25 l2.5 2.4 M23 22.8 l1.8 2.8 M28 21.5 l1 3 M33 21.2 l0 3.2 M38 21.8 l-1 3 M43 23.4 l-1.8 2.8 M47.5 26 l-2.4 2.4 M51 29.5 l-2.8 2 M54 34 l-3 1.5 M55.5 38.5 l-3 1', 1.4, C.wheatD) +
      K.hiE(18, 38, 5, 2.4) + K.line('M28 42 l4 -2 M34 44 l4 -2', 1.5, C.wheatD),
    bangers_and_mash: () =>
      K.plate(
        P('M8 38 C8 33 18 32 28 34 C38 32 52 32 56 38 C56 44 46 48 32 48 C18 48 8 44 8 38 Z', C.brown) +
        mash(25, 37, 15, 14) +
        sausage(38, 32, 26, -28, C.brownL) + sausage(42, 40, 26, -18, C.brownL) +
        P('M10 43 C11 40 15 40 16 43 C15 46 11 46 10 43 Z', C.brownD, ` stroke="${C.creamD}" stroke-width="1.5"`) +
        P('M45 49 C46 46 50 46 51 49 C50 52 46 52 45 49 Z', C.brownD, ` stroke="${C.creamD}" stroke-width="1.5"`) +
        K.dots([[19, 30], [28, 27]], 0.9)),
    welsh_rarebit: () =>
      K.board(
        slice(21, 39, -14, C.brown, C.wheatL,
          P('M-10 7 V-5 C-12 -8 -10 -12 -6 -11 C-3 -14 3 -14 6 -11 C10 -12 12 -8 10 -5 V7 Z', C.orange, SW(1.6)) +
          K.dots([[-5, -6], [3, -9], [5, 2], [-4, 4], [0, -2]], 1.6, C.brownD) + K.hiE(-6, -2, 1.5, 3, 0)) +
        slice(43, 34, 12, C.brown, C.wheatL,
          P('M-10 7 V-5 C-12 -8 -10 -12 -6 -11 C-3 -14 3 -14 6 -11 C10 -12 12 -8 10 -5 V7 Z', C.orange, SW(1.6)) +
          K.dots([[-5, -5], [4, -8], [6, 3], [-3, 5], [1, -1]], 1.6, C.brownD) + K.hiE(-6, -2, 1.5, 3, 0))),
    irish_stew: () =>
      steamOn(K.pot(
        E(32, 26.5, 21, 4, C.creamD, 0, ' stroke="none"') +
        R(14, 20, 9, 7, 2.5, C.cream, -10) + R(37, 19, 9, 7, 2.5, C.cream, 12) +
        R(25, 21, 9, 6.5, 2, C.brown, 6) + R(44, 22.5, 7, 5, 2, C.brown, -6) +
        O(33, 23, 3, C.orange, SW(1.6)) + O(20, 25.5, 2.6, C.orange, SW(1.6)) +
        K.line('M28 18 l3 -2 M29.5 17 l-1 -2.5', 1.5, C.leafD), C.leafD), 32, 12),
    smoked_salmon_bagel: () =>
      K.shadow(27) +
      // back half: plain bagel top
      P('M30 22 V26 C30 32 58 32 58 26 V22 Z', C.wheatD) + E(44, 22, 14, 7, C.wheat) + E(44, 21.5, 4, 1.8, C.white) +
      K.dots([[37, 20], [41, 24.5], [49, 24], [51, 19.5], [44, 17.5]], 0.9, C.creamL) + K.hiE(36, 19.5, 3, 1.2) +
      // front half: open face
      P('M5 40 V45 C5 55 47 55 47 45 V40 Z', C.wheat) + E(26, 40, 21, 10, C.creamL) +
      `<g transform="translate(26 40.5) scale(0.82) translate(-26 -40)">` +
      P('M10 41 C8 36 14 33 19 34 C22 30 30 30 33 33 C38 31 44 35 42 40 C44 44 36 48 30 46 C25 49 16 48 14 45 C10 46 8 43 10 41 Z', C.orangeL) +
      K.line('M14 40 C18 37 22 41 26 38 M28 42 C32 39 36 42 39 39 M18 44 C21 42 24 45 27 43', 1.5, C.orange) +
      E(22, 38.5, 4, 2.4, 'none', 0, ` stroke="${C.purple}" stroke-width="1.8"`) + E(34, 42.5, 4, 2.4, 'none', 0, ` stroke="${C.purple}" stroke-width="1.8"`) +
      K.line('M28 35 l3 -1 M29 35 l0 -2 M14 44 l2 -3 M15 43 l-2 -1', 1.6, C.leafD) + `</g>`,

    // ===== French ============================================================
    croissants: () => {
      const seg = (x, y, rx, ry, rot, f) => E(x, y, rx, ry, f, rot);
      return K.plate(
        seg(9.5, 41, 5.5, 3.6, 55, C.wheatD) + seg(54.5, 41, 5.5, 3.6, -55, C.wheatD) +
        seg(15, 35, 7.5, 5.5, 50, C.wheat) + seg(49, 35, 7.5, 5.5, -50, C.wheat) +
        seg(23, 29.5, 9, 7.5, 35, C.wheat) + seg(41, 29.5, 9, 7.5, -35, C.wheat) +
        E(32, 28, 9, 10.5, C.wheat) + K.hiE(28, 23, 3, 1.6, -20) +
        K.line('M14 33 C16 35 17 37 16 39 M50 33 C48 35 47 37 48 39', 1.4, C.wheatD) +
        K.sh('M38 32 C40 36 38 38 34 38.5 C37 36 37 34 38 32 Z'));
    },
    pain_au_chocolat: () =>
      K.shadow(26) +
      P('M16 20 H50 C56 20 60 26 60 34 V40 C60 48 56 52 50 52 H16 Z', C.wheat) +
      K.line('M26 20.5 C30 26 30 46 26 51.5 M37 20.5 C41 26 41 46 37 51.5 M48 20.5 C52 26 52 46 48 51.5', 1.5, C.wheatD) +
      K.hi('M20 23 H46 V25.5 H20 Z') + K.sh('M52 22 C57 25 59 29 59 34 V40 C59 47 56 51 50 51 C55 46 56 34 52 22 Z') +
      E(16, 36, 10, 16, C.wheat) + E(16, 36, 7.5, 13, C.wheatL, 0, SW(1.5)) +
      K.line('M16 27 C11 28 10 42 15 45 C19 46 21 36 17 34', 1.4, C.wheatD) +
      R(12, 29, 6, 3.5, 1, C.choc) + R(14, 39.5, 6, 3.5, 1, C.choc),
    quiche_lorraine: () => {
      const pts = [];
      for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2; pts.push([+(32 + 25 * Math.cos(a)).toFixed(1), +(31 + 12.5 * Math.sin(a)).toFixed(1)]); }
      return K.shadow(27) +
        band(31, 43, C.wheat, 26, 12.5) + K.line('M10 43 V50 M16 46 V54 M24 48 V56.5 M32 48.5 V57 M40 48 V56.5 M48 46 V54 M54 43 V50', 1.3, C.wheatD) +
        pts.map(([x, y]) => O(x, y, 3.2, C.wheat, SW(1.8))).join('') +
        E(32, 31, 25, 12.5, C.wheat, 0, ' stroke="none"') +
        E(32, 31, 21, 9.5, C.yellow, 0, SW(1.6)) +
        K.dots([[20, 30], [38, 26], [44, 34], [28, 36]], 2.4, C.yellowD) +
        [[22, 27, 10], [33, 31, -20], [42, 28, 30], [28, 35, 0], [45, 35, -10], [18, 33, 40]].map(([x, y, r]) => R(x - 2.5, y - 1.6, 5, 3.2, 1, C.pink, r, SW(1.4))).join('') +
        K.hiE(20, 26, 4, 1.4, -10);
    },
    french_onion_soup: () =>
      steamOn(K.bowl(
        P('M7 30 C6 20 18 15 32 15 C46 15 58 20 57 30 C58 34 55 37 54 33 C50 36 46 35 45 33 C40 36 24 36 19 33 C17 36 13 36 11 33 C9 36 6 34 7 30 Z', C.yellowL) +
        K.dots([[16, 24], [24, 20], [33, 22], [42, 19], [48, 25], [28, 28], [40, 28]], 2, C.wheatD) + K.hiE(18, 20, 4, 1.4, -10),
        C.brown, C.brownD), 32, 12),
    ratatouille: () => {
      const disc = (x, y, f, l) => E(x, y, 5.5, 4, f, 0, SW(1.6)) + E(x - 0.3, y - 0.3, 3.4, 2.3, l, 0, ' stroke="none"');
      const fills = [[C.purpleD, C.purpleL], [C.leafD, C.leafL], [C.red, C.redL], [C.yellowD, C.yellowL]];
      const ring = [];
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ring.push([32 + 19 * Math.cos(a), 37 + 8.5 * Math.sin(a), i % 4]); }
      const inner = [];
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.5; inner.push([32 + 9 * Math.cos(a), 36 + 4 * Math.sin(a), (i + 1) % 4]); }
      const draw = (L) => L.sort((a, b) => a[1] - b[1]).map(([x, y, k]) => disc(+x.toFixed(1), +y.toFixed(1), fills[k][0], fills[k][1])).join('');
      return K.plate(E(32, 37, 25, 12, C.redD, 0, ' stroke="none"') + draw(ring) + draw(inner) + disc(32, 35, C.red, C.redL) + K.dots([[22, 30], [42, 30], [30, 44], [45, 41], [18, 40]], 1.3, C.leaf));
    },
    coq_au_vin: () =>
      steamOn(K.bowl(
        G(P('M-10 -3 C-4 -10 10 -8 10 0 C10 6 2 8 -4 5 L-12 8 C-14 9 -16 7 -15 5 Z', C.brown) + O(-15.5, 6.5, 2.2, C.creamL, SW(1.6)) + O(-13.5, 9, 2.2, C.creamL, SW(1.6)) + K.hiE(-1, -4, 4, 1.5, 0), 34, 25, 0) +
        P('M10 29 C10 25 18 25 18 29 Z', C.cream, SW(1.8)) + P('M45 28 C45 24 53 24 53 28 Z', C.cream, SW(1.8)) + K.line('M14 29 V31 M49 28 V30.5', 2, C.cream) +
        O(23, 31, 2.6, C.white, SW(1.5)) + O(46, 32, 2.6, C.white, SW(1.5)),
        C.cream, C.redD), 32, 12),
    boeuf_bourguignon: () =>
      steamOn(K.pot(
        E(32, 26.5, 21, 4, C.redD, 0, ' stroke="none"') +
        R(15, 19, 9, 7.5, 2, C.brownD, -8) + R(31, 17.5, 9, 7.5, 2, C.brownD, 10) +
        O(27, 25, 3, C.orange, SW(1.6)) + O(44, 23, 3, C.orange, SW(1.6)) +
        P('M41 21 C41 16 49 16 49 21 Z', C.cream, SW(1.8)) + K.line('M45 21 V23.5', 2.2, C.cream) +
        P('M20 25 C22 19 28 19 30 21 C27 24 24 25 20 25 Z', C.leafD, SW(1.4)), C.black), 32, 12),
    bouillabaisse: () => {
      const mussel = (x, y, rot) => G(P('M0 4 C-7 2 -9 -6 -3 -8 C0 -6 1 -2 0 4 Z', C.black, SW(1.8)) + P('M0 4 C7 2 9 -6 3 -8 C0 -6 -1 -2 0 4 Z', C.black, SW(1.8)) + E(-3, -2, 1.8, 3.5, C.orange, -10, ' stroke="none"') + E(3, -2, 1.8, 3.5, C.orange, 10, ' stroke="none"'), x, y, rot);
      return steamOn(K.bowl(
        mussel(17, 25, -20) + mussel(46, 25, 20) +
        P('M27 30 C22 28 22 20 29 18 C35 16 40 21 37 26 C35 28 32 27 32 25', C.pink, SW(1.8)) + P('M27 30 C22 28 22 20 29 18', 'none', ` stroke="${C.pinkL}" stroke-width="1.2"`) +
        K.line('M24 25 l3 -1 M25 21 l3 1', 1.2, C.pinkD) +
        R(33, 27, 9, 6, 2, C.white, -8, SW(1.8)) + K.dots([[13, 31], [52, 30]], 1.4, C.leaf),
        C.teal, C.orange), 32, 12);
    },
    creme_brulee: () =>
      K.shadow(26) + band(30, 50, C.white, 25, 10) +
      K.line('M12 38 V52 M20 40 V55 M28 41 V56 M36 41 V56 M44 40 V55 M52 38 V52', 1.3, C.greyL) +
      E(32, 30, 25, 10, C.white) + E(32, 30, 21.5, 8, C.orange, 0, SW(1.6)) +
      K.dots([[20, 30], [27, 26], [40, 33], [44, 27]], 2.2, C.orangeD) +
      K.line('M30 28 L35 31 L33 34 M35 31 L40 29', 1.5, C.orangeD) + K.hiE(21, 27, 4, 1.3, -8) +
      K.sh('M52 33 C55 36 57 38 57 40 V50 C57 53 54 55 50 56 C53 50 53 40 52 33 Z'),
    tarte_tatin: () =>
      K.plate(
        E(32, 37, 25, 12, C.wheat) +
        E(32, 36, 21, 9.5, C.orangeD, 0, SW(1.6)) +
        [[20, 33, -25], [27, 30, -10], [37, 30, 10], [44, 33, 25], [45, 39, -20], [37, 42, -8], [26, 42, 8], [19, 39, 20]]
          .map(([x, y, r]) => E(x, y, 6, 3.6, C.orange, r, SW(1.5)) + K.line(`M${x - 3} ${y - 0.8} C${x - 1} ${y - 2} ${x + 1} ${y - 2} ${x + 3} ${y - 0.8}`, 1.2, C.orangeL)).join('') +
        E(32, 36, 5.5, 3.4, C.orange, 0, SW(1.5)) + K.hiE(24, 30, 3, 1.1, -10)),
    crepes_suzette: () => {
      const fold = (x, y, rot) => G(P('M0 9 L-12 -11 C-5 -14 5 -14 12 -11 Z', C.wheat) + P('M0 9 L-12 -11 C-7 -7 7 -7 12 -11 Z', C.wheatD, SW(1.5)) + K.dots([[-3, -10], [5, -11]], 1.1, C.orangeD), x, y, rot);
      return K.plate(
        E(32, 38, 23, 10.5, C.orange, 0, SW(1.6)) + fold(23, 37, -35) + fold(41, 38, 35) +
        P('M48 38 A6 6 0 0 1 60 38 Z', C.orangeL, SW(1.8)) + K.line('M54 38 L51 33.5 M54 38 L57 33.5 M54 38 V32', 1.2, C.orange) +
        P('M32 30 C26 26 27 18 31 12 C31 17 34 17 34 13 C38 18 39 26 32 30 Z', C.orange, SW(1.8)) +
        P('M32 29 C29 27 29 22 31 19 C31 22 33 22 33.5 20 C35 23 35 27 32 29 Z', C.yellow, ' stroke="none"'));
    },
    duck_a_lorange: () => {
      const sl = (x, y, rot) => G(R(-4.5, -10, 9, 20, 3, C.meatL) + P('M-4.5 -7 C-4.5 -9 -3 -10 -1 -10 H1 C3 -10 4.5 -9 4.5 -7 V-5 H-4.5 Z', C.brown, SW(1.8)), x, y, rot);
      return K.plate(
        E(29, 39, 18, 7.5, C.orange, 0, SW(1.6)) +
        sl(17, 35, -40) + sl(24, 33, -25) + sl(31, 32, -10) + sl(38, 32, 5) +
        P('M42 44 A9 9 0 0 1 60 44 Z', C.orange) + P('M45 44 A6 6 0 0 1 57 44 Z', C.orangeL, SW(1.3)) + K.line('M51 44 L47 40 M51 44 V38 M51 44 L55 40', 1.2, C.orange) +
        K.line('M16 46 l3 -2 M22 47 l3 -1', 1.6, C.orangeL));
    },
    duck_confit: () =>
      K.plate(
        P('M8 35 C8 27 18 23 28 24 C38 25 44 30 43 37 C42 43 34 46 26 45 C16 44 8 42 8 35 Z', C.brown) +
        P('M40 33 L50 26 C51 24 55 25 54 27.5 C57 28 57 31 54.5 31.5 L44 38 Z', C.creamL) +
        K.dots([[16, 31], [22, 28], [30, 30], [20, 37], [34, 36], [27, 40]], 1.3, C.brownD) + K.hiE(18, 29, 5, 2, -15) +
        K.sh('M40 31 C43 35 42 42 34 45 C42 45 44 39 43 35 Z') +
        P('M45 46 C44 41 48 38 50 38 C52 38 56 41 55 46 C54 48 46 48 45 46 Z', C.creamL) + K.line('M50 39 V46 M47.5 40.5 C47 43 47.5 45 48 46.5 M52.5 40.5 C53 43 52.5 45 52 46.5', 1.2, C.creamD) +
        K.line('M12 46 C18 47 26 48 34 47 M16 46.5 l-2 -3 M20 47 l-1 -3 M25 47.5 l0 -3 M30 47.5 l1 -3', 1.5, C.leafD)),
    cassoulet: () =>
      steamOn(K.pot(
        P('M10 27 C10 23 20 21 32 21 C44 21 54 23 54 27 C54 30 44 31 32 31 C20 31 10 30 10 27 Z', C.wheatD, SW(1.8)) +
        K.dots([[16, 25], [22, 23], [29, 26], [37, 23], [45, 25], [50, 27], [24, 28], [41, 28]], 1.1, C.brownD) +
        O(20, 26, 4, C.brown, SW(1.6)) + O(20, 26, 2.2, C.pinkL, ' stroke="none"') +
        O(43, 25, 4, C.brown, SW(1.6)) + O(43, 25, 2.2, C.pinkL, ' stroke="none"') +
        E(31, 27.5, 2.6, 1.8, C.creamL, 0, SW(1.3)) + E(35, 24.5, 2.6, 1.8, C.creamL, 0, SW(1.3)) + E(13.5, 28, 2.4, 1.7, C.creamL, 0, SW(1.3)) +
        P('M30 22 L34 12 C33 9 37 8 37.5 10.5 C40 10 40.5 14 38 14 L34 23 Z', C.creamL, SW(2)), C.terracotta), 20, 12),
    salade_nicoise: () =>
      K.plate(
        P('M7 36 C5 29 13 25 19 28 C22 23 31 22 33 27 C30 31 22 34 18 37 C14 40 8 40 7 36 Z', C.leaf) +
        P('M7 36 C5 29 13 25 19 28 C22 23 31 22 33 27', 'none', '') +
        K.line('M30 42 L52 31 M31 45 L53 34 M33 47.5 L54 37', 2.6, C.leafD) +
        G(P('M-8 2 C-8 -8 8 -8 8 2 C4 4 -4 4 -8 2 Z', C.white) + E(0, -1, 4, 3, C.yellow, 0, SW(1.5)), 22, 39, 0) +
        G(P('M-8 2 C-8 -8 8 -8 8 2 C4 4 -4 4 -8 2 Z', C.white) + E(0, -1, 4, 3, C.yellow, 0, SW(1.5)), 40, 30, 0) +
        O(13, 43, 2.8, C.black, SW(1.6)) + O(49, 41, 2.8, C.black, SW(1.6)) + O(31, 32, 2.6, C.black, SW(1.6)) +
        P('M41 44 C40 39 46 37 50 39 C47 43 45 45 41 44 Z', C.red, SW(1.8)) +
        R(26, 24, 9, 6, 2, C.pinkL, 10, SW(1.8))),
    steak_frites: () =>
      K.plate(
        [[40, 33, 25], [45, 34, 40], [49, 37, 15], [37, 38, 55], [44, 41, 70], [52, 42, 30]]
          .map(([x, y, r]) => R(x - 2.5, y - 9, 5, 18, 1, C.yellowL, r, SW(1.8))).join('') +
        P('M7 36 C6 29 13 25 22 26 C30 26 36 29 36 35 C36 42 30 46 21 46 C12 46 8 42 7 36 Z', C.brown) +
        P('M7 36 C8 42 12 46 21 46 C30 46 36 42 36 35 C36 38 30 40 21 40 C12 40 8 38 7 36 Z', C.brownD, SW(1.6)) +
        K.line('M13 30 L21 38 M19 28 L27 36 M25 27.5 L31 33.5', 2, C.brownD) +
        butter(22, 30, 0.85) + K.dots([[20, 29.5], [24, 30.5]], 1, C.leafD)),
    moules_marinieres: () => {
      const mussel = (x, y, rot) => G(P('M0 5 C-8 3 -10 -7 -3 -9 C0 -7 1 -2 0 5 Z', C.black, SW(1.8)) + P('M0 5 C8 3 10 -7 3 -9 C0 -7 -1 -2 0 5 Z', C.blueD, SW(1.8)) + E(-3.2, -2.5, 2, 4, C.orange, -10, ' stroke="none"') + E(3.2, -2.5, 2, 4, C.orange, 10, ' stroke="none"'), x, y, rot);
      return K.pot(
        mussel(15, 22, -35) + mussel(49, 22, 35) + mussel(24, 17, -10) + mussel(40, 17, 15) + mussel(32, 22, 0) +
        K.dots([[20, 25], [28, 13], [44, 25], [36, 11]], 1.5, C.leaf), C.black);
    },
    cheese_souffle: () =>
      K.shadow(25) +
      P('M9 34 C8 24 12 13 32 12 C52 13 56 24 55 34 Z', C.wheat) +
      E(32, 15, 18, 6, C.wheatD, 0, SW(2)) + K.hiE(16, 24, 2, 5, 10) +
      K.dots([[25, 14], [36, 17], [40, 13]], 1.4, C.brownL) +
      band(34, 51, C.white, 24, 9) +
      K.line('M12 42 V53 M20 44 V56 M28 44.5 V57 M36 44.5 V57 M44 44 V56 M52 42 V53', 1.3, C.greyL) +
      E(32, 34, 24, 4.5, 'none', 0, SW(2.5)),
    profiteroles: () => {
      const puff = (x, y, r) => O(x, y, r, C.wheat) + K.hiE(x - r * 0.4, y - r * 0.3, r * 0.3, r * 0.18, -30) + K.line(`M${x - r * 0.5} ${y + r * 0.35} C${x - r * 0.1} ${y + r * 0.55} ${x + r * 0.3} ${y + r * 0.3} ${x + r * 0.6} ${y + r * 0.4}`, 1.4, C.wheatD);
      return K.plate(
        E(32, 44, 20, 6, C.choc, 0, SW(1.6)) +
        puff(19, 38, 11) + puff(45, 38, 11) + puff(32, 25, 11) +
        P('M22 23 C22 12 42 12 42 23 C42 26 40 28 39 25 C38 31 34.5 31 34.5 27 C31 29 29 29 28 26.5 C27 30 22 29 22 23 Z', C.choc) +
        K.hiE(28, 17.5, 3.4, 1.3, -10));
    },
    eclairs: () =>
      K.shadow(26) +
      G(R(-26, -9, 52, 18, 9, C.wheat) +
        P('M-25 -2 C-25 -7 -21 -10 -17 -10 H17 C21 -10 25 -7 25 -2 C22 1 18 -1 15 1 C11 3 7 0 3 1 C-1 3 -5 0 -9 1 C-13 3 -17 0 -20 1 C-22 2 -24 1 -25 -2 Z', C.choc) +
        K.hi('M-18 -7 H12 V-5 H-18 Z') + K.line('M-20 5 H20', 1.4, C.wheatD), 32, 36, -20),
    macarons: () => {
      const mac = (x, y, f, fl, fill) =>
        P(`M${x - 13} ${y} V${y + 3} C${x - 13} ${y + 8} ${x + 13} ${y + 8} ${x + 13} ${y + 3} V${y} Z`, f) +
        P(`M${x - 13.5} ${y - 3} C${x - 13.5} ${y + 2} ${x + 13.5} ${y + 2} ${x + 13.5} ${y - 3} V${y} C${x + 13.5} ${y + 5} ${x - 13.5} ${y + 5} ${x - 13.5} ${y} Z`, fill, SW(1.6)) +
        P(`M${x - 13} ${y - 3} V${y - 6} C${x - 13} ${y - 11} ${x + 13} ${y - 11} ${x + 13} ${y - 6} V${y - 3} C${x + 13} ${y + 2} ${x - 13} ${y + 2} ${x - 13} ${y - 3} Z`, f) +
        E(x, y - 7, 12, 4, fl, 0, ' stroke="none"') + K.hiE(x - 6, y - 8, 3, 1.2, -5);
      return K.shadow(26) +
        mac(19, 48, C.leaf, C.leafL, C.choc) + mac(45, 48, C.yellow, C.yellowL, C.yellowL) + mac(32, 30, C.pink, C.pinkL, C.choc);
    },
    madeleines: () => {
      const shell = (x, y, rot) => G(
        P('M-14 2 C-14 -6 -7 -10 0 -10 C7 -10 14 -6 14 2 C14 7 8 9 0 9 C-8 9 -14 7 -14 2 Z', C.wheat) +
        K.line('M0 7 V-8 M0 7 L-6 -7 M0 7 L6 -7 M0 7 L-10.5 -3 M0 7 L10.5 -3 M0 7 L-12.5 2 M0 7 L12.5 2', 1.3, C.wheatD) +
        K.hiE(-6, -5, 3, 1.3, -20), x, y, rot);
      return K.plate(shell(20, 35, -15) + shell(44, 35, 15) + shell(32, 42, 0) + K.dots([[50, 45], [12, 44]], 1.3, C.yellow));
    },
    mille_feuille: () =>
      K.shadow(27) +
      P('M5 30 L39 20 L59 27 L25 37 Z', C.white) +
      K.line('M13 30.5 L44 21.5 M19 32.5 L50 23.5 M25 34.5 L55 25.5', 1.4, C.choc) +
      K.line('M10 29 L20 33 M18 26.5 L28 31 M26 24 L36 28.5 M34 21.8 L44 26 M42 21 L52 25', 1, C.choc) +
      P('M5 30 L25 37 V54 L5 47 Z', C.wheat) + P('M25 37 L59 27 V44 L25 54 Z', C.wheat) +
      P('M5 35.5 L25 42.5 V46 L5 39 Z M25 42.5 L59 32.5 V36 L25 46 Z', C.yellowL, SW(1.5)) +
      P('M5 42.5 L25 49.5 V51.5 L5 44.5 Z', C.yellowL, SW(1.2)) + P('M25 49.5 L59 39.5 V41.5 L25 51.5 Z', C.yellowL, SW(1.2)) +
      K.line('M5 33 L25 40 L59 30', 1.2, C.wheatD) +
      K.sh('M25 37 L59 27 V44 L25 54 Z'),
    tarte_au_citron: () =>
      K.plate(
        P('M8 38 L48 28 L50 36 L10 46 Z', C.wheat) + P('M8 38 L48 28 C53 30 55 34 50 36 Z', C.wheat) +
        P('M8 36 L48 26 V31 L8 41 Z', C.yellow, SW(1.6)) +
        P('M8 36 L44 20 C50 21 52 24 48 26 Z', C.yellow) +
        [[16, 31], [26, 27.5], [36, 24], [24, 31], [34, 27], [43, 23]].map(([x, y]) => P(`M${x - 4} ${y + 1} C${x - 4} ${y - 3} ${x - 1} ${y - 4} ${x} ${y - 7} C${x + 1} ${y - 4} ${x + 4} ${y - 3} ${x + 4} ${y + 1} C${x + 2} ${y + 2.5} ${x - 2} ${y + 2.5} ${x - 4} ${y + 1} Z`, C.white, SW(1.8)) + O(x, y - 6.3, 1, C.wheatD, ' stroke="none"')).join('') +
        K.line('M10 42 L48 32.5', 1.3, C.wheatD)),
    chocolate_mousse: () =>
      K.glass(C.choc, 'wine',
        P('M20.3 9 H43.7 C43.6 12 43.3 15 43 17.5 H21 C20.7 15 20.4 12 20.3 9 Z', C.choc, ' stroke="none"') +
        P('M20 8 H44 C45 22 41 32 32 33 C23 32 19 22 20 8 Z', 'none') +
        P('M19.5 9 C19 5 23 3.5 27 5 C29 2.5 35 2.5 37 5 C41 3.5 45 5 44.5 9 Z', C.choc) +
        P('M27.5 6.5 C27 4.5 30 3.5 32 5 C34 3.5 37 4.5 36.5 6.5 C35 8 29 8 27.5 6.5 Z', C.white, SW(1.8)) +
        K.line('M23 14 l2 2 M38 13 l2 -1 M30 22 l2 1', 1.4, C.brownL)),
    gratin_dauphinois: () =>
      K.pot(
        E(32, 26.5, 21.5, 4.5, C.wheat, 0, ' stroke="none"') +
        [[14, 25], [22, 24], [30, 24], [38, 24], [46, 24], [18, 28], [26, 28.5], [34, 28.5], [42, 28.5], [50, 27]]
          .map(([x, y]) => P(`M${x - 5} ${y} C${x - 5} ${y - 4} ${x + 5} ${y - 4} ${x + 5} ${y}`, C.wheatL, SW(1.4))).join('') +
        K.dots([[20, 23], [33, 25], [44, 22], [28, 27], [47, 26]], 1.6, C.brown), C.white),
    steak_tartare: () =>
      K.plate(
        P('M12 34 V40 C12 47 52 47 52 40 V34 Z', C.meatD) + E(32, 34, 20, 8, C.meat) +
        K.dots([[18, 34], [24, 31], [30, 37], [40, 30], [45, 35], [36, 36], [22, 37]], 1.2, C.meatD) + K.dots([[27, 32], [42, 37], [16, 36]], 1.1, C.fat) +
        P('M24 28 C24 38 40 38 40 28 Z', C.white) + E(32, 28, 8, 3, C.white) + O(32, 27, 4, C.yellow, SW(1.8)) + K.hiE(30.5, 25.8, 1.4, 0.8, 0) +
        K.dots([[13, 47], [48, 46], [52, 31], [10, 39]], 1.6, C.purpleL) + K.dots([[17, 46.5], [54, 36], [44, 47]], 1.6, C.leaf)),
    galette_complete: () =>
      K.plate(
        P('M7 37 L32 25 L57 37 L32 49 Z', C.brown) +
        P('M17 37 L32 30 L47 37 L32 44 Z', C.yellowL, SW(1.8)) +
        P('M19 37 C22 33 30 31 32 31 L44 37 C38 40 33 43 32 43 Z', C.pink, ' stroke="none"') +
        P('M24 37 C24 32 40 32 40 37 C40 41 24 41 24 37 Z', C.white, SW(1.6)) + O(32, 36.5, 3.6, C.yellow, SW(1.6)) +
        K.line('M17 37 L32 30 L47 37 L32 44 Z', 2.5) +
        K.dots([[14, 37], [24, 31], [40, 31], [50, 37], [24, 43], [40, 43]], 1.2, C.brownD) + K.hiE(22, 31, 4, 1.3, -25)),
    croque_monsieur: () =>
      K.plate(
        P('M10 31 L32 41 V51 L10 41 Z', C.wheatL) + P('M32 41 L54 31 V41 L32 51 Z', C.wheatL) +
        P('M10 35 L32 45 V47.5 L10 37.5 Z M32 45 L54 35 V37.5 L32 47.5 Z', C.pink, SW(1.4)) +
        P('M10 33.5 L32 43.5 V45 L10 35 Z M32 43.5 L54 33.5 V35 L32 45 Z', C.yellow, SW(1.2)) +
        P('M9 31 C8 28 31 18 33 19 C40 21 55 28 55 31 C55 34 34 43 32 42 C28 41 10 34 9 31 Z', C.wheat) +
        K.dots([[18, 30], [26, 26], [36, 25], [44, 30], [30, 34], [38, 35], [24, 33]], 1.8, C.brown) +
        P('M33 41.5 C34 45 36 45 36 41', C.wheat, SW(1.5)) + K.sh('M32 41 L54 31 V41 L32 51 Z')),
    truffle_omelette: () =>
      K.plate(
        P('M9 39 C8 33 14 29 22 28 L44 26 C52 26 56 31 55 36 C54 41 48 43 42 43 L22 45 C14 45 10 43 9 39 Z', C.yellowL) +
        K.line('M14 38 C20 37 36 35 52 34', 1.3, C.yellow) + K.hiE(22, 31, 6, 1.5, -5) +
        E(22, 34, 4, 2.5, C.black, -10, SW(1.4)) + E(31, 32.5, 4, 2.5, C.black, 5, SW(1.4)) + E(40, 33, 4, 2.5, C.black, -5, SW(1.4)) +
        K.line('M20.5 34 l3 0 M29.5 32.5 l3 0.3 M38.5 33 l3 -0.3', 1, C.greyL) +
        O(50, 46, 4.5, C.black, SW(2)) + K.dots([[48.5, 44.5], [51, 47.5]], 0.8, C.greyD)),
    oysters_mignonette: () => {
      const oyster = (x, y, rot) => G(
        P('M-12 0 C-13 -6 -5 -9 2 -8 C9 -8 14 -4 12 1 C10 6 2 8 -4 7 C-9 6 -11 4 -12 0 Z', C.greyL) +
        P('M-8 0 C-8 -4 -3 -5 2 -5 C7 -5 9 -2 8 1 C7 4 1 5 -3 4 C-6 3 -8 2 -8 0 Z', C.creamD, SW(1.4)) +
        K.hiE(-1, -2, 3, 1.2, -5), x, y, rot);
      return K.plate(
        oyster(18, 32, -15) + oyster(44, 31, 15) + oyster(22, 44, 10) + oyster(46, 43, -10) +
        E(33, 38, 6, 3.5, C.white) + E(33, 37.5, 4.5, 2.2, C.purple, 0, ' stroke="none"') + K.dots([[31.5, 37], [34.5, 38]], 0.8, C.purpleL),
        C.white, C.blueL);
    },
  });
})(FSI);
