// Buildings: small 3/4-view structures on a grass ellipse (like b_mill) or isometric tiles (like b_field),
// each recognisable by one strong prop. See assets/STYLE.md.
(function (FSI) {
  const { C, K } = FSI;
  const P = (d, f, w) => `<path d="${d}" fill="${f}"${w ? ` stroke-width="${w}"` : ''}/>`;
  const E = (cx, cy, rx, ry, f, w) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}"${w ? ` stroke-width="${w}"` : ''}/>`;
  const R = (x, y, w, h, f, rx = 1, sw) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}"${sw ? ` stroke-width="${sw}"` : ''}/>`;
  const grass = (rx = 28, cy = 55, ry = 6.5, f = C.leafL) => E(32, cy, rx, ry, f);
  // isometric ground tile
  const tile = (f) => P('M3 44 L32 29.5 L61 44 L32 58.5 Z', f);
  // 3/4 gabled building: front gable face x..x+w, side wall running back-right (depth d), eave e, gable height a.
  const house = ({ x = 24, w = 20, d = 14, e = 34, a = 11, g = 56, wall = C.cream, side = C.creamD, roof = C.terracotta }) => {
    const dy = d * 0.4, ax = x + w / 2, ay = e - a, r = x + w;
    const barge = `M${x - 2.5} ${e + 1.5} L${ax} ${ay - 1} L${r + 2.5} ${e + 1.5}`;
    return P(`M${r} ${g} V${e} L${r + d} ${e - dy} V${g - dy} Z`, side) +
      P(`M${ax} ${ay - 1} L${r + 2.5} ${e + 1.5} L${r + 2.5 + d} ${e + 1.5 - dy} L${ax + d} ${ay - 1 - dy} Z`, roof) +
      P(`M${x} ${g} V${e} L${ax} ${ay} L${r} ${e} V${g} Z`, wall) +
      `<path d="${barge}" fill="none" stroke-width="5.5"/><path d="${barge}" fill="none" stroke="${roof}" stroke-width="1.6"/>`;
  };
  const door = (x, w = 7, h = 11, g = 56, f = C.woodD) =>
    P(`M${x} ${g} V${g - h + w / 2} C${x} ${g - h - 1} ${x + w} ${g - h - 1} ${x + w} ${g - h + w / 2} V${g} Z`, f);
  const win = (x, y, w = 5, h = 6, f = C.blueL) => R(x, y, w, h, f, 1, 1.8);
  const puff = (x, y, r, f = C.greyL) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke-width="2"/>`;
  // small wooden barrel standing, centre-bottom (x, y), width w
  const barrel = (x, y, w = 12, h = 15, f = C.wood) =>
    P(`M${x - w / 2} ${y - h} H${x + w / 2} C${x + w / 2 + 2} ${y - h * 0.66} ${x + w / 2 + 2} ${y - h * 0.33} ${x + w / 2} ${y} H${x - w / 2} C${x - w / 2 - 2} ${y - h * 0.33} ${x - w / 2 - 2} ${y - h * 0.66} ${x - w / 2} ${y - h} Z`, f, 2) +
    K.line(`M${x - w / 2 - 1} ${y - h * 0.7} H${x + w / 2 + 1} M${x - w / 2 - 1} ${y - h * 0.3} H${x + w / 2 + 1}`, 1.8, C.greyD);
  // barrel lying on its side, front face round
  const keg = (x, y, r = 7, f = C.wood) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r - 2.5}" fill="${C.woodL}" stroke-width="1.4"/>` +
    `<circle cx="${x}" cy="${y}" r="1.2" fill="${C.woodD}" stroke="none"/>`;
  // round fruit tree: trunk base at (x, y)
  const tree = (x, y, r = 8, fruit = C.red) =>
    P(`M${x - 1.5} ${y} V${y - 9} H${x + 1.5} V${y} Z`, C.brown, 2) +
    `<circle cx="${x}" cy="${y - 13}" r="${r}" fill="${C.leaf}" stroke-width="2"/>` +
    K.hiE(x - r * 0.4, y - 13 - r * 0.45, r * 0.35, r * 0.2) +
    K.dots([[x - 3, y - 11], [x + 3.5, y - 14], [x - 1, y - 17], [x + 2, y - 8.5]].map(([a, b]) => [a, b]), 1.6, fruit);
  // round hanging sign with a glyph, hung from a bracket on a wall at (wx, wy) sticking out to the left
  const sign = (cx, cy, r, glyph, wx, wy, bg = C.creamL) =>
    K.line(`M${wx} ${wy} H${cx - 2} M${cx} ${wy} V${cy - r}`, 2) +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${bg}" stroke-width="2.2"/>` + glyph;
  const pine = (x, y, h = 30, w = 16) =>
    P(`M${x} ${y - h} L${x + w / 2} ${y - 4} H${x - w / 2} Z`, C.pine) +
    P(`M${x} ${y - h + 2} L${x + w * 0.4} ${y - h * 0.55} H${x - w * 0.4} Z`, C.leafD, 1.5) +
    P(`M${x - 1.5} ${y} V${y - 4} H${x + 1.5} V${y} Z`, C.brownD, 1.8);

  FSI.add('buildings', {
    // ---------------- Farming ----------------
    b_orchard: () =>
      tile(C.leaf) + K.line('M17.5 51 L46.5 36.5 M10 47.5 L39 33', 1.6, C.leafD) +
      tree(32, 37, 8, C.red) + tree(17, 46, 8.5, C.red) + tree(47, 46, 8.5, C.red) + tree(32, 54, 8.5, C.red),
    b_greenhouse: () =>
      grass() +
      house({ x: 8, w: 26, d: 22, e: 34, a: 13, wall: C.glass, side: C.blueL, roof: C.glass }) +
      K.line('M43 21.5 L39 30 M53 17.5 L49 26 M41 46 V35 M48 43 V32', 1.4, C.blueD) +
      // palm tree inside
      P('M23 56 C23 48 22 40 20 33', 'none', 2.5) + K.line('M23 56 C23 48 22 40 20 33', 1.2, C.brownL) +
      P('M20 33 C15 28 11 30 10 34 C14 32 17 33 20 33 Z', C.leaf, 1.8) + P('M20 33 C24 27 30 28 32 32 C28 30 24 31 20 33 Z', C.leaf, 1.8) +
      P('M20 33 C17 26 19 22 22 21 C21 25 21 29 20 33 Z', C.leafD, 1.8) + P('M20 33 C26 33 30 37 30 41 C27 37 24 35 20 33 Z', C.leafD, 1.8) +
      `<circle cx="21" cy="35.5" r="1.8" fill="${C.brown}" stroke-width="1.4"/>` +
      K.line('M8 44 H34 M21 21.5 V56', 1.4, C.blueD) + K.hi('M11 37 L14 34 V54 H11 Z'),
    b_mushroom: () =>
      grass() +
      P('M6 55 C6 36 20 22 34 22 C49 22 59 36 59 55 Z', C.leaf) +
      K.line('M14 34 C20 27 27 24 34 24', 2, C.leafL) + K.sh('M50 30 C56 37 58 46 58 55 H52 C53 46 53 38 50 30 Z') +
      P('M20 56 V43 C20 32 40 32 40 43 V56 Z', C.grey) +
      K.line('M23 36.5 L21 34 M30 33.5 V30.5 M37 36.5 L39 34', 2) +
      P('M24 56 V44 C24 37 36 37 36 44 V56 Z', C.woodD) + K.line('M30 39 V56', 1.5) +
      `<circle cx="33" cy="48" r="1.3" fill="${C.yellow}" stroke="none"/>` +
      // mushrooms
      P('M48 57 V49 H53 V57 Z', C.creamL, 2) + P('M42 50 C42 41 59 41 59 50 Z', C.brownL, 2.2) + K.hiE(47, 45, 3, 1.4) +
      P('M10 57 V52 H13.5 V57 Z', C.creamL, 1.8) + P('M6.5 52.5 C6.5 46 17 46 17 52.5 Z', C.brownL, 2),
    b_forager: () =>
      grass() + pine(14, 50, 40, 20) +
      house({ x: 24, w: 20, d: 12, e: 36, a: 12, wall: C.wood, side: C.woodD, roof: C.brownD }) +
      K.line('M24 41 H44 M24 46 H44 M24 51 H44', 1.5, C.woodD) + door(31, 7, 12) +
      // basket of mushrooms and berries
      P('M10 45 C12 41 16 41 17 45 Z', C.brownL, 1.8) + P('M17 45 C18 41 22 41 23 45 Z', C.creamL, 1.8) +
      K.dots([[25, 44.5], [27.5, 43.5]], 2, C.redD) +
      P('M7 45 H28 L25 56 H10 Z', C.woodL) + K.line('M8.5 49.5 H26.5 M9.5 53 H25.5 M14 45 V56 M21 45 V56', 1.3, C.woodD),
    // ---------------- Animals ----------------
    b_pasture: () =>
      grass() +
      house({ x: 26, w: 20, d: 12, e: 32, a: 12, wall: C.red, side: C.redD, roof: C.greyD }) +
      R(30, 42, 12, 14, C.cream, 0.5) + K.line('M30 42 L42 56 M42 42 L30 56', 1.8) +
      P('M33 27 H39 V31 H33 Z', C.creamL, 1.8) +
      // no animal: the map badge shows which one the barn holds
      // round hay bale
      `<circle cx="47" cy="51" r="5.5" fill="${C.wheat}" stroke-width="2"/>` + K.line('M44 49 C46 47.5 48.5 48 49.5 50', 1.3, C.wheatD) +
      // wooden fence running along the front-left
      K.line('M6 42 V56 M14 41 V55 M22 40 V54', 3.5, C.woodD) +
      K.line('M6 42 V56 M14 41 V55 M22 40 V54', 1.5, C.wood) +
      P('M3 44 L26 41 V44 L3 47 Z', C.wood, 1.8) + P('M3 50 L26 47 V50 L3 53 Z', C.wood, 1.8),
    b_pigsty: () =>
      grass() +
      house({ x: 30, w: 18, d: 10, e: 40, a: 9, wall: C.woodL, side: C.wood, roof: C.terracotta }) +
      door(35, 8, 11) +
      E(22, 53, 15, 4, C.brown) +
      // pig facing left
      P('M15 46 V53 H19 V48 M30 46 V53 H34 V47', C.pinkD, 2.2) +
      P('M12 39 C12 32 18 30 25 30 C33 30 37 34 37 40 C37 46 32 48 25 48 C18 48 12 46 12 39 Z', C.pink) +
      P('M7 37 C7 34 9 33 12 33 V43 C9 43 7 42 7 39 Z', C.pinkL) + K.dots([[9.3, 36.5], [9.3, 39.5]], 1.1) +
      P('M14 31 L13 24 L19 29 Z', C.pinkD, 2) + K.dots([[15.5, 35]], 1.5) +
      P('M37 37 C41 36 41 32 38.5 32.5 C37 33 38 35 40 34', 'none', 1.8) + K.hiE(22, 33.5, 5, 1.8, 0),
    b_coop: () =>
      grass() + K.line('M30 48 V56 M46 48 V56 M53 45 V52', 2.5, C.woodD) +
      house({ x: 26, w: 22, d: 10, e: 34, a: 11, g: 48, wall: C.yellowL, side: C.yellowD, roof: C.red }) +
      P('M33 48 V42 C33 38 40 38 40 42 V48 Z', C.ink) +
      P('M33 48 L24 56 H28 L37 48 Z', C.wood, 2) +
      // no bird: the map badge shows which animal the house holds
      // feed trough and a fenced run
      K.line('M4 38 V56 M13 37 V56 M22 36 V56', 2.6, C.woodD) +
      K.line('M3 40 L25 37.5 M3 44.5 L25 42', 1.8, C.wood) +
      P('M6 49 H24 L22 54 H8 Z', C.wood, 2) + P('M8 49 H22 L21 51 H9 Z', C.wheatL, 1.4) + K.line('M10 54 V57 M20 54 V57', 2.2, C.woodD),
    b_apiary: () => {
      const hive = (x, y, f) =>
        R(x - 9, y - 18, 18, 16, f, 1) + K.line(`M${x - 9} ${y - 10} H${x + 9}`, 1.6, C.yellowD) +
        P(`M${x - 11} ${y - 18} L${x} ${y - 25} L${x + 11} ${y - 18} Z`, C.white, 2.2) +
        R(x - 4, y - 5.5, 8, 2.5, C.ink, 1, 1) + P(`M${x - 8} ${y - 2} V${y + 1} M${x + 8} ${y - 2} V${y + 1}`, 'none', 2.2);
      return grass() + hive(20, 51, C.yellow) + hive(44, 47, C.yellow) +
        K.dots([[33, 55], [55, 53], [9, 52]], 1.8, C.pink) + K.dots([[31, 52], [50, 56]], 1.8, C.white) +
        // bee
        P('M32 13 C30 7 35 5 36 10 M38 13 C40 7 45 8 41 13', C.white, 1.6) +
        E(37, 17, 7, 5, C.yellow) + K.line('M35 12.3 V21.7 M39 12.3 V21.7', 2) + `<circle cx="29" cy="17" r="3" fill="${C.ink}"/>` +
        K.line('M44 17 H46', 2) + K.line('M27 31 C24 27 30 25 28 22', 1.4, C.greyD);
    },
    b_fishfarm: () => {
      const pen = (x, y, rx, ry) =>
        E(x, y, rx, ry, C.wood) + E(x, y - 0.5, rx - 3, ry - 2, C.blueD, 1.6) +
        K.line(`M${x - rx + 4} ${y} H${x + rx - 4} M${x} ${y - ry + 2.5} V${y + ry - 2.5}`, 1.1, C.blueL);
      return tile(C.blue) + K.line('M12 40 C15 38 18 38 21 40 M41 53 C44 51 47 51 50 53', 1.6, C.blueL) +
        pen(22, 46, 12, 6.5) + pen(41, 38, 12, 6.5) +
        // leaping fish
        P('M30 24 C36 17 46 17 51 22 C47 26 39 28 30 24 Z', C.pinkD) + P('M51 22 L57 17 L56 25 Z', C.pinkD, 2) +
        `<circle cx="35" cy="22" r="1.3" fill="${C.ink}" stroke="none"/>` + K.hi('M37 20 C41 18 45 18 48 20 C44 20 40 21 37 22 Z') +
        K.line('M26 30 L28 27 M32 30 V27', 1.6, C.blueD);
    },
    // ---------------- Resources ----------------
    b_well: () =>
      grass() +
      K.line('M17 40 V12 M47 40 V12', 3.5, C.woodD) +
      P('M11 15 L32 5 L53 15 Z', C.terracotta) + K.sh('M32 5 L53 15 H44 Z') +
      K.line('M17 22 H47', 2) + K.line('M32 22 V30', 1.4) +
      P('M28 30 H36 L35 36 H29 Z', C.wood, 1.8) +
      P('M47 22 H51 V26', 'none', 2) +
      P('M12 38 V51 C12 58 52 58 52 51 V38 Z', C.grey) +
      E(32, 38, 20, 5.5, C.greyL) + E(32, 38.5, 15, 3.4, C.blueD, 1.8) +
      K.line('M12 45 C20 49 44 49 52 45 M22 41.5 V48.5 M42 41.5 V48.5 M32 49.5 V56.5 M18 49 V55 M46 49 V55', 1.4, C.greyD) +
      K.hi('M14 42 C15 43 16 44 18 44.5 V52 C16 51.5 15 51 14 50 Z'),
    b_saltpan: () => {
      const cell = (x, y) => P(`M${x} ${y} L${x + 9} ${y - 4.5} L${x + 18} ${y} L${x + 9} ${y + 4.5} Z`, C.blueL, 1.6);
      return tile(C.creamD) +
        cell(9, 44) + cell(19.5, 38.75) + cell(30, 33.5) + cell(19.5, 49.25) + cell(30, 44) + cell(40.5, 38.75) +
        // salt heaps
        P('M24 40 C26 30 30 26 32 26 C34 26 38 30 40 40 C36 42 28 42 24 40 Z', C.white) + K.sh('M34 28 C37 31 39 36 40 40 C38 41 36 41.5 34 41.5 Z') +
        P('M42 50 C44 43 46 41 48 41 C50 41 53 44 55 50 C52 52 45 52 42 50 Z', C.white) + K.sh('M49 42 C51 44 53 47 55 50 C53 51 51 51.5 49 51.5 Z') +
        // rake
        K.line('M7 22 L17 40', 2.6, C.woodD) + K.line('M11.5 43.5 L22 37', 3.2) + K.line('M13.5 42.3 L15 45 M17.5 40 L19 42.6', 1.6);
    },
    b_quarry: () =>
      E(32, 55, 28, 6.5, C.creamD) +
      P('M4 54 L8 30 L18 18 L30 22 L40 10 L54 16 L60 34 L59 52 Z', C.grey) +
      P('M8 30 L18 18 L30 22 L24 30 Z M30 22 L40 10 L54 16 L44 22 Z', C.greyL, 2) +
      K.line('M48 24 L52 36 M12 40 L16 36', 1.6, C.greyD) +
      P('M20 54 V40 C20 31 38 31 38 40 V54 Z', C.ink) +
      P('M18 54 V37 H21 V54 Z M37 54 V37 H40 V54 Z M16 34 H42 V38 H16 Z', C.wood, 2) +
      // mine cart with rocks
      P('M33 40 C35 36 39 36 40 39 C42 35 47 35 48 39 C50 36 55 37 54 41 Z', C.greyL, 1.8) +
      P('M31 41 H56 L53 52 H34 Z', C.redD) + K.line('M33 46 H54', 1.4, C.ink) +
      `<circle cx="38" cy="53" r="3" fill="${C.greyD}" stroke-width="2"/><circle cx="49" cy="53" r="3" fill="${C.greyD}" stroke-width="2"/>`,
    b_dock: () =>
      E(32, 50, 29, 11, C.blue) + K.line('M10 52 C13 50 16 50 19 52 M42 57 C45 55 48 55 51 57', 1.6, C.blueL) +
      // pier
      P('M30 61 L58 41 L62 44 L35 62 Z', C.woodL, 2) + K.line('M37 56 L41 59 M44 51 L48 54 M51 46 L55 49', 1.5, C.woodD) +
      K.line('M39 58 V62 M53 48 V53', 2.5, C.woodD) +
      // fishing boat
      K.line('M24 40 V10', 2.5) + P('M25 12 L42 36 H25 Z', C.creamL, 2.2) + P('M23 13 L10 34 H23 Z', C.cream, 2.2) +
      P('M4 37 H50 C47 46 42 50 32 50 H14 C9 50 6 44 4 37 Z', C.red) + R(4, 37, 46, 3.5, C.white, 0.5, 2) +
      K.dots([[14, 44], [21, 44]], 1.5, C.redD) + K.sh('M40 40 H49 C47 45 43 49 34 50 C40 47 42 44 40 40 Z'),
    // ---------------- Processing ----------------
    b_feedmill: () =>
      grass() +
      house({ x: 8, w: 20, d: 12, e: 36, a: 10, wall: C.woodL, side: C.wood, roof: C.red }) + door(14, 8, 12) +
      P('M36 56 V17 C36 8 54 8 54 17 V56 Z', C.steel) + P('M36 17 C36 8 54 8 54 17 C49 19 41 19 36 17 Z', C.greyL) +
      K.line('M36 27 C41 29 49 29 54 27 M36 37 C41 39 49 39 54 37 M36 47 C41 49 49 49 54 47', 1.5, C.greyD) +
      K.sh('M49 18 C51 18 53 17.5 54 17 V56 H49 Z') + K.hi('M38 20 H40.5 V52 H38 Z') +
      // feed sack
      P('M22 56 C21 50 22 46 24 44 L23 41 H33 L32 44 C34 46 35 50 34 56 Z', C.cream, 2.2) + K.line('M23.5 44 H32.5', 1.8, C.brown) +
      K.dots([[26, 50], [30, 49], [28, 53]], 1.4, C.yellowD),
    b_press: () =>
      grass() +
      house({ x: 34, w: 16, d: 9, e: 36, a: 9, wall: C.cream, side: C.creamD, roof: C.terracotta }) + door(39, 6, 10) +
      // screw press: frame, screw, plate, tub
      P('M8 54 V14 H13 V54 Z M31 54 V14 H36 V54 Z', C.woodD, 2.2) + R(5, 10, 34, 6, C.wood, 1, 2.2) +
      P('M20 16 V32 H24 V16 Z', C.steel, 2) + K.line('M20 20 L24 22 M20 24 L24 26 M20 28 L24 30', 1.3, C.greyD) +
      K.line('M11 22 H33', 3.5) + K.line('M11 22 H33', 1.2, C.greyL) +
      R(12, 32, 20, 4, C.wood, 1, 2) +
      P('M11 37 H33 L31 54 H13 Z', C.wood) + K.line('M12 42 H32 M12.5 48 H31.5', 1.8, C.greyD) +
      P('M14 37 C14 34 30 34 30 37 Z', C.leaf, 1.8) +
      P('M31 47 H37 V50', 'none', 2.2) + P('M37 52 C35 55 37 57 38.5 57 C40 57 41 55 39 52 L38 49.5 Z', C.yellow, 1.8),
    b_dairy: () =>
      grass() +
      house({ x: 28, w: 18, d: 11, e: 33, a: 11, wall: C.white, side: C.greyL, roof: C.blue }) + door(33.5, 7, 11) +
      `<circle cx="37" cy="27.5" r="2.6" fill="${C.blueL}" stroke-width="1.8"/>` +
      // milk churn
      P('M7 57 V39 C7 36 10 35 12 34 V30 H22 V34 C24 35 27 36 27 39 V57 Z', C.steel) +
      R(10, 25, 14, 5, C.greyL, 2, 2) + K.line('M7 44 H27', 1.6, C.greyD) +
      P('M7 39 C3 39 3 45 7 45 M27 39 C31 39 31 45 27 45', 'none', 2.2) + K.hi('M9.5 40 H12 V54 H9.5 Z') +
      // cheese wedge
      P('M21 50 L33 44 L40 49 V55 L28 59 L21 56 Z', C.yellow, 2.2) + P('M21 50 L33 44 L40 49 L28 53 Z', C.yellowL, 2.2) + K.line('M28 53 V59', 2) +
      K.dots([[33, 54.5], [24, 54]], 1.3, C.yellowD),
    b_butcher: () =>
      grass() +
      house({ x: 22, w: 24, d: 12, e: 34, a: 12, wall: C.white, side: C.greyL, roof: C.redD }) +
      R(34, 42, 9, 14, C.woodD, 0.5) + R(25, 44, 7, 7, C.blueL, 1, 1.8) +
      P('M20 36 H48 L50 42 H18 Z', C.white) +
      P('M22.5 36 H27 L26.5 42 H21 Z M31.8 36 H36.2 L36.4 42 H31.6 Z M41 36 H45.5 L47.6 42 H43 Z', C.red, 1.6) +
      P('M18 42 H50', 'none', 2.5) +
      // ham hanging from a hook
      K.line('M22 18 H11 M11 18 V21', 2) + P('M11 21 C8.5 21 8.5 24 11 24', 'none', 1.8) +
      `<circle cx="9.5" cy="27" r="2.6" fill="${C.fat}" stroke-width="2"/><circle cx="13.5" cy="27" r="2.6" fill="${C.fat}" stroke-width="2"/>` +
      P('M10 29 H13 C15 33 20 37 20 44 C20 50 15 53 10 53 C5 53 2 49 3 43 C4 37 8 34 10 29 Z', C.meat) +
      P('M10 29 H13 C14 32 15 33 16 35 C13 36 9 36 7 34.5 C8 33 9 31 10 29 Z', C.fat, 1.8) +
      K.hiE(7, 41, 1.6, 3.5, 15) + K.sh('M17 39 C19 42 19 49 15 52 C18 50 20 47 20 44 C20 42 19 40 17 39 Z'),
    b_smokehouse: () =>
      grass() +
      P('M42 31 V15 H50 V27 Z', C.terracotta) + K.line('M42 20 H50 M42 25 H48', 1.4, C.redD) + R(40.5, 12, 11, 4, C.redD, 1, 2) +
      P('M40 11 C35 11 34 6 38.5 5.5 C39 2 44.5 2 46 4.5 C48 1.5 55 2 55 6 C59.5 6 60 11 55.5 11 Z', C.greyL, 2.2) +
      `<circle cx="32" cy="7" r="2.6" fill="${C.greyL}" stroke-width="2"/>` +
      house({ x: 12, w: 24, d: 14, e: 38, a: 11, wall: C.brown, side: C.brownD, roof: C.greyD }) +
      K.line('M12 43 H36 M12 49 H36', 1.4, C.brownD) +
      R(18, 41, 12, 15, C.ink, 0.5) + K.line('M18 43 H30', 1.6, C.greyL) +
      P('M20.5 43 C19 46 19 50 21 53 C23 54 25 53 24.5 50 C24 47 23 45 22 43 Z', C.meat, 1.6) +
      P('M26.5 43 C25 46 25.5 51 27 53 M28.5 43 C27.5 46 27.5 51 29 53', 'none', 2.6).replace('fill="none"', `fill="none" stroke="${C.meatD}"`) +
      K.line('M12 56 H36', 0.1),
    b_fishery: () =>
      grass() +
      house({ x: 26, w: 20, d: 12, e: 34, a: 11, wall: C.blueL, side: C.blue, roof: C.teal }) + door(32.5, 7, 11) +
      sign(13, 37, 10.5,
        P('M5 37 C9 31 16 31 20 37 C16 43 9 43 5 37 Z', C.orange, 2) + P('M20 37 L24 33 V41 Z', C.orange, 2).replace('', '') +
        `<circle cx="9" cy="36" r="1.1" fill="${C.ink}" stroke="none"/>` + K.line('M14 34 C15 36 15 38 14 40', 1.3, C.orangeD), 26, 22) +
      // tin can
      P('M8 57 V49 H20 V57 Z', C.steel, 2) + E(14, 49, 6, 1.8, C.greyL, 2) + R(8, 51.5, 12, 3.5, C.red, 0, 1.4),
    b_spice: () => {
      const sack = (x, y, heap) =>
        P(`M${x - 8} ${y} C${x - 10} ${y - 6} ${x - 9} ${y - 11} ${x - 7} ${y - 13} H${x + 7} C${x + 9} ${y - 11} ${x + 10} ${y - 6} ${x + 8} ${y} Z`, C.creamD, 2.2) +
        P(`M${x - 7} ${y - 13} C${x - 6} ${y - 21} ${x + 6} ${y - 21} ${x + 7} ${y - 13} Z`, heap, 2) +
        P(`M${x - 8.5} ${y - 13} C${x - 4} ${y - 11} ${x + 4} ${y - 11} ${x + 8.5} ${y - 13}`, 'none', 3).replace('fill="none"', `fill="none" stroke="${C.brown}"`);
      return grass() +
        house({ x: 30, w: 18, d: 10, e: 32, a: 11, wall: C.orangeL, side: C.orange, roof: C.redD }) + door(35.5, 7, 11) +
        sack(12, 52, C.red) + sack(29, 57, C.yellow) +
        P('M6 32 C10 31 15 33 18 37 C14 37 9 36 6 32 Z', C.red, 1.8) + K.line('M18 37 L21 36', 2, C.leafD);
    },
    b_sugar: () => {
      const cube = (x, y, s = 9) =>
        P(`M${x} ${y} L${x + s} ${y - s * 0.5} L${x + 2 * s} ${y} L${x + s} ${y + s * 0.5} Z`, C.white, 2) +
        P(`M${x} ${y} V${y + s} L${x + s} ${y + s * 1.5} V${y + s * 0.5} Z`, C.greyL, 2) +
        P(`M${x + 2 * s} ${y} V${y + s} L${x + s} ${y + s * 1.5} V${y + s * 0.5} Z`, C.steel, 2) +
        K.dots([[x + s * 0.7, y + s * 0.7], [x + s * 0.4, y + s * 1.1], [x + s * 1.4, y + s * 0.9]], 0.8, C.grey);
      return grass() +
        house({ x: 28, w: 20, d: 10, e: 32, a: 11, wall: C.cream, side: C.creamD, roof: C.purple }) + door(34.5, 7, 11) +
        win(35.5, 26, 5, 4) +
        cube(4, 44) + cube(22, 44) + cube(13, 35.5) +
        // sugar cane
        K.line('M50 56 L54 22', 4, C.ink) + K.line('M50 56 L54 22', 1.6, C.leafL) + K.line('M50.6 46 L52.6 46.4 M51.8 36 L53.8 36.4', 1.4) +
        P('M54 22 C58 18 60 17 61 18 C59 21 56 23 54 22 Z', C.leaf, 1.6);
    },
    b_roastery: () =>
      grass() +
      house({ x: 26, w: 20, d: 12, e: 34, a: 11, wall: C.brownL, side: C.brown, roof: C.choc }) + door(32.5, 7, 11) +
      K.line('M49 17 V22', 3.5) + R(46.5, 14, 6, 3.5, C.greyD, 1, 1.8) + K.line('M47 12 C45 9 49 7 47 4 M52 12 C50 9 54 7 52 4', 2, C.greyD) +
      sign(13, 38, 11,
        P('M7 34 C9 28 18 28 19.5 34 C21 41 16 46 12 45.5 C7 45 5.5 39 7 34 Z', C.brownD, 2.2) +
        K.line('M14 29.5 C11 34 16 39 11.5 45', 1.8) + K.hiE(10, 33, 2, 1.1), 26, 22),
    b_brewery: () =>
      grass() +
      house({ x: 26, w: 20, d: 12, e: 34, a: 11, wall: C.cream, side: C.creamD, roof: C.terracotta }) + door(32.5, 7, 11) +
      `<circle cx="36" cy="27.5" r="2.6" fill="${C.purple}" stroke-width="1.8"/>` +
      K.line('M4 56.5 H32', 2) +
      keg(11, 49, 7.5) + keg(26, 49, 7.5) + keg(18.5, 36, 7.5),
    b_fermentery: () => {
      const crock = (x, y, w, h, f) =>
        P(`M${x - w * 0.3} ${y} C${x - w * 0.6} ${y - h * 0.3} ${x - w * 0.6} ${y - h * 0.8} ${x - w * 0.32} ${y - h} H${x + w * 0.32} C${x + w * 0.6} ${y - h * 0.8} ${x + w * 0.6} ${y - h * 0.3} ${x + w * 0.3} ${y} Z`, f) +
        E(x, y - h - 1, w * 0.36, 2.6, C.brownD, 2) + K.line(`M${x - w * 0.47} ${y - h * 0.55} C${x - w * 0.2} ${y - h * 0.45} ${x + w * 0.2} ${y - h * 0.45} ${x + w * 0.47} ${y - h * 0.55}`, 1.6, C.brownD) +
        K.hi(`M${x - w * 0.36} ${y - h * 0.8} C${x - w * 0.46} ${y - h * 0.6} ${x - w * 0.44} ${y - h * 0.35} ${x - w * 0.32} ${y - h * 0.2} L${x - w * 0.25} ${y - h * 0.3} C${x - w * 0.33} ${y - h * 0.45} ${x - w * 0.33} ${y - h * 0.65} ${x - w * 0.27} ${y - h * 0.8} Z`);
      return grass() +
        house({ x: 28, w: 20, d: 10, e: 36, a: 10, wall: C.greyL, side: C.grey, roof: C.brownD }) +
        K.line('M28 42 H34 M38 42 H48 M28 49 H32 M44 49 H48', 1.4, C.greyD) + door(34.5, 7, 11, 56, C.ink) +
        crock(13, 57, 20, 24, C.terracotta) + crock(29, 58, 15, 16, C.brown);
    },
    b_preserves: () => {
      const can = (x, y, f) =>
        P(`M${x - 6} ${y} V${y - 11} H${x + 6} V${y} Z`, C.steel, 2) + R(x - 6, y - 8.5, 12, 6, f, 0, 1.4) +
        E(x, y - 11, 6, 1.8, C.greyL, 2) + `<circle cx="${x}" cy="${y - 5.5}" r="1.6" fill="${C.creamL}" stroke="none"/>`;
      return grass() +
        house({ x: 28, w: 20, d: 10, e: 34, a: 11, wall: C.cream, side: C.creamD, roof: C.leafD }) + door(34.5, 7, 11) +
        win(35.5, 27, 5, 4) +
        can(10, 57, C.red) + can(23, 57, C.orange) + can(16.5, 44, C.leaf);
    },
    b_sauce: () =>
      grass() +
      house({ x: 30, w: 18, d: 10, e: 34, a: 11, wall: C.creamL, side: C.creamD, roof: C.orangeD }) + door(35.5, 7, 11) +
      // stock pot with ladle
      K.line('M7 37 H3.5 M33 37 H36.5', 4) +
      P('M7 36 H33 V51 C33 55 30 57 26 57 H14 C10 57 7 55 7 51 Z', C.redD) +
      E(20, 36, 13, 3.5, C.ink) + E(20, 36.5, 11, 2.4, C.orange, 0.1) +
      K.line('M23 35 L31 19', 3.2) + K.line('M23 35 L31 19', 1.2, C.steel) +
      K.hi('M9.5 40 H12 V52 C11 52 9.5 51 9.5 50 Z') +
      K.line('M12 28 C9 25 14 23 11 19 M20 28 C17 25 22 23 19 19', 2, C.greyD),
    b_pasta: () =>
      grass() +
      house({ x: 32, w: 18, d: 9, e: 34, a: 11, wall: C.wheatL, side: C.wheat, roof: C.red }) + door(37.5, 7, 11) +
      // drying rack with hanging noodles
      K.line('M6 56 V16 M30 56 V16', 3.5, C.woodD) +
      P('M3 15 H33', 'none', 6) + P('M3 15 H33', 'none', 2.5).replace('fill="none"', `fill="none" stroke="${C.wood}"`) +
      [9, 13, 17, 21, 25].map((x, i) =>
        `<path d="M${x - 1.6} 15 V${40 + (i % 2) * 5} M${x + 1.6} 15 V${42 - (i % 2) * 4}" fill="none" stroke="${C.wheatD}" stroke-width="3.4"/>` +
        `<path d="M${x - 1.6} 16 V${40 + (i % 2) * 5} M${x + 1.6} 16 V${42 - (i % 2) * 4}" fill="none" stroke="${C.yellowL}" stroke-width="1.6"/>`).join(''),
    b_bakery: () =>
      grass() +
      P('M43 26 V14 H49 V22 Z', C.terracotta) + R(42, 11, 8, 3.5, C.redD, 1, 2) + K.line('M46 8 C44 6 48 5 46 2', 1.8, C.greyD) +
      house({ x: 24, w: 20, d: 12, e: 34, a: 11, wall: C.cream, side: C.creamD, roof: C.terracotta }) + door(30.5, 7, 11) +
      sign(12, 37, 11,
        P('M3.5 39 C3 32 9 30 12 30 C15 30 21 32 20.5 39 C20.5 41 19 42 17 42 H7 C5 42 3.5 41 3.5 39 Z', C.wheatD, 2.2) +
        K.line('M8 33.5 L10 36.5 M12 32.5 L14 35.5 M16 33.5 L18 36.5', 1.5, C.wheatL), 24, 22),
    b_patisserie: () =>
      grass() +
      house({ x: 22, w: 24, d: 12, e: 34, a: 12, wall: C.pinkL, side: C.pink, roof: C.purpleL }) +
      R(34, 43, 9, 13, C.woodD, 0.5) + R(25, 45, 7, 6, C.blueL, 1, 1.8) +
      P('M20 36 H48 L50 42 H18 Z', C.white) +
      P('M22.5 36 H27 L26.5 42 H21 Z M31.8 36 H36.2 L36.4 42 H31.6 Z M41 36 H45.5 L47.6 42 H43 Z', C.pink, 1.6) +
      P('M18 42 C20 45 23 45 24.5 42 C26 45 29.5 45 31 42 C32.5 45 36 45 37.5 42 C39 45 42.5 45 44 42 C45.5 45 48.5 45 50 42 Z', C.white, 1.6) +
      // cupcake sign
      sign(11, 34, 10,
        P('M5 35 L7 42 H15 L17 35 Z', C.pinkD, 2) + K.line('M9.5 36 V41.5 M12.5 36 V41.5', 1.2) +
        P('M4.5 35.5 C3 31 7 29 9 29.5 C9.5 26.5 13 26.5 13.5 29 C16 28.5 19 31 17.5 35.5 Z', C.creamL, 2) +
        `<circle cx="11" cy="26.5" r="1.8" fill="${C.red}" stroke-width="1.4"/>`, 22, 20),
    b_minerals: () =>
      grass() +
      house({ x: 30, w: 18, d: 10, e: 32, a: 10, wall: C.greyL, side: C.grey, roof: C.blueD }) + door(35.5, 7, 11) +
      win(36.5, 25.5, 5, 4) +
      // white mineral heap
      P('M21 57 C23 48 27 45 30 45 C33 45 37 49 39 57 Z', C.white, 2.2) + K.sh('M32 46 C35 48 38 52 39 57 H33 Z') +
      // conical flask
      P('M9 14 H19 V27 L27 49 C28 53 26 56 22 56 H6 C2 56 0.5 53 1.5 49 L9 27 Z', C.glass) +
      P('M5.4 38 H22.6 L26 49 C27 52 25 54.5 22 54.5 H6 C3 54.5 1.5 52 2.5 49 Z', C.tealL, 0.1) +
      P('M9 14 H19 V27 L27 49 C28 53 26 56 22 56 H6 C2 56 0.5 53 1.5 49 L9 27 Z', 'none') +
      R(7.5, 11, 13, 4, C.woodL, 1, 2) + K.line('M5.5 38 H22.5', 1.5, C.tealD) +
      K.hi('M10 30 L12 30 L7 48 L5 47 Z') + K.dots([[13, 45], [18, 49], [11, 51]], 1.6, C.white),
    // ---------------- Cooking ----------------
    b_kitchen: () =>
      grass() +
      house({ x: 26, w: 22, d: 10, e: 34, a: 11, wall: C.creamL, side: C.creamD, roof: C.redD }) + door(33.5, 7, 11) +
      win(34.5, 27, 5, 4) +
      // big chef's hat
      P('M8 44 C3 41 2 32 8 30 C8 23 15 20 19 23 C22 19 30 20 31 27 C37 27 38 37 32 42 Z', C.white) +
      P('M9 42 H31 L30 52 C25 54 15 54 10 52 Z', C.white) + K.line('M10 46 C15 48 25 48 30 46', 1.5, C.greyD) +
      K.line('M15 34 C16 37 16 39 15.5 42 M24 34 C24.5 37 24.5 39 24 42', 1.5, C.greyD) + K.hiE(11, 30, 3, 1.6),
    // Culinary Academy: a columned hall with a gold crest in its gable.
    b_academy: () =>
      grass() +
      house({ x: 6, w: 32, d: 16, e: 34, a: 12, wall: C.creamL, side: C.creamD, roof: C.blueD }) +
      `<circle cx="22" cy="28" r="3.2" fill="${C.gold}" stroke-width="1.4"/>` + R(4, 33, 36, 3.5, C.white, 0.5, 1.6) +
      R(8.5, 37, 3.5, 19, C.white, 0.5, 1.6) + R(15, 37, 3.5, 19, C.white, 0.5, 1.6) +
      R(25.5, 37, 3.5, 19, C.white, 0.5, 1.6) + R(32, 37, 3.5, 19, C.white, 0.5, 1.6) + door(19.5, 5, 11) +
      win(42, 38, 4.5, 6) + win(49.5, 35, 4.5, 6) + R(2, 55, 40, 3, C.greyL, 0.5, 1.6),
    // ---------------- Hidden ----------------
    b_farmhouse: () =>
      grass() +
      P('M42 22 V8 H48 V19 Z', C.terracotta) + R(41, 6, 8, 3.5, C.redD, 1, 2) +
      house({ x: 10, w: 26, d: 18, e: 32, a: 14, wall: C.cream, side: C.creamD, roof: C.red }) +
      win(14, 37, 6, 6) + win(26, 37, 6, 6) + win(20, 24, 6, 5) +
      P('M38 36 L46 32.8 V39 L38 42 Z M48 32 L52 30.4 V36.5 L48 38 Z', C.blueL, 1.6) +
      P('M18 56 V48 C18 45 26 45 26 48 V56 Z', C.leafD) +
      // fence
      K.line('M4 50 H16 M4 54.5 H16 M38 54 L60 45.5 M38 58.4 L60 49.8', 1.8, C.woodD) +
      P('M5 48 V58 M10 48 V58 M15 48 V58 M44 50 V58 M50 47.5 V56 M56 45 V53.5', 'none', 2.5),
  });
})(FSI);
