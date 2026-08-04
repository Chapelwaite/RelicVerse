import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, Building2, Truck, Store, ShieldCheck, AlertCircle, ShoppingBag } from 'lucide-react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SafeImage, EmptyState, Spinner } from '../components/ui/Primitives';
import { Breadcrumbs } from '../components/ui/Widgets';
import { formatPrice } from '../utils/format';

const SHIPPING_METHODS = [
  { id: 'კურიერი', label: 'კურიერით მიწოდება', desc: 'თბილისი 1–2 დღე, რეგიონები 2–4 დღე', icon: Truck },
  { id: 'თვითგატანა', label: 'თვითგატანა ოფისიდან', desc: 'უფასო — ჭავჭავაძის გამზირი 47', icon: Store },
];

const PAYMENT_METHODS = [
  { id: 'ნაღდი კურიერთან', label: 'ნაღდი ანგარიშსწორება კურიერთან', desc: 'გადაიხადე ნივთის მიღებისას', icon: Banknote },
  { id: 'ბარათი (დემო)', label: 'საბანკო ბარათი — დემო რეჟიმი', desc: 'რეალური გადახდა არ ხდება', icon: CreditCard },
  { id: 'საბანკო გადარიცხვა', label: 'საბანკო გადარიცხვა', desc: 'ანგარიშს გამოგიგზავნით ელფოსტაზე', icon: Building2 },
];

const EMPTY_FORM = {
  firstName: '', lastName: '', phone: '', email: '',
  city: 'თბილისი', address: '', note: '',
  shippingMethod: 'კურიერი', paymentMethod: 'ნაღდი კურიერთან',
  cardNumber: '', cardName: '', cardExpiry: '', cardCvc: '',
};

export default function Checkout() {
  const cart = useCart();
  const { settings } = useShop();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    city: user?.city || 'თბილისი',
    address: user?.address || '',
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const afterDiscount = Math.max(0, cart.subtotal - cart.discount);
  const shipping = form.shippingMethod === 'თვითგატანა' || afterDiscount >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const total = Math.round((afterDiscount + shipping) * 100) / 100;

  /** კლიენტის მხარეს ვალიდაცია — სერვერზეც მეორდება */
  const validate = () => {
    const e = {};
    if (form.firstName.trim().length < 2) e.firstName = 'სახელი სავალდებულოა';
    if (form.lastName.trim().length < 2) e.lastName = 'გვარი სავალდებულოა';
    if (!/^[+0-9()\s-]{9,20}$/.test(form.phone.trim())) e.phone = 'ტელეფონის ფორმატი არასწორია';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = 'ელფოსტის ფორმატი არასწორია';
    if (form.city.trim().length < 2) e.city = 'ქალაქი სავალდებულოა';
    if (form.address.trim().length < 5) e.address = 'მიუთითეთ სრული მისამართი';
    if (form.paymentMethod === 'ბარათი (დემო)') {
      if (form.cardNumber.replace(/\s/g, '').length < 12) e.cardNumber = 'შეიყვანეთ ბარათის ნომერი (დემო)';
      if (!form.cardName.trim()) e.cardName = 'მიუთითეთ ბარათზე დატანილი სახელი';
      if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry)) e.cardExpiry = 'ფორმატი: MM/YY';
      if (!/^\d{3,4}$/.test(form.cardCvc)) e.cardCvc = 'CVC 3 ციფრი';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('შეავსეთ ველები სწორად');
      document.querySelector('.has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createOrder({
        firstName: form.firstName, lastName: form.lastName, phone: form.phone, email: form.email,
        city: form.city, address: form.address, note: form.note,
        shippingMethod: form.shippingMethod, paymentMethod: form.paymentMethod,
        promoCode: cart.promo?.code || null,
        items: cart.items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      });
      cart.clear(true);
      toast.success('შეკვეთა წარმატებით გაფორმდა', `ნომერი: ${res.order.id}`);
      navigate(`/order-success/${res.order.id}`, { state: { order: res.order } });
    } catch (err) {
      setErrors(err.errors || {});
      toast.error('შეკვეთა ვერ გაფორმდა', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.items.length) {
    return (
      <div className="container">
        <Breadcrumbs items={[{ label: 'შეკვეთის გაფორმება' }]} />
        <EmptyState icon={ShoppingBag} title="კალათა ცარიელია" description="შეკვეთის გასაფორმებლად ჯერ დაამატე პროდუქტები.">
          <Link to="/catalog" className="btn btn-primary">კატალოგის ნახვა</Link>
        </EmptyState>
      </div>
    );
  }

  const err = (key) => (errors[key] ? <span className="error-text"><AlertCircle size={12} /> {errors[key]}</span> : null);
  const cls = (key) => `input${errors[key] ? ' has-error' : ''}`;

  return (
    <div className="container">
      <Breadcrumbs items={[{ label: 'კალათა', to: '/cart' }, { label: 'შეკვეთის გაფორმება' }]} />
      <h1 className="section-title mb-20">შეკვეთის გაფორმება</h1>

      <div className="steps">
        <span className="step"><span className="n">1</span> კალათა</span>
        <span className="bar" />
        <span className="step is-active"><span className="n">2</span> მონაცემები</span>
        <span className="bar" />
        <span className="step"><span className="n">3</span> დადასტურება</span>
      </div>

      <form className="checkout-layout" onSubmit={submit} noValidate>
        <div className="flex" style={{ flexDirection: 'column', gap: 18 }}>
          {/* საკონტაქტო ინფორმაცია */}
          <section className="panel panel-pad">
            <h3 style={{ fontSize: '1.02rem', marginBottom: 16 }}>საკონტაქტო ინფორმაცია</h3>
            <div className="form-grid">
              <div className="field">
                <label className="label" htmlFor="firstName">სახელი <span className="req">*</span></label>
                <input id="firstName" className={cls('firstName')} value={form.firstName} onChange={set('firstName')} autoComplete="given-name" />
                {err('firstName')}
              </div>
              <div className="field">
                <label className="label" htmlFor="lastName">გვარი <span className="req">*</span></label>
                <input id="lastName" className={cls('lastName')} value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
                {err('lastName')}
              </div>
              <div className="field">
                <label className="label" htmlFor="phone">ტელეფონი <span className="req">*</span></label>
                <input id="phone" className={cls('phone')} value={form.phone} onChange={set('phone')} placeholder="+995 5XX XX XX XX" autoComplete="tel" />
                {err('phone')}
              </div>
              <div className="field">
                <label className="label" htmlFor="email">ელფოსტა <span className="req">*</span></label>
                <input id="email" type="email" className={cls('email')} value={form.email} onChange={set('email')} autoComplete="email" />
                {err('email')}
              </div>
              <div className="field">
                <label className="label" htmlFor="city">ქალაქი <span className="req">*</span></label>
                <input id="city" className={cls('city')} value={form.city} onChange={set('city')} autoComplete="address-level2" />
                {err('city')}
              </div>
              <div className="field">
                <label className="label" htmlFor="address">მისამართი <span className="req">*</span></label>
                <input id="address" className={cls('address')} value={form.address} onChange={set('address')} placeholder="ქუჩა, კორპუსი, ბინა" autoComplete="street-address" />
                {err('address')}
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="note">დამატებითი ინფორმაცია</label>
              <textarea id="note" className="textarea" value={form.note} onChange={set('note')} placeholder="მაგ. სასურველი მიწოდების დრო ან სადარბაზოს კოდი" />
            </div>
          </section>

          {/* მიწოდების მეთოდი */}
          <section className="panel panel-pad">
            <h3 style={{ fontSize: '1.02rem', marginBottom: 16 }}>მიწოდების მეთოდი</h3>
            <div className="flex" style={{ flexDirection: 'column', gap: 10 }}>
              {SHIPPING_METHODS.map(({ id, label, desc, icon: Icon }) => (
                <label key={id} className={`radio-card${form.shippingMethod === id ? ' is-selected' : ''}`}>
                  <input type="radio" name="shippingMethod" value={id} checked={form.shippingMethod === id} onChange={set('shippingMethod')} />
                  <span className="dot" />
                  <Icon size={19} style={{ color: 'var(--violet-300)' }} />
                  <span>
                    <span className="fw-600" style={{ display: 'block' }}>{label}</span>
                    <span className="text-xs text-muted">{desc}</span>
                  </span>
                  <span className="ml-auto fw-700 text-sm">
                    {id === 'თვითგატანა' ? 'უფასო' : (afterDiscount >= settings.freeShippingThreshold ? 'უფასო' : formatPrice(settings.shippingFee))}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* გადახდის მეთოდი */}
          <section className="panel panel-pad">
            <h3 style={{ fontSize: '1.02rem', marginBottom: 16 }}>გადახდის მეთოდი</h3>
            <div className="flex" style={{ flexDirection: 'column', gap: 10 }}>
              {PAYMENT_METHODS.map(({ id, label, desc, icon: Icon }) => (
                <label key={id} className={`radio-card${form.paymentMethod === id ? ' is-selected' : ''}`}>
                  <input type="radio" name="paymentMethod" value={id} checked={form.paymentMethod === id} onChange={set('paymentMethod')} />
                  <span className="dot" />
                  <Icon size={19} style={{ color: 'var(--violet-300)' }} />
                  <span>
                    <span className="fw-600" style={{ display: 'block' }}>{label}</span>
                    <span className="text-xs text-muted">{desc}</span>
                  </span>
                </label>
              ))}
            </div>

            {form.paymentMethod === 'ბარათი (დემო)' && (
              <div className="mt-20 anim-fade-in">
                <div className="demo-card">
                  <div className="dc-chip" />
                  <div className="dc-number">{form.cardNumber || '•••• •••• •••• ••••'}</div>
                  <div className="dc-row">
                    <span>{form.cardName || 'ბარათის მფლობელი'}</span>
                    <span>{form.cardExpiry || 'MM/YY'}</span>
                  </div>
                </div>

                <p className="hint mb-14">
                  <ShieldCheck size={12} style={{ display: 'inline', verticalAlign: '-2px' }} /> დემო რეჟიმი — რეალური საბანკო მონაცემები არ იგზავნება და არ ინახება.
                </p>

                <div className="form-grid">
                  <div className="field">
                    <label className="label" htmlFor="cardNumber">ბარათის ნომერი</label>
                    <input
                      id="cardNumber"
                      className={cls('cardNumber')}
                      value={form.cardNumber}
                      inputMode="numeric"
                      placeholder="4444 5555 6666 7777"
                      onChange={(e) => setForm((f) => ({
                        ...f,
                        cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(),
                      }))}
                    />
                    {err('cardNumber')}
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="cardName">ბარათზე დატანილი სახელი</label>
                    <input id="cardName" className={cls('cardName')} value={form.cardName} onChange={set('cardName')} placeholder="GIORGI MAISURADZE" />
                    {err('cardName')}
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="cardExpiry">მოქმედების ვადა</label>
                    <input
                      id="cardExpiry"
                      className={cls('cardExpiry')}
                      value={form.cardExpiry}
                      placeholder="MM/YY"
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setForm((f) => ({ ...f, cardExpiry: digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits }));
                      }}
                    />
                    {err('cardExpiry')}
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="cardCvc">CVC</label>
                    <input
                      id="cardCvc"
                      className={cls('cardCvc')}
                      value={form.cardCvc}
                      inputMode="numeric"
                      placeholder="123"
                      onChange={(e) => setForm((f) => ({ ...f, cardCvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    />
                    {err('cardCvc')}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ─── შეკვეთის ჯამი ─── */}
        <aside className="panel panel-pad" style={{ position: 'sticky', top: 'calc(var(--header-h) + 14px)' }}>
          <h3 style={{ fontSize: '1.02rem', marginBottom: 14 }}>თქვენი შეკვეთა</h3>

          <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 14 }}>
            {cart.items.map((item) => (
              <div key={item.id} className="flex-center gap-10" style={{ padding: '8px 0' }}>
                <span className="relative" style={{ flexShrink: 0 }}>
                  <SafeImage src={item.image} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
                  <span className="count-badge" style={{ top: -6, right: -6 }}>{item.quantity}</span>
                </span>
                <span className="text-sm truncate" style={{ flex: 1, minWidth: 0 }}>{item.name}</span>
                <span className="fw-700 text-sm">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="summary-line"><span>პროდუქტები</span><span>{formatPrice(cart.subtotal)}</span></div>
          {cart.discount > 0 && (
            <div className="summary-line"><span>ფასდაკლება ({cart.promo?.code})</span><span className="discount-val">−{formatPrice(cart.discount)}</span></div>
          )}
          <div className="summary-line">
            <span>მიწოდება</span>
            <span>{shipping === 0 ? <span className="discount-val">უფასო</span> : formatPrice(shipping)}</span>
          </div>
          <div className="summary-line total"><span>სულ</span><span>{formatPrice(total)}</span></div>

          <button className="btn btn-primary btn-block btn-lg mt-20" type="submit" disabled={submitting}>
            {submitting ? <><Spinner /> მუშავდება…</> : 'შეკვეთის დადასტურება'}
          </button>
          <p className="text-xs text-dim text-center mt-14">
            დადასტურებით ეთანხმები RelicVerse-ის მომსახურების პირობებს.
          </p>
        </aside>
      </form>
    </div>
  );
}
