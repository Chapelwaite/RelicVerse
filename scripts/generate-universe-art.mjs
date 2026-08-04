/**
 * RelicVerse — სამყაროების ვიზუალური იდენტობა
 * ────────────────────────────────────────────────────────────
 * თითოეული სამყაროსთვის ქმნის ლოკალურ ასეთებს:
 *   client/src/assets/universes/<slug>/emblem.svg  — უნიკალური ემბლემა
 *   client/src/assets/universes/<slug>/bg.svg      — თემატური ატმოსფერული ფონი
 * პლუს საერთო themes.json ფერების პალიტრებით.
 *
 * გაშვება:  node scripts/generate-universe-art.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'src', 'assets', 'universes');

/* ── პალიტრები (spec-ის მიხედვით) ───────────────────────── */
const THEMES = {
  'harry-potter': { primary: '#c9a227', secondary: '#5c1a2e', accent: '#e9c46a', glow: 'rgba(233,196,106,.5)', surface: '#241016', font: 'serif' },
  'fight-club': { primary: '#e0483a', secondary: '#1a0d0d', accent: '#f0abfc', glow: 'rgba(224,72,58,.45)', surface: '#1c0f10', font: 'grunge' },
  pirates: { primary: '#c8963c', secondary: '#0e2f33', accent: '#2fb6a8', glow: 'rgba(200,150,60,.45)', surface: '#102a2c', font: 'serif' },
  'death-note': { primary: '#d33a3a', secondary: '#111013', accent: '#f5f3ff', glow: 'rgba(211,58,58,.4)', surface: '#141014', font: 'gothic' },
  alice: { primary: '#8b5cf6', secondary: '#153447', accent: '#63d1c0', glow: 'rgba(139,92,246,.45)', surface: '#1d1633', font: 'serif' },
  'kill-bill': { primary: '#f2c230', secondary: '#171512', accent: '#e0483a', glow: 'rgba(242,194,48,.45)', surface: '#1b180f', font: 'bold' },
  'the-mentalist': { primary: '#b3452f', secondary: '#12100e', accent: '#e8d5b5', glow: 'rgba(179,69,47,.4)', surface: '#171310', font: 'serif' },
  ghibli: { primary: '#7fc98a', secondary: '#12303c', accent: '#f5e6b8', glow: 'rgba(127,201,138,.4)', surface: '#132b23', font: 'soft' },
  marvel: { primary: '#e23b42', secondary: '#161a3a', accent: '#cfd3e6', glow: 'rgba(226,59,66,.45)', surface: '#1c1220', font: 'bold' },
  dc: { primary: '#3d84e8', secondary: '#0b1220', accent: '#cfd8ea', glow: 'rgba(61,132,232,.45)', surface: '#0e1626', font: 'bold' },
  disney: { primary: '#a58bf0', secondary: '#141b45', accent: '#e9c46a', glow: 'rgba(165,139,240,.5)', surface: '#191742', font: 'serif' },
  'horror-classics': { primary: '#b0303a', secondary: '#0d0a0c', accent: '#d8d2c8', glow: 'rgba(176,48,58,.45)', surface: '#160c0f', font: 'gothic' },
  smurfs: { primary: '#49aeee', secondary: '#123a2a', accent: '#f2f6ff', glow: 'rgba(73,174,238,.5)', surface: '#12283a', font: 'soft' },
  'miss-peregrine': { primary: '#5f8f8b', secondary: '#1c211c', accent: '#c8a959', glow: 'rgba(95,143,139,.4)', surface: '#18211f', font: 'serif' },
  lotr: { primary: '#d8b45c', secondary: '#171204', accent: '#8fa17a', glow: 'rgba(216,180,92,.45)', surface: '#1c160c', font: 'serif' },
  anime: { primary: '#f07ab0', secondary: '#221030', accent: '#63d1c0', glow: 'rgba(240,122,176,.45)', surface: '#241326', font: 'bold' },
  other: { primary: '#9aa4c8', secondary: '#141a2c', accent: '#f0abfc', glow: 'rgba(154,164,200,.4)', surface: '#151a2c', font: 'soft' },
};

/* ── ემბლემები — 120×120, stroke-სტილი ──────────────────── */
const E = (t, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
<defs>
  <linearGradient id="eg" x1="0" y1="0" x2=".4" y2="1">
    <stop offset="0%" stop-color="${t.accent}"/><stop offset="100%" stop-color="${t.primary}"/>
  </linearGradient>
  <filter id="es" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="${t.primary}" flood-opacity=".7"/></filter>
</defs>
<g filter="url(#es)">${inner}</g></svg>`;

const EMBLEMS = {
  /* ჯოხი + ელვა + ვარსკვლავები */
  'harry-potter': (t) => E(t, `
    <circle cx="60" cy="60" r="47" stroke="${t.primary}" stroke-opacity=".55" stroke-width="1.6" stroke-dasharray="3 9"/>
    <path d="M32 88 L82 32" stroke="url(#eg)" stroke-width="4.6" stroke-linecap="round"/>
    <path d="M32 88 L46 72" stroke="${t.secondary}" stroke-width="7" stroke-linecap="round"/>
    <path d="M84 26 l-7 12 h9 l-8 14" stroke="${t.accent}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M40 40 l2.4 5 5 2.4 -5 2.4 -2.4 5 -2.4 -5 -5 -2.4 5 -2.4 z" fill="${t.accent}"/>
    <circle cx="90" cy="66" r="2.4" fill="${t.accent}"/><circle cx="70" cy="88" r="1.8" fill="${t.primary}"/>`),
  /* საპონი grunge წრეში */
  'fight-club': (t) => E(t, `
    <circle cx="60" cy="60" r="46" stroke="${t.primary}" stroke-width="2.4" stroke-dasharray="52 9 18 7"/>
    <rect x="30" y="42" width="60" height="36" rx="13" fill="url(#eg)" fill-opacity=".9"/>
    <rect x="30" y="42" width="60" height="14" rx="7" fill="#fff" opacity=".2"/>
    <path d="M40 60 h40 M44 68 h26" stroke="${t.secondary}" stroke-width="3" stroke-linecap="round" opacity=".8"/>
    <path d="M26 32 l8 6 M94 88 l-9 -5" stroke="${t.primary}" stroke-width="2" stroke-linecap="round" opacity=".7"/>`),
  /* კომპასი + საჭის რქები */
  pirates: (t) => E(t, `
    <circle cx="60" cy="60" r="44" stroke="url(#eg)" stroke-width="3"/>
    <circle cx="60" cy="60" r="33" stroke="${t.accent}" stroke-opacity=".5" stroke-width="1.4" stroke-dasharray="4 8"/>
    <g stroke="${t.primary}" stroke-width="3.4" stroke-linecap="round">
      <path d="M60 8 v12 M60 100 v12 M8 60 h12 M100 60 h12"/>
      <path d="M24 24 l8 8 M88 88 l8 8 M96 24 l-8 8 M32 88 l-8 8"/>
    </g>
    <path d="M60 34 L69 60 L60 86 L51 60 Z" fill="url(#eg)"/>
    <path d="M60 34 L69 60 L60 60 Z" fill="#fff" opacity=".75"/>
    <circle cx="60" cy="60" r="4" fill="${t.accent}"/>`),
  /* ბუმბული + რვეულის გვერდი + ვაშლი */
  'death-note': (t) => E(t, `
    <path d="M36 26 h40 l8 8 v60 h-48 z" stroke="${t.accent}" stroke-opacity=".75" stroke-width="2.6" fill="${t.secondary}"/>
    <path d="M76 26 v8 h8" stroke="${t.accent}" stroke-opacity=".75" stroke-width="2.6"/>
    <path d="M44 44 h32 M44 54 h32 M44 64 h20" stroke="${t.accent}" stroke-opacity=".4" stroke-width="2"/>
    <path d="M84 78 c-8 -4 -16 2 -15 10 c1 8 8 14 14 13 c6 -1 11 -8 11 -14 c0 -6 -5 -11 -10 -9 z" fill="${t.primary}"/>
    <path d="M84 78 q1 -5 -2 -7" stroke="#5c3a1a" stroke-width="2" stroke-linecap="round"/>
    <path d="M30 86 q14 6 26 -2" stroke="url(#eg)" stroke-width="3" stroke-linecap="round"/>`),
  /* გასაღების ხვრელი + საათის ისრები + კარტის ნიშნები */
  alice: (t) => E(t, `
    <circle cx="60" cy="60" r="45" stroke="${t.primary}" stroke-opacity=".6" stroke-width="2" stroke-dasharray="20 7 4 7"/>
    <path d="M60 32 a13 13 0 0 1 8 23 l6 25 h-28 l6 -25 a13 13 0 0 1 8 -23 z" fill="url(#eg)" fill-opacity=".9"/>
    <path d="M60 46 L60 36 M60 46 L68 42" stroke="${t.secondary}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M28 40 l3.4 6.8 L38 48 l-6.6 1.6 L28 56 l-3.4 -6.4 L18 48 l6.6 -1.2 z" fill="${t.accent}" opacity=".9"/>
    <path d="M92 74 c-4 -5 -12 -2 -12 4 c0 6 12 10 12 10 c0 0 12 -4 12 -10 c0 -6 -8 -9 -12 -4 z" fill="${t.primary}" opacity=".85" transform="scale(.62) translate(56 44)"/>`),
  /* კატანა + კვალი */
  'kill-bill': (t) => E(t, `
    <circle cx="60" cy="60" r="46" stroke="${t.primary}" stroke-width="2.6"/>
    <path d="M26 90 L82 30 q5 -5 8 -2 q2 3 -3 8 L32 96 Z" fill="url(#eg)"/>
    <path d="M30 86 L82 32" stroke="#fff" stroke-opacity=".7" stroke-width="1.4"/>
    <rect x="22" y="84" width="15" height="6" rx="3" transform="rotate(-45 29 87)" fill="${t.accent}"/>
    <path d="M88 22 q6 10 -2 20" stroke="${t.accent}" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 5"/>`),
  /* ჭიქა + ორთქლი-ღიმილი */
  'the-mentalist': (t) => E(t, `
    <path d="M34 58 h44 l-5 26 a11 11 0 0 1 -11 9 h-12 a11 11 0 0 1 -11 -9 z" fill="${t.secondary}" stroke="${t.accent}" stroke-width="2.6"/>
    <path d="M78 64 a11 11 0 0 1 0 18" stroke="${t.accent}" stroke-width="4" fill="none"/>
    <path d="M34 62 h44" stroke="${t.primary}" stroke-width="2.6"/>
    <path d="M46 46 q4 -8 0 -14 M60 48 q5 -9 0 -18 M72 46 q4 -7 0 -13" stroke="${t.accent}" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    <path d="M44 30 q16 12 32 0" stroke="${t.primary}" stroke-width="3" stroke-linecap="round" fill="none"/>`),
  /* ტყის სული + ფოთოლი + ღრუბელი */
  ghibli: (t) => E(t, `
    <path d="M28 44 q14 -14 34 -8" stroke="${t.accent}" stroke-opacity=".7" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    <ellipse cx="60" cy="66" rx="24" ry="27" fill="${t.secondary}" stroke="url(#eg)" stroke-width="2.6"/>
    <path d="M44 46 l-4 -12 l11 8 z M76 46 l4 -12 l-11 8 z" fill="url(#eg)"/>
    <circle cx="52" cy="60" r="3" fill="${t.accent}"/><circle cx="68" cy="60" r="3" fill="${t.accent}"/>
    <path d="M48 74 h5 M60 76 h5 M70 72 h5" stroke="${t.primary}" stroke-width="2" stroke-linecap="round"/>
    <path d="M84 30 q10 -2 12 6 q-10 4 -12 -6 z" fill="${t.primary}"/>
    <circle cx="30" cy="82" r="2" fill="${t.accent}"/><circle cx="92" cy="58" r="1.8" fill="${t.accent}" opacity=".8"/>`),
  /* გმირული ვარსკვლავი ენერგიის რგოლში + პანელის ხაზები */
  marvel: (t) => E(t, `
    <path d="M14 34 h38 M14 44 h22" stroke="${t.accent}" stroke-opacity=".45" stroke-width="3"/>
    <circle cx="64" cy="62" r="38" stroke="url(#eg)" stroke-width="3.4"/>
    <circle cx="64" cy="62" r="38" stroke="${t.primary}" stroke-opacity=".35" stroke-width="9" stroke-dasharray="30 62"/>
    <path d="M64 36 l7.6 15.8 17.4 2.3 -12.7 12 3.2 17.2 -15.5 -8.4 -15.5 8.4 3.2 -17.2 -12.7 -12 17.4 -2.3 z" fill="url(#eg)"/>
    <path d="M100 92 l-10 4" stroke="${t.accent}" stroke-width="3" stroke-linecap="round"/>`),
  /* გეომეტრიული ფარი + ელვა + სკაილაინი */
  dc: (t) => E(t, `
    <path d="M60 16 l38 12 v26 c0 22 -16 38 -38 50 c-22 -12 -38 -28 -38 -50 v-26 z" stroke="url(#eg)" stroke-width="3.2" fill="${t.secondary}"/>
    <path d="M66 36 l-14 24 h11 l-9 24 l24 -30 h-12 l10 -18 z" fill="url(#eg)"/>
    <path d="M32 96 h8 v-6 h6 v6 h8 M68 98 h6 v-8 h6 v8 h8" stroke="${t.accent}" stroke-opacity=".5" stroke-width="2.4"/>`),
  /* ციხესიმაგრე + ნახევარმთვარე + ვარსკვლავი */
  disney: (t) => E(t, `
    <path d="M78 30 a17 17 0 1 0 10 26 a13 13 0 0 1 -10 -26 z" fill="${t.accent}" opacity=".9"/>
    <path d="M30 92 v-22 h8 v-12 l6 -8 6 8 v12 h10 v-18 l7 -9 7 9 v18 h8 v22 z" stroke="url(#eg)" stroke-width="2.8" fill="${t.secondary}"/>
    <path d="M44 92 v-10 h8 v10 M68 92 v-12 h8 v12" stroke="${t.primary}" stroke-width="2" opacity=".8"/>
    <path d="M32 34 l2.6 5.4 5.4 2.6 -5.4 2.6 -2.6 5.4 -2.6 -5.4 -5.4 -2.6 5.4 -2.6 z" fill="${t.primary}"/>`),
  /* ნიღაბი + წვეთი */
  'horror-classics': (t) => E(t, `
    <circle cx="60" cy="60" r="45" stroke="${t.primary}" stroke-opacity=".55" stroke-width="2" stroke-dasharray="2 8"/>
    <path d="M60 26 c-15 0 -24 11 -24 27 c0 18 10 36 24 41 c14 -5 24 -23 24 -41 c0 -16 -9 -27 -24 -27 z" fill="${t.secondary}" stroke="${t.accent}" stroke-width="2.6"/>
    <ellipse cx="51" cy="56" rx="5.4" ry="7.4" fill="${t.primary}"/>
    <ellipse cx="69" cy="56" rx="5.4" ry="7.4" fill="${t.primary}"/>
    <path d="M60 66 l-3.4 8 h6.8 z" fill="${t.primary}" opacity=".85"/>
    <path d="M52 82 q8 5 16 0" stroke="${t.primary}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M84 34 q3 7 0 12" stroke="${t.primary}" stroke-width="2.4" stroke-linecap="round"/>`),
  /* ფრიგიული ქუდი + სოკოს სახლი */
  smurfs: (t) => E(t, `
    <path d="M30 62 q3 -26 22 -34 q13 -6 16 2 q2 7 -8 11 q8 8 7 21 z" fill="${t.accent}" stroke="${t.primary}" stroke-width="2.6"/>
    <path d="M26 62 h44 a4 4 0 0 1 0 9 h-44 a4 4 0 0 1 0 -9 z" fill="${t.accent}" stroke="${t.primary}" stroke-width="2"/>
    <path d="M64 94 a14 14 0 0 1 28 0 z" fill="${t.primary}"/>
    <path d="M70 94 v-12 a8 8 0 0 1 16 0 v12" fill="none"/>
    <path d="M62 80 q16 -12 32 0 q-16 -4 -32 0 z" fill="url(#eg)"/>
    <circle cx="86" cy="72" r="2" fill="#fff"/><circle cx="74" cy="74" r="1.6" fill="#fff"/>
    <rect x="74" y="88" width="8" height="6" rx="2" fill="${t.secondary}"/>`),
  /* ჯიბის საათი + ფრთა + მარყუჟი */
  'miss-peregrine': (t) => E(t, `
    <circle cx="56" cy="64" r="30" stroke="url(#eg)" stroke-width="3"/>
    <circle cx="56" cy="64" r="23" stroke="${t.accent}" stroke-opacity=".4" stroke-width="1.4"/>
    <rect x="51" y="26" width="10" height="9" rx="3" fill="${t.primary}"/>
    <path d="M56 64 V48 M56 64 l11 7" stroke="${t.accent}" stroke-width="3" stroke-linecap="round"/>
    <path d="M78 34 q18 -10 26 2 q-8 -2 -12 2 q8 2 10 8 q-9 -1 -13 3 q-6 -8 -11 -15 z" fill="url(#eg)" opacity=".9"/>
    <path d="M92 84 a10 10 0 1 1 2 -14 l6 -6" stroke="${t.accent}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`),
  /* ბეჭედი + მთა */
  lotr: (t) => E(t, `
    <circle cx="60" cy="56" r="26" stroke="url(#eg)" stroke-width="7"/>
    <circle cx="60" cy="56" r="26" stroke="#fff" stroke-opacity=".35" stroke-width="1.6"/>
    <path d="M38 46 q22 -14 44 0 M40 66 q20 12 40 0" stroke="${t.accent}" stroke-opacity=".55" stroke-width="1.6" stroke-dasharray="5 4" fill="none"/>
    <path d="M22 96 l16 -24 8 10 12 -20 14 22 8 -12 12 24 z" fill="${t.secondary}" stroke="${t.primary}" stroke-width="2.4" stroke-linejoin="round"/>
    <circle cx="60" cy="30" r="2.4" fill="${t.accent}"/>`),
  /* ტორი-კარიბჭე + ვარსკვლავური აფეთქება */
  anime: (t) => E(t, `
    <path d="M24 42 q36 -10 72 0 M30 42 v46 M90 42 v46 M26 56 h68" stroke="url(#eg)" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M20 38 q40 -12 80 0" stroke="${t.primary}" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M60 62 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4 z" fill="${t.accent}"/>
    <circle cx="42" cy="74" r="2" fill="${t.accent}" opacity=".8"/><circle cx="80" cy="70" r="1.8" fill="${t.accent}" opacity=".7"/>`),
  /* კინოფირი + ვარსკვლავი */
  other: (t) => E(t, `
    <circle cx="60" cy="60" r="36" stroke="url(#eg)" stroke-width="3"/>
    <circle cx="60" cy="60" r="9" fill="${t.secondary}" stroke="${t.accent}" stroke-width="2"/>
    <g fill="${t.secondary}" stroke="${t.accent}" stroke-width="1.8">
      <circle cx="60" cy="34" r="6"/><circle cx="86" cy="60" r="6"/><circle cx="60" cy="86" r="6"/><circle cx="34" cy="60" r="6"/>
    </g>
    <path d="M96 88 l2 4.4 4.4 2 -4.4 2 -2 4.4 -2 -4.4 -4.4 -2 4.4 -2 z" fill="${t.primary}"/>`),
};

/* ── ფონები — 640×400, თემატური პატერნები ───────────────── */
function rng(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6d2b79f5; let x = h; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
const stars = (r, n, o = 0.7) => Array.from({ length: n }, () =>
  `<circle cx="${(r() * 640) | 0}" cy="${(r() * 400) | 0}" r="${(r() * 1.5 + 0.5).toFixed(1)}" fill="#fff" opacity="${(r() * o + 0.1).toFixed(2)}"/>`).join('');

const BG = (slug, t, inner) => {
  const r = rng(slug);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice">
<defs>
  <radialGradient id="b" cx="30%" cy="24%" r="95%">
    <stop offset="0%" stop-color="${t.surface}"/><stop offset="60%" stop-color="${t.secondary}"/><stop offset="100%" stop-color="#07040e"/>
  </radialGradient>
  <linearGradient id="p" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${t.primary}" stop-opacity=".55"/><stop offset="100%" stop-color="${t.primary}" stop-opacity="0"/>
  </linearGradient>
  <filter id="f"><feGaussianBlur stdDeviation="26"/></filter>
</defs>
<rect width="640" height="400" fill="url(#b)"/>
<circle cx="520" cy="70" r="130" fill="${t.primary}" opacity=".16" filter="url(#f)"/>
<circle cx="90" cy="330" r="150" fill="${t.accent}" opacity=".1" filter="url(#f)"/>
${stars(r, 26, 0.5)}
${inner(r)}
<rect width="640" height="400" fill="url(#p)" opacity=".12"/>
</svg>`;
};

const BGS = {
  'harry-potter': (t) => BG('harry-potter', t, (r) => `
    ${Array.from({ length: 9 }, () => { const x = 40 + r() * 560, y = 40 + r() * 200, h = 16 + r() * 22; return `<g opacity="${(0.35 + r() * 0.4).toFixed(2)}"><rect x="${x}" y="${y}" width="5" height="${h}" rx="2" fill="#e8d9a0"/><ellipse cx="${x + 2.5}" cy="${y - 4}" rx="3.4" ry="5" fill="#ffd27a"/></g>`; }).join('')}
    <path d="M0 330 q160 -40 320 0 t320 0 v70 h-640 z" fill="${t.secondary}" opacity=".8"/>
    <path d="M60 250 q60 -18 120 6 M420 240 q70 -20 150 4" stroke="${t.primary}" stroke-opacity=".28" stroke-width="1.6" fill="none" stroke-dasharray="6 6"/>`),
  'fight-club': (t) => BG('fight-club', t, (r) => `
    ${Array.from({ length: 14 }, () => `<rect x="${r() * 640}" y="${r() * 400}" width="${30 + r() * 90}" height="1.6" fill="#fff" opacity="${(r() * 0.08 + 0.02).toFixed(2)}" transform="rotate(${(r() * 40 - 20) | 0} 320 200)"/>`).join('')}
    <rect x="0" y="0" width="640" height="400" fill="${t.primary}" opacity=".06"/>
    <circle cx="560" cy="320" r="90" stroke="${t.primary}" stroke-opacity=".4" stroke-width="2.4" stroke-dasharray="40 12 8 12" fill="none"/>
    <rect x="470" y="286" width="130" height="64" rx="22" fill="${t.primary}" opacity=".5"/>
    <rect x="470" y="286" width="130" height="26" rx="13" fill="#fff" opacity=".14"/>`),
  pirates: (t) => BG('pirates', t, (r) => `
    <path d="M40 90 q120 -40 240 10 t260 -10" stroke="${t.primary}" stroke-opacity=".4" stroke-width="1.8" fill="none" stroke-dasharray="8 7"/>
    <circle cx="160" cy="200" r="70" stroke="${t.accent}" stroke-opacity=".3" stroke-width="1.4" fill="none"/>
    <circle cx="160" cy="200" r="52" stroke="${t.accent}" stroke-opacity=".2" stroke-width="1" fill="none" stroke-dasharray="3 7"/>
    <path d="M160 140 L167 200 L160 260 L153 200 Z" fill="${t.primary}" opacity=".6"/>
    <path d="M0 320 q160 -34 320 -6 t320 -14 v100 h-640 z" fill="#071b1d" opacity=".85"/>
    <path d="M0 348 q180 -22 360 2 t280 -6" stroke="${t.accent}" stroke-opacity=".3" stroke-width="2" fill="none"/>
    <path d="M470 120 l60 -14 M470 120 l8 34" stroke="${t.primary}" stroke-opacity=".5" stroke-width="2"/>`),
  'death-note': (t) => BG('death-note', t, (r) => `
    <rect x="70" y="60" width="220" height="290" rx="6" fill="#0c0b0e" stroke="#f5f3ff" stroke-opacity=".2" stroke-width="1.6" transform="rotate(-7 180 205)"/>
    ${Array.from({ length: 8 }, (_, i) => `<rect x="100" y="${104 + i * 30}" width="${150 - (i % 3) * 30}" height="3" fill="#f5f3ff" opacity=".14" transform="rotate(-7 180 205)"/>`).join('')}
    <circle cx="500" cy="270" r="42" fill="${t.primary}" opacity=".8"/>
    <path d="M500 232 q3 -12 -6 -16" stroke="#3a2417" stroke-width="4" stroke-linecap="round" fill="none"/>
    <circle cx="486" cy="258" r="9" fill="#fff" opacity=".2"/>`),
  alice: (t) => BG('alice', t, (r) => `
    ${Array.from({ length: 6 }, (_, i) => { const x = 60 + i * 100, y = 60 + (i % 2) * 34; return `<g transform="rotate(${-16 + i * 7} ${x} ${y})" opacity=".5"><rect x="${x}" y="${y}" width="34" height="46" rx="5" fill="#f4efff" opacity=".9"/><rect x="${x + 4}" y="${y + 5}" width="26" height="36" rx="3" fill="none" stroke="${t.primary}" stroke-width="1.6"/></g>`; }).join('')}
    <g opacity=".35">${Array.from({ length: 30 }, (_, i) => { const c = i % 2 ? t.primary : '#0c0a18'; const x = (i % 10) * 66, y = 300 + ((i / 10) | 0) * 36; return `<path d="M${x} ${y} l66 6 l-4 34 l-66 -6 z" fill="${c}"/>`; }).join('')}</g>
    <circle cx="520" cy="120" r="52" stroke="${t.accent}" stroke-opacity=".5" stroke-width="2" fill="none"/>
    <path d="M520 120 L520 88 M520 120 L544 132" stroke="${t.accent}" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>`),
  'kill-bill': (t) => BG('kill-bill', t, (r) => `
    <rect x="0" y="150" width="640" height="70" fill="${t.primary}" opacity=".2"/>
    <rect x="0" y="164" width="640" height="42" fill="${t.primary}" opacity=".35"/>
    <path d="M60 340 L560 60" stroke="#f4f0e6" stroke-opacity=".5" stroke-width="2.4"/>
    <path d="M60 340 L120 300" stroke="${t.secondary}" stroke-width="7" stroke-linecap="round"/>
    ${stars(rng('kb2'), 10, 0.4)}`),
  'the-mentalist': (t) => BG('the-mentalist', t, (r) => `
    <path d="M0 310 h640 v90 h-640 z" fill="#0b0908" opacity=".9"/>
    <rect x="60" y="250" width="150" height="60" rx="4" fill="#141110"/>
    <rect x="420" y="240" width="120" height="70" rx="4" fill="#100d0c"/>
    <path d="M180 120 q40 30 0 62 q-30 26 4 48" stroke="#d9c9a8" stroke-opacity=".3" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M420 110 q60 44 120 6" stroke="${t.primary}" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/>
    <circle cx="428" cy="104" r="4" fill="${t.primary}"/><circle cx="536" cy="110" r="4" fill="${t.primary}"/>`),
  ghibli: (t) => BG('ghibli', t, (r) => `
    <ellipse cx="140" cy="90" rx="90" ry="30" fill="#eef6f0" opacity=".14"/>
    <ellipse cx="430" cy="60" rx="120" ry="34" fill="#eef6f0" opacity=".1"/>
    <path d="M0 300 q120 -70 260 -20 q140 46 380 -30 v150 h-640 z" fill="#0f3a2c" opacity=".9"/>
    <path d="M0 330 q160 -44 330 -6 t310 -20 v96 h-640 z" fill="#0a2a20" opacity=".95"/>
    ${Array.from({ length: 12 }, () => `<circle cx="${(r() * 640) | 0}" cy="${(180 + r() * 120) | 0}" r="${(r() * 2 + 1).toFixed(1)}" fill="${t.accent}" opacity="${(r() * 0.5 + 0.2).toFixed(2)}"/>`).join('')}
    <path d="M470 210 q10 -18 26 -10 M120 240 q12 -16 28 -8" stroke="${t.primary}" stroke-opacity=".6" stroke-width="2.4" fill="none" stroke-linecap="round"/>`),
  marvel: (t) => BG('marvel', t, (r) => `
    <path d="M40 40 h240 M40 60 h170 M430 350 h170 M470 330 h130" stroke="#fff" stroke-opacity=".1" stroke-width="6"/>
    <circle cx="480" cy="140" r="90" stroke="${t.primary}" stroke-opacity=".5" stroke-width="3" fill="none"/>
    <circle cx="480" cy="140" r="90" stroke="${t.accent}" stroke-opacity=".3" stroke-width="10" stroke-dasharray="60 130" fill="none"/>
    <path d="M480 92 l13 27 30 4 -22 21 6 30 -27 -15 -27 15 6 -30 -22 -21 30 -4 z" fill="${t.primary}" opacity=".75"/>
    <path d="M100 300 l120 -60" stroke="${t.primary}" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>`),
  dc: (t) => BG('dc', t, (r) => `
    ${Array.from({ length: 12 }, (_, i) => { const x = i * 56, h = 60 + r() * 130; return `<rect x="${x}" y="${400 - h}" width="40" height="${h}" fill="#0a1120" opacity=".92"/>${Array.from({ length: 5 }, () => `<rect x="${x + 5 + r() * 28}" y="${400 - h + 8 + r() * (h - 20)}" width="4" height="6" fill="#9fc1ff" opacity="${(r() * 0.5 + 0.15).toFixed(2)}"/>`).join('')}`; }).join('')}
    <path d="M300 400 L360 60 L420 400 Z" fill="#cfe0ff" opacity=".08"/>
    <ellipse cx="360" cy="66" rx="46" ry="16" fill="#cfe0ff" opacity=".16"/>
    ${Array.from({ length: 18 }, () => `<rect x="${r() * 640}" y="${r() * 300}" width="1.4" height="${12 + r() * 22}" fill="#9fc1ff" opacity="${(r() * 0.2 + 0.06).toFixed(2)}" transform="rotate(12 320 200)"/>`).join('')}`),
  disney: (t) => BG('disney', t, (r) => `
    <path d="M470 90 a26 26 0 1 0 16 42 a20 20 0 0 1 -16 -42 z" fill="${t.accent}" opacity=".85"/>
    <path d="M90 350 v-60 h20 v-30 l14 -18 14 18 v30 h24 v-46 l16 -20 16 20 v46 h20 v60 z" fill="#0d0f33" stroke="${t.primary}" stroke-opacity=".6" stroke-width="2"/>
    <path d="M120 140 q60 -40 150 -10" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-dasharray="1 8" stroke-linecap="round" fill="none"/>
    <path d="M262 128 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 z" fill="#fff" opacity=".8"/>
    ${stars(rng('dsn2'), 18, 0.8)}`),
  'horror-classics': (t) => BG('horror-classics', t, (r) => `
    ${Array.from({ length: 26 }, () => `<rect x="${r() * 640}" y="${r() * 400}" width="1.2" height="${16 + r() * 30}" fill="#cfd3e0" opacity="${(r() * 0.14 + 0.04).toFixed(2)}" transform="rotate(8 320 200)"/>`).join('')}
    <path d="M0 340 h640 v60 h-640 z" fill="#050405" opacity=".95"/>
    ${Array.from({ length: 7 }, (_, i) => `<path d="M${40 + i * 90} 340 v-${26 + r() * 30} l6 8 v${18 + r() * 30} z" fill="#050405"/>`).join('')}
    <circle cx="520" cy="110" r="60" fill="#e8e2d6" opacity=".08"/>
    <circle cx="520" cy="110" r="60" stroke="#e8e2d6" stroke-opacity=".2" stroke-width="1.4" fill="none"/>
    <path d="M180 100 q8 22 0 40 M200 96 q10 26 2 48" stroke="${t.primary}" stroke-opacity=".5" stroke-width="2.6" stroke-linecap="round" fill="none"/>`),
  smurfs: (t) => BG('smurfs', t, (r) => `
    <path d="M0 320 q140 -50 300 -14 t340 -20 v114 h-640 z" fill="#0c2d1e" opacity=".95"/>
    <path d="M120 320 a52 52 0 0 1 104 0 z" fill="#c33e3e" opacity=".9"/>
    <path d="M136 320 a36 36 0 0 1 72 0 z" fill="#e05252" opacity=".5"/>
    <rect x="158" y="296" width="28" height="26" rx="6" fill="#f4ead2" opacity=".9"/>
    <circle cx="150" cy="300" r="5" fill="#fff" opacity=".85"/><circle cx="196" cy="306" r="4" fill="#fff" opacity=".8"/>
    <ellipse cx="470" cy="100" rx="90" ry="26" fill="#eaf4ff" opacity=".14"/>
    ${Array.from({ length: 8 }, () => `<circle cx="${(r() * 640) | 0}" cy="${(200 + r() * 90) | 0}" r="${(r() * 2.4 + 1).toFixed(1)}" fill="#dff0ff" opacity="${(r() * 0.5 + 0.2).toFixed(2)}"/>`).join('')}`),
  'miss-peregrine': (t) => BG('miss-peregrine', t, (r) => `
    <rect x="40" y="50" width="640" height="400" fill="#d9d2c2" opacity=".04"/>
    <circle cx="150" cy="130" r="66" stroke="${t.accent}" stroke-opacity=".4" stroke-width="2" fill="none"/>
    <circle cx="150" cy="130" r="52" stroke="${t.accent}" stroke-opacity=".24" stroke-width="1.2" fill="none" stroke-dasharray="2 6"/>
    <path d="M150 130 V92 M150 130 l26 14" stroke="${t.accent}" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/>
    <path d="M420 180 q40 -34 90 -20 q-18 4 -26 14 q16 0 24 8 q-20 2 -28 10 q-30 4 -60 -12 z" fill="${t.primary}" opacity=".5"/>
    <path d="M0 330 q200 -30 400 0 t240 -8 v78 h-640 z" fill="#10160f" opacity=".92"/>
    ${Array.from({ length: 10 }, () => `<circle cx="${(r() * 640) | 0}" cy="${(r() * 260) | 0}" r="${(r() * 1.6 + 0.6).toFixed(1)}" fill="#e7dfc9" opacity="${(r() * 0.3 + 0.1).toFixed(2)}"/>`).join('')}`),
  lotr: (t) => BG('lotr', t, (r) => `
    <circle cx="330" cy="150" r="70" stroke="${t.primary}" stroke-opacity=".65" stroke-width="9" fill="none"/>
    <circle cx="330" cy="150" r="70" stroke="#fff" stroke-opacity=".2" stroke-width="1.6" fill="none"/>
    <path d="M0 400 l120 -150 70 80 90 -130 110 150 70 -90 100 140 z" fill="#0e0a04" opacity=".92"/>
    <path d="M120 250 l30 40 M400 200 l40 56" stroke="${t.accent}" stroke-opacity=".25" stroke-width="2" fill="none"/>
    ${stars(rng('lt2'), 14, 0.5)}`),
  anime: (t) => BG('anime', t, (r) => `
    <path d="M60 120 q260 -60 520 0" stroke="${t.primary}" stroke-width="10" stroke-linecap="round" fill="none" opacity=".5"/>
    <path d="M120 124 v180 M520 124 v180 M100 170 h440" stroke="${t.primary}" stroke-opacity=".45" stroke-width="6" fill="none"/>
    <circle cx="320" cy="250" r="60" fill="${t.accent}" opacity=".12"/>
    ${Array.from({ length: 14 }, () => { const x = r() * 640, y = r() * 400; return `<path d="M${x} ${y} l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 z" fill="${t.accent}" opacity="${(r() * 0.5 + 0.2).toFixed(2)}"/>`; }).join('')}`),
  other: (t) => BG('other', t, (r) => `
    <rect x="0" y="70" width="640" height="34" fill="#fff" opacity=".05"/>
    <rect x="0" y="296" width="640" height="34" fill="#fff" opacity=".05"/>
    ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 42}" y="76" width="22" height="22" rx="3" fill="#07040e" stroke="#fff" stroke-opacity=".2"/>`).join('')}
    ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 42}" y="302" width="22" height="22" rx="3" fill="#07040e" stroke="#fff" stroke-opacity=".2"/>`).join('')}
    <circle cx="320" cy="200" r="70" stroke="${t.primary}" stroke-opacity=".5" stroke-width="3" fill="none"/>
    <path d="M300 176 l44 24 -44 24 z" fill="${t.primary}" opacity=".8"/>`),
};

/* ── ჩაწერა ─────────────────────────────────────────────── */
let count = 0;
for (const [slug, theme] of Object.entries(THEMES)) {
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'emblem.svg'), (EMBLEMS[slug] || EMBLEMS.other)(theme), 'utf8');
  fs.writeFileSync(path.join(dir, 'bg.svg'), (BGS[slug] || BGS.other)(theme), 'utf8');
  count += 2;
}
fs.writeFileSync(path.join(OUT, 'themes.json'), JSON.stringify(THEMES, null, 2) + '\n', 'utf8');
console.log(`✓ შეიქმნა ${count} asset (${Object.keys(THEMES).length} სამყარო) + themes.json`);
