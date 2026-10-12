// Seafood group, part 1: whole fish, shellfish and seaweeds (see assets/STYLE.md).
(function (FSI) {
  const { C, K } = FSI;
  const r1 = (v) => Math.round(v * 10) / 10;

  // ---- local helper: parametric whole fish, side view, head left ----------------
  // o: x0 nose x, xt tail end x, cy centre line, ht/hb body height above/below, ph peduncle half height,
  // tl tail length, th tail half height, tail 'fork'|'crescent'|'square'|'round', f1/f2 curve fullness,
  // back/belly/fin colours, bm belly line offset, fins [{a,b,h,bot,spiny,fill}], pat(g) extra markup inside body,
  // after(g) markup on top, eye radius er, no gill/pec when false.
  const fish = (o) => {
    const x0 = o.x0 ?? 4, xt = o.xt ?? 60, cy = o.cy ?? 32, ht = o.ht ?? 12, hb = o.hb ?? 11;
    const ph = o.ph ?? 3.5, tl = o.tl ?? 11, th = o.th ?? 11, xp = xt - tl, L = xp - x0;
    const f1 = o.f1 ?? 0.06, f2 = o.f2 ?? 0.55, ny = o.ny ?? 0;
    const T = [[x0, cy + ny], [x0 + L * f1, cy - ht * 1.33], [x0 + L * f2, cy - ht * 1.33], [xp, cy - ph]];
    const B = [[x0, cy + ny], [x0 + L * f1, cy + hb * 1.33], [x0 + L * f2, cy + hb * 1.33], [xp, cy + ph]];
    const bz = (P, t) => [0, 1].map((k) => (1 - t) ** 3 * P[0][k] + 3 * (1 - t) ** 2 * t * P[1][k] + 3 * (1 - t) * t * t * P[2][k] + t ** 3 * P[3][k]);
    const samp = (P) => Array.from({ length: 81 }, (_, i) => bz(P, i / 80));
    const ST = samp(T), SB = samp(B);
    const at = (S, x) => { let best = S[0]; for (const p of S) if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p; return best[1]; };
    const g = { x0, xt, xp, cy, L, top: (x) => at(ST, x), bot: (x) => at(SB, x) };
    const p = (P) => P.map((q) => `${r1(q[0])} ${r1(q[1])}`);
    const pt = p(T), pb = p(B);
    const body = `M${pt[0]} C${pt[1]} ${pt[2]} ${pt[3]} L${pb[3]} C${pb[2]} ${pb[1]} ${pb[0]} Z`;
    const back = o.back, belly = o.belly ?? C.white, fin = o.fin ?? back;
    const tails = {
      fork: `M${xp - 4} ${cy - ph} L${xt} ${cy - th} Q${xt - 7} ${cy} ${xt} ${cy + th} L${xp - 4} ${cy + ph} Z`,
      crescent: `M${xp - 3} ${cy - ph} C${xp + 2} ${cy - th * 0.5} ${xt - 3} ${cy - th} ${xt + 1} ${cy - th - 1} C${xt - 3} ${cy - th * 0.3} ${xt - 6} ${cy} ${xt - 7} ${cy} C${xt - 6} ${cy} ${xt - 3} ${cy + th * 0.3} ${xt + 1} ${cy + th + 1} C${xt - 3} ${cy + th} ${xp + 2} ${cy + th * 0.5} ${xp - 3} ${cy + ph} Z`,
      square: `M${xp - 4} ${cy - ph} L${xt - 1} ${cy - th} Q${xt + 1} ${cy} ${xt - 1} ${cy + th} L${xp - 4} ${cy + ph} Z`,
      round: `M${xp - 4} ${cy - ph} C${xt + 1} ${cy - th * 1.3} ${xt + 1} ${cy + th * 1.3} ${xp - 4} ${cy + ph} Z`,
    };
    const finM = (f) => {
      const s = f.bot ? 1 : -1, edge = f.bot ? g.bot : g.top;
      const ya = edge(f.a) - s * 2.5, yb = edge(f.b) - s * 2.5, xa = f.a + (f.b - f.a) * (f.pk ?? 0.25), yk = edge(xa) + s * f.h;
      const d = `M${r1(f.a)} ${r1(ya)} L${r1(xa)} ${r1(yk)} C${r1(xa + (f.b - xa) * 0.5)} ${r1(yk + s * -1)} ${r1(f.b)} ${r1(yb + s * f.h * 0.4)} ${r1(f.b)} ${r1(yb)} Z`;
      let m = `<path d="${d}" fill="${f.fill ?? fin}" stroke-width="2"/>`;
      if (f.spiny) {
        let rays = '';
        for (let i = 1; i < 4; i++) { const x = f.a + (f.b - f.a) * i / 4.2; rays += `M${r1(x)} ${r1(edge(x))} L${r1(x + 1)} ${r1(edge(x) + s * f.h * (1 - i * 0.18))} `; }
        m += K.line(rays, 1.2);
      }
      return m;
    };
    const fins = (o.fins || []).map(finM).join('');
    const bmo = o.bm ?? 1.5;
    const bellyD = `M${pb[0]} C${r1(x0 + L * 0.3)} ${r1(cy + bmo)} ${r1(xp - 10)} ${r1(cy + bmo * 0.6)} ${pb[3]} C${pb[2]} ${pb[1]} ${pb[0]} Z`;
    const gx = o.gx ?? x0 + L * 0.24, er = o.er ?? 2.8, ex = o.ex ?? x0 + L * 0.1, ey = o.ey ?? cy - ht * 0.35;
    // shade band along the rear belly
    const sb = SB.filter((q) => q[0] > x0 + L * 0.45 && q[0] < xp - 1);
    const shade = sb.length > 2 ? K.sh(`M${sb.map((q) => `${r1(q[0])} ${r1(q[1])}`).join(' L')} L${sb.slice().reverse().map((q, i) => `${r1(q[0])} ${r1(q[1] - 3.2 * Math.min(1, (q[0] - sb[0][0]) / 6))}`).join(' L')} Z`) : '';
    return `<path d="${tails[o.tail || 'fork']}" fill="${o.tailFill ?? fin}"/>` + fins +
      `<path d="${body}" fill="${back}" stroke="none"/>` +
      `<path d="${bellyD}" fill="${belly}" stroke="none"/>` + (o.pat ? o.pat(g) : '') + shade +
      `<path d="${body}" fill="none"/>` +
      (o.gill === false ? '' : K.line(`M${r1(gx)} ${r1(g.top(gx) + 3)} C${r1(gx + 3.5)} ${r1(cy - 3)} ${r1(gx + 3.5)} ${r1(cy + 4)} ${r1(gx)} ${r1(g.bot(gx) - 3)}`, 1.6)) +
      (o.pec === false ? '' : `<path d="M${r1(gx + 3)} ${cy + 3} C${r1(gx + 7)} ${cy} ${r1(gx + 12)} ${cy + 2} ${r1(gx + 13)} ${cy + 6} C${r1(gx + 9)} ${cy + 7} ${r1(gx + 5)} ${cy + 6} ${r1(gx + 3)} ${cy + 3} Z" fill="${o.pecFill ?? fin}" stroke-width="1.6"/>`) +
      `<circle cx="${r1(ex)}" cy="${r1(ey)}" r="${er}" fill="${C.white}" stroke-width="1.6"/>` + K.dots([[ex - 0.4, ey]], er * 0.5) +
      (o.mouth === false ? '' : K.line(`M${x0 + 0.5} ${cy + ny + 1} L${x0 + 4} ${cy + ny + 1.5}`, 1.5)) +
      (o.hi === false ? '' : K.hiE(r1(x0 + L * 0.34), r1(g.top(x0 + L * 0.34) + 3), r1(L * 0.14), 1.4, -4)) +
      (o.after ? o.after(g) : '');
  };


  // ---- local helper: a seaweed blade along a quadratic curve from base (bx,by) to tip (tx,ty) ----
  // w = half width, amp/freq = edge ripple, rib = optional midrib colour.
  const blade = (bx, by, tx, ty, qx, qy, w, amp, freq, fill, rib) => {
    const N = 30, L = [], R = [], M = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, u = 1 - t;
      const x = u * u * bx + 2 * u * t * qx + t * t * tx, y = u * u * by + 2 * u * t * qy + t * t * ty;
      const dx = 2 * u * (qx - bx) + 2 * t * (tx - qx), dy = 2 * u * (qy - by) + 2 * t * (ty - qy), l = Math.hypot(dx, dy) || 1;
      const nx = -dy / l, ny = dx / l, ww = w * Math.sin(Math.PI * (0.06 + 0.94 * t)) ** 0.7 * (t < 0.15 ? t / 0.15 * 0.8 + 0.2 : 1);
      const r = amp * Math.sin(t * freq * Math.PI) * Math.min(1, t * 4);
      L.push(`${r1(x + nx * (ww + r))} ${r1(y + ny * (ww + r))}`); R.push(`${r1(x - nx * (ww - r))} ${r1(y - ny * (ww - r))}`); M.push(`${r1(x)} ${r1(y)}`);
    }
    return `<path d="M${L.join(' L')} L${R.reverse().join(' L')} Z" fill="${fill}"/>` + (rib ? K.line(`M${M.slice(0, N - 2).join(' L')}`, 1.6, rib) : '');
  };

  FSI.add('seafood', {
    // Cod: olive-tan, speckled, pale lateral line, chin barbel, three dorsal fins, square tail.
    cod: () => fish({
      back: C.wheatD, belly: C.creamL, fin: C.wheat, ht: 12, hb: 11, tail: 'square', th: 10,
      fins: [{ a: 16, b: 25, h: 6 }, { a: 27, b: 37, h: 5 }, { a: 39, b: 47, h: 4.5 }, { a: 27, b: 36, h: 4.5, bot: 1 }, { a: 38, b: 46, h: 4, bot: 1 }],
      pat: (g) => K.dots([[17, 25], [22, 22], [27, 26], [31, 22], [36, 25], [40, 23], [44, 27], [24, 29], [34, 29]], 1.2, C.brownD) +
        K.line('M14 31 C24 30 36 30 49 31.5', 1.4, C.creamL),
      after: () => K.line('M10 40 C10 43 9 45 8 46', 1.5),
    }),
    // Haddock: grey-brown back, black lateral line and the dark "thumbprint" blotch, tall first dorsal.
    haddock: () => fish({
      back: C.greyD, belly: C.white, fin: C.grey, ht: 12, hb: 10, tail: 'fork', th: 10,
      fins: [{ a: 15, b: 24, h: 9, pk: 0.3 }, { a: 26, b: 37, h: 5 }, { a: 39, b: 47, h: 4 }, { a: 27, b: 37, h: 4.5, bot: 1 }, { a: 39, b: 46, h: 4, bot: 1 }],
      pat: () => K.line('M14 27 C24 25 36 27 49 31', 2, C.black) + `<ellipse cx="21" cy="31" rx="3" ry="2.4" fill="${C.black}" stroke="none"/>`,
    }),
    // Tuna: thick torpedo, dark blue back, silver belly, yellow finlets, crescent tail.
    tuna: () => fish({
      back: C.blueD, belly: C.greyL, fin: C.blueD, ht: 13, hb: 12, f1: 0.16, f2: 0.6, ph: 2.5, tl: 12, th: 14, tail: 'crescent', bm: 3,
      fins: [{ a: 18, b: 27, h: 7, pk: 0.2 }, { a: 31, b: 37, h: 7, pk: 0.1, fill: C.yellow }, { a: 31, b: 37, h: 6, pk: 0.1, bot: 1, fill: C.yellow }],
      pat: () => K.dots([[40, 22.5], [43.5, 25], [46.5, 27.5], [40, 41.5], [43.5, 39], [46.5, 36.5]], 1.4, C.yellow) +
        K.line('M8 31 C20 29 34 30 47 32', 1.3, C.blue),
      pec: true, pecFill: C.blueD,
    }),
    // Skipjack: smaller torpedo, steel-violet back, dark stripes running along the silver belly.
    skipjack_tuna: () => fish({
      x0: 6, xt: 58, back: C.purpleD, belly: C.white, fin: C.purpleD, ht: 11, hb: 11, f1: 0.16, f2: 0.6, ph: 2.5, tl: 11, th: 12, tail: 'crescent', bm: 1,
      fins: [{ a: 18, b: 27, h: 6, pk: 0.2 }, { a: 31, b: 36, h: 5, pk: 0.1 }, { a: 31, b: 36, h: 5, pk: 0.1, bot: 1 }],
      pat: () => K.line('M22 35.5 C30 35.5 38 35 46 33.5 M22 39.5 C30 39.5 37 38.5 44 36.5 M24 43 C30 43 35 41.5 41 39.5', 1.8, C.purpleD),
    }),
    // Mackerel: slim, blue-green back with black tiger bars, white belly, deeply forked tail.
    mackerel: () => fish({
      back: C.tealD, belly: C.white, fin: C.teal, ht: 9, hb: 8, f1: 0.18, f2: 0.6, ph: 2.5, tl: 11, th: 11, tail: 'fork', bm: 0,
      fins: [{ a: 20, b: 27, h: 5 }, { a: 33, b: 39, h: 4 }, { a: 33, b: 39, h: 4, bot: 1 }],
      pat: () => K.line('M16 24 C17 27 15 29 17 31 M21 23 C22 26 20 28 22 31 M26 23 C27 26 25 28 27 31 M31 23.5 C32 26 30 28 32 31 M36 24.5 C37 27 35 28.5 37 31 M41 26 C42 28 40 29 42 31', 1.6, C.black),
    }),
    // Sardines: two small blue-backed fish with a row of dark spots.
    sardines: () => {
      const s = (x0, cy) => fish({
        x0, xt: x0 + 44, cy, back: C.blue, belly: C.white, fin: C.blueL, ht: 6.5, hb: 6, f1: 0.1, f2: 0.6, ph: 2, tl: 9, th: 7, bm: 0.5, er: 2.2, gx: x0 + 8,
        fins: [{ a: x0 + 15, b: x0 + 22, h: 4 }], pec: false,
        pat: () => K.dots([[x0 + 14, cy - 1.5], [x0 + 19, cy - 1.5], [x0 + 24, cy - 1]], 1.3, C.blueD),
      });
      return s(14, 21) + s(4, 43);
    },
    // Anchovies: three slim fish with a bright silver band along the side.
    anchovies: () => {
      const a = (x0, cy) => fish({
        x0, xt: x0 + 42, cy, back: C.tealD, belly: C.greyL, fin: C.teal, ht: 4.5, hb: 4, f1: 0.1, f2: 0.6, ph: 1.6, tl: 8, th: 6, bm: 0, er: 1.9, gx: x0 + 6, ex: x0 + 4, ey: cy - 1.2,
        pec: false, gill: false, hi: false, ny: -1,
        pat: () => K.line(`M${x0 + 6} ${cy} L${x0 + 32} ${cy}`, 1.6, C.white),
      });
      return a(18, 16) + a(4, 31) + a(14, 46);
    },
    // Herring: single deep-bellied silver fish, blue back, no spots.
    herring: () => fish({
      back: C.blue, belly: C.greyL, fin: C.blueL, ht: 10, hb: 12, f1: 0.08, f2: 0.5, ph: 3, tl: 12, th: 12, tail: 'fork', bm: -1, ny: -1,
      fins: [{ a: 24, b: 33, h: 6 }, { a: 34, b: 41, h: 4, bot: 1 }],
      pat: () => K.line('M14 37 C24 39 36 38 46 33', 1.2, C.white),
    }),
    // Sea bass: silver-grey, spiny first dorsal, big jaw.
    sea_bass: () => fish({
      back: C.steel, belly: C.white, fin: C.grey, ht: 12, hb: 10, f1: 0.06, f2: 0.55, tail: 'fork', th: 11, ny: 1,
      fins: [{ a: 16, b: 27, h: 9, pk: 0.35, spiny: 1 }, { a: 29, b: 38, h: 6 }, { a: 31, b: 38, h: 5, bot: 1 }],
      pat: () => K.line('M13 30 C24 28 36 29 48 31', 1.4, C.greyD) + `<ellipse cx="17" cy="28" rx="2.2" ry="1.8" fill="${C.greyD}" stroke="none"/>`,
      after: () => K.line('M4.5 34 C7 36 9 36 12 35', 1.6),
    }),
    // Salmon: grey-blue back, pink flush on the silver belly, small black spots, adipose fin.
    salmon: () => fish({
      back: C.greyD, belly: C.pinkL, fin: C.grey, ht: 10.5, hb: 10, f1: 0.14, f2: 0.55, ph: 3, th: 11, tail: 'square', bm: 1,
      fins: [{ a: 22, b: 31, h: 7 }, { a: 41, b: 45, h: 3.5, pk: 0.5 }, { a: 35, b: 42, h: 4.5, bot: 1 }],
      pat: () => K.line('M14 33 C24 33 36 33 47 32', 3, C.pink) + K.dots([[18, 25], [24, 23.5], [30, 24], [35, 25], [40, 26.5], [27, 28], [37, 29.5], [54, 29], [55, 35]], 1.1, C.black),
      after: () => K.line('M4.5 33 C5 35 7 35.5 9 35', 1.5),
    }),
    // Rainbow trout: olive-green back, pink-red side stripe, black spots all over.
    trout: () => fish({
      back: C.leafD, belly: C.creamL, fin: C.leaf, ht: 10.5, hb: 10, f1: 0.12, f2: 0.55, ph: 3, th: 10, tail: 'square', bm: 2,
      fins: [{ a: 23, b: 31, h: 6 }, { a: 41, b: 45, h: 3, pk: 0.5 }, { a: 35, b: 42, h: 4.5, bot: 1 }],
      pat: () => K.line('M15 32 C25 31 37 31 48 31.5', 4, C.redL) + K.dots([[17, 25], [22, 23], [27, 26], [31, 23], [35, 27], [39, 24], [43, 28], [24, 36], [33, 37], [41, 35], [54, 27], [55, 36], [56, 31]], 1.1, C.black),
    }),
    // Carp: deep golden-bronze body with big scales and barbels, rounded fins.
    carp: () => fish({
      x0: 5, back: C.orangeD, belly: C.yellowL, fin: C.orange, ht: 14, hb: 12, f1: 0.1, f2: 0.5, ph: 4, th: 11, tail: 'fork', bm: 3, ny: 1,
      fins: [{ a: 22, b: 42, h: 6, pk: 0.15 }, { a: 36, b: 43, h: 5, bot: 1 }],
      pat: () => K.line('M24 20.5 C26.5 21.5 26.5 24.5 24 25.5 M30 20.5 C32.5 21.5 32.5 24.5 30 25.5 M36 20.5 C38.5 21.5 38.5 24.5 36 25.5 M21 25.5 C23.5 26.5 23.5 29.5 21 30.5 M27 25.5 C29.5 26.5 29.5 29.5 27 30.5 M33 25.5 C35.5 26.5 35.5 29.5 33 30.5 M39 25.5 C41.5 26.5 41.5 29.5 39 30.5 M24 30.5 C26.5 31.5 26.5 34.5 24 35.5 M30 30.5 C32.5 31.5 32.5 34.5 30 35.5 M36 30.5 C38.5 31.5 38.5 34.5 36 35.5 M42 30.5 C44.5 31.5 44.5 34.5 42 35.5 M27 35.5 C29.5 36.5 29.5 39.5 27 40.5 M33 35.5 C35.5 36.5 35.5 39.5 33 40.5 M39 35.5 C41.5 36.5 41.5 39.5 39 40.5', 1.4, C.yellow),
      after: () => K.line('M6 35 C5 38 4 39 3.5 41', 1.5),
    }),
    // Tilapia: deep, flat body, grey with dark vertical bars, long spiny dorsal, reddish fins.
    tilapia: () => fish({
      back: C.greyD, belly: C.greyL, fin: C.redL, ht: 14, hb: 13, f1: 0.1, f2: 0.5, ph: 5, tl: 10, th: 11, tail: 'square', bm: 3, ny: 1,
      fins: [{ a: 15, b: 45, h: 6, pk: 0.1, spiny: 1 }, { a: 32, b: 45, h: 6, bot: 1 }],
      pat: () => K.line('M24 22 C25 30 25 37 24 44 M31 21 C32 30 32 37 31 45 M38 22 C39 30 39 36 38 43 M44 26 C45 30 45 34 44 39', 2.5, C.greyD),
    }),
    // Sole: oval flatfish seen on its eyed side, frilled fin all round, both eyes on top.
    sole: () =>
      `<path d="M46 32 L60 24 C62 29 62 35 60 40 Z" fill="${C.brownL}"/>` +
      `<path d="M4 30 C5 21 18 16 31 16 C44 16 51 23 53 32 C51 41 44 48 31 48 C18 48 5 43 4 34 Z" fill="${C.brownL}"/>` +
      `<path d="M7 31 C8 23 19 20 30 20 C41 20 47 26 49 32 C47 38 41 44 30 44 C19 44 8 41 7 34 Z" fill="${C.brown}"/>` +
      K.line('M17 21 L16 17.5 M24 20 L23.5 16.5 M31 20 V16.5 M38 21 L39 17.5 M44 24 L46 21 M17 43 L16 46.5 M24 44 L23.5 47.5 M31 44 V47.5 M38 43 L39 46.5 M44 40 L46 43', 1.2, C.brownD) +
      K.line('M18 32 C26 31 38 31 48 32', 1.4, C.brownD) +
      K.dots([[25, 26], [33, 25], [40, 28], [28, 38], [37, 38], [21, 37]], 1.3, C.brownD) +
      `<path d="M15 27 C17 30 17 35 15 38" fill="none" stroke-width="1.6"/>` +
      `<circle cx="11" cy="25" r="2.4" fill="${C.white}" stroke-width="1.5"/><circle cx="13.5" cy="21" r="2.4" fill="${C.white}" stroke-width="1.5"/>` +
      K.dots([[10.7, 25], [13.2, 21]], 1.2) + K.line('M8 35 C9 37 11 37 12 36', 1.5) +
      K.hiE(28, 22, 7, 1.6, -5),
    // Halibut: big diamond-shaped flatfish, dark olive-grey with pale blotches, crescent tail.
    halibut: () =>
      `<path d="M44 32 L60 20 C56 27 56 37 60 44 Z" fill="${C.greyD}"/>` +
      `<path d="M5 30 C8 22 16 12 30 9 C34 16 42 24 47 30 V34 C42 40 34 48 30 55 C16 52 8 42 5 34 Z" fill="${C.greyD}"/>` +
      `<path d="M9 31 C11 24 18 18 28 15 C33 22 39 27 43 31 V33 C39 37 33 42 28 49 C18 46 11 40 9 33 Z" fill="${C.grey}" stroke-width="1.6"/>` +
      `<ellipse cx="27" cy="25" rx="3" ry="2" fill="${C.greyL}" stroke="none"/><ellipse cx="34" cy="31" rx="2.5" ry="2" fill="${C.greyL}" stroke="none"/><ellipse cx="26" cy="39" rx="3" ry="2" fill="${C.greyL}" stroke="none"/><ellipse cx="20" cy="33" rx="2" ry="1.6" fill="${C.greyL}" stroke="none"/>` +
      K.line('M17 32 C26 31 35 31 46 32', 1.4, C.greyD) +
      `<path d="M15 26 C17 30 17 35 15 39" fill="none" stroke-width="1.6"/>` +
      `<circle cx="10" cy="26" r="2.6" fill="${C.white}" stroke-width="1.5"/><circle cx="14" cy="22" r="2.6" fill="${C.white}" stroke-width="1.5"/>` +
      K.dots([[9.6, 26], [13.6, 22]], 1.3) + K.line('M6.5 35 C8 38 11 38 13 37', 1.6) +
      K.hiE(24, 18, 6, 1.6, -25),
    // Eel: long S-shaped body, olive-brown back, yellow belly line, head left.
    eel: () => {
      const N = 40, pts = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N, x = 6 + 54 * t, y = 31 - 12 * Math.sin(t * Math.PI * 1.8 + 0.2) * (0.55 + 0.45 * t);
        pts.push([x, y, 8 * (1 - t * 0.8)]);
      }
      const nrm = pts.map((q, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [-dy / l, dx / l]; });
      const up = pts.map((q, i) => [q[0] + nrm[i][0] * -q[2], q[1] + nrm[i][1] * -q[2]]), dn = pts.map((q, i) => [q[0] + nrm[i][0] * q[2], q[1] + nrm[i][1] * q[2]]);
      const dn2 = pts.map((q, i) => [q[0] + nrm[i][0] * q[2] * 0.25, q[1] + nrm[i][1] * q[2] * 0.25]);
      const P = (a) => a.map((q) => `${r1(q[0])} ${r1(q[1])}`).join(' L');
      const head = pts[0];
      const body = `M${P(up)} L${P(dn.slice().reverse())} C${r1(head[0] - 5)} ${r1(head[1] + 6)} ${r1(head[0] - 5)} ${r1(head[1] - 6)} ${P([up[0]])} Z`;
      return `<path d="${body}" fill="${C.brown}" stroke="none"/>` +
        `<path d="M${P(dn2)} L${P(dn.slice().reverse())} Z" fill="${C.wheat}" stroke="none"/>` +
        `<path d="${body}" fill="none"/>` +
        `<path d="M12 ${r1(head[1] + 2)} C15 ${r1(head[1] + 1)} 18 ${r1(head[1] + 3)} 18 ${r1(head[1] + 6)} C15 ${r1(head[1] + 6)} 13 ${r1(head[1] + 5)} 12 ${r1(head[1] + 2)} Z" fill="${C.wheatD}" stroke-width="1.5"/>` +
        `<circle cx="5.5" cy="${r1(head[1] - 2.5)}" r="2" fill="${C.white}" stroke-width="1.4"/>` + K.dots([[5.3, head[1] - 2.5]], 1) +
        K.line(`M2 ${r1(head[1] + 1)} L6 ${r1(head[1] + 1.5)}`, 1.4) + K.hiE(22, r1(pts[13][1] - 3), 5, 1.3, -20);
    },
    // Squid: torpedo mantle with arrow fins at the rear (right), head and arms trailing left.
    squid: () => {
      const arms = ['M20 31 C14 28 10 26 6 22', 'M20 33 C13 32 8 31 3 30', 'M20 35 C14 36 9 38 6 42', 'M20 34 C15 40 12 46 9 50 M20 30 C16 24 13 18 10 13'];
      return `<path d="M50 27 L59 15 L61 30 Z M50 37 L59 49 L61 34 Z" fill="${C.pink}"/>` +
        arms.slice(0, 3).map((d) => K.line(d, 5.5) + K.line(d, 2.5, C.pinkL)).join('') +
        K.line(arms[3], 3.5) + K.line(arms[3], 1.2, C.pinkL) +
        `<ellipse cx="9" cy="50.5" rx="3" ry="2" fill="${C.pinkL}" stroke-width="1.6"/><ellipse cx="10" cy="12.5" rx="2" ry="3" fill="${C.pinkL}" stroke-width="1.6"/>` +
        `<path d="M24 23 C38 20 52 24 62 32 C52 40 38 44 24 41 C20 37 20 27 24 23 Z" fill="${C.pinkL}"/>` +
        K.dots([[33, 26], [40, 25], [46, 28], [36, 31], [43, 33], [50, 31], [32, 37], [39, 38], [47, 36]], 1.2, C.pinkD) +
        `<path d="M16 32 C16 26 20 25 25 26 V38 C20 39 16 38 16 32 Z" fill="${C.pinkL}"/>` +
        `<circle cx="20" cy="31" r="3" fill="${C.white}" stroke-width="1.5"/>` + K.dots([[19.6, 31]], 1.5) +
        K.hiE(36, 25.5, 8, 1.5, -5) + K.sh('M30 40.5 C40 41 50 38 58 34.5 C52 39 40 43 26 41 Z');
    },
    // Octopus: round head with eyes, eight curling arms below.
    octopus: () => {
      const arms = ['M18 34 C10 38 6 44 8 50 C9 53 13 53 13 50', 'M24 38 C20 44 18 50 21 55 C23 57 26 56 25 53', 'M32 39 C31 46 32 52 36 56 C38 57 40 55 38 53', 'M40 38 C45 44 48 49 47 54 C46 57 43 57 43 54', 'M46 34 C53 37 58 42 57 48 C56 51 53 51 53 48'];
      return K.shadow(24, 58) + arms.map((d) => K.line(d, 7.5) + K.line(d, 3.5, C.red)).join('') +
        `<path d="M14 30 C10 18 18 6 32 6 C46 6 54 18 50 30 C48 38 40 40 32 40 C24 40 16 38 14 30 Z" fill="${C.red}"/>` +
        K.sh('M46 12 C52 19 52 28 48 34 C44 38 38 39 33 39 C42 34 48 26 46 12 Z') +
        `<ellipse cx="25" cy="27" rx="3.5" ry="4" fill="${C.white}" stroke-width="1.6"/><ellipse cx="39" cy="27" rx="3.5" ry="4" fill="${C.white}" stroke-width="1.6"/>` +
        K.dots([[25, 28], [39, 28]], 1.8) + K.dots([[24, 34], [31, 35.5], [38, 34]], 1.2, C.redD) + K.hiE(23, 14, 6, 3);
    },
    // Shrimp: curled, segmented body, head left with spiked rostrum and long antennae, tail fan.
    shrimp: () => {
      const cx = 34, cy = 32, R = 22, a0 = 200, a1 = 432, rad = (d) => (d * Math.PI) / 180;
      const pt = (a, r) => [r1(cx + r * Math.cos(rad(a))), r1(cy + r * Math.sin(rad(a)))];
      const w = (a) => 13 - 7 * ((a - a0) / (a1 - a0));
      const outer = [], inner = [];
      for (let a = a0; a <= a1; a += 8) { outer.push(pt(a, R)); inner.push(pt(a, R - w(a))); }
      const body = `M${outer.map((q) => q.join(' ')).join(' L')} L${inner.reverse().map((q) => q.join(' ')).join(' L')} Z`;
      const end = pt(a1, R - 3), tg = [-Math.sin(rad(a1)), Math.cos(rad(a1))], nm = [Math.cos(rad(a1)), Math.sin(rad(a1))];
      const fan = (s) => `M${end[0]} ${end[1]} L${r1(end[0] + tg[0] * 11 + nm[0] * 6 * s)} ${r1(end[1] + tg[1] * 11 + nm[1] * 6 * s)} L${r1(end[0] + tg[0] * 12 - nm[0] * 1 * s)} ${r1(end[1] + tg[1] * 12 - nm[1] * 1 * s)} Z`;
      const segs = [252, 280, 308, 336, 364, 392].map((a) => { const p = pt(a, R), q = pt(a, R - w(a)); return `M${p[0]} ${p[1]} L${q[0]} ${q[1]}`; }).join(' ');
      const legs = [262, 290, 318].map((a) => { const q = pt(a, R - w(a) + 0.5), r = pt(a, R - w(a) - 6); return `M${q[0]} ${q[1]} L${r[0]} ${r[1]}`; }).join(' ');
      const h = pt(a0, R), hi = pt(a0, R - w(a0));
      return K.shadow(18, 58) +
        K.line('M13 26 C10 16 22 6 40 6 M13 27 C6 18 8 8 20 4', 1.5) +
        K.line(legs, 2, C.orangeD) +
        `<path d="${fan(1)} ${fan(-1)}" fill="${C.orange}" stroke-width="2"/>` +
        `<path d="${body}" fill="${C.orangeL}"/>` +
        K.line(segs, 1.5, C.orangeD) +
        `<path d="M${h[0]} ${h[1]} L3 ${r1(h[1] + 1)} L${hi[0]} ${hi[1]} Z" fill="${C.orange}" stroke-width="2"/>` +
        `<path d="M${h[0]} ${h[1]} C${r1(h[0] + 4)} ${r1(h[1] - 9)} ${pt(252, R).join(' ')} ${pt(252, R).join(' ')} L${pt(252, R - w(252)).join(' ')} C24 34 18 38 ${hi[0]} ${hi[1]} Z" fill="${C.orange}" stroke-width="2"/>` +
        `<circle cx="17" cy="25" r="2.4" fill="${C.black}" stroke-width="1.4"/>` +
        K.hiE(39, 13.5, 8, 1.6, 10);
    },
    // Crab: front view, wide shell, raised pincers, eyes on stalks, three legs each side.
    crab: () => {
      const legsL = ['M17 38 L8 41 L4 49', 'M18 43 L10 48 L8 56', 'M21 47 L15 53 L15 59'];
      const claw = `<path d="M20 31 L13 22" stroke-width="6"/><path d="M20 31 L13 22" stroke="${C.orange}" stroke-width="2.5"/>` +
        `<path d="M7 26 C2 20 3 10 10 8 C13 7 16 9 15 12 L11 14 L17 17 C18 22 14 28 7 26 Z" fill="${C.orange}"/>` + K.hiE(8, 14, 2.5, 1.3, -60);
      const side = legsL.map((d) => K.line(d, 6) + K.line(d, 2.5, C.orange)).join('') + claw +
        `<path d="M28 28 L26 21" stroke-width="2"/><circle cx="26" cy="20" r="2.6" fill="${C.white}" stroke-width="1.6"/>` + K.dots([[26, 20]], 1.3);
      return K.shadow(24, 59) + side + `<g transform="translate(64 0) scale(-1 1)">${side}</g>` +
        `<path d="M14 38 C14 30 22 26 32 26 C42 26 50 30 50 38 C50 45 42 49 32 49 C22 49 14 45 14 38 Z" fill="${C.orange}"/>` +
        K.sh('M44 30 C49 33 50 40 46 44 C42 48 36 49 30 49 C40 46 47 40 44 30 Z') +
        K.dots([[24, 33], [32, 31], [40, 33], [28, 38], [36, 38]], 1.3, C.orangeD) +
        K.line('M28 43 C30 45 34 45 36 43', 1.6) + K.hiE(22, 31, 5, 1.8, -20);
    },
    // Lobster: top view facing left, big claws forward, segmented tail and fan on the right.
    lobster: () => {
      const half = `<path d="M22 28 L15 21" stroke-width="5.5"/><path d="M22 28 L15 21" stroke="${C.red}" stroke-width="2"/>` +
        `<path d="M16 22 C10 25 3 22 3 16 C3 11 7 8 11 9 L9 13 L16 12 C18 14 18 19 16 22 Z" fill="${C.red}"/>` +
        K.line('M24 27 L22 22 M28 26 L27 21 M32 26 L32 21', 2) +
        K.line('M14 30 C8 26 9 14 14 5', 1.5);
      return K.shadow(26, 58) + half + `<g transform="translate(0 66) scale(1 -1)">${half}</g>` +
        `<path d="M50 33 L60 25 C62 30 62 36 60 41 Z" fill="${C.redD}"/>` +
        `<path d="M36 27 C42 27 48 29 52 30 V36 C48 37 42 39 36 39 Z" fill="${C.red}"/>` +
        K.line('M40 27.5 V38.5 M44 28.3 V37.7 M48 29.2 V36.8', 1.5, C.redD) +
        `<path d="M13 33 C13 27 20 25 28 25 C33 25 38 27 38 33 C38 39 33 41 28 41 C20 41 13 39 13 33 Z" fill="${C.red}"/>` +
        `<path d="M13 33 L7 33" stroke-width="2.5"/>` +
        K.line('M24 25.5 C26 29 26 37 24 40.5', 1.5, C.redD) +
        K.dots([[17, 30], [17, 36]], 1.6) + K.hiE(29, 28.5, 5, 1.6, -5) + K.sh('M14 36 C18 40 24 41 30 41 C34 41 37 39 38 35 C34 38 24 39 14 36 Z');
    },
    // Clams: two closed clam shells with growth ridges.
    clams: () => {
      const shell = (x, y, fill, ln) =>
        `<path d="M${x} ${y - 14} C${x + 6} ${y - 14} ${x + 15} ${y - 6} ${x + 15} ${y + 3} C${x + 15} ${y + 9} ${x + 8} ${y + 11} ${x} ${y + 11} C${x - 8} ${y + 11} ${x - 15} ${y + 9} ${x - 15} ${y + 3} C${x - 15} ${y - 6} ${x - 6} ${y - 14} ${x} ${y - 14} Z" fill="${fill}"/>` +
        K.line(`M${x - 12} ${y + 2} C${x - 10} ${y + 8} ${x + 10} ${y + 8} ${x + 12} ${y + 2} M${x - 9} ${y - 3} C${x - 7} ${y + 3} ${x + 7} ${y + 3} ${x + 9} ${y - 3} M${x - 5} ${y - 8} C${x - 3} ${y - 4} ${x + 3} ${y - 4} ${x + 5} ${y - 8}`, 1.4, ln) +
        K.hiE(x - 8, y - 4, 3.5, 1.6, -50);
      return K.shadow(26, 57) + shell(42, 30, C.greyL, C.greyD) + shell(23, 44, C.creamD, C.brown);
    },
    // Sea urchin: purple ball bristling with spines.
    sea_urchin: () => {
      let sp = '', sp2 = '';
      for (let a = 0; a < 360; a += 20) {
        const r = (a * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r), L = s > 0.3 ? 19 : 25;
        const d = `M${r1(32 + c * 12)} ${r1(37 + s * 12)} L${r1(32 + c * L)} ${r1(37 + s * L)}`;
        sp += K.line(d, 3.6) + K.line(d, 1.4, C.purpleL);
        const r2 = ((a + 10) * Math.PI) / 180, c2 = Math.cos(r2), s2 = Math.sin(r2);
        if (s2 < 0.3) { const d2 = `M${r1(32 + c2 * 11)} ${r1(37 + s2 * 11)} L${r1(32 + c2 * 20)} ${r1(37 + s2 * 20)}`; sp2 += K.line(d2, 3.4) + K.line(d2, 1.2, C.purpleL); }
      }
      return K.shadow(20, 58) + sp + `<circle cx="32" cy="37" r="14.5" fill="${C.purple}"/>` + sp2 +
        K.dots([[26, 40], [33, 43], [39, 39], [30, 35], [37, 33]], 1.4, C.purpleD) + K.hiE(26, 30, 4, 2);
    },
    // Mussels: dark blue-black shells; one open showing the orange meat.
    mussels: () => {
      const sh = 'M-21 0 C-14 -7 6 -11 16 -9 C23 -7 23 7 16 9 C6 11 -14 7 -21 0 Z';
      return K.shadow(24, 58) +
        `<g transform="translate(35 22) rotate(-18)"><path d="${sh}" fill="${C.black}"/>` + K.line('M-14 0 C-6 -4 6 -6 18 -4', 1.4, C.blueD) + K.line('M-10 4 C0 4 10 3 19 1', 1.2, C.blueD) + K.hiE(-4, -4, 7, 1.3, -10) + '</g>' +
        `<g transform="translate(30 44) rotate(-12)"><path d="${sh}" fill="${C.black}"/><path d="M-17 0 C-11 -5 6 -8 15 -6.5 C20 -5 20 5 15 6.5 C6 8 -11 5 -17 0 Z" fill="${C.blueL}" stroke-width="1.4"/>` +
        `<path d="M-13 0 C-8 -4 6 -6 13 -4.5 C17 -3 17 3 13 4.5 C6 6 -8 4 -13 0 Z" fill="${C.orange}" stroke-width="1.4"/>` + K.line('M-8 0 C-2 -2 6 -2 12 0', 1.2, C.orangeD) + '</g>';
    },
    // Oysters: open oyster on its rough half shell, pearly inside, grey-cream meat with a frilled edge.
    oysters: () => {
      const ruff = (cx, cy, rx, ry, amp, n) => { const p = []; for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2, k = 1 + amp * Math.sin(a * n); p.push(`${r1(cx + rx * k * Math.cos(a))} ${r1(cy + ry * k * Math.sin(a))}`); } return `M${p.join(' L')} Z`; };
      return K.shadow(27, 57) +
        `<path d="${ruff(32, 36, 28, 18, 0.06, 7)}" fill="${C.grey}"/>` +
        K.line('M8 40 C14 50 46 52 56 42', 1.4, C.greyD) +
        `<path d="${ruff(32, 34, 22, 12.5, 0.03, 9)}" fill="${C.white}" stroke-width="1.6"/>` +
        `<path d="${ruff(33, 34, 15, 8, 0.08, 10)}" fill="${C.creamD}" stroke-width="1.6"/>` +
        `<ellipse cx="34" cy="34" rx="8" ry="4.2" fill="${C.cream}" stroke="none"/>` +
        `<ellipse cx="39" cy="35" rx="3" ry="2.3" fill="${C.greyD}" stroke="none"/>` + K.hiE(22, 28, 4, 1.6, -20);
    },
    // Nori seaweed (fresh): thin, ruffled, dark purple-red blades.
    nori_seaweed: () => K.shadow(18, 58) +
      blade(32, 57, 10, 10, 18, 30, 9, 1.6, 7, C.purple) + blade(32, 57, 54, 12, 46, 32, 9, 1.6, 7, C.purple) +
      blade(32, 57, 30, 4, 34, 28, 10, 1.8, 8, C.purpleL) + `<ellipse cx="32" cy="56" rx="5" ry="2.5" fill="${C.purpleD}"/>`,
    // Kombu kelp (fresh): long, thick olive-brown straps on a stipe and holdfast.
    kombu_kelp: () => K.shadow(18, 58) +
      blade(30, 55, 8, 6, 30, 26, 6.5, 0.6, 4, C.brown, C.brownL) + blade(30, 55, 58, 8, 36, 24, 6.5, 0.6, 4, C.brownL, C.wheat) +
      `<path d="M24 58 C25 54 28 53 30 51 C32 53 35 54 36 58 Z" fill="${C.brownD}"/>`,
    // Wakame (fresh): bright green feathery frond with a central rib.
    wakame: () => K.shadow(16, 58) +
      blade(32, 57, 10, 14, 20, 34, 8, 2.8, 12, C.leafD) +
      blade(32, 57, 36, 4, 40, 30, 11, 3.2, 13, C.leaf, C.leafD),
  });
})(FSI);
