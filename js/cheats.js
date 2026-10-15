// Debug cheat console. Open and close it with the key left of 1 (` on US keyboards, § on Swiss/German ones), or on a
// touch screen by holding a finger on the logo and version at the top left.
// Type "help" for the commands. Overrides live in Game.cheat and are not saved.
(function () {
  'use strict';
  const SEASON_ALIAS = { fall: 'autumn' };
  const COMMANDS = {
    help: { usage: 'help', about: 'List the commands', run: help },
    season: { usage: 'season <spring|summer|autumn|winter|off>', about: 'Force the season (off = follow the calendar again)', run: season },
    weather: { usage: 'weather <' + Object.keys(Game.WEATHER).join('|') + '|off>', about: 'Force the weather until turned off (off = random spells again)', run: weather },
    light: { usage: 'light <morning|noon|dusk|night|0-24|off>', about: 'Show the map at a time of day (looks only; off = follow the clock)', run: light },
    land: { usage: 'land all', about: 'Own the whole 5 x 5 world for free (this one is saved)', run: land },
    money: { usage: 'money <amount>', about: 'Add money (a negative amount takes some away)', run: money },
    recipes: { usage: 'recipes <all|hide>', about: 'Reveal every dish in the Cookbook (hide = take back only what the console revealed; saved)', run: recipes },
    order: { usage: 'order <plain|bulk|special|regular|clue|contract|event|menu|supply|seasonal>', about: 'Bring in an order of that kind now (if one can be made)', run: order },
    stage: { usage: 'stage <A|B|C|D|E>', about: 'Finish every stage up to this one and open its cuisines (saved)', run: stage },
    toques: { usage: 'toques <amount>', about: 'Add toques (saved)', run: toques },
    chefs: { usage: 'chefs', about: 'Make every Academy chef reveal their next ingredient now', run: chefs },
    guests: { usage: 'guests <n>', about: 'Seat n guests at every restaurant in Town right now (saved)', run: guests },
    critic: { usage: 'critic <now|plan>', about: 'Bring all three food critics now (now), or announce a new year\'s visits (plan)', run: criticCmd },
    rival: { usage: 'rival <' + Game.RIVALS.map((x) => x.id).join('|') + '> <rating>', about: 'Set a rival\'s rating (saved)', run: rivalCmd },
    stock: { usage: 'stock', about: 'Put 20 freshly cooked plates of every restaurant menu dish in the warehouse (saved)', run: stock },
    signature: { usage: 'signature [reveal|make]', about: 'Reveal the current stage\'s Signature Dishes (reaches every cuisine\'s target), or make them all (completes the stage)', run: signature },
    target: { usage: 'target [cuisine]', about: 'Show the splash for a cuisine reaching its target (looks only; default: the newest open cuisine)', run: target },
    milestone: { usage: 'milestone [dish25|dish50|dish100|dish200|dishall|choc|complex|gold [cuisine]]', about: 'Show a milestone card (looks only, nothing is paid; gold = a cuisine with every dish cooked)', run: milestone },
    skill: { usage: 'skill <' + Game.SKILLS.map((k) => k.id).join('|') + '>', about: 'Show the splash for a new Test Kitchen detective skill (looks only)', run: skillCmd },
    finale: { usage: 'finale', about: 'Show the end screen of the Legacy (looks only, nothing is won)', run: () => UI.finale() },
    win: { usage: 'win', about: 'Win the game: finish every stage, take gold from all three critics, buy out Crestwell; the Legacy completes and the finale plays (saved)', run: win },
    clear: { usage: 'clear', about: 'Remove all overrides and hide the dishes the console revealed', run: clear },
    status: { usage: 'status', about: 'Show the current season, weather and overrides', run: status },
    cls: { usage: 'cls', about: 'Empty this console', run: () => { log.textContent = ''; } },
  };

  const box = document.createElement('div');
  box.id = 'cheat-console';
  box.hidden = true;
  box.innerHTML = '<div class="cc-log"></div><div class="cc-row"><span>&gt;</span><input type="text" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" enterkeyhint="go" aria-label="Cheat command"><button class="cc-close" type="button" aria-label="Close">✕</button></div>';
  document.body.appendChild(box);
  const log = box.querySelector('.cc-log'), input = box.querySelector('input');
  const history = [];
  let histPos = 0;

  function print(text, cls) {
    const line = document.createElement('div');
    if (cls) line.className = cls;
    line.textContent = text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }
  // Several results in one go: one line each, so long lists do not wrap into one block.
  function printList(head, items, cls) {
    if (head) print(head, cls);
    for (const it of items) print('· ' + it, (cls ? cls + ' ' : '') + 'item');
  }
  // Two columns: the command with its arguments, and what it does. Alternatives may break after each |.
  function help() {
    const grid = document.createElement('div');
    grid.className = 'cc-help';
    for (const c of Object.values(COMMANDS)) {
      const u = document.createElement('div'), a = document.createElement('div');
      u.className = 'use';
      c.usage.split('|').forEach((part, i, all) => { u.append(part + (i < all.length - 1 ? '|' : '')); if (i < all.length - 1) u.append(document.createElement('wbr')); });
      a.textContent = c.about;
      grid.append(u, a);
    }
    print('Commands:');
    log.appendChild(grid);
    log.scrollTop = log.scrollHeight;
  }
  function season(arg) {
    if (!arg) return status();
    if (arg === 'off') { Game.setSeasonOverride(null); return print(`Season follows the calendar again: ${Game.season().name}.`); }
    const id = SEASON_ALIAS[arg] || arg, si = Game.SEASONS.findIndex((s) => s.id === id);
    if (si < 0) return print(`Unknown season "${arg}". Try ${COMMANDS.season.usage}.`, 'err');
    Game.setSeasonOverride(si);
    print(`Season forced to ${Game.SEASONS[si].name}.`);
  }
  function weather(arg) {
    if (!arg) return status();
    if (arg === 'off') { Game.setWeatherOverride(null); return print(`Weather is random again; now ${Game.weather().name} for about ${Math.round(Game.weatherLeft() / Game.HOUR)} hours.`); }
    if (!Game.WEATHER[arg]) return print(`Unknown weather "${arg}". Try ${COMMANDS.weather.usage}.`, 'err');
    Game.setWeatherOverride(arg);
    print(`Weather forced to ${Game.WEATHER[arg].name}.`);
  }
  const LIGHT = { morning: 4.5, dawn: 3.5, noon: 12, day: 12, dusk: 20, evening: 20, night: 0, midnight: 0 };
  function light(arg) {
    if (!arg) return status();
    if (arg === 'off') { Game.cheat.hour = null; return print('Daylight follows the clock again.'); }
    const h = arg in LIGHT ? LIGHT[arg] : parseFloat(arg);
    if (!(h >= 0 && h <= 24)) return print(`Unknown time "${arg}". Try ${COMMANDS.light.usage}.`, 'err');
    Game.cheat.hour = h % 24;
    print(`Daylight forced to ${String(Math.floor(h % 24)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}.`);
  }
  function land(arg) {
    if (arg !== 'all') return print(`Your farm owns ${Game.S.land.length} of ${Game.PLOTS * Game.PLOTS} plots. Try ${COMMANDS.land.usage}.`);
    Game.giveAllLand();
    print('You now own all the land.');
  }
  function money(arg) {
    const n = Math.round(parseFloat(String(arg).replace(/[',_]/g, '')));
    if (!Number.isFinite(n) || !n) return print(`Try ${COMMANDS.money.usage}, for example money 10000.`, 'err');
    Game.giveMoney(n);
    print(`${n > 0 ? 'Added' : 'Took away'} ${Math.abs(n).toLocaleString('en')}. You now have ${Math.round(Game.S.money).toLocaleString('en')}.`);
  }
  function stage(arg) {
    const id = String(arg || '').toUpperCase();
    if (!Game.cheatStage(id)) return print(`Try ${COMMANDS.stage.usage}.`, 'err');
    print(`Stages up to ${id} are done and their cuisines open. Now on ${Game.currentStage().name}.`);
  }
  function target(arg) {
    const q = FS.slug(String(arg || '')), open = FS.CUISINES.filter((c) => Game.S.cuisines[c.id]);
    const c = q ? FS.CUISINES.find((x) => x.id === q) || FS.CUISINES.find((x) => x.id.includes(q)) : open[open.length - 1];
    if (!c) return print(`No such cuisine. Try one of: ${FS.CUISINES.map((x) => x.id).join(', ')}.`, 'err');
    toggle(false);
    UI.splash('czdone:' + c.id);
  }
  function signature(arg) {
    const how = String(arg || 'reveal').trim();
    if (!['reveal', 'make'].includes(how) || !Game.cheatSig(how)) return print(`Try ${COMMANDS.signature.usage}.`, 'err');
    toggle(false);
  }
  function skillCmd(arg) {
    const k = Game.SKILLS.find((x) => x.id === String(arg || '').trim());
    if (!k) return print(`Try ${COMMANDS.skill.usage}.`, 'err');
    toggle(false);
    UI.splash('skill:' + k.id);
  }
  function milestone(arg) {
    const [id = 'dish25', cz] = String(arg || '').split(/\s+/).filter(Boolean);
    if (id === 'gold') {
      const open = FS.CUISINES.filter((c) => Game.S.cuisines[c.id]), q = FS.slug(cz || '');
      const c = q ? FS.CUISINES.find((x) => x.id === q) || FS.CUISINES.find((x) => x.id.includes(q)) : open[open.length - 1];
      if (!c) return print(`No such cuisine. Try one of: ${FS.CUISINES.map((x) => x.id).join(', ')}.`, 'err');
      toggle(false);
      return UI.splash('czgold:' + c.id);
    }
    if (!Game.goals.some((g) => g.id === id && g.splash)) return print(`Try ${COMMANDS.milestone.usage}.`, 'err');
    toggle(false);
    UI.splash('goal:' + id);
  }
  function win() {
    if (Game.S.legacyWon) return print('The Legacy is already won. Type finale to see the end screen again.', 'err');
    if (!Game.cheatLegacy()) return print('Could not complete the Legacy.', 'err');
    print('The Legacy is won.');
    toggle(false); // out of the way of the finale
  }
  function toques(arg) {
    const n = Math.round(parseFloat(arg));
    if (!Number.isFinite(n) || !n) return print(`Try ${COMMANDS.toques.usage}, for example toques 20.`, 'err');
    Game.addToques(n);
    print(`You now have ${Game.S.toques} toques.`);
  }
  function chefs() {
    const list = Game.chefs().filter((c) => c.dish);
    if (!list.length) return print('No chef is working on a dish.', 'err');
    for (const c of list) c.prog = Game.chefTime(c, c.dish);
    print(`${list.length} chef${list.length > 1 ? 's' : ''} will reveal an ingredient on the next tick (needs the Academy built and not paused).`);
  }
  function guests(arg) {
    const n = Math.min(500, Math.round(parseFloat(arg)) || 10), rs = Game.restaurants().filter((r) => r.menu.length);
    if (!rs.length) return print('No restaurant has a menu yet (🏙️ Town).', 'err');
    for (const r of rs) for (let k = 0; k < n; k++) Game.guest(r);
    printList(`Seated ${n} guests at ${rs.length} restaurant${rs.length > 1 ? 's' : ''}:`, rs.map((r) => `${r.name}: ${Game.rating(r) === null ? 'not rated yet' : Game.rating(r).toFixed(2) + ' stars'}`));
  }
  function criticCmd(arg) {
    if (!Game.restaurantsUnlocked()) return print('Restaurants are not open yet (discover more dishes).', 'err');
    const c0 = Game.S.critic;
    if (arg === 'plan' || !c0 || c0.v !== 2) { Game.planCritic(Math.floor(Game.S.time / Game.YEAR)); if (arg === 'plan') return printList('Planned visits:', Object.entries(Game.S.critic.visits).map(([d, v]) => `${Game.district(d).name}: ${Game.theme(v.theme).name}`)); }
    for (const cr of Game.CRITICS) {
      Game.runCritic(cr.district);
      const h = Game.S.critic.history[Game.S.critic.history.length - 1];
      printList(`${Game.district(cr.district).name}:`, h.list.map((x) => `${x.place || '-'}. ${x.name} ${x.score.toFixed(2)}`));
    }
  }
  function rivalCmd(arg) {
    const [id, v] = String(arg || '').split(/\s+/), t = Game.town();
    if (!t || !t.rivals[id]) return print('Usage: rival <' + Game.RIVALS.map((x) => x.id).join('|') + '> <rating>', 'err');
    t.rivals[id].rating = Math.max(1, Math.min(5, parseFloat(v) || 3));
    print(`${Game.rival(id).name}: ${t.rivals[id].rating.toFixed(2)} stars.`);
  }
  function stock() {
    const ids = new Set(Game.restaurants().flatMap((r) => r.menu));
    if (!ids.size) return print('No restaurant has a menu yet.', 'err');
    Game.S.cookedAt = Game.S.cookedAt || {};
    for (const id of ids) { Game.addItem(id, 20, true); Game.S.cookedAt[id] = Game.S.time; }
    print(`Added 20 of each of ${ids.size} menu dishes.`);
  }
  function recipes(arg) {
    const shown = (Game.S.cheatRevealed || []).length;
    if (arg === 'all') { const n = Game.revealAllDishes(); return print(`All ${FS.dishList.length} dishes are visible; ${n} of them were revealed by the console.`); }
    if (arg === 'hide') return print(`Hid the ${Game.hideRevealed()} dishes the console revealed. Real discoveries stay (${Object.keys(Game.S.discovered).length}).`);
    print(`${shown} dishes are revealed by the console. Try ${COMMANDS.recipes.usage}.`);
  }
  function order(arg) {
    if (!arg) return print(`Orders now come as ${Game.currentStage().name} orders. Try ${COMMANDS.order.usage}.`);
    const o = Game.newOrder(arg);
    if (!o) return print(`No ${arg} order could be made right now (nothing produced that fits, or one is already open).`, 'err');
    print(o.kind === arg ? `New ${o.kind} order from ${o.who}.` : `No ${arg} order could be made, so a ${o.kind} order from ${o.who} came instead.`);
  }
  function clear() {
    if ((Game.S.cheatRevealed || []).length) recipes('hide');
    Game.setSeasonOverride(null);
    Game.setWeatherOverride(null);
    Game.cheat.hour = null;
    print(`Overrides cleared. ${Game.season().name}, ${Game.weather().name}.`);
  }
  function status() {
    const c = Game.cheat;
    print(`Season: ${Game.season().name}${c.season !== null ? ' (forced)' : ''}. Weather: ${Game.weather().name}${c.weather ? ' (forced)' : `, ${(Game.weatherLeft() / Game.HOUR).toFixed(1)} h left`}.${c.hour != null ? ` Daylight forced to hour ${c.hour}.` : ''}`);
  }
  function run(line) {
    const [cmd, ...args] = line.trim().toLowerCase().split(/\s+/);
    if (!cmd) return;
    print('> ' + line.trim(), 'cmd');
    const c = COMMANDS[cmd];
    if (!c) return print(`Unknown command "${cmd}". Type help for the list.`, 'err');
    c.run(args.join(' '));
  }

  // The key left of 1: "Backquote" is its physical code on both US (`) and Swiss/German (§) layouts.
  const isToggle = (e) => e.code === 'Backquote' || e.key === '`' || e.key === '§';
  function toggle(show = box.hidden) {
    box.hidden = !show;
    if (show) {
      if (!log.childElementCount) print('Cheat console. Type help for the commands.');
      input.focus();
    } else { input.value = ''; input.blur(); }
  }
  window.addEventListener('keydown', (e) => {
    if (e.target === input || e.ctrlKey || e.metaKey || e.altKey || !isToggle(e)) return;
    if (e.target.matches && e.target.matches('input, textarea, select')) return;
    e.preventDefault();
    toggle();
  }, true);
  // Keys typed in the console stay there: game shortcuts never see them.
  input.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (isToggle(e) || e.key === 'Escape') { e.preventDefault(); toggle(false); return; }
    if (e.key === 'Enter') {
      const line = input.value;
      if (line.trim()) { history.push(line); histPos = history.length; }
      input.value = '';
      run(line);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      histPos = Math.max(0, Math.min(history.length, histPos + (e.key === 'ArrowUp' ? -1 : 1)));
      input.value = history[histPos] || '';
    }
  });
  input.addEventListener('keyup', (e) => e.stopPropagation());

  // Touch screens have no key left of 1: hold a finger on the logo and version for a moment instead. The console opens
  // when the finger lifts, so the phone's keyboard may come up with it. ✕ closes it (shown on touch screens only), and
  // tapping a command in the help list writes it into the line.
  const touchUI = () => matchMedia('(hover: none) and (pointer: coarse)').matches;
  let hold = null;
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' || !e.target.closest || !e.target.closest('#topbar .brand')) return;
    const h = hold = { x: e.clientX, y: e.clientY };
    h.timer = setTimeout(() => { h.ready = true; e.target.closest('.brand').classList.add('cc-armed'); if (navigator.vibrate) navigator.vibrate(15); }, 600);
  }, true);
  const endHold = (open) => {
    if (!hold) return;
    clearTimeout(hold.timer);
    const ready = hold.ready;
    hold = null;
    const brand = document.querySelector('#topbar .brand');
    if (brand) brand.classList.remove('cc-armed');
    if (open && ready) { toggle(); opened = performance.now(); }
  };
  // The phone sends a mouse press after the finger lifts (now on the console, which opens over the logo); it must not
  // take the focus from the command line.
  let opened = 0;
  document.addEventListener('mousedown', (e) => { if (performance.now() - opened < 800 && e.target !== input) e.preventDefault(); }, true);
  document.addEventListener('pointermove', (e) => { if (hold && Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 12) endHold(false); }, true);
  document.addEventListener('pointerup', () => endHold(true), true);
  document.addEventListener('pointercancel', () => endHold(true), true); // some browsers cancel a long hold; it still counts
  document.addEventListener('contextmenu', (e) => { if (e.target.closest && e.target.closest('#topbar .brand') && touchUI()) e.preventDefault(); }, true);
  box.querySelector('.cc-close').addEventListener('click', () => toggle(false));
  log.addEventListener('click', (e) => {
    const u = touchUI() && e.target.closest('.cc-help .use');
    if (!u) return;
    input.value = u.textContent.split(' ')[0] + ' ';
    input.focus();
  });
  window.Cheats = { run, toggle };
})();
