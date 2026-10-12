// Builds the downloads: a single self-contained HTML file and a zip of the source folder.
// Run with `node tools/build.js [outDir]` (default: ../root-of-all-dishes-download next to this folder).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const out = path.resolve(process.argv[2] || path.join(root, '..', 'root-of-all-dishes-download'));
fs.mkdirSync(out, { recursive: true });

require('./build-icons.js');
const inline = (page) => {
  let html = fs.readFileSync(path.join(root, page), 'utf8');
  html = html.replace(/<link rel="stylesheet" href="(?!https?:)([^"]+)">/g, (_, f) => `<style>\n${fs.readFileSync(path.join(root, f), 'utf8')}</style>`);
  return html.replace(/<script src="([^"]+)"><\/script>/g, (_, f) => `<script>\n${fs.readFileSync(path.join(root, f), 'utf8').replace(/<\/script/gi, '<\\/script')}</script>`);
};
// The music is not embedded: root-of-all-dishes.html loads it by relative path from assets/music/ next to it, so the tracks are
// copied there. The list is taken from the folder; files starting with town- are the Town's playlist,
// finale- the end screen's track, the rest the farm's.
const musicDir = path.join(root, 'assets/music');
const mp3 = fs.readdirSync(musicDir).filter((f) => f.endsWith('.mp3')).sort();
fs.mkdirSync(path.join(out, 'assets/music'), { recursive: true });
for (const f of fs.readdirSync(path.join(out, 'assets/music'))) if (!mp3.includes(f)) fs.unlinkSync(path.join(out, 'assets/music', f));
for (const f of mp3) fs.copyFileSync(path.join(musicDir, f), path.join(out, 'assets/music', f));
const refs = (list) => JSON.stringify(list.map((f) => `assets/music/${f}`));
const list = (pre) => refs(mp3.filter((f) => (pre ? f.startsWith(pre) : !/^(town|finale)-/.test(f))));
const music = `{ farm: ${list('')}, town: ${list('town-')}, finale: ${list('finale-')} }`;
const html = inline('index.html').replace('<script>', `<script>window.ROOTDISHES_MUSIC = ${music};</script>\n<script>`);
fs.writeFileSync(path.join(out, 'root-of-all-dishes.html'), html);
fs.writeFileSync(path.join(out, 'icons.html'), inline('icons.html'));
fs.writeFileSync(path.join(out, 'sounds.html'), inline('sounds.html'));

const zip = path.join(out, 'root-of-all-dishes.zip');
if (fs.existsSync(zip)) fs.unlinkSync(zip);
const files = ['README.md', 'index.html', 'icons.html', 'sounds.html', 'css', 'js', 'assets', 'tools'];
execFileSync('zip', ['-qr', zip, ...files.map((f) => path.join(path.basename(root), f))], { cwd: path.join(root, '..') });
console.log(`Wrote ${path.join(out, 'root-of-all-dishes.html')} (${Math.round(html.length / 1024)} KB), ${mp3.length} tracks in ${path.join(out, 'assets/music')} and ${zip}`);
