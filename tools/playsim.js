#!/usr/bin/env node
// Headless play-through benchmark: `node tools/playsim.js --help`.
//
// Loads the real game logic (js/data/*.js, js/model.js, js/game.js) into a Node vm without the UI and lets a simulated
// player play a whole game at accelerated speed: build supply chains, discover and cook dishes, deliver orders, open
// cuisines, hire the Wholesaler, chefs and the Dispatcher, and finally run restaurants for Grand Cuisine. Every random
// number (the game's own Math.random and the player's choices) comes from the run's seed, so a run is reproducible and
// two versions of the game can be compared on the same seeds.
//
// The player acts at a human cadence in game time: one action every ~10-25 game seconds (a few real seconds at ⏩),
// with the occasional break. Each run draws its own persona (pace, how often it checks orders, how good it is at
// guessing recipes, how readily it spends toques on hints...) so runs differ the way players do.
//
// Discovery is modelled, not cheated: the player knows which dish it is after (from the Cookbook silhouette and name),
// but each ingredient it hasn't been told costs Test Kitchen attempts (some are obvious from the name, others take a
// few tries). Hints, chefs and recipe postcards reveal ingredients exactly as in the game.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const FILES = ['js/version.js', 'js/data/core.js', 'js/data/buildings.js', 'js/data/raw.js', 'js/data/processing.js', 'js/data/dishes.js', 'js/data/about.js', 'js/data/unlocks.js', 'js/model.js', 'js/game.js'];

const HELP = `Root of All Dishes play-through benchmark

  node tools/playsim.js [options]

  --runs N         number of runs (seeds seed..seed+N-1), default 8
  --seed N         first seed, default 1
  --days N         stop a run after N game days, default 300
  --until X        'grand' (finish Grand Cuisine, default) or 'legacy' (also the Legacy goal)
  --jobs N         runs in parallel, default: CPU cores (max 8)
  --label NAME     name of the result file, default 'latest' (benchmarks/NAME.json and NAME.md)
  --baseline FILE  compare with an earlier result (e.g. benchmarks/baseline.json)
  --no-save        don't write result files
  --verbose        print the first run's actions and game messages
  --help

Results go to benchmarks/<label>.json (every run, milestones, daily samples) and benchmarks/<label>.md (summary).
Game time: 1 day = 600 game seconds = 10 real minutes at normal speed; a year = 8 days.`;

function parseArgs(argv) {
  const o = { runs: 8, seed: 1, days: 300, until: 'grand', jobs: Math.min(8, os.cpus().length), label: 'latest', baseline: null, save: true, verbose: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], v = () => argv[++i];
    if (a === '--runs') o.runs = +v();
    else if (a === '--seed') o.seed = +v();
    else if (a === '--days') o.days = +v();
    else if (a === '--until') o.until = v();
    else if (a === '--jobs') o.jobs = +v();
    else if (a === '--label') o.label = v();
    else if (a === '--baseline') o.baseline = v();
    else if (a === '--no-save') o.save = false;
    else if (a === '--verbose') o.verbose = true;
    else if (a === '--help' || a === '-h') { console.log(HELP); process.exit(0); }
    else { console.error('Unknown option ' + a + '\n\n' + HELP); process.exit(1); }
  }
  return o;
}

// ---------- Random numbers ----------
function mulberry(seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Loading the game ----------
let scripts = null;
function loadGame(seed, verbose) {
  if (!scripts) scripts = FILES.map((f) => new vm.Script(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
  const quiet = () => {};
  const ctx = { console: verbose ? console : { log: quiet, warn: quiet, info: quiet, error: console.error } };
  ctx.window = ctx; ctx.globalThis = ctx;
  ctx.localStorage = { getItem: () => null, setItem: quiet, removeItem: quiet };
  vm.createContext(ctx);
  // The game's own randomness (map, weather, orders, chefs, guests) follows the seed too.
  ctx.__seed = (seed * 2654435761) >>> 0;
  vm.runInContext(`Math.random = (${mulberry.toString()})(__seed);`, ctx);
  for (const s of scripts) s.runInContext(ctx);
  ctx.FS.finalize();
  ctx.Game.initGoals();
  localProx(ctx.Game, ctx.FS);
  return ctx;
}
// Game.prox caches each building's nearby-maker discounts but throws the whole cache away whenever any building
// changes, and recomputing it costs (buildings)². That is most of a late-game run. Here only the buildings close
// enough to the changed one to be affected (within the 6-tile reach of Game.PROX) are recomputed, with the game's own
// Game.proxAt, so the results are exactly the same.
function localProx(G, FS) {
  const cache = new Map(), reach = G.PROX.length;
  const near = (a, o) => {
    const [aw, ah] = FS.buildings[a.type].size, [ow, oh] = FS.buildings[o.type].size;
    return G.gap(a.x, a.y, aw, ah, o.x, o.y, ow, oh) <= reach;
  };
  for (const evt of ['built', 'moved', 'demolished', 'changed', 'reset']) {
    G.on(evt, (b) => {
      if (!b || !b.type || evt === 'moved' || evt === 'reset') { cache.clear(); return; }
      cache.delete(b.id);
      for (const o of G.S.buildings) if (cache.has(o.id) && near(b, o)) cache.delete(o.id);
    });
  }
  G.prox = function (b) {
    const c = cache.get(b.id);
    if (c && c.b === b) return c.m;
    const m = G.proxAt(b.type, b.x, b.y, b.recipe, b.id);
    cache.set(b.id, { b, m });
    return m;
  };
}

// ---------- The simulated player ----------
// Items each guided goal asks for: the player follows the 🎯 Goals list like a real one would.
const GOAL_ITEMS = {
  well: ['water'], harvest: ['wheat'], mill: ['wheat_flour'], bread: ['bread_loaf'], animals: ['chicken_egg'], feed: ['animal_feed'],
  butter: ['butter'], yeast: ['yeast'], salt: ['salt'], cheese: ['cheddar'], meat: ['pork_chop', 'beef_steak', 'whole_chicken', 'chicken_breast'],
  choc: ['dark_chocolate'],
};

function persona(rand) {
  const between = (a, b) => a + rand() * (b - a);
  return {
    pace: between(10, 22), // mean game seconds between actions
    breaks: between(0.01, 0.04), // chance per action of stepping away for a few game minutes
    orders: between(0.5, 1), // attention to the 📋 Orders window
    obvious: between(0.35, 0.65), // chance an ingredient is obvious from the dish's name
    tries: between(1.5, 3.5), // mean Test Kitchen attempts for an ingredient that isn't obvious
    hints: between(0.2, 0.9), // willingness to spend toques on 💡 hints
    parallel: 1 + Math.floor(rand() * 3), // dishes worked on at the same time
    reserve: between(150, 500), // money kept back early on (grows with the stage)
    expand: between(0.6, 1.4), // weight on building extra capacity
    seller: between(0.6, 1.4), // weight on selling at the Market by hand
    kitchens: between(0.6, 1.4), // weight on building more kitchens
  };
}

class Bot {
  constructor(ctx, seed, log) {
    this.G = ctx.Game; this.FS = ctx.FS;
    this.rand = mulberry((seed * 7919 + 17) >>> 0);
    this.p = persona(this.rand);
    this.log = log;
    this.targets = []; // { kind: 'dish' | 'item', id, since, found: Set, tries: {ingredient: attempts left} }
    this.skip = {}; // dish or item id -> game time until which it is not picked again
    this.needLand = 0; // game time a placement last failed for lack of room
    this.counts = {}; // actions taken, by kind
    this.waitKitchen = {}; // kitchen id -> game time it started waiting for an input
    this.restCuisine = {}; // restaurant id -> E cuisine id it serves
    this.toques = { earned: {}, spent: {}, earnedTotal: 0, spentTotal: 0 };
    // Where toques come from: Game.addToques is wrapped and the caller read off the stack (it is called rarely).
    const add = this.G.addToques, T = this.toques;
    this.G.addToques = function (n) {
      const st = new Error().stack;
      const src = /\bat (?:Object\.)?dispatch\b/.test(st) ? 'orders (Dispatcher)' : /\bat (?:Object\.)?(paid|tickOrders)\b/.test(st) ? 'orders'
        : /\bat (?:Object\.)?checkCuisines\b/.test(st) ? 'cuisine targets and 🏆 all dishes'
        : /\bat (?:Object\.)?guest\b/.test(st) ? 'restaurant stars' : /\bat (?:Object\.)?runCritic\b/.test(st) ? 'food critic' : 'other';
      T.earned[src] = (T.earned[src] || 0) + n; T.earnedTotal += n;
      return add.apply(this, arguments);
    };
  }
  get S() { return this.G.S; }
  r() { return this.rand(); }
  pick(a) { return a[Math.floor(this.r() * a.length)]; }
  inv(id) { return this.S.inv[id] || 0; }
  stageIndex() { return this.FS.STAGES.indexOf(this.G.currentStage()); }
  reserve() { return this.baseReserve() + this.saving(); }
  baseReserve() { return this.p.reserve * (1 + 1.5 * this.stageIndex()); }
  // A player saves up for the Wholesaler once he is unlocked, and for his next level when his "room left now" is
  // stuck near zero, instead of spending every coin on buildings (most of whose goods he then can't take).
  saving() {
    const G = this.G, lvl = G.wholesalerLevel(), next = G.WHOLESALER.levels[lvl];
    return next && G.wholesalerUnlocked() && (!lvl || this.wsBusy > 0.5) ? next.cost : 0;
  }
  affordable(cost) { return this.S.money - cost >= this.reserve(); }

  // Seconds until the next action: the persona's pace with some spread, and now and then a break.
  gap() {
    let g = this.p.pace * (0.4 + 1.2 * this.r());
    if (this.r() < this.p.breaks) g += 60 + this.r() * 240;
    return g;
  }

  // ----- Rates at nominal growth (ignoring season and weather, which the player can't change) -----
  rates() {
    const G = this.G, FS = this.FS, made = {}, used = {}, makers = {}, users = {};
    for (const b of this.S.buildings) {
      const r = FS.recipeById[b.recipe];
      if (!r || b.paused) continue;
      const k = (60 / r.time) * G.rateOf(b), p = G.prox(b);
      for (const [o, q] of Object.entries(r.outputs)) { made[o] = (made[o] || 0) + q * k; (makers[o] = makers[o] || []).push(b); }
      for (const [i, q] of Object.entries(r.inputs)) { used[i] = (used[i] || 0) + q * (1 - (p[i] ? p[i].d : 0)) * k; (users[i] = users[i] || []).push(b); }
    }
    return { made, used, makers, users };
  }

  // ----- Supply chains -----
  // The recipe the player would use to make an item: unlocked, preferably the item's main recipe, else the one needing
  // the fewest things not made yet.
  chooseRecipe(id, R) {
    const G = this.G, FS = this.FS;
    const cands = (FS.byOutput[id] || []).filter((r) => !r.dish && G.recipeUnlocked(r.id) && G.buildingUnlocked(r.building));
    if (!cands.length) return null;
    const best = FS.items[id].bestRecipe;
    const score = (r) => (r === best ? 0 : 1) + (r.primary === id ? 0 : 2) + Object.keys(r.inputs).filter((i) => !R.makers[i]).length * 1.5;
    return cands.sort((a, b) => score(a) - score(b))[0];
  }
  // Recipes still to build so that `need` of item id can be had: inputs first, the item's own step last.
  // Returns { list: [recipe], blocked: item id or null }.
  plan(id, need, R, out = { list: [], blocked: null }, stack = new Set()) {
    if (out.blocked || this.inv(id) >= need || R.makers[id] || out.list.some((r) => r.outputs[id]) || stack.has(id)) return out;
    const r = this.chooseRecipe(id, R);
    if (!r) { out.blocked = id; return out; }
    stack.add(id);
    // A new building should keep running, so its inputs need a maker unless there is plenty in stock.
    for (const [i, q] of Object.entries(r.inputs)) this.plan(i, q * 4, R, out, stack);
    stack.delete(id);
    if (!out.blocked) out.list.push(r);
    return out;
  }

  // What a dish still lacks to be cooked once: the steps to build for every ingredient short in stock.
  dishPlan(d, R) {
    const r = this.FS.dishRecipe[d], out = { list: [], blocked: null };
    for (const [i, q] of Object.entries(r.inputs)) if (this.inv(i) < q) this.plan(i, q, R, out);
    return out;
  }

  // ----- Placing buildings -----
  anchorFor(r, R) {
    const pts = [];
    for (const i of Object.keys(r.inputs)) for (const b of R.makers[i] || []) pts.push(b);
    for (const o of Object.keys(r.outputs)) for (const b of R.users[o] || []) pts.push(b);
    if (!pts.length) { const h = this.S.buildings.find((b) => b.type === 'farmhouse'); return [h.x, h.y]; }
    const b = this.pick(pts);
    return [b.x, b.y];
  }
  findSpot(type, ax, ay) {
    const G = this.G, maxR = 90;
    for (let rad = 0; rad <= maxR; rad++) {
      const ring = [];
      for (let dx = -rad; dx <= rad; dx++) { ring.push([ax + dx, ay - rad]); if (rad) ring.push([ax + dx, ay + rad]); }
      for (let dy = -rad + 1; dy <= rad - 1; dy++) { ring.push([ax - rad, ay + dy]); ring.push([ax + rad, ay + dy]); }
      for (const [x, y] of ring) if (!G.spotErr(type, x, y)) return [x, y];
    }
    return null;
  }
  // Builds one building for recipe r near the steps it trades with. Returns the building, or null.
  build(r, R, near) {
    const G = this.G, FS = this.FS, type = r ? r.building : near.type;
    const cost = FS.buildings[type].cost;
    if (this.S.money < cost) return null;
    const [ax, ay] = near && near.x !== undefined ? [near.x, near.y] : this.anchorFor(r, R);
    const spot = this.findSpot(type, ax, ay);
    if (!spot) { this.needLand = this.S.time; return null; }
    const b = G.place(type, spot[0], spot[1]);
    if (!b) return null;
    if (r) G.setRecipe(b.id, r.id);
    if (R) for (const o of Object.keys(r ? r.outputs : {})) (R.makers[o] = R.makers[o] || []).push(b);
    return b;
  }

  // ----- Targets: dishes to discover and cook, items the goals ask for -----
  cooked(id) { return (this.S.stats.produced[id] || 0) > 0; }
  // Done with a dish: cooked, and not a revealed challenge dish that still has to be made fresh.
  done(id) { return this.cooked(id) && !(this.G.sigPending(id) && !this.G.stageById(this.FS.cuisineOf(id).stage).rating); }
  pickTargets() {
    const G = this.G, FS = this.FS, S = this.S, now = S.time;
    this.targets = this.targets.filter((t) => (t.kind === 'dish' ? !this.done(t.id) : !this.cooked(t.id)) && !(this.skip[t.id] > now));
    // Goal items first: a player follows the guided goals.
    if (!this.targets.some((t) => t.kind === 'item')) {
      for (const g of G.goals) {
        if (S.goalsDone[g.id] || !GOAL_ITEMS[g.id]) continue;
        const id = GOAL_ITEMS[g.id].find((x) => G.available(x) && !(this.skip[x] > now));
        if (id && !this.cooked(id)) { this.targets.push({ kind: 'item', id, since: now }); break; }
      }
    }
    while (this.targets.filter((t) => t.kind === 'dish').length < this.p.parallel) {
      const t = this.nextDish();
      if (!t) break;
      this.targets.push(t);
      if (!S.stats.plans) S.stats.plans = 1; // a player opens 🗺️ Plan production for the dish they are after
    }
  }
  // The next dish to work on: open cuisines that still need dishes for their stage target (or every dish, for the
  // Dispatcher goal), cheapest to reach first, with some noise.
  nextDish() {
    const G = this.G, FS = this.FS, S = this.S, now = S.time, R = this.rates();
    const taken = new Set(this.targets.map((t) => t.id));
    const cur = G.currentStage();
    let best = null;
    for (const c of FS.CUISINES) {
      if (!S.cuisines[c.id]) continue;
      const st = G.stageById(c.stage);
      const need = !(S.cuisineDone || {})[c.id];
      // After its stage target, a cuisine is only worth finishing for the 🏆 toques (and the Dispatcher goal).
      const weight = need ? (st === cur ? 0 : 3) : 10;
      for (const id of c.dishIds) {
        if (this.done(id) || taken.has(id) || this.skip[id] > now || !G.dishVisible(id)) continue;
        const pl = this.dishPlan(id, R);
        if (pl.blocked) continue;
        const missing = Object.keys(FS.dishRecipe[id].inputs).filter((i) => !S.discovered[id] && !(S.revealed[id] || []).includes(i)).length;
        const cost = pl.list.reduce((n, r) => n + FS.buildings[r.building].cost, 0);
        // Revealed challenge dishes come first: they are all that stands between the player and the next stage.
        const score = (G.sigPending(id) ? -5 : weight) + cost / 600 + pl.list.length * 0.5 + missing * 0.2 + this.r() * 2.5;
        if (!best || score < best.score) best = { score, id };
      }
    }
    return best && { kind: 'dish', id: best.id, since: now, found: new Set(), tries: {} };
  }
  // Attempts the player still needs for each ingredient of a dish it hasn't been told: 0 when it is obvious from the
  // name, otherwise a geometric number of tries (mean p.tries).
  triesFor(t, ing) {
    if (t.tries[ing] === undefined) {
      if (this.r() < this.p.obvious) t.tries[ing] = 0;
      else { let n = 1; const q = 1 / this.p.tries; while (this.r() > q && n < 12) n++; t.tries[ing] = n; }
    }
    return t.tries[ing];
  }

  // ----- Choosing an action -----
  act() {
    const S = this.S;
    this.pickTargets();
    // How often the Wholesaler's budget for the minute is used up (a running average over the last ~10 actions).
    if (S.wholesaler) this.wsBusy = (this.wsBusy || 0) * 0.9 + (S.wholesaler.budget < this.G.wholesalerCap() * 0.1 ? 0.1 : 0);
    const R = this.rates();
    const opts = [];
    const add = (name, w, fn) => { if (w > 0) opts.push({ name, w, fn }); };
    this.optMoney(add, R);
    this.optOrders(add);
    this.optSell(add, R);
    this.optTargets(add, R);
    this.optBalance(add, R);
    this.optKitchens(add, R);
    this.optCuisines(add);
    this.optFeatures(add, R);
    this.optTown(add, R);
    if (!opts.length) { this.count('idle'); return 'idle'; }
    let x = this.r() * opts.reduce((n, o) => n + o.w, 0), k = 0;
    while (k < opts.length - 1 && (x -= opts[k].w) > 0) k++;
    const o = opts[k];
    const before = S.toques || 0, got = this.toques.earnedTotal;
    const res = o.fn();
    this.count(o.name);
    // Toques only go out through the player's own actions (hints, chefs, Dispatcher, mastery, head chefs).
    const spent = before + (this.toques.earnedTotal - got) - (S.toques || 0);
    if (spent > 0) { this.toques.spent[o.name] = (this.toques.spent[o.name] || 0) + spent; this.toques.spentTotal += spent; }
    if (this.log) this.log(`[${(S.time / 600).toFixed(2)}d] ${o.name}${res ? ': ' + res : ''}  (💰${Math.round(S.money)} 🎩${S.toques})`);
    return o.name;
  }
  count(n) { this.counts[n] = (this.counts[n] || 0) + 1; }

  optMoney(add) {
    const G = this.G, S = this.S, L = G.LOAN;
    if (S.money < 0 && (S.loan || 0) + L.step * (1 + L.fee) <= L.max + 0.5) add('borrow', 50, () => { G.borrow(); return `owe ${Math.round(S.loan)}`; });
    const plots = S.land.length;
    if (this.S.time - this.needLand < 600 && plots < G.PLOTS * G.PLOTS && this.affordable(G.landCost())) {
      add('buy land', 6, () => {
        const k = this.pick([...Array(G.PLOTS * G.PLOTS).keys()].filter((i) => G.plotBuyable(i)));
        if (k === undefined) return null;
        G.buyLand(k); this.needLand = 0;
        return `plot ${k}`;
      });
    }
  }

  optOrders(add) {
    const G = this.G, S = this.S;
    const ready = S.orders.filter((o) => G.orderReady(o));
    if (!ready.length) return;
    const w = (S.dispatcher ? 1 : 6) * this.p.orders * Math.min(3, ready.length);
    add('deliver order', w, () => {
      const o = ready.sort((a, b) => (b.reward || 0) - (a.reward || 0))[0];
      G.fulfil(o.id);
      return `${o.kind} for ${o.who}`;
    });
  }

  // What to keep of an item rather than sell it.
  keepOf(id, R, menu) {
    const it = this.FS.items[id];
    if (menu.has(id)) return 1e9;
    if (this.targets.some((t) => t.kind === 'dish' && this.FS.dishRecipe[t.id].inputs[id])) return 1e9;
    if (it.dish) return 6;
    if (R.used[id]) return Math.max(30, R.used[id] * 4);
    if (this.wanted.has(id)) return 10;
    return 0;
  }
  optSell(add, R) {
    const G = this.G, S = this.S;
    const menu = new Set(G.restaurants().flatMap((r) => r.menu));
    // Ingredients of dishes in open cuisines still to be cooked: a player keeps a few of those around.
    if (!this.wantedAt || S.time - this.wantedAt > 120) {
      this.wantedAt = S.time;
      this.wanted = new Set();
      for (const c of this.FS.CUISINES) if (S.cuisines[c.id]) for (const d of c.dishIds) if (!this.cooked(d)) for (const i in this.FS.dishRecipe[d].inputs) this.wanted.add(i);
    }
    let best = null;
    for (const [id, q] of Object.entries(S.inv)) {
      if (q < 1 || id === 'water') continue;
      const extra = Math.floor(q - this.keepOf(id, R, menu));
      if (extra < 1) continue;
      const n = Math.min(extra, 40), v = n * G.sellPrice(id);
      if (!best || v > best.v) best = { id, n, v };
    }
    if (!best || best.v < 20) return;
    const urgent = S.money < this.reserve() ? 4 : 1;
    // After the Wholesaler most selling happens by itself.
    const w = this.p.seller * urgent * (G.wholesalerLevel() ? 0.5 : 2) * Math.min(3, best.v / 150);
    add('sell', w, () => { const got = G.sell(best.id, best.n); return `${best.n} ${best.id} for ${Math.round(got)}`; });
  }

  optTargets(add, R) {
    const G = this.G, FS = this.FS, S = this.S;
    const hasKitchen = S.buildings.some((b) => b.type === 'kitchen');
    for (const t of this.targets) {
      if (t.kind === 'item') {
        const pl = this.plan(t.id, 1e9, R);
        if (pl.blocked) { this.skip[t.id] = S.time + 1200; continue; }
        if (!pl.list.length) continue; // being made: wait for it
        this.optBuildChain(add, pl.list, R, 'goal chain', 7);
        continue;
      }
      const d = t.id, r = FS.dishRecipe[d], ins = Object.keys(r.inputs);
      if (!hasKitchen) {
        if (G.buildingUnlocked('kitchen') && this.affordable(FS.buildings.kitchen.cost)) add('build kitchen', 6, () => (this.build(FS.byBuilding.kitchen[0], R, null) ? 'kitchen' : null));
        continue;
      }
      // Stop chasing a dish that has gone nowhere for a long time.
      if (S.time - t.since > 6 * G.DAY) { this.skip[d] = S.time + 4 * G.DAY; t.since = -1e9; continue; }
      const pl = this.dishPlan(d, R);
      if (pl.blocked) { this.skip[d] = S.time + 2 * G.DAY; continue; }
      if (pl.list.length) this.optBuildChain(add, pl.list, R, 'build chain', 7);
      if (!S.discovered[d]) {
        if (!ins.every((i) => S.seen[i])) continue;
        const known = new Set([...(S.revealed[d] || []), ...t.found]);
        const unknown = ins.filter((i) => !known.has(i));
        if (unknown.length && G.reveal && (S.toques || 0) >= G.revealCost(d) + this.toqueKeep() && unknown.reduce((n, i) => n + this.triesFor(t, i), 0) >= 3)
          add('hint', 3 * this.p.hints, () => { G.reveal(d); return FS.items[d].name; });
        add('experiment', 6, () => {
          // Ingredients obvious from the name cost no attempt.
          for (const i of unknown) if (this.triesFor(t, i) === 0) t.found.add(i);
          const next = unknown.find((i) => !t.found.has(i));
          if (next) {
            t.tries[next]--;
            if (t.tries[next] === 0) t.found.add(next);
            // A guess: the ingredients known so far plus something else. It may well be another dish.
            const guess = ins.filter((i) => known.has(i));
            const other = this.pick(Object.keys(S.seen).filter((i) => !FS.items[i].dish));
            if (other) guess.push(other);
            const res = guess.length ? G.experiment(guess) : null;
            return `try for ${FS.items[d].name}${res ? ' → ' + res.kind : ''}`;
          }
          const res = G.experiment(ins);
          return `${FS.items[d].name} → ${res.kind}${res.cooked ? ' (cooked)' : ''}`;
        });
      } else if (ins.every((i) => this.inv(i) >= r.inputs[i])) {
        add('cook', 7, () => { const res = G.experiment(ins); return `${FS.items[d].name}${res.cooked ? ' cooked' : ''}`; });
      }
    }
  }
  toqueKeep() {
    const G = this.G;
    // Save up for chefs once the Academy is near, and for the Dispatcher.
    return G.academyUnlocked() && G.chefs().length < 3 ? G.ACADEMY.hire[G.chefs().length] : 0;
  }
  // Offers building the next step of a chain; with Blueprints the whole chain goes down in one action.
  optBuildChain(add, list, R, name, w) {
    const G = this.G, FS = this.FS;
    const cost = list.reduce((n, r) => n + FS.buildings[r.building].cost, 0);
    if (G.blueprintsUnlocked() && list.length > 1 && this.affordable(cost)) {
      add('blueprint', w, () => { let n = 0; for (const r of list) if (this.build(r, R)) n++; this.S.stats.blueprints = (this.S.stats.blueprints || 0) + 1; return `${n} buildings`; });
      return;
    }
    const r = list[0];
    if (!this.affordable(FS.buildings[r.building].cost)) return;
    add(name, w, () => (this.build(r, R) ? r.id : null));
  }

  // More of whatever buildings keep waiting for.
  optBalance(add, R) {
    const G = this.G, FS = this.FS, S = this.S;
    const want = {};
    for (const b of S.buildings) {
      if (b.status !== 'missing') continue;
      if (b.type === 'kitchen' && !this.isMenuKitchen(b)) continue; // kitchens just get another dish
      for (const i of b.missing || []) if (!R.made[i] || R.made[i] < (R.used[i] || 0) * 1.05) want[i] = (want[i] || 0) + 1;
    }
    const items = Object.keys(want);
    if (!items.length) return;
    const id = items.sort((a, b) => want[b] - want[a] + (this.r() - 0.5))[0];
    const maker = (R.makers[id] || []).find((b) => b.status !== 'nomoney');
    if (maker) {
      const r = FS.recipeById[maker.recipe];
      if (!this.affordable(FS.buildings[r.building].cost)) return;
      const user = (R.users[id] || [])[0];
      add('add capacity', 3 * this.p.expand * Math.min(3, want[id]), () => (this.build(r, R, user || maker) ? `another ${r.id}` : null));
    } else {
      const pl = this.plan(id, 1e9, R);
      if (!pl.blocked && pl.list.length) this.optBuildChain(add, pl.list, R, 'supply chain', 3 * this.p.expand);
    }
  }

  isMenuKitchen(b) { return !!b.menuDish; }
  // Kitchens cook the most valuable dish whose inputs the farm makes; more kitchens as the farm grows.
  optKitchens(add, R) {
    const G = this.G, FS = this.FS, S = this.S;
    const kitchens = S.buildings.filter((b) => b.type === 'kitchen' && !b.menuDish);
    if (!kitchens.length) return;
    const busy = new Set(S.buildings.filter((b) => b.type === 'kitchen' && b.recipe).map((b) => b.recipe));
    const options = FS.byBuilding.kitchen.filter((r) => S.discovered[r.primary] && !busy.has(r.id) && Object.keys(r.inputs).every((i) => R.made[i] > 0))
      .map((r) => ({ r, v: FS.items[r.primary].value - Object.entries(r.inputs).reduce((n, [i, q]) => n + FS.items[i].value * q, 0) }))
      .sort((a, b) => b.v - a.v);
    for (const b of kitchens) {
      if (b.status === 'missing') this.waitKitchen[b.id] = this.waitKitchen[b.id] || S.time; else delete this.waitKitchen[b.id];
    }
    const idle = kitchens.find((b) => !b.recipe || (this.waitKitchen[b.id] && S.time - this.waitKitchen[b.id] > 240));
    if (idle && options.length) {
      add('set kitchen', 5, () => { const o = options[Math.floor(this.r() * Math.min(3, options.length))]; G.setRecipe(idle.id, o.r.id); delete this.waitKitchen[idle.id]; return o.r.primary; });
    }
    const allBusy = kitchens.every((b) => b.recipe && b.status !== 'missing' && b.status !== 'idle');
    const cap = 1 + this.stageIndex() * 2;
    if (allBusy && options.length && kitchens.length < cap && this.affordable(FS.buildings.kitchen.cost + 500))
      add('build kitchen', 1.5 * this.p.kitchens, () => { const b = this.build(FS.byBuilding.kitchen[0], R, null); if (b) G.setRecipe(b.id, null); return b ? 'kitchen' : null; });
  }

  optCuisines(add) {
    const G = this.G, FS = this.FS, S = this.S;
    if (!G.cuisinesReady()) return;
    const cur = G.currentStage();
    const closed = cur.cuisines.filter((c) => !S.cuisines[c.id]);
    if (!closed.length) return;
    const cost = G.cuisineCost(closed[0]);
    if (!this.affordable(cost)) return;
    // Keener when nothing in the open cuisines is left to chase.
    const w = this.targets.some((t) => t.kind === 'dish') ? 2 : 8;
    add('open cuisine', w, () => { const c = this.pick(closed); G.openCuisine(c.id); return c.name; });
  }

  optFeatures(add, R) {
    const G = this.G, FS = this.FS, S = this.S;
    // Wholesaler, then auto-sell (at his default) for dishes and for goods the farm makes more of than it uses.
    if (G.wholesalerUnlocked()) {
      const lvl = G.wholesalerLevel(), next = G.WHOLESALER.levels[lvl];
      const saved = this.saving() && S.money - next.cost >= this.baseReserve();
      if (next && (saved || this.affordable(next.cost * (lvl ? 2 : 1)))) add('hire wholesaler', lvl && !saved ? 1.5 : 5, () => { G.hireWholesaler(); return `level ${lvl + 1}`; });
      if (lvl) {
        const menu = new Set(S.buildings.filter((b) => b.menuDish).map((b) => b.menuDish));
        const cand = Object.keys(R.made).find((o) => o !== 'water' && G.autosellOf(o) == null && !menu.has(o) && (FS.items[o].dish || R.made[o] > (R.used[o] || 0) * 1.5));
        if (cand) add('auto-sell', 3, () => { G.setAutosell(cand, 'd'); return cand; });
      }
    }
    // Bigger storage with spare toques; keener in autumn, when animals need feed stocked for winter.
    const up = G.STORAGE[G.storageLevel() + 1];
    if (up && (S.toques || 0) >= up.toques + this.toqueKeep()) add('upgrade storage', G.seasonIndex() === 2 ? 3 : 1.5, () => { G.upgradeStorage(); return `${up.cap} per item`; });
    // Culinary Academy: build it, hire chefs with toques, keep them busy on the current stage's cuisines.
    if (G.academyUnlocked()) {
      const ac = G.academyBuilding();
      if (!ac && this.affordable(FS.buildings.academy.cost)) add('build academy', 4, () => (this.build(null, null, { type: 'academy', ...this.home() }) ? 'academy' : null));
      if (ac) {
        const chefs = G.chefs();
        if (chefs.length < G.ACADEMY.seats && (S.toques || 0) >= G.chefCost()) {
          const cands = G.candidates();
          if (cands.length) add('hire chef', 4, () => {
            const k = Math.max(0, cands.findIndex((c) => S.cuisines[c.cz] && !(S.cuisineDone || {})[c.cz]));
            const name = cands[k].name; G.hireChef(k); return name;
          });
        }
        const idle = chefs.find((c) => !c.dish);
        if (idle) {
          const cz = FS.CUISINES.filter((c) => S.cuisines[c.id] && G.chefTargets(c.id).length)
            .sort((a, b) => ((S.cuisineDone || {})[a.id] ? 1 : 0) - ((S.cuisineDone || {})[b.id] ? 1 : 0) || (a.id === idle.cz ? -1 : 0));
          if (cz.length) add('assign chef', 4, () => { G.assignChef(idle.id, 'cz:' + cz[0].id); return cz[0].name; });
        }
        const tr = chefs.find((c) => c.lvl < 3 && (S.toques || 0) >= G.trainCost(c) + 6);
        if (tr && chefs.length >= G.ACADEMY.seats) add('train chef', 1, () => { G.trainChef(tr.id); return tr.name; });
      }
    }
    // Dispatcher
    if (G.dispatcherUnlocked() && !S.dispatcher && this.affordable(G.DISPATCHER.cost) && (S.toques || 0) >= G.DISPATCHER.toques + 2)
      add('hire dispatcher', 2, () => { G.hireDispatcher(); return 'hired'; });
    // Dish mastery for dishes on restaurant menus, when toques pile up.
    if (G.masteryUnlocked() && (S.toques || 0) > 20) {
      const menu = [...new Set(G.restaurants().flatMap((r) => r.menu))];
      const id = menu.find((x) => !G.mastered(x) && (S.stats.produced[x] || 0) >= G.MASTERY.need && G.masterCost(x) <= S.toques - 12);
      if (id) add('master dish', 1, () => { G.masterDish(id); return id; });
    }
  }
  home() { const h = this.S.buildings.find((b) => b.type === 'farmhouse'); return { x: h.x, y: h.y }; }

  // ----- Town: a restaurant per Grand Cuisine cuisine, each dish on its menu with a kitchen of its own -----
  // Lot and price level are chosen by how guests would judge the menu (Game.judge on a trial restaurant).
  trialScore(lot, price, menu) {
    const G = this.G;
    if (!menu.length) return 0;
    const r = { spot: lot, price, menu, chef: null };
    return menu.reduce((n, id) => n + G.judge(r, id).score, 0) / menu.length;
  }
  optTown(add, R) {
    const G = this.G, FS = this.FS, S = this.S;
    if (!G.restaurantsUnlocked()) return;
    const rests = G.restaurants();
    const ok = (id) => S.discovered[id] && this.cooked(id);
    // One restaurant per open district, opened once 4 dishes of its cuisines are cooked; at the end, buy out the corporation.
    if (G.corpOffer() && this.affordable(G.CORP.offer)) add('buy out corp', 5, () => { G.acceptOffer(); return G.CORP.name; });
    for (const d of G.DISTRICT_ORDER.map(G.district)) {
      const lot = G.LOTS.find((l) => l.district === d.id && !l.rival);
      if (!G.districtOpen(d.id) || G.restaurantAt(lot.id) || !this.affordable(G.rentCost())) continue;
      const dishes = FS.dishList.filter((x) => d.like(x.id) && ok(x.id));
      if (dishes.length < 4) continue;
      add('open restaurant', 5, () => { const r = G.openRestaurant(lot.id); return r ? `${d.name}` : null; });
      break;
    }
    const rated = (G.town() && G.town().rated) || {};
    for (const r of rests) {
      const d = G.districtOf(r);
      // Menu: first one dish of every district cuisine, then Grand Cuisine dishes not yet served at 4 stars, then the rest.
      const miss = G.missingCuisines(r).map((cz) => FS.cuisineById[cz].dishIds.find((id) => ok(id))).filter(Boolean);
      const grand = FS.dishList.filter((x) => (d.like(x.id) || G.sigPending(x.id)) && FS.cuisineOf(x.id).stage === 'E' && ok(x.id) && !r.menu.includes(x.id));
      const fresh = grand.filter((x) => !(rated[x.id] >= 4) || G.sigPending(x.id)).sort((a, b) => (G.sigPending(b.id) ? 1 : 0) - (G.sigPending(a.id) ? 1 : 0));
      const other = FS.dishList.filter((x) => d.like(x.id) && ok(x.id) && !r.menu.includes(x.id)).sort((a, b) => FS.complexity(b.id).rawCount - FS.complexity(a.id).rawCount);
      const next = miss[0] || (fresh[0] && fresh[0].id) || (grand[0] && grand[0].id) || (other[0] && other[0].id);
      if (next && r.menu.length < G.TOWN.menuMax) add('menu', 4, () => { G.setMenu(r.id, next, true); return `${r.name} + ${next}`; });
      else if (miss.length) {
        // Full menu but a district cuisine is missing: swap out a dish whose cuisine has another dish on the menu.
        const out = r.menu.slice().reverse().find((id) => r.menu.filter((x) => FS.cuisineOf(x).id === FS.cuisineOf(id).id).length > 1);
        if (out) add('menu swap', 4, () => { G.setMenu(r.id, out, false); G.setMenu(r.id, miss[0], true); return `${r.name} ${out} -> ${miss[0]}`; });
      }
      else if (fresh.length && (G.rating(r) || 0) >= 4) {
        // Full menu: swap a Grand Cuisine dish already served at 4 stars for one that was not, if its cuisine has another dish on the menu.
        const out = r.menu.find((id) => FS.cuisineOf(id).stage === 'E' && rated[id] >= 4 && r.menu.filter((x) => FS.cuisineOf(x).id === FS.cuisineOf(id).id).length > 1)
          || r.menu.find((id) => FS.cuisineOf(id).stage !== 'E' && r.menu.filter((x) => FS.cuisineOf(x).id === FS.cuisineOf(id).id).length > 1);
        if (out) add('menu swap', 2, () => { G.setMenu(r.id, out, false); G.setMenu(r.id, fresh[0].id, true); return `${r.name} ${out} -> ${fresh[0].id}`; });
      }
      // Best price level for the menu as it is.
      let bp = r.price, bv = this.trialScore(r.spot, r.price, r.menu);
      for (let p = 0; p < 3; p++) { const v = this.trialScore(r.spot, p, r.menu); if (v > bv + 0.05) { bv = v; bp = p; } }
      if (bp !== r.price) add('price level', 2, () => { G.setPriceLevel(r.id, bp); return `${r.name} ${bp}`; });
      // A head chef from the Academy lifts how high the rating can go; the Academy hires a replacement later.
      const chef = !r.chef && r.menu.length >= 4 && G.headChefsUnlocked() && G.chefs()[0];
      if (chef && (S.toques || 0) >= G.HEAD.promote + 2) add('promote head chef', 1.5, () => { G.promoteChef(chef.id, r.id); return `${chef.name} to ${r.name}`; });
      // A kitchen for every dish on the menu, so nothing runs out or goes stale.
      const has = new Set(S.buildings.filter((b) => b.menuDish).map((b) => b.menuDish));
      const need = r.menu.find((id) => !has.has(id));
      if (need) {
        const free = S.buildings.find((b) => b.type === 'kitchen' && !b.menuDish && (!b.recipe || this.waitKitchen[b.id]));
        if (free) add('menu kitchen', 5, () => { free.menuDish = need; G.setRecipe(free.id, FS.dishRecipe[need].id); if (G.autosellOf(need) != null) G.setAutosell(need, null); return need; });
        else if (this.affordable(FS.buildings.kitchen.cost)) add('menu kitchen', 5, () => {
          const b = this.build(FS.byBuilding.kitchen[0], R, null);
          if (!b) return null;
          b.menuDish = need; G.setRecipe(b.id, FS.dishRecipe[need].id);
          return need;
        });
      }
    }
  }
}

// ---------- One run ----------
const DISH_MARKS = [1, 10, 25, 50, 100, 150, 200, 300, 400, 450];
const TOQUE_MARKS = [10, 25, 50, 100, 200, 300];
function runOne(seed, opts) {
  const t0 = Date.now();
  const verbose = opts.verbose && seed === opts.seed;
  const ctx = loadGame(seed, verbose);
  const G = ctx.Game, FS = ctx.FS;
  const log = verbose ? (s) => console.log(s) : null;
  if (verbose) G.on('toast', (m) => console.log('   · ' + m));
  G.newGame();
  const S = G.S;
  S.tut = { well: true }; // the simulated player has clicked the Well (the first goal)
  // Each Game.tick(0.25) advances 0.25 × S.speed game seconds, at most 8, and never past the player's next action.
  // The game still steps every building each 0.5 game seconds inside a tick, so this only saves per-tick overhead.
  const bot = new Bot(ctx, seed, log);
  bot.until = opts.until;
  const ms = {}; // milestone -> game seconds
  const mark = (k) => { if (ms[k] === undefined) ms[k] = Math.round(S.time); };
  G.on('discovered', () => { const n = Object.keys(S.discovered).length; for (const m of DISH_MARKS) if (n >= m) mark('discovered ' + m); });
  const samples = [];
  let lastProgress = 0, progressKey = '', status = 'timeout', nextAct = 5, lastDay = -1;
  let debtTime = 0;
  const maxT = opts.days * G.DAY;
  const lastEarned = { e: 0, s: 0 };
  let tick = 0;
  while (S.time < maxT) {
    const dt = Math.max(0.5, Math.min(8, nextAct - S.time));
    S.speed = dt * 4;
    G.tick(0.25);
    tick++;
    if (S.money < 0) debtTime += dt;
    if (S.time >= nextAct) { bot.act(); nextAct = S.time + bot.gap(); }
    if (tick % 4) continue;
    // Milestones
    for (const g of G.goals) if (S.goalsDone[g.id]) mark('goal ' + g.id);
    for (const c of FS.CUISINES) { if (S.cuisines[c.id] && !c.steps) mark('open ' + c.id); if ((S.cuisineDone || {})[c.id]) mark('target ' + c.id); }
    for (const st of FS.STAGES) if (G.stageDone(st.id)) mark('stage ' + st.id);
    const cooked = FS.dishList.reduce((n, d) => n + ((S.stats.produced[d.id] || 0) > 0 ? 1 : 0), 0);
    for (const m of DISH_MARKS) if (cooked >= m) mark('cooked ' + m);
    if (S.wholesaler) { mark('wholesaler'); mark('wholesaler level ' + S.wholesaler.level); }
    if (G.academyBuilding()) mark('academy');
    if (G.chefs().length) mark('first chef');
    if (S.dispatcher) mark('dispatcher');
    if (S.stats.blueprints) mark('first blueprint');
    if (S.land.length > 1) mark('first land');
    if (G.restaurants().length) mark('first restaurant');
    if (G.restaurants().some((r) => (G.rating(r) || 0) >= 4)) mark('restaurant 4 stars');
    if (S.legacyWon) mark('legacy');
    for (const m of TOQUE_MARKS) if (bot.toques.earnedTotal >= m) mark('toques earned ' + m);
    // Daily samples
    const day = G.dayOf();
    if (day !== lastDay) {
      lastDay = day;
      samples.push({ day, money: Math.round(S.money), loan: Math.round(S.loan || 0), toques: S.toques, toquesEarned: bot.toques.earnedTotal, toquesSpent: bot.toques.spentTotal, buildings: S.buildings.length,
        kitchens: S.buildings.filter((b) => b.type === 'kitchen').length, discovered: Object.keys(S.discovered).length, cooked,
        earned: Math.round(S.stats.earned - lastEarned.e), spent: Math.round(S.stats.spent - lastEarned.s), orders: S.stats.ordersDone,
        stage: G.currentStage().id, land: S.land.length, restaurants: G.restaurants().length });
      lastEarned.e = S.stats.earned; lastEarned.s = S.stats.spent;
    }
    // Progress and the end
    const key = Object.keys(S.discovered).length + '/' + cooked + '/' + Object.keys(S.goalsDone).length + '/' + G.restaurants().length + '/' + Object.keys(S.cuisines).length + '/' + Object.keys((S.sig || {}).done || {}).length;
    if (key !== progressKey) { progressKey = key; lastProgress = S.time; }
    if (opts.until === 'legacy' ? S.legacyWon : G.stageDone('E')) { status = 'finished'; break; }
    if (S.time - lastProgress > 15 * G.DAY) {
      status = 'stalled';
      if (process.env.FS_SIG_DEBUG) console.error(`seed ${seed} stalled at ${G.currentStage().id}: challenge open ${G.sigOpen(G.currentStage().id)}, pending ${FS.dishList.filter((d) => G.sigPending(d.id)).map((d) => d.id).join(',')}, skip ${JSON.stringify(Object.keys(bot.skip).filter((k) => bot.skip[k] > S.time))}`);
      break;
    }
  }
  const cooked = FS.dishList.filter((d) => (S.stats.produced[d.id] || 0) > 0).length;
  if (process.env.FS_TOWN_DEBUG) for (const r of G.restaurants()) {
    const f = {};
    for (const id of r.menu) for (const [k, v] of Object.entries(G.judge(r, id).f)) f[k] = (f[k] || 0) + v / r.menu.length;
    console.error(`seed ${seed} ${r.name}: rating ${G.rating(r)} cap ${G.ratingCap(r)} price ${r.price} menu ${r.menu.length} missing ${G.missingCuisines(r).join(',')} missed ${r.missed}/${r.served} f ${JSON.stringify(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, +v.toFixed(2)])))}`);
  }
  return {
    seed, status, gameTime: Math.round(S.time), days: +(S.time / G.DAY).toFixed(2), simSeconds: +((Date.now() - t0) / 1000).toFixed(1),
    stage: G.currentStage().id, persona: Object.fromEntries(Object.entries(bot.p).map(([k, v]) => [k, +v.toFixed(2)])),
    milestones: ms,
    final: { money: Math.round(S.money), loan: Math.round(S.loan || 0), toques: S.toques, buildings: S.buildings.length, land: S.land.length,
      discovered: Object.keys(S.discovered).length, cooked, orders: S.stats.ordersDone, earned: Math.round(S.stats.earned), experiments: S.stats.experiments,
      restaurants: G.restaurants().length, ratings: G.restaurants().map((r) => +(G.rating(r) || 0).toFixed(2)), debtMinutes: Math.round(debtTime / 60),
      targets: bot.targets.map((t) => t.id) },
    actions: bot.counts,
    toques: { earned: bot.toques.earnedTotal, spent: bot.toques.spentTotal, left: S.toques, from: bot.toques.earned, on: bot.toques.spent,
      atStage: Object.fromEntries(FS.STAGES.map((st) => [st.id, (samples.find((x) => ms['stage ' + st.id] !== undefined && x.day >= ms['stage ' + st.id] / G.DAY) || {}).toques]).filter(([, v]) => v !== undefined)) },
    samples,
  };
}

// ---------- Many runs, summary and comparison ----------
function quantile(xs, q) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b), i = (s.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i);
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
}
const MS_ORDER = (k) => {
  const order = ['goal', 'discovered', 'cooked', 'open', 'target', 'stage', 'toques', 'first', 'wholesaler', 'academy', 'dispatcher', 'restaurant', 'legacy'];
  return order.findIndex((p) => k.startsWith(p));
};
function summarize(runs) {
  const keys = new Set();
  for (const r of runs) for (const k in r.milestones) keys.add(k);
  const rows = {};
  for (const k of keys) {
    const t = runs.map((r) => r.milestones[k]).filter((x) => x !== undefined).map((x) => x / 600);
    rows[k] = { reached: t.length, median: quantile(t, 0.5), p25: quantile(t, 0.25), p75: quantile(t, 0.75), min: Math.min(...t), max: Math.max(...t) };
  }
  const fin = runs.filter((r) => r.status === 'finished');
  // Key figures: medians over all runs.
  const med = (f) => { const v = runs.map(f).filter((x) => x !== undefined && x !== null); return v.length ? quantile(v, 0.5) : null; };
  const at = (r, d, k) => (r.samples.find((x) => x.day === d) || {})[k];
  const figures = {
    'player actions': med((r) => Object.values(r.actions).reduce((a, b) => a + b, 0)),
    'actions per game day': med((r) => Object.values(r.actions).reduce((a, b) => a + b, 0) / r.days),
    'Test Kitchen experiments': med((r) => r.final.experiments),
    'hints bought': med((r) => r.actions.hint || 0),
    'orders delivered': med((r) => r.final.orders),
    'buildings at the end': med((r) => r.final.buildings),
    'land plots at the end': med((r) => r.final.land),
    'dishes discovered at the end': med((r) => r.final.discovered),
    'dishes cooked at the end': med((r) => r.final.cooked),
    'game minutes in debt': med((r) => r.final.debtMinutes),
    'money on day 10': med((r) => at(r, 10, 'money')),
    'money on day 25': med((r) => at(r, 25, 'money')),
    'money on day 50': med((r) => at(r, 50, 'money')),
    'money on day 100': med((r) => at(r, 100, 'money')),
    'income on day 25 (one day)': med((r) => at(r, 25, 'earned')),
    'income on day 50 (one day)': med((r) => at(r, 50, 'earned')),
    'income on day 100 (one day)': med((r) => at(r, 100, 'earned')),
    'total earned': med((r) => r.final.earned),
    'toques earned': med((r) => r.toques && r.toques.earned),
    'toques spent': med((r) => r.toques && r.toques.spent),
    'toques unspent at the end': med((r) => r.toques && r.toques.left),
    'toques on day 25': med((r) => at(r, 25, 'toques')),
    'toques on day 50': med((r) => at(r, 50, 'toques')),
    'toques on day 100': med((r) => at(r, 100, 'toques')),
  };
  // Toques by source and by what they were spent on (medians; 0 when a run never used one).
  const tk = (k) => [...new Set(runs.flatMap((r) => Object.keys((r.toques || {})[k] || {})))];
  for (const src of tk('from')) figures['toques from ' + src] = med((r) => ((r.toques || {}).from || {})[src] || 0);
  for (const use of tk('on')) figures['toques spent on ' + use] = med((r) => ((r.toques || {}).on || {})[use] || 0);
  return {
    figures,
    runs: runs.length, finished: fin.length, stalled: runs.filter((r) => r.status === 'stalled').length,
    finishDays: { median: quantile(fin.map((r) => r.days), 0.5), min: fin.length ? Math.min(...fin.map((r) => r.days)) : null, max: fin.length ? Math.max(...fin.map((r) => r.days)) : null },
    simSeconds: +runs.reduce((n, r) => n + r.simSeconds, 0).toFixed(1),
    milestones: rows,
  };
}
const fmt = (x) => (x === null || x === undefined || !isFinite(x) ? '–' : x.toFixed(2));
function markdown(res, base) {
  const s = res.summary, b = base && base.summary;
  const out = [];
  out.push(`# Play-through benchmark: ${res.label}`, '');
  out.push(`${res.date} · ${s.runs} runs (seeds ${res.opts.seed}–${res.opts.seed + s.runs - 1}) · until ${res.opts.until} · max ${res.opts.days} days · ${s.simSeconds}s of simulation`, '');
  out.push(`Finished: **${s.finished} / ${s.runs}**${s.stalled ? ` (${s.stalled} stalled)` : ''} · median finish **${fmt(s.finishDays.median)} game days** (min ${fmt(s.finishDays.min)}, max ${fmt(s.finishDays.max)})` +
    (b ? ` · baseline ${b.finished} / ${b.runs}, median ${fmt(b.finishDays.median)}` : ''), '');
  out.push('Times are game days (1 day = 600 game seconds = 10 minutes at normal speed).', '');
  out.push(`| Milestone | Reached | Median | p25 | p75 | Min | Max |${b ? ' Baseline median | Δ |' : ''}`);
  out.push(`|---|---|---|---|---|---|---|${b ? '---|---|' : ''}`);
  const keys = Object.keys(s.milestones).sort((x, y) => MS_ORDER(x) - MS_ORDER(y) || (s.milestones[x].median - s.milestones[y].median));
  for (const k of keys) {
    const m = s.milestones[k], bm = b && b.milestones[k];
    let row = `| ${k} | ${m.reached}/${s.runs} | ${fmt(m.median)} | ${fmt(m.p25)} | ${fmt(m.p75)} | ${fmt(m.min)} | ${fmt(m.max)} |`;
    if (b) row += bm ? ` ${fmt(bm.median)} | ${m.median - bm.median >= 0 ? '+' : ''}${fmt(m.median - bm.median)} |` : ' – | new |';
    out.push(row);
  }
  if (b) for (const k of Object.keys(b.milestones)) if (!s.milestones[k]) out.push(`| ${k} | 0/${s.runs} | – | – | – | – | – | ${fmt(b.milestones[k].median)} | lost |`);
  out.push('', '| Key figure (median) | Value |' + (b ? ' Baseline |' : ''), '|---|---|' + (b ? '---|' : ''));
  for (const [k, v] of Object.entries(s.figures || {})) out.push(`| ${k} | ${v === null ? '–' : Math.round(v * 10) / 10} |` + (b ? ` ${b.figures && b.figures[k] != null ? Math.round(b.figures[k] * 10) / 10 : '–'} |` : ''));
  out.push('', '| Seed | Status | Days | Stage | Cooked | Discovered | Money | 🎩 earned / spent / left | Restaurants | Sim s |', '|---|---|---|---|---|---|---|---|---|---|');
  for (const r of res.runs) out.push(`| ${r.seed} | ${r.status} | ${r.days} | ${r.stage} | ${r.final.cooked} | ${r.final.discovered} | ${r.final.money} | ${r.toques ? `${r.toques.earned} / ${r.toques.spent} / ${r.toques.left}` : '–'} | ${r.final.ratings.join(' ') || '–'} | ${r.simSeconds} |`);
  return out.join('\n');
}

async function runAll(opts) {
  const seeds = Array.from({ length: opts.runs }, (_, i) => opts.seed + i);
  const jobs = Math.max(1, Math.min(opts.jobs, seeds.length));
  if (jobs === 1 || opts.verbose) return seeds.map((s) => { const r = runOne(s, opts); progress(r); return r; });
  const { Worker } = require('worker_threads');
  const results = [];
  let next = 0;
  await Promise.all(Array.from({ length: jobs }, () => new Promise((resolve, reject) => {
    const w = new Worker(__filename, { workerData: opts });
    const feed = () => { if (next < seeds.length) w.postMessage(seeds[next++]); else { w.terminate(); resolve(); } };
    w.on('message', (r) => { results.push(r); progress(r); feed(); });
    w.on('error', reject);
    feed();
  })));
  return results.sort((a, b) => a.seed - b.seed);
}
function progress(r) {
  process.stderr.write(`seed ${r.seed}: ${r.status} after ${r.days} days (stage ${r.stage}, ${r.final.cooked} dishes cooked) in ${r.simSeconds}s\n`);
}

const wt = (() => { try { return require('worker_threads'); } catch (e) { return {}; } })();
if (!wt.isMainThread && wt.parentPort) {
  wt.parentPort.on('message', (seed) => wt.parentPort.postMessage(runOne(seed, wt.workerData)));
} else if (require.main === module) {
  (async () => {
    const opts = parseArgs(process.argv.slice(2));
    const t0 = Date.now();
    const runs = await runAll(opts);
    const res = { label: opts.label, date: new Date().toISOString().slice(0, 16).replace('T', ' '), opts, summary: summarize(runs), runs };
    const base = opts.baseline ? JSON.parse(fs.readFileSync(opts.baseline, 'utf8')) : null;
    const md = markdown(res, base);
    console.log(md);
    console.log(`\n(${((Date.now() - t0) / 1000).toFixed(1)}s wall clock)`);
    if (opts.save) {
      const dir = path.join(ROOT, 'benchmarks');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, opts.label + '.json'), JSON.stringify(res));
      fs.writeFileSync(path.join(dir, opts.label + '.md'), md + '\n');
      console.log(`Saved benchmarks/${opts.label}.json and benchmarks/${opts.label}.md`);
    }
  })();
}

module.exports = { loadGame, runOne, summarize };
