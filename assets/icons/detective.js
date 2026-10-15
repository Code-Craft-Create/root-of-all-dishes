// Detective skills of the Test Kitchen (sk_*) and the Mystery Cupboard button (ui_detective).
(function (FSI) {
  const { C, K } = FSI;
  const P = (d, f, w) => `<path d="${d}" fill="${f}"${w ? ` stroke-width="${w}"` : ''}/>`;
  const O = (cx, cy, r, f, w) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${w ? ` stroke-width="${w}"` : ''}/>`;
  const OL = (d, col, w = 4) => `<path d="${d}" fill="none" stroke-width="${w + 5}"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  // A magnifying glass with its lens centred at (x, y).
  const lens = (x, y, r) => OL(`M${x + r * 0.7} ${y + r * 0.7} L${x + r * 1.45} ${y + r * 1.45}`, C.woodD, 5) +
    O(x, y, r, C.steel) + O(x, y, r - 4, C.glass, 2) + K.hiE(x - r * 0.35, y - r * 0.4, r * 0.3, r * 0.16);
  FSI.add('detective', {
    // A chef's toque with a magnifying glass: the kitchen detective.
    ui_detective: () =>
      O(19, 24, 10, C.white) + O(45, 24, 10, C.white) + O(32, 17, 12, C.white) +
      P('M14 26 H50 V42 H14 Z', C.white) + P('M14 38 H50 V47 C50 49 49 50 47 50 H17 C15 50 14 49 14 47 Z', C.creamD) +
      K.line('M24 30 V38 M32 28 V38 M40 30 V38', 1.4, C.greyD) + K.hiE(27, 12, 4, 2) +
      lens(44, 42, 11),
    // Taste Test: a wooden tasting spoon with a drop of sauce.
    sk_taste: () =>
      OL('M30 30 L55 55', C.wood, 6) +
      `<ellipse cx="21" cy="21" rx="15" ry="11" transform="rotate(45 21 21)" fill="${C.woodL}"/>` +
      `<ellipse cx="21" cy="21" rx="9" ry="6" transform="rotate(45 21 21)" fill="${C.red}" stroke-width="1.6"/>` +
      K.hiE(18, 18, 3, 1.6) + K.sh('M33 26 C33 32 29 35 26 35 C30 32 32 29 33 26 Z'),
    // Fine Palate: one ingredient belongs (green tick), one doesn't (red cross).
    sk_palate: () =>
      O(21, 22, 15, C.leaf) + OL('M13 22 L19 28 L29 16', C.white, 3.5) + K.hiE(15, 13, 4, 2) +
      O(43, 43, 15, C.red) + OL('M36 36 L50 50 M50 36 L36 50', C.white, 3.5) + K.hiE(37, 34, 4, 2),
    // Keen Nose: a nose taking a deep sniff.
    sk_nose: () =>
      K.line('M6 16 C10 13 12 19 16 16 M4 26 C8 23 10 29 14 26 M6 36 C10 33 12 39 16 36', 2.2, C.leafD) +
      P('M40 4 C40 18 30 30 24 40 C21 45 23 51 30 52 C33 57 41 58 46 54 C51 54 55 51 54 46 C53 30 52 16 52 4 Z', C.pinkL) +
      P('M33 47 C35 44 41 44 43 48 C40 50 36 50 33 47 Z', C.pinkD, 1.6) +
      K.sh('M50 8 C50 22 51 36 52 46 C50 42 47 40 46 36 C47 26 48 16 50 8 Z') + K.hiE(31, 40, 4, 2),
    // Pantry Sweep: a funnel that only lets the right ingredients through.
    sk_sweep: () =>
      O(19, 10, 6, C.red) + O(32, 7, 6, C.leaf) + O(45, 11, 6, C.yellow) +
      P('M6 18 H58 L38 40 V56 C38 58 37 59 35 59 H29 C27 59 26 58 26 56 V40 Z', C.steel) +
      K.sh('M50 18 H58 L38 40 V56 C38 58 37 59 35 59 H34 V40 Z') + K.hi('M12 20 H22 L18 24 H14 Z') +
      O(32, 50, 3.5, C.leaf, 1.6),
    // Cuisine Compass: a compass pointing the way through a cuisine.
    sk_compass: () =>
      O(32, 33, 26, C.gold) + O(32, 33, 20, C.creamL) + O(32, 6, 4, C.gold, 2) +
      K.line('M32 16 V19 M32 47 V50 M15 33 H18 M46 33 H49', 1.8) +
      P('M32 16 L37 33 H27 Z', C.red, 2) + P('M32 50 L27 33 H37 Z', C.blue, 2) + O(32, 33, 2.5, C.ink, 1) +
      K.hiE(22, 20, 4, 2),
  });
})(FSI);
