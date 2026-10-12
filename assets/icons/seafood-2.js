// Seafood group, part 2: fish cuts and processed seafood products (see assets/STYLE.md).
(function (FSI) {
  const { C, K } = FSI;

  // Fillet slab in 3/4 view: top face + side; lines = detail strokes on the top face.
  const FTOP = 'M5 31 C6 23 16 18 30 18 C44 18 54 22 59 28 C57 33 48 37 36 39 C26 41 16 42 11 41 C7 40 5 36 5 31 Z';
  const fillet = (top, side, lines, lc, sideExtra = '') =>
    K.shadow(26, 57) +
    `<path d="M5 31 C5 36 7 40 11 41 C16 42 26 41 36 39 C48 37 57 33 59 28 V34 C57 40 48 44 36 46 C26 48 16 49 11 48 C7 47 5 43 5 38 Z" fill="${side}"/>` + sideExtra +
    `<path d="${FTOP}" fill="${top}" stroke="none"/>` + K.line(lines, 1.6, lc) + `<path d="${FTOP}" fill="none"/>` +
    K.hiE(18, 24, 6, 1.8, -15);

  // Short round tin can (3/4 view); top = markup on the lid opening (centre 32,24).
  const can = (band, glyph, top) =>
    K.shadow(22, 58) +
    `<path d="M11 24 V50 C11 55 21 58 32 58 C43 58 53 55 53 50 V24 Z" fill="${C.steel}"/>` +
    `<path d="M11 31 C11 35 21 38 32 38 C43 38 53 35 53 31 V47 C53 51 43 54 32 54 C21 54 11 51 11 47 Z" fill="${band}"/>` +
    `<ellipse cx="32" cy="24" rx="21" ry="7" fill="${C.greyL}"/>` + top + glyph +
    K.hi('M14 33 L17 34.5 L17 49 L14 47.5 Z') + K.sh('M47 27.5 C50 26.5 52 25.5 53 24 V50 C53 52 51 54 47 55 Z');

  // Curled C-shaped body (shrimp tail) around (cx, cy), radius R, from angle a0 to a1 with width w0 -> w1.
  const curl = (cx, cy, R, a0, a1, w0, w1) => {
    const rad = (d) => (d * Math.PI) / 180, o = [], i = [];
    for (let a = a0; a <= a1 + 0.01; a += (a1 - a0) / 14) {
      const w = w0 + (w1 - w0) * ((a - a0) / (a1 - a0));
      o.push(`${(cx + R * Math.cos(rad(a))).toFixed(1)} ${(cy + R * Math.sin(rad(a))).toFixed(1)}`);
      i.push(`${(cx + (R - w) * Math.cos(rad(a))).toFixed(1)} ${(cy + (R - w) * Math.sin(rad(a))).toFixed(1)}`);
    }
    return `M${o.join(' L')} L${i.reverse().join(' L')} Z`;
  };
  const curlLines = (cx, cy, R, a0, a1, w0, w1, n) => {
    const rad = (d) => (d * Math.PI) / 180;
    let d = '';
    for (let k = 1; k <= n; k++) {
      const a = a0 + ((a1 - a0) * k) / (n + 1), w = w0 + (w1 - w0) * (k / (n + 1));
      d += `M${(cx + R * Math.cos(rad(a))).toFixed(1)} ${(cy + R * Math.sin(rad(a))).toFixed(1)} L${(cx + (R - w * 0.6) * Math.cos(rad(a))).toFixed(1)} ${(cy + (R - w * 0.6) * Math.sin(rad(a))).toFixed(1)} `;
    }
    return d;
  };

  FSI.add('seafood', {
    // Salmon fillet: orange flesh with white fat lines, silver skin underneath.
    salmon_fillet: () => fillet(C.orange, C.orangeD,
      'M14 21.5 C18 28 18 35 14 40.5 M22 19.5 C26 26 26 34 22 40.5 M30 18.5 C34 25 34 33 30 40 M38 18.7 C42 25 42 32 38 38.6 M46 20.3 C49 25 49 31 46 36.8', C.orangeL,
      K.line('M7 44 C9 46.5 14 47.5 20 47 C30 46.5 46 43 57 36', 2, C.greyL)),
    // Trout fillet: paler pink flesh, olive skin with black spots along the side.
    trout_fillet: () => fillet(C.pinkL, C.leafD,
      'M16 21 C19 28 19 35 16 41 M27 18.5 C30 26 30 33 27 40.5 M38 18.8 C41 25 41 32 38 38.6 M49 21.5 C51 25 51 30 49 35', C.pink,
      K.dots([[12, 44.5], [20, 45], [28, 44.3], [36, 43], [44, 41], [51, 38]], 1.2, C.black)),
    // Cod fillet: thick white flaky slab.
    cod_fillet: () => fillet(C.white, C.creamD,
      'M14 21.5 C18 27 17 34 13 40.5 M23 19.5 C27 25 26 33 22 40.8 M32 18.5 C36 24 35 32 31 40 M41 18.8 C45 24 44 31 40 38.6 M50 21 C53 25 52 30 49 36', C.greyL),
    // Tuna steak: thick round cut of deep red loin with muscle rings and dark bloodline.
    tuna_steak: () =>
      K.shadow(25, 57) +
      `<path d="M7 30 C7 39 17 44 30 44 C42 44 56 41 57 32 V40 C56 49 42 52 30 52 C17 52 7 47 7 38 Z" fill="${C.meatD}"/>` +
      `<path d="M7 30 C7 20 22 15 33 16 C47 17 57 23 57 32 C56 40 42 44 30 44 C17 44 7 39 7 30 Z" fill="${C.meat}"/>` +
      K.line('M15 25 C22 20 36 20 40 26 C43 31 36 37 28 37 M20 32 C24 28 31 28 32 31 M44 22 C50 26 52 31 48 36', 1.6, C.meatL) +
      `<path d="M38 28 C42 30 46 31 50 30 C47 34 42 34 38 32 Z" fill="${C.meatD}" stroke="none"/>` +
      K.hiE(17, 22, 6, 2, -15),
    // Smoked salmon: thin draped slices on a wooden board with a lemon wedge.
    smoked_salmon: () => {
      const slice = (x, y, rot) =>
        `<g transform="translate(${x} ${y}) rotate(${rot})">` +
        `<path d="M-15 3.5 C-14 -1 -11 -4 -5 -5.5 C-1 -6 3 -4 7 -5.5 C11 -6 14 -5 15 -3.5 C14 1 11 4 6 5 C2 5.5 -2 4 -6 5 C-10 5.5 -13 5 -15 3.5 Z" fill="${C.orange}"/>` +
        K.line('M-9 -3 C-8 0 -9 2 -10 4 M-2 -4.5 C-1 -1 -2 2 -3 4.5 M5 -4.5 C6 -1.5 5 1.5 4 4.5', 1.4, C.orangeL) + `</g>`;
      return K.plate(slice(17, 39, -12) + slice(31, 36, -12) + slice(45, 35, -12) + K.hiE(13, 34, 3.5, 1.2, -20) +
        `<path d="M40 46 L53 44 C52 50 45 51 40 46 Z" fill="${C.yellow}" stroke-width="2"/>`);
    },
    // Kippers: split, smoked herring laid open (butterflied), coppery gold with the backbone showing.
    kippers: () =>
      K.shadow(26, 57) +
      `<path d="M48 32 L60 22 C58 28 58 36 60 42 Z" fill="${C.orangeD}"/>` +
      `<path d="M5 32 C5 26 9 22 14 22 C24 16 38 15 50 25 L50 39 C38 49 24 48 14 42 C9 42 5 38 5 32 Z" fill="${C.orangeD}"/>` +
      `<path d="M16 25 C26 20 38 20 47 27 L47 37 C38 44 26 44 16 39 Z" fill="${C.orange}" stroke-width="1.6"/>` +
      K.line('M16 32 H48', 2.2, C.creamL) + K.line('M22 32 L25 24 M28 32 L31 22.5 M34 32 L37 23 M40 32 L42 25 M22 32 L25 40 M28 32 L31 41.5 M34 32 L37 41 M40 32 L42 39', 1.2, C.orangeD) +
      `<circle cx="10" cy="29" r="2" fill="${C.white}" stroke-width="1.4"/>` + K.dots([[10, 29]], 1) + K.line('M5.5 34 L9 34', 1.4) +
      K.hiE(24, 22.5, 7, 1.4, -8),
    // Katsuobushi: rock-hard smoked bonito block, with a pile of pink shavings in front.
    katsuobushi: () => {
      const flake = (x, y, r, f) => `<path d="M${x - 8} ${y} C${x - 5} ${y - 4} ${x + 2} ${y - 5} ${x + 8} ${y - 2} L${x + 6} ${y + 3} C${x + 1} ${y + 1} ${x - 4} ${y + 3} ${x - 8} ${y} Z" fill="${f}" stroke-width="1.8" transform="rotate(${r} ${x} ${y})"/>` + K.line(`M${x - 4} ${y} C${x - 1} ${y - 2} ${x + 2} ${y - 2} ${x + 5} ${y - 1}`, 1, C.pinkD);
      return K.shadow(27, 58) +
        `<path d="M6 30 C10 18 34 11 52 15 C60 17 61 25 55 30 C44 38 20 40 11 37 C7 36 5 33 6 30 Z" fill="${C.brownD}"/>` + `<path d="M30 31 C38 30 46 27 52 22 C50 28 42 33 32 34 Z" fill="${C.pinkD}" stroke-width="1.4"/>` +
        K.sh('M55 21 C58 26 56 30 52 32 C42 37 24 39 12 37 C26 35 46 31 55 21 Z') +
        K.dots([[20, 23], [30, 19.5], [42, 18], [36, 24], [24, 30], [14, 30], [48, 18.5]], 1.2, C.greyL) +
        K.hiE(22, 21.5, 7, 1.6, -15) +
        flake(18, 46, 0, C.pinkL) + flake(32, 44, 20, C.pinkL) + flake(45, 47, -10, C.pinkL) + flake(26, 53, -25, C.pink) + flake(40, 54, 10, C.pinkL);
    },
    // Fish bones: picked skeleton, head left.
    fish_bones: () => {
      const bone = (d, w = 2) => K.line(d, w + 2.5) + K.line(d, w, C.cream);
      const ribs = [22, 28, 34, 40, 46].map((x) => `M${x} 32 C${x + 1} 27 ${x + 2} 23 ${x + 4} 20 M${x} 32 C${x + 1} 37 ${x + 2} 41 ${x + 4} 44`).join(' ');
      return K.shadow(24, 57) +
        bone(ribs, 1.6) + bone('M17 32 H52', 3) +
        `<path d="M50 32 L60 22 C58 28 58 36 60 42 Z" fill="${C.cream}"/>` + K.line('M52 32 L58 26 M52 32 H58 M52 32 L58 38', 1.2, C.creamD) +
        `<path d="M4 31 C6 22 14 19 20 21 C22 26 22 38 20 43 C14 44 7 41 4 34 Z" fill="${C.cream}"/>` +
        `<circle cx="11" cy="28" r="2.8" fill="${C.ink}" stroke="none"/>` + K.line('M5 34 L10 35 M15 23 C17 28 17 36 15 41', 1.4) + K.hiE(10, 23.5, 3, 1.3, -30);
    },
    // Salmon roe: jar packed with glossy orange beads.
    salmon_roe: () => {
      const beads = [[22, 30], [28, 29], [34, 29], [40, 30], [44, 34], [25, 35], [31, 34], [37, 35], [21, 40], [27, 41], [33, 40], [39, 40], [44, 42], [24, 46], [30, 46], [36, 46], [42, 48], [21, 51], [27, 52], [33, 52], [39, 53]];
      return K.jar(C.orangeD, C.blueD, '') +
        beads.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${C.orange}" stroke="${C.redD}" stroke-width="1"/>`).join('') +
        K.dots(beads.map(([x, y]) => [x - 1, y - 1]), 0.9, C.orangeL) + K.hi('M18.5 24 L21.5 24 L21.5 52 L18.5 50 Z');
    },
    // Peeled shrimp: two cooked, peeled tails with their red tail fans.
    peeled_shrimp: () => {
      const one = (cx, cy) => {
        const body = curl(cx, cy, 14, 190, 415, 11, 5.5);
        const ex = cx + 11 * Math.cos((415 * Math.PI) / 180), ey = cy + 11 * Math.sin((415 * Math.PI) / 180);
        return `<path d="M${ex.toFixed(1)} ${ey.toFixed(1)} l-6 -1 l-4 5 l7 1 Z" fill="${C.red}" stroke-width="2"/>` +
          `<path d="${body}" fill="${C.pinkL}"/>` + `<path d="${curl(cx, cy, 13, 200, 400, 4.5, 2.5)}" fill="${C.orangeL}" stroke="none"/>` +
          K.line(curlLines(cx, cy, 14, 190, 415, 11, 5.5, 5), 1.6, C.orange) + K.hiE(cx - 6, cy - 9, 4, 1.3, -40);
      };
      return K.shadow(26, 58) + one(22, 24) + one(42, 38);
    },
    // Lobster meat: the shelled tail (white, streaked red) and a whole claw piece.
    lobster_meat: () =>
      K.plate(
        `<path d="M6 36 C6 27 15 23 26 24 C35 25 40 30 39 37 C38 43 31 46 24 45 L19 48 C12 48 6 43 6 36 Z" fill="${C.white}"/>` +
        `<path d="M8.5 32 C10 27 17 25 26 25.5 C33 26 38 29 38.5 34 C31 30.5 18 30 8.5 32 Z" fill="${C.red}" stroke="none"/>` +
        K.line('M15 25.5 C17 31 17 38 15 45 M23 24.5 C25 30 25 37 23 44 M31 26 C33 31 33 37 31 42', 1.3, C.redD) +
        `<path d="M6 36 C6 27 15 23 26 24 C35 25 40 30 39 37 C38 43 31 46 24 45 L19 48 C12 48 6 43 6 36 Z" fill="none"/>` +
        K.hiE(16, 28, 4, 1.2, -10)) +
      K.badge('lobster', 49, 45, 12),
    // Crab meat: flaked white-and-red crab meat in a bowl, with a crab badge.
    crab_meat: () =>
      K.bowl(
        `<path d="M14 30 C16 25 22 24 26 26 C29 22 36 22 39 26 C43 23 49 25 50 30 C44 34 22 35 14 30 Z" fill="${C.white}" stroke-width="1.6"/>` +
        K.line('M18 28 C20 26 23 26 25 28 M29 25.5 C31 24.5 34 24.5 36 26 M41 26.5 C43 25.5 46 26 48 28', 1.8, C.redL),
        C.white, C.creamL) +
      K.badge('crab', 50, 49, 12),
    // Salt cod (bacalhau): stiff, flat, split dried fish, pale and crusted with salt.
    salt_cod: () =>
      K.shadow(26, 58) +
      `<path d="M5 22 C18 16 34 12 46 12 L59 7 L56 19 C55 32 49 45 39 54 C29 54 15 49 8 41 C4 35 4 28 5 22 Z" fill="${C.cream}"/>` +
      `<path d="M10 24 C20 20 32 17 44 17 C48 26 46 38 38 48 C29 47 18 43 12 37 C9 33 9 28 10 24 Z" fill="${C.creamL}" stroke-width="1.6"/>` +
      K.line('M12 30 C22 28 32 26 44 22', 1.4, C.creamD) +
      `<rect x="20" y="31" width="3" height="3" fill="${C.white}" stroke-width="1.2" transform="rotate(20 21.5 32.5)"/><rect x="31" y="35" width="3" height="3" fill="${C.white}" stroke-width="1.2" transform="rotate(-15 32.5 36.5)"/><rect x="36" y="25" width="2.6" height="2.6" fill="${C.white}" stroke-width="1.2" transform="rotate(30 37 26)"/><rect x="25" y="41" width="2.6" height="2.6" fill="${C.white}" stroke-width="1.2"/>` +
      K.dots([[17, 26], [28, 22], [40, 31], [33, 44], [15, 37]], 1, C.greyD) + K.hiE(14, 21, 5, 1.6, -20),
    // Canned tuna: short round tin, lid open on pale tuna chunks, blue label with a tuna glyph.
    canned_tuna: () =>
      can(C.blueD,
        `<path d="M20 44 C24 40 32 40 38 43 L44 39 L44 49 L38 45 C32 48 24 48 20 44 Z" fill="${C.yellow}" stroke-width="1.6"/>` + K.dots([[24, 43.5]], 1),
        `<ellipse cx="32" cy="24.5" rx="17.5" ry="5" fill="${C.pinkL}" stroke-width="1.6"/>` +
        K.line('M22 24 C24 22 27 22 29 24 M33 23 C35 21 38 21 40 23 M27 27 C29 25.5 32 25.5 34 27', 1.4, C.pinkD) +
        `<path d="M13 21 C12 12 22 6 34 7 C46 8 53 14 52 21 C48 16 40 13 32 13 C24 13 17 16 13 21 Z" fill="${C.steel}"/>` + K.line('M30 10 C33 9.5 36 10 38 11', 1.4, C.greyD)),
    // Canned sardines: flat rectangular tin, lid rolled back, three sardines packed in oil.
    canned_sardines: () => {
      const s = (y) => `<path d="M13 ${y} C16 ${y - 4} 38 ${y - 4} 44 ${y - 1} L49 ${y - 4} L48 ${y} L49 ${y + 4} L44 ${y + 1} C38 ${y + 4} 16 ${y + 4} 13 ${y} Z" fill="${C.greyL}" stroke-width="1.6"/>` +
        `<path d="M15 ${y - 1} C20 ${y - 3.5} 38 ${y - 3.5} 44 ${y - 1} Z" fill="${C.blue}" stroke="none"/>` + K.dots([[17, y - 0.5]], 0.9);
      return K.shadow(28, 58) +
        `<path d="M5 47 V51 C5 53 7 55 9 55 H51 C53 55 55 53 55 51 V47 Z" fill="${C.greyD}"/>` +
        `<rect x="5" y="20" width="50" height="31" rx="7" fill="${C.steel}"/>` +
        `<rect x="9" y="24" width="42" height="23" rx="4" fill="${C.yellowL}" stroke-width="1.6"/>` +
        s(29) + s(36) + s(43) +
        `<path d="M53 18 C61 18 61 32 57 32 C61 32 61 46 53 46" fill="none" stroke-width="2"/>` +
        `<rect x="53" y="17" width="7" height="30" rx="3.5" fill="${C.steel}"/>` + K.line('M56.5 21 V43', 1.2, C.greyD) +
        K.hi('M8 22 L12 22 C10 26 10 40 11 47 L8 47 Z');
    },
    // Anchovy fillets: jar of oil packed with reddish-brown curled fillets.
    anchovy_fillets: () => {
      const st = ['M20 32 C26 29 30 35 36 32 C40 30 42 31 44 32', 'M20 39 C26 36 30 42 36 39 C40 37 42 38 44 39', 'M20 46 C26 43 30 49 36 46 C40 44 42 45 44 46', 'M20 52 C26 50 32 54 38 52 C41 51 43 51 44 52'];
      return K.jar(C.yellowL, C.greyD, '') + st.map((d) => K.line(d, 5.5) + K.line(d, 3, C.terracotta)).join('') +
        K.hi('M18.5 24 L21.5 24 L21.5 52 L18.5 50 Z');
    },
    // Dried shrimp: sack with a small orange shrimp glyph.
    dried_shrimp: () => K.sack(C.wheatL, K.ref('shrimp', 32, 41, 0.4), C.orangeD) +
      `<path d="M22 21 C26 17 38 17 42 21" fill="${C.orange}" stroke-width="1.5"/>` + K.dots([[27, 19.5], [32, 18.5], [37, 19.5]], 1.2, C.orangeD),
    // Surimi: stacked crab sticks, red-orange skin over white fish paste.
    surimi: () => {
      const stick = (x, y) =>
        `<path d="M${x} ${y - 5} H${x + 34} C${x + 37} ${y - 5} ${x + 37} ${y + 5} ${x + 34} ${y + 5} H${x} Z" fill="${C.white}"/>` +
        `<path d="M${x + 1} ${y - 3.8} H${x + 34} C${x + 35.6} ${y - 3.8} ${x + 36} ${y - 1} ${x + 35.8} ${y} H${x + 1} Z" fill="${C.red}" stroke="none"/>` +
        `<path d="M${x} ${y - 5} H${x + 34} C${x + 37} ${y - 5} ${x + 37} ${y + 5} ${x + 34} ${y + 5} H${x} Z" fill="none"/>` +
        `<ellipse cx="${x}" cy="${y}" rx="3" ry="5" fill="${C.white}"/>` + K.line(`M${x + 8} ${y - 3.5} V${y - 0.5} M${x + 18} ${y - 3.5} V${y - 0.5} M${x + 28} ${y - 3.5} V${y - 0.5}`, 1.2, C.redL);
      return K.shadow(26, 58) + stick(18, 32) + stick(6, 43) + stick(22, 51);
    },
    // Toasted nori sheets: stack of square dark-green sheets in 3/4 view.
    toasted_nori_sheets: () =>
      K.shadow(27, 57) +
      `<path d="M4 38 L32 52 L60 38 V42 L32 56 L4 42 Z" fill="${C.pine}"/>` + K.line('M4 40 L32 54 L60 40', 1.2, C.leafD) +
      `<path d="M4 38 L32 24 L60 38 L32 52 Z" fill="${C.pine}"/>` +
      `<path d="M10 31 L34 19 L56 30 L32 42 Z" fill="${C.leafD}" stroke-width="2"/>` +
      K.line('M18 29 L36 21 M22 33 L42 24 M26 36 L47 26 M30 39 L50 29', 1.2, C.pine) +
      K.hi('M16 30 L33 21.5 L36 23 L19 31.5 Z'),
    // Dried kombu: stiff, dark, wavy-edged strips dusted with white mineral bloom.
    dried_kombu: () => {
      const strip = (y, rot, f) =>
        `<g transform="rotate(${rot} 32 ${y})"><path d="M4 ${y - 6} C14 ${y - 9} 22 ${y - 4} 32 ${y - 7} C42 ${y - 10} 50 ${y - 5} 60 ${y - 8} L60 ${y + 6} C50 ${y + 9} 42 ${y + 4} 32 ${y + 7} C22 ${y + 10} 14 ${y + 5} 4 ${y + 8} Z" fill="${f}"/>` +
        K.dots([[12, y - 2], [20, y + 3], [28, y - 1], [37, y + 2], [45, y - 3], [52, y + 2], [16, y + 5], [41, y + 4]], 1.1, C.greyL) + `</g>`;
      return K.shadow(26, 57) + strip(26, -8, C.black) + strip(42, 4, C.choc) + K.hiE(14, 37, 5, 1.4, -5);
    },
    // Dried wakame: heap of crinkled dark-green flakes, one rehydrated bright green piece.
    dried_wakame: () =>
      K.shadow(26, 57) +
      `<path d="M6 55 C8 46 12 38 18 34 C20 28 26 24 32 25 C38 23 44 27 46 33 C52 37 57 46 58 55 Z" fill="${C.pine}"/>` +
      K.line('M14 46 L18 43 L21 47 L25 43 M28 36 L32 33 L35 37 L39 33 M36 47 L40 44 L43 48 L47 44 M20 53 L24 50 L27 53 M38 54 L42 51 L45 54', 1.5, C.leafD) +
      `<path d="M46 20 C52 14 60 16 60 22 C56 21 54 24 56 27 C52 29 46 26 46 20 Z" fill="${C.leaf}" stroke-width="2"/>` +
      `<path d="M8 20 L12 16 L15 20 L12 23 Z M18 13 L22 11 L23 15 Z" fill="${C.pine}" stroke-width="1.8"/>` +
      K.hiE(24, 30, 4, 1.4, -30),
  });
})(FSI);
