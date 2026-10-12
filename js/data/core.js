// Root of All Dishes data core: registries and helper functions used by every data file.
// Data files only call these helpers; derived values (prices, chains) are computed in js/model.js.
(function (G) {
  const FS = (G.FS = G.FS || {});
  FS.items = {};      // id -> item
  FS.recipes = [];    // every production step, including crops, animals and dishes
  FS.buildings = {};  // id -> building type
  FS.cuisines = {};

  // Letters that Unicode does not split into base letter + accent are spelled out (Smørrebrød, Gołąbki, Æbleskiver).
  const TRANSLIT = { 'ł': 'l', 'æ': 'ae', 'ø': 'o', 'ß': 'ss', 'œ': 'oe', 'đ': 'd', 'ı': 'i' };
  FS.slug = (s) =>
    s.toLowerCase()
      .replace(/[łæøßœđı]/g, (c) => TRANSLIT[c])
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

  // Default emoji per category, used when an item has none of its own.
  FS.catInfo = {
    grain: ['🌾', 'Grains'], vegetable: ['🥬', 'Vegetables'], root: ['🥕', 'Roots & Tubers'],
    fruit: ['🍎', 'Fruits'], berry: ['🍓', 'Berries'], citrus: ['🍊', 'Citrus'], tropical: ['🥭', 'Tropical'],
    legume: ['🫘', 'Legumes'], oilseed: ['🌻', 'Oilseeds'], nut: ['🌰', 'Nuts'], herb: ['🌿', 'Herbs'],
    spice: ['🧂', 'Spices'], mushroom: ['🍄', 'Mushrooms'], feed: ['🌾', 'Animal Feed'],
    livestock: ['🐄', 'Livestock'], dairy: ['🥛', 'Dairy'], cheese: ['🧀', 'Cheese'], egg: ['🥚', 'Eggs'],
    meat: ['🥩', 'Meat'], charcuterie: ['🥓', 'Charcuterie'], seafood: ['🐟', 'Fish & Seafood'],
    mineral: ['🧂', 'Minerals & Water'], flour: ['🌾', 'Flours & Starches'], bread: ['🍞', 'Bread & Dough'],
    pasta: ['🍝', 'Pasta & Noodles'], oil: ['🫗', 'Oils & Fats'], sugar: ['🍬', 'Sugars & Syrups'],
    ferment: ['🫙', 'Ferments'], drink: ['🍷', 'Drinks & Alcohol'], sauce: ['🥫', 'Sauces & Stocks'],
    preserve: ['🫙', 'Preserves'], spiceblend: ['🌶️', 'Spice Blends'], cocoa: ['🍫', 'Cocoa, Coffee & Tea'],
    pastry: ['🧁', 'Pastry & Confectionery'], dish: ['🍽️', 'Dishes'],
  };

  function def(name, cat, props) {
    const id = FS.slug(name);
    if (FS.items[id]) throw new Error('Duplicate item: ' + name);
    FS.items[id] = Object.assign({ id, name, cat, emoji: (FS.catInfo[cat] || ['❔'])[0] }, props);
    return id;
  }
  FS.def = def;

  let rid = 0;
  function recipe(building, inputs, outputs, time, opts = {}) {
    const primary = Object.keys(outputs)[0];
    const r = Object.assign(
      { id: building + ':' + primary + (FS.recipes.some((x) => x.building === building && x.primary === primary) ? ':' + ++rid : ''),
        building, inputs, outputs, time, primary, cost: 0 },
      opts
    );
    FS.recipes.push(r);
    return r;
  }
  FS.recipe = recipe;

  // Raw producers with no inputs (fields, orchards, docks...).
  // row: [name, time, yield, value, emoji, cat, origin, fact]
  FS.source = function (building, defaultCat, rows) {
    for (const [name, time, yld, value, emoji, cat, origin, fact] of rows) {
      const id = def(name, cat || defaultCat, { raw: true, value, emoji: emoji || undefined, origin, fact });
      if (!emoji) FS.items[id].emoji = FS.catInfo[FS.items[id].cat][0];
      recipe(building, {}, { [id]: yld }, time, { cost: Math.round(value * yld * 0.3) });
    }
  };

  // Raw item that is produced by a recipe defined separately (animal products, livestock).
  FS.rawItem = (name, cat, value, emoji, origin, fact) =>
    def(name, cat, { raw: true, value, emoji: emoji || FS.catInfo[cat][0], origin, fact });

  // Processing recipes. row: [name, inputs, outQty, time, opts]
  // opts.by = {'Byproduct Name': qty}  (defined on first use, same category unless opts.byCat)
  // opts.alt = true  -> another recipe for an item that already exists
  FS.proc = function (building, defaultCat, rows) {
    for (const [name, inputs, qty, time, opts = {}] of rows) {
      const id = FS.slug(name);
      if (opts.alt) {
        if (!FS.items[id] && !opts.lateAlt) throw new Error('alt for unknown item ' + name);
      } else {
        def(name, opts.cat || defaultCat, { emoji: opts.emoji || FS.catInfo[opts.cat || defaultCat][0], fact: opts.fact });
      }
      const outputs = { [id]: qty };
      for (const [bn, bq] of Object.entries(opts.by || {})) {
        const bid = FS.slug(bn);
        if (!FS.items[bid]) def(bn, opts.byCat || opts.cat || defaultCat, { byproduct: true, emoji: (opts.byEmoji || {})[bn] });
        if (!FS.items[bid].emoji) FS.items[bid].emoji = FS.catInfo[FS.items[bid].cat][0];
        outputs[bid] = bq;
      }
      recipe(building, inputs, outputs, time, { label: opts.label });
    }
  };

  // Dishes are cooked in the Kitchen and must be discovered first.
  // row: [name, emoji, inputs, note]
  FS.dishes = function (cuisine, rows) {
    FS.cuisines[cuisine] = (FS.cuisines[cuisine] || 0) + rows.length;
    for (const [name, emoji, inputs, note] of rows) {
      const id = def(name, 'dish', { dish: true, cuisine, emoji: emoji || '🍽️', note });
      const n = Object.keys(inputs).length;
      recipe('kitchen', inputs, { [id]: 1 }, 15 + n * 5, { dish: true });
    }
  };

  FS.building = (id, b) => (FS.buildings[id] = Object.assign({ id, size: [2, 2], upkeep: 1, place: 'land' }, b));

  if (typeof module !== 'undefined') module.exports = FS;
})(typeof window !== 'undefined' ? window : globalThis);
