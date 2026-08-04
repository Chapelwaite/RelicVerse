import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, Truck, X } from 'lucide-react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { SafeImage, EmptyState, Spinner } from '../components/ui/Primitives';
import { ConfirmDialog } from '../components/ui/Modal';
import { Breadcrumbs } from '../components/ui/Widgets';
import { formatPrice } from '../utils/format';

export default function Cart() {
  const cart = useCart();
  const { settings, recent } = useShop();
  const toast = useToast();
  const [promoInput, setPromoInput] = useState('');
  const [checking, setChecking] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [removeId, setRemoveId] = useState(null);

  const afterDiscount = Math.max(0, cart.subtotal - cart.discount);
  const shipping = cart.items.length === 0 || afterDiscount >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const total = Math.round((afterDiscount + shipping) * 100) / 100;
  const toFreeShipping = Math.max(0, settings.freeShippingThreshold - afterDiscount);

  const applyPromo = async (e) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setChecking(true);
    try {
      const res = await api.validatePromo(code, cart.subtotal);
      const promos = { code: res.code, type: res.type, value: res.value, minTotal: 0 };
      cart.setPromo(promos);
      setPromoInput('');
      toast.success('პრომოკოდი წარმატებით გააქტიურდა', res.description);
    } catch (err) {
      toast.error('პრომოკოდი არ გააქტიურდა', err.message);
    } finally {
      setChecking(false);
    }
  };

  if (!cart.items.length) {
    return (
      <div className="container">
        <Breadcrumbs items={[{ label: 'კალათა' }]} />
        <EmptyState
          icon={ShoppingBag}
          title="შენი კალათა ცარიელია"
          description="დაათვალიერე კატალოგი და აღმოაჩინე ნივთები საყვარელი სამყაროებიდან."
        >
          <Link to="/catalog" className="btn btn-primary">კატალოგის ნახვა</Link>
          <Link to="/collections" className="btn btn-ghost">კოლექციები</Link>
        </EmptyState>

        {recent.length > 0 && (
          <section className="section-tight">
            <h2 className="section-title" style={{ fontSize: '1.3rem', marginBottom: 16 }}>ბოლოს ნანახი</h2>
            <div className="grid" style={{ gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
              {recent.map((p) => (
                <Link key={p.id} to={`/product/${p.slug}`} className="mini-card">
                  <SafeImage src={p.image} alt={p.name} />
                  <div style={{ minWidth: 0 }}>
                    <div className="pc-universe">{p.universe}</div>
                    <div className="fw-600 text-sm line-2">{p.name}</div>
                    <div className="price" style={{ fontSize: '0.95rem' }}>{formatPrice(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <Breadcrumbs items={[{ label: 'კალათა' }]} />

      <div className="flex-between mb-20 flex-wrap gap-10">
        <h1 className="section-title">კალათა <span className="text-muted" style={{ fontSize: '1rem' }}>({cart.count} ნივთი)</span></h1>
        <button className="btn btn-ghost btn-sm" onClick={() => setConfirmClear(true)}>
          <Trash2 size={14} /> კალათის გასუფთავება
        </button>
      </div>

      <div className="cart-layout">
        <div className="flex" style={{ flexDirection: 'column', gap: 12 }}>
          {cart.items.map((item) => (
            <div key={item.id} className="cart-row">
              <Link to={`/product/${item.slug}`}>
                <SafeImage src={item.image} alt={item.name} />
              </Link>

              <div style={{ minWidth: 0 }}>
                <div className="pc-universe">{item.universe}</div>
                <Link to={`/product/${item.slug}`} className="fw-700 line-2" style={{ display: 'block', marginBlock: 2 }}>
                  {item.name}
                </Link>
                <div className="flex-center gap-8">
                  <span className="price" style={{ fontSize: '1rem' }}>{formatPrice(item.price)}</span>
                  {item.oldPrice && <span className="price-old" style={{ marginLeft: 0 }}>{formatPrice(item.oldPrice)}</span>}
                </div>
              </div>

              <div className="cart-row-end flex-center gap-14">
                <div className="qty-picker" style={{ transform: 'scale(.88)' }}>
                  <button onClick={() => cart.setQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="შემცირება"><Minus size={15} /></button>
                  <span className="qty-value">{item.quantity}</span>
                  <button onClick={() => cart.setQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= (item.stock ?? 20)} aria-label="გაზრდა"><Plus size={15} /></button>
                </div>
                <div style={{ textAlign: 'right', minWidth: 82 }}>
                  <div className="fw-700">{formatPrice(item.price * item.quantity)}</div>
                </div>
                <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => setRemoveId(item.id)} aria-label="წაშლა">
                  <X size={15} />
                </button>
              </div>
            </div>
          ))}

          <Link to="/catalog" className="btn btn-ghost" style={{ width: 'fit-content', marginTop: 6 }}>
            ← შოპინგის გაგრძელება
          </Link>
        </div>

        {/* ─── ჯამი ─── */}
        <aside className="panel panel-pad" style={{ position: 'sticky', top: 'calc(var(--header-h) + 14px)' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: 14 }}>შეკვეთის ჯამი</h3>

          <form className="promo-row mb-20" onSubmit={applyPromo}>
            <input
              className="input"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="პრომოკოდი"
              aria-label="პრომოკოდი"
            />
            <button className="btn btn-outline" type="submit" disabled={checking || !promoInput.trim()}>
              {checking ? <Spinner /> : <Tag size={15} />}
            </button>
          </form>

          {cart.promo && (
            <div className="chip mb-14" style={{ width: 'fit-content' }}>
              <Tag size={12} /> {cart.promo.code}
              <button onClick={() => { cart.setPromo(null); toast.info('პრომოკოდი მოიხსნა'); }} aria-label="პრომოკოდის მოხსნა"><X size={12} /></button>
            </div>
          )}

          <div className="summary-line"><span>პროდუქტები ({cart.count})</span><span>{formatPrice(cart.subtotal)}</span></div>
          {cart.discount > 0 && (
            <div className="summary-line"><span>ფასდაკლება</span><span className="discount-val">−{formatPrice(cart.discount)}</span></div>
          )}
          <div className="summary-line">
            <span>მიწოდება</span>
            <span>{shipping === 0 ? <span className="discount-val">უფასო</span> : formatPrice(shipping)}</span>
          </div>

          {toFreeShipping > 0 && (
            <div className="text-xs text-muted flex-center gap-6 mt-8" style={{ padding: '10px 12px', borderRadius: 'var(--r-sm)', background: 'rgba(139,92,246,.1)' }}>
              <Truck size={14} />
              დაამატე კიდევ <b style={{ color: 'var(--violet-200)' }}>{formatPrice(toFreeShipping)}</b> და მიწოდება უფასო იქნება
            </div>
          )}

          <div className="summary-line total"><span>სულ გადასახდელი</span><span>{formatPrice(total)}</span></div>

          <Link to="/checkout" className="btn btn-primary btn-block btn-lg mt-20">
            შეკვეთის გაფორმება <ArrowRight size={17} />
          </Link>
          <p className="text-xs text-dim text-center mt-14">გადახდა ხდება მიწოდებისას ან დემო ბარათით</p>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => cart.clear()}
        title="კალათის გასუფთავება"
        message="ნამდვილად გსურთ ყველა პროდუქტის წაშლა კალათიდან? ამ მოქმედების გაუქმება ვერ მოხერხდება."
        confirmLabel="დიახ, გაასუფთავე"
      />

      <ConfirmDialog
        open={Boolean(removeId)}
        onClose={() => setRemoveId(null)}
        onConfirm={() => cart.remove(removeId)}
        title="პროდუქტის წაშლა"
        message="ნამდვილად გსურთ ამ პროდუქტის წაშლა კალათიდან?"
        confirmLabel="წაშლა"
      />
    </div>
  );
}
