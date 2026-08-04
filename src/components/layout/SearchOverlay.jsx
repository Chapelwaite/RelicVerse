import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Sparkles, Clapperboard, Tag } from 'lucide-react';
import { api } from '../../api/client';
import { useDebounce, useEscape } from '../../hooks';
import { SafeImage } from '../ui/Primitives';
import { formatPrice } from '../../utils/format';

const POPULAR = ['ჰარი პოტერი', 'Death Note', 'ჭიქა', 'პოსტერი', 'ბეჭედი', 'ანიმე'];

/** ცოცხალი შემოთავაზებებით საძიებო overlay */
export function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounced = useDebounce(query, 260);

  useEscape(onClose, open);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
    else { setQuery(''); setResult(null); }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const q = debounced.trim();
    if (q.length < 2) { setResult(null); setLoading(false); return undefined; }

    const controller = new AbortController();
    setLoading(true);
    api.suggest(q, controller.signal)
      .then(setResult)
      .catch((err) => { if (err.name !== 'AbortError') setResult(null); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [debounced, open]);

  const go = (path) => { onClose(); navigate(path); };

  const submit = (e) => {
    e.preventDefault();
    if (query.trim()) go(`/catalog?q=${encodeURIComponent(query.trim())}`);
  };

  const hasResults = useMemo(
    () => Boolean(result && (result.products?.length || result.universes?.length || result.categories?.length)),
    [result],
  );

  if (!open) return null;

  return (
    <div className="search-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-panel">
        <form className="search-input-wrap" onSubmit={submit}>
          <Search size={19} style={{ color: 'var(--violet-300)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="მოძებნე ფილმი, პერსონაჟი ან ნივთი..."
            aria-label="ძიება"
            autoComplete="off"
          />
          {loading && <Loader2 size={17} className="text-dim" style={{ animation: 'spin 1s linear infinite' }} />}
          <button type="button" className="icon-btn" onClick={onClose} aria-label="დახურვა" style={{ width: 36, height: 36 }}>
            <X size={16} />
          </button>
        </form>

        {query.trim().length < 2 ? (
          <div className="suggest-panel" style={{ padding: '16px 18px' }}>
            <div className="suggest-group-title" style={{ padding: 0, marginBottom: 10 }}>პოპულარული ძიებები</div>
            <div className="chips">
              {POPULAR.map((term) => (
                <button key={term} className="chip is-clickable" onClick={() => setQuery(term)}>
                  <Sparkles size={12} /> {term}
                </button>
              ))}
            </div>
          </div>
        ) : hasResults ? (
          <div className="suggest-panel">
            {result.universes?.length > 0 && (
              <>
                <div className="suggest-group-title">სამყაროები</div>
                {result.universes.map((u) => (
                  <button key={u.slug} className="suggest-item" onClick={() => go(`/universes/${u.slug}`)}>
                    <span className="pc-tool" style={{ width: 46, height: 46, borderRadius: 12, background: `${u.color}22`, color: u.color }}>
                      <Clapperboard size={19} />
                    </span>
                    <span>
                      <span className="s-name" style={{ display: 'block' }}>{u.nameKa || u.name}</span>
                      <span className="s-meta">{u.name}</span>
                    </span>
                  </button>
                ))}
              </>
            )}

            {result.products?.length > 0 && (
              <>
                <div className="suggest-group-title">პროდუქტები</div>
                {result.products.map((p) => (
                  <button key={p.id} className="suggest-item" onClick={() => go(`/product/${p.slug}`)}>
                    <SafeImage src={p.image} alt="" />
                    <span style={{ minWidth: 0 }}>
                      <span className="s-name truncate" style={{ display: 'block' }}>{p.name}</span>
                      <span className="s-meta">{p.universe}</span>
                    </span>
                    <span className="s-price">{formatPrice(p.price)}</span>
                  </button>
                ))}
              </>
            )}

            {result.categories?.length > 0 && (
              <>
                <div className="suggest-group-title">კატეგორიები</div>
                {result.categories.map((c) => (
                  <button key={c.slug} className="suggest-item" onClick={() => go(`/catalog?category=${encodeURIComponent(c.name)}`)}>
                    <span className="pc-tool" style={{ width: 46, height: 46, borderRadius: 12 }}><Tag size={18} /></span>
                    <span className="s-name">{c.name}</span>
                  </button>
                ))}
              </>
            )}

            <button className="suggest-item" style={{ borderTop: '1px solid var(--border)', color: 'var(--violet-300)', fontWeight: 700 }} onClick={submit}>
              <Search size={16} /> ყველა შედეგის ნახვა ({result.total})
            </button>
          </div>
        ) : !loading && (
          <div className="suggest-panel" style={{ padding: '30px 20px', textAlign: 'center' }}>
            <p className="fw-700">ამ სამყაროდან ნივთი ჯერ ვერ ვიპოვეთ.</p>
            <p className="text-muted text-sm mt-8">სცადე სხვა სიტყვა ან დაათვალიერე მთელი კატალოგი.</p>
            <button className="btn btn-outline btn-sm mt-14" onClick={() => go('/catalog')}>ყველა პროდუქტის ნახვა</button>
          </div>
        )}
      </div>
    </div>
  );
}
