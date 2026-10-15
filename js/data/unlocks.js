// Progression: which buildings and production recipes the player can use.
// Guided first steps (FS.STEPS) unlock for free as tutorial goals are completed. After that, five stages of three cuisines
// each (FS.STAGES): a cuisine is opened for a little money, every dish belongs to exactly one cuisine, and the next stage
// opens once every cuisine of the current one has reached the stage's cook target.
// A step or cuisine lists target items. Unlocking walks each target's supply chain (best recipe per item),
// reusing anything already unlocked, so every listed item can really be made from scratch.
(function (FS) {
  // Guided first steps of the first stage. goal: the goal id that unlocks the step (null = from the start).
  // only: items whose own recipe unlocks without its inputs' chains (those come from stock or imports for now).
  FS.STEPS = [
    { id: 'start', goal: null, name: 'Your first farm',
      items: ['water', 'wheat', 'potato', 'lettuce', 'tomato', 'cucumber', 'oats', 'wheat_flour', 'rolled_oats'] },
    // Bottom-up: the bread goal comes after its salt and yeast, which come after the first dish.
    { id: 'pantry', goal: 'dish1', name: 'Salt & fields',
      desc: 'Salt from the sea and more crops for your fields.',
      items: ['hay', 'barley', 'corn', 'carrot', 'onion', 'leek', 'celery', 'chives', 'cabbage', 'strawberry', 'apple', 'pear',
        'whole_wheat_flour', 'salt'] },
    { id: 'yeast', goal: 'salt', name: 'Sugar & yeast',
      desc: 'Sugar from beet, and yeast grown on its molasses.',
      items: ['white_sugar', 'yeast', 'brown_sugar'] },
    { id: 'bakery', goal: 'yeast', name: 'Bakery',
      desc: 'Bake bread from your own flour, water, yeast and salt.',
      items: ['bread_loaf'] },
    { id: 'farmyard', goal: 'bread', name: 'Farmyard',
      desc: 'Keep hens and mix their feed from milling leftovers.',
      items: ['animal_feed', 'chicken_egg'] },
    { id: 'dairy', goal: 'animals', name: 'Dairy & bees',
      desc: 'Dairy cows, butter and cream, honey from bees.',
      items: ['cow_milk', 'cream', 'butter', 'yogurt', 'honey'] },
    { id: 'garden', goal: 'feed', name: 'Kitchen garden',
      desc: 'Herbs and root vegetables, an oil press, a spice mill and a prep kitchen for stocks.',
      items: ['parsnip', 'beetroot', 'rosemary', 'parsley', 'garlic', 'spinach', 'olive_oil', 'lemon_juice', 'hazelnuts', 'vegetable_stock', 'chili_flakes', 'ground_cinnamon'] },
    { id: 'butcher', goal: 'butter', name: 'Butcher & cheesemaker',
      desc: 'Pigs and ham, butchery and curing, and cheddar from your own milk: the last things Farmhouse Kitchen needs.',
      items: ['cheddar', 'ham', 'whole_chicken', 'chicken_breast', 'beef_steak', 'pork_chop', 'bacon'] },
  ];

  // Stages of three cuisines. cost: money to open each cuisine of the stage. target: dishes to cook in each cuisine.
  // signature: each cuisine's Chef's Challenge dishes (one per cuisine in the first stage, one more each stage after), kept
  // secret until every cuisine of the stage has reached the target; each must then be freshly made (stage E: served
  // at a restaurant rated `rating` stars or better) to complete the cuisine.
  // toques: earned when a cuisine reaches the target; gold: earned when every dish of a cuisine has been cooked.
  // teaser / hint: shown for the next stage while it is still locked (its cuisines show only as silhouettes).
  // unlock: the feature that finishing the stage opens (Wholesaler, Academy, Blueprints, Restaurants).
  // A cuisine's item is its icon. steps: open from the start, its buildings unlock with the guided first steps.
  FS.STAGES = [
    { id: 'A', teaser: 'Eggs, bread and cheese from your first fields and barns.', name: 'Farm to Table', cost: 1000, target: 5, toques: 2, gold: 4, unlock: 'wholesaler',
      cuisines: [
        { steps: true, name: 'Farmhouse Kitchen', signature: ['Ham & Cheese Sandwich'], hint: 'Simple food straight from the farm.', item: 'omelette', desc: 'Eggs, potatoes, bread, vegetables and milk straight from the first farm.',
          dishes: ['Boiled Eggs', 'Scrambled Eggs', 'Omelette', 'Garden Salad', 'Baked Potato', 'Mashed Potatoes', 'Buttered Toast',
            'Ham & Cheese Sandwich', 'Grilled Cheese Sandwich', 'Vegetable Soup', 'Roasted Vegetables', 'Fruit Salad', 'Porridge'] },
        { name: 'Swiss Alpine', signature: ['Cheese Fondue'], hint: 'Melted cheese high up in the mountains.', item: 'cheese_fondue', desc: 'Cheese, potatoes, barley and mountain herbs.',
          dishes: ['Rösti', 'Cheese Fondue', 'Raclette', 'Älplermagronen', 'Käsespätzle', 'Bircher Muesli', 'Bündner Gerstensuppe',
            'Capuns', 'Zürcher Geschnetzeltes', 'Lovage Potato Soup', 'Spelt Waffles', 'Anisbrötli'] },
        { name: 'Nordic & Dutch', signature: ['Swedish Meatballs'], hint: 'Rye, herring and cinnamon from the cold north.', item: 'kanelbullar', desc: 'Rye, dairy, herring and salmon from the cold north.',
          dishes: ['Swedish Meatballs', 'Gravlax', 'Kanelbullar', 'Smørrebrød', 'Æbleskiver', "Jansson's Temptation",
            'Pickled Herring on Rye', 'Karelian Pies', 'Norwegian Fish Soup', 'Stamppot', 'Gouda & Apple Sandwich'] },
    ] },
    { id: 'B', teaser: 'Word of your cooking spreads to the great kitchens of Europe.', name: 'European Classics', cost: 2500, target: 8, toques: 3, gold: 6, unlock: 'academy',
      cuisines: [
        { name: 'British & Irish', signature: ['Full English Breakfast', "Shepherd's Pie"], hint: 'Roasts and puddings from a rainy island.', item: 'fish_and_chips', desc: 'Roasts, pies, puddings and the tea table.',
          dishes: ['Full English Breakfast', 'Fish and Chips', 'Roast Chicken', 'Roast Beef & Yorkshire Pudding',
            'Roast Leg of Lamb', 'Lamb Chops with Mint Sauce', 'Cottage Pie', "Shepherd's Pie", 'Cornish Pasty', 'Bangers and Mash',
            'Irish Stew', 'Scotch Broth', 'Cullen Skink', 'Kedgeree', 'Welsh Rarebit', 'Potted Shrimp', 'Sardines on Toast',
            'Watercress Soup', 'Brussels Sprouts with Bacon', 'Marmalade Toast', 'Scones with Jam & Cream', 'Victoria Sponge',
            'Trifle', 'Apple Pie', 'Sticky Toffee Pudding', 'Rhubarb Crumble', 'Apple & Blackberry Crumble', 'Cup of Tea',
            'Elderflower Cordial'] },
        { name: 'French & Belgian', signature: ['Coq au Vin', 'French Onion Soup'], hint: 'Bistros, crêpes and a great deal of butter.', item: 'croque_monsieur', desc: 'Bistro classics, galettes, gratins and crêpes.',
          dishes: ['Steak Frites', 'French Onion Soup', 'Coq au Vin', 'Cassoulet', 'Ratatouille', 'Quiche Lorraine', 'Tarte Flambée',
            'Croque Monsieur', 'Galette Complète', 'Salade Niçoise', 'Moules Marinières', 'Gratin Dauphinois', 'Celeriac Rémoulade',
            'Asparagus with Hollandaise', 'Chanterelles on Toast', 'Tarte Tatin', 'Madeleines', 'Far Breton', 'Crêpes',
            'Hazelnut Crêpes', 'Waffles'] },
        { name: 'German, Austrian & Hungarian', signature: ['Bratwurst with Sauerkraut', 'Apple Strudel'], hint: 'Sausages, paprika and Christmas markets.', item: 'soft_pretzels', desc: 'Schnitzel, sausages, paprika stews, strudel and Christmas baking.',
          dishes: ['Wiener Schnitzel', 'Bratwurst with Sauerkraut', 'Soft Pretzels', 'Tafelspitz', 'Roast Goose with Red Cabbage',
            'Rabbit Stew', 'Hungarian Goulash', 'Chicken Paprikash', 'Lángos', 'Czech Christmas Carp', 'Styrian Pumpkin Soup',
            'Apple Strudel', 'Linzer Torte', 'Kaiserschmarrn', 'Mohnkuchen', 'Thumbprint Cookies', 'Mulled Wine'] },
    ] },
    { id: 'C', teaser: 'Warm seas, olive groves and far-off ports beckon.', name: 'Mediterranean & Beyond', cost: 4000, target: 12, toques: 4, gold: 8, unlock: 'blueprints',
      cuisines: [
        { name: 'Italian', signature: ['Lasagna alla Bolognese', 'Arancini', 'Pizza Prosciutto e Funghi'], hint: 'Pasta and pizza from a boot-shaped land.', item: 'dried_spaghetti', desc: 'Pasta, pizza, risotto, cured ham and espresso.',
          dishes: ['Pizza Margherita', 'Pizza Marinara', 'Pizza Quattro Formaggi', 'Pizza Prosciutto e Funghi', 'Pepperoni Pizza',
            'Spaghetti Carbonara', 'Tagliatelle al Ragù', 'Lasagna alla Bolognese', 'Spaghetti Aglio e Olio', 'Cacio e Pepe',
            "Penne all'Arrabbiata", 'Penne alla Vodka', 'Fettuccine Alfredo', 'Trofie al Pesto', 'Spaghetti alle Vongole',
            'Wild Garlic Spaghetti', 'Spinach & Ricotta Ravioli', 'Gnocchi al Pomodoro', 'Polenta e Funghi', 'Arancini',
            'Saltimbocca alla Romana', 'Eggplant Parmigiana', 'Minestrone', 'Caprese Salad', 'Bruschetta', 'Focaccia',
            'Antipasto Platter', 'Prosciutto e Melone', 'Persimmon & Burrata Salad', 'Stuffed Artichokes', 'Panna Cotta', 'Affogato',
            'Espresso', 'Cappuccino'] },
        { name: 'Mediterranean & Middle Eastern', signature: ['Vegetable Couscous', 'Paella Valenciana', 'Souvlaki with Tzatziki'], hint: 'Olive oil, sunshine and spice bazaars.', item: 'paella_valenciana', desc: 'Spain, Portugal, Greece, Turkey, the Levant and Morocco.',
          dishes: ['Paella Valenciana', 'Seafood Paella', 'Gazpacho', 'Tortilla Española', 'Patatas Bravas', 'Gambas al Ajillo',
            'Pulpo a la Gallega', 'Calamares Fritos', 'Fabada Asturiana', 'Bacalhau à Brás', 'Pan con Tomate',
            'Jamón & Manchego Board', 'Churros con Chocolate', 'Crema Catalana', 'Sangria', 'Greek Salad', 'Moussaka', 'Spanakopita',
            'Souvlaki with Tzatziki', 'Halloumi Salad', 'Hummus', 'Falafel', 'Tabbouleh', 'Fattoush', 'Baba Ganoush', 'Shakshuka',
            'Chicken Shawarma', 'Kofta Kebab', 'Lahmacun', "Manakish Za'atar", 'Mujaddara', 'Ful Medames', 'Sabich', 'Menemen',
            'Vegetable Couscous', 'Turkish Delight', 'Moroccan Mint Tea', 'Citrus Salad'] },
        { name: 'Around the World', signature: ['Bobotie', 'Beef Stroganoff', 'Misir Wot'], hint: 'Dumplings, grills and stews from the far corners of the map.', item: 'plov', desc: 'Eastern Europe and the Caucasus, Africa, Australia and New Zealand.',
          // Also everything no dish needs directly, so opening every cuisine unlocks every recipe.
          items: ['sorghum', 'millet', 'kohlrabi', 'flaxseed', 'blackcurrant', 'elderberry', 'water_buffalo_milk', 'rock_salt', 'date_syrup',
            'dried_figs', 'dried_mango', 'blackcurrant_jam', 'lemon_marmalade', 'carrot_juice', 'corn_oil', 'soybean_oil', 'walnut_oil',
            'flaxseed_oil', 'dried_mint', 'lacto_fermented_hot_sauce'],
          dishes: ['Pierogi', 'Borscht', 'Beef Stroganoff', 'Chicken Kiev', 'Pelmeni', 'Gołąbki', 'Bigos', 'Syrniki',
            'Olivier Salad', 'Okroshka', 'Ćevapi', 'Khachapuri', 'Plov', 'Jollof Rice', 'Suya', 'Yam Pottage',
            'Fufu with Light Soup', 'Kelewele', 'Maafe', 'Misir Wot', 'Bobotie', 'Chakalaka', 'Shakshouka Tunisienne',
            'Aussie Meat Pie', 'Grilled Barramundi', 'Anzac Biscuits', 'Pavlova', 'Hokey Pokey Ice Cream'] },
    ] },
    { id: 'D', teaser: 'Ships bring rice, chillies and maize from across the oceans.', name: 'Asia & the Americas', cost: 6000, target: 21, toques: 5, gold: 10, unlock: 'finedining',
      cuisines: [
        { name: 'East Asian', signature: ['Shoyu Ramen', 'Hot and Sour Soup', 'Char Siu', 'Kimchi Fried Rice'], hint: 'Noodles, soy and rice from the Far East.', item: 'shoyu_ramen', desc: 'China, Japan and Korea: rice, soy, miso, noodles, tofu and kimchi.',
          dishes: ['Egg Fried Rice', 'Kung Pao Chicken', 'Mapo Tofu', 'Sweet and Sour Pork', 'Char Siu', 'Twice-Cooked Pork',
            'Beef with Broccoli', 'Chicken Chow Mein', 'Dan Dan Noodles', 'Jiaozi', 'Wonton Soup', 'Hot and Sour Soup',
            'Spring Rolls', 'Congee', 'Egg Tarts', 'Garlic Snow Peas', 'Lychee Sorbet', 'Pot of Green Tea', 'Miso Soup', 'Onigiri',
            'Tuna Maki', 'California Roll', 'Teriyaki Salmon', 'Tonkatsu', 'Chicken Katsu Curry', 'Gyoza', 'Yakitori', 'Oyakodon',
            'Gyudon', 'Shoyu Ramen', 'Kake Udon', 'Zaru Soba', 'Okonomiyaki', 'Takoyaki', 'Natto Gohan', 'Daifuku Mochi',
            'Matcha Latte', 'Bibimbap', 'Kimchi Jjigae', 'Kimchi Fried Rice', 'Korean Fried Chicken', 'Tteokbokki', 'Japchae',
            'Haemul Pajeon'] },
        { name: 'South & Southeast Asian', signature: ['Butter Chicken', 'Tandoori Chicken', 'Bánh Mì', 'Massaman Curry'], hint: 'Curries, coconut and fragrant spices.', item: 'butter_chicken', desc: 'India, Nepal, Sri Lanka, Thailand, Vietnam, Malaysia, Indonesia and the Philippines: spice blends, coconut, lentils and fish sauce.',
          dishes: ['Butter Chicken', 'Chicken Tikka Masala', 'Tandoori Chicken', 'Paneer Tikka', 'Palak Paneer', 'Saag Aloo',
            'Aloo Gobi', 'Dal Tadka', 'Chana Masala', 'Rajma Chawal', 'Chole Bhature', 'Lamb Rogan Josh', 'Pork Vindaloo',
            'Goan Fish Curry', 'Machher Jhol', 'Masala Dosa', 'Idli with Sambar', 'Appam with Vegetable Stew', 'Pav Bhaji',
            'Samosas', 'Onion Pakora', 'Garlic Naan', 'Momos', 'Chickpea Coconut Curry', 'Kheer', 'Gulab Jamun', 'Jalebi',
            'Mango Lassi', 'Masala Chai', 'Pad Thai', 'Thai Green Curry', 'Thai Red Curry with Shrimp', 'Massaman Curry',
            'Tom Yum Goong', 'Tom Kha Gai', 'Som Tam', 'Cashew Chicken', 'Mango Sticky Rice', 'Phở Bò', 'Bánh Mì', 'Gỏi Cuốn',
            'Chicken Satay', 'Nasi Goreng', 'Tempeh Buddha Bowl', 'Hainanese Chicken Rice', 'Chicken Adobo', 'Sinigang', 'Lumpia',
            'Taro Coconut Dessert'] },
        { name: 'The Americas', signature: ['BBQ Pulled Pork', 'Cheeseburger', 'Jambalaya', 'Tamales'], hint: 'Maize, beans and chillies from the New World.', item: 'tacos_al_pastor', desc: 'North America, Mexico, South America and the Caribbean: corn, beans, chillies, barbecue and cacao.',
          dishes: ['Cheeseburger', 'Hot Dog', 'Mac and Cheese', 'BBQ Pulled Pork', 'Buffalo Wings', 'Southern Fried Chicken',
            'Cornbread', 'Gumbo', 'Jambalaya', "Hoppin' John", 'Chili con Carne', 'New England Clam Chowder', 'Lobster Roll',
            'Maryland Crab Cakes', 'Reuben Sandwich', 'Pastrami on Rye', 'Club Sandwich', 'BLT Sandwich', 'Eggs Benedict',
            'Smoked Salmon Bagel', 'Peanut Butter & Jelly', 'Deviled Eggs', 'Caesar Salad', 'Cobb Salad', 'Kale & Quinoa Salad',
            'Butternut Squash Soup', 'Roast Turkey with Cranberry', 'Poutine', 'Butter Tarts', 'Poke Bowl', 'Avocado Toast',
            'Corn on the Cob', 'Pancakes', 'Maple Pecan Pancakes', 'French Toast', 'Overnight Oats', 'Smoothie',
            'New York Cheesecake', 'Pecan Pie', 'Pumpkin Pie', 'Key Lime Pie', 'Brownies', 'Chocolate Chip Cookies',
            'White Chocolate Macadamia Cookies', 'Banana Bread', 'Banana Split', "S'mores", 'Strawberry Milkshake', 'Lemonade',
            'Iced Coffee', 'Oat Milk Latte', 'Bloody Mary', 'Tacos al Pastor', 'Fish Tacos', 'Guacamole', 'Nachos', 'Quesadillas',
            'Chicken Enchiladas', 'Beef Burrito', 'Chilaquiles', 'Tamales', 'Pozole Rojo', 'Chiles Rellenos', 'Elote',
            'Tres Leches Cake', 'Hot Chocolate', 'Ceviche', 'Causa Limeña', 'Lomo Saltado', 'Arepas Reina Pepiada', 'Empanadas',
            'Asado with Chimichurri', 'Churrasco', 'Alfajores', 'Pão de Queijo', 'Brigadeiros', 'Moqueca', 'Jerk Chicken',
            'Rice and Peas', 'Ackee and Saltfish', 'Doubles', 'Fried Plantains', 'Mojito', 'Piña Colada'] },
    ] },
    // Stage E is the end game: a cuisine reaches its target once `target` of its dishes are on the menus of restaurants
    // rated at least `rating` stars (see Restaurants in js/game.js), not by cooking alone.
    { id: 'E', teaser: 'The finest tables in the world are waiting for you.', name: 'Grand Cuisine', cost: 8000, target: 3, rating: 4, toques: 6, gold: 12, unlock: null,
      cuisines: [
        { name: 'Haute Cuisine', signature: ['Beef Wellington', 'Steak Tartare', 'Boeuf Bourguignon', 'Risotto alla Milanese', "Duck à l'Orange"], hint: 'White tablecloths and silver cloches.', item: 'beef_wellington', desc: 'Classic fine dining from Paris, Lyon and northern Italy: truffles, morels, classic butter sauces, saffron, aged beef.',
          dishes: ['Steak au Poivre', 'Truffle Omelette', 'Porcini Risotto', 'Risotto alla Milanese', 'Chicken with Morel Cream',
            'Vitello Tonnato', 'Steak Béarnaise', 'Halibut with Beurre Blanc', 'Steak Tartare', 'Bouillabaisse', 'Beef Wellington',
            'Sole Meunière', "Duck à l'Orange", 'Baked Brie en Croûte', 'Beef Carpaccio', 'Boeuf Bourguignon', 'Oysters Mignonette',
            'Cheese Soufflé', 'Trout Amandine', 'Osso Buco', 'Quail Egg Canapés', 'Blini with Salmon Roe', 'Duck Confit'] },
        { name: 'Pâtisserie & Chocolaterie', signature: ['Black Forest Cake', 'Éclairs', 'Macarons', 'Mille-feuille', 'Tiramisu'], hint: 'Sugar, butter and the long road to chocolate.', item: 'black_forest_cake', desc: 'Laminated doughs, choux, sugar work and the full cocoa chain: the longest chains in the game.',
          dishes: ['Black Forest Cake', 'Lamingtons', 'Sachertorte', 'Tiramisu', 'Panforte', 'Crêpes Suzette', 'Pain au Chocolat',
            'Chocolate Mousse', 'Cannoli', 'Christmas Stollen', 'Éclairs', 'Profiteroles', 'Macarons', 'Crème Brûlée', 'Baklava',
            'Mille-feuille', 'Engadiner Nusstorte', 'Croissants', 'Pastel de Nata', 'Paris-Brest', 'Mont Blanc', 'Tarte au Citron',
            'Peach Melba', 'Nougat Montélimar'] },
        { name: 'Grand Banquets', signature: ['Peking Duck', 'Mole Poblano', 'Laksa', 'Chicken Biryani', 'Doro Wat'], hint: 'Feasts fit for emperors.', item: 'peking_duck', desc: 'Feast and court dishes from around the world: imperial China, Japanese kaiseki and sushi counters, Mughal and Persian courts, Mexico, Brazil and Ethiopia.',
          dishes: ['Bulgogi', 'Persian Jeweled Rice', 'Chicken Biryani', 'Nigiri Sushi', 'Malai Kofta', 'Peking Duck', 'Tempura',
            'Laksa', 'Doro Wat', 'Nihari', 'Lamb Tagine with Apricots', 'Mole Poblano', 'Unadon', 'Sashimi Platter', 'Uni Don',
            'Beef Rendang', 'Mooncakes', 'Shabu-shabu', 'Steamed Fish with Ginger', 'Feijoada', 'Tonkotsu Ramen', 'Fesenjan',
            'Xiaolongbao'] },
    ] },
  ];

  // FS.ABOUT, the short text about each dish, lives in about.js.

  // Flat list of cuisines; each dish's cuisine is set from here, so dishes.js groups are only where a row is written.
  FS.CUISINES = [];
  FS.cuisines = {};
  for (const st of FS.STAGES) for (const c of st.cuisines) {
    c.id = FS.slug(c.name);
    c.stage = st.id;
    c.dishIds = c.dishes.map((n) => {
      const id = FS.slug(n);
      if (!FS.items[id] || !FS.items[id].dish) throw new Error(`Cuisine ${c.name}: unknown dish ${n}`);
      FS.items[id].cuisine = c.name;
      if (FS.ABOUT[n]) FS.items[id].about = FS.ABOUT[n];
      return id;
    });
    c.sigIds = (c.signature || []).map((n) => {
      const id = FS.slug(n);
      if (!c.dishIds.includes(id)) throw new Error(`Cuisine ${c.name}: signature dish ${n} is not one of its dishes`);
      return id;
    });
    FS.cuisines[c.name] = c.dishIds.length;
    FS.CUISINES.push(c);
  }
  FS.cuisineById = Object.fromEntries(FS.CUISINES.map((c) => [c.id, c]));
  FS.cuisineOf = (dishId) => FS.cuisineById[FS.slug(FS.items[dishId].cuisine)];

  const dishInputs = {};
  for (const r of FS.recipes) if (r.dish) dishInputs[r.primary] = Object.keys(r.inputs);
  FS.dishItems = (dishIds) => dishIds.flatMap((id) => dishInputs[id]);

  // Returns { recipes: Set of recipe ids, items: Set of producible item ids, buildings: Set of building ids }.
  FS.computeUnlocks = function (stepIds, cuisineIds) {
    const recipes = new Set(), items = new Set();
    const unlock = (r) => { if (recipes.has(r.id)) return; recipes.add(r.id); for (const o in r.outputs) items.add(o); };
    const walk = (id, stack) => {
      if (items.has(id) || stack.has(id)) return;
      // Prefer a recipe that only needs what is already unlocked (feed from barley and bran, not soy).
      const ready = FS.byOutput[id].find((x) => !x.dish && x.primary === id && Object.keys(x.inputs).length && Object.keys(x.inputs).every((i) => items.has(i)));
      if (ready) return unlock(ready);
      const r = FS.items[id].bestRecipe;
      if (!r) return;
      stack.add(id);
      for (const i in r.inputs) walk(i, stack);
      stack.delete(id);
      unlock(r);
    };
    const apply = (u) => {
      for (const id of u.items || []) walk(id, new Set());
      for (const id of u.only || []) unlock(FS.items[id].bestRecipe);
      for (const id of FS.dishItems(u.dishIds || [])) walk(id, new Set());
    };
    for (const s of FS.STEPS) if (stepIds.includes(s.id)) apply(s);
    // Cuisines opened from the start (steps) get their buildings from the guided steps instead.
    for (const c of FS.CUISINES) if (cuisineIds.includes(c.id) && !c.steps) apply(c);
    // Other recipes for an item you can already make unlock once all their inputs are available too
    // (animal feed from barley and wheat bran, for example).
    for (let pass = 0, changed = true; changed && pass < 6; pass++) {
      changed = false;
      for (const r of FS.recipes) {
        if (r.dish || recipes.has(r.id) || !items.has(r.primary)) continue;
        if (Object.keys(r.inputs).every((i) => items.has(i))) { unlock(r); changed = true; }
      }
    }
    const buildings = new Set(['kitchen']);
    for (const id of recipes) buildings.add(FS.recipeById[id].building);
    return { recipes, items, buildings };
  };
})(typeof window !== 'undefined' ? window.FS : globalThis.FS);
