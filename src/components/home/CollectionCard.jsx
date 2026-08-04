import { Link } from 'react-router-dom';
import { ArrowRight, Skull, Wand2, Shirt, Sparkles, Ghost, Gift, Frame } from 'lucide-react';

const ICONS = {
  'dark-artifacts': Skull,
  'magic-items': Wand2,
  'cult-clothing': Shirt,
  'anime-collection': Sparkles,
  'horror-items': Ghost,
  'gifts-under-30': Gift,
  'wall-decor': Frame,
};

/** კოლექციის ბარათი — ფერადი ბლობით და აიქონით */
export function CollectionCard({ collection }) {
  const Icon = ICONS[collection.slug] || Sparkles;
  return (
    <Link to={`/collections/${collection.slug}`} className="collection-card reveal">
      <span className="cc-blob" style={{ background: collection.color }} />
      <span className="cc-icon" style={{ color: collection.color }}><Icon size={21} /></span>
      <h3>{collection.name}</h3>
      <p>{collection.desc}</p>
      <span className="cc-link">ნახვა <ArrowRight size={14} /></span>
    </Link>
  );
}
