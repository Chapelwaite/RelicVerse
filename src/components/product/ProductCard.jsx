import { useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye, GitCompareArrows, Truck, ShieldAlert } from 'lucide-react';
import { SafeImage, Stars } from '../ui/Primitives';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useShop } from '../../context/ShopContext';
import { formatPrice, stockInfo } from '../../utils/format';

/**
 * პროდუქტის ბარათი — hover-ზე მსუბუქი 3D დახრა, glow და მოქმედებების ღილაკები.
 */
export function ProductCard({ product, onQuickView, index = 0 }) {
  const cardRef = useRef(null);
  const cart = useCart();
  const favorites = useFavorites();
  const { toggleCompare, inCompare } = useShop();

  const stock = stockInfo(product.stock);
  const isFavorite = favorites.has(product.id);
  const isComparing = inCompare(product.id);

  /* მსუბუქი tilt ეფექტი კურსორის მიხედვით */
  const handleMove = useCallback((e) => {
    const node = cardRef.current;
    if (!node || window.matchMedia('(hover: none)').matches) return;
    const rect = node.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    node.style.transform = `translateY(-7px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
  }, []);

  const handleLeave = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = '';
  }, []);

  return (
    <article
      ref={cardRef}
      className="product-card reveal"
      style={{ transitionDelay: `${Math.min(index, 8) * 40}ms`, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="pc-media">
        <Link to={`/product/${product.slug}`} aria-label={product.name}>
          <SafeImage src={product.images?.[0]} alt={product.name} />
        </Link>

        <div className="pc-badges">
          {product.onSale && product.discount > 0 && <span className="badge badge-sale">−{product.discount}%</span>}
          {product.newArrival && <span className="badge badge-new">ახალი</span>}
          {product.freeShipping && <span className="badge badge-muted"><Truck size={11} /> უფასო მიწოდება</span>}
          {product.ageRestricted && <span className="badge badge-18"><ShieldAlert size={11} /> 18+</span>}
        </div>

        <div className="pc-tools">
          <button
            className={`pc-tool${isFavorite ? ' is-on' : ''}`}
            onClick={() => favorites.toggle(product)}
            aria-label={isFavorite ? 'რჩეულებიდან წაშლა' : 'რჩეულებში დამატება'}
            aria-pressed={isFavorite}
          >
            <Heart size={15} />
          </button>
          {onQuickView && (
            <button className="pc-tool" onClick={() => onQuickView(product)} aria-label="სწრაფი ნახვა">
              <Eye size={15} />
            </button>
          )}
          <button
            className={`pc-tool${isComparing ? ' is-on' : ''}`}
            onClick={() => toggleCompare(product)}
            aria-label="შედარებაში დამატება"
            aria-pressed={isComparing}
          >
            <GitCompareArrows size={15} />
          </button>
        </div>

        {product.stock > 0 ? (
          <button
            className="btn btn-primary btn-sm pc-cart-btn"
            onClick={() => cart.add(product)}
            aria-label={`${product.name} — კალათაში დამატება`}
          >
            <ShoppingCart size={15} />
            კალათაში დამატება
          </button>
        ) : (
          <div className="pc-out-overlay">არ არის მარაგში</div>
        )}
      </div>

      <div className="pc-body">
        <span className="pc-universe">{product.universe}</span>
        <Link to={`/product/${product.slug}`}>
          <h3 className="pc-name line-2">{product.name}</h3>
        </Link>

        <div className="flex-center gap-6">
          <Stars value={product.rating} size={12} />
          <span className="text-xs text-dim">({product.reviewCount})</span>
        </div>

        <div className="pc-foot">
          <div>
            <span className="price">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="price-old">{formatPrice(product.oldPrice)}</span>}
          </div>
          <span className={`pc-stock ${stock.level}`}>
            <span className="dot" />
            {stock.label}
          </span>
        </div>
      </div>
    </article>
  );
}
