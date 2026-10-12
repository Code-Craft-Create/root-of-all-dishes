// Building types. shelf: sub-heading in the build menu (defaults to group). place: 'land' (grass/sand), 'shore' (next to water), 'rock' (next to rock), 'forest' (next to forest).
(function (FS) {
  const B = FS.building;
  // --- Farming -----------------------------------------------------------
  B('field', { name: 'Field', group: 'Farming', size: [1, 1], cost: 50, upkeep: 0.3, color: '#8b6a3e', icon: '🌱',
    desc: 'Grows annual crops: grains, vegetables, legumes, herbs. Seed cost is paid each cycle.' });
  B('orchard', { name: 'Orchard', group: 'Farming', size: [1, 1], cost: 150, upkeep: 0.2, color: '#5d8a3a', icon: '🌳',
    desc: 'Fruit trees, nut trees, berry bushes and vines. Slow, but valuable.' });
  B('greenhouse', { name: 'Tropical Greenhouse', short: 'Hothouse', group: 'Farming', size: [2, 2], cost: 700, upkeep: 1, color: '#9fd3c7', icon: '🏝️',
    desc: 'Heated glasshouse for tropical crops: cocoa, coffee, vanilla, spices, bananas. In reality these are imported from the tropics.' });
  B('mushroom', { name: 'Mushroom Cellar', short: 'Mushroom', group: 'Farming', size: [1, 1], cost: 200, upkeep: 0.5, color: '#6b5a4a', icon: '🍄',
    desc: 'Dark, humid cellar for cultivated mushrooms.' });
  B('forager', { name: "Forager's Lodge", short: 'Forager', group: 'Farming', size: [1, 1], cost: 180, upkeep: 0.5, color: '#4c6b3c', icon: '🛖', place: 'forest',
    desc: 'Gathers wild foods from the forest: truffles, porcini, maple sap, berries. Must be next to forest.' });
  // --- Animals -----------------------------------------------------------
  B('pasture', { name: 'Pasture & Barn', short: 'Pasture', group: 'Animals', size: [3, 2], cost: 600, upkeep: 2, color: '#a7c76a', icon: '🐄',
    desc: 'Cattle, sheep, goats and water buffalo. Grazing animals eat hay.' });
  B('pigsty', { name: 'Pigsty', group: 'Animals', size: [2, 2], cost: 400, upkeep: 1.5, color: '#d9a49b', icon: '🐖',
    desc: 'Raises pigs on animal feed.' });
  B('coop', { name: 'Poultry House', short: 'Poultry', group: 'Animals', size: [2, 1], cost: 250, upkeep: 1, color: '#e6cf8f', icon: '🐔',
    desc: 'Chickens, ducks, turkeys, geese, quail and rabbits.' });
  B('apiary', { name: 'Apiary', group: 'Animals', size: [1, 1], cost: 200, upkeep: 0.3, color: '#f0c040', icon: '🐝',
    desc: 'Beehives. Bees need flowers: honey is produced from nectar.' });
  B('fishfarm', { name: 'Aquaculture Pens', short: 'Fish Pens', group: 'Animals', size: [2, 2], cost: 700, upkeep: 2, color: '#4a8fb0', icon: '🐟', place: 'shore',
    desc: 'Farmed fish and shellfish. Carnivorous fish like salmon eat fish meal made from wild fish.' });
  // --- Resources ---------------------------------------------------------
  B('well', { name: 'Well', group: 'Resources', size: [1, 1], cost: 60, upkeep: 0, color: '#7fa7c9', icon: '💧',
    desc: 'Draws fresh water. Almost every recipe needs it.' });
  B('saltpan', { name: 'Salt Pans', group: 'Resources', size: [2, 2], cost: 350, upkeep: 0.5, color: '#e8e4da', icon: '🧂', place: 'shore',
    desc: 'Evaporates seawater in the sun to harvest salt. Must touch water.' });
  B('quarry', { name: 'Quarry & Mine', short: 'Quarry', group: 'Resources', size: [2, 2], cost: 350, upkeep: 0.5, color: '#9a948a', icon: '⛏️', place: 'rock',
    desc: 'Mines rock salt, limestone and trona. Must touch rocky ground.' });
  B('dock', { name: 'Fishing Dock', short: 'Dock', group: 'Resources', size: [1, 1], cost: 300, upkeep: 1, color: '#7b5b3a', icon: '🎣', place: 'shore',
    desc: 'Boats catch wild fish, shellfish and seaweed. Must touch water.' });
  // --- Processing --------------------------------------------------------
  B('mill', { name: 'Mill', group: 'Processing', shelf: 'Mills & Refining', cost: 400, color: '#c9a66b', icon: '🏭', desc: 'Mills grains into flour, polishes rice, makes starches.' });
  B('feedmill', { name: 'Feed Mill', group: 'Processing', shelf: 'Mills & Refining', cost: 300, color: '#b59a5a', icon: '🌾', desc: 'Mixes compound animal feed. Most of the world’s soy and maize ends up here.' });
  B('press', { name: 'Press House', short: 'Press', group: 'Processing', shelf: 'Mills & Refining', cost: 450, color: '#c7b14a', icon: '🫒', desc: 'Presses oils and juices; makes plant milks and tofu.' });
  B('dairy', { name: 'Creamery', group: 'Processing', shelf: 'Dairy, Meat & Fish', cost: 550, color: '#f2efe6', icon: '🧀', desc: 'Separates cream, churns butter, makes yogurt and cheese.' });
  B('butcher', { name: 'Butchery', group: 'Processing', shelf: 'Dairy, Meat & Fish', cost: 500, color: '#c0605a', icon: '🔪', desc: 'Breaks animals down into cuts, fat and bones.' });
  B('smokehouse', { name: 'Smokehouse & Curing', short: 'Smokery', group: 'Processing', shelf: 'Dairy, Meat & Fish', cost: 500, color: '#7a4a3a', icon: '🥓', desc: 'Cures, dries and smokes meat and fish.' });
  B('fishery', { name: 'Fish Processing', short: 'Fish Prep', group: 'Processing', shelf: 'Dairy, Meat & Fish', cost: 450, color: '#6aa5c0', icon: '🐠', desc: 'Fillets fish, peels shrimp, salts and cans seafood.' });
  B('spice', { name: 'Spice Mill', group: 'Processing', shelf: 'Mills & Refining', cost: 400, color: '#c96a3a', icon: '🌶️', desc: 'Dries, cures, grinds and blends spices and herbs.' });
  B('sugar', { name: 'Sugar Refinery', short: 'Sugar', group: 'Processing', shelf: 'Mills & Refining', cost: 600, color: '#e8dcc8', icon: '🍬', desc: 'Refines cane and beet into sugars and syrups.' });
  B('roastery', { name: 'Roastery', group: 'Processing', shelf: 'Pantry & Drinks', cost: 650, color: '#6b4630', icon: '☕', desc: 'Ferments, roasts and grinds cocoa, coffee, tea and nuts. Makes chocolate.' });
  B('brewery', { name: 'Brewery & Winery', short: 'Brewery', group: 'Processing', shelf: 'Pantry & Drinks', cost: 700, color: '#8a3a5a', icon: '🍷', desc: 'Malts, brews, ferments wine and distills spirits.' });
  B('fermentery', { name: 'Fermentation Cellar', short: 'Ferments', group: 'Processing', shelf: 'Pantry & Drinks', cost: 550, color: '#7a6a3a', icon: '🫙', desc: 'Yeast, koji, soy sauce, miso, vinegars, pickles and kimchi.' });
  B('preserves', { name: 'Preserves & Cannery', short: 'Cannery', group: 'Processing', shelf: 'Pantry & Drinks', cost: 450, color: '#d9604a', icon: '🥫', desc: 'Jams, dried fruit, tomato products and other preserves.' });
  B('sauce', { name: 'Sauce & Prep Kitchen', short: 'Sauces', group: 'Processing', shelf: 'Pantry & Drinks', cost: 500, color: '#d98a3a', icon: '🥣', desc: 'Stocks, mother sauces, pastes and prepared bases.' });
  B('pasta', { name: 'Pasta & Noodle Workshop', short: 'Pasta', group: 'Processing', shelf: 'Bakery & Pasta', cost: 450, color: '#e8c86a', icon: '🍜', desc: 'Pasta, noodles, tortillas and wrappers.' });
  B('bakery', { name: 'Bakery', group: 'Processing', shelf: 'Bakery & Pasta', cost: 500, color: '#d9a35a', icon: '🥖', desc: 'Breads, doughs and pastry bases.' });
  B('patisserie', { name: 'Pâtisserie', group: 'Processing', shelf: 'Bakery & Pasta', cost: 600, color: '#f0a8c0', icon: '🧁', desc: 'Creams, custards, sponges and confectionery.' });
  B('minerals', { name: 'Mineral Works', short: 'Minerals', group: 'Processing', shelf: 'Mills & Refining', cost: 500, color: '#a0a8b0', icon: '⚗️', desc: 'Refines salt, makes baking soda, baking powder, slaked lime and lye.' });
  // --- Cooking -----------------------------------------------------------
  B('kitchen', { name: 'Kitchen', group: 'Cooking', cost: 800, upkeep: 2, color: '#f5f0e0', icon: '👩‍🍳',
    desc: 'Cooks dishes you have discovered. Discover new dishes in the Test Kitchen.' });
  B('academy', { name: 'Culinary Academy', short: 'Academy', group: 'Cooking', size: [2, 2], cost: 3000, upkeep: 3, color: '#a9bcdc', icon: '🎓',
    desc: 'Chefs you hire with toques work out undiscovered dishes, one ingredient at a time. They reveal recipes, they never cook them. You can have one.' });
  B('farmhouse', { name: 'Farmhouse', group: 'Hidden', size: [2, 2], cost: 0, upkeep: 0, color: '#c96b4a', icon: '🏡',
    desc: 'Your headquarters and central warehouse. Everything you produce is stored here.' });
})(FS);
