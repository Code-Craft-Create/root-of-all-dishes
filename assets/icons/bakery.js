// Bakery group, part 1: flours, meals and starches (sacks with a glyph of the source crop).
(function (FSI) {
  const { C, K } = FSI;
  // Flour peeking out of the sack mouth, coloured like the flour.
  const mound = (c) => `<path d="M22 21 C26 16.5 38 16.5 42 21" fill="${c}" stroke-width="1.5"/>`;
  // Starches: whitish sack with a blue tie and a blue band, so the family reads apart from flours.
  const starch = (glyph) =>
    K.sack(C.milk, `<path d="M13.6 49 C24 51 40 51 50.6 49 L50.6 52.5 C49.5 56.5 46 58 32 58 C18 58 14.5 56.5 13.6 52.5 Z" fill="${C.blueL}" stroke-width="1.5"/>` + glyph + mound(C.white), C.blue);
  // Single cereal ear on a short stem; centre x=32, spans y 27..54.
  const ear = (fill, vein, opt = {}) => {
    const w = opt.w || 5, top = opt.top || 30, x = opt.x || 32, rot = opt.rot || 0;
    return `<g transform="rotate(${rot} ${x} 50)">` +
      K.line(`M${x} 54 V46`, 1.8, opt.stem || C.wheatD) +
      (opt.awns ? K.line(`M${x - 3} 40 L${x - 7} ${top - 4} M${x + 3} 40 L${x + 7} ${top - 4} M${x - 3} 34 L${x - 5} ${top - 6} M${x + 3} 34 L${x + 5} ${top - 6} M${x} ${top} V${top - 6}`, 1.1, opt.awns) : '') +
      `<path d="M${x} 48 C${x - w} 44 ${x - w} ${top + 5} ${x} ${top} C${x + w} ${top + 5} ${x + w} 44 ${x} 48 Z" fill="${fill}" stroke-width="1.6"/>` +
      K.line(`M${x - w * 0.6} ${top + 13} L${x} ${top + 16} L${x + w * 0.6} ${top + 13} M${x - w * 0.6} ${top + 7} L${x} ${top + 10} L${x + w * 0.6} ${top + 7}`, 1.2, vein) + `</g>`;
  };
  const cob = (x = 32, y = 41) =>
    `<path d="M${x - 9} ${y + 12} C${x - 11} ${y + 4} ${x - 8} ${y - 4} ${x - 3} ${y - 6} C${x - 6} ${y} ${x - 5} ${y + 7} ${x} ${y + 12} Z" fill="${C.leaf}" stroke-width="1.5"/>` +
    `<path d="M${x} ${y + 11} C${x - 6} ${y + 6} ${x - 6} ${y - 6} ${x} ${y - 12} C${x + 6} ${y - 6} ${x + 6} ${y + 6} ${x} ${y + 11} Z" fill="${C.yellow}" stroke-width="1.6"/>` +
    K.line(`M${x - 4} ${y - 4} H${x + 4} M${x - 4.6} ${y + 1} H${x + 4.6} M${x - 3.6} ${y + 6} H${x + 3.6} M${x} ${y - 10} V${y + 10}`, 1.1, C.yellowD) +
    `<path d="M${x + 9} ${y + 12} C${x + 11} ${y + 4} ${x + 8} ${y - 4} ${x + 3} ${y - 6} C${x + 6} ${y} ${x + 5} ${y + 7} ${x} ${y + 12} Z" fill="${C.leafD}" stroke-width="1.5"/>`;
  const grain = (x, y, rot, fill, rx = 2.6, ry = 5) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="${fill}" stroke-width="1.4"/>`;
  const rice = (fill = C.white) => grain(26, 42, -30, fill) + grain(32, 38, 0, fill) + grain(38, 42, 30, fill) + grain(29, 47, 70, fill) + grain(36, 47.5, -70, fill);
  const almond = (x, y, rot, s = 1) =>
    `<g transform="rotate(${rot} ${x} ${y})"><path d="M${x} ${y - 9 * s} C${x + 6 * s} ${y - 4 * s} ${x + 6 * s} ${y + 6 * s} ${x} ${y + 7 * s} C${x - 6 * s} ${y + 6 * s} ${x - 6 * s} ${y - 4 * s} ${x} ${y - 9 * s} Z" fill="${C.brown}" stroke-width="1.6"/>` +
    K.line(`M${x - 1.5 * s} ${y - 4 * s} C${x - 2.5 * s} ${y} ${x - 2 * s} ${y + 3 * s} ${x - 1 * s} ${y + 4 * s} M${x + 2 * s} ${y - 2 * s} C${x + 2.5 * s} ${y + 1 * s} ${x + 2 * s} ${y + 3 * s} ${x + 1.5 * s} ${y + 4 * s}`, 1.1, C.brownD) + `</g>`;
  const cassava = () =>
    `<path d="M22 50 C20 47 22 44 26 42 L40 33 C43 31 45 31 44 33 L32 47 C29 50 25 52 22 50 Z" fill="${C.brown}" stroke-width="1.6"/>` +
    `<ellipse cx="23" cy="48" rx="3" ry="3.6" transform="rotate(40 23 48)" fill="${C.creamL}" stroke-width="1.4"/>` +
    K.line('M30 41 L33 44 M35 37 L38 40', 1.1, C.brownD);
  const potato = () =>
    `<path d="M22 44 C21 37 27 33 33 34 C40 34 44 38 43 44 C42 50 36 52 31 51 C25 51 22 49 22 44 Z" fill="${C.brownL}" stroke-width="1.6"/>` +
    K.dots([[27, 40], [36, 39], [33, 46], [39, 45]], 1, C.brownD) + K.hiE(27, 38, 3, 1.5);
  const chickpea = (x, y, s = 1) =>
    `<path d="M${x} ${y - 5 * s} C${x + 5 * s} ${y - 5 * s} ${x + 6 * s} ${y + 4 * s} ${x} ${y + 5 * s} C${x - 6 * s} ${y + 5 * s} ${x - 6 * s} ${y - 2 * s} ${x - 2 * s} ${y - 3 * s} L${x - 1 * s} ${y - 6.5 * s} Z" fill="${C.wheat}" stroke-width="1.5"/>` +
    K.line(`M${x - 1 * s} ${y - 3 * s} C${x + 1 * s} ${y} ${x + 1 * s} ${y + 2 * s} ${x} ${y + 4 * s}`, 1.1, C.wheatD);
  const buck = (x, y, s = 1) =>
    `<path d="M${x} ${y - 6 * s} L${x + 5 * s} ${y + 4 * s} L${x - 5 * s} ${y + 4 * s} Z" fill="${C.brownD}" stroke-width="1.5"/>` + K.line(`M${x} ${y - 5 * s} L${x + 1 * s} ${y + 3.5 * s}`, 1.1, C.brownL);
  const kernel = (x, y, rot, fill = C.yellow) =>
    `<path d="M${x - 3.5} ${y - 3} C${x - 3.5} ${y - 6} ${x + 3.5} ${y - 6} ${x + 3.5} ${y - 3} L${x + 2} ${y + 4} C${x + 1} ${y + 5.5} ${x - 1} ${y + 5.5} ${x - 2} ${y + 4} Z" transform="rotate(${rot} ${x} ${y})" fill="${fill}" stroke-width="1.4"/>`;
  const teff = () =>
    K.line('M32 54 V30 M32 34 L25 29 M32 34 L39 29 M32 40 L24 36 M32 40 L40 36 M32 46 L25 43 M32 46 L39 43', 1.4, C.brownD) +
    K.dots([[32, 29], [25, 29], [39, 29], [27, 31.5], [37, 31.5], [24, 36], [40, 36], [26.5, 38], [37.5, 38], [25, 43], [39, 43], [28, 44], [36, 44], [32, 32]], 1.6, C.terracotta);

  FSI.add('bakery', {
    whole_wheat_flour: () => K.sack(C.cream, K.ref('wheat', 32, 41, 0.42) + K.dots([[22, 34], [42, 33], [23, 47], [42, 47], [20, 41], [44, 40], [27, 53], [38, 53]], 1.1, C.brown) + mound(C.woodL), C.brownD),
    semolina: () => K.sack(C.yellowL, ear(C.gold, C.yellowD, { awns: C.ink, w: 5.5 }) + mound(C.yellow) + K.dots([[27, 19], [31, 18], [35, 19], [38, 19.5]], 0.8, C.yellowD)),
    spelt_flour: () => K.sack(C.wheatL, ear(C.brownL, C.brownD, { w: 4 }) + ear(C.brownL, C.brownD, { w: 4, x: 32, rot: -26 }) + ear(C.brownL, C.brownD, { w: 4, rot: 26 }) + mound(C.creamL)),
    rye_flour: () => K.sack(C.greyL, ear(C.creamD, C.greyD, { w: 3.6, awns: C.greyD, rot: -14, stem: C.greyD }) + ear(C.creamD, C.greyD, { w: 3.6, awns: C.greyD, rot: 14, stem: C.greyD }) + mound(C.greyL)),
    buckwheat_flour: () => K.sack(C.grey, buck(26, 44) + buck(38, 44) + buck(32, 36) + mound(C.greyL), C.brownD),
    teff_flour: () => K.sack(C.brownL, teff() + mound(C.woodL), C.brownD),
    cornmeal: () => K.sack(C.yellow, cob() + mound(C.yellowL) + K.dots([[27, 19], [31, 18], [35, 19], [38, 19.5]], 0.8, C.orange), C.leafD),
    corn_starch: () => starch(cob(32, 38)),
    rice_flour: () => K.sack(C.creamL, rice() + mound(C.white), C.teal),
    glutinous_rice_flour: () => K.sack(C.pinkL, rice(C.white) + mound(C.white), C.pinkD),
    rolled_oats: () =>
      K.bowl(
        [[20, 28, -20], [29, 26, 10], [38, 27, -5], [45, 29, 25], [25, 31, 30], [34, 31, -25], [42, 32, 5], [32, 22, 0]]
          .map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.2" transform="rotate(${r} ${x} ${y})" fill="${C.wheatL}" stroke-width="1.4"/>`).join('') +
        K.dots([[20, 28], [29, 26], [38, 27], [45, 29], [25, 31], [34, 31], [42, 32], [32, 22]], 0.8, C.wheatD),
        C.blueL, C.wheat),
    chickpea_flour: () => K.sack(C.wheat, chickpea(26, 44) + chickpea(38, 44) + chickpea(32, 35) + mound(C.yellowL), C.brownD),
    almond_flour: () => K.sack(C.woodL, almond(27, 42, -18) + almond(37, 42, 18) + mound(C.creamL), C.brownD),
    potato_starch: () => starch(potato()),
    tapioca_starch: () => starch(cassava()),
    cassava_flour: () => K.sack(C.creamD, cassava() + mound(C.creamL), C.brownD),
    masa_harina: () => K.sack(C.orangeL, kernel(26, 43, -20) + kernel(38, 43, 20) + kernel(32, 36, 0) + kernel(32, 47, 180, C.yellowL) + mound(C.yellowL), C.leafD),
  });
})(FSI);
