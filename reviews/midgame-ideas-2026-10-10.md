# Mid and late game ideas, 10 Oct 2026

The worry: the start is engaging (recipe detective work, customer orders), but the mid and late game may be a grind
that isn't much different from the start. Ideas only, nothing implemented.

## Why the later game feels like the start

What the game has after the first hour, read from the code:

- **The loop never changes shape.** At dish 5 and at dish 150 it is the same: pick a dish, build its chain, try the
  ingredients in the Test Kitchen, cook. Only the chains get longer.
- **Orders stay the same kind of thing.** `newOrder()` in js/game.js picks a random item you have already produced
  (55% dishes), sometimes a bulk contract, and 20% of the time a ⭐ special request for an undiscovered dish. The
  customer name is decoration. Rewards scale with value, but nothing about an order changes as you grow.
- **Goals turn into counters.** After Dark Chocolate and the 15-ingredient dish, the goals are Cook 50 / 100 / 200 / all
  dishes. Counting is exactly what makes a game feel like a grind.
- **Packs are content dumps.** A pack unlocks a cuisine's whole chain at once for money. More dishes, same activity.
- **Land is only space.** All 24 extra plots are the same country, so buying land is a cost, not a choice.
- **Detective work gets easier, not deeper.** Cookbook silhouettes, revealed ingredients, paid hints and "Try it" make
  later dishes less of a puzzle than the first ones.

The fix is not more content but new *kinds* of decisions at each stage, so the player's role grows:
farmer (start) ➜ supplier and food detective (mid) ➜ running a food system (late).

## Ideas, strongest first

### 1. Orders that become puzzles: regulars and clue orders
Builds directly on the two strongest mechanics.
- **Regular customers** instead of random names. The Village Inn, Ski Lodge, Harbour Bistro and Grand Hotel each have a
  taste (the Ski Lodge wants hearty, warm, winter food; the Harbour Bistro fish; the school canteen cheap and meat-free).
  Delivering raises a relationship level, which unlocks their bigger orders and a small perk (a regular buyer for a
  byproduct, a discount, a recipe tip).
- **Clue orders** in the mid game: the customer describes, rather than names, what they want.
  "Something baked with apples for the Corner Café", "a cold Spanish soup for the summer fête", "a dish with a fermented
  ingredient and no meat". Any dish that fits counts, and an undiscovered one pays a bonus. This turns orders into the
  same detective work as the Test Kitchen, and works with tags the data almost has already (cuisine, category, season).
- **Menus and events** in the late game: a Wedding Party wants a starter, main and dessert from three cuisines for
  40 guests by day 12; a food festival wants one dish from every continent. Multi-part, planned ahead, big payoff.

### 2. Make the detective work deeper later, not easier
- **Recipe postcards and travelling chefs.** Instead of the Cookbook revealing ingredients, mid-game dishes arrive as
  clues: a postcard from Lyon names a dish and gives two hints ("it is pink, and it needs something cured").
  Rewards from regulars and events hand out these clues.
- **Taste test a rival's dish.** A late-game tool: the Test Kitchen tells you which of your guessed ingredients are in a
  mystery dish and how many are missing, Mastermind-style. Pure deduction, no extra content needed.
- **Variants.** "You made Bread Loaf. Can you find the version with sourdough?" Re-uses existing dishes as new puzzles
  and teaches how one dish changes from region to region.

### 3. Land plots with their own climate and specialities
Make expansion a decision. The 5 x 5 world already has a coast, lakes, forests and hills (js/game.js genMap).
- Each plot gets a character: alpine meadow (better dairy, alpine cheeses, slow crops), south-facing slope (vines,
  olives, citrus), wetland (rice, ducks), coast (seafood, salt), forest (mushrooms, game, honey).
- Some crops and animals only grow well on the right land, so "where do I expand?" depends on which cuisine you chase.
- This could replace part of the pack gating: buying the Mediterranean slope *is* how you get olives, not a shop button.
- Strong teaching point: food comes from particular places for a reason (terroir, climate).

### 4. Supply chains that can break: events and shocks
The start teaches how long a chain is; the late game can teach how fragile it is.
- Occasional events with warning and choices: bird flu closes poultry for a season, a cocoa harvest fails abroad and
  imports triple in price, a drought hits the south plots, a new trade deal makes rice cheap.
- The answer is a decision: switch to a substitute recipe (microbial rennet, beet sugar instead of cane), stockpile,
  pay for imports, or diversify land. Real supply-chain thinking, and every playthrough plays out differently.
- Keep it gentle and readable: one event at a time, announced in the journal a day ahead.

### 5. Remove the repetition so the new decisions have room
The grind is partly manual work: placing the 8th mill and wiring every chain by hand.
- **Chain blueprints:** Plan production already knows every step. Let it place the whole missing chain at once as a
  ghost the player positions (near each other, for the proximity bonus), paid in one go.
- **Copy a building with its settings** and **upgrade a building** (level 2 mill: double rate, same tile) instead of
  building more of the same.
- **A farm manager** unlocked late: keeps stock targets topped up across the farm, so late game is about strategy,
  not clicking.

### 6. Goals that are themes, not counters
Replace or supplement dish50/100/200 with goals that each ask for something different:
- complete a cuisine (gold stamp already exists in the Cookbook) and earn a **cuisine mastery perk**
  (Japanese mastery: koji steps 20% faster);
- "cook a dish whose chain uses a fermented, a cured and an aged ingredient";
- "serve a full three-course menu made only from your own farm, nothing imported";
- "make a dish with 25+ raw ingredients in its chain";
- "turn every byproduct into something useful for a day" (whey, bran, bones, pomace).
Count goals can stay, but as a side track.

### 7. A late-game teaching layer: the true cost of a dish
Next to "Where the price goes", show a dish's **footprint**: land used, water, days from seed to plate, number of
workers' steps, food miles if imported. Late goals can ask for efficiency ("feed the Grand Hotel's order using half the
land"), so the endgame is optimising a food system, and the lesson goes beyond "it's complicated" to "it has costs".

### Smaller ideas
- **Your own restaurant** as a late building: you set a menu of discovered dishes, guests come based on variety,
  season and freshness. A place to use the whole cookbook, not just tick it off.
- **Freshness:** fresh produce and dishes slowly lose value in storage; cellars, cold stores, preserving and smoking
  matter. Ties into the seasons already in the game.
- **Seasonal menus from customers:** the Ski Lodge only orders in winter, the summer fête only in summer.

## Recommendation

Start with **idea 1 (regulars and clue orders)**: it extends exactly the two strongest mechanics, needs little new
content (tags on dishes plus customer profiles), and changes the mid game the most for the least work. Then
**idea 3 (land with character)** to give the mid game a direction and make expansion a choice, and **idea 5
(blueprints and upgrades)** to cut the manual repetition. Events (4) and themed goals (6) fit well after that.
