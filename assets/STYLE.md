# Root of All Dishes icon style guide

One hand-drawn SVG set replaces the emoji, so the game looks the same on every OS. Every icon must look like
it came from the same illustrator. When in doubt, copy what `icons/reference.js` does.

## Canvas

- `viewBox="0 0 64 64"`. Icons are stored as **inner markup only**; `FSI.svg(id, size)` adds the wrapper:
  `fill="none" stroke="#3b2b22" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`.
- Keep the drawing inside x 3–61, y 3–61. The object should fill the frame: its widest side spans 44–58 units.
- Standing objects sit on a ground shadow at y≈58: `K.shadow(rx)`. Flat things (sliced items, tiles) may skip it.
- Must read at 24 px: one clear silhouette, few details, no hairlines thinner than 1.2.

## Line

- Every filled shape gets the inherited outline (2.5, colour `C.ink`). Never use black or another outline colour
  for silhouettes.
- Inner details (seams, veins, cuts, scoring) use `K.line(d, 1.2–2)` in ink, or a darker shade of the fill.
- Don't scale up composed markup with `K.place`/`K.ref` (s > 1): it thickens the outline. Scaling down (badges,
  small glyphs, repeated pieces) is fine.

## Colour

- Use only the palette in `FSI.C` (`kit.js`). Each hue has light / base / dark (`leafL`, `leaf`, `leafD`).
  Main fill = base; top surfaces or cut faces = light; sides in shadow = dark.
- Flat fills, no gradients, no filters, no opacity tricks except the kit's `K.hi` / `K.hiE` (white highlight) and
  `K.sh` (ink shade).
- Light comes from the **top-left**: one highlight near the top-left of the main body, an optional shade along
  the right / bottom edge. At most one of each per object.

## Perspective

- **Crops, fruit, vegetables, nuts, spices (whole)**: front view, slightly tilted or grouped (1–3 pieces).
  Leafy/herb items: a bunch or sprig. Grains/seeds: an ear, pod or a small heap of seeds.
- **Animals (livestock, fish, shellfish)**: whole animal, side view **facing left**, like `cattle`.
  A dairy animal is still the animal (never a milk carton). Fish: horizontal, head left.
- **Meat, charcuterie, cheese**: the cut as sold (steak, ham leg, sausage links, wedge, wheel), 3/4 view from
  slightly above, like `cheddar`.
- **Processed goods** use the shared containers so families read as families:
  flours, grains, starches, sugars, salts, feeds → `K.sack(fill, glyph)` with a glyph of the source (`wheat_flour`);
  liquids → `K.bottle` (`wine` / `oil` / `flask`); spreads, pastes, ferments, preserves, honey → `K.jar`;
  milks → bottle + `K.badge(animalId)` (`cow_milk`). Vary the fill colour and glyph so siblings differ.
  Use the plain object instead when it is iconic on its own (a loaf, a baguette, butter block, tofu block, an egg).
- **Dishes**: the food served, 3/4 view from slightly above, on `K.plate` / in `K.bowl` / `K.pot` / `K.glass` /
  `K.board`, or freestanding when that is how it's eaten (burger, sandwich, taco, cake). Show the 2–3 ingredients
  that make the dish recognisable; add `K.steam()` only for soups/stews/hot drinks.
- **Buildings**: small structure in 3/4 view standing on a grass ellipse (`b_mill`) or as an isometric tile
  (`b_field`). Recognisable by one strong prop (windmill sails, chimney with smoke, beehive, boat).
- **UI icons**: same line and palette, simpler: a single object, no ground shadow.

## Technical rules

- Allowed elements: `path`, `circle`, `ellipse`, `rect`, `polygon`, `polyline`, `line`, `g`.
  No `id` attributes, gradients, filters, `<text>`, `<image>`, `<style>`, `<use>`.
- About 4–15 elements per icon; aim for under 1.5 KB of markup.
- Icons are values in `FSI.add(group, { id: markup })`. A value may be a function returning markup (needed when it
  calls `K.ref` / `K.badge`, which look up other icons when drawn). Ids are the game's item ids; buildings are
  `b_<buildingId>`, UI icons `ui_<name>`.
- Use helpers from `kit.js`: `K.hi K.hiE K.sh K.shadow K.line K.dots K.place K.ref K.badge K.sack K.jar K.bottle
  K.glass K.bowl K.plate K.board K.pot K.steam K.crate`. Read their comments for coordinates.
- Check your work: `node tools/icon-sheet.js out.png <group>` renders each icon at 96 px and 28 px next to the
  emoji it replaces and reports parse errors. Look at the PNG.
