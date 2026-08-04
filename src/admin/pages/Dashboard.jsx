import { Link } from 'react-router-dom';
import {
  Package, ShoppingCart, Users, Wallet, TrendingUp, AlertTriangle, Mail, CalendarClock,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAsync } from '../../hooks';
import { AreaChart, DonutChart, BarList } from '../components/Charts';
import { PageLoader, EmptyState } from '../../components/ui/Primitives';
import { formatPrice, formatDate } from '../../utils/format';

const STATUS_COLORS = {
  'ახალი': '#a78bfa',
  'დამუშავებაში': '#fbbf24',
  'გაგზავნილი': '#60a5fa',
  'მიწოდებული': '#34d399',
  'გაუქმებული': '#f87171',
};

function StatCard({ icon: Icon, value, label, color = '#8b5cf6' }) {
  return (
    <div className="stat-card">
      <span className="s-blob" style={{ background: color }} />
      <span className="s-icon" style={{ color }}><Icon size={18} /></span>
      <div className="s-value">{value}</div>
      <div className="s-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error } = useAsync(() => api.admin.stats(), []);

  if (loading) return <PageLoader label="სტატისტიკა იტვირთება…" />;
  if (error || !data) {
    return <EmptyState icon={AlertTriangle} title="მონაცემები ვერ ჩაიტვირთა" description={error} />;
  }

  const { counts, revenue, averageOrder, salesByDay, statusCounts, topProducts, lowStock, recentOrders } = data;

  return (
    <div>
      <div className="stat-grid mb-20">
        <StatCard icon={Wallet} value={formatPrice(revenue)} label="საერთო შემოსავალი" color="#34d399" />
        <StatCard icon={ShoppingCart} value={counts.orders} label="სულ შეკვეთა" color="#a78bfa" />
        <StatCard icon={CalendarClock} value={counts.todayOrders} label="დღევანდელი შეკვეთები" color="#60a5fa" />
        <StatCard icon={Package} value={counts.products} label="პროდუქტი კატალოგში" color="#f0abfc" />
        <StatCard icon={Users} value={counts.users} label="რეგისტრირებული მომხმარებელი" color="#fbbf24" />
        <StatCard icon={Mail} value={counts.newsletter} label="Newsletter გამომწერი" color="#f87171" />
      </div>

      <div className="grid mb-20" style={{ gap: 16, gridTemplateColumns: 'minmax(0, 1.55fr) minmax(0, 1fr)' }}>
        <div className="chart-card">
          <div className="chart-title">გაყიდვები — ბოლო 14 დღე</div>
          <div className="chart-sub">საშუალო შეკვეთა: {formatPrice(averageOrder)}</div>
          <AreaChart data={salesByDay} formatValue={formatPrice} />
        </div>

        <div className="chart-card">
          <div className="chart-title">შეკვეთების სტატუსები</div>
          <div className="chart-sub">მიმდინარე განაწილება</div>
          <DonutChart data={statusCounts.map((s) => ({ label: s.status, value: s.count, color: STATUS_COLORS[s.status] }))} />
        </div>
      </div>

      <div className="grid mb-20" style={{ gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="chart-card">
          <div className="chart-title"><TrendingUp size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} /> პოპულარული პროდუქტები</div>
          <div className="chart-sub">გაყიდული რაოდენობით</div>
          <BarList data={topProducts.map((p) => ({ label: p.name, value: p.quantity }))} formatValue={(v) => `${v} ც.`} />
        </div>

        <div className="chart-card">
          <div className="chart-title"><AlertTriangle size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6, color: 'var(--warning)' }} /> დაბალი მარაგი</div>
          <div className="chart-sub">10 ცალზე ნაკლები</div>
          <div className="flex" style={{ flexDirection: 'column', gap: 8 }}>
            {lowStock.map((p) => (
              <Link key={p.id} to="/admin/products" className="flex-between text-sm" style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,.03)' }}>
                <span className="truncate" style={{ maxWidth: '72%' }}>{p.name}</span>
                <span className={`badge ${p.stock <= 5 ? 'badge-danger' : 'badge-gold'}`}>{p.stock} ც.</span>
              </Link>
            ))}
            {!lowStock.length && <p className="text-muted text-sm">ყველა პროდუქტს საკმარისი მარაგი აქვს 👌</p>}
          </div>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }} className="flex-between">
          <b>ბოლო შეკვეთები</b>
          <Link to="/admin/orders" className="btn btn-ghost btn-sm">ყველას ნახვა</Link>
        </div>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ნომერი</th><th>მომხმარებელი</th><th>თარიღი</th><th>თანხა</th><th>სტატუსი</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="fw-700">{o.id}</td>
                  <td>{o.customer.firstName} {o.customer.lastName}</td>
                  <td className="text-dim">{formatDate(o.createdAt)}</td>
                  <td className="fw-700">{formatPrice(o.total)}</td>
                  <td>
                    <span className="badge" style={{ background: `${STATUS_COLORS[o.status]}22`, borderColor: `${STATUS_COLORS[o.status]}55`, color: STATUS_COLORS[o.status] }}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
