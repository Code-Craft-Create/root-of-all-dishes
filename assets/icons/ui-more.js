// More UI icons (2026-10-12): the interface emoji that were still drawn by the OS (orders, Town, critics,
// Academy, splash cards, buttons). Same rules as the other UI icons: one object, no ground shadow.
(function (FSI) {
  const { C, K } = FSI;
  const P = (d, f, w) => `<path d="${d}" fill="${f}"${w ? ` stroke-width="${w}"` : ''}/>`;
  const E = (cx, cy, rx, ry, f, w) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}"${w ? ` stroke-width="${w}"` : ''}/>`;
  const O = (cx, cy, r, f, w) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${w ? ` stroke-width="${w}"` : ''}/>`;
  const R = (x, y, w, h, f, rx = 1, sw) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}"${sw ? ` stroke-width="${sw}"` : ''}/>`;
  const OL = (d, col, w = 4) => `<path d="${d}" fill="none" stroke-width="${w + 5}"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  const W = (d, w = 5.5, col = C.white) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  const g = (t, m) => `<g transform="${t}">${m}</g>`;

  // n-pointed star polygon points around (cx, cy)
  const starPts = (cx, cy, ro, ri, n = 5, rot = -90) => {
    const p = [];
    for (let i = 0; i < n * 2; i++) {
      const a = ((rot + (i * 180) / n) * Math.PI) / 180, r = i % 2 ? ri : ro;
      p.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
    }
    return p.join(' ');
  };
  const sparkle = (cx, cy, r, f = C.yellow) =>
    P(`M${cx} ${cy - r} C${cx + r * 0.16} ${cy - r * 0.16} ${cx + r * 0.16} ${cy - r * 0.16} ${cx + r} ${cy} C${cx + r * 0.16} ${cy + r * 0.16} ${cx + r * 0.16} ${cy + r * 0.16} ${cx} ${cy + r} C${cx - r * 0.16} ${cy + r * 0.16} ${cx - r * 0.16} ${cy + r * 0.16} ${cx - r} ${cy} C${cx - r * 0.16} ${cy - r * 0.16} ${cx - r * 0.16} ${cy - r * 0.16} ${cx} ${cy - r} Z`, f, r < 10 ? 2 : undefined);
  const heart = (f = C.red) =>
    P('M32 56 C22 48 6 38 6 23 C6 13 13 7 21 7 C26 7 30 10 32 14 C34 10 38 7 43 7 C51 7 58 13 58 23 C58 38 42 48 32 56 Z', f);
  const envelope = (f) =>
    R(5, 15, 54, 36, f, 4) + K.line('M7 49 L26 32 M57 49 L38 32', 1.8, C.creamD) +
    P('M6 18 C6 16 7 15 9 15 H55 C57 15 58 16 58 18 L35 37 C33.5 38.5 30.5 38.5 29 37 Z', f, 2.2);
  // Medal on a V ribbon; the numeral is drawn as a line.
  const medal = (disc, discD, ribbon, num) =>
    P('M16 4 H28 L36 28 H24 Z', ribbon) + P('M48 4 H36 L28 28 H40 Z', C.blueD) +
    O(32, 41, 18, disc) + O(32, 41, 12.5, discD, 1.8) + K.hiE(22, 33, 4, 2.2) + W(num, 3.6, C.ink);
  const pillar = (x, h, top = 26) => R(x, top, 6, h, C.creamL, 1, 1.8);

  FSI.add('ui-more', {
    ui_star: () => `<polygon points="${starPts(32, 34, 28, 12.5)}" fill="${C.yellow}"/>` +
      K.hi('M30 14 L26.5 24.5 L15 25 L23 31 Z') + K.sh('M44 39 L48 55 L34 47 C40 46 43 43 44 39 Z'),
    ui_near: () =>
      P('M32 58 C26 48 12 36 12 24 C12 12 21 4 32 4 C43 4 52 12 52 24 C52 36 38 48 32 58 Z', C.red) +
      O(32, 23, 8.5, C.white, 2.2) + K.hiE(21, 15, 4, 2.4) + K.sh('M46 14 C50 20 50 30 44 38 C40 44 36 49 33 54 C38 44 47 34 46 14 Z'),
    // Bank: stone front with columns and a coin in the pediment.
    ui_bank: () =>
      P('M4 24 L32 6 L60 24 Z', C.steel) + O(32, 17, 4.5, C.gold, 1.8) +
      R(6, 24, 52, 5, C.greyL, 1, 2) +
      pillar(11, 22, 29) + pillar(23, 22, 29) + pillar(35, 22, 29) + pillar(47, 22, 29) +
      R(6, 51, 52, 5, C.greyL, 1, 2) + R(3, 56, 58, 5, C.grey, 1.5, 2) + K.hi('M12 30 H14 V49 H12 Z'),
    ui_heart: () => heart() + K.hiE(17, 18, 5, 3) + K.sh('M50 16 C55 22 54 32 46 40 C42 44 37 48 33 51 C40 44 52 33 50 16 Z'),
    // 💌 recipe postcard: an envelope sealed with a little heart.
    ui_postcard: () => envelope(C.cream) + K.place(heart(C.red), 32, 35, 0.3),
    // 📨 a letter arriving: envelope with motion lines.
    ui_letter: () =>
      K.line('M2 24 H9 M1 32 H8 M3 40 H10', 2.6, C.greyD) + K.place(envelope(C.white), 36, 33, 0.86),
    // 🥂 two flutes clinking.
    ui_party: () => {
      const flute = (rot, x) => g(`rotate(${rot} ${x} 58)`,
        P(`M${x - 8} 8 H${x + 8} L${x + 7} 30 C${x + 6} 36 ${x + 3} 38 ${x} 38 C${x - 3} 38 ${x - 6} 36 ${x - 7} 30 Z`, C.glass) +
        P(`M${x - 7.4} 16 H${x + 7.4} L${x + 6.6} 30 C${x + 5.6} 35 ${x + 3} 36.5 ${x} 36.5 C${x - 3} 36.5 ${x - 5.6} 35 ${x - 6.6} 30 Z`, C.yellowL, 1.4) +
        K.line(`M${x} 38 V55`, 3) + E(x, 56, 8, 2.5, C.glass, 2) + K.dots([[x - 2, 24], [x + 2, 29], [x - 1, 32]], 1.1, C.yellowD));
      return flute(-14, 22) + flute(14, 42) + sparkle(32, 8, 6);
    },
    ui_sparkle: () => sparkle(26, 34, 22) + K.hi('M26 15 C27 26 27 26 33 31 C27 30 27 30 26 15 Z') + sparkle(50, 13, 9, C.yellowL) + sparkle(51, 50, 7, C.orangeL),
    ui_crown: () =>
      P('M7 20 L18 34 L32 12 L46 34 L57 20 L52 50 H12 Z', C.gold) +
      R(10, 49, 44, 9, C.gold, 2.5) + O(32, 53.5, 3, C.red, 1.6) + O(20, 53.5, 2.4, C.blue, 1.4) + O(44, 53.5, 2.4, C.leaf, 1.4) +
      O(7, 19, 3.5, C.gold, 2) + O(32, 10, 3.5, C.gold, 2) + O(57, 19, 3.5, C.gold, 2) +
      K.hi('M13 27 L17 34 L15 46 H13 Z') + K.sh('M46 34 L55 23 L51 48 H45 Z'),
    // 🕵️ food critic: a fedora above a magnifying glass.
    ui_critic: () =>
      E(26, 27, 22, 6, C.brownD) + P('M12 26 C12 14 16 6 26 6 C36 6 40 14 40 26 C34 29 18 29 12 26 Z', C.brown) +
      P('M13 21 C20 24 32 24 39 21 L39.5 25 C33 28 19 28 12.5 25 Z', C.choc, 1.6) + K.line('M22 10 C25 12 27 12 30 10', 1.6, C.brownD) +
      OL('M46 50 L57 61', C.woodD, 5) + O(39, 43, 12, C.glass) + O(39, 43, 8.5, C.blueL, 1.6) + K.hiE(35, 39, 3.5, 2),
    ui_medal_1: () => medal(C.gold, C.yellow, C.red, 'M28 37 L33 33 V50'),
    ui_medal_2: () => medal(C.steel, C.greyL, C.red, 'M27 37 C27 31 37 31 37 37 C37 42 27 45 27 50 H37'),
    ui_medal_3: () => medal(C.orangeD, C.orange, C.red, 'M27 34 C29 31 37 31 37 36 C37 40 33 41 31 41 C34 41 37 42 37 46 C37 51 29 51 27 48'),
    // An empty tick box: the open counterpart of ✅.
    ui_todo: () => R(9, 9, 46, 46, C.white, 9) + K.sh('M50 13 C53 15 53 18 53 22 V46 C53 50 51 53 47 53 H40 C47 51 50 47 50 40 Z'),
    ui_angry: () =>
      O(32, 33, 26, C.orange) + K.hiE(19, 19, 5, 3) +
      K.line('M16 22 L27 28 M48 22 L37 28', 3.4) + O(23, 32, 3, C.ink, 0.1) + O(41, 32, 3, C.ink, 0.1) +
      K.line('M21 48 C26 41 38 41 43 48', 3.4) + K.sh('M48 18 C56 28 55 42 46 51 C41 55 35 57 30 57 C46 52 54 36 48 18 Z'),
    // ⚓ the Harbour.
    ui_harbour: () =>
      O(32, 11, 6, C.steel, 2.6) +
      OL('M32 18 V56 M20 26 H44', C.steel, 5) +
      OL('M9 36 C10 50 20 56 32 56 C44 56 54 50 55 36', C.steel, 5) +
      P('M4 38 L9 31 L14 38 Z M50 38 L55 31 L60 38 Z', C.steel, 2.2) + K.line('M29 22 V50', 1.4, C.white),
    // 🏛️ the Old Town: the cathedral front with two towers and a rose window.
    ui_oldtown: () =>
      R(6, 18, 15, 41, C.cream, 1.5) + P('M5 19 L13.5 4 L22 19 Z', C.blueD) +
      R(43, 18, 15, 41, C.cream, 1.5) + P('M42 19 L50.5 4 L59 19 Z', C.blueD) +
      P('M20 59 V28 L32 17 L44 28 V59 Z', C.creamL) + O(32, 32, 6, C.purpleL, 2) + K.line('M32 26 V38 M26 32 H38', 1.2) +
      P('M27 59 V48 C27 41 37 41 37 48 V59 Z', C.woodD, 2) +
      R(10, 25, 6, 10, C.blueL, 3, 1.6) + R(48, 25, 6, 10, C.blueL, 3, 1.6) + K.hi('M8 21 H11 V56 H8 Z') + K.sh('M53 20 H56 V57 H53 Z'),
    // 📜 a permit: a scroll with a red seal.
    ui_permit: () =>
      P('M14 10 H52 V50 C52 55 49 57 46 57 H12 C15 57 17 54 17 50 V14 C17 11.5 15.5 10 14 10 Z', C.cream) +
      P('M8 14 C8 11 10 10 14 10 C17 10 18 12 18 14 C18 17 15 18 13 17 Z', C.creamD, 2) +
      P('M46 57 C43 57 41 55 41 52 C41 49 43 48 46 48 H58 C58 54 55 57 52 57 Z', C.creamD, 2) +
      K.line('M23 19 H45 M23 26 H45 M23 33 H39', 2, C.brownL) +
      O(36, 44, 6.5, C.red, 2) + P('M33 49 L31 56 L34.5 54 L36 57 L37 50 Z', C.redD, 1.4) + K.sh('M47 12 H52 V47 H47 Z'),
    ui_dice: () =>
      g('rotate(-14 22 38)', R(6, 22, 30, 30, C.white, 6) + K.dots([[14, 30], [21, 37], [28, 44]], 3)) +
      g('rotate(12 44 26)', R(30, 10, 28, 28, C.red, 6) + K.dots([[37, 17], [51, 17], [37, 31], [51, 31]], 2.8, C.white)),
    // ⚔️ rivals: two crossed swords.
    ui_rival: () => {
      const sword = (rot) => g(`rotate(${rot} 32 32)`,
        P('M29 4 L35 4 L35 42 H29 Z', C.steel, 2.2).replace('M29 4 L35 4', 'M29 9 L32 3 L35 9') + K.line('M32 8 V40', 1.2, C.greyD) +
        R(22, 42, 20, 5, C.gold, 2, 2.2) + R(29.5, 47, 5, 10, C.woodD, 1.5, 2) + O(32, 59, 3, C.gold, 2));
      return sword(-40) + sword(40);
    },
    ui_edit: () =>
      g('rotate(45 32 32)', R(25, 8, 14, 38, C.yellow, 1.5) + R(25, 2, 14, 8, C.pink, 2.5) + R(25, 9, 14, 4, C.steel, 0.5, 2) +
        P('M25 46 H39 L32 60 Z', C.creamL) + P('M29.5 55 H34.5 L32 60 Z', C.ink, 0.1) + K.line('M32 14 V45', 1.4, C.yellowD)),
    // 🏘️ the buildings overview: a barn with a silo.
    ui_buildings: () =>
      R(44, 14, 14, 44, C.steel, 2) + P('M44 15 C44 6 58 6 58 15 Z', C.grey) + K.line('M44 26 H58 M44 37 H58 M44 48 H58', 1.4, C.greyD) +
      P('M5 30 L24 14 L43 30 V58 H5 Z', C.red) + P('M3 31 L24 12 L45 31', 'none', 3) +
      P('M17 58 V40 H31 V58 Z', C.creamL, 2) + K.line('M17 40 L31 58 M31 40 L17 58', 1.6, C.redD) +
      R(19, 24, 10, 8, C.creamL, 1, 1.8) + K.hi('M8 31 L12 28 V55 H8 Z'),
    ui_info: () => O(32, 32, 27, C.blue) + K.hiE(18, 17, 6, 3) + O(32, 18, 4.2, C.white, 0.1) + W('M26 28 H33 V47 M24 47 H41', 6),
    ui_hourglass: () =>
      R(10, 4, 44, 7, C.wood, 2.5) + R(10, 53, 44, 7, C.wood, 2.5) +
      P('M16 11 H48 C48 24 36 28 36 32 C36 36 48 40 48 53 H16 C16 40 28 36 28 32 C28 28 16 24 16 11 Z', C.glass) +
      P('M21 18 H43 C41 24 34 27 32 30 C30 27 23 24 21 18 Z', C.wheat, 1.6) +
      P('M20 51 C21 44 28 42 32 40 C36 42 43 44 44 51 Z', C.wheat, 1.6) + K.line('M32 31 V44', 1.4, C.wheatD) + K.hi('M19 13 H22 C23 21 26 25 28 28 C24 26 20 22 19 13 Z'),
    ui_move: () =>
      P('M4 32 L20 16 C21.5 14.5 24 15.5 24 17.5 V25 H40 V17.5 C40 15.5 42.5 14.5 44 16 L60 32 L44 48 C42.5 49.5 40 48.5 40 46.5 V39 H24 V46.5 C24 48.5 21.5 49.5 20 48 Z', C.orange) +
      K.hi('M9 31 L21 19 V28 H43 V19 L46 22 V31 Z'),
    ui_rotate: () =>
      OL('M50 38 C47 50 38 56 30 56 C17 56 8 46 8 33 C8 20 18 10 31 10 C39 10 45 13 49 19', C.orange, 6) +
      P('M55 6 L57 28 L36 23 Z', C.orange, 2.4),
    ui_download: () =>
      P('M25 4 H39 V26 H50 C52 26 53 28.5 51.5 30 L33.5 48 C32.5 49 31.5 49 30.5 48 L12.5 30 C11 28.5 12 26 14 26 H25 Z', C.leaf) +
      K.hi('M28 7 H31 V29 H17 L19 31.5 H28 Z') +
      P('M5 44 V54 C5 57 7 59 10 59 H54 C57 59 59 57 59 54 V44', 'none', 5.5).replace('fill="none"', `fill="none" stroke="${C.greyD}"`),
    ui_stop: () => O(32, 32, 27, C.red) + K.hiE(18, 17, 6, 3) + R(21, 21, 22, 22, C.white, 3.5, 0.1),
    // 📚 train a chef: a stack of three books.
    ui_books: () =>
      R(8, 44, 48, 13, C.blue, 2.5) + R(46, 46, 8, 9, C.creamL, 1, 1.6) +
      g('rotate(-5 32 37)', R(12, 31, 42, 12, C.red, 2.5) + R(14, 33, 8, 8, C.creamL, 1, 1.6)) +
      g('rotate(4 32 24)', R(10, 18, 40, 12, C.leaf, 2.5) + R(41, 20, 7, 8, C.creamL, 1, 1.6) + K.line('M16 24 H34', 1.6, C.leafD)) +
      K.line('M14 50.5 H38', 1.6, C.blueD) + K.hi('M11 46 H40 V48 H11 Z'),
    // 👋 let a chef go: an open door with an arrow leading out.
    ui_leave: () =>
      R(8, 6, 30, 52, C.woodL, 2) + R(13, 11, 20, 47, C.choc, 0.1) +
      P('M13 11 L28 16 V58 L13 58 Z', C.wood, 2) + O(24, 37, 1.8, C.gold, 1.2) +
      P('M34 30 H46 V23 C46 21.5 47.5 21 48.5 22 L60 33 L48.5 44 C47.5 45 46 44.5 46 43 V36 H34 Z', C.red),
    // 🛖 the Inventory: a red gambrel barn with its doors open on a crate and a hay bale.
    ui_inventory: () =>
      P('M8 30 H56 V57 H8 Z', C.red) + P('M3 32 L11 17 L32 6 L53 17 L61 32 Z', C.redD) + K.line('M11 17 H53', 1.6, C.ink) +
      R(26, 18, 12, 9, C.creamL, 1, 1.8) + K.line('M32 18 V27 M26 22.5 H38', 1.4, C.creamD) +
      R(18, 36, 28, 21, C.choc, 0.5) + R(21, 44, 12, 13, C.wood, 1, 2) + K.line('M21 44 L33 57 M33 44 L21 57', 1.4, C.woodD) +
      R(34, 41, 10, 16, C.wheat, 1.5, 2) + K.line('M34 47 H44 M34 52 H44', 1.3, C.wheatD) +
      P('M18 36 H46', 'none', 3.2).replace('fill="none"', `fill="none" stroke="${C.white}"`) +
      K.hi('M11 33 H14 V55 H11 Z') + R(4, 56, 56, 3, C.greyL, 0.5, 1.6),
    // 🚢 Import: a cargo ship (bow left) stacked with containers on a little wave.
    ui_import: () =>
      R(14, 26, 11, 11, C.blue, 1, 2) + R(25, 26, 11, 11, C.orange, 1, 2) + R(19, 16, 11, 10, C.leaf, 1, 2) +
      R(40, 14, 13, 23, C.white, 1.5, 2) + R(44, 7, 5, 7, C.greyD, 0.5, 2) + R(42.5, 18, 8, 5, C.blueL, 1, 1.4) +
      P('M3 37 H61 L55 54 H11 Z', C.red) + P('M5 37 H61 L59.5 42 H6.6 Z', C.white, 1.8) + O(16, 46, 2, C.creamL, 1.2) +
      K.hi('M8 44 H12 L13 51 H10 Z') +
      W('M3 58 C8 55 12 55 17 58 C22 61 26 61 31 58 C36 55 40 55 45 58 C50 61 54 61 61 58', 3, C.blue),
  });
})(FSI);
