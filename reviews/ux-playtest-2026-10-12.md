# Earth to Eat: UI/UX playtest, 12 Oct 2026 (round 3)

How it was tested: headless Chromium driven by mouse and keyboard like a player (no playsim), mostly at 1440×900, with
spot checks at 1920×1080, 1366×768, 1280×720 and 1024×700. I played a fresh farm through the real interface up to the
Farmyard step (well, wheat, mill, kitchen, Buttered Toast in the Test Kitchen, plan, selling, poultry, feed mill,
bakery, yeast), then used the cheat console (`stage A`, `stage B`, `stage C`, `recipes all`, `stock`, `guests`,
`critic now`, `order …`, `light …`) to reach the Wholesaler, the Academy (built it, hired a chef), Blueprints
(placed a Pesto "Fill the gaps" ghost) and the Town (rented Market Row, set a 6-dish menu, seated guests).
No JavaScript errors in any run. Analysis only: no game code was changed.

Things that already work well and should stay: the discovery card, the building panel's supply bars with the
"Waiting for Butter, made at Creamery (not built yet)" line, flow lines when a building is selected, the Town's look
and the "1 of 5 found" detective line, and the Town unlock splash.

**Status: every item fixed on 12 Oct except 9 and 16, which were chosen to keep as they are** (see the Fixed section at the end). Items 1–4 have the biggest effect. Each finding has a screenshot (all named `ux3-*.png` in this folder).

---

## High impact

### 1. Later features are still named before they unlock
The game should surprise, but several screens still name or describe what is coming:

| Where | What the player sees early | Screenshot |
|---|---|---|
| Town Guide, the moment the Town opens (I was in Mediterranean & Beyond) | "The Legacy: Finish Grand Cuisine · Win gold from all three critics · Buy out Crestwell & Co". That is the endgame and the name of a stage two steps away | [ux3-town-guide-legacy](ux3-town-guide-legacy.png) |
| Goals list, before the Town exists | "Finish Grand Cuisine: serve 8 dishes of each of its cuisines at restaurants rated ★★★★ or better (🏙️ Town)". This gives away the Town, which is meant to be a secret behind "Discover 75 dishes" | [ux3-goals-grand-cuisine](ux3-goals-grand-cuisine.png) |
| Cuisines window | The intro says toques pay for "🎓 Academy chefs" before the Academy exists. Stage headers end in "then unlocks 🎓 the Culinary Academy" and "then unlocks ❔ plans that lay out a whole supply chain at once" | [ux3-cuisines-feature-teasers](ux3-cuisines-feature-teasers.png) |
| Orders window | A locked "Dispatcher 🔒" tab, and the goal "Cook every dish in 3 cuisines to hire 📦 the Dispatcher" | [ux3-orders-dispatcher-tab](ux3-orders-dispatcher-tab.png) |
| Inventory › Stock, from day 1 | "🔒 Finish Farm to Table and hire the 🚚 Wholesaler to auto-sell items" | [ux3-inventory-wholesaler-note](ux3-inventory-wholesaler-note.png) |
| First help screen | Point 8 lists toques, regulars, clues, contracts, events and supply contracts before the first field is harvested | [ux3-help-first-open](ux3-help-first-open.png) |

Cause: `Game.stageKnown` and `featureKnown` treat the *next* stage as known (the 10 Oct teaser design). The Grand Cuisine
goal text and the Town Guide's Legacy block don't check `Game.restaurantsUnlocked()` at all.

Suggestion: name a feature only after its splash has shown. Until then, stage headers just say "then unlocks something
new". Hide the Legacy block until Grand Cuisine is reached ("A final challenge yet to be discovered" already exists for
the goal). Word the Grand Cuisine goal without Town or restaurants until the Town is open. Leave the Dispatcher tab and
the Wholesaler note out until they unlock, and cut the help screen's point 8 to "Complete goals to grow your farm."

### 2. Toasts pile up and cover what you are reading
- Every build click adds a "Placing Mill: click on the map. Right-click to cancel." toast, and it **stays after the
  building is placed**. Placing three buildings fills all three toast slots with stale hints, which pushes out goal
  completions ([ux3-placing-toasts](ux3-placing-toasts.png)). A stale "Placing Culinary Academy" toast was still
  showing over the Academy window after I had hired a chef.
- While a window is open, toasts move bottom-left but still sit **on top of the window**. In the Production plan they
  covered the Salt Pans row and its build button ([ux3-toasts-over-plan](ux3-toasts-over-plan.png)).

Suggestion: show the placement hint as one cursor label or a single bar that is replaced, not stacked, and drop it on
place or cancel. While a window is open, put toasts outside its box (in the strip to its left at ≥1280 px wide) or hold
them until it closes.

### 3. The same dish gives three different supply-chain numbers
For Buttered Toast:
- Discovery card and journal: "5 raw ingredients, **8 processing steps in 11 kinds of buildings**" ([ux3-discovery-counts](ux3-discovery-counts.png)).
- Cookbook card: "5 raw · 8 steps · 11 buildings".
- Production plan: "**11 production steps · 9 kinds of buildings**" ([ux3-toasts-over-plan](ux3-toasts-over-plan.png)).

These numbers are the teaching core of the game, so they need to agree. "8 steps in 11 kinds of buildings" also reads
wrong, since there are more buildings than steps (the farms and the kitchen are counted as buildings but not as steps).
Suggestion: one helper for all three screens, and one shared wording such as "5 raw ingredients ➜ 8 processing steps ➜
1 plate · 11 kinds of buildings".

### 4. Dawn and dusk tint the map for about two thirds of the day
Plain daylight only runs from 8:30 to 16:00 (`SKY` in render.js). Outside those hours the map is reddish, brown or violet
([ux3-daylight-strip](ux3-daylight-strip.png): 0h to 22h in 2-hour steps). At Very fast that is most of what you see.
The green, yellow and red supply bars under buildings, and the building colours, lose contrast; at 22:53 the farm is
nearly unreadable ([ux3-night-map](ux3-night-map.png)).
Suggestion: plain light from about 6:00 to 19:00, a lighter dawn and dusk wash, and draw the status bars and product
badges after the tint so they keep their colours.

---

## Medium impact

### 5. Buildings with only one choice wait for a click
Poultry House, Feed Mill, Bakery and Fermentation Cellar each had exactly one recipe when placed. All four sat on "Idle:
pick something to produce below" with a ? badge until clicked ([ux3-single-recipe-idle](ux3-single-recipe-idle.png)).
Suggestion: when there is only one available recipe, pick it on placement. Blueprint and plan builds already do this.

### 6. NEW badges never go away
A NEW badge only clears when you build that type. After the first stage about 25 build tiles were orange NEW at once
([ux3-new-badges](ux3-new-badges.png)), so it no longer marks anything. Suggestion: clear a tile's badge on hover, or
after a game day.

### 7. Paragraphs that are always on screen
These still go against "minimal text, details behind ?":
- Academy: three lines that also spell out hidden rules: "half again as long for dishes with 12+ raw ingredients",
  postcards, the 5-hour pace ([ux3-academy-text](ux3-academy-text.png)).
- Cuisines intro (four lines), Test Kitchen intro (three lines), Production plan intro, plus two paragraphs beside the
  Blueprint buttons, and the Codex price note.
- The Wholesaler tab is one card and one button in an otherwise empty window. "Hire him (💰300 a minute) for 💰1,500"
  is ambiguous: is 300 a minute his wage or how much he buys? ([ux3-wholesaler-tab](ux3-wholesaler-tab.png))

Suggestion: keep one short line or none, and put the rest behind a `?` tooltip (data-tip). The Wholesaler fits as a
compact card at the top of the Stock tab rather than a tab of its own.

### 8. The restaurant's "Add a dish" list is hard to use
It is a short scroll box of every dish, A to Z, including all the ones with 0 in stock, filtered by a native select
([ux3-restaurant-dish-picker](ux3-restaurant-dish-picker.png)). Once dozens of dishes are discovered, finding the 6 that
are actually in stock is slow. Menu rows also wrap their price ("17.8 a / plate").
Suggestion: list in-stock dishes first, with a toggle for "in stock only", and group by cuisine with the cuisine icon.
That also helps with the "which cuisines does this district want?" detective game.

### 9. The first dish goal sends you to an ingredient you can't see
The goal says "try bread + butter in the Test Kitchen", but Bread Loaf sits in the Bread & Dough group near the bottom,
below the fold, so the first view doesn't show it ([ux3-test-kitchen-first-goal](ux3-test-kitchen-first-goal.png)).
The clock also keeps running at Very fast while you search: a whole game day passed while I picked two ingredients.
Suggestion: a subtle highlight on the ingredients a guided goal names (only for the first goals), and pause or slow the
clock while the Test Kitchen is open.

---

## Low impact / polish

10. **Demolish overflows the inspector.** The Pause / Move / Demolish row is wider than the panel's padding, so Demolish
    touches the screen edge at 1366, 1440 and 1920 wide ([ux3-demolish-overflow](ux3-demolish-overflow.png)).
11. **Native `<select>` menus** for the Cookbook filters and the restaurant cuisine filter look different on Mac and
    Windows and can't show our SVG icons. The Test Kitchen and Codex already use the custom icon dropdown; using it here
    too matches the no-OS-emoji rule.
12. **Codex search** filters the list to "Pesto", but the right side keeps showing Bread Loaf until you click
    ([ux3-codex-search](ux3-codex-search.png)). Open the item when only one matches.
13. **The Cookbook cuisine strip** is cut off at the right ("Italian") with no scroll cue
    ([ux3-cookbook-strip](ux3-cookbook-strip.png)).
14. **At 1024 px wide** the top bar wraps to two rows and the Town tabs truncate ("The Market Ta…", "Town Gui…")
    ([ux3-1024-town](ux3-1024-town.png)).
15. **Town lots:** the TO LET sign is tiny, the "Pick a lot" tab looks disabled with no hint, and a selected lot isn't
    highlighted on the map.
16. **Blueprint ghost:** a dashed link runs off-screen to the lower right with nothing visible at its end
    ([ux3-blueprint-ghost](ux3-blueprint-ghost.png)). I only saw this once, so it is worth checking.
17. **The map hover label** ("Poultry House", "Fermentation Cellar · Yeast") sits over the hovered building and its
    neighbour; placing it above the building would keep the tile visible.
18. **Goals footer** says "1 experiments".
19. **The Inventory price column** shows unexplained badges like "×1.15" with a season icon, or a red "96%". They are fine
    for experienced players, but a data-tip ("Spring price", "You sold a lot; the price recovers") would help.

## Still open from the 8 Oct review
- #6 show, don't tell: the first screen is still a 9-point help text. Replacing it with a short welcome line plus the
  goal bar would also remove the spoilers in finding 1.
- #11 a farm report screen with charts over days, and #12 naming your farm.

## My suggestion for a first batch
1 (spoilers), 2 (toasts) and 3 (consistent chain numbers) are mostly text and logic changes with no balance impact.
Adding 5 (auto-pick single recipe) and 6 (NEW badges) makes the early game noticeably smoother for very little work.

## Fixed (12 Oct, same day)
1. **Spoilers:** a feature is only named once it has actually unlocked (`Game.featureKnown`); stage headers say "then unlocks something new" and the U/T teasers no longer describe the feature. The Town Guide's Legacy block shows from Grand Cuisine on. The Grand Cuisine goal and stage header don't mention the Town or restaurants until the Town is open. The Wholesaler and Dispatcher tabs and the Wholesaler stock note are hidden until unlocked. Help point 8 no longer lists the later order types.
2. **Toasts:** the placing/moving hint is one toast that stays while you place and disappears as soon as you place or cancel. Goal, unlock and discovery toasts that arrive while a window or discovery card is open wait and show when it closes.
3. **Chain numbers:** the plan now follows the Codex's route wherever the farm can use it and counts the same way (processing steps = steps with inputs, kinds of buildings = all, farms included). When a step of the usual route isn't open yet, a `?` on the plan's numbers says so. The discovery card reads "8 processing steps · 11 kinds of buildings, farms included".
4. **Daylight:** plain light from 05:00 to 19:30, lighter dawn and dusk, and the building status bars are drawn after the tint so their colours stay clear ([ux3-daylight-after](ux3-daylight-after.png), same hours as before).
5. **Single recipe:** a building that can make only one thing yet starts on it as soon as it is placed (kitchens and the Academy excepted).
6. **NEW badges:** each badge now disappears one game day after the building unlocked, or when you build one. Older saves start the day on load.
7. **Paragraphs:** the Test Kitchen, Cuisines, Academy and Production plan intros, the Blueprint explanations and the Codex price note moved into `?` tips next to their titles or onto the buttons. The Academy no longer spells out its pace, the 12+ ingredient rule or postcards. The Wholesaler is hired from a button in the Stock tab's storage bar (its tip explains he buys up to 💰300 of goods a minute); his tab only appears once he is hired.
8. **Restaurant dish list:** grouped by cuisine (cuisines with stock first, "N / M in stock" per group), an "In stock only" box, and the search also matches cuisines and ingredients ("cheese" finds Raclette). The list is taller and menu prices no longer wrap.
9. *Kept as is (not an issue).*
10. **Demolish:** the Pause / Move / Demolish row now shares the panel's width, so Demolish fits at every width (checked 1024 and 1440).
11. **Drop-downs:** the Cookbook's cuisine / show / sort filters and the restaurant's cuisine filter use the game's own drop-down (cuisine icons and dish counts, like the Test Kitchen and Codex group picker) instead of the browser's `<select>`.
12. **Codex search:** when the item on show isn't among the results, the Codex opens a match right away (an exact name first, else the first result).
13. **Cuisine strip:** a fade and a round ‹ › arrow appear on whichever side has more cuisines; the mouse wheel scrolls it sideways, and its position is kept when you click a cuisine ([after](ux3-cookbook-strip-after.png)).
14. **1024 px:** below 1220 px the top bar gets tighter (smaller pills and buttons, the logo hides from 1020 to 1100 px), so it stays on one row down to 1020 px, even with a seven-digit balance. The Town tabs are now the restaurant's name and "📰 Guide", with the full names as tips.
15. **Town lots:** open lots have a bigger TO LET sign that bobs gently; the selected lot gets a moving gold dashed outline on top of its neighbours; before a lot is picked the tab says "Click a TO LET sign" instead of a greyed-out "Pick a lot" ([after](ux3-town-tolet-after.png)).
16. *Kept as is.*
17. **Hover label:** a building's name label now sits centred just above the building (below it at the top edge), not at the cursor ([after](ux3-hover-label-after.png)).
18. **Plurals:** the Goals footer says "1 experiment" / "1 building".
19. **Price badges:** the season badge and the sold-a-lot percentage have tips ("Summer price: 90% of normal…", "You sold a lot recently, so the price is at 94% of normal. It recovers over time."). Also: hover tips now hide when a key is pressed, so a tip no longer lingers after a window closes with Esc.
