import { useMemo } from 'react';
import { Flame, Tag } from 'lucide-react';
import { api } from '../api/client';
import { useAsync, useCountdown, useReveal } from '../hooks';
import { useShop } from '../context/ShopContext';
import { ProductGrid } from '../components/product/ProductGrid';
import { Breadcrumbs } from '../components/ui/Widgets';

const UNITS = [
  { key: 'days', label: 'დღე' },
  { key: 'hours', label: 'საათი' },
  { key: 'minutes', label: 'წუთი' },
  { key: 'seconds', label: 'წამი' },
];

const PROMO_CODES = [
  { code: 'RELIC10', desc: '10% ფასდაკლება მთელ კალათაზე' },
  { code: 'MAGIC15', desc: '15% ფასდაკლება 80 ₾-დან' },
  { code: 'TEEN5', desc: '−5 ₾ 25 ₾-დან ზემოთ' },
];

export default function Sale() {
  const revealRef = useReveal();
  const { settings } = useShop();
  const banner = settings.saleBanner || {};
  const time = useCountdown(banner.endsAt);

  const query = useMemo(() => ({ onSale: 1, limit: 60, sort: 'discount' }), []);
  const { data, loading } = useAsync((signal) => api.products(query, signal), []);

  return (
    <div className="container" ref={revealRef}>
      <Breadcrumbs items={[{ label: 'აქციები' }]} />

      <div className="promo-banner mb-20">
        <span className="badge badge-sale" style={{ marginBottom: 14 }}><Flame size={12} /> მიმდინარე აქცია</span>
        <h1 className="pb-title">{banner.title || 'მისტიკური კვირეული'}</h1>
        <p className="pb-sub">{banner.subtitle || '25%-მდე ფასდაკლება არჩეულ ნივთებზე'}</p>

        {!time.finished && (
          <div className="countdown">
            {UNITS.map((u) => (
              <div key={u.key} className="cd-unit">
                <div className="cd-n">{String(time[u.key]).padStart(2, '0')}</div>
                <div className="cd-l">{u.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid mb-20" style={{ gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
        {PROMO_CODES.map((p) => (
          <div key={p.code} className="panel panel-pad reveal flex-center gap-12">
            <span className="cc-icon" style={{ color: 'var(--gold)' }}><Tag size={19} /></span>
            <div>
              <div className="fw-700" style={{ letterSpacing: '.06em' }}>{p.code}</div>
              <div className="text-xs text-muted">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-head">
        <h2 className="section-title" style={{ fontSize: '1.5rem' }}>ფასდაკლებული ნივთები</h2>
        <span className="result-count">სულ <b>{data?.total ?? 0}</b> პროდუქტი</span>
      </div>

      <ProductGrid products={data?.items || []} loading={loading} skeletonCount={12} />
    </div>
  );
}
