import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Check, Package, Truck, Phone, Mail, MapPin, Home } from 'lucide-react';
import { api } from '../api/client';
import { SafeImage, PageLoader, EmptyState } from '../components/ui/Primitives';
import { formatPrice, formatDateTime } from '../utils/format';

export default function OrderSuccess() {
  const { id } = useParams();
  const { state } = useLocation();
  const [order, setOrder] = useState(state?.order || null);
  const [loading, setLoading] = useState(!state?.order);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) return;
    api.order(id).then(setOrder).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [id, order]);

  if (loading) return <div className="container"><PageLoader label="შეკვეთა იტვირთება…" /></div>;

  if (error || !order) {
    return (
      <div className="container">
        <EmptyState icon={Package} title="შეკვეთა ვერ მოიძებნა" description={error}>
          <Link to="/" className="btn btn-primary">მთავარ გვერდზე დაბრუნება</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <div className="text-center" style={{ paddingBlock: 40 }}>
        <div className="success-mark"><Check size={46} strokeWidth={3} /></div>
        <h1 className="section-title">შეკვეთა წარმატებით გაფორმდა!</h1>
        <p className="text-muted mt-8">გმადლობთ ნდობისთვის — მალე დაგიკავშირდებით დასადასტურებლად.</p>
        <div className="mt-20">
          <div className="text-xs text-dim mb-8">თქვენი შეკვეთის ნომერია</div>
          <div className="order-code">{order.id}</div>
        </div>
      </div>

      <div className="panel panel-pad mb-20">
        <h3 style={{ fontSize: '1.02rem', marginBottom: 14 }}>შეკვეთის დეტალები</h3>

        {order.items.map((item) => (
          <div key={item.productId} className="flex-center gap-12" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <SafeImage src={item.image} alt="" style={{ width: 54, height: 54, borderRadius: 10, objectFit: 'cover' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link to={`/product/${item.slug}`} className="fw-600 text-sm truncate" style={{ display: 'block' }}>{item.name}</Link>
              <span className="text-xs text-muted">{item.quantity} × {formatPrice(item.price)}</span>
            </div>
            <span className="fw-700 text-sm">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}

        <div style={{ marginTop: 14 }}>
          <div className="summary-line"><span>პროდუქტები</span><span>{formatPrice(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="summary-line"><span>ფასდაკლება ({order.promoCode})</span><span className="discount-val">−{formatPrice(order.discount)}</span></div>}
          <div className="summary-line"><span>მიწოდება</span><span>{order.shipping === 0 ? <span className="discount-val">უფასო</span> : formatPrice(order.shipping)}</span></div>
          <div className="summary-line total"><span>სულ</span><span>{formatPrice(order.total)}</span></div>
        </div>
      </div>

      <div className="grid mb-20" style={{ gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <div className="panel panel-pad">
          <h3 style={{ fontSize: '0.95rem', marginBottom: 12 }}>მიმღები</h3>
          <div className="footer-contact">
            <div><Package size={15} /> {order.customer.firstName} {order.customer.lastName}</div>
            <div><Phone size={15} /> {order.customer.phone}</div>
            <div><Mail size={15} /> {order.customer.email}</div>
            <div><MapPin size={15} /> {order.customer.city}, {order.customer.address}</div>
          </div>
        </div>

        <div className="panel panel-pad">
          <h3 style={{ fontSize: '0.95rem', marginBottom: 12 }}>მიწოდება და გადახდა</h3>
          <div className="footer-contact">
            <div><Truck size={15} /> {order.shippingMethod}</div>
            <div><Check size={15} /> {order.paymentMethod}</div>
            <div><Package size={15} /> სტატუსი: <span className="badge">{order.status}</span></div>
            <div className="text-xs text-dim">გაფორმდა: {formatDateTime(order.createdAt)}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-10 flex-wrap" style={{ justifyContent: 'center' }}>
        <Link to="/" className="btn btn-ghost"><Home size={16} /> მთავარი გვერდი</Link>
        <Link to="/catalog" className="btn btn-primary">შოპინგის გაგრძელება</Link>
      </div>
    </div>
  );
}
