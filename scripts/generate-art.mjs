/**
 * RelicVerse — პროდუქტის ვიზუალების გენერატორი
 * ────────────────────────────────────────────────────────────
 * ქმნის ატმოსფერულ SVG სურათებს თითოეული პროდუქტისთვის
 * (3 რაკურსი) — client/public/products/ საქაღალდეში.
 * გარე სურათებზე დამოკიდებულება არ არსებობს → broken image არასდროს.
 *
 * გაშვება:  npm run art
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'products');
const products = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'products.json'), 'utf8'));
const universes = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'universes.json'), 'utf8'));

/* ── ფსევდო-შემთხვევითობა (რეპროდუცირებადი) ─────────────── */
function rng(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/* ── გლიფები — 100×100 კოორდინატებში, ცენტრი (50,50) ────── */
const M = 'url(#gMetal)';   // ძირითადი (ლითონი/მასალა)
const A = 'url(#gAccent)';  // აქცენტი (სამყაროს ფერი)
const D = '#100a1c';        // მუქი დეტალი
const L = '#f4f0ff';        // ღია დეტალი
const st = (w = 1.6) => `stroke="rgba(10,6,20,.55)" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

const glyphs = {
  stone: () => `
    <polygon points="50,10 78,32 68,74 32,74 22,32" fill="${A}" ${st(2)}/>
    <polygon points="50,10 68,74 50,90 32,74" fill="${L}" opacity=".35"/>
    <polygon points="50,10 78,32 68,74 50,90" fill="${D}" opacity=".25"/>
    <polygon points="50,10 78,32 68,74 32,74 22,32" fill="none" stroke="${L}" stroke-opacity=".55" stroke-width="1.4"/>
    <path d="M50 10 L50 90 M22 32 L78 32" stroke="${L}" stroke-opacity=".3" stroke-width="1"/>`,
  wand: () => `
    <path d="M24 82 L74 20" stroke="${M}" stroke-width="7" stroke-linecap="round"/>
    <path d="M24 82 L40 62" stroke="${D}" stroke-width="10" stroke-linecap="round"/>
    <circle cx="30" cy="75" r="3.2" fill="${A}"/>
    <circle cx="76" cy="17" r="5" fill="${A}"/>
    <path d="M76 6 L76 28 M65 17 L87 17" stroke="${L}" stroke-width="1.6" opacity=".8"/>
    <path d="M45 55 l3 3 M55 45 l3 3" stroke="${L}" stroke-width="2" opacity=".5"/>`,
  scarf: () => `
    <path d="M28 14 h44 v20 h-44 z" fill="${A}" ${st()}/>
    <path d="M28 34 h44 v14 h-44 z" fill="${M}" ${st()}/>
    <path d="M28 48 h44 v18 h-44 z" fill="${A}" ${st()}/>
    <path d="M28 66 h44 v12 h-44 z" fill="${M}" ${st()}/>
    <path d="M28 78 h44 v6 h-44 z" fill="${D}"/>
    <path d="M32 84 v8 M40 84 v8 M48 84 v8 M56 84 v8 M64 84 v8" stroke="${M}" stroke-width="2.4"/>`,
  snitch: () => `
    <path d="M46 46 C26 26 10 30 8 42 C16 40 26 44 40 54 Z" fill="${L}" opacity=".9" ${st(1.2)}/>
    <path d="M54 46 C74 26 90 30 92 42 C84 40 74 44 60 54 Z" fill="${L}" opacity=".9" ${st(1.2)}/>
    <circle cx="50" cy="58" r="18" fill="${A}" ${st(2)}/>
    <circle cx="50" cy="58" r="18" fill="none" stroke="${L}" stroke-opacity=".5"/>
    <path d="M32 58 h36 M50 40 v36" stroke="${D}" stroke-opacity=".35" stroke-width="1.4"/>
    <circle cx="43" cy="51" r="4.5" fill="${L}" opacity=".45"/>`,
  map: () => `
    <path d="M14 22 L38 16 L62 24 L86 16 L86 80 L62 88 L38 80 L14 86 Z" fill="${M}" ${st(2)}/>
    <path d="M38 16 L38 80 M62 24 L62 88" stroke="${D}" stroke-opacity=".4" stroke-width="1.4"/>
    <path d="M22 40 q14 -8 24 2 t24 -4" stroke="${A}" stroke-width="2" fill="none"/>
    <path d="M22 56 q16 6 28 -2 t26 4" stroke="${A}" stroke-width="2" fill="none"/>
    <circle cx="70" cy="66" r="3.4" fill="${A}"/>
    <path d="M28 70 l4 -6 l4 6 z" fill="${D}" opacity=".5"/>`,
  hourglass: () => `
    <circle cx="50" cy="50" r="36" fill="none" stroke="${M}" stroke-width="3"/>
    <ellipse cx="50" cy="50" rx="36" ry="13" fill="none" stroke="${M}" stroke-width="2.4" opacity=".8"/>
    <ellipse cx="50" cy="50" rx="13" ry="36" fill="none" stroke="${M}" stroke-width="2.4" opacity=".8"/>
    <path d="M40 32 h20 l-10 16 z" fill="${A}" opacity=".9"/>
    <path d="M40 68 h20 l-10 -16 z" fill="${A}" opacity=".55"/>
    <path d="M38 30 h24 M38 70 h24" stroke="${M}" stroke-width="3" stroke-linecap="round"/>`,
  mug: () => `
    <path d="M24 28 h44 v40 a12 12 0 0 1 -12 12 h-20 a12 12 0 0 1 -12 -12 z" fill="${M}" ${st(2)}/>
    <path d="M68 38 a13 13 0 0 1 0 26" fill="none" stroke="${M}" stroke-width="6"/>
    <ellipse cx="46" cy="28" rx="22" ry="6" fill="${L}" opacity=".25"/>
    <circle cx="46" cy="50" r="12" fill="${A}" opacity=".95"/>
    <path d="M30 34 v34" stroke="${L}" stroke-opacity=".25" stroke-width="3"/>`,
  cat: () => `
    <path d="M24 28 h44 v40 a12 12 0 0 1 -12 12 h-20 a12 12 0 0 1 -12 -12 z" fill="${M}" ${st(2)}/>
    <path d="M68 38 a13 13 0 0 1 0 26" fill="none" stroke="${M}" stroke-width="6"/>
    <path d="M34 52 q12 14 24 0" fill="none" stroke="${A}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M36 52 v6 M42 55 v6 M48 56 v6 M54 55 v6 M60 52 v6" stroke="${A}" stroke-width="1.6"/>
    <circle cx="38" cy="42" r="2.6" fill="${A}"/><circle cx="58" cy="42" r="2.6" fill="${A}"/>`,
  jacket: () => `
    <path d="M32 22 L20 30 L14 62 L26 66 L28 84 h44 l2 -18 l12 -4 l-6 -32 l-12 -8 z" fill="${A}" ${st(2)}/>
    <path d="M32 22 L50 40 L68 22 L64 84 h-28 z" fill="${D}" opacity=".35"/>
    <path d="M50 40 v44" stroke="${L}" stroke-opacity=".45" stroke-width="1.6" stroke-dasharray="3 3"/>
    <path d="M32 22 L50 40 L68 22" fill="none" stroke="${L}" stroke-opacity=".5" stroke-width="1.6"/>
    <rect x="34" y="62" width="12" height="4" rx="2" fill="${D}" opacity=".5"/>
    <rect x="54" y="62" width="12" height="4" rx="2" fill="${D}" opacity=".5"/>`,
  glasses: () => `
    <circle cx="30" cy="50" r="15" fill="${A}" fill-opacity=".55" stroke="${M}" stroke-width="3"/>
    <circle cx="70" cy="50" r="15" fill="${A}" fill-opacity=".55" stroke="${M}" stroke-width="3"/>
    <path d="M45 50 q5 -5 10 0" fill="none" stroke="${M}" stroke-width="3"/>
    <path d="M15 47 L4 40 M85 47 L96 40" stroke="${M}" stroke-width="3" stroke-linecap="round"/>
    <path d="M22 44 q6 -6 14 -4" stroke="${L}" stroke-opacity=".6" stroke-width="2.4" fill="none"/>`,
  soap: () => `
    <rect x="20" y="34" width="60" height="34" rx="12" fill="${A}" ${st(2)}/>
    <rect x="20" y="34" width="60" height="14" rx="7" fill="${L}" opacity=".28"/>
    <rect x="30" y="46" width="40" height="3" rx="1.5" fill="${D}" opacity=".45"/>
    <rect x="34" y="54" width="32" height="3" rx="1.5" fill="${D}" opacity=".3"/>
    <circle cx="76" cy="28" r="4" fill="${L}" opacity=".5"/><circle cx="66" cy="22" r="2.6" fill="${L}" opacity=".35"/>`,
  poster: () => `
    <rect x="22" y="12" width="56" height="76" rx="3" fill="${M}" ${st(2)}/>
    <rect x="28" y="18" width="44" height="44" rx="2" fill="${A}" opacity=".85"/>
    <circle cx="50" cy="36" r="12" fill="${L}" opacity=".3"/>
    <path d="M28 62 L42 46 L54 58 L64 50 L72 62 Z" fill="${D}" opacity=".45"/>
    <rect x="28" y="68" width="34" height="4" rx="2" fill="${L}" opacity=".55"/>
    <rect x="28" y="76" width="22" height="3" rx="1.5" fill="${L}" opacity=".3"/>`,
  tracksuit: () => `
    <path d="M34 18 L22 26 L18 50 L28 52 v34 h44 v-34 l10 -2 l-4 -24 l-12 -8 z" fill="${A}" ${st(2)}/>
    <path d="M50 18 v68" stroke="${D}" stroke-width="5"/>
    <path d="M26 30 L22 50 M74 30 L78 50" stroke="${D}" stroke-width="4" stroke-linecap="round"/>
    <path d="M40 20 q10 8 20 0" fill="none" stroke="${D}" stroke-width="2.4"/>`,
  katana: () => `
    <path d="M18 84 L74 20 q6 -6 8 -2 q2 4 -4 10 L26 88 Z" fill="${L}" opacity=".92" ${st(1.4)}/>
    <path d="M22 80 L76 22" stroke="${L}" stroke-width="1.4" opacity=".8"/>
    <rect x="14" y="72" width="18" height="6" rx="3" transform="rotate(-45 23 75)" fill="${A}"/>
    <path d="M8 96 L22 82" stroke="${D}" stroke-width="9" stroke-linecap="round"/>
    <path d="M9 95 L21 83" stroke="${A}" stroke-width="2" stroke-dasharray="2 3"/>`,
  apple: () => `
    <path d="M50 30 c-16 -8 -32 4 -30 22 c2 18 16 34 30 34 c14 0 28 -16 30 -34 c2 -18 -14 -30 -30 -22 z" fill="${A}" ${st(2)}/>
    <path d="M50 30 c-10 -6 -20 0 -22 12" stroke="${L}" stroke-opacity=".4" stroke-width="3" fill="none"/>
    <path d="M50 30 q2 -14 -6 -18" stroke="#5c3a1a" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M52 18 q12 -8 18 2 q-12 6 -18 -2 z" fill="#4c7f39"/>`,
  notebook: () => `
    <rect x="24" y="12" width="54" height="76" rx="3" fill="${D}" ${st(2)}/>
    <rect x="20" y="14" width="8" height="72" rx="3" fill="#08050f"/>
    <rect x="34" y="26" width="36" height="4" rx="2" fill="${L}" opacity=".85"/>
    <rect x="34" y="34" width="26" height="3" rx="1.5" fill="${L}" opacity=".5"/>
    <path d="M40 52 h24 M40 60 h24 M40 68 h16" stroke="${A}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`,
  figure: () => `
    <ellipse cx="50" cy="88" rx="24" ry="6" fill="${D}" opacity=".7"/>
    <path d="M50 14 c-9 0 -14 7 -13 14 l3 12 l-10 6 l-4 26 l8 2 l4 -14 l2 24 h20 l2 -24 l4 14 l8 -2 l-4 -26 l-10 -6 l3 -12 c1 -7 -4 -14 -13 -14 z" fill="${M}" ${st(1.8)}/>
    <circle cx="45" cy="24" r="2.4" fill="${A}"/><circle cx="55" cy="24" r="2.4" fill="${A}"/>
    <path d="M42 34 q8 6 16 0" stroke="${A}" stroke-width="2" fill="none"/>`,
  tophat: () => `
    <ellipse cx="50" cy="76" rx="42" ry="10" fill="${M}" ${st(2)}/>
    <path d="M28 24 q22 -8 44 0 l4 52 q-26 8 -52 0 z" fill="${M}" ${st(2)}/>
    <path d="M26 58 q24 8 48 0 l1.6 12 q-26 8 -51 0 z" fill="${A}"/>
    <rect x="58" y="58" width="14" height="10" rx="1.5" fill="${L}" opacity=".9"/>
    <path d="M28 24 q22 -8 44 0" fill="none" stroke="${L}" stroke-opacity=".3" stroke-width="2"/>`,
  bottle: () => `
    <path d="M42 16 h16 v14 l10 16 v34 a8 8 0 0 1 -8 8 h-20 a8 8 0 0 1 -8 -8 v-34 l10 -16 z" fill="${A}" fill-opacity=".55" stroke="${M}" stroke-width="2.4"/>
    <rect x="40" y="10" width="20" height="8" rx="3" fill="#7a5230"/>
    <path d="M34 60 h32 v22 a8 8 0 0 1 -8 8 h-16 a8 8 0 0 1 -8 -8 z" fill="${A}" opacity=".85"/>
    <rect x="37" y="52" width="26" height="14" rx="2" fill="${L}" opacity=".85"/>
    <path d="M41 57 h18 M41 61 h12" stroke="${D}" stroke-width="1.6" opacity=".7"/>`,
  pocketwatch: () => `
    <circle cx="50" cy="56" r="30" fill="${M}" ${st(2.4)}/>
    <circle cx="50" cy="56" r="23" fill="${L}" opacity=".92"/>
    <rect x="45" y="16" width="10" height="10" rx="3" fill="${M}"/>
    <circle cx="50" cy="12" r="6" fill="none" stroke="${M}" stroke-width="3"/>
    <path d="M50 56 L50 40 M50 56 L62 62" stroke="${D}" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="50" cy="56" r="2.6" fill="${A}"/>
    <path d="M50 36 v4 M70 56 h-4 M50 76 v-4 M30 56 h4" stroke="${D}" stroke-width="2" opacity=".7"/>`,
  compass: () => `
    <circle cx="50" cy="52" r="34" fill="${M}" ${st(2.4)}/>
    <circle cx="50" cy="52" r="26" fill="${D}" opacity=".85"/>
    <circle cx="50" cy="52" r="26" fill="none" stroke="${A}" stroke-width="1.4" opacity=".7"/>
    <path d="M50 30 L57 52 L50 74 L43 52 Z" fill="${A}"/>
    <path d="M50 30 L57 52 L50 52 Z" fill="${L}" opacity=".8"/>
    <circle cx="50" cy="52" r="3" fill="${L}"/>
    <path d="M50 22 v6 M80 52 h-6 M50 82 v-6 M20 52 h6" stroke="${A}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M42 14 h16 v6 h-16 z" fill="${M}"/>`,
  flag: () => `
    <path d="M22 12 v78" stroke="${M}" stroke-width="4" stroke-linecap="round"/>
    <path d="M24 14 q30 10 56 0 v42 q-26 10 -56 0 z" fill="${D}" ${st(1.8)}/>
    <circle cx="52" cy="30" r="8" fill="${L}" opacity=".9"/>
    <circle cx="49" cy="28" r="1.8" fill="${D}"/><circle cx="55" cy="28" r="1.8" fill="${D}"/>
    <path d="M45 42 l14 -8 M45 34 l14 8" stroke="${L}" stroke-width="3" opacity=".9" stroke-linecap="round"/>`,
  medallion: () => `
    <path d="M50 8 a1 1 0 0 0 0 30 a1 1 0 0 0 0 -30" fill="none" stroke="${M}" stroke-width="2.6"/>
    <circle cx="50" cy="58" r="28" fill="${A}" ${st(2.4)}/>
    <circle cx="50" cy="58" r="21" fill="none" stroke="${D}" stroke-width="2" opacity=".55"/>
    <circle cx="50" cy="53" r="9" fill="${D}" opacity=".55"/>
    <circle cx="46" cy="52" r="2.4" fill="${L}"/><circle cx="54" cy="52" r="2.4" fill="${L}"/>
    <path d="M44 66 h12 M46 70 h8" stroke="${D}" stroke-width="2" opacity=".55"/>
    <path d="M50 30 v10" stroke="${M}" stroke-width="3"/>`,
  bandana: () => `
    <path d="M14 34 q36 -18 72 0 l-8 16 q-28 -12 -56 0 z" fill="${A}" ${st(2)}/>
    <path d="M78 50 l14 20 l-16 -6 l-2 12 l-10 -20 z" fill="${A}" opacity=".85" ${st(1.4)}/>
    <path d="M22 40 q28 -10 56 0" fill="none" stroke="${L}" stroke-opacity=".35" stroke-width="2"/>
    <circle cx="30" cy="46" r="2.4" fill="${L}" opacity=".6"/><circle cx="66" cy="46" r="2.4" fill="${L}" opacity=".6"/>`,
  teacup: () => `
    <ellipse cx="48" cy="84" rx="34" ry="7" fill="${M}" opacity=".9"/>
    <path d="M26 44 h44 l-5 26 a10 10 0 0 1 -10 8 h-14 a10 10 0 0 1 -10 -8 z" fill="${L}" ${st(1.8)}/>
    <path d="M70 50 a12 12 0 0 1 0 20" fill="none" stroke="${L}" stroke-width="5"/>
    <ellipse cx="48" cy="44" rx="22" ry="6" fill="${A}" opacity=".5"/>
    <path d="M26 48 h44" stroke="${A}" stroke-width="2.4"/>
    <path d="M40 30 q4 -8 0 -14 M52 32 q4 -9 0 -16" stroke="${L}" stroke-opacity=".4" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  bookmark: () => `
    <path d="M36 10 h28 v76 l-14 -12 l-14 12 z" fill="${A}" ${st(2)}/>
    <path d="M36 10 h28 v14 h-28 z" fill="${D}" opacity=".45"/>
    <circle cx="50" cy="40" r="7" fill="${L}" opacity=".55"/>
    <path d="M43 56 h14 M45 64 h10" stroke="${L}" stroke-opacity=".55" stroke-width="2.4"/>`,
  badge: () => `
    <path d="M50 10 L78 22 v26 c0 18 -12 32 -28 42 c-16 -10 -28 -24 -28 -42 V22 z" fill="${A}" ${st(2.4)}/>
    <path d="M50 18 L70 27 v20 c0 13 -9 24 -20 31 c-11 -7 -20 -18 -20 -31 V27 z" fill="none" stroke="${L}" stroke-opacity=".55" stroke-width="1.6"/>
    <path d="M50 34 l4.5 9 l10 1.4 l-7.2 7 l1.7 10 l-9 -4.7 l-9 4.7 l1.7 -10 l-7.2 -7 l10 -1.4 z" fill="${L}" opacity=".85"/>`,
  chainsaw: () => `
    <rect x="10" y="44" width="46" height="10" rx="5" fill="${M}" ${st(1.6)}/>
    <path d="M10 44 v10 M14 42 v-3 M20 42 v-3 M26 42 v-3 M32 42 v-3 M38 42 v-3 M44 42 v-3" stroke="${M}" stroke-width="2.4"/>
    <rect x="52" y="30" width="34" height="38" rx="8" fill="${A}" ${st(2)}/>
    <rect x="58" y="20" width="20" height="12" rx="5" fill="${D}" opacity=".7"/>
    <circle cx="69" cy="49" r="7" fill="${D}" opacity=".6"/>
    <path d="M56 68 q14 12 28 0" fill="none" stroke="${D}" stroke-width="5" stroke-linecap="round"/>`,
  mask: () => `
    <path d="M50 10 c-18 0 -28 14 -28 34 c0 24 12 46 28 46 c16 0 28 -22 28 -46 c0 -20 -10 -34 -28 -34 z" fill="${L}" ${st(2)}/>
    <ellipse cx="38" cy="44" rx="7" ry="9" fill="${D}"/>
    <ellipse cx="62" cy="44" rx="7" ry="9" fill="${D}"/>
    <path d="M50 54 l-4 10 h8 z" fill="${D}" opacity=".7"/>
    <path d="M40 74 q10 6 20 0" fill="none" stroke="${D}" stroke-width="3" stroke-linecap="round"/>`,
  ouija: () => `
    <rect x="12" y="22" width="76" height="56" rx="6" fill="${M}" ${st(2.4)}/>
    <path d="M22 40 q28 -12 56 0" fill="none" stroke="${D}" stroke-width="2.4" opacity=".6"/>
    <path d="M22 54 q28 -10 56 0" fill="none" stroke="${D}" stroke-width="2.4" opacity=".45"/>
    <circle cx="30" cy="68" r="4" fill="${A}"/><circle cx="70" cy="68" r="4" fill="${A}"/>
    <path d="M44 60 h12 l4 12 h-20 z" fill="${A}" opacity=".8" ${st(1.2)}/>
    <circle cx="50" cy="66" r="3" fill="${L}" opacity=".8"/>`,
  boots: () => `
    <path d="M30 14 h18 v42 l14 12 v14 h-36 v-14 z" fill="${M}" ${st(2)}/>
    <path d="M26 76 h40 a4 4 0 0 1 4 4 v6 h-48 v-6 a4 4 0 0 1 4 -4 z" fill="${D}"/>
    <path d="M33 22 h12 M33 30 h12 M33 38 h12 M33 46 h12" stroke="${A}" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="31" cy="22" r="1.6" fill="${A}"/><circle cx="47" cy="22" r="1.6" fill="${A}"/>
    <path d="M62 68 l8 4" stroke="${A}" stroke-width="2.4"/>`,
  totoro: () => `
    <ellipse cx="50" cy="60" rx="32" ry="34" fill="${M}" ${st(2)}/>
    <ellipse cx="50" cy="66" rx="22" ry="26" fill="${L}" opacity=".85"/>
    <path d="M30 30 l-4 -16 l14 10 z M70 30 l4 -16 l-14 10 z" fill="${M}" ${st(1.4)}/>
    <circle cx="40" cy="46" r="4" fill="${D}"/><circle cx="60" cy="46" r="4" fill="${D}"/>
    <path d="M46 54 l4 4 l4 -4 z" fill="${D}"/>
    <path d="M42 62 h4 M54 62 h4 M40 70 h6 M54 70 h6" stroke="${A}" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 46 h-12 M22 52 h-12 M78 46 h12 M78 52 h12" stroke="${M}" stroke-width="1.6" opacity=".7"/>`,
  flame: () => `
    <path d="M50 8 c14 20 24 26 24 44 a24 24 0 0 1 -48 0 c0 -14 8 -20 14 -30 c2 8 6 10 10 12 c2 -10 0 -18 0 -26 z" fill="${A}" ${st(2)}/>
    <path d="M50 40 c8 10 12 14 12 24 a12 12 0 0 1 -24 0 c0 -10 6 -14 12 -24 z" fill="${L}" opacity=".75"/>
    <circle cx="44" cy="56" r="2.4" fill="${D}"/><circle cx="56" cy="56" r="2.4" fill="${D}"/>
    <path d="M44 66 q6 5 12 0" fill="none" stroke="${D}" stroke-width="2" stroke-linecap="round"/>`,
  bag: () => `
    <path d="M24 30 h52 l6 56 h-64 z" fill="${M}" ${st(2)}/>
    <path d="M38 32 v-6 a12 12 0 0 1 24 0 v6" fill="none" stroke="${M}" stroke-width="4"/>
    <circle cx="50" cy="56" r="14" fill="${A}" opacity=".9"/>
    <circle cx="45" cy="53" r="2.4" fill="${D}"/><circle cx="55" cy="53" r="2.4" fill="${D}"/>
    <path d="M44 63 h12" stroke="${D}" stroke-width="2" stroke-linecap="round"/>`,
  backpack: () => `
    <rect x="24" y="26" width="52" height="60" rx="14" fill="${M}" ${st(2)}/>
    <path d="M36 28 v-4 a14 14 0 0 1 28 0 v4" fill="none" stroke="${M}" stroke-width="4"/>
    <rect x="32" y="58" width="36" height="22" rx="6" fill="${D}" opacity=".45"/>
    <path d="M50 34 l10 18 h-20 z" fill="${A}"/>
    <path d="M50 40 l6 10 h-12 z" fill="${L}" opacity=".5"/>
    <rect x="44" y="66" width="12" height="4" rx="2" fill="${A}"/>`,
  ring: () => `
    <circle cx="50" cy="58" r="26" fill="none" stroke="${A}" stroke-width="9"/>
    <circle cx="50" cy="58" r="26" fill="none" stroke="${L}" stroke-opacity=".45" stroke-width="2"/>
    <path d="M50 22 l7 12 h-14 z" fill="${A}"/>
    <path d="M50 16 l9 10 l-9 10 l-9 -10 z" fill="${L}" opacity=".85" ${st(1.2)}/>
    <path d="M32 50 q18 -12 36 0" fill="none" stroke="${L}" stroke-opacity=".35" stroke-width="2"/>`,
  shield: () => `
    <path d="M50 10 c14 8 28 10 30 10 c0 34 -8 56 -30 70 c-22 -14 -30 -36 -30 -70 c2 0 16 -2 30 -10 z" fill="${A}" ${st(2.4)}/>
    <circle cx="50" cy="50" r="22" fill="none" stroke="${L}" stroke-width="5" opacity=".85"/>
    <circle cx="50" cy="50" r="12" fill="${L}" opacity=".2"/>
    <path d="M50 38 l3.6 7.6 l8.4 1.2 l-6 6 l1.4 8.4 l-7.4 -4 l-7.4 4 l1.4 -8.4 l-6 -6 l8.4 -1.2 z" fill="${L}" opacity=".9"/>`,
  cards: () => `
    <rect x="18" y="30" width="36" height="52" rx="4" fill="${L}" opacity=".85" transform="rotate(-12 36 56)" ${st(1.4)}/>
    <rect x="32" y="24" width="36" height="52" rx="4" fill="${M}" transform="rotate(-2 50 50)" ${st(1.6)}/>
    <rect x="46" y="28" width="36" height="52" rx="4" fill="${A}" transform="rotate(10 64 54)" ${st(1.6)}/>
    <path d="M64 44 l6 10 l-6 10 l-6 -10 z" fill="${L}" opacity=".85" transform="rotate(10 64 54)"/>
    <circle cx="46" cy="50" r="6" fill="${A}" opacity=".7" transform="rotate(-2 50 50)"/>`,
  shell: () => `
    <path d="M50 84 c-24 0 -34 -18 -34 -34 c0 -18 14 -34 34 -34 c20 0 34 16 34 34 c0 16 -10 34 -34 34 z" fill="${A}" ${st(2)}/>
    <path d="M50 16 v68 M50 16 c-12 20 -18 46 -14 68 M50 16 c12 20 18 46 14 68 M50 16 c-22 16 -30 44 -26 62 M50 16 c22 16 30 44 26 62" fill="none" stroke="${L}" stroke-opacity=".45" stroke-width="1.8"/>
    <circle cx="50" cy="18" r="5" fill="${L}" opacity=".7"/>`,
  lamp: () => `
    <path d="M20 62 q10 -26 34 -26 q18 0 24 10 l14 -4 l-8 12 l8 12 l-14 -4 q-6 10 -24 10 q-24 0 -34 -10 z" fill="${A}" ${st(2.4)}/>
    <path d="M16 64 h40 a4 4 0 0 1 0 8 h-40 a4 4 0 0 1 0 -8 z" fill="${A}" ${st(1.6)}/>
    <path d="M30 46 q16 -8 30 -2" fill="none" stroke="${L}" stroke-opacity=".5" stroke-width="2.4"/>
    <path d="M54 36 q4 -12 -4 -18" fill="none" stroke="${L}" stroke-opacity=".35" stroke-width="2.4"/>
    <circle cx="46" cy="14" r="3" fill="${L}" opacity=".5"/>`,
  ears: () => `
    <circle cx="26" cy="26" r="16" fill="${M}" ${st(2)}/>
    <circle cx="74" cy="26" r="16" fill="${M}" ${st(2)}/>
    <path d="M18 62 a32 24 0 0 1 64 0 v8 a6 6 0 0 1 -6 6 h-52 a6 6 0 0 1 -6 -6 z" fill="${M}" ${st(2)}/>
    <path d="M18 66 h64" stroke="${A}" stroke-width="5"/>
    <circle cx="26" cy="26" r="9" fill="${A}" opacity=".35"/><circle cx="74" cy="26" r="9" fill="${A}" opacity=".35"/>`,
  smurfhat: () => `
    <path d="M22 76 q4 -46 30 -60 q18 -10 22 4 q4 12 -12 18 q10 14 8 38 z" fill="${M}" ${st(2.4)}/>
    <path d="M18 74 h64 a6 6 0 0 1 0 12 h-64 a6 6 0 0 1 0 -12 z" fill="${M}" ${st(2)}/>
    <path d="M30 70 q22 -34 40 -44" fill="none" stroke="${L}" stroke-opacity=".3" stroke-width="2.4"/>
    <circle cx="72" cy="20" r="4" fill="${A}" opacity=".6"/>`,
  headband: () => `
    <path d="M8 44 q42 -14 84 0 v14 q-42 -14 -84 0 z" fill="${A}" ${st(2)}/>
    <rect x="34" y="40" width="32" height="20" rx="3" fill="${M}" ${st(1.6)}/>
    <path d="M50 44 l4 6 l-4 6 l-4 -6 z" fill="${D}" opacity=".7"/>
    <path d="M40 50 h-2 M62 50 h-2" stroke="${D}" stroke-width="2"/>
    <path d="M8 58 l-4 18 l10 -8 M92 58 l4 18 l-10 -8" fill="${A}" opacity=".8"/>`,
  alphabet: () => `
    <path d="M8 30 q14 14 28 0 t28 0 t28 0" fill="none" stroke="${M}" stroke-width="2.4"/>
    <circle cx="18" cy="34" r="5" fill="${A}"/><circle cx="36" cy="30" r="5" fill="${L}" opacity=".8"/>
    <circle cx="54" cy="34" r="5" fill="${A}"/><circle cx="72" cy="30" r="5" fill="${L}" opacity=".8"/>
    <circle cx="88" cy="34" r="5" fill="${A}"/>
    <text x="20" y="66" font-family="Georgia, serif" font-size="22" fill="${L}" opacity=".85">A</text>
    <text x="42" y="70" font-family="Georgia, serif" font-size="22" fill="${A}">B</text>
    <text x="64" y="64" font-family="Georgia, serif" font-size="22" fill="${L}" opacity=".85">C</text>`,
  flask: () => `
    <path d="M42 14 h16 v24 l18 34 a10 10 0 0 1 -9 15 h-34 a10 10 0 0 1 -9 -15 l18 -34 z" fill="none" stroke="${L}" stroke-width="3" stroke-opacity=".85"/>
    <path d="M32 62 h36 l6 10 a10 10 0 0 1 -9 15 h-30 a10 10 0 0 1 -9 -15 z" fill="${A}" opacity=".8"/>
    <rect x="38" y="10" width="24" height="6" rx="3" fill="${M}"/>
    <circle cx="44" cy="74" r="2.6" fill="${L}" opacity=".6"/><circle cx="56" cy="70" r="2" fill="${L}" opacity=".45"/>`,
};

/* ── ფონის დამხმარეები ──────────────────────────────────── */
function stars(rand, n, w = 800, h = 800) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = Math.round(rand() * w), y = Math.round(rand() * h);
    const r = (rand() * 1.8 + 0.4).toFixed(2), o = (rand() * 0.55 + 0.15).toFixed(2);
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${o}"/>`;
  }
  return s;
}

function dust(rand, n) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = Math.round(rand() * 800), y = Math.round(rand() * 800);
    const r = (rand() * 5 + 2).toFixed(1), o = (rand() * 0.14 + 0.04).toFixed(2);
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#gAccent)" opacity="${o}"/>`;
  }
  return s;
}

/** XML-ისთვის უსაფრთხო ტექსტი (ბრჭყალები აფუჭებდა aria-label ატრიბუტს) */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const cl = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const r = cl(((n >> 16) & 255) * (1 + amt)), g = cl(((n >> 8) & 255) * (1 + amt)), b = cl((n & 255) * (1 + amt));
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

/* ── ერთი სურათის აგება ─────────────────────────────────── */
function buildSvg(product, variant) {
  const uni = universes.find((u) => u.slug === product.universeSlug) || universes.at(-1);
  const rand = rng(product.id + '-' + variant);
  const main = uni.color;
  const deep = uni.accent;
  const glyph = (glyphs[product.art] || glyphs.stone)();

  const rot = variant === 2 ? -8 : variant === 3 ? 7 : 0;
  const scale = variant === 3 ? 4.4 : variant === 2 ? 5.0 : 5.4;
  const ringOpacity = variant === 1 ? 0.5 : 0.32;
  const cx = 400, cy = variant === 3 ? 380 : 400;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img" aria-label="${esc(product.name)}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="72%">
      <stop offset="0%" stop-color="${shade(deep, 0.9)}"/>
      <stop offset="45%" stop-color="${shade(deep, 0.15)}"/>
      <stop offset="100%" stop-color="#07040e"/>
    </radialGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${main}" stop-opacity=".55"/>
      <stop offset="55%" stop-color="${main}" stop-opacity=".14"/>
      <stop offset="100%" stop-color="${main}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gMetal" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#eef0ff"/>
      <stop offset="40%" stop-color="#b9bede"/>
      <stop offset="100%" stop-color="#6b6f95"/>
    </linearGradient>
    <linearGradient id="gAccent" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="${shade(main, 0.4)}"/>
      <stop offset="55%" stop-color="${main}"/>
      <stop offset="100%" stop-color="${shade(main, -0.5)}"/>
    </linearGradient>
    <linearGradient id="vig" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity=".45"/>
      <stop offset="40%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity=".6"/>
    </linearGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>
    <filter id="glow" x="-35%" y="-35%" width="170%" height="170%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000" flood-opacity=".55"/>
      <feDropShadow dx="0" dy="0" stdDeviation="9" flood-color="${main}" flood-opacity=".55"/>
    </filter>
  </defs>

  <rect width="800" height="800" fill="url(#bg)"/>
  <g>${stars(rand, 90)}</g>
  <g>${dust(rand, 14)}</g>
  <circle cx="${cx}" cy="${cy}" r="250" fill="url(#halo)"/>
  <ellipse cx="${cx}" cy="${cy + 210}" rx="200" ry="34" fill="#000" opacity=".45" filter="url(#soft)"/>

  <g opacity="${ringOpacity}" transform="rotate(${variant * 24} ${cx} ${cy})">
    <circle cx="${cx}" cy="${cy}" r="248" fill="none" stroke="${main}" stroke-width="1.6" stroke-dasharray="2 14"/>
    <circle cx="${cx}" cy="${cy}" r="212" fill="none" stroke="${main}" stroke-width="1" opacity=".7"/>
    <circle cx="${cx}" cy="${cy}" r="284" fill="none" stroke="${main}" stroke-width="1" stroke-dasharray="60 26" opacity=".45"/>
  </g>

  <g filter="url(#glow)" transform="translate(${cx} ${cy}) rotate(${rot}) scale(${scale}) translate(-50 -50)">
    ${glyph}
  </g>

  <rect width="800" height="800" fill="url(#vig)"/>
</svg>
`;
}

/* ── გაშვება ────────────────────────────────────────────── */
fs.mkdirSync(OUT, { recursive: true });
let count = 0;
for (const p of products) {
  for (let v = 1; v <= 3; v++) {
    fs.writeFileSync(path.join(OUT, `${p.id}-${v}.svg`), buildSvg(p, v), 'utf8');
    count++;
  }
}

/* ── სამყაროების ბანერები ───────────────────────────────── */
function universeBanner(u) {
  const rand = rng(u.slug + 'banner');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500" role="img" aria-label="${esc(u.name)}">
  <defs>
    <radialGradient id="b" cx="30%" cy="30%" r="90%">
      <stop offset="0%" stop-color="${shade(u.accent, 1.1)}"/>
      <stop offset="55%" stop-color="${shade(u.accent, 0.1)}"/>
      <stop offset="100%" stop-color="#07040e"/>
    </radialGradient>
    <linearGradient id="s" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${u.color}" stop-opacity=".5"/>
      <stop offset="100%" stop-color="${u.color}" stop-opacity="0"/>
    </linearGradient>
    <filter id="bl"><feGaussianBlur stdDeviation="40"/></filter>
  </defs>
  <rect width="800" height="500" fill="url(#b)"/>
  ${stars(rand, 70, 800, 500)}
  <circle cx="620" cy="120" r="150" fill="${u.color}" opacity=".22" filter="url(#bl)"/>
  <circle cx="180" cy="400" r="170" fill="${u.color}" opacity=".16" filter="url(#bl)"/>
  <path d="M0 500 L800 500 L800 300 Q600 380 400 320 T0 360 Z" fill="url(#s)"/>
  <path d="M0 500 L800 500 L800 380 Q560 440 340 400 T0 430 Z" fill="#07040e" opacity=".75"/>
</svg>
`;
}
const uniDir = path.join(ROOT, 'public', 'universes');
fs.mkdirSync(uniDir, { recursive: true });
for (const u of universes) fs.writeFileSync(path.join(uniDir, `${u.slug}.svg`), universeBanner(u), 'utf8');

console.log(`✓ შეიქმნა ${count} პროდუქტის სურათი და ${universes.length} სამყაროს ბანერი.`);
