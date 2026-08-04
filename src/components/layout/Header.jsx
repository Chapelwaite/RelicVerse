import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search, Heart, ShoppingBag, User, Menu, LogOut, LayoutDashboard,
  Package, Home, Sparkles, Layers, Tag, Info, LogIn,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Drawer } from '../ui/Drawer';
import { SearchOverlay } from './SearchOverlay';
import { useScrolled } from '../../hooks';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';

export const NAV_ITEMS = [
  { to: '/', label: 'მთავარი', icon: Home, end: true },
  { to: '/catalog', label: 'კატალოგი', icon: Package },
  { to: '/universes', label: 'სამყაროები', icon: Sparkles },
  { to: '/collections', label: 'კოლექციები', icon: Layers },
  { to: '/sale', label: 'აქციები', icon: Tag },
  { to: '/about', label: 'ჩვენ შესახებ', icon: Info },
];

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const scrolled = useScrolled(24);
  const cart = useCart();
  const favorites = useFavorites();
  const { user, isAuth, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); setUserMenu(false); setMenuOpen(false); navigate('/'); };

  return (
    <>
      <header className={`header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="container">
          <Logo />

          <nav className="nav" aria-label="მთავარი ნავიგაცია">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="ძიება">
              <Search size={18} />
            </button>

            <Link to="/favorites" className="icon-btn" data-header-hide-sm aria-label={`რჩეულები (${favorites.count})`}>
              <Heart size={18} />
              {favorites.count > 0 && <span className="count-badge">{favorites.count}</span>}
            </Link>

            <Link to="/cart" className="icon-btn" data-header-hide-sm aria-label={`კალათა (${cart.count})`}>
              <ShoppingBag size={18} />
              {cart.count > 0 && <span className="count-badge">{cart.count}</span>}
            </Link>

            {/* მომხმარებელი */}
            <div className="relative" data-header-hide-sm>
              <button
                className="icon-btn"
                onClick={() => (isAuth ? setUserMenu((v) => !v) : navigate('/login'))}
                aria-label={isAuth ? 'ჩემი პროფილი' : 'შესვლა'}
                aria-expanded={userMenu}
              >
                <User size={18} />
              </button>

              {isAuth && userMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 5 }} onClick={() => setUserMenu(false)} />
                  <div
                    className="panel"
                    style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 214, zIndex: 6, padding: 8 }}
                  >
                    <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                      <div className="fw-700 text-sm truncate">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-dim truncate">{user.email}</div>
                    </div>
                    <Link to="/profile" className="mobile-menu-link" onClick={() => setUserMenu(false)}>
                      <User size={16} /> ჩემი პროფილი
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="mobile-menu-link" onClick={() => setUserMenu(false)}>
                        <LayoutDashboard size={16} /> ადმინ პანელი
                      </Link>
                    )}
                    <button className="mobile-menu-link w-full" onClick={handleLogout}>
                      <LogOut size={16} /> გამოსვლა
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              className="icon-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="მენიუ"
              style={{ display: 'none' }}
              data-mobile-menu
            >
              <Menu size={19} />
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="მენიუ">
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `mobile-menu-link${isActive ? ' is-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}

          <div className="divider" style={{ margin: '14px 0' }} />

          {isAuth ? (
            <>
              <NavLink to="/profile" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
                <User size={17} /> ჩემი პროფილი
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={17} /> ადმინ პანელი
                </NavLink>
              )}
              <button className="mobile-menu-link" onClick={handleLogout}>
                <LogOut size={17} /> გამოსვლა
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
                <LogIn size={17} /> შესვლა
              </NavLink>
              <NavLink to="/register" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
                <User size={17} /> რეგისტრაცია
              </NavLink>
            </>
          )}
        </nav>
      </Drawer>

      <style>{`@media (max-width: 1080px) { [data-mobile-menu] { display: grid !important; } }`}</style>
    </>
  );
}
