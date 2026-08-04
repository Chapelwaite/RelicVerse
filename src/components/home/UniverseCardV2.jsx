import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { universeTheme, collectionProgress } from '../../utils/universeThemes';
import { runPortalTransition } from '../../utils/portalTransition';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import { SafeImage } from '../ui/Primitives';
import { formatPrice } from '../../utils/format';

/**
 * Universe card v2 — საკუთარი ემბლემით, თემატური ფონით, აღწერით,
 * კოლექციის პროგრესითა და portal-გადასვლით.
 */
export function UniverseCardV2({ universe, featured = false, previews = [] }) {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const favorites = useFavorites();
  const cart = useCart();
  const theme = universeTheme(universe.slug);

  const progress = collectionProgress(universe.name, favorites.items, cart.items, universe.count);

  /* მსუბუქი tilt (მაქს. ~2.5°) + mouse-follow glow */
  const onMove = useCallback((e) => {
    const node = cardRef.current;
    if (!node || window.matchMedia('(hover: none)').matches) return;
    const r = node.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    node.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    node.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    node.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 2.4).toFixed(2)}deg) rotateY(${((px - 0.5) * 2.6).toFixed(2)}deg) translateY(-4px)`;
  }, []);

  const onLeave = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = '';
  }, []);

  const open = (e) => {
    e.preventDefault();
    const rect = cardRef.current?.getBoundingClientRect();
    runPortalTransition({
      originX: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
      originY: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
      color: theme.primary,
      surface: theme.surface,
      emblem: theme.emblem,
      onNavigate: () => navigate(`/universes/${universe.slug}`),
    });
  };

  return (
    <a
      href={`/universes/${universe.slug}`}
      ref={cardRef}
      className={`uc2 uc2--${universe.slug}${featured ? ' uc2--featured' : ''}`}
      style={{ '--uc-primary': theme.primary, '--uc-accent': theme.accent, '--uc-glow': theme.glow, '--uc-surface': theme.surface }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={open}
      aria-label={`${universe.nameKa || universe.name} — ${universe.count || 0} რელიკვია, აღმოაჩინე`}
    >
      <SafeImage className="uc2-bg" src={theme.bg} alt="" aria-hidden="true" />
      <span className="uc2-scrim" aria-hidden="true" />
      <span className="uc2-glowspot" aria-hidden="true" />
      <span className="uc2-sweep" aria-hidden="true" />

      <div className="uc2-content">
        <div className="uc2-top">
          <img className="uc2-emblem" src={theme.emblem} alt="" aria-hidden="true" draggable="false" loading="lazy" />
          {universe.ageRestricted && <span className="badge badge-18">18+</span>}
        </div>

        <div className="uc2-bottom">
          <h3 className={`uc2-title uc2-title--${theme.font}`}>{universe.nameKa || universe.name}</h3>
          <p className="uc2-desc">{theme.blurb}</p>

          <div className="uc2-meta">
            <span className="uc2-count">
              <Sparkles size={12} aria-hidden="true" />
              {universe.count || 0} რელიკვია
            </span>
            <span className="uc2-cta">
              აღმოაჩინე <ArrowRight size={14} aria-hidden="true" />
            </span>
          </div>

          {progress && (
            <div className="uc2-progress" aria-label={`კოლექცია: ${progress.found} / ${progress.total}`}>
              <span className="uc2-progress-label">კოლექცია · {progress.found} / {progress.total} აღმოჩენილი</span>
              <span className="uc2-progress-track">
                <span className="uc2-progress-fill" style={{ width: `${Math.round((progress.found / progress.total) * 100)}%` }} />
              </span>
            </div>
          )}

          {featured && previews.length > 0 && (
            <div className="uc2-previews" aria-hidden="true">
              {previews.slice(0, 2).map((p) => (
                <span key={p.id} className="uc2-preview">
                  <SafeImage src={p.images?.[0]} alt="" />
                  <span className="uc2-preview-info">
                    <b className="truncate">{p.name}</b>
                    <i>{formatPrice(p.price)}</i>
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
