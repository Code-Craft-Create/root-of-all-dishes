// Culinary Academy chef portraits: head and shoulders, front view, one per name in Game.CHEF_SCHOOLS.
// One drawing function, varied by skin, hair, hat, age marks and jacket so every chef looks like a different person.
// Ids are chef_<name> without accents (FSI.chefId('Amélie') -> 'chef_amelie').
(function (FSI) {
  const { C, K } = FSI;
  const P = (d, f, w) => `<path d="${d}" fill="${f}"${w ? ` stroke-width="${w}"` : ''}/>`;
  const O = (cx, cy, r, f, w) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${w ? ` stroke-width="${w}"` : ''}/>`;
  FSI.chefId = (name) => 'chef_' + name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_');

  const SKIN = { a: C.pinkL, b: C.woodL, c: C.brownL, d: C.brown, e: C.brownD };
  const HAIR = { k: C.black, d: C.choc, b: C.brownD, l: C.wheat, r: C.orangeD, g: C.greyL, s: C.grey };

  // Hair behind the head (drawn before the face) and in front of it (fringe, sideburns).
  const BACK = {
    long: 'M20 28 C17 38 16 48 19 54 H45 C48 48 47 38 44 28 Z',
    bob: 'M19.5 28 C17 36 18 43 21 45 H43 C46 43 47 36 44.5 28 Z',
    curly: 'M19 26 C13 28 13 36 17 38 C13 42 16 49 22 47 L42 47 C48 49 51 42 47 38 C51 36 51 28 45 26 Z',
    puff: 'M18 30 C12 26 14 14 22 14 C24 7 40 7 42 14 C50 14 52 26 46 30 Z',
    tail: 'M42 26 C50 28 52 40 47 50 C45 44 43 38 41 34 Z',
    bun: 'M40 23 C40 16 51 15 51 22 C51 29 41 29 40 23 Z',
  };
  const FRONT = {
    short: 'M20.5 33 C19 26 22 22 32 22 C42 22 45 26 43.5 33 C42 29 40 27.5 32 27.5 C24 27.5 22 29 20.5 33 Z',
    side: 'M20.5 33 C19 25 23 21 32 21 C42 21 45 26 43.5 33 C41 28 36 26.5 28 27.5 C25 28 22 30 20.5 33 Z',
    fringe: 'M20.5 34 C19 25 23 21 32 21 C41 21 45 25 43.5 34 C40 30 38 30 37 27.5 C33 30 27 30 24 28 C23 30 22 32 20.5 34 Z',
    curly: 'M20 33 C18 30 19 26 22 25 C22 22 26 21 28 22 C30 20 34 20 36 22 C38 21 42 22 42 25 C45 26 46 30 44 33 C42 29 39 28 32 28 C25 28 22 29 20 33 Z',
  };

  // Hats sit on the forehead line (y 25-26); the head top is at y 20.5.
  const hat = (kind, col) => {
    switch (kind) {
      case 'toque': return P('M20 20 C12 19 12 8 20 8.5 C21 2.5 30 2 32.5 6 C35 2 44 2.5 44 8.5 C52 8 52 19 44 20 Z', C.white) +
        P('M20 17 H44 V26 H20 Z', C.white) + K.line('M26 11 V17 M32 9 V17 M38 11 V17', 1.4, C.greyD) + K.hiE(19, 12, 3, 1.6);
      case 'cap': return P('M20.5 17 C17 16 17 9 23 9.5 C25 6 39 6 41 9.5 C47 9 47 16 43.5 17 Z', C.white) +
        P('M20 15 H44 V26 H20 Z', C.white) + K.line('M27 10 V15 M37 10 V15', 1.3, C.greyD);
      case 'skull': return P('M19.5 27 C19 15 45 15 44.5 27 Z', col) + K.line('M20 24.5 H44', 1.5, C.ink) + K.hiE(25, 19.5, 3.5, 1.5);
      case 'bandana': return P('M19.5 27 C19 15 45 15 44.5 27 Z', col) + P('M43 23 L52 21 L49 27 L53 31 L44 28 Z', col, 2) +
        K.dots([[26, 20], [32, 18.5], [38, 20], [29, 24], [35, 24]], 1.1, C.white);
      case 'scarf': return P('M21 29 C22 19 42 19 43 29 C40 25.5 24 25.5 21 29 Z', col);
    }
    return '';
  };

  // s skin, h hair colour, b hair behind, f hair in front, t hat, tc hat colour, j jacket, k neckerchief,
  // x extras: g glasses, m moustache, B beard, w wrinkles, F freckles, n no blush.
  function chef(o) {
    const skin = SKIN[o.s], hair = HAIR[o.h], x = o.x || '', jacket = o.j || C.white;
    let m = '';
    if (o.t === 'scarf') m += P('M18 34 C16 17 48 17 46 34 C47 44 45 50 40 53 H24 C19 50 17 44 18 34 Z', o.tc);
    else if (o.b) m += P(BACK[o.b], hair);
    // shoulders, chef's jacket, neckerchief
    m += P('M7 62 C7 52 15 47 26 46 H38 C49 47 57 52 57 62 Z', jacket) +
      (o.t === 'scarf' ? '' : P('M27 41 H37 V47 L32 51 L27 47 Z', skin, 2)) +
      (o.k ? P('M25 46 L32 53 L39 46 L36 45 L32 49 L28 45 Z', o.k, 2) : K.line('M26 46.5 L32 52 L38 46.5', 1.6)) +
      (jacket === C.white ? K.dots([[27, 56], [37, 56], [27, 60.5], [37, 60.5]], 1.3) : K.dots([[32, 56], [32, 60.5]], 1.3, C.greyL)) +
      K.sh('M50 52 C54 55 56 58 56.5 62 H48 Z');
    if (o.t === 'scarf') m += P('M24 46 C30 50 34 50 40 46 L39 52 H25 Z', o.tc, 2);
    // ears, face
    m += O(20.5, 35, 2.6, skin, 2) + O(43.5, 35, 2.6, skin, 2) +
      `<ellipse cx="32" cy="33.5" rx="11.5" ry="12.5" fill="${skin}"/>` + K.hiE(26, 27.5, 3.5, 2);
    if (o.t !== 'scarf' && o.f) m += P(FRONT[o.f], hair, 2);
    // face: brows, eyes, nose, mouth
    const brow = x.includes('w') ? C.greyD : C.ink;
    m += K.line('M25.5 30 C27 29 29 29 30 30 M34 30 C35 29 37 29 38.5 30', 1.4, brow) + K.dots([[27.8, 33.2], [36.2, 33.2]], 1.6) +
      K.line('M32 34.5 C31 37 31.2 38 33 38', 1.3) + K.line('M28.5 41 C30.5 43 33.5 43 35.5 41', 1.6);
    if (!x.includes('n') && 'ab'.includes(o.s)) m += O(25, 39, 2.2, C.pink, 0.1) + O(39, 39, 2.2, C.pink, 0.1);
    if (x.includes('F')) m += K.dots([[24.5, 37], [26.5, 38.5], [37.5, 38.5], [39.5, 37]], 0.7, C.orangeD);
    if (x.includes('w')) m += K.line('M22.5 32 L24 33 M22.5 35 L24 34.5 M41.5 32 L40 33 M41.5 35 L40 34.5 M27 44 C29 45 35 45 37 44', 1.1, C.brownD);
    if (x.includes('B')) m += P('M21 36 C21 46 26 50 32 50 C38 50 43 46 43 36 C41 41 38 43 32 43 C26 43 23 41 21 36 Z', hair, 2);
    if (x.includes('m')) m += P('M26.5 40.5 C28 38 30.5 38 32 39.2 C33.5 38 36 38 37.5 40.5 C35 41 34 40.5 32 40.8 C30 40.5 29 41 26.5 40.5 Z', hair, 1.6);
    if (x.includes('g')) m += `<circle cx="27.8" cy="33.2" r="3.7" fill="none" stroke-width="1.5"/><circle cx="36.2" cy="33.2" r="3.7" fill="none" stroke-width="1.5"/>` +
      K.line('M31.5 33 H32.5 M24.1 33 L21.5 32 M39.9 33 L42.5 32', 1.5);
    return m + hat(o.t, o.tc);
  }

  const S = (s, h, b, f, t, tc, x, j, k) => ({ s, h, b, f, t, tc, x, j, k });
  const W = C.white;
  const CHEFS = {
    // Devon farmhouse, Appenzell, Gothenburg
    Martha: S('a', 'g', 'bun', 'side', 'bandana', C.red, 'gw'), Tom: S('a', 'r', '', 'short', 'skull', C.leafD, 'BmF'), Elsie: S('a', 'l', 'tail', 'fringe', 'toque', '', ''),
    Ueli: S('a', 'g', '', 'short', 'toque', '', 'Bmw'), Vreni: S('a', 'l', 'long', 'side', 'bandana', C.redD, '', W, C.red), Reto: S('b', 'b', '', 'short', 'skull', C.black, 'gn'),
    Astrid: S('a', 'l', 'long', 'fringe', 'toque', '', ''), Lars: S('a', 'l', '', '', 'bandana', C.blue, 'Bm'), Sanne: S('a', 'r', 'bob', 'fringe', 'cap', '', 'F', W, C.orange),
    // Dublin, Lyon, Vienna
    Siobhan: S('a', 'r', 'curly', 'curly', 'toque', '', 'F'), Callum: S('b', 'k', '', 'side', 'skull', C.blueD, 'm', C.black), Harriet: S('a', 's', 'bob', 'fringe', 'cap', '', 'gw', W, C.purple),
    'Amélie': S('a', 'k', 'bob', 'fringe', 'toque', '', '', W, C.blue), 'Benoît': S('b', 'b', '', 'short', 'toque', '', 'm'), Margaux: S('a', 'd', 'tail', 'side', 'bandana', C.purple, ''),
    Lukas: S('a', 'l', '', 'side', 'skull', C.white, 'n', W, C.red), Greta: S('a', 'g', 'bun', 'side', 'bandana', C.leafD, 'gw'), 'Zsófia': S('b', 'k', 'long', 'side', 'cap', '', '', W, C.redD),
    // Bologna, Beirut, cruise ship galley
    Giulia: S('b', 'd', 'curly', 'curly', 'bandana', C.red, ''), Marco: S('b', 'k', '', 'short', 'toque', '', 'Bm', W, C.leaf), Lorenzo: S('b', 'g', '', 'short', 'cap', '', 'mgw', C.black),
    Layla: S('c', 'k', '', '', 'scarf', C.tealD, 'n'), Yusuf: S('c', 'k', '', 'short', 'skull', C.white, 'Bm'), Eleni: S('b', 's', 'long', 'side', 'cap', '', 'w', W, C.blue),
    Kofi: S('e', 'k', '', '', 'bandana', C.orange, 'Bmn'), Thandi: S('d', 'k', 'puff', '', 'toque', '', 'n', W, C.yellow), Mateus: S('c', 'b', '', 'curly', 'skull', C.leafD, 'm'),
    // Osaka, Penang, Oaxaca
    Haruto: S('b', 'k', '', 'side', 'bandana', C.white, 'n', C.blueD), Mei: S('b', 'k', 'bun', 'fringe', 'toque', '', ''), 'Ji-woo': S('b', 'k', 'bob', 'fringe', 'skull', C.pinkD, 'g'),
    Priya: S('c', 'k', 'tail', 'side', 'cap', '', 'n', W, C.orangeD), Arjun: S('c', 'k', '', 'short', 'toque', '', 'Bmn'), Linh: S('b', 'k', 'long', 'fringe', 'bandana', C.teal, ''),
    Lupe: S('c', 'g', 'tail', 'side', 'bandana', C.purple, 'wn'), Diego: S('c', 'k', '', 'short', 'skull', C.red, 'm'), Jolene: S('a', 'l', 'curly', 'curly', 'cap', '', 'F', W, C.redL),
    // Paris, Brussels, St Petersburg
    'Étienne': S('a', 'g', '', 'side', 'toque', '', 'mgw', W, C.blueD), Camille: S('b', 'd', 'bob', 'side', 'toque', '', ''), Auguste: S('b', 's', '', '', 'toque', '', 'Bw', C.black),
    'Céleste': S('a', 'l', 'bun', 'side', 'cap', '', '', W, C.pink), Pierre: S('a', 'b', '', 'side', 'toque', '', 'm', W, C.red), Elodie: S('b', 'r', 'long', 'fringe', 'bandana', C.pink, 'F'),
    Anastasia: S('a', 'l', 'long', 'side', 'toque', '', '', W, C.gold), Dmitri: S('a', 'b', '', 'short', 'cap', '', 'Bm'), Olga: S('a', 'g', '', '', 'scarf', C.red, 'gw'),
  };
  const map = {};
  for (const name in CHEFS) map[FSI.chefId(name)] = chef(CHEFS[name]);
  FSI.add('chefs', map);
})(FSI);
