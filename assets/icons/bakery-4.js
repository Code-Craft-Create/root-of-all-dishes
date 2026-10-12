// Bakery group, part 4: pastry, creams, confectionery and sweet preserves.
(function (FSI) {
  const { C, K } = FSI;
  const hazelnut = (x, y, s = 1) =>
    `<circle cx="${x}" cy="${y + 1.5 * s}" r="${5.5 * s}" fill="${C.brown}" stroke-width="1.4"/>` +
    `<path d="M${x - 5.5 * s} ${y} C${x - 5 * s} ${y - 5 * s} ${x + 5 * s} ${y - 5 * s} ${x + 5.5 * s} ${y} C${x + 3 * s} ${y - 1.5 * s} ${x - 3 * s} ${y - 1.5 * s} ${x - 5.5 * s} ${y} Z" fill="${C.brownL}" stroke-width="1.4"/>` +
    `<path d="M${x} ${y - 3.5 * s} V${y - 6.5 * s}" stroke-width="1.4"/>`;
  // Cake/round tin shape: top colour and side colour.
  const cake = (top, side, crumb) =>
    K.shadow(26) +
    `<path d="M6 30 V47 C6 53 18 57 32 57 C46 57 58 53 58 47 V30 Z" fill="${side}"/>` +
    K.sh('M50 33 C55 36 57 40 57 47 C57 51 52 54 44 56 C50 52 52 42 50 33 Z') +
    `<ellipse cx="32" cy="30" rx="26" ry="11" fill="${top}"/>` + K.hiE(20, 26, 6, 2.2, -8) +
    K.dots([[12, 42], [20, 47], [30, 49], [40, 48], [49, 44], [16, 51], [36, 53]], 1, crumb);
  // Bowl filled with a smooth cream, optional extra on top.
  const creamBowl = (bowl, cream, extra = '') => K.bowl(extra, bowl, cream);
  const cyl = (x, y, r, h, fill, top) =>
    `<path d="M${x - r} ${y} V${y + h} C${x - r} ${y + h + r * 0.5} ${x + r} ${y + h + r * 0.5} ${x + r} ${y + h} V${y} Z" fill="${fill}"/>` +
    `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.45}" fill="${top}"/>` + K.hi(`M${x - r + 2} ${y + 3} H${x - r + 4} V${y + h - 1} H${x - r + 2} Z`);

  FSI.add('bakery', {
    gelatin: () => {
      const leaf = (x, y, r, fill) =>
        `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 16}" y="${y - 11}" width="32" height="22" rx="2" fill="${fill}"/>` +
        K.line(`M${x - 13} ${y - 8} L${x - 3} ${y + 8} M${x - 5} ${y - 8} L${x + 5} ${y + 8} M${x + 3} ${y - 8} L${x + 13} ${y + 8} M${x + 13} ${y - 8} L${x + 3} ${y + 8} M${x + 5} ${y - 8} L${x - 5} ${y + 8} M${x - 3} ${y - 8} L${x - 13} ${y + 8}`, 1.2, C.wheat) + `</g>`;
      return K.shadow(26) + leaf(26, 28, -12, C.yellowL) + leaf(38, 42, 8, C.wheatL) + K.hi('M24 46 L50 49.6 L50 51.4 L24 48 Z');
    },
    hazelnut_cocoa_spread: () => K.jar(C.choc, C.white, hazelnut(32, 41, 1.2)),
    praline_paste: () => K.jar(C.brownL, C.gold, hazelnut(28, 42, 1) + `<path d="M37 36 C40 40 41 44 39 47 C37 49 34 48 34 45 C34 42 36 40 37 36 Z" fill="${C.orange}" stroke-width="1.3"/>`),
    dulce_de_leche: () => K.jar(C.orangeD, C.blue, `<path d="M26 47 C22 41 30 34 32 36 C34 38 28 40 30 43 C32 46 38 44 38 40" fill="none" stroke="${C.orangeD}" stroke-width="2.6"/>`),
    lemon_curd: () => K.jar(C.yellow, C.leaf,
      `<path d="M23 41 C23 36 28 34 32 34 C36 34 41 36 41 41 C41 46 36 48 32 48 C28 48 23 46 23 41 Z" fill="${C.yellow}" stroke-width="1.5"/>` +
      `<path d="M23 41 L21 41 M41 41 L43 41" stroke-width="2"/>` + K.hiE(28, 38, 2.5, 1.2)),
    candied_orange_peel: () => {
      const strip = (d) => `<path d="${d}" fill="${C.orange}"/>`;
      return K.shadow(25) +
        strip('M8 46 C14 32 28 22 46 20 L48 25 C32 27 20 36 14 49 Z') + K.line('M12 46 C18 34 30 26 46 23', 1.2, C.orangeL) +
        strip('M18 54 C26 44 40 38 56 38 L56 43 C42 43 30 48 23 56 Z') + K.line('M21 54 C29 46 41 41 56 41', 1.2, C.orangeL) +
        strip('M10 30 C18 20 30 14 42 12 L43 16 C32 18 22 24 15 33 Z') +
        K.dots([[20, 38], [30, 30], [38, 25], [30, 48], [44, 42], [22, 22], [34, 16], [48, 22]], 1.1, C.white);
    },
    glace_cherries: () => {
      const ch = (x, y, r = 9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.red}"/>` + K.hiE(x - r * 0.4, y - r * 0.4, r * 0.35, r * 0.2) + K.line(`M${x - 1} ${y - r + 1} C${x} ${y - r + 3} ${x + 1} ${y - r + 3} ${x + 2} ${y - r + 1.5}`, 1.3, C.redD);
      return K.shadow(24) + ch(22, 32) + ch(42, 32) + ch(32, 22) + ch(16, 48) + ch(32, 47) + ch(48, 48);
    },
    whipped_cream: () =>
      creamBowl(C.blueL, C.white,
        `<path d="M12 30 C10 24 16 20 22 22 C22 14 30 10 34 14 C36 6 46 8 44 16 C52 16 54 24 50 30 Z" fill="${C.white}"/>` +
        K.line('M20 28 C24 24 28 26 30 22 M34 18 C36 22 40 22 42 20 M38 28 C42 26 46 26 48 28', 1.3, C.greyL) + K.hiE(26, 18, 3, 1.5)),
    meringue: () => {
      const kiss = (x, y, s) =>
        `<path d="M${x - 11 * s} ${y} C${x - 11 * s} ${y - 8 * s} ${x - 4 * s} ${y - 10 * s} ${x - 2 * s} ${y - 15 * s} C${x} ${y - 19 * s} ${x + 2 * s} ${y - 22 * s} ${x + 1 * s} ${y - 25 * s} C${x + 6 * s} ${y - 20 * s} ${x + 11 * s} ${y - 10 * s} ${x + 11 * s} ${y} C${x + 11 * s} ${y + 3 * s} ${x - 11 * s} ${y + 3 * s} ${x - 11 * s} ${y} Z" fill="${C.creamL}"/>` +
        K.line(`M${x - 7 * s} ${y - 2 * s} C${x - 6 * s} ${y - 8 * s} ${x} ${y - 10 * s} ${x + 4 * s} ${y - 16 * s} M${x + 7 * s} ${y - 2 * s} C${x + 8 * s} ${y - 7 * s} ${x + 6 * s} ${y - 12 * s} ${x + 3 * s} ${y - 18 * s}`, 1.2, C.creamD) +
        `<path d="M${x - 11 * s} ${y} C${x - 11 * s} ${y + 3 * s} ${x + 11 * s} ${y + 3 * s} ${x + 11 * s} ${y}" stroke="${C.wheat}" stroke-width="2"/>`;
      return K.shadow(26) + kiss(40, 48, 1.35) + kiss(19, 54, 1.15) + K.hiE(12, 44, 2.5, 1.5);
    },
    creme_patissiere: () =>
      creamBowl(C.white, C.yellow,
        `<path d="M14 30 C14 24 22 20 32 20 C42 20 50 24 50 30 Z" fill="${C.yellow}" stroke-width="1.6"/>` +
        K.line('M22 26 C26 23 32 23 36 26 C38 28 42 27 44 25', 1.3, C.yellowD) +
        `<path d="M10 18 L54 30" stroke-width="5"/><path d="M10 18 L54 30" stroke="${C.choc}" stroke-width="2.5"/>`),
    custard: () =>
      K.shadow(20) +
      `<path d="M44 26 C54 26 56 42 44 46" stroke-width="5"/><path d="M44 26 C54 26 56 42 44 46" stroke="${C.cream}" stroke-width="1.5"/>` +
      `<path d="M14 16 C18 18 22 18 24 16 H46 C46 30 50 40 48 50 C47 55 42 58 36 58 H24 C18 58 14 55 14 50 C12 40 18 30 18 22 C15 21 12 19 14 16 Z" fill="${C.cream}"/>` +
      `<path d="M15.5 17.5 C18 19 22 19.5 24 18.5 C30 20 40 20 44.5 18.5 C44 17 30 16.5 24 16.5 C21 16.5 18 16.8 15.5 17.5 Z" fill="${C.yellow}" stroke="none"/>` +
      `<path d="M14 16 C9 22 10 30 12 36 C13 39 16 39 15.5 35 C14 28 16 22 18 19 Z" fill="${C.yellow}" stroke-width="2"/>` +
      K.hi('M22 26 L25 26 L24 50 L21 48 Z') + K.sh('M44 22 C46 32 48 42 46 52 C44 56 40 57 36 57 C42 52 44 40 44 22 Z'),
    ganache: () =>
      creamBowl(C.white, C.choc,
        `<path d="M14 30 C16 25 24 22 32 22 C40 22 48 25 50 30 Z" fill="${C.choc}" stroke-width="1.6"/>` +
        K.line('M20 28 C24 25 30 25 33 27 C36 29 40 28 43 26', 1.5, C.brown) + K.hiE(24, 25, 4, 1.2, -5)),
    marzipan: () =>
      K.shadow(26) +
      `<path d="M14 26 H48 C55 26 55 50 48 50 H14 Z" fill="${C.yellowL}"/>` +
      `<ellipse cx="14" cy="38" rx="7" ry="12" fill="${C.creamL}"/>` + K.dots([[12, 34], [16, 40], [13, 43]], 0.8, C.creamD) +
      K.hi('M18 28.5 H46 V31 H18 Z') + K.sh('M20 46 H48 C51 46 52 44 52.5 42 C52 47 51 50 48 50 H20 Z') +
      `<g transform="rotate(70 44 20)"><path d="M44 13 C49 16 49 24 44 27 C39 24 39 16 44 13 Z" fill="${C.brownL}" stroke-width="1.6"/></g>`,
    ladyfingers: () => {
      const lf = (y, x0) =>
        `<path d="M${x0} ${y} C${x0 - 5} ${y} ${x0 - 5} ${y + 9} ${x0} ${y + 9} C${x0 + 6} ${y + 9} ${x0 + 10} ${y + 7} ${x0 + 18} ${y + 7} C${x0 + 26} ${y + 7} ${x0 + 30} ${y + 9} ${x0 + 36} ${y + 9} C${x0 + 41} ${y + 9} ${x0 + 41} ${y} ${x0 + 36} ${y} C${x0 + 30} ${y} ${x0 + 26} ${y + 2} ${x0 + 18} ${y + 2} C${x0 + 10} ${y + 2} ${x0 + 6} ${y} ${x0} ${y} Z" fill="${C.wheat}"/>` +
        K.dots([[x0 + 2, y + 4], [x0 + 10, y + 4.5], [x0 + 18, y + 4], [x0 + 26, y + 4.5], [x0 + 34, y + 4]], 1, C.white);
      return K.shadow(26) + `<g transform="rotate(-14 32 36)">` + lf(20, 12) + lf(33, 10) + lf(46, 14) + `</g>`;
    },
    sponge_cake: () => cake(C.wheat, C.yellowL, C.wheat),
    chocolate_sponge: () => cake(C.choc, C.brown, C.brownD),
    choux_pastry: () => {
      const puff = (x, y, r) =>
        `<path d="M${x - r} ${y + r * 0.4} C${x - r} ${y - r * 0.6} ${x - r * 0.5} ${y - r} ${x} ${y - r} C${x + r * 0.5} ${y - r} ${x + r} ${y - r * 0.6} ${x + r} ${y + r * 0.4} C${x + r} ${y + r * 0.7} ${x - r} ${y + r * 0.7} ${x - r} ${y + r * 0.4} Z" fill="${C.wheat}"/>` +
        K.line(`M${x - r * 0.6} ${y - r * 0.3} L${x - r * 0.2} ${y - r * 0.5} L${x + r * 0.1} ${y - r * 0.2} L${x + r * 0.5} ${y - r * 0.5} M${x - r * 0.7} ${y + r * 0.1} L${x - r * 0.2} ${y} L${x + r * 0.3} ${y + r * 0.15} L${x + r * 0.7} ${y - r * 0.05}`, 1.3, C.wheatD) +
        K.hiE(x - r * 0.4, y - r * 0.6, r * 0.25, r * 0.12);
      return K.shadow(26) + puff(42, 26, 13) + puff(20, 34, 13) + puff(40, 48, 13);
    },
    vanilla_ice_cream: () =>
      K.shadow(18) +
      `<path d="M14 36 H50 L45 56 C45 57 44 58 42 58 H22 C20 58 19 57 19 56 Z" fill="${C.blueL}"/>` + K.line('M17 44 H47', 1.4, C.blue) +
      `<path d="M10 36 C8 28 14 22 22 24 C24 14 40 14 42 24 C50 22 56 28 54 36 C50 39 46 36 42 38 C38 40 34 37 30 39 C26 41 22 37 18 39 C14 40 11 38 10 36 Z" fill="${C.creamL}"/>` +
      K.dots([[20, 30], [28, 22], [36, 24], [44, 30], [32, 32], [24, 34]], 0.8, C.choc) + K.hiE(26, 20, 3.5, 1.6),
    buttercream: () =>
      K.shadow(18) +
      `<path d="M16 50 C14 44 20 40 24 42 C22 34 30 30 34 34 C34 26 42 26 42 32 C48 32 50 40 46 44 C50 46 50 52 46 54 C40 58 22 58 16 50 Z" fill="${C.yellowL}"/>` +
      K.line('M20 48 C26 46 30 50 36 46 C40 44 44 48 46 46 M26 40 C30 38 34 42 40 38', 1.3, C.yellow) +
      `<path d="M40 30 L44 12 C50 5 58 9 60 20 Z" fill="${C.white}"/>` + `<path d="M40 30 L41.5 24 L46 26.5 Z" fill="${C.greyD}" stroke-width="2"/>` +
      K.line('M46 12 C50 10 55 13 57 18', 1.4, C.greyL) + K.hiE(26, 36, 3, 1.5),
    pastry_glaze: () =>
      creamBowl(C.pinkL, C.white,
        `<path d="M30 6 C34 4 40 6 40 10 C40 14 34 16 34 22 C34 26 33 28 32 28 C31 28 30 24 30 20 C30 16 26 10 30 6 Z" fill="${C.white}" stroke-width="2"/>` +
        `<path d="M24 28 C28 26 36 26 40 28 C36 30 28 30 24 28 Z" fill="${C.white}" stroke-width="1.4"/>`) + K.hi('M10 34 C12 40 16 45 20 48 L18 49 C14 46 10 41 9 35 Z'),
    marshmallows: () =>
      K.shadow(26) + cyl(20, 26, 10, 12, C.pinkL, C.white) + cyl(44, 28, 10, 12, C.white, C.creamL) + cyl(32, 40, 10, 12, C.white, C.creamL),
    nougat: () =>
      K.shadow(27) +
      `<path d="M4 34 L34 22 L60 32 L30 45 Z" fill="${C.creamL}"/>` +
      `<path d="M4 34 L30 45 V56 L4 45 Z" fill="${C.white}"/><path d="M30 45 L60 32 V43 L30 56 Z" fill="${C.cream}"/>` +
      K.line('M4 34 L30 45 L60 32', 1.6, C.creamD) +
      [[10, 41, C.brownL], [18, 46, C.leaf], [24, 49, C.brownL], [14, 44, C.brownL], [38, 46, C.leaf], [46, 42, C.brownL], [54, 38, C.brownL], [42, 48, C.brownL]]
        .map(([x, y, f]) => `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="1.6" fill="${f}" stroke-width="1"/>`).join('') +
      K.hi('M12 33 L34 24.5 L38 26 L16 35 Z'),
  });
})(FSI);
