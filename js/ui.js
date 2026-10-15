// DOM user interface: top bar, build menu, inspector, modals and input handling.
(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => Math.floor(n).toLocaleString('en-US');
  const num = (q) => (Math.abs(q - Math.round(q)) < 1e-6 ? String(Math.round(q)) : q < 0.1 ? q.toFixed(3) : q < 10 ? q.toFixed(2) : q.toFixed(1));
  // A sum of money: whole coins from 10 up, cents below.
  const coins = (v) => (v < 10 ? v.toFixed(2) : Math.round(v).toLocaleString('en-US'));
  const price = (v) => (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.round(v).toLocaleString('en-US'));
  const dur = (s) => (s < 60 ? `${Math.round(s)}s` : s < 3600 ? `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s` : `${Math.floor(s / 3600)}h ${Math.round((s % 3600) / 60)}m`);
  const it = (id) => FS.items[id];
  const catName = (c) => (FS.catInfo[c] || ['', c])[1];
  const catIcon = (c) => FSI.img('cat_' + c);
  const have = (id) => Math.floor(Game.S.inv[id] || 0);
  const rate = (q) => (q < 10 ? (Math.round(q * 10) / 10).toString() : String(Math.round(q)));

  const ui = { modal: null, search: {}, filter: { cuisine: '', show: 'all', sort: 'cuisine', cat: '', tkcat: '' }, codexItem: 'bread_loaf',
    tkSlots: [], townStock: true, tkLog: [], tkTarget: null, placing: null, marketTab: 'sell', lastLive: 0, lastModal: 0 };
  window.UI = ui;
  // Inventory stock-list sort, remembered between sessions: by group/value/stock/price/name, dir -1 = high to low (or Z–A).
  ui.mkSort = { by: 'group', dir: 1 };
  // "Sell above": how many of each item to keep, remembered in this browser (not in the save).
  ui.sellAbove = 25;
  try { const v = +localStorage.getItem('rootdishes-sell-above'); if (localStorage.getItem('rootdishes-sell-above') != null && v >= 0) ui.sellAbove = Math.round(v); } catch (e) { /* keep default */ }
  try { const f = JSON.parse(localStorage.getItem('rootdishes-flow-filter')); if (f) { Render.flowGoods = new Set((f.goods || []).filter((i) => FS.items[i])); Render.flowTypes = new Set((f.types || []).filter((t) => FS.buildings[t])); } } catch (e) { /* show all */ }
  try { const m = JSON.parse(localStorage.getItem('rootdishes-market-sort')); if (m && ['group', 'value', 'stock', 'price', 'name'].includes(m.by) && (m.dir === 1 || m.dir === -1)) ui.mkSort = m; } catch (e) { /* keep default */ }

  // English plural of a building name: Creamery ➜ Creameries, Press ➜ Presses, Bakery ➜ Bakeries.
  const plural = (n) => (/[^aeiou]y$/i.test(n) ? n.slice(0, -1) + 'ies' : /(s|x|z|ch|sh)$/i.test(n) ? n + 'es' : n + 's');
  function chip(id, qty, cls = '') {
    const i = it(id);
    const hide = i.dish && !Game.S.discovered[id];
    const q = qty !== undefined ? `<b>×${num(qty)}</b>` : '';
    return `<span class="chip ${cls}" ${hide ? '' : `data-item="${id}"`} title="${esc(hide ? 'Undiscovered dish' : i.name)}">${hide ? '❓' : FSI.img(id)} ${hide ? '???' : esc(i.name)} ${q}</span>`;
  }
  function needChip(id, q) {
    const ok = have(id) >= q;
    return chip(id, q, ok ? 'ok' : 'short');
  }
  function recipeIO(r, opts = {}) {
    const ins = Object.entries(r.inputs).map(([i, q]) => (opts.need ? needChip(i, q) : chip(i, q))).join(' ');
    const outs = Object.entries(r.outputs).map(([o, q]) => chip(o, q, 'out')).join(' ');
    return `<div class="io">${ins || '<span class="muted">no inputs</span>'} <span class="arrow">➜</span> ${outs}</div>`;
  }
  // The recipe to suggest for an item: an unlocked one if there is any, else the cheapest.
  function recipeOf(id) {
    const list = FS.byOutput[id] || [], best = it(id).bestRecipe;
    // The Codex's chain when the farm can use it, so plans and the Codex count the same steps.
    if (best && !best.dish && Game.recipeUnlocked(best.id)) return best;
    return list.find((r) => !r.dish && r.primary === id && Game.recipeUnlocked(r.id)) || list.find((r) => !r.dish && Game.recipeUnlocked(r.id)) || it(id).bestRecipe;
  }
  const lockNote = (rid) => `<span class="locked" title="Unlocks with ${esc(Game.sourceText(rid))}">🔒 unlocks with ${esc(Game.sourceText(rid))}</span>`;
  function cplxLine(id) {
    const c = FS.complexity(id);
    return `<span title="Distinct raw ingredients in the whole supply chain">🌱 ${c.rawCount} raw</span> · <span title="Processing steps">⚙️ ${c.steps} steps</span> · <span title="Different buildings involved">🏭 ${c.buildings} buildings</span> · <span title="Longest chain of steps">⛓️ depth ${c.depth}</span>`;
  }

  // =================== TOP BAR ===================
  // Build menu: only unlocked buildings, as a grid of icon tiles in groups that fold away (remembered in localStorage).
  // Full name, description, cost and size are in each tile's hover tip; ones unlocked since you last built one carry a NEW tag.
  let bbFolded = {};
  try { bbFolded = JSON.parse(localStorage.getItem('rootdishes-buildbar-folded')) || {}; } catch (e) { /* all open */ }
  function buildTip(b, n) {
    const [w, h] = b.size;
    return [`${b.name}`, b.desc || '', `💰 ${b.cost} to build · upkeep ${b.upkeep || 0}/min · ${w} x ${h} tiles`,
      n ? `You have ${n}.` : ''].filter(Boolean).join('\n');
  }
  function buildTopbar() {
    const groups = {};
    let locked = 0;
    const S = Game.S, isNew = S.newB || {}, owned = {};
    for (const x of S.buildings) owned[x.type] = (owned[x.type] || 0) + 1;
    for (const b of Object.values(FS.buildings)) {
      if (b.group === 'Hidden') continue;
      if (!Game.buildingUnlocked(b.id)) { locked++; continue; }
      const g = b.shelf || b.group;
      (groups[g] = groups[g] || []).push(b);
    }
    $('#buildbar').innerHTML = Object.entries(groups).map(([g, list]) => {
      const fold = !!bbFolded[g], anyNew = list.some((b) => (b.id in isNew));
      return `<div class="bgroup${fold ? ' folded' : ''}">
      <button class="bgroup-title" data-action="bgroup" data-arg="${g}" title="${fold ? 'Show' : 'Hide'} these buildings"><span class="chev">▾</span>${g}<span class="bcount">${list.length}</span>${anyNew && fold ? '<i class="newtag">NEW</i>' : ''}</button>
      <div class="bgrid">${list.map((b) => `<button class="bbtn${(b.id in isNew) ? ' new' : ''}" data-action="build" data-arg="${b.id}" data-cost="${b.cost}" data-tip="${esc(buildTip(b, owned[b.id]))}">
        ${(b.id in isNew) ? '<i class="newtag">NEW</i>' : owned[b.id] ? `<i class="bown">${owned[b.id]}</i>` : ''}<span class="bicon">${FSI.img('b_' + b.id)}</span><span class="bname">${esc(b.short || b.name)}</span><span class="bcost">💰${b.cost}</span></button>`).join('')}</div>
      </div>`;
    }).join('') +
      (locked ? `<button class="lockedb" data-action="modal" data-arg="cuisines" data-tip="Complete goals or open new cuisines to unlock more buildings">🔒 ${locked} more building${locked > 1 ? 's' : ''} to unlock</button>` : '');
    bbKey = '';
    syncBuildbar();
  }
  // Tiles you can't afford fade their price; the building you are placing stays highlighted.
  let bbKey = '';
  function syncBuildbar() {
    const key = Math.floor(Game.S.money) + '|' + (ui.placing || '');
    if (key === bbKey) return;
    bbKey = key;
    document.querySelectorAll('#buildbar .bbtn').forEach((el) => {
      el.classList.toggle('poor', +el.dataset.cost > Game.S.money);
      el.classList.toggle('active', el.dataset.arg === ui.placing);
    });
  }
  function toggleBuildGroup(g) {
    if (bbFolded[g]) delete bbFolded[g]; else bbFolded[g] = true;
    try { localStorage.setItem('rootdishes-buildbar-folded', JSON.stringify(bbFolded)); } catch (e) { /* not remembered */ }
    buildTopbar();
  }
  ui.buildMenu = buildTopbar;
  // Toolbar labels next to the icons, but only while the whole top bar still fits in one row.
  function fitNav() {
    const tb = $('#topbar'), nav = tb.querySelector('nav');
    const key = innerWidth + '|' + [...nav.children].map((b) => (b.hidden ? 0 : 1)).join('');
    if (fitNav.key === key) return;
    fitNav.key = key;
    tb.classList.add('labels');
    const last = [...nav.children].filter((b) => !b.hidden).pop();
    if (last && (nav.scrollWidth > nav.clientWidth + 1 || last.getBoundingClientRect().right > tb.getBoundingClientRect().right)) tb.classList.remove('labels');
  }
  addEventListener('resize', () => fitNav());
  let lastTop = '';
  function updateTopbar() {
    const S = Game.S;
    syncBuildbar();
    const day = Math.floor(S.time / 600) + 1;
    const mins = Math.floor(((S.time % 600) / 600) * 24 * 60);
    const clock = `Day ${day} · ${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
    const disc = Object.keys(S.discovered).length;
    const next = Game.goals.find((g) => !S.goalsDone[g.id] && Game.goalVisible(g));
    const se = Game.season(), we = Game.weather();
    const canFill = S.orders.filter(Game.orderReady).length;
    const key = [S.journalN, S.journalRead, canFill, Math.floor(S.money), Math.floor(S.loan || 0), clock, S.speed, S.orders.length, disc, next && next.id, next && String(Game.goalProgress(next)), se.id, we.name, Render.flows, Render.flowGoods.size + Render.flowTypes.size, S.toques, czNew(), townOut()].join('|');
    if (key === lastTop) return;
    lastTop = key;
    $('#money').textContent = '💰 ' + money(S.money);
    $('#money').classList.toggle('neg', S.money < 0);
    $('#money').title = S.money < 0 ? "In debt: you can't build, import or open cuisines. Sell goods, or take a loan in the Inventory's Bank tab." + (S.loan ? `\nLoan owed: ${money(S.loan)}` : '')
      : S.loan ? `Loan owed: ${money(S.loan)} (a quarter of your income pays it back)` : 'Money';
    $('#toques').textContent = '🎩 ' + (S.toques || 0);
    $('#clock').textContent = clock;
    document.querySelectorAll('.m-clock').forEach((c) => (c.textContent = clock));
    $('#season').innerHTML = `${se.icon} <span class="lbl">${esc(se.name)} · </span>${we.icon} <span class="lbl">${esc(we.name)}</span>`;
    $('#season').title = `${se.msg}\nNow: ${we.name}${Game.cheat.weather ? '' : `, for about ${Math.max(1, Math.round(Game.weatherLeft() / Game.HOUR))} more hours`}. ${we.effect}\n` + (Game.cheat.season !== null || Game.cheat.weather ? 'Forced from the cheat console (` key). Type "clear" there to go back to normal.' : `Next season in ${dur(Game.seasonLeft() / 1)} of game time.`);
    $('#season').classList.toggle('forced', Game.cheat.season !== null || !!Game.cheat.weather);
    $('#flows-btn').classList.toggle('active', !!Render.flows);
    $('#flowf-btn').classList.toggle('active', !!Render.flows);
    $('#flowf-n').textContent = (Render.flowGoods.size + Render.flowTypes.size) || '';
    $('#dishcount').textContent = `📖 ${disc}/${FS.dishList.length}`;
    document.querySelectorAll('[data-action="speed"]').forEach((b) => b.classList.toggle('active', +b.dataset.arg === S.speed));
    // Orders badge: how many you can deliver right now; faded with the order count when none can be filled yet.
    const ob = $('#orders-badge');
    ob.textContent = canFill || S.orders.length || '';
    ob.classList.toggle('faded', !canFill);
    ob.title = canFill ? `${canFill} of ${S.orders.length} order${S.orders.length > 1 ? 's' : ''} ready to deliver` : S.orders.length ? 'No order can be filled from your stock yet' : '';
    const unread = Game.journalUnread();
    $('#journal-badge').textContent = unread > 0 ? (unread > 9 ? '9+' : unread) : '';
    $('#cuisine-badge').textContent = czNew() ? 'NEW' : '';
    // Town: shown once restaurants unlock; the badge counts restaurants with a menu dish out of stock.
    $('#town-btn').hidden = !Game.restaurantsUnlocked();
    $('#academy-btn').hidden = !Game.academyUnlocked();
    fitNav();
    const out = townOut();
    $('#town-badge').textContent = out > 0 ? '!' : out === 0 && !Game.restaurants().length ? 'NEW' : '';
    $('#town-badge').title = out > 0 ? `${out} restaurant${out > 1 ? 's have' : ' has'} a dish out of stock` : '';
    const st = next && stepOf(next.id);
    $('#goalbar').innerHTML = next ? `🎯 <b>Next goal:</b> ${esc(next.text)}${goalProg(next)} <span class="muted">(+${next.reward}${next.toques ? ` · 🎩${next.toques}` : ''}${st ? ` · 🔓 unlocks ${esc(st.name)}` : ''})</span>` : '🏆 All goals complete!';
  }

  // Progress for count goals ("Cook 10 different dishes"): "3 / 10" with a small bar.
  const goalProg = (g) => {
    const p = Game.goalProgress(g);
    if (!p) return '';
    const [cur, max] = p, pct = Math.min(100, Math.round((cur / max) * 100));
    return ` <span class="gprog" title="${cur} of ${max} done"><span class="gbar"><i style="width:${pct}%"></i></span>${Math.min(cur, max)} / ${max}</span>`;
  };
  const stepOf = (goalId) => FS.STEPS.find((st) => st.goal === goalId);
  // NEW on the Cuisines button: a cuisine can be opened in a stage whose cuisines you haven't looked at yet.
  // Restaurants with a menu dish out of stock (-1 while the Town is still locked).
  const townOut = () => (Game.restaurantsUnlocked() ? Game.restaurants().filter((r) => r.menu.some((id) => have(id) < 1)).length : -1);
  const czNew = () => Game.cuisinesReady() && Game.S.czSeen !== Game.currentStage().id && Game.currentStage().cuisines.some((c) => !Game.S.cuisines[c.id]);

  // =================== INSPECTOR ===================
  function selectBuilding(id) {
    Game.ratePreview = null;
    Render.selected = id;
    // The first goal teaches clicking a building: opening the Well's panel completes it.
    const b = id != null && Game.S.buildings.find((x) => x.id === id);
    if (b && b.type === 'well') Game.S.tut = Object.assign(Game.S.tut || {}, { well: true });
    renderInspector();
  }
  ui.select = selectBuilding;

  function renderInspector() {
    const el = $('#inspector');
    const b = Game.S.buildings.find((x) => x.id === Render.selected);
    document.body.classList.toggle('insp-open', !!b);
    if (!b) { el.hidden = true; Render.selected = null; return; }
    el.hidden = false;
    const bt = FS.buildings[b.type];
    if (b.type === 'farmhouse') {
      el.innerHTML = `<div class="insp-head"><span class="big">${FSI.img('b_' + bt.id)}</span><div><h3>${bt.name}</h3><small>Headquarters</small></div><button class="x" data-action="deselect">✕</button></div>
        <p class="desc">${esc(bt.desc)}</p>
        <div class="stack">
          <button data-action="modal" data-arg="market">🛖 Inventory</button>
          <button data-action="modal" data-arg="testkitchen">🧪 Test Kitchen</button>
          <button data-action="modal" data-arg="buildings">🏘️ Buildings: stock & auto-sell</button>
          <button data-action="modal" data-arg="help">❔ How to play</button>
        </div>`;
      return;
    }
    if (b.type === 'academy') {
      const chefs = Game.chefs();
      el.innerHTML = `<div class="insp-head"><span class="big">${FSI.img('b_' + bt.id)}</span><div data-tip="${esc(bt.desc)}"><h3>${esc(bt.name)}</h3><small>${bt.group} · upkeep ${upkeepText(b)}/min</small></div><button class="x" data-action="deselect">✕</button></div>
        <p class="desc">${esc(bt.desc)}</p>
        <div class="row gap actions">
          <button data-action="pause" data-arg="${b.id}">${b.paused ? '▶ Resume' : '⏸ Pause'}</button>
          <button data-action="move" data-arg="${b.id}" data-tip="Pick it up and place it elsewhere for ${Game.moveCost(b.type)} coins. The chefs move with it.">↔ Move</button>
          <button class="danger" data-action="demolish" data-arg="${b.id}" data-tip="Tear it down and get ${Math.round(bt.cost / 2)} coins back. Your chefs stay hired but can't work until you build a new one.">🗑 Demolish</button>
        </div>
        <h4>Chefs (${chefs.length} / ${Game.ACADEMY.seats})</h4>
        <div class="ac-mini">${chefs.map((c) => `<div class="small">${chefFace(c.name)} <b>${esc(c.name)}</b> ${c.dish ? `· ${esc(it(c.dish).name)} <span class="gbar"><i style="width:${chefPct(c)}%"></i></span>` : '<span class="muted">· waiting for a dish</span>'}</div>`).join('') || '<p class="hint">No chefs yet. Hire one with 🎩 toques.</p>'}</div>
        <div class="stack"><button class="primary" data-action="modal" data-arg="academy">🎓 Open the Academy (U)</button></div>`;
      return;
    }
    const q = (ui.search.recipe || '').toLowerCase();
    const allRecipes = Game.recipesFor(b.type), searchable = allRecipes.length > 5;
    if (!searchable) ui.search.recipe = '';
    const recipes = allRecipes.filter((r) => !q || Object.keys(r.outputs).concat(Object.keys(r.inputs)).some((i) => it(i).name.toLowerCase().includes(q)) || (r.label || '').toLowerCase().includes(q));
    const isKitchen = b.type === 'kitchen';
    // Farm crops are listed by ingredient group (the kitchen order), then by name, under group headings.
    const grouped = bt.group === 'Farming' && new Set(allRecipes.map((r) => it(r.primary).cat)).size > 1;
    if (grouped) recipes.sort((x, y) => groupRank(x.primary) - groupRank(y.primary) || (x.label || it(x.primary).name).localeCompare(y.label || it(y.primary).name));
    const groupHead = (r, n) => (!grouped || (n && it(recipes[n - 1].primary).cat === it(r.primary).cat) ? '' : `<div class="tile-group">${catIcon(it(r.primary).cat)} ${esc(catName(it(r.primary).cat))}</div>`);
    el.innerHTML = `
      <div class="insp-head"><span class="big">${FSI.img('b_' + bt.id)}</span><div data-tip="${esc(bt.desc)}"><h3>${esc(bt.name)}</h3><small>${bt.group} · upkeep <span id="insp-upkeep">${upkeepText(b)}</span>/min</small></div><button class="x" data-action="deselect">✕</button></div>
      <div id="insp-live"><div class="live-io"></div><div class="live-prog"></div></div>
      <div class="row gap actions">
        <button data-action="pause" data-arg="${b.id}">${b.paused ? '▶ Resume' : '⏸ Pause'}</button>
        <button data-action="move" data-arg="${b.id}" data-tip="Pick it up and place it elsewhere for ${Game.moveCost(b.type)} coins. Keeps all settings.">↔ Move</button>
        <button class="danger" data-action="demolish" data-arg="${b.id}" data-tip="Tear it down and get ${Math.round(bt.cost / 2)} coins back (half the build cost). Settings are lost.">🗑 Demolish</button>
      </div>
      ${rateControl(b)}
      <h4>${isKitchen ? 'Cook a discovered dish' : 'Choose what to produce'}</h4>
      ${searchable ? `<input type="search" class="search" data-search="recipe" placeholder="Search…" value="${esc(ui.search.recipe || '')}">` : ''}
      <div class="recipe-list" data-scroll="recipes">
        ${isKitchen && !Game.recipesFor('kitchen').length ? `<p class="hint">No dishes discovered yet. Open the <a data-action="modal" data-arg="testkitchen">🧪 Test Kitchen</a> and combine ingredients to discover dishes.</p>` : ''}
        ${recipes.map((r, n) => groupHead(r, n) + recipeRow(r, b)).join('')}
        ${lockedCount(b.type) ? `<p class="hint locked-more">🔒 ${lockedCount(b.type)} more production choice${lockedCount(b.type) > 1 ? 's' : ''} unlock with goals and new <a data-action="modal" data-arg="cuisines">🍽️ cuisines</a>.</p>` : ''}
      </div>`;
    updateInspectorLive();
  }
  // Production rate slider: slower buildings use fewer inputs and save half of the upkeep they would scale down.
  const upkeepText = (b) => +Game.upkeepOf(b).toFixed(2);
  function rateControl(b) {
    const pct = Math.round(Game.rateOf(b) * 100);
    return `<div class="ratectl" data-tip="Slower buildings use fewer inputs. Half of the upkeep is fixed; the other half scales with the production rate. Two buildings at 100% are more efficient than one, but one at a lower rate costs less.">
      <div class="small"><b>Production rate</b> <span id="rate-val">${pct}%</span></div>
      <input type="range" min="10" max="100" step="5" value="${pct}" data-rate="1"></div>`;
  }
  const lockedCount = (type) => (type === 'kitchen' ? 0 : (FS.byBuilding[type] || []).filter((r) => !Game.recipeUnlocked(r.id)).length);
  // Where a missing input comes from, with a shortcut to import raw ones.
  function sourceHint(id, need) {
    const r = recipeOf(id);
    const bt = FS.buildings[r.building];
    const built = Game.S.buildings.some((b) => b.type === r.building);
    const lock = Game.recipeUnlocked(r.id) ? '' : ' ' + lockNote(r.id);
    const from = Object.keys(r.inputs).length ? ` from ${Object.keys(r.inputs).map((i) => it(i).name).join(' + ')}` : '';
    const short = Math.max(1, Math.ceil(need - (Game.S.inv[id] || 0)));
    const buy = Game.canBuy(id) ? ` <button class="small" data-action="buy-short" data-arg="${id}" data-qty="${short * 5}">Import ${short * 5} (💰${price(Game.buyPrice(id) * short * 5)})</button>` : '';
    // Already made, just not fast enough: say so and offer another building.
    const R = Game.rates(), mk = R.made[id] || 0, us = R.used[id] || 0;
    const n = Game.S.buildings.filter((b) => b.recipe === r.id).length;
    const slow = n && us > mk + 1e-6 && !lock ? `<div class="short small">Your ${n} ${esc(bt.name)}${n > 1 ? 's' : ''} make ${rate(mk)}/min, but your buildings use ${rate(us)}/min.
      <button class="small primary" data-action="plan-build" data-arg="${r.id}">Build another 💰${bt.cost}</button></div>` : '';
    return `<div class="src">${chip(id)} ${it(id).raw && !from ? 'comes from' : 'is made at'} ${FSI.img('b_' + bt.id)} <b>${esc(bt.name)}</b>${esc(from)}${lock || (built ? '' : ' <span class="short">(not built yet)</span>')}${buy}${slow}</div>`;
  }
  function recipeRow(r, b) {
    const o = it(r.primary);
    const extra = Object.keys(r.outputs).length > 1 ? ` <span class="muted">+${Object.keys(r.outputs).length - 1} more</span>` : '';
    const ins = Object.entries(r.inputs).map(([i, q]) => `<span class="mini ${have(i) >= q ? '' : 'short'}" data-tip="${esc(it(i).name)} ×${q}: ${have(i)} in stock">${FSI.img(i)}${q}</span>`).join('');
    const outs = Object.entries(r.outputs).map(([i, q]) => `${it(i).name} ×${q}`).join(', ');
    // What one cycle's output would sell for today, to compare choices.
    const worth = Object.entries(r.outputs).reduce((t, [i, q]) => t + Game.sellPrice(i) * q, 0);
    return `<div class="recipe-row ${b.recipe === r.id ? 'active' : ''}" data-action="set-recipe" data-arg="${r.id}" data-tip-side="left" data-tip="${esc(outs)}${ins ? `\nfrom ${esc(Object.entries(r.inputs).map(([i, q]) => `${it(i).name} ×${q}`).join(', '))}` : ''}\n⏱ ${dur(r.time)} per cycle${r.cost ? ` · 💰 ${r.cost} per cycle` : ''}\nWorth ≈ 💰${coins(worth)} per cycle at today's prices">
      <div class="rr-out"><span class="rr-emoji">${FSI.img(r.primary)}</span><span class="rr-name">${esc(r.label || o.name)} <b>×${r.outputs[r.primary]}</b>${extra}</span><span class="rr-time muted">⏱${dur(r.time)}</span></div>
      ${ins ? `<div class="rr-meta"><span class="muted">from</span> ${ins}${r.cost ? `<span class="muted">· 💰${r.cost}</span>` : ''}</div>` : ''}</div>`;
  }
  function updateInspectorLive(force) {
    const live = document.getElementById('insp-live');
    if (!live || (ui.mouseDown && !force)) return;
    const b = Game.S.buildings.find((x) => x.id === Render.selected);
    if (!b) return;
    const r = FS.recipeById[b.recipe];
    const io = live.querySelector('.live-io'), pr = live.querySelector('.live-prog');
    // Each part is only rewritten when it changed, so hover tips and clicks aren't lost every quarter second.
    const put = (el, html) => { if (el && el.dataset.html !== html) { el.innerHTML = html; el.dataset.html = html; } };
    live.classList.toggle('current', !!r);
    if (!r) { put(io, `<div class="status idle">💤 Idle: pick something to produce below.</div>`); put(pr, ''); retip(); return; }
    const prog = b.running ? Math.min(1, b.progress / r.time) : 0;
    const status = {
      working: `⚙️ Working… ${Math.round(prog * 100)}%`,
      full: `📦 Storage is full (${Game.capacity()} of each). It restarts when stock drops below.`,
      season: `❄️ ${esc(b.why || 'Out of season')}. It restarts when the season changes.`,
      missing: `⚠️ Waiting for ${b.missing.map((m) => it(m).name).join(', ')}`,
      yield: `⏳ Leaving ${b.missing.map((m) => it(m).name).join(', ')} for a higher-priority building`,
      nomoney: `💸 Not enough money for the ${r.cost}-coin cycle cost`,
      paused: '⏸ Paused', idle: '💤 Idle',
    }[b.running ? 'working' : b.status] || '';
    const rt = Game.rateOf(b);
    put(io, `<div class="cur-title">${FSI.img(r.primary)} ${esc(r.label || it(r.primary).name)}
        <span class="cur-meta muted small" data-tip="One cycle takes ${dur(r.time / rt)}${rt < 1 ? ` at ${Math.round(rt * 100)}% production rate (${dur(r.time)} at 100%)` : ''}.${r.cost ? `\nEach cycle costs ${r.cost} coins.` : ''}\nHover an ingredient for its per-minute flow.">⏱ ${dur(r.time / rt)}${r.cost ? ` · 💰${r.cost}` : ''}</span></div>
      ${ioBlock(b, r)}
      ${proxBlock(b, r)}
      ${b.why && b.mult > 0 ? `<div class="small growth ${b.mult < 1 ? 'short' : 'okc'}" data-tip="Season and weather change how fast farms grow">🌦️ Speed ×${+(b.mult || 0).toFixed(2)}: ${esc(b.why)}</div>` : ''}`);
    put(pr, `<div class="pbar"><div style="width:${prog * 100}%"></div></div>
      <div class="status ${b.running ? 'ok' : b.status}">${status}</div>
      ${!b.running && (b.status === 'missing' || b.status === 'yield') ? `<div class="srcs">${b.missing.map((m) => sourceHint(m, r.inputs[m])).join('')}</div>` : ''}`);
    retip();
  }

  // The current recipe as two columns, Uses ➜ Makes, one ingredient per line. Per-minute flows, the farm's balance
  // and nearby savings live in each line's hover tip; the line itself only flags them (📍 −10%, ⚠).
  function ioBlock(b, r) {
    const br = Game.buildingRates(b), R = Game.rates(), p = Game.prox(b), need = Game.batchInputs(b, r);
    const ins = Object.entries(r.inputs).map(([i, q]) => {
      const mk = R.made[i] || 0, us = R.used[i] || 0, sup = supplyOf(mk, us), farmShort = sup.cls !== 'good', ok = have(i) >= (need[i] || q);
      const tip = [`${it(i).name}: ${num(q)} per cycle${p[i] ? ` (${num(q * (1 - p[i].d))} on average with the nearby saving)` : ''}, ${have(i)} in stock`,
        br.used[i] ? `This building uses ${rate(br.used[i])}/min while running.` : '',
        `Whole farm: made +${rate(mk)}/min, used −${rate(us)}/min by all buildings that need it${farmShort ? (mk ? ': not enough.' : ': nothing makes it.') : '.'}`,
        p[i] ? `📍 Uses ${Math.round(p[i].d * 100)}% less: ${bname(p[i].from)} is ${gapText(p[i].d)}.` : '',
        ok ? `📦 Only ${have(i)} in stock: not enough for the next cycle.` : '', 'Click for its supply chain.'].filter(Boolean).join('\n');
      // One colour per line: the farm's supply against all its buildings' use. Running out of stock right now is a separate 📦 tag.
      return `<div class="io-line s-${sup.cls}" data-item="${i}" data-tip="${esc(tip)}">${FSI.img(i)}<span class="nm">${esc(it(i).name)}</span><b>×${num(q)}</b>${p[i] ? `<span class="tag good">📍−${Math.round(p[i].d * 100)}%</span>` : ''}${ok ? '' : `<span class="tag stock">📦 ${have(i)}</span>`}${supplyBar(mk, us, sup)}</div>`;
    }).join('');
    const outs = Object.entries(r.outputs).map(([o, q]) => {
      const hide = it(o).dish && !Game.S.discovered[o];
      const tip = hide ? 'Undiscovered dish' : [`${it(o).name}: ${num(q)} per cycle, ${have(o)} in stock`, br.made[o] ? `This building makes ${rate(br.made[o])}/min while running.` : '',
        `Sells for about ${price(Game.sellPrice(o))} each.`, 'Click for its supply chain.'].filter(Boolean).join('\n');
      return `<div class="io-line out" ${hide ? '' : `data-item="${o}"`} data-tip="${esc(tip)}">${hide ? '❓' : FSI.img(o)}<span class="nm">${hide ? '???' : esc(it(o).name)}</span><b>×${num(q)}</b></div>`;
    }).join('');
    if (!ins) return `<div class="io2 noin"><div class="io-col"><div class="io-h">Makes</div>${outs}</div></div>`;
    return `<div class="io2"><div class="io-col"><div class="io-h" data-tip="The bar under each ingredient compares the whole farm: +made per minute / −used per minute by every building that needs it. The line's colour says the same: green enough, amber at least half, red less than half. 📦 N means only N are in stock, not enough for the next cycle.">Uses</div>${ins}</div><div class="io-arrow">➜</div><div class="io-col"><div class="io-h">Makes</div>${outs}</div></div>`;
  }

  // Supply vs. demand of one ingredient across the whole farm: bar = share of the farm's use that its makers cover.
  // Green: makers cover all use. Amber: at least half. Red: less than half, or nothing makes it.
  function supplyOf(mk, us) {
    const cover = us > 1e-6 ? mk / us : mk > 0 ? 1 : 0;
    return { cover, cls: cover >= 1 - 1e-6 ? 'good' : cover >= 0.5 ? 'warn' : 'bad' };
  }
  // Numbers that would round to the same value get another decimal, so a small shortfall never reads "+3 / −3".
  function supplyBar(mk, us, sup = supplyOf(mk, us)) {
    let a = rate(mk), u = rate(us);
    if (sup.cls !== 'good' && a === u) { a = mk.toFixed(2); u = us.toFixed(2); }
    return `<span class="sup ${sup.cls}"><span class="sbar"><i style="width:${Math.round(Math.min(1, sup.cover) * 100)}%"></i></span><span class="snum">+${a} / −${u}</span></span>`;
  }

  // Nearby makers of a building's inputs mean it uses less of them (Game.prox). Savings show on the input lines;
  // this line says whom this building helps, or suggests building close together.
  const gapText = (d) => (d >= 0.15 ? 'within 1 tile' : d >= 0.1 ? '2–3 tiles away' : '4–5 tiles away');
  const bname = (id) => { const o = Game.S.buildings.find((x) => x.id === id); return o ? FS.buildings[o.type].name : '?'; };
  const PROX_TIP = 'A building uses less of an input when a building making it stands close by: 15% next door or with 1 empty tile between (diagonals count), 10% with 2–3 tiles between, 5% with 4–5. Only the closest maker counts.';
  function proxBlock(b, r) {
    const p = Game.prox(b), ins = Object.keys(r.inputs);
    const helps = [];
    for (const o of Game.S.buildings) {
      if (o.id === b.id) continue;
      const op = Game.prox(o);
      for (const i in op) if (op[i].from === b.id) helps.push(`${FS.buildings[o.type].name} uses ${Math.round(op[i].d * 100)}% less ${it(i).name}`);
    }
    const left = ins.filter((i) => !p[i] && i !== 'water');
    const lines = [];
    if (helps.length) lines.push(`<div class="okc" data-tip="${esc(helps.join('\n') + '\n\n' + PROX_TIP)}">📍 Helps ${helps.length === 1 ? esc(helps[0].split(' uses ')[0]) : helps.length + ' buildings'} nearby use less</div>`);
    if (left.length && !ins.some((i) => p[i])) lines.push(`<div class="muted" data-tip="${esc(`Build a maker of ${left.map((i) => it(i).name).join(' or ')} close by.\n\n` + PROX_TIP)}">📍 Suppliers built close by save up to 15%</div>`);
    return lines.length ? `<div class="small prox">${lines.join('')}</div>` : '';
  }
  // While placing: what this spot would save, for a building with a known recipe, or which goods are made close by.
  function proxHint(type, x, y, recipeId, selfId) {
    const pc = (d) => Math.round(d * 100) + '%';
    if (recipeId) {
      const p = Game.proxAt(type, x, y, recipeId, selfId);
      const a = Object.keys(p).map((i) => `${it(i).name} −${pc(p[i].d)}`);
      const h = Game.proxHelps(type, x, y, recipeId, selfId).map((e) => `${bname(e.id)} ${it(e.item).name} −${pc(e.d)}`);
      return (a.length ? `\n📍 Uses less: ${a.join(', ')}` : '') + (h.length ? `\n📍 Helps: ${h.join(', ')}` : '');
    }
    const [w, hgt] = FS.buildings[type].size, best = {};
    for (const o of Game.S.buildings) {
      const or = FS.recipeById[o.recipe];
      if (!or || o.id === selfId) continue;
      const [ow, oh] = FS.buildings[o.type].size;
      const d = Game.PROX[Game.gap(x, y, w, hgt, o.x, o.y, ow, oh)];
      if (d) for (const i in or.outputs) if (i !== 'water' && d > (best[i] || 0)) best[i] = d;
    }
    const list = Object.keys(best).sort((a, c) => best[c] - best[a]).slice(0, 5).map((i) => `${it(i).name} −${pc(best[i])}`);
    return list.length ? `\n📍 Made close by (saves if it uses them): ${list.join(', ')}${Object.keys(best).length > 5 ? '…' : ''}` : '';
  }

  // =================== MODALS ===================
  const modals = {};
  function openModal(name) {
    // The old Warehouse window is now the Inventory's Stock tab.
    if (name === 'warehouse') { name = 'market'; ui.marketTab = 'sell'; }
    if (ui.modal !== name) SFX.play('open');
    ui.modal = name;
    ui.mkOrder = null;
    $('#modal').hidden = false;
    document.body.classList.add('modal-open');
    renderModal(true);
  }
  ui.open = openModal;
  function closeModal() {
    // The welcome card leads straight on to the first help screen, however it is closed.
    if (ui.modal === 'welcome') { openModal('help'); return; }
    // Closing the first help screen any way starts the clock, like "Let's farm!", so a new farm never sits paused unnoticed.
    if (ui.modal === 'help' && Game.S && !Game.S.speed && Game.S.time === 0) Game.S.speed = 1;
    if (ui.modal === 'splash') ui.splashQ.shift();
    if (ui.modal) SFX.play('close');
    ui.modal = null; ui.dd = null; $('#modal').hidden = true; document.body.classList.remove('modal-open');
    if (ui.splashQ.length) setTimeout(showSplash, 250);
    // A card seen again from the trophy cabinet leads back to the cabinet.
    else if (ui.afterSplash) { const back = ui.afterSplash; ui.afterSplash = null; setTimeout(() => openModal(back), 250); }
    else setTimeout(flushToasts, 250);
  }
  // ----- Unlock splash: a full card with a fanfare for every new feature, queued behind any open window -----
  ui.splashQ = [];
  const SPLASH = {
    orders: { icon: '📋', title: 'Customer orders', lines: ['A customer wants what you just started making.', 'Deliver it in 📋 Orders.'] },
    wholesaler: { icon: '🚚', title: 'The Wholesaler', lines: ['Sells your surplus automatically, item by item.', 'Hire him in the 🛖 Inventory.'] },
    academy: { icon: '🎓', title: 'The Culinary Academy', lines: ['Build it (Cooking) and hire chefs with 🎩 toques.', 'Chefs work out undiscovered dishes for you, one ingredient at a time.'] },
    dispatcher: { icon: '📦', title: 'The Dispatcher', lines: ['Delivers orders for you while you build.', 'Hire him in 📋 Orders.'] },
    blueprints: { icon: '📐', title: 'Blueprints', lines: ['In 🗺️ Plan production, set down a whole missing production chain at once.'] },
    restaurants: { icon: '🏙️', title: 'The Town', lines: ['Word of your cooking has reached the town.', 'Rent a restaurant in the Market Quarter (T), pick its menu and keep it supplied from your farm.', 'Which cuisines do the guests want? That is for you to find out.'] },
    harbour: { icon: '⚓', title: 'The Harbour', lines: ['Your Market restaurant made a name for itself.', 'Rent a restaurant on the waterfront: new guests, new tastes.'] },
    old_town: { icon: '🏛️', title: 'The Old Town', lines: ['The finest tables in town are open to you.', 'Rent a restaurant by the cathedral, and take on Maison Crestwell.'] },
    finedining: { icon: '🎩', title: 'Fine Dining', lines: ['📜 A permit for a restaurant in the 🏛️ Old Town (once your Harbour restaurant has ★★★★).', '⭐ Dish mastery: perfect dishes you cook often with 🎩 toques, in the 📖 Cookbook.', '👨‍🍳 Head chefs: promote Academy chefs to run your restaurants\' kitchens.'] },
  };
  // Big moments (milestone goals, a completed stage, a cuisine in gold) get the longer milestone fanfare.
  const bigSplash = (key) => /^(goal:|czgold:)/.test(key) || /^czdone:.*:stage$/.test(key);
  function showSplash() {
    if (!ui.splashQ.length || ui.modal) return;
    // Wait for a dish discovery card or the easter egg to be closed first.
    if (document.getElementById('discovery') || document.getElementById('easter')) { setTimeout(showSplash, 500); return; }
    openModal('splash');
    if (bigSplash(ui.splashQ[0])) SFX.play('milestone');
    else { SFX.play('fanfare'); setTimeout(() => SFX.play('unlock'), 420); }
  }
  // A row of dish icons popping in one after another.
  const dishPops = (ids, MAX = 40) => `<div class="sp-dishes">${ids.slice(0, MAX).map((id, k) => `<span class="dc-pop" style="animation-delay:${0.3 + k * 0.05}s" title="${esc(it(id).name)}">${FSI.img(id)}</span>`).join('')}${ids.length > MAX ? `<span class="dc-more">+${ids.length - MAX}</span>` : ''}</div>`;
  const rewardPills = (coins, toques, extra = []) => [coins ? `💰 +${money(coins)}` : '', toques ? `🎩 +${toques}` : '', ...extra].filter(Boolean);
  // Milestone goals (splash: true). Dish counts: every dish cooked so far pops onto the card, with what stands behind them.
  // Chocolate and the most complex dish: the supply chain itself, raw ingredients ➜ steps ➜ plate.
  const MILESTONE = {
    dish25: { title: 'The talk of the village' }, dish50: { title: 'A name in the region' }, dish100: { title: 'A hundred dishes' },
    dish200: { title: 'A living cookbook', extra: '🏆 A trophy for your farmhouse' }, dishall: { title: 'The whole cookbook', extra: '🥇 A gold medal for your farmhouse' },
  };
  function milestoneInfo(g) {
    const S = Game.S, fame = Game.FAME.find((f) => f.goal === g.id);
    const fameLine = fame ? [`⭐ Dishes sell for ${Math.round((fame.value - 1) * 100)}% more`] : [];
    if (g.id === 'choc' || g.id === 'complex') {
      const id = g.id === 'choc' ? 'dark_chocolate' : Game.mostComplexCooked();
      if (!id) return null;
      const types = FS.chain(id).buildings, mine = S.buildings.filter((b) => types.has(b.type)).length;
      return { icon: FSI.img(id), kicker: 'The long road', title: it(id).name, html: chainHtml(id),
        lines: [`Your farm has ${mine} building${mine === 1 ? '' : 's'} of these kinds.`], rewards: rewardPills(g.reward, g.toques) };
    }
    const dishes = FS.dishList.filter((d) => S.stats.produced[d.id]).map((d) => d.id), m = MILESTONE[g.id] || { title: g.text };
    const raw = new Set(), blds = new Set();
    for (const id of dishes) { Object.keys(FS.chain(id).raw).forEach((x) => raw.add(x)); FS.chain(id).buildings.forEach((x) => blds.add(x)); }
    const storage = g.id === 'dish50' && S.milestoneCap ? [`📦 Storage: ${S.milestoneCap} of every item`] : [];
    return { icon: FSI.img('ui_trophy'), kicker: g.id === 'dishall' ? 'Every dish cooked' : `${dishes.length} dishes cooked`, title: m.title,
      html: dishPops(dishes), lines: [`Behind them: ${raw.size} raw ingredients and ${blds.size} kinds of buildings.`],
      rewards: rewardPills(g.reward, g.toques, [...fameLine, ...storage, m.extra].filter(Boolean)) };
  }
  // Same warm card as a dish discovery: a floating round icon, a burst of confetti, kicker, title and a few lines.
  function splashInfo(key) {
    if (key && key.startsWith('cz:')) {
      const c = FS.cuisineById[key.slice(3)];
      if (c) return { icon: FSI.img('cz_' + c.id), kicker: 'New cuisine', title: c.name,
        lines: [c.desc, `Its buildings and recipes are unlocked, and its ${c.dishIds.length} dishes are waiting in your 📖 Cookbook.`].filter(Boolean) };
    }
    // A cuisine reached its stage's target ('czdone:<id>', plus ':stage' when that completed the stage, with the stage goal's reward).
    if (key && key.startsWith('czdone:')) {
      const [, cid, last] = key.split(':'), c = FS.cuisineById[cid], st = c && Game.stageById(c.stage);
      const sg = last && Game.goals.find((g) => g.id === 'stage' + st.id);
      if (c) return { icon: FSI.img('cz_' + c.id), kicker: 'Target reached', title: c.name,
        lines: [st.rating ? `${st.target} of its dishes are served at ${'★'.repeat(st.rating)} restaurants.` : `${st.target} of its dishes cooked.`,
          last ? `That completes ${st.name}!` : ''].filter(Boolean),
        rewards: rewardPills(sg ? sg.reward : 0, st.toques + (sg && sg.toques || 0)) };
    }
    // Every dish of a cuisine cooked: a gold card with all its dishes, toques and a lasting price bonus for that cuisine.
    if (key && key.startsWith('czgold:')) {
      const c = FS.cuisineById[key.slice(7)], st = c && Game.stageById(c.stage);
      if (c) return { icon: FSI.img('cz_' + c.id), iconCls: 'gold', kicker: 'Every dish cooked', title: c.name, html: dishPops(c.dishIds),
        lines: [], rewards: rewardPills(0, st.gold, [`⭐ Its dishes sell for ${Math.round((Game.GOLD_PERK - 1) * 100)}% more`]) };
    }
    if (key && key.startsWith('goal:')) {
      const g = Game.goals.find((x) => x.id === key.slice(5)), info = g && milestoneInfo(g);
      if (info) return info;
    }
    return SPLASH[key] || { icon: '✨', title: 'Something new', lines: [] };
  }
  modals.splash = () => {
    const s = splashInfo(ui.splashQ[0]);
    return { title: '', cls: 'splash',
      html: `<div class="dc-burst">${Array.from({ length: 14 }, (_, k) => `<i style="--a:${k * 25.7}deg;--d:${(k % 3) * 0.06}s"></i>`).join('')}</div>
        <div class="sp-icon ${s.iconCls || ''}">${s.icon}</div>
        <p class="dc-kicker">${esc(s.kicker || 'Unlocked')}</p><h2 class="sp-title">${esc(s.title)}</h2>${s.html || ''}
        ${s.rewards ? `<div class="sp-rewards">${s.rewards.map((r, k) => `<span class="dc-pop" style="animation-delay:${1.2 + k * 0.25}s">${esc(r)}</span>`).join('')}</div>` : ''}
        ${s.lines.length > 1 ? `<ul class="sp-lines">${s.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : s.lines.map((l) => `<p class="sp-one">${esc(l)}</p>`).join('')}
        <div class="sp-go"><button class="primary" data-action="close-modal">Let's go!</button></div>` };
  };
  // Right after hiring: the Wholesaler starts paused, and this asks whether to turn him on, showing what he would sell.
  modals.wsOn = () => {
    const list = Game.wholesalePreview(), MAX = 12, W = Game.WHOLESALER;
    return { title: '🚚 Turn on the Wholesaler?',
      html: `<p>He buys everything above the amount you keep (half your storage, or what you set per item in the Stock tab) at ${Math.round(W.share * 100)}% of the market price.</p>
        ${list.length ? `<p><b>Turned on now, he would sell:</b></p><div class="io">${list.slice(0, MAX).map(([id, n]) => chip(id, n)).join(' ')}${list.length > MAX ? ` <span class="muted">+${list.length - MAX} more</span>` : ''}</div>`
          : '<p class="muted">Right now he would sell nothing: everything is below what you keep.</p>'}
        <p class="small muted">You can switch him on or off any time in his 🚚 Wholesaler tab.</p>
        <div class="row gap"><button class="primary" data-action="ws-start">Turn him on</button><button data-action="close-modal">Not now</button></div>` };
  };
  ui.splash = (key) => { if (!ui.splashQ.includes(key)) ui.splashQ.push(key); showSplash(); };

  function renderModal(fresh) {
    if (!ui.modal) return;
    const m = modals[ui.modal]();
    const body = $('#modal-body');
    const focus = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.search : null;
    const sel = focus ? document.activeElement.selectionStart : 0;
    const scrolls = {};
    if (!fresh) body.querySelectorAll('[data-scroll]').forEach((s) => { scrolls[s.dataset.scroll] = s.scrollTop; scrolls[s.dataset.scroll + ':x'] = s.scrollLeft; });
    const top = fresh ? 0 : body.scrollTop;
    $('#modal-title').innerHTML = m.title;
    $('#modal-card').className = 'modal-card ' + (m.cls || '');
    modalSpeed(m.speed);
    // A window can update itself in place when its layout hasn't changed (see the Test Kitchen).
    if (!fresh && m.patch && m.patch(body)) return;
    body.innerHTML = m.html;
    body.scrollTop = top;
    body.querySelectorAll('[data-scroll]').forEach((s) => { if (scrolls[s.dataset.scroll]) s.scrollTop = scrolls[s.dataset.scroll]; if (scrolls[s.dataset.scroll + ':x']) s.scrollLeft = scrolls[s.dataset.scroll + ':x']; });
    czArrows();
    if (focus) {
      const f = body.querySelector(`[data-search="${focus}"]`);
      if (f) { f.focus(); try { f.setSelectionRange(sel, sel); } catch (e) {} }
    }
  }
  ui.refresh = () => { renderModal(false); renderTownPanel(); };
  // Windows you often wait in (an order or an experiment waiting on an ingredient) set speed: true and get the clock and
  // the speed buttons in their header, since the window's backdrop covers the top bar. The top bar's update keeps both live.
  function modalSpeed(on) {
    const el = $('#modal-speed');
    if (!on) { if (el.firstChild) el.innerHTML = ''; return; }
    if (el.firstChild) return;
    const S = Game.S;
    el.innerHTML = `<span class="m-clock" title="Game time">${$('#clock').textContent}</span>`
      + [[0, '⏸', 'Pause'], [1, '▶', 'Normal'], [3, '⏩', 'Fast'], [8, '⏭', 'Very fast']].map(([v, ic, t]) =>
        `<button class="small${v === S.speed ? ' active' : ''}" data-action="speed" data-arg="${v}" title="${t} (Space pauses)">${ic}</button>`).join('');
  }
  // The Cookbook's cuisine strip: arrows only show where there is more to scroll to (with a fade at that edge).
  function czArrows() {
    const st = document.querySelector('.cz-strip');
    if (!st) return;
    const w = st.parentElement, max = st.scrollWidth - st.clientWidth;
    w.classList.toggle('more-l', st.scrollLeft > 2);
    w.classList.toggle('more-r', st.scrollLeft < max - 2);
  }

  // Ingredient-group dropdown: a button with the group's icon that opens an alphabetical list of groups.
  // key = the ui.filter key it sets, counts = {cat: number of items} (only those groups are listed).
  // extra: an optional full-width choice under the first one, { v, icon, label, n } (the Test Kitchen's missing groups).
  function catPicker(key, counts, allLabel, extra) {
    const cur = ui.filter[key], open = ui.dd === key;
    const cats = Object.keys(counts).sort((a, b) => catName(a).localeCompare(catName(b)));
    const total = cats.reduce((n, c) => n + counts[c], 0);
    const ico = (c) => (extra && c === extra.v ? FSI.img(extra.icon) : c ? catIcon(c) : '<span class="dd-all">✱</span>');
    const opt = (c, label, n) => `<button class="dd-opt ${cur === c ? 'on' : ''}" data-action="dd-pick" data-arg="${key}:${c}">${ico(c)}<span>${esc(label)}</span><small>${n}</small></button>`;
    return `<div class="dd ${open ? 'open' : ''}"><button class="dd-btn" data-action="dd" data-arg="${key}" title="Filter by ingredient group">
      ${ico(cur)}<span>${esc(extra && cur === extra.v ? extra.label : cur ? catName(cur) : allLabel)}</span><i>▾</i></button>
      ${open ? `<div class="dd-menu" data-scroll="dd-${key}">${opt('', allLabel, total)}${extra ? opt(extra.v, extra.label, extra.n) : ''}<div class="dd-grid" style="grid-template-rows: repeat(${Math.ceil(cats.length / 2)}, auto)">${cats.map((c) => opt(c, catName(c), counts[c])).join('')}</div></div>` : ''}</div>`;
  }
  // A drop-down in the same style for any list: opts = [{ v, label, icon? }]. Picking one runs SETTERS[key](v).
  const SETTERS = {
    'cb-cuisine': (v) => { ui.filter.cuisine = v; }, 'cb-show': (v) => { ui.filter.show = v; }, 'cb-sort': (v) => { ui.filter.sort = v; },
    'town-cz': (v) => { ui.townCz = v; },
  };
  function ddPicker(key, opts, cur, tip, cls = '') {
    const open = ui.dd === key, sel = opts.find((o) => o.v === cur) || opts[0];
    const ico = (o) => (o.icon ? FSI.img(o.icon) : '');
    return `<div class="dd ${cls} ${open ? 'open' : ''}"><button class="dd-btn" data-action="dd" data-arg="${key}" title="${esc(tip)}">${ico(sel)}<span>${esc(sel.label)}</span><i>▾</i></button>
      ${open ? `<div class="dd-menu dd-list" data-scroll="dd-${key}">${opts.map((o) => `<button class="dd-opt ${o.v === sel.v ? 'on' : ''}" data-action="dd-set" data-arg="${key}|${esc(o.v)}">${ico(o)}<span>${esc(o.label)}</span>${o.n != null ? `<small>${o.n}</small>` : ''}</button>`).join('')}</div>` : ''}</div>`;
  }
  const countBy = (ids) => ids.reduce((m, id) => ((m[it(id).cat] = (m[it(id).cat] || 0) + 1), m), {});

  // ----- Farm journal -----
  // Everything that happened, newest first, grouped by day. Daily reports read like a small village newspaper.
  const clockOf = (t) => { const m = Math.floor(((t % 600) / 600) * 1440); return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
  function journalEntry(e) {
    const m = (n) => money(Math.round(n));
    if (e.type === 'day') {
      // Two separate things: what the farm made (worth in stock, not cash), and a cash ledger that adds up to the day's net.
      const d = e.d, n = (k) => d[k] || 0, income = n('sold') + n('orders') + n('guests'), farmPct = income >= 20 ? Math.round((d.farm / income) * 100) : null;
      const lines = [
        ['sold', '+', 'market sales'], ['orders', '+', 'customer orders'], ['guests', '+', 'restaurant guests'], ['bonus', '+', 'goal rewards and refunds'], ['borrowed', '+', 'borrowed from the bank'],
        ['upkeep', '−', 'building and restaurant upkeep'], ['running', '−', 'seed, feed and fuel for batches'], ['build', '−', 'building and moving'],
        ['buy', '−', 'imports'], ['shop', '−', 'cuisines opened'], ['repay', '−', 'loan repaid'],
      ].filter(([k]) => Math.round(n(k)) !== 0);
      const net = lines.reduce((t, [k, sg]) => t + (sg === '+' ? 1 : -1) * Math.round(n(k)), 0);
      const sign = (v) => (v >= 0 ? '+' : '−') + '💰' + money(Math.abs(v));
      return `<div class="gazette"><div class="gz-head"><span>The Farm Gazette</span><b>Day ${e.day}</b></div>
        <h5 class="gz-sub">Made today <span class="muted">(market value of the goods, now in your stock)</span></h5>
        <div class="gz-stats">
          <div><b>💰${m(n('raw'))}</b><span>raw food harvested</span></div>
          <div><b>💰${m(n('proc'))}</b><span>ingredients processed</span></div>
          <div><b>💰${m(n('dish'))}</b><span>dishes cooked</span></div>
        </div>
        <h5 class="gz-sub">Cash</h5>
        <table class="gz-ledger">${lines.map(([k, sg, label]) => `<tr><td>${label}</td><td class="num ${sg === '+' ? 'okc' : ''}">${sg}💰${m(n(k))}</td></tr>`).join('')}
          <tr class="gz-net ${net >= 0 ? 'okc' : 'short'}"><td>net for the day</td><td class="num">${sign(net)}</td></tr></table>
        ${d.end !== undefined && d.start !== undefined ? `<p class="small muted">Cash went from 💰${m(d.start)} to 💰${m(d.end)}.</p>` : ''}
        ${farmPct !== null ? `<div class="gz-split" title="Of what your goods sold for, the share the raw ingredients were worth"><i style="width:${farmPct}%"></i></div>
        <p class="small">Of every coin your goods sold for, <b>${farmPct}%</b> was the worth of the raw ingredients from the land. The other ${100 - farmPct}% paid for milling, churning, baking and cooking.</p>` : ''}</div>`;
    }
    if (e.type === 'dish') {
      const c = FS.complexity(e.id);
      return `<div class="jr-dish"><span class="jr-big">${FSI.img(e.id)}</span><div><b data-item="${e.id}" class="link">New dish: ${esc(it(e.id).name)}</b>
        <div class="small muted">${esc(it(e.id).cuisine || '')} · ${c.rawCount} raw ingredients, ${c.steps} processing steps, ${c.buildings} kinds of buildings</div></div></div>`;
    }
    if (e.type === 'unlock') return `🔓 Unlocked ${e.recipes} production step${e.recipes === 1 ? '' : 's'}${e.buildings.length ? `. New buildings: ${e.buildings.map((b) => `${FSI.img('b_' + b)} ${esc(FS.buildings[b].name)}`).join(', ')}` : ''}.`;
    if (e.type === 'items') return `🆕 New ingredient${e.ids.length > 1 ? 's' : ''} made: ${e.ids.map((i) => chip(i)).join(' ')}`;
    return esc(e.text);
  }
  modals.journal = () => {
    const S = Game.S, list = (S.journal || []).slice().reverse();
    const read = S.journalRead || 0;
    S.journalRead = S.journalN || 0;
    let day = null, html = '';
    list.forEach((e) => {
      const dd = Game.dayOf(e.t) + 1;
      if (dd !== day) { day = dd; html += `<h4 class="jr-day">Day ${dd}</h4>`; }
      html += `<div class="jr ${e.type} ${e.kind || ''} ${e.n > read && !e.quiet ? 'unread' : ''}"><span class="jr-t">${clockOf(e.t)}</span><div class="jr-body">${journalEntry(e)}</div></div>`;
    });
    return { title: '📰 Farm journal', cls: 'wide', html: html || '<p class="hint">Nothing has happened yet. Daily reports, new dishes, unlocks and weather will be kept here.</p>' };
  };

  // ----- Market -----
  // Storage capacity (the same for every item) and its next upgrade, paid in toques.
  function storageBar(summary) {
    const cap = Game.capacity(), next = Game.STORAGE[Game.storageLevel() + 1], t = Game.S.toques || 0;
    return `<div class="storagebar"><span>📦 Storage: <b>${cap}</b> of each item</span>${summary ? `<span class="muted small">${summary}</span>` : ''}
      ${next ? `<button class="small primary" data-action="storage-up" ${t >= next.toques ? '' : 'disabled'} title="Every item can then be stored up to ${next.cap}">Upgrade to ${next.cap} for 🎩${next.toques}</button>` : '<span class="muted small">fully upgraded</span>'}
      ${Game.wholesalerLevel() && Game.S.wholesaler.off ? '<span class="small short">⏸ The 🚚 Wholesaler is paused</span>' : ''}
      ${Game.wholesalerLevel() || !Game.wholesalerUnlocked() ? '' : (() => { const W = Game.WHOLESALER, l1 = W.levels[0];
        return `<button class="small primary" data-action="hire-wholesaler" ${Game.S.money >= l1.cost ? '' : 'disabled'} data-tip="${esc(`The Wholesaler sells your surplus for you: he buys everything above the amount you keep, so your buildings never stop for a full store. He pays ${Math.round(W.share * 100)}% of the market price and buys up to 💰${money(l1.cap)} of goods a minute, so 📋 orders still pay best.`)}">🚚 Hire the Wholesaler · 💰${money(l1.cost)}</button>`; })()}</div>`;
  }
  // Auto-sell for one item: Off, Default (the Wholesaler's default amount to keep) or a number to keep.
  function autosellCtl(id) {
    if (id === 'water') return '';
    const v = Game.autosellOf(id), mode = v == null ? 'off' : v === 'd' ? 'd' : 'n';
    const opt = (k, label) => `<option value="${k}" ${mode === k ? 'selected' : ''}>${label}</option>`;
    return `<span class="asell m-${mode}"><select data-autosell="${id}" title="Off: you sell by hand. Default: keep the Wholesaler's default amount. Keep: pick your own number.">${opt('off', 'Off')}${opt('d', (() => { const r = mode === 'd' && Game.keepRule(id); return r ? `Default · ${r.keep >= Game.capacity() ? 'keep all' : `keep ${r.keep}`} (${{ menu: 'menu', feed: 'feed', winter: 'winter' }[r.rule.id]})` : `Default · keep ${Game.wholesaleKeep()}`; })())}${opt('n', 'Keep…')}</select>${mode === 'n' ? `<input type="number" min="0" max="${Game.capacity()}" step="5" value="${Game.sellKeep(id)}" data-askeep="${id}" title="Keep this many; the Wholesaler buys the rest">` : ''}</span>`;
  }
  // What "Sell from everything" above n would sell among the listed items: [[id, qty]...] and the coins it brings.
  function sellAbovePlan(ids, n) {
    const list = ids.map((id) => [id, have(id) - n]).filter(([, k]) => k > 0);
    return { list, qty: list.reduce((t, [, k]) => t + k, 0), coins: list.reduce((t, [id, k]) => t + k * Game.sellPrice(id), 0) };
  }
  const sellAboveVal = () => Math.min(ui.sellAbove, Game.capacity());
  function sellAboveLabel(ids) {
    const n = sellAboveVal(), p = sellAbovePlan(ids, n);
    return { n, p, text: p.qty ? `Sell from everything, ${p.qty} for 💰${coins(p.coins)}` : 'Nothing above it' };
  }
  // One row's "Sell xx for yy" button: sells that item down to the "Sell above" amount.
  function sellAboveRow(id) {
    const k = Math.max(0, have(id) - sellAboveVal());
    return { k, text: k ? `Sell ${k} for 💰${coins(k * Game.sellPrice(id))}` : `Sell 0`, tip: `Sell down to ${sellAboveVal()}, the "Sell above" amount` };
  }
  function sellAboveBar(ids, q) {
    const cap = Game.capacity(), { n, p, text } = sellAboveLabel(ids), pc = cap ? Math.round(n / cap * 100) : 0;
    return `<div class="sellabove small"><span>Sell above</span>
      <input type="range" class="slider" min="0" max="${cap}" step="1" value="${n}" style="--p:${pc}%" data-sellabove="1" aria-label="Keep this many of each item">
      <b id="sa-val">${n}</b>
      <button class="primary small" id="sa-btn" data-action="sell-above" ${p.qty ? '' : 'disabled'} data-tip="${esc(`Keeps ${n} of each ${q ? 'matching ' : ''}item and sells the rest at today's price.`)}">${text}</button></div>`;
  }
  modals.market = () => {
    const q = (ui.search.mk || '').toLowerCase();
    const tab = ui.marketTab;
    let rows;
    if (tab === 'sell') {
      const { by, dir } = ui.mkSort, sig = q + '|' + by + dir;
      const grouped = by === 'group';
      const key = { group: groupRank, value: (id) => have(id) * Game.sellPrice(id), stock: have, price: (id) => Game.sellPrice(id) }[by];
      // Once an item has been in stock it keeps its row, also at 0 (its made / used per minute still matter).
      let ids = [...new Set([...Object.keys(Game.S.inv), ...Object.keys(Game.S.seen)])].filter((id) => it(id) && (have(id) > 0 || Game.S.seen[id] || (Game.S.autosell || {})[id] != null) && (!q || it(id).name.toLowerCase().includes(q)))
        .sort((a, b) => dir * (key ? key(a) - key(b) : 0) || (grouped ? 1 : dir) * it(a).name.localeCompare(it(b).name));
      // Rows keep their place while the Inventory is open so buttons don't move under the cursor; picking a sort re-sorts.
      // Grouped rows never move with stock, so they skip this and new goods land in their group.
      if (!grouped && ui.mkOrder && ui.mkOrder.sig === sig) {
        const pos = new Map(ui.mkOrder.ids.map((id, k) => [id, k]));
        ids = ids.filter((id) => pos.has(id)).sort((a, b) => pos.get(a) - pos.get(b)).concat(ids.filter((id) => !pos.has(id)));
      }
      ui.mkOrder = { sig, ids };
      const cap = Game.capacity(), ws = Game.wholesalerLevel(), R = Game.rates();
      let worth = 0;
      for (const id of ids) worth += have(id) * it(id).value;
      // Made / used per minute by your buildings (what the old Warehouse showed under each tile).
      const flow = (id) => {
        const mk = R.made[id] || 0, us = R.used[id] || 0;
        if (!mk && !us) return '';
        return `<span class="${mk + 1e-6 < us ? 'short' : 'okc'}">${[mk ? `+${rate(mk)}` : '', us ? `−${rate(us)}` : ''].filter(Boolean).join(' ')}</span>`;
      };
      let lastCat = null;
      rows = ids.map((id) => {
        const d = Game.S.demand[id] || 1, c = it(id).cat;
        const head = grouped && c !== lastCat ? `<tr class="grp-row"><td colspan="${ws ? 6 : 5}"><h4 class="grp">${catIcon(c)} ${catName(c)}</h4></td></tr>` : '';
        lastCat = c;
        return `${head}<tr><td>${chip(id)}</td><td class="num ${have(id) >= cap ? 'full' : ''}" title="In stock / storage capacity">${have(id)}<small class="muted">/${cap}</small></td>
          <td class="num">💰${price(Game.sellPrice(id))} ${Game.seasonPrice(id) !== 1 ? `<span class="small ${Game.seasonPrice(id) > 1 ? 'okc' : 'short'}" data-tip="${esc(`${Game.season().name} price: ${Math.round(Game.seasonPrice(id) * 100)}% of normal. Fresh produce is cheap at harvest time and dear in winter.`)}">${Game.season().icon}×${Game.seasonPrice(id)}</span>` : ''} ${d < 0.99 ? `<span class="short small" data-tip="${esc(`You sold a lot recently, so the price is at ${Math.round(d * 100)}% of normal. It recovers over time.`)}">${Math.round(d * 100)}%</span>` : ''}</td>
          <td class="num small">${flow(id)}</td>
          ${ws ? `<td>${autosellCtl(id)}</td>` : ''}
          <td class="btns">${(() => { const r = sellAboveRow(id); return `<button class="sa-row" data-action="sell" data-arg="${id}" data-qty="${r.k}" data-sarow="${id}" data-tip="${esc(r.tip)}" ${r.k ? '' : 'disabled'}>${r.text}</button>`; })()}</td></tr>`;
      }).join('');
      const sortBtn = (k, label, tip) => `<button class="${by === k ? 'active' : ''}" data-action="mk-sort" data-arg="${k}" title="${tip}">${label}${by === k ? (dir < 0 ? ' ▼' : ' ▲') : ''}</button>`;
      const stocked = ids.filter((id) => have(id) > 0).length;
      rows = storageBar(stocked ? `${stocked} kinds of goods · worth ≈ 💰${money(worth)}` : '') + (rows ? `${sellAboveBar(ids, q)}<div class="sortbar small"><span class="muted">Sort by</span><div class="seg">${sortBtn('group', 'Group', 'Ingredient groups, then by name')}${sortBtn('value', 'Value', 'Stock × price: what each line is worth')}${sortBtn('stock', 'Stock', 'How many you have')}${sortBtn('price', 'Price', 'Price per piece today')}${sortBtn('name', 'Name', 'Alphabetical')}</div><span class="muted">click again to flip</span></div>
        <table class="tbl mk-sell"><tr><th>Item</th><th class="num">Stock</th><th class="num">Price</th><th class="num" data-tip="Made / used per minute by your buildings">Per min</th>${ws ? `<th data-tip="The 🚚 Wholesaler buys everything above the amount kept, at ${Math.round(Game.WHOLESALER.share * 100)}% of the price">🚚 Auto-sell</th>` : ''}<th class="sell-h">Sell</th></tr>${rows}</table>` : '<p class="hint">Your storage is empty.</p>');
    } else if (tab === 'bank') {
      const L = Game.LOAN, loan = Game.S.loan || 0;
      rows = `<p class="hint">The village bank lends 💰${money(L.step)} at a time for a ${Math.round(L.fee * 100)}% fee, up to 💰${money(L.max)} owed in total. A quarter of everything you earn from sales and orders goes to paying it back.</p>
        <div class="stats"><div><b>💰${money(loan)}</b><span>owed</span></div><div><b>💰${money(Game.S.money)}</b><span>cash</span></div></div>
        <div class="row gap"><button class="primary" data-action="borrow" ${loan + L.step * (1 + L.fee) > L.max + 0.5 ? 'disabled' : ''}>Borrow 💰${money(L.step)} (repay ${money(L.step * (1 + L.fee))})</button>
        <button data-action="repay" ${loan > 0 && Game.S.money > 0 ? '' : 'disabled'}>Repay now</button></div>
        <p class="small muted">While your money is below zero you can't build, import or open cuisines, and fields can't buy seed.</p>`;
    } else if (tab === 'whole') {
      const W = Game.WHOLESALER, lvl = Game.wholesalerLevel(), next = W.levels[lvl], pay = Math.round(W.share * 100);
      const about = `He buys everything above the amount you keep, so your buildings never stop for a full store. He pays ${pay}% of the market price and only buys so much per game minute, so 📋 orders still pay best.`;
      const hireBtn = next ? `<button class="primary" data-action="hire-wholesaler" ${Game.S.money >= next.cost ? '' : 'disabled'}>${lvl ? `Upgrade: buys up to 💰${money(next.cap)} a minute` : `Hire him: buys up to 💰${money(next.cap)} a minute`} · 💰${money(next.cost)}</button>` : '';
      if (!Game.wholesalerUnlocked()) rows = `<p class="warn">🔒 The Wholesaler comes once you finish ${esc(Game.stageName('A'))} in 🍽️ Cuisines. Until then, sell here by hand and deliver 📋 orders.</p>`;
      else if (!lvl) rows = `<div class="ws-card ws-head"><span class="ws-ico">🚚</span><div class="ws-title"><b>The Wholesaler</b><div class="small muted">${about}</div></div></div><div class="ws-actions">${hireBtn}</div>`;
      else {
        const ws = Game.S.wholesaler, on = !ws.off, cap = Game.capacity(), half = Math.floor(cap / 2), wk = ws.keep;
        const inStock = Object.keys(Game.S.inv).filter((o) => have(o) > 0 && o !== 'water');
        const selling = inStock.filter((o) => Game.autosellOf(o) != null).length;
        const custom = Object.keys(Game.S.autosell || {}).filter((o) => Game.S.autosell[o] !== 'd').length;
        const room = Math.max(0, Math.min(1, ws.budget / Game.wholesalerCap()));
        rows = `<div class="ws-card ws-head ${on ? '' : 'off'}"><span class="ws-ico">🚚</span>
            <div class="ws-title"><b>The Wholesaler</b> ${qm(about)}
              <div class="small muted">${on ? `Buys up to 💰${money(Game.wholesalerCap())} a minute · 💰${money(ws.budget)} left this minute` : 'Paused: he buys nothing. Every item keeps its setting.'}</div>
              ${on ? `<div class="ws-room"><i style="width:${Math.round(room * 100)}%"></i></div>` : ''}</div>
            <button class="switch ${on ? 'on' : ''}" data-action="ws-on" data-arg="${on ? 0 : 1}" role="switch" aria-checked="${on}"><span class="knob"></span><span class="sw-txt">${on ? 'Buying' : 'Paused'}</span></button></div>
          <div class="ws-grid">
            <div class="ws-card"><h5>Default amount to keep ${qm('Items set to Default in the Stock tab keep this many of each; he buys the rest.')}</h5>
              <div class="seg ws-seg"><button class="${wk == null ? 'active' : ''}" data-action="ws-keep" data-arg="">Half of storage · ${half}</button><button class="${wk != null ? 'active' : ''}" data-action="ws-keep" data-arg="${wk != null ? Math.min(wk, cap) : half}">Own amount</button></div>
              ${wk != null ? `<label class="ws-own">Keep <input type="number" min="0" max="${cap}" step="1" value="${Math.min(wk, cap)}" data-wskeep="1"> of each item <span class="muted">(storage ${cap})</span></label>` : ''}</div>
            <div class="ws-card"><h5>Items on auto-sell</h5>
              <div class="ws-count"><b>${selling}</b> of ${inStock.length} goods in stock${custom ? ` · ${custom} not on Default` : ''}</div>
              <div class="ws-btns"><button data-action="as-all" ${custom ? '' : 'disabled'} data-tip="Every item back to Default, also the ones you turned off">Set all to Default</button>
              <button data-action="as-none" ${selling ? '' : 'disabled'} data-tip="Auto-sell off for every item you have now. New goods still start on Default.">Turn all off</button></div></div>
          </div>
          <div class="ws-card ws-rules"><h5>Hold back ${qm('These win over the default amount for items on Default. An item you set yourself in the Stock tab keeps your setting.')}</h5>
            ${Game.KEEP_RULES.filter((R) => R.id !== 'menu' || Game.restaurantsUnlocked()).map((R) => { // the Town stays a secret until it opens const v = Game.keepRuleOf(R.id), mode = v == null ? 'off' : v === 'all' ? 'all' : 'n';
              const n = Object.keys(Game.S.inv).filter((o) => have(o) > 0 && Game.autosellOf(o) === 'd' && (() => { const k = Game.keepRule(o); return k && k.rule.id === R.id; })()).length;
              const o = (k, label) => `<option value="${k}" ${mode === k ? 'selected' : ''}>${label}</option>`;
              return `<div class="ws-rule"><span class="ws-rn">${esc(R.name)} ${qm(R.tip)}</span><span class="small muted">${n ? `${n} in stock now` : R.id === 'winter' && Game.seasonIndex() < 2 ? 'from autumn' : ''}</span>
                <span class="asell m-${mode === 'off' ? 'off' : mode === 'n' ? 'n' : 'd'}"><select data-keeprule="${R.id}">${o('all', 'Keep all')}${o('n', 'Keep…')}${o('off', 'Off')}</select>${mode === 'n' ? `<input type="number" min="0" max="${cap}" step="5" value="${Math.min(v, cap)}" data-keeprulen="${R.id}">` : ''}</span></div>`; }).join('')}
          </div>
          <div class="ws-card ws-up"><div><b>Level ${lvl} of ${W.levels.length}</b><div class="small muted">${next ? `Next: up to 💰${money(next.cap)} of goods a minute` : 'Fully upgraded'}</div></div>${hireBtn}</div>`;
      }
    } else {
      const ids = FS.ingredientList.filter((i) => Game.canBuy(i.id) && (!q || i.name.toLowerCase().includes(q))).map((i) => i.id)
        .sort((a, b) => it(a).name.localeCompare(it(b).name));
      rows = `<p class="hint">Importing raw ingredients costs 2.5× their farm value, like real imports carry transport and trader margins. Growing your own is cheaper but slower.${ids.some(Game.starterImport) ? ' Starter supplies you can\'t make yet are sold too, until you unlock their recipe.' : ''}</p>
        <table class="tbl"><tr><th>Item</th><th>Price</th><th class="sell-h">Buy</th></tr>${ids.map((id) => `<tr><td>${chip(id)}${Game.starterImport(id) ? ' <span class="muted small" data-tip="Sold to you until you can make it yourself">Starter supply</span>' : ''}</td>
        <td class="num">💰${price(Game.buyPrice(id))}</td>
        <td class="btns"><button data-action="buy" data-arg="${id}" data-qty="1">1</button><button data-action="buy" data-arg="${id}" data-qty="10">10</button></td></tr>`).join('')}</table>`;
    }
    return {
      title: '🛖 Inventory', cls: 'wide',
      html: `<div class="tabs"><button class="${tab === 'sell' ? 'active' : ''}" data-action="mtab" data-arg="sell">📦 Stock</button>
        <button class="${tab === 'buy' ? 'active' : ''}" data-action="mtab" data-arg="buy">🚢 Import</button>
        ${Game.wholesalerLevel() ? `<button class="${tab === 'whole' ? 'active' : ''}" data-action="mtab" data-arg="whole">🚚 Wholesaler${Game.wholesalerLevel() && Game.S.wholesaler.off ? ' ⏸' : ''}</button>` : ''}
        <button class="${tab === 'bank' ? 'active' : ''}" data-action="mtab" data-arg="bank">🏦 Bank${Game.S.loan ? ' · owe ' + money(Game.S.loan) : ''}</button>
        <input type="search" class="search" data-search="mk" placeholder="Search your goods…" value="${esc(ui.search.mk || '')}"></div>${rows}`,
    };
  };

  // ----- Cookbook -----
  modals.cookbook = () => {
    const S = Game.S, f = ui.filter;
    const q = (ui.search.cb || '').toLowerCase();
    const menu = FS.dishList.filter((d) => Game.dishVisible(d.id));
    let list = menu.filter((d) => (!f.cuisine || d.cuisine === f.cuisine) && (!q || d.name.toLowerCase().includes(q))
      && (f.show === 'all' || (f.show === 'known') === !!S.discovered[d.id]));
    const cx = (d) => FS.complexity(d.id).rawCount;
    if (f.sort === 'complexity') list.sort((a, b) => cx(b) - cx(a));
    else if (f.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    const disc = Object.keys(S.discovered).length;
    // Newest opened cuisine first (leftmost in the strip, top of the dropdown).
    const cuisines = Game.cuisinesNewestFirst().map((z) => z.name).filter((c) => menu.some((d) => d.cuisine === c));
    const hidden = FS.dishList.length - menu.length;
    return {
      title: `📖 Cookbook <span class="muted">${disc} / ${FS.dishList.length} discovered</span>`, cls: 'wide',
      html: `<div class="row gap wrap">
        <input type="search" class="search" data-search="cb" placeholder="Search dishes…" value="${esc(ui.search.cb || '')}">
        ${ddPicker('cb-cuisine', [{ v: '', label: 'All cuisines' }, ...cuisines.map((c) => ({ v: c, label: c, icon: 'cz_' + FS.slug(c), n: menu.filter((d) => d.cuisine === c).length }))], f.cuisine || '', 'Filter by cuisine', 'dd-wide')}
        ${ddPicker('cb-show', [{ v: 'all', label: 'All dishes' }, { v: 'known', label: 'Discovered' }, { v: 'unknown', label: 'Undiscovered' }], f.show || 'all', 'Which dishes to show')}
        ${ddPicker('cb-sort', [{ v: 'cuisine', label: 'Sort: cuisine' }, { v: 'complexity', label: 'Sort: supply-chain size' }, { v: 'name', label: 'Sort: name' }], f.sort || 'cuisine', 'Sort order')}
        </div>
        <div class="cz-wrap"><button class="cz-arrow l" data-action="cz-scroll" data-arg="-1" title="Scroll left">‹</button><div class="cz-strip" data-scroll="czstrip">${cuisines.map((c) => {
          // Counted against every dish of the cuisine, like the Cuisines window (not only the ones showing yet).
          const all = menu.filter((d) => d.cuisine === c), got = all.filter((d) => S.discovered[d.id]), total = FS.cuisines[c];
          const pct = Math.round((got.length / total) * 100), done = got.length === total;
          const face = (got[0] || all[0]).id;
          return `<button class="cz ${f.cuisine === c ? 'on' : ''} ${done ? 'done' : ''}" data-action="cz" data-arg="${esc(c)}" title="${esc(c)}: ${got.length} of ${total} discovered">
            <span class="cz-ico ${got.length ? '' : 'sil'}">${FSI.img(face)}</span><span class="cz-txt"><b>${esc(c)}</b><span>${got.length} / ${total}${done ? ' ✓' : ''}</span>
            <i class="cz-bar"><i style="width:${pct}%"></i></i></span></button>`;
        }).join('')}</div><button class="cz-arrow r" data-action="cz-scroll" data-arg="1" title="Scroll right">›</button></div>
        ${hidden ? `<p class="hint">Showing the ${menu.length} dishes you can make from what you have unlocked. 🔒 ${hidden} more appear as you complete goals and open new <a data-action="modal" data-arg="cuisines">🍽️ cuisines</a>.</p>` : ''}
        <div class="cards">${list.map(dishCard).join('') || '<p class="hint">No dishes match.</p>'}</div>`,
    };
  };
  function dishCard(d) {
    const S = Game.S;
    const r = FS.dishRecipe[d.id];
    const n = Object.keys(r.inputs).length;
    if (S.discovered[d.id]) {
      return `<div class="card known"><div class="card-head"><span class="c-emoji">${FSI.img(d.id)}</span><div><b data-item="${d.id}" class="link">${esc(d.name)}</b><div class="muted small">${esc(d.cuisine)}</div></div></div>
        ${recipeIO({ inputs: r.inputs, outputs: {} }, { need: true }).replace('<span class="arrow">➜</span>', '')}
        ${d.about ? `<div class="small about">${esc(d.about)}</div>` : ''}
        <div class="small cplx">${cplxLine(d.id)}</div>
        ${d.note ? `<div class="small note">${esc(d.note)}</div>` : ''}
        <div class="small muted">Value 💰${price(d.value * Game.dishMult(d.id))} · cooked ${S.stats.produced[d.id] || 0}× · in stock ${have(d.id)}</div>
        <div class="card-foot row gap"><button class="small" data-action="plan" data-arg="${d.id}">🗺️ Plan production</button>${masterBtn(d.id)}</div></div>`;
    }
    const rev = S.revealed[d.id] || [];
    const slots = Object.keys(r.inputs).map((i) => (rev.includes(i) ? chip(i) : '<span class="chip unknown">❓</span>')).join(' ');
    return `<div class="card unknown"><div class="card-head"><span class="c-emoji sil" title="What could it be?">${FSI.img(d.id)}</span><div><b>${esc(d.name)}</b><div class="muted small">${esc(d.cuisine)} · ${n} ingredients</div></div></div>
      ${d.about ? `<div class="small about">${esc(d.about)}</div>` : ''}
      <div class="io">${slots}</div>
      <div class="row gap card-foot"><button class="small" data-action="tk-try" data-arg="${d.id}" title="Open the Test Kitchen${rev.length ? ' with the revealed ingredients' : ''}">🧪 Try it</button>
      <button class="small" data-action="reveal" data-arg="${d.id}" title="${revealTip()}">💡 Reveal ${Game.chefs().length ? '' : 'an ingredient '}(🎩${Game.revealCost(d.id)})</button>
      ${chefOn(d.id)}</div></div>`;
  }
  // Discovered dish cards: ⭐ when mastered, else a button to master it (greyed until cooked often enough).
  function masterBtn(id) {
    const S = Game.S, M = Game.MASTERY;
    if (!Game.masteryUnlocked()) return '';
    const pct = Math.round((M.value - 1) * 100);
    if (Game.mastered(id)) return `<span class="small okc" title="Mastered: sells for ${pct}% more and restaurant guests love it">⭐ Mastered</span>`;
    const n = S.stats.produced[id] || 0, cost = Game.masterCost(id), ok = n >= M.need && (S.toques || 0) >= cost;
    const tip = n < M.need ? `Cook it ${M.need} times first (${n} so far).` : `You have 🎩${S.toques || 0}.`;
    return `<button class="small" data-action="master" data-arg="${id}" ${ok ? '' : 'disabled'} data-tip="Perfect this dish: it sells for ${pct}% more and restaurant guests like it better. ${tip}">⭐ Master (🎩${cost})</button>`;
  }
  // Undiscovered dish cards: which chef works on it, or a button to give it to an idle one.
  function chefOn(id) {
    const chefs = Game.chefs();
    if (!chefs.length) return '';
    const c = chefs.find((x) => x.dish === id);
    if (c) return `<span class="small okc" data-tip="Chef ${esc(c.name)} is working out its ingredients at the 🎓 Academy">🎓 ${esc(c.name)}</span>`;
    return chefs.some((x) => !x.dish) ? `<button class="small" data-action="ac-send" data-arg="${id}" data-tip="Give it to a chef at the 🎓 Academy who is waiting for work">🎓 Chef</button>` : '';
  }

  // ----- Test Kitchen -----
  // Ingredients are grouped in a fixed kitchen order, then by name, so tiles never move when stock changes: fresh produce
  // first, then meat, fish, eggs and dairy, then staples and the pantry, and the farm's own goods (feed, livestock) last.
  // The Inventory's grouped view uses the same order. Groups missing here (a new category) go just before feed.
  const GROUP_ORDER = ['vegetable', 'root', 'mushroom', 'herb', 'fruit', 'berry', 'citrus', 'tropical', 'meat', 'charcuterie', 'seafood', 'egg',
    'dairy', 'cheese', 'flour', 'bread', 'pasta', 'grain', 'legume', 'nut', 'oilseed', 'oil', 'sugar', 'mineral', 'spice', 'spiceblend', 'sauce',
    'ferment', 'preserve', 'cocoa', 'drink', 'pastry', 'dish', 'feed', 'livestock'];
  const groupRank = (id) => { const k = GROUP_ORDER.indexOf(it(id).cat); return k < 0 ? GROUP_ORDER.indexOf('feed') - 0.5 : k; };
  // Everything you have in stock or have ever had: experiments are free, so you can discover a dish without stocking
  // everything at once. Cooking it still needs the real ingredients.
  const MISS = '@miss';
  const tkPool = () => FS.ingredientList.map((i) => i.id).filter((id) => have(id) > 0 || Game.S.seen[id]);
  const tkTile = (id) => `<div class="tile ${ui.tkSlots.includes(id) ? 'picked' : ''} ${have(id) > 0 ? '' : 'empty'}" data-action="tk-add" data-arg="${id}" ${have(id) > 0 ? '' : 'title="None left: you can still experiment with it"'}>
            <span class="t-emoji">${FSI.img(id)}</span><span class="t-name">${esc(it(id).name)}</span><span class="t-qty">${have(id)}</span></div>`;
  const tkSlotsHtml = () => {
    const slots = [];
    for (let k = 0; k < Game.MAX_SLOTS; k++) {
      const id = ui.tkSlots[k];
      const ok = id && ui.tkTarget && ui.tkFit && ui.tkFit.target === ui.tkTarget ? ui.tkFit.ok[id] : undefined;
      slots.push(id ? `<div class="slot full${ok === true ? ' fit-good' : ok === false ? ' fit-bad' : ''}" data-action="tk-remove" data-arg="${id}" title="Remove"><span>${FSI.img(id)}</span><small>${esc(it(id).name)}</small><i>✕</i></div>` : '<div class="slot"></div>');
    }
    return slots.join('');
  };
  modals.testkitchen = () => {
    const S = Game.S;
    const q = (ui.search.tk || '').toLowerCase();
    // After a hint about the target dish, the group filter offers the groups of the ingredients still missing.
    const miss = ui.tkTarget && ui.tkMiss && ui.tkMiss.target === ui.tkTarget && !S.discovered[ui.tkTarget] ? ui.tkMiss.cats : null;
    if (!miss && ui.filter.tkcat === MISS) ui.filter.tkcat = '';
    const cat = ui.filter.tkcat;
    const inCat = (id) => (cat === MISS ? miss.includes(it(id).cat) : !cat || it(id).cat === cat);
    const pool = tkPool();
    const ids = pool.filter((id) => (!q || it(id).name.toLowerCase().includes(q)) && inCat(id))
      .sort((a, b) => groupRank(a) - groupRank(b) || it(a).name.localeCompare(it(b).name));
    const counts = countBy(pool.filter((id) => !q || it(id).name.toLowerCase().includes(q)));
    if (cat && cat !== MISS && !counts[cat]) counts[cat] = 0;
    const extra = miss && { v: MISS, icon: 'ui_goals', label: 'Groups of missing ingredients', n: miss.reduce((n, c) => n + (counts[c] || 0), 0) };
    const hasKitchen = S.buildings.some((b) => b.type === 'kitchen');
    const left = `${hasKitchen ? '' : '<p class="warn">You need to build a 👩‍🍳 Kitchen before you can experiment.</p>'}
          ${targetBox()}
          <div class="slots">${tkSlotsHtml()}</div>
          <div class="row gap"><button class="primary" data-action="tk-cook" ${hasKitchen ? '' : 'disabled'}>🧪 Try this combination</button><button data-action="tk-clear">Clear</button></div>
          ${(ui.tkLog = ui.tkLog.filter((l) => !(Game.S.time - (l.t || 0) > 3 * Game.DAY))).length > 1 ? `<button class="small tk-hist" data-action="tk-hist">${ui.tkHist ? '▴ Hide' : '▾ Show'} earlier tries (${ui.tkLog.length - 1})</button>` : ''}
          <div class="tk-log${ui.tkHist ? ' open' : ''}">${ui.tkLog.map((l, n) => `<div class="log ${l.kind}">${l.html}${l.aim && l.aim.dish !== ui.tkTarget && !S.discovered[l.aim.dish] ? ` <button class="small tk-aim" data-action="tk-aim" data-arg="${n}" title="Aim for this dish: hints then only talk about it">🎯 Make it the target</button>` : ''}</div>`).join('')}</div>`;
    // The ingredient grid can hold hundreds of tiles, and drawing them all again took seconds on a big farm, so a pick or a
    // stock change only redraws the left side and updates the tiles in place. The grid is drawn again only when the list
    // of tiles itself changes (a new ingredient, a search, a group filter, the group menu opening).
    const key = [q, cat, ui.dd === 'tkcat', miss, ids.join()].join('|');
    return {
      title: `🧪 Test Kitchen ${qm('Combine 2–8 different ingredients. The exact set makes a dish: you discover it, and if you have enough of each it is cooked straight away. Experiments are free, and you can use anything you have ever had.')}`, cls: 'wide', speed: true,
      html: `<div class="tk" data-key="${esc(key)}">
        <div class="tk-left">${left}</div>
        <div class="tk-right">
          <div class="row gap"><input type="search" class="search" data-search="tk" placeholder="Search ingredients…" value="${esc(ui.search.tk || '')}">
          ${catPicker('tkcat', counts, 'All groups', extra)}</div>
          <div class="tiles small" data-scroll="tkpick">${ids.map((id, n) => `${n && it(ids[n - 1]).cat === it(id).cat ? '' : `<div class="tile-group">${catIcon(it(id).cat)} ${esc(catName(it(id).cat))}</div>`}${tkTile(id)}`).join('') || '<p class="hint">No ingredients in stock.</p>'}</div>
        </div></div>`,
      patch: (body) => {
        const tk = body.querySelector('.tk');
        if (!tk || tk.dataset.key !== key) return false;
        tk.querySelector('.tk-left').innerHTML = left;
        tk.querySelectorAll('.tile[data-arg]').forEach((el) => {
          const id = el.dataset.arg, n = have(id);
          el.classList.toggle('picked', ui.tkSlots.includes(id));
          el.classList.toggle('empty', n <= 0);
          if (n > 0) el.removeAttribute('title'); else el.title = 'None left: you can still experiment with it';
          const qty = el.querySelector('.t-qty');
          if (qty.textContent !== String(n)) qty.textContent = n;
        });
        return true;
      },
    };
  };

  const revealTip = () => `Reveals one ingredient for toques (2 for a dish with a long supply chain). You have ${Game.S.toques || 0}; special requests, clue orders, events and cuisine targets earn more.`;
  // The dish picked with "Try it" stays the target until it is discovered, cleared, or another one is picked.
  function targetBox() {
    const S = Game.S, id = ui.tkTarget;
    if (!id || S.discovered[id] || !FS.dishRecipe[id]) { ui.tkTarget = null; return ''; }
    const d = it(id), rev = S.revealed[id] || [];
    const ins = Object.keys(FS.dishRecipe[id].inputs), hidden = ins.filter((i) => !rev.includes(i)).length;
    const slots = ins.map((i) => (rev.includes(i) ? chip(i) : '<span class="chip unknown">❓</span>')).join(' ');
    // Phones get a short form: the revealed ingredients, then one "5 × ❓" chip for the rest.
    const short = ins.filter((i) => rev.includes(i)).map((i) => chip(i)).join(' ') + (hidden ? ` <span class="chip unknown">${hidden} × ❓</span>` : '');
    return `<div class="tk-target"><span class="c-emoji sil">${FSI.img(id)}</span><div class="tk-t-main"><div><span class="tk-t-lead">🎯 Looking for </span><b>${esc(d.name)}</b> <span class="muted small">${esc(d.cuisine)}</span></div>
      ${d.about ? `<div class="small about">${esc(d.about)}</div>` : ''}<div class="io io-full">${slots}</div><div class="io io-short">${short}</div><div class="muted small">Hints only talk about this dish.</div></div>
      <div class="tk-t-btns"><button class="small" data-action="reveal" data-arg="${id}" title="${revealTip()}">💡 <span class="tk-bl">Reveal </span>(🎩${Game.revealCost(id)})</button><button class="small" data-action="tk-untarget" title="Stop aiming for this dish">✕<span class="tk-bl"> Clear target</span></button></div></div>`;
  }

  // ----- Codex -----
  modals.codex = () => {
    const q = (ui.search.cx || '').toLowerCase();
    const cat = ui.filter.cat;
    // Only what the player knows: goods they have had or can make, and discovered dishes. The rest stays a surprise.
    const known = Object.values(FS.items).filter(codexKnown), unknown = FS.ingredientList.length - known.filter((i) => !i.dish).length;
    const found = known.filter((i) => !q || i.name.toLowerCase().includes(q));
    const counts = countBy(found.map((i) => i.id));
    if (cat && !counts[cat]) counts[cat] = 0;
    const list = found.filter((i) => !cat || i.cat === cat).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 400);
    // Searching opens a match straight away when the item on show isn't among the results: an exact name first, else the first one.
    if (q && list.length && !list.some((i) => i.id === ui.codexItem)) ui.codexItem = (list.find((i) => i.name.toLowerCase() === q) || list[0]).id;
    return {
      title: '🔎 Codex: where does food come from?', cls: 'wide',
      html: `<div class="codex">
        <div class="cx-list"><input type="search" class="search" data-search="cx" placeholder="Search ${known.length} known ingredients and dishes…" value="${esc(ui.search.cx || '')}">
          ${catPicker('cat', counts, 'All groups')}
          <div class="cx-items" data-scroll="cxlist">${list.map((i) => `<div class="cx-item ${i.id === ui.codexItem ? 'active' : ''}" data-item="${i.id}">${FSI.img(i.id)} ${esc(i.name)}</div>`).join('')}
            ${unknown > 0 && !q ? `<div class="cx-item muted">❓ ${unknown} more still unknown</div>` : ''}</div></div>
        <div class="cx-detail" data-scroll="cxdetail">${codexDetail(ui.codexItem)}</div></div>`,
    };
  };
  // Known to the player: a discovered dish, or a good they have had or can make.
  const codexKnown = (i) => (i.dish ? !!Game.S.discovered[i.id] : Game.available(i.id));
  // An undiscovered dish names its cuisine only once that cuisine is open.
  const czKnown = (id) => !!Game.S.cuisines[FS.cuisineOf(id).id];
  function codexDetail(id) {
    const i = it(id);
    if (!i) return '';
    if (!codexKnown(i)) return `<p class="hint">${i.dish ? 'Discover this dish first.' : 'You have not come across this yet.'}</p>`;
    const c = FS.complexity(id);
    const rawList = Object.entries(c.raw).sort((a, b) => b[1] - a[1]);
    const usedIn = (FS.byInput[id] || []).slice(0, 60);
    return `<div class="cx-head"><span class="cx-emoji">${FSI.img(id)}</span><div><h2>${esc(i.name)}</h2>
        <div class="muted">${catIcon(i.cat)} ${catName(i.cat)}${i.cuisine ? ' · ' + esc(i.cuisine) : ''} · value 💰${price(i.value)} · in stock ${have(id)}</div></div>
        <button class="primary plan-btn" data-action="plan" data-arg="${id}">🗺️ Plan production</button></div>
      ${!i.dish && !Game.available(id) ? `<p class="locked">🔒 Not unlocked yet: it unlocks with ${esc(Game.sourceText(i.bestRecipe.id))}.</p>` : ''}
      ${i.about ? `<p class="about">${esc(i.about)}</p>` : ''}
      ${i.origin ? `<p>🌍 <b>Origin:</b> ${esc(i.origin)}</p>` : ''}
      ${i.fact || i.note ? `<p class="fact">💡 ${esc(i.fact || i.note)}</p>` : ''}
      ${Object.keys(i.bestRecipe.inputs).length ? `
      <div class="stats">
        <div><b>${c.rawCount}</b><span>raw ingredients</span></div><div><b>${c.steps}</b><span>processing steps</span></div>
        <div><b>${c.buildings}</b><span>kinds of buildings</span></div><div><b>${c.depth}</b><span>chain depth</span></div>
        <div><b>${dur(c.time)}</b><span>fastest from scratch</span></div></div>
      ${priceBreakdown(id)}
      <h4>To make 1 × ${esc(i.name)} you ultimately need</h4>
      <div class="io">${rawList.map(([r, q]) => chip(r, q)).join(' ')}</div>
      <h4>Supply chain</h4><div class="tree">${tree(id, 1, 0, new Set())}</div>` : `<p class="muted">A raw ingredient: produced at the ${FS.buildings[i.bestRecipe.building].name}${Object.keys(i.bestRecipe.inputs).length ? '' : ''}.</p>`}
      <h4>How it is made</h4>${(FS.byOutput[id] || []).map((r) => `<div class="recipe-card"><div class="muted small">${FSI.img('b_' + r.building)} ${FS.buildings[r.building].name}${r.label ? ' · ' + esc(r.label) : ''} · ⏱ ${dur(r.time)}${r.cost ? ` · 💰${r.cost}` : ''}</div>${recipeIO(r)}</div>`).join('')}
      <h4>Used in (${(FS.byInput[id] || []).length})</h4>
      <div class="io">${usedIn.map((r) => (r.dish && !Game.S.discovered[r.primary] ? (czKnown(r.primary) ? `<span class="chip unknown" title="An undiscovered ${esc(it(r.primary).cuisine)} dish">❓ ${FSI.img('cz_' + FS.slug(it(r.primary).cuisine))} ${esc(it(r.primary).cuisine)} dish</span>` : '<span class="chip unknown" title="Something still to discover">❓ a dish yet to be discovered</span>')
        : !codexKnown(it(r.primary)) ? '<span class="chip unknown" title="Something still to discover">❓ something new</span>' : chip(r.primary))).join(' ') || '<span class="muted">Nothing (yet): sell it at the market.</span>'}</div>`;
  }
  let treeNodes = 0;
  function tree(id, qty, depth, path) {
    if (depth === 0) treeNodes = 0;
    treeNodes++;
    const i = it(id), r = i.bestRecipe;
    const leaf = !r || !Object.keys(r.inputs).length || path.has(id) || depth > 12 || treeNodes > 400;
    const where = r ? `<span class="muted small">${FSI.img('b_' + r.building)} ${FS.buildings[r.building].name}${r.time ? ' · ' + dur(r.time) : ''}</span>` : '';
    if (leaf) return `<div class="tnode leaf">${chip(id, qty)} ${where}</div>`;
    path.add(id);
    const per = qty / r.outputs[id];
    const kids = Object.entries(r.inputs).map(([k, q]) => tree(k, q * per, depth + 1, path)).join('');
    path.delete(id);
    return `<details class="tnode" ${depth < 2 ? 'open' : ''}><summary>${chip(id, qty)} ${where}</summary>${kids}</details>`;
  }

  // ----- Production plan -----
  // Every step needed to make an item from scratch, in production order (farm first, dish last).
  function planSteps(id) {
    const order = [], seen = new Set();
    const walk = (x, stack) => {
      const r = recipeOf(x);
      if (!r || seen.has(r.id) || stack.has(x)) return;
      stack.add(x);
      for (const i in r.inputs) walk(i, stack);
      stack.delete(x);
      if (!seen.has(r.id)) { seen.add(r.id); order.push(r); }
    };
    walk(id, new Set());
    return order;
  }
  // What a blueprint for an item would do: build every unlocked step that nothing runs yet, except where an idle
  // building of the right kind can take it on. links: pairs of items (by index) where one makes what the other uses.
  function blueprintFor(id) {
    const S = Game.S, items = [], idle = [], used = new Set();
    for (const r of planSteps(id)) {
      if (!Game.stepUnlocked(r.id) || S.buildings.some((b) => b.recipe === r.id)) continue;
      const b = S.buildings.find((x) => x.type === r.building && !x.recipe && !used.has(x.id));
      if (b) { used.add(b.id); idle.push({ id: b.id, rid: r.id }); } else items.push({ rid: r.id, type: r.building });
    }
    return { items, idle, links: bpLinks(items) };
  }
  function bpLinks(items) {
    const links = [];
    for (let a = 0; a < items.length; a++) for (let b = a + 1; b < items.length; b++) if (Game.bpLinked(items[a].rid, items[b].rid)) links.push([a, b]);
    return links;
  }
  // The whole chain on its own, ignoring what the farm already has: as many buildings per step as it takes to keep one
  // building of the last step running at 100%, at base speed (no season or weather). Every building runs flat out
  // except the last one of each step, whose production rate is turned down to what is still needed (rounded up to 5%).
  function blueprintFull(id, mult = 1) {
    const steps = planSteps(id).filter((r) => Game.stepUnlocked(r.id));
    const last = steps[steps.length - 1], need = {}, items = [], counts = [];
    if (!last || !last.outputs[id]) return { items, idle: [], links: [], full: true, counts };
    // planSteps lists inputs before their users, so walking it backwards meets every user before what it uses.
    for (const r of steps.slice().reverse()) {
      const per = 60 / r.time; // batches a minute at full rate
      const runs = r === last ? per * mult : Math.max(0, ...Object.entries(r.outputs).map(([o, q]) => (need[o] || 0) / q));
      if (runs <= 1e-9) continue;
      const n = Math.ceil(runs / per - 1e-9), rest = runs / per - (n - 1);
      const rate = Math.max(0.1, Math.min(1, Math.ceil(rest * 20 - 1e-6) / 20));
      // What the step's suppliers must deliver follows the rates as set (rounded up, 10% at least), so every input bar is full.
      for (const [i, q] of Object.entries(r.inputs)) need[i] = (need[i] || 0) + (n - 1 + rate) * per * q;
      counts.unshift({ rid: r.id, n, rate });
      for (let k = 0; k < n; k++) items.unshift({ rid: r.id, type: r.building, rate: k < n - 1 || rate >= 1 ? undefined : rate });
    }
    return { items, idle: [], links: bpLinks(items), full: true, mult, counts, locked: planSteps(id).length - steps.length };
  }
  function blueprintOffer(id) {
    const bp = blueprintFor(id), full = Game.blueprintsUnlocked() ? blueprintFull(id) : null;
    if (!bp.items.length && !bp.idle.length && !(full && full.items.length)) return '';
    if (!Game.blueprintsUnlocked()) return Game.featureKnown('blueprints') ? `<p class="hint">📐 After ${esc(Game.stageName('C'))}, <b>Blueprints</b> set down every missing step of a chain like this in one go.</p>` : '';
    const cost = Game.blueprintCost(bp.items), n = bp.items.length;
    const what = n ? `${n} building${n === 1 ? '' : 's'} 💰${money(cost)}` : `put ${bp.idle.length} idle building${bp.idle.length === 1 ? '' : 's'} to work`;
    const fn = full.items.length, fcost = Game.blueprintCost(full.items), lastB = fn && FS.buildings[full.items[fn - 1].type];
    const gaps = n || bp.idle.length ? `<div class="bp-offer"><button class="primary" data-action="bp-start" data-arg="${id}" data-tip="${esc(`${n ? 'Only the steps nothing runs yet, laid out close together for the nearby saving and with their recipes set. Uses what you already have.' : 'Every step already has a building.'}${bp.idle.length && n ? ` ${bp.idle.length} idle building${bp.idle.length === 1 ? ' is' : 's are'} put to work too.` : ''}`)}">📐 Fill the gaps · ${what}</button></div>` : '';
    if (!fn) return gaps;
    return gaps + `<div class="bp-offer"><button class="primary" data-action="bp-full" data-arg="${id}" data-tip="${esc(`Everything from scratch, on its own: enough buildings at each step to keep one ${lastB.name} at 100%, each set to the rate it needs. Balanced for normal growth; winter and weather slow the farms.`)}">📐 Whole chain, balanced · ${fn} building${fn === 1 ? '' : 's'} 💰${money(fcost)}</button>${full.locked ? ` <span class="small short">${full.locked} locked step${full.locked === 1 ? ' is' : 's are'} left out.</span>` : ''}</div>`;
  }
  const PLACE_NOTE = { shore: 'next to water', rock: 'next to rocky ground', forest: 'next to forest' };
  modals.plan = () => {
    const S = Game.S, id = ui.planItem, i = it(id);
    const steps = planSteps(id);
    let toBuild = 0, cost = 0, locked = 0;
    const rows = steps.map((r) => {
      const bt = FS.buildings[r.building];
      if (!Game.stepUnlocked(r.id)) {
        if (!r.dish) locked++;
        return `<div class="plan-row lockedrow"><div class="plan-b">${FSI.img('b_' + bt.id)}<div><b>${esc(bt.name)}</b><div class="small muted">${esc(r.label || it(r.primary).name)} · ⏱${dur(r.time)}</div></div></div>
          ${recipeIO(r)}<div class="plan-s">${r.dish && !S.discovered[r.primary] ? '<span class="locked">🔒 discover this dish in the 🧪 Test Kitchen first</span>' : lockNote(r.id)}<span class="small muted">stock ${have(r.primary)}</span></div></div>`;
      }
      const running = S.buildings.filter((b) => b.recipe === r.id).length;
      const idle = S.buildings.some((b) => b.type === r.building && !b.recipe);
      if (!running && !idle) { toBuild++; cost += bt.cost; }
      const state = running ? `<span class="okc">✅ ${running} running</span>` : idle ? `<span class="warnc">🔧 idle ${esc(bt.name)} available</span>` : `<span class="short">🏗️ not built</span>`;
      const btn = idle && !running ? `<button class="small primary" data-action="plan-assign" data-arg="${r.id}">Use idle ${esc(bt.name)}</button>`
        : `<button class="small ${running ? '' : 'primary'}" data-action="plan-build" data-arg="${r.id}">${running ? 'Build another' : 'Build'} 💰${bt.cost}</button>`;
      return `<div class="plan-row"><div class="plan-b">${FSI.img('b_' + bt.id)}<div><b>${esc(bt.name)}</b><div class="small muted">${esc(r.label || it(r.primary).name)} · ⏱${dur(r.time)}${PLACE_NOTE[bt.place] ? ' · ' + PLACE_NOTE[bt.place] : ''}</div></div></div>
        ${recipeIO(r)}<div class="plan-s">${state}<span class="small muted">stock ${have(r.primary)}</span>${btn}</div></div>`;
    }).join('');
    // Same counting as the Codex. Where a step of the Codex's route isn't open yet, the plan takes another one, and says so.
    const nSteps = steps.filter((r) => Object.keys(r.inputs).length).length, nKinds = new Set(steps.map((r) => r.building)).size, cx = FS.complexity(id);
    const routeNote = nSteps !== cx.steps || nKinds !== cx.buildings ? ' ' + qm(`Your farm can't use every step of the usual route yet, so this plan takes another one. The 🔍 Codex counts the usual route: ${cx.steps} processing steps, ${cx.buildings} kinds of buildings.`) : '';
    return {
      title: `🗺️ Production plan: ${FSI.img(i.id)} ${esc(i.name)} ${qm(`Everything it takes to make ${i.name} from scratch. Build a missing step and it is set to the right recipe straight away. Turn on Flows (F) to see goods move between your buildings.`)}`, cls: 'wide',
      html: `        <div class="stats"><div><b>${nSteps}</b><span>processing steps${routeNote}</span></div><div><b>${nKinds}</b><span>kinds of buildings${routeNote}</span></div>
        <div><b>${toBuild + locked}</b><span>steps still missing${locked ? ' ' + qm(`${toBuild} can be built now, ${locked} ${locked > 1 ? 'are' : 'is'} not unlocked yet.`) : ''}</span></div><div><b>💰${money(cost)}</b><span>to build ${locked ? 'the open ones' : 'them'}</span></div></div>
        ${blueprintOffer(id)}
        ${locked ? `<p class="warn">🔒 ${locked} step${locked > 1 ? 's are' : ' is'} not unlocked yet. Complete goals or open a new <a data-action="modal" data-arg="cuisines">🍽️ cuisine</a> to unlock ${locked > 1 ? 'them' : 'it'}.</p>` : ''}
        <div class="plan">${rows}</div>`,
    };
  };
  function priceBreakdown(id) {
    const i = it(id), p = FS.priceParts(id), v = i.value || 1;
    const seg = [['farm', '🌱 Farm', '#6aa84f'], ['processing', '🏭 Processing', '#e8a33d'], ['kitchen', '👩‍🍳 Kitchen', '#c0604a']].filter(([k]) => p[k] > 0.005 * v);
    return `<h4>Where the price goes ${qm('Farm is what the raw ingredients are worth to the farmer, processing is every workshop step, kitchen is cooking and serving. In the USA farmers get about 15 cents of every dollar spent on food; the rest pays for processing, transport, shops and restaurants.')}</h4>
      <div class="pricebar">${seg.map(([k, n, c]) => `<div style="flex:${p[k]};background:${c}" data-tip="${n}: 💰${price(p[k])}">${p[k] / v > 0.12 ? Math.round((p[k] / v) * 100) + '%' : ''}</div>`).join('')}</div>
      <div class="small legend">${seg.map(([k, n, c]) => `<span><i style="background:${c}"></i>${n} 💰${price(p[k])} (${Math.round((p[k] / v) * 100)}%)</span>`).join('')}</div>`;
  }

  // ----- Culinary Academy: hire chefs with toques, point them at undiscovered dishes -----
  const chefPct = (c) => (c.dish ? Math.min(100, Math.round((c.prog / Game.chefTime(c, c.dish)) * 100)) : 0);
  // Each chef has their own portrait (assets/icons/chefs.js); the small badge is the cuisine they specialise in.
  const chefFace = (name) => FSI.img(FSI.chefId(name)) || FSI.img('ui_chef');
  const chefPortrait = (c) => `<span class="pack-icon chef-face">${chefFace(c.name)}<span class="cz-badge" title="Speciality: ${esc(FS.cuisineById[c.cz].name)}">${FSI.img('cz_' + c.cz)}</span></span>`;
  const czIcon = (cz) => `<span title="${esc(FS.cuisineById[cz].name)}">${FSI.img('cz_' + cz)}</span>`;
  const school = (cz) => `${esc(Game.CHEF_SCHOOLS[cz][0])}, ${esc(FS.cuisineById[cz].name)}`;
  const gameHours = (t) => { const h = t / Game.HOUR; return h < 1.95 ? `${+h.toFixed(1)} game hour${h === 1 ? '' : 's'}` : `${Math.round(h)} game hours`; };
  function chefCard(c) {
    const S = Game.S, A = Game.ACADEMY, picking = ui.acPick === c.id;
    let task;
    if (c.dish) {
      const ins = Object.keys(FS.dishRecipe[c.dish].inputs), rev = S.revealed[c.dish] || [];
      task = `<div class="small">Working out <b data-item="${c.dish}" class="link">${esc(it(c.dish).name)}</b> ${c.auto ? `<span class="muted">(then more ${esc(FS.cuisineById[c.auto].name)})</span>` : ''}</div>
        <div class="io">${ins.map((i) => (rev.includes(i) ? chip(i) : '<span class="chip unknown">❓</span>')).join(' ')}</div>
        <div class="gprog" title="Time to the next ingredient"><span class="gbar"><i style="width:${chefPct(c)}%"></i></span>next ingredient: one every ${gameHours(Game.chefTime(c, c.dish))}</div>`;
    } else task = `<p class="warn small">Waiting for a dish to work out.</p>`;
    const train = c.lvl < A.levels.length ? `<button class="small" data-action="ac-train" data-arg="${c.id}" ${(S.toques || 0) >= Game.trainCost(c) ? '' : 'disabled'} title="Each level makes them faster (${Math.round((1 - A.levels[c.lvl] / A.levels[c.lvl - 1]) * 100)}% less time per ingredient)">📚 Train to level ${c.lvl + 1} (🎩${Game.trainCost(c)})</button>` : '';
    return `<div class="pack ac-chef"><div class="pack-head">${chefPortrait(c)}<div><b>${esc(c.name)}</b> <span class="lvl" title="Level ${c.lvl} of ${A.levels.length}">${'★'.repeat(c.lvl)}<i>${'★'.repeat(A.levels.length - c.lvl)}</i></span>
      <div class="small muted">${czIcon(c.cz)} trained in ${school(c.cz)} · ${c.done} dish${c.done === 1 ? '' : 'es'} worked out</div></div></div>
      ${task}
      <div class="row gap wrap"><button class="small ${picking ? 'active' : ''}" data-action="ac-pick" data-arg="${c.id}">🎯 ${c.dish ? 'Change dish' : 'Pick a dish'}</button>${train}
      ${c.dish ? `<button class="small" data-action="ac-assign" data-arg="${c.id}|" title="Stop working on this dish (what is revealed stays revealed)">⏹ Stop</button>` : ''}
      <button class="small danger" data-action="ac-dismiss" data-arg="${c.id}" title="Let them go to free a place. No toques back.">👋 Let go</button></div></div>`;
  }
  // The dish picker for one chef: each open cuisine with "surprise me" and its undiscovered dishes.
  function chefPicker(c) {
    const S = Game.S;
    const czs = FS.CUISINES.filter((z) => S.cuisines[z.id]).map((z) => ({ z, list: Game.chefTargets(z.id, c) })).filter((x) => x.list.length)
      .sort((a, b) => (b.z.id === c.cz) - (a.z.id === c.cz) || b.z.stage.localeCompare(a.z.stage));
    if (!czs.length) return '<p class="hint">Nothing to work out right now: every dish you can see in the 📖 Cookbook is discovered. Open a new 🍽️ cuisine.</p>';
    return `<div class="ac-picker" data-scroll="acpick"><p class="small muted">Pick a dish for ${esc(c.name)}, or 🎲 let them work through a whole cuisine. Their speciality goes ${Math.round((1 / Game.ACADEMY.spec - 1) * 100)}% faster.</p>
      ${czs.map(({ z, list }) => `<div class="ac-cz"><div class="ac-cz-head">${czIcon(z.id)} <b>${esc(z.name)}</b>${z.id === c.cz ? ' <span class="okc small">★ speciality</span>' : ''} <span class="muted small">${list.length} to work out</span>
        <button class="small" data-action="ac-assign" data-arg="${c.id}|cz:${z.id}">🎲 Surprise me</button></div>
        <div class="ac-dishes">${list.map((id) => {
          const n = Object.keys(FS.dishRecipe[id].inputs).length, k = (S.revealed[id] || []).length;
          return `<button class="small ac-dish ${c.dish === id ? 'active' : ''}" data-action="ac-assign" data-arg="${c.id}|${id}" title="${k} of ${n} ingredients known · about ${gameHours(Game.chefTime(c, id) * (n - k))} for ${esc(c.name)}"><span class="sil">${FSI.img(id)}</span>${esc(it(id).name)} <span class="muted">${k}/${n}</span></button>`;
        }).join('')}</div></div>`).join('')}</div>`;
  }
  modals.academy = () => {
    const S = Game.S, A = Game.ACADEMY, chefs = Game.chefs(), b = Game.academyBuilding();
    if (!Game.academyUnlocked())
      return Game.featureKnown('academy') ? { title: '🎓 Culinary Academy', html: `<p class="warn">🔒 The Culinary Academy opens once you finish ${esc(Game.stageName('B'))} in 🍽️ Cuisines.</p>
        <p class="hint">Chefs you hire there with 🎩 toques work out undiscovered dishes for you, one ingredient every few game hours. They reveal recipes but never cook them: you still grow, process and cook every dish from your own supply chain.</p>` }
        : { title: '🔒 Not yet', html: `<p class="hint">Keep cooking through the 🍽️ cuisines.</p>` };
    const cands = Game.candidates(), full = chefs.length >= A.seats, cost = Game.chefCost();
    const picking = chefs.find((c) => c.id === ui.acPick);
    const candHtml = cands.map((c, k) => `<div class="pack"><div class="pack-head">${chefPortrait(c)}<div><b>${esc(c.name)}</b><div class="small muted">trained in ${school(c.cz)}</div></div></div>
      <p class="small">${S.cuisines[c.cz] ? `Works ${Math.round((1 / A.spec - 1) * 100)}% faster on ${esc(FS.cuisineById[c.cz].name)} dishes.` : `${esc(FS.cuisineById[c.cz].name)} isn't open yet: their postcards from home hint at its dishes.`}</p>
      <button class="primary" data-action="ac-hire" data-arg="${k}" ${!b || full || (S.toques || 0) < cost ? 'disabled' : ''}>Hire for 🎩${cost}</button></div>`).join('');
    const cards = (S.academy && S.academy.cards || []).slice().reverse().map((p) => `<div class="small ac-card">💌 ${chefFace(p.chef)} <b>${esc(p.chef)}</b>, day ${p.day + 1}: ${FSI.img(p.dish)} <b>${esc(it(p.dish).name)}</b> (${esc(FS.cuisineById[p.cz].name)}) needs ${chip(p.ing)}</div>`).join('');
    return {
      title: `🎓 Culinary Academy <span class="muted">${chefs.length} / ${A.seats} chefs · 🎩 ${S.toques || 0}</span> ${qm(`Chefs work out an undiscovered dish one ingredient at a time. Once every ingredient is known the dish is discovered, but you still cook it from your own supply chain. Chefs are hired and trained with 🎩 toques.${Game.restaurantsUnlocked() ? ' A trained chef can also become 👨‍🍳 head chef of one of your restaurants.' : ''}`)}`, cls: 'wide',
      html: `        ${b ? (b.paused ? '<p class="warn">⏸ The Academy is paused: the chefs are not working.</p>' : '') : '<p class="warn">Build the 🎓 Culinary Academy (Cooking, in the build menu) so chefs have somewhere to work.</p>'}
        <h4>Your chefs</h4>
        ${chefs.length ? `<div class="packs">${chefs.map(chefCard).join('')}</div>` : '<p class="hint">No chefs yet. Hire one below.</p>'}
        ${picking ? chefPicker(picking) : ''}
        <h4>Looking for work <span class="muted small">${full ? `the Academy is full; let a chef go to hire another` : `new faces every game day · next hire 🎩${cost}`}</span></h4>
        <div class="packs">${candHtml || '<p class="hint">Nobody new today.</p>'}</div>
        ${cards ? `<h4>💌 Recipe postcards</h4><div class="ac-cards">${cards}</div>` : ''}`,
    };
  };

  // ----- Town: a full-screen isometric town (js/townmap.js) with a side panel for the selected lot and the Town Guide -----
  // Five stars drawn twice: grey underneath, gold on top clipped to the rating.
  const starBar = (v) => `<span class="stars" title="${v === null ? 'Not rated yet' : v.toFixed(1) + ' of 5 stars'}"><i style="width:${v === null ? 0 : (v / 5) * 100}%">★★★★★</i>★★★★★</span>`;
  const PRICE_TIPS = ['Cheaper than usual: less money per guest, but some guests love a bargain', 'The usual restaurant price', 'Fine-dining prices: more per guest, if the guests accept it'];
  const share = (x) => Math.round(x * 100) + '%';
  // A small ? that explains something on hover, instead of a paragraph that is always there.
  const qm = (tip) => `<span class="qm" data-tip="${esc(tip)}">?</span>`;
  // What the food critic has told you about a district's cuisines: ✓ wanted, ✗ not wanted. The rest is detective work.
  const notesRow = (d) => {
    const n = Game.cuisineNotes(d.id);
    if (!n.right.length && !n.wrong.length) return '';
    return `<span class="tw-czs" data-tip="What the critic has told you: ✓ wanted here, ✗ not wanted">${n.right.map((cz) => `<span class="ok">${czIcon(cz)}</span>`).join('')}${n.wrong.map((cz) => `<span class="no">${czIcon(cz)}</span>`).join('')}</span>`;
  };
  const districtTip = (d) => `${d.who}. They like ${Game.TOWN.prices[d.price].name.toLowerCase()} prices.`;
  const knownWrong = (d, id) => Game.cuisineNotes(d.id).wrong.includes(FS.cuisineOf(id).id);
  function districtCard(d) {
    const c = Game.contenders(d.id).sort((a, b) => b.rating - a.rating), tot = c.reduce((a, x) => a + x.weight, 0);
    const lock = Game.districtOpen(d.id) ? '' : ` <span data-tip="${esc('Opens with: ' + Game.districtNeed(d.id).map((x) => (x.done ? '✅ ' : '⬜ ') + x.text).join(' · '))}">🔒</span>`;
    return `<div class="tw-dcard" style="--dc:${d.color}"><div class="tw-dname">${esc(d.name)}${lock} ${notesRow(d)} <span class="small" data-tip="${esc(districtTip(d))}">${esc(d.short)}</span></div>
      ${c.length ? `<div class="tw-standing">${c.map((x) => `<div class="${x.r ? 'mine' : ''}"><span>${esc(x.r ? x.r.name : x.rv.name)}</span>${starBar(x.rating)}<b>${x.rating.toFixed(1)}</b><span class="small muted" data-tip="Share of this district's guests">${share(tot ? x.weight / tot : 0)}</span></div>`).join('')}</div>` : ''}</div>`;
  }
  // How well a restaurant fits its district: its cuisines, the price level its guests like, and who it competes with.
  function fitBox(r, d) {
    const P = Game.TOWN.prices, poff = Math.abs(r.price - d.price), n = Game.cuisineNotes(d.id), known = n.right.length + n.wrong.length;
    const c = Game.contenders(d.id), tot = c.reduce((a, x) => a + x.weight, 0), me = c.find((x) => x.r === r), rivals = c.filter((x) => x.rv);
    const ok = (b) => (b ? '✅' : '⚠️');
    return `<div class="tw-fit" style="--dc:${d.color}">
      <div>🔎 ${known ? `${notesRow(d)} <span class="small muted">${n.right.length} of 5 found</span>` : '<span class="muted">Which cuisines?</span>'} ${qm(`${d.name} guests want five cuisines, and a menu earns its stars with dishes of all five and nothing else. Nobody tells you which: watch the stars, and read what the food critic writes after each visit.`)}</div>
      <div>${ok(!poff)} 💰 ${P[r.price].name}${poff ? ` <span class="muted">(they like ${P[d.price].name})</span>` : ''}</div>
      ${rivals.length ? `<div>⚔️ ${share(tot && me ? me.weight / tot : 0)} of guests vs ${rivals.map((x) => `${esc(x.rv.name)} ★${x.rating.toFixed(1)}`).join(', ')} ${qm('Guests in a district pick between its restaurants by stars: more stars, more guests.')}</div>` : ''}</div>`;
  }
  function restaurantPanel(r) {
    const S = Game.S, l = Game.lot(r.spot), d = Game.district(l.district), v = Game.rating(r), T = Game.TOWN, cap = Game.ratingCap(r);
    const czs = Game.menuCuisines(r);
    const menu = r.menu.map((id) => {
      const n = have(id);
      return `<div class="tw-dish ${n < 1 ? 'out' : ''}"><span class="ico-l">${FSI.img(id)}</span><div><b data-item="${id}" class="link">${esc(it(id).name)}</b>${knownWrong(d, id) ? ` <span class="warnc" title="The critic says this cuisine doesn't belong here">✗</span>` : ''}
        <div class="small muted">${esc(it(id).cuisine)} · <span class="nowrap">💰${price(it(id).value * T.prices[r.price].mult * Game.dishMult(id))} a plate</span>${Game.mastered(id) ? ' · <span class="okc" title="Mastered">⭐</span>' : ''}${Game.headBonus(r, id) ? ` · <span class="okc" title="${esc(r.chef.name)}'s speciality">👨‍🍳</span>` : ''}</div></div>
        <span class="small ${n < 1 ? 'short' : ''}" title="In your warehouse">${n < 1 ? 'out of stock' : `📦 ${n}`}</span>
        <button class="small" data-action="plan" data-arg="${id}" title="Plan production for this dish">🗺️</button>
        <button class="small" data-action="menu-del" data-arg="${r.id}|${id}" title="Take it off the menu">✕</button></div>`;
    }).join('');
    // Dishes that could go on the menu: discovered ones, by cuisine.
    const known = FS.dishList.filter((x) => S.discovered[x.id] && !r.menu.includes(x.id));
    const czOpts = [...new Set(known.map((x) => FS.cuisineOf(x.id).id))].map((c) => FS.cuisineById[c]).sort((a, b) => FS.CUISINES.indexOf(a) - FS.CUISINES.indexOf(b));
    const czf = czOpts.some((c) => c.id === ui.townCz) ? ui.townCz : '';
    // Search matches the dish, its cuisine or an ingredient. Grouped by cuisine; cuisines and dishes with stock come first.
    const q = (ui.search.town || '').toLowerCase().trim();
    const hit = (x) => !q || x.name.toLowerCase().includes(q) || (x.cuisine || '').toLowerCase().includes(q)
      || Object.keys(FS.dishRecipe[x.id].inputs).some((i) => it(i).name.toLowerCase().includes(q));
    const pickList = known.filter((x) => (!czf || FS.cuisineOf(x.id).id === czf) && (!ui.townStock || have(x.id) > 0) && hit(x))
      .sort((a, b) => (have(b.id) > 0) - (have(a.id) > 0) || a.name.localeCompare(b.name));
    const groups = new Map();
    for (const x of pickList) { const c = FS.cuisineOf(x.id).id; if (!groups.has(c)) groups.set(c, []); groups.get(c).push(x); }
    const groupList = [...groups.entries()].sort(([a, la], [b, lb]) => (have(lb[0].id) > 0) - (have(la[0].id) > 0) || FS.CUISINES.indexOf(FS.cuisineById[a]) - FS.CUISINES.indexOf(FS.cuisineById[b]));
    const full = r.menu.length >= T.menuMax;
    const reviews = r.reviews.slice().reverse().map((x) => `<div class="tw-review"><div>${starBar(x.stars)} <b>${esc(x.who)}</b> <span class="small muted">day ${Math.floor(x.t / Game.DAY) + 1}, ${clockOf(x.t)}</span></div>
      <div>“${esc(x.text)}”</div></div>`).join('');
    return `<div class="tw-head"><span class="pack-icon">${FSI.img('ui_restaurant')}</span><div><h3>${esc(r.name)} <button class="small ghost" data-action="town-rename" data-arg="${r.id}" title="Rename this restaurant">✏️</button></h3>
        <div class="small muted">${esc(l.name)}, ${esc(d.name)}${r.bought ? ' · bought from its old owner' : ''}${Game.awardBoost(r.spot) > 1 ? ` · 🏆 ${esc(d.name)}'s Restaurant of the Year` : ''}</div>
        <div>${starBar(v)} <b>${v === null ? 'new' : v.toFixed(1)}</b>${cap < 5 ? ` <span class="small muted" data-tip="This restaurant can't be rated higher yet.">max ${cap.toFixed(1)}</span>` : ''}
          ${qm(v === null ? `Rated after ${T.minGuests} guests.` : `Average of the last ${r.scores.length} guests.`)}</div>
        <div class="small muted"><span data-tip="Plates served">🍽️ ${r.served}</span> · <span data-tip="Guests turned away because their dish was sold out">😠 ${r.missed}</span> · <span data-tip="Earned so far (upkeep ${T.upkeep}/min)">💰${money(r.earned)}</span></div></div></div>
      ${fitBox(r, d)}
      ${Game.headChefsUnlocked() || r.chef ? `<h4>Head chef ${qm(`Promote a chef from the 🎓 Culinary Academy for 🎩${Game.HEAD.promote}. Guests rate dishes of their speciality higher, and the rating can go higher too. Train chefs at the Academy first: their level comes with them.`)}</h4>${headChefBox(r)}` : ''}
      <h4>Prices ${qm("Price per plate, as a multiple of the dish's value.")}</h4>
      <div class="row gap">${T.prices.map((p, k) => `<button class="${r.price === k ? 'primary' : ''}" data-action="town-price" data-arg="${r.id}|${k}" title="${PRICE_TIPS[k]}">${p.name} ×${p.mult}</button>`).join('')}</div>
      <h4>Menu <span class="small muted">${r.menu.length} / ${T.menuMax}</span></h4>
      ${r.menu.length && r.menu.length < T.menuMin ? `<p class="warn small">Guests come once the menu has ${T.menuMin} dishes.</p>` : ''}
      ${menu || '<p class="hint">Empty: add dishes below.</p>'}
      <h4>Add a dish ${full ? '<span class="small muted">menu full</span>' : ''}</h4>
      <div class="row gap wrap"><input type="search" class="search" data-search="town" placeholder="Search dishes, cuisines, ingredients" value="${esc(ui.search.town || '')}">
        ${ddPicker('town-cz', [{ v: '', label: 'All cuisines' }, ...czOpts.map((c) => ({ v: c.id, label: (Game.cuisineNotes(d.id).wrong.includes(c.id) ? '✗ ' : '') + c.name, icon: 'cz_' + c.id, n: known.filter((x) => FS.cuisineOf(x.id).id === c.id).length }))], czf, 'Filter by cuisine', 'dd-wide')}
        <label class="small tw-stock"><input type="checkbox" data-change="town-stock" ${ui.townStock ? 'checked' : ''}> In stock only</label></div>
      <div class="tw-pick" data-scroll="twpick">${groupList.map(([cz, list]) => `<div class="tw-pick-cz">${FSI.img('cz_' + cz)} ${esc(FS.cuisineById[cz].name)} <span class="muted">${list.filter((x) => have(x.id) > 0).length} / ${list.length} in stock</span></div>${list.map((x) => `<button class="small ${knownWrong(d, x.id) ? 'unwanted' : ''}" data-action="menu-add" data-arg="${r.id}|${x.id}" ${full ? 'disabled' : ''} title="${knownWrong(d, x.id) ? `✗ The critic says this cuisine doesn't belong here · ` : ''}${esc(x.cuisine)} · ${have(x.id)} in stock${x.about ? '\n' + esc(x.about) : ''}">${FSI.img(x.id)} ${esc(x.name)} <span class="muted">${have(x.id)}</span></button>`).join('')}`).join('') || `<span class="hint">${ui.townStock ? 'No dishes in stock match.' : 'No discovered dishes match.'}</span>`}</div>
      <h4>Guest reviews</h4>
      ${reviews || '<p class="hint">No reviews yet.</p>'}
      ${r.bought ? '' : `<p><button class="small danger" data-action="town-close" data-arg="${r.id}">Close this restaurant</button></p>`}`;
  }
  // A restaurant's head chef, or the Academy chefs who could take the job.
  function headChefBox(r) {
    const S = Game.S, H = Game.HEAD, A = Game.ACADEMY, c = r.chef;
    if (c) {
      const train = c.lvl < A.levels.length ? `<button class="small" data-action="head-train" data-arg="${r.id}" ${(S.toques || 0) >= Game.trainCost(c) ? '' : 'disabled'}>📚 Train to level ${c.lvl + 1} (🎩${Game.trainCost(c)})</button>` : '';
      return `<div class="tw-chef">${chefPortrait(c)}<div><b>${esc(c.name)}</b> <span class="lvl" title="Level ${c.lvl} of ${A.levels.length}">${'★'.repeat(c.lvl)}<i>${'★'.repeat(A.levels.length - c.lvl)}</i></span>
        <div class="small">${czIcon(c.cz)} ${esc(FS.cuisineById[c.cz].name)} dishes +${H.taste[c.lvl - 1].toFixed(1)}★ with guests · rating can go ${H.cap[c.lvl - 1].toFixed(1)} higher</div>
        <div class="row gap">${train}<button class="small danger" data-action="head-dismiss" data-arg="${r.id}" title="No toques back">👋 Let go</button></div></div></div>`;
    }
    const chefs = Game.chefs();
    if (!chefs.length) return `<p class="hint">No chefs at the 🎓 Academy yet.</p>`;
    return `<div class="tw-chefs">${chefs.map((x) => { const on = r.menu.filter((id) => FS.cuisineOf(id).id === x.cz).length;
      return `<div class="tw-chef">${chefPortrait(x)}<div><b>${esc(x.name)}</b> <span class="lvl">${'★'.repeat(x.lvl)}<i>${'★'.repeat(A.levels.length - x.lvl)}</i></span>
        <div class="small muted">${esc(FS.cuisineById[x.cz].name)} · ${on} of your menu's dishes</div>
        <button class="small primary" data-action="head-promote" data-arg="${x.id}|${r.id}" ${(S.toques || 0) >= H.promote ? '' : 'disabled'}>Make head chef (🎩${H.promote})</button></div></div>`; }).join('')}</div>`;
  }
  function freeLotPanel(l) {
    const cost = Game.rentCost(), S = Game.S, d = Game.district(l.district);
    return `<div class="tw-head"><span class="pack-icon">${FSI.img('ui_town')}</span><div><h3>${esc(l.name)} <span class="small muted">free lot</span></h3>
      <div class="small muted">${esc(d.name)}</div></div></div>
      ${Game.districtOpen(d.id) ? `<p><button class="primary" data-action="town-open" data-arg="${l.id}" ${S.money >= cost ? '' : 'disabled'}>Open a restaurant · 💰${money(cost)}</button> ${qm(`Then ${Game.TOWN.upkeep} coins upkeep per minute.`)}</p>`
        : `<div class="tw-legacy">${Game.districtNeed(d.id).map((x) => `<div class="${x.done ? 'done' : ''}"><span>${x.done ? '✅' : '🔒'}</span><span>${esc(x.text)}</span></div>`).join('')}</div>`}
      ${districtCard(d)}`;
  }
  function rivalPanel(l) {
    const rv = Game.rival(l.rival), st = Game.town().rivals[rv.id], d = Game.district(l.district);
    const promo = Game.S.time < st.promo;
    return `<div class="tw-head"><span class="pack-icon tw-rv" style="background:${rv.colors[0]}">${FSI.img('ui_restaurant')}</span><div><h3>${esc(rv.name)} <span class="small muted">rival</span></h3>
      <div class="small muted">${esc(l.name)}, ${esc(d.name)} · owner: ${esc(rv.owner)}</div>
      <div>${starBar(st.rating)} <b>${st.rating.toFixed(1)}</b>${promo ? ' <span class="small warnc">cutting prices today</span>' : ''}</div>
      <div class="small">“${esc(rv.blurb)}”</div></div></div>
      ${districtCard(d)}`;
  }
  // The three food critics: when they come, what each looks for this year, and how your restaurant did last time.
  function criticBox() {
    const S = Game.S, c = S.critic, C = Game.CRITIC;
    if (!c || c.v !== 2 || !c.visits) return '<p class="hint">No visits announced yet.</p>';
    const inTown = S.time >= c.year * Game.YEAR + 6 * Game.DAY, done = Game.criticDone();
    const tip = `Each district's food critic names its Restaurant of the Year every winter, on a day nobody knows.\nGold 🎩${C.toques[0]} + 💰${money(C.prize[0])} and 30% more guests for a year · silver 🎩${C.toques[1]} + 💰${money(C.prize[1])}\nScores are out of 5: gold needs ${C.min[0]}, silver ${C.min[1]}. A place nobody reaches stays empty.`;
    const rows = Game.DISTRICT_ORDER.map(Game.criticOf).map((cr) => {
      const v = c.visits[cr.district], d = Game.district(cr.district), th = Game.theme(v.theme), won = (c.gold || {})[cr.district] === c.year;
      const st = v.done ? (won ? '🥇' : '—') : `<b data-tip="${esc(th.desc)}">“${esc(th.name)}”</b>`;
      return `<div style="--dc:${d.color}"><span class="tw-cname" data-tip="${esc(`${cr.name}, ${cr.paper}`)}">${esc(d.name)}</span><span>${st}</span></div>`;
    }).join('');
    const when = done ? `Next visits: winter, year ${c.year + 2}` : inTown ? '🕵️ <b>In town now!</b>' : `Winter, year ${c.year + 1}`;
    return `<div class="tw-critic"><div>${when} ${qm(tip)}</div>${c.history.length ? `<button class="small" data-action="modal" data-arg="gazette">📰 Results</button>` : ''}</div>
      <div class="tw-critics">${rows}</div>`;
  }
  function guidePanel() {
    const L = Game.legacy(), done = !!Game.S.legacyWon;
    return `<h3>📰 Town Guide</h3>
      ${done || Game.stageOpen('E') ? `<h4>👑 The Legacy ${done ? '<span class="okc">complete!</span>' : qm('The last goal of the game.')}</h4>
      ${done ? '<button class="small" data-action="finale">👑 Watch the finale again</button>' : ''}
      <div class="tw-legacy">${L.map((x) => `<div class="${x.done ? 'done' : ''}"><span>${x.done ? '✅' : '⬜'}</span><span>${esc(x.text)}</span>${x.prog && !x.done ? `<span class="small muted">${x.prog[0]} / ${x.prog[1]}</span>` : ''}</div>`).join('')}</div>` : ''}
      ${Game.corpOffer() ? `<div class="tw-critic"><div>📨 <b>The Crestwell Group</b> offers to sell you all three of their restaurants.</div>
        <button class="primary" data-action="town-offer" ${Game.S.money >= Game.CORP.offer ? '' : 'disabled'}>Buy them out · 💰${money(Game.CORP.offer)}</button></div>` : ''}
      <h4>Food critics</h4>${criticBox()}
      <h4>Districts ${qm('Each district has its own guests, who only eat there. They want five cuisines, but nobody says which: watch the stars, and read the food critic. A menu with all five, and nothing else, earns the most stars. You run one restaurant per district, against a branch of ${Game.CORP.name}. The districts open one after another.')}</h4>
      ${Game.DISTRICT_ORDER.map((id) => districtCard(Game.district(id))).join('')}`;
  }
  function townPanelHtml() {
    const l = Game.lot(ui.townSel), tab = l && ui.townTab !== 'guide' ? 'lot' : 'guide';
    const r = l && Game.restaurantAt(l.id);
    const lotName = l ? (r ? r.name : l.rival ? Game.rival(l.rival).name : l.name) : '';
    const body = tab === 'guide' ? guidePanel() : r ? restaurantPanel(r) : l.rival ? rivalPanel(l) : freeLotPanel(l);
    return `<div class="tw-tabs">${l ? `<button class="tw-lottab ${tab === 'lot' ? 'on' : ''}" data-action="town-tab" data-arg="lot" data-tip="${esc(lotName)}">🍴 ${esc(lotName)}</button>`
      : '<span class="tw-lottab hintab">Click a TO LET sign</span>'}
      <button class="${tab === 'guide' ? 'on' : ''}" data-action="town-tab" data-arg="guide" data-tip="Town Guide">📰 Guide</button></div><div class="tw-body" data-scroll="twbody">${body}</div>`;
  }
  // Redraw an element's HTML, keeping the focused search box, its caret, and scroll positions.
  function renderKeep(el, html) {
    const ae = document.activeElement, focus = ae && el.contains(ae) && ae.dataset ? ae.dataset.search : null, sel = focus ? ae.selectionStart : 0;
    const scrolls = {};
    el.querySelectorAll('[data-scroll]').forEach((s) => (scrolls[s.dataset.scroll] = s.scrollTop));
    el.innerHTML = html;
    el.querySelectorAll('[data-scroll]').forEach((s) => { if (scrolls[s.dataset.scroll]) s.scrollTop = scrolls[s.dataset.scroll]; });
    if (focus) { const f = el.querySelector(`[data-search="${focus}"]`); if (f) { f.focus(); try { f.setSelectionRange(sel, sel); } catch (e) {} } }
  }
  function renderTownPanel() { if (ui.townMode) renderKeep($('#town-panel'), townPanelHtml()); }
  function townBanner() {
    const c = Game.S.critic;
    if (!c || c.v !== 2 || Game.criticDone()) return '';
    const inTown = Game.S.time >= c.year * Game.YEAR + 6 * Game.DAY;
    return `<div class="tw-banner ${inTown ? 'hot' : ''}" data-action="town-tab" data-arg="guide">${inTown ? '🕵️ The critics are in town!' : '📰 The critics visit this winter'}</div>`;
  }
  // Signature of what the map shows, so it is only redrawn when something visible changed.
  function townMapSig() {
    const t = Game.town();
    if (!t) return '';
    return [ui.townSel, Game.seasonIndex(), JSON.stringify(t.open || {}), JSON.stringify((Game.S.critic && Game.S.critic.boost) || ''),
      t.rests.map((r) => [r.spot, r.name, r.menu.length, Game.rating(r) === null ? '-' : Game.rating(r).toFixed(1), r.menu.some((id) => have(id) < 1) ? '!' : ''].join(':')).join(),
      Game.RIVALS.map((rv) => t.rivals[rv.id].sold ? 'x' : t.rivals[rv.id].rating.toFixed(1)).join()].join('|');
  }
  function drawTown(force) {
    const sig = townMapSig();
    if (!force && sig === TownMap.sig) return;
    TownMap.sig = sig;
    TownMap.render(ui.townSel);
    const sv = TownMap.svg;
    if (sv) { for (const c of [...sv.classList]) if (c.startsWith('s-')) sv.classList.remove(c); sv.classList.add('s-' + Game.season().id); }
  }
  ui.setTown = function (on) {
    if (on && !Game.restaurantsUnlocked()) return; // the town is a secret until it opens
    ui.townMode = !!on;
    Render.off = ui.townMode;
    SFX.setMusicScene(ui.townMode ? 'town' : 'farm');
    document.body.classList.toggle('town-mode', ui.townMode);
    $('#townview').hidden = !ui.townMode;
    $('#town-btn').classList.toggle('on', ui.townMode);
    if (ui.townMode) {
      if (ui.placing || ui.moving || ui.bp) cancelPlacing();
      if (!ui.townSel || !Game.lot(ui.townSel)) { const r0 = Game.restaurants()[0]; ui.townSel = r0 ? r0.spot : null; ui.townTab = r0 ? 'lot' : 'guide'; }
      if (!ui.townFitted) { ui.townFitted = true; TownMap.fit(); }
      drawTown(true);
      $('#town-over').innerHTML = townOverHtml();
      renderTownPanel();
    } else Render.resize();
    SFX.play('open');
  };
  function townOverHtml() {
    return `<button class="tw-back" data-action="town" title="Back to your farm (T)">🌾 Back to the farm</button><div id="town-banner">${townBanner()}</div>
      <div class="tw-legend">${qm('Drag to move, wheel to zoom. Click a restaurant or a TO LET sign.')}</div>
      <div class="tw-zoom"><button data-action="town-zoom" data-arg="1">+</button><button data-action="town-zoom" data-arg="-1">−</button></div>`;
  }
  // Locked town (before enough dishes are discovered): a teaser instead of the town.
  modals.town = () => {
    return Game.featureKnown('restaurants') ? { title: '🏙️ Town', html: `<p class="warn">🔒 The town's restaurant lots open once you have discovered ${Game.townDishes()} dishes (now ${Object.keys(Game.S.discovered).length}).</p>
      <p class="hint">Rent a restaurant, pick its menu and keep it supplied from your farm.</p>` }
      : { title: '🔒 Not yet', html: `<p class="hint">Keep cooking through the 🍽️ cuisines.</p>` };
  };
  // The critics' verdicts of the last year they visited.
  modals.gazette = () => {
    const c = Game.S.critic, hs = c && c.v === 2 ? c.history : [];
    if (!hs.length) return { title: '📰 Food critics', html: '<p class="hint">The critics have not visited yet.</p>' };
    const year = hs[hs.length - 1].year, medal = ['🥇', '🥈', '🥉'];
    const blocks = hs.filter((h) => h.year === year).map((h) => {
      const cr = Game.criticOf(h.district), d = Game.district(h.district), th = Game.theme(h.theme), gold = h.list.find((x) => x.place === 1);
      const rows = h.list.map((x) => `<div class="ry-row ${x.rival ? '' : 'mine'}"><span class="ry-place">${medal[x.place - 1] || '·'}</span>
        <div><b>${esc(x.name)}</b>${x.rival ? ' <span class="small muted">rival</span>' : ' <span class="small okc">yours</span>'}
        ${x.rival ? '' : `<div class="small ry-quote">“${esc(Game.criticLine(x))}”</div>`}</div><span class="small muted">${x.score.toFixed(2)}</span></div>`).join('');
      return `<div class="ry-block"><div class="ry-head" style="color:${d.color}">${gold && !gold.rival ? '🏆' : '🍽️'} ${esc(d.name)}: <b>${gold ? esc(gold.name) : 'nobody'}</b>${gold ? '' : ' was good enough for gold'}</div>
        <p class="small muted">${esc(cr.name)}, ${esc(cr.paper)} · <b>“${esc(th.name)}”</b> <span data-tip="${esc(th.desc)}" class="qm">?</span></p>${rows}</div>`;
    }).join('');
    return { title: `📰 Restaurants of the Year ${year + 1}`, cls: 'roty',
      html: `${blocks}<p class="small muted">${qm(`Places need a score of at least ${Game.CRITIC.min.slice(0, 2).join(' (🥇) and ')} (🥈); a place nobody reaches stays empty.`)}</p>` };
  };
  // Every frame in town: walkers; twice a second: redraw what changed, the critic banner and the light of day.
  function townFrame(dt, now) {
    const S = Game.S, { mul: c, wash: w } = Render.sky(), dark = 1 - (c[0] + c[1] + c[2]) / 765;
    TownMap.tick(S.speed ? dt * Math.min(3, S.speed) : 0, dark > 0.35);
    // The same weather as on the farm (rain, snow, storm and lightning, falling leaves), under the night tint.
    const wc = $('#town-weather'), W = wc.clientWidth, H = wc.clientHeight, dpr = window.devicePixelRatio || 1;
    if (wc.width !== Math.round(W * dpr) || wc.height !== Math.round(H * dpr)) { wc.width = Math.round(W * dpr); wc.height = Math.round(H * dpr); }
    const wg = wc.getContext('2d');
    wg.setTransform(dpr, 0, 0, dpr, 0, 0); wg.clearRect(0, 0, W, H);
    if (W && H) Render.weather(wg, dt, W, H);
    if (now - (ui.townT || 0) < 500) return;
    ui.townT = now;
    drawTown();
    if (TownMap.svg) TownMap.svg.classList.toggle('night', dark > 0.3);
    const n = $('#town-night');
    n.style.background = `rgb(${c.map((v) => Math.round(v + (255 - v) * 0.3)).join(',')})`; // a little lighter than the farm, so lit windows still glow
    n.firstChild.style.background = `rgba(${w.slice(0, 3).map(Math.round).join(',')},${w[3].toFixed(3)})`;
    // After dark, lit windows, street lamps and restaurants glow warmly over the tint, as working buildings do on the farm.
    const gl = $('#town-glow'), ga = Math.min(1, Math.max(0, (dark - 0.22) / 0.18));
    gl.style.display = ga > 0 ? 'block' : 'none';
    gl.style.opacity = ga.toFixed(2);
    const b = $('#town-banner'), bh = townBanner();
    if (b && b.innerHTML !== bh) b.innerHTML = bh;
    const r = Game.restaurantAt(ui.townSel), ae = document.activeElement;
    const sig = [townMapSig(), ui.townTab, r ? [r.served, r.missed, r.reviews.length, r.menu.map(have).join()].join(':') : '', Math.floor(S.money / 500), Game.criticDone(), S.critic && S.critic.rumour, S.critic && S.critic.history && S.critic.history.length].join('|');
    if (sig !== ui.townSig && !ui.mouseDown && !(ae && ae.tagName === 'SELECT')) { ui.townSig = sig; renderTownPanel(); }
  }
  // ----- Cuisines: five stages of three cuisines, and the guided first steps -----
  modals.cuisines = () => {
    const S = Game.S, cur = Game.currentStage(), ready = Game.cuisinesReady();
    if (ready) S.czSeen = cur.id;
    const steps = FS.STEPS.filter((st) => st.goal).map((st) => {
      const g = Game.goals.find((x) => x.id === st.goal), done = S.goalsDone[st.goal];
      return `<div class="stage ${done ? 'done' : ''}"><span>${done ? '✅' : '🔒'}</span><div><b>${esc(st.name)}</b><div class="small muted">${esc(st.desc)}</div>
        ${done ? '' : `<div class="small">🎯 Unlocks when you complete: ${esc(g.text)}${goalProg(g)}</div>`}</div></div>`;
    }).join('');
    // Reached stages show in full, the next one as a teaser with silhouettes, later ones only as a count.
    const later = FS.STAGES.filter((st) => !Game.stageKnown(st.id)).length;
    const stages = FS.STAGES.filter((st) => Game.stageKnown(st.id)).map((st) => {
      const open = Game.stageOpen(st.id), done = Game.stageDone(st.id), prev = FS.STAGES[FS.STAGES.indexOf(st) - 1];
      const what = st.rating && !Game.restaurantsUnlocked() ? 'a new challenge' : `${st.rating ? `serve ${st.target} dishes of each cuisine at 🏙️ restaurants rated ${'★'.repeat(st.rating)} or better` : `cook ${st.target} dishes in each cuisine`} · +${st.toques} 🎩 per cuisine${st.unlock ? ` · then unlocks ${Game.featureText(st.unlock)}` : ''}`;
      if (!open) {
        const sils = st.cuisines.map((c) => `<div class="pack locked cz-tease"><div class="pack-head"><span class="pack-icon sil">${FSI.img(c.item)}</span><div><b>❔ A new cuisine</b></div></div>
          <p class="small">${esc(c.hint)}</p><div class="small muted">🔒 Opens when ${esc(prev.name)} is done</div></div>`).join('');
        return `<section class="cz-stage locked"><h4>🔒 Next: ${esc(st.name)} <span class="muted small">${what}</span></h4>
          <p class="small cz-teaser">✨ ${esc(st.teaser)}</p><div class="packs">${sils}</div></section>`;
      }
      const cards = st.cuisines.map((c) => {
        const isOpen = !!S.cuisines[c.id], n = Game.cuisineCooked(c), cost = Game.cuisineCost(c);
        const rated = st.rating ? Game.cuisineRated(c, st.rating) : n;
        const known = c.dishIds.filter((id) => S.discovered[id]).length;
        let foot;
        if (isOpen) {
          foot = `<div class="gprog cz-prog" title="${st.rating ? `Dishes served at restaurants rated ${'★'.repeat(st.rating)} or better` : 'Dishes cooked towards the stage target'}"><span class="gbar"><i style="width:${Math.min(100, Math.round((rated / st.target) * 100))}%"></i></span>${Math.min(rated, st.target)} / ${st.target} ${st.rating ? `served at ${'★'.repeat(st.rating)}` : 'cooked'}${(S.cuisineDone || {})[c.id] ? ' ✅' : ''}</div>
            <div class="small muted">${n} of ${c.dishIds.length} dishes cooked · ${known} discovered${(S.cuisineGold || {})[c.id] ? ' · 🏆 every dish cooked' : ''}</div>
            <button class="small" data-action="cz-dishes" data-arg="${esc(c.name)}">📖 Show its dishes</button>`;
        } else if (open) {
          const pv = Game.cuisinePreview(c.id);
          foot = `<div class="small">${c.dishIds.length} dishes · ${pv.recipes} new production steps${pv.buildings.length ? `<div class="pack-b">${pv.buildings.length} new building${pv.buildings.length > 1 ? 's' : ''}: ${pv.buildings.map((b) => `<span title="${esc(FS.buildings[b].name)}">${FSI.img('b_' + b)}</span>`).join('')}</div>` : ''}</div>
            <button class="primary" data-action="open-cuisine" data-arg="${c.id}" ${ready && S.money >= cost ? '' : 'disabled'}>Open for 💰${money(cost)}</button>`;
        }
        return `<div class="pack ${isOpen ? 'owned' : ''} ${open ? '' : 'locked'}"><div class="pack-head"><span class="pack-icon">${FSI.img('cz_' + c.id)}</span><div><b>${esc(c.name)}</b></div></div>
          <p class="small">${esc(c.desc)}</p>${foot}</div>`;
      }).join('');
      return `<section class="cz-stage ${done ? 'done' : ''}"><h4>${done ? '✅' : '👉'} ${esc(st.name)} <span class="muted small">${what}</span></h4>
        <div class="packs">${cards}</div></section>`;
    }).join('') + (later ? `<p class="small muted cz-more">🗺️ ${later === 1 ? 'One more stage lies' : `${later} more stages lie`} beyond, still a secret. Finish the next one to see where the road leads.</p>` : '');
    return {
      title: `🍽️ Cuisines ${qm(`Every dish belongs to one cuisine. Opening a cuisine unlocks every building and production step its dishes need and puts its dishes in your 📖 Cookbook. Cook the stage's target in each of its three cuisines to open the next stage. Each cuisine target earns 🎩 toques (they pay for 💡 hints${Game.featureKnown('academy') ? ', 🎓 Academy chefs' : ''}${Game.featureKnown('mastery') ? ', ⭐ dish mastery' : ''}${Game.featureKnown('restaurants') ? ' and 👨‍🍳 head chefs' : ''}), and cooking every dish of a cuisine earns extra toques.`)}`, cls: 'wide',
      html: `${ready ? ''
        : '<p class="warn">🔒 Farmhouse Kitchen is open from the start. Cook your first dish in the 🧪 Test Kitchen to open more cuisines.</p>'}
        ${stages}
        <h4>Guided first steps (${esc(FS.STAGES[0].name)})</h4><div class="stages">${steps}</div>`,
    };
  };

  // ----- Orders -----
  // What each stage's orders add. Shown in the "About orders" tab, with a peek at what the next stage brings.
  const ORDER_INTRO = [
    'Customers order goods you have produced before. ⭐ Special requests ask for a dish you haven\'t discovered yet and pay a 🎩 toque. 📦 Bulk orders give you more time and a better rate.',
    '❤️ Regulars order food from their own cuisine; every delivery makes them fonder, which means bigger orders, better pay and, from level 3, tips in 🎩. 🔍 Clue orders describe a dish without naming it: any dish that fits will do, and they pay a toque.',
    '⏳ Contracts want a big batch over two days and pay for every delivery, with a bonus and a 🎩 on completion. 🎉 Events want several of your dishes from two cuisines at once. Clue orders now pay 2 🎩.',
    '🚛 Supply contracts want a cuisine\'s goods every day for three days, paying each day and a bonus for all three. 🥂 Party menus span three cuisines, clue orders pay 3 🎩, and seasonal customers come in summer and winter.',
  ];
  // kind: [css class, short label, hover explanation]
  const ORDER_TAGS = {
    plain: ['', '', ''], bulk: ['', '📦 Bulk', 'A big order with more time and a better rate.'],
    special: ['special', '⭐ Special', 'Wants a dish you haven\'t discovered yet. Pays a 🎩 toque.'],
    regular: ['regular', '❤️', 'A regular customer. Every delivery makes them fonder: bigger orders, better pay and, from level 3, 🎩 tips.'],
    clue: ['clue', '🔍 Clue', 'Describes a dish without naming it. Any dish that fits will do.'],
    contract: ['contract', '⏳ Contract', 'A big batch over two days. Every delivery is paid at once, the rest and a 🎩 when it is complete.'],
    event: ['event', '🎉 Event', 'Wants all of these dishes at once.'], menu: ['event', '🥂 Party menu', 'Wants all of these dishes at once.'],
    supply: ['contract', '🚛 Supply', 'Wants these goods every day for three days. Each day met pays; all three pay a bonus and 🎩.'],
    seasonal: ['', '', 'A seasonal customer, only in summer and winter.'],
  };
  const hearts = (lv) => '<span class="hearts">' + '♥'.repeat(lv) + '<i>' + '♥'.repeat(5 - lv) + '</i></span>';
  const short = (s) => (s < 60 ? `${Math.round(s)}s` : s < 3600 ? `${Math.floor(s / 60)}m` : `${Math.floor(s / 3600)}h ${Math.round((s % 3600) / 60)}m`);
  // The goods line of an order card: chips coloured by whether your stock covers them, plus a short note line.
  // A goods tile on an order card: big icon, name, how many are wanted and how many you have.
  function wantTile(id, q, opts = {}) {
    const i = it(id), h = have(id), hide = i.dish && !Game.S.discovered[id];
    const cls = opts.cls || (h >= q ? 'ok' : 'short');
    const sub = opts.sub !== undefined ? opts.sub : `stock ${num(h)}`;
    return `<span class="otile ${cls}" ${hide ? '' : `data-item="${id}"`} ${opts.tip ? `data-tip="${esc(opts.tip)}"` : ''}><span class="ot-ico">${hide ? '❓' : FSI.img(id)}</span>
      <span class="ot-name">${esc(hide && !opts.name ? '???' : i.name)}</span><span class="ot-have">${sub}</span><b class="ot-qty">${opts.qty || '×' + num(q)}</b></span>`;
  }
  function orderWant(o) {
    const S = Game.S;
    switch (o.kind) {
      case 'special': {
        if (S.discovered[o.item]) return { want: wantTile(o.item, o.qty) };
        const d = it(o.item), n = Object.keys(FS.dishRecipe[o.item].inputs).length;
        return { want: `${wantTile(o.item, o.qty, { cls: 'unknown', name: true, sub: 'undiscovered', tip: `An undiscovered ${d.cuisine} dish with ${n} ingredients. Discover it in the 🧪 Test Kitchen, then cook it.` })}
          <button class="small" data-action="tk-try" data-arg="${o.item}">🧪 Try it</button>` };
      }
      case 'clue': {
        const fits = Game.clueFits(o), known = o.matches.filter((id) => S.discovered[id]).length;
        return { want: `<span class="clue-text">“${esc(o.clue)}”${o.qty > 1 ? ` <b>×${o.qty}</b>` : ''}</span>`,
          note: fits.length ? fits.map((id) => `<button class="small" data-action="fulfil" data-arg="${o.id}:${id}">${FSI.img(id)} ${esc(it(id).name)}</button>`).join(' ')
            : `<span data-tip="${o.matches.length} dish${o.matches.length > 1 ? 'es' : ''} in your open cuisines fit${o.matches.length > 1 ? '' : 's'}. Experiment in the 🧪 Test Kitchen.">${o.matches.length} fit · ${known ? `${known} known, none in stock` : 'none discovered yet'}</span>` };
      }
      case 'contract': {
        const pct = Math.round((o.done / o.qty) * 100);
        return { want: wantTile(o.item, 1, { qty: `${o.done} / ${o.qty}` }),
          note: `<span class="opbar" title="${o.done} of ${o.qty} delivered"><i style="width:${pct}%"></i></span> 💰${Math.round(o.unit * 10) / 10} each` };
      }
      case 'event': case 'menu':
        return { want: o.lines.map((l) => wantTile(l.item, l.qty)).join(''), tip: `From ${o.cuisines.map((c) => FS.cuisineById[c].name).join(', ')}.` };
      case 'supply':
        return { want: o.lines.map((l) => (o.paidDay || Game.supplyLeft(o, l) <= 0 ? wantTile(l.item, l.qty, { cls: 'ok done', sub: 'today ✓' }) : wantTile(l.item, Game.supplyLeft(o, l)))).join(''),
          note: `Day ${o.day + 1} of ${o.days}${o.paidDay ? ' · supplied ✓' : ''} · ${o.met} met`,
          tip: `All ${o.days} days met pays 💰${money(o.reward)} + 🎩${o.toques} extra.` };
    }
    return { want: wantTile(o.item, o.qty) };
  }
  function orderCard(o) {
    const S = Game.S, t = ORDER_TAGS[o.kind] || ['', '', ''], w = orderWant(o), ready = Game.orderReady(o);
    let tag = t[1];
    if (o.kind === 'seasonal') tag = o.season === 'winter' ? '❄️ Seasonal' : '☀️ Seasonal';
    if (o.reg) tag = (o.kind === 'regular' ? '' : tag + ' ') + hearts(Game.regularLevel(o.reg));
    const left = o.kind === 'supply' ? o.dayEnd - S.time : o.expires - S.time;
    const tip = [t[2], w.tip].filter(Boolean).join(' ');
    let btn = '';
    if (o.kind !== 'clue') {
      const part = o.kind === 'contract' && ready && have(o.item) < o.qty - o.done ? ` ${have(o.item)}` : '';
      btn = `<button class="primary" data-action="fulfil" data-arg="${o.id}" ${ready ? '' : 'disabled'}>Deliver${part}</button>`;
    }
    return `<div class="order ${t[0]}${ready ? ' ready' : ''}">
      <div class="o-main">
        <div class="o-head">${tag ? `<span class="otag ${t[0]}"${tip ? ` data-tip="${esc(tip)}"` : ''}>${tag}</span>` : ''}<b>${esc(o.who)}</b>
          <span class="o-time${left < 120 ? ' soon' : ''}" title="${o.kind === 'supply' ? 'Today ends in' : 'Expires in'} ${dur(left)}">⏱ ${short(left)}</span></div>
        <div class="o-want">${w.want}</div>
        ${w.note ? `<div class="o-note small muted">${w.note}</div>` : ''}
      </div>
      <div class="o-pay"><span class="reward">💰${money(o.kind === 'supply' ? o.dayPay : o.reward)}${o.kind === 'supply' ? '<small>/day</small>' : ''}</span>${o.toques && o.kind !== 'supply' ? `<span class="small">+ 🎩${o.toques}</span>` : ''}</div>
      <div class="o-act">${btn}</div>
    </div>`;
  }
  // The Dispatcher tab: locked (goal progress), hire, or his settings and takings.
  function dispatcherTab() {
    const S = Game.S, C = Game.DISPATCHER, D = S.dispatcher, tier = Game.orderTier(), cut = Math.round(C.cut * 100);
    const what = `He delivers every order your stock can fill, but never touches the last few of any good, so your kitchens and restaurants keep their supplies. He keeps ${cut}% of the coins and every other 🎩 toque, so delivering big orders yourself still pays best.`;
    if (!Game.dispatcherUnlocked()) {
      const g = Game.goals.find((x) => x.id === 'gold3'), [n] = g.progress();
      return `<p class="warn">🔒 The Dispatcher can be hired once you have cooked every dish in 3 cuisines (${n} / 3 so far). Any cuisines count; the 🏆 in 🍽️ Cuisines shows which are complete.</p><p class="small muted">${what}</p>`;
    }
    if (!D) return `<p class="hint">${what}</p>
      <button class="primary" data-action="hire-dispatcher" ${S.money >= C.cost && (S.toques || 0) >= C.toques ? '' : 'disabled'}>Hire the Dispatcher for 💰${money(C.cost)} + 🎩${C.toques}</button>
      ${(S.toques || 0) < C.toques ? `<p class="small muted">You have 🎩${S.toques || 0} toques.</p>` : ''}`;
    const keeps = C.keeps.map((k) => `<button class="${D.keep === k ? 'active' : ''}" data-action="disp-keep" data-arg="${k}">${k}</button>`).join('');
    const groups = Game.DISPATCH_GROUPS.filter((g) => g.tier <= tier).map((g) => `<label class="disp-kind"><input type="checkbox" data-action="disp-kind" data-arg="${g.id}" ${D.skip[g.id] ? '' : 'checked'}> ${g.name}</label>`).join('');
    return `<div class="disp-head"><b>📦 Dispatcher</b><button class="switch ${D.on ? 'on' : ''}" data-action="disp-on" role="switch" aria-checked="${D.on}"><span class="knob"></span><span class="sw-txt">${D.on ? 'On duty' : 'Off'}</span></button></div>
      <div class="stockctl"><div class="small" data-tip="He leaves at least this many of every good in the warehouse. Raise it if he empties stock your kitchens need."><b>Keep at least</b> of each good</div><div class="seg">${keeps}</div></div>
      <div class="small"><b>Orders he delivers</b></div><div class="disp-kinds">${groups}</div>
      <div class="stats"><div><b>${D.done}</b><span>deliveries</span></div><div><b>💰${money(D.earned)}</b><span>paid to you</span></div><div><b>💰${money(D.fee)}</b><span>his ${cut}%</span></div><div><b>🎩${D.kept}</b><span>toques he kept</span></div></div>
      <p class="small muted">${what}</p>`;
  }
  ui.ordersTab = 'orders';
  ui.oSort = 'time';
  try { const v = localStorage.getItem('rootdishes-orders-sort'); if (['ready', 'time', 'reward'].includes(v)) ui.oSort = v; } catch (e) { /* keep default */ }
  modals.orders = () => {
    const S = Game.S, tier = Game.orderTier();
    const regs = Game.regularsActive();
    const tab = ui.ordersTab === 'regulars' && !tier ? 'orders' : ui.ordersTab;
    let body;
    if (tab === 'regulars') {
      body = regs.length ? `<div class="regulars">${regs.map((r) => {
        const lv = Game.regularLevel(r.id), xp = Game.regularXp(r.id), nextAt = Game.REG_LEVELS[lv], tip = Game.regularTipEvery(lv);
        return `<div class="regcard"><span class="pack-icon">${FSI.img('cz_' + r.cuisine)}</span><div><b>${esc(r.name)}</b><div class="small muted">${esc(FS.cuisineById[r.cuisine].name)}</div>${hearts(lv)}
          <span class="small">${nextAt !== undefined ? `${nextAt - xp} more to level ${lv + 1}` : 'best friends'}</span>
          <div class="small muted">${tip ? `🎩 tip every ${tip === 2 ? '2nd' : '3rd'} delivery` : '🎩 tips from level 3'}</div></div></div>`;
      }).join('')}</div>` : '';
      body += `<p class="small muted">${regs.length ? 'Every delivery makes a regular fonder: bigger orders and better pay. ' : ''}Every cuisine you open has a regular customer. They start ordering once you have cooked one of that cuisine's dishes.</p>`;
    } else if (tab === 'dispatch') {
      body = dispatcherTab();
    } else if (tab === 'about') {
      body = ORDER_INTRO.slice(0, tier + 1).map((t) => `<p>${t}</p>`).join('')
        + (tier < 3 ? `<p class="small muted">Next stage: ${ORDER_INTRO[tier + 1].split('. ')[0]}.</p>` : '')
        + `<p class="small muted">Orders delivered so far: ${S.stats.ordersDone}</p>`;
    } else {
      // Sort: 'time' soonest to expire, 'ready' what you can deliver now first, 'reward' toques first, then money.
      const end = (o) => (o.kind === 'supply' ? o.dayEnd : o.expires);
      const by = ui.oSort;
      // Rank by what the card shows: a supply contract shows its daily pay and no toques.
      const toq = (o) => (o.kind === 'supply' ? 0 : o.toques || 0), pay = (o) => (o.kind === 'supply' ? o.dayPay : o.reward);
      const list = S.orders.slice().sort((a, b) => (by === 'ready' ? Game.orderReady(b) - Game.orderReady(a) : 0)
        || (by === 'reward' ? toq(b) - toq(a) || pay(b) - pay(a) : 0) || end(a) - end(b));
      const sb = (id, label, tip) => `<button class="${by === id ? 'active' : ''}" data-action="osort" data-arg="${id}" data-tip="${tip}">${label}</button>`;
      body = `<div class="sortbar small"><span class="muted">Sort by</span><div class="seg">${sb('ready', 'Ready', 'Orders you can deliver now first')}${sb('time', '⏱ Time left', 'Soonest to expire first')}${sb('reward', 'Reward', 'Most 🎩 toques first, then most money')}</div></div><div class="orders">${list.map(orderCard).join('')}</div>`;
      if (!list.length) body = '<p class="hint">No orders right now. New customers come once you have produced some goods.</p>';
      const D = S.dispatcher;
      if (D) body = `<p class="small muted disp-line">📦 ${D.on ? `The Dispatcher delivers ${Game.DISPATCH_GROUPS.some((g) => D.skip[g.id] && g.tier <= tier) ? 'the types you chose' : 'orders'} for you and keeps ${D.keep} of each good.` : 'The Dispatcher is off duty.'} <a href="#" data-action="otab" data-arg="dispatch">Settings</a></p>` + body;
    }
    const tb = (id, label) => `<button class="${tab === id ? 'active' : ''}" data-action="otab" data-arg="${id}">${label}</button>`;
    return {
      title: '📋 Customer Orders', speed: true,
      html: `<div class="tabs otabs">${tb('orders', `Orders${S.orders.length ? ` (${S.orders.length})` : ''}`)}${tier ? tb('regulars', `❤️ Regulars${regs.length ? ` (${regs.length})` : ''}`) : ''}${Game.featureKnown('dispatcher') ? tb('dispatch', `📦 Dispatcher${Game.dispatcherUnlocked() ? (S.dispatcher && S.dispatcher.on ? ' ✓' : '') : ' 🔒'}`) : ''}${tb('about', 'ℹ️ About orders')}</div>${body}`,
    };
  };

  // ----- Goals -----
  // ----- Trophy cabinet: a glass cupboard with a place for every trophy. Places not won yet show only a dashed outline
  // of the trophy's shape (no name); a won trophy shines in gold or silver and opens its card again when clicked. -----
  function trophyList() {
    const S = Game.S, done = (id) => !!S.goalsDone[id];
    const DISH = [['dish25', '25'], ['dish50', '50'], ['dish100', '100'], ['dish200', '200'], ['dishall', 'All']];
    return [
      { name: 'Dishes cooked', items: DISH.map(([id, n], v) => ({ shape: 'cup', v, won: done(id), key: 'goal:' + id, plaque: n, tip: MILESTONE[id].title })) },
      { name: 'Stages', items: FS.STAGES.map((st, k) => ({ shape: 'shield', v: k, won: Game.stageDone(st.id), plaque: '★'.repeat(k + 1),
        key: `czdone:${st.cuisines[st.cuisines.length - 1].id}:stage`, tip: st.name })) },
      { name: 'Specialities', items: [
        { shape: 'bar', won: done('choc'), key: 'goal:choc', tip: it('dark_chocolate').name },
        { shape: 'scroll', won: done('complex'), key: 'goal:complex', tip: 'The long road' },
        { shape: 'crown', won: !!S.legacyWon, key: 'finale', tip: 'The Legacy' }] },
      { name: 'Cuisines in gold', small: true, items: FS.CUISINES.map((c) => ({ shape: 'plate', won: !!(S.cuisineGold || {})[c.id], key: 'czgold:' + c.id, icon: 'cz_' + c.id, tip: c.name })) },
    ];
  }
  // Trophy shapes, drawn in a 64 x 80 box standing on its bottom edge. Won: filled (gold, silver for stages); else a dashed outline.
  function trophySVG(t) {
    const W = t.won, fill = (f) => (W ? f : 'none');
    const line = W ? 'stroke="#7a4a10" stroke-width="1.6"' : 'stroke="rgba(255,240,215,0.55)" stroke-width="1.8" stroke-dasharray="4 3"';
    const gold = fill('url(#tc-gold)'), silver = fill('url(#tc-silver)');
    let body = '';
    if (t.shape === 'cup') {
      // Five cups that grow with the milestone: handles from 50, a taller bowl from 100, a lid from 200, a star on the last.
      const v = t.v, top = 22 - v * 4;
      const handles = `M17 ${top + 4} C5 ${top + 4} 6 ${top + 22} 20 ${top + 24} M47 ${top + 4} C59 ${top + 4} 58 ${top + 22} 44 ${top + 24}`;
      if (v >= 1) body += W ? `<path d="${handles}" fill="none" stroke="#7a4a10" stroke-width="5.5"/><path d="${handles}" fill="none" stroke="#f2c14e" stroke-width="3"/>` : `<path d="${handles}" fill="none" ${line}/>`;
      body += `<path d="M16 ${top} H48 C48 ${top + 20} 42 50 32 52 C22 50 16 ${top + 20} 16 ${top} Z" fill="${gold}" ${line}/>`;
      if (v >= 3) body += `<path d="M18 ${top} C18 ${top - 9} 46 ${top - 9} 46 ${top} Z" fill="${gold}" ${line}/><circle cx="32" cy="${top - 9}" r="3" fill="${gold}" ${line}/>`;
      if (v >= 4) body += `<path d="M32 ${top + 6} l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8Z" fill="${fill('#fff3b0')}" ${line}/>`;
      body += `<rect x="29" y="52" width="6" height="8" fill="${gold}" ${line}/><path d="M20 60 H44 L46 66 H18 Z" fill="${gold}" ${line}/>`;
      // Bigger milestones, bigger cups (scaled from the foot).
      const k = [0.74, 0.82, 0.9, 0.96, 1][v];
      body = `<g transform="translate(32 66) scale(${k}) translate(-32 -66)">${body}</g>`;
    } else if (t.shape === 'shield') {
      body = `<path d="M32 8 L54 16 V38 C54 54 44 64 32 72 C20 64 10 54 10 38 V16 Z" fill="${silver}" ${line}/>
        <path d="M32 15 L48 21 V38 C48 50 41 58 32 64 C23 58 16 50 16 38 V21 Z" fill="${fill('rgba(255,255,255,0.25)')}" ${W ? 'stroke="rgba(90,100,120,0.5)"' : 'stroke="none"'}/>`;
    } else if (t.shape === 'plate') {
      body = `<rect x="29" y="58" width="6" height="10" fill="${gold}" ${line}/><path d="M20 68 H44 L46 74 H18 Z" fill="${gold}" ${line}/>
        <circle cx="32" cy="34" r="24" fill="${gold}" ${line}/><circle cx="32" cy="34" r="17" fill="${fill('#fff6d8')}" ${W ? 'stroke="#c99a2a"' : 'stroke="none"'}/>`;
    } else if (t.shape === 'bar') {
      body = `<rect x="18" y="8" width="28" height="50" rx="3" fill="${fill('#6b3a1e')}" ${line}/>
        ${W ? '<path d="M18 30 H46 M18 44 H46 M32 30 V58" stroke="#4a2410" stroke-width="1.4"/><path d="M18 8 H46 V26 L40 30 L32 25 L24 30 L18 27 Z" fill="url(#tc-gold)" stroke="#7a4a10" stroke-width="1.2"/>' : ''}
        <path d="M12 62 H52 V70 H12 Z" fill="${gold}" ${line}/>`;
    } else if (t.shape === 'scroll') {
      body = `<rect x="16" y="14" width="32" height="44" fill="${fill('#f3e2b8')}" ${line}/>
        <rect x="11" y="8" width="42" height="8" rx="4" fill="${fill('#c99a5a')}" ${line}/><rect x="11" y="56" width="42" height="8" rx="4" fill="${fill('#c99a5a')}" ${line}/>
        ${W ? '<path d="M22 24 H42 M22 31 H42 M22 38 H38 M22 45 H40" stroke="#a07a4a" stroke-width="1.6"/><circle cx="40" cy="52" r="4" fill="#b0302a"/>' : ''}
        <path d="M14 66 H50 V72 H14 Z" fill="${gold}" ${line}/>`;
    } else if (t.shape === 'crown') {
      body = `<path d="M8 54 L11 18 L23 34 L32 10 L41 34 L53 18 L56 54 Z" fill="${gold}" ${line}/><rect x="8" y="54" width="48" height="9" rx="2" fill="${gold}" ${line}/>
        ${W ? '<circle cx="32" cy="44" r="4" fill="#c0283a"/><circle cx="19" cy="46" r="3" fill="#2a7ac0"/><circle cx="45" cy="46" r="3" fill="#2a9a5a"/>' : ''}
        <path d="M14 66 H50 V72 H14 Z" fill="${gold}" ${line}/>`;
    }
    return `<svg viewBox="0 0 64 80" class="tc-svg" aria-hidden="true">${body}</svg>`;
  }
  modals.trophies = () => {
    const shelves = trophyList(), all = shelves.flatMap((sh) => sh.items), won = all.filter((t) => t.won).length;
    const defs = `<svg width="0" height="0" style="position:absolute"><defs>
      <linearGradient id="tc-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset="0.45" stop-color="#f2c14e"/><stop offset="1" stop-color="#b9781c"/></linearGradient>
      <linearGradient id="tc-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#c8d0dc"/><stop offset="1" stop-color="#7d8798"/></linearGradient></defs></svg>`;
    const slot = (t) => {
      const inner = trophySVG(t) + (t.won && t.icon ? `<span class="tc-icon">${FSI.img(t.icon)}</span>` : '') + (t.plaque ? `<span class="tc-plaque">${t.won ? esc(t.plaque) : ''}</span>` : '');
      return t.won ? `<button class="tc-slot won ${t.shape}" data-action="${t.key === 'finale' ? 'finale' : 'replay'}" data-arg="${esc(t.key)}" data-tip="${esc(t.tip)}">${inner}</button>`
        : `<span class="tc-slot ${t.shape}" data-tip="Not won yet">${inner}</span>`;
    };
    return { title: `🏆 Trophy cabinet <span class="muted">${won} / ${all.length}</span>`, cls: 'cabinet-card',
      html: `${defs}<div class="cabinet">${shelves.map((sh) => `<div class="tc-shelf${sh.small ? ' small' : ''}"><div class="tc-row">${sh.items.map(slot).join('')}</div><div class="tc-ledge">${esc(sh.name)}</div></div>`).join('')}</div>` };
  };
  modals.goals = () => {
    const S = Game.S;
    const next = Game.goals.find((g) => !S.goalsDone[g.id] && Game.goalVisible(g));
    const hidden = Game.goals.filter((g) => !Game.goalVisible(g)).length;
    return {
      title: '🎯 Goals',
      html: `<button class="tc-open" data-action="modal" data-arg="trophies">🏆 Trophy cabinet <span class="muted">${trophyList().flatMap((sh) => sh.items).filter((t) => t.won).length} won</span></button><div class="goals">${Game.goals.filter(Game.goalVisible).map((g) => `<div class="goal ${S.goalsDone[g.id] ? 'done' : g === next ? 'next' : ''}">
        <span>${S.goalsDone[g.id] ? '✅' : g === next ? '👉' : '⬜'}</span><span>${esc(g.text)}${goalProg(g)}${stepOf(g.id) ? ` <span class="unlocktag" data-tip="${S.goalsDone[g.id] ? 'Unlocked' : 'Unlocks'} ${esc(stepOf(g.id).name)}">${S.goalsDone[g.id] ? '✅' : '🔓'} ${esc(stepOf(g.id).name)}</span>` : ''}</span><span class="reward">+${money(g.reward)}${g.toques ? ` · 🎩${g.toques}` : ''}</span></div>`).join('')}</div>
        ${hidden ? '<p class="small muted">More goals appear as your farm grows.</p>' : ''}
        <h4>Your farm in numbers</h4><div class="small">Earned 💰${money(S.stats.earned)} · spent 💰${money(S.stats.spent)} · ${S.buildings.length} building${S.buildings.length === 1 ? '' : 's'} · ${Object.keys(S.seen).length} different goods produced · ${S.stats.experiments} experiment${S.stats.experiments === 1 ? '' : 's'}</div>`,
    };
  };

  // ----- Buildings list: set stock targets and auto-sell for many buildings at once -----
  const BGROUPS = ['Farming', 'Animals', 'Resources', 'Processing', 'Cooking'];
  const listable = () => Game.S.buildings.filter((b) => b.type !== 'farmhouse' && b.type !== 'academy');
  // "First in the chain": buildings whose current product needs no ingredients.
  const isRawProducer = (b) => { const r = FS.recipeById[b.recipe]; return !!r && !Object.keys(r.inputs).length; };
  modals.buildings = () => {
    const all = listable();
    const sel = ui.bsel = new Set([...(ui.bsel || [])].filter((id) => all.some((b) => b.id === id)));
    const picked = all.filter((b) => sel.has(b.id));
    const types = [...new Set(all.map((b) => b.type))].sort((a, b) => BGROUPS.indexOf(FS.buildings[a].group) - BGROUPS.indexOf(FS.buildings[b].group) || FS.buildings[a].name.localeCompare(FS.buildings[b].name));
    const pick = (scope, arg, label, list) => list.length ? `<button class="small ${list.every((b) => sel.has(b.id)) ? 'active' : ''}" data-action="bsel" data-arg="${scope}:${arg}">${label} <span class="muted">${list.length}</span></button>` : '';
    const groups = BGROUPS.filter((g) => all.some((b) => FS.buildings[b.type].group === g));
    // What the selection has in common, so the buttons show the current state.
    const one = (f) => (picked.length && picked.every((b) => f(b) === f(picked[0])) ? f(picked[0]) : undefined);
    const rate = one((b) => Game.rateOf(b)), prio = one((b) => b.prio || 0), cap = Game.capacity();
    const dis = picked.length ? '' : 'disabled';
    const row = (b) => {
      const r = FS.recipeById[b.recipe], n = r ? have(r.primary) : 0;
      return `<tr class="bl-row ${sel.has(b.id) ? 'on' : ''}" data-action="bsel" data-arg="one:${b.id}">
        <td><input type="checkbox" ${sel.has(b.id) ? 'checked' : ''} tabindex="-1"></td>
        <td>${FSI.img('b_' + b.type)} ${esc(FS.buildings[b.type].name)}</td>
        <td>${r ? `${FSI.img(r.primary)} ${esc(r.label || it(r.primary).name)}` : '<span class="muted">Idle</span>'}</td>
        <td class="num ${r && n >= cap ? 'full' : ''}">${r ? `${n}<small class="muted">/${cap}</small>` : ''}</td>
        <td>${r && Game.sellKeep(r.primary) != null && Game.wholesalerLevel() ? `<span class="okc">🚚 keeps ${Game.sellKeep(r.primary)}</span>` : ''}</td>
        <td>${(Game.PRIOS.find(([v]) => v === (b.prio || 0)) || [0, 'Normal'])[1]}</td>
        <td class="num">${Math.round(Game.rateOf(b) * 100)}%</td></tr>`;
    };
    return {
      title: '🏘️ Buildings: rate & priority', cls: 'wide',
      html: `<p class="hint">Pick buildings, then set their production rate and priority together. Buildings stop when storage is full (${cap} of each item); storage and 🚚 auto-sell are set per item in the <a class="link" data-action="market-sell">🛖 Inventory</a>.</p>
        <div class="bl-quick"><b class="small">Select</b>
          ${pick('raw', '', '🌱 First in the chain', all.filter(isRawProducer))}
          ${groups.map((g) => pick('group', g, `All ${esc(g)}`, all.filter((b) => FS.buildings[b.type].group === g))).join('')}
          <button class="small" data-action="bsel" data-arg="all:" ${all.length ? '' : 'disabled'}>Everything</button>
          <button class="small" data-action="bsel" data-arg="none:" ${dis}>Clear</button></div>
        <div class="bl-quick">${types.map((t) => pick('type', t, `${FSI.img('b_' + t)} ${esc(FS.buildings[t].name)}`, all.filter((b) => b.type === t))).join('')}</div>
        <div class="stockctl bl-bulk">
          <div class="small"><b>${picked.length ? `${picked.length} building${picked.length > 1 ? 's' : ''} selected` : 'Select buildings above or in the list'}</b></div>
          <div class="small">Priority for shared ingredients</div>
          <div class="seg">${Game.PRIOS.map(([v, n]) => `<button class="${picked.length && v === prio ? 'active' : ''}" data-action="bulk-prio" data-arg="${v}" ${dis}>${n}</button>`).join('')}</div>
          <div class="small" title="Half of the upkeep is fixed; the other half scales with the production rate">Production rate</div>
          <div class="seg">${[1, 0.75, 0.5, 0.25].map((v) => `<button class="${picked.length && v === rate ? 'active' : ''}" data-action="bulk-rate" data-arg="${v}" ${dis}>${v * 100}%</button>`).join('')}</div></div>
        ${all.length ? `<table class="tbl bl-table"><tr><th></th><th>Building</th><th>Making</th><th class="num">Stock</th><th>Auto-sell</th><th>Priority</th><th class="num">Rate</th></tr>
          ${groups.map((g) => `<tr class="bl-group"><td colspan="7">${esc(g)}</td></tr>${all.filter((b) => FS.buildings[b.type].group === g).map(row).join('')}`).join('')}</table>`
          : '<p class="hint">You have no buildings yet.</p>'}`,
    };
  };
  function bulkSelect(arg) {
    const [scope, v] = arg.split(':');
    const all = listable(), sel = ui.bsel = ui.bsel || new Set();
    if (scope === 'one') { const id = +v; if (sel.has(id)) sel.delete(id); else sel.add(id); return; }
    if (scope === 'none') { sel.clear(); return; }
    const list = all.filter((b) => scope === 'all' || (scope === 'raw' && isRawProducer(b)) || (scope === 'group' && FS.buildings[b.type].group === v) || (scope === 'type' && b.type === v));
    // Clicking a full selection again deselects it, otherwise it adds to what is selected.
    if (scope !== 'all' && list.every((b) => sel.has(b.id))) list.forEach((b) => sel.delete(b.id));
    else list.forEach((b) => sel.add(b.id));
  }

  // ----- Menu & help -----
  // Sound rows: icon, name with a one-line description, a filled slider and its value.
  const pct = (v) => Math.round(v * 100);
  const volText = (v) => (+v ? v + '%' : 'Off');
  function volRow(key, valId, icon, name, desc, v, extra = '') {
    return `<div class="vol-row"><span class="vol-ico">${FSI.img(icon)}</span>
      <div class="vol-name"><b>${name}</b><span class="small muted">${desc}</span></div>
      <input type="range" class="slider" min="0" max="100" step="5" value="${pct(v)}" style="--p:${pct(v)}%" data-volume="${key}" aria-label="${name} volume">
      <span id="${valId}" class="vol-val">${volText(pct(v))}</span>${extra || '<span class="vol-extra"></span>'}</div>`;
  }
  modals.menu = () => ({
    title: '⚙️ Settings',
    html: `<div class="gm">
      <div class="gm-actions">
        <button data-action="save"><span class="gm-ico">💾</span><b>Save game</b><span class="small muted">Saves to this browser</span></button>
        <button data-action="load"><span class="gm-ico">📂</span><b>Load last save</b><span class="small muted">Go back to your last save</span></button>
        <button data-action="help-open"><span class="gm-ico">❔</span><b>How to play</b><span class="small muted">Controls and tips</span></button>
      </div>
      <section class="gm-card sound-card ${SFX.muted ? 'off' : ''}">
        <div class="gm-head"><h4>Sound</h4><span class="small muted">Press <kbd>N</kbd> anywhere to switch it on or off</span>
          <button class="switch ${SFX.muted ? '' : 'on'}" id="sound-switch" data-action="sound" role="switch" aria-checked="${!SFX.muted}" title="Sound on/off (N)"><span class="knob"></span><span class="sw-txt">${SFX.muted ? 'Off' : 'On'}</span></button></div>
        ${volRow('1', 'vol-val', 'ui_sound', 'Overall', 'Turns everything up or down', SFX.volume,
          '<button class="vol-extra icon-btn" data-action="sound-test" title="Try a sound">▶</button>')}
        ${volRow('weather', 'wvol-val', 'weather_rain', 'Weather &amp; nature', 'Rain, wind, birds, farm animals', SFX.weather)}
        ${volRow('music', 'mvol-val', 'ui_music', 'Music', 'The background tune', SFX.music)}
      </section>
      <section class="gm-card">
        <div class="gm-head"><h4>Save files</h4><span class="small muted">Back up your farm or move it to another computer</span></div>
        <div class="row gap wrap"><button data-action="save-download">⬇️ Download save file</button><button data-action="save-upload">📂 Load from file</button>
          <input type="file" id="savefile" accept=".json,application/json,text/plain" hidden></div>
        <details class="settings"><summary>Paste a save code instead</summary>
          <textarea id="savebox" rows="4" placeholder="Paste a save code from an older version here…"></textarea>
          <div class="row gap"><button data-action="export">Show code for this game</button><button data-action="import">Load code from box</button></div>
        </details>
      </section>
      <div class="gm-foot"><span class="small muted">The game autosaves to this browser every 30 seconds. Version ${GAME_VERSION}.</span>
        <button class="danger" data-action="newgame">🆕 Start a new game</button></div>
    </div>`,
  });
  // Kept short on purpose: three steps to start, everything else is explained where it comes up (? tooltips).
  modals.help = () => ({
    title: '❔ How to play Root of All Dishes',
    html: `<div class="help">
      <p>Grow food, turn it into ingredients, and discover the dishes they make.</p>
      <ol>
        <li><b>Build</b> from the left menu, then click the map to place it.</li>
        <li><b>Click a building</b> to choose what it makes. Everything goes to your 🛖 Inventory.</li>
        <li>Combine ingredients in the <b>🧪 Test Kitchen</b> to discover dishes, then cook them in a Kitchen.</li>
      </ol>
      <p>Not sure what to do next? Follow the 🎯 goal bar at the top.</p>
      <p class="small muted">Drag to move the map, scroll to zoom, <kbd>Space</kbd> pauses, <kbd>Esc</kbd> cancels or closes. Hover a button to see its shortcut key.</p>
      <div class="help-go"><button class="primary" data-action="start-play">Let's farm!</button></div></div>`,
  });

  // Shown once on a new farm, before the help screen: the title and the idea of the game in one warm card.
  // The little chain shows the journey of one dish: raw foods, the ingredients made from them, the plate.
  const WELCOME_CHAIN = [['wheat', 'tomato', 'milk'], ['tomato_sauce', 'mozzarella'], ['pizza_margherita']];
  modals.welcome = () => {
    const chain = WELCOME_CHAIN.map((g) => g.filter((id) => FSI.has(id))).filter((g) => g.length)
      .map((g) => `<span class="wc-step">${g.map((id) => `<span data-tip="${esc(it(id).name)}">${FSI.img(id)}</span>`).join('')}</span>`).join('<span class="wc-arrow">➜</span>');
    return { title: '', cls: 'splash welcome',
      html: `<div class="sp-icon">${FSI.img('ui_logo')}</div>
        <p class="dc-kicker">Welcome to</p><h2 class="sp-title">Root of All Dishes</h2>
        <p class="wc-sub">The Long Road to a Good Meal</p><p class="wc-ver">v${GAME_VERSION}</p>
        <div class="wc-chain">${chain}</div>
        <p class="sp-one">Every good meal starts long before the kitchen: in a field, a pasture, an orchard or the sea.</p>
        <p class="sp-one">Grow it, raise it, mill it, cure it, cook it, and find out how many hands and days go into the dishes you love.</p>
        <div class="sp-go"><button class="primary" data-action="close-modal">Start the journey</button></div>` };
  };

  // =================== EVENTS ===================
  // Toasts stay short and few. Game events (also kept in the journal) wait in the journal while a window is open.
  // Goal and unlock toasts that arrive while a window is open wait until it closes, so they never cover what you read.
  const toastQ = [];
  function toast(msg, kind = '', event = false) {
    if (kind === 'bad' && !event) SFX.play('error');
    if (kind === 'season') SFX.play('season');
    if ((event || kind === 'season') && (ui.modal || document.getElementById('discovery') || document.getElementById('easter'))) {
      if (kind) { toastQ.push([msg, kind]); if (toastQ.length > 3) toastQ.shift(); }
      return;
    }
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.innerHTML = msg;
    const box = $('#toasts');
    box.appendChild(el);
    while (box.children.length > 3) [...box.children].find((c) => c !== ui.hintEl).remove();
    if (kind === 'hint') return el;
    setTimeout(() => el.classList.add('fade'), kind === 'discover' || kind === 'season' ? 7000 : 3500);
    setTimeout(() => el.remove(), kind === 'discover' || kind === 'season' ? 7600 : 4100);
    return el;
  }
  function flushToasts() {
    if (ui.modal || document.getElementById('discovery') || document.getElementById('easter')) return;
    toastQ.splice(0).forEach(([m, k]) => toast(m, k));
  }
  // The placing hint is one toast that lasts while you place, and goes as soon as you place or cancel.
  function placeHint(msg) {
    dropHint();
    if (ui.touch) return touchGhost(); // a touch screen gets the Build bar instead of the mouse hint
    const el = toast(msg, 'hint');
    el.classList.add('sticky');
    ui.hintEl = el;
  }
  function dropHint() { if (ui.hintEl) { ui.hintEl.remove(); ui.hintEl = null; } }

  // ----- Touch placing (phones, tablets): the ghost starts in the middle of the view (or on the building being moved)
  // and only moves when tapped elsewhere or dragged; the bar at the bottom builds it or cancels. Mouse play never sees it.
  ui.touch = matchMedia('(hover: none) and (pointer: coarse)').matches;
  function touchGhost() {
    const cv = $('#map'), [w, h] = FS.buildings[Render.ghost].size;
    const mb = ui.moving && Game.S.buildings.find((x) => x.id === ui.moving);
    const c = Render.screenToTile(cv.clientWidth / 2, cv.clientHeight / 2);
    const at = ui.buildAt || c;
    Render.hover = mb ? { x: mb.x, y: mb.y } : { x: at.x - Math.floor((w - 1) / 2), y: at.y - Math.floor((h - 1) / 2) };
    closeBuildPop();
    touchBar();
  }
  // Touch screens keep the build menu hidden (CSS, same media query): a tap on empty ground of your own land pops it up,
  // on the half of the screen away from that spot, and the building picked from it starts there. Any other tap closes it.
  const touchMenu = () => matchMedia('(hover: none) and (pointer: coarse)').matches;
  function openBuildPop(t, clientY) {
    const bar = $('#buildbar'), top = $('#main').getBoundingClientRect().top;
    ui.buildAt = t; Render.hover = t;
    const low = clientY > (top + innerHeight) / 2; // tapped in the lower half: the menu goes up top
    bar.style.top = low ? top + 8 + 'px' : ''; bar.style.bottom = low ? 'auto' : '';
    bar.scrollTop = 0;
    document.body.classList.add('bb-open');
    ui.popAt = performance.now();
  }
  // The click that follows the opening tap may land on the menu that just opened under the finger: swallow it.
  document.addEventListener('click', (e) => {
    if (performance.now() - (ui.popAt || 0) < 500 && e.target.closest && e.target.closest('#buildbar')) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  // Flow filter: icon toggles for the goods passed between buildings and the building types involved, A–Z.
  // Nothing picked shows every link; picking anything also turns Flows on.
  function flowFilter() {
    const el = $('#flowf');
    if (el.hidden) return;
    const o = Render.flowOptions(), G = Render.flowGoods, T = Render.flowTypes;
    const goods = [...new Set([...o.goods, ...G])].sort((a, b) => it(a).name.localeCompare(it(b).name));
    const types = [...new Set([...o.types, ...T])].sort((a, b) => FS.buildings[a].name.localeCompare(FS.buildings[b].name));
    const chip = (act, id, name, on, icon, emoji) => `<button class="${on ? 'on' : ''}" data-action="${act}" data-arg="${id}" data-tip="${esc(name)}">${FSI.img(icon) || esc(emoji || '?')}</button>`;
    const clear = (k, set) => (set.size ? `<button class="ff-clear" data-action="ff-clear" data-arg="${k}">✕ ${set.size}</button>` : '');
    el.innerHTML = goods.length || types.length
      ? `<h4>Goods ${clear('goods', G)}</h4><div class="ff-grid">${goods.map((i) => chip('ff-good', i, it(i).name, G.has(i), i, it(i).emoji)).join('')}</div>
        <h4>Buildings ${clear('types', T)}</h4><div class="ff-grid">${types.map((t) => chip('ff-type', t, FS.buildings[t].name, T.has(t), 'b_' + t, FS.buildings[t].icon)).join('')}</div>`
      : '<div class="ff-none">No goods move between your buildings yet.</div>';
  }
  function saveFlowFilter() {
    try { localStorage.setItem('rootdishes-flow-filter', JSON.stringify({ goods: [...Render.flowGoods], types: [...Render.flowTypes] })); } catch (e) { /* not remembered */ }
    lastTop = '';
  }
  function closeBuildPop() {
    if (!document.body.classList.contains('bb-open')) return;
    document.body.classList.remove('bb-open');
    const bar = $('#buildbar');
    bar.style.top = ''; bar.style.bottom = '';
    ui.buildAt = null;
    if (!ui.placing && !ui.moving) Render.hover = null;
  }
  ui.closeBuildPop = closeBuildPop;
  function touchBar() {
    const bar = $('#touchbar'), on = ui.touch && (ui.placing || ui.moving) && Render.ghost && Render.hover;
    document.body.classList.toggle('touch-placing', !!on);
    bar.hidden = !on;
    if (!on) { bar.innerHTML = ''; bar.dataset.sig = ''; return; }
    const type = Render.ghost, bt = FS.buildings[type], t = Render.hover;
    const mb = ui.moving && Game.S.buildings.find((x) => x.id === ui.moving), same = mb && mb.x === t.x && mb.y === t.y;
    const err = !same && Game.canPlace(type, t.x, t.y, Render.ghostMove);
    const note = same ? 'Tap a new spot, or drag the building there.'
      : err ? `<span class="short">${esc(err)}</span>` : `Tap the building again or ${mb ? 'Move here' : 'Build'} to confirm. Drag it to adjust.`;
    const html = `<div class="tb-head">${FSI.img('b_' + type)} <b>${mb ? 'Moving' : 'Placing'} ${esc(bt.name)}</b> <span class="muted">💰${money(mb ? Game.moveCost(type) : bt.cost)}</span></div>
      <div class="small tb-note">${note}</div>
      <div class="tb-btns"><button data-action="touch-cancel">✕ Cancel</button><button class="primary" data-action="touch-build"${err || same ? ' disabled' : ''}>✓ ${mb ? 'Move here' : 'Build'}</button></div>`;
    if (bar.dataset.sig !== html) { bar.innerHTML = html; bar.dataset.sig = html; }
  }
  ui.touchBar = touchBar;

  function bindGameEvents() {
    Game.on('toast', (m, k, ev) => toast(esc(m), k, ev));
    Game.on('critic-news', (m) => { if (!ui.townMode) toast(esc(m), 'good', true); });
    Game.on('journal', () => { if (ui.modal === 'journal') { Game.S.journalRead = Game.S.journalN; ui.refresh(); } });
    Game.on('produced', (b, r) => Render.addFloat(b, `+${r.outputs[r.primary]}`, r.primary));
    // Auto-sales show as coins over a building that makes the item.
    Game.on('autosold', (id, got) => {
      const b = Game.S.buildings.find((x) => { const r = FS.recipeById[x.recipe]; return r && r.outputs[id]; });
      if (b) Render.addFloat(b, `+${Math.round(got)}`, 'ui_money');
    });
    // New ingredients made close together share one toast.
    let fresh = [], freshTimer = 0;
    Game.on('newItem', (id) => {
      if (it(id).raw || it(id).dish) return;
      fresh.push(id);
      clearTimeout(freshTimer);
      freshTimer = setTimeout(() => {
        const ids = fresh;
        fresh = [];
        Game.journal({ type: 'items', ids, quiet: true });
        SFX.play('pop');
        toast(ids.length > 1 ? `🆕 ${ids.length} new ingredients made: ${ids.slice(0, 4).map((i) => FSI.img(i)).join(' ')}${ids.length > 4 ? ' …' : ''}`
          : `🆕 New ingredient made: ${FSI.img(ids[0])} <b>${esc(it(ids[0]).name)}</b>`, '', true);
      }, 400);
    });
    Game.on('discovered', (id) => {
      // The tarte flambée has its own celebration (easterEgg).
      Game.journal({ type: 'dish', id, quiet: true });
      // Found in the Test Kitchen: shown at once. Found in the background (an Academy chef): waits until the player is idle.
      if (id !== Game.SPECIAL.id) discoveryCard(id, ui.modal !== 'testkitchen');
      if (Render.selected) renderInspector();
    });
    Game.on('easteregg', easterEgg);
    Game.on('wholesaler-hired', () => openModal('wsOn'));
    Game.on('reset', () => {
      Render.buildTerrain(); Render.cam.z = 1.4; Render.centerOn(Game.OX + 26, Game.OY + 18); Render.selected = null; renderInspector(); buildTopbar();
      ui.tkSlots = []; ui.tkLog = []; ui.tkTarget = null; ui.tkMiss = null; ui.tkFit = null; lastTop = ''; orderN = null;
    });
    // A ding when a new order comes in (the order counter only grows for new ones).
    let orderN = null;
    Game.on('orders', () => {
      const n = Game.S.stats.orderCounter || 0;
      if (orderN !== null && n > orderN) SFX.play('order');
      orderN = n;
      if (ui.modal === 'orders') ui.refresh();
    });
    // Milestone goals bring their own sound with their card.
    Game.on('goals', () => { if (!ui.splashQ.some(bigSplash)) setTimeout(() => SFX.play('goal'), document.getElementById('discovery') ? 900 : 0); });
    Game.on('unlocked', (u) => {
      Game.journal({ type: 'unlock', recipes: u.recipes.length, buildings: u.buildings, quiet: true });
      setTimeout(() => SFX.play('unlock'), 450);
      const nb = u.buildings.length;
      toast(`🔓 <b>${u.recipes.length ? `${u.recipes.length} new production step${u.recipes.length === 1 ? '' : 's'}${nb ? ' and ' : ''}` : ''}${nb ? `${nb} new building${nb > 1 ? 's' : ''}` : ''}</b> ${u.buildings.slice(0, 6).map((b) => FSI.img('b_' + b)).join('')}`, 'discover', true);
      buildTopbar();
      if (Render.selected) renderInspector();
      if (ui.modal) ui.refresh();
    });
    Game.on('built', () => buildTopbar());
    Game.on('newB', () => buildTopbar());
    Game.on('academy', () => {
      if (ui.modal === 'academy' || ui.modal === 'cookbook') ui.refresh();
      const sb = Render.selected && Game.S.buildings.find((x) => x.id === Render.selected);
      if (sb && sb.type === 'academy') renderInspector();
    });
    Game.on('demolished', () => buildTopbar());
    Game.on('town', () => { lastTop = ''; if (ui.townMode) drawTown(); if (ui.modal === 'cuisines' || ui.townMode) ui.refresh(); });
    Game.on('guest', (ev) => { if (ui.townMode) TownMap.float(ev); });
    Game.on('critic', (h) => { if (ui.townMode) { $('#town-over').innerHTML = townOverHtml(); drawTown(true); renderTownPanel(); } if (h) { SFX.play('goal'); openModal('gazette'); } });
    Game.on('legacy', () => ui.finale());
    Game.on('unlock', (key) => ui.splash(key));
    Game.on('land', () => { SFX.play('unlock'); $('#hoverinfo').hidden = true; });
    Game.on('changed', () => renderInspector());
  }

  function act(action, arg, el) {
    const S = Game.S;
    if (action !== 'bgroup' && action !== 'build') closeBuildPop(); // folding a group keeps the pop-up build menu open
    switch (action) {
      case 'bgroup': toggleBuildGroup(arg); break;
      case 'touch-build': if (Render.hover && (ui.placing || ui.moving)) ui.commitAt(Render.hover); break;
      case 'touch-cancel': cancelPlacing(); break;
      case 'build': if (ui.bp) cancelPlacing(); ui.placingRecipe = null; ui.moving = null; Render.ghostMove = null; ui.placing = arg; Render.ghost = arg; selectBuilding(null); document.body.classList.add('placing'); placeHint(`Placing ${FS.buildings[arg].name}: click on the map. Right-click to cancel.`); closeBuildPop(); break;
      case 'speed': S.speed = +arg; break;
      case 'modal': openModal(arg); break;
      case 'bank': ui.marketTab = 'bank'; openModal('market'); break;
      case 'close-modal': closeModal(); break;
      case 'deselect': selectBuilding(null); break;
      case 'set-recipe': Game.setRecipe(Render.selected, arg); break;
      case 'pause': Game.togglePause(+arg); break;
      case 'move': { const mb = Game.S.buildings.find((x) => x.id === +arg); if (!mb) break; cancelPlacing(); ui.moving = mb.id; Render.ghost = mb.type; Render.ghostMove = mb.id; document.body.classList.add('placing'); placeHint(`Moving ${FS.buildings[mb.type].name} (💰${Game.moveCost(mb.type)}): click a new spot. Esc or right-click to cancel.`); break; }
      case 'demolish': if (confirm('Demolish this building? You get half the cost back, but its settings are lost. Use Move to keep them.')) { Game.demolish(+arg); SFX.play('demolish'); selectBuilding(null); } break;
      case 'sell-above': {
        const p = sellAbovePlan((ui.mkOrder && ui.mkOrder.ids) || [], sellAboveVal());
        let got = 0;
        for (const [id, k] of p.list) got += Game.sell(id, k);
        if (got) { SFX.play('sell'); toast(`Sold ${p.qty} goods (${p.list.length} kinds) for 💰${coins(got)}`, 'good'); }
        ui.refresh(); break;
      }
      case 'sell': { const n = Math.min(+el.dataset.qty, have(arg)), got = Game.sell(arg, n); if (got) { SFX.play('sell'); toast(`Sold ${n} ${it(arg).name} for 💰${coins(got)}`, 'good'); } ui.refresh(); break; }
      case 'buy': spend(() => Game.buy(arg, +el.dataset.qty)); ui.refresh(); break;
      case 'flows': Render.flows = !Render.flows; break;
      case 'flow-filter': $('#flowf').hidden = !$('#flowf').hidden; flowFilter(); break;
      case 'ff-good': case 'ff-type': case 'ff-clear': {
        const set = action === 'ff-good' ? Render.flowGoods : action === 'ff-type' ? Render.flowTypes : null;
        if (set) { if (set.has(arg)) set.delete(arg); else set.add(arg); Render.flows = true; }
        else (arg === 'goods' ? Render.flowGoods : Render.flowTypes).clear();
        saveFlowFilter(); flowFilter(); break;
      }
      case 'plan': ui.planItem = arg; S.stats.plans = (S.stats.plans || 0) + 1; openModal('plan'); break;
      case 'plan-build': {
        const r = FS.recipeById[arg];
        closeModal(); cancelPlacing(); ui.placing = r.building; ui.placingRecipe = r.id; Render.ghost = r.building; selectBuilding(null); document.body.classList.add('placing');
        placeHint(`Placing ${FS.buildings[r.building].name} for ${esc(r.label || it(r.primary).name)}: click on the map. Right-click to cancel.`);
        break;
      }
      case 'bp-start': case 'bp-full': {
        const bp = action === 'bp-full' ? blueprintFull(arg) : blueprintFor(arg);
        if (!bp.items.length) {
          for (const a of bp.idle) Game.setRecipe(a.id, a.rid);
          toast(`${bp.idle.length} idle building${bp.idle.length === 1 ? '' : 's'} put to work.`, 'good'); ui.refresh(); break;
        }
        closeModal(); cancelPlacing(); selectBuilding(null);
        ui.bp = Render.blueprint = Object.assign(bp, { item: arg, dir: 0, pinned: false, ax: null, drag: null });
        document.body.classList.add('placing');
        if (Render.hover) bpFit(Render.hover.x, Render.hover.y);
        bpBar();
        break;
      }
      case 'bp-more': case 'bp-less': {
        const bp = ui.bp;
        if (!bp || !bp.full) break;
        const m = Math.max(1, Math.min(9, bp.mult + (action === 'bp-more' ? 1 : -1)));
        if (m === bp.mult) break;
        Object.assign(bp, blueprintFull(bp.item, m));
        if (bp.ax != null) bpFit(bp.ax, bp.ay); else bpBar();
        break;
      }
      case 'bp-rotate': if (ui.bp) { ui.bp.dir = (ui.bp.dir + 1) & 3; if (ui.bp.ax != null) bpFit(ui.bp.ax, ui.bp.ay); } break;
      case 'bp-build': {
        const bp = ui.bp;
        if (!bp || !bp.pinned) break;
        const out = Game.placeBlueprint(bp.items, bp.idle);
        if (out) { SFX.play('plonk'); cancelPlacing(); } else { SFX.play('error'); bpBar(); }
        break;
      }
      case 'bp-cancel': cancelPlacing(); break;
      case 'plan-assign': {
        const r = FS.recipeById[arg];
        const b = S.buildings.find((x) => x.type === r.building && !x.recipe);
        if (b) { Game.setRecipe(b.id, r.id); toast(`${FS.buildings[b.type].name} now makes ${esc(r.label || it(r.primary).name)}.`, 'good'); }
        ui.refresh(); break;
      }
      case 'buy-short': spend(() => Game.buy(arg, +el.dataset.qty)); updateInspectorLive(); break;
      case 'market-sell': ui.marketTab = 'sell'; openModal('market'); break;
      case 'storage-up': Game.upgradeStorage(); ui.refresh(); break;
      case 'ws-keep': Game.setWholesaleKeep(arg === '' ? null : +arg); ui.refresh(); break;
      case 'as-all': for (const o of Object.keys(S.autosell || {})) Game.setAutosell(o, 'd'); ui.refresh(); break;
      case 'as-none': for (const o of Object.keys(S.inv)) if (o !== 'water' && have(o) > 0) Game.setAutosell(o, null); ui.refresh(); break;
      case 'ws-on': Game.setWholesalerOn(arg === '1'); ui.refresh(); break;
      case 'prio': Game.setPrio(Render.selected, +arg); break;
      case 'bsel': bulkSelect(arg); ui.refresh(); break;
      case 'bulk-prio': Game.setRateMany([...(ui.bsel || [])], undefined, +arg); ui.refresh(); break;
      case 'bulk-rate': Game.setRateMany([...(ui.bsel || [])], +arg); ui.refresh(); break;
      case 'start-play': closeModal(); if (!S.speed) S.speed = 1; break;
      case 'mtab': ui.marketTab = arg; ui.refresh(); break;
      case 'otab': ui.ordersTab = arg; ui.refresh(); break;
      case 'osort': ui.oSort = arg; try { localStorage.setItem('rootdishes-orders-sort', arg); } catch (e) { /* private mode */ } ui.refresh(); break;
      case 'hire-dispatcher': spend(() => Game.hireDispatcher()); ui.refresh(); break;
      case 'disp-on': Game.setDispatcher({ on: !S.dispatcher.on }); ui.refresh(); break;
      case 'disp-keep': Game.setDispatcher({ keep: +arg }); ui.refresh(); break;
      case 'disp-kind': Game.setDispatcher({ skip: arg }); ui.refresh(); break;
      case 'mk-sort': {
        const cur = ui.mkSort;
        ui.mkSort = { by: arg, dir: cur.by === arg ? -cur.dir : (arg === 'name' || arg === 'group' ? 1 : -1) };
        try { localStorage.setItem('rootdishes-market-sort', JSON.stringify(ui.mkSort)); } catch (e) { /* private mode */ }
        ui.refresh(); break;
      }
      case 'borrow': spend(() => Game.borrow()); ui.refresh(); break;
      case 'repay': Game.repay(); ui.refresh(); break;
      case 'fulfil': { const [oid, pick] = String(arg).split(':'), m = S.money; Game.fulfil(+oid, pick); if (S.money > m) SFX.play('register'); ui.refresh(); break; }
      // A newly opened cuisine gets its splash right away: the Cuisines window steps aside for it.
      case 'open-cuisine': spend(() => Game.openCuisine(arg)); if (Game.S.cuisines[arg] && ui.splashQ.includes('cz:' + arg)) closeModal(); else ui.refresh(); break;
      case 'hire-wholesaler': spend(() => Game.hireWholesaler()); ui.refresh(); break;
      case 'ws-start': Game.setWholesalerOn(true); closeModal(); openModal('market'); break;
      case 'ac-hire': Game.hireChef(+arg); ui.refresh(); break;
      case 'ac-train': Game.trainChef(+arg); ui.refresh(); break;
      case 'ac-dismiss': if (confirm('Let this chef go? You get no toques back, but what they revealed stays.')) { Game.dismissChef(+arg); if (ui.acPick === +arg) ui.acPick = null; } ui.refresh(); break;
      case 'ac-pick': ui.acPick = ui.acPick === +arg ? null : +arg; ui.refresh(); break;
      case 'ac-assign': { const [cid, what] = String(arg).split('|'); Game.assignChef(+cid, what); if (what) ui.acPick = null; ui.refresh(); break; }
      case 'ac-send': Game.sendChef(arg); ui.refresh(); break;
      case 'town-sel': ui.townSel = arg; ui.townTab = 'lot'; ui.search.town = ''; drawTown(); ui.refresh(); break;
      case 'town': ui.setTown(!ui.townMode); break;
      case 'finale': ui.finale(); break;
      // See an earned card again from the trophy shelf (nothing is paid twice: cards only show).
      case 'replay': if (!ui.splashQ.includes(arg)) ui.splashQ.unshift(arg); ui.afterSplash = ui.modal; closeModal(); break;
      case 'town-tab': ui.townTab = arg; ui.refresh(); break;
      case 'town-zoom': { const el = $('#town-map'); TownMap.zoomAt(el.clientWidth / 2, el.clientHeight / 2, +arg > 0 ? 1.25 : 0.8); break; }
      case 'town-offer':
        if (confirm(`Buy out ${Game.CORP.name} for ${money(Game.CORP.offer)} coins? Its three restaurants become yours.`)) spend(() => Game.acceptOffer());
        ui.refresh(); break;
      case 'town-rename': { const r = Game.restaurants().find((x) => x.id === +arg); const n = r && prompt('New name for this restaurant:', r.name); if (n) Game.renameRestaurant(+arg, n); break; }
      case 'town-open': spend(() => Game.openRestaurant(arg)); ui.refresh(); break;
      case 'town-close': if (confirm('Close this restaurant? The spot is free again, but the rent is not refunded and its reviews are lost.')) Game.closeRestaurant(+arg); ui.refresh(); break;
      case 'town-price': { const [rid, k] = String(arg).split('|'); Game.setPriceLevel(+rid, +k); ui.refresh(); break; }
      case 'menu-add': case 'menu-del': { const [rid, id] = String(arg).split('|'); Game.setMenu(+rid, id, action === 'menu-add'); ui.refresh(); break; }
      case 'cz-dishes': ui.filter.cuisine = arg; openModal('cookbook'); break;
      case 'reveal': Game.reveal(arg); ui.refresh(); break;
      case 'master': Game.masterDish(arg); ui.refresh(); break;
      case 'head-promote': { const [cid, rid] = String(arg).split('|'); Game.promoteChef(+cid, +rid); ui.refresh(); break; }
      case 'head-train': Game.trainHead(+arg); ui.refresh(); break;
      case 'head-dismiss': if (confirm('Let this head chef go? You get no toques back.')) Game.dismissHead(+arg); ui.refresh(); break;
      case 'tk-add': if (!ui.tkSlots.includes(arg) && ui.tkSlots.length < Game.MAX_SLOTS) ui.tkSlots.push(arg); else ui.tkSlots = ui.tkSlots.filter((x) => x !== arg); ui.refresh(); break;
      case 'tk-remove': ui.tkSlots = ui.tkSlots.filter((x) => x !== arg); ui.refresh(); break;
      case 'tk-clear': ui.tkSlots = []; ui.refresh(); break;
      case 'tk-hist': ui.tkHist = !ui.tkHist; ui.refresh(); break; // touch screens show only the latest try unless asked
      case 'dd': ui.dd = ui.dd === arg ? null : arg; ui.refresh(); { const m = document.querySelector('.dd.open .dd-menu'); if (m) m.scrollIntoView({ block: 'nearest' }); } break;
      case 'cz-scroll': { const st = document.querySelector('.cz-strip'); if (st) st.scrollBy({ left: +arg * st.clientWidth * 0.8, behavior: 'smooth' }); break; }
      case 'dd-set': { const k = arg.slice(0, arg.indexOf('|')); SETTERS[k](arg.slice(arg.indexOf('|') + 1)); ui.dd = null; ui.refresh(); break; }
      case 'dd-pick': { const [k, c] = arg.split(':'); ui.filter[k] = c; ui.dd = null; ui.refresh(); const l = document.querySelector(k === 'cat' ? '[data-scroll="cxlist"]' : '[data-scroll="tkpick"]'); if (l) l.scrollTop = 0; break; }
      case 'cz': ui.filter.cuisine = ui.filter.cuisine === arg ? '' : arg; ui.refresh(); break;
      case 'tk-try': ui.tkSlots = (S.revealed[arg] || []).slice(); ui.tkTarget = S.discovered[arg] ? null : arg; openModal('testkitchen'); break;
      case 'tk-untarget': ui.tkTarget = null; ui.refresh(); break;
      case 'tk-aim': { const l = ui.tkLog[+arg]; if (l && l.aim) { ui.tkTarget = l.aim.dish; ui.tkMiss = { target: l.aim.dish, cats: l.aim.cats }; } ui.refresh(); break; }
      case 'tk-cook': {
        const res = Game.experiment(ui.tkSlots, ui.tkTarget);
        // What a hint told about the target dish: each tried ingredient fits it or not. Kept for the target and shown as
        // green / red on the slots and on this try's icons.
        const fit = ui.tkTarget && (res.dish === ui.tkTarget && res.fit || res.targetFit);
        if (fit) {
          if (!ui.tkFit || ui.tkFit.target !== ui.tkTarget) ui.tkFit = { target: ui.tkTarget, ok: {} };
          fit.good.forEach((i) => (ui.tkFit.ok[i] = true));
          fit.bad.forEach((i) => (ui.tkFit.ok[i] = false));
        }
        const names = ui.tkSlots.map((i) => `<span class="${fit ? (fit.good.includes(i) ? 'fit-good' : 'fit-bad') : ''}">${FSI.img(i)}</span>`).join(' ');
        let html;
        if (res.kind === 'new') html = `🎉 <b>Discovered ${FSI.img(res.dish)} ${esc(it(res.dish).name)}!</b> ${res.cooked ? 'You cooked one.' : 'Not enough of each ingredient to cook one yet.'} It can now be cooked in a Kitchen.`;
        else if (res.kind === 'known') html = `${FSI.img(res.dish)} ${esc(it(res.dish).name)}: already known. ${res.cooked ? 'Cooked one more.' : ''}`;
        else html = `${names} ➜ ${res.kind === 'locked' ? '🔒 ' : ''}${esc(res.msg)}`;
        if (res.target) html += `<div class="tk-t-note">🎯 ${esc(res.target)}</div>`;
        // With a target dish, the missing groups named by a hint about it feed the group filter (until the next such hint).
        // Without one, a "Close to…" hint offers to make that dish the target.
        let aim = null;
        if (ui.tkTarget) {
          const cats = res.kind === 'warm' && res.dish === ui.tkTarget ? res.cats : res.targetCats;
          if (cats) ui.tkMiss = cats.length ? { target: ui.tkTarget, cats } : null;
        } else if (res.kind === 'warm' && res.cats) aim = { dish: res.dish, cats: res.cats };
        ui.tkLog.unshift({ kind: res.kind, html, aim, t: Game.S.time });
        ui.tkLog = ui.tkLog.slice(0, 8);
        if ((res.kind === 'new' || res.kind === 'known') && !res.target) ui.tkSlots = [];
        SFX.play({ known: 'pop', warm: 'warm', fail: 'flop', locked: 'warm' }[res.kind] || (res.kind === 'none' ? 'error' : ''));
        ui.refresh();
        break;
      }
      case 'sound': SFX.setMuted(!SFX.muted); soundButton(); SFX.play('click'); break;
      case 'sound-test': SFX.play(['plonk', 'sell', 'register', 'fanfare'][(ui.soundTest = ((ui.soundTest || 0) + 1) % 4)]); break;
      case 'save': Game.save(); break;
      case 'load': if (Game.load()) { toast('Loaded.'); closeModal(); } else toast('No save found.', 'bad'); break;
      case 'newgame': if (confirm('Start a new game? Your current farm will be lost unless you download a save file first.')) { Game.newGame(); openModal('welcome'); } break;
      case 'help-open': openModal('help'); break;
      case 'export': $('#savebox').value = Game.exportSave(); $('#savebox').select(); toast('Save copied into the box.'); break;
      case 'import': try { Game.importSave($('#savebox').value); closeModal(); toast('Save imported.'); } catch (e) { toast('Import failed: ' + esc(e.message), 'bad'); } break;
      case 'save-download': downloadSave(); break;
      case 'save-upload': $('#savefile').value = ''; $('#savefile').click(); break;
    }
  }

  // Save files are the same JSON as the old paste codes, so either can be loaded both ways.
  function downloadSave() {
    Game.save(true);
    const blob = new Blob([Game.exportSave()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `root-of-all-dishes-day-${Game.dayOf() + 1}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Save file downloaded.');
  }
  function loadSaveFile(file) {
    if (!confirm(`Load "${file.name}"? Your current game will be replaced unless you download it first.`)) return;
    file.text().then((txt) => { Game.importSave(txt.trim()); Game.save(true); closeModal(); toast('Save loaded from file.'); })
      .catch((e) => toast('Could not load that file: ' + esc(e instanceof SyntaxError ? 'it is not a Root of All Dishes save.' : e.message), 'bad'));
  }

  // Plays the coin sound when an action actually changed your money (imports, cuisines, loans).
  function spend(fn) { const m = Game.S.money; fn(); if (Game.S.money !== m) SFX.play('buy'); }
  function soundButton() {
    const b = $('#sound-btn'); if (!b) return;
    b.textContent = SFX.muted ? '🔇' : '🔊';
    b.classList.toggle('off', SFX.muted);
    // Keep the ⚙️ menu's switch in step (N, the top-bar button or dragging the volume all change it).
    const sw = $('#sound-switch'); if (!sw) return;
    sw.classList.toggle('on', !SFX.muted); sw.setAttribute('aria-checked', !SFX.muted);
    sw.querySelector('.sw-txt').textContent = SFX.muted ? 'Off' : 'On';
    sw.closest('.sound-card').classList.toggle('off', SFX.muted);
  }
  ui.soundButton = soundButton;

  function cancelPlacing() { dropHint(); ui.placing = null; ui.placingRecipe = null; ui.moving = null; ui.bp = null; Render.ghost = null; Render.ghostMove = null; Render.blueprint = null; bpBar(); document.body.classList.remove('placing'); $('#hoverinfo').hidden = true; if (ui.touch) Render.hover = null; touchBar(); }
  // ----- Blueprint placing: the layout follows the mouse until a click sets it down; then single buildings can be
  // dragged, a click on open ground moves the whole layout there, Rotate (R) turns it, Build (Enter) pays once.
  function bpFit(x, y) {
    const bp = ui.bp;
    for (const it of bp.items) it.fixed = false;
    bp.ax = x; bp.ay = y;
    Game.blueprintFit(bp.items, x, y, bp.dir);
    bpBar();
  }
  function bpItemAt(t) {
    const bp = ui.bp;
    if (!bp || !t) return -1;
    return bp.items.findIndex((it) => { const [w, h] = FS.buildings[it.type].size; return t.x >= it.x && t.x < it.x + w && t.y >= it.y && t.y < it.y + h; });
  }
  function bpBar() {
    const bar = $('#bpbar'), bp = ui.bp;
    if (!bar) return;
    bar.hidden = !bp;
    document.body.classList.toggle('bp-open', !!bp);
    if (!bp) { bar.innerHTML = ''; return; }
    const cost = Game.blueprintCost(bp.items), n = bp.items.length, bad = bp.items.filter((it) => it.err).length;
    const lk = Game.blueprintLinks(bp.items), short = Game.S.money < cost;
    const note = !bp.pinned ? 'Move it over your land and click to set it down.'
      : bad ? `<span class="short">${bad} building${bad === 1 ? ' is' : 's are'} blocked (red): drag ${bad === 1 ? 'it' : 'them'} to open ground.</span>`
      : short ? `<span class="short">You need 💰${money(cost)}; you have 💰${money(Game.S.money)}.</span>`
      : 'Drag single buildings to adjust, or click open ground to move the whole layout.';
    bar.innerHTML = `<div class="bp-head">📐 <b>Blueprint: ${FSI.img(bp.item)} ${esc(it(bp.item).name)}</b>
        <span class="muted">${bp.full ? 'whole chain, balanced · ' : ''}${n} building${n === 1 ? '' : 's'} · 💰${money(cost)}${lk.all ? ` · <span title="Pairs of steps where one makes what the other uses, close enough for the best nearby saving">📍 ${lk.near} of ${lk.all} links close</span>` : ''}${bp.idle.length ? ` · ${bp.idle.length} idle put to work` : ''}</span></div>
      <div class="small bp-note">${note}</div>
      <div class="bp-btns">${bp.full ? `<span class="bp-mult" title="How many of the last step to feed at 100%; every step before it grows to match">${esc(plural(FS.buildings[bp.items[bp.items.length - 1].type].name))} at 100%:
          <button class="small" data-action="bp-less" ${bp.mult <= 1 ? 'disabled' : ''}>−</button> <b>${bp.mult}</b> <button class="small" data-action="bp-more" ${bp.mult >= 9 ? 'disabled' : ''}>+</button></span>` : ''}
        <button class="small" data-action="bp-rotate" title="Turn the way the chain grows (R)">↻ Rotate</button>
        <button class="small primary" data-action="bp-build" ${!bp.pinned || bad || short ? 'disabled' : ''} title="Enter">✅ Build 💰${money(cost)}</button>
        <button class="small" data-action="bp-cancel" title="Esc">✕ Cancel</button></div>`;
    // Toasts stack above the bar (css: body.bp-open #toasts), however tall its note makes it.
    document.body.style.setProperty('--bp-h', bar.offsetHeight + 'px');
  }

  // =================== HOVER TIPS ===================
  // Elements with data-tip show a quick tooltip. The live building panel redraws parts of itself, so the tip is found
  // again from the element under the pointer instead of hanging on to one element.
  const tipS = { x: -1, y: -1, timer: 0 };
  function retip() {
    const box = $('#tip');
    if (!box || box.hidden || tipS.x < 0) return;
    showTip(true);
  }
  function showTip(now, force) {
    const box = $('#tip');
    const at = document.elementFromPoint(tipS.x, tipS.y);
    const host = at && at.closest('[data-tip]');
    if (!host || (ui.mouseDown && !force)) { box.hidden = true; return; }
    if (box.hidden && !now) { clearTimeout(tipS.timer); tipS.timer = setTimeout(() => showTip(true), 280); return; }
    const txt = host.dataset.tip;
    if (box.dataset.txt !== txt) { box.textContent = txt; box.dataset.txt = txt; }
    box.hidden = false;
    const w = box.offsetWidth, h = box.offsetHeight;
    let left = tipS.x + 14 + w > innerWidth - 6 ? Math.max(6, tipS.x - w - 10) : tipS.x + 14;
    let top = tipS.y + 18 + h > innerHeight - 6 ? Math.max(6, tipS.y - h - 10) : tipS.y + 18;
    // data-tip-side="left": beside the element instead of under the pointer, so it never covers the next row of a list.
    if (host.dataset.tipSide === 'left') {
      const hr = host.getBoundingClientRect();
      left = Math.max(6, hr.left - w - 8); top = Math.max(6, Math.min(hr.top, innerHeight - h - 6));
    }
    box.style.left = left + 'px'; box.style.top = top + 'px';
  }
  function bindTips() {
    const box = document.createElement('div');
    box.id = 'tip'; box.hidden = true;
    document.body.appendChild(box);
    document.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      tipS.x = e.clientX; tipS.y = e.clientY;
      if (!e.target.closest || !e.target.closest('[data-tip]')) { clearTimeout(tipS.timer); box.hidden = true; return; }
      showTip(false);
    }, true);
    const hide = () => { clearTimeout(tipS.timer); box.hidden = true; };
    document.addEventListener('pointerdown', hide, true);
    document.addEventListener('keydown', hide, true); // a key can open or close a window under a still pointer
    document.addEventListener('wheel', hide, { capture: true, passive: true });
    document.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') hide(); }); // a lifted finger "leaves" too: a held tip stays
    // Touch screens have no hover: holding a finger on something with a tip shows it until the next touch, and the
    // tap that ends the hold does nothing else.
    let hold = null;
    const dropHold = () => { if (hold) clearTimeout(hold.timer); hold = null; };
    document.addEventListener('pointerdown', (e) => {
      dropHold();
      const host = e.pointerType === 'touch' && e.target.closest && e.target.closest('[data-tip]');
      if (!host) return;
      const h = hold = { x: e.clientX, y: e.clientY };
      h.timer = setTimeout(() => { h.shown = true; tipS.x = h.x; tipS.y = h.y; showTip(true, true); }, 450);
    }, true);
    document.addEventListener('pointermove', (e) => { if (hold && !hold.shown && e.pointerType === 'touch' && Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 10) dropHold(); }, true);
    document.addEventListener('pointercancel', () => { if (hold && !hold.shown) dropHold(); }, true);
    document.addEventListener('pointerup', () => {
      if (!hold) return;
      if (!hold.shown) return dropHold();
      clearTimeout(hold.timer); hold.timer = setTimeout(dropHold, 500); // swallow only the click this hold ends with
    }, true);
    document.addEventListener('click', (e) => { if (hold && hold.shown) { e.preventDefault(); e.stopPropagation(); dropHold(); } }, true);
    document.addEventListener('contextmenu', (e) => { if (hold) e.preventDefault(); }, true);
  }

  const OWN_SOUND = new Set(['sell', 'buy', 'buy-short', 'borrow', 'fulfil', 'open-cuisine', 'hire-wholesaler', 'hire-dispatcher', 'tk-cook', 'modal', 'close-modal', 'sound', 'sound-test', 'bank', 'demolish']);
  function bindInput() {
    document.addEventListener('click', (e) => {
      if (ui.dd && !e.target.closest('.dd')) { ui.dd = null; if (!e.target.closest('[data-action]')) ui.refresh(); }
      if (!$('#flowf').hidden && !e.target.closest('#flowf, #flowf-btn')) $('#flowf').hidden = true;
      const a = e.target.closest('[data-action]');
      if (a && !a.disabled) { if (!OWN_SOUND.has(a.dataset.action)) SFX.play('click'); act(a.dataset.action, a.dataset.arg, a); e.preventDefault(); return; }
      if (e.target.closest('button, [data-item], [data-dc], [data-egg-close]')) SFX.play('click');
      const item = e.target.closest('[data-item]');
      if (item) { ui.codexItem = item.dataset.item; if (ui.modal !== 'codex') openModal('codex'); else ui.refresh(); const d = document.querySelector('[data-scroll="cxdetail"]'); if (d) d.scrollTop = 0; }
    });
    document.addEventListener('pointerdown', (e) => { ui.mouseDown = true; ui.touch = e.pointerType === 'touch'; }, true);
    document.addEventListener('pointerup', () => (ui.mouseDown = false), true);
    $('#modal').addEventListener('mousedown', (e) => { if (e.target.id === 'modal') closeModal(); });
    let searchTimer;
    document.addEventListener('input', (e) => {
      const k = e.target.dataset.search;
      if (!k) return;
      ui.search[k] = e.target.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => (k === 'recipe' ? (renderInspector(), refocus(k)) : ui.refresh()), 120);
    });
    // The rate slider updates its labels while dragging and applies on release, so the panel doesn't redraw under the pointer.
    document.addEventListener('input', (e) => {
      if (!e.target.dataset.rate) return;
      const b = Game.S.buildings.find((x) => x.id === Render.selected);
      const v = $('#rate-val'), u = $('#insp-upkeep');
      if (v) v.textContent = e.target.value + '%';
      if (b && u) u.textContent = upkeepText({ type: b.type, rate: e.target.value / 100 });
      // Preview the new rate in the recipe card (cycle time, supply bars, tips) while dragging.
      if (b) { Game.ratePreview = { id: b.id, v: e.target.value / 100 }; updateInspectorLive(true); }
    });
    document.addEventListener('change', (e) => { if (e.target.dataset.rate) Game.setRate(Render.selected, e.target.value / 100); });
    document.addEventListener('change', (e) => {
      if (e.target.dataset.change === 'town-stock') { ui.townStock = e.target.checked; ui.refresh(); }
    });
    // Per-item auto-sell in the Market: Off, the Wholesaler's default, or a number to keep.
    document.addEventListener('change', (e) => {
      const d = e.target.dataset;
      if (d.autosell) { const v = e.target.value; Game.setAutosell(d.autosell, v === 'off' ? null : v === 'd' ? 'd' : Game.wholesaleKeep()); ui.refresh(); }
      else if (d.keeprule) { const v = e.target.value; Game.setKeepRule(d.keeprule, v === 'off' ? null : v === 'all' ? 'all' : Game.wholesaleKeep()); ui.refresh(); }
      else if (d.keeprulen) { Game.setKeepRule(d.keeprulen, Math.min(Game.capacity(), Math.max(0, +e.target.value || 0))); ui.refresh(); }
      else if (d.wskeep) { Game.setWholesaleKeep(e.target.value === '' ? null : Math.min(Game.capacity(), Math.max(0, +e.target.value || 0))); ui.refresh(); }
      else if (d.askeep) { Game.setAutosell(d.askeep, Math.min(Game.capacity(), Math.max(0, +e.target.value || 0))); ui.refresh(); }
    });
    // The "Sell above" slider updates its number and button while dragging; the window only redraws on release.
    document.addEventListener('input', (e) => {
      if (!e.target.dataset.sellabove) return;
      ui.sellAbove = +e.target.value;
      try { localStorage.setItem('rootdishes-sell-above', ui.sellAbove); } catch (err) { /* private mode */ }
      const cap = Game.capacity();
      e.target.style.setProperty('--p', (cap ? Math.round(ui.sellAbove / cap * 100) : 0) + '%');
      const { n, p, text } = sellAboveLabel((ui.mkOrder && ui.mkOrder.ids) || []), v = $('#sa-val'), b = $('#sa-btn');
      if (v) v.textContent = n;
      document.querySelectorAll('[data-sarow]').forEach((el) => { const r = sellAboveRow(el.dataset.sarow); el.textContent = r.text; el.dataset.qty = r.k; el.dataset.tip = r.tip; el.disabled = !r.k; });
      if (b) { b.textContent = text; b.disabled = !p.qty; b.dataset.tip = `Keeps ${n} of each ${ui.search.mk ? 'matching ' : ''}item and sells the rest at today's price.`; }
    });
    document.addEventListener('input', (e) => {
      if (!e.target.dataset.volume) return;
      const v = e.target.value, kind = e.target.dataset.volume;
      e.target.style.setProperty('--p', v + '%');
      const out = $(kind === 'music' ? '#mvol-val' : kind === 'weather' ? '#wvol-val' : '#vol-val');
      if (out) out.textContent = volText(v);
      if (kind === 'music') return SFX.setMusicVolume(v / 100);
      if (kind === 'weather') return SFX.setWeatherVolume(v / 100);
      SFX.setVolume(v / 100); soundButton();
    });
    document.addEventListener('change', (e) => { if (e.target.dataset.volume === '1') SFX.play('sell'); });
    // A vertical mouse wheel scrolls the cuisine strip sideways.
    document.addEventListener('wheel', (e) => {
      const st = e.target.closest && e.target.closest('.cz-strip');
      if (!st || Math.abs(e.deltaX) > Math.abs(e.deltaY) || st.scrollWidth <= st.clientWidth) return;
      st.scrollLeft += e.deltaY; e.preventDefault();
    }, { passive: false });
    document.addEventListener('scroll', (e) => { if (e.target.classList && e.target.classList.contains('cz-strip')) czArrows(); }, true);
    window.addEventListener('resize', czArrows);
    document.addEventListener('change', (e) => { if (e.target.id === 'savefile' && e.target.files[0]) loadSaveFile(e.target.files[0]); });
    document.addEventListener('change', (e) => {
      const k = e.target.dataset.filter;
      if (!k) return;
      ui.filter[k] = e.target.value;
      ui.refresh();
    });
    function refocus(k) { const f = document.querySelector(`[data-search="${k}"]`); if (f) { f.focus(); const n = f.value.length; f.setSelectionRange(n, n); } }

    const cv = $('#map');
    let down = null;
    // Touch only: two fingers pinch to zoom and pan with their midpoint; while placing, the ghost stays put until a tap
    // moves it or a finger drags it (see touchGhost). Mouse input never takes these paths.
    const pts = new Map();
    let pinch = null;
    const pinchState = () => { const [a, b] = [...pts.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
    const placingNow = () => ui.placing || ui.moving;
    const onGhost = (t) => { const h = Render.hover, [w, hh] = FS.buildings[Render.ghost].size; return h && t.x >= h.x && t.x < h.x + w && t.y >= h.y && t.y < h.y + hh; };
    cv.addEventListener('pointerdown', (e) => {
      const touch = e.pointerType === 'touch';
      if (touch) {
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pts.size >= 2) { cv.setPointerCapture(e.pointerId); pinch = pinchState(); down = null; return; }
      }
      down = { x: e.clientX, y: e.clientY, cx: Render.cam.x, cy: Render.cam.y, drag: false, btn: e.button };
      // On a set-down blueprint, pressing on one of its buildings picks that building up instead of panning.
      if (ui.bp && ui.bp.pinned && e.button === 0) {
        const rect = cv.getBoundingClientRect(), t = Render.screenToTile(e.clientX - rect.left, e.clientY - rect.top), k = bpItemAt(t);
        if (k >= 0) { const bi = ui.bp.items[k]; down.bp = { k, ox: t.x - bi.x, oy: t.y - bi.y }; }
      }
      // A finger set down on the ghost drags the ghost instead of panning the map.
      if (touch && placingNow()) {
        const rect = cv.getBoundingClientRect(), t = Render.screenToTile(e.clientX - rect.left, e.clientY - rect.top);
        if (onGhost(t)) down.ghost = { ox: t.x - Render.hover.x, oy: t.y - Render.hover.y };
      }
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', (e) => {
      const touch = e.pointerType === 'touch', rect = cv.getBoundingClientRect();
      if (touch && pts.has(e.pointerId)) {
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pinch) {
          if (pts.size < 2) return;
          const p = pinchState();
          Render.cam.x -= (p.x - pinch.x) / Render.cam.z; Render.cam.y -= (p.y - pinch.y) / Render.cam.z;
          Render.zoomAt(p.x - rect.left, p.y - rect.top, p.d / pinch.d);
          pinch = p;
          return;
        }
      }
      Render.mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const t = Render.screenToTile(e.clientX - rect.left, e.clientY - rect.top);
      if (touch && placingNow()) {
        if (down && down.ghost) {
          if (!down.drag && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) down.drag = true;
          const h = Render.hover, nx = t.x - down.ghost.ox, ny = t.y - down.ghost.oy;
          if (down.drag && (h.x !== nx || h.y !== ny)) { Render.hover = { x: nx, y: ny }; touchBar(); }
          return;
        }
      } else Render.hover = t;
      if (down && down.btn === 0) {
        const dx = e.clientX - down.x, dy = e.clientY - down.y;
        if (!down.drag && Math.hypot(dx, dy) > 5) down.drag = true;
        if (down.drag && down.bp && ui.bp) {
          const bi = ui.bp.items[down.bp.k], nx = t.x - down.bp.ox, ny = t.y - down.bp.oy;
          ui.bp.drag = down.bp.k;
          if (bi.x !== nx || bi.y !== ny) { bi.x = nx; bi.y = ny; bi.fixed = true; Game.blueprintCheck(ui.bp.items); bpBar(); }
        } else if (down.drag) { Render.cam.x = down.cx - dx / Render.cam.z; Render.cam.y = down.cy - dy / Render.cam.z; Render.clampCam(); }
      }
      if (touch) { $('#hoverinfo').hidden = true; return; } // no hover on a touch screen: a tap sets the blueprint down
      if (ui.bp && !ui.bp.pinned && Render.hover && (Render.hover.x !== ui.bp.ax || Render.hover.y !== ui.bp.ay)) bpFit(Render.hover.x, Render.hover.y);
      updateHoverInfo(e.clientX - rect.left, e.clientY - rect.top);
    });
    cv.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'touch' && (placingNow() || document.body.classList.contains('bb-open'))) return; // the lifted finger leaves; the ghost (or the spot the build menu is for) stays marked
      Render.hover = null; Render.mouse = null; $('#hoverinfo').hidden = true;
    });
    cv.addEventListener('pointercancel', (e) => { if (e.pointerType === 'touch') { pts.delete(e.pointerId); pinch = null; down = null; } });
    cv.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch') {
        pts.delete(e.pointerId);
        if (pinch) { if (pts.size < 2) pinch = null; down = null; return; }
      }
      if (!down) return;
      const wasDrag = down.drag, btn = down.btn, held = down.bp, grabbed = down.ghost;
      down = null;
      if (ui.bp) ui.bp.drag = null;
      if (wasDrag || btn !== 0) return;
      const rect = cv.getBoundingClientRect();
      const t = Render.screenToTile(e.clientX - rect.left, e.clientY - rect.top);
      if (ui.bp) {
        if (!ui.bp.pinned) { if (ui.bp.ax !== t.x || ui.bp.ay !== t.y) bpFit(t.x, t.y); ui.bp.pinned = true; SFX.play('plonk'); bpBar(); }
        else if (!held) bpFit(t.x, t.y);
        return;
      }
      // Touch: a tap on the ghost builds (or moves) it there if it fits; a tap anywhere else puts the ghost there.
      if (e.pointerType === 'touch' && placingNow()) {
        if (grabbed && !Game.canPlace(Render.ghost, Render.hover.x, Render.hover.y, Render.ghostMove)) { commitAt(Render.hover); return; }
        const [w, h] = FS.buildings[Render.ghost].size;
        Render.hover = { x: t.x - Math.floor((w - 1) / 2), y: t.y - Math.floor((h - 1) / 2) };
        touchBar();
        return;
      }
      if (placingNow()) { commitAt(t, e.shiftKey, e.clientX - rect.left, e.clientY - rect.top); return; }
      // Touch, with the build menu open: a tap on the map only closes it (or picks the building tapped).
      if (e.pointerType === 'touch' && document.body.classList.contains('bb-open')) {
        closeBuildPop();
        const ob = Game.buildingAt(t.x, t.y);
        if (ob) selectBuilding(ob.id);
        return;
      }
      // Land the farm doesn't own: its sign, or anywhere on it, offers to buy it.
      const sign = Render.signAt(e.clientX - rect.left, e.clientY - rect.top);
      if (sign || (Game.plotAt(t.x, t.y) >= 0 && !Game.owns(t.x, t.y))) {
        selectBuilding(null);
        buyLand(sign ? sign.k : Game.plotAt(t.x, t.y));
        return;
      }
      const b = Game.buildingAt(t.x, t.y);
      // Touch: a tap on empty ground of your own land opens the build menu for that spot.
      if (e.pointerType === 'touch' && touchMenu() && !b) { selectBuilding(null); openBuildPop(t, e.clientY); return; }
      ui.search.recipe = '';
      selectBuilding(b ? b.id : null);
    });
    // Build or move what is being placed at tile t. Shift (mouse) keeps placing more of the same; px, py place the hover box.
    function commitAt(t, keep, px, py) {
      const info = () => { if (px != null) updateHoverInfo(px, py); };
      if (ui.moving) {
        const id = ui.moving;
        const mb = Game.S.buildings.find((x) => x.id === id);
        if (!mb || (mb.x === t.x && mb.y === t.y)) { cancelPlacing(); selectBuilding(id); return; }
        if (Game.move(id, t.x, t.y)) { SFX.play('move'); cancelPlacing(); selectBuilding(id); info(); }
        return;
      }
      const b = Game.place(ui.placing, t.x, t.y);
      if (b) {
        SFX.play('plonk');
        if (ui.placingRecipe) Game.setRecipe(b.id, ui.placingRecipe);
        if (!keep) { cancelPlacing(); selectBuilding(b.id); info(); }
      }
    }
    ui.commitAt = commitAt;
    function buyLand(k) {
      if (!Game.plotBuyable(k)) { SFX.play('error'); toast('That land is too far away: buy the land next to your farm first.', 'bad'); return; }
      const cost = Game.landCost();
      if (Game.S.money < cost) { SFX.play('error'); toast(`This land costs 💰${cost.toLocaleString('en')}. You have 💰${Math.floor(Game.S.money).toLocaleString('en')}.`, 'bad'); return; }
      if (confirm(`Buy this land for ${cost.toLocaleString('en')} coins?\n\nIt is as big as your starting farm. Each plot costs more than the last: the next one will be ${Game.landCost(Game.S.land.length + 1).toLocaleString('en')}.`)) Game.buyLand(k);
    }
    cv.addEventListener('contextmenu', (e) => { e.preventDefault(); cancelPlacing(); });
    cv.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      Render.zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.12 : 1 / 1.12);
    }, { passive: false });
    const keys = {};
    const SHORTCUTS = { l: 'buildings', j: 'journal', i: 'warehouse', m: 'market', k: 'testkitchen', b: 'cookbook', x: 'codex', o: 'orders', g: 'goals', p: 'cuisines', u: 'academy', t: 'town' };
    window.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select')) {
        if (e.key === 'Escape' && ui.modal) { e.target.blur(); closeModal(); }
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.getElementById('finale')) { if (e.key === 'Escape') ui.closeFinale(); return; }
      if (document.getElementById('discovery')) { if (e.key === 'Escape') ui.closeDiscovery(); return; }
      if (e.key === 'Escape' && ui.dd) { ui.dd = null; ui.refresh(); return; }
      if (ui.bp && (e.key === 'r' || e.key === 'R')) { act('bp-rotate'); return; }
      if (ui.bp && e.key === 'Enter') { act('bp-build'); return; }
      if (e.key === 'Escape') { if (ui.placing || ui.moving || ui.bp) cancelPlacing(); else if (ui.modal) closeModal(); else if (ui.townMode) ui.setTown(false); else selectBuilding(null); }
      if (e.key === 'f' || e.key === 'F') Render.flows = !Render.flows;
      if (e.key === 'n' || e.key === 'N') act('sound');
      const sc = SHORTCUTS[e.key.toLowerCase()];
      if (sc === 'town' && !document.getElementById('easter')) { if (ui.modal === 'town') closeModal(); else { if (ui.modal) closeModal(); ui.setTown(!ui.townMode); } }
      else if (sc && !document.getElementById('easter')) { if (ui.modal === (sc === 'warehouse' ? 'market' : sc)) closeModal(); else openModal(sc); }
      // Space pauses, and resumes at the speed you had before.
      if (e.key === ' ') { const S = Game.S; if (S.speed) { ui.lastSpeed = S.speed; S.speed = 0; } else S.speed = ui.lastSpeed || 1; e.preventDefault(); }
      keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
    ui.keys = keys;
  }

  function updateHoverInfo(px, py) {
    const box = $('#hoverinfo');
    const t = Render.hover;
    if (ui.bp) {
      const k = bpItemAt(t), bi = ui.bp.items[k];
      box.hidden = !t;
      box.innerHTML = bi ? `${FSI.img('b_' + bi.type)} ${esc(FS.buildings[bi.type].name)} · makes ${esc(it(FS.recipeById[bi.rid].primary).name)}` + (bi.rate ? ` at ${Math.round(bi.rate * 100)}%` : '') + (bi.err ? `\n❌ ${esc(bi.err)}` : '') + (ui.bp.pinned ? '\nDrag to move it' : '')
        : ui.bp.pinned ? 'Click to move the whole blueprint here' : 'Click to set the blueprint down here';
      box.style.left = px + 16 + 'px'; box.style.top = py + 16 + 'px';
      return;
    }
    if (!t || ui.placing || ui.moving) {
      if (ui.moving && t) {
        const mb = Game.S.buildings.find((x) => x.id === ui.moving);
        const err = mb && Game.canPlace(mb.type, t.x, t.y, mb.id);
        box.hidden = !mb; if (mb) box.textContent = err ? '❌ ' + err : `✅ Move ${FS.buildings[mb.type].name} here (💰${Game.moveCost(mb.type)})` + proxHint(mb.type, t.x, t.y, mb.recipe, mb.id);
        box.style.left = px + 16 + 'px'; box.style.top = py + 16 + 'px';
      } else if (ui.placing && t) {
        const err = Game.canPlace(ui.placing, t.x, t.y);
        box.hidden = false; box.textContent = (err ? '❌ ' + err : `✅ Build ${FS.buildings[ui.placing].name} (💰${FS.buildings[ui.placing].cost})`) + (err === 'Tile is occupied' || err === 'Out of bounds' ? '' : proxHint(ui.placing, t.x, t.y, ui.placingRecipe, 0));
        box.style.left = px + 16 + 'px'; box.style.top = py + 16 + 'px';
      } else box.hidden = true;
      return;
    }
    const b = Game.buildingAt(t.x, t.y);
    let text;
    if (b) {
      const r = FS.recipeById[b.recipe];
      text = `${FS.buildings[b.type].name}` + (r ? ` · ${it(r.primary).name}` : '') +
        (b.status === 'missing' && !b.running ? ` · needs ${b.missing.map((m) => it(m).name).join(', ')}` : '');
    } else {
      const tile = Game.tileAt(t.x, t.y), k = Game.plotAt(t.x, t.y);
      text = ['Grassland', 'Water', 'Forest', 'Rocky ground', 'Sand'][tile] || '';
      if (k >= 0 && !Game.owns(t.x, t.y)) text += Game.plotBuyable(k) ? ` · not your land yet: click to buy it (💰${Game.landCost().toLocaleString('en')})` : ' · not your land, too far away to buy yet';
    }
    box.hidden = !text;
    box.innerHTML = (b ? FSI.img('b_' + b.type) + ' ' : '') + esc(text);
    if (!b) { box.style.left = px + 16 + 'px'; box.style.top = py + 16 + 'px'; return; }
    // A building's label sits just above it (below it at the top edge), so it never covers the building or its neighbours.
    const [w, h] = FS.buildings[b.type].size, z = Render.cam.z, TS = Render.TS;
    const cx = ((b.x + w / 2) * TS - Render.cam.x) * z, top = (b.y * TS - Render.cam.y) * z, bottom = ((b.y + h) * TS - Render.cam.y) * z;
    const bw = box.offsetWidth, bh = box.offsetHeight, vw = Render.viewW();
    box.style.left = Math.max(4, Math.min(vw - bw - 4, cx - bw / 2)) + 'px';
    box.style.top = (top - bh - 6 >= 4 ? top - bh - 6 : bottom + 6) + 'px';
  }

  // =================== SVG ICONS ===================
  // Interface emoji (FSI.uiList) are swapped for SVG icons wherever they appear in page text, so the
  // game looks the same on every OS. Items and buildings use FSI.img(id) directly.
  const uiIcon = {};
  for (const [id, e] of FSI.uiList) { const k = e.replace(/️/g, ''); if (!uiIcon[k]) uiIcon[k] = id; }
  for (const [e, id] of FSI.uiAlias || []) uiIcon[e.replace(/️/g, '')] = id;
  const uiRe = new RegExp('(' + Object.keys(uiIcon).sort((a, b) => b.length - a.length)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')️?', 'gu');
  const SKIP = /^(OPTION|TEXTAREA|SCRIPT|STYLE|TITLE)$/;
  function iconizeText(t) {
    if (!t.parentNode || SKIP.test(t.parentNode.nodeName)) return;
    if (t.parentNode.closest && t.parentNode.closest('svg')) return; // an <img> can't show inside SVG text: the Town map draws its own icons
    uiRe.lastIndex = 0;
    if (!uiRe.test(t.nodeValue)) return;
    const tpl = document.createElement('template');
    tpl.innerHTML = esc(t.nodeValue).replace(uiRe, (m, k) => FSI.img(uiIcon[k.replace(/️/g, '')]));
    t.replaceWith(tpl.content);
  }
  function iconize(node) {
    if (node.nodeType === 3) return iconizeText(node);
    if (node.nodeType !== 1) return;
    const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const list = [];
    while (w.nextNode()) list.push(w.currentNode);
    list.forEach(iconizeText);
  }
  function watchIcons() {
    iconize(document.body);
    new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'characterData') iconizeText(m.target);
        else m.addedNodes.forEach(iconize);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  // =================== EASTER EGG ===================
  // Tarte flambée is the dish that inspired Root of All Dishes: discovering it fires a wood-oven celebration.
  function easterEgg(id) {
    const prevSpeed = Game.S.speed, c = FS.complexity(id);
    Game.S.speed = 0;
    SFX.play('secret');
    const el = document.createElement('div');
    el.id = 'easter';
    el.innerHTML = `<canvas></canvas><div class="egg-card" role="dialog" aria-labelledby="egg-title">
      <div class="egg-dish">${FSI.img(id)}</div>
      <p class="egg-kicker">Secret dish found</p>
      <h2 id="egg-title">Flammekueche!</h2>
      <p>This is the dish that started it all: Root of All Dishes was dreamed up over a tarte flambée.</p>
      <p class="muted">In Alsace, farmers slid it onto the embers of the wood-fired bread oven. If it baked in two minutes, the oven was hot enough for the loaves. Behind this one flatbread stand ${c.rawCount} raw ingredients, ${c.steps} processing steps and ${c.buildings} kinds of buildings.</p>
      <div class="egg-reward"><span>💰 +${money(Game.SPECIAL.bonus)}</span><span>${FSI.img(id)} Now your house speciality: sells for ${Math.round((Game.SPECIAL.priceMult - 1) * 100)}% more</span></div>
      <button class="primary" data-egg-close>Back to the farm</button></div>`;
    document.body.appendChild(el);
    const cv = el.querySelector('canvas'), g = cv.getContext('2d');
    const still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const parts = [];
    let raf = 0, last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const W = (cv.width = innerWidth), H = (cv.height = innerHeight);
      for (let k = 0; k < 6; k++) parts.push({ x: Math.random() * W, y: H + 10, vx: (Math.random() - 0.5) * 30, vy: -(90 + Math.random() * 160), r: 8 + Math.random() * 22, t: 0, life: 1.4 + Math.random() * 1.6, ember: Math.random() < 0.2 });
      g.globalCompositeOperation = 'lighter';
      for (const p of parts) {
        p.t += dt; p.x += p.vx * dt + Math.sin(p.t * 6 + p.r) * 0.6; p.y += p.vy * dt;
        const f = 1 - p.t / p.life;
        if (f <= 0) continue;
        if (p.ember) { g.fillStyle = `rgba(255,${200 + 55 * f | 0},120,${f})`; g.fillRect(p.x, p.y, 2.5, 2.5); continue; }
        const rad = p.r * (0.4 + f);
        const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
        gr.addColorStop(0, `rgba(255,${180 + 60 * f | 0},80,${0.55 * f})`);
        gr.addColorStop(1, 'rgba(200,40,0,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, rad, 0, Math.PI * 2); g.fill();
      }
      for (let k = parts.length - 1; k >= 0; k--) if (parts[k].t >= parts[k].life) parts.splice(k, 1);
      raf = requestAnimationFrame(frame);
    }
    if (!still) raf = requestAnimationFrame(frame);
    el.querySelector('[data-egg-close]').addEventListener('click', () => {
      cancelAnimationFrame(raf); el.remove(); Game.S.speed = prevSpeed;
    });
  }

  // =================== THE FINALE ===================
  // Winning the Legacy gets a full-screen finale: every discovered dish swirls in around a starry restaurant,
  // with the farm's money and toques piled up beside it. It can be watched again from the Town Guide.
  function finaleScene(dishes) {
    const C = FSI.C, INK = `stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;
    const img = (id, x, y, s, cls = '') => `<image ${cls ? `class="${cls}" ` : ''}href="${FSI.dataURL(id)}" x="${x}" y="${y}" width="${s}" height="${s}"/>`;
    const star = (cx, cy, r) => {
      let p = '';
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; p += `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)} `; }
      return `<polygon points="${p}" fill="${C.yellow}" ${INK}/>`;
    };
    // Five stars in an arch over the roof, popping in one after another.
    const stars = [0, 1, 2, 3, 4].map((k) => {
      const a = Math.PI * (0.78 - k * 0.14), x = 360 + 150 * Math.cos(a), y = 118 - 70 * Math.sin(a);
      return `<g class="fn-star" style="animation-delay:${2.8 + k * 0.3}s">${star(x, y, k === 2 ? 22 : 18)}</g>`;
    }).join('');
    // The restaurant: a cream facade, a red roof, a striped awning and three glowing windows.
    const awning = Array.from({ length: 12 }, (_, k) => `<path d="M${240 + k * 20} 168 h20 v18 a10 8 0 0 1 -20 0 z" fill="${k % 2 ? C.creamL : C.red}" ${INK}/>`).join('');
    const windows = [262, 335, 408].map((x, k) => k === 1
      ? `<path d="M${x} 250 v-50 a25 25 0 0 1 50 0 v50 z" fill="${C.brownD}" ${INK}/><path d="M${x + 6} 250 v-46 a19 19 0 0 1 38 0 v46 z" fill="${C.yellowL}" class="fn-glow"/><circle cx="${x + 38}" cy="228" r="2.5" fill="${C.ink}"/>`
      : `<path d="M${x} 236 v-36 a25 25 0 0 1 50 0 v36 z" fill="${C.yellowL}" ${INK} class="fn-glow"/><path d="M${x + 25} 176 v60 M${x} 214 h50" stroke="${C.brownD}" stroke-width="2"/>`).join('');
    const building = `<path d="M222 132 L360 72 L498 132 z" fill="${C.redD}" ${INK}/>
      <rect x="236" y="128" width="248" height="124" fill="${C.cream}" ${INK}/>
      <rect x="262" y="96" width="196" height="30" rx="6" fill="${C.pine}" ${INK}/>
      <text x="360" y="117" class="fn-sign" textLength="180" lengthAdjust="spacingAndGlyphs">ROOT OF ALL DISHES</text>
      ${windows}${awning}
      <rect x="470" y="100" width="14" height="30" fill="${C.brownL}" ${INK}/><circle class="fn-smoke" cx="477" cy="92" r="6"/><circle class="fn-smoke s2" cx="477" cy="92" r="5"/>`;
    // String lights from the roof to two posts.
    const bulbs = (x1, y1, x2, y2, sag, n, off) => {
      let s = `<path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}" stroke="${C.ink}" stroke-width="1.5" fill="none"/>`;
      for (let k = 1; k < n; k++) {
        const t = k / n, x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * (x1 + x2) / 2 + t * t * x2, y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * ((y1 + y2) / 2 + sag) + t * t * y2;
        s += `<circle class="fn-bulb" style="animation-delay:${((k + off) % 4) * 0.35}s" cx="${x.toFixed(1)}" cy="${(y + 4).toFixed(1)}" r="4" fill="${[C.yellow, C.orangeL, C.redL, C.yellowL][(k + off) % 4]}" stroke="${C.ink}" stroke-width="1.2"/>`;
      }
      return s;
    };
    const lights = `<rect x="128" y="160" width="6" height="110" fill="${C.brownD}"/><rect x="586" y="160" width="6" height="110" fill="${C.brownD}"/>
      ${bulbs(131, 162, 238, 140, 26, 7, 0)}${bulbs(482, 140, 589, 162, 26, 7, 2)}`;
    // Guests at three tables, two of them cheering, each with a dish you discovered.
    const skins = ['#f3c9a0', '#d9a074', '#a86b44', '#7a4a2c', '#f6d7b8', '#c48a5c'];
    const shirts = [C.blue, C.purple, C.teal, C.orange, C.pink, C.leaf];
    const person = (x, k, cheer) => {
      const sk = skins[k % skins.length], sh = shirts[k % shirts.length], y = 262;
      return `<g class="${cheer ? 'fn-cheer' : 'fn-chat'}" style="animation-delay:${(k % 3) * 0.3}s">
        ${cheer ? `<path d="M${x - 8} ${y - 18} l-8 -16 M${x + 8} ${y - 18} l8 -16" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/><path d="M${x - 8} ${y - 18} l-8 -16 M${x + 8} ${y - 18} l8 -16" stroke="${sk}" stroke-width="4" stroke-linecap="round"/>` : ''}
        <path d="M${x - 11} ${y} q0 -24 11 -24 q11 0 11 24 z" fill="${sh}" ${INK}/>
        <circle cx="${x}" cy="${y - 32}" r="9" fill="${sk}" ${INK}/></g>`;
    };
    const tables = [[178, 0], [360, 2], [542, 4]].map(([x, k], t) => {
      const plate = dishes.length ? dishes[(t * 97 + 13) % dishes.length] : null;
      return `${person(x - 26, k, t !== 1)}${person(x + 26, k + 1, t === 1)}
        <rect x="${x - 3}" y="266" width="6" height="22" fill="${C.brownD}" ${INK}/>
        <ellipse cx="${x}" cy="266" rx="40" ry="9" fill="${C.creamL}" ${INK}/>
        ${plate ? img(plate, x - 15, 238, 30, 'fn-plate') : ''}`;
    }).join('');
    // The money pile: stacks of coins on a heap, a bag on top, and a few coins still dropping.
    const coin = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="15" ry="5" fill="${C.yellow}" ${INK} stroke-width="1.6"/>`;
    let coins = '';
    [[40, 7], [72, 11], [104, 8], [56, 4], [88, 5]].forEach(([x, n], s) => {
      const base = s > 2 ? 268 : 284;
      for (let k = 0; k < n; k++) coins += coin(x, base - k * 6);
    });
    const heap = `<path d="M8 292 Q70 236 136 292 z" fill="${C.yellowD}" ${INK}/>${coins}${img('ui_money', 52, 192, 40, 'fn-bag')}
      ${[30, 66, 98, 118].map((x, k) => `<g class="fn-drop" style="animation-delay:${3.6 + k * 0.55}s">${coin(x, 200)}</g>`).join('')}`;
    // The toque pile: a pyramid of chef's hats.
    let toques = '';
    [[4, 0], [3, 1], [2, 2], [1, 3]].forEach(([n, row]) => {
      for (let k = 0; k < n; k++) toques += img('ui_toque', 590 + row * 15 + k * 30, 254 - row * 26, 34, 'fn-toque');
    });
    return `<svg class="fn-scene" viewBox="0 0 720 300" aria-hidden="true">
      <ellipse cx="360" cy="290" rx="356" ry="16" fill="rgba(0,0,0,0.25)"/>
      ${lights}${building}${stars}${tables}${heap}${toques}</svg>`;
  }
  // The finale plays out in steps, timed to its music: kicker and title (0.3-1.8 s, first confetti shower), the
  // restaurant (2.1 s), its stars one by one (2.8-4 s, confetti cannons from both bottom corners as the last one
  // lands), the dishes flying in (from 3.4 s), coins and toques (4.2 s), the numbers counting up (5 s), the button
  // (7 s), and a gentle confetti rain from then on.
  function finaleConfetti() {
    const piece = (cls, k, style) => `<i class="${cls}" style="--r:${(k * 47) % 360}deg;${style}"></i>`;
    const shower = Array.from({ length: 90 }, (_, k) => piece('fc-fall', k, `left:${(k * 37) % 100}%;--d:${(0.8 + (k % 11) * 0.09).toFixed(2)}s;--t:${(2.6 + (k % 7) * 0.35).toFixed(2)}s;--n:1`));
    const cannon = (side) => Array.from({ length: 55 }, (_, k) => {
      const a = (20 + (k * 29) % 50) * Math.PI / 180, v = 45 + (k * 17) % 45; // launch angle from the floor and power (vh)
      return piece('fc-shot', k, `${side}:0;--x:${(side === 'left' ? 1 : -1) * Math.cos(a) * v}vh;--y:${-Math.sin(a) * v}vh;--d:${(4 + (k % 9) * 0.03).toFixed(2)}s;--t:${(2.4 + (k % 5) * 0.3).toFixed(2)}s`);
    });
    const rain = Array.from({ length: 50 }, (_, k) => piece('fc-fall', k, `left:${(k * 53 + 11) % 100}%;--d:${(7 + (k * 0.17) % 5).toFixed(2)}s;--t:${(4.5 + (k % 7) * 0.6).toFixed(1)}s;--n:infinite`));
    return [...shower, ...cannon('left'), ...cannon('right'), ...rain].join('');
  }
  ui.finale = function () {
    if (document.getElementById('finale')) return;
    const S = Game.S, W = window.innerWidth, H = window.innerHeight;
    const dishes = FS.dishList.filter((d) => S.discovered[d.id] && FSI.has(d.id)).map((d) => d.id);
    const prevSpeed = S.speed;
    S.speed = 0;
    SFX.play('legacy');
    SFX.setMusicScene('finale');
    const guests = Game.restaurants().reduce((n, r) => n + (r.served || 0), 0);
    const days = Game.dayOf(S.legacyWon || S.time) + 1;
    const stat = (icon, val, label, count) => `<div class="fn-stat">${FSI.img(icon)}<b ${count ? `data-count="${Math.floor(val)}"` : ''}>${count ? 0 : val}</b><span>${label}</span></div>`;
    const el = document.createElement('div');
    el.id = 'finale';
    el.innerHTML = `<div class="fn-rays"></div><div class="fn-cloud"></div>
      <div class="fn-confetti">${finaleConfetti()}</div>
      <div class="fn-main" role="dialog" aria-labelledby="fn-title">
        <p class="fn-kicker fn-keep">${FSI.img('ui_crown')} The Legacy is yours</p>
        <h1 id="fn-title" class="fn-keep">Root of All Dishes</h1>
        <p class="fn-sub fn-keep">The whole town now eats from your farm.</p>
        <div class="fn-stage fn-keep">${finaleScene(dishes)}</div>
        <div class="fn-stats">
          ${stat('ui_money', S.money, 'in the bank', true)}
          ${stat('ui_toque', S.toques || 0, 'toques', true)}
          ${stat('ui_cookbook', `${Object.keys(S.discovered).length} / ${FS.dishList.length}`, 'dishes discovered')}
          ${guests ? stat('ui_restaurant', guests, 'guests served', true) : ''}
          ${stat('ui_time', days, days === 1 ? 'day' : 'days')}
        </div>
        <button class="primary fn-go fn-keep" data-fn="close">Keep playing</button>
      </div>`;
    document.body.appendChild(el);
    // The dish cloud: a sunflower spiral over the whole screen that keeps clear of the title, restaurant and numbers.
    const main = el.querySelector('.fn-main'), mr = main.getBoundingClientRect();
    const at = (n) => { let x = 0, y = 0; for (let p = n; p && p !== main; p = p.offsetParent) { x += p.offsetLeft; y += p.offsetTop; } return [mr.left + x, mr.top + y]; }; // untransformed, while things still fly in
    const keep = [...el.querySelectorAll('.fn-keep, .fn-stat')].map((n) => { const [x, y] = at(n); return [x - 10, y - 8, n.offsetWidth + 20, n.offsetHeight + 16]; });
    const clear = (x, y, pad) => keep.every(([l, t, w, h]) => x < l - pad || x > l + w + pad || y < t - pad || y > t + h + pad);
    const place = (gap) => {
      const out = [];
      for (let i = 0; out.length < dishes.length; i++) {
        const r = gap * Math.sqrt(i + 0.5), a = i * 2.39996, x = W / 2 + r * Math.cos(a) * 1.15, y = H / 2 + r * Math.sin(a);
        if (r > W + H) break;
        if (x > gap / 2 && x < W - gap / 2 && y > gap / 2 && y < H - gap / 2 && clear(x, y, gap * 0.4)) out.push([x, y]);
      }
      return out;
    };
    let gap = 64, pts = place(gap);
    while (pts.length < dishes.length && gap > 18) pts = place((gap -= 2));
    const size = Math.max(20, Math.min(48, gap * 0.8));
    el.style.setProperty('--sz', size.toFixed(0) + 'px');
    el.querySelector('.fn-cloud').innerHTML = pts.map(([x, y], k) => {
      const id = dishes[k], dx = W / 2 - x, dy = H / 2 - y, d = 3.4 + Math.min(3, k * 0.007);
      return `<span class="fn-dish" data-tip="${esc(it(id).name)}" style="left:${(x - size / 2).toFixed(0)}px;top:${(y - size / 2).toFixed(0)}px;--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;--d:${d.toFixed(2)}s;--f:${(3 + (k % 5) * 0.4).toFixed(1)}s">${FSI.img(id)}</span>`;
    }).join('');
    // Count the numbers up while the dishes fly in.
    const t0 = performance.now(), nums = [...el.querySelectorAll('[data-count]')];
    const step = (now) => {
      if (!el.isConnected) return;
      const p = Math.min(1, (now - t0 - 5000) / 2200), e = p <= 0 ? 0 : 1 - (1 - p) ** 3;
      for (const n of nums) n.textContent = money(+n.dataset.count * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    const close = () => { el.remove(); S.speed = prevSpeed; SFX.setMusicScene(ui.townMode ? 'town' : 'farm'); };
    ui.closeFinale = close;
    el.querySelector('[data-fn="close"]').addEventListener('click', close);
  };

  // =================== DISCOVERY CARD ===================
  // Each new dish gets a moment of its own: the dish, and the supply chain behind it drawn from land to plate.
  // Idle: no window open and nothing being placed or moved.
  const discQueue = [], idleNow = () => !ui.modal && !ui.placing && !ui.moving && !ui.bp && !ui.mouseDown;
  function discoveryCard(id, bg) {
    discQueue.push({ id, bg });
    if (discQueue.length === 1) showDiscovery();
  }
  // The road from field to plate for one item: its raw ingredients ➜ processing steps and buildings ➜ the plate.
  function chainHtml(id) {
    const c = FS.complexity(id), d = it(id);
    const raw = Object.keys(c.raw).sort((a, b) => c.raw[b] - c.raw[a]);
    const blds = [...FS.chain(id).buildings].filter((b) => b !== 'kitchen' && FS.buildings[b]);
    const MAX = 8;
    const icons = (ids, pre, title) => ids.slice(0, MAX).map((x, k) => `<span class="dc-pop" style="animation-delay:${0.25 + k * 0.07}s" title="${esc(title(x))}">${FSI.img(pre + x)}</span>`).join('')
      + (ids.length > MAX ? `<span class="dc-more">+${ids.length - MAX}</span>` : '');
    return `<div class="dc-chain">
        <div class="dc-step"><b>${c.rawCount}</b><span>raw ingredient${c.rawCount === 1 ? '' : 's'} from farms, sea and mines</span><div class="dc-icons">${icons(raw, '', (x) => it(x).name)}</div></div>
        <div class="dc-arrow">➜</div>
        <div class="dc-step"><b>${c.steps}</b><span>processing step${c.steps === 1 ? '' : 's'} · ${c.buildings} kinds of buildings, farms included</span><div class="dc-icons">${icons(blds, 'b_', (x) => FS.buildings[x].name)}</div></div>
        <div class="dc-arrow">➜</div>
        <div class="dc-step dc-plate"><b>1</b><span>${d.dish ? 'plate' : esc(d.name)}</span><div class="dc-icons"><span class="dc-pop" style="animation-delay:0.9s">${FSI.img(id)}</span></div></div>
      </div>`;
  }
  function showDiscovery() {
    const q = discQueue[0];
    if (!q) return;
    if (q.bg && !idleNow()) { setTimeout(showDiscovery, 500); return; }
    const id = q.id;
    const S = Game.S, d = it(id), c = FS.complexity(id), r = FS.dishRecipe[id];
    const prevSpeed = S.speed;
    S.speed = 0;
    SFX.play('fanfare');
    const idle = S.buildings.find((b) => b.type === 'kitchen' && !b.recipe);
    const n = Object.keys(S.discovered).length;
    const el = document.createElement('div');
    el.id = 'discovery';
    el.innerHTML = `<div class="dc-card" role="dialog" aria-labelledby="dc-title">
      <div class="dc-burst">${Array.from({ length: 14 }, (_, k) => `<i style="--a:${k * 25.7}deg;--d:${(k % 3) * 0.06}s"></i>`).join('')}</div>
      <div class="dc-dish">${FSI.img(id)}</div>
      <p class="dc-kicker">New dish discovered · ${n} / ${FS.dishList.length}</p>
      <h2 id="dc-title">${esc(d.name)}</h2>
      <p class="muted dc-cuisine">${esc(d.cuisine || '')} · ${Object.keys(r.inputs).map((i) => esc(it(i).name)).join(' + ')}</p>
      ${chainHtml(id)}
      <div class="row gap dc-btns">
        ${idle ? '<button class="primary" data-dc="cook">👨‍🍳 Cook it in your idle Kitchen</button>' : ''}
        <button data-dc="plan">🗺️ Plan production</button>
        <button ${idle ? '' : 'class="primary"'} data-dc="close">Keep going</button>
      </div></div>`;
    document.body.appendChild(el);
    const close = (then) => {
      el.remove(); S.speed = prevSpeed; discQueue.shift();
      if (then) then();
      if (discQueue.length) setTimeout(showDiscovery, 250);
      else setTimeout(flushToasts, 250);
    };
    ui.closeDiscovery = () => close();
    el.addEventListener('click', (e) => {
      const a = e.target.closest('[data-dc]');
      if (!a && e.target !== el) return;
      const k = a ? a.dataset.dc : 'close';
      if (k === 'cook') close(() => { closeModal(); Game.setRecipe(idle.id, r.id); selectBuilding(idle.id); Render.centerOn(idle.x + 1, idle.y + 1); toast(`Your Kitchen now cooks ${esc(d.name)}.`, 'good'); });
      else if (k === 'plan') close(() => act('plan', id));
      else close();
    });
    const first = el.querySelector('.dc-btns .primary');
    if (first) first.focus();
  }

  ui.init = function () {
    $('.brand').innerHTML = FSI.img('ui_logo') + `<span>Root of All Dishes</span><small class="ver" title="Game version">v${GAME_VERSION}</small>`;
    const fav = document.createElement('link'); fav.rel = 'icon'; fav.type = 'image/svg+xml'; fav.href = FSI.dataURL('ui_logo'); document.head.appendChild(fav);
    // A narrow screen wraps the top bar onto several rows: the map area starts below however tall it really is.
    const tb = $('#topbar');
    if (window.ResizeObserver) new ResizeObserver(() => document.documentElement.style.setProperty('--tb-h', Math.ceil(tb.getBoundingClientRect().height) + 'px')).observe(tb);
    watchIcons();
    soundButton();
    bindGameEvents();
    bindInput();
    bindTips();
    TownMap.bind($('#town-map'));
    Game.on('reset', () => { TownMap.sig = ''; if (ui.townMode && !Game.restaurantsUnlocked()) ui.setTown(false); else if (ui.townMode) drawTown(true); });
  };
  // Farmyard sounds: now and then an animal on a farm you can see calls out, louder the closer you zoom in,
  // from its side of the screen. More animal farms on screen make calls a little more frequent, never a din.
  // Apiaries (bees while they work) and the shore (docks and fish pens: lapping water, gulls) join in the same way.
  let animalWait = 3;
  function visiblePlaces() {
    const TILE = 32, cam = Render.cam, vw = Render.viewW() / cam.z, vh = Render.viewH() / cam.z, out = [];
    const calm = !['rain', 'storm', 'snow'].includes(Game.S.weather && Game.S.weather.kind); // bees and gulls stay in
    for (const b of Game.S.buildings) {
      const kinds = b.type === 'apiary' ? (calm && b.running && b.mult !== 0 ? ['bees'] : [])
        : b.type === 'dock' ? (calm ? ['gulls', 'water'] : ['water'])
        : b.type === 'fishfarm' ? (calm ? ['water', 'water', 'gulls'] : ['water']) : [];
      if (!kinds.length) continue;
      const [w, h] = FS.buildings[b.type].size || [1, 1];
      const cx = (b.x + w / 2) * TILE - cam.x, cy = (b.y + h / 2) * TILE - cam.y;
      if (cx < 0 || cy < 0 || cx > vw || cy > vh) continue;
      out.push({ place: kinds[Math.floor(Math.random() * kinds.length)], sx: cx / vw });
    }
    return out;
  }
  function farmyard(dt) {
    if (!Game.S.speed || ui.modal) return; // quiet while paused or reading a window
    if ((animalWait -= dt) > 0) return;
    const vis = Render.visibleAnimals().concat(visiblePlaces());
    animalWait = vis.length ? (2.5 + Math.random() * 5) / Math.min(3, Math.sqrt(vis.length)) : 2;
    if (!vis.length) return;
    const a = vis[Math.floor(Math.random() * vis.length)];
    const near = Math.max(0, Math.min(1, (Render.cam.z - 0.4) / (2.5 - 0.4)));
    if (a.place) SFX.place(a.place, near, (a.sx * 2 - 1) * 0.85);
    else SFX.animal(a.animal, near, (a.sx * 2 - 1) * 0.85);
  }
  // In the Town: water lapping at the harbour now and then, for the boats. No farm animals, bees or gulls.
  function townWater(dt) {
    if (!Game.S.speed || ui.modal) return;
    if ((animalWait -= dt) > 0) return;
    animalWait = 4 + Math.random() * 6;
    const near = Math.max(0, Math.min(1, (TownMap.cam.z - 0.5) / (2.5 - 0.5)));
    SFX.place('water', near, (Math.random() * 2 - 1) * 0.6);
  }
  ui.frame = function (dt, now) {
    updateTopbar();
    const wk = Game.S.weather && Game.S.weather.kind;
    SFX.setAmbient(wk === 'storm' && Game.seasonIndex() === 3 ? 'blizzard' : wk, Game.season().id);
    if (ui.townMode) townWater(dt); else farmyard(dt);
    const k = ui.keys || {};
    const sp = (500 * dt) / (ui.townMode ? TownMap.cam.z : Render.cam.z);
    if (ui.townMode) { const dx = (k.arrowright || k.d ? sp : 0) - (k.arrowleft || k.a ? sp : 0), dy = (k.arrowdown || k.s ? sp : 0) - (k.arrowup || k.w ? sp : 0); if (dx || dy) TownMap.pan(dx, dy); }
    else if (k.arrowleft || k.a) Render.cam.x -= sp;
    if (!ui.townMode) {
      if (k.arrowright || k.d) Render.cam.x += sp;
      if (k.arrowup || k.w) Render.cam.y -= sp;
      if (k.arrowdown || k.s) Render.cam.y += sp;
      if (k.arrowleft || k.a || k.arrowright || k.d || k.arrowup || k.w || k.arrowdown || k.s) Render.clampCam();
    }
    if (now - ui.lastLive > 250) {
      ui.lastLive = now;
      updateInspectorLive();
      if (document.body.classList.contains('touch-placing')) touchBar(); // money may have come in (or gone out)
      // The Academy panel has no live block: redraw it when a chef's progress moves on.
      const sb = Render.selected && Game.S.buildings.find((x) => x.id === Render.selected);
      if (sb && sb.type === 'academy' && !ui.mouseDown) {
        const sig = Game.chefs().map((c) => c.dish + ':' + chefPct(c)).join();
        if (sig !== ui.acSig) { ui.acSig = sig; renderInspector(); }
      }
    }
    if (ui.townMode) townFrame(dt, now);
    if (ui.modal && now - ui.lastModal > 1000 && !ui.mouseDown && ['market', 'orders', 'goals', 'testkitchen', 'academy'].includes(ui.modal)) {
      ui.lastModal = now;
      const ae = document.activeElement;
      const sig = ui.modal === 'academy' ? Game.chefs().map(chefPct).join() + '|' + (Game.S.toques || 0) + '|' + Game.dayOf()
        : JSON.stringify(Game.S.inv) + Math.floor(Game.S.money) + (Game.S.toques || 0) + (ui.modal === 'orders' ? Math.floor(Game.S.time) : '');
      if (sig !== ui.lastSig && !(ae && (ae.tagName === 'SELECT' || ae.type === 'number'))) { ui.lastSig = sig; ui.refresh(); }
    }
  };
})();
