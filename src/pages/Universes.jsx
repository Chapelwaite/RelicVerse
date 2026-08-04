import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Compass, ArrowLeft, ShoppingCart, Sparkles, BookOpen } from 'lucide-react';
import { api } from '../api/client';
import { useAsync, useReveal } from '../hooks';
import { useShop } from '../context/ShopContext';
import { useCart } from '../context/CartContext';
import { UniverseCardV2 } from '../components/home/UniverseCardV2';
import { UNIVERSE_FILTERS, universeTheme, universeCssVars } from '../utils/universeThemes';
import { ProductGrid } from '../components/product/ProductGrid';
import { Breadcrumbs, AgeGate } from '../components/ui/Widgets';
import { SafeImage, EmptyState, Stars } from '../components/ui/Primitives';
import { formatPrice } from '../utils/format';

/* ═══════════════ ყველა სამყაროს სია ═══════════════ */
export function UniverseList() {
  const { universes } = useShop();
  const [filter, setFilter] = useState('all');
  const revealRef = useReveal();

  const visible = useMemo(() => universes
    .filter((u) => filter === 'all' || universeTheme(u.slug).tags.includes(filter))
    .sort((a, b) => (b.count || 0) - (a.count || 0)), [universes, filter]);

  return (
    <div className="container" ref={revealRef}>
      <Breadcrumbs items={[{ label: 'სამყაროები' }]} />
      <div className="mb-20">
        <span className="eyebrow"><Compass size={12} /> RelicVerse-ის რუკა</span>
        <h1 className="section-title">აირჩიე <span className="accent">სამყარო</span></h1>
        <p className="section-sub">შედი ისტორიაში, რომელმაც შენში რაღაც დატოვა.</p>
      </div>

      <div className="u-toolbar">
        <div className="u-filters" role="tablist" aria-label="ჟანრის ფილტრი">
          {UNIVERSE_FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              className={`u-filter${filter === f.id ? ' is-active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="u-count ml-auto">ნაპოვნია <b>{visible.length}</b> სამყარო</span>
      </div>

      <div className="u-grid" style={{ gridTemplateColumns: undefined }}>
        {visible.map((u) => <UniverseCardV2 key={u.slug} universe={u} />)}
      </div>
    </div>
  );
}

/* ═══════════════ ერთი სამყაროს გვერდი v2 ═══════════════ */
const PRICE_FILTERS = [
  { id: 'all', label: 'ნებისმიერი ფასი', min: 0, max: Infinity },
  { id: 'u30', label: '30 ₾-მდე', min: 0, max: 30 },
  { id: '30-70', label: '30 – 70 ₾', min: 30, max: 70 },
  { id: '70p', label: '70 ₾-ზე მეტი', min: 70, max: Infinity },
];

export default function UniverseDetail() {
  const { slug } = useParams();
  const revealRef = useReveal();
  const { universeBySlug, universes } = useShop();
  const cart = useCart();
  const universe = universeBySlug(slug);
  const theme = universeTheme(slug);
  const [ageOk, setAgeOk] = useState(false);
  const [category, setCategory] = useState('all');
  const [price, setPrice] = useState('all');

  const { data, loading } = useAsync(
    (signal) => (universe ? api.products({ universe: universe.name, limit: 60, sort: 'popular' }, signal) : Promise.resolve(null)),
    [slug, Boolean(universe)],
  );

  const items = data?.items || [];
  const categories = useMemo(() => [...new Set(items.map((p) => p.category))], [items]);

  const filtered = useMemo(() => {
    const pf = PRICE_FILTERS.find((f) => f.id === price) || PRICE_FILTERS[0];
    return items.filter((p) =>
      (category === 'all' || p.category === category) && p.price >= pf.min && p.price < pf.max);
  }, [items, category, price]);

  const topProduct = items[0];
  const bundle = items.slice(0, 3);
  const bundleTotal = bundle.reduce((s, p) => s + p.price, 0);

  const related = useMemo(() => universes
    .filter((u) => u.slug !== slug && universeTheme(u.slug).tags.some((t) => theme.tags.includes(t)) && u.count > 0)
    .slice(0, 4), [universes, slug, theme.tags]);

  if (!universe) {
    return (
      <div className="container">
        <EmptyState icon={Compass} title="ასეთი სამყარო ვერ ვიპოვეთ" description="შესაძლოა ბმული მოძველებულია.">
          <Link to="/universes" className="btn btn-primary">ყველა სამყარო</Link>
        </EmptyState>
      </div>
    );
  }

  const needsAge = universe.ageRestricted && !ageOk;

  return (
    <div ref={revealRef} style={universeCssVars(slug)}>
      <AgeGate open={needsAge} onConfirm={() => setAgeOk(true)} onCancel={() => window.history.back()} />

      {/* ─── Cinematic Hero ─── */}
      <div className="ud-hero">
        <SafeImage className="ud-hero-bg" src={theme.bg} alt="" aria-hidden="true" />
        <span className="ud-hero-scrim" aria-hidden="true" />
        <div className="container ud-hero-inner">
          <img className="ud-emblem" src={theme.emblem} alt="" aria-hidden="true" draggable="false" />
          <div className="ud-title-wrap">
            <h1 className={`ud-title uc2-title--${theme.font}`}>{universe.nameKa || universe.name}</h1>
            <p className="ud-sub">{theme.blurb}</p>
          </div>
          <div className="ud-stats">
            <span className="ud-stat"><i>{data?.total ?? universe.count ?? 0}</i> რელიკვია</span>
            {topProduct && <span className="ud-stat">ჰიტი: <i>{topProduct.name.length > 22 ? `${topProduct.name.slice(0, 22)}…` : topProduct.name}</i></span>}
          </div>
        </div>
      </div>

      <div className="container">
        <Breadcrumbs items={[{ label: 'სამყაროები', to: '/universes' }, { label: universe.nameKa || universe.name }]} />

        {/* ─── ამ სამყაროს ისტორია ─── */}
        <div className="panel panel-pad mb-20 reveal">
          <div className="flex-center gap-8 mb-8" style={{ marginBottom: 10 }}>
            <BookOpen size={16} style={{ color: 'var(--universe-accent)' }} />
            <b className="text-sm">ამ სამყაროს ისტორია</b>
          </div>
          <p className="ud-story">{theme.story}</p>
        </div>

        {!needsAge && (
          <>
            {/* ─── ფილტრები ─── */}
            <div className="ud-filters mb-20">
              <button className={`u-filter${category === 'all' ? ' is-active' : ''}`} onClick={() => setCategory('all')}>ყველა კატეგორია</button>
              {categories.map((c) => (
                <button key={c} className={`u-filter${category === c ? ' is-active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
              ))}
              <select
                className="select ml-auto"
                style={{ width: 'auto', minWidth: 160, padding: '8px 34px 8px 13px', fontSize: '0.83rem' }}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-label="ფასის ფილტრი"
              >
                {PRICE_FILTERS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
              <span className="u-count">ნაპოვნია <b>{filtered.length}</b></span>
            </div>

            <ProductGrid products={filtered} loading={loading} skeletonCount={8} />

            {/* ─── Recommended bundle ─── */}
            {bundle.length === 3 && (
              <div className="ud-bundle mt-30 reveal">
                <div className="flex-center gap-8">
                  <Sparkles size={16} style={{ color: 'var(--universe-accent)' }} />
                  <b>რეკომენდებული ნაკრები — {universe.nameKa || universe.name}</b>
                </div>
                <div className="ud-bundle-items">
                  {bundle.map((p) => (
                    <Link key={p.id} to={`/product/${p.slug}`} className="ud-bundle-item">
                      <SafeImage src={p.images?.[0]} alt="" />
                      <span className="truncate" style={{ maxWidth: 160 }}>{p.name}</span>
                      <b style={{ color: 'var(--universe-accent)' }}>{formatPrice(p.price)}</b>
                    </Link>
                  ))}
                </div>
                <div className="flex-center gap-14 flex-wrap">
                  <span className="text-sm text-muted">სამივე ერთად: <b style={{ color: 'var(--text)' }}>{formatPrice(bundleTotal)}</b></span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => bundle.forEach((p) => cart.add(p, 1))}
                  >
                    <ShoppingCart size={14} /> ნაკრების კალათაში დამატება
                  </button>
                </div>
              </div>
            )}

            {/* ─── ჰიტი ─── */}
            {topProduct && (
              <div className="panel panel-pad mt-20 reveal flex-center gap-14 flex-wrap">
                <SafeImage src={topProduct.images?.[0]} alt={topProduct.name} style={{ width: 74, height: 74, borderRadius: 14, objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div className="text-xs" style={{ color: 'var(--universe-accent)', fontWeight: 700, letterSpacing: '.08em' }}>ამ სამყაროს ყველაზე პოპულარული</div>
                  <Link to={`/product/${topProduct.slug}`} className="fw-700">{topProduct.name}</Link>
                  <div className="flex-center gap-8 mt-8" style={{ marginTop: 4 }}>
                    <Stars value={topProduct.rating} size={12} />
                    <span className="text-xs text-dim">({topProduct.reviewCount})</span>
                    <b>{formatPrice(topProduct.price)}</b>
                  </div>
                </div>
                <Link to={`/product/${topProduct.slug}`} className="btn btn-outline btn-sm">ნახვა</Link>
              </div>
            )}
          </>
        )}

        {/* ─── მსგავსი სამყაროები ─── */}
        {related.length > 0 && (
          <div className="mt-30 reveal">
            <h2 style={{ fontSize: '1.15rem', marginBottom: 14 }}>მსგავსი სამყაროები</h2>
            <div className="ud-related">
              {related.map((u) => {
                const rt = universeTheme(u.slug);
                return (
                  <Link key={u.slug} to={`/universes/${u.slug}`} className="ud-related-card">
                    <img src={rt.emblem} alt="" aria-hidden="true" />
                    {u.nameKa || u.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-30">
          <Link to="/universes" className="btn btn-ghost btn-sm"><ArrowLeft size={14} /> ყველა სამყარო</Link>
        </div>
      </div>
    </div>
  );
}
