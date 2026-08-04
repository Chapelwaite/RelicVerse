import { Link } from 'react-router-dom';
import { SafeImage } from '../ui/Primitives';

/** ერთი სამყაროს ბარათი ატმოსფერული ბანერით */
export function UniverseCard({ universe }) {
  return (
    <Link to={`/universes/${universe.slug}`} className="universe-card reveal">
      <SafeImage
        src={`/universes/${universe.slug}.svg`}
        alt={universe.nameKa || universe.name}
        fallback="/products/placeholder.svg"
      />
      <span className="uc-overlay" />
      <span className="uc-body">
        <span className="uc-name" style={{ display: 'block' }}>{universe.nameKa || universe.name}</span>
        <span className="uc-count">{universe.count ?? 0} ნივთი</span>
      </span>
      <span className="uc-glow" style={{ background: universe.color }} />
    </Link>
  );
}
