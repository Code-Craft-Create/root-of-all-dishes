# Drawing performance check (v1.28.1, 2026-10-16)

## How it was measured

- Two saves from the play-through bot (`tools/playsim.js`, final state written out): a **big farm** (seed 1: 1,426 buildings,
  11 plots, every dish found) and a **mid-game farm** (seed 4: 511 buildings, 1 plot, stage C).
- Headless Chromium (Playwright), 1600×900, game at ⏩ speed. Per scenario: 3 s to settle, then 6 s measured: frames per second,
  95th-percentile frame time, JS time per frame in `Game.tick`, `Render.draw` and `UI.frame`, and the main thread's total task time.
- The container has no GPU, so Chrome rasterises everything on the CPU. Absolute frame rates are far lower than on a real
  computer; the before/after ratios are what count.

## Results

Big farm, device pixel ratio 1:

| View | fps before → after | `Render.draw` ms/frame | main thread ms/frame |
|---|---|---|---|
| Farm, zoom 1 | 6.5 → 24.2 | 110 → 9.6 | 151 → 40 |
| Farm, zoomed out (0.3) | 4.1 → 17.3 | 192 → 19 | 237 → 56 |
| Night | 3.8 → 15.5 | 193 → 15 | 257 → 63 |
| Storm | 5.0 → 20.4 | 159 → 13 | 198 → 48 |
| Chains, every link (29,000) | 0.5 → 3.3 | 1,542 → 247 | 2,070 → 294 |
| Chains, filtered to bread | 4.1 → 10.7 | 179 → 26 | 238 → 92 |
| Settings window open | 4.5 → 16.0 | 177 → 14 | 219 → 61 |
| Cuisines window open | 4.3 → 14.8 | 183 → 14 | 228 → 66 |
| Inventory open (Stock tab, 870 rows) | p95 2,717 ms → 283 ms | `UI.frame` 656 → 7.5 ms | |
| Town | 17.2 → 17.6 | `UI.frame` 8.2 → 4.4 ms | 53 → 50 |

Big farm, device pixel ratio 2 (Retina): farm 3.6 → 10.8 fps (draw 207 → 14 ms), zoomed out 3.0 → 10.8 fps (draw 278 → 21 ms).

Mid-game farm: farm 7.3 → 29.3 fps (draw 101 → 7 ms), Chains 1.4 → 16.9 fps, Inventory `UI.frame` 265 → 2.8 ms (p95 1,800 → 217 ms).

## What was slow, and the fix

1. **SVG icons drawn straight onto the canvas.** Every `drawImage` of an SVG replays its vector shapes, and working
   buildings breathe and crops grow, so sizes changed every frame. Icons are now rasterised once per size step (an eighth of
   an octave) and the bitmap is drawn (`iconBitmap` in render.js). Biggest single win.
2. **Terrain: hundreds of chunk images per frame** (over a thousand zoomed out). A still camera now copies the terrain from
   one screen-sized cache, drawn once the view has held still for a frame with every chunk sharp.
3. **Night glow:** a radial gradient per building per frame became one pre-drawn glow image.
4. **Chains overlay:** water links were checked against every well before being thrown away; off-screen links were stroked;
   the stub fan-out counted with a nested filter. Now water is settled first, off-screen links and focus boxes are skipped,
   and above 300 links on screen the links are drawn into two screen-sized caches (still links, and the pulsing "waiting"
   ones laid on with the pulse as opacity), redrawn when the links change, at most every half second and less often when a
   redraw is slow. Up to 300 links everything is still drawn one by one each frame, exactly as before.
5. **Inventory refresh rebuilt the whole window every second** (870 rows, 15,000 elements, plus re-iconising). The Stock
   tab now swaps only the cells, storage bar and "Sell above" bar whose HTML changed while the rows stay the same.
6. **Small DOM costs every frame:** the top bar and build bar searched the whole document (which also holds the Town's
   SVG) on every money change; now they search only the top bar and window header. In the Town, the boats were re-appended
   to the SVG every frame (each a DOM mutation), walkers and train re-set unchanged attributes, an idle weather canvas was
   cleared every frame, the weather canvas size was read after the walkers moved (forcing a layout of the town SVG every
   frame), the critic banner was rewritten twice a second, and the night tint styles were rewritten even when unchanged.

## Looks

Screenshots before and after (game paused, same frame time) were compared pixel by pixel: farm, zoomed in and out, night,
Chains filtered and a selected building differ only along icon edges (sub-pixel resampling). With every Chains link on, the
tangle draws its waiting links under the still ones instead of in farm order, which looks the same in a tangle that dense.

## What is left

- **The Town** is limited by its SVG: about 18,000 elements in the static back layer and 5,500 in the live front layer.
  Moving walkers and boats make Chrome repaint and re-layer it every frame (about 18 ms of layerising and 9 ms of painting
  per frame here). A next step would be drawing the static back layer as one image per zoom level, with the season, night
  and detail-level styles baked in.
- **Chains with every link on a giant farm** is still heavy while the camera moves (each frame strokes every link on screen).
