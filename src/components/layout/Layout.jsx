import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { CompareBar } from './CompareBar';
import { ScrollProgress, BackToTop, CookieNotice } from '../ui/Widgets';

/** მარშრუტის შეცვლისას გვერდის დასაწყისში დაბრუნება */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

/** საიტის ჩარჩო — header, გვერდის შიგთავსი გლუვი გადასვლით, footer */
export function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">გადადი მთავარ შიგთავსზე</a>
      <ScrollToTop />
      <ScrollProgress />
      <Header />

      <motion.main
        id="main"
        className="page"
        key={pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Outlet />
      </motion.main>

      <Footer />
      <BottomNav />
      <CompareBar />
      <BackToTop />
      <CookieNotice />
    </div>
  );
}
