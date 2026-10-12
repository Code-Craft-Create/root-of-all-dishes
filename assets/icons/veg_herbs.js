// Vegetables (alliums, stalks, cabbages, leafy greens, fruiting vegetables). Herbs: veg_herbs-2.js, mushrooms: veg_herbs-3.js.
(function (FSI) {
  const { C, K } = FSI;
  const P = (d, fill, sw) => `<path d="${d}" fill="${fill}"${sw ? ` stroke-width="${sw}"` : ''}/>`;
  const E = (cx, cy, rx, ry, fill, sw, rot) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${sw ? ` stroke-width="${sw}"` : ''}${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
  const R = (a, x, y, m) => `<g transform="rotate(${a} ${x} ${y})">${m}</g>`;
  const roots = (x, y, c = C.creamD) => K.line(`M${x - 4} ${y} l-2 3.5 M${x} ${y} v4 M${x + 4} ${y} l2 3.5`, 1.5, C.ink);
  // pointed leaf from base (x,y) pointing up, length L, half width w
  const leaf = (x, y, L, w, fill, vein = C.leafD, sw) =>
    P(`M${x} ${y} C${x - w * 1.3} ${y - L * 0.3} ${x - w} ${y - L * 0.75} ${x} ${y - L} C${x + w} ${y - L * 0.75} ${x + w * 1.3} ${y - L * 0.3} ${x} ${y} Z`, fill, sw) +
    (vein ? K.line(`M${x} ${y - 1} V${y - L * 0.8}`, 1.2, vein) : '');
  // onion-type bulb centred on x, neck top t, bottom b, half width w
  const bulb = (x, t, b, w, fill) => {
    const m = t + (b - t) * 0.55;
    return P(`M${x - 2.5} ${t} H${x + 2.5} C${x + 2.5} ${t + 8} ${x + w * 0.4} ${t + 11} ${x + w * 0.75} ${t + 14} C${x + w} ${t + 18} ${x + w} ${m} ${x + w} ${m} C${x + w} ${b - 6} ${x + w * 0.6} ${b} ${x} ${b} C${x - w * 0.6} ${b} ${x - w} ${b - 6} ${x - w} ${m} C${x - w} ${t + 18} ${x - w} ${t + 18} ${x - w * 0.75} ${t + 14} C${x - w * 0.4} ${t + 11} ${x - 2.5} ${t + 8} ${x - 2.5} ${t} Z`, fill);
  };
  const bulbLines = (x, t, b, w, col) =>
    K.line(`M${x} ${t + 12} C${x - w * 0.45} ${t + 20} ${x - w * 0.45} ${b - 8} ${x - 1} ${b - 1} M${x} ${t + 12} C${x + w * 0.45} ${t + 20} ${x + w * 0.45} ${b - 8} ${x + 1} ${b - 1} M${x - w * 0.6} ${t + 16} C${x - w * 0.95} ${t + 24} ${x - w * 0.85} ${b - 9} ${x - w * 0.45} ${b - 3} M${x + w * 0.6} ${t + 16} C${x + w * 0.95} ${t + 24} ${x + w * 0.85} ${b - 9} ${x + w * 0.45} ${b - 3}`, 1.3, col);
  // round leafy head (cabbage family)
  const head = (fill, light, dark) =>
    K.shadow(22) +
    P('M32 12 C47 12 57 22 57 35 C57 49 46 58 32 58 C18 58 7 49 7 35 C7 22 17 12 32 12 Z', fill) +
    P('M32 18 C42 18 49 25 49 34 C49 42 42 47 33 47 C24 47 17 41 17 33 C17 25 23 18 32 18 Z', light, 2) +
    K.line('M33 47 C26 42 24 30 30 20 M33 47 C40 42 43 32 40 22', 1.4, dark) +
    K.line('M10 40 C16 50 26 55 34 55 M54 40 C51 47 46 51 40 54', 1.6, dark) +
    K.line('M32 58 V49 M22 54 C24 50 26 49 30 48', 1.4, dark) +
    K.hiE(23, 24, 5, 3);

  FSI.add('veg_herbs', {
    onion: () =>
      K.shadow(20) + bulb(32, 8, 56, 23, C.orangeL) + bulbLines(32, 8, 56, 23, C.orangeD) +
      K.line('M30.5 8 L28 4 M33.5 8 L36 4.5', 1.6) + roots(32, 56) + K.hiE(19, 31, 3.5, 6, 25),
    red_onion: () =>
      K.shadow(20) + bulb(32, 8, 56, 23, C.purple) + bulbLines(32, 8, 56, 23, C.purpleD) +
      K.line('M30.5 8 L28 4 M33.5 8 L36 4.5', 1.6) + roots(32, 56) + K.hiE(19, 31, 3.5, 6, 25),
    shallot: () =>
      K.shadow(22) +
      R(-14, 22, 34, bulb(22, 8, 56, 13, C.pinkD) + K.line('M22 22 C18 30 18 46 21 54 M22 22 C26 30 27 44 25 53', 1.3, C.redD) + K.hiE(16, 34, 2.5, 6, 10)) +
      R(12, 42, 36, bulb(42, 12, 57, 13, C.pink) + K.line('M42 26 C38 34 38 48 41 55 M42 26 C46 34 47 46 45 54', 1.3, C.pinkD) + K.hiE(36, 37, 2.5, 6, 10)),
    garlic: () =>
      K.shadow(24) +
      bulb(28, 7, 55, 22, C.white) +
      K.line('M28 19 C22 26 21 44 27 54 M28 19 C34 26 35 44 29 54 M20 23 C13 31 13 45 18 52 M36 23 C43 31 43 45 38 52', 1.5, C.purpleL) +
      K.line('M26.5 7 L25 3.5 M29.5 7 L31 3.5', 1.6) + roots(28, 55) +
      P('M50 58 C43 57 41 48 45 41 C47 38 49 36 51 34 C55 40 59 47 57 53 C56 56 54 58 50 58 Z', C.creamL) +
      K.line('M51 36 C50 44 51 51 54 57', 1.2, C.creamD) + K.hiE(17, 30, 3, 6, 20),
    leek: () =>
      K.shadow(14) +
      P('M27 22 C22 14 14 8 5 6 C10 12 16 18 22 30 Z', C.leafD) +
      P('M37 22 C42 14 50 8 59 6 C54 12 48 18 42 30 Z', C.leafD) +
      P('M26 32 C25 20 27 10 32 3 C37 10 39 20 38 32 Z', C.pine) +
      P('M25 30 H39 V53 C39 57 25 57 25 53 Z', C.white) +
      P('M25 30 H39 V38 C35 36 29 36 25 38 Z', C.leafL) +
      K.line('M29 40 V53 M34 40 V54', 1.2, C.greyL) + roots(32, 57) + K.hi('M27 39 H29.5 V53 H27 Z'),
    scallion: () => {
      const st = (x, top, lean, f) =>
        P(`M${x - 2.5} 40 C${x - 2.5} 28 ${x + lean - 2} 16 ${x + lean} ${top} C${x + lean + 2} 16 ${x + 2.5} 28 ${x + 2.5} 40 Z`, f, 2) +
        P(`M${x - 2.5} 38 C${x - 4.5} 44 ${x - 5} 50 ${x} 54 C${x + 5} 50 ${x + 4.5} 44 ${x + 2.5} 38 Z`, C.white, 2) +
        K.line(`M${x - 2} 55 l-1.5 3 M${x} 55 v4 M${x + 2} 55 l1.5 3`, 1.2);
      return K.shadow(18) + st(20, 7, -10, C.leaf) + st(44, 7, 10, C.leaf) + st(26, 4, -3, C.leafD) + st(38, 5, 4, C.leafD) + st(32, 3, 0, C.leaf);
    },
    celery: () => {
      const stalk = (x0, x1, f) =>
        P(`M${x0 - 4} 58 C${x0 - 4} 44 ${x1 - 3} 30 ${x1 - 3} 22 H${x1 + 3} C${x1 + 3} 30 ${x0 + 4} 44 ${x0 + 4} 58 Z`, f, 2) +
        K.line(`M${x0} 56 C${x0} 44 ${x1} 32 ${x1} 24`, 1.2, C.leaf);
      const tuft = (x, y) => leaf(x, y, 12, 3.5, C.leaf, null, 2) + R(-40, x, y, leaf(x, y, 11, 3.5, C.leaf, null, 2)) + R(40, x, y, leaf(x, y, 11, 3.5, C.leaf, null, 2));
      return K.shadow(18) + tuft(16, 24) + tuft(48, 24) + tuft(32, 19) + tuft(24, 21) + tuft(40, 21) +
        stalk(26, 17, C.leafL) + stalk(38, 47, C.leafL) + stalk(30, 25, C.leafL) + stalk(34, 39, C.leafL) + stalk(32, 32, C.leafL) +
        K.hi('M28 50 C28 44 30 38 30 34 L31.5 34 C31.5 40 30 46 30 50 Z');
    },
    fennel: () =>
      K.shadow(20) +
      K.line('M26 34 C22 24 16 16 10 10 M32 32 V6 M38 34 C42 24 48 16 54 10', 4, C.leaf) +
      K.line('M10 10 l-4 -1 M10 10 l0 -5 M14 14 l-5 1 M14 14 l1 -5 M54 10 l4 -1 M54 10 l0 -5 M50 14 l5 1 M50 14 l-1 -5 M32 6 l-4 -2 M32 6 l4 -2 M32 11 l-5 -1 M32 11 l5 -1 M20 20 l-5 0 M44 20 l5 0', 2, C.leafD) +
      P('M24 34 H40 C50 38 54 46 50 52 C47 57 40 58 32 58 C24 58 17 57 14 52 C10 46 14 38 24 34 Z', C.creamL) +
      P('M24 34 H40 C44 36 46 38 46 40 C40 38 24 38 18 40 C18 38 20 36 24 34 Z', C.leafL, 2) +
      K.line('M26 39 C22 44 22 52 26 57 M38 39 C42 44 42 52 38 57 M32 38 V57', 1.3, C.creamD) + K.hiE(20, 46, 2.5, 5, 15),
    asparagus: () => {
      const spear = (x, top, lean) =>
        P(`M${x - 3} 58 C${x - 3} 40 ${x + lean - 3} 24 ${x + lean - 3} ${top + 8} C${x + lean - 3} ${top + 2} ${x + lean} ${top} ${x + lean} ${top} C${x + lean} ${top} ${x + lean + 3} ${top + 2} ${x + lean + 3} ${top + 8} C${x + lean + 3} 24 ${x + 3} 40 ${x + 3} 58 Z`, C.leaf, 2) +
        P(`M${x + lean - 3} ${top + 8} C${x + lean - 3} ${top + 2} ${x + lean} ${top} ${x + lean} ${top} C${x + lean} ${top} ${x + lean + 3} ${top + 2} ${x + lean + 3} ${top + 8} C${x + lean + 1} ${top + 12} ${x + lean - 1} ${top + 12} ${x + lean - 3} ${top + 8} Z`, C.purple, 1.6) +
        K.line(`M${x + lean * 0.6 - 2} 26 l2 -2 M${x + lean * 0.3 + 2} 36 l-2 -2`, 1.2, C.leafD);
      return K.shadow(16) + spear(20, 6, -6) + spear(44, 6, 6) + spear(26, 4, -2) + spear(38, 4, 2) + spear(32, 3, 0) +
        `<rect x="16" y="40" width="32" height="6" rx="2" fill="${C.red}"/>`;
    },
    rhubarb: () =>
      K.shadow(18) +
      P('M30 30 C22 32 10 30 6 20 C2 10 12 2 22 6 C28 2 38 4 38 12 C46 8 58 12 58 22 C58 32 46 36 36 30 Z', C.leaf) +
      K.line('M32 30 C26 22 18 16 10 14 M33 30 C33 22 32 14 30 7 M34 30 C40 24 48 20 55 19', 1.5, C.leafD) +
      P('M26 58 C25 46 28 36 31 28 L35 29 C33 38 31 47 31 58 Z', C.red, 2) +
      P('M19 57 C19 46 22 36 28 29 L31 31 C27 39 25 48 24 57 Z', C.redD, 2) +
      P('M34 58 C35 46 34 38 33 29 L37 28 C39 38 40 47 40 58 Z', C.redL, 2) +
      K.line('M28 50 C29 42 31 36 32 31', 1.2, C.redD),
    kohlrabi: () =>
      K.shadow(20) +
      K.line('M24 30 C20 22 14 18 10 10 M32 26 V8 M40 30 C44 22 50 18 54 12 M18 40 C12 36 8 32 6 26 M46 40 C52 36 56 30 58 26', 2.2, C.leafD) +
      leaf(10, 13, 10, 4, C.leaf, null, 2) + leaf(32, 11, 9, 4, C.leaf, null, 2) + leaf(54, 15, 10, 4, C.leaf, null, 2) +
      E(32, 42, 20, 16, C.leafL) +
      K.line('M18 40 C20 38 22 38 24 39 M46 40 C44 38 42 38 40 39 M28 32 C30 31 34 31 36 32', 1.4, C.leafD) +
      K.sh('M48 36 C52 44 48 54 36 57 C46 57 52 50 52 42 Z') + K.line('M32 58 V61', 2) + K.hiE(23, 36, 5, 3),
    cabbage: () => head(C.leaf, C.leafL, C.leafD),
    red_cabbage: () => head(C.purple, C.purpleL, C.purpleD),
    napa_cabbage: () =>
      K.shadow(16) +
      P('M20 56 C14 44 14 26 18 14 C22 4 42 4 46 14 C50 26 50 44 44 56 Z', C.leafL) +
      P('M18 16 C22 10 26 12 28 8 C31 12 34 8 37 11 C40 8 44 12 46 16 C44 22 40 18 37 22 C34 18 30 22 27 19 C24 22 20 20 18 16 Z', C.leaf, 2) +
      P('M25 57 C22 44 22 30 26 21 C29 26 30 40 31 57 Z M39 57 C42 44 42 30 38 21 C35 26 34 40 33 57 Z', C.creamL, 2) +
      K.line('M26 30 C25 40 26 50 28 56 M38 30 C39 40 38 50 36 56', 1.2, C.creamD) + K.hi('M19 24 C18 32 18 40 20 48 L22 47 C21 39 21 32 22 25 Z'),
    kale: () => {
      const curly = (x, y, rot, f) =>
        R(rot, x, y, P(`M${x} ${y} C${x - 7} ${y - 8.4} ${x - 12} ${y - 14.0} ${x - 10} ${y - 22.4} C${x - 14} ${y - 28.0} ${x - 10} ${y - 36.4} ${x - 6} ${y - 35.0} C${x - 8} ${y - 43.4} ${x - 2} ${y - 50.4} ${x} ${y - 44.8} C${x + 2} ${y - 50.4} ${x + 8} ${y - 43.4} ${x + 6} ${y - 35.0} C${x + 10} ${y - 36.4} ${x + 14} ${y - 28.0} ${x + 10} ${y - 22.4} C${x + 12} ${y - 14.0} ${x + 7} ${y - 8.4} ${x} ${y} Z`, f) +
          K.line(`M${x} ${y} V${y - 39.2} M${x} ${y - 14.0} l-5 -4 M${x} ${y - 14.0} l5 -4 M${x} ${y - 26.6} l-4 -4 M${x} ${y - 26.6} l4 -4`, 1.3, C.leafL));
      return K.shadow(16) + curly(32, 57, -36, C.leafD) + curly(32, 57, 36, C.leafD) + curly(32, 56, 0, C.pine) +
        '';
    },
    spinach: () => {
      const sp = (x, y, rot, f) =>
        R(rot, x, 58, P(`M${x} ${y} C${x - 10} ${y - 2} ${x - 13} ${y - 14} ${x - 9} ${y - 22} C${x - 6} ${y - 28} ${x} ${y - 30} ${x} ${y - 30} C${x} ${y - 30} ${x + 6} ${y - 28} ${x + 9} ${y - 22} C${x + 13} ${y - 14} ${x + 10} ${y - 2} ${x} ${y} Z`, f) +
          K.line(`M${x} 58 V${y} M${x} ${y} V${y - 24} M${x} ${y - 8} l-5 -4 M${x} ${y - 8} l5 -4`, 1.4, C.leafD));
      return K.shadow(16) + sp(32, 42, -34, C.leafD) + sp(32, 42, 34, C.leafD) + sp(32, 36, 0, C.leaf) + K.hiE(28, 17, 2, 4, 20);
    },
    lettuce: () =>
      K.shadow(24) +
      P('M8 40 C4 34 8 26 14 26 C12 18 20 12 26 16 C28 8 38 8 40 15 C46 11 54 17 51 25 C58 26 61 34 56 40 C58 48 50 56 42 54 C38 59 26 59 22 54 C14 56 6 48 8 40 Z', C.leafL) +
      P('M16 38 C14 32 18 28 22 30 C22 24 28 20 32 24 C36 20 42 24 42 30 C46 28 50 32 48 38 C50 44 44 48 40 46 C36 50 28 50 24 46 C20 48 14 44 16 38 Z', C.leaf, 2) +
      K.line('M32 26 V46 M24 34 C27 38 30 40 32 42 M40 34 C37 38 34 40 32 42', 1.3, C.leafD) +
      K.line('M10 44 C14 50 20 52 24 52 M54 44 C50 50 44 52 40 52', 1.3, C.leaf) + K.hiE(18, 22, 4, 2.5),
    romaine_lettuce: () => {
      const rl = (x, rot, f) =>
        R(rot, x, 58, P(`M${x} 58 C${x - 8} 54 ${x - 11} 34 ${x - 9} 18 C${x - 8} 8 ${x - 3} 4 ${x} 4 C${x + 3} 4 ${x + 8} 8 ${x + 9} 18 C${x + 11} 34 ${x + 8} 54 ${x} 58 Z`, f) +
          P(`M${x - 2.5} 57 C${x - 3} 44 ${x - 2} 28 ${x} 14 C${x + 2} 28 ${x + 3} 44 ${x + 2.5} 57 Z`, C.creamL, 1.5));
      return K.shadow(16) + rl(32, -24, C.leaf) + rl(32, 24, C.leaf) + rl(32, 0, C.leafD) + K.hiE(27, 16, 2, 5, 10);
    },
    arugula: () => {
      const ar = (x, rot, f) =>
        R(rot, x, 58, P(`M${x - 1} 58 L${x - 1} 46 C${x - 6} 47 ${x - 9} 44 ${x - 7} 40 C${x - 4} 40 ${x - 2} 41 ${x - 1} 42 L${x - 1} 36 C${x - 6} 37 ${x - 9} 33 ${x - 7} 29 C${x - 4} 29 ${x - 2} 31 ${x - 1} 32 C${x - 9} 28 ${x - 9} 14 ${x} 8 C${x + 9} 14 ${x + 9} 28 ${x + 1} 32 C${x + 2} 31 ${x + 4} 29 ${x + 7} 29 C${x + 9} 33 ${x + 6} 37 ${x + 1} 36 L${x + 1} 42 C${x + 2} 41 ${x + 4} 40 ${x + 7} 40 C${x + 9} 44 ${x + 6} 47 ${x + 1} 46 L${x + 1} 58 Z`, f, 2) +
          K.line(`M${x} 56 V14`, 1.2, C.leafL));
      return K.shadow(18) + ar(32, -30, C.leafD) + ar(32, 30, C.leafD) + ar(32, 0, C.leaf);
    },
    swiss_chard: () => {
      const ch = (x, rot, f, st) =>
        R(rot, x, 58, P(`M${x} 30 C${x - 12} 30 ${x - 14} 16 ${x - 10} 10 C${x - 6} 4 ${x} 4 ${x} 4 C${x} 4 ${x + 6} 4 ${x + 10} 10 C${x + 14} 16 ${x + 12} 30 ${x} 30 Z`, f) +
          P(`M${x - 2} 58 V30 C${x - 2} 22 ${x - 1} 14 ${x} 10 C${x + 1} 14 ${x + 2} 22 ${x + 2} 30 V58 Z`, st, 1.8) +
          K.line(`M${x} 20 l-6 -5 M${x} 20 l6 -5 M${x} 26 l-7 -3 M${x} 26 l7 -3`, 1.4, st));
      return K.shadow(16) + ch(32, -26, C.leafD, C.yellow) + ch(32, 26, C.leafD, C.orange) + ch(32, 0, C.pine, C.red);
    },
    bok_choy: () =>
      K.shadow(18) +
      P('M14 34 C6 28 6 12 14 8 C20 6 24 14 24 24 Z M50 34 C58 28 58 12 50 8 C44 6 40 14 40 24 Z', C.leafD) +
      P('M24 30 C18 20 20 6 32 4 C44 6 46 20 40 30 Z', C.pine) +
      P('M22 57 C14 54 12 40 16 30 C20 30 24 34 26 40 C28 34 30 30 32 30 C34 30 36 34 38 40 C40 34 44 30 48 30 C52 40 50 54 42 57 Z', C.white) +
      K.line('M26 40 C26 48 27 54 29 57 M38 40 C38 48 37 54 35 57 M32 31 V56', 1.4, C.leafL) +
      K.line('M32 28 V10 M16 30 C14 22 14 16 16 12 M48 30 C50 22 50 16 48 12', 1.3, C.leafL) + K.hi('M18 36 C16 42 17 48 20 53 L22 52 C20 47 19 42 20 36 Z'),
    watercress: () => {
      const rl = (x, y, r = 3.6) => E(x, y, r, r * 0.85, C.leaf, 1.6);
      const pts = [[14, 22], [20, 14], [28, 9], [36, 9], [44, 14], [50, 22], [18, 30], [26, 20], [38, 20], [46, 30], [32, 15], [24, 30], [40, 30], [32, 25], [10, 32], [54, 32]];
      return K.shadow(16) +
        K.line('M32 58 C30 46 18 38 14 22 M32 58 C30 44 26 30 28 9 M32 58 C34 44 38 30 36 9 M32 58 C34 46 46 38 50 22 M32 58 C28 48 14 42 10 32 M32 58 C36 48 50 42 54 32 M32 58 V25', 2, C.leafD) +
        pts.map(([x, y]) => rl(x, y)).join('') + `<rect x="27" y="46" width="10" height="5" rx="1.5" fill="${C.wood}" stroke-width="1.8"/>`;
    },
    broccoli: () =>
      K.shadow(16) +
      P('M24 36 C27 42 28 49 26 57 H38 C36 49 37 42 40 36 Z', C.leafL) +
      K.line('M29 40 C30 46 30 52 30 56 M35 41 C34 47 34 52 34 56', 1.2, C.leaf) +
      P('M10 31 C5 24 11 15 19 17 C20 8 30 5 34 11 C40 5 51 8 50 17 C58 16 61 26 55 31 C58 38 51 42 45 39 C41 44 34 43 32 39 C28 43 21 43 19 39 C12 42 6 37 10 31 Z', C.leaf) +
      K.line('M18 28 C20 25 23 25 25 27 M30 20 C32 17 35 17 37 20 M40 29 C42 26 45 26 47 28 M24 35 C26 33 29 33 30 35 M14 24 C15 22 17 21 19 22 M44 19 C46 17 48 17 50 19', 1.5, C.leafD) +
      K.sh('M50 31 C53 35 51 39 45 38 C41 42 35 42 33 39 C40 40 47 38 50 31 Z') + K.hiE(22, 17, 4, 2.2),
    cauliflower: () =>
      K.shadow(24) +
      P('M10 36 C6 26 12 16 20 17 C22 9 30 7 34 11 C39 7 48 9 48 17 C56 16 60 26 55 36 Z', C.cream) +
      K.line('M18 26 C20 23 23 23 25 25 M30 18 C32 15 35 15 37 18 M40 26 C42 23 45 23 47 25 M24 32 C26 30 29 30 31 32 M36 33 C38 31 41 31 43 33', 1.5, C.creamD) +
      P('M5 34 C10 40 18 42 24 42 C20 48 22 54 28 58 C18 58 8 52 5 34 Z', C.leaf) +
      P('M59 34 C54 40 46 42 40 42 C44 48 42 54 36 58 C46 58 56 52 59 34 Z', C.leaf) +
      P('M18 40 C24 44 40 44 46 40 C44 50 40 57 32 58 C24 57 20 50 18 40 Z', C.leafD) +
      K.line('M32 46 V57 M10 38 C14 46 20 52 26 56 M54 38 C50 46 44 52 38 56', 1.3, C.leafL) + K.hiE(22, 18, 4, 2.2),
    brussels_sprouts: () => {
      const bs = (x, y, r, f) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>` +
        K.line(`M${x - r * 0.2} ${y - r} C${x - r * 0.8} ${y - r * 0.3} ${x - r * 0.7} ${y + r * 0.5} ${x - r * 0.1} ${y + r * 0.95} M${x + r * 0.25} ${y - r * 0.98} C${x + r * 0.9} ${y - r * 0.2} ${x + r * 0.8} ${y + r * 0.5} ${x + r * 0.3} ${y + r * 0.9} M${x - r * 0.9} ${y + r * 0.2} C${x - r * 0.3} ${y + r * 0.6} ${x + r * 0.4} ${y + r * 0.6} ${x + r * 0.95} ${y + r * 0.1}`, 1.4, C.leafD) +
        K.hiE(x - r * 0.45, y - r * 0.45, r * 0.25, r * 0.15);
      return K.shadow(24) + bs(32, 24, 13, C.leafL) + bs(18, 44, 13, C.leaf) + bs(46, 44, 13, C.leaf);
    },
    cherry_tomato: () => {
      const t = (x, y, r) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.red}"/>` + K.hiE(x - r * 0.45, y - r * 0.35, r * 0.3, r * 0.18) +
        P(`M${x} ${y - r + 2} l-5 -1.5 l3 -1 l-1 -4 l3 2.5 l3 -2.5 l-1 4 l3 1 Z`, C.leaf, 1.4);
      return K.shadow(22) +
        K.line('M6 8 C16 6 26 8 34 6 C42 4 50 6 58 10 M18 7 C20 12 20 16 20 22 M34 6 C38 10 40 14 40 18 M26 8 C26 22 24 30 24 38 M46 7 C48 22 48 30 46 40', 2.8, C.leafD) +
        t(20, 28, 9) + t(41, 25, 9) + t(25, 47, 10) + t(46, 46, 10);
    },
    bell_pepper: () =>
      K.shadow(20) +
      P('M14 24 C12 17 20 13 26 16 C29 13 35 13 38 16 C44 13 53 17 50 24 C55 34 53 48 47 54 C43 58 38 57 35 54 C33 57 31 57 29 54 C26 57 21 58 17 54 C11 48 9 34 14 24 Z', C.yellow) +
      K.line('M26 18 C22 28 22 44 26 54 M38 18 C42 28 42 44 38 54', 1.5, C.yellowD) +
      K.sh('M46 24 C50 34 50 46 44 54 C49 52 53 44 52 34 C51 29 49 26 46 24 Z') +
      P('M25 17 C27 13 37 13 39 17 C37 20 27 20 25 17 Z', C.leaf, 2) +
      K.line('M32 15 C32 10 34 7 38 5', 4) + K.line('M32 15 C32 10 34 7 38 5', 1.5, C.leaf) + K.hiE(19, 28, 2.5, 6, 10),
    chili_pepper: () => {
      const ch = (f, d) => P('M14 14 C22 14 26 20 29 28 C33 38 40 48 55 55 C38 56 26 48 21 38 C17 31 13 24 11 18 Z', f) + K.hi('M16 18 C20 20 22 24 24 29 L22 30 C20 26 18 22 15 20 Z') + K.line('M24 32 C28 40 36 48 46 53', 1.2, d);
      return K.shadow(20) + K.place(
        R(-24, 32, 32, ch(C.redD, C.ink)) + ch(C.red, C.redD) +
        P('M9 19 C8 14 11 11 16 12 C17 15 15 18 12 19 Z', C.leaf, 2) + K.line('M11 13 C9 9 8 6 9 4', 2.5, C.leafD) +
        `<g transform="rotate(-24 32 32)">${P('M9 19 C8 14 11 11 16 12 C17 15 15 18 12 19 Z', C.leaf, 2)}${K.line('M11 13 C9 9 8 6 9 4', 2.5, C.leafD)}</g>`, 33, 33, 0.9);
    },
    jalapeno: () =>
      K.shadow(22) +
      P('M14 18 C22 14 30 18 38 26 C46 34 52 42 54 50 C55 55 51 57 46 55 C36 52 24 44 16 36 C10 30 8 22 14 18 Z', C.leaf) +
      K.line('M30 30 l3 2 M36 38 l3 1.5 M26 36 l2.5 2', 1.4, C.creamD) +
      K.sh('M50 44 C53 50 53 55 47 55 C40 53 30 48 22 42 C32 47 44 52 50 44 Z') +
      P('M9 22 C6 16 10 11 17 13 C19 17 16 21 12 23 Z', C.leafD, 2) + K.line('M10 15 C7 11 7 7 9 4', 3, C.leafD) + K.hiE(20, 22, 6, 2.5, 30),
    poblano_pepper: () =>
      K.shadow(18) +
      P('M14 18 C18 12 26 12 32 15 C38 12 46 12 50 18 C54 26 50 36 44 44 C38 52 32 58 28 58 C26 50 22 46 18 40 C12 32 10 24 14 18 Z', C.pine) +
      K.line('M32 16 C32 28 30 42 28 56 M22 20 C20 28 21 36 24 42', 1.4, C.ink) +
      P('M25 16 C26 11 38 11 39 16 C36 19 28 19 25 16 Z', C.leaf, 2) + K.line('M32 13 C31 8 33 5 36 3.5', 3.5, C.leafD) + K.hiE(19, 23, 2.5, 6, 15),
    paprika_pepper: () =>
      K.shadow(14) +
      P('M20 14 C26 10 38 10 44 14 C46 26 42 40 38 48 C35 54 32 58 30 58 C28 54 26 46 24 40 C20 30 18 22 20 14 Z', C.red) +
      K.line('M32 14 C34 26 34 40 31 55 M26 18 C25 26 26 34 28 42', 1.4, C.redD) +
      K.sh('M42 16 C43 28 40 40 34 52 C38 46 42 34 44 16 Z') +
      P('M20 15 C22 9 42 9 44 15 C40 18 24 18 20 15 Z', C.leaf, 2) + K.line('M32 11 C32 7 34 5 37 3.5', 3.5, C.leafD) + K.hiE(24, 24, 2, 6, 5),
    eggplant: () =>
      K.shadow(22) +
      P('M18 16 C26 12 32 16 36 24 C40 30 52 34 55 44 C58 54 50 59 40 57 C26 55 14 44 11 32 C9 24 12 19 18 16 Z', C.purple) +
      K.sh('M54 42 C56 52 50 58 40 57 C48 55 53 50 54 42 Z') + K.hiE(36, 38, 7, 3, 35) +
      P('M8 18 C10 12 16 10 22 13 C26 13 28 16 27 20 C24 18 22 20 22 23 C18 21 14 22 12 24 C10 22 8 20 8 18 Z', C.leaf, 2) +
      K.line('M10 15 C8 10 6 7 6 4', 3.5, C.leafD),
    zucchini: () =>
      K.shadow(24) +
      P('M14 26 C10 30 10 36 15 38 L48 52 C54 54 58 50 58 46 C58 42 55 39 50 37 L20 25 C18 24 16 24 14 26 Z', C.pine) +
      K.line('M18 31 L52 46 M16 35 L48 49', 1.3, C.leafL) +
      P('M50 37 C55 39 58 42 58 46 C56 44 53 43 50 44 Z', C.leafD, 1.5) +
      P('M14 26 C11 24 8 22 6 18 C10 18 13 20 14 22 C12 18 12 14 14 10 C17 13 18 17 17 22 C19 18 22 16 26 16 C24 20 21 24 18 25 Z', C.yellow, 2) +
      K.line('M15 25 C14 22 14 19 14 17', 1.2, C.yellowD) + K.hiE(26, 30, 7, 1.8, 22),
    // Long, gently curved cucumber with pale stripes and bumps, plus two loose slices in front.
    cucumber: () =>
      K.shadow(26) +
      P('M7 33 C12 24 34 16 52 15 C58 15 61 19 59 23 C57 27 50 26 40 29 C28 32 18 38 12 40 C6 41 4 37 7 33 Z', C.leafD) +
      K.line('M12 33 C22 26 38 21 54 19 M15 37 C25 31 40 26 52 23', 1.3, C.leaf) +
      K.dots([[17, 29], [27, 24], [37, 21], [47, 18], [22, 34], [33, 29], [44, 25], [53, 22]], 1.1, C.ink) +
      P('M58 17.5 L62 15.5 L61.5 19.5 Z', C.brown, 1.6) + K.hiE(22, 27.5, 7, 1.6, -20) +
      // slices: dark rind, pale flesh, seed ring
      E(22, 51, 10, 6.5, C.leafD) + E(22, 50.7, 8.4, 5.2, C.leafL, 1.3) + E(22, 50.5, 3.6, 2.2, C.creamL, 0.8) +
      K.dots([[19.5, 49.5], [24.5, 49.5], [19.5, 51.5], [24.5, 51.5], [22, 48.7], [22, 52.3]], 0.8, C.creamD) +
      E(42, 52, 10, 6.5, C.leafD) + E(42, 51.7, 8.4, 5.2, C.leafL, 1.3) + E(42, 51.5, 3.6, 2.2, C.creamL, 0.8) +
      K.dots([[39.5, 50.5], [44.5, 50.5], [39.5, 52.5], [44.5, 52.5], [42, 49.7], [42, 53.3]], 0.8, C.creamD),
    pumpkin: () =>
      K.shadow(25) +
      P('M32 18 C40 14 52 16 57 26 C61 35 59 47 52 53 C46 58 38 57 32 55 C26 57 18 58 12 53 C5 47 3 35 7 26 C12 16 24 14 32 18 Z', C.orange) +
      K.line('M32 18 C26 26 25 46 32 55 M32 18 C38 26 39 46 32 55 M20 18 C12 26 12 46 20 56 M44 18 C52 26 52 46 44 56', 1.6, C.orangeD) +
      P('M29 19 C29 12 30 8 34 5 L38 7 C35 10 34 14 35 19 Z', C.brown, 2) + K.hiE(14, 30, 3, 6, 15),
    butternut_squash: () =>
      K.shadow(20) +
      P('M26 10 C26 7 38 7 38 10 C40 18 40 26 44 32 C52 38 54 46 50 52 C46 58 40 58 32 58 C24 58 18 58 14 52 C10 46 12 38 20 32 C24 26 24 18 26 10 Z', C.wheat) +
      K.sh('M38 14 C38 22 40 30 46 34 C52 40 52 50 46 56 C54 50 54 40 46 34 C42 30 40 22 38 14 Z') +
      E(32, 8, 3.5, 2, C.brown, 2) + K.line('M32 7 V3', 3, C.brownD) +
      K.line('M18 46 C22 50 26 52 30 52', 1.3, C.wheatD) + K.hiE(28, 18, 1.8, 6, 5),
    okra: () => {
      const pod = (rot) =>
        R(rot, 32, 54, P('M32 56 C27 52 27 40 28 28 C29 18 31 10 33 6 C35 10 37 18 37 28 C37 40 37 52 32 56 Z', C.leaf, 2.2) +
          K.line('M32 52 C30 40 31 24 33 9 M35 50 C35 40 35 24 34 12', 1.3, C.leafD) +
          P('M28 54 C29 51 35 51 36 54 C35 58 29 58 28 54 Z', C.leafD, 2) + K.line('M32 57 V61', 2.5, C.leafD));
      return K.shadow(18) + pod(-32) + pod(32) + pod(0);
    },
    artichoke: () => {
      const br = (x, y, w, h, f) => P(`M${x - w} ${y} C${x - w} ${y - h * 0.6} ${x - 2} ${y - h} ${x} ${y - h} C${x + 2} ${y - h} ${x + w} ${y - h * 0.6} ${x + w} ${y} Z`, f, 2);
      return K.shadow(18) +
        P('M29 50 L30 60 H34 L35 50 Z', C.leafD, 2) +
        br(32, 18, 7, 13, C.purpleL) + br(22, 26, 8, 14, C.leaf) + br(42, 26, 8, 14, C.leaf) + br(32, 28, 8, 15, C.leafL) +
        br(14, 38, 8, 14, C.leaf) + br(50, 38, 8, 14, C.leaf) + br(24, 40, 9, 15, C.leafL) + br(40, 40, 9, 15, C.leafL) +
        br(32, 52, 12, 15, C.leaf) + br(18, 50, 9, 13, C.leafD) + br(46, 50, 9, 13, C.leafD) +
        K.dots([[32, 5.5], [22, 12.5], [42, 12.5]], 1.2, C.purpleD);
    },
    tomatillo: () =>
      K.shadow(22) +
      P('M32 8 C24 12 10 20 8 34 C14 30 20 30 22 34 C22 26 26 18 32 8 Z', C.wheatL) +
      P('M32 8 C40 12 54 20 56 34 C50 30 44 30 42 34 C42 26 38 18 32 8 Z', C.wheatL) +
      K.line('M30 12 C22 18 16 24 14 32 M34 12 C42 18 48 24 50 32', 1.2, C.wheatD) +
      `<circle cx="32" cy="40" r="17" fill="${C.leafL}"/>` +
      K.line('M26 25 C24 32 24 46 28 56 M38 25 C40 32 40 46 36 56', 1.2, C.leaf) +
      K.sh('M44 30 C50 38 48 52 36 56 C46 56 50 48 49 40 C49 36 47 33 44 30 Z') +
      P('M8 34 C10 44 16 52 22 54 C18 48 18 40 22 34 C20 30 14 30 8 34 Z', C.wheatL, 2) +
      K.line('M32 8 V3', 2.5, C.wheatD) + K.hiE(24, 33, 4, 2.4),
    wasabi: () =>
      K.shadow(14) +
      K.line('M28 30 C24 24 18 18 14 14 M32 28 V12 M36 30 C40 24 46 20 50 16', 2.4, C.leafD) +
      P('M14 14 C6 14 4 6 10 4 C12 4 14 6 14 8 C14 6 16 4 18 4 C24 6 22 14 14 14 Z', C.leaf, 2) +
      P('M50 16 C42 16 40 8 46 6 C48 6 50 8 50 10 C50 8 52 6 54 6 C60 8 58 16 50 16 Z', C.leaf, 2) +
      P('M32 13 C24 13 22 5 28 3 C30 3 32 5 32 7 C32 5 34 3 36 3 C42 5 40 13 32 13 Z', C.leafD, 2) +
      P('M24 30 C22 38 24 48 26 54 C27 58 37 58 38 54 C40 48 42 38 40 30 C36 27 28 27 24 30 Z', C.leafL) +
      K.line('M25 36 C29 38 35 38 40 36 M25 43 C29 45 35 45 40 43 M26 50 C30 52 34 52 38 50', 1.4, C.leaf) +
      K.dots([[29, 33], [36, 40], [30, 47]], 1.2, C.leafD) + K.hi('M26 34 L28 34 L28.5 50 L27 50 Z'),
    bean_sprouts: () => {
      const sp = (d, hx, hy, rot) =>
        K.line(d, 5.2) + K.line(d, 2.6, C.white) +
        `<ellipse cx="${hx}" cy="${hy}" rx="4.5" ry="3" fill="${C.yellowL}" stroke-width="1.6" transform="rotate(${rot} ${hx} ${hy})"/>`;
      return K.shadow(26) +
        sp('M10 52 C20 50 30 48 38 40', 40, 38, -40) +
        sp('M54 54 C44 52 34 48 26 40', 23, 38, 40) +
        sp('M8 42 C16 34 22 30 32 30', 35, 30, 0) +
        sp('M58 44 C52 36 46 28 44 20', 43, 17, 75) +
        sp('M18 56 C22 46 22 34 18 24', 18, 21, 80) +
        sp('M36 57 C38 48 44 44 52 42', 55, 41, -15) +
        sp('M30 56 C28 48 26 42 28 26', 29, 23, 95);
    },
  });
})(FSI);
