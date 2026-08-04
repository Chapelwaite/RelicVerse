import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';

/** მობილურის ქვედა ნავიგაცია */
export function BottomNav() {
  const cart = useCart();
  const favorites = useFavorites();
  const { isAuth } = useAuth();

  const items = [
    { to: '/', label: 'მთავარი', icon: Home, end: true },
    { to: '/catalog', label: 'კატალოგი', icon: LayoutGrid },
    { to: '/favorites', label: 'რჩეულები', icon: Heart, count: favorites.count },
    { to: '/cart', label: 'კალათა', icon: ShoppingBag, count: cart.count },
    { to: isAuth ? '/profile' : '/login', label: 'პროფილი', icon: User },
  ];

  return (
    <nav className="bottom-nav" aria-label="მობილურის ნავიგაცია">
      {items.map(({ to, label, icon: Icon, count, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'is-active' : '')}>
          <span className="relative">
            <Icon size={19} />
            {count > 0 && <span className="nav-count">{count}</span>}
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
