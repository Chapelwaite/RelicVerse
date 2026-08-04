/**
 * productService — კატალოგის წაკითხვა/ფილტრაცია/ძიება + admin CRUD.
 * ლოგიკა ზუსტად პორტირებულია ყოფილი server/routes/products.js და
 * server/routes/admin.js ფაილებიდან — ქცევა იდენტურია.
 */
import { getData, setData, updateData } from './storageService';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { round2, slugify, uniqueSlug, nextProductId } from '../utils/idGenerator';
import { validate, sanitize } from '../utils/dataValidation';
import { ApiError } from './apiError';

const visible = (p) => !p.hidden;

function matchesCollection(product, collection) {
  const r = collection?.rule || {};
  if (r.tags && !r.tags.some((t) => product.tags.includes(t))) return false;
  if (r.categories && !r.categories.includes(product.category)) return false;
  if (r.genres && !r.genres.includes(product.genre)) return false;
  if (r.universes && !r.universes.includes(product.universe)) return false;
  if (r.maxPrice !== undefined && product.price > r.maxPrice) return false;
  if (r.minPrice !== undefined && product.price < r.minPrice) return false;
  return true;
}

function matchesQuery(product, q) {
  if (!q) return true;
  const needle = String(q).toLowerCase();
  return [
    product.name, product.universe, product.genre, product.category,
    product.shortDescription, product.description, product.color, product.material,
    ...(product.tags || []),
  ].some((field) => String(field || '').toLowerCase().includes(needle));
}

const asArray = (value) =>
  value === undefined || value === '' || value === null ? [] : Array.isArray(value) ? value : String(value).split(',').filter(Boolean);

const isTrue = (value) => value === '1' || value === 'true' || value === true || value === 1;

function applyFilters(products, q, collections) {
  const universes = asArray(q.universe);
  const genres = asArray(q.genre);
  const categories = asArray(q.category);
  const min = q.minPrice !== undefined && q.minPrice !== '' && q.minPrice !== null ? Number(q.minPrice) : null;
  const max = q.maxPrice !== undefined && q.maxPrice !== '' && q.maxPrice !== null ? Number(q.maxPrice) : null;
  const collection = q.collection ? collections.find((c) => c.slug === q.collection) : null;

  return products.filter((p) => {
    if (!visible(p)) return false;
    if (universes.length && !universes.includes(p.universe) && !universes.includes(p.universeSlug)) return false;
    if (genres.length && !genres.includes(p.genre)) return false;
    if (categories.length && !categories.includes(p.category) && !categories.includes(p.categorySlug)) return false;
    if (min !== null && p.price < min) return false;
    if (max !== null && p.price > max) return false;
    if (isTrue(q.onSale) && !p.onSale) return false;
    if (isTrue(q.inStock) && p.stock <= 0) return false;
    if (isTrue(q.newArrival) && !p.newArrival) return false;
    if (isTrue(q.featured) && !p.featured) return false;
    if (isTrue(q.freeShipping) && !p.freeShipping) return false;
    if (q.minRating && p.rating < Number(q.minRating)) return false;
    if (collection && !matchesCollection(p, collection)) return false;
    if (!matchesQuery(p, q.q)) return false;
    return true;
  });
}

const SORTERS = {
  popular: (a, b) => b.sold - a.sold || b.rating - a.rating,
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  discount: (a, b) => b.discount - a.discount,
};

/* ─── საჯარო კითხვები ─── */

export function listProducts(params = {}) {
  const products = getData(STORAGE_KEYS.PRODUCTS);
  const collections = getData(STORAGE_KEYS.COLLECTIONS);

  let list = applyFilters(products, params, collections);
  const sorter = SORTERS[params.sort] || SORTERS.popular;
  list = [...list].sort(sorter);

  const page = Math.max(1, parseInt(params.page, 10) || 1);
  const limit = Math.min(60, Math.max(1, parseInt(params.limit, 10) || 12));
  const total = list.length;
  const items = list.slice((page - 1) * limit, page * limit);

  return { items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
}

export function suggest(q) {
  const query = String(q || '').trim().toLowerCase();
  if (query.length < 2) return { products: [], universes: [], categories: [], total: 0 };

  const products = getData(STORAGE_KEYS.PRODUCTS);
  const universes = getData(STORAGE_KEYS.UNIVERSES);
  const categories = getData(STORAGE_KEYS.CATEGORIES);

  const matched = products.filter(visible).filter((p) => matchesQuery(p, query));
  matched.sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(query) ? 0 : 1;
    const bStarts = b.name.toLowerCase().startsWith(query) ? 0 : 1;
    return aStarts - bStarts || b.sold - a.sold;
  });

  return {
    products: matched.slice(0, 6).map((p) => ({ id: p.id, name: p.name, slug: p.slug, price: p.price, image: p.images[0], universe: p.universe })),
    universes: universes.filter((u) => `${u.name} ${u.nameKa}`.toLowerCase().includes(query)).slice(0, 3),
    categories: categories.filter((c) => c.name.toLowerCase().includes(query)).slice(0, 3),
    total: matched.length,
  };
}

export function facets() {
  const products = getData(STORAGE_KEYS.PRODUCTS).filter(visible);
  const count = (key) => products.reduce((acc, p) => { acc[p[key]] = (acc[p[key]] || 0) + 1; return acc; }, {});
  return {
    universes: count('universe'),
    genres: count('genre'),
    categories: count('category'),
    total: products.length,
    maxPrice: products.length ? Math.max(...products.map((p) => p.price)) : 0,
    onSale: products.filter((p) => p.onSale).length,
    newArrival: products.filter((p) => p.newArrival).length,
  };
}

export function getProduct(slugOrId) {
  const products = getData(STORAGE_KEYS.PRODUCTS);
  const product = products.find((p) => p.slug === slugOrId || p.id === slugOrId);
  if (!product || product.hidden) throw new ApiError('პროდუქტი ვერ მოიძებნა', 404);

  const reviews = getData(STORAGE_KEYS.REVIEWS)
    .filter((r) => r.productId === product.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const others = products.filter((p) => visible(p) && p.id !== product.id);
  const sameUniverse = others.filter((p) => p.universe === product.universe).slice(0, 8);
  const similar = others
    .filter((p) => p.category === product.category || p.genre === product.genre)
    .sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price))
    .slice(0, 8);

  return { product, reviews, sameUniverse, similar };
}

/* ─── Admin CRUD ─── */

const PRODUCT_RULES = {
  name: { required: true, minLength: 2, maxLength: 90, label: 'დასახელება' },
  universe: { required: true, label: 'სამყარო' },
  genre: { required: true, label: 'ჟანრი' },
  category: { required: true, label: 'კატეგორია' },
  price: { required: true, type: 'number', min: 0.5, max: 100000, label: 'ფასი' },
  oldPrice: { type: 'number', min: 0, max: 100000, label: 'ძველი ფასი' },
  stock: { required: true, type: 'number', min: 0, max: 100000, label: 'მარაგი' },
  shortDescription: { required: true, minLength: 5, maxLength: 200, label: 'მოკლე აღწერა' },
  description: { required: true, minLength: 10, maxLength: 2000, label: 'აღწერა' },
};

function buildProduct(body, existing) {
  const universes = getData(STORAGE_KEYS.UNIVERSES);
  const categories = getData(STORAGE_KEYS.CATEGORIES);
  const uni = universes.find((u) => u.name === body.universe);
  const cat = categories.find((c) => c.name === body.category);

  const price = round2(Number(body.price));
  const oldPrice = body.oldPrice ? round2(Number(body.oldPrice)) : null;
  const onSale = Boolean(oldPrice && oldPrice > price);

  // სურათი: URL, ლოკალური static ბილიკი ან პატარა Data URL — Data URL-ს არ ვჭრით sanitize-ით
  const images = (Array.isArray(body.images) ? body.images : String(body.images || '').split(/[\n,]/))
    .map((s) => {
      const v = String(s).trim();
      if (v.startsWith('data:image/')) return v.length <= 1_400_000 ? v : '';
      return sanitize(v, 300);
    })
    .filter(Boolean);

  return {
    ...existing,
    name: sanitize(body.name, 90),
    universe: body.universe,
    universeSlug: uni?.slug || 'other',
    genre: body.genre,
    category: body.category,
    categorySlug: cat?.slug || 'gifts',
    price,
    oldPrice,
    discount: onSale ? Math.round((1 - price / oldPrice) * 100) : 0,
    onSale,
    stock: Math.max(0, parseInt(body.stock, 10) || 0),
    shortDescription: sanitize(body.shortDescription, 200),
    description: sanitize(body.description, 2000),
    images: images.length ? images : existing?.images?.length ? existing.images : ['/products/placeholder.svg'],
    material: sanitize(body.material, 120),
    size: sanitize(body.size, 80),
    color: sanitize(body.color, 80),
    featured: Boolean(body.featured),
    newArrival: Boolean(body.newArrival),
    freeShipping: Boolean(body.freeShipping),
    ageRestricted: Boolean(body.ageRestricted),
    hidden: Boolean(body.hidden),
    tags: (Array.isArray(body.tags) ? body.tags : String(body.tags || '').split(','))
      .map((t) => sanitize(String(t), 30)).filter(Boolean).slice(0, 12),
  };
}

export function adminListProducts(q = '') {
  const products = getData(STORAGE_KEYS.PRODUCTS);
  const needle = String(q || '').toLowerCase();
  const list = needle ? products.filter((p) => `${p.name} ${p.universe} ${p.category}`.toLowerCase().includes(needle)) : products;
  return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function adminCreateProduct(body) {
  const { valid, errors } = validate(body, PRODUCT_RULES);
  if (!valid) throw new ApiError('შეავსეთ ველები სწორად', 400, errors);

  const products = getData(STORAGE_KEYS.PRODUCTS);
  const id = nextProductId(products);
  const base = buildProduct(body, {
    id,
    art: 'stone',
    rating: 0,
    reviewCount: 0,
    sold: 0,
    createdAt: new Date().toISOString(),
  });
  const product = { ...base, slug: uniqueSlug(slugify(body.slug || body.name), products.map((p) => p.slug)) };

  setData(STORAGE_KEYS.PRODUCTS, [...products, product]);
  return { product, message: 'პროდუქტი წარმატებით დაემატა' };
}

export function adminUpdateProduct(id, body) {
  const { valid, errors } = validate(body, PRODUCT_RULES);
  if (!valid) throw new ApiError('შეავსეთ ველები სწორად', 400, errors);

  const products = getData(STORAGE_KEYS.PRODUCTS);
  const existing = products.find((p) => p.id === id);
  if (!existing) throw new ApiError('პროდუქტი ვერ მოიძებნა', 404);

  const updated = buildProduct(body, existing);
  if (body.slug && body.slug !== existing.slug) {
    updated.slug = uniqueSlug(slugify(body.slug), products.filter((p) => p.id !== existing.id).map((p) => p.slug));
  }

  setData(STORAGE_KEYS.PRODUCTS, products.map((p) => (p.id === existing.id ? updated : p)));
  return { product: updated, message: 'პროდუქტი წარმატებით განახლდა' };
}

export function adminPatchProduct(id, patchBody) {
  const allowed = ['featured', 'hidden', 'newArrival', 'freeShipping', 'stock', 'price'];
  const patch = {};
  for (const key of allowed) if (key in patchBody) patch[key] = patchBody[key];
  if (!Object.keys(patch).length) throw new ApiError('არაფერია შესაცვლელი', 400);
  if ('stock' in patch) patch.stock = Math.max(0, parseInt(patch.stock, 10) || 0);
  if ('price' in patch) patch.price = round2(Math.max(0.5, Number(patch.price) || 0.5));

  let updated = null;
  updateData(STORAGE_KEYS.PRODUCTS, (list) =>
    list.map((p) => (p.id === id ? (updated = { ...p, ...patch }) : p)));
  if (!updated) throw new ApiError('პროდუქტი ვერ მოიძებნა', 404);
  return { product: updated, message: 'მონაცემები წარმატებით განახლდა' };
}

export function adminDeleteProduct(id) {
  const products = getData(STORAGE_KEYS.PRODUCTS);
  if (!products.some((p) => p.id === id)) throw new ApiError('პროდუქტი ვერ მოიძებნა', 404);
  setData(STORAGE_KEYS.PRODUCTS, products.filter((p) => p.id !== id));
  updateData(STORAGE_KEYS.REVIEWS, (list) => list.filter((r) => r.productId !== id));
  return { message: 'პროდუქტი წაიშალა' };
}
