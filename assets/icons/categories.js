// Ingredient group icons (cat_<category> for every key of FS.catInfo), used in the Codex and Test Kitchen filters
// and group headings. Each is a coloured disc holding two typical members of the group, so a group reads as
// "a family of things" and never looks like a single item.
(function (FSI) {
  const { C, K } = FSI;
  // back = smaller item, upper right; front = larger item, lower left.
  const pair = (bg, back, front) => () =>
    `<circle cx="32" cy="32" r="28.5" fill="${bg}"/>` + K.hiE(20, 15, 8, 3.5) +
    K.ref(back, 40, 25, 0.5) + K.ref(front, 27, 37.5, 0.62);
  FSI.add('categories', {
    cat_grain: pair(C.wheatL, 'corn', 'wheat'),
    cat_vegetable: pair(C.leafL, 'tomato', 'cabbage'),
    cat_root: pair(C.orangeL, 'potato', 'carrot'),
    cat_fruit: pair(C.redL, 'pear', 'apple'),
    cat_berry: pair(C.pinkL, 'blueberry', 'strawberry'),
    cat_citrus: pair(C.yellowL, 'lemon', 'orange'),
    cat_tropical: pair(C.tealL, 'pineapple', 'banana'),
    cat_legume: pair(C.leafL, 'chickpeas', 'peas'),
    cat_oilseed: pair(C.yellowL, 'sesame_seeds', 'sunflower_seeds'),
    cat_nut: pair(C.brownL, 'almonds', 'walnuts'),
    cat_herb: pair(C.leafL, 'rosemary', 'basil'),
    cat_spice: pair(C.orangeL, 'star_anise', 'chili_pepper'),
    cat_mushroom: pair(C.creamD, 'porcini', 'button_mushrooms'),
    cat_feed: pair(C.wheatL, 'animal_feed', 'hay'),
    cat_livestock: pair(C.leafL, 'pig', 'cattle'),
    cat_dairy: pair(C.blueL, 'butter', 'cow_milk'),
    cat_cheese: pair(C.yellowL, 'brie', 'cheddar'),
    cat_egg: pair(C.creamD, 'quail_egg', 'chicken_egg'),
    cat_meat: pair(C.pinkL, 'pork_chop', 'beef_steak'),
    cat_charcuterie: pair(C.meatL, 'ham', 'salami'),
    cat_seafood: pair(C.blueL, 'shrimp', 'cod'),
    cat_mineral: pair(C.greyL, 'water', 'salt'),
    cat_flour: pair(C.creamD, 'rolled_oats', 'wheat_flour'),
    cat_bread: pair(C.wheatL, 'baguette', 'bread_loaf'),
    cat_pasta: pair(C.yellowL, 'penne', 'dried_spaghetti'),
    cat_oil: pair(C.leafL, 'sunflower_oil', 'olive_oil'),
    cat_sugar: pair(C.pinkL, 'white_sugar', 'honey'),
    cat_ferment: pair(C.redL, 'miso', 'kimchi'),
    cat_drink: pair(C.purpleL, 'beer', 'red_wine'),
    cat_sauce: pair(C.orangeL, 'soy_sauce', 'ketchup'),
    cat_preserve: pair(C.redL, 'canned_tomatoes', 'strawberry_jam'),
    cat_spiceblend: pair(C.wheatL, 'herbes_de_provence', 'curry_powder'),
    cat_cocoa: pair(C.brownL, 'roasted_coffee_beans', 'dark_chocolate'),
    cat_pastry: pair(C.pinkL, 'meringue', 'macarons'),
    cat_dish: pair(C.tealL, 'croissants', 'pizza_margherita'),
  });
})(FSI);
