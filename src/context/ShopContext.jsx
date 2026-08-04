import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { subscribeDataChanged } from '../services/storageService';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { useLocalStorage } from '../hooks';
import { useToast } from './ToastContext';

/**
 * ShopContext — საიტის საერთო მონაცემები (პარამეტრები, კატეგორიები,
 * სამყაროები, ჟანრები, კოლექციები) + შედარება და ბოლოს ნანახი პროდუქტები.
 */
const ShopContext = createContext(null);
const MAX_COMPARE = 3;
const MAX_RECENT = 8;

const FALLBACK = {
  settings: {
    siteName: 'RelicVerse',
    slogan: 'შეინახე შენი საყვარელი სამყაროს ნაწილი',
    tagline: 'ნივთები იმ სამყაროებიდან, რომლებიც არასდროს დაგავიწყდება',
    phone: '', email: '', address: '',
    social: {}, shippingFee: 7, freeShippingThreshold: 120,
    saleBanner: { title: '', subtitle: '', endsAt: null, active: false },
  },
  categories: [], universes: [], genres: [], collections: [],
  priceRange: { min: 0, max: 200 },
};

export function ShopProvider({ children }) {
  const [meta, setMeta] = useState(FALLBACK);
  const [ready, setReady] = useState(false);
  const [compare, setCompare] = useLocalStorage(STORAGE_KEYS.COMPARE, []);
  const [recent, setRecent] = useLocalStorage(STORAGE_KEYS.RECENTLY_VIEWED, []);
  const toast = useToast();

  useEffect(() => {
    let alive = true;
    const load = () => api.bootstrap()
      .then((data) => { if (alive) setMeta({ ...FALLBACK, ...data }); })
      .catch(() => { /* fallback-ით ვმუშაობთ */ })
      .finally(() => { if (alive) setReady(true); });

    load();

    // admin-ის ცვლილებები (კატეგორია/სამყარო/პარამეტრები) მაშინვე აისახება
    const unsubscribe = subscribeDataChanged(() => load());

    // storage-ის მიუწვდომლობის ერთჯერადი გაფრთხილება
    const onWarn = (e) => toast.info('ყურადღება', e.detail?.message || 'ბრაუზერის მეხსიერება მიუწვდომელია');
    window.addEventListener('relicverse:storage-warning', onWarn);

    return () => {
      alive = false;
      unsubscribe();
      window.removeEventListener('relicverse:storage-warning', onWarn);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── შედარება ─── */
  const toggleCompare = useCallback((product) => {
    let result = '';
    setCompare((list) => {
      if (list.some((i) => i.id === product.id)) { result = 'removed'; return list.filter((i) => i.id !== product.id); }
      if (list.length >= MAX_COMPARE) { result = 'full'; return list; }
      result = 'added';
      return [...list, {
        id: product.id, name: product.name, slug: product.slug, price: product.price,
        image: product.images?.[0] || '/products/placeholder.svg',
        universe: product.universe, genre: product.genre, category: product.category,
        rating: product.rating, stock: product.stock, material: product.material,
        size: product.size, color: product.color, oldPrice: product.oldPrice,
      }];
    });
    queueMicrotask(() => {
      if (result === 'full') toast.info(`შედარებაში მაქსიმუმ ${MAX_COMPARE} ნივთია შესაძლებელი`);
      else if (result === 'added') toast.success('პროდუქტი დაემატა შესადარებლად');
      else if (result === 'removed') toast.info('პროდუქტი წაიშალა შედარებიდან');
    });
  }, [setCompare, toast]);

  const clearCompare = useCallback(() => setCompare([]), [setCompare]);

  /* ─── ბოლოს ნანახი ─── */
  const pushRecent = useCallback((product) => {
    setRecent((list) => [
      { id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.images?.[0], universe: product.universe },
      ...list.filter((i) => i.id !== product.id),
    ].slice(0, MAX_RECENT));
  }, [setRecent]);

  const value = useMemo(() => ({
    ...meta,
    ready,
    compare, toggleCompare, clearCompare,
    inCompare: (id) => compare.some((i) => i.id === id),
    recent, pushRecent,
    universeBySlug: (slug) => meta.universes.find((u) => u.slug === slug),
    universeByName: (name) => meta.universes.find((u) => u.name === name),
    collectionBySlug: (slug) => meta.collections.find((c) => c.slug === slug),
  }), [meta, ready, compare, toggleCompare, clearCompare, recent, pushRecent]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop უნდა გამოიყენოთ ShopProvider-ის შიგნით');
  return ctx;
}
