/** ID-ების, slug-ებისა და რიცხვების დამხმარეები (ყოფილი server/lib/helpers.js) */

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/** უნიკალური UUID — crypto.randomUUID fallback-ით */
export function uuid() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch { /* fallback ქვემოთ */ }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9Ⴀ-ჿ\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'item';
}

/** slug-ის დუბლირებისას ავტომატური suffix: philosophers-stone-2 */
export function uniqueSlug(base, taken) {
  let slug = base;
  let i = 2;
  while (taken.includes(slug)) slug = `${base}-${i++}`;
  return slug;
}

/** ახალი პროდუქტის ID — rv-059, rv-060 … */
export function nextProductId(products) {
  const max = products.reduce((m, p) => {
    const n = parseInt(String(p.id).replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `rv-${String(max + 1).padStart(3, '0')}`;
}

/** შეკვეთის ნომერი — RV-2026-00124 (არსებული ფორმატი უცვლელია) */
export function nextOrderId(orders) {
  const year = new Date().getFullYear();
  const prefix = `RV-${year}-`;
  const max = orders
    .filter((o) => String(o.id).startsWith(prefix))
    .reduce((m, o) => {
      const n = parseInt(String(o.id).slice(prefix.length), 10);
      return Number.isFinite(n) && n > m ? n : m;
    }, 100);
  return `${prefix}${String(max + 1).padStart(5, '0')}`;
}

/** მომხმარებლის ID */
export const nextUserId = () => `usr-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
