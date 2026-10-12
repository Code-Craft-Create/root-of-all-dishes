// Mushrooms (cultivated and foraged), truffle and dried mushrooms.
(function (FSI) {
  const { C, K } = FSI;
  const f1 = (n) => Math.round(n * 10) / 10;
  const P = (d, fill, sw) => `<path d="${d}" fill="${fill}"${sw ? ` stroke-width="${sw}"` : ''}/>`;
  const E = (cx, cy, rx, ry, fill, sw, rot) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${sw ? ` stroke-width="${sw}"` : ''}${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
  const R = (a, x, y, m) => (a ? `<g transform="rotate(${a} ${x} ${y})">${m}</g>` : m);
  // side-view mushroom standing at (x, y): cap half width w, cap height h, stem half width sw, stem height sh
  const mush = (x, y, w, h, sw, sh, cap, stem, under = C.creamD) => {
    const cb = y - sh;
    return P(`M${x - sw} ${y} C${x - sw - 1} ${y - sh * 0.5} ${x - sw + 0.5} ${cb + 2} ${x - sw + 0.5} ${cb} H${x + sw - 0.5} C${x + sw - 0.5} ${cb + 2} ${x + sw + 1} ${y - sh * 0.5} ${x + sw} ${y} C${x + sw * 0.5} ${y + 1.5} ${x - sw * 0.5} ${y + 1.5} ${x - sw} ${y} Z`, stem) +
      E(x, cb, w * 0.86, Math.max(2.5, h * 0.2), under, 1.8) +
      P(`M${x - w} ${cb} C${x - w} ${cb - h * 1.3} ${x + w} ${cb - h * 1.3} ${x + w} ${cb} C${x + w * 0.6} ${cb - 2.5} ${x - w * 0.6} ${cb - 2.5} ${x - w} ${cb} Z`, cap) +
      K.hiE(f1(x - w * 0.45), f1(cb - h * 0.6), f1(w * 0.22), f1(h * 0.16), -25);
  };
  // knobbly round outline
  const lumpy = (cx, cy, r, n, fill) => {
    let d = '';
    const br = f1(r * Math.sin(Math.PI / n) * 1.2);
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2, rr = r + (i % 3 === 0 ? 0.8 : 0);
      const px = f1(cx + Math.cos(a) * rr), py = f1(cy + Math.sin(a) * rr * 0.9);
      d += i ? ` A${br} ${br} 0 0 1 ${px} ${py}` : `M${px} ${py}`;
    }
    return P(d + ' Z', fill);
  };

  FSI.add('veg_herbs', {
    button_mushrooms: () =>
      K.shadow(26) + mush(45, 50, 13, 18, 5, 12, C.white, C.creamL) + mush(25, 58, 20, 26, 7.5, 14, C.white, C.creamL),
    shiitake: () =>
      K.shadow(24) +
      mush(46, 55, 10, 7, 3.5, 12, C.brown, C.creamL) +
      P('M27 58 C24 52 25 44 26 38 H34 C35 44 36 52 35 58 C33 59 29 59 27 58 Z', C.creamL) +
      K.line('M28 44 C29 48 29 52 28 56 M32 42 C33 47 33 52 32 57', 1.2, C.creamD) +
      E(30, 36, 20, 4, C.cream, 1.8) +
      P('M6 37 C6 22 20 13 31 13 C44 13 56 22 55 37 C52 34 46 33 40 34 C34 32 28 32 22 34 C16 33 9 34 6 37 Z', C.brownD) +
      K.dots([[18, 22], [26, 18], [34, 17], [42, 21], [22, 28], [31, 24], [39, 27], [47, 27], [13, 30], [29, 30]], 1.2, C.brownL) +
      K.hiE(17, 21, 4.5, 2.2, -25),
    oyster_mushrooms: () =>
      K.shadow(25) +
      P('M30 40 C24 30 24 16 34 9 C44 5 56 11 58 21 C60 30 54 36 46 38 C40 40 34 41 30 40 Z', C.greyL) +
      K.line('M30 40 C34 30 38 20 40 9 M30 40 C38 32 46 24 56 17 M30 40 C40 36 50 34 57 30', 1.2, C.greyD) +
      P('M30 46 C20 47 8 42 5 31 C4 22 11 17 18 19 C24 22 28 32 32 42 Z', C.grey) +
      K.line('M30 44 C22 38 14 30 9 22 M30 44 C22 42 12 38 6 32', 1.2, C.greyD) +
      P('M27 50 C33 43 45 40 54 44 C61 48 57 56 46 57 C38 58 31 56 27 52 Z', C.greyL) +
      K.line('M28 51 C36 47 46 46 56 48 M28 51 C36 52 44 55 50 56', 1.2, C.greyD) +
      P('M23 58 C22 52 25 46 29 43 C33 45 33 54 32 58 Z', C.creamL) + K.hiE(36, 15, 4.5, 2, -25),
    wood_ear: () => {
      const ear = (x, y, s, rot, f, inner) =>
        K.place(R(rot, 32, 32, P('M32 6 C46 4 58 14 58 30 C58 46 46 58 30 58 C16 58 6 48 8 36 C10 28 16 26 20 30 C22 22 18 16 22 12 C25 8 28 7 32 6 Z', f) +
          P('M32 14 C42 13 50 20 50 31 C50 42 42 50 31 50 C22 50 16 44 17 38 C22 40 26 36 28 30 C30 24 26 18 32 14 Z', inner, 1.8) +
          K.line('M34 20 C40 24 42 32 38 40', 1.5, f)), x, y, s);
      return K.shadow(24) + ear(44, 40, 0.5, 30, C.brownD, C.brown) + ear(26, 36, 0.78, -10, C.choc, C.brownD) + K.hiE(20, 18, 4, 2, -30);
    },
    enoki: () => {
      const tips = [[14, 10], [20, 6], [26, 9], [32, 4], [38, 8], [44, 5], [50, 10], [18, 16], [46, 15], [30, 13], [37, 15]];
      const d = tips.map(([x, y]) => `M${32 + (x - 32) * 0.2} 46 C${32 + (x - 32) * 0.4} 34 ${x} ${y + 12} ${x} ${y + 2}`).join(' ');
      return K.shadow(16) + K.line(d, 5) + K.line(d, 2.6, C.white) +
        tips.map(([x, y]) => E(x, y, 3.4, 2.6, C.creamL, 1.8)).join('') +
        P('M24 44 H40 L42 54 C42 58 22 58 22 54 Z', C.brownL) + K.line('M25 49 H39', 1.3, C.brownD) + K.hi('M25 46 H28 L27 55 H24.5 Z');
    },
    porcini: () =>
      K.shadow(22) +
      P('M18 58 C12 56 12 44 18 38 C21 34 22 30 22 26 H42 C42 30 43 34 46 38 C52 44 52 56 46 58 Z', C.cream) +
      K.line('M22 40 l3 3 l3 -3 l3 3 l3 -3 l3 3 l3 -3 M19 48 l3 3 l3 -3 l3 3 l3 -3 l3 3 l3 -3 l3 3 l3 -3', 1.1, C.creamD) +
      K.sh('M44 36 C50 42 52 52 46 57 C48 50 47 42 42 34 Z') +
      E(32, 26, 23, 4.5, C.wheatL, 1.8) +
      P('M7 27 C5 12 20 5 32 5 C44 5 59 12 57 27 C52 24 42 23 32 23 C22 23 12 24 7 27 Z', C.brown) +
      K.hiE(18, 12, 6, 2.6, -20) + K.sh('M54 14 C57 18 57 24 56 27 C52 25 50 24 48 24 C52 22 54 18 54 14 Z'),
    chanterelles: () => {
      const ch = (x, y, s, rot, f) =>
        K.place(R(rot, 32, 32, P('M28 58 C26 50 22 40 12 30 C6 24 6 16 12 14 C16 18 20 14 24 16 C28 12 34 13 38 15 C42 12 48 14 52 16 C58 18 58 26 52 32 C42 40 38 50 36 58 Z', f) +
          E(32, 18, 18, 4.5, C.yellowL, 1.8) +
          K.line('M30 54 C28 44 24 36 16 28 M33 54 C33 44 32 36 30 26 M35 54 C37 44 40 36 48 28', 1.3, C.orangeD)), x, y, s);
      return K.shadow(24) + ch(44, 38, 0.7, 14, C.orange) + ch(26, 34, 0.85, -8, C.yellow);
    },
    morels: () => {
      const mo = (x, y, s, rot) =>
        K.place(R(rot, 32, 32, P('M26 40 C25 48 24 54 22 58 H42 C40 54 39 48 38 40 Z', C.creamL) +
          P('M32 4 C42 6 46 20 45 32 C45 38 42 42 32 42 C22 42 19 38 19 32 C18 20 22 6 32 4 Z', C.brownL) +
          [[27, 14], [36, 13], [24, 24], [32, 22], [40, 23], [26, 34], [34, 32], [41, 33], [31, 9]].map(([a, b]) => E(a, b, 3, 3.6, C.brownD, 1.2)).join('')), x, y, s);
      return K.shadow(24) + mo(44, 38, 0.72, 16) + mo(26, 33, 0.92, -8);
    },
    black_truffle: () =>
      K.shadow(25) + lumpy(26, 34, 19, 15, C.black) +
      K.dots([[18, 26], [26, 22], [34, 26], [22, 34], [30, 32], [16, 40], [26, 42], [36, 38]], 1.4, C.greyD) + K.hiE(18, 22, 4, 2.2, -30) +
      E(44, 48, 15, 9, C.choc, 0, -10) + E(44, 48, 11.5, 6.5, C.brownD, 1.5, -10) +
      K.line('M35 47 C38 44 40 50 44 47 C47 44 49 50 53 46 M38 51 C41 49 43 53 47 51', 1.3, C.creamL),
    dried_porcini: () => {
      const sl = (x, y, rot, f) =>
        R(rot, x, y, P(`M${x - 14} ${y - 4} C${x - 14} ${y - 14} ${x + 14} ${y - 14} ${x + 14} ${y - 4} C${x + 10} ${y - 1} ${x + 6} ${y - 2} ${x + 5} ${y} C${x + 6} ${y + 6} ${x + 7} ${y + 10} ${x + 5} ${y + 12} C${x + 2} ${y + 13} ${x - 2} ${y + 13} ${x - 5} ${y + 12} C${x - 7} ${y + 10} ${x - 6} ${y + 6} ${x - 5} ${y} C${x - 6} ${y - 2} ${x - 10} ${y - 1} ${x - 14} ${y - 4} Z`, f) +
          K.line(`M${x - 13} ${y - 6} C${x - 6} ${y - 8} ${x + 6} ${y - 8} ${x + 13} ${y - 6}`, 2.4, C.brownD) +
          K.line(`M${x - 2} ${y + 1} C${x - 3} ${y + 5} ${x - 1} ${y + 8} ${x - 2} ${y + 11} M${x + 2} ${y - 2} C${x + 3} ${y + 3} ${x + 1} ${y + 7} ${x + 2} ${y + 10}`, 1.2, C.wheatD));
      return K.shadow(27) + sl(45, 44, 58, C.woodL) + sl(19, 44, -52, C.wheat) + sl(32, 30, 12, C.woodL);
    },
    dried_shiitake: () => {
      const cap = (x, y, r, rot) =>
        R(rot, x, y, E(x, y, r, r * 0.82, C.brownD) +
          K.line(`M${x - r * 0.6} ${y - r * 0.2} l${r * 0.3} ${r * 0.25} l${r * 0.25} -${r * 0.35} l${r * 0.3} ${r * 0.3} l${r * 0.3} -${r * 0.2} M${x - r * 0.4} ${y + r * 0.35} l${r * 0.3} -${r * 0.15} l${r * 0.3} ${r * 0.2} l${r * 0.35} -${r * 0.2} M${x - r * 0.2} ${y - r * 0.55} l${r * 0.25} ${r * 0.15} l${r * 0.3} -${r * 0.1}`, 1.8, C.cream) +
          K.hiE(f1(x - r * 0.45), f1(y - r * 0.45), f1(r * 0.22), f1(r * 0.12)));
      return K.shadow(26) +
        R(-14, 46, 44, E(46, 44, 12, 9.5, C.creamD) + K.line('M37 44 H55 M39 38 L53 50 M39 50 L53 38 M46 35.5 V52.5', 1.2, C.wheatD) + E(46, 44, 3, 2.5, C.cream, 1.6)) +
        cap(21, 44, 15, 8) + cap(36, 24, 15, -6);
    },
  });
})(FSI);
