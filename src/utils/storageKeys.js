/**
 * ყველა localStorage გასაღები ერთ ადგილას.
 * Intro-ს sessionStorage გასაღები ('relicverse-intro-seen') განზრახ
 * უცვლელია — intro-ს ლოგიკა არ იცვლება.
 */
export const DATA_VERSION = 1;

export const STORAGE_KEYS = {
  PRODUCTS: 'relicverse_products',
  CATEGORIES: 'relicverse_categories',
  UNIVERSES: 'relicverse_universes',
  GENRES: 'relicverse_genres',
  COLLECTIONS: 'relicverse_collections',
  REVIEWS: 'relicverse_reviews',
  ORDERS: 'relicverse_orders',
  USERS: 'relicverse_users',
  CURRENT_USER: 'relicverse_current_user',
  SETTINGS: 'relicverse_settings',
  PROMO_CODES: 'relicverse_promo_codes',
  NEWSLETTER: 'relicverse_newsletter',
  CART: 'relicverse_cart',
  FAVORITES: 'relicverse_favorites',
  COMPARE: 'relicverse_compare',
  RECENTLY_VIEWED: 'relicverse_recently_viewed',
  PROMO_APPLIED: 'relicverse_promo_applied',
  COOKIES: 'relicverse_cookies',
  DATA_VERSION: 'relicverse_data_version',
  INTRO_SEEN: 'relicverse-intro-seen', // sessionStorage — უცვლელი
};

/** Seed-ით ინიციალიზებადი „მონაცემთა ბაზის" გასაღებები */
export const DATA_KEYS = [
  STORAGE_KEYS.PRODUCTS,
  STORAGE_KEYS.CATEGORIES,
  STORAGE_KEYS.UNIVERSES,
  STORAGE_KEYS.GENRES,
  STORAGE_KEYS.COLLECTIONS,
  STORAGE_KEYS.REVIEWS,
  STORAGE_KEYS.ORDERS,
  STORAGE_KEYS.USERS,
  STORAGE_KEYS.SETTINGS,
  STORAGE_KEYS.PROMO_CODES,
  STORAGE_KEYS.NEWSLETTER,
];
