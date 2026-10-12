// UI icons for unlocking (padlocks, the Shop basket) and the farm journal newspaper.
(function (FSI) {
  const { C, K } = FSI;
  const P = (d, f, w) => `<path d="${d}" fill="${f}"${w ? ` stroke-width="${w}"` : ''}/>`;
  const O = (cx, cy, r, f, w) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${w ? ` stroke-width="${w}"` : ''}/>`;
  const R = (x, y, w, h, f, rx = 1, sw) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}"${sw ? ` stroke-width="${sw}"` : ''}/>`;
  const OL = (d, col, w = 4) => `<path d="${d}" fill="none" stroke-width="${w + 5}"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  const body = () =>
    R(11, 28, 42, 31, C.gold, 6) + K.sh('M47 30 C50 31 51 33 51 36 V52 C51 55 49 57 46 57 H40 C45 55 47 52 47 48 Z') +
    O(32, 40, 4.5, C.woodD, 2) + P('M30 43 L28.5 51 H35.5 L34 43 Z', C.woodD, 2) + K.hi('M15 31 H22 V35 H15 Z');
  // Speaker for the sound toggle.
  const speaker = () => P('M6 24 H18 L33 10 C35 8.5 37 9.5 37 12 V52 C37 54.5 35 55.5 33 54 L18 40 H6 C4.5 40 4 39 4 38 V26 C4 25 4.5 24 6 24 Z', C.steel) +
    K.sh('M33 12 C35 11 35 12 35 14 V50 C35 52 35 53 33 52 Z') + K.hi('M8 27 H15 V31 H8 Z');
  FSI.add('ui-unlocks', {
    ui_sound: () => speaker() + OL('M44 24 C48 28 48 36 44 40', C.white, 3.5) + OL('M50 17 C58 25 58 39 50 47', C.white, 3.5),
    ui_mute: () => speaker() + OL('M44 24 L58 40 M58 24 L44 40', C.red, 4),
    // Two beamed notes for the music volume.
    ui_music: () =>
      P('M23 15 L57 7 V18 L23 26 Z', C.purpleD) + P('M23 20 H28 V50 H23 Z M52 12 H57 V44 H52 Z', C.purpleD) +
      `<ellipse cx="17" cy="51" rx="10" ry="7.5" transform="rotate(-20 17 51)" fill="${C.purple}"/>` +
      `<ellipse cx="46" cy="45" rx="10" ry="7.5" transform="rotate(-20 46 45)" fill="${C.purple}"/>` +
      K.hiE(13.5, 48.5, 3, 1.6) + K.hiE(42.5, 42.5, 3, 1.6),
    ui_journal: () =>
      K.shadow(24, 59) +
      P('M14 10 H55 C57 10 58 11 58 13 V52 C58 55 56 57 53 57 H11 C8 57 6 55 6 52 V22 H14 Z', C.white) +
      P('M6 22 H14 V52 C14 55 12.5 57 10 57 C8 57 6 55 6 52 Z', C.greyL) +
      R(19, 15, 34, 7, C.red, 1.5, 2) +
      R(19, 27, 15, 12, C.blueL, 1.5, 2) + K.line('M21 37 L26 31 L29 34 L32 30', 1.4, C.leafD) +
      K.line('M38 28 H52 M38 33 H52 M38 38 H48 M19 44 H52 M19 49 H52 M19 54 H40', 1.8, C.greyD) +
      K.sh('M55 13 C57 13 58 14 58 16 V52 C58 55 56 57 53 57 H50 C53 56 55 54 55 51 Z'),
    // A blueprint sheet, rolled up on the left, with a grid and the outline of a farm building.
    ui_blueprint: () =>
      K.shadow(24, 59) +
      P('M14 10 H56 C57.5 10 58 10.5 58 12 V52 C58 53.5 57.5 54 56 54 H14 Z', C.blue) +
      K.line('M22 18 H54 M22 26 H54 M22 34 H54 M22 42 H54 M22 50 H54 M26 14 V52 M34 14 V52 M42 14 V52 M50 14 V52', 1.2, C.blueL) +
      `<path d="M24 46 V31 L36 22 L48 31 V46 Z M32 46 V37 H40 V46" fill="none" stroke="${C.white}" stroke-width="2.4"/>` +
      K.sh('M54 12 H58 V52 H54 Z') +
      P('M6 14 C6 10 9 8 12 8 C15 8 18 10 18 14 V54 C18 58 15 60 12 60 C9 60 6 58 6 54 Z', C.blueL) +
      `<ellipse cx="12" cy="14" rx="4" ry="3" fill="${C.blueD}" stroke-width="1.5"/>` + K.hi('M8.5 20 H10.5 V40 H8.5 Z'),
    // Three town houses with lit windows, the tallest in the middle.
    ui_town: () =>
      K.shadow(26, 59) +
      R(5, 26, 17, 31, C.terracotta, 1.5) + P('M3.5 27 L13.5 16 L23.5 27 Z', C.redD) +
      R(42, 30, 17, 27, C.blueL, 1.5) + P('M40.5 31 L50.5 21 L60.5 31 Z', C.blueD) +
      R(20, 12, 24, 45, C.cream, 1.5) + P('M18 13 H46 V9 H18 Z', C.woodD) +
      R(24, 17, 6, 7, C.yellowL, 1, 1.5) + R(34, 17, 6, 7, C.yellowL, 1, 1.5) + R(24, 29, 6, 7, C.yellowL, 1, 1.5) + R(34, 29, 6, 7, C.yellow, 1, 1.5) +
      R(27, 43, 10, 14, C.woodD, 1.5) + R(9, 32, 9, 7, C.yellowL, 1, 1.5) + R(46, 36, 9, 7, C.yellow, 1, 1.5) +
      K.sh('M40 14 H44 V57 H40 Z') + K.hi('M22 14 H26 V40 H22 Z'),
    // Fork and knife crossed over a plate.
    ui_restaurant: () =>
      K.shadow(22, 59) + O(32, 33, 24, C.white) + O(32, 33, 16, C.greyL, 1.5) + K.hiE(22, 22, 6, 3) +
      P('M16 10 C15 18 16 22 20 24 L42 55 C43 57 46 56 45.5 54 L24 22 C25 17 22 13 16 10 Z', C.steel) +
      P('M49 9 L48 21 C48 23 46 25 44 25 L22 55 C21 57 18 56 18.5 54 L41 23 C39 22 39 20 39 18 L40 9 H42 L41.5 18 H43 L44 9 H45.5 L45 18 H46.5 L47 9 Z', C.steel),
    ui_lock: () => OL('M20 29 V20 C20 5 44 5 44 20 V29', C.steel, 5) + body(),
    ui_unlock: () => OL('M44 29 V18 C44 5 21 5 21 17 V21', C.steel, 5) + body(),
    ui_shop: () =>
      OL('M11 30 C11 3 53 3 53 30', C.woodD, 4) +
      P('M27 26 L42 10 C44 8 47 10 45 13 L33 28 Z', C.wheatD) + K.line('M37 15 L40 18 M33 19.5 L36 22.5', 1.4, C.brownD) +
      O(22, 25, 7, C.red) + K.line('M22 18 C22 16 23 15 25 14', 1.8, C.brownD) + K.hiE(19.5, 22.5, 2.4, 1.4) +
      P('M5 28 H59 L53 56 C52.5 58 51 59 49 59 H15 C13 59 11.5 58 11 56 Z', C.woodL) +
      K.line('M9 37 H55 M11 46 H53 M20 29 L22 58 M32 29 V58 M44 29 L42 58', 1.6, C.woodD) +
      K.sh('M53 29 H58 L52.5 56 C52 58 51 58.5 49 58.5 Z') + R(3, 26, 58, 6, C.wood, 2.5),
  });
})(FSI);
