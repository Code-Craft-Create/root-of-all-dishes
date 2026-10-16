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

- ~~**The Town**~~: done in v1.29.1, see "Town follow-up" below.
- **Chains with every link on a giant farm** is still heavy while the camera moves (each frame strokes every link on screen).

## Town follow-up (v1.29.1)

Same big-farm save (seed 1, Town open), headless Chromium at 1600×900, game at ▶ speed; 3 s to settle, then 6 s measured.
"Main thread" is Chrome's own task time per frame (`Performance.getMetrics` TaskDuration). Headless Chrome tops out at 60 fps.
Zooming is a non-stop zoom in and out for the whole 6 s.

| View | fps before → after | p95 frame (ms) | main thread ms/frame |
|---|---|---|---|
| Town, still | 36.4 → 58.7 | 50 → 17 | 26.3 → 11.4 |
| Town, panning | 30.7 → 54.0 | 50 → 33 | 30.7 → 13.9 |
| Town, zoomed out | 30.7 → 59.3 | 67 → 17 | 31.3 → 12.2 |
| Town, zooming | 23.1 → 37.3 | 67 → 50 | 42.5 → 23.3 |
| Town at night | 28.4 → 47.5 | 67 → 33 | 31.2 → 14.1 |
| Town in a storm | 32.7 → 56.2 | 50 → 17 | 29.0 → 12.7 |

Device pixel ratio 2 (Retina): still 30.3 → 36.7 fps (main thread 32.1 → 21.7 ms), panning 29.5 → 42.7 (33.0 → 18.8),
zoomed out 24.5 → 49.0 (40.1 → 16.0), night 23.7 → 36.0 (38.6 → 19.7), storm 24.1 → 38.0 (40.9 → 21.7), zooming
19.7 → 23.8 fps (50.2 → 37.2 ms; its p95 rose from 83 to 133 ms, the frames where the picture is redrawn sharp).

What changed:

1. **CSS animations in the town SVG were the biggest cost.** The windmill's sails, the fountain, the bobbing boats and
   TO LET signs, the ferry's and chimneys' smoke and the money notes were CSS transform animations. Chrome gives each such
   element a layer of its own, and with thousands of shapes around them, working out the layers (Layerize) took about
   10 ms of every frame. They are now set from `TownMap.tick` each frame (`LOOPS` in townmap.js, same durations, easing
   and delays), which is just a repaint: Layerize fell to under 3 ms. Rule: no CSS `animation` or `transition` of
   transform/opacity on elements inside the town SVG (the selection ring's dash animation is fine: it is not a transform).
2. **The back layer is a picture.** The ground, sea, countryside and outer land (about 18,000 shapes) are turned into an
   SVG image once per set of classes (season, `night`, `lod`), with the town's CSS rules inlined, and drawn onto a canvas
   under the front layer. The canvas reaches 200 px past the view and is moved with a CSS transform when panning; it is
   redrawn only when the view runs past it (moving what is drawn and filling in the new strips) or the zoom changes (a run
   of quick zoom steps stretches it and draws it sharp 150 ms after the last step). It is drawn off screen and handed over
   as a bitmap (`bitmaprenderer`), because here a 2D canvas on the page was copied again on every frame. The live back SVG
   stays hidden in the page and shows only until the first picture is ready, or if a picture can't be made (the CSS
   rules can't be read when index.html is opened straight from disk; the built download and a served folder are fine).
3. **The view lands on whole pixels**, so the picture and the SVG above it line up exactly when panned.

Cost: building a picture takes 150-500 ms of main thread once per season, day/night and detail level (four are kept).
The picture for after dusk or dawn is made a little before the switch, and the other detail level is made when the town
is idle, so zooming across it does not wait.

Looks: screenshots (game paused, animations stopped, camera on whole pixels) of day, each season, night, winter night,
zoomed in and out (with and without `lod`), panned and a selected lot match the old version to within anti-aliasing
(at most 0.3% of pixels differ by more than 4 of 255, none visibly), at device pixel ratio 1 and 2. The storm differs only
in its random raindrops. Sails, smoke and fountain were checked in motion.

Still left: the Town's weather canvas is copied to the screen every frame while it rains, snows or the drought shimmers
(about 4 ms per frame at Retina size here).
