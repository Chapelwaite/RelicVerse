import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ShopProvider } from './context/ShopContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { PageLoader } from './components/ui/Primitives';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

/* გვერდები იტვირთება საჭიროებისამებრ (code splitting) */
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Product = lazy(() => import('./pages/Product'));
const Cart = lazy(() => import('./pages/Cart'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));
const Sale = lazy(() => import('./pages/Sale'));
const NotFound = lazy(() => import('./pages/NotFound'));
const UniverseDetail = lazy(() => import('./pages/Universes'));
const CollectionDetail = lazy(() => import('./pages/Collections'));

/* დამხმარე გვერდები (named export-ები) */
const UniverseList = lazy(() => import('./pages/Universes').then((m) => ({ default: m.UniverseList })));
const CollectionList = lazy(() => import('./pages/Collections').then((m) => ({ default: m.CollectionList })));
const About = lazy(() => import('./pages/Static').then((m) => ({ default: m.About })));
const Help = lazy(() => import('./pages/Static').then((m) => ({ default: m.Help })));
const Shipping = lazy(() => import('./pages/Static').then((m) => ({ default: m.Shipping })));
const Returns = lazy(() => import('./pages/Static').then((m) => ({ default: m.Returns })));
const Privacy = lazy(() => import('./pages/Static').then((m) => ({ default: m.Privacy })));

/* ადმინ პანელი */
const AdminLayout = lazy(() => import('./admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const Dashboard = lazy(() => import('./admin/pages/Dashboard'));
const AdminProducts = lazy(() => import('./admin/pages/AdminProducts'));
const AdminOrders = lazy(() => import('./admin/pages/AdminOrders'));
const AdminPromos = lazy(() => import('./admin/pages/AdminPromos'));
const AdminNewsletter = lazy(() => import('./admin/pages/AdminNewsletter'));
const AdminSettings = lazy(() => import('./admin/pages/AdminSettings'));
const AdminCategories = lazy(() => import('./admin/pages/AdminTaxonomy').then((m) => ({ default: m.AdminCategories })));
const AdminUniverses = lazy(() => import('./admin/pages/AdminTaxonomy').then((m) => ({ default: m.AdminUniverses })));

/** ყველა provider ერთ ადგილას */
function Providers({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ShopProvider>
          <FavoritesProvider>
            <CartProvider>{children}</CartProvider>
          </FavoritesProvider>
        </ShopProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <ErrorBoundary>
          <Suspense fallback={<div className="container" style={{ paddingTop: 120 }}><PageLoader /></div>}>
            <Routes>
              {/* ─── საიტი ─── */}
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="catalog" element={<Catalog />} />
                <Route path="product/:slug" element={<Product />} />
                <Route path="universes" element={<UniverseList />} />
                <Route path="universes/:slug" element={<UniverseDetail />} />
                <Route path="collections" element={<CollectionList />} />
                <Route path="collections/:slug" element={<CollectionDetail />} />
                <Route path="sale" element={<Sale />} />
                <Route path="cart" element={<Cart />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="order-success/:id" element={<OrderSuccess />} />
                <Route path="login" element={<Auth mode="login" />} />
                <Route path="register" element={<Auth mode="register" />} />
                <Route path="profile" element={<Profile />} />
                <Route path="about" element={<About />} />
                <Route path="help" element={<Help />} />
                <Route path="shipping" element={<Shipping />} />
                <Route path="returns" element={<Returns />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="404" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* ─── ადმინ პანელი ─── */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="universes" element={<AdminUniverses />} />
                <Route path="promos" element={<AdminPromos />} />
                <Route path="newsletter" element={<AdminNewsletter />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Providers>
    </BrowserRouter>
  );
}
