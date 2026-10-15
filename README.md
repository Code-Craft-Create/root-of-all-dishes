# Root of All Dishes: The Long Road to a Good Meal

A browser farm-to-table economy game: grow crops, raise animals, build mills, dairies and kitchens, and discover hundreds of dishes by tracing the long road from field to plate.

A browser food-economy simulation. Grow crops, raise animals, fish, mine salt, build processing
buildings, and discover dishes by combining ingredients in the Test Kitchen. The Codex shows the
full supply chain behind every ingredient and dish, so you can see how much work hides behind food.

## Run it

No build step and no dependencies. Either:

- open `index.html` directly in a browser, or
- serve the folder locally: `python3 -m http.server 8000` and visit http://localhost:8000

The version number (for example `v1.0.0`) is shown next to the logo in the top bar, on the welcome card and at the
bottom of the ⚙️ Settings window, so you can check at a glance that you have the latest build.

Progress autosaves to the browser's localStorage every 30 seconds (⚙️ menu has save/load, plus *Download save file* / *Load from file* to move a game between browsers as a .json file; old paste codes still load).

## What's in it

| | Count |
|---|---|
| Ingredients (raw + processed, excluding dishes) | 680 (258 raw, 422 processed) |
| Dishes to discover | 450 across 18 cuisines/collections |
| Production recipes in total | 1092 |
| Building types | 33 placeable + farmhouse |

Highlights of the supply-chain modelling: animals eat hay or compound feed (maize + soybean meal),
farmed salmon eat fish meal made from wild anchovies, cheese needs rennet from calves (or microbial
rennet), whey becomes ricotta, cream of tartar from wine barrels goes into baking powder, tortillas
need nixtamalized corn made with slaked lime from limestone, and chocolate takes six processing steps
from cocoa pod to bar.

All icons are hand-drawn SVG (assets/), so the game looks the same on every system. Open `icons.html` to
review every icon next to the emoji it replaced.
Interface emoji in UI text are swapped for SVG automatically: list them in `assets/ui-icons.js` (`FSI.uiList`,
or `FSI.uiAlias` for another code point of an existing icon). Native `title` tooltips and SVG text (the Town map)
are not swapped: use `data-tip` for tooltips, and draw icons in the Town SVG with `svgIcon()` in townmap.js.

## Running a farm

- **Storage** holds the same amount of every item: 50 at the start, upgraded with 🎩 toques in the Inventory's Stock tab
  to 75 / 100 / 150 / 250 / 375 / 500 (🎩 1 / 2 / 4 / 6 / 10 / 15; `Game.STORAGE`). A building pauses (its map bar turns brown
  and full) once everything it makes is at capacity; a batch that would overflow loses the extra. Imports stop at capacity too.
- **Sell above** (Stock tab): a slider from 0 to your storage capacity (default 25, remembered in the browser)
  with a "Sell from everything" button that sells every listed item down to that amount, and one "Sell xx for yy" button
  on each row (the only sell button there) that sells just that item down to it. A search narrows the big button to matching items.
- **Auto-sell** is set per item in the Inventory's Stock tab (after the Wholesaler): Off, Default (keep the Wholesaler's default
  amount, half of storage unless changed in his tab) or Keep a chosen number. An auto-sold item keeps its buildings running.
- The bar under a building on the map shows how well the farm supplies it: green when total production
  of every input covers what all its users need (or it has no inputs), yellow at 50–99%, red below 50%.
  It pulses while the building waits for an input, is brown and full when storage is full, and icy (the building frosted over) when it is
  too cold to grow. Buildings that can only make one thing (well, pigsty, apiary) show no product badge. A building with no recipe shows ? in that spot;
  paused buildings get white pause bars and buildings out of money two crossed-out coins drawn over them.
- Buildings that have waited longest for an input get it first, so two buildings sharing an input take turns.
- Click a building showing ⚠️ to see where the missing ingredient comes from, with an Import shortcut for raw ones.
- The inspector and the Inventory's Stock tab (Per min column) show how much of each item your buildings make and use per minute, and a missing-input
  hint says when you already make something but not fast enough, with a "Build another" button.
- **Buy more land.** The farm starts on the middle plot of a 5 x 5 world; each plot is as big as the starting map. Land you
  don't own is drawn blurred and misty, and the farm's edge fades into it over a few tiles; past the world's own edge the
  country fades into fog. A "Buy this land" sign stands on every plot that shares a side with your farm (click it, or anywhere on
  that plot). The first plot costs 5,000 and each one after that 5,000 more than the last (10,000, 15,000, ...). You can only
  build on land you own. Cheat console: `land all` owns everything.
- **Build chains close together.** A building uses less of an input when a building set up to make that input stands
  nearby: 15% less right next to it or with one empty tile between (diagonals count), 10% with 2–3 tiles between, 5% with 4–5. Only the closest
  maker of each input counts. Saved fractions carry over, so 15% off 10 milk takes 9, then 8, and so on (8.5 on average).
  The building panel marks the savings on each input (📍 −10%), and while placing or moving a building, dashed rings mark the
  three zones and the hint says what that spot would save.
- The **build menu** on the left is a grid of icon tiles with short names and prices (red when you can't afford it, a small number when you already own some). Hover a tile for the full name, what it does, upkeep and size. Click a group heading to fold it away (remembered); processing buildings are split into Mills & Refining, Dairy, Meat & Fish, Pantry & Drinks and Bakery & Pasta (`shelf` in buildings.js).
- The **building panel** shows what it uses ➜ what it makes in two columns. Hover any line for the details: per-minute
  flow, stock and nearby savings. Under each input a bar compares the whole farm's supply with what all its
  buildings use (+made / −used per minute; green enough, amber at least half, red less); the line takes the same colour.
  📦 N on a line means only N are in stock, not enough for the next cycle. Rate and
  priority fold away under ⚙️ Settings, whose summary line shows the current values.
- Each building has a **priority** (High / Normal / Low). A building never takes an ingredient that a higher-priority
  building is waiting for, so an auto-selling Kitchen can't starve the rest of the farm.
- Money can go below zero (upkeep keeps running). In debt you can't build, import or open cuisines, and fields can't buy seed.
  The **🏦 Bank** tab in the Inventory lends 1,000 at a time for a 10% fee (up to 11,000 owed); a quarter of all income pays it back.
- Orders include ⭐ special requests for a dish you haven't discovered yet and 📦 bulk orders with more time and a better rate; later stages add regulars, clue orders, contracts, events and supply contracts (see Customer orders below).
- Each new day's report (what the farm made and sold, and how much of the sale price was the raw ingredients' share) goes to the
  **📰 Farm journal** (`J`), as a little newspaper. The journal keeps every event: new dishes, unlocks, weather, orders, goals.
  A day before winter you get a warning with how long your animals' feed will last.
- **Phones and tablets** (touch screens only; mouse play is unchanged): pinch to zoom the map. The build menu is hidden;
  tap empty ground of your own land and it pops up, and the building you pick starts on that spot. Placing or moving a building
  shows it where it would go first: tap elsewhere or drag it to adjust, then tap it again or press Build in the bar at the
  bottom (Cancel stops). Holding a finger on anything with a hover tip shows the tip. On a phone the Test Kitchen
  fills the screen: only the latest try shows ("Show earlier tries" opens the rest) and the ingredient list keeps the space below. Windows taller than a sideways phone scroll.
- Keyboard: I or M inventory, K test kitchen, B cookbook, X codex, O orders, J journal, G goals, P cuisines, F flows, N sound on/off, Space pause.
- **Debug cheat console:** press the key left of 1 (`` ` `` or §), or on a phone or tablet hold a finger on the logo and version at the top left, and type `help` (on touch screens, tapping a command in the list writes it into the line). `season winter` / `weather storm` force the
  season or weather (`off` or `clear` goes back to normal); visuals, sounds and growth follow. Overrides are not saved.
  `money 10000` adds money. `target [cuisine]` shows the splash a cuisine gets when it reaches its stage's target (looks only). `recipes all` reveals every dish (no rewards); `recipes hide` or `clear` hides only the dishes
  the console revealed (tracked in the save as `S.cheatRevealed`), so real discoveries stay.
- Sound effects are synthesized in the browser (js/audio.js, no audio files): clicks, building plonks, sales, order cash register,
  discovery fanfare, goal chimes, unlock sparkles and more. Rain, storms (with distant thunder) and snow (wind) play quiet
  ambient weather that crossfades with the day's weather, with its own volume slider. On calm days
  the seasons add a very quiet background: birds in spring, crickets in summer, rustling leaves in autumn. Animal farms on screen moo, baa, oink,
  cluck and quack now and then, from their side of the screen: faint when zoomed out, clearer when zoomed in. Open `sounds.html` to hear every sound on its own.
- Background music: original tracks in two shuffled playlists, farm (assets/music/kitchen-pickin*, pantry-pickin*) and Town
  (assets/music/town-*). Each track plays in full, then a random other one follows. Switching to or from the Town fades one playlist
  out over 5 s while the other fades in, 30 s into a random track. Own Music slider in the ⚙️ menu; mute (🔊 / N) stops it too.
  The music is loaded by relative path, so root-of-all-dishes.html needs the assets/music/ folder next to it (tools/build.js copies it
  into the download folder; add a .mp3 there, prefixed town- for the Town or finale- for the end screen, and rebuild to include it). The finale has its own track
  (assets/music/finale-high-score-hoedown.mp3): it fades in from its start when the finale opens and loops; closing the finale fades back
  to the farm or Town playlist. In the Town the farm animals, bees and gulls are silent; weather, season sounds and
  harbour water stay. 🔊 in the top bar (or N) mutes; the ⚙️ menu has a saved volume slider.
- The map shows the season (blossom in spring, autumn leaves, snow in winter) and today's weather; working buildings move, smoke
  and have animals wandering about, stopped ones are dimmed. Each new dish gets its own card showing its chain from land to plate,
  and the Cookbook shows undiscovered dishes as silhouettes with progress per cuisine.
- The early goals walk through real supply chains: feed from milling leftovers, butter from grass, yeast
  from sugar-beet molasses, salt from the sea.

## Unlocking

You start with four buildings (Field, Well, Mill, Kitchen) and a handful of crops. Guided first steps unlock more as
you complete goals, from the bottom of the supply chain up: cooking your first dish opens Salt & fields (salt pans,
orchard, more crops), making salt opens Sugar & yeast, making yeast opens the Bakery, baking bread opens the Farmyard
(hens, feed mill), then come Dairy & bees, Kitchen garden, and Butcher & cheesemaker. The 🎯 Goals list shows which
goal unlocks what.

Dish milestones are goals with `splash: true` (js/game.js): cooking 25 different dishes and cooking every dish each
open a celebration card (`goal:<id>` in ui.js `milestoneInfo`, own `milestone` sound) with every dish cooked so far,
what stands behind them, and the reward: coins, toques, and at 25 dishes fame (`Game.FAME`: every dish sells for 10%
more at the market and in restaurants, `Game.dishMult`). Cheat `milestone [dish25|dishall]` shows the card.

Every dish belongs to one of 15 cuisines in five stages (**🍽️ Cuisines**, key P):

| Stage | Cuisines | Target per cuisine | Then unlocks |
|---|---|---|---|
| A Farm to Table | Farmhouse Kitchen, Swiss Alpine, Nordic & Dutch | 6 | 🚚 Wholesaler |
| B European Classics | British & Irish, French & Belgian, German/Austrian/Hungarian | 10 | 🎓 Culinary Academy |
| C Mediterranean & Beyond | Italian, Mediterranean & Middle Eastern, Around the World | 15 | 📐 Blueprints |
| D Asia & the Americas | East Asian, South & Southeast Asian, The Americas | 25 | 🏙️ Restaurants in Town |
| E Grand Cuisine | Haute Cuisine, Pâtisserie & Chocolaterie, Grand Banquets | 10 on menus rated ★★★★ | the end game |

Farmhouse Kitchen is open from the start; its buildings come with the guided steps. From the first dish on, the other
cuisines of the current stage can be opened for a little money (1,000 in stage A up to 8,000 in stage E). Opening a
cuisine unlocks every building and production step its dishes need, from the field to the plate. When every cuisine
of a stage has reached the target (dishes actually cooked), the next stage opens. The Cookbook only lists dishes of
open cuisines that you can make from what is unlocked; the Test Kitchen recognises a dish of an unopened cuisine but
only says where it belongs. It can use any ingredient you have had at least once, so experiments don't need
everything in stock at once; cooking still needs the real ingredients.

**🎩 Toques** are the second currency, for knowledge rather than land and buildings. You start with 3. A special-request
order pays 1, clue orders 1 to 3, events 2 and party menus 3, contracts 1 and supply contracts 2, regulars from
level 3 tip one now and then, a cuisine reaching its stage target pays 2 to 6, and cooking every dish of a cuisine pays 4 to 12.
💡 Hints for undiscovered dishes cost 1 toque per ingredient (2 for dishes with 12+ raw ingredients in the chain).

**🚚 Wholesaler.** Selling surplus automatically is locked until stage A is done. Then the Wholesaler can be hired in
the Inventory (1,500, upgrades 4,000 and 10,000): items set to auto-sell (`S.autosell`, per item) go to him above the amount
kept, and he pays 80% of the market price for up to 300 / 800 / 2,000 coins of goods per game minute.

**📦 Dispatcher** (`Game.DISPATCHER` in js/game.js, Orders window tab). Unlocked by the goal "Cook every dish in 3
cuisines" (any stage). Hired for 3,000 coins + 5 toques, he delivers every order stock can fill every 2 game seconds,
soonest to expire first, never touching the last 0 / 5 / 10 / 25 / 50 of any good (global setting). He keeps 10% of
the coins and every other toque (odd ones carry over), so delivering by hand still pays best. Order types can be
switched off per group (everyday, special, clue, contracts and supply, events and menus).

**🎓 Culinary Academy** (`Game.ACADEMY` in js/game.js, window `modals.academy`, key U). After stage B you can build
one Academy (Cooking, 3,000). Chefs are hired with toques (3, 5, 8 for the three seats) from three candidates a day,
each trained in a cuisine from stage B to the next stage. Point a chef at an undiscovered dish (from the Academy or
🎓 Chef on a Cookbook card), or 🎲 at a whole cuisine. They reveal one ingredient every 5 game hours: 40% faster on
their speciality, 20% / 35% faster after training (3 and 6 toques), half again as long for dishes with 12+ raw
ingredients. The last ingredient discovers the dish; it still has to be cooked from your own chain. A chef who finishes
a dish brings a 💌 recipe postcard 35% of the time: one ingredient of a dish in a cuisine not open yet. Chefs only
work while the Academy stands and isn't paused; they cost no money (the building has upkeep).

**📐 Blueprints** (`Game.blueprintFit` / `Game.placeBlueprint` in js/game.js, `blueprintFor` and `bpBar` in ui.js).
After stage C, 🗺️ Plan production offers *Place blueprint*: one new building for every unlocked step of the chain that
nothing runs yet (idle buildings of the right kind are put to work instead). The layout follows the mouse, each building
on the free spot closest to the steps it trades with (within one tile for the 15% nearby saving), and finds water,
rock or forest for buildings that need it. Click to set it down; then drag single buildings, click open ground to move
the whole layout, ↻ Rotate (R) to grow the chain another way, and ✅ Build (Enter) to pay for everything at once.
Red buildings are blocked and have to be dragged first. Afterwards they are ordinary buildings with their recipes set.
There are two kinds: **Fill the gaps** (only the missing steps, as above) and **Whole chain, balanced** (`blueprintFull`
in ui.js), which ignores what the farm already has and builds every step from scratch, with as many buildings per step
as it takes to keep 1 to 9 of the last step (− / + in the bar) at 100%. Every building runs at full rate except the
last one of each step, whose rate is set to what is still needed (rounded up to 5%, at least 10%); suppliers are sized
from those set rates, so every input bar is full. Balanced at normal growth: winter, weather and season slow the farms.

**🏙️ Restaurants and the Town** (`Game.DISTRICTS`, `Game.LOTS`, `Game.RIVALS`, `Game.TOWN`, `judge`, `guest`, `tickTown`
in js/game.js "Restaurants"; the map in js/townmap.js; panel, Gazette and Legacy windows in ui.js "Town"). Once stage D
is done, 🏙️ Town (key T) switches the whole screen to an isometric town (drag to pan, wheel or +/− to zoom, T or Esc to
go back to the farm). Three districts: Old Town (likes Grand Cuisine or 12+ raw ingredients, high prices), Harbour
(seafood, fair prices) and Market Quarter (stages A and B and sweets, low prices, busiest). Six lots to rent (5,000,
then 5,000 more for each further rented restaurant; upkeep 8 a minute each) plus one rival per district on a lot of its
own: Maison Valcourt (Old Town), Old Pete's Chowder House (Harbour), QuickBite (Market Quarter). Each district sends a
guest every ~12 game seconds (fewer at night, more with more restaurants) to one of its restaurants, chosen by rating
cubed (a new restaurant counts as 3.5 stars, the Restaurant of the Year ×1.3, a rival cutting prices ×1.5). Your
guests eat straight from the warehouse and score 1 to 5 from hidden rules: out of stock = 1 star; complexity (12+ raw
+0.6, 8+ +0.3, under 5 −0.3, Grand Cuisine +0.3); the district's favourite food +0.6; price level (the district's
favourite +0.3, two steps off −0.5); one cuisine +0.3, three or more −0.6; under 4 dishes −0.5; not cooked within a
game day −0.5. Without Grand Cuisine dishes the rating stops at 4 stars, each one lifts that by 0.1. Rating = average
of the last 30 guests (shown after 8); reviews hint at the rule that mattered most. First 4 stars pay 2 toques, 4.75
pays 5. Rival ratings drift around their base, drop while you take more than half of their district's guests, and a
rival you overtake cuts prices for a day. Buy a rival for 10,000 × rating² (Game.buyRival): it becomes your
restaurant. **Food critic** (`Game.CRITIC`, `Game.THEMES`, `runCritic`): a year is 8 game days; at its start the
Town Gazette announces the year's theme (long chains, local favourite, one cuisine, never runs out, Grand Cuisine), and
the critic comes at an unannounced moment in winter, eats one dish everywhere (rivals too: 0.6 × rating + 0.4 × the
dish + theme bonus up to 0.5) and names gold, silver and bronze (10/5/2 toques, 25,000/10,000/5,000 coins; gold also
gets 30% more guests for a year). **Stage E** is finished when each of its cuisines has 10 dishes on the menus of
restaurants rated 4 stars or better. **The Legacy** (last goal, `Game.legacy`): finish Grand Cuisine, be Restaurant of
the Year three years in a row, own all nine restaurants. Winning it opens the finale (`ui.finale` in ui.js "THE FINALE"):
a full-screen card with every discovered dish swirling in around a five-star restaurant, the money and toque piles and
the final numbers; the Town Guide can replay it. Cheat console: `guests <n>`, `stock`, `critic <now|plan>`,
`rival <id> <rating>`, `finale` (the screen only), `win` (meets all Legacy conditions and wins it for real, `Game.cheatLegacy`).

**📋 Customer orders grow with the stages** (`o.kind` in js/game.js, window in ui.js `modals.orders`). Dishes are only
ordered from open cuisines; special requests and clues are built around undiscovered dishes of the current stage first.
- The first customer turns up as soon as one of your buildings is set to make an ingredient (usually Wheat Flour at
  the Mill) and asks for that ingredient (`firstOrder` in js/game.js); orders keep coming from then on.
- Stage A: plain orders, 📦 bulk orders, ⭐ special requests.
- Stage B on: ❤️ **regulars**, one per cuisine of stages B to D (The Red Lion, Le Petit Bistro, Bierhalle Edelweiss,
  Trattoria da Nonna, The Meze House, World Food Market, Golden Dragon, Spice Route, Route 66 Diner). They order their
  cuisine's dishes and ingredients once you have cooked one of its dishes. Each delivery is a friendship point
  (`S.regulars`); levels at 3 / 7 / 12 / 20 raise order size and pay, and from level 3 they tip a toque every 3rd
  delivery (every 2nd at level 5). 🔍 **Clue orders** describe a dish ("something sweet with raisins", "a soup or stew
  with no meat or fish"); any dish that fits is accepted (`o.matches`, fixed when the order comes in).
- Stage C on: ⏳ **contracts** (a big batch of one product over two game days, each delivery paid at once, a bonus and a
  toque on completion) and 🎉 **events** (three of your dishes from two cuisines, delivered together).
- Stage D on: 🚛 **supply contracts** (three goods one cuisine needs, a quota every game day for 3 days; each day met
  pays, all three pay a bonus and 2 toques), 🥂 **party menus** (4 to 5 dishes over three cuisines) and seasonal
  customers (Ski Lodge in winter, Beach Bar in summer). Stage E keeps the stage D mix; restaurant guests come on top.
- Cheat console: `order <kind>` brings in an order of that kind.

Steps, stages and cuisines live in `js/data/unlocks.js` (each cuisine lists its dishes; dishes.js groups are only where
rows are written), and the game unlocks the supply chain behind them. Saves from before the stages (version 3 and
older) no longer load.

## Seeing the supply chain

- **🔗 Flows** (button on the map, or `F`) draws arrows from each building to the buildings that use what it
  makes, coloured like the production bars: green when the farm makes enough of that ingredient for everyone
  who uses it, yellow at 50–99%, red below, brown when the user's storage is full, icy when it is too cold. Dashed
  and pulsing: the building is waiting for that ingredient. Selecting a building shows just its links. The ▾ next to
  the button filters the links to chosen goods or building types (remembered in this browser).
- **🗺️ Plan production** (Codex and Cookbook) lists every step needed to make an item from scratch, what is
  already running, and builds a missing step with the right recipe preset (or, after stage C, the whole chain as a 📐 blueprint).
- **Where the price goes** in the Codex splits each item's value into farm, processing and kitchen shares.

## Seasons and weather

A season lasts 2 in-game days (a year is 8 days, about 80 minutes at normal speed). Fields and orchards rest in
winter (cold-hardy crops like wheat, kale and leeks grow slowly), orchards peak in autumn, bees rest in winter.
Daily weather (rain, drought, late frost, storms, snow) speeds up or stops farms, docks and salt pans.
Greenhouses, cellars, animals and workshops are unaffected. Fresh produce sells for more in winter and less at
harvest time; grains, legumes, nuts and processed goods keep their price.

## Code layout

```
index.html          page shell
js/version.js       GAME_VERSION, the version shown in the game (see Versioning)
css/style.css       all styling
js/data/core.js     registries + helpers used by data files (FS.source, FS.proc, FS.dishes, …)
js/data/buildings.js  building types (cost, size, placement rule, upkeep)
js/data/raw.js      crops, orchards, greenhouse, foraging, animals, fishing, minerals
js/data/processing.js processing recipes per building
js/data/dishes.js   dishes (Kitchen recipes) grouped by cuisine
js/data/unlocks.js  guided steps (by goal), the 5 stages x 3 cuisines, and the unlock calculation
js/model.js         derived data: indexes, automatic pricing, supply-chain analysis
js/game.js          state, map generation, simulation tick, market, orders, test kitchen, goals
js/render.js        canvas renderer (terrain in sharp per-zoom chunks with SVG sprites from assets/icons/terrain.js, buildings, placement ghost, floating text)
js/ui.js            DOM UI: top bar, build menu, inspector, modals
js/main.js          boot + main loop
tools/validate.js   data checker
assets/            SVG icon set: kit.js (palette + helpers), STYLE.md, icons/*.js per group, icons.js bundle
icons.html          icon review page (emoji vs SVG for every item, building and UI icon)
tools/build-icons.js bundles assets/ into assets/icons.js; tools/icon-sheet.js renders a PNG contact sheet
tools/build.js      builds ../root-of-all-dishes-download (single-file HTML + zip)
tools/playsim.js    headless play-through benchmark (simulated player, results in benchmarks/)
```

## Versioning

The game uses semantic versioning, `MAJOR.MINOR.PATCH`, set once in `js/version.js` (`GAME_VERSION`). Every change
that ships bumps it:

- **MAJOR** when old saves can no longer be loaded (the save format `S.v` in `js/game.js` changes); minor and patch reset to 0.
- **MINOR** for new features or content, with saves still loading; patch resets to 0.
- **PATCH** for fixes and small tweaks only.

Saves remember the version that last wrote them (`gameVersion`). Started at v1.0.0.

## Adding content

- Raw crop: add a row to the right `S('field' | 'orchard' | 'greenhouse' | …)` block in `raw.js`:
  `[name, growTime, yield, value, emoji, category, origin, fact]`.
- Processed ingredient: add a row in `processing.js`: `[name, {input_id: qty}, outQty, time, opts]`.
  Ids are the slugged names (`'Wheat Flour'` → `wheat_flour`). Byproducts go in `opts.by`.
- Dish: add `[name, emoji, {input_id: qty}, note]` to a cuisine block in `dishes.js`. Each dish must
  have a unique ingredient set (that set is what players discover).

Prices are computed automatically from inputs, so new items need no manual balancing.

After editing data, run:

```
node tools/validate.js      # add -v to list unused ingredients
```

It fails on unknown ids, unreachable items, duplicate dish ingredient sets, recipes that no step or cuisine unlocks, dishes in no cuisine or in two,
or counts below 500/200.

To rebuild the downloads (single self-contained `root-of-all-dishes.html` plus `root-of-all-dishes.zip`):

```
node tools/build.js
```

## Play-through benchmark

`tools/playsim.js` plays whole games without a browser so balance changes can be measured:

```
node tools/playsim.js                         # 8 seeds, results in benchmarks/latest.json and .md
node tools/playsim.js --label my-change --baseline benchmarks/baseline.json
node tools/playsim.js --runs 2 --days 40      # quick look at the early game
node tools/playsim.js --runs 1 --days 5 --verbose   # watch every action and game message
```

It loads the real game logic (data, model.js, game.js) into Node and a simulated player plays it: follows the goals,
builds supply chains next to each other, discovers dishes in the Test Kitchen, sells, delivers orders, opens cuisines,
hires the Wholesaler, chefs and the Dispatcher, uses Blueprints and runs restaurants until Grand Cuisine is finished
(`--until legacy` keeps going for the Legacy). It acts at a human cadence, one action every 10 to 25 game seconds on
average, and each seed draws its own persona (pace, attention to orders, how well it guesses recipes, how readily it
spends toques), so runs vary like players do. Discovery isn't free: ingredients not obvious from a dish's name take
several Test Kitchen tries unless a hint or chef reveals them. Every random number comes from the seed (the game's
Math.random too), so the same seeds on two versions of the game give a fair comparison.

The report lists when each milestone was reached (goals, dish counts, cuisines opened and at their target, stages,
Wholesaler, Academy, first restaurant, 4 stars...) in game days as median, quartiles and range over the seeds, key
figures (actions, experiments, money and income on days 10/25/50/100, buildings), and with `--baseline` the change
against an earlier run. A run that makes no progress for 15 game days stops as *stalled*. One full game takes about one
to two minutes of computer time; runs go in parallel on all cores.

When changing the bot (in the same file), save a new baseline first, since bot changes move the numbers too.
