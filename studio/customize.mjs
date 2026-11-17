#!/usr/bin/env node
/*! The Studio · Copyright (c) 2026 mako (https://github.com/mako-code) · PolyForm Noncommercial 1.0.0 (studio/LICENSE.md) · themes made with it are yours */
// Make any theme in this collection your own: recolour it, turn its glow, backdrop and motion up or down,
// change its corners, add CSS of your own. One file, no dependencies. The Studio's page runs this same
// code in the browser; in a terminal:
//
//   node studio/customize.mjs hanami --hue 40 --glow 0.2 --name "My Hanami"
//   node studio/customize.mjs --help
//
// Recolouring keeps every colour exactly as bright as it was (same relative luminance), so the contrast
// between any two colours of a theme does not change: a theme that was readable stays readable.

export const REPO = 'mako-code/t3code-themes';
export const RAW = `https://raw.githubusercontent.com/${REPO}/main`;
export const CSS_LIMIT = 50000; // T3 Code ignores a theme's CSS beyond this
/** T3 Code leaves out a theme whose name, or whose file name, is longer than this */
export const NAME_LIMIT = 48;
/** the longest of `names` that T3 Code shows; failing all, the last cut to fit */
const fitName = (...names) => names.find((n) => n.length <= NAME_LIMIT) ?? names.at(-1).slice(0, NAME_LIMIT).trim();
const unbrand = (n) => n.replace(/^Somnus · /, '');
/** how many theme files T3 Code reads from its themes folder (the first so many by name) */
export const THEME_FILES = 32;

/** every setting, with its range; `null` means "as the theme ships" */
export const OPTIONS = {
  hue: { kind: 'number', min: -180, max: 180, step: 1, default: 0, unit: '°', label: 'Hue shift', help: 'turn every colour round the colour wheel' },
  saturation: { kind: 'number', min: 0, max: 2, step: 0.05, default: 1, unit: '×', label: 'Saturation', help: '0 is greyscale, 1 as shipped, 2 twice as vivid' },
  accent: { kind: 'color', default: null, label: 'Accent', help: 'a new accent colour (its hue and vividness are used; brightness stays as designed)' },
  accent2: { kind: 'color', default: null, label: 'Second accent', help: 'a new second accent colour' },
  tint: { kind: 'color', default: null, label: 'Tint', help: 'the hue of the greys: canvas, surfaces, borders, text' },
  colors: { kind: 'string', default: null, label: 'Single colours', help: 'replace single colours exactly as given, per appearance: dark.canvas=#101014,light.text=#222222 (the roles: --roles)' },
  glow: { kind: 'number', min: 0, max: 1, step: 0.05, default: null, unit: '', label: 'Glow', help: 'how strongly lit things glow: 0 none, 0.5 soft, 1 bright' },
  trail: { kind: 'number', min: 0, max: 1, step: 0.05, default: null, unit: '', label: 'Trail', help: 'the light that travels round the chat bar while the agent works: 0 off' },
  wash: { kind: 'number', min: 0, max: 30, step: 1, default: null, unit: '%', label: 'Accent wash', help: 'how much of the accent washes down from the top of the conversation: 0 none' },
  shadows: { kind: 'number', min: 0, max: 2, step: 0.05, default: 1, unit: '×', label: 'Shadows', help: 'how deep the shadows of cards, menus and buttons are: 0 flat' },
  lines: { kind: 'number', min: 0, max: 2.5, step: 0.05, default: 1, unit: '×', label: 'Hairlines', help: 'how strongly borders and dividers are drawn: 0 none' },
  backdrop: { kind: 'number', min: 0, max: 1.5, step: 0.05, default: 1, unit: '×', label: 'Backdrop strength', help: '0 hides the backdrop, 1 as shipped; above 1 it can get in the way of text' },
  speed: { kind: 'number', min: 0.25, max: 4, step: 0.05, default: 1, unit: '×', label: 'Backdrop speed', help: 'how fast the backdrop moves' },
  emblem: { kind: 'boolean', default: true, label: 'Emblem', help: 'the small animated picture above a new thread', off: 'leave out the small animated picture above a new thread' },
  motion: { kind: 'boolean', default: true, label: 'Motion', help: 'off holds everything still, as with the reduce-motion setting of your system', off: 'hold everything still, as with the reduce-motion setting of your system' },
  pace: { kind: 'number', min: 0.5, max: 2, step: 0.05, default: 1, unit: '×', label: 'Interface pace', help: 'how fast menus, messages and buttons move' },
  bounce: { kind: 'number', min: 0, max: 0.6, step: 0.05, default: null, unit: '', label: 'Spring', help: 'how far things overshoot when they move: 0 settles calmly, 0.6 bounces' },
  corners: { kind: 'number', min: 0, max: 2, step: 0.05, default: 1, unit: '×', label: 'Corners', help: '0 square, 1 as shipped, 2 twice as round' },
  cardCorners: { kind: 'number', min: 0, max: 32, step: 1, default: null, unit: 'px', label: 'Card corners', help: 'the corner radius of the chat bar, cards, menus and your messages' },
  controlCorners: { kind: 'number', min: 0, max: 24, step: 1, default: null, unit: 'px', label: 'Control corners', help: 'the corner radius of inputs, rows and code blocks' },
  buttonCorners: { kind: 'number', min: 0, max: 24, step: 1, default: null, unit: 'px', label: 'Button corners', help: 'the corner radius of buttons' },
  pills: { kind: 'boolean', default: false, label: 'Pill buttons', help: 'buttons with fully round ends' },
  glass: { kind: 'boolean', default: false, label: 'Frosted glass', help: 'the chat bar and the header blur what scrolls under them' },
  glaze: { kind: 'boolean', default: false, label: 'Glaze', help: 'a soft sheen on the chat bar, your messages and menus' },
  outline: { kind: 'boolean', default: false, label: 'Ink outline', help: 'an outline and a hard shadow on your messages' },
  font: { kind: 'font', default: null, label: 'Interface font', help: 'the font of the interface: system, serif, rounded, humanist, geometric, slab, mono, or the name of a font installed on your computer' },
  readingFont: { kind: 'font', default: null, label: 'Reading font', help: 'the font of the conversation: replies and your messages' },
  headingFont: { kind: 'font', default: null, label: 'Heading font', help: 'the font of headings in replies' },
  codeFont: { kind: 'font', mono: true, default: null, label: 'Code font', help: 'the font of code, diffs and keys' },
  textSize: { kind: 'number', min: 0.85, max: 1.4, step: 0.05, default: 1, unit: '×', label: 'Reading size', help: 'the size of running text in replies and your messages' },
  leading: { kind: 'number', min: 1.2, max: 2, step: 0.05, default: null, unit: '', label: 'Line spacing', help: 'the line height of the conversation' },
  name: { kind: 'string', default: null, label: 'Name', help: `the name shown in T3 Code (at most ${48} characters)` },
  css: { kind: 'string', default: '', label: 'Your own CSS', help: 'added after the theme’s CSS' },
};
export const DEFAULTS = Object.fromEntries(Object.entries(OPTIONS).map(([k, o]) => [k, o.default]));

/** looks to start from */
export const PRESETS = {
  shipped: { label: 'As shipped', options: {} },
  quiet: { label: 'Quiet', options: { glow: 0.2, trail: 0, backdrop: 0.55, speed: 0.6, wash: 0 } },
  still: { label: 'Still', options: { motion: false, trail: 0 } },
  vivid: { label: 'Vivid', options: { saturation: 1.3, glow: 0.9, backdrop: 1.3 } },
  mono: { label: 'Mono', options: { saturation: 0 } },
  sharp: { label: 'Sharp', options: { corners: 0.3, bounce: 0 } },
  soft: { label: 'Soft', options: { corners: 1.6, pace: 0.8 } },
  flat: { label: 'Flat', options: { shadows: 0, glow: 0, lines: 1.5 } },
  glassy: { label: 'Glassy', options: { glass: true, glaze: true, shadows: 1.3 } },
  editorial: { label: 'Editorial', options: { readingFont: 'serif', headingFont: 'serif', textSize: 1.05, leading: 1.7 } },
  playful: { label: 'Playful', options: { bounce: 0.5, corners: 1.5, pills: true } },
  terminal: { label: 'Terminal', options: { font: 'mono', readingFont: 'mono', headingFont: 'mono', corners: 0, shadows: 0 } },
};

/** font stacks by name: only fonts that computers come with. Any other value is the name of a font installed on yours. */
export const FONTS = {
  system: '-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif',
  serif: '"Iowan Old Style",Charter,"Bitstream Charter",Georgia,ui-serif,serif',
  rounded: 'ui-rounded,"SF Pro Rounded","Hiragino Maru Gothic ProN",Quicksand,Nunito,system-ui,sans-serif',
  humanist: 'Seravek,"Gill Sans Nova",Ubuntu,Calibri,"DejaVu Sans",sans-serif',
  geometric: 'Avenir,"Avenir Next",Montserrat,Corbel,"URW Gothic",sans-serif',
  slab: 'Rockwell,"Rockwell Nova","Roboto Slab","DejaVu Serif",serif',
  mono: 'ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace',
};
const GENERIC = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-serif|ui-sans-serif|ui-monospace|ui-rounded|-apple-system|BlinkMacSystemFont)$/;
/** the CSS font stack of a font setting: a stack by name, or the fonts named, with `fallback` behind them */
export const fontStack = (value, fallback = 'system') => {
  const v = String(value).trim();
  if (FONTS[v.toLowerCase()]) return FONTS[v.toLowerCase()];
  const names = v.split(',').map((n) => n.replace(/["'`;:{}()<>\\\n\r]/g, '').trim().slice(0, 60)).filter(Boolean);
  if (!names.length) throw new Error(`not a font: ${value}`);
  return [...names.map((n) => (GENERIC.test(n) ? n : `"${n}"`)), FONTS[fallback]].join(',');
};

// ───────────────────────────── colour ─────────────────────────────
const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const gam = (v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);
const toLab = ([r, g, b]) => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
};
const fromLab = ([L, a, b]) => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
};
const lumOf = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const hex2 = (n) => Math.round(n).toString(16).padStart(2, '0');

/** '#rgb', '#rrggbb', '#rrggbbaa' or 'rgb(r g b / a)' → [r, g, b] (0–255), or null */
export const parseColor = (s) => {
  if (typeof s !== 'string') return null;
  let m = s.trim().match(/^#([0-9a-f]{3,8})$/i);
  if (m) { const h = m[1]; if (h.length === 3 || h.length === 4) return [0, 1, 2].map((i) => parseInt(h[i] + h[i], 16)); if (h.length === 6 || h.length === 8) return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); return null; }
  m = s.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
  return m ? [+m[1], +m[2], +m[3]] : null;
};
export const toHex = ([r, g, b]) => `#${hex2(r)}${hex2(g)}${hex2(b)}`;
/** relative luminance (WCAG) of [r, g, b] */
export const luminance = (rgb) => lumOf(rgb.map((v) => lin(v / 255)));
/** contrast ratio (WCAG) between two colours given as [r, g, b] */
export const contrast = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
/** lightness, chroma and hue (degrees) of [r, g, b], in OKLCH */
export const lch = (rgb) => { const [L, a, b] = toLab(rgb.map((v) => lin(v / 255))); return { L, C: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 }; };
const turn = (a, b) => ((a - b + 540) % 360) - 180; // signed difference between two hues

/** the colour with relative luminance y, chroma C and hue h (degrees); chroma gives way if sRGB cannot show it */
function withLuminance(y, C, h) {
  const cos = Math.cos((h * Math.PI) / 180), sin = Math.sin((h * Math.PI) / 180);
  for (let c = C; ; c = c < 0.003 ? 0 : c * 0.93) {
    let lo = 0, hi = 1;
    for (let i = 0; i < 26; i++) { const mid = (lo + hi) / 2; if (lumOf(fromLab([mid, c * cos, c * sin])) < y) lo = mid; else hi = mid; }
    const out = fromLab([(lo + hi) / 2, c * cos, c * sin]);
    if (c === 0 || out.every((v) => v > -0.002 && v < 1.002)) return out.map((v) => Math.round(gam(Math.min(1, Math.max(0, v))) * 255));
  }
}

// ───────────────────────────── reading a theme ─────────────────────────────
const PICTURE = /url\("data:image\/svg\+xml,[^"]*"\)/g;
const SEMANTIC = /^(error|warning|update)/; // red, amber and green keep their meaning: they are never recoloured
// where a theme's accent lives by name: used when the accent is a grey, which has no hue to find it by
const ACCENT_ROLES = ['accent', 'focus', 'messageAction', 'messageActionHover', 'terminalCursor', 'accentSurface', 'accentSurfaceForeground'];
const NAMED = /(--sx-(?:accent|accent-ink|accent-fill|ring|glow|rim-c|tint|pc|accent-2)):([^;}]*)/g;
const UI_ANIMATIONS = new Set(['sx-dot', 'sx-arrive', 'sx-caret', 'sx-card-in', 'sx-rise', 'sx-flow', 'sx-hero-in']);
const UI_PICTURES = new Set(['--sx-rim', '--sx-wave']);
const num = (v, d = 3) => String(+(+v).toFixed(d));

/** the colour roles of both appearances: [[mode, roles], …] */
const palettes = (theme) => [[theme.appearance || 'dark', theme.colors || {}], ...Object.entries(theme.variants || {})];
const prop = (css, name) => [...css.matchAll(new RegExp(`${name}:(#[0-9a-fA-F]{3,8}|rgb\\([^)]*\\))`, 'g'))].map((m) => parseColor(m[1])).filter(Boolean);

/** what a theme ships with: the values the Studio shows before anything is changed */
export function describe(theme) {
  const css = theme.css || '';
  const one = (re) => { const m = css.match(re); return m ? +m[1] : null; };
  const accents = palettes(theme).map(([, c]) => parseColor(c.accent)).filter(Boolean);
  return {
    name: theme.name, appearance: theme.appearance || 'dark', modes: palettes(theme).map(([m]) => m),
    glow: one(/--sx-glow-k:([\d.]+)/), trail: one(/--sx-rim-o:([\d.]+)/), wash: one(/--sx-ambient:([\d.]+)%/),
    bounce: (() => { const m = css.match(/--sx-sp-pop:(linear\([^)]*\))/); return m ? +bounceOf(m[1]).toFixed(2) : null; })(),
    accent: accents[0] ? toHex(accents[0]) : null, accent2: prop(css, '--sx-accent-2')[0] ? toHex(prop(css, '--sx-accent-2')[0]) : null,
    canvas: parseColor(theme.canvas) ? toHex(parseColor(theme.canvas)) : null,
    corners: { card: one(/--sx-r-card:(\d+)px/), control: one(/--sx-r-md:(\d+)px/), button: one(/--sx-r-btn:(\d+)px/) },
    cssLength: css.length,
  };
}

// ───────────────────────────── the changes ─────────────────────────────
/**
 * A function (rgb, role) → rgb that applies the colour settings, or null when there are none. `role` is 'accent' or
 * 'accent2' for a colour that is the theme's accent by name ('accent?' for its glow, trail and particles, which
 * follow only when the theme has no coloured accent at all). Every colour comes out exactly as bright as it went
 * in, with one exception: a grey accent given a colour takes that colour's own brightness, but never less contrast
 * than the theme's secondary text has.
 */
function recolourer(theme, o) {
  const pick = (v) => { const c = parseColor(v); if (v && !c) throw new Error(`not a colour: ${v} (use #rrggbb)`); return c ? { ...lch(c), y: luminance(c) } : null; };
  const to = { accent: pick(o.accent), accent2: pick(o.accent2) }, tint = pick(o.tint);
  if (!o.hue && o.saturation === 1 && !to.accent && !to.accent2 && !tint) return null;
  const css = theme.css || '';
  const keep = new Set();
  // how dark a colour may be in the dark appearance and how light in the light one: as bright as the theme's own
  // secondary text, which the theme keeps readable on all of its surfaces and over its backdrop
  let floor = 0.45, ceiling = 0.06;
  for (const [mode, roles] of palettes(theme)) {
    for (const [k, v] of Object.entries(roles)) { const c = parseColor(v); if (c && SEMANTIC.test(k)) keep.add(c.join()); }
    const muted = parseColor(roles.textMuted);
    if (muted && mode === 'dark') floor = luminance(muted);
    if (muted && mode === 'light') ceiling = luminance(muted);
  }
  // the families a new accent replaces: colours close in hue to the theme's own accents
  const centres = {
    accent: [...palettes(theme).map(([, c]) => parseColor(c.accent)).filter(Boolean), ...prop(css, '--sx-accent')].map(lch).filter((c) => c.C >= 0.03),
    accent2: prop(css, '--sx-accent-2').map(lch).filter((c) => c.C >= 0.03),
  };
  const memo = new Map();
  return (rgb, role) => {
    const key = `${rgb.join()}${role || ''}`;
    if (keep.has(rgb.join())) return rgb;
    if (memo.has(key)) return memo.get(key);
    const was = lch(rgb);
    let { C, h } = was, y = luminance(rgb), best = null;
    if (C >= 0.03) for (const name of ['accent', 'accent2']) if (to[name]) for (const c of centres[name]) { const d = Math.abs(turn(h, c.h)); if (d <= 28 && (!best || d < best.d)) best = { d, c, to: to[name] }; }
    if (best) { h = best.to.h + turn(h, best.c.h); C *= Math.min(3, Math.max(0.2, best.to.C / best.c.C)); }
    else if (role && to[role.replace('?', '')] && C < 0.03 && (!role.endsWith('?') || !centres.accent.length)) { const t = to[role.replace('?', '')]; h = t.h; C = t.C; y = y > 0.4 ? Math.max(t.y, floor) : y < 0.12 ? Math.min(t.y, ceiling) : y; }
    else if (tint && C < 0.045) { h = tint.h; C = tint.C < 0.02 ? 0 : Math.min(0.04, tint.C * 0.2); }
    else { h += o.hue; C *= o.saturation; } // a colour you picked is taken as picked
    const out = Math.abs(C - was.C) < 1e-6 && Math.abs(turn(h, was.h)) < 1e-6 ? rgb : withLuminance(y, C, h);
    memo.set(key, out);
    return out;
  };
}

/** every colour written in `text` passed through `f`; pictures keep their encoding */
function mapColours(text, f, role, pictures = true) {
  const hex = (h, r) => { const c = parseColor(`#${h}`); const out = f(c, r); return out === c ? null : toHex(out).slice(1) + (h.length === 4 ? h[3] + h[3] : h.length === 8 ? h.slice(6) : ''); };
  const colours = (s, r) => s
    .replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])/g, (m, h) => { const out = hex(h, r); return out ? `#${out}` : m; })
    .replace(/rgb\((\d+) (\d+) (\d+)/g, (m, x, y, z) => { const c = [+x, +y, +z], out = f(c, r); return out === c ? m : `rgb(${out.join(' ')}`; });
  // declarations that hold the accent by name are told so
  const plain = (s) => { let out = '', at = 0; for (const m of s.matchAll(NAMED)) { out += `${colours(s.slice(at, m.index), role)}${m[1]}:${colours(m[2], m[1] === '--sx-accent-2' ? 'accent2' : /-(glow|rim-c|tint|pc)$/.test(m[1]) ? 'accent?' : 'accent')}`; at = m.index + m[0].length; } return out + colours(s.slice(at), role); };
  const picture = (s) => s.replace(/(url\(|href=')?%23([0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])/g, (m, ref, h) => { if (ref) return m; const out = hex(h); return out ? `%23${out}` : m; });
  let out = '', at = 0;
  for (const m of text.matchAll(PICTURE)) { out += plain(text.slice(at, m.index)) + (pictures ? picture(m[0]) : m[0]); at = m.index + m[0].length; }
  return out + plain(text.slice(at));
}

const scaleTimes = (s, k) => s.replace(/(\d*\.?\d+)(ms|s)\b/g, (m, n, u) => `${num(n / k)}${u}`);

/** the backdrop's speed: its CSS animations and the animations inside its pictures */
function respeed(css, k) {
  css = css.replace(/animation:([^;}]+)/g, (m, v) => { const name = (v.match(/sx-[a-z0-9-]+/) || [''])[0]; return !name || UI_ANIMATIONS.has(name) ? m : `animation:${scaleTimes(v, k)}`; });
  return css.replace(/(?:(--sx-[a-z0-9-]+):)?url\("data:image\/svg\+xml,[^"]*"\)/g, (m, name) => (UI_PICTURES.has(name) ? m : m.replace(/\b(dur|begin)='([^']*)'/g, (x, a, v) => `${a}='${scaleTimes(v, k)}'`)));
}

/** the backdrop's strength: the pictures and translucent colours of the two scene blocks, and the accent wash */
function restrength(css, k) {
  const alpha = (s) => s.replace(/(rgb\(\d+ \d+ \d+ \/ )([\d.]+)\)/g, (m, a, v) => `${a}${num(Math.min(1, v * k))})`);
  const picture = (s) => {
    if (k === 0) return 'none';
    const root = s.match(/%3Csvg[^%]*?%3E/);
    if (!root) return s;
    const has = root[0].match(/ opacity='([\d.]+)'/);
    if (k <= 1 || has) { const was = has ? +has[1] : 1, now = Math.min(1, was * k); return s.replace(root[0], has ? root[0].replace(has[0], now >= 1 ? '' : ` opacity='${num(now)}'`) : root[0].replace('%3Csvg', `%3Csvg opacity='${num(now)}'`)); }
    return s.replace(/\b((?:fill-|stroke-|stop-)?opacity)='([\d.]+)'/g, (m, a, v) => `${a}='${num(Math.min(1, v * k))}'`);
  };
  css = css.replace(/((?:\.dark|:root:not\(\.dark\))\{--sx-canvas:[^;]+;)([^}]*)\}/g, (m, head, body) => `${head}${body.split(/;(?=--sx-)/).map((d) => {
    if (d.startsWith('--sx-hero:')) return d;
    const i = d.indexOf(':'), v = d.slice(i + 1);
    return d.slice(0, i + 1) + (v.startsWith('url("data:image/svg+xml,') ? picture(v) : alpha(v));
  }).join(';')}}`);
  return css.replace(/--sx-ambient:([\d.]+)%/g, (m, v) => `--sx-ambient:${num(Math.min(40, v * k), 2)}%`);
}

// ───────────────────────────── shadows, lines, springs, single colours ─────────────────────────────
const layers = (v) => v.split(/,(?![^(]*\))/);
/** every colour in `v` with its alpha times k; an opaque colour only gains an alpha when it is weakened */
const fade = (v, k) => v
  .replace(/rgb\((\d+ \d+ \d+)(?: \/ ([\d.]+))?\)/g, (m, rgb, a = 1) => { const n = Math.min(1, a * k); return n >= 1 ? `rgb(${rgb})` : `rgb(${rgb} / ${num(n)})`; })
  .replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])/g, (m, h) => {
    if (h.length < 6) h = [...h].map((c) => c + c).join('');
    const n = Math.min(1, (h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1) * k);
    return `#${h.slice(0, 6)}${n >= 1 ? '' : hex2(n * 255)}`;
  });
const RING = /^(inset )?0 0 0 \S+ /; // a line drawn as a shadow: no offset, no blur

/** the shadows (times k) and the drawn lines (times l) of the theme's surfaces; the lit top edges stay */
function reshade(css, k, l) {
  css = css.replace(/(--sx-(?:card|pop|seg|pill|btn|edge):)([^;}]+)/g, (m, name, v) => name + layers(v).map((x) => { const t = x.trim(); return t === 'none' || t.endsWith('transparent') ? x : fade(x, RING.test(t) ? l : t.startsWith('inset ') ? 1 : k); }).join(','));
  return l === 1 ? css : css.replace(/(--sx-line(?:-3)?:)([^;}]+)/g, (m, name, v) => name + fade(v, l));
}

/** a spring that overshoots by `bounce` (0 none), as a CSS linear() curve, and how long it takes to settle in periods */
function spring(bounce) {
  const z = 1 - bounce, w = 2 * Math.PI, wd = w * Math.sqrt(Math.max(0, 1 - z * z));
  const at = (t) => 1 - Math.exp(-z * w * t) * (wd > 1e-6 ? Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t) : 1 + w * t);
  let end = 4;
  while (end > 0.3 && Math.abs(at(end) - 1) < 0.002) end -= 0.01;
  const n = 36, points = Array.from({ length: n + 1 }, (_, i) => (i === 0 ? '0' : i === n ? '1' : num(at((end * i) / n))));
  return [`linear(${points.join(',')})`, end];
}
/** how far a linear() spring curve overshoots, as a bounce */
function bounceOf(curve) {
  const over = Math.max(...curve.slice(7, -1).split(',').map((x) => parseFloat(x))) - 1;
  return over > 0.002 ? 1 + Math.log(over) / Math.hypot(Math.PI, Math.log(over)) : 0;
}
/** every spring of the theme with a new bounce; each keeps its pace */
function respring(css, bounce) {
  const [curve, end] = spring(bounce), ratios = {};
  return css.replace(/(--sx-sp-([a-z]+):)(linear\([^)]*\)|var\(--sx-sp-([a-z]+)\));(--sx-sp-\2-dur:)(\d+)ms/g, (m, a, name, v, alias, b, ms) => {
    const ratio = (ratios[name] = alias ? ratios[alias] ?? 1 : end / spring(bounceOf(v))[1]);
    return `${a}${alias ? v : curve};${b}${Math.round(ms * ratio)}ms`;
  });
}

/** the colour roles a single colour can be given to: every role of the theme file */
export const roles = (theme) => Object.fromEntries(palettes(theme).map(([mode, c]) => [mode, c]));
/**
 * Single colours replaced exactly as given: "dark.canvas=#101014,light.text=#222222" (no appearance: both). The
 * role takes the colour, and so does everything else of that appearance that had the role's colour: the other
 * roles, the theme's own surfaces, its backdrop. A colour's translucency stays as it was. This is the one
 * setting that can cost readability: the colour is taken as given.
 */
function repaint(out, css, list) {
  const main = out.appearance || 'dark', sets = {};
  for (const item of String(list).split(/[,;\s]+/).filter(Boolean)) {
    const m = item.match(/^(?:(dark|light)\.)?([A-Za-z0-9]+)=(.+)$/);
    if (!m) throw new Error(`not a colour setting: ${item} (write dark.canvas=#101014)`);
    const to = parseColor(m[3]);
    if (!to) throw new Error(`not a colour: ${m[3]} (use #rrggbb)`);
    for (const mode of m[1] ? [m[1]] : palettes(out).map(([x]) => x)) {
      const of = mode === main ? out.colors : out.variants?.[mode], was = parseColor(of?.[m[2]]);
      if (!of) throw new Error(`the theme has no ${mode} appearance`);
      if (!was) throw new Error(`no colour role named ${m[2]} (see: --roles)`);
      const set = (sets[mode] ||= { map: new Map(), given: {} });
      set.map.set(was.join(), to);
      set.given[m[2]] = to;
    }
  }
  for (const [mode, { map, given }] of Object.entries(sets)) {
    const f = (c) => map.get(c.join()) || c, of = mode === main ? out.colors : out.variants[mode];
    for (const [k, v] of Object.entries(of)) if (typeof v === 'string') of[k] = mapColours(v, given[k] ? () => given[k] : f);
    if (mode === main) for (const k of ['canvas', 'accent']) if (out[k]) out[k] = mapColours(out[k], given[k] ? () => given[k] : f);
    const head = mode === 'dark' ? '.dark' : ':root:not(.dark)';
    css = css.replace(/(\.dark|:root:not\(\.dark\))(?![\w-])([^{}]*)\{([^}]*)\}/g, (m, sel, more, body) => (sel === head ? `${sel}${more}{${mapColours(body, f)}}` : m));
  }
  return css;
}

/** the CSS of the settings that add to a theme and change nothing in it: fonts, text, surface styles */
function additions(o, css) {
  const add = [], vars = [];
  if (o.font) vars.push(`--font-sans:${fontStack(o.font)}`);
  if (o.codeFont) vars.push(`--font-mono:${fontStack(o.codeFont, 'mono')}`);
  if (vars.length) add.push(`:root{${vars.join(';')}}`);
  const text = [];
  if (o.readingFont) text.push(`font-family:${fontStack(o.readingFont)}!important`);
  if (o.textSize !== 1) text.push(`font-size:${num(o.textSize)}em`);
  if (o.leading !== null) text.push(`line-height:${num(o.leading)}`);
  if (text.length) add.push(`.chat-markdown,[data-user-message-bubble]{${text.join(';')}}`);
  if (o.headingFont) add.push(`.chat-markdown :is(h1,h2,h3,h4),h1:has([data-draft-project-trigger]){font-family:${fontStack(o.headingFont)}!important}`);
  if (o.pills) add.push(':root:root{--control-radius:999px}[data-slot="button"],[data-slot="select-trigger"]{border-radius:999px!important}');
  if (o.glass) add.push(':is([data-slot="composer-host"],[data-chat-header]){-webkit-backdrop-filter:blur(22px) saturate(1.7);backdrop-filter:blur(22px) saturate(1.7)}[data-slot="composer-host"]{background-color:color-mix(in srgb,var(--sx-card-bg) 80%,transparent)!important}');
  if (o.glaze && !css.includes('--sx-glaze')) add.push(':root:not(.dark){--sx-glaze:linear-gradient(180deg,rgb(255 255 255 / .7),rgb(255 255 255 / 0) 46%)}.dark{--sx-glaze:linear-gradient(180deg,rgb(255 255 255 / .06),rgb(255 255 255 / 0) 46%)}[data-slot="composer-host"],[data-user-message-bubble],[data-slot="popover-popup"],[data-slot="menu-popup"],[data-slot="dialog-popup"],[data-slot="command-dialog-popup"]{background-image:var(--sx-glaze)!important}');
  if (o.outline) add.push('[data-user-message-bubble]{box-shadow:0 0 0 1.5px var(--sx-fg),3px 3px 0 var(--sx-fg)!important}');
  return add.join('\n');
}

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\/\n?/g, '');
/** `f` applied to the CSS between the pictures */
const outside = (css, f) => { let out = '', at = 0; for (const m of css.matchAll(PICTURE)) { out += f(css.slice(at, m.index)) + m[0]; at = m.index + m[0].length; } return out + f(css.slice(at)); };

/**
 * A copy of `theme` with `options` applied (see OPTIONS). Anything left out stays as the theme ships.
 * Throws when a setting is out of range or the result would be more CSS than T3 Code accepts.
 */
export function customize(theme, options = {}) {
  const o = { ...DEFAULTS };
  for (const [k, v] of Object.entries(options)) {
    if (v === undefined || v === null || v === '') continue;
    const spec = OPTIONS[k];
    if (!spec) { if (k === 'id') continue; throw new Error(`unknown setting: ${k}`); }
    if (spec.kind === 'number') { const n = +v; if (!Number.isFinite(n)) throw new Error(`${k} must be a number`); o[k] = Math.min(spec.max, Math.max(spec.min, n)); }
    else if (spec.kind === 'boolean') o[k] = v === true || v === 'true' || v === 'on' || v === '1' || v === 1;
    else o[k] = String(v);
  }
  const out = JSON.parse(JSON.stringify(theme));
  let css = out.css || '';

  const f = recolourer(theme, o);
  if (f) {
    const value = (v, role) => (typeof v === 'string' ? mapColours(v, f, role) : v);
    const roles = (c) => Object.fromEntries(Object.entries(c).map(([k, v]) => [k, SEMANTIC.test(k) ? v : value(v, ACCENT_ROLES.includes(k) ? 'accent' : undefined)]));
    if (out.colors) out.colors = roles(out.colors);
    for (const m of Object.keys(out.variants || {})) out.variants[m] = roles(out.variants[m]);
    if (out.canvas) out.canvas = value(out.canvas);
    if (out.accent) out.accent = value(out.accent, 'accent');
    css = mapColours(css, f);
  }
  if (o.colors) css = repaint(out, css, o.colors);
  if (o.glow !== null) css = css.replace(/--sx-glow-k:[\d.]+/, `--sx-glow-k:${num(o.glow)}`);
  if (o.trail !== null) css = css.replace(/--sx-rim-o:[\d.]+/, `--sx-rim-o:${num(o.trail)}`);
  // A recoloured backdrop is drawn a touch quieter: its colours are as bright as before, but where a drawing is
  // translucent over the canvas the mix can come out a few percent stronger in another hue. This keeps the margin.
  const strength = o.backdrop * (f ? 0.9 : 1);
  if (strength !== 1) css = restrength(css, strength);
  if (o.wash !== null) { let i = 0; css = css.replace(/--sx-ambient:[\d.]+%/g, () => `--sx-ambient:${num(i++ ? o.wash * 0.6 : o.wash, 1)}%`); }
  if (o.shadows !== 1 || o.lines !== 1) {
    css = reshade(css, o.shadows, o.lines);
    if (o.lines !== 1) for (const c of [out.colors, ...Object.values(out.variants || {})]) for (const k of Object.keys(c || {})) if (/border$/i.test(k) && typeof c[k] === 'string') c[k] = fade(c[k], o.lines);
  }
  if (o.speed !== 1) css = respeed(css, o.speed);
  if (o.bounce !== null) css = respring(css, o.bounce);
  if (o.pace !== 1) css = css.replace(/(--sx-(?:sp-[a-z]+-dur|fast|med|slow):)(\d+)ms/g, (m, a, v) => `${a}${Math.max(1, Math.round(v / o.pace))}ms`);
  if (o.corners !== 1) css = css.replace(/(--sx-r-(?:card|md|btn):)(\d+)px/g, (m, a, v) => `${a}${Math.round(v * o.corners)}px`);
  for (const [k, part] of [['cardCorners', 'card'], ['controlCorners', 'md'], ['buttonCorners', 'btn']]) if (o[k] !== null) css = css.replace(new RegExp(`(--sx-r-${part}:)\\d+px`, 'g'), `$1${Math.round(o[k])}px`);
  if (!o.motion) css = css.replaceAll('@media (prefers-reduced-motion:no-preference){', '@media not all{').replaceAll('@media (prefers-reduced-motion:reduce){', '@media all{');
  if (!o.emblem) css += '\nh1:has([data-draft-project-trigger])::before{content:none!important}';
  const more = additions(o, css);
  if (more) css += `\n${more}`;
  if (o.css.trim()) css += `\n/* yours */\n${o.css.trim()}`;
  if (css.length > CSS_LIMIT) css = stripComments(css);
  if (css.length > CSS_LIMIT) css = css.replace(/\}\n+/g, '}'); // the line breaks between rules are only for reading
  if (css.length > CSS_LIMIT) css = css.replace(/;\}/g, '}'); // and so is the last semicolon of a rule
  if (css.length > CSS_LIMIT) css = css.replace(/-webkit-backdrop-filter:[^;}]+;/g, ''); // the unprefixed line says the same to every current browser
  if (css.length > CSS_LIMIT) css = css.replace(/([\s,(:])0\.(\d)/g, '$1.$2'); // 0.5 is .5
  if (css.length > CSS_LIMIT) css = css.replace(/, /g, ',').replace(/ \/ /g, '/'); // and a space after a comma or round a slash says nothing
  if (css.length > CSS_LIMIT) css = outside(css, (s) => s.replace(/rgb\((\d+) (\d+) (\d+) ?\/ ?([\d.]+)\)/g, (m, r, g, b, a) => `#${[r, g, b, Math.round(Math.min(1, a) * 255)].map(hex2).join('')}`)); // a translucent colour as #rrggbbaa
  if (css.length > CSS_LIMIT) throw new Error(`the theme would have ${css.length} characters of CSS; T3 Code accepts ${CSS_LIMIT}. ${o.css.trim() ? `Shorten your own CSS by ${css.length - CSS_LIMIT}` : `That is ${css.length - CSS_LIMIT} too many: take a font or a surface style back`}.`);
  out.css = css;
  if (o.name && o.name.trim().length > NAME_LIMIT) throw new Error(`the name is ${o.name.trim().length} characters long; T3 Code shows a theme only when its name has ${NAME_LIMIT} or fewer`);
  if (o.name) out.name = o.name.trim();
  else if (isChanged(options)) out.name = fitName(`${theme.name} (custom)`, `${unbrand(theme.name)} (custom)`, unbrand(theme.name));
  return out;
}

// ───────────────────────────── building your own ─────────────────────────────
/**
 * The parts a theme can be built from. Its colours are the theme you start with; each other part can be taken
 * from any theme of the collection: its backdrop (the scene and the emblem over a new thread), its motion (springs,
 * arrivals, how menus open) and its shape (corners, and how surfaces are lifted: soft shadows, hairlines, hard ink).
 */
export const PARTS = {
  scene: { label: 'Backdrop', help: 'the scene behind the conversation and the emblem over a new thread' },
  feel: { label: 'Motion', help: 'how the interface moves: springs, arrivals, how menus open' },
  form: { label: 'Shape', help: 'corners, and how surfaces are lifted: soft shadows, hairlines or hard ink' },
};
const HEAD_END = '[data-slot="scroll-area-thumb"]{border-radius:999px!important}';
const MOTION_AT = ':root{--sx-fast:', SCENE_AT = '[data-workspace-area="conversation"]{isolation:isolate';
const FORM = /^--sx-(?:r-card|r-md|r-btn|card|pop|edge|btn|pill)$/;
const MODE_BLOCK = /(\.dark|:root:not\(\.dark\))\{([^}]*)\}/g;
const ACCENTISH = new Set([...ACCENT_ROLES, '--sx-accent', '--sx-accent-2', '--sx-accent-ink', '--sx-accent-fill', '--sx-accent-fg', '--sx-ring', '--sx-tint']);

/** a theme's CSS in its four parts: the head (tokens and the shape of things), the chrome, the motion, the scene */
const taken = new WeakMap();
function parts(theme) {
  if (taken.has(theme)) return taken.get(theme);
  const css = theme.css || '', h = css.indexOf(HEAD_END), m = css.indexOf(MOTION_AT), s = css.indexOf(SCENE_AT);
  if (h < 0 || m < h || s < m) throw new Error(`${theme.name} cannot be taken apart`);
  // a part's heading comment goes with it
  const at = (i) => { const c = css.lastIndexOf('/* =====', i); return c > css.lastIndexOf('}', i) ? c : i; };
  const he = h + HEAD_END.length;
  const out = { head: css.slice(0, he), chrome: css.slice(he, at(m)), motion: css.slice(at(m), at(s)), scene: css.slice(at(s)) };
  taken.set(theme, out);
  return out;
}
/** the declarations of a block of custom properties as [[name, value], …] (values may hold pictures) */
const decls = (body) => body.split(/;(?=--)/).filter(Boolean).map((d) => { const i = d.indexOf(':'); return [d.slice(0, i), d.slice(i + 1)]; });
/** the token blocks of the head by appearance: { dark: Map, light: Map } */
function tokens(head) {
  const out = {};
  for (const [, sel, body] of head.matchAll(MODE_BLOCK)) out[sel === '.dark' ? 'dark' : 'light'] ??= new Map(decls(body));
  return out;
}
const colourOf = (theme, mode) => (mode === (theme.appearance || 'dark') || !theme.variants?.[mode] ? theme.colors : theme.variants[mode]) || {};

/**
 * A function rgb → rgb that carries colours of theme `from` over to theme `to`, in appearance `mode`: a colour
 * that is one of `from`'s roles or tokens becomes `to`'s colour of that role; any other colour near `from`'s
 * accents turns to `to`'s accents, and a grey takes `to`'s tint, each as bright as it was. With `own`, accents and
 * colours of their own stay: only the greys of the ground (canvas, surfaces, text) are carried over.
 */
function carrier(from, to, mode, own = false) {
  const exact = new Map();
  const put = (a, b, name) => { if (own && ACCENTISH.has(name)) return; const x = parseColor(a), y = parseColor(b); if (x && y && !exact.has(x.join())) exact.set(x.join(), y); };
  const a = colourOf(from, mode), b = colourOf(to, mode);
  for (const k of Object.keys(a)) if (!SEMANTIC.test(k) && typeof a[k] === 'string' && !/[/]|#[0-9a-f]{8}$/i.test(a[k])) put(a[k], b[k], k);
  const ta = tokens(parts(from).head)[mode], tb = tokens(parts(to).head)[mode];
  if (ta && tb) for (const [k, v] of ta) if (/^#[0-9a-f]{6}$/i.test(v.trim())) put(v, tb.get(k), k);
  const hue = own ? null : recolourer(from, { ...DEFAULTS, accent: b.accent, accent2: tb?.get('--sx-accent-2')?.trim() || null, tint: b.canvas });
  return (rgb) => exact.get(rgb.join()) ?? (hue ? hue(rgb) : rgb);
}
/** `text` (CSS of theme `from`) in the colours of theme `to`: each appearance's block in its own colours */
function carry(text, from, to, own = false) {
  if (from === to) return text;
  const main = to.appearance || 'dark', f = { dark: carrier(from, to, 'dark', own), light: carrier(from, to, 'light', own) };
  let out = '', at = 0;
  for (const m of text.matchAll(MODE_BLOCK)) { out += mapColours(text.slice(at, m.index), f[main]) + mapColours(m[0], f[m[1] === '.dark' ? 'dark' : 'light']); at = m.index + m[0].length; }
  return out + mapColours(text.slice(at), f[main]);
}

/**
 * A theme built from parts: the colours of `theme`, and `with.scene`, `with.feel`, `with.form` (themes of the
 * collection) for its backdrop, motion and shape. Every part is carried into the colours of `theme`; with `own`
 * the backdrop keeps colours of its own. Parts left out, or the theme itself, stay as `theme` has them.
 */
export function compose(theme, { scene, feel, form } = {}, { own = false, name } = {}) {
  if (scene === theme) scene = undefined;
  if (feel === theme) feel = undefined;
  if (form === theme) form = undefined;
  if (!scene && !feel && !form) return theme;
  const out = JSON.parse(JSON.stringify(theme)), base = parts(theme);
  let head = base.head;
  // motion: the springs and the wave of the motion's theme; shape: the trail round the chat bar follows the corners
  const root = (p) => p.head.match(/^:root\{[^\n]*\}/m)?.[0] ?? '';
  const pick = (body, from, test) => { const got = new Map(decls(body)); return decls(from).map(([k, v]) => (test(k) && got.has(k) ? [k, got.get(k)] : [k, v])); };
  let r = root(base);
  if (feel) r = `:root{${pick(root(parts(feel)).slice(6, -1), r.slice(6, -1), (k) => k.startsWith('--sx-sp-') || k === '--sx-wave').map(([k, v]) => `${k}:${v}`).join(';')}}`;
  if (form) r = `:root{${pick(root(parts(form)).slice(6, -1), r.slice(6, -1), (k) => k === '--sx-rim').map(([k, v]) => `${k}:${v}`).join(';')}}`;
  head = head.replace(root(base), () => r);
  if (form) {
    const theirs = tokens(carry(parts(form).head, form, theme));
    head = head.replace(MODE_BLOCK, (m, sel, body) => {
      const t = theirs[sel === '.dark' ? 'dark' : 'light'];
      return t ? `${sel}{${decls(body).map(([k, v]) => `${k}:${FORM.test(k) && t.has(k) ? t.get(k) : v}`).join(';')}}` : m;
    });
  }
  const css = head
    + (scene ? parts(scene).chrome : base.chrome) // the chrome differs only in the heading over a new thread, which goes with the scene
    + (feel ? carry(parts(feel).motion, feel, theme) : base.motion)
    + (scene ? carry(parts(scene).scene, scene, theme, own) : base.scene);
  out.css = css.length > CSS_LIMIT ? stripComments(css) : css;
  const names = [theme, scene, feel, form].filter(Boolean).map((t) => unbrand(t.name)).filter((n, i, all) => all.indexOf(n) === i);
  out.name = name || fitName(`Somnus · ${names.join(' × ')}`, names.join(' × '), `${names[0]} × ${names[1]}${names.length > 2 ? ` +${names.length - 2}` : ''}`, `${names[0]} (built)`);
  return out;
}
/** the file name of a built theme: its colours' theme and the themes of its parts */
export const mixId = (id, ids = {}) => {
  const all = `${id}-${[...new Set(Object.entries(ids).filter(([k, x]) => PARTS[k] && typeof x === 'string' && x !== id).map(([, x]) => x.replace(/^somnus-/, '')))].join('-')}`;
  if (all.length <= NAME_LIMIT) return all;
  // too long for T3 Code: the colours' theme and a short mark of the parts, the same for the same parts
  let h = 0;
  for (const c of all) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `${id.slice(0, NAME_LIMIT - 11).replace(/-+$/, '')}-mix-${h.toString(36).slice(0, 6)}`;
};

/** true when `options` change anything */
export const isChanged = (options = {}) => Object.entries(options).some(([k, v]) => k in OPTIONS && v !== undefined && v !== null && v !== '' && String(v) !== String(DEFAULTS[k]));
/** only the settings that differ from the defaults */
export const changed = (options = {}) => Object.fromEntries(Object.entries(options).filter(([k, v]) => k in OPTIONS && v !== undefined && v !== null && v !== '' && String(v) !== String(DEFAULTS[k])));
/** a file name for a customized theme: letters, digits and dashes */
export const slug = (s) => String(s).normalize('NFKD').replace(/[^\w\s-]/g, '').trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const RESERVED = ['system', 'light', 'dark', 't3-chat', 'grove', 'ocean', 'ember', 'iris'];
/** the id (file name) a customized copy of theme `id` gets */
/** (a built theme's id, from mixId, is its own: it needs no "-custom") */
export const customId = (id, options = {}, built = false) => {
  const fit = (x) => (x.length <= NAME_LIMIT ? x : x.slice(0, NAME_LIMIT).replace(/-+$/, ''));
  const s = fit(options.id ? slug(options.id) : options.name ? slug(options.name) : built ? id : `${id}-custom`);
  return !s || RESERVED.includes(s) ? fit(`${id}-custom`) : s;
};
/** the terminal command that makes the same theme; `parts` names the themes a built theme takes its parts from */
export const command = (id, options = {}, { remote = false, parts = {}, own = false } = {}) => {
  const q = (v) => (/^[\w.#-]+$/.test(String(v)) ? String(v) : `'${String(v).replaceAll("'", "'\\''")}'`);
  const built = Object.entries(parts).filter(([k, v]) => PARTS[k] && v && v !== id).map(([k, v]) => `--${k} ${v.replace(/^somnus-/, '')}`);
  if (built.length && own && parts.scene && parts.scene !== id) built.push('--own');
  const args = Object.entries(changed(options)).map(([k, v]) => (OPTIONS[k].kind === 'boolean' ? (OPTIONS[k].default ? `--no-${k}` : `--${k}`) : `--${k} ${q(v)}`));
  return `${remote ? `curl -fsSL ${RAW}/studio/customize.mjs | node --input-type=module -` : 'node studio/customize.mjs'} ${[id.replace(/^somnus-/, ''), ...built, ...args].join(' ')}`;
};

// ───────────────────────────── terminal ─────────────────────────────
const HELP = `Make a theme your own and install it in T3 Code.

  node studio/customize.mjs <theme> [settings]      <theme>: a name (hanami), a theme file, or a URL
  node studio/customize.mjs --list                   every theme in the collection

Settings (leave any out to keep it as shipped)
${Object.entries(OPTIONS).map(([k, o]) => `  ${(o.kind === 'boolean' ? (o.default ? `--no-${k}` : `--${k}`) : `--${k} ${o.kind === 'number' ? `<${o.min}…${o.max}>` : o.kind === 'color' ? '<#rrggbb>' : o.kind === 'font' ? '<font>' : '<text>'}`).padEnd(28)} ${o.off || o.help}`).join('\n')}
  --preset <${Object.keys(PRESETS).filter((k) => k !== 'shipped').join('|')}>   a set of the above to start from
  --css-file <file>          your own CSS, read from a file
  --roles                    list the theme's colour roles, for --colors

Build your own: the colours of <theme>, and parts of other themes
${Object.entries(PARTS).map(([k, p]) => `  --${k} <theme>`.padEnd(28) + ` ${p.label.toLowerCase()}: ${p.help}`).join('\n')}
  --own                      the backdrop keeps colours of its own instead of taking the theme's

Where it goes
  --id <name>                the file name of the new theme (default: from --name, or <theme>-custom)
  --out <folder|file>        default: ~/.t3/userdata/themes (or $T3_THEMES_DIR)
  --print                    write the theme to the terminal instead of installing it
  --set                      switch T3 Code to the new theme afterwards (runs: t3 theme set <id>)

Examples
  node studio/customize.mjs hanami --hue 40 --name "Hanami at dusk" --set
  node studio/customize.mjs pixel-overworld --accent '#ff7a59' --backdrop 0.6 --no-motion
  node studio/customize.mjs carbon --preset quiet --corners 0.4
  node studio/customize.mjs rainlight --readingFont serif --leading 1.7 --glass --bounce 0.4
  node studio/customize.mjs obsidian --colors 'dark.canvas=#0b0b10,dark.text=#f4f1ea'
  node studio/customize.mjs classic --scene hanami --feel jubilee --form pixel-overworld

The same settings, with a live preview: https://${REPO.split('/')[0]}.github.io/${REPO.split('/')[1]}/studio/`;

async function main(argv) {
  const fs = await import('node:fs'), path = await import('node:path'), os = await import('node:os'), url = await import('node:url');
  const here = (() => { try { return path.dirname(url.fileURLToPath(import.meta.url)); } catch { return null; } })();
  const local = here && fs.existsSync(path.join(here, '..', 'themes')) ? path.join(here, '..', 'themes') : null; // run from a copy of the repository
  const flags = {}, rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { rest.push(a); continue; }
    const k = a.slice(2);
    if (k.startsWith('no-') && OPTIONS[k.slice(3)]?.kind === 'boolean') flags[k.slice(3)] = false;
    else if (['help', 'list', 'print', 'set', 'check', 'roles', 'own'].includes(k)) flags[k] = true;
    else if (OPTIONS[k]?.kind === 'boolean') flags[k] = true;
    else { if (i + 1 >= argv.length) throw new Error(`--${k} needs a value`); flags[k] = argv[++i]; }
  }
  if (flags.help || (!rest.length && !flags.list && !flags.check)) { console.log(HELP); return; }
  const get = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(`${u}: ${r.status}`); return r.text(); };
  if (flags.list) {
    const index = JSON.parse(local ? fs.readFileSync(path.join(local, '..', 'themes.json'), 'utf8') : await get(`${RAW}/themes.json`));
    let group = '';
    for (const t of index) { if (t.group !== group) console.log(`\n${(group = t.group)}`); console.log(`  ${t.id.replace(/^somnus-/, '').padEnd(28)} ${t.about || ''}`); }
    return;
  }
  if (flags.check) return check(fs, path, local || rest[0]);
  /** a theme by name (hanami), file or URL: [id, its JSON text] */
  const fetchTheme = async (want) => {
    if (/^https?:/.test(want)) return [path.basename(new URL(want).pathname, '.json'), await get(want)];
    if (fs.existsSync(want) && fs.statSync(want).isFile()) return [path.basename(want, '.json'), fs.readFileSync(want, 'utf8')];
    const id = /^somnus-/.test(want) ? want : `somnus-${want}`;
    if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`no such theme: ${want}`);
    if (local && fs.existsSync(path.join(local, `${id}.json`))) return [id, fs.readFileSync(path.join(local, `${id}.json`), 'utf8')];
    return [id, await get(`${RAW}/themes/${id}.json`).catch(() => { throw new Error(`no such theme: ${want} (see: node studio/customize.mjs --list)`); })];
  };
  let [id, text] = await fetchTheme(rest[0]);
  const using = {}, ids = {};
  for (const k of Object.keys(PARTS)) if (flags[k]) { const [pid, ptext] = await fetchTheme(flags[k]); ids[k] = pid; using[k] = pid === id ? undefined : JSON.parse(ptext); }
  if (flags.roles) { for (const [mode, c] of Object.entries(roles(JSON.parse(text)))) { console.log(`\n${mode}`); for (const [k, v] of Object.entries(c)) console.log(`  ${k.padEnd(30)} ${v}`); } return; }
  const options = { ...(flags.preset ? (PRESETS[flags.preset] || (() => { throw new Error(`no such preset: ${flags.preset}`); })()).options : {}) };
  for (const k of Object.keys(OPTIONS)) if (k in flags) options[k] = flags[k];
  if (flags['css-file']) options.css = fs.readFileSync(flags['css-file'], 'utf8');
  const theme = customize(compose(JSON.parse(text), using, { own: !!flags.own }), options);
  const json = `${JSON.stringify(theme, null, 2)}\n`;
  if (flags.print) { process.stdout.write(json); return; }
  const mixed = Object.values(using).some(Boolean), newId = customId(mixed ? mixId(id, ids) : id, { ...options, id: flags.id }, mixed);
  let out = flags.out || process.env.T3_THEMES_DIR || path.join(os.homedir(), '.t3', 'userdata', 'themes');
  if (!out.endsWith('.json')) { fs.mkdirSync(out, { recursive: true }); out = path.join(out, `${newId}.json`); }
  const tmp = `${out}.${process.pid}.tmp`; // written whole, then moved into place: T3 Code never reads half a theme
  fs.writeFileSync(tmp, json);
  fs.renameSync(tmp, out);
  console.log(`${theme.name} → ${out}`);
  // T3 Code reads the first 32 theme files of the folder, by name, and ignores the rest
  const all = fs.readdirSync(path.dirname(out)).filter((f) => f.endsWith('.json')).sort(), past = all.slice(THEME_FILES);
  if (past.length) console.log(`\nT3 Code reads at most ${THEME_FILES} theme files, the first ${THEME_FILES} by name. This folder holds ${all.length}, so it will not show: ${past.map((f) => f.replace(/\.json$/, '')).join(', ')}.\nRemove ${past.length === 1 ? 'a theme' : `${past.length} themes`} you do not use to make room.\n`);
  if (flags.set) {
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync('t3', ['theme', 'set', path.basename(out, '.json')], { stdio: 'inherit' });
    if (r.error || r.status) console.log(`Could not run "t3 theme set ${path.basename(out, '.json')}": pick the theme in T3 Code under Settings → Appearance.`);
  } else console.log(`Pick it in T3 Code under Settings → Appearance, or run: t3 theme set ${path.basename(out, '.json')}`);
}

/** every theme in a folder through a range of settings: the result must still be a sound theme */
function check(fs, path, dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const trials = [{}, { hue: 90 }, { hue: -140, saturation: 1.6 }, { saturation: 0 }, { accent: '#ff7a59', accent2: '#35c2a1', tint: '#3355ff' }, { glow: 0, trail: 0, backdrop: 0, emblem: false, motion: false }, { backdrop: 1.5, speed: 3, pace: 2, corners: 2, glow: 1, trail: 1 }, { backdrop: 0.4, speed: 0.25, pace: 0.5, corners: 0 },
    { shadows: 0, lines: 0, wash: 0, bounce: 0, cardCorners: 0, controlCorners: 0, buttonCorners: 0 }, { shadows: 2, lines: 2.5, wash: 30, bounce: 0.6, cardCorners: 32, controlCorners: 24, buttonCorners: 24, pills: true, glass: true, glaze: true, outline: true },
    { font: 'rounded', readingFont: 'serif', headingFont: 'Georgia, serif', codeFont: 'JetBrains Mono', textSize: 1.2, leading: 1.8 }, { colors: 'dark.canvas=#101014,light.canvas=#fbfaf7,text=#808080' }];
  let bad = 0, worst = 0;
  const fail = (f, t, why) => { bad++; console.log(`✗ ${f} ${JSON.stringify(t)}: ${why}`); };
  for (const f of files) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8'), theme = JSON.parse(text);
    for (const t of trials) {
      let out;
      try { out = customize(theme, t); } catch (e) { fail(f, t, e.message); continue; }
      if (!Object.keys(t).length && JSON.stringify(out) !== JSON.stringify(theme)) fail(f, t, 'no settings must change nothing');
      if (out.css.length > CSS_LIMIT) fail(f, t, `css ${out.css.length}`);
      if (out.name.length > NAME_LIMIT) fail(f, t, `name ${out.name.length} characters: ${out.name}`);
      if (customId(f.replace(/\.json$/, ''), t).length > NAME_LIMIT) fail(f, t, 'file name too long');
      let depth = 0; for (const ch of out.css.replace(PICTURE, '')) { if (ch === '{') depth++; else if (ch === '}') depth--; }
      if (depth) fail(f, t, 'unbalanced braces');
      for (const m of out.css.matchAll(PICTURE)) { try { const svg = decodeURIComponent(m[0].slice(24, -2)); if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) throw new Error('not an svg'); } catch (e) { fail(f, t, `picture: ${e.message}`); break; } }
      // recolouring must leave every colour as bright as it was (single colours are taken as given)
      for (const [mode, was] of t.colors ? [] : palettes(theme)) {
        const now = mode === theme.appearance || !out.variants?.[mode] ? out.colors : out.variants[mode], canvas = parseColor(was.canvas);
        for (const k of Object.keys(was)) {
          const x = parseColor(was[k]), y = parseColor(now[k]);
          if (!x || !y) continue;
          if (ACCENT_ROLES.includes(k) && t.accent) { if (!/\/|#[0-9a-f]{8}$/i.test(was[k]) && contrast(y, canvas) < Math.min(4.5, contrast(x, canvas)) - 0.15) fail(f, t, `${mode} ${k}: ${was[k]} → ${now[k]} is ${contrast(y, canvas).toFixed(2)}:1 on the canvas (was ${contrast(x, canvas).toFixed(2)})`); continue; }
          const d = Math.abs(contrast(x, [0, 0, 0]) - contrast(y, [0, 0, 0])) / contrast(x, [0, 0, 0]);
          worst = Math.max(worst, d);
          if (d > 0.03) fail(f, t, `${mode} ${k}: ${was[k]} → ${now[k]} changed brightness by ${(d * 100).toFixed(1)}%`);
        }
      }
    }
  }
  // built from parts: every theme's colours with the backdrop, motion and shape of three others
  const all = files.map((f) => [f.replace(/\.json$/, ''), JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))]);
  all.forEach(([id, theme], i) => {
    const [s1, s2, s3] = [7, 61, 113].map((k) => all[(i + k) % all.length]);
    const what = `${id} + ${s1[0]}, ${s2[0]}, ${s3[0]}`;
    let out;
    try { out = customize(compose(theme, { scene: s1[1], feel: s2[1], form: s3[1] }, { own: i % 2 === 0 }), i % 3 ? {} : { hue: 30, corners: 1.4 }); } catch (e) { fail(what, '', e.message); return; }
    if (out.css.length > CSS_LIMIT) fail(what, '', `css ${out.css.length}`);
    if (out.name.length > NAME_LIMIT) fail(what, '', `name ${out.name.length} characters: ${out.name}`);
    if (mixId(id, { scene: s1[0], feel: s2[0], form: s3[0] }).length > NAME_LIMIT) fail(what, '', 'file name too long');
    let depth = 0; for (const ch of out.css.replace(PICTURE, '')) { if (ch === '{') depth++; else if (ch === '}') depth--; }
    if (depth) fail(what, '', 'unbalanced braces');
  });
  console.log(`${files.length} themes × ${trials.length} settings, and ${files.length} built from parts: ${bad ? `${bad} problems` : 'all sound'} (largest brightness drift ${(worst * 100).toFixed(2)}%)`);
  if (bad) process.exitCode = 1;
}

if (typeof process !== 'undefined' && process.argv?.[1] && (process.argv[1] === '-' || /customize\.mjs$/.test(process.argv[1]))) {
  main(process.argv.slice(2)).catch((e) => { console.error(`customize: ${e.message}`); process.exitCode = 1; });
}
