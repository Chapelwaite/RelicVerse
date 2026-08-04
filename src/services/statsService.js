/** statsService — admin dashboard-ის სტატისტიკა (ყოფილი /api/admin/stats) */
import { getData } from './storageService';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { round2 } from '../utils/idGenerator';

const ORDER_STATUSES = ['ახალი', 'დამუშავებაში', 'გაგზავნილი', 'მიწოდებული', 'გაუქმებული'];

export function adminStats() {
  const products = getData(STORAGE_KEYS.PRODUCTS);
  const orders = getData(STORAGE_KEYS.ORDERS);
  const users = getData(STORAGE_KEYS.USERS);
  const newsletter = getData(STORAGE_KEYS.NEWSLETTER);

  const paid = orders.filter((o) => o.status !== 'გაუქმებული');
  const revenue = round2(paid.reduce((s, o) => s + o.total, 0));
  const todayKey = new Date().toISOString().slice(0, 10);

  const salesByDay = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const dayOrders = paid.filter((o) => o.createdAt.slice(0, 10) === day);
    salesByDay.push({ date: day, total: round2(dayOrders.reduce((s, o) => s + o.total, 0)), count: dayOrders.length });
  }

  const statusCounts = ORDER_STATUSES.map((status) => ({ status, count: orders.filter((o) => o.status === status).length }));

  const soldMap = new Map();
  paid.forEach((o) => o.items.forEach((it) => {
    const cur = soldMap.get(it.productId) || { name: it.name, quantity: 0, revenue: 0 };
    cur.quantity += it.quantity;
    cur.revenue = round2(cur.revenue + it.price * it.quantity);
    soldMap.set(it.productId, cur);
  }));
  const topProducts = [...soldMap.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6);

  return {
    counts: {
      products: products.length,
      hiddenProducts: products.filter((p) => p.hidden).length,
      orders: orders.length,
      users: users.filter((u) => u.role !== 'admin').length,
      newsletter: newsletter.length,
      todayOrders: orders.filter((o) => o.createdAt.slice(0, 10) === todayKey).length,
    },
    revenue,
    averageOrder: paid.length ? round2(revenue / paid.length) : 0,
    salesByDay,
    statusCounts,
    topProducts,
    lowStock: products.filter((p) => p.stock <= 10).sort((a, b) => a.stock - b.stock).slice(0, 8)
      .map((p) => ({ id: p.id, name: p.name, stock: p.stock, slug: p.slug })),
    recentOrders: [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
  };
}
