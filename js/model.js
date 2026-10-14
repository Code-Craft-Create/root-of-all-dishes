// Derived data: indexes, prices and supply-chain analysis. Shared by the game and tools/validate.js.
(function (FS) {
  const PROCESS_MARKUP = 1.25;
  const DISH_MARKUP = 1.7;

  FS.finalize = function () {
    FS.byOutput = {};
    FS.byInput = {};
    FS.byBuilding = {};
    for (const id in FS.items) { FS.byOutput[id] = []; FS.byInput[id] = []; }
    for (const r of FS.recipes) {
      for (const o in r.outputs) (FS.byOutput[o] = FS.byOutput[o] || []).push(r);
      for (const i in r.inputs) (FS.byInput[i] = FS.byInput[i] || []).push(r);
      (FS.byBuilding[r.building] = FS.byBuilding[r.building] || []).push(r);
    }
    computeValues();
    FS.dishList = Object.values(FS.items).filter((i) => i.dish);
    FS.ingredientList = Object.values(FS.items).filter((i) => !i.dish);
    FS.indexRecipes();
    FS.dishRecipe = {};
    for (const r of FS.byBuilding.kitchen || []) FS.dishRecipe[r.primary] = r;
  };

  // For items with multiple production routes, prefer early-game / canonical recipes
  // so guided steps and early supply chains read naturally and do not route through late-game buildings.
  const PREFERRED_RECIPES = {
    molasses: (r) => r.inputs && r.inputs.sugar_beet, // Sugar beet in Sugar Refinery (Stage A), not sugarcane in Tropical Greenhouse
    animal_feed: (r) => r.inputs && r.inputs.barley && r.inputs.wheat_bran, // Barley + wheat bran (Stage A), not corn + soybean meal (Oil Press)
    whey: (r) => r.primary === 'cheddar', // Cheddar from cow milk (Stage A), not late cheese curds
    salt: (r) => r.building === 'saltpan', // Coastal Salt Pan (Stage A), not Salt Mine (Stage C)
    shrimp: (r) => r.building === 'dock', // Coastal Dock (Stage A), not Aquaculture Pond (Stage D)
    white_sugar: (r) => r.inputs && r.inputs.sugar_beet, // Sugar beet in Sugar Refinery (Stage A)
    yeast: (r) => r.inputs && r.inputs.molasses, // Molasses in Fermentation Cellar (Stage A)
    baking_soda: (r) => r.inputs && r.inputs.trona, // Trona (Stage B), not limestone / Solvay process (Stage D)
    mozzarella: (r) => r.inputs && r.inputs.cow_milk, // Cow milk, not water buffalo milk
  };

  function computeValues() {
    const val = {};
    const best = {};
    for (const id in FS.items) {
      const it = FS.items[id];
      if (it.raw) {
        val[id] = it.value;
        best[id] = FS.byOutput[id].find((r) => Object.keys(r.inputs).length === 0) || FS.byOutput[id][0];
      } else val[id] = Infinity;
    }
    for (let pass = 0; pass < 60; pass++) {
      let changed = false;
      for (const r of FS.recipes) {
        const outs = Object.keys(r.outputs);
        if (outs.every((o) => FS.items[o].raw)) continue;
        let total = 0, ok = true;
        for (const [i, q] of Object.entries(r.inputs)) {
          if (!isFinite(val[i])) { ok = false; break; }
          total += val[i] * q;
        }
        if (!ok) continue;
        total = total * (r.dish ? DISH_MARKUP : PROCESS_MARKUP) + r.time * 0.04 + r.cost;
        if (r.dish) total += Object.keys(r.inputs).length * 2;
        const byQty = outs.slice(1).reduce((s, o) => s + r.outputs[o], 0);
        const primShare = byQty ? 0.8 : 1;
        outs.forEach((o, idx) => {
          if (FS.items[o].raw) return;
          const v = idx === 0 ? (total * primShare) / r.outputs[o] : (total * (1 - primShare)) / byQty;
          if (v < val[o] - 1e-9) {
            val[o] = v;
            best[o] = r;
            changed = true;
          }
        });
      }
      if (!changed) break;
    }
    for (const id in FS.items) {
      FS.items[id].value = Math.max(0.1, Math.round(val[id] * 100) / 100);
      // Prefer a canonical early recipe where defined, else a recipe whose primary output is the item, so chains read naturally.
      const pref = PREFERRED_RECIPES[id] && (FS.byOutput[id] || []).find(PREFERRED_RECIPES[id]);
      FS.items[id].bestRecipe = pref || (best[id] && best[id].primary === id ? best[id] : ((FS.byOutput[id] || []).find((r) => r.primary === id) || best[id] || (FS.byOutput[id] || [])[0]));
    }
  }

  // Supply-chain analysis for one unit of an item.
  // Returns { raw: {id: qty}, recipes: Set, buildings: Set, depth, time, steps }
  const chainMemo = {};
  FS.chain = function (id, stack = new Set()) {
    if (chainMemo[id]) return chainMemo[id];
    const it = FS.items[id];
    const r = it.bestRecipe;
    const res = { raw: {}, recipes: new Set(), buildings: new Set(), depth: 0, time: 0 };
    if (!r || Object.keys(r.inputs).length === 0 || stack.has(id)) {
      res.raw[id] = 1;
      if (r) { res.recipes.add(r.id); res.buildings.add(r.building); res.time = r.time; }
      return (chainMemo[id] = res);
    }
    stack.add(id);
    const per = 1 / r.outputs[id];
    let maxTime = 0, maxDepth = 0;
    for (const [i, q] of Object.entries(r.inputs)) {
      const c = FS.chain(i, stack);
      for (const [rid, rq] of Object.entries(c.raw)) res.raw[rid] = (res.raw[rid] || 0) + rq * q * per;
      c.recipes.forEach((x) => res.recipes.add(x));
      c.buildings.forEach((x) => res.buildings.add(x));
      maxTime = Math.max(maxTime, c.time);
      maxDepth = Math.max(maxDepth, c.depth);
    }
    stack.delete(id);
    res.recipes.add(r.id);
    res.buildings.add(r.building);
    res.depth = maxDepth + 1;
    res.time = maxTime + r.time;
    return (chainMemo[id] = res);
  };

  // Compact complexity summary used across the UI.
  FS.complexity = function (id) {
    const c = FS.chain(id);
    const rawIds = Object.keys(c.raw);
    return {
      rawCount: rawIds.length,
      steps: [...c.recipes].filter((rid) => {
        const r = FS.recipeById[rid];
        return r && Object.keys(r.inputs).length > 0;
      }).length,
      buildings: c.buildings.size,
      depth: c.depth,
      time: c.time,
      raw: c.raw,
    };
  };

  // Where an item's price comes from: farm (raw goods and seed costs), processing (every workshop step)
  // and kitchen (cooking a dish). Mirrors the pricing in computeValues. Returns shares that sum to the value.
  const partsMemo = {};
  FS.priceParts = function (id, stack = new Set()) {
    if (partsMemo[id]) return partsMemo[id];
    const it = FS.items[id], r = it.bestRecipe;
    if (it.raw || !r || stack.has(id) || !Object.keys(r.inputs).length) return (partsMemo[id] = { farm: it.value, processing: 0, kitchen: 0 });
    stack.add(id);
    const sum = { farm: 0, processing: 0, kitchen: 0 };
    let inputs = 0;
    for (const [i, q] of Object.entries(r.inputs)) {
      const p = FS.priceParts(i, stack);
      for (const k in sum) sum[k] += p[k] * q;
      inputs += FS.items[i].value * q;
    }
    stack.delete(id);
    let added = inputs * ((r.dish ? DISH_MARKUP : PROCESS_MARKUP) - 1) + r.time * 0.04 + r.cost;
    if (r.dish) added += Object.keys(r.inputs).length * 2;
    sum[r.dish ? 'kitchen' : 'processing'] += added;
    const total = sum.farm + sum.processing + sum.kitchen;
    const res = {};
    for (const k in sum) res[k] = total ? (sum[k] / total) * it.value : 0;
    return (partsMemo[id] = res);
  };

  FS.recipeById = {};
  FS.indexRecipes = () => { for (const r of FS.recipes) FS.recipeById[r.id] = r; };
})(typeof window !== 'undefined' ? window.FS : globalThis.FS);
