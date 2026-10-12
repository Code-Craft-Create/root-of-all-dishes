// Root of All Dishes icon kit: registry, palette and shared building blocks for the SVG icon set.
// Icons are stored as inner SVG markup for a 64x64 viewBox; FSI.svg() adds the shared wrapper
// (outline colour, stroke width, joins), so every icon gets the same line style.
// See assets/STYLE.md for the drawing rules.
(function (G) {
  const FSI = (G.FSI = G.FSI || {});
  FSI.icons = {};   // id -> markup string, or a function returning markup (resolved lazily)
  FSI.groups = {};  // group -> [ids]
  FSI.dups = [];

  FSI.add = function (group, map) {
    const list = (FSI.groups[group] = FSI.groups[group] || []);
    for (const id in map) {
      if (FSI.icons[id]) FSI.dups.push(id);
      FSI.icons[id] = map[id];
      list.push(id);
    }
  };

  const resolving = {};
  FSI.markup = function (id) {
    let v = FSI.icons[id];
    if (typeof v === 'function') {
      if (resolving[id]) return '';
      resolving[id] = true;
      try { v = FSI.icons[id] = v(); } finally { delete resolving[id]; }
    }
    return v || '';
  };
  FSI.has = (id) => id in FSI.icons;

  const C = (FSI.C = {
    ink: '#3b2b22',
    // light / base / dark triplets
    wheatL: '#f6df9c', wheat: '#e8c26a', wheatD: '#c49340',
    leafL: '#a3d27a', leaf: '#6fae4a', leafD: '#457f33', pine: '#2f6b3f',
    redL: '#f08a72', red: '#d9483b', redD: '#a3302a',
    orangeL: '#f8b56e', orange: '#ee8a33', orangeD: '#c2621c',
    yellowL: '#fbe58a', yellow: '#f4c93b', yellowD: '#d19f1c',
    brownL: '#c7976a', brown: '#9a6a43', brownD: '#6b4529', choc: '#5a3624',
    creamL: '#fffaf0', cream: '#f5e9cc', creamD: '#dcc79c',
    pinkL: '#f9c9c0', pink: '#ef9f95', pinkD: '#c8706a',
    meatL: '#ef8f86', meat: '#cf5652', meatD: '#9c3537', fat: '#fbeee2',
    purpleL: '#c09ad8', purple: '#8a58a8', purpleD: '#5f3a7c',
    blueL: '#a9d3f0', blue: '#5b9bd5', blueD: '#3a6fa6',
    tealL: '#9fdbd0', teal: '#3ea79a', tealD: '#2a7a70',
    greyL: '#e1e0da', grey: '#aeaca4', greyD: '#7c7a73',
    white: '#fbfaf6', milk: '#f3f6f8', black: '#3b3532',
    wood: '#b7854f', woodL: '#d4a771', woodD: '#875a31',
    glass: '#e3f3f6', gold: '#e3a92b', terracotta: '#cc6e45', steel: '#c9d1d6',
  });

  // ---- shading -------------------------------------------------------------
  // Light comes from the top-left. hi() = highlight, sh() = shade; both have no outline.
  const K = (FSI.K = {});
  K.hi = (d) => `<path d="${d}" fill="#fff" fill-opacity=".38" stroke="none"/>`;
  K.sh = (d) => `<path d="${d}" fill="${C.ink}" fill-opacity=".14" stroke="none"/>`;
  K.hiE = (cx, cy, rx, ry, rot = -30) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="#fff" fill-opacity=".4" stroke="none"/>`;
  // Soft ground shadow under standing objects.
  K.shadow = (rx = 20, cy = 58, cx = 32) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="3" fill="${C.ink}" fill-opacity=".15" stroke="none"/>`;
  // Thin inner detail line (seams, veins, cuts).
  K.line = (d, w = 1.5, color = C.ink) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
  K.dots = (pts, r = 1.4, fill = C.ink) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="none"/>`).join('');

  // ---- composition -----------------------------------------------------------
  // Place markup scaled s around its own 64x64 box, with its centre at (x, y).
  K.place = (markup, x = 32, y = 32, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(-32 -32)">${markup}</g>`;
  // Another icon, scaled and placed (resolved when drawn, so any group may be referenced).
  K.ref = (id, x = 32, y = 32, s = 0.5, rot = 0) => K.place(FSI.markup(id), x, y, s, rot);
  // Small round badge in the lower-right corner holding another icon: "made from".
  K.badge = (id, x = 49, y = 49, r = 12, bg = C.white) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${bg}"/>` + K.place(FSI.markup(id), x, y, (r * 1.55) / 64);

  // ---- containers (all share proportions so processed goods look like one family) ----
  // Burlap sack, glyph = markup drawn on the front panel (centre 32,40, about 22px wide).
  K.sack = (fill = C.cream, glyph = '', tie = C.brown) =>
    `${K.shadow(20)}<path d="M18 22 C13 30 11 42 13 52 C14 57 18 58 32 58 C46 58 50 57 51 52 C53 42 51 30 46 22 Z" fill="${fill}"/>` +
    K.sh('M44 26 C49 34 50 44 49 52 C48 56 44 57 38 57 C44 50 46 38 44 26 Z') +
    `<path d="M20 12 C24 15 40 15 44 12 L46 22 C40 25 24 25 18 22 Z" fill="${fill}"/>` +
    `<path d="M18.5 21 C24 24.5 40 24.5 45.5 21" fill="none" stroke="${tie}" stroke-width="3.5"/>` +
    K.hi('M17 30 C15 37 15 44 16 50 L19 50 C18 43 19 36 21 30 Z') + glyph;
  // Glass jar with contents; glyph sits on a paper label.
  K.jar = (fill = C.orange, lid = C.red, glyph = '') =>
    `${K.shadow(17)}<rect x="15" y="19" width="34" height="39" rx="7" fill="${C.glass}"/>` +
    `<rect x="17.5" y="26" width="29" height="29.5" rx="5" fill="${fill}" stroke="none"/>` +
    `<rect x="15" y="19" width="34" height="39" rx="7" fill="none"/>` +
    `<rect x="17" y="10" width="30" height="10" rx="3" fill="${lid}"/>` +
    K.line('M21 13.5 V17 M27 13.5 V17 M32 13.5 V17 M37 13.5 V17 M43 13.5 V17', 1.2) +
    (glyph ? `<rect x="20" y="31" width="24" height="20" rx="3" fill="${C.creamL}"/>` + glyph : '') +
    K.hi('M18.5 24 L21.5 24 L21.5 52 L18.5 50 Z');
  // Bottle. shape: 'wine' (tall, cork), 'oil' (round shoulders), 'flask' (short, wide).
  K.bottle = (fill = C.leafD, shape = 'wine', label = C.creamL, glyph = '') => {
    const body = {
      wine: 'M27 6 H37 V20 C37 24 44 26 44 32 V56 C44 57.5 43 58 41.5 58 H22.5 C21 58 20 57.5 20 56 V32 C20 26 27 24 27 20 Z',
      oil: 'M28 6 H36 V17 C36 21 47 24 47 34 V55 C47 57 45.5 58 43.5 58 H20.5 C18.5 58 17 57 17 55 V34 C17 24 28 21 28 17 Z',
      flask: 'M27 10 H37 V22 C45 25 49 31 49 40 C49 51 42 58 32 58 C22 58 15 51 15 40 C15 31 19 25 27 22 Z',
    }[shape];
    const lb = { wine: [22, 36, 20, 14], oil: [20, 38, 24, 13], flask: [21, 37, 22, 11] }[shape];
    return `${K.shadow(16)}<path d="${body}" fill="${fill}"/>` +
      `<rect x="${shape === 'flask' ? 26 : 26.5}" y="3" width="11" height="6" rx="1.5" fill="${C.woodL}"/>` +
      (label ? `<rect x="${lb[0]}" y="${lb[1]}" width="${lb[2]}" height="${lb[3]}" rx="2" fill="${label}"/>` : '') + glyph +
      K.hi(shape === 'flask' ? 'M20 34 C19 40 20 46 23 50 L25 48 C23 44 22 39 23 34 Z' : 'M23 31 L26 29 L26 34 L23 35 Z');
  };
  // Drinking glass. shape: 'tumbler' | 'wine' | 'mug'.
  K.glass = (fill = C.orange, shape = 'tumbler', extra = '') => {
    if (shape === 'wine')
      return `${K.shadow(13)}<path d="M20 8 H44 C45 22 41 32 32 33 C23 32 19 22 20 8 Z" fill="${C.glass}"/>` +
        `<path d="M21 17 H43 C42 26 38 31 32 31.5 C26 31 22 26 21 17 Z" fill="${fill}" stroke="none"/>` +
        `<path d="M20 8 H44 C45 22 41 32 32 33 C23 32 19 22 20 8 Z" fill="none"/>` +
        `<path d="M32 33 V54 M22 57 C24 54 40 54 42 57 Z" fill="${C.glass}"/>` + extra + K.hi('M24 11 L27 11 C26 18 26 23 28 28 L26 28 C23 23 23 17 24 11 Z');
    if (shape === 'mug')
      return `${K.shadow(19)}<path d="M44 26 C54 26 54 44 44 44" fill="none" stroke-width="5"/><path d="M44 26 C54 26 54 44 44 44" fill="none" stroke="${C.white}" stroke-width="1.5"/>` +
        `<path d="M14 16 H46 V50 C46 55 42 58 37 58 H23 C18 58 14 55 14 50 Z" fill="${C.white}"/>` +
        `<ellipse cx="30" cy="18" rx="13.5" ry="3" fill="${fill}" stroke="none"/>` + extra + K.hi('M17 22 L20 22 L20 50 L17 48 Z');
    return `${K.shadow(15)}<path d="M17 10 H47 L44 55 C44 57 42 58 40 58 H24 C22 58 20 57 20 55 Z" fill="${C.glass}"/>` +
      `<path d="M18.5 22 H45.5 L43.2 54.5 C43 56 41.5 56.5 40 56.5 H24 C22.5 56.5 21 56 20.8 54.5 Z" fill="${fill}" stroke="none"/>` +
      `<path d="M17 10 H47 L44 55 C44 57 42 58 40 58 H24 C22 58 20 57 20 55 Z" fill="none"/>` + extra +
      K.hi('M20.5 13 L23.5 13 L25 52 L22.5 52 Z');
  };
  // Shallow bowl seen from slightly above; food = markup drawn in the bowl opening (y about 22..34).
  K.bowl = (food = '', fill = C.white, foodFill = C.orange) =>
    `${K.shadow(24)}<ellipse cx="32" cy="30" rx="27" ry="9" fill="${fill}"/>` +
    `<ellipse cx="32" cy="30" rx="23.5" ry="6.5" fill="${foodFill}" stroke-width="1.5"/>` + food +
    `<path d="M5 30 C5 46 17 55 32 55 C47 55 59 46 59 30 C59 35 47 39 32 39 C17 39 5 35 5 30 Z" fill="${fill}"/>` +
    `<path d="M22 54.5 L23 58 H41 L42 54.5" fill="${fill}"/>` + K.sh('M50 38 C47 45 42 50 35 53 C46 52 55 45 57 36 Z');
  // Flat plate seen from slightly above; food is drawn on top (centre 32,36).
  K.plate = (food = '', fill = C.white, rim = C.greyL) =>
    `${K.shadow(28, 56)}<ellipse cx="32" cy="38" rx="29" ry="15" fill="${fill}"/>` +
    `<ellipse cx="32" cy="37.5" rx="21" ry="10" fill="${rim}" fill-opacity=".45" stroke-width="1.3"/>` + food;
  // Wooden board (for bread, cheese, charcuterie).
  K.board = (food = '') =>
    `${K.shadow(28, 57)}<path d="M4 44 L46 30 L60 38 L18 54 Z" fill="${C.woodL}"/><path d="M4 44 L18 54 L18 57 L4 47 Z M18 54 L60 38 L60 41 L18 57 Z" fill="${C.wood}"/>` + food;
  // Cooking pot / casserole.
  K.pot = (food = '', fill = C.red) =>
    `${K.shadow(24)}<path d="M8 27 H4 M56 27 H60" stroke-width="5"/>` +
    `<path d="M8 26 H56 V48 C56 54 50 57 44 57 H20 C14 57 8 54 8 48 Z" fill="${fill}"/>` +
    `<ellipse cx="32" cy="26" rx="24" ry="5.5" fill="${C.black}"/><ellipse cx="32" cy="26.5" rx="21" ry="4" fill="${C.orange}" stroke="none"/>` + food +
    K.hi('M11 31 L14 31 L14 48 C14 50 13 50 11 48 Z');
  // Steam wisps above a hot dish.
  K.steam = (x = 32, y = 14) =>
    K.line(`M${x - 8} ${y + 6} C${x - 11} ${y + 2} ${x - 5} ${y - 1} ${x - 8} ${y - 6} M${x} ${y + 4} C${x - 3} ${y} ${x + 3} ${y - 3} ${x} ${y - 8} M${x + 8} ${y + 6} C${x + 5} ${y + 2} ${x + 11} ${y - 1} ${x + 8} ${y - 6}`, 2, C.greyD);
  // Wooden crate (bulk fresh produce, livestock feed).
  K.crate = (fill = C.woodL, top = '') =>
    `${K.shadow(26)}${top}<path d="M7 30 H57 V54 C57 56 56 57 54 57 H10 C8 57 7 56 7 54 Z" fill="${fill}"/>` +
    K.line('M7 38 H57 M7 47 H57', 1.5) + `<rect x="12" y="30" width="4" height="27" fill="${C.wood}" stroke-width="1.5"/><rect x="48" y="30" width="4" height="27" fill="${C.wood}" stroke-width="1.5"/>`;

  // ---- rendering --------------------------------------------------------------
  const WRAP = `xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;
  FSI.svg = function (id, size = 32, extra = '') {
    const m = FSI.markup(id);
    if (!m) return '';
    return `<svg ${WRAP} width="${size}" height="${size}"${extra ? ' ' + extra : ''}>${m}</svg>`;
  };
  // <img> tag for HTML, sized by the surrounding font size via the .ico class.
  FSI.img = (id, cls = '') => (FSI.has(id) ? `<img class="ico${cls ? ' ' + cls : ''}" src="${FSI.dataURL(id)}" alt="" draggable="false">` : '');
  const urls = {};
  FSI.dataURL = (id) => urls[id] || (urls[id] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(FSI.svg(id, 64)));
})(typeof window !== 'undefined' ? window : globalThis);
