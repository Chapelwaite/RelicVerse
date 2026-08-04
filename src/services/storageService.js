/**
 * storageService — ერთიანი client-side „მონაცემთა ბაზა".
 * ────────────────────────────────────────────────────────────
 *  • პირველი გაშვებისას static JSON seed-ები deep copy-თ ინახება localStorage-ში
 *  • შემდგომ ყველა წაკითხვა/ჩაწერა localStorage-იდან ხდება
 *  • დაზიანებული JSON → ავტომატური აღდგენა seed-იდან (აპლიკაცია არ იშლება)
 *  • localStorage-ის სრული მიუწვდომლობისას (მაგ. მკაცრი privacy რეჟიმი) —
 *    in-memory fallback + ერთჯერადი ქართული გაფრთხილება
 *  • ცვლილებებზე ეშვება 'relicverse:data-changed' event — UI მაშინვე ახლდება
 */
import { STORAGE_KEYS, DATA_KEYS, DATA_VERSION } from '../utils/storageKeys';

import productsSeed from '../data/products.json';
import categoriesSeed from '../data/categories.json';
import universesSeed from '../data/universes.json';
import genresSeed from '../data/genres.json';
import collectionsSeed from '../data/collections.json';
import reviewsSeed from '../data/reviews.json';
import ordersSeed from '../data/orders.json';
import settingsSeed from '../data/settings.json';
import promoCodesSeed from '../data/promoCodes.json';
import newsletterSeed from '../data/newsletter.json';
import demoUsersSeed from '../data/demoUsers.json';

const SEEDS = {
  [STORAGE_KEYS.PRODUCTS]: productsSeed,
  [STORAGE_KEYS.CATEGORIES]: categoriesSeed,
  [STORAGE_KEYS.UNIVERSES]: universesSeed,
  [STORAGE_KEYS.GENRES]: genresSeed,
  [STORAGE_KEYS.COLLECTIONS]: collectionsSeed,
  [STORAGE_KEYS.REVIEWS]: reviewsSeed,
  [STORAGE_KEYS.ORDERS]: ordersSeed,
  [STORAGE_KEYS.SETTINGS]: settingsSeed,
  [STORAGE_KEYS.PROMO_CODES]: promoCodesSeed,
  [STORAGE_KEYS.NEWSLETTER]: newsletterSeed,
  [STORAGE_KEYS.USERS]: demoUsersSeed,
};

const deepCopy = (v) => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

/* ─── localStorage ხელმისაწვდომობა + in-memory fallback ─── */
const memory = new Map();
let storageOk = true;
let warned = false;

try {
  const probe = '__relicverse_probe__';
  window.localStorage.setItem(probe, '1');
  window.localStorage.removeItem(probe);
} catch {
  storageOk = false;
}

function warnOnce(message) {
  if (warned) return;
  warned = true;
  console.warn('[RelicVerse]', message);
  try {
    window.dispatchEvent(new CustomEvent('relicverse:storage-warning', { detail: { message } }));
  } catch { /* ignore */ }
}

function rawGet(key) {
  if (!storageOk) return memory.has(key) ? memory.get(key) : null;
  try { return window.localStorage.getItem(key); } catch { return memory.get(key) ?? null; }
}

function rawSet(key, value) {
  memory.set(key, value);
  if (!storageOk) {
    warnOnce('ბრაუზერის მეხსიერება მიუწვდომელია — ცვლილებები შეინახება მხოლოდ ამ სესიაში.');
    return;
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // quota exceeded ან სხვა ჩაწერის შეცდომა
    warnOnce('ბრაუზერის მეხსიერება გადაივსო — ნაწილი ცვლილებებისა შეინახება მხოლოდ ამ სესიაში.');
  }
}

function rawRemove(key) {
  memory.delete(key);
  try { window.localStorage.removeItem(key); } catch { /* ignore */ }
}

/* ─── ცვლილებების გამოწერა ─── */
export function notifyDataChanged(key) {
  try {
    window.dispatchEvent(new CustomEvent('relicverse:data-changed', { detail: { key } }));
  } catch { /* ignore */ }
}

export function subscribeDataChanged(handler) {
  window.addEventListener('relicverse:data-changed', handler);
  return () => window.removeEventListener('relicverse:data-changed', handler);
}

/* ─── ინიციალიზაცია და ვერსია ─── */
let initialized = false;

export function ensureInitialized() {
  if (initialized) return;
  initialized = true;

  const storedVersion = Number(rawGet(STORAGE_KEYS.DATA_VERSION));
  if (!Number.isFinite(storedVersion) || storedVersion < 1) {
    // მომავალი მიგრაციებისთვის; ამ ეტაპზე უბრალოდ ვნიშნავთ ვერსიას.
    rawSet(STORAGE_KEYS.DATA_VERSION, String(DATA_VERSION));
  }

  // seed მხოლოდ იმ key-ებზე, რომლებიც ჯერ არ არსებობს —
  // მომხმარებლის მონაცემები refresh-ზე არასდროს გადაიწერება.
  for (const key of DATA_KEYS) {
    if (rawGet(key) === null) {
      rawSet(key, JSON.stringify(deepCopy(SEEDS[key] ?? [])));
    }
  }
}

/* ─── ძირითადი API ─── */

/** წაიკითხე კოლექცია; დაზიანების შემთხვევაში აღდგება seed-იდან */
export function getData(key) {
  ensureInitialized();
  const raw = rawGet(key);
  if (raw === null) {
    const seed = deepCopy(SEEDS[key] ?? []);
    rawSet(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const seed = deepCopy(SEEDS[key] ?? []);
    rawSet(key, JSON.stringify(seed));
    warnOnce('შენახული მონაცემი დაზიანებული იყო და საწყისი ვერსიით აღდგა.');
    return seed;
  }
}

export function setData(key, value) {
  ensureInitialized();
  rawSet(key, JSON.stringify(value));
  notifyDataChanged(key);
  return value;
}

export function updateData(key, mutator) {
  const next = mutator(getData(key));
  return setData(key, next);
}

/** მარტივი (არა-JSON API) წაკითხვა/ჩაწერა — token-ისთვის */
export const simpleStore = {
  get: (key) => rawGet(key),
  set: (key, value) => { if (value === null || value === undefined) rawRemove(key); else rawSet(key, String(value)); },
};

/* ─── Reset / Export / Import ─── */

/**
 * საწყისი მონაცემების აღდგენა.
 * cart/favorites/intro preference და მიმდინარე login რჩება —
 * admin-ის სესია არ წყდება (demo admin ხელახლა დაი-seed-ება იმავე ID-ით).
 */
export function resetToSeeds() {
  for (const key of DATA_KEYS) rawRemove(key);
  rawSet(STORAGE_KEYS.DATA_VERSION, String(DATA_VERSION));
  initialized = false;
  ensureInitialized();
  notifyDataChanged('*');
}

export function exportAllData() {
  ensureInitialized();
  return {
    app: 'RelicVerse',
    dataVersion: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    products: getData(STORAGE_KEYS.PRODUCTS),
    categories: getData(STORAGE_KEYS.CATEGORIES),
    universes: getData(STORAGE_KEYS.UNIVERSES),
    genres: getData(STORAGE_KEYS.GENRES),
    collections: getData(STORAGE_KEYS.COLLECTIONS),
    reviews: getData(STORAGE_KEYS.REVIEWS),
    orders: getData(STORAGE_KEYS.ORDERS),
    promoCodes: getData(STORAGE_KEYS.PROMO_CODES),
    settings: getData(STORAGE_KEYS.SETTINGS),
    newsletter: getData(STORAGE_KEYS.NEWSLETTER),
    users: getData(STORAGE_KEYS.USERS),
  };
}

/** უკვე ვალიდირებული ობიექტის ჩაწერა storage-ში */
export function importAllData(data) {
  const map = {
    products: STORAGE_KEYS.PRODUCTS,
    categories: STORAGE_KEYS.CATEGORIES,
    universes: STORAGE_KEYS.UNIVERSES,
    genres: STORAGE_KEYS.GENRES,
    collections: STORAGE_KEYS.COLLECTIONS,
    reviews: STORAGE_KEYS.REVIEWS,
    orders: STORAGE_KEYS.ORDERS,
    promoCodes: STORAGE_KEYS.PROMO_CODES,
    settings: STORAGE_KEYS.SETTINGS,
    newsletter: STORAGE_KEYS.NEWSLETTER,
    users: STORAGE_KEYS.USERS,
  };
  for (const [field, key] of Object.entries(map)) {
    if (field in data && data[field] !== undefined) {
      rawSet(key, JSON.stringify(data[field]));
    }
  }
  notifyDataChanged('*');
}
