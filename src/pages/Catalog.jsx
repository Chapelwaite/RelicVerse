import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, LayoutGrid, List, PackageSearch, Search } from 'lucide-react';
import { api } from '../api/client';
import { useAsync, useReveal } from '../hooks';
import { useShop } from '../context/ShopContext';
import { ProductGrid } from '../components/product/ProductGrid';
import { FilterPanel, SORT_OPTIONS, EXTRA_FILTERS, PRICE_RANGES } from '../components/catalog/FilterPanel';
import { Drawer } from '../components/ui/Drawer';
import { Breadcrumbs } from '../components/ui/Widgets';
import { EmptyState } from '../components/ui/Primitives';
import { Link } from 'react-router-dom';

const MULTI_KEYS = ['universe', 'genre', 'category'];
const BOOL_KEYS = ['onSale', 'inStock', 'newArrival', 'freeShipping', 'topRated'];

/** URLSearchParams → ფილტრების ობიექტი */
function parseFilters(params) {
  const filters = { q: params.get('q') || '', sort: params.get('sort') || 'popular', page: Number(params.get('page')) || 1 };
  MULTI_KEYS.forEach((k) => { filters[k] = params.get(k) ? params.get(k).split(',').filter(Boolean) : []; });
  BOOL_KEYS.forEach((k) => { filters[k] = params.get(k) === '1'; });
  filters.minPrice = params.get('minPrice') ?? '';
  filters.maxPrice = params.get('maxPrice') ?? '';
  filters.collection = params.get('collection') || '';
  return filters;
}

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState('grid');
  const revealRef = useReveal();
  const { universes, genres, categories, collectionBySlug } = useShop();

  const filters = useMemo(() => parseFilters(params), [params]);

  /** ფილტრის ცვლილება → URL-ის განახლება */
  const update = useCallback((patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === '' || value === false || value === null || value === undefined || (Array.isArray(value) && !value.length)) {
        next.delete(key);
      } else if (Array.isArray(value)) {
        next.set(key, value.join(','));
      } else if (value === true) {
        next.set(key, '1');
      } else {
        next.set(key, String(value));
      }
    });
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  }, [params, setParams]);

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);

  const query = useMemo(() => ({
    q: filters.q,
    universe: filters.universe,
    genre: filters.genre,
    category: filters.category,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    onSale: filters.onSale,
    inStock: filters.inStock,
    newArrival: filters.newArrival,
    freeShipping: filters.freeShipping,
    minRating: filters.topRated ? 4.5 : '',
    collection: filters.collection,
    sort: filters.sort,
    page: filters.page,
    limit: 12,
  }), [filters]);

  const { data, loading, error } = useAsync(
    (signal) => api.products(query, signal),
    [JSON.stringify(query)],
  );
  const facets = useAsync(() => api.facets(), []);

  /* აქტიური ფილტრების chips */
  const chips = useMemo(() => {
    const list = [];
    if (filters.q) list.push({ label: `ძიება: ${filters.q}`, clear: { q: '' } });
    MULTI_KEYS.forEach((key) => filters[key].forEach((value) => {
      list.push({ label: value, clear: { [key]: filters[key].filter((v) => v !== value) } });
    }));
    const range = PRICE_RANGES.find((r) => String(r.min) === String(filters.minPrice) && String(r.max) === String(filters.maxPrice));
    if (range) list.push({ label: range.label, clear: { minPrice: '', maxPrice: '' } });
    EXTRA_FILTERS.forEach((f) => { if (filters[f.key]) list.push({ label: f.label, clear: { [f.key]: false } }); });
    if (filters.collection) {
      const col = collectionBySlug(filters.collection);
      list.push({ label: col?.name || filters.collection, clear: { collection: '' } });
    }
    return list;
  }, [filters, collectionBySlug]);

  const filterProps = {
    filters, facets: facets.data, universes, genres, categories,
    onChange: update, onReset: reset,
  };

  const totalPages = data?.pages || 1;
  const pageNumbers = useMemo(() => {
    const out = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - filters.page) <= 1) out.push(i);
      else if (out.at(-1) !== '…') out.push('…');
    }
    return out;
  }, [totalPages, filters.page]);

  return (
    <div className="container" ref={revealRef}>
      <Breadcrumbs items={[{ label: 'კატალოგი' }]} />

      <div className="mb-20">
        <h1 className="section-title">კატალოგი</h1>
        <p className="section-sub">იპოვე ზუსტად ის ნივთი, რომელსაც ეძებ — გაფილტრე სამყაროს, ჟანრის, ტიპისა და ფასის მიხედვით.</p>
      </div>

      <div className="catalog-layout">
        <aside className="filter-sidebar panel panel-pad">
          <FilterPanel {...filterProps} />
        </aside>

        <div>
          <div className="catalog-toolbar">
            <button className="btn btn-ghost btn-sm" onClick={() => setDrawerOpen(true)} data-filter-toggle style={{ display: 'none' }}>
              <SlidersHorizontal size={15} /> ფილტრები {chips.length > 0 && `(${chips.length})`}
            </button>

            <span className="result-count">
              ნაპოვნია <b>{data?.total ?? '…'}</b> პროდუქტი
            </span>

            <div className="flex-center gap-8 ml-auto">
              <label className="text-xs text-dim" htmlFor="sort-select">დალაგება:</label>
              <select
                id="sort-select"
                className="select"
                style={{ width: 'auto', minWidth: 178, padding: '9px 34px 9px 13px', fontSize: '0.85rem' }}
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value, page: 1 })}
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <div className="view-toggle" data-view-toggle>
                <button className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')} aria-label="ბადის ხედი"><LayoutGrid size={15} /></button>
                <button className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} aria-label="სიის ხედი"><List size={15} /></button>
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="chips mb-20">
              {chips.map((chip, i) => (
                <span key={`${chip.label}-${i}`} className="chip">
                  {chip.label}
                  <button onClick={() => update({ ...chip.clear, page: 1 })} aria-label={`${chip.label} — ფილტრის მოხსნა`}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button className="chip is-clickable" onClick={reset}>
                <X size={12} /> ყველა ფილტრის გასუფთავება
              </button>
            </div>
          )}

          {error ? (
            <EmptyState icon={PackageSearch} title="მონაცემები ვერ ჩაიტვირთა" description={error}>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>ხელახლა ცდა</button>
            </EmptyState>
          ) : (
            <ProductGrid
              products={data?.items || []}
              loading={loading}
              view={view}
              skeletonCount={12}
              empty={(
                <EmptyState
                  icon={Search}
                  title="ამ სამყაროდან ნივთი ჯერ ვერ ვიპოვეთ."
                  description="სცადე სხვა ფილტრები ან დაათვალიერე მთელი კატალოგი."
                >
                  <button className="btn btn-ghost" onClick={reset}>ფილტრების გასუფთავება</button>
                  <Link className="btn btn-primary" to="/catalog">ყველა პროდუქტის ნახვა</Link>
                </EmptyState>
              )}
            />
          )}

          {totalPages > 1 && (
            <nav className="pagination" aria-label="გვერდები">
              <button onClick={() => update({ page: filters.page - 1 })} disabled={filters.page <= 1}>წინა</button>
              {pageNumbers.map((n, i) => (n === '…'
                ? <span key={`dots-${i}`} className="dots">…</span>
                : <button key={n} className={n === filters.page ? 'is-active' : ''} onClick={() => update({ page: n })}>{n}</button>
              ))}
              <button onClick={() => update({ page: filters.page + 1 })} disabled={filters.page >= totalPages}>შემდეგი</button>
            </nav>
          )}
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="ფილტრები" footer={(
        <div className="flex gap-8">
          <button className="btn btn-ghost btn-block" onClick={reset}>გასუფთავება</button>
          <button className="btn btn-primary btn-block" onClick={() => setDrawerOpen(false)}>ჩვენება ({data?.total ?? 0})</button>
        </div>
      )}>
        <FilterPanel {...filterProps} />
      </Drawer>

      <style>{`
        @media (max-width: 1000px) {
          [data-filter-toggle] { display: inline-flex !important; }
        }
        @media (max-width: 560px) {
          [data-view-toggle] { display: none; }
        }
      `}</style>
    </div>
  );
}
