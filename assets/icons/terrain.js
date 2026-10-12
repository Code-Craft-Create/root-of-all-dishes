// Map decoration sprites: trees, rocks, grass tufts, flowers and fallen leaves, one variant per season where it
// changes. The renderer (js/render.js) draws them into the terrain at the current zoom, so they stay sharp.
// Every sprite stands on its ground point (32, 58) like the other icons; ids start with t_.
(function (FSI) {
  const { C, K } = FSI;
  const SNOW = C.white;
  // Leafy tree: brown trunk under a three-lobed canopy. extra = markup drawn on the canopy (blossom, snow).
  const oak = (leaf, dark, extra = '') =>
    K.shadow(15) +
    `<path d="M29 38 L28 57 H36 L35 38 Z" fill="${C.woodD}"/>` +
    `<path d="M32 6 C40 6 45 11 45 18 C52 19 56 25 55 33 C54 41 47 44 41 43 C37 47 27 47 23 43 C16 44 9 40 9 32 C9 25 14 19 20 19 C20 11 25 6 32 6 Z" fill="${leaf}"/>` +
    `<path d="M41 43 C47 44 54 41 55 33 C52 37 47 38 42 37 C38 41 28 42 23 39 C25 43 35 46 41 43 Z" fill="${dark}" stroke="none"/>` +
    K.line('M20 19 C23 21 25 24 25 27 M45 18 C42 20 40 23 40 26', 1.5, dark) +
    K.hiE(25, 15, 6, 3.5) + extra;
  const blossom = (fill) => K.dots([[20, 27], [28, 15], [37, 12], [45, 26], [33, 26], [16, 36], [27, 36], [48, 34], [39, 36]], 2.4, fill);
  // Conifer: three stacked tiers on a short trunk.
  const PINE = 'M32 5 L44 22 H39 L49 35 H42 L53 50 H11 L22 35 H15 L25 22 H20 Z';
  const pine = (extra = '') =>
    K.shadow(14) +
    `<path d="M29 49 V57 H35 V49 Z" fill="${C.woodD}"/>` +
    `<path d="${PINE}" fill="${C.pine}"/>` +
    `<path d="M32 5 L44 22 H39 L49 35 H42 L53 50 H32 Z" fill="${C.ink}" fill-opacity=".16" stroke="none"/>` +
    K.line('M22 35 H30 M15 35 H22 M25 22 H31', 1.5, '#24542f') + extra;
  // Snow resting on each tier's upper slope.
  const pineSnow =
    `<path d="M32 5 L38 13.5 C35 15 33 13 32 15 C30 13 28 15 26 13.5 Z" fill="${SNOW}" stroke-width="1.5"/>` +
    `<path d="M20 22 H44 L41 25 C38 27 35 24 32 26 C29 24 26 27 23 25 Z M15 35 H49 L46 38 C42 40 38 37 32 39 C26 37 22 40 18 38 Z M11 50 H53 L50 53 C44 55 38 52 32 54 C26 52 20 55 14 53 Z" fill="${SNOW}" stroke-width="1.5"/>`;
  // Bare winter tree with snow on the branches.
  const BRANCH = 'M32 56 V28 M32 44 L20 32 L16 22 M20 32 L24 20 M32 38 L44 26 L48 16 M44 26 L39 15 M32 28 L28 10 M32 28 L37 11';
  const bareTree =
    K.shadow(14) +
    `<path d="${BRANCH}" stroke-width="7"/><path d="${BRANCH}" stroke="${C.woodD}" stroke-width="3.5"/>` +
    `<path d="M29 40 L28 57 H36 L35 40 Z" fill="${C.woodD}" stroke-width="0"/>` +
    K.line('M29 57 L29.5 40 M35 57 L34.5 40', 2) +
    `<path d="M15 23 C16 20 19 20 21 23 Z M22 21 C23 18 26 18 26 21 Z M38 16 C39 13 42 13 42 16 Z M45 18 C46 15 50 15 50 18 Z M26 11 C27 8 30 8 30 11 Z M35 12 C36 9 39 9 39 12 Z" fill="${SNOW}" stroke-width="1.5"/>`;
  // Boulder, lit from the top-left.
  const rock = (fill, dark, extra = '') =>
    K.shadow(24, 57) +
    `<path d="M8 55 C6 46 12 37 22 35 C27 26 42 26 47 34 C55 35 59 46 56 55 Z" fill="${fill}"/>` +
    `<path d="M47 34 C52 40 52 48 48 55 H56 C59 46 55 35 47 34 Z" fill="${dark}" stroke="none"/>` +
    K.line('M22 35 C26 40 27 47 25 55 M47 34 C42 38 40 44 41 49', 1.6, C.greyD) +
    K.hiE(31, 33, 7, 3, -10) + extra;
  const rockSnow = `<path d="M10 45 C12 39 17 35 22 35 C27 26 42 26 47 34 C53 35 57 40 57 45 C52 41 48 42 45 40 C39 37 34 41 29 39 C22 38 15 42 10 45 Z" fill="${SNOW}" stroke-width="1.8"/>`;
  // Grass tuft: three blades.
  const tuft = (fill, tip = '') =>
    `<path d="M22 58 C20 48 14 42 8 39 C16 40 24 45 28 54 C28 44 26 34 31 24 C34 34 35 44 34 54 C38 46 46 41 56 40 C49 44 44 50 42 58 Z" fill="${fill}" stroke-width="2"/>` +
    (tip ? `<path d="M8 39 C12 40 15 41 18 43 C15 43 12 41 8 39 Z M31 24 C30 28 30 31 30 34 C31.5 31 32.5 28 31 24 Z M56 40 C52 41 49 42 46 44 C49 44 52 42 56 40 Z" fill="${tip}" stroke="none"/>` : '');
  // Meadow flower seen from above: five petals around a yellow middle.
  const flower = (petal) =>
    [0, 72, 144, 216, 288].map((a) => `<ellipse cx="32" cy="22" rx="9" ry="13" transform="rotate(${a} 32 36)" fill="${petal}" stroke-width="2"/>`).join('') +
    `<circle cx="32" cy="36" r="7" fill="${C.yellow}" stroke-width="2"/>`;
  // Fallen leaf lying flat.
  const leaf = (fill, dark) =>
    `<path d="M10 46 C14 26 34 14 56 16 C54 38 36 52 10 46 Z" fill="${fill}"/>` +
    K.line('M10 46 C24 38 38 28 50 21', 2, dark);
  // A few pebbles on the sand.
  const pebbles =
    `<ellipse cx="22" cy="48" rx="13" ry="8" fill="${C.creamD}"/><ellipse cx="43" cy="52" rx="9" ry="6" fill="${C.greyL}"/>` +
    `<ellipse cx="40" cy="38" rx="6" ry="4" fill="${C.grey}"/>` + K.hiE(18, 45, 4, 2, 0);

  FSI.add('terrain', {
    t_oak_spring: oak('#79b84d', C.leafD),
    t_oak_bloom: oak('#79b84d', C.leafD, blossom(C.pinkL)),
    t_oak_bloom_white: oak('#79b84d', C.leafD, blossom(C.white)),
    t_oak_summer: oak(C.leafD, '#2f5f26'),
    t_oak_autumn_orange: oak(C.orange, C.orangeD),
    t_oak_autumn_red: oak(C.redD, '#7d2420'),
    t_oak_autumn_yellow: oak(C.yellow, C.yellowD),
    t_oak_autumn_green: oak('#8a9a3a', '#5f6e26'),
    t_oak_winter: bareTree,
    t_pine: pine(),
    t_pine_winter: pine(pineSnow),
    t_rock: rock(C.grey, C.greyD),
    t_rock_winter: rock('#b9bcbd', '#8e9295', rockSnow),
    t_tuft_spring: tuft('#5f9e3e', C.leafL),
    t_tuft_summer: tuft('#5c8f3a', C.leafL),
    t_tuft_autumn: tuft('#8d953c', C.wheat),
    t_tuft_winter: tuft('#a9b8a8', SNOW),
    t_flower_pink: flower('#f6b3cc'),
    t_flower_white: flower(C.white),
    t_flower_yellow: flower(C.yellowL),
    t_leaf_orange: leaf(C.orange, C.orangeD),
    t_leaf_red: leaf(C.red, C.redD),
    t_leaf_yellow: leaf(C.yellow, C.yellowD),
    t_pebbles: pebbles,
  });
})(FSI);
