/**
 * Cinematic Intro v2 — timeline-ის კონფიგურაცია
 * ────────────────────────────────────────────────────────────
 * კონცეფცია: „ფილმი სრულდება. ის, რაც გვაგრძნობინა — რჩება."
 * ყველა საზღვარი scroll progress-ის (0..1) ერთეულებშია.
 */

export const INTRO_SEEN_KEY = 'relicverse-intro-seen';

/** GSAP timeline-ის ეტიკეტები (label → progress) */
export const INTRO_LABELS = {
  'intro-start': 0,
  'film-ends': 0.03,
  'memories-remain': 0.16,
  'relics-appear': 0.28,
  'relics-orbit': 0.47,
  'portal-build': 0.64,
  'brand-reveal': 0.8,
  'site-transition': 0.9,
  'intro-complete': 1,
};

/** გვერდითი progress ნავიგაცია */
export const PROGRESS_STEPS = [
  { id: '01', label: 'ფინალი', until: 0.28 },
  { id: '02', label: 'მოგონებები', until: 0.64 },
  { id: '03', label: 'პორტალი', until: 0.86 },
  { id: '04', label: 'RelicVerse', until: 1.01 },
];

/**
 * ტექსტები. თითო ფრაზა ეკრანზე რჩება timeline-ის ≥8–12%-ის
 * განმავლობაში; in/out ფანჯრები არასდროს იკვეთება.
 */
export const INTRO_TEXTS = {
  t1: 'ფილმი სრულდება.',
  t2: 'მაგრამ ზოგი სამყარო ჩვენთან რჩება.',
  t3a: 'ზოგჯერ მთელი ისტორია ერთ ნივთში ეტევა.',
  t3b: 'ერთი ქვა. ერთი კომპასი. ერთი ჭიქა. ერთი მოგონება.',
  t4a: 'ისინი სხვადასხვა სამყაროებიდან მოდიან.',
  t4b: 'აქ კი ერთმანეთს ხვდებიან.',
  tagline: 'ნივთები იმ სამყაროებიდან, რომლებიც არასდროს დაგავიწყდება.',
  triad: ['აღმოაჩინე', 'შეაგროვე', 'შეინახე'],
  scrollHint: 'გააგრძელე სქროლი',
};

/** ტექსტების დროის ფანჯრები: [in-დასაწყისი, in-ხანგრძლივობა, out-დასაწყისი, out-ხანგრძლივობა] */
export const TEXT_WINDOWS = {
  t1: [0.030, 0.028, 0.118, 0.026],   // ჩანს ~11.4%
  t2: [0.162, 0.028, 0.250, 0.026],   // ~11.4%
  t3a: [0.295, 0.026, 0.390, 0.024],  // ~11.9%
  t3b: [0.428, 0.026, 0.522, 0.024],  // ~11.8%
  t4a: [0.548, 0.024, 0.630, 0.022],  // ~10.4%
  t4b: [0.660, 0.024, 0.742, 0.022],  // ~10.4%
};

/**
 * მოგონებების ნივთები — ლოკალური SVG-ები, თითოს თავისი
 * სამყაროს light-trail ფერი და ორბიტული პოზიცია (angle°).
 */
export const MEMORY_RELICS = [
  { src: '/products/rv-001-2.svg', trail: '#e9c46a', angle: -90, depth: 'mid' },   // ფილოსოფიური ქვა — თბილი ოქროსფერი
  { src: '/products/rv-023-2.svg', trail: '#c8963c', angle: -38, depth: 'fg' },    // კომპასი — დამწვარი ოქრო
  { src: '/products/rv-016-2.svg', trail: '#d33a3a', angle: 13, depth: 'bg' },     // Death Note — შავ-წითელი
  { src: '/products/rv-015-2.svg', trail: '#e0483a', angle: 64, depth: 'mid' },    // წითელი ვაშლი
  { src: '/products/rv-010-2.svg', trail: '#f0abfc', angle: 116, depth: 'fg' },    // ვარდისფერი საპონი
  { src: '/products/rv-019-2.svg', trail: '#8b5cf6', angle: 167, depth: 'bg' },    // Mad Hatter-ის ქუდი — იასამნისფერი
  { src: '/products/rv-027-2.svg', trail: '#b3452f', angle: 218, depth: 'mid' },   // ჯეინის ჭიქა — მუქი წითელი
  { src: '/products/rv-004-2.svg', trail: '#ffd27a', angle: 270, depth: 'fg' },    // ოქროს სნიჩი
];

/** მობილურზე ნაკლები ობიექტი */
export const MEMORY_RELICS_MOBILE = MEMORY_RELICS.filter((_, i) => i % 2 === 0);

export const PARTICLE_COUNT = { desktop: 30, mobile: 12 };
export const DISSOLVE_COUNT = 12;
