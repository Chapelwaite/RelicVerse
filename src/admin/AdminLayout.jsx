import { useState } from 'react';
import { NavLink, Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Tags, Sparkles, Ticket,
  Mail, Settings, Menu, ExternalLink, LogOut, ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/ui/Logo';
import { Drawer } from '../components/ui/Drawer';
import { PageLoader, EmptyState, Avatar } from '../components/ui/Primitives';

export const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'პროდუქტები', icon: Package },
  { to: '/admin/orders', label: 'შეკვეთები', icon: ShoppingCart },
  { to: '/admin/categories', label: 'კატეგორიები', icon: Tags },
  { to: '/admin/universes', label: 'სამყაროები', icon: Sparkles },
  { to: '/admin/promos', label: 'პრომოკოდები', icon: Ticket },
  { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { to: '/admin/settings', label: 'პარამეტრები', icon: Settings },
];

function NavLinks({ onNavigate }) {
  return (
    <nav className="admin-nav">
      {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}
        >
          <Icon size={17} /> {label}
        </NavLink>
      ))}
    </nav>
  );
}

/** ადმინ პანელის ჩარჩო — წვდომა მხოლოდ admin როლისთვის */
export function AdminLayout() {
  const { user, loading, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  if (loading) return <PageLoader label="წვდომა მოწმდება…" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  if (!isAdmin) {
    return (
      <div className="container" style={{ paddingTop: 80 }}>
        <EmptyState
          icon={ShieldAlert}
          title="წვდომა აკრძალულია"
          description="ამ განყოფილებაში შესვლა მხოლოდ ადმინისტრატორს შეუძლია."
        >
          <Link to="/" className="btn btn-primary">მთავარ გვერდზე დაბრუნება</Link>
        </EmptyState>
      </div>
    );
  }

  const title = ADMIN_NAV.find((n) => (n.end ? n.to === location.pathname : location.pathname.startsWith(n.to)))?.label || 'Admin';

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Logo slogan="Admin Panel" size={36} to="/admin" />
        <NavLinks />

        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
          <Link to="/" className="admin-nav-link"><ExternalLink size={17} /> საიტზე გადასვლა</Link>
          <button className="admin-nav-link w-full" onClick={logout}><LogOut size={17} /> გამოსვლა</button>
          <div className="flex-center gap-10" style={{ marginTop: 14, padding: '10px 12px', borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,.03)' }}>
            <Avatar name={`${user.firstName} ${user.lastName}`} size={32} />
            <div style={{ minWidth: 0 }}>
              <div className="text-xs fw-700 truncate">{user.firstName} {user.lastName}</div>
              <div className="text-xs text-dim truncate">ადმინისტრატორი</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="icon-btn admin-mobile-btn" onClick={() => setMenuOpen(true)} aria-label="მენიუ">
            <Menu size={18} />
          </button>
          <h1>{title}</h1>
          <Link to="/" className="btn btn-ghost btn-sm ml-auto"><ExternalLink size={14} /> საიტი</Link>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="ადმინ მენიუ">
        <NavLinks onNavigate={() => setMenuOpen(false)} />
      </Drawer>
    </div>
  );
}
