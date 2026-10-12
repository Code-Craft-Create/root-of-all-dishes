# Restaurants today, and ideas for rivals and a food critic (2026-10-11)

Ideas only, nothing built. Numbers are first guesses.

## 1. How restaurants work now (from js/game.js, "Restaurants (Town)")

**When:** the 🏙️ Town screen (key T) opens once *Asia & the Americas* is finished.

**Setting up**
- The town has 6 lots, each a district with its own guests: Old Town Square (rich, like fine and complex food, hate sandwiches), Station Corner (commuters, cheap, simple, short menus, busiest), University Quarter (students, cheap, Asian and American food, long menus, mind mixed cuisines less), Harbour Front (anything with seafood), Parkside (families, sweets and drinks, no spicy food), Market Street (home cooking from the first two stages).
- Renting costs 5,000 for the first restaurant, then 5,000 more for each one after (10,000, 15,000 …), plus upkeep of 8 coins per game minute each. Closing gives no refund.
- Each restaurant has a menu of up to 12 dishes you have discovered, and a price level: Low (1.3× the dish value), Fair (1.6×) or High (2×).

**Guests**
- A guest arrives every ~20 s, faster on busy lots and at a higher rating, and much slower at night (23:00–07:00).
- They pick a dish from the menu (dishes the district likes 2.5× as often) and eat one straight out of your warehouse. You get paid on the spot.
- If that dish is out of stock, the guest gives **1 star**, whatever else is true.

**Stars (hidden rules).** Every guest starts at 3 stars, and these add or subtract:

| Rule | Effect |
|---|---|
| Complexity | long chains score more: 15+ raw ingredients +0.9, 12+ +0.6, 9+ +0.3, under 6 −0.3; Grand Cuisine dishes +0.3 extra |
| Taste | the district likes it +0.6, dislikes it −0.6 |
| Price | each district reacts differently (Old Town likes High, the Station hates it) |
| Mix | one cuisine on the menu +0.3, two 0, three −0.6, four or more −1.2 |
| Choice | under 4 dishes −0.5; a long menu annoys commuters, a short one annoys students |
| Freshness | dish not cooked within the last game day −0.5 |
| Ceiling | without Grand Cuisine dishes a restaurant can't go above 4★; each one on the menu lifts the ceiling by 0.1 (10 of them allow 5★) |

The rating is the average of the last 30 guests (shown after 8). The numbers are never shown: guest reviews hint at the rule that mattered most ("A curry next to the carbonara felt odd").

**Rewards:** the first time a restaurant reaches 4★ you get +2 🎩 toques, at 4.75★ +5 more. Plus the guests' money.

## 2. The ultimate goal, and how to reach it

The last stage, **Grand Cuisine**, is won in Town, not in the kitchen. For each of its three cuisines (Haute Cuisine, Pâtisserie & Chocolaterie, Grand Banquets), **10 of its dishes must be on the menu of a restaurant rated 4★ or better.** When all three are done, the game says "You have mastered every stage."

In practice the winning route is:
1. Open the three Grand Cuisine cuisines and discover at least 10 dishes of each (these are the longest chains in the game).
2. Rent about three restaurants, and give each one a single Grand Cuisine cuisine (mixing three cuisines costs −0.6, so one cuisine per restaurant is the clean way). Old Town Square suits Haute Cuisine, Parkside suits Pâtisserie.
3. Keep every menu dish in stock all the time, and cooked within the last day. This is the real challenge: one empty shelf means 1-star guests.
4. Match each district's price taste, and keep menus at 8 to 12 dishes.

**What's missing:** after that toast nothing changes. Restaurants are a goal to tick off, not a place to keep playing. There is nobody to compare yourself with, and a rating of 4.2 feels the same as 4.9. Rivals and a critic would fix exactly that.

## 3. Rival restaurants

**The idea:** the town already has other restaurants. Some lots start taken, and each district has a rival competing for the same guests.

**Rivals (3 to 5 named owners with a personality):**
- *Maison Valcourt* (Old Town): snobbish fine dining, always High prices, strong on complexity, sometimes runs out.
- *QuickBite* (Station): a cheap chain, never runs out, low ceiling (3.5★ at best), very steady.
- *Fusion Lab* (University): trendy, changes its menu every season, mixes cuisines on purpose.
- *Old Pete's Chowder House* (Harbour): the old favourite; locals are loyal, hard to beat on seafood.

**How competition works:**
- A district's guests are shared between the restaurants on that street, weighted by rating and price fit. A rival with a better rating pulls your guests away, so a rating finally changes your income directly, not just a threshold.
- Each rival has a visible rating that drifts with simple rules (its "supply" sometimes fails, it changes its menu per season, it reacts to you).
- **Rivals react.** If you overtake them, they do something you can read in the journal: cut prices for a few days, copy one of your dishes, or poach a dish idea ("Fusion Lab now serves Bibimbap too"). If you fall behind, they gloat in a review.
- **A Town Guide** in the Town window: one league table of every restaurant in town with its stars, so you always see where you stand.

**Supplying your competition (fits the teaching aim nicely):** rivals need ingredients too. Now and then a rival offers a supply contract ("Maison Valcourt needs 40 Butter and 10 Truffles a day"). It pays well, but it makes them stronger. That shows the real trade-off between a farm and a restaurant, and that most restaurants depend on someone else's supply chain.

**Buying out:** a rival that drops below 2★ for a while can be bought (rent price plus a premium), which frees its lot for you. That gives a long-term goal: own the whole town.

## 4. The food critic, once a year

A game year is 4 seasons of 2 days, about 80 minutes of real play, which is a good rhythm for a yearly event.

**Before the visit**
- In late autumn the journal hints that the critic is coming ("A stranger with a notebook was seen at the station"). You don't know the exact day, so you can't just stock up for one hour; you have to be good for the whole week.
- Each year the critic announces a **theme** in the newspaper, so every year plays differently:
  - *Farm to fork*: the dish's chain is grown on your own farm, nothing imported from the Market. This rewards the core of the game.
  - *In season*: dishes whose ingredients are in season now.
  - *The long road*: the most complex chains.
  - *Local favourite*: what the district itself loves.
  - *Faithful to one kitchen*: a menu of a single cuisine.

**The visit**
- The critic eats one dish at every restaurant in town (yours and the rivals'), judged with the normal hidden rules, stricter (no luck, always the worst case on stock and freshness), plus the year's theme.
- The critic writes a short newspaper review of each place, which is the clearest hint text in the game: it says precisely what was wrong.

**The award: Restaurant of the Year**
- Gold, silver and bronze for the top three. Prize: toques, a plaque (a small 🏆 on the restaurant on the town map), and more guests for the whole next year.
- If a rival wins, it gets the boost instead, and that is a real setback. That is where the tension comes from.

## 5. A new ultimate goal

Rivals and the critic give the game a proper ending after Grand Cuisine:

- **Main goal:** win Restaurant of the Year (gold). Finishing Grand Cuisine becomes the ticket that lets you enter.
- **Long-term goals after that:** win it three years in a row; win it under every theme; hold first place on the Town Guide in all 6 districts; buy out every rival.

## 6. A first version I'd suggest

1. Two or three rivals on lots of their own, with a simple drifting rating, guests shared by rating, and the Town Guide table.
2. The critic once a year with one theme (*Farm to fork* is the best fit for the game's message), newspaper reviews, and the gold/silver/bronze award.
3. Later: rivals reacting to you, supply contracts from rivals, buying them out, and more themes.

## Questions

1. Should rivals take some of the 6 existing lots (more pressure), or get extra lots of their own (gentler)?
2. Should winning Restaurant of the Year be the new end goal, or a bonus after Grand Cuisine?

---

## Decisions (2026-10-11) and what gets built

- **Town screen:** no longer a pop-up. Pressing 🏙️ Town (T) switches the whole screen to the town, drawn at a 45° (isometric) angle, and 🌾 Farm switches back. The town is a real town: houses, a cathedral, the town hall, a market hall, the station, a harbour, a park. Only a few lots are restaurant lots. A side panel shows the selected restaurant or the Town Guide.
- **Three districts** with simpler rules: **Old Town** (wealthy, likes refined food and high prices), **Harbour** (likes fish and seafood, fair prices), **Market Quarter** (families and students, like home cooking and sweets, low prices).
- **Simpler star rules:** stock (out of stock = 1★), freshness, complexity, district taste, price level, cuisine mix, and at least 4 dishes. The Grand Cuisine ceiling stays.
- **Rivals, gentle variant:** each district has one rival on a lot of its own (the player's 6 lots stay free for the player). Guests of a district choose between all its restaurants by rating. Rivals: Maison Valcourt (Old Town), Old Pete's Chowder House (Harbour), QuickBite (Market Quarter). A rival that keeps losing guests to you loses rating and gets cheaper to buy.
- **Buying out rivals:** price 10,000 × rating², so beating them first makes them cheaper. The bought lot becomes one of your restaurants.
- **Food critic, yearly:** a year is 8 game days. The theme is announced at the start of each year, the critic arrives on an unannounced moment in winter, eats at every restaurant (rivals too) and the Town Gazette names gold, silver and bronze. Themes: The long road (complex chains), Local favourite (what the district loves), One kitchen (a single cuisine), Never runs out (no guest turned away), Grand occasion (Grand Cuisine dishes). Gold: +10 🎩 and more guests for a year.
- **New end goal (the Legacy):** all three of: finish Grand Cuisine, win Restaurant of the Year three years in a row, and own the whole town (all 6 lots plus the 3 rivals bought out).
