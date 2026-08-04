import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, MapPin, LogOut, Save, AlertCircle, LayoutDashboard, Heart } from 'lucide-react';
import { api } from '../api/client';
import { useAsync } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import { Avatar, SafeImage, EmptyState, Spinner } from '../components/ui/Primitives';
import { Breadcrumbs } from '../components/ui/Widgets';
import { formatPrice, formatDate } from '../utils/format';

const STATUS_CLASS = {
  'ახალი': 'badge',
  'დამუშავებაში': 'badge badge-gold',
  'გაგზავნილი': 'badge',
  'მიწოდებული': 'badge badge-new',
  'გაუქმებული': 'badge badge-danger',
};

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const favorites = useFavorites();
  const toast = useToast();
  const [tab, setTab] = useState('orders');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    phone: user?.phone || '', city: user?.city || '', address: user?.address || '',
  });

  const orders = useAsync(() => api.myOrders(), []);

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      setErrors({});
    } catch (err) {
      setErrors(err.errors || {});
      toast.error('შენახვა ვერ მოხერხდა', err.message);
    } finally {
      setSaving(false);
    }
  };

  const err = (key) => (errors[key] ? <span className="error-text"><AlertCircle size={12} /> {errors[key]}</span> : null);

  return (
    <div className="container">
      <Breadcrumbs items={[{ label: 'ჩემი პროფილი' }]} />

      <div className="panel panel-pad mb-20 flex-center gap-14 flex-wrap">
        <Avatar name={`${user.firstName} ${user.lastName}`} size={58} />
        <div>
          <h1 style={{ fontSize: '1.3rem' }}>{user.firstName} {user.lastName}</h1>
          <p className="text-muted text-sm">{user.email}</p>
          <p className="text-xs text-dim">რეგისტრირებულია {formatDate(user.createdAt)}</p>
        </div>
        <div className="ml-auto flex gap-8 flex-wrap">
          {user.role === 'admin' && (
            <Link to="/admin" className="btn btn-outline btn-sm"><LayoutDashboard size={15} /> ადმინ პანელი</Link>
          )}
          <Link to="/favorites" className="btn btn-ghost btn-sm"><Heart size={15} /> რჩეულები ({favorites.count})</Link>
          <button className="btn btn-ghost btn-sm" onClick={logout}><LogOut size={15} /> გამოსვლა</button>
        </div>
      </div>

      <div className="tabs mb-20">
        <button className={`tab${tab === 'orders' ? ' is-active' : ''}`} onClick={() => setTab('orders')}>
          <Package size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
          შეკვეთების ისტორია
        </button>
        <button className={`tab${tab === 'profile' ? ' is-active' : ''}`} onClick={() => setTab('profile')}>
          <User size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
          პირადი მონაცემები
        </button>
      </div>

      {tab === 'orders' && (
        orders.loading ? <div className="page-loader"><Spinner large /></div>
          : orders.data?.length ? (
            <div className="flex" style={{ flexDirection: 'column', gap: 14 }}>
              {orders.data.map((order) => (
                <div key={order.id} className="panel panel-pad">
                  <div className="flex-between flex-wrap gap-10 mb-14">
                    <div>
                      <div className="fw-700">{order.id}</div>
                      <div className="text-xs text-dim">{formatDate(order.createdAt)} · {order.paymentMethod}</div>
                    </div>
                    <div className="flex-center gap-10">
                      <span className={STATUS_CLASS[order.status] || 'badge'}>{order.status}</span>
                      <span className="fw-700">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  <div className="flex gap-8 flex-wrap">
                    {order.items.map((item) => (
                      <Link key={item.productId} to={`/product/${item.slug}`} className="relative" title={item.name}>
                        <SafeImage src={item.image} alt={item.name} style={{ width: 54, height: 54, borderRadius: 10, objectFit: 'cover' }} />
                        <span className="count-badge" style={{ top: -5, right: -5 }}>{item.quantity}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Package} title="შეკვეთები ჯერ არ გაქვს" description="როცა პირველ შეკვეთას გააფორმებ, აქ გამოჩნდება.">
              <Link to="/catalog" className="btn btn-primary">კატალოგის ნახვა</Link>
            </EmptyState>
          )
      )}

      {tab === 'profile' && (
        <form className="panel panel-pad" onSubmit={save} style={{ maxWidth: 640 }}>
          <div className="form-grid">
            <div className="field">
              <label className="label" htmlFor="firstName">სახელი</label>
              <input id="firstName" className={`input${errors.firstName ? ' has-error' : ''}`} value={form.firstName} onChange={set('firstName')} />
              {err('firstName')}
            </div>
            <div className="field">
              <label className="label" htmlFor="lastName">გვარი</label>
              <input id="lastName" className={`input${errors.lastName ? ' has-error' : ''}`} value={form.lastName} onChange={set('lastName')} />
              {err('lastName')}
            </div>
            <div className="field">
              <label className="label" htmlFor="phone">ტელეფონი</label>
              <input id="phone" className={`input${errors.phone ? ' has-error' : ''}`} value={form.phone} onChange={set('phone')} placeholder="+995 5XX XX XX XX" />
              {err('phone')}
            </div>
            <div className="field">
              <label className="label" htmlFor="city">ქალაქი</label>
              <input id="city" className="input" value={form.city} onChange={set('city')} />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="address"><MapPin size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} /> შენახული მისამართი</label>
            <input id="address" className="input" value={form.address} onChange={set('address')} placeholder="ქუჩა, კორპუსი, ბინა" />
            <p className="hint">ეს მისამართი ავტომატურად შეივსება შეკვეთის გაფორმებისას.</p>
          </div>

          <button className="btn btn-primary mt-14" type="submit" disabled={saving}>
            {saving ? <Spinner /> : <Save size={16} />} შენახვა
          </button>
        </form>
      )}
    </div>
  );
}
