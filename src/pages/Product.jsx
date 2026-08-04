import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingCart, Minus, Plus, Truck, RotateCcw, ShieldCheck, Zap,
  GitCompareArrows, PackageX, ShieldAlert, ZoomIn,
} from 'lucide-react';
import { api } from '../api/client';
import { useAsync, useReveal } from '../hooks';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useShop } from '../context/ShopContext';
import { ProductGrid } from '../components/product/ProductGrid';
import { SafeImage, Stars, PageLoader, EmptyState, Avatar } from '../components/ui/Primitives';
import { Breadcrumbs, ShareButton, AgeGate } from '../components/ui/Widgets';
import { formatPrice, formatDate, stockInfo } from '../utils/format';

const TABS = [
  { id: 'description', label: 'აღწერა' },
  { id: 'details', label: 'დეტალები' },
  { id: 'shipping', label: 'მიწოდება' },
  { id: 'reviews', label: 'შეფასებები' },
];

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const revealRef = useReveal();
  const [activeImage, setActiveImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');
  const [ageOpen, setAgeOpen] = useState(false);
  const [ageOk, setAgeOk] = useState(false);

  const cart = useCart();
  const favorites = useFavorites();
  const { settings, pushRecent, toggleCompare, inCompare } = useShop();

  const { data, loading, error } = useAsync((signal) => api.product(slug, signal), [slug]);
  const product = data?.product;

  useEffect(() => { setActiveImage(0); setQty(1); setTab('description'); setZoomed(false); }, [slug]);

  useEffect(() => {
    if (!product) return;
    pushRecent(product);
    if (product.ageRestricted && !ageOk) setAgeOpen(true);
  }, [product, pushRecent, ageOk]);

  if (loading) return <div className="container"><PageLoader label="პროდუქტი იტვირთება…" /></div>;

  if (error || !product) {
    return (
      <div className="container">
        <EmptyState icon={PackageX} title="პროდუქტი ვერ მოიძებნა" description={error || 'შესაძლოა ბმული მოძველებულია ან ნივთი წაიშალა.'}>
          <Link to="/catalog" className="btn btn-primary">ყველა პროდუქტის ნახვა</Link>
        </EmptyState>
      </div>
    );
  }

  const stock = stockInfo(product.stock);
  const isFavorite = favorites.has(product.id);
  const reviews = data.reviews || [];

  const buyNow = () => {
    if (cart.add(product, qty)) navigate('/checkout');
  };

  return (
    <div className="container" ref={revealRef}>
      <AgeGate
        open={ageOpen}
        onConfirm={() => { setAgeOk(true); setAgeOpen(false); }}
        onCancel={() => navigate('/catalog')}
      />

      <Breadcrumbs items={[
        { label: 'კატალოგი', to: '/catalog' },
        { label: product.universe, to: `/catalog?universe=${encodeURIComponent(product.universe)}` },
        { label: product.name },
      ]} />

      <div className="product-layout mb-20">
        {/* ─── გალერეა ─── */}
        <div>
          <div
            className={`gallery-main${zoomed ? ' is-zoomed' : ''}`}
            onClick={() => setZoomed((v) => !v)}
            onMouseMove={(e) => {
              if (!zoomed) return;
              const r = e.currentTarget.getBoundingClientRect();
              const img = e.currentTarget.querySelector('img');
              if (img) img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
            }}
            onMouseLeave={() => setZoomed(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setZoomed((v) => !v)}
            aria-label="სურათის გადიდება"
          >
            <SafeImage src={product.images?.[activeImage]} alt={product.name} />
            {!zoomed && (
              <span className="badge" style={{ position: 'absolute', bottom: 12, right: 12 }}>
                <ZoomIn size={12} /> გადიდება
              </span>
            )}
            <div className="pc-badges">
              {product.onSale && <span className="badge badge-sale">−{product.discount}%</span>}
              {product.newArrival && <span className="badge badge-new">ახალი</span>}
              {product.ageRestricted && <span className="badge badge-18"><ShieldAlert size={11} /> 18+</span>}
            </div>
          </div>

          <div className="gallery-thumbs">
            {(product.images || []).map((src, i) => (
              <button
                key={src}
                className={`gallery-thumb${i === activeImage ? ' is-active' : ''}`}
                onClick={() => setActiveImage(i)}
                aria-label={`სურათი ${i + 1}`}
              >
                <SafeImage src={src} alt="" />
              </button>
            ))}
          </div>
        </div>

        {/* ─── ინფორმაცია ─── */}
        <div>
          <Link to={`/catalog?universe=${encodeURIComponent(product.universe)}`} className="pc-universe">
            {product.universe}
          </Link>
          <h1 className="product-title" style={{ marginBlock: '8px 12px' }}>{product.name}</h1>

          <div className="flex-center gap-14 mb-14 flex-wrap">
            <Stars value={product.rating} size={15} showValue count={product.reviewCount} />
            <span className="text-xs text-dim">·</span>
            <span className={`pc-stock ${stock.level}`}><span className="dot" /> {stock.label}</span>
          </div>

          <div className="flex-center gap-10 mb-20 flex-wrap">
            <span className="price price-lg">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="price-old" style={{ fontSize: '1.05rem' }}>{formatPrice(product.oldPrice)}</span>}
            {product.discount > 0 && <span className="badge badge-sale">დაზოგე {formatPrice(product.oldPrice - product.price)}</span>}
          </div>

          <p className="text-soft mb-20">{product.shortDescription}</p>

          <div className="chips mb-20">
            <Link to={`/catalog?category=${encodeURIComponent(product.category)}`} className="chip is-clickable">{product.category}</Link>
            <Link to={`/catalog?genre=${encodeURIComponent(product.genre)}`} className="chip is-clickable">{product.genre}</Link>
            {product.freeShipping && <span className="chip"><Truck size={12} /> უფასო მიწოდება</span>}
          </div>

          {product.stock > 0 ? (
            <>
              <div className="flex-center gap-10 mb-14 flex-wrap">
                <div className="qty-picker">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="რაოდენობის შემცირება"><Minus size={16} /></button>
                  <span className="qty-value">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={qty >= product.stock} aria-label="რაოდენობის გაზრდა"><Plus size={16} /></button>
                </div>
                <button className="btn btn-primary btn-lg" style={{ flex: 1, minWidth: 190 }} onClick={() => cart.add(product, qty)}>
                  <ShoppingCart size={17} /> კალათაში დამატება
                </button>
              </div>

              <div className="flex gap-8 mb-20 flex-wrap">
                <button className="btn btn-gold" style={{ flex: 1, minWidth: 150 }} onClick={buyNow}>
                  <Zap size={16} /> ახლავე ყიდვა
                </button>
                <button className={`icon-btn${isFavorite ? ' is-active' : ''}`} onClick={() => favorites.toggle(product)} aria-label="რჩეულებში დამატება">
                  <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button className={`icon-btn${inCompare(product.id) ? ' is-active' : ''}`} onClick={() => toggleCompare(product)} aria-label="შედარებაში დამატება">
                  <GitCompareArrows size={18} />
                </button>
                <ShareButton className="icon-btn" compact title={product.name} text={product.shortDescription} />
              </div>
            </>
          ) : (
            <div className="panel panel-pad mb-20 flex-center gap-10">
              <PackageX size={20} style={{ color: 'var(--danger)' }} />
              <div>
                <div className="fw-700">ამჟამად არ არის მარაგში</div>
                <div className="text-xs text-muted">დაამატე რჩეულებში და შეგატყობინებთ, როცა შემოვა.</div>
              </div>
              <button className={`icon-btn ml-auto${isFavorite ? ' is-active' : ''}`} onClick={() => favorites.toggle(product)} aria-label="რჩეულებში დამატება">
                <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}

          <div className="panel panel-pad">
            <div className="info-row">
              <Truck size={17} />
              <span>მიწოდება {formatPrice(settings.shippingFee)} — უფასოა {formatPrice(settings.freeShippingThreshold)}-დან</span>
            </div>
            <div className="info-row"><RotateCcw size={17} /> <span>14 დღეში დაბრუნება ყოველგვარი ახსნის გარეშე</span></div>
            <div className="info-row"><ShieldCheck size={17} /> <span>ხარისხის შემოწმება გაგზავნამდე</span></div>
          </div>
        </div>
      </div>

      {/* ─── ტაბები ─── */}
      <div className="panel panel-pad mb-20">
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}{t.id === 'reviews' && ` (${reviews.length})`}
            </button>
          ))}
        </div>

        <div style={{ paddingTop: 20 }}>
          {tab === 'description' && <p className="text-soft" style={{ maxWidth: '78ch' }}>{product.description}</p>}

          {tab === 'details' && (
            <div className="spec-grid">
              {[
                ['სამყარო', product.universe], ['ჟანრი', product.genre], ['კატეგორია', product.category],
                ['მასალა', product.material], ['ზომა', product.size], ['ფერი', product.color],
                ['მარაგი', product.stock > 0 ? `${product.stock} ცალი` : 'არ არის'],
                ['კოდი', product.id.toUpperCase()],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="spec-item">
                  <div className="sp-l">{label}</div>
                  <div className="sp-v">{value}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'shipping' && (
            <div style={{ maxWidth: '72ch' }}>
              <div className="info-row"><Truck size={17} /> <span><b>თბილისი:</b> 1–2 სამუშაო დღე, {formatPrice(settings.shippingFee)}</span></div>
              <div className="info-row"><Truck size={17} /> <span><b>რეგიონები:</b> 2–4 სამუშაო დღე, {formatPrice(settings.shippingFee)}</span></div>
              <div className="info-row"><ShieldCheck size={17} /> <span><b>უფასო მიწოდება</b> {formatPrice(settings.freeShippingThreshold)}-ზე მეტი შეკვეთისას</span></div>
              <div className="info-row"><RotateCcw size={17} /> <span><b>დაბრუნება:</b> 14 დღე მიღებიდან, თუ ნივთი გამოუყენებელია და შენარჩუნებულია შეფუთვა</span></div>
              <p className="text-muted text-sm mt-14">
                თვითგატანა შესაძლებელია ჩვენი ოფისიდან: {settings.address}. შეკვეთის სტატუსს გამოგიგზავნით SMS-ით.
              </p>
            </div>
          )}

          {tab === 'reviews' && (
            reviews.length ? (
              <div>
                {reviews.map((r) => (
                  <div key={r.id} className="review-item">
                    <div className="flex-center gap-10 mb-8">
                      <Avatar name={r.author} size={34} />
                      <div>
                        <div className="fw-700 text-sm">{r.author}</div>
                        <div className="text-xs text-dim">{formatDate(r.createdAt)}</div>
                      </div>
                      <div className="ml-auto"><Stars value={r.rating} size={13} /></div>
                    </div>
                    <p className="text-soft text-sm">{r.text}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted">ამ პროდუქტს ჯერ შეფასება არ აქვს — გახდი პირველი!</p>
          )}
        </div>
      </div>

      {/* ─── ამავე სამყაროდან ─── */}
      {data.sameUniverse?.length > 0 && (
        <section className="section-tight">
          <div className="section-head">
            <h2 className="section-title" style={{ fontSize: '1.4rem' }}>ამავე სამყაროდან</h2>
            <Link to={`/catalog?universe=${encodeURIComponent(product.universe)}`} className="btn btn-ghost btn-sm">ყველას ნახვა</Link>
          </div>
          <ProductGrid products={data.sameUniverse.slice(0, 4)} />
        </section>
      )}

      {/* ─── მსგავსი პროდუქტები ─── */}
      {data.similar?.length > 0 && (
        <section className="section-tight">
          <div className="section-head">
            <h2 className="section-title" style={{ fontSize: '1.4rem' }}>მსგავსი პროდუქტები</h2>
          </div>
          <ProductGrid products={data.similar.slice(0, 4)} />
        </section>
      )}
    </div>
  );
}
