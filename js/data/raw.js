// Raw ingredients: crops, wild foods, animals, fish and minerals.
// Row format: [name, growTime(s), yield, value, emoji, category, origin, fact]
(function (FS) {
  const S = FS.source;

  // ===================== FIELD CROPS =====================
  S('field', 'grain', [
    ['Wheat', 60, 8, 2, '🌾', 0, 'Fertile Crescent, ~9600 BCE', 'Wheat covers more land than any other food crop on Earth.'],
    ['Durum Wheat', 65, 7, 2.5, '🌾', 0, 'Fertile Crescent', 'A hard wheat with high protein: the only wheat allowed in Italian dried pasta.'],
    ['Spelt', 65, 7, 2.5, '🌾', 0, 'Southern Caucasus / Central Europe'],
    ['Rye', 60, 8, 2, '🌾', 0, 'Anatolia', 'Rye tolerates cold, poor soils, which is why rye bread dominates Northern and Eastern Europe.'],
    ['Barley', 55, 8, 2, '🌾', 0, 'Fertile Crescent', 'About a third of barley is malted for beer and whisky; most of the rest feeds animals.'],
    ['Oats', 55, 8, 2, '🌾', 0, 'Northern Europe'],
    ['Corn', 70, 8, 2, '🌽', 0, 'Mexico, ~7000 BCE', 'Maize was bred by Indigenous Mexicans from a wild grass called teosinte with tiny, hard kernels.'],
    ['Paddy Rice', 80, 8, 2.5, '🌾', 0, 'Yangtze Valley, China', 'Rice feeds more than half of humanity. "Paddy" is rice still in its inedible husk.'],
    ['Glutinous Rice', 85, 7, 3, '🍙', 0, 'Southeast Asia'],
    ['Sorghum', 60, 8, 2, '🌾', 0, 'Sahel, Africa'],
    ['Millet', 50, 8, 2, '🌾', 0, 'China & West Africa'],
    ['Buckwheat', 45, 6, 3, '🌾', 0, 'Yunnan, China', 'Not wheat at all: buckwheat is a relative of rhubarb and sorrel.'],
    ['Quinoa', 70, 6, 4, '🌾', 0, 'Andes (Lake Titicaca)'],
    ['Teff', 70, 6, 4, '🌾', 0, 'Ethiopian Highlands', 'Teff seeds are so tiny that 150 of them weigh as much as one wheat kernel.'],
    ['Hay', 35, 12, 0.8, '🌿', 'feed', 'Worldwide', 'A dairy cow eats roughly 25 kg of hay or silage per day.'],
  ]);
  S('field', 'root', [
    ['Potato', 55, 10, 1.5, '🥔', 0, 'Andes, Peru', 'There are over 4,000 native potato varieties in the Andes.'],
    ['Sweet Potato', 60, 8, 2, '🍠', 0, 'Central America'],
    ['Cassava', 90, 10, 1.5, '🥔', 0, 'Brazil', 'Raw cassava contains cyanide compounds; it must be peeled, soaked and cooked to be safe.'],
    ['Yam', 90, 8, 2, '🍠', 0, 'West Africa'],
    ['Taro', 80, 8, 2, '🥔', 0, 'Southeast Asia'],
    ['Carrot', 45, 10, 1.2, '🥕', 0, 'Persia (originally purple)', 'Orange carrots became popular in the 17th-century Netherlands.'],
    ['Beetroot', 45, 9, 1.4, '🟣', 0, 'Mediterranean'],
    ['Sugar Beet', 70, 10, 1.2, '🟣', 0, 'Germany, 1747', 'Developed after a chemist found the same sugar as in cane inside beets. Today ~20% of world sugar comes from beet.'],
    ['Parsnip', 55, 8, 1.6, '🥕', 0, 'Eurasia'],
    ['Turnip', 40, 9, 1.2, '🥔', 0, 'Europe'],
    ['Radish', 25, 10, 1, '🥔', 0, 'Southeast Asia'],
    ['Daikon', 45, 8, 1.4, '🥕', 0, 'East Asia'],
    ['Horseradish', 60, 4, 3, '🥕', 0, 'Southeastern Europe'],
    ['Celeriac', 60, 6, 2, '🥔', 0, 'Mediterranean'],
  ]);
  S('field', 'vegetable', [
    ['Onion', 50, 10, 1.2, '🧅', 0, 'Central Asia'],
    ['Red Onion', 50, 9, 1.4, '🧅', 0, 'Central Asia'],
    ['Shallot', 50, 8, 2, '🧅', 0, 'Central Asia'],
    ['Garlic', 60, 8, 2.5, '🧄', 0, 'Central Asia'],
    ['Leek', 55, 6, 2, '🥬', 0, 'Eastern Mediterranean'],
    ['Scallion', 30, 8, 1.5, '🥬', 0, 'China'],
    ['Celery', 50, 6, 1.8, '🥬', 0, 'Mediterranean'],
    ['Fennel', 50, 6, 2, '🥬', 0, 'Mediterranean'],
    ['Asparagus', 90, 5, 4, '🥬', 0, 'Eastern Mediterranean'],
    ['Rhubarb', 70, 6, 2, '🥬', 0, 'Siberia & China'],
    ['Kohlrabi', 40, 6, 1.6, '🥬', 0, 'Northern Europe'],
    ['Cabbage', 50, 6, 1.5, '🥬', 0, 'Europe'],
    ['Red Cabbage', 55, 6, 1.7, '🥬', 0, 'Europe'],
    ['Napa Cabbage', 45, 6, 1.7, '🥬', 0, 'Beijing, China'],
    ['Kale', 40, 7, 1.8, '🥬', 0, 'Mediterranean'],
    ['Spinach', 30, 8, 1.5, '🥬', 0, 'Persia'],
    ['Lettuce', 30, 8, 1.2, '🥬', 0, 'Egypt'],
    ['Romaine Lettuce', 35, 7, 1.5, '🥬', 0, 'Greek island of Kos'],
    ['Arugula', 25, 8, 2, '🥬', 0, 'Mediterranean'],
    ['Swiss Chard', 35, 7, 1.5, '🥬', 0, 'Sicily'],
    ['Bok Choy', 30, 7, 1.5, '🥬', 0, 'China'],
    ['Watercress', 30, 6, 2.2, '🥬', 0, 'Europe'],
    ['Broccoli', 50, 6, 2, '🥦', 0, 'Italy'],
    ['Cauliflower', 55, 5, 2.4, '🥦', 0, 'Mediterranean'],
    ['Brussels Sprouts', 70, 6, 2.4, '🥬', 0, 'Belgium'],
    ['Tomato', 55, 9, 1.6, '🍅', 0, 'Andes; domesticated in Mexico', 'Europeans long thought tomatoes were poisonous; they only entered Italian cooking in the late 1600s.'],
    ['Cherry Tomato', 50, 8, 2, '🍅', 0, 'Andes'],
    ['Bell Pepper', 60, 7, 2, '🫑', 0, 'Mexico'],
    ['Chili Pepper', 60, 8, 2.5, '🌶️', 0, 'Mexico', 'Chili reached Asia only in the 1500s via Portuguese traders. Thai and Sichuan food had no chili before that.'],
    ['Jalapeño', 55, 8, 2.2, '🌶️', 0, 'Xalapa, Mexico'],
    ['Poblano Pepper', 60, 7, 2.4, '🫑', 0, 'Puebla, Mexico'],
    ['Paprika Pepper', 65, 7, 2.2, '🌶️', 0, 'Mexico; perfected in Hungary & Spain'],
    ['Eggplant', 60, 6, 2, '🍆', 0, 'India'],
    ['Zucchini', 45, 7, 1.6, '🥒', 0, 'Americas; bred in Italy'],
    ['Cucumber', 45, 8, 1.4, '🥒', 0, 'India'],
    ['Pumpkin', 80, 4, 4, '🎃', 0, 'North America'],
    ['Butternut Squash', 75, 4, 4, '🎃', 0, 'Massachusetts, USA'],
    ['Okra', 55, 7, 2.2, '🫛', 0, 'Ethiopia / West Africa'],
    ['Artichoke', 80, 4, 4, '🥬', 0, 'Mediterranean'],
    ['Tomatillo', 55, 7, 2, '🍏', 0, 'Mexico'],
    ['Wasabi', 140, 2, 18, '🌱', 0, 'Mountain streams of Japan', 'Real wasabi takes 18 months to grow; most "wasabi" outside Japan is dyed horseradish.'],
  ]);
  S('field', 'legume', [
    ['Green Beans', 45, 8, 1.6, '🫛', 0, 'Central America'],
    ['Peas', 40, 8, 1.6, '🫛', 0, 'Mediterranean'],
    ['Snow Peas', 40, 7, 2, '🫛', 0, 'Mediterranean'],
    ['Broad Beans', 55, 7, 1.8, '🫛', 0, 'Middle East'],
    ['Chickpeas', 60, 7, 2, '🫘', 0, 'Southeastern Turkey'],
    ['Lentils', 55, 7, 2, '🫘', 0, 'Fertile Crescent'],
    ['Red Lentils', 55, 7, 2, '🫘', 0, 'Fertile Crescent'],
    ['Black Beans', 60, 7, 2, '🫘', 0, 'Central America'],
    ['Kidney Beans', 60, 7, 2, '🫘', 0, 'Peru'],
    ['White Beans', 60, 7, 2, '🫘', 0, 'Central & South America'],
    ['Pinto Beans', 60, 7, 2, '🫘', 0, 'Mexico'],
    ['Soybeans', 70, 8, 2, '🫘', 0, 'Northeast China', 'About 77% of the world’s soy is fed to livestock; only ~7% is eaten directly as tofu, soy milk and similar.'],
    ['Mung Beans', 50, 7, 2, '🫘', 0, 'India'],
    ['Adzuki Beans', 60, 7, 2.4, '🫘', 0, 'East Asia'],
    ['Black Gram', 60, 7, 2.2, '🫘', 0, 'India'],
    ['Black-eyed Peas', 55, 7, 2, '🫘', 0, 'West Africa'],
    ['Peanuts', 75, 8, 2.4, '🥜', 0, 'South America', 'Peanuts are legumes, not nuts: the pods ripen underground.'],
  ]);
  S('field', 'oilseed', [
    ['Sunflower Seeds', 70, 8, 2, '🌻', 0, 'North America'],
    ['Rapeseed', 65, 8, 2, '🌼', 0, 'Mediterranean; canola bred in Canada'],
    ['Flaxseed', 60, 7, 2.2, '🌾', 0, 'Fertile Crescent'],
    ['Sesame Seeds', 70, 6, 3, '🌾', 0, 'India', 'One of the oldest oilseed crops: grown in the Indus Valley 5,000 years ago.'],
    ['Poppy Seeds', 60, 5, 3.5, '🌺', 0, 'Mediterranean'],
    ['Mustard Seeds', 50, 6, 2.5, '🌼', 0, 'Himalayas'],
    ['Hops', 80, 5, 4, '🍃', 'herb', 'Central Europe', 'Hops add bitterness and preserve beer; they were adopted by German brewers around 800 CE.'],
  ]);
  S('field', 'herb', [
    ['Basil', 30, 6, 2.5, '🌿', 0, 'India'],
    ['Thai Basil', 30, 6, 2.6, '🌿', 0, 'Southeast Asia'],
    ['Parsley', 30, 7, 2, '🌿', 0, 'Mediterranean'],
    ['Cilantro', 25, 7, 2, '🌿', 0, 'Mediterranean & Middle East'],
    ['Dill', 30, 6, 2.2, '🌿', 0, 'Eastern Mediterranean'],
    ['Mint', 30, 7, 2, '🌿', 0, 'Mediterranean'],
    ['Chives', 25, 7, 2, '🌿', 0, 'Europe & Asia'],
    ['Rosemary', 45, 5, 3, '🌿', 0, 'Mediterranean'],
    ['Thyme', 40, 5, 3, '🌿', 0, 'Mediterranean'],
    ['Oregano', 40, 5, 3, '🌿', 0, 'Mediterranean'],
    ['Sage', 40, 5, 3, '🌿', 0, 'Mediterranean'],
    ['Tarragon', 40, 5, 3.2, '🌿', 0, 'Siberia'],
    ['Marjoram', 40, 5, 3, '🌿', 0, 'Cyprus & Turkey'],
    ['Lavender', 50, 5, 3, '🪻', 0, 'Mediterranean'],
    ['Shiso', 30, 6, 3, '🌿', 0, 'East Asia'],
    ['Lovage', 40, 5, 3, '🌿', 0, 'Eastern Mediterranean'],
  ]);
  S('field', 'spice', [
    ['Saffron Crocus Flowers', 90, 30, 0.6, '🌸', 0, 'Iran (90% of world supply)', 'Each crocus flower gives only 3 threads; about 150,000 flowers make one kilogram of saffron.'],
    ['Cumin Seeds', 55, 5, 4, '🌾', 0, 'Eastern Mediterranean & India'],
    ['Coriander Seeds', 50, 6, 3, '🌾', 0, 'Mediterranean (the seed of cilantro)'],
    ['Fennel Seeds', 55, 5, 3.4, '🌾', 0, 'Mediterranean'],
    ['Caraway Seeds', 60, 5, 3.4, '🌾', 0, 'Western Asia & Europe'],
    ['Fenugreek Seeds', 50, 5, 3.4, '🌾', 0, 'Mediterranean & India'],
    ['Anise Seeds', 55, 5, 3.6, '🌾', 0, 'Eastern Mediterranean'],
  ]);
  S('field', 'berry', [
    ['Strawberry', 50, 8, 2.5, '🍓', 0, 'Brittany, France (a cross of Chilean and Virginian berries)'],
    ['Watermelon', 75, 3, 5, '🍉', 'fruit', 'Northeast Africa'],
    ['Melon', 70, 4, 4, '🍈', 'fruit', 'Persia'],
  ]);

  // ===================== ORCHARDS, BUSHES, VINES =====================
  S('orchard', 'fruit', [
    ['Apple', 150, 14, 1.8, '🍎', 0, 'Tian Shan mountains, Kazakhstan', 'Every apple tree grown from seed is genetically unique; named varieties are all grafted clones.'],
    ['Pear', 150, 12, 2, '🍐', 0, 'Western China'],
    ['Quince', 170, 10, 2.4, '🍐', 0, 'Caucasus'],
    ['Cherry', 140, 14, 2.4, '🍒', 0, 'Anatolia'],
    ['Sour Cherry', 140, 14, 2.4, '🍒', 0, 'Caucasus'],
    ['Plum', 140, 14, 1.8, '🍑', 0, 'Caucasus & China'],
    ['Peach', 150, 12, 2.2, '🍑', 0, 'Zhejiang, China'],
    ['Apricot', 150, 12, 2.2, '🍑', 0, 'Central Asia & China'],
    ['Fig', 160, 12, 2.4, '🫐', 0, 'Middle East'],
    ['Grapes', 150, 14, 2, '🍇', 0, 'Caucasus'],
    ['Wine Grapes', 150, 16, 1.8, '🍇', 0, 'Georgia, ~6000 BCE', 'The oldest evidence of winemaking comes from 8,000-year-old clay jars in Georgia.'],
    ['Pomegranate', 170, 10, 2.6, '🍎', 0, 'Iran'],
    ['Persimmon', 160, 10, 2.4, '🍅', 0, 'China'],
    ['Kiwi', 150, 12, 2.2, '🥝', 0, 'Yangtze Valley, China (not New Zealand)'],
    ['Olives', 180, 16, 1.6, '🫒', 0, 'Eastern Mediterranean', 'Fresh olives are inedibly bitter; they must be cured in brine, salt or lye first.'],
  ]);
  S('orchard', 'citrus', [
    ['Lemon', 160, 12, 2, '🍋', 0, 'Assam & Burma'],
    ['Lime', 160, 12, 2, '🍋', 0, 'Southeast Asia'],
    ['Orange', 160, 12, 2, '🍊', 0, 'Southern China', 'Brazil and the USA grow most of the world’s orange juice; oranges came to the Americas with Columbus.'],
    ['Mandarin', 150, 12, 2, '🍊', 0, 'Southern China'],
    ['Grapefruit', 170, 10, 2.4, '🍊', 0, 'Barbados (an accidental hybrid, 1700s)'],
  ]);
  S('orchard', 'berry', [
    ['Raspberry', 110, 10, 2.8, '🫐', 0, 'Eurasia'],
    ['Blackberry', 110, 10, 2.6, '🫐', 0, 'Eurasia'],
    ['Blueberry', 120, 10, 3, '🫐', 0, 'North America'],
    ['Redcurrant', 110, 10, 2.6, '🫐', 0, 'Western Europe'],
    ['Blackcurrant', 110, 10, 2.6, '🫐', 0, 'Northern Europe'],
    ['Cranberry', 130, 10, 2.6, '🫐', 0, 'North America (grown in flooded bogs)'],
    ['Elderberry', 120, 10, 2.2, '🫐', 0, 'Europe'],
  ]);
  S('orchard', 'nut', [
    ['Almonds', 200, 8, 5, '🌰', 0, 'Iran & Central Asia', 'California grows ~80% of the world’s almonds, and pollinating them needs most of the USA’s commercial beehives.'],
    ['Walnuts', 220, 8, 5, '🌰', 0, 'Persia'],
    ['Hazelnuts', 200, 8, 5, '🌰', 0, 'Black Sea coast, Turkey (70% of world supply)'],
    ['Chestnuts', 220, 8, 4, '🌰', 0, 'Southern Europe & Asia Minor'],
    ['Pistachios', 240, 6, 8, '🌰', 0, 'Iran & Central Asia'],
    ['Pecans', 230, 8, 6, '🌰', 0, 'Mississippi Valley, USA'],
    ['Pine Nuts', 260, 5, 10, '🌰', 0, 'Mediterranean stone pine', 'Pine cones take up to three years to mature, which is why pine nuts are so expensive.'],
  ]);
  S('orchard', 'spice', [
    ['Bay Leaves', 160, 8, 2.5, '🍃', 0, 'Mediterranean (laurel tree)'],
    ['Sumac Berries', 160, 8, 3, '🔴', 0, 'Middle East & Sicily'],
    ['Sichuan Peppercorns', 180, 6, 6, '🌶️', 0, 'Sichuan, China (prickly ash; not a pepper)', 'Sichuan pepper causes a tingling numbness called "má" thanks to the molecule hydroxy-alpha-sanshool.'],
  ]);

  // ===================== TROPICAL GREENHOUSE =====================
  S('greenhouse', 'tropical', [
    ['Sugarcane', 120, 16, 1.2, '🎋', 0, 'New Guinea', 'Cane sugar drove the Atlantic slave trade: most enslaved Africans were taken to work on sugar plantations.'],
    ['Banana', 130, 12, 1.8, '🍌', 0, 'Papua New Guinea', 'Nearly all export bananas are one clone, the Cavendish, so a single disease can threaten the whole crop.'],
    ['Plantain', 130, 10, 2, '🍌', 0, 'Southeast Asia'],
    ['Ackee', 140, 8, 3.5, '🍈', 0, 'West Africa; Jamaica’s national fruit', 'Ackee is poisonous until its pods split open on the tree by themselves; only the creamy arils are eaten.'],
    ['Pineapple', 150, 6, 4, '🍍', 0, 'Paraguay & Brazil'],
    ['Mango', 160, 10, 3, '🥭', 0, 'India & Myanmar'],
    ['Papaya', 130, 8, 3, '🥭', 0, 'Southern Mexico'],
    ['Avocado', 180, 8, 4.5, '🥑', 0, 'South-central Mexico', 'One avocado needs on average ~70 litres of water to grow.'],
    ['Coconut', 200, 6, 5, '🥥', 0, 'Indo-Pacific'],
    ['Dates', 190, 10, 3.5, '🌴', 0, 'Mesopotamia'],
    ['Passion Fruit', 140, 8, 3.2, '🍈', 0, 'Southern Brazil'],
    ['Lychee', 160, 10, 3.4, '🍒', 0, 'Guangdong, China'],
    ['Tamarind', 170, 8, 3.4, '🫛', 0, 'Tropical Africa'],
    ['Oil Palm Fruit', 150, 14, 1.5, '🌴', 0, 'West Africa', 'Palm oil is the most-used vegetable oil on Earth and is in roughly half of all packaged supermarket products.'],
    ['Cashew Nuts', 220, 6, 7, '🌰', 'nut', 'Northeastern Brazil', 'Cashews grow out of the bottom of a fruit, and their shells contain a skin-burning oil related to poison ivy.'],
    ['Macadamia Nuts', 240, 6, 8, '🌰', 'nut', 'Queensland, Australia'],
  ]);
  S('greenhouse', 'spice', [
    ['Cocoa Pods', 200, 8, 4, '🫛', 'cocoa', 'Upper Amazon; first drunk by the Olmec & Maya', 'About 60% of the world’s cocoa comes from just two countries: Côte d’Ivoire and Ghana, mostly from small family farms.'],
    ['Coffee Cherries', 180, 10, 3, '🍒', 'cocoa', 'Ethiopia', 'Each coffee cherry holds two seeds: the coffee "beans". A tree yields only about 0.5 kg of roasted coffee a year.'],
    ['Tea Leaves', 120, 10, 2.5, '🍃', 'cocoa', 'Yunnan, China', 'Green, black, oolong and white tea all come from the same plant, Camellia sinensis.'],
    ['Vanilla Pods', 260, 4, 12, '🌱', 0, 'Mexico (Totonac people); now Madagascar', 'Outside Mexico vanilla flowers must be pollinated by hand, one by one, a method found by 12-year-old Edmond Albius in 1841.'],
    ['Pepper Berries', 170, 8, 4, '🫐', 0, 'Malabar Coast, India', 'Black, white and green pepper all come from the same vine; the difference is when and how they are processed.'],
    ['Cinnamon Bark', 200, 6, 6, '🪵', 0, 'Sri Lanka', 'Cinnamon is the inner bark of a tree, peeled by hand and rolled into quills.'],
    ['Clove Buds', 210, 6, 6, '🌸', 0, 'Maluku Islands, Indonesia'],
    ['Nutmeg Fruit', 220, 6, 6, '🍑', 0, 'Banda Islands, Indonesia', 'In 1667 the Dutch traded Manhattan to the English for Run, a tiny nutmeg island.'],
    ['Cardamom Pods', 200, 6, 7, '🫛', 0, 'Western Ghats, India'],
    ['Allspice Berries', 190, 6, 5, '🫐', 0, 'Jamaica'],
    ['Star Anise', 200, 6, 5, '⭐', 0, 'Southern China & Vietnam'],
    ['Ginger', 100, 8, 3, '🫚', 0, 'Maritime Southeast Asia'],
    ['Turmeric Root', 110, 8, 3, '🫚', 0, 'India'],
    ['Galangal', 110, 7, 3.2, '🫚', 0, 'Java, Indonesia'],
    ['Lemongrass', 70, 8, 2.4, '🌿', 'herb', 'South Asia'],
    ['Kaffir Lime Leaves', 120, 8, 2.8, '🍃', 'herb', 'Southeast Asia'],
    ['Annatto Seeds', 160, 6, 4, '🔴', 0, 'Tropical Americas'],
  ]);

  // ===================== MUSHROOM CELLAR & FORAGING =====================
  S('mushroom', 'mushroom', [
    ['Button Mushrooms', 40, 8, 2, '🍄', 0, 'Paris catacombs, 1700s', 'Button, cremini and portobello mushrooms are the same species at different ages.'],
    ['Shiitake', 60, 6, 3.5, '🍄', 0, 'China & Japan (grown on logs for 1,000 years)'],
    ['Oyster Mushrooms', 45, 7, 3, '🍄', 0, 'Worldwide'],
    ['Wood Ear', 55, 6, 3, '🍄', 0, 'China'],
    ['Enoki', 50, 7, 3, '🍄', 0, 'Japan'],
  ]);
  S('forager', 'mushroom', [
    ['Porcini', 120, 4, 8, '🍄', 0, 'Wild: European & Asian forests', 'Porcini cannot be farmed: they live in symbiosis with the roots of living trees.'],
    ['Chanterelles', 110, 4, 7, '🍄', 0, 'Wild: Europe & North America'],
    ['Morels', 140, 3, 10, '🍄', 0, 'Wild: temperate forests'],
    ['Black Truffle', 300, 1, 120, '⚫', 0, 'Wild: Périgord, France', 'Truffles grow underground and are found by trained dogs or pigs.'],
    ['Wild Garlic', 50, 8, 2.4, '🌿', 'herb', 'European woodlands'],
    ['Juniper Berries', 120, 6, 4, '🫐', 'spice', 'Northern forests', 'Juniper "berries" are actually tiny cones. They flavour gin and sauerkraut.'],
    ['Elderflowers', 90, 6, 3, '🌼', 'herb', 'European hedgerows'],
    ['Lingonberries', 100, 8, 3, '🫐', 'berry', 'Scandinavian forests'],
    ['Maple Sap', 60, 40, 0.3, '🍁', 'sugar', 'Eastern Canada (Indigenous peoples)', 'It takes about 40 litres of maple sap to boil down one litre of maple syrup.'],
  ]);

  // ===================== MINERALS & WATER =====================
  S('well', 'mineral', [
    ['Water', 8, 10, 0.1, '💧', 0, 'Everywhere', 'Producing 1 kg of beef uses around 15,000 litres of water, mostly to grow feed.'],
  ]);
  FS.rawItem('Salt', 'mineral', 0.8, '🧂', 'Seawater or ancient seabeds', 'Salt was so valuable in the ancient world that Roman soldiers were sometimes paid with it; "salary" comes from sal.');
  FS.rawItem('Nigari', 'mineral', 2, '💎', 'Japan', 'Nigari (magnesium chloride) is what is left after salt crystallises from seawater. It sets soy milk into tofu.');
  FS.rawItem('Fleur de Sel', 'mineral', 6, '🧂', 'Guérande, France');
  FS.recipe('saltpan', {}, { salt: 6, nigari: 1 }, 60, { cost: 2 });
  FS.recipe('saltpan', {}, { fleur_de_sel: 2 }, 90, { cost: 3 });
  S('quarry', 'mineral', [
    ['Rock Salt', 45, 6, 0.5, '🪨', 0, 'Ancient dried seas', 'Most table salt comes from mines in ancient seabeds, not from today’s oceans.'],
    ['Limestone', 40, 6, 0.4, '🪨', 0, 'Worldwide'],
    ['Trona', 60, 5, 0.8, '🪨', 0, 'Green River, Wyoming', 'Most of America’s baking soda comes from trona, a mineral left by a lake that evaporated 50 million years ago.'],
  ]);

  // ===================== ANIMALS =====================
  const A = (b, inputs, outputs, time, cost, label) => FS.recipe(b, inputs, outputs, time, { cost, label });
  const R = FS.rawItem;
  R('Cow Milk', 'dairy', 0.9, '🥛', 'Domesticated cattle: ~8500 BCE, Fertile Crescent', 'A dairy cow must have a calf every year or so to keep producing milk.');
  R('Water Buffalo Milk', 'dairy', 1.5, '🥛', 'South Asia; Campania, Italy', 'Authentic mozzarella di bufala is made from water buffalo milk.');
  R('Sheep Milk', 'dairy', 1.3, '🥛', 'Mesopotamia');
  R('Goat Milk', 'dairy', 1.1, '🥛', 'Zagros Mountains, Iran');
  R('Cattle', 'livestock', 120, '🐂', 'Fertile Crescent', 'A beef steer eats about 6–8 kg of feed for every 1 kg of weight it gains.');
  R('Calf', 'livestock', 70, '🐄', 'Byproduct of the dairy industry', 'Traditional rennet for cheese is an enzyme from the stomach of young calves.');
  R('Pig', 'livestock', 80, '🐖', 'Anatolia & China, ~9000 BCE');
  R('Sheep', 'livestock', 70, '🐑', 'Mesopotamia');
  R('Goat', 'livestock', 55, '🐐', 'Zagros Mountains');
  R('Broiler Chicken', 'livestock', 9, '🐓', 'Red junglefowl of Southeast Asia', 'There are more chickens on Earth than all other birds combined: over 20 billion at any time.');
  R('Duck', 'livestock', 12, '🦆', 'China');
  R('Turkey', 'livestock', 24, '🦃', 'Mexico (domesticated by the Maya)');
  R('Goose', 'livestock', 18, '🪿', 'Egypt & Europe');
  R('Rabbit', 'livestock', 8, '🐇', 'Iberia (domesticated by French monks)');
  R('Chicken Egg', 'egg', 0.7, '🥚', 'Southeast Asia');
  R('Duck Egg', 'egg', 1, '🥚', 'China');
  R('Quail Egg', 'egg', 0.5, '🥚', 'Japan');
  R('Honey', 'sugar', 4, '🍯', 'Wild honey hunting: 8,000-year-old cave paintings in Spain', 'A bee makes about 1/12 teaspoon of honey in its whole life; one jar needs ~2 million flower visits.');

  A('pasture', { hay: 4, water: 4 }, { cow_milk: 8 }, 30, 1, 'Dairy Cows');
  A('pasture', { hay: 6, water: 4, cow_milk: 4 }, { calf: 1 }, 90, 3, 'Calf Rearing');
  A('pasture', { hay: 14, water: 6 }, { cattle: 1 }, 160, 5, 'Beef Cattle');
  A('pasture', { hay: 4, water: 4 }, { water_buffalo_milk: 5 }, 35, 1, 'Water Buffalo');
  A('pasture', { hay: 3, water: 2 }, { sheep_milk: 5 }, 30, 1, 'Dairy Ewes');
  A('pasture', { hay: 6, water: 3 }, { sheep: 1 }, 110, 2, 'Meat Sheep');
  A('pasture', { hay: 3, water: 2 }, { goat_milk: 5 }, 30, 1, 'Dairy Goats');
  A('pasture', { hay: 5, water: 3 }, { goat: 1 }, 100, 2, 'Meat Goats');
  A('pigsty', { animal_feed: 8, water: 4 }, { pig: 1 }, 120, 3, 'Fattening Pigs');
  A('coop', { animal_feed: 2, water: 1 }, { chicken_egg: 8 }, 25, 0.5, 'Laying Hens');
  A('coop', { animal_feed: 3, water: 1 }, { broiler_chicken: 2 }, 45, 1, 'Broiler Chickens');
  A('coop', { animal_feed: 3, water: 2 }, { duck: 1, duck_egg: 2 }, 55, 1, 'Ducks');
  A('coop', { animal_feed: 6, water: 2 }, { turkey: 1 }, 90, 2, 'Turkeys');
  A('coop', { hay: 4, animal_feed: 2, water: 2 }, { goose: 1 }, 80, 2, 'Geese');
  A('coop', { animal_feed: 1, water: 1 }, { quail_egg: 8 }, 30, 0.5, 'Quail');
  A('coop', { hay: 3, water: 1 }, { rabbit: 2 }, 60, 1, 'Rabbits');
  A('apiary', {}, { honey: 3 }, 60, 1, 'Beehives');

  // ===================== WILD FISHERY =====================
  S('dock', 'seafood', [
    ['Cod', 45, 3, 6, '🐟', 0, 'North Atlantic', 'Cod fueled Europe for centuries; the Grand Banks fishery collapsed from overfishing in 1992.'],
    ['Haddock', 45, 3, 5.5, '🐟', 0, 'North Atlantic'],
    ['Tuna', 90, 1, 30, '🐟', 0, 'Open oceans'],
    ['Skipjack Tuna', 60, 2, 10, '🐟', 0, 'Tropical Pacific (bonito)'],
    ['Mackerel', 35, 4, 3.5, '🐟', 0, 'North Atlantic'],
    ['Sardines', 30, 8, 1.2, '🐟', 0, 'Mediterranean & Atlantic'],
    ['Anchovies', 25, 12, 0.7, '🐟', 0, 'Peru (the world’s largest fishery)', 'Most of the world’s anchovy catch is ground into fish meal to feed farmed fish, pigs and chickens.'],
    ['Herring', 30, 8, 1.4, '🐟', 0, 'North Sea & Baltic'],
    ['Sea Bass', 50, 2, 9, '🐟', 0, 'Mediterranean & Atlantic'],
    ['Sole', 50, 2, 10, '🐟', 0, 'English Channel'],
    ['Halibut', 70, 1, 18, '🐟', 0, 'North Pacific & Atlantic'],
    ['Eel', 70, 2, 10, '🐍', 0, 'Spawns in the Sargasso Sea', 'Nobody has ever bred European eels in captivity; all farmed eels are caught as wild babies.'],
    ['Squid', 40, 4, 3, '🦑', 0, 'Worldwide'],
    ['Octopus', 60, 2, 8, '🐙', 0, 'Mediterranean & Japan'],
    ['Shrimp', 35, 8, 1.6, '🦐', 0, 'Worldwide'],
    ['Crab', 60, 3, 6, '🦀', 0, 'Worldwide'],
    ['Lobster', 90, 1, 25, '🦞', 0, 'Maine & Atlantic Canada'],
    ['Clams', 40, 8, 1.6, '🐚', 0, 'Coastal mudflats'],
    ['Sea Urchin', 70, 3, 8, '🟣', 0, 'Hokkaido, Japan'],
    ['Nori Seaweed', 50, 10, 1.2, '🌿', 0, 'Japan', 'Nori farming only became possible after British scientist Kathleen Drew-Baker discovered its life cycle in 1949.'],
    ['Kombu Kelp', 60, 8, 1.6, '🌿', 0, 'Hokkaido, Japan'],
    ['Wakame', 50, 8, 1.4, '🌿', 0, 'Japan & Korea'],
  ]);
  FS.rawItem('Salmon', 'seafood', 12, '🐟', 'North Atlantic & Pacific; 70% now farmed in Norway & Chile');
  FS.rawItem('Trout', 'seafood', 6, '🐟', 'Europe & North America');
  FS.rawItem('Carp', 'seafood', 4, '🐟', 'China (the most farmed fish on Earth)');
  FS.rawItem('Tilapia', 'seafood', 3.5, '🐟', 'Nile basin');
  FS.rawItem('Mussels', 'seafood', 1.2, '🦪', 'Atlantic coasts');
  FS.rawItem('Oysters', 'seafood', 3, '🦪', 'Worldwide estuaries');
  A('fishfarm', { fish_meal: 4 }, { salmon: 2 }, 70, 2, 'Salmon Pens');
  A('fishfarm', { fish_meal: 2 }, { trout: 2 }, 55, 1, 'Trout Ponds');
  A('fishfarm', { animal_feed: 2 }, { carp: 3 }, 50, 1, 'Carp Ponds');
  A('fishfarm', { animal_feed: 2 }, { tilapia: 3 }, 45, 1, 'Tilapia Tanks');
  A('fishfarm', {}, { mussels: 10 }, 60, 1, 'Mussel Ropes');
  A('fishfarm', {}, { oysters: 6 }, 90, 2, 'Oyster Beds');
  A('fishfarm', { animal_feed: 2 }, { shrimp: 8 }, 50, 1, 'Shrimp Ponds');
  FS.rawItem('Barramundi', 'seafood', 7, '🐟', 'Northern Australia & Southeast Asia', 'Barramundi are born male and turn female when they are about five years old.');
  A('fishfarm', { fish_meal: 3 }, { barramundi: 2 }, 65, 2, 'Barramundi Tanks');
})(FS);
