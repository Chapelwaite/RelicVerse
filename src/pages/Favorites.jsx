import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, X } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { SafeImage, EmptyState, Stars } from '../components/ui/Primitives';
import { ConfirmDialog } from '../components/ui/Modal';
import { Breadcrumbs } from '../components/ui/Widgets';
import { formatPrice, stockInfo } from '../utils/format';

export default function Favorites() {
  const favorites = useFavorites();
  const cart = useCart();
  const [confirmClear, setConfirmClear] = useState(false);

  if (!favorites.items.length) {
    return (
      <div className="container">
        <Breadcrumbs items={[{ label: 'ჩემი რჩეულები' }]} />
        <EmptyState
          icon={Heart}
          title="რჩეულების სია ცარიელია"
          description="დააჭირე გულის ხატულას პროდუქტზე, რომ აქ შეინახო და მოგვიანებით დაუბრუნდე."
        >
          <Link to="/catalog" className="btn btn-primary">კატალოგის ნახვა</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container">
      <Breadcrumbs items={[{ label: 'ჩემი რჩეულები' }]} />

      <div className="flex-between mb-20 flex-wrap gap-10">
        <div>
          <h1 className="section-title">ჩემი რჩეულები</h1>
          <p className="section-sub">{favorites.count} შენახული ნივთი</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setConfirmClear(true)}>
          <Trash2 size={14} /> სიის გასუფთავება
        </button>
      </div>

      <div className="products-grid">
        {favorites.items.map((item) => {
          const stock = stockInfo(item.stock ?? 1);
          return (
            <article key={item.id} className="product-card">
              <div className="pc-media">
                <Link to={`/product/${item.slug}`} aria-label={item.name}>
                  <SafeImage src={item.image} alt={item.name} />
                </Link>
                {item.onSale && item.discount > 0 && (
                  <div className="pc-badges"><span className="badge badge-sale">−{item.discount}%</span></div>
                )}
                <div className="pc-tools" style={{ opacity: 1, transform: 'none' }}>
                  <button className="pc-tool" onClick={() => favorites.remove(item.id)} aria-label="რჩეულებიდან წაშლა">
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="pc-body">
                <span className="pc-universe">{item.universe}</span>
                <Link to={`/product/${item.slug}`}><h3 className="pc-name line-2">{item.name}</h3></Link>
                {item.rating !== undefined && <Stars value={item.rating} size={12} />}

                <div className="pc-foot">
                  <div>
                    <span className="price">{formatPrice(item.price)}</span>
                    {item.oldPrice && <span className="price-old">{formatPrice(item.oldPrice)}</span>}
                  </div>
                  <span className={`pc-stock ${stock.level}`}><span className="dot" /> {stock.label}</span>
                </div>

                <button
                  className="btn btn-primary btn-sm btn-block mt-8"
                  onClick={() => cart.add({ ...item, images: [item.image], stock: item.stock ?? 10 })}
                  disabled={(item.stock ?? 1) <= 0}
                >
                  <ShoppingCart size={15} /> კალათაში დამატება
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={favorites.clear}
        title="რჩეულების გასუფთავება"
        message="ნამდვილად გსურთ ყველა ნივთის წაშლა რჩეულებიდან?"
        confirmLabel="დიახ, გაასუფთავე"
      />
    </div>
  );
}
