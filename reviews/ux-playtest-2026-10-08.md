# Root of All Dishes UI/UX playtest, 8 Oct 2026 (round 2)

Scope: only look, feel and ease of use, plus ideas to make the game more appealing. Mechanics and balance were covered
in [playtest-2026-10-08.md](playtest-2026-10-08.md) and are not repeated here.

How it was tested: headless Chromium at 1920×1080, 1440×900, 1280×720 and 1024×700. I played the first minutes through
the real interface (help screen, first Field, Kitchen, bread + butter in the Test Kitchen), then built a mid-game farm with
the French pack (36 buildings, day 3 to day 7, through a winter storm) and opened every window. No console errors.

## Small UI bugs fixed in this pass

1. **Placement tooltip stuck on the map.** After placing a building, "✅ Build Field (💰50)" stayed next to the cursor
   until the mouse moved. It now updates straight away, and cancelling a placement hides it.
2. **"Let's farm!" was below the fold at 1280×720,** at the end of a long help text. It now stays pinned at the bottom of
   the help window.
3. **Closing the first help screen with ✕ or Esc left a new farm paused** with nothing obviously wrong. Closing it any way
   now starts the clock, just like "Let's farm!".
4. **Warehouse showed "+24 −0/min"** for items nothing uses. It now shows only the side that exists ("+24/min").
5. **Market columns:** the Stock and Price headers sat on the left while the numbers were right-aligned far away. Headers
   now line up with their numbers.
6. **Shop repeated pack names** ("French / French", "African / African"). The subtitle only shows when it adds something.
7. **Inspector search box** was narrower than the recipe list below it. It now spans the panel.
8. **Building costs vanish below 1100 px wide** to save space. The build buttons' tooltips now include cost and upkeep.

Downloads (foodsim.html and foodsim.zip) are rebuilt.

## Status: ideas 1 to 4 implemented (8 Oct, same day)

- **Living map:** four seasonal terrains that cross-fade (blossom, autumn leaves, snow on grass, trees, rocks and fields,
  frozen shores), weather overlays (rain, storm with lightning, snow, drought and frost tints, falling leaves and petals),
  working buildings breathe and smoke, cows, sheep, goats, pigs, hens and ducks wander in their pens, and stopped
  buildings are dimmed. Animations stop when the game is paused; particles are off with reduced motion
  ([winter](ux-after-winter.png)).
- **Discovery card** for every new dish: the dish large, its ingredients, and its chain as raw ingredients ➜ processing
  steps and buildings ➜ plate, with Cook it in your idle Kitchen / Plan production buttons. Several discoveries queue
  ([screenshot](ux-after-discovery-card.png)).
- **Cookbook:** undiscovered dishes are silhouettes of their own icon, and a strip of cuisines shows progress
  (click one to filter; a finished cuisine turns gold) ([screenshot](ux-after-cookbook.png)).
- **Farm journal** (📰 button, `J`): keeps every event with a clock time, grouped by day; daily reports are a small
  newspaper with the farm's share of sales. Toasts are now at most three, clamped to three lines, and ambient events
  wait in the journal while a window is open ([screenshot](ux-after-journal.png)).
- Also fixed: the top bar overflowed between 1500 and 1880 px wide (labels now show only from 1880 px).

## Ideas to make it more appealing, most valuable first

### 1. Make the map feel alive and show the seasons
Right now the map is the main screen but nothing moves except water shimmer and a progress bar. Winter during a storm
looks exactly like a sunny summer day ([screenshot](ux-winter-looks-like-summer.png)), so the season system, which
matters a lot for play, is invisible unless you read the top bar.
- Seasonal terrain: blossom specks in spring, warmer grass in summer, orange trees in autumn, snow on grass and roofs in
  winter. The terrain is pre-rendered once, so this is four cached versions, cheap to draw.
- Weather overlays: rain streaks, a darker tint and the odd lightning flash in a storm, drifting snow.
- Small working animations: windmill sails turning, chimney smoke from bakeries and smokehouses while they run, hens and
  cows wandering inside their pens, fields showing seedling, growing and ripe stages.
- Idle or stopped buildings slightly desaturated, so a glance shows what is running.

### 2. Give each dish discovery its own moment
Discovery is the core reward, yet it arrives as one toast among "Goal complete" and "Unlocked 17 steps"
([screenshot](ux-first-discovery.png)). Reuse the tarte flambée overlay in a smaller form: a card with the dish drawn
large, its cuisine, and a little animated chain ("5 raw ingredients → 8 steps → 11 kinds of buildings → your plate"),
with **Cook it in a Kitchen** and **Plan production** buttons. This is also the best teaching moment in the game.

### 3. Turn the Cookbook into a collection you want to fill
Undiscovered dishes are rows of identical blue ❓ circles. Ideas:
- Show each undiscovered dish as a dark silhouette of its own icon. A shape to guess is far more tempting than a
  question mark, and all 448 icons already exist.
- A progress strip per cuisine at the top ("French 2/32", "Everyday Basics 4/19") with a small stamp when one is complete.
- Uniform card heights so the grid reads like pages of a recipe book.

### 4. Quieter, better-placed notifications
Toasts stack up to five deep in the bottom right and cover open windows and the inspector
([screenshot](ux-toasts-over-cookbook.png)). Day summaries and "New ingredients made" lists are paragraphs, not toasts.
- Keep toasts to one line, at most three, and hide all but discoveries while a window is open.
- Add a 📰 **Farm journal** button that keeps every message (day summaries, unlocks, new ingredients, weather), with a
  dot when something new arrives.
- Turn the daily summary into a short morning newspaper card in the journal, with a bar for farm / processing / kitchen
  value. This keeps the teaching numbers without interrupting play.

### 5. A Flows view that can be read in the mid-game
With 36 buildings, Flows is a tangle of yellow lines ([screenshot](ux-flows-midgame.png)).
- Hovering a building with Flows on shows only its links and fades the rest.
- "Follow an item": pick Butter and see only the path from grass to cow to cream to butter to the plates that use it.
  That is the supply-chain lesson as one picture.
- Group parallel lines carrying the same item into one thicker line.

### 6. Show, don't tell, in the first five minutes
The help screen is nine numbered paragraphs before you have touched anything. Instead:
- Open on the map with a short welcome line, and let the goal bar carry the tutorial: a **Show me** button on the next
  goal that pulses the right thing (the Well in the build menu, then the map tile, then the Test Kitchen button).
- Keep the full help in the ⚙️ menu for later.
- The starting farm feels empty ([screenshot](ux-start-map.png)): a fence around the farmhouse, a path, a few placed
  decorations and a closer starting zoom would make it look like a farm from second one.

### 7. Make the Test Kitchen feel like cooking
- Slots as a wooden board or a pot, and small reactions to each try: a shake for "nothing comes of this", a warm glow and
  a 🌡️ cold / warm / hot meter for near misses, a burst for a new dish.
- Group the ingredient list by category like the Warehouse, and mark ingredients that are new since your last visit.
- The empty half under the slots could list your last tries and the closest dish so far.

### 8. Sound, off by default or with an easy mute
A coin clink for sales, a soft chime for discoveries, the odd rooster or bird. All can be synthesized with Web Audio, so no
sound files are needed and the game stays one HTML file.

### 9. A Shop that sells the food, not the buildings
After the first pack, every card shows "1 new building" with one tiny icon
([screenshot](ux-shop-after-first-pack.png)), which says nothing about why you'd want the pack.
- Lead each card with five or six signature dishes drawn large (as silhouettes until discovered) and a colour band per
  cuisine.
- When a pack is too dear, the greyed button could say "Need 💰1,250 more" instead of just being pale.

### 10. Readability of a busy farm
- Many kitchens look identical; the dish badge is small. Kitchens could show their dish large, with the house small.
- Hover names already exist; at low zoom, a status colouring (green running, amber waiting, grey idle) would make
  problems visible across the whole farm.
- Optional: paths between neighbouring buildings drawn automatically, so a cluster reads as a farmyard rather than a grid of tiles.

### 11. A farm report screen
A page with simple charts over days: income vs upkeep, dishes discovered, the farmer's share of what you sold, and your
longest supply chain so far. It suits the educational aim and gives a sense of progress between goals.

### 12. Little touches of ownership
Name your farm at the start (shown in the top bar and in the newspaper), pick the farmhouse roof colour.

## My suggestion for a first batch
1 (living map and seasons), 2 (discovery moment), 3 (Cookbook silhouettes and cuisine progress) and 4 (journal instead of
stacked toasts). Together they change how the game feels the most, and none of them touch the economy.
