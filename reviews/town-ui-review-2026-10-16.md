# Town UI review (2026-10-16, v1.30.0)

## What the Town shows today

**On the map**
- Top left: Back to the farm. Top middle: critics banner ("visit this winter" / "in town now"). Bottom: a `?` for map controls, zoom + and −.
- District labels; each lot has a label with its name and rating (and a `!` when a menu dish is out of stock); free lots have a TO LET sign.
- Floating `+coins` / `sold out` over restaurants as guests eat.

**Side panel** (bottom sheet on phones), two tabs: the selected lot, and 📰 Guide.

| Tab | What is in it, top to bottom |
|---|---|
| Your restaurant (one long scroll) | Name + rename, lot and district, award · stars, rating, "max" ceiling, `?` · plates served, guests turned away, earned · **fit box**: cuisine notes (✓/✗ icons, "n of 5 found"), price fit, guest share vs Crestwell · Head chef (or the list of Academy chefs to promote) · Prices (3 buttons) · Menu (up to 12 rows: dish, ✗, cuisine, price a plate, ⭐/👨‍🍳, stock, plan, remove) · **Add a dish**: search, cuisine dropdown, "in stock only", then every discovered dish as a button, grouped by cuisine (often 100+ buttons) · Guest reviews (20) · Close restaurant |
| Rival lot | Name, rating, "cutting prices", blurb · the district card |
| Free lot | Open button, or what opens the district · the district card |
| Guide | Legacy checklist and Crestwell's offer · Food critics (when, Results button, one row per district) · Districts: 3 cards (name, lock, cuisine notes, "hearty food · low prices", standings with stars and guest share) |

**Windows**: 📰 Restaurants of the Year (critic results and score sheets), Legacy, the locked-town teaser.

## What gets in the way

1. **The restaurant tab is one very long scroll.** What you check all the time (rating, stock, guest share) sits next to what you touch once (rename, head chef, close), and the reviews are at the very bottom, below the add-a-dish list of 100+ buttons.
2. **Adding dishes is always open.** The picker takes most of the panel even when the menu is full.
3. **Cuisine knowledge is tiny and in three places**: the fit box, the district cards and the ✗ in the dropdown. The ✓/✗ cuisine icons have no names, and hovering one shows two tooltips at once (the "What the critic has told you" tip on the row plus the cuisine name on the icon). The three still-unknown cuisines aren't shown at all.
4. **Competition is split**: your share is in the fit box, the full standings only in the district cards (Guide, rival and free lots).
5. **No overview of your restaurants**: with three districts open you click each lot to see which one is out of stock or losing guests. Only the map's `!` hints at it.
6. **Critics are spread out**: banner on the map, schedule in the Guide, results in a window.
7. Small things: menu rows and pick buttons use native `title` tooltips (different look and delay from the `data-tip` ones); "max 4.4" has no hint of why.

## Proposed regrouping

### Option A: restaurant sub-tabs + Town overview (recommended)
- **Restaurant tab** gets a compact header that always shows (name, stars, rating, guest share vs Crestwell, turned away today) and three sub-tabs:
  - **Menu**: the 12 menu rows with a stock bar each, price buttons above them. "+ Add dish" opens the picker as a drawer over the panel (search, cuisine filter, in stock only), closed again after adding.
  - **District**: what you know about the district as named chips: ✓ Swiss Alpine, ✗ Italian, and grey "?" chips for the ones still unknown; one tooltip each. Price fit, standings against Crestwell, the head chef.
  - **Reviews**: the 20 reviews with their average at the top (equal to the rating), plus the rename and close buttons at the bottom.
- **Guide tab** becomes **Town**: a table of your restaurants (stars, guest share, dishes out of stock, coins a minute; click to jump), the district standings, then **Critics** (when they come, what they weigh, last year's score sheets inline) and the Legacy.
- Map: lot label turns red with a count when dishes are out of stock.

### Option B: same scroll, tidied
- Sections fold (remembered), in this order: header, District, Menu, Reviews, Head chef; Add a dish moves into a window. Cuisine chips with names as in A. Smallest change, but still one long panel.

### Option C: a Restaurants window
- The side panel only shows a short summary of the selected lot; everything else moves to a full window (like Inventory) with a page per restaurant and an overview table. Most room, but takes you off the map you just built.

Whichever is picked: cuisine chips with names and one tooltip, `data-tip` everywhere, and the picker no longer always open.
