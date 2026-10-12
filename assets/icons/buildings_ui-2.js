// UI icons: same line and palette as the item icons, simpler single objects, no ground shadow.
// Seasons are a set of tinted discs; weather icons share one cloud and one sun.
(function (FSI) {
  const { C, K } = FSI;
  const P = (d, f, w) => `<path d="${d}" fill="${f}"${w ? ` stroke-width="${w}"` : ''}/>`;
  const E = (cx, cy, rx, ry, f, w) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}"${w ? ` stroke-width="${w}"` : ''}/>`;
  const O = (cx, cy, r, f, w) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${w ? ` stroke-width="${w}"` : ''}/>`;
  const R = (x, y, w, h, f, rx = 1, sw) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}"${sw ? ` stroke-width="${sw}"` : ''}/>`;
  // outlined stroke: ink outline around a coloured line
  const OL = (d, col, w = 4) => `<path d="${d}" fill="none" stroke-width="${w + 5}"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  // white glyph line with no outline (on a coloured disc)
  const W = (d, w = 5.5, col = C.white) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/>`;

  // shared weather pieces
  const CLOUD = 'M15 42 C7 42 5 31 13 29.5 C13 20 25 16 30 23 C33 14 48 14 49 25 C57 24 61 33 56 39 C55 41 52 42 50 42 Z';
  const cloud = (fill = C.white, x = 32, y = 32, s = 1) =>
    K.place(P(CLOUD, fill) + (fill === C.white ? K.sh('M50 30 C55 32 57 37 53 40 C52 41 50 41.5 48 41.5 H40 C47 39 51 35 50 30 Z') : '') +
      K.hiE(20, 30, 4, 1.8, -20), x, y, s);
  const sun = (cx = 32, cy = 32, r = 13, ray = 9) => {
    let rays = '';
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4, b = 0.22;
      const p = (rr, t) => `${(cx + rr * Math.cos(t)).toFixed(1)} ${(cy + rr * Math.sin(t)).toFixed(1)}`;
      rays += `M${p(r + 2, a - b)} L${p(r + ray, a)} L${p(r + 2, a + b)} Z `;
    }
    return P(rays, C.yellow, 2) + O(cx, cy, r, C.yellow) + K.hiE(cx - r * 0.35, cy - r * 0.4, r * 0.35, r * 0.2);
  };
  const drop = (x, y, s = 1) =>
    P(`M${x} ${y - 6 * s} C${x + 4 * s} ${y - 1 * s} ${x + 4 * s} ${y + 3 * s} ${x} ${y + 3 * s} C${x - 4 * s} ${y + 3 * s} ${x - 4 * s} ${y - 1 * s} ${x} ${y - 6 * s} Z`, C.blue, 2);
  const flake = (cx, cy, r, col = C.white, w = 2.6) => {
    let d = '';
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
      const pt = (rr, da = 0) => `${(cx + rr * Math.cos(a + da)).toFixed(1)} ${(cy + rr * Math.sin(a + da)).toFixed(1)}`;
      d += `M${cx} ${cy} L${pt(r)} M${pt(r * 0.55)} L${pt(r * 0.8, 0.32)} M${pt(r * 0.55)} L${pt(r * 0.8, -0.32)} `;
      void c; void s;
    }
    return OL(d, col, w);
  };
  const disc = (bg, inner) => O(32, 32, 28, bg) + inner;
  const zig = (x, y, w, h, t = 4) =>
    P(`M${x} ${y} H${x + w} V${y + t} L${x + t * 1.6} ${y + h - t} H${x + w} V${y + h} H${x} V${y + h - t} L${x + w - t * 1.6} ${y + t} H${x} Z`, C.blueL, 2.2);
  const link = (cx, cy, rot, col, l = 26, h = 14) =>
    `<g transform="rotate(${rot} ${cx} ${cy})">` + OL(`M${cx - l / 2 + h / 2} ${cy - h / 2} H${cx + l / 2 - h / 2} A${h / 2} ${h / 2} 0 0 1 ${cx + l / 2 - h / 2} ${cy + h / 2} H${cx - l / 2 + h / 2} A${h / 2} ${h / 2} 0 0 1 ${cx - l / 2 + h / 2} ${cy - h / 2} Z`, col, 3.5) + `</g>`;
  const gear = (cx, cy, ro, ri, n, fill) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * 2 * Math.PI, st = (2 * Math.PI) / n;
      const pt = (r, a) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
      d += `${i ? 'L' : 'M'}${pt(ri, a0)} L${pt(ro, a0 + st * 0.12)} L${pt(ro, a0 + st * 0.45)} L${pt(ri, a0 + st * 0.57)} `;
    }
    return P(d + 'Z', fill);
  };
  const tri = (x, y, w, h) => P(`M${x} ${y} L${x + w} ${y + h / 2} L${x} ${y + h} Z`, C.white, 3);
  const toque = (dy = 0) =>
    P(`M18 ${30 + dy} C10 ${28 + dy} 10 ${14 + dy} 19 ${14 + dy} C20 ${6 + dy} 30 ${4 + dy} 33 ${10 + dy} C37 ${4 + dy} 48 ${6 + dy} 46 ${15 + dy} C54 ${15 + dy} 54 ${28 + dy} 46 ${30 + dy} Z`, C.white) +
    P(`M18 ${28 + dy} H46 V${36 + dy} H18 Z`, C.white) + K.line(`M25 ${21 + dy} V${28 + dy} M32 ${20 + dy} V${28 + dy} M39 ${21 + dy} V${28 + dy}`, 1.5, C.greyD) + K.hiE(20, 18 + dy, 3, 1.6);

  FSI.add('ui', {
    ui_money: () =>
      P('M22 20 C13 27 8 37 9 46 C10 55 18 59 32 59 C46 59 54 55 55 46 C56 37 51 27 42 20 Z', C.gold) +
      P('M23 20 L17 7 C23 10 27 5 32 8 C37 5 41 10 47 7 L41 20 Z', C.gold) +
      P('M21 20 C27 22.5 37 22.5 43 20', 'none', 4).replace('fill="none"', `fill="none" stroke="${C.brownD}"`) +
      K.line('M38 33 C37 29 27 29 27 34.5 C27 40 38 38 38 44.5 C38 50 28 50 26 46 M32 27 V52', 3.2, C.brownD) +
      K.hiE(17, 36, 2.6, 6, 20) + K.sh('M48 30 C53 37 54 46 51 52 C48 56 43 57 38 57 C46 52 50 42 48 30 Z'),
    ui_sell: () =>
      P('M18 26 C10 19 6 21 3 16 C6 25 7 30 13 33 C8 33 6 36 4 39 C11 39 15 38 19 36 Z', C.white, 2.2) +
      P('M46 26 C54 19 58 21 61 16 C58 25 57 30 51 33 C56 33 58 36 60 39 C53 39 49 38 45 36 Z', C.white, 2.2) +
      `<g transform="rotate(-8 32 34)">` + R(14, 22, 36, 24, C.leaf, 3) + R(18, 26, 28, 16, C.leafL, 2, 1.6) +
      E(32, 34, 5, 6, C.leaf, 1.6) + K.line('M33.5 31.5 C33 30.5 30.5 30.5 30.5 32.5 C30.5 34.5 33.8 33.8 33.8 35.8 C33.8 37.8 31 37.8 30.5 36.6 M32.2 29.8 V38.3', 1.3) + `</g>`,
    ui_market: () =>
      K.line('M12 26 V56 M52 26 V56', 3.5, C.woodD) +
      R(6, 40, 52, 16, C.woodL, 2) + K.line('M6 47 H58', 1.5, C.woodD) +
      O(15, 37, 5, C.red, 2) + O(25, 37, 5, C.orange, 2) + O(39, 37, 5, C.leaf, 2) + O(49, 37, 5, C.yellow, 2) +
      P('M8 8 H56 L60 22 H4 Z', C.white) +
      P('M14.5 8 H22.5 L21.5 22 H11 Z M30 8 H38 V22 H30 Z M45.5 8 H53.5 L57 22 H46.5 Z', C.red, 2) +
      P('M4 22 C4 27 11 27 11 22 C11 27 18.5 27 18.5 22 C18.5 27 25.5 27 25.5 22 C25.5 27 32.5 27 32.5 22 C32.5 27 39.5 27 39.5 22 C39.5 27 46.5 27 46.5 22 C46.5 27 53 27 53 22 C53 27 60 27 60 22 Z', C.red, 2),
    ui_warehouse: () =>
      P('M6 22 L32 10 L58 22 L32 34 Z', C.woodL) +
      P('M6 22 V46 L32 58 V34 Z', C.wood) + P('M58 22 V46 L32 58 V34 Z', C.woodD) +
      P('M16.7 17 L42.7 29 L47.3 27 L21.3 15 Z M42.7 29 V39 L47.3 37 V27 Z', C.creamD, 1.8) +
      K.hi('M9 26 L12 27.5 V44 L9 42.5 Z'),
    ui_testkitchen: () =>
      `<g transform="rotate(30 32 32)">` +
      P('M24 8 H40 V50 C40 55 36 58 32 58 C28 58 24 55 24 50 Z', C.glass) +
      P('M25.3 30 H38.7 V50 C38.7 54 35.5 56.7 32 56.7 C28.5 56.7 25.3 54 25.3 50 Z', C.leaf, 0.1) +
      P('M24 8 H40 V50 C40 55 36 58 32 58 C28 58 24 55 24 50 Z', 'none') + K.line('M25 30 H39', 1.6, C.leafD) +
      R(21, 4, 22, 6, C.glass, 2.5) + K.dots([[30, 40], [35, 47], [31, 51]], 1.8, C.leafL) +
      K.hi('M27 13 H29.5 V44 H27 Z') + `</g>` +
      O(16, 12, 3, C.leafL, 1.8) + O(9, 21, 2, C.leafL, 1.6),
    ui_cookbook: () =>
      P('M4 16 C14 12 24 13 32 18 C40 13 50 12 60 16 V54 C50 50 40 51 32 56 C24 51 14 50 4 54 Z', C.red) +
      P('M8 12 C16 9 25 10 32 15 V51 C25 47 16 46 8 48 Z', C.creamL) +
      P('M56 12 C48 9 39 10 32 15 V51 C39 47 48 46 56 48 Z', C.cream) +
      K.line('M13 20 C18 18.5 23 19 27 21 M13 27 C18 25.5 23 26 27 28 M13 34 C18 32.5 23 33 27 35 M37 21 C41 19 46 18.5 51 20 M37 28 C41 26 46 25.5 51 27', 1.6, C.greyD) +
      `<circle cx="44" cy="37" r="4.5" fill="${C.orange}" stroke-width="1.8"/>`,
    ui_codex: () =>
      OL('M38 38 L55 55', C.woodD, 6) +
      O(26, 26, 19, C.steel) + O(26, 26, 14, C.glass, 2) + K.hiE(20, 19, 5, 2.6) +
      P('M34 21 C36 25 36 29 34 33', 'none', 2).replace('fill="none"', `fill="none" stroke="${C.blueL}"`),
    ui_orders: () =>
      R(11, 8, 42, 53, C.wood, 4) + R(16, 14, 32, 43, C.white, 2) +
      P('M24 6 C24 3 40 3 40 6 V13 H24 Z', C.steel) + O(32, 7.5, 1.6, C.greyD, 1.4) +
      K.line('M20 24 L22.5 27 L27 21 M20 35 L22.5 38 L27 32', 2.2, C.leafD) + K.line('M31 25 H43 M31 36 H43 M20 47 H43', 2, C.greyD),
    ui_goals: () =>
      O(29, 35, 25, C.red) + O(29, 35, 18, C.white) + O(29, 35, 11, C.red) + O(29, 35, 4.5, C.white, 2) +
      OL('M29 35 L52 12', C.woodD, 2.6) +
      P('M50 14 L50 4 L56 8 L56 12 Z', C.yellow, 2) + P('M50 14 L60 14 L56 8 L52 8 Z', C.yellow, 2) +
      K.hiE(14, 22, 3.5, 2),
    ui_settings: () =>
      gear(32, 32, 28, 21, 8, C.grey) + O(32, 32, 9, C.white) + K.hiE(20, 18, 4, 2.2),
    ui_flows: () => link(23, 38, -45, C.blue, 30, 15) + link(41, 26, -45, C.teal, 30, 15) +
      // re-draw a piece of the first link over the second to interlock
      `<g transform="rotate(-45 23 38)">` + OL('M30.5 30.5 A7.5 7.5 0 0 1 30.5 45.5', C.blue, 3.5) + `</g>`,
    ui_plan: () =>
      P('M4 14 L20 8 L34 14 L50 8 L60 12 V54 L50 60 L34 54 L20 60 L4 56 Z', C.cream) +
      P('M20 8 L34 14 V54 L20 60 Z', C.creamL, 2) + P('M50 8 L60 12 V54 L50 60 Z', C.creamD, 2) +
      P('M8 22 C14 18 18 26 24 30 C30 34 36 40 44 36', 'none', 2).replace('fill="none"', `fill="none" stroke="${C.red}" stroke-dasharray="3 3.5"`) +
      P('M44 36 C38 28 40 18 46 18 C52 18 54 28 46 36 Z', C.red, 2) + O(46, 23.5, 2.4, C.white, 1.4) +
      P('M8 44 C12 40 16 42 18 46 C14 50 10 50 8 44 Z', C.leafL, 1.6),
    ui_help: () =>
      O(32, 32, 27, C.blue) + K.hiE(18, 17, 6, 3) +
      W('M23 24 C23 13 41 13 41 24 C41 32 32 31 32 39', 6.5) + O(32, 49, 4, C.white, 0.1),
    ui_unknown: () =>
      O(32, 32, 27, C.greyL) + W('M23 24 C23 13 41 13 41 24 C41 32 32 31 32 39', 6.5, C.greyD) + O(32, 49, 4, C.greyD, 0.1),
    ui_close: () => OL('M14 14 L50 50 M50 14 L14 50', C.greyD, 6),
    ui_cancel: () => O(32, 32, 27, C.red) + K.hiE(18, 17, 6, 3) + W('M21 21 L43 43 M43 21 L21 43', 6.5),
    ui_check: () => O(32, 32, 27, C.leaf) + K.hiE(18, 17, 6, 3) + W('M19 33 L28 42 L45 23', 6.5),
    ui_time: () =>
      R(27, 3, 10, 6, C.steel, 2) + P('M30 9 H34 V13 H30 Z', C.greyD, 2) + K.line('M47 14 L51 10', 4) +
      O(32, 37, 23, C.steel) + O(32, 37, 18, C.white, 2) +
      K.line('M32 22 V25 M47 37 H44 M32 52 V49 M17 37 H20', 2) +
      K.line('M32 37 L32 27 M32 37 L40 42', 3, C.red) + O(32, 37, 2.4, C.ink, 0.1) + K.hiE(22, 25, 3.5, 2),
    ui_warning: () =>
      P('M28 9 C30 5.5 34 5.5 36 9 L59 51 C61 55 59 58 55 58 H9 C5 58 3 55 5 51 Z', C.yellow) +
      K.line('M32 22 V40', 6) + O(32, 49, 3.6, C.ink, 0.1) + K.hi('M27 15 L29 13 L14 46 L11 46 Z'),
    ui_idle: () => zig(30, 4, 28, 26, 6) + zig(14, 32, 20, 18, 5) + zig(4, 52, 10, 9, 3),
    ui_pause: () => R(13, 8, 14, 48, C.white, 4) + R(37, 8, 14, 48, C.white, 4),
    ui_play: () => P('M14 8 C14 5 17 4 19.5 5.5 L55 29 C57.5 30.5 57.5 33.5 55 35 L19.5 58.5 C17 60 14 59 14 56 Z', C.white),
    ui_fast: () =>
      P('M4 15 C4 12 7 11 9 12.5 L33 29.5 C35 31 35 33 33 34.5 L9 51.5 C7 53 4 52 4 49 Z', C.white) +
      P('M30 15 C30 12 33 11 35 12.5 L59 29.5 C61 31 61 33 59 34.5 L35 51.5 C33 53 30 52 30 49 Z', C.white),
    ui_faster: () =>
      P('M3 15 C3 12 6 11 8 12.5 L27 28.5 C29 30 29 34 27 35.5 L8 51.5 C6 53 3 52 3 49 Z', C.white) +
      P('M25 15 C25 12 28 11 30 12.5 L49 28.5 C51 30 51 34 49 35.5 L30 51.5 C28 53 25 52 25 49 Z', C.white) +
      R(51, 12, 8, 40, C.white, 2.5),
    ui_build: () =>
      // tower crane
      P('M18 58 V14 H28 V58 Z', C.yellow) + K.line('M18 22 L28 30 L18 38 L28 46 L18 54 M28 14 L18 22', 1.6, C.yellowD) +
      P('M4 10 H60 V16 H4 Z', C.yellow) + K.line('M10 10 L14 16 L18 10 M30 16 L34 10 L38 16 L42 10 L46 16 L50 10 L54 16', 1.4, C.yellowD) +
      P('M23 3 L18 10 H28 Z', C.yellowD, 2) + R(5, 16, 10, 7, C.greyD, 1, 2) +
      K.line('M50 16 V36', 1.8) + P('M45 36 H55 V44 H45 Z', C.red, 2) + P('M50 44 V50 C50 54 45 54 45 50', 'none', 2.4) +
      K.line('M10 58 H36', 3),
    ui_repair: () =>
      `<g transform="rotate(45 32 32)">` +
      P('M28 22 H36 V56 C36 59 28 59 28 56 Z', C.steel) +
      P('M21 6 C18 11 18 20 24 24 H40 C46 20 46 11 43 6 L38 9 V17 H26 V9 Z', C.steel) +
      K.hi('M30 26 H32 V54 H30 Z') + O(32, 52, 1.8, C.greyD, 1.4) + `</g>`,
    ui_tip: () =>
      P('M32 6 C19 6 12 15 12 25 C12 34 20 38 22 45 H42 C44 38 52 34 52 25 C52 15 45 6 32 6 Z', C.yellowL) +
      K.line('M27 44 C27 36 24 30 26 27 C28 26 30 30 32 30 C34 30 36 26 38 27 C40 30 37 36 37 44', 1.6, C.yellowD) +
      R(22, 45, 20, 10, C.steel, 2.5) + K.line('M22 50 H42', 1.6, C.greyD) + P('M27 55 H37 C37 59 27 59 27 55 Z', C.greyD, 2) +
      K.hiE(21, 19, 4, 2.4) + K.line('M5 10 L9 13 M59 10 L55 13 M3 27 H7 M61 27 H57', 2.4, C.yellowD),
    ui_celebrate: () =>
      P('M6 58 L18 22 L42 46 Z', C.purple) + K.line('M10 46 L18 54 M14 34 L30 50', 3, C.yellow) +
      P('M18 22 C22 18 34 26 42 46 C38 50 22 38 18 22 Z', C.purpleD, 2.2) +
      K.line('M30 26 C30 18 36 16 34 8 M38 32 C44 28 50 32 56 26', 2.6, C.red) +
      R(44, 10, 5, 5, C.yellow, 1, 1.8) + R(52, 40, 5, 5, C.leaf, 1, 1.8) + O(24, 10, 2.6, C.blue, 1.8) +
      O(56, 16, 2.6, C.pink, 1.8) + O(46, 22, 2, C.orange, 1.6),
    ui_trophy: () =>
      OL('M16 14 C4 14 6 32 20 32 M48 14 C60 14 58 32 44 32', C.gold, 3) +
      P('M14 6 H50 V16 C50 30 42 38 32 38 C22 38 14 30 14 16 Z', C.gold) +
      P('M28 37 H36 V46 H28 Z', C.gold, 2.2) + R(18, 46, 28, 6, C.gold, 1.5, 2.2) + R(14, 52, 36, 7, C.woodD, 2) +
      K.hi('M18 10 H22 V20 C22 26 24 29 26 31 C21 30 18 24 18 18 Z') + K.sh('M44 10 H48 V16 C48 28 42 35 34 37 C40 32 44 24 44 10 Z'),
    ui_delete: () =>
      P('M12 18 H52 L48 56 C48 59 46 60 44 60 H20 C18 60 16 59 16 56 Z', C.grey) +
      K.line('M24 26 L25.5 52 M32 26 V52 M40 26 L38.5 52', 2.2, C.greyD) +
      R(7, 11, 50, 7, C.greyL, 2.5) + P('M25 11 V7 C25 5 26 4 28 4 H36 C38 4 39 5 39 7 V11', C.greyL) +
      K.hi('M17 22 H20 L22 52 H19.5 Z'),
    ui_save: () =>
      P('M6 10 C6 8 8 6 10 6 H48 L58 16 V54 C58 56 56 58 54 58 H10 C8 58 6 56 6 54 Z', C.blue) +
      R(16, 6, 28, 18, C.steel, 1) + R(34, 9, 6, 12, C.greyD, 1, 1.6) +
      R(13, 33, 38, 25, C.white, 2) + K.line('M18 41 H46 M18 48 H46', 1.6, C.greyL),
    ui_load: () =>
      P('M4 14 C4 12 5 11 7 11 H22 L27 16 H52 C54 16 55 17 55 19 V52 H4 Z', C.yellowD) +
      P('M16 12 H44 V40 H16 Z', C.white, 2) + K.line('M21 20 H39 M21 26 H39', 1.6, C.greyD) +
      P('M4 52 L13 26 C13.5 25 14.5 24 16 24 H59 C61 24 62 25 61 27 L54 52 Z', C.yellow) +
      K.hi('M16 28 H54 L53 31 H15 Z'),
    ui_new: () =>
      P('M10 4 H38 L50 16 V58 C50 59 49 60 48 60 H12 C11 60 10 59 10 58 Z', C.white) + P('M38 4 V16 H50 Z', C.greyL, 2) +
      K.line('M17 26 H38 M17 34 H34', 1.8, C.greyL) +
      O(44, 46, 15, C.leaf) + W('M44 38 V54 M36 46 H52', 5),
    ui_world: () =>
      O(32, 32, 27, C.blue) +
      P('M14 18 C20 12 28 12 30 16 C32 22 24 22 24 28 C24 34 30 34 28 40 C26 44 20 42 18 36 C16 30 9 28 14 18 Z', C.leaf, 2) +
      P('M40 10 C46 12 52 18 54 24 C50 26 46 22 42 24 C38 26 42 32 46 34 C52 36 54 42 48 50 C44 52 40 48 40 42 C40 38 34 36 34 30 C34 22 42 18 40 10 Z', C.leaf, 2) +
      K.hiE(19, 16, 6, 3),
    ui_arrow: () =>
      P('M6 24 H32 V11 C32 9 34 8 35.5 9.5 L57 30 C58.5 31.5 58.5 32.5 57 34 L35.5 54.5 C34 56 32 55 32 53 V40 H6 C5 40 4 39 4 38 V26 C4 25 5 24 6 24 Z', C.orange) +
      K.hi('M7 27 H34 V15 L37 18 V30 H7 Z'),
    ui_chain: () =>
      `<g transform="translate(32 32) scale(.86) rotate(-30) translate(-32 -32)">` +
      OL('M4 26 H20 A6 6 0 0 1 20 38 H4 A6 6 0 0 1 4 26 Z', C.steel, 3.5) +
      OL('M44 26 H60 A6 6 0 0 1 60 38 H44 A6 6 0 0 1 44 26 Z', C.steel, 3.5) +
      OL('M18 32 H46', C.greyL, 5) + OL('M22 29 H42 A3 3 0 0 1 42 35 H22 A3 3 0 0 1 22 29 Z', C.steel, 2) + `</g>`,
    ui_point: () =>
      P('M8 22 C14 20 22 20 30 22 H56 C60 22 60 30 56 30 H36 C39 30 40 33 39 35 C40 37 39 40 36 41 C38 42 38 46 34 47 C34 49 33 52 29 52 H16 C10 52 6 50 6 46 Z', C.pinkL) +
      K.line('M36 30 H30 M36 41 H30 M34 47 H29 M36 35 H30', 1.6, C.pinkD) +
      P('M3 20 H9 V54 H3 Z', C.blue, 2.2),
    ui_chef: () =>
      O(32, 44, 15, C.pinkL) + K.dots([[26.5, 44], [37.5, 44]], 1.8) + K.line('M27 50 C30 53 34 53 37 50', 1.8) +
      O(22, 49, 2.4, C.pink, 0.1) + O(42, 49, 2.4, C.pink, 0.1) + toque(-2),
    // Toques, the second currency: a big chef's hat with a gold band.
    ui_toque: () =>
      K.shadow(18, 59) + `<g transform="translate(32 34) scale(1.3) translate(-32 -20)">` + toque(0) +
      R(18, 28.5, 28, 7, C.gold, 1.5, 1.6) + K.hi('M20 30 H27 V32 H20 Z') + `</g>`,
    // Culinary Academy: a graduate's cap with a gold tassel.
    ui_academy: () =>
      K.shadow(18, 58) + P('M16 30 V44 C24 50 40 50 48 44 V30 L32 37 Z', C.greyD) +
      P('M3 25 L32 12 L61 25 L32 38 Z', C.ink) + K.hi('M10 25 L32 15 L36 17 L14 27 Z') +
      K.line('M32 25 L52 30 V44', 2.4, C.gold) + O(52, 46, 3.4, C.gold, 1.4),
    // Cuisines window: a plate between fork and knife.
    ui_cuisines: () =>
      O(32, 34, 19, C.white) + O(32, 34, 12.5, C.greyL, 1.6) + K.hiE(24, 26, 4, 2) +
      R(4, 14, 3, 14, C.steel, 1, 1.6) + R(8.5, 14, 3, 14, C.steel, 1, 1.6) + P('M4 26 H11.5 C11.5 31 10 33 7.8 33 C5.5 33 4 31 4 26 Z', C.steel, 1.6) + R(6.3, 32, 3, 22, C.steel, 1.5, 1.8) +
      P('M54 12 C60 16 60 30 58 34 H55 Z', C.steel, 1.8) + R(54.5, 33, 3.4, 21, C.steel, 1.5, 1.8),
    // Wholesaler: a delivery truck full of crates.
    ui_wholesaler: () =>
      K.shadow(27, 56) + R(4, 18, 36, 28, C.woodL, 2) + K.line('M4 27 H40 M4 36 H40 M16 18 V46 M28 18 V46', 1.6, C.woodD) +
      P('M40 26 H51 C53 26 54 27 55 29 L60 37 V46 H40 Z', C.red) + P('M44 29 H51 L55.5 36 H44 Z', C.blueL, 1.8) +
      K.sh('M40 42 H60 V46 H40 Z') + O(14, 48, 6, C.ink) + O(14, 48, 2.4, C.greyL, 1) + O(50, 48, 6, C.ink) + O(50, 48, 2.4, C.greyL, 1),
    ui_factory: () =>
      P('M40 30 V6 H50 V30 Z', C.terracotta) + R(38.5, 4, 13, 4, C.redD, 1, 2) +
      P('M6 58 V28 L18 20 V28 L30 20 V28 L42 20 V28 L58 28 V58 Z', C.greyL) +
      P('M6 28 L18 20 V28 L30 20 V28 L42 20 V28', 'none', 2.5) +
      R(12, 36, 8, 7, C.blueL, 1, 2) + R(26, 36, 8, 7, C.blueL, 1, 2) + R(40, 36, 8, 7, C.blueL, 1, 2) +
      R(28, 48, 9, 10, C.woodD, 0.5, 2) + K.sh('M52 31 L58 28 V58 H52 Z'),
    ui_sprout: () =>
      P('M6 58 C8 48 20 44 32 44 C44 44 56 48 58 58 Z', C.brown) + K.dots([[18, 52], [28, 50], [44, 53]], 1.5, C.brownD) +
      K.line('M32 46 V30', 4, C.ink) + K.line('M32 46 V30', 1.6, C.leafD) +
      P('M32 30 C28 18 16 14 6 16 C8 28 20 34 32 30 Z', C.leaf) + K.line('M30 28 C24 24 18 21 12 19', 1.5, C.leafD) +
      P('M32 26 C34 14 46 8 58 10 C56 22 44 28 32 26 Z', C.leafL) + K.line('M34 24 C40 20 46 16 52 14', 1.5, C.leafD),

    // ---------------- seasons: tinted discs ----------------
    season_spring: () => {
      let petals = '';
      for (let i = 0; i < 5; i++) {
        const a = i * 72;
        petals += `<g transform="rotate(${a} 32 32)"><path d="M32 30 C25 24 24 13 29 10 C30.5 12 31.5 12 32 9.5 C32.5 12 33.5 12 35 10 C40 13 39 24 32 30 Z" fill="${C.pinkL}" stroke-width="2.2"/></g>`;
      }
      return disc(C.leafL, petals + O(32, 32, 5, C.yellow, 2) + K.dots([[32, 24], [39, 29], [36, 38], [28, 38], [25, 29]], 1.4, C.pinkD));
    },
    season_summer: () => disc(C.orangeL, sun(32, 32, 11, 9)),
    season_autumn: () =>
      disc(C.wheatL,
        P('M32 54 C32 50 31 46 32 44 C24 46 20 46 14 42 C16 40 16 38 12 34 C16 32 18 32 18 30 C14 24 14 20 15 18 C20 20 22 22 25 22 C26 18 28 12 32 8 C36 12 38 18 39 22 C42 22 44 20 49 18 C50 20 50 24 46 30 C46 32 48 32 52 34 C48 38 48 40 50 42 C44 46 40 46 32 44', C.orange, 2.2) +
        K.line('M32 54 V20 M32 36 L22 28 M32 36 L42 28 M32 44 L20 38 M32 44 L44 38', 1.6, C.orangeD)),
    season_winter: () => disc(C.blueL, flake(32, 32, 20, C.white, 3)),

    // ---------------- weather: shared sun and cloud ----------------
    weather_sunny: () => sun(32, 32, 15, 12),
    weather_rain: () => cloud(C.white, 32, 26, 1) + drop(20, 52) + drop(32, 56) + drop(44, 52),
    weather_showers: () => sun(42, 20, 10, 7) + cloud(C.white, 28, 34, 0.85) + drop(20, 55) + drop(34, 57),
    weather_drought: () =>
      sun(32, 18, 10, 7) +
      P('M3 44 C14 38 50 38 61 44 V54 C50 60 14 60 3 54 Z', C.wheat) + P('M3 44 C14 38 50 38 61 44 C50 50 14 50 3 44 Z', C.wheatL, 2.2) +
      K.line('M14 43 L20 46 L18 50 M30 41 L34 45 L31 48 L36 52 M46 43 L42 46 L47 49', 1.8, C.brownD),
    weather_frost: () =>
      P('M14 58 C16 52 24 50 32 50 C40 50 48 52 50 58 Z', C.brown) +
      K.line('M32 52 V34', 4, C.ink) + K.line('M32 52 V34', 1.6, C.blueD) +
      P('M32 36 C28 26 18 22 8 24 C10 34 20 40 32 36 Z', C.blueL) +
      P('M32 34 C34 24 44 18 54 20 C52 30 44 36 32 34 Z', C.blueL) +
      P('M14 32 L15 37 L17 33 L18 38 L20 34', C.white, 1.4) + K.hiE(16, 27, 3, 1.4, -10) +
      flake(48, 46, 9, C.white, 2.2) + flake(13, 12, 7, C.white, 2),
    weather_storm: () =>
      cloud(C.grey, 32, 24, 1) +
      P('M34 34 L24 48 H32 L27 60 L42 42 H34 L39 34 Z', C.yellow, 2.2) +
      K.line('M14 46 L11 52 M50 46 L47 52', 2.4, C.blue),
    weather_snow: () => cloud(C.white, 32, 24, 1) + flake(19, 50, 7, C.white, 2.2) + flake(45, 50, 7, C.white, 2.2) + flake(32, 57, 4.5, C.white, 1.8),
  });
})(FSI);
