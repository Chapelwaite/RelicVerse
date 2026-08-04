import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowRight, Minus, Plus } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { SafeImage, Stars } from '../ui/Primitives';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { formatPrice, stockInfo } from '../../utils/format';

/** სწრაფი ნახვის ფანჯარა — გვერდის დატოვების გარეშე */
export function QuickView({ product, open, onClose }) {
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const cart = useCart();
  const favorites = useFavorites();

  if (!product) return null;
  const stock = stockInfo(product.stock);
  const isFavorite = favorites.has(product.id);

  const handleClose = () => { setQty(1); setActive(0); onClose(); };

  return (
    <Modal open={open} onClose={handleClose} title="სწრაფი ნახვა" size="modal-lg">
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.05fr)', gap: 24 }} className="qv-grid">
        <div>
          <div className="gallery-main" style={{ cursor: 'default' }}>
            <SafeImage src={product.images?.[active]} alt={product.name} />
          </div>
          <div className="gallery-thumbs">
            {(product.images || []).slice(0, 3).map((src, i) => (
              <button
                key={src}
                className={`gallery-thumb${i === active ? ' is-active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`სურათი ${i + 1}`}
              >
                <SafeImage src={src} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="pc-universe">{product.universe}</span>
          <h3 style={{ fontSize: '1.36rem', marginBlock: '6px 10px' }}>{product.name}</h3>

          <div className="flex-center gap-8 mb-14">
            <Stars value={product.rating} size={14} showValue count={product.reviewCount} />
          </div>

          <div className="flex-center gap-8 mb-14">
            <span className="price price-lg">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="price-old">{formatPrice(product.oldPrice)}</span>}
            {product.discount > 0 && <span className="badge badge-sale">−{product.discount}%</span>}
          </div>

          <p className="text-soft text-sm mb-20">{product.shortDescription}</p>

          <div className="flex-center gap-8 mb-14 flex-wrap">
            <span className="badge">{product.category}</span>
            <span className="badge">{product.genre}</span>
            <span className={`pc-stock ${stock.level}`}><span className="dot" /> {stock.label}</span>
          </div>

          {product.stock > 0 && (
            <div className="flex-center gap-10 mb-14 flex-wrap">
              <div className="qty-picker">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="შემცირება"><Minus size={15} /></button>
                <span className="qty-value">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={qty >= product.stock} aria-label="გაზრდა"><Plus size={15} /></button>
              </div>
              <button className="btn btn-primary" onClick={() => { cart.add(product, qty); handleClose(); }}>
                <ShoppingCart size={16} /> კალათაში დამატება
              </button>
              <button
                className={`icon-btn${isFavorite ? ' is-active' : ''}`}
                onClick={() => favorites.toggle(product)}
                aria-label="რჩეულებში დამატება"
              >
                <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}

          <Link to={`/product/${product.slug}`} className="btn btn-ghost btn-block" onClick={handleClose}>
            სრული აღწერის ნახვა <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <style>{`@media (max-width: 720px) { .qv-grid { grid-template-columns: 1fr !important; } }`}</style>
    </Modal>
  );
}
