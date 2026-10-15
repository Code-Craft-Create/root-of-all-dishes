// Game state and simulation. No DOM access here; the UI listens to events.
(function () {
  const SAVE_KEY = 'rootdishes-save';
  // The world is a 5 x 5 grid of plots, each the size of the original 64 x 44 map. The farm starts on the centre
  // plot (2, 2) and buys neighbouring plots (see Land below). Coordinates are world tiles.
  const PW = 64, PH = 44, PLOTS = 5, MID = 2;
  const W = PW * PLOTS, H = PH * PLOTS, OX = PW * MID, OY = PH * MID;
  const T = { GRASS: 0, WATER: 1, FOREST: 2, ROCK: 3, SAND: 4 };
  const MAX_SLOTS = 8;

  const listeners = {};
  // Events that can change which buildings stand near which makers (see Proximity below).
  const PROX_EVENTS = new Set(['built', 'moved', 'demolished', 'changed', 'reset']);
  let proxVer = 0;
  const Game = {
    W, H, PW, PH, PLOTS, OX, OY, T, MAX_SLOTS, S: null, occ: null,
    on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); },
    emit(evt, ...args) { if (PROX_EVENTS.has(evt)) proxVer++; (listeners[evt] || []).forEach((fn) => fn(...args)); },
  };
  window.Game = Game;

  // ---------- Map generation ----------
  function rng(seed) {
    return function () {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash3(a, b, c) {
    let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 1440670441);
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  // Value noise on a lattice. Lattice points of the original 64 x 44 map come from rand in the original order, so
  // the centre plot is exactly the map older versions generated; points beyond it are hashed from the seed.
  function noise(scale, rand, seed) {
    const gw = Math.ceil(PW / scale) + 2, gh = Math.ceil(PH / scale) + 2;
    const g = Array.from({ length: gw * gh }, rand);
    const at = (ix, iy) => (ix >= 0 && iy >= 0 && ix < gw && iy < gh ? g[iy * gw + ix] : hash3(seed + scale * 7919, ix, iy));
    const sm = (t) => t * t * (3 - 2 * t);
    return (x, y) => {
      const fx = x / scale, fy = y / scale, ix = Math.floor(fx), iy = Math.floor(fy);
      const tx = sm(fx - ix), ty = sm(fy - iy);
      const a = at(ix, iy), b = at(ix + 1, iy), c = at(ix, iy + 1), d = at(ix + 1, iy + 1);
      return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
    };
  }
  // The whole 5 x 5 world. Local coordinates (lx, ly) are relative to the centre plot, which keeps the original
  // map's rules. Further out the rules blend (over ~14 tiles) into wider country: the coast becomes a sea channel
  // running south-west to north-east with land beyond it, plus islands, lakes, more forest and hills.
  function genMap(seed) {
    const rand = rng(seed);
    const n1 = noise(9, rand, seed), n2 = noise(5, rand, seed), n3 = noise(4, rand, seed);
    const n4 = noise(23, rng(seed ^ 0x5bd1e995), seed + 1), n5 = noise(13, rng(seed ^ 0x2545f491), seed + 2);
    const tiles = new Array(W * H).fill(T.GRASS);
    const cx = 26, cy = 18;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const lx = x - OX, ly = y - OY, i = y * W + x;
      // 0 on the centre plot, 1 from 14 tiles beyond it
      const d = Math.hypot(Math.max(0, -lx, lx - PW + 1), Math.max(0, -ly, ly - PH + 1)), f = Math.min(1, d / 14);
      let coast = (lx / PW) * 0.55 + (ly / PH) * 0.7 + n1(lx, ly) * 0.35;
      // far beyond the shore the sea floor rises again, so the sea is a channel with land on its far side
      coast -= f * 2.2 * Math.max(0, coast - 1.35);
      coast += f * (n4(lx, ly) - 0.5) * 0.5;
      const nearStart = Math.hypot(lx - cx, ly - cy) < 8;
      if (coast > 1.05) tiles[i] = T.WATER;
      else if (coast > 1.0) tiles[i] = T.SAND;
      else if (Math.hypot(lx - 10, (ly - 10) * 1.3) < 3.5 + n2(lx, ly) * 2) tiles[i] = T.WATER; // lake
      else if (f > 0 && n4(lx + 400, ly) * f > 0.7) tiles[i] = n4(lx + 400, ly) * f > 0.72 ? T.WATER : T.SAND; // lakes out in the country
      else if (!nearStart && n2(lx, ly) + f * (n5(lx, ly) - 0.5) * 0.3 > 0.66) tiles[i] = T.FOREST;
      else if (!nearStart && n3(lx, ly) + f * (n5(lx + 200, ly) - 0.6) * 0.3 > 0.74 && (lx < 44 || f > 0.5)) tiles[i] = T.ROCK;
    }
    // Guarantee a forest and a rocky outcrop near the start.
    const set = (lx, ly, t) => { tiles[(ly + OY) * W + lx + OX] = t; };
    for (let y = 4; y < 9; y++) for (let x = 34; x < 41; x++) if (Math.hypot(x - 37, y - 6) < 3.2) set(x, y, T.FOREST);
    for (let y = 30; y < 36; y++) for (let x = 6; x < 12; x++) if (Math.hypot(x - 9, y - 33) < 2.6) set(x, y, T.ROCK);
    return tiles;
  }

  // ---------- State ----------
  function newState(seed) {
    return {
      v: 4, seed, money: 4000, toques: 3, cuisines: { farmhouse_kitchen: true }, land: [MID * PLOTS + MID], time: 0, speed: 1, newB: {},
      tiles: genMap(seed), buildings: [], nextId: 1,
      inv: {}, seen: {}, discovered: {}, revealed: {}, demand: {},
      orders: [], orderTimer: 30, goalsDone: {}, skills: {},
      stats: { earned: 0, spent: 0, produced: {}, sold: 0, ordersDone: 0, experiments: 0 },
    };
  }

  // The starter kit. Every amount stays at 25 or below (half the first storage size of 50), so no building starts out full:
  // a well sitting on 50 water would never pump, and the first goal would wait until the water was used up.
  Game.START_KIT = {
    water: 20, salt: 25, yeast: 10, chicken_egg: 12, cow_milk: 12, butter: 6, bread_loaf: 6, potato: 10,
    lettuce: 6, tomato: 8, cucumber: 4, hay: 25, animal_feed: 25, wheat_flour: 10, white_sugar: 10,
    honey: 4, rolled_oats: 4,
  };
  Game.newGame = function () {
    const S = (Game.S = newState((Math.random() * 1e9) | 0));
    rebuildOcc();
    for (const [k, q] of Object.entries(Game.START_KIT)) addItem(k, q, true);
    place('farmhouse', OX + 25, OY + 17, true);
    const f1 = place('field', OX + 22, OY + 16, true), f2 = place('field', OX + 22, OY + 17, true), f3 = place('field', OX + 22, OY + 18, true);
    setRecipe(f1.id, 'field:wheat'); setRecipe(f2.id, 'field:wheat'); setRecipe(f3.id, 'field:potato');
    const w = place('well', OX + 28, OY + 16, true); setRecipe(w.id, 'well:water');
    Game.refreshUnlocks(true);
    Game.emit('reset');
    Game.toast('Welcome to Root of All Dishes! Check 🎯 Goals for your first steps.');
  };

  Game.load = function () {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const S = JSON.parse(raw);
      if (!migrate(S)) return false;
      Game.S = S;
      rebuildOcc();
      Game.refreshUnlocks(true);
      Game.emit('reset');
      return true;
    } catch (e) { console.warn('load failed', e); return false; }
  };
  Game.save = function (quiet) {
    try { Game.S.gameVersion = GAME_VERSION; localStorage.setItem(SAVE_KEY, JSON.stringify(Game.S)); if (!quiet) Game.toast('Game saved.'); }
    catch (e) { Game.toast('Could not save: ' + e.message); }
  };
  Game.exportSave = () => JSON.stringify(Game.S);
  Game.importSave = function (txt) { const S = JSON.parse(txt); if (!S || typeof S !== 'object' || !migrate(S)) throw new Error('This save is from an older version of the game and can no longer be loaded'); Game.S = S; rebuildOcc(); Game.refreshUnlocks(true); Game.emit('reset'); };
  // Version 4 (cuisine stages and toques) started afresh: older saves had no players to carry over.
  // Changing the save format so old saves no longer load also means a major bump of GAME_VERSION (js/version.js).
  function migrate(S) { return S.v === 4; }
  // log = true also keeps the message in the farm journal (events worth reading later, not action feedback);
  // log = 'quiet' keeps it without counting on the journal badge (the player just did it, so it isn't news).
  Game.toast = (msg, kind, log) => { if (log) Game.journal({ type: 'msg', kind: kind || '', text: msg, quiet: log === 'quiet' || undefined }); Game.emit('toast', msg, kind || '', !!log); };
  // Unread entries for the journal badge: quiet ones (things the player did themselves) don't count.
  Game.journalUnread = function () {
    const S = Game.S, read = S.journalRead || 0;
    let n = 0;
    for (const e of S.journal || []) if (e.n > read && !e.quiet) n++;
    return n;
  };
  // Farm journal: everything that happened, newest last. Entries: msg, day (daily report), dish, unlock, items.
  Game.JOURNAL_MAX = 250;
  Game.journal = function (e) {
    const S = Game.S;
    if (!S) return;
    S.journal = S.journal || [];
    e.t = S.time;
    S.journalN = (S.journalN || 0) + 1;
    e.n = S.journalN;
    S.journal.push(e);
    if (S.journal.length > Game.JOURNAL_MAX) S.journal.splice(0, S.journal.length - Game.JOURNAL_MAX);
    Game.emit('journal', e);
  };

  function rebuildOcc() {
    rebuildLand();
    Game.occ = new Int32Array(W * H);
    for (const b of Game.S.buildings) fill(b, b.id);
  }
  function fill(b, val) {
    const [w, h] = FS.buildings[b.type].size;
    for (let y = b.y; y < b.y + h; y++) for (let x = b.x; x < b.x + w; x++) Game.occ[y * W + x] = val;
  }

  // ---------- Inventory ----------
  function addItem(id, q, silent) {
    const S = Game.S;
    S.inv[id] = (S.inv[id] || 0) + q;
    if (!S.seen[id]) { S.seen[id] = true; if (!silent) Game.emit('newItem', id); }
  }
  Game.addItem = addItem;
  Game.has = (id, q = 1) => (Game.S.inv[id] || 0) >= q;

  // ---------- Building ----------
  Game.tileAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? -1 : Game.S.tiles[y * W + x]);
  Game.buildingAt = (x, y) => { const id = x < 0 || y < 0 || x >= W || y >= H ? 0 : Game.occ[y * W + x]; return id ? Game.S.buildings.find((b) => b.id === id) : null; };

  // ---------- Land ----------
  // The farm owns whole plots (Game.PW x Game.PH tiles) of the 5 x 5 world, listed in S.land as py * 5 + px.
  // A plot can be bought when it shares a side with an owned one. Each purchase costs LAND_STEP more than the
  // one before: 5,000, 10,000, 15,000, ...
  const LAND_STEP = 5000;
  let owned = new Uint8Array(PLOTS * PLOTS);
  function rebuildLand() { owned = new Uint8Array(PLOTS * PLOTS); for (const k of Game.S.land) owned[k] = 1; Game.landVer = (Game.landVer || 0) + 1; }
  Game.plotAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? -1 : Math.floor(y / PH) * PLOTS + Math.floor(x / PW));
  Game.plotOwned = (k) => k >= 0 && k < PLOTS * PLOTS && owned[k] === 1;
  Game.owns = (x, y) => Game.plotOwned(Game.plotAt(x, y));
  Game.plotBuyable = function (k) {
    if (k < 0 || k >= PLOTS * PLOTS || owned[k]) return false;
    const px = k % PLOTS, py = Math.floor(k / PLOTS);
    return (px > 0 && owned[k - 1]) || (px < PLOTS - 1 && owned[k + 1]) || (py > 0 && owned[k - PLOTS]) || (py < PLOTS - 1 && owned[k + PLOTS]);
  };
  // n = how many plots the farm owns when buying (the start plot counts, so the first purchase is n = 1)
  Game.landCost = (n = Game.S.land.length) => LAND_STEP * n;
  Game.buyLand = function (k) {
    const S = Game.S, cost = Game.landCost();
    if (!Game.plotBuyable(k)) { Game.toast(owned[k] ? 'You already own this land.' : 'Buy the land next to your farm first.', 'bad'); return false; }
    if (S.money < cost) { Game.toast(`Not enough money: this land costs ${cost.toLocaleString('en')} coins.`, 'bad'); return false; }
    S.money -= cost; S.stats.spent += cost; dayStats().build += cost;
    S.land.push(k);
    rebuildLand();
    Game.emit('land', k);
    Game.toast(`Bought new land for ${cost.toLocaleString('en')} coins. The farm now covers ${S.land.length} of ${PLOTS * PLOTS} plots.`, 'good', 'quiet');
    return true;
  };

  // Cheat console: own every plot for free.
  // Cheat console: money counts as a bonus in the day's ledger.
  Game.giveMoney = function (n) { Game.S.money += n; dayStats().bonus += n; Game.emit('changed'); };
  // Cheat console: mark every dish discovered, silently (no cards or rewards). S.cheatRevealed (saved) lists the ones
  // only the console revealed, so hideRevealed() takes back exactly those and leaves real discoveries alone.
  Game.revealAllDishes = function () {
    const S = Game.S, got = new Set(S.cheatRevealed || []);
    for (const d of FS.dishList) if (!S.discovered[d.id]) { S.discovered[d.id] = true; got.add(d.id); }
    S.cheatRevealed = [...got];
    Game.emit('changed');
    return got.size;
  };
  Game.hideRevealed = function () {
    const S = Game.S, ids = S.cheatRevealed || [];
    for (const id of ids) delete S.discovered[id];
    delete S.cheatRevealed;
    // A Kitchen set to cook a dish that is hidden again goes back to no recipe.
    for (const b of S.buildings) if (b.type === 'kitchen' && b.recipe && !S.discovered[FS.recipeById[b.recipe].primary]) setRecipe(b.id, null);
    Game.emit('changed');
    return ids.length;
  };
  Game.giveAllLand = function () { Game.S.land = Array.from({ length: PLOTS * PLOTS }, (_, k) => k); rebuildLand(); Game.emit('land', -1); };

  // moveId: check a spot for moving that building (its own tiles count as free, and it costs Game.moveCost).
  Game.canPlace = function (type, x, y, moveId) {
    const bt = FS.buildings[type];
    if (!moveId && !Game.buildingUnlocked(type)) return 'Not unlocked yet';
    if (!moveId && type === 'academy' && Game.academyBuilding()) return 'You already have a Culinary Academy';
    const err = Game.spotErr(type, x, y, moveId);
    if (err) return err;
    if (Game.S.money < (moveId ? Game.moveCost(type) : bt.cost)) return 'Not enough money';
    return null;
  };
  // Whether the ground at (x, y) takes this building: bounds, owned land, open tiles, water/rock/forest next to it.
  // taken: optional Set of extra tile indices to treat as occupied (a blueprint's other buildings).
  Game.spotErr = function (type, x, y, moveId, taken) {
    const bt = FS.buildings[type];
    const [w, h] = bt.size;
    if (x < 0 || y < 0 || x + w > W || y + h > H) return 'Out of bounds';
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (!Game.owns(i, j)) return 'Not your land: buy it first';
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
      const t = Game.S.tiles[j * W + i];
      if (t !== T.GRASS && t !== T.SAND) return 'Needs open land';
      if (Game.occ[j * W + i] && Game.occ[j * W + i] !== moveId) return 'Tile is occupied';
      if (taken && taken.has(j * W + i)) return 'Tile is occupied';
    }
    const need = { shore: T.WATER, rock: T.ROCK, forest: T.FOREST }[bt.place];
    if (need !== undefined) {
      let ok = false;
      for (let j = y - 1; j <= y + h && !ok; j++) for (let i = x - 1; i <= x + w; i++) if (Game.tileAt(i, j) === need) { ok = true; break; }
      if (!ok) return { shore: 'Must touch water', rock: 'Must touch rocky ground', forest: 'Must touch forest' }[bt.place];
    }
    return null;
  };
  Game.moveCost = (type) => Math.ceil(FS.buildings[type].cost * 0.1);

  function place(type, x, y, free) {
    const S = Game.S;
    const bt = FS.buildings[type];
    if (!free) {
      const err = Game.canPlace(type, x, y);
      if (err) { Game.toast(err, 'bad'); return null; }
      S.money -= bt.cost; S.stats.spent += bt.cost; dayStats().build += bt.cost;
    }
    const b = { id: S.nextId++, type, x, y, recipe: null, running: false, progress: 0, status: 'idle', missing: [] };
    if (S.newB) delete S.newB[type];
    S.buildings.push(b);
    fill(b, b.id);
    // Only one thing it can make yet: start on it straight away (a plan or blueprint may set another recipe right after).
    // A Kitchen counts its discovered dishes.
    if (type !== 'academy' && type !== 'farmhouse') {
      const can = Game.recipesFor(type);
      if (can.length === 1) Game.setRecipe(b.id, can[0].id);
    }
    Game.emit('built', b);
    return b;
  }
  Game.place = place;

  // Moving keeps everything about the building (recipe, batch in progress, rate, priority, pause).
  Game.move = function (id, x, y) {
    const S = Game.S;
    const b = S.buildings.find((o) => o.id === id);
    if (!b || b.type === 'farmhouse') return false;
    if (b.x === x && b.y === y) return false;
    const err = Game.canPlace(b.type, x, y, id);
    if (err) { Game.toast(err, 'bad'); return false; }
    const cost = Game.moveCost(b.type);
    S.money -= cost; S.stats.spent += cost; dayStats().build += cost;
    fill(b, 0);
    b.x = x; b.y = y;
    fill(b, b.id);
    Game.emit('moved', b);
    Game.toast(`Moved ${FS.buildings[b.type].name} for ${cost} coins.`);
    return true;
  };

  Game.demolish = function (id) {
    const S = Game.S;
    const b = S.buildings.find((x) => x.id === id);
    if (!b || b.type === 'farmhouse') return;
    const r = b.running && FS.recipeById[b.recipe];
    if (r) for (const [i, q] of Object.entries(b.took || r.inputs)) addItem(i, q, true); // refund the batch in progress
    const refund = Math.round(FS.buildings[b.type].cost * 0.5);
    S.money += refund; dayStats().bonus += refund;
    fill(b, 0);
    S.buildings = S.buildings.filter((x) => x !== b);
    Game.emit('demolished', b);
    Game.toast(`Demolished ${FS.buildings[b.type].name}. Refunded ${refund} coins.`);
  };

  Game.recipesFor = function (type) {
    const list = FS.byBuilding[type] || [];
    return type === 'kitchen' ? list.filter((r) => Game.S.discovered[r.primary]) : list.filter((r) => Game.recipeUnlocked(r.id));
  };

  function setRecipe(id, recipeId) {
    const b = Game.S.buildings.find((x) => x.id === id);
    if (!b) return;
    if (b.running && b.recipe !== recipeId) {
      const old = FS.recipeById[b.recipe];
      if (old) for (const [i, q] of Object.entries(b.took || old.inputs)) addItem(i, q, true);
    }
    if (b.recipe !== recipeId) { b.running = false; b.progress = 0; delete b.took; delete b.save; }
    b.recipe = recipeId;
    Game.emit('changed', b);
  }
  Game.setRecipe = setRecipe;
  Game.togglePause = function (id) { const b = Game.S.buildings.find((x) => x.id === id); if (b) { b.paused = !b.paused; Game.emit('changed', b); } };

  // ---------- Seasons & weather ----------
  // A day is 600 s; each season lasts 2 days, so a year is 8 days. Weather changes every 4 to 12 game hours (25 s each).
  const DAY = 600, SEASON_LEN = 2 * DAY;
  Game.DAY = DAY;
  Game.SEASONS = [
    { id: 'spring', name: 'Spring', icon: '🌸', msg: 'Spring: fields and orchards wake up. Watch out for late frost on fruit blossom.' },
    { id: 'summer', name: 'Summer', icon: '☀️', msg: 'Summer: peak growing season, and plenty of fresh produce means lower prices.' },
    { id: 'autumn', name: 'Autumn', icon: '🍂', msg: 'Autumn: harvest time for orchards and foragers. Winter is next: stock up hay for your animals and preserve food.' },
    { id: 'winter', name: 'Winter', icon: '❄️', msg: 'Winter: most fields and orchards stop growing. Greenhouses, cellars, stored grain and preserves keep kitchens going, and fresh produce sells for 50% more.' },
  ];
  Game.WEATHER = {
    sunny: { name: 'Sunny', icon: '☀️', effect: 'Salt pans evaporate faster.' },
    rain: { name: 'Rain', icon: '🌧️', effect: 'Crops grow faster; salt pans slow down.' },
    drought: { name: 'Drought', icon: '🏜️', effect: 'Fields grow at half speed, orchards slower too.' },
    frost: { name: 'Late frost', icon: '🥶', effect: 'Frost kills fruit blossom: orchards stop while it lasts; fields slow down.' },
    storm: { name: 'Storm', icon: '⛈️', effect: 'Fishing boats stay in harbour; salt pans slow down.' },
    snow: { name: 'Snow', icon: '🌨️', effect: 'Foragers find little under the snow.' },
  };
  // Spells all last 4-12 hours, so these weights are shares of time: clear (sunny) about 2/3 of the year
  // (spring 67%, summer 75%, autumn 65%, winter 60%).
  const WEATHER_ODDS = {
    spring: { sunny: 10, rain: 4, frost: 1 },
    summer: { sunny: 12, rain: 2, drought: 1.2, storm: 0.8 },
    autumn: { sunny: 13, rain: 5, storm: 2 },
    winter: { sunny: 6, snow: 3, storm: 1 },
  };
  // Cold-hardy field crops keep growing slowly through winter.
  const HARDY = new Set(['wheat', 'rye', 'barley', 'oats', 'spelt', 'kale', 'cabbage', 'red_cabbage', 'savoy_cabbage', 'leek', 'brussels_sprouts', 'turnip',
    'parsnip', 'garlic', 'spinach', 'carrot', 'radish', 'onion', 'shallot', 'swiss_chard', 'beetroot', 'celeriac', 'horseradish', 'scallion']);
  const SEASON_MULT = {
    field: [1, 1.2, 0.9, 0], orchard: [0.7, 1, 1.3, 0], forager: [1, 0.8, 1.4, 0.3], apiary: [1.2, 1.3, 0.6, 0], saltpan: [1, 1.3, 0.9, 0.5],
  };
  const WEATHER_MULT = {
    rain: { field: 1.15, orchard: 1.1, saltpan: 0.5 },
    drought: { field: 0.5, orchard: 0.7, saltpan: 1.3 },
    frost: { orchard: 0, field: 0.5, apiary: 0.5 },
    storm: { dock: 0, saltpan: 0.5 },
    snow: { forager: 0.5 },
    sunny: { saltpan: 1.2 },
  };
  // Debug overrides from the cheat console (js/cheats.js). Not saved: a reload brings back normal seasons and weather.
  Game.cheat = { season: null, weather: null, hour: null }; // hour only changes the map's daylight tint
  Game.seasonIndex = (t = Game.S.time) => (Game.cheat.season !== null ? Game.cheat.season : Math.floor(t / SEASON_LEN) % 4);
  Game.season = () => Game.SEASONS[Game.seasonIndex()];
  Game.dayOf = (t = Game.S.time) => Math.floor(t / DAY);
  Game.seasonLeft = () => SEASON_LEN - (Game.S.time % SEASON_LEN);
  Game.weather = () => Game.WEATHER[(Game.S.weather || {}).kind || 'sunny'];
  function pickWeather() {
    const odds = WEATHER_ODDS[Game.season().id];
    let r = Math.random() * Object.values(odds).reduce((a, b) => a + b, 0);
    for (const [k, w] of Object.entries(odds)) { if ((r -= w) <= 0) return k; }
    return 'sunny';
  }
  // Cheat console: force a season (index 0-3) or weather kind; null goes back to normal.
  Game.setSeasonOverride = function (si) {
    Game.cheat.season = si;
    Game.emit('weather');
  };
  Game.setWeatherOverride = function (kind) {
    const S = Game.S;
    Game.cheat.weather = kind;
    if (S.weather) { S.weather.kind = kind || pickWeather(); S.weather.until = S.time + spellLength(); }
    Game.emit('weather');
  };
  // Weather runs on its own clock: each spell lasts 4 to 12 game hours, across midnight if it likes.
  const HOUR = DAY / 24;
  Game.HOUR = HOUR;
  const spellLength = () => (4 + Math.random() * 8) * HOUR;
  Game.weatherLeft = () => Math.max(0, ((Game.S.weather || {}).until || 0) - Game.S.time);
  // S.weather = { day, kind, until }: day is the last day whose ledger was opened, until is when the spell ends (game seconds).
  function rollWeather() {
    const S = Game.S, day = Game.dayOf();
    if (!S.weather) S.weather = { day, kind: Game.cheat.weather || 'sunny', until: S.time + spellLength() };
    if (S.weather.day !== day) {
      daySummary(S.weather.day); dayStats();
      const newSeason = Game.seasonIndex(S.weather.day * DAY) !== Game.seasonIndex();
      S.weather.day = day;
      if (newSeason) {
        Game.toast(`${Game.season().icon} ${Game.season().msg}`, 'season', true);
        // Weather the new season doesn't have (snow in spring) ends with the old season.
        if (!Game.cheat.weather && !WEATHER_ODDS[Game.season().id][S.weather.kind]) S.weather.until = S.time;
      }
    }
    if (S.time < S.weather.until) return;
    const was = S.weather.kind, kind = Game.cheat.weather || pickWeather(), w = Game.WEATHER[kind];
    S.weather.kind = kind;
    S.weather.until = S.time + spellLength();
    if (kind === was) return;
    const hrs = Math.round((S.weather.until - S.time) / HOUR);
    if (kind !== 'sunny') Game.toast(`${w.icon} ${w.name} for about ${hrs} hours. ${w.effect}`, '', true);
    else Game.emit('toast', `${w.icon} The ${Game.WEATHER[was].name.toLowerCase()} is over: sunny again.`, '', false);
    Game.emit('weather');
  }
  // Growth speed of a building right now, from season and weather. Returns { m, why }.
  Game.growth = function (b) {
    const r = FS.recipeById[b.recipe];
    let m = 1;
    const why = [];
    const si = Game.seasonIndex(), sname = Game.SEASONS[si].name;
    const sm = SEASON_MULT[b.type];
    if (sm) {
      let v = sm[si];
      if (b.type === 'field' && r && si === 3 && HARDY.has(r.primary)) v = 0.4;
      if (b.type === 'field' && r && si === 2 && HARDY.has(r.primary)) v = 1;
      if (v !== 1) { m *= v; why.push(v === 0 ? `${sname}: too cold to grow` : `${sname} ×${v}`); }
    }
    let cold = m === 0; // stopped by the season itself, not by the weather
    const wk = (Game.S.weather || {}).kind;
    const wm = WEATHER_MULT[wk] && WEATHER_MULT[wk][b.type];
    if (wm !== undefined && m > 0) { m *= wm; why.push(`${Game.WEATHER[wk].name} ×${wm}`); }
    if (m === 0 && wk === 'frost') cold = true; // a frost spell freezes orchards too
    return { m, why: why.join(', '), cold };
  };
  Game.isFresh = function (id) {
    const it = FS.items[id];
    if (!it.raw || ['grain', 'feed', 'legume', 'oilseed', 'nut', 'spice'].includes(it.cat)) return false;
    const r = FS.byOutput[id].find((x) => !Object.keys(x.inputs).length);
    return !!r && ['field', 'orchard', 'forager'].includes(r.building);
  };
  // Fresh produce is cheap at harvest and dear in winter; storable goods keep their price.
  Game.seasonPrice = (id) => (Game.isFresh(id) ? [1.15, 0.9, 0.85, 1.5][Game.seasonIndex()] : 1);

  // ---------- Storage & auto-sell ----------
  // Storage holds the same amount of every item: 50 at the start, more with upgrades paid in toques.
  // Buildings stop once everything they make is at capacity; a batch that would overflow loses the extra.
  Game.STORAGE = [{ cap: 50 }, { cap: 75, toques: 1 }, { cap: 100, toques: 2 }, { cap: 150, toques: 4 }, { cap: 250, toques: 6 }, { cap: 375, toques: 10 }, { cap: 500, toques: 15 }];
  Game.storageLevel = () => Math.min(Game.S.storage || 0, Game.STORAGE.length - 1);
  Game.capacity = () => Game.STORAGE[Game.storageLevel()].cap;
  Game.room = (id) => Math.max(0, Game.capacity() - (Game.S.inv[id] || 0));
  Game.upgradeStorage = function () {
    const S = Game.S, next = Game.STORAGE[Game.storageLevel() + 1];
    if (!next) return;
    if ((S.toques || 0) < next.toques) return Game.toast(`Bigger storage costs 🎩${next.toques} toque${next.toques > 1 ? 's' : ''}.`, 'bad');
    S.toques -= next.toques;
    S.storage = Game.storageLevel() + 1;
    Game.toast(`📦 Storage upgraded: you can now keep ${next.cap} of every item.`, 'good', 'quiet');
    Game.emit('inv');
  };
  // Auto-sell is set per item in the Inventory. Every item is on the Wholesaler's default unless set otherwise:
  // S.autosell[id] = 'x' (off) or a number to keep; no entry (or an old 'd') means default.
  // The Wholesaler's default (S.wholesaler.keep) is a number, or null for half of storage.
  Game.wholesaleKeep = () => {
    const k = Game.S.wholesaler && Game.S.wholesaler.keep;
    return k == null ? Math.floor(Game.capacity() / 2) : Math.min(k, Game.capacity());
  };
  Game.autosellOf = (id) => { const v = (Game.S.autosell || {})[id]; return v === 'x' ? null : v == null ? 'd' : v; };
  // How many of an item the Wholesaler leaves in storage, or null when it isn't auto-sold.
  Game.sellKeep = (id) => {
    const v = Game.autosellOf(id);
    if (v == null) return null;
    if (v !== 'd') return Math.min(v, Game.capacity());
    const r = Game.keepRule(id);
    return r ? r.keep : Game.wholesaleKeep();
  };
  // Keep rules: items on Default that the Wholesaler holds back. S.wholesaler.rules[key] = 'all' (never sell),
  // a number to keep, or null (rule off). Menu dishes and feed always; winter crops only in autumn and winter.
  Game.KEEP_RULES = [
    { id: 'menu', name: 'Restaurant menu dishes', tip: 'Dishes on any of your restaurant menus, so guests never find them sold out.' },
    { id: 'feed', name: 'Animal feed', tip: 'Everything your animals eat (hay, grain, feed), so the herd gets through winter.' },
    { id: 'winter', name: 'Crops that rest in winter', tip: 'Fruit, honey and field crops that stop growing in winter. Only held back in autumn and winter, so you stock up before the cold.' },
  ];
  Game.keepRuleOf = (k) => { const r = Game.S.wholesaler && Game.S.wholesaler.rules; return r && k in r ? r[k] : 'all'; };
  let ruleSets = null;
  function keepSets() {
    const S = Game.S;
    if (ruleSets && ruleSets.t === S.time && ruleSets.n === S.buildings.length) return ruleSets;
    const menu = new Set(), feed = new Set(), mine = {};
    for (const r of Game.restaurants ? Game.restaurants() : []) for (const id of r.menu) menu.add(id);
    for (const b of S.buildings) {
      const rec = FS.recipeById[b.recipe];
      if (!rec) continue;
      if (FS.buildings[b.type].group === 'Animals') for (const i in rec.inputs) if (i !== 'water') feed.add(i);
      for (const o in rec.outputs) (mine[o] = mine[o] || []).push([b.type, rec.primary]);
    }
    return (ruleSets = { t: S.time, n: S.buildings.length, menu, feed, mine });
  }
  // Stops in winter: field (unless cold-hardy), orchard or apiary. Judged by your own buildings that make it,
  // or by every recipe for it when you make none (a greenhouse version keeps it off the list).
  const resting = (type, primary) => (SEASON_MULT[type] || [])[3] === 0 && !(type === 'field' && HARDY.has(primary));
  Game.restsInWinter = (id) => {
    const mine = keepSets().mine[id];
    if (mine) return mine.every(([t, p]) => resting(t, p));
    const rs = FS.byOutput[id] || [];
    return rs.length > 0 && rs.every((r) => resting(r.building, r.primary));
  };
  Game.keepRule = (id) => {
    const sets = keepSets(), cap = Game.capacity(), si = Game.seasonIndex();
    let best = null;
    for (const R of Game.KEEP_RULES) {
      const v = Game.keepRuleOf(R.id);
      if (v == null) continue;
      const hit = R.id === 'menu' ? sets.menu.has(id) : R.id === 'feed' ? sets.feed.has(id) || FS.items[id].cat === 'feed' : (si >= 2 && Game.restsInWinter(id));
      if (!hit) continue;
      const keep = v === 'all' ? cap : Math.min(v, cap);
      if (!best || keep > best.keep) best = { rule: R, keep };
    }
    return best;
  };
  Game.setKeepRule = function (k, v) {
    const ws = Game.S.wholesaler;
    if (!ws) return;
    ws.rules = ws.rules || {};
    ws.rules[k] = v == null ? null : v === 'all' ? 'all' : Math.max(0, Math.round(+v) || 0);
    Game.emit('inv');
  };
  // v: null = off, 'd' = default, number = keep that many.
  Game.setAutosell = function (id, v) {
    const S = Game.S;
    if (v != null && v !== 'd' && !Game.wholesalerLevel()) return Game.toast('Hire the 🚚 Wholesaler in the 🛖 Inventory first (after ' + Game.stageName('A') + ').', 'bad');
    S.autosell = S.autosell || {};
    if (v === 'd') delete S.autosell[id]; else S.autosell[id] = v == null ? 'x' : Math.max(0, Math.round(+v) || 0);
    Game.emit('inv');
  };
  Game.setWholesaleKeep = function (v) { if (Game.S.wholesaler) { Game.S.wholesaler.keep = v == null ? null : Math.max(0, Math.round(+v) || 0); Game.emit('inv'); } };
  // b.prio: 1 high, 0 normal (default), -1 low. A building never takes an input that a higher-priority building is waiting for.
  Game.PRIOS = [[1, 'High'], [0, 'Normal'], [-1, 'Low']];
  Game.setPrio = function (id, v) { const b = Game.S.buildings.find((x) => x.id === id); if (b) { b.prio = v; Game.emit('changed', b); } };
  // b.rate: production rate from 0.1 to 1 (default). Half of a building's upkeep is fixed, the other half scales with the rate,
  // so a building at half speed costs 75% upkeep: cheaper than a second building, but less efficient per item.
  // While the rate slider is dragged, Game.ratePreview = { id, v } shows its effect before it is applied on release.
  Game.ratePreview = null;
  Game.rateOf = (b) => (Game.ratePreview && Game.ratePreview.id === b.id ? Game.ratePreview.v : b.rate === undefined ? 1 : b.rate);
  Game.upkeepOf = (b) => (FS.buildings[b.type].upkeep || 0) * (0.5 + 0.5 * Game.rateOf(b));
  Game.setRate = function (id, v) {
    const b = Game.S.buildings.find((x) => x.id === id);
    if (!b) return;
    v = Math.min(1, Math.max(0.1, Math.round(v * 20) / 20));
    if (v === 1) delete b.rate; else b.rate = v;
    Game.ratePreview = null;
    Game.emit('changed', b);
  };
  // Set the production rate and/or priority on many buildings at once (undefined = leave as is).
  Game.setRateMany = function (ids, rate, prio) {
    const set = new Set(ids);
    for (const b of Game.S.buildings) {
      if (!set.has(b.id) || b.type === 'farmhouse' || b.type === 'academy') continue;
      if (rate !== undefined) { if (rate >= 1) delete b.rate; else b.rate = rate; }
      if (prio !== undefined) { if (prio) b.prio = prio; else delete b.prio; }
    }
    Game.emit('changed');
  };

  const NOSELL = new Set(['water']);

  // ---------- Proximity ----------
  // A building uses less of an input when a building set up to make that input stands close by:
  // 15% less next door or with one empty tile between them (diagonals count), 10% with 2-3 tiles between, 5% with 4-5.
  // Game.PROX is indexed by the number of empty tiles between the two footprints.
  // Only the closest maker of each input counts; several makers don't add up.
  Game.PROX = [0.15, 0.15, 0.1, 0.1, 0.05, 0.05];
  Game.gap = (ax, ay, aw, ah, bx, by, bw, bh) => Math.max(bx - (ax + aw), ax - (bx + bw), by - (ay + ah), ay - (by + bh), 0);
  // Discounts a building of this type at (x, y) making recipeId would get: { input: { d, from: buildingId } }.
  Game.proxAt = function (type, x, y, recipeId, selfId) {
    const r = FS.recipeById[recipeId], out = {};
    if (!r || !Object.keys(r.inputs).length) return out;
    const [w, h] = FS.buildings[type].size;
    for (const o of Game.S.buildings) {
      if (o.id === selfId) continue;
      const or = FS.recipeById[o.recipe];
      if (!or) continue;
      const [ow, oh] = FS.buildings[o.type].size;
      const d = Game.PROX[Game.gap(x, y, w, h, o.x, o.y, ow, oh)];
      if (!d) continue;
      for (const i in r.inputs) if (or.outputs[i] && d > (out[i] ? out[i].d : 0)) out[i] = { d, from: o.id };
    }
    return out;
  };
  // Buildings that a maker of recipeId at (x, y) would make better off: [{ id, item, d, was }].
  Game.proxHelps = function (type, x, y, recipeId, selfId) {
    const r = FS.recipeById[recipeId], out = [];
    if (!r) return out;
    const [w, h] = FS.buildings[type].size;
    for (const o of Game.S.buildings) {
      if (o.id === selfId) continue;
      const or = FS.recipeById[o.recipe];
      if (!or) continue;
      const [ow, oh] = FS.buildings[o.type].size;
      const d = Game.PROX[Game.gap(x, y, w, h, o.x, o.y, ow, oh)];
      if (!d) continue;
      // Compare with what the other building gets today from anyone but this one.
      const other = Game.proxAt(o.type, o.x, o.y, o.recipe, o.id);
      for (const i in or.inputs) if (r.outputs[i]) {
        const cur = other[i] && other[i].from !== selfId ? other[i].d : 0;
        if (d > cur) out.push({ id: o.id, item: i, d, was: cur });
      }
    }
    return out;
  };
  const proxCache = new Map();
  Game.prox = function (b) {
    const c = proxCache.get(b.id);
    if (c && c.v === proxVer && c.b === b) return c.m;
    const m = Game.proxAt(b.type, b.x, b.y, b.recipe, b.id);
    proxCache.set(b.id, { v: proxVer, b, m });
    return m;
  };
  // What the next batch takes of each input. The saved fraction carries over, so 15% off 10 milk takes 9, then 8, then 9…
  function batchInputs(b, r) {
    const p = Game.prox(b), take = {};
    for (const [i, q] of Object.entries(r.inputs)) {
      const d = p[i] ? p[i].d : 0;
      take[i] = d ? Math.max(0, q - Math.floor(((b.save && b.save[i]) || 0) + q * d + 1e-9)) : q;
    }
    return take;
  }
  Game.batchInputs = batchInputs;

  // ---------- Rates ----------
  // Items per minute made and used by every building that is set up and not paused, at today's growth speed.
  // This is capacity: a building that is waiting or full still counts, so it shows what the farm could do.
  Game.buildingRates = function (b) {
    const r = FS.recipeById[b.recipe], made = {}, used = {};
    if (!r || b.paused) return { made, used };
    const k = (60 / r.time) * (b.mult === undefined ? 1 : b.mult) * Game.rateOf(b);
    for (const [o, q] of Object.entries(r.outputs)) made[o] = q * k;
    const p = Game.prox(b);
    for (const [i, q] of Object.entries(r.inputs)) used[i] = q * (1 - (p[i] ? p[i].d : 0)) * k;
    return { made, used };
  };
  Game.rates = function () {
    const made = {}, used = {};
    for (const b of Game.S.buildings) {
      const x = Game.buildingRates(b);
      for (const o in x.made) made[o] = (made[o] || 0) + x.made[o];
      for (const i in x.used) used[i] = (used[i] || 0) + x.used[i];
    }
    return { made, used };
  };

  // ---------- Simulation ----------
  // Try to start a new batch: takes the inputs out of the warehouse. Returns true if it started.
  function tryStart(b, wanted) {
    const S = Game.S;
    const r = FS.recipeById[b.recipe];
    if (!r) { b.status = 'idle'; return false; }
    if (b.paused) { b.status = 'paused'; return false; }
    const gr = Game.growth(b);
    if (gr.m === 0) { b.status = 'season'; b.why = gr.why; b.cold = gr.cold; return false; }
    // Full only when every output (byproducts too) is at capacity, so a mill keeps making bran for the feed mill.
    // An item the Wholesaler is buying keeps its building going while he has room.
    const cap = Game.capacity();
    if (Object.keys(r.outputs).every((o) => (S.inv[o] || 0) >= cap && !Game.autoSold(o))) { b.status = 'full'; return false; }
    const take = batchInputs(b, r);
    const missing = Object.keys(take).filter((i) => (S.inv[i] || 0) < take[i]);
    const prio = b.prio || 0;
    if (missing.length) {
      b.status = 'missing'; b.missing = missing;
      for (const i of missing) wanted[i] = Math.max(wanted[i] ?? -9, prio);
      return false;
    }
    // Leave inputs for a higher-priority building that is waiting for them.
    const leave = Object.keys(r.inputs).filter((i) => (wanted[i] ?? -9) > prio);
    if (leave.length) { b.status = 'yield'; b.missing = leave; return false; }
    if (r.cost && S.money < r.cost) { b.status = 'nomoney'; return false; }
    const p = Game.prox(b);
    for (const [i, q] of Object.entries(take)) {
      S.inv[i] -= q;
      if (p[i]) { b.save = b.save || {}; b.save[i] = (b.save[i] || 0) + r.inputs[i] * p[i].d - (r.inputs[i] - q); }
    }
    b.took = take;
    S.money -= r.cost; S.stats.spent += r.cost; dayStats().running += r.cost;
    b.running = true; b.progress = 0; b.status = 'working'; b.missing = [];
    return true;
  }
  // Advance a running batch; delivers the outputs when done.
  function advance(b, dt) {
    const S = Game.S;
    const r = FS.recipeById[b.recipe];
    if (!r) { b.running = false; return; }
    b.progress += dt * (b.mult === undefined ? 1 : b.mult) * Game.rateOf(b);
    if (b.progress < r.time) return;
    const day = dayStats();
    const cap = Game.capacity();
    for (let [o, q] of Object.entries(r.outputs)) {
      // Storage is full: the extra is lost, unless the Wholesaler is taking this item away.
      if (!Game.autoSold(o)) q = Math.min(q, Math.max(0, cap - (S.inv[o] || 0)));
      if (!q) continue;
      addItem(o, q);
      S.stats.produced[o] = (S.stats.produced[o] || 0) + q;
      const i = FS.items[o];
      if (i.dish) (S.cookedAt = S.cookedAt || {})[o] = S.time; // restaurant guests notice food that has sat around
      day[i.dish ? 'dish' : i.raw ? 'raw' : 'proc'] += i.value * q;
    }
    b.running = false; b.progress = 0; delete b.took;
    Game.emit('produced', b, r);
  }

  // ---------- Wholesaler ----------
  // Unlocked by finishing stage A. Once hired, buildings set to sell their surplus hand it to the Wholesaler: he pays
  // `share` of the market price and buys at most `cap` coins' worth of goods per game minute. Each level costs `cost`.
  Game.WHOLESALER = { share: 0.8, levels: [{ cost: 1500, cap: 300 }, { cost: 4000, cap: 800 }, { cost: 10000, cap: 2000 }] };
  Game.wholesalerUnlocked = () => Game.stageDone('A');
  Game.wholesalerLevel = () => (Game.S.wholesaler ? Game.S.wholesaler.level : 0);
  Game.wholesalerCap = () => (Game.wholesalerLevel() ? Game.WHOLESALER.levels[Game.wholesalerLevel() - 1].cap : 0);
  // True while the Wholesaler is buying this item: set to auto-sell, keeping less than storage holds, and room in his budget.
  Game.autoSold = (id) => {
    if (NOSELL.has(id) || !Game.wholesalerLevel() || Game.S.wholesaler.off || Game.S.wholesaler.budget < 1) return false;
    const k = Game.sellKeep(id);
    return k != null && k < Game.capacity();
  };
  // What the Wholesaler would sell right now if he were on: [id, how many] above each item's keep amount.
  Game.wholesalePreview = () => Object.keys(Game.S.inv).filter((o) => FS.items[o] && !NOSELL.has(o) && Game.sellKeep(o) != null)
    .map((o) => [o, Math.floor(Game.S.inv[o] - Game.sellKeep(o))]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  // Pause or resume the Wholesaler; per-item settings stay as they are.
  Game.setWholesalerOn = function (on) { if (Game.S.wholesaler) { Game.S.wholesaler.off = !on; Game.emit('inv'); } };
  Game.hireWholesaler = function () {
    const S = Game.S, lvl = Game.wholesalerLevel(), next = Game.WHOLESALER.levels[lvl];
    if (!Game.wholesalerUnlocked()) return Game.toast(`Finish ${Game.stageName('A')} to hire the Wholesaler.`, 'bad');
    if (!next) return;
    if (S.money < next.cost) return Game.toast('Not enough money.', 'bad');
    S.money -= next.cost; S.stats.spent += next.cost; dayStats().build += next.cost;
    // A new Wholesaler starts paused: the player turns him on from a dialog that lists what he would sell (2026-10-12).
    S.wholesaler = { level: lvl + 1, budget: next.cap, turn: 0, keep: S.wholesaler ? S.wholesaler.keep : null, off: S.wholesaler ? S.wholesaler.off : true, rules: S.wholesaler ? S.wholesaler.rules : {} };
    Game.toast(lvl ? `🚚 The Wholesaler now buys up to 💰${next.cap} a minute.` : '🚚 Wholesaler hired.', 'good', 'quiet');
    Game.emit('inv');
    if (!lvl) Game.emit('wholesaler-hired');
  };
  // Every game second the Wholesaler collects surplus, taking turns between items while his minute's budget lasts.
  let wholesaleTimer = 0;
  function wholesale(dt) {
    const S = Game.S, ws = S.wholesaler;
    if (!ws || !ws.level) return;
    const cap = Game.wholesalerCap(), share = Game.WHOLESALER.share;
    ws.budget = Math.min(cap, ws.budget + (cap * dt) / 60);
    if (ws.off || (wholesaleTimer += dt) < 1) return;
    wholesaleTimer = 0;
    const list = Object.keys(S.inv).filter((o) => S.inv[o] > 0 && FS.items[o] && !NOSELL.has(o) && Game.sellKeep(o) != null);
    for (let k = 0; k < list.length && ws.budget >= 1; k++) {
      const o = list[(ws.turn + k) % list.length], keep = Game.sellKeep(o);
      const n = Math.min(Math.floor((S.inv[o] || 0) - keep), Math.floor(ws.budget / (Game.sellPrice(o) * share)));
      if (n > 0) { const v = Game.sell(o, n, share); ws.budget -= v; Game.emit('autosold', o, v); }
    }
    ws.turn = list.length ? (ws.turn + 1) % list.length : 0;
  }

  // NEW badges on build tiles: S.newB[type] holds the game time the building unlocked; the badge goes after a game day
  // (or when you build one). Older saves stored true, which starts the day now.
  function expireNewB() {
    const S = Game.S, nb = S.newB || {};
    let gone = false;
    for (const k in nb) {
      if (nb[k] === true) nb[k] = S.time;
      if (S.time - nb[k] >= DAY) { delete nb[k]; gone = true; }
    }
    if (gone) Game.emit('newB');
  }
  let goalTimer = 0;
  Game.tick = function (realDt) {
    const S = Game.S;
    if (!S || !S.speed) return;
    dayStats(); // opens the day's ledger with the cash on hand before anything changes it
    let dt = Math.min(realDt, 0.25) * S.speed;
    // Sub-step at high speed so short recipes don't lose time.
    const steps = Math.ceil(dt / 0.5);
    const sdt = dt / steps;
    rollWeather();
    expireNewB();
    for (const b of S.buildings) { const gr = Game.growth(b); b.mult = gr.m; b.why = gr.why; b.cold = gr.cold; }
    for (let k = 0; k < steps; k++) {
      S.time += sdt;
      const idle = [], done = new Set();
      for (const b of S.buildings) {
        if (b.running) { advance(b, sdt); if (!b.running) done.add(b); }
        if (!b.running) idle.push(b);
      }
      // Buildings that have waited longest for inputs pick first, so two buildings sharing an input take turns
      // instead of the first one on the list starving the other.
      // Higher priority goes first.
      idle.sort((a, c) => (c.prio || 0) - (a.prio || 0) || (c.wait || 0) - (a.wait || 0));
      const wanted = {};
      for (const b of idle) {
        if (tryStart(b, wanted)) { b.wait = 0; if (!done.has(b)) advance(b, sdt); }
        else b.wait = (b.wait || 0) + sdt;
      }
    }
    dispatch(dt);
    wholesale(dt);
    tickAcademy(dt);
    tickTown(dt);
    let upkeep = Game.townUpkeep();
    for (const b of S.buildings) upkeep += Game.upkeepOf(b);
    dayStats().upkeep += (upkeep * dt) / 60;
    S.money -= (upkeep * dt) / 60;
    winterWarning();
    for (const id in S.demand) {
      S.demand[id] += (1 - S.demand[id]) * Math.min(1, 0.004 * dt);
      if (S.demand[id] > 0.995) delete S.demand[id];
    }
    if (S.money < 150 && S.time - (S.lowMoneyAt || -1e9) > 180) {
      S.lowMoneyAt = S.time;
      Game.toast(S.money < 0
        ? 'You are in debt: you can’t build, import or open cuisines, and fields can’t buy seed. Sell surplus, or take a loan in the 🛖 Inventory’s Bank tab.'
        : `Money is running low. Sell surplus in the 🛖 Inventory${Game.wholesalerLevel() ? ', or turn on 🚚 auto-sell for items in the Inventory' : ', or deliver 📋 orders'}.`, 'bad', true);
    }
    if (!S.stats.orderCounter) firstOrder();
    S.orderTimer -= dt;
    if (S.orderTimer <= 0) { S.orderTimer = Game.orderGap(); newOrder(); }
    tickOrders();
    goalTimer += realDt;
    if (goalTimer > 1) { goalTimer = 0; checkGoals(); }
  };

  // ---------- Market ----------
  // Easter egg: tarte flambée inspired Root of All Dishes. Discovering it pays a bonus and makes it the house speciality.
  Game.SPECIAL = { id: 'tarte_flambee', bonus: 1500, priceMult: 1.5 };
  const specialMult = (id) => (id === Game.SPECIAL.id && Game.S.special ? Game.SPECIAL.priceMult : 1);
  function checkSpecial(id) {
    if (id !== Game.SPECIAL.id || Game.S.special) return;
    Game.S.special = true;
    Game.S.money += Game.SPECIAL.bonus; dayStats().bonus += Game.SPECIAL.bonus;
    Game.emit('easteregg', id);
  }
  Game.sellPrice = (id) => Math.max(0.05, FS.items[id].value * (Game.S.demand[id] || 1) * Game.seasonPrice(id) * specialMult(id) * Game.dishMult(id));
  Game.buyPrice = (id) => FS.items[id].value * 2.5 + 0.5;
  // Raw ingredients you have unlocked or had can be imported. So can the starter kit's processed goods (butter, bread,
  // yeast...) until you unlock a recipe for them: otherwise selling the kit would leave no way to make the first dishes.
  Game.starterImport = (id) => id in Game.START_KIT && !FS.items[id].raw && !FS.byOutput[id].some((r) => !r.dish && Game.recipeUnlocked(r.id));
  Game.canBuy = (id) => !FS.items[id].dish && ((!!FS.items[id].raw && Game.available(id)) || Game.starterImport(id));
  // mult: share of the market price paid (the Wholesaler pays less).
  Game.sell = function (id, qty, mult = 1) {
    const S = Game.S;
    qty = Math.min(qty, Math.floor(S.inv[id] || 0));
    if (qty <= 0) return 0;
    // The whole sale goes at the price shown before it; the market only reacts afterwards (one sale of 100 pays more
    // than ten sales of 10, on purpose).
    const total = Game.sellPrice(id) * mult * qty;
    S.demand[id] = Math.max(0.3, (S.demand[id] || 1) * Math.pow(0.985, qty));
    S.inv[id] -= qty;
    S.stats.sold += qty;
    earn(total, id, qty, 'sold');
    Game.emit('inv');
    return total;
  };
  // Income from sales and orders. A quarter of it pays off any loan. Also counts the farm's share for the day summary.
  function earn(total, id, qty, kind) {
    const S = Game.S, day = dayStats();
    S.money += total; S.stats.earned += total;
    day[kind] += total;
    const v = FS.items[id].value * qty;
    if (v > 0) day.farm += (FS.priceParts(id).farm * qty / v) * total;
    if (S.loan > 0) {
      const pay = Math.min(S.loan, total * Game.LOAN.repayShare);
      S.loan -= pay; S.money -= pay; day.repay += pay;
      if (S.loan < 0.5) { S.loan = 0; Game.toast('🏦 Loan fully repaid.', 'good', true); }
    }
  }
  // ---------- Bank ----------
  Game.LOAN = { step: 1000, fee: 0.1, max: 11000, repayShare: 0.25 };
  Game.borrow = function () {
    const S = Game.S, L = Game.LOAN, owe = L.step * (1 + L.fee);
    if ((S.loan || 0) + owe > L.max + 0.5) return Game.toast(`The bank lends at most 💰${L.max.toLocaleString('en-US')} in total.`, 'bad');
    S.loan = (S.loan || 0) + owe; S.money += L.step; dayStats().borrowed += L.step;
    Game.toast(`🏦 Borrowed 💰${L.step}. You owe 💰${Math.round(S.loan)}; a quarter of your income pays it back.`, 'good', 'quiet');
    Game.emit('inv');
  };
  Game.repay = function () {
    const S = Game.S, pay = Math.min(S.loan || 0, Math.max(0, S.money));
    if (pay <= 0) return Game.toast('Nothing to repay, or no money to repay with.', 'bad');
    S.loan -= pay; S.money -= pay; dayStats().repay += pay;
    if (S.loan < 0.5) S.loan = 0;
    Game.toast(S.loan ? `🏦 Repaid 💰${Math.round(pay)}. Still owed: 💰${Math.round(S.loan)}.` : '🏦 Loan fully repaid.', 'good');
    Game.emit('inv');
  };

  // ---------- Day summary & winter warning ----------
  function dayStats() {
    const S = Game.S;
    // Made today (stock value) and a cash ledger whose lines add up to the change in cash from start to end of day.
    const d = (S.day = S.day || { start: S.money });
    for (const k of Game.DAY_KEYS) if (d[k] === undefined) d[k] = 0;
    return d;
  }
  Game.DAY_KEYS = ['raw', 'proc', 'dish', 'farm', 'sold', 'orders', 'guests', 'bonus', 'borrowed', 'upkeep', 'running', 'build', 'buy', 'shop', 'repay'];
  // The day's numbers go to the journal as a little newspaper; a one-line toast points to it.
  function daySummary(dayIdx) {
    const S = Game.S, d = dayStats();
    S.day = null;
    d.end = S.money;
    if (d.raw + d.proc + d.dish + d.sold + d.orders + d.guests < 1) return;
    Game.journal({ type: 'day', day: dayIdx + 1, d });
    Game.emit('toast', `📰 The Day ${dayIdx + 1} report is in your farm journal.`, 'season', false);
  }
  // A day before winter: how long the animals' feed lasts.
  function winterWarning() {
    const S = Game.S, year = Math.floor(S.time / (SEASON_LEN * 4));
    if (Game.seasonIndex() !== 2 || Game.seasonLeft() > DAY || S.winterWarned === year) return;
    S.winterWarned = year;
    const used = {};
    for (const b of S.buildings) if (FS.buildings[b.type].group === 'Animals') {
      const x = Game.buildingRates(b);
      for (const i in x.used) if (i !== 'water') used[i] = (used[i] || 0) + x.used[i];
    }
    const feed = Object.entries(used).filter(([, u]) => u > 0)
      .map(([i, u]) => `${FS.items[i].name} (${Math.floor(S.inv[i] || 0)} in stock lasts about ${Math.round((S.inv[i] || 0) / u)} min)`);
    Game.journal({ type: 'msg', kind: 'season', text: `❄️ Winter starts in a day: most fields and orchards will stop growing.${feed.length ? ' Your animals eat ' + feed.join('; ') + '.' : ''} Stock up on hay, grain and preserves.` });
    Game.emit('toast', '❄️ Winter starts in a day. Check your feed stock in the 📰 journal.', 'season', true);
  }

  Game.buy = function (id, qty) {
    const S = Game.S;
    let cost = Game.buyPrice(id) * qty;
    if (!Game.canBuy(id)) return Game.toast('Only raw ingredients you have unlocked (and starter goods you can\'t make yet) can be imported.', 'bad');
    if (qty > Game.room(id)) {
      qty = Game.room(id);
      if (!qty) return Game.toast(`Storage is full: you can keep ${Game.capacity()} of each item. Upgrade it in the 🛖 Inventory with 🎩 toques.`, 'bad');
      cost = Game.buyPrice(id) * qty;
    }
    if (S.money < cost) return Game.toast('Not enough money.', 'bad');
    S.money -= cost; S.stats.spent += cost; dayStats().buy += cost;
    addItem(id, qty);
    Game.emit('inv');
  };

  // ---------- Orders ----------
  // Orders grow with the stages (o.kind):
  //   A  plain, bulk and special requests (an undiscovered dish, pays a toque);
  //   B+ regulars (one per cuisine, friendship levels) and clue orders ("something sweet with apple");
  //   C+ deadline contracts paid per delivery, and events wanting dishes from two cuisines;
  //   D+ supply contracts (a cuisine's goods every day for 3 days), party menus over three cuisines, seasonal customers.
  // Dishes are only ordered from open cuisines, and special requests and clues prefer the current stage.
  // What changes in 📋 Orders when a stage is finished (keyed by the stage just finished).
  Game.ORDER_NEWS = {
    A: '📋 New customers: each new cuisine brings a ❤️ regular who orders its food and grows fond of you, and 🔍 clue orders describe a dish without naming it.',
    B: '📋 Bigger business: ⏳ contracts want large batches over two days, and 🎉 events order dishes from two cuisines. Clue orders now pay 2 🎩.',
    C: '📋 Big clients: 🚛 supply contracts want a cuisine\'s goods every day for three days, 🥂 party menus span three cuisines, and seasonal customers come in summer and winter.',
  };
  Game.orderTier = () => Math.min(3, FS.STAGES.indexOf(Game.currentStage()));
  const ORDER_MAX = [4, 5, 6, 7], ORDER_GAP = [[60, 60], [50, 50], [40, 45], [35, 40]];
  Game.orderGap = () => { const [a, b] = ORDER_GAP[Game.orderTier()]; return a + Math.random() * b; };
  const VILLAGE = ['Village Inn', 'School Canteen', 'Harbour Bistro', 'Grand Hotel', 'Food Truck', 'Corner Café', 'Market Stall', 'Train Station Kiosk', 'Old Mill Tearoom', 'Bakery Café'];
  const EVENTS = ['Wedding Party', 'Village Fête', 'Harvest Festival', 'Birthday Party', 'Christening Lunch'];
  const MENUS = ['Gala Dinner', 'Embassy Reception', 'Film Premiere Party', 'Charity Ball', 'Company Summer Party'];
  const pickOne = (a) => a[(Math.random() * a.length) | 0];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const DAY_LEN = DAY;

  // Regulars: one per cuisine from stage B on. Each delivery is a point of friendship; levels raise order size and pay,
  // and from level 3 they tip a toque now and then.
  Game.REGULARS = [
    { id: 'red_lion', name: 'The Red Lion', kind: 'pub', cuisine: 'british_irish' },
    { id: 'petit_bistro', name: 'Le Petit Bistro', kind: 'bistro', cuisine: 'french_belgian' },
    { id: 'bierhalle', name: 'Bierhalle Edelweiss', kind: 'beer hall', cuisine: 'german_austrian_hungarian' },
    { id: 'trattoria', name: 'Trattoria da Nonna', kind: 'trattoria', cuisine: 'italian' },
    { id: 'meze_house', name: 'The Meze House', kind: 'taverna', cuisine: 'mediterranean_middle_eastern' },
    { id: 'world_market', name: 'World Food Market', kind: 'street food market', cuisine: 'around_the_world' },
    { id: 'golden_dragon', name: 'Golden Dragon', kind: 'noodle bar', cuisine: 'east_asian' },
    { id: 'spice_route', name: 'Spice Route', kind: 'curry house', cuisine: 'south_southeast_asian' },
    { id: 'route66', name: 'Route 66 Diner', kind: 'diner', cuisine: 'the_americas' },
  ];
  Game.REG_LEVELS = [0, 3, 7, 12, 20];
  Game.regular = (id) => Game.REGULARS.find((r) => r.id === id);
  Game.regularXp = (id) => ((Game.S.regulars || {})[id] || 0);
  Game.regularLevel = (id) => Game.REG_LEVELS.filter((x) => Game.regularXp(id) >= x).length;
  // Tips: every 3rd delivery from level 3, every 2nd at level 5.
  Game.regularTipEvery = (lv) => (lv >= 5 ? 2 : lv >= 3 ? 3 : 0);
  // A regular comes once their cuisine is open (stage B on) and you have cooked one of its dishes.
  Game.regularsActive = () => Game.REGULARS.filter((r) => Game.S.cuisines[r.cuisine] && regularPool(r).length);
  const producedIds = () => Object.keys(Game.S.stats.produced).filter((id) => FS.items[id] && FS.items[id].cat !== 'livestock' && (!FS.items[id].dish || Game.S.discovered[id]));
  const dishOpen = (id) => !!Game.S.cuisines[FS.cuisineOf(id).id];
  function regularPool(r) {
    const c = FS.cuisineById[r.cuisine], prod = new Set(producedIds());
    const dishes = c.dishIds.filter((id) => prod.has(id));
    if (!dishes.length) return [];
    const ins = [...new Set(FS.dishItems(c.dishIds))].filter((id) => prod.has(id) && !FS.items[id].raw);
    return dishes.concat(ins);
  }

  // ----- Clues -----
  // A clue describes a dish without naming it; any dish that fits is accepted (o.matches, fixed when the order comes).
  const MEATY = new Set(['meat', 'charcuterie', 'seafood']);
  const STOP = new Set(['livestock', 'feed', 'dairy', 'egg', 'cheese']);
  const BORING = new Set(['water', 'salt', 'sea_salt', 'black_pepper', 'white_sugar']);
  const meatyMemo = {};
  // Meat or fish anywhere in the dish's ingredients or what they are made of (not counting what the animals eat).
  function meaty(id) {
    if (meatyMemo[id] !== undefined) return meatyMemo[id];
    const seen = new Set();
    const walk = (i) => {
      if (seen.has(i)) return false;
      seen.add(i);
      const it = FS.items[i];
      if (MEATY.has(it.cat)) return true;
      if (STOP.has(it.cat) || it.raw) return false;
      const r = it.dish ? FS.dishRecipe[i] : it.bestRecipe;
      return !!r && Object.keys(r.inputs).some(walk);
    };
    return (meatyMemo[id] = walk(id));
  }
  const DRINK_EMOJI = new Set(['☕', '🍵', '🫖', '🍹', '🍷', '🥤', '🧋', '🍸', '🍺']);
  const isDrink = (d) => DRINK_EMOJI.has(d.emoji) || /latte|lassi|lemonade|cordial|milkshake|smoothie|hot chocolate|\btea\b|chai|mulled|sangria/i.test(d.name);
  const isSoup = (d) => /soup|stew|chowder|broth|bisque|gazpacho|borscht|ramen|phở|udon|soba|tom yum|tom kha|minestrone|okroshka|pottage|goulash|gumbo|pozole|jjigae|laksa|sinigang|jhol/i.test(d.name);
  const KINDS = {
    soup: { noun: 'a soup or stew', test: isSoup },
    drink: { noun: 'a drink', test: isDrink },
    sweet: { noun: 'something sweet', test: (d) => !isDrink(d) && !meaty(d.id) && Object.keys(FS.dishRecipe[d.id].inputs).some((i) => FS.items[i].cat === 'sugar' || /chocolate|cocoa/.test(i)) },
    salad: { noun: 'a salad', test: (d) => /salad|slaw|tabbouleh|fattoush|som tam/i.test(d.name) },
    sandwich: { noun: 'a sandwich, toast or wrap', test: (d) => /sandwich|toast|roll\b|bagel|burger|bánh mì|burrito|wrap|shawarma|hot dog|sabich|taco/i.test(d.name) },
  };
  Game.dishKind = (d, k) => KINDS[k].test(d);
  Game.meaty = meaty;
  const CATS = { cheese: 'cheese', seafood: 'fish or seafood', mushroom: 'mushrooms', nut: 'nuts', legume: 'beans, peas or lentils', citrus: 'citrus fruit', berry: 'berries', pasta: 'pasta or noodles', bread: 'bread or dough', charcuterie: 'cured meat or sausage', spiceblend: 'a spice blend' };
  // Conditions are data so orders can be saved: {t: 'kind'|'item'|'cat'|'veg'|'long', v}.
  function condTest(c, d) {
    const ins = Object.keys(FS.dishRecipe[d.id].inputs);
    switch (c.t) {
      case 'kind': return KINDS[c.v].test(d);
      case 'item': return ins.includes(c.v);
      case 'cat': return ins.some((i) => FS.items[i].cat === c.v);
      case 'veg': return !meaty(d.id);
      case 'long': return FS.complexity(d.id).rawCount >= 15;
    }
    return false;
  }
  function clueText(conds) {
    const kind = conds.find((c) => c.t === 'kind');
    const withs = conds.filter((c) => c.t !== 'kind').map((c) =>
      c.t === 'item' ? FS.items[c.v].name.toLowerCase() : c.t === 'cat' ? CATS[c.v] : c.t === 'veg' ? 'no meat or fish' : '15 or more farm ingredients behind it');
    return (kind ? KINDS[kind.v].noun : 'a dish') + (withs.length ? ' with ' + withs.join(' and ') : '');
  }
  // Every condition the anchor dish fits, then one or two of them combined so that only a handful of dishes fit.
  function makeClue(anchor) {
    const d = FS.items[anchor], ins = Object.keys(FS.dishRecipe[anchor].inputs);
    const conds = [];
    for (const k in KINDS) if (KINDS[k].test(d)) conds.push({ t: 'kind', v: k });
    for (const i of ins) if (!BORING.has(i) && FS.items[i].cat !== 'mineral') conds.push({ t: 'item', v: i });
    for (const c of new Set(ins.map((i) => FS.items[i].cat))) if (CATS[c]) conds.push({ t: 'cat', v: c });
    if (!meaty(anchor)) conds.push({ t: 'veg' });
    if (FS.complexity(anchor).rawCount >= 15) conds.push({ t: 'long' });
    const pool = FS.dishList.filter((x) => dishOpen(x.id));
    const options = [];
    const consider = (cs) => {
      if (cs.filter((c) => c.t === 'kind').length > 1) return;
      const matches = pool.filter((x) => cs.every((c) => condTest(c, x))).map((x) => x.id);
      if (matches.length >= 1 && matches.length <= 6) options.push({ cs, matches, score: (matches.length >= 2 && matches.length <= 4 ? 2 : 1) + (cs.some((c) => c.t === 'kind') ? 0.5 : 0) + Math.random() });
    };
    for (let a = 0; a < conds.length; a++) {
      consider([conds[a]]);
      for (let b = a + 1; b < conds.length; b++) consider([conds[a], conds[b]].sort((x, y) => (x.t === 'kind' ? -1 : y.t === 'kind' ? 1 : 0)));
    }
    if (!options.length) return null;
    options.sort((x, y) => y.score - x.score);
    return { conds: options[0].cs, matches: options[0].matches, text: clueText(options[0].cs) };
  }

  // ----- Making orders -----
  // Undiscovered dishes worth asking for: current stage first, then any cuisine still short of its target.
  function wishList() {
    const S = Game.S, cur = Game.currentStage();
    const wish = FS.dishList.filter((d) => !S.discovered[d.id] && Game.dishVisible(d.id));
    const now = wish.filter((d) => FS.cuisineOf(d.id).stage === cur.id && !(S.cuisineDone || {})[FS.cuisineOf(d.id).id]);
    const ahead = wish.filter((d) => !(S.cuisineDone || {})[FS.cuisineOf(d.id).id]);
    return now.length ? now : ahead.length ? ahead : wish;
  }
  const qtyFor = (it, lo, span) => Math.max(1, Math.round((lo + Math.random() * span) * (it.dish ? 0.5 : 1)));
  const MAKERS = {
    special() {
      const from = wishList();
      if (!from.length || Game.S.orders.some((o) => o.kind === 'special')) return null;
      const d = pickOne(from), qty = 1 + (Math.random() < 0.4 ? 1 : 0);
      return { kind: 'special', item: d.id, qty, who: pickOne(VILLAGE), reward: Math.round(d.value * qty * 3 + 150), toques: 1, expires: Game.S.time + 1800 + Math.random() * 600 };
    },
    plain(bulk) {
      const pool = producedIds().filter((id) => !FS.items[id].raw && (!FS.items[id].dish || dishOpen(id)));
      const dishes = pool.filter((id) => FS.items[id].dish);
      const pick = dishes.length && Math.random() < 0.55 ? dishes : pool;
      if (!pick.length) return null;
      const id = pickOne(pick), it = FS.items[id];
      const qty = bulk ? qtyFor(it, 12, 14) : qtyFor(it, 2, 6);
      return { kind: bulk ? 'bulk' : 'plain', item: id, qty, who: pickOne(VILLAGE), reward: Math.round(it.value * qty * (bulk ? 2.3 : 1.9) + (bulk ? 60 : 25)),
        expires: Game.S.time + (bulk ? 1500 : 420) + Math.random() * 240 };
    },
    bulk() { return MAKERS.plain(true); },
    regular() {
      const regs = Game.regularsActive();
      if (!regs.length) return null;
      // Prefer a regular whose cuisine belongs to the stage you are working on.
      const cur = Game.currentStage(), near = regs.filter((r) => FS.cuisineById[r.cuisine].stage === cur.id);
      const r = pickOne(near.length && Math.random() < 0.7 ? near : regs), lv = Game.regularLevel(r.id);
      const id = pickOne(regularPool(r)), it = FS.items[id];
      const qty = Math.round(qtyFor(it, 2, 6) * (1 + 0.25 * (lv - 1)));
      return { kind: 'regular', reg: r.id, item: id, qty, who: r.name, reward: Math.round((it.value * qty * 2 + 30) * (1 + 0.1 * (lv - 1))), expires: Game.S.time + 600 + Math.random() * 300 };
    },
    clue() {
      const S = Game.S;
      if (S.orders.filter((o) => o.kind === 'clue').length >= 2) return null;
      // The clue is built around a dish you haven't discovered yet when there is one, so it leads somewhere new.
      const wish = wishList(), known = FS.dishList.filter((d) => Game.dishVisible(d.id) && dishOpen(d.id));
      for (let k = 0; k < 6; k++) {
        const from = wish.length && k < 4 ? wish : known;
        if (!from.length) break;
        const anchor = pickOne(from);
        const clue = makeClue(anchor.id);
        if (!clue) continue;
        const reg = Game.regularsActive().find((r) => r.cuisine === FS.cuisineOf(anchor.id).id);
        const tier = Game.orderTier(), qty = tier >= 3 && Math.random() < 0.5 ? 2 : 1;
        const avg = clue.matches.reduce((n, id) => n + FS.items[id].value, 0) / clue.matches.length;
        return { kind: 'clue', clue: clue.text, conds: clue.conds, matches: clue.matches, qty, who: reg ? reg.name : pickOne(VILLAGE), reg: reg && reg.id,
          reward: Math.round(avg * qty * 3 + 120), toques: [1, 1, 2, 3][tier], expires: S.time + 1500 + Math.random() * 600 };
      }
      return null;
    },
    // A big batch of one product over two days; each delivery is paid at once, finishing it pays a bonus and a toque.
    contract() {
      const pool = producedIds().filter((id) => !FS.items[id].raw && !FS.items[id].dish && !BORING.has(id));
      if (!pool.length) return null;
      const id = pickOne(pool), it = FS.items[id];
      const qty = Math.round(Math.min(150, Math.max(30, 500 / (it.value + 2))) / 5) * 5;
      return { kind: 'contract', item: id, qty, done: 0, who: pickOne(VILLAGE), unit: Math.round(it.value * 1.4 * 100) / 100,
        reward: Math.round(it.value * qty * 0.7 + 150), toques: 1, expires: Game.S.time + 2 * DAY_LEN };
    },
    // Events want several dishes you have cooked, from two cuisines (three for party menus in stage D).
    event(menu) {
      const S = Game.S;
      if (S.orders.some((o) => o.kind === 'event' || o.kind === 'menu')) return null;
      const byC = {};
      for (const id of producedIds()) if (FS.items[id].dish && dishOpen(id)) (byC[FS.cuisineOf(id).id] = byC[FS.cuisineOf(id).id] || []).push(id);
      const cs = shuffle(Object.keys(byC));
      const nC = Math.min(cs.length, menu ? 3 : 2);
      if (nC < 2) return null;
      const lines = [], want = menu ? 4 + (Math.random() < 0.5 ? 1 : 0) : 3;
      for (let k = 0; lines.length < want && k < 20; k++) {
        const list = byC[cs[k % nC]], id = pickOne(list);
        if (!lines.some((l) => l.item === id)) lines.push({ item: id, qty: menu ? 2 + ((Math.random() * 3) | 0) : 2 + (Math.random() < 0.5 ? 1 : 0) });
      }
      if (lines.length < 3) return null;
      const value = lines.reduce((n, l) => n + FS.items[l.item].value * l.qty, 0);
      return { kind: menu ? 'menu' : 'event', lines, who: pickOne(menu ? MENUS : EVENTS), cuisines: cs.slice(0, nC),
        reward: Math.round(value * 2.6 + (menu ? 600 : 300)), toques: menu ? 3 : 2, expires: S.time + 900 + Math.random() * 300 };
    },
    menu() { return MAKERS.event(true); },
    // Supply contract: three goods one cuisine's kitchens need, a quota every day for 3 days. Each day met pays,
    // and all three met pays a bonus and toques.
    supply() {
      const S = Game.S;
      if (S.orders.some((o) => o.kind === 'supply')) return null;
      const prod = new Set(producedIds());
      const options = FS.CUISINES.filter((c) => S.cuisines[c.id]).map((c) => ({ c, items: [...new Set(FS.dishItems(c.dishIds))].filter((i) => prod.has(i) && !BORING.has(i) && FS.items[i].cat !== 'mineral') }))
        .filter((x) => x.items.length >= 3);
      if (!options.length) return null;
      const cur = Game.currentStage(), near = options.filter((x) => x.c.stage === cur.id);
      const { c, items } = pickOne(near.length ? near : options);
      // Prefer processed goods (tortillas, coconut milk) over raw crops.
      const picked = shuffle(items.filter((i) => !FS.items[i].raw)).concat(shuffle(items.filter((i) => FS.items[i].raw))).slice(0, 3);
      const lines = picked.map((i) => ({ item: i, qty: Math.round(Math.min(40, Math.max(8, 150 / (FS.items[i].value + 1)))) }));
      const reg = Game.REGULARS.find((r) => r.cuisine === c.id);
      const dayPay = Math.round(lines.reduce((n, l) => n + FS.items[l.item].value * l.qty, 0) * 1.8 + 60);
      return { kind: 'supply', lines, got: {}, day: 0, days: 3, met: 0, paidDay: false, dayEnd: S.time + DAY_LEN, cuisine: c.id,
        who: reg ? reg.name : 'City Restaurant Group', reg: reg && reg.id, dayPay, reward: dayPay, toques: 2, expires: S.time + 3 * DAY_LEN };
    },
    // Seasonal customers in stage D: the Ski Lodge in winter wants warming food, the Beach Bar in summer cool food.
    seasonal() {
      const si = Game.seasonIndex();
      if (si !== 1 && si !== 3) return null;
      const dishes = producedIds().filter((id) => FS.items[id].dish && dishOpen(id));
      if (!dishes.length) return null;
      const winter = si === 3;
      const fits = dishes.filter((id) => (winter ? isSoup(FS.items[id]) || /hot chocolate|tea|chai|latte|mulled|fondue|raclette/i.test(FS.items[id].name)
        : isDrink(FS.items[id]) || KINDS.salad.test(FS.items[id]) || /ice cream|sorbet|lassi|ceviche|sushi|poke/i.test(FS.items[id].name)));
      const id = pickOne(fits.length ? fits : dishes), it = FS.items[id], qty = qtyFor(it, 4, 6);
      return { kind: 'seasonal', item: id, qty, who: winter ? 'Ski Lodge' : 'Beach Bar', season: winter ? 'winter' : 'summer',
        reward: Math.round(it.value * qty * 2.6 + 60), expires: Game.S.time + 600 + Math.random() * 240 };
    },
  };
  // Chance of each kind per tier (whatever is left is a plain order).
  const ORDER_MIX = [
    { special: 0.2, bulk: 0.15 },
    { special: 0.15, clue: 0.15, regular: 0.3, bulk: 0.1 },
    { special: 0.1, clue: 0.2, contract: 0.12, event: 0.1, regular: 0.25, bulk: 0.05 },
    { special: 0.1, clue: 0.15, supply: 0.12, menu: 0.1, contract: 0.06, seasonal: 0.08, regular: 0.22 },
  ];
  // kind forces one kind (cheat console); returns the order or null.
  function newOrder(kind) {
    const S = Game.S, tier = Game.orderTier();
    if (!kind && S.orders.length >= ORDER_MAX[tier]) return null;
    if (!kind && !Game.ordersOpen()) return null;
    if (!kind) {
      let roll = Math.random();
      for (const [k, p] of Object.entries(ORDER_MIX[tier])) { if (roll < p) { kind = k; break; } roll -= p; }
    }
    const o = (kind && MAKERS[kind] && MAKERS[kind]()) || MAKERS.plain();
    if (!o) return null;
    S.stats.orderCounter = (S.stats.orderCounter || 0) + 1;
    o.id = S.stats.orderCounter;
    o.since = S.time;
    S.orders.push(o);
    Game.emit('orders');
    return o;
  }
  Game.newOrder = newOrder;
  // The very first customer turns up as soon as one of your buildings is set to make an ingredient (not a raw crop),
  // and wants that ingredient: a few more than you have, so you deliver something you made yourself.
  function firstOrder() {
    const S = Game.S;
    const b = S.buildings.find((x) => { const r = x.recipe && FS.recipeById[x.recipe]; return r && !r.dish && !FS.items[r.primary].raw; });
    if (!b) return;
    const id = FS.recipeById[b.recipe].primary, it = FS.items[id];
    const qty = Math.min(25, Math.floor(S.inv[id] || 0) + 5);
    S.stats.orderCounter = 1;
    S.orders.push({ kind: 'plain', item: id, qty, who: pickOne(VILLAGE), reward: Math.round(it.value * qty * 1.9 + 40), id: 1, since: S.time, expires: S.time + 1800 });
    S.orderTimer = Game.orderGap();
    Game.emit('orders');
    Game.emit('unlock', 'orders');
  }

  // ----- Delivering -----
  // keep: stock held back while the Dispatcher delivers (0 when you deliver by hand).
  let keep = 0, dispatching = false;
  const can = (id, q = 1) => (Game.S.inv[id] || 0) - keep >= q;
  const left = (id) => Math.max(0, Math.floor((Game.S.inv[id] || 0) - keep));
  // Which dishes in stock fit a clue order.
  Game.clueFits = (o) => o.matches.filter((id) => can(id, o.qty));
  // What a supply order still needs today, line by line.
  Game.supplyLeft = (o, l) => Math.max(0, l.qty - ((o.got || {})[l.item] || 0));
  // Can the order (or a part of it, for contracts) be delivered from stock now?
  Game.orderReady = function (o) {
    switch (o.kind) {
      case 'clue': return Game.clueFits(o).length > 0;
      case 'contract': return can(o.item, 1);
      case 'event': case 'menu': return o.lines.every((l) => can(l.item, l.qty));
      case 'supply': return !o.paidDay && o.lines.some((l) => Game.supplyLeft(o, l) > 0 && can(l.item, 1));
    }
    return can(o.item, o.qty);
  };
  function take(id, q) { Game.S.inv[id] -= q; }
  function closeOrder(o) {
    const S = Game.S;
    S.orders = S.orders.filter((x) => x !== o);
    S.stats.ordersDone++;
  }
  // msg: null for a part delivery the Dispatcher makes (no toast).
  function paid(o, coins, toques, item, qty, msg) {
    toques = toques || 0;
    if (dispatching && Game.S.dispatcher) {
      o.disp = true;
      // The Dispatcher keeps his commission and every other toque (the odd one carries over to the next order).
      const D = Game.S.dispatcher, cut = coins * Game.DISPATCHER.cut, n = toques + (D.half || 0);
      coins -= cut; D.half = n % 2; D.kept += toques - Math.floor(n / 2);
      toques = Math.floor(n / 2);
      D.done++; D.earned += coins; D.fee += cut;
    }
    earn(coins, item, qty, 'orders');
    if (toques) Game.addToques(toques);
    // Only the Dispatcher's deliveries get a toast; one you make yourself is just kept in the journal (you saw it happen).
    if (msg) {
      const text = `${dispatching ? '📦' : '📋'} ${msg}: +${Math.round(coins)} coins${toques ? ` and +${toques} 🎩` : ''}`;
      if (dispatching) Game.toast(text, 'good', 'quiet');
      else Game.journal({ type: 'msg', kind: 'good', text, quiet: true });
    }
  }
  // A delivery to a regular: friendship, a level up now and then, and tips from level 3.
  function befriend(regId) {
    if (!regId) return 0;
    const S = Game.S, before = Game.regularLevel(regId);
    S.regulars = S.regulars || {};
    S.regulars[regId] = (S.regulars[regId] || 0) + 1;
    const lv = Game.regularLevel(regId), r = Game.regular(regId), every = Game.regularTipEvery(lv);
    if (lv > before) Game.toast(`❤️ ${r.name} is now a level ${lv} regular: ${lv >= 3 ? 'bigger orders, and they tip toques' : 'bigger orders and better pay'}.`, 'good', 'quiet');
    return every && S.regulars[regId] % every === 0 ? 1 : 0;
  }
  // pick: the dish to hand over for a clue order.
  Game.fulfil = function (orderId, pick) {
    const S = Game.S;
    const o = S.orders.find((x) => x.id === orderId);
    if (!o) return;
    const name = (id) => FS.items[id].name;
    if (o.kind === 'clue') {
      // Without a pick, the dish you have most of.
      const id = pick && o.matches.includes(pick) ? pick : Game.clueFits(o).sort((x, y) => (S.inv[y] || 0) - (S.inv[x] || 0))[0];
      if (!id || !can(id, o.qty)) return Game.toast(`No dish in stock fits “${o.clue}”.`, 'bad');
      take(id, o.qty); closeOrder(o);
      const tip = befriend(o.reg);
      paid(o, o.reward, o.toques + tip, id, o.qty, `${o.who} loved the ${name(id)}${tip ? ' and left a tip' : ''}`);
    } else if (o.kind === 'contract') {
      const n = Math.min(o.qty - o.done, left(o.item));
      if (n <= 0) return Game.toast(`You have no ${name(o.item)} to deliver.`, 'bad');
      take(o.item, n); o.done += n;
      if (o.done >= o.qty) { closeOrder(o); paid(o, n * o.unit + o.reward, o.toques, o.item, n, `Contract with ${o.who} complete`); }
      else paid(o, n * o.unit, 0, o.item, n, dispatching ? null : `Delivered ${n}× ${name(o.item)} to ${o.who} (${o.done} / ${o.qty})`);
    } else if (o.kind === 'event' || o.kind === 'menu') {
      if (!Game.orderReady(o)) return Game.toast('You need every dish on the list to deliver.', 'bad');
      for (const l of o.lines) take(l.item, l.qty);
      closeOrder(o);
      paid(o, o.reward, o.toques, o.lines[0].item, o.lines[0].qty, `The ${o.who} was a success`);
    } else if (o.kind === 'supply') {
      if (o.paidDay) return;
      o.got = o.got || {};
      let n = 0;
      for (const l of o.lines) {
        const q = Math.min(Game.supplyLeft(o, l), left(l.item));
        if (q > 0) { take(l.item, q); o.got[l.item] = (o.got[l.item] || 0) + q; n += q; }
      }
      if (!n) return Game.toast('Nothing in stock that this contract still needs today.', 'bad');
      if (o.lines.every((l) => !Game.supplyLeft(o, l))) {
        o.paidDay = true; o.met++;
        S.stats.ordersDone++;
        paid(o, o.dayPay, befriend(o.reg), o.lines[0].item, o.lines[0].qty, `${o.who}: day ${o.day + 1} of ${o.days} supplied`);
      } else if (!dispatching) Game.journal({ type: 'msg', kind: '', text: `📦 Delivered ${n} goods to ${o.who}; the rest of today's quota is still open.`, quiet: true });
    } else {
      if (!can(o.item, o.qty)) return Game.toast(`You need ${o.qty}× ${name(o.item)}.`, 'bad');
      take(o.item, o.qty); closeOrder(o);
      const tip = o.kind === 'regular' ? befriend(o.reg) : 0;
      paid(o, o.reward, (o.toques || 0) + tip, o.item, o.qty, `Order delivered to ${o.who}${tip ? ', who left a tip' : ''}`);
    }
    Game.emit('orders'); Game.emit('inv');
  };
  // Supply contracts roll over each game day; everything else simply expires.
  function tickOrders() {
    const S = Game.S;
    let changed = false;
    for (const o of S.orders) {
      if (o.kind !== 'supply' || S.time < o.dayEnd) continue;
      changed = true;
      if (!o.paidDay) Game.toast(`📦 ${o.who} didn't get day ${o.day + 1}'s supplies.`, 'bad', true);
      o.day++; o.got = {}; o.paidDay = false; o.dayEnd += DAY_LEN;
      if (o.day >= o.days) {
        o.done = true;
        // The bonus is shared with the Dispatcher if he made any of the deliveries.
        dispatching = !!o.disp;
        if (o.met === o.days) paid(o, o.reward, o.toques, o.lines[0].item, o.lines[0].qty, `Supply contract with ${o.who} fulfilled every day: bonus`);
        dispatching = false;
      }
    }
    const before = S.orders.length;
    S.orders = S.orders.filter((o) => (o.kind === 'supply' ? !o.done : o.expires > S.time));
    if (changed || S.orders.length !== before) Game.emit('orders');
  }

  // ---------- Dispatcher ----------
  // Unlocked by the goal of cooking every dish in 3 cuisines. Once hired (money and toques), he delivers every order
  // that stock allows, never touching the last `keep` of any good. He keeps `cut` of the coins and every other toque,
  // so delivering by hand still pays best. Order types can be left to the player.
  Game.DISPATCHER = { cost: 3000, toques: 5, cut: 0.1, keeps: [0, 5, 10, 25, 50], every: 2 };
  // tier: the order tier (stage) from which a group of order types turns up.
  Game.DISPATCH_GROUPS = [
    { id: 'everyday', name: '📋 Everyday orders', kinds: ['plain', 'bulk', 'regular', 'seasonal'], tier: 0 },
    { id: 'special', name: '⭐ Special requests', kinds: ['special'], tier: 0 },
    { id: 'clue', name: '🔍 Clue orders', kinds: ['clue'], tier: 1 },
    { id: 'contract', name: '⏳ Contracts and 🚛 supply', kinds: ['contract', 'supply'], tier: 2 },
    { id: 'event', name: '🎉 Events and 🥂 party menus', kinds: ['event', 'menu'], tier: 2 },
  ];
  Game.dispatcherUnlocked = () => !!Game.S.goalsDone.gold3;
  Game.dispatcherHired = () => !!Game.S.dispatcher;
  Game.dispatchGroup = (kind) => Game.DISPATCH_GROUPS.find((g) => g.kinds.includes(kind));
  Game.dispatches = (kind) => { const D = Game.S.dispatcher, g = Game.dispatchGroup(kind); return !!D && D.on && !!g && !D.skip[g.id]; };
  Game.hireDispatcher = function () {
    const S = Game.S, C = Game.DISPATCHER;
    if (S.dispatcher || !Game.dispatcherUnlocked()) return;
    if (S.money < C.cost) return Game.toast('Not enough money.', 'bad');
    if ((S.toques || 0) < C.toques) return Game.toast(`Hiring the Dispatcher also costs 🎩${C.toques} toques.`, 'bad');
    S.money -= C.cost; S.stats.spent += C.cost; dayStats().build += C.cost;
    S.toques -= C.toques;
    S.dispatcher = { on: true, keep: 5, skip: {}, half: 0, done: 0, earned: 0, fee: 0, kept: 0 };
    Game.toast('📦 Dispatcher hired! He delivers any order your stock can fill and always leaves 5 of each good in the warehouse.', 'good', 'quiet');
    Game.emit('orders'); Game.emit('inv');
  };
  Game.setDispatcher = function (patch) {
    const D = Game.S.dispatcher;
    if (!D) return;
    if (patch.skip) { D.skip[patch.skip] = !D.skip[patch.skip]; delete patch.skip; }
    Object.assign(D, patch);
    Game.emit('orders');
  };
  // How many of a good the Dispatcher leaves alone (0 when he isn't working).
  Game.dispatchKeep = () => (Game.S.dispatcher && Game.S.dispatcher.on ? Game.S.dispatcher.keep : 0);
  // Every couple of game seconds: deliver what can be delivered, soonest to expire first.
  let dispatchTimer = 0;
  function dispatch(dt) {
    const S = Game.S, D = S.dispatcher;
    if (!D || !D.on || (dispatchTimer += dt) < Game.DISPATCHER.every) return;
    dispatchTimer = 0;
    const end = (o) => (o.kind === 'supply' ? o.dayEnd : o.expires);
    keep = D.keep; dispatching = true;
    try {
      for (const o of S.orders.slice().sort((a, b) => end(a) - end(b))) {
        if (Game.dispatches(o.kind) && S.orders.includes(o) && Game.orderReady(o)) Game.fulfil(o.id);
      }
    } finally { keep = 0; dispatching = false; }
  }

  // ---------- Test Kitchen ----------
  // Detective skills: the Test Kitchen's helpers, each opened by the number of different dishes cooked (like the dish
  // goals). Without any, a try only says whether the combination is a dish. Shown in the Mystery Cupboard (ui.js).
  Game.SKILLS = [
    { id: 'taste', name: 'Taste Test', at: 0, about: 'Tells you whether a combination is a dish: yes or no.' },
    { id: 'palate', name: 'Fine Palate', at: 1, about: 'Tells you which dish you are close to, and which tried ingredients belong to it (green) and which don\'t (red).' },
    { id: 'nose', name: 'Keen Nose', at: 3, about: 'Names the groups of the ingredients still missing.' },
    { id: 'sweep', name: 'Pantry Sweep', at: 10, about: 'After a hint about your target dish, the group filter can show just the groups still missing.' },
    { id: 'compass', name: 'Cuisine Compass', at: 25, about: 'With a target dish, a switch shows only ingredients used somewhere in its cuisine. It works together with the group filter.' },
  ];
  Game.skill = (id) => Game.dishesCooked() >= Game.SKILLS.find((k) => k.id === id).at;
  // A splash for each skill as it opens. Saves from before skills existed get the ones they already have quietly.
  function checkSkills() {
    const S = Game.S, quiet = !S.skills;
    S.skills = S.skills || {};
    for (const k of Game.SKILLS) {
      if (S.skills[k.id] || !Game.skill(k.id)) continue;
      S.skills[k.id] = true;
      if (!quiet && k.at > 0) Game.emit('unlock', 'skill:' + k.id);
    }
  }
  // With a target dish (picked via "Try it"), hints only talk about that dish, never a different one that happens to fit better.
  Game.experiment = function (ids, target) {
    const S = Game.S;
    ids = [...new Set(ids)];
    if (!ids.length) return { kind: 'none', msg: 'Add some ingredients first.' };
    if (!S.buildings.some((b) => b.type === 'kitchen')) return { kind: 'none', msg: 'Build a Kitchen first.' };
    for (const id of ids) if (!S.seen[id]) return { kind: 'none', msg: `You haven't had any ${FS.items[id].name} yet.` };
    S.stats.experiments++;
    const sig = ids.slice().sort().join('+');
    const dish = FS.dishList.find((d) => Object.keys(FS.dishRecipe[d.id].inputs).sort().join('+') === sig);
    // A dish of a cuisine you haven't opened can't be discovered yet, but the kitchen tells you where it belongs.
    if (dish && !S.discovered[dish.id] && !S.cuisines[FS.cuisineOf(dish.id).id]) {
      const c = FS.cuisineOf(dish.id);
      return { kind: 'locked', dish: dish.id, msg: Game.stageOpen(c.stage) ? `This tastes like ${c.name} cooking. Open that cuisine in 🍽️ Cuisines to discover it.`
        : `This tastes like cooking from far away. Its cuisine opens in ${Game.stageNext(c.stage) ? Game.stageName(c.stage) + ', the next stage' : 'a stage yet to be discovered'}.` };
    }
    if (dish) {
      const r = FS.dishRecipe[dish.id];
      const isNew = !S.discovered[dish.id];
      S.discovered[dish.id] = true;
      let cooked = false;
      if (Object.entries(r.inputs).every(([i, q]) => Game.has(i, q))) {
        for (const [i, q] of Object.entries(r.inputs)) S.inv[i] -= q;
        addItem(dish.id, 1, true);
        S.stats.produced[dish.id] = (S.stats.produced[dish.id] || 0) + 1;
        cooked = true;
      }
      if (isNew) { Game.emit('discovered', dish.id); checkSpecial(dish.id); }
      Game.emit('inv');
      const res = { kind: isNew ? 'new' : 'known', dish: dish.id, cooked };
      // The combo was another dish: still say how it stands against the target.
      if (target && target !== dish.id && !S.discovered[target]) { const h = targetHint(target, ids, new Set(ids)); res.target = h.msg; res.targetCats = h.cats; res.targetFit = h.fit; }
      return res;
    }
    const sel = new Set(ids);
    if (target && !S.discovered[target]) return targetHint(target, ids, sel);
    let best = null;
    for (const d of FS.dishList) {
      if (S.discovered[d.id] || !Game.dishVisible(d.id)) continue;
      const ins = Object.keys(FS.dishRecipe[d.id].inputs);
      const overlap = ins.filter((i) => sel.has(i)).length;
      if (!overlap) continue;
      const extra = ids.length - overlap, missing = ins.length - overlap;
      const score = overlap * 2 - extra * 1.5 - missing * 0.5;
      if (!best || score > best.score) best = { d, overlap, extra, missing, score };
    }
    // Without the Fine Palate a try is only a yes or a no.
    if (!best || best.overlap < 2 && ids.length > 1 || !Game.skill('palate')) return { kind: 'fail', msg: 'Nothing comes of this combination.' };
    const ins = Object.keys(FS.dishRecipe[best.d.id].inputs);
    return { kind: 'warm', dish: best.d.id, cats: Game.skill('nose') ? missingCats(ins, sel) : null, msg: warmMsg(best.d, ins, ids, sel, best.missing) };
  };
  // About the target dish the Test Kitchen colours each tried ingredient (fit: which belong), so the text stays short.
  // Each detective skill adds to it: the Fine Palate the fit, the Keen Nose the missing groups.
  function targetHint(target, ids, sel) {
    const t = FS.items[target], ins = Object.keys(FS.dishRecipe[target].inputs);
    if (!Game.skill('palate')) return { kind: 'fail', dish: target, msg: `No, this isn't ${t.name}.` };
    const fit = { good: ids.filter((i) => ins.includes(i)), bad: ids.filter((i) => !ins.includes(i)) };
    if (!fit.good.length) return { kind: 'fail', dish: target, fit, msg: `None of these go into ${t.name}.` };
    const missing = ins.filter((i) => !sel.has(i)), nose = Game.skill('nose'), cats = nose ? missingCats(ins, sel) : null;
    const msg = !missing.length ? 'Everything it needs is here: take out the ones that don\'t belong.'
      : nose ? `Still needs ${missing.length} more: ${cats.map((c) => (FS.catInfo[c] || ['', c])[1]).join(', ')}.` : 'Something is still missing.';
    return { kind: 'warm', dish: target, cats, fit, msg };
  }
  // The groups of the ingredients still missing (the hint names them), for the Test Kitchen's group filter.
  const missingCats = (ins, sel) => [...new Set(ins.filter((i) => !sel.has(i)).map((i) => FS.items[i].cat))];
  function warmMsg(d, ins, ids, sel, missing) {
    const missingCats = [...new Set(ins.filter((i) => !sel.has(i)).map((i) => (FS.catInfo[FS.items[i].cat] || ['', FS.items[i].cat])[1]))];
    const extras = ids.filter((i) => !ins.includes(i)).map((i) => FS.items[i].name);
    const parts = [];
    if (extras.length) parts.push(`${extras.join(', ')} ${extras.length > 1 ? "don't" : "doesn't"} belong`);
    if (missing) parts.push(Game.skill('nose') ? `it still needs ${missing} more: ${missingCats.join(', ')}` : 'something is still missing');
    return `Close to ${d.name} (${d.cuisine}): ${parts.join(', and ')}.`;
  }
  // Hints are paid in toques: one per ingredient, two for a dish with a long supply chain (12+ raw ingredients).
  Game.revealCost = (dishId) => (FS.complexity(dishId).rawCount >= 12 ? 2 : 1);
  Game.reveal = function (dishId) {
    const S = Game.S;
    const ins = Object.keys(FS.dishRecipe[dishId].inputs);
    const known = S.revealed[dishId] || [];
    const left = ins.filter((i) => !known.includes(i));
    if (!left.length) return;
    const cost = Game.revealCost(dishId);
    if ((S.toques || 0) < cost) return Game.toast('Not enough 🎩 toques for a hint. Special requests, clue orders, events and cuisine targets earn them.', 'bad');
    S.toques -= cost;
    revealOne(dishId);
    Game.emit('inv');
  };
  // Dish mastery (after stage C): a discovered dish you have cooked often enough can be perfected for toques. A mastered
  // dish sells for more and pleases restaurant guests. cost by supply chain size: under 8, 8 to 11, 12+ raw ingredients.
  Game.MASTERY = { need: 10, cost: [2, 4, 8], value: 1.15, guest: 0.2 };
  Game.masteryUnlocked = () => Game.stageDone('D');
  Game.mastered = (id) => !!(Game.S.mastered && Game.S.mastered[id]);
  Game.masterMult = (id) => (Game.mastered(id) ? Game.MASTERY.value : 1);
  // Fame: after cooking 25 different dishes, every dish sells for 10% more, at the market and in restaurants.
  // Fame grows again at 100 dishes. A cuisine with every dish cooked (gold) sells its own dishes for 5% more on top.
  Game.FAME = [{ goal: 'dish25', value: 1.1 }, { goal: 'dish100', value: 1.2 }];
  Game.GOLD_PERK = 1.05;
  Game.fameMult = () => Game.FAME.reduce((m, f) => (Game.S.goalsDone[f.goal] ? f.value : m), 1);
  Game.goldMult = (id) => (Game.S.cuisineGold && Game.S.cuisineGold[FS.cuisineOf(id).id] ? Game.GOLD_PERK : 1);
  Game.dishMult = (id) => Game.masterMult(id) * (FS.items[id].dish ? Game.fameMult() * Game.goldMult(id) : 1);
  Game.masterCost = (id) => { const rc = FS.complexity(id).rawCount; return Game.MASTERY.cost[rc >= 12 ? 2 : rc >= 8 ? 1 : 0]; };
  Game.masterDish = function (id) {
    const S = Game.S, M = Game.MASTERY, d = FS.items[id];
    if (!d || !d.dish || Game.mastered(id) || !Game.masteryUnlocked()) return;
    if (!S.discovered[id]) return Game.toast('Discover the dish before you master it.', 'bad');
    const n = S.stats.produced[id] || 0;
    if (n < M.need) return Game.toast(`Cook ${d.name} ${M.need} times before you master it (${n} so far).`, 'bad');
    const cost = Game.masterCost(id);
    if ((S.toques || 0) < cost) return Game.toast(`Mastering ${d.name} costs 🎩${cost} toques.`, 'bad');
    S.toques -= cost;
    (S.mastered = S.mastered || {})[id] = true;
    S.stats.mastered = (S.stats.mastered || 0) + 1;
    Game.toast(`⭐ ${d.name} is mastered: it sells for ${Math.round((M.value - 1) * 100)}% more and restaurant guests love it.`, 'good', 'quiet');
    Game.emit('inv');
  };
  // Toques, the chef's hat: a second currency for knowledge and craft (hints, chefs, head chefs, mastery), never bought with money.
  Game.addToques = function (n) {
    const S = Game.S;
    S.toques = (S.toques || 0) + n;
    S.stats.toques = (S.stats.toques || 0) + n;
    Game.emit('inv');
  };

  // ---------- Culinary Academy ----------
  // Unlocked by finishing stage B: one building where chefs, hired with toques, work out undiscovered dishes. A chef
  // reveals one ingredient every few game hours (faster on their speciality cuisine and with training, slower on dishes
  // with a long supply chain). Chefs reveal, they never cook: the dish still has to be made from your own chain.
  // A chef who finishes a dish sometimes brings a recipe postcard: one ingredient of a dish in a cuisine not open yet.
  // hire/train: toques for the 1st, 2nd, 3rd chef and for training to level 2 and 3. hours: game hours per ingredient.
  Game.ACADEMY = { seats: 3, hire: [3, 5, 8], train: [3, 6], hours: 5, spec: 0.6, levels: [1, 0.8, 0.65], long: 1.5, postcard: 0.35, cands: 3 };
  // Where each cuisine's chefs trained, and a few names.
  Game.CHEF_SCHOOLS = {
    farmhouse_kitchen: ['a Devon farmhouse', ['Martha', 'Tom', 'Elsie']], swiss_alpine: ['Appenzell', ['Ueli', 'Vreni', 'Reto']],
    nordic_dutch: ['Gothenburg', ['Astrid', 'Lars', 'Sanne']], british_irish: ['Dublin', ['Siobhan', 'Callum', 'Harriet']],
    french_belgian: ['Lyon', ['Amélie', 'Benoît', 'Margaux']], german_austrian_hungarian: ['Vienna', ['Lukas', 'Greta', 'Zsófia']],
    italian: ['Bologna', ['Giulia', 'Marco', 'Lorenzo']], mediterranean_middle_eastern: ['Beirut', ['Layla', 'Yusuf', 'Eleni']],
    around_the_world: ['a cruise ship galley', ['Kofi', 'Thandi', 'Mateus']], east_asian: ['Osaka', ['Haruto', 'Mei', 'Ji-woo']],
    south_southeast_asian: ['Penang', ['Priya', 'Arjun', 'Linh']], the_americas: ['Oaxaca', ['Lupe', 'Diego', 'Jolene']],
    haute_cuisine: ['Paris', ['Étienne', 'Camille', 'Auguste']], patisserie_chocolaterie: ['Brussels', ['Céleste', 'Pierre', 'Elodie']],
    grand_banquets: ['St Petersburg', ['Anastasia', 'Dmitri', 'Olga']],
  };
  Game.academyUnlocked = () => Game.stageDone('B');
  Game.academyBuilding = () => Game.S.buildings.find((b) => b.type === 'academy') || null;
  // S.academy = { chefs, cands, candDay, cards, next }. chef = { id, name, cz, lvl, dish, auto, prog, done }:
  // dish is what they work on, auto a cuisine to keep picking dishes from ("surprise me"), prog game seconds so far.
  function academy() {
    const S = Game.S;
    if (!S.academy) S.academy = { chefs: [], cands: [], candDay: -1, cards: [], next: 1 };
    return S.academy;
  }
  Game.academy = academy;
  Game.chefs = () => (Game.S.academy ? Game.S.academy.chefs : []);
  Game.academyBusy = () => Game.chefs().some((c) => c.dish);
  Game.chefWorking = (b) => !!b && !b.paused;
  // Dishes a chef can work on: in an open cuisine, shown in the Cookbook, not discovered, and no other chef on it.
  Game.chefTargets = (cid, except) => FS.cuisineById[cid].dishIds.filter((id) => !Game.S.discovered[id] && Game.dishVisible(id)
    && !Game.chefs().some((c) => c !== except && c.dish === id));
  // Game seconds a chef needs for one ingredient of a dish.
  Game.chefTime = function (c, dishId) {
    const A = Game.ACADEMY;
    let t = A.hours * HOUR * A.levels[c.lvl - 1];
    if (FS.cuisineOf(dishId).id === c.cz) t *= A.spec;
    if (FS.complexity(dishId).rawCount >= 12) t *= A.long;
    return t;
  };
  Game.chefCost = () => Game.ACADEMY.hire[Game.chefs().length];
  Game.trainCost = (c) => Game.ACADEMY.train[c.lvl - 1];
  // Three candidates a day, each with a different speciality from stage B up to the current stage: mostly cuisines you
  // have open, sometimes one of this stage you haven't opened yet (their postcards come from home). Never a cuisine of
  // a later stage: the Cuisines window keeps those names a surprise.
  function newCandidate(taken) {
    const A = academy(), cur = FS.STAGES.indexOf(Game.currentStage());
    const pool = FS.CUISINES.filter((c) => { const k = FS.STAGES.findIndex((st) => st.id === c.stage); return !taken.has(c.id) && k >= 1 && k <= cur; });
    const open = pool.filter((c) => Game.S.cuisines[c.id] && Game.chefTargets(c.id).length);
    const later = pool.filter((c) => !Game.S.cuisines[c.id]);
    const from = (open.length && (Math.random() < 0.7 || !later.length)) ? open : later.length ? later : pool;
    if (!from.length) return null;
    const cz = from[(Math.random() * from.length) | 0].id, names = Game.CHEF_SCHOOLS[cz][1];
    const used = new Set(A.chefs.map((c) => c.name));
    const name = names.find((n) => !used.has(n) && Math.random() < 0.6) || names.find((n) => !used.has(n)) || names[0];
    taken.add(cz);
    return { name, cz };
  }
  function rollCandidates(force) {
    const A = academy(), day = Game.dayOf();
    const cur = FS.STAGES.indexOf(Game.currentStage());
    const fits = (c) => FS.STAGES.findIndex((st) => st.id === FS.cuisineById[c.cz].stage) <= cur; // old saves may hold later ones
    if (!force && A.candDay === day && A.cands.length && A.cands.every(fits)) return;
    A.candDay = day;
    const taken = new Set(A.chefs.map((c) => c.cz));
    A.cands = [];
    for (let k = 0; k < Game.ACADEMY.cands; k++) { const c = newCandidate(taken); if (c) A.cands.push(c); }
  }
  Game.candidates = () => { if (Game.academyUnlocked()) rollCandidates(); return Game.S.academy ? Game.S.academy.cands : []; };
  Game.hireChef = function (k) {
    const S = Game.S, A = academy(), cand = A.cands[k];
    if (!Game.academyUnlocked()) return Game.toast(`Finish ${Game.stageName('B')} to open the 🎓 Culinary Academy.`, 'bad');
    if (!Game.academyBuilding()) return Game.toast('Build the 🎓 Culinary Academy first: chefs need a place to work.', 'bad');
    if (!cand) return;
    if (A.chefs.length >= Game.ACADEMY.seats) return Game.toast(`The Academy has room for ${Game.ACADEMY.seats} chefs. Let one go to hire another.`, 'bad');
    const cost = Game.chefCost();
    if ((S.toques || 0) < cost) return Game.toast(`Hiring a chef costs 🎩${cost} toques.`, 'bad');
    S.toques -= cost;
    const c = { id: A.next++, name: cand.name, cz: cand.cz, lvl: 1, dish: null, auto: null, prog: 0, done: 0 };
    A.chefs.push(c);
    A.cands.splice(k, 1);
    // Start them on their own cuisine if it is open.
    if (S.cuisines[c.cz]) chefNext(c, c.cz, true);
    Game.toast(`🎓 Chef ${c.name} from ${Game.CHEF_SCHOOLS[c.cz][0]} joins the Academy.${c.dish ? ` First task: ${FS.items[c.dish].name}.` : ' Pick a dish for them to work out.'}`, 'good', 'quiet');
    Game.emit('academy');
  };
  Game.trainChef = function (id) {
    const S = Game.S, c = Game.chefs().find((x) => x.id === id);
    if (!c || c.lvl >= Game.ACADEMY.levels.length) return;
    const cost = Game.trainCost(c);
    if ((S.toques || 0) < cost) return Game.toast(`Training costs 🎩${cost} toques.`, 'bad');
    S.toques -= cost; c.lvl++;
    Game.toast(`🎓 ${c.name} is now a level ${c.lvl} chef and works faster.`, 'good', 'quiet');
    Game.emit('academy');
  };
  Game.dismissChef = function (id) {
    const A = academy(), c = A.chefs.find((x) => x.id === id);
    if (!c) return;
    A.chefs = A.chefs.filter((x) => x !== c);
    Game.toast(`${c.name} has left the Academy. What they found stays in your 📖 Cookbook.`, '', 'quiet');
    Game.emit('academy');
  };
  // Point a chef at a dish, or at a cuisine ("cz:<id>") to keep working through its dishes; '' stops them.
  Game.assignChef = function (id, what) {
    const c = Game.chefs().find((x) => x.id === id);
    if (!c) return;
    if (!what) { c.dish = null; c.auto = null; c.prog = 0; Game.emit('academy'); return; }
    if (what.startsWith('cz:')) {
      if (!chefNext(c, what.slice(3), true)) Game.toast(`Nothing left to work out in ${FS.cuisineById[what.slice(3)].name} right now.`, 'bad');
    } else {
      if (Game.S.discovered[what]) return;
      const other = Game.chefs().find((x) => x !== c && x.dish === what);
      if (other) return Game.toast(`${other.name} is already working on ${FS.items[what].name}.`, 'bad');
      if (c.dish !== what) c.prog = 0;
      c.dish = what; c.auto = null;
    }
    Game.emit('academy');
  };
  // From the Cookbook: give a dish to an idle chef, the one with that speciality first.
  Game.sendChef = function (dishId) {
    const cz = FS.cuisineOf(dishId).id, idle = Game.chefs().filter((c) => !c.dish);
    if (!Game.chefs().length) return Game.toast('Hire a chef at the 🎓 Culinary Academy first.', 'bad');
    if (!idle.length) return Game.toast('Every chef is busy. Open the 🎓 Academy to give one of them this dish instead.', 'bad');
    const c = idle.find((x) => x.cz === cz) || idle[0];
    Game.assignChef(c.id, dishId);
    if (c.dish === dishId) Game.toast(`🎓 ${c.name} starts working out ${FS.items[dishId].name}.`, 'good', 'quiet');
  };
  // Next dish from a cuisine; prefers dishes already partly revealed so the Cookbook fills in dish by dish.
  function chefNext(c, cid, first) {
    const list = Game.chefTargets(cid, c);
    c.prog = 0;
    if (!list.length) { c.dish = null; if (!first) c.auto = null; return false; }
    const known = (id) => (Game.S.revealed[id] || []).length;
    const best = Math.max(...list.map(known)), pick = list.filter((id) => known(id) === best);
    c.dish = pick[(Math.random() * pick.length) | 0]; c.auto = cid;
    return true;
  }
  // One random hidden ingredient of a dish becomes known; the last one discovers the dish. Returns the ingredient.
  function revealOne(dishId) {
    const S = Game.S, ins = Object.keys(FS.dishRecipe[dishId].inputs), known = S.revealed[dishId] || [];
    const left = ins.filter((i) => !known.includes(i));
    if (!left.length) return null;
    const ing = left[(Math.random() * left.length) | 0];
    S.revealed[dishId] = known.concat(ing);
    if (S.revealed[dishId].length === ins.length && !S.discovered[dishId]) {
      S.discovered[dishId] = true; Game.emit('discovered', dishId); checkSpecial(dishId);
    }
    return ing;
  }
  // A postcard reveals one ingredient (never the last) of a dish in a cuisine you haven't opened, from the chef's home
  // cuisine if that is still closed, otherwise from this stage (later stages stay a surprise).
  function postcard(c) {
    const S = Game.S, cur = FS.STAGES.indexOf(Game.currentStage());
    const closed = FS.CUISINES.filter((z) => !S.cuisines[z.id] && FS.STAGES.findIndex((st) => st.id === z.stage) <= cur);
    const home = closed.find((z) => z.id === c.cz), pool = home ? [home] : closed;
    for (let tries = 0; tries < 6 && pool.length; tries++) {
      const z = pool[(Math.random() * pool.length) | 0];
      const dishes = z.dishIds.filter((id) => Object.keys(FS.dishRecipe[id].inputs).length - (S.revealed[id] || []).length >= 2);
      if (!dishes.length) continue;
      const d = dishes[(Math.random() * dishes.length) | 0], ing = revealOne(d);
      const town = Game.CHEF_SCHOOLS[z.id][0];
      const A = academy();
      A.cards.push({ dish: d, ing, cz: z.id, chef: c.name, day: Game.dayOf() });
      if (A.cards.length > 12) A.cards.shift();
      Game.toast(`💌 ${c.name} brings a recipe postcard from ${town}: ${FS.items[d].name} (${z.name}) needs ${FS.items[ing].name}.`, 'good', true);
      return;
    }
  }
  function tickAcademy(dt) {
    const S = Game.S;
    if (!S.academy || !S.academy.chefs.length || !Game.chefWorking(Game.academyBuilding())) return;
    for (const c of S.academy.chefs) {
      if (c.dish && S.discovered[c.dish]) { if (!c.auto || !chefNext(c, c.auto)) c.dish = null; Game.emit('academy'); }
      if (!c.dish) continue;
      c.prog += dt;
      if (c.prog < Game.chefTime(c, c.dish)) continue;
      c.prog = 0;
      const d = c.dish, ing = revealOne(d);
      if (!S.discovered[d]) { Game.emit('academy'); continue; }
      c.done++;
      Game.toast(`🎓 ${c.name} worked out ${FS.items[d].name}: its last ingredient is ${FS.items[ing].name}. Now cook it from your own chain!`, 'good', true);
      if (Math.random() < Game.ACADEMY.postcard) postcard(c);
      if (!c.auto || !chefNext(c, c.auto)) {
        const was = c.auto; c.dish = null; c.auto = null;
        Game.toast(`🎓 ${c.name} is waiting for a new dish${was ? `: nothing left to work out in ${FS.cuisineById[was].name} for now` : ''}.`, '', true);
      }
      Game.emit('academy');
    }
  }
  // Cheat helper: mark every stage up to `id` done and open its cuisines.
  Game.cheatStage = function (id) {
    const S = Game.S, k = FS.STAGES.findIndex((st) => st.id === id);
    if (k < 0) return false;
    S.cuisineDone = S.cuisineDone || {};
    S.goalsDone.dish1 = true;
    for (const st of FS.STAGES.slice(0, k + 1)) for (const c of st.cuisines) { S.cuisines[c.id] = true; S.cuisineDone[c.id] = true; }
    Game.refreshUnlocks();
    return true;
  };

  // ---------- Goals ----------
  const count = (t) => Game.S.buildings.filter((b) => b.type === t).length;
  const made = (id) => (Game.S.stats.produced[id] || 0) > 0;
  // Dish goals count dishes you have actually cooked, not just discovered.
  const disc = () => FS.dishList.filter((d) => made(d.id)).length;
  Game.dishesCooked = disc;
  // Finishing a stage: its target in each of its three cuisines. Progress counts cooked dishes up to each target.
  // Their reward shows on the stage's splash card (splashInfo in ui.js), so no toast.
  function stageGoal(id, reward, toques) {
    const st = FS.STAGES.find((x) => x.id === id);
    if (st.rating) return { id: 'stage' + id, reward, toques, card: true, open: () => Game.stageOpen(id), check: () => Game.stageDone(id),
      get text() { return Game.stageKnown(id) && Game.restaurantsUnlocked() ? `Finish ${st.name}: serve ${st.target} dishes of each of its cuisines at restaurants rated ${'★'.repeat(st.rating)} or better (🏙️ Town)` : 'Finish a stage yet to be discovered'; },
      progress: () => [st.cuisines.reduce((n, c) => n + Math.min(st.target, Game.cuisineRated(c, st.rating)), 0), st.target * st.cuisines.length] };
    return { id: 'stage' + id, reward, toques, card: true, open: () => Game.stageOpen(id),
      get text() { return Game.stageKnown(id) ? `Finish ${st.name}: cook ${st.target} dishes in each of its cuisines (🍽️ Cuisines)` : 'Finish a stage yet to be discovered'; },
      check: () => Game.stageDone(id),
      progress: () => [st.cuisines.reduce((n, c) => n + Math.min(st.target, Game.cuisineCooked(c)), 0), st.target * st.cuisines.length] };
  }
  // Goals only show once the player can work on them (independent ones, like the dish counts, from the start).
  const canMake = (id) => (FS.byOutput[id] || []).some((r) => !r.dish && Game.recipeUnlocked(r.id) && Game.buildingUnlocked(r.building));
  const MEAT_CUTS = ['beef_steak', 'pork_chop', 'chicken_breast', 'whole_chicken'];
  Game.goals = [
    { id: 'well', text: 'Click your Well to see what it makes', reward: 50, check: () => !!(Game.S.tut && Game.S.tut.well) },
    { id: 'harvest', text: 'Harvest your first wheat', reward: 50, check: () => made('wheat') },
    { id: 'mill', text: 'Build a Mill and grind Wheat Flour', reward: 150, check: () => made('wheat_flour') },
    { id: 'order', text: 'Deliver a customer order (📋 Orders)', reward: 250, check: () => Game.S.stats.ordersDone > 0 },
    { id: 'kitchen', text: 'Build a Kitchen', reward: 150, check: () => count('kitchen') > 0 },
    { id: 'dish1', text: 'Cook your first dish: try bread + butter in the 🧪 Test Kitchen', reward: 200, check: () => disc() >= 1 },
    { id: 'plan', text: 'Open 🗺️ Plan production for a dish (in the Cookbook or Codex) to see every building it needs', reward: 100, check: () => (Game.S.stats.plans || 0) > 0 },
    { id: 'sell', text: 'Sell something in the 🛖 Inventory', reward: 50, check: () => Game.S.stats.sold > 0 },
    // Bottom-up: bread's own ingredients come first (salt, then yeast), then the bread itself.
    { id: 'salt', text: 'Almost every recipe needs salt: build Salt Pans next to water', reward: 300, open: () => canMake('salt'), check: () => made('salt') },
    { id: 'yeast', text: 'Yeast grows on molasses: Sugar Beet ➜ Sugar Refinery ➜ Fermentation Cellar', reward: 400, open: () => canMake('yeast'), check: () => made('yeast') },
    { id: 'bread', text: 'Bake a Bread Loaf from your own flour, water, yeast and salt', reward: 300, open: () => canMake('bread_loaf'), check: () => made('bread_loaf') },
    { id: 'animals', text: 'Raise animals: build a Poultry House with Laying Hens', reward: 200, open: () => canMake('chicken_egg'), check: () => made('chicken_egg') },
    { id: 'feed', text: 'Hens eat feed: grow Barley and mix it with the Wheat Bran left over from milling at a Feed Mill', reward: 300, open: () => canMake('animal_feed'), check: () => made('animal_feed') },
    { id: 'butter', text: 'Butter starts with grass: grow Hay, keep Dairy Cows on a Pasture, then churn Butter at a Creamery', reward: 400, open: () => canMake('butter'), check: () => made('butter') },
    { id: 'dish10', text: 'Cook 10 different dishes', reward: 500, check: () => disc() >= 10, progress: () => [disc(), 10] },
    { id: 'cuisine', text: 'Open a new cuisine in 🍽️ Cuisines: Swiss Alpine or Nordic & Dutch', reward: 750, open: () => !!Game.S.goalsDone.dish1, check: () => Object.keys(Game.S.cuisines).length > 1 },
    { id: 'cheese', text: 'Make a cheese at the Creamery', reward: 400, open: () => Object.keys(FS.items).some((i) => FS.items[i].cat === 'cheese' && canMake(i)), check: () => Object.keys(Game.S.stats.produced).some((i) => FS.items[i].cat === 'cheese') },
    { id: 'meat', text: 'Butcher an animal into cuts', reward: 400, open: () => MEAT_CUTS.some(canMake), check: () => MEAT_CUTS.some(made) },
    stageGoal('A', 2000),
    // A milestone: a celebration card, toques, and fame (every dish sells for more from now on).
    { id: 'dish25', text: 'Cook 25 different dishes', reward: 2500, toques: 3, splash: true, check: () => disc() >= 25, progress: () => [disc(), 25] },
    // Further milestones: 50 adds a storage level, 100 more fame, 200 a trophy on the farmhouse (Game.keepsakes).
    { id: 'dish50', text: 'Cook 50 different dishes', reward: 5000, toques: 4, splash: true, check: () => disc() >= 50, progress: () => [disc(), 50],
      done: () => { if (Game.STORAGE[Game.storageLevel() + 1]) { Game.S.storage = Game.storageLevel() + 1; Game.S.milestoneCap = Game.capacity(); Game.emit('inv'); } } },
    stageGoal('B', 4000),
    // Opens the town, but says nothing about it: the town is a surprise (unlock splash).
    { id: 'town', reward: 5000, get text() { return `Discover ${Game.townDishes()} dishes`; },
      check: () => Game.restaurantsUnlocked(), progress: () => [Math.min(Object.keys(Game.S.discovered).length, Game.townDishes()), Game.townDishes()] },
    { id: 'gold3', reward: 1500, toques: 3,
      get text() { return `Cook every dish in 3 cuisines${Game.featureKnown('dispatcher') ? ' to hire 📦 the Dispatcher (📋 Orders)' : ''}`; },
      check: () => Object.keys(Game.S.cuisineGold || {}).length >= 3, progress: () => [Math.min(3, Object.keys(Game.S.cuisineGold || {}).length), 3],
      done: () => Game.emit('unlock', 'dispatcher') },
    { id: 'choc', get text() { return `Make Dark Chocolate (cocoa takes ${FS.complexity('dark_chocolate').steps} processing steps!)`; }, reward: 1500, toques: 2, splash: true, open: () => canMake('dark_chocolate'), check: () => made('dark_chocolate') },
    { id: 'dish100', text: 'Cook 100 different dishes', reward: 10000, toques: 6, splash: true, check: () => disc() >= 100, progress: () => [disc(), 100] },
    { id: 'complex', text: 'Cook a dish with 15+ raw ingredients in its supply chain', reward: 3000, toques: 4, splash: true,
      open: () => FS.dishList.some((d) => Game.S.cuisines[FS.cuisineOf(d.id).id] && FS.complexity(d.id).rawCount >= 15),
      check: () => FS.dishList.some((d) => made(d.id) && FS.complexity(d.id).rawCount >= 15) },
    stageGoal('C', 8000, 3),
    stageGoal('D', 15000, 5),
    { id: 'dish200', text: 'Cook 200 different dishes', reward: 20000, toques: 8, splash: true, check: () => disc() >= 200, progress: () => [disc(), 200] },
    stageGoal('E', 30000, 8),
    { id: 'legacy', reward: 100000, open: () => Game.featureKnown('restaurants') && Game.stageOpen('E'),
      get text() { return Game.featureKnown('restaurants') && Game.stageOpen('E') ? 'The Legacy: finish Grand Cuisine, win gold from all three food critics in the same year, and buy out the Crestwell Group (🏙️ Town)' : 'A final challenge yet to be discovered'; },
      check: () => !!Game.S.legacyWon, progress: () => [Game.legacy().filter((x) => x.done).length, Game.legacy().length] },
    { id: 'dishall', get text() { return `Cook every dish (${FS.dishList.length} in all)`; }, reward: 50000, toques: 10, splash: true, check: () => disc() >= FS.dishList.length, progress: () => [disc(), FS.dishList.length] },
  ];
  // The cooked dish with the longest supply chain (most raw ingredients): the showcase of the 'complex' goal.
  Game.mostComplexCooked = () => FS.dishList.filter((d) => made(d.id)).map((d) => d.id)
    .sort((a, b) => FS.complexity(b).rawCount - FS.complexity(a).rawCount)[0] || null;
  // Keepsakes on the farmhouse roof, one per great milestone reached: [goal id, icon id].
  Game.KEEPSAKES = [['dish200', 'ui_trophy'], ['dishall', 'ui_medal_1'], ['legacy', 'ui_crown']];
  Game.keepsakes = () => Game.KEEPSAKES.filter(([g]) => Game.S.goalsDone[g]).map(([, icon]) => icon);
  // Shown in the goal bar and Goals window: done goals, and open ones the player can work on now.
  Game.goalVisible = (g) => !!Game.S.goalsDone[g.id] || !g.open || g.open();
  Game.nextGoal = () => Game.goals.find((g) => !Game.S.goalsDone[g.id] && Game.goalVisible(g));
  // Customers start ordering with the first order, which comes as soon as you make something of your own (2026-10-13).
  Game.ordersOpen = () => !!Game.S.goalsDone.order || !!Game.S.stats.orderCounter;
  // Count goals report [current, target]; null for yes/no goals.
  Game.goalProgress = (g) => (g.progress && !Game.S.goalsDone[g.id] ? g.progress() : null);
  function checkGoals() {
    const S = Game.S;
    checkCuisines();
    checkSkills();
    for (const g of Game.goals) {
      if (S.goalsDone[g.id] || !g.check()) continue;
      S.goalsDone[g.id] = true;
      S.money += g.reward; dayStats().bonus += g.reward;
      if (g.toques) Game.addToques(g.toques);
      // Milestones get their own celebration card instead of a toast.
      if (g.splash) Game.emit('unlock', 'goal:' + g.id);
      else if (!g.card) Game.toast(`🎯 Goal complete: ${g.text} (+${g.reward}${g.toques ? ` and 🎩${g.toques}` : ''})`, 'good', 'quiet');
      if (g.done) g.done();
      Game.emit('goals');
      if (FS.STEPS.some((st) => st.goal === g.id)) Game.refreshUnlocks();
    }
  }
  // ---------- Cuisines and stages ----------
  // Dishes cooked so far in a cuisine (cooked, not just discovered, like the dish goals).
  Game.cuisineCooked = (c) => c.dishIds.filter(made).length;
  Game.stageById = (id) => FS.STAGES.find((st) => st.id === id);
  // A stage is done once each of its cuisines has reached the target (S.cuisineDone keeps that, even if counts change).
  Game.stageDone = (id) => Game.stageById(id).cuisines.every((c) => (Game.S.cuisineDone || {})[c.id]);
  // The stage being worked on: the first one not done (the last one once everything is).
  Game.currentStage = () => FS.STAGES.find((st) => !Game.stageDone(st.id)) || FS.STAGES[FS.STAGES.length - 1];
  Game.stageOpen = (id) => FS.STAGES.indexOf(Game.stageById(id)) <= FS.STAGES.indexOf(Game.currentStage());
  // What the player sees of a stage: reached stages by name, the next one by name with a teaser, later ones not at all.
  // Stage letters (st.id) are internal only and never shown.
  Game.stageNext = (id) => FS.STAGES.indexOf(Game.stageById(id)) === FS.STAGES.indexOf(Game.currentStage()) + 1;
  Game.stageKnown = (id) => Game.stageOpen(id) || Game.stageNext(id);
  Game.stageName = (id) => (Game.stageKnown(id) ? Game.stageById(id).name : 'a stage yet to be discovered');
  // Features a finished stage opens. Named once they have unlocked; never teased before.
  Game.FEATURES = {
    wholesaler: { stage: 'A', name: '🚚 the Wholesaler', teaser: 'a trader who buys up your surplus' },
    academy: { stage: 'B', name: '🎓 the Culinary Academy', teaser: 'a school for chefs' },
    blueprints: { stage: 'C', name: '📐 Blueprints in Plan production', teaser: 'plans that lay out a whole supply chain at once' },
    mastery: { stage: 'D', name: '⭐ dish mastery', teaser: 'a way to perfect the dishes you cook most' },
    dispatcher: { stage: 'B', name: '📦 the Dispatcher', teaser: 'someone to deliver orders for you' },
    restaurants: { stage: 'B', dishes: 75, name: '🏙️ Restaurants in Town', teaser: 'the town is looking for restaurateurs' },
    finedining: { stage: 'D', name: '🎩 Fine Dining', teaser: 'a licence for the finest tables' },
  };
  // A feature stays a surprise until it has actually unlocked (its splash shows then); until that it is only "something new".
  const FEATURE_OPEN = { wholesaler: () => Game.wholesalerUnlocked(), academy: () => Game.academyUnlocked(), blueprints: () => Game.blueprintsUnlocked(),
    mastery: () => Game.masteryUnlocked(), dispatcher: () => Game.dispatcherUnlocked(), restaurants: () => Game.restaurantsUnlocked(), finedining: () => Game.stageDone('D') };
  Game.featureKnown = (key) => FEATURE_OPEN[key]();
  Game.featureText = (key) => (Game.featureKnown(key) ? Game.FEATURES[key].name : 'something new');
  // New cuisines can be opened once you have cooked your first dish.
  Game.cuisinesReady = () => !!Game.S.goalsDone.dish1;
  Game.cuisineCost = (c) => Game.stageById(c.stage).cost;
  Game.openCuisine = function (cid) {
    const S = Game.S, c = FS.cuisineById[cid];
    if (!c || S.cuisines[cid]) return;
    if (!Game.cuisinesReady()) return Game.toast('Cook your first dish to open new cuisines.', 'bad');
    if (!Game.stageOpen(c.stage)) return Game.toast(`Finish ${Game.currentStage().name} first.`, 'bad');
    const cost = Game.cuisineCost(c);
    if (S.money < cost) return Game.toast('Not enough money to open this cuisine.', 'bad');
    S.money -= cost; S.stats.spent += cost; dayStats().shop += cost;
    // The number records the opening order (newest = highest), for lists that show the latest cuisine first.
    S.cuisines[cid] = Math.max(1, ...Object.values(S.cuisines).map(Number)) + 1;
    Game.journal({ type: 'msg', kind: 'good', text: `🍽️ ${c.name} is open! Its buildings and recipes are unlocked and its ${c.dishIds.length} dishes are in your 📖 Cookbook.`, quiet: true });
    Game.refreshUnlocks();
    Game.emit('unlock', 'cz:' + cid);
  };
  // Reaching a cuisine's target, and cooking all of it, pay toques. When every cuisine of a stage is at its target,
  // the next stage opens.
  function checkCuisines() {
    const S = Game.S;
    S.cuisineDone = S.cuisineDone || {}; S.cuisineGold = S.cuisineGold || {};
    for (const st of FS.STAGES) for (const c of st.cuisines) {
      if (!S.cuisines[c.id]) continue;
      const n = Game.cuisineCooked(c);
      // Stage E counts dishes on well-rated restaurant menus instead of dishes cooked.
      if (!S.cuisineDone[c.id] && (st.rating ? Game.cuisineRated(c, st.rating) : n) >= st.target) {
        S.cuisineDone[c.id] = true;
        Game.addToques(st.toques);
        // A splash card, ahead of any feature the stage unlocks; the last cuisine of a stage also says the stage is complete.
        Game.emit('unlock', 'czdone:' + c.id + (Game.stageDone(st.id) ? ':stage' : ''));
        if (Game.stageDone(st.id)) stageFinished(st);
      }
      if (!S.cuisineGold[c.id] && n >= c.dishIds.length) {
        S.cuisineGold[c.id] = true;
        Game.addToques(st.gold);
        Game.emit('unlock', 'czgold:' + c.id);
      }
    }
  }
  function stageFinished(st) {
    const next = FS.STAGES[FS.STAGES.indexOf(st) + 1];
    Game.toast(`🏆 ${st.name} is complete! ` +
      (next ? `${next.name} is open: pick its first cuisine in 🍽️ Cuisines.` : 'You have mastered every stage.') +
      '', 'good', 'quiet');
    if (st.unlock) Game.emit('unlock', st.unlock);
    if (st.unlock === 'academy') { Game.S.newB = Game.S.newB || {}; Game.S.newB.academy = Game.S.time; Game.emit('unlocked', { buildings: ['academy'], recipes: [] }); }
    if (Game.ORDER_NEWS[st.id]) Game.toast(Game.ORDER_NEWS[st.id], 'good', 'quiet');
    Game.emit('stage', st);
  }

  // ---------- Blueprints ----------
  // After stage C: set down every missing step of a production chain at once, laid out close together for the
  // proximity saving, and pay for it in one go. Afterwards they are ordinary buildings.
  Game.blueprintsUnlocked = () => Game.stageDone('C');
  Game.BP_RADIUS = 14; // how far from the cursor a blueprint looks for room
  Game.BP_DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // which way the chain grows, turned with Rotate
  // Two steps are linked when one makes something the other uses.
  function bpLinked(a, b) {
    const ra = FS.recipeById[a], rb = FS.recipeById[b];
    return Object.keys(ra.inputs).some((i) => rb.outputs[i]) || Object.keys(rb.inputs).some((i) => ra.outputs[i]);
  }
  Game.bpLinked = bpLinked;
  const bpTiles = (it, set) => { const [w, h] = FS.buildings[it.type].size; for (let j = it.y; j < it.y + h; j++) for (let i = it.x; i < it.x + w; i++) set.add(j * W + i); return set; };
  // items: [{ rid, type, x, y, fixed }] in production order (farm first). Every item that isn't fixed gets the free spot
  // closest to the steps it trades with (within 1 tile they get the best saving), then closest to (ax, ay),
  // leaning the way the chain grows. Items with no room nearby stay on the anchor and show as blocked.
  Game.blueprintFit = function (items, ax, ay, dir) {
    // a big chain looks further out for room
    const area = items.reduce((n, it) => n + FS.buildings[it.type].size[0] * FS.buildings[it.type].size[1], 0);
    const taken = new Set(), [dx, dy] = Game.BP_DIRS[dir & 3], R = Math.max(Game.BP_RADIUS, Math.ceil(Math.sqrt(area)) + 6), placed = [];
    for (const it of items) if (it.fixed) { bpTiles(it, taken); placed.push(it); }
    for (const it of items) {
      if (it.fixed) continue;
      const [w, h] = FS.buildings[it.type].size;
      const links = placed.filter((o) => bpLinked(o.rid, it.rid)).map((o) => [o.x, o.y, ...FS.buildings[o.type].size]);
      let best = null, bs = Infinity;
      for (let y = ay - R; y <= ay + R; y++) for (let x = ax - R; x <= ax + R; x++) {
        // the score is cheap, so the ground check only runs on spots that would win
        const cx = x + w / 2 - ax - 0.5, cy = y + h / 2 - ay - 0.5;
        let sc = Math.hypot(cx, cy) * 0.6 - (cx * dx + cy * dy) * 0.3;
        for (const [ox, oy, ow, oh] of links) sc += Math.max(0, Game.gap(x, y, w, h, ox, oy, ow, oh) - 1) * 3;
        if (sc >= bs || Game.spotErr(it.type, x, y, 0, taken)) continue;
        bs = sc; best = [x, y];
      }
      [it.x, it.y] = best || [ax, ay];
      if (best) { bpTiles(it, taken); placed.push(it); }
    }
    return Game.blueprintCheck(items);
  };
  // Sets it.err on every item that can't be built where it stands (ground, land, or another blueprint building).
  Game.blueprintCheck = function (items) {
    for (const it of items) {
      const others = new Set();
      for (const o of items) if (o !== it) bpTiles(o, others);
      it.err = Game.spotErr(it.type, it.x, it.y, 0, others);
    }
    return items;
  };
  Game.blueprintCost = (items) => items.reduce((n, it) => n + FS.buildings[it.type].cost, 0);
  // Links inside the blueprint close enough for the best proximity saving, out of all links.
  Game.blueprintLinks = function (items) {
    let near = 0, all = 0;
    for (let a = 0; a < items.length; a++) for (let b = a + 1; b < items.length; b++) {
      const A = items[a], B = items[b];
      if (!bpLinked(A.rid, B.rid)) continue;
      all++;
      if (Game.gap(A.x, A.y, ...FS.buildings[A.type].size, B.x, B.y, ...FS.buildings[B.type].size) <= 1) near++;
    }
    return { near, all };
  };
  // Builds the whole blueprint and pays once. idle: [{ id, rid }] idle buildings to put to work on the way.
  Game.placeBlueprint = function (items, idle) {
    const S = Game.S;
    Game.blueprintCheck(items);
    const bad = items.find((it) => it.err);
    if (bad) { Game.toast(`${FS.buildings[bad.type].name}: ${bad.err}. Drag it somewhere else first.`, 'bad'); return null; }
    if (items.some((it) => !Game.buildingUnlocked(it.type) || !Game.stepUnlocked(it.rid))) { Game.toast('Part of this blueprint is not unlocked yet.', 'bad'); return null; }
    const cost = Game.blueprintCost(items);
    if (S.money < cost) { Game.toast(`This blueprint costs 💰${cost.toLocaleString('en')}. You have 💰${Math.floor(S.money).toLocaleString('en')}.`, 'bad'); return null; }
    S.money -= cost; S.stats.spent += cost; dayStats().build += cost;
    const out = items.map((it) => { const b = place(it.type, it.x, it.y, true); setRecipe(b.id, it.rid); if (it.rate) b.rate = it.rate; return b; });
    let woke = 0;
    for (const a of idle || []) { const b = S.buildings.find((x) => x.id === a.id); if (b && !b.recipe) { setRecipe(b.id, a.rid); woke++; } }
    S.stats.blueprints = (S.stats.blueprints || 0) + 1;
    Game.emit('blueprint', out);
    Game.toast(`📐 Blueprint built: ${out.length} building${out.length === 1 ? '' : 's'} for 💰${cost.toLocaleString('en')}` +
      (woke ? `, and ${woke} idle building${woke === 1 ? '' : 's'} put to work` : '') + '.', 'good', 'quiet');
    return out;
  };

  // ---------- Restaurants (Town) ----------
  // Unlocked by finishing stage C. The town has three districts, opening one after another, each with its own guests
  // and five cuisines they want. The player rents one restaurant per district, sets each restaurant's menu and price level, and competes for the district's guests with a rival.
  // Guests eat dishes straight out of the farm's warehouse, so every restaurant is only as good as the supply chain
  // behind it. Each guest gives a 1 to 5 star score from hidden rules; the rating is the average of the last `window`
  // guests. The rules are never shown as numbers: guest reviews hint at them ("no Italian at all? Shame").
  //   missing: a dish on the menu that is out of stock gives 1 star, whatever else.
  //   cplx:    long supply chains (FS.complexity rawCount) taste of the work behind them; Grand Cuisine dishes a bit more.
  //   taste:   a dish of one of the district's cuisines is liked; any other dish is out of place.
  //   price:   each district has a price level it likes; one step off is fine, two steps off is not.
  //   cover:   a good menu has every one of the district's five cuisines on it; each one missing costs stars.
  //   (menu)   guests only come once a menu has `menuMin` dishes, and only a full menu can be rated 5 stars.
  //   stale:   a dish last cooked more than `stale` ago tastes like it sat around.
  //   special: in the Old Town, without Grand Cuisine (stage E) dishes on the menu the rating can't pass 4 stars; each
  //            one lifts that ceiling by 0.2, so 5 of them allow 5 stars.
  // Guests of a district pick a restaurant by rating (cubed), so a better rating takes guests from the others.
  // Rivals: one per district on a lot of its own. Their rating drifts, drops while the player takes most of the
  // district's guests; all three rivals belong to one corporation. Once a year each district's food critic names its
  // Restaurant of the Year. The Legacy (the game's last goal): finish Grand Cuisine, win gold from all three critics in
  // the same year, and accept the corporation's offer to sell out.
  // The town opens once enough dishes are discovered (Game.FEATURES.restaurants.dishes), whatever the stage; a player
  // who races through the cuisines gets there between stages B and C. Once open it stays open.
  Game.townDishes = () => Game.FEATURES.restaurants.dishes;
  Game.restaurantsUnlocked = () => {
    const S = Game.S;
    if (S.townOpen) return true;
    if (Object.keys(S.discovered).length < Game.townDishes()) return false;
    S.townOpen = S.time;
    Game.emit('unlock', 'restaurants');
    Game.emit('town');
    return true;
  };
  Game.TOWN = {
    menuMax: 12, menuMin: 4, window: 30, minGuests: 8, gap: 12, upkeep: 8, stale: DAY, rent: [5000, 5000], // rent: first, then + per restaurant
    prices: [{ id: 'low', name: 'Low', mult: 1.3 }, { id: 'fair', name: 'Fair', mult: 1.6 }, { id: 'high', name: 'High', mult: 2 }],
    stars: [[4, 2], [4.75, 5]], // toques the first time a restaurant reaches each rating
    newRating: 3.5, // how a restaurant without a rating yet competes for guests
  };
  const YEAR = 4 * SEASON_LEN;
  Game.YEAR = YEAR;
  const chainMemo = {};
  // Does anything in the dish's chain (ingredients and what they are made of, not animal feed) pass test(item)?
  function chainHas(id, key, test) {
    const k = key + ':' + id;
    if (chainMemo[k] !== undefined) return chainMemo[k];
    const seen = new Set();
    const walk = (i) => {
      if (seen.has(i)) return false;
      seen.add(i);
      const x = FS.items[i];
      if (test(x)) return true;
      if (STOP.has(x.cat) || x.raw) return false;
      const r = x.dish ? FS.dishRecipe[i] : x.bestRecipe;
      return !!r && Object.keys(r.inputs).some(walk);
    };
    return (chainMemo[k] = Object.keys(FS.dishRecipe[id].inputs).some(walk));
  }
  const stageOf = (id) => FS.cuisineOf(id).stage;
  // The districts, in the order they open (Game.DISTRICT_ORDER). price: the price level its guests like best (0 low,
  // 1 fair, 2 high). cuisines: the five cuisines its guests want; every cuisine belongs to exactly one district. The
  // Market Quarter wants the early, cheap cuisines, the Harbour the middle ones from the sea, the Old Town the last ones.
  Game.DISTRICTS = [
    { id: 'old_town', name: 'Old Town', who: 'Wealthy locals and tourists', traffic: 1, price: 2, color: '#8e3b5a',
      cuisines: ['french_belgian', 'italian', 'haute_cuisine', 'patisserie_chocolaterie', 'grand_banquets'], short: 'fine dining · high prices',
      likeLine: ['Exactly the kind of refined cooking the Old Town deserves.', 'The {dish} was a little masterpiece.'],
      priceLine: ['Not cheap, but worth every coin.', 'Prices so low it felt like a canteen. Is the food any good?'] },
    { id: 'harbour', name: 'Harbour', who: 'Sailors, fishermen and day-trippers', traffic: 1, price: 1, color: '#2f6fa3',
      cuisines: ['nordic_dutch', 'mediterranean_middle_eastern', 'east_asian', 'south_southeast_asian', 'the_americas'], short: 'coastal cooking · fair prices',
      likeLine: ['You can smell the sea in that {dish}.', 'Best {dish} on the whole waterfront.'],
      priceLine: ['Fair prices, like a harbour place should have.', 'Way too pricey for the waterfront.'] },
    { id: 'market', name: 'Market Quarter', who: 'Families, students and neighbours', traffic: 1.3, price: 0, color: '#c77d1e',
      cuisines: ['farmhouse_kitchen', 'swiss_alpine', 'british_irish', 'german_austrian_hungarian', 'around_the_world'], short: 'hearty food · low prices',
      likeLine: ['Tastes just like my grandmother\'s {dish}.', 'The kids are still talking about the {dish}.'],
      priceLine: ['Good food at honest prices. We\'ll be back.', 'Nice, but a family can\'t afford to eat here often.'] },
  ];
  for (const d of Game.DISTRICTS) {
    d.like = (id) => d.cuisines.includes(FS.cuisineOf(id).id);
    d.grand = d.cuisines.some((cz) => FS.cuisineById[cz].stage === 'E'); // its ratings need Grand Cuisine dishes to pass 4 stars
  }
  // Districts open one after another: the Market Quarter with the town; the Harbour once your Market restaurant is
  // rated 4 stars; the Old Town once your Harbour restaurant is too and stage D is finished (the Fine Dining licence).
  Game.DISTRICT_ORDER = ['market', 'harbour', 'old_town'];
  Game.districtNeed = function (did) {
    const k = Game.DISTRICT_ORDER.indexOf(did), prev = Game.DISTRICT_ORDER[k - 1];
    if (!prev) return [];
    const pd = Game.district(prev), pr = Game.restaurants().find((r) => Game.lot(r.spot).district === prev);
    const need = [{ text: `Your ${pd.name} restaurant rated ★★★★`, done: Game.districtOpen(prev) && !!pr && pr.best >= 4 }];
    if (did === 'old_town') need.push({ text: Game.featureKnown('finedining') ? `The Fine Dining licence (finish ${Game.stageName('D')})` : `Finish ${Game.stageName('D')}`, done: Game.stageDone('D') });
    return need;
  };
  Game.districtOpen = function (did) {
    const t = Game.S.town;
    if (!Game.restaurantsUnlocked()) return false;
    if (did === Game.DISTRICT_ORDER[0] || (t && t.open && t.open[did])) return true;
    return false;
  };
  function checkDistricts() {
    const t = town();
    t.open = t.open || {};
    for (const did of Game.DISTRICT_ORDER.slice(1)) {
      if (t.open[did] || !Game.districtNeed(did).every((x) => x.done)) continue;
      t.open[did] = true;
      Game.emit('unlock', did);
      Game.emit('town');
    }
  }
  // The district cuisines the menu has no dish of.
  Game.missingCuisines = (r) => { const on = Game.menuCuisines(r); return Game.districtOf(r).cuisines.filter((c) => !on.includes(c)); };
  Game.districtOfCuisine = (cz) => Game.DISTRICTS.find((d) => d.cuisines.includes(cz));
  // What the player has learned about a district's cuisines: only the food critic says it outright. On each visit the
  // critic names the cuisines on your menu that don't belong; the others on the menu are then known to be right.
  // S.town.notes = {district: {right: [cuisine ids], wrong: [cuisine ids]}}.
  Game.cuisineNotes = (did) => ((Game.S.town && Game.S.town.notes) || {})[did] || { right: [], wrong: [] };
  Game.district = (id) => Game.DISTRICTS.find((d) => d.id === id);
  // Restaurant lots: one per district for the player to rent, and one per district where a rival has its restaurant.
  Game.LOTS = [
    { id: 'ot1', district: 'old_town', name: 'Cathedral Lane', rname: 'The Golden Toque' },
    { id: 'hb1', district: 'harbour', name: 'Fish Quay', rname: 'The Anchor' },
    { id: 'mk1', district: 'market', name: 'Market Row', rname: 'The Market Table' },
    { id: 'rv1', district: 'old_town', name: 'Rue des Nobles', rival: 'cw_old_town' },
    { id: 'rv2', district: 'harbour', name: 'Net Mender\'s Row', rival: 'cw_harbour' },
    { id: 'rv3', district: 'market', name: 'University Road', rival: 'cw_market' },
  ];
  Game.lot = (id) => Game.LOTS.find((l) => l.id === id);
  Game.spot = Game.lot; // older name
  // The rival: one big corporation with a restaurant in every district. base: the rating each branch hovers around.
  // theme: how well it does on each critic theme (0 to 0.5).
  Game.CORP = { name: 'Crestwell & Co', owner: 'the Crestwell Group', offer: 500000 };
  Game.RIVALS = [
    { id: 'cw_market', name: 'Crestwell Diner', owner: 'the Crestwell Group', lot: 'rv3', base: 3.9, price: 0, colors: ['#2b3a67', '#e3b341'],
      blurb: 'Fast, cheap and everywhere. It never runs out, and it never surprises.',
      theme: { open: 0.5, master: 0.2, local: 0.2, long: 0, grand: 0 } },
    { id: 'cw_harbour', name: 'Crestwell Fish House', owner: 'the Crestwell Group', lot: 'rv2', base: 4.2, price: 1, colors: ['#2b3a67', '#e3b341'],
      blurb: 'Crestwell bought the old harbour inn and kept the nets on the walls.',
      theme: { local: 0.45, master: 0.4, open: 0.3, long: 0.1, grand: 0 } },
    { id: 'cw_old_town', name: 'Maison Crestwell', owner: 'the Crestwell Group', lot: 'rv1', base: 4.5, price: 2, colors: ['#2b3a67', '#e3b341'],
      blurb: 'The flagship: white tablecloths, a famous name, and the Crestwell board at the best table.',
      theme: { long: 0.4, grand: 0.35, local: 0.3, master: 0.3, open: 0.15 } },
  ];
  Game.rival = (id) => Game.RIVALS.find((x) => x.id === id);
  const GUESTS = ['Anna', 'Ben', 'Chiara', 'Dev', 'Elif', 'Femi', 'Greta', 'Hiro', 'Ines', 'Jonas', 'Kofi', 'Lena', 'Mateo', 'Nadia', 'Olu', 'Priya',
    'Quentin', 'Rosa', 'Sven', 'Tariq', 'Ursula', 'Vik', 'Wen', 'Ximena', 'Yusuf', 'Zoe'];
  // S.town = { v: 2, rests: [restaurant], next, rivals: {id: rival state}, dist: {id: {wait, share}} }.
  // restaurant = { id, spot (lot id), name, menu: [dish ids], price: 0..2, scores: [1..5], reviews: [{ t, who, stars, dish, f, text }],
  //   served, missed, earned, best, outAt: {dish: time of last review}, bought (a rival's restaurant you bought) }
  // rival state = { rating, served, sold, promo (until), beaten }
  // Saves from before the districts had six lots of their own (old_town, station, ...): their restaurants move to a
  // lot in the matching district.
  const OLD_LOT = { old_town: 'old_town', harbour: 'harbour', station: 'market', university: 'market', park: 'market', market: 'market' };
  const OLD_LOT2 = { ot2: 'old_town', hb2: 'harbour', mk2: 'market' };
  function town() {
    const S = Game.S, t = (S.town = S.town || { rests: [], next: 1 });
    if (!t.v || t.v < 2) {
      t.v = 2;
      for (const r of t.rests) {
        if (Game.lot(r.spot)) continue;
        const free = Game.LOTS.filter((l) => !l.rival && !t.rests.some((x) => x.spot === l.id));
        const l = free.find((x) => x.district === OLD_LOT[r.spot]) || free[0];
        r.spot = l.id;
      }
    }
    if (!t.rivals) t.rivals = {};
    if (t.v === 2) {
      // Version 3: one lot per district and no buyouts. Bought rivals reopen; a restaurant on a lot that no longer exists
      // moves to its district's lot if that is free, otherwise it closes.
      t.v = 3;
      t.rests = t.rests.filter((r) => {
        if (r.bought) { const rv = Game.RIVALS.find((x) => x.lot === r.spot); if (rv && t.rivals[rv.id]) t.rivals[rv.id].sold = false; return false; }
        if (Game.lot(r.spot)) return true;
        const did = OLD_LOT2[r.spot], l = Game.LOTS.find((x) => x.district === did && !x.rival);
        if (!l || t.rests.some((x) => x.spot === l.id)) return false;
        r.spot = l.id;
        return true;
      });
    }
    if (t.v === 3) {
      // Version 4: districts open in order and the rivals are one corporation. Districts where you already run a
      // restaurant stay open.
      t.v = 4;
      t.open = t.open || {};
      for (const r of t.rests) t.open[Game.lot(r.spot).district] = true;
    }
    for (const rv of Game.RIVALS) if (!t.rivals[rv.id]) t.rivals[rv.id] = { rating: rv.base, served: 0, sold: false, promo: 0, beaten: false };
    if (!t.dist) t.dist = {};
    for (const d of Game.DISTRICTS) if (!t.dist[d.id]) t.dist[d.id] = { wait: 5, share: 0.5 };
    return t;
  }
  Game.town = () => (Game.S.town ? town() : null);
  Game.restaurants = () => (Game.S.town ? town().rests : []);
  Game.restaurantAt = (lotId) => Game.restaurants().find((r) => r.spot === lotId) || null;
  Game.districtOf = (r) => Game.district(Game.lot(r.spot).district);
  Game.rentCost = () => Game.TOWN.rent[0] + Game.TOWN.rent[1] * Game.restaurants().filter((r) => !r.bought).length;
  Game.townUpkeep = () => Game.TOWN.upkeep * Game.restaurants().length;
  function newRestaurant(lotId, name, bought) {
    const t = town(), r = { id: t.next++, spot: lotId, name, menu: [], price: 1, scores: [], reviews: [], served: 0, missed: 0, earned: 0, best: 0, outAt: {} };
    if (bought) r.bought = true;
    t.rests.push(r);
    return r;
  }
  Game.openRestaurant = function (lotId) {
    const S = Game.S, l = Game.lot(lotId), cost = Game.rentCost();
    if (!Game.restaurantsUnlocked()) return Game.toast(`Discover ${Game.townDishes()} dishes to open restaurants.`, 'bad');
    if (!l || l.rival || Game.restaurantAt(lotId)) return;
    if (!Game.districtOpen(l.district)) return Game.toast(`The ${Game.district(l.district).name} is not open for you yet.`, 'bad');
    if (S.money < cost) return Game.toast('Not enough money to rent this spot.', 'bad');
    S.money -= cost; S.stats.spent += cost; dayStats().build += cost;
    const r = newRestaurant(lotId, l.rname);
    Game.toast(`🍴 ${r.name} on ${l.name} is yours! Put some dishes on its menu so guests can come.`, 'good', 'quiet');
    Game.emit('town');
    return r;
  };
  Game.closeRestaurant = function (id) {
    const t = town(), r = t.rests.find((x) => x.id === id);
    if (!r || r.bought) return;
    t.rests = t.rests.filter((x) => x !== r);
    Game.toast(`🍴 ${r.name} has closed its doors.${r.chef ? ` Head chef ${r.chef.name} has moved on.` : ''}`, '', 'quiet');
    Game.emit('town');
  };
  const restOf = (id) => Game.restaurants().find((x) => x.id === id);
  Game.setMenu = function (id, dishId, on) {
    const r = restOf(id);
    if (!r) return;
    if (on && !r.menu.includes(dishId)) {
      if (!Game.S.discovered[dishId]) return Game.toast('Only dishes you have discovered can go on a menu.', 'bad');
      if (r.menu.length >= Game.TOWN.menuMax) return Game.toast(`A menu holds at most ${Game.TOWN.menuMax} dishes.`, 'bad');
      r.menu.push(dishId);
    } else if (!on) r.menu = r.menu.filter((x) => x !== dishId);
    Game.emit('town');
  };
  Game.setPriceLevel = function (id, k) { const r = restOf(id); if (r && Game.TOWN.prices[k]) { r.price = k; Game.emit('town'); } };
  Game.renameRestaurant = function (id, name) {
    const r = restOf(id), n = String(name || '').trim().slice(0, 32);
    if (r && n) { r.name = n; Game.emit('town'); }
  };
  // Guests eat at night too, but far fewer of them.
  const busy = () => { const h = (Game.S.time % DAY) / HOUR; return h >= 23 || h < 7 ? 0.3 : 1; };
  Game.rating = (r) => (r.scores.length < Game.TOWN.minGuests ? null : Math.min(Game.ratingCap(r), r.scores.reduce((a, b) => a + b, 0) / r.scores.length));
  Game.grandCount = (r) => r.menu.filter((id) => stageOf(id) === 'E').length;
  // Only a full menu can reach 5 stars: each empty slot takes 0.15 off the limit (8 dishes: 4.4, 4 dishes: 3.8).
  Game.menuCap = (r) => 5 - 0.15 * Math.max(0, Game.TOWN.menuMax - r.menu.length);
  Game.ratingCap = (r) => Math.min(5, Game.menuCap(r), (Game.districtOf(r).grand ? 4 + 0.2 * Math.min(5, Game.grandCount(r)) : 5) + (r.chef ? Game.HEAD.cap[r.chef.lvl - 1] : 0));
  // Head chefs: an Academy chef promoted to run a restaurant's kitchen, for toques. Guests like dishes of the chef's
  // speciality better (taste, by level), and a good chef lifts how high the restaurant's rating can go (cap).
  // Chefs train in the Academy; a head chef can still be trained at the restaurant for the Academy's prices.
  Game.HEAD = { promote: 5, taste: [0.2, 0.3, 0.4], cap: [0.1, 0.2, 0.3] };
  Game.headChefsUnlocked = () => Game.stageDone('D'); // part of the Fine Dining licence
  Game.headBonus = (r, id) => (r.chef && FS.cuisineOf(id).id === r.chef.cz ? Game.HEAD.taste[r.chef.lvl - 1] : 0);
  Game.promoteChef = function (chefId, rid) {
    const S = Game.S, A = academy(), c = A.chefs.find((x) => x.id === chefId), r = restOf(rid), cost = Game.HEAD.promote;
    if (!c || !r || !Game.headChefsUnlocked()) return;
    if (r.chef) return Game.toast(`${r.name} already has a head chef.`, 'bad');
    if ((S.toques || 0) < cost) return Game.toast(`Making ${c.name} head chef costs 🎩${cost} toques.`, 'bad');
    S.toques -= cost;
    A.chefs = A.chefs.filter((x) => x !== c);
    r.chef = { name: c.name, cz: c.cz, lvl: c.lvl };
    S.stats.headChefs = (S.stats.headChefs || 0) + 1;
    Game.toast(`👨‍🍳 ${c.name} leaves the Academy to run the kitchen of ${r.name}. Guests will notice the ${FS.cuisineById[c.cz].name} dishes.`, 'good', 'quiet');
    Game.emit('academy'); Game.emit('town');
  };
  Game.trainHead = function (rid) {
    const S = Game.S, r = restOf(rid), c = r && r.chef;
    if (!c || c.lvl >= Game.ACADEMY.levels.length) return;
    const cost = Game.trainCost(c);
    if ((S.toques || 0) < cost) return Game.toast(`Training costs 🎩${cost} toques.`, 'bad');
    S.toques -= cost; c.lvl++;
    Game.toast(`👨‍🍳 ${c.name} is now a level ${c.lvl} head chef.`, 'good', 'quiet');
    Game.emit('town');
  };
  Game.dismissHead = function (rid) {
    const r = restOf(rid);
    if (!r || !r.chef) return;
    Game.toast(`👨‍🍳 ${r.chef.name} has left ${r.name}.`, '', 'quiet');
    delete r.chef;
    Game.emit('town');
  };
  Game.menuCuisines = (r) => [...new Set(r.menu.map((id) => FS.cuisineOf(id).id))];
  // Dishes of a cuisine served at a restaurant rated at least `stars`, now or before (each dish counted once).
  // S.town.rated = {dish: best rating it was served at}.
  Game.cuisineRated = function (c, stars) {
    const on = new Set(), done = (Game.S.town && Game.S.town.rated) || {};
    for (const r of Game.restaurants()) { const v = Game.rating(r); if (v !== null && v >= stars) for (const id of r.menu) on.add(id); }
    return c.dishIds.filter((id) => on.has(id) || done[id] >= stars).length;
  };
  // How a guest liked a dish: each hidden rule adds or takes away from 3 stars. Returns { score, f: {rule: change} }.
  function judge(r, id) {
    const d = Game.districtOf(r), f = {}, rc = FS.complexity(id).rawCount;
    f.cplx = (rc >= 12 ? 0.6 : rc >= 8 ? 0.3 : rc < 5 ? -0.3 : 0) + (stageOf(id) === 'E' ? 0.3 : 0);
    f.taste = d.like(id) ? 0.3 : -0.8;
    f.price = [0.3, 0, -0.5][Math.abs(r.price - d.price)];
    f.cover = [0.4, 0, -0.4, -0.8, -0.8, -0.8][Game.missingCuisines(r).length];
    const at = (Game.S.cookedAt || {})[id];
    f.stale = at === undefined || Game.S.time - at > Game.TOWN.stale ? -0.5 : 0;
    f.chef = Game.headBonus(r, id);
    f.master = Game.mastered(id) ? Game.MASTERY.guest : 0;
    const score = Math.max(1, Math.min(5, 3 + Object.values(f).reduce((a, b) => a + b, 0)));
    return { score, f };
  }
  Game.judge = judge;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  // A review line for the rule that mattered most to this guest (good or bad, depending on their score).
  function reviewText(r, id, rule, good) {
    const d = Game.districtOf(r), dish = FS.items[id].name;
    const fill = (s) => s.replace(/\{dish\}/g, dish);
    switch (rule) {
      case 'missing': return pick([`Came all this way for the ${dish}, and they had run out.`, `The ${dish} is on the menu but not in the kitchen. Left hungry.`, `Sorry, no ${dish} today, they said. Again!`]);
      case 'stale': return pick([`The ${dish} tasted like it had been sitting around for days.`, `Was the ${dish} cooked this week? It didn't taste like it.`]);
      case 'cplx': return good ? pick([`You can taste every step that went into the ${dish}. Superb.`, `The ${dish} had real depth to it.`]) : `The ${dish} was fine, but a bit plain for a restaurant.`;
      case 'chef': return pick([`You can tell ${r.chef.name} knows ${FS.cuisineById[r.chef.cz].name} cooking. That ${dish}!`, `Chef ${r.chef.name} came out to ask how the ${dish} was. Perfect, of course.`]);
      case 'master': return pick([`The ${dish} here is the best I've ever had.`, `Whoever perfected this ${dish} deserves a medal.`]);
      case 'special': return pick(['The menu is good, but nothing here is truly special.', `Solid ${dish}. Still, I was hoping for something grand.`]);
    }
    return '';
  }
  function addReview(r, id, rule, score) {
    const good = score >= 3.5;
    const text = reviewText(r, id, rule, good);
    // Skip a line one of the last few guests already wrote.
    if (!text || r.reviews.slice(-4).some((x) => x.text === text)) return;
    r.reviews.push({ t: Game.S.time, who: pick(GUESTS), stars: Math.round(score), dish: id, f: rule, text });
    if (r.reviews.length > 20) r.reviews.shift();
    Game.emit('review', r);
  }
  // One guest eats at restaurant r.
  function guest(r) {
    const S = Game.S, d = Game.districtOf(r);
    // Guests lean towards what their district likes.
    const w = r.menu.map((id) => (d.like(id) ? 2.5 : 1)), tot = w.reduce((a, b) => a + b, 0);
    let x = Math.random() * tot, k = 0;
    while (k < w.length - 1 && (x -= w[k]) > 0) k++;
    const id = r.menu[k];
    let score, rule;
    if ((S.inv[id] || 0) < 1) {
      score = 1; rule = 'missing'; r.missed++;
      if (S.time - (r.outAt[id] || -1e9) > 2 * HOUR) { r.outAt[id] = S.time; addReview(r, id, rule, score); }
      Game.emit('guest', { lot: r.spot, miss: true });
    } else {
      S.inv[id] -= 1;
      const pay = FS.items[id].value * Game.TOWN.prices[r.price].mult * Game.dishMult(id);
      earn(pay, id, 1, 'guests');
      r.served++; r.earned += pay;
      const rv = Game.rating(r), rated = (town().rated = town().rated || {});
      if (rv !== null && !(rated[id] >= rv)) rated[id] = rv;
      const j = judge(r, id);
      score = j.score;
      // Guests never say which cuisines they want (taste, cover): that only shows in the stars, and the critic tells.
      const good = score >= 3.5, rules = Object.entries(j.f).filter(([k, v]) => k !== 'taste' && k !== 'cover' && (good ? v > 0 : v < 0)).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
      rule = rules.length ? (Math.random() < 0.7 ? rules[0][0] : pick(rules)[0]) : null;
      // Near the ceiling, guests say what is missing for the top stars.
      if (good && score > Game.ratingCap(r) && Math.random() < 0.4) rule = 'special';
      if (rule && Math.random() < 0.3) addReview(r, id, rule, Math.min(score, Game.ratingCap(r)));
      Game.emit('inv');
      Game.emit('guest', { lot: r.spot, pay, dish: id });
    }
    r.scores.push(score);
    if (r.scores.length > Game.TOWN.window) r.scores.shift();
    const v = Game.rating(r);
    for (const [at, n] of Game.TOWN.stars) if (v !== null && v >= at && r.best < at) {
      r.best = at;
      Game.addToques(n);
      Game.toast(`🍴 ${r.name} is now rated ${'★'.repeat(Math.round(at))}! +${n} 🎩 toques`, 'good', true);
    }
  }
  Game.guest = guest;

  // ----- Competition: who gets a district's next guest -----
  const critic = () => Game.S.critic;
  // Critic news goes to the journal; the UI pops it as a toast only when the Town's banner isn't already saying it.
  const criticNews = (msg) => { Game.journal({ type: 'msg', kind: 'good', text: msg }); Game.emit('critic-news', msg); };
  // The Restaurant of the Year draws more guests for a year.
  const awardBoost = (lotId) => { const c = critic(), b = c && c.v === 2 && c.boost[Game.lot(lotId).district]; return b && b.lot === lotId && Game.S.time < b.until ? 1.3 : 1; };
  Game.awardBoost = awardBoost;
  // Everyone competing in a district: [{ lot, r (yours) or rv (a rival's), rating, weight }].
  Game.contenders = function (did) {
    const t = town(), out = [];
    for (const r of t.rests) {
      if (Game.lot(r.spot).district !== did || r.menu.length < Game.TOWN.menuMin) continue;
      const v = Game.rating(r), rating = v === null ? Game.TOWN.newRating : v;
      out.push({ lot: r.spot, r, rating, weight: rating ** 3 * awardBoost(r.spot) });
    }
    for (const rv of Game.RIVALS) {
      const st = t.rivals[rv.id];
      if (st.sold || Game.lot(rv.lot).district !== did) continue;
      out.push({ lot: rv.lot, rv, rating: st.rating, weight: st.rating ** 3 * (Game.S.time < st.promo ? 2 : 1) * awardBoost(rv.lot) });
    }
    return out;
  };
  // Share of a district's guests going to your restaurants right now.
  Game.yourShare = function (did) {
    const c = Game.contenders(did), tot = c.reduce((a, x) => a + x.weight, 0);
    return tot ? c.filter((x) => x.r).reduce((a, x) => a + x.weight, 0) / tot : 0;
  };
  // Every game hour a rival's rating drifts towards its base, a little up or down from day to day, and lower while
  // you take most of its district's guests. When you first overtake a rival it cuts prices for a day.
  function tickRivals(hours) {
    const t = town(), day = Game.dayOf();
    for (const rv of Game.RIVALS) {
      const st = t.rivals[rv.id];
      if (st.sold) continue;
      const did = Game.lot(rv.lot).district, share = t.dist[did].share;
      const wob = (Math.sin(day * 12.9898 + rv.base * 78.233) * 43758.5453 % 1) * 0.3; // the same all day, -0.3 to 0.3
      const target = Math.max(rv.base - 0.6, Math.min(4.9, rv.base + wob - 1.0 * Math.max(0, share - 0.5)));
      st.rating += (target - st.rating) * Math.min(1, 0.08 * hours);
      const best = Math.max(0, ...t.rests.filter((r) => Game.lot(r.spot).district === did).map((r) => Game.rating(r) || 0));
      if (!st.beaten && best > st.rating) {
        st.beaten = true; st.promo = Game.S.time + DAY;
        Game.toast(`📰 ${rv.name} is losing guests to you and cuts its prices for a day to win them back.`, '', true);
      } else if (st.beaten && best < st.rating - 0.2) st.beaten = false;
    }
  }
  function tickTown(dt) {
    if (!Game.S.town) return;
    const t = town(), S = Game.S;
    for (const d of Game.DISTRICTS) {
      const ds = t.dist[d.id];
      if ((ds.wait -= dt) > 0) continue;
      const c = Game.contenders(d.id);
      if (!c.some((x) => x.r)) { ds.wait = 5; continue; }
      ds.wait = (Game.TOWN.gap / (d.traffic * busy() * (0.5 + 0.5 * c.length))) * (0.6 + Math.random() * 0.8);
      let x = Math.random() * c.reduce((a, y) => a + y.weight, 0), k = 0;
      while (k < c.length - 1 && (x -= c[k].weight) > 0) k++;
      const win = c[k];
      ds.share += ((win.r ? 1 : 0) - ds.share) * 0.03;
      if (win.r) guest(win.r);
      else { t.rivals[win.rv.id].served++; Game.emit('guest', { lot: win.lot, rival: true }); }
    }
    t.hourAcc = (t.hourAcc || 0) + dt;
    if (t.hourAcc >= HOUR) { tickRivals(t.hourAcc / HOUR); t.hourAcc = 0; }
    checkDistricts();
    tickCritic();
    if (!S.legacyWon) checkLegacy();
  }

  // ----- The food critics: one per district, each visits once a year, in winter -----
  // min: the score a restaurant needs for each place; a place nobody reaches stays empty.
  Game.CRITIC = { toques: [8, 4, 2], prize: [20000, 8000, 4000], min: [4.5, 4.3, 4.1] };
  Game.CRITICS = [
    { district: 'old_town', name: 'Hélène Marchand', paper: 'Town Gazette', she: 'she' },
    { district: 'harbour', name: 'Morgan Fisk', paper: 'Harbour Herald', she: 'he' },
    { district: 'market', name: 'Rosa Brandt', paper: 'Market Crier', she: 'she' },
  ];
  Game.criticOf = (did) => Game.CRITICS.find((x) => x.district === did);
  Game.THEMES = [
    { id: 'long', name: 'The long road', desc: 'dishes with long supply chains, the more raw ingredients the better' },
    { id: 'local', name: 'Local favourite', desc: 'menus with only the cuisines the district loves' },
    { id: 'master', name: 'Perfected', desc: 'mastered dishes on the menu' },
    { id: 'open', name: 'Never runs out', desc: 'restaurants that never turn a guest away from now until the visit' },
    { id: 'grand', name: 'A grand occasion', desc: 'Grand Cuisine dishes on the menu' },
  ];
  Game.theme = (id) => Game.THEMES.find((x) => x.id === id);
  // How well a menu fits a theme, 0 to 0.5.
  function themeBonus(r, theme) {
    const m = r.menu, d = Game.districtOf(r);
    if (!m.length) return 0;
    switch (theme) {
      case 'long': return Math.max(0, Math.min(0.5, (m.reduce((a, id) => a + FS.complexity(id).rawCount, 0) / m.length - 6) / 14));
      case 'local': return 0.5 * m.filter((id) => d.like(id)).length / m.length;
      case 'master': return Math.min(0.5, 0.1 * m.filter((id) => Game.mastered(id)).length);
      case 'open': return Math.max(0, 0.5 - 0.05 * (r.missed - ((critic().miss0 || {})[r.id] || 0)));
      case 'grand': return 0.1 * Math.min(5, Game.grandCount(r));
    }
    return 0;
  }
  Game.themeBonus = themeBonus;
  // S.critic = { v: 2, year, rumour, miss0: {restaurant id: missed then}, visits: {district: {theme, at, done}},
  //   boost: {district: {lot, until}}, gold: {district: year of its last gold for you}, allGold (year), history: [{ year, district, theme, list }] }
  const winterStart = (year) => year * YEAR + 6 * DAY;
  function planCritic(year) {
    const S = Game.S;
    if (!S.critic || S.critic.v !== 2) S.critic = { v: 2, history: [], boost: {}, gold: {} };
    const c = S.critic, last = c.visits || {};
    c.year = year; c.rumour = false; c.miss0 = {}; c.visits = {};
    for (const cr of Game.CRITICS) {
      const themes = Game.THEMES.filter((x) => !last[cr.district] || x.id !== last[cr.district].theme);
      c.visits[cr.district] = { theme: pick(themes).id, at: winterStart(year) + (0.15 + Math.random() * 0.7) * 2 * DAY, done: false };
    }
    for (const r of Game.restaurants()) c.miss0[r.id] = r.missed;
    criticNews(`📰 This winter each district's food critic picks its Restaurant of the Year. See what they look for in the 📰 Town Guide.`);
    Game.emit('critic');
  }
  Game.planCritic = planCritic;
  Game.criticDone = () => { const c = critic(); return !c || !c.visits || Object.values(c.visits).every((v) => v.done); };
  function tickCritic() {
    const S = Game.S, c = S.critic;
    if (!Game.restaurantsUnlocked()) return;
    const year = Math.floor(S.time / YEAR);
    if (!c || c.v !== 2 || (Game.criticDone() && c.year < year)) {
      // Too close to this year's visits when restaurants open: the critics come next year.
      planCritic(S.time - year * YEAR > 5 * DAY ? year + 1 : year);
      return;
    }
    if (!c.rumour && S.time >= winterStart(c.year)) {
      c.rumour = true;
      criticNews('🕵️ Three people with notebooks got off the train this morning. The critics are in town: keep every menu stocked!');
    }
    for (const cr of Game.CRITICS) { const v = c.visits[cr.district]; if (!v.done && S.time >= v.at) runCritic(cr.district); }
  }
  // A visit: one dish at every restaurant of the district, the rival too, scored on rating, that dish, and the theme.
  function runCritic(did) {
    const S = Game.S, c = S.critic, t = town(), v = c.visits[did], cr = Game.criticOf(did), list = [];
    for (const r of t.rests) {
      if (!r.menu.length || Game.lot(r.spot).district !== did) continue;
      const id = pick(r.menu), rv = Game.rating(r), base = rv === null ? 3 : rv;
      let dish, note;
      if ((S.inv[id] || 0) < 1) { dish = 1; note = 'out'; }
      else {
        dish = Math.min(Game.ratingCap(r), judge(r, id).score);
        const at = (S.cookedAt || {})[id];
        note = at === undefined || S.time - at > Game.TOWN.stale ? 'stale' : dish >= 4.3 ? 'great' : dish >= 3.5 ? 'good' : 'meh';
      }
      const bonus = themeBonus(r, v.theme), d = Game.district(did), czs = Game.menuCuisines(r);
      const wrong = czs.filter((cz) => !d.cuisines.includes(cz)), right = czs.filter((cz) => d.cuisines.includes(cz));
      const notes = (t.notes = t.notes || {}), n = (notes[did] = notes[did] || { right: [], wrong: [] });
      for (const cz of wrong) if (!n.wrong.includes(cz)) n.wrong.push(cz);
      for (const cz of right) if (!n.right.includes(cz)) n.right.push(cz);
      list.push({ lot: r.spot, rid: r.id, name: r.name, dish: id, note, bonus, theme: v.theme, wrong, district: did, score: 0.6 * base + 0.4 * dish + bonus });
    }
    for (const rv of Game.RIVALS) {
      const st = t.rivals[rv.id];
      if (st.sold || Game.lot(rv.lot).district !== did) continue;
      const bonus = (rv.theme[v.theme] || 0) * (0.6 + Math.random() * 0.6);
      list.push({ lot: rv.lot, rival: rv.id, name: rv.name, bonus, score: st.rating + bonus + (Math.random() - 0.5) * 0.3 });
    }
    list.sort((a, b) => b.score - a.score);
    // Each place goes to the best restaurant not yet placed that reaches its minimum score, so a place can stay empty.
    const C = Game.CRITIC;
    let k0 = 0;
    for (let k = 0; k < 3; k++) if (list[k0] && list[k0].score >= C.min[k]) list[k0++].place = k + 1;
    const gold = list.find((x) => x.place === 1);
    for (const x of list) {
      if (x.rival || !x.place) continue;
      const k = x.place - 1;
      Game.addToques(C.toques[k]);
      S.money += C.prize[k]; dayStats().bonus += C.prize[k];
    }
    const yours = gold && !gold.rival;
    if (yours) c.gold[did] = c.year;
    c.boost[did] = gold ? { lot: gold.lot, until: S.time + YEAR } : null;
    v.done = true;
    if (Game.CRITICS.every((x) => c.gold[x.district] === c.year)) c.allGold = c.year;
    c.history.push({ year: c.year, district: did, theme: v.theme, list });
    if (c.history.length > 12) c.history.shift();
    const mine = list.find((x) => !x.rival && x.place);
    Game.toast(`🏆 ${cr.paper}: ${gold ? `${gold.name} is the ${Game.district(did).name}'s Restaurant of the Year!` : `nobody in the ${Game.district(did).name} was good enough for first place.`}` +
      (yours ? ` That's yours! +${C.toques[0]} 🎩 and 💰${C.prize[0].toLocaleString('en-US')}.`
        : mine ? ` ${mine.name}, yours, came ${['', 'first', 'second', 'third'][mine.place]}.` : ''), yours ? 'good' : '', true);
    checkLegacy();
    Game.emit('critic', c.history[c.history.length - 1]);
  }
  Game.runCritic = runCritic;
  // The critic's line about one of your restaurants.
  Game.criticLine = function (x) {
    const czs = (x.wrong || []).map((cz) => FS.cuisineById[cz].name), dn = x.district ? Game.district(x.district).name : 'this district';
    const call = !x.district ? '' : czs.length ? ` And what is ${czs.length > 1 ? czs.slice(0, -1).join(', ') + ' and ' + czs[czs.length - 1] : czs[0]} cooking doing on a menu in the ${dn}? It does not belong here.`
      : ' Every cuisine on this menu belongs in the ' + dn + '.';
    return criticBase(x) + call;
  };
  function criticBase(x) {
    const dish = x.dish ? FS.items[x.dish].name : '';
    const th = { long: 'the long road behind every plate', local: 'how well it knows its neighbours', master: 'dishes cooked to perfection', open: 'a kitchen that never lets a guest down', grand: 'a sense of occasion' }[(x.theme || '')] || '';
    switch (x.note) {
      case 'out': return `I asked for the ${dish}. They had none. A menu is a promise, and this one was broken.`;
      case 'stale': return `The ${dish} had clearly been waiting for me for some time. Freshness is not optional.`;
      case 'great': return `The ${dish} was the best thing I ate all year.${x.bonus >= 0.3 && th ? ` And ${th}, too.` : ''}`;
      case 'good': return `A very good ${dish}.${x.bonus >= 0.3 && th ? ` I liked ${th}.` : x.bonus < 0.15 ? ' It did not quite speak to this year\'s theme.' : ''}`;
      default: return `The ${dish} was honest, but it did not stay with me.${x.bonus < 0.15 ? ' Nor did it fit this year\'s theme.' : ''}`;
    }
  }


  // ----- The Legacy: the game's final goal -----
  // Once all three critics give you gold in the same year, the Crestwell Group offers to sell you its restaurants.
  Game.legacy = function () {
    const c = Game.S.critic || {}, n = c.v === 2 ? Game.CRITICS.filter((x) => (c.gold || {})[x.district] === c.year).length : 0;
    return [
      { id: 'grand', text: 'Finish Grand Cuisine', done: Game.stageDone('E'), prog: null },
      { id: 'critic', text: 'Win gold from all three critics in the same year', done: c.allGold !== undefined, prog: [n, 3] },
      { id: 'corp', text: `Buy out ${Game.CORP.name}`, done: !!Game.S.corpBought, prog: null },
    ];
  };
  Game.corpOffer = () => { const c = Game.S.critic || {}; return c.allGold !== undefined && !Game.S.corpBought; };
  Game.acceptOffer = function () {
    const S = Game.S, cost = Game.CORP.offer, t = town();
    if (!Game.corpOffer()) return;
    if (S.money < cost) return Game.toast(`${Game.CORP.owner} wants 💰${cost.toLocaleString('en-US')}.`, 'bad');
    S.money -= cost; S.stats.spent += cost; dayStats().build += cost;
    for (const rv of Game.RIVALS) { t.rivals[rv.id].sold = true; newRestaurant(rv.lot, rv.name, true); }
    S.corpBought = S.time || 1; // never 0, which reads as not bought
    Game.toast(`🎉 ${Game.CORP.name} is yours: all three of its restaurants now serve food from your farm.`, 'good', 'quiet');
    checkLegacy();
    Game.emit('town');
  };
  // Cheat (console `win`): meet all three Legacy conditions (stages up to Grand Cuisine done, gold from every critic
  // this year, Crestwell bought, paying for it if short) and win it the normal way, finale included.
  Game.cheatLegacy = function () {
    const S = Game.S;
    if (S.legacyWon) return false;
    Game.cheatStage(FS.STAGES[FS.STAGES.length - 1].id);
    const t = town();
    t.open = t.open || {};
    for (const d of Game.DISTRICTS) t.open[d.id] = true;
    if (!S.critic || S.critic.v !== 2) planCritic(Math.floor(S.time / YEAR));
    const c = S.critic;
    for (const cr of Game.CRITICS) c.gold[cr.district] = c.year;
    if (c.allGold === undefined) c.allGold = c.year;
    if (S.corpBought) checkLegacy();
    else {
      offered = true; S.corpOffered = S.corpOffered || S.time || 1;
      if (S.money < Game.CORP.offer) Game.giveMoney(Game.CORP.offer - S.money);
      Game.acceptOffer();
    }
    return !!S.legacyWon;
  };
  let offered = false;
  function checkLegacy() {
    const S = Game.S;
    if (S.legacyWon || !S.town) return;
    if (Game.corpOffer() && !offered && !S.corpOffered) {
      offered = true; S.corpOffered = S.time;
      Game.toast(`📨 The Crestwell Group has had enough: they offer to sell you all three of their restaurants. See the 📰 Town Guide.`, 'good', true);
      Game.emit('offer');
    }
    if (Game.legacy().every((x) => x.done)) {
      S.legacyWon = S.time || 1;
      Game.toast('👑 The Legacy is complete: Grand Cuisine mastered, three golds from the critics, and Crestwell bought out. From root to dish, you did it all!', 'good', 'quiet');
      Game.emit('legacy');
    }
  }

  // ---------- Unlocks ----------
  // Buildings and production recipes unlock with the guided first steps (by completing goals) and by opening cuisines.
  let U = null;
  Game.stepsDone = () => FS.STEPS.filter((st) => !st.goal || Game.S.goalsDone[st.goal]).map((st) => st.id);
  Game.cuisinesOpen = () => FS.CUISINES.filter((c) => Game.S.cuisines[c.id]).map((c) => c.id);
  // Open cuisines, most recently opened first. Cuisines opened before the order was recorded (value true) count as
  // opened in stage order, before any numbered one.
  Game.cuisinesNewestFirst = function () {
    const S = Game.S, rank = (c, k) => (typeof S.cuisines[c.id] === 'number' ? 1e4 + S.cuisines[c.id] : k);
    return FS.CUISINES.map((c, k) => ({ c, r: rank(c, k) })).filter((x) => S.cuisines[x.c.id]).sort((a, b) => b.r - a.r).map((x) => x.c);
  };
  Game.unlockState = () => U;
  // Recomputes what is unlocked. Unless quiet, announces anything new.
  Game.refreshUnlocks = function (quiet) {
    const S = Game.S, old = U;
    U = FS.computeUnlocks(Game.stepsDone(), Game.cuisinesOpen());
    visibleMemo = {};
    if (quiet || !old) return;
    const newB = [...U.buildings].filter((b) => !old.buildings.has(b));
    const newR = [...U.recipes].filter((r) => !old.recipes.has(r));
    S.newB = S.newB || {};
    for (const b of newB) S.newB[b] = S.time;
    if (newB.length || newR.length) Game.emit('unlocked', { buildings: newB, recipes: newR });
  };
  Game.recipeUnlocked = (rid) => !U || U.recipes.has(rid);
  // A production step you can set a building to: unlocked recipes, and cooking dishes you have discovered.
  Game.stepUnlocked = (rid) => { const r = FS.recipeById[rid]; return r.dish ? !!Game.S.discovered[r.primary] && Game.buildingUnlocked(r.building) : Game.recipeUnlocked(rid); };
  Game.buildingUnlocked = (type) => (type === 'academy' ? Game.academyUnlocked() : !U || U.buildings.has(type));
  // An item is available once an unlocked recipe makes it, or you have ever had it in stock.
  Game.available = (id) => !U || U.items.has(id) || !!Game.S.seen[id];
  let visibleMemo = {};
  // Dishes show in the Cookbook once their cuisine is open and every ingredient is available (or once discovered).
  Game.dishVisible = function (id) {
    if (Game.S.discovered[id]) return true;
    if (visibleMemo[id] === undefined)
      visibleMemo[id] = !!Game.S.cuisines[FS.cuisineOf(id).id] && Object.keys(FS.dishRecipe[id].inputs).every(Game.available);
    return visibleMemo[id];
  };
  Game.on('newItem', () => (visibleMemo = {}));
  // What opening a cuisine would add on top of what is unlocked now.
  Game.cuisinePreview = function (cid) {
    const u = FS.computeUnlocks(Game.stepsDone(), Game.cuisinesOpen().concat(cid));
    return {
      buildings: [...u.buildings].filter((b) => !U.buildings.has(b)),
      recipes: [...u.recipes].filter((r) => !U.recipes.has(r)).length,
    };
  };
  // Which step or cuisine first unlocks a recipe (for "locked" hints). Returns { step } or { cuisine } or null.
  let sourceMap = null;
  Game.unlockSource = function (rid) {
    if (!sourceMap) {
      sourceMap = {};
      const ids = [];
      for (const st of FS.STEPS) {
        ids.push(st.id);
        for (const r of FS.computeUnlocks(ids, []).recipes) if (!sourceMap[r]) sourceMap[r] = { step: st };
      }
      for (const c of FS.CUISINES) for (const r of FS.computeUnlocks(ids, [c.id]).recipes) if (!sourceMap[r]) sourceMap[r] = { cuisine: c };
    }
    return sourceMap[rid] || null;
  };
  Game.sourceText = function (rid) {
    const s = Game.unlockSource(rid);
    if (!s) return 'not available';
    if (s.cuisine) {
      const st = s.cuisine.stage;
      if (Game.stageOpen(st)) return `the ${s.cuisine.name} cuisine (${Game.stageName(st)}) in 🍽️ Cuisines`;
      return Game.stageNext(st) ? `a cuisine of ${Game.stageName(st)}, the next stage` : 'a cuisine of a stage yet to be discovered';
    }
    const g = Game.goals.find((x) => x.id === s.step.goal);
    return `goal “${g ? g.text : s.step.name}”`;
  };

  Game.initGoals = () => {}; // the dish total now comes from the goal's own text getter
})();
