// Cuisine icons (cz_<slug of the cuisine name>), used for undiscovered dishes in the Codex "Used in" list.
// Same coloured disc as the ingredient group icons, holding one signature dish; most reuse the item of their
// cuisine card in the Cuisines window.
(function (FSI) {
  const { C, K } = FSI;
  const one = (bg, item) => () =>
    `<circle cx="32" cy="32" r="28.5" fill="${bg}"/>` + K.hiE(20, 15, 8, 3.5) + K.ref(item, 32, 33, 0.74);
  FSI.add('cuisines', {
    cz_everyday_basics: one(C.wheatL, 'pancakes'),
    cz_british_irish: one(C.blueL, 'fish_and_chips'),
    cz_french: one(C.blueL, 'baguette'),
    cz_italian: one(C.leafL, 'dried_spaghetti'),
    cz_spanish_portuguese: one(C.yellowL, 'paella_valenciana'),
    cz_greek_middle_eastern: one(C.tealL, 'hummus'),
    cz_indian_south_asian: one(C.orangeL, 'curry_powder'),
    cz_chinese: one(C.redL, 'jiaozi'),
    cz_japanese: one(C.pinkL, 'nigiri_sushi'),
    cz_korean: one(C.blueL, 'bibimbap'),
    cz_southeast_asian: one(C.leafL, 'pad_thai'),
    cz_mexican_latin_american: one(C.orangeL, 'tacos_al_pastor'),
    cz_north_american: one(C.redL, 'cheeseburger'),
    cz_central_northern_european: one(C.creamD, 'dark_chocolate'),
    cz_african: one(C.yellowL, 'injera'),
    cz_drinks: one(C.brownL, 'cappuccino'),
    cz_seasonal_regional_classics: one(C.orangeL, 'pumpkin'),
    cz_around_the_world: one(C.tealL, 'plov'),
    // The five stages' cuisines (the ones above are kept for older lists and the icon sheet).
    cz_farmhouse_kitchen: one(C.wheatL, 'omelette'),
    cz_swiss_alpine: one(C.redL, 'cheese_fondue'),
    cz_nordic_dutch: one(C.blueL, 'kanelbullar'),
    cz_french_belgian: one(C.blueL, 'croque_monsieur'),
    cz_german_austrian_hungarian: one(C.yellowL, 'soft_pretzels'),
    cz_mediterranean_middle_eastern: one(C.yellowL, 'paella_valenciana'),
    cz_east_asian: one(C.redL, 'shoyu_ramen'),
    cz_south_southeast_asian: one(C.orangeL, 'butter_chicken'),
    cz_the_americas: one(C.orangeL, 'tacos_al_pastor'),
    cz_haute_cuisine: one(C.creamD, 'beef_wellington'),
    cz_patisserie_chocolaterie: one(C.pinkL, 'black_forest_cake'),
    cz_grand_banquets: one(C.tealL, 'peking_duck'),
  });
})(FSI);
