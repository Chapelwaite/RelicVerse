import { useState } from 'react';
import { Star, Sparkles } from 'lucide-react';

/* ─────────── SafeImage — fallback-იანი სურათი ─────────── */
export function SafeImage({ src, alt = '', className = '', fallback = '/products/placeholder.svg', ...rest }) {
  const [current, setCurrent] = useState(src || fallback);
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={current}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      style={{ opacity: loaded ? 1 : 0, transition: 'opacity .4s ease', ...rest.style }}
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
        setLoaded(true);
      }}
      {...rest}
    />
  );
}

/* ─────────── Stars — რეიტინგი ─────────── */
export function Stars({ value = 0, size = 13, showValue = false, count }) {
  const rounded = Math.round(value);
  return (
    <span className="stars" title={`რეიტინგი ${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= rounded ? '' : 'empty'} />
      ))}
      {showValue && (
        <span className="rating-text">
          {Number(value).toFixed(1)}
          {count !== undefined && ` (${count})`}
        </span>
      )}
    </span>
  );
}

/* ─────────── Spinner ─────────── */
export const Spinner = ({ large = false }) => <span className={`spinner${large ? ' spinner-lg' : ''}`} aria-hidden="true" />;

/* ─────────── PageLoader — RelicVerse ლოგოთი ─────────── */
export function PageLoader({ label = 'იტვირთება…' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="loader-mark">
        <span className="ring" />
        <span className="ring" />
        <Sparkles size={26} className="gem" />
      </div>
      <p className="text-muted text-sm">{label}</p>
    </div>
  );
}

/* ─────────── Skeleton — პროდუქტის ბარათი ─────────── */
export function ProductCardSkeleton() {
  return (
    <div className="product-card" aria-hidden="true">
      <div className="skeleton skeleton-img" />
      <div className="pc-body">
        <div className="skeleton skeleton-text w-40" />
        <div className="skeleton skeleton-text w-70" />
        <div className="skeleton skeleton-text w-50" />
      </div>
    </div>
  );
}

export const SkeletonGrid = ({ count = 8, className = 'products-grid' }) => (
  <div className={className}>
    {Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)}
  </div>
);

/* ─────────── EmptyState ─────────── */
export function EmptyState({ icon: Icon = Sparkles, title, description, children }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={38} /></div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children && <div className="flex gap-10 flex-wrap" style={{ justifyContent: 'center' }}>{children}</div>}
    </div>
  );
}

/* ─────────── Avatar ─────────── */
export const Avatar = ({ name = '', size = 40 }) => (
  <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
    {name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '?'}
  </span>
);
