/**
 * catalogService — bootstrap, კატეგორიები, სამყაროები, პარამეტრები,
 * newsletter და პრომოკოდების admin CRUD (ყოფილი catalog/admin routes).
 */
import { getData, setData, updateData } from './storageService';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { slugify, uniqueSlug } from '../utils/idGenerator';
import { validate, sanitize } from '../utils/dataValidation';
import { ApiError } from './apiError';

/* ─── Bootstrap ─── */
export function bootstrap() {
  const categories = getData(STORAGE_KEYS.CATEGORIES);
  const universes = getData(STORAGE_KEYS.UNIVERSES);
  const genres = getData(STORAGE_KEYS.GENRES);
  const collections = getData(STORAGE_KEYS.COLLECTIONS);
  const settings = getData(STORAGE_KEYS.SETTINGS);
  const products = getData(STORAGE_KEYS.PRODUCTS);

  const visible = products.filter((p) => !p.hidden);
  const countBy = (fn) => visible.reduce((acc, p) => { const k = fn(p); acc[k] = (acc[k] || 0) + 1; return acc; }, {});
  const byUniverse = countBy((p) => p.universe);
  const byCategory = countBy((p) => p.category);

  return {
    settings,
    genres,
    categories: categories.map((c) => ({ ...c, count: byCategory[c.name] || 0 })),
    universes: universes.map((u) => ({ ...u, count: byUniverse[u.name] || 0 })),
    collections,
    priceRange: { min: 0, max: visible.length ? Math.ceil(Math.max(...visible.map((p) => p.price))) : 0 },
  };
}

export const getSettings = () => getData(STORAGE_KEYS.SETTINGS);

/* ─── Newsletter ─── */
export function subscribeNewsletter(email) {
  const { valid, errors } = validate({ email }, { email: { type: 'email', required: true, label: 'ელფოსტა' } });
  if (!valid) throw new ApiError('შეამოწმეთ ელფოსტა', 400, errors);

  const normalized = String(email).trim().toLowerCase();
  const list = getData(STORAGE_KEYS.NEWSLETTER);
  if (list.some((e) => e.email === normalized)) {
    return { message: 'ეს ელფოსტა უკვე დარეგისტრირებულია', alreadySubscribed: true };
  }
  setData(STORAGE_KEYS.NEWSLETTER, [...list, { email: normalized, createdAt: new Date().toISOString() }]);
  return { message: 'გმადლობთ! წარმატებით შემოგვიერთდით' };
}

export function adminListNewsletter() {
  return [...getData(STORAGE_KEYS.NEWSLETTER)].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function adminDeleteSubscriber(email) {
  const normalized = String(email).toLowerCase();
  updateData(STORAGE_KEYS.NEWSLETTER, (list) => list.filter((e) => e.email !== normalized));
  return { message: 'ელფოსტა წაიშალა' };
}

/* ─── კატეგორიები ─── */
export function adminCreateCategory(body) {
  const { valid, errors } = validate(body, { name: { required: true, minLength: 2, maxLength: 40, label: 'დასახელება' } });
  if (!valid) throw new ApiError('შეავსეთ ველები', 400, errors);
  const list = getData(STORAGE_KEYS.CATEGORIES);
  const item = {
    slug: uniqueSlug(slugify(body.slug || body.name), list.map((c) => c.slug)),
    name: sanitize(body.name, 40),
    icon: sanitize(body.icon, 30) || 'Sparkles',
    desc: sanitize(body.desc, 160),
  };
  setData(STORAGE_KEYS.CATEGORIES, [...list, item]);
  return { item, message: 'კატეგორია დაემატა' };
}

export function adminUpdateCategory(slug, body) {
  let updated = null;
  updateData(STORAGE_KEYS.CATEGORIES, (list) =>
    list.map((c) => (c.slug === slug
      ? (updated = { ...c, name: sanitize(body.name, 40) || c.name, icon: sanitize(body.icon, 30) || c.icon, desc: sanitize(body.desc, 160) })
      : c)));
  if (!updated) throw new ApiError('კატეგორია ვერ მოიძებნა', 404);
  return { item: updated, message: 'კატეგორია განახლდა' };
}

export function adminDeleteCategory(slug) {
  const list = getData(STORAGE_KEYS.CATEGORIES);
  const products = getData(STORAGE_KEYS.PRODUCTS);
  const cat = list.find((c) => c.slug === slug);
  if (!cat) throw new ApiError('კატეგორია ვერ მოიძებნა', 404);
  if (products.some((p) => p.category === cat.name)) throw new ApiError('ჯერ გადაიტანეთ ამ კატეგორიის პროდუქტები', 400);
  setData(STORAGE_KEYS.CATEGORIES, list.filter((c) => c.slug !== slug));
  return { message: 'კატეგორია წაიშალა' };
}

/* ─── სამყაროები ─── */
export function adminCreateUniverse(body) {
  const { valid, errors } = validate(body, { name: { required: true, minLength: 2, maxLength: 50, label: 'დასახელება' } });
  if (!valid) throw new ApiError('შეავსეთ ველები', 400, errors);
  const list = getData(STORAGE_KEYS.UNIVERSES);
  const item = {
    slug: uniqueSlug(slugify(body.slug || body.name), list.map((u) => u.slug)),
    name: sanitize(body.name, 50),
    nameKa: sanitize(body.nameKa, 50) || sanitize(body.name, 50),
    color: /^#[0-9a-f]{6}$/i.test(body.color) ? body.color : '#8b5cf6',
    accent: /^#[0-9a-f]{6}$/i.test(body.accent) ? body.accent : '#1a1030',
    desc: sanitize(body.desc, 200),
    ageRestricted: Boolean(body.ageRestricted),
  };
  setData(STORAGE_KEYS.UNIVERSES, [...list, item]);
  return { item, message: 'სამყარო დაემატა' };
}

export function adminUpdateUniverse(slug, body) {
  let updated = null;
  updateData(STORAGE_KEYS.UNIVERSES, (list) =>
    list.map((u) => (u.slug === slug
      ? (updated = {
          ...u,
          name: sanitize(body.name, 50) || u.name,
          nameKa: sanitize(body.nameKa, 50) || u.nameKa,
          color: /^#[0-9a-f]{6}$/i.test(body.color) ? body.color : u.color,
          accent: /^#[0-9a-f]{6}$/i.test(body.accent) ? body.accent : u.accent,
          desc: sanitize(body.desc, 200),
          ageRestricted: Boolean(body.ageRestricted),
        })
      : u)));
  if (!updated) throw new ApiError('სამყარო ვერ მოიძებნა', 404);
  return { item: updated, message: 'სამყარო განახლდა' };
}

export function adminDeleteUniverse(slug) {
  const list = getData(STORAGE_KEYS.UNIVERSES);
  const products = getData(STORAGE_KEYS.PRODUCTS);
  const uni = list.find((u) => u.slug === slug);
  if (!uni) throw new ApiError('სამყარო ვერ მოიძებნა', 404);
  if (products.some((p) => p.universe === uni.name)) throw new ApiError('ჯერ გადაიტანეთ ამ სამყაროს პროდუქტები', 400);
  setData(STORAGE_KEYS.UNIVERSES, list.filter((u) => u.slug !== slug));
  return { message: 'სამყარო წაიშალა' };
}

/* ─── პარამეტრები ─── */
export function adminUpdateSettings(body) {
  const current = getData(STORAGE_KEYS.SETTINGS);
  const next = {
    ...current,
    siteName: sanitize(body.siteName, 40) || current.siteName,
    slogan: sanitize(body.slogan, 120) || current.slogan,
    tagline: sanitize(body.tagline, 160) || current.tagline,
    phone: sanitize(body.phone, 30) || current.phone,
    email: sanitize(body.email, 60) || current.email,
    address: sanitize(body.address, 120) || current.address,
    social: {
      facebook: sanitize(body.social?.facebook, 160),
      instagram: sanitize(body.social?.instagram, 160),
      tiktok: sanitize(body.social?.tiktok, 160),
      youtube: sanitize(body.social?.youtube, 160),
    },
    shippingFee: Math.max(0, Number(body.shippingFee) ?? current.shippingFee),
    freeShippingThreshold: Math.max(0, Number(body.freeShippingThreshold) ?? current.freeShippingThreshold),
    saleBanner: {
      title: sanitize(body.saleBanner?.title, 80) || current.saleBanner.title,
      subtitle: sanitize(body.saleBanner?.subtitle, 160) || current.saleBanner.subtitle,
      endsAt: body.saleBanner?.endsAt || current.saleBanner.endsAt,
      active: body.saleBanner?.active !== false,
    },
  };
  setData(STORAGE_KEYS.SETTINGS, next);
  return { settings: next, message: 'პარამეტრები წარმატებით შეინახა' };
}
