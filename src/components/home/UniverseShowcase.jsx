import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { api } from '../../api/client';
import { useAsync } from '../../hooks';
import { useShop } from '../../context/ShopContext';
import { UniverseCardV2 } from './UniverseCardV2';
import { UNIVERSE_FILTERS, FEATURED_SLUGS, universeTheme } from '../../utils/universeThemes';
import { runPortalTransition } from '../../utils/portalTransition';
import { SafeImage } from '../ui/Primitives';
import { formatPrice } from '../../utils/format';

/* ─────────── Universe Spotlight ─────────── */
const SPOTLIGHT_POOL = ['harry-potter', 'pirates', 'death-note', 'ghibli', 'alice', 'dc'];

function UniverseSpotlight({ universes }) {
  const navigate = useNavigate();
  // ერთ ჩატვირთვაზე — ერთი შემთხვევითი სამყარო
  const [slug] = useState(() => SPOTLIGHT_POOL[Math.floor(Math.random() * SPOTLIGHT_POOL.length)]);
  const universe = universes.find((u) => u.slug === slug);
  const theme = universeTheme(slug);

  const { data } = useAsync(
    (signal) => (universe ? api.products({ universe: universe.name, limit: 3, sort: 'popular' }, signal) : Promise.resolve(null)),
    [slug, Boolean(universe)],
  );

  if (!universe) return null;

  const enter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    runPortalTransition({
      originX: rect.left + rect.width / 2,
      originY: rect.top + rect.height / 2,
      color: theme.primary,
      surface: theme.surface,
      emblem: theme.emblem,
      onNavigate: () => navigate(`/universes/${slug}`),
    });
  };

  return (
    <div
      className={`u-spotlight u-spotlight--${slug} reveal`}
      style={{ '--uc-primary': theme.primary, '--uc-accent': theme.accent, '--uc-glow': theme.glow, '--uc-surface': theme.surface }}
    >
      <SafeImage className="u-spotlight-bg" src={theme.bg} alt="" aria-hidden="true" />
      <span className="u-spotlight-scrim" aria-hidden="true" />

      <div className="u-spotlight-body">
        <div className="u-spotlight-main">
          <span className="eyebrow">დღის სამყარო</span>
          <div className="u-spotlight-brand">
            <img src={theme.emblem} alt="" aria-hidden="true" draggable="false" />
            <h3 className={`uc2-title--${theme.font}`}>{universe.nameKa || universe.name}</h3>
          </div>
          <p className="u-spotlight-text">{theme.story}</p>
          <button type="button" className="btn btn-primary" onClick={enter} style={{ '--btn-bg': `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
            სამყაროში შესვლა <ArrowRight size={15} />
          </button>
        </div>

        {data?.items?.length > 0 && (
          <div className="u-spotlight-products">
            {data.items.map((p) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="u-spotlight-product" onClick={(e) => e.stopPropagation()}>
                <SafeImage src={p.images?.[0]} alt={p.name} />
                <span className="truncate">{p.name}</span>
                <b>{formatPrice(p.price)}</b>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────── მთავარი სექცია ─────────── */
export function UniverseShowcase() {
  const { universes } = useShop();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  // featured ბარათების პროდუქტ-პრევიუები
  const popular = useAsync((signal) => api.products({ limit: 30, sort: 'popular' }, signal), []);
  const previewsByUniverse = useMemo(() => {
    const map = {};
    (popular.data?.items || []).forEach((p) => { (map[p.universe] ||= []).push(p); });
    return map;
  }, [popular.data]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return universes.filter((u) => {
      if (u.count === 0 && u.slug !== 'other') return true; // ცარიელებსაც ვაჩვენებთ — მაგრამ ბოლოში
      const theme = universeTheme(u.slug);
      if (filter !== 'all' && !theme.tags.includes(filter)) return false;
      if (q && !`${u.name} ${u.nameKa}`.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [universes, filter, query]);

  const featured = filter === 'all' && !query.trim()
    ? FEATURED_SLUGS.map((slug) => visible.find((u) => u.slug === slug)).filter(Boolean)
    : [];
  const rest = visible.filter((u) => !featured.some((f) => f.slug === u.slug));

  return (
    <section className="section" id="universes">
      <div className="container">
        <div className="section-head" style={{ alignItems: 'flex-start' }}>
          <div>
            <span className="eyebrow">RelicVerse-ის რუკა</span>
            <h2 className="section-title">აირჩიე <span className="accent">სამყარო</span></h2>
            <p className="section-sub">შედი ისტორიაში, რომელმაც შენში რაღაც დატოვა.</p>
          </div>
          <Link to="/universes" className="btn btn-ghost">ყველას ნახვა <ArrowRight size={15} /></Link>
        </div>

        {/* ფილტრები + ძიება */}
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

          <div className="u-search">
            <Search size={15} aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="სამყაროს ძიება…"
              aria-label="სამყაროს ძიება"
            />
          </div>

          <AnimatePresence mode="popLayout">
            <motion.span
              key={visible.length}
              className="u-count"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              ნაპოვნია <b>{visible.length}</b> სამყარო
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Featured რიგი */}
        {featured.length > 0 && (
          <div className="u-featured-grid">
            {featured.map((u) => (
              <UniverseCardV2
                key={u.slug}
                universe={u}
                featured
                previews={previewsByUniverse[u.name] || []}
              />
            ))}
          </div>
        )}

        {/* დანარჩენი — grid / mobile carousel; ფილტრის ცვლილებაზე stagger reveal */}
        <motion.div
          key={`${filter}:${query.trim()}`}
          className="u-grid"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.045 } } }}
        >
          {rest.map((u) => (
            <motion.div
              key={u.slug}
              style={{ minWidth: 0 }}
              variants={{
                hidden: { opacity: 0, y: 16, scale: 0.96 },
                show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <UniverseCardV2 universe={u} />
            </motion.div>
          ))}
        </motion.div>

        {/* Spotlight */}
        <UniverseSpotlight universes={universes} />
      </div>
    </section>
  );
}
