/**
 * orderService — შეკვეთები და პრომოკოდები (ყოფილი server/routes/orders.js).
 * ფასები ყოველთვის აქტუალური პროდუქტის მონაცემებიდან ითვლება.
 */
import { getData, setData, updateData } from './storageService';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { round2, nextOrderId } from '../utils/idGenerator';
import { validate, sanitize } from '../utils/dataValidation';
import { ApiError } from './apiError';

const PAYMENT_METHODS = ['ნაღდი კურიერთან', 'ბარათი (დემო)', 'საბანკო გადარიცხვა'];
const SHIPPING_METHODS = ['კურიერი', 'თვითგატანა'];

export function validatePromo(code, subtotal) {
  const normalized = String(code || '').trim().toUpperCase();
  const total = Number(subtotal) || 0;
  if (!normalized) throw new ApiError('შეიყვანეთ პრომოკოდი', 400);

  const promos = getData(STORAGE_KEYS.PROMO_CODES);
  const promo = promos.find((p) => p.code === normalized);

  if (!promo || !promo.active) throw new ApiError('ასეთი პრომოკოდი არ არსებობს', 404);
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) throw new ApiError('პრომოკოდის ვადა ამოიწურა', 400);
  if (promo.maxUses && promo.used >= promo.maxUses) throw new ApiError('პრომოკოდის ლიმიტი ამოწურულია', 400);
  if (total < (promo.minTotal || 0)) throw new ApiError(`პრომოკოდი მოქმედებს ${promo.minTotal} ₾-დან`, 400);

  const discount = promo.type === 'percent' ? round2((total * promo.value) / 100) : Math.min(promo.value, total);
  return { code: promo.code, type: promo.type, value: promo.value, discount, description: promo.description, message: 'პრომოკოდი წარმატებით გააქტიურდა' };
}

/**
 * შეკვეთის გაფორმება. საბანკო ბარათის მონაცემები აქ არასდროს ხვდება —
 * ინახება მხოლოდ გადახდის მეთოდის სახელი.
 */
export function createOrder(payload, currentUser) {
  const { valid, errors } = validate(payload, {
    firstName: { required: true, minLength: 2, maxLength: 40, label: 'სახელი' },
    lastName: { required: true, minLength: 2, maxLength: 40, label: 'გვარი' },
    phone: { required: true, type: 'phone', label: 'ტელეფონი' },
    email: { required: true, type: 'email', label: 'ელფოსტა' },
    city: { required: true, minLength: 2, maxLength: 60, label: 'ქალაქი' },
    address: { required: true, minLength: 5, maxLength: 160, label: 'მისამართი' },
  });
  if (!valid) throw new ApiError('გთხოვთ, შეავსოთ ყველა სავალდებულო ველი', 400, errors);

  const cart = Array.isArray(payload.items) ? payload.items : [];
  if (!cart.length) throw new ApiError('კალათა ცარიელია', 400);
  if (cart.length > 50) throw new ApiError('კალათაში ძალიან ბევრი პოზიციაა', 400);

  const products = getData(STORAGE_KEYS.PRODUCTS);
  const settings = getData(STORAGE_KEYS.SETTINGS);
  const promos = getData(STORAGE_KEYS.PROMO_CODES);

  const items = [];
  for (const line of cart) {
    const product = products.find((p) => p.id === line.productId || p.id === line.id);
    if (!product || product.hidden) throw new ApiError(`პროდუქტი ვერ მოიძებნა: ${sanitize(String(line.productId || line.id), 30)}`, 400);
    const quantity = Math.max(1, Math.min(20, parseInt(line.quantity, 10) || 1));
    if (product.stock < quantity) {
      throw new ApiError(`„${product.name}" — მარაგში დარჩა მხოლოდ ${product.stock} ცალი`, 400);
    }
    items.push({ productId: product.id, name: product.name, slug: product.slug, image: product.images[0], price: product.price, quantity });
  }

  const subtotal = round2(items.reduce((sum, it) => sum + it.price * it.quantity, 0));

  let discount = 0;
  let promoCode = null;
  const code = String(payload.promoCode || '').trim().toUpperCase();
  if (code) {
    const promo = promos.find((p) => p.code === code && p.active);
    const expired = promo && promo.expiresAt && new Date(promo.expiresAt) < new Date();
    const exhausted = promo && promo.maxUses && promo.used >= promo.maxUses;
    if (promo && !expired && !exhausted && subtotal >= (promo.minTotal || 0)) {
      discount = promo.type === 'percent' ? round2((subtotal * promo.value) / 100) : Math.min(promo.value, subtotal);
      promoCode = promo.code;
    }
  }

  const shippingMethod = SHIPPING_METHODS.includes(payload.shippingMethod) ? payload.shippingMethod : SHIPPING_METHODS[0];
  const paymentMethod = PAYMENT_METHODS.includes(payload.paymentMethod) ? payload.paymentMethod : PAYMENT_METHODS[0];

  const afterDiscount = round2(subtotal - discount);
  const shipping = shippingMethod === 'თვითგატანა' || afterDiscount >= settings.freeShippingThreshold
    ? 0
    : settings.shippingFee;

  const orders = getData(STORAGE_KEYS.ORDERS);
  const order = {
    id: nextOrderId(orders),
    userId: currentUser?.id || null,
    customer: {
      firstName: sanitize(payload.firstName, 40),
      lastName: sanitize(payload.lastName, 40),
      phone: sanitize(payload.phone, 20),
      email: String(payload.email).trim().toLowerCase().slice(0, 80),
      city: sanitize(payload.city, 60),
      address: sanitize(payload.address, 160),
      note: sanitize(payload.note, 400),
    },
    items,
    subtotal,
    shipping,
    discount,
    promoCode,
    total: round2(afterDiscount + shipping),
    shippingMethod,
    paymentMethod,
    status: 'ახალი',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  setData(STORAGE_KEYS.ORDERS, [...orders, order]);

  // demo stock-ის შემცირება
  updateData(STORAGE_KEYS.PRODUCTS, (list) =>
    list.map((p) => {
      const line = items.find((it) => it.productId === p.id);
      return line ? { ...p, stock: Math.max(0, p.stock - line.quantity), sold: (p.sold || 0) + line.quantity } : p;
    }));

  if (promoCode) {
    updateData(STORAGE_KEYS.PROMO_CODES, (list) =>
      list.map((p) => (p.code === promoCode ? { ...p, used: (p.used || 0) + 1 } : p)));
  }

  return { order, message: 'შეკვეთა წარმატებით გაფორმდა' };
}

export function getOrder(id) {
  const orders = getData(STORAGE_KEYS.ORDERS);
  const order = orders.find((o) => o.id === id);
  if (!order) throw new ApiError('შეკვეთა ვერ მოიძებნა', 404);
  return order;
}

export function ordersForUser(userId) {
  return getData(STORAGE_KEYS.ORDERS)
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/* ─── Admin ─── */
const ORDER_STATUSES = ['ახალი', 'დამუშავებაში', 'გაგზავნილი', 'მიწოდებული', 'გაუქმებული'];

export function adminListOrders({ q = '', status = '' } = {}) {
  const orders = getData(STORAGE_KEYS.ORDERS);
  const needle = String(q || '').toLowerCase();
  let list = status && status !== 'ყველა' ? orders.filter((o) => o.status === status) : orders;
  if (needle) {
    list = list.filter((o) =>
      `${o.id} ${o.customer.firstName} ${o.customer.lastName} ${o.customer.phone} ${o.customer.email}`.toLowerCase().includes(needle));
  }
  return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function adminUpdateOrderStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) throw new ApiError('სტატუსი არასწორია', 400);
  let updated = null;
  updateData(STORAGE_KEYS.ORDERS, (list) =>
    list.map((o) => (o.id === id ? (updated = { ...o, status, updatedAt: new Date().toISOString() }) : o)));
  if (!updated) throw new ApiError('შეკვეთა ვერ მოიძებნა', 404);
  return { order: updated, message: 'სტატუსი განახლდა' };
}

export function adminDeleteOrder(id) {
  const orders = getData(STORAGE_KEYS.ORDERS);
  if (!orders.some((o) => o.id === id)) throw new ApiError('შეკვეთა ვერ მოიძებნა', 404);
  setData(STORAGE_KEYS.ORDERS, orders.filter((o) => o.id !== id));
  return { message: 'შეკვეთა წაიშალა' };
}

export { ORDER_STATUSES };
