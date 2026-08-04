/**
 * API façade — იგივე ინტერფეისი, რაც ადრე HTTP fetch-ს ჰქონდა,
 * ოღონდ ახლა ყველაფერი browser-ის service layer-ზე მუშაობს
 * (localStorage + static JSON seeds). Backend აღარ არსებობს.
 *
 * კომპონენტები ამ ფაილის მიღმა არაფერს ეხებიან — UI უცვლელია.
 */
import { ApiError } from '../services/apiError';
import * as products from '../services/productService';
import * as ordersSvc from '../services/orderService';
import * as users from '../services/userService';
import * as catalog from '../services/catalogService';
import * as promos from '../services/promoService';
import { adminStats } from '../services/statsService';
import { ensureInitialized } from '../services/storageService';

export { ApiError };
export const tokenStore = users.tokenStore;

/**
 * სინქრონული service ფუნქციის Promise-ად შეფუთვა —
 * კომპონენტების arsebuli async ლოგიკა (loading/error states) უცვლელი რჩება.
 */
function run(fn) {
  return new Promise((resolve, reject) => {
    // microtask-ზე გადავადება: React-ის state ციკლი ბუნებრივად მუშაობს
    queueMicrotask(() => {
      try {
        ensureInitialized();
        resolve(fn());
      } catch (err) {
        reject(err instanceof ApiError ? err : new ApiError(err?.message || 'დაფიქსირდა შეცდომა', 500));
      }
    });
  });
}

/** admin ოპერაციების demo-დაცვა */
const runAdmin = (fn) => run(() => { users.requireAdmin(); return fn(); });

export function toQuery() { return ''; } // აღარ გამოიყენება — თავსებადობისთვის დარჩა

export const api = {
  /* ─── კატალოგი ─── */
  bootstrap: () => run(() => catalog.bootstrap()),
  settings: () => run(() => catalog.getSettings()),

  /* ─── პროდუქტები ─── */
  products: (params) => run(() => products.listProducts(params || {})),
  product: (slug) => run(() => products.getProduct(slug)),
  suggest: (q) => run(() => products.suggest(q)),
  facets: () => run(() => products.facets()),

  /* ─── შეკვეთები ─── */
  createOrder: (payload) => run(() => ordersSvc.createOrder(payload, users.currentUserOrNull())),
  validatePromo: (code, subtotal) => run(() => ordersSvc.validatePromo(code, subtotal)),
  order: (id) => run(() => ordersSvc.getOrder(id)),

  /* ─── ავტორიზაცია (demo) ─── */
  register: (payload) => run(() => users.register(payload)),
  login: (payload) => run(() => users.login(payload)),
  me: () => run(() => users.me()),
  updateMe: (payload) => run(() => users.updateMe(payload)),
  myOrders: () => run(() => ordersSvc.ordersForUser(users.me().user.id)),

  /* ─── Newsletter ─── */
  subscribe: (email) => run(() => catalog.subscribeNewsletter(email)),

  /* ─── ადმინი ─── */
  admin: {
    stats: () => runAdmin(() => adminStats()),

    products: (q) => runAdmin(() => products.adminListProducts(q)),
    createProduct: (body) => runAdmin(() => products.adminCreateProduct(body)),
    updateProduct: (id, body) => runAdmin(() => products.adminUpdateProduct(id, body)),
    patchProduct: (id, body) => runAdmin(() => products.adminPatchProduct(id, body)),
    deleteProduct: (id) => runAdmin(() => products.adminDeleteProduct(id)),

    orders: (params) => runAdmin(() => ordersSvc.adminListOrders(params || {})),
    updateOrder: (id, status) => runAdmin(() => ordersSvc.adminUpdateOrderStatus(id, status)),
    deleteOrder: (id) => runAdmin(() => ordersSvc.adminDeleteOrder(id)),

    createCategory: (body) => runAdmin(() => catalog.adminCreateCategory(body)),
    updateCategory: (slug, body) => runAdmin(() => catalog.adminUpdateCategory(slug, body)),
    deleteCategory: (slug) => runAdmin(() => catalog.adminDeleteCategory(slug)),

    createUniverse: (body) => runAdmin(() => catalog.adminCreateUniverse(body)),
    updateUniverse: (slug, body) => runAdmin(() => catalog.adminUpdateUniverse(slug, body)),
    deleteUniverse: (slug) => runAdmin(() => catalog.adminDeleteUniverse(slug)),

    promos: () => runAdmin(() => promos.adminListPromos()),
    createPromo: (body) => runAdmin(() => promos.adminCreatePromo(body)),
    updatePromo: (code, body) => runAdmin(() => promos.adminUpdatePromo(code, body)),
    deletePromo: (code) => runAdmin(() => promos.adminDeletePromo(code)),

    newsletter: () => runAdmin(() => catalog.adminListNewsletter()),
    deleteSubscriber: (email) => runAdmin(() => catalog.adminDeleteSubscriber(email)),

    users: () => runAdmin(() => users.adminListUsers()),
    updateSettings: (body) => runAdmin(() => catalog.adminUpdateSettings(body)),
  },
};
