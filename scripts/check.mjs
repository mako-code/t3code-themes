// Checks this repository: every theme file is a sound T3 Code theme, the lists match the files, the pictures are
// there, and nothing that should not be public has slipped in.   node scripts/check.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, extname } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CSS_LIMIT = 50000;              // T3 Code ignores a theme's CSS beyond this
const FILE_LIMIT = 6 * CSS_LIMIT + 16 * 1024; // and a theme file beyond this
const THEME_FILES = 32;               // and reads no more than this many files at a time
// a colour is a hex colour, or rgb(r g b) with an optional alpha: nothing that could carry anything else
const COLOUR = /^(?:#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})|rgb\(\d{1,3} \d{1,3} \d{1,3}(?: \/ (?:0|1|0?\.\d+))?\))$/i;

let bad = 0;
const fail = (where, why) => { bad++; console.log(`✗ ${where}: ${why}`); };
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

// ---- the themes -----------------------------------------------------------------------------------------------------
const files = readdirSync(join(ROOT, 'themes')).filter((f) => f.endsWith('.json')).sort();
let roles = null, largest = 0;
for (const f of files) {
  const where = `themes/${f}`, text = read(where), size = Buffer.byteLength(text);
  largest = Math.max(largest, size);
  if (!/^somnus-[a-z0-9-]+\.json$/.test(f)) fail(where, 'the file name must be somnus-<name>.json, in lower case');
  if (size > FILE_LIMIT) fail(where, `${size} bytes: T3 Code reads theme files up to ${FILE_LIMIT}`);
  let t;
  try { t = JSON.parse(text); } catch (e) { fail(where, `not JSON: ${e.message}`); continue; }
  for (const k of ['version', 'name', 'appearance', 'colors', 'css']) if (!(k in t)) fail(where, `no "${k}"`);
  if (!['dark', 'light'].includes(t.appearance)) fail(where, `appearance is "${t.appearance}"`);
  if (typeof t.name !== 'string' || !t.name.startsWith('Somnus · ')) fail(where, `the name must begin "Somnus · " (it is "${t.name}")`);
  const other = t.appearance === 'dark' ? 'light' : 'dark';
  if (!t.variants?.[other]) fail(where, `no ${other} side`);
  for (const [side, colours] of [[t.appearance, t.colors || {}], [other, t.variants?.[other] || {}]]) {
    const keys = Object.keys(colours).sort().join(',');
    roles ??= keys;
    if (keys !== roles) fail(where, `the ${side} side does not have the same colour roles as the other themes`);
    for (const [k, v] of Object.entries(colours)) if (!COLOUR.test(v)) fail(where, `${side} ${k} is not a colour: ${v}`);
  }
  const css = String(t.css || '');
  if (css.length > CSS_LIMIT) fail(where, `the CSS is ${css.length} characters: T3 Code reads ${CSS_LIMIT}`);
  if (/@import|<script|javascript:|expression\(/i.test(css)) fail(where, 'the CSS holds something a theme must not');
  // a theme may only point at pictures it carries itself (data:) or at parts of them (#id): nothing from a network
  for (const m of css.matchAll(/url\(\s*(['"]?)([^'")]{0,24})/g)) if (!/^(data:|#|%23)/.test(m[2])) fail(where, `the CSS loads from elsewhere: url(${m[2]}…`);
  let depth = 0;
  for (const ch of css.replace(/url\((['"])data:[^'"]*\1\)/g, '')) { if (ch === '{') depth++; else if (ch === '}') depth--; }
  if (depth) fail(where, 'the CSS has unbalanced braces');
}

// ---- the lists --------------------------------------------------------------------------------------------------------
const index = JSON.parse(read('themes.json')), ids = files.map((f) => f.slice(0, -5)).sort();
if (index.map((t) => t.id).sort().join() !== ids.join()) fail('themes.json', 'does not list exactly the files in themes/');
for (const t of index) {
  for (const k of ['id', 'name', 'group', 'appearance', 'about', 'file', 'preview']) if (!t[k]) fail('themes.json', `${t.id} has no ${k}`);
  if (!existsSync(join(ROOT, t.file))) fail('themes.json', `${t.id}: ${t.file} is missing`);
  for (const shot of ['preview', 'dark', 'light', 'new-thread']) if (!existsSync(join(ROOT, 'screenshots', t.id, `${shot}.webp`))) fail('screenshots', `${t.id}/${shot}.webp is missing`);
}
const tsv = read('themes.tsv').trimEnd().split('\n').map((l) => l.split('\t'));
if (tsv.length !== index.length || tsv.some((r, i) => r.length !== 5 || r[0] !== index[i].id || r[1] !== index[i].group)) fail('themes.tsv', 'does not match themes.json');

// ---- the install script and the page ------------------------------------------------------------------------------------
const install = read('install.sh'), starter = (install.match(/^STARTER="([^"]*)"/m) || [])[1]?.split(' ') || [];
if (!starter.length || starter.length > THEME_FILES) fail('install.sh', 'the starter set is empty, or larger than T3 Code reads');
for (const s of starter) if (!ids.includes(`somnus-${s}`)) fail('install.sh', `the starter set names a theme that is not here: ${s}`);
if (!new RegExp(`\\b${files.length} themes`).test(read('README.md'))) fail('README.md', `does not say there are ${files.length} themes`);

// ---- nothing private: no paths of anyone's machine in any text file -----------------------------------------------------
const TEXT = new Set(['.md', '.json', '.tsv', '.sh', '.mjs', '.js', '.css', '.html', '.yml', '.yaml', '.txt', '']);
const walk = (dir) => readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((e) => (e.name === '.git' || e.name === 'node_modules' ? [] : e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
for (const f of walk('.')) {
  if (!TEXT.has(extname(f)) || statSync(join(ROOT, f)).size > 2e6) continue;
  const m = read(f).match(/\/Users\/[A-Za-z0-9._-]+|\/home\/[a-z][a-z0-9._-]+\/|[A-Z]:\\Users\\[A-Za-z0-9._-]+/);
  if (m && !/^(\/Users\/you|\/home\/you\/)$/.test(m[0])) fail(f, `holds a path of somebody's machine: ${m[0]}`);
}

console.log(bad ? `\n${bad} problem(s)` : `${files.length} themes, the lists, ${index.length * 4} pictures, the install script: all sound (largest theme file ${(largest / 1024).toFixed(0)} KB of ${(FILE_LIMIT / 1024).toFixed(0)} KB)`);
process.exit(bad ? 1 : 0);
