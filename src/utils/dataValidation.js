/** ვალიდაცია და სანიტიზაცია (ყოფილი server-side ლოგიკის client პორტი) */

/** მარტივი ვალიდაცია — იგივე წესები, რაც backend-ს ჰქონდა */
export function validate(body, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const raw = body[field];
    const value = typeof raw === 'string' ? raw.trim() : raw;

    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[field] = rule.label ? `${rule.label} სავალდებულოა` : 'სავალდებულო ველი';
      continue;
    }
    if (value === undefined || value === null || value === '') continue;

    if (rule.type === 'number') {
      const n = Number(value);
      if (!Number.isFinite(n)) { errors[field] = 'რიცხვი უნდა იყოს'; continue; }
      if (rule.min !== undefined && n < rule.min) errors[field] = `მინიმუმ ${rule.min}`;
      if (rule.max !== undefined && n > rule.max) errors[field] = `მაქსიმუმ ${rule.max}`;
      continue;
    }
    if (rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      errors[field] = 'ელფოსტის ფორმატი არასწორია';
      continue;
    }
    if (rule.type === 'phone' && !/^[+0-9()\s-]{9,20}$/.test(value)) {
      errors[field] = 'ტელეფონის ფორმატი არასწორია';
      continue;
    }
    if (rule.minLength && String(value).length < rule.minLength) {
      errors[field] = `მინიმუმ ${rule.minLength} სიმბოლო`;
      continue;
    }
    if (rule.maxLength && String(value).length > rule.maxLength) {
      errors[field] = `მაქსიმუმ ${rule.maxLength} სიმბოლო`;
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export const sanitize = (value, max = 500) =>
  typeof value === 'string' ? value.replace(/[<>]/g, '').trim().slice(0, max) : '';

/* ─────────── Import ფაილის ვალიდაცია ─────────── */

const isArr = (v) => Array.isArray(v);
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

/**
 * ამოწმებს relicverse-backup JSON-ს.
 * აბრუნებს { ok, errors[], data } — data მხოლოდ ok=true-ზე.
 */
export function validateImport(raw) {
  const errors = [];
  if (!isObj(raw)) return { ok: false, errors: ['ფაილი არ შეიცავს JSON ობიექტს'] };

  const required = ['products', 'categories', 'universes', 'settings'];
  for (const key of required) {
    if (!(key in raw)) errors.push(`აკლია ველი: ${key}`);
  }
  for (const key of ['products', 'categories', 'universes', 'orders', 'promoCodes', 'newsletter', 'users', 'reviews', 'genres', 'collections']) {
    if (key in raw && !isArr(raw[key])) errors.push(`${key} უნდა იყოს სია (array)`);
  }
  if ('settings' in raw && !isObj(raw.settings)) errors.push('settings უნდა იყოს ობიექტი');

  if (isArr(raw.products)) {
    const ids = new Set();
    const slugs = new Set();
    raw.products.forEach((p, i) => {
      const at = `products[${i}]`;
      if (!p || typeof p !== 'object') { errors.push(`${at}: არასწორი ჩანაწერი`); return; }
      if (!p.id) errors.push(`${at}: აკლია id`);
      else if (ids.has(p.id)) errors.push(`${at}: გამეორებული id "${p.id}"`);
      else ids.add(p.id);
      if (!p.slug) errors.push(`${at}: აკლია slug`);
      else if (slugs.has(p.slug)) errors.push(`${at}: გამეორებული slug "${p.slug}"`);
      else slugs.add(p.slug);
      if (!p.name) errors.push(`${at}: აკლია name`);
      if (!Number.isFinite(Number(p.price)) || Number(p.price) < 0) errors.push(`${at}: ფასი არასწორია`);
      if (p.stock !== undefined && (!Number.isFinite(Number(p.stock)) || Number(p.stock) < 0)) errors.push(`${at}: stock არასწორია`);
      if (p.images !== undefined && !isArr(p.images)) errors.push(`${at}: images უნდა იყოს სია`);
      if (isArr(p.images) && p.images.some((s) => typeof s !== 'string')) errors.push(`${at}: images უნდა შეიცავდეს მხოლოდ ტექსტურ ბილიკებს`);
    });
  }

  return { ok: errors.length === 0, errors: errors.slice(0, 12), data: raw };
}
