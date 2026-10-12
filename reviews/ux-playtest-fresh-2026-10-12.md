# Fresh UX playtest, 2026-10-12

Played in headless Chromium (1440×900, plus checks at 1280×720 and 1920×1080) from a new game, the way a new player would: intro, first goals, first dish, orders, selling, bakery, hens. After day 2 I used cheats (`stage B`, `stage C`, `money`, `stock`, `guests`) and marked 76 dishes discovered by script to reach the Academy, Wholesaler, Blueprints and the Town. Earlier review reports were not read. No console errors at any point.

Screenshots are in [ux-fresh-2026-10-12/](ux-fresh-2026-10-12/).

Findings are ranked by how much they hurt a new player. Each one has a suggested fix that keeps the game's rules: little always-visible text, details in ? tooltips, no spoilers, SVG icons only.

---

## 1. The top-bar buttons are 11 bare icons, even on a wide screen

![top bar at 1920 px](ux-fresh-2026-10-12/topbar-1920.png)

At 1440 px and even at 1920 px, the right side of the top bar is eleven unlabeled icon buttons. The `<span>` labels in index.html appear only above 2080 px (`@media (max-width: 2080px)` in style.css hides them), so almost no screen shows them. A new player has to hover each one to find Inventory, Test Kitchen and Orders, which are the three things the first goals ask for. Several icons are also hard to tell apart at that size: the Test Kitchen tube looks like a pencil, and Cookbook, Journal and Orders are all small rectangles.

Two more gaps:
- The Culinary Academy has no top-bar button. It opens only with the U key or through the building's inspector.
- The Cookbook tooltip leaves out its shortcut (B). The other buttons list theirs.

**Suggestion:** show the labels whenever the bar has room (it does at 1440+), and collapse them to icons only on narrow screens. Add an Academy button once the Academy is unlocked, the same way the Town button appears.

## 2. Upcoming content is spoiled in four places

The game should surprise, but these windows show the future:

| Where | What it shows too early |
|---|---|
| **Goals window** (G) on day 1 | Every goal to the end: "Open a new cuisine: Swiss Alpine or Nordic & Dutch", "Finish European Classics", "**Discover 75 dishes**" (the secret Town trigger), "Make Dark Chocolate", "Cook every dish in 3 cuisines". ![goals](ux-fresh-2026-10-12/goals-all-visible.png) |
| **Codex** (X) | All 680 ingredients from the start (Ackee, Black Truffle, Berbere…), with no mark for which ones you have seen. "Used in" names future cuisines ("The Americas dish"). ![codex](ux-fresh-2026-10-12/codex-all-ingredients.png) |
| **Academy job applicants** | Chefs "trained in Oaxaca, **The Americas**" and "Around the World" show up while the Cuisines window still calls those stages "A new cuisine". The two windows contradict each other. ![academy](ux-fresh-2026-10-12/academy-chef-spoiler.png) |
| **Intro "How to play"** | Nine numbered paragraphs that already explain toques, stages, cuisines, Plan production and the map bar's five colours before the player has placed anything. ![intro](ux-fresh-2026-10-12/intro.png) |

Customer names such as "Harbour Bistro" also hint at the Harbour district, but that one is mild.

**Suggestions:**
- Goals: show finished goals, the current goal and the next one or two. Hide the rest behind "More goals appear as you go".
- Codex: list only items the player has seen (`S.seen`) plus the ones in unlocked recipes. Show the rest as a count ("412 still unknown"). In "Used in", show a locked cuisine as "a cuisine yet to be discovered".
- Academy: only offer chefs from cuisines that are open or are the next stage, and name the next stage through `Game.stageName`.
- Intro: cut it to three lines (build, click a building, Test Kitchen) and move everything else into ? tooltips where it is needed.

## 3. Early game: goods are wasted silently, and Sell All moves the rows

![before](ux-fresh-2026-10-12/inventory-before-sell.png) ![after](ux-fresh-2026-10-12/inventory-after-sell-all.png)

- Before the Wholesaler, nothing is ever sold automatically. By day 1 at 21:00, Potato and Wheat Flour were already at 50/50 and their buildings kept running into a full store. The only sign is amber text inside the Inventory. Money fell from 4,047 to 3,656 over one in-game day of normal play.
- **Sell All removes the row.** After selling all potatoes, the Potato row vanished and Animal Feed moved up under the cursor, so a second click would sell the wrong item. Selling down to 0 should keep the row, showing 0.
- The sale gave "Sold for 61.0" while the listed price suggested about 99 (50 × 1.72 × 1.15). The price drop from flooding the market is not shown before you click. "61.0" also uses a different number format from the rest of the UI.

**Suggestions:** keep zero-stock rows until the window closes. Show the actual payout on hover over "All". Before the Wholesaler, give a one-time toast the first time something hits its storage cap ("Potato store is full; sell some or it goes to waste"). Or give a basic "sell the overflow" option from the start and let the Wholesaler add the fine control.

## 4. Too many unlocks at once

![first dish](ux-fresh-2026-10-12/first-dish-flood.png) ![orders](ux-fresh-2026-10-12/orders-unlock-flood.png)

- Cooking the first dish produced, at the same moment: 3 stacked toasts, 5 build tiles marked NEW, an Orders badge, a Journal badge of 7, and a NEW badge on Cuisines.
- The first order arrived right away, before the guided goal for it. Delivering it completed "Deliver a customer order" out of sequence and also unlocked Kitchen garden (Hothouse, Press, Spice Mill, Sauces). That brought the menu to 8 NEW tiles before the player had built hens.
- The Journal badge sits at "9+" from day 2 on, so it stops meaning anything.
- At 1280×720 the build menu already needs scrolling by day 2, and Bakery and Kitchen fall below the fold. ![1280](ux-fresh-2026-10-12/viewport-1280.png)

**Suggestions:** hold back non-guided orders until the "Deliver a customer order" goal is current, or make that goal accept any earlier delivery without unlocking ahead. Clear a NEW tag when the player hovers or builds that tile, and don't add more than about 3 at once. Badge the Journal only for things the player didn't cause (weather, critics, chefs).

## 5. Chain numbers disagree between windows

![discovery](ux-fresh-2026-10-12/discovery-counts.png) ![plan](ux-fresh-2026-10-12/plan-counts.png)

For Buttered Toast, the discovery card and Cookbook say **8 steps · 11 kinds of buildings**. Plan production says **7 processing steps · 9 kinds of buildings**. In the same Plan window, "**3** steps still missing" sits right above "**4** steps are not unlocked yet". Farmhouse Kitchen shows "1 of **13** dishes" in Cuisines and "1 / **11**" in the Cookbook. Teaching how long supply chains are is the point of the game, so these numbers need to match. "More kinds of buildings than steps" (Boiled Eggs: 4 steps, 7 buildings) also reads as wrong unless the farms are explained.

**Suggestion:** compute every count from one helper. Label buildings as "7 places (farms + workshops)". Explain locked versus missing in a ? tooltip.

*Update after checking with the other playtest thread:* the 7/9 versus 8/11 gap is probably the expected early-farm case, not a leftover bug. Another thread already made Plan production follow the Codex route. On my day-1 farm the usual yeast route (Sugar Refinery, then molasses) was still locked, so the plan used the Wild Yeast Culture route instead, and the plan's ? tooltip explains that. What still needs a look: the "3 still missing" versus "4 not unlocked" wording, and the 13 versus 11 dish counts.

## 6. Finished guided steps show a padlock

![padlocks](ux-fresh-2026-10-12/guided-steps-padlocks.png)

In Cuisines › Guided first steps, Farmyard, Dairy & pantry and Kitchen garden were unlocked, yet they show 🔒 and grey text, which looks locked. The Goals window also puts "🔒 Farmyard" tags on goals, where they mean "unlocks Farmyard", not "this goal is locked".

**Suggestion:** use ✓ for done steps and a gift or arrow icon for the "unlocks X" reward tag.

## 7. Map and inspector signals are hard to read

- **Flows does not show an input that has no producer.** The Kitchen waited on Butter that nothing on the farm makes, yet Flows drew no red line, because there was no source to draw from. That is exactly when the player needs the cue. ![flows](ux-fresh-2026-10-12/flows-missing-butter.png) Suggestion: draw a red dashed stub with a "?" from the building toward the edge.
- Inspector input pills show "+16 / −14" and a "−15%" pin with no labels. ![inspector](ux-fresh-2026-10-12/inspector-numbers.png) Suggestion: put "made / used per min" in a ? tooltip.
- In the Inventory, the price column mixes "73%" in red (market saturation) and "×0.9" with a season icon, with no explanation.
- The restaurant header "🍽 30 · 😠 0 · 💰1,354" is three bare numbers.
- Buildings with a single recipe (Well, Bakery) still show the search box, "Choose what to produce" and the production-rate slider. Hiding them until there are two or more choices would cut a third of the panel.

## 8. Choosing a crop shows nothing about money

![crop tip](ux-fresh-2026-10-12/crop-choice-tooltip.png)

The Field's recipe list shows only time per cycle. The hover tip adds seed cost but not what the harvest is worth, so Wheat and Lettuce can't be compared. The tip also appears on top of the next row (Cucumber). Suggestion: add "worth ≈ X per cycle" to the tip and anchor it beside the list instead of under the cursor.

## 9. Popups and default choices that surprise the player

- **A dish discovery card popped up while I was placing a blueprint.** An Academy chef finished a dish, and the card took the click that should have set the blueprint down. ![interrupt](ux-fresh-2026-10-12/discovery-interrupts-blueprint.png) Suggestion: while the player is placing or a window is open, queue discoveries made in the background as a toast.
- **Hiring the Wholesaler immediately sells everything above half storage.** Wheat went from 47 to 25, plus eggs and flour, at depressed prices (69–73%), with no step to opt in. ![wholesaler](ux-fresh-2026-10-12/wholesaler-autosell.png) Suggestion: start with auto-sell Off and say once that "Default" is available, or confirm on hire.
- **Cuisines lets you open Swiss Alpine on day 1 for 1,000** (a quarter of the starting money) in one click. That cuisine needs 16 new buildings. A gentle "you have 1 of 16 buildings" note, or a confirm step, would stop new players from spending into a dead end. ![cuisines](ux-fresh-2026-10-12/cuisines-day1.png)
- Opening a cuisine for 4,000 gives no celebration, while every other unlock gets a splash.

## 10. Small polish

- Test Kitchen: old results pile up below the slots ("Discovered Buttered Toast!" was still there a day later). Keep only the latest result. The large empty area under the slots could show the current hint target.
- The Blueprint bar says "Creamerys at 100%". It should say "Creameries".
- The unlock splash (plain modal with bullets) and the dish discovery card (warm glow with stats) look like two different games. Bringing the splash into the discovery card's style would tie them together.
- The night tint at 01:44 is dark enough that fields and small buildings are hard to read. ![night](ux-fresh-2026-10-12/night-tint.png)
- In the restaurant's Add a dish list, "In stock only" is off by default, so the list is long rows of "0". Turning it on by default (or sorting by stock) would help. ![restaurant](ux-fresh-2026-10-12/restaurant-panel.png)
- The first goal, "Pump water from your Well", completes on its own because the starting well already pumps, so it teaches nothing. "Click your Well" would.
- The "The critics visit this winter" banner and the toast with the same message appear together.

---

## What worked well

- The dish discovery card (raw ingredients, then steps, then plate) is the clearest teaching moment in the game.
- The Codex's "Where the price goes" bar and its supply-chain tree are excellent.
- Delivery animations from field to mill make the map feel alive. The proximity rings while placing are a nice touch.
- Blueprints placed a 7-building mozzarella chain in two clicks and packed it neatly.
- The Town map is beautiful. Opening a restaurant is quick, and the "Fair (they like Low)" nudge is the right size.

## Quick wins (small changes, big effect)

1. Show top-bar labels at ≥1280 px, and add an Academy button (#1).
2. Keep Inventory rows at 0 after Sell All (#3).
3. Use ✓ instead of 🔒 on finished guided steps (#6).
4. Hide future goals beyond the next two (#2).
5. Queue background discoveries while the player is placing something (#9).
6. Make one helper for chain counts (#5).
