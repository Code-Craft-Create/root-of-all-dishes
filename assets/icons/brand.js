// Game logo for Root of All Dishes: the globe served on a plate between a fork and a knife (top-bar brand and favicon).
(function (FSI) {
  const { C, K } = FSI;
  FSI.add('brand', {
    ui_logo: () =>
      // fork (left) and knife (right)
      `<path d="M3 9 V19 C3 23.5 4.5 25.5 6 25.5 C7.5 25.5 9 23.5 9 19 V9" fill="${C.steel}"/>` +
      K.line('M6 9 V20', 1.5) +
      `<rect x="4.3" y="25" width="3.4" height="30" rx="1.7" fill="${C.wood}" stroke-width="2"/>` +
      `<path d="M56 8 C60 11 61.5 20 60.5 29 H56 Z" fill="${C.steel}"/>` +
      `<rect x="56" y="28" width="4" height="27" rx="2" fill="${C.wood}" stroke-width="2"/>` +
      // plate
      `<circle cx="32" cy="32" r="22" fill="${C.white}"/>` +
      `<circle cx="32" cy="32" r="18.5" fill="none" stroke="${C.greyL}" stroke-width="1.5"/>` +
      // globe
      `<circle cx="32" cy="32" r="15" fill="${C.blue}"/>` +
      `<path d="M24 22 C27 20.5 29.5 22 28.5 25 C27.5 27.5 24 27.5 24.5 31 C25 34 28 36 26.5 39.5 C25.5 42 23 41.5 22.5 39 C21.5 36 20 33.5 20.5 29.5 C21 26 21.5 23.5 24 22 Z" fill="${C.leaf}" stroke-width="1.5"/>` +
      `<path d="M36 20.5 C39.5 20 42.5 22.5 43 25.5 C42 27.5 39.5 27 38.5 29.5 C37.5 32 40.5 33.5 40.5 37 C40.5 40.5 37.5 42.5 35.5 41.5 C35 38.5 34 36 34.5 33 C33.5 30.5 34 27.5 35.5 26 C34.5 24 34.5 22 36 20.5 Z" fill="${C.leaf}" stroke-width="1.5"/>` +
      K.sh('M42 22 C47 28 47 38 41 44 C37 47 31 47.5 27 46 C35 46 42 41 44 33 C45 29 44 25 42 22 Z') +
      K.hiE(25.5, 24, 4.5, 2.6),
  });
})(window.FSI);
