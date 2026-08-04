import { useState } from 'react';
import { Check, ChevronDown, RotateCcw } from 'lucide-react';

export const PRICE_RANGES = [
  { id: '0-20', label: '0 – 20 ₾', min: 0, max: 20 },
  { id: '20-40', label: '20 – 40 ₾', min: 20, max: 40 },
  { id: '40-70', label: '40 – 70 ₾', min: 40, max: 70 },
  { id: '70-100', label: '70 – 100 ₾', min: 70, max: 100 },
  { id: '100+', label: '100 ₾-ზე მეტი', min: 100, max: '' },
];

export const EXTRA_FILTERS = [
  { key: 'onSale', label: 'მხოლოდ აქციაში' },
  { key: 'inStock', label: 'მხოლოდ მარაგში' },
  { key: 'newArrival', label: 'ახალი დამატებული' },
  { key: 'freeShipping', label: 'უფასო მიწოდება' },
  { key: 'topRated', label: 'ყველაზე მაღალი რეიტინგით' },
];

export const SORT_OPTIONS = [
  { value: 'popular', label: 'პოპულარული' },
  { value: 'newest', label: 'უახლესი' },
  { value: 'price-asc', label: 'ფასი ზრდადობით' },
  { value: 'price-desc', label: 'ფასი კლებადობით' },
  { value: 'rating', label: 'რეიტინგის მიხედვით' },
  { value: 'discount', label: 'ყველაზე დიდი ფასდაკლება' },
];

/* ─── გასაშლელი ჯგუფი ─── */
function Group({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-group">
      <button className={`filter-group-head${open ? ' is-open' : ''}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {title}
        <ChevronDown size={16} />
      </button>
      {open && <div className="filter-list">{children}</div>}
    </div>
  );
}

/* ─── Checkbox ─── */
function CheckItem({ label, count, checked, onChange }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="box"><Check size={12} strokeWidth={3.5} /></span>
      <span className="truncate">{label}</span>
      {count !== undefined && <span className="count">{count}</span>}
    </label>
  );
}

/**
 * ფილტრების პანელი — იყენებს „კონტროლირებად" მდგომარეობას,
 * რომელსაც კატალოგის გვერდი URL-ში ინახავს.
 */
export function FilterPanel({ filters, facets, universes, genres, categories, onChange, onReset }) {
  const toggleMulti = (key, value) => {
    const list = filters[key] || [];
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    onChange({ [key]: next, page: 1 });
  };

  const activeRange = PRICE_RANGES.find(
    (r) => String(r.min) === String(filters.minPrice ?? '') && String(r.max) === String(filters.maxPrice ?? ''),
  );

  return (
    <div>
      <div className="flex-between mb-14">
        <h3 style={{ fontSize: '1rem' }}>ფილტრები</h3>
        <button className="btn btn-ghost btn-sm" onClick={onReset}>
          <RotateCcw size={13} /> გასუფთავება
        </button>
      </div>

      <Group title="სამყარო">
        {universes.filter((u) => (facets?.universes?.[u.name] ?? u.count) > 0).map((u) => (
          <CheckItem
            key={u.slug}
            label={u.nameKa || u.name}
            count={facets?.universes?.[u.name] ?? u.count}
            checked={(filters.universe || []).includes(u.name)}
            onChange={() => toggleMulti('universe', u.name)}
          />
        ))}
      </Group>

      <Group title="ჟანრი">
        {genres.map((g) => (
          <CheckItem
            key={g}
            label={g}
            count={facets?.genres?.[g]}
            checked={(filters.genre || []).includes(g)}
            onChange={() => toggleMulti('genre', g)}
          />
        ))}
      </Group>

      <Group title="პროდუქტის ტიპი">
        {categories.map((c) => (
          <CheckItem
            key={c.slug}
            label={c.name}
            count={facets?.categories?.[c.name] ?? c.count}
            checked={(filters.category || []).includes(c.name)}
            onChange={() => toggleMulti('category', c.name)}
          />
        ))}
      </Group>

      <Group title="ფასი">
        {PRICE_RANGES.map((r) => (
          <CheckItem
            key={r.id}
            label={r.label}
            checked={activeRange?.id === r.id}
            onChange={() => onChange(
              activeRange?.id === r.id
                ? { minPrice: '', maxPrice: '', page: 1 }
                : { minPrice: r.min, maxPrice: r.max, page: 1 },
            )}
          />
        ))}
      </Group>

      <Group title="დამატებითი">
        {EXTRA_FILTERS.map((f) => (
          <CheckItem
            key={f.key}
            label={f.label}
            checked={Boolean(filters[f.key])}
            onChange={() => onChange({ [f.key]: !filters[f.key], page: 1 })}
          />
        ))}
      </Group>
    </div>
  );
}
