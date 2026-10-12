# Toque economy review (2026-10-11)

Question: how are toques spent, and do they lose value in the late game?

**Short answer: yes.** Every toque sink is about *discovering* dishes, and all but one are one-time purchases. Toque income keeps growing through stages C to E, and the biggest payouts arrive exactly when there is little or nothing left to discover. The late game (Town, critic, Legacy) has no toque use at all.

## Where toques come from

| Source | Amount | When | Code |
|---|---|---|---|
| Start | 3 | game start | game.js:85 |
| Cuisine target reached | 2 / 3 / 4 / 5 / 6 per cuisine (A–E), 60 total | each stage | unlocks.js, game.js:1685 |
| Every dish of a cuisine cooked ("gold") | 4 / 6 / 8 / 10 / 12 per cuisine, 120 total | after a cuisine is fully discovered | game.js:1691 |
| Special request | 1 | A+ | game.js:982 |
| Clue order | 1 / 1 / 2 / 3 by tier | B+ | game.js:1020 |
| Contract | 1 | C+ | game.js:1031 |
| Event / party menu | 2 / 3 | C+ / D+ | game.js:1050 |
| Supply contract, all days met | 2 | D+ | game.js:1070 |
| Regular tips | 1 every 3rd delivery (lv3), every 2nd (lv5) | B+ | game.js:1159 |
| Restaurant reaches 4★ / 4.75★ | 2 / 5 per restaurant (up to 9 restaurants, 63 total) | D+ | game.js:1814 |
| Food critic gold / silver / bronze | 10 / 5 / 2 per year | D+ | game.js:2130 |

Rough income from orders alone at tier D: about 1.2 toques per order on average, around 10 orders a game day, so **~12 toques per game day**, open-ended. Stage rewards (targets + gold) add another 45 in stage D and 54 in stage E.

## Where toques go

| Sink | Cost | Repeats? |
|---|---|---|
| 💡 Hint (one ingredient of an undiscovered dish) | 1, or 2 for 12+ raw ingredients | yes, but only while undiscovered dishes exist |
| 🎓 Hire Academy chef | 3 / 5 / 8 (3 seats) | effectively once (16) |
| 🎓 Train chef to lv2 / lv3 | 3 / 6 per chef | once (27 for all three) |
| 📦 Dispatcher | 5 (+3,000 coins) | once; afterwards he also keeps half of all order toques |

Wholesaler, Blueprints, land, restaurants, rent and rival buyouts are all **money only**.

## Why toques lose value

1. **Fixed sinks are tiny.** Fully staffing and training the Academy plus the Dispatcher costs 48 toques once. That is about 4 game days of stage D order income.
2. **The only repeating sink competes with a free one.** Once the Academy runs, three trained chefs reveal ingredients for free all day, and the Test Kitchen discovers for free too. Hints become a "skip the wait" button.
3. **The sink disappears entirely.** When every open dish is discovered, hints and chefs have nothing to work on. With all 450 dishes known, toques have zero use.
4. **Rewards are back-loaded.** Gold toques (120 total) are paid for cooking every dish of a cuisine, which means you already know them all. Stage E pays 54, restaurants up to 63, the critic 10 a year. Almost 250 toques land in a phase where the only things left to do (Town ratings, critic, Legacy) don't use them.
5. **The Dispatcher's toque cut is a hint of this.** Halving toques is a real cost early, but late it's free because the toques were worthless anyway.

## Proposed fixes

Ranked by how well they fit the late game. They can be combined; my recommendation is **A + B**.

### A. Head chefs for restaurants (Town sink, recommended)
Each restaurant can take a head chef, hired and trained with toques (e.g. 5 / 10 / 20, with levels). A head chef adds a taste bonus (+0.2 to +0.4) on dishes of their speciality cuisine and lifts the restaurant's rating ceiling slightly. Optionally a small yearly retainer in toques (e.g. 2 per chef per year) so it keeps draining.
*Why:* ties toques directly to stage E's target (restaurant ratings), the critic and the Legacy, which is where the late game is. Reuses the existing chef portraits and specialities.

### B. Signature dishes / dish mastery (scaling sink)
Once a dish is discovered and cooked, say, 10 times, spend toques to perfect it: 2 / 4 / 8 toques by complexity. A mastered dish sells for ~15% more, earns +0.2 with restaurant guests, and gets a ⭐ in the Cookbook. Idle Academy chefs can work on mastery too (slowly), so the Academy stays useful after discovery is finished.
*Why:* 450 dishes give a large sink that grows with the game, rewards long supply chains, and fits the teaching aim (refining a recipe is work too).

### C. Critic preparation (event sink)
When the critic rumour appears, spend toques for a tasting rehearsal: e.g. 5 toques adds +0.1 to your critic score for that year, up to 3 times, or 3 toques to learn the critic's theme a season early.
*Why:* a clear yearly decision; small but recurring.

### D. Rebalance sources (complementary)
Lower the gold rewards in D/E (e.g. 10/12 → 6/6) or turn stage E gold into a cosmetic award (a trophy in the Town) instead of toques. Only worth doing if no new sinks are added; on its own it just makes the problem smaller.

### Not recommended
Exchanging toques for money: it turns toques into a second coin and money is already plentiful late.

Numbers above are first guesses, like the rest of the economy.

## Built (2026-10-11, picked A + B)

- **Head chefs** (Town): promote an Academy chef to a restaurant for 🎩5 (`Game.HEAD`, `Game.promoteChef`). Their speciality cuisine's dishes get +0.2/+0.3/+0.4 with guests by level, and the rating ceiling rises 0.1/0.2/0.3. Can be trained further at the restaurant (Academy prices); let go gives nothing back. Restaurant panel section "Head chef". Screens: head-chef-town.png, head-chef-promote.png.
- **Dish mastery** (after stage C, with Blueprints): a dish cooked 10× can be mastered in the Cookbook for 🎩2/4/8 (by supply-chain size, `Game.MASTERY`). Mastered dishes sell for 15% more (market, wholesaler, restaurant plates) and get +0.2 with restaurant guests. Screen: mastery-cookbook.png.
- No yearly retainer for head chefs yet; worth adding if toques still pile up in playtests.
