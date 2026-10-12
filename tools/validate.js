// Validates the Root of All Dishes data: run with `node tools/validate.js`.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
const files = ['js/data/core.js', 'js/data/buildings.js', 'js/data/raw.js', 'js/data/processing.js', 'js/data/dishes.js', 'js/data/unlocks.js', 'js/model.js'];
const ctx = { console };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const FS = ctx.FS;
FS.finalize();
const errors = [], warnings = [];
for (const r of FS.recipes) {
  if (!FS.buildings[r.building]) errors.push(`Recipe ${r.id}: unknown building ${r.building}`);
  for (const k of [...Object.keys(r.inputs), ...Object.keys(r.outputs)])
    if (!FS.items[k]) errors.push(`Recipe ${r.id}: unknown item "${k}"`);
  for (const [k, q] of Object.entries(r.inputs)) if (!(q > 0)) errors.push(`Recipe ${r.id}: bad qty for ${k}`);
  if (r.dish && Object.keys(r.inputs).length > 8) errors.push(`Dish ${r.primary} has more than 8 ingredients`);
}
for (const id in FS.items) {
  if (!FS.byOutput[id] || !FS.byOutput[id].length) errors.push(`Item ${id} has no producing recipe`);
  if (!isFinite(FS.items[id].value)) errors.push(`Item ${id} has no finite value (unreachable?)`);
  if (!FS.items[id].dish && !(FS.byInput[id] || []).length) warnings.push(`Unused ingredient: ${id}`);
}
const sigs = {};
for (const r of FS.byBuilding.kitchen) {
  const s = Object.keys(r.inputs).sort().join('+');
  if (sigs[s]) errors.push(`Dishes ${sigs[s]} and ${r.primary} have identical ingredient sets`);
  sigs[s] = r.primary;
}
for (const d of FS.dishList) {
  if (Object.keys(FS.dishRecipe[d.id].inputs).includes(d.id)) errors.push('self ref ' + d.id);
}
// Unlocks: every step and cuisine item exists, every goal a step names exists in game.js, every dish is in exactly
// one cuisine, the guided steps cover the start cuisine, and opening everything unlocks every production recipe.
for (const u of [...FS.STEPS, ...FS.CUISINES]) {
  for (const id of [...(u.items || []), ...(u.only || []), ...(u.item ? [u.item] : [])]) if (!FS.items[id]) errors.push(`Unlock ${u.id}: unknown item ${id}`);
}
const gameSrc = fs.readFileSync(path.join(root, 'js/game.js'), 'utf8');
for (const st of FS.STEPS) if (st.goal && !gameSrc.includes(`id: '${st.goal}'`)) errors.push(`Step ${st.id}: unknown goal ${st.goal}`);
const placed = {};
for (const c of FS.CUISINES) for (const id of c.dishIds) { if (placed[id]) errors.push(`Dish ${id} is in ${placed[id]} and ${c.name}`); placed[id] = c.name; }
for (const d of FS.dishList) if (!placed[d.id]) errors.push(`Dish ${d.id} is in no cuisine`);
for (const st of FS.STAGES) for (const c of st.cuisines) if (c.dishIds.length < st.target) errors.push(`Cuisine ${c.name} has fewer dishes than its target ${st.target}`);
for (const n in FS.ABOUT) if (!FS.items[FS.slug(n)]) errors.push(`FS.ABOUT: unknown dish ${n}`);
for (const c of FS.CUISINES.filter((x) => x.stage === 'E')) for (const id of c.dishIds) if (!FS.items[id].about) errors.push(`${c.name}: ${FS.items[id].name} has no FS.ABOUT text`);
const stepsU = FS.computeUnlocks(FS.STEPS.map((s) => s.id), []);
for (const c of FS.CUISINES.filter((x) => x.steps)) for (const id of c.dishIds) for (const i of Object.keys(FS.dishRecipe[id].inputs))
  if (!stepsU.items.has(i)) errors.push(`${c.name}: ${FS.items[id].name} needs ${i}, which no guided step unlocks`);
const allU = FS.computeUnlocks(FS.STEPS.map((s) => s.id), FS.CUISINES.map((c) => c.id));
const never = FS.recipes.filter((r) => !r.dish && !allU.recipes.has(r.id));
if (never.length) errors.push(`${never.length} recipes never unlock: ${never.slice(0, 10).map((r) => r.id).join(', ')}`);
const startU = FS.computeUnlocks(['start'], []);
console.log(`Unlocks: start ${startU.recipes.size} recipes / ${startU.buildings.size} buildings, everything ${allU.recipes.size} recipes / ${allU.buildings.size} buildings`);
const ingr = FS.ingredientList.length, dishes = FS.dishList.length;
const raw = FS.ingredientList.filter((i) => i.raw).length;
console.log(`Ingredients: ${ingr} (raw ${raw}, processed ${ingr - raw})  Dishes: ${dishes}  Recipes: ${FS.recipes.length}  Buildings: ${Object.keys(FS.buildings).length}`);
const cx = FS.dishList.map((d) => [d.name, FS.complexity(d.id)]).sort((a, b) => b[1].rawCount - a[1].rawCount);
console.log('Most complex dishes:', cx.slice(0, 5).map(([n, c]) => `${n} (${c.rawCount} raw, ${c.steps} steps, depth ${c.depth})`).join('; '));
console.log('Simplest dishes:', cx.slice(-3).map(([n, c]) => `${n} (${c.rawCount} raw)`).join('; '));
if (process.argv.includes('-v')) warnings.forEach((w) => console.log('WARN', w));
else if (warnings.length) console.log(`${warnings.length} warnings (run with -v)`);
errors.forEach((e) => console.log('ERROR', e));
if (ingr < 500 || dishes < 200) errors.push('count'), console.log('ERROR counts below target (500 ingredients / 200 dishes)');
process.exit(errors.length ? 1 : 0);
