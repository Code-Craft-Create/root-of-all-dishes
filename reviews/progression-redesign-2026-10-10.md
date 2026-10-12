# Progression redesign: thoughts on the designer's plan, 10 Oct 2026

Reply to the designer's plan of five cuisine stages with mechanic unlocks between them. Ideas only, nothing implemented.
Builds on [midgame-ideas-2026-10-10.md](midgame-ideas-2026-10-10.md), [five-stages-plan-2026-10-10.md](five-stages-plan-2026-10-10.md)
and [stage5-grand-cuisine-2026-10-10.md](stage5-grand-cuisine-2026-10-10.md).

## Overall

The plan fixes the main problem. Each stage now changes how you play, not only how much there is:

| Stage | Cuisines | To finish | What it changes afterwards |
|---|---|---|---|
| A | Farmhouse, Swiss Alpine, Nordic & Dutch (36) | 6 per cuisine (18) | **Wholesaler**: the farm can sell surplus on its own |
| B | British & Irish, French & Belgian, German/Austrian/Hungarian (67) | 10 per cuisine (30) | **Culinary Academy**: chefs uncover recipes for you |
| C | Italian, Mediterranean & Middle Eastern, Around the World (100) | 15 per cuisine (45) | **Blueprints**: place a whole chain at once |
| D | East Asian, South & SE Asian, The Americas (177) | 25 per cuisine (75) | **Restaurants** in town |
| E | Haute Cuisine, Pâtisserie & Chocolaterie, Grand Banquets (70) | a restaurant rating, needs 10 per cuisine on menus | the end game |

The numbers fit the dish counts: the smallest cuisine per stage (Nordic 11, German 17, Around the World 28, East Asian 44)
still has room above its target, so the player always chooses which dishes to chase. It adds up to 168 dishes
cooked before restaurants, about 37% of the game. That feels right for "not everything, but a real effort".

## Names

| Working name | Suggestion | Why |
|---|---|---|
| food-university | **Culinary Academy** (alternatives: Chefs' Atelier, Gastronomy Institute) | Sounds high-end, and you "hire chefs" there naturally. |
| secondary currency (stars) | **Toques** (the tall chef's hat), alternative: Laurels | "Stars" will clash with the 1 to 5 star restaurant ratings in stage E. A toque is the chef's own badge of rank. |
| chain-building | **Blueprints** (alternatives: Farm-to-Fork Plans, Chain Planner) | Short, says exactly what it is, and fits the existing Plan production window it would grow out of. |
| autoseller | **Wholesaler** (alternatives: Market Trader, Produce Merchant) | A person or building you hire, so it can have a fee and limits. |
| restaurant | **Restaurants**, the town screen as **Town** | Plain and clear; no reason to change. |

## Toques (secondary currency)

Agree that recipes should not be bought with money: money is for land and buildings, toques for knowledge.

Ways to earn toques:
- **Special-request orders** (a dish you haven't discovered) give 1 toque when delivered.
- **Clue orders and events** (see orders below) give 1 to 3.
- **Finishing a cuisine's target** in a stage gives a few, so progress feeds the Academy.
- **A cuisine fully cooked** (gold in the Cookbook) gives a bigger bonus.
- Not for simply cooking a new dish the first time: then the Academy would feed itself in a loop.

Ways to spend them:
- The existing paid hints (`Game.reveal` in js/game.js, now costs money) switch to toques. In stages A and B that is
  the only use, so toques start as "hints you earn by serving customers", which keeps the detective work at the centre.
- Hiring and training Academy chefs from stage C on.

## Culinary Academy

- One building, unlocked after stage B. You hire chefs with toques; each works on one undiscovered dish you point
  them at (or "surprise me" within a cuisine) and reveals one ingredient every few game hours.
- Chefs have a speciality cuisine (a Lyon-trained chef is faster on French), so hiring is a choice, not just a number.
- It should **reveal**, not cook: the player still has to have had the ingredients and run the chain. So the Academy
  removes the guessing grind of stage D's long recipes, but not the supply-chain lesson.
- A chef could also bring a **recipe postcard** now and then: a hint about a dish in a cuisine not yet open.

## Blueprints

- From any dish or item in Plan production: "Place blueprint". A ghost of every missing building, already grouped close
  together for the proximity bonus and with recipes preset, follows the mouse. Rotate, nudge single buildings, place,
  pay once.
- Everything stays a normal building afterwards, so the chain is visible and tweakable, as you wanted.
- Nice extra: save your own blueprint from buildings you select ("my bakery block") and stamp it again elsewhere.
- Land matters more then: a big chain needs space, so blueprints and buying plots support each other.

## Wholesaler (nerfed auto-sell)

Today any building can auto-sell from the start (`b.autosell`). Proposal:
- **Before the unlock:** sell by hand in the Market, and through orders. Stage A is short, and this makes orders the
  main income early, which is the mechanic you like most anyway.
- **After stage A:** build or hire a Wholesaler. Buildings can then sell surplus above their stock target, but:
  - the Wholesaler pays **80% of market price** (it takes a cut), so orders stay more profitable;
  - it has a **capacity** per minute, upgradable, so it can't swallow a whole farm's output.
- Old saves keep auto-sell working (like `S.legacy`).

## Packs become the stages

- The 11 shop packs go away; each stage opens its 3 cuisines for free once the previous stage is done.
- Inside a stage the player picks which cuisine to work on first. Optional: each cuisine still costs some money to
  "open" (its buildings and steps), so there is a choice of which to start with, but no gate.
- The current tutorial unlocks (Farmyard, Dairy & pantry, Kitchen garden, Village kitchen, Butcher & cheesemaker,
  Chocolate) fold into stage A as its guided first steps; the goals list stays as the tutorial.
- The count goals "Cook 50 / 100 / 200 dishes" are replaced by the stage targets, shown with the same progress bars.

## How customer orders progress

Orders should only ask for dishes from cuisines you have open, and special requests should prefer dishes that count
towards the current stage, so orders pull you forward rather than sideways.

| Stage | Orders |
|---|---|
| A | Like now: village customers order ingredients and dishes you make. Special requests (undiscovered dish) introduce toques. Orders are the main income, since there is no auto-sell yet. |
| B | **Regulars** appear with tastes tied to the stage: the Pub (British), the Bistro (French), the Beer Hall (German). Delivering raises a friendship level; higher levels unlock bigger orders and a perk. **Clue orders** start: "something baked with apples", "a soup with no meat". |
| C | Clue orders become the main toque source, since the Academy now wants toques. **Bulk contracts with deadlines** grow ("120 pizza dough over 2 days"), pushing larger production. First **events**: a wedding wants three dishes from two cuisines. |
| D | **Supply contracts** for whole chains (tortillas, rice, coconut milk daily for 3 days), which suit Blueprints. Events become **menus** for big parties across cuisines. Seasonal customers (the Ski Lodge in winter, the beach bar in summer). |
| E | Most demand comes from your **restaurants' guests**. The farm's job shifts to keeping restaurant menus supplied. Grand Banquets dishes appear as rare banquet events in town with big toque and rating rewards. |

## Restaurants (stage E)

Strong idea, and fitting as the end game. Thoughts:
- **Reviews are the clue system.** The hidden rules (don't mix Indian, Italian and French on one menu; complex dishes
  rate higher; dishes that run out cost stars) should be hinted in guest reviews: "Lovely carbonara, but a curry next
  to it felt odd." That keeps the detective feeling in the end game instead of making rules feel unfair.
- Hidden scores: complexity (raw ingredients and steps in the chain, already computed by `FS.complexity`), freshness
  (time since cooked), menu coherence (cuisines per menu), price, and availability (served vs ordered).
- The town grid: spots differ (old town square = rich guests who like Haute Cuisine, station = quick cheap food,
  university quarter = students who like variety and low prices). Choosing a spot is choosing an audience.
- Your 10 per cuisine on menus rule then emerges from the rating: you can't reach 5 stars without enough Grand Cuisine
  on menus, and the reviews say so ("The menu is good, but nothing here is truly special").
- It is the biggest piece of work by far. A first version could be one restaurant on a small street with menu picks
  and reviews, then the full town grid later.

## Decided (10 Oct 17:40)

1. Names approved: Culinary Academy, Toques, Blueprints, Wholesaler, Restaurants (town screen: Town).
2. Stages A to D as drafted in five-stages-plan; E as in stage5-grand-cuisine.
3. Opening a cuisine costs a little money.
4. Old saves can be ignored (no players yet), so no migration needed.

## Suggested build order

1. Stages replace packs, toques (hints paid in toques, earned from special orders), Wholesaler gating. The core loop
   changes and everything else hangs off it.
2. Order progression for stages B and C (regulars, clue orders).
3. Culinary Academy.
4. Blueprints.
5. Restaurants and the town screen, first a small version.
