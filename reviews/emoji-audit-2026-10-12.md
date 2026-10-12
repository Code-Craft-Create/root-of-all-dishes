# Raw emoji left in the UI (audit, 2026-10-12)

**Update 2026-10-12: done.** Every colour emoji listed below is now an SVG (30 new icons in `assets/icons/ui-more.js`, aliases in `FSI.uiAlias`, Town map icons drawn as SVG `<image>`, emoji tooltips moved to `data-tip`). Only plain text glyphs (★ ▾ ▼ ✱ ✓ ✗ ♥) remain on purpose.

Original analysis: How it was checked:

- Static scan of `index.html`, `js/ui.js`, `js/game.js` (toasts, journal, goal texts), `js/townmap.js`, `js/render.js`, `css/style.css`, `js/data/*.js`.
- Runtime probe in headless Chromium: start screen, late game (cheats `stage E`, money, toques), building inspector, every modal and Orders tab, and the Town view. After the swap had run, it listed every text node, `title` tooltip and `<option>` that still contains an emoji.

## How the swap works today, and where it can't reach

`js/ui.js:2063-2095` (`watchIcons`) walks every **text node** in `<body>` and replaces any emoji from `FSI.uiList` (`assets/ui-icons.js`, 63 entries, all with an SVG) with `<img class="ico">`. A MutationObserver re-runs it on new nodes, so modal bodies and titles, toasts, the journal, splash cards and the `data-tip` hover box (which sets `textContent`) are all covered.

It does **not** reach:

1. **Emoji that aren't in `uiList`.** These stay raw everywhere. This is the main list below.
2. **Native `title=""` tooltips.** They are attributes, not text nodes, and can't hold images anyway.
3. **`<option>` text.** It's skipped on purpose.
4. **SVG `<text>` in the Town map.** This one is a bug: the swap *does* run there, but it puts an HTML `<img>` inside an SVG `<text>`, and that never renders. The emoji silently disappears (see section 1).
5. **Canvas text.** `render.js` draws SVG icons via `drawIcon`. Emoji are only a fallback for the first frames while an image loads, so nothing visible there.

---

## 1. Bug: emoji that vanish in the Town map (SVG)

Checked in the browser: the floater DOM after the swap is `+<img>12`, and the rival floater is an empty `<img>` with width 0.

| Where | Code | What the player sees | Fix idea |
|---|---|---|---|
| Guest pays floater | `townmap.js:974` `+💰12` | "+12" with no coin | draw an SVG `<image href=FSI.dataURL('ui_money')>` next to the text |
| Rival guest floater | `townmap.js:974` `🍽️` | nothing at all (empty) | `<image>` with `ui_cuisines` |
| Locked lot sign | `townmap.js:675` `🔒 SOON` | " SOON" with no lock | `<image>` with `ui_lock` |
| Award label on lots | `townmap.js:698` `🏆 ` + name | name only, trophy missing (the label width still reserves space for it) | `<image>` with `ui_trophy` |
| Sold-out floater | `townmap.js:974` `😠 sold out` | raw emoji (not in uiList) | new icon, see section 3 (Town) |

Rating labels `★ 4.5` (`townmap.js:687`) are a text star and render fine.

## 2. Native tooltips (`title=""`) that show swapped emoji raw

These emoji are SVG everywhere else, but here they show as OS emoji.

| Where | Code | Emoji |
|---|---|---|
| Toques pill (top bar) | `index.html:13` | 💡 |
| Sound button | `index.html:34` | ⚙️ |
| Codex price breakdown bars | `ui.js:886` ("🌱 Farm: 💰2.64", "🏭 Processing: …") | 🌱 🏭 💰 |
| Market: Wholesaler hint | `ui.js:557` | 🚚 |
| Cookbook: dish card being worked on / give to chef | `ui.js:669`, `ui.js:670` | 🎓 ×2 |
| Cuisines: stage progress bar | `ui.js:1219` | ★ (text star, harmless) |
| Town menu picker | `ui.js:1022` | ✗ (text mark, harmless) |

Fix idea: switch these to `data-tip` (already iconized), or drop the emoji from the wording.

## 3. Emoji with no SVG, by place in the UI

"Count" = occurrences in code that reach the screen (toasts and journal included). "Fit" = an existing SVG that already works, or **new** if one would have to be drawn.

### Easy wins: near-duplicates of swapped emoji
These are just a different code point from an emoji that is already in `uiList`. Adding them as aliases (or changing the character) fixes them at once.

| Emoji | Count | Where | Fit |
|---|---|---|---|
| 👨‍🍳 (man cook) | 9 | Academy hint, head chef badge on Town dishes, Cuisines/help text, "Cook it in your idle Kitchen" button (`ui.js:2180`), head-chef toasts (`game.js:2106/2115/2121`) | `ui_chef` (uiList only has 👩‍🍳) |
| 🔍 (left magnifier) | 4 | "Clue" order label and About text (`ui.js:1246/1255`), clue journal/goal texts (`game.js:881/1275`) | `ui_codex` (uiList has 🔎) |
| 🚛 (lorry) | 4 | "Supply" order label and About text (`ui.js:1248/1258`), `game.js:883/1276` | `ui_wholesaler` (🚚), or new if supply should look different |

### Farm: inspector, building panel, blueprints
| Emoji | Count | Where | Fit |
|---|---|---|---|
| 📍 | 10 | Nearby-saving tag on input lines `📍−10%`, "📍 Helps …", "📍 Suppliers built close by…" (`ui.js:292-357`), Plan production note (`ui.js:846`), Blueprint bar "📍 3 of 5 links close" (`ui.js:1809`) | **new** `ui_near` (pin). The most-seen unswapped emoji on the farm. |
| 🏘️ | 2 | "Buildings: stock & auto-sell" button (`ui.js:176`), Buildings window title (`ui.js:1426`) | `b_farmhouse`, or **new** `ui_buildings` |
| ⏳ | 1 | Status line "Leaving X for a higher-priority building" (`ui.js:267`) | `ui_time` or `ui_idle` |
| ↔ ↻ | 2 + 1 | "↔ Move" (inspector, `ui.js:187/203`), "↻ Rotate" (blueprint bar, `ui.js:1813`) | text arrows, look the same on every OS; **new** icons optional |

### Market
| Emoji | Count | Where | Fit |
|---|---|---|---|
| 🏦 | 6 | Bank tab (`ui.js:593`), help text (`ui.js:1510`), loan toasts (`game.js:802/811/819`) | **new** `ui_bank` |
| ▼ ▲ | 2 | Sort direction on the sort bar (`ui.js:555`) | text arrows, keep |

### Cookbook and dish mastery
| Emoji | Count | Where | Fit |
|---|---|---|---|
| ⭐ | 12 | "⭐ Mastered" / "⭐ Master (🎩4)" (`ui.js:659/662`), mastered mark on Town dishes (`ui.js:992`), "⭐ Special" order label (`ui.js:1245/1253`), Cuisines/help text (`ui.js:1235/1507`), Fine Dining splash, mastery toast (`game.js:1414`), feature name (`game.js:1714`), order group name (`game.js:1274`) | **new** `ui_star`. The most frequent unswapped emoji overall. |
| ✓ | 1 | Cuisine filter "13 / 13 ✓" (`ui.js:625`) | text tick, keep (or `ui_check`) |

### Culinary Academy and head chefs
| Emoji | Count | Where | Fit |
|---|---|---|---|
| 💌 | 4 | Postcard rows, "💌 Recipe postcards" heading, Academy hint (`ui.js:941/944/951`), postcard toast (`game.js:1588`) | **new** `ui_postcard` |
| 📚 | 2 | "📚 Train to level N" for chefs and head chefs (`ui.js:908/1031`) | `ui_academy` would fit |
| 👋 | 2 | "👋 Let go" for chefs and head chefs (`ui.js:914/1034`) | `ui_cancel` or `ui_delete`, or **new** |
| 🎲 | 2 | "🎲 Surprise me" and the picker hint (`ui.js:922/924`) | **new** `ui_dice` |
| ⏹ | 1 | "⏹ Stop" (`ui.js:913`) | `ui_pause` or `ui_cancel` |
| ★ | 5 | Chef level stars (`ui.js:909/923/1032/1033/1039`) | text stars styled by CSS, keep |

### Orders window
| Emoji | Count | Where | Fit |
|---|---|---|---|
| ❤️ | 5 | "❤️ Regulars" tab (`ui.js:1382`), regular order label (`ui.js:1254`), About text (`ui.js:1246`), journal/goal text (`game.js:881`), regular level-up toast (`game.js:1195`) | **new** `ui_heart` |
| ⏳ | 4 | "⏳ Contract" label and About (`ui.js:1247/1256`), `game.js:882/1276` | `ui_time`, or **new** `ui_hourglass` |
| 🥂 | 4 | "🥂 Party menu" label and About (`ui.js:1248/1257`), `game.js:883/1277` | **new** `ui_party` (or `ui_celebrate` 🎉, which Events already use) |
| ℹ️ | 1 | "ℹ️ About orders" tab (`ui.js:1382`) | `ui_help` (❓), or **new** `ui_info` |
| ♥ | 1 | Regular's heart meter (`ui.js:1261`) | text hearts styled by CSS, keep |
| ✓ | 3 | "today ✓", "supplied ✓", Dispatcher tab ✓ (`ui.js:1295/1296/1382`) | text tick, keep |

### Goals, Settings, Cuisines, Help
| Emoji | Count | Where | Fit |
|---|---|---|---|
| ○ | 1 (×28 rows) | Open-goal bullet beside ✅ / 👉 SVGs (`ui.js:1393`) | text circle next to SVG icons looks mismatched; **new** `ui_todo` (empty box) would pair with `ui_check` |
| ⬇️ | 1 | "⬇️ Download save file" (`ui.js:1484`) | `ui_save` (💾) |
| ✨ | 1 | Next-stage teaser line in Cuisines (`ui.js:1211`) | `ui_celebrate` or **new** `ui_sparkle` |

### Unlock splash cards (`ui.js:381-400`)
| Emoji | Count | Where | Fit |
|---|---|---|---|
| ✨ | 2 | Window title "✨ Unlocked!" on **every** splash, plus the fallback big icon | **new** `ui_sparkle` |
| ⚓ | 1 | Big icon of the Harbour splash | **new** `ui_harbour` |
| 🏛️ | 2 | Big icon of the Old Town splash, and inside the Fine Dining text | **new** `ui_oldtown` |
| 📜 | 1 | Fine Dining line "📜 A permit…" | **new** `ui_permit`, or `ui_blueprint` |

These are the most visible leftovers: big, centred and shown with a fanfare.

### Town panel and food critics
| Emoji | Count | Where | Fit |
|---|---|---|---|
| 👑 | 3 | Legacy heading and window title (`ui.js:1078/1188`), Legacy-complete toast (`game.js:2450`) | **new** `ui_crown` |
| 🕵️ | 3 | "🕵️ In town now!", critics banner (`ui.js:1071/1108`), arrival toast (`game.js:2340`) | **new** `ui_critic` |
| 🥇 🥈 🥉 | 3 + 2 + 1 | Restaurants of the Year medals and the thresholds note (`ui.js:1068/1159/1169`) | `ui_trophy` for gold only; **new** `ui_medal_1/2/3` |
| 😠 | 2 | Restaurant stats "😠 3 turned away" (`ui.js:1011`), sold-out floater on the map (`townmap.js:974`) | **new** `ui_angry` |
| ⬜ | 2 | Open items in the Legacy list and district-unlock tooltip, sitting next to SVG ✅ (`ui.js:972/1079`) | **new** `ui_todo` (same as Goals) |
| 📨 | 2 | Crestwell buy-out offer (`ui.js:1080`), offer toast (`game.js:2445`) | `ui_postcard` if drawn, or **new** `ui_letter` |
| ⚔️ | 1 | "⚔️ 40% of guests vs …" (`ui.js:984`) | **new** `ui_rival` |
| ✏️ | 1 | Rename restaurant button (`ui.js:1007`) | **new** `ui_edit` |
| 🌾 | 1 | "🌾 Back to the farm" button (`ui.js:1145`) | `ui_sprout` or `b_field` |
| 🤝 | 1 | Buy-out done toast (`game.js:2435`) | **new**, or `ui_celebrate` |
| ★★★★★ | 1 | Rating bar (`ui.js:957`) | CSS-filled text stars, keep |
| ✓ ✗ | 6 | Critic notes (`ui.js:966/991/1021`, CSS `::after` at `style.css:847-848`) | text marks, keep (the ✗ in `<option>` can't be an image anyway) |

---

## 4. Not visible, no action needed

- Canvas fallbacks: `render.js:379/716` and `drawIcon(..., FS.items[x].emoji)`. Building `icon` fields in `buildings.js` and category emoji in `core.js` only show while an SVG image is still loading.
- `game.js:947` `DRINK_EMOJI`: logic only (decides which dishes count as drinks).
- Cheat console text (debug only).
- CSS `▸ ▾` folding arrows and `▾` chevrons in the build menu and dropdowns: text glyphs, look the same on every OS.

## Summary

- **Real bug:** Town map SVG text loses its icons (coin on guest floaters, rival floater empty, 🔒 on lot signs, 🏆 on award labels).
- **Three free fixes:** 👨‍🍳 → `ui_chef`, 🔍 → `ui_codex`, 🚛 → `ui_wholesaler`. That covers 17 occurrences with no new art.
- **Several more can reuse existing icons:** ⬇️ → `ui_save`, ⏹ → `ui_pause`, 📚 → `ui_academy`, 🌾 → `ui_sprout`, ⏳ → `ui_time`, ℹ️ → `ui_help`.
- **About 20 new SVGs would clear the rest.** In order of how often they're seen: `ui_star` (12), `ui_near` (10), `ui_bank` (6), `ui_heart` (5), `ui_postcard` (4+2), `ui_party` (4), `ui_sparkle` (3), `ui_crown`, `ui_critic`, medals, `ui_todo`, `ui_angry`, `ui_harbour`, `ui_oldtown`, `ui_permit`, `ui_dice`, `ui_rival`, `ui_edit`, `ui_buildings`.
- **Text glyphs** (★ ✓ ✗ ♥ ○ ▾ ▼ ↔ ↻ ✱) look the same on every OS. I'd leave them, except ○ and ⬜, which sit beside SVG checkmarks.
- **Tooltips:** 6 native `title` tooltips show emoji raw; switching them to `data-tip` fixes them.

Side note from the probe: the cheat `recipes all` followed by opening Cuisines (or a splash) throws "Maximum call stack size exceeded" in `esc()`. It only showed up with that cheat.
